import { describe, it, expect } from 'vitest';
import {
  computeQuestAnalytics,
  computeLearningOutcomes,
  computeObjectiveAnalytics,
} from '../../shared/quests/quest-analytics.js';
import type { Quest } from '../../shared/schema';

// ─── Fixtures ────────────────────────────────────────────────────────────────

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

// ─── computeQuestAnalytics ──────────────────────────────────────────────────

describe('computeQuestAnalytics', () => {
  it('returns zeros for empty quest list', () => {
    const result = computeQuestAnalytics([]);
    expect(result.totalQuests).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.completionRate).toBe(0);
    expect(result.avgCompletionTimeMs).toBeNull();
    expect(result.byQuestType).toHaveLength(0);
  });

  it('counts quest statuses correctly', () => {
    const quests = [
      makeQuest({ status: 'completed', completedAt: new Date('2026-01-02') }),
      makeQuest({ status: 'completed', completedAt: new Date('2026-01-03') }),
      makeQuest({ status: 'failed', failedAt: new Date('2026-01-02') }),
      makeQuest({ status: 'abandoned', abandonedAt: new Date('2026-01-02') }),
      makeQuest({ status: 'active' }),
    ];

    const result = computeQuestAnalytics(quests);
    expect(result.totalQuests).toBe(5);
    expect(result.completed).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.abandoned).toBe(1);
    expect(result.active).toBe(1);
  });

  it('calculates completion rate from finished quests only', () => {
    const quests = [
      makeQuest({ status: 'completed', completedAt: new Date('2026-01-02') }),
      makeQuest({ status: 'failed', failedAt: new Date('2026-01-02') }),
      makeQuest({ status: 'active' }), // active should not count
    ];

    const result = computeQuestAnalytics(quests);
    expect(result.completionRate).toBe(0.5); // 1 completed / 2 finished
  });

  it('computes average completion time', () => {
    const quests = [
      makeQuest({
        status: 'completed',
        assignedAt: new Date('2026-01-01T00:00:00Z'),
        completedAt: new Date('2026-01-01T01:00:00Z'), // 1 hour
      }),
      makeQuest({
        status: 'completed',
        assignedAt: new Date('2026-01-01T00:00:00Z'),
        completedAt: new Date('2026-01-01T03:00:00Z'), // 3 hours
      }),
    ];

    const result = computeQuestAnalytics(quests);
    expect(result.avgCompletionTimeMs).toBe(2 * 60 * 60 * 1000); // 2 hours avg
  });

  it('breaks down by quest type', () => {
    const quests = [
      makeQuest({ questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      makeQuest({ questType: 'vocabulary', status: 'failed', failedAt: new Date() }),
      makeQuest({ questType: 'grammar', status: 'completed', completedAt: new Date() }),
    ];

    const result = computeQuestAnalytics(quests);
    expect(result.byQuestType).toHaveLength(2);

    const vocab = result.byQuestType.find(b => b.questType === 'vocabulary');
    expect(vocab).toBeDefined();
    expect(vocab!.total).toBe(2);
    expect(vocab!.completed).toBe(1);
    expect(vocab!.completionRate).toBe(0.5);

    const grammar = result.byQuestType.find(b => b.questType === 'grammar');
    expect(grammar).toBeDefined();
    expect(grammar!.completionRate).toBe(1);
  });

  it('breaks down by difficulty', () => {
    const quests = [
      makeQuest({ difficulty: 'beginner', status: 'completed', completedAt: new Date() }),
      makeQuest({ difficulty: 'advanced', status: 'failed', failedAt: new Date() }),
    ];

    const result = computeQuestAnalytics(quests);
    expect(result.byDifficulty).toHaveLength(2);
    expect(result.byDifficulty.find(b => b.difficulty === 'beginner')!.completionRate).toBe(1);
    expect(result.byDifficulty.find(b => b.difficulty === 'advanced')!.completionRate).toBe(0);
  });

  it('breaks down by CEFR level', () => {
    const quests = [
      makeQuest({ cefrLevel: 'A1', status: 'completed', completedAt: new Date() }),
      makeQuest({ cefrLevel: 'A1', status: 'completed', completedAt: new Date() }),
      makeQuest({ cefrLevel: 'B1', status: 'failed', failedAt: new Date() }),
    ];

    const result = computeQuestAnalytics(quests);
    expect(result.byCefrLevel).toHaveLength(2);
    expect(result.byCefrLevel.find(b => b.cefrLevel === 'A1')!.completionRate).toBe(1);
    expect(result.byCefrLevel.find(b => b.cefrLevel === 'B1')!.completionRate).toBe(0);
  });

  it('computes average attempts', () => {
    const quests = [
      makeQuest({ attemptCount: 1 }),
      makeQuest({ attemptCount: 3 }),
      makeQuest({ attemptCount: 2 }),
    ];

    const result = computeQuestAnalytics(quests);
    expect(result.avgAttempts).toBe(2);
  });
});

