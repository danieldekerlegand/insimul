import { describe, it, expect } from 'vitest';
import {
  getElevationZone,
  getMoistureLevel,
  getVegetationForZone,
  getVegetation,
  pickSpecies,
  filterByCategory,
  estimateMoisture,
  ELEVATION_ZONES,
  MOISTURE_LEVELS,
  type ElevationZone,
  type MoistureLevel,
  type BiomeType,
  type PlantSpecies,
} from '../game-engine/vegetation-zones';

describe('getElevationZone', () => {
  it('returns lowland for low elevations', () => {
    expect(getElevationZone(0)).toBe('lowland');
    expect(getElevationZone(0.1)).toBe('lowland');
    expect(getElevationZone(0.24)).toBe('lowland');
  });

  it('returns midland for mid elevations', () => {
    expect(getElevationZone(0.25)).toBe('midland');
    expect(getElevationZone(0.4)).toBe('midland');
    expect(getElevationZone(0.54)).toBe('midland');
  });

  it('returns highland for high elevations', () => {
    expect(getElevationZone(0.55)).toBe('highland');
    expect(getElevationZone(0.7)).toBe('highland');
    expect(getElevationZone(0.79)).toBe('highland');
  });

  it('returns alpine for very high elevations', () => {
    expect(getElevationZone(0.8)).toBe('alpine');
    expect(getElevationZone(0.9)).toBe('alpine');
    expect(getElevationZone(1.0)).toBe('alpine');
  });

  it('clamps out-of-range values', () => {
    expect(getElevationZone(-0.5)).toBe('lowland');
    expect(getElevationZone(1.5)).toBe('alpine');
  });
});

describe('getMoistureLevel', () => {
  it('returns arid for very low moisture', () => {
    expect(getMoistureLevel(0)).toBe('arid');
    expect(getMoistureLevel(0.1)).toBe('arid');
  });

  it('returns dry for low moisture', () => {
    expect(getMoistureLevel(0.2)).toBe('dry');
    expect(getMoistureLevel(0.3)).toBe('dry');
  });

  it('returns moderate for medium moisture', () => {
    expect(getMoistureLevel(0.4)).toBe('moderate');
    expect(getMoistureLevel(0.5)).toBe('moderate');
  });

  it('returns wet for high moisture', () => {
    expect(getMoistureLevel(0.65)).toBe('wet');
    expect(getMoistureLevel(0.75)).toBe('wet');
  });

  it('returns saturated for very high moisture', () => {
    expect(getMoistureLevel(0.85)).toBe('saturated');
    expect(getMoistureLevel(1.0)).toBe('saturated');
  });

  it('clamps out-of-range values', () => {
    expect(getMoistureLevel(-1)).toBe('arid');
    expect(getMoistureLevel(2)).toBe('saturated');
  });
});

describe('ELEVATION_ZONES', () => {
  it('covers the full 0–1 range without gaps', () => {
    expect(ELEVATION_ZONES[0].minElevation).toBe(0);
    for (let i = 1; i < ELEVATION_ZONES.length; i++) {
      expect(ELEVATION_ZONES[i].minElevation).toBe(ELEVATION_ZONES[i - 1].maxElevation);
    }
    expect(ELEVATION_ZONES[ELEVATION_ZONES.length - 1].maxElevation).toBeGreaterThan(1);
  });
});

describe('MOISTURE_LEVELS', () => {
  it('covers the full 0–1 range without gaps', () => {
    expect(MOISTURE_LEVELS[0].minMoisture).toBe(0);
    for (let i = 1; i < MOISTURE_LEVELS.length; i++) {
      expect(MOISTURE_LEVELS[i].minMoisture).toBe(MOISTURE_LEVELS[i - 1].maxMoisture);
    }
    expect(MOISTURE_LEVELS[MOISTURE_LEVELS.length - 1].maxMoisture).toBeGreaterThan(1);
  });
});

describe('getVegetationForZone', () => {
  it('returns species for a registered exact match', () => {
    const species = getVegetationForZone('forest', 'lowland', 'wet');
    expect(species.length).toBeGreaterThan(0);
    expect(species.some(s => s.category === 'tree')).toBe(true);
  });

  it('returns species containing trees for forest biome', () => {
    const species = getVegetationForZone('forest', 'midland', 'moderate');
    const trees = species.filter(s => s.category === 'tree');
    expect(trees.length).toBeGreaterThan(0);
  });

  it('returns cactus/desert plants for desert biome at low elevation', () => {
    const species = getVegetationForZone('desert', 'lowland', 'arid');
    expect(species.some(s => s.id === 'cactus')).toBe(true);
  });

  it('returns alpine vegetation at high elevation', () => {
    const species = getVegetationForZone('mountains', 'alpine', 'moderate');
    expect(species.some(s => s.id === 'lichen' || s.id === 'edelweiss')).toBe(true);
  });

  it('falls back gracefully for unregistered combos', () => {
    // urban + alpine + saturated is not registered
    const species = getVegetationForZone('urban', 'alpine', 'saturated');
    expect(species.length).toBeGreaterThan(0);
  });

  it('returns different species for different elevation zones in same biome', () => {
    const lowland = getVegetationForZone('mountains', 'lowland', 'moderate');
    const alpine = getVegetationForZone('mountains', 'alpine', 'moderate');
    const lowIds = lowland.map(s => s.id).sort();
    const alpineIds = alpine.map(s => s.id).sort();
    expect(lowIds).not.toEqual(alpineIds);
  });

  it('returns different species for different moisture levels', () => {
    const wet = getVegetationForZone('forest', 'lowland', 'wet');
    const dry = getVegetationForZone('forest', 'lowland', 'dry');
    const wetIds = wet.map(s => s.id).sort();
    const dryIds = dry.map(s => s.id).sort();
    expect(wetIds).not.toEqual(dryIds);
  });
});

