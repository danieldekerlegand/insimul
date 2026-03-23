import { describe, it, expect, vi } from 'vitest';
import {
  QuestLanguageFeedbackTracker,
  extractQuestLanguageTargets,
  type QuestObjective,
  type FeedbackItem,
  type QuestLanguageFeedbackState,
} from '../language/quest-language-feedback';
import type { GrammarFeedback, VocabularyUsage } from '../language/progress';

// ── Test helpers ────────────────────────────────────────────────────────────

function makeObjectives(overrides: Partial<QuestObjective>[] = []): QuestObjective[] {
  return overrides.map((o, i) => ({
    type: o.type ?? 'use_vocabulary',
    description: o.description ?? `Objective ${i}`,
    required: o.required,
    vocabularyWords: o.vocabularyWords,
    grammarPatterns: o.grammarPatterns,
    category: o.category,
    target: o.target,
  }));
}

function makeTracker(objectives: QuestObjective[], vocabMeanings?: Record<string, string>) {
  return new QuestLanguageFeedbackTracker(
    'quest_1',
    'Test Quest',
    'vocabulary',
    objectives,
    vocabMeanings,
  );
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('QuestLanguageFeedbackTracker', () => {
  describe('initialization', () => {
    it('initializes vocabulary targets from objectives', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour', 'merci', 'eau'], required: 3 },
      ]));
      const state = tracker.getState();
      expect(state.vocabularyTargets).toHaveLength(3);
      expect(state.vocabularyRequiredCount).toBe(3);
      expect(state.vocabularyProgress).toBe(0);
    });

    it('initializes grammar targets from objectives', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'practice_grammar', grammarPatterns: ['subject-verb agreement', 'article usage'] },
      ]));
      const state = tracker.getState();
      expect(state.grammarTargets).toHaveLength(2);
      expect(state.grammarTargets[0].pattern).toBe('subject-verb agreement');
    });

    it('deduplicates vocabulary targets', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour', 'merci'], required: 2 },
        { type: 'use_vocabulary', vocabularyWords: ['bonjour', 'eau'], required: 2 },
      ]));
      const state = tracker.getState();
      expect(state.vocabularyTargets).toHaveLength(3); // bonjour, merci, eau
      expect(state.vocabularyRequiredCount).toBe(4); // 2 + 2
    });

    it('includes vocab meanings when provided', () => {
      const tracker = makeTracker(
        makeObjectives([{ type: 'use_vocabulary', vocabularyWords: ['bonjour'] }]),
        { bonjour: 'hello' },
      );
      expect(tracker.getState().vocabularyTargets[0].meaning).toBe('hello');
    });

    it('infers vocabulary required count from objective type', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', required: 7 },
      ]));
      expect(tracker.getState().vocabularyRequiredCount).toBe(7);
    });
  });

  describe('processVocabularyUsage', () => {
    it('marks targeted vocabulary as used', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour', 'merci'], required: 2 },
      ]));

      const items = tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);

      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].type).toBe('vocabulary_used');
      expect(items[0].message).toContain('bonjour');

      const state = tracker.getState();
      expect(state.vocabularyUsedCount).toBe(1);
      expect(state.vocabularyProgress).toBe(50);
      expect(state.vocabularyTargets[0].used).toBe(true);
    });

    it('completes vocabulary and emits milestone', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour', 'merci'], required: 2 },
      ]));

      tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);
      const items = tracker.processVocabularyUsage([
        { word: 'merci', meaning: 'thanks', usedCorrectly: true },
      ]);

      const milestone = items.find(i => i.type === 'milestone');
      expect(milestone).toBeDefined();
      expect(milestone!.message).toContain('complete');
      expect(tracker.getState().vocabularyProgress).toBe(100);
    });

    it('does not double-count the same word', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour'], required: 1 },
      ]));

      tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);
      const items = tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);

      // Second usage should not generate a vocabulary_used item
      expect(items.filter(i => i.type === 'vocabulary_used')).toHaveLength(0);
      expect(tracker.getState().vocabularyTargets[0].usageCount).toBe(2);
    });

    it('tracks non-target vocabulary toward general count', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', required: 3 },
      ]));

      tracker.processVocabularyUsage([
        { word: 'arbitrary', meaning: 'test', usedCorrectly: true },
      ]);

      expect(tracker.getState().vocabularyUsedCount).toBe(1);
    });

    it('is case-insensitive for vocabulary matching', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['Bonjour'], required: 1 },
      ]));

      const items = tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);

      expect(items.some(i => i.type === 'vocabulary_used')).toBe(true);
    });
  });

  describe('processGrammarFeedback', () => {
    it('records correct grammar', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'practice_grammar', grammarPatterns: ['article usage'] },
      ]));

      const items = tracker.processGrammarFeedback({
        status: 'correct',
        errors: [],
        errorCount: 0,
        timestamp: Date.now(),
      });

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('grammar_correct');
      expect(tracker.getState().grammarCorrectCount).toBe(1);
      expect(tracker.getState().grammarAccuracy).toBe(100);
    });

    it('records grammar corrections', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'practice_grammar', grammarPatterns: ['article usage'] },
      ]));

      const items = tracker.processGrammarFeedback({
        status: 'corrected',
        errors: [
          {
            pattern: 'article usage',
            incorrect: 'le eau',
            corrected: "l'eau",
            explanation: 'Use elision before vowels',
          },
        ],
        errorCount: 1,
        timestamp: Date.now(),
      });

      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('grammar_correction');
      expect(items[0].message).toContain('le eau');
      expect(tracker.getState().grammarErrorCount).toBe(1);
      expect(tracker.getState().grammarAccuracy).toBe(0);
    });

    it('tracks grammar accuracy across multiple turns', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'practice_grammar', grammarPatterns: ['general'] },
      ]));

      tracker.processGrammarFeedback({
        status: 'correct', errors: [], errorCount: 0, timestamp: Date.now(),
      });
      tracker.processGrammarFeedback({
        status: 'correct', errors: [], errorCount: 0, timestamp: Date.now(),
      });
      tracker.processGrammarFeedback({
        status: 'corrected',
        errors: [{ pattern: 'verb', incorrect: 'je suis aller', corrected: 'je suis allé', explanation: 'past participle' }],
        errorCount: 1,
        timestamp: Date.now(),
      });

      // 2 correct, 1 error => 67% accuracy
      expect(tracker.getState().grammarAccuracy).toBe(67);
    });

    it('ignores no_target_language feedback', () => {
      const tracker = makeTracker(makeObjectives([]));

      const items = tracker.processGrammarFeedback({
        status: 'no_target_language',
        errors: [],
        errorCount: 0,
        timestamp: Date.now(),
      });

      expect(items).toHaveLength(0);
      expect(tracker.getState().grammarCorrectCount).toBe(0);
    });

    it('updates quest grammar target for matching pattern', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'practice_grammar', grammarPatterns: ['article usage'] },
      ]));

      tracker.processGrammarFeedback({
        status: 'corrected',
        errors: [
          { pattern: 'article usage', incorrect: 'le eau', corrected: "l'eau", explanation: 'elision' },
        ],
        errorCount: 1,
        timestamp: Date.now(),
      });

      const target = tracker.getState().grammarTargets.find(t => t.pattern === 'article usage');
      expect(target?.incorrectUses).toBe(1);
      expect(target?.lastFeedback).toBe('elision');
    });
  });

  describe('getVocabularyHints', () => {
    it('returns hints for unused target words', () => {
      const tracker = makeTracker(
        makeObjectives([
          { type: 'use_vocabulary', vocabularyWords: ['bonjour', 'merci', 'eau'] },
        ]),
        { bonjour: 'hello', merci: 'thanks', eau: 'water' },
      );

      const hints = tracker.getVocabularyHints(2);
      expect(hints).toHaveLength(2);
      expect(hints[0].type).toBe('vocabulary_hint');
      expect(hints[0].message).toContain('bonjour');
    });

    it('returns empty when all words used', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour'], required: 1 },
      ]));

      tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);

      expect(tracker.getVocabularyHints()).toHaveLength(0);
    });
  });

  describe('callbacks', () => {
    it('calls onFeedbackUpdate when vocab used', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour'], required: 1 },
      ]));
      const cb = vi.fn();
      tracker.setOnFeedbackUpdate(cb);

      tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);

      expect(cb).toHaveBeenCalledTimes(1);
      const state: QuestLanguageFeedbackState = cb.mock.calls[0][0];
      expect(state.vocabularyUsedCount).toBe(1);
    });

    it('calls onFeedbackItem for each new item', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'practice_grammar', grammarPatterns: ['general'] },
      ]));
      const cb = vi.fn();
      tracker.setOnFeedbackItem(cb);

      tracker.processGrammarFeedback({
        status: 'correct', errors: [], errorCount: 0, timestamp: Date.now(),
      });

      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb.mock.calls[0][0].type).toBe('grammar_correct');
    });
  });

  describe('utility getters', () => {
    it('isVocabularyComplete returns true when all targets used', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['bonjour'], required: 1 },
      ]));

      expect(tracker.isVocabularyComplete()).toBe(false);

      tracker.processVocabularyUsage([
        { word: 'bonjour', meaning: 'hello', usedCorrectly: true },
      ]);

      expect(tracker.isVocabularyComplete()).toBe(true);
    });

    it('getGrammarAccuracyFraction returns 1 with no data', () => {
      const tracker = makeTracker(makeObjectives([]));
      expect(tracker.getGrammarAccuracyFraction()).toBe(1);
    });

    it('getVocabularyProgressFraction returns correct value', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'use_vocabulary', vocabularyWords: ['a', 'b', 'c', 'd'], required: 4 },
      ]));

      tracker.processVocabularyUsage([
        { word: 'a', meaning: '', usedCorrectly: true },
      ]);

      expect(tracker.getVocabularyProgressFraction()).toBe(0.25);
    });
  });

  describe('recent feedback limit', () => {
    it('caps recent feedback at 20 items', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'practice_grammar', grammarPatterns: ['general'] },
      ]));

      for (let i = 0; i < 25; i++) {
        tracker.processGrammarFeedback({
          status: 'correct', errors: [], errorCount: 0, timestamp: Date.now(),
        });
      }

      expect(tracker.getState().recentFeedback.length).toBeLessThanOrEqual(20);
    });
  });
});

