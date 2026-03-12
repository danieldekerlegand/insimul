/**
 * Unit tests for US-006: NPC conversation memory service
 *
 * Tests:
 * - Memory stores, retrieves, and updates correctly
 * - Conversation count tracking
 * - Key fact extraction (heuristic)
 * - LLM-based summarization
 * - Summary capping at MAX_SUMMARIES
 * - Deduplication of key facts
 */

import type {
  IStreamingLLMProvider,
  ConversationContext,
  StreamCompletionOptions,
} from '../services/conversation/providers/llm-provider.js';

import {
  NPCMemoryService,
  InMemoryStorage,
} from '../services/conversation/npc-memory.js';

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

// ── Mock LLM provider that returns structured JSON ────────────────

class MockSummarizingLLM implements IStreamingLLMProvider {
  readonly name = 'mock-summarizer';
  callCount = 0;
  lastPrompt = '';

  async *streamCompletion(
    prompt: string,
    _context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    this.callCount++;
    this.lastPrompt = prompt;
    const response = JSON.stringify({
      topicsDiscussed: ['weather', 'quest'],
      promisesMade: ['I will help you find the artifact'],
      questionsAsked: ['Where is the temple?'],
      emotionalTone: 'friendly',
      keyFacts: ['Player is from the northern kingdom'],
      keyExchange: 'Player asked about the temple and NPC offered help.',
    });
    yield response;
  }
}

class MockBrokenLLM implements IStreamingLLMProvider {
  readonly name = 'mock-broken';

  async *streamCompletion(
    _prompt: string,
    _context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    yield 'This is not valid JSON at all {{{';
  }
}

// ── Test helpers ─────────────────────────────────────────────────────

const NPC_ID = 'npc-001';
const PLAYER_ID = 'player-001';
const WORLD_ID = 'world-001';

function sampleHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
  return [
    { role: 'user', content: 'Hello! My name is Alex. I am from the northern kingdom.' },
    { role: 'assistant', content: 'Welcome, traveler! What brings you to our village?' },
    { role: 'user', content: 'I\'m looking for the ancient temple. Where is it?' },
    { role: 'assistant', content: 'The temple lies beyond the forest. I will help you find it.' },
    { role: 'user', content: 'Thank you! That\'s wonderful news.' },
    { role: 'assistant', content: 'Be careful on your journey, friend.' },
  ];
}

// ── Tests ────────────────────────────────────────────────────────────

async function testGetMemoryReturnsNullForNewPair() {
  console.log('\n--- getMemory returns null for new pair ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);
  const memory = await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID);
  assert(memory === null, 'New NPC-player pair returns null');
}

async function testUpdateMemoryCreatesNewEntry() {
  console.log('\n--- updateMemory creates new entry ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory(), 'English');

  assert(memory !== null, 'Memory is created');
  assert(memory.npcId === NPC_ID, 'NPC ID matches');
  assert(memory.playerId === PLAYER_ID, 'Player ID matches');
  assert(memory.worldId === WORLD_ID, 'World ID matches');
  assert(memory.conversationCount === 1, 'Conversation count is 1');
  assert(memory.summaries.length === 1, 'One summary stored');
}

async function testConversationCountIncrements() {
  console.log('\n--- Conversation count increments ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());
  await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());
  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());

  assert(memory.conversationCount === 3, 'Count is 3 after 3 conversations');
  assert(memory.summaries.length === 3, 'Three summaries stored');
}

async function testHeuristicTopicExtraction() {
  console.log('\n--- Heuristic extracts topics ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: 'Tell me about your family and your work.' },
    { role: 'assistant', content: 'I have a lovely family. My job is to guard the village.' },
  ];

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, history);
  const summary = memory.summaries[0];

  assert(summary.topicsDiscussed.includes('family'), 'Detected topic: family');
  assert(summary.topicsDiscussed.includes('work'), 'Detected topic: work');
}

