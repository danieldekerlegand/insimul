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
