/**
 * Address Generator — Assigns spatially coherent house numbers to lots.
 *
 * Numbers increase away from settlement center along each street.
 * Left side gets odd numbers; right side gets even.
 * Grid layouts use block-based numbering (100s, 200s, etc.).
 */

import type { StreetNetwork, StreetEdge, StreetNode, Vec3 } from '../../shared/game-engine/types';
import type { LotPosition } from './lot-generator';

export interface Vec2 {
  x: number;
  z: number;
}

/** Extended lot with address information */
export interface AddressedLot extends LotPosition {
  houseNumber: number;
  streetName: string;
  address: string;
}

/** Street type priority — higher-priority streets win for corner lots */
const streetTypePriority: Record<string, number> = {
  highway: 7,
  boulevard: 6,
  main_road: 5,
  avenue: 4,
  residential: 3,
  lane: 2,
  alley: 1,
};

/**
 * Group edges that share the same street name into chains, ordered by
 * distance from center along the chain direction.
 */
function groupEdgesByStreetName(network: StreetNetwork): Map<string, StreetEdge[]> {
  const groups = new Map<string, StreetEdge[]>();
  for (const edge of network.edges) {
    const name = edge.name;
    if (!name) continue;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(edge);
  }
  return groups;
}

/**
 * Build a node lookup map.
 */
function buildNodeMap(network: StreetNetwork): Map<string, StreetNode> {
  const map = new Map<string, StreetNode>();
  for (const node of network.nodes) map.set(node.id, node);
  return map;
}

/**
 * Compute the midpoint of an edge's waypoints.
 */
function edgeMidpoint(edge: StreetEdge): Vec2 {
  if (edge.waypoints.length === 0) return { x: 0, z: 0 };
  let sx = 0, sz = 0;
  for (const wp of edge.waypoints) { sx += wp.x; sz += wp.z; }
  return { x: sx / edge.waypoints.length, z: sz / edge.waypoints.length };
}

/**
 * Distance from a point to the settlement center (2D).
 */
function distToCenter(p: Vec2, center: Vec2): number {
  const dx = p.x - center.x;
  const dz = p.z - center.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Detect if this street name group has a grid layout (edges connect
 * at intersection nodes that are shared with perpendicular streets).
 * Returns the number of intersection nodes along the chain.
 */
function countIntersections(
  edges: StreetEdge[],
  network: StreetNetwork,
): number {
  // Nodes used by this street's edges
  const streetNodes = new Set<string>();
  for (const edge of edges) {
    streetNodes.add(edge.fromNodeId);
    streetNodes.add(edge.toNodeId);
  }

  // Count nodes that are also used by other streets
  const thisStreetEdgeIds = new Set(edges.map(e => e.id));
  let intersections = 0;
  for (const nodeId of Array.from(streetNodes)) {
    const hasOtherStreet = network.edges.some(
      e => !thisStreetEdgeIds.has(e.id) && (e.fromNodeId === nodeId || e.toNodeId === nodeId)
    );
    if (hasOtherStreet) intersections++;
  }
  return intersections;
}

/**
 * Determine which side of the street (relative to direction away from center)
 * is "left". Returns true if the lot's physical left side corresponds to
 * the "away from center" direction's left.
 *
 * We compute this by looking at the edge direction oriented away from center
 * and checking which side the lot is on.
 */
function getDirectedSide(
  lot: LotPosition,
  edge: StreetEdge,
  nodeMap: Map<string, StreetNode>,
  center: Vec2,
): 'left' | 'right' {
  const fromNode = nodeMap.get(edge.fromNodeId);
  const toNode = nodeMap.get(edge.toNodeId);
  if (!fromNode || !toNode) return lot.side;

  const fromDist = distToCenter(fromNode.position, center);
  const toDist = distToCenter(toNode.position, center);

  // If edge is oriented away from center (from closer, to further), keep side
  // If reversed (from further, to closer), flip side
  if (fromDist <= toDist) {
    return lot.side;
  } else {
    return lot.side === 'left' ? 'right' : 'left';
  }
}

/**
 * For a lot, compute its distance from the settlement center measured along the street.
 * Uses the closest node of the edge to center as the "start" of numbering direction.
 */
function directedDistanceAlongStreet(
  lot: LotPosition,
  edge: StreetEdge,
  nodeMap: Map<string, StreetNode>,
  center: Vec2,
): number {
  const fromNode = nodeMap.get(edge.fromNodeId);
  const toNode = nodeMap.get(edge.toNodeId);
  if (!fromNode || !toNode) return lot.distanceAlongStreet;

  const fromDist = distToCenter(fromNode.position, center);
  const toDist = distToCenter(toNode.position, center);

  if (fromDist <= toDist) {
    // Edge already oriented away from center
    return lot.distanceAlongStreet;
  } else {
    // Edge oriented toward center — flip the distance
    const edgeLength = edge.length || polylineLength(edge.waypoints);
    return edgeLength - lot.distanceAlongStreet;
  }
}

/**
 * Compute polyline length.
 */
function polylineLength(waypoints: Vec3[]): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dz = waypoints[i].z - waypoints[i - 1].z;
    total += Math.sqrt(dx * dx + dz * dz);
  }
  return total;
}