// ─── computeLearningOutcomes ────────────────────────────────────────────────

describe('computeLearningOutcomes', () => {
  it('returns empty results for no quests', () => {
    const result = computeLearningOutcomes([], 'Player', 'world-1');
    expect(result.questsCompleted).toBe(0);
    expect(result.totalXpEarned).toBe(0);
    expect(result.successRate).toBe(0);
    expect(result.currentCefrLevel).toBeNull();
    expect(result.highestCefrCompleted).toBeNull();
    expect(result.progressionTimeline).toHaveLength(0);
  });

  it('filters quests by player name', () => {
    const quests = [
      makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date() }),
      makeQuest({ assignedTo: 'OtherPlayer', status: 'completed', completedAt: new Date() }),
    ];

    const result = computeLearningOutcomes(quests, 'Player', 'world-1');
    expect(result.questsCompleted).toBe(1);
  });

  it('calculates total XP from completed quests only', () => {
    const quests = [
      makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date(), experienceReward: 100 }),
      makeQuest({ assignedTo: 'Player', status: 'failed', failedAt: new Date(), experienceReward: 50 }),
    ];

    const result = computeLearningOutcomes(quests, 'Player', 'world-1');
    expect(result.totalXpEarned).toBe(100); // only completed quest XP
  });

  it('tracks highest CEFR level completed', () => {
    const quests = [
      makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date(), cefrLevel: 'A1' }),
      makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date(), cefrLevel: 'B1' }),
      makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date(), cefrLevel: 'A2' }),
    ];

    const result = computeLearningOutcomes(quests, 'Player', 'world-1');
    expect(result.highestCefrCompleted).toBe('B1');
  });

  it('computes category progress with mastery', () => {
    const quests = [
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'failed', failedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'completed', completedAt: new Date() }),
    ];

    const result = computeLearningOutcomes(quests, 'Player', 'world-1');
    const vocabProgress = result.categoryProgress.find(c => c.category === 'vocabulary');
    expect(vocabProgress).toBeDefined();
    expect(vocabProgress!.questsCompleted).toBe(2);
    expect(vocabProgress!.questsAttempted).toBe(3);
    expect(vocabProgress!.successRate).toBeCloseTo(2 / 3);
    expect(vocabProgress!.mastery).toBeGreaterThan(0);
    expect(vocabProgress!.trainedSkills.length).toBeGreaterThan(0);
  });

  it('identifies strengths and areas for improvement', () => {
    const quests = [
      // Strong category: 3/3 completed
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      // Weak category: 0/3 completed
      makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'failed', failedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'failed', failedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'grammar', status: 'abandoned', abandonedAt: new Date() }),
    ];

    const result = computeLearningOutcomes(quests, 'Player', 'world-1');
    expect(result.strengths).toContain('vocabulary');
    expect(result.areasForImprovement).toContain('grammar');
  });

  it('builds progression timeline in chronological order', () => {
    const quests = [
      makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-03'), experienceReward: 50 }),
      makeQuest({ assignedTo: 'Player', status: 'completed', completedAt: new Date('2026-01-01'), experienceReward: 100 }),
      makeQuest({ assignedTo: 'Player', status: 'failed', failedAt: new Date('2026-01-02'), experienceReward: 75 }),
    ];

    const result = computeLearningOutcomes(quests, 'Player', 'world-1');
    expect(result.progressionTimeline).toHaveLength(3);
    // Should be ordered chronologically
    expect(result.progressionTimeline[0].timestamp).toBeLessThan(result.progressionTimeline[1].timestamp);
    expect(result.progressionTimeline[1].timestamp).toBeLessThan(result.progressionTimeline[2].timestamp);
    // Cumulative XP: 100 (completed), 100 (failed=0), 150 (completed)
    expect(result.progressionTimeline[0].cumulativeXp).toBe(100);
    expect(result.progressionTimeline[1].xpEarned).toBe(0); // failed
    expect(result.progressionTimeline[1].cumulativeXp).toBe(100);
    expect(result.progressionTimeline[2].cumulativeXp).toBe(150);
  });

  it('computes skill scores from category mastery', () => {
    // Vocabulary category trains the 'vocabulary' skill dimension
    const quests = [
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'vocabulary', status: 'completed', completedAt: new Date() }),
      makeQuest({ assignedTo: 'Player', questType: 'conversation', status: 'completed', completedAt: new Date() }),
    ];

    const result = computeLearningOutcomes(quests, 'Player', 'world-1');
    // vocabulary and conversation categories have quests, so their related skills should differ from default 0.5
    expect(result.skillScores).toBeDefined();
    expect(typeof result.skillScores.vocabulary).toBe('number');
    expect(typeof result.skillScores.fluency).toBe('number');
  });
});

