/**
 * Settlement Boundary Generator — produces terrain-aware settlement boundaries.
 *
 * Generates irregular boundary polygons that conform to geographic features:
 * - Plains/forest: roughly circular with Perlin noise perturbation
 * - Coast: semi-circular, one side follows coastline
 * - Mountains: elongated, confined to lower-slope areas
 * - River: elongated along river axis
 * - Desert: compact polygon centered on water source
 */

import { createNoise2D } from '../../shared/procedural/noise';

interface Vec2 {
  x: number;
  z: number;
}

export interface SettlementBoundary {
  polygon: Vec2[];
  area: number;
  perimeterType: 'natural' | 'walled' | 'open';
}

export interface BoundaryConfig {
  seed: string;
  terrain: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  settlementType: 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city';
  population: number;
  center?: Vec2;
}

/** Base radius by settlement type */
const BASE_RADIUS: Record<string, number> = {
  dwelling: 15,
  roadhouse: 15,
  homestead: 25,
  hamlet: 50,
  village: 80,
  town: 150,
  city: 250,
};

/** Number of polygon vertices */
const VERTEX_COUNT = 64;

/** Seeded RNG (xorshift32) */
function seededRandom(seed: string): () => number {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  }
  s = s >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Generate a settlement boundary polygon based on terrain type and heightmap.
 */
export function generateSettlementBoundary(
  config: BoundaryConfig,
  heightmap?: number[][],
): SettlementBoundary {
  const cx = config.center?.x ?? 0;
  const cz = config.center?.z ?? 0;
  const baseRadius = BASE_RADIUS[config.settlementType] ?? 150;
  // Scale radius slightly by population
  const popScale = Math.max(0.8, Math.min(1.5, Math.sqrt(config.population / 500)));
  const radius = baseRadius * popScale;

  let polygon: Vec2[];

  switch (config.terrain) {
    case 'coast':
      polygon = generateCoastBoundary(config.seed, cx, cz, radius);
      break;
    case 'mountains':
      polygon = generateMountainBoundary(config.seed, cx, cz, radius, heightmap);
      break;
    case 'river':
      polygon = generateRiverBoundary(config.seed, cx, cz, radius);
      break;
    case 'desert':
      polygon = generateDesertBoundary(config.seed, cx, cz, radius);
      break;
    case 'plains':
    case 'forest':
    case 'hills':
    default:
      polygon = generateNaturalBoundary(config.seed, cx, cz, radius);
      break;
  }

  const area = computePolygonArea(polygon);
  const perimeterType = selectPerimeterType(config);

  return { polygon, area, perimeterType };
}

/**
 * Plains/forest/hills: roughly circular with Perlin noise perturbation on radius.
 */
function generateNaturalBoundary(seed: string, cx: number, cz: number, radius: number): Vec2[] {
  const noise = createNoise2D(seed + '-boundary');
  const polygon: Vec2[] = [];

  for (let i = 0; i < VERTEX_COUNT; i++) {
    const angle = (2 * Math.PI * i) / VERTEX_COUNT;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);
    // Sample noise along the unit circle for smooth perturbation
    const perturbation = noise(nx * 2, nz * 2) * 0.3 + 1.0; // 0.7 to 1.3
    const r = radius * perturbation;
    polygon.push({ x: cx + r * nx, z: cz + r * nz });
  }

  return polygon;
}

/**
 * Coast: semi-circular, one side follows a straight coastline.
 */
function generateCoastBoundary(seed: string, cx: number, cz: number, radius: number): Vec2[] {
  const noise = createNoise2D(seed + '-boundary');
  const rng = seededRandom(seed + '-coast');
  // Pick a random coastline direction
  const coastAngle = rng() * 2 * Math.PI;
  const polygon: Vec2[] = [];

  for (let i = 0; i < VERTEX_COUNT; i++) {
    const angle = (2 * Math.PI * i) / VERTEX_COUNT;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);

    // Compute how much this direction faces the coast
    const coastDot = Math.cos(angle - coastAngle);

    let r: number;
    if (coastDot > 0.3) {
      // Facing the coast — flatten to coastline with small noise
      const coastNoise = noise(nx * 4, nz * 4) * 0.05;
      r = radius * (0.4 + coastNoise);
    } else {
      // Inland side — normal perturbation
      const perturbation = noise(nx * 2, nz * 2) * 0.25 + 1.0;
      r = radius * perturbation;
    }

    polygon.push({ x: cx + r * nx, z: cz + r * nz });
  }

  return polygon;
}

/**
 * Mountains: elongated, confined to lower-slope areas.
 * If heightmap provided, avoids steep slopes. Otherwise uses noise-based elongation.
 */
