/**
 * NPC Exam Engine
 *
 * Server-side orchestration for NPC-administered exams. Currently supports
 * object recognition exams in business contexts. Uses the existing assessment
 * infrastructure (AssessmentDefinition, scoring endpoints) under the hood.
 */

import type { CEFRLevel } from '../../shared/assessment/assessment-types';
import type {
  NpcExam,
  NpcExamResult,
  NpcExamTrigger,
  ObjectRecognitionResult,
} from '../../shared/assessment/npc-exam-types';
import {
  buildObjectRecognitionExam,
  scoreObjectRecognitionExam,
} from '../../shared/assessment/object-recognition-exam';

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
): NpcExamResult {
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
