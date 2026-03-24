/**
 * Tests for animal population generation in the IR generator.
 */

import { describe, it, expect } from 'vitest';
import { generateAnimals, getAnimalCounts } from '../services/game-export/ir-generator';
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
    terrain: 'grassland',
    population: 100,
    foundedYear: 1800,
    founderIds: [],
    mayorId: null,
    position: { x: 0, y: 0, z: 0 },
    radius: 50,
    elevationProfile: null,
    lots: [],
    ...overrides,
  } as SettlementIR;
}

describe('getAnimalCounts', () => {
  it('returns zero counts for zero population', () => {
    expect(getAnimalCounts(0)).toEqual({ cats: 0, dogs: 0, birds: 0 });
  });

  it('returns zero counts for negative population', () => {
    expect(getAnimalCounts(-10)).toEqual({ cats: 0, dogs: 0, birds: 0 });
  });

  it('returns small counts for small population', () => {
    const counts = getAnimalCounts(5);
    expect(counts.cats).toBeGreaterThanOrEqual(1);
    expect(counts.dogs).toBeGreaterThanOrEqual(1);
    expect(counts.birds).toBeGreaterThanOrEqual(1);
  });

  it('scales counts with population', () => {
    const small = getAnimalCounts(10);
    const large = getAnimalCounts(1000);
    expect(large.cats).toBeGreaterThanOrEqual(small.cats);
    expect(large.dogs).toBeGreaterThanOrEqual(small.dogs);
    expect(large.birds).toBeGreaterThanOrEqual(small.birds);
  });

  it('caps animal counts at reasonable maximums', () => {
    const counts = getAnimalCounts(1000000);
    expect(counts.cats).toBeLessThanOrEqual(6);
    expect(counts.dogs).toBeLessThanOrEqual(5);
    expect(counts.birds).toBeLessThanOrEqual(8);
  });
});

describe('generateAnimals', () => {
  it('returns empty array for no settlements', () => {
    expect(generateAnimals([], 'test-seed')).toEqual([]);
  });

  it('generates animals for a settlement', () => {
    const settlements = [makeSettlement({ population: 100 })];
    const animals = generateAnimals(settlements, 'test-seed');
    expect(animals.length).toBeGreaterThan(0);
  });

  it('generates all three species', () => {
    const settlements = [makeSettlement({ population: 200 })];
    const animals = generateAnimals(settlements, 'test-seed');
    const species = new Set(animals.map(a => a.species));
    expect(species.has('cat')).toBe(true);
    expect(species.has('dog')).toBe(true);
    expect(species.has('bird')).toBe(true);
  });

  it('assigns unique IDs to each animal', () => {
    const settlements = [makeSettlement({ population: 500 })];
    const animals = generateAnimals(settlements, 'test-seed');
    const ids = new Set(animals.map(a => a.id));
    expect(ids.size).toBe(animals.length);
  });

  it('places animals near settlement center', () => {
    const cx = 100, cz = 200, radius = 50;
    const settlements = [makeSettlement({
      position: { x: cx, y: 0, z: cz },
      radius,
      population: 100,
    })];
    const animals = generateAnimals(settlements, 'test-seed');
    for (const animal of animals) {
      const dx = animal.position.x - cx;
      const dz = animal.position.z - cz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      expect(dist).toBeLessThanOrEqual(radius);
    }
  });

  it('produces deterministic output with same seed', () => {
    const settlements = [makeSettlement({ population: 100 })];
    const a = generateAnimals(settlements, 'deterministic');
    const b = generateAnimals(settlements, 'deterministic');
    expect(a).toEqual(b);
  });

  it('produces different output with different seeds', () => {
    const settlements = [makeSettlement({ population: 100 })];
    const a = generateAnimals(settlements, 'seed-a');
    const b = generateAnimals(settlements, 'seed-b');
    // At least some positions should differ
    const positionsA = a.map(an => `${an.position.x},${an.position.z}`);
    const positionsB = b.map(an => `${an.position.x},${an.position.z}`);
    expect(positionsA).not.toEqual(positionsB);
  });

  it('generates more animals for larger settlements', () => {
    const small = [makeSettlement({ id: 's1', population: 10 })];
    const large = [makeSettlement({ id: 's2', population: 5000 })];
    const smallAnimals = generateAnimals(small, 'test');
    const largeAnimals = generateAnimals(large, 'test');
    expect(largeAnimals.length).toBeGreaterThan(smallAnimals.length);
  });

  it('generates animals for multiple settlements', () => {
    const settlements = [
      makeSettlement({ id: 's1', position: { x: 0, y: 0, z: 0 }, population: 100 }),
      makeSettlement({ id: 's2', position: { x: 200, y: 0, z: 200 }, population: 100 }),
    ];
    const animals = generateAnimals(settlements, 'test');
    // Should have animals from both settlements
    const fromS1 = animals.filter(a => a.id.includes('s1'));
    const fromS2 = animals.filter(a => a.id.includes('s2'));
    expect(fromS1.length).toBeGreaterThan(0);
    expect(fromS2.length).toBeGreaterThan(0);
  });

  it('sets valid animal properties', () => {
    const settlements = [makeSettlement({ population: 100 })];
    const animals = generateAnimals(settlements, 'test-seed');
    for (const animal of animals) {
      expect(animal.speed).toBeGreaterThan(0);
      expect(animal.scale).toBeGreaterThan(0);
      expect(animal.wanderRadius).toBeGreaterThan(0);
      expect(animal.rotation).toBeGreaterThanOrEqual(0);
      expect(animal.rotation).toBeLessThan(Math.PI * 2);
      expect(animal.color).toHaveProperty('r');
      expect(animal.color).toHaveProperty('g');
      expect(animal.color).toHaveProperty('b');
      expect(animal.vocabularyWord).toBeTruthy();
      expect(animal.vocabularyCategory).toBe('animals');
      // homePosition should match initial position
      expect(animal.homePosition).toEqual(animal.position);
    }
  });

  it('skips zero-population settlements', () => {
    const settlements = [makeSettlement({ population: 0 })];
    const animals = generateAnimals(settlements, 'test');
    expect(animals).toEqual([]);
  });
});
