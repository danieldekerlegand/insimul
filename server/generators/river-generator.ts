/**
 * Procedural River Generator
 *
 * Generates river path data for worlds/settlements. Rivers flow from
 * high-elevation source points downhill, merging when tributaries converge.
 * Output is an array of RiverPath objects that can be rendered client-side
 * or stored as part of settlement geography.
 */

export interface RiverPoint {
  x: number;
  z: number;
  width: number; // River width at this point (grows downstream)
}

export interface RiverPath {
  id: string;
  name: string;
  points: RiverPoint[];
  tributaryOf?: string; // Parent river ID if this is a tributary
}

export interface RiverGenerationConfig {
  terrainSize: number;
  riverCount: number;
  terrain: string; // plains, hills, mountains, coast, river, forest, desert
  seed?: number;
}

/** Seeded PRNG (mulberry32) for deterministic generation */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RIVER_NAMES = [
  'Silver Creek', 'Clearwater River', 'Stonebrook', 'Willowrun',
  'Deep Fork', 'Muddy Branch', 'Cedar Creek', 'Mill Stream',
  'Coldwater Run', 'Ironbrook', 'Serpent River', 'Pine Creek',
  'Elk Run', 'Bear Creek', 'Eagle River', 'Fox Run',
  'Otter Creek', 'Hawk River', 'Deer Brook', 'Wolf Creek',
];

export class RiverGenerator {
  /**
   * Generate river paths for a world region.
   *
   * @param config Generation parameters
   * @param sampleHeight Optional heightmap callback (x, z) => y.
   *   When provided, rivers flow downhill via gradient descent.
   *   When omitted, rivers use sinusoidal meandering paths.
   */
  generate(
    config: RiverGenerationConfig,
    sampleHeight?: (x: number, z: number) => number,
  ): RiverPath[] {
    const rand = mulberry32(config.seed ?? Date.now());
    const count = this.getRiverCount(config);
    const halfSize = config.terrainSize / 2;
    const rivers: RiverPath[] = [];

    for (let i = 0; i < count; i++) {
      const name = RIVER_NAMES[Math.floor(rand() * RIVER_NAMES.length)];
      const id = `river_${i}`;

      // Pick a source point near terrain edges
      const edge = Math.floor(rand() * 4); // 0=north, 1=east, 2=south, 3=west
      const edgeOffset = (rand() - 0.5) * config.terrainSize * 0.6;
      let startX: number, startZ: number;

      switch (edge) {
        case 0: startX = edgeOffset; startZ = -halfSize + 20; break;
        case 1: startX = halfSize - 20; startZ = edgeOffset; break;
        case 2: startX = edgeOffset; startZ = halfSize - 20; break;
        default: startX = -halfSize + 20; startZ = edgeOffset; break;
      }

      const points = sampleHeight
        ? this.traceDownhill(startX, startZ, halfSize, sampleHeight, rand)
        : this.traceMeandering(startX, startZ, edge, halfSize, rand);

      if (points.length >= 2) {
        rivers.push({ id, name, points });
      }
    }

    return rivers;
  }

  /**
   * Trace a river path downhill using gradient descent on the heightmap.
   */
  private traceDownhill(
    startX: number,
    startZ: number,
    halfSize: number,
    sampleHeight: (x: number, z: number) => number,
    rand: () => number,
  ): RiverPoint[] {
    const points: RiverPoint[] = [];
    const step = 8; // Distance between sample points
    const maxSteps = 200;
    let x = startX;
    let z = startZ;
    let width = 1.5 + rand() * 1.0; // Starting width

    for (let s = 0; s < maxSteps; s++) {
      points.push({ x, z, width });

      // Sample neighbors to find steepest descent
      const currentH = sampleHeight(x, z);
      let bestDx = 0;
      let bestDz = 0;
      let bestH = currentH;

      // Check 8 directions + some randomness for natural meandering
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const dx = Math.cos(angle) * step;
        const dz = Math.sin(angle) * step;
        const h = sampleHeight(x + dx, z + dz);
        if (h < bestH) {
          bestH = h;
          bestDx = dx;
          bestDz = dz;
        }
      }

      // If flat or uphill everywhere, add random drift and continue
      if (bestDx === 0 && bestDz === 0) {
        const angle = rand() * Math.PI * 2;
        bestDx = Math.cos(angle) * step;
        bestDz = Math.sin(angle) * step;
      }

      // Add slight random meandering perpendicular to flow direction
      const perpAngle = Math.atan2(bestDz, bestDx) + Math.PI / 2;
      const meander = (rand() - 0.5) * step * 0.4;
      x += bestDx + Math.cos(perpAngle) * meander;
      z += bestDz + Math.sin(perpAngle) * meander;

      // Widen gradually downstream
      width = Math.min(width + 0.05 + rand() * 0.03, 12);

      // Stop if we've left the terrain
      if (Math.abs(x) > halfSize || Math.abs(z) > halfSize) {
        points.push({ x, z, width });
        break;
      }
    }

    return points;
  }

  /**
   * Generate a meandering river path when no heightmap is available.
   * Uses sinusoidal curves for natural-looking bends.
   */
  private traceMeandering(
    startX: number,
    startZ: number,
    entryEdge: number,
    halfSize: number,
    rand: () => number,
  ): RiverPoint[] {
    const points: RiverPoint[] = [];
    const step = 8;
    const maxSteps = 200;

    // Base flow direction: roughly toward center then past it
    const baseAngle = [Math.PI / 2, Math.PI, -Math.PI / 2, 0][entryEdge]
      + (rand() - 0.5) * 0.6;
    const baseDx = Math.cos(baseAngle);
    const baseDz = Math.sin(baseAngle);

    // Meandering parameters
    const frequency = 0.03 + rand() * 0.04;
    const amplitude = 15 + rand() * 25;

    let x = startX;
    let z = startZ;
    let width = 1.5 + rand() * 1.0;

    for (let s = 0; s < maxSteps; s++) {
      points.push({ x, z, width });

      // Meander perpendicular to base direction
      const meander = Math.sin(s * frequency) * amplitude * (0.01 * s);
      const perpX = -baseDz;
      const perpZ = baseDx;

      x += baseDx * step + perpX * Math.sin(s * frequency) * 0.8;
      z += baseDz * step + perpZ * Math.sin(s * frequency) * 0.8;

      width = Math.min(width + 0.04 + rand() * 0.02, 12);

      if (Math.abs(x) > halfSize || Math.abs(z) > halfSize) {
        points.push({ x, z, width });
        break;
      }
    }

    return points;
  }

  /**
   * Determine number of rivers based on terrain type and config.
   */
  private getRiverCount(config: RiverGenerationConfig): number {
    if (config.riverCount > 0) return config.riverCount;

    switch (config.terrain) {
      case 'river': return 3;
      case 'forest': return 2;
      case 'mountains': return 2;
      case 'hills': return 1;
      case 'coast': return 1;
      case 'plains': return 1;
      case 'desert': return 0;
      default: return 1;
    }
  }
}
