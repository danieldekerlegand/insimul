/**
 * Tests for QuestWorldObjectLinker
 *
 * Verifies quest-to-building matching, label creation, and lifecycle management.
 * Mocks @babylonjs/core since tests run in Node without WebGL.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @babylonjs/core ────────────────────────────────────────────────────

const mockDispose = vi.fn();
const mockBeginAnimation = vi.fn();
const mockStopAnimation = vi.fn();
const mockRegisterAction = vi.fn();

vi.mock('@babylonjs/core', () => {
  class MockVector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
  }
  class MockColor3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
    static Black() { return new MockColor3(0, 0, 0); }
  }
  class MockMesh {
    name = '';
    parent: any = null;
    position = new MockVector3();
    billboardMode = 0;
    material: any = null;
    animations: any[] = [];
    isPickable = true;
    actionManager: any = null;
    dispose = mockDispose;
    getBoundingInfo() {
      return {
        boundingBox: {
          maximumWorld: { y: 5 },
          minimumWorld: { y: 0 },
        },
      };
    }
    getChildMeshes() { return []; }
    static BILLBOARDMODE_ALL = 7;
  }
  const MeshBuilder = {
    CreatePlane: vi.fn(() => new MockMesh()),
  };
  class MockStandardMaterial {
    diffuseTexture: any = null;
    emissiveTexture: any = null;
    emissiveColor = new MockColor3();
    useAlphaFromDiffuseTexture = false;
    disableLighting = false;
    backFaceCulling = true;
    dispose = vi.fn();
  }
  class MockDynamicTexture {
    hasAlpha = false;
    getContext() {
      return {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        closePath: vi.fn(),
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
    static ANIMATIONTYPE_FLOAT = 0;
    static ANIMATIONLOOPMODE_CYCLE = 1;
    setKeys = vi.fn();
  }
  class MockActionManager {
    actions: any[] = [];
    registerAction = mockRegisterAction;
    dispose = vi.fn();
  }
  class MockExecuteCodeAction {
    constructor(public trigger: number, public func: Function) {}
  }
  return {
    AbstractMesh: MockMesh,
    ActionManager: Object.assign(MockActionManager, {
      OnPointerOverTrigger: 1,
      OnPointerOutTrigger: 2,
      OnPickTrigger: 3,
    }),
    Animation: MockAnimation,
    Color3: MockColor3,
    DynamicTexture: MockDynamicTexture,
    ExecuteCodeAction: MockExecuteCodeAction,
    Mesh: MockMesh,
    MeshBuilder,
    Scene: class {},
    StandardMaterial: MockStandardMaterial,
    Vector3: MockVector3,
  };
});

import { QuestWorldObjectLinker, type QuestData, type WorldObjectEntry } from '../QuestWorldObjectLinker';
import { Vector3, Mesh, StandardMaterial } from '@babylonjs/core';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeScene(): any {
  return {
    beginAnimation: mockBeginAnimation,
    stopAnimation: mockStopAnimation,
  };
}

function makeBuildingEntry(
  id: string,
  meta: Record<string, any> = {}
): WorldObjectEntry {
  const mesh = new Mesh() as any;
  mesh.material = new StandardMaterial() as any;
  return {
    position: new Vector3(10, 0, 20),
    metadata: { buildingId: id, buildingType: 'business', ...meta },
    mesh,
  };
}

function makeQuest(overrides: Partial<QuestData> = {}): QuestData {
  return {
    id: 'quest-1',
    title: 'Test Quest',
    status: 'active',
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('QuestWorldObjectLinker', () => {
  let linker: QuestWorldObjectLinker;
  let scene: any;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
    linker = new QuestWorldObjectLinker(scene);
  });

  describe('updateLinks', () => {
    it('links a quest to a building by locationId', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      const quests = [makeQuest({ locationId: 'bldg-1' })];

      linker.updateLinks(quests, buildingData);

      expect(linker.linkedCount).toBe(1);
      expect(linker.hasQuestLinks('bldg-1')).toBe(true);
    });

    it('links a quest to a building by locationName matching businessName', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1', {
        businessName: 'La Boulangerie',
      }));

      const quests = [makeQuest({ locationName: 'Boulangerie' })];

      linker.updateLinks(quests, buildingData);

      expect(linker.linkedCount).toBe(1);
      expect(linker.hasQuestLinks('bldg-1')).toBe(true);
    });

    it('links a quest to a building by locationName matching businessType', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1', {
        businessType: 'Bakery',
      }));

      const quests = [makeQuest({ locationName: 'bakery' })];

      linker.updateLinks(quests, buildingData);

      expect(linker.linkedCount).toBe(1);
    });

    it('does not link quests with status other than active', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      const quests = [makeQuest({ status: 'completed', locationId: 'bldg-1' })];

      linker.updateLinks(quests, buildingData);

      expect(linker.linkedCount).toBe(0);
    });

    it('links objectives with NPC references via npcBuildingMap', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      const npcBuildingMap = new Map<string, string>();
      npcBuildingMap.set('npc-1', 'bldg-1');

      const quests = [makeQuest({
        objectives: [{
          type: 'talk_to_npc',
          description: 'Talk to the Baker',
          completed: false,
          npcId: 'npc-1',
          npcName: 'Baker',
        }],
      })];

      linker.updateLinks(quests, buildingData, npcBuildingMap);

      expect(linker.linkedCount).toBe(1);
      const info = linker.getQuestInfoForBuilding('bldg-1');
      expect(info).toHaveLength(1);
      expect(info[0].objectiveType).toBe('talk_to_npc');
    });

    it('removes links when quests become inactive', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      // First update: active quest
      linker.updateLinks([makeQuest({ locationId: 'bldg-1' })], buildingData);
      expect(linker.linkedCount).toBe(1);

      // Second update: quest completed
      linker.updateLinks([makeQuest({ status: 'completed', locationId: 'bldg-1' })], buildingData);
      expect(linker.linkedCount).toBe(0);
    });

    it('skips completed objectives', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      const npcBuildingMap = new Map<string, string>();
      npcBuildingMap.set('npc-1', 'bldg-1');

      const quests = [makeQuest({
        objectives: [{
          type: 'talk_to_npc',
          description: 'Talk to the Baker',
          completed: true,
          npcId: 'npc-1',
        }],
      })];

      linker.updateLinks(quests, buildingData, npcBuildingMap);

      // No link because objective is completed
      expect(linker.linkedCount).toBe(0);
    });

    it('links multiple quests to the same building', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      const quests = [
        makeQuest({ id: 'q1', locationId: 'bldg-1', title: 'Quest 1' }),
        makeQuest({ id: 'q2', locationId: 'bldg-1', title: 'Quest 2' }),
      ];

      linker.updateLinks(quests, buildingData);

      expect(linker.linkedCount).toBe(1);
      const info = linker.getQuestInfoForBuilding('bldg-1');
      expect(info).toHaveLength(2);
    });
  });

  describe('removeQuestLinks', () => {
    it('removes links for a specific quest', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));
      buildingData.set('bldg-2', makeBuildingEntry('bldg-2'));

      const quests = [
        makeQuest({ id: 'q1', locationId: 'bldg-1' }),
        makeQuest({ id: 'q2', locationId: 'bldg-2' }),
      ];

      linker.updateLinks(quests, buildingData);
      expect(linker.linkedCount).toBe(2);

      linker.removeQuestLinks('q1');
      expect(linker.linkedCount).toBe(1);
      expect(linker.hasQuestLinks('bldg-1')).toBe(false);
      expect(linker.hasQuestLinks('bldg-2')).toBe(true);
    });
  });

  describe('getLinkedBuildings', () => {
    it('returns building IDs linked to a quest', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));
      buildingData.set('bldg-2', makeBuildingEntry('bldg-2'));

      const quests = [
        makeQuest({ id: 'q1', locationId: 'bldg-1' }),
        makeQuest({ id: 'q1', locationId: 'bldg-2' }),
      ];

      linker.updateLinks(quests, buildingData);

      const buildings = linker.getLinkedBuildings('q1');
      expect(buildings).toContain('bldg-1');
      expect(buildings).toContain('bldg-2');
    });

    it('returns empty array for unknown quest', () => {
      expect(linker.getLinkedBuildings('unknown')).toEqual([]);
    });
  });

  describe('click callback', () => {
    it('fires onQuestObjectClicked when set', () => {
      const callback = vi.fn();
      linker.setOnQuestObjectClicked(callback);

      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      linker.updateLinks([makeQuest({ locationId: 'bldg-1' })], buildingData);

      // Find the pick action registered and invoke it
      const pickAction = mockRegisterAction.mock.calls.find(
        (call: any) => call[0]?.trigger === 3 // OnPickTrigger
      );
      expect(pickAction).toBeDefined();
      if (pickAction) {
        pickAction[0].func();
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ questId: 'quest-1' })
        );
      }
    });
  });

  describe('completionCriteria matching', () => {
    it('links discover_location criteria to building', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      const quests = [makeQuest({
        completionCriteria: {
          type: 'discover_location',
          locationId: 'bldg-1',
          description: 'Find the hidden shop',
        },
      })];

      linker.updateLinks(quests, buildingData);

      expect(linker.linkedCount).toBe(1);
    });

    it('links deliver_item NPC target via npcBuildingMap', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));

      const npcBuildingMap = new Map<string, string>();
      npcBuildingMap.set('npc-1', 'bldg-1');

      const quests = [makeQuest({
        completionCriteria: {
          type: 'deliver_item',
          targetNpcId: 'npc-1',
          description: 'Deliver bread',
        },
      })];

      linker.updateLinks(quests, buildingData, npcBuildingMap);

      expect(linker.linkedCount).toBe(1);
    });
  });

  describe('dispose', () => {
    it('cleans up all linked objects', () => {
      const buildingData = new Map<string, WorldObjectEntry>();
      buildingData.set('bldg-1', makeBuildingEntry('bldg-1'));
      buildingData.set('bldg-2', makeBuildingEntry('bldg-2'));

      linker.updateLinks([
        makeQuest({ id: 'q1', locationId: 'bldg-1' }),
        makeQuest({ id: 'q2', locationId: 'bldg-2' }),
      ], buildingData);

      expect(linker.linkedCount).toBe(2);

      linker.dispose();
      expect(linker.linkedCount).toBe(0);
    });
  });
});
