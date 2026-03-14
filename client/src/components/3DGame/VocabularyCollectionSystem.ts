/**
 * VocabularyCollectionSystem
 *
 * Manages collectible vocabulary objects in the 3D world. World objects are
 * tagged with vocabulary metadata. When the player approaches a tagged object,
 * a multiple-choice quiz is presented. Correct answers add the word to the
 * player's vocabulary bank and award XP.
 *
 * Integrates with:
 *  - GameEventBus (vocabulary_used, item_collected events)
 *  - LanguageProgressTracker (vocabulary bank updates)
 *  - XP_REWARDS from gamification (vocabularyNewWord = 3 XP)
 */

import type { GameEventBus } from './GameEventBus';

// ── Types ───────────────────────────────────────────────────────────────────

export type VocabPartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'interjection' | 'number';

export interface VocabObjectTag {
  /** Unique ID for this tagged object in the world. */
  objectId: string;
  /** The word in the target language. */
  targetWord: string;
  /** English meaning. */
  englishMeaning: string;
  /** Part of speech. */
  partOfSpeech: VocabPartOfSpeech;
  /** Vocabulary category (e.g. 'food', 'nature', 'places'). */
  category: string;
  /** Difficulty tier. */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** World position for proximity check. */
  position: { x: number; y: number; z: number };
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface VocabQuiz {
  objectId: string;
  targetWord: string;
  category: string;
  difficulty: string;
  /** The question prompt. */
  prompt: string;
  /** Multiple-choice options (3-4 items, exactly one correct). */
  options: QuizOption[];
}

export interface CollectionResult {
  correct: boolean;
  targetWord: string;
  englishMeaning: string;
  category: string;
  xpAwarded: number;
  alreadyCollected: boolean;
}

// ── System ──────────────────────────────────────────────────────────────────

const PROXIMITY_RANGE = 5;
const XP_PER_NEW_WORD = 3;
const QUIZ_OPTIONS_COUNT = 4;

export class VocabularyCollectionSystem {
  private taggedObjects: Map<string, VocabObjectTag> = new Map();
  private collectedIds: Set<string> = new Set();
  private eventBus: GameEventBus | null;

  /** Pool of distractor words keyed by category for quiz generation. */
  private distractorPool: Map<string, string[]> = new Map();

  /** Callback when a quiz should be shown to the player. */
  private onQuizPrompt?: (quiz: VocabQuiz) => void;
  /** Callback when a word is collected (correct answer). */
  private onWordCollected?: (result: CollectionResult) => void;

  constructor(eventBus?: GameEventBus) {
    this.eventBus = eventBus ?? null;
  }

  // ── Registration ────────────────────────────────────────────────────────

  /** Tag a world object with vocabulary metadata. */
  registerObject(tag: VocabObjectTag): void {
    this.taggedObjects.set(tag.objectId, tag);
    this.addDistractor(tag.category, tag.englishMeaning);
  }

  /** Register multiple objects at once. */
  registerObjects(tags: VocabObjectTag[]): void {
    for (const tag of tags) {
      this.registerObject(tag);
    }
  }

  /** Remove a tagged object. */
  removeObject(objectId: string): void {
    this.taggedObjects.delete(objectId);
  }

  /** Seed the distractor pool with extra English words for quiz generation. */
  seedDistractors(category: string, words: string[]): void {
    for (const word of words) {
      this.addDistractor(category, word);
    }
  }

  private addDistractor(category: string, word: string): void {
    if (!this.distractorPool.has(category)) {
      this.distractorPool.set(category, []);
    }
    const pool = this.distractorPool.get(category)!;
    if (!pool.includes(word)) {
      pool.push(word);
    }
  }

  // ── Callbacks ─────────────────────────────────────────────────────────

  setOnQuizPrompt(cb: (quiz: VocabQuiz) => void): void {
    this.onQuizPrompt = cb;
  }

  setOnWordCollected(cb: (result: CollectionResult) => void): void {
    this.onWordCollected = cb;
  }

  // ── Proximity ─────────────────────────────────────────────────────────

  /**
   * Check which uncollected vocabulary objects are within range of the player.
   * Returns object IDs that are close enough to interact with.
   */
  getObjectsInRange(
    playerPos: { x: number; y: number; z: number },
    range: number = PROXIMITY_RANGE,
  ): string[] {
    const results: string[] = [];
    this.taggedObjects.forEach((tag, id) => {
      if (this.collectedIds.has(id)) return;
      const dx = playerPos.x - tag.position.x;
      const dy = playerPos.y - tag.position.y;
      const dz = playerPos.z - tag.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist <= range) {
        results.push(id);
      }
    });
    return results;
  }

  // ── Quiz Generation ───────────────────────────────────────────────────

  /**
   * Generate a multiple-choice quiz for a tagged object.
   * Returns null if the object doesn't exist or is already collected.
   */
  generateQuiz(objectId: string): VocabQuiz | null {
    const tag = this.taggedObjects.get(objectId);
    if (!tag) return null;
    if (this.collectedIds.has(objectId)) return null;

    const distractors = this.pickDistractors(tag.englishMeaning, tag.category);
    const options = this.buildOptions(tag.englishMeaning, distractors);

    return {
      objectId,
      targetWord: tag.targetWord,
      category: tag.category,
      difficulty: tag.difficulty,
      prompt: `What does "${tag.targetWord}" mean?`,
      options,
    };
  }

