/**
 * Assessment Type Definitions
 *
 * Core types for the assessment system including sessions, phases,
 * tasks, scoring dimensions, and results.
 */

import type { CEFRLevel } from './cefr-mapping';

export type AssessmentType = 'arrival' | 'departure' | 'periodic';

export interface ScoringDimension {
  name: string;
  score: number;       // 1-5 scale
  description: string;
}

export interface AssessmentDimensionScores {
  comprehension: number;   // 1-5
  fluency: number;         // 1-5
  vocabulary: number;      // 1-5
  grammar: number;         // 1-5
  pronunciation: number;   // 1-5
}

export interface PhaseResult {
  phaseId: string;
  score: number;
  maxScore: number;
  dimensions?: ScoringDimension[];
  completedAt: number;
}

export interface AssessmentResult {
  sessionId: string;
  assessmentType: AssessmentType;
  totalScore: number;
  maxScore: number;
  cefrLevel: CEFRLevel;
  phaseResults: PhaseResult[];
  dimensionScores?: AssessmentDimensionScores;
  completedAt: number;
}
