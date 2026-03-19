/**
 * Tests for save slot management: extractSlotPreview, slot preview data,
 * and delete slot functionality.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorldStateManager } from '../WorldStateManager';
import type { GameSaveState } from '@shared/game-engine/types';

function makeSaveState(overrides: Partial<GameSaveState> = {}): GameSaveState {
  return {
    version: 2,
    slotIndex: 0,
    savedAt: '2026-03-19T12:00:00Z',
    gameTime: 3600,
    player: {
      position: { x: 10, y: 0, z: 20 },
      rotation: { x: 0, y: 1.5, z: 0 },
      gold: 100,
      health: 80,
      energy: 60,
      inventory: [
        { id: 'sword-1', name: 'Iron Sword', quantity: 1 },
        { id: 'potion-1', name: 'Health Potion', quantity: 3 },
      ],
    },
    npcs: [],
    relationships: {},
    romance: null,
    merchants: [],
    currentZone: { id: 'zone-1', name: 'Town Square', type: 'settlement' },
    questProgress: {
      'quest-1': { status: 'active' },
      'quest-2': { status: 'completed' },
    },
    ...overrides,
  } as GameSaveState;
}

// --- extractSlotPreview ---

describe('WorldStateManager.extractSlotPreview', () => {
  it('should extract basic metadata', () => {
    const state = makeSaveState();
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.slotIndex).toBe(0);
    expect(preview.savedAt).toBe('2026-03-19T12:00:00Z');
    expect(preview.gameTime).toBe(3600);
  });

  it('should extract player stats', () => {
    const state = makeSaveState();
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.playerGold).toBe(100);
    expect(preview.playerHealth).toBe(80);
    expect(preview.playerEnergy).toBe(60);
  });

  it('should extract inventory count', () => {
    const state = makeSaveState();
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.inventoryCount).toBe(2);
  });

  it('should extract quest count', () => {
    const state = makeSaveState();
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.questCount).toBe(2);
  });

  it('should extract zone name', () => {
    const state = makeSaveState();
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.zoneName).toBe('Town Square');
  });

  it('should handle null currentZone', () => {
    const state = makeSaveState({ currentZone: null });
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.zoneName).toBeUndefined();
  });

  it('should extract player level from gamification', () => {
    const state = makeSaveState({ gamification: { level: 5, xp: 1200 } });
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.playerLevel).toBe(5);
  });

  it('should handle missing gamification', () => {
    const state = makeSaveState();
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.playerLevel).toBeUndefined();
  });

  it('should handle empty quest progress', () => {
    const state = makeSaveState({ questProgress: {} });
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.questCount).toBe(0);
  });

  it('should handle empty inventory', () => {
    const state = makeSaveState({
      player: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        gold: 0,
        health: 100,
        energy: 100,
        inventory: [],
      },
    });
    const preview = WorldStateManager.extractSlotPreview(state);

    expect(preview.inventoryCount).toBe(0);
  });
});

// --- listSaveSlots ---

describe('WorldStateManager.listSaveSlots', () => {
  it('should return rich preview data for occupied slots', async () => {
    const mockDataSource = {
      loadGameState: vi.fn().mockImplementation((_w: string, _p: string, slotIndex: number) => {
        if (slotIndex === 0) return Promise.resolve(makeSaveState({ slotIndex: 0 }));
        if (slotIndex === 1) return Promise.resolve(makeSaveState({ slotIndex: 1, gameTime: 7200 }));
        return Promise.resolve(null);
      }),
    } as any;

    const manager = new WorldStateManager(mockDataSource);
    const slots = await manager.listSaveSlots('world-1', 'pt-1');

    expect(slots).toHaveLength(3);
    expect(slots[0]).not.toBeNull();
    expect(slots[0]!.slotIndex).toBe(0);
    expect(slots[0]!.playerGold).toBe(100);
    expect(slots[0]!.inventoryCount).toBe(2);
    expect(slots[0]!.questCount).toBe(2);
    expect(slots[0]!.zoneName).toBe('Town Square');

    expect(slots[1]).not.toBeNull();
    expect(slots[1]!.gameTime).toBe(7200);

    expect(slots[2]).toBeNull();
  });

  it('should return all nulls when no saves exist', async () => {
    const mockDataSource = {
      loadGameState: vi.fn().mockResolvedValue(null),
    } as any;

    const manager = new WorldStateManager(mockDataSource);
    const slots = await manager.listSaveSlots('world-1', 'pt-1');

    expect(slots).toEqual([null, null, null]);
    expect(mockDataSource.loadGameState).toHaveBeenCalledTimes(3);
  });
});

// --- deleteSlot ---

describe('WorldStateManager.deleteSlot', () => {
  it('should call dataSource.deleteGameState and return true on success', async () => {
    const mockDataSource = {
      deleteGameState: vi.fn().mockResolvedValue(undefined),
    } as any;

    const manager = new WorldStateManager(mockDataSource);
    const result = await manager.deleteSlot('world-1', 'pt-1', 1);

    expect(result).toBe(true);
    expect(mockDataSource.deleteGameState).toHaveBeenCalledWith('world-1', 'pt-1', 1);
  });

  it('should return false when deleteGameState throws', async () => {
    const mockDataSource = {
      deleteGameState: vi.fn().mockRejectedValue(new Error('Network error')),
    } as any;

    const manager = new WorldStateManager(mockDataSource);
    const result = await manager.deleteSlot('world-1', 'pt-1', 2);

    expect(result).toBe(false);
  });
});
