/**
 * VisualVocabularyDetector
 *
 * Handles completion detection for Visual Vocabulary quests. When a player
 * approaches a vocabulary object, they are prompted to name it in the target
 * language. The detector validates their answer using fuzzy matching and
 * completes the objective on a correct response.
 *
 * Two sub-types:
 *   1. Nouns/Adjectives — Player finds an object, interacts, names it.
 *   2. Verbs/Adverbs — Player observes an NPC activity and describes it.
 */

import type { GameEventBus } from './GameEventBus';

// ── Types ───────────────────────────────────────────────────────────────────

export interface VocabularyTarget {
  /** Unique ID for this target (typically objectiveId). */
  id: string;
  questId: string;
  objectiveId: string;
  /** The word in the target language the player must provide. */
  targetWord: string;
  /** English meaning (for hint display). */
  englishMeaning: string;
  /** Alternative accepted answers (synonyms, alternate spellings). */
  acceptedAnswers?: string[];
  /** Whether this is a verb/adverb (NPC activity) vs noun/adjective (object). */
  isActivity?: boolean;
  /** NPC performing the activity (for verb/adverb sub-type). */
  activityNpcId?: string;
}

export interface IdentificationPrompt {
  targetId: string;
  questId: string;
  objectiveId: string;
  /** Prompt text shown to the player (e.g., "What is this?" or "What is this person doing?"). */
  promptText: string;
  /** English hint (shown after failed attempts). */
  hint?: string;
  /** Whether this is a verb/adverb activity prompt. */
  isActivity: boolean;
}

export interface IdentificationResult {
  passed: boolean;
  score: number;
  feedback: string;
  bestMatch?: string;
  /** Whether this was the final identification needed to complete the quest objective. */
  objectiveCompleted: boolean;
}

export interface VisualVocabularyProgress {
  targetId: string;
  questId: string;
  objectiveId: string;
  attempts: number;
  identified: boolean;
  bestScore: number;
}

// ── Detector ────────────────────────────────────────────────────────────────

export class VisualVocabularyDetector {
  private targets: Map<string, VocabularyTarget> = new Map();
  private progressMap: Map<string, VisualVocabularyProgress> = new Map();
  private eventBus: GameEventBus | null;

  /** Callback fired when the player should be prompted to identify an object. */
  private onIdentificationPrompt?: (prompt: IdentificationPrompt) => void;
  /** Callback fired when an objective is completed via successful identification. */
  private onObjectiveCompleted?: (questId: string, objectiveId: string) => void;

  /** Maximum Levenshtein distance ratio for a passing answer. */
  private maxDistanceRatio = 0.35;
  /** Minimum score (0-100) to count as correct. */
  private passThreshold = 45;

  constructor(eventBus?: GameEventBus) {
    this.eventBus = eventBus ?? null;
  }

  // ── Registration ──────────────────────────────────────────────────────────

  /** Register a vocabulary target to be identified by the player. */
  registerTarget(target: VocabularyTarget): void {
    this.targets.set(target.id, target);
    this.progressMap.set(target.id, {
      targetId: target.id,
      questId: target.questId,
      objectiveId: target.objectiveId,
      attempts: 0,
      identified: false,
      bestScore: 0,
    });
  }

  /** Remove a target and its progress. */
  removeTarget(targetId: string): void {
    this.targets.delete(targetId);
    this.progressMap.delete(targetId);
  }

  /** Remove all targets for a given quest. */
  removeQuestTargets(questId: string): void {
    Array.from(this.targets.entries()).forEach(([id, target]) => {
      if (target.questId === questId) {
        this.targets.delete(id);
        this.progressMap.delete(id);
      }
    });
  }

  // ── Callbacks ─────────────────────────────────────────────────────────────

  setOnIdentificationPrompt(callback: (prompt: IdentificationPrompt) => void): void {
    this.onIdentificationPrompt = callback;
  }

  setOnObjectiveCompleted(callback: (questId: string, objectiveId: string) => void): void {
    this.onObjectiveCompleted = callback;
  }

  // ── Prompt Trigger ────────────────────────────────────────────────────────

  /**
   * Trigger an identification prompt for a specific target.
   * Called when the player interacts with (clicks/taps) a vocabulary object
   * or approaches an NPC performing an activity.
   */
  triggerPrompt(targetId: string): IdentificationPrompt | null {
    const target = this.targets.get(targetId);
    if (!target) return null;

    const progress = this.progressMap.get(targetId);
    if (progress?.identified) return null;

    const prompt: IdentificationPrompt = {
      targetId: target.id,
      questId: target.questId,
      objectiveId: target.objectiveId,
      promptText: target.isActivity
        ? 'What is this person doing? Answer in the target language.'
        : 'What is this? Answer in the target language.',
      hint: progress && progress.attempts >= 2 ? target.englishMeaning : undefined,
      isActivity: !!target.isActivity,
    };

    this.onIdentificationPrompt?.(prompt);

    this.eventBus?.emit({
      type: 'visual_vocab_prompted',
      targetId: target.id,
      questId: target.questId,
      objectiveId: target.objectiveId,
      isActivity: !!target.isActivity,
    });

    return prompt;
  }

  // ── Answer Validation ─────────────────────────────────────────────────────

