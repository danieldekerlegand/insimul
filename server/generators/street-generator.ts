/**
 * Street Generator — produces connected street network graphs for settlements.
 * Uses noise-based displacement for organic curves and cost-weighted pathfinding
 * to respect terrain slope.
 */

import { createNoise2D, fractalNoise } from '../../shared/procedural/noise';
import type { StreetNode, StreetEdge, StreetNetwork, StreetNodeType, StreetType } from '../../shared/game-engine/types';

export interface StreetGenConfig {
  center: { x: number; z: number };
  radius: number;
  settlementType: string;
  seed: string;
  slopeMap?: number[][];
}

interface InternalNode {
  id: string;
  x: number;
  z: number;
  type: StreetNodeType;
  tier: 'main' | 'secondary' | 'tertiary';
}

interface InternalEdge {
  id: string;
  fromId: string;
  toId: string;
  tier: 'main' | 'secondary' | 'tertiary';
  waypoints: { x: number; z: number }[];
}

/** Simple seeded PRNG using xorshift32 */
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

/** Distance between two 2D points */
function dist(ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  return Math.sqrt(dx * dx + dz * dz);
}

/** Normalize angle to [0, 2π) */
function normalizeAngle(a: number): number {
  while (a < 0) a += Math.PI * 2;
  while (a >= Math.PI * 2) a -= Math.PI * 2;
  return a;
}

export class StreetGenerator {
  private nodeCounter = 0;
  private edgeCounter = 0;

  private nextNodeId(): string {
    return `sn_${this.nodeCounter++}`;
  }

  private nextEdgeId(): string {
    return `se_${this.edgeCounter++}`;
  }

  /**
   * Generate an organic/medieval street layout.
   * Algorithm:
   * 1. Place center node
   * 2. Radiate 3-5 main roads at irregular angles
   * 3. Branch secondary roads off main roads
   * 4. Add tertiary curved connections between nearby dead ends
   * 5. Apply noise displacement for organic feel
   * 6. Ensure connectivity
   */
  generateOrganic(config: StreetGenConfig): StreetNetwork {
    this.nodeCounter = 0;
    this.edgeCounter = 0;

    const rng = seededRandom(config.seed);
    const noise = createNoise2D(config.seed + '_street');
    const { center, radius } = config;

    const nodes: InternalNode[] = [];
    const edges: InternalEdge[] = [];

    // 1. Center node
    const centerNode: InternalNode = {
      id: this.nextNodeId(),
      x: center.x,
      z: center.z,
      type: 'intersection',
      tier: 'main',
    };
    nodes.push(centerNode);

    // 2. Main roads radiating from center (3-5)
    const mainRoadCount = 3 + Math.floor(rng() * 3); // 3-5
    const baseAngle = rng() * Math.PI * 2;
    const mainEndNodes: InternalNode[] = [];

    for (let i = 0; i < mainRoadCount; i++) {
      const angleSpread = (Math.PI * 2) / mainRoadCount;
      const angle = baseAngle + i * angleSpread + (rng() - 0.5) * angleSpread * 0.4;
      const roadLength = radius * (0.6 + rng() * 0.4);

      // Generate main road with intermediate nodes
      const segments = 2 + Math.floor(rng() * 2); // 2-3 segments
      let prevNode = centerNode;

      for (let s = 1; s <= segments; s++) {
        const t = s / segments;
        const rawX = center.x + Math.cos(angle) * roadLength * t;
        const rawZ = center.z + Math.sin(angle) * roadLength * t;

        // Apply noise displacement for organic curves
        const displace = noise(rawX * 0.02, rawZ * 0.02) * radius * 0.08;
        const perpAngle = angle + Math.PI / 2;
        let nx = rawX + Math.cos(perpAngle) * displace;
        let nz = rawZ + Math.sin(perpAngle) * displace;

        // Slope avoidance: nudge away from steep terrain
        if (config.slopeMap) {
          const nudged = this.avoidSteepTerrain(nx, nz, config.slopeMap, radius, rng);
          nx = nudged.x;
          nz = nudged.z;
        }

        const nodeType: StreetNodeType = s === segments ? 'dead_end' : 'intersection';
        const node: InternalNode = {
          id: this.nextNodeId(),
          x: nx,
          z: nz,
          type: nodeType,
          tier: 'main',
        };
        nodes.push(node);

        edges.push(this.createEdge(prevNode, node, 'main'));
        prevNode = node;

        if (s === segments) {
          mainEndNodes.push(node);
        }
      }
    }

    // 3. Secondary roads branching off main road nodes
    const mainNodes = nodes.filter(n => n.tier === 'main' && n.id !== centerNode.id);
    const secondaryEndNodes: InternalNode[] = [];

    for (const mNode of mainNodes) {
      if (mNode.type === 'dead_end') continue; // Skip endpoints for branching
      const branchCount = Math.floor(rng() * 2) + 1; // 1-2 branches

      for (let b = 0; b < branchCount; b++) {
        // Branch at roughly perpendicular angle from main road
        const mainAngle = Math.atan2(mNode.z - center.z, mNode.x - center.x);
        const branchAngle = mainAngle + (rng() > 0.5 ? 1 : -1) * (Math.PI / 2 + (rng() - 0.5) * 0.6);
        const branchLength = radius * (0.2 + rng() * 0.25);

        const segs = 1 + Math.floor(rng() * 2); // 1-2 segments
        let prev = mNode;
        mNode.type = 'intersection'; // Node now has branches

        for (let s = 1; s <= segs; s++) {
          const t = s / segs;
          const rawX = mNode.x + Math.cos(branchAngle) * branchLength * t;
          const rawZ = mNode.z + Math.sin(branchAngle) * branchLength * t;

          const displace = noise(rawX * 0.03, rawZ * 0.03) * radius * 0.05;
          const perpAngle = branchAngle + Math.PI / 2;
          let nx = rawX + Math.cos(perpAngle) * displace;
          let nz = rawZ + Math.sin(perpAngle) * displace;

          if (config.slopeMap) {
            const nudged = this.avoidSteepTerrain(nx, nz, config.slopeMap, radius, rng);
            nx = nudged.x;
            nz = nudged.z;
          }

          // Check if too close to existing node — snap instead
          const nearby = this.findNearbyNode(nodes, nx, nz, radius * 0.08);
          if (nearby && nearby.id !== prev.id) {
            edges.push(this.createEdge(prev, nearby, 'secondary'));
            nearby.type = 'intersection';
            break;
          }

          const nodeType: StreetNodeType = s === segs ? 'dead_end' : 'intersection';
          const node: InternalNode = {
            id: this.nextNodeId(),
            x: nx,
            z: nz,
            type: nodeType,
            tier: 'secondary',
          };
          nodes.push(node);
          edges.push(this.createEdge(prev, node, 'secondary'));
          prev = node;

          if (s === segs) {
            secondaryEndNodes.push(node);
          }
        }
      }
    }

    // 4. Tertiary connections: connect nearby dead ends to improve connectivity
    const deadEnds = nodes.filter(n => n.type === 'dead_end');
    const maxTertiaryDist = radius * 0.35;

    for (let i = 0; i < deadEnds.length; i++) {
      for (let j = i + 1; j < deadEnds.length; j++) {
        const d = dist(deadEnds[i].x, deadEnds[i].z, deadEnds[j].x, deadEnds[j].z);
        if (d < maxTertiaryDist && d > radius * 0.05) {
          // Check that this edge doesn't already exist
          const exists = edges.some(
            e =>
              (e.fromId === deadEnds[i].id && e.toId === deadEnds[j].id) ||
              (e.fromId === deadEnds[j].id && e.toId === deadEnds[i].id)
          );
          if (!exists && rng() < 0.6) {
            edges.push(this.createEdge(deadEnds[i], deadEnds[j], 'tertiary'));
            deadEnds[i].type = 'intersection';
            deadEnds[j].type = 'intersection';
          }
        }
      }
    }

    // 5. Ensure full connectivity via MST-style bridge edges
    this.ensureConnectivity(nodes, edges);

    // 6. Apply final noise displacement to waypoints
    for (const edge of edges) {
      for (let w = 1; w < edge.waypoints.length - 1; w++) {
        const wp = edge.waypoints[w];
        const dx = noise(wp.x * 0.04, wp.z * 0.04) * radius * 0.02;
        const dz = noise(wp.z * 0.04, wp.x * 0.04) * radius * 0.02;
        wp.x += dx;
        wp.z += dz;
      }
    }

    // Convert to StreetNetwork
    return this.toStreetNetwork(nodes, edges);
  }

