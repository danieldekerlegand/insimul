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

import type { GameEventBus } from '../logic/GameEventBus';
import type {
  NpcExamConfig,
  NpcExamQuestion,
  NpcExamResult,
  NpcExamQuestionResult,
} from '../../assessment/npc-exam-types';
import {
  scoreNpcExamQuestion,
  scorePronunciationQuestion,
  scorePronunciationExamQuestion,
  npcExamResultToPhaseResult,
} from '../../assessment/npc-exam-types';
import { mapScoreToCEFR } from '../../assessment/cefr-mapping';
import type { AudioPronunciationResult } from '../../language/pronunciation-scoring';

// ── Types ────────────────────────────────────────────────────────────────────

/** Audio answer data for pronunciation questions */
export interface AudioAnswer {
  /** Raw audio as a Blob or base64 string */
  audio: Blob | string;
  /** MIME type of the audio (default: 'audio/wav') */
  mimeType?: string;
}

export interface NpcExamCallbacks {
  /** Called when a question should be displayed to the player */
  onQuestion?: (question: {
    questionId: string;
    questionIndex: number;
    totalQuestions: number;
    prompt: string;
    hint?: string;
    timeRemainingSeconds: number;
    /** Whether this question expects an audio answer */
    isPronunciation: boolean;
    /** Submit a text answer */
    onAnswer: (answer: string) => void;
    /** Submit an audio answer (for pronunciation questions) */
    onAudioAnswer: (audio: AudioAnswer) => void;
  }) => void;
  /** Called after each question is answered */
  onQuestionResult?: (result: NpcExamQuestionResult, questionIndex: number) => void;
  /** Called when the exam is complete */
  onComplete?: (result: NpcExamResult) => void;
  /** Called when the exam is aborted */
  onAborted?: () => void;
}

// ── Engine ───────────────────────────────────────────────────────────────────

/** Internal answer type — text or audio */
type ExamAnswer = { type: 'text'; text: string } | { type: 'audio'; audio: AudioAnswer };

export class NpcExamEngine {
  private eventBus: GameEventBus | null;
  private authToken: string;
  private _aborted = false;
  private _answerResolver: ((answer: ExamAnswer) => void) | null = null;

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

      // Score the answer — use audio pronunciation scoring if applicable
      let questionResult: NpcExamQuestionResult;
      const usePronunciation = examConfig.category === 'pronunciation_quiz' || question.scoringType === 'pronunciation' || question.isPronunciation;
      if (answer.type === 'audio' && usePronunciation) {
        questionResult = await this._scorePronunciationAnswer(question, answer.audio, examConfig.targetLanguage);
      } else if (usePronunciation) {
        const textAnswer = answer.type === 'text' ? answer.text : '';
        questionResult = scorePronunciationExamQuestion(question, textAnswer);
      } else {
        const textAnswer = answer.type === 'text' ? answer.text : '';
        questionResult = scoreNpcExamQuestion(question, textAnswer);
      }
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

      // For pronunciation quizzes, emit pronunciation_attempt for quest tracking
      if (examConfig.category === 'pronunciation_quiz') {
        const pctScore = questionResult.maxPoints > 0
          ? Math.round((questionResult.score / questionResult.maxPoints) * 100)
          : 0;
        this.eventBus?.emit({
          type: 'utterance_evaluated',
          objectiveId: `npc_exam_${examConfig.examId}_q${i}`,
          input: answer,
          score: pctScore,
          passed: questionResult.correct,
          feedback: questionResult.rationale || '',
        });
      }

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

    // For pronunciation quizzes, emit assessment data for quest integration
    if (examConfig.category === 'pronunciation_quiz' && questionResults.length > 0) {
      const avgScore = Math.round(
        questionResults.reduce((sum, qr) => sum + (qr.maxPoints > 0 ? (qr.score / qr.maxPoints) * 100 : 0), 0)
        / questionResults.length,
      );
      this.eventBus?.emit({
        type: 'pronunciation_assessment_data',
        questId: `npc_exam_${examConfig.examId}`,
        averageScore: avgScore,
        sampleCount: questionResults.length,
      });
    }

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
      this._answerResolver({ type: 'text', text: '' });
      this._answerResolver = null;
    }
  }

  dispose(): void {
    this.abort();
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private _presentQuestion(
    question: NpcExamQuestion,
    index: number,
    total: number,
    timeRemaining: number,
    callbacks: NpcExamCallbacks,
  ): Promise<ExamAnswer> {
    return new Promise<ExamAnswer>((resolve) => {
      this._answerResolver = resolve;

      if (callbacks.onQuestion) {
        callbacks.onQuestion({
          questionId: question.id,
          questionIndex: index,
          totalQuestions: total,
          prompt: question.prompt,
          hint: question.hint,
          timeRemainingSeconds: timeRemaining,
          isPronunciation: !!question.isPronunciation,
          onAnswer: (answer: string) => {
            this._answerResolver = null;
            resolve({ type: 'text', text: answer });
          },
          onAudioAnswer: (audio: AudioAnswer) => {
            this._answerResolver = null;
            resolve({ type: 'audio', audio });
          },
        });
      } else {
        console.warn('[NpcExamEngine] No onQuestion callback — skipping question');
        this._answerResolver = null;
        resolve({ type: 'text', text: '' });
      }
    });
  }

  /**
   * Score a pronunciation question by sending audio to the server endpoint.
   * Falls back to text-based scoring if the API call fails.
   */
  private async _scorePronunciationAnswer(
    question: NpcExamQuestion,
    audioAnswer: AudioAnswer,
    targetLanguage?: string,
  ): Promise<NpcExamQuestionResult> {
    const expectedPhrase = question.expectedPhrase || question.expectedAnswer || question.prompt;
    const languageHint = question.languageHint || targetLanguage;

    try {
      const result = await this._callPronunciationApi(audioAnswer, expectedPhrase, languageHint);
      return scorePronunciationQuestion(question, result);
    } catch (err) {
      console.warn('[NpcExamEngine] Pronunciation scoring failed, falling back to text:', err);
      return scoreNpcExamQuestion(question, '');
    }
  }

  /**
   * Call the server pronunciation scoring endpoint.
   */
  private async _callPronunciationApi(
    audioAnswer: AudioAnswer,
    expectedPhrase: string,
    languageHint?: string,
  ): Promise<AudioPronunciationResult> {
    let audioBase64: string;
    let mimeType = audioAnswer.mimeType || 'audio/wav';

    if (typeof audioAnswer.audio === 'string') {
      audioBase64 = audioAnswer.audio;
    } else {
      const arrayBuffer = await audioAnswer.audio.arrayBuffer();
      audioBase64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      );
      mimeType = audioAnswer.audio.type || mimeType;
    }

    const res = await fetch('/api/pronunciation/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      },
      body: JSON.stringify({
        audio: audioBase64,
        expectedPhrase,
        mimeType,
        languageHint,
      }),
    });

    if (!res.ok) {
      throw new Error(`Pronunciation API error: ${res.status}`);
    }

    return await res.json();
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
