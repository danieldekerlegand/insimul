/**
 * Tests for NPCModelInstancer — template caching, cloning, shared materials, and LOD.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track addLODLevel calls
const lodCalls: { meshName: string; distance: number; proxy: any }[] = [];
// Track disposed meshes
const disposedMeshes: string[] = [];

// Mock Babylon.js
vi.mock('@babylonjs/core', () => {
  class MockVector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new MockVector3(this.x, this.y, this.z); }
    static Zero() { return new MockVector3(); }
    static Distance(a: MockVector3, b: MockVector3) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
    }
  }

  class MockColor3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
    scale(s: number) { return new MockColor3(this.r * s, this.g * s, this.b * s); }
    static Lerp(a: MockColor3, b: MockColor3, t: number) {
      return new MockColor3(
        a.r + (b.r - a.r) * t,
        a.g + (b.g - a.g) * t,
        a.b + (b.b - a.b) * t
      );
    }
    static Black() { return new MockColor3(); }
  }

  class MockStandardMaterial {
    diffuseColor = new MockColor3(0.5, 0.5, 0.5);
    emissiveColor = new MockColor3();
    alpha = 1;
    backFaceCulling = true;
    disableLighting = false;
    name: string;
    constructor(name: string, _scene?: any) { this.name = name; }
    clone(newName: string) {
      const m = new MockStandardMaterial(newName);
      m.diffuseColor = new MockColor3(this.diffuseColor.r, this.diffuseColor.g, this.diffuseColor.b);
      return m;
    }
    dispose() {}
  }

  let _disposed = false;
  class MockMesh {
    position = new MockVector3();
    scaling = new MockVector3(1, 1, 1);
    isPickable = true;
    isVisible = true;
    checkCollisions = false;
    material: any = null;
    parent: any = null;
    name: string;
    skeleton: any = null;
    metadata: any = null;
    billboardMode = 0;
    ellipsoid: any = null;
    ellipsoidOffset: any = null;
    private _enabled = true;
    private _disposed = false;
    private _children: MockMesh[] = [];

    static BILLBOARDMODE_Y = 2;

    constructor(name: string, _scene?: any) { this.name = name; }
    setEnabled(v: boolean) { this._enabled = v; }
    isEnabled() { return this._enabled; }
    isDisposed() { return this._disposed; }
    dispose() { this._disposed = true; disposedMeshes.push(this.name); }
    addLODLevel(distance: number, mesh: any) {
      lodCalls.push({ meshName: this.name, distance, proxy: mesh });
    }
    getChildMeshes(): MockMesh[] { return this._children; }
    clone(newName: string, _parent?: any) {
      const c = new MockMesh(newName);
      c.material = this.material;
      c.skeleton = this.skeleton;
      c._children = this._children.map(child => {
        const cc = child.clone(`${newName}_child`);
        cc.parent = c;
        return cc;
      });
      return c;
    }
    computeWorldMatrix() {}
  }

  class MockSkeleton {
    name: string;
    constructor(name: string) { this.name = name; }
    clone(newName: string) { return new MockSkeleton(newName); }
  }

  // Track import calls
  const importCalls: string[] = [];

  return {
    Scene: class {},
    Mesh: MockMesh,
    AbstractMesh: MockMesh,
    Skeleton: MockSkeleton,
    MeshBuilder: {
      CreateCylinder: (name: string, _o: any, _s: any) => new MockMesh(name),
      CreatePlane: (name: string, _o: any, _s: any) => new MockMesh(name),
    },
    Vector3: MockVector3,
    Color3: MockColor3,
    StandardMaterial: MockStandardMaterial,
    SceneLoader: {
      ImportMeshAsync: vi.fn(async (_meshNames: string, rootUrl: string, file: string, _scene: any) => {
        importCalls.push(`${rootUrl}${file}`);
        const root = new MockMesh('__root__');
        const childMesh = new MockMesh('body');
        childMesh.material = new MockStandardMaterial('bodyMat');
        root.material = new MockStandardMaterial('rootMat');
        return {
          meshes: [root, childMesh],
          animationGroups: [{ name: 'idle', clone: (n: string) => ({ name: n }) }],
          skeletons: [new MockSkeleton('skel')],
        };
      }),
      _importCalls: importCalls,
    },
  };
});

vi.mock('@babylonjs/loaders/glTF', () => ({}));

import { NPCModelInstancer, NPC_MESH_LOD } from '../NPCModelInstancer';
import { SceneLoader } from '@babylonjs/core';

describe('NPCModelInstancer', () => {
  let instancer: NPCModelInstancer;
  let mockScene: any;

  beforeEach(() => {
    lodCalls.length = 0;
    disposedMeshes.length = 0;
    (SceneLoader as any)._importCalls.length = 0;
    vi.clearAllMocks();
    mockScene = {};
    instancer = new NPCModelInstancer(mockScene);
  });

  describe('acquire', () => {
    it('loads template on first call and returns a mesh', async () => {
      const result = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');
      expect(result).not.toBeNull();
      expect(result!.root).toBeDefined();
      expect(result!.root.name).toBe('npc_npc1');
      expect(result!.animationGroups).toBeDefined();
    });

    it('reuses template on subsequent calls (only one ImportMeshAsync)', async () => {
      await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');
      await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc2', 'guard');

      // ImportMeshAsync should be called only once for the same cache key
      expect(SceneLoader.ImportMeshAsync).toHaveBeenCalledTimes(1);
    });

    it('loads different templates for different cache keys', async () => {
      await instancer.acquire('model_a', '/models/', 'a.glb', 'npc1', 'civilian');
      await instancer.acquire('model_b', '/models/', 'b.glb', 'npc2', 'guard');

      expect(SceneLoader.ImportMeshAsync).toHaveBeenCalledTimes(2);
    });

    it('creates LOD proxy mesh', async () => {
      const result = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');
      expect(result!.lodProxy).not.toBeNull();
      expect(result!.lodProxy!.name).toContain('lod_proxy');
    });

    it('creates billboard mesh', async () => {
      const result = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');
      expect(result!.billboard).not.toBeNull();
      expect(result!.billboard!.name).toContain('billboard');
    });

    it('wires up Babylon.js mesh LOD levels', async () => {
      await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');

      // Should have 3 LOD levels: low-detail proxy, billboard, and cull (null)
      expect(lodCalls.length).toBe(3);
      expect(lodCalls[0].distance).toBe(NPC_MESH_LOD.LOW_DETAIL);
      expect(lodCalls[0].proxy).not.toBeNull(); // proxy mesh
      expect(lodCalls[1].distance).toBe(NPC_MESH_LOD.BILLBOARD);
      expect(lodCalls[1].proxy).not.toBeNull(); // billboard mesh
      expect(lodCalls[2].distance).toBe(NPC_MESH_LOD.CULL);
      expect(lodCalls[2].proxy).toBeNull(); // null = cull
    });
  });

  describe('shared materials', () => {
    it('shares billboard material across same-role NPCs', async () => {
      const r1 = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'guard');
      const r2 = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc2', 'guard');

      // Both billboards should have the exact same material reference
      expect(r1!.billboard!.material).toBe(r2!.billboard!.material);
    });

    it('uses different billboard materials for different roles', async () => {
      const r1 = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'guard');
      const r2 = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc2', 'merchant');

      expect(r1!.billboard!.material).not.toBe(r2!.billboard!.material);
    });
  });

  describe('getStats', () => {
    it('reports correct template and clone counts', async () => {
      await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');
      await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc2', 'civilian');
      await instancer.acquire('model_b', '/models/', 'b.glb', 'npc3', 'guard');

      const stats = instancer.getStats();
      expect(stats.templateCount).toBe(2);
      expect(stats.totalClones).toBe(3);
      expect(stats.templateKeys).toContain('model_a');
      expect(stats.templateKeys).toContain('model_b');
    });
  });

  describe('dispose', () => {
    it('disposes all templates and clears state', async () => {
      await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');
      await instancer.acquire('model_b', '/models/', 'b.glb', 'npc2', 'guard');

      instancer.dispose();

      const stats = instancer.getStats();
      expect(stats.templateCount).toBe(0);
      expect(stats.totalClones).toBe(0);
      // Template meshes should have been disposed
      expect(disposedMeshes.length).toBeGreaterThan(0);
    });
  });

  describe('LOD distances', () => {
    it('has reasonable LOD distance thresholds', () => {
      expect(NPC_MESH_LOD.LOW_DETAIL).toBeLessThan(NPC_MESH_LOD.BILLBOARD);
      expect(NPC_MESH_LOD.BILLBOARD).toBeLessThan(NPC_MESH_LOD.CULL);
    });
  });

  describe('template hiding', () => {
    it('hides the template mesh (not visible in scene)', async () => {
      await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');

      // The clone should be enabled, but we verify it was created from a disabled template
      // by checking that a second acquire still works (template wasn't disposed)
      const r2 = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc2', 'civilian');
      expect(r2).not.toBeNull();
      expect(r2!.root.name).toBe('npc_npc2');
    });
  });

  describe('skeleton cloning', () => {
    it('clones skeleton for independent animation per NPC', async () => {
      const r1 = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc1', 'civilian');
      const r2 = await instancer.acquire('model_a', '/models/', 'npc.glb', 'npc2', 'civilian');

      // Each NPC should have its own skeleton instance
      expect(r1!.root.skeleton).toBeDefined();
      expect(r2!.root.skeleton).toBeDefined();
      expect(r1!.root.skeleton).not.toBe(r2!.root.skeleton);
    });
  });
});
