import { describe, it, expect } from 'vitest';
import {
  analyzeErrorPatterns,
  generateErrorCorrectionQuests,
  computeErrorCorrectionWeight,
  ERROR_CORRECTION_TEMPLATES,
  type ErrorPattern,
  type ErrorCorrectionQuest,
} from '../../server/services/error-correction-quest-generator';
import type { LanguageProgress, GrammarPattern, VocabularyEntry } from '../language/progress';
import { QUEST_TEMPLATES, getTemplatesByCategory } from '../language/quest-templates';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeGrammarPattern(overrides: Partial<GrammarPattern> = {}): GrammarPattern {
  return {
    id: 'gp-1',
    pattern: 'subject-verb agreement',
    language: 'French',
    timesUsedCorrectly: 2,
    timesUsedIncorrectly: 5,
    mastered: false,
    examples: ['je suis allé'],
    explanations: ['The verb must agree with the subject'],
    ...overrides,
  };
}

function makeVocabularyEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'maison',
    language: 'French',
    meaning: 'house',
    category: 'nouns',
    timesEncountered: 5,
    timesUsedCorrectly: 1,
    timesUsedIncorrectly: 4,
    lastEncountered: Date.now(),
    masteryLevel: 'learning',
    ...overrides,
  };
}

function makeLanguageProgress(overrides: Partial<LanguageProgress> = {}): LanguageProgress {
  return {
    playerId: 'player-1',
    worldId: 'world-1',
    language: 'French',
    overallFluency: 30,
    vocabulary: [],
    grammarPatterns: [],
    conversations: [],
    totalConversations: 5,
    totalWordsLearned: 20,
    totalCorrectUsages: 15,
    streakDays: 3,
    lastActivityTimestamp: Date.now(),
    ...overrides,
  };
}

function makeWorldContext() {
  return {
    world: { id: 'world-1', name: 'Test World' } as any,
    characters: [
      { id: 'npc-1', firstName: 'Marie', lastName: 'Dupont', status: 'active' } as any,
      { id: 'npc-2', firstName: 'Jean', lastName: 'Martin', status: 'active' } as any,
    ],
    settlements: [],
    existingQuests: [],
  };
}

// ── analyzeErrorPatterns ────────────────────────────────────────────────────

