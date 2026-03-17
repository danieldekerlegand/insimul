/**
 * Assessment Listening Task Handler
 *
 * Handles the listening comprehension section of the assessment.
 * A passage is spoken via TTS, and the player answers comprehension
 * questions via text input. Scoring is done server-side by the LLM.
 *
 * The passage is NOT displayed — the player must listen to understand it.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ListeningQuestion {
  id: string;
  questionText: string;
  maxPoints: number;
}

export interface ListeningTaskConfig {
  /** The passage text (spoken via TTS, not shown to player) */
  passage: string;
  /** Comprehension questions */
  questions: ListeningQuestion[];
  /** Target language being assessed */
  targetLanguage: string;
  /** Audio URL for pre-generated TTS (optional — falls back to browser TTS) */
  audioUrl?: string;
  /** Time limit for the listening phase in seconds (optional) */
  timeLimitSeconds?: number;
}

export type ListeningTaskStatus = 'idle' | 'listening' | 'answering' | 'completed';

export interface ListeningQuestionResult {
  questionId: string;
  playerAnswer: string;
  score: number;
  maxPoints: number;
  rationale: string;
}

export interface ListeningTaskResult {
  questionResults: ListeningQuestionResult[];
  totalScore: number;
  totalMaxScore: number;
  durationMs: number;
}

export interface ListeningTaskCallbacks {
  onStatusChange?: (status: ListeningTaskStatus) => void;
  onComplete?: (result: ListeningTaskResult) => void;
}

// ─── Controller ──────────────────────────────────────────────────────────────

export class AssessmentListeningTask {
  private _status: ListeningTaskStatus = 'idle';
  private _config: ListeningTaskConfig;
  private _callbacks: ListeningTaskCallbacks;
  private _startTime = 0;
  private _answers: Map<string, string> = new Map();

  constructor(config: ListeningTaskConfig, callbacks: ListeningTaskCallbacks = {}) {
    if (config.questions.length === 0) {
      throw new Error('At least one question is required for the listening task');
    }
    this._config = config;
    this._callbacks = callbacks;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  get status(): ListeningTaskStatus { return this._status; }
  get config(): ListeningTaskConfig { return this._config; }
  get totalMaxScore(): number { return this._config.questions.reduce((sum, q) => sum + q.maxPoints, 0); }

  get elapsedMs(): number {
    return this._startTime > 0 ? Date.now() - this._startTime : 0;
  }

  /** Start the listening phase. */
  start(): void {
    if (this._status !== 'idle') {
      throw new Error(`Cannot start: status is ${this._status}`);
    }
    this._startTime = Date.now();
    this._setStatus('listening');
  }

  /** Transition from listening to answering (after audio playback). */
  beginAnswering(): void {
    if (this._status !== 'listening') {
      throw new Error(`Cannot begin answering: status is ${this._status}`);
    }
    this._setStatus('answering');
  }

  /** Submit an answer for a question. */
  submitAnswer(questionId: string, answer: string): void {
    if (this._status !== 'answering' && this._status !== 'listening') {
      throw new Error(`Cannot submit answer: status is ${this._status}`);
    }
    this._answers.set(questionId, answer);
  }

  /** Submit all answers and complete the task. Returns the collected answers. */
  submitAll(answers: Record<string, string>): Record<string, string> {
    for (const [id, answer] of Object.entries(answers)) {
      this._answers.set(id, answer);
    }
    this._setStatus('completed');

    // Build answers record for scoring
    const result: Record<string, string> = {};
    this._answers.forEach((v, k) => { result[k] = v; });
    return result;
  }

  /** Get the current question by index. */
  getQuestion(index: number): ListeningQuestion | null {
    if (index < 0 || index >= this._config.questions.length) return null;
    return this._config.questions[index];
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  private _setStatus(status: ListeningTaskStatus): void {
    this._status = status;
    this._callbacks.onStatusChange?.(status);
  }
}
