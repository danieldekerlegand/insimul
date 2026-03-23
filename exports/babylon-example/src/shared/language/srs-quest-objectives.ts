/**
 * SRS Quest Objectives
 *
 * Bridges the spaced repetition system with quest objectives.
 * Selects vocabulary words due for review and generates quest objectives
 * that target those words, creating a feedback loop between SRS scheduling
 * and in-game quest completion.
 */

import type { VocabularyEntry, MasteryLevel } from './progress';
import {
  selectWordsForReview,
  getWordsDueForReview,
  isWordDueForReview,
} from './vocabulary-review';

// ── Types ───────────────────────────────────────────────────────────────────

/** Review mode determines what kind of quest objective is generated. */
export type ReviewMode = 'use_vocabulary' | 'identify_object' | 'translation_challenge' | 'collect_vocabulary';

/** A single SRS-driven quest objective ready for inclusion in a quest. */
export interface SRSObjective {
  type: string;
  description: string;
  required: number;
  vocabularyWords: string[];
  /** Mastery levels of the selected words (for UI display). */
  masteryDistribution: Record<MasteryLevel, number>;
  /** Review mode used to generate this objective. */
  reviewMode: ReviewMode;
  /** Category of words if they share one, otherwise undefined. */
  category?: string;
}

/** Configuration for generating SRS objectives. */
export interface SRSObjectiveConfig {
  /** Maximum words per objective (default: 8). */
  maxWords?: number;
  /** Minimum words needed to generate an objective (default: 3). */
  minWords?: number;
  /** Preferred review mode. If unset, auto-selects based on mastery distribution. */
  preferredMode?: ReviewMode;
  /** Only include words from this category. */
  categoryFilter?: string;
  /** Only include words at or below this mastery level. */
  maxMasteryLevel?: MasteryLevel;
  /** Current timestamp override for testing. */
  now?: number;
}

/** Result of generating SRS objectives for a quest. */
export interface SRSQuestObjectiveResult {
  objectives: SRSObjective[];
  /** Words selected for review across all objectives. */
  selectedWords: VocabularyEntry[];
  /** Total words due for review (may be more than selected). */
  totalDueForReview: number;
  /** Recommended quest difficulty based on mastery distribution. */
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Whether there are enough words to generate meaningful objectives. */
  hasSufficientVocabulary: boolean;
}

// ── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_MAX_WORDS = 8;
const DEFAULT_MIN_WORDS = 3;

const MASTERY_ORDER: Record<MasteryLevel, number> = {
  new: 0,
  learning: 1,
  familiar: 2,
  mastered: 3,
};

// ── Core Functions ──────────────────────────────────────────────────────────

/**
 * Select the best review mode based on the mastery distribution of selected words.
 * - Mostly new/learning words → collect_vocabulary (discovery-oriented)
 * - Mostly familiar words → use_vocabulary (practice in conversation)
 * - Mostly mastered words → translation_challenge (harder recall)
 * - Mixed → identify_object (versatile)
 */
export function selectReviewMode(words: VocabularyEntry[]): ReviewMode {
  if (words.length === 0) return 'use_vocabulary';

  const dist = getMasteryDistribution(words);
  const total = words.length;
  const newAndLearning = dist.new + dist.learning;
  const familiarAndMastered = dist.familiar + dist.mastered;

  if (newAndLearning / total >= 0.7) return 'collect_vocabulary';
  if (dist.mastered / total >= 0.5) return 'translation_challenge';
  if (familiarAndMastered / total >= 0.6) return 'use_vocabulary';
  return 'identify_object';
}

/**
 * Count words by mastery level.
 */
export function getMasteryDistribution(words: VocabularyEntry[]): Record<MasteryLevel, number> {
  const dist: Record<MasteryLevel, number> = { new: 0, learning: 0, familiar: 0, mastered: 0 };
  for (const w of words) {
    dist[w.masteryLevel]++;
  }
  return dist;
}

/**
 * Determine quest difficulty from mastery distribution.
 * Heavier low-mastery → beginner, heavier high-mastery → advanced.
 */
export function recommendDifficulty(words: VocabularyEntry[]): 'beginner' | 'intermediate' | 'advanced' {
  if (words.length === 0) return 'beginner';

  const dist = getMasteryDistribution(words);
  const total = words.length;
  const weightedAvg = (
    dist.new * 0 +
    dist.learning * 1 +
    dist.familiar * 2 +
    dist.mastered * 3
  ) / total;

  if (weightedAvg < 1.0) return 'beginner';
  if (weightedAvg < 2.0) return 'intermediate';
  return 'advanced';
}

/**
 * Build a human-readable description for an SRS objective.
 */
function buildDescription(mode: ReviewMode, words: VocabularyEntry[], category?: string): string {
  const count = words.length;
  const categoryLabel = category ? ` ${category}` : '';

  switch (mode) {
    case 'use_vocabulary':
      return `Use ${count}${categoryLabel} review words in conversation`;
    case 'identify_object':
      return `Identify ${count}${categoryLabel} objects by their target-language names`;
    case 'translation_challenge':
      return `Translate ${count}${categoryLabel} review words correctly`;
    case 'collect_vocabulary':
      return `Find and collect ${count}${categoryLabel} vocabulary words in the world`;
  }
}

/**
 * Filter words by optional category and mastery level constraints.
 */