describe('analyzeErrorPatterns', () => {
  it('returns empty array when no errors exist', () => {
    const progress = makeLanguageProgress();
    const patterns = analyzeErrorPatterns(progress);
    expect(patterns).toHaveLength(0);
  });

  it('detects grammar patterns with high error rates', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ pattern: 'past tense', timesUsedCorrectly: 1, timesUsedIncorrectly: 4 }),
      ],
    });

    const patterns = analyzeErrorPatterns(progress);
    expect(patterns).toHaveLength(1);
    expect(patterns[0].type).toBe('grammar');
    expect(patterns[0].target).toBe('past tense');
    expect(patterns[0].errorRate).toBe(0.8);
  });

  it('detects vocabulary entries with high error rates', () => {
    const progress = makeLanguageProgress({
      vocabulary: [
        makeVocabularyEntry({ word: 'maison', timesUsedCorrectly: 1, timesUsedIncorrectly: 3 }),
      ],
    });

    const patterns = analyzeErrorPatterns(progress);
    expect(patterns).toHaveLength(1);
    expect(patterns[0].type).toBe('vocabulary');
    expect(patterns[0].target).toBe('maison');
    expect(patterns[0].errorRate).toBe(0.75);
  });

  it('ignores patterns below minimum total uses', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ timesUsedCorrectly: 0, timesUsedIncorrectly: 1 }), // total = 1 < default 2
      ],
    });

    const patterns = analyzeErrorPatterns(progress);
    expect(patterns).toHaveLength(0);
  });

  it('ignores patterns below minimum error rate', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ timesUsedCorrectly: 8, timesUsedIncorrectly: 2 }), // 20% error rate < 30%
      ],
    });

    const patterns = analyzeErrorPatterns(progress);
    expect(patterns).toHaveLength(0);
  });

  it('respects custom analysis options', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ pattern: 'p1', timesUsedCorrectly: 0, timesUsedIncorrectly: 1 }),
        makeGrammarPattern({ id: 'gp-2', pattern: 'p2', timesUsedCorrectly: 3, timesUsedIncorrectly: 7 }),
      ],
    });

    const patterns = analyzeErrorPatterns(progress, { minTotalUses: 1, minErrorRate: 0.5, maxPatterns: 1 });
    expect(patterns).toHaveLength(1);
    expect(patterns[0].target).toBe('p2'); // higher severity
  });

  it('sorts patterns by severity (most urgent first)', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ id: 'gp-1', pattern: 'mild', timesUsedCorrectly: 3, timesUsedIncorrectly: 2 }),
        makeGrammarPattern({ id: 'gp-2', pattern: 'severe', timesUsedCorrectly: 1, timesUsedIncorrectly: 9 }),
      ],
    });

    const patterns = analyzeErrorPatterns(progress);
    expect(patterns[0].target).toBe('severe');
    expect(patterns[1].target).toBe('mild');
    expect(patterns[0].severity).toBeGreaterThan(patterns[1].severity);
  });

  it('includes explanations and examples from grammar patterns', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({
          explanations: ['Use past participle after avoir'],
          examples: ['j\'ai mangé'],
        }),
      ],
    });

    const patterns = analyzeErrorPatterns(progress);
    expect(patterns[0].explanations).toContain('Use past participle after avoir');
    expect(patterns[0].examples).toContain('j\'ai mangé');
  });

  it('combines grammar and vocabulary errors', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ pattern: 'past tense', timesUsedCorrectly: 1, timesUsedIncorrectly: 4 }),
      ],
      vocabulary: [
        makeVocabularyEntry({ word: 'maison', timesUsedCorrectly: 1, timesUsedIncorrectly: 3 }),
      ],
    });

    const patterns = analyzeErrorPatterns(progress);
    expect(patterns).toHaveLength(2);
    const types = patterns.map(p => p.type);
    expect(types).toContain('grammar');
    expect(types).toContain('vocabulary');
  });
});

// ── generateErrorCorrectionQuests ───────────────────────────────────────────

describe('generateErrorCorrectionQuests', () => {
  it('returns empty array when no error patterns exist', () => {
    const progress = makeLanguageProgress();
    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress);
    expect(quests).toHaveLength(0);
  });

  it('generates a grammar correction quest for grammar errors', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ pattern: 'past tense', timesUsedCorrectly: 1, timesUsedIncorrectly: 5 }),
      ],
    });

    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress);
    expect(quests.length).toBeGreaterThanOrEqual(1);
    expect(quests[0].questCategory).toBe('error_correction');
    expect(quests[0].errorPattern.target).toBe('past tense');
  });

  it('generates a vocabulary correction quest for vocabulary errors', () => {
    const progress = makeLanguageProgress({
      vocabulary: [
        makeVocabularyEntry({ word: 'pomme', timesUsedCorrectly: 1, timesUsedIncorrectly: 4 }),
      ],
    });

    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress);
    expect(quests.length).toBeGreaterThanOrEqual(1);
    expect(quests[0].questCategory).toBe('error_correction');
    expect(quests[0].errorPattern.target).toBe('pomme');
  });

  it('generates mixed review quest when both error types present', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ pattern: 'past tense', timesUsedCorrectly: 1, timesUsedIncorrectly: 5 }),
      ],
      vocabulary: [
        makeVocabularyEntry({ word: 'pomme', timesUsedCorrectly: 1, timesUsedIncorrectly: 4 }),
      ],
    });

    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress, { maxQuests: 3 });
    const mixedQuest = quests.find(q => q.templateId === 'mixed_error_review');
    expect(mixedQuest).toBeDefined();
    expect(mixedQuest!.questCategory).toBe('error_correction');
  });

  it('respects maxQuests limit', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ id: 'gp-1', pattern: 'p1', timesUsedCorrectly: 1, timesUsedIncorrectly: 5 }),
        makeGrammarPattern({ id: 'gp-2', pattern: 'p2', timesUsedCorrectly: 2, timesUsedIncorrectly: 6 }),
        makeGrammarPattern({ id: 'gp-3', pattern: 'p3', timesUsedCorrectly: 0, timesUsedIncorrectly: 3 }),
      ],
    });

    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress, { maxQuests: 1 });
    expect(quests).toHaveLength(1);
  });

  it('includes grammar focus in quest objectives', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ pattern: 'article agreement', timesUsedCorrectly: 1, timesUsedIncorrectly: 5 }),
      ],
    });

    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress);
    const quest = quests[0];
    const grammarObj = quest.objectives?.find((o: any) => o.grammarFocus);
    expect(grammarObj).toBeDefined();
    expect(grammarObj.grammarFocus).toBe('article agreement');
  });

  it('includes vocabulary words in quest objectives', () => {
    const progress = makeLanguageProgress({
      vocabulary: [
        makeVocabularyEntry({ word: 'chien', timesUsedCorrectly: 0, timesUsedIncorrectly: 3 }),
      ],
    });

    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress);
    const quest = quests[0];
    const vocabObj = quest.objectives?.find((o: any) => o.vocabularyWords);
    expect(vocabObj).toBeDefined();
    expect(vocabObj.vocabularyWords).toContain('chien');
  });

  it('assigns lower difficulty for very high error rates', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ pattern: 'past tense', timesUsedCorrectly: 0, timesUsedIncorrectly: 5 }),
      ],
    });

    const quests = generateErrorCorrectionQuests(makeWorldContext(), progress);
    expect(quests[0].difficulty).toBe('beginner');
  });
});