/**
 * For a chain of edges sharing a street name, compute the cumulative distance
 * offset for each edge from the settlement center.
 * Returns a map: edgeId → cumulative distance before this edge starts.
 */
function computeChainOffsets(
  edges: StreetEdge[],
  nodeMap: Map<string, StreetNode>,
  center: Vec2,
): Map<string, number> {
  if (edges.length <= 1) {
    const offsets = new Map<string, number>();
    if (edges.length === 1) offsets.set(edges[0].id, 0);
    return offsets;
  }

  // Build adjacency: nodeId -> edges in this chain
  const nodeEdges = new Map<string, StreetEdge[]>();
  for (const edge of edges) {
    if (!nodeEdges.has(edge.fromNodeId)) nodeEdges.set(edge.fromNodeId, []);
    if (!nodeEdges.has(edge.toNodeId)) nodeEdges.set(edge.toNodeId, []);
    nodeEdges.get(edge.fromNodeId)!.push(edge);
    nodeEdges.get(edge.toNodeId)!.push(edge);
  }

  // Find the edge endpoint closest to center — that's the chain start
  let closestNodeId = edges[0].fromNodeId;
  let closestDist = Infinity;
  for (const edge of edges) {
    for (const nid of [edge.fromNodeId, edge.toNodeId]) {
      const node = nodeMap.get(nid);
      if (node) {
        const d = distToCenter(node.position, center);
        if (d < closestDist) {
          closestDist = d;
          closestNodeId = nid;
        }
      }
    }
  }

  // Walk the chain from closest node outward, accumulating distance
  const offsets = new Map<string, number>();
  const visited = new Set<string>();
  const queue: { nodeId: string; cumulativeDistance: number }[] = [{ nodeId: closestNodeId, cumulativeDistance: 0 }];

  while (queue.length > 0) {
    const { nodeId, cumulativeDistance } = queue.shift()!;
    const adjacentEdges = nodeEdges.get(nodeId) ?? [];
    for (const edge of adjacentEdges) {
      if (visited.has(edge.id)) continue;
      visited.add(edge.id);
      offsets.set(edge.id, cumulativeDistance);
      const otherNodeId = edge.fromNodeId === nodeId ? edge.toNodeId : edge.fromNodeId;
      const edgeLen = edge.length || polylineLength(edge.waypoints);
      queue.push({ nodeId: otherNodeId, cumulativeDistance: cumulativeDistance + edgeLen });
    }
  }

  return offsets;
}

/**
 * Assign addresses to lots based on their position along streets.
 *
 * - Left side (relative to direction away from center) gets odd numbers
 * - Right side gets even numbers
 * - Numbers increase monotonically away from settlement center
 * - Grid layouts use block-based numbering (100s, 200s, etc.)
 * - Corner lots get the address of the higher-priority street
 * - Full address format: "houseNumber streetName" (e.g. "42 Oak Ave")
 */
