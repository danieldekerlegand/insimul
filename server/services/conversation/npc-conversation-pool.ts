/**
 * NPC-NPC Conversation Pool (US-005)
 *
 * Pre-generates a pool of NPC-NPC conversations so that ambient conversations
 * display instantly instead of waiting for LLM generation.
 *
 * Pool capacity: 50 conversations per world.
 * Background replenishment: every 30 seconds, refill when below 30.
 * Freshness: deprioritize conversations >1 game-day old, evict >3 game-days.
 */

import type {
  NpcConversationResult,
  ConversationExchange,
  RelationshipDelta,
  NpcConversationEnvironment,
} from './npc-conversation-engine.js';

// ── Types ────────────────────────────────────────────────────────────

export interface PooledConversation {
  conversationId: string;
  npc1Id: string;
  npc2Id: string;
  topic: string;
  exchanges: ConversationExchange[];
  relationshipDelta: RelationshipDelta;
  languageUsed: string;
  /** Real-world timestamp when this was generated */
  generatedAt: number;
  /** Game-time hour when this was generated (for freshness) */
  gameHourGenerated?: number;
}

export interface PoolStats {
  size: number;
  capacity: number;
  topicCounts: Record<string, number>;
  oldestAge: number;
}

export interface NpcConversationPoolOptions {
  /** Max conversations per world (default 50) */
  capacity?: number;
  /** Threshold below which replenishment triggers (default 30) */
  replenishThreshold?: number;
  /** Max age in game-hours before deprioritization (default 24 = 1 game-day) */
  staleGameHours?: number;
  /** Max age in game-hours before eviction (default 72 = 3 game-days) */
  evictGameHours?: number;
}

const DEFAULT_CAPACITY = 50;
const DEFAULT_REPLENISH_THRESHOLD = 30;
const DEFAULT_STALE_GAME_HOURS = 24;
const DEFAULT_EVICT_GAME_HOURS = 72;

// ── Pool class ───────────────────────────────────────────────────────

export class NpcConversationPool {
  private pools = new Map<string, PooledConversation[]>();
  private readonly capacity: number;
  private readonly replenishThreshold: number;
  private readonly staleGameHours: number;
  private readonly evictGameHours: number;
  /** Track topics generated to promote diversity */
  private generatedTopics = new Map<string, Set<string>>();

  constructor(options: NpcConversationPoolOptions = {}) {
    this.capacity = options.capacity ?? DEFAULT_CAPACITY;
    this.replenishThreshold = options.replenishThreshold ?? DEFAULT_REPLENISH_THRESHOLD;
    this.staleGameHours = options.staleGameHours ?? DEFAULT_STALE_GAME_HOURS;
    this.evictGameHours = options.evictGameHours ?? DEFAULT_EVICT_GAME_HOURS;
  }

  /**
   * Add a pre-generated conversation to the pool.
   * Returns false if pool is at capacity.
   */
  add(worldId: string, conversation: PooledConversation): boolean {
    let pool = this.pools.get(worldId);
    if (!pool) {
      pool = [];
      this.pools.set(worldId, pool);
    }

    if (pool.length >= this.capacity) return false;

    pool.push(conversation);

    // Track topic for diversity
    let topics = this.generatedTopics.get(worldId);
    if (!topics) {
      topics = new Set();
      this.generatedTopics.set(worldId, topics);
    }
    topics.add(conversation.topic);

    return true;
  }

