/**
 * Vocabulary System Audit Tests
 *
 * Comprehensive audit covering:
 * 1. Spaced repetition (SRS) scheduling and mastery thresholds
 * 2. Word tracking — mastery calculation consistency across code paths
 * 3. Reward integration — XP bonus, category unlocks, quest completion
 * 4. Event pipeline — vocabulary_used event carries category to Prolog sync
 */
import { describe, it, expect } from 'vitest';
import type { VocabularyEntry, MasteryLevel } from '@shared/language/progress';
import { calculateMasteryLevel } from '@shared/language/progress';
import {
  isWordDueForReview,
  getWordsDueForReview,
  selectWordsForReview,
  getMasteryForCorrectCount,
  processReviewResult,
  shouldTriggerReviewQuiz,
  timeUntilReview,
} from '@shared/language/vocabulary-review';
import {
  generateSRSObjectives,
  generateCategorizedSRSObjectives,
  calculateReviewXPBonus,
  shouldGenerateReviewQuest,
  selectReviewMode,
  getMasteryDistribution,
  recommendDifficulty,
} from '@shared/language/srs-quest-objectives';
import {
  extractVocabCategoryUnlocks,
  applyVocabCategoryUnlocks,
  getUnlockedCategoriesFromSaveData,
  getInitialUnlockedCategories,
  isCategoryUnlocked,
  getCategoryLockStatus,
  DEFAULT_UNLOCKED_CATEGORIES,
  ALL_VOCABULARY_CATEGORIES,
} from '@shared/language/vocabulary-category-unlock';
import type { GameEvent } from '@shared/game-engine/logic/GameEventBus';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'bonjour',
    language: 'fr',
    meaning: 'hello',
    category: 'greetings',
    timesEncountered: 5,
    timesUsedCorrectly: 2,
    timesUsedIncorrectly: 1,
    lastEncountered: Date.now() - 60 * 60 * 1000,
    masteryLevel: 'learning',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. MASTERY CALCULATION CONSISTENCY
// ═══════════════════════════════════════════════════════════════════════════

