/**
 * NPC Exam Engine
 *
 * Bridges NPC-initiated quizzes with the assessment engine. When an NPC
 * triggers a quiz, this engine:
 *   1. Presents questions to the player via callbacks
 *   2. Scores answers using shared scoring logic
 *   3. Emits results through the GameEventBus
 *   4. Persists results as assessment sessions via the server API
 *
 * This allows NPC quizzes during regular gameplay to feed into the
 * player's proficiency tracking alongside formal assessments.
 */

import type { GameEventBus } from './GameEventBus';
import type {
  NpcExamConfig,
  NpcExamResult,
  NpcExamQuestionResult,
} from '../../../../shared/assessment/npc-exam-types';
import {
  scoreNpcExamQuestion,
  scorePronunciationExamQuestion,
  npcExamResultToPhaseResult,
} from '../../../../shared/assessment/npc-exam-types';
import { mapScoreToCEFR } from '../../../../shared/assessment/cefr-mapping';

// ── Types ────────────────────────────────────────────────────────────────────

export interface NpcExamCallbacks {
  /** Called when a question should be displayed to the player */
  onQuestion?: (question: {
    questionId: string;
    questionIndex: number;
    totalQuestions: number;
    prompt: string;
    hint?: string;
    timeRemainingSeconds: number;
    onAnswer: (answer: string) => void;
  }) => void;
  /** Called after each question is answered */
  onQuestionResult?: (result: NpcExamQuestionResult, questionIndex: number) => void;
  /** Called when the exam is complete */
  onComplete?: (result: NpcExamResult) => void;
  /** Called when the exam is aborted */
  onAborted?: () => void;
}

// ── Engine ───────────────────────────────────────────────────────────────────

export class NpcExamEngine {
  private eventBus: GameEventBus | null;
  private authToken: string;
  private _aborted = false;
  private _answerResolver: ((answer: string) => void) | null = null;

  constructor(config: { eventBus?: GameEventBus; authToken: string }) {
    this.eventBus = config.eventBus ?? null;
    this.authToken = config.authToken;
  }

  /**
   * Run an NPC exam from start to finish.
   * Returns the exam result, or null if aborted.
   */
  async runExam(
    examConfig: NpcExamConfig,
    callbacks: NpcExamCallbacks,
  ): Promise<NpcExamResult | null> {
    this._aborted = false;
    const startedAt = Date.now();

    // Emit exam started event
    this.eventBus?.emit({
      type: 'npc_exam_started',
      examId: examConfig.examId,
      npcId: examConfig.npcId,
      npcName: examConfig.npcName,
      category: examConfig.category,
      questionCount: examConfig.questions.length,
    });

    const questionResults: NpcExamQuestionResult[] = [];
    const deadline = examConfig.timeLimitSeconds > 0
      ? startedAt + examConfig.timeLimitSeconds * 1000
      : Infinity;

    for (let i = 0; i < examConfig.questions.length; i++) {
      if (this._aborted) {
        callbacks.onAborted?.();
        return null;
      }

      const question = examConfig.questions[i];
      const timeRemaining = deadline === Infinity
        ? 0
        : Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

      if (deadline !== Infinity && Date.now() >= deadline) {
        // Time's up — score remaining questions as unanswered
        for (let j = i; j < examConfig.questions.length; j++) {
          questionResults.push({
            questionId: examConfig.questions[j].id,
            playerAnswer: '',
            score: 0,
            maxPoints: examConfig.questions[j].maxPoints,
            correct: false,
            rationale: 'Time expired',
          });
        }
        break;
      }

      // Present question and wait for answer
      const answer = await this._presentQuestion(question, i, examConfig.questions.length, timeRemaining, callbacks);

      if (this._aborted) {
        callbacks.onAborted?.();
        return null;
      }

      // Score the answer — use pronunciation scoring for pronunciation quizzes
      const usePronunciation = examConfig.category === 'pronunciation_quiz' || question.scoringType === 'pronunciation';
      const questionResult = usePronunciation
        ? scorePronunciationExamQuestion(question, answer)
        : scoreNpcExamQuestion(question, answer);
      questionResults.push(questionResult);

      // Emit per-question event
      this.eventBus?.emit({
        type: 'npc_exam_question_answered',
        examId: examConfig.examId,
        questionId: question.id,
        correct: questionResult.correct,
        score: questionResult.score,
        maxPoints: questionResult.maxPoints,
      });

      callbacks.onQuestionResult?.(questionResult, i);
    }

    if (this._aborted) {
      callbacks.onAborted?.();
      return null;
    }

    // Build final result
    const totalScore = questionResults.reduce((sum, qr) => sum + qr.score, 0);
    const cefrResult = mapScoreToCEFR(totalScore, examConfig.totalMaxPoints);

    const result: NpcExamResult = {
      examId: examConfig.examId,
      npcId: examConfig.npcId,
      npcName: examConfig.npcName,
      category: examConfig.category,
      difficulty: examConfig.difficulty,
      targetLanguage: examConfig.targetLanguage,
      questionResults,
      totalScore,
      totalMaxPoints: examConfig.totalMaxPoints,
      percentage: cefrResult.score,
      cefrLevel: cefrResult.level,
      durationMs: Date.now() - startedAt,
      completedAt: Date.now(),
    };

    // Emit completion event
    this.eventBus?.emit({
      type: 'npc_exam_completed',
      examId: examConfig.examId,
      npcId: examConfig.npcId,
      totalScore: result.totalScore,
      totalMaxPoints: result.totalMaxPoints,
      cefrLevel: result.cefrLevel,
      category: examConfig.category,
    });

    callbacks.onComplete?.(result);

    // Persist to server as an assessment session (fire and forget)
    this._persistResult(examConfig, result).catch(err => {
      console.warn('[NpcExamEngine] Failed to persist exam result:', err);
    });

    return result;
  }

