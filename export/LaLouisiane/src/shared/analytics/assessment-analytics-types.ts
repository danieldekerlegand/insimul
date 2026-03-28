/**
 * Assessment Analytics Types
 *
 * Types for detailed pre/post assessment comparison, learning gains analysis,
 * and per-dimension progress tracking across assessment sessions.
 */

import type { CEFRLevel, AssessmentType } from '../assessment/assessment-types';

// ─── Learning Gains ─────────────────────────────────────────────────────────

/** Normalized learning gain using Hake's formula: (post - pre) / (max - pre) */
export interface LearningGain {
  /** Raw gain: post - pre */
  rawGain: number;
  /** Normalized gain (Hake): (post - pre) / (max - pre), null if pre === max */
  normalizedGain: number | null;
  /** Effect size (Cohen's d): (post - pre) / pooled_sd, null if no variance */
  effectSize: number | null;
  /** Percentage change: ((post - pre) / pre) * 100, null if pre === 0 */
  percentChange: number | null;
}

/** Per-dimension learning gain analysis */
export interface DimensionGain {
  dimension: string;
  preScore: number;
  postScore: number;
  maxScore: number;
  gain: LearningGain;
}

/** Per-phase learning gain analysis */
export interface PhaseGain {
  phaseId: string;
  phaseName: string;
  phaseType: string;
  preScore: number;
  postScore: number;
  maxScore: number;
  gain: LearningGain;
}

// ─── Pre/Post Comparison ────────────────────────────────────────────────────

/** Complete pre/post comparison for a single player */
export interface PrePostComparison {
  playerId: string;
  worldId: string;
  preSession: SessionSummary;
  postSession: SessionSummary;
  /** Overall score gain */
  overallGain: LearningGain;
  /** CEFR level progression */
  cefrProgression: {
    pre: CEFRLevel;
    post: CEFRLevel;
    levelsGained: number;
    improved: boolean;
  };
  /** Per-dimension gains */
  dimensionGains: DimensionGain[];
  /** Per-phase gains */
  phaseGains: PhaseGain[];
  /** Strongest dimension (highest normalized gain) */
  strongestGrowth: string | null;
  /** Weakest dimension (lowest normalized gain) */
  weakestGrowth: string | null;
  /** Periodic assessment trajectory between pre and post */
  trajectory: TrajectoryPoint[];
}

/** Minimal session summary for comparison display */
export interface SessionSummary {
  sessionId: string;
  assessmentType: AssessmentType;
  totalScore: number;
  maxScore: number;
  percentage: number;
  cefrLevel: CEFRLevel;
  dimensionScores: Record<string, number>;
  completedAt: number | null;
}

/** A point on the learning trajectory (periodic assessments) */
export interface TrajectoryPoint {
  sessionId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  cefrLevel: CEFRLevel;
  completedAt: number;
}

// ─── Aggregate Analytics ────────────────────────────────────────────────────

/** World-level assessment analytics aggregated across players */
export interface AssessmentAnalyticsSummary {
  worldId: string;
  /** Total players with at least one completed assessment */
  totalAssessedPlayers: number;
  /** Players with both pre and post assessments */
  playersWithPrePost: number;
  /** Average normalized gain across all players with pre/post */
  avgNormalizedGain: number | null;
  /** Average effect size across all players */
  avgEffectSize: number | null;
  /** CEFR level distribution at pre-test */
  preCefrDistribution: Record<string, number>;
  /** CEFR level distribution at post-test */
  postCefrDistribution: Record<string, number>;
  /** Percentage of players who improved CEFR level */
  cefrImprovementRate: number;
  /** Per-dimension aggregate gains */
  dimensionGains: DimensionGain[];
  /** Per-phase aggregate gains */
  phaseGains: PhaseGain[];
  /** Score statistics */
  scoreStats: {
    preAvg: number;
    postAvg: number;
    preMedian: number;
    postMedian: number;
    preStdDev: number;
    postStdDev: number;
  };
  /** Individual player comparisons */
  playerComparisons: PrePostComparison[];
  /** Generated timestamp */
  generatedAt: number;
}
