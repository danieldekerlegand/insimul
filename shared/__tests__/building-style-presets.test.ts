import { describe, it, expect } from 'vitest';
import { CATEGORY_STYLE_PRESETS, getCategoryPreset, getSubtypeStyleOverride, applySubtypeOverride, SubtypeStyleOverride } from '../game-engine/building-style-presets';
import { BUILDING_CATEGORY_GROUPINGS, type BuildingCategory } from '../game-engine/building-categories';
import type { ProceduralStylePreset } from '../game-engine/types';

const ALL_CATEGORIES = Object.keys(BUILDING_CATEGORY_GROUPINGS) as BuildingCategory[];

/** Helper to create a minimal valid preset for testing */
function makePreset(overrides: Partial<ProceduralStylePreset> = {}): ProceduralStylePreset {
  return {
    id: 'test-preset',
    name: 'Test Preset',
    baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    roofColor: { r: 0.4, g: 0.2, b: 0.2 },
    windowColor: { r: 0.6, g: 0.8, b: 1.0 },
    doorColor: { r: 0.3, g: 0.2, b: 0.1 },
    materialType: 'wood',
    architectureStyle: 'rustic',
    ...overrides,
  };
}

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

describe('getSubtypeStyleOverride', () => {
  it('returns override for known subtypes', () => {
    expect(getSubtypeStyleOverride('Bakery')).toBeDefined();
    expect(getSubtypeStyleOverride('Bank')).toBeDefined();
    expect(getSubtypeStyleOverride('Church')).toBeDefined();
    expect(getSubtypeStyleOverride('Factory')).toBeDefined();
    expect(getSubtypeStyleOverride('house')).toBeDefined();
    expect(getSubtypeStyleOverride('Harbor')).toBeDefined();
  });

  it('returns undefined for unknown subtypes', () => {
    expect(getSubtypeStyleOverride('NonExistentType')).toBeUndefined();
    expect(getSubtypeStyleOverride('')).toBeUndefined();
  });

  it('covers all building categories', () => {
    // At least one subtype per category should have an override
    const subtypesPerCategory = {
      commercial_food: ['Restaurant', 'Bar', 'Bakery', 'Brewery'],
      commercial_retail: ['Shop', 'GroceryStore', 'JewelryStore', 'BookStore'],
      commercial_service: ['Bank', 'Hotel', 'Barbershop', 'Tailor'],
      civic: ['Church', 'TownHall', 'School', 'Hospital'],
      industrial: ['Factory', 'Farm', 'Warehouse', 'Blacksmith'],
      maritime: ['Harbor', 'Boatyard', 'FishMarket', 'Lighthouse'],
      residential: ['house', 'apartment', 'mansion', 'cottage'],
    };

    for (const [category, subtypes] of Object.entries(subtypesPerCategory)) {
      const hasOverride = subtypes.some(s => getSubtypeStyleOverride(s) !== undefined);
      expect(hasOverride, `Category ${category} should have at least one subtype with overrides`).toBe(true);
    }
  });
});

