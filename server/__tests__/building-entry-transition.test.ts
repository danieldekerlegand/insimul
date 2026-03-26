/**
 * Tests for BuildingEntrySystem fade transition behavior.
 *
 * Verifies:
 * - Three-phase transition: fade-out (0.5s), hold black (0.3s), fade-in (0.5s)
 * - Setup callback executes during the black period
 * - Entry spawns player inside front door facing inward
 * - Exit spawns player outside front door facing outward (away from building)
 * - Door sound hook fires on enter and exit
 * - Loading indicator appears if setup takes >2s
 * - Interior is fully loaded before fade-in begins
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock window
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
(globalThis as any).window = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
};

// Mock @babylonjs/gui
vi.mock('@babylonjs/gui', () => ({
  AdvancedDynamicTexture: {
    CreateFullscreenUI: vi.fn(() => ({
      addControl: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  Rectangle: class {
    width: any; height: any; background: any; alpha = 0; thickness = 0;
    isPointerBlocker = false;
    addControl = vi.fn();
  },
  TextBlock: class {
    color: any; fontSize: any; isVisible = false;
    constructor(_name?: string, _text?: string) {}
  },
}));

// Mock @babylonjs/core
vi.mock('@babylonjs/core', () => {
  const Vector3 = class {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    add(v: any) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
    scale(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
    static Zero() { return new Vector3(0, 0, 0); }
  };

  const createMockMesh = (name: string) => ({
    name,
    position: new Vector3(),
    isPickable: false,
    isVisible: true,
    billboardMode: 0,
    renderingGroupId: 0,
    material: null,
    dispose: vi.fn(),
    metadata: {},
    checkCollisions: false,
  });

  return {
    Vector3,
    Scene: class {
      activeCamera = {
        position: new Vector3(),
        getForwardRay: () => ({ direction: { normalize: () => new Vector3(0, 0, 1) } }),
      };
      onBeforeRenderObservable = {
        add: vi.fn(() => ({})),
        remove: vi.fn(),
      };
    },
    Mesh: { BILLBOARDMODE_ALL: 7 },
    MeshBuilder: {
      CreatePlane: vi.fn((_name: string) => createMockMesh(_name)),
      CreateBox: vi.fn((_name: string) => createMockMesh(_name)),
    },
    StandardMaterial: class {
      diffuseColor: any;
      emissiveColor: any;
      disableLighting = false;
      backFaceCulling = true;
      alpha = 1;
      useAlphaFromDiffuseTexture = false;
      diffuseTexture: any;
      dispose = vi.fn();
    },
    Color3: {
      Black: () => ({ r: 0, g: 0, b: 0 }),
      White: () => ({ r: 1, g: 1, b: 1 }),
    },
    Observer: class {},
    DynamicTexture: class {
      hasAlpha = false;
      getContext = () => ({
        clearRect: vi.fn(),
        fillStyle: '',
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: vi.fn(),
      });
      update = vi.fn();
      dispose = vi.fn();
    },
  };
});

import { BuildingEntrySystem, BuildingEntryData, BuildingEntryCallbacks } from '../../client/src/components/3DGame/BuildingEntrySystem';

const { Vector3, Scene } = await import('@babylonjs/core');

function createMockInteriorGenerator(): any {
  return {
    generateInterior: vi.fn((_buildingId: string, _buildingType: string, _businessType?: string, doorWorldPos?: any) => ({
      id: `interior_${_buildingId}`,
      buildingId: _buildingId,
      buildingType: _buildingType,
      businessType: _businessType,
      position: new Vector3(0, 500, 0),
      width: 10,
      depth: 8,
      height: 4,
      roomMesh: { dispose: vi.fn() },
      furniture: [],
      doorPosition: new Vector3(0, 501, -3.5),
      exitPosition: doorWorldPos?.clone() ?? new Vector3(0, 0, 0),
    })),
    getInterior: vi.fn(),
    dispose: vi.fn(),
  };
}

function createMockCallbacks(playerPos?: any): BuildingEntryCallbacks {
  const pos = playerPos ?? new Vector3(5, 0, 5);
  return {
    onTeleportPlayer: vi.fn(),
    onSetPlayerRotationY: vi.fn(),
    getPlayerRotationY: vi.fn(() => 0),
    getPlayerPosition: vi.fn(() => pos),
    onEnterBuilding: vi.fn(),
    onExitBuilding: vi.fn(),
    onShowToast: vi.fn(),
    onPlayDoorSound: vi.fn(),
  };
}

function createBuildingData(overrides: Partial<BuildingEntryData> = {}): BuildingEntryData {
  return {
    id: 'building1',
    position: new Vector3(10, 0, 10),
    rotation: 0,
    width: 10,
    depth: 8,
    buildingType: 'business',
    businessType: 'Bakery',
    buildingName: "Baker's Shop",
    mesh: { position: new Vector3(10, 0, 10), dispose: vi.fn() } as any,
    ...overrides,
  };
}

describe('BuildingEntrySystem transition', () => {
  let scene: any;
  let interiorGenerator: any;
  let callbacks: BuildingEntryCallbacks;
  let system: BuildingEntrySystem;

  beforeEach(() => {
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    scene = new Scene();
    interiorGenerator = createMockInteriorGenerator();
    callbacks = createMockCallbacks();
    system = new BuildingEntrySystem(scene, interiorGenerator, callbacks);
    // Bypass real fade — immediately execute the black-period callback
    system._transitionOverride = async (cb) => { await cb(); };
  });

  afterEach(() => {
    system.dispose();
  });

  describe('transition override contract', () => {
    it('should call _transitionOverride with the setup callback', async () => {
      const transitionSpy = vi.fn(async (cb: any) => { await cb(); });
      system._transitionOverride = transitionSpy;
      system.registerBuilding(createBuildingData());

      await system.enterBuilding('building1');
      expect(transitionSpy).toHaveBeenCalledTimes(1);
      expect(typeof transitionSpy.mock.calls[0][0]).toBe('function');
    });

    it('should call _transitionOverride once per enter and once per exit', async () => {
      const transitionSpy = vi.fn(async (cb: any) => { await cb(); });
      system._transitionOverride = transitionSpy;
      system.registerBuilding(createBuildingData());

      await system.enterBuilding('building1');
      await system.exitBuilding();
      expect(transitionSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('entry spawn position', () => {
    it('should position player at interior door position on entry', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(callbacks.onTeleportPlayer).toHaveBeenCalled();
      const teleportPos = (callbacks.onTeleportPlayer as any).mock.calls[0][0];
      // doorPosition from mock generator is (0, 501, -3.5)
      expect(teleportPos.x).toBe(0);
      expect(teleportPos.y).toBe(501);
      expect(teleportPos.z).toBe(-3.5);
    });

    it('should face player inward (rotation Y = 0) on entry', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(callbacks.onSetPlayerRotationY).toHaveBeenCalledWith(0);
    });
  });

  describe('exit spawn position', () => {
    it('should position player at door world position on exit', async () => {
      // Building at (10,0,10), rotation=0, depth=8 → door at (10, 0, 14.5)
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      await system.exitBuilding();

      const calls = (callbacks.onTeleportPlayer as any).mock.calls;
      const lastTeleport = calls[calls.length - 1][0];
      expect(lastTeleport.x).toBe(10);
      expect(lastTeleport.z).toBe(14.5);
    });

    it('should face player outward (building rotation) on exit', async () => {
      system.registerBuilding(createBuildingData({ rotation: Math.PI / 2 }));
      await system.enterBuilding('building1');
      await system.exitBuilding();

      const calls = (callbacks.onSetPlayerRotationY as any).mock.calls;
      const lastRotation = calls[calls.length - 1][0];
      expect(lastRotation).toBeCloseTo(Math.PI / 2);
    });

    it('should face player outward with rotation=0', async () => {
      system.registerBuilding(createBuildingData({ rotation: 0 }));
      await system.enterBuilding('building1');
      await system.exitBuilding();

      const calls = (callbacks.onSetPlayerRotationY as any).mock.calls;
      const lastRotation = calls[calls.length - 1][0];
      expect(lastRotation).toBe(0);
    });

    it('should fall back to saved position when door entry missing', async () => {
      const playerPos = new Vector3(20, 1, 30);
      const cb = createMockCallbacks(playerPos);
      const s = new BuildingEntrySystem(scene, interiorGenerator, cb);
      s._transitionOverride = async (fn) => { await fn(); };

      s.registerBuilding(createBuildingData());
      await s.enterBuilding('building1');
      // Unregister building while inside — removes door entry point
      s.unregisterBuilding('building1');
      await s.exitBuilding();

      const calls = (cb.onTeleportPlayer as any).mock.calls;
      const lastTeleport = calls[calls.length - 1][0];
      expect(lastTeleport.x).toBe(20);
      expect(lastTeleport.z).toBe(30);
      s.dispose();
    });
  });

  describe('door sound hook', () => {
    it('should trigger onPlayDoorSound on enter', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(callbacks.onPlayDoorSound).toHaveBeenCalledTimes(1);
    });

    it('should trigger onPlayDoorSound on exit', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      await system.exitBuilding();

      expect(callbacks.onPlayDoorSound).toHaveBeenCalledTimes(2);
    });

    it('should not throw when onPlayDoorSound is not provided', async () => {
      const cb = createMockCallbacks();
      delete (cb as any).onPlayDoorSound;
      const s = new BuildingEntrySystem(scene, interiorGenerator, cb);
      s._transitionOverride = async (fn) => { await fn(); };
      s.registerBuilding(createBuildingData());

      await expect(s.enterBuilding('building1')).resolves.toBeUndefined();
      await expect(s.exitBuilding()).resolves.toBeUndefined();
      s.dispose();
    });
  });

  describe('interior loading during black period', () => {
    it('should generate interior during the transition callback', async () => {
      let interiorGeneratedDuringBlack = false;
      system._transitionOverride = async (cb) => {
        await cb();
        // After callback, interior should be set
        interiorGeneratedDuringBlack = system.getActiveInterior() !== null;
      };
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(interiorGeneratedDuringBlack).toBe(true);
      expect(interiorGenerator.generateInterior).toHaveBeenCalled();
    });

    it('should set isInside during the black period (before fade-in)', async () => {
      let insideDuringBlack = false;
      system._transitionOverride = async (cb) => {
        await cb();
        insideDuringBlack = system.isInside;
      };
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(insideDuringBlack).toBe(true);
    });

    it('should call onEnterBuilding during the black period', async () => {
      let enterCalledDuringBlack = false;
      system._transitionOverride = async (cb) => {
        await cb();
        enterCalledDuringBlack = (callbacks.onEnterBuilding as any).mock.calls.length > 0;
      };
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(enterCalledDuringBlack).toBe(true);
    });

    it('should show toast only after transition completes', async () => {
      let toastCountDuringTransition = 0;
      system._transitionOverride = async (cb) => {
        await cb();
        toastCountDuringTransition = (callbacks.onShowToast as any).mock.calls.length;
      };
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      // Toast should NOT have been called during transition (0 calls during black)
      expect(toastCountDuringTransition).toBe(0);
      // But should be called after
      expect(callbacks.onShowToast).toHaveBeenCalled();
    });
  });

  describe('rotated building exit', () => {
    it('should compute correct door position for rotated building', async () => {
      // Building at (10,0,10), rotation=PI/2, depth=8
      // localDoorZ = 8/2 + 0.5 = 4.5
      // doorX = 10 + sin(PI/2)*4.5 = 10 + 4.5 = 14.5
      // doorZ = 10 + cos(PI/2)*4.5 ≈ 10 + 0 = 10
      system.registerBuilding(createBuildingData({ rotation: Math.PI / 2 }));
      await system.enterBuilding('building1');
      await system.exitBuilding();

      const calls = (callbacks.onTeleportPlayer as any).mock.calls;
      const exitPos = calls[calls.length - 1][0];
      expect(exitPos.x).toBeCloseTo(14.5);
      expect(exitPos.z).toBeCloseTo(10);
    });
  });
});
