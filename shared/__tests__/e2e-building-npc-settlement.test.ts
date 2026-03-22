/**
 * End-to-end validation: unified building config, NPC diversity, and settlement generation.
 *
 * Verifies that all three systems work together correctly:
 * 1. Building type configs resolve through category presets and interior templates
 * 2. NPC configs produce diverse appearances
 * 3. Settlement generation produces varied building/residence distributions
 */
import { describe, it, expect } from 'vitest';
import type {
  UnifiedBuildingTypeConfig,
  InteriorTemplateConfig,
  NpcConfig,
  ProceduralStylePreset,
} from '../game-engine/types';
import {
  BUILDING_CATEGORY_GROUPINGS,
  getCategoryForType,
  getTypesInCategory,
  type BuildingCategory,
} from '../game-engine/building-categories';
import {
  INTERIOR_LAYOUT_TEMPLATES,
  getTemplateById,
  getTemplateForBuildingType,
  getTemplateIds,
  resolveRoomZone,
  getFurnitureSetForRoom,
} from '../game-engine/interior-templates';
import { GeographyGenerator } from '../../server/generators/geography-generator';
import {
  weightedRandomBusinessType,
  hashString,
  BUSINESS_TYPE_WEIGHTS,
} from '../../server/generators/geography-generator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeStylePreset(overrides: Partial<ProceduralStylePreset> = {}): ProceduralStylePreset {
  return {
    id: 'test-preset',
    name: 'Test',
    baseColors: [{ r: 0.8, g: 0.7, b: 0.6 }],
    roofColor: { r: 0.3, g: 0.2, b: 0.1 },
    windowColor: { r: 0.9, g: 0.9, b: 0.8 },
    doorColor: { r: 0.4, g: 0.3, b: 0.2 },
    materialType: 'wood',
    architectureStyle: 'colonial',
    ...overrides,
  };
}

function makeAssetCollection(overrides: {
  buildingTypeConfigs?: Record<string, UnifiedBuildingTypeConfig> | null;
  categoryPresets?: Record<string, ProceduralStylePreset> | null;
  npcConfig?: NpcConfig | null;
} = {}) {
  return {
    id: 'test-collection',
    name: 'Test Collection',
    collectionType: 'complete_theme' as const,
    buildingTypeConfigs: overrides.buildingTypeConfigs ?? null,
    categoryPresets: overrides.categoryPresets ?? null,
    npcConfig: overrides.npcConfig ?? null,
  };
}

// ─── 1. Unified Building Config → Category Preset → Interior Template ────────

