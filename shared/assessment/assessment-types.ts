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

export type AssessmentType = 'arrival' | 'departure' | 'periodic' | 'arrival_encounter' | 'departure_encounter';

export type PhaseType = 'conversational' | 'listening' | 'writing' | 'visual';

/** Alias used by periodic-encounter definitions */
export type AssessmentPhaseType = PhaseType;

export type TaskType =
  | 'conversation_tier'
  | 'follow_directions'
  | 'info_extraction'
  | 'form_completion'
  | 'brief_message'
  | 'sign_reading'
  | 'object_identification';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

/** Alias for CEFRLevel used by the conversation controller */
export type CefrLevel = CEFRLevel;

export type AssessmentStatus =
  | 'idle'
  | 'initializing'
  | 'phase_active'
  | 'phase_transitioning'
  | 'scoring'
  | 'complete'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'abandoned';

export type ScoringMethod = 'llm' | 'automated' | 'position_tracking' | 'multiple_choice';

// ───────────────────────────────────────────────────────────────────────────
// Scoring
// ───────────────────────────────────────────────────────────────────────────

export interface ScoringDimension {
  id: string;
  name: string;
  description: string;
  /** Min score for this dimension (typically 1) */
  minScore?: number;
  /** Max score for this dimension (typically 5) */
  maxScore: number;
}

export interface AssessmentDimensionScores {
  comprehension: number;   // 1-5
  fluency: number;         // 1-5
  vocabulary: number;      // 1-5
  grammar: number;         // 1-5
  pronunciation: number;   // 1-5
}

// ───────────────────────────────────────────────────────────────────────────
// Task & Phase Definitions (static encounter structure)
// ───────────────────────────────────────────────────────────────────────────

export interface AssessmentTask {
  id: string;
  name?: string;
  description?: string;
  type?: TaskType;
  /** Template prompt — may contain {{targetLanguage}}, {{cityName}} placeholders */
  prompt: string;
  /** Max points for this task */
  maxPoints?: number;
  /** Max score (alias for maxPoints used by periodic encounters) */
  maxScore?: number;
  /** How this task is scored */
  scoringMethod?: ScoringMethod;
  /** Scoring dimensions for this task */
  scoringDimensions?: ScoringDimension[];
  /** Time limit in seconds (optional) */
  timeLimitSeconds?: number;
  /** Multiple-choice options (for MC tasks) */
  options?: string[];
  /** Expected answer for auto-scored tasks */
  expectedAnswer?: string;
}

export interface AssessmentPhase {
  id: string;
  type: PhaseType | AssessmentPhaseType;
  name: string;
  description: string;
  tasks: AssessmentTask[];
  /** Max points for the entire phase (sum of task maxPoints) */
  maxPoints?: number;
  /** Max score (alias for maxPoints used by periodic encounters) */
  maxScore?: number;
  /** Time limit for the entire phase in seconds (optional) */
  timeLimitSeconds?: number;
  /** Scoring dimensions evaluated during this phase */
  scoringDimensions?: string[] | ScoringDimension[];
  /** NPC system prompt template (uses {{targetLanguage}}, {{cityName}}) */
  systemPromptTemplate?: string;
}

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  name: string;
  description: string;
  /** Target language placeholder — replaced at runtime */
  targetLanguage?: string;
  phases: AssessmentPhase[];
  /** Total max points across all phases */
  totalMaxPoints: number;
  /** Scoring dimensions used in this assessment */
  scoringDimensions?: ScoringDimension[];
  /** Estimated duration in minutes */
  estimatedMinutes?: number;
  /** Time limit in seconds (used by periodic encounters) */
  timeLimitSeconds?: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Runtime Results
// ───────────────────────────────────────────────────────────────────────────

export interface RecordingReference {
  /** Storage key or URL for the recording */
  storageKey?: string;
  /** URL for the recording */
  url?: string;
  /** MIME type (e.g., 'audio/webm', 'text/plain') */
  mimeType?: string;
  /** Duration in seconds (for audio/video) */
  durationSeconds?: number;
  /** Phase this recording belongs to */
  phaseId: string;
  /** Task this recording belongs to (optional) */
  taskId?: string;
  /** Timestamp when recorded */
  recordedAt?: string;
  /** Transcript of the recording */
  transcript?: string;
}

export interface TranscriptEntry {
  role: 'player' | 'npc' | 'system';
  text: string;
  timestamp: number;
  phaseId: string;
  taskId?: string;
}

export interface AutomatedMetrics {
  /** Words per minute */
  wpm?: number;
  wordsPerMinute?: number;
  /** Type-token ratio (vocabulary diversity) */
  ttr?: number;
  typeTokenRatio?: number;
  /** Mean length of utterance in words */
  mlu?: number;
  meanLengthUtterance?: number;
  /** Average response latency in milliseconds */
  avgLatencyMs?: number;
  responseLatencyMs?: number;
  /** Number of self-repairs/corrections */
  repairs?: number;
  selfRepairs?: number;
  /** Number of code-switching instances (falling back to L1) */
  codeSwitchingCount?: number;
  codeSwitchCount?: number;
}

export interface TaskResult {
  taskId: string;
  /** Points earned */
  score: number;
  /** Max possible points */
  maxPoints?: number;
  /** Max score (alias for maxPoints) */
  maxScore?: number;
  /** Per-dimension scores */
  dimensionScores?: Record<string, number>;
  /** Player's raw response (text input, selection, etc.) */
  playerResponse?: string;
  /** Scoring rationale (from LLM or auto-scorer) */
  rationale?: string;
}

export interface PhaseResult {
  phaseId: string;
  /** Total score for this phase */
  score?: number;
  totalScore?: number;
  /** Max possible score for this phase */
  maxPoints?: number;
  maxScore?: number;
  /** Individual task results */
  taskResults: TaskResult[];
  /** Per-dimension scores (dimension id -> score) */
  dimensionScores?: Record<string, number>;
  /** Automated metrics collected during this phase */
  automatedMetrics?: AutomatedMetrics;
  /** Full transcript of the phase interaction (string or structured entries) */
  transcript?: string | TranscriptEntry[];
  /** Recording references for this phase */
  recordings?: RecordingReference[];
  /** When this phase started */
  startedAt?: string;
  /** When this phase completed */
  completedAt?: string | number;
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

export interface AssessmentSession {
  id: string;
  playerId: string;
  worldId: string;
  /** Which assessment definition was used */
  assessmentDefinitionId?: string;
  definitionId?: string;
  assessmentType: AssessmentType;
  /** Target language being assessed */
  targetLanguage?: string;
  status?: AssessmentStatus;
  /** Results per phase */
  phaseResults: PhaseResult[];
  /** Total score across all phases */
  totalScore?: number;
  /** Total max possible score */
  totalMaxPoints: number;
  /** Overall CEFR level determined from scores */
  cefrLevel?: CEFRLevel | string;
  /** Aggregate dimension scores (dimension id -> score) */
  dimensionScores?: Record<string, number>;
  /** Aggregate automated metrics */
  automatedMetrics?: AutomatedMetrics;
  /** All recordings for this session */
  recordings?: RecordingReference[];
  /** Full conversation transcript */
  transcript?: Array<{ role: 'player' | 'npc'; text: string; timestamp: number }>;
  /** When the session was created */
  createdAt?: string;
  /** When the session started (first phase began) */
  startedAt?: string | number;
  /** When the session completed */
  completedAt?: string | number;
}
