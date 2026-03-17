import { describe, it, expect } from 'vitest';
import {
  computeCategoryWeights,
  selectWeightedCategories,
  selectDifficulty,
  generateAdaptiveQuests,
} from '../services/adaptive-quest-generator';
import { buildLearningProfile, type QuestRecord, type AssessmentRecord } from '../../shared/language/learning-profile';
import type { PlayerProficiency } from '../../shared/language/utils';
import type { WorldContext } from '../services/quest-assignment-engine';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeProficiency(overrides: Partial<PlayerProficiency> = {}): PlayerProficiency {
  return {
    overallFluency: 40,
    vocabularyCount: 100,
    masteredWordCount: 40,
    weakGrammarPatterns: [],
    strongGrammarPatterns: [],
    conversationCount: 10,
    ...overrides,
  };
}

function makeQuest(overrides: Partial<QuestRecord> = {}): QuestRecord {
  return {
    id: `quest-${Math.random().toString(36).slice(2, 8)}`,
    questType: 'vocabulary',
    difficulty: 'beginner',
    status: 'completed',
    completedAt: Date.now(),
    objectives: [{ type: 'collect_vocabulary', requiredCount: 5, currentCount: 5, completed: true }],
    ...overrides,
  };
}

function makeAssessment(overrides: Partial<AssessmentRecord> = {}): AssessmentRecord {
  return {
    cefrLevel: 'A2',
    dimensionScores: { comprehension: 3, fluency: 3, vocabulary: 3, grammar: 3, pronunciation: 3 },
    completedAt: Date.now(),
    ...overrides,
  };
}

