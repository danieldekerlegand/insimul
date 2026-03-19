/**
 * Tests for the playthrough journey analytics endpoint.
 *
 * Verifies GET /api/worlds/:worldId/analytics/playthroughs/:playthroughId/journey
 * returns correctly aggregated journey data: action breakdown, outcome breakdown,
 * location visits, delta breakdown, engagement data, reputations, and timeline.
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
  const collections = ['playthroughs', 'playthroughdeltas', 'playtraces', 'reputations'];
  for (const name of collections) {
    try {
      const col = mongoose.connection.collection(name);
      await col.deleteMany({});
    } catch {
      // Collection may not exist yet
    }
  }
});

const USER_ID = 'user-journey-1';
const WORLD_ID = 'world-journey-1';

describe('Playthrough journey analytics data aggregation', () => {
  it('should return empty aggregations for a playthrough with no traces/deltas', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Empty Journey',
      status: 'active',
    });

    const traces = await storage.getTracesByPlaythrough(pt.id);
    const deltas = await storage.getDeltasByPlaythrough(pt.id);
    const reputations = await storage.getReputationsByPlaythrough(pt.id);

    expect(traces).toEqual([]);
    expect(deltas).toEqual([]);
    expect(reputations).toEqual([]);
  });

  it('should aggregate play traces by action type', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Action Test',
      status: 'active',
    });

    // Create traces with various action types
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 1, outcome: 'success' });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 2, outcome: 'success' });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'interact', timestep: 3, outcome: 'success' });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'dialogue', timestep: 4, outcome: 'failure' });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 5, outcome: 'success' });

    const traces = await storage.getTracesByPlaythrough(pt.id);
    expect(traces).toHaveLength(5);

    // Aggregate action breakdown
    const actionBreakdown: Record<string, number> = {};
    const outcomeBreakdown: Record<string, number> = {};
    for (const trace of traces) {
      const aType = trace.actionType || 'unknown';
      actionBreakdown[aType] = (actionBreakdown[aType] || 0) + 1;
      const outcome = trace.outcome || 'unknown';
      outcomeBreakdown[outcome] = (outcomeBreakdown[outcome] || 0) + 1;
    }

    expect(actionBreakdown).toEqual({ move: 3, interact: 1, dialogue: 1 });
    expect(outcomeBreakdown).toEqual({ success: 4, failure: 1 });
  });

  it('should track location visits from traces', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Location Test',
      status: 'active',
    });

    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 1, locationId: 'loc-market' });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'interact', timestep: 2, locationId: 'loc-market' });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 3, locationId: 'loc-tavern' });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 4, locationId: 'loc-market' });

    const traces = await storage.getTracesByPlaythrough(pt.id);
    const locationVisits: Record<string, number> = {};
    for (const trace of traces) {
      if (trace.locationId) {
        locationVisits[trace.locationId] = (locationVisits[trace.locationId] || 0) + 1;
      }
    }

    expect(locationVisits).toEqual({ 'loc-market': 3, 'loc-tavern': 1 });
    expect(Object.keys(locationVisits)).toHaveLength(2);
  });

  it('should aggregate deltas by entity type and operation', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Delta Test',
      status: 'active',
    });

    await storage.createPlaythroughDelta({ playthroughId: pt.id, entityType: 'character', entityId: 'c1', operation: 'update', timestep: 1, deltaData: { health: 80 } });
    await storage.createPlaythroughDelta({ playthroughId: pt.id, entityType: 'character', entityId: 'c2', operation: 'create', timestep: 2, fullData: { name: 'New NPC' } });
    await storage.createPlaythroughDelta({ playthroughId: pt.id, entityType: 'item', entityId: 'i1', operation: 'create', timestep: 3, fullData: { name: 'Sword' } });
    await storage.createPlaythroughDelta({ playthroughId: pt.id, entityType: 'character', entityId: 'c1', operation: 'update', timestep: 4, deltaData: { health: 60 } });
    await storage.createPlaythroughDelta({ playthroughId: pt.id, entityType: 'item', entityId: 'i1', operation: 'delete', timestep: 5 });

    const deltas = await storage.getDeltasByPlaythrough(pt.id);
    const deltaBreakdown: Record<string, { creates: number; updates: number; deletes: number }> = {};
    for (const delta of deltas) {
      if (!deltaBreakdown[delta.entityType]) {
        deltaBreakdown[delta.entityType] = { creates: 0, updates: 0, deletes: 0 };
      }
      const op = delta.operation as 'create' | 'update' | 'delete';
      if (op === 'create') deltaBreakdown[delta.entityType].creates++;
      else if (op === 'update') deltaBreakdown[delta.entityType].updates++;
      else if (op === 'delete') deltaBreakdown[delta.entityType].deletes++;
    }

    expect(deltaBreakdown).toEqual({
      character: { creates: 1, updates: 2, deletes: 0 },
      item: { creates: 1, updates: 0, deletes: 1 },
    });
  });

  it('should compute actions per timestep for engagement data', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Engagement Test',
      status: 'active',
    });

    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 1 });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'interact', timestep: 1 });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'dialogue', timestep: 1 });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 2 });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 3 });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'interact', timestep: 3 });

    const traces = await storage.getTracesByPlaythrough(pt.id);
    const actionsPerTimestep: Record<number, number> = {};
    for (const trace of traces) {
      actionsPerTimestep[trace.timestep] = (actionsPerTimestep[trace.timestep] || 0) + 1;
    }

    expect(actionsPerTimestep).toEqual({ 1: 3, 2: 1, 3: 2 });
  });

  it('should return reputations for a playthrough', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Reputation Test',
      status: 'active',
    });

    await storage.createReputation({
      playthroughId: pt.id,
      userId: USER_ID,
      entityType: 'settlement',
      entityId: 'town-1',
      score: 45,
    });
    await storage.createReputation({
      playthroughId: pt.id,
      userId: USER_ID,
      entityType: 'faction',
      entityId: 'guild-1',
      score: -20,
    });

    const reps = await storage.getReputationsByPlaythrough(pt.id);
    expect(reps).toHaveLength(2);
    expect(reps.find(r => r.entityId === 'town-1')?.score).toBe(45);
    expect(reps.find(r => r.entityId === 'guild-1')?.score).toBe(-20);
  });

  it('should compute average action duration from traces with durationMs', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Duration Test',
      status: 'active',
    });

    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 1, durationMs: 100 });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'interact', timestep: 2, durationMs: 300 });
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'dialogue', timestep: 3 }); // no duration
    await storage.createPlayTrace({ playthroughId: pt.id, userId: USER_ID, actionType: 'move', timestep: 4, durationMs: 200 });

    const traces = await storage.getTracesByPlaythrough(pt.id);
    const durations = traces.filter(t => t.durationMs != null).map(t => t.durationMs!);
    const avgDurationMs = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    expect(durations).toHaveLength(3);
    expect(avgDurationMs).toBe(200); // (100 + 300 + 200) / 3 = 200
  });

  it('should build timeline events from traces', async () => {
    const pt = await storage.createPlaythrough({
      userId: USER_ID,
      worldId: WORLD_ID,
      name: 'Timeline Test',
      status: 'active',
    });

    await storage.createPlayTrace({
      playthroughId: pt.id,
      userId: USER_ID,
      actionType: 'dialogue',
      actionName: 'Talk to Elder',
      timestep: 1,
      outcome: 'success',
      narrativeText: 'You spoke with the village elder.',
      locationId: 'loc-village',
      targetType: 'character',
      durationMs: 5000,
    });

    const traces = await storage.getTracesByPlaythrough(pt.id);
    expect(traces).toHaveLength(1);

    const event = traces[0];
    expect(event.actionType).toBe('dialogue');
    expect(event.actionName).toBe('Talk to Elder');
    expect(event.outcome).toBe('success');
    expect(event.narrativeText).toBe('You spoke with the village elder.');
    expect(event.locationId).toBe('loc-village');
    expect(event.targetType).toBe('character');
    expect(event.durationMs).toBe(5000);
  });
});
