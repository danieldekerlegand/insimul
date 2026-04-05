import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConversationContextCache,
  conversationContextCache,
} from '../services/conversation/conversation-context-cache.js';
import type { MetricStage } from '../services/conversation/conversation-metrics.js';

// ── ConversationContextCache chatKey ─────────────────────────────────

describe('ConversationContextCache.chatKey', () => {
  it('generates key in chat:worldId:npcId:playerId format', () => {
    const key = ConversationContextCache.chatKey('world1', 'npc1', 'player1');
    expect(key).toBe('chat:world1:npc1:player1');
  });

  it('generates unique keys for different character/player combos', () => {
    const k1 = ConversationContextCache.chatKey('w', 'npc1', 'p1');
    const k2 = ConversationContextCache.chatKey('w', 'npc2', 'p1');
    const k3 = ConversationContextCache.chatKey('w', 'npc1', 'p2');
    expect(k1).not.toBe(k2);
    expect(k1).not.toBe(k3);
    expect(k2).not.toBe(k3);
  });
});

// ── Cache hit/miss behavior ──────────────────────────────────────────

describe('ConversationContextCache hit/miss', () => {
  let cache: ConversationContextCache;

  beforeEach(() => {
    cache = new ConversationContextCache({ maxSize: 10, ttlMs: 5000 });
  });

  it('returns undefined on cache miss', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('returns cached context on hit', () => {
    const key = ConversationContextCache.chatKey('w1', 'npc1', 'p1');
    cache.set(key, {
      messages: [],
      formattedContext: JSON.stringify({ systemPrompt: 'test', characterName: 'Bob' }),
      systemPrompt: 'test',
    });

    const result = cache.get(key);
    expect(result).toBeDefined();
    expect(result!.formattedContext).toBeDefined();
    const parsed = JSON.parse(result!.formattedContext!);
    expect(parsed.systemPrompt).toBe('test');
    expect(parsed.characterName).toBe('Bob');
  });

  it('cache miss after delete (invalidation)', () => {
    const key = ConversationContextCache.chatKey('w1', 'npc1', 'p1');
    cache.set(key, {
      messages: [],
      formattedContext: '{}',
      systemPrompt: 'test',
    });
    expect(cache.has(key)).toBe(true);

    cache.delete(key);
    expect(cache.has(key)).toBe(false);
    expect(cache.get(key)).toBeUndefined();
  });

  it('cache miss after clear (world-level invalidation)', () => {
    const k1 = ConversationContextCache.chatKey('w1', 'npc1', 'p1');
    const k2 = ConversationContextCache.chatKey('w1', 'npc2', 'p1');
    cache.set(k1, { messages: [], systemPrompt: 'a' });
    cache.set(k2, { messages: [], systemPrompt: 'b' });

    cache.clear();
    expect(cache.has(k1)).toBe(false);
    expect(cache.has(k2)).toBe(false);
  });
});

// ── TTL expiry ───────────────────────────────────────────────────────

describe('ConversationContextCache TTL', () => {
  it('expires entries after TTL', () => {
    const cache = new ConversationContextCache({ maxSize: 10, ttlMs: 50 });
    const key = ConversationContextCache.chatKey('w1', 'npc1', 'p1');
    cache.set(key, { messages: [], systemPrompt: 'test' });

    expect(cache.has(key)).toBe(true);

    // Fast-forward past TTL
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cache.has(key)).toBe(false);
        resolve();
      }, 60);
    });
  });
});

// ── LRU eviction ─────────────────────────────────────────────────────

describe('ConversationContextCache LRU eviction', () => {
  it('evicts oldest entry when at capacity', () => {
    const cache = new ConversationContextCache({ maxSize: 3, ttlMs: 60000 });

    cache.set('k1', { messages: [], systemPrompt: 'first' });
    cache.set('k2', { messages: [], systemPrompt: 'second' });
    cache.set('k3', { messages: [], systemPrompt: 'third' });
    // k1 is oldest, should be evicted when k4 is added
    cache.set('k4', { messages: [], systemPrompt: 'fourth' });

    expect(cache.has('k1')).toBe(false); // evicted
    expect(cache.has('k2')).toBe(true);
    expect(cache.has('k3')).toBe(true);
    expect(cache.has('k4')).toBe(true);
  });

  it('access refreshes LRU position', () => {
    const cache = new ConversationContextCache({ maxSize: 3, ttlMs: 60000 });

    cache.set('k1', { messages: [], systemPrompt: 'first' });
    cache.set('k2', { messages: [], systemPrompt: 'second' });
    cache.set('k3', { messages: [], systemPrompt: 'third' });

    // Access k1 to refresh its position
    cache.get('k1');

    // k2 is now oldest
    cache.set('k4', { messages: [], systemPrompt: 'fourth' });

    expect(cache.has('k1')).toBe(true); // refreshed
    expect(cache.has('k2')).toBe(false); // evicted (was oldest)
    expect(cache.has('k3')).toBe(true);
    expect(cache.has('k4')).toBe(true);
  });
});

