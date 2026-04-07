/**
 * Quest Translation Service
 *
 * Batch-translates quest titles, descriptions, and objectives into English
 * for quests that have target-language content but no English translations.
 * Uses the same batched LLM pattern as item-translation.ts.
 */

import type { ILLMProvider } from "./llm-provider.js";
import { getDefaultLLMProvider } from "./llm-provider.js";

interface QuestForTranslation {
  id: string;
  title: string;
  description: string;
  objectives: Array<{ description: string; [key: string]: any }> | null;
  targetLanguage: string;
}

interface TranslatedQuest {
  id: string;
  titleTranslation: string;
  descriptionTranslation: string;
  objectivesTranslation: string[] | null;
}

/**
 * Batch-translate quest text into English.
 * Processes quests in batches to stay within token limits.
 */
export async function batchTranslateQuests(
  quests: QuestForTranslation[],
  batchSize: number = 10,
  provider?: ILLMProvider,
): Promise<TranslatedQuest[]> {
  const llm = provider ?? getDefaultLLMProvider();

  if (!llm.isConfigured()) {
    console.warn('[QuestTranslation] LLM provider not configured, skipping translation');
    return [];
  }

  const results: TranslatedQuest[] = [];

  for (let i = 0; i < quests.length; i += batchSize) {
    const batch = quests.slice(i, i + batchSize);
    console.log(`[QuestTranslation] Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(quests.length / batchSize)} (${batch.length} quests)`);
    const batchResults = await translateQuestBatch(batch, llm);
    results.push(...batchResults);
  }

  return results;
}

async function translateQuestBatch(
  quests: QuestForTranslation[],
  provider: ILLMProvider,
): Promise<TranslatedQuest[]> {
  const questList = quests.map((quest, idx) => {
    const objectives = quest.objectives?.map(o => o.description).join('; ') || '';
    return `${idx}. Title: "${quest.title}" | Description: "${quest.description}" | Objectives: "${objectives}" | Language: ${quest.targetLanguage}`;
  }).join('\n');

  const prompt = `Translate the following quest texts into English. Each quest has a title, description, and objectives in the target language.

Return ONLY a JSON array with objects matching this exact format:
[
  {
    "index": 0,
    "titleTranslation": "English title",
    "descriptionTranslation": "English description",
    "objectivesTranslation": ["English objective 1", "English objective 2"]
  },
  ...
]

Keep translations natural and concise. Do not add explanations or commentary. Only return valid JSON.

Quests to translate:
${questList}`;

  try {
    const response = await provider.generate({ prompt, systemPrompt: 'You are a professional translator. Return only valid JSON.' });
    let text = (response.text || '').trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => {
      const quest = quests[item.index];
      if (!quest) return null;
      return {
        id: quest.id,
        titleTranslation: item.titleTranslation || quest.title,
        descriptionTranslation: item.descriptionTranslation || quest.description,
        objectivesTranslation: item.objectivesTranslation || null,
      };
    }).filter((r: TranslatedQuest | null): r is TranslatedQuest => r !== null);
  } catch (error) {
    console.error('[QuestTranslation] Batch translation failed:', error);
    return [];
  }
}
