/**
 * Quest Vocabulary Introduction
 *
 * Pre-teaches vocabulary words at the start of vocabulary-heavy quests.
 * When a quest is accepted that requires specific vocabulary, this module
 * selects 3-5 key words the player will need, filters out already-known
 * words, and produces structured introduction data for UI display.
 */

import type { VocabularyEntry, MasteryLevel } from './progress';
import type { VocabularyCorpusEntry, VocabularyCategory } from './vocabulary-corpus';
import { VOCABULARY_CORPUS } from './vocabulary-corpus';
import type { CEFRLevel } from '../assessment/assessment-types';

// ── Types ───────────────────────────────────────────────────────────────────

/** A single word prepared for the introduction panel. */
export interface IntroductionWord {
  /** Target-language spelling (filled by caller with translation data) */
  targetWord: string;
  /** Romanization / pronunciation guide */
  romanization: string;
  /** English meaning */
  english: string;
  /** Part of speech */
  partOfSpeech: string;
  /** Example sentence in target language */
  exampleSentence: string;
  /** Example sentence translation */
  exampleTranslation: string;
  /** Vocabulary category */
  category: string;
}

/** Full introduction payload for a quest. */
export interface QuestVocabularyIntroduction {
  /** Quest ID this introduction belongs to */
  questId: string;
  /** Quest title */
  questTitle: string;
  /** Words to introduce (3-5) */
  words: IntroductionWord[];
  /** Whether the introduction can be skipped (B1+ or all words known) */
  skippable: boolean;
  /** Reason it's skippable, if applicable */
  skipReason?: 'advanced_player' | 'all_words_known';
  /** Whether vocab intro should be shown at all */
  shouldShow: boolean;
}

/** Input quest data for vocabulary extraction. */
export interface QuestVocabInput {
  questId: string;
  questTitle: string;
  questType: string;
  difficulty: string;
  /** Objective vocabulary words (if explicitly set) */
  vocabularyWords?: string[];
  /** Vocabulary category associated with the quest */
  vocabularyCategory?: string;
  /** Tags from the quest (e.g. ['food', 'shopping']) */
  tags?: string[];
  /** Business type if this is a business roleplay quest */
  businessType?: string;
}

// ── Business vocabulary mapping ─────────────────────────────────────────────

/** Maps business types to relevant vocabulary categories. */
const BUSINESS_VOCAB_CATEGORIES: Record<string, VocabularyCategory[]> = {
  bakery: ['food', 'shopping', 'greetings'],
  restaurant: ['food', 'shopping', 'greetings'],
  tavern: ['food', 'shopping', 'greetings'],
  inn: ['greetings', 'household', 'shopping'],
  market: ['food', 'shopping', 'numbers'],
  blacksmith: ['professions', 'household', 'shopping'],
  tailor: ['clothing', 'shopping', 'colors'],
  doctor: ['body', 'emotions', 'greetings'],
  apothecary: ['body', 'nature', 'shopping'],
  farm: ['animals', 'nature', 'food'],
  carpentry: ['household', 'professions', 'shopping'],
  general_store: ['shopping', 'household', 'numbers'],
  library: ['social', 'professions', 'greetings'],
};

/** Maps quest tags to vocabulary categories for inference. */
const TAG_TO_CATEGORY: Record<string, VocabularyCategory> = {
  food: 'food',
  shopping: 'shopping',
  greetings: 'greetings',
  professions: 'professions',
  clothing: 'clothing',
  animals: 'animals',
  nature: 'nature',
  weather: 'weather',
  directions: 'directions',
  family: 'family',
  body: 'body',
  emotions: 'emotions',
  colors: 'colors',
  time: 'time',
  social: 'social',
  household: 'household',
  transportation: 'transportation',
  numbers: 'numbers',
  places: 'places',
};

// ── Constants ───────────────────────────────────────────────────────────────

const MIN_WORDS = 3;
const MAX_WORDS = 5;

/** Quest types that are vocabulary-heavy and warrant introduction. */
const VOCAB_HEAVY_QUEST_TYPES = new Set([
  'vocabulary',
  'visual_vocabulary',
  'shopping',
  'business_roleplay',
  'scavenger_hunt',
  'cultural',
]);

