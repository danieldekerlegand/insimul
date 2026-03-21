/**
 * Tests for VehicleSystem — player vehicle mounting/dismounting and speed modifiers.
 *
 * These tests verify the core logic of the VehicleSystem without depending
 * on Babylon.js runtime. We mock the CharacterController and Scene.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock Babylon.js core imports used by VehicleSystem
vi.mock('@babylonjs/core', () => {
  class MockVector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    add(other: MockVector3) { return new MockVector3(this.x + other.x, this.y + other.y, this.z + other.z); }
    clone() { return new MockVector3(this.x, this.y, this.z); }
  }

  class MockTransformNode {
    name: string;
    parent: any = null;
    position = new MockVector3();
    constructor(name: string, _scene?: any) { this.name = name; }
    dispose() {}
  }

  class MockMesh extends MockTransformNode {
    material: any = null;
    rotation = new MockVector3();
    constructor(name: string, _scene?: any) { super(name, _scene); }
  }

  return {
    Mesh: MockMesh,
    MeshBuilder: {
      CreateBox: (name: string, _opts: any, _scene: any) => new MockMesh(name),
      CreateTorus: (name: string, _opts: any, _scene: any) => new MockMesh(name),
      CreateCylinder: (name: string, _opts: any, _scene: any) => new MockMesh(name),
    },
    Scene: class {},
    StandardMaterial: class { diffuseColor: any; specularColor: any; constructor(_name: string, _scene: any) {} },
    Color3: class { constructor(public r = 0, public g = 0, public b = 0) {} },
    Vector3: MockVector3,
    TransformNode: MockTransformNode,
  };
});

// ── Import after mocking ─────────────────────────────────────────────────────

import { VehicleSystem, VEHICLE_CONFIGS, VEHICLE_CYCLE } from '../VehicleSystem';

// Mock CharacterController
function createMockController() {
  return {
    setWalkSpeed: vi.fn(),
    setRunSpeed: vi.fn(),
    setTurnSpeed: vi.fn(),
    setLeftSpeed: vi.fn(),
    setRightSpeed: vi.fn(),
    setBackSpeed: vi.fn(),
  };
}

// Mock GameEventBus
function createMockEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
}

function createVehicleSystem() {
  const controller = createMockController();
  const eventBus = createMockEventBus();
  const scene = {} as any;
  const playerMesh = { dispose: vi.fn() } as any;

  const system = new VehicleSystem(
    scene,
    playerMesh,
    controller as any,
    2.5,  // baseWalkSpeed
    5.0,  // baseRunSpeed
    60,   // baseTurnSpeed
    eventBus as any,
  );

  return { system, controller, eventBus };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('VehicleSystem', () => {
  describe('initial state', () => {
    it('starts unmounted', () => {
      const { system } = createVehicleSystem();
      expect(system.mounted).toBe(false);
      expect(system.vehicleType).toBeNull();
      expect(system.getLabel()).toBe('On Foot');
    });
  });

  describe('mount', () => {
    it('mounts a bicycle and applies speed multipliers', () => {
      const { system, controller } = createVehicleSystem();
      system.mount('bicycle');

      expect(system.mounted).toBe(true);
      expect(system.vehicleType).toBe('bicycle');
      expect(system.getLabel()).toBe('Bicycle');

      const config = VEHICLE_CONFIGS.bicycle;
      expect(controller.setWalkSpeed).toHaveBeenCalledWith(2.5 * config.walkSpeedMultiplier);
      expect(controller.setRunSpeed).toHaveBeenCalledWith(5.0 * config.runSpeedMultiplier);
      expect(controller.setTurnSpeed).toHaveBeenCalledWith(60 * config.turnSpeedMultiplier);
    });

    it('mounts a horse and applies speed multipliers', () => {
      const { system, controller } = createVehicleSystem();
      system.mount('horse');

      expect(system.mounted).toBe(true);
      expect(system.vehicleType).toBe('horse');
      expect(system.getLabel()).toBe('Horse');

      const config = VEHICLE_CONFIGS.horse;
      expect(controller.setWalkSpeed).toHaveBeenCalledWith(2.5 * config.walkSpeedMultiplier);
      expect(controller.setRunSpeed).toHaveBeenCalledWith(5.0 * config.runSpeedMultiplier);
      expect(controller.setTurnSpeed).toHaveBeenCalledWith(60 * config.turnSpeedMultiplier);
    });

    it('emits vehicle_mounted event', () => {
      const { system, eventBus } = createVehicleSystem();
      system.mount('bicycle');
      expect(eventBus.emit).toHaveBeenCalledWith({ type: 'vehicle_mounted', vehicleType: 'bicycle' });
    });

    it('switching vehicles directly works', () => {
      const { system } = createVehicleSystem();
      system.mount('bicycle');
      expect(system.vehicleType).toBe('bicycle');

      system.mount('horse');
      expect(system.vehicleType).toBe('horse');
      expect(system.getLabel()).toBe('Horse');
    });
  });

  describe('dismount', () => {
    it('restores base speeds on dismount', () => {
      const { system, controller } = createVehicleSystem();
      system.mount('horse');
      controller.setWalkSpeed.mockClear();
      controller.setRunSpeed.mockClear();
      controller.setTurnSpeed.mockClear();

      system.dismount();

      expect(system.mounted).toBe(false);
      expect(system.vehicleType).toBeNull();
      expect(controller.setWalkSpeed).toHaveBeenCalledWith(2.5);
      expect(controller.setRunSpeed).toHaveBeenCalledWith(5.0);
      expect(controller.setTurnSpeed).toHaveBeenCalledWith(60);
    });

    it('emits vehicle_dismounted event', () => {
      const { system, eventBus } = createVehicleSystem();
      system.mount('horse');
      eventBus.emit.mockClear();

      system.dismount();
      expect(eventBus.emit).toHaveBeenCalledWith({ type: 'vehicle_dismounted', vehicleType: 'horse' });
    });

    it('does nothing when already dismounted', () => {
      const { system, eventBus } = createVehicleSystem();
      system.dismount();
      expect(eventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('cycleVehicle', () => {
    it('cycles from on-foot to bicycle to horse to on-foot', () => {
      const { system } = createVehicleSystem();

      // On foot → bicycle
      system.cycleVehicle();
      expect(system.vehicleType).toBe('bicycle');

      // Bicycle → horse
      system.cycleVehicle();
      expect(system.vehicleType).toBe('horse');

      // Horse → on foot
      system.cycleVehicle();
      expect(system.vehicleType).toBeNull();
      expect(system.mounted).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('returns null when on foot', () => {
      const { system } = createVehicleSystem();
      expect(system.getConfig()).toBeNull();
    });

    it('returns config when mounted', () => {
      const { system } = createVehicleSystem();
      system.mount('bicycle');
      const config = system.getConfig();
      expect(config).not.toBeNull();
      expect(config!.type).toBe('bicycle');
      expect(config!.walkSpeedMultiplier).toBe(2.0);
    });
  });

  describe('dispose', () => {
    it('dismounts and restores speeds', () => {
      const { system, controller } = createVehicleSystem();
      system.mount('horse');
      controller.setWalkSpeed.mockClear();

      system.dispose();
      expect(system.mounted).toBe(false);
      expect(controller.setWalkSpeed).toHaveBeenCalledWith(2.5);
    });
  });

  describe('VEHICLE_CONFIGS', () => {
    it('bicycle is faster than walking but slower than horse', () => {
      expect(VEHICLE_CONFIGS.bicycle.walkSpeedMultiplier).toBeGreaterThan(1);
      expect(VEHICLE_CONFIGS.horse.walkSpeedMultiplier).toBeGreaterThan(VEHICLE_CONFIGS.bicycle.walkSpeedMultiplier);
    });

    it('horse run multiplier is greater than bicycle', () => {
      expect(VEHICLE_CONFIGS.horse.runSpeedMultiplier).toBeGreaterThan(VEHICLE_CONFIGS.bicycle.runSpeedMultiplier);
    });
  });

  describe('VEHICLE_CYCLE', () => {
    it('starts with null (on foot) and includes both vehicles', () => {
      expect(VEHICLE_CYCLE[0]).toBeNull();
      expect(VEHICLE_CYCLE).toContain('bicycle');
      expect(VEHICLE_CYCLE).toContain('horse');
    });
  });

  describe('speed multiplier math', () => {
    it('bicycle walk speed is exactly 2x base', () => {
      const { system, controller } = createVehicleSystem();
      system.mount('bicycle');
      expect(controller.setWalkSpeed).toHaveBeenCalledWith(5.0); // 2.5 * 2.0
    });

    it('horse walk speed is exactly 3x base', () => {
      const { system, controller } = createVehicleSystem();
      system.mount('horse');
      expect(controller.setWalkSpeed).toHaveBeenCalledWith(7.5); // 2.5 * 3.0
    });

    it('horse run speed is exactly 2.5x base', () => {
      const { system, controller } = createVehicleSystem();
      system.mount('horse');
      expect(controller.setRunSpeed).toHaveBeenCalledWith(12.5); // 5.0 * 2.5
    });
  });
});
