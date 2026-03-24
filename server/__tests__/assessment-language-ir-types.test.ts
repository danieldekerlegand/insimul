/**
 * Tests for Assessment and Language Learning IR types.
 *
 * Validates that the new IR type interfaces are structurally sound
 * and can be correctly populated for game export.
 */

import { describe, it, expect } from 'vitest';
import type {
  WorldIR,
  AssessmentIR,
  AssessmentInstrumentIR,
  AssessmentInstrumentType,
  AssessmentPhase,
  AssessmentQuestionIR,
  AssessmentQuestionType,
  AssessmentScheduleIR,
  LanguageLearningIR,
  VocabularyItemIR,
  GrammarPatternIR,
  ProficiencyTierIR,
  ProficiencyLevel,
} from '@shared/game-engine/ir-types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeAssessmentQuestion(overrides: Partial<AssessmentQuestionIR> = {}): AssessmentQuestionIR {
  return {
    id: 'q1',
    text: 'I can greet others in the target language.',
    type: 'rating_scale',
    options: null,
    scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' },
    reverseScored: false,
    subscale: 'speaking',
    required: true,
    difficulty: 'easy',
    targetLanguage: null,
    ...overrides,
  };
}

function makeInstrument(overrides: Partial<AssessmentInstrumentIR> = {}): AssessmentInstrumentIR {
  return {
    id: 'actfl_opi',
    name: 'ACTFL OPI Self-Assessment',
    description: 'Oral proficiency self-assessment',
    version: '1.0',
    citation: 'ACTFL (2012).',
    scoringMethod: 'mean',
    subscales: [{ id: 'speaking', name: 'Speaking', questionIds: ['q1'] }],
    scoreRange: { min: 1, max: 10 },
    estimatedMinutes: 10,
    questions: [makeAssessmentQuestion()],
    ...overrides,
  };
}

function makeAssessmentIR(overrides: Partial<AssessmentIR> = {}): AssessmentIR {
  return {
    instruments: [makeInstrument()],
    schedule: {
      instruments: ['actfl_opi'],
      delayedTestDelayDays: 14,
      targetLanguage: null,
    },
    phases: ['pre', 'post', 'delayed'],
    ...overrides,
  };
}

function makeVocabularyItem(overrides: Partial<VocabularyItemIR> = {}): VocabularyItemIR {
  return {
    id: 'vocab-1',
    word: 'haw',
    translation: 'water',
    category: 'nature',
    proficiencyLevel: 'novice',
    pronunciation: '/hɔː/',
    audioAssetKey: null,
    exampleSentence: null,
    ...overrides,
  };
}

function makeGrammarPattern(overrides: Partial<GrammarPatternIR> = {}): GrammarPatternIR {
  return {
    id: 'gp-1',
    name: 'simple_greeting',
    description: 'Basic greeting pattern',
    pattern: '{greeting} {name}',
    example: 'Haw niina',
    exampleTranslation: 'Hello friend',
    proficiencyLevel: 'novice',
    ...overrides,
  };
}

function makeProficiencyTier(overrides: Partial<ProficiencyTierIR> = {}): ProficiencyTierIR {
  return {
    level: 'novice',
    name: 'Novice',
    xpThreshold: 0,
    unlockedCategories: ['greetings', 'numbers'],
    unlockedPatternIds: ['gp-1'],
    ...overrides,
  };
}

function makeLanguageLearningIR(overrides: Partial<LanguageLearningIR> = {}): LanguageLearningIR {
  return {
    targetLanguageId: 'lang-chitimacha',
    baseLanguageCode: 'en',
    vocabulary: [makeVocabularyItem()],
    grammarPatterns: [makeGrammarPattern()],
    proficiencyTiers: [
      makeProficiencyTier(),
      makeProficiencyTier({ level: 'beginner', name: 'Beginner', xpThreshold: 100, unlockedCategories: ['food', 'family'] }),
    ],
    startingLevel: 'novice',
    xpPerVocabularyUse: 5,
    xpPerGrammarUse: 10,
    adaptiveDifficulty: true,
    ...overrides,
  };
}

// ── Assessment IR Tests ──────────────────────────────────────────────────────

