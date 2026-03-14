/**
 * Quest Language Feedback
 *
 * Real-time grammar and vocabulary feedback during quest interactions.
 * Analyzes player messages against quest-specific language targets and
 * produces structured feedback for UI display.
 */

import type { GrammarFeedback, GrammarCorrection, VocabularyUsage } from './progress';

// ── Types ───────────────────────────────────────────────────────────────────

/** A vocabulary word targeted by a quest objective. */
export interface QuestVocabularyTarget {
  word: string;
  meaning: string;
  category?: string;
  used: boolean;
  usedCorrectly: boolean;
  usageCount: number;
}

/** A grammar pattern targeted by a quest objective. */
export interface QuestGrammarTarget {
  pattern: string;
  description?: string;
  correctUses: number;
  incorrectUses: number;
  lastFeedback?: string;
}

/** Snapshot of language feedback for the current quest. */
export interface QuestLanguageFeedbackState {
  questId: string;
  questTitle: string;
  questType: string;

  // Vocabulary tracking
  vocabularyTargets: QuestVocabularyTarget[];
  vocabularyUsedCount: number;
  vocabularyRequiredCount: number;
  vocabularyProgress: number; // 0-100

  // Grammar tracking
  grammarTargets: QuestGrammarTarget[];
  grammarCorrectCount: number;
  grammarErrorCount: number;
  grammarAccuracy: number; // 0-100

  // Recent feedback items for display
  recentFeedback: FeedbackItem[];
}

/** A single feedback item to display in the UI. */
export interface FeedbackItem {
  id: string;
  type: 'vocabulary_used' | 'vocabulary_hint' | 'grammar_correct' | 'grammar_correction' | 'grammar_focus' | 'milestone';
  message: string;
  detail?: string;
  timestamp: number;
}

/** Quest objective shape (from quest.objectives jsonb). */
export interface QuestObjective {
  type: string;
  description?: string;
  target?: string;
  required?: number;
  vocabularyWords?: string[];
  grammarPatterns?: string[];
  category?: string;
}

// ── Service ─────────────────────────────────────────────────────────────────

export class QuestLanguageFeedbackTracker {
  private state: QuestLanguageFeedbackState;
  private vocabularyLookup: Map<string, QuestVocabularyTarget> = new Map();
  private grammarLookup: Map<string, QuestGrammarTarget> = new Map();
  private feedbackIdCounter = 0;
  private onFeedbackUpdate: ((state: QuestLanguageFeedbackState) => void) | null = null;
  private onFeedbackItem: ((item: FeedbackItem) => void) | null = null;

  constructor(
    questId: string,
    questTitle: string,
    questType: string,
    objectives: QuestObjective[],
    vocabMeanings?: Record<string, string>,
  ) {
    this.state = {
      questId,
      questTitle,
      questType,
      vocabularyTargets: [],
      vocabularyUsedCount: 0,
      vocabularyRequiredCount: 0,
      vocabularyProgress: 0,
      grammarTargets: [],
      grammarCorrectCount: 0,
      grammarErrorCount: 0,
      grammarAccuracy: 100,
      recentFeedback: [],
    };

    this.initializeFromObjectives(objectives, vocabMeanings);
  }

