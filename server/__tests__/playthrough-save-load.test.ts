/**
 * End-to-end integration tests for the save/load/playthrough system.
 *
 * Uses mongodb-memory-server for isolated MongoDB testing.
 * Tests the full lifecycle: create playthrough → save game state → load game state,
 * plus deltas, traces, and multi-slot save management.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoStorage } from '../db/mongo-storage';

let mongoServer: MongoMemoryServer;
let storage: MongoStorage;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  storage = new MongoStorage(uri);
  await storage.connect();
}, 60000);

afterAll(async () => {
  await storage.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  const collections = ['playthroughs', 'playthroughdeltas', 'playtraces'];
  for (const name of collections) {
    const col = mongoose.connection.collection(name);
    await col.deleteMany({});
  }
});

// ---------- helpers ----------

const USER_A = 'user-a';
const USER_B = 'user-b';
const WORLD_ID = 'world-1';

function makeSaveState(slot: number, overrides: Record<string, any> = {}) {
  return {
    version: 1,
    slotIndex: slot,
    savedAt: new Date().toISOString(),
    gameTime: 3600,
    player: {
      position: { x: 10, y: 0, z: 20 },
      rotation: { x: 0, y: 1.5, z: 0 },
      gold: 100,
      health: 80,
      energy: 60,
      inventory: [{ id: 'sword-1', name: 'Iron Sword', quantity: 1 }],
    },
    npcs: [
      { id: 'npc-1', position: { x: 5, y: 0, z: 5 }, state: 'idle', disposition: 50 },
    ],
    relationships: { 'npc-1': { player: { type: 'friendly', strength: 0.6, trust: 0.5 } } },
    romance: null,
    merchants: [{ merchantId: 'merchant-1', goldReserve: 500, items: [] }],
    currentZone: { id: 'zone-1', name: 'Town Square', type: 'settlement' },
    questProgress: { 'quest-1': { status: 'active', step: 2 } },
    ...overrides,
  };
}

async function createPlaythrough(userId: string, worldId: string, extra: Record<string, any> = {}) {
  return storage.createPlaythrough({
    userId,
    worldId,
    worldSnapshotVersion: 1,
    name: 'Test Playthrough',
    status: 'active',
    ...extra,
  });
}

// ---------- Playthrough CRUD ----------

describe('Playthrough CRUD', () => {
  it('should create a playthrough', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    expect(pt.id).toBeDefined();
    expect(pt.userId).toBe(USER_A);
    expect(pt.worldId).toBe(WORLD_ID);
    expect(pt.status).toBe('active');
    expect(pt.name).toBe('Test Playthrough');
  });

  it('should get a playthrough by id', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    const fetched = await storage.getPlaythrough(pt.id);
    expect(fetched).toBeDefined();
    expect(fetched!.id).toBe(pt.id);
  });

  it('should return undefined for non-existent playthrough', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const fetched = await storage.getPlaythrough(id);
    expect(fetched).toBeUndefined();
  });

  it('should update a playthrough', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    const updated = await storage.updatePlaythrough(pt.id, {
      status: 'paused',
      playtime: 7200,
      actionsCount: 42,
    });
    expect(updated).toBeDefined();
    expect(updated!.status).toBe('paused');
    expect(updated!.playtime).toBe(7200);
    expect(updated!.actionsCount).toBe(42);
  });

  it('should delete a playthrough', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    const deleted = await storage.deletePlaythrough(pt.id);
    expect(deleted).toBe(true);
    const fetched = await storage.getPlaythrough(pt.id);
    expect(fetched).toBeUndefined();
  });

  it('should list playthroughs by user', async () => {
    await createPlaythrough(USER_A, WORLD_ID);
    await createPlaythrough(USER_A, 'world-2');
    await createPlaythrough(USER_B, WORLD_ID);

    const listA = await storage.getPlaythroughsByUser(USER_A);
    expect(listA).toHaveLength(2);
    expect(listA.every(p => p.userId === USER_A)).toBe(true);
  });

  it('should list playthroughs by world', async () => {
    await createPlaythrough(USER_A, WORLD_ID);
    await createPlaythrough(USER_B, WORLD_ID);
    await createPlaythrough(USER_A, 'world-2');

    const list = await storage.getPlaythroughsByWorld(WORLD_ID);
    expect(list).toHaveLength(2);
    expect(list.every(p => p.worldId === WORLD_ID)).toBe(true);
  });

  it('should get active user playthrough for a world', async () => {
    await createPlaythrough(USER_A, WORLD_ID);
    const active = await storage.getUserPlaythroughForWorld(USER_A, WORLD_ID);
    expect(active).toBeDefined();
    expect(active!.userId).toBe(USER_A);
    expect(active!.worldId).toBe(WORLD_ID);
  });

  it('should not return completed playthrough as active', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    await storage.updatePlaythrough(pt.id, { status: 'completed' });
    const active = await storage.getUserPlaythroughForWorld(USER_A, WORLD_ID);
    expect(active).toBeUndefined();
  });
});

// ---------- Save / Load game state ----------

describe('Save and Load game state', () => {
  it('should save state to slot 0 and load it back', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    const state = makeSaveState(0);

    // Save
    const saveData: Record<string, any> = {};
    saveData['slot_0'] = state;
    await storage.updatePlaythrough(pt.id, { saveData });

    // Load
    const loaded = await storage.getPlaythrough(pt.id);
    const loadedState = (loaded!.saveData as Record<string, any>)?.slot_0;
    expect(loadedState).toBeDefined();
    expect(loadedState.player.gold).toBe(100);
    expect(loadedState.player.position).toEqual({ x: 10, y: 0, z: 20 });
    expect(loadedState.npcs).toHaveLength(1);
    expect(loadedState.currentZone.name).toBe('Town Square');
  });

  it('should support all 3 save slots independently', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    const states = [
      makeSaveState(0, { gameTime: 1000, player: { ...makeSaveState(0).player, gold: 50 } }),
      makeSaveState(1, { gameTime: 2000, player: { ...makeSaveState(1).player, gold: 150 } }),
      makeSaveState(2, { gameTime: 3000, player: { ...makeSaveState(2).player, gold: 300 } }),
    ];

    // Save all 3 slots
    const saveData: Record<string, any> = {};
    for (let i = 0; i < 3; i++) {
      saveData[`slot_${i}`] = states[i];
    }
    await storage.updatePlaythrough(pt.id, { saveData });

    // Load and verify each slot
    const loaded = await storage.getPlaythrough(pt.id);
    const sd = loaded!.saveData as Record<string, any>;
    expect(sd.slot_0.gameTime).toBe(1000);
    expect(sd.slot_0.player.gold).toBe(50);
    expect(sd.slot_1.gameTime).toBe(2000);
    expect(sd.slot_1.player.gold).toBe(150);
    expect(sd.slot_2.gameTime).toBe(3000);
    expect(sd.slot_2.player.gold).toBe(300);
  });

  it('should overwrite an existing save slot', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);

    // Save initial state
    const initial = makeSaveState(0, { gameTime: 1000 });
    await storage.updatePlaythrough(pt.id, { saveData: { slot_0: initial } });

    // Overwrite
    const updated = makeSaveState(0, { gameTime: 5000, player: { ...makeSaveState(0).player, gold: 999 } });
    await storage.updatePlaythrough(pt.id, { saveData: { slot_0: updated } });

    const loaded = await storage.getPlaythrough(pt.id);
    const sd = loaded!.saveData as Record<string, any>;
    expect(sd.slot_0.gameTime).toBe(5000);
    expect(sd.slot_0.player.gold).toBe(999);
  });

  it('should return null for empty save slot', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    const loaded = await storage.getPlaythrough(pt.id);
    const sd = (loaded!.saveData as Record<string, any>) || {};
    expect(sd.slot_0).toBeUndefined();
  });

  it('should preserve complex nested state through save/load', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);
    const state = makeSaveState(0, {
      player: {
        position: { x: -123.456, y: 78.9, z: 0.001 },
        rotation: { x: 0, y: 3.14, z: 0 },
        gold: 0,
        health: 1,
        energy: 100,
        inventory: [
          { id: 'item-1', name: 'Potion', quantity: 5 },
          { id: 'item-2', name: 'Key', quantity: 1 },
          { id: 'item-3', name: 'Map', quantity: 1 },
        ],
      },
      npcs: [
        { id: 'npc-1', position: { x: 0, y: 0, z: 0 }, state: 'walking', disposition: 80, emotionalState: 'happy' },
        { id: 'npc-2', position: { x: 100, y: 0, z: 100 }, state: 'idle', disposition: -20, emotionalState: 'angry' },
      ],
      questProgress: {
        'main-quest': { status: 'active', step: 5, objectives: ['Find the key', 'Open the gate'] },
        'side-quest': { status: 'completed', step: 3 },
      },
    });

    await storage.updatePlaythrough(pt.id, { saveData: { slot_0: state } });
    const loaded = await storage.getPlaythrough(pt.id);
    const sd = (loaded!.saveData as Record<string, any>).slot_0;

    expect(sd.player.inventory).toHaveLength(3);
    expect(sd.npcs).toHaveLength(2);
    expect(sd.npcs[1].emotionalState).toBe('angry');
    expect(sd.questProgress['main-quest'].objectives).toEqual(['Find the key', 'Open the gate']);
    expect(sd.player.position.x).toBeCloseTo(-123.456);
  });
});

// ---------- Save / Load isolation between playthroughs ----------

describe('Playthrough save isolation', () => {
  it('should keep save data isolated between playthroughs', async () => {
    const ptA = await createPlaythrough(USER_A, WORLD_ID);
    const ptB = await createPlaythrough(USER_B, WORLD_ID);

    await storage.updatePlaythrough(ptA.id, {
      saveData: { slot_0: makeSaveState(0, { gameTime: 111 }) },
    });
    await storage.updatePlaythrough(ptB.id, {
      saveData: { slot_0: makeSaveState(0, { gameTime: 222 }) },
    });

    const loadedA = await storage.getPlaythrough(ptA.id);
    const loadedB = await storage.getPlaythrough(ptB.id);

    expect((loadedA!.saveData as any).slot_0.gameTime).toBe(111);
    expect((loadedB!.saveData as any).slot_0.gameTime).toBe(222);
  });
});

// ---------- Playthrough Deltas ----------

describe('Playthrough Deltas', () => {
  it('should create and retrieve deltas', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);

    const delta = await storage.createPlaythroughDelta({
      playthroughId: pt.id,
      entityType: 'character',
      entityId: 'npc-1',
      operation: 'update',
      deltaData: { disposition: 80 },
      timestep: 1,
      description: 'NPC became friendlier',
    });

    expect(delta.id).toBeDefined();
    expect(delta.playthroughId).toBe(pt.id);
    expect(delta.entityType).toBe('character');
    expect(delta.operation).toBe('update');

    const deltas = await storage.getDeltasByPlaythrough(pt.id);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].entityId).toBe('npc-1');
  });

  it('should return deltas sorted by timestep', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);

    await storage.createPlaythroughDelta({
      playthroughId: pt.id,
      entityType: 'character',
      entityId: 'npc-1',
      operation: 'update',
      deltaData: { disposition: 60 },
      timestep: 5,
    });
    await storage.createPlaythroughDelta({
      playthroughId: pt.id,
      entityType: 'item',
      entityId: 'item-1',
      operation: 'create',
      fullData: { name: 'New Sword', type: 'weapon' },
      timestep: 2,
    });
    await storage.createPlaythroughDelta({
      playthroughId: pt.id,
      entityType: 'settlement',
      entityId: 'town-1',
      operation: 'update',
      deltaData: { population: 101 },
      timestep: 10,
    });

    const deltas = await storage.getDeltasByPlaythrough(pt.id);
    expect(deltas).toHaveLength(3);
    expect(deltas[0].timestep).toBe(2);
    expect(deltas[1].timestep).toBe(5);
    expect(deltas[2].timestep).toBe(10);
  });

  it('should keep deltas isolated per playthrough', async () => {
    const ptA = await createPlaythrough(USER_A, WORLD_ID);
    const ptB = await createPlaythrough(USER_B, WORLD_ID);

    await storage.createPlaythroughDelta({
      playthroughId: ptA.id,
      entityType: 'character',
      entityId: 'npc-1',
      operation: 'update',
      deltaData: { disposition: 99 },
      timestep: 1,
    });
    await storage.createPlaythroughDelta({
      playthroughId: ptB.id,
      entityType: 'character',
      entityId: 'npc-1',
      operation: 'delete',
      timestep: 1,
    });

    const deltasA = await storage.getDeltasByPlaythrough(ptA.id);
    const deltasB = await storage.getDeltasByPlaythrough(ptB.id);
    expect(deltasA).toHaveLength(1);
    expect(deltasA[0].operation).toBe('update');
    expect(deltasB).toHaveLength(1);
    expect(deltasB[0].operation).toBe('delete');
  });
});

// ---------- Play Traces ----------

describe('Play Traces', () => {
  it('should create and retrieve play traces', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);

    const trace = await storage.createPlayTrace({
      playthroughId: pt.id,
      userId: USER_A,
      actionType: 'dialogue',
      actionName: 'Talk to merchant',
      timestep: 1,
      characterId: 'player-char',
      targetId: 'npc-merchant',
      targetType: 'character',
      locationId: 'market-1',
      outcome: 'success',
    });

    expect(trace.id).toBeDefined();
    expect(trace.actionType).toBe('dialogue');

    const traces = await storage.getTracesByPlaythrough(pt.id);
    expect(traces).toHaveLength(1);
    expect(traces[0].actionName).toBe('Talk to merchant');
  });

  it('should accumulate multiple traces', async () => {
    const pt = await createPlaythrough(USER_A, WORLD_ID);

    const actions = ['move', 'interact', 'dialogue', 'quest_accept', 'move'];
    for (let i = 0; i < actions.length; i++) {
      await storage.createPlayTrace({
        playthroughId: pt.id,
        userId: USER_A,
        actionType: actions[i],
        timestep: i + 1,
      });
    }

    const traces = await storage.getTracesByPlaythrough(pt.id);
    expect(traces).toHaveLength(5);
  });

  it('should keep traces isolated per playthrough', async () => {
    const ptA = await createPlaythrough(USER_A, WORLD_ID);
    const ptB = await createPlaythrough(USER_B, WORLD_ID);

    await storage.createPlayTrace({
      playthroughId: ptA.id,
      userId: USER_A,
      actionType: 'move',
      timestep: 1,
    });
    await storage.createPlayTrace({
      playthroughId: ptB.id,
      userId: USER_B,
      actionType: 'dialogue',
      timestep: 1,
    });

    const tracesA = await storage.getTracesByPlaythrough(ptA.id);
    const tracesB = await storage.getTracesByPlaythrough(ptB.id);
    expect(tracesA).toHaveLength(1);
    expect(tracesA[0].actionType).toBe('move');
    expect(tracesB).toHaveLength(1);
    expect(tracesB[0].actionType).toBe('dialogue');
  });
});

// ---------- Full playthrough lifecycle ----------

describe('Full playthrough lifecycle', () => {
  it('should support create → play → save → load → resume → complete', async () => {
    // 1. Create playthrough
    const pt = await createPlaythrough(USER_A, WORLD_ID, { name: 'My Adventure' });
    expect(pt.status).toBe('active');

    // 2. Record some actions (play traces)
    await storage.createPlayTrace({
      playthroughId: pt.id,
      userId: USER_A,
      actionType: 'move',
      actionName: 'Walk to market',
      timestep: 1,
      locationId: 'market-1',
      outcome: 'success',
    });
    await storage.createPlayTrace({
      playthroughId: pt.id,
      userId: USER_A,
      actionType: 'dialogue',
      actionName: 'Greet merchant',
      timestep: 2,
      targetId: 'npc-merchant',
      targetType: 'character',
      locationId: 'market-1',
      outcome: 'success',
    });

    // 3. Record a delta (NPC mood changed)
    await storage.createPlaythroughDelta({
      playthroughId: pt.id,
      entityType: 'character',
      entityId: 'npc-merchant',
      operation: 'update',
      deltaData: { disposition: 70 },
      timestep: 2,
      description: 'Merchant warmed up after conversation',
    });

    // 4. Save game state to slot 0
    const saveState = makeSaveState(0, {
      gameTime: 600,
      player: { ...makeSaveState(0).player, gold: 75, health: 90, energy: 50 },
    });
    await storage.updatePlaythrough(pt.id, {
      saveData: { slot_0: saveState },
      actionsCount: 2,
      playtime: 600,
      lastPlayedAt: new Date(),
    });

    // 5. "Close game" — verify data persists
    const reloaded = await storage.getPlaythrough(pt.id);
    expect(reloaded!.actionsCount).toBe(2);
    expect(reloaded!.playtime).toBe(600);

    // 6. Load saved state
    const loadedSave = (reloaded!.saveData as Record<string, any>).slot_0;
    expect(loadedSave.gameTime).toBe(600);
    expect(loadedSave.player.gold).toBe(75);

    // 7. Resume — record more actions
    await storage.createPlayTrace({
      playthroughId: pt.id,
      userId: USER_A,
      actionType: 'quest_accept',
      actionName: 'Accept delivery quest',
      timestep: 3,
      outcome: 'success',
    });

    // 8. Complete playthrough
    await storage.updatePlaythrough(pt.id, {
      status: 'completed',
      completedAt: new Date(),
      actionsCount: 3,
      playtime: 1200,
    });

    const completed = await storage.getPlaythrough(pt.id);
    expect(completed!.status).toBe('completed');
    expect(completed!.actionsCount).toBe(3);

    // 9. Verify all traces and deltas are preserved
    const allTraces = await storage.getTracesByPlaythrough(pt.id);
    expect(allTraces).toHaveLength(3);
    const allDeltas = await storage.getDeltasByPlaythrough(pt.id);
    expect(allDeltas).toHaveLength(1);

    // 10. Completed playthrough should not appear as active
    const active = await storage.getUserPlaythroughForWorld(USER_A, WORLD_ID);
    expect(active).toBeUndefined();
  });

  it('should support multiple playthroughs per user across different worlds', async () => {
    const pt1 = await createPlaythrough(USER_A, 'world-1', { name: 'World 1 Run' });
    const pt2 = await createPlaythrough(USER_A, 'world-2', { name: 'World 2 Run' });

    // Save different states to each
    await storage.updatePlaythrough(pt1.id, {
      saveData: { slot_0: makeSaveState(0, { gameTime: 100 }) },
    });
    await storage.updatePlaythrough(pt2.id, {
      saveData: { slot_0: makeSaveState(0, { gameTime: 200 }) },
    });

    const allPts = await storage.getPlaythroughsByUser(USER_A);
    expect(allPts).toHaveLength(2);

    // Verify save data is isolated
    const loaded1 = await storage.getPlaythrough(pt1.id);
    const loaded2 = await storage.getPlaythrough(pt2.id);
    expect((loaded1!.saveData as any).slot_0.gameTime).toBe(100);
    expect((loaded2!.saveData as any).slot_0.gameTime).toBe(200);
  });

  it('should handle complete and restart flow', async () => {
    // Create and complete
    const pt1 = await createPlaythrough(USER_A, WORLD_ID);
    await storage.updatePlaythrough(pt1.id, { status: 'completed', completedAt: new Date() });

    // Completed playthrough should not appear as active
    const active = await storage.getUserPlaythroughForWorld(USER_A, WORLD_ID);
    expect(active).toBeUndefined();

    // Create a new playthrough for same user/world
    const pt2 = await createPlaythrough(USER_A, WORLD_ID, { name: 'Fresh Start' });
    expect(pt2.id).not.toBe(pt1.id);

    // Both exist in history
    const all = await storage.getPlaythroughsByUser(USER_A);
    expect(all).toHaveLength(2);

    // Only the new one is active
    const newActive = await storage.getUserPlaythroughForWorld(USER_A, WORLD_ID);
    expect(newActive).toBeDefined();
    expect(newActive!.id).toBe(pt2.id);
  });
});
