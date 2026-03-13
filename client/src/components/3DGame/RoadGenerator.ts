/**
 * RoadGenerator - Creates road/path meshes between settlements
 * Uses a minimum spanning tree (Kruskal's) to connect settlements efficiently,
 * then generates terrain-following ribbon meshes for each road segment.
 */

import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import type { StreetNetworkIR } from '../../../../shared/game-engine/ir-types';

export interface RoadSegment {
  from: Vector3;
  to: Vector3;
  mesh: Mesh;
}

interface SettlementNode {
  id: string;
  position: Vector3;
}

interface Edge {
  fromIdx: number;
  toIdx: number;
  distance: number;
}

export class RoadGenerator {
  private scene: Scene;
  private roadMeshes: Mesh[] = [];
  private roadWidth: number = 3;
  private sampleInterval: number = 6;
  private yOffset: number = 0.08; // Slight offset above ground to prevent z-fighting

  // Road appearance
  private roadColor: Color3 = new Color3(0.45, 0.38, 0.3); // Dirt path default
  private roadTexture: Texture | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Set road width (default 3 units)
   */
  public setRoadWidth(width: number): void {
    this.roadWidth = width;
  }

  /**
   * Set road texture from asset collection
   */
  public setRoadTexture(texture: Texture): void {
    this.roadTexture = texture;
  }

  /**
   * Set road color (used when no texture is available)
   */
  public setRoadColor(color: Color3): void {
    this.roadColor = color;
  }

  /**
   * Generate roads between settlements using a minimum spanning tree
   * @param settlements Array of settlement positions with IDs
   * @param sampleHeight Function to get terrain height at (x, z)
   */
  public generateRoads(
    settlements: SettlementNode[],
    sampleHeight: (x: number, z: number) => number
  ): RoadSegment[] {
    if (settlements.length < 2) return [];

    // Build MST using Kruskal's algorithm
    const mstEdges = this.computeMST(settlements);

    const segments: RoadSegment[] = [];

    for (const edge of mstEdges) {
      const from = settlements[edge.fromIdx].position;
      const to = settlements[edge.toIdx].position;
      const segId = `road_${settlements[edge.fromIdx].id}_${settlements[edge.toIdx].id}`;

      const mesh = this.createRoadSegment(segId, from, to, sampleHeight);
      if (mesh) {
        segments.push({ from, to, mesh });
        this.roadMeshes.push(mesh);
      }
    }

    console.log(`[RoadGenerator] Generated ${segments.length} road segments connecting ${settlements.length} settlements`);
    return segments;
  }

  /**
   * Generate internal roads within a settlement (from center to buildings)
   */
  public generateSettlementRoads(
    settlementId: string,
    center: Vector3,
    buildingPositions: Vector3[],
    sampleHeight: (x: number, z: number) => number
  ): void {
    // Create short path segments from center to each building
    for (let i = 0; i < buildingPositions.length; i++) {
      const segId = `road_internal_${settlementId}_${i}`;
      const mesh = this.createRoadSegment(segId, center, buildingPositions[i], sampleHeight, 1.5);
      if (mesh) {
        this.roadMeshes.push(mesh);
      }
    }
  }

  // Width by street type (world units)
  private static readonly STREET_WIDTHS: Record<string, number> = {
    boulevard: 6,
    avenue: 5,
    main_road: 4,
    highway: 4,
    residential: 3,
    lane: 2,
    alley: 1.5,
  };

  // Colors by street type (emissive)
  private static readonly STREET_COLORS: Record<string, Color3> = {
    boulevard: new Color3(0.35, 0.32, 0.28),   // Dark paved
    avenue: new Color3(0.38, 0.34, 0.3),        // Paved
    main_road: new Color3(0.35, 0.32, 0.28),    // Dark paved
    highway: new Color3(0.3, 0.3, 0.32),        // Asphalt
    residential: new Color3(0.48, 0.42, 0.35),  // Lighter packed earth
    lane: new Color3(0.52, 0.45, 0.36),         // Light dirt
    alley: new Color3(0.55, 0.48, 0.38),        // Dirt
  };

