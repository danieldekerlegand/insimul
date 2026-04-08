/**
 * Greeting Cache — pre-generated NPC greetings for instant first response.
 *
 * Stores multiple greeting variants per NPC keyed by worldId:npcId.
 * Greetings are generated in batches via a single LLM prompt for efficiency.
 * CEFR-aware: greeting language mode matches the player's proficiency level.
 *
 * Cache refresh triggers:
 *  - CEFR level change
 *  - Quest-relevant NPC content change
 *  - 1-hour TTL expiration
 */

import type { CEFRLevel } from '@shared/language/cefr';
import { getNPCLanguageBehavior } from '@shared/language/cefr-adaptation';

// ── Types ─────────────────────────────────────────────────────────────

export interface GreetingVariant {
  text: string;
  /** Variant context: time of day, weather, relationship tier */
  context: 'morning' | 'afternoon' | 'evening' | 'rainy' | 'general';
  /** CEFR level the greeting was generated for */
  cefrLevel: CEFRLevel;
  /** Timestamp when this greeting was generated */
  generatedAt: number;
  /** Pre-synthesized TTS audio (base64) — generated at cache time, not serving time */
  audioBase64?: string;
}

/** Optional TTS function for pre-synthesizing greeting audio at cache time */
export type GreetingTTSFunc = (text: string, voice?: string, gender?: string) => Promise<Buffer>;

export interface NPCGreetingEntry {
  npcId: string;
  npcName: string;
  worldId: string;
  greetings: GreetingVariant[];
  /** When this entry was last refreshed */
  lastRefreshed: number;
}

export interface GreetingGenerationRequest {
  npcId: string;
  npcName: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  occupation?: string;
  mood?: string;
  /** Target language for this world */
  targetLanguage: string;
}

export interface BatchGreetingResult {
  npcId: string;
  greetings: GreetingVariant[];
}

// ── Constants ─────────────────────────────────────────────────────────

const MAX_GREETINGS_PER_NPC = 5;
const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CONCURRENT_BATCHES = 3;
const BATCH_SIZE = 5; // NPCs per batch prompt
const MAX_NPCS_ON_LOAD = 20;

// ── Greeting Cache ───────────────────────────────────────────────────

export class GreetingCache {
  private cache = new Map<string, NPCGreetingEntry>();
  private activeBatches = 0;

  /** Build a cache key from worldId and npcId. */
  static key(worldId: string, npcId: string): string {
    return `${worldId}:${npcId}`;
  }

  /** Get a greeting for an NPC, optionally filtered by context and CEFR level. */
  get(
    worldId: string,
    npcId: string,
    context?: GreetingVariant['context'],
    cefrLevel?: CEFRLevel,
  ): string | null {
    const entry = this.cache.get(GreetingCache.key(worldId, npcId));
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.lastRefreshed > TTL_MS) {
      this.cache.delete(GreetingCache.key(worldId, npcId));
      return null;
    }

    let candidates = entry.greetings;

    // Filter by CEFR level if specified
    if (cefrLevel) {
      const cefrMatches = candidates.filter((g) => g.cefrLevel === cefrLevel);
      if (cefrMatches.length > 0) candidates = cefrMatches;
    }

