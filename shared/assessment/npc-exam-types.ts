/**
 * NPC Exam/Quiz Type Definitions
 *
 * Defines types for NPC-initiated language quizzes that integrate with the
 * assessment engine. NPCs can trigger mini-assessments during regular gameplay,
 * and results feed into the player's proficiency tracking via assessment sessions.
 */

import type {
  AssessmentDefinition,
  AssessmentPhase,
  CEFRLevel,
  PhaseResult,
  ScoringDimension,
  TaskResult,
} from './assessment-types';

// ───────────────────────────────────────────────────────────────────────────
// NPC Exam Categories
// ───────────────────────────────────────────────────────────────────────────

export type NpcExamCategory =
  | 'vocabulary_quiz'
  | 'listening_quiz'
  | 'translation_quiz'
  | 'conversation_quiz'
  | 'pronunciation_quiz'
  | 'grammar_quiz';

export type NpcExamDifficulty = 'beginner' | 'intermediate' | 'advanced';

// ───────────────────────────────────────────────────────────────────────────
// Quiz Question Types
// ───────────────────────────────────────────────────────────────────────────

export interface NpcExamQuestion {
  id: string;
  /** The question prompt displayed to the player */
  prompt: string;
  /** Expected answer (for automated scoring) */
  expectedAnswer?: string;
  /** Acceptable alternative answers */
  acceptableAnswers?: string[];
  /** Max points for this question */
  maxPoints: number;
  /** Hint text (optional, shown after first wrong attempt) */
  hint?: string;
}

export interface NpcExamConfig {
  /** Unique identifier for this exam instance */
  examId: string;
  /** Which NPC is administering the exam */
  npcId: string;
  npcName: string;
  /** Category of quiz */
  category: NpcExamCategory;
  /** Difficulty level */
  difficulty: NpcExamDifficulty;
  /** Target language being tested */
  targetLanguage: string;
  /** Questions to ask */
  questions: NpcExamQuestion[];
  /** Time limit in seconds (0 = no limit) */
  timeLimitSeconds: number;
  /** Total max points across all questions */
  totalMaxPoints: number;
  /** Topics covered */
  topics: string[];
}

// ───────────────────────────────────────────────────────────────────────────
// NPC Exam Result
// ───────────────────────────────────────────────────────────────────────────

export interface NpcExamQuestionResult {
  questionId: string;
  playerAnswer: string;
  score: number;
  maxPoints: number;
  correct: boolean;
  rationale?: string;
}

