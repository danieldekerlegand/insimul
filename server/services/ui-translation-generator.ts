/**
 * UI Translation Generator
 *
 * Generates target-language UI translation files dynamically via LLM
 * for any world language. Takes the English translation file (en/common.json)
 * as input and produces a complete translation for the world's target language.
 */

import type { ILLMProvider } from "./llm-provider.js";
import { getDefaultLLMProvider } from "./llm-provider.js";

/**
 * Generate a complete UI translation file for a target language.
 * Uses the English translation keys as the source and translates via LLM.
 *
 * @param englishTranslations - The en/common.json content
 * @param targetLanguage - The language to translate to (e.g., "French", "Arabic")
 * @param options - Additional options for language variants
 * @returns The translated JSON object with the same key structure
 */
export async function generateUITranslations(
  englishTranslations: Record<string, unknown>,
  targetLanguage: string,
  options: {
    /** Language variant hint (e.g., "Louisiana French" vs "Standard French") */
    languageVariant?: string;
    /** LLM provider override */
    provider?: ILLMProvider;
  } = {},
): Promise<Record<string, unknown>> {
  const llm = options.provider ?? getDefaultLLMProvider();

  if (!llm.isConfigured()) {
    console.warn('[UITranslation] LLM provider not configured, returning English');
    return englishTranslations;
  }

  const result: Record<string, unknown> = {};

  // Process each top-level namespace separately to stay within token limits
  for (const [namespace, values] of Object.entries(englishTranslations)) {
    // Skip system namespace — never translated
    if (namespace === 'system') {
      result[namespace] = values;
      continue;
    }

    try {
      const translated = await translateNamespace(
        namespace,
        values as Record<string, string>,
        targetLanguage,
        options.languageVariant,
        llm,
      );
      result[namespace] = translated;
    } catch (err: any) {
      console.error(`[UITranslation] Failed to translate namespace '${namespace}':`, err.message);
      result[namespace] = values; // Fall back to English
    }
  }

  return result;
}

async function translateNamespace(
  namespace: string,
  entries: Record<string, string>,
  targetLanguage: string,
  languageVariant: string | undefined,
  provider: ILLMProvider,
): Promise<Record<string, string>> {
  const keys = Object.keys(entries);
  const values = Object.values(entries);

  const variantNote = languageVariant
    ? ` Use ${languageVariant} vocabulary and expressions where they differ from standard ${targetLanguage}.`
    : '';

  const prompt = `Translate the following game UI strings from English to ${targetLanguage}.${variantNote}

These are interface labels for a language-learning RPG game. Keep translations SHORT (1-3 words where possible), natural, and contextually appropriate.

Return ONLY valid JSON with the same keys. No markdown, no explanation.

${JSON.stringify(entries, null, 2)}`;

  const response = await provider.generateText(prompt, {
    systemPrompt: 'You are a translation engine specializing in game UI localization. Return only valid JSON objects.',
    temperature: 0.1,
    maxTokens: 2000,
  });

  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    // Validate that all keys are present
    for (const key of keys) {
      if (!(key in parsed)) {
        parsed[key] = entries[key]; // Fall back to English for missing keys
      }
    }
    return parsed;
  } catch {
    console.warn(`[UITranslation] Failed to parse translation for namespace '${namespace}', falling back to English`);
    return entries;
  }
}
