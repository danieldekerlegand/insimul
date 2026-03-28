/**
 * Tests for WaterRenderer (US-034)
 *
 * Mocks @babylonjs/core since tests run in Node without a canvas/WebGL context.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WaterFeatureIR } from '../../ir-types';
import type { BoundsIR } from '../../ir-types';

// ── Mock @babylonjs/core ────────────────────────────────────────────────────

const createdMeshes: any[] = [];

function makeMockMesh(name: string) {
  const mesh: any = {
    name,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    material: null,
    isPickable: true,
    isVisible: true,
    checkCollisions: false,
    freezeWorldMatrix: vi.fn(),
    unfreezeWorldMatrix: vi.fn(),
    addLODLevel: vi.fn(),
    dispose: vi.fn(),
    isDisposed: vi.fn(() => false),
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
  };

  return {
    Mesh: class {
      static DOUBLESIDE = 2;
    },
    MeshBuilder: {
      CreateDisc: vi.fn((name: string) => makeMockMesh(name)),
      CreateGround: vi.fn((name: string) => makeMockMesh(name)),
      CreatePlane: vi.fn((name: string) => makeMockMesh(name)),
      CreateRibbon: vi.fn((name: string) => makeMockMesh(name)),
    },
    Vector3,
    Color3,
    StandardMaterial: class {
      name: string;
      diffuseColor: any;
      emissiveColor: any;
      specularColor: any;
      specularPower: number = 64;
      alpha: number = 1;
      backFaceCulling: boolean = true;
      dispose = vi.fn();
      constructor(name: string) {
        this.name = name;
      }
    },
    Scene: vi.fn(),
  };
});

import { WaterRenderer } from '../WaterRenderer';
import { MeshBuilder } from '@babylonjs/core';

// ── Helpers ─────────────────────────────────────────────────────────────────

const sampleBounds: BoundsIR = {
  minX: -20, maxX: 20, minZ: -20, maxZ: 20, centerX: 0, centerZ: 0,
};

function makeFeature(overrides: Partial<WaterFeatureIR> & { type: WaterFeatureIR['type']; id: string }): WaterFeatureIR {
  return {
    worldId: 'world-1',
    subType: 'fresh',
    name: 'Test Water',
    position: { x: 0, y: 5, z: 0 },
    waterLevel: 5,
    bounds: sampleBounds,
    depth: 3,
    width: 10,
    flowDirection: null,
    flowSpeed: 0,
    shorelinePoints: [],
    settlementId: null,
    biome: 'temperate_forest',
    isNavigable: true,
    isDrinkable: true,
    modelAssetKey: null,
    color: null,
    transparency: 0.3,
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('WaterRenderer', () => {
  let renderer: WaterRenderer;
  const mockScene = {} as any;

  beforeEach(() => {
    createdMeshes.length = 0;
    vi.clearAllMocks();
    renderer = new WaterRenderer(mockScene);
  });

  describe('renderWaterFeature', () => {
    it('renders a lake as a disc mesh', () => {
      const lake = makeFeature({ id: 'lake-1', type: 'lake' });
      const mesh = renderer.renderWaterFeature(lake);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreateDisc).toHaveBeenCalledWith(
        'water_lake-1',
        expect.objectContaining({ radius: expect.any(Number), tessellation: 32 }),
        mockScene,
      );
      expect(mesh!.isPickable).toBe(false);
      expect(mesh!.checkCollisions).toBe(false);
    });

    it('renders a pond as a disc mesh', () => {
      const pond = makeFeature({ id: 'pond-1', type: 'pond' });
      const mesh = renderer.renderWaterFeature(pond);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreateDisc).toHaveBeenCalledWith(
        'water_pond-1',
        expect.any(Object),
        mockScene,
      );
    });

    it('renders a marsh as a disc mesh', () => {
      const marsh = makeFeature({ id: 'marsh-1', type: 'marsh' });
      const mesh = renderer.renderWaterFeature(marsh);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreateDisc).toHaveBeenCalled();
    });

    it('renders an ocean as a ground mesh', () => {
      const ocean = makeFeature({
        id: 'ocean-1',
        type: 'ocean',
        subType: 'salt',
        bounds: { minX: -200, maxX: 200, minZ: -200, maxZ: 200, centerX: 0, centerZ: 0 },
      });
      const mesh = renderer.renderWaterFeature(ocean);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreateGround).toHaveBeenCalledWith(
        'water_ocean-1',
        expect.objectContaining({ width: 400, height: 400, subdivisions: 16 }),
        mockScene,
      );
    });

    it('renders a waterfall as a plane mesh', () => {
      const waterfall = makeFeature({
        id: 'fall-1',
        type: 'waterfall',
        width: 8,
        depth: 15,
        flowDirection: { x: 0, y: -1, z: 1 },
      });
      const mesh = renderer.renderWaterFeature(waterfall);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreatePlane).toHaveBeenCalledWith(
        'water_fall-1',
        expect.objectContaining({ width: 8, height: 15 }),
        mockScene,
      );
    });

    it('renders a river as a ribbon mesh when shoreline points are provided', () => {
      const river = makeFeature({
        id: 'river-1',
        type: 'river',
        width: 12,
        shorelinePoints: [
          { x: -50, y: 5, z: 0 },
          { x: 0, y: 5, z: 0 },
          { x: 50, y: 5, z: 0 },
        ],
        flowDirection: { x: 1, y: 0, z: 0 },
        flowSpeed: 2,
      });
      const mesh = renderer.renderWaterFeature(river);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreateRibbon).toHaveBeenCalled();
    });

    it('renders a stream as a ribbon mesh', () => {
      const stream = makeFeature({
        id: 'stream-1',
        type: 'stream',
        width: 3,
        shorelinePoints: [
          { x: -20, y: 8, z: 5 },
          { x: 0, y: 7, z: 3 },
          { x: 20, y: 6, z: 0 },
        ],
      });
      const mesh = renderer.renderWaterFeature(stream);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreateRibbon).toHaveBeenCalled();
    });

    it('renders a canal as a ribbon mesh', () => {
      const canal = makeFeature({
        id: 'canal-1',
        type: 'canal',
        width: 6,
        shorelinePoints: [
          { x: -30, y: 2, z: 10 },
          { x: 0, y: 2, z: 10 },
          { x: 30, y: 2, z: 10 },
        ],
      });
      const mesh = renderer.renderWaterFeature(canal);

      expect(mesh).not.toBeNull();
      expect(MeshBuilder.CreateRibbon).toHaveBeenCalled();
    });

    it('returns null for linear water with fewer than 2 shoreline points', () => {
      const river = makeFeature({
        id: 'short-river',
        type: 'river',
        shorelinePoints: [{ x: 0, y: 5, z: 0 }],
      });
      const mesh = renderer.renderWaterFeature(river);
      expect(mesh).toBeNull();
    });

    it('applies custom color from feature data', () => {
      const lake = makeFeature({
        id: 'colored-lake',
        type: 'lake',
        color: { r: 0.8, g: 0.2, b: 0.1 },
      });
      const mesh = renderer.renderWaterFeature(lake);
      expect(mesh).not.toBeNull();
      // Material should be created with the custom color
      expect(mesh!.material).toBeDefined();
    });

    it('uses height sampler for linear water when provided', () => {
      const sampler = vi.fn(() => 3.0);
      const river = makeFeature({
        id: 'sampled-river',
        type: 'river',
        shorelinePoints: [
          { x: -10, y: 5, z: 0 },
          { x: 10, y: 5, z: 0 },
        ],
      });
      renderer.renderWaterFeature(river, sampler);
      expect(sampler).toHaveBeenCalled();
    });
  });

  describe('renderWaterFeatures', () => {
    it('renders multiple features and returns meshes', () => {
      const features = [
        makeFeature({ id: 'lake-a', type: 'lake' }),
        makeFeature({ id: 'pond-b', type: 'pond' }),
        makeFeature({
          id: 'ocean-c',
          type: 'ocean',
          bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100, centerX: 0, centerZ: 0 },
        }),
      ];
      const meshes = renderer.renderWaterFeatures(features);
      expect(meshes).toHaveLength(3);
    });

    it('skips features that cannot be rendered', () => {
      const features = [
        makeFeature({ id: 'lake-ok', type: 'lake' }),
        makeFeature({ id: 'bad-river', type: 'river', shorelinePoints: [] }),
      ];
      const meshes = renderer.renderWaterFeatures(features);
      expect(meshes).toHaveLength(1);
    });
  });

  describe('getWaterMeshes', () => {
    it('returns all rendered meshes', () => {
      renderer.renderWaterFeature(makeFeature({ id: 'l1', type: 'lake' }));
      renderer.renderWaterFeature(makeFeature({ id: 'l2', type: 'pond' }));
      expect(renderer.getWaterMeshes()).toHaveLength(2);
    });

    it('returns a copy (not the internal array)', () => {
      renderer.renderWaterFeature(makeFeature({ id: 'l1', type: 'lake' }));
      const meshes = renderer.getWaterMeshes();
      meshes.push({} as any);
      expect(renderer.getWaterMeshes()).toHaveLength(1);
    });
  });

  describe('update (wave animation)', () => {
    it('updates Y position of animated meshes', () => {
      const lake = makeFeature({ id: 'animated-lake', type: 'lake' });
      const mesh = renderer.renderWaterFeature(lake)!;
      const initialY = mesh.position.y;

      // Advance time significantly to ensure wave displacement
      renderer.update(1.0);

      // The position should have been modified by the wave
      expect(mesh.unfreezeWorldMatrix).toHaveBeenCalled();
      expect(mesh.freezeWorldMatrix).toHaveBeenCalled();
    });

    it('registers animations for water features', () => {
      renderer.renderWaterFeature(makeFeature({ id: 'a1', type: 'lake' }));
      renderer.renderWaterFeature(makeFeature({ id: 'a2', type: 'pond' }));
      expect(renderer.getAnimatedCount()).toBe(2);
    });

    it('skips disposed meshes during update', () => {
      const lake = makeFeature({ id: 'disposed-lake', type: 'lake' });
      const mesh = renderer.renderWaterFeature(lake)!;
      mesh.isDisposed.mockReturnValue(true);

      // Should not throw
      renderer.update(0.5);
      expect(mesh.unfreezeWorldMatrix).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('disposes all meshes and materials', () => {
      renderer.renderWaterFeature(makeFeature({ id: 'd1', type: 'lake' }));
      renderer.renderWaterFeature(makeFeature({ id: 'd2', type: 'pond' }));
      expect(renderer.getWaterMeshes()).toHaveLength(2);

      renderer.dispose();

      expect(renderer.getWaterMeshes()).toHaveLength(0);
      expect(renderer.getAnimatedCount()).toBe(0);
    });

    it('calls dispose on each mesh', () => {
      const mesh1 = renderer.renderWaterFeature(makeFeature({ id: 'dm1', type: 'lake' }))!;
      const mesh2 = renderer.renderWaterFeature(makeFeature({ id: 'dm2', type: 'pond' }))!;

      renderer.dispose();

      expect(mesh1.dispose).toHaveBeenCalled();
      expect(mesh2.dispose).toHaveBeenCalled();
    });
  });

  describe('material caching', () => {
    it('reuses material for same water type without custom color', () => {
      const lake1 = makeFeature({ id: 'mc1', type: 'lake' });
      const lake2 = makeFeature({ id: 'mc2', type: 'lake' });

      const mesh1 = renderer.renderWaterFeature(lake1)!;
      const mesh2 = renderer.renderWaterFeature(lake2)!;

      // Both should share the same material instance
      expect(mesh1.material).toBe(mesh2.material);
    });

    it('creates separate materials for features with custom colors', () => {
      const lake1 = makeFeature({ id: 'cc1', type: 'lake', color: { r: 1, g: 0, b: 0 } });
      const lake2 = makeFeature({ id: 'cc2', type: 'lake', color: { r: 0, g: 1, b: 0 } });

      const mesh1 = renderer.renderWaterFeature(lake1)!;
      const mesh2 = renderer.renderWaterFeature(lake2)!;

      // Each should have its own material
      expect(mesh1.material).not.toBe(mesh2.material);
    });
  });

  describe('LOD configuration', () => {
    it('sets LOD level on rendered meshes', () => {
      const lake = makeFeature({ id: 'lod-lake', type: 'lake' });
      const mesh = renderer.renderWaterFeature(lake)!;
      expect(mesh.addLODLevel).toHaveBeenCalledWith(150, null);
    });

    it('uses different LOD distances for different water types', () => {
      const lake = renderer.renderWaterFeature(makeFeature({ id: 'lod-l', type: 'lake' }))!;
      const ocean = renderer.renderWaterFeature(makeFeature({
        id: 'lod-o',
        type: 'ocean',
        bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100, centerX: 0, centerZ: 0 },
      }))!;

      // Lake LOD = 150, Ocean LOD = 500
      expect(lake.addLODLevel).toHaveBeenCalledWith(150, null);
      expect(ocean.addLODLevel).toHaveBeenCalledWith(500, null);
    });
  });
});
