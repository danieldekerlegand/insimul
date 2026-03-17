import { describe, it, expect } from 'vitest';
import {
  buildLearningProfile,
  SKILL_TO_CATEGORIES,
  type QuestRecord,
  type AssessmentRecord,
} from '../../shared/language/learning-profile';
import type { PlayerProficiency } from '../../shared/language/utils';

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
    objectives: [
      { type: 'collect_vocabulary', requiredCount: 5, currentCount: 5, completed: true },
    ],
    ...overrides,
  };
}

function makeAssessment(overrides: Partial<AssessmentRecord> = {}): AssessmentRecord {
  return {
    cefrLevel: 'A2',
    dimensionScores: {
      comprehension: 3,
      fluency: 3,
      vocabulary: 3,
      grammar: 3,
      pronunciation: 3,
    },
    completedAt: Date.now(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Learning Profile', () => {
  describe('buildLearningProfile', () => {
    it('builds a profile with empty history', () => {
      const profile = buildLearningProfile(makeProficiency(), [], []);

      expect(profile.totalQuestsCompleted).toBe(0);
      expect(profile.totalQuestsAttempted).toBe(0);
      expect(profile.categoryPerformance).toHaveLength(0);
      expect(profile.weakCategories).toHaveLength(0);
      expect(profile.strongCategories).toHaveLength(0);
      expect(profile.unexploredCategories.length).toBeGreaterThan(0);
      expect(profile.cefrLevel).toBeNull();
    });

    it('counts completed and attempted quests correctly', () => {
      const quests: QuestRecord[] = [
        makeQuest({ status: 'completed' }),
        makeQuest({ status: 'completed' }),
        makeQuest({ status: 'failed' }),
        makeQuest({ status: 'abandoned' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);

      expect(profile.totalQuestsCompleted).toBe(2);
      expect(profile.totalQuestsAttempted).toBe(4);
    });

    it('computes per-category performance', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
        makeQuest({ questType: 'vocabulary', status: 'failed' }),
        makeQuest({ questType: 'conversation', status: 'completed' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);

      const vocabPerf = profile.categoryPerformance.find(cp => cp.category === 'vocabulary');
      expect(vocabPerf).toBeDefined();
      expect(vocabPerf!.attempted).toBe(3);
      expect(vocabPerf!.completed).toBe(2);
      expect(vocabPerf!.failed).toBe(1);
      expect(vocabPerf!.successRate).toBeCloseTo(2 / 3);

      const convPerf = profile.categoryPerformance.find(cp => cp.category === 'conversation');
      expect(convPerf).toBeDefined();
      expect(convPerf!.attempted).toBe(1);
      expect(convPerf!.successRate).toBe(1);
    });

    it('identifies weak categories (success rate < 0.5 with >= 2 attempts)', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'grammar', status: 'failed' }),
        makeQuest({ questType: 'grammar', status: 'failed' }),
        makeQuest({ questType: 'grammar', status: 'completed' }),
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
        makeQuest({ questType: 'vocabulary', status: 'completed' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);

      // grammar: 1/3 = 0.33 < 0.5 → weak
      expect(profile.weakCategories).toContain('grammar');
      // vocabulary: 2/2 = 1.0 → not weak
      expect(profile.weakCategories).not.toContain('vocabulary');
    });

    it('identifies strong categories (success rate >= 0.8 with >= 2 attempts)', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'conversation', status: 'completed' }),
        makeQuest({ questType: 'conversation', status: 'completed' }),
        makeQuest({ questType: 'conversation', status: 'completed' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);

      expect(profile.strongCategories).toContain('conversation');
    });

    it('does not classify categories with < 2 attempts as weak or strong', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'grammar', status: 'failed' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);

      expect(profile.weakCategories).not.toContain('grammar');
      expect(profile.strongCategories).not.toContain('grammar');
    });

    it('lists unexplored categories', () => {
      const quests: QuestRecord[] = [
        makeQuest({ questType: 'vocabulary' }),
        makeQuest({ questType: 'conversation' }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);

      expect(profile.unexploredCategories).toContain('grammar');
      expect(profile.unexploredCategories).toContain('navigation');
      expect(profile.unexploredCategories).not.toContain('vocabulary');
      expect(profile.unexploredCategories).not.toContain('conversation');
    });
  });

  describe('skill profile from assessments', () => {
    it('returns default 0.5 scores with no assessments', () => {
      const profile = buildLearningProfile(makeProficiency(), [], []);

      expect(profile.skillProfile.comprehension).toBe(0.5);
      expect(profile.skillProfile.fluency).toBe(0.5);
      expect(profile.skillProfile.vocabulary).toBe(0.5);
      expect(profile.skillProfile.grammar).toBe(0.5);
      expect(profile.skillProfile.pronunciation).toBe(0.5);
    });

    it('normalizes assessment scores (1-5) to 0-1', () => {
      const assessments: AssessmentRecord[] = [
        makeAssessment({
          dimensionScores: {
            comprehension: 5, // (5-1)/4 = 1.0
            fluency: 1,       // (1-1)/4 = 0.0
            vocabulary: 3,    // (3-1)/4 = 0.5
            grammar: 4,       // (4-1)/4 = 0.75
            pronunciation: 2, // (2-1)/4 = 0.25
          },
        }),
      ];

      const profile = buildLearningProfile(makeProficiency(), [], assessments);

      expect(profile.skillProfile.comprehension).toBeCloseTo(1.0);
      expect(profile.skillProfile.fluency).toBeCloseTo(0.0);
      expect(profile.skillProfile.vocabulary).toBeCloseTo(0.5);
      expect(profile.skillProfile.grammar).toBeCloseTo(0.75);
      expect(profile.skillProfile.pronunciation).toBeCloseTo(0.25);
    });

    it('averages across multiple assessments', () => {
      const assessments: AssessmentRecord[] = [
        makeAssessment({ dimensionScores: { vocabulary: 2 } }), // 0.25
        makeAssessment({ dimensionScores: { vocabulary: 4 } }), // 0.75
      ];

      const profile = buildLearningProfile(makeProficiency(), [], assessments);

      // Average: (0.25 + 0.75) / 2 = 0.5
      expect(profile.skillProfile.vocabulary).toBeCloseTo(0.5);
    });

    it('identifies weak skills (< 0.4)', () => {
      const assessments: AssessmentRecord[] = [
        makeAssessment({
          dimensionScores: {
            comprehension: 1, // 0.0
            fluency: 2,       // 0.25
            vocabulary: 4,    // 0.75
            grammar: 1,       // 0.0
            pronunciation: 5, // 1.0
          },
        }),
      ];

      const profile = buildLearningProfile(makeProficiency(), [], assessments);

      expect(profile.weakSkills).toContain('comprehension');
      expect(profile.weakSkills).toContain('fluency');
      expect(profile.weakSkills).toContain('grammar');
      expect(profile.weakSkills).not.toContain('vocabulary');
      expect(profile.weakSkills).not.toContain('pronunciation');
    });

    it('identifies strong skills (>= 0.7)', () => {
      const assessments: AssessmentRecord[] = [
        makeAssessment({
          dimensionScores: {
            comprehension: 5, // 1.0
            fluency: 4,       // 0.75
            vocabulary: 2,    // 0.25
            grammar: 2,       // 0.25
            pronunciation: 4, // 0.75
          },
        }),
      ];

      const profile = buildLearningProfile(makeProficiency(), [], assessments);

      expect(profile.strongSkills).toContain('comprehension');
      expect(profile.strongSkills).toContain('fluency');
      expect(profile.strongSkills).toContain('pronunciation');
      expect(profile.strongSkills).not.toContain('vocabulary');
    });
  });

  describe('CEFR level extraction', () => {
    it('returns null with no assessments', () => {
      const profile = buildLearningProfile(makeProficiency(), [], []);
      expect(profile.cefrLevel).toBeNull();
    });

    it('extracts CEFR level from most recent assessment', () => {
      const assessments: AssessmentRecord[] = [
        makeAssessment({ cefrLevel: 'A1', completedAt: 1000 }),
        makeAssessment({ cefrLevel: 'B1', completedAt: 3000 }),
        makeAssessment({ cefrLevel: 'A2', completedAt: 2000 }),
      ];

      const profile = buildLearningProfile(makeProficiency(), [], assessments);

      expect(profile.cefrLevel).toBe('B1');
    });
  });

  describe('objective completion tracking', () => {
    it('computes average objective completion rate', () => {
      const quests: QuestRecord[] = [
        makeQuest({
          questType: 'vocabulary',
          status: 'completed',
          objectives: [
            { type: 'collect_vocabulary', requiredCount: 5, currentCount: 5, completed: true },
            { type: 'visit_location', requiredCount: 1, currentCount: 1, completed: true },
          ],
        }),
        makeQuest({
          questType: 'vocabulary',
          status: 'failed',
          objectives: [
            { type: 'collect_vocabulary', requiredCount: 5, currentCount: 2, completed: false },
            { type: 'visit_location', requiredCount: 1, currentCount: 1, completed: true },
          ],
        }),
      ];

      const profile = buildLearningProfile(makeProficiency(), quests, []);

      const vocabPerf = profile.categoryPerformance.find(cp => cp.category === 'vocabulary');
      // Quest 1: 2/2 = 1.0, Quest 2: 1/2 = 0.5, Average: 0.75
      expect(vocabPerf!.avgObjectiveCompletion).toBeCloseTo(0.75);
    });
  });

  describe('SKILL_TO_CATEGORIES mapping', () => {
    it('maps all skill dimensions to at least one category', () => {
      const dimensions = ['comprehension', 'fluency', 'vocabulary', 'grammar', 'pronunciation'] as const;
      for (const dim of dimensions) {
        expect(SKILL_TO_CATEGORIES[dim].length).toBeGreaterThan(0);
      }
    });
  });
});