  /**
   * Take a conversation from the pool.
   * Best-match: prefers matching NPC pair and topic.
   * Falls back to any conversation with either NPC, then any available.
   * Returns undefined if pool is empty.
   */
  take(
    worldId: string,
    npc1Id: string,
    npc2Id: string,
    currentGameHour?: number,
  ): PooledConversation | undefined {
    // Evict expired conversations first
    if (currentGameHour !== undefined) {
      this.evictStale(worldId, currentGameHour);
    }

    const pool = this.pools.get(worldId);
    if (!pool || pool.length === 0) return undefined;

    // Score each conversation for best-match
    let bestIdx = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < pool.length; i++) {
      const conv = pool[i];
      let score = 0;

      // Exact NPC pair match (either order)
      const exactMatch =
        (conv.npc1Id === npc1Id && conv.npc2Id === npc2Id) ||
        (conv.npc1Id === npc2Id && conv.npc2Id === npc1Id);
      if (exactMatch) {
        score += 100;
      }
      // One NPC matches
      else if (
        conv.npc1Id === npc1Id || conv.npc1Id === npc2Id ||
        conv.npc2Id === npc1Id || conv.npc2Id === npc2Id
      ) {
        score += 10;
      }

      // Freshness: deprioritize stale conversations
      if (currentGameHour !== undefined && conv.gameHourGenerated !== undefined) {
        const ageHours = currentGameHour - conv.gameHourGenerated;
        if (ageHours > this.staleGameHours) {
          score -= 50; // Deprioritize stale
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) return undefined;

    // Remove from pool and return
    const [conversation] = pool.splice(bestIdx, 1);
    return conversation;
  }

  /** Get current pool size for a world */
  size(worldId: string): number {
    return this.pools.get(worldId)?.length ?? 0;
  }

  /** Check if pool is at capacity */
  isFull(worldId: string): boolean {
    return this.size(worldId) >= this.capacity;
  }

  /** Check if pool needs replenishment */
  needsReplenishment(worldId: string): boolean {
    return this.size(worldId) < this.replenishThreshold;
  }

  /** Get pool statistics */
  getStats(worldId: string): PoolStats {
    const pool = this.pools.get(worldId) ?? [];
    const topicCounts: Record<string, number> = {};
    let oldestAge = 0;
    const now = Date.now();

    for (const conv of pool) {
      topicCounts[conv.topic] = (topicCounts[conv.topic] ?? 0) + 1;
      const age = now - conv.generatedAt;
      if (age > oldestAge) oldestAge = age;
    }

    return {
      size: pool.length,
      capacity: this.capacity,
      topicCounts,
      oldestAge,
    };
  }

  /** Get set of topics already generated for diversity tracking */
  getGeneratedTopics(worldId: string): string[] {
    const topics = this.generatedTopics.get(worldId);
    return topics ? Array.from(topics) : [];
  }

  /** Remove all conversations for a world */
  clear(worldId: string): void {
    this.pools.delete(worldId);
    this.generatedTopics.delete(worldId);
  }

  /** Remove all conversations from all worlds */
  clearAll(): void {
    this.pools.clear();
    this.generatedTopics.clear();
  }

  /** Evict conversations older than evictGameHours */
  private evictStale(worldId: string, currentGameHour: number): void {
    const pool = this.pools.get(worldId);
    if (!pool) return;

    const before = pool.length;
    const filtered = pool.filter((conv) => {
      if (conv.gameHourGenerated === undefined) return true; // keep if no game hour
      return currentGameHour - conv.gameHourGenerated < this.evictGameHours;
    });

    if (filtered.length < before) {
      this.pools.set(worldId, filtered);
    }
  }
}

// ── Background replenishment ─────────────────────────────────────────

export interface ReplenishmentConfig {
  pool: NpcConversationPool;
  worldId: string;
  /** Function that generates a single conversation for the pool */
  generateFn: () => Promise<PooledConversation | null>;
  /** Max concurrent generation requests (default 3) */
  maxConcurrent?: number;
  /** Target count to fill to (default: replenishThreshold) */
  targetCount?: number;
}

/**
 * Replenish the pool up to targetCount.
 * Respects maxConcurrent rate limit.
 * Returns the number of conversations added.
 */
export async function replenishPool(config: ReplenishmentConfig): Promise<number> {
  const {
    pool,
    worldId,
    generateFn,
    maxConcurrent = 3,
    targetCount,
  } = config;

  const target = targetCount ?? DEFAULT_REPLENISH_THRESHOLD;
  let added = 0;
  const needed = target - pool.size(worldId);

  if (needed <= 0) return 0;

  // Generate in batches respecting concurrency limit
  let remaining = needed;
  while (remaining > 0 && !pool.isFull(worldId)) {
    const batchSize = Math.min(remaining, maxConcurrent);
    const promises: Array<Promise<PooledConversation | null>> = [];

    for (let i = 0; i < batchSize; i++) {
      promises.push(
        generateFn().catch(() => null),
      );
    }

    const results = await Promise.all(promises);

    for (const conv of results) {
      if (conv && pool.add(worldId, conv)) {
        added++;
      }
    }

    remaining -= batchSize;
  }

  return added;
}

// ── Batch-aware replenishment ───────────────────────────────────────

export interface BatchReplenishmentConfig {
  pool: NpcConversationPool;
  worldId: string;
  /** Function that generates a batch of conversations for the pool */
  batchGenerateFn: (count: number) => Promise<Array<PooledConversation | null>>;
  /** Number of conversations per LLM batch call (default 3-5) */
  batchSize?: number;
  /** Target count to fill to (default: replenishThreshold) */
  targetCount?: number;
}

/**
 * Replenish the pool using batch generation.
 * Each LLM call generates `batchSize` conversations at once (3-5x faster).
 * Falls back gracefully if batch generation returns partial results.
 * Returns the number of conversations added.
 */
export async function replenishPoolBatch(config: BatchReplenishmentConfig): Promise<number> {
  const {
    pool,
    worldId,
    batchGenerateFn,
    batchSize = 4,
    targetCount,
  } = config;

  const target = targetCount ?? DEFAULT_REPLENISH_THRESHOLD;
  let added = 0;
  let needed = target - pool.size(worldId);

  if (needed <= 0) return 0;

  // Generate in batch calls
  while (needed > 0 && !pool.isFull(worldId)) {
    const thisBatch = Math.min(needed, batchSize);
    let results: Array<PooledConversation | null>;
    try {
      results = await batchGenerateFn(thisBatch);
    } catch {
      // Batch generation failed entirely — stop trying
      break;
    }

    for (const conv of results) {
      if (conv && pool.add(worldId, conv)) {
        added++;
      }
    }

    needed = target - pool.size(worldId);

    // If batch produced nothing, stop to avoid infinite loop
    if (results.every(r => r === null)) break;
  }

  return added;
}

// ── Singleton instance ───────────────────────────────────────────────

export const npcConversationPool = new NpcConversationPool();
