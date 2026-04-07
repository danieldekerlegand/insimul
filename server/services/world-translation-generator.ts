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
import { ACTION_LABEL_WORDS, BUILDING_TYPE_LABELS } from "../../shared/language/action-labels.js";
import { NOTIFICATION_LABEL_WORDS } from "../../shared/language/notification-labels.js";
import { IN_WORLD_TEXT_WORDS } from "../../shared/language/in-world-text.js";

interface TranslationEntry {
  word: string;
  translation: string;
  partOfSpeech?: string;
}

/** Common game UI terms pre-translated for every world */
export const GAME_TERMS = [
  'quest', 'reward', 'gold', 'experience', 'health', 'energy',
  'inventory', 'map', 'save', 'load', 'talk', 'enter', 'examine',
  'pick up', 'use', 'open', 'trade', 'read', 'craft', 'cook',
  'fish', 'harvest', 'mine', 'sleep', 'pray', 'steal',
  'weapon', 'armor', 'accessory', 'consumable', 'material',
  'beginner', 'intermediate', 'advanced', 'complete', 'failed',
];

/**
 * Get CEFR-appropriate vocabulary words from the frequency data.
 * Loads the word-frequency-ranks.json and returns words up to the given CEFR level.
 * For example, cefrLevel='A2' returns A1 + A2 words.
 */
export function getCEFRVocabularyWords(
  languageCode: string,
  cefrLevel: string,
): string[] {
  try {
    // Dynamic import not possible for JSON in sync context — use require-style
    // The frequency data is bundled at build time
    const frequencyData = getFrequencyDataSync();
    if (!frequencyData || !frequencyData[languageCode]) return [];

    const langData = frequencyData[languageCode] as Record<string, string[]>;
    const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const targetIndex = cefrOrder.indexOf(cefrLevel.toUpperCase());
    if (targetIndex === -1) return [];

    const words: string[] = [];
    for (let i = 0; i <= targetIndex; i++) {
      const band = langData[cefrOrder[i]];
      if (band) words.push(...band);
    }
    return words;
  } catch {
    return [];
  }
}

/** Cached frequency data (loaded once) */
let _frequencyData: Record<string, any> | null = null;

function getFrequencyDataSync(): Record<string, any> | null {
  if (_frequencyData) return _frequencyData;
  try {
    // Use dynamic import pattern for ESM compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.resolve(__dirname, '../../data/seed/language/word-frequency-ranks.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    _frequencyData = data;
    return data;
  } catch {
    return null;
  }
}

/** Map target language name to ISO code for frequency data lookup */
export function languageToCode(language: string): string {
  const map: Record<string, string> = {
    'french': 'fr', 'français': 'fr',
    'spanish': 'es', 'español': 'es',
    'german': 'de', 'deutsch': 'de',
    'italian': 'it', 'italiano': 'it',
    'portuguese': 'pt', 'português': 'pt',
    'japanese': 'ja', '日本語': 'ja',
    'chinese': 'zh', '中文': 'zh',
    'korean': 'ko', '한국어': 'ko',
  };
  return map[language.toLowerCase()] || language.toLowerCase().slice(0, 2);
}

/**
 * Pre-generate translations for a world during creation.
 * Translates common vocabulary, CEFR-level words, location names, and game terms.
 */
