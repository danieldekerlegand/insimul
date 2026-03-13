/**
 * Assessment Listening Task Handler
 *
 * Handles Phase 2 of the assessment encounter:
 * - Task 2A: Following Directions — score /4 via position tracking callbacks
 * - Task 2B: Information Extraction — 3 comprehension questions, score /3
 * Combined score: /7
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface DirectionCheckpoint {
  id: string;
  /** Expected position the player should reach */
  targetPosition: Position;
  /** Radius within which the checkpoint counts as reached */
  toleranceRadius: number;
  /** Description of the direction given (e.g., "Turn left at the fountain") */
  directionText: string;
}

export interface ExtractionQuestion {
  id: string;
  /** The question text */
  question: string;
  /** The correct answer */
  correctAnswer: string;
  /** Alternative acceptable answers */
  acceptableAnswers?: string[];
  /** Multiple-choice options (if using MC mode) */
  options?: string[];
}

export interface ListeningTaskConfig {
  /** Task 2A: checkpoints for following directions */
  checkpoints: DirectionCheckpoint[];
  /** Task 2B: comprehension questions */
  questions: ExtractionQuestion[];
  /** Time limit for the entire listening phase in seconds (optional) */
  timeLimitSeconds?: number;
  /** Announcement text for Task 2B (what the player listens to) */
  announcementText: string;
  /** Target language being assessed */
  targetLanguage: string;
}

export type ListeningTaskStatus = 'idle' | 'directions_active' | 'extraction_active' | 'completed';

export interface CheckpointResult {
  checkpointId: string;
  reached: boolean;
  /** Player's position when evaluated */
  playerPosition?: Position;
}

export interface QuestionResult {
  questionId: string;
  playerAnswer: string;
  correct: boolean;
}

export interface ListeningTaskResult {
  /** Task 2A: Following Directions score (0–4) */
  directionsScore: number;
  directionsMaxScore: number;
  checkpointResults: CheckpointResult[];
  /** Task 2B: Information Extraction score (0–3) */
  extractionScore: number;
  extractionMaxScore: number;
  questionResults: QuestionResult[];
  /** Combined score (0–7) */
  totalScore: number;
  totalMaxScore: number;
  /** Duration in milliseconds */
  durationMs: number;
}

