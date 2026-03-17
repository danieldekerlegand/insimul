/**
 * Tests for BuildingEntrySystem
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock window for Node environment
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
(globalThis as any).window = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
};

// Mock Babylon.js
vi.mock('@babylonjs/core', () => {
  const Vector3 = class {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    add(v: any) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
    scale(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
    static Distance(a: any, b: any) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
    }
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
      Black: () => ({ r: 0, g: 0, b: 0, scale: (s: number) => ({ r: 0, g: 0, b: 0 }) }),
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

// Use the mocked Vector3
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
    getPlayerPosition: vi.fn(() => pos),
    onEnterBuilding: vi.fn(),
    onExitBuilding: vi.fn(),
    onShowToast: vi.fn(),
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

describe('BuildingEntrySystem', () => {
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
    // Bypass fade transition in tests
    system._fadeOverride = async () => {};
  });

  afterEach(() => {
    system.dispose();
  });

  describe('registerBuilding', () => {
    it('should register a building', () => {
      const data = createBuildingData();
      system.registerBuilding(data);
      expect(system.isInside).toBe(false);
    });

    it('should register multiple buildings', () => {
      system.registerBuilding(createBuildingData({ id: 'b1' }));
      system.registerBuilding(createBuildingData({ id: 'b2' }));
      system.registerBuilding(createBuildingData({ id: 'b3' }));
      expect(system.isInside).toBe(false);
    });

    it('should unregister a building', () => {
      system.registerBuilding(createBuildingData({ id: 'b1' }));
      system.unregisterBuilding('b1');
      expect(system.isInside).toBe(false);
    });
  });

  describe('enterBuilding', () => {
    it('should enter a registered building', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(system.isInside).toBe(true);
      expect(system.getActiveBuildingId()).toBe('building1');
      expect(system.getActiveInterior()).not.toBeNull();
    });

    it('should not enter an unregistered building', async () => {
      await system.enterBuilding('nonexistent');
      expect(system.isInside).toBe(false);
    });

    it('should not enter if already inside', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      system.registerBuilding(createBuildingData({ id: 'building2' }));
      await system.enterBuilding('building2');

      // Should still be in building1
      expect(system.getActiveBuildingId()).toBe('building1');
    });

    it('should call onTeleportPlayer with interior door position', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(callbacks.onTeleportPlayer).toHaveBeenCalled();
      const teleportPos = (callbacks.onTeleportPlayer as any).mock.calls[0][0];
      expect(teleportPos.y).toBeGreaterThan(400); // Interior Y-offset
    });

    it('should call onEnterBuilding callback', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      expect(callbacks.onEnterBuilding).toHaveBeenCalledWith('building1', expect.any(Object));
    });

    it('should call onShowToast with building name', async () => {
      system.registerBuilding(createBuildingData({ buildingName: 'The Bakery' }));
      await system.enterBuilding('building1');

      expect(callbacks.onShowToast).toHaveBeenCalledWith(
        'Entered The Bakery',
        expect.any(String),
        expect.any(Number)
      );
    });

    it('should generate interior via interiorGenerator', async () => {
      const data = createBuildingData();
      system.registerBuilding(data);
      await system.enterBuilding('building1');

      expect(interiorGenerator.generateInterior).toHaveBeenCalledWith(
        'building1',
        'business',
        'Bakery',
        expect.any(Object)
      );
    });
  });

  describe('exitBuilding', () => {
    it('should exit a building', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      await system.exitBuilding();

      expect(system.isInside).toBe(false);
      expect(system.getActiveBuildingId()).toBeNull();
      expect(system.getActiveInterior()).toBeNull();
    });

    it('should not exit if not inside', async () => {
      await system.exitBuilding();
      expect(callbacks.onTeleportPlayer).not.toHaveBeenCalled();
    });

    it('should teleport player back to saved position', async () => {
      const playerPos = new Vector3(20, 1, 30);
      const cb = createMockCallbacks(playerPos);
      const s = new BuildingEntrySystem(scene, interiorGenerator, cb);
      s._fadeOverride = async () => {};
      s.registerBuilding(createBuildingData());
      await s.enterBuilding('building1');
      await s.exitBuilding();

      // Second teleport should restore overworld position
      const calls = (cb.onTeleportPlayer as any).mock.calls;
      const lastTeleport = calls[calls.length - 1][0];
      expect(lastTeleport.x).toBe(20);
      expect(lastTeleport.z).toBe(30);
      s.dispose();
    });

    it('should call onExitBuilding callback', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      await system.exitBuilding();

      expect(callbacks.onExitBuilding).toHaveBeenCalled();
    });

    it('should show exit toast', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      await system.exitBuilding();

      const toastCalls = (callbacks.onShowToast as any).mock.calls;
      const exitToast = toastCalls.find((c: any) => c[0] === 'Exited building');
      expect(exitToast).toBeDefined();
    });
  });

  describe('NPC pause/resume', () => {
    it('should pause NPCs on enter', async () => {
      const pause = vi.fn();
      const resume = vi.fn();
      system.registerNPCPauseCallback(pause, resume);
      system.registerBuilding(createBuildingData());

      await system.enterBuilding('building1');
      expect(pause).toHaveBeenCalledTimes(1);
      expect(resume).not.toHaveBeenCalled();
    });

    it('should resume NPCs on exit', async () => {
      const pause = vi.fn();
      const resume = vi.fn();
      system.registerNPCPauseCallback(pause, resume);
      system.registerBuilding(createBuildingData());

      await system.enterBuilding('building1');
      await system.exitBuilding();
      expect(resume).toHaveBeenCalledTimes(1);
    });

    it('should support multiple pause callbacks', async () => {
      const pause1 = vi.fn();
      const resume1 = vi.fn();
      const pause2 = vi.fn();
      const resume2 = vi.fn();
      system.registerNPCPauseCallback(pause1, resume1);
      system.registerNPCPauseCallback(pause2, resume2);
      system.registerBuilding(createBuildingData());

      await system.enterBuilding('building1');
      expect(pause1).toHaveBeenCalled();
      expect(pause2).toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('isInside starts false', () => {
      expect(system.isInside).toBe(false);
    });

    it('getActiveInterior returns null when outside', () => {
      expect(system.getActiveInterior()).toBeNull();
    });

    it('getActiveBuildingId returns null when outside', () => {
      expect(system.getActiveBuildingId()).toBeNull();
    });

    it('getActiveInterior returns layout when inside', async () => {
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      const interior = system.getActiveInterior();
      expect(interior).not.toBeNull();
      expect(interior?.buildingId).toBe('building1');
    });
  });

  describe('keyboard setup', () => {
    it('should register keydown listener on construction', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove keydown listener on dispose', () => {
      system.dispose();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('dispose', () => {
    it('should clean up all resources', () => {
      system.registerBuilding(createBuildingData({ id: 'b1' }));
      system.registerBuilding(createBuildingData({ id: 'b2' }));
      system.dispose();

      expect(system.isInside).toBe(false);
      expect(system.getActiveInterior()).toBeNull();
      expect(system.getActiveBuildingId()).toBeNull();
    });

    it('should remove render observer', () => {
      system.dispose();
      expect(scene.onBeforeRenderObservable.remove).toHaveBeenCalled();
    });
  });

  describe('InteriorNPCManager integration', () => {
    function createMockInteriorNPCManager() {
      return {
        populateInterior: vi.fn(() => []),
        clearInterior: vi.fn(),
        getPlacedNPCs: vi.fn(() => []),
        getPlacedCount: vi.fn(() => 0),
        getActiveBuildingId: vi.fn(() => null),
        isNPCInside: vi.fn(() => false),
        dispose: vi.fn(),
      } as any;
    }

    function createMockNPCMap() {
      const map = new Map();
      map.set('owner1', {
        mesh: { position: new Vector3(5, 0, 5), isEnabled: () => true, setEnabled: vi.fn() },
        characterData: { firstName: 'Owner', personality: { extroversion: 0.5 } },
      });
      map.set('emp1', {
        mesh: { position: new Vector3(6, 0, 6), isEnabled: () => true, setEnabled: vi.fn() },
        characterData: { firstName: 'Employee', personality: { extroversion: 0.5 } },
      });
      return map;
    }

    it('should call populateInterior on enter when InteriorNPCManager is wired', async () => {
      const npcManager = createMockInteriorNPCManager();
      const npcMap = createMockNPCMap();
      system.setInteriorNPCManager(npcManager, () => npcMap);

      const data = createBuildingData({
        metadata: {
          buildingType: 'business',
          businessType: 'Bakery',
          ownerId: 'owner1',
          employees: ['emp1'],
        },
      });
      system.registerBuilding(data);
      await system.enterBuilding('building1');

      expect(npcManager.populateInterior).toHaveBeenCalledWith(
        'building1',
        expect.any(Object), // interior layout
        expect.objectContaining({ ownerId: 'owner1', employees: ['emp1'] }),
        npcMap,
        undefined
      );
    });

    it('should call clearInterior on exit when InteriorNPCManager is wired', async () => {
      const npcManager = createMockInteriorNPCManager();
      system.setInteriorNPCManager(npcManager, () => new Map());

      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      await system.exitBuilding();

      expect(npcManager.clearInterior).toHaveBeenCalled();
    });

    it('should use building metadata from registration data', async () => {
      const npcManager = createMockInteriorNPCManager();
      const npcMap = createMockNPCMap();
      system.setInteriorNPCManager(npcManager, () => npcMap);

      const metadata = {
        buildingType: 'business',
        businessType: 'Bar',
        ownerId: 'owner1',
        employees: ['emp1'],
      };
      system.registerBuilding(createBuildingData({ metadata }));
      await system.enterBuilding('building1');

      const passedMetadata = npcManager.populateInterior.mock.calls[0][2];
      expect(passedMetadata.ownerId).toBe('owner1');
      expect(passedMetadata.employees).toEqual(['emp1']);
    });

    it('should fall back to buildingType/businessType when no metadata provided', async () => {
      const npcManager = createMockInteriorNPCManager();
      system.setInteriorNPCManager(npcManager, () => new Map());

      system.registerBuilding(createBuildingData({ metadata: undefined }));
      await system.enterBuilding('building1');

      const passedMetadata = npcManager.populateInterior.mock.calls[0][2];
      expect(passedMetadata.buildingType).toBe('business');
      expect(passedMetadata.businessType).toBe('Bakery');
    });

    it('should pass playerCharacterId from source function', async () => {
      const npcManager = createMockInteriorNPCManager();
      system.setInteriorNPCManager(
        npcManager,
        () => new Map(),
        () => 'player-char-123'
      );

      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      const passedPlayerId = npcManager.populateInterior.mock.calls[0][4];
      expect(passedPlayerId).toBe('player-char-123');
    });

    it('should not call populateInterior when no InteriorNPCManager is wired', async () => {
      // No setInteriorNPCManager called
      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      // Should not throw — just skips NPC population
      expect(system.isInside).toBe(true);
    });

    it('should expose getInteriorNPCManager', () => {
      expect(system.getInteriorNPCManager()).toBeNull();

      const npcManager = createMockInteriorNPCManager();
      system.setInteriorNPCManager(npcManager, () => new Map());

      expect(system.getInteriorNPCManager()).toBe(npcManager);
    });

    it('should clear InteriorNPCManager reference on dispose', () => {
      const npcManager = createMockInteriorNPCManager();
      system.setInteriorNPCManager(npcManager, () => new Map());

      system.dispose();

      expect(system.getInteriorNPCManager()).toBeNull();
    });

    it('should still call onEnterBuilding callback alongside NPC population', async () => {
      const npcManager = createMockInteriorNPCManager();
      system.setInteriorNPCManager(npcManager, () => new Map());

      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');

      // Both should be called
      expect(npcManager.populateInterior).toHaveBeenCalled();
      expect(callbacks.onEnterBuilding).toHaveBeenCalled();
    });

    it('should still call onExitBuilding callback alongside NPC cleanup', async () => {
      const npcManager = createMockInteriorNPCManager();
      system.setInteriorNPCManager(npcManager, () => new Map());

      system.registerBuilding(createBuildingData());
      await system.enterBuilding('building1');
      await system.exitBuilding();

      expect(npcManager.clearInterior).toHaveBeenCalled();
      expect(callbacks.onExitBuilding).toHaveBeenCalled();
    });
  });

  describe('building name display', () => {
    it('should show building name on enter', async () => {
      system.registerBuilding(createBuildingData({ buildingName: 'Town Bakery' }));
      await system.enterBuilding('building1');

      expect(callbacks.onShowToast).toHaveBeenCalledWith(
        'Entered Town Bakery',
        expect.any(String),
        expect.any(Number)
      );
    });

    it('should fall back to businessType when no name', async () => {
      system.registerBuilding(createBuildingData({ buildingName: undefined, businessType: 'Tavern' }));
      await system.enterBuilding('building1');

      expect(callbacks.onShowToast).toHaveBeenCalledWith(
        'Entered Tavern',
        expect.any(String),
        expect.any(Number)
      );
    });

    it('should fall back to buildingType when no name or businessType', async () => {
      system.registerBuilding(createBuildingData({ buildingName: undefined, businessType: undefined }));
      await system.enterBuilding('building1');

      expect(callbacks.onShowToast).toHaveBeenCalledWith(
        'Entered business',
        expect.any(String),
        expect.any(Number)
      );
    });
  });
});
