/**
 * Tests for Unreal Assessment and Language Quiz UI Widget export
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - InsimulAssessmentWidget.h with token substitution for assessment config
 * - InsimulAssessmentWidget.cpp as a static template
 * - InsimulLanguageQuizWidget.h with token substitution for language config
 * - InsimulLanguageQuizWidget.cpp as a static template
 * - DataTable JSON files for assessment questions, vocabulary, grammar patterns
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import { generateDataTableFiles } from '../services/game-export/unreal/unreal-datatable-generator';
import type { WorldIR, AssessmentIR, LanguageLearningIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

function makeAssessmentIR(): AssessmentIR {
  return {
    instruments: [
      {
        id: 'sus',
        name: 'System Usability Scale',
        description: 'A 10-item questionnaire measuring perceived usability',
        version: '1.0',
        citation: 'Brooke, J. (1996)',
        scoringMethod: 'sum',
        subscales: [{ id: 'usability', name: 'Usability', questionIds: ['sus_q1', 'sus_q2'] }],
        scoreRange: { min: 0, max: 100 },
        estimatedMinutes: 5,
        questions: [
          {
            id: 'sus_q1',
            text: 'I think that I would like to use this system frequently.',
            type: 'likert_5',
            options: null,
            scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' },
            reverseScored: false,
            subscale: 'usability',
            required: true,
            difficulty: null,
            targetLanguage: null,
          },
          {
            id: 'sus_q2',
            text: 'I found the system unnecessarily complex.',
            type: 'likert_5',
            options: null,
            scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' },
            reverseScored: true,
            subscale: 'usability',
            required: true,
            difficulty: null,
            targetLanguage: null,
          },
        ],
      },
      {
        id: 'ipq',
        name: 'Igroup Presence Questionnaire',
        description: 'Measures presence in virtual environments',
        version: '1.0',
        citation: 'Schubert et al. (2001)',
        scoringMethod: 'mean',
        subscales: [],
        scoreRange: { min: 1, max: 7 },
        estimatedMinutes: 10,
        questions: [
          {
            id: 'ipq_q1',
            text: 'In the computer generated world I had a sense of "being there".',
            type: 'likert_7',
            options: null,
            scaleAnchors: { low: 'Not at all', high: 'Very much' },
            reverseScored: false,
            subscale: null,
            required: true,
            difficulty: null,
            targetLanguage: null,
          },
        ],
      },
    ],
    schedule: {
      instruments: ['sus', 'ipq'],
      delayedTestDelayDays: 14,
      targetLanguage: null,
    },
    phases: ['pre', 'post', 'delayed'],
  };
}

function makeLanguageLearningIR(): LanguageLearningIR {
  return {
    targetLanguageId: 'chitimacha',
    baseLanguageCode: 'en',
    vocabulary: [
      {
        id: 'vocab_1',
        word: 'kuti',
        translation: 'hello',
        category: 'greetings',
        proficiencyLevel: 'novice',
        pronunciation: 'koo-tee',
        audioAssetKey: null,
        exampleSentence: 'Kuti, neta pankish.',
      },
      {
        id: 'vocab_2',
        word: 'pankish',
        translation: 'friend',
        category: 'greetings',
        proficiencyLevel: 'novice',
        pronunciation: 'pan-kish',
        audioAssetKey: 'audio_pankish',
        exampleSentence: null,
      },
      {
        id: 'vocab_3',
        word: 'wekihi',
        translation: 'water',
        category: 'nature',
        proficiencyLevel: 'beginner',
        pronunciation: 'weh-kee-hee',
        audioAssetKey: null,
        exampleSentence: 'Wekihi nush hayki.',
      },
    ],
    grammarPatterns: [
      {
        id: 'gram_1',
        name: 'simple_greeting',
        description: 'Basic greeting pattern',
        pattern: '{greeting}, {subject}',
        example: 'Kuti, neta pankish',
        exampleTranslation: 'Hello, my friend',
        proficiencyLevel: 'novice',
      },
      {
        id: 'gram_2',
        name: 'basic_noun_phrase',
        description: 'Simple noun phrase construction',
        pattern: '{adjective} {noun}',
        example: 'Hushi wekihi',
        exampleTranslation: 'Cold water',
        proficiencyLevel: 'beginner',
      },
    ],
    proficiencyTiers: [
      { level: 'novice', name: 'Novice', xpThreshold: 0, unlockedCategories: ['greetings'], unlockedPatternIds: ['gram_1'] },
      { level: 'beginner', name: 'Beginner', xpThreshold: 100, unlockedCategories: ['greetings', 'nature'], unlockedPatternIds: ['gram_1', 'gram_2'] },
      { level: 'intermediate', name: 'Intermediate', xpThreshold: 400, unlockedCategories: ['greetings', 'nature', 'food'], unlockedPatternIds: ['gram_1', 'gram_2'] },
      { level: 'advanced', name: 'Advanced', xpThreshold: 1000, unlockedCategories: ['greetings', 'nature', 'food', 'directions'], unlockedPatternIds: ['gram_1', 'gram_2'] },
    ],
    startingLevel: 'novice',
    xpPerVocabularyUse: 10,
    xpPerGrammarUse: 20,
    adaptiveDifficulty: true,
  };
}

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  const base: WorldIR = {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldDescription: 'A test world',
      worldType: 'fantasy',
      genreConfig: {
        genre: 'rpg',
        subGenre: 'action-rpg',
        features: { crafting: false, resources: false, survival: false, dungeons: false, vehicles: false, companions: false, factions: false, housing: false, farming: false, fishing: false, cooking: false, mining: false, trading: true },
        cameraMode: 'third-person' as any,
        combatStyle: 'melee' as any,
      },
      exportTimestamp: new Date().toISOString(),
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: {
      terrainSize: 1000,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      foliageLayers: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      businesses: [],
      roads: [],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      languages: [],
      items: [],
      lootTables: [],
      dialogueContexts: [],
      knowledgeBase: null,
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.4, g: 0.6, b: 0.3 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        settlementBaseColor: { r: 0.8, g: 0.7, b: 0.6 },
        settlementRoofColor: { r: 0.6, g: 0.3, b: 0.2 },
        roadColor: { r: 0.5, g: 0.5, b: 0.5 },
        roadRadius: 2.5,
      } as any,
      skyboxAssetKey: null,
      ambientLighting: { color: [0.3, 0.3, 0.3], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0], intensity: 1.0 },
      fog: null,
    },
    assets: { collectionId: null, textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 0, y: 1, z: 0 },
      modelAssetKey: null,
      initialEnergy: 100,
      initialGold: 50,
      initialHealth: 100,
      speed: 6,
      jumpHeight: 4,
      gravity: 9.8,
    },
    ui: {
      showMinimap: true,
      showHealthBar: true,
      showStaminaBar: true,
      showAmmoCounter: false,
      showCompass: true,
      genreLayout: 'rpg',
      questJournal: {
        enabled: true,
        maxTrackedQuests: 3,
        showQuestMarkers: true,
        autoTrackNew: false,
        sortOrder: 'newest',
        categories: [],
      },
    },
    combat: {
      style: 'melee' as any,
      settings: { baseDamage: 10, damageVariance: 2, criticalChance: 0.1, criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.1, attackCooldown: 500, comboWindowMs: 300, maxComboLength: 3 },
    },
    survival: null,
    resources: null,
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
    assessment: null,
    languageLearning: null,
  };

  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────
// Assessment Widget
// ─────────────────────────────────────────────

describe('Unreal export - Assessment Widget', () => {
  it('generates InsimulAssessmentWidget.h when assessment is configured', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'));
    expect(header).toBeDefined();
    expect(header!.path).toContain('UI/InsimulAssessmentWidget.h');
  });

  it('generates InsimulAssessmentWidget.cpp when assessment is configured', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('InsimulAssessmentWidget.cpp'));
    expect(cpp).toBeDefined();
  });

  it('does not generate assessment widget when assessment is null', () => {
    const ir = makeMinimalIR({ assessment: null });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'));
    expect(header).toBeUndefined();
  });

  it('substitutes INSTRUMENT_COUNT token', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('InstrumentCount = 2');
    expect(header.content).not.toContain('{{INSTRUMENT_COUNT}}');
  });

  it('substitutes TOTAL_QUESTION_COUNT token', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    // 2 SUS + 1 IPQ = 3 questions
    expect(header.content).toContain('TotalQuestionCount = 3');
  });

  it('substitutes phase tokens correctly', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('bHasPrePhase = true');
    expect(header.content).toContain('bHasPostPhase = true');
    expect(header.content).toContain('bHasDelayedPhase = true');
  });

  it('sets phase tokens to false when phases are limited', () => {
    const assessment = makeAssessmentIR();
    assessment.phases = ['pre', 'post'];
    const ir = makeMinimalIR({ assessment });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('bHasPrePhase = true');
    expect(header.content).toContain('bHasPostPhase = true');
    expect(header.content).toContain('bHasDelayedPhase = false');
  });

  it('header contains UUserWidget base class', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('public UUserWidget');
  });

  it('header contains FAssessmentQuestion struct', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('struct FAssessmentQuestion');
  });

  it('header contains FAssessmentResponse struct', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('struct FAssessmentResponse');
  });

  it('header contains FAssessmentResult struct', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('struct FAssessmentResult');
  });

  it('header declares OnAssessmentCompleted delegate', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('FOnAssessmentCompleted');
    expect(header.content).toContain('OnAssessmentCompleted');
  });

  it('header declares assessment methods', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulAssessmentWidget.h'))!;
    expect(header.content).toContain('StartAssessment');
    expect(header.content).toContain('SubmitAnswer');
    expect(header.content).toContain('SkipQuestion');
    expect(header.content).toContain('GoBack');
    expect(header.content).toContain('GetCurrentQuestion');
    expect(header.content).toContain('GetProgress');
  });

  it('cpp contains LoadConfig implementation', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('InsimulAssessmentWidget.cpp'))!;
    expect(cpp.content).toContain('UInsimulAssessmentWidget::LoadConfig');
    expect(cpp.content).toContain('assessment');
  });

  it('cpp contains ComputeScore implementation', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('InsimulAssessmentWidget.cpp'))!;
    expect(cpp.content).toContain('UInsimulAssessmentWidget::ComputeScore');
  });
});

// ─────────────────────────────────────────────
// Language Quiz Widget
// ─────────────────────────────────────────────

describe('Unreal export - Language Quiz Widget', () => {
  it('generates InsimulLanguageQuizWidget.h when language learning is configured', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'));
    expect(header).toBeDefined();
    expect(header!.path).toContain('UI/InsimulLanguageQuizWidget.h');
  });

  it('generates InsimulLanguageQuizWidget.cpp when language learning is configured', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('InsimulLanguageQuizWidget.cpp'));
    expect(cpp).toBeDefined();
  });

  it('does not generate language quiz widget when languageLearning is null', () => {
    const ir = makeMinimalIR({ languageLearning: null });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'));
    expect(header).toBeUndefined();
  });

  it('substitutes VOCABULARY_COUNT token', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('VocabularyCount = 3');
    expect(header.content).not.toContain('{{VOCABULARY_COUNT}}');
  });

  it('substitutes GRAMMAR_PATTERN_COUNT token', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('GrammarPatternCount = 2');
  });

  it('substitutes XP tokens', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('XPPerVocabularyUse = 10');
    expect(header.content).toContain('XPPerGrammarUse = 20');
  });

  it('substitutes ADAPTIVE_DIFFICULTY token', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('bAdaptiveDifficulty = true');
  });

  it('sets adaptive difficulty to false when disabled', () => {
    const lang = makeLanguageLearningIR();
    lang.adaptiveDifficulty = false;
    const ir = makeMinimalIR({ languageLearning: lang });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('bAdaptiveDifficulty = false');
  });

  it('header contains UUserWidget base class', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('public UUserWidget');
  });

  it('header contains FVocabularyItem struct', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('struct FVocabularyItem');
  });

  it('header contains FGrammarPattern struct', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('struct FGrammarPattern');
  });

  it('header contains FLanguageQuizQuestion struct', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('struct FLanguageQuizQuestion');
  });

  it('header declares quiz delegates', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('FOnQuizCompleted');
    expect(header.content).toContain('FOnAnswerSubmitted');
    expect(header.content).toContain('FOnProficiencyChanged');
  });

  it('header declares quiz methods', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('InsimulLanguageQuizWidget.h'))!;
    expect(header.content).toContain('StartQuiz');
    expect(header.content).toContain('SubmitAnswer');
    expect(header.content).toContain('GetCurrentQuestion');
    expect(header.content).toContain('GetProgress');
    expect(header.content).toContain('GetCurrentProficiency');
    expect(header.content).toContain('GetVocabularyForLevel');
  });

  it('cpp contains LoadConfig implementation', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('InsimulLanguageQuizWidget.cpp'))!;
    expect(cpp.content).toContain('UInsimulLanguageQuizWidget::LoadConfig');
    expect(cpp.content).toContain('languageLearning');
  });

  it('cpp contains GenerateQuestions implementation', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('InsimulLanguageQuizWidget.cpp'))!;
    expect(cpp.content).toContain('UInsimulLanguageQuizWidget::GenerateQuestions');
  });

  it('cpp contains proficiency advancement logic', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('InsimulLanguageQuizWidget.cpp'))!;
    expect(cpp.content).toContain('CheckProficiencyAdvance');
    expect(cpp.content).toContain('OnProficiencyChanged');
  });
});

// ─────────────────────────────────────────────
// Assessment DataTables
// ─────────────────────────────────────────────

describe('Unreal export - Assessment DataTables', () => {
  it('generates DT_AssessmentInstruments.json when assessment is configured', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_AssessmentInstruments.json'));
    expect(dt).toBeDefined();
    const data = JSON.parse(dt!.content);
    expect(data).toHaveLength(2);
    expect(data[0].InstrumentId).toBe('sus');
    expect(data[1].InstrumentId).toBe('ipq');
  });

  it('generates DT_AssessmentQuestions.json with all questions', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_AssessmentQuestions.json'));
    expect(dt).toBeDefined();
    const data = JSON.parse(dt!.content);
    expect(data).toHaveLength(3); // 2 SUS + 1 IPQ
    expect(data[0].QuestionId).toBe('sus_q1');
    expect(data[0].InstrumentId).toBe('sus');
    expect(data[0].Type).toBe('likert_5');
    expect(data[1].ReverseScored).toBe(true);
    expect(data[2].InstrumentId).toBe('ipq');
  });

  it('does not generate assessment DataTables when assessment is null', () => {
    const ir = makeMinimalIR({ assessment: null });
    const files = generateDataTableFiles(ir);
    expect(files.find(f => f.path.includes('DT_AssessmentInstruments'))).toBeUndefined();
    expect(files.find(f => f.path.includes('DT_AssessmentQuestions'))).toBeUndefined();
  });

  it('includes scale anchors in question DataTable', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_AssessmentQuestions.json'))!;
    const data = JSON.parse(dt.content);
    expect(data[0].ScaleAnchorLow).toBe('Strongly Disagree');
    expect(data[0].ScaleAnchorHigh).toBe('Strongly Agree');
  });

  it('includes subscale info in instrument DataTable', () => {
    const ir = makeMinimalIR({ assessment: makeAssessmentIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_AssessmentInstruments.json'))!;
    const data = JSON.parse(dt.content);
    expect(data[0].Subscales).toHaveLength(1);
    expect(data[0].Subscales[0].Id).toBe('usability');
  });
});

// ─────────────────────────────────────────────
// Language Learning DataTables
// ─────────────────────────────────────────────

describe('Unreal export - Language Learning DataTables', () => {
  it('generates DT_Vocabulary.json with vocabulary items', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_Vocabulary.json'));
    expect(dt).toBeDefined();
    const data = JSON.parse(dt!.content);
    expect(data).toHaveLength(3);
    expect(data[0].Word).toBe('kuti');
    expect(data[0].Translation).toBe('hello');
    expect(data[0].ProficiencyLevel).toBe('novice');
  });

  it('generates DT_GrammarPatterns.json with grammar patterns', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_GrammarPatterns.json'));
    expect(dt).toBeDefined();
    const data = JSON.parse(dt!.content);
    expect(data).toHaveLength(2);
    expect(data[0].PatternName).toBe('simple_greeting');
    expect(data[1].Example).toBe('Hushi wekihi');
  });

  it('generates DT_ProficiencyTiers.json with tier definitions', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_ProficiencyTiers.json'));
    expect(dt).toBeDefined();
    const data = JSON.parse(dt!.content);
    expect(data).toHaveLength(4);
    expect(data[0].Level).toBe('novice');
    expect(data[0].XPThreshold).toBe(0);
    expect(data[1].XPThreshold).toBe(100);
  });

  it('does not generate language DataTables when languageLearning is null', () => {
    const ir = makeMinimalIR({ languageLearning: null });
    const files = generateDataTableFiles(ir);
    expect(files.find(f => f.path.includes('DT_Vocabulary'))).toBeUndefined();
    expect(files.find(f => f.path.includes('DT_GrammarPatterns'))).toBeUndefined();
    expect(files.find(f => f.path.includes('DT_ProficiencyTiers'))).toBeUndefined();
  });

  it('handles null optional fields in vocabulary', () => {
    const ir = makeMinimalIR({ languageLearning: makeLanguageLearningIR() });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.includes('DT_Vocabulary.json'))!;
    const data = JSON.parse(dt.content);
    // vocab_1 has null audioAssetKey
    expect(data[0].AudioAssetKey).toBe('');
    // vocab_2 has null exampleSentence
    expect(data[1].ExampleSentence).toBe('');
    // vocab_2 has a non-null audioAssetKey
    expect(data[1].AudioAssetKey).toBe('audio_pankish');
  });
});
