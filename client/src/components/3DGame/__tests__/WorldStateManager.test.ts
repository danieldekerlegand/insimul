/**
 * Tests for WorldStateManager — save/load game slot management.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorldStateManager, type GameStateSource, type GameStateTarget } from '../WorldStateManager';
import type { DataSource } from '../DataSource';

function makeGameStateSource(overrides: Partial<GameStateSource> = {}): GameStateSource {
  return {
    getPlayerPosition: () => ({ x: 10, y: 0, z: 20 }),
    getPlayerRotation: () => ({ x: 0, y: 1.5, z: 0 }),
    getPlayerGold: () => 250,
    getPlayerHealth: () => 80,
    getPlayerEnergy: () => 60,
    getInventoryItems: () => [],
    getNPCStates: () => [],
    getRelationships: () => ({}),
    getRomanceData: () => null,
    getMerchantStates: () => [],
    getCurrentZone: () => ({ id: 'z1', name: 'Village', type: 'settlement' }),
    getQuestProgress: () => ({}),
    getGameTime: () => 3600,
    getWorldId: () => 'world-1',
    getPlaythroughId: () => 'play-1',
    ...overrides,
  };
}

function makeGameStateTarget(): GameStateTarget & { calls: Record<string, any[]> } {
  const calls: Record<string, any[]> = {};
  const track = (name: string) => (...args: any[]) => {
    calls[name] = args;
  };
  return {
    calls,
    restorePlayerPosition: track('restorePlayerPosition'),
    restorePlayerStats: track('restorePlayerStats'),
    restoreInventory: track('restoreInventory'),
    restoreNPCStates: track('restoreNPCStates'),
    restoreRelationships: track('restoreRelationships'),
    restoreRomanceData: track('restoreRomanceData'),
    restoreMerchantStates: track('restoreMerchantStates'),
    restoreCurrentZone: track('restoreCurrentZone'),
    restoreQuestProgress: track('restoreQuestProgress'),
    restoreGameTime: track('restoreGameTime'),
  };
}

function makeDataSource(): DataSource {
  const saves: Record<string, any> = {};
  return {
    saveGameState: vi.fn(async (_wId: string, _pId: string, slot: number, state: any) => {
      saves[`slot_${slot}`] = state;
    }),
    loadGameState: vi.fn(async (_wId: string, _pId: string, slot: number) => {
      return saves[`slot_${slot}`] ?? null;
    }),
  } as unknown as DataSource;
}

describe('WorldStateManager', () => {
  let manager: WorldStateManager;
  let dataSource: DataSource;

  beforeEach(() => {
    vi.useFakeTimers();
    dataSource = makeDataSource();
    manager = new WorldStateManager(dataSource);
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
  });

  describe('captureState', () => {
    it('captures current game state into a serializable object', () => {
      manager.setGameSource(makeGameStateSource());
      const state = manager.captureState(0);

      expect(state.version).toBe(1);
      expect(state.slotIndex).toBe(0);
      expect(state.player.gold).toBe(250);
      expect(state.player.health).toBe(80);
      expect(state.player.position).toEqual({ x: 10, y: 0, z: 20 });
      expect(state.currentZone).toEqual({ id: 'z1', name: 'Village', type: 'settlement' });
      expect(state.gameTime).toBe(3600);
      expect(state.savedAt).toBeTruthy();
    });

    it('throws if no game source is registered', () => {
      expect(() => manager.captureState(0)).toThrow('No game source registered');
    });
  });

  describe('save', () => {
    it('saves game state to the specified slot', async () => {
      manager.setGameSource(makeGameStateSource());
      const result = await manager.save(1);

      expect(result).toBe(true);
      expect(dataSource.saveGameState).toHaveBeenCalledWith(
        'world-1', 'play-1', 1, expect.objectContaining({ slotIndex: 1 })
      );
    });

    it('returns false when no game source is set', async () => {
      const result = await manager.save(0);
      expect(result).toBe(false);
    });

    it('returns false when worldId or playthroughId is missing', async () => {
      manager.setGameSource(makeGameStateSource({
        getWorldId: () => '',
        getPlaythroughId: () => null,
      }));
      const result = await manager.save(0);
      expect(result).toBe(false);
    });

    it('skips save when state has not changed (diff is null)', async () => {
      manager.setGameSource(makeGameStateSource());
      await manager.save(0);

      // Second save with identical state should detect no diff
      const result = await manager.save(0);
      expect(result).toBe(false);
    });
  });

  describe('load', () => {
    it('loads and restores game state from a slot', async () => {
      manager.setGameSource(makeGameStateSource());
      await manager.save(2);

      const target = makeGameStateTarget();
      const result = await manager.load(target, 'world-1', 'play-1', 2);

      expect(result).toBe(true);
      expect(target.calls.restorePlayerPosition).toBeTruthy();
      expect(target.calls.restorePlayerStats).toEqual([250, 80, 60]);
      expect(target.calls.restoreCurrentZone).toEqual([{ id: 'z1', name: 'Village', type: 'settlement' }]);
      expect(target.calls.restoreGameTime).toEqual([3600]);
    });

    it('returns false when slot is empty', async () => {
      const target = makeGameStateTarget();
      const result = await manager.load(target, 'world-1', 'play-1', 0);

      expect(result).toBe(false);
      expect(target.calls.restorePlayerPosition).toBeUndefined();
    });
  });

  describe('listSaveSlots', () => {
    it('returns metadata for populated slots and null for empty ones', async () => {
      let gold = 100;
      manager.setGameSource(makeGameStateSource({ getPlayerGold: () => gold }));
      await manager.save(0);

      // Change state so diff is detected for slot 2
      gold = 200;
      await manager.save(2);

      const slots = await manager.listSaveSlots('world-1', 'play-1');
      expect(slots).toHaveLength(3);
      expect(slots[0]).toMatchObject({ slotIndex: 0, gameTime: 3600 });
      expect(slots[1]).toBeNull();
      expect(slots[2]).toMatchObject({ slotIndex: 2, gameTime: 3600 });
    });
  });

  describe('auto-save', () => {
    it('saves periodically when auto-save is started', async () => {
      manager.setGameSource(makeGameStateSource());
      manager.startAutoSave(0);

      // Advance timers by 5 minutes
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);

      expect(dataSource.saveGameState).toHaveBeenCalled();
    });

    it('stops auto-saving when stopAutoSave is called', async () => {
      manager.setGameSource(makeGameStateSource());
      manager.startAutoSave(0);
      manager.stopAutoSave();

      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

      expect(dataSource.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('computeDiff', () => {
    it('returns full state on first save (no previous state)', () => {
      manager.setGameSource(makeGameStateSource());
      const state = manager.captureState(0);
      const diff = manager.computeDiff(state);

      expect(diff).toEqual(state);
    });

    it('detects changes in player data', async () => {
      let gold = 100;
      manager.setGameSource(makeGameStateSource({ getPlayerGold: () => gold }));
      await manager.save(0);

      gold = 200;
      const state = manager.captureState(0);
      const diff = manager.computeDiff(state);

      expect(diff).not.toBeNull();
      expect(diff!.player).toBeTruthy();
    });
  });

  describe('dispose', () => {
    it('stops auto-save and clears references', () => {
      manager.setGameSource(makeGameStateSource());
      manager.startAutoSave(0);
      manager.dispose();

      // Should not throw
      expect(() => manager.captureState(0)).toThrow();
    });
  });
});
