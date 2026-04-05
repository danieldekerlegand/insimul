import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFrequencyRange,
  loadFrequencyData,
  isWordInFrequencyRange,
  validateVocabularyFrequency,
  buildFrequencyDirective,
  buildVocabularyRangeSummary,
} from '../language/vocabulary-frequency';
import {
  buildLanguageModeDirective,
  getNPCLanguageBehavior,
  getCEFRTextComplexity,
} from '../language/cefr-adaptation';

// ── Frequency Range Mapping ────────────────────────────────��────────────────

describe('getFrequencyRange', () => {
  it('A1 maps to top 200 words', () => {
    const range = getFrequencyRange('A1');
    expect(range.max).toBe(200);
    expect(range.label).toContain('200');
  });

  it('A2 maps to top 500 words', () => {
    const range = getFrequencyRange('A2');
    expect(range.max).toBe(500);
    expect(range.label).toContain('500');
  });

  it('B1 maps to top 1500 words', () => {
    const range = getFrequencyRange('B1');
    expect(range.max).toBe(1500);
    expect(range.label).toContain('1500');
  });

  it('B2 is unrestricted', () => {
    const range = getFrequencyRange('B2');
    expect(range.max).toBe(Infinity);
    expect(range.label).toContain('unrestricted');
  });

  it('all ranges have descriptions', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
      const range = getFrequencyRange(level);
      expect(range.description.length).toBeGreaterThan(10);
    }
  });
});

// ── Frequency Data Loading and Lookup ───────────────────────────────────────

describe('isWordInFrequencyRange', () => {
  beforeEach(() => {
    loadFrequencyData('fr', {
      A1: ['bonjour', 'merci', 'oui', 'non', 'eau', 'pain', 'maison'],
      A2: ['restaurant', 'boulangerie', 'pharmacie', 'gare', 'hôpital'],
      B1: ['administration', 'développement', 'environnement'],
      B2: ['abstraction', 'ambiguïté', 'épanouissement'],
    });
  });

  it('A1 word is in range for A1 level', () => {
    expect(isWordInFrequencyRange('bonjour', 'A1', 'fr')).toBe(true);
  });

  it('A2 word is NOT in range for A1 level', () => {
    expect(isWordInFrequencyRange('restaurant', 'A1', 'fr')).toBe(false);
  });

  it('A1 word is in range for A2 level (cumulative)', () => {
    expect(isWordInFrequencyRange('bonjour', 'A2', 'fr')).toBe(true);
  });

  it('A2 word is in range for A2 level', () => {
    expect(isWordInFrequencyRange('restaurant', 'A2', 'fr')).toBe(true);
  });

  it('B1 word is in range for B1 level', () => {
    expect(isWordInFrequencyRange('développement', 'B1', 'fr')).toBe(true);
  });

  it('B1 word is NOT in range for A2', () => {
    expect(isWordInFrequencyRange('développement', 'A2', 'fr')).toBe(false);
  });

  it('B2 level is always unrestricted', () => {
    expect(isWordInFrequencyRange('anything', 'B2', 'fr')).toBe(true);
  });

  it('unknown language fails open', () => {
    expect(isWordInFrequencyRange('hello', 'A1', 'de')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isWordInFrequencyRange('BONJOUR', 'A1', 'fr')).toBe(true);
    expect(isWordInFrequencyRange('Restaurant', 'A2', 'fr')).toBe(true);
  });
});

// ── Text Validation ─────────────────────────────────────────────────────────

describe('validateVocabularyFrequency', () => {
  beforeEach(() => {
    loadFrequencyData('fr', {
      A1: ['bonjour', 'merci', 'le', 'pain', 'est', 'bon'],
      A2: ['restaurant', 'boulangerie'],
      B1: ['administration'],
      B2: ['abstraction'],
    });
  });

  it('returns valid for text within A1 range', () => {
    const result = validateVocabularyFrequency('Bonjour, le pain est bon!', 'A1', 'fr');
    expect(result.valid).toBe(true);
    expect(result.outOfRangeWords).toHaveLength(0);
  });

  it('detects out-of-range words for A1', () => {
    const result = validateVocabularyFrequency('Bonjour, le restaurant est bon!', 'A1', 'fr');
    expect(result.valid).toBe(false);
    expect(result.outOfRangeWords).toContain('restaurant');
  });

  it('A2 allows cumulative A1+A2 words', () => {
    const result = validateVocabularyFrequency('Bonjour, le restaurant est bon!', 'A2', 'fr');
    expect(result.valid).toBe(true);
  });

  it('B2 always returns valid', () => {
    const result = validateVocabularyFrequency('anything goes here', 'B2', 'fr');
    expect(result.valid).toBe(true);
  });

  it('provides inline translation suggestions for out-of-range words', () => {
    const result = validateVocabularyFrequency('le restaurant', 'A1', 'fr');
    expect(result.inlineTranslations.length).toBeGreaterThan(0);
    expect(result.inlineTranslations[0].word).toBe('restaurant');
  });

  it('unknown language fails open', () => {
    const result = validateVocabularyFrequency('anything', 'A1', 'de');
    expect(result.valid).toBe(true);
  });
});

