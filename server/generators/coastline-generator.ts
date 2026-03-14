/**
 * Coastline & Bay Generator
 *
 * Produces coastline contour points and bay shapes for coastal settlements.
 * Uses harmonic noise (summed sine waves) for natural-looking shorelines
 * and elliptical indentations for bays.
 *
 * All functions are pure and deterministic given the same seed.
 */

// ── Seeded PRNG (mulberry32) ────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface Point2D {
  x: number;
  z: number;
}

export interface BayShape {
  /** Center of the bay opening along the coastline */
  center: Point2D;
  /** Half-width of the bay mouth along the shore */
  radiusX: number;
  /** Depth of the bay inward from the coastline */
  radiusZ: number;
  /** Rotation in radians (relative to shore-normal direction) */
  rotation: number;
}

export interface CoastlineData {
  /** Ordered polyline tracing the shoreline from one map edge to the other */
  contour: Point2D[];
  /** Bay indentations carved into the coastline */
  bays: BayShape[];
  /** Which side of the contour is water: 'north' | 'south' | 'east' | 'west' */
  waterSide: 'north' | 'south' | 'east' | 'west';
  /** Grid resolution used for the heightmap */
  resolution: number;
  /**
   * 2D heightmap where values > 0 are land and values <= 0 are water.
   * Row-major [row][col], covers a square region of `mapSize` world units.
   */
  heightmap: number[][];
  /** World-space size of the square region the heightmap covers */
  mapSize: number;
}

export interface CoastlineConfig {
  /** Deterministic seed */
  seed?: number;
  /** World-space extent of the map square (default 500) */
  mapSize?: number;
  /** Heightmap grid resolution (default 64) */
  resolution?: number;
  /** Number of points along the contour polyline (default 128) */
  contourDetail?: number;
  /** Where the water is relative to the settlement */
  waterSide?: 'north' | 'south' | 'east' | 'west';
  /** 0-1 how jagged the coastline is (default 0.3) */
  roughness?: number;
  /** Minimum number of bays (default 0) */
  minBays?: number;
  /** Maximum number of bays (default 3) */
  maxBays?: number;
}

// ── Coastline contour generation ────────────────────────────────────────────

/**
 * Generate a 1D coastline offset curve using summed harmonics.
 * Returns an array of offset values (perpendicular to the shore axis).
 */
export function generateCoastlineOffsets(
  count: number,
  amplitude: number,
  roughness: number,
  rng: () => number,
): number[] {
  // Build 4-6 harmonic layers with random phase
  const harmonics = Math.floor(4 + rng() * 3);
  const phases: number[] = [];
  const freqs: number[] = [];
  const amps: number[] = [];

  for (let h = 0; h < harmonics; h++) {
    phases.push(rng() * Math.PI * 2);
    freqs.push((h + 1) * (1 + rng() * 0.5));
    // Each octave halves in amplitude, scaled by roughness
    amps.push(amplitude * Math.pow(0.5, h) * (0.5 + roughness));
  }

  const offsets: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    let val = 0;
    for (let h = 0; h < harmonics; h++) {
      val += amps[h] * Math.sin(t * freqs[h] * Math.PI * 2 + phases[h]);
    }
    offsets.push(val);
  }
  return offsets;
}

/**
 * Build a contour polyline from offsets, oriented according to waterSide.
 * The contour runs across the map and offsets shift it toward/away from water.
 */
export function buildContourFromOffsets(
  offsets: number[],
  waterSide: 'north' | 'south' | 'east' | 'west',
  mapSize: number,
  baselineRatio: number,
): Point2D[] {
  const count = offsets.length;
  const contour: Point2D[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const offset = offsets[i];

    switch (waterSide) {
      case 'north': // contour runs east-west, water is at low Z
        contour.push({ x: t * mapSize, z: baselineRatio * mapSize + offset });
        break;
      case 'south': // contour runs east-west, water is at high Z
        contour.push({ x: t * mapSize, z: (1 - baselineRatio) * mapSize - offset });
        break;
      case 'west': // contour runs north-south, water is at low X
        contour.push({ x: baselineRatio * mapSize + offset, z: t * mapSize });
        break;
      case 'east': // contour runs north-south, water is at high X
        contour.push({ x: (1 - baselineRatio) * mapSize - offset, z: t * mapSize });
        break;
    }
  }
  return contour;
}

// ── Bay generation ──────────────────────────────────────────────────────────

/**
 * Generate bay shapes distributed along the coastline.
 */
export function generateBays(
  count: number,
  contour: Point2D[],
  waterSide: 'north' | 'south' | 'east' | 'west',
  mapSize: number,
  rng: () => number,
): BayShape[] {
  if (count === 0) return [];

  const bays: BayShape[] = [];
  const segmentSize = contour.length / (count + 1);

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(segmentSize * (i + 1));
    const center = contour[Math.min(idx, contour.length - 1)];

    const radiusX = mapSize * (0.04 + rng() * 0.06); // 4-10% of map
    const radiusZ = mapSize * (0.03 + rng() * 0.05); // 3-8% of map
    const rotation = (rng() - 0.5) * 0.3; // slight rotation

    bays.push({ center: { ...center }, radiusX, radiusZ, rotation });
  }
  return bays;
}

/**
 * Test whether a point falls inside a bay's elliptical region.
 * The bay extends from the coastline toward the water side.
 */