  /**
   * Generate intra-settlement road meshes from a StreetNetworkIR graph.
   * Each edge becomes a terrain-following ribbon mesh with width/color based on street type.
   */
  public generateStreetNetworkRoads(
    network: StreetNetworkIR,
    sampleHeight: (x: number, z: number) => number
  ): Mesh[] {
    const meshes: Mesh[] = [];

    // Build node lookup for resolving edge endpoints
    const nodeMap = new Map<string, { x: number; z: number; elevation: number }>();
    for (const node of network.nodes) {
      nodeMap.set(node.id, node.position as any);
    }

    for (const edge of network.edges) {
      const fromNode = nodeMap.get(edge.fromNodeId);
      const toNode = nodeMap.get(edge.toNodeId);
      if (!fromNode || !toNode) continue;

      // Use waypoints if available, otherwise straight line between nodes
      const waypoints = edge.waypoints && edge.waypoints.length >= 2
        ? edge.waypoints
        : [
            { x: fromNode.x, y: 0, z: fromNode.z },
            { x: toNode.x, y: 0, z: toNode.z },
          ];

      const width = RoadGenerator.STREET_WIDTHS[edge.streetType] ?? 3;
      const color = RoadGenerator.STREET_COLORS[edge.streetType] ?? this.roadColor;

      const mesh = this.createStreetEdgeMesh(edge.id, waypoints, width, color, sampleHeight);
      if (mesh) {
        meshes.push(mesh);
        this.roadMeshes.push(mesh);
      }
    }

    console.log(
      `[RoadGenerator] Generated ${meshes.length} street meshes from street network (${network.edges.length} edges)`
    );
    return meshes;
  }

  /**
   * Create a ribbon mesh along a sequence of waypoints with the given width and color.
   */
  private createStreetEdgeMesh(
    id: string,
    waypoints: { x: number; y: number; z: number }[],
    width: number,
    color: Color3,
    sampleHeight: (x: number, z: number) => number
  ): Mesh | null {
    if (waypoints.length < 2) return null;

    const halfWidth = width / 2;
    const leftPath: Vector3[] = [];
    const rightPath: Vector3[] = [];

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];

      // Compute tangent direction at this waypoint
      let dx: number, dz: number;
      if (i === 0) {
        dx = waypoints[1].x - wp.x;
        dz = waypoints[1].z - wp.z;
      } else if (i === waypoints.length - 1) {
        dx = wp.x - waypoints[i - 1].x;
        dz = wp.z - waypoints[i - 1].z;
      } else {
        dx = waypoints[i + 1].x - waypoints[i - 1].x;
        dz = waypoints[i + 1].z - waypoints[i - 1].z;
      }

      const len = Math.sqrt(dx * dx + dz * dz);
      if (len < 0.001) continue;

      // Perpendicular in XZ plane
      const perpX = -dz / len;
      const perpZ = dx / len;

      const lx = wp.x + perpX * halfWidth;
      const lz = wp.z + perpZ * halfWidth;
      const rx = wp.x - perpX * halfWidth;
      const rz = wp.z - perpZ * halfWidth;

      const ly = sampleHeight(lx, lz) + this.yOffset;
      const ry = sampleHeight(rx, rz) + this.yOffset;

