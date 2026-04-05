/**
 * Tests for US-010: Speculative generation for likely opening messages
 *
 * Covers: SpeculativeResponseCache get/set, TTL expiry, LRU eviction,
 * canonicalization, CEFR-based openings, hit rate tracking, generation,
 * invalidation, and NPC+CEFR scoping.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SpeculativeResponseCache,
  canonicalizeMessage,
  speculativeCache,
} from '../services/conversation/speculative-cache';
import type { SpeculativeResponse } from '../services/conversation/speculative-cache';

// ── Helpers ──────────────────────────────────────────────────────────

function makeResponse(text: string, timestampOffset = 0): SpeculativeResponse {
  return {
    text,
    timestamp: Date.now() + timestampOffset,
  };
}

function makeResponseWithAudio(text: string, audioSize = 100): SpeculativeResponse {
  return {
    text,
    audio: new Uint8Array(audioSize),
    timestamp: Date.now(),
  };
}

// ── canonicalizeMessage ──────────────────────────────────────────────

describe('canonicalizeMessage', () => {
  it('lowercases and trims', () => {
    expect(canonicalizeMessage('  Hello  ')).toBe('hello');
  });

  it('strips punctuation', () => {
    expect(canonicalizeMessage('Hello!')).toBe('hello');
    expect(canonicalizeMessage('Hello?')).toBe('hello');
    expect(canonicalizeMessage('Hello...')).toBe('hello');
    expect(canonicalizeMessage("What's up?")).toBe('whats up');
  });

  it('handles French greetings', () => {
    expect(canonicalizeMessage('Bonjour!')).toBe('bonjour');
    expect(canonicalizeMessage('Comment allez-vous?')).toBe('comment allezvous');
  });

  it('handles empty string', () => {
    expect(canonicalizeMessage('')).toBe('');
  });
});

// ── SpeculativeResponseCache ─────────────────────────────────────────

describe('SpeculativeResponseCache', () => {
  let cache: SpeculativeResponseCache;

  beforeEach(() => {
    cache = new SpeculativeResponseCache();
  });

  // ── Basic get/set ────────────────────────────────────────────────

  describe('get/set', () => {
    it('returns null for cache miss', () => {
      expect(cache.get('w1', 'npc1', 'hello')).toBeNull();
    });

    it('returns cached response for matching canonical message', () => {
      const response = makeResponse('Bonjour! Je suis Marie.');
      cache.set('w1', 'npc1', 'hello', response);

      const result = cache.get('w1', 'npc1', 'hello');
      expect(result).not.toBeNull();
      expect(result!.text).toBe('Bonjour! Je suis Marie.');
    });

    it('canonicalizes player message on lookup', () => {
      const response = makeResponse('Bonjour!');
      cache.set('w1', 'npc1', 'hello', response);

      // Lookup with different casing/punctuation
      const result = cache.get('w1', 'npc1', 'Hello!');
      expect(result).not.toBeNull();
      expect(result!.text).toBe('Bonjour!');
    });

    it('stores and retrieves audio data', () => {
      const response = makeResponseWithAudio('Bonjour!', 256);
      cache.set('w1', 'npc1', 'hello', response);

      const result = cache.get('w1', 'npc1', 'hello');
      expect(result?.audio).toBeDefined();
      expect(result!.audio!.length).toBe(256);
    });

    it('scopes by NPC — different NPCs have separate entries', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('I am NPC 1'));
      cache.set('w1', 'npc2', 'hello', makeResponse('I am NPC 2'));

      expect(cache.get('w1', 'npc1', 'hello')?.text).toBe('I am NPC 1');
      expect(cache.get('w1', 'npc2', 'hello')?.text).toBe('I am NPC 2');
    });

    it('scopes by world — different worlds have separate entries', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('World 1'));
      cache.set('w2', 'npc1', 'hello', makeResponse('World 2'));

      expect(cache.get('w1', 'npc1', 'hello')?.text).toBe('World 1');
      expect(cache.get('w2', 'npc1', 'hello')?.text).toBe('World 2');
    });
  });

  // ── TTL expiry ───────────────────────────────────────────────────

  describe('TTL expiry', () => {
    it('returns null for expired responses (>5 minutes)', () => {
      const response: SpeculativeResponse = {
        text: 'Old response',
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago
      };
      cache.set('w1', 'npc1', 'hello', response);

      // Also need to set entry lastAccessed to old time
      // The per-response TTL check should catch this
      const result = cache.get('w1', 'npc1', 'hello');
      expect(result).toBeNull();
    });

    it('returns valid responses within TTL', () => {
      const response: SpeculativeResponse = {
        text: 'Fresh response',
        timestamp: Date.now() - 2 * 60 * 1000, // 2 minutes ago
      };
      cache.set('w1', 'npc1', 'hello', response);

      const result = cache.get('w1', 'npc1', 'hello');
      expect(result).not.toBeNull();
      expect(result!.text).toBe('Fresh response');
    });
  });

  // ── LRU eviction ─────────────────────────────────────────────────

  describe('LRU eviction', () => {
    it('evicts oldest NPC entry when at max capacity (10)', () => {
      // Fill cache to capacity
      for (let i = 0; i < 10; i++) {
        cache.set('w1', `npc-${i}`, 'hello', makeResponse(`Response ${i}`));
      }
      expect(cache.size()).toBe(10);

      // Adding 11th should evict the first
      cache.set('w1', 'npc-new', 'hello', makeResponse('New response'));
      expect(cache.size()).toBe(10);

      // npc-0 should be evicted (oldest)
      expect(cache.get('w1', 'npc-0', 'hello')).toBeNull();
      // npc-new should be present
      expect(cache.get('w1', 'npc-new', 'hello')?.text).toBe('New response');
    });

    it('preserves recently accessed entries over older ones', () => {
      vi.useFakeTimers();
      const baseTime = Date.now();

      // Fill to capacity with staggered timestamps
      for (let i = 0; i < 10; i++) {
        vi.setSystemTime(baseTime + i * 1000); // 1s apart
        cache.set('w1', `npc-${i}`, 'hello', makeResponse(`Response ${i}`));
      }

      // Access npc-0 to refresh its LRU timestamp (now = baseTime + 10s)
      vi.setSystemTime(baseTime + 10000);
      const result = cache.get('w1', 'npc-0', 'hello');
      expect(result).not.toBeNull();

      // Add new entry — should evict npc-1 (oldest after npc-0 was refreshed)
      vi.setSystemTime(baseTime + 11000);
      cache.set('w1', 'npc-new', 'hello', makeResponse('New'));
      expect(cache.size()).toBe(10);

      // npc-0 should survive (recently accessed at t+10s)
      expect(cache.has('w1', 'npc-0')).toBe(true);
      // npc-1 should be evicted (oldest at t+1s)
      expect(cache.has('w1', 'npc-1')).toBe(false);
      // npc-new should be present
      vi.setSystemTime(baseTime + 12000);
      expect(cache.get('w1', 'npc-new', 'hello')?.text).toBe('New');

      vi.useRealTimers();
    });
  });

  // ── Invalidation ─────────────────────────────────────────────────

  describe('invalidation', () => {
    it('invalidates specific NPC', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('Hi'));
      cache.set('w1', 'npc2', 'hello', makeResponse('Hi'));

      cache.invalidate('w1', 'npc1');

      expect(cache.get('w1', 'npc1', 'hello')).toBeNull();
      expect(cache.get('w1', 'npc2', 'hello')).not.toBeNull();
    });

    it('invalidates entire world', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('Hi'));
      cache.set('w1', 'npc2', 'hello', makeResponse('Hi'));
      cache.set('w2', 'npc3', 'hello', makeResponse('Hi'));

      cache.invalidateWorld('w1');

      expect(cache.get('w1', 'npc1', 'hello')).toBeNull();
      expect(cache.get('w1', 'npc2', 'hello')).toBeNull();
      expect(cache.get('w2', 'npc3', 'hello')).not.toBeNull();
    });

    it('clear() removes all entries', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('Hi'));
      cache.set('w2', 'npc2', 'hello', makeResponse('Hi'));

      cache.clear();

      expect(cache.size()).toBe(0);
    });
  });

  // ── Hit rate tracking ────────────────────────────────────────────

  describe('hit rate tracking', () => {
    it('tracks hits and misses', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('Hi'));

      cache.get('w1', 'npc1', 'hello'); // hit
      cache.get('w1', 'npc1', 'bonjour'); // miss
      cache.get('w1', 'npc2', 'hello'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBeCloseTo(1 / 3);
    });

    it('returns 0 hit rate when no lookups', () => {
      expect(cache.getHitRate()).toBe(0);
    });

    it('resets stats correctly', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('Hi'));
      cache.get('w1', 'npc1', 'hello'); // hit

      cache.resetStats();
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  // ── has() ────────────────────────────────────────────────────────

  describe('has()', () => {
    it('returns true when NPC has entries', () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('Hi'));
      expect(cache.has('w1', 'npc1')).toBe(true);
    });

    it('returns false when NPC has no entries', () => {
      expect(cache.has('w1', 'npc1')).toBe(false);
    });
  });

  // ── CEFR-based likely openings ───────────────────────────────────

  describe('getLikelyOpenings', () => {
    it('returns A1 openings', () => {
      const openings = SpeculativeResponseCache.getLikelyOpenings('A1');
      expect(openings).toContain('hello');
      expect(openings).toContain('hi');
      expect(openings).toContain('bonjour');
      expect(openings.length).toBeLessThanOrEqual(3);
    });

    it('returns A2 openings with French phrases', () => {
      const openings = SpeculativeResponseCache.getLikelyOpenings('A2', 6);
      expect(openings).toContain('comment allez-vous');
      expect(openings).toContain('je cherche');
    });

    it('returns B1+ openings with complex phrases', () => {
      const openings = SpeculativeResponseCache.getLikelyOpenings('B1', 6);
      expect(openings).toContain('tell me about');
      expect(openings).toContain('can you help me');
    });

    it('returns default openings for unknown CEFR', () => {
      const openings = SpeculativeResponseCache.getLikelyOpenings(undefined);
      expect(openings.length).toBe(3);
      expect(openings).toContain('hello');
    });

    it('respects topN parameter', () => {
      const openings = SpeculativeResponseCache.getLikelyOpenings('A1', 2);
      expect(openings.length).toBe(2);
    });

    it('handles case-insensitive CEFR levels', () => {
      const openings = SpeculativeResponseCache.getLikelyOpenings('a1');
      expect(openings.length).toBeGreaterThan(0);
    });
  });

  // ── generate() ───────────────────────────────────────────────────

  describe('generate()', () => {
    it('generates responses for top 3 likely openings', async () => {
      const mockLlm = {
        streamCompletion: vi.fn().mockImplementation(function* (message: string) {
          yield `Response to: ${message}`;
        }),
      };

      const count = await cache.generate(
        'w1', 'npc1',
        { systemPrompt: 'You are Marie.' } as any,
        mockLlm as any,
        'A1',
      );

      expect(count).toBe(3);
      expect(mockLlm.streamCompletion).toHaveBeenCalledTimes(3);
      expect(cache.has('w1', 'npc1')).toBe(true);
    });

    it('skips generation if NPC already cached', async () => {
      cache.set('w1', 'npc1', 'hello', makeResponse('Already cached'));

      const mockLlm = {
        streamCompletion: vi.fn().mockImplementation(function* () {
          yield 'New response';
        }),
      };

      const count = await cache.generate(
        'w1', 'npc1',
        { systemPrompt: 'Test' } as any,
        mockLlm as any,
      );

      expect(count).toBe(0);
      expect(mockLlm.streamCompletion).not.toHaveBeenCalled();
    });

    it('uses FAST model tier for generation', async () => {
      const mockLlm = {
        streamCompletion: vi.fn().mockImplementation(function* () {
          yield 'Response';
        }),
      };

      await cache.generate(
        'w1', 'npc1',
        { systemPrompt: 'Test' } as any,
        mockLlm as any,
        'A1',
      );

      // Verify FAST tier was requested
      for (const call of mockLlm.streamCompletion.mock.calls) {
        expect(call[2]).toEqual(expect.objectContaining({ modelTier: 'fast' }));
      }
    });

    it('handles individual generation failures gracefully', async () => {
      let callCount = 0;
      const mockLlm = {
        streamCompletion: vi.fn().mockImplementation(function* (message: string) {
          callCount++;
          if (callCount === 2) throw new Error('LLM error');
          yield `Response to: ${message}`;
        }),
      };

      const count = await cache.generate(
        'w1', 'npc1',
        { systemPrompt: 'Test' } as any,
        mockLlm as any,
        'A1',
      );

      // Should succeed for 2 out of 3 (one failed)
      expect(count).toBe(2);
    });

    it('pre-generates TTS audio when provider available', async () => {
      const mockLlm = {
        streamCompletion: vi.fn().mockImplementation(function* () {
          yield 'Bonjour!';
        }),
      };

      const mockTts = {
        synthesize: vi.fn().mockImplementation(async function* () {
          yield { data: new Uint8Array([1, 2, 3]), encoding: 'pcm', sampleRate: 24000, durationMs: 100 };
        }),
      };

      await cache.generate(
        'w1', 'npc1',
        { systemPrompt: 'Test' } as any,
        mockLlm as any,
        'A1',
        mockTts as any,
        { voiceId: 'fr-female' } as any,
      );

      expect(mockTts.synthesize).toHaveBeenCalled();

      // Check that audio was stored
      const result = cache.get('w1', 'npc1', 'hello');
      expect(result?.audio).toBeDefined();
      expect(result!.audio!.length).toBe(3);
    });

    it('succeeds even if TTS fails', async () => {
      const mockLlm = {
        streamCompletion: vi.fn().mockImplementation(function* () {
          yield 'Bonjour!';
        }),
      };

      const mockTts = {
        synthesize: vi.fn().mockImplementation(async function* () {
          throw new Error('TTS unavailable');
        }),
      };

      const count = await cache.generate(
        'w1', 'npc1',
        { systemPrompt: 'Test' } as any,
        mockLlm as any,
        'A1',
        mockTts as any,
        { voiceId: 'fr-female' } as any,
      );

      expect(count).toBe(3);
      // Text response should still be cached (without audio)
      const result = cache.get('w1', 'npc1', 'hello');
      expect(result?.text).toBe('Bonjour!');
      expect(result?.audio).toBeUndefined();
    });

    it('skips empty LLM responses', async () => {
      const mockLlm = {
        streamCompletion: vi.fn().mockImplementation(function* () {
          // yields nothing
        }),
      };

      const count = await cache.generate(
        'w1', 'npc1',
        { systemPrompt: 'Test' } as any,
        mockLlm as any,
        'A1',
      );

      expect(count).toBe(0);
    });
  });

  // ── npcKey ───────────────────────────────────────────────────────

  describe('npcKey', () => {
    it('generates consistent key format', () => {
      expect(SpeculativeResponseCache.npcKey('world-1', 'npc-a')).toBe('world-1:npc-a');
    });
  });
});

// ── Singleton ────────────────────────────────────────────────────────

describe('speculativeCache singleton', () => {
  it('is an instance of SpeculativeResponseCache', () => {
    expect(speculativeCache).toBeInstanceOf(SpeculativeResponseCache);
  });
});