export function isInsideBay(
  px: number,
  pz: number,
  bay: BayShape,
  waterSide: 'north' | 'south' | 'east' | 'west',
): boolean {
  // Translate to bay-local coords
  let dx = px - bay.center.x;
  let dz = pz - bay.center.z;

  // Apply rotation
  const cos = Math.cos(-bay.rotation);
  const sin = Math.sin(-bay.rotation);
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;

  // Ellipse test
  const ex = lx / bay.radiusX;
  const ez = lz / bay.radiusZ;
  if (ex * ex + ez * ez > 1) return false;

  // Only the half that faces the land side counts as bay (water carved into land)
  switch (waterSide) {
    case 'north': return lz > 0; // bay carved southward into land
    case 'south': return lz < 0; // bay carved northward into land
    case 'west':  return lx > 0; // bay carved eastward into land
    case 'east':  return lx < 0; // bay carved westward into land
  }
}

// ── Heightmap generation ────────────────────────────────────────────────────

/**
 * Build a heightmap from coastline contour and bays.
 * Land cells get positive values, water cells get negative values.
 */
export function buildHeightmap(
  resolution: number,
  mapSize: number,
  contour: Point2D[],
  bays: BayShape[],
  waterSide: 'north' | 'south' | 'east' | 'west',
): number[][] {
  const heightmap: number[][] = [];

  for (let row = 0; row < resolution; row++) {
    const rowData: number[] = [];
    const worldZ = (row / (resolution - 1)) * mapSize;

    for (let col = 0; col < resolution; col++) {
      const worldX = (col / (resolution - 1)) * mapSize;

      // Find the coastline offset at this position
      let isWater = isOnWaterSide(worldX, worldZ, contour, waterSide, mapSize);

      // Check if inside any bay (bays carve water into land)
      if (!isWater) {
        for (const bay of bays) {
          if (isInsideBay(worldX, worldZ, bay, waterSide)) {
            isWater = true;
            break;
          }
        }
      }

      rowData.push(isWater ? -1 : 1);
    }
    heightmap.push(rowData);
  }
  return heightmap;
}

/**
 * Determine if a world point is on the water side of the contour polyline.
 */
export function isOnWaterSide(
  worldX: number,
  worldZ: number,
  contour: Point2D[],
  waterSide: 'north' | 'south' | 'east' | 'west',
  mapSize: number,
): boolean {
  if (contour.length < 2) return false;

  // Find the contour value at the query position by interpolation
  const isHorizontal = waterSide === 'north' || waterSide === 'south';
  const queryAxis = isHorizontal ? worldX : worldZ;

  // Find two contour points that bracket the query position
  let coastlineValue: number;

  if (isHorizontal) {
    coastlineValue = interpolateContour(contour, queryAxis, 'x', 'z', mapSize);
  } else {
    coastlineValue = interpolateContour(contour, queryAxis, 'z', 'x', mapSize);
  }

  switch (waterSide) {
    case 'north': return worldZ < coastlineValue;
    case 'south': return worldZ > coastlineValue;
    case 'west':  return worldX < coastlineValue;
    case 'east':  return worldX > coastlineValue;
  }
}

/**
 * Linearly interpolate the contour value at a given position along its run axis.
 */
function interpolateContour(
  contour: Point2D[],
  queryPos: number,
  runKey: 'x' | 'z',
  valueKey: 'x' | 'z',
  mapSize: number,
): number {
  // Clamp to contour range
  const first = contour[0][runKey];
  const last = contour[contour.length - 1][runKey];

  if (queryPos <= Math.min(first, last)) return contour[0][valueKey];
  if (queryPos >= Math.max(first, last)) return contour[contour.length - 1][valueKey];

  // Binary search for bracket
  let lo = 0;
  let hi = contour.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (contour[mid][runKey] <= queryPos) lo = mid;
    else hi = mid;
  }

  const a = contour[lo];
  const b = contour[hi];
  const range = b[runKey] - a[runKey];
  if (Math.abs(range) < 1e-6) return a[valueKey];

  const t = (queryPos - a[runKey]) / range;
  return a[valueKey] + t * (b[valueKey] - a[valueKey]);
}

// ── Main entry point ────────────────────────────────────────────────────────

/**
 * Generate coastline and bay data for a coastal settlement.
 */
export function generateCoastline(config: CoastlineConfig = {}): CoastlineData {
  const {
    seed = 42,
    mapSize = 500,
    resolution = 64,
    contourDetail = 128,
    waterSide = 'north',
    roughness = 0.3,
    minBays = 0,
    maxBays = 3,
  } = config;

  const rng = mulberry32(seed);

  // Baseline: coastline sits ~25% from the water edge
  const baselineRatio = 0.2 + rng() * 0.1;

  // Amplitude of coastline wobble (fraction of mapSize)
  const amplitude = mapSize * 0.05 * (0.5 + roughness);

  const offsets = generateCoastlineOffsets(contourDetail, amplitude, roughness, rng);
  const contour = buildContourFromOffsets(offsets, waterSide, mapSize, baselineRatio);

  // Generate bays
  const bayCount = minBays + Math.floor(rng() * (maxBays - minBays + 1));
  const bays = generateBays(bayCount, contour, waterSide, mapSize, rng);

  // Build heightmap
  const heightmap = buildHeightmap(resolution, mapSize, contour, bays, waterSide);

  return {
    contour,
    bays,
    waterSide,
    resolution,
    heightmap,
    mapSize,
  };
}