function generateMountainBoundary(
  seed: string,
  cx: number,
  cz: number,
  radius: number,
  heightmap?: number[][],
): Vec2[] {
  const noise = createNoise2D(seed + '-boundary');
  const rng = seededRandom(seed + '-mountain');
  // Pick elongation axis
  const elongAngle = rng() * Math.PI; // half-circle, symmetric
  const polygon: Vec2[] = [];

  for (let i = 0; i < VERTEX_COUNT; i++) {
    const angle = (2 * Math.PI * i) / VERTEX_COUNT;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);

    // Elongate along the chosen axis (valley direction)
    const alignedDot = Math.abs(Math.cos(angle - elongAngle));
    // 1.4x along valley, 0.6x across valley
    const elongation = 0.6 + 0.8 * alignedDot;

    let perturbation = noise(nx * 2, nz * 2) * 0.2 + 1.0;

    // If heightmap available, reduce radius where slopes are steep
    if (heightmap) {
      const sampleR = radius * elongation * perturbation;
      const px = cx + sampleR * nx;
      const pz = cz + sampleR * nz;
      const slope = sampleSlope(heightmap, px, pz, radius);
      // Reduce radius for steep slopes (slope > 0.3)
      if (slope > 0.3) {
        perturbation *= Math.max(0.4, 1.0 - (slope - 0.3) * 2);
      }
    }

    const r = radius * elongation * perturbation;
    polygon.push({ x: cx + r * nx, z: cz + r * nz });
  }

  return polygon;
}

/**
 * River: elongated along river axis.
 */
function generateRiverBoundary(seed: string, cx: number, cz: number, radius: number): Vec2[] {
  const noise = createNoise2D(seed + '-boundary');
  const rng = seededRandom(seed + '-river');
  // River direction
  const riverAngle = rng() * Math.PI;
  const polygon: Vec2[] = [];

  for (let i = 0; i < VERTEX_COUNT; i++) {
    const angle = (2 * Math.PI * i) / VERTEX_COUNT;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);

    // Elongate strongly along river axis
    const alignedDot = Math.abs(Math.cos(angle - riverAngle));
    const elongation = 0.5 + 1.0 * alignedDot; // 0.5 to 1.5

    const perturbation = noise(nx * 2, nz * 2) * 0.2 + 1.0;
    const r = radius * elongation * perturbation;
    polygon.push({ x: cx + r * nx, z: cz + r * nz });
  }

  return polygon;
}

/**
 * Desert: compact polygon centered on water source.
 */
function generateDesertBoundary(seed: string, cx: number, cz: number, radius: number): Vec2[] {
  const noise = createNoise2D(seed + '-boundary');
  // Desert settlements are more compact
  const compactRadius = radius * 0.7;
  const polygon: Vec2[] = [];

  for (let i = 0; i < VERTEX_COUNT; i++) {
    const angle = (2 * Math.PI * i) / VERTEX_COUNT;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);
    // Less perturbation — compact shape
    const perturbation = noise(nx * 3, nz * 3) * 0.15 + 1.0;
    const r = compactRadius * perturbation;
    polygon.push({ x: cx + r * nx, z: cz + r * nz });
  }

  return polygon;
}

/**
 * Sample slope from heightmap at world position.
 * Returns 0–1 where 0 is flat and 1 is vertical.
 * Maps world coords to grid using the boundary radius as the extent.
 */
function sampleSlope(heightmap: number[][], wx: number, wz: number, extent: number): number {
  const h = heightmap.length;
  const w = heightmap[0]?.length ?? 0;
  if (h < 2 || w < 2) return 0;

  // Map world coords to grid: world range [-extent, extent] → grid [0, size-1]
  const halfExtent = extent * 2;
  const gx = Math.floor(((wx / halfExtent) + 0.5) * (w - 1));
  const gz = Math.floor(((wz / halfExtent) + 0.5) * (h - 1));

  if (gx < 1 || gx >= w - 1 || gz < 1 || gz >= h - 1) return 0;

  const dhdx = (heightmap[gz][gx + 1] - heightmap[gz][gx - 1]) / 2;
  const dhdz = (heightmap[gz + 1][gx] - heightmap[gz - 1][gx]) / 2;

  return Math.min(1, Math.sqrt(dhdx * dhdx + dhdz * dhdz));
}

/**
 * Select perimeter type based on settlement characteristics.
 */
function selectPerimeterType(config: BoundaryConfig): 'natural' | 'walled' | 'open' {
  if (config.settlementType === 'city' && config.population > 1000) {
    return 'walled';
  }
  if (config.settlementType === 'village') {
    return 'open';
  }
  return 'natural';
}

/**
 * Compute signed area of a polygon using the shoelace formula.
 * Returns absolute area.
 */
function computePolygonArea(polygon: Vec2[]): number {
  let area = 0;
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].z;
    area -= polygon[j].x * polygon[i].z;
  }
  return Math.abs(area) / 2;
}
