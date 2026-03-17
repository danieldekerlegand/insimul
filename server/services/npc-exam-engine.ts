/**
 * NPC Exam Engine
 *
 * Server-side orchestration for NPC-administered exams. Supports:
 * - Object recognition exams in business contexts
 * - Listening comprehension exams (NPC speaks, player answers questions)
 *
 * Uses the existing assessment infrastructure (AssessmentDefinition, scoring
 * endpoints) under the hood.
 */

import type { ContentTemplate, CEFRLevel } from '../../shared/assessment/assessment-types';
import type {
  NpcExam,
  NpcExamResult as NpcObjectExamResult,
  NpcExamTrigger,
  ObjectRecognitionResult,
} from '../../shared/assessment/npc-exam-types';
import {
  buildObjectRecognitionExam,
  scoreObjectRecognitionExam,
} from '../../shared/assessment/object-recognition-exam';

// ── Object Recognition Exam ─────────────────────────────────────────────────

export interface CreateObjectRecognitionExamParams {
  npcId: string;
  npcName: string;
  businessType?: string;
  businessName?: string;
  cefrLevel: CEFRLevel;
  targetLanguage: string;
  trigger?: NpcExamTrigger;
}

export interface ScoreObjectRecognitionExamParams {
  exam: NpcExam;
  /** Player answers in order matching the exam tasks */
  playerAnswers: string[];
  /** Expected answers in the target language (translations) */
  expectedAnswers: string[];
  /** The objects that were selected for this exam */
  selectedObjectKeys: string[];
}

/**
 * Create an object recognition NPC exam for a player inside a business.
 */
export function createObjectRecognitionExam(
  params: CreateObjectRecognitionExamParams,
): { exam: NpcExam; selectedObjectKeys: string[] } {
  const {
    npcId,
    npcName,
    businessType,
    businessName,
    cefrLevel,
    targetLanguage,
    trigger = 'npc_initiated',
  } = params;

  const { definition, selectedObjects } = buildObjectRecognitionExam(
    businessType,
    cefrLevel,
    targetLanguage,
    npcName,
  );

  const exam: NpcExam = {
    id: definition.id,
    type: 'object_recognition',
    npcId,
    npcName,
    businessType,
    businessName,
    definition,
    trigger,
    cefrLevel,
    targetLanguage,
  };

  return {
    exam,
    selectedObjectKeys: selectedObjects.map((o) => o.key),
  };
}

/**
 * Score a completed object recognition exam.
 * Returns per-object results and an NpcExamResult wrapping the assessment result.
 */
export function scoreNpcObjectRecognitionExam(
  params: ScoreObjectRecognitionExamParams,
): NpcObjectExamResult {
  const { exam, playerAnswers, expectedAnswers, selectedObjectKeys } = params;

  // Reconstruct the selected objects from their keys
  const { selectedObjects } = buildObjectRecognitionExam(
    exam.businessType,
    exam.cefrLevel,
    exam.targetLanguage,
    exam.npcName,
  );

  // Filter to just the objects that were in this exam
  const examObjects = selectedObjectKeys
    .map((key) => selectedObjects.find((o) => o.key === key))
    .filter((o): o is NonNullable<typeof o> => o != null);

  // Fall back to using selectedObjects directly if keys don't match
  // (can happen if vocabulary was shuffled differently)
  const objectsToScore = examObjects.length === playerAnswers.length
    ? examObjects
    : selectedObjects.slice(0, playerAnswers.length);

  const { results, totalScore, totalMaxScore } = scoreObjectRecognitionExam(
    objectsToScore,
    playerAnswers,
    expectedAnswers,
    exam.cefrLevel,
  );

  return {
    examId: exam.id,
    examType: 'object_recognition',
    npcId: exam.npcId,
    objectResults: results,
    assessmentResult: {
      sessionId: exam.id,
      assessmentType: 'periodic',
      totalScore,
      maxScore: totalMaxScore,
      cefrLevel: exam.cefrLevel,
      phaseResults: [
        {
          phaseId: 'object_recognition_phase',
          score: totalScore,
          maxPoints: totalMaxScore,
          taskResults: results.map((r, i) => ({
            taskId: `obj_recog_${i}`,
            score: r.score,
            maxPoints: r.maxScore,
            playerResponse: r.playerAnswer,
            rationale: formatResultRationale(r),
          })),
        },
      ],
      completedAt: Date.now(),
    },
  };
}

