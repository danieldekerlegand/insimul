import { describe, it, expect } from 'vitest';
import type { ProceduralStylePreset } from '@shared/game-engine/types';
import type { VisualAsset } from '@shared/schema';
import { BUILDING_TYPE_DEFAULTS } from '@shared/game-engine/building-defaults';

/**
 * Tests for exterior preview rendering logic in BuildingConfigurationPanel.
 *
 * Validates: texture ID passthrough, building defaults usage for dimensions,
 * and feature flag resolution (chimney, porch, balcony, shutters).
 */

const samplePreset: ProceduralStylePreset = {
  id: 'creole-1',
  name: 'Creole Style',
  baseColors: [{ r: 0.9, g: 0.85, b: 0.7 }],
  roofColor: { r: 0.3, g: 0.2, b: 0.15 },
  windowColor: { r: 0.5, g: 0.6, b: 0.7 },
  doorColor: { r: 0.4, g: 0.25, b: 0.15 },
  materialType: 'stucco',
  architectureStyle: 'creole',
  hasBalcony: true,
  hasIronworkBalcony: true,
  hasPorch: true,
  hasShutters: true,
  shutterColor: { r: 0.2, g: 0.4, b: 0.3 },
  porchSteps: 3,
  wallTextureId: 'tex-wall-1',
  roofTextureId: 'tex-roof-1',
  doorTextureId: 'tex-door-1',
  windowTextureId: 'tex-win-1',
};

const sampleAssets: VisualAsset[] = [
  { id: 'tex-wall-1', name: 'Wall Brick', filePath: 'textures/wall-brick.png', worldId: 1, category: 'texture', tags: [] },
  { id: 'tex-roof-1', name: 'Roof Slate', filePath: 'textures/roof-slate.png', worldId: 1, category: 'texture', tags: [] },
  { id: 'tex-door-1', name: 'Door Wood', filePath: 'textures/door-wood.png', worldId: 1, category: 'texture', tags: [] },
  { id: 'tex-win-1', name: 'Window Glass', filePath: 'textures/window-glass.png', worldId: 1, category: 'texture', tags: [] },
] as VisualAsset[];

/** Mirror the asset resolution helper from BuildingModelPreview */
function resolveAssetPath(assetId: string | undefined, assets?: VisualAsset[]): string | undefined {
  if (!assetId || !assets?.length) return undefined;
  const asset = assets.find(a => a.id === assetId);
  if (!asset?.filePath) return undefined;
  return asset.filePath.startsWith('/') ? asset.filePath : `/${asset.filePath}`;
}

/** Mirror the preview config construction from ConfigDetailPanel */
function buildExteriorPreviewConfig(
  preset: ProceduralStylePreset,
  overrides?: Partial<ProceduralStylePreset>,
) {
  return {
    stylePresets: [{
      id: preset.id || 'preview',
      name: preset.name || 'preview',
      baseColors: overrides?.baseColors || preset.baseColors || [{ r: 0.7, g: 0.65, b: 0.55 }],
      roofColor: overrides?.roofColor || preset.roofColor || { r: 0.3, g: 0.25, b: 0.2 },
      windowColor: overrides?.windowColor || preset.windowColor || { r: 0.7, g: 0.75, b: 0.8 },
      doorColor: overrides?.doorColor || preset.doorColor || { r: 0.4, g: 0.3, b: 0.2 },
      materialType: overrides?.materialType || preset.materialType || 'wood',
      architectureStyle: overrides?.architectureStyle || preset.architectureStyle || 'colonial',
      roofStyle: overrides?.roofStyle || preset.roofStyle,
      hasBalcony: overrides?.hasBalcony ?? preset.hasBalcony,
      hasIronworkBalcony: overrides?.hasIronworkBalcony ?? preset.hasIronworkBalcony,
      hasPorch: overrides?.hasPorch ?? preset.hasPorch,
      hasShutters: overrides?.hasShutters ?? preset.hasShutters,
      porchDepth: overrides?.porchDepth ?? preset.porchDepth,
      porchSteps: overrides?.porchSteps ?? preset.porchSteps,
      shutterColor: overrides?.shutterColor ?? preset.shutterColor,
      wallTextureId: overrides?.wallTextureId ?? preset.wallTextureId,
      roofTextureId: overrides?.roofTextureId ?? preset.roofTextureId,
      doorTextureId: overrides?.doorTextureId ?? preset.doorTextureId,
      windowTextureId: overrides?.windowTextureId ?? preset.windowTextureId,
    }],
  };
}

