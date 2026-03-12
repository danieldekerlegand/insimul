/**
 * Unit tests for US-007: NPC-to-NPC conversation engine
 *
 * Tests:
 * - Topic selection based on personality and relationship
 * - Exchange count driven by extroversion
 * - Relationship delta calculation
 * - Rate limiting (max 3 concurrent per world)
 * - LLM-based conversation with response parsing
 * - Fallback to template conversations when LLM unavailable
 * - Event emission (start/end)
 * - Personality-weighted behavior differences
 */

import type {
  IStreamingLLMProvider,
  ConversationContext,
  StreamCompletionOptions,
} from '../services/conversation/providers/llm-provider.js';

import type { BigFivePersonality } from '../services/conversation/context-manager.js';

import type { NpcConversationEvent, NpcConversationEventEmitter } from '../services/conversation/npc-conversation-engine.js';

import {
  initiateConversation,
  selectTopics,
  weightedRandomSelect,
  calculateExchangeCount,
  calculateRelationshipDelta,
  parseLlmConversation,
  generateFallbackConversation,
  getActiveConversationCount,
  resetRateLimiting,
  MAX_CONCURRENT_PER_WORLD,
} from '../services/conversation/npc-conversation-engine.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

// ── Mock data ────────────────────────────────────────────────────────

function makeCharacter(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'npc-1',
    firstName: overrides.firstName ?? 'Alice',
    lastName: overrides.lastName ?? 'Smith',
    worldId: overrides.worldId ?? 'world-1',
    personality: overrides.personality ?? {
      openness: 0.5,
      conscientiousness: 0.3,
      extroversion: 0.4,
      agreeableness: 0.6,
      neuroticism: -0.2,
    },
    occupation: overrides.occupation ?? 'Baker',
    currentLocation: overrides.currentLocation ?? 'town_square',
    relationships: overrides.relationships ?? {},
    thoughts: overrides.thoughts ?? [],
    gender: overrides.gender ?? 'female',
    birthYear: overrides.birthYear ?? 1990,
    spouseId: overrides.spouseId ?? null,
    parentIds: overrides.parentIds ?? [],
    childIds: overrides.childIds ?? [],
    immediateFamilyIds: overrides.immediateFamilyIds ?? [],
    friendIds: overrides.friendIds ?? [],
    coworkerIds: overrides.coworkerIds ?? [],
    neighborIds: overrides.neighborIds ?? [],
    skills: overrides.skills ?? {},
  } as any;
}

function makeWorld(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'world-1',
    name: overrides.name ?? 'Testville',
    worldType: overrides.worldType ?? 'medieval',
    description: overrides.description ?? 'A small test town',
    currentGameYear: overrides.currentGameYear ?? 1200,
    historyEndYear: overrides.historyEndYear ?? null,
  } as any;
}

// Mock storage
function makeMockStorage(chars: any[], world: any, languages: any[] = []) {
  const charMap = new Map<string, any>();
  for (const c of chars) charMap.set(c.id, c);
  return {
    getCharacter: async (id: string) => charMap.get(id),
    getWorld: async (_id: string) => world,
    getCharactersByWorld: async (_wid: string) => chars,
    getWorldLanguagesByWorld: async (_wid: string) => languages,
    getCurrentOccupation: async (_cid: string) => undefined,
    getBusiness: async (_id: string) => undefined,
  };
}

// Mock LLM provider
class MockLLMProvider implements IStreamingLLMProvider {
  readonly name = 'mock-npc-conv';
  callCount = 0;
  lastSystemPrompt = '';
  responseLines: string[];

  constructor(npc1First: string, npc2First: string, exchanges: number = 4) {
    this.responseLines = [];
    for (let i = 0; i < exchanges; i++) {
      if (i % 2 === 0) {
        this.responseLines.push(`${npc1First}: Hello there, exchange ${i + 1}.`);
      } else {
        this.responseLines.push(`${npc2First}: Nice to see you, exchange ${i + 1}.`);
      }
    }
  }

  async *streamCompletion(
    _prompt: string,
    context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    this.callCount++;
    this.lastSystemPrompt = context.systemPrompt;
    // Yield the full response as a single token (simplifies testing)
    yield this.responseLines.join('\n');
  }
}

// Failing LLM provider
class FailingLLMProvider implements IStreamingLLMProvider {
  readonly name = 'failing-llm';
  async *streamCompletion(): AsyncIterable<string> {
    throw new Error('LLM unavailable');
  }
}