// ── Core logic ──────────────────────────────────────────────────────────────

/**
 * Determine whether a quest warrants vocabulary introduction.
 */
export function questNeedsVocabIntro(quest: QuestVocabInput): boolean {
  if (VOCAB_HEAVY_QUEST_TYPES.has(quest.questType)) return true;
  if (quest.vocabularyWords && quest.vocabularyWords.length > 0) return true;
  if (quest.vocabularyCategory) return true;
  if (quest.businessType) return true;
  return false;
}

/**
 * Determine vocabulary categories relevant to a quest.
 */
export function getQuestVocabCategories(quest: QuestVocabInput): VocabularyCategory[] {
  const categories = new Set<VocabularyCategory>();

  // Explicit category
  if (quest.vocabularyCategory && quest.vocabularyCategory in VOCABULARY_CORPUS) {
    categories.add(quest.vocabularyCategory as VocabularyCategory);
  }

  // Business type mapping
  if (quest.businessType) {
    const key = quest.businessType.toLowerCase().replace(/[^a-z_]/g, '');
    const mapped = BUSINESS_VOCAB_CATEGORIES[key];
    if (mapped) mapped.forEach(c => categories.add(c));
  }

  // Tags mapping
  if (quest.tags) {
    for (const tag of quest.tags) {
      const cat = TAG_TO_CATEGORY[tag.toLowerCase()];
      if (cat) categories.add(cat);
    }
  }

  // Fallback: infer from quest type
  if (categories.size === 0) {
    if (quest.questType === 'shopping') categories.add('shopping');
    if (quest.questType === 'cultural') categories.add('social');
  }

  return Array.from(categories);
}

/**
 * Select corpus words relevant to a quest, filtered by difficulty.
 */