function formatResultRationale(result: ObjectRecognitionResult): string {
  switch (result.matchType) {
    case 'exact':
      return `Correct! "${result.playerAnswer}" matches "${result.expectedAnswer}".`;
    case 'close':
      return (
        `Close! "${result.playerAnswer}" is similar to "${result.expectedAnswer}" ` +
        `(${result.distance} character${result.distance === 1 ? '' : 's'} off).`
      );
    case 'wrong':
      return `The correct answer is "${result.expectedAnswer}".`;
  }
}

// ── Listening Comprehension Exam ────────────────────────────────────────────

export interface NpcExamContext {
  /** Business type the NPC works in */
  businessType: string;
  /** NPC's role description */
  npcRole: string;
  /** Content template for the listening passage */
  contentTemplate: ContentTemplate;
}

/**
 * Business-contextualized listening exam templates keyed by business type.
 * Each template creates a scenario where the NPC speaks naturally about
 * their trade, and the player must comprehend what was said.
 */
export const LISTENING_EXAM_CONTEXTS: Record<string, NpcExamContext> = {
  bakery: {
    businessType: 'bakery',
    npcRole: 'a friendly baker',
    contentTemplate: {
      topic: 'A baker describing today\'s fresh bread varieties, their ingredients, prices, and a special pastry recommendation for a visitor.',
      difficulty: 'beginner',
      lengthSentences: 4,
      questionCount: 3,
    },
  },
  restaurant: {
    businessType: 'restaurant',
    npcRole: 'a waiter',
    contentTemplate: {
      topic: 'A waiter reciting the daily specials, describing each dish\'s main ingredients, portion sizes, and recommending a popular local dish.',
      difficulty: 'beginner',
      lengthSentences: 5,
      questionCount: 3,
    },
  },
  blacksmith: {
    businessType: 'blacksmith',
    npcRole: 'a blacksmith',
    contentTemplate: {
      topic: 'A blacksmith explaining the types of tools and weapons available, the materials used, current prices, and how long a custom order takes.',
      difficulty: 'intermediate',
      lengthSentences: 5,
      questionCount: 3,
    },
  },
  market: {
    businessType: 'market',
    npcRole: 'a market vendor',
    contentTemplate: {
      topic: 'A market vendor describing seasonal fruits and vegetables, their prices per kilo, where they were grown, and a recipe suggestion.',
      difficulty: 'beginner',
      lengthSentences: 4,
      questionCount: 3,
    },
  },
  inn: {
    businessType: 'inn',
    npcRole: 'an innkeeper',
    contentTemplate: {
      topic: 'An innkeeper describing available rooms, nightly rates, meal times, house rules, and nearby points of interest for travelers.',
      difficulty: 'intermediate',
      lengthSentences: 5,
      questionCount: 3,
    },
  },
  guide: {
    businessType: 'guide',
    npcRole: 'a local guide',
    contentTemplate: {
      topic: 'A local guide giving directions to three landmarks, describing the walking time, what to see along the way, and a warning about a closed road.',
      difficulty: 'intermediate',
      lengthSentences: 5,
      questionCount: 3,
    },
  },
};

// ── CEFR-adaptive parameters ────────────────────────────────────────────────

export interface CefrAdaptation {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lengthSentences: number;
  ttsSpeed: number;
  maxReplays: number;
}

