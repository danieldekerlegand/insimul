import { describe, it, expect } from 'vitest';
import type { VocabularyEntry } from '@shared/language/progress';
import {
  selectReviewMode,
  getMasteryDistribution,
  recommendDifficulty,
  generateSRSObjectives,
  generateCategorizedSRSObjectives,
  shouldGenerateReviewQuest,
  calculateReviewXPBonus,
} from '@shared/language/srs-quest-objectives';

const NOW = 1_700_000_000_000;

function makeEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'hola',
    language: 'es',
    meaning: 'hello',
    category: 'greetings',
    timesEncountered: 5,
    timesUsedCorrectly: 2,
    timesUsedIncorrectly: 1,
    lastEncountered: NOW - 60 * 60 * 1000, // 1 hour ago
    masteryLevel: 'learning',
    ...overrides,
  };
}

function makeVocabulary(count: number, mastery: VocabularyEntry['masteryLevel'], category?: string): VocabularyEntry[] {
  return Array.from({ length: count }, (_, i) =>
    makeEntry({
      word: `word_${category || 'gen'}_${i}`,
      masteryLevel: mastery,
      category: category || 'general',
      lastEncountered: NOW - 2 * 60 * 60 * 1000, // 2 hours ago (due for all levels except mastered)
    }),
  );
}

// ── getMasteryDistribution ──────────────────────────────────────────────────

describe('getMasteryDistribution', () => {
  it('counts words by mastery level', () => {
    const words = [
      ...makeVocabulary(2, 'new'),
      ...makeVocabulary(3, 'learning'),
      ...makeVocabulary(1, 'familiar'),
    ];
    const dist = getMasteryDistribution(words);
    expect(dist).toEqual({ new: 2, learning: 3, familiar: 1, mastered: 0 });
  });

  it('returns all zeros for empty array', () => {
    expect(getMasteryDistribution([])).toEqual({ new: 0, learning: 0, familiar: 0, mastered: 0 });
  });
});

// ── selectReviewMode ────────────────────────────────────────────────────────

describe('selectReviewMode', () => {
  it('returns collect_vocabulary for mostly new/learning words', () => {
    const words = [...makeVocabulary(5, 'new'), ...makeVocabulary(2, 'learning')];
    expect(selectReviewMode(words)).toBe('collect_vocabulary');
  });

  it('returns translation_challenge for mostly mastered words', () => {
    const words = [...makeVocabulary(4, 'mastered'), ...makeVocabulary(1, 'familiar')];
    expect(selectReviewMode(words)).toBe('translation_challenge');
  });

  it('returns use_vocabulary for mostly familiar+ words', () => {
    const words = [...makeVocabulary(3, 'familiar'), ...makeVocabulary(2, 'mastered')];
    expect(selectReviewMode(words)).toBe('use_vocabulary');
  });

  it('returns identify_object for mixed mastery', () => {
    // 3 new + 1 familiar + 1 mastered → newAndLearning=3/5=0.6 (not >=0.7),
    // mastered=1/5=0.2 (not >=0.5), familiarAndMastered=2/5=0.4 (not >=0.6) → identify_object
    const words = [
      ...makeVocabulary(3, 'new'),
      ...makeVocabulary(1, 'familiar'),
      ...makeVocabulary(1, 'mastered'),
    ];
    expect(selectReviewMode(words)).toBe('identify_object');
  });

  it('returns use_vocabulary for empty array', () => {
    expect(selectReviewMode([])).toBe('use_vocabulary');
  });
});

// ── recommendDifficulty ─────────────────────────────────────────────────────

describe('recommendDifficulty', () => {
  it('returns beginner for mostly new words', () => {
    expect(recommendDifficulty(makeVocabulary(5, 'new'))).toBe('beginner');
  });

  it('returns intermediate for mostly learning/familiar words', () => {
    const words = [...makeVocabulary(3, 'learning'), ...makeVocabulary(2, 'familiar')];
    expect(recommendDifficulty(words)).toBe('intermediate');
  });

  it('returns advanced for mostly mastered words', () => {
    const words = [...makeVocabulary(1, 'familiar'), ...makeVocabulary(4, 'mastered')];
    expect(recommendDifficulty(words)).toBe('advanced');
  });

  it('returns beginner for empty array', () => {
    expect(recommendDifficulty([])).toBe('beginner');
  });
});

// ── generateSRSObjectives ───────────────────────────────────────────────────

