import { describe, it, expect } from 'vitest';
import type { GroundTypeConfig } from '@shared/game-engine/types';
import type { VisualAsset } from '@shared/schema';

/**
 * Tests for the ground texture preview logic.
 *
 * Validates texture URL resolution, tiling calculations, and
 * shape selection based on ground type.
 */

// --- Helpers that mirror the logic in ConfigDetailPanel & GroundTexturePreview ---

/** Resolve a textureId to a URL via the assets array (mirrors ConfigDetailPanel) */
function resolveTextureUrl(
  cfg: GroundTypeConfig | undefined,
  assets: Pick<VisualAsset, 'id' | 'filePath'>[],
): string | undefined {
  if (!cfg?.textureId || cfg.mode !== 'asset') return undefined;
  const asset = assets.find(a => a.id === cfg.textureId);
  return asset ? `/${asset.filePath}` : undefined;
}

/** Compute the CSS background-size for a given tiling value (mirrors GroundTexturePreview) */
function tileSizePx(tiling: number): number {
  return Math.max(16, Math.round(200 / tiling));
}

/** Determine if the preview should use a narrow strip shape */
function isStripShape(groundType: string): boolean {
  return groundType === 'road' || groundType === 'sidewalk';
}

const sampleAssets: Pick<VisualAsset, 'id' | 'filePath'>[] = [
  { id: 'tex-grass-001', filePath: 'assets/textures/grass_seamless.png' },
  { id: 'tex-cobble-002', filePath: 'assets/textures/cobblestone_path.png' },
  { id: 'tex-asphalt-003', filePath: 'assets/textures/asphalt_road.png' },
];

describe('GroundTexturePreview logic', () => {
  describe('resolveTextureUrl', () => {
    it('returns URL when asset mode and textureId matches an asset', () => {
      const cfg: GroundTypeConfig = { mode: 'asset', textureId: 'tex-grass-001', tiling: 4 };
      expect(resolveTextureUrl(cfg, sampleAssets)).toBe('/assets/textures/grass_seamless.png');
    });

    it('returns undefined when in procedural mode even with textureId', () => {
      const cfg: GroundTypeConfig = { mode: 'procedural', textureId: 'tex-grass-001', color: { r: 0.3, g: 0.5, b: 0.3 }, tiling: 4 };
      expect(resolveTextureUrl(cfg, sampleAssets)).toBeUndefined();
    });

    it('returns undefined when textureId does not match any asset', () => {
      const cfg: GroundTypeConfig = { mode: 'asset', textureId: 'nonexistent-id', tiling: 4 };
      expect(resolveTextureUrl(cfg, sampleAssets)).toBeUndefined();
    });

    it('returns undefined when cfg is undefined', () => {
      expect(resolveTextureUrl(undefined, sampleAssets)).toBeUndefined();
    });

    it('returns undefined when textureId is not set', () => {
      const cfg: GroundTypeConfig = { mode: 'asset', tiling: 4 };
      expect(resolveTextureUrl(cfg, sampleAssets)).toBeUndefined();
    });
  });

  describe('tileSizePx', () => {
    it('returns 200 / tiling for reasonable values', () => {
      expect(tileSizePx(4)).toBe(50);
      expect(tileSizePx(2)).toBe(100);
      expect(tileSizePx(8)).toBe(25);
    });

    it('clamps to minimum of 16px for very high tiling', () => {
      expect(tileSizePx(32)).toBe(16);
      expect(tileSizePx(100)).toBe(16);
    });

    it('returns 200 for tiling of 1', () => {
      expect(tileSizePx(1)).toBe(200);
    });
  });

  describe('isStripShape', () => {
    it('road and sidewalk use strip shape', () => {
      expect(isStripShape('road')).toBe(true);
      expect(isStripShape('sidewalk')).toBe(true);
    });

    it('ground and custom types use full square', () => {
      expect(isStripShape('ground')).toBe(false);
      expect(isStripShape('grass')).toBe(false);
      expect(isStripShape('dirt_path')).toBe(false);
    });
  });

  describe('list swatch asset resolution', () => {
    it('resolves texture asset for list thumbnail', () => {
      const cfg: GroundTypeConfig = { mode: 'asset', textureId: 'tex-cobble-002', tiling: 4 };
      const asset = sampleAssets.find(a => a.id === cfg.textureId);
      expect(asset).toBeDefined();
      expect(asset!.filePath).toBe('assets/textures/cobblestone_path.png');
    });

    it('falls back gracefully when asset not found', () => {
      const cfg: GroundTypeConfig = { mode: 'asset', textureId: 'missing-id', tiling: 4 };
      const asset = sampleAssets.find(a => a.id === cfg.textureId);
      expect(asset).toBeUndefined();
    });
  });
});
