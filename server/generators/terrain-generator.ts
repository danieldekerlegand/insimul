/**
 * Terrain Generator — produces 2D heightmaps from seeded noise.
 * Uses the shared simplex noise module for deterministic generation.
 */

import { createNoise2D, fractalNoise } from '../../shared/procedural/noise';

export type TerrainType = 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
export type SettlementSize = 'village' | 'town' | 'city';

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
  village: 128,
  town: 256,
  city: 512,
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
}
