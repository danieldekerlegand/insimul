/**
 * Territory Generator — generates world-level geographic layout.
 *
 * Computes world map dimensions, country territories (Voronoi partitioning),
 * settlement positions (terrain-aware placement within territories), state
 * subdivisions, and inter-settlement roads.
 *
 * All coordinates are in a unified world-space: origin at (0, 0),
 * positive X = east, positive Z = south.
 */

import { createNoise2D } from '../../shared/procedural/noise';
import {
  deriveWorldDimensions,
  deriveCountryGeometry,
  deriveSettlementWorldPosition,
  countryInternalGridSize,
  COUNTRY_CELL_SIZE,
} from '../../shared/grid-constants';

// ── Types ───────────────────────────────────────────────────────────────────

interface Vec2 { x: number; z: number }

export type WorldScale = 'compact' | 'standard' | 'expansive';

export interface ScaleConfig {
  /** Distance between settlements within a country */
  settlementSpacing: number;
  /** Base radius for country territories */
  countryRadius: number;
  /** Multiplier applied to settlement BASE_RADIUS */
  settlementRadiusMultiplier: number;
}

export interface WorldGeographyConfig {
  worldId: string;
  seed: string;
  scale: WorldScale | ScaleConfig;
  /** When present, use grid-based layout instead of Voronoi */
  worldGrid?: { width: number; height: number };
  countries: Array<{
    id: string;
    terrain?: string;
    /** Grid placement for this country (when using grid-based layout) */
    gridPlacement?: { gridX: number; gridY: number; gridWidth: number; gridHeight: number };
    settlements: Array<{
      id: string;
      type: 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city';
      terrain?: string;
      population: number;
      /** Optional: states this settlement belongs to */
      stateId?: string;
      /** Grid placement within country (when using grid-based layout) */
      gridPlacement?: { countryGridX: number; countryGridY: number };
    }>;
    states?: Array<{
      id: string;
      settlementIds: string[];
    }>;
  }>;
}

export interface WorldGeographyResult {
  mapWidth: number;
  mapDepth: number;
  mapCenter: Vec2;
  countries: Map<string, {
    position: Vec2;
    territoryPolygon: Vec2[];
    territoryRadius: number;
  }>;
  settlements: Map<string, {
    worldPositionX: number;
    worldPositionZ: number;
    radius: number;
  }>;
  states: Map<string, {
    position: Vec2;
    boundaryPolygon: Vec2[];
  }>;
  /** Inter-settlement roads as pairs of settlement IDs */
  roads: Array<{ from: string; to: string; waypoints: Vec2[] }>;
}

// ── Scale Presets ────────────────────────────────────────────────────────────

const SCALE_PRESETS: Record<WorldScale, ScaleConfig> = {
  compact: {
    settlementSpacing: 400,
    countryRadius: 800,
    settlementRadiusMultiplier: 1.0,
  },
  standard: {
    settlementSpacing: 700,
    countryRadius: 1500,
    settlementRadiusMultiplier: 1.0,
  },
  expansive: {
    settlementSpacing: 1200,
    countryRadius: 3000,
    settlementRadiusMultiplier: 1.2,
  },
};

/** Base radius by settlement type (matches boundary-generator.ts) */
const BASE_RADIUS: Record<string, number> = {
  dwelling: 15,
  roadhouse: 15,
  homestead: 25,
  hamlet: 50,
  village: 80,
  town: 150,
  city: 250,
};

// ── Seeded RNG ──────────────────────────────────────────────────────────────

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

// ── Main Generator ──────────────────────────────────────────────────────────