export async function preGenerateWorldTranslations(
  worldId: string,
  targetLanguage: string,
  options: {
    /** Location/building names to translate */
    locationNames?: string[];
    /** NPC role/occupation titles to translate */
    npcTitles?: string[];
    /** Custom word list to translate */
    customWords?: string[];
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

  console.log(`[WorldTranslation] Pre-generating translations for world ${worldId} (${targetLanguage})`);

  // 1. Translate common game terms
  const gameTermResults = await batchTranslateWords(GAME_TERMS, targetLanguage, llm);
  if (gameTermResults.length > 0) {
    const count = await storage.bulkUpsertTranslations(worldId, targetLanguage, gameTermResults);
    totalTranslated += count;
    console.log(`[WorldTranslation] Game terms: ${count} cached`);
  }

  // 2. Translate action labels, building type labels, and notification labels
  const uiLabels = [...ACTION_LABEL_WORDS, ...BUILDING_TYPE_LABELS, ...NOTIFICATION_LABEL_WORDS, ...IN_WORLD_TEXT_WORDS];
  const uiLabelResults = await batchTranslateWords(uiLabels, targetLanguage, llm);
  if (uiLabelResults.length > 0) {
    const count = await storage.bulkUpsertTranslations(worldId, targetLanguage, uiLabelResults);
    totalTranslated += count;
    console.log(`[WorldTranslation] UI labels (actions + building types + notifications): ${count} cached`);
  }

  // 3. Translate CEFR-level vocabulary
  if (options.cefrLevel) {
    const langCode = languageToCode(targetLanguage);
    const cefrWords = getCEFRVocabularyWords(langCode, options.cefrLevel);
    if (cefrWords.length > 0) {
      // These are target-language words — translate them to English (reverse direction)
      const cefrResults = await batchTranslateWords(cefrWords, 'English', llm, 50, targetLanguage);
      if (cefrResults.length > 0) {
        // Store as targetLanguage translations: sourceWord=english, translation=target
        const flipped = cefrResults.map(e => ({
          word: e.translation, // English becomes the source
          translation: e.word, // Original target-language word is the translation
          partOfSpeech: e.partOfSpeech,
        }));
        const count = await storage.bulkUpsertTranslations(worldId, targetLanguage, flipped);
        totalTranslated += count;
        console.log(`[WorldTranslation] CEFR ${options.cefrLevel} vocabulary: ${count} cached`);
      }
    }
  }

  // 4. Translate location/building names
  if (options.locationNames && options.locationNames.length > 0) {
    const locationResults = await batchTranslateWords(options.locationNames, targetLanguage, llm);
    if (locationResults.length > 0) {
      const count = await storage.bulkUpsertTranslations(worldId, targetLanguage, locationResults);
      totalTranslated += count;
      console.log(`[WorldTranslation] Location names: ${count} cached`);
    }
  }

  // 5. Translate NPC titles/occupations
  if (options.npcTitles && options.npcTitles.length > 0) {
    const titleResults = await batchTranslateWords(options.npcTitles, targetLanguage, llm);
    if (titleResults.length > 0) {
      const count = await storage.bulkUpsertTranslations(worldId, targetLanguage, titleResults);
      totalTranslated += count;
      console.log(`[WorldTranslation] NPC titles: ${count} cached`);
    }
  }

  // 6. Translate custom words
  if (options.customWords && options.customWords.length > 0) {
    const customResults = await batchTranslateWords(options.customWords, targetLanguage, llm);
    if (customResults.length > 0) {
      const count = await storage.bulkUpsertTranslations(worldId, targetLanguage, customResults);
      totalTranslated += count;
      console.log(`[WorldTranslation] Custom words: ${count} cached`);
    }
  }

  console.log(`[WorldTranslation] Complete: ${totalTranslated} translations cached, ${totalErrors} errors`);
  return { translated: totalTranslated, errors: totalErrors };
}

/**
 * Batch-translate an array of words/phrases into the target language.
 * When sourceLanguage is provided, words are in that language (for reverse translation).
 * Returns translations in the same order.
 */
async function batchTranslateWords(
  words: string[],
  targetLanguage: string,
  provider: ILLMProvider,
  batchSize: number = 50,
  sourceLanguage: string = 'English',
): Promise<TranslationEntry[]> {
  const results: TranslationEntry[] = [];

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    try {
      const batchResults = await translateWordBatch(batch, targetLanguage, provider, sourceLanguage);
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
  sourceLanguage: string = 'English',
): Promise<TranslationEntry[]> {
  const wordList = words.map((w, i) => `${i + 1}. ${w}`).join('\n');

  const prompt = `Translate the following ${sourceLanguage} words/phrases to ${targetLanguage}. Return ONLY valid JSON array with no markdown.

Words:
${wordList}

Return format: [{"word": "english_word", "translation": "translated_word", "partOfSpeech": "noun/verb/adj/etc"}]`;

  const llmResponse = await provider.generate({
    prompt,
    systemPrompt: 'You are a translation engine. Return only valid JSON arrays.',
    temperature: 0.1,
    maxTokens: 2000,
  });
  const response = llmResponse.text;

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