export function selectCorpusWordsForQuest(
  quest: QuestVocabInput,
  count: number = MAX_WORDS,
): VocabularyCorpusEntry[] {
  const categories = getQuestVocabCategories(quest);
  if (categories.length === 0) return [];

  // Gather candidate words from relevant categories
  let candidates: VocabularyCorpusEntry[] = [];
  for (const cat of categories) {
    const entries = VOCABULARY_CORPUS[cat];
    if (entries) candidates.push(...entries);
  }

  // Filter by difficulty appropriate to quest
  const allowedDifficulties = getAllowedDifficulties(quest.difficulty);
  candidates = candidates.filter(c => allowedDifficulties.includes(c.difficulty));

  // Deduplicate by English word
  const seen = new Set<string>();
  candidates = candidates.filter(c => {
    if (seen.has(c.english)) return false;
    seen.add(c.english);
    return true;
  });

  // Shuffle and take count
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Filter out words the player already knows (mastery >= 'familiar').
 */
export function filterUnknownWords(
  corpusWords: VocabularyCorpusEntry[],
  playerVocabulary: VocabularyEntry[],
): VocabularyCorpusEntry[] {
  const knownWords = new Set<string>();
  for (const entry of playerVocabulary) {
    if (entry.masteryLevel === 'familiar' || entry.masteryLevel === 'mastered') {
      knownWords.add(entry.word.toLowerCase());
      knownWords.add(entry.meaning.toLowerCase());
    }
  }
  return corpusWords.filter(c => !knownWords.has(c.english.toLowerCase()));
}

/**
 * Check if a player is advanced enough to skip (B1+).
 */
export function isAdvancedPlayer(cefrLevel?: CEFRLevel): boolean {
  if (!cefrLevel) return false;
  return cefrLevel === 'B1' || cefrLevel === 'B2';
}

/**
 * Build the vocabulary introduction for a quest.
 *
 * Returns structured data for the UI to display. The `targetWord`,
 * `romanization`, `exampleSentence`, and `exampleTranslation` fields
 * are left empty and must be filled by the caller (via translation API
 * or pre-stored translations in WorldLanguage data).
 */
export function buildVocabularyIntroduction(
  quest: QuestVocabInput,
  playerVocabulary: VocabularyEntry[],
  cefrLevel?: CEFRLevel,
): QuestVocabularyIntroduction {
  // Check if quest needs vocab intro at all
  if (!questNeedsVocabIntro(quest)) {
    return {
      questId: quest.questId,
      questTitle: quest.questTitle,
      words: [],
      skippable: true,
      shouldShow: false,
    };
  }

  // Select candidate words
  let corpusWords: VocabularyCorpusEntry[];

  if (quest.vocabularyWords && quest.vocabularyWords.length > 0) {
    // Quest has explicit vocabulary words — find them in corpus
    corpusWords = findCorpusEntriesByEnglish(quest.vocabularyWords);
    // Fill remaining from categories if not enough
    if (corpusWords.length < MIN_WORDS) {
      const additional = selectCorpusWordsForQuest(quest, MAX_WORDS - corpusWords.length);
      const existingEnglish = new Set(corpusWords.map(c => c.english));
      corpusWords.push(...additional.filter(a => !existingEnglish.has(a.english)));
    }
  } else {
    corpusWords = selectCorpusWordsForQuest(quest, MAX_WORDS + 2); // extra for filtering
  }

  // Filter out words the player already knows
  const unknownWords = filterUnknownWords(corpusWords, playerVocabulary);

  // If all words are known, make skippable
  if (unknownWords.length === 0) {
    return {
      questId: quest.questId,
      questTitle: quest.questTitle,
      words: [],
      skippable: true,
      skipReason: 'all_words_known',
      shouldShow: false,
    };
  }

  // Take 3-5 words
  const selectedWords = unknownWords.slice(0, MAX_WORDS);

  // Build introduction items (target language fields filled by caller)
  const words: IntroductionWord[] = selectedWords.map(entry => ({
    targetWord: '', // filled by translation data
    romanization: '', // filled by translation data
    english: entry.english,
    partOfSpeech: entry.partOfSpeech,
    exampleSentence: '', // filled by translation data
    exampleTranslation: '', // filled by translation data
    category: entry.category,
  }));

  // Check if skippable
  const advanced = isAdvancedPlayer(cefrLevel);

  return {
    questId: quest.questId,
    questTitle: quest.questTitle,
    words,
    skippable: advanced,
    skipReason: advanced ? 'advanced_player' : undefined,
    shouldShow: true,
  };
}

/**
 * Create VocabularyEntry records for introduced words with 'new' mastery.
 * These are added to the player's vocabulary list when they view the introduction.
 */
export function createNewVocabularyEntries(
  introWords: IntroductionWord[],
  language: string,
): VocabularyEntry[] {
  const now = Date.now();
  return introWords.map(word => ({
    word: word.targetWord || word.english,
    language,
    meaning: word.english,
    category: word.category,
    timesEncountered: 1,
    timesUsedCorrectly: 0,
    timesUsedIncorrectly: 0,
    lastEncountered: now,
    masteryLevel: 'new' as MasteryLevel,
    context: word.exampleSentence || undefined,
  }));
}

// ── Flashcard review ────────────────────────────────────────────────────────

/** A flashcard for the brief review after introduction. */
export interface VocabFlashcard {
  /** Target language word (front of card) */
  front: string;
  /** English meaning (back of card) */
  back: string;
  /** Category */
  category: string;
  /** Whether the player answered correctly */
  answeredCorrectly?: boolean;
}

/**
 * Generate flashcards from introduction words for the brief review phase.
 */
export function generateFlashcards(words: IntroductionWord[]): VocabFlashcard[] {
  return words.map(w => ({
    front: w.targetWord || w.english,
    back: w.english,
    category: w.category,
  }));
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getAllowedDifficulties(questDifficulty: string): string[] {
  switch (questDifficulty) {
    case 'beginner': return ['beginner'];
    case 'intermediate': return ['beginner', 'intermediate'];
    case 'advanced': return ['beginner', 'intermediate', 'advanced'];
    default: return ['beginner'];
  }
}

function findCorpusEntriesByEnglish(words: string[]): VocabularyCorpusEntry[] {
  const wordSet = new Set(words.map(w => w.toLowerCase()));
  const found: VocabularyCorpusEntry[] = [];
  for (const cat of Object.keys(VOCABULARY_CORPUS) as VocabularyCategory[]) {
    for (const entry of VOCABULARY_CORPUS[cat]) {
      if (wordSet.has(entry.english.toLowerCase())) {
        found.push(entry);
        wordSet.delete(entry.english.toLowerCase());
      }
    }
  }
  return found;
}
