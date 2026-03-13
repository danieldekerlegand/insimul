import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConversationContextCache,
  type CachedMessage,
} from '../services/conversation-context-cache';

describe('ConversationContextCache', () => {
  let cache: ConversationContextCache;

  beforeEach(() => {
    cache = new ConversationContextCache({ maxSize: 5, ttlMs: 1000, maxMessagesPerConversation: 10 });
  });

  describe('get / set / has', () => {
    it('returns undefined for missing keys', () => {
      expect(cache.get('missing')).toBeUndefined();
      expect(cache.has('missing')).toBe(false);
    });

    it('stores and retrieves a context', () => {
      const messages: CachedMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'model', content: 'Hi there' },
      ];
      cache.set('a', { messages });

      const result = cache.get('a');
      expect(result).toBeDefined();
      expect(result!.messages).toHaveLength(2);
      expect(result!.messages[0].content).toBe('Hello');
      expect(cache.has('a')).toBe(true);
    });

    it('overwrites existing entries', () => {
      cache.set('a', { messages: [{ role: 'user', content: 'v1' }] });
      cache.set('a', { messages: [{ role: 'user', content: 'v2' }] });

      expect(cache.get('a')!.messages[0].content).toBe('v2');
      expect(cache.size).toBe(1);
    });
  });

  describe('append', () => {
    it('creates a new context when none exists', () => {
      const ctx = cache.append('new', { role: 'user', content: 'first' });
      expect(ctx.messages).toHaveLength(1);
      expect(cache.has('new')).toBe(true);
    });

    it('appends to an existing context', () => {
      cache.set('a', { messages: [{ role: 'user', content: 'msg1' }] });
      cache.append('a', { role: 'model', content: 'msg2' });

      const result = cache.get('a');
      expect(result!.messages).toHaveLength(2);
      expect(result!.messages[1].content).toBe('msg2');
    });

    it('stores the system prompt on first append', () => {
      cache.append('a', { role: 'user', content: 'hi' }, 'You are a wizard');
      expect(cache.get('a')!.systemPrompt).toBe('You are a wizard');
    });

    it('preserves system prompt on subsequent appends without one', () => {
      cache.append('a', { role: 'user', content: 'hi' }, 'sys');
      cache.append('a', { role: 'model', content: 'hello' });
      expect(cache.get('a')!.systemPrompt).toBe('sys');
    });

    it('invalidates formattedContext on append', () => {
      cache.set('a', {
        messages: [{ role: 'user', content: 'hi' }],
        formattedContext: 'pre-built context',
      });
      cache.append('a', { role: 'model', content: 'hey' });
      expect(cache.get('a')!.formattedContext).toBeUndefined();
    });
  });

  describe('delete / clear', () => {
    it('deletes a specific key', () => {
      cache.set('a', { messages: [] });
      cache.set('b', { messages: [] });
      expect(cache.delete('a')).toBe(true);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
    });

    it('clears all entries', () => {
      cache.set('a', { messages: [] });
      cache.set('b', { messages: [] });
      cache.clear();
      expect(cache.size).toBe(0);
    });
  });

  describe('TTL expiration', () => {
    it('expires entries after TTL', () => {
      vi.useFakeTimers();
      try {
        cache.set('a', { messages: [{ role: 'user', content: 'hi' }] });
        expect(cache.has('a')).toBe(true);

        vi.advanceTimersByTime(1001);
        expect(cache.has('a')).toBe(false);
        expect(cache.get('a')).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });

    it('refreshes TTL on access', () => {
      vi.useFakeTimers();
      try {
        cache.set('a', { messages: [{ role: 'user', content: 'hi' }] });
        // Set 'b' at same time, never access it again
        cache.set('b', { messages: [{ role: 'user', content: 'bye' }] });

        vi.advanceTimersByTime(800);
        cache.get('a'); // refresh 'a' TTL, don't touch 'b'

        vi.advanceTimersByTime(300);
        // 'b' is now 1100ms old (expired), 'a' is only 300ms since last access
        expect(cache.get('a')).toBeDefined();
        expect(cache.get('b')).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('LRU eviction', () => {
    it('evicts oldest entries when at capacity', () => {
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, { messages: [{ role: 'user', content: `msg${i}` }] });
      }
      expect(cache.size).toBe(5);

      // Adding a 6th should evict the oldest (key0)
      cache.set('key5', { messages: [{ role: 'user', content: 'msg5' }] });
      expect(cache.has('key0')).toBe(false);
      expect(cache.has('key5')).toBe(true);
      expect(cache.size).toBe(5);
    });

    it('preserves recently accessed entries', () => {
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, { messages: [{ role: 'user', content: `msg${i}` }] });
      }

      // Access key0 to make it recent
      cache.get('key0');

      // Add a new key — key1 should be evicted (oldest non-accessed)
      cache.set('key5', { messages: [{ role: 'user', content: 'msg5' }] });
      expect(cache.has('key0')).toBe(true);
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('maxMessagesPerConversation', () => {
    it('truncates messages when setting context', () => {
      const messages: CachedMessage[] = Array.from({ length: 15 }, (_, i) => ({
        role: 'user' as const,
        content: `msg${i}`,
      }));
      cache.set('a', { messages });

      const result = cache.get('a');
      expect(result!.messages).toHaveLength(10); // maxMessages = 10
      expect(result!.messages[0].content).toBe('msg5'); // keeps last 10
    });

    it('truncates messages on append overflow', () => {
      // Start with 9 messages
      cache.set('a', {
        messages: Array.from({ length: 9 }, (_, i) => ({
          role: 'user' as const,
          content: `msg${i}`,
        })),
      });

      // Append 2 more -> 11 total, should truncate to 10
      cache.append('a', { role: 'user', content: 'msg9' });
      cache.append('a', { role: 'user', content: 'msg10' });

      const result = cache.get('a');
      expect(result!.messages).toHaveLength(10);
      expect(result!.messages[0].content).toBe('msg1');
      expect(result!.messages[9].content).toBe('msg10');
    });
  });

  describe('static key builders', () => {
    it('builds chat keys', () => {
      expect(ConversationContextCache.chatKey('w1', 'npc1', 'p1'))
        .toBe('chat:w1:npc1:p1');
    });

    it('builds language keys', () => {
      expect(ConversationContextCache.languageKey('lang42'))
        .toBe('lang:lang42');
    });
  });

  describe('metadata on messages', () => {
    it('preserves meta on cached messages', () => {
      cache.append('a', {
        role: 'assistant',
        content: 'hello',
        meta: { inLanguage: 'Elvish', createdAt: '2026-01-01T00:00:00Z' },
      });

      const result = cache.get('a');
      expect(result!.messages[0].meta).toEqual({
        inLanguage: 'Elvish',
        createdAt: '2026-01-01T00:00:00Z',
      });
    });
  });
});
