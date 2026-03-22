import { describe, it, expect } from 'vitest';
import {
  humanize,
  getCategorySummary,
} from '../../client/src/components/admin/BuildingConfigurationPanel';
import type { UnifiedBuildingTypeConfig } from '../game-engine/types';

describe('humanize', () => {
  it('converts underscore_case to Title Case', () => {
    expect(humanize('commercial_food')).toBe('Commercial Food');
    expect(humanize('guild_hall')).toBe('Guild Hall');
  });

  it('converts camelCase to Title Case', () => {
    expect(humanize('blacksmith')).toBe('Blacksmith');
    expect(humanize('GroceryStore')).toBe('Grocery Store');
    expect(humanize('FishMarket')).toBe('Fish Market');
  });

  it('handles single words', () => {
    expect(humanize('shop')).toBe('Shop');
    expect(humanize('tavern')).toBe('Tavern');
  });

  it('handles mixed patterns', () => {
    expect(humanize('mobile_home')).toBe('Mobile Home');
    expect(humanize('residence_small')).toBe('Residence Small');
  });
});

describe('getCategorySummary', () => {
  const types = ['Restaurant', 'Bar', 'Bakery', 'Brewery'] as const;

  it('counts all as unconfigured when no configs exist', () => {
    const result = getCategorySummary(types, {});
    expect(result).toEqual({ asset: 0, procedural: 0, unconfigured: 4, withInterior: 0 });
  });

  it('counts asset mode configs', () => {
    const configs: Record<string, UnifiedBuildingTypeConfig> = {
      Restaurant: { mode: 'asset', assetId: 'model-1' },
      Bar: { mode: 'asset', assetId: 'model-2' },
    };
    const result = getCategorySummary(types, configs);
    expect(result).toEqual({ asset: 2, procedural: 0, unconfigured: 2, withInterior: 0 });
  });

  it('counts procedural mode configs', () => {
    const configs: Record<string, UnifiedBuildingTypeConfig> = {
      Restaurant: { mode: 'procedural', stylePresetId: 'preset-1' },
    };
    const result = getCategorySummary(types, configs);
    expect(result).toEqual({ asset: 0, procedural: 1, unconfigured: 3, withInterior: 0 });
  });

  it('counts configs with interior configuration', () => {
    const configs: Record<string, UnifiedBuildingTypeConfig> = {
      Restaurant: {
        mode: 'procedural',
        interiorConfig: { mode: 'procedural', layoutTemplateId: 'restaurant' },
      },
      Bar: {
        mode: 'asset',
        assetId: 'model-1',
        interiorConfig: { mode: 'model', modelPath: '/models/bar-interior.glb' },
      },
      Bakery: { mode: 'procedural' },
    };
    const result = getCategorySummary(types, configs);
    expect(result).toEqual({ asset: 1, procedural: 2, unconfigured: 1, withInterior: 2 });
  });

  it('handles mixed asset and procedural with interior', () => {
    const configs: Record<string, UnifiedBuildingTypeConfig> = {
      Restaurant: {
        mode: 'asset',
        assetId: 'model-1',
        interiorConfig: {
          mode: 'procedural',
          layoutTemplateId: 'restaurant',
          lightingPreset: 'warm',
          furnitureSet: 'restaurant',
        },
      },
      Bar: { mode: 'procedural' },
      Bakery: { mode: 'procedural', interiorConfig: { mode: 'procedural' } },
      Brewery: { mode: 'asset', assetId: 'x' },
    };
    const result = getCategorySummary(types, configs);
    expect(result).toEqual({ asset: 2, procedural: 2, unconfigured: 0, withInterior: 2 });
  });

  it('returns zeros for empty types array', () => {
    const result = getCategorySummary([], { Restaurant: { mode: 'asset' } });
    expect(result).toEqual({ asset: 0, procedural: 0, unconfigured: 0, withInterior: 0 });
  });
});

describe('InteriorTemplateConfig structure', () => {
  it('supports model mode fields', () => {
    const config: UnifiedBuildingTypeConfig = {
      mode: 'asset',
      assetId: 'building-1',
      interiorConfig: {
        mode: 'model',
        modelPath: '/models/interior.glb',
      },
    };
    expect(config.interiorConfig?.mode).toBe('model');
    expect(config.interiorConfig?.modelPath).toBe('/models/interior.glb');
  });

  it('supports procedural mode fields', () => {
    const config: UnifiedBuildingTypeConfig = {
      mode: 'procedural',
      interiorConfig: {
        mode: 'procedural',
        layoutTemplateId: 'tavern',
        wallTextureId: 'tex-wall-1',
        floorTextureId: 'tex-floor-1',
        ceilingTextureId: 'tex-ceil-1',
        furnitureSet: 'tavern',
        lightingPreset: 'candlelit',
      },
    };
    expect(config.interiorConfig?.mode).toBe('procedural');
    expect(config.interiorConfig?.layoutTemplateId).toBe('tavern');
    expect(config.interiorConfig?.wallTextureId).toBe('tex-wall-1');
    expect(config.interiorConfig?.floorTextureId).toBe('tex-floor-1');
    expect(config.interiorConfig?.ceilingTextureId).toBe('tex-ceil-1');
    expect(config.interiorConfig?.furnitureSet).toBe('tavern');
    expect(config.interiorConfig?.lightingPreset).toBe('candlelit');
  });

  it('supports all lighting presets', () => {
    const presets = ['bright', 'dim', 'warm', 'cool', 'candlelit'] as const;
    for (const preset of presets) {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        interiorConfig: { mode: 'procedural', lightingPreset: preset },
      };
      expect(config.interiorConfig?.lightingPreset).toBe(preset);
    }
  });

  it('allows interiorConfig to be undefined', () => {
    const config: UnifiedBuildingTypeConfig = { mode: 'asset', assetId: 'x' };
    expect(config.interiorConfig).toBeUndefined();
  });
});
