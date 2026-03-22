/**
 * Item Translation Service
 *
 * Batch-translates item names and descriptions into a target language
 * using the LLM provider interface, and stores the results as
 * `languageLearningData` on each item. This pre-generation avoids
 * runtime translation costs during gameplay.
 */

import type { ILLMProvider } from "./llm-provider.js";
import { getDefaultLLMProvider } from "./llm-provider.js";

interface ItemForTranslation {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

interface TranslatedItem {
  id: string;
  targetWord: string;
  pronunciation: string;
  category: string;
}

/**
 * Batch-translate item names into the target language.
 * Returns an array of { id, targetWord, pronunciation, category } objects.
 * Processes items in batches to stay within token limits.
 */
export async function batchTranslateItems(
  items: ItemForTranslation[],
  targetLanguage: string,
  batchSize: number = 50,
  provider?: ILLMProvider,
): Promise<TranslatedItem[]> {
  const llm = provider ?? getDefaultLLMProvider();

  if (!llm.isConfigured()) {
    console.warn('[ItemTranslation] LLM provider not configured, skipping translation');
    return [];
  }

  const results: TranslatedItem[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await translateBatch(batch, targetLanguage, llm);
    results.push(...batchResults);
  }

  return results;
}

async function translateBatch(
  items: ItemForTranslation[],
  targetLanguage: string,
  provider: ILLMProvider,
): Promise<TranslatedItem[]> {
  const itemList = items.map((item, idx) =>
    `${idx}. "${item.name}" (category: ${item.category || 'general'})`
  ).join('\n');

  const prompt = `Translate the following English item names into ${targetLanguage} for use in a language-learning game. For each item, provide:
1. The translated word/phrase in ${targetLanguage}
2. A pronunciation guide (romanized if the language uses non-Latin script)

Return ONLY a JSON array with objects matching this exact format:
[
  { "index": 0, "targetWord": "translated name", "pronunciation": "pronunciation guide" },
  ...
]

Do not add explanations or commentary. Only return valid JSON.

Items to translate:
${itemList}`;

  try {
    const response = await provider.generate({
      prompt,
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    const text = response.text.trim();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      console.warn('[ItemTranslation] Unexpected response format, expected array');
      return [];
    }

    return parsed.map((entry: any) => {
      const idx = entry.index;
      const item = items[idx];
      if (!item) return null;
      return {
        id: item.id,
        targetWord: entry.targetWord || item.name,
        pronunciation: entry.pronunciation || entry.targetWord || item.name,
        category: item.category || 'general',
      };
    }).filter(Boolean) as TranslatedItem[];
  } catch (error) {
    console.error('[ItemTranslation] Translation batch failed:', error);
    return [];
  }
}