describe('AssessmentIR', () => {
  it('can construct a complete AssessmentIR with all fields', () => {
    const ir = makeAssessmentIR();

    expect(ir.instruments).toHaveLength(1);
    expect(ir.phases).toEqual(['pre', 'post', 'delayed']);
    expect(ir.schedule.delayedTestDelayDays).toBe(14);
  });

  it('supports all instrument types', () => {
    const types: AssessmentInstrumentType[] = ['actfl_opi', 'sus', 'ssq', 'ipq'];
    const instruments = types.map(id => makeInstrument({ id }));

    const ir = makeAssessmentIR({
      instruments,
      schedule: {
        instruments: types,
        delayedTestDelayDays: 14,
        targetLanguage: 'chitimacha',
      },
    });

    expect(ir.instruments).toHaveLength(4);
    expect(ir.instruments.map(i => i.id)).toEqual(types);
    expect(ir.schedule.targetLanguage).toBe('chitimacha');
  });

  it('supports all question types', () => {
    const questionTypes: AssessmentQuestionType[] = ['likert_5', 'likert_7', 'open_ended', 'multiple_choice', 'rating_scale'];
    const questions = questionTypes.map((type, i) =>
      makeAssessmentQuestion({ id: `q${i}`, type }),
    );

    const instrument = makeInstrument({ questions });
    expect(instrument.questions).toHaveLength(5);
    expect(instrument.questions.map(q => q.type)).toEqual(questionTypes);
  });

  it('supports reverse-scored questions', () => {
    const q = makeAssessmentQuestion({ reverseScored: true });
    expect(q.reverseScored).toBe(true);
  });

  it('supports multiple choice with options', () => {
    const q = makeAssessmentQuestion({
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C'],
      scaleAnchors: null,
    });
    expect(q.options).toEqual(['Option A', 'Option B', 'Option C']);
    expect(q.scaleAnchors).toBeNull();
  });

  it('supports language-specific questions', () => {
    const q = makeAssessmentQuestion({ targetLanguage: 'chitimacha' });
    expect(q.targetLanguage).toBe('chitimacha');
  });

  it('supports instrument subscales', () => {
    const instrument = makeInstrument({
      subscales: [
        { id: 'speaking', name: 'Speaking', questionIds: ['q1', 'q2'] },
        { id: 'listening', name: 'Listening', questionIds: ['q3', 'q4'] },
      ],
    });
    expect(instrument.subscales).toHaveLength(2);
    expect(instrument.subscales[0].questionIds).toEqual(['q1', 'q2']);
  });

  it('supports all scoring methods', () => {
    const methods: Array<'mean' | 'sum' | 'weighted' | 'custom'> = ['mean', 'sum', 'weighted', 'custom'];
    for (const method of methods) {
      const instrument = makeInstrument({ scoringMethod: method });
      expect(instrument.scoringMethod).toBe(method);
    }
  });

  it('supports all phases', () => {
    const phases: AssessmentPhase[] = ['pre', 'post', 'delayed'];
    const ir = makeAssessmentIR({ phases });
    expect(ir.phases).toEqual(phases);
  });

  it('schedule can omit target language', () => {
    const schedule: AssessmentScheduleIR = {
      instruments: ['sus', 'ssq'],
      delayedTestDelayDays: 21,
      targetLanguage: null,
    };
    expect(schedule.targetLanguage).toBeNull();
  });
});

// ── Language Learning IR Tests ───────────────────────────────────────────────