function applyFilters(words: VocabularyEntry[], config: SRSObjectiveConfig): VocabularyEntry[] {
  let filtered = words;

  if (config.categoryFilter) {
    filtered = filtered.filter(w => w.category === config.categoryFilter);
  }

  if (config.maxMasteryLevel) {
    const maxOrder = MASTERY_ORDER[config.maxMasteryLevel];
    filtered = filtered.filter(w => MASTERY_ORDER[w.masteryLevel] <= maxOrder);
  }

  return filtered;
}

/**
 * Find the dominant category among a set of words, if any.
 * Returns the category if >50% of words share it.
 */
function getDominantCategory(words: VocabularyEntry[]): string | undefined {
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.category) {
      counts.set(w.category, (counts.get(w.category) || 0) + 1);
    }
  }
  const entries = Array.from(counts.entries());
  for (let i = 0; i < entries.length; i++) {
    if (entries[i][1] > words.length / 2) return entries[i][0];
  }
  return undefined;
}

/**
 * Generate SRS-driven quest objectives from a player's vocabulary.
 *
 * This is the main entry point. It:
 * 1. Selects words due for review using the SRS scheduler
 * 2. Groups them and picks the best review mode
 * 3. Returns quest objectives ready to be inserted into a quest
 */
export function generateSRSObjectives(
  vocabulary: VocabularyEntry[],
  config: SRSObjectiveConfig = {},
): SRSQuestObjectiveResult {
  const maxWords = config.maxWords ?? DEFAULT_MAX_WORDS;
  const minWords = config.minWords ?? DEFAULT_MIN_WORDS;
  const now = config.now;

  // Get all words due for review, then apply filters
  const allDue = getWordsDueForReview(vocabulary, now);
  const filteredDue = applyFilters(allDue, config);

  // Select the top words for review
  const filteredVocabulary = applyFilters(vocabulary, config);
  const selected = selectWordsForReview(filteredVocabulary, maxWords, now);

  if (selected.length < minWords) {
    return {
      objectives: [],
      selectedWords: selected,
      totalDueForReview: filteredDue.length,
      recommendedDifficulty: recommendDifficulty(selected),
      hasSufficientVocabulary: false,
    };
  }

  const mode = config.preferredMode ?? selectReviewMode(selected);
  const category = config.categoryFilter ?? getDominantCategory(selected);
  const dist = getMasteryDistribution(selected);

  const objective: SRSObjective = {
    type: mode,
    description: buildDescription(mode, selected, category),
    required: selected.length,
    vocabularyWords: selected.map(w => w.word),
    masteryDistribution: dist,
    reviewMode: mode,
    category,
  };

  return {
    objectives: [objective],
    selectedWords: selected,
    totalDueForReview: filteredDue.length,
    recommendedDifficulty: recommendDifficulty(selected),
    hasSufficientVocabulary: true,
  };
}

/**
 * Generate multiple SRS objectives split by category.
 * Useful for creating richer quests with category-themed stages.
 */
export function generateCategorizedSRSObjectives(
  vocabulary: VocabularyEntry[],
  config: SRSObjectiveConfig = {},
): SRSQuestObjectiveResult {
  const maxWords = config.maxWords ?? DEFAULT_MAX_WORDS;
  const minWords = config.minWords ?? DEFAULT_MIN_WORDS;
  const now = config.now;

  const allDue = getWordsDueForReview(vocabulary, now);
  const filteredDue = applyFilters(allDue, config);

  // Group due words by category
  const byCategory = new Map<string, VocabularyEntry[]>();
  for (const word of filteredDue) {
    const cat = word.category || 'general';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(word);
  }

  const objectives: SRSObjective[] = [];
  const allSelected: VocabularyEntry[] = [];

  // Sort categories by count (most words first) and generate one objective per category
  const sorted = Array.from(byCategory.entries()).sort((a, b) => b[1].length - a[1].length);

  for (let i = 0; i < sorted.length; i++) {
    const cat = sorted[i][0];
    const catDueWords = sorted[i][1];
    if (allSelected.length >= maxWords) break;

    const remaining = maxWords - allSelected.length;
    const catWords = catDueWords.slice(0, remaining);

    if (catWords.length < Math.min(minWords, 2)) continue;

    const mode = config.preferredMode ?? selectReviewMode(catWords);
    const dist = getMasteryDistribution(catWords);

    objectives.push({
      type: mode,
      description: buildDescription(mode, catWords, cat),
      required: catWords.length,
      vocabularyWords: catWords.map((w: VocabularyEntry) => w.word),
      masteryDistribution: dist,
      reviewMode: mode,
      category: cat,
    });

    allSelected.push(...catWords);
  }

  return {
    objectives,
    selectedWords: allSelected,
    totalDueForReview: filteredDue.length,
    recommendedDifficulty: recommendDifficulty(allSelected),
    hasSufficientVocabulary: allSelected.length >= minWords,
  };
}

/**
 * Check if a player's vocabulary has enough review-due words
 * to warrant generating an SRS review quest.
 */
export function shouldGenerateReviewQuest(
  vocabulary: VocabularyEntry[],
  minDueWords: number = 3,
  now?: number,
): boolean {
  const due = getWordsDueForReview(vocabulary, now);
  return due.length >= minDueWords;
}

/**
 * Calculate XP bonus for completing an SRS review quest.
 * Words at lower mastery levels award more XP (they need more practice).
 */
export function calculateReviewXPBonus(words: VocabularyEntry[]): number {
  let bonus = 0;
  for (const w of words) {
    switch (w.masteryLevel) {
      case 'new': bonus += 5; break;
      case 'learning': bonus += 3; break;
      case 'familiar': bonus += 2; break;
      case 'mastered': bonus += 1; break;
    }
  }
  return bonus;
}
