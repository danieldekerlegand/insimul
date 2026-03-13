/**
 * CEFR Score Mapping
 *
 * Maps numeric assessment scores to CEFR (Common European Framework of Reference)
 * proficiency levels (A1–B2) and provides a generic level-mapping utility.
 */

// ── CEFR types ──────────────────────────────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface CEFRResult {
  level: CEFRLevel;
  description: string;
  /** Normalized score 0–100 that produced this level */
  score: number;
}

// ── Thresholds ──────────────────────────────────────────────────────────────

/** Minimum normalized score (0–100) required for each CEFR level. */
const CEFR_THRESHOLDS: { min: number; level: CEFRLevel }[] = [
  { min: 75, level: 'B2' },
  { min: 50, level: 'B1' },
  { min: 25, level: 'A2' },
  { min: 0, level: 'A1' },
];

// ── Descriptions ────────────────────────────────────────────────────────────

const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: 'Beginner — Can understand and use familiar everyday expressions and very basic phrases.',
  A2: 'Elementary — Can communicate in simple, routine tasks requiring a direct exchange of information.',
  B1: 'Intermediate — Can deal with most situations likely to arise while travelling in the target language area.',
  B2: 'Upper-Intermediate — Can interact with a degree of fluency and spontaneity with native speakers.',
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Map a raw assessment score to a CEFR level.
 *
 * @param score  Points earned by the learner.
 * @param maxScore  Maximum possible points (used to normalize to 0–100).
 * @returns A {@link CEFRResult} containing the level, description, and normalized score.
 */
export function mapScoreToCEFR(score: number, maxScore: number): CEFRResult {
  if (maxScore <= 0) {
    throw new Error('maxScore must be greater than 0');
  }
  const normalized = Math.max(0, Math.min(100, (score / maxScore) * 100));
  const level = mapScoreToLevel(normalized, CEFR_THRESHOLDS);
  return {
    level,
    description: getCEFRDescription(level),
    score: Math.round(normalized * 100) / 100,
  };
}

/**
 * Generic threshold mapper — walks a sorted-descending list of
 * `{ min, level }` entries and returns the first level whose `min`
 * the score meets or exceeds.
 *
 * @param score  Normalized value to classify.
 * @param thresholds  Descending array of `{ min, level }` objects.
 *   The last entry should have `min: 0` as a catch-all.
 * @returns The matched level value.
 */
export function mapScoreToLevel<T>(
  score: number,
  thresholds: { min: number; level: T }[],
): T {
  for (const t of thresholds) {
    if (score >= t.min) return t.level;
  }
  // Fallback: return the last (lowest) level
  return thresholds[thresholds.length - 1].level;
}

/**
 * Return the human-readable description for a CEFR level.
 */
export function getCEFRDescription(level: CEFRLevel): string {
  return CEFR_DESCRIPTIONS[level];
}
