/**
 * Settlement Elevation Profile
 *
 * Computes elevation statistics for a settlement by sampling a heightmap
 * within the settlement's circular footprint. Produces min, max, mean
 * elevation and a slope classification for UI/map display.
 */

import type { ElevationProfileIR } from '../../shared/game-engine/ir-types';

export interface SettlementElevationInput {
  /** Center X in world space */
  centerX: number;
  /** Center Z in world space */
  centerZ: number;
  /** Settlement radius in world units */
  radius: number;
}

/**
 * Sample a heightmap at a world-space position.
 * The heightmap covers a square region centered on the origin with half-size `mapExtent`.
 * Returns the raw [0,1] heightmap value; multiply by elevationScale for world units.
 */
export function sampleHeightmap(
  heightmap: number[][],
  worldX: number,
  worldZ: number,
  mapExtent: number,
): number {
  const resolution = heightmap.length;
  if (resolution === 0) return 0;

  const u = (worldX + mapExtent) / (2 * mapExtent);
  const v = (worldZ + mapExtent) / (2 * mapExtent);

  const col = Math.min(Math.max(Math.floor(u * resolution), 0), resolution - 1);
  const row = Math.min(Math.max(Math.floor(v * resolution), 0), resolution - 1);

  return heightmap[row][col];
}

/**
 * Classify slope based on elevation range relative to settlement diameter.
 * The ratio (elevationRange / diameter) maps to intuitive slope categories.
 */
function classifySlope(elevationRange: number, diameter: number): ElevationProfileIR['slopeClass'] {
  if (diameter <= 0) return 'flat';
  const ratio = elevationRange / diameter;
  if (ratio < 0.02) return 'flat';
  if (ratio < 0.08) return 'gentle';
  if (ratio < 0.20) return 'moderate';
  if (ratio < 0.40) return 'steep';
  return 'extreme';
}

/**
 * Compute the elevation profile for a settlement by sampling the heightmap
 * at evenly distributed points within the settlement's circular footprint.
 *
 * @param settlement - position and radius of the settlement
 * @param heightmap - 2D array [row][col] with normalised values [0,1]
 * @param mapExtent - half-size of the area the heightmap covers (world units)
 * @param elevationScale - multiplier converting [0,1] to world elevation units (default 20)
 * @param sampleDensity - number of sample points along each axis (default 8)
 */
export function computeElevationProfile(
  settlement: SettlementElevationInput,
  heightmap: number[][],
  mapExtent: number,
  elevationScale: number = 20,
  sampleDensity: number = 8,
): ElevationProfileIR {
  const { centerX, centerZ, radius } = settlement;
  const r = Math.max(radius, 1);

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;

  // Sample a grid within the settlement's bounding square, keeping only
  // points inside the circular footprint.
  const step = (2 * r) / sampleDensity;
  for (let xi = 0; xi < sampleDensity; xi++) {
    for (let zi = 0; zi < sampleDensity; zi++) {
      const wx = centerX - r + (xi + 0.5) * step;
      const wz = centerZ - r + (zi + 0.5) * step;

      // Skip points outside the circle
      const dx = wx - centerX;
      const dz = wz - centerZ;
      if (dx * dx + dz * dz > r * r) continue;

      const raw = sampleHeightmap(heightmap, wx, wz, mapExtent);
      const elev = raw * elevationScale;

      if (elev < min) min = elev;
      if (elev > max) max = elev;
      sum += elev;
      count++;
    }
  }

  // Fallback for degenerate cases (very small radius or no samples)
  if (count === 0) {
    const centerElev = sampleHeightmap(heightmap, centerX, centerZ, mapExtent) * elevationScale;
    return {
      minElevation: centerElev,
      maxElevation: centerElev,
      meanElevation: centerElev,
      elevationRange: 0,
      slopeClass: 'flat',
    };
  }

  const elevationRange = max - min;
  const meanElevation = sum / count;
  const diameter = 2 * r;

  return {
    minElevation: round2(min),
    maxElevation: round2(max),
    meanElevation: round2(meanElevation),
    elevationRange: round2(elevationRange),
    slopeClass: classifySlope(elevationRange, diameter),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
