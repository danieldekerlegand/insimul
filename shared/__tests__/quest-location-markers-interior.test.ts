/**
 * Tests for quest location markers working with building interiors.
 *
 * Verifies that:
 * - Location markers with buildingId are hidden when outside
 * - Entering a building shows markers for that building and hides overworld markers
 * - Exiting a building restores overworld markers and hides interior markers
 * - Proximity checks work inside buildings using marker's actual position
 * - Proximity checks are skipped for disabled markers
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Babylon.js mock (all classes defined inline to avoid hoisting issues) ──

vi.mock('@babylonjs/core', () => {
  class Vec3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new Vec3(this.x, this.y, this.z); }
    static Distance(a: Vec3, b: Vec3) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
    }
    static Zero() { return new Vec3(0, 0, 0); }
    static One() { return new Vec3(1, 1, 1); }
  }

  class Col3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
    scale(s: number) { return new Col3(this.r * s, this.g * s, this.b * s); }
    add(c: Col3) { return new Col3(this.r + c.r, this.g + c.g, this.b + c.b); }
  }

  function makeMesh(name: string): any {
    let enabled = true;
    return {
      name,
      position: new Vec3(),
      scaling: new Vec3(1, 1, 1),
      rotation: new Vec3(),
      isPickable: true,
      isVisible: true,
      material: null,
      metadata: {},
      animations: [] as any[],
      renderingGroupId: 0,
      dispose: vi.fn(),
      setEnabled: vi.fn((val: boolean) => { enabled = val; }),
      isEnabled: vi.fn(() => enabled),
      getChildMeshes: vi.fn(() => []),
      getTotalVertices: vi.fn(() => 100),
      clone: vi.fn(),
      instantiateHierarchy: vi.fn(),
      actionManager: null,
    };
  }

  return {
    Vector3: Vec3,
    Color3: Col3,
    Scene: class {
      meshes: any[] = [];
      onBeforeRenderObservable = { add: vi.fn(() => ({})), remove: vi.fn() };
      beginAnimation = vi.fn();
      getLightByName = vi.fn(() => null);
    },
    Mesh: { BILLBOARDMODE_ALL: 7 },
    MeshBuilder: {
      CreateCylinder: vi.fn((_name: string) => makeMesh(_name)),
      CreateSphere: vi.fn((_name: string) => makeMesh(_name)),
      CreateBox: vi.fn((_name: string) => makeMesh(_name)),
      CreatePlane: vi.fn((_name: string) => makeMesh(_name)),
      CreateTorus: vi.fn((_name: string) => makeMesh(_name)),
    },
    StandardMaterial: class {
      diffuseColor: any;
      emissiveColor: any;
      specularColor: any;
      alpha = 1;
      disableLighting = false;
      backFaceCulling = true;
    },
    Animation: class {
      static ANIMATIONTYPE_FLOAT = 0;
      static ANIMATIONTYPE_VECTOR3 = 1;
      static ANIMATIONLOOPMODE_CYCLE = 1;
      static ANIMATIONLOOPMODE_CONSTANT = 0;
      setKeys = vi.fn();
    },
    ActionManager: class {
      registerAction = vi.fn();
    },
    ExecuteCodeAction: class {
      static OnPickTrigger = 1;
      constructor(public trigger: any, public func: any) {}
    },
    GlowLayer: class {
      addIncludedOnlyMesh = vi.fn();
      customEmissiveColorSelector: any;
    },
    HighlightLayer: class {
      addMesh = vi.fn();
      removeMesh = vi.fn();
    },
  };
});

vi.mock('@babylonjs/gui', () => ({
  AdvancedDynamicTexture: {
    CreateFullscreenUI: vi.fn(() => ({
      addControl: vi.fn(),
      removeControl: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  TextBlock: class {
    text = '';
    color = '';
    fontSize = 0;
    outlineWidth = 0;
    outlineColor = '';
  },
}));

// ─── Import under test ──────────────────────────────────────────────────────

import { QuestObjectManager, type QuestObjective, type Quest } from '../../client/src/components/3DGame/QuestObjectManager';
import { Vector3, Scene } from '@babylonjs/core';

function createManager(): QuestObjectManager {
  const scene = new Scene(null as any);
  const mgr = new QuestObjectManager(scene as any);
  mgr.setOnObjectiveCompleted(vi.fn());
  return mgr;
}

/** Helper to spawn a marker and register a quest with objectives directly. */
function setupWithObjective(
  manager: QuestObjectManager,
  objective: QuestObjective,
) {
  const quest: Quest = {
    id: objective.questId,
    worldId: 'world-1',
    title: 'Test Quest',
    description: 'A test quest',
    questType: 'exploration',
    difficulty: 'beginner',
    status: 'active',
    objectives: [objective],
    progress: {},
    completionCriteria: {},
  };

  // Directly set up internal state to avoid parseQuestObjectives re-creation
  const activeQuests = (manager as any).activeQuests as Quest[];
  activeQuests.push(quest);
  (manager as any).completionEngine.addQuest(quest);

  // Spawn the marker directly
  if (!objective.completed) {
    (manager as any).spawnLocationMarker(objective);
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Quest location markers with building interiors', () => {
  let manager: QuestObjectManager;

  beforeEach(() => {
    manager = createManager();
  });

  describe('onEnterBuilding / onExitBuilding', () => {
    it('hides overworld markers when entering a building', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(10, 0, 10) as any,
        locationRadius: 5,
      };
      setupWithObjective(manager, objective);

      const markers = (manager as any).locationMarkers as Map<string, any>;
      const marker = markers.get('obj-1');
      expect(marker).toBeDefined();
      expect(marker.isEnabled()).toBe(true);

      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);
      expect(marker.isEnabled()).toBe(false);
    });

    it('shows interior markers when entering the correct building', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(3, 0, 4) as any,
        locationRadius: 5,
        buildingId: 'building-A',
      };
      setupWithObjective(manager, objective);

      const markers = (manager as any).locationMarkers as Map<string, any>;
      const marker = markers.get('obj-1');
      // Interior marker should be hidden initially
      expect(marker.isEnabled()).toBe(false);

      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);
      expect(marker.isEnabled()).toBe(true);
    });

    it('does not show interior markers for a different building', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(3, 0, 4) as any,
        locationRadius: 5,
        buildingId: 'building-B',
      };
      setupWithObjective(manager, objective);

      const markers = (manager as any).locationMarkers as Map<string, any>;
      const marker = markers.get('obj-1');

      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);
      expect(marker.isEnabled()).toBe(false);
    });

    it('restores overworld markers when exiting a building', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(10, 0, 10) as any,
        locationRadius: 5,
      };
      setupWithObjective(manager, objective);

      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);
      const markers = (manager as any).locationMarkers as Map<string, any>;
      const marker = markers.get('obj-1');
      expect(marker.isEnabled()).toBe(false);

      manager.onExitBuilding();
      expect(marker.isEnabled()).toBe(true);
    });

    it('hides interior markers when exiting a building', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(3, 0, 4) as any,
        locationRadius: 5,
        buildingId: 'building-A',
      };
      setupWithObjective(manager, objective);

      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);
      const markers = (manager as any).locationMarkers as Map<string, any>;
      const marker = markers.get('obj-1');
      expect(marker.isEnabled()).toBe(true);

      manager.onExitBuilding();
      expect(marker.isEnabled()).toBe(false);
    });

    it('repositions interior markers to interior coordinate space', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(3, 0, 4) as any,
        locationRadius: 5,
        buildingId: 'building-A',
      };
      setupWithObjective(manager, objective);

      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);

      const markers = (manager as any).locationMarkers as Map<string, any>;
      const marker = markers.get('obj-1');
      expect(marker.position.x).toBe(3);
      expect(marker.position.y).toBe(501);
      expect(marker.position.z).toBe(4);
    });

    it('cleans up saved positions on exit', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(3, 0, 4) as any,
        locationRadius: 5,
        buildingId: 'building-A',
      };
      setupWithObjective(manager, objective);

      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);
      manager.onExitBuilding();

      const savedPositions = (manager as any).savedMarkerPositions as Map<string, any>;
      expect(savedPositions.size).toBe(0);
    });
  });

  describe('checkLocationProximity with interiors', () => {
    it('triggers visit for overworld markers when player is close', () => {
      const visitedCallback = vi.fn();
      manager.setOnLocationVisited(visitedCallback);

      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(10, 0, 10) as any,
        locationRadius: 5,
      };
      setupWithObjective(manager, objective);

      // Marker position has y+5 from spawnLocationMarker, so check near (10, 5, 10)
      manager.checkLocationProximity(new Vector3(10, 5, 11) as any);
      expect(visitedCallback).toHaveBeenCalledWith('quest-1', 'obj-1');
    });

    it('does not trigger visit for disabled markers', () => {
      const visitedCallback = vi.fn();
      manager.setOnLocationVisited(visitedCallback);

      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(10, 0, 10) as any,
        locationRadius: 5,
        buildingId: 'building-A', // Interior marker, hidden by default
      };
      setupWithObjective(manager, objective);

      // Player at original marker position - but marker is disabled
      manager.checkLocationProximity(new Vector3(10, 5, 10) as any);
      expect(visitedCallback).not.toHaveBeenCalled();
    });

    it('triggers visit for interior markers when inside the correct building', () => {
      const visitedCallback = vi.fn();
      manager.setOnLocationVisited(visitedCallback);

      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: false,
        locationPosition: new Vector3(3, 0, 4) as any,
        locationRadius: 5,
        buildingId: 'building-A',
      };
      setupWithObjective(manager, objective);

      // Enter the building - marker moves to (3, 501, 4)
      manager.onEnterBuilding('building-A', new Vector3(0, 500, 0) as any);

      // Player near repositioned marker
      manager.checkLocationProximity(new Vector3(4, 501, 4) as any);
      expect(visitedCallback).toHaveBeenCalledWith('quest-1', 'obj-1');
    });
  });

  describe('skips completed objectives', () => {
    it('does not spawn markers for completed objectives', () => {
      const objective: QuestObjective = {
        id: 'obj-1',
        questId: 'quest-1',
        type: 'visit_location',
        description: 'Go to location',
        completed: true,
        locationPosition: new Vector3(10, 0, 10) as any,
        locationRadius: 5,
        buildingId: 'building-A',
      };
      setupWithObjective(manager, objective);

      const markers = (manager as any).locationMarkers as Map<string, any>;
      expect(markers.has('obj-1')).toBe(false);
    });
  });
});
