import { describe, it, expect } from 'vitest';
import { computeLearningOutcomes } from '../../shared/quests/quest-analytics.js';
import type { Quest } from '../../shared/schema';

let counter = 0;
function makeQuest(overrides: Partial<Quest> = {}): Quest {
  counter++;
  return {
    id: `quest-${counter}`,
    worldId: 'world-1',
    assignedTo: 'Player',
    assignedBy: 'NPC',
    assignedToCharacterId: null,
    assignedByCharacterId: null,
    title: `Quest ${counter}`,
    description: 'A test quest',
    questType: 'vocabulary',
    difficulty: 'beginner',
    cefrLevel: 'A1',
    difficultyStars: 1,
    estimatedMinutes: 10,
    targetLanguage: 'French',
    gameType: 'language-learning',
    questChainId: null,
    questChainOrder: null,
    prerequisiteQuestIds: null,
    objectives: [],
    progress: {},
    status: 'active',
    completionCriteria: {},
    experienceReward: 50,
    rewards: {},
    itemRewards: null,
    skillRewards: null,
    unlocks: null,
    stages: null,
    currentStageId: null,
    parentQuestId: null,
    failureConditions: null,
    attemptCount: 1,
    maxAttempts: 3,
    abandonedAt: null,
    failedAt: null,
    failureReason: null,
    abandonReason: null,
    locationId: null,
    locationName: null,
    locationPosition: null,
    recurrencePattern: null,
    recurrenceResetAt: null,
    completionCount: 0,
    lastCompletedAt: null,
    sourceQuestId: null,
    streakCount: 0,
    assignedAt: new Date('2026-01-01'),
    completedAt: null,
    expiresAt: null,
    conversationContext: null,
    tags: [],
    content: null,
    relatedTruthIds: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as Quest;
}

describe('Learning Progress Visualization data', () => {
  describe('skill trajectory data from progressionTimeline', () => {
    it('builds timeline with multiple quest types for skill trajectory plotting', () => {
      const quests = [
        makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date('2026-01-01'), experienceReward: 50 }),
        makeQuest({ assignedTo: 'Player', questType: 'conversation', status: 'completed', completedAt: new Date('2026-01-02'), experienceReward: 60 }),
        makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'completed', completedAt: new Date('2026-01-03'), experienceReward: 70 }),
        makeQuest({ assignedTo: 'Player', questType: 'listening_comprehension', status: 'completed', completedAt: new Date('2026-01-04'), experienceReward: 80 }),
        makeQuest({ assignedTo: 'Player', questType: 'pronunciation', status: 'failed', failedAt: new Date('2026-01-05'), experienceReward: 40 }),
      ];

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');

      expect(result.progressionTimeline).toHaveLength(5);
      // Each point should have questType for category-based trajectory computation
      const types = result.progressionTimeline.map(p => p.questType);
      expect(types).toContain('vocabulary');
      expect(types).toContain('conversation');
      expect(types).toContain('grammar');
      expect(types).toContain('listening_comprehension');
      expect(types).toContain('pronunciation');
    });

    it('cumulative XP grows monotonically (failures add 0)', () => {
      const quests = [
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-01'), experienceReward: 100 }),
        makeQuest({ assignedTo: 'Player', status: 'failed', failedAt: new Date('2026-01-02'), experienceReward: 50 }),
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-03'), experienceReward: 200 }),
      ];

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      const xpValues = result.progressionTimeline.map(p => p.cumulativeXp);

      expect(xpValues).toEqual([100, 100, 300]);
      // Monotonically non-decreasing
      for (let i = 1; i < xpValues.length; i++) {
        expect(xpValues[i]).toBeGreaterThanOrEqual(xpValues[i - 1]);
      }
    });

    it('timeline is sorted chronologically regardless of input order', () => {
      const quests = [
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-05'), experienceReward: 30 }),
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-01'), experienceReward: 10 }),
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-03'), experienceReward: 20 }),
      ];

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      const timestamps = result.progressionTimeline.map(p => p.timestamp);

      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
      }
    });
  });

  describe('category mastery for visualization', () => {
    it('mastery combines success rate and volume', () => {
      const quests = [
        // High success, low volume
        makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
        // High success, high volume
        ...Array.from({ length: 10 }, (_, i) =>
          makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'completed', completedAt: new Date(Date.now() + i) }),
        ),
      ];

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      const vocab = result.categoryProgress.find(c => c.category === 'vocabulary')!;
      const grammar = result.categoryProgress.find(c => c.category === 'grammar')!;

      // Both have 100% success rate, but grammar has higher volume so higher mastery
      expect(grammar.mastery).toBeGreaterThan(vocab.mastery);
    });

    it('failed quests reduce mastery', () => {
      const quests = [
        makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
        makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
        makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'failed', failedAt: new Date() }),
        makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'failed', failedAt: new Date() }),
      ];

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      const vocab = result.categoryProgress.find(c => c.category === 'vocabulary')!;
      const grammar = result.categoryProgress.find(c => c.category === 'grammar')!;

      expect(vocab.mastery).toBeGreaterThan(grammar.mastery);
      expect(grammar.mastery).toBe(0); // 0 completions = 0 success rate and 0 volume
    });

    it('mastery is bounded between 0 and 1', () => {
      const quests = Array.from({ length: 50 }, (_, i) =>
        makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date(Date.now() + i) }),
      );

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      for (const cp of result.categoryProgress) {
        expect(cp.mastery).toBeGreaterThanOrEqual(0);
        expect(cp.mastery).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('skill scores from category performance', () => {
    it('skill scores reflect performance in related categories', () => {
      // vocabulary category maps to 'vocabulary' skill dimension
      const quests = Array.from({ length: 10 }, (_, i) =>
        makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date(Date.now() + i) }),
      );

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      // vocabulary skill should be higher than default 0.5
      expect(result.skillScores.vocabulary).toBeGreaterThan(0.5);
    });

    it('all skill dimensions are present in scores', () => {
      const quests = [
        makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      ];

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      const dimensions = ['comprehension', 'fluency', 'vocabulary', 'grammar', 'pronunciation'] as const;
      for (const dim of dimensions) {
        expect(typeof result.skillScores[dim]).toBe('number');
        expect(result.skillScores[dim]).toBeGreaterThanOrEqual(0);
        expect(result.skillScores[dim]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('CEFR level progression', () => {
    it('tracks current CEFR from recent quests', () => {
      const quests = [
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-01'), cefrLevel: 'A1' }),
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-10'), cefrLevel: 'B1' }),
        makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-15'), cefrLevel: 'A2' }),
      ];

      const result = computeLearningOutcomes(quests, 'Player', 'world-1');
      // Current is from recent quests — highest among last 10
      expect(result.currentCefrLevel).toBe('B1');
      expect(result.highestCefrCompleted).toBe('B1');
    });
  });
});