  /**
   * Generate a grid/planned street layout.
   * Algorithm:
   * 1. Compute grid dimensions N x M from settlement radius
   * 2. Place intersection nodes at grid positions, perturbed by noise
   * 3. Optionally rotate grid axis to align with a direction vector
   * 4. Mark every Nth row/column as main (boulevard); others residential
   * 5. Optionally add diagonal avenues for larger populations
   * 6. Ensure connectivity
   */
  generateGrid(config: StreetGenConfig & {
    population?: number;
    gridRotation?: { x: number; z: number };
    mainInterval?: number;
  }): StreetNetwork {
    this.nodeCounter = 0;
    this.edgeCounter = 0;

    const rng = seededRandom(config.seed);
    const noise = createNoise2D(config.seed + '_grid');
    const { center, radius } = config;
    const population = config.population ?? 500;
    const mainInterval = config.mainInterval ?? 4; // Every 4th row/col is boulevard

    // Compute grid dimensions from radius
    const blockSize = 40; // ~40 unit blocks
    const gridN = Math.max(3, Math.round((radius * 2) / blockSize));
    const gridM = Math.max(3, Math.round((radius * 2) / blockSize));

    // Compute rotation angle from direction vector
    let rotAngle = 0;
    if (config.gridRotation) {
      rotAngle = Math.atan2(config.gridRotation.z, config.gridRotation.x);
    }
    const cosR = Math.cos(rotAngle);
    const sinR = Math.sin(rotAngle);

    const nodes: InternalNode[] = [];
    const edges: InternalEdge[] = [];
    const nodeGrid: (InternalNode | null)[][] = [];

    // Perturbation amplitude: 2-5% of block size
    const perturbAmp = blockSize * 0.035; // ~3.5% average

    // 1. Place grid intersection nodes
    for (let row = 0; row <= gridN; row++) {
      nodeGrid[row] = [];
      for (let col = 0; col <= gridM; col++) {
        // Raw grid position centered on origin
        const rawX = (col - gridM / 2) * blockSize;
        const rawZ = (row - gridN / 2) * blockSize;

        // Apply rotation
        const rotX = rawX * cosR - rawZ * sinR;
        const rotZ = rawX * sinR + rawZ * cosR;

        // Apply noise perturbation for imperfection
        const pertX = noise(col * 0.5, row * 0.5) * perturbAmp;
        const pertZ = noise(row * 0.5 + 100, col * 0.5 + 100) * perturbAmp;

        let nx = center.x + rotX + pertX;
        let nz = center.z + rotZ + pertZ;

        // Slope avoidance
        if (config.slopeMap) {
          const nudged = this.avoidSteepTerrain(nx, nz, config.slopeMap, radius, rng);
          nx = nudged.x;
          nz = nudged.z;
        }

        // Determine tier: main if on mainInterval boundary
        const isMainRow = row % mainInterval === 0;
        const isMainCol = col % mainInterval === 0;
        const tier: 'main' | 'secondary' = (isMainRow || isMainCol) ? 'main' : 'secondary';

        const node: InternalNode = {
          id: this.nextNodeId(),
          x: nx,
          z: nz,
          type: 'intersection',
          tier,
        };
        nodes.push(node);
        nodeGrid[row][col] = node;
      }
    }

    // 2. Create horizontal edges (along rows)
    for (let row = 0; row <= gridN; row++) {
      for (let col = 0; col < gridM; col++) {
        const from = nodeGrid[row][col]!;
        const to = nodeGrid[row][col + 1]!;
        const isMainRow = row % mainInterval === 0;
        const tier: 'main' | 'secondary' = isMainRow ? 'main' : 'secondary';
        edges.push(this.createEdge(from, to, tier));
      }
    }

    // 3. Create vertical edges (along columns)
    for (let row = 0; row < gridN; row++) {
      for (let col = 0; col <= gridM; col++) {
        const from = nodeGrid[row][col]!;
        const to = nodeGrid[row + 1][col]!;
        const isMainCol = col % mainInterval === 0;
        const tier: 'main' | 'secondary' = isMainCol ? 'main' : 'secondary';
        edges.push(this.createEdge(from, to, tier));
      }
    }

    // 4. Optionally add diagonal avenues for cities (pop > 3000)
    if (population > 3000) {
      const diagCount = population > 8000 ? 2 : 1;
      for (let d = 0; d < diagCount; d++) {
        // Diagonal from corner-ish to opposite corner-ish
        const startRow = d === 0 ? 0 : 0;
        const startCol = d === 0 ? 0 : gridM;
        const endRow = gridN;
        const endCol = d === 0 ? gridM : 0;

        const steps = Math.min(gridN, gridM);
        let prevNode: InternalNode | null = null;

        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const row = Math.round(startRow + (endRow - startRow) * t);
          const col = Math.round(startCol + (endCol - startCol) * t);
          const clampedRow = Math.max(0, Math.min(gridN, row));
          const clampedCol = Math.max(0, Math.min(gridM, col));

          const node = nodeGrid[clampedRow][clampedCol]!;
          node.tier = 'main'; // Diagonal avenues are main streets
          if (prevNode && prevNode.id !== node.id) {
            // Check no duplicate edge
            const exists = edges.some(
              e => (e.fromId === prevNode!.id && e.toId === node.id) ||
                   (e.fromId === node.id && e.toId === prevNode!.id)
            );
            if (!exists) {
              edges.push(this.createEdge(prevNode, node, 'main'));
            }
          }
          prevNode = node;
        }
      }
    }

