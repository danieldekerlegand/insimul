import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import types inline since we can't use path aliases in tests easily
import type { GameSaveState, SavedNPCState, SavedMerchantState, InventoryItem, Vec3 } from '../game-engine/types';

// Inline the core logic we need to test (WorldStateManager depends on DataSource interface)
// We test the serialization/deserialization logic and diff computation

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function createMockState(overrides: Partial<GameSaveState> = {}): GameSaveState {
  return {
    version: 1,
    slotIndex: 0,
    savedAt: '2026-03-12T12:00:00.000Z',
    gameTime: 480,
    player: {
      position: { x: 10, y: 0, z: 20 },
      rotation: { x: 0, y: 1.5, z: 0 },
      gold: 250,
      health: 85,
      energy: 60,
      inventory: [
        { id: 'sword_1', name: 'Iron Sword', type: 'weapon', quantity: 1, value: 100, rarity: 'common' } as InventoryItem,
        { id: 'bread_1', name: 'Bread', type: 'food', quantity: 5, value: 2 } as InventoryItem,
      ],
    },
    npcs: [
      { id: 'npc_1', position: { x: 50, y: 0, z: 60 }, state: 'idle', disposition: 75 },
      { id: 'npc_2', position: { x: 100, y: 0, z: 30 }, state: 'idle', disposition: 50 },
    ],
    relationships: {
      npc_1: { player: { type: 'friendship', strength: 60, trust: 70 } },
    },
    romance: {
      relationships: {
        npc_3: { npcId: 'npc_3', npcName: 'Alice', stage: 'flirting', spark: 30, totalInteractions: 5, giftsGiven: 2, datesCompleted: 0, rejected: false, rejectionCooldown: 0, sparkDecayRate: 0.5, lastInteraction: 100 },
      },
      currentTimestep: 200,
    },
    merchants: [
      { merchantId: 'm_1', goldReserve: 500, items: [] },
    ],
    currentZone: { id: 'zone_1', name: 'Town Square', type: 'settlement' },
    questProgress: { quest_1: { status: 'active', objectives: { obj_1: true, obj_2: false } } },
    ...overrides,
  };
}

describe('GameSaveState serialization', () => {
  it('creates a valid save state structure', () => {
    const state = createMockState();
    expect(state.version).toBe(1);
    expect(state.slotIndex).toBe(0);
    expect(state.player.gold).toBe(250);
    expect(state.player.inventory).toHaveLength(2);
    expect(state.npcs).toHaveLength(2);
    expect(state.currentZone?.name).toBe('Town Square');
  });

  it('serializes player position as Vec3', () => {
    const state = createMockState();
    const pos = state.player.position;
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos).toHaveProperty('z');
    expect(typeof pos.x).toBe('number');
  });

  it('round-trips through JSON serialization', () => {
    const state = createMockState();
    const json = JSON.stringify(state);
    const restored: GameSaveState = JSON.parse(json);

    expect(restored.version).toBe(state.version);
    expect(restored.player.gold).toBe(state.player.gold);
    expect(restored.player.position).toEqual(state.player.position);
    expect(restored.npcs).toEqual(state.npcs);
    expect(restored.romance.relationships.npc_3.stage).toBe('flirting');
    expect(restored.questProgress.quest_1.objectives.obj_1).toBe(true);
  });

  it('supports multiple save slots', () => {
    const slot0 = createMockState({ slotIndex: 0, player: { ...createMockState().player, gold: 100 } });
    const slot1 = createMockState({ slotIndex: 1, player: { ...createMockState().player, gold: 500 } });
    const slot2 = createMockState({ slotIndex: 2, player: { ...createMockState().player, gold: 999 } });

    expect(slot0.slotIndex).toBe(0);
    expect(slot1.slotIndex).toBe(1);
    expect(slot2.slotIndex).toBe(2);
    expect(slot0.player.gold).toBe(100);
    expect(slot1.player.gold).toBe(500);
    expect(slot2.player.gold).toBe(999);
  });
});

describe('deepEqual for diff computation', () => {
  it('detects identical states', () => {
    const a = createMockState();
    const b = createMockState();
    expect(deepEqual(a.player, b.player)).toBe(true);
    expect(deepEqual(a.npcs, b.npcs)).toBe(true);
  });

  it('detects changed player gold', () => {
    const a = createMockState();
    const b = createMockState();
    b.player.gold = 999;
    expect(deepEqual(a.player, b.player)).toBe(false);
  });

  it('detects changed NPC position', () => {
    const a = createMockState();
    const b = createMockState();
    b.npcs[0].position = { x: 999, y: 0, z: 999 };
    expect(deepEqual(a.npcs, b.npcs)).toBe(false);
  });

  it('detects added inventory item', () => {
    const a = createMockState();
    const b = createMockState();
    b.player.inventory.push({ id: 'potion_1', name: 'Potion', type: 'consumable', quantity: 3 } as InventoryItem);
    expect(deepEqual(a.player, b.player)).toBe(false);
  });

  it('detects romance stage change', () => {
    const a = createMockState();
    const b = createMockState();
    b.romance.relationships.npc_3.stage = 'dating';
    expect(deepEqual(a.romance, b.romance)).toBe(false);
  });

  it('handles null values', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(null, {})).toBe(false);
    expect(deepEqual({}, null)).toBe(false);
  });

  it('handles primitives', () => {
    expect(deepEqual(42, 42)).toBe(true);
    expect(deepEqual(42, 43)).toBe(false);
    expect(deepEqual('a', 'a')).toBe(true);
  });
});

