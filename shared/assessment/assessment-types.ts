/**
 * Assessment Type Definitions
 *
 * Core types for the assessment system: definitions, phases, tasks,
 * scoring dimensions, sessions, and results.
 */

export type AssessmentType = 'arrival' | 'departure' | 'periodic';

export type AssessmentPhaseType = 'conversational' | 'listening' | 'writing' | 'visual';

export interface ScoringDimension {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface AssessmentTask {
  id: string;
  name: string;
  description: string;
  prompt: string;
  maxScore: number;
  scoringDimensions: ScoringDimension[];
  timeLimitSeconds?: number;
}

export interface AssessmentPhase {
  id: string;
  name: string;
  type: AssessmentPhaseType;
  description: string;
  tasks: AssessmentTask[];
  maxScore: number;
  timeLimitSeconds?: number;
}

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  name: string;
  description: string;
  phases: AssessmentPhase[];
  totalMaxPoints: number;
  timeLimitSeconds: number;
}

export interface TaskResult {
  taskId: string;
  score: number;
  maxScore: number;
  dimensionScores: Record<string, number>;
}

export interface PhaseResult {
  phaseId: string;
  taskResults: TaskResult[];
  totalScore: number;
  maxScore: number;
  completedAt: number;
}

export interface AutomatedMetrics {
  wordsPerMinute: number;
  typeTokenRatio: number;
  meanLengthUtterance: number;
  responseLatencyMs: number;
  selfRepairs: number;
  codeSwitchCount: number;
}

export interface RecordingReference {
  phaseId: string;
  taskId: string;
  url?: string;
  transcript?: string;
}

export interface AssessmentSession {
  id: string;
  playerId: string;
  worldId: string;
  assessmentType: AssessmentType;
  definitionId: string;
  startedAt: number;
  completedAt?: number;
  phaseResults: PhaseResult[];
  totalScore?: number;
  totalMaxPoints: number;
  cefrLevel?: string;
  automatedMetrics?: AutomatedMetrics;
  recordings: RecordingReference[];
}
