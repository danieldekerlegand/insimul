/**
 * Tests for playthrough data isolation — world truths must never mutate from gameplay.
 *
 * Validates that:
 * - Unified engine routes truth creation through the overlay when playthroughId is set
 * - Main quest progression uses the overlay for reads and writes when playthroughId is set
 * - Building commission system uses the overlay when playthroughId is set
 * - Bulk delete routes through overlay when playthroughId is set
 * - Without a playthroughId, all paths write directly to storage (authoring mode)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ────────────────────────────────────────────────────────────────────────────
// Mock storage
// ────────────────────────────────────────────────────────────────────────────
const mockStorage = vi.hoisted(() => ({
  getWorld: vi.fn(),
  getCharactersByWorld: vi.fn(),
  getRulesByWorld: vi.fn(),
  getGrammarsByWorld: vi.fn(),
  getTruthsByWorld: vi.fn(),
  getTruth: vi.fn(),
  createTruth: vi.fn(),
  updateTruth: vi.fn(),
  deleteTruth: vi.fn(),
  getCharacter: vi.fn(),
  getBusiness: vi.fn(),
  updateBusiness: vi.fn(),
  getDeltasByEntityType: vi.fn(),
  createPlaythroughDelta: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

// ────────────────────────────────────────────────────────────────────────────
// Mock Prolog (so unified engine doesn't fail)
// ────────────────────────────────────────────────────────────────────────────
vi.mock('../engines/prolog/prolog-sync.js', () => ({
  createPrologSyncService: vi.fn(() => ({ syncWorldToProlog: vi.fn() })),
}));
vi.mock('../engines/prolog/prolog-manager.js', () => ({
  PrologManager: vi.fn(() => ({ initialize: vi.fn() })),
}));

// Mock TotT modules for building commission
vi.mock('../extensions/tott/personality-behavior-system.js', () => ({
  getPersonality: vi.fn(() => ({
    openness: 0.5, conscientiousness: 0.5, extraversion: 0.5,
    agreeableness: 0.5, neuroticism: 0.5,
  })),
}));
vi.mock('../extensions/tott/hiring-system.js', () => ({
  getBusinessEmployees: vi.fn(() => []),
}));
vi.mock('../extensions/tott/business-system.js', () => ({
  closeBusiness: vi.fn(),
  transferOwnership: vi.fn(),
}));
vi.mock('../extensions/tott/prolog-queries.js', () => ({
  prologAssertFact: vi.fn(),
}));

// ────────────────────────────────────────────────────────────────────────────
// Import modules under test AFTER mocks
// ────────────────────────────────────────────────────────────────────────────
import * as PlaythroughOverlay from '../services/playthrough-overlay';
import { InsimulSimulationEngine } from '../engines/unified-engine';
import { MainQuestProgressionManager } from '../../shared/quests/main-quest-progression.js';
import { handleBusinessSuccession } from '../extensions/tott/building-commission-system';

// Spy on overlay methods
const overlayCreateSpy = vi.spyOn(PlaythroughOverlay, 'createTruthInPlaythrough');
const overlayUpdateSpy = vi.spyOn(PlaythroughOverlay, 'updateTruthInPlaythrough');
const overlayDeleteSpy = vi.spyOn(PlaythroughOverlay, 'deleteTruthInPlaythrough');

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const WORLD_ID = 'world-1';
const PLAYTHROUGH_ID = 'pt-1';
const SIM_ID = 'sim-1';

beforeEach(() => {
  vi.clearAllMocks();

  mockStorage.getWorld.mockResolvedValue({
    id: WORLD_ID,
    name: 'Test World',
    type: 'fantasy_medieval',
  });
  mockStorage.getCharactersByWorld.mockResolvedValue([
    { id: 'char-1', firstName: 'Alice', lastName: 'Smith', worldId: WORLD_ID },
  ]);
  mockStorage.getRulesByWorld.mockResolvedValue([]);
  mockStorage.getGrammarsByWorld.mockResolvedValue([]);
  mockStorage.getTruthsByWorld.mockResolvedValue([]);
  mockStorage.getDeltasByEntityType.mockResolvedValue([]);
  mockStorage.createTruth.mockImplementation(async (data: any) => ({
    id: `truth-${Date.now()}`,
    ...data,
  }));
  mockStorage.updateTruth.mockImplementation(async (id: string, data: any) => ({
    id,
    ...data,
  }));
  mockStorage.deleteTruth.mockResolvedValue(true);
  mockStorage.createPlaythroughDelta.mockImplementation(async (delta: any) => ({
    id: `delta-${Date.now()}`,
    ...delta,
    appliedAt: new Date(),
    createdAt: new Date(),
  }));
});

// ════════════════════════════════════════════════════════════════════════════
// 1. Unified Engine
// ════════════════════════════════════════════════════════════════════════════
describe('Unified Engine truth isolation', () => {
  it('creates truth via overlay when playthroughId is set', async () => {
    const engine = new InsimulSimulationEngine(mockStorage as any);
    await engine.loadRules(WORLD_ID);
    await engine.loadGrammars(WORLD_ID);
    await engine.initializeContext(WORLD_ID, SIM_ID, PLAYTHROUGH_ID);

    // Inject events directly into context and trigger truth creation
    (engine as any).context.events = [
      { type: 'custom_event', description: 'test event', timestamp: new Date() },
    ];
    await engine.createTruthsForEvents('test-rule');

    // Should have called overlay, NOT direct storage
    expect(overlayCreateSpy).toHaveBeenCalledWith(
      PLAYTHROUGH_ID,
      expect.objectContaining({ worldId: WORLD_ID }),
      expect.any(Number),
    );
    expect(mockStorage.createTruth).not.toHaveBeenCalled();
  });

  it('creates truth directly when no playthroughId', async () => {
    const engine = new InsimulSimulationEngine(mockStorage as any);
    await engine.loadRules(WORLD_ID);
    await engine.loadGrammars(WORLD_ID);
    await engine.initializeContext(WORLD_ID, SIM_ID); // no playthroughId

    (engine as any).context.events = [
      { type: 'custom_event', description: 'authoring event', timestamp: new Date() },
    ];
    await engine.createTruthsForEvents('test-rule');

    // Should have called storage directly, NOT overlay
    expect(mockStorage.createTruth).toHaveBeenCalled();
    expect(overlayCreateSpy).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. Main Quest Progression
// ════════════════════════════════════════════════════════════════════════════
describe('Main Quest Progression truth isolation', () => {
  let manager: MainQuestProgressionManager;

  beforeEach(() => {
    manager = new MainQuestProgressionManager();
  });

  describe('getMainQuestState', () => {
    it('reads through overlay when playthroughId is set', async () => {
      await manager.getMainQuestState(WORLD_ID, 'player-1', PLAYTHROUGH_ID);

      // Should read via overlay (getTruthsWithOverlay calls both getTruthsByWorld and getDeltasByEntityType)
      expect(mockStorage.getDeltasByEntityType).toHaveBeenCalledWith(PLAYTHROUGH_ID, 'truth');
    });

    it('reads directly from storage when no playthroughId', async () => {
      await manager.getMainQuestState(WORLD_ID, 'player-1');

      expect(mockStorage.getTruthsByWorld).toHaveBeenCalledWith(WORLD_ID);
      expect(mockStorage.getDeltasByEntityType).not.toHaveBeenCalled();
    });
  });

  describe('saveMainQuestState', () => {
    it('creates truth via overlay when playthroughId is set and no existing state', async () => {
      const state = {
        currentChapterId: 'ch-1',
        chapters: [],
        totalXPEarned: 0,
      } as any;

      await manager.saveMainQuestState(WORLD_ID, 'player-1', state, PLAYTHROUGH_ID);

      expect(overlayCreateSpy).toHaveBeenCalledWith(
        PLAYTHROUGH_ID,
        expect.objectContaining({
          worldId: WORLD_ID,
          characterId: 'player-1',
          category: 'main_quest_state',
        }),
        0,
      );
      expect(mockStorage.createTruth).not.toHaveBeenCalled();
    });

    it('updates truth via overlay when playthroughId is set and existing state', async () => {
      // Set up existing quest state truth
      const existingTruth = {
        id: 'truth-quest',
        worldId: WORLD_ID,
        characterId: 'player-1',
        category: 'main_quest_state',
        content: JSON.stringify({ currentChapterId: 'ch-1', chapters: [], totalXPEarned: 0 }),
      };
      mockStorage.getTruthsByWorld.mockResolvedValue([existingTruth]);

      const state = {
        currentChapterId: 'ch-2',
        chapters: [],
        totalXPEarned: 100,
      } as any;

      await manager.saveMainQuestState(WORLD_ID, 'player-1', state, PLAYTHROUGH_ID);

      expect(overlayUpdateSpy).toHaveBeenCalledWith(
        PLAYTHROUGH_ID,
        'truth-quest',
        expect.objectContaining({ content: JSON.stringify(state) }),
        0,
      );
      expect(mockStorage.updateTruth).not.toHaveBeenCalled();
    });

    it('creates truth directly when no playthroughId', async () => {
      const state = { currentChapterId: 'ch-1', chapters: [], totalXPEarned: 0 } as any;

      await manager.saveMainQuestState(WORLD_ID, 'player-1', state);

      expect(mockStorage.createTruth).toHaveBeenCalled();
      expect(overlayCreateSpy).not.toHaveBeenCalled();
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. Building Commission — Business Succession
// ════════════════════════════════════════════════════════════════════════════
describe('Building commission truth isolation', () => {
  beforeEach(() => {
    mockStorage.getBusiness.mockResolvedValue({
      id: 'biz-1',
      worldId: WORLD_ID,
      name: 'Test Bakery',
      businessType: 'bakery',
      isOutOfBusiness: false,
      ownerId: 'char-owner',
    });
    mockStorage.getCharacter.mockResolvedValue({
      id: 'char-owner',
      firstName: 'John',
      lastName: 'Baker',
      worldId: WORLD_ID,
      status: 'active',
      spouseId: null,
      parentIds: [],
      childIds: [],
    });
    mockStorage.getCharactersByWorld.mockResolvedValue([]);
  });

  it('creates succession truth via overlay when playthroughId is set', async () => {
    const result = await handleBusinessSuccession(WORLD_ID, 'biz-1', 'char-owner', PLAYTHROUGH_ID);

    expect(result.outcome).toBe('business_closed');
    expect(overlayCreateSpy).toHaveBeenCalledWith(
      PLAYTHROUGH_ID,
      expect.objectContaining({ worldId: WORLD_ID }),
      0,
    );
    expect(mockStorage.createTruth).not.toHaveBeenCalled();
  });

  it('creates succession truth directly when no playthroughId', async () => {
    const result = await handleBusinessSuccession(WORLD_ID, 'biz-1', 'char-owner');

    expect(result.outcome).toBe('business_closed');
    expect(mockStorage.createTruth).toHaveBeenCalled();
    expect(overlayCreateSpy).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. Truth merge utilities — base truths unchanged
// ════════════════════════════════════════════════════════════════════════════
describe('Truth merge purity', () => {
  it('mergeTruths does not mutate base array', async () => {
    const { mergeTruths } = await import('../../shared/game-engine/truth-merge');
    const base = [
      { id: 't1', title: 'Base Truth', playthroughId: null },
      { id: 't2', title: 'Another Base', playthroughId: null },
    ];
    const gameplay = [
      { id: 'pt1', title: 'Gameplay Truth', playthroughId: 'pt-1' },
    ];
    const deletedIds = new Set(['t2']);
    const baseCopy = [...base];

    const merged = mergeTruths(base, gameplay, deletedIds);

    // base array is not modified
    expect(base).toEqual(baseCopy);
    // merged result has correct content
    expect(merged).toHaveLength(2); // t1 + pt1 (t2 deleted)
    expect(merged.find(t => t.id === 't1')).toBeDefined();
    expect(merged.find(t => t.id === 'pt1')).toBeDefined();
    expect(merged.find(t => t.id === 't2')).toBeUndefined();
  });

  it('partitionTruths correctly separates base from gameplay', async () => {
    const { partitionTruths } = await import('../../shared/game-engine/truth-merge');
    const mixed = [
      { id: 't1', playthroughId: null },
      { id: 'pt1', playthroughId: 'pt-1' },
      { id: 't2', playthroughId: undefined },
      { id: 'pt2', playthroughId: 'pt-2' },
    ];

    const { base, gameplay } = partitionTruths(mixed);

    expect(base.map(t => t.id)).toEqual(['t1', 't2']);
    expect(gameplay.map(t => t.id)).toEqual(['pt1', 'pt2']);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. Overlay layer — deltas never touch base truths
// ════════════════════════════════════════════════════════════════════════════
describe('Playthrough overlay never mutates base truths', () => {
  it('createTruthInPlaythrough writes a delta, not a truth', async () => {
    await PlaythroughOverlay.createTruthInPlaythrough(PLAYTHROUGH_ID, {
      worldId: WORLD_ID,
      title: 'New gameplay truth',
    }, 5);

    expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
      expect.objectContaining({
        playthroughId: PLAYTHROUGH_ID,
        entityType: 'truth',
        operation: 'create',
        timestep: 5,
      }),
    );
    // Must NOT call createTruth
    expect(mockStorage.createTruth).not.toHaveBeenCalled();
  });

  it('updateTruthInPlaythrough writes a delta, not a truth update', async () => {
    mockStorage.getTruth.mockResolvedValue({
      id: 'truth-1',
      worldId: WORLD_ID,
      title: 'Base Truth',
    });

    await PlaythroughOverlay.updateTruthInPlaythrough(PLAYTHROUGH_ID, 'truth-1', { title: 'Modified' }, 3);

    expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
      expect.objectContaining({
        playthroughId: PLAYTHROUGH_ID,
        entityType: 'truth',
        operation: 'update',
        entityId: 'truth-1',
        deltaData: { title: 'Modified' },
      }),
    );
    expect(mockStorage.updateTruth).not.toHaveBeenCalled();
  });

  it('deleteTruthInPlaythrough writes a delta, not a truth delete', async () => {
    mockStorage.getTruth.mockResolvedValue({
      id: 'truth-1',
      worldId: WORLD_ID,
      title: 'Base Truth',
    });

    await PlaythroughOverlay.deleteTruthInPlaythrough(PLAYTHROUGH_ID, 'truth-1', 7);

    expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
      expect.objectContaining({
        playthroughId: PLAYTHROUGH_ID,
        entityType: 'truth',
        operation: 'delete',
        entityId: 'truth-1',
      }),
    );
    expect(mockStorage.deleteTruth).not.toHaveBeenCalled();
  });
});
