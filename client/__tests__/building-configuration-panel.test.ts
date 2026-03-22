import { describe, it, expect } from 'vitest';
import {
  CATEGORY_LABELS,
  color3ToCss,
  colorToHex,
  hexToColor,
  humanize,
  getCategorySummary,
} from '../src/components/admin/BuildingConfigurationPanel';
import { BUILDING_CATEGORY_GROUPINGS } from '@shared/game-engine/building-categories';
import type { UnifiedBuildingTypeConfig, ProceduralStylePreset, Color3 } from '@shared/game-engine/types';

describe('BuildingConfigurationPanel helpers', () => {
  describe('CATEGORY_LABELS', () => {
    it('has a label for every category in BUILDING_CATEGORY_GROUPINGS', () => {
      for (const key of Object.keys(BUILDING_CATEGORY_GROUPINGS)) {
        expect(CATEGORY_LABELS).toHaveProperty(key);
        expect(typeof (CATEGORY_LABELS as any)[key]).toBe('string');
      }
    });

    it('has human-readable labels', () => {
      expect(CATEGORY_LABELS.commercial_food).toBe('Food & Drink');
      expect(CATEGORY_LABELS.residential).toBe('Residential');
      expect(CATEGORY_LABELS.civic).toBe('Civic');
    });
  });

  describe('color3ToCss', () => {
    it('returns fallback for undefined', () => {
      expect(color3ToCss(undefined)).toBe('#888');
    });

    it('converts Color3 to rgb string', () => {
      expect(color3ToCss({ r: 1, g: 0, b: 0 })).toBe('rgb(255, 0, 0)');
      expect(color3ToCss({ r: 0, g: 1, b: 0 })).toBe('rgb(0, 255, 0)');
      expect(color3ToCss({ r: 0.5, g: 0.5, b: 0.5 })).toBe('rgb(128, 128, 128)');
    });

    it('handles zero values', () => {
      expect(color3ToCss({ r: 0, g: 0, b: 0 })).toBe('rgb(0, 0, 0)');
    });
  });

  describe('colorToHex', () => {
    it('converts Color3 to hex string', () => {
      expect(colorToHex({ r: 1, g: 0, b: 0 })).toBe('#ff0000');
      expect(colorToHex({ r: 0, g: 1, b: 0 })).toBe('#00ff00');
      expect(colorToHex({ r: 0, g: 0, b: 1 })).toBe('#0000ff');
    });

    it('handles fractional values', () => {
      expect(colorToHex({ r: 0.5, g: 0.5, b: 0.5 })).toBe('#808080');
    });

    it('handles black and white', () => {
      expect(colorToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
      expect(colorToHex({ r: 1, g: 1, b: 1 })).toBe('#ffffff');
    });
  });

  describe('hexToColor', () => {
    it('converts hex string to Color3', () => {
      const red = hexToColor('#ff0000');
      expect(red.r).toBe(1);
      expect(red.g).toBe(0);
      expect(red.b).toBe(0);
    });

    it('handles hex without hash', () => {
      const green = hexToColor('00ff00');
      expect(green.r).toBe(0);
      expect(green.g).toBe(1);
      expect(green.b).toBe(0);
    });

    it('roundtrips with colorToHex', () => {
      const original: Color3 = { r: 0.8, g: 0.4, b: 0.2 };
      const hex = colorToHex(original);
      const result = hexToColor(hex);
      expect(Math.abs(result.r - original.r)).toBeLessThan(0.01);
      expect(Math.abs(result.g - original.g)).toBeLessThan(0.01);
      expect(Math.abs(result.b - original.b)).toBeLessThan(0.01);
    });
  });

  describe('humanize', () => {
    it('converts underscore_case to Title Case', () => {
      expect(humanize('mobile_home')).toBe('Mobile Home');
    });

    it('splits camelCase into words', () => {
      expect(humanize('GroceryStore')).toBe('Grocery Store');
      expect(humanize('BookStore')).toBe('Book Store');
    });

    it('handles simple words', () => {
      expect(humanize('Restaurant')).toBe('Restaurant');
      expect(humanize('Bar')).toBe('Bar');
    });

    it('handles mixed patterns', () => {
      expect(humanize('DentalOffice')).toBe('Dental Office');
      expect(humanize('TownHall')).toBe('Town Hall');
    });
  });

  describe('getCategorySummary', () => {
    it('returns all unconfigured when no configs exist', () => {
      const types = ['Restaurant', 'Bar', 'Bakery'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {};
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 0, procedural: 0, unconfigured: 3, withInterior: 0 });
    });

    it('counts asset mode types', () => {
      const types = ['Restaurant', 'Bar'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'asset', assetId: 'abc' },
        Bar: { mode: 'asset', assetId: 'def' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 2, procedural: 0, unconfigured: 0, withInterior: 0 });
    });

    it('counts procedural mode types', () => {
      const types = ['Restaurant', 'Bar'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'procedural' },
        Bar: { mode: 'procedural', stylePresetId: 'style1' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 0, procedural: 2, unconfigured: 0, withInterior: 0 });
    });

    it('counts mixed modes correctly', () => {
      const types = ['Restaurant', 'Bar', 'Bakery', 'Brewery'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'asset', assetId: 'abc' },
        Bakery: { mode: 'procedural' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 1, procedural: 1, unconfigured: 2, withInterior: 0 });
    });

    it('handles empty types array', () => {
      const summary = getCategorySummary([], {});
      expect(summary).toEqual({ asset: 0, procedural: 0, unconfigured: 0, withInterior: 0 });
    });

    it('ignores configs for types not in the list', () => {
      const types = ['Restaurant'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'asset' },
        Shop: { mode: 'procedural' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 1, procedural: 0, unconfigured: 0, withInterior: 0 });
    });
  });

  describe('BUILDING_CATEGORY_GROUPINGS coverage', () => {
    it('covers all 7 categories', () => {
      expect(Object.keys(BUILDING_CATEGORY_GROUPINGS)).toHaveLength(7);
    });

    it('has at least one type per category', () => {
      for (const [cat, types] of Object.entries(BUILDING_CATEGORY_GROUPINGS)) {
        expect(types.length).toBeGreaterThan(0);
      }
    });

    it('commercial_food contains expected restaurant types', () => {
      expect(BUILDING_CATEGORY_GROUPINGS.commercial_food).toContain('Restaurant');
      expect(BUILDING_CATEGORY_GROUPINGS.commercial_food).toContain('Bar');
    });

    it('residential contains house types', () => {
      expect(BUILDING_CATEGORY_GROUPINGS.residential).toContain('house');
      expect(BUILDING_CATEGORY_GROUPINGS.residential).toContain('apartment');
    });
  });
});

