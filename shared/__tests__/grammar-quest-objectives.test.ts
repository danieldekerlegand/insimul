import { describe, it, expect } from 'vitest';
import {
  GrammarTriggerAnalyzer,
  formatImmersiveCorrection,
  formatImmersiveCorrections,
  buildGrammarCorrectionPrompt,
  extractGrammarFocus,
  isGrammarFocusedObjective,
} from '../language/grammar-quest-objectives';
import type { GrammarFeedback, GrammarCorrection } from '../language/progress';
import {
  QuestLanguageFeedbackTracker,
  type QuestObjective,
} from '../language/quest-language-feedback';
import { normalizeObjectiveType } from '../quest-objective-types';
import { QUEST_TEMPLATES, getTemplatesByCategory } from '../language/quest-templates';
import { getSeedsByCategory, getSeedById } from '../language/quest-seed-library';

// ── GrammarTriggerAnalyzer ──────────────────────────────────────────────────

describe('GrammarTriggerAnalyzer', () => {
  function makeAnalyzer(objectives: Array<{ type: string; grammarFocus?: string; grammarPatterns?: string[] }>) {
    return new GrammarTriggerAnalyzer(objectives);
  }

  describe('initialization', () => {
    it('creates progress entries for grammar-focused objectives', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
        { type: 'visit_location' }, // no grammar focus
      ]);

      const progress = analyzer.getAllProgress();
      expect(progress).toHaveLength(1);
      expect(progress[0].objectiveIndex).toBe(0);
      expect(progress[0].grammarFocus).toBe('past_tense');
    });

    it('skips objectives without grammar focus', () => {
      const analyzer = makeAnalyzer([
        { type: 'visit_location' },
        { type: 'talk_to_npc' },
      ]);

      expect(analyzer.getAllProgress()).toHaveLength(0);
    });

    it('parses comma-separated grammar patterns', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'formal', grammarPatterns: ['formal register', 'polite forms'] },
      ]);

      const progress = analyzer.getObjectiveProgress(0)!;
      expect(progress.patterns).toHaveLength(2);
      expect(progress.patterns[0].pattern).toBe('formal register');
      expect(progress.patterns[1].pattern).toBe('polite forms');
    });
  });

  describe('processGrammarFeedback', () => {
    it('increments correct count on correct feedback', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      const indices = analyzer.processGrammarFeedback({
        status: 'correct',
        errors: [],
        errorCount: 0,
        timestamp: Date.now(),
      });

      expect(indices).toEqual([0]);
      const progress = analyzer.getObjectiveProgress(0)!;
      expect(progress.totalCorrect).toBe(1);
      expect(progress.accuracy).toBe(100);
    });

    it('tracks errors matching grammar patterns', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      analyzer.processGrammarFeedback({
        status: 'corrected',
        errors: [{
          pattern: 'past tense',
          incorrect: 'je suis aller',
          corrected: 'je suis allé',
          explanation: 'past participle agreement',
        }],
        errorCount: 1,
        timestamp: Date.now(),
      });

      const progress = analyzer.getObjectiveProgress(0)!;
      expect(progress.totalErrors).toBe(1);
      expect(progress.patterns[0].incorrectUses).toBe(1);
      expect(progress.patterns[0].lastFeedback).toBe('past participle agreement');
    });

    it('ignores no_target_language feedback', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      const indices = analyzer.processGrammarFeedback({
        status: 'no_target_language',
        errors: [],
        errorCount: 0,
        timestamp: Date.now(),
      });

      expect(indices).toEqual([]);
    });

    it('calculates accuracy across multiple turns', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'questions', grammarPatterns: ['question formation'] },
      ]);

      // 2 correct
      analyzer.processGrammarFeedback({ status: 'correct', errors: [], errorCount: 0, timestamp: Date.now() });
      analyzer.processGrammarFeedback({ status: 'correct', errors: [], errorCount: 0, timestamp: Date.now() });
      // 1 error
      analyzer.processGrammarFeedback({
        status: 'corrected',
        errors: [{ pattern: 'question formation', incorrect: 'Tu vas où?', corrected: 'Où vas-tu?', explanation: 'inversion' }],
        errorCount: 1,
        timestamp: Date.now(),
      });

      const progress = analyzer.getObjectiveProgress(0)!;
      expect(progress.totalCorrect).toBe(2);
      expect(progress.totalErrors).toBe(1);
      expect(progress.accuracy).toBe(67); // 2/3
    });

    it('matches patterns case-insensitively', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'tense', grammarPatterns: ['Past Tense'] },
      ]);

      analyzer.processGrammarFeedback({
        status: 'corrected',
        errors: [{ pattern: 'past tense', incorrect: 'x', corrected: 'y', explanation: 'test' }],
        errorCount: 1,
        timestamp: Date.now(),
      });

      expect(analyzer.getObjectiveProgress(0)!.patterns[0].incorrectUses).toBe(1);
    });

    it('matches patterns with partial overlap', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'tense', grammarPatterns: ['past tense'] },
      ]);

      analyzer.processGrammarFeedback({
        status: 'corrected',
        errors: [{ pattern: 'past tense conjugation', incorrect: 'x', corrected: 'y', explanation: 'test' }],
        errorCount: 1,
        timestamp: Date.now(),
      });

      expect(analyzer.getObjectiveProgress(0)!.patterns[0].incorrectUses).toBe(1);
    });
  });

  describe('recordCorrectUsage', () => {
    it('records a correct usage for matching pattern', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      const indices = analyzer.recordCorrectUsage('past tense', 'je suis allé');
      expect(indices).toEqual([0]);

      const progress = analyzer.getObjectiveProgress(0)!;
      expect(progress.patterns[0].correctUses).toBe(1);
      expect(progress.patterns[0].examples.correct).toContain('je suis allé');
    });

    it('returns empty when no patterns match', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      const indices = analyzer.recordCorrectUsage('subjunctive');
      expect(indices).toEqual([]);
    });
  });

  describe('isObjectiveComplete', () => {
    it('returns true when accuracy and count thresholds met', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      // 4 correct, 1 error = 80% accuracy
      for (let i = 0; i < 4; i++) {
        analyzer.processGrammarFeedback({ status: 'correct', errors: [], errorCount: 0, timestamp: Date.now() });
      }
      analyzer.processGrammarFeedback({
        status: 'corrected',
        errors: [{ pattern: 'past tense', incorrect: 'x', corrected: 'y', explanation: 'z' }],
        errorCount: 1,
        timestamp: Date.now(),
      });

      expect(analyzer.isObjectiveComplete(0, 60, 3)).toBe(true);
    });

    it('returns false when accuracy too low', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      // 1 correct, 3 errors = 25% accuracy
      analyzer.processGrammarFeedback({ status: 'correct', errors: [], errorCount: 0, timestamp: Date.now() });
      for (let i = 0; i < 3; i++) {
        analyzer.processGrammarFeedback({
          status: 'corrected',
          errors: [{ pattern: 'past tense', incorrect: 'x', corrected: 'y', explanation: 'z' }],
          errorCount: 1,
          timestamp: Date.now(),
        });
      }

      expect(analyzer.isObjectiveComplete(0, 60, 1)).toBe(false);
    });

    it('returns false when not enough correct uses', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      analyzer.processGrammarFeedback({ status: 'correct', errors: [], errorCount: 0, timestamp: Date.now() });

      expect(analyzer.isObjectiveComplete(0, 60, 5)).toBe(false);
    });

    it('returns false with no data', () => {
      const analyzer = makeAnalyzer([
        { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
      ]);

      expect(analyzer.isObjectiveComplete(0)).toBe(false);
    });

    it('returns false for non-existent objective', () => {
      const analyzer = makeAnalyzer([]);
      expect(analyzer.isObjectiveComplete(99)).toBe(false);
    });
  });
});