export function generateWorldGeography(config: WorldGeographyConfig): WorldGeographyResult {
  // ── Grid-based path ───────────────────────────────────────────────────────
  if (config.worldGrid) {
    return generateGridBasedGeography(config);
  }

  // ── Legacy Voronoi path ───────────────────────────────────────────────────
  const scaleConfig = typeof config.scale === 'string'
    ? SCALE_PRESETS[config.scale]
    : config.scale;

  const rng = seededRandom(config.seed);
  const numCountries = config.countries.length;

  // Step 1: Determine world map dimensions from country count and scale
  const { mapWidth, mapDepth, countryPositions } = layoutCountries(
    numCountries, scaleConfig, rng,
  );

  // Step 2: Generate Voronoi-like territory polygons
  const countryTerritories = generateTerritories(
    countryPositions, mapWidth, mapDepth, config.seed,
  );

  // Step 3: Place settlements within each country's territory
  const settlementPositions = new Map<string, { worldPositionX: number; worldPositionZ: number; radius: number }>();
  const allRoads: WorldGeographyResult['roads'] = [];

  for (let ci = 0; ci < numCountries; ci++) {
    const country = config.countries[ci];
    const territory = countryTerritories[ci];
    const countryCenter = countryPositions[ci];

    const placements = placeSettlements(
      country.settlements, territory.polygon, countryCenter,
      scaleConfig, config.seed + `-country-${ci}`,
    );

    for (const [settlementId, pos] of placements) {
      settlementPositions.set(settlementId, pos);
    }

    // Generate roads connecting settlements within this country
    const settlementIds = country.settlements.map(s => s.id);
    const roads = generateInterSettlementRoads(
      settlementIds, settlementPositions, config.seed + `-roads-${ci}`,
    );
    allRoads.push(...roads);
  }

  // Step 4: Generate state subdivisions
  const stateResults = new Map<string, { position: Vec2; boundaryPolygon: Vec2[] }>();
  for (let ci = 0; ci < numCountries; ci++) {
    const country = config.countries[ci];
    if (!country.states || country.states.length === 0) continue;

    const territory = countryTerritories[ci];
    const stateSubdivisions = subdivideTerritory(
      country.states, settlementPositions, territory.polygon,
      countryPositions[ci], config.seed + `-states-${ci}`,
    );

    for (const [stateId, data] of stateSubdivisions) {
      stateResults.set(stateId, data);
    }
  }

  // Assemble country results
  const countryResults = new Map<string, {
    position: Vec2;
    territoryPolygon: Vec2[];
    territoryRadius: number;
  }>();

  for (let ci = 0; ci < numCountries; ci++) {
    const country = config.countries[ci];
    countryResults.set(country.id, {
      position: countryPositions[ci],
      territoryPolygon: countryTerritories[ci].polygon,
      territoryRadius: countryTerritories[ci].radius,
    });
  }

  return {
    mapWidth,
    mapDepth,
    mapCenter: { x: 0, z: 0 },
    countries: countryResults,
    settlements: settlementPositions,
    states: stateResults,
    roads: allRoads,
  };
}

// ── Grid-Based Geography ─────────────────────────────────────────────────────

function generateGridBasedGeography(config: WorldGeographyConfig): WorldGeographyResult {
  const worldGrid = config.worldGrid!;
  const { mapWidth, mapDepth, mapCenter } = deriveWorldDimensions(worldGrid.width, worldGrid.height);

  const countryResults = new Map<string, {
    position: Vec2;
    territoryPolygon: Vec2[];
    territoryRadius: number;
  }>();

  const settlementPositions = new Map<string, {
    worldPositionX: number;
    worldPositionZ: number;
    radius: number;
  }>();

  const allRoads: WorldGeographyResult['roads'] = [];

  for (const country of config.countries) {
    const gp = country.gridPlacement;
    if (!gp) continue;

    // Derive country geometry from grid placement
    const geo = deriveCountryGeometry(
      worldGrid.width, worldGrid.height,
      gp.gridX, gp.gridY,
      gp.gridWidth, gp.gridHeight,
    );
    countryResults.set(country.id, geo);

    // Country internal grid = world cells × 4
    const { countryGridCols, countryGridRows } = countryInternalGridSize(gp.gridWidth, gp.gridHeight);

    // Place settlements within country grid
    for (const settlement of country.settlements) {
      const sp = settlement.gridPlacement;
      if (!sp) continue;

      const { worldPositionX, worldPositionZ } = deriveSettlementWorldPosition(
        geo.position,
        countryGridCols, countryGridRows,
        sp.countryGridX, sp.countryGridY,
      );

      const radius = (BASE_RADIUS[settlement.type] ?? 150);
      settlementPositions.set(settlement.id, { worldPositionX, worldPositionZ, radius });
    }

    // Generate roads between settlements in this country
    const settlementIds = country.settlements
      .filter(s => s.gridPlacement)
      .map(s => s.id);
    if (settlementIds.length > 1) {
      const roads = generateInterSettlementRoads(
        settlementIds, settlementPositions, config.seed + `-roads-${country.id}`,
      );
      allRoads.push(...roads);
    }
  }

  // State subdivisions — for grid-based worlds, states inherit country territory
  const stateResults = new Map<string, { position: Vec2; boundaryPolygon: Vec2[] }>();
  for (const country of config.countries) {
    if (!country.states || country.states.length === 0) continue;
    const countryGeo = countryResults.get(country.id);
    if (!countryGeo) continue;

    // Simple case: one state = whole country territory
    if (country.states.length === 1) {
      stateResults.set(country.states[0].id, {
        position: countryGeo.position,
        boundaryPolygon: countryGeo.territoryPolygon,
      });
    } else {
      // Multiple states: use existing Voronoi subdivision within the country rectangle
      const stateSubdivisions = subdivideTerritory(
        country.states, settlementPositions, countryGeo.territoryPolygon,
        countryGeo.position, config.seed + `-states-${country.id}`,
      );
      Array.from(stateSubdivisions.entries()).forEach(([stateId, data]) => {
        stateResults.set(stateId, data);
      });
    }
  }

  return {
    mapWidth,
    mapDepth,
    mapCenter,
    countries: countryResults,
    settlements: settlementPositions,
    states: stateResults,
    roads: allRoads,
  };
}

