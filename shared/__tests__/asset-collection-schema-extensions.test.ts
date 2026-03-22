import { describe, it, expect } from 'vitest';
import type {
  UnifiedBuildingTypeConfig,
  InteriorTemplateConfig,
  NpcConfig,
  ProceduralStylePreset,
} from '../game-engine/types';
import type { AssetCollection, InsertAssetCollection } from '../schema';

describe('AssetCollection schema extensions', () => {
  describe('UnifiedBuildingTypeConfig type', () => {
    it('accepts asset mode configuration', () => {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'asset',
        assetId: 'tavern-model-1',
        modelScaling: { x: 1, y: 1.5, z: 1 },
      };
      expect(config.mode).toBe('asset');
      expect(config.assetId).toBe('tavern-model-1');
      expect(config.modelScaling).toEqual({ x: 1, y: 1.5, z: 1 });
    });

    it('accepts procedural mode configuration', () => {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        stylePresetId: 'medieval-1',
        styleOverrides: {
          roofColor: { r: 0.5, g: 0.2, b: 0.1 },
          materialType: 'stone',
        },
      };
      expect(config.mode).toBe('procedural');
      expect(config.stylePresetId).toBe('medieval-1');
      expect(config.styleOverrides?.materialType).toBe('stone');
    });

    it('accepts interior config', () => {
      const config: UnifiedBuildingTypeConfig = {
        mode: 'procedural',
        interiorConfig: {
          mode: 'procedural',
          layoutTemplateId: 'tavern',
          wallTextureId: 'wood-planks',
          floorTextureId: 'stone-floor',
          lightingPreset: 'candlelit',
        },
      };
      expect(config.interiorConfig?.mode).toBe('procedural');
      expect(config.interiorConfig?.lightingPreset).toBe('candlelit');
    });
  });

  describe('InteriorTemplateConfig type', () => {
    it('accepts model mode', () => {
      const config: InteriorTemplateConfig = {
        mode: 'model',
        modelPath: '/assets/models/interiors/tavern.glb',
      };
      expect(config.mode).toBe('model');
      expect(config.modelPath).toBeDefined();
    });

    it('accepts procedural mode with all optional fields', () => {
      const config: InteriorTemplateConfig = {
        mode: 'procedural',
        layoutTemplateId: 'shop',
        wallTextureId: 'tex-1',
        floorTextureId: 'tex-2',
        ceilingTextureId: 'tex-3',
        furnitureSet: 'medieval-shop',
        lightingPreset: 'warm',
      };
      expect(config.mode).toBe('procedural');
      expect(config.furnitureSet).toBe('medieval-shop');
    });

    it('supports all lighting presets', () => {
      const presets: InteriorTemplateConfig['lightingPreset'][] = [
        'bright', 'dim', 'warm', 'cool', 'candlelit',
      ];
      for (const preset of presets) {
        const config: InteriorTemplateConfig = { mode: 'procedural', lightingPreset: preset };
        expect(config.lightingPreset).toBe(preset);
      }
    });
  });

  describe('NpcConfig type', () => {
    it('accepts full NPC configuration', () => {
      const config: NpcConfig = {
        bodyModels: ['male_peasant', 'female_peasant', 'male_ranger'],
        hairStyles: {
          male: ['buzzed', 'long', 'simpleparted'],
          female: ['long', 'buns', 'buzzedfemale'],
        },
        clothingPalette: ['#8B4513', '#2F4F4F', '#556B2F'],
        skinTonePalette: ['#FFDFC4', '#8D5524', '#3B2219'],
      };
      expect(config.bodyModels).toHaveLength(3);
      expect(config.hairStyles?.male).toHaveLength(3);
      expect(config.clothingPalette).toHaveLength(3);
      expect(config.skinTonePalette).toHaveLength(3);
    });

    it('allows all fields to be optional', () => {
      const config: NpcConfig = {};
      expect(config.bodyModels).toBeUndefined();
      expect(config.hairStyles).toBeUndefined();
      expect(config.clothingPalette).toBeUndefined();
      expect(config.skinTonePalette).toBeUndefined();
    });
  });

  describe('AssetCollection type includes new fields', () => {
    it('buildingTypeConfigs is nullable on AssetCollection', () => {
      // Verify the type allows null (compile-time check expressed as runtime)
      const partial: Pick<AssetCollection, 'buildingTypeConfigs'> = {
        buildingTypeConfigs: null,
      };
      expect(partial.buildingTypeConfigs).toBeNull();
    });

    it('buildingTypeConfigs accepts a record of configs', () => {
      const configs: AssetCollection['buildingTypeConfigs'] = {
        Restaurant: { mode: 'procedural', stylePresetId: 'medieval-1' },
        Bank: { mode: 'asset', assetId: 'bank-model' },
      };
      expect(configs).toBeDefined();
      expect(configs!['Restaurant'].mode).toBe('procedural');
      expect(configs!['Bank'].mode).toBe('asset');
    });

    it('categoryPresets is nullable on AssetCollection', () => {
      const partial: Pick<AssetCollection, 'categoryPresets'> = {
        categoryPresets: null,
      };
      expect(partial.categoryPresets).toBeNull();
    });

    it('categoryPresets accepts a record of style presets', () => {
      const presets: AssetCollection['categoryPresets'] = {
        commercial_food: {
          id: 'food-preset',
          name: 'Food District',
          baseColors: [{ r: 0.8, g: 0.6, b: 0.4 }],
          roofColor: { r: 0.3, g: 0.2, b: 0.1 },
          windowColor: { r: 0.9, g: 0.9, b: 0.8 },
          doorColor: { r: 0.4, g: 0.3, b: 0.2 },
          materialType: 'wood',
          architectureStyle: 'medieval',
        },
      };
      expect(presets).toBeDefined();
      expect(presets!['commercial_food'].name).toBe('Food District');
    });

    it('npcConfig is nullable on AssetCollection', () => {
      const partial: Pick<AssetCollection, 'npcConfig'> = {
        npcConfig: null,
      };
      expect(partial.npcConfig).toBeNull();
    });

    it('npcConfig accepts NpcConfig data', () => {
      const config: AssetCollection['npcConfig'] = {
        bodyModels: ['male_peasant'],
        clothingPalette: ['#333'],
      };
      expect(config).toBeDefined();
      expect(config!.bodyModels).toHaveLength(1);
    });
  });

  describe('InsertAssetCollection includes new fields', () => {
    it('accepts buildingTypeConfigs in insert schema', () => {
      const insert: Partial<InsertAssetCollection> = {
        name: 'Test Collection',
        collectionType: 'complete_theme',
        buildingTypeConfigs: {
          Restaurant: { mode: 'procedural' },
        },
      };
      expect(insert.buildingTypeConfigs).toBeDefined();
    });

    it('accepts categoryPresets in insert schema', () => {
      const insert: Partial<InsertAssetCollection> = {
        name: 'Test Collection',
        collectionType: 'complete_theme',
        categoryPresets: {
          commercial_food: {
            id: 'p1',
            name: 'Food',
            baseColors: [],
            roofColor: { r: 0, g: 0, b: 0 },
            windowColor: { r: 0, g: 0, b: 0 },
            doorColor: { r: 0, g: 0, b: 0 },
            materialType: 'wood',
            architectureStyle: 'medieval',
          },
        },
      };
      expect(insert.categoryPresets).toBeDefined();
    });

    it('accepts npcConfig in insert schema', () => {
      const insert: Partial<InsertAssetCollection> = {
        name: 'Test Collection',
        collectionType: 'complete_theme',
        npcConfig: {
          bodyModels: ['male_peasant', 'female_peasant'],
          skinTonePalette: ['#FFDFC4'],
        },
      };
      expect(insert.npcConfig).toBeDefined();
    });
  });

  describe('backward compatibility', () => {
    it('existing collections without new fields still work', () => {
      // Simulates an existing document without new fields
      const legacyCollection: Partial<AssetCollection> = {
        id: 'legacy-1',
        name: 'Legacy Collection',
        collectionType: 'complete_theme',
        buildingModels: { tavern: 'tavern.glb' },
        proceduralBuildings: {
          stylePresets: [{
            id: 'preset-1',
            name: 'Default',
            baseColors: [{ r: 0.8, g: 0.7, b: 0.6 }],
            roofColor: { r: 0.3, g: 0.2, b: 0.1 },
            windowColor: { r: 0.9, g: 0.9, b: 0.8 },
            doorColor: { r: 0.4, g: 0.3, b: 0.2 },
            materialType: 'wood',
            architectureStyle: 'medieval',
          }],
        },
        // New fields default to null
        buildingTypeConfigs: null,
        categoryPresets: null,
        npcConfig: null,
      };
      expect(legacyCollection.buildingModels).toBeDefined();
      expect(legacyCollection.proceduralBuildings).toBeDefined();
      expect(legacyCollection.buildingTypeConfigs).toBeNull();
      expect(legacyCollection.categoryPresets).toBeNull();
      expect(legacyCollection.npcConfig).toBeNull();
    });
  });
});