describe('getVegetation', () => {
  it('resolves numeric elevation and moisture to species', () => {
    const species = getVegetation('forest', 0.1, 0.5);
    expect(species.length).toBeGreaterThan(0);
  });

  it('handles boundary values', () => {
    expect(getVegetation('plains', 0, 0).length).toBeGreaterThan(0);
    expect(getVegetation('plains', 1, 1).length).toBeGreaterThan(0);
  });
});

describe('pickSpecies', () => {
  const testSpecies: PlantSpecies[] = [
    { id: 'a', name: 'A', category: 'tree', density: 1.0, scaleRange: [0.5, 1.5] },
    { id: 'b', name: 'B', category: 'shrub', density: 0.5, scaleRange: [0.3, 0.7] },
  ];

  it('returns a species and scale', () => {
    const result = pickSpecies(testSpecies, () => 0.5);
    expect(result).not.toBeNull();
    expect(result!.species.id).toBeDefined();
    expect(result!.scale).toBeGreaterThanOrEqual(0.3);
    expect(result!.scale).toBeLessThanOrEqual(1.5);
  });

  it('returns null for empty list', () => {
    expect(pickSpecies([], () => 0.5)).toBeNull();
  });

  it('respects density weighting', () => {
    // With roll near 0, should pick high-density species 'a'
    const result = pickSpecies(testSpecies, () => 0.01);
    expect(result!.species.id).toBe('a');
  });

  it('returns scale within species range', () => {
    let callCount = 0;
    const mockRandom = () => {
      callCount++;
      return callCount === 1 ? 0.01 : 0.5; // first call for weight, second for scale
    };
    const result = pickSpecies(testSpecies, mockRandom);
    expect(result!.scale).toBeGreaterThanOrEqual(0.5);
    expect(result!.scale).toBeLessThanOrEqual(1.5);
  });
});

describe('filterByCategory', () => {
  it('filters species by category', () => {
    const all = getVegetationForZone('forest', 'lowland', 'wet');
    const trees = filterByCategory(all, 'tree');
    expect(trees.every(s => s.category === 'tree')).toBe(true);
    expect(trees.length).toBeLessThanOrEqual(all.length);
  });

  it('returns empty array if no species match', () => {
    const desert = getVegetationForZone('desert', 'lowland', 'arid');
    const flowers = filterByCategory(desert, 'flower');
    expect(flowers).toEqual([]);
  });
});

describe('estimateMoisture', () => {
  it('returns high moisture for water-adjacent terrain', () => {
    expect(estimateMoisture('coast', 0.1)).toBeGreaterThan(0.6);
    expect(estimateMoisture('river', 0.1)).toBeGreaterThan(0.7);
    expect(estimateMoisture('swamp', 0.1)).toBeGreaterThan(0.8);
  });

  it('returns low moisture for desert', () => {
    expect(estimateMoisture('desert', 0.3)).toBeLessThan(0.15);
  });

  it('reduces moisture at high elevation', () => {
    const low = estimateMoisture('forest', 0.2);
    const high = estimateMoisture('forest', 0.9);
    expect(high).toBeLessThan(low);
  });

  it('clamps result to 0–1', () => {
    expect(estimateMoisture('desert', 1.0)).toBeGreaterThanOrEqual(0);
    expect(estimateMoisture('swamp', 0.0)).toBeLessThanOrEqual(1);
  });

  it('returns moderate moisture for unknown terrain', () => {
    const result = estimateMoisture('unknown_terrain', 0.3);
    expect(result).toBeGreaterThan(0.2);
    expect(result).toBeLessThan(0.6);
  });
});

describe('all biomes have basic coverage', () => {
  const biomes: BiomeType[] = ['forest', 'plains', 'mountains', 'desert', 'tundra', 'wasteland', 'tropical', 'swamp', 'urban'];

  for (const biome of biomes) {
    it(`${biome} returns species for common zone combos`, () => {
      const species = getVegetation(biome, 0.3, 0.5);
      expect(species.length).toBeGreaterThan(0);
    });
  }
});
