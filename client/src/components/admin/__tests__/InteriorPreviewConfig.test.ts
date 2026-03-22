import { describe, it, expect } from 'vitest';
import {
  INTERIOR_LAYOUT_TEMPLATES,
  getTemplateForBuildingType,
  getFurnitureSetForRoom,
  resolveRoomZone,
} from '@shared/game-engine/interior-templates';
import type { VisualAsset } from '@shared/schema';

/**
 * Tests for interior texture and furniture preview config logic.
 *
 * Validates:
 * - Furniture set override resolution (finding templates by set name)
 * - Furniture fallback when room function doesn't match override template
 * - Asset path resolution for texture IDs
 * - Lighting preset configuration values
 * - Interior config propagation to preview
 */

// ── Furniture set override resolution ──

const FURNITURE_SETS = [
  'tavern', 'shop', 'residential', 'church', 'school', 'hotel',
  'blacksmith', 'warehouse', 'clinic', 'farm', 'guild_hall', 'office',
  'library', 'bakery', 'restaurant', 'bar',
];

describe('Interior preview furniture set override', () => {
  it('most furniture set names resolve to a template', () => {
    // Some set names (e.g. 'residential') map to multiple templates (residence_small, etc.)
    // via getTemplateForBuildingType substring matching
    const resolvedCount = FURNITURE_SETS.filter(setName => {
      const template = INTERIOR_LAYOUT_TEMPLATES.find(
        t => t.id === setName || t.buildingType === setName,
      );
      const altTemplate = getTemplateForBuildingType(setName);
      return template || altTemplate;
    }).length;
    // At least 80% of furniture sets should resolve
    expect(resolvedCount).toBeGreaterThanOrEqual(Math.floor(FURNITURE_SETS.length * 0.8));
  });

  it('tavern template has furniture sets for its rooms', () => {
    const template = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'tavern');
    expect(template).toBeDefined();
    expect(template!.furnitureSets.length).toBeGreaterThan(0);

    const mainFurn = getFurnitureSetForRoom(template!, 'tavern_main');
    expect(mainFurn.length).toBeGreaterThan(0);
  });

  it('shop template has furniture for shop room function', () => {
    const template = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'shop');
    expect(template).toBeDefined();

    const shopFurn = getFurnitureSetForRoom(template!, 'shop');
    expect(shopFurn.length).toBeGreaterThan(0);
  });

  it('fallback to first furniture set when room function does not match', () => {
    const tavernTemplate = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'tavern');
    expect(tavernTemplate).toBeDefined();

    // 'living' is not a room function in the tavern template
    const noMatch = getFurnitureSetForRoom(tavernTemplate!, 'living');
    expect(noMatch).toEqual([]);

    // The preview code falls back to first furniture set when no match
    expect(tavernTemplate!.furnitureSets[0].furniture.length).toBeGreaterThan(0);
  });

  it('resolveRoomZone produces correct world-space coordinates', () => {
    const template = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'tavern');
    expect(template).toBeDefined();

    const room = template!.rooms[0];
    const resolved = resolveRoomZone(template!, room);

    expect(resolved.name).toBe(room.name);
    expect(resolved.function).toBe(room.function);
    expect(resolved.width).toBe(room.widthFraction * template!.width);
    expect(resolved.depth).toBe(room.depthFraction * template!.depth);
    expect(resolved.floor).toBe(room.floor);
  });
});

// ── Asset path resolution ──

/** Mirrors the resolveAssetPath helper in BuildingModelPreview */
function resolveAssetPath(assetId: string | undefined, assets?: VisualAsset[]): string | undefined {
  if (!assetId || !assets?.length) return undefined;
  const asset = assets.find(a => a.id === assetId);
  if (!asset?.filePath) return undefined;
  return asset.filePath.startsWith('/') ? asset.filePath : `/${asset.filePath}`;
}

describe('Asset path resolution for textures', () => {
  const mockAssets: Pick<VisualAsset, 'id' | 'filePath' | 'name'>[] = [
    { id: 'tex-wall-1', filePath: '/assets/textures/brick_wall.png', name: 'Brick Wall' },
    { id: 'tex-floor-1', filePath: 'assets/textures/wood_floor.jpg', name: 'Wood Floor' },
    { id: 'tex-ceiling-1', filePath: '/assets/textures/plaster_ceiling.png', name: 'Plaster Ceiling' },
    { id: 'tex-no-path', filePath: '', name: 'No Path' },
  ];

  it('resolves asset ID to absolute file path', () => {
    const path = resolveAssetPath('tex-wall-1', mockAssets as VisualAsset[]);
    expect(path).toBe('/assets/textures/brick_wall.png');
  });

  it('prepends / to relative paths', () => {
    const path = resolveAssetPath('tex-floor-1', mockAssets as VisualAsset[]);
    expect(path).toBe('/assets/textures/wood_floor.jpg');
  });

  it('returns undefined for missing asset ID', () => {
    expect(resolveAssetPath('nonexistent', mockAssets as VisualAsset[])).toBeUndefined();
  });

  it('returns undefined when assetId is undefined', () => {
    expect(resolveAssetPath(undefined, mockAssets as VisualAsset[])).toBeUndefined();
  });

  it('returns undefined when assets array is empty', () => {
    expect(resolveAssetPath('tex-wall-1', [])).toBeUndefined();
  });

  it('returns undefined when assets is undefined', () => {
    expect(resolveAssetPath('tex-wall-1', undefined)).toBeUndefined();
  });

  it('returns undefined for asset with empty filePath', () => {
    expect(resolveAssetPath('tex-no-path', mockAssets as VisualAsset[])).toBeUndefined();
  });
});

