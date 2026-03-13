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
  minScore: number;
  maxScore: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Task & Phase Definitions (static encounter structure)
// ───────────────────────────────────────────────────────────────────────────

export interface AssessmentTask {
  id: string;
  type: TaskType;
  prompt: string;
  maxPoints: number;
  scoringMethod: ScoringMethod;
  timeLimitSeconds?: number;
  options?: string[];
  expectedAnswer?: string;
}

export interface AssessmentPhase {
  id: string;
  type: PhaseType;
  name: string;
  description: string;
  tasks: AssessmentTask[];
  maxPoints: number;
  timeLimitSeconds?: number;
  scoringDimensions?: string[];
}

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  name: string;
  description: string;
  targetLanguage: string;
  phases: AssessmentPhase[];
  totalMaxPoints: number;
  scoringDimensions: ScoringDimension[];
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

export interface TranscriptEntry {
  role: 'player' | 'npc' | 'system';
  text: string;
  timestamp: number;
  phaseId: string;
  taskId?: string;
}

export interface AutomatedMetrics {
  wpm?: number;
  ttr?: number;
  mlu?: number;
  avgLatencyMs?: number;
  repairs?: number;
  codeSwitchingCount?: number;
}

export interface TaskResult {
  taskId: string;
  score: number;
  maxPoints: number;
  playerResponse?: string;
  rationale?: string;
}

export interface PhaseResult {
  phaseId: string;
  score: number;
  maxPoints: number;
  taskResults: TaskResult[];
  dimensionScores?: Record<string, number>;
  automatedMetrics?: AutomatedMetrics;
  transcript?: TranscriptEntry[];
  recordings?: RecordingReference[];
  startedAt?: string;
  completedAt?: string;
}

export interface AssessmentSession {
  id: string;
  playerId: string;
  worldId: string;
  assessmentDefinitionId: string;
  assessmentType: AssessmentType;
  targetLanguage: string;
  status: AssessmentStatus;
  phaseResults: PhaseResult[];
  totalScore?: number;
  totalMaxPoints: number;
  cefrLevel?: CEFRLevel;
  dimensionScores?: Record<string, number>;
  automatedMetrics?: AutomatedMetrics;
  recordings?: RecordingReference[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
