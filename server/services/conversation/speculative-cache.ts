/**
 * Speculative Response Cache
 *
 * Pre-generates responses for likely player opening messages when an NPC
 * is pre-warmed (player approaches). Common greetings and openers are
 * generated in parallel using the FAST model tier so that when the player
 * actually sends one of these messages, the response is served instantly.
 *
 * Key design:
 *  - Nested Map: worldId:npcId → canonical message → CachedResponse[]
 *  - Likely openings defined per CEFR level
 *  - TTL: 5 minutes, max 10 NPC entries (LRU eviction)
 *  - TTS audio pre-generated alongside text responses
 *  - Hit rate tracked via conversation-metrics
 */

import type { IStreamingLLMProvider, ConversationContext } from './providers/llm-provider.js';
import type { ITTSProvider, VoiceProfile } from './tts/tts-provider.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface SpeculativeResponse {
  /** Full text response from LLM */
  text: string;
  /** Pre-synthesized TTS audio buffer, if available */
  audio?: Uint8Array;
  /** Timestamp when this response was generated */
  timestamp: number;
}

interface NPCSpeculativeEntry {
  /** Canonical message → array of cached responses (up to 1 per canonical) */
  responses: Map<string, SpeculativeResponse>;
  /** Last access time for LRU eviction */
  lastAccessed: number;
}

// ── CEFR-based likely openings ───────────────────────────────────────

const LIKELY_OPENINGS_BY_CEFR: Record<string, string[]> = {
  A1: ['hello', 'hi', 'bonjour', 'who are you'],
  A2: ['hello', 'hi', 'bonjour', 'comment allez-vous', 'je cherche', 'who are you'],
  B1: ['hello', 'bonjour', 'tell me about', 'can you help me', 'comment allez-vous', 'who are you'],
  B2: ['hello', 'bonjour', 'tell me about', 'can you help me', 'comment allez-vous', 'who are you'],
  C1: ['hello', 'bonjour', 'tell me about', 'can you help me', 'comment allez-vous'],
  C2: ['hello', 'bonjour', 'tell me about', 'can you help me', 'comment allez-vous'],
};

/** Default openings when CEFR level is unknown */
const DEFAULT_OPENINGS = ['hello', 'hi', 'bonjour', 'who are you'];

// ── Canonicalization ─────────────────────────────────────────────────

/**
 * Canonicalize a player message for cache lookup.
 * Strips punctuation, lowercases, and trims to match against likely openings.
 */
