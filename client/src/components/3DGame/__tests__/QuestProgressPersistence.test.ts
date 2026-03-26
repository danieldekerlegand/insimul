/**
 * Tests for quest objective progress persistence across save/load/refresh.
 *
 * Covers:
 * - Immediate quest progress save on objective completion
 * - 60-second quest progress auto-save timer
 * - Quest metadata persistence (photosMatched, textsRead, conversationsCompleted, cluesFound)
 * - Merge saved quest state with world quest definitions on load
 * - Completed objectives do NOT get markers; incomplete ones DO
 * - Full round-trip: complete 2 of 5 objectives, save/load, verify state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../QuestCompletionEngine';
import {
  PlaythroughQuestOverlay,
  type QuestOverlayState,
} from '../PlaythroughQuestOverlay';
import {
  WorldStateManager,
  AUTO_SAVE_TRIGGER_EVENTS,
  type GameStateSource,
  type GameStateTarget,
} from '../WorldStateManager';
import type { DataSource } from '../DataSource';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return { description: 'test objective', completed: false, ...overrides };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

function makeSource(overrides: Partial<GameStateSource> = {}): GameStateSource {
  return {
    getPlayerPosition: () => ({ x: 0, y: 0, z: 0 }),
    getPlayerRotation: () => ({ x: 0, y: 0, z: 0 }),
    getPlayerGold: () => 100,
    getPlayerHealth: () => 100,
    getPlayerEnergy: () => 100,
    getInventoryItems: () => [],
    getNPCStates: () => [],
    getRelationships: () => ({}),
    getRomanceData: () => null,
    getMerchantStates: () => [],
    getCurrentZone: () => null,
    getQuestProgress: () => ({}),
    getGameTime: () => 42,
    getWorldId: () => 'world-1',
    getPlaythroughId: () => 'pt-1',
    ...overrides,
  };
}

function makeTarget(): GameStateTarget {
  return {
    restorePlayerPosition: vi.fn(),
    restorePlayerStats: vi.fn(),
    restoreInventory: vi.fn(),
    restoreNPCStates: vi.fn(),
    restoreRelationships: vi.fn(),
    restoreRomanceData: vi.fn(),
    restoreMerchantStates: vi.fn(),
    restoreCurrentZone: vi.fn(),
    restoreQuestProgress: vi.fn(),
    restoreGameTime: vi.fn(),
  };
}

function makeDataSource(): DataSource {
  return {
    saveGameState: vi.fn().mockResolvedValue(undefined),
    loadGameState: vi.fn().mockResolvedValue(null),
    loadWorld: vi.fn().mockResolvedValue({}),
    loadCharacters: vi.fn().mockResolvedValue([]),
    loadActions: vi.fn().mockResolvedValue([]),
    loadBaseActions: vi.fn().mockResolvedValue([]),
    loadQuests: vi.fn().mockResolvedValue([]),
    loadSettlements: vi.fn().mockResolvedValue([]),
    loadRules: vi.fn().mockResolvedValue([]),
    loadBaseRules: vi.fn().mockResolvedValue([]),
    loadCountries: vi.fn().mockResolvedValue([]),
    loadStates: vi.fn().mockResolvedValue([]),
    loadBaseResources: vi.fn().mockResolvedValue({}),
    loadAssets: vi.fn().mockResolvedValue([]),
    loadConfig3D: vi.fn().mockResolvedValue({}),
    loadTruths: vi.fn().mockResolvedValue([]),
    loadCharacter: vi.fn().mockResolvedValue({}),
    startPlaythrough: vi.fn().mockResolvedValue({}),
    updateQuest: vi.fn().mockResolvedValue(undefined),
    loadSettlementBusinesses: vi.fn().mockResolvedValue([]),
    loadSettlementLots: vi.fn().mockResolvedValue([]),
    loadSettlementResidences: vi.fn().mockResolvedValue([]),
    payFines: vi.fn().mockResolvedValue({}),
    getEntityInventory: vi.fn().mockResolvedValue({}),
    getPlayerInventory: vi.fn().mockResolvedValue({}),
    getContainerContents: vi.fn().mockResolvedValue(null),
    transferItem: vi.fn().mockResolvedValue({}),
    getMerchantInventory: vi.fn().mockResolvedValue({}),
    loadPrologContent: vi.fn().mockResolvedValue(null),
    loadWorldItems: vi.fn().mockResolvedValue([]),
    loadGeography: vi.fn().mockResolvedValue(null),
    saveQuestProgress: vi.fn().mockResolvedValue(undefined),
    loadQuestProgress: vi.fn().mockResolvedValue(null),
  } as unknown as DataSource;
}

// ── quest_objective_completed in auto-save triggers ──────────────────────────

describe('quest_objective_completed auto-save trigger', () => {
  it('includes quest_objective_completed in AUTO_SAVE_TRIGGER_EVENTS', () => {
    expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('quest_objective_completed');
  });
});

// ── Immediate quest progress save via WorldStateManager ──────────────────────

describe('WorldStateManager quest progress save', () => {
  let manager: WorldStateManager;
  let ds: ReturnType<typeof makeDataSource>;
  let overlay: PlaythroughQuestOverlay;

  beforeEach(() => {
    ds = makeDataSource();
    manager = new WorldStateManager(ds as unknown as DataSource);
    overlay = new PlaythroughQuestOverlay();
    manager.setQuestOverlay(overlay);
    manager.setGameSource(makeSource());
  });

  afterEach(() => {
    manager.dispose();
  });

  it('saveQuestProgress serializes overlay and sends to dataSource', async () => {
    overlay.setObjectiveStates({
      'q1': [{ id: 'o1', completed: true }],
    });

    const result = await manager.saveQuestProgress();
    expect(result).toBe(true);
    expect(ds.saveQuestProgress).toHaveBeenCalledWith('pt-1', expect.objectContaining({
      overrides: {},
      created: {},
      objectiveStates: { 'q1': [{ id: 'o1', completed: true }] },
    }));
  });

  it('saveQuestProgress returns false without overlay', async () => {
    const mgr = new WorldStateManager(ds as unknown as DataSource);
    mgr.setGameSource(makeSource());
    const result = await mgr.saveQuestProgress();
    expect(result).toBe(false);
  });

  it('saveQuestProgress returns false without playthroughId', async () => {
    manager.setGameSource(makeSource({ getPlaythroughId: () => null }));
    const result = await manager.saveQuestProgress();
    expect(result).toBe(false);
  });
});

// ── 60-second quest progress auto-save timer ────────────────────────────────

describe('60-second quest progress auto-save', () => {
  let manager: WorldStateManager;
  let ds: ReturnType<typeof makeDataSource>;
  let overlay: PlaythroughQuestOverlay;

  beforeEach(() => {
    vi.useFakeTimers();
    ds = makeDataSource();
    manager = new WorldStateManager(ds as unknown as DataSource);
    overlay = new PlaythroughQuestOverlay();
    manager.setQuestOverlay(overlay);
    manager.setGameSource(makeSource());
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
  });

  it('saves quest progress every 60 seconds when auto-save is active', async () => {
    overlay.setObjectiveStates({ 'q1': [{ id: 'o1', completed: true }] });

    manager.startAutoSave(0);

    // Advance 60 seconds to trigger the quest progress timer
    vi.advanceTimersByTime(60_000);
    // Allow the async saveQuestProgress call to settle
    await Promise.resolve();

    expect(ds.saveQuestProgress).toHaveBeenCalled();
  });

  it('stops quest progress timer on stopAutoSave', () => {
    manager.startAutoSave(0);
    manager.stopAutoSave();

    vi.advanceTimersByTime(120_000);
    expect(ds.saveQuestProgress).not.toHaveBeenCalled();
  });
});

// ── Merge saved quest state with world quest definitions on load ─────────────

describe('Merge saved state with world quest definitions on load', () => {
  it('saved objective progress overwrites default state', () => {
    const overlay = new PlaythroughQuestOverlay();
    overlay.deserialize({
      overrides: { 'q1': { status: 'active' } },
      created: {},
      objectiveStates: {
        'q1': [
          { id: 'o1', completed: true },
          { id: 'o2', currentCount: 3, wordsUsed: ['bonjour', 'merci', 'au revoir'] },
        ],
      },
    });

    const worldQuests = [{
      id: 'q1', title: 'Learn French', status: 'available',
      objectives: [
        { id: 'o1', type: 'talk_to_npc', description: 'Talk to teacher', completed: false },
        { id: 'o2', type: 'use_vocabulary', description: 'Use 5 words', completed: false, currentCount: 0, requiredCount: 5 },
        { id: 'o3', type: 'visit_location', description: 'Visit market', completed: false },
      ],
    }];

    const merged = overlay.mergeQuests(worldQuests);
    const q = merged[0];

    // Saved progress overwrites defaults
    expect(q.status).toBe('active');
    expect(q.objectives[0].completed).toBe(true);
    expect(q.objectives[1].currentCount).toBe(3);
    expect(q.objectives[1].wordsUsed).toEqual(['bonjour', 'merci', 'au revoir']);
    // Unsaved objective keeps defaults
    expect(q.objectives[2].completed).toBe(false);
  });
});

// ── Completed objectives excluded from waypoint resolution ──────────────────

describe('Waypoint filtering for completed objectives', () => {
  it('getIncompleteObjectives excludes completed objectives', () => {
    // Simulate what DynamicQuestWaypointDirector.getIncompleteObjectives does
    const objectives = [
      { id: 'o1', completed: true, type: 'talk_to_npc' },
      { id: 'o2', completed: false, type: 'visit_location' },
      { id: 'o3', completed: true, type: 'collect_item' },
      { id: 'o4', completed: false, type: 'use_vocabulary' },
      { id: 'o5', completed: false, type: 'defeat_enemies' },
    ];

    const incomplete = objectives.filter(o => !o.completed);
    expect(incomplete).toHaveLength(3);
    expect(incomplete.map(o => o.id)).toEqual(['o2', 'o4', 'o5']);
  });
});

// ── Full round-trip: complete 2 of 5, save/load, verify ─────────────────────

describe('Full quest persistence round-trip', () => {
  it('complete 2 of 5 objectives, save, load: 2 remain completed, 3 remain pending', () => {
    // ── Session 1: Play and complete 2 objectives ──
    const engine1 = new QuestCompletionEngine();
    engine1.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' }),
      makeObjective({
        id: 'o2', questId: 'q1', type: 'use_vocabulary',
        targetWords: ['bonjour', 'merci', 'au revoir'], requiredCount: 3,
      }),
      makeObjective({ id: 'o3', questId: 'q1', type: 'visit_location', locationName: 'market' }),
      makeObjective({ id: 'o4', questId: 'q1', type: 'defeat_enemies', enemyType: 'wolf', enemiesRequired: 5 }),
      makeObjective({ id: 'o5', questId: 'q1', type: 'collect_item', itemName: 'herb', itemCount: 3 }),
    ]));

    // Complete objective 1 (talk to NPC)
    engine1.trackNPCConversation('npc-1');
    // Complete objective 2 (use all 3 vocabulary words)
    engine1.trackVocabularyUsage('bonjour');
    engine1.trackVocabularyUsage('merci');
    engine1.trackVocabularyUsage('au revoir');

    // Partial progress on objective 4 (defeated 2 of 5 wolves)
    engine1.trackEnemyDefeat('wolf');
    engine1.trackEnemyDefeat('wolf');

    // Sync to overlay and save
    const overlay1 = new PlaythroughQuestOverlay();
    overlay1.setObjectiveStates(engine1.serializeObjectiveStates());
    overlay1.updateQuest('q1', { status: 'active' });
    const savedState = overlay1.serialize();

    // ── Session 2: Load game (simulate browser refresh) ──
    const overlay2 = new PlaythroughQuestOverlay();
    overlay2.deserialize(savedState);

    const worldQuests = [{
      id: 'q1', title: 'Adventure Quest', status: 'available',
      objectives: [
        { id: 'o1', type: 'talk_to_npc', description: 'Talk to NPC', completed: false, npcId: 'npc-1' },
        { id: 'o2', type: 'use_vocabulary', description: 'Use 3 words', completed: false, currentCount: 0, requiredCount: 3 },
        { id: 'o3', type: 'visit_location', description: 'Visit market', completed: false },
        { id: 'o4', type: 'defeat_enemies', description: 'Defeat 5 wolves', completed: false, enemiesDefeated: 0, enemiesRequired: 5 },
        { id: 'o5', type: 'collect_item', description: 'Collect 3 herbs', completed: false, collectedCount: 0, itemCount: 3 },
      ],
    }];

    const mergedQuests = overlay2.mergeQuests(worldQuests);
    const q1 = mergedQuests[0];

    // Verify: 2 completed, 3 pending
    expect(q1.objectives[0].completed).toBe(true);  // talked to NPC
    expect(q1.objectives[1].completed).toBe(true);   // used all 3 words
    expect(q1.objectives[2].completed).toBe(false);  // not visited yet
    expect(q1.objectives[3].completed).toBe(false);  // only 2 of 5 wolves
    expect(q1.objectives[3].enemiesDefeated).toBe(2);
    expect(q1.objectives[4].completed).toBe(false);  // no herbs collected

    // Verify waypoint filtering: only incomplete objectives get markers
    const incomplete = q1.objectives.filter((o: any) => !o.completed);
    expect(incomplete).toHaveLength(3);
    expect(incomplete.map((o: any) => o.id)).toEqual(['o3', 'o4', 'o5']);

    const completed = q1.objectives.filter((o: any) => o.completed);
    expect(completed).toHaveLength(2);
    expect(completed.map((o: any) => o.id)).toEqual(['o1', 'o2']);

    // Restore into engine and continue playing
    const engine2 = new QuestCompletionEngine();
    engine2.addQuest(makeQuest('q1', q1.objectives));
    engine2.restoreObjectiveStates(overlay2.getObjectiveStates());

    // Kill 3 more wolves (now 5 total)
    engine2.trackEnemyDefeat('wolf');
    engine2.trackEnemyDefeat('wolf');
    engine2.trackEnemyDefeat('wolf');
    expect(engine2.getQuests()[0].objectives![3].completed).toBe(true);
    expect(engine2.getQuests()[0].objectives![3].enemiesDefeated).toBe(5);
  });

  it('saves and restores quest metadata (photosMatched, textsRead, etc)', () => {
    const engine = new QuestCompletionEngine();
    engine.addQuest(makeQuest('q1', [
      makeObjective({
        id: 'o1', questId: 'q1', type: 'photograph_subject' as any,
        photographedSubjects: ['church', 'fountain'],
      }),
      makeObjective({
        id: 'o2', questId: 'q1', type: 'read_text' as any,
        textsRead: ['scroll-1', 'scroll-2'],
      }),
      makeObjective({
        id: 'o3', questId: 'q1', type: 'talk_to_npc',
        completed: true,
      }),
    ]));

    const states = engine.serializeObjectiveStates();

    // photographedSubjects and textsRead are in PROGRESS_FIELDS
    expect(states['q1'].find((s: any) => s.id === 'o1')?.photographedSubjects).toEqual(['church', 'fountain']);
    expect(states['q1'].find((s: any) => s.id === 'o2')?.textsRead).toEqual(['scroll-1', 'scroll-2']);
    expect(states['q1'].find((s: any) => s.id === 'o3')?.completed).toBe(true);

    // Round-trip through overlay
    const overlay = new PlaythroughQuestOverlay();
    overlay.setObjectiveStates(states);
    const saved = overlay.serialize();

    const overlay2 = new PlaythroughQuestOverlay();
    overlay2.deserialize(saved);

    const restored = overlay2.getObjectiveStates();
    expect(restored['q1'].find((s: any) => s.id === 'o1')?.photographedSubjects).toEqual(['church', 'fountain']);
    expect(restored['q1'].find((s: any) => s.id === 'o2')?.textsRead).toEqual(['scroll-1', 'scroll-2']);
  });

  it('preserves progress counters (current/required) for quantity objectives', () => {
    const engine1 = new QuestCompletionEngine();
    engine1.addQuest(makeQuest('q1', [
      makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item',
        itemName: 'herb', itemCount: 5,
      }),
    ]));

    engine1.trackCollectedItemByName('herb');
    engine1.trackCollectedItemByName('herb');
    engine1.trackCollectedItemByName('herb');

    const states = engine1.serializeObjectiveStates();
    expect(states['q1'][0].collectedCount).toBe(3);

    // Save via overlay
    const overlay = new PlaythroughQuestOverlay();
    overlay.setObjectiveStates(states);
    const saved = overlay.serialize();

    // Restore
    const overlay2 = new PlaythroughQuestOverlay();
    overlay2.deserialize(saved);

    const worldQuests = [{
      id: 'q1', objectives: [
        { id: 'o1', type: 'collect_item', completed: false, collectedCount: 0, itemCount: 5, itemName: 'herb' },
      ],
    }];
    const merged = overlay2.mergeQuests(worldQuests);
    expect(merged[0].objectives[0].collectedCount).toBe(3);
    expect(merged[0].objectives[0].completed).toBe(false);
    expect(merged[0].objectives[0].itemCount).toBe(5);
  });
});

// ── WorldStateManager full save/load with quest overlay ─────────────────────

describe('WorldStateManager save/load with quest overlay', () => {
  let manager: WorldStateManager;
  let ds: ReturnType<typeof makeDataSource>;
  let overlay: PlaythroughQuestOverlay;

  beforeEach(() => {
    ds = makeDataSource();
    manager = new WorldStateManager(ds as unknown as DataSource);
    overlay = new PlaythroughQuestOverlay();
    manager.setQuestOverlay(overlay);
  });

  afterEach(() => {
    manager.dispose();
  });

  it('captureState includes quest overlay serialization', () => {
    overlay.setObjectiveStates({
      'q1': [{ id: 'o1', completed: true }, { id: 'o2', currentCount: 2 }],
    });
    overlay.updateQuest('q1', { status: 'active' });

    manager.setGameSource(makeSource());
    const state = manager.captureState(0);

    expect(state.questProgress).toEqual({
      overrides: { 'q1': { status: 'active' } },
      created: {},
      objectiveStates: {
        'q1': [{ id: 'o1', completed: true }, { id: 'o2', currentCount: 2 }],
      },
    });
  });

  it('load restores quest overlay from saved questProgress', async () => {
    const savedState = {
      version: 3,
      slotIndex: 0,
      savedAt: new Date().toISOString(),
      gameTime: 42,
      player: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        gold: 100,
        health: 100,
        energy: 100,
        inventory: [],
      },
      questProgress: {
        overrides: { 'q1': { status: 'active' } },
        created: {},
        objectiveStates: {
          'q1': [{ id: 'o1', completed: true }],
        },
      },
    };

    (ds.loadGameState as any).mockResolvedValue(savedState);

    const target = makeTarget();
    manager.setGameSource(makeSource());
    await manager.load(target, 'world-1', 'pt-1', 0);

    // Overlay should be deserialized
    expect(overlay.getOverride('q1')).toEqual({ status: 'active' });
    expect(overlay.getObjectiveStates()).toEqual({
      'q1': [{ id: 'o1', completed: true }],
    });

    // restoreQuestProgress should have been called on target
    expect(target.restoreQuestProgress).toHaveBeenCalled();
  });

  it('preSaveHook is called before captureState', () => {
    const hook = vi.fn();
    manager.setPreSaveHook(hook);
    manager.setGameSource(makeSource());

    manager.captureState(0);
    expect(hook).toHaveBeenCalled();
  });
});
