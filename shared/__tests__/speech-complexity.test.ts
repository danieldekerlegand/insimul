import { describe, it, expect } from 'vitest';
import {
  getSpeechComplexity,
  buildDialogueRulesFromComplexity,
  type SpeechComplexityParams,
  type SpeechComplexityLevel,
} from '../language/speech-complexity';
import type { PlayerProficiency } from '../language/utils';

function makeProficiency(overrides: Partial<PlayerProficiency> = {}): PlayerProficiency {
  return {
    overallFluency: 0,
    vocabularyCount: 0,
    masteredWordCount: 0,
    weakGrammarPatterns: [],
    strongGrammarPatterns: [],
    conversationCount: 0,
    ...overrides,
  };
}

describe('getSpeechComplexity', () => {
  it('returns beginner for fluency 0-19', () => {
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 0 })).level).toBe('beginner');
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 10 })).level).toBe('beginner');
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 19 })).level).toBe('beginner');
  });

  it('returns elementary for fluency 20-39', () => {
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 20 })).level).toBe('elementary');
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 39 })).level).toBe('elementary');
  });

  it('returns intermediate for fluency 40-59', () => {
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 40 })).level).toBe('intermediate');
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 59 })).level).toBe('intermediate');
  });

  it('returns advanced for fluency 60-79', () => {
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 60 })).level).toBe('advanced');
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 79 })).level).toBe('advanced');
  });

  it('returns near-native for fluency 80+', () => {
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 80 })).level).toBe('near-native');
    expect(getSpeechComplexity(makeProficiency({ overallFluency: 100 })).level).toBe('near-native');
  });

  it('clamps effective fluency to 0-100', () => {
    // Teacher (-15) with fluency 5 should clamp to 0, still beginner
    const result = getSpeechComplexity(makeProficiency({ overallFluency: 5 }), 'teacher');
    expect(result.effectiveFluency).toBe(0);
    expect(result.level).toBe('beginner');

    // Scholar (+15) with fluency 95 should clamp to 100
    const result2 = getSpeechComplexity(makeProficiency({ overallFluency: 95 }), 'scholar');
    expect(result2.effectiveFluency).toBe(100);
    expect(result2.level).toBe('near-native');
  });

  it('applies occupation modifier to shift complexity level', () => {
    // Fluency 25 normally = elementary, but teacher (-15) → effective 10 = beginner
    const withTeacher = getSpeechComplexity(makeProficiency({ overallFluency: 25 }), 'teacher');
    expect(withTeacher.level).toBe('beginner');

    // Fluency 25 normally = elementary, but scholar (+15) → effective 40 = intermediate
    const withScholar = getSpeechComplexity(makeProficiency({ overallFluency: 25 }), 'scholar');
    expect(withScholar.level).toBe('intermediate');
  });

  it('uses CEFR level override when provided', () => {
    // CEFR B2 maps to effective fluency ~70, regardless of overallFluency
    const result = getSpeechComplexity(makeProficiency({ overallFluency: 10 }), null, 'B2');
    expect(result.level).toBe('advanced');
  });

  it('returns correct structured params for beginner', () => {
    const result = getSpeechComplexity(makeProficiency({ overallFluency: 10 }));
    expect(result.maxSentenceWords).toBe(7);
    expect(result.vocabularyTier).toBe('basic');
    expect(result.useGestures).toBe(true);
    expect(result.allowIdioms).toBe(false);
    expect(result.allowSlang).toBe(false);
    expect(result.encouragementLevel).toBe('high');
    expect(result.grammarCorrectionsPerMessage).toBe(0);
    expect(result.hintConfig).toBeDefined();
    expect(result.hintConfig.translationMode).toBe('inline');
  });

  it('returns correct structured params for intermediate', () => {
    const result = getSpeechComplexity(makeProficiency({ overallFluency: 50 }));
    expect(result.maxSentenceWords).toBe(20);
    expect(result.vocabularyTier).toBe('varied');
    expect(result.allowIdioms).toBe(true);
    expect(result.allowSlang).toBe(false);
    expect(result.targetLanguageRatio).toBe(1.0);
    expect(result.grammarCorrectionsPerMessage).toBe(2);
  });

  it('returns correct structured params for near-native', () => {
    const result = getSpeechComplexity(makeProficiency({ overallFluency: 90 }));
    expect(result.maxSentenceWords).toBe(50);
    expect(result.vocabularyTier).toBe('native');
    expect(result.allowIdioms).toBe(true);
    expect(result.allowSlang).toBe(true);
    expect(result.encouragementLevel).toBe('none');
  });

  it('handles null occupation gracefully', () => {
    const result = getSpeechComplexity(makeProficiency({ overallFluency: 50 }), null);
    expect(result.level).toBe('intermediate');
    expect(result.effectiveFluency).toBe(50);
  });
});

describe('buildDialogueRulesFromComplexity', () => {
  it('includes target language in rules', () => {
    const params = getSpeechComplexity(makeProficiency({ overallFluency: 10 }));
    const rules = buildDialogueRulesFromComplexity(params, 'French');
    expect(rules).toContain('French');
    expect(rules).toContain('ADAPTIVE DIALOGUE RULES');
  });

  it('includes BEGINNER rules for beginner level', () => {
    const params = getSpeechComplexity(makeProficiency({ overallFluency: 5 }));
    const rules = buildDialogueRulesFromComplexity(params, 'Spanish');
    expect(rules).toContain('BEGINNER');
    expect(rules).toContain('gestures');
    expect(rules).toContain('7 words max');
  });

  it('includes NEAR-NATIVE rules for high fluency', () => {
    const params = getSpeechComplexity(makeProficiency({ overallFluency: 90 }));
    const rules = buildDialogueRulesFromComplexity(params, 'Japanese');
    expect(rules).toContain('NEAR-NATIVE');
    expect(rules).toContain('slang');
    expect(rules).toContain('fellow speaker');
  });

  it('includes TTS warning in all tiers', () => {
    const levels: Array<[number, SpeechComplexityLevel]> = [
      [5, 'beginner'],
      [30, 'elementary'],
      [50, 'intermediate'],
      [70, 'advanced'],
      [90, 'near-native'],
    ];
    for (const [fluency] of levels) {
      const params = getSpeechComplexity(makeProficiency({ overallFluency: fluency }));
      const rules = buildDialogueRulesFromComplexity(params, 'French');
      expect(rules).toContain('TTS');
    }
  });

  it('includes grammar correction count for elementary', () => {
    const params = getSpeechComplexity(makeProficiency({ overallFluency: 30 }));
    const rules = buildDialogueRulesFromComplexity(params, 'German');
    expect(rules).toContain('ELEMENTARY');
    expect(rules).toContain('1 grammar error');
  });

  it('includes idiom mention for intermediate', () => {
    const params = getSpeechComplexity(makeProficiency({ overallFluency: 50 }));
    const rules = buildDialogueRulesFromComplexity(params, 'Italian');
    expect(rules).toContain('INTERMEDIATE');
    expect(rules).toContain('idiomatic');
  });
});
