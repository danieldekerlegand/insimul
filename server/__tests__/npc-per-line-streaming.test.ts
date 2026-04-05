/**
 * Tests for US-006: Per-line streaming for NPC-NPC conversations
 *
 * Covers: parseSingleLine(), incremental onLineReady callback during streaming,
 * npc_npc_first_line metric stage, full accumulation path preserved.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseSingleLine,
  parseLlmConversation,
  initiateConversation,
} from '../services/conversation/npc-conversation-engine';
import type { ConversationExchange } from '../services/conversation/npc-conversation-engine';
import type { Character } from '@shared/schema';

// ── Helpers ──────────────────────────────────────────────────────────

function makeNpc(overrides: Partial<Character> = {}): Character {
  return {
    id: overrides.id ?? `npc-${Math.random().toString(36).slice(2, 8)}`,
    firstName: overrides.firstName ?? 'Alice',
    lastName: overrides.lastName ?? 'Smith',
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

// ── parseSingleLine ─────────────────────────────────────────────────

describe('parseSingleLine', () => {
  const npc1 = makeNpc({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
  const npc2 = makeNpc({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });

  it('parses a line starting with npc1 name', () => {
    const result = parseSingleLine('Alice: Hello there!', npc1, npc2);
    expect(result).toEqual({
      speakerId: 'npc-1',
      speakerName: 'Alice Smith',
      text: 'Hello there!',
    });
  });

  it('parses a line starting with npc2 name', () => {
    const result = parseSingleLine('Bob: Good morning!', npc1, npc2);
    expect(result).toEqual({
      speakerId: 'npc-2',
      speakerName: 'Bob Jones',
      text: 'Good morning!',
    });
  });

  it('strips surrounding quotes', () => {
    const result = parseSingleLine('Alice: "How are you?"', npc1, npc2);
    expect(result).toEqual({
      speakerId: 'npc-1',
      speakerName: 'Alice Smith',
      text: 'How are you?',
    });
  });

  it('returns null for unrecognized speaker', () => {
    const result = parseSingleLine('Charlie: Hey!', npc1, npc2);
    expect(result).toBeNull();
  });

  it('returns null for empty dialogue', () => {
    const result = parseSingleLine('Alice:', npc1, npc2);
    expect(result).toBeNull();
  });

  it('returns null for empty line', () => {
    const result = parseSingleLine('', npc1, npc2);
    expect(result).toBeNull();
  });

  it('trims whitespace from line', () => {
    const result = parseSingleLine('  Bob:   Bonjour!  ', npc1, npc2);
    expect(result).toEqual({
      speakerId: 'npc-2',
      speakerName: 'Bob Jones',
      text: 'Bonjour!',
    });
  });

  it('handles only opening quote without closing', () => {
    const result = parseSingleLine('Alice: "Hello', npc1, npc2);
    expect(result).toEqual({
      speakerId: 'npc-1',
      speakerName: 'Alice Smith',
      text: '"Hello',
    });
  });
});

// ── onLineReady callback integration ─────────────────────────────────

describe('initiateConversation with onLineReady', () => {
  const npc1 = makeNpc({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
  const npc2 = makeNpc({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });

  function makeMockLLM(response: string) {
    // Simulate streaming by yielding one character at a time
    return {
      streamCompletion: async function* (_msg: string, _ctx: any, _opts: any) {
        for (const char of response) {
          yield char;
        }
      },
    };
  }

  function makeMockLLMChunked(chunks: string[]) {
    return {
      streamCompletion: async function* (_msg: string, _ctx: any, _opts: any) {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    };
  }

  function makeMockStorage() {
    return {
      getCharacter: vi.fn(async (id: string) => {
        if (id === 'npc-1') return npc1;
        if (id === 'npc-2') return npc2;
        return null;
      }),
      getWorld: vi.fn(async () => ({
        id: 'world-1',
        name: 'Test World',
      })),
      getWorldLanguagesByWorld: vi.fn(async () => [
        { name: 'English' },
      ]),
    } as any;
  }

  it('calls onLineReady for each complete line as it streams', async () => {
    const llmResponse = 'Alice: Bonjour!\nBob: Salut!\nAlice: Comment ça va?\n';
    const onLineReady = vi.fn();

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLM(llmResponse) as any,
      storageOverride: makeMockStorage(),
      onLineReady,
    });

    expect(onLineReady).toHaveBeenCalledTimes(3);
    expect(onLineReady).toHaveBeenCalledWith('Alice Smith', 'npc-1', 'Bonjour!', 0);
    expect(onLineReady).toHaveBeenCalledWith('Bob Jones', 'npc-2', 'Salut!', 1);
    expect(onLineReady).toHaveBeenCalledWith('Alice Smith', 'npc-1', 'Comment ça va?', 2);

    // Full accumulation path still works
    expect(result.exchanges).toHaveLength(3);
    expect(result.exchanges[0].text).toBe('Bonjour!');
  });

  it('handles lines without trailing newline (flush)', async () => {
    const llmResponse = 'Alice: Hello!\nBob: Hi there!'; // no trailing newline
    const onLineReady = vi.fn();

    await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLM(llmResponse) as any,
      storageOverride: makeMockStorage(),
      onLineReady,
    });

    expect(onLineReady).toHaveBeenCalledTimes(2);
    expect(onLineReady).toHaveBeenCalledWith('Alice Smith', 'npc-1', 'Hello!', 0);
    expect(onLineReady).toHaveBeenCalledWith('Bob Jones', 'npc-2', 'Hi there!', 1);
  });

  it('skips non-speaker lines in onLineReady', async () => {
    const llmResponse = 'Alice: Bonjour!\n(They smile at each other)\nBob: Salut!\n';
    const onLineReady = vi.fn();

    await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLM(llmResponse) as any,
      storageOverride: makeMockStorage(),
      onLineReady,
    });

    // Only speaker lines trigger callback
    expect(onLineReady).toHaveBeenCalledTimes(2);
    expect(onLineReady).toHaveBeenCalledWith('Alice Smith', 'npc-1', 'Bonjour!', 0);
    expect(onLineReady).toHaveBeenCalledWith('Bob Jones', 'npc-2', 'Salut!', 1);
  });

  it('works correctly with chunked streaming', async () => {
    // Simulate realistic chunk boundaries that split across lines
    const chunks = [
      'Alice: Bon',
      'jour!\nBob: ',
      'Salut!\nAlice: Ça va',
      '?\n',
    ];
    const onLineReady = vi.fn();

    await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLMChunked(chunks) as any,
      storageOverride: makeMockStorage(),
      onLineReady,
    });

    expect(onLineReady).toHaveBeenCalledTimes(3);
    expect(onLineReady).toHaveBeenCalledWith('Alice Smith', 'npc-1', 'Bonjour!', 0);
    expect(onLineReady).toHaveBeenCalledWith('Bob Jones', 'npc-2', 'Salut!', 1);
    expect(onLineReady).toHaveBeenCalledWith('Alice Smith', 'npc-1', 'Ça va?', 2);
  });

  it('preserves full accumulation path for relationship updates', async () => {
    const llmResponse = 'Alice: Hello!\nBob: Goodbye!\n';
    const onLineReady = vi.fn();

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLM(llmResponse) as any,
      storageOverride: makeMockStorage(),
      onLineReady,
    });

    // parseLlmConversation still produces full exchange list
    expect(result.exchanges).toHaveLength(2);
    expect(result.relationshipDelta).toBeDefined();
    expect(typeof result.relationshipDelta.friendshipChange).toBe('number');
  });

  it('works without onLineReady callback (backward compatible)', async () => {
    const llmResponse = 'Alice: Hello!\nBob: Hi!\n';

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLM(llmResponse) as any,
      storageOverride: makeMockStorage(),
      // No onLineReady — should not throw
    });

    expect(result.exchanges).toHaveLength(2);
  });

  it('increments lineIndex correctly across lines', async () => {
    const llmResponse = 'Alice: One\nBob: Two\nAlice: Three\nBob: Four\n';
    const lineIndices: number[] = [];
    const onLineReady = vi.fn((_speaker, _id, _line, idx) => {
      lineIndices.push(idx);
    });

    await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLM(llmResponse) as any,
      storageOverride: makeMockStorage(),
      onLineReady,
    });

    expect(lineIndices).toEqual([0, 1, 2, 3]);
  });

  it('falls back to template if LLM produces < 2 exchanges', async () => {
    const llmResponse = 'Alice: Just one line.\n';
    const onLineReady = vi.fn();

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      llmProvider: makeMockLLM(llmResponse) as any,
      storageOverride: makeMockStorage(),
      onLineReady,
    });

    // onLineReady still fires for the streamed line
    expect(onLineReady).toHaveBeenCalledTimes(1);
    // But result uses fallback (>= 2 exchanges)
    expect(result.exchanges.length).toBeGreaterThanOrEqual(2);
  });
});

// ── MetricStage type check ──────────────────────────────────────────

describe('npc_npc_first_line metric', () => {
  it('is a valid MetricStage value', async () => {
    // Import the type to verify it compiles
    const { getConversationMetrics } = await import(
      '../services/conversation/conversation-metrics'
    );
    const metrics = getConversationMetrics();

    // Should not throw — npc_npc_first_line is a valid stage
    metrics.record('npc_npc_first_line', 150);
    const stats = metrics.getStageStats('npc_npc_first_line');
    expect(stats.count).toBe(1);
    expect(stats.p50).toBe(150);
  });
});
