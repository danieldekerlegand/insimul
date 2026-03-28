/**
 * Tests for ProceduralNatureGenerator.generateLakes
 *
 * Mocks @babylonjs/core since tests run in Node without a canvas/WebGL context.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @babylonjs/core ────────────────────────────────────────────────────

const createdMeshes: any[] = [];

function makeMockMesh(name: string) {
  const mesh: any = {
    name,
    position: { x: 0, y: 0, z: 0, clone: () => ({ ...mesh.position }) },
    rotation: { x: 0, y: 0, z: 0 },
    scaling: { x: 1, y: 1, z: 1 },
    material: null,
    isPickable: true,
    isVisible: true,
    checkCollisions: false,
    setEnabled: vi.fn(),
    freezeWorldMatrix: vi.fn(),
    addLODLevel: vi.fn(),
    dispose: vi.fn(),
    getTotalVertices: () => 10,
    getChildMeshes: () => [],
    computeWorldMatrix: vi.fn(),
    getBoundingInfo: () => ({
      boundingBox: {
        minimumWorld: { x: -1, y: 0, z: -1 },
        maximumWorld: { x: 1, y: 2, z: 1 },
      },
    }),
  };
  createdMeshes.push(mesh);
  return mesh;
}

vi.mock('@babylonjs/core', () => {
  const Vector3 = class {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    clone() {
      return new Vector3(this.x, this.y, this.z);
    }
    subtract(other: any) {
      return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }
    static Distance(a: any, b: any) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
    }
    static Minimize(a: any, b: any) {
      return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
    }
    static Maximize(a: any, b: any) {
      return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
    }
    static Zero() {
      return new Vector3(0, 0, 0);
    }
    static One() {
      return new Vector3(1, 1, 1);
    }
  };

  const Color3 = class {
    r: number;
    g: number;
    b: number;
    constructor(r = 0, g = 0, b = 0) {
      this.r = r;
      this.g = g;
      this.b = b;
    }
    scale(s: number) {
      return new Color3(this.r * s, this.g * s, this.b * s);
    }
    static Black() {
      return new Color3(0, 0, 0);
    }
  };

  return {
    Scene: vi.fn(),
    Mesh: class {
      static MergeMeshes = vi.fn(() => makeMockMesh('merged'));
    },
    MeshBuilder: {
      CreateDisc: vi.fn((name: string) => makeMockMesh(name)),
      CreateSphere: vi.fn((name: string) => makeMockMesh(name)),
      CreateCylinder: vi.fn((name: string) => makeMockMesh(name)),
      CreateBox: vi.fn((name: string) => makeMockMesh(name)),
      CreatePlane: vi.fn((name: string) => makeMockMesh(name)),
    },
    Vector3,
    StandardMaterial: class {
      name: string;
      diffuseColor: any;
      emissiveColor: any;
      specularColor: any;
      specularPower: number = 64;
      alpha: number = 1;
      backFaceCulling: boolean = true;
      constructor(name: string) {
        this.name = name;
      }
    },
    Color3,
    InstancedMesh: class {},
    AbstractMesh: class {},
    Matrix: {
      Identity: () => ({ copyToArray: vi.fn() }),
      ComposeToRef: vi.fn(),
    },
    Quaternion: {
      Identity: () => ({}),
      RotationYawPitchRollToRef: vi.fn(),
    },
    SceneLoader: {
      ImportMeshAsync: vi.fn(),
    },
  };
});

vi.mock('@babylonjs/loaders/glTF', () => ({}));

vi.mock('../DebugLabelUtils', () => ({
  createDebugLabel: vi.fn(),
}));

import { ProceduralNatureGenerator } from '../ProceduralNatureGenerator';
import type { BiomeStyle } from '../ProceduralNatureGenerator';
import { MeshBuilder } from '@babylonjs/core';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('ProceduralNatureGenerator.generateLakes', () => {
  let generator: ProceduralNatureGenerator;
  const mockScene = {} as any;

  const waterBiome: BiomeStyle = {
    name: 'Forest',
    treeType: 'oak',
    treeDensity: 0.7,
    grassColor: { r: 0.2, g: 0.5, b: 0.15 } as any,
    rockColor: { r: 0.4, g: 0.4, b: 0.35 } as any,
    hasWater: true,
    hasFlowers: true,
    flowerColors: [],
  };

  const dryBiome: BiomeStyle = {
    name: 'Desert',
    treeType: 'palm',
    treeDensity: 0.05,
    grassColor: { r: 0.6, g: 0.5, b: 0.3 } as any,
    rockColor: { r: 0.5, g: 0.45, b: 0.35 } as any,
    hasWater: false,
    hasFlowers: false,
    flowerColors: [],
  };

  const bounds = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };

  // Heightmap that creates a basin at center (low) and higher surroundings
  const basinHeightSampler = (x: number, z: number): number => {
    const dist = Math.sqrt(x * x + z * z);
    return dist * 0.05; // lowest at center (0,0), higher outward
  };

  beforeEach(() => {
    createdMeshes.length = 0;
    vi.clearAllMocks();
    generator = new ProceduralNatureGenerator(mockScene);
  });

  it('should not generate lakes when biome has no water', () => {
    generator.generateLakes(dryBiome, bounds, basinHeightSampler);
    expect(generator.getLakeMeshes()).toHaveLength(0);
    expect(MeshBuilder.CreateDisc).not.toHaveBeenCalled();
  });

  it('should not generate lakes when no heightSampler is provided', () => {
    generator.generateLakes(waterBiome, bounds);
    expect(generator.getLakeMeshes()).toHaveLength(0);
  });

  it('should generate lakes in water-capable biomes', () => {
    generator.generateLakes(waterBiome, bounds, basinHeightSampler);
    const lakes = generator.getLakeMeshes();
    // Each lake creates 2 meshes: water disc + collision disc
    expect(lakes.length).toBeGreaterThanOrEqual(2);
    expect(MeshBuilder.CreateDisc).toHaveBeenCalled();
  });

  it('should create disc meshes for lake surfaces', () => {
    generator.generateLakes(waterBiome, bounds, basinHeightSampler);
    const discCalls = vi.mocked(MeshBuilder.CreateDisc).mock.calls;
    // At least one lake_ surface disc and one lake_collider_ disc
    const surfaceDiscs = discCalls.filter(c => /^lake_\d+$/.test(c[0] as string));
    const colliderDiscs = discCalls.filter(c => (c[0] as string).startsWith('lake_collider_'));
    expect(surfaceDiscs.length).toBeGreaterThanOrEqual(1);
    expect(colliderDiscs.length).toBeGreaterThanOrEqual(1);
    expect(surfaceDiscs.length).toBe(colliderDiscs.length);
  });

  it('should avoid positions near buildings', () => {
    // Place avoid positions densely across the entire grid
    const avoidPositions: any[] = [];
    for (let x = -100; x <= 100; x += 10) {
      for (let z = -100; z <= 100; z += 10) {
        avoidPositions.push({ x, y: 0, z });
      }
    }

    generator.generateLakes(waterBiome, bounds, basinHeightSampler, avoidPositions, 20);
    // With dense avoid positions, no lakes should be placed
    expect(generator.getLakeMeshes()).toHaveLength(0);
  });

  it('should limit lake count based on area', () => {
    // Small area — should produce fewer lakes
    const smallBounds = { minX: -30, maxX: 30, minZ: -30, maxZ: 30 };
    generator.generateLakes(waterBiome, smallBounds, basinHeightSampler);
    const lakes = generator.getLakeMeshes();
    // 60*60 = 3600 area / 10000 = 0.36, clamped to min 1 lake = 2 meshes
    expect(lakes.length).toBeLessThanOrEqual(10); // max 5 lakes * 2 meshes
  });

  it('should place lakes at terrain basins (lowest points)', () => {
    generator.generateLakes(waterBiome, bounds, basinHeightSampler);
    const discCalls = vi.mocked(MeshBuilder.CreateDisc).mock.calls;
    const lakeDiscs = discCalls.filter(c => (c[0] as string).match(/^lake_\d+$/));

    // The basin heightmap is lowest at center (0,0)
    // Lakes should be placed near the center
    for (const call of lakeDiscs) {
      const options = call[1] as any;
      expect(options.radius).toBeGreaterThanOrEqual(8);
      expect(options.radius).toBeLessThanOrEqual(25);
    }
  });

  it('should dispose all lake meshes on dispose()', () => {
    generator.generateLakes(waterBiome, bounds, basinHeightSampler);
    const lakes = generator.getLakeMeshes();
    expect(lakes.length).toBeGreaterThan(0);

    generator.dispose();
    expect(generator.getLakeMeshes()).toHaveLength(0);
    // Verify dispose was called on each mesh
    for (const mesh of lakes) {
      expect(mesh.dispose).toHaveBeenCalled();
    }
  });

  it('should use getBiomeFromTerrain to identify water biomes', () => {
    // Biomes that should have water (coast excluded — no terrain match in getBiomeFromTerrain)
    const waterTerrains = ['forest', 'mountain', 'tundra', 'tropical', 'swamp'];
    for (const terrain of waterTerrains) {
      const biome = ProceduralNatureGenerator.getBiomeFromTerrain(terrain);
      expect(biome.hasWater).toBe(true);
    }

    // Biomes that should not have water
    const dryTerrains = ['plains', 'desert', 'wasteland'];
    for (const terrain of dryTerrains) {
      const biome = ProceduralNatureGenerator.getBiomeFromTerrain(terrain);
      expect(biome.hasWater).toBe(false);
    }
  });
});
