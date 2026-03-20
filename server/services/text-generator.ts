/**
 * Procedural Text Generator
 *
 * Generates reading content (books, journals, letters, flyers, recipes) in the
 * target language at specific CEFR difficulty levels using the Gemini API.
 */

import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from '../config/gemini.js';
import type { InsertText } from '../../shared/schema.js';

export type TextCategory = 'book' | 'journal' | 'letter' | 'flyer' | 'recipe';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface TextGenerationParams {
  worldId: string;
  targetLanguage: string;
  category: TextCategory;
  cefrLevel: CefrLevel;
  theme?: string;
  pageCount?: number; // 1-4
  clueText?: string; // For main quest integration
}

export interface GeneratedPage {
  content: string;
  contentTranslation: string;
}

export interface VocabularyHighlight {
  word: string;
  translation: string;
  partOfSpeech: string;
}

export interface ComprehensionQuestion {
  question: string;
  questionTranslation: string;
  options: string[];
  correctIndex: number;
}

export interface GeneratedTextResult {
  title: string;
  titleTranslation: string;
  pages: GeneratedPage[];
  vocabularyHighlights: VocabularyHighlight[];
  comprehensionQuestions: ComprehensionQuestion[];
}

const CEFR_CONSTRAINTS: Record<CefrLevel, string> = {
  A1: 'Use ONLY present tense. Short sentences (5-8 words). 500 most common words. Simple subject-verb-object structure. No subordinate clauses.',
  A2: 'Present and past tense. Sentences up to 12 words. 1000 most common words. Basic connectors (and, but, because). Simple questions.',
  B1: 'All common tenses including subjunctive and conditional. Idiomatic expressions allowed. 2000+ words. Complex sentences with subordinate clauses.',
  B2: 'Literary language, metaphor, complex grammar. Unrestricted vocabulary. Varied sentence structures, passive voice, advanced connectors.',
};

const CATEGORY_PROMPTS: Record<TextCategory, string> = {
  book: 'Write a literary excerpt — fiction, memoir, or poetry. Include a narrative arc with a beginning and development.',
  journal: 'Write personal diary entries with dated headers (use realistic dates). Include personal reflections, daily observations, and emotional language.',
  letter: 'Write a letter with proper salutation and closing. Include a clear purpose (invitation, news, request, thank you).',
  flyer: 'Write an advertisement, announcement, or public notice. Use emphatic, attention-grabbing language. Include details like dates, locations, prices.',
  recipe: 'Write a cooking recipe with an ingredient list followed by numbered steps. Include quantities, cooking times, and temperatures.',
};

const DIFFICULTY_MAP: Record<CefrLevel, string> = {
  A1: 'beginner',
  A2: 'beginner',
  B1: 'intermediate',
  B2: 'advanced',
};

function buildPrompt(params: TextGenerationParams): string {
  const { targetLanguage, category, cefrLevel, pageCount = 2, theme, clueText } = params;

  const themeInstruction = theme ? `Theme/topic: ${theme}` : 'Choose an appropriate everyday topic.';
  const clueInstruction = clueText
    ? `\nIMPORTANT: Weave in this subtle clue naturally: "${clueText}". It should feel like part of the text, not forced.`
    : '';

  return `Generate a ${category} text in ${targetLanguage} for language learners at CEFR level ${cefrLevel}.

${CATEGORY_PROMPTS[category]}

Language constraints for ${cefrLevel}:
${CEFR_CONSTRAINTS[cefrLevel]}

${themeInstruction}${clueInstruction}

Requirements:
- Write ${pageCount} page(s), each 100-200 words in ${targetLanguage}
- Write ONLY in ${targetLanguage} (the content itself)
- Provide English translations for everything
- Include 10-15 vocabulary highlights (key words with translations and part of speech)
- Include 3-5 comprehension questions in ${targetLanguage} with English translations, 4 answer options each, and the correct answer index (0-based)

Return ONLY valid JSON in this exact format:
{
  "title": "Title in ${targetLanguage}",
  "titleTranslation": "Title in English",
  "pages": [
    { "content": "Page text in ${targetLanguage}", "contentTranslation": "Page text in English" }
  ],
  "vocabularyHighlights": [
    { "word": "word in ${targetLanguage}", "translation": "English translation", "partOfSpeech": "noun/verb/adjective/etc" }
  ],
  "comprehensionQuestions": [
    {
      "question": "Question in ${targetLanguage}?",
      "questionTranslation": "Question in English?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}

No markdown, no code fences, no explanation — just the JSON object.`;
}

function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return cleaned.trim();
}

function validateGeneratedText(result: GeneratedTextResult, params: TextGenerationParams): string[] {
  const errors: string[] = [];
  const expectedPages = params.pageCount ?? 2;

  if (!result.title || typeof result.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  if (!result.titleTranslation || typeof result.titleTranslation !== 'string') {
    errors.push('Missing or invalid titleTranslation');
  }
  if (!Array.isArray(result.pages) || result.pages.length === 0) {
    errors.push('Missing or empty pages array');
  } else if (result.pages.length !== expectedPages) {
    errors.push(`Expected ${expectedPages} pages, got ${result.pages.length}`);
  }
  for (const page of result.pages ?? []) {
    if (!page.content || !page.contentTranslation) {
      errors.push('Page missing content or contentTranslation');
      break;
    }
  }
  if (!Array.isArray(result.vocabularyHighlights) || result.vocabularyHighlights.length < 5) {
    errors.push(`Expected at least 5 vocabulary highlights, got ${result.vocabularyHighlights?.length ?? 0}`);
  }
  for (const vh of result.vocabularyHighlights ?? []) {
    if (!vh.word || !vh.translation || !vh.partOfSpeech) {
      errors.push('Vocabulary highlight missing word, translation, or partOfSpeech');
      break;
    }
  }
  if (!Array.isArray(result.comprehensionQuestions) || result.comprehensionQuestions.length < 3) {
    errors.push(`Expected at least 3 comprehension questions, got ${result.comprehensionQuestions?.length ?? 0}`);
  }
  for (const q of result.comprehensionQuestions ?? []) {
    if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
      errors.push('Comprehension question missing question or has fewer than 2 options');
      break;
    }
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      errors.push(`Invalid correctIndex ${q.correctIndex} for question with ${q.options.length} options`);
      break;
    }
  }

  return errors;
}

