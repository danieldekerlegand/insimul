/**
 * LLM-based enrichment for historical event narratives.
 *
 * Three tiers of enrichment:
 *   Tier 1 — template-only (no LLM call)
 *   Tier 2 — batch enrichment (10-20 events per call, 1-2 sentences each)
 *   Tier 3 — individual enrichment (full context, 1-2 paragraphs each)
 */

import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from "../config/gemini.js";
import type { Truth } from "../../shared/schema.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorldContext {
  worldName: string;
  worldDescription?: string;
  era?: string;
  settlements?: Array<{ name: string; description?: string }>;
  countries?: Array<{ name: string; description?: string }>;
  characters?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    description?: string;
    occupation?: string;
  }>;
}

export interface EnrichedEvent {
  id: string;
  originalContent: string;
  enrichedContent: string;
  tier: 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// Tier classification
// ---------------------------------------------------------------------------

function classifyTier(event: Truth): 1 | 2 | 3 {
  const sig = event.historicalSignificance;
  if (sig === "world" || sig === "country") return 3;
  if (sig === "settlement" || sig === "family") return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Tier 1 — template enrichment (no LLM)
// ---------------------------------------------------------------------------

function enrichTier1Event(event: Truth): EnrichedEvent {
  // Keep original content as-is; no LLM needed.
  return {
    id: event.id,
    originalContent: event.content,
    enrichedContent: event.content,
    tier: 1,
  };
}

// ---------------------------------------------------------------------------
// Tier 2 — batch enrichment
// ---------------------------------------------------------------------------

export async function enrichTier2Events(
  events: Truth[],
  worldContext: WorldContext,
): Promise<EnrichedEvent[]> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }
  if (events.length === 0) return [];

  const ai = getGenAI();
  const results: EnrichedEvent[] = [];

  // Process in batches of 10-20
  const BATCH_SIZE = 15;
  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);

    const eventList = batch
      .map(
        (e, idx) =>
          `${idx + 1}. [${e.title}] ${e.content}${e.historicalEra ? ` (era: ${e.historicalEra})` : ""}`,
      )
      .join("\n");

    const settlementCtx =
      worldContext.settlements && worldContext.settlements.length > 0
        ? `Settlements: ${worldContext.settlements.map((s) => s.name).join(", ")}.`
        : "";

    const systemPrompt = `You enrich historical event summaries for the world "${worldContext.worldName}".${worldContext.worldDescription ? ` ${worldContext.worldDescription}` : ""}${worldContext.era ? ` Current era: ${worldContext.era}.` : ""} ${settlementCtx}

For each numbered event below, write a 1-2 sentence narrative description that adds color and context. Return ONLY a JSON array of objects with "index" (1-based) and "text" fields. No markdown fences.`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.FLASH,
        config: {
          systemInstruction: systemPrompt,
        },
        contents: eventList,
      });

      if (!response.text) {
        // Fall back to originals on empty response
        for (const e of batch) {
          results.push({
            id: e.id,
            originalContent: e.content,
            enrichedContent: e.content,
            tier: 2,
          });
        }
        continue;
      }

      // Parse JSON response — strip markdown fences if present
      const raw = response.text.replace(/```json\s*|```/g, "").trim();
      let parsed: Array<{ index: number; text: string }>;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // If parsing fails, return originals
        for (const e of batch) {
          results.push({
            id: e.id,
            originalContent: e.content,
            enrichedContent: e.content,
            tier: 2,
          });
        }
        continue;
      }

      // Map parsed results back to events
      const enrichmentMap = new Map(parsed.map((p) => [p.index, p.text]));
      for (let j = 0; j < batch.length; j++) {
        const e = batch[j];
        results.push({
          id: e.id,
          originalContent: e.content,
          enrichedContent: enrichmentMap.get(j + 1) ?? e.content,
          tier: 2,
        });
      }
    } catch (error) {
      console.error("Tier 2 enrichment batch failed:", error);
      for (const e of batch) {
        results.push({
          id: e.id,
          originalContent: e.content,
          enrichedContent: e.content,
          tier: 2,
        });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Tier 3 — individual enrichment
// ---------------------------------------------------------------------------

export async function enrichTier3Event(
  event: Truth,
  worldContext: WorldContext,
): Promise<EnrichedEvent> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const ai = getGenAI();

  // Build character summaries for involved characters
  const involvedChars =
    event.relatedCharacterIds && worldContext.characters
      ? worldContext.characters.filter((c) =>
          event.relatedCharacterIds!.includes(c.id),
        )
      : [];

  const charSummaries =
    involvedChars.length > 0
      ? `\nInvolved characters:\n${involvedChars.map((c) => `- ${c.firstName} ${c.lastName}${c.occupation ? `, ${c.occupation}` : ""}${c.description ? `: ${c.description}` : ""}`).join("\n")}`
      : "";

  const countriesCtx =
    worldContext.countries && worldContext.countries.length > 0
      ? `\nCountries: ${worldContext.countries.map((c) => c.name).join(", ")}.`
      : "";

  const settlementsCtx =
    worldContext.settlements && worldContext.settlements.length > 0
      ? `\nSettlements: ${worldContext.settlements.map((s) => s.name).join(", ")}.`
      : "";

  const systemPrompt = `You are a historian writing for the world "${worldContext.worldName}".${worldContext.worldDescription ? ` ${worldContext.worldDescription}` : ""}${worldContext.era ? ` Current era: ${worldContext.era}.` : ""}${countriesCtx}${settlementsCtx}${charSummaries}

Write a 1-2 paragraph narrative expanding on the event below. Be vivid but concise. Return ONLY the narrative text, no titles or labels.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODELS.FLASH,
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `Event: [${event.title}] ${event.content}${event.historicalEra ? ` (era: ${event.historicalEra})` : ""}${event.timeDescription ? ` (time: ${event.timeDescription})` : ""}`,
    });

    return {
      id: event.id,
      originalContent: event.content,
      enrichedContent: response.text ?? event.content,
      tier: 3,
    };
  } catch (error) {
    console.error(`Tier 3 enrichment failed for event ${event.id}:`, error);
    return {
      id: event.id,
      originalContent: event.content,
      enrichedContent: event.content,
      tier: 3,
    };
  }
}

// ---------------------------------------------------------------------------
// Main entry point — routes events to the appropriate tier
// ---------------------------------------------------------------------------

export async function enrichHistoricalEvents(
  events: Truth[],
  worldContext: WorldContext,
  tierOverride?: 1 | 2 | 3,
): Promise<EnrichedEvent[]> {
  const tier1: Truth[] = [];
  const tier2: Truth[] = [];
  const tier3: Truth[] = [];

  for (const event of events) {
    const tier = tierOverride ?? classifyTier(event);
    if (tier === 3) tier3.push(event);
    else if (tier === 2) tier2.push(event);
    else tier1.push(event);
  }

  const results: EnrichedEvent[] = [];

  // Tier 1 — synchronous templates
  for (const e of tier1) {
    results.push(enrichTier1Event(e));
  }

  // Tier 2 — batch LLM
  if (tier2.length > 0) {
    const enriched = await enrichTier2Events(tier2, worldContext);
    results.push(...enriched);
  }

  // Tier 3 — individual LLM (run concurrently with limit)
  if (tier3.length > 0) {
    const CONCURRENCY = 3;
    for (let i = 0; i < tier3.length; i += CONCURRENCY) {
      const chunk = tier3.slice(i, i + CONCURRENCY);
      const enriched = await Promise.all(
        chunk.map((e) => enrichTier3Event(e, worldContext)),
      );
      results.push(...enriched);
    }
  }

  return results;
}