      leftPath.push(new Vector3(lx, ly, lz));
      rightPath.push(new Vector3(rx, ry, rz));
    }

    if (leftPath.length < 2) return null;

    try {
      const road = MeshBuilder.CreateRibbon(
        `street_${id}`,
        {
          pathArray: [leftPath, rightPath],
          closeArray: false,
          closePath: false,
          sideOrientation: Mesh.DOUBLESIDE,
          updatable: false,
        },
        this.scene
      );

      road.checkCollisions = false;
      road.isPickable = false;

      const mat = new StandardMaterial(`street_${id}_mat`, this.scene);
      mat.disableLighting = true;
      mat.backFaceCulling = false;

      if (this.roadTexture) {
        const tex = this.roadTexture.clone();
        if (tex) {
          // Estimate total length for texture scaling
          let totalLen = 0;
          for (let i = 1; i < waypoints.length; i++) {
            const dx = waypoints[i].x - waypoints[i - 1].x;
            const dz = waypoints[i].z - waypoints[i - 1].z;
            totalLen += Math.sqrt(dx * dx + dz * dz);
          }
          tex.uScale = Math.max(1, Math.round(totalLen / 8));
          tex.vScale = 1;
          mat.emissiveTexture = tex;
        }
      } else {
        mat.emissiveColor = color;
      }

      road.material = mat;
      road.addLODLevel(150, null);
      road.freezeWorldMatrix();

      return road;
    } catch (err) {
      console.warn(`[RoadGenerator] Failed to create street mesh ${id}:`, err);
      return null;
    }
  }

  /**
   * Kruskal's MST algorithm with union-find
   */
  private computeMST(settlements: SettlementNode[]): Edge[] {
    const n = settlements.length;

    // Build all edges with distances
    const edges: Edge[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = settlements[i].position.x - settlements[j].position.x;
        const dz = settlements[i].position.z - settlements[j].position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        edges.push({ fromIdx: i, toIdx: j, distance });
      }
    }

    // Sort by distance
    edges.sort((a, b) => a.distance - b.distance);

    // Union-Find
    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = new Array(n).fill(0);

    const find = (x: number): number => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };

    const union = (a: number, b: number): boolean => {
      const ra = find(a);
      const rb = find(b);
      if (ra === rb) return false;
      if (rank[ra] < rank[rb]) {
        parent[ra] = rb;
      } else if (rank[ra] > rank[rb]) {
        parent[rb] = ra;
      } else {
        parent[rb] = ra;
        rank[ra]++;
      }
      return true;
    };

    const mstEdges: Edge[] = [];
    for (const edge of edges) {
      if (union(edge.fromIdx, edge.toIdx)) {
        mstEdges.push(edge);
        if (mstEdges.length === n - 1) break;
      }
    }

    return mstEdges;
  }

  /**
   * Create a single road segment mesh as a terrain-following ribbon
   */
  private createRoadSegment(
    id: string,
    from: Vector3,
    to: Vector3,
    sampleHeight: (x: number, z: number) => number,
    widthOverride?: number
  ): Mesh | null {
    const width = widthOverride ?? this.roadWidth;
    const halfWidth = width / 2;

    // Calculate direction and perpendicular
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    if (length < 1) return null; // Too short

    // Unit direction and perpendicular vectors (in XZ plane)
    const dirX = dx / length;
    const dirZ = dz / length;
    const perpX = -dirZ; // Perpendicular in XZ
    const perpZ = dirX;

    // Sample points along the road at regular intervals
    const numSamples = Math.max(2, Math.ceil(length / this.sampleInterval));
    const leftPath: Vector3[] = [];
    const rightPath: Vector3[] = [];

    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      const cx = from.x + dx * t;
      const cz = from.z + dz * t;

      // Left and right edge positions
      const lx = cx + perpX * halfWidth;
      const lz = cz + perpZ * halfWidth;
      const rx = cx - perpX * halfWidth;
      const rz = cz - perpZ * halfWidth;

      // Sample terrain height at each edge
      const ly = sampleHeight(lx, lz) + this.yOffset;
      const ry = sampleHeight(rx, rz) + this.yOffset;

      leftPath.push(new Vector3(lx, ly, lz));
      rightPath.push(new Vector3(rx, ry, rz));
    }

    try {
      const road = MeshBuilder.CreateRibbon(
        id,
        {
          pathArray: [leftPath, rightPath],
          closeArray: false,
          closePath: false,
          sideOrientation: Mesh.DOUBLESIDE,
          updatable: false,
        },
        this.scene
      );

      road.checkCollisions = false;
      road.isPickable = false;

      // Apply material — use disableLighting so roads are always visible
      // regardless of ribbon normal orientation
      const mat = new StandardMaterial(`${id}_mat`, this.scene);
      mat.disableLighting = true;
      mat.backFaceCulling = false;
      if (this.roadTexture) {
        const tex = this.roadTexture.clone();
        if (tex) {
          tex.uScale = Math.max(1, Math.round(length / 8));
          tex.vScale = 1;
          mat.emissiveTexture = tex;
        }
      } else {
        mat.emissiveColor = this.roadColor;
      }
      road.material = mat;
      // LOD: hide road at 150+ units
      road.addLODLevel(150, null);
      road.freezeWorldMatrix();

      return road;
    } catch (err) {
      console.warn(`[RoadGenerator] Failed to create road segment ${id}:`, err);
      return null;
    }
  }

  /**
   * Get all road meshes (for minimap or other systems)
   */
  public getRoadMeshes(): Mesh[] {
    return [...this.roadMeshes];
  }

  /**
   * Dispose all road meshes
   */
  public dispose(): void {
    for (const mesh of this.roadMeshes) {
      mesh.dispose();
    }
    this.roadMeshes = [];
    this.roadTexture = null;
  }
}