describe('applySubtypeOverride', () => {
  it('returns a new object without mutating the base preset', () => {
    const base = makePreset();
    const override: SubtypeStyleOverride = { hasShutters: true };
    const result = applySubtypeOverride(base, override);

    expect(result).not.toBe(base);
    expect(base.hasShutters).toBeUndefined();
    expect(result.hasShutters).toBe(true);
  });

  it('applies color tint to baseColors', () => {
    const base = makePreset({
      baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    });
    const override: SubtypeStyleOverride = {
      colorTint: { r: 1.5, g: 0.5, b: 1.0 },
    };
    const result = applySubtypeOverride(base, override);

    expect(result.baseColors[0].r).toBeCloseTo(0.75);
    expect(result.baseColors[0].g).toBeCloseTo(0.25);
    expect(result.baseColors[0].b).toBeCloseTo(0.5);
  });

  it('clamps tinted colors to max 1.0', () => {
    const base = makePreset({
      baseColors: [{ r: 0.8, g: 0.9, b: 1.0 }],
    });
    const override: SubtypeStyleOverride = {
      colorTint: { r: 2.0, g: 2.0, b: 2.0 },
    };
    const result = applySubtypeOverride(base, override);

    expect(result.baseColors[0].r).toBe(1.0);
    expect(result.baseColors[0].g).toBe(1.0);
    expect(result.baseColors[0].b).toBe(1.0);
  });

  it('applies tint to all baseColors in the palette', () => {
    const base = makePreset({
      baseColors: [
        { r: 0.4, g: 0.4, b: 0.4 },
        { r: 0.6, g: 0.6, b: 0.6 },
      ],
    });
    const override: SubtypeStyleOverride = {
      colorTint: { r: 1.0, g: 1.5, b: 1.0 },
    };
    const result = applySubtypeOverride(base, override);

    expect(result.baseColors).toHaveLength(2);
    expect(result.baseColors[0].g).toBeCloseTo(0.6);
    expect(result.baseColors[1].g).toBeCloseTo(0.9);
  });

  it('replaces materialType when base is not in preferredMaterials', () => {
    const base = makePreset({ materialType: 'glass' });
    const override: SubtypeStyleOverride = {
      preferredMaterials: ['stone', 'brick'],
    };
    const result = applySubtypeOverride(base, override);

    expect(result.materialType).toBe('stone');
  });

  it('keeps materialType when base is already in preferredMaterials', () => {
    const base = makePreset({ materialType: 'brick' });
    const override: SubtypeStyleOverride = {
      preferredMaterials: ['stone', 'brick'],
    };
    const result = applySubtypeOverride(base, override);

    expect(result.materialType).toBe('brick');
  });

  it('replaces architectureStyle when base is not in preferred list', () => {
    const base = makePreset({ architectureStyle: 'futuristic' });
    const override: SubtypeStyleOverride = {
      preferredArchStyles: ['colonial'],
    };
    const result = applySubtypeOverride(base, override);

    expect(result.architectureStyle).toBe('colonial');
  });

  it('keeps architectureStyle when base is already preferred', () => {
    const base = makePreset({ architectureStyle: 'colonial' });
    const override: SubtypeStyleOverride = {
      preferredArchStyles: ['colonial', 'medieval'],
    };
    const result = applySubtypeOverride(base, override);

    expect(result.architectureStyle).toBe('colonial');
  });

  it('applies roofStyle preference when base has none', () => {
    const base = makePreset({ roofStyle: undefined });
    const override: SubtypeStyleOverride = {
      preferredRoofStyles: ['hip', 'gable'],
    };
    const result = applySubtypeOverride(base, override);

    expect(result.roofStyle).toBe('hip');
  });

  it('keeps roofStyle when base matches preferred', () => {
    const base = makePreset({ roofStyle: 'gable' });
    const override: SubtypeStyleOverride = {
      preferredRoofStyles: ['hip', 'gable'],
    };
    const result = applySubtypeOverride(base, override);

    expect(result.roofStyle).toBe('gable');
  });

  it('applies boolean feature flags', () => {
    const base = makePreset({
      hasBalcony: false,
      hasPorch: false,
      hasShutters: false,
    });
    const override: SubtypeStyleOverride = {
      hasBalcony: true,
      hasPorch: true,
      porchDepth: 3,
      porchSteps: 4,
      hasShutters: true,
    };
    const result = applySubtypeOverride(base, override);

    expect(result.hasBalcony).toBe(true);
    expect(result.hasPorch).toBe(true);
    expect(result.porchDepth).toBe(3);
    expect(result.porchSteps).toBe(4);
    expect(result.hasShutters).toBe(true);
  });

  it('preserves non-overridden fields from the base', () => {
    const base = makePreset({
      wallTextureId: 'wall-tex-123',
      roofTextureId: 'roof-tex-456',
      doorColor: { r: 0.9, g: 0.1, b: 0.1 },
    });
    const override: SubtypeStyleOverride = { hasShutters: true };
    const result = applySubtypeOverride(base, override);

    expect(result.wallTextureId).toBe('wall-tex-123');
    expect(result.roofTextureId).toBe('roof-tex-456');
    expect(result.doorColor).toEqual({ r: 0.9, g: 0.1, b: 0.1 });
    expect(result.id).toBe('test-preset');
    expect(result.name).toBe('Test Preset');
  });

  it('applies an empty override without changing the preset', () => {
    const base = makePreset();
    const result = applySubtypeOverride(base, {});

    expect(result.materialType).toBe(base.materialType);
    expect(result.architectureStyle).toBe(base.architectureStyle);
    expect(result.baseColors).toEqual(base.baseColors);
  });

  it('works with real subtype overrides (Bank)', () => {
    const base = makePreset({ materialType: 'wood', architectureStyle: 'rustic' });
    const bankOverride = getSubtypeStyleOverride('Bank')!;
    expect(bankOverride).toBeDefined();

    const result = applySubtypeOverride(base, bankOverride);

    // Bank prefers stone/brick and colonial
    expect(result.materialType).toBe('stone');
    expect(result.architectureStyle).toBe('colonial');
    expect(result.hasPorch).toBe(true);
    expect(result.porchSteps).toBeGreaterThan(0);
  });

  it('works with real subtype overrides (Bar)', () => {
    const base = makePreset({
      baseColors: [{ r: 0.5, g: 0.5, b: 0.5 }],
    });
    const barOverride = getSubtypeStyleOverride('Bar')!;
    expect(barOverride).toBeDefined();

    const result = applySubtypeOverride(base, barOverride);

    // Bar has dark tint (all channels < 1.0)
    expect(result.baseColors[0].r).toBeLessThan(0.5);
    expect(result.baseColors[0].g).toBeLessThan(0.5);
    expect(result.baseColors[0].b).toBeLessThan(0.5);
  });
});