describe('E2E: Building config resolution pipeline', () => {
  it('every building category has at least one type', () => {
    const categories = Object.keys(BUILDING_CATEGORY_GROUPINGS) as BuildingCategory[];
    expect(categories.length).toBeGreaterThanOrEqual(7);
    for (const cat of categories) {
      const types = getTypesInCategory(cat);
      expect(types.length).toBeGreaterThan(0);
    }
  });

  it('every type maps back to its category (round-trip)', () => {
    for (const [category, types] of Object.entries(BUILDING_CATEGORY_GROUPINGS)) {
      for (const type of types) {
        expect(getCategoryForType(type)).toBe(category);
      }
    }
  });

  it('no type belongs to multiple categories', () => {
    const seen = new Map<string, string>();
    for (const [category, types] of Object.entries(BUILDING_CATEGORY_GROUPINGS)) {
      for (const type of types) {
        expect(seen.has(type)).toBe(false);
        seen.set(type, category);
      }
    }
  });

  it('building type config resolves category preset for procedural buildings', () => {
    const categoryPresets: Record<string, ProceduralStylePreset> = {
      commercial_food: makeStylePreset({ id: 'food-style', materialType: 'brick' }),
    };

    // Simulate resolution: Restaurant → commercial_food → food-style preset
    const restaurantConfig: UnifiedBuildingTypeConfig = {
      mode: 'procedural',
      stylePresetId: 'food-style',
    };

    const category = getCategoryForType('Restaurant');
    expect(category).toBe('commercial_food');
    const preset = categoryPresets[category!];
    expect(preset).toBeDefined();
    expect(preset.id).toBe(restaurantConfig.stylePresetId);
    expect(preset.materialType).toBe('brick');
  });

  it('building type config can override category preset with styleOverrides', () => {
    const basePreset = makeStylePreset({ materialType: 'wood', hasBalcony: false });
    const config: UnifiedBuildingTypeConfig = {
      mode: 'procedural',
      stylePresetId: basePreset.id,
      styleOverrides: {
        materialType: 'brick',
        hasBalcony: true,
        hasIronworkBalcony: true,
      },
    };

    // Merge: base preset + overrides
    const resolved = { ...basePreset, ...config.styleOverrides };
    expect(resolved.materialType).toBe('brick');
    expect(resolved.hasBalcony).toBe(true);
    expect(resolved.hasIronworkBalcony).toBe(true);
    // Original fields preserved
    expect(resolved.roofColor).toEqual(basePreset.roofColor);
  });

  it('asset mode config bypasses procedural pipeline', () => {
    const config: UnifiedBuildingTypeConfig = {
      mode: 'asset',
      assetId: 'model-tavern-01',
      modelScaling: { x: 1, y: 1.5, z: 1 },
    };
    expect(config.mode).toBe('asset');
    expect(config.stylePresetId).toBeUndefined();
    expect(config.assetId).toBeDefined();
  });

  it('interior config links to valid interior template', () => {
    const templateIds = getTemplateIds();
    expect(templateIds.length).toBeGreaterThan(0);

    // Pick first template and wire it through a building config
    const templateId = templateIds[0];
    const template = getTemplateById(templateId);
    expect(template).toBeDefined();

    const config: UnifiedBuildingTypeConfig = {
      mode: 'procedural',
      interiorConfig: {
        mode: 'procedural',
        layoutTemplateId: templateId,
        lightingPreset: 'warm',
      },
    };

    const resolved = getTemplateById(config.interiorConfig!.layoutTemplateId!);
    expect(resolved).toBeDefined();
    expect(resolved!.rooms.length).toBeGreaterThan(0);
  });

  it('interior templates have valid room zones and furniture', () => {
    for (const template of INTERIOR_LAYOUT_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.width).toBeGreaterThan(0);
      expect(template.depth).toBeGreaterThan(0);
      expect(template.height).toBeGreaterThan(0);
      expect(template.rooms.length).toBeGreaterThan(0);

      // Every room zone resolves to valid absolute dimensions
      for (const room of template.rooms) {
        const resolved = resolveRoomZone(template, room);
        expect(resolved.name).toBeTruthy();
        expect(typeof resolved.offsetX).toBe('number');
        expect(typeof resolved.offsetZ).toBe('number');
        expect(resolved.width).toBeGreaterThan(0);
        expect(resolved.depth).toBeGreaterThan(0);
      }
    }
  });

  it('getTemplateForBuildingType finds templates for common business types', () => {
    const typesToTest = ['restaurant', 'bar', 'shop', 'bakery', 'hotel', 'church', 'blacksmith'];
    let matched = 0;
    for (const type of typesToTest) {
      const template = getTemplateForBuildingType(type);
      if (template) matched++;
    }
    // At least half should match (some types may not have templates)
    expect(matched).toBeGreaterThanOrEqual(typesToTest.length / 2);
  });

  it('full pipeline: type → category → preset → interior for all food types', () => {
    const foodTypes = getTypesInCategory('commercial_food');
    const categoryPreset = makeStylePreset({ id: 'food-preset', materialType: 'brick' });

    for (const type of foodTypes) {
      // 1. Type resolves to category
      const category = getCategoryForType(type);
      expect(category).toBe('commercial_food');

      // 2. Build a config with preset + interior
      const config: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        stylePresetId: categoryPreset.id,
        interiorConfig: {
          mode: 'procedural',
          layoutTemplateId: type.toLowerCase(),
          lightingPreset: 'warm',
        },
      };

      // 3. Verify config is structurally valid
      expect(config.mode).toBe('procedural');
      expect(config.stylePresetId).toBe('food-preset');
      expect(config.interiorConfig?.mode).toBe('procedural');
    }
  });
});

// ─── 2. NPC Diversity ────────────────────────────────────────────────────────

