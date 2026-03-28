/**
 * NPC Exams Module — Generic Types
 *
 * Abstracts NPC-administered language exams into a generic quiz system.
 * NPCs can quiz on anything:
 *   - Language: vocabulary recognition, listening comprehension
 *   - RPG: lore knowledge, faction allegiance
 *   - Survival: species identification, crafting knowledge
 *   - Strategy: tactical scenarios, historical knowledge
 */

// ---------------------------------------------------------------------------
// Exam types
// ---------------------------------------------------------------------------

export type ExamType =
  | 'identification'       // identify objects, species, words
  | 'comprehension'        // understand spoken/written content
  | 'application'          // apply knowledge in a scenario
  | 'recall'               // recall facts
  | 'custom';

// ---------------------------------------------------------------------------
// Exam definition
// ---------------------------------------------------------------------------

export interface ExamQuestion {
  id: string;
  type: ExamType;
  prompt: string;
  /** Expected answer(s) — for auto-grading. */
  expectedAnswers?: string[];
  /** Whether this question should be LLM-graded. */
  llmGraded: boolean;
  /** Difficulty tier (mapped from ProficiencyModule). */
  difficultyTier?: string;
  /** Genre-specific question data. */
  data: Record<string, unknown>;
}

export interface ExamDefinition {
  id: string;
  name: string;
  npcId: string;
  /** Exam type mix. */
  questionTypes: ExamType[];
  /** Number of questions. */
  questionCount: number;
  /** Proficiency tier this exam targets. */
  targetTier?: string;
  /** Whether the exam is LLM-generated or predefined. */
  generated: boolean;
  /** Genre context for LLM generation prompt. */
  genreContext?: string;
}

// ---------------------------------------------------------------------------
// Exam session
// ---------------------------------------------------------------------------

export interface ExamSession {
  id: string;
  playerId: string;
  worldId: string;
  examDefinitionId: string;
  npcId: string;
  questions: ExamQuestion[];
  answers: ExamAnswer[];
  score?: number;          // 0-100
  passed?: boolean;
  startedAt: number;
  completedAt?: number;
}

export interface ExamAnswer {
  questionId: string;
  playerAnswer: string;
  correct: boolean;
  score: number;          // 0-100
  feedback?: string;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

export interface NPCExamConfig {
  /** Available exam types in this genre. */
  examTypes: ExamType[];
  /** Pass threshold (0-100). */
  passThreshold: number;
  /** Whether exams adapt to proficiency tier. */
  adaptToTier: boolean;
}

export const DEFAULT_CONFIG: NPCExamConfig = {
  examTypes: ['identification', 'comprehension', 'recall'],
  passThreshold: 70,
  adaptToTier: true,
};
