/**
 * Tests for Nature LOD system integration in ProceduralNatureGenerator.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track LOD calls
const lodCalls: { meshName: string; distance: number; proxy: any }[] = [];

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
    name: string;
    private _enabled = true;

    constructor(name: string, _scene?: any) { this.name = name; }
    setEnabled(v: boolean) { this._enabled = v; }
    isEnabled() { return this._enabled; }
    freezeWorldMatrix() {}
    addLODLevel(distance: number, mesh: any) {
      lodCalls.push({ meshName: this.name, distance, proxy: mesh });
    }
    dispose() {}
    isDisposed() { return false; }
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
      CreateDisc: (name: string, _o: any, _s: any) => new MockMesh(name),
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

import { ProceduralNatureGenerator, type BiomeStyle } from '../ProceduralNatureGenerator';
import { DEFAULT_LOD_PROFILE, getLODProfileForBiome } from '../NatureLODConfig';
import { Color3 } from '@babylonjs/core';

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
    hasFlowers: false,
    flowerColors: [],
    geologicalDensity: 0.5,
    geologicalFeatures: ['boulder'],
    ...overrides,
  };
}

describe('Nature LOD System Integration', () => {
  beforeEach(() => {
    lodCalls.length = 0;
  });

  describe('LOD profile management', () => {
    it('uses DEFAULT_LOD_PROFILE by default', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      expect(gen.getLODProfile()).toEqual(DEFAULT_LOD_PROFILE);
    });

    it('setLODProfileForBiome adjusts distances', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setLODProfileForBiome('forest');
      const profile = gen.getLODProfile();
      // Forest multiplier is 0.8
      expect(profile.tree.lodCull).toBe(Math.round(120 * 0.8));
      expect(profile.rock.lodCull).toBe(Math.round(80 * 0.8));
    });

    it('setLODProfile allows custom override', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      const custom = { ...DEFAULT_LOD_PROFILE, tree: { lodProxy: 30, lodCull: 60 } };
      gen.setLODProfile(custom);
      expect(gen.getLODProfile().tree.lodCull).toBe(60);
    });
  });

  describe('procedural tree LOD', () => {
    it('uses configured distances for procedural trees', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateTrees(makeBiome({ treeDensity: 0.3 }), bounds, []);

      // Trees should use lodProxy=50 and lodCull=120 from defaults
      const treeLod = lodCalls.filter(c => c.meshName.includes('template_tree'));
      const proxyCall = treeLod.find(c => c.distance === 50 && c.proxy !== null);
      const cullCall = treeLod.find(c => c.distance === 120 && c.proxy === null);
      expect(proxyCall).toBeDefined();
      expect(cullCall).toBeDefined();
    });

    it('adjusts tree LOD distances for forest biome', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setLODProfileForBiome('forest');
      gen.generateTrees(makeBiome({ treeDensity: 0.3 }), bounds, []);

      const treeLod = lodCalls.filter(c => c.meshName.includes('template_tree'));
      const proxyCall = treeLod.find(c => c.distance === Math.round(50 * 0.8) && c.proxy !== null);
      const cullCall = treeLod.find(c => c.distance === Math.round(120 * 0.8) && c.proxy === null);
      expect(proxyCall).toBeDefined();
      expect(cullCall).toBeDefined();
    });
  });

  describe('procedural rock LOD', () => {
    it('uses proxy and cull distances for procedural rocks', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateRocks(makeBiome(), bounds, 3);

      const rockLod = lodCalls.filter(c => c.meshName.includes('rock_template'));
      // Default rock: lodProxy=40, lodCull=80
      const proxyCall = rockLod.find(c => c.distance === 40 && c.proxy !== null);
      const cullCall = rockLod.find(c => c.distance === 80 && c.proxy === null);
      expect(proxyCall).toBeDefined();
      expect(cullCall).toBeDefined();
    });
  });

  describe('vegetation LOD', () => {
    it('uses configured cull distance for procedural bushes', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateShrubs(makeBiome(), bounds, 3);

      const bushLod = lodCalls.filter(c => c.meshName.includes('bush_template'));
      const cullCall = bushLod.find(c => c.distance === 60 && c.proxy === null);
      expect(cullCall).toBeDefined();
    });

    it('uses configured cull distance for grass', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateGrass(makeBiome(), bounds, 5);

      const grassLod = lodCalls.filter(c => c.meshName.includes('grass'));
      // Default: lodCull=30
      const cullCall = grassLod.find(c => c.distance === 30 && c.proxy === null);
      expect(cullCall).toBeDefined();
    });

    it('uses configured cull distance for flowers', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateFlowers(
        makeBiome({ hasFlowers: true, flowerColors: [new Color3(1, 0, 0)] }),
        bounds, 5
      );

      const flowerLod = lodCalls.filter(c => c.meshName.includes('flower'));
      // Default: lodCull=40
      const cullCall = flowerLod.find(c => c.distance === 40 && c.proxy === null);
      expect(cullCall).toBeDefined();
    });
  });

  describe('geological LOD', () => {
    it('uses proxy and cull distances for geological features', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateGeologicalFeatures(
        makeBiome({ geologicalDensity: 1.0, geologicalFeatures: ['boulder'] }),
        bounds, 3
      );

      // Default geological: lodProxy=50, lodCull=100
      const proxyCall = lodCalls.find(c => c.distance === 50 && c.proxy !== null);
      const cullCall = lodCalls.find(c => c.distance === 100 && c.proxy === null);
      expect(proxyCall).toBeDefined();
      expect(cullCall).toBeDefined();
    });
  });

  describe('lake LOD', () => {
    it('uses configured cull distance for lakes', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateLakes(makeBiome({ hasWater: true }), bounds, (_x: number, _z: number) => 0);

      // Default: lodCull=150
      const lakeLod = lodCalls.filter(c => c.meshName.includes('lake'));
      const cullCall = lakeLod.find(c => c.distance === 150 && c.proxy === null);
      expect(cullCall).toBeDefined();
    });
  });

  describe('getLODStats', () => {
    it('returns stats for all nature types', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateRocks(makeBiome(), bounds, 3);

      const stats = gen.getLODStats();
      expect(stats).toHaveLength(7);

      const rockStat = stats.find(s => s.type === 'rock');
      expect(rockStat).toBeDefined();
      expect(rockStat!.totalMeshes).toBeGreaterThan(0);
      expect(rockStat!.withProxy).toBeGreaterThan(0); // rocks have lodProxy > 0
    });

    it('reports correct proxy/cull categorization', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateShrubs(makeBiome(), bounds, 3);

      const stats = gen.getLODStats();
      const shrubStat = stats.find(s => s.type === 'shrub');
      expect(shrubStat).toBeDefined();
      // Shrubs have lodProxy = 0, so all should be cullOnly
      expect(shrubStat!.withProxy).toBe(0);
      expect(shrubStat!.cullOnly).toBe(shrubStat!.totalMeshes);
    });
  });

  describe('biome-specific LOD distances', () => {
    it('desert biome increases all cull distances', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setLODProfileForBiome('desert');
      gen.generateRocks(makeBiome(), bounds, 3);

      const rockLod = lodCalls.filter(c => c.meshName.includes('rock_template'));
      // Desert multiplier 1.3: 80 * 1.3 = 104
      const cullCall = rockLod.find(c => c.distance === Math.round(80 * 1.3) && c.proxy === null);
      expect(cullCall).toBeDefined();
    });

    it('tundra biome increases distances (multiplier 1.25)', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.setLODProfileForBiome('tundra');
      gen.generateGrass(makeBiome(), bounds, 5);

      const grassLod = lodCalls.filter(c => c.meshName.includes('grass'));
      // Tundra: 30 * 1.25 = 37.5 → 38
      const cullCall = grassLod.find(c => c.distance === Math.round(30 * 1.25) && c.proxy === null);
      expect(cullCall).toBeDefined();
    });
  });
});