// ── Immersive Corrections ───────────────────────────────────────────────────

describe('formatImmersiveCorrection', () => {
  it('produces a string containing the corrected form', () => {
    const result = formatImmersiveCorrection({
      pattern: 'past tense',
      incorrect: 'je suis aller',
      corrected: 'je suis allé',
      explanation: 'past participle agreement',
    });

    expect(result).toContain('je suis allé');
  });
});

describe('formatImmersiveCorrections', () => {
  it('returns empty for no corrections', () => {
    expect(formatImmersiveCorrections([])).toBe('');
  });

  it('formats single correction', () => {
    const result = formatImmersiveCorrections([{
      pattern: 'articles',
      incorrect: 'le eau',
      corrected: "l'eau",
      explanation: 'elision before vowels',
    }]);

    expect(result).toContain("l'eau");
  });

  it('formats multiple corrections with follow-ups', () => {
    const result = formatImmersiveCorrections([
      { pattern: 'articles', incorrect: 'le eau', corrected: "l'eau", explanation: 'elision' },
      { pattern: 'verb', incorrect: 'je mangé', corrected: "j'ai mangé", explanation: 'auxiliary' },
    ]);

    expect(result).toContain("l'eau");
    expect(result).toContain("j'ai mangé");
  });
});

describe('buildGrammarCorrectionPrompt', () => {
  it('includes grammar focus and patterns', () => {
    const prompt = buildGrammarCorrectionPrompt('past_tense', ['past tense', 'verb conjugation']);

    expect(prompt).toContain('past_tense');
    expect(prompt).toContain('past tense');
    expect(prompt).toContain('verb conjugation');
    expect(prompt).toContain('correct form');
  });
});

