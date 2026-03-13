/**
 * Assessment type definitions (US-5.06)
 *
 * Pure types for the assessment system — no logic.
 */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type AssessmentType = 'arrival_encounter' | 'departure_encounter' | 'periodic';

export interface ScoringDimension {
  id: string;
  name: string;
  maxScore: number;
  /** Description shown in results UI */
  description?: string;
}

export interface AssessmentTask {
  id: string;
  title: string;
  description: string;
  /** Max points for this task */
  maxScore: number;
  /** Dimension this task contributes to */
  dimensionId: string;
}

export interface AssessmentPhase {
  id: string;
  name: string;
  order: number;
  /** Max points for this phase */
  maxScore: number;
  /** Time limit in seconds */
  timeLimitSeconds?: number;
  /** NPC system prompt template (uses {{targetLanguage}}, {{cityName}}) */
  systemPromptTemplate?: string;
  tasks: AssessmentTask[];
}

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  name: string;
  description: string;
  totalMaxScore: number;
  phases: AssessmentPhase[];
  scoringDimensions: ScoringDimension[];
}

export interface TaskResult {
  taskId: string;
  score: number;
  maxScore: number;
  /** Raw player response data */
  responseData?: Record<string, unknown>;
}

export interface PhaseResult {
  phaseId: string;
  score: number;
  maxScore: number;
  taskResults: TaskResult[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface AutomatedMetrics {
  /** Words per minute */
  wpm?: number;
  /** Type-token ratio (vocabulary diversity) */
  ttr?: number;
  /** Mean length of utterance */
  mlu?: number;
  /** Average response latency in ms */
  latencyMs?: number;
  /** Number of self-repairs */
  repairs?: number;
  /** Code-switching count (target ↔ native language switches) */
  codeSwitchCount?: number;
}

export interface RecordingReference {
  phaseId: string;
  taskId?: string;
  /** Storage URL or blob reference */
  url: string;
  durationMs: number;
  mimeType: string;
}

export interface AssessmentSession {
  id: string;
  playerId: string;
  worldId: string;
  assessmentType: AssessmentType;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  cefrLevel?: CefrLevel;
  totalScore?: number;
  totalMaxScore: number;
  phaseResults: PhaseResult[];
  automatedMetrics?: AutomatedMetrics;
  recordings: RecordingReference[];
  transcript?: Array<{ role: 'player' | 'npc'; text: string; timestamp: number }>;
  startedAt?: Date;
  completedAt?: Date;
  /** Target language being assessed */
  targetLanguage?: string;
}
