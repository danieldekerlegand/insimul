import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  WorldStateManager,
  AUTO_SAVE_TRIGGER_EVENTS,
  type GameStateSource,
  type GameStateTarget,
  type SaveStateAuditResult,
} from '../WorldStateManager';
import { GameEventBus } from '../GameEventBus';
import { PlaythroughQuestOverlay } from '../PlaythroughQuestOverlay';
import type { DataSource } from '../DataSource';
import type {
  GameSaveState,
  SavedInteriorState,
  SavedTimeState,
  SavedQuestActiveState,
  SavedLanguageProgressState,
  SavedReputationState,
  SavedRelationshipDelta,
  SavedMainQuestState,
} from '@shared/game-engine/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<GameStateSource> = {}): GameStateSource {
  return {
    getPlayerPosition: () => ({ x: 1, y: 2, z: 3 }),
    getPlayerRotation: () => ({ x: 0, y: 0, z: 0 }),
    getPlayerGold: () => 100,
    getPlayerHealth: () => 80,
    getPlayerEnergy: () => 60,
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

function makeTarget(): GameStateTarget & Record<string, any> {
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
    restoreTemporaryStates: vi.fn(),
    restoreLanguageProgress: vi.fn(),
    restoreGamificationState: vi.fn(),
    restoreVolitionState: vi.fn(),
    restoreUtteranceQuestState: vi.fn(),
    restoreAmbientConversationState: vi.fn(),
    restoreContentGatingState: vi.fn(),
    restoreSkillTreeState: vi.fn(),
    // v3 restorers
    restoreInteriorState: vi.fn(),
    restoreTimeState: vi.fn(),
    restoreQuestActiveState: vi.fn(),
    restoreLanguageProgressDetailed: vi.fn(),
    restoreReputationState: vi.fn(),
    restoreRelationshipDeltas: vi.fn(),
    restoreMainQuestState: vi.fn(),
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
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('WorldStateManager', () => {
  let manager: WorldStateManager;
  let ds: DataSource;

  beforeEach(() => {
    vi.useFakeTimers();
    ds = makeDataSource();
    manager = new WorldStateManager(ds);
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
  });

  // ── captureState ──────────────────────────────────────────────────────────

  describe('captureState', () => {
    it('captures core fields', () => {
      manager.setGameSource(makeSource());
      const state = manager.captureState(0);
      expect(state.version).toBe(3);
      expect(state.slotIndex).toBe(0);
      expect(state.gameTime).toBe(42);
      expect(state.player.gold).toBe(100);
      expect(state.player.health).toBe(80);
      expect(state.player.energy).toBe(60);
      expect(state.player.position).toEqual({ x: 1, y: 2, z: 3 });
    });

    it('captures extended subsystem state when getters are present', () => {
      const tempStates = { char1: [{ stateType: 'angry', intensity: 0.5 }] };
      const gamification = { xp: 500, level: 3 };
      manager.setGameSource(makeSource({
        getTemporaryStates: () => tempStates,
        getGamificationState: () => gamification,
      }));
      const state = manager.captureState(1);
      expect(state.temporaryStates).toEqual(tempStates);
      expect(state.gamification).toEqual(gamification);
    });

    it('leaves subsystem fields undefined when getters are absent', () => {
      manager.setGameSource(makeSource());
      const state = manager.captureState(0);
      expect(state.temporaryStates).toBeUndefined();
      expect(state.languageProgress).toBeUndefined();
      expect(state.volition).toBeUndefined();
    });

    it('records saveTrigger when provided', () => {
      manager.setGameSource(makeSource());
      const state = manager.captureState(0, 'quest_completed');
      expect(state.saveTrigger).toBe('quest_completed');
    });

    it('throws when no game source is registered', () => {
      expect(() => manager.captureState(0)).toThrow('No game source registered');
    });
  });

  // ── save ──────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('saves full state to data source', async () => {
      manager.setGameSource(makeSource());
      const saved = await manager.save(0);
      expect(saved).toBe(true);
      expect(ds.saveGameState).toHaveBeenCalledWith('world-1', 'pt-1', 0, expect.objectContaining({
        version: 3,
        gameTime: 42,
      }));
    });

    it('skips save when nothing changed', async () => {
      manager.setGameSource(makeSource());
      await manager.save(0);
      const saved = await manager.save(0);
      expect(saved).toBe(false);
    });

    it('returns false when no game source', async () => {
      const saved = await manager.save(0);
      expect(saved).toBe(false);
    });

    it('returns false when missing playthroughId', async () => {
      manager.setGameSource(makeSource({ getPlaythroughId: () => null }));
      const saved = await manager.save(0);
      expect(saved).toBe(false);
    });

    it('tracks isSaving flag', async () => {
      manager.setGameSource(makeSource());
      expect(manager.isSaving).toBe(false);
      const promise = manager.save(0);
      // isSaving is true during the async operation
      expect(manager.isSaving).toBe(true);
      await promise;
      expect(manager.isSaving).toBe(false);
    });

    it('includes trigger in saved state', async () => {
      manager.setGameSource(makeSource());
      await manager.save(0, 'quest_completed');
      const savedState = (ds.saveGameState as any).mock.calls[0][3] as GameSaveState;
      expect(savedState.saveTrigger).toBe('quest_completed');
    });
  });

  // ── load & applyState ─────────────────────────────────────────────────────

  describe('load & applyState', () => {
    it('applies core state to target', async () => {
      const savedState: GameSaveState = {
        version: 2,
        slotIndex: 0,
        savedAt: '2026-01-01T00:00:00Z',
        gameTime: 100,
        player: { position: { x: 5, y: 0, z: 5 }, rotation: { x: 0, y: 1, z: 0 }, gold: 200, health: 50, energy: 30, inventory: [] },
        npcs: [],
        relationships: {},
        romance: null,
        merchants: [],
        currentZone: { id: 'z1', name: 'Market', type: 'commercial' },
        questProgress: { q1: { status: 'complete' } },
      };
      (ds.loadGameState as any).mockResolvedValue(savedState);

      const target = makeTarget();
      const loaded = await manager.load(target, 'world-1', 'pt-1', 0);
      expect(loaded).toBe(true);
      expect(target.restorePlayerPosition).toHaveBeenCalledWith({ x: 5, y: 0, z: 5 }, { x: 0, y: 1, z: 0 });
      expect(target.restorePlayerStats).toHaveBeenCalledWith(200, 50, 30);
      expect(target.restoreCurrentZone).toHaveBeenCalledWith({ id: 'z1', name: 'Market', type: 'commercial' });
    });

    it('restores extended subsystem state', async () => {
      const savedState: GameSaveState = {
        version: 2, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 10,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 0, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: null, merchants: [], currentZone: null, questProgress: {},
        temporaryStates: { char1: [{ stateType: 'angry' }] },
        gamification: { xp: 1000 },
        languageProgress: { vocabulary: ['hello'] },
      };
      (ds.loadGameState as any).mockResolvedValue(savedState);

      const target = makeTarget();
      await manager.load(target, 'world-1', 'pt-1', 0);
      expect(target.restoreTemporaryStates).toHaveBeenCalledWith({ char1: [{ stateType: 'angry' }] });
      expect(target.restoreGamificationState).toHaveBeenCalledWith({ xp: 1000 });
      expect(target.restoreLanguageProgress).toHaveBeenCalledWith({ vocabulary: ['hello'] });
    });

    it('returns false when no save data', async () => {
      const target = makeTarget();
      const loaded = await manager.load(target, 'world-1', 'pt-1', 0);
      expect(loaded).toBe(false);
    });
  });

  // ── computeDiff ───────────────────────────────────────────────────────────

  describe('computeDiff', () => {
    it('returns full state when no previous save', () => {
      manager.setGameSource(makeSource());
      const state = manager.captureState(0);
      const diff = manager.computeDiff(state);
      expect(diff).toEqual(state);
    });

    it('returns null when nothing changed', async () => {
      manager.setGameSource(makeSource());
      await manager.save(0);
      const state = manager.captureState(0);
      const diff = manager.computeDiff(state);
      expect(diff).toBeNull();
    });

    it('includes only changed fields in diff', async () => {
      let gold = 100;
      manager.setGameSource(makeSource({ getPlayerGold: () => gold }));
      await manager.save(0);
      gold = 200;
      const state = manager.captureState(0);
      const diff = manager.computeDiff(state)!;
      expect(diff.player).toBeDefined();
      expect(diff.npcs).toBeUndefined();
    });

    it('detects changes in extended subsystem fields', async () => {
      let tempStates: any = { char1: [{ stateType: 'angry' }] };
      manager.setGameSource(makeSource({
        getTemporaryStates: () => tempStates,
      }));
      await manager.save(0);
      tempStates = { char1: [{ stateType: 'happy' }] };
      const state = manager.captureState(0);
      const diff = manager.computeDiff(state)!;
      expect(diff).not.toBeNull();
      expect((diff as any).temporaryStates).toEqual({ char1: [{ stateType: 'happy' }] });
    });
  });

  // ── Auto-save triggers ────────────────────────────────────────────────────

  describe('auto-save triggers', () => {
    it('triggers save on registered game events', async () => {
      manager.setGameSource(makeSource());
      const eventBus = new GameEventBus();
      manager.attachTriggers(eventBus);

      eventBus.emit({ type: 'quest_completed', questId: 'q1' });

      // Advance past debounce period
      vi.advanceTimersByTime(5_000);
      // Flush the async save promise
      await Promise.resolve();
      await Promise.resolve();

      expect(ds.saveGameState).toHaveBeenCalled();
    });

    it('debounces rapid events into single save', async () => {
      manager.setGameSource(makeSource());
      const eventBus = new GameEventBus();
      manager.attachTriggers(eventBus);

      // Fire multiple events rapidly
      eventBus.emit({ type: 'quest_completed', questId: 'q1' });
      eventBus.emit({ type: 'achievement_unlocked', achievementId: 'a1', achievementName: 'First', description: '', icon: '' });
      eventBus.emit({ type: 'settlement_entered', settlementId: 's1', settlementName: 'Town' });

      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
      await Promise.resolve();

      // Only one save despite 3 events
      expect(ds.saveGameState).toHaveBeenCalledTimes(1);
    });

    it('fires HUD callbacks on auto-save', async () => {
      const onStart = vi.fn();
      const onEnd = vi.fn();
      manager.setGameSource(makeSource());
      manager.setAutoSaveCallbacks(onStart, onEnd);
      manager.startAutoSave(0);

      // Trigger interval auto-save
      vi.advanceTimersByTime(5 * 60 * 1000);
      await Promise.resolve();
      await Promise.resolve();

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onEnd).toHaveBeenCalledWith(true);
    });

    it('detaches triggers on stopAutoSave', () => {
      manager.setGameSource(makeSource());
      const eventBus = new GameEventBus();
      manager.startAutoSave(0);
      manager.attachTriggers(eventBus);
      manager.stopAutoSave();

      eventBus.emit({ type: 'quest_completed', questId: 'q1' });
      vi.advanceTimersByTime(10_000);

      expect(ds.saveGameState).not.toHaveBeenCalled();
    });

    it('registers all expected trigger events', () => {
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('quest_accepted');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('quest_completed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('quest_failed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('quest_abandoned');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('assessment_completed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('settlement_entered');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('achievement_unlocked');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('romance_stage_changed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('npc_exam_completed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('onboarding_completed');
    });

    it('triggers save on quest_accepted event', async () => {
      manager.setGameSource(makeSource());
      const eventBus = new GameEventBus();
      manager.attachTriggers(eventBus);

      eventBus.emit({ type: 'quest_accepted', questId: 'q1', questTitle: 'Test' });
      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
      await Promise.resolve();

      expect(ds.saveGameState).toHaveBeenCalled();
    });
  });

  // ── Save state audit ──────────────────────────────────────────────────────

  describe('auditSaveState', () => {
    it('reports complete state when all subsystems present', () => {
      const state: GameSaveState = {
        version: 3, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 42,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 100, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: {}, merchants: [], currentZone: { id: 'z1', name: 'Market', type: 'commercial' }, questProgress: {},
        temporaryStates: {}, languageProgress: {}, gamification: {}, volition: {},
        utteranceQuests: {}, ambientConversations: {}, contentGating: {}, skillTree: {},
        interiorState: { buildingId: 'b1', buildingName: 'Bakery', buildingType: 'bakery', layoutSeed: 1 },
        timeState: { gameHour: 12, gameMinute: 0, dayNumber: 1, timeScale: 1, isPaused: false },
        questActiveState: { quests: {} }, languageProgressDetailed: { targetLanguage: 'fr', overallFluency: 0, vocabularyMastery: {}, grammarAccuracy: {}, conversationCount: 0, cefrLevel: 'A1', xp: 0, level: 1, streakDays: 0, totalWordsLearned: 0 },
        reputationState: { entries: [] }, relationshipDeltas: [],
        mainQuestState: { currentChapterIndex: 0, chaptersCompleted: [], objectiveProgress: {} },
      };

      const audit = manager.auditSaveState(state);
      expect(audit.complete).toBe(true);
      expect(audit.missing).toHaveLength(0);
      expect(audit.present).toHaveLength(22);
    });

    it('reports missing subsystems', () => {
      const state: GameSaveState = {
        version: 1, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 42,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 100, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: null, merchants: [], currentZone: null, questProgress: {},
      };

      const audit = manager.auditSaveState(state);
      expect(audit.complete).toBe(false);
      expect(audit.missing).toContain('temporaryStates');
      expect(audit.missing).toContain('languageProgress');
      expect(audit.missing).toContain('gamification');
      expect(audit.missing).toContain('volition');
      expect(audit.missing).toContain('utteranceQuests');
      expect(audit.missing).toContain('ambientConversations');
      expect(audit.missing).toContain('contentGating');
      expect(audit.missing).toContain('skillTree');
      // v3 subsystems missing
      expect(audit.missing).toContain('interiorState');
      expect(audit.missing).toContain('timeState');
      expect(audit.missing).toContain('questActiveState');
      expect(audit.missing).toContain('languageProgressDetailed');
      expect(audit.missing).toContain('reputationState');
      expect(audit.missing).toContain('relationshipDeltas');
      expect(audit.missing).toContain('mainQuestState');
      // romance=null and currentZone=null count as missing
      expect(audit.missing).toContain('romance');
      expect(audit.missing).toContain('currentZone');
      expect(audit.present).toContain('player');
      expect(audit.present).toContain('npcs');
    });

    it('includes timestamp in audit result', () => {
      const state: GameSaveState = {
        version: 2, slotIndex: 0, savedAt: '2026-03-18T10:00:00Z', gameTime: 1,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 0, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: null, merchants: [], currentZone: null, questProgress: {},
      };
      const audit = manager.auditSaveState(state);
      expect(audit.timestamp).toBe('2026-03-18T10:00:00Z');
    });
  });

  describe('auditCurrentState', () => {
    it('audits the live game state', () => {
      manager.setGameSource(makeSource({
        getTemporaryStates: () => ({ char1: [] }),
        getGamificationState: () => ({ xp: 100 }),
      }));
      const audit = manager.auditCurrentState();
      expect(audit.present).toContain('temporaryStates');
      expect(audit.present).toContain('gamification');
      expect(audit.missing).toContain('languageProgress');
    });
  });

  // ── Interval auto-save ────────────────────────────────────────────────────

  describe('interval auto-save', () => {
    it('saves every 5 minutes', async () => {
      manager.setGameSource(makeSource());
      manager.startAutoSave(0);

      vi.advanceTimersByTime(5 * 60 * 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(ds.saveGameState).toHaveBeenCalledTimes(1);

      // Change state so next save goes through
      manager.setGameSource(makeSource({ getPlayerGold: () => 200 }));
      vi.advanceTimersByTime(5 * 60 * 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(ds.saveGameState).toHaveBeenCalledTimes(2);
    });
  });

  // ── listSaveSlots ─────────────────────────────────────────────────────────

  describe('listSaveSlots', () => {
    it('returns slot metadata for each slot', async () => {
      (ds.loadGameState as any)
        .mockResolvedValueOnce({ savedAt: '2026-01-01', gameTime: 10 })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ savedAt: '2026-01-02', gameTime: 20 });

      const slots = await manager.listSaveSlots('world-1', 'pt-1');
      expect(slots).toHaveLength(3);
      expect(slots[0]).toEqual({ slotIndex: 0, savedAt: '2026-01-01', gameTime: 10 });
      expect(slots[1]).toBeNull();
      expect(slots[2]).toEqual({ slotIndex: 2, savedAt: '2026-01-02', gameTime: 20 });
    });
  });

  // ── Quest overlay integration ─────────────────────────────────────────────

  describe('quest overlay integration', () => {
    it('captures quest overlay state when overlay is attached', () => {
      const overlay = new PlaythroughQuestOverlay();
      overlay.updateQuest('q1', { status: 'completed' });
      overlay.createQuest({ id: 'dyn-1', title: 'Dynamic', status: 'active' });

      manager.setGameSource(makeSource());
      manager.setQuestOverlay(overlay);

      const state = manager.captureState(0);
      expect(state.questProgress).toEqual({
        overrides: { q1: { status: 'completed' } },
        created: { 'dyn-1': { id: 'dyn-1', title: 'Dynamic', status: 'active' } },
      });
    });

    it('falls back to getQuestProgress when no overlay', () => {
      const progress = { q1: { status: 'done' } };
      manager.setGameSource(makeSource({ getQuestProgress: () => progress }));
      const state = manager.captureState(0);
      expect(state.questProgress).toEqual(progress);
    });

    it('deserializes overlay on load', async () => {
      const overlay = new PlaythroughQuestOverlay();
      manager.setQuestOverlay(overlay);

      const savedState: GameSaveState = {
        version: 2, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 10,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 0, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: null, merchants: [], currentZone: null,
        questProgress: { overrides: { q1: { status: 'completed' } }, created: {} },
      };
      (ds.loadGameState as any).mockResolvedValue(savedState);

      const target = makeTarget();
      await manager.load(target, 'world-1', 'pt-1', 0);

      expect(overlay.getOverride('q1')).toEqual({ status: 'completed' });
      expect(target.restoreQuestProgress).toHaveBeenCalled();
    });
  });

  // ── saveQuestProgress ──────────────────────────────────────────────────────

  describe('saveQuestProgress', () => {
    it('saves quest overlay state via dataSource', async () => {
      const overlay = new PlaythroughQuestOverlay();
      overlay.updateQuest('q1', { status: 'active', progress: { step: 2 } });

      manager.setGameSource(makeSource());
      manager.setQuestOverlay(overlay);

      const saved = await manager.saveQuestProgress();
      expect(saved).toBe(true);
      expect(ds.saveQuestProgress).toHaveBeenCalledWith('pt-1', {
        overrides: { q1: { status: 'active', progress: { step: 2 } } },
        created: {},
      });
    });

    it('returns false when no overlay', async () => {
      manager.setGameSource(makeSource());
      const saved = await manager.saveQuestProgress();
      expect(saved).toBe(false);
    });

    it('returns false when no playthroughId', async () => {
      manager.setGameSource(makeSource({ getPlaythroughId: () => null }));
      manager.setQuestOverlay(new PlaythroughQuestOverlay());

      const saved = await manager.saveQuestProgress();
      expect(saved).toBe(false);
    });
  });

  // ── dispose ───────────────────────────────────────────────────────────────

  describe('dispose', () => {
    it('cleans up all timers and references', () => {
      manager.setGameSource(makeSource());
      manager.startAutoSave(0);
      manager.dispose();
      expect(manager.isSaving).toBe(false);
    });
  });

  // ── v3 Save Schema ──────────────────────────────────────────────────────────

  describe('v3 save schema', () => {
    const sampleInterior: SavedInteriorState = {
      buildingId: 'b1', buildingName: 'Bakery', buildingType: 'bakery', layoutSeed: 42,
    };
    const sampleTime: SavedTimeState = {
      gameHour: 14, gameMinute: 30, dayNumber: 5, timeScale: 1, isPaused: false,
    };
    const sampleQuestActive: SavedQuestActiveState = {
      quests: {
        q1: { questId: 'q1', status: 'active', objectives: [
          { objectiveId: 'obj1', completed: false, currentCount: 3, targetCount: 5, evidence: ['word1', 'word2', 'word3'] },
        ], conversationTurnCount: 7, currentBranch: 'branch_a' },
      },
      trackedQuestId: 'q1',
    };
    const sampleLangProgress: SavedLanguageProgressState = {
      targetLanguage: 'fr', overallFluency: 35, vocabularyMastery: {
        bonjour: { word: 'bonjour', translation: 'hello', masteryLevel: 4, timesCorrect: 10, timesIncorrect: 2 },
      }, grammarAccuracy: {
        subject_verb: { patternId: 'subject_verb', accuracy: 0.8, attempts: 15 },
      }, conversationCount: 12, cefrLevel: 'A2', xp: 500, level: 3, streakDays: 5, totalWordsLearned: 25,
    };
    const sampleReputation: SavedReputationState = {
      entries: [
        { entityType: 'settlement', entityId: 's1', score: 30, standing: 'friendly', violationCount: 0, isBanned: false, outstandingFines: 0 },
      ],
    };
    const sampleRelDeltas: SavedRelationshipDelta[] = [
      { fromCharacterId: 'player', toCharacterId: 'npc1', type: 'friendship', strength: 0.6, reciprocal: 0.4, lastModified: 100 },
    ];
    const sampleMainQuest: SavedMainQuestState = {
      mainQuestId: 'mq1', currentChapterId: 'ch2', currentChapterIndex: 1,
      chaptersCompleted: ['ch1'],
      objectiveProgress: {
        obj_a: { objectiveId: 'obj_a', completed: true, currentCount: 1, targetCount: 1, evidence: [] },
      },
    };

    it('captures v3 subsystem state', () => {
      manager.setGameSource(makeSource({
        getInteriorState: () => sampleInterior,
        getTimeState: () => sampleTime,
        getQuestActiveState: () => sampleQuestActive,
        getLanguageProgressDetailed: () => sampleLangProgress,
        getReputationState: () => sampleReputation,
        getRelationshipDeltas: () => sampleRelDeltas,
        getMainQuestState: () => sampleMainQuest,
      }));

      const state = manager.captureState(0);
      expect(state.interiorState).toEqual(sampleInterior);
      expect(state.timeState).toEqual(sampleTime);
      expect(state.questActiveState).toEqual(sampleQuestActive);
      expect(state.languageProgressDetailed).toEqual(sampleLangProgress);
      expect(state.reputationState).toEqual(sampleReputation);
      expect(state.relationshipDeltas).toEqual(sampleRelDeltas);
      expect(state.mainQuestState).toEqual(sampleMainQuest);
    });

    it('leaves v3 fields undefined when getters absent', () => {
      manager.setGameSource(makeSource());
      const state = manager.captureState(0);
      expect(state.interiorState).toBeUndefined();
      expect(state.timeState).toBeUndefined();
      expect(state.questActiveState).toBeUndefined();
      expect(state.languageProgressDetailed).toBeUndefined();
      expect(state.reputationState).toBeUndefined();
      expect(state.relationshipDeltas).toBeUndefined();
      expect(state.mainQuestState).toBeUndefined();
    });

    it('restores v3 subsystem state on load', async () => {
      const savedState: GameSaveState = {
        version: 3, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 10,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 0, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: null, merchants: [], currentZone: null, questProgress: {},
        interiorState: sampleInterior,
        timeState: sampleTime,
        questActiveState: sampleQuestActive,
        languageProgressDetailed: sampleLangProgress,
        reputationState: sampleReputation,
        relationshipDeltas: sampleRelDeltas,
        mainQuestState: sampleMainQuest,
      };
      (ds.loadGameState as any).mockResolvedValue(savedState);

      const target = makeTarget();
      await manager.load(target, 'world-1', 'pt-1', 0);
      expect(target.restoreInteriorState).toHaveBeenCalledWith(sampleInterior);
      expect(target.restoreTimeState).toHaveBeenCalledWith(sampleTime);
      expect(target.restoreQuestActiveState).toHaveBeenCalledWith(sampleQuestActive);
      expect(target.restoreLanguageProgressDetailed).toHaveBeenCalledWith(sampleLangProgress);
      expect(target.restoreReputationState).toHaveBeenCalledWith(sampleReputation);
      expect(target.restoreRelationshipDeltas).toHaveBeenCalledWith(sampleRelDeltas);
      expect(target.restoreMainQuestState).toHaveBeenCalledWith(sampleMainQuest);
    });

    it('includes v3 fields in diff computation', async () => {
      let repState = sampleReputation;
      manager.setGameSource(makeSource({
        getReputationState: () => repState,
        getTimeState: () => sampleTime,
      }));
      await manager.save(0);

      repState = { entries: [{ ...sampleReputation.entries[0], score: 50, standing: 'revered' }] };
      const state = manager.captureState(0);
      const diff = manager.computeDiff(state)!;
      expect(diff).not.toBeNull();
      expect((diff as any).reputationState).toEqual(repState);
      // timeState unchanged should not appear in diff
      expect((diff as any).timeState).toBeUndefined();
    });

    it('captures NPC schedule state in v3', () => {
      manager.setGameSource(makeSource({
        getNPCStates: () => [{
          id: 'npc1', position: { x: 10, y: 0, z: 20 }, state: 'idle' as const,
          disposition: 50, currentSchedulePhase: 'working', emotionalState: 'content',
          currentDestination: { x: 15, y: 0, z: 25 }, isInsideBuilding: true,
          insideBuildingId: 'b1', schedulePhaseTimeRemaining: 120,
        }],
      }));
      const state = manager.captureState(0);
      expect(state.npcs[0].isInsideBuilding).toBe(true);
      expect(state.npcs[0].insideBuildingId).toBe('b1');
      expect(state.npcs[0].currentDestination).toEqual({ x: 15, y: 0, z: 25 });
      expect(state.npcs[0].schedulePhaseTimeRemaining).toBe(120);
    });
  });

  // ── v2→v3 Migration ─────────────────────────────────────────────────────────

  describe('v2→v3 migration', () => {
    function makeV2State(overrides: Partial<GameSaveState> = {}): GameSaveState {
      return {
        version: 2, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 50,
        player: { position: { x: 1, y: 0, z: 1 }, rotation: { x: 0, y: 0, z: 0 }, gold: 100, health: 80, energy: 60, inventory: [] },
        npcs: [{ id: 'npc1', position: { x: 5, y: 0, z: 5 }, state: 'idle' as const, disposition: 50 }],
        relationships: {}, romance: null, merchants: [], currentZone: null, questProgress: {},
        ...overrides,
      };
    }

    it('bumps version from 2 to 3', () => {
      const v2 = makeV2State();
      const v3 = WorldStateManager.migrateSaveState(v2);
      expect(v3.version).toBe(3);
    });

    it('preserves all v2 fields', () => {
      const v2 = makeV2State({ temporaryStates: { test: true }, gamification: { xp: 100 } });
      const v3 = WorldStateManager.migrateSaveState(v2);
      expect(v3.player.gold).toBe(100);
      expect(v3.gameTime).toBe(50);
      expect(v3.temporaryStates).toEqual({ test: true });
      expect(v3.gamification).toEqual({ xp: 100 });
    });

    it('adds default timeState derived from gameTime', () => {
      const v2 = makeV2State({ gameTime: 50 });
      const v3 = WorldStateManager.migrateSaveState(v2);
      expect(v3.timeState).toBeDefined();
      expect(v3.timeState!.gameHour).toBe(2); // 50 % 24 = 2
      expect(v3.timeState!.dayNumber).toBe(3); // floor(50/24) + 1 = 3
      expect(v3.timeState!.timeScale).toBe(1);
      expect(v3.timeState!.isPaused).toBe(false);
    });

    it('adds empty default for questActiveState', () => {
      const v3 = WorldStateManager.migrateSaveState(makeV2State());
      expect(v3.questActiveState).toEqual({ quests: {}, trackedQuestId: undefined });
    });

    it('adds empty default for reputationState', () => {
      const v3 = WorldStateManager.migrateSaveState(makeV2State());
      expect(v3.reputationState).toEqual({ entries: [] });
    });

    it('adds empty default for relationshipDeltas', () => {
      const v3 = WorldStateManager.migrateSaveState(makeV2State());
      expect(v3.relationshipDeltas).toEqual([]);
    });

    it('adds default mainQuestState', () => {
      const v3 = WorldStateManager.migrateSaveState(makeV2State());
      expect(v3.mainQuestState).toEqual({
        currentChapterIndex: 0,
        chaptersCompleted: [],
        objectiveProgress: {},
      });
    });

    it('sets interiorState to null by default', () => {
      const v3 = WorldStateManager.migrateSaveState(makeV2State());
      expect(v3.interiorState).toBeNull();
    });

    it('adds isInsideBuilding default to migrated NPCs', () => {
      const v3 = WorldStateManager.migrateSaveState(makeV2State());
      expect(v3.npcs[0].isInsideBuilding).toBe(false);
      expect(v3.npcs[0].schedulePhaseTimeRemaining).toBe(0);
    });

    it('does not re-migrate v3 state', () => {
      const v3: GameSaveState = {
        version: 3, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 10,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 0, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: null, merchants: [], currentZone: null, questProgress: {},
        reputationState: { entries: [{ entityType: 'settlement', entityId: 's1', score: 99, standing: 'revered', violationCount: 0, isBanned: false, outstandingFines: 0 }] },
      };
      const result = WorldStateManager.migrateSaveState(v3);
      expect(result.version).toBe(3);
      // Should preserve existing v3 data, not overwrite with defaults
      expect(result.reputationState!.entries[0].score).toBe(99);
    });

    it('migration works during load', async () => {
      const v2State: GameSaveState = {
        version: 2, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 36,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 50, health: 100, energy: 100, inventory: [] },
        npcs: [{ id: 'npc1', position: { x: 0, y: 0, z: 0 }, state: 'idle' as const, disposition: 50 }],
        relationships: {}, romance: null, merchants: [], currentZone: null, questProgress: {},
      };
      (ds.loadGameState as any).mockResolvedValue(v2State);

      const target = makeTarget();
      await manager.load(target, 'world-1', 'pt-1', 0);

      // v3 restorers should be called with migrated defaults
      expect(target.restoreTimeState).toHaveBeenCalledWith(expect.objectContaining({
        gameHour: 12, // 36 % 24 = 12
        dayNumber: 2, // floor(36/24) + 1 = 2
      }));
      expect(target.restoreReputationState).toHaveBeenCalledWith({ entries: [] });
      expect(target.restoreRelationshipDeltas).toHaveBeenCalledWith([]);
      expect(target.restoreMainQuestState).toHaveBeenCalledWith({
        currentChapterIndex: 0,
        chaptersCompleted: [],
        objectiveProgress: {},
      });
    });
  });
});
