/**
 * World Translation Pre-Generation Service
 *
 * Runs during world creation to pre-generate translations for common vocabulary,
 * location names, NPC titles, and game-specific terms. Stores results in the
 * WordTranslationCache collection to avoid runtime LLM calls.
 *
 * Uses the same batch-translate pattern as item-translation.ts.
 */

import type { ILLMProvider } from "./llm-provider.js";
import { getDefaultLLMProvider } from "./llm-provider.js";
import { storage } from "../db/storage.js";

interface TranslationEntry {
  word: string;
  translation: string;
  partOfSpeech?: string;
}

/**
 * Pre-generate translations for a world during creation.
 * Translates common vocabulary, location names, and game terms.
 */
export async function preGenerateWorldTranslations(
  worldId: string,
  targetLanguage: string,
  options: {
    /** Location/building names to translate */
    locationNames?: string[];
    /** NPC role/occupation titles to translate */
    npcTitles?: string[];
    /** CEFR level to determine vocabulary range */
    cefrLevel?: string;
    /** LLM provider override */
    provider?: ILLMProvider;
  } = {},
): Promise<{ translated: number; errors: number }> {
  const llm = options.provider ?? getDefaultLLMProvider();

  if (!llm.isConfigured()) {
    console.warn('[WorldTranslation] LLM provider not configured, skipping pre-generation');
    return { translated: 0, errors: 0 };
  }

  let totalTranslated = 0;
  let totalErrors = 0;

  // 1. Translate common game terms
  const gameTerms = [
    'quest', 'reward', 'gold', 'experience', 'health', 'energy',
    'inventory', 'map', 'save', 'load', 'talk', 'enter', 'examine',
    'pick up', 'use', 'open', 'trade', 'read', 'craft', 'cook',
    'fish', 'harvest', 'mine', 'sleep', 'pray', 'steal',
    'weapon', 'armor', 'accessory', 'consumable', 'material',
    'beginner', 'intermediate', 'advanced', 'complete', 'failed',
  ];

  console.log(`[WorldTranslation] Pre-generating translations for world ${worldId} (${targetLanguage})`);

  const gameTermResults = await batchTranslateWords(gameTerms, targetLanguage, llm);
  if (gameTermResults.length > 0) {
    const count = await (storage as any).bulkUpsertTranslations(worldId, targetLanguage, gameTermResults);
    totalTranslated += count;
    console.log(`[WorldTranslation] Game terms: ${count} cached`);
  }

  // 2. Translate location/building names
  if (options.locationNames && options.locationNames.length > 0) {
    const locationResults = await batchTranslateWords(options.locationNames, targetLanguage, llm);
    if (locationResults.length > 0) {
      const count = await (storage as any).bulkUpsertTranslations(worldId, targetLanguage, locationResults);
      totalTranslated += count;
      console.log(`[WorldTranslation] Location names: ${count} cached`);
    }
  }

  // 3. Translate NPC titles/occupations
  if (options.npcTitles && options.npcTitles.length > 0) {
    const titleResults = await batchTranslateWords(options.npcTitles, targetLanguage, llm);
    if (titleResults.length > 0) {
      const count = await (storage as any).bulkUpsertTranslations(worldId, targetLanguage, titleResults);
      totalTranslated += count;
      console.log(`[WorldTranslation] NPC titles: ${count} cached`);
    }
  }

  console.log(`[WorldTranslation] Complete: ${totalTranslated} translations cached, ${totalErrors} errors`);
  return { translated: totalTranslated, errors: totalErrors };
}

/**
 * Batch-translate an array of English words/phrases into the target language.
 * Returns translations in the same order.
 */
async function batchTranslateWords(
  words: string[],
  targetLanguage: string,
  provider: ILLMProvider,
  batchSize: number = 50,
): Promise<TranslationEntry[]> {
  const results: TranslationEntry[] = [];

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    try {
      const batchResults = await translateWordBatch(batch, targetLanguage, provider);
      results.push(...batchResults);
    } catch (err: any) {
      console.error(`[WorldTranslation] Batch ${i / batchSize + 1} failed:`, err.message);
    }
  }

  return results;
}

async function translateWordBatch(
  words: string[],
  targetLanguage: string,
  provider: ILLMProvider,
): Promise<TranslationEntry[]> {
  const wordList = words.map((w, i) => `${i + 1}. ${w}`).join('\n');

  const prompt = `Translate the following English words/phrases to ${targetLanguage}. Return ONLY valid JSON array with no markdown.

Words:
${wordList}

Return format: [{"word": "english_word", "translation": "translated_word", "partOfSpeech": "noun/verb/adj/etc"}]`;

  const response = await provider.generateText(prompt, {
    systemPrompt: 'You are a translation engine. Return only valid JSON arrays.',
    temperature: 0.1,
    maxTokens: 2000,
  });

  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e: any) => e.word && e.translation);
  } catch {
    console.warn('[WorldTranslation] Failed to parse batch response');
    return [];
  }
}
