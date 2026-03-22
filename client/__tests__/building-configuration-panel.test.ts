import { describe, it, expect } from 'vitest';
import {
  CATEGORY_LABELS,
  color3ToCss,
  humanize,
  getCategorySummary,
} from '../src/components/admin/BuildingConfigurationPanel';
import { BUILDING_CATEGORY_GROUPINGS } from '@shared/game-engine/building-categories';
import type { UnifiedBuildingTypeConfig } from '@shared/game-engine/types';

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
      expect(summary).toEqual({ asset: 0, procedural: 0, unconfigured: 3 });
    });

    it('counts asset mode types', () => {
      const types = ['Restaurant', 'Bar'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'asset', assetId: 'abc' },
        Bar: { mode: 'asset', assetId: 'def' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 2, procedural: 0, unconfigured: 0 });
    });

    it('counts procedural mode types', () => {
      const types = ['Restaurant', 'Bar'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'procedural' },
        Bar: { mode: 'procedural', stylePresetId: 'style1' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 0, procedural: 2, unconfigured: 0 });
    });

    it('counts mixed modes correctly', () => {
      const types = ['Restaurant', 'Bar', 'Bakery', 'Brewery'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'asset', assetId: 'abc' },
        Bakery: { mode: 'procedural' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 1, procedural: 1, unconfigured: 2 });
    });

    it('handles empty types array', () => {
      const summary = getCategorySummary([], {});
      expect(summary).toEqual({ asset: 0, procedural: 0, unconfigured: 0 });
    });

    it('ignores configs for types not in the list', () => {
      const types = ['Restaurant'];
      const configs: Record<string, UnifiedBuildingTypeConfig> = {
        Restaurant: { mode: 'asset' },
        Shop: { mode: 'procedural' },
      };
      const summary = getCategorySummary(types, configs);
      expect(summary).toEqual({ asset: 1, procedural: 0, unconfigured: 0 });
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