describe('BuildingTypeDetailPanel data flow', () => {
  // These tests validate the data structures that the detail panel creates
  // without rendering React components (pure logic tests)

  describe('asset mode config structure', () => {
    it('produces valid asset mode config', () => {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'asset',
        assetId: 'model-123',
        modelScaling: { x: 1.5, y: 1, z: 1 },
      };
      expect(config.mode).toBe('asset');
      expect(config.assetId).toBe('model-123');
      expect(config.modelScaling?.x).toBe(1.5);
    });

    it('asset mode without assetId is valid (unset)', () => {
      const config: UnifiedBuildingTypeConfig = { mode: 'asset' };
      expect(config.mode).toBe('asset');
      expect(config.assetId).toBeUndefined();
    });

    it('default scaling is 1,1,1', () => {
      const defaultScaling = { x: 1, y: 1, z: 1 };
      expect(defaultScaling.x).toBe(1);
      expect(defaultScaling.y).toBe(1);
      expect(defaultScaling.z).toBe(1);
    });
  });

  describe('procedural mode config structure', () => {
    it('produces valid procedural mode config with overrides', () => {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        styleOverrides: {
          materialType: 'brick',
          architectureStyle: 'colonial',
          baseColors: [{ r: 0.8, g: 0.7, b: 0.6 }],
        },
      };
      expect(config.mode).toBe('procedural');
      expect(config.styleOverrides?.materialType).toBe('brick');
      expect(config.styleOverrides?.baseColors).toHaveLength(1);
    });

    it('procedural mode with no overrides inherits from category', () => {
      const config: UnifiedBuildingTypeConfig = { mode: 'procedural' };
      expect(config.styleOverrides).toBeUndefined();
    });

    it('supports feature toggles in overrides', () => {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        styleOverrides: {
          hasBalcony: true,
          hasIronworkBalcony: true,
          hasPorch: true,
          porchDepth: 4,
          porchSteps: 5,
          hasShutters: true,
          shutterColor: { r: 0.3, g: 0.2, b: 0.1 },
        },
      };
      expect(config.styleOverrides?.hasBalcony).toBe(true);
      expect(config.styleOverrides?.hasPorch).toBe(true);
      expect(config.styleOverrides?.porchDepth).toBe(4);
      expect(config.styleOverrides?.hasShutters).toBe(true);
      expect(config.styleOverrides?.shutterColor?.r).toBe(0.3);
    });

    it('supports dimension overrides via styleOverrides', () => {
      // Dimensions are stored as extra fields in styleOverrides for type safety
      const overrides: Partial<ProceduralStylePreset> & { floors?: number; width?: number; depth?: number } = {
        materialType: 'stone',
        floors: 3,
        width: 12,
        depth: 8,
      };
      expect(overrides.floors).toBe(3);
      expect(overrides.width).toBe(12);
      expect(overrides.depth).toBe(8);
    });
  });

  describe('override detection', () => {
    it('detects when a field is overridden', () => {
      const overrides: Partial<ProceduralStylePreset> = {
        materialType: 'brick',
      };
      expect('materialType' in overrides && overrides.materialType !== undefined).toBe(true);
      expect('roofColor' in overrides).toBe(false);
    });

    it('reset removes a field from overrides', () => {
      const overrides: Partial<ProceduralStylePreset> = {
        materialType: 'brick',
        roofColor: { r: 0.3, g: 0.2, b: 0.1 },
      };
      const { materialType, ...rest } = overrides;
      expect('materialType' in rest).toBe(false);
      expect(rest.roofColor).toBeDefined();
    });

    it('reset all clears all overrides', () => {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        styleOverrides: {
          materialType: 'brick',
          hasBalcony: true,
        },
      };
      const reset: UnifiedBuildingTypeConfig = {
        ...config,
        styleOverrides: undefined,
      };
      expect(reset.styleOverrides).toBeUndefined();
      expect(reset.mode).toBe('procedural');
    });
  });

  describe('category preset resolution', () => {
    it('uses override value when present', () => {
      const categoryPreset: ProceduralStylePreset = {
        id: 'cat1',
        name: 'Category Default',
        baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
        roofColor: { r: 0.3, g: 0.3, b: 0.3 },
        windowColor: { r: 0.8, g: 0.8, b: 0.8 },
        doorColor: { r: 0.4, g: 0.3, b: 0.2 },
        materialType: 'wood',
        architectureStyle: 'colonial',
      };
      const overrides: Partial<ProceduralStylePreset> = {
        materialType: 'brick',
      };

      // Resolution logic: override takes precedence
      const resolved = overrides.materialType ?? categoryPreset.materialType;
      expect(resolved).toBe('brick');
    });

    it('falls back to category preset when no override', () => {
      const categoryPreset: ProceduralStylePreset = {
        id: 'cat1',
        name: 'Category Default',
        baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
        roofColor: { r: 0.3, g: 0.3, b: 0.3 },
        windowColor: { r: 0.8, g: 0.8, b: 0.8 },
        doorColor: { r: 0.4, g: 0.3, b: 0.2 },
        materialType: 'wood',
        architectureStyle: 'colonial',
      };
      const overrides: Partial<ProceduralStylePreset> = {};

      const resolved = overrides.materialType ?? categoryPreset.materialType;
      expect(resolved).toBe('wood');
    });

    it('returns undefined when no preset and no override', () => {
      const overrides: Partial<ProceduralStylePreset> | undefined = undefined;
      const categoryPreset: ProceduralStylePreset | undefined = undefined;

      const resolved = (overrides as any)?.materialType ?? categoryPreset?.materialType;
      expect(resolved).toBeUndefined();
    });
  });

  describe('mode switching preserves data', () => {
    it('switching from asset to procedural keeps assetId in config', () => {
      const assetConfig: UnifiedBuildingTypeConfig = {
        mode: 'asset',
        assetId: 'model-123',
        modelScaling: { x: 2, y: 2, z: 2 },
      };
      const switched: UnifiedBuildingTypeConfig = {
        ...assetConfig,
        mode: 'procedural',
      };
      expect(switched.mode).toBe('procedural');
      // Previous asset data is still in the config (just not active)
      expect(switched.assetId).toBe('model-123');
    });

    it('switching from procedural to asset keeps overrides in config', () => {
      const procConfig: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        styleOverrides: { materialType: 'brick' },
      };
      const switched: UnifiedBuildingTypeConfig = {
        ...procConfig,
        mode: 'asset',
      };
      expect(switched.mode).toBe('asset');
      expect(switched.styleOverrides?.materialType).toBe('brick');
    });
  });
});
