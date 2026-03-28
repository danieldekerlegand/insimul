/**
 * Tests for road/building avoidance in ProceduralNatureGenerator and ExteriorItemManager
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Babylon.js
vi.mock('@babylonjs/core', () => {
  class MockVector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new MockVector3(this.x, this.y, this.z); }
    subtract(o: MockVector3) { return new MockVector3(this.x - o.x, this.y - o.y, this.z - o.z); }
    scale(s: number) { return new MockVector3(this.x * s, this.y * s, this.z * s); }
    add(o: MockVector3) { return new MockVector3(this.x + o.x, this.y + o.y, this.z + o.z); }
    set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
    static Zero() { return new MockVector3(); }
    static One() { return new MockVector3(1, 1, 1); }
    static Minimize(a: MockVector3, b: MockVector3) { return new MockVector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z)); }
    static Maximize(a: MockVector3, b: MockVector3) { return new MockVector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z)); }
    static Distance(a: MockVector3, b: MockVector3) { return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2); }
  }

  class MockColor3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
    scale(s: number) { return new MockColor3(this.r * s, this.g * s, this.b * s); }
    static Black() { return new MockColor3(); }
  }

  class MockMaterial {
    diffuseColor = new MockColor3();
    specularColor = new MockColor3();
    emissiveColor = new MockColor3();
    alpha = 1;
    backFaceCulling = true;
    constructor(public name: string, _scene: any) {}
  }

  class MockMesh {
    position = new MockVector3();
    rotation = new MockVector3();
    scaling = new MockVector3(1, 1, 1);
    isPickable = true;
    isVisible = true;
    checkCollisions = false;
    material: any = null;
    parent: any = null;
    metadata: any = null;
    name: string;
    private _enabled = true;
    private _disposed = false;

    constructor(name: string, _scene?: any) { this.name = name; }
    setEnabled(v: boolean) { this._enabled = v; }
    isEnabled() { return this._enabled; }
    freezeWorldMatrix() {}
    addLODLevel() {}
    dispose(_d?: boolean, _e?: boolean) { this._disposed = true; }
    isDisposed() { return this._disposed; }
    getChildMeshes(): MockMesh[] { return []; }
    computeWorldMatrix() {}
    getBoundingInfo() {
      return { boundingBox: { minimumWorld: new MockVector3(-1, -1, -1), maximumWorld: new MockVector3(1, 1, 1) } };
    }
    getHierarchyBoundingVectors() {
      return { min: new MockVector3(-1, 0, -1), max: new MockVector3(1, 2, 1) };
    }
    getTotalVertices() { return 100; }
    createInstance(name: string) { const m = new MockMesh(name); m.material = this.material; return m; }
    thinInstanceSetBuffer() {}
    thinInstanceRefreshBoundingInfo() {}
    bakeCurrentTransformIntoVertices() {}
    clone(name: string) { return new MockMesh(name); }
    instantiateHierarchy() { return new MockMesh(this.name + '_inst'); }
    getScene() { return {}; }
    static MergeMeshes(meshes: any[]) { return meshes?.length ? new MockMesh('merged') : null; }
  }

  return {
    Scene: class {},
    Mesh: MockMesh,
    MeshBuilder: {
      CreateSphere: (name: string, _o: any, _s: any) => new MockMesh(name),
      CreateBox: (name: string, _o: any, _s: any) => new MockMesh(name),
      CreateCylinder: (name: string, _o: any, _s: any) => new MockMesh(name),
      CreatePlane: (name: string, _o: any, _s: any) => new MockMesh(name),
    },
    Vector3: MockVector3,
    StandardMaterial: MockMaterial,
    Color3: MockColor3,
    InstancedMesh: MockMesh,
    Matrix: { Identity: () => ({ copyToArray: () => {} }), ComposeToRef: () => {} },
    AbstractMesh: MockMesh,
    SceneLoader: { ImportMeshAsync: async () => ({ meshes: [] }) },
    Quaternion: { Identity: () => ({}), RotationYawPitchRollToRef: () => {} },
  };
});

vi.mock('@babylonjs/loaders/glTF', () => ({}));
vi.mock('../DebugLabelUtils', () => ({ createDebugLabel: () => {} }));

import { ProceduralNatureGenerator } from '../ProceduralNatureGenerator';
import type { BiomeStyle } from '../ProceduralNatureGenerator';
import { ExteriorItemManager, type ExteriorItemData } from '../ExteriorItemManager';
import { Color3, Mesh } from '@babylonjs/core';

const bounds = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };

function makeScene() {
  return { meshes: [], getMeshByName: () => null } as any;
}

function makeBiome(overrides: Partial<BiomeStyle> = {}): BiomeStyle {
  return {
    name: 'Test',
    treeType: 'oak',
    treeDensity: 0.5,
    grassColor: new Color3(0.3, 0.5, 0.2),
    rockColor: new Color3(0.4, 0.4, 0.4),
    hasWater: false,
    hasFlowers: true,
    flowerColors: [new Color3(1, 0, 0)],
    geologicalDensity: 1.0,
    geologicalFeatures: ['boulder'],
    ...overrides,
  };
}

describe('Nature Road Avoidance', () => {
  describe('ProceduralNatureGenerator.setPositionValidator', () => {
    it('filters trees placed on blocked positions', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      // Block all positions — no trees should be placed
      gen.setPositionValidator(() => true);
      gen.generateTrees(makeBiome(), bounds, [], 15);
      expect(gen.getTreeMeshes().length).toBe(0);
    });

    it('allows trees when no positions are blocked', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setPositionValidator(() => false);
      gen.generateTrees(makeBiome({ treeDensity: 0.3 }), bounds, [], 15);
      expect(gen.getTreeMeshes().length).toBeGreaterThan(0);
    });

    it('filters rocks placed on blocked positions', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setPositionValidator(() => true);
      gen.generateRocks(makeBiome(), bounds, 10);
      expect(gen.getRockMeshes().length).toBe(0);
    });

    it('allows rocks when positions are not blocked', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setPositionValidator(() => false);
      gen.generateRocks(makeBiome(), bounds, 10);
      expect(gen.getRockMeshes().length).toBeGreaterThan(0);
    });

    it('filters shrubs placed on blocked positions', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setPositionValidator(() => true);
      gen.generateShrubs(makeBiome(), bounds, 10);
      expect(gen.getVegetationMeshes().length).toBe(0);
    });

    it('filters geological features on blocked positions', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setPositionValidator(() => true);
      gen.generateGeologicalFeatures(
        makeBiome({ geologicalDensity: 1.0, geologicalFeatures: ['boulder'] }),
        bounds, 5
      );
      expect(gen.getGeologicalMeshes().length).toBe(0);
    });

    it('selectively blocks positions near roads', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      // Block only x < 0 (simulating a road on the left side)
      gen.setPositionValidator((x, _z) => x < 0);
      gen.generateRocks(makeBiome(), bounds, 30);
      // All placed rocks should have x >= 0
      for (const mesh of gen.getRockMeshes()) {
        expect(mesh.position.x).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('ProceduralNatureGenerator.setBuildingProximityChecker', () => {
    it('rejects geological features near buildings', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setPositionValidator(() => false); // roads don't block
      // But all positions are near a building
      gen.setBuildingProximityChecker(() => true);
      gen.generateGeologicalFeatures(
        makeBiome({ geologicalDensity: 1.0, geologicalFeatures: ['boulder'] }),
        bounds, 5
      );
      expect(gen.getGeologicalMeshes().length).toBe(0);
    });

    it('allows geological features far from buildings', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setPositionValidator(() => false);
      gen.setBuildingProximityChecker(() => false);
      gen.generateGeologicalFeatures(
        makeBiome({ geologicalDensity: 1.0, geologicalFeatures: ['boulder'] }),
        bounds, 5
      );
      expect(gen.getGeologicalMeshes().length).toBeGreaterThan(0);
    });
  });

  describe('ProceduralNatureGenerator.removeRoadOverlaps', () => {
    it('removes nature meshes that overlap roads', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateRocks(makeBiome(), bounds, 20);
      const beforeCount = gen.getRockMeshes().length;
      expect(beforeCount).toBeGreaterThan(0);

      // Remove all rocks (simulate everything is on a road)
      const removed = gen.removeRoadOverlaps(() => true);
      expect(removed).toBe(beforeCount);
      expect(gen.getRockMeshes().length).toBe(0);
    });

    it('keeps meshes not on roads', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateRocks(makeBiome(), bounds, 20);
      const beforeCount = gen.getRockMeshes().length;

      // Nothing is on a road
      const removed = gen.removeRoadOverlaps(() => false);
      expect(removed).toBe(0);
      expect(gen.getRockMeshes().length).toBe(beforeCount);
    });

    it('returns count of removed meshes', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateRocks(makeBiome(), bounds, 10);

      // Remove rocks at x < 0 only
      const removed = gen.removeRoadOverlaps((x) => x < 0);
      expect(removed).toBeGreaterThanOrEqual(0);
      // Remaining rocks should all have x >= 0
      for (const mesh of gen.getRockMeshes()) {
        expect(mesh.position.x).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('ExteriorItemManager position validation', () => {
    function makeItemManager() {
      const scene = makeScene();
      const templates = new Map<string, any>();
      const heights = new Map<string, number>();
      const scaleHints = new Map<string, number>();
      return new ExteriorItemManager(scene, templates, heights, scaleHints, () => 0);
    }

    function makeItem(x: number, z: number): ExteriorItemData {
      return {
        id: `item_${x}_${z}`,
        name: `Item at (${x}, ${z})`,
        itemType: 'tool',
        metadata: { position: { x, z } },
      };
    }

    it('skips items on blocked positions when no valid nearby position exists', () => {
      const manager = makeItemManager();
      // Block all positions
      manager.setPositionValidator(() => true);
      const items = [makeItem(0, 0), makeItem(5, 5)];
      const meshes = manager.spawnItems(items);
      expect(meshes.length).toBe(0);
    });

    it('places items normally when positions are not blocked', () => {
      const manager = makeItemManager();
      manager.setPositionValidator(() => false);
      const items = [makeItem(10, 10), makeItem(20, 20)];
      const meshes = manager.spawnItems(items);
      expect(meshes.length).toBe(2);
    });

    it('nudges items to nearby valid positions', () => {
      const manager = makeItemManager();
      // Block only the exact origin, allow everything else
      manager.setPositionValidator((x, z) => Math.abs(x) < 1 && Math.abs(z) < 1);
      const items = [makeItem(0, 0)];
      const meshes = manager.spawnItems(items);
      // Item should be nudged to a nearby position
      expect(meshes.length).toBe(1);
      const pos = meshes[0].position;
      // Should not be at origin
      expect(Math.abs(pos.x) > 1 || Math.abs(pos.z) > 1).toBe(true);
    });
  });

  describe('RoadGenerator.isPointOnRoad margin handling', () => {
    it('uses segment halfWidth + margin for distance test', () => {
      // This is a unit-level test of the isPointOnRoad algorithm
      // Simulating: road segment from (0,0) to (100,0), halfWidth=5
      // Point at (50, 6) should be on road with margin=2 (dist=6 < 5+2=7)
      // Point at (50, 8) should NOT be on road with margin=2 (dist=8 > 7)

      const segments = [{ ax: 0, az: 0, bx: 100, bz: 0, halfWidth: 5 }];

      function isPointOnRoad(x: number, z: number, margin: number = 2): boolean {
        for (const seg of segments) {
          const dx = seg.bx - seg.ax;
          const dz = seg.bz - seg.az;
          const lenSq = dx * dx + dz * dz;
          if (lenSq < 0.001) continue;
          const t = Math.max(0, Math.min(1,
            ((x - seg.ax) * dx + (z - seg.az) * dz) / lenSq
          ));
          const px = seg.ax + t * dx;
          const pz = seg.az + t * dz;
          const dist = Math.sqrt((x - px) * (x - px) + (z - pz) * (z - pz));
          if (dist < seg.halfWidth + margin) return true;
        }
        return false;
      }

      // On the road surface (within halfWidth)
      expect(isPointOnRoad(50, 3, 0)).toBe(true);
      // On the sidewalk (within margin)
      expect(isPointOnRoad(50, 6, 2)).toBe(true);
      // Beyond road + margin
      expect(isPointOnRoad(50, 8, 2)).toBe(false);
      // With 1.5m margin (exterior items)
      expect(isPointOnRoad(50, 6, 1.5)).toBe(true);
      expect(isPointOnRoad(50, 6.6, 1.5)).toBe(false);
      // With 3m margin (geological features near road edge)
      expect(isPointOnRoad(50, 7, 3)).toBe(true);
      expect(isPointOnRoad(50, 8.1, 3)).toBe(false);
    });
  });
});
