import { describe, it, expect } from 'vitest';
import { buildPortfolioSummary, buildLearningJournal } from '../../server/services/quest-portfolio';
import type { Quest } from '../schema';

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'q1',
    worldId: 'w1',
    assignedTo: 'Player',
    assignedBy: 'NPC1',
    title: 'Test Quest',
    description: 'A test quest',
    questType: 'vocabulary',
    difficulty: 'beginner',
    targetLanguage: 'French',
    status: 'completed',
    experienceReward: 100,
    streakCount: 1,
    completedAt: new Date('2026-03-15T10:00:00Z'),
    tags: ['vocab'],
    questChainId: null,
    skillRewards: null,
    cefrLevel: 'A1',
    // Other fields with defaults
    assignedToCharacterId: null,
    assignedByCharacterId: null,
    difficultyStars: null,
    estimatedMinutes: null,
    gameType: 'language-learning',
    questChainOrder: null,
    prerequisiteQuestIds: null,
    objectives: [],
    progress: {},
    completionCriteria: {},
    rewards: {},
    itemRewards: null,
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
    assignedAt: new Date(),
    expiresAt: null,
    conversationContext: null,
    content: null,
    relatedTruthIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Quest;
}

describe('buildPortfolioSummary', () => {
  it('returns empty summary for no quests', () => {
    const summary = buildPortfolioSummary([]);
    expect(summary.totalCompleted).toBe(0);
    expect(summary.totalXP).toBe(0);
    expect(summary.longestStreak).toBe(0);
    expect(summary.currentStreak).toBe(0);
    expect(summary.uniqueQuestGivers).toBe(0);
    expect(summary.chainsCompleted).toBe(0);
  });

  it('counts total completed and XP', () => {
    const quests = [
      makeQuest({ id: 'q1', experienceReward: 100 }),
      makeQuest({ id: 'q2', experienceReward: 200 }),
    ];
    const summary = buildPortfolioSummary(quests);
    expect(summary.totalCompleted).toBe(2);
    expect(summary.totalXP).toBe(300);
  });

  it('tracks quest type breakdown', () => {
    const quests = [
      makeQuest({ id: 'q1', questType: 'vocabulary' }),
      makeQuest({ id: 'q2', questType: 'vocabulary' }),
      makeQuest({ id: 'q3', questType: 'grammar' }),
    ];
    const summary = buildPortfolioSummary(quests);
    expect(summary.byType).toEqual({ vocabulary: 2, grammar: 1 });
  });

  it('tracks difficulty breakdown', () => {
    const quests = [
      makeQuest({ id: 'q1', difficulty: 'beginner' }),
      makeQuest({ id: 'q2', difficulty: 'intermediate' }),
      makeQuest({ id: 'q3', difficulty: 'intermediate' }),
    ];
    const summary = buildPortfolioSummary(quests);
    expect(summary.byDifficulty).toEqual({ beginner: 1, intermediate: 2 });
  });

  it('finds longest streak', () => {
    const quests = [
      makeQuest({ id: 'q1', streakCount: 3 }),
      makeQuest({ id: 'q2', streakCount: 7 }),
      makeQuest({ id: 'q3', streakCount: 2 }),
    ];
    const summary = buildPortfolioSummary(quests);
    expect(summary.longestStreak).toBe(7);
  });

  it('current streak is from most recently completed quest', () => {
    const quests = [
      makeQuest({ id: 'q1', streakCount: 3, completedAt: new Date('2026-03-10') }),
      makeQuest({ id: 'q2', streakCount: 5, completedAt: new Date('2026-03-15') }),
      makeQuest({ id: 'q3', streakCount: 2, completedAt: new Date('2026-03-12') }),
    ];
    const summary = buildPortfolioSummary(quests);
    expect(summary.currentStreak).toBe(5);
  });

  it('counts unique quest givers', () => {
    const quests = [
      makeQuest({ id: 'q1', assignedBy: 'NPC1' }),
      makeQuest({ id: 'q2', assignedBy: 'NPC1' }),
      makeQuest({ id: 'q3', assignedBy: 'NPC2' }),
    ];
    const summary = buildPortfolioSummary(quests);
    expect(summary.uniqueQuestGivers).toBe(2);
  });

  it('counts unique quest chains', () => {
    const quests = [
      makeQuest({ id: 'q1', questChainId: 'chain1' }),
      makeQuest({ id: 'q2', questChainId: 'chain1' }),
      makeQuest({ id: 'q3', questChainId: 'chain2' }),
      makeQuest({ id: 'q4', questChainId: null }),
    ];
    const summary = buildPortfolioSummary(quests);
    expect(summary.chainsCompleted).toBe(2);
  });
});