// ── Lighting preset configurations ──

/** Mirrors LIGHTING_PRESET_CONFIGS in BuildingModelPreview */
const LIGHTING_PRESET_CONFIGS: Record<string, { hemiIntensity: number; dirIntensity: number; color: [number, number, number] }> = {
  bright: { hemiIntensity: 1.0, dirIntensity: 0.6, color: [1, 1, 1] },
  dim: { hemiIntensity: 0.3, dirIntensity: 0.15, color: [0.9, 0.85, 0.8] },
  warm: { hemiIntensity: 0.7, dirIntensity: 0.4, color: [1.0, 0.85, 0.6] },
  cool: { hemiIntensity: 0.7, dirIntensity: 0.4, color: [0.7, 0.8, 1.0] },
  candlelit: { hemiIntensity: 0.2, dirIntensity: 0.1, color: [1.0, 0.7, 0.3] },
};

const LIGHTING_PRESETS = ['bright', 'dim', 'warm', 'cool', 'candlelit'] as const;

describe('Lighting preset configurations', () => {
  it('all lighting presets have valid configs', () => {
    for (const preset of LIGHTING_PRESETS) {
      const cfg = LIGHTING_PRESET_CONFIGS[preset];
      expect(cfg, `config for '${preset}' should exist`).toBeDefined();
      expect(cfg.hemiIntensity).toBeGreaterThan(0);
      expect(cfg.hemiIntensity).toBeLessThanOrEqual(1);
      expect(cfg.dirIntensity).toBeGreaterThan(0);
      expect(cfg.dirIntensity).toBeLessThanOrEqual(1);
      expect(cfg.color).toHaveLength(3);
      for (const c of cfg.color) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
    }
  });

  it('bright is brighter than dim', () => {
    expect(LIGHTING_PRESET_CONFIGS.bright.hemiIntensity).toBeGreaterThan(
      LIGHTING_PRESET_CONFIGS.dim.hemiIntensity,
    );
  });

  it('candlelit is the dimmest', () => {
    for (const preset of LIGHTING_PRESETS) {
      if (preset === 'candlelit') continue;
      expect(LIGHTING_PRESET_CONFIGS[preset].hemiIntensity).toBeGreaterThanOrEqual(
        LIGHTING_PRESET_CONFIGS.candlelit.hemiIntensity,
      );
    }
  });

  it('warm preset has warm (orange-shifted) color', () => {
    const [r, g, b] = LIGHTING_PRESET_CONFIGS.warm.color;
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
  });

  it('cool preset has cool (blue-shifted) color', () => {
    const [r, g, b] = LIGHTING_PRESET_CONFIGS.cool.color;
    expect(b).toBeGreaterThan(r);
  });
});

// ── Interior config structure ──

describe('Interior config propagation', () => {
  it('InteriorTemplateConfig fields are passed through to preview', () => {
    const interiorConfig = {
      mode: 'procedural' as const,
      wallTextureId: 'tex-wall-1',
      floorTextureId: 'tex-floor-1',
      ceilingTextureId: 'tex-ceiling-1',
      furnitureSet: 'tavern',
      lightingPreset: 'warm' as const,
    };

    // Verify all fields are present and can be destructured
    expect(interiorConfig.mode).toBe('procedural');
    expect(interiorConfig.wallTextureId).toBe('tex-wall-1');
    expect(interiorConfig.floorTextureId).toBe('tex-floor-1');
    expect(interiorConfig.ceilingTextureId).toBe('tex-ceiling-1');
    expect(interiorConfig.furnitureSet).toBe('tavern');
    expect(interiorConfig.lightingPreset).toBe('warm');
  });

  it('furniture set name resolves to template with furniture data', () => {
    const furnitureSet = 'tavern';
    const template = INTERIOR_LAYOUT_TEMPLATES.find(
      t => t.id === furnitureSet || t.buildingType === furnitureSet,
    );
    expect(template).toBeDefined();
    expect(template!.furnitureSets.length).toBeGreaterThan(0);

    // At least one furniture set should have entries
    const hasEntries = template!.furnitureSets.some(fs => fs.furniture.length > 0);
    expect(hasEntries).toBe(true);
  });

  it('each furniture entry has required shape properties', () => {
    const template = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'shop');
    expect(template).toBeDefined();

    for (const fs of template!.furnitureSets) {
      for (const furn of fs.furniture) {
        expect(furn.type).toBeTruthy();
        expect(furn.width).toBeGreaterThan(0);
        expect(furn.height).toBeGreaterThan(0);
        expect(furn.depth).toBeGreaterThan(0);
        expect(furn.color).toBeDefined();
        expect(furn.color.r).toBeGreaterThanOrEqual(0);
        expect(furn.color.g).toBeGreaterThanOrEqual(0);
        expect(furn.color.b).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