  /** Extract vocabulary and grammar targets from quest objectives. */
  private initializeFromObjectives(objectives: QuestObjective[], vocabMeanings?: Record<string, string>): void {
    for (const obj of objectives) {
      // Vocabulary objectives
      if (obj.vocabularyWords && obj.vocabularyWords.length > 0) {
        for (const word of obj.vocabularyWords) {
          if (!this.vocabularyLookup.has(word.toLowerCase())) {
            const target: QuestVocabularyTarget = {
              word,
              meaning: vocabMeanings?.[word] ?? '',
              category: obj.category,
              used: false,
              usedCorrectly: false,
              usageCount: 0,
            };
            this.state.vocabularyTargets.push(target);
            this.vocabularyLookup.set(word.toLowerCase(), target);
          }
        }
        this.state.vocabularyRequiredCount += obj.required ?? obj.vocabularyWords.length;
      }

      // Grammar objectives
      if (obj.grammarPatterns && obj.grammarPatterns.length > 0) {
        for (const pattern of obj.grammarPatterns) {
          if (!this.grammarLookup.has(pattern.toLowerCase())) {
            const target: QuestGrammarTarget = {
              pattern,
              description: obj.description,
              correctUses: 0,
              incorrectUses: 0,
            };
            this.state.grammarTargets.push(target);
            this.grammarLookup.set(pattern.toLowerCase(), target);
          }
        }
      }

      // Infer targets from objective type
      if (obj.type === 'use_vocabulary' && !obj.vocabularyWords) {
        this.state.vocabularyRequiredCount += obj.required ?? 5;
      }
      if (obj.type === 'practice_grammar' && !obj.grammarPatterns) {
        this.state.grammarTargets.push({
          pattern: obj.target ?? 'general',
          description: obj.description,
          correctUses: 0,
          incorrectUses: 0,
        });
      }
    }
  }

  /**
   * Process vocabulary usages from a player message.
   * Returns new feedback items generated.
   */
  public processVocabularyUsage(usages: VocabularyUsage[]): FeedbackItem[] {
    const items: FeedbackItem[] = [];

    for (const usage of usages) {
      const target = this.vocabularyLookup.get(usage.word.toLowerCase());
      if (target) {
        const wasNew = !target.used;
        target.used = true;
        target.usageCount++;
        target.usedCorrectly = usage.usedCorrectly;

        if (wasNew) {
          this.state.vocabularyUsedCount++;
          const item = this.createFeedbackItem(
            'vocabulary_used',
            `Used quest word: "${target.word}"${target.meaning ? ` (${target.meaning})` : ''}`,
          );
          items.push(item);
        }
      } else {
        // Non-target vocabulary still counts toward general usage objectives
        this.state.vocabularyUsedCount = Math.min(
          this.state.vocabularyUsedCount + 1,
          this.state.vocabularyRequiredCount || this.state.vocabularyUsedCount + 1,
        );
      }
    }

    this.updateVocabularyProgress();

    // Milestone feedback
    const progress = this.state.vocabularyProgress;
    if (progress >= 100 && items.length > 0) {
      items.push(this.createFeedbackItem('milestone', 'Vocabulary objective complete!'));
    } else if (progress >= 50 && progress - (items.length > 0 ? 10 : 0) < 50) {
      items.push(this.createFeedbackItem('milestone', `Halfway there! ${this.state.vocabularyUsedCount}/${this.state.vocabularyRequiredCount} words used`));
    }

    if (items.length > 0) this.notify();
    return items;
  }

  /**
   * Process grammar feedback from an NPC response.
   * Returns new feedback items generated.
   */
  public processGrammarFeedback(feedback: GrammarFeedback): FeedbackItem[] {
    const items: FeedbackItem[] = [];

    if (feedback.status === 'no_target_language') return items;

    if (feedback.status === 'correct') {
      this.state.grammarCorrectCount++;
      // Check if this matches any quest grammar targets
      for (const target of this.state.grammarTargets) {
        target.correctUses++;
      }
      items.push(this.createFeedbackItem('grammar_correct', 'Grammar correct!'));
    } else if (feedback.status === 'corrected') {
      this.state.grammarErrorCount += feedback.errorCount;

      for (const error of feedback.errors) {
        const target = this.grammarLookup.get(error.pattern.toLowerCase());
        if (target) {
          target.incorrectUses++;
          target.lastFeedback = error.explanation;
        }

        items.push(this.createFeedbackItem(
          'grammar_correction',
          `"${error.incorrect}" → "${error.corrected}"`,
          error.explanation,
        ));
      }
    }

    this.updateGrammarAccuracy();
    if (items.length > 0) this.notify();
    return items;
  }

  /**
   * Generate vocabulary hint feedback for words not yet used.
   */
  public getVocabularyHints(maxHints: number = 3): FeedbackItem[] {
    const unused = this.state.vocabularyTargets.filter(t => !t.used);
    if (unused.length === 0) return [];

    return unused.slice(0, maxHints).map(t =>
      this.createFeedbackItem(
        'vocabulary_hint',
        `Try using: "${t.word}"${t.meaning ? ` (${t.meaning})` : ''}`,
      )
    );
  }