// ── Append ───────────────────────────────────────────────────────────

describe('ConversationContextCache append', () => {
  let cache: ConversationContextCache;

  beforeEach(() => {
    cache = new ConversationContextCache({ maxSize: 10, ttlMs: 60000 });
  });

  it('appends message to existing conversation', () => {
    const key = 'test-key';
    cache.set(key, {
      messages: [{ role: 'user', content: 'hello' }],
      systemPrompt: 'test',
    });

    cache.append(key, { role: 'assistant', content: 'hi there' });

    const result = cache.get(key)!;
    expect(result.messages).toHaveLength(2);
    expect(result.messages[1].content).toBe('hi there');
  });

  it('creates new conversation if key does not exist', () => {
    const result = cache.append('new-key', { role: 'user', content: 'first' }, 'sys prompt');
    expect(result.messages).toHaveLength(1);
    expect(result.systemPrompt).toBe('sys prompt');
  });

  it('invalidates formattedContext on append', () => {
    const key = 'test-key';
    cache.set(key, {
      messages: [],
      formattedContext: '{"cached": true}',
      systemPrompt: 'test',
    });

    cache.append(key, { role: 'user', content: 'new msg' });

    const result = cache.get(key)!;
    expect(result.formattedContext).toBeUndefined();
  });
});

// ── Cache invalidation triggers ──────────────────────────────────────

describe('Cache invalidation triggers', () => {
  let cache: ConversationContextCache;

  beforeEach(() => {
    cache = new ConversationContextCache({ maxSize: 50, ttlMs: 60000 });
  });

  it('specific NPC invalidation removes only that conversation', () => {
    const k1 = ConversationContextCache.chatKey('w1', 'npc1', 'p1');
    const k2 = ConversationContextCache.chatKey('w1', 'npc2', 'p1');

    cache.set(k1, { messages: [], systemPrompt: 'a' });
    cache.set(k2, { messages: [], systemPrompt: 'b' });

    // Simulate CEFR level change for npc1 conversation
    cache.delete(k1);

    expect(cache.has(k1)).toBe(false);
    expect(cache.has(k2)).toBe(true); // other NPC unaffected
  });

  it('world-level invalidation clears all entries', () => {
    const k1 = ConversationContextCache.chatKey('w1', 'npc1', 'p1');
    const k2 = ConversationContextCache.chatKey('w1', 'npc2', 'p1');
    const k3 = ConversationContextCache.chatKey('w2', 'npc1', 'p1');

    cache.set(k1, { messages: [], systemPrompt: 'a' });
    cache.set(k2, { messages: [], systemPrompt: 'b' });
    cache.set(k3, { messages: [], systemPrompt: 'c' });

    // Simulate world time advance — clear all
    cache.clear();

    expect(cache.size).toBe(0);
  });
});

// ── MetricStage includes cache metrics ───────────────────────────────

describe('MetricStage cache metrics', () => {
  it('context_cache_hit is a valid MetricStage', () => {
    const stage: MetricStage = 'context_cache_hit';
    expect(stage).toBe('context_cache_hit');
  });

  it('context_cache_miss is a valid MetricStage', () => {
    const stage: MetricStage = 'context_cache_miss';
    expect(stage).toBe('context_cache_miss');
  });
});

// ── Singleton instance ───────────────────────────────────────────────

describe('conversationContextCache singleton', () => {
  it('is a ConversationContextCache instance', () => {
    expect(conversationContextCache).toBeInstanceOf(ConversationContextCache);
  });

  it('supports set/get/delete operations', () => {
    const key = ConversationContextCache.chatKey('test-world', 'test-npc', 'test-player');
    conversationContextCache.set(key, {
      messages: [],
      formattedContext: JSON.stringify({ systemPrompt: 'singleton test' }),
    });
    expect(conversationContextCache.has(key)).toBe(true);
    conversationContextCache.delete(key); // cleanup
  });
});
