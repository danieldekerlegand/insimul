/**
 * Assessment Type Definitions
 *
 * Pure type definitions for in-game language proficiency assessments.
 * Assessments are structured as multi-phase encounters (e.g., Arrival/Departure)
 * with conversational, listening, writing, and visual tasks scored across
 * five dimensions mapped to CEFR levels.
 */

// ───────────────────────────────────────────────────────────────────────────
// Core Enums & Literals
// ───────────────────────────────────────────────────────────────────────────

export type AssessmentType = 'arrival' | 'departure' | 'periodic';

export type PhaseType = 'conversational' | 'listening' | 'writing' | 'visual';

export type TaskType =
  | 'conversation_tier'
  | 'follow_directions'
  | 'info_extraction'
  | 'form_completion'
  | 'brief_message'
  | 'sign_reading'
  | 'object_identification';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type AssessmentStatus =
  | 'idle'
  | 'initializing'
  | 'phase_active'
  | 'phase_transitioning'
  | 'scoring'
  | 'complete';

export type ScoringMethod = 'llm' | 'automated' | 'position_tracking' | 'multiple_choice';

// ───────────────────────────────────────────────────────────────────────────
// Scoring
// ───────────────────────────────────────────────────────────────────────────

export interface ScoringDimension {
  id: string;
  name: string;
  description: string;
  /** Min score for this dimension (typically 1) */
  minScore: number;
  /** Max score for this dimension (typically 5) */
  maxScore: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Task & Phase Definitions (static encounter structure)
// ───────────────────────────────────────────────────────────────────────────

export interface AssessmentTask {
  id: string;
  type: TaskType;
  /** Template prompt — may contain {{targetLanguage}}, {{cityName}} placeholders */
  prompt: string;
  /** Max points for this task */
  maxPoints: number;
  /** How this task is scored */
  scoringMethod: ScoringMethod;
  /** Time limit in seconds (optional) */
  timeLimitSeconds?: number;
  /** Multiple-choice options (for MC tasks) */
  options?: string[];
  /** Expected answer for auto-scored tasks */
  expectedAnswer?: string;
}

export interface AssessmentPhase {
  id: string;
  type: PhaseType;
  name: string;
  description: string;
  tasks: AssessmentTask[];
  /** Max points for the entire phase (sum of task maxPoints) */
  maxPoints: number;
  /** Time limit for the entire phase in seconds (optional) */
  timeLimitSeconds?: number;
  /** Scoring dimensions evaluated during this phase */
  scoringDimensions?: string[];
}

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  name: string;
  description: string;
  /** Target language placeholder — replaced at runtime */
  targetLanguage: string;
  phases: AssessmentPhase[];
  /** Total max points across all phases */
  totalMaxPoints: number;
  /** Scoring dimensions used in this assessment */
  scoringDimensions: ScoringDimension[];
  /** Estimated duration in minutes */
  estimatedMinutes: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Runtime Results
// ───────────────────────────────────────────────────────────────────────────

export interface RecordingReference {
  /** Storage key or URL for the recording */
  storageKey: string;
  /** MIME type (e.g., 'audio/webm', 'text/plain') */
  mimeType: string;
  /** Duration in seconds (for audio/video) */
  durationSeconds?: number;
  /** Phase this recording belongs to */
  phaseId: string;
  /** Task this recording belongs to (optional) */
  taskId?: string;
  /** Timestamp when recorded */
  recordedAt: string;
}

export interface AutomatedMetrics {
  /** Words per minute */
  wpm: number;
  /** Type-token ratio (vocabulary diversity) */
  ttr: number;
  /** Mean length of utterance in words */
  mlu: number;
  /** Average response latency in milliseconds */
  avgLatencyMs: number;
  /** Number of self-repairs/corrections */
  repairs: number;
  /** Number of code-switching instances (falling back to L1) */
  codeSwitchingCount: number;
}

export interface TaskResult {
  taskId: string;
  /** Points earned */
  score: number;
  /** Max possible points */
  maxPoints: number;
  /** Player's raw response (text input, selection, etc.) */
  playerResponse?: string;
  /** Scoring rationale (from LLM or auto-scorer) */
  rationale?: string;
}

export interface PhaseResult {
  phaseId: string;
  /** Total score for this phase */
  score: number;
  /** Max possible score for this phase */
  maxPoints: number;
  /** Individual task results */
  taskResults: TaskResult[];
  /** Per-dimension scores (dimension id -> score) */
  dimensionScores?: Record<string, number>;
  /** Automated metrics collected during this phase */
  automatedMetrics?: AutomatedMetrics;
  /** Full transcript of the phase interaction */
  transcript?: string;
  /** Recording references for this phase */
  recordings?: RecordingReference[];
  /** When this phase started */
  startedAt?: string;
  /** When this phase completed */
  completedAt?: string;
}

export interface AssessmentSession {
  id: string;
  playerId: string;
  worldId: string;
  /** Which assessment definition was used */
  assessmentDefinitionId: string;
  assessmentType: AssessmentType;
  /** Target language being assessed */
  targetLanguage: string;
  status: AssessmentStatus;
  /** Results per phase */
  phaseResults: PhaseResult[];
  /** Total score across all phases */
  totalScore?: number;
  /** Total max possible score */
  totalMaxPoints: number;
  /** Overall CEFR level determined from scores */
  cefrLevel?: CEFRLevel;
  /** Aggregate dimension scores (dimension id -> score) */
  dimensionScores?: Record<string, number>;
  /** Aggregate automated metrics */
  automatedMetrics?: AutomatedMetrics;
  /** All recordings for this session */
  recordings?: RecordingReference[];
  /** When the session was created */
  createdAt: string;
  /** When the session started (first phase began) */
  startedAt?: string;
  /** When the session completed */
  completedAt?: string;
}
