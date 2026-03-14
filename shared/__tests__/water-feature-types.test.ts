/**
 * Tests for water feature schema and IR types (US-033)
 */
import { describe, it, expect } from 'vitest';
import type { WaterFeatureType, WaterFeatureStyleData, Color3, Vec3 } from '../game-engine/types';
import type { WaterFeatureIR, GeographyIR, BoundsIR } from '../game-engine/ir-types';
import { waterFeatures, insertWaterFeatureSchema } from '../schema';

describe('Water Feature Types', () => {
  describe('WaterFeatureType', () => {
    it('accepts all valid water feature types', () => {
      const types: WaterFeatureType[] = [
        'river', 'lake', 'ocean', 'pond', 'stream', 'waterfall', 'marsh', 'canal',
      ];
      expect(types).toHaveLength(8);
    });
  });

  describe('WaterFeatureStyleData', () => {
    it('can be constructed with all required fields', () => {
      const style: WaterFeatureStyleData = {
        name: 'Clear River',
        waterType: 'river',
        color: { r: 0.2, g: 0.5, b: 0.8 },
        transparency: 0.3,
        flowSpeed: 2.5,
        waveIntensity: 0.5,
      };
      expect(style.waterType).toBe('river');
      expect(style.flowSpeed).toBe(2.5);
    });

    it('supports optional assetSetId', () => {
      const style: WaterFeatureStyleData = {
        name: 'Ocean',
        waterType: 'ocean',
        color: { r: 0.0, g: 0.3, b: 0.7 },
        transparency: 0.4,
        flowSpeed: 0,
        waveIntensity: 1.0,
        assetSetId: 'ocean-tropical',
      };
      expect(style.assetSetId).toBe('ocean-tropical');
    });
  });

  describe('WaterFeatureIR', () => {
    const sampleBounds: BoundsIR = {
      minX: -50, maxX: 50, minZ: -30, maxZ: 30, centerX: 0, centerZ: 0,
    };

    it('can represent a river', () => {
      const river: WaterFeatureIR = {
        id: 'wf-river-1',
        worldId: 'world-1',
        type: 'river',
        subType: 'fresh',
        name: 'Silverstream River',
        position: { x: 0, y: 5, z: 0 },
        waterLevel: 5,
        bounds: sampleBounds,
        depth: 3,
        width: 12,
        flowDirection: { x: 1, y: 0, z: 0 },
        flowSpeed: 2.0,
        shorelinePoints: [
          { x: -50, y: 5, z: -6 },
          { x: 0, y: 5, z: -6 },
          { x: 50, y: 5, z: -6 },
        ],
        settlementId: 'settlement-1',
        biome: 'temperate_forest',
        isNavigable: true,
        isDrinkable: true,
        modelAssetKey: null,
        color: { r: 0.2, g: 0.5, b: 0.7 },
        transparency: 0.3,
      };
      expect(river.type).toBe('river');
      expect(river.flowDirection).not.toBeNull();
      expect(river.isDrinkable).toBe(true);
    });

    it('can represent a lake (still water)', () => {
      const lake: WaterFeatureIR = {
        id: 'wf-lake-1',
        worldId: 'world-1',
        type: 'lake',
        subType: 'fresh',
        name: 'Mirror Lake',
        position: { x: 100, y: 10, z: 200 },
        waterLevel: 10,
        bounds: { minX: 80, maxX: 120, minZ: 180, maxZ: 220, centerX: 100, centerZ: 200 },
        depth: 8,
        width: 40,
        flowDirection: null,
        flowSpeed: 0,
        shorelinePoints: [],
        settlementId: null,
        biome: 'temperate_forest',
        isNavigable: true,
        isDrinkable: true,
        modelAssetKey: null,
        color: null,
        transparency: 0.25,
      };
      expect(lake.type).toBe('lake');
      expect(lake.flowDirection).toBeNull();
      expect(lake.flowSpeed).toBe(0);
    });

    it('can represent an ocean (salt water)', () => {
      const ocean: WaterFeatureIR = {
        id: 'wf-ocean-1',
        worldId: 'world-1',
        type: 'ocean',
        subType: 'salt',
        name: 'Eastern Sea',
        position: { x: 500, y: 0, z: 0 },
        waterLevel: 0,
        bounds: { minX: 400, maxX: 1000, minZ: -500, maxZ: 500, centerX: 700, centerZ: 0 },
        depth: 50,
        width: 600,
        flowDirection: { x: 0, y: 0, z: 1 },
        flowSpeed: 0.5,
        shorelinePoints: [],
        settlementId: 'port-town-1',
        biome: 'coastal',
        isNavigable: true,
        isDrinkable: false,
        modelAssetKey: null,
        color: { r: 0.0, g: 0.3, b: 0.6 },
        transparency: 0.4,
      };
      expect(ocean.isDrinkable).toBe(false);
      expect(ocean.subType).toBe('salt');
    });
  });

  describe('GeographyIR integration', () => {
    it('includes waterFeatures array in GeographyIR', () => {
      const geo: GeographyIR = {
        terrainSize: 1000,
        countries: [],
        states: [],
        settlements: [],
        waterFeatures: [],
      };
      expect(geo.waterFeatures).toEqual([]);
    });
  });

  describe('waterFeatures schema table', () => {
    it('is defined as a pgTable', () => {
      expect(waterFeatures).toBeDefined();
    });

    it('has the expected column names', () => {
      const columns = Object.keys(waterFeatures);
      expect(columns).toContain('id');
      expect(columns).toContain('worldId');
      expect(columns).toContain('type');
      expect(columns).toContain('subType');
      expect(columns).toContain('name');
      expect(columns).toContain('position');
      expect(columns).toContain('waterLevel');
      expect(columns).toContain('bounds');
      expect(columns).toContain('depth');
      expect(columns).toContain('width');
      expect(columns).toContain('flowDirection');
      expect(columns).toContain('flowSpeed');
      expect(columns).toContain('shorelinePoints');
      expect(columns).toContain('biome');
      expect(columns).toContain('isNavigable');
      expect(columns).toContain('isDrinkable');
      expect(columns).toContain('modelAssetKey');
      expect(columns).toContain('color');
      expect(columns).toContain('transparency');
      expect(columns).toContain('settlementId');
      expect(columns).toContain('createdAt');
      expect(columns).toContain('updatedAt');
    });
  });

  describe('insertWaterFeatureSchema', () => {
    it('validates a valid water feature insert', () => {
      const validInsert = {
        worldId: 'world-1',
        type: 'river',
        subType: 'fresh',
        name: 'Test River',
        waterLevel: 5,
        depth: 3,
        width: 10,
        flowSpeed: 2,
      };
      const result = insertWaterFeatureSchema.safeParse(validInsert);
      expect(result.success).toBe(true);
    });

    it('requires worldId', () => {
      const invalid = {
        type: 'lake',
        subType: 'fresh',
        name: 'Test Lake',
        waterLevel: 10,
        depth: 5,
        width: 20,
        flowSpeed: 0,
      };
      const result = insertWaterFeatureSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('requires name', () => {
      const invalid = {
        worldId: 'world-1',
        type: 'pond',
        subType: 'fresh',
        waterLevel: 3,
        depth: 1,
        width: 5,
        flowSpeed: 0,
      };
      const result = insertWaterFeatureSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('excludes id, createdAt, updatedAt from insert schema', () => {
      const withId = {
        id: 'should-be-ignored',
        worldId: 'world-1',
        type: 'stream',
        subType: 'fresh',
        name: 'Test Stream',
        waterLevel: 8,
        depth: 1,
        width: 3,
        flowSpeed: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = insertWaterFeatureSchema.safeParse(withId);
      // Should still succeed — extra fields are stripped by zod
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('id');
        expect(result.data).not.toHaveProperty('createdAt');
        expect(result.data).not.toHaveProperty('updatedAt');
      }
    });
  });
});