// Event recorder
class EventRecorder implements NpcConversationEventEmitter {
  events: NpcConversationEvent[] = [];
  emit(event: NpcConversationEvent): void {
    this.events.push(event);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n=== US-007: NPC-to-NPC Conversation Engine Tests ===\n');

  // Reset rate limiting before each test group
  resetRateLimiting();

  // ── Topic selection ──────────────────────────────────────────────

  console.log('--- Topic Selection ---');

  {
    const npc1 = makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', personality: { openness: 0.3, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.1 } });
    const topics = selectTopics(npc1, npc2, 0.0);
    assert(topics.length > 0, 'selectTopics returns at least one topic');
    assert(topics.some(t => t.topic === 'daily_greeting'), 'daily_greeting always available');
    assert(topics.some(t => t.topic === 'weather'), 'weather always available');
  }

  {
    const npc1 = makeCharacter({ occupation: 'Baker', personality: { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', occupation: 'Baker', personality: { openness: 0.3, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.1 } });
    const topics = selectTopics(npc1, npc2, 0.0);
    const workTopic = topics.find(t => t.topic === 'work');
    assert(!!workTopic, 'work topic appears when both have occupations');
    assert(workTopic!.weight === 1.5, 'same occupation boosts work topic weight');
  }

  {
    const npc1 = makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', personality: { openness: 0.3, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.1 } });
    const topics = selectTopics(npc1, npc2, 0.5);
    assert(topics.some(t => t.topic === 'family'), 'family topic appears with strong relationship');
  }

  {
    const npc1 = makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', personality: { openness: 0.3, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.1 } });
    const topics = selectTopics(npc1, npc2, 0.1);
    assert(!topics.some(t => t.topic === 'family'), 'family topic absent with weak relationship');
  }

  {
    const npc1 = makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', personality: { openness: 0.3, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.1 } });
    const topics = selectTopics(npc1, npc2, -0.5);
    assert(topics.some(t => t.topic === 'rivalry'), 'rivalry topic appears with negative relationship');
  }

  {
    const npc1 = makeCharacter({ personality: { openness: 0.8, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.8, neuroticism: -0.2 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', personality: { openness: 0.7, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.7, neuroticism: 0.1 } });
    const topics = selectTopics(npc1, npc2, 0.6);
    assert(topics.some(t => t.topic === 'romance'), 'romance topic appears with strong relationship and compatible personality');
  }

  {
    const npc1 = makeCharacter({ personality: { openness: 0.8, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', personality: { openness: 0.6, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.1 } });
    const topics = selectTopics(npc1, npc2, 0.0);
    assert(topics.some(t => t.topic === 'shared_hobby'), 'shared_hobby appears when both have high openness');
  }

  {
    const npc1 = makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: 0.7 } });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', personality: { openness: 0.3, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.5 } });
    const topics = selectTopics(npc1, npc2, 0.0);
    assert(topics.some(t => t.topic === 'complaint'), 'complaint topic appears with high neuroticism');
  }

  // ── Weighted random selection ────────────────────────────────────

  console.log('\n--- Weighted Random Selection ---');

  {
    const candidates = [
      { topic: 'a', weight: 0, reason: '' },
      { topic: 'b', weight: 1, reason: '' },
    ];
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) results.add(weightedRandomSelect(candidates).topic);
    assert(results.has('b'), 'weighted selection picks non-zero weight');
  }

  {
    const candidates = [{ topic: 'only', weight: 1, reason: '' }];
    assert(weightedRandomSelect(candidates).topic === 'only', 'single candidate always selected');
  }

  // ── Exchange count ───────────────────────────────────────────────

  console.log('\n--- Exchange Count ---');

  {
    const introvert: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: -0.8, agreeableness: 0, neuroticism: 0 };
    const extrovert: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0.9, agreeableness: 0, neuroticism: 0 };

    const introCount = calculateExchangeCount(introvert, introvert);
    const extroCount = calculateExchangeCount(extrovert, extrovert);
    assert(introCount >= 3, 'introvert pair gets at least 3 exchanges');
    assert(extroCount <= 8, 'extrovert pair gets at most 8 exchanges');
    assert(extroCount > introCount, 'extroverts talk longer than introverts');
  }

  {
    const moderate: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 };
    const count = calculateExchangeCount(moderate, moderate);
    assert(count >= 5 && count <= 6, 'moderate extroversion gives ~5-6 exchanges');
  }

  // ── Relationship delta ───────────────────────────────────────────

  console.log('\n--- Relationship Delta ---');

  {
    const p: BigFivePersonality = { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 };
    const delta = calculateRelationshipDelta('daily_greeting', 4, p, p, 0.0);
    assert(delta.friendshipChange > 0, 'normal conversation increases friendship');
    assert(delta.trustChange > 0, 'normal conversation increases trust');
    assert(delta.romanceSpark === 0, 'non-romance topic gives 0 romance spark');
  }

  {
    const p: BigFivePersonality = { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 };
    const delta = calculateRelationshipDelta('rivalry', 4, p, p, -0.5);
    assert(delta.friendshipChange < 0, 'rivalry topic decreases friendship');
  }

  {
    const p: BigFivePersonality = { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: -0.2 };
    const delta = calculateRelationshipDelta('romance', 4, p, p, 0.5);
    assert(delta.romanceSpark > 0, 'romance topic gives positive romance spark');
    assert(delta.romanceSpark <= 0.05, 'romance spark capped at 0.05');
  }

  {
    const agreeable: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0.9, neuroticism: 0 };
    const disagreeable: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: -0.5, neuroticism: 0 };
    const deltaA = calculateRelationshipDelta('food', 5, agreeable, agreeable, 0);
    const deltaD = calculateRelationshipDelta('food', 5, disagreeable, disagreeable, 0);
    assert(deltaA.friendshipChange > deltaD.friendshipChange, 'agreeable NPCs gain more friendship');
  }

  {
    const p: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 };
    const delta = calculateRelationshipDelta('work', 5, p, p, 0);
    assert(delta.friendshipChange >= -0.1 && delta.friendshipChange <= 0.1, 'friendship change capped at ±0.1');
    assert(delta.trustChange >= -0.05 && delta.trustChange <= 0.05, 'trust change capped at ±0.05');
  }