async function testHeuristicQuestionExtraction() {
  console.log('\n--- Heuristic extracts questions ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: 'Where is the temple?' },
    { role: 'assistant', content: 'It is beyond the forest.' },
    { role: 'user', content: 'How long will the journey take?' },
    { role: 'assistant', content: 'About two days.' },
  ];

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, history);
  const summary = memory.summaries[0];

  assert(summary.questionsAsked.length === 2, 'Extracted 2 questions');
  assert(summary.questionsAsked[0] === 'Where is the temple?', 'First question correct');
}

async function testHeuristicPromiseExtraction() {
  console.log('\n--- Heuristic extracts promises ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: 'Can you help me?' },
    { role: 'assistant', content: 'I will guide you to the temple.' },
    { role: 'user', content: 'I promise to return your amulet.' },
  ];

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, history);
  const summary = memory.summaries[0];

  assert(summary.promisesMade.length >= 1, 'At least one promise detected');
}

async function testHeuristicEmotionalTone() {
  console.log('\n--- Heuristic detects emotional tone ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  // Friendly
  const friendlyHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: 'Thank you so much! This is wonderful!' },
    { role: 'assistant', content: 'I am glad to help!' },
  ];
  let memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, friendlyHistory);
  assert(memory.summaries[0].emotionalTone === 'friendly', 'Friendly tone detected');

  // Hostile
  const storage2 = new InMemoryStorage();
  const service2 = new NPCMemoryService(storage2);
  const hostileHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: 'I hate this place. Go away!' },
    { role: 'assistant', content: 'Leave me alone, you are angry for no reason.' },
  ];
  memory = await service2.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, hostileHistory);
  assert(memory.summaries[0].emotionalTone === 'hostile', 'Hostile tone detected');
}

async function testHeuristicKeyFacts() {
  console.log('\n--- Heuristic extracts key facts ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());

  assert(memory.keyFacts.length > 0, 'Key facts extracted');
  assert(
    memory.keyFacts.some((f) => f.includes('name is Alex') || f.includes('from the northern kingdom')),
    'Player identity facts captured',
  );
}

async function testLLMSummarization() {
  console.log('\n--- LLM-based summarization ---');
  const storage = new InMemoryStorage();
  const llm = new MockSummarizingLLM();
  const service = new NPCMemoryService(storage, llm);

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory(), 'French');
  const summary = memory.summaries[0];

  assert(llm.callCount === 1, 'LLM was called once');
  assert(summary.topicsDiscussed.includes('weather'), 'LLM topics extracted');
  assert(summary.topicsDiscussed.includes('quest'), 'LLM quest topic extracted');
  assert(summary.promisesMade.length === 1, 'LLM promise extracted');
  assert(summary.questionsAsked.length === 1, 'LLM question extracted');
  assert(summary.emotionalTone === 'friendly', 'LLM tone extracted');
  assert(summary.languageUsed === 'French', 'Language override applied');
  assert(summary.keyExchange.length > 0, 'Key exchange summarized');
  assert(memory.keyFacts.includes('Player is from the northern kingdom'), 'LLM key facts stored');
}

async function testLLMFallsBackOnBadJSON() {
  console.log('\n--- LLM fallback on bad JSON ---');
  const storage = new InMemoryStorage();
  const brokenLLM = new MockBrokenLLM();
  const service = new NPCMemoryService(storage, brokenLLM);

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());

  assert(memory.summaries.length === 1, 'Summary still created via heuristic fallback');
  assert(memory.conversationCount === 1, 'Count still incremented');
}

async function testSummaryCapping() {
  console.log('\n--- Summary capping at MAX_SUMMARIES ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  // Create 12 conversations (MAX_SUMMARIES is 10)
  for (let i = 0; i < 12; i++) {
    await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, [
      { role: 'user', content: `Message ${i}` },
      { role: 'assistant', content: `Reply ${i}` },
    ]);
  }

  const memory = await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID);
  assert(memory !== null, 'Memory exists');
  assert(memory!.summaries.length === 10, 'Summaries capped at 10');
  assert(memory!.conversationCount === 12, 'Count tracks all 12');
}