// ── Country Layout ──────────────────────────────────────────────────────────

function layoutCountries(
  numCountries: number,
  scale: ScaleConfig,
  rng: () => number,
): { mapWidth: number; mapDepth: number; countryPositions: Vec2[] } {
  const positions: Vec2[] = [];

  if (numCountries === 1) {
    // Single country centered at origin
    positions.push({ x: 0, z: 0 });
    const dim = scale.countryRadius * 2.5;
    return { mapWidth: dim, mapDepth: dim, countryPositions: positions };
  }

  // Multiple countries: arrange in a grid-like pattern with jitter
  const cols = Math.ceil(Math.sqrt(numCountries));
  const rows = Math.ceil(numCountries / cols);
  const spacing = scale.countryRadius * 2.2;
  const halfW = ((cols - 1) * spacing) / 2;
  const halfD = ((rows - 1) * spacing) / 2;

  let idx = 0;
  for (let r = 0; r < rows && idx < numCountries; r++) {
    for (let c = 0; c < cols && idx < numCountries; c++) {
      const jitterX = (rng() - 0.5) * spacing * 0.2;
      const jitterZ = (rng() - 0.5) * spacing * 0.2;
      positions.push({
        x: c * spacing - halfW + jitterX,
        z: r * spacing - halfD + jitterZ,
      });
      idx++;
    }
  }

  const mapWidth = (cols) * spacing + scale.countryRadius;
  const mapDepth = (rows) * spacing + scale.countryRadius;

  return { mapWidth, mapDepth, countryPositions: positions };
}

// ── Voronoi-like Territory Generation ────────────────────────────────────────

function generateTerritories(
  centers: Vec2[],
  mapWidth: number,
  mapDepth: number,
  seed: string,
): Array<{ polygon: Vec2[]; radius: number }> {
  const noise = createNoise2D(seed + '-territory');
  const halfW = mapWidth / 2;
  const halfD = mapDepth / 2;

  if (centers.length === 1) {
    // Single country: territory fills the entire world map
    const polygon = generateOrganicRect(
      centers[0], halfW, halfD, noise, seed,
    );
    const radius = Math.max(halfW, halfD);
    return [{ polygon, radius }];
  }

  // Multiple countries: Voronoi partitioning
  // For each country, compute the polygon by sampling points and assigning
  // them to the nearest country center, then finding the boundary.
  const territories: Array<{ polygon: Vec2[]; radius: number }> = [];

  for (let ci = 0; ci < centers.length; ci++) {
    const center = centers[ci];
    const polygon = computeVoronoiCell(center, centers, halfW, halfD, noise, seed + `-cell-${ci}`);
    const radius = computePolygonRadius(center, polygon);
    territories.push({ polygon, radius });
  }

  return territories;
}

