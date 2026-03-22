import { describe, it, expect } from 'vitest';
import { CATEGORY_STYLE_PRESETS, getCategoryPreset } from '../game-engine/building-style-presets';
import { BUILDING_CATEGORY_GROUPINGS, type BuildingCategory } from '../game-engine/building-categories';

const ALL_CATEGORIES = Object.keys(BUILDING_CATEGORY_GROUPINGS) as BuildingCategory[];

describe('CATEGORY_STYLE_PRESETS', () => {
  it('has presets for every building category', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_STYLE_PRESETS[cat], `missing presets for "${cat}"`).toBeDefined();
      expect(CATEGORY_STYLE_PRESETS[cat].length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each preset has a unique id', () => {
    const allIds = new Set<string>();
    for (const presets of Object.values(CATEGORY_STYLE_PRESETS)) {
      for (const p of presets) {
        expect(allIds.has(p.id), `duplicate preset id "${p.id}"`).toBe(false);
        allIds.add(p.id);
      }
    }
  });

  it('each preset has required fields', () => {
    for (const [cat, presets] of Object.entries(CATEGORY_STYLE_PRESETS)) {
      for (const p of presets) {
        expect(p.id, `preset in "${cat}" missing id`).toBeTruthy();
        expect(p.name, `preset "${p.id}" missing name`).toBeTruthy();
        expect(p.baseColors.length, `preset "${p.id}" needs at least one baseColor`).toBeGreaterThanOrEqual(1);
        expect(p.roofColor).toBeDefined();
        expect(p.windowColor).toBeDefined();
        expect(p.doorColor).toBeDefined();
        expect(p.materialType).toBeTruthy();
        expect(p.architectureStyle).toBeTruthy();
      }
    }
  });

  it('presets within a category have varied materialTypes or architectureStyles', () => {
    for (const [cat, presets] of Object.entries(CATEGORY_STYLE_PRESETS)) {
      if (presets.length < 2) continue;
      const materials = new Set(presets.map(p => p.materialType));
      const archStyles = new Set(presets.map(p => p.architectureStyle));
      const roofStyles = new Set(presets.map(p => p.roofStyle).filter(Boolean));
      // At least 2 distinct values across materials OR arch styles OR roof styles
      const variety = Math.max(materials.size, archStyles.size, roofStyles.size);
      expect(variety, `"${cat}" presets lack variety`).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('getCategoryPreset', () => {
  it('returns a preset for a known category', () => {
    const preset = getCategoryPreset('residential', 'test-building-123');
    expect(preset).toBeDefined();
    expect(preset!.id).toBeTruthy();
  });

  it('is deterministic for the same seed', () => {
    const a = getCategoryPreset('commercial_food', 'seed-abc');
    const b = getCategoryPreset('commercial_food', 'seed-abc');
    expect(a!.id).toBe(b!.id);
  });

  it('produces variety across different seeds', () => {
    const ids = new Set<string>();
    // Use enough seeds to likely hit multiple presets
    for (let i = 0; i < 50; i++) {
      const preset = getCategoryPreset('residential', `building-${i}`);
      if (preset) ids.add(preset.id);
    }
    expect(ids.size, 'should pick more than one preset across many seeds').toBeGreaterThan(1);
  });

  it('returns different presets for different categories with the same seed', () => {
    const food = getCategoryPreset('commercial_food', 'same-seed');
    const industrial = getCategoryPreset('industrial', 'same-seed');
    // Different categories have different preset pools, so ids should differ
    // (unless hash collision picks same index and both happen to share prefix — very unlikely)
    expect(food).toBeDefined();
    expect(industrial).toBeDefined();
    expect(food!.id).not.toBe(industrial!.id);
  });
});
