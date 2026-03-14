/**
 * Street Network Topology Generator
 *
 * Generates intra-settlement street networks as polylines with intersection
 * nodes. Supports two layout algorithms:
 *   - grid: orthogonal grid for planned towns (founded after ~1800)
 *   - organic: radial/irregular layout for older villages
 *
 * Seeded by settlement type and founding era for deterministic output.
 */

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface StreetNode {
  id: string;
  /** World-space x */
  x: number;
  /** World-space z (y in 2D top-down) */
  z: number;
  /** IDs of streets that pass through this node */
  intersectionOf: string[];
}

export interface StreetSegment {
  id: string;
  name: string;
  /** Direction hint for naming / house numbering */
  direction: 'NS' | 'EW';
  /** Ordered node IDs forming the polyline */
  nodeIds: string[];
  /** Ordered world-space waypoints matching nodeIds */
  waypoints: { x: number; z: number }[];
  /** Road width in world units */
  width: number;
}

export interface StreetNetwork {
  nodes: StreetNode[];
  segments: StreetSegment[];
}

export interface StreetNetworkConfig {
  /** Center of the settlement in world space */
  centerX: number;
  centerZ: number;
  /** Settlement type determines scale */
  settlementType: 'village' | 'town' | 'city';
  /** Founding year — older settlements get organic layout */
  foundedYear: number;
  /** Seed string for deterministic generation */
  seed: string;
  /** Optional override for layout algorithm */
  layoutOverride?: 'grid' | 'organic';
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const GRID_SPACING: Record<string, number> = {
  village: 40,
  town: 35,
  city: 30,
};

const GRID_SIZE: Record<string, number> = {
  village: 3,
  town: 5,
  city: 7,
};

const STREET_WIDTH: Record<string, number> = {
  village: 2,
  town: 2.5,
  city: 3,
};

/** Year threshold: settlements founded before this get organic layout */
const ORGANIC_THRESHOLD_YEAR = 1800;

// ─────────────────────────────────────────────
// Seeded random (same LCG used elsewhere in the codebase)
// ─────────────────────────────────────────────

function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

// ─────────────────────────────────────────────
// Street name pools
// ─────────────────────────────────────────────

const NS_STREET_NAMES = [
  '1st St', '2nd St', '3rd St', '4th St', '5th St', '6th St', '7th St',
  '8th St', '9th St', '10th St', '11th St', '12th St',
];

const EW_STREET_NAMES = [
  'Main St', 'Oak Ave', 'Maple Ave', 'Cedar Ave', 'Pine Ave', 'Elm Ave',
  'Washington Ave', 'Lincoln Ave', 'Jefferson Ave', 'Madison Ave',
  'Park Ave', 'High St',
];

const ORGANIC_STREET_NAMES = [
  'High St', 'Church Ln', 'Mill Rd', 'Market St', 'Bridge St',
  'Castle Rd', 'River Ln', 'King St', 'Queen St', 'Abbey Rd',
  'Forge Ln', 'Well St',
];

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Choose layout algorithm based on settlement type and founding era.
 */
export function chooseLayout(
  settlementType: string,
  foundedYear: number,
  layoutOverride?: 'grid' | 'organic',
): 'grid' | 'organic' {
  if (layoutOverride) return layoutOverride;
  if (foundedYear < ORGANIC_THRESHOLD_YEAR) return 'organic';
  if (settlementType === 'village') return 'organic';
  return 'grid';
}

/**
 * Generate a street network for a settlement.
 */
export function generateStreetNetwork(config: StreetNetworkConfig): StreetNetwork {
  const layout = chooseLayout(
    config.settlementType,
    config.foundedYear,
    config.layoutOverride,
  );

  if (layout === 'grid') {
    return generateGridNetwork(config);
  }
  return generateOrganicNetwork(config);
}

// ─────────────────────────────────────────────
// Grid layout
// ─────────────────────────────────────────────

function generateGridNetwork(config: StreetNetworkConfig): StreetNetwork {
  const rand = createSeededRandom(`${config.seed}_streets_grid`);
  const spacing = GRID_SPACING[config.settlementType] || 35;
  const size = GRID_SIZE[config.settlementType] || 5;
  const width = STREET_WIDTH[config.settlementType] || 2.5;

  const cols = size;     // number of NS streets
  const rows = size;     // number of EW streets
  const halfW = ((cols - 1) * spacing) / 2;
  const halfH = ((rows - 1) * spacing) / 2;

  // Create intersection nodes as a 2D grid
  const nodeGrid: StreetNode[][] = [];
  const allNodes: StreetNode[] = [];

  for (let r = 0; r < rows; r++) {
    nodeGrid[r] = [];
    for (let c = 0; c < cols; c++) {
      const jitterX = (rand() - 0.5) * spacing * 0.1;
      const jitterZ = (rand() - 0.5) * spacing * 0.1;
      const node: StreetNode = {
        id: `node_${r}_${c}`,
        x: config.centerX - halfW + c * spacing + jitterX,
        z: config.centerZ - halfH + r * spacing + jitterZ,
        intersectionOf: [],
      };
      nodeGrid[r][c] = node;
      allNodes.push(node);
    }
  }

  const segments: StreetSegment[] = [];

  // NS streets (columns): traverse rows top-to-bottom for each column
  for (let c = 0; c < cols; c++) {
    const segId = `street_ns_${c}`;
    const name = NS_STREET_NAMES[c % NS_STREET_NAMES.length];
    const nodeIds: string[] = [];
    const waypoints: { x: number; z: number }[] = [];

    for (let r = 0; r < rows; r++) {
      const node = nodeGrid[r][c];
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }

    segments.push({ id: segId, name, direction: 'NS', nodeIds, waypoints, width });
  }

  // EW streets (rows): traverse columns left-to-right for each row
  for (let r = 0; r < rows; r++) {
    const segId = `street_ew_${r}`;
    const name = EW_STREET_NAMES[r % EW_STREET_NAMES.length];
    const nodeIds: string[] = [];
    const waypoints: { x: number; z: number }[] = [];

    for (let c = 0; c < cols; c++) {
      const node = nodeGrid[r][c];
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }

    segments.push({ id: segId, name, direction: 'EW', nodeIds, waypoints, width });
  }

  return { nodes: allNodes, segments };
}

// ─────────────────────────────────────────────
// Organic / radial layout
// ─────────────────────────────────────────────

function generateOrganicNetwork(config: StreetNetworkConfig): StreetNetwork {
  const rand = createSeededRandom(`${config.seed}_streets_organic`);
  const size = GRID_SIZE[config.settlementType] || 5;
  const spacing = GRID_SPACING[config.settlementType] || 35;
  const width = STREET_WIDTH[config.settlementType] || 2.5;

  // Number of radial spokes and ring roads
  const spokeCount = Math.max(3, Math.floor(size * 0.8) + 1);
  const ringCount = Math.max(1, Math.floor(size / 2));
  const maxRadius = (size * spacing) / 2;

  const allNodes: StreetNode[] = [];
  const nodeMap = new Map<string, StreetNode>();
  const segments: StreetSegment[] = [];

  // Center node
  const centerNode: StreetNode = {
    id: 'node_center',
    x: config.centerX,
    z: config.centerZ,
    intersectionOf: [],
  };
  allNodes.push(centerNode);
  nodeMap.set(centerNode.id, centerNode);

  // Create ring nodes at each spoke × ring intersection
  const ringNodes: StreetNode[][] = []; // [ring][spoke]
  for (let ring = 0; ring < ringCount; ring++) {
    ringNodes[ring] = [];
    const radius = maxRadius * ((ring + 1) / ringCount);

    for (let spoke = 0; spoke < spokeCount; spoke++) {
      const baseAngle = (spoke / spokeCount) * 2 * Math.PI;
      // Add organic jitter to angle and radius
      const angleJitter = (rand() - 0.5) * (Math.PI / spokeCount) * 0.4;
      const radiusJitter = (rand() - 0.5) * spacing * 0.3;

      const angle = baseAngle + angleJitter;
      const r = radius + radiusJitter;

      const node: StreetNode = {
        id: `node_r${ring}_s${spoke}`,
        x: config.centerX + Math.cos(angle) * r,
        z: config.centerZ + Math.sin(angle) * r,
        intersectionOf: [],
      };
      ringNodes[ring][spoke] = node;
      allNodes.push(node);
      nodeMap.set(node.id, node);
    }
  }

  // Radial streets (spokes): center → ring0 → ring1 → ...
  for (let spoke = 0; spoke < spokeCount; spoke++) {
    const segId = `street_spoke_${spoke}`;
    const name = ORGANIC_STREET_NAMES[spoke % ORGANIC_STREET_NAMES.length];
    const nodeIds: string[] = [centerNode.id];
    const waypoints: { x: number; z: number }[] = [{ x: centerNode.x, z: centerNode.z }];

    centerNode.intersectionOf.push(segId);

    for (let ring = 0; ring < ringCount; ring++) {
      const node = ringNodes[ring][spoke];
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }

    segments.push({ id: segId, name, direction: 'NS', nodeIds, waypoints, width });
  }

  // Ring streets: connect nodes around each ring
  for (let ring = 0; ring < ringCount; ring++) {
    const segId = `street_ring_${ring}`;
    const name = `Ring ${ring + 1}`;
    const nodeIds: string[] = [];
    const waypoints: { x: number; z: number }[] = [];

    for (let spoke = 0; spoke < spokeCount; spoke++) {
      const node = ringNodes[ring][spoke];
      node.intersectionOf.push(segId);
      nodeIds.push(node.id);
      waypoints.push({ x: node.x, z: node.z });
    }
    // Close the ring by connecting back to the first node
    const firstNode = ringNodes[ring][0];
    nodeIds.push(firstNode.id);
    waypoints.push({ x: firstNode.x, z: firstNode.z });

    segments.push({ id: segId, name, direction: 'EW', nodeIds, waypoints, width });
  }

  return { nodes: allNodes, segments };
}

// ─────────────────────────────────────────────
// Lot placement along streets
// ─────────────────────────────────────────────

export interface LotPlacement {
  /** World-space position */
  x: number;
  z: number;
  /** Street this lot faces */
  streetId: string;
  streetName: string;
  /** House number */
  houseNumber: number;
  /** Which side of the street ('left' or 'right') */
  side: 'left' | 'right';
  /** Facing angle in radians (building faces the street) */
  facingAngle: number;
}

/**
 * Place lots along street segments. Returns positions offset from street
 * centerlines so buildings sit beside the road, not on it.
 */
export function placeLots(
  network: StreetNetwork,
  lotCount: number,
  seed: string,
): LotPlacement[] {
  const rand = createSeededRandom(`${seed}_lot_placement`);
  const placements: LotPlacement[] = [];

  // Distribute lots roughly evenly among segments, skip ring-closing duplicates
  const segments = network.segments;
  if (segments.length === 0 || lotCount <= 0) return placements;

  // Calculate total usable length across all segments to distribute proportionally
  const segLengths = segments.map(seg => {
    let len = 0;
    for (let i = 1; i < seg.waypoints.length; i++) {
      const dx = seg.waypoints[i].x - seg.waypoints[i - 1].x;
      const dz = seg.waypoints[i].z - seg.waypoints[i - 1].z;
      len += Math.sqrt(dx * dx + dz * dz);
    }
    return len;
  });
  const totalLength = segLengths.reduce((a, b) => a + b, 0);

  // Assign lot counts per segment proportionally
  const lotCounts: number[] = segments.map((_, i) =>
    Math.max(1, Math.round((segLengths[i] / totalLength) * lotCount)),
  );

  // Adjust to match target total
  let sum = lotCounts.reduce((a, b) => a + b, 0);
  while (sum > lotCount && lotCounts.some(c => c > 1)) {
    const idx = Math.floor(rand() * lotCounts.length);
    if (lotCounts[idx] > 1) { lotCounts[idx]--; sum--; }
  }
  while (sum < lotCount) {
    const idx = Math.floor(rand() * lotCounts.length);
    lotCounts[idx]++; sum++;
  }

  const LOT_OFFSET = 10; // distance from street centerline

  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const count = lotCounts[si];
    const wp = seg.waypoints;

    for (let li = 0; li < count; li++) {
      // Interpolate along the polyline
      const t = (li + 0.5) / count;
      const pos = interpolatePolyline(wp, t);
      const tangent = polylineTangent(wp, t);

      // Alternate sides
      const side: 'left' | 'right' = li % 2 === 0 ? 'left' : 'right';
      const sign = side === 'left' ? -1 : 1;

      // Normal = perpendicular to tangent
      const nx = -tangent.z * sign;
      const nz = tangent.x * sign;

      // Facing angle: building faces back toward the street (opposite of offset normal)
      const facingAngle = Math.atan2(-nx, -nz);

      placements.push({
        x: pos.x + nx * LOT_OFFSET,
        z: pos.z + nz * LOT_OFFSET,
        streetId: seg.id,
        streetName: seg.name,
        houseNumber: li + 1,
        side,
        facingAngle,
      });
    }
  }

