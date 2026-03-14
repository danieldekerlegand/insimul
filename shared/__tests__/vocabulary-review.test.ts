import { describe, it, expect } from 'vitest';
import type { VocabularyEntry } from '@shared/language/progress';
import {
  isWordDueForReview,
  getWordsDueForReview,
  selectWordsForReview,
  getMasteryForCorrectCount,
  processReviewResult,
  shouldTriggerReviewQuiz,
  shouldShowTargetLanguageOnly,
  timeUntilReview,
  getReviewDueLabel,
  REVIEW_TRIGGER_CHANCE,
} from '@shared/language/vocabulary-review';

function makeEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'hola',
    language: 'es',
    meaning: 'hello',
    category: 'greetings',
    timesEncountered: 5,
    timesUsedCorrectly: 2,
    timesUsedIncorrectly: 1,
    lastEncountered: Date.now() - 60 * 60 * 1000, // 1 hour ago
    masteryLevel: 'learning',
    ...overrides,
  };
}

describe('isWordDueForReview', () => {
  it('returns true for a "new" word encountered >5 minutes ago', () => {
    const entry = makeEntry({
      masteryLevel: 'new',
      lastEncountered: Date.now() - 10 * 60 * 1000, // 10 min ago
    });
    expect(isWordDueForReview(entry)).toBe(true);
  });

  it('returns false for a "new" word encountered <5 minutes ago', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'new',
      lastEncountered: now - 2 * 60 * 1000, // 2 min ago
    });
    expect(isWordDueForReview(entry, now)).toBe(false);
  });

  it('returns true for a "learning" word encountered >30 minutes ago', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'learning',
      lastEncountered: now - 45 * 60 * 1000, // 45 min ago
    });
    expect(isWordDueForReview(entry, now)).toBe(true);
  });

  it('returns false for a "learning" word encountered <30 minutes ago', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'learning',
      lastEncountered: now - 10 * 60 * 1000, // 10 min ago
    });
    expect(isWordDueForReview(entry, now)).toBe(false);
  });

  it('returns true for a "familiar" word encountered >4 hours ago', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'familiar',
      lastEncountered: now - 5 * 60 * 60 * 1000, // 5 hours ago
    });
    expect(isWordDueForReview(entry, now)).toBe(true);
  });

  it('returns true for a "mastered" word encountered >24 hours ago', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'mastered',
      lastEncountered: now - 25 * 60 * 60 * 1000, // 25 hours ago
    });
    expect(isWordDueForReview(entry, now)).toBe(true);
  });
});

describe('getWordsDueForReview', () => {
  it('returns only due words sorted by mastery then recency', () => {
    const now = Date.now();
    const entries: VocabularyEntry[] = [
      makeEntry({ word: 'a', masteryLevel: 'familiar', lastEncountered: now - 5 * 60 * 60 * 1000 }),
      makeEntry({ word: 'b', masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 }),
      makeEntry({ word: 'c', masteryLevel: 'learning', lastEncountered: now - 1 * 60 * 1000 }), // not due
      makeEntry({ word: 'd', masteryLevel: 'new', lastEncountered: now - 20 * 60 * 1000 }),
    ];
    const result = getWordsDueForReview(entries, now);
    expect(result.map(e => e.word)).toEqual(['d', 'b', 'a']); // new first (oldest first), then familiar
  });

  it('returns empty array when nothing is due', () => {
    const now = Date.now();
    const entries: VocabularyEntry[] = [
      makeEntry({ masteryLevel: 'mastered', lastEncountered: now - 1000 }), // just encountered
    ];
    expect(getWordsDueForReview(entries, now)).toEqual([]);
  });
});

describe('selectWordsForReview', () => {
  it('selects the requested count of words', () => {
    const now = Date.now();
    const entries: VocabularyEntry[] = Array.from({ length: 10 }, (_, i) =>
      makeEntry({
        word: `word_${i}`,
        masteryLevel: 'learning',
        lastEncountered: now - (i + 1) * 60 * 60 * 1000,
      })
    );
    const result = selectWordsForReview(entries, 5, now);
    expect(result).toHaveLength(5);
  });

  it('prioritizes non-mastered words', () => {
    const now = Date.now();
    const entries: VocabularyEntry[] = [
      makeEntry({ word: 'mastered1', masteryLevel: 'mastered', lastEncountered: now - 48 * 60 * 60 * 1000 }),
      makeEntry({ word: 'learning1', masteryLevel: 'learning', lastEncountered: now - 2 * 60 * 60 * 1000 }),
      makeEntry({ word: 'new1', masteryLevel: 'new', lastEncountered: now - 30 * 60 * 1000 }),
    ];
    const result = selectWordsForReview(entries, 2, now);
    expect(result.map(e => e.word)).toEqual(['learning1', 'new1']);
  });

  it('fills from non-due words if not enough due words', () => {
    const now = Date.now();
    const entries: VocabularyEntry[] = [
      makeEntry({ word: 'due', masteryLevel: 'new', lastEncountered: now - 30 * 60 * 1000 }),
      makeEntry({ word: 'recent', masteryLevel: 'learning', lastEncountered: now - 1000 }),
    ];
    const result = selectWordsForReview(entries, 2, now);
    expect(result).toHaveLength(2);
    expect(result[0].word).toBe('due');
    expect(result[1].word).toBe('recent');
  });
});