/**
 * Generate a single text using the Gemini API.
 * Validates the output and retries once if validation fails.
 */
export async function generateText(params: TextGenerationParams): Promise<GeneratedTextResult> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API is not configured. Set GEMINI_API_KEY or GEMINI_FREE_API_KEY.');
  }

  const ai = getGenAI();
  const prompt = buildPrompt(params);
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await ai.models.generateContent({
      model: GEMINI_MODELS.FLASH,
      config: {
        systemInstruction: 'You are a language-learning content creator. Generate reading materials for foreign language learners. Always return valid JSON.',
      },
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Gemini returned empty response');
    }

    const cleaned = stripCodeFences(response.text);
    let parsed: GeneratedTextResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      if (attempt === maxAttempts) {
        throw new Error(`Failed to parse Gemini response as JSON after ${maxAttempts} attempts`);
      }
      continue;
    }

    const errors = validateGeneratedText(parsed, params);
    if (errors.length === 0) {
      return parsed;
    }

    if (attempt === maxAttempts) {
      console.warn('[TextGenerator] Validation warnings on final attempt:', errors);
      // Return what we got — partial results are still useful
      return parsed;
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new Error('Text generation failed');
}

/**
 * Convert a GeneratedTextResult into an InsertText object for storage.
 */
export function generatedTextToInsertText(
  result: GeneratedTextResult,
  params: TextGenerationParams
): InsertText {
  const fullBody = result.pages.map((p) => p.content).join('\n\n---\n\n');
  const fullTranslation = result.pages.map((p) => p.contentTranslation).join('\n\n---\n\n');

  return {
    worldId: params.worldId,
    title: result.title,
    body: fullBody,
    textType: params.category,
    language: params.targetLanguage,
    difficulty: DIFFICULTY_MAP[params.cefrLevel],
    vocabularyWords: result.vocabularyHighlights.map((v) => v.word),
    translation: fullTranslation,
    tags: [params.cefrLevel, params.category],
    metadata: {
      titleTranslation: result.titleTranslation,
      cefrLevel: params.cefrLevel,
      pages: result.pages,
      vocabularyHighlights: result.vocabularyHighlights,
      comprehensionQuestions: result.comprehensionQuestions,
      generationPrompt: params.theme ?? null,
      clueText: params.clueText ?? null,
      isGenerated: true,
    },
  };
}

/**
 * Generate multiple texts in batch.
 */
export async function generateTextBatch(
  paramsList: TextGenerationParams[]
): Promise<GeneratedTextResult[]> {
  const results: GeneratedTextResult[] = [];
  // Process in chunks of 3 to avoid rate limits
  const chunkSize = 3;
  for (let i = 0; i < paramsList.length; i += chunkSize) {
    const chunk = paramsList.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map((p) => generateText(p)));
    results.push(...chunkResults);
    // Small delay between chunks to avoid rate limiting
    if (i + chunkSize < paramsList.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return results;
}

/**
 * Build the default starter set generation params for a language-learning world.
 * Returns params for 28 texts: 12 books (3 per CEFR level), 4 journals, 4 letters,
 * 4 flyers, 4 recipes (1 per level each).
 */
export function buildStarterSetParams(
  worldId: string,
  targetLanguage: string
): TextGenerationParams[] {
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const params: TextGenerationParams[] = [];

  // 12 books — 3 per CEFR level
  const bookThemes = [
    ['A trip to the market', 'My new friend', 'The village cat'],
    ['A summer vacation', 'The old bakery', 'A mysterious letter'],
    ['The forgotten garden', 'Memories of childhood', 'A chance encounter'],
    ['The painter of shadows', 'Letters never sent', 'The last performance'],
  ];
  for (let li = 0; li < levels.length; li++) {
    for (const theme of bookThemes[li]) {
      params.push({
        worldId,
        targetLanguage,
        category: 'book',
        cefrLevel: levels[li],
        theme,
        pageCount: li < 2 ? 2 : 3,
      });
    }
  }

  // 4 journals, 4 letters, 4 flyers, 4 recipes — 1 per level each
  const categories: TextCategory[] = ['journal', 'letter', 'flyer', 'recipe'];
  const categoryThemes: Record<TextCategory, string[]> = {
    journal: ['First day in a new town', 'Market day observations', 'A festival celebration', 'Reflections on a journey'],
    letter: ['Invitation to a party', 'News from home', 'A formal request', 'An apology and reconciliation'],
    flyer: ['Weekly market announcement', 'Music festival poster', 'New restaurant opening', 'Community volunteer event'],
    recipe: ['Simple vegetable soup', 'Classic crepes', 'Traditional stew', 'Festive holiday cake'],
  };

  for (const cat of categories) {
    for (let li = 0; li < levels.length; li++) {
      params.push({
        worldId,
        targetLanguage,
        category: cat,
        cefrLevel: levels[li],
        theme: categoryThemes[cat][li],
        pageCount: 1,
      });
    }
  }

  return params;
}
