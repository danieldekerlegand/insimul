import { describe, it, expect } from 'vitest';
import {
  BUILDING_CATEGORY_GROUPINGS,
  getCategoryForType,
  getTypesInCategory,
  type BuildingCategory,
} from '../game-engine/building-categories';

describe('BUILDING_CATEGORY_GROUPINGS', () => {
  it('contains all seven categories', () => {
    const categories = Object.keys(BUILDING_CATEGORY_GROUPINGS);
    expect(categories).toEqual([
      'commercial_food',
      'commercial_retail',
      'commercial_service',
      'civic',
      'industrial',
      'maritime',
      'residential',
    ]);
  });

  it('has no duplicate types across categories', () => {
    const seen = new Map<string, string>();
    for (const [category, types] of Object.entries(BUILDING_CATEGORY_GROUPINGS)) {
      for (const t of types) {
        expect(seen.has(t), `"${t}" appears in both "${seen.get(t)}" and "${category}"`).toBe(false);
        seen.set(t, category);
      }
    }
  });

  it('has non-empty arrays for every category', () => {
    for (const types of Object.values(BUILDING_CATEGORY_GROUPINGS)) {
      expect(types.length).toBeGreaterThan(0);
    }
  });
});

describe('getCategoryForType', () => {
  it('returns the correct category for known types', () => {
    expect(getCategoryForType('Restaurant')).toBe('commercial_food');
    expect(getCategoryForType('Shop')).toBe('commercial_retail');
    expect(getCategoryForType('Bank')).toBe('commercial_service');
    expect(getCategoryForType('Church')).toBe('civic');
    expect(getCategoryForType('Factory')).toBe('industrial');
    expect(getCategoryForType('Harbor')).toBe('maritime');
    expect(getCategoryForType('house')).toBe('residential');
  });

  it('returns undefined for unknown types', () => {
    expect(getCategoryForType('UnknownType')).toBeUndefined();
    expect(getCategoryForType('')).toBeUndefined();
  });
});

describe('getTypesInCategory', () => {
  it('returns the correct types for known categories', () => {
    expect(getTypesInCategory('commercial_food')).toEqual(['Restaurant', 'Bar', 'Bakery', 'Brewery']);
    expect(getTypesInCategory('residential')).toEqual([
      'house', 'apartment', 'mansion', 'cottage', 'townhouse', 'mobile_home',
    ]);
  });

  it('returns an empty array for unknown categories', () => {
    expect(getTypesInCategory('nonexistent')).toEqual([]);
  });

  it('returns a readonly array (not modifiable at type level)', () => {
    const types = getTypesInCategory('maritime');
    expect(types).toEqual(['Harbor', 'Boatyard', 'FishMarket', 'CustomsHouse', 'Lighthouse']);
  });
});