export function canonicalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .replace(/[!?.,'"\-;:()]+/g, '')
    .trim();
}

// ── Cache ────────────────────────────────────────────────────────────

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_NPC_ENTRIES = 10;
const TOP_N_TO_GENERATE = 3;

export class SpeculativeResponseCache {
  /** Key: "worldId:npcId" → NPCSpeculativeEntry */
  private cache = new Map<string, NPCSpeculativeEntry>();

  private hits = 0;
  private misses = 0;

  // ── Key helpers ──────────────────────────────────────────────────

  static npcKey(worldId: string, npcId: string): string {
    return `${worldId}:${npcId}`;
  }

  // ── Lookup ───────────────────────────────────────────────────────

  /**
   * Check cache for a speculative response matching the player's first message.
   * Returns the response if found and not expired, null otherwise.
   */
  get(worldId: string, npcId: string, playerMessage: string): SpeculativeResponse | null {
    const key = SpeculativeResponseCache.npcKey(worldId, npcId);
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL on the entry
    if (Date.now() - entry.lastAccessed > TTL_MS) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    const canonical = canonicalizeMessage(playerMessage);
    const response = entry.responses.get(canonical);

    if (!response) {
      this.misses++;
      return null;
    }

    // Check per-response TTL
    if (Date.now() - response.timestamp > TTL_MS) {
      entry.responses.delete(canonical);
      this.misses++;
      return null;
    }

    // Update LRU
    entry.lastAccessed = Date.now();
    this.hits++;
    return response;
  }

  // ── Storage ──────────────────────────────────────────────────────

  /**
   * Store a speculative response for a given NPC and canonical message.
   */
  set(
    worldId: string,
    npcId: string,
    canonicalMessage: string,
    response: SpeculativeResponse,
  ): void {
    const key = SpeculativeResponseCache.npcKey(worldId, npcId);
    let entry = this.cache.get(key);

    if (!entry) {
      // Evict oldest entry if at capacity
      this.evictIfNeeded();
      entry = { responses: new Map(), lastAccessed: Date.now() };
      this.cache.set(key, entry);
    }

    entry.responses.set(canonicalMessage, response);
    entry.lastAccessed = Date.now();
  }

  // ── Invalidation ─────────────────────────────────────────────────

  /** Invalidate speculative cache for a specific NPC */
  invalidate(worldId: string, npcId: string): void {
    const key = SpeculativeResponseCache.npcKey(worldId, npcId);
    this.cache.delete(key);
  }

  /** Invalidate all speculative cache entries for a world */
  invalidateWorld(worldId: string): void {
    const prefix = `${worldId}:`;
    const keysToDelete: string[] = [];
    Array.from(this.cache.keys()).forEach((key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /** Clear entire cache */
  clear(): void {
    this.cache.clear();
  }

  // ── Metrics ──────────────────────────────────────────────────────

  /** Get hit rate as a fraction (0-1) */
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  /** Get raw hit/miss counts */
  getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      size: this.cache.size,
    };
  }

  /** Reset hit/miss counters */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  // ── Size ─────────────────────────────────────────────────────────

  /** Number of NPC entries in cache */
  size(): number {
    return this.cache.size;
  }

  /** Check if cache has any entry for this NPC */
  has(worldId: string, npcId: string): boolean {
    const key = SpeculativeResponseCache.npcKey(worldId, npcId);
    return this.cache.has(key);
  }

  // ── Eviction ─────────────────────────────────────────────────────

  private evictIfNeeded(): void {
    while (this.cache.size >= MAX_NPC_ENTRIES) {
      // Evict least recently accessed
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      Array.from(this.cache.entries()).forEach(([key, entry]) => {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = key;
        }
      });
      if (oldestKey) {
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  // ── Generation ───────────────────────────────────────────────────

  /**
   * Get the top N likely openings for a given CEFR level.
   */
  static getLikelyOpenings(cefrLevel?: string, topN: number = TOP_N_TO_GENERATE): string[] {
    const level = cefrLevel?.toUpperCase() ?? '';
    const openings = LIKELY_OPENINGS_BY_CEFR[level] ?? DEFAULT_OPENINGS;
    return openings.slice(0, topN);
  }

  /**
   * Pre-generate speculative responses for likely player openings.
   *
   * Called during pre-warm when player approaches an NPC. Generates
   * responses in parallel using the FAST model tier.
   *
   * @param worldId - World ID
   * @param npcId - NPC character ID
   * @param context - Pre-built conversation context (from pre-warm)
   * @param llmProvider - LLM provider for generation
   * @param cefrLevel - Player's CEFR level (determines which openings to pre-generate)
   * @param ttsProvider - Optional TTS provider for audio pre-generation
   * @param voiceProfile - Optional voice profile for TTS
   */
  async generate(
    worldId: string,
    npcId: string,
    context: ConversationContext,
    llmProvider: IStreamingLLMProvider,
    cefrLevel?: string,
    ttsProvider?: ITTSProvider | null,
    voiceProfile?: VoiceProfile,
  ): Promise<number> {
    const openings = SpeculativeResponseCache.getLikelyOpenings(cefrLevel, TOP_N_TO_GENERATE);

    // Skip if already cached for this NPC
    if (this.has(worldId, npcId)) {
      return 0;
    }

    let generated = 0;

    // Generate responses in parallel using FAST tier
    const promises = openings.map(async (opening) => {
      try {
        let fullText = '';
        const tokens = llmProvider.streamCompletion(opening, context, {
          modelTier: 'fast',
        });
        for await (const token of tokens) {
          fullText += token;
        }

        if (!fullText) return;

        const response: SpeculativeResponse = {
          text: fullText,
          timestamp: Date.now(),
        };

        // Pre-generate TTS audio if provider available
        if (ttsProvider && voiceProfile) {
          try {
            const audioChunks: Uint8Array[] = [];
            const audioStream = ttsProvider.synthesize(fullText, voiceProfile);
            for await (const chunk of audioStream) {
              const data = chunk.data instanceof Uint8Array
                ? chunk.data
                : new Uint8Array(chunk.data);
              audioChunks.push(data);
            }
            if (audioChunks.length > 0) {
              // Concatenate audio chunks
              const totalLength = audioChunks.reduce((sum, c) => sum + c.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of audioChunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }
              response.audio = combined;
            }
          } catch {
            // TTS pre-generation is best-effort
          }
        }

        this.set(worldId, npcId, opening, response);
        generated++;
      } catch {
        // Individual opening generation failure is non-fatal
      }
    });

    await Promise.all(promises);
    return generated;
  }
}

// ── Singleton ────────────────────────────────────────────────────────

export const speculativeCache = new SpeculativeResponseCache();