// ── computeErrorCorrectionWeight ────────────────────────────────────────────

describe('computeErrorCorrectionWeight', () => {
  it('returns 0 when no errors exist', () => {
    const progress = makeLanguageProgress();
    expect(computeErrorCorrectionWeight(progress)).toBe(0);
  });

  it('returns positive weight when errors exist', () => {
    const progress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ timesUsedCorrectly: 1, timesUsedIncorrectly: 5 }),
      ],
    });

    const weight = computeErrorCorrectionWeight(progress);
    expect(weight).toBeGreaterThan(0);
    expect(weight).toBeLessThanOrEqual(5);
  });

  it('returns higher weight for more severe errors', () => {
    const mildProgress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ timesUsedCorrectly: 3, timesUsedIncorrectly: 2 }),
      ],
    });
    const severeProgress = makeLanguageProgress({
      grammarPatterns: [
        makeGrammarPattern({ timesUsedCorrectly: 1, timesUsedIncorrectly: 10 }),
      ],
    });

    expect(computeErrorCorrectionWeight(severeProgress))
      .toBeGreaterThanOrEqual(computeErrorCorrectionWeight(mildProgress));
  });
});

// ── Error correction templates in QUEST_TEMPLATES ───────────────────────────

describe('error correction templates in QUEST_TEMPLATES', () => {
  it('includes error correction templates in the main template library', () => {
    const errorTemplates = getTemplatesByCategory('error_correction');
    expect(errorTemplates.length).toBeGreaterThanOrEqual(5);
  });

  it('error correction templates have valid structure', () => {
    const errorTemplates = getTemplatesByCategory('error_correction');
    for (const template of errorTemplates) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.category).toBe('error_correction');
      expect(template.objectiveTemplates.length).toBeGreaterThan(0);
      expect(template.rewardScale.xp).toBeGreaterThan(0);
      expect(template.rewardScale.fluency).toBeGreaterThan(0);
    }
  });

  it('ERROR_CORRECTION_TEMPLATES matches templates in QUEST_TEMPLATES', () => {
    const mainTemplates = getTemplatesByCategory('error_correction');
    expect(mainTemplates).toHaveLength(ERROR_CORRECTION_TEMPLATES.length);
    for (const ecTemplate of ERROR_CORRECTION_TEMPLATES) {
      const found = mainTemplates.find(t => t.id === ecTemplate.id);
      expect(found).toBeDefined();
    }
  });
});
