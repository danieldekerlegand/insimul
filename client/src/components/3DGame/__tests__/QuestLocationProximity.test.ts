/**
 * Tests for visit_location proximity detection in QuestObjectManager.
 *
 * Verifies:
 * - Proximity check uses ground-level XZ distance (not raised marker Y position)
 * - Default radius is 8 units for visit_location objectives
 * - visitLocation() fires callbacks and completes objective
 * - Completion particle effects fire
 * - Toast notification shown
 * - Debug logging fires on proximity check
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Babylon mocks ────────────────────────────────────────────────────────────

const mockDispose = vi.fn();
const mockBeginAnimation = vi.fn();
const mockParticleStart = vi.fn();
const mockParticleDispose = vi.fn();

vi.mock('@babylonjs/core', () => {
  class MockVector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new MockVector3(this.x, this.y, this.z); }
    static Distance(a: MockVector3, b: MockVector3) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }

  class MockColor3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
  }

  class MockColor4 {
    constructor(public r = 0, public g = 0, public b = 0, public a = 0) {}
  }

  class MockMesh {
    name = '';
    position = new MockVector3();
    material: any = null;
    animations: any[] = [];
    metadata: any = null;
    isPickable = true;
    actionManager: any = null;
    _enabled = true;
    dispose = mockDispose;
    setEnabled(v: boolean) { this._enabled = v; }
    isEnabled() { return this._enabled; }
    isDisposed() { return false; }
    getChildMeshes() { return []; }
    getTotalVertices() { return 0; }
  }

  const MeshBuilder = {
    CreateCylinder: vi.fn(() => new MockMesh()),
    CreateTorus: vi.fn(() => new MockMesh()),
    CreateSphere: vi.fn(() => new MockMesh()),
    CreateBox: vi.fn(() => new MockMesh()),
    CreatePlane: vi.fn(() => new MockMesh()),
  };

  class MockStandardMaterial {
    diffuseColor: any = null;
    emissiveColor: any = null;
    alpha = 1;
    dispose = vi.fn();
  }

  class MockAnimation {
    static ANIMATIONTYPE_FLOAT = 0;
    static ANIMATIONLOOPMODE_CYCLE = 1;
    constructor() {}
    setKeys() {}
  }

  class MockParticleSystem {
    constructor() {}
    createPointEmitter = vi.fn();
    emitter: any = null;
    minSize = 0;
    maxSize = 0;
    minLifeTime = 0;
    maxLifeTime = 0;
    emitRate = 0;
    gravity: any = null;
    minEmitPower = 0;
    maxEmitPower = 0;
    color1: any = null;
    color2: any = null;
    colorDead: any = null;
    manualEmitCount = 0;
    start = mockParticleStart;
    dispose = mockParticleDispose;
  }

  class MockActionManager {
    static NothingTrigger = 0;
    registerAction = vi.fn();
  }

  class MockExecuteCodeAction {
    constructor() {}
  }

  return {
    Vector3: MockVector3,
    Color3: MockColor3,
    Color4: MockColor4,
    Mesh: MockMesh,
    MeshBuilder,
    StandardMaterial: MockStandardMaterial,
    Animation: MockAnimation,
    ParticleSystem: MockParticleSystem,
    ActionManager: MockActionManager,
    ExecuteCodeAction: MockExecuteCodeAction,
    Scene: vi.fn(),
  };
});

vi.mock('@babylonjs/gui', () => ({
  AdvancedDynamicTexture: {
    CreateFullscreenUI: vi.fn(() => ({
      addControl: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  Rectangle: vi.fn(() => ({
    addControl: vi.fn(),
    linkWithMesh: vi.fn(),
  })),
  TextBlock: vi.fn(() => ({})),
}));

// Mock ProceduralQuestObjects
vi.mock('../ProceduralQuestObjects', () => {
  class MockProceduralQuestObjects {
    generate() {
      return {
        mesh: { position: { x: 0, y: 0, z: 0 }, material: null, isPickable: true, dispose: vi.fn(), animations: [] },
      };
    }
    static getColor() { return { r: 1, g: 1, b: 1 }; }
  }
  return { ProceduralQuestObjects: MockProceduralQuestObjects };
});

// Mock VisualVocabularyDetector
vi.mock('../VisualVocabularyDetector', () => {
  class MockVisualVocabularyDetector {
    registerTarget = vi.fn();
    removeQuestTargets = vi.fn();
    setOnObjectiveCompleted = vi.fn();
  }
  return { VisualVocabularyDetector: MockVisualVocabularyDetector };
});

// Mock QuestCompletionEngine
const mockCompleteObjective = vi.fn();
const mockAddQuest = vi.fn();
vi.mock('../QuestCompletionEngine', () => {
  class MockQuestCompletionEngine {
    completeObjective = mockCompleteObjective;
    addQuest = mockAddQuest;
    setOnObjectiveCompleted = vi.fn();
    setOnQuestCompleted = vi.fn();
  }
  return { QuestCompletionEngine: MockQuestCompletionEngine };
});

// Mock isConversationOnlyQuest
vi.mock('@shared/quest-objective-types', () => ({
  isConversationOnlyQuest: vi.fn(() => false),
}));

import { Vector3, MeshBuilder } from '@babylonjs/core';
import { QuestObjectManager } from '../QuestObjectManager';
import type { Quest, QuestObjective } from '../QuestObjectManager';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeScene(): any {
  return {
    beginAnimation: vi.fn(),
    getEngine: () => ({ getRenderWidth: () => 800, getRenderHeight: () => 600 }),
    meshes: [],
    getMeshByName: () => null,
  };
}

function makeVisitObjective(overrides: Partial<QuestObjective> = {}): QuestObjective {
  return {
    id: 'obj-1',
    questId: 'quest-1',
    type: 'visit_location',
    description: 'Visit the Notice Board',
    completed: false,
    locationName: 'Notice Board',
    locationPosition: new Vector3(10, 0, 20),
    ...overrides,
  } as QuestObjective;
}

/**
 * Directly set up internal state for proximity testing, bypassing the
 * complex loadQuest → parseQuestObjectives → spawnLocationMarker chain.
 */