  /**
   * Submit a player's answer for a vocabulary target.
   * Returns the evaluation result with score and feedback.
   */
  submitAnswer(targetId: string, playerInput: string): IdentificationResult {
    const target = this.targets.get(targetId);
    if (!target) {
      return { passed: false, score: 0, feedback: 'Target not found.', objectiveCompleted: false };
    }

    const progress = this.progressMap.get(targetId);
    if (!progress) {
      return { passed: false, score: 0, feedback: 'No progress tracked.', objectiveCompleted: false };
    }

    if (progress.identified) {
      return { passed: true, score: progress.bestScore, feedback: 'Already identified.', objectiveCompleted: true };
    }

    progress.attempts++;

    // Build list of accepted answers: the target word + any alternatives
    const acceptedAnswers = [target.targetWord, ...(target.acceptedAnswers || [])];

    const normalizedInput = this.normalize(playerInput);
    let bestScore = 0;
    let bestMatch = '';

    for (const accepted of acceptedAnswers) {
      const normalizedTarget = this.normalize(accepted);
      const distance = this.levenshtein(normalizedInput, normalizedTarget);
      const score = this.distanceToScore(distance, normalizedTarget.length);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = accepted;
      }
    }

    const passed = bestScore >= this.passThreshold;

    if (passed) {
      progress.identified = true;
      progress.bestScore = bestScore;

      // Emit events
      this.eventBus?.emit({
        type: 'vocabulary_used',
        word: target.targetWord,
        correct: true,
      });
      this.eventBus?.emit({
        type: 'visual_vocab_answered',
        targetId: target.id,
        questId: target.questId,
        passed: true,
        score: bestScore,
        playerAnswer: playerInput,
      });

      // Notify objective completion
      this.onObjectiveCompleted?.(target.questId, target.objectiveId);

      const feedback = bestScore >= 90
        ? 'Excellent! Perfect identification!'
        : bestScore >= 70
          ? 'Great job! Correct!'
          : 'Correct! Keep practicing for better accuracy.';

      return { passed: true, score: bestScore, feedback, bestMatch, objectiveCompleted: true };
    }

    // Failed attempt
    if (progress.bestScore < bestScore) {
      progress.bestScore = bestScore;
    }

    this.eventBus?.emit({
      type: 'vocabulary_used',
      word: playerInput,
      correct: false,
    });
    this.eventBus?.emit({
      type: 'visual_vocab_answered',
      targetId: target.id,
      questId: target.questId,
      passed: false,
      score: bestScore,
      playerAnswer: playerInput,
    });

    const feedback = bestScore >= 30
      ? `Close! Try again.${progress.attempts >= 2 ? ` Hint: ${target.englishMeaning}` : ''}`
      : `That doesn't seem right.${progress.attempts >= 2 ? ` Hint: ${target.englishMeaning}` : ''}`;

    return { passed: false, score: bestScore, feedback, bestMatch, objectiveCompleted: false };
  }

  // ── Query ─────────────────────────────────────────────────────────────────

  /** Get progress for a specific target. */
  getProgress(targetId: string): VisualVocabularyProgress | null {
    return this.progressMap.get(targetId) ?? null;
  }

  /** Get all targets for a quest. */
  getQuestTargets(questId: string): VocabularyTarget[] {
    return Array.from(this.targets.values()).filter(t => t.questId === questId);
  }

  /** Check if all targets for a quest have been identified. */
  isQuestComplete(questId: string): boolean {
    const questTargets = this.getQuestTargets(questId);
    if (questTargets.length === 0) return false;
    return questTargets.every(t => this.progressMap.get(t.id)?.identified === true);
  }

  /** Get the number of identified targets for a quest. */
  getIdentifiedCount(questId: string): number {
    return this.getQuestTargets(questId)
      .filter(t => this.progressMap.get(t.id)?.identified === true)
      .length;
  }

  /** Get the total number of targets for a quest. */
  getTotalCount(questId: string): number {
    return this.getQuestTargets(questId).length;
  }

  // ── Text Matching Utilities ───────────────────────────────────────────────

  /** Normalize text for comparison: lowercase, strip accents/punctuation, collapse spaces. */
  private normalize(text: string): string {
    let result = text.trim().toLowerCase();
    // Strip punctuation
    result = result.replace(/[.,!?;:'"()\-\u2014\u2013\u00ab\u00bb\u201c\u201d\u2018\u2019]/g, '');
    // Strip accents for lenient matching
    result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Collapse spaces
    result = result.replace(/\s+/g, ' ').trim();
    return result;
  }

  /** Convert Levenshtein distance to a 0-100 score. */
  private distanceToScore(distance: number, targetLength: number): number {
    if (targetLength === 0) return distance === 0 ? 100 : 0;
    const ratio = distance / targetLength;
    return Math.max(0, Math.round((1 - ratio) * 100));
  }

  /** Levenshtein distance between two strings. */
  private levenshtein(a: string, b: string): number {
    const aLen = a.length;
    const bLen = b.length;
    if (aLen === 0) return bLen;
    if (bLen === 0) return aLen;

    let prevRow: number[] = [];
    let currRow: number[] = [];

    for (let j = 0; j <= bLen; j++) {
      prevRow[j] = j;
    }

    for (let i = 1; i <= aLen; i++) {
      currRow[0] = i;
      for (let j = 1; j <= bLen; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        currRow[j] = Math.min(
          prevRow[j] + 1,
          currRow[j - 1] + 1,
          prevRow[j - 1] + cost,
        );
      }
      const tmp = prevRow;
      prevRow = currRow;
      currRow = tmp;
    }

    return prevRow[bLen];
  }

  /** Dispose all state. */
  dispose(): void {
    this.targets.clear();
    this.progressMap.clear();
  }
}