    // Filter by context if specified
    if (context) {
      const contextMatches = candidates.filter(
        (g) => g.context === context || g.context === 'general',
      );
      if (contextMatches.length > 0) candidates = contextMatches;
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)].text;
  }

  /** Get a greeting with pre-synthesized audio for an NPC. Returns null if not found. */
  getWithAudio(
    worldId: string,
    npcId: string,
    context?: GreetingVariant['context'],
    cefrLevel?: CEFRLevel,
  ): { text: string; audioBase64?: string } | null {
    const entry = this.cache.get(GreetingCache.key(worldId, npcId));
    if (!entry) return null;

    if (Date.now() - entry.lastRefreshed > TTL_MS) {
      this.cache.delete(GreetingCache.key(worldId, npcId));
      return null;
    }

    let candidates = entry.greetings;

    if (cefrLevel) {
      const cefrMatches = candidates.filter((g) => g.cefrLevel === cefrLevel);
      if (cefrMatches.length > 0) candidates = cefrMatches;
    }

    if (context) {
      const contextMatches = candidates.filter(
        (g) => g.context === context || g.context === 'general',
      );
      if (contextMatches.length > 0) candidates = contextMatches;
    }

    if (candidates.length === 0) return null;
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    return { text: selected.text, audioBase64: selected.audioBase64 };
  }

  /** Check if an NPC has cached greetings (non-expired). */
  has(worldId: string, npcId: string): boolean {
    const entry = this.cache.get(GreetingCache.key(worldId, npcId));
    if (!entry) return false;
    if (Date.now() - entry.lastRefreshed > TTL_MS) {
      this.cache.delete(GreetingCache.key(worldId, npcId));
      return false;
    }
    return true;
  }

  /** Store greetings for an NPC. */
  set(worldId: string, npcId: string, npcName: string, greetings: GreetingVariant[]): void {
    const key = GreetingCache.key(worldId, npcId);
    this.cache.set(key, {
      npcId,
      npcName,
      worldId,
      greetings: greetings.slice(0, MAX_GREETINGS_PER_NPC),
      lastRefreshed: Date.now(),
    });
  }

  /** Invalidate greetings for a specific NPC. */
  invalidate(worldId: string, npcId: string): void {
    this.cache.delete(GreetingCache.key(worldId, npcId));
  }

  /** Invalidate all greetings for a world (e.g., on CEFR level change). */
  invalidateWorld(worldId: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (entry.worldId === worldId) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /** Clear the entire cache. */
  clear(): void {
    this.cache.clear();
  }

  /** Number of NPC entries in the cache. */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Build a batch LLM prompt to generate greetings for multiple NPCs.
   * Returns the prompt string and the list of NPC IDs in order.
   */
  static buildBatchPrompt(
    npcs: GreetingGenerationRequest[],
    cefrLevel: CEFRLevel,
    targetLanguage: string,
  ): string {
    const langBehavior = getNPCLanguageBehavior(cefrLevel, 'greeting-gen', targetLanguage);

    let prompt = `Generate short NPC greetings for a language-learning game.\n`;
    prompt += `Target language: ${targetLanguage}\n`;
    prompt += `Player proficiency: ${cefrLevel}\n`;
    prompt += `${langBehavior.promptDirective}\n\n`;
    prompt += `For each NPC below, generate exactly 5 greeting lines (one per context: morning, afternoon, evening, rainy, general).\n`;
    prompt += `Each greeting should be 1-2 sentences, in character, and match the NPC's personality.\n`;
    prompt += `Format each NPC section as:\n`;
    prompt += `===NPC:npcId===\n`;
    prompt += `morning: <greeting>\n`;
    prompt += `afternoon: <greeting>\n`;
    prompt += `evening: <greeting>\n`;
    prompt += `rainy: <greeting>\n`;
    prompt += `general: <greeting>\n\n`;

    for (const npc of npcs) {
      const p = npc.personality;
      const traits: string[] = [];
      if (p.extroversion > 0.6) traits.push('outgoing');
      else if (p.extroversion < 0.4) traits.push('reserved');
      if (p.agreeableness > 0.6) traits.push('warm');
      if (p.neuroticism > 0.6) traits.push('anxious');
      if (p.openness > 0.6) traits.push('curious');

      prompt += `===NPC:${npc.npcId}===\n`;
      prompt += `Name: ${npc.npcName}\n`;
      prompt += `Personality: ${traits.join(', ') || 'balanced'}\n`;
      if (npc.occupation) prompt += `Occupation: ${npc.occupation}\n`;
      if (npc.mood) prompt += `Current mood: ${npc.mood}\n`;
      prompt += `\n`;
    }

    return prompt;
  }

  /**
   * Parse a batch LLM response into greeting results per NPC.
   */
  static parseBatchResponse(
    response: string,
    npcIds: string[],
    cefrLevel: CEFRLevel,
  ): BatchGreetingResult[] {
    const results: BatchGreetingResult[] = [];
    const now = Date.now();

    const contexts: GreetingVariant['context'][] = [
      'morning', 'afternoon', 'evening', 'rainy', 'general',
    ];

    // Split by NPC sections
    const sections = response.split(/===NPC:/);

    for (const section of sections) {
      if (!section.trim()) continue;

      // Extract NPC ID from section header
      const headerMatch = section.match(/^([^=\s]+)===/);
      if (!headerMatch) continue;

      const npcId = headerMatch[1];
      if (!npcIds.includes(npcId)) continue;

      const greetings: GreetingVariant[] = [];

      for (const ctx of contexts) {
        const regex = new RegExp(`${ctx}:\\s*(.+?)(?:\\n|$)`, 'i');
        const match = section.match(regex);
        if (match?.[1]?.trim()) {
          greetings.push({
            text: match[1].trim(),
            context: ctx,
            cefrLevel,
            generatedAt: now,
          });
        }
      }

      if (greetings.length > 0) {
        results.push({ npcId, greetings });
      }
    }

    return results;
  }

  /**
   * Generate greetings for a batch of NPCs using the provided LLM.
   * Respects concurrent batch limits.
   * If ttsFunc is provided, pre-synthesizes TTS audio at cache time (not serving time).
   */
  async generateBatch(
    worldId: string,
    npcs: GreetingGenerationRequest[],
    cefrLevel: CEFRLevel,
    targetLanguage: string,
    llmStream: (prompt: string, systemPrompt: string) => AsyncIterable<string>,
    ttsFunc?: GreetingTTSFunc,
  ): Promise<BatchGreetingResult[]> {
    if (this.activeBatches >= MAX_CONCURRENT_BATCHES) {
      return [];
    }

    this.activeBatches++;
    try {
      const prompt = GreetingCache.buildBatchPrompt(npcs, cefrLevel, targetLanguage);
      const npcIds = npcs.map((n) => n.npcId);

      let fullResponse = '';
      for await (const token of llmStream(prompt, 'You are a greeting generator for NPCs in a language-learning game.')) {
        fullResponse += token;
      }

      const results = GreetingCache.parseBatchResponse(fullResponse, npcIds, cefrLevel);

      // Pre-synthesize TTS audio for all greetings (fire-and-forget per greeting)
      if (ttsFunc) {
        const ttsPromises: Promise<void>[] = [];
        for (const result of results) {
          for (const greeting of result.greetings) {
            ttsPromises.push(
              ttsFunc(greeting.text)
                .then(buf => {
                  greeting.audioBase64 = buf.toString('base64');
                })
                .catch(err => {
                  // Non-fatal: greeting works without pre-synthesized audio
                  console.warn(`[GreetingCache] TTS pre-synthesis failed for "${greeting.text.slice(0, 30)}...":`, err?.message);
                }),
            );
          }
        }
        await Promise.all(ttsPromises);
      }

      // Store results in cache
      for (const result of results) {
        const npc = npcs.find((n) => n.npcId === result.npcId);
        if (npc) {
          this.set(worldId, result.npcId, npc.npcName, result.greetings);
        }
      }

      return results;
    } finally {
      this.activeBatches--;
    }
  }

  /**
   * Trigger batch greeting generation for the nearest NPCs on world/session load.
   * Splits NPCs into batches and generates concurrently (up to MAX_CONCURRENT_BATCHES).
   */
  async warmOnLoad(
    worldId: string,
    npcs: GreetingGenerationRequest[],
    cefrLevel: CEFRLevel,
    targetLanguage: string,
    llmStream: (prompt: string, systemPrompt: string) => AsyncIterable<string>,
    ttsFunc?: GreetingTTSFunc,
  ): Promise<number> {
    // Only warm the nearest 20 NPCs
    const toWarm = npcs.slice(0, MAX_NPCS_ON_LOAD);

    // Split into batches of BATCH_SIZE
    const batches: GreetingGenerationRequest[][] = [];
    for (let i = 0; i < toWarm.length; i += BATCH_SIZE) {
      batches.push(toWarm.slice(i, i + BATCH_SIZE));
    }

    let totalGenerated = 0;

    // Process batches respecting concurrent limit
    for (const batch of batches) {
      try {
        const results = await this.generateBatch(
          worldId, batch, cefrLevel, targetLanguage, llmStream, ttsFunc,
        );
        for (const r of results) {
          totalGenerated += r.greetings.length;
        }
      } catch (err: any) {
        console.error('[GreetingCache] Batch generation error:', err.message);
      }
    }

    return totalGenerated;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────

export const greetingCache = new GreetingCache();