export interface NpcExamResult {
  examId: string;
  npcId: string;
  npcName: string;
  category: NpcExamCategory;
  difficulty: NpcExamDifficulty;
  targetLanguage: string;
  questionResults: NpcExamQuestionResult[];
  totalScore: number;
  totalMaxPoints: number;
  /** Percentage score 0-100 */
  percentage: number;
  /** CEFR level derived from score */
  cefrLevel: CEFRLevel;
  /** Duration in milliseconds */
  durationMs: number;
  completedAt: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Conversion helpers: NPC exam ↔ Assessment engine
// ───────────────────────────────────────────────────────────────────────────

/** Scoring dimensions used for NPC exams */
export const NPC_EXAM_SCORING_DIMENSIONS: ScoringDimension[] = [
  { id: 'accuracy', name: 'Accuracy', description: 'Correctness of answers', maxScore: 5 },
  { id: 'vocabulary', name: 'Vocabulary', description: 'Word knowledge demonstrated', maxScore: 5 },
  { id: 'comprehension', name: 'Comprehension', description: 'Understanding of prompts', maxScore: 5 },
];

/**
 * Convert an NpcExamConfig into an AssessmentDefinition so it can be
 * processed by the existing assessment engine.
 */
export function npcExamToAssessmentDefinition(config: NpcExamConfig): AssessmentDefinition {
  const phaseType = categoryToPhaseType(config.category);

  const phase: AssessmentPhase = {
    id: `npc_exam_${config.examId}`,
    type: phaseType,
    name: `${config.npcName}'s ${formatCategory(config.category)}`,
    description: `A ${config.difficulty} ${formatCategory(config.category)} administered by ${config.npcName}`,
    tasks: config.questions.map(q => ({
      id: q.id,
      name: q.prompt.substring(0, 50),
      prompt: q.prompt,
      maxPoints: q.maxPoints,
      scoringMethod: 'automated' as const,
    })),
    maxPoints: config.totalMaxPoints,
    timeLimitSeconds: config.timeLimitSeconds || undefined,
    scoringDimensions: NPC_EXAM_SCORING_DIMENSIONS,
  };

  return {
    id: `npc_exam_${config.examId}`,
    type: 'npc_exam',
    name: `${config.npcName}'s ${formatCategory(config.category)}`,
    description: `${config.difficulty} ${formatCategory(config.category)} by ${config.npcName}`,
    targetLanguage: config.targetLanguage,
    phases: [phase],
    totalMaxPoints: config.totalMaxPoints,
    scoringDimensions: NPC_EXAM_SCORING_DIMENSIONS,
    estimatedMinutes: Math.ceil((config.timeLimitSeconds || 300) / 60),
  };
}

/**
 * Convert an NpcExamResult into a PhaseResult for storage in an assessment session.
 */
export function npcExamResultToPhaseResult(result: NpcExamResult): PhaseResult {
  const taskResults: TaskResult[] = result.questionResults.map(qr => ({
    taskId: qr.questionId,
    score: qr.score,
    maxPoints: qr.maxPoints,
    playerResponse: qr.playerAnswer,
    rationale: qr.rationale,
  }));

  const percentage = result.totalMaxPoints > 0
    ? (result.totalScore / result.totalMaxPoints) * 100
    : 0;

  // Derive dimension scores from percentage
  const dimScore = Math.max(1, Math.min(5, Math.round((percentage / 100) * 5 * 10) / 10));

  return {
    phaseId: `npc_exam_${result.examId}`,
    score: result.totalScore,
    maxPoints: result.totalMaxPoints,
    taskResults,
    dimensionScores: {
      accuracy: dimScore,
      vocabulary: dimScore,
      comprehension: dimScore,
    },
    startedAt: new Date(result.completedAt - result.durationMs).toISOString(),
    completedAt: new Date(result.completedAt).toISOString(),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Utility functions
// ───────────────────────────────────────────────────────────────────────────

function categoryToPhaseType(category: NpcExamCategory): 'reading' | 'writing' | 'listening' | 'conversation' {
  switch (category) {
    case 'listening_quiz': return 'listening';
    case 'translation_quiz':
    case 'grammar_quiz': return 'writing';
    case 'conversation_quiz':
    case 'pronunciation_quiz': return 'conversation';
    case 'vocabulary_quiz':
    default: return 'reading';
  }
}

function formatCategory(category: NpcExamCategory): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Score a single question by comparing the player's answer to expected answers.
 * Uses case-insensitive matching with whitespace normalization.
 */
export function scoreNpcExamQuestion(
  question: NpcExamQuestion,
  playerAnswer: string,
): NpcExamQuestionResult {
  const normalized = playerAnswer.trim().toLowerCase();
  const expected = question.expectedAnswer?.trim().toLowerCase() ?? '';
  const alternatives = (question.acceptableAnswers ?? []).map(a => a.trim().toLowerCase());

  const allAcceptable = [expected, ...alternatives].filter(a => a.length > 0);
  const correct = allAcceptable.some(a => normalized === a);

  // Partial credit: if the answer contains the expected answer or vice versa
  let score = 0;
  if (correct) {
    score = question.maxPoints;
  } else if (allAcceptable.some(a => normalized.includes(a) || a.includes(normalized)) && normalized.length > 0) {
    score = Math.ceil(question.maxPoints * 0.5);
  }

  return {
    questionId: question.id,
    playerAnswer,
    score,
    maxPoints: question.maxPoints,
    correct,
    rationale: correct
      ? 'Correct answer'
      : score > 0
        ? 'Partial credit — close match'
        : `Expected: ${question.expectedAnswer ?? 'N/A'}`,
  };
}

/**
 * Score an entire NPC exam by evaluating all questions.
 */
export function scoreNpcExam(
  config: NpcExamConfig,
  answers: Record<string, string>,
  startedAt: number,
): NpcExamResult {
  const now = Date.now();
  const questionResults = config.questions.map(q => {
    const answer = answers[q.id] ?? '';
    return scoreNpcExamQuestion(q, answer);
  });

  const totalScore = questionResults.reduce((sum, qr) => sum + qr.score, 0);
  const percentage = config.totalMaxPoints > 0
    ? Math.round((totalScore / config.totalMaxPoints) * 100)
    : 0;

  const cefrLevel: CEFRLevel =
    percentage >= 75 ? 'B2' :
    percentage >= 50 ? 'B1' :
    percentage >= 25 ? 'A2' : 'A1';

  return {
    examId: config.examId,
    npcId: config.npcId,
    npcName: config.npcName,
    category: config.category,
    difficulty: config.difficulty,
    targetLanguage: config.targetLanguage,
    questionResults,
    totalScore,
    totalMaxPoints: config.totalMaxPoints,
    percentage,
    cefrLevel,
    durationMs: now - startedAt,
    completedAt: now,
  };
}