async function testKeyFactDeduplication() {
  console.log('\n--- Key fact deduplication ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  // Same facts across two conversations
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: 'My name is Alex.' },
    { role: 'assistant', content: 'Nice to meet you, Alex!' },
  ];

  await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, history);
  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, history);

  // Count unique facts
  const uniqueFacts = new Set(memory.keyFacts);
  assert(memory.keyFacts.length === uniqueFacts.size, 'No duplicate key facts');
}

async function testMultipleNPCPlayerPairs() {
  console.log('\n--- Multiple NPC-player pairs ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  await service.updateMemory('npc-A', 'player-1', WORLD_ID, sampleHistory());
  await service.updateMemory('npc-B', 'player-1', WORLD_ID, sampleHistory());
  await service.updateMemory('npc-A', 'player-2', WORLD_ID, sampleHistory());

  const memA1 = await service.getMemory('npc-A', 'player-1', WORLD_ID);
  const memB1 = await service.getMemory('npc-B', 'player-1', WORLD_ID);
  const memA2 = await service.getMemory('npc-A', 'player-2', WORLD_ID);
  const memNone = await service.getMemory('npc-B', 'player-2', WORLD_ID);

  assert(memA1 !== null, 'NPC-A / Player-1 has memory');
  assert(memB1 !== null, 'NPC-B / Player-1 has memory');
  assert(memA2 !== null, 'NPC-A / Player-2 has memory');
  assert(memNone === null, 'NPC-B / Player-2 has no memory');
}

async function testEmptyHistory() {
  console.log('\n--- Empty conversation history ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, []);
  assert(memory.conversationCount === 1, 'Count still increments');
  assert(memory.summaries.length === 1, 'Empty summary still stored');
}

async function testLastConversationAtUpdates() {
  console.log('\n--- lastConversationAt updates on each conversation ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const first = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());
  const firstTime = first.lastConversationAt.getTime();

  // Small delay to ensure different timestamp
  await new Promise((r) => setTimeout(r, 10));

  const second = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());
  const secondTime = second.lastConversationAt.getTime();

  assert(secondTime >= firstTime, 'lastConversationAt moves forward');
}

async function testLanguageUsedInSummary() {
  console.log('\n--- Language used is stored in summary ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory(), 'Japanese');
  assert(memory.summaries[0].languageUsed === 'Japanese', 'Language stored in summary');
}

async function testDefaultLanguageIsEnglish() {
  console.log('\n--- Default language is English ---');
  const storage = new InMemoryStorage();
  const service = new NPCMemoryService(storage);

  const memory = await service.updateMemory(NPC_ID, PLAYER_ID, WORLD_ID, sampleHistory());
  assert(memory.summaries[0].languageUsed === 'English', 'Default language is English');
}

// ── Runner ───────────────────────────────────────────────────────────

async function run() {
  console.log('=== NPC Conversation Memory Service Tests ===\n');

  await testGetMemoryReturnsNullForNewPair();
  await testUpdateMemoryCreatesNewEntry();
  await testConversationCountIncrements();
  await testHeuristicTopicExtraction();
  await testHeuristicQuestionExtraction();
  await testHeuristicPromiseExtraction();
  await testHeuristicEmotionalTone();
  await testHeuristicKeyFacts();
  await testLLMSummarization();
  await testLLMFallsBackOnBadJSON();
  await testSummaryCapping();
  await testKeyFactDeduplication();
  await testMultipleNPCPlayerPairs();
  await testEmptyHistory();
  await testLastConversationAtUpdates();
  await testLanguageUsedInSummary();
  await testDefaultLanguageIsEnglish();

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