  // ── LLM response parsing ─────────────────────────────────────────

  console.log('\n--- LLM Response Parsing ---');

  {
    const npc1 = makeCharacter({ firstName: 'Alice' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob' });
    const text = 'Alice: Hello Bob!\nBob: Hi Alice!\nAlice: How are you?\nBob: Great, thanks!';
    const exchanges = parseLlmConversation(text, npc1, npc2);
    assert(exchanges.length === 4, 'parses 4 lines into 4 exchanges');
    assert(exchanges[0].speakerId === npc1.id, 'first speaker is npc1');
    assert(exchanges[1].speakerId === npc2.id, 'second speaker is npc2');
    assert(exchanges[0].text === 'Hello Bob!', 'text extracted correctly');
  }

  {
    const npc1 = makeCharacter({ firstName: 'Alice' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob' });
    const text = 'Alice: "Hello Bob!"\nBob: "Hi Alice!"';
    const exchanges = parseLlmConversation(text, npc1, npc2);
    assert(exchanges[0].text === 'Hello Bob!', 'surrounding quotes stripped');
  }

  {
    const npc1 = makeCharacter({ firstName: 'Alice' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob' });
    const text = 'Some junk\nAlice: Hello\nmore junk\nBob: Hi';
    const exchanges = parseLlmConversation(text, npc1, npc2);
    assert(exchanges.length === 2, 'unparseable lines skipped');
  }

  // ── Fallback conversation ─────────────────────────────────────────

  console.log('\n--- Fallback Conversations ---');

  {
    const npc1 = makeCharacter({ firstName: 'Alice' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob' });
    const exchanges = generateFallbackConversation(npc1, npc2, 'greeting');
    assert(exchanges.length >= 2, 'fallback produces at least 2 exchanges');
    assert(exchanges[0].speakerId === npc1.id, 'fallback assigns speaker A to npc1');
  }

  {
    const npc1 = makeCharacter({ firstName: 'Alice' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob' });
    const exchanges = generateFallbackConversation(npc1, npc2, 'work');
    assert(exchanges.some(e => e.text.toLowerCase().includes('work')), 'work fallback mentions work');
  }

  {
    const npc1 = makeCharacter({ firstName: 'Alice' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob' });
    const exchanges = generateFallbackConversation(npc1, npc2, 'unknown_topic_xyz');
    assert(exchanges.length >= 2, 'unknown topic falls back to default template');
  }

  // ── Full conversation with mock LLM ───────────────────────────────

  console.log('\n--- Full Conversation (LLM) ---');

  {
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const world = makeWorld();
    const storage = makeMockStorage([npc1, npc2], world);
    const llm = new MockLLMProvider('Alice', 'Bob', 6);
    const eventRecorder = new EventRecorder();

    resetRateLimiting();
    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: llm,
      storageOverride: storage,
      eventEmitter: eventRecorder,
    });

    assert(result.npc1Id === 'npc-1', 'result contains npc1Id');
    assert(result.npc2Id === 'npc-2', 'result contains npc2Id');
    assert(result.worldId === 'world-1', 'result contains worldId');
    assert(result.exchanges.length > 0, 'LLM conversation produces exchanges');
    assert(result.topic.length > 0, 'topic is set');
    assert(result.durationMs >= 0, 'durationMs is non-negative');
    assert(llm.callCount === 1, 'LLM was called exactly once');
  }

  // ── Full conversation without LLM (fallback) ─────────────────────

  console.log('\n--- Full Conversation (Fallback) ---');

  {
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const world = makeWorld();
    const storage = makeMockStorage([npc1, npc2], world);

    resetRateLimiting();
    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: storage,
      // No llmProvider — should use fallback
    });

    assert(result.exchanges.length >= 2, 'fallback conversation has exchanges');
    assert(result.relationshipDelta.friendshipChange !== undefined, 'relationship delta computed');
  }

  // ── Failing LLM falls back to templates ──────────────────────────

  console.log('\n--- Failing LLM Fallback ---');

  {
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const world = makeWorld();
    const storage = makeMockStorage([npc1, npc2], world);
    const failingLlm = new FailingLLMProvider();

    resetRateLimiting();
    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: failingLlm,
      storageOverride: storage,
    });

    assert(result.exchanges.length >= 2, 'failing LLM falls back to template conversation');
  }

  // ── Event emission ────────────────────────────────────────────────

  console.log('\n--- Event Emission ---');

  {
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const world = makeWorld();
    const storage = makeMockStorage([npc1, npc2], world);
    const eventRecorder = new EventRecorder();

    resetRateLimiting();
    await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: storage,
      eventEmitter: eventRecorder,
    });

    assert(eventRecorder.events.length === 2, 'emits exactly 2 events (start + end)');
    assert(eventRecorder.events[0].type === 'ambient_conversation_started', 'first event is start');
    assert(eventRecorder.events[1].type === 'ambient_conversation_ended', 'second event is end');
    assert(
      eventRecorder.events[0].participants[0] === 'npc-1' &&
      eventRecorder.events[0].participants[1] === 'npc-2',
      'events contain correct participant IDs',
    );
    assert(eventRecorder.events[1].durationMs! >= 0, 'end event has durationMs');
  }

  // ── Rate limiting ─────────────────────────────────────────────────

  console.log('\n--- Rate Limiting ---');

  {
    resetRateLimiting();
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const npc3 = makeCharacter({ id: 'npc-3', firstName: 'Carol', lastName: 'Davis' });
    const npc4 = makeCharacter({ id: 'npc-4', firstName: 'Dave', lastName: 'Wilson' });
    const npc5 = makeCharacter({ id: 'npc-5', firstName: 'Eve', lastName: 'Brown' });
    const npc6 = makeCharacter({ id: 'npc-6', firstName: 'Frank', lastName: 'Taylor' });
    const npc7 = makeCharacter({ id: 'npc-7', firstName: 'Grace', lastName: 'Lee' });
    const npc8 = makeCharacter({ id: 'npc-8', firstName: 'Henry', lastName: 'Clark' });
    const world = makeWorld();
    const allChars = [npc1, npc2, npc3, npc4, npc5, npc6, npc7, npc8];
    const storage = makeMockStorage(allChars, world);

    // Use a slow LLM to ensure conversations overlap
    class SlowLLMProvider implements IStreamingLLMProvider {
      readonly name = 'slow-mock';
      async *streamCompletion(
        _prompt: string,
        _context: ConversationContext,
      ): AsyncIterable<string> {
        await new Promise(r => setTimeout(r, 100));
        yield 'Alice: Hello\nBob: Hi';
      }
    }
    const slowLlm = new SlowLLMProvider();

    // Start 4 conversations — the 4th should fail
    const conv1 = initiateConversation('npc-1', 'npc-2', 'world-1', { llmProvider: slowLlm, storageOverride: storage });
    const conv2 = initiateConversation('npc-3', 'npc-4', 'world-1', { llmProvider: slowLlm, storageOverride: storage });
    const conv3 = initiateConversation('npc-5', 'npc-6', 'world-1', { llmProvider: slowLlm, storageOverride: storage });

    // Give the first 3 a moment to acquire slots
    await new Promise(r => setTimeout(r, 10));

    let rateLimitHit = false;
    try {
      await initiateConversation('npc-7', 'npc-8', 'world-1', { llmProvider: slowLlm, storageOverride: storage });
    } catch (e: any) {
      rateLimitHit = e.message.includes('Rate limit');
    }
    assert(rateLimitHit, 'rate limit rejects 4th concurrent conversation in same world');

    // Wait for all to finish
    await Promise.allSettled([conv1, conv2, conv3]);
    assert(getActiveConversationCount('world-1') === 0, 'all slots released after completion');
  }

  {
    // Different worlds don't share rate limit
    resetRateLimiting();
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const world1 = makeWorld({ id: 'world-1' });
    const world2 = makeWorld({ id: 'world-2' });

    const storage1 = makeMockStorage([npc1, npc2], world1);
    const storage2 = makeMockStorage([npc1, npc2], world2);

    const result1 = await initiateConversation('npc-1', 'npc-2', 'world-1', { storageOverride: storage1 });
    const result2 = await initiateConversation('npc-1', 'npc-2', 'world-2', { storageOverride: storage2 });

    assert(result1.worldId === 'world-1', 'world-1 conversation succeeds');
    assert(result2.worldId === 'world-2', 'world-2 conversation succeeds independently');
  }

  // ── Personality affects behavior ──────────────────────────────────

  console.log('\n--- Personality-Driven Behavior ---');

  {
    // High neuroticism NPC pair should have complaint topic available
    const highNeuro1 = makeCharacter({
      id: 'neuro-1', firstName: 'Anxious', lastName: 'One',
      personality: { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0.8 },
    });
    const highNeuro2 = makeCharacter({
      id: 'neuro-2', firstName: 'Worried', lastName: 'Two',
      personality: { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0.7 },
    });
    const lowNeuro1 = makeCharacter({
      id: 'calm-1', firstName: 'Calm', lastName: 'One',
      personality: { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: -0.5 },
    });
    const lowNeuro2 = makeCharacter({
      id: 'calm-2', firstName: 'Serene', lastName: 'Two',
      personality: { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: -0.8 },
    });

    const highNeuroTopics = selectTopics(highNeuro1, highNeuro2, 0);
    const lowNeuroTopics = selectTopics(lowNeuro1, lowNeuro2, 0);

    const highComplaint = highNeuroTopics.find(t => t.topic === 'complaint');
    const lowComplaint = lowNeuroTopics.find(t => t.topic === 'complaint');

    assert(!!highComplaint, 'high neuroticism pair has complaint topic');
    assert(!lowComplaint, 'low neuroticism pair lacks complaint topic');
  }

  {
    // High extroversion → more exchanges than low extroversion
    const highExtro: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0.9, agreeableness: 0, neuroticism: 0 };
    const lowExtro: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: -0.9, agreeableness: 0, neuroticism: 0 };

    const highCount = calculateExchangeCount(highExtro, highExtro);
    const lowCount = calculateExchangeCount(lowExtro, lowExtro);

    assert(highCount === 8, 'very high extroversion pair gets 8 exchanges');
    assert(lowCount === 3, 'very low extroversion pair gets 3 exchanges');
  }

  // ── Language in conversation ──────────────────────────────────────

  console.log('\n--- Language Integration ---');

  {
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const world = makeWorld();
    const languages = [{ id: 'lang-1', name: 'French', realCode: 'fr', isLearningTarget: true, worldId: 'world-1' }];
    const storage = makeMockStorage([npc1, npc2], world, languages);

    resetRateLimiting();
    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: storage,
    });

    assert(result.languageUsed === 'French', 'conversation uses world language');
  }

  // ── Custom topic ──────────────────────────────────────────────────

  console.log('\n--- Custom Topic ---');

  {
    const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const world = makeWorld();
    const storage = makeMockStorage([npc1, npc2], world);

    resetRateLimiting();
    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      topic: 'the_dragon_attack',
      storageOverride: storage,
    });

    assert(result.topic === 'the_dragon_attack', 'custom topic is used');
  }

  // ── Error handling ────────────────────────────────────────────────

  console.log('\n--- Error Handling ---');

  {
    const world = makeWorld();
    const storage = makeMockStorage([], world);

    resetRateLimiting();
    let threw = false;
    try {
      await initiateConversation('nonexistent-1', 'nonexistent-2', 'world-1', {
        storageOverride: storage,
      });
    } catch (e: any) {
      threw = e.message.includes('not found');
    }
    assert(threw, 'throws when NPC not found');
  }

  // ── Summary ─────────────────────────────────────────────────────

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
