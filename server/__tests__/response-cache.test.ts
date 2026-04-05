/**
 * Tests for US-011: Response caching for identical exchanges
 *
 * Covers: ResponseCache get/set, TTL expiry, LRU eviction, multiple variants,
 * random selection, isCacheableMessage, makeKey, hit/miss tracking, stats.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ResponseCache,
  responseCache,
  isCacheableMessage,
} from '../services/conversation/response-cache';
import type { CachedResponse } from '../services/conversation/response-cache';

// ── isCacheableMessage ──────────────────────────────────────────────

describe('isCacheableMessage', () => {
  it('returns true for greetings', () => {
    expect(isCacheableMessage('hello')).toBe(true);
    expect(isCacheableMessage('Hello!')).toBe(true);
    expect(isCacheableMessage('Hi')).toBe(true);
    expect(isCacheableMessage('bonjour')).toBe(true);
    expect(isCacheableMessage('Good morning')).toBe(true);
    expect(isCacheableMessage('hey')).toBe(true);
  });

  it('returns true for farewells', () => {
    expect(isCacheableMessage('bye')).toBe(true);
    expect(isCacheableMessage('Goodbye!')).toBe(true);
    expect(isCacheableMessage('au revoir')).toBe(true);
    expect(isCacheableMessage('see you')).toBe(true);
    expect(isCacheableMessage('à bientôt')).toBe(true);
  });

  it('returns true for simple social patterns', () => {
    expect(isCacheableMessage('yes')).toBe(true);
    expect(isCacheableMessage('no')).toBe(true);
    expect(isCacheableMessage('thanks')).toBe(true);
    expect(isCacheableMessage('merci')).toBe(true);
    expect(isCacheableMessage('how are you')).toBe(true);
    expect(isCacheableMessage('who are you')).toBe(true);
    expect(isCacheableMessage('comment ça va')).toBe(true);
  });

  it('returns false for quest-related messages', () => {
    expect(isCacheableMessage('I need help with a quest')).toBe(false);
    expect(isCacheableMessage('help me find the artifact')).toBe(false);
    expect(isCacheableMessage('where is the reward')).toBe(false);
  });

  it('returns false for long messages', () => {
    const longMsg = 'a'.repeat(101);
    expect(isCacheableMessage(longMsg)).toBe(false);
  });

  it('returns false for non-matching messages', () => {
    expect(isCacheableMessage('Tell me about the history of this town')).toBe(false);
    expect(isCacheableMessage('What happened yesterday?')).toBe(false);
    expect(isCacheableMessage('I want to explore the forest')).toBe(false);
  });
});

// ── ResponseCache.makeKey ───────────────────────────────────────────

describe('ResponseCache.makeKey', () => {
  it('creates consistent keys for same input', () => {
    const k1 = ResponseCache.makeKey('npc1', 'A1', 'hello', 1);
    const k2 = ResponseCache.makeKey('npc1', 'A1', 'hello', 1);
    expect(k1).toBe(k2);
  });

  it('creates different keys for different NPCs', () => {
    const k1 = ResponseCache.makeKey('npc1', 'A1', 'hello', 1);
    const k2 = ResponseCache.makeKey('npc2', 'A1', 'hello', 1);
    expect(k1).not.toBe(k2);
  });

  it('creates different keys for different CEFR levels', () => {
    const k1 = ResponseCache.makeKey('npc1', 'A1', 'hello', 1);
    const k2 = ResponseCache.makeKey('npc1', 'B1', 'hello', 1);
    expect(k1).not.toBe(k2);
  });

  it('creates different keys for different turn numbers', () => {
    const k1 = ResponseCache.makeKey('npc1', 'A1', 'hello', 1);
    const k2 = ResponseCache.makeKey('npc1', 'A1', 'hello', 2);
    expect(k1).not.toBe(k2);
  });

  it('canonicalizes messages (case, punctuation)', () => {
    const k1 = ResponseCache.makeKey('npc1', 'A1', 'Hello!', 1);
    const k2 = ResponseCache.makeKey('npc1', 'A1', 'hello', 1);
    expect(k1).toBe(k2);
  });
});

// ── ResponseCache ───────────────────────────────────────────────────

describe('ResponseCache', () => {
  let cache: ResponseCache;

  beforeEach(() => {
    cache = new ResponseCache({ maxSize: 10, ttlMs: 5000 });
  });

  // ── Basic get/set ─────────────────────────────────────────────

  it('stores and retrieves a response', () => {
    cache.set('key1', 'Hello there!');
    const result = cache.get('key1');
    expect(result).not.toBeNull();
    expect(result!.text).toBe('Hello there!');
  });

  it('returns null for missing key', () => {
    const result = cache.get('nonexistent');
    expect(result).toBeNull();
  });

  // ── Multiple variants ─────────────────────────────────────────

  it('stores up to 3 variants per key', () => {
    cache.set('key1', 'Response A');
    cache.set('key1', 'Response B');
    cache.set('key1', 'Response C');
    cache.set('key1', 'Response D'); // should evict oldest variant

    // Retrieve many times to verify we get variants
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const result = cache.get('key1');
      if (result) seen.add(result.text);
    }
    // Should have at most 3 variants, and 'Response A' may be evicted
    expect(seen.size).toBeLessThanOrEqual(3);
    expect(seen.has('Response D')).toBe(true);
  });

  it('does not store duplicate responses', () => {
    cache.set('key1', 'Same response');
    cache.set('key1', 'Same response');
    cache.set('key1', 'Same response');

    const stats = cache.getStats();
    expect(stats.totalVariants).toBe(1);
  });

  it('randomly selects from variants', () => {
    cache.set('key1', 'A');
    cache.set('key1', 'B');
    cache.set('key1', 'C');

    const results = new Set<string>();
    // With 100 iterations, very likely to see all 3
    for (let i = 0; i < 100; i++) {
      const r = cache.get('key1');
      if (r) results.add(r.text);
    }
    // Should see at least 2 different variants (statistically near-certain for 3)
    expect(results.size).toBeGreaterThanOrEqual(2);
  });

  // ── TTL expiry ────────────────────────────────────────────────

  it('expires entries after TTL', () => {
    const shortCache = new ResponseCache({ maxSize: 10, ttlMs: 50 });
    shortCache.set('key1', 'Hello');

    // Should be retrievable immediately
    expect(shortCache.get('key1')).not.toBeNull();

    // Manually expire by advancing time
    vi.useFakeTimers();
    vi.advanceTimersByTime(100);
    expect(shortCache.get('key1')).toBeNull();
    vi.useRealTimers();
  });

  // ── LRU eviction ─────────────────────────────────────────────

  it('evicts oldest entries when at capacity', () => {
    const tinyCache = new ResponseCache({ maxSize: 3, ttlMs: 60000 });

    tinyCache.set('key1', 'R1');
    tinyCache.set('key2', 'R2');
    tinyCache.set('key3', 'R3');
    // This should evict key1
    tinyCache.set('key4', 'R4');

    expect(tinyCache.get('key1')).toBeNull(); // evicted
    expect(tinyCache.get('key2')).not.toBeNull();
    expect(tinyCache.get('key4')).not.toBeNull();
  });

  it('LRU access refreshes position', () => {
    const tinyCache = new ResponseCache({ maxSize: 3, ttlMs: 60000 });

    tinyCache.set('key1', 'R1');
    tinyCache.set('key2', 'R2');
    tinyCache.set('key3', 'R3');

    // Access key1 to refresh its position
    tinyCache.get('key1');

    // Now adding key4 should evict key2 (oldest unaccessed)
    tinyCache.set('key4', 'R4');

    expect(tinyCache.get('key1')).not.toBeNull(); // refreshed
    expect(tinyCache.get('key2')).toBeNull(); // evicted
  });

  // ── Hit/miss tracking ─────────────────────────────────────────

  it('tracks hits and misses', () => {
    cache.set('key1', 'Hello');

    cache.get('key1'); // hit
    cache.get('key1'); // hit
    cache.get('nonexistent'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2 / 3, 2);
  });

  it('resets stats', () => {
    cache.set('key1', 'Hello');
    cache.get('key1');
    cache.get('nonexistent');

    cache.resetStats();
    const stats = cache.getStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.hitRate).toBe(0);
  });

  // ── Stats ─────────────────────────────────────────────────────

  it('reports correct stats', () => {
    cache.set('key1', 'A');
    cache.set('key1', 'B');
    cache.set('key2', 'C');

    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.totalVariants).toBe(3);
  });

  // ── Delete / clear ────────────────────────────────────────────

  it('deletes individual entries', () => {
    cache.set('key1', 'Hello');
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeNull();
  });

  it('clears all entries', () => {
    cache.set('key1', 'A');
    cache.set('key2', 'B');
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  // ── Size ──────────────────────────────────────────────────────

  it('reports size correctly', () => {
    expect(cache.size()).toBe(0);
    cache.set('key1', 'A');
    expect(cache.size()).toBe(1);
    cache.set('key2', 'B');
    expect(cache.size()).toBe(2);
  });
});

// ── Singleton ───────────────────────────────────────────────────────

describe('responseCache singleton', () => {
  it('is an instance of ResponseCache', () => {
    expect(responseCache).toBeInstanceOf(ResponseCache);
  });
});