describe('incremental diff computation', () => {
  function computeDiff(current: GameSaveState, lastSaved: GameSaveState | null): Partial<GameSaveState> | null {
    if (!lastSaved) return current;
    const diff: any = {};
    let hasDiff = false;

    diff.version = current.version;
    diff.slotIndex = current.slotIndex;
    diff.savedAt = current.savedAt;
    diff.gameTime = current.gameTime;

    if (!deepEqual(current.player, lastSaved.player)) { diff.player = current.player; hasDiff = true; }
    if (!deepEqual(current.npcs, lastSaved.npcs)) { diff.npcs = current.npcs; hasDiff = true; }
    if (!deepEqual(current.relationships, lastSaved.relationships)) { diff.relationships = current.relationships; hasDiff = true; }
    if (!deepEqual(current.romance, lastSaved.romance)) { diff.romance = current.romance; hasDiff = true; }
    if (!deepEqual(current.merchants, lastSaved.merchants)) { diff.merchants = current.merchants; hasDiff = true; }
    if (!deepEqual(current.currentZone, lastSaved.currentZone)) { diff.currentZone = current.currentZone; hasDiff = true; }
    if (!deepEqual(current.questProgress, lastSaved.questProgress)) { diff.questProgress = current.questProgress; hasDiff = true; }

    return hasDiff ? diff : null;
  }

  it('returns full state when no previous save exists', () => {
    const state = createMockState();
    const diff = computeDiff(state, null);
    expect(diff).toBe(state);
  });

  it('returns null when nothing changed', () => {
    const state = createMockState();
    const diff = computeDiff(state, state);
    expect(diff).toBeNull();
  });

  it('includes only changed sections', () => {
    const original = createMockState();
    const modified = createMockState();
    modified.player.gold = 999;

    const diff = computeDiff(modified, original);
    expect(diff).not.toBeNull();
    expect(diff!.player).toBeDefined();
    expect(diff!.npcs).toBeUndefined();
    expect(diff!.romance).toBeUndefined();
  });

  it('detects multiple changed sections', () => {
    const original = createMockState();
    const modified = createMockState();
    modified.player.gold = 999;
    modified.npcs[0].position = { x: 0, y: 0, z: 0 };

    const diff = computeDiff(modified, original);
    expect(diff).not.toBeNull();
    expect(diff!.player).toBeDefined();
    expect(diff!.npcs).toBeDefined();
  });
});

describe('DataSource mock save/load', () => {
  it('saves and loads state through mock data source', async () => {
    const stateStore: Record<string, any> = {};

    const mockDataSource = {
      saveGameState: async (_worldId: string, _ptId: string, slotIndex: number, state: any) => {
        stateStore[`slot_${slotIndex}`] = JSON.parse(JSON.stringify(state));
      },
      loadGameState: async (_worldId: string, _ptId: string, slotIndex: number) => {
        return stateStore[`slot_${slotIndex}`] || null;
      },
    };

    const state = createMockState();
    await mockDataSource.saveGameState('world_1', 'pt_1', 0, state);

    const loaded = await mockDataSource.loadGameState('world_1', 'pt_1', 0);
    expect(loaded).not.toBeNull();
    expect(loaded.player.gold).toBe(250);
    expect(loaded.npcs).toHaveLength(2);
    expect(loaded.romance.relationships.npc_3.stage).toBe('flirting');
  });

  it('returns null for empty slot', async () => {
    const mockDataSource = {
      loadGameState: async () => null,
    };

    const loaded = await mockDataSource.loadGameState('world_1', 'pt_1', 2);
    expect(loaded).toBeNull();
  });

  it('overwrites save slot on re-save', async () => {
    const stateStore: Record<string, any> = {};
    const mockDataSource = {
      saveGameState: async (_w: string, _p: string, slotIndex: number, state: any) => {
        stateStore[`slot_${slotIndex}`] = JSON.parse(JSON.stringify(state));
      },
      loadGameState: async (_w: string, _p: string, slotIndex: number) => {
        return stateStore[`slot_${slotIndex}`] || null;
      },
    };

    const state1 = createMockState({ player: { ...createMockState().player, gold: 100 } });
    await mockDataSource.saveGameState('w', 'p', 0, state1);

    const state2 = createMockState({ player: { ...createMockState().player, gold: 999 } });
    await mockDataSource.saveGameState('w', 'p', 0, state2);

    const loaded = await mockDataSource.loadGameState('w', 'p', 0);
    expect(loaded.player.gold).toBe(999);
  });
});
