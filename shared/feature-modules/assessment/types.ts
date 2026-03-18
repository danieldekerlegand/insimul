/**
 * Assessment Module — Generic Types
 *
 * Abstracts the language-learning assessment framework (ACTFL OPI, SUS, SSQ, IPQ)
 * into a generic instrument registry. Any genre can register its own assessment
 * instruments while sharing the multi-phase structure.
 */

// ---------------------------------------------------------------------------
// Assessment instruments
// ---------------------------------------------------------------------------

export type ScaleType = 'likert' | 'numeric' | 'open_ended' | 'multiple_choice';

export interface AssessmentQuestion {
  id: string;
  text: string;
  scaleType: ScaleType;
  options?: string[];           // for multiple choice
  scaleMin?: number;            // for likert/numeric
  scaleMax?: number;
  scaleLabels?: string[];       // e.g., ['Strongly Disagree', ..., 'Strongly Agree']
}

export interface AssessmentInstrument {
  /** Unique instrument ID (e.g., 'actfl-opi', 'sus', 'combat-proficiency'). */
  id: string;
  /** Display name. */
  name: string;
  /** Which genre(s) this instrument is designed for (empty = universal). */
  genres: string[];
  /** Assessment questions / items. */
  questions: AssessmentQuestion[];
  /** Subscale definitions for grouping and scoring. */
  subscales?: AssessmentSubscale[];
}

export interface AssessmentSubscale {
  id: string;
  name: string;
  questionIds: string[];
  scoringMethod: 'average' | 'sum' | 'custom';
}

// ---------------------------------------------------------------------------
// Assessment session
// ---------------------------------------------------------------------------

export type AssessmentPhase = 'pre' | 'post' | 'delayed' | 'custom';

export interface AssessmentSession {
  id: string;
  playerId: string;
  worldId: string;
  playthroughId?: string;
  instrumentId: string;
  phase: AssessmentPhase;
  responses: AssessmentResponse[];
  subscaleScores?: Record<string, number>;
  overallScore?: number;
  startedAt: number;
  completedAt?: number;
}

export interface AssessmentResponse {
  questionId: string;
  value: number | string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

export interface AssessmentConfig {
  /** Instrument IDs enabled for this genre. */
  enabledInstruments: string[];
  /** Assessment phases this genre uses. */
  phases: AssessmentPhase[];
}

export const DEFAULT_CONFIG: AssessmentConfig = {
  enabledInstruments: [],
  phases: ['pre', 'post'],
};
