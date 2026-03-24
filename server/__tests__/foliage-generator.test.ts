import { describe, it, expect } from 'vitest';
import { generateFoliageLayers, type FoliageGeneratorInput } from '../services/game-export/foliage-generator';
import type { SettlementIR } from '@shared/game-engine/ir-types';

function makeSettlement(overrides: Partial<SettlementIR> = {}): SettlementIR {
  return {
    id: 'settlement-1',
    worldId: 'world-1',
    countryId: null,
    stateId: null,
    name: 'Test Town',
    description: null,
    settlementType: 'town',
    terrain: 'forest',
    population: 200,
    foundedYear: null,
    founderIds: [],
    mayorId: null,
    position: { x: 0, y: 0, z: 0 },
    radius: 50,
    elevationProfile: null,
    lots: [],
    businessIds: [],
    internalRoads: [],
    infrastructure: [],
    ...overrides,
  };
}

function makeInput(overrides: Partial<FoliageGeneratorInput> = {}): FoliageGeneratorInput {
  return {
    settlements: [makeSettlement()],
    terrainSize: 256,
    seed: 'test-seed',
    ...overrides,
  };
}

describe('generateFoliageLayers', () => {
  it('returns foliage layers for a forest settlement', () => {
    const layers = generateFoliageLayers(makeInput());
    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      expect(layer.settlementId).toBe('settlement-1');
      expect(layer.biome).toBe('forest');
      expect(layer.instances.length).toBeGreaterThan(0);
      expect(['grass', 'bush', 'flower', 'fern', 'mushroom', 'vine']).toContain(layer.type);
    }
  });

  it('returns empty array when no settlements', () => {
    const layers = generateFoliageLayers(makeInput({ settlements: [] }));
    expect(layers).toEqual([]);
  });

  it('generates fewer instances for desert biome than forest', () => {
    const forestLayers = generateFoliageLayers(makeInput({
      settlements: [makeSettlement({ terrain: 'forest' })],
    }));
    const desertLayers = generateFoliageLayers(makeInput({
      settlements: [makeSettlement({ terrain: 'desert' })],
    }));

    const forestCount = forestLayers.reduce((s, l) => s + l.instances.length, 0);
    const desertCount = desertLayers.reduce((s, l) => s + l.instances.length, 0);
    expect(forestCount).toBeGreaterThan(desertCount);
  });

  it('is deterministic with same seed', () => {
    const a = generateFoliageLayers(makeInput());
    const b = generateFoliageLayers(makeInput());
    expect(a.length).toBe(b.length);
    for (let i = 0; i < a.length; i++) {
      expect(a[i].instances.length).toBe(b[i].instances.length);
      expect(a[i].type).toBe(b[i].type);
    }
  });

  it('produces different results with different seeds', () => {
    const a = generateFoliageLayers(makeInput({ seed: 'seed-a' }));
    const b = generateFoliageLayers(makeInput({ seed: 'seed-b' }));
    const aCount = a.reduce((s, l) => s + l.instances.length, 0);
    const bCount = b.reduce((s, l) => s + l.instances.length, 0);
    const aTypes = a.map(l => l.type).sort().join(',');
    const bTypes = b.map(l => l.type).sort().join(',');
    expect(aCount !== bCount || aTypes !== bTypes).toBe(true);
  });

  it('respects settlement position and radius', () => {
    const center = { x: 100, y: 0, z: -50 };
    const radius = 30;
    const layers = generateFoliageLayers(makeInput({
      settlements: [makeSettlement({ position: center, radius })],
    }));

    for (const layer of layers) {
      for (const inst of layer.instances) {
        const dx = inst.position.x - center.x;
        const dz = inst.position.z - center.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        expect(dist).toBeLessThanOrEqual(radius + 0.1);
      }
    }
  });

  it('uses heightmap data when provided', () => {
    const heightmap = [
      [0.1, 0.2, 0.3, 0.4],
      [0.2, 0.3, 0.4, 0.5],
      [0.3, 0.4, 0.5, 0.6],
      [0.4, 0.5, 0.6, 0.7],
    ];
    const layers = generateFoliageLayers(makeInput({ heightmap, terrainSize: 100 }));
    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      for (const inst of layer.instances) {
        expect(typeof inst.position.y).toBe('number');
      }
    }
  });

  it('produces layers for multiple settlements', () => {
    const settlements = [
      makeSettlement({ id: 's1', position: { x: -100, y: 0, z: 0 }, terrain: 'forest' }),
      makeSettlement({ id: 's2', position: { x: 100, y: 0, z: 0 }, terrain: 'plains' }),
    ];
    const layers = generateFoliageLayers(makeInput({ settlements }));

    const s1Layers = layers.filter(l => l.settlementId === 's1');
    const s2Layers = layers.filter(l => l.settlementId === 's2');
    expect(s1Layers.length).toBeGreaterThan(0);
    expect(s2Layers.length).toBeGreaterThan(0);
    expect(s1Layers[0].biome).toBe('forest');
    expect(s2Layers[0].biome).toBe('plains');
  });

  it('layer fields have valid ranges', () => {
    const layers = generateFoliageLayers(makeInput());
    for (const layer of layers) {
      expect(layer.density).toBeGreaterThan(0);
      expect(layer.density).toBeLessThanOrEqual(1);
      expect(layer.maxSlope).toBeGreaterThan(0);
      expect(layer.maxSlope).toBeLessThanOrEqual(1);
      expect(layer.scaleRange[0]).toBeLessThanOrEqual(layer.scaleRange[1]);
      expect(layer.elevationRange[0]).toBeLessThanOrEqual(layer.elevationRange[1]);
      for (const inst of layer.instances) {
        expect(inst.rotation).toBeGreaterThanOrEqual(0);
        expect(inst.rotation).toBeLessThan(Math.PI * 2 + 0.01);
        expect(inst.scale).toBeGreaterThan(0);
      }
    }
  });

  it('excludes trees from foliage layers', () => {
    const layers = generateFoliageLayers(makeInput());
    for (const layer of layers) {
      expect(layer.type).not.toBe('tree');
    }
  });
});