/** Generate an organic rectangle (for single-country worlds). */
function generateOrganicRect(
  center: Vec2, halfW: number, halfD: number,
  noise: (x: number, y: number) => number, seed: string,
): Vec2[] {
  const points: Vec2[] = [];
  const segments = 64;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);
    // Rectangular base shape
    const baseR = Math.min(
      halfW / Math.max(Math.abs(nx), 0.01),
      halfD / Math.max(Math.abs(nz), 0.01),
    );
    const clampedR = Math.min(baseR, Math.max(halfW, halfD));
    // Apply noise perturbation for organic edges
    const perturbation = 1.0 + noise(nx * 3, nz * 3) * 0.1;
    points.push({
      x: center.x + nx * clampedR * perturbation,
      z: center.z + nz * clampedR * perturbation,
    });
  }

  return points;
}

/** Compute a Voronoi cell for one center among many, clipped to the world bounds. */
function computeVoronoiCell(
  center: Vec2,
  allCenters: Vec2[],
  halfW: number,
  halfD: number,
  noise: (x: number, y: number) => number,
  seed: string,
): Vec2[] {
  // Use angular sampling: cast rays from the center and find the boundary
  // where this center's region meets another center's region (bisector).
  const segments = 64;
  const polygon: Vec2[] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);

    // Walk outward from center until we hit: (a) another country's territory
    // or (b) the world boundary
    let maxDist = Math.sqrt(halfW * halfW + halfD * halfD) * 1.5;

    // Check each other center's bisector
    for (const other of allCenters) {
      if (other === center) continue;
      // Bisector distance along this ray
      const bisectorDist = computeBisectorDist(center, other, dx, dz);
      if (bisectorDist > 0 && bisectorDist < maxDist) {
        maxDist = bisectorDist;
      }
    }

    // Clip to world bounds
    const worldDist = clipRayToRect(center, dx, dz, halfW, halfD);
    if (worldDist > 0 && worldDist < maxDist) {
      maxDist = worldDist;
    }

    // Apply slight noise for organic borders
    const perturbation = 1.0 + noise(dx * 2 + center.x * 0.01, dz * 2 + center.z * 0.01) * 0.05;
    const dist = maxDist * perturbation * 0.95; // Small inward margin

    polygon.push({
      x: center.x + dx * dist,
      z: center.z + dz * dist,
    });
  }

  return polygon;
}

/** Compute distance along ray (dx, dz) from `from` to the bisector with `other`. */
function computeBisectorDist(from: Vec2, other: Vec2, dx: number, dz: number): number {
  // Midpoint between the two centers
  const mx = (from.x + other.x) / 2;
  const mz = (from.z + other.z) / 2;

  // Normal of the bisector (direction from `from` to `other`)
  const bx = other.x - from.x;
  const bz = other.z - from.z;

  // Ray-plane intersection: t = dot(m - from, b) / dot(ray, b)
  const denom = dx * bx + dz * bz;
  if (Math.abs(denom) < 1e-8) return Infinity; // Parallel

  const t = ((mx - from.x) * bx + (mz - from.z) * bz) / denom;
  return t > 0 ? t : Infinity;
}

/** Clip a ray from `origin` along (dx, dz) to a rect [-halfW, halfW] × [-halfD, halfD]. */
function clipRayToRect(origin: Vec2, dx: number, dz: number, halfW: number, halfD: number): number {
  let tMin = Infinity;

  if (Math.abs(dx) > 1e-8) {
    const t1 = (-halfW - origin.x) / dx;
    const t2 = (halfW - origin.x) / dx;
    if (t1 > 0) tMin = Math.min(tMin, t1);
    if (t2 > 0) tMin = Math.min(tMin, t2);
  }
  if (Math.abs(dz) > 1e-8) {
    const t1 = (-halfD - origin.z) / dz;
    const t2 = (halfD - origin.z) / dz;
    if (t1 > 0) tMin = Math.min(tMin, t1);
    if (t2 > 0) tMin = Math.min(tMin, t2);
  }

  return tMin;
}

function computePolygonRadius(center: Vec2, polygon: Vec2[]): number {
  let maxDist = 0;
  for (const p of polygon) {
    const dx = p.x - center.x;
    const dz = p.z - center.z;
    maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dz * dz));
  }
  return maxDist;
}

// ── Settlement Placement ────────────────────────────────────────────────────

