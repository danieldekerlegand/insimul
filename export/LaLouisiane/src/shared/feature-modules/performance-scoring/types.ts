/**
 * Performance Scoring Module — Generic Types
 *
 * Abstracts pronunciation scoring into a generic "performance analysis"
 * system comparing player output against expected output:
 *   - Language: pronunciation vs. expected speech
 *   - Music: played notes vs. sheet music
 *   - Combat: executed combo vs. expected sequence
 *   - Cooking: recipe execution vs. recipe steps
 */

// ---------------------------------------------------------------------------
// Performance analysis
// ---------------------------------------------------------------------------

export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface PerformanceResult {
  /** Overall grade. */
  grade: PerformanceGrade;
  /** Overall score (0-100). */
  score: number;
  /** Per-unit scores (e.g., per-word, per-note, per-step). */
  unitScores: UnitScore[];
  /** Detected issues. */
  issues: PerformanceIssue[];
  /** Analysis timestamp. */
  analyzedAt: number;
}

export interface UnitScore {
  /** Unit identifier (word, note index, step index). */
  unitId: string;
  /** Display label. */
  label: string;
  /** Score 0-100. */
  score: number;
  /** Whether this unit was correct. */
  correct: boolean;
  /** Optional details. */
  details?: Record<string, unknown>;
}

export interface PerformanceIssue {
  /** Issue type (e.g., 'mispronunciation', 'wrong_note', 'timing_off'). */
  type: string;
  /** Severity 0-1. */
  severity: number;
  /** Which unit(s) were affected. */
  unitIds: string[];
  /** Description of the issue. */
  description: string;
}

// ---------------------------------------------------------------------------
// Analyzers
// ---------------------------------------------------------------------------

export type AnalyzerType = 'audio' | 'input_sequence' | 'timing' | 'spatial' | 'custom';

export interface AnalyzerConfig {
  type: AnalyzerType;
  /** Analyzer-specific parameters. */
  params: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

export interface PerformanceScoringConfig {
  /** Available analyzers for this genre. */
  analyzers: AnalyzerConfig[];
  /** Grade thresholds (score → grade mapping). */
  gradeThresholds?: Record<PerformanceGrade, number>;
}

export const DEFAULT_GRADE_THRESHOLDS: Record<PerformanceGrade, number> = {
  S: 95,
  A: 85,
  B: 70,
  C: 55,
  D: 40,
  F: 0,
};

/** Calculate grade from a score. */
export function getGradeForScore(
  score: number,
  thresholds: Record<PerformanceGrade, number> = DEFAULT_GRADE_THRESHOLDS,
): PerformanceGrade {
  const grades: PerformanceGrade[] = ['S', 'A', 'B', 'C', 'D', 'F'];
  for (const grade of grades) {
    if (score >= thresholds[grade]) return grade;
  }
  return 'F';
}
