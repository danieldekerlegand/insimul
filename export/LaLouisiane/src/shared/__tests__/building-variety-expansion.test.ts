import { describe, it, expect } from 'vitest';
import {
  BUILDING_CATEGORY_GROUPINGS,
  getCategoryForType,
} from '../game-engine/building-categories';
import {
  BUILDING_TYPE_DEFAULTS,
  getBuildingDefaults,
  DEFAULT_BUILDING_DIMENSIONS,
} from '../game-engine/building-defaults';
import {
  getTemplateForBuildingType,
  getTemplateById,
} from '../game-engine/interior-templates';

// All legacy types that were in building-defaults but not in building-categories
const NEWLY_CATEGORIZED_TYPES = [
  { type: 'Tavern', category: 'entertainment' },
  { type: 'Inn', category: 'entertainment' },
  { type: 'Library', category: 'professional' },
  { type: 'Clinic', category: 'professional' },
  { type: 'Stables', category: 'professional' },
  { type: 'Windmill', category: 'industrial' },
  { type: 'Watermill', category: 'industrial' },
  { type: 'Lumbermill', category: 'industrial' },
  { type: 'Mine', category: 'industrial' },
  { type: 'Barracks', category: 'military' },
  { type: 'ApartmentComplex', category: 'residential' },
] as const;

describe('Building variety expansion — category assignments', () => {
  it.each(NEWLY_CATEGORIZED_TYPES)(
    '$type is in the $category category',
    ({ type, category }) => {
      expect(getCategoryForType(type)).toBe(category);
    },
  );

  it('entertainment category contains Theater, Tavern, and Inn', () => {
    const types = BUILDING_CATEGORY_GROUPINGS.entertainment;
    expect(types).toContain('Theater');
    expect(types).toContain('Tavern');
    expect(types).toContain('Inn');
  });

  it('professional category contains Library, Clinic, and Stables', () => {
    const types = BUILDING_CATEGORY_GROUPINGS.professional;
    expect(types).toContain('Library');
    expect(types).toContain('Clinic');
    expect(types).toContain('Stables');
  });

  it('industrial category contains Windmill, Watermill, Lumbermill, Mine', () => {
    const types = BUILDING_CATEGORY_GROUPINGS.industrial;
    expect(types).toContain('Windmill');
    expect(types).toContain('Watermill');
    expect(types).toContain('Lumbermill');
    expect(types).toContain('Mine');
  });

  it('military category contains Barracks', () => {
    expect(BUILDING_CATEGORY_GROUPINGS.military).toContain('Barracks');
  });

  it('residential category contains ApartmentComplex', () => {
    expect(BUILDING_CATEGORY_GROUPINGS.residential).toContain('ApartmentComplex');
  });
});

describe('Building variety expansion — defaults exist', () => {
  it.each(NEWLY_CATEGORIZED_TYPES)(
    '$type has building defaults (not fallback)',
    ({ type }) => {
      const defaults = getBuildingDefaults(type);
      // Should NOT be the generic fallback
      expect(defaults).not.toEqual(DEFAULT_BUILDING_DIMENSIONS);
      expect(defaults.floors).toBeGreaterThan(0);
      expect(defaults.width).toBeGreaterThan(0);
      expect(defaults.depth).toBeGreaterThan(0);
    },
  );
});

describe('Building variety expansion — interior templates', () => {
  it('Inn has a dedicated interior template', () => {
    const template = getTemplateById('inn');
    expect(template).toBeDefined();
    expect(template!.buildingType).toBe('inn');
    expect(template!.floorCount).toBe(3);
    expect(template!.rooms.length).toBeGreaterThanOrEqual(4);
  });

  it('Library has a dedicated interior template', () => {
    const template = getTemplateById('library');
    expect(template).toBeDefined();
    expect(template!.buildingType).toBe('library');
    expect(template!.floorCount).toBe(3);
  });

  it('Stables has a dedicated interior template', () => {
    const template = getTemplateById('stables');
    expect(template).toBeDefined();
    expect(template!.buildingType).toBe('stables');
  });

  it('Inn is found by getTemplateForBuildingType', () => {
    const template = getTemplateForBuildingType('Inn');
    expect(template).toBeDefined();
    expect(template!.id).toBe('inn');
  });

  it('Library is found by getTemplateForBuildingType', () => {
    const template = getTemplateForBuildingType('Library');
    expect(template).toBeDefined();
    expect(template!.id).toBe('library');
  });

  it('Stables is found by getTemplateForBuildingType', () => {
    const template = getTemplateForBuildingType('Stables');
    expect(template).toBeDefined();
    expect(template!.id).toBe('stables');
  });
});

describe('Building variety expansion — no duplicate types across categories', () => {
  it('every type appears in exactly one category', () => {
    const seen = new Map<string, string>();
    for (const [category, types] of Object.entries(BUILDING_CATEGORY_GROUPINGS)) {
      for (const t of types) {
        expect(
          seen.has(t),
          `"${t}" appears in both "${seen.get(t)}" and "${category}"`,
        ).toBe(false);
        seen.set(t, category);
      }
    }
  });
});