  /** Pick distractor words that are NOT the correct answer. */
  private pickDistractors(correctAnswer: string, category: string): string[] {
    const needed = QUIZ_OPTIONS_COUNT - 1;
    const distractors: string[] = [];

    // Prefer same-category distractors for harder quizzes
    const sameCategory = (this.distractorPool.get(category) ?? [])
      .filter(w => w !== correctAnswer);

    // Also gather cross-category words as fallback
    const otherWords: string[] = [];
    this.distractorPool.forEach((words, cat) => {
      if (cat !== category) {
        otherWords.push(...words.filter(w => w !== correctAnswer));
      }
    });

    // Shuffle and pick
    const shuffledSame = this.shuffle([...sameCategory]);
    const shuffledOther = this.shuffle([...otherWords]);

    // Take up to 2 from same category, rest from other
    for (const word of shuffledSame) {
      if (distractors.length >= needed) break;
      if (!distractors.includes(word)) distractors.push(word);
    }
    for (const word of shuffledOther) {
      if (distractors.length >= needed) break;
      if (!distractors.includes(word)) distractors.push(word);
    }

    return distractors;
  }

  /** Build shuffled quiz options from correct answer + distractors. */
  private buildOptions(correctAnswer: string, distractors: string[]): QuizOption[] {
    const options: QuizOption[] = [
      { text: correctAnswer, isCorrect: true },
      ...distractors.map(d => ({ text: d, isCorrect: false })),
    ];
    return this.shuffle(options);
  }

  // ── Answer Submission ─────────────────────────────────────────────────

  /**
   * Submit an answer for a vocabulary quiz.
   * Returns the result including whether XP was awarded.
   */
  submitAnswer(objectId: string, selectedAnswer: string): CollectionResult {
    const tag = this.taggedObjects.get(objectId);
    if (!tag) {
      return { correct: false, targetWord: '', englishMeaning: '', category: '', xpAwarded: 0, alreadyCollected: false };
    }

    if (this.collectedIds.has(objectId)) {
      return {
        correct: true,
        targetWord: tag.targetWord,
        englishMeaning: tag.englishMeaning,
        category: tag.category,
        xpAwarded: 0,
        alreadyCollected: true,
      };
    }

    const isCorrect = selectedAnswer === tag.englishMeaning;
    let xpAwarded = 0;

    if (isCorrect) {
      this.collectedIds.add(objectId);
      xpAwarded = XP_PER_NEW_WORD;

      this.eventBus?.emit({
        type: 'vocabulary_used',
        word: tag.targetWord,
        correct: true,
      });

      this.eventBus?.emit({
        type: 'item_collected',
        itemId: `vocab_${tag.objectId}`,
        itemName: tag.targetWord,
        quantity: 1,
        taxonomy: {
          category: tag.category,
          itemType: 'vocabulary',
          baseType: tag.partOfSpeech,
        },
      });
    } else {
      this.eventBus?.emit({
        type: 'vocabulary_used',
        word: tag.targetWord,
        correct: false,
      });
    }

    const result: CollectionResult = {
      correct: isCorrect,
      targetWord: tag.targetWord,
      englishMeaning: tag.englishMeaning,
      category: tag.category,
      xpAwarded,
      alreadyCollected: false,
    };

    if (isCorrect) {
      this.onWordCollected?.(result);
    }

    return result;
  }

  /**
   * Interact with a tagged object: generate quiz and notify via callback.
   * Returns the quiz, or null if the object is already collected or not found.
   */
  interact(objectId: string): VocabQuiz | null {
    const quiz = this.generateQuiz(objectId);
    if (quiz) {
      this.onQuizPrompt?.(quiz);
    }
    return quiz;
  }

  // ── Query ─────────────────────────────────────────────────────────────

  /** Check if a specific object has been collected. */
  isCollected(objectId: string): boolean {
    return this.collectedIds.has(objectId);
  }

  /** Get the total number of collected vocabulary objects. */
  getCollectedCount(): number {
    return this.collectedIds.size;
  }

  /** Get all registered object IDs. */
  getRegisteredObjectIds(): string[] {
    return Array.from(this.taggedObjects.keys());
  }

  /** Get tag info for an object. */
  getObjectTag(objectId: string): VocabObjectTag | null {
    return this.taggedObjects.get(objectId) ?? null;
  }

  /** Get all uncollected object IDs. */
  getUncollectedIds(): string[] {
    return Array.from(this.taggedObjects.keys()).filter(id => !this.collectedIds.has(id));
  }

  /** Get collected object IDs. */
  getCollectedIds(): string[] {
    return Array.from(this.collectedIds);
  }

  // ── Utilities ─────────────────────────────────────────────────────────

  /** Fisher-Yates shuffle. */
  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Dispose all state. */
  dispose(): void {
    this.taggedObjects.clear();
    this.collectedIds.clear();
    this.distractorPool.clear();
    this.onQuizPrompt = undefined;
    this.onWordCollected = undefined;
  }
}
