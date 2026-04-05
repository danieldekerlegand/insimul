/**
 * Tests for US-013: Batch NPC-NPC conversation generation
 *
 * Covers: buildBatchPrompt(), parseBatchResponse(), batchGenerateConversations(),
 * batch rate limiting, partial failure handling, pool batch replenishment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildBatchPrompt,
  parseBatchResponse,
  batchGenerateConversations,
  acquireBatchSlot,
  releaseBatchSlot,
  getActiveBatchCount,
  resetBatchRateLimiting,
  BATCH_DELIMITER,
  MAX_BATCHES_PER_WORLD,
} from '../services/conversation/npc-conversation-engine';
import type {
  BatchConversationRequest,
  BatchGenerationResult,
} from '../services/conversation/npc-conversation-engine';
import {
  NpcConversationPool,
  replenishPoolBatch,
} from '../services/conversation/npc-conversation-pool';
import type { PooledConversation } from '../services/conversation/npc-conversation-pool';
import { resetConversationMetrics } from '../services/conversation/conversation-metrics';
import type { Character } from '@shared/schema';
import type { IStreamingLLMProvider, ConversationContext, StreamCompletionOptions } from '../services/conversation/providers/llm-provider';

// ── Helpers ──────────────────────────────────────────────────────────

function makeNpc(overrides: Partial<Character> = {}): Character {
  return {
    id: overrides.id ?? `npc-${Math.random().toString(36).slice(2, 8)}`,
    firstName: overrides.firstName ?? 'Alice',
    lastName: overrides.lastName ?? 'Smith',
    occupation: overrides.occupation ?? 'baker',
    personality: overrides.personality ?? {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    relationships: overrides.relationships ?? {},
    currentLocation: overrides.currentLocation ?? 'town-square',
    ...overrides,
  } as Character;
}

function makeRequest(overrides: Partial<BatchConversationRequest> = {}): BatchConversationRequest {
  return {
    npc1: overrides.npc1 ?? makeNpc({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' }),
    npc2: overrides.npc2 ?? makeNpc({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' }),
    topic: overrides.topic ?? 'daily_greeting',
    exchangeCount: overrides.exchangeCount ?? 4,
  };
}

function createMockLLMProvider(response: string): IStreamingLLMProvider {
  return {
    name: 'mock-batch',
    streamCompletion: async function* (_prompt: string, _context: ConversationContext, _options?: StreamCompletionOptions) {
      yield response;
    },
  };
}

function createErrorLLMProvider(): IStreamingLLMProvider {
  return {
    name: 'mock-error',
    streamCompletion: async function* () {
      throw new Error('LLM unavailable');
    },
  };
}

// ── buildBatchPrompt ────────────────────────────────────────────────

describe('buildBatchPrompt', () => {
  it('includes character roster at the top', () => {
    const alice = makeNpc({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith', occupation: 'baker' });
    const bob = makeNpc({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones', occupation: 'farmer' });
    const requests = [makeRequest({ npc1: alice, npc2: bob })];

    const prompt = buildBatchPrompt(requests, 'Testville', ['French']);

    expect(prompt).toContain('CHARACTER ROSTER');
    expect(prompt).toContain('Alice Smith (baker)');
    expect(prompt).toContain('Bob Jones (farmer)');
    expect(prompt).toContain('Testville');
    expect(prompt).toContain('French');
  });

  it('deduplicates characters appearing in multiple conversations', () => {
    const alice = makeNpc({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
    const bob = makeNpc({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
    const carol = makeNpc({ id: 'npc-3', firstName: 'Carol', lastName: 'White' });
    const requests = [
      makeRequest({ npc1: alice, npc2: bob, topic: 'weather' }),
      makeRequest({ npc1: alice, npc2: carol, topic: 'work' }),
    ];

    const prompt = buildBatchPrompt(requests, 'Testville', []);

    // Alice should appear only once in roster
    const aliceMatches = prompt.match(/Alice Smith/g);
    // Once in roster + once per conversation request
    expect(aliceMatches).toBeTruthy();
    // Roster section should have Alice only once
    const rosterSection = prompt.split('CONVERSATION 1')[0];
    const rosterAlice = rosterSection.match(/Alice Smith/g);
    expect(rosterAlice?.length).toBe(1);
  });

  it('includes conversation numbers and delimiters', () => {
    const requests = [
      makeRequest({ topic: 'weather' }),
      makeRequest({ topic: 'work' }),
      makeRequest({ topic: 'gossip' }),
    ];

    const prompt = buildBatchPrompt(requests, 'Testville', []);

    expect(prompt).toContain('CONVERSATION 1:');
    expect(prompt).toContain('CONVERSATION 2:');
    expect(prompt).toContain('CONVERSATION 3:');
    expect(prompt).toContain(BATCH_DELIMITER);
  });

  it('specifies exchange count per conversation', () => {
    const requests = [
      makeRequest({ exchangeCount: 3 }),
      makeRequest({ exchangeCount: 6 }),
    ];

    const prompt = buildBatchPrompt(requests, 'Testville', []);

    expect(prompt).toContain('Exchanges: 3');
    expect(prompt).toContain('Exchanges: 6');
  });
});

// ── parseBatchResponse ──────────────────────────────────────────────

describe('parseBatchResponse', () => {
  const alice = makeNpc({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
  const bob = makeNpc({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
  const carol = makeNpc({ id: 'npc-3', firstName: 'Carol', lastName: 'White' });

  it('parses a well-formed batch response with 3 conversations', () => {
    const response = [
      'Alice: Hello Bob!',
      'Bob: Hi Alice!',
      'Alice: Nice day.',
      'Bob: Indeed it is.',
      BATCH_DELIMITER,
      'Alice: Good morning Carol!',
      'Carol: Morning Alice!',
      'Alice: How are you?',
      'Carol: Very well.',
      BATCH_DELIMITER,
      'Bob: Hey Carol.',
      'Carol: Hey Bob!',
      'Bob: Busy day?',
      'Carol: Always.',
    ].join('\n');

    const requests = [
      makeRequest({ npc1: alice, npc2: bob }),
      makeRequest({ npc1: alice, npc2: carol }),
      makeRequest({ npc1: bob, npc2: carol }),
    ];

    const result = parseBatchResponse(response, requests);

    expect(result.parsed.length).toBe(3);
    expect(result.failures.length).toBe(0);
    expect(result.parsed[0].exchanges.length).toBe(4);
    expect(result.parsed[1].exchanges.length).toBe(4);
    expect(result.parsed[2].exchanges.length).toBe(4);
  });

  it('handles missing sections gracefully', () => {
    const response = [
      'Alice: Hello Bob!',
      'Bob: Hi Alice!',
      'Alice: Nice day.',
      'Bob: Indeed it is.',
      // Only one conversation, but two requested
    ].join('\n');

    const requests = [
      makeRequest({ npc1: alice, npc2: bob }),
      makeRequest({ npc1: alice, npc2: carol }),
    ];

    const result = parseBatchResponse(response, requests);

    expect(result.parsed.length).toBe(1);
    expect(result.failures.length).toBe(1);
    expect(result.failures[0].index).toBe(1);
    expect(result.failures[0].reason).toBe('no_section_in_response');
  });

  it('handles malformed sections with too few exchanges', () => {
    const response = [
      'Alice: Hello Bob!',
      'Bob: Hi Alice!',
      'Alice: Nice day.',
      'Bob: Indeed.',
      BATCH_DELIMITER,
      'This is just random text with no speaker labels.',
    ].join('\n');

    const requests = [
      makeRequest({ npc1: alice, npc2: bob }),
      makeRequest({ npc1: alice, npc2: carol }),
    ];

    const result = parseBatchResponse(response, requests);

    expect(result.parsed.length).toBe(1);
    expect(result.parsed[0].index).toBe(0);
    expect(result.failures.length).toBe(1);
    expect(result.failures[0].index).toBe(1);
    expect(result.failures[0].reason).toBe('no_parseable_lines');
  });

  it('handles single exchange as failure (too_few_exchanges)', () => {
    const response = [
      'Alice: Hello Bob!',
      BATCH_DELIMITER,
      'Alice: Just one line.',
    ].join('\n');

    const requests = [
      makeRequest({ npc1: alice, npc2: bob }),
      makeRequest({ npc1: alice, npc2: carol }),
    ];

    const result = parseBatchResponse(response, requests);

    // First section has only 1 exchange (just Alice), second also 1 line
    expect(result.failures.length).toBe(2);
    expect(result.failures[0].reason).toBe('too_few_exchanges');
    expect(result.failures[1].reason).toBe('too_few_exchanges');
  });

  it('handles empty response', () => {
    const requests = [makeRequest({ npc1: alice, npc2: bob })];
    const result = parseBatchResponse('', requests);

    expect(result.parsed.length).toBe(0);
    expect(result.failures.length).toBe(1);
    expect(result.failures[0].reason).toBe('no_section_in_response');
  });

  it('salvages valid conversations from a partially malformed batch', () => {
    const response = [
      'garbage text no speakers',
      BATCH_DELIMITER,
      'Alice: Hello Carol!',
      'Carol: Hi there!',
      'Alice: Beautiful weather.',
      'Carol: It really is.',
      BATCH_DELIMITER,
      'more garbage',
    ].join('\n');

    const requests = [
      makeRequest({ npc1: alice, npc2: bob }),
      makeRequest({ npc1: alice, npc2: carol }),
      makeRequest({ npc1: bob, npc2: carol }),
    ];

    const result = parseBatchResponse(response, requests);

    expect(result.parsed.length).toBe(1);
    expect(result.parsed[0].index).toBe(1);
    expect(result.parsed[0].exchanges.length).toBe(4);
    expect(result.failures.length).toBe(2);
  });
});

// ── Batch rate limiting ─────────────────────────────────────────────

describe('batch rate limiting', () => {
  beforeEach(() => {
    resetBatchRateLimiting();
  });

  it('allows up to MAX_BATCHES_PER_WORLD concurrent batches', () => {
    expect(acquireBatchSlot('world-1')).toBe(true);
    expect(acquireBatchSlot('world-1')).toBe(true);
    expect(getActiveBatchCount('world-1')).toBe(MAX_BATCHES_PER_WORLD);
    // Third should be rejected
    expect(acquireBatchSlot('world-1')).toBe(false);
  });

  it('tracks separate worlds independently', () => {
    expect(acquireBatchSlot('world-1')).toBe(true);
    expect(acquireBatchSlot('world-1')).toBe(true);
    expect(acquireBatchSlot('world-2')).toBe(true);
    expect(getActiveBatchCount('world-1')).toBe(2);
    expect(getActiveBatchCount('world-2')).toBe(1);
  });

  it('releases slots correctly', () => {
    acquireBatchSlot('world-1');
    acquireBatchSlot('world-1');
    releaseBatchSlot('world-1');
    expect(getActiveBatchCount('world-1')).toBe(1);
    expect(acquireBatchSlot('world-1')).toBe(true);
  });

  it('reset clears all slots', () => {
    acquireBatchSlot('world-1');
    acquireBatchSlot('world-2');
    resetBatchRateLimiting();
    expect(getActiveBatchCount('world-1')).toBe(0);
    expect(getActiveBatchCount('world-2')).toBe(0);
  });
});

// ── batchGenerateConversations ──────────────────────────────────────

describe('batchGenerateConversations', () => {
  const alice = makeNpc({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
  const bob = makeNpc({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
  const carol = makeNpc({ id: 'npc-3', firstName: 'Carol', lastName: 'White' });

  beforeEach(() => {
    resetConversationMetrics();
    resetBatchRateLimiting();
  });

  it('generates multiple conversations from a single LLM call', async () => {
    const response = [
      'Alice: Hello Bob!',
      'Bob: Hi Alice!',
      'Alice: Nice day.',
      'Bob: Indeed it is.',
      BATCH_DELIMITER,
      'Alice: Good morning Carol!',
      'Carol: Morning Alice!',
      'Alice: How are you?',
      'Carol: Very well, thanks.',
    ].join('\n');

    const llm = createMockLLMProvider(response);
    const requests = [
      makeRequest({ npc1: alice, npc2: bob, topic: 'weather' }),
      makeRequest({ npc1: alice, npc2: carol, topic: 'work' }),
    ];

    const result = await batchGenerateConversations(requests, 'world-1', 'Testville', ['French'], llm);

    expect(result.conversations.length).toBe(2);
    expect(result.failures.length).toBe(0);
    expect(result.conversations[0].exchanges.length).toBe(4);
    expect(result.conversations[1].exchanges.length).toBe(4);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('returns empty result for empty request list', async () => {
    const llm = createMockLLMProvider('');
    const result = await batchGenerateConversations([], 'world-1', 'Testville', [], llm);

    expect(result.conversations.length).toBe(0);
    expect(result.failures.length).toBe(0);
    expect(result.durationMs).toBe(0);
  });

  it('handles LLM error gracefully', async () => {
    const llm = createErrorLLMProvider();
    const requests = [
      makeRequest({ npc1: alice, npc2: bob }),
      makeRequest({ npc1: alice, npc2: carol }),
    ];

    const result = await batchGenerateConversations(requests, 'world-1', 'Testville', [], llm);

    expect(result.conversations.length).toBe(0);
    expect(result.failures.length).toBe(2);
    expect(result.failures[0].reason).toBe('llm_error');
  });

  it('handles partial failures — salvages valid conversations', async () => {
    const response = [
      'Alice: Hello Bob!',
      'Bob: Hi Alice!',
      'Alice: Nice weather.',
      'Bob: Agreed!',
      BATCH_DELIMITER,
      'random garbage no speakers',
    ].join('\n');

    const llm = createMockLLMProvider(response);
    const requests = [
      makeRequest({ npc1: alice, npc2: bob, topic: 'weather' }),
      makeRequest({ npc1: alice, npc2: carol, topic: 'work' }),
    ];

    const result = await batchGenerateConversations(requests, 'world-1', 'Testville', [], llm);

    expect(result.conversations.length).toBe(1);
    expect(result.failures.length).toBe(1);
    expect(result.conversations[0].request.topic).toBe('weather');
  });

  it('calculates relationship deltas for parsed conversations', async () => {
    const response = [
      'Alice: Hello Bob!',
      'Bob: Hi Alice!',
      'Alice: Nice day.',
      'Bob: Indeed it is.',
    ].join('\n');

    const llm = createMockLLMProvider(response);
    const requests = [makeRequest({ npc1: alice, npc2: bob, topic: 'daily_greeting' })];

    const result = await batchGenerateConversations(requests, 'world-1', 'Testville', [], llm);

    expect(result.conversations[0].relationshipDelta).toBeDefined();
    expect(typeof result.conversations[0].relationshipDelta.friendshipChange).toBe('number');
    expect(typeof result.conversations[0].relationshipDelta.trustChange).toBe('number');
  });

  it('uses FAST model tier', async () => {
    let capturedOptions: StreamCompletionOptions | undefined;
    const llm: IStreamingLLMProvider = {
      name: 'mock-capture',
      streamCompletion: async function* (_prompt: string, _context: ConversationContext, options?: StreamCompletionOptions) {
        capturedOptions = options;
        yield 'Alice: Hi!\nBob: Hello!\nAlice: How are you?\nBob: Good.';
      },
    };

    const requests = [makeRequest({ npc1: alice, npc2: bob })];
    await batchGenerateConversations(requests, 'world-1', 'Testville', [], llm);

    expect(capturedOptions?.modelTier).toBe('fast');
  });

  it('scales maxTokens by number of requests', async () => {
    let capturedOptions: StreamCompletionOptions | undefined;
    const llm: IStreamingLLMProvider = {
      name: 'mock-capture',
      streamCompletion: async function* (_prompt: string, _context: ConversationContext, options?: StreamCompletionOptions) {
        capturedOptions = options;
        yield 'Alice: Hi!\nBob: Hello!';
      },
    };

    const requests = [
      makeRequest({ npc1: alice, npc2: bob }),
      makeRequest({ npc1: alice, npc2: carol }),
      makeRequest({ npc1: bob, npc2: carol }),
    ];
    await batchGenerateConversations(requests, 'world-1', 'Testville', [], llm);

    // 512 * 3 = 1536
    expect(capturedOptions?.maxTokens).toBe(512 * 3);
  });
});

// ── replenishPoolBatch ──────────────────────────────────────────────

describe('replenishPoolBatch', () => {
  it('fills pool using batch generation function', async () => {
    const pool = new NpcConversationPool({ capacity: 50, replenishThreshold: 10 });
    let callCount = 0;

    const result = await replenishPoolBatch({
      pool,
      worldId: 'world-1',
      batchSize: 3,
      targetCount: 6,
      batchGenerateFn: async (count: number) => {
        callCount++;
        return Array.from({ length: count }, (_, i) => ({
          conversationId: `conv-${callCount}-${i}`,
          npc1Id: 'npc-1',
          npc2Id: 'npc-2',
          topic: 'weather',
          exchanges: [
            { speakerId: 'npc-1', speakerName: 'Alice Smith', text: 'Hi', timestamp: Date.now() },
            { speakerId: 'npc-2', speakerName: 'Bob Jones', text: 'Hello', timestamp: Date.now() + 1000 },
          ],
          relationshipDelta: { friendshipChange: 0.02, trustChange: 0.01, romanceSpark: 0 },
          languageUsed: 'English',
          generatedAt: Date.now(),
        } as PooledConversation));
      },
    });

    expect(result).toBe(6);
    expect(pool.size('world-1')).toBe(6);
    // Should have been called twice: once for 3, once for 3
    expect(callCount).toBe(2);
  });

  it('stops when batch produces all nulls', async () => {
    const pool = new NpcConversationPool({ capacity: 50 });
    let callCount = 0;

    const result = await replenishPoolBatch({
      pool,
      worldId: 'world-1',
      batchSize: 3,
      targetCount: 10,
      batchGenerateFn: async (count: number) => {
        callCount++;
        return Array.from({ length: count }, () => null);
      },
    });

    expect(result).toBe(0);
    expect(callCount).toBe(1); // Stops after first all-null batch
  });

  it('stops when pool is full', async () => {
    const pool = new NpcConversationPool({ capacity: 5 });

    const result = await replenishPoolBatch({
      pool,
      worldId: 'world-1',
      batchSize: 3,
      targetCount: 10,
      batchGenerateFn: async (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
          conversationId: `conv-${i}-${Date.now()}`,
          npc1Id: 'npc-1',
          npc2Id: 'npc-2',
          topic: 'weather',
          exchanges: [
            { speakerId: 'npc-1', speakerName: 'Alice', text: 'Hi', timestamp: Date.now() },
            { speakerId: 'npc-2', speakerName: 'Bob', text: 'Hey', timestamp: Date.now() + 1000 },
          ],
          relationshipDelta: { friendshipChange: 0, trustChange: 0, romanceSpark: 0 },
          languageUsed: 'English',
          generatedAt: Date.now(),
        } as PooledConversation));
      },
    });

    expect(result).toBe(5);
    expect(pool.size('world-1')).toBe(5);
  });

  it('handles batch generation errors gracefully', async () => {
    const pool = new NpcConversationPool({ capacity: 50 });

    const result = await replenishPoolBatch({
      pool,
      worldId: 'world-1',
      targetCount: 10,
      batchGenerateFn: async () => {
        throw new Error('batch failed');
      },
    });

    expect(result).toBe(0);
    expect(pool.size('world-1')).toBe(0);
  });

  it('returns 0 when pool already at target', async () => {
    const pool = new NpcConversationPool({ capacity: 50 });
    // Pre-fill
    for (let i = 0; i < 10; i++) {
      pool.add('world-1', {
        conversationId: `conv-${i}`,
        npc1Id: 'npc-1',
        npc2Id: 'npc-2',
        topic: 'weather',
        exchanges: [],
        relationshipDelta: { friendshipChange: 0, trustChange: 0, romanceSpark: 0 },
        languageUsed: 'English',
        generatedAt: Date.now(),
      } as PooledConversation);
    }

    const result = await replenishPoolBatch({
      pool,
      worldId: 'world-1',
      targetCount: 10,
      batchGenerateFn: async () => [],
    });

    expect(result).toBe(0);
  });
});