// ── extractGrammarFocus / isGrammarFocusedObjective ─────────────────────────

describe('extractGrammarFocus', () => {
  it('extracts config from objective with grammarFocus', () => {
    const config = extractGrammarFocus({
      type: 'complete_conversation',
      grammarFocus: 'past_tense',
      grammarPatterns: ['past tense', 'verb conjugation'],
    });

    expect(config).not.toBeNull();
    expect(config!.grammarFocus).toBe('past_tense');
    expect(config!.grammarPatterns).toEqual(['past tense', 'verb conjugation']);
  });

  it('returns null for non-grammar objective', () => {
    expect(extractGrammarFocus({ type: 'visit_location' })).toBeNull();
  });

  it('parses comma-separated pattern string', () => {
    const config = extractGrammarFocus({
      grammarFocus: 'formal',
      grammarPatterns: 'formal register,polite forms',
    });

    expect(config!.grammarPatterns).toEqual(['formal register', 'polite forms']);
  });
});

describe('isGrammarFocusedObjective', () => {
  it('returns true for grammar-focused objectives', () => {
    expect(isGrammarFocusedObjective({ grammarFocus: 'past_tense' })).toBe(true);
    expect(isGrammarFocusedObjective({ grammarPatterns: ['past tense'] })).toBe(true);
  });

  it('returns false for non-grammar objectives', () => {
    expect(isGrammarFocusedObjective({ type: 'visit_location' })).toBe(false);
  });
});

// ── Integration: QuestLanguageFeedbackTracker + grammar focus ───────────────