describe('generateSRSObjectives', () => {
  it('generates an objective from due-for-review vocabulary', () => {
    const vocab = makeVocabulary(6, 'learning');
    const result = generateSRSObjectives(vocab, { now: NOW });

    expect(result.hasSufficientVocabulary).toBe(true);
    expect(result.objectives).toHaveLength(1);
    expect(result.objectives[0].vocabularyWords).toHaveLength(6);
    expect(result.objectives[0].type).toBe('collect_vocabulary'); // new/learning → collect
    expect(result.selectedWords).toHaveLength(6);
  });

  it('respects maxWords config', () => {
    const vocab = makeVocabulary(10, 'learning');
    const result = generateSRSObjectives(vocab, { maxWords: 5, now: NOW });

    expect(result.objectives[0].vocabularyWords).toHaveLength(5);
    expect(result.objectives[0].required).toBe(5);
  });

  it('returns empty objectives when insufficient vocabulary', () => {
    const vocab = makeVocabulary(2, 'learning');
    const result = generateSRSObjectives(vocab, { minWords: 3, now: NOW });

    expect(result.hasSufficientVocabulary).toBe(false);
    expect(result.objectives).toHaveLength(0);
  });

  it('respects categoryFilter', () => {
    const vocab = [
      ...makeVocabulary(4, 'learning', 'food'),
      ...makeVocabulary(4, 'learning', 'greetings'),
    ];
    const result = generateSRSObjectives(vocab, { categoryFilter: 'food', now: NOW });

    expect(result.objectives[0].vocabularyWords.every(w => w.startsWith('word_food_'))).toBe(true);
  });

  it('respects maxMasteryLevel filter', () => {
    const vocab = [
      ...makeVocabulary(3, 'new'),
      ...makeVocabulary(3, 'learning'),
      ...makeVocabulary(3, 'familiar'),
      ...makeVocabulary(3, 'mastered'),
    ];
    const result = generateSRSObjectives(vocab, { maxMasteryLevel: 'learning', maxWords: 12, now: NOW });

    // Should only include new and learning words
    const selected = result.selectedWords;
    expect(selected.every(w => w.masteryLevel === 'new' || w.masteryLevel === 'learning')).toBe(true);
  });

  it('uses preferredMode when specified', () => {
    const vocab = makeVocabulary(5, 'new'); // would normally be collect_vocabulary
    const result = generateSRSObjectives(vocab, { preferredMode: 'translation_challenge', now: NOW });

    expect(result.objectives[0].type).toBe('translation_challenge');
    expect(result.objectives[0].reviewMode).toBe('translation_challenge');
  });

  it('includes masteryDistribution in objective', () => {
    const vocab = [...makeVocabulary(3, 'new'), ...makeVocabulary(2, 'learning')];
    const result = generateSRSObjectives(vocab, { now: NOW });

    expect(result.objectives[0].masteryDistribution.new).toBe(3);
    expect(result.objectives[0].masteryDistribution.learning).toBe(2);
  });

  it('sets recommendedDifficulty based on mastery', () => {
    const beginnerVocab = makeVocabulary(5, 'new');
    expect(generateSRSObjectives(beginnerVocab, { now: NOW }).recommendedDifficulty).toBe('beginner');

    const advancedVocab = makeVocabulary(5, 'mastered', 'food');
    // mastered words are due after 24h, our test words are only 2h old
    // so we need to make them older
    for (const w of advancedVocab) {
      w.lastEncountered = NOW - 25 * 60 * 60 * 1000;
    }
    expect(generateSRSObjectives(advancedVocab, { now: NOW }).recommendedDifficulty).toBe('advanced');
  });
});

// ── generateCategorizedSRSObjectives ────────────────────────────────────────

describe('generateCategorizedSRSObjectives', () => {
  it('generates separate objectives per category', () => {
    const vocab = [
      ...makeVocabulary(4, 'learning', 'food'),
      ...makeVocabulary(3, 'learning', 'greetings'),
    ];
    const result = generateCategorizedSRSObjectives(vocab, { maxWords: 10, now: NOW });

    expect(result.objectives.length).toBeGreaterThanOrEqual(2);
    const categories = result.objectives.map(o => o.category);
    expect(categories).toContain('food');
    expect(categories).toContain('greetings');
  });

  it('respects maxWords across all categories', () => {
    const vocab = [
      ...makeVocabulary(5, 'learning', 'food'),
      ...makeVocabulary(5, 'learning', 'greetings'),
    ];
    const result = generateCategorizedSRSObjectives(vocab, { maxWords: 6, now: NOW });

    const totalWords = result.selectedWords.length;
    expect(totalWords).toBeLessThanOrEqual(6);
  });

  it('skips categories with too few words', () => {
    const vocab = [
      ...makeVocabulary(4, 'learning', 'food'),
      ...makeVocabulary(1, 'learning', 'greetings'), // too few
    ];
    const result = generateCategorizedSRSObjectives(vocab, { minWords: 3, now: NOW });

    // Should only have food category
    expect(result.objectives.every(o => o.category === 'food')).toBe(true);
  });
});

// ── shouldGenerateReviewQuest ───────────────────────────────────────────────

describe('shouldGenerateReviewQuest', () => {
  it('returns true when enough words are due', () => {
    const vocab = makeVocabulary(5, 'learning');
    expect(shouldGenerateReviewQuest(vocab, 3, NOW)).toBe(true);
  });

  it('returns false when not enough words are due', () => {
    // Words encountered just now → not yet due
    const vocab = makeVocabulary(5, 'learning').map(w => ({
      ...w,
      lastEncountered: NOW,
    }));
    expect(shouldGenerateReviewQuest(vocab, 3, NOW)).toBe(false);
  });

  it('uses default minDueWords of 3', () => {
    const vocab = makeVocabulary(2, 'learning');
    // 2 words due < 3 minimum
    expect(shouldGenerateReviewQuest(vocab, undefined, NOW)).toBe(false);
  });
});

// ── calculateReviewXPBonus ──────────────────────────────────────────────────

describe('calculateReviewXPBonus', () => {
  it('awards more XP for lower mastery words', () => {
    const newWords = makeVocabulary(3, 'new');
    const masteredWords = makeVocabulary(3, 'mastered');

    expect(calculateReviewXPBonus(newWords)).toBe(15); // 3 * 5
    expect(calculateReviewXPBonus(masteredWords)).toBe(3); // 3 * 1
  });

  it('calculates mixed mastery bonus correctly', () => {
    const words = [
      ...makeVocabulary(1, 'new'),       // 5
      ...makeVocabulary(1, 'learning'),   // 3
      ...makeVocabulary(1, 'familiar'),   // 2
      ...makeVocabulary(1, 'mastered'),   // 1
    ];
    expect(calculateReviewXPBonus(words)).toBe(11);
  });

  it('returns 0 for empty array', () => {
    expect(calculateReviewXPBonus([])).toBe(0);
  });
});
