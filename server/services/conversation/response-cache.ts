/**
 * Response Cache for Identical Exchanges
 *
 * Caches LLM responses for generic, context-independent messages (greetings,
 * farewells, simple social exchanges) so that repeated identical interactions
 * don't require LLM round-trips.
 *
 * Key design:
 *  - LRU with TTL (max 500 entries, 15-minute TTL)
 *  - Cache key: hash of npcId + CEFR level + canonical message + turn number
 *  - Up to 3 response variants per key for natural variation
 *  - Only caches generic messages; quest-related or long messages bypass cache
 *  - Scoped per NPC + CEFR level (shared across players)
 */

import { canonicalizeMessage } from './speculative-cache.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface CachedResponse {
  text: string;
  timestamp: number;
}

interface ResponseEntry {
  /** Up to MAX_VARIANTS responses for this key */
  responses: CachedResponse[];
  lastAccessedAt: number;
}

// ── Constants ────────────────────────────────────────────────────────

const DEFAULT_MAX_SIZE = 500;
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_VARIANTS = 3;

// ── Cacheability check ──────────────────────────────────────────────

/** Greeting patterns (case-insensitive) */
const GREETING_PATTERNS = /^(hi|hello|hey|bonjour|salut|bonsoir|coucou|yo|hola|howdy|sup|what'?s up|good (morning|afternoon|evening|day))[\s!?.]*$/i;

/** Farewell patterns */
const FAREWELL_PATTERNS = /^(bye|goodbye|au revoir|adieu|see (you|ya)|later|ciao|bonne (nuit|journée)|à bientôt|à plus)[\s!?.]*$/i;

/** Simple social patterns */
const SIMPLE_SOCIAL_PATTERNS = /^(yes|no|ok|okay|sure|thanks|thank you|merci|please|s'il vous plaît|oui|non|d'accord|bien sûr|how are you|comment allez-vous|comment ça va|ça va|who are you|what do you do|where am I|tell me about yourself)[\s!?.]*$/i;

/** Quest keywords that disqualify caching */
const QUEST_KEYWORDS = /\b(quest|mission|task|objective|help me|need help|looking for|cherche|aide|besoin|find|retrieve|deliver|defeat|solve|puzzle|clue|reward|item|artifact)\b/i;

/**
 * Determine whether a message is eligible for response caching.
 * Only generic, context-independent messages are cacheable.
 */
export function isCacheableMessage(message: string): boolean {
  const trimmed = message.trim();

  // Long messages are never cacheable
  if (trimmed.length > 100) return false;

  // Quest-related messages are never cacheable
  if (QUEST_KEYWORDS.test(trimmed)) return false;

  // Only cache greetings, farewells, and simple social patterns
  return (
    GREETING_PATTERNS.test(trimmed) ||
    FAREWELL_PATTERNS.test(trimmed) ||
    SIMPLE_SOCIAL_PATTERNS.test(trimmed)
  );
}

// ── Cache ────────────────────────────────────────────────────────────

export class ResponseCache {
  private cache = new Map<string, ResponseEntry>();
  private readonly maxSize: number;
  private readonly ttlMs: number;

  private hits = 0;
  private misses = 0;

  constructor(options?: { maxSize?: number; ttlMs?: number }) {
    this.maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
    this.ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  }

  // ── Key helpers ──────────────────────────────────────────────────

  /**
   * Build a cache key from NPC ID, CEFR level, canonical message, and turn number.
   * Shared across players for the same NPC + proficiency level.
   */
  static makeKey(npcId: string, cefrLevel: string, message: string, turnNumber: number): string {
    const canonical = canonicalizeMessage(message);
    return `resp:${npcId}:${cefrLevel}:${turnNumber}:${canonical}`;
  }

  // ── Lookup ───────────────────────────────────────────────────────

  /**
   * Retrieve a cached response for the given key.
   * Randomly selects from available variants for natural variation.
   * Returns null if not found or expired.
   */
  get(key: string): CachedResponse | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.lastAccessedAt > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Filter out expired individual responses
    const valid = entry.responses.filter(r => Date.now() - r.timestamp <= this.ttlMs);
    if (valid.length === 0) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update entry with only valid responses
    entry.responses = valid;

    // LRU: move to end
    this.cache.delete(key);
    entry.lastAccessedAt = Date.now();
    this.cache.set(key, entry);

    this.hits++;

    // Randomly select from variants
    const idx = Math.floor(Math.random() * valid.length);
    return valid[idx];
  }

  // ── Storage ──────────────────────────────────────────────────────

  /**
   * Store a response for the given key. Maintains up to MAX_VARIANTS
   * responses per key for variation.
   */
  set(key: string, responseText: string): void {
    const now = Date.now();
    let entry = this.cache.get(key);

    if (entry) {
      // Avoid duplicate responses
      const isDuplicate = entry.responses.some(r => r.text === responseText);
      if (!isDuplicate) {
        entry.responses.push({ text: responseText, timestamp: now });
        // Keep only most recent MAX_VARIANTS
        if (entry.responses.length > MAX_VARIANTS) {
          entry.responses = entry.responses.slice(-MAX_VARIANTS);
        }
      }
      // LRU: move to end
      this.cache.delete(key);
      entry.lastAccessedAt = now;
      this.cache.set(key, entry);
    } else {
      this.evictIfNeeded();
      this.cache.set(key, {
        responses: [{ text: responseText, timestamp: now }],
        lastAccessedAt: now,
      });
    }
  }

  // ── Invalidation ─────────────────────────────────────────────────

  /** Remove a specific cache entry */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /** Clear all cached responses */
  clear(): void {
    this.cache.clear();
  }

  // ── Metrics ──────────────────────────────────────────────────────

  /** Get hit rate as a fraction (0-1) */
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  /** Get cache statistics */
  getStats(): { hits: number; misses: number; hitRate: number; size: number; totalVariants: number } {
    let totalVariants = 0;
    Array.from(this.cache.values()).forEach(entry => {
      totalVariants += entry.responses.length;
    });
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      size: this.cache.size,
      totalVariants,
    };
  }

  /** Reset hit/miss counters */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  // ── Size ─────────────────────────────────────────────────────────

  /** Number of unique keys in the cache */
  size(): number {
    return this.cache.size;
  }

  // ── Eviction ─────────────────────────────────────────────────────

  private evictIfNeeded(): void {
    const now = Date.now();

    // First pass: remove expired entries
    const expiredKeys: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now - entry.lastAccessedAt > this.ttlMs) {
        expiredKeys.push(key);
      }
    });
    expiredKeys.forEach(key => this.cache.delete(key));

    // Second pass: evict oldest (first in Map) if over capacity
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }
  }
}

// ── Singleton ────────────────────────────────────────────────────────

export const responseCache = new ResponseCache();