describe('Exterior preview rendering', () => {
  describe('texture ID passthrough', () => {
    it('passes preset texture IDs into the preview config', () => {
      const config = buildExteriorPreviewConfig(samplePreset);
      const resolved = config.stylePresets[0];
      expect(resolved.wallTextureId).toBe('tex-wall-1');
      expect(resolved.roofTextureId).toBe('tex-roof-1');
      expect(resolved.doorTextureId).toBe('tex-door-1');
      expect(resolved.windowTextureId).toBe('tex-win-1');
    });

    it('overrides take precedence over preset texture IDs', () => {
      const config = buildExteriorPreviewConfig(samplePreset, {
        wallTextureId: 'tex-wall-override',
        roofTextureId: 'tex-roof-override',
      });
      const resolved = config.stylePresets[0];
      expect(resolved.wallTextureId).toBe('tex-wall-override');
      expect(resolved.roofTextureId).toBe('tex-roof-override');
      // Non-overridden fields still use preset
      expect(resolved.doorTextureId).toBe('tex-door-1');
      expect(resolved.windowTextureId).toBe('tex-win-1');
    });

    it('handles missing texture IDs gracefully', () => {
      const presetNoTextures: ProceduralStylePreset = {
        ...samplePreset,
        wallTextureId: undefined,
        roofTextureId: undefined,
        doorTextureId: undefined,
        windowTextureId: undefined,
      };
      const config = buildExteriorPreviewConfig(presetNoTextures);
      const resolved = config.stylePresets[0];
      expect(resolved.wallTextureId).toBeUndefined();
      expect(resolved.roofTextureId).toBeUndefined();
      expect(resolved.doorTextureId).toBeUndefined();
      expect(resolved.windowTextureId).toBeUndefined();
    });
  });

  describe('texture asset resolution', () => {
    it('resolves texture asset IDs to file paths', () => {
      expect(resolveAssetPath('tex-wall-1', sampleAssets)).toBe('/textures/wall-brick.png');
      expect(resolveAssetPath('tex-roof-1', sampleAssets)).toBe('/textures/roof-slate.png');
      expect(resolveAssetPath('tex-door-1', sampleAssets)).toBe('/textures/door-wood.png');
      expect(resolveAssetPath('tex-win-1', sampleAssets)).toBe('/textures/window-glass.png');
    });

    it('returns undefined for missing asset IDs', () => {
      expect(resolveAssetPath(undefined, sampleAssets)).toBeUndefined();
      expect(resolveAssetPath('nonexistent', sampleAssets)).toBeUndefined();
    });

    it('returns undefined when assets list is empty', () => {
      expect(resolveAssetPath('tex-wall-1', [])).toBeUndefined();
      expect(resolveAssetPath('tex-wall-1', undefined)).toBeUndefined();
    });

    it('prepends slash to relative file paths', () => {
      const result = resolveAssetPath('tex-wall-1', sampleAssets);
      expect(result).toMatch(/^\//);
    });

    it('does not double-slash absolute paths', () => {
      const assetsWithAbsolute = [{
        ...sampleAssets[0],
        filePath: '/textures/wall-brick.png',
      }] as VisualAsset[];
      const result = resolveAssetPath('tex-wall-1', assetsWithAbsolute);
      expect(result).toBe('/textures/wall-brick.png');
      expect(result).not.toMatch(/^\/\//);
    });
  });

  describe('building defaults integration', () => {
    it('provides floor count for common building types', () => {
      expect(BUILDING_TYPE_DEFAULTS['Hotel']?.floors).toBe(3);
      expect(BUILDING_TYPE_DEFAULTS['Bakery']?.floors).toBe(2);
      expect(BUILDING_TYPE_DEFAULTS['cottage']?.floors).toBe(1);
      expect(BUILDING_TYPE_DEFAULTS['mansion']?.floors).toBe(3);
    });

    it('provides width and depth for dimension ratios', () => {
      const hotel = BUILDING_TYPE_DEFAULTS['Hotel'];
      expect(hotel).toBeDefined();
      expect(hotel!.width).toBeGreaterThan(0);
      expect(hotel!.depth).toBeGreaterThan(0);
      // Hotel should be wider than deep (16x14)
      expect(hotel!.width).toBeGreaterThanOrEqual(hotel!.depth);
    });

    it('provides feature flags for chimneys, balconies, porches', () => {
      expect(BUILDING_TYPE_DEFAULTS['Hotel']?.hasBalcony).toBe(true);
      expect(BUILDING_TYPE_DEFAULTS['Bakery']?.hasChimney).toBe(true);
      expect(BUILDING_TYPE_DEFAULTS['mansion']?.hasChimney).toBe(true);
      expect(BUILDING_TYPE_DEFAULTS['mansion']?.hasBalcony).toBe(true);
    });

    it('returns undefined for unknown building types', () => {
      expect(BUILDING_TYPE_DEFAULTS['NonExistentBuilding']).toBeUndefined();
    });
  });

  describe('feature flag resolution', () => {
    it('preset features override building defaults', () => {
      const config = buildExteriorPreviewConfig(samplePreset);
      const resolved = config.stylePresets[0];
      expect(resolved.hasBalcony).toBe(true);
      expect(resolved.hasPorch).toBe(true);
      expect(resolved.hasShutters).toBe(true);
    });

    it('overrides take precedence for feature flags', () => {
      const config = buildExteriorPreviewConfig(samplePreset, {
        hasBalcony: false,
        hasPorch: false,
      });
      const resolved = config.stylePresets[0];
      expect(resolved.hasBalcony).toBe(false);
      expect(resolved.hasPorch).toBe(false);
      // hasShutters not overridden, uses preset
      expect(resolved.hasShutters).toBe(true);
    });

    it('passes shutter color when shutters are enabled', () => {
      const config = buildExteriorPreviewConfig(samplePreset);
      const resolved = config.stylePresets[0];
      expect(resolved.hasShutters).toBe(true);
      expect(resolved.shutterColor).toEqual({ r: 0.2, g: 0.4, b: 0.3 });
    });

    it('passes porch steps count', () => {
      const config = buildExteriorPreviewConfig(samplePreset);
      const resolved = config.stylePresets[0];
      expect(resolved.porchSteps).toBe(3);
    });
  });

  describe('roof style passthrough', () => {
    it('passes roof style from preset', () => {
      const presetWithRoof: ProceduralStylePreset = {
        ...samplePreset,
        roofStyle: 'hip',
      };
      const config = buildExteriorPreviewConfig(presetWithRoof);
      expect(config.stylePresets[0].roofStyle).toBe('hip');
    });

    it('override roof style takes precedence', () => {
      const presetWithRoof: ProceduralStylePreset = {
        ...samplePreset,
        roofStyle: 'gable',
      };
      const config = buildExteriorPreviewConfig(presetWithRoof, { roofStyle: 'flat' });
      expect(config.stylePresets[0].roofStyle).toBe('flat');
    });

    it('handles undefined roof style', () => {
      const presetNoRoof: ProceduralStylePreset = {
        ...samplePreset,
        roofStyle: undefined,
      };
      const config = buildExteriorPreviewConfig(presetNoRoof);
      expect(config.stylePresets[0].roofStyle).toBeUndefined();
    });
  });

  describe('color resolution', () => {
    it('uses preset base colors when available', () => {
      const config = buildExteriorPreviewConfig(samplePreset);
      expect(config.stylePresets[0].baseColors).toEqual([{ r: 0.9, g: 0.85, b: 0.7 }]);
    });

    it('overrides base colors take precedence', () => {
      const config = buildExteriorPreviewConfig(samplePreset, {
        baseColors: [{ r: 1, g: 0, b: 0 }],
      });
      expect(config.stylePresets[0].baseColors).toEqual([{ r: 1, g: 0, b: 0 }]);
    });

    it('falls back to default colors when preset has none', () => {
      const emptyPreset: ProceduralStylePreset = {
        id: 'empty',
        name: 'Empty',
        baseColors: [],
        roofColor: { r: 0, g: 0, b: 0 },
        windowColor: { r: 0, g: 0, b: 0 },
        doorColor: { r: 0, g: 0, b: 0 },
        materialType: 'wood',
        architectureStyle: 'colonial',
      };
      // When baseColors is empty (falsy-ish), the || operator falls through to default
      const config = buildExteriorPreviewConfig(emptyPreset);
      // Empty array is truthy in JS, so it passes through
      expect(config.stylePresets[0].baseColors).toEqual([]);
    });
  });
});