describe('getMasteryForCorrectCount', () => {
  it('returns "new" for 0-2 correct', () => {
    expect(getMasteryForCorrectCount(0)).toBe('new');
    expect(getMasteryForCorrectCount(2)).toBe('new');
  });

  it('returns "learning" for 3-4 correct', () => {
    expect(getMasteryForCorrectCount(3)).toBe('learning');
    expect(getMasteryForCorrectCount(4)).toBe('learning');
  });

  it('returns "familiar" for 5-7 correct', () => {
    expect(getMasteryForCorrectCount(5)).toBe('familiar');
    expect(getMasteryForCorrectCount(7)).toBe('familiar');
  });

  it('returns "mastered" for 8+ correct', () => {
    expect(getMasteryForCorrectCount(8)).toBe('mastered');
    expect(getMasteryForCorrectCount(20)).toBe('mastered');
  });
});

describe('processReviewResult', () => {
  it('upgrades mastery on correct answer reaching threshold', () => {
    const entry = makeEntry({
      timesUsedCorrectly: 2,
      timesEncountered: 4,
      masteryLevel: 'new',
    });
    const result = processReviewResult(entry, true);
    expect(result.correct).toBe(true);
    expect(result.previousMastery).toBe('new');
    expect(result.newMastery).toBe('learning');
    expect(result.masteryChanged).toBe(true);
    expect(entry.timesUsedCorrectly).toBe(3);
    expect(entry.timesEncountered).toBe(5);
  });

  it('does not upgrade mastery if threshold not reached', () => {
    const entry = makeEntry({
      timesUsedCorrectly: 0,
      timesEncountered: 1,
      masteryLevel: 'new',
    });
    const result = processReviewResult(entry, true);
    expect(result.masteryChanged).toBe(false);
    expect(result.newMastery).toBe('new');
  });

  it('increments incorrect count on wrong answer', () => {
    const entry = makeEntry({
      timesUsedCorrectly: 3,
      timesUsedIncorrectly: 0,
      timesEncountered: 5,
      masteryLevel: 'learning',
    });
    const result = processReviewResult(entry, false);
    expect(result.correct).toBe(false);
    expect(entry.timesUsedIncorrectly).toBe(1);
    expect(entry.timesEncountered).toBe(6);
  });

  it('updates lastEncountered timestamp', () => {
    const now = 1000000;
    const entry = makeEntry({ lastEncountered: 500 });
    processReviewResult(entry, true, now);
    expect(entry.lastEncountered).toBe(now);
  });
});

describe('shouldTriggerReviewQuiz', () => {
  it('triggers when random < 0.25 for non-mastered words', () => {
    const entry = makeEntry({ masteryLevel: 'learning' });
    expect(shouldTriggerReviewQuiz(entry, 0.1)).toBe(true);
    expect(shouldTriggerReviewQuiz(entry, 0.24)).toBe(true);
  });

  it('does not trigger when random >= 0.25 for non-mastered words', () => {
    const entry = makeEntry({ masteryLevel: 'learning' });
    expect(shouldTriggerReviewQuiz(entry, 0.25)).toBe(false);
    expect(shouldTriggerReviewQuiz(entry, 0.9)).toBe(false);
  });

  it('uses lower chance (10%) for mastered words', () => {
    const entry = makeEntry({ masteryLevel: 'mastered' });
    expect(shouldTriggerReviewQuiz(entry, 0.05)).toBe(true);
    expect(shouldTriggerReviewQuiz(entry, 0.11)).toBe(false);
  });

  it('exports the trigger chance constant', () => {
    expect(REVIEW_TRIGGER_CHANCE).toBe(0.25);
  });
});

describe('shouldShowTargetLanguageOnly', () => {
  it('returns true for mastered words', () => {
    expect(shouldShowTargetLanguageOnly(makeEntry({ masteryLevel: 'mastered' }))).toBe(true);
  });

  it('returns false for non-mastered words', () => {
    expect(shouldShowTargetLanguageOnly(makeEntry({ masteryLevel: 'new' }))).toBe(false);
    expect(shouldShowTargetLanguageOnly(makeEntry({ masteryLevel: 'learning' }))).toBe(false);
    expect(shouldShowTargetLanguageOnly(makeEntry({ masteryLevel: 'familiar' }))).toBe(false);
  });
});

describe('timeUntilReview', () => {
  it('returns 0 when review is already due', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'new',
      lastEncountered: now - 10 * 60 * 1000, // 10 min ago, new = 5 min interval
    });
    expect(timeUntilReview(entry, now)).toBe(0);
  });

  it('returns positive ms when review is not yet due', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'learning',
      lastEncountered: now - 10 * 60 * 1000, // 10 min ago, learning = 30 min interval
    });
    const remaining = timeUntilReview(entry, now);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(20 * 60 * 1000);
  });
});

describe('getReviewDueLabel', () => {
  it('returns "Due now" when due', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'new',
      lastEncountered: now - 60 * 60 * 1000,
    });
    expect(getReviewDueLabel(entry, now)).toBe('Due now');
  });

  it('returns minutes label for short waits', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'learning',
      lastEncountered: now - 10 * 60 * 1000, // 10 min ago, 30 min interval = 20 min left
    });
    expect(getReviewDueLabel(entry, now)).toMatch(/^Due in \d+m$/);
  });

  it('returns hours label for longer waits', () => {
    const now = Date.now();
    const entry = makeEntry({
      masteryLevel: 'familiar',
      lastEncountered: now, // just now, 4 hour interval
    });
    expect(getReviewDueLabel(entry, now)).toMatch(/^Due in \d+h$/);
  });
});
