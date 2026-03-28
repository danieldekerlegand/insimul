/**
 * Tests for geological feature placement in ProceduralNatureGenerator
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
    name: string;
    private _enabled = true;

    constructor(name: string, _scene?: any) { this.name = name; }
    setEnabled(v: boolean) { this._enabled = v; }
    isEnabled() { return this._enabled; }
    freezeWorldMatrix() {}
    addLODLevel() {}
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
import type { BiomeStyle, GeologicalFeatureType } from '../ProceduralNatureGenerator';
import { Color3 } from '@babylonjs/core';

const bounds = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };

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
    geologicalFeatures: ['boulder', 'rock_cluster', 'stone_pillar', 'rock_outcrop', 'crystal_formation'],
    ...overrides,
  };
}

describe('GeologicalFeatures', () => {
  describe('generateGeologicalFeatures', () => {
    it('generates geological meshes', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateGeologicalFeatures(makeBiome({ geologicalDensity: 1.0 }), bounds, 10);
      expect(gen.getGeologicalMeshes().length).toBeGreaterThan(0);
    });

    it('scales count by geologicalDensity', () => {
      const genHigh = new ProceduralNatureGenerator(makeScene());
      genHigh.generateGeologicalFeatures(makeBiome({ geologicalDensity: 1.0 }), bounds, 20);

      const genLow = new ProceduralNatureGenerator(makeScene());
      genLow.generateGeologicalFeatures(makeBiome({ geologicalDensity: 0.1 }), bounds, 20);

      expect(genHigh.getGeologicalMeshes().length).toBeGreaterThan(genLow.getGeologicalMeshes().length);
    });

    it('produces no meshes when geologicalFeatures is empty', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateGeologicalFeatures(makeBiome({ geologicalFeatures: [] }), bounds, 10);
      expect(gen.getGeologicalMeshes().length).toBe(0);
    });

    it('calls height sampler', () => {
      const sampler = vi.fn().mockReturnValue(5);
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateGeologicalFeatures(
        makeBiome({ geologicalDensity: 1.0, geologicalFeatures: ['boulder'] }),
        bounds, 3, sampler
      );
      expect(sampler).toHaveBeenCalled();
    });

    it('creates invisible collision meshes', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateGeologicalFeatures(
        makeBiome({ geologicalDensity: 1.0, geologicalFeatures: ['boulder'] }),
        bounds, 3
      );
      const colliders = gen.getGeologicalMeshes().filter((m: any) => m.name.includes('collider'));
      expect(colliders.length).toBeGreaterThan(0);
      for (const c of colliders) {
        expect((c as any).isVisible).toBe(false);
        expect((c as any).checkCollisions).toBe(true);
      }
    });
  });

  describe('feature types', () => {
    const types: GeologicalFeatureType[] = ['boulder', 'rock_cluster', 'stone_pillar', 'rock_outcrop', 'crystal_formation'];

    for (const type of types) {
      it(`creates "${type}" features`, () => {
        const gen = new ProceduralNatureGenerator(makeScene());
        gen.generateGeologicalFeatures(
          makeBiome({ geologicalDensity: 1.0, geologicalFeatures: [type] }),
          bounds, 3
        );
        expect(gen.getGeologicalMeshes().length).toBeGreaterThan(0);
      });
    }
  });

  describe('dispose', () => {
    it('clears geological meshes', () => {
      const gen = new ProceduralNatureGenerator(makeScene());
      gen.generateGeologicalFeatures(makeBiome({ geologicalDensity: 1.0 }), bounds, 5);
      expect(gen.getGeologicalMeshes().length).toBeGreaterThan(0);
      gen.dispose();
      expect(gen.getGeologicalMeshes().length).toBe(0);
    });
  });

  describe('biome presets', () => {
    const biomeNames = ['forest', 'plains', 'mountains', 'desert', 'tundra', 'wasteland', 'tropical', 'swamp', 'urban'];

    for (const name of biomeNames) {
      it(`"${name}" biome has geological configuration`, () => {
        const biome = ProceduralNatureGenerator.getBiomeFromTerrain(name);
        expect(typeof biome.geologicalDensity).toBe('number');
        expect(biome.geologicalDensity).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(biome.geologicalFeatures)).toBe(true);
      });
    }

    it('mountains has more feature types and higher density than plains', () => {
      const mountains = ProceduralNatureGenerator.getBiomeFromTerrain('mountains');
      const plains = ProceduralNatureGenerator.getBiomeFromTerrain('plains');
      expect(mountains.geologicalFeatures.length).toBeGreaterThan(plains.geologicalFeatures.length);
      expect(mountains.geologicalDensity).toBeGreaterThan(plains.geologicalDensity);
    });
  });
});
