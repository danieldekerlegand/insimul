/**
 * Tests for PlayerActionTracker
 *
 * Run with: npx tsx client/src/components/3DGame/PlayerActionTracker.test.ts
 */

import { GameEventBus, type GameEvent } from '/game-engine/logic/GameEventBus';
import { PlayerActionTracker, type PendingTrace } from '/game-engine/logic/PlayerActionTracker';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ── Helper: mock fetch ──────────────────────────────────────────────────────

let fetchCalls: Array<{ url: string; init: RequestInit }> = [];
let fetchResponse: { ok: boolean; status: number; json: () => Promise<any> } = {
  ok: true,
  status: 201,
  json: async () => ({ inserted: 0 }),
};

(globalThis as any).fetch = async (url: string, init: RequestInit) => {
  fetchCalls.push({ url, init });
  return fetchResponse;
};

function resetFetch() {
  fetchCalls = [];
  fetchResponse = { ok: true, status: 201, json: async () => ({ inserted: 0 }) };
}

// ── Tests ───────────────────────────────────────────────────────────────────

console.log('\nPlayerActionTracker Tests\n');

// Test 1: Records events from GameEventBus
console.log('1. Event recording');
{
  resetFetch();
  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000, // Don't auto-flush during tests
  });
  tracker.start(bus);

  bus.emit({ type: 'location_visited', locationId: 'loc-1', locationName: 'Town Square' });
  bus.emit({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Elder', turnCount: 3 });

  assert(tracker.pendingCount === 2, 'Two events queued');

  const traces = tracker.getPendingTraces();
  assert(traces[0].actionType === 'location_visited', 'First trace is location_visited');
  assert(traces[0].actionData.locationName === 'Town Square', 'Location name captured');
  assert(traces[0].actionData.researchCategory === 'exploration', 'Location visit categorized as exploration');

  assert(traces[1].actionType === 'npc_talked', 'Second trace is npc_talked');
  assert(traces[1].targetId === 'npc-1', 'NPC target ID extracted');
  assert(traces[1].targetType === 'character', 'Target type is character');
  assert(traces[1].actionData.researchCategory === 'social_interaction', 'NPC talk categorized as social_interaction');

  tracker.dispose();
  bus.dispose();
}

// Test 2: Research categories
console.log('\n2. Research category mapping');
{
  resetFetch();
  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
  });
  tracker.start(bus);

  const categoryTests: Array<{ event: GameEvent; expected: string }> = [
    { event: { type: 'vocabulary_used', word: 'hello', correct: true }, expected: 'language_learning' },
    { event: { type: 'quest_accepted', questId: 'q1', questTitle: 'Test' }, expected: 'quest_engagement' },
    { event: { type: 'romance_action', npcId: 'n1', npcName: 'A', actionType: 'flirt', accepted: true }, expected: 'social_interaction' },
    { event: { type: 'settlement_entered', settlementId: 's1', settlementName: 'Village' }, expected: 'exploration' },
    { event: { type: 'assessment_completed', sessionId: 's1', instrumentId: 'i1', totalScore: 80 }, expected: 'assessment' },
    { event: { type: 'enemy_defeated', entityId: 'e1', enemyType: 'wolf' }, expected: 'combat' },
    { event: { type: 'item_collected', itemId: 'i1', itemName: 'Sword', quantity: 1 }, expected: 'inventory' },
    { event: { type: 'achievement_unlocked', achievementId: 'a1', achievementName: 'First Steps', description: 'desc', icon: 'star' }, expected: 'achievement' },
  ];

  for (const { event, expected } of categoryTests) {
    bus.emit(event);
  }

  const traces = tracker.getPendingTraces();
  for (let i = 0; i < categoryTests.length; i++) {
    assert(
      traces[i].actionData.researchCategory === categoryTests[i].expected,
      `${categoryTests[i].event.type} → ${categoryTests[i].expected}`,
    );
  }

  tracker.dispose();
  bus.dispose();
}

// Test 3: Outcome extraction
console.log('\n3. Outcome extraction');
{
  resetFetch();
  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
  });
  tracker.start(bus);

  bus.emit({ type: 'vocabulary_used', word: 'bonjour', correct: true });
  bus.emit({ type: 'vocabulary_used', word: 'merci', correct: false });
  bus.emit({ type: 'quest_completed', questId: 'q1' });
  bus.emit({ type: 'quest_failed', questId: 'q2' });
  bus.emit({ type: 'quest_abandoned', questId: 'q3' });

  const traces = tracker.getPendingTraces();
  assert(traces[0].outcome === 'success', 'correct=true → success');
  assert(traces[1].outcome === 'failure', 'correct=false → failure');
  assert(traces[2].outcome === 'success', 'quest_completed → success');
  assert(traces[3].outcome === 'failure', 'quest_failed → failure');
  assert(traces[4].outcome === 'abandoned', 'quest_abandoned → abandoned');

  tracker.dispose();
  bus.dispose();
}