// ─── computeObjectiveAnalytics ──────────────────────────────────────────────

describe('computeObjectiveAnalytics', () => {
  it('returns zeros for no quests', () => {
    const result = computeObjectiveAnalytics([]);
    expect(result.topCompletedTypes).toHaveLength(0);
    expect(result.avgObjectivesPerQuest).toBe(0);
    expect(result.overallObjectiveCompletionRate).toBe(0);
  });

  it('counts objective completions by type', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'collect_vocabulary', completed: true },
          { type: 'collect_vocabulary', completed: true },
          { type: 'talk_to_npc', completed: false },
        ] as any,
      }),
      makeQuest({
        objectives: [
          { type: 'collect_vocabulary', completed: true },
          { type: 'visit_location', completed: true },
        ] as any,
      }),
    ];

    const result = computeObjectiveAnalytics(quests);
    const vocabType = result.topCompletedTypes.find(t => t.type === 'collect_vocabulary');
    expect(vocabType).toBeDefined();
    expect(vocabType!.count).toBe(3);
  });

  it('identifies hardest objective types', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'pronunciation_check', completed: false },
          { type: 'pronunciation_check', completed: false },
          { type: 'pronunciation_check', completed: true },
          { type: 'collect_vocabulary', completed: true },
          { type: 'collect_vocabulary', completed: true },
          { type: 'collect_vocabulary', completed: true },
        ] as any,
      }),
    ];

    const result = computeObjectiveAnalytics(quests);
    expect(result.hardestObjectiveTypes.length).toBeGreaterThan(0);
    // pronunciation_check has lower completion rate
    const pronun = result.hardestObjectiveTypes.find(t => t.type === 'pronunciation_check');
    expect(pronun).toBeDefined();
    expect(pronun!.completionRate).toBeCloseTo(1 / 3);
  });

  it('computes average objectives per quest', () => {
    const quests = [
      makeQuest({ objectives: [{ type: 'a', completed: true }, { type: 'b', completed: false }] as any }),
      makeQuest({ objectives: [{ type: 'c', completed: true }] as any }),
      makeQuest({ objectives: [] as any }), // no objectives
    ];

    const result = computeObjectiveAnalytics(quests);
    expect(result.avgObjectivesPerQuest).toBe(1.5); // 3 objectives / 2 quests with objectives
    expect(result.overallObjectiveCompletionRate).toBeCloseTo(2 / 3);
  });
});
