/**
 * Terrain Generator — produces 2D heightmaps from seeded noise.
 * Uses the shared simplex noise module for deterministic generation.
 */

import { createNoise2D, fractalNoise } from '../../shared/procedural/noise';

export type TerrainType = 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
export type SettlementSize = 'hamlet' | 'village' | 'town' | 'city';

export interface TerrainConfig {
  seed: string;
  width: number;
  height: number;
  terrainType: TerrainType;
  resolution?: number; // default 128
}

/** Noise parameters per terrain type */
interface TerrainNoiseParams {
  amplitude: number;
  octaves: number;
  frequency: number;
}

const TERRAIN_PARAMS: Record<TerrainType, TerrainNoiseParams> = {
  plains:    { amplitude: 0.05, octaves: 3, frequency: 1.0 },
  hills:     { amplitude: 0.15, octaves: 4, frequency: 1.0 },
  mountains: { amplitude: 0.40, octaves: 6, frequency: 1.0 },
  coast:     { amplitude: 0.08, octaves: 3, frequency: 1.0 },
  river:     { amplitude: 0.10, octaves: 4, frequency: 1.0 },
  forest:    { amplitude: 0.08, octaves: 3, frequency: 1.0 },
  desert:    { amplitude: 0.12, octaves: 2, frequency: 1.0 },
};

/** Default resolution by settlement size */
const RESOLUTION_BY_SIZE: Record<SettlementSize, number> = {
  hamlet: 64,
  village: 128,
  town: 256,
  city: 512,
};

export type FeatureType = 'peak' | 'valley' | 'canyon' | 'cliff' | 'mesa' | 'crater';

export interface TerrainFeature {
  id: string;
  name: string;
  type: FeatureType;
  position: { x: number; z: number };
  radius: number;
  elevation: number;
}

/** Feature names by terrain type */
const FEATURE_NAMES: Record<FeatureType, string[]> = {
  peak: ['Eagle Peak', 'Iron Summit', 'Cloud Spire', 'Thunder Top', 'Hawk Crest', 'Storm Crown', 'Wolf Fang', 'Sun Pinnacle'],
  valley: ['Green Hollow', 'Whispering Vale', 'Shadow Glen', 'Misty Dell', 'Fern Gulch', 'Silver Basin', 'Quiet Fold', 'Dew Meadow'],
  canyon: ['Red Gorge', 'Echo Rift', 'Serpent Cut', 'Iron Chasm', 'Wind Narrows', 'Bone Ravine', 'Dust Slash', 'Thunder Cleft'],
  cliff: ['Sheer Bluff', 'Falcon Edge', 'Stone Brow', 'Grey Precipice', 'Sky Ledge', 'Granite Face', 'Iron Shelf', 'Wind Scarp'],
  mesa: ['Flat Iron', 'Table Rock', 'Sky Plateau', 'Crown Mesa', 'Red Tabletop', 'Sentinel Flat', 'Amber Platform', 'Sun Table'],
  crater: ['Star Hollow', 'Ring Basin', 'Ash Bowl', 'Moon Pit', 'Impact Sink', 'Cinder Cup', 'Thunder Eye', 'Fallen Circle'],
};

/** Which feature types are appropriate for each terrain type */
const FEATURES_BY_TERRAIN: Record<TerrainType, FeatureType[]> = {
  plains: ['valley', 'mesa'],
  hills: ['peak', 'valley', 'cliff'],
  mountains: ['peak', 'canyon', 'cliff', 'crater'],
  coast: ['cliff', 'valley'],
  river: ['canyon', 'valley'],
  forest: ['valley', 'peak'],
  desert: ['mesa', 'canyon', 'crater'],
};

export class TerrainGenerator {
  /**
   * Get the default resolution for a settlement size.
   */
  static resolutionForSettlement(size: SettlementSize): number {
    return RESOLUTION_BY_SIZE[size];
  }