describe('LanguageLearningIR', () => {
  it('can construct a complete LanguageLearningIR with all fields', () => {
    const ir = makeLanguageLearningIR();

    expect(ir.targetLanguageId).toBe('lang-chitimacha');
    expect(ir.baseLanguageCode).toBe('en');
    expect(ir.vocabulary).toHaveLength(1);
    expect(ir.grammarPatterns).toHaveLength(1);
    expect(ir.proficiencyTiers).toHaveLength(2);
    expect(ir.startingLevel).toBe('novice');
    expect(ir.xpPerVocabularyUse).toBe(5);
    expect(ir.xpPerGrammarUse).toBe(10);
    expect(ir.adaptiveDifficulty).toBe(true);
  });

  it('vocabulary items have all required fields', () => {
    const item = makeVocabularyItem();
    expect(item.id).toBe('vocab-1');
    expect(item.word).toBe('haw');
    expect(item.translation).toBe('water');
    expect(item.category).toBe('nature');
    expect(item.proficiencyLevel).toBe('novice');
    expect(item.pronunciation).toBe('/hɔː/');
  });

  it('vocabulary items support optional audio and examples', () => {
    const item = makeVocabularyItem({
      audioAssetKey: 'audio/vocab/haw.mp3',
      exampleSentence: 'Haw kuti neta.',
    });
    expect(item.audioAssetKey).toBe('audio/vocab/haw.mp3');
    expect(item.exampleSentence).toBe('Haw kuti neta.');
  });

  it('grammar patterns have all required fields', () => {
    const pattern = makeGrammarPattern();
    expect(pattern.id).toBe('gp-1');
    expect(pattern.name).toBe('simple_greeting');
    expect(pattern.pattern).toBe('{greeting} {name}');
    expect(pattern.example).toBe('Haw niina');
    expect(pattern.exampleTranslation).toBe('Hello friend');
    expect(pattern.proficiencyLevel).toBe('novice');
  });

  it('supports all proficiency levels', () => {
    const levels: ProficiencyLevel[] = ['novice', 'beginner', 'intermediate', 'advanced'];
    const tiers = levels.map((level, i) =>
      makeProficiencyTier({ level, name: level, xpThreshold: i * 100 }),
    );
    const ir = makeLanguageLearningIR({ proficiencyTiers: tiers });
    expect(ir.proficiencyTiers).toHaveLength(4);
    expect(ir.proficiencyTiers.map(t => t.level)).toEqual(levels);
  });

  it('proficiency tiers unlock categories and patterns progressively', () => {
    const tiers: ProficiencyTierIR[] = [
      makeProficiencyTier({
        level: 'novice',
        xpThreshold: 0,
        unlockedCategories: ['greetings'],
        unlockedPatternIds: ['gp-1'],
      }),
      makeProficiencyTier({
        level: 'beginner',
        xpThreshold: 100,
        unlockedCategories: ['food', 'family'],
        unlockedPatternIds: ['gp-2', 'gp-3'],
      }),
    ];

    expect(tiers[0].unlockedCategories).toEqual(['greetings']);
    expect(tiers[1].unlockedCategories).toEqual(['food', 'family']);
    expect(tiers[1].unlockedPatternIds).toEqual(['gp-2', 'gp-3']);
  });

  it('supports multiple vocabulary categories', () => {
    const vocab = [
      makeVocabularyItem({ id: 'v1', category: 'greetings', word: 'haw', translation: 'hello' }),
      makeVocabularyItem({ id: 'v2', category: 'food', word: 'kuti', translation: 'corn' }),
      makeVocabularyItem({ id: 'v3', category: 'nature', word: 'haw', translation: 'water' }),
    ];
    const ir = makeLanguageLearningIR({ vocabulary: vocab });
    const categories = new Set(ir.vocabulary.map(v => v.category));
    expect(categories).toEqual(new Set(['greetings', 'food', 'nature']));
  });

  it('can disable adaptive difficulty', () => {
    const ir = makeLanguageLearningIR({ adaptiveDifficulty: false });
    expect(ir.adaptiveDifficulty).toBe(false);
  });
});

// ── WorldIR Integration Tests ────────────────────────────────────────────────

describe('WorldIR assessment/languageLearning fields', () => {
  it('assessment and languageLearning are nullable on WorldIR', () => {
    // Type-level check: verify the fields exist and accept null
    const partial: Pick<WorldIR, 'assessment' | 'languageLearning'> = {
      assessment: null,
      languageLearning: null,
    };
    expect(partial.assessment).toBeNull();
    expect(partial.languageLearning).toBeNull();
  });

  it('assessment field accepts a full AssessmentIR', () => {
    const assessment = makeAssessmentIR();
    const partial: Pick<WorldIR, 'assessment'> = { assessment };
    expect(partial.assessment).not.toBeNull();
    expect(partial.assessment!.instruments).toHaveLength(1);
    expect(partial.assessment!.phases).toContain('pre');
  });

  it('languageLearning field accepts a full LanguageLearningIR', () => {
    const languageLearning = makeLanguageLearningIR();
    const partial: Pick<WorldIR, 'languageLearning'> = { languageLearning };
    expect(partial.languageLearning).not.toBeNull();
    expect(partial.languageLearning!.targetLanguageId).toBe('lang-chitimacha');
    expect(partial.languageLearning!.vocabulary).toHaveLength(1);
  });

  it('both fields can be populated together for educational games', () => {
    const partial: Pick<WorldIR, 'assessment' | 'languageLearning'> = {
      assessment: makeAssessmentIR({
        schedule: {
          instruments: ['actfl_opi'],
          delayedTestDelayDays: 14,
          targetLanguage: 'chitimacha',
        },
      }),
      languageLearning: makeLanguageLearningIR(),
    };
    expect(partial.assessment).not.toBeNull();
    expect(partial.languageLearning).not.toBeNull();
    expect(partial.assessment!.schedule.targetLanguage).toBe('chitimacha');
    expect(partial.languageLearning!.targetLanguageId).toBe('lang-chitimacha');
  });
});
