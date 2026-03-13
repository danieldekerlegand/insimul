/**
 * CEFR score mapping (US-5.06)
 *
 * Maps raw assessment scores to CEFR proficiency levels (A1–B2).
 */

import type { CefrLevel } from './assessment-types';

export interface CefrThreshold {
  level: CefrLevel;
  /** Minimum percentage (0–100) to reach this level */
  minPercent: number;
  description: string;
}

export const CEFR_THRESHOLDS: CefrThreshold[] = [
  { level: 'B2', minPercent: 75, description: 'Upper Intermediate — Can understand complex text and interact fluently with native speakers.' },
  { level: 'B1', minPercent: 50, description: 'Intermediate — Can deal with most situations while travelling and describe experiences.' },
  { level: 'A2', minPercent: 25, description: 'Elementary — Can communicate in simple, routine tasks on familiar topics.' },
  { level: 'A1', minPercent: 0,  description: 'Beginner — Can understand and use familiar everyday expressions.' },
];

/** Map a raw score (0–maxScore) to a CEFR level */
export function mapScoreToCEFR(score: number, maxScore: number): CefrLevel {
  const percent = maxScore > 0 ? (score / maxScore) * 100 : 0;
  for (const threshold of CEFR_THRESHOLDS) {
    if (percent >= threshold.minPercent) {
      return threshold.level;
    }
  }
  return 'A1';
}

/** Generic score-to-level mapper */
export function mapScoreToLevel<T>(
  score: number,
  maxScore: number,
  thresholds: Array<{ level: T; minPercent: number }>,
): T {
  const percent = maxScore > 0 ? (score / maxScore) * 100 : 0;
  for (const threshold of thresholds) {
    if (percent >= threshold.minPercent) {
      return threshold.level;
    }
  }
  return thresholds[thresholds.length - 1].level;
}

/** Get the human-readable description for a CEFR level */
export function getCEFRDescription(level: CefrLevel): string {
  const threshold = CEFR_THRESHOLDS.find(t => t.level === level);
  return threshold?.description ?? '';
}