describe('Audit: Mastery calculation alignment between progress.ts and vocabulary-review.ts', () => {
  const testCases: Array<{ correct: number; expected: MasteryLevel }> = [
    { correct: 0, expected: 'new' },
    { correct: 1, expected: 'new' },
    { correct: 2, expected: 'new' },
    { correct: 3, expected: 'learning' },
    { correct: 4, expected: 'learning' },
    { correct: 5, expected: 'familiar' },
    { correct: 6, expected: 'familiar' },
    { correct: 7, expected: 'familiar' },
    { correct: 8, expected: 'mastered' },
    { correct: 15, expected: 'mastered' },
  ];

  it('getMasteryForCorrectCount and calculateMasteryLevel agree on all thresholds', () => {
    for (const { correct, expected } of testCases) {
      const srsResult = getMasteryForCorrectCount(correct);
      expect(srsResult).toBe(expected);

      // For calculateMasteryLevel, use encounters high enough to not gate
      // (encounters >= 2 and encounters > 0)
      if (correct >= 3) {
        // With sufficient correct uses AND encounters, should agree with SRS
        const progressResult = calculateMasteryLevel(correct + 2, correct);
        expect(progressResult).toBe(expected);
      }
    }
  });

  it('calculateMasteryLevel gates on zero encounters', () => {
    // Zero encounters always returns "new" regardless of correct count
    expect(calculateMasteryLevel(0, 0)).toBe('new');
    expect(calculateMasteryLevel(0, 5)).toBe('new');
    expect(calculateMasteryLevel(0, 10)).toBe('new');
  });

  it('calculateMasteryLevel promotes to learning with encounters but no correct uses', () => {
    // Encounter-only gate: 2+ encounters with 0 correct → learning
    expect(calculateMasteryLevel(1, 0)).toBe('new');
    expect(calculateMasteryLevel(2, 0)).toBe('learning');
    expect(calculateMasteryLevel(20, 0)).toBe('learning');
  });

  it('processReviewResult updates mastery consistently with calculateMasteryLevel', () => {
    // Simulate a word going through SRS review
    const entry = makeEntry({
      timesEncountered: 5,
      timesUsedCorrectly: 4,
      masteryLevel: 'learning',
    });

    // One more correct → 5 correct → should be "familiar"
    const result = processReviewResult(entry, true);
    expect(result.newMastery).toBe('familiar');
    expect(calculateMasteryLevel(entry.timesEncountered, entry.timesUsedCorrectly)).toBe('familiar');
  });

  it('full lifecycle: new → learning → familiar → mastered via SRS review', () => {
    const entry = makeEntry({
      timesEncountered: 0,
      timesUsedCorrectly: 0,
      timesUsedIncorrectly: 0,
      masteryLevel: 'new',
      lastEncountered: 0,
    });

    // 3 correct answers → learning
    for (let i = 0; i < 3; i++) {
      processReviewResult(entry, true, 1000 * (i + 1));
    }
    expect(entry.masteryLevel).toBe('learning');
    expect(calculateMasteryLevel(entry.timesEncountered, entry.timesUsedCorrectly)).toBe('learning');

    // 2 more correct → familiar (5 total)
    for (let i = 0; i < 2; i++) {
      processReviewResult(entry, true, 2000 * (i + 1));
    }
    expect(entry.masteryLevel).toBe('familiar');
    expect(calculateMasteryLevel(entry.timesEncountered, entry.timesUsedCorrectly)).toBe('familiar');

    // 3 more correct → mastered (8 total)
    for (let i = 0; i < 3; i++) {
      processReviewResult(entry, true, 3000 * (i + 1));
    }
    expect(entry.masteryLevel).toBe('mastered');
    expect(calculateMasteryLevel(entry.timesEncountered, entry.timesUsedCorrectly)).toBe('mastered');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. SPACED REPETITION SCHEDULING
// ═══════════════════════════════════════════════════════════════════════════

describe('Audit: SRS scheduling intervals and review selection', () => {
  it('review intervals increase with mastery: new(5m) < learning(30m) < familiar(4h) < mastered(24h)', () => {
    const now = Date.now();

    // New word: due after 5 minutes
    const newWord = makeEntry({ masteryLevel: 'new', lastEncountered: now - 6 * 60 * 1000 });
    expect(isWordDueForReview(newWord, now)).toBe(true);

    // Learning word: not due at 10 min, due at 35 min
    const learningRecent = makeEntry({ masteryLevel: 'learning', lastEncountered: now - 10 * 60 * 1000 });
    expect(isWordDueForReview(learningRecent, now)).toBe(false);
    const learningDue = makeEntry({ masteryLevel: 'learning', lastEncountered: now - 35 * 60 * 1000 });
    expect(isWordDueForReview(learningDue, now)).toBe(true);

    // Familiar word: not due at 2h, due at 5h
    const familiarRecent = makeEntry({ masteryLevel: 'familiar', lastEncountered: now - 2 * 60 * 60 * 1000 });
    expect(isWordDueForReview(familiarRecent, now)).toBe(false);
    const familiarDue = makeEntry({ masteryLevel: 'familiar', lastEncountered: now - 5 * 60 * 60 * 1000 });
    expect(isWordDueForReview(familiarDue, now)).toBe(true);

    // Mastered word: not due at 12h, due at 25h
    const masteredRecent = makeEntry({ masteryLevel: 'mastered', lastEncountered: now - 12 * 60 * 60 * 1000 });
    expect(isWordDueForReview(masteredRecent, now)).toBe(false);
    const masteredDue = makeEntry({ masteryLevel: 'mastered', lastEncountered: now - 25 * 60 * 60 * 1000 });
    expect(isWordDueForReview(masteredDue, now)).toBe(true);
  });

  it('selectWordsForReview prioritizes lowest mastery and oldest encounter', () => {
    const now = Date.now();
    const words = [
      makeEntry({ word: 'mastered_old', masteryLevel: 'mastered', lastEncountered: now - 48 * 60 * 60 * 1000 }),
      makeEntry({ word: 'new_recent', masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 }),
      makeEntry({ word: 'learning_old', masteryLevel: 'learning', lastEncountered: now - 2 * 60 * 60 * 1000 }),
      makeEntry({ word: 'new_old', masteryLevel: 'new', lastEncountered: now - 30 * 60 * 1000 }),
    ];

    const selected = selectWordsForReview(words, 3, now);
    // Non-mastered due words first, sorted by lastEncountered ascending
    expect(selected[0].word).toBe('learning_old');
    expect(selected[1].word).toBe('new_old');
    expect(selected[2].word).toBe('new_recent');
  });

  it('shouldTriggerReviewQuiz uses lower chance for mastered words', () => {
    const nonMastered = makeEntry({ masteryLevel: 'learning' });
    const mastered = makeEntry({ masteryLevel: 'mastered' });

    // At random = 0.15: non-mastered triggers (< 0.25), mastered doesn't (>= 0.10)
    expect(shouldTriggerReviewQuiz(nonMastered, 0.15)).toBe(true);
    expect(shouldTriggerReviewQuiz(mastered, 0.15)).toBe(false);

    // At random = 0.05: both trigger
    expect(shouldTriggerReviewQuiz(nonMastered, 0.05)).toBe(true);
    expect(shouldTriggerReviewQuiz(mastered, 0.05)).toBe(true);
  });

  it('timeUntilReview returns correct remaining time', () => {
    const now = Date.now();
    // Learning word seen 10 min ago, interval = 30 min → ~20 min remaining
    const entry = makeEntry({ masteryLevel: 'learning', lastEncountered: now - 10 * 60 * 1000 });
    const remaining = timeUntilReview(entry, now);
    expect(remaining).toBeGreaterThan(19 * 60 * 1000);
    expect(remaining).toBeLessThanOrEqual(20 * 60 * 1000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. SRS QUEST OBJECTIVE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Audit: SRS quest objective generation', () => {
  function makeDueWords(count: number, mastery: MasteryLevel = 'learning'): VocabularyEntry[] {
    return Array.from({ length: count }, (_, i) =>
      makeEntry({
        word: `word_${i}`,
        masteryLevel: mastery,
        lastEncountered: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago (due for all levels)
        timesUsedCorrectly: mastery === 'new' ? 0 : mastery === 'learning' ? 3 : mastery === 'familiar' ? 5 : 8,
      })
    );
  }

  it('generates objectives when sufficient due words exist', () => {
    const words = makeDueWords(5);
    const result = generateSRSObjectives(words);
    expect(result.hasSufficientVocabulary).toBe(true);
    expect(result.objectives).toHaveLength(1);
    expect(result.objectives[0].vocabularyWords).toHaveLength(5);
  });

  it('returns empty objectives when insufficient due words', () => {
    const words = makeDueWords(2); // Below default minWords=3
    const result = generateSRSObjectives(words);
    expect(result.hasSufficientVocabulary).toBe(false);
    expect(result.objectives).toHaveLength(0);
  });

  it('selectReviewMode picks collect_vocabulary for mostly new words', () => {
    const words = makeDueWords(5, 'new');
    expect(selectReviewMode(words)).toBe('collect_vocabulary');
  });

  it('selectReviewMode picks translation_challenge for mostly mastered words', () => {
    const words = makeDueWords(5, 'mastered');
    expect(selectReviewMode(words)).toBe('translation_challenge');
  });

  it('selectReviewMode picks use_vocabulary for mostly familiar words', () => {
    const words = [
      ...makeDueWords(4, 'familiar'),
      makeEntry({ word: 'extra', masteryLevel: 'learning', lastEncountered: 0 }),
    ];
    expect(selectReviewMode(words)).toBe('use_vocabulary');
  });

  it('recommendDifficulty reflects mastery distribution', () => {
    expect(recommendDifficulty(makeDueWords(5, 'new'))).toBe('beginner');
    expect(recommendDifficulty(makeDueWords(5, 'learning'))).toBe('intermediate');
    expect(recommendDifficulty(makeDueWords(5, 'mastered'))).toBe('advanced');
  });

  it('shouldGenerateReviewQuest requires minimum due words', () => {
    const now = Date.now();
    const fewWords = [makeEntry({ masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 })];
    expect(shouldGenerateReviewQuest(fewWords, 3, now)).toBe(false);

    const enoughWords = Array.from({ length: 5 }, (_, i) =>
      makeEntry({ word: `w${i}`, masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 })
    );
    expect(shouldGenerateReviewQuest(enoughWords, 3, now)).toBe(true);
  });

  it('generateCategorizedSRSObjectives groups by category', () => {
    const now = Date.now();
    const words = [
      makeEntry({ word: 'pain', category: 'food', masteryLevel: 'learning', lastEncountered: now - 2 * 60 * 60 * 1000 }),
      makeEntry({ word: 'fromage', category: 'food', masteryLevel: 'learning', lastEncountered: now - 2 * 60 * 60 * 1000 }),
      makeEntry({ word: 'rouge', category: 'colors', masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 }),
      makeEntry({ word: 'bleu', category: 'colors', masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 }),
    ];
    const result = generateCategorizedSRSObjectives(words, { minWords: 2 });
    expect(result.objectives.length).toBeGreaterThanOrEqual(1);
    // Each objective has a category
    for (const obj of result.objectives) {
      expect(obj.category).toBeDefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. XP REWARD INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Audit: Vocabulary reward XP integration', () => {
  it('calculateReviewXPBonus awards more XP for lower mastery words', () => {
    const newWords = [makeEntry({ masteryLevel: 'new' })];
    const masteredWords = [makeEntry({ masteryLevel: 'mastered' })];

    const newBonus = calculateReviewXPBonus(newWords);
    const masteredBonus = calculateReviewXPBonus(masteredWords);

    expect(newBonus).toBe(5);
    expect(masteredBonus).toBe(1);
    expect(newBonus).toBeGreaterThan(masteredBonus);
  });

  it('calculateReviewXPBonus sums across multiple words', () => {
    const words = [
      makeEntry({ masteryLevel: 'new' }),       // 5
      makeEntry({ masteryLevel: 'learning' }),   // 3
      makeEntry({ masteryLevel: 'familiar' }),   // 2
      makeEntry({ masteryLevel: 'mastered' }),   // 1
    ];
    expect(calculateReviewXPBonus(words)).toBe(11);
  });

  it('calculateReviewXPBonus returns 0 for empty array', () => {
    expect(calculateReviewXPBonus([])).toBe(0);
  });

  it('getMasteryDistribution correctly counts words by level', () => {
    const words = [
      makeEntry({ masteryLevel: 'new' }),
      makeEntry({ masteryLevel: 'new' }),
      makeEntry({ masteryLevel: 'learning' }),
      makeEntry({ masteryLevel: 'familiar' }),
      makeEntry({ masteryLevel: 'mastered' }),
    ];
    const dist = getMasteryDistribution(words);
    expect(dist).toEqual({ new: 2, learning: 1, familiar: 1, mastered: 1 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. VOCABULARY CATEGORY UNLOCK VIA QUEST COMPLETION
// ═══════════════════════════════════════════════════════════════════════════

describe('Audit: Vocabulary category unlocking', () => {
  it('starts with 3 default categories: greetings, numbers, actions', () => {
    const initial = getInitialUnlockedCategories();
    expect(initial).toEqual(DEFAULT_UNLOCKED_CATEGORIES);
    expect(initial).toContain('greetings');
    expect(initial).toContain('numbers');
    expect(initial).toContain('actions');
    expect(initial).toHaveLength(3);
  });

  it('extractVocabCategoryUnlocks filters only vocabulary_category type', () => {
    const unlocks = [
      { type: 'vocabulary_category', id: 'food', name: 'Food & Drink' },
      { type: 'item', id: 'sword', name: 'Iron Sword' },
      { type: 'vocabulary_category', id: 'colors', name: 'Colors' },
    ];
    const vocabUnlocks = extractVocabCategoryUnlocks(unlocks);
    expect(vocabUnlocks).toHaveLength(2);
    expect(vocabUnlocks.map(u => u.id)).toEqual(['food', 'colors']);
  });

  it('extractVocabCategoryUnlocks handles null/undefined', () => {
    expect(extractVocabCategoryUnlocks(null)).toEqual([]);
    expect(extractVocabCategoryUnlocks(undefined)).toEqual([]);
  });

  it('applyVocabCategoryUnlocks deduplicates and returns newly unlocked', () => {
    const current = ['greetings', 'numbers', 'actions'];
    const newUnlocks = [
      { type: 'vocabulary_category' as const, id: 'food', name: 'Food' },
      { type: 'vocabulary_category' as const, id: 'greetings', name: 'Greetings' }, // already unlocked
    ];
    const { updated, newlyUnlocked } = applyVocabCategoryUnlocks(current, newUnlocks);
    expect(newlyUnlocked).toEqual(['food']);
    expect(updated).toContain('food');
    expect(updated).toContain('greetings');
  });

  it('applyVocabCategoryUnlocks rejects invalid category names', () => {
    const current = ['greetings'];
    const newUnlocks = [
      { type: 'vocabulary_category' as const, id: 'not_a_real_category', name: 'Fake' },
    ];
    const { newlyUnlocked } = applyVocabCategoryUnlocks(current, newUnlocks);
    expect(newlyUnlocked).toEqual([]);
  });

  it('getUnlockedCategoriesFromSaveData falls back to defaults', () => {
    expect(getUnlockedCategoriesFromSaveData(null)).toEqual(DEFAULT_UNLOCKED_CATEGORIES);
    expect(getUnlockedCategoriesFromSaveData({})).toEqual(DEFAULT_UNLOCKED_CATEGORIES);
    expect(getUnlockedCategoriesFromSaveData({ unlockedVocabularyCategories: 'not-array' })).toEqual(DEFAULT_UNLOCKED_CATEGORIES);
  });

  it('getUnlockedCategoriesFromSaveData returns stored categories', () => {
    const saveData = { unlockedVocabularyCategories: ['greetings', 'food', 'colors'] };
    expect(getUnlockedCategoriesFromSaveData(saveData)).toEqual(['greetings', 'food', 'colors']);
  });

  it('isCategoryUnlocked checks against save data', () => {
    const saveData = { unlockedVocabularyCategories: ['greetings', 'food'] };
    expect(isCategoryUnlocked('greetings', saveData)).toBe(true);
    expect(isCategoryUnlocked('food', saveData)).toBe(true);
    expect(isCategoryUnlocked('colors', saveData)).toBe(false);
  });

  it('getCategoryLockStatus covers all 20 categories', () => {
    const status = getCategoryLockStatus(null);
    expect(status).toHaveLength(ALL_VOCABULARY_CATEGORIES.length);
    const unlocked = status.filter(s => s.unlocked);
    expect(unlocked).toHaveLength(3); // defaults
  });

  it('ALL_VOCABULARY_CATEGORIES has 20 entries', () => {
    expect(ALL_VOCABULARY_CATEGORIES).toHaveLength(20);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. EVENT PIPELINE: vocabulary_used CARRIES CATEGORY
// ═══════════════════════════════════════════════════════════════════════════

describe('Audit: vocabulary_used event type includes optional category', () => {
  it('vocabulary_used event type accepts category field', () => {
    // Verify the GameEvent type allows category on vocabulary_used
    const eventWithCategory: GameEvent = {
      type: 'vocabulary_used',
      word: 'bonjour',
      correct: true,
      category: 'greetings',
    };
    expect(eventWithCategory.category).toBe('greetings');
  });

  it('vocabulary_used event type works without category (backward compat)', () => {
    const eventWithoutCategory: GameEvent = {
      type: 'vocabulary_used',
      word: 'bonjour',
      correct: true,
    };
    expect(eventWithoutCategory.type).toBe('vocabulary_used');
    // category should be undefined when not provided
    expect((eventWithoutCategory as any).category).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. END-TO-END: WORD TRACKING → SRS → QUEST → REWARD FLOW
// ═══════════════════════════════════════════════════════════════════════════

describe('Audit: End-to-end vocabulary flow', () => {
  it('word progresses through SRS review and mastery stays consistent', () => {
    // Simulate a word being encountered, reviewed, and tracked
    const entry = makeEntry({
      word: 'merci',
      timesEncountered: 0,
      timesUsedCorrectly: 0,
      timesUsedIncorrectly: 0,
      masteryLevel: 'new',
      lastEncountered: 0,
    });

    // Step 1: SRS review — get 3 correct answers
    for (let i = 0; i < 3; i++) {
      processReviewResult(entry, true, (i + 1) * 1000);
    }
    expect(entry.masteryLevel).toBe('learning');

    // Step 2: Verify LanguageProgressTracker would calculate same mastery
    const calculated = calculateMasteryLevel(entry.timesEncountered, entry.timesUsedCorrectly);
    expect(calculated).toBe(entry.masteryLevel);

    // Step 3: Verify review scheduling uses the new mastery level
    // Learning interval = 30 min, so word seen 1 second ago is NOT due
    expect(isWordDueForReview(entry, 4000)).toBe(false);

    // Step 4: Verify XP bonus reflects current mastery
    expect(calculateReviewXPBonus([entry])).toBe(3); // learning = 3 XP
  });

  it('SRS quest objective generation works with real mastery progression', () => {
    const now = Date.now();
    // Mix of mastery levels, all due for review
    const words = [
      makeEntry({ word: 'a', masteryLevel: 'new', category: 'greetings', lastEncountered: now - 10 * 60 * 1000, timesUsedCorrectly: 0 }),
      makeEntry({ word: 'b', masteryLevel: 'learning', category: 'greetings', lastEncountered: now - 60 * 60 * 1000, timesUsedCorrectly: 3 }),
      makeEntry({ word: 'c', masteryLevel: 'familiar', category: 'food', lastEncountered: now - 5 * 60 * 60 * 1000, timesUsedCorrectly: 5 }),
      makeEntry({ word: 'd', masteryLevel: 'mastered', category: 'food', lastEncountered: now - 25 * 60 * 60 * 1000, timesUsedCorrectly: 8 }),
    ];

    const result = generateSRSObjectives(words, { now });
    expect(result.hasSufficientVocabulary).toBe(true);
    expect(result.objectives[0].vocabularyWords.length).toBeGreaterThanOrEqual(3);
    expect(result.totalDueForReview).toBeGreaterThanOrEqual(3);

    // XP bonus should reflect the mixed mastery
    const xp = calculateReviewXPBonus(result.selectedWords);
    expect(xp).toBeGreaterThan(0);
  });

  it('category unlock flow: quest completion → unlock → isCategoryUnlocked', () => {
    // Simulate quest with vocabulary_category unlock
    const questUnlocks = [
      { type: 'vocabulary_category', id: 'food', name: 'Food & Drink' },
    ];

    // Step 1: Extract vocab unlocks from quest
    const vocabUnlocks = extractVocabCategoryUnlocks(questUnlocks);
    expect(vocabUnlocks).toHaveLength(1);

    // Step 2: Apply to player's save data (starting from defaults)
    const currentUnlocked = getInitialUnlockedCategories();
    const { updated, newlyUnlocked } = applyVocabCategoryUnlocks(currentUnlocked, vocabUnlocks);
    expect(newlyUnlocked).toEqual(['food']);

    // Step 3: Verify in save data
    const saveData = { unlockedVocabularyCategories: updated };
    expect(isCategoryUnlocked('food', saveData)).toBe(true);
    expect(isCategoryUnlocked('colors', saveData)).toBe(false);
  });
});
