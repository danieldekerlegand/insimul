import { describe, it, expect } from 'vitest';
import {
  sampleTerrain,
  classifyElevation,
  terrainSuitability,
  generateTerrainAwarePlacements,
  DEFAULT_CONFIG,
  DEFAULT_RULES,
  type HeightSampler,
  type PlacementBounds,
  type TerrainSample,
} from '../../logic/TerrainVegetationPlacer';

const flatSampler: HeightSampler = () => 1;
const hillSampler: HeightSampler = (x) => x * 0.5; // slope = 0.5 in x direction
const steepSampler: HeightSampler = (x) => x * 2; // slope = 2 in x direction
const highSampler: HeightSampler = () => 9; // alpine

const bounds: PlacementBounds = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };

describe('sampleTerrain', () => {
  it('returns correct height and zero slope for flat terrain', () => {
    const sample = sampleTerrain(0, 0, flatSampler);
    expect(sample.height).toBe(1);
    expect(sample.slope).toBeCloseTo(0, 5);
    expect(sample.x).toBe(0);
    expect(sample.z).toBe(0);
  });

  it('computes slope from gradient', () => {
    const sample = sampleTerrain(0, 0, hillSampler);
    // dx = (h(2,0) - h(-2,0)) / 4 = (1 - (-1)) / 4 = 0.5
    expect(sample.slope).toBeCloseTo(0.5, 2);
  });

  it('computes steep slope correctly', () => {
    const sample = sampleTerrain(0, 0, steepSampler);
    expect(sample.slope).toBeCloseTo(2, 2);
  });
});

describe('classifyElevation', () => {
  it('classifies lowland correctly', () => {
    expect(classifyElevation(0)).toBe('lowland');
    expect(classifyElevation(1.9)).toBe('lowland');
  });

  it('classifies midland correctly', () => {
    expect(classifyElevation(2)).toBe('midland');
    expect(classifyElevation(4.9)).toBe('midland');
  });

  it('classifies highland correctly', () => {
    expect(classifyElevation(5)).toBe('highland');
    expect(classifyElevation(7.9)).toBe('highland');
  });

  it('classifies alpine correctly', () => {
    expect(classifyElevation(8)).toBe('alpine');
    expect(classifyElevation(10)).toBe('alpine');
  });

  it('respects custom thresholds', () => {
    expect(classifyElevation(3, [1, 3, 6])).toBe('highland');
    expect(classifyElevation(0.5, [1, 3, 6])).toBe('lowland');
  });
});

describe('terrainSuitability', () => {
  it('returns high suitability for trees on flat lowland', () => {
    const sample: TerrainSample = { x: 0, z: 0, height: 1, slope: 0 };
    const suit = terrainSuitability(sample, 'tree');
    expect(suit).toBeGreaterThan(0.8);
  });

  it('rejects trees on steep terrain', () => {
    const sample: TerrainSample = { x: 0, z: 0, height: 1, slope: 1.0 };
    const suit = terrainSuitability(sample, 'tree');
    expect(suit).toBe(0); // slope > maxSlope (0.6)
  });

  it('reduces tree suitability at alpine elevation', () => {
    const sample: TerrainSample = { x: 0, z: 0, height: 9, slope: 0 };
    const suit = terrainSuitability(sample, 'tree');
    expect(suit).toBeLessThan(0.5); // alpine is not preferred for trees
  });

  it('prefers rocks on steep/high terrain', () => {
    const steep: TerrainSample = { x: 0, z: 0, height: 6, slope: 0.8 };
    const flat: TerrainSample = { x: 0, z: 0, height: 1, slope: 0 };
    const steepSuit = terrainSuitability(steep, 'rock');
    const flatSuit = terrainSuitability(flat, 'rock');
    expect(steepSuit).toBeGreaterThan(flatSuit);
  });

  it('allows rocks on very steep terrain', () => {
    const sample: TerrainSample = { x: 0, z: 0, height: 6, slope: 1.5 };
    const suit = terrainSuitability(sample, 'rock');
    expect(suit).toBeGreaterThan(0);
  });

  it('rejects flowers on steep slopes', () => {
    const sample: TerrainSample = { x: 0, z: 0, height: 1, slope: 0.6 };
    const suit = terrainSuitability(sample, 'flower');
    expect(suit).toBe(0); // slope > maxSlope (0.5)
  });
});

describe('generateTerrainAwarePlacements', () => {
  // Deterministic RNG for testing
  const seededRng = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };
  };

  it('generates placements within bounds', () => {
    const rng = seededRng(42);
    const results = generateTerrainAwarePlacements(
      'tree', 20, bounds, flatSampler, DEFAULT_CONFIG, DEFAULT_RULES, rng,
    );
    for (const p of results) {
      expect(p.x).toBeGreaterThanOrEqual(bounds.minX);
      expect(p.x).toBeLessThanOrEqual(bounds.maxX);
      expect(p.z).toBeGreaterThanOrEqual(bounds.minZ);
      expect(p.z).toBeLessThanOrEqual(bounds.maxZ);
    }
  });

  it('returns positions on flat terrain for trees', () => {
    const rng = seededRng(123);
    const results = generateTerrainAwarePlacements(
      'tree', 30, bounds, flatSampler, DEFAULT_CONFIG, DEFAULT_RULES, rng,
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(30);
  });

  it('generates few or no trees on steep terrain', () => {
    const rng = seededRng(99);
    const results = generateTerrainAwarePlacements(
      'tree', 30, bounds, steepSampler, DEFAULT_CONFIG, DEFAULT_RULES, rng,
    );
    // Steep terrain (slope ~2) exceeds tree maxSlope (0.6), so all should be rejected
    expect(results.length).toBe(0);
  });

  it('generates rocks even on steep terrain', () => {
    const rng = seededRng(55);
    const results = generateTerrainAwarePlacements(
      'rock', 30, bounds, hillSampler, DEFAULT_CONFIG, DEFAULT_RULES, rng,
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it('respects target count as upper limit', () => {
    const rng = seededRng(77);
    const results = generateTerrainAwarePlacements(
      'grass', 10, bounds, flatSampler, DEFAULT_CONFIG, DEFAULT_RULES, rng,
    );
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('each result has valid terrain data', () => {
    const rng = seededRng(200);
    const results = generateTerrainAwarePlacements(
      'shrub', 15, bounds, hillSampler, DEFAULT_CONFIG, DEFAULT_RULES, rng,
    );
    for (const p of results) {
      expect(typeof p.height).toBe('number');
      expect(typeof p.slope).toBe('number');
      expect(p.slope).toBeGreaterThanOrEqual(0);
    }
  });
});
