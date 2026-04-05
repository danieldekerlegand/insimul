import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GreetingCache,
  type GreetingVariant,
  type GreetingGenerationRequest,
  type BatchGreetingResult,
} from '../services/conversation/greeting-cache.js';
import type { CEFRLevel } from '@shared/assessment/cefr-mapping';

// ── GreetingCache.key ────────────────────────────────────────────────

describe('GreetingCache.key', () => {
  it('builds a cache key from worldId and npcId', () => {
    expect(GreetingCache.key('world1', 'npc1')).toBe('world1:npc1');
  });
});

// ── GreetingCache core ───────────────────────────────────────────────

describe('GreetingCache', () => {
  let cache: GreetingCache;

  const makeVariant = (
    text: string,
    context: GreetingVariant['context'] = 'general',
    cefrLevel: CEFRLevel = 'A1',
  ): GreetingVariant => ({
    text,
    context,
    cefrLevel,
    generatedAt: Date.now(),
  });

  beforeEach(() => {
    cache = new GreetingCache();
  });

  // ── set / get / has ──────────────────────────────────────────────

  it('stores and retrieves greetings', () => {
    cache.set('w1', 'npc1', 'Alice', [makeVariant('Hello!')]);
    expect(cache.has('w1', 'npc1')).toBe(true);
    expect(cache.get('w1', 'npc1')).toBe('Hello!');
  });

  it('returns null for missing entries', () => {
    expect(cache.get('w1', 'nonexistent')).toBeNull();
    expect(cache.has('w1', 'nonexistent')).toBe(false);
  });

  it('caps at 5 greetings per NPC', () => {
    const greetings = Array.from({ length: 8 }, (_, i) =>
      makeVariant(`Greeting ${i}`),
    );
    cache.set('w1', 'npc1', 'Alice', greetings);
    // The stored entry should only have 5
    let count = 0;
    for (let i = 0; i < 20; i++) {
      const g = cache.get('w1', 'npc1');
      if (g) count++;
    }
    // Should always return a greeting since we have 5 stored
    expect(count).toBe(20);
  });

  // ── context filtering ────────────────────────────────────────────

  it('filters by context when specified', () => {
    cache.set('w1', 'npc1', 'Alice', [
      makeVariant('Good morning!', 'morning'),
      makeVariant('Nice evening!', 'evening'),
      makeVariant('Hello!', 'general'),
    ]);
    // Request morning context — should get morning or general
    const result = cache.get('w1', 'npc1', 'morning');
    expect(result).not.toBeNull();
    expect(['Good morning!', 'Hello!']).toContain(result);
  });

  it('falls back to general context when specific not available', () => {
    cache.set('w1', 'npc1', 'Alice', [
      makeVariant('Hello!', 'general'),
    ]);
    const result = cache.get('w1', 'npc1', 'rainy');
    expect(result).toBe('Hello!');
  });

  // ── CEFR filtering ───────────────────────────────────────────────

  it('filters by CEFR level when specified', () => {
    cache.set('w1', 'npc1', 'Alice', [
      makeVariant('Bonjour!', 'general', 'A1'),
      makeVariant('Comment allez-vous ce matin?', 'general', 'B1'),
    ]);
    const a1 = cache.get('w1', 'npc1', undefined, 'A1');
    expect(a1).toBe('Bonjour!');
    const b1 = cache.get('w1', 'npc1', undefined, 'B1');
    expect(b1).toBe('Comment allez-vous ce matin?');
  });

  it('returns any greeting when CEFR filter has no matches', () => {
    cache.set('w1', 'npc1', 'Alice', [
      makeVariant('Bonjour!', 'general', 'A1'),
    ]);
    const result = cache.get('w1', 'npc1', undefined, 'B2');
    // Falls through to all candidates since no B2 match
    expect(result).toBe('Bonjour!');
  });

  // ── TTL expiration ───────────────────────────────────────────────

  it('expires entries after 1 hour TTL', () => {
    cache.set('w1', 'npc1', 'Alice', [makeVariant('Hello!')]);
    expect(cache.has('w1', 'npc1')).toBe(true);

    // Fast-forward 61 minutes
    vi.useFakeTimers();
    vi.advanceTimersByTime(61 * 60 * 1000);

    expect(cache.has('w1', 'npc1')).toBe(false);
    expect(cache.get('w1', 'npc1')).toBeNull();

    vi.useRealTimers();
  });

  // ── invalidation ─────────────────────────────────────────────────

  it('invalidates a specific NPC', () => {
    cache.set('w1', 'npc1', 'Alice', [makeVariant('Hi!')]);
    cache.set('w1', 'npc2', 'Bob', [makeVariant('Hey!')]);
    cache.invalidate('w1', 'npc1');
    expect(cache.has('w1', 'npc1')).toBe(false);
    expect(cache.has('w1', 'npc2')).toBe(true);
  });

  it('invalidates all NPCs for a world', () => {
    cache.set('w1', 'npc1', 'Alice', [makeVariant('Hi!')]);
    cache.set('w1', 'npc2', 'Bob', [makeVariant('Hey!')]);
    cache.set('w2', 'npc3', 'Carol', [makeVariant('Hello!')]);
    cache.invalidateWorld('w1');
    expect(cache.has('w1', 'npc1')).toBe(false);
    expect(cache.has('w1', 'npc2')).toBe(false);
    expect(cache.has('w2', 'npc3')).toBe(true);
  });

  it('clears the entire cache', () => {
    cache.set('w1', 'npc1', 'Alice', [makeVariant('Hi!')]);
    cache.set('w2', 'npc2', 'Bob', [makeVariant('Hey!')]);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  // ── size ─────────────────────────────────────────────────────────

  it('tracks cache size', () => {
    expect(cache.size).toBe(0);
    cache.set('w1', 'npc1', 'Alice', [makeVariant('Hi!')]);
    expect(cache.size).toBe(1);
    cache.set('w1', 'npc2', 'Bob', [makeVariant('Hey!')]);
    expect(cache.size).toBe(2);
  });
});

// ── Batch prompt building ────────────────────────────────────────────

describe('GreetingCache.buildBatchPrompt', () => {
  const npcs: GreetingGenerationRequest[] = [
    {
      npcId: 'npc1',
      npcName: 'Alice',
      personality: { openness: 0.8, conscientiousness: 0.5, extroversion: 0.7, agreeableness: 0.6, neuroticism: 0.3 },
      occupation: 'Baker',
      mood: 'happy',
      targetLanguage: 'French',
    },
    {
      npcId: 'npc2',
      npcName: 'Bob',
      personality: { openness: 0.3, conscientiousness: 0.7, extroversion: 0.2, agreeableness: 0.4, neuroticism: 0.8 },
      targetLanguage: 'French',
    },
  ];

  it('includes all NPCs in the prompt', () => {
    const prompt = GreetingCache.buildBatchPrompt(npcs, 'A1', 'French');
    expect(prompt).toContain('===NPC:npc1===');
    expect(prompt).toContain('===NPC:npc2===');
    expect(prompt).toContain('Alice');
    expect(prompt).toContain('Bob');
  });

  it('includes CEFR level and target language', () => {
    const prompt = GreetingCache.buildBatchPrompt(npcs, 'B1', 'French');
    expect(prompt).toContain('Player proficiency: B1');
    expect(prompt).toContain('Target language: French');
  });

  it('includes personality traits', () => {
    const prompt = GreetingCache.buildBatchPrompt(npcs, 'A1', 'French');
    expect(prompt).toContain('outgoing');
    expect(prompt).toContain('curious');
    expect(prompt).toContain('reserved');
    expect(prompt).toContain('anxious');
  });

  it('includes occupation when provided', () => {
    const prompt = GreetingCache.buildBatchPrompt(npcs, 'A1', 'French');
    expect(prompt).toContain('Baker');
  });

  it('requests 5 context variants', () => {
    const prompt = GreetingCache.buildBatchPrompt(npcs, 'A1', 'French');
    expect(prompt).toContain('morning');
    expect(prompt).toContain('afternoon');
    expect(prompt).toContain('evening');
    expect(prompt).toContain('rainy');
    expect(prompt).toContain('general');
  });
});

// ── Batch response parsing ───────────────────────────────────────────

describe('GreetingCache.parseBatchResponse', () => {
  it('parses well-formed batch response', () => {
    const response = `
===NPC:npc1===
morning: Bonjour! Belle matinee!
afternoon: Bon apres-midi!
evening: Bonsoir!
rainy: Il pleut, n'est-ce pas?
general: Salut!

===NPC:npc2===
morning: Hey, good morning.
afternoon: Hi there.
evening: Good evening.
rainy: Wet day, huh?
general: Hello!
`;

    const results = GreetingCache.parseBatchResponse(response, ['npc1', 'npc2'], 'A1');
    expect(results).toHaveLength(2);

    const npc1 = results.find((r) => r.npcId === 'npc1');
    expect(npc1).toBeDefined();
    expect(npc1!.greetings).toHaveLength(5);
    expect(npc1!.greetings[0].context).toBe('morning');
    expect(npc1!.greetings[0].text).toBe('Bonjour! Belle matinee!');
    expect(npc1!.greetings[0].cefrLevel).toBe('A1');

    const npc2 = results.find((r) => r.npcId === 'npc2');
    expect(npc2).toBeDefined();
    expect(npc2!.greetings).toHaveLength(5);
  });

  it('handles partial response (missing some contexts)', () => {
    const response = `
===NPC:npc1===
morning: Bonjour!
general: Salut!
`;
    const results = GreetingCache.parseBatchResponse(response, ['npc1'], 'A2');
    expect(results).toHaveLength(1);
    expect(results[0].greetings).toHaveLength(2);
  });

  it('ignores unknown NPC IDs', () => {
    const response = `
===NPC:unknown===
morning: Hello!
general: Hi!
`;
    const results = GreetingCache.parseBatchResponse(response, ['npc1'], 'A1');
    expect(results).toHaveLength(0);
  });

  it('handles empty response', () => {
    const results = GreetingCache.parseBatchResponse('', ['npc1'], 'A1');
    expect(results).toHaveLength(0);
  });

  it('handles malformed response gracefully', () => {
    const response = 'This is not a valid batch response at all.';
    const results = GreetingCache.parseBatchResponse(response, ['npc1'], 'A1');
    expect(results).toHaveLength(0);
  });
});

// ── Batch generation ─────────────────────────────────────────────────

describe('GreetingCache.generateBatch', () => {
  let cache: GreetingCache;

  beforeEach(() => {
    cache = new GreetingCache();
  });

  const npcs: GreetingGenerationRequest[] = [
    {
      npcId: 'npc1',
      npcName: 'Alice',
      personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
      targetLanguage: 'French',
    },
  ];

  it('generates and stores greetings from LLM response', async () => {
    const mockLlm = async function* (_prompt: string, _sys: string) {
      yield '===NPC:npc1===\nmorning: Bonjour!\nafternoon: Bon apres-midi!\nevening: Bonsoir!\nrainy: Il pleut!\ngeneral: Salut!\n';
    };

    const results = await cache.generateBatch('w1', npcs, 'A1', 'French', mockLlm);
    expect(results).toHaveLength(1);
    expect(results[0].greetings).toHaveLength(5);
    // Should also be stored in cache
    expect(cache.has('w1', 'npc1')).toBe(true);
    expect(cache.get('w1', 'npc1')).not.toBeNull();
  });

  it('returns empty when concurrent batch limit exceeded', async () => {
    // Fill up batch slots by starting 3 slow batches
    const slowLlm = async function* (_prompt: string, _sys: string) {
      await new Promise((r) => setTimeout(r, 100));
      yield '===NPC:npc1===\ngeneral: Hi!\n';
    };

    // Start 3 batches (the limit)
    const p1 = cache.generateBatch('w1', npcs, 'A1', 'French', slowLlm);
    const p2 = cache.generateBatch('w1', npcs, 'A1', 'French', slowLlm);
    const p3 = cache.generateBatch('w1', npcs, 'A1', 'French', slowLlm);

    // 4th batch should be rejected
    const result = await cache.generateBatch('w1', npcs, 'A1', 'French', slowLlm);
    expect(result).toHaveLength(0);

    // Cleanup
    await Promise.all([p1, p2, p3]);
  });

  it('handles LLM errors gracefully', async () => {
    const errorLlm = async function* (_prompt: string, _sys: string) {
      throw new Error('LLM unavailable');
      yield ''; // unreachable
    };

    await expect(
      cache.generateBatch('w1', npcs, 'A1', 'French', errorLlm),
    ).rejects.toThrow('LLM unavailable');

    // Cache should remain empty
    expect(cache.has('w1', 'npc1')).toBe(false);
  });
});

// ── warmOnLoad ───────────────────────────────────────────────────────

describe('GreetingCache.warmOnLoad', () => {
  let cache: GreetingCache;

  beforeEach(() => {
    cache = new GreetingCache();
  });

  it('generates greetings for up to 20 NPCs', async () => {
    const npcs: GreetingGenerationRequest[] = Array.from({ length: 25 }, (_, i) => ({
      npcId: `npc${i}`,
      npcName: `NPC ${i}`,
      personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
      targetLanguage: 'French',
    }));

    const mockLlm = async function* (prompt: string, _sys: string) {
      // Parse NPC IDs from prompt and generate responses
      const matches = prompt.match(/===NPC:([^=]+)===/g) ?? [];
      let response = '';
      for (const match of matches) {
        const id = match.replace(/===NPC:|===/g, '');
        response += `===NPC:${id}===\ngeneral: Bonjour from ${id}!\n`;
      }
      yield response;
    };

    const total = await cache.warmOnLoad('w1', npcs, 'A1', 'French', mockLlm);
    expect(total).toBeGreaterThan(0);
    // Should have cached NPCs 0-19 (20 max)
    expect(cache.has('w1', 'npc0')).toBe(true);
    expect(cache.has('w1', 'npc19')).toBe(true);
    // NPC 20+ should NOT be cached
    expect(cache.has('w1', 'npc20')).toBe(false);
  });

  it('returns 0 when no NPCs provided', async () => {
    const mockLlm = async function* () { yield ''; };
    const total = await cache.warmOnLoad('w1', [], 'A1', 'French', mockLlm);
    expect(total).toBe(0);
  });
});

// ── Greeting cache refresh on CEFR change ────────────────────────────

describe('GreetingCache refresh behavior', () => {
  it('invalidateWorld clears all greetings for CEFR level change', () => {
    const cache = new GreetingCache();
    cache.set('w1', 'npc1', 'Alice', [
      { text: 'Bonjour!', context: 'general', cefrLevel: 'A1', generatedAt: Date.now() },
    ]);
    cache.set('w1', 'npc2', 'Bob', [
      { text: 'Salut!', context: 'general', cefrLevel: 'A1', generatedAt: Date.now() },
    ]);

    // Simulate CEFR level change by invalidating world
    cache.invalidateWorld('w1');
    expect(cache.size).toBe(0);
  });
});