  /**
   * Generate a 2D heightmap normalized to [0, 1].
   *
   * The returned array is indexed as heightmap[row][col] with dimensions
   * resolution × resolution (default 128).
   */
  generateHeightmap(config: TerrainConfig): number[][] {
    const resolution = config.resolution ?? 128;
    const params = TERRAIN_PARAMS[config.terrainType];
    const noise = createNoise2D(config.seed);

    const heightmap: number[][] = [];

    // Sample noise across the width × height area at the given resolution
    for (let row = 0; row < resolution; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < resolution; col++) {
        // Map grid coords to world coords
        const nx = (col / resolution) * config.width;
        const ny = (row / resolution) * config.height;

        // Get fractal noise value in roughly [-1, 1]
        const raw = fractalNoise(noise, nx, ny, params.octaves, 2.0, 0.5);

        // Scale by amplitude and shift to [0, 1]
        // raw is in [-1,1], amplitude controls how much variation
        // Base elevation is 0.5, variation is ±amplitude
        const value = 0.5 + raw * params.amplitude;

        // Clamp to [0, 1]
        rowData.push(Math.max(0, Math.min(1, value)));
      }
      heightmap.push(rowData);
    }

    // Apply terrain-specific post-processing
    this.applyTerrainModifiers(heightmap, config.terrainType, config.seed, resolution);