describe('extractQuestLanguageTargets', () => {
  it('extracts vocabulary words from multiple objectives', () => {
    const result = extractQuestLanguageTargets([
      { type: 'use_vocabulary', vocabularyWords: ['a', 'b'], required: 2 },
      { type: 'use_vocabulary', vocabularyWords: ['b', 'c'], required: 2 },
    ]);

    expect(result.vocabularyWords).toEqual(['a', 'b', 'c']); // deduplicated
    expect(result.vocabularyRequired).toBe(4);
  });

  it('extracts grammar patterns', () => {
    const result = extractQuestLanguageTargets([
      { type: 'practice_grammar', grammarPatterns: ['past tense', 'articles'] },
    ]);

    expect(result.grammarPatterns).toEqual(['past tense', 'articles']);
  });

  it('handles objectives with no language targets', () => {
    const result = extractQuestLanguageTargets([
      { type: 'visit_location' },
      { type: 'talk_to_npc' },
    ]);

    expect(result.vocabularyWords).toEqual([]);
    expect(result.grammarPatterns).toEqual([]);
    expect(result.vocabularyRequired).toBe(0);
  });

  it('infers vocabulary required from use_vocabulary without words', () => {
    const result = extractQuestLanguageTargets([
      { type: 'use_vocabulary', required: 10 },
    ]);

    expect(result.vocabularyRequired).toBe(10);
  });
});