export function assignAddresses(
  lots: LotPosition[],
  network: StreetNetwork,
  centerPoint: Vec2,
): void {
  if (lots.length === 0 || network.edges.length === 0) return;

  const nodeMap = buildNodeMap(network);
  const edgeMap = new Map<string, StreetEdge>();
  for (const edge of network.edges) edgeMap.set(edge.id, edge);

  const streetGroups = groupEdgesByStreetName(network);

  // Precompute chain offsets and intersection counts per street
  const chainOffsets = new Map<string, Map<string, number>>();
  const streetIntersections = new Map<string, number>();
  for (const [name, edges] of Array.from(streetGroups)) {
    chainOffsets.set(name, computeChainOffsets(edges, nodeMap, centerPoint));
    streetIntersections.set(name, countIntersections(edges, network));
  }

  // Detect grid layout: if many streets have ≥2 intersections
  const streetsWithIntersections = Array.from(streetIntersections.values()).filter(n => n >= 2).length;
  const isGrid = streetsWithIntersections >= 4;

  // Group lots by street name
  const lotsByStreet = new Map<string, { lot: LotPosition; edge: StreetEdge }[]>();
  for (const lot of lots) {
    const edge = edgeMap.get(lot.streetEdgeId);
    if (!edge || !edge.name) continue;
    if (!lotsByStreet.has(edge.name)) lotsByStreet.set(edge.name, []);
    lotsByStreet.get(edge.name)!.push({ lot, edge });
  }

  // Check for corner lots: lots close to intersection nodes on multiple streets
  // A corner lot is near an intersection node. It should get the higher-priority street.
  const cornerReassignments = new Map<LotPosition, string>(); // lot -> better street name

  for (const lot of lots) {
    const edge = edgeMap.get(lot.streetEdgeId);
    if (!edge || !edge.name) continue;

    // Check if this lot is near an intersection (close to a node shared with another street)
    const edgeLen = edge.length || polylineLength(edge.waypoints);
    const nearStart = lot.distanceAlongStreet < edge.width * 2;
    const nearEnd = lot.distanceAlongStreet > edgeLen - edge.width * 2;

    if (!nearStart && !nearEnd) continue;

    const nearNodeId = nearStart ? edge.fromNodeId : edge.toNodeId;

    // Find other edges at this node
    for (const otherEdge of network.edges) {
      if (otherEdge.id === edge.id) continue;
      if (otherEdge.fromNodeId !== nearNodeId && otherEdge.toNodeId !== nearNodeId) continue;
      if (!otherEdge.name || otherEdge.name === edge.name) continue;

      const currentPriority = streetTypePriority[edge.streetType] ?? 0;
      const otherPriority = streetTypePriority[otherEdge.streetType] ?? 0;

      if (otherPriority > currentPriority) {
        cornerReassignments.set(lot, otherEdge.name);
      }
    }
  }

  // Apply corner reassignments: move lots to their higher-priority street group
  for (const [lot, newStreetName] of Array.from(cornerReassignments)) {
    const oldEdge = edgeMap.get(lot.streetEdgeId);
    if (!oldEdge) continue;

    // Remove from old group
    const oldGroup = lotsByStreet.get(oldEdge.name);
    if (oldGroup) {
      const idx = oldGroup.findIndex(item => item.lot === lot);
      if (idx >= 0) oldGroup.splice(idx, 1);
    }

    // Find the closest edge of the new street to this lot
    const newStreetEdges = streetGroups.get(newStreetName) ?? [];
    let closestEdge = newStreetEdges[0];
    let closestDist = Infinity;
    for (const e of newStreetEdges) {
      const mid = edgeMidpoint(e);
      const d = Math.sqrt((lot.position.x - mid.x) ** 2 + (lot.position.z - mid.z) ** 2);
      if (d < closestDist) {
        closestDist = d;
        closestEdge = e;
      }
    }

    if (closestEdge) {
      if (!lotsByStreet.has(newStreetName)) lotsByStreet.set(newStreetName, []);
      lotsByStreet.get(newStreetName)!.push({ lot, edge: closestEdge });
    }
  }

  // Assign numbers per street
  const usedAddresses = new Set<string>();

  for (const [streetName, streetLots] of Array.from(lotsByStreet)) {
    if (streetLots.length === 0) continue;

    const offsets = chainOffsets.get(streetName) ?? new Map<string, number>();
    const intersectionCount = streetIntersections.get(streetName) ?? 0;
    const useBlockNumbering = isGrid && intersectionCount >= 2;

    // Compute directed distance from center for each lot
    const lotsWithDistance: {
      lot: LotPosition;
      edge: StreetEdge;
      directedDist: number;
      directedSide: 'left' | 'right';
    }[] = [];

    for (const { lot, edge } of streetLots) {
      const chainOffset = offsets.get(edge.id) ?? 0;
      const distWithinEdge = directedDistanceAlongStreet(lot, edge, nodeMap, centerPoint);
      const totalDist = chainOffset + distWithinEdge;
      const side = getDirectedSide(lot, edge, nodeMap, centerPoint);

      lotsWithDistance.push({
        lot,
        edge,
        directedDist: totalDist,
        directedSide: side,
      });
    }

    // Sort by directed distance
    lotsWithDistance.sort((a, b) => a.directedDist - b.directedDist);

    // Split into odd (left) and even (right) sequences
    const leftLots = lotsWithDistance.filter(l => l.directedSide === 'left');
    const rightLots = lotsWithDistance.filter(l => l.directedSide === 'right');

    if (useBlockNumbering) {
      // Block-based numbering: 100s, 200s, etc.
      assignBlockNumbers(leftLots, offsets, streetName, 'odd', usedAddresses);
      assignBlockNumbers(rightLots, offsets, streetName, 'even', usedAddresses);
    } else {
      // Simple monotonic numbering with distance-proportional gaps
      assignMonotonicNumbers(leftLots, streetName, 'odd', usedAddresses);
      assignMonotonicNumbers(rightLots, streetName, 'even', usedAddresses);
    }
  }
}

