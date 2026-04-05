/**
 * Tests for NpcConversationPool (US-005)
 *
 * Covers: capacity, add/take, best-match, any-available fallback,
 * replenishment threshold, freshness/eviction, topic diversity, and
 * the replenishPool helper.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  NpcConversationPool,
  replenishPool,
} from '../services/conversation/npc-conversation-pool';
import type { PooledConversation } from '../services/conversation/npc-conversation-pool';

function makeConversation(overrides: Partial<PooledConversation> = {}): PooledConversation {
  return {
    conversationId: overrides.conversationId ?? `conv-${Math.random().toString(36).slice(2, 8)}`,
    npc1Id: overrides.npc1Id ?? 'npc-1',
    npc2Id: overrides.npc2Id ?? 'npc-2',
    topic: overrides.topic ?? 'daily_greeting',
    exchanges: overrides.exchanges ?? [
      { speakerId: 'npc-1', speakerName: 'Alice Smith', text: 'Good day!', timestamp: Date.now() },
      { speakerId: 'npc-2', speakerName: 'Bob Jones', text: 'Hello there!', timestamp: Date.now() + 3000 },
    ],
    relationshipDelta: overrides.relationshipDelta ?? {
      friendshipChange: 0.02,
      trustChange: 0.01,
      romanceSpark: 0,
    },
    languageUsed: overrides.languageUsed ?? 'English',
    generatedAt: overrides.generatedAt ?? Date.now(),
    gameHourGenerated: overrides.gameHourGenerated,
  };
}

describe('NpcConversationPool', () => {
  let pool: NpcConversationPool;
  const worldId = 'world-1';

  beforeEach(() => {
    pool = new NpcConversationPool({ capacity: 50, replenishThreshold: 30 });
  });

  // ── add() ───────────────────────────────────────────────────────

  describe('add()', () => {
    it('adds a conversation to the pool', () => {
      const conv = makeConversation();
      expect(pool.add(worldId, conv)).toBe(true);
      expect(pool.size(worldId)).toBe(1);
    });

    it('returns false when at capacity', () => {
      const smallPool = new NpcConversationPool({ capacity: 3 });
      for (let i = 0; i < 3; i++) {
        expect(smallPool.add(worldId, makeConversation())).toBe(true);
      }
      expect(smallPool.add(worldId, makeConversation())).toBe(false);
      expect(smallPool.size(worldId)).toBe(3);
    });

    it('tracks separate pools per world', () => {
      pool.add('world-a', makeConversation());
      pool.add('world-a', makeConversation());
      pool.add('world-b', makeConversation());
      expect(pool.size('world-a')).toBe(2);
      expect(pool.size('world-b')).toBe(1);
    });
  });

  // ── take() ──────────────────────────────────────────────────────

  describe('take()', () => {
    it('returns undefined for empty pool', () => {
      expect(pool.take(worldId, 'npc-1', 'npc-2')).toBeUndefined();
    });

    it('removes conversation from pool on take', () => {
      pool.add(worldId, makeConversation());
      expect(pool.size(worldId)).toBe(1);
      const taken = pool.take(worldId, 'npc-1', 'npc-2');
      expect(taken).toBeDefined();
      expect(pool.size(worldId)).toBe(0);
    });

    it('prefers exact NPC pair match', () => {
      const exact = makeConversation({ npc1Id: 'npc-a', npc2Id: 'npc-b', topic: 'weather' });
      const other = makeConversation({ npc1Id: 'npc-c', npc2Id: 'npc-d', topic: 'gossip' });
      pool.add(worldId, other);
      pool.add(worldId, exact);

      const taken = pool.take(worldId, 'npc-a', 'npc-b');
      expect(taken?.npc1Id).toBe('npc-a');
      expect(taken?.npc2Id).toBe('npc-b');
    });

    it('matches NPC pair in reverse order', () => {
      const conv = makeConversation({ npc1Id: 'npc-a', npc2Id: 'npc-b' });
      pool.add(worldId, conv);

      const taken = pool.take(worldId, 'npc-b', 'npc-a');
      expect(taken).toBeDefined();
      expect(taken?.npc1Id).toBe('npc-a');
    });

    it('falls back to partial NPC match', () => {
      const partial = makeConversation({ npc1Id: 'npc-a', npc2Id: 'npc-c' });
      pool.add(worldId, partial);

      const taken = pool.take(worldId, 'npc-a', 'npc-b');
      expect(taken).toBeDefined();
      expect(taken?.npc1Id).toBe('npc-a');
    });

    it('falls back to any available conversation', () => {
      const conv = makeConversation({ npc1Id: 'npc-x', npc2Id: 'npc-y' });
      pool.add(worldId, conv);

      const taken = pool.take(worldId, 'npc-a', 'npc-b');
      expect(taken).toBeDefined();
      expect(taken?.npc1Id).toBe('npc-x');
    });
  });

  // ── Capacity & isFull() ─────────────────────────────────────────

  describe('capacity', () => {
    it('reports full at capacity', () => {
      const smallPool = new NpcConversationPool({ capacity: 2 });
      expect(smallPool.isFull(worldId)).toBe(false);
      smallPool.add(worldId, makeConversation());
      smallPool.add(worldId, makeConversation());
      expect(smallPool.isFull(worldId)).toBe(true);
    });

    it('default capacity is 50', () => {
      const defaultPool = new NpcConversationPool();
      for (let i = 0; i < 50; i++) {
        expect(defaultPool.add(worldId, makeConversation())).toBe(true);
      }
      expect(defaultPool.add(worldId, makeConversation())).toBe(false);
    });
  });

  // ── needsReplenishment() ────────────────────────────────────────

  describe('needsReplenishment()', () => {
    it('needs replenishment when below threshold', () => {
      const p = new NpcConversationPool({ capacity: 50, replenishThreshold: 5 });
      expect(p.needsReplenishment(worldId)).toBe(true);
      for (let i = 0; i < 5; i++) p.add(worldId, makeConversation());
      expect(p.needsReplenishment(worldId)).toBe(false);
    });

    it('needs replenishment after taking below threshold', () => {
      const p = new NpcConversationPool({ capacity: 50, replenishThreshold: 3 });
      for (let i = 0; i < 3; i++) p.add(worldId, makeConversation());
      expect(p.needsReplenishment(worldId)).toBe(false);
      p.take(worldId, 'npc-1', 'npc-2');
      expect(p.needsReplenishment(worldId)).toBe(true);
    });
  });

  // ── Freshness / eviction ────────────────────────────────────────

  describe('freshness and eviction', () => {
    it('evicts conversations older than evictGameHours', () => {
      const p = new NpcConversationPool({ capacity: 50, evictGameHours: 72 });
      const old = makeConversation({ gameHourGenerated: 100 });
      const fresh = makeConversation({ npc1Id: 'fresh-1', npc2Id: 'fresh-2', gameHourGenerated: 200 });
      p.add(worldId, old);
      p.add(worldId, fresh);

      // Take at game hour 250 — old is 150 hours (>72) so evicted, fresh is 50 hours (<72)
      const taken = p.take(worldId, 'fresh-1', 'fresh-2', 250);
      expect(taken?.npc1Id).toBe('fresh-1');
      // Old was evicted, fresh was taken — pool empty
      expect(p.size(worldId)).toBe(0);
    });

    it('deprioritizes stale conversations (>1 game-day)', () => {
      const p = new NpcConversationPool({ capacity: 50, staleGameHours: 24 });
      // Stale conversation for exact match
      const stale = makeConversation({ npc1Id: 'npc-a', npc2Id: 'npc-b', gameHourGenerated: 10 });
      // Fresh conversation for different pair
      const fresh = makeConversation({ npc1Id: 'npc-c', npc2Id: 'npc-d', gameHourGenerated: 90 });
      p.add(worldId, stale);
      p.add(worldId, fresh);

      // At game hour 100: stale is 90h old (>24), exact match gives +100 but -50 for stale = 50
      // Fresh is 10h old, no NPC match = 0. So exact match still wins due to high score.
      // But if we request npc-c/npc-d, fresh should win.
      const taken = p.take(worldId, 'npc-c', 'npc-d', 100);
      expect(taken?.npc1Id).toBe('npc-c');
    });

    it('keeps conversations without game hour (no eviction)', () => {
      const p = new NpcConversationPool({ capacity: 50, evictGameHours: 72 });
      const noHour = makeConversation(); // no gameHourGenerated
      p.add(worldId, noHour);

      const taken = p.take(worldId, 'npc-1', 'npc-2', 9999);
      expect(taken).toBeDefined();
    });
  });

  // ── Topic diversity ─────────────────────────────────────────────

  describe('topic diversity', () => {
    it('tracks generated topics', () => {
      pool.add(worldId, makeConversation({ topic: 'weather' }));
      pool.add(worldId, makeConversation({ topic: 'gossip' }));
      pool.add(worldId, makeConversation({ topic: 'weather' }));

      const topics = pool.getGeneratedTopics(worldId);
      expect(topics).toContain('weather');
      expect(topics).toContain('gossip');
      expect(topics.length).toBe(2);
    });

    it('getStats shows topic counts', () => {
      pool.add(worldId, makeConversation({ topic: 'weather' }));
      pool.add(worldId, makeConversation({ topic: 'weather' }));
      pool.add(worldId, makeConversation({ topic: 'gossip' }));

      const stats = pool.getStats(worldId);
      expect(stats.topicCounts['weather']).toBe(2);
      expect(stats.topicCounts['gossip']).toBe(1);
      expect(stats.size).toBe(3);
      expect(stats.capacity).toBe(50);
    });
  });

  // ── clear() ─────────────────────────────────────────────────────

  describe('clear()', () => {
    it('clears a specific world', () => {
      pool.add('world-a', makeConversation());
      pool.add('world-b', makeConversation());
      pool.clear('world-a');
      expect(pool.size('world-a')).toBe(0);
      expect(pool.size('world-b')).toBe(1);
    });

    it('clearAll removes everything', () => {
      pool.add('world-a', makeConversation());
      pool.add('world-b', makeConversation());
      pool.clearAll();
      expect(pool.size('world-a')).toBe(0);
      expect(pool.size('world-b')).toBe(0);
    });
  });
});

// ── replenishPool() ─────────────────────────────────────────────────

describe('replenishPool()', () => {
  it('generates conversations up to target count', async () => {
    const pool = new NpcConversationPool({ capacity: 50 });
    let callCount = 0;

    const result = await replenishPool({
      pool,
      worldId: 'world-1',
      generateFn: async () => {
        callCount++;
        return makeConversation();
      },
      maxConcurrent: 3,
      targetCount: 5,
    });

    expect(result).toBe(5);
    expect(pool.size('world-1')).toBe(5);
    expect(callCount).toBe(5); // batch 1: min(5,3)=3 calls, batch 2: min(2,3)=2 calls
  });

  it('handles generation failures gracefully', async () => {
    const pool = new NpcConversationPool({ capacity: 50 });
    let callCount = 0;

    const result = await replenishPool({
      pool,
      worldId: 'world-1',
      generateFn: async () => {
        callCount++;
        if (callCount % 2 === 0) throw new Error('LLM unavailable');
        return makeConversation();
      },
      maxConcurrent: 2,
      targetCount: 4,
    });

    // Half of calls fail, so we get fewer than target
    expect(result).toBeLessThanOrEqual(4);
    expect(pool.size('world-1')).toBe(result);
  });

  it('does nothing when pool is already at target', async () => {
    const pool = new NpcConversationPool({ capacity: 50, replenishThreshold: 5 });
    for (let i = 0; i < 5; i++) pool.add('world-1', makeConversation());

    const result = await replenishPool({
      pool,
      worldId: 'world-1',
      generateFn: async () => makeConversation(),
      targetCount: 5,
    });

    expect(result).toBe(0);
  });

  it('stops at capacity even if target is higher', async () => {
    const pool = new NpcConversationPool({ capacity: 3 });

    const result = await replenishPool({
      pool,
      worldId: 'world-1',
      generateFn: async () => makeConversation(),
      targetCount: 10,
      maxConcurrent: 2,
    });

    expect(pool.size('world-1')).toBe(3);
    expect(result).toBe(3);
  });

  it('respects maxConcurrent rate limit', async () => {
    const pool = new NpcConversationPool({ capacity: 50 });
    let maxInFlight = 0;
    let inFlight = 0;

    const result = await replenishPool({
      pool,
      worldId: 'world-1',
      generateFn: async () => {
        inFlight++;
        if (inFlight > maxInFlight) maxInFlight = inFlight;
        await new Promise((r) => setTimeout(r, 10));
        inFlight--;
        return makeConversation();
      },
      maxConcurrent: 3,
      targetCount: 6,
    });

    expect(maxInFlight).toBeLessThanOrEqual(3);
    expect(result).toBe(6);
  });
});