    return heightmap;
  }

  /**
   * Apply terrain-type-specific modifications to the heightmap.
   */
  private applyTerrainModifiers(
    heightmap: number[][],
    terrainType: TerrainType,
    seed: string,
    resolution: number,
  ): void {
    switch (terrainType) {
      case 'coast':
        // Gradient from land (left) to sea (right)
        for (let row = 0; row < resolution; row++) {
          for (let col = 0; col < resolution; col++) {
            const gradient = 1 - (col / resolution);
            heightmap[row][col] = heightmap[row][col] * gradient;
          }
        }
        break;

      case 'river':
        // Carve a channel through the center
        {
          const noise = createNoise2D(seed + '_river');
          const centerCol = resolution / 2;
          for (let row = 0; row < resolution; row++) {
            const meander = noise(row * 0.05, 0) * resolution * 0.15;
            const riverCenter = centerCol + meander;
            for (let col = 0; col < resolution; col++) {
              const dist = Math.abs(col - riverCenter);
              const riverWidth = resolution * 0.05;
              if (dist < riverWidth) {
                const depth = 1 - (dist / riverWidth);
                heightmap[row][col] *= (1 - depth * 0.6);
              }
            }
          }
        }
        break;

      // plains, hills, mountains, forest, desert: base noise is sufficient
    }
  }

  // ── Feature stamping ──────────────────────────────────────────────

  /**
   * Stamp a Gaussian peak onto the heightmap at (cx, cz).
   */
  stampPeak(heightmap: number[][], cx: number, cz: number, radius: number, intensity: number = 0.3): void {
    const res = heightmap.length;
    const r2 = radius * radius;
    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res; col++) {
        const dx = col - cx;
        const dz = row - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 < r2 * 4) {
          const g = Math.exp(-d2 / (2 * r2));
          heightmap[row][col] = Math.min(1, heightmap[row][col] + intensity * g);
        }
      }
    }
  }

  /**
   * Stamp an inverse-Gaussian valley channel onto the heightmap.
   */
  stampValley(heightmap: number[][], cx: number, cz: number, radius: number, intensity: number = 0.25): void {
    const res = heightmap.length;
    const r2 = radius * radius;
    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res; col++) {
        const dx = col - cx;
        const dz = row - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 < r2 * 4) {
          const g = Math.exp(-d2 / (2 * r2));
          heightmap[row][col] = Math.max(0, heightmap[row][col] - intensity * g);
        }
      }
    }
  }

  /**
   * Stamp a narrow deep canyon cut onto the heightmap.
   * The canyon runs vertically through (cx, cz).
   */
  stampCanyon(heightmap: number[][], cx: number, cz: number, radius: number, intensity: number = 0.35): void {
    const res = heightmap.length;
    const halfWidth = radius * 0.4;
    for (let row = 0; row < res; row++) {
      const dz = Math.abs(row - cz);
      if (dz > radius) continue;
      for (let col = 0; col < res; col++) {
        const dx = Math.abs(col - cx);
        if (dx < halfWidth) {
          const wallFactor = dx / halfWidth; // 0 at center, 1 at edge
          const lengthFactor = 1 - (dz / radius);
          const depth = intensity * (1 - wallFactor * wallFactor) * lengthFactor;
          heightmap[row][col] = Math.max(0, heightmap[row][col] - depth);
        }
      }
    }
  }

  /**
   * Stamp a step-function cliff onto the heightmap.
   * Creates a sharp elevation change running horizontally through (cx, cz).
   */
  stampCliff(heightmap: number[][], cx: number, cz: number, radius: number, intensity: number = 0.2): void {
    const res = heightmap.length;
    for (let row = 0; row < res; row++) {
      const dz = row - cz;
      if (Math.abs(dz) > radius) continue;
      for (let col = 0; col < res; col++) {
        const dx = Math.abs(col - cx);
        if (dx > radius) continue;
        const blendX = 1 - dx / radius;
        // Sigmoid transition: raises terrain above cliff line, lowers below
        const sharpness = 6 / radius;
        const sigmoid = 1 / (1 + Math.exp(dz * sharpness)); // high above, low below
        const offset = intensity * (sigmoid - 0.5) * 2 * blendX;
        heightmap[row][col] = Math.max(0, Math.min(1, heightmap[row][col] + offset));
      }
    }
  }

  /**
   * Stamp a flat-topped mesa/plateau onto the heightmap.
   */
  stampMesa(heightmap: number[][], cx: number, cz: number, radius: number, intensity: number = 0.2): void {
    const res = heightmap.length;
    const r2 = radius * radius;
    const innerR = radius * 0.6;
    const innerR2 = innerR * innerR;
    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res; col++) {
        const dx = col - cx;
        const dz = row - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 > r2) continue;
        if (d2 <= innerR2) {
          // Flat top
          heightmap[row][col] = Math.min(1, heightmap[row][col] + intensity);
        } else {
          // Steep falloff edge
          const t = (Math.sqrt(d2) - innerR) / (radius - innerR);
          heightmap[row][col] = Math.min(1, heightmap[row][col] + intensity * (1 - t));
        }
      }
    }
  }

  /**
   * Stamp a circular crater depression onto the heightmap.
   */
  stampCrater(heightmap: number[][], cx: number, cz: number, radius: number, intensity: number = 0.3): void {
    const res = heightmap.length;
    const r2 = radius * radius;
    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res; col++) {
        const dx = col - cx;
        const dz = row - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 > r2) continue;
        const dist = Math.sqrt(d2) / radius; // 0 at center, 1 at rim
        // Bowl shape: deeper in center, raised rim
        const rimHeight = Math.exp(-((dist - 0.9) ** 2) / 0.02) * intensity * 0.5;
        const bowlDepth = intensity * (1 - dist * dist);
        heightmap[row][col] = Math.max(0, Math.min(1,
          heightmap[row][col] - bowlDepth + rimHeight
        ));
      }
    }
  }

  // ── Slope & aspect derivation ───────────────────────────────────

  /**
   * Derive a slope map (gradient magnitude) from a heightmap.
   * Returns a 2D array of the same dimensions with slope values (0 = flat).
   * Uses central differences for interior cells, forward/backward at edges.
   */
  deriveSlopeMap(heightmap: number[][]): number[][] {
    const rows = heightmap.length;
    const cols = heightmap[0].length;
    const slope: number[][] = [];

    for (let r = 0; r < rows; r++) {
      const rowData: number[] = [];
      for (let c = 0; c < cols; c++) {
        // dh/dx (horizontal gradient)
        let dx: number;
        if (c === 0) dx = heightmap[r][c + 1] - heightmap[r][c];
        else if (c === cols - 1) dx = heightmap[r][c] - heightmap[r][c - 1];
        else dx = (heightmap[r][c + 1] - heightmap[r][c - 1]) / 2;

        // dh/dz (vertical gradient)
        let dz: number;
        if (r === 0) dz = heightmap[r + 1][c] - heightmap[r][c];
        else if (r === rows - 1) dz = heightmap[r][c] - heightmap[r - 1][c];
        else dz = (heightmap[r + 1][c] - heightmap[r - 1][c]) / 2;

        rowData.push(Math.sqrt(dx * dx + dz * dz));
      }
      slope.push(rowData);
    }

    return slope;
  }

  /**
   * Derive an aspect map (direction of steepest descent) from a heightmap.
   * Returns angles in radians [0, 2π). 0 = north (decreasing row), π/2 = east.
   * Flat areas return 0.
   */
  deriveAspectMap(heightmap: number[][]): number[][] {
    const rows = heightmap.length;
    const cols = heightmap[0].length;
    const aspect: number[][] = [];

    for (let r = 0; r < rows; r++) {
      const rowData: number[] = [];
      for (let c = 0; c < cols; c++) {
        let dx: number;
        if (c === 0) dx = heightmap[r][c + 1] - heightmap[r][c];
        else if (c === cols - 1) dx = heightmap[r][c] - heightmap[r][c - 1];
        else dx = (heightmap[r][c + 1] - heightmap[r][c - 1]) / 2;

        let dz: number;
        if (r === 0) dz = heightmap[r + 1][c] - heightmap[r][c];
        else if (r === rows - 1) dz = heightmap[r][c] - heightmap[r - 1][c];
        else dz = (heightmap[r + 1][c] - heightmap[r - 1][c]) / 2;

        if (dx === 0 && dz === 0) {
          rowData.push(0);
        } else {
          // atan2(-dz, -dx) gives direction of steepest descent
          // Shift to [0, 2π)
          let angle = Math.atan2(-dz, -dx);
          if (angle < 0) angle += 2 * Math.PI;
          rowData.push(angle);
        }
      }
      aspect.push(rowData);
    }

    return aspect;
  }

  /**
   * Check if a cell is buildable (slope below threshold).
   * Default maxSlope = 0.52 radians (~30 degrees).
   * The slope value is a gradient magnitude; convert to angle via atan.
   */
  static isBuildable(slopeMap: number[][], x: number, z: number, maxSlope: number = 0.52): boolean {
    if (z < 0 || z >= slopeMap.length || x < 0 || x >= slopeMap[0].length) return false;
    const slopeAngle = Math.atan(slopeMap[z][x]);
    return slopeAngle <= maxSlope;
  }

  /**
   * Get road traversal cost for a cell.
   * 1.0 for flat terrain, exponentially increasing with slope.
   * Infinity above ~15 degrees (~0.26 rad).
   */
  static getRoadCost(slopeMap: number[][], x: number, z: number): number {
    if (z < 0 || z >= slopeMap.length || x < 0 || x >= slopeMap[0].length) return Infinity;
    const slopeAngle = Math.atan(slopeMap[z][x]);
    const maxRoadSlope = 0.2618; // ~15 degrees in radians
    if (slopeAngle > maxRoadSlope) return Infinity;
    // Exponential cost: 1.0 at flat, rising steeply near limit
    return Math.exp(slopeAngle * 5) - Math.exp(0) + 1; // 1.0 at 0, ~3.7 at 15°
  }

  // ── Feature stamping ──────────────────────────────────────────────

  /**
   * Auto-place 2-5 terrain-appropriate features onto a heightmap.
   * Returns the placed features array.
   */
  stampFeatures(heightmap: number[][], terrainType: TerrainType, seed: string): TerrainFeature[] {
    const noise = createNoise2D(seed + '_features');
    const res = heightmap.length;
    const features: TerrainFeature[] = [];

    // Determine count: 2-5 based on seed
    const countNoise = (noise(0.1, 0.2) + 1) / 2; // [0, 1]
    const count = 2 + Math.floor(countNoise * 4); // 2-5

    const availableTypes = FEATURES_BY_TERRAIN[terrainType];

    for (let i = 0; i < count; i++) {
      // Pick feature type
      const typeIdx = Math.abs(Math.floor((noise(i * 7.3, 1.5) + 1) / 2 * availableTypes.length)) % availableTypes.length;
      const type = availableTypes[typeIdx];

      // Pick position (avoid edges — keep within 15-85% of grid)
      const px = Math.floor(res * 0.15 + (noise(i * 3.7, 2.1) + 1) / 2 * res * 0.7);
      const pz = Math.floor(res * 0.15 + (noise(i * 5.1, 3.3) + 1) / 2 * res * 0.7);

      // Radius: 5-15% of resolution
      const radiusFrac = 0.05 + (noise(i * 2.3, 4.7) + 1) / 2 * 0.10;
      const radius = Math.floor(res * radiusFrac);

      // Pick name
      const names = FEATURE_NAMES[type];
      const nameIdx = Math.abs(Math.floor((noise(i * 11.1, 6.6) + 1) / 2 * names.length)) % names.length;
      const name = names[nameIdx];

      // Stamp it
      const stampMethod = {
        peak: this.stampPeak,
        valley: this.stampValley,
        canyon: this.stampCanyon,
        cliff: this.stampCliff,
        mesa: this.stampMesa,
        crater: this.stampCrater,
      }[type];
      stampMethod.call(this, heightmap, px, pz, radius);

      // Record the elevation at the feature center after stamping
      const elevation = heightmap[pz]?.[px] ?? 0;

      features.push({
        id: `${type}-${i}`,
        name,
        type,
        position: { x: px, z: pz },
        radius,
        elevation,
      });
    }

    return features;
  }
}
