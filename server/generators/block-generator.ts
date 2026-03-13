/**
 * Block Generator — Finds enclosed city blocks in a street network.
 *
 * Uses minimal cycle detection on the planar street graph to find enclosed
 * polygon faces. Each lot is then assigned to the block whose polygon
 * contains it. Block numbers increase outward from settlement center.
 */

import type { StreetNetwork, StreetNode, StreetEdge, Block, Vec3 } from '../../shared/game-engine/types';
import type { LotPosition } from './lot-generator';

interface Vec2 {
  x: number;
  z: number;
}

/**
 * Build adjacency list for nodes, with edges sorted by angle.
 * For planar face extraction we need edges sorted counter-clockwise
 * around each node.
 */
function buildPlanarAdjacency(
  network: StreetNetwork,
): Map<string, { neighborId: string; edgeId: string; angle: number }[]> {
  const nodeMap = new Map<string, StreetNode>();
  for (const node of network.nodes) nodeMap.set(node.id, node);

  const adj = new Map<string, { neighborId: string; edgeId: string; angle: number }[]>();

  for (const node of network.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of network.edges) {
    const fromNode = nodeMap.get(edge.fromNodeId);
    const toNode = nodeMap.get(edge.toNodeId);
    if (!fromNode || !toNode) continue;

    // Angle from fromNode to toNode
    const dx1 = toNode.position.x - fromNode.position.x;
    const dz1 = toNode.position.z - fromNode.position.z;
    const angle1 = Math.atan2(dz1, dx1);

    // Angle from toNode to fromNode
    const angle2 = Math.atan2(-dz1, -dx1);

    adj.get(edge.fromNodeId)!.push({ neighborId: edge.toNodeId, edgeId: edge.id, angle: angle1 });
    adj.get(edge.toNodeId)!.push({ neighborId: edge.fromNodeId, edgeId: edge.id, angle: angle2 });
  }

  // Sort neighbors by angle at each node
  for (const [, neighbors] of Array.from(adj)) {
    neighbors.sort((a, b) => a.angle - b.angle);
  }

  return adj;
}

/**
 * Extract minimal faces from a planar graph using the "next edge" algorithm.
 *
 * For each directed half-edge (u→v), the next edge in the face is found by
 * taking the edge that comes just after the reverse direction (v→u) in the
 * sorted adjacency list of v, going counter-clockwise.
 *
 * This finds all minimal faces including the outer (unbounded) face.
 */
function extractMinimalFaces(
  network: StreetNetwork,
  adj: Map<string, { neighborId: string; edgeId: string; angle: number }[]>,
): { nodeIds: string[]; edgeIds: string[] }[] {
  // Track which directed half-edges have been used
  const usedHalfEdges = new Set<string>(); // "fromId->toId"

  const faces: { nodeIds: string[]; edgeIds: string[] }[] = [];

  // For each edge, try both directions
  for (const edge of network.edges) {
    for (const [startId, nextId] of [[edge.fromNodeId, edge.toNodeId], [edge.toNodeId, edge.fromNodeId]]) {
      const halfEdgeKey = `${startId}->${nextId}`;
      if (usedHalfEdges.has(halfEdgeKey)) continue;

      // Trace the face
      const faceNodes: string[] = [];
      const faceEdges: string[] = [];

      // First step: go from startId to nextId
      faceNodes.push(startId);
      usedHalfEdges.add(halfEdgeKey);

      // Find the edge ID for startId->nextId
      const startNeighbors = adj.get(startId);
      if (startNeighbors) {
        const entry = startNeighbors.find(n => n.neighborId === nextId);
        if (entry) faceEdges.push(entry.edgeId);
      }

      let currentId = nextId;
      let prevId = startId;

      let maxSteps = network.nodes.length + 2;
      while (currentId !== startId && maxSteps-- > 0) {
        faceNodes.push(currentId);

        // Find the "next" edge: the one that comes just after the reverse direction
        const neighbors = adj.get(currentId);
        if (!neighbors || neighbors.length === 0) break;

        // Find the angle of the incoming edge (prevId -> currentId reversed = currentId -> prevId)
        const reverseAngle = Math.atan2(
          getNodePos(prevId, network).z - getNodePos(currentId, network).z,
          getNodePos(prevId, network).x - getNodePos(currentId, network).x,
        );

        // Find the neighbor just after reverseAngle in sorted order (next CW = previous in sorted CCW list)
        // We want the next edge clockwise after the reverse direction
        let nextIdx = -1;
        for (let i = 0; i < neighbors.length; i++) {
          if (neighbors[i].neighborId === prevId && Math.abs(neighbors[i].angle - reverseAngle) < 1e-9) {
            nextIdx = i;
            break;
          }
        }

        if (nextIdx === -1) {
          // Fallback: find by neighborId only
          nextIdx = neighbors.findIndex(n => n.neighborId === prevId);
        }

        if (nextIdx === -1) break;

        // Next edge in CW traversal (previous in CCW-sorted array)
        const nextNeighborIdx = (nextIdx - 1 + neighbors.length) % neighbors.length;
        const nextNeighbor = neighbors[nextNeighborIdx];

        const nextHalfEdge = `${currentId}->${nextNeighbor.neighborId}`;
        if (usedHalfEdges.has(nextHalfEdge)) break;
        usedHalfEdges.add(nextHalfEdge);

        faceEdges.push(nextNeighbor.edgeId);
        prevId = currentId;
        currentId = nextNeighbor.neighborId;
      }

      if (currentId === startId && faceNodes.length >= 3) {
        faces.push({ nodeIds: faceNodes, edgeIds: Array.from(new Set(faceEdges)) });
      }
    }
  }

  return faces;
}

