import { describe, it, expect } from 'vitest';
import {
  FRENCH_GRAMMAR_PATTERNS,
  getPatternsByDifficulty,
  getPatternsByCategory,
  getPatternById,
  getPatternsByTag,
  toGrammarPattern,
  toGrammarFocusConfig,
} from '@shared/language/french-grammar-patterns';
import type { FrenchGrammarPatternDef } from '@shared/language/french-grammar-patterns';

describe('FRENCH_GRAMMAR_PATTERNS corpus', () => {
  it('contains at least 20 patterns', () => {
    expect(FRENCH_GRAMMAR_PATTERNS.length).toBeGreaterThanOrEqual(20);
  });

  it('has unique ids', () => {
    const ids = FRENCH_GRAMMAR_PATTERNS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every pattern has required fields', () => {
    for (const p of FRENCH_GRAMMAR_PATTERNS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.difficulty).toBeTruthy();
      expect(p.explanation.length).toBeGreaterThan(20);
      expect(p.examples.length).toBeGreaterThanOrEqual(2);
      expect(p.commonErrors.length).toBeGreaterThanOrEqual(1);
      expect(p.patternTags.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every example has both french and english', () => {
    for (const p of FRENCH_GRAMMAR_PATTERNS) {
      for (const ex of p.examples) {
        expect(ex.french).toBeTruthy();
        expect(ex.english).toBeTruthy();
      }
    }
  });

  it('every commonError has incorrect, correct, and why', () => {
    for (const p of FRENCH_GRAMMAR_PATTERNS) {
      for (const err of p.commonErrors) {
        expect(err.incorrect).toBeTruthy();
        expect(err.correct).toBeTruthy();
        expect(err.why).toBeTruthy();
      }
    }
  });

  it('covers all three difficulty levels', () => {
    const difficulties = new Set(FRENCH_GRAMMAR_PATTERNS.map(p => p.difficulty));
    expect(difficulties).toContain('beginner');
    expect(difficulties).toContain('intermediate');
    expect(difficulties).toContain('advanced');
  });

  it('covers multiple categories', () => {
    const categories = new Set(FRENCH_GRAMMAR_PATTERNS.map(p => p.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
  });
});

describe('getPatternsByDifficulty', () => {
  it('returns only beginner patterns', () => {
    const results = getPatternsByDifficulty('beginner');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.difficulty === 'beginner')).toBe(true);
  });

  it('returns only advanced patterns', () => {
    const results = getPatternsByDifficulty('advanced');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.difficulty === 'advanced')).toBe(true);
  });
});

describe('getPatternsByCategory', () => {
  it('returns verb patterns', () => {
    const results = getPatternsByCategory('verbs');
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results.every(p => p.category === 'verbs')).toBe(true);
  });

  it('returns article patterns', () => {
    const results = getPatternsByCategory('articles');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every(p => p.category === 'articles')).toBe(true);
  });
});

describe('getPatternById', () => {
  it('finds a known pattern', () => {
    const result = getPatternById('past_tense_passe_compose');
    expect(result).toBeDefined();
    expect(result!.name).toBe('Passé Composé');
  });

  it('returns undefined for unknown id', () => {
    expect(getPatternById('nonexistent_pattern')).toBeUndefined();
  });
});

describe('getPatternsByTag', () => {
  it('finds patterns matching "past tense"', () => {
    const results = getPatternsByTag('past tense');
    expect(results.length).toBeGreaterThanOrEqual(2);
    const ids = results.map(p => p.id);
    expect(ids).toContain('past_tense_passe_compose');
    expect(ids).toContain('imparfait');
  });

  it('finds patterns matching "verb conjugation"', () => {
    const results = getPatternsByTag('verb conjugation');
    expect(results.length).toBeGreaterThanOrEqual(4);
  });

  it('finds patterns matching "article agreement"', () => {
    const results = getPatternsByTag('article agreement');
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('is case-insensitive', () => {
    const lower = getPatternsByTag('negation');
    const upper = getPatternsByTag('NEGATION');
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBeGreaterThan(0);
  });
});

describe('toGrammarPattern', () => {
  let def: FrenchGrammarPatternDef;

  beforeAll(() => {
    def = getPatternById('present_tense')!;
  });

  it('converts to GrammarPattern shape', () => {
    const result = toGrammarPattern(def);
    expect(result.id).toBe('present_tense');
    expect(result.pattern).toBe('Present Tense Conjugation');
    expect(result.language).toBe('fr');
    expect(result.timesUsedCorrectly).toBe(0);
    expect(result.timesUsedIncorrectly).toBe(0);
    expect(result.mastered).toBe(false);
  });

  it('includes French examples', () => {
    const result = toGrammarPattern(def);
    expect(result.examples.length).toBeGreaterThan(0);
    expect(result.examples[0]).toBe('Je parle français.');
  });

  it('includes explanation', () => {
    const result = toGrammarPattern(def);
    expect(result.explanations.length).toBe(1);
    expect(result.explanations[0]).toContain('-er');
  });
});

describe('toGrammarFocusConfig', () => {
  it('builds a GrammarFocusConfig from a pattern def', () => {
    const def = getPatternById('question_formation')!;
    const config = toGrammarFocusConfig(def);
    expect(config.grammarFocus).toBe('question_formation');
    expect(config.grammarPatterns).toContain('question formation');
    expect(config.requiredAccuracy).toBe(70);
    expect(config.requiredCorrectUses).toBe(5);
  });

  it('accepts custom accuracy and correct uses', () => {
    const def = getPatternById('subjunctive')!;
    const config = toGrammarFocusConfig(def, 90, 10);
    expect(config.requiredAccuracy).toBe(90);
    expect(config.requiredCorrectUses).toBe(10);
  });
});