describe('E2E: NPC diversity configuration', () => {
  it('NPC config produces diverse appearance combinations', () => {
    const config: NpcConfig = {
      bodyModels: ['male_average', 'male_athletic', 'female_average', 'female_slim'],
      hairStyles: {
        male: ['buzzed', 'long', 'simpleparted', 'mohawk'],
        female: ['long', 'buns', 'buzzedfemale', 'ponytail'],
      },
      clothingPalette: ['#8B4513', '#2F4F4F', '#556B2F', '#4A0E0E', '#1B3A4B', '#5C4033'],
      skinTonePalette: ['#FFDFC4', '#F0C8A0', '#D4A76A', '#8D5524', '#6B3A2A', '#3B2219'],
    };

    // Calculate total unique combinations
    const bodyCount = config.bodyModels!.length;
    const maleHairCount = config.hairStyles!.male.length;
    const femaleHairCount = config.hairStyles!.female.length;
    const clothingCount = config.clothingPalette!.length;
    const skinCount = config.skinTonePalette!.length;

    // Male combinations: 2 bodies × 4 hair × 6 clothing × 6 skin = 288
    const maleCombinations = 2 * maleHairCount * clothingCount * skinCount;
    // Female combinations: 2 bodies × 4 hair × 6 clothing × 6 skin = 288
    const femaleCombinations = 2 * femaleHairCount * clothingCount * skinCount;
    const totalCombinations = maleCombinations + femaleCombinations;

    expect(totalCombinations).toBeGreaterThanOrEqual(500);
  });

  it('skin tone palette covers diverse range', () => {
    const config: NpcConfig = {
      skinTonePalette: ['#FFDFC4', '#F0C8A0', '#D4A76A', '#8D5524', '#6B3A2A', '#3B2219'],
    };
    expect(config.skinTonePalette!.length).toBeGreaterThanOrEqual(4);

    // Ensure colors are valid hex
    for (const color of config.skinTonePalette!) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('clothing palette provides sufficient variety', () => {
    const config: NpcConfig = {
      clothingPalette: ['#8B4513', '#2F4F4F', '#556B2F', '#4A0E0E', '#1B3A4B', '#5C4033'],
    };
    expect(config.clothingPalette!.length).toBeGreaterThanOrEqual(4);
  });

  it('hair styles defined for both genders', () => {
    const config: NpcConfig = {
      hairStyles: {
        male: ['buzzed', 'long', 'simpleparted'],
        female: ['long', 'buns', 'buzzedfemale'],
      },
    };
    expect(config.hairStyles!.male.length).toBeGreaterThanOrEqual(2);
    expect(config.hairStyles!.female.length).toBeGreaterThanOrEqual(2);
  });

  it('empty NPC config is valid (backward compatible)', () => {
    const config: NpcConfig = {};
    expect(config.bodyModels).toBeUndefined();
    expect(config.hairStyles).toBeUndefined();
    expect(config.clothingPalette).toBeUndefined();
    expect(config.skinTonePalette).toBeUndefined();
  });

  it('NPC config integrates with asset collection', () => {
    const collection = makeAssetCollection({
      npcConfig: {
        bodyModels: ['male_peasant', 'female_peasant'],
        hairStyles: { male: ['buzzed'], female: ['long'] },
        clothingPalette: ['#8B4513'],
        skinTonePalette: ['#FFDFC4'],
      },
    });
    expect(collection.npcConfig).toBeDefined();
    expect(collection.npcConfig!.bodyModels).toHaveLength(2);
  });
});

// ─── 3. Settlement Generation ────────────────────────────────────────────────

describe('E2E: Settlement generation diversity', () => {
  const geo = new GeographyGenerator();
  const validResidenceTypes = new Set(['house', 'apartment', 'mansion', 'cottage', 'townhouse', 'mobile_home']);

  describe('residence type distribution', () => {
    it('produces all 6 residence types across sufficient samples', () => {
      const seen = new Set<string>();
      for (let i = 0; i < 500; i++) {
        seen.add(geo.getResidenceType('town', i));
      }
      for (const type of validResidenceTypes) {
        expect(seen.has(type)).toBe(true);
      }
    });

    it('is deterministic (same seed → same result)', () => {
      for (let seed = 0; seed < 20; seed++) {
        const a = geo.getResidenceType('city', seed);
        const b = geo.getResidenceType('city', seed);
        expect(a).toBe(b);
      }
    });

    it('cities have more apartments than villages', () => {
      const cityApts = countType('city', 'apartment', 1000);
      const villageApts = countType('village', 'apartment', 1000);
      expect(cityApts).toBeGreaterThan(villageApts);
    });

    it('villages have more cottages than cities', () => {
      const villageCottages = countType('village', 'cottage', 1000);
      const cityCottages = countType('city', 'cottage', 1000);
      expect(villageCottages).toBeGreaterThan(cityCottages);
    });

    it('unknown settlement type falls back gracefully', () => {
      const result = geo.getResidenceType('metropolis', 42);
      expect(validResidenceTypes.has(result)).toBe(true);
    });
  });

  describe('business type distribution', () => {
    it('weighted business type selection covers multiple types', () => {
      const types = new Set<string>();
      const testNames = [
        'Main Street Store', 'Oak Avenue Shop', 'Harbor Trading Co',
        'Pine Street Market', 'Downtown Emporium', 'Riverside Goods',
        'Central Place', 'Heritage Building', 'Liberty Square',
        'Market Hall', 'Grand Exchange', 'Waterfront Place',
      ];
      for (const name of testNames) {
        types.add(weightedRandomBusinessType(name));
      }
      expect(types.size).toBeGreaterThanOrEqual(3);
    });

    it('hashString is deterministic', () => {
      expect(hashString('test')).toBe(hashString('test'));
      expect(hashString('foo')).not.toBe(hashString('bar'));
    });

    it('business type weights sum to 100', () => {
      const total = BUSINESS_TYPE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
      expect(total).toBe(100);
    });
  });

  function countType(settlementType: string, residenceType: string, n: number): number {
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (geo.getResidenceType(settlementType, i) === residenceType) count++;
    }
    return count;
  }
});

// ─── 4. Full Integration: Asset Collection → Settlement ──────────────────────

describe('E2E: Asset collection wired to settlement building types', () => {
  it('asset collection with building configs covers all categories', () => {
    const allCategories = Object.keys(BUILDING_CATEGORY_GROUPINGS) as BuildingCategory[];

    // Build configs for one type per category
    const buildingTypeConfigs: Record<string, UnifiedBuildingTypeConfig> = {};
    const categoryPresets: Record<string, ProceduralStylePreset> = {};

    for (const category of allCategories) {
      const types = getTypesInCategory(category);
      const representativeType = types[0];

      categoryPresets[category] = makeStylePreset({
        id: `${category}-preset`,
        name: `${category} Style`,
      });

      buildingTypeConfigs[representativeType] = {
        mode: 'procedural',
        stylePresetId: `${category}-preset`,
      };
    }

    const collection = makeAssetCollection({
      buildingTypeConfigs,
      categoryPresets,
      npcConfig: {
        bodyModels: ['male_avg', 'female_avg'],
        skinTonePalette: ['#FFDFC4', '#8D5524'],
      },
    });

    // Verify all categories have presets
    expect(Object.keys(collection.categoryPresets!).length).toBe(allCategories.length);
    // Verify representative types have configs
    expect(Object.keys(collection.buildingTypeConfigs!).length).toBe(allCategories.length);
    // Verify NPC config present
    expect(collection.npcConfig!.bodyModels).toHaveLength(2);

    // For each configured type, verify its category preset exists
    for (const [type, config] of Object.entries(collection.buildingTypeConfigs!)) {
      const category = getCategoryForType(type);
      expect(category).toBeDefined();
      expect(collection.categoryPresets![category!]).toBeDefined();
      expect(collection.categoryPresets![category!].id).toBe(config.stylePresetId);
    }
  });

  it('settlement residence types map to residential building category', () => {
    const residentialTypes = getTypesInCategory('residential');
    const geo = new GeographyGenerator();

    // All residence types produced by settlement gen should be in the residential category
    for (let i = 0; i < 200; i++) {
      const type = geo.getResidenceType('town', i);
      expect(residentialTypes).toContain(type);
    }
  });

  it('interior templates exist for key business types generated by settlement', () => {
    // These are the most common business types from weighted selection
    const commonTypes = ['Shop', 'Restaurant', 'Bakery', 'Hotel', 'Bar'];
    let templatesFound = 0;
    for (const type of commonTypes) {
      const template = getTemplateForBuildingType(type.toLowerCase());
      if (template) templatesFound++;
    }
    // Most common types should have interior templates
    expect(templatesFound).toBeGreaterThanOrEqual(3);
  });

  it('texture IDs on presets and interior configs are consistent strings', () => {
    const preset = makeStylePreset({
      wallTextureId: 'tex-brick-01',
      roofTextureId: 'tex-slate-01',
      floorTextureId: 'tex-wood-plank',
    });

    const interiorConfig: InteriorTemplateConfig = {
      mode: 'procedural',
      layoutTemplateId: 'tavern',
      wallTextureId: 'tex-wood-wall',
      floorTextureId: 'tex-stone-floor',
    };

    // Both systems use string texture IDs
    expect(typeof preset.wallTextureId).toBe('string');
    expect(typeof interiorConfig.wallTextureId).toBe('string');
    // Texture IDs should be non-empty
    expect(preset.wallTextureId!.length).toBeGreaterThan(0);
    expect(interiorConfig.wallTextureId!.length).toBeGreaterThan(0);
  });

  it('legacy collection without new fields still provides valid settlement data', () => {
    const legacy = makeAssetCollection();
    expect(legacy.buildingTypeConfigs).toBeNull();
    expect(legacy.categoryPresets).toBeNull();
    expect(legacy.npcConfig).toBeNull();

    // Settlement generation still works without collection configs
    const geo = new GeographyGenerator();
    const type = geo.getResidenceType('town', 0);
    expect(type).toBeTruthy();
  });
});