// ── LLM Prompt Directives ───────────────────────────────────────────────────

describe('buildFrequencyDirective', () => {
  it('A1 directive mentions top 200 and inline translations', () => {
    const directive = buildFrequencyDirective('A1', 'French');
    expect(directive).toContain('200');
    expect(directive).toContain('French');
    expect(directive).toContain('translation');
  });

  it('A2 directive mentions top 500', () => {
    const directive = buildFrequencyDirective('A2', 'French');
    expect(directive).toContain('500');
  });

  it('B1 directive mentions top 1500', () => {
    const directive = buildFrequencyDirective('B1', 'French');
    expect(directive).toContain('1500');
  });

  it('B2 directive is unrestricted', () => {
    const directive = buildFrequencyDirective('B2', 'French');
    expect(directive).toContain('full range');
    expect(directive).not.toContain('CONSTRAINT');
  });
});

// ── Integration with buildLanguageModeDirective ─────────────────────────────

describe('buildLanguageModeDirective frequency integration', () => {
  it('includes frequency directive when cefrLevel is provided', () => {
    const directive = buildLanguageModeDirective('bilingual', 'French', 'English', 'A1');
    expect(directive).toContain('BILINGUAL');
    expect(directive).toContain('VOCABULARY FREQUENCY CONSTRAINT');
    expect(directive).toContain('200');
  });

  it('does not include frequency directive when cefrLevel is omitted', () => {
    const directive = buildLanguageModeDirective('bilingual', 'French', 'English');
    expect(directive).toContain('BILINGUAL');
    expect(directive).not.toContain('VOCABULARY FREQUENCY CONSTRAINT');
  });

  it('simplified mode includes frequency guidance for A1', () => {
    const directive = buildLanguageModeDirective('simplified', 'French', 'English', 'A1');
    expect(directive).toContain('SIMPLIFIED');
    expect(directive).toContain('200');
  });

  it('natural mode includes frequency guidance for B1', () => {
    const directive = buildLanguageModeDirective('natural', 'French', 'English', 'B1');
    expect(directive).toContain('NATURAL');
    expect(directive).toContain('1500');
  });

  it('natural mode at B2 has unrestricted frequency', () => {
    const directive = buildLanguageModeDirective('natural', 'French', 'English', 'B2');
    expect(directive).toContain('NATURAL');
    expect(directive).toContain('full range');
  });
});

// ── Integration with getNPCLanguageBehavior ──────────────────────────────────

describe('getNPCLanguageBehavior frequency integration', () => {
  it('prompt directive includes vocabulary frequency constraints', () => {
    const behavior = getNPCLanguageBehavior('A1', 'npc-teacher-1', 'French');
    expect(behavior.promptDirective).toContain('VOCABULARY FREQUENCY CONSTRAINT');
  });

  it('B2 NPC has unrestricted vocabulary directive', () => {
    const behavior = getNPCLanguageBehavior('B2', 'npc-teacher-1', 'French');
    expect(behavior.promptDirective).toContain('full range');
  });
});

// ── Integration with getCEFRTextComplexity ──────────────────────────────────

describe('getCEFRTextComplexity frequency range', () => {
  it('includes frequency range for each level', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
      const complexity = getCEFRTextComplexity(level);
      expect(complexity.frequencyRange).toBeDefined();
      expect(complexity.frequencyRange.min).toBeGreaterThanOrEqual(1);
      expect(complexity.frequencyRange.label).toBeTruthy();
    }
  });

  it('A1 frequency range matches expected top 200', () => {
    const complexity = getCEFRTextComplexity('A1');
    expect(complexity.frequencyRange.max).toBe(200);
  });

  it('B2 frequency range is unrestricted', () => {
    const complexity = getCEFRTextComplexity('B2');
    expect(complexity.frequencyRange.max).toBe(Infinity);
  });
});

// ── Vocabulary Range Summary ────────────────────────────────────────────────

describe('buildVocabularyRangeSummary', () => {
  it('produces human-readable summary for A1', () => {
    const summary = buildVocabularyRangeSummary('A1');
    expect(summary).toContain('200');
    expect(summary).toContain('1');
  });

  it('produces summary for B2 with infinity symbol', () => {
    const summary = buildVocabularyRangeSummary('B2');
    expect(summary).toContain('unrestricted');
  });
});
