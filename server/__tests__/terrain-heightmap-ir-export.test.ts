/**
 * Tests for terrain heightmap mesh generation in IR export.
 *
 * Verifies that the TerrainGenerator is correctly integrated into the
 * IR pipeline: heightmap generation, slope map derivation, feature
 * stamping, and coordinate conversion from grid to world space.
 */

import { describe, it, expect } from 'vitest';
import { TerrainGenerator, type TerrainType, type TerrainFeature } from '../generators/terrain-generator';
import type { TerrainFeatureIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Mirrors the helper functions from ir-generator.ts
// ─────────────────────────────────────────────

const FEATURE_TYPE_MAP: Record<string, TerrainFeatureIR['featureType']> = {
  peak: 'mountain',
  valley: 'valley',
  canyon: 'canyon',
  cliff: 'cliff',
  mesa: 'mesa',
  crater: 'crater',
};

function terrainFeatureToIR(
  f: TerrainFeature,
  resolution: number,
  terrainSize: number,
): TerrainFeatureIR {
  const half = terrainSize / 2;
  return {
    id: f.id,
    name: f.name,
    featureType: FEATURE_TYPE_MAP[f.type] || 'hill',
    position: {
      x: (f.position.x / resolution) * terrainSize - half,
      y: f.elevation * 20,
      z: (f.position.z / resolution) * terrainSize - half,
    },
    radius: (f.radius / resolution) * terrainSize,
    elevation: f.elevation,
    description: null,
  };
}

function inferDominantTerrain(settlements: any[]): TerrainType {
  const validTypes = new Set<string>([
    'plains', 'hills', 'mountains', 'coast', 'river', 'forest', 'desert',
  ]);
  const counts = new Map<string, number>();
  for (const s of settlements) {
    const t = s.terrain;
    if (t && validTypes.has(t)) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  if (counts.size === 0) return 'plains';
  let best = 'plains';
  let bestCount = 0;
  counts.forEach((c, t) => {
    if (c > bestCount) { best = t; bestCount = c; }
  });
  return best as TerrainType;
}

// ─────────────────────────────────────────────
// Heightmap generation
// ─────────────────────────────────────────────

describe('Terrain heightmap IR export - heightmap generation', () => {
  const generator = new TerrainGenerator();
  const config = {
    seed: 'test-world-123',
    width: 1000,
    height: 1000,
    terrainType: 'hills' as TerrainType,
    resolution: 64,
  };

  it('produces a 2D array of the requested resolution', () => {
    const hm = generator.generateHeightmap(config);
    expect(hm).toHaveLength(64);
    expect(hm[0]).toHaveLength(64);
  });

  it('all values are in [0, 1]', () => {
    const hm = generator.generateHeightmap(config);
    for (const row of hm) {
      for (const v of row) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('is deterministic for the same seed', () => {
    const hm1 = generator.generateHeightmap(config);
    const hm2 = generator.generateHeightmap(config);
    expect(hm1).toEqual(hm2);
  });

  it('differs for different seeds', () => {
    const hm1 = generator.generateHeightmap(config);
    const hm2 = generator.generateHeightmap({ ...config, seed: 'different-seed' });
    // At least some values should differ
    let hasDiff = false;
    for (let r = 0; r < 64 && !hasDiff; r++) {
      for (let c = 0; c < 64 && !hasDiff; c++) {
        if (hm1[r][c] !== hm2[r][c]) hasDiff = true;
      }
    }
    expect(hasDiff).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Slope map derivation
// ─────────────────────────────────────────────

describe('Terrain heightmap IR export - slope map', () => {
  const generator = new TerrainGenerator();

  it('has same dimensions as heightmap', () => {
    const hm = generator.generateHeightmap({
      seed: 'slope-test',
      width: 500,
      height: 500,
      terrainType: 'mountains',
      resolution: 32,
    });
    const slope = generator.deriveSlopeMap(hm);
    expect(slope).toHaveLength(32);
    expect(slope[0]).toHaveLength(32);
  });

  it('flat heightmap produces near-zero slopes', () => {
    // Create a flat heightmap
    const flat: number[][] = Array.from({ length: 16 }, () =>
      Array.from({ length: 16 }, () => 0.5),
    );
    const slope = generator.deriveSlopeMap(flat);
    for (const row of slope) {
      for (const v of row) {
        expect(v).toBeCloseTo(0, 5);
      }
    }
  });

  it('slopes are non-negative', () => {
    const hm = generator.generateHeightmap({
      seed: 'slope-nonneg',
      width: 500,
      height: 500,
      terrainType: 'mountains',
      resolution: 32,
    });
    const slope = generator.deriveSlopeMap(hm);
    for (const row of slope) {
      for (const v of row) {
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ─────────────────────────────────────────────
// Feature stamping & IR conversion
// ─────────────────────────────────────────────

describe('Terrain heightmap IR export - feature stamping', () => {
  const generator = new TerrainGenerator();
  const resolution = 64;
  const terrainSize = 1000;

  it('stamps 2-5 features', () => {
    const hm = generator.generateHeightmap({
      seed: 'feature-test',
      width: terrainSize,
      height: terrainSize,
      terrainType: 'mountains',
      resolution,
    });
    const features = generator.stampFeatures(hm, 'mountains', 'feature-test');
    expect(features.length).toBeGreaterThanOrEqual(2);
    expect(features.length).toBeLessThanOrEqual(5);
  });

  it('features have valid structure', () => {
    const hm = generator.generateHeightmap({
      seed: 'struct-test',
      width: terrainSize,
      height: terrainSize,
      terrainType: 'hills',
      resolution,
    });
    const features = generator.stampFeatures(hm, 'hills', 'struct-test');
    for (const f of features) {
      expect(f.id).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.type).toBeTruthy();
      expect(f.position).toHaveProperty('x');
      expect(f.position).toHaveProperty('z');
      expect(f.radius).toBeGreaterThan(0);
      expect(f.elevation).toBeGreaterThanOrEqual(0);
      expect(f.elevation).toBeLessThanOrEqual(1);
    }
  });
});

describe('Terrain heightmap IR export - feature type mapping', () => {
  it('maps peak to mountain', () => {
    const feature: TerrainFeature = {
      id: 'peak-0', name: 'Eagle Peak', type: 'peak',
      position: { x: 32, z: 32 }, radius: 8, elevation: 0.9,
    };
    const ir = terrainFeatureToIR(feature, 64, 1000);
    expect(ir.featureType).toBe('mountain');
  });

  it('maps valley to valley', () => {
    const feature: TerrainFeature = {
      id: 'valley-0', name: 'Green Hollow', type: 'valley',
      position: { x: 32, z: 32 }, radius: 8, elevation: 0.2,
    };
    const ir = terrainFeatureToIR(feature, 64, 1000);
    expect(ir.featureType).toBe('valley');
  });

  it('maps canyon, cliff, mesa, crater correctly', () => {
    const types: Array<[string, string]> = [
      ['canyon', 'canyon'], ['cliff', 'cliff'], ['mesa', 'mesa'], ['crater', 'crater'],
    ];
    for (const [input, expected] of types) {
      const feature: TerrainFeature = {
        id: `${input}-0`, name: 'Test', type: input as any,
        position: { x: 32, z: 32 }, radius: 8, elevation: 0.5,
      };
      const ir = terrainFeatureToIR(feature, 64, 1000);
      expect(ir.featureType).toBe(expected);
    }
  });
});

// ─────────────────────────────────────────────
// Grid-to-world coordinate conversion
// ─────────────────────────────────────────────

describe('Terrain heightmap IR export - coordinate conversion', () => {
  const resolution = 128;
  const terrainSize = 2000;
  const half = terrainSize / 2;

  it('grid center maps to world origin', () => {
    const feature: TerrainFeature = {
      id: 'center-0', name: 'Center Peak', type: 'peak',
      position: { x: resolution / 2, z: resolution / 2 },
      radius: 10, elevation: 0.8,
    };
    const ir = terrainFeatureToIR(feature, resolution, terrainSize);
    expect(ir.position.x).toBeCloseTo(0, 1);
    expect(ir.position.z).toBeCloseTo(0, 1);
  });

  it('grid origin maps to world -half', () => {
    const feature: TerrainFeature = {
      id: 'origin-0', name: 'Origin', type: 'valley',
      position: { x: 0, z: 0 }, radius: 10, elevation: 0.3,
    };
    const ir = terrainFeatureToIR(feature, resolution, terrainSize);
    expect(ir.position.x).toBeCloseTo(-half, 1);
    expect(ir.position.z).toBeCloseTo(-half, 1);
  });

  it('radius scales from grid to world units', () => {
    const feature: TerrainFeature = {
      id: 'rad-0', name: 'Test', type: 'mesa',
      position: { x: 64, z: 64 }, radius: 16, elevation: 0.5,
    };
    const ir = terrainFeatureToIR(feature, resolution, terrainSize);
    const expectedRadius = (16 / resolution) * terrainSize;
    expect(ir.radius).toBeCloseTo(expectedRadius, 1);
  });

  it('elevation is scaled by elevationScale (20)', () => {
    const feature: TerrainFeature = {
      id: 'elev-0', name: 'Test', type: 'peak',
      position: { x: 64, z: 64 }, radius: 10, elevation: 0.75,
    };
    const ir = terrainFeatureToIR(feature, resolution, terrainSize);
    expect(ir.position.y).toBeCloseTo(0.75 * 20, 1);
  });

  it('description is null', () => {
    const feature: TerrainFeature = {
      id: 'desc-0', name: 'Test', type: 'cliff',
      position: { x: 64, z: 64 }, radius: 10, elevation: 0.5,
    };
    const ir = terrainFeatureToIR(feature, resolution, terrainSize);
    expect(ir.description).toBeNull();
  });
});

// ─────────────────────────────────────────────
// Dominant terrain inference
// ─────────────────────────────────────────────

describe('Terrain heightmap IR export - inferDominantTerrain', () => {
  it('returns plains for empty settlements', () => {
    expect(inferDominantTerrain([])).toBe('plains');
  });

  it('returns plains when no terrains specified', () => {
    const settlements = [{ name: 'Town A' }, { name: 'Town B' }];
    expect(inferDominantTerrain(settlements)).toBe('plains');
  });

  it('picks the most common terrain', () => {
    const settlements = [
      { terrain: 'mountains' },
      { terrain: 'mountains' },
      { terrain: 'forest' },
    ];
    expect(inferDominantTerrain(settlements)).toBe('mountains');
  });

  it('ignores invalid terrain values', () => {
    const settlements = [
      { terrain: 'swamp' },    // invalid
      { terrain: 'tundra' },   // invalid
      { terrain: 'desert' },   // valid
    ];
    expect(inferDominantTerrain(settlements)).toBe('desert');
  });

  it('returns plains when all terrains are invalid', () => {
    const settlements = [
      { terrain: 'swamp' },
      { terrain: 'tundra' },
    ];
    expect(inferDominantTerrain(settlements)).toBe('plains');
  });
});

// ─────────────────────────────────────────────
// Full pipeline integration
// ─────────────────────────────────────────────

describe('Terrain heightmap IR export - full pipeline', () => {
  it('generates heightmap, slopes, and features for geography IR', () => {
    const generator = new TerrainGenerator();
    const seed = 'integration-test';
    const terrainSize = 800;
    const resolution = 64;
    const terrainType: TerrainType = 'hills';

    // Generate heightmap
    const heightmap = generator.generateHeightmap({
      seed,
      width: terrainSize,
      height: terrainSize,
      terrainType,
      resolution,
    });

    // Stamp features
    const features = generator.stampFeatures(heightmap, terrainType, seed);

    // Derive slope map
    const slopeMap = generator.deriveSlopeMap(heightmap);

    // Convert features to IR
    const featureIRs = features.map(f => terrainFeatureToIR(f, resolution, terrainSize));

    // Verify geography IR shape
    const geography = {
      terrainSize,
      heightmap,
      slopeMap,
      terrainFeatures: featureIRs,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
    };

    expect(geography.heightmap).toHaveLength(resolution);
    expect(geography.slopeMap).toHaveLength(resolution);
    expect(geography.terrainFeatures.length).toBeGreaterThanOrEqual(2);
    expect(geography.terrainSize).toBe(terrainSize);

    // All feature positions should be within world bounds
    const half = terrainSize / 2;
    for (const f of geography.terrainFeatures) {
      expect(f.position.x).toBeGreaterThanOrEqual(-half);
      expect(f.position.x).toBeLessThanOrEqual(half);
      expect(f.position.z).toBeGreaterThanOrEqual(-half);
      expect(f.position.z).toBeLessThanOrEqual(half);
    }
  });
});