export interface ListeningTaskCallbacks {
  onCheckpointReached?: (checkpointId: string, index: number, total: number) => void;
  onCheckpointMissed?: (checkpointId: string, index: number, total: number) => void;
  onDirectionsComplete?: (score: number, maxScore: number) => void;
  onQuestionAnswered?: (questionId: string, correct: boolean, index: number, total: number) => void;
  onExtractionComplete?: (score: number, maxScore: number) => void;
  onComplete?: (result: ListeningTaskResult) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Euclidean distance between two 3D positions. */
export function distanceBetween(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Normalize a string for answer comparison: lowercase, trim, collapse whitespace. */
function normalizeAnswer(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Check if a player answer matches the correct answer or acceptable alternatives. */
export function isAnswerCorrect(
  playerAnswer: string,
  correctAnswer: string,
  acceptableAnswers?: string[],
): boolean {
  const normalized = normalizeAnswer(playerAnswer);
  if (normalized === normalizeAnswer(correctAnswer)) return true;
  if (acceptableAnswers) {
    return acceptableAnswers.some(alt => normalizeAnswer(alt) === normalized);
  }
  return false;
}

// ─── Controller ──────────────────────────────────────────────────────────────

export class AssessmentListeningTask {
  private _status: ListeningTaskStatus = 'idle';
  private _config: ListeningTaskConfig;
  private _callbacks: ListeningTaskCallbacks;
  private _startTime = 0;

  // Task 2A state
  private _checkpointResults: CheckpointResult[] = [];
  private _currentCheckpointIndex = 0;

  // Task 2B state
  private _questionResults: QuestionResult[] = [];
  private _currentQuestionIndex = 0;

  constructor(config: ListeningTaskConfig, callbacks: ListeningTaskCallbacks = {}) {
    if (config.checkpoints.length === 0) {
      throw new Error('At least one checkpoint is required for the directions task');
    }
    if (config.questions.length === 0) {
      throw new Error('At least one question is required for the extraction task');
    }
    this._config = config;
    this._callbacks = callbacks;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  get status(): ListeningTaskStatus { return this._status; }
  get currentCheckpointIndex(): number { return this._currentCheckpointIndex; }
  get currentQuestionIndex(): number { return this._currentQuestionIndex; }
  get checkpointResults(): ReadonlyArray<CheckpointResult> { return this._checkpointResults; }
  get questionResults(): ReadonlyArray<QuestionResult> { return this._questionResults; }
  get config(): ListeningTaskConfig { return this._config; }

  get directionsMaxScore(): number { return this._config.checkpoints.length; }
  get extractionMaxScore(): number { return this._config.questions.length; }
  get totalMaxScore(): number { return this.directionsMaxScore + this.extractionMaxScore; }

  get elapsedMs(): number {
    return this._startTime > 0 ? Date.now() - this._startTime : 0;
  }

  /** Start Task 2A (Following Directions). */
  startDirections(): void {
    if (this._status !== 'idle') {
      throw new Error(`Cannot start directions: status is ${this._status}`);
    }
    this._status = 'directions_active';
    this._startTime = Date.now();
  }

  /**
   * Report the player's current position for checkpoint evaluation.
   * Call this when the player reaches a potential checkpoint location.
   * Returns true if the checkpoint was reached.
   */
  evaluatePosition(playerPosition: Position): boolean {
    if (this._status !== 'directions_active') {
      throw new Error(`Cannot evaluate position: status is ${this._status}`);
    }
    if (this._currentCheckpointIndex >= this._config.checkpoints.length) {
      return false;
    }

    const checkpoint = this._config.checkpoints[this._currentCheckpointIndex];
    const distance = distanceBetween(playerPosition, checkpoint.targetPosition);
    const reached = distance <= checkpoint.toleranceRadius;

    const result: CheckpointResult = {
      checkpointId: checkpoint.id,
      reached,
      playerPosition: { ...playerPosition },
    };
    this._checkpointResults.push(result);

    const index = this._currentCheckpointIndex;
    const total = this._config.checkpoints.length;

    if (reached) {
      this._callbacks.onCheckpointReached?.(checkpoint.id, index, total);
    } else {
      this._callbacks.onCheckpointMissed?.(checkpoint.id, index, total);
    }

    this._currentCheckpointIndex++;

    // Check if all checkpoints have been evaluated
    if (this._currentCheckpointIndex >= this._config.checkpoints.length) {
      this._completeDirections();
    }

    return reached;
  }

  /**
   * Skip remaining checkpoints (e.g., player gave up or time ran out).
   * Marks unevaluated checkpoints as missed.
   */
  skipRemainingCheckpoints(): void {
    if (this._status !== 'directions_active') {
      throw new Error(`Cannot skip checkpoints: status is ${this._status}`);
    }

    while (this._currentCheckpointIndex < this._config.checkpoints.length) {
      const checkpoint = this._config.checkpoints[this._currentCheckpointIndex];
      this._checkpointResults.push({
        checkpointId: checkpoint.id,
        reached: false,
      });
      this._callbacks.onCheckpointMissed?.(
        checkpoint.id,
        this._currentCheckpointIndex,
        this._config.checkpoints.length,
      );
      this._currentCheckpointIndex++;
    }
    this._completeDirections();
  }

  /** Start Task 2B (Information Extraction). Normally auto-started after directions complete. */
  startExtraction(): void {
    if (this._status === 'completed') {
      throw new Error(`Cannot start extraction: task already completed`);
    }
    if (this._status === 'extraction_active') {
      return; // Already in extraction mode (auto-transitioned from directions)
    }
    this._status = 'extraction_active';
    if (this._startTime === 0) {
      this._startTime = Date.now();
    }
  }

  /**
   * Submit an answer for the current extraction question.
   * Returns whether the answer was correct.
   */
  submitAnswer(answer: string): boolean {
    if (this._status !== 'extraction_active') {
      throw new Error(`Cannot submit answer: status is ${this._status}`);
    }
    if (this._currentQuestionIndex >= this._config.questions.length) {
      throw new Error('All questions have been answered');
    }

    const question = this._config.questions[this._currentQuestionIndex];
    const correct = isAnswerCorrect(answer, question.correctAnswer, question.acceptableAnswers);

    const result: QuestionResult = {
      questionId: question.id,
      playerAnswer: answer,
      correct,
    };
    this._questionResults.push(result);

    this._callbacks.onQuestionAnswered?.(
      question.id,
      correct,
      this._currentQuestionIndex,
      this._config.questions.length,
    );

    this._currentQuestionIndex++;

    if (this._currentQuestionIndex >= this._config.questions.length) {
      this._completeExtraction();
    }

    return correct;
  }

  /**
   * Get the current question (for Task 2B).
   * Returns null if all questions answered or extraction not active.
   */
  getCurrentQuestion(): ExtractionQuestion | null {
    if (this._status !== 'extraction_active') return null;
    if (this._currentQuestionIndex >= this._config.questions.length) return null;
    return this._config.questions[this._currentQuestionIndex];
  }

  /**
   * Get the current checkpoint (for Task 2A).
   * Returns null if all checkpoints evaluated or directions not active.
   */
  getCurrentCheckpoint(): DirectionCheckpoint | null {
    if (this._status !== 'directions_active') return null;
    if (this._currentCheckpointIndex >= this._config.checkpoints.length) return null;
    return this._config.checkpoints[this._currentCheckpointIndex];
  }

  /** Get the final result. Only available after both tasks are completed. */
  getResult(): ListeningTaskResult {
    if (this._status !== 'completed') {
      throw new Error(`Cannot get result: task is not completed (status: ${this._status})`);
    }
    return this._buildResult();
  }

  /** Get the current directions score so far. */
  getDirectionsScore(): number {
    return this._checkpointResults.filter(r => r.reached).length;
  }

  /** Get the current extraction score so far. */
  getExtractionScore(): number {
    return this._questionResults.filter(r => r.correct).length;
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private _completeDirections(): void {
    const score = this.getDirectionsScore();
    this._callbacks.onDirectionsComplete?.(score, this.directionsMaxScore);
    // Automatically transition to extraction
    this._status = 'extraction_active';
  }

  private _completeExtraction(): void {
    const score = this.getExtractionScore();
    this._callbacks.onExtractionComplete?.(score, this.extractionMaxScore);
    this._status = 'completed';
    this._callbacks.onComplete?.(this._buildResult());
  }

  private _buildResult(): ListeningTaskResult {
    const directionsScore = this.getDirectionsScore();
    const extractionScore = this.getExtractionScore();
    return {
      directionsScore,
      directionsMaxScore: this.directionsMaxScore,
      checkpointResults: [...this._checkpointResults],
      extractionScore,
      extractionMaxScore: this.extractionMaxScore,
      questionResults: [...this._questionResults],
      totalScore: directionsScore + extractionScore,
      totalMaxScore: this.totalMaxScore,
      durationMs: Date.now() - this._startTime,
    };
  }
}