/**
 * Assign monotonic numbers with gaps proportional to physical distance.
 */
function assignMonotonicNumbers(
  sortedLots: { lot: LotPosition; edge: StreetEdge; directedDist: number }[],
  streetName: string,
  parity: 'odd' | 'even',
  usedAddresses: Set<string>,
): void {
  if (sortedLots.length === 0) return;

  const startNum = parity === 'odd' ? 1 : 2;
  const step = 2;

  // Compute distance range
  const minDist = sortedLots[0].directedDist;
  const maxDist = sortedLots[sortedLots.length - 1].directedDist;
  const range = maxDist - minDist;

  // Target: numbers from startNum to roughly startNum + sortedLots.length * 4
  // With gaps proportional to physical distance
  const maxNumber = startNum + Math.max(sortedLots.length * 4, 20);

  let lastNumber = startNum - step;

  for (let i = 0; i < sortedLots.length; i++) {
    const { lot, directedDist } = sortedLots[i];
    let num: number;

    if (range > 0 && sortedLots.length > 1) {
      // Proportional spacing
      const t = (directedDist - minDist) / range;
      num = startNum + Math.round(t * (maxNumber - startNum));
      // Snap to correct parity
      if (parity === 'odd' && num % 2 === 0) num++;
      if (parity === 'even' && num % 2 !== 0) num++;
      // Ensure monotonic increase
      if (num <= lastNumber) num = lastNumber + step;
    } else {
      num = lastNumber + step;
    }

    // Ensure unique within settlement
    let address = `${num} ${streetName}`;
    while (usedAddresses.has(address)) {
      num += step;
      address = `${num} ${streetName}`;
    }

    const addressedLot = lot as LotPosition & { houseNumber?: number; streetName?: string; address?: string };
    addressedLot.houseNumber = num;
    addressedLot.streetName = streetName;
    addressedLot.address = address;
    usedAddresses.add(address);
    lastNumber = num;
  }
}

/**
 * Assign block-based numbers for grid layouts.
 * Numbers increase by 100 at each intersection (block boundary).
 */
function assignBlockNumbers(
  sortedLots: { lot: LotPosition; edge: StreetEdge; directedDist: number }[],
  chainOffsets: Map<string, number>,
  streetName: string,
  parity: 'odd' | 'even',
  usedAddresses: Set<string>,
): void {
  if (sortedLots.length === 0) return;

  // Determine block boundaries from chain offsets (each edge boundary = new block)
  const boundaries = new Set<number>();
  for (const offset of Array.from(chainOffsets.values())) {
    if (offset > 0) boundaries.add(offset);
  }
  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

  const startNum = parity === 'odd' ? 1 : 2;
  const step = 2;
  let lastNumber = startNum - step;

  for (const { lot, directedDist } of sortedLots) {
    // Determine which block this lot is in
    let block = 0;
    for (const boundary of sortedBoundaries) {
      if (directedDist >= boundary) block++;
      else break;
    }

    const blockBase = (block + 1) * 100;
    let num = blockBase + startNum;

    // Snap to correct parity
    if (parity === 'odd' && num % 2 === 0) num++;
    if (parity === 'even' && num % 2 !== 0) num++;

    // Ensure monotonic increase
    if (num <= lastNumber) num = lastNumber + step;

    // Ensure unique
    let address = `${num} ${streetName}`;
    while (usedAddresses.has(address)) {
      num += step;
      address = `${num} ${streetName}`;
    }

    const addressedLot = lot as LotPosition & { houseNumber?: number; streetName?: string; address?: string };
    addressedLot.houseNumber = num;
    addressedLot.streetName = streetName;
    addressedLot.address = address;
    usedAddresses.add(address);
    lastNumber = num;
  }
}