describe('QuestLanguageFeedbackTracker grammar integration', () => {
  function makeTracker(objectives: QuestObjective[]) {
    return new QuestLanguageFeedbackTracker('quest_1', 'Grammar Quest', 'grammar', objectives);
  }

  it('initializes grammar analyzer for grammar-focused objectives', () => {
    const tracker = makeTracker([
      { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
    ]);

    const progress = tracker.getGrammarObjectiveProgress();
    expect(progress).not.toBeNull();
    expect(progress!).toHaveLength(1);
    expect(progress![0].grammarFocus).toBe('past_tense');
  });

  it('returns null for quests without grammar focus', () => {
    const tracker = makeTracker([
      { type: 'use_vocabulary', vocabularyWords: ['bonjour'] },
    ]);

    expect(tracker.getGrammarObjectiveProgress()).toBeNull();
  });

  it('feeds grammar feedback into per-objective analyzer', () => {
    const tracker = makeTracker([
      { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
    ]);

    tracker.processGrammarFeedback({
      status: 'correct', errors: [], errorCount: 0, timestamp: Date.now(),
    });
    tracker.processGrammarFeedback({
      status: 'correct', errors: [], errorCount: 0, timestamp: Date.now(),
    });
    tracker.processGrammarFeedback({
      status: 'correct', errors: [], errorCount: 0, timestamp: Date.now(),
    });

    const progress = tracker.getGrammarObjectiveProgress()!;
    expect(progress[0].totalCorrect).toBe(3);
    expect(progress[0].accuracy).toBe(100);
  });

  it('checks grammar objective completion', () => {
    const tracker = makeTracker([
      { type: 'complete_conversation', grammarFocus: 'past_tense', grammarPatterns: ['past tense'] },
    ]);

    // Not complete yet
    expect(tracker.isGrammarObjectiveComplete(0, 60, 3)).toBe(false);

    // Add 4 correct
    for (let i = 0; i < 4; i++) {
      tracker.processGrammarFeedback({ status: 'correct', errors: [], errorCount: 0, timestamp: Date.now() });
    }

    expect(tracker.isGrammarObjectiveComplete(0, 60, 3)).toBe(true);
  });

  it('initializes grammar targets from grammarFocus without grammarPatterns', () => {
    const tracker = makeTracker([
      { type: 'complete_conversation', grammarFocus: 'question_formation' },
    ]);

    const state = tracker.getState();
    expect(state.grammarTargets).toHaveLength(1);
    expect(state.grammarTargets[0].pattern).toBe('question_formation');
  });
});

// ── Normalization: grammar aliases ──────────────────────────────────────────

describe('grammar objective type normalization', () => {
  it('normalizes grammar_pattern to use_vocabulary', () => {
    expect(normalizeObjectiveType('grammar_pattern')).toBe('use_vocabulary');
  });

  it('normalizes grammar_practice to use_vocabulary', () => {
    expect(normalizeObjectiveType('grammar_practice')).toBe('use_vocabulary');
  });

  it('normalizes grammar_conversation to complete_conversation', () => {
    expect(normalizeObjectiveType('grammar_conversation')).toBe('complete_conversation');
  });

  it('normalizes grammar_focus to complete_conversation', () => {
    expect(normalizeObjectiveType('grammar_focus')).toBe('complete_conversation');
  });

  it('normalizes conjugation to use_vocabulary', () => {
    expect(normalizeObjectiveType('conjugation')).toBe('use_vocabulary');
  });
});

// ── Quest Templates & Seeds ─────────────────────────────────────────────────

describe('grammar quest templates', () => {
  it('includes Past Tense Tales template', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'past_tense_tales');
    expect(template).toBeDefined();
    expect(template!.category).toBe('grammar');
    expect(template!.difficulty).toBe('intermediate');
    expect(template!.objectiveTemplates.length).toBeGreaterThanOrEqual(1);
  });

  it('includes Question Master template', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'question_master');
    expect(template).toBeDefined();
    expect(template!.category).toBe('grammar');
  });

  it('includes Polite Requests template', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'polite_requests');
    expect(template).toBeDefined();
    expect(template!.category).toBe('grammar');
  });

  it('getTemplatesByCategory returns all grammar templates', () => {
    const grammarTemplates = getTemplatesByCategory('grammar');
    expect(grammarTemplates.length).toBeGreaterThanOrEqual(4); // grammar_practice + 3 new
  });

  it('grammar templates use canonical objective types', () => {
    const grammarTemplates = getTemplatesByCategory('grammar');
    const validTypes = new Set(['complete_conversation', 'use_vocabulary']);
    for (const t of grammarTemplates) {
      for (const obj of t.objectiveTemplates) {
        expect(validTypes.has(obj.type)).toBe(true);
      }
    }
  });
});

describe('grammar quest seeds', () => {
  it('includes past_tense_tales seed', () => {
    const seed = getSeedById('past_tense_tales');
    expect(seed).toBeDefined();
    expect(seed!.category).toBe('grammar');
    expect(seed!.tags).toContain('past_tense');
  });

  it('includes question_master seed', () => {
    const seed = getSeedById('question_master');
    expect(seed).toBeDefined();
    expect(seed!.category).toBe('grammar');
    expect(seed!.tags).toContain('questions');
  });

  it('includes polite_requests seed', () => {
    const seed = getSeedById('polite_requests');
    expect(seed).toBeDefined();
    expect(seed!.category).toBe('grammar');
    expect(seed!.tags).toContain('polite_forms');
  });

  it('getSeedsByCategory returns all grammar seeds', () => {
    const grammarSeeds = getSeedsByCategory('grammar');
    expect(grammarSeeds.length).toBeGreaterThanOrEqual(5); // 2 original + 3 new
  });

  it('grammar seeds include grammar focus metadata in objectives', () => {
    const seed = getSeedById('past_tense_tales')!;
    const hasGrammarFocus = seed.objectiveTemplates.some(
      o => o.extra && ('grammarFocus' in o.extra || 'grammarPatterns' in o.extra),
    );
    expect(hasGrammarFocus).toBe(true);
  });
});