function makeCtx(): WorldContext {
  return {
    world: {
      id: 'world-1',
      name: 'Test Village',
      description: 'A test world',
      targetLanguage: 'French',
      worldType: 'village',
      gameType: 'language-learning',
    } as any,
    characters: [
      { id: 'npc-1', firstName: 'Marie', lastName: 'Dupont', status: 'active', occupation: 'teacher' } as any,
      { id: 'npc-2', firstName: 'Pierre', lastName: 'Martin', status: 'active', occupation: 'merchant' } as any,
    ],
    settlements: [{ id: 's1', name: 'Petit Village', worldId: 'world-1' } as any],
    existingQuests: [],
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Adaptive Quest Generator', () => {
  describe('computeCategoryWeights', () => {
    it('boosts categories that train weak skills', () => {
      const profile = buildLearningProfile(
        makeProficiency(),
        [],
        [makeAssessment({
          dimensionScores: { comprehension: 1, fluency: 1, vocabulary: 5, grammar: 5, pronunciation: 5 },
        })],
      );

      const weights = computeCategoryWeights(profile);

      // Comprehension is weak → listening_comprehension, follow_instructions, translation_challenge should be boosted
      const listeningWeight = weights.find(w => w.category === 'listening_comprehension');
      const vocabWeight = weights.find(w => w.category === 'vocabulary');

      expect(listeningWeight).toBeDefined();
      expect(listeningWeight!.weight).toBeGreaterThan(0);

      // vocabulary maps to strong skill → should have lower weight than listening
      if (vocabWeight) {
        expect(listeningWeight!.weight).toBeGreaterThanOrEqual(vocabWeight.weight);
      }
    });

    it('boosts weak categories (low success rate)', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'grammar', status: 'failed' }),
        makeQuest({ questType: 'grammar', status: 'failed' }),
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);
      const weights = computeCategoryWeights(profile);

      const grammarWeight = weights.find(w => w.category === 'grammar')!;
      const vocabWeight = weights.find(w => w.category === 'vocabulary')!;

      // Grammar is weak category → should be boosted above strong vocab
      expect(grammarWeight.weight).toBeGreaterThan(vocabWeight.weight);
    });

    it('gives weight to unexplored categories', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'vocabulary' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);
      const weights = computeCategoryWeights(profile);

      const navigationWeight = weights.find(w => w.category === 'navigation');
      expect(navigationWeight).toBeDefined();
      expect(navigationWeight!.weight).toBeGreaterThan(0);
      expect(navigationWeight!.reason).toContain('unexplored');
    });

    it('boosts grammar/conversation when weak grammar patterns exist', () => {
      const profile = buildLearningProfile(
        makeProficiency({ weakGrammarPatterns: ['past tense', 'articles'] }),
        [],
        [],
      );

      const weights = computeCategoryWeights(profile);

      const grammarWeight = weights.find(w => w.category === 'grammar')!;
      expect(grammarWeight.weight).toBeGreaterThan(0);
      expect(grammarWeight.reason).toContain('weak grammar patterns');
    });

    it('all weights are non-negative', () => {
      const quests: QuestRecord[] = Array.from({ length: 20 }, () =>
        makeQuest({ questType: 'conversation', status: 'completed' }),
      );

      const profile = buildLearningProfile(makeProficiency(), quests, []);
      const weights = computeCategoryWeights(profile);

      for (const w of weights) {
        expect(w.weight).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('selectWeightedCategories', () => {
    it('selects the requested number of categories', () => {
      const weights = [
        { category: 'vocabulary', weight: 5, reason: '' },
        { category: 'grammar', weight: 3, reason: '' },
        { category: 'conversation', weight: 2, reason: '' },
        { category: 'navigation', weight: 1, reason: '' },
      ];

      const selected = selectWeightedCategories(weights, 3);
      expect(selected).toHaveLength(3);
    });

    it('does not repeat categories', () => {
      const weights = [
        { category: 'vocabulary', weight: 10, reason: '' },
        { category: 'grammar', weight: 1, reason: '' },
        { category: 'conversation', weight: 1, reason: '' },
      ];

      const selected = selectWeightedCategories(weights, 3);
      const unique = new Set(selected);
      expect(unique.size).toBe(selected.length);
    });

    it('returns fewer categories if not enough weights', () => {
      const weights = [
        { category: 'vocabulary', weight: 5, reason: '' },
      ];

      const selected = selectWeightedCategories(weights, 3);
      expect(selected).toHaveLength(1);
    });

    it('returns empty array for zero-weight categories', () => {
      const weights = [
        { category: 'vocabulary', weight: 0, reason: '' },
      ];

      const selected = selectWeightedCategories(weights, 3);
      expect(selected).toHaveLength(0);
    });

    it('favors higher-weighted categories over many trials', () => {
      const weights = [
        { category: 'high', weight: 100, reason: '' },
        { category: 'low', weight: 1, reason: '' },
      ];

      let highFirst = 0;
      const trials = 100;
      for (let i = 0; i < trials; i++) {
        const selected = selectWeightedCategories(weights, 1);
        if (selected[0] === 'high') highFirst++;
      }

      // High weight should be selected most of the time
      expect(highFirst).toBeGreaterThan(80);
    });
  });

  describe('selectDifficulty', () => {
    it('returns beginner for low fluency', () => {
      const profile = buildLearningProfile(makeProficiency({ overallFluency: 15 }), [], []);
      expect(selectDifficulty(profile, 'vocabulary', 1)).toBe('beginner');
    });

    it('returns intermediate for mid fluency', () => {
      const profile = buildLearningProfile(makeProficiency({ overallFluency: 45 }), [], []);
      expect(selectDifficulty(profile, 'vocabulary', 1)).toBe('intermediate');
    });

    it('returns advanced for high fluency', () => {
      const profile = buildLearningProfile(makeProficiency({ overallFluency: 75 }), [], []);
      expect(selectDifficulty(profile, 'vocabulary', 1)).toBe('advanced');
    });

    it('drops difficulty for categories with low success rate', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'grammar', status: 'failed' }),
        makeQuest({ questType: 'grammar', status: 'failed' }),
        makeQuest({ questType: 'grammar', status: 'failed' }),
      ];

      const profile = buildLearningProfile(makeProficiency({ overallFluency: 45 }), quests, []);

      // Base: intermediate. Category success rate: 0/3 = 0 < 0.4 → drop to beginner
      expect(selectDifficulty(profile, 'grammar', 1)).toBe('beginner');
    });

    it('raises difficulty for categories with very high success rate', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
      ];

      const profile = buildLearningProfile(makeProficiency({ overallFluency: 45 }), quests, []);

      // Base: intermediate. Category success rate: 3/3 = 1.0 >= 0.9 → raise to advanced
      expect(selectDifficulty(profile, 'vocabulary', 1)).toBe('advanced');
    });

    it('uses confidence builder every 3rd quest', () => {
      const profile = buildLearningProfile(makeProficiency({ overallFluency: 45 }), [], []);

      // index 0 → confidence builder (drop from intermediate to beginner)
      expect(selectDifficulty(profile, 'vocabulary', 0)).toBe('beginner');
      // index 1 → normal
      expect(selectDifficulty(profile, 'vocabulary', 1)).toBe('intermediate');
      // index 3 → confidence builder
      expect(selectDifficulty(profile, 'vocabulary', 3)).toBe('beginner');
    });

    it('does not drop below beginner for confidence builder', () => {
      const profile = buildLearningProfile(makeProficiency({ overallFluency: 15 }), [], []);

      // Already beginner → stays beginner on confidence round
      expect(selectDifficulty(profile, 'vocabulary', 0)).toBe('beginner');
    });
  });

  describe('generateAdaptiveQuests', () => {
    it('returns the requested number of quests', () => {
      const profile = buildLearningProfile(makeProficiency(), [], []);
      const quests = generateAdaptiveQuests(makeCtx(), profile, {
        count: 3,
        playerName: 'TestPlayer',
      });

      expect(quests.length).toBe(3);
    });

    it('produces valid quests with all required fields', () => {
      const profile = buildLearningProfile(makeProficiency(), [], []);
      const quests = generateAdaptiveQuests(makeCtx(), profile, {
        count: 2,
        playerName: 'TestPlayer',
      });

      for (const q of quests) {
        expect(q.title).toBeTruthy();
        expect(q.description).toBeTruthy();
        expect(q.questType).toBeTruthy();
        expect(q.difficulty).toBeTruthy();
        expect(q.objectives).toBeInstanceOf(Array);
        expect(q.assignedTo).toBe('TestPlayer');
        expect(q.status).toBe('active');
      }
    });

    it('does not repeat templates', () => {
      const profile = buildLearningProfile(makeProficiency(), [], []);
      const quests = generateAdaptiveQuests(makeCtx(), profile, {
        count: 5,
        playerName: 'TestPlayer',
      });

      const templateIds = quests.map(q => q.templateId);
      const unique = new Set(templateIds);
      expect(unique.size).toBe(templateIds.length);
    });

    it('respects excludeTemplateIds', () => {
      const profile = buildLearningProfile(makeProficiency(), [], []);
      const quests = generateAdaptiveQuests(makeCtx(), profile, {
        count: 5,
        playerName: 'TestPlayer',
        excludeTemplateIds: ['greet_the_locals', 'food_vocabulary'],
      });

      for (const q of quests) {
        expect(q.templateId).not.toBe('greet_the_locals');
        expect(q.templateId).not.toBe('food_vocabulary');
      }
    });

    it('biases toward weak skill categories', () => {
      // Make comprehension very weak
      const assessments: AssessmentRecord[] = [
        makeAssessment({
          dimensionScores: { comprehension: 1, fluency: 5, vocabulary: 5, grammar: 5, pronunciation: 5 },
        }),
      ];

      const profile = buildLearningProfile(makeProficiency(), [], assessments);

      // Generate many quests and check that comprehension-related categories appear
      const allQuests: string[] = [];
      for (let i = 0; i < 10; i++) {
        const quests = generateAdaptiveQuests(makeCtx(), profile, {
          count: 5,
          playerName: 'TestPlayer',
        });
        allQuests.push(...quests.map(q => q.questType));
      }

      // Comprehension trains: listening_comprehension, follow_instructions, translation_challenge
      const comprehensionCategories = ['listening_comprehension', 'follow_instructions', 'translation_challenge'];
      const comprehensionCount = allQuests.filter(c => comprehensionCategories.includes(c)).length;

      // Should appear at least sometimes (probabilistic, but with strong weighting)
      expect(comprehensionCount).toBeGreaterThan(0);
    });
  });
});
