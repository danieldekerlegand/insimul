/**
 * RoadGenerator - Creates road/path meshes between and within settlements.
 * Uses a minimum spanning tree (Kruskal's) to connect settlements efficiently,
 * then generates terrain-following ribbon meshes for each road segment.
 * Also renders intra-settlement street networks with intersections, sidewalks,
 * and street name signs.
 */

import {
  Color3,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import type { StreetNetwork, StreetSegment as StreetSegmentData } from '../../../../shared/game-engine/types';

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
   * Render a complete street network within a settlement.
   * Creates road meshes for each street segment, intersection discs,
   * sidewalk ribbons, and street name signs at key intersections.
   */
  public generateSettlementStreets(
    settlementId: string,
    network: StreetNetwork,
    sampleHeight: (x: number, z: number) => number
  ): void {
    if (!network.segments.length) return;

    const sidewalkColor = new Color3(0.6, 0.58, 0.55);
    const intersectionColor = new Color3(0.42, 0.36, 0.28);
    const sidewalkWidth = 0.6;

    // Render each street segment as a terrain-following ribbon
    for (const seg of network.segments) {
      if (seg.waypoints.length < 2) continue;

      const mesh = this.createPolylineRoad(
        `street_${seg.id}`,
        seg.waypoints,
        sampleHeight,
        seg.width
      );
      if (mesh) this.roadMeshes.push(mesh);

      // Sidewalks on both sides
      const leftSidewalk = this.createPolylineRoad(
        `sidewalk_l_${seg.id}`,
        this.offsetPolyline(seg.waypoints, seg.width / 2 + sidewalkWidth / 2),
        sampleHeight,
        sidewalkWidth,
        sidewalkColor
      );
      if (leftSidewalk) this.roadMeshes.push(leftSidewalk);

      const rightSidewalk = this.createPolylineRoad(
        `sidewalk_r_${seg.id}`,
        this.offsetPolyline(seg.waypoints, -(seg.width / 2 + sidewalkWidth / 2)),
        sampleHeight,
        sidewalkWidth,
        sidewalkColor
      );
      if (rightSidewalk) this.roadMeshes.push(rightSidewalk);
    }

    // Render intersection discs at nodes where 2+ streets meet
    const nodeMap = new Map(network.nodes.map(n => [n.id, n]));
    for (const node of network.nodes) {
      if (node.intersectionOf.length < 2) continue;

      // Use the max width of meeting streets for the disc
      const meetingWidths = node.intersectionOf
        .map(segId => network.segments.find(s => s.id === segId)?.width ?? 2.5)
        .sort((a, b) => b - a);
      const discRadius = (meetingWidths[0] / 2) + 0.3;

      const y = sampleHeight(node.x, node.z) + this.yOffset + 0.01;
      const disc = MeshBuilder.CreateDisc(
        `intersection_${node.id}`,
        { radius: discRadius, tessellation: 16 },
        this.scene
      );
      disc.position = new Vector3(node.x, y, node.z);
      disc.rotation.x = Math.PI / 2;
      disc.isPickable = false;
      disc.checkCollisions = false;

      const mat = new StandardMaterial(`intersection_mat_${node.id}`, this.scene);
      mat.disableLighting = true;
      mat.backFaceCulling = false;
      mat.emissiveColor = intersectionColor;
      disc.material = mat;
      disc.addLODLevel(150, null);
      disc.freezeWorldMatrix();
      this.roadMeshes.push(disc);
    }

    // Place street name signs at select intersections
    this.placeStreetSigns(settlementId, network, sampleHeight);

    console.log(
      `[RoadGenerator] Rendered ${network.segments.length} streets, ` +
      `${network.nodes.filter(n => n.intersectionOf.length >= 2).length} intersections ` +
      `for settlement ${settlementId}`
    );
  }

  /**
   * Create a terrain-following ribbon from an ordered polyline of waypoints.
   */
  private createPolylineRoad(
    id: string,
    waypoints: { x: number; z: number }[],
    sampleHeight: (x: number, z: number) => number,
    width: number,
    colorOverride?: Color3
  ): Mesh | null {
    if (waypoints.length < 2) return null;

    const halfWidth = width / 2;
    const leftPath: Vector3[] = [];
    const rightPath: Vector3[] = [];

    for (let i = 0; i < waypoints.length; i++) {
      const curr = waypoints[i];
      // Determine local direction from neighboring waypoints
      let dx: number, dz: number;
      if (i === 0) {
        dx = waypoints[1].x - curr.x;
        dz = waypoints[1].z - curr.z;
      } else if (i === waypoints.length - 1) {
        dx = curr.x - waypoints[i - 1].x;
        dz = curr.z - waypoints[i - 1].z;
      } else {
        dx = waypoints[i + 1].x - waypoints[i - 1].x;
        dz = waypoints[i + 1].z - waypoints[i - 1].z;
      }

      const len = Math.sqrt(dx * dx + dz * dz);
      if (len < 0.001) continue;

      const perpX = -dz / len;
      const perpZ = dx / len;

      const lx = curr.x + perpX * halfWidth;
      const lz = curr.z + perpZ * halfWidth;
      const rx = curr.x - perpX * halfWidth;
      const rz = curr.z - perpZ * halfWidth;

      leftPath.push(new Vector3(lx, sampleHeight(lx, lz) + this.yOffset, lz));
      rightPath.push(new Vector3(rx, sampleHeight(rx, rz) + this.yOffset, rz));

      // Subdivide long spans between waypoints
      if (i < waypoints.length - 1) {
        const next = waypoints[i + 1];
        const spanDx = next.x - curr.x;
        const spanDz = next.z - curr.z;
        const spanLen = Math.sqrt(spanDx * spanDx + spanDz * spanDz);
        const subdivisions = Math.floor(spanLen / this.sampleInterval);

        for (let s = 1; s < subdivisions; s++) {
          const t = s / subdivisions;
          const mx = curr.x + spanDx * t;
          const mz = curr.z + spanDz * t;
          const mlx = mx + perpX * halfWidth;
          const mlz = mz + perpZ * halfWidth;
          const mrx = mx - perpX * halfWidth;
          const mrz = mz - perpZ * halfWidth;

          leftPath.push(new Vector3(mlx, sampleHeight(mlx, mlz) + this.yOffset, mlz));
          rightPath.push(new Vector3(mrx, sampleHeight(mrx, mrz) + this.yOffset, mrz));
        }
      }
    }

    if (leftPath.length < 2) return null;

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

      const mat = new StandardMaterial(`${id}_mat`, this.scene);
      mat.disableLighting = true;
      mat.backFaceCulling = false;

      if (colorOverride) {
        mat.emissiveColor = colorOverride;
      } else if (this.roadTexture) {
        const tex = this.roadTexture.clone();
        if (tex) {
          const totalLen = this.polylineLength(waypoints);
          tex.uScale = Math.max(1, Math.round(totalLen / 8));
          tex.vScale = 1;
          mat.emissiveTexture = tex;
        }
      } else {
        mat.emissiveColor = this.roadColor;
      }

      road.material = mat;
      road.addLODLevel(150, null);
      road.freezeWorldMatrix();
      return road;
    } catch (err) {
      console.warn(`[RoadGenerator] Failed to create polyline road ${id}:`, err);
      return null;
    }
  }

  /**
   * Offset a polyline laterally by `offset` units (positive = left, negative = right).
   */
  private offsetPolyline(
    waypoints: { x: number; z: number }[],
    offset: number
  ): { x: number; z: number }[] {
    const result: { x: number; z: number }[] = [];
    for (let i = 0; i < waypoints.length; i++) {
      const curr = waypoints[i];
      let dx: number, dz: number;
      if (i === 0) {
        dx = waypoints[1].x - curr.x;
        dz = waypoints[1].z - curr.z;
      } else if (i === waypoints.length - 1) {
        dx = curr.x - waypoints[i - 1].x;
        dz = curr.z - waypoints[i - 1].z;
      } else {
        dx = waypoints[i + 1].x - waypoints[i - 1].x;
        dz = waypoints[i + 1].z - waypoints[i - 1].z;
      }
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len < 0.001) {
        result.push({ x: curr.x, z: curr.z });
        continue;
      }
      const perpX = -dz / len;
      const perpZ = dx / len;
      result.push({ x: curr.x + perpX * offset, z: curr.z + perpZ * offset });
    }
    return result;
  }

  /**
   * Place street name signs at intersections where 2+ named streets meet.
   */
  private placeStreetSigns(
    settlementId: string,
    network: StreetNetwork,
    sampleHeight: (x: number, z: number) => number
  ): void {
    const placedNames = new Set<string>();

    for (const node of network.nodes) {
      if (node.intersectionOf.length < 2) continue;

      // Pick first street at this intersection that hasn't had a sign yet
      const seg = network.segments.find(
        s => node.intersectionOf.includes(s.id) && !placedNames.has(s.name)
      );
      if (!seg) continue;
      placedNames.add(seg.name);

      const y = sampleHeight(node.x, node.z) + this.yOffset;
      const signMesh = this.createStreetSign(
        `sign_${settlementId}_${node.id}`,
        seg.name,
        new Vector3(node.x + 1.5, y + 2.5, node.z + 1.5)
      );
      if (signMesh) this.roadMeshes.push(signMesh);
    }
  }

  /**
   * Create a simple street name sign (pole + text plane).
   */
  private createStreetSign(id: string, name: string, position: Vector3): Mesh | null {
    try {
      // Pole
      const pole = MeshBuilder.CreateCylinder(
        `${id}_pole`,
        { height: 2.5, diameter: 0.1, tessellation: 6 },
        this.scene
      );
      pole.position = position.clone();
      pole.position.y -= 1.25;
      pole.isPickable = false;
      pole.checkCollisions = false;

      const poleMat = new StandardMaterial(`${id}_pole_mat`, this.scene);
      poleMat.disableLighting = true;
      poleMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
      pole.material = poleMat;

      // Sign plane with dynamic texture
      const sign = MeshBuilder.CreatePlane(
        `${id}_face`,
        { width: 2.0, height: 0.5 },
        this.scene
      );
      sign.position = position.clone();
      sign.isPickable = false;
      sign.checkCollisions = false;
      sign.billboardMode = Mesh.BILLBOARDMODE_Y;

      const tex = new DynamicTexture(`${id}_tex`, { width: 256, height: 64 }, this.scene, false);
      const ctx = tex.getContext() as CanvasRenderingContext2D;
      ctx.fillStyle = '#2a5e2a';
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, 128, 32);
      tex.update();

      const signMat = new StandardMaterial(`${id}_face_mat`, this.scene);
      signMat.disableLighting = true;
      signMat.emissiveTexture = tex;
      signMat.backFaceCulling = false;
      sign.material = signMat;

      // Parent sign to pole
      sign.parent = pole;
      sign.position = new Vector3(0, 1.25, 0);

      pole.addLODLevel(80, null);
      pole.freezeWorldMatrix();

      return pole;
    } catch (err) {
      console.warn(`[RoadGenerator] Failed to create street sign ${id}:`, err);
      return null;
    }
  }

  /** Calculate total length of a polyline */
  private polylineLength(waypoints: { x: number; z: number }[]): number {
    let total = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const dx = waypoints[i].x - waypoints[i - 1].x;
      const dz = waypoints[i].z - waypoints[i - 1].z;
      total += Math.sqrt(dx * dx + dz * dz);
    }
    return total;
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
