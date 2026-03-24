/**
 * Foliage & Vegetation Scatter Generator
 *
 * Generates FoliageLayerIR[] for each settlement based on biome,
 * elevation, moisture, and terrain slope data from the heightmap.
 */

import type { FoliageLayerIR, FoliageInstanceIR, FoliageType, SettlementIR } from '@shared/game-engine/ir-types';
import type { PlantCategory } from '@shared/game-engine/vegetation-zones';
import {
  getVegetationForZone,
  getElevationZone,
  getMoistureLevel,
  estimateMoisture,
  filterByCategory,
  pickSpecies,
  type BiomeType,
  type ElevationZone,
  type MoistureLevel,
} from '@shared/game-engine/vegetation-zones';

// ─── Constants ─────────────────────────────────────────────────────────────

/** Map plant categories to foliage types */
const CATEGORY_TO_FOLIAGE: Record<PlantCategory, FoliageType | null> = {
  tree: null,       // Trees are NatureObjectIR, not foliage
  shrub: 'bush',
  groundcover: 'fern',
  flower: 'flower',
  grass: 'grass',
};

/** Biome density multipliers (higher = more foliage) */
const BIOME_DENSITY: Record<string, number> = {
  forest: 0.9,
  tropical: 0.95,
  swamp: 0.85,
  plains: 0.6,
  mountains: 0.4,
  tundra: 0.3,
  desert: 0.15,
  wasteland: 0.1,
  urban: 0.2,
};

/** Max slope before foliage placement is rejected (normalised 0–1) */
const MAX_SLOPE_BY_TYPE: Record<FoliageType, number> = {
  grass: 0.7,
  bush: 0.5,
  flower: 0.6,
  fern: 0.55,
  mushroom: 0.4,
  vine: 0.8,
};

/** Target instance count range per settlement */
const MIN_INSTANCES = 500;
const MAX_INSTANCES = 2000;

/** Minimum spacing between instances (Poisson disk approximation) */
const MIN_SPACING = 1.5;

// ─── Terrain Helpers ───────────────────────────────────────────────────────

function sampleGrid(
  grid: number[][] | undefined,
  worldX: number,
  worldZ: number,
  terrainSize: number,
  fallback: number,
): number {
  if (!grid || grid.length === 0) return fallback;
  const res = grid.length;
  const half = terrainSize / 2;
  const u = Math.max(0, Math.min(1, (worldX + half) / terrainSize));
  const v = Math.max(0, Math.min(1, (worldZ + half) / terrainSize));
  const row = Math.min(res - 1, Math.max(0, Math.floor(v * (res - 1))));
  const col = Math.min(res - 1, Math.max(0, Math.floor(u * (res - 1))));
  return grid[row]?.[col] ?? fallback;
}

function terrainToBiome(terrain: string | null): BiomeType {
  const map: Record<string, BiomeType> = {
    forest: 'forest',
    plains: 'plains',
    hills: 'mountains',
    mountains: 'mountains',
    coast: 'tropical',
    river: 'plains',
    desert: 'desert',
    tundra: 'tundra',
    swamp: 'swamp',
  };
  return map[terrain || ''] || 'plains';
}

// ─── Poisson Disk Sampling (approximate) ───────────────────────────────────

interface Candidate {
  x: number;
  z: number;
}