function getNodePos(nodeId: string, network: StreetNetwork): Vec2 {
  const node = network.nodes.find(n => n.id === nodeId);
  return node ? node.position : { x: 0, z: 0 };
}

/**
 * Compute the signed area of a polygon (positive = CCW, negative = CW).
 */
function signedArea(polygon: Vec2[]): number {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].z;
    area -= polygon[j].x * polygon[i].z;
  }
  return area / 2;
}

/**
 * Compute the centroid of a polygon.
 */
function polygonCentroid(polygon: Vec2[]): Vec2 {
  let cx = 0, cz = 0;
  for (const p of polygon) {
    cx += p.x;
    cz += p.z;
  }
  return { x: cx / polygon.length, z: cz / polygon.length };
}

/**
 * Test if a point is inside a polygon using ray casting.
 */
function pointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, zi = polygon[i].z;
    const xj = polygon[j].x, zj = polygon[j].z;

    if ((zi > point.z) !== (zj > point.z) &&
        point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Distance from a point to origin (settlement center).
 */
function dist2D(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Generate city blocks from a street network by finding enclosed polygon faces.
 *
 * Each block is a minimal cycle (face) in the planar street graph.
 * Block numbers increase outward from the settlement center (100, 200, 300...).
 */
export function generateBlocks(
  network: StreetNetwork,
  centerPoint?: Vec2,
): Block[] {
  if (network.nodes.length < 3 || network.edges.length < 3) return [];

  const adj = buildPlanarAdjacency(network);
  const rawFaces = extractMinimalFaces(network, adj);

  // Compute center if not provided
  const center: Vec2 = centerPoint ?? (() => {
    let sx = 0, sz = 0;
    for (const node of network.nodes) {
      sx += node.position.x;
      sz += node.position.z;
    }
    return { x: sx / network.nodes.length, z: sz / network.nodes.length };
  })();

  // Convert faces to polygons and filter
  const blocks: Block[] = [];
  let blockIndex = 0;

  for (const face of rawFaces) {
    // Build polygon from node positions
    const polygon: Vec2[] = face.nodeIds.map(id => {
      const node = network.nodes.find(n => n.id === id);
      return node ? { x: node.position.x, z: node.position.z } : { x: 0, z: 0 };
    });

    const area = signedArea(polygon);

    // Skip degenerate faces with very small area
    if (Math.abs(area) < 1) continue;

    // The outer (unbounded) face has negative signed area (CW winding).
    // Inner faces (city blocks) have positive signed area (CCW winding).
    // Only keep inner faces.
    if (area < 0) continue;

    const centroid = polygonCentroid(polygon);
    const distFromCenter = dist2D(centroid, center);

    blocks.push({
      id: `block-${blockIndex}`,
      boundaryStreetIds: face.edgeIds,
      polygon,
      districtId: '',
      blockNumber: 0, // Will be assigned after sorting
      center: { x: centroid.x, y: 0, z: centroid.z },
    });

    // Tag with distance for sorting
    (blocks[blocks.length - 1] as any).__distFromCenter = distFromCenter;
    blockIndex++;
  }

  if (blocks.length === 0) return [];

  const finalBlocks = blocks;

  // Sort by distance from center and assign block numbers (100, 200, 300...)
  finalBlocks.sort((a, b) => (a as any).__distFromCenter - (b as any).__distFromCenter);

  for (let i = 0; i < finalBlocks.length; i++) {
    finalBlocks[i].blockNumber = (i + 1) * 100;
    finalBlocks[i].id = `block-${i}`;
    // Clean up temporary fields
    delete (finalBlocks[i] as any).__distFromCenter;
  }

  return finalBlocks;
}

/**
 * Assign each lot to the block whose polygon contains it.
 * Mutates the lots array by adding a `blockId` field.
 */
export function assignLotsToBlocks(
  lots: LotPosition[],
  blocks: Block[],
): void {
  for (const lot of lots) {
    const point: Vec2 = { x: lot.position.x, z: lot.position.z };

    for (const block of blocks) {
      if (pointInPolygon(point, block.polygon)) {
        (lot as any).blockId = block.id;
        break;
      }
    }
  }
}