function setupManagerState(manager: any, quest: Quest) {
  // Push quest into activeQuests
  manager.activeQuests.push(quest);

  // For each visit_location objective, create a mock marker and ground position
  for (const obj of quest.objectives) {
    if (obj.type === 'visit_location' && obj.locationPosition) {
      // Create a mock marker mesh (simulating what spawnLocationMarker does)
      const marker = (MeshBuilder as any).CreateCylinder();
      marker.position = obj.locationPosition.clone();
      marker.position.y += 5; // This is what the real code does — raises it
      marker.metadata = {};
      manager.locationMarkers.set(obj.id, marker);

      // Store ground position (what the fix adds)
      const groundPos = obj.locationPosition.clone();
      groundPos.y = 0;
      manager.locationGroundPositions.set(obj.id, groundPos);
    }
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('QuestObjectManager visit_location proximity', () => {
  let manager: QuestObjectManager;
  let scene: any;
  let locationVisitedSpy: ReturnType<typeof vi.fn>;
  let toastSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
    manager = new QuestObjectManager(scene);
    locationVisitedSpy = vi.fn();
    toastSpy = vi.fn();
    manager.setOnLocationVisited(locationVisitedSpy);
    manager.setShowToast(toastSpy);
  });

  it('triggers visit when player is within default radius (8 units) in XZ plane', () => {
    const objective = makeVisitObjective();
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    // Player at (10, 1, 25) — 5 units away in Z, within radius 8
    const playerPos = new Vector3(10, 1, 25);
    manager.checkLocationProximity(playerPos);

    expect(mockCompleteObjective).toHaveBeenCalledWith('quest-1', 'obj-1');
    expect(locationVisitedSpy).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('does NOT trigger when player is outside the radius in XZ plane', () => {
    const objective = makeVisitObjective();
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    // Player at (10, 1, 30) — 10 units away in Z, outside radius 8
    const playerPos = new Vector3(10, 1, 30);
    manager.checkLocationProximity(playerPos);

    expect(mockCompleteObjective).not.toHaveBeenCalled();
    expect(locationVisitedSpy).not.toHaveBeenCalled();
  });

  it('uses XZ distance only — large Y offset does not prevent triggering', () => {
    const objective = makeVisitObjective();
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    // Player at (10, 100, 20) — 0 XZ distance but 100 units above
    const playerPos = new Vector3(10, 100, 20);
    manager.checkLocationProximity(playerPos);

    expect(mockCompleteObjective).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('respects custom locationRadius on the objective', () => {
    const objective = makeVisitObjective({ locationRadius: 3 });
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    // Player at (10, 1, 24) — 4 units away, outside custom radius 3
    manager.checkLocationProximity(new Vector3(10, 1, 24));
    expect(mockCompleteObjective).not.toHaveBeenCalled();

    // Player at (10, 1, 22) — 2 units away, within custom radius 3
    manager.checkLocationProximity(new Vector3(10, 1, 22));
    expect(mockCompleteObjective).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('shows toast notification on location visit', () => {
    const objective = makeVisitObjective({ description: 'Visit the Notice Board' });
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    manager.checkLocationProximity(new Vector3(10, 1, 20));

    expect(toastSpy).toHaveBeenCalledWith('Objective completed: Visit the Notice Board');
  });

  it('does not trigger for already completed objectives', () => {
    const objective = makeVisitObjective({ completed: true });
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    manager.checkLocationProximity(new Vector3(10, 1, 20));

    expect(mockCompleteObjective).not.toHaveBeenCalled();
  });

  it('fires particles on location completion', () => {
    const objective = makeVisitObjective();
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    manager.checkLocationProximity(new Vector3(10, 1, 20));

    expect(mockParticleStart).toHaveBeenCalled();
  });

  it('emits debug log during proximity check', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const objective = makeVisitObjective();
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    manager.checkLocationProximity(new Vector3(50, 1, 50));

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('[QuestObjectManager] Proximity check:')
    );
    debugSpy.mockRestore();
  });

  it('logs when proximity triggers', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const objective = makeVisitObjective();
    const quest: Quest = {
      id: 'quest-1', worldId: 'w1', title: 'Test', description: '', questType: 'test',
      difficulty: 'easy', status: 'active', objectives: [objective], progress: {}, completionCriteria: {},
    };
    setupManagerState(manager, quest);

    manager.checkLocationProximity(new Vector3(10, 1, 20));

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[QuestObjectManager] Location proximity triggered:')
    );
    logSpy.mockRestore();
  });
});