function poissonDiskSample(
  centerX: number,
  centerZ: number,
  radius: number,
  count: number,
  spacing: number,
  rand: () => number,
): Candidate[] {
  const results: Candidate[] = [];
  const maxAttempts = count * 4;

  for (let attempt = 0; attempt < maxAttempts && results.length < count; attempt++) {
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * radius;
    const x = centerX + Math.cos(angle) * r;
    const z = centerZ + Math.sin(angle) * r;

    // Check minimum spacing against existing points (brute force, fast enough for ≤2000)
    let tooClose = false;
    for (const p of results) {
      const dx = p.x - x;
      const dz = p.z - z;
      if (dx * dx + dz * dz < spacing * spacing) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      results.push({ x, z });
    }
  }
  return results;
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface FoliageGeneratorInput {
  settlements: SettlementIR[];
  heightmap?: number[][];
  slopeMap?: number[][];
  terrainSize: number;
  seed: string;
}

/**
 * Generate foliage scatter layers for all settlements.
 */
export function generateFoliageLayers(input: FoliageGeneratorInput): FoliageLayerIR[] {
  const { settlements, heightmap, slopeMap, terrainSize, seed } = input;
  const layers: FoliageLayerIR[] = [];

  for (const settlement of settlements) {
    const biome = terrainToBiome(settlement.terrain);
    const biomeDensity = BIOME_DENSITY[biome] ?? 0.5;
    const targetCount = Math.round(MIN_INSTANCES + biomeDensity * (MAX_INSTANCES - MIN_INSTANCES));

    // Create seeded RNG for this settlement
    const rand = createSeededRandom(`${seed}_foliage_${settlement.id}`);

    // Sample candidate positions via Poisson disk
    const candidates = poissonDiskSample(
      settlement.position.x,
      settlement.position.z,
      settlement.radius,
      targetCount,
      MIN_SPACING,
      rand,
    );

    // Group instances by foliage type
    const layerMap = new Map<string, {
      type: FoliageType;
      instances: FoliageInstanceIR[];
      scaleMin: number;
      scaleMax: number;
      elevMin: number;
      elevMax: number;
    }>();

    for (const candidate of candidates) {
      const elev = sampleGrid(heightmap, candidate.x, candidate.z, terrainSize, 0.3);
      const slope = sampleGrid(slopeMap, candidate.x, candidate.z, terrainSize, 0);
      const moisture = estimateMoisture(settlement.terrain || 'plains', elev);

      const elevZone = getElevationZone(elev);
      const moistLevel = getMoistureLevel(moisture);
      const species = getVegetationForZone(biome, elevZone, moistLevel);

      // Filter to foliage-eligible categories (exclude trees)
      const foliageSpecies = species.filter(s => CATEGORY_TO_FOLIAGE[s.category] !== null);
      if (foliageSpecies.length === 0) continue;

      const pick = pickSpecies(foliageSpecies, rand);
      if (!pick) continue;

      const foliageType = CATEGORY_TO_FOLIAGE[pick.species.category];
      if (!foliageType) continue;

      // Reject based on slope
      if (slope > (MAX_SLOPE_BY_TYPE[foliageType] ?? 0.5)) continue;

      const layerKey = `${foliageType}_${pick.species.id}`;
      let layer = layerMap.get(layerKey);
      if (!layer) {
        layer = {
          type: foliageType,
          instances: [],
          scaleMin: pick.scale,
          scaleMax: pick.scale,
          elevMin: elev,
          elevMax: elev,
        };
        layerMap.set(layerKey, layer);
      }

      layer.instances.push({
        position: { x: candidate.x, y: elev * terrainSize * 0.1, z: candidate.z },
        rotation: rand() * Math.PI * 2,
        scale: pick.scale,
        speciesId: pick.species.id,
      });

      layer.scaleMin = Math.min(layer.scaleMin, pick.scale);
      layer.scaleMax = Math.max(layer.scaleMax, pick.scale);
      layer.elevMin = Math.min(layer.elevMin, elev);
      layer.elevMax = Math.max(layer.elevMax, elev);
    }

    // Convert grouped data to FoliageLayerIR
    layerMap.forEach((data) => {
      const ft: FoliageType = data.type;
      layers.push({
        type: ft,
        biome,
        settlementId: settlement.id,
        density: biomeDensity,
        scaleRange: [data.scaleMin, data.scaleMax],
        maxSlope: MAX_SLOPE_BY_TYPE[ft] ?? 0.5,
        elevationRange: [data.elevMin, data.elevMax],
        instances: data.instances,
      });
    });
  }

  return layers;
}

// ─── Seeded PRNG (matches ir-generator.ts) ────────────────────────────────

function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = Math.abs((hash * 9301 + 49297) % 233280);
    return hash / 233280;
  };
}
