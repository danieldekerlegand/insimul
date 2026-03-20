/**
 * Tests for QuestIndicatorManager
 *
 * Verifies indicator type selection logic and lifecycle management.
 * Mocks @babylonjs/core since tests run in Node without WebGL.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @babylonjs/core ────────────────────────────────────────────────────

const mockDispose = vi.fn();
const mockBeginAnimation = vi.fn();
const mockStopAnimation = vi.fn();

vi.mock('@babylonjs/core', () => {
  class MockVector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
  }
  class MockColor3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
  }
  class MockMesh {
    name = '';
    parent: any = null;
    position = new MockVector3();
    billboardMode = 0;
    material: any = null;
    animations: any[] = [];
    dispose = mockDispose;
    static BILLBOARDMODE_ALL = 7;
  }
  const MeshBuilder = {
    CreatePlane: vi.fn(() => new MockMesh()),
  };
  class MockStandardMaterial {
    diffuseTexture: any = null;
    emissiveTexture: any = null;
    useAlphaFromDiffuseTexture = false;
    disableLighting = false;
  }
  class MockDynamicTexture {
    getContext() {
      return {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
      } as any;
    }
    update = vi.fn();
  }
  class MockAnimation {
    setKeys = vi.fn();
    static ANIMATIONTYPE_FLOAT = 0;
    static ANIMATIONTYPE_VECTOR3 = 1;
    static ANIMATIONLOOPMODE_CYCLE = 1;
  }
  class MockScene {
    beginAnimation = mockBeginAnimation;
    stopAnimation = mockStopAnimation;
  }

  return {
    Scene: MockScene,
    Mesh: MockMesh,
    MeshBuilder,
    StandardMaterial: MockStandardMaterial,
    Color3: MockColor3,
    Vector3: MockVector3,
    Animation: MockAnimation,
    DynamicTexture: MockDynamicTexture,
  };
});

import { QuestIndicatorManager, type QuestIndicatorType } from '../QuestIndicatorManager';
import { Scene, Mesh, MeshBuilder } from '@babylonjs/core';

const mockedMeshBuilder = vi.mocked(MeshBuilder);

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeScene(): Scene {
  return new Scene() as any;
}

function makeMesh(name = 'npc'): Mesh {
  return new Mesh() as any;
}

function makeNpcMap(entries: Array<{ id: string; character: any }>): Map<string, { mesh: Mesh; character: any }> {
  const map = new Map<string, { mesh: Mesh; character: any }>();
  for (const e of entries) {
    map.set(e.id, { mesh: makeMesh(e.id), character: e.character });
  }
  return map;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('QuestIndicatorManager', () => {
  let scene: Scene;
  let manager: QuestIndicatorManager;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
    manager = new QuestIndicatorManager(scene);
  });

  describe('getIndicatorType logic (via updateIndicators)', () => {
    it('shows "available" for quest-giver NPCs with no active quests', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');
    });

    it('shows null for NPCs that cannot give quests', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'unemployed' } },
      ]);
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBeNull();
    });

    it('shows "in_progress" for NPC with active incomplete quest', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: false }],
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('in_progress');
    });

    it('shows "turn_in" for NPC with all objectives completed', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: true }, { isCompleted: true }],
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('turn_in');
    });

    it('turn_in takes priority over available', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'merchant', canGiveQuests: true } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: true }],
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('turn_in');
    });

    it('shows "turn_in" for vocabulary_usage completion criteria', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
        progress: { currentCount: 5 },
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('turn_in');
    });

    it('shows "in_progress" when vocabulary_usage not met', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
        progress: { currentCount: 3 },
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('in_progress');
    });

    it('shows "turn_in" for conversation_turns completion', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'guide' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        completionCriteria: { type: 'conversation_turns', requiredTurns: 5 },
        progress: { turnsCompleted: 5 },
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('turn_in');
    });

    it('ignores completed quests (not active)', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'completed',
        objectives: [{ isCompleted: true }],
      }];
      manager.updateIndicators(npcs, quests);
      // Should fall through to "available" since NPC is a teacher
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');
    });

    it('respects canGiveQuests: false', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher', canGiveQuests: false } },
      ]);
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBeNull();
    });

    it('handles multiple NPCs with different states', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
        { id: 'npc2', character: { id: 'npc2', occupation: 'merchant' } },
        { id: 'npc3', character: { id: 'npc3', occupation: 'unemployed' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: true }],
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('turn_in');
      expect(manager.getIndicatorTypeForNPC('npc2')).toBe('available');
      expect(manager.getIndicatorTypeForNPC('npc3')).toBeNull();
    });
  });

  describe('lifecycle', () => {
    it('removeIndicator clears indicator for NPC', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');

      manager.removeIndicator('npc1');
      expect(manager.getIndicatorTypeForNPC('npc1')).toBeNull();
    });

    it('clearAll removes all indicators', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
        { id: 'npc2', character: { id: 'npc2', occupation: 'merchant' } },
      ]);
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');
      expect(manager.getIndicatorTypeForNPC('npc2')).toBe('available');

      manager.clearAll();
      expect(manager.getIndicatorTypeForNPC('npc1')).toBeNull();
      expect(manager.getIndicatorTypeForNPC('npc2')).toBeNull();
    });

    it('dispose clears all indicators', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      manager.updateIndicators(npcs, []);
      manager.dispose();
      expect(manager.getIndicatorTypeForNPC('npc1')).toBeNull();
    });

    it('refreshIndicator updates a single NPC', () => {
      const mesh = makeMesh('npc1');
      const character = { id: 'npc1', occupation: 'teacher' };

      // Initially no quests — should show available
      manager.refreshIndicator('npc1', mesh, character, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');

      // Now with a completed quest — should show turn_in
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: true }],
      }];
      manager.refreshIndicator('npc1', mesh, character, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('turn_in');
    });

    it('updates indicator when type changes', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);

      // First: no quests → available
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');

      // Second: active quest → in_progress
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: false }],
      }];
      manager.updateIndicators(npcs, quests);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('in_progress');
    });
  });

  describe('canNPCGiveQuests occupation matching', () => {
    const questGiverOccupations = [
      'teacher', 'professor', 'merchant', 'shopkeeper', 'guard',
      'mayor', 'innkeeper', 'blacksmith', 'librarian', 'elder',
      'captain', 'guide', 'trainer', 'master', 'chief',
    ];

    for (const occ of questGiverOccupations) {
      it(`recognizes "${occ}" as quest giver`, () => {
        const npcs = makeNpcMap([
          { id: 'npc1', character: { id: 'npc1', occupation: occ } },
        ]);
        manager.updateIndicators(npcs, []);
        expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');
      });
    }

    it('recognizes case-insensitive "Head Teacher"', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'Head Teacher' } },
      ]);
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBe('available');
    });

    it('does not match non-quest-giver occupations without explicit flag', () => {
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'unemployed' } },
      ]);
      manager.updateIndicators(npcs, []);
      expect(manager.getIndicatorTypeForNPC('npc1')).toBeNull();
    });
  });

  describe('pulse animation', () => {
    it('adds pulse animation for "available" indicators', () => {
      mockedMeshBuilder.CreatePlane.mockClear();
      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      manager.updateIndicators(npcs, []);

      // The mesh created by MeshBuilder.CreatePlane should have 2 animations
      // (float + pulse) for available indicators
      const createdMesh = mockedMeshBuilder.CreatePlane.mock.results[0]?.value as any;
      expect(createdMesh).toBeDefined();
      expect(createdMesh.animations.length).toBe(2); // float + pulse
    });

    it('adds pulse animation for "turn_in" indicators', () => {
      mockedMeshBuilder.CreatePlane.mockClear();

      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: true }],
      }];
      manager.updateIndicators(npcs, quests);

      const createdMesh = mockedMeshBuilder.CreatePlane.mock.results[0]?.value as any;
      expect(createdMesh).toBeDefined();
      expect(createdMesh.animations.length).toBe(2); // float + pulse
    });

    it('does NOT add pulse animation for "in_progress" indicators', () => {
      mockedMeshBuilder.CreatePlane.mockClear();

      const npcs = makeNpcMap([
        { id: 'npc1', character: { id: 'npc1', occupation: 'teacher' } },
      ]);
      const quests = [{
        id: 'q1',
        assignedByCharacterId: 'npc1',
        status: 'active',
        objectives: [{ isCompleted: false }],
      }];
      manager.updateIndicators(npcs, quests);

      const createdMesh = mockedMeshBuilder.CreatePlane.mock.results[0]?.value as any;
      expect(createdMesh).toBeDefined();
      expect(createdMesh.animations.length).toBe(1); // float only
    });
  });
});
