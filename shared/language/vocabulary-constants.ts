/**
 * Canonical Vocabulary Mastery Thresholds
 *
 * Single source of truth for mastery level definitions across the entire
 * codebase. All mastery checks (progress.ts, vocabulary-review.ts,
 * cefr-adaptation.ts, knowledge-acquisition, etc.) must import from here.
 */

import type { MasteryLevel } from '../feature-modules/knowledge-acquisition/types';

// ── Mastery Thresholds (correct uses required) ──────────────────────────────

export const MASTERY_THRESHOLDS: Record<MasteryLevel, number> = {
  new: 0,
  learning: 3,
  familiar: 5,
  mastered: 8,
};

// ── Review Intervals (milliseconds) ─────────────────────────────────────────

export const REVIEW_INTERVALS: Record<MasteryLevel, number> = {
  new: 5 * 60 * 1000,             // 5 minutes
  learning: 30 * 60 * 1000,       // 30 minutes
  familiar: 4 * 60 * 60 * 1000,   // 4 hours
  mastered: 24 * 60 * 60 * 1000,  // 24 hours
};

// ── Encounter threshold for leaving "new" ───────────────────────────────────

/** Minimum encounters before a word can advance past 'new'. */
export const MIN_ENCOUNTERS_TO_PROGRESS = 1;

/** Minimum encounters to auto-promote to 'learning' even without correct uses. */
export const ENCOUNTER_LEARNING_THRESHOLD = 2;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Calculate mastery level from correct-use count. */
export function getMasteryForCorrectCount(timesUsedCorrectly: number): MasteryLevel {
  if (timesUsedCorrectly >= MASTERY_THRESHOLDS.mastered) return 'mastered';
  if (timesUsedCorrectly >= MASTERY_THRESHOLDS.familiar) return 'familiar';
  if (timesUsedCorrectly >= MASTERY_THRESHOLDS.learning) return 'learning';
  return 'new';
}

/** Whether a word is considered "mastered" (8+ correct uses and at least 1 encounter). */
export function isWordMastered(timesEncountered: number, timesUsedCorrectly: number): boolean {
  return timesEncountered >= MIN_ENCOUNTERS_TO_PROGRESS && timesUsedCorrectly >= MASTERY_THRESHOLDS.mastered;
}