// Test 4: Target extraction
console.log('\n4. Target extraction');
{
  resetFetch();
  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
  });
  tracker.start(bus);

  bus.emit({ type: 'npc_talked', npcId: 'npc-5', npcName: 'Bob', turnCount: 2 });
  bus.emit({ type: 'item_collected', itemId: 'item-3', itemName: 'Key', quantity: 1 });
  bus.emit({ type: 'location_visited', locationId: 'loc-7', locationName: 'Forest' });
  bus.emit({ type: 'puzzle_solved', puzzleId: 'puz-2' });

  const traces = tracker.getPendingTraces();
  assert(traces[0].targetId === 'npc-5' && traces[0].targetType === 'character', 'NPC target extracted');
  assert(traces[1].targetId === 'item-3' && traces[1].targetType === 'item', 'Item target extracted');
  assert(traces[2].targetId === 'loc-7' && traces[2].targetType === 'location', 'Location target extracted');
  assert(traces[3].targetId === 'puz-2' && traces[3].targetType === 'puzzle', 'Puzzle target extracted');

  tracker.dispose();
  bus.dispose();
}

// Test 5: Flush sends to server
console.log('\n5. Flush sends batch to server');
{
  resetFetch();
  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-42',
    userId: 'user-1',
    worldId: 'world-1',
    authToken: 'test-token',
    flushIntervalMs: 60_000,
  });
  tracker.start(bus);

  bus.emit({ type: 'location_visited', locationId: 'loc-1', locationName: 'Market' });
  bus.emit({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Vendor', turnCount: 1 });

  await tracker.flush();

  assert(fetchCalls.length === 1, 'One fetch call made');
  assert(fetchCalls[0].url === '/api/playthroughs/pt-42/traces/batch', 'Correct URL');
  assert(fetchCalls[0].init.method === 'POST', 'POST method');

  const headers = fetchCalls[0].init.headers as Record<string, string>;
  assert(headers['Authorization'] === 'Bearer test-token', 'Auth token sent');

  const body = JSON.parse(fetchCalls[0].init.body as string);
  assert(body.traces.length === 2, 'Two traces in batch');
  assert(tracker.pendingCount === 0, 'Queue cleared after flush');
  assert(tracker.tracesSent === 2, 'tracesSent incremented');

  await tracker.dispose();
  bus.dispose();
}

// Test 6: Failed flush retains traces
console.log('\n6. Failed flush retains traces in queue');
{
  resetFetch();
  fetchResponse = { ok: false, status: 500, json: async () => ({ message: 'error' }) };

  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
  });
  tracker.start(bus);

  bus.emit({ type: 'location_visited', locationId: 'loc-1', locationName: 'Cave' });

  await tracker.flush();

  assert(tracker.pendingCount === 1, 'Trace retained after failed flush');
  assert(tracker.tracesFailed === 1, 'tracesFailed incremented');

  await tracker.dispose();
  bus.dispose();
}

// Test 7: Auto-flush on batch size
console.log('\n7. Auto-flush when batch size reached');
{
  resetFetch();
  fetchResponse = { ok: true, status: 201, json: async () => ({ inserted: 3 }) };

  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
    batchSize: 3,
  });
  tracker.start(bus);

  bus.emit({ type: 'location_visited', locationId: 'loc-1', locationName: 'A' });
  bus.emit({ type: 'location_visited', locationId: 'loc-2', locationName: 'B' });
  // Third event triggers auto-flush
  bus.emit({ type: 'location_visited', locationId: 'loc-3', locationName: 'C' });

  // Wait for the async flush to complete
  await new Promise(resolve => setTimeout(resolve, 50));

  assert(fetchCalls.length === 1, 'Auto-flush triggered at batch size');

  await tracker.dispose();
  bus.dispose();
}

// Test 8: Context providers (timestep, characterId, locationId)
console.log('\n8. Context providers');
{
  resetFetch();
  const bus = new GameEventBus();
  let currentTimestep = 42;
  let currentLocation = 'loc-current';

  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
    characterId: 'player-char',
    getTimestep: () => currentTimestep,
    getLocationId: () => currentLocation,
  });
  tracker.start(bus);

  bus.emit({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Test', turnCount: 1 });

  const traces = tracker.getPendingTraces();
  assert(traces[0].timestep === 42, 'Timestep from provider');
  assert(traces[0].characterId === 'player-char', 'Character ID set');
  assert(traces[0].locationId === 'loc-current', 'Location from provider');

  await tracker.dispose();
  bus.dispose();
}

// Test 9: Dispose unsubscribes from event bus
console.log('\n9. Dispose unsubscribes');
{
  resetFetch();
  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
  });
  tracker.start(bus);

  bus.emit({ type: 'location_visited', locationId: 'loc-1', locationName: 'A' });
  assert(tracker.pendingCount === 1, 'One event before dispose');

  await tracker.dispose();

  // Events after dispose should not be recorded
  bus.emit({ type: 'location_visited', locationId: 'loc-2', locationName: 'B' });
  // After dispose, the flush already happened, so pending should be 0 (the 1 trace was flushed)
  // And the new event should NOT be recorded
  assert(tracker.pendingCount === 0, 'No new events after dispose');

  bus.dispose();
}

// Test 10: Action name formatting
console.log('\n10. Action name formatting');
{
  resetFetch();
  const bus = new GameEventBus();
  const tracker = new PlayerActionTracker({
    playthroughId: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    flushIntervalMs: 60_000,
  });
  tracker.start(bus);

  bus.emit({ type: 'ambient_conversation_started', conversationId: 'c1', participants: ['a', 'b'], locationId: 'l1', topic: 'weather' });

  const traces = tracker.getPendingTraces();
  assert(traces[0].actionName === 'Ambient Conversation Started', 'Event type formatted as title case');

  await tracker.dispose();
  bus.dispose();
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
