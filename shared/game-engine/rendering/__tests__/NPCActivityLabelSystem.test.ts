/**
 * Tests for NPCActivityLabelSystem
 *
 * Tests activity label visibility, observation tracking, and quest integration.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';

// Mock Babylon.js classes that NPCActivityLabelSystem uses
vi.mock('@babylonjs/core', async () => {
  const actual = await vi.importActual('@babylonjs/core') as any;

  class MockDynamicTexture {
    hasAlpha = false;
    getContext() {
      return {
        clearRect: vi.fn(), fillStyle: '', beginPath: vi.fn(), moveTo: vi.fn(),
        lineTo: vi.fn(), quadraticCurveTo: vi.fn(), closePath: vi.fn(), fill: vi.fn(),
        font: '', textAlign: '', textBaseline: '', fillText: vi.fn(),
      };
    }
    update() {}
    dispose() {}
  }

  class MockStandardMaterial {
    diffuseTexture: any = null;
    emissiveColor: any = null;
    useAlphaFromDiffuseTexture = false;
    disableLighting = false;
    backFaceCulling = true;
    dispose() {}
  }

  return {
    ...actual,
    DynamicTexture: MockDynamicTexture,
    StandardMaterial: MockStandardMaterial,
    Mesh: {
      ...actual.Mesh,
      CreatePlane: vi.fn().mockImplementation(() => ({
        billboardMode: 0,
        scaling: { x: 1, y: 1, z: 1 },
        position: new actual.Vector3(0, 0, 0),
        material: null,
        isPickable: true,
        isVisible: true,
        dispose: vi.fn(),
      })),
      BILLBOARDMODE_ALL: 7,
    },
    Color3: actual.Color3,
    Scene: vi.fn(),
  };
});

import { NPCActivityLabelSystem, type ActivityLabelCallbacks } from '../NPCActivityLabelSystem';

// ── Helpers ─────────────────────────────────────────────────────────────────────

function makeCallbacks(overrides: Partial<ActivityLabelCallbacks> = {}): ActivityLabelCallbacks {
  return {
    getPlayerPosition: () => new Vector3(0, 0, 0),
    getNPCActivity: () => null,
    getNPCName: (id) => `NPC ${id}`,
    getNPCMesh: () => ({
      position: new Vector3(5, 0, 0),
    }) as any,
    onActivityObserved: vi.fn(),
    ...overrides,
  };
}

function makeScene(): any {
  return {} as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NPCActivityLabelSystem', () => {
  let system: NPCActivityLabelSystem;
  let callbacks: ActivityLabelCallbacks;

  afterEach(() => {
    system?.dispose();
  });

  describe('registration', () => {
    it('registers and unregisters NPCs', () => {
      callbacks = makeCallbacks();
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');
      system.registerNPC('npc-2');
      system.unregisterNPC('npc-1');
      // Should not throw on update
      system.update(1000);
    });
  });

  describe('observation tracking', () => {
    it('fires onActivityObserved after 5 seconds within 10m', () => {
      const onActivityObserved = vi.fn();
      callbacks = makeCallbacks({
        getPlayerPosition: () => new Vector3(0, 0, 0),
        getNPCActivity: () => 'Cooking',
        getNPCMesh: () => ({ position: new Vector3(5, 0, 0) }) as any, // 5m away
        onActivityObserved,
      });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');

      // Start observation
      system.update(0);
      expect(onActivityObserved).not.toHaveBeenCalled();

      // Not enough time yet
      system.update(3000);
      expect(onActivityObserved).not.toHaveBeenCalled();

      // After 5+ seconds
      system.update(6000);
      expect(onActivityObserved).toHaveBeenCalledWith('npc-1', 'NPC npc-1', 'Cooking', expect.any(Number));
    });

    it('does not fire observation when player is too far (>10m)', () => {
      const onActivityObserved = vi.fn();
      callbacks = makeCallbacks({
        getPlayerPosition: () => new Vector3(0, 0, 0),
        getNPCActivity: () => 'Cooking',
        getNPCMesh: () => ({ position: new Vector3(15, 0, 0) }) as any, // 15m away
        onActivityObserved,
      });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');

      system.update(0);
      system.update(10000);
      expect(onActivityObserved).not.toHaveBeenCalled();
    });

    it('does not fire observation when NPC has no activity', () => {
      const onActivityObserved = vi.fn();
      callbacks = makeCallbacks({
        getNPCActivity: () => null,
        onActivityObserved,
      });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');

      system.update(0);
      system.update(10000);
      expect(onActivityObserved).not.toHaveBeenCalled();
    });

    it('resets observation when activity changes', () => {
      const onActivityObserved = vi.fn();
      let currentActivity = 'Cooking';
      callbacks = makeCallbacks({
        getPlayerPosition: () => new Vector3(0, 0, 0),
        getNPCActivity: () => currentActivity,
        getNPCMesh: () => ({ position: new Vector3(5, 0, 0) }) as any,
        onActivityObserved,
      });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');

      // Start observing cooking
      system.update(0);
      system.update(3000); // 3s in

      // Activity changes
      currentActivity = 'Hammering';
      system.update(3001);

      // 3s into new activity (total 6s) - not enough for new activity
      system.update(6000);
      expect(onActivityObserved).not.toHaveBeenCalled();

      // 5s into new activity
      system.update(8002);
      expect(onActivityObserved).toHaveBeenCalledWith('npc-1', 'NPC npc-1', 'Hammering', expect.any(Number));
    });

    it('only fires observation once per activity', () => {
      const onActivityObserved = vi.fn();
      callbacks = makeCallbacks({
        getPlayerPosition: () => new Vector3(0, 0, 0),
        getNPCActivity: () => 'Cooking',
        getNPCMesh: () => ({ position: new Vector3(5, 0, 0) }) as any,
        onActivityObserved,
      });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');

      system.update(0);
      system.update(6000); // First trigger
      system.update(12000); // Same activity, same session

      expect(onActivityObserved).toHaveBeenCalledTimes(1);
    });
  });

  describe('getObservationDuration', () => {
    it('returns 0 for unobserved NPC', () => {
      callbacks = makeCallbacks({ getNPCActivity: () => null });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');
      system.update(1000);
      expect(system.getObservationDuration('npc-1', 1000)).toBe(0);
    });

    it('returns elapsed observation time', () => {
      callbacks = makeCallbacks({
        getPlayerPosition: () => new Vector3(0, 0, 0),
        getNPCActivity: () => 'Reading',
        getNPCMesh: () => ({ position: new Vector3(3, 0, 0) }) as any,
      });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');

      system.update(1000);
      const duration = system.getObservationDuration('npc-1', 4000);
      expect(duration).toBeCloseTo(3, 0);
    });
  });

  describe('dispose', () => {
    it('cleans up all state', () => {
      callbacks = makeCallbacks({ getNPCActivity: () => 'Working' });
      system = new NPCActivityLabelSystem(makeScene(), callbacks);
      system.registerNPC('npc-1');
      system.update(0);
      system.dispose();
      // Should not throw after dispose
      expect(() => system.update(1000)).not.toThrow();
    });
  });
});
