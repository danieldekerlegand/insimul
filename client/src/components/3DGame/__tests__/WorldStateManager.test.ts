import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  WorldStateManager,
  AUTO_SAVE_TRIGGER_EVENTS,
  type GameStateSource,
  type GameStateTarget,
  type SaveStateAuditResult,
} from '../WorldStateManager';
import { GameEventBus } from '../GameEventBus';
import type { DataSource } from '../DataSource';
import type { GameSaveState } from '@shared/game-engine/types';

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
    transferItem: vi.fn().mockResolvedValue({}),
    getMerchantInventory: vi.fn().mockResolvedValue({}),
    loadPrologContent: vi.fn().mockResolvedValue(null),
    loadWorldItems: vi.fn().mockResolvedValue([]),
    loadGeography: vi.fn().mockResolvedValue(null),
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
      expect(state.version).toBe(2);
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
        version: 2,
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
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('quest_completed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('assessment_completed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('settlement_entered');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('achievement_unlocked');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('romance_stage_changed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('npc_exam_completed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('onboarding_completed');
      expect(AUTO_SAVE_TRIGGER_EVENTS).toContain('quest_failed');
    });
  });

  // ── Save state audit ──────────────────────────────────────────────────────

  describe('auditSaveState', () => {
    it('reports complete state when all subsystems present', () => {
      const state: GameSaveState = {
        version: 2, slotIndex: 0, savedAt: '2026-01-01T00:00:00Z', gameTime: 42,
        player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, gold: 100, health: 100, energy: 100, inventory: [] },
        npcs: [], relationships: {}, romance: {}, merchants: [], currentZone: { id: 'z1', name: 'Market', type: 'commercial' }, questProgress: {},
        temporaryStates: {}, languageProgress: {}, gamification: {}, volition: {},
        utteranceQuests: {}, ambientConversations: {}, contentGating: {}, skillTree: {},
      };

      const audit = manager.auditSaveState(state);
      expect(audit.complete).toBe(true);
      expect(audit.missing).toHaveLength(0);
      expect(audit.present).toHaveLength(15);
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

  // ── dispose ───────────────────────────────────────────────────────────────

  describe('dispose', () => {
    it('cleans up all timers and references', () => {
      manager.setGameSource(makeSource());
      manager.startAutoSave(0);
      manager.dispose();
      expect(manager.isSaving).toBe(false);
    });
  });
});