function placeSettlements(
  settlements: WorldGeographyConfig['countries'][0]['settlements'],
  territoryPolygon: Vec2[],
  countryCenter: Vec2,
  scale: ScaleConfig,
  seed: string,
): Map<string, { worldPositionX: number; worldPositionZ: number; radius: number }> {
  const rng = seededRandom(seed);
  const result = new Map<string, { worldPositionX: number; worldPositionZ: number; radius: number }>();

  if (settlements.length === 0) return result;

  if (settlements.length === 1) {
    // Single settlement: place near country center
    const s = settlements[0];
    const radius = (BASE_RADIUS[s.type] ?? 150) * scale.settlementRadiusMultiplier;
    result.set(s.id, {
      worldPositionX: countryCenter.x,
      worldPositionZ: countryCenter.z,
      radius,
    });
    return result;
  }

  // Multiple settlements: distribute within territory with minimum spacing
  const placed: Array<{ id: string; x: number; z: number; radius: number }> = [];

  // Sort settlements by size (largest first for better placement)
  const sorted = [...settlements].sort((a, b) =>
    (BASE_RADIUS[b.type] ?? 150) - (BASE_RADIUS[a.type] ?? 150)
  );

  for (const s of sorted) {
    const radius = (BASE_RADIUS[s.type] ?? 150) * scale.settlementRadiusMultiplier;
    const minDist = scale.settlementSpacing;

    let bestPos: Vec2 | null = null;
    let bestScore = -Infinity;

    // Try multiple candidate positions and pick the best
    for (let attempt = 0; attempt < 50; attempt++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * scale.countryRadius * 0.7;
      const candidate: Vec2 = {
        x: countryCenter.x + Math.cos(angle) * dist,
        z: countryCenter.z + Math.sin(angle) * dist,
      };

      // Must be inside territory
      if (!pointInPolygon(candidate, territoryPolygon)) continue;

      // Must be far enough from other placed settlements
      let tooClose = false;
      let closestDist = Infinity;
      for (const p of placed) {
        const d = Math.sqrt((candidate.x - p.x) ** 2 + (candidate.z - p.z) ** 2);
        if (d < minDist) { tooClose = true; break; }
        closestDist = Math.min(closestDist, d);
      }
      if (tooClose) continue;

      // Score: prefer positions that are well-spaced from others and
      // reasonably close to the country center
      const centerDist = Math.sqrt(
        (candidate.x - countryCenter.x) ** 2 + (candidate.z - countryCenter.z) ** 2
      );
      const score = closestDist - centerDist * 0.3; // Balance spacing vs centrality

      if (score > bestScore || !bestPos) {
        bestScore = score;
        bestPos = candidate;
      }
    }

    // Fallback: place near center with small offset if all attempts failed
    if (!bestPos) {
      const fallbackAngle = rng() * Math.PI * 2;
      const fallbackDist = placed.length * radius * 2.5;
      bestPos = {
        x: countryCenter.x + Math.cos(fallbackAngle) * fallbackDist,
        z: countryCenter.z + Math.sin(fallbackAngle) * fallbackDist,
      };
    }

    placed.push({ id: s.id, x: bestPos.x, z: bestPos.z, radius });
    result.set(s.id, {
      worldPositionX: bestPos.x,
      worldPositionZ: bestPos.z,
      radius,
    });
  }

  return result;
}

// ── Inter-Settlement Roads ──────────────────────────────────────────────────

function generateInterSettlementRoads(
  settlementIds: string[],
  positions: Map<string, { worldPositionX: number; worldPositionZ: number; radius: number }>,
  seed: string,
): WorldGeographyResult['roads'] {
  if (settlementIds.length < 2) return [];

  // Build minimum spanning tree to connect all settlements
  const edges: Array<{ from: string; to: string; dist: number }> = [];
  for (let i = 0; i < settlementIds.length; i++) {
    for (let j = i + 1; j < settlementIds.length; j++) {
      const a = positions.get(settlementIds[i]);
      const b = positions.get(settlementIds[j]);
      if (!a || !b) continue;
      const dist = Math.sqrt(
        (a.worldPositionX - b.worldPositionX) ** 2 +
        (a.worldPositionZ - b.worldPositionZ) ** 2
      );
      edges.push({ from: settlementIds[i], to: settlementIds[j], dist });
    }
  }

  // Kruskal's MST
  edges.sort((a, b) => a.dist - b.dist);
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)!));
    return parent.get(id)!;
  };
  const union = (a: string, b: string) => { parent.set(find(a), find(b)); };

  const mstEdges: typeof edges = [];
  for (const edge of edges) {
    if (find(edge.from) !== find(edge.to)) {
      union(edge.from, edge.to);
      mstEdges.push(edge);
    }
  }

  // Convert MST edges to road waypoints (straight line with slight curve)
  const rng = seededRandom(seed);
  const roads: WorldGeographyResult['roads'] = [];

  for (const edge of mstEdges) {
    const a = positions.get(edge.from)!;
    const b = positions.get(edge.to)!;

    // Generate a few intermediate waypoints with slight perpendicular jitter
    const waypoints: Vec2[] = [];
    const segments = 5;
    const dx = b.worldPositionX - a.worldPositionX;
    const dz = b.worldPositionZ - a.worldPositionZ;
    const len = Math.sqrt(dx * dx + dz * dz);
    const perpX = -dz / len;
    const perpZ = dx / len;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const jitter = (i === 0 || i === segments) ? 0 : (rng() - 0.5) * len * 0.08;
      waypoints.push({
        x: a.worldPositionX + dx * t + perpX * jitter,
        z: a.worldPositionZ + dz * t + perpZ * jitter,
      });
    }

    roads.push({ from: edge.from, to: edge.to, waypoints });
  }

  return roads;
}

