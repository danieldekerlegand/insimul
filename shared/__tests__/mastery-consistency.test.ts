/**
 * Mastery Threshold Consistency Tests
 *
 * Verifies that all mastery definitions across the codebase agree on
 * the same thresholds, using vocabulary-constants.ts as the single
 * source of truth.
 */
import { describe, it, expect } from 'vitest';

import {
  MASTERY_THRESHOLDS,
  REVIEW_INTERVALS,
  getMasteryForCorrectCount,
  isWordMastered,
  MIN_ENCOUNTERS_TO_PROGRESS,
  ENCOUNTER_LEARNING_THRESHOLD,
} from '@shared/language/vocabulary-constants';

import { calculateMasteryLevel } from '@shared/language/progress';
import { getMasteryForCorrectCount as srsGetMastery } from '@shared/language/vocabulary-review';
import { isWordMastered as cefrIsWordMastered } from '@shared/language/cefr-adaptation';
import { DEFAULT_MASTERY_THRESHOLDS } from '@shared/feature-modules/knowledge-acquisition/types';
import { calculateMastery } from '@shared/feature-modules/knowledge-acquisition/types';
import { LANGUAGE_KNOWLEDGE_CONFIG } from '@shared/feature-modules/language-learning-config';

describe('Mastery threshold consistency', () => {
  // ── Canonical thresholds ──────────────────────────────────────────────────

  it('canonical thresholds are new=0, learning=3, familiar=5, mastered=8', () => {
    expect(MASTERY_THRESHOLDS).toEqual({
      new: 0,
      learning: 3,
      familiar: 5,
      mastered: 8,
    });
  });

  // ── All locations agree ───────────────────────────────────────────────────

  it('DEFAULT_MASTERY_THRESHOLDS (knowledge-acquisition) matches canonical', () => {
    expect(DEFAULT_MASTERY_THRESHOLDS).toEqual(MASTERY_THRESHOLDS);
  });

  it('LANGUAGE_KNOWLEDGE_CONFIG.masteryThresholds matches canonical', () => {
    expect(LANGUAGE_KNOWLEDGE_CONFIG.masteryThresholds).toEqual(MASTERY_THRESHOLDS);
  });

  // ── getMasteryForCorrectCount consistency ──────────────────────────────────

  it('vocabulary-review getMasteryForCorrectCount matches canonical', () => {
    for (let i = 0; i <= 12; i++) {
      expect(srsGetMastery(i)).toBe(getMasteryForCorrectCount(i));
    }
  });

  it('knowledge-acquisition calculateMastery (default thresholds) matches canonical', () => {
    for (let i = 0; i <= 12; i++) {
      expect(calculateMastery(i)).toBe(getMasteryForCorrectCount(i));
    }
  });

  // ── calculateMasteryLevel consistency ─────────────────────────────────────

  it('calculateMasteryLevel agrees with canonical for words with correct uses', () => {
    // With sufficient encounters and correct uses >= learning threshold,
    // calculateMasteryLevel should match getMasteryForCorrectCount exactly
    const encounters = 10; // well above any encounter threshold
    for (let correct = MASTERY_THRESHOLDS.learning; correct <= 12; correct++) {
      const fromProgress = calculateMasteryLevel(encounters, correct);
      const fromCanonical = getMasteryForCorrectCount(correct);
      expect(fromProgress).toBe(fromCanonical);
    }
  });

  it('calculateMasteryLevel encounter-based fallback promotes to learning, not higher', () => {
    // With many encounters but 0 correct uses, encounter fallback gives 'learning'
    // This is intentional: encounters alone can't advance past 'learning'
    expect(calculateMasteryLevel(10, 0)).toBe('learning');
    expect(calculateMasteryLevel(10, 1)).toBe('learning'); // below learning threshold (3)
    expect(calculateMasteryLevel(10, 2)).toBe('learning'); // still below
    expect(calculateMasteryLevel(10, 3)).toBe('learning'); // matches canonical
  });

  it('calculateMasteryLevel returns new for zero encounters', () => {
    expect(calculateMasteryLevel(0, 0)).toBe('new');
    expect(calculateMasteryLevel(0, 5)).toBe('new'); // even with correct uses
  });

  it('calculateMasteryLevel promotes to learning at encounter threshold', () => {
    expect(calculateMasteryLevel(ENCOUNTER_LEARNING_THRESHOLD, 0)).toBe('learning');
    expect(calculateMasteryLevel(1, 0)).toBe('new');
  });

  // ── isWordMastered consistency ────────────────────────────────────────────

  it('cefr-adaptation isWordMastered matches canonical', () => {
    // Both should be the same function (re-exported)
    for (let enc = 0; enc <= 10; enc++) {
      for (let correct = 0; correct <= 10; correct++) {
        expect(cefrIsWordMastered(enc, correct)).toBe(isWordMastered(enc, correct));
      }
    }
  });

  it('isWordMastered requires 8+ correct uses and at least 1 encounter', () => {
    expect(isWordMastered(0, 8)).toBe(false);  // no encounters
    expect(isWordMastered(1, 7)).toBe(false);  // below mastered threshold
    expect(isWordMastered(1, 8)).toBe(true);   // meets both
    expect(isWordMastered(5, 10)).toBe(true);  // exceeds both
  });

  it('isWordMastered threshold aligns with MASTERY_THRESHOLDS.mastered', () => {
    const masteredThreshold = MASTERY_THRESHOLDS.mastered;
    // Just above mastered threshold + min encounters → mastered
    expect(isWordMastered(MIN_ENCOUNTERS_TO_PROGRESS, masteredThreshold)).toBe(true);
    // Just below mastered threshold → not mastered
    expect(isWordMastered(MIN_ENCOUNTERS_TO_PROGRESS, masteredThreshold - 1)).toBe(false);
  });

  // ── getMasteryForCorrectCount boundary tests ──────────────────────────────

  it('returns correct mastery at exact thresholds', () => {
    expect(getMasteryForCorrectCount(0)).toBe('new');
    expect(getMasteryForCorrectCount(2)).toBe('new');
    expect(getMasteryForCorrectCount(3)).toBe('learning');
    expect(getMasteryForCorrectCount(4)).toBe('learning');
    expect(getMasteryForCorrectCount(5)).toBe('familiar');
    expect(getMasteryForCorrectCount(7)).toBe('familiar');
    expect(getMasteryForCorrectCount(8)).toBe('mastered');
    expect(getMasteryForCorrectCount(100)).toBe('mastered');
  });

  // ── Review intervals ──────────────────────────────────────────────────────

  it('review intervals increase with mastery level', () => {
    expect(REVIEW_INTERVALS.new).toBeLessThan(REVIEW_INTERVALS.learning);
    expect(REVIEW_INTERVALS.learning).toBeLessThan(REVIEW_INTERVALS.familiar);
    expect(REVIEW_INTERVALS.familiar).toBeLessThan(REVIEW_INTERVALS.mastered);
  });
});