  /**
   * Abort the current exam.
   */
  abort(): void {
    this._aborted = true;
    if (this._answerResolver) {
      this._answerResolver('');
      this._answerResolver = null;
    }
  }

  dispose(): void {
    this.abort();
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private _presentQuestion(
    question: { id: string; prompt: string; hint?: string; maxPoints: number },
    index: number,
    total: number,
    timeRemaining: number,
    callbacks: NpcExamCallbacks,
  ): Promise<string> {
    return new Promise<string>((resolve) => {
      this._answerResolver = resolve;

      if (callbacks.onQuestion) {
        callbacks.onQuestion({
          questionId: question.id,
          questionIndex: index,
          totalQuestions: total,
          prompt: question.prompt,
          hint: question.hint,
          timeRemainingSeconds: timeRemaining,
          onAnswer: (answer: string) => {
            this._answerResolver = null;
            resolve(answer);
          },
        });
      } else {
        // No UI handler — auto-skip with empty answer
        console.warn('[NpcExamEngine] No onQuestion callback — skipping question');
        this._answerResolver = null;
        resolve('');
      }
    });
  }

  /**
   * Persist the NPC exam result as an assessment session via the server API.
   * This integrates NPC quiz results into the player's assessment history.
   */
  private async _persistResult(
    config: NpcExamConfig,
    result: NpcExamResult,
  ): Promise<void> {
    const phaseResult = npcExamResultToPhaseResult(result);

    // Create assessment session
    const createRes = await fetch('/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      },
      body: JSON.stringify({
        playerId: 'current', // Server resolves from auth
        worldId: 'current',
        assessmentType: 'npc_exam',
        assessmentDefinitionId: `npc_exam_${config.category}`,
        targetLanguage: config.targetLanguage,
        totalMaxPoints: config.totalMaxPoints,
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create assessment session: ${createRes.status}`);
    }

    const session = await createRes.json();

    // Update with phase result
    await fetch(`/api/assessments/${session.id}/phases/npc_exam_${result.examId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      },
      body: JSON.stringify(phaseResult),
    });

    // Complete the session
    await fetch(`/api/assessments/${session.id}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      },
      body: JSON.stringify({
        totalScore: result.totalScore,
        maxScore: result.totalMaxPoints,
        cefrLevel: result.cefrLevel,
      }),
    });
  }
}