  /** Get the current feedback state snapshot. */
  public getState(): QuestLanguageFeedbackState {
    return { ...this.state, recentFeedback: [...this.state.recentFeedback] };
  }

  /** Get vocabulary progress as fraction (0-1). */
  public getVocabularyProgressFraction(): number {
    return this.state.vocabularyRequiredCount > 0
      ? Math.min(1, this.state.vocabularyUsedCount / this.state.vocabularyRequiredCount)
      : 0;
  }

  /** Get grammar accuracy as fraction (0-1). */
  public getGrammarAccuracyFraction(): number {
    const total = this.state.grammarCorrectCount + this.state.grammarErrorCount;
    return total > 0 ? this.state.grammarCorrectCount / total : 1;
  }

  /** Check if all vocabulary targets have been used. */
  public isVocabularyComplete(): boolean {
    if (this.state.vocabularyTargets.length > 0) {
      return this.state.vocabularyTargets.every(t => t.used);
    }
    return this.state.vocabularyRequiredCount > 0
      ? this.state.vocabularyUsedCount >= this.state.vocabularyRequiredCount
      : false;
  }

  // ── Callbacks ─────────────────────────────────────────────────────────────

  public setOnFeedbackUpdate(cb: (state: QuestLanguageFeedbackState) => void): void {
    this.onFeedbackUpdate = cb;
  }

  public setOnFeedbackItem(cb: (item: FeedbackItem) => void): void {
    this.onFeedbackItem = cb;
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private updateVocabularyProgress(): void {
    if (this.state.vocabularyRequiredCount > 0) {
      this.state.vocabularyProgress = Math.min(
        100,
        Math.round((this.state.vocabularyUsedCount / this.state.vocabularyRequiredCount) * 100),
      );
    } else if (this.state.vocabularyTargets.length > 0) {
      const usedCount = this.state.vocabularyTargets.filter(t => t.used).length;
      this.state.vocabularyProgress = Math.round((usedCount / this.state.vocabularyTargets.length) * 100);
    }
  }

  private updateGrammarAccuracy(): void {
    const total = this.state.grammarCorrectCount + this.state.grammarErrorCount;
    this.state.grammarAccuracy = total > 0
      ? Math.round((this.state.grammarCorrectCount / total) * 100)
      : 100;
  }

  private createFeedbackItem(type: FeedbackItem['type'], message: string, detail?: string): FeedbackItem {
    const item: FeedbackItem = {
      id: `qfb_${++this.feedbackIdCounter}`,
      type,
      message,
      detail,
      timestamp: Date.now(),
    };
    this.state.recentFeedback.push(item);
    // Keep last 20 items
    if (this.state.recentFeedback.length > 20) {
      this.state.recentFeedback.shift();
    }
    this.onFeedbackItem?.(item);
    return item;
  }

  private notify(): void {
    this.onFeedbackUpdate?.(this.getState());
  }
}

/**
 * Extract vocabulary words and grammar patterns from quest objectives.
 * Utility for initializing the tracker from quest data.
 */
export function extractQuestLanguageTargets(objectives: QuestObjective[]): {
  vocabularyWords: string[];
  grammarPatterns: string[];
  vocabularyRequired: number;
} {
  const vocabularyWords: string[] = [];
  const grammarPatterns: string[] = [];
  let vocabularyRequired = 0;

  for (const obj of objectives) {
    if (obj.vocabularyWords) {
      vocabularyWords.push(...obj.vocabularyWords);
      vocabularyRequired += obj.required ?? obj.vocabularyWords.length;
    }
    if (obj.grammarPatterns) {
      grammarPatterns.push(...obj.grammarPatterns);
    }
    if (obj.type === 'use_vocabulary' && !obj.vocabularyWords) {
      vocabularyRequired += obj.required ?? 5;
    }
  }

  return {
    vocabularyWords: Array.from(new Set(vocabularyWords)),
    grammarPatterns: Array.from(new Set(grammarPatterns)),
    vocabularyRequired,
  };
}