  return placements;
}

// ─────────────────────────────────────────────
// Geometry helpers
// ─────────────────────────────────────────────

/** Interpolate a position along a polyline at parameter t ∈ [0, 1]. */
function interpolatePolyline(
  points: { x: number; z: number }[],
  t: number,
): { x: number; z: number } {
  if (points.length === 0) return { x: 0, z: 0 };
  if (points.length === 1 || t <= 0) return { ...points[0] };
  if (t >= 1) return { ...points[points.length - 1] };

  // Calculate cumulative distances
  const dists: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dz = points[i].z - points[i - 1].z;
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dz * dz));
  }
  const totalLen = dists[dists.length - 1];
  if (totalLen === 0) return { ...points[0] };

  const targetDist = t * totalLen;

  // Find the segment containing targetDist
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetDist) {
      const segLen = dists[i] - dists[i - 1];
      const segT = segLen > 0 ? (targetDist - dists[i - 1]) / segLen : 0;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * segT,
        z: points[i - 1].z + (points[i].z - points[i - 1].z) * segT,
      };
    }
  }
  return { ...points[points.length - 1] };
}

/** Get the normalized tangent direction at parameter t along a polyline. */
function polylineTangent(
  points: { x: number; z: number }[],
  t: number,
): { x: number; z: number } {
  if (points.length < 2) return { x: 1, z: 0 };

  // Find which segment we're on
  const dists: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dz = points[i].z - points[i - 1].z;
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dz * dz));
  }
  const totalLen = dists[dists.length - 1];
  if (totalLen === 0) return { x: 1, z: 0 };

  const targetDist = Math.min(Math.max(t, 0), 1) * totalLen;

  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetDist || i === dists.length - 1) {
      const dx = points[i].x - points[i - 1].x;
      const dz = points[i].z - points[i - 1].z;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len === 0) return { x: 1, z: 0 };
      return { x: dx / len, z: dz / len };
    }
  }
  return { x: 1, z: 0 };
}