// ── State Subdivision ───────────────────────────────────────────────────────

function subdivideTerritory(
  states: Array<{ id: string; settlementIds: string[] }>,
  settlementPositions: Map<string, { worldPositionX: number; worldPositionZ: number; radius: number }>,
  countryPolygon: Vec2[],
  countryCenter: Vec2,
  seed: string,
): Map<string, { position: Vec2; boundaryPolygon: Vec2[] }> {
  const result = new Map<string, { position: Vec2; boundaryPolygon: Vec2[] }>();

  if (states.length <= 1 && states.length > 0) {
    // Single state: use the whole country territory
    const state = states[0];
    const centroid = computeStateCentroid(state.settlementIds, settlementPositions, countryCenter);
    result.set(state.id, { position: centroid, boundaryPolygon: countryPolygon });
    return result;
  }

  // Multiple states: Voronoi subdivision within the country polygon
  const noise = createNoise2D(seed);
  const stateCenters: Vec2[] = states.map(state =>
    computeStateCentroid(state.settlementIds, settlementPositions, countryCenter)
  );

  // Compute bounding box of country polygon
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of countryPolygon) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  }

  // For each state, compute its Voronoi cell within the country polygon
  for (let si = 0; si < states.length; si++) {
    const center = stateCenters[si];
    const halfW = (maxX - minX) / 2;
    const halfD = (maxZ - minZ) / 2;

    const cellPolygon = computeVoronoiCell(
      center,
      stateCenters,
      halfW * 1.5, halfD * 1.5,
      noise, seed + `-state-${si}`,
    );

    // Clip to country polygon (simple: keep only points inside country)
    const clipped = cellPolygon.filter(p => pointInPolygon(p, countryPolygon));
    const finalPolygon = clipped.length >= 3 ? clipped : countryPolygon;

    result.set(states[si].id, { position: center, boundaryPolygon: finalPolygon });
  }

  return result;
}

function computeStateCentroid(
  settlementIds: string[],
  positions: Map<string, { worldPositionX: number; worldPositionZ: number; radius: number }>,
  fallback: Vec2,
): Vec2 {
  if (settlementIds.length === 0) return fallback;

  let sumX = 0, sumZ = 0, count = 0;
  for (const id of settlementIds) {
    const pos = positions.get(id);
    if (pos) {
      sumX += pos.worldPositionX;
      sumZ += pos.worldPositionZ;
      count++;
    }
  }
  if (count === 0) return fallback;
  return { x: sumX / count, z: sumZ / count };
}

// ── Geometry Helpers ────────────────────────────────────────────────────────

function pointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, zi = polygon[i].z;
    const xj = polygon[j].x, zj = polygon[j].z;
    if (((zi > point.z) !== (zj > point.z)) &&
        (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// ── Scale helpers ───────────────────────────────────────────────────────────

export function resolveScaleConfig(scale: WorldScale | ScaleConfig | undefined): ScaleConfig {
  if (!scale) return SCALE_PRESETS.standard;
  if (typeof scale === 'string') return SCALE_PRESETS[scale] ?? SCALE_PRESETS.standard;
  return scale;
}

export function getSettlementBaseRadius(type: string): number {
  return BASE_RADIUS[type] ?? 150;
}