    // 5. Ensure connectivity (should already be connected for grid, but safety)
    this.ensureConnectivity(nodes, edges);

    return this.toStreetNetwork(nodes, edges);
  }

  /**
   * Generate a radial/concentric street layout for capitals and fortress towns.
   * Algorithm:
   * 1. Place central plaza node
   * 2. Radiate 6-8 boulevard edges outward at evenly-spaced angles (with slight noise)
   * 3. Add 2-4 concentric ring roads at increasing radii connecting the radials
   * 4. Apply noise-based lateral displacement to radial road waypoints
   * 5. Inner rings are boulevard type; outer rings are residential
   * 6. Ensure connectivity
   */
  generateRadial(config: StreetGenConfig): StreetNetwork {
    this.nodeCounter = 0;
    this.edgeCounter = 0;

    const rng = seededRandom(config.seed);
    const noise = createNoise2D(config.seed + '_radial');
    const { center, radius } = config;

    const nodes: InternalNode[] = [];
    const edges: InternalEdge[] = [];

    // 1. Central plaza node
    const plazaNode: InternalNode = {
      id: this.nextNodeId(),
      x: center.x,
      z: center.z,
      type: 'intersection',
      tier: 'main',
    };
    nodes.push(plazaNode);

    // 2. Radial boulevard count: 6-8
    const radialCount = 6 + Math.floor(rng() * 3); // 6, 7, or 8
    const baseAngle = rng() * Math.PI * 2;

    // 3. Ring count: 2-4
    const ringCount = 2 + Math.floor(rng() * 3); // 2, 3, or 4

    // Ring radii evenly spaced from ~20% to ~90% of settlement radius
    const ringRadii: number[] = [];
    for (let r = 0; r < ringCount; r++) {
      const t = (r + 1) / (ringCount + 1); // 0.33, 0.67 for 2 rings; 0.25, 0.5, 0.75 for 3, etc.
      ringRadii.push(radius * (0.15 + t * 0.75));
    }

    // Build a 2D array of nodes: radialNodes[ringIndex][radialIndex]
    // ringIndex 0 = innermost ring, ringCount-1 = outermost
    // Plus radial endpoints beyond the last ring
    const radialNodes: InternalNode[][] = [];

    for (let ri = 0; ri < ringCount; ri++) {
      radialNodes[ri] = [];
    }
    // Extra row for radial endpoints beyond last ring
    const radialEndNodes: InternalNode[] = [];

    // 4. Create radial roads from center outward, placing intersection nodes at each ring
    for (let i = 0; i < radialCount; i++) {
      const angleSpread = (Math.PI * 2) / radialCount;
      const angle = baseAngle + i * angleSpread + (rng() - 0.5) * angleSpread * 0.15;

      let prevNode = plazaNode;

      for (let ri = 0; ri < ringCount; ri++) {
        const ringR = ringRadii[ri];
        const rawX = center.x + Math.cos(angle) * ringR;
        const rawZ = center.z + Math.sin(angle) * ringR;

        // Apply noise-based lateral displacement for slight curves
        const displace = noise(rawX * 0.02, rawZ * 0.02) * radius * 0.04;
        const perpAngle = angle + Math.PI / 2;
        let nx = rawX + Math.cos(perpAngle) * displace;
        let nz = rawZ + Math.sin(perpAngle) * displace;

        // Slope avoidance
        if (config.slopeMap) {
          const nudged = this.avoidSteepTerrain(nx, nz, config.slopeMap, radius, rng);
          nx = nudged.x;
          nz = nudged.z;
        }

        const node: InternalNode = {
          id: this.nextNodeId(),
          x: nx,
          z: nz,
          type: 'intersection',
          tier: 'main',
        };
        nodes.push(node);
        radialNodes[ri][i] = node;

        // Edge from previous node along this radial
        edges.push(this.createEdge(prevNode, node, 'main'));
        prevNode = node;
      }

      // Radial endpoint beyond outermost ring
      const endR = radius * 0.92;
      const endRawX = center.x + Math.cos(angle) * endR;
      const endRawZ = center.z + Math.sin(angle) * endR;
      const endDisplace = noise(endRawX * 0.02, endRawZ * 0.02) * radius * 0.03;
      const endPerpAngle = angle + Math.PI / 2;
      let endX = endRawX + Math.cos(endPerpAngle) * endDisplace;
      let endZ = endRawZ + Math.sin(endPerpAngle) * endDisplace;

      if (config.slopeMap) {
        const nudged = this.avoidSteepTerrain(endX, endZ, config.slopeMap, radius, rng);
        endX = nudged.x;
        endZ = nudged.z;
      }

      const endNode: InternalNode = {
        id: this.nextNodeId(),
        x: endX,
        z: endZ,
        type: 'dead_end',
        tier: 'main',
      };
      nodes.push(endNode);
      radialEndNodes.push(endNode);
      edges.push(this.createEdge(prevNode, endNode, 'main'));
    }

    // 5. Create concentric ring road edges connecting radial intersection nodes
    for (let ri = 0; ri < ringCount; ri++) {
      // Inner half of rings are boulevard (main); outer half are residential (secondary)
      const tier: 'main' | 'secondary' = ri < ringCount / 2 ? 'main' : 'secondary';

      for (let i = 0; i < radialCount; i++) {
        const nextI = (i + 1) % radialCount;
        const fromNode = radialNodes[ri][i];
        const toNode = radialNodes[ri][nextI];
        edges.push(this.createEdge(fromNode, toNode, tier));
      }
    }

    // 6. Ensure full connectivity
    this.ensureConnectivity(nodes, edges);

    // 7. Apply final noise displacement to edge waypoints (midpoints)
    for (const edge of edges) {
      for (let w = 1; w < edge.waypoints.length - 1; w++) {
        const wp = edge.waypoints[w];
        const dx = noise(wp.x * 0.04, wp.z * 0.04) * radius * 0.015;
        const dz = noise(wp.z * 0.04, wp.x * 0.04) * radius * 0.015;
        wp.x += dx;
        wp.z += dz;
      }
    }

    return this.toStreetNetwork(nodes, edges);
  }

  /**
   * Generate a linear/main-street layout for river towns, mining towns, highway stops.
   * Algorithm:
   * 1. Create one main street running along the provided axis through center
   * 2. Branch short perpendicular side streets at semi-regular intervals
   * 3. Side streets alternate left/right or appear on both sides
   * 4. Main street is main_road; side streets are residential or lane
   * 5. Optionally curve the main street to follow a path (e.g., river centerline)
   * 6. Ensure connectivity
   */
  generateLinear(config: StreetGenConfig & {
    axis: { x: number; z: number };
    curvePath?: { x: number; z: number }[];
  }): StreetNetwork {
    this.nodeCounter = 0;
    this.edgeCounter = 0;

    const rng = seededRandom(config.seed);
    const noise = createNoise2D(config.seed + '_linear');
    const { center, radius } = config;

    const nodes: InternalNode[] = [];
    const edges: InternalEdge[] = [];

    // Normalize axis direction
    const axLen = Math.sqrt(config.axis.x * config.axis.x + config.axis.z * config.axis.z) || 1;
    const axisX = config.axis.x / axLen;
    const axisZ = config.axis.z / axLen;

    // Perpendicular direction (rotated 90°)
    const perpX = -axisZ;
    const perpZ = axisX;

    // Main street parameters
    const mainLength = radius * 1.6; // Total length of main street
    const halfLength = mainLength / 2;
    const segmentSpacing = 25 + rng() * 10; // ~25-35 units between nodes
    const mainSegments = Math.max(3, Math.round(mainLength / segmentSpacing));

    // Build main street nodes along the axis (or along curvePath if provided)
    const mainNodes: InternalNode[] = [];

    for (let i = 0; i <= mainSegments; i++) {
      const t = i / mainSegments; // 0..1 along main street
      const linearT = t * mainLength - halfLength; // offset from center

      let nx: number, nz: number;

      if (config.curvePath && config.curvePath.length >= 2) {
        // Interpolate along the curve path
        const pathT = t * (config.curvePath.length - 1);
        const pathIdx = Math.floor(pathT);
        const pathFrac = pathT - pathIdx;
        const p0 = config.curvePath[Math.min(pathIdx, config.curvePath.length - 1)];
        const p1 = config.curvePath[Math.min(pathIdx + 1, config.curvePath.length - 1)];
        nx = p0.x + (p1.x - p0.x) * pathFrac;
        nz = p0.z + (p1.z - p0.z) * pathFrac;
      } else {
        // Straight line along axis through center
        nx = center.x + axisX * linearT;
        nz = center.z + axisZ * linearT;
      }

      // Add slight noise displacement perpendicular to axis
      const displace = noise(nx * 0.02, nz * 0.02) * radius * 0.03;
      nx += perpX * displace;
      nz += perpZ * displace;

      // Slope avoidance
      if (config.slopeMap) {
        const nudged = this.avoidSteepTerrain(nx, nz, config.slopeMap, radius, rng);
        nx = nudged.x;
        nz = nudged.z;
      }

      const nodeType: StreetNodeType = (i === 0 || i === mainSegments) ? 'dead_end' : 'intersection';
      const node: InternalNode = {
        id: this.nextNodeId(),
        x: nx,
        z: nz,
        type: nodeType,
        tier: 'main',
      };
      nodes.push(node);
      mainNodes.push(node);

      // Edge from previous node
      if (i > 0) {
        edges.push(this.createEdge(mainNodes[i - 1], node, 'main'));
      }
    }

    // Branch side streets off interior main street nodes
    const sideStreetSpacing = 2 + Math.floor(rng() * 2); // Every 2-3 nodes
    let sideDirection = rng() > 0.5 ? 1 : -1; // Start left or right

    for (let i = 1; i < mainNodes.length - 1; i++) {
      if (i % sideStreetSpacing !== 0) continue;

      const mNode = mainNodes[i];
      mNode.type = 'intersection';

      // Determine side: alternate, or both sides with some probability
      const bothSides = rng() < 0.35;
      const sides = bothSides ? [1, -1] : [sideDirection];
      sideDirection *= -1; // Alternate for next time

      for (const side of sides) {
        // Side street length: 20-40% of radius
        const sideLength = radius * (0.15 + rng() * 0.25);
        const sideSegs = 1 + Math.floor(rng() * 2); // 1-2 segments

        // Local perpendicular direction (may differ if following curve)
        let localPerpX = perpX;
        let localPerpZ = perpZ;
        if (i > 0 && i < mainNodes.length - 1) {
          // Compute local tangent from neighboring main nodes
          const prev = mainNodes[i - 1];
          const next = mainNodes[i + 1];
          const tangentX = next.x - prev.x;
          const tangentZ = next.z - prev.z;
          const tangentLen = Math.sqrt(tangentX * tangentX + tangentZ * tangentZ) || 1;
          localPerpX = -tangentZ / tangentLen;
          localPerpZ = tangentX / tangentLen;
        }

        let prev = mNode;

        // Side street tier: residential for longer streets, lane for short ones
        const tier: 'secondary' | 'tertiary' = sideLength > radius * 0.25 ? 'secondary' : 'tertiary';

        for (let s = 1; s <= sideSegs; s++) {
          const st = s / sideSegs;
          let sx = mNode.x + localPerpX * side * sideLength * st;
          let sz = mNode.z + localPerpZ * side * sideLength * st;

          // Add slight noise
          const sDisplace = noise(sx * 0.03, sz * 0.03) * radius * 0.02;
          sx += axisX * sDisplace;
          sz += axisZ * sDisplace;

          if (config.slopeMap) {
            const nudged = this.avoidSteepTerrain(sx, sz, config.slopeMap, radius, rng);
            sx = nudged.x;
            sz = nudged.z;
          }

          // Check for nearby node snap
          const nearby = this.findNearbyNode(nodes, sx, sz, radius * 0.08);
          if (nearby && nearby.id !== prev.id) {
            edges.push(this.createEdge(prev, nearby, tier));
            nearby.type = 'intersection';
            break;
          }

          const nodeType: StreetNodeType = s === sideSegs ? 'dead_end' : 'intersection';
          const node: InternalNode = {
            id: this.nextNodeId(),
            x: sx,
            z: sz,
            type: nodeType,
            tier: tier === 'secondary' ? 'secondary' : 'tertiary',
          };
          nodes.push(node);
          edges.push(this.createEdge(prev, node, tier));
          prev = node;
        }
      }
    }

    // Ensure full connectivity
    this.ensureConnectivity(nodes, edges);

    // Apply final noise displacement to waypoints
    for (const edge of edges) {
      for (let w = 1; w < edge.waypoints.length - 1; w++) {
        const wp = edge.waypoints[w];
        const dx = noise(wp.x * 0.04, wp.z * 0.04) * radius * 0.015;
        const dz = noise(wp.z * 0.04, wp.x * 0.04) * radius * 0.015;
        wp.x += dx;
        wp.z += dz;
      }
    }

    return this.toStreetNetwork(nodes, edges);
  }

  /**
   * Generate a hillside/terraced street layout for mountain settlements.
   * Roads follow elevation contour lines with switchback ramps connecting levels.
   * Algorithm:
   * 1. Compute elevation range within settlement boundary
   * 2. Define 3-5 contour levels at even elevation intervals
   * 3. For each level, trace a contour-following road (march around at that elevation)
   * 4. Connect adjacent contour levels with switchback ramp segments
   * 5. Falls back to organic pattern if no heightmap provided
   * 6. Ensure connectivity
   */
  generateHillside(config: StreetGenConfig, heightmap: number[][]): StreetNetwork {
    // Fallback to organic if no heightmap
    if (!heightmap || heightmap.length === 0 || (heightmap[0]?.length ?? 0) === 0) {
      return this.generateOrganic(config);
    }

    this.nodeCounter = 0;
    this.edgeCounter = 0;

    const rng = seededRandom(config.seed);
    const noise = createNoise2D(config.seed + '_hillside');
    const { center, radius } = config;

    const nodes: InternalNode[] = [];
    const edges: InternalEdge[] = [];

    const hmRows = heightmap.length;
    const hmCols = heightmap[0].length;

    // Helper: sample heightmap at world coords
    const sampleHeight = (wx: number, wz: number): number => {
      const col = ((wx - center.x) / radius + 1) / 2 * (hmCols - 1);
      const row = ((wz - center.z) / radius + 1) / 2 * (hmRows - 1);
      const r = Math.max(0, Math.min(hmRows - 1, Math.round(row)));
      const c = Math.max(0, Math.min(hmCols - 1, Math.round(col)));
      return heightmap[r][c];
    };

    // 1. Compute elevation range within settlement boundary
    let minElev = Infinity, maxElev = -Infinity;
    const sampleStep = Math.max(1, Math.floor(radius / 20));
    for (let dz = -radius; dz <= radius; dz += sampleStep) {
      for (let dx = -radius; dx <= radius; dx += sampleStep) {
        if (dx * dx + dz * dz > radius * radius) continue;
        const h = sampleHeight(center.x + dx, center.z + dz);
        if (h < minElev) minElev = h;
        if (h > maxElev) maxElev = h;
      }
    }

    const elevRange = maxElev - minElev;
    if (elevRange < 0.01) {
      // Flat terrain — fall back to organic
      return this.generateOrganic(config);
    }

    // 2. Define contour levels (3-5 levels)
    const levelCount = 3 + Math.floor(rng() * 3); // 3-5
    const contourLevels: number[] = [];
    for (let i = 0; i < levelCount; i++) {
      // Evenly spaced from 10% to 90% of elevation range
      const t = (i + 1) / (levelCount + 1);
      contourLevels.push(minElev + elevRange * t);
    }

    // 3. Trace contour-following roads at each level
    // For each level, sample points around the settlement at that elevation
    const contourNodes: InternalNode[][] = []; // contourNodes[level][nodeIdx]

    for (let li = 0; li < levelCount; li++) {
      const targetElev = contourLevels[li];
      const levelNodes: InternalNode[] = [];
      contourNodes.push(levelNodes);

      // March around the settlement at angles, find points near target elevation
      const angleCount = 16 + Math.floor(rng() * 8); // 16-24 sample directions
      const candidates: { x: number; z: number; angle: number }[] = [];

      for (let ai = 0; ai < angleCount; ai++) {
        const angle = (ai / angleCount) * Math.PI * 2;

        // Walk outward from center along this angle to find elevation match
        for (let r = radius * 0.1; r < radius * 0.9; r += sampleStep) {
          const wx = center.x + Math.cos(angle) * r;
          const wz = center.z + Math.sin(angle) * r;
          const h = sampleHeight(wx, wz);
          const tolerance = elevRange * 0.08; // 8% tolerance

          if (Math.abs(h - targetElev) < tolerance) {
            // Add noise displacement for natural feel
            const displace = noise(wx * 0.03, wz * 0.03) * radius * 0.03;
            const perpAngle = angle + Math.PI / 2;
            candidates.push({
              x: wx + Math.cos(perpAngle) * displace,
              z: wz + Math.sin(perpAngle) * displace,
              angle,
            });
            break; // One point per direction
          }
        }
      }

      // Sort candidates by angle for contour ordering
      candidates.sort((a, b) => a.angle - b.angle);

      // Create nodes from candidates (skip if too few points for a road)
      if (candidates.length < 3) continue;

      for (const c of candidates) {
        let nx = c.x;
        let nz = c.z;

        if (config.slopeMap) {
          const nudged = this.avoidSteepTerrain(nx, nz, config.slopeMap, radius, rng);
          nx = nudged.x;
          nz = nudged.z;
        }

        const node: InternalNode = {
          id: this.nextNodeId(),
          x: nx,
          z: nz,
          type: 'intersection',
          tier: 'secondary', // Contour roads are residential
        };
        nodes.push(node);
        levelNodes.push(node);
      }

      // Create edges along the contour (connect sequential nodes)
      for (let i = 0; i < levelNodes.length - 1; i++) {
        edges.push(this.createEdge(levelNodes[i], levelNodes[i + 1], 'secondary'));
      }
      // Optionally close the contour loop if first and last are near enough
      if (levelNodes.length >= 4) {
        const first = levelNodes[0];
        const last = levelNodes[levelNodes.length - 1];
        const d = dist(first.x, first.z, last.x, last.z);
        if (d < radius * 0.5) {
          edges.push(this.createEdge(last, first, 'secondary'));
        }
      }
    }

    // 4. Connect adjacent contour levels with switchback ramps
    for (let li = 0; li < contourNodes.length - 1; li++) {
      const lowerNodes = contourNodes[li];
      const upperNodes = contourNodes[li + 1];
      if (lowerNodes.length === 0 || upperNodes.length === 0) continue;

      // Pick 2-4 connection points between adjacent levels
      const connectionCount = 2 + Math.floor(rng() * 3); // 2-4
      const usedLower = new Set<number>();
      const usedUpper = new Set<number>();

      for (let ci = 0; ci < connectionCount; ci++) {
        // Find closest pair not yet used
        let bestDist = Infinity;
        let bestLi = 0, bestUi = 0;

        for (let lo = 0; lo < lowerNodes.length; lo++) {
          if (usedLower.has(lo)) continue;
          for (let up = 0; up < upperNodes.length; up++) {
            if (usedUpper.has(up)) continue;
            const d = dist(lowerNodes[lo].x, lowerNodes[lo].z, upperNodes[up].x, upperNodes[up].z);
            if (d < bestDist) {
              bestDist = d;
              bestLi = lo;
              bestUi = up;
            }
          }
        }

        if (bestDist === Infinity) break;
        usedLower.add(bestLi);
        usedUpper.add(bestUi);

        const lower = lowerNodes[bestLi];
        const upper = upperNodes[bestUi];

        // Create switchback: zigzag intermediate node(s) between the two levels
        const midX = (lower.x + upper.x) / 2;
        const midZ = (lower.z + upper.z) / 2;

        // Offset the mid-node perpendicular to the direct path for zigzag
        const dirX = upper.x - lower.x;
        const dirZ = upper.z - lower.z;
        const dirLen = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
        const zigOffset = dirLen * 0.3 * (rng() > 0.5 ? 1 : -1);

        let zigX = midX + (-dirZ / dirLen) * zigOffset;
        let zigZ = midZ + (dirX / dirLen) * zigOffset;

        // Add noise for natural variation
        zigX += noise(zigX * 0.03, zigZ * 0.03) * radius * 0.02;
        zigZ += noise(zigZ * 0.03, zigX * 0.03) * radius * 0.02;

        if (config.slopeMap) {
          const nudged = this.avoidSteepTerrain(zigX, zigZ, config.slopeMap, radius, rng);
          zigX = nudged.x;
          zigZ = nudged.z;
        }

        const switchbackNode: InternalNode = {
          id: this.nextNodeId(),
          x: zigX,
          z: zigZ,
          type: 'curve_point',
          tier: 'tertiary', // Switchbacks are lane type
        };
        nodes.push(switchbackNode);

        edges.push(this.createEdge(lower, switchbackNode, 'tertiary'));
        edges.push(this.createEdge(switchbackNode, upper, 'tertiary'));
      }
    }

    // 5. Ensure full connectivity
    this.ensureConnectivity(nodes, edges);

    return this.toStreetNetwork(nodes, edges);
  }

  /** Create an internal edge with waypoints */
  private createEdge(from: InternalNode, to: InternalNode, tier: 'main' | 'secondary' | 'tertiary'): InternalEdge {
    // Generate intermediate waypoints for curved edges
    const midX = (from.x + to.x) / 2;
    const midZ = (from.z + to.z) / 2;
    return {
      id: this.nextEdgeId(),
      fromId: from.id,
      toId: to.id,
      tier,
      waypoints: [
        { x: from.x, z: from.z },
        { x: midX, z: midZ },
        { x: to.x, z: to.z },
      ],
    };
  }

  /** Find a node within minDist of (x, z), if any */
  private findNearbyNode(nodes: InternalNode[], x: number, z: number, minDist: number): InternalNode | null {
    for (const node of nodes) {
      if (dist(node.x, node.z, x, z) < minDist) {
        return node;
      }
    }
    return null;
  }

  /** Nudge a position away from steep terrain */
  private avoidSteepTerrain(
    x: number,
    z: number,
    slopeMap: number[][],
    radius: number,
    rng: () => number
  ): { x: number; z: number } {
    const rows = slopeMap.length;
    const cols = slopeMap[0]?.length ?? 0;
    if (rows === 0 || cols === 0) return { x, z };

    // Map world coords to slopeMap indices
    const mapX = Math.round(((x / radius + 1) / 2) * (cols - 1));
    const mapZ = Math.round(((z / radius + 1) / 2) * (rows - 1));

    if (mapX < 0 || mapX >= cols || mapZ < 0 || mapZ >= rows) return { x, z };

    const slope = slopeMap[mapZ][mapX];
    const slopeAngle = Math.atan(slope);
    const maxRoadSlope = 0.26; // ~15 degrees

    if (slopeAngle > maxRoadSlope) {
      // Nudge toward lower slope direction
      const nudgeAmount = radius * 0.05;
      let bestX = x, bestZ = z, bestSlope = slope;

      for (let attempt = 0; attempt < 4; attempt++) {
        const angle = rng() * Math.PI * 2;
        const testX = x + Math.cos(angle) * nudgeAmount;
        const testZ = z + Math.sin(angle) * nudgeAmount;
        const tmx = Math.round(((testX / radius + 1) / 2) * (cols - 1));
        const tmz = Math.round(((testZ / radius + 1) / 2) * (rows - 1));
        if (tmx >= 0 && tmx < cols && tmz >= 0 && tmz < rows) {
          const testSlope = slopeMap[tmz][tmx];
          if (testSlope < bestSlope) {
            bestX = testX;
            bestZ = testZ;
            bestSlope = testSlope;
          }
        }
      }
      return { x: bestX, z: bestZ };
    }

    return { x, z };
  }

  /** Ensure graph connectivity using BFS + bridge edges */
  private ensureConnectivity(nodes: InternalNode[], edges: InternalEdge[]): void {
    if (nodes.length <= 1) return;

    // Build adjacency
    const adj = new Map<string, Set<string>>();
    for (const n of nodes) adj.set(n.id, new Set());
    for (const e of edges) {
      adj.get(e.fromId)!.add(e.toId);
      adj.get(e.toId)!.add(e.fromId);
    }

    // BFS from first node
    const visited = new Set<string>();
    const queue = [nodes[0].id];
    visited.add(nodes[0].id);
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbor of Array.from(adj.get(current)!)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    if (visited.size === nodes.length) return; // Already connected

    // Find disconnected components and connect them to main component
    const nodeMap = new Map<string, InternalNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const unvisited = nodes.filter(n => !visited.has(n.id));

    while (unvisited.length > 0) {
      // Find closest pair between visited and unvisited
      let bestDist = Infinity;
      let bestVisited: InternalNode | null = null;
      let bestUnvisited: InternalNode | null = null;

      for (const uNode of unvisited) {
        for (const vId of Array.from(visited)) {
          const vNode = nodeMap.get(vId)!;
          const d = dist(uNode.x, uNode.z, vNode.x, vNode.z);
          if (d < bestDist) {
            bestDist = d;
            bestVisited = vNode;
            bestUnvisited = uNode;
          }
        }
      }

      if (bestVisited && bestUnvisited) {
        edges.push(this.createEdge(bestVisited, bestUnvisited, 'tertiary'));
        bestVisited.type = 'intersection';
        bestUnvisited.type = 'intersection';

        // BFS from newly connected node
        const newQueue = [bestUnvisited.id];
        visited.add(bestUnvisited.id);
        while (newQueue.length > 0) {
          const current = newQueue.shift()!;
          for (const neighbor of Array.from(adj.get(current) ?? [])) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              newQueue.push(neighbor);
            }
          }
        }

        // Remove newly visited from unvisited
        for (let i = unvisited.length - 1; i >= 0; i--) {
          if (visited.has(unvisited[i].id)) {
            unvisited.splice(i, 1);
          }
        }
      } else {
        break; // Should not happen
      }
    }
  }

  /** Convert internal representation to StreetNetwork */
  private toStreetNetwork(nodes: InternalNode[], edges: InternalEdge[]): StreetNetwork {
    const streetNodes: StreetNode[] = nodes.map(n => ({
      id: n.id,
      position: { x: n.x, z: n.z },
      elevation: 0,
      type: n.type,
    }));

    const streetEdges: StreetEdge[] = edges.map(e => {
      const from = nodes.find(n => n.id === e.fromId)!;
      const to = nodes.find(n => n.id === e.toId)!;
      const length = this.computeEdgeLength(e.waypoints);

      const streetType: StreetType = e.tier === 'main' ? 'main_road' : e.tier === 'secondary' ? 'residential' : 'lane';
      const width = e.tier === 'main' ? 8 : e.tier === 'secondary' ? 6 : 4;

      return {
        id: e.id,
        name: '',
        fromNodeId: e.fromId,
        toNodeId: e.toId,
        streetType,
        width,
        waypoints: e.waypoints.map(wp => ({ x: wp.x, y: 0, z: wp.z })),
        length,
        condition: 1,
        traffic: 0,
        sidewalks: e.tier !== 'tertiary',
        hasStreetLights: e.tier === 'main',
      };
    });

    return { nodes: streetNodes, edges: streetEdges };
  }

  /** Compute total length of a polyline */
  private computeEdgeLength(waypoints: { x: number; z: number }[]): number {
    let total = 0;
    for (let i = 1; i < waypoints.length; i++) {
      total += dist(waypoints[i - 1].x, waypoints[i - 1].z, waypoints[i].x, waypoints[i].z);
    }
    return total;
  }
}