export function getCefrAdaptation(cefrLevel: CEFRLevel): CefrAdaptation {
  switch (cefrLevel) {
    case 'A1':
      return { difficulty: 'beginner', lengthSentences: 2, ttsSpeed: 0.7, maxReplays: 2 };
    case 'A2':
      return { difficulty: 'beginner', lengthSentences: 4, ttsSpeed: 0.85, maxReplays: 1 };
    case 'B1':
      return { difficulty: 'intermediate', lengthSentences: 5, ttsSpeed: 1.0, maxReplays: 1 };
    case 'B2':
      return { difficulty: 'advanced', lengthSentences: 6, ttsSpeed: 1.0, maxReplays: 0 };
  }
}

// ── Exam Definition ─────────────────────────────────────────────────────────

export interface NpcListeningExam {
  id: string;
  npcId: string;
  npcName: string;
  businessType: string;
  targetLanguage: string;
  cefrLevel: CEFRLevel;
  maxPoints: number;
  maxReplays: number;
  contentTemplate: ContentTemplate;
}

export interface NpcListeningExamResult {
  examId: string;
  npcId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  questionScores?: Array<{ questionId: string; score: number; maxScore: number; rationale: string }>;
  overallRationale: string;
}

// ── Engine ───────────────────────────────────────────────────────────────────

const PASS_THRESHOLD = 0.6;

export class NpcExamEngine {
  /**
   * Create a listening comprehension exam definition for an NPC.
   * Adapts difficulty and speed to the player's current CEFR level.
   */
  createListeningExam(config: {
    npcId: string;
    npcName: string;
    businessType: string;
    targetLanguage: string;
    cefrLevel: CEFRLevel;
    cityName?: string;
  }): NpcListeningExam {
    const context = LISTENING_EXAM_CONTEXTS[config.businessType] ?? LISTENING_EXAM_CONTEXTS.guide;
    const adaptation = getCefrAdaptation(config.cefrLevel);

    const resolvedTopic = context.contentTemplate.topic
      .replace(/\{\{cityName\}\}/g, config.cityName ?? 'the city');

    return {
      id: `npc_exam_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      npcId: config.npcId,
      npcName: config.npcName,
      businessType: config.businessType,
      targetLanguage: config.targetLanguage,
      cefrLevel: config.cefrLevel,
      maxPoints: 13,
      maxReplays: adaptation.maxReplays,
      contentTemplate: {
        topic: resolvedTopic,
        difficulty: adaptation.difficulty,
        lengthSentences: adaptation.lengthSentences,
        questionCount: context.contentTemplate.questionCount ?? 3,
      },
    };
  }

  /**
   * Evaluate exam results and determine pass/fail.
   */
  evaluateResult(
    exam: NpcListeningExam,
    scoringResult: {
      totalScore: number;
      maxScore: number;
      questionScores?: Array<{ questionId: string; score: number; maxScore: number; rationale: string }>;
      overallRationale: string;
    },
  ): NpcListeningExamResult {
    const score = Math.min(exam.maxPoints, scoringResult.totalScore);
    const percentage = score / exam.maxPoints;

    return {
      examId: exam.id,
      npcId: exam.npcId,
      totalScore: score,
      maxScore: exam.maxPoints,
      percentage: Math.round(percentage * 100),
      passed: percentage >= PASS_THRESHOLD,
      questionScores: scoringResult.questionScores,
      overallRationale: scoringResult.overallRationale,
    };
  }

  /**
   * Get the TTS speaking rate for a given CEFR level.
   */
  getTtsSpeed(cefrLevel: CEFRLevel): number {
    return getCefrAdaptation(cefrLevel).ttsSpeed;
  }

  /**
   * Get a business context by type, or the default (guide).
   */
  getContext(businessType: string): NpcExamContext {
    return LISTENING_EXAM_CONTEXTS[businessType] ?? LISTENING_EXAM_CONTEXTS.guide;
  }

  /**
   * List available business context types.
   */
  getAvailableContexts(): string[] {
    return Object.keys(LISTENING_EXAM_CONTEXTS);
  }
}
