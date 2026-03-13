/**
 * CEFR Score Mapping
 *
 * Maps numeric assessment scores to CEFR (Common European Framework of Reference)
 * proficiency levels. Supports A1-B2 range for language learning game context.
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface CEFRThreshold {
  level: CEFRLevel;
  minScore: number;
  description: string;
}

const CEFR_THRESHOLDS: CEFRThreshold[] = [
  { level: 'B2', minScore: 42, description: 'Upper Intermediate — Can understand complex texts and interact fluently with native speakers' },
  { level: 'B1', minScore: 30, description: 'Intermediate — Can deal with most situations while traveling and describe experiences' },
  { level: 'A2', minScore: 18, description: 'Elementary — Can communicate in simple, routine tasks on familiar topics' },
  { level: 'A1', minScore: 0,  description: 'Beginner — Can understand and use basic everyday expressions' },
];

/**
 * Map a numeric score (0-53 scale) to a CEFR level.
 */
export function mapScoreToCEFR(score: number): CEFRLevel {
  for (const threshold of CEFR_THRESHOLDS) {
    if (score >= threshold.minScore) {
      return threshold.level;
    }
  }
  return 'A1';
}

/**
 * Generic score-to-level mapper for any ordered level system.
 */
export function mapScoreToLevel<T>(
  score: number,
  thresholds: { level: T; minScore: number }[]
): T {
  const sorted = [...thresholds].sort((a, b) => b.minScore - a.minScore);
  for (const t of sorted) {
    if (score >= t.minScore) {
      return t.level;
    }
  }
  return sorted[sorted.length - 1].level;
}

/**
 * Get a human-readable description for a CEFR level.
 */
export function getCEFRDescription(level: CEFRLevel): string {
  const threshold = CEFR_THRESHOLDS.find(t => t.level === level);
  return threshold?.description ?? 'Unknown level';
}

/**
 * Map a CEFR level to the fluency tier range used by buildPlayerProficiencySection.
 * This allows CEFR assessment results to override the fluency-based tier selection.
 */
export function cefrToFluencyTier(level: CEFRLevel): { min: number; effective: number } {
  switch (level) {
    case 'A1': return { min: 0, effective: 10 };
    case 'A2': return { min: 20, effective: 30 };
    case 'B1': return { min: 40, effective: 50 };
    case 'B2': return { min: 60, effective: 70 };
  }
}