describe('buildLearningJournal', () => {
  it('returns empty for no quests', () => {
    const journal = buildLearningJournal([]);
    expect(journal).toEqual([]);
  });

  it('groups quests by day', () => {
    const quests = [
      makeQuest({ id: 'q1', completedAt: new Date('2026-03-15T10:00:00Z') }),
      makeQuest({ id: 'q2', completedAt: new Date('2026-03-15T14:00:00Z') }),
      makeQuest({ id: 'q3', completedAt: new Date('2026-03-14T10:00:00Z') }),
    ];
    const journal = buildLearningJournal(quests);
    expect(journal).toHaveLength(2);
    // Most recent first
    expect(journal[0].date).toBe('2026-03-15');
    expect(journal[0].questsCompleted).toBe(2);
    expect(journal[1].date).toBe('2026-03-14');
    expect(journal[1].questsCompleted).toBe(1);
  });

  it('aggregates XP per day', () => {
    const quests = [
      makeQuest({ id: 'q1', experienceReward: 100, completedAt: new Date('2026-03-15T10:00:00Z') }),
      makeQuest({ id: 'q2', experienceReward: 50, completedAt: new Date('2026-03-15T14:00:00Z') }),
    ];
    const journal = buildLearningJournal(quests);
    expect(journal[0].xpEarned).toBe(150);
  });

  it('tracks unique skill types per day', () => {
    const quests = [
      makeQuest({ id: 'q1', questType: 'vocabulary', completedAt: new Date('2026-03-15T10:00:00Z') }),
      makeQuest({ id: 'q2', questType: 'vocabulary', completedAt: new Date('2026-03-15T11:00:00Z') }),
      makeQuest({ id: 'q3', questType: 'grammar', completedAt: new Date('2026-03-15T12:00:00Z') }),
    ];
    const journal = buildLearningJournal(quests);
    expect(journal[0].skillsPracticed).toEqual(['vocabulary', 'grammar']);
  });

  it('picks highest difficulty per day', () => {
    const quests = [
      makeQuest({ id: 'q1', difficulty: 'beginner', completedAt: new Date('2026-03-15T10:00:00Z') }),
      makeQuest({ id: 'q2', difficulty: 'advanced', completedAt: new Date('2026-03-15T11:00:00Z') }),
      makeQuest({ id: 'q3', difficulty: 'intermediate', completedAt: new Date('2026-03-15T12:00:00Z') }),
    ];
    const journal = buildLearningJournal(quests);
    expect(journal[0].highestDifficulty).toBe('advanced');
  });

  it('picks max streak per day', () => {
    const quests = [
      makeQuest({ id: 'q1', streakCount: 2, completedAt: new Date('2026-03-15T10:00:00Z') }),
      makeQuest({ id: 'q2', streakCount: 5, completedAt: new Date('2026-03-15T11:00:00Z') }),
    ];
    const journal = buildLearningJournal(quests);
    expect(journal[0].streakCount).toBe(5);
  });

  it('handles quests without completedAt', () => {
    const quests = [
      makeQuest({ id: 'q1', completedAt: null }),
      makeQuest({ id: 'q2', completedAt: new Date('2026-03-15T10:00:00Z') }),
    ];
    const journal = buildLearningJournal(quests);
    expect(journal).toHaveLength(1);
  });

  it('sorted most recent first', () => {
    const quests = [
      makeQuest({ id: 'q1', completedAt: new Date('2026-03-10T10:00:00Z') }),
      makeQuest({ id: 'q2', completedAt: new Date('2026-03-15T10:00:00Z') }),
      makeQuest({ id: 'q3', completedAt: new Date('2026-03-12T10:00:00Z') }),
    ];
    const journal = buildLearningJournal(quests);
    expect(journal.map(e => e.date)).toEqual(['2026-03-15', '2026-03-12', '2026-03-10']);
  });
});
