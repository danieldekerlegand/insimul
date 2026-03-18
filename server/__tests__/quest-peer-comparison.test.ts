import { describe, it, expect } from 'vitest';
import {
  computePeerStats,
  computePlayerComparison,
  percentileOf,
  type ComparisonQuest,
} from '../services/quest-peer-comparison';

function makeQuest(overrides: Partial<ComparisonQuest> = {}): ComparisonQuest {
  return {
    assignedTo: 'Player1',
    status: 'completed',
    questType: 'vocabulary',
    difficulty: 'beginner',
    assignedAt: new Date('2026-03-01T10:00:00Z'),
    completedAt: new Date('2026-03-01T10:30:00Z'),
    attemptCount: 1,
    experienceReward: 25,
    ...overrides,
  };
}

describe('percentileOf', () => {
  it('returns 50 for empty array', () => {
    expect(percentileOf(10, [])).toBe(50);
  });

  it('returns 0 when value is the smallest', () => {
    expect(percentileOf(1, [1, 2, 3, 4, 5])).toBe(0);
  });

  it('returns 100 when value exceeds all', () => {
    expect(percentileOf(100, [1, 2, 3, 4, 5])).toBe(100);
  });

  it('returns correct percentile for mid-range value', () => {
    expect(percentileOf(3, [1, 2, 3, 4, 5])).toBe(40);
  });
});

describe('computePeerStats', () => {
  it('returns zeroed stats for empty quest list', () => {
    const stats = computePeerStats([]);
    expect(stats.totalPlayers).toBe(0);
    expect(stats.totalCompletedQuests).toBe(0);
    expect(stats.overall.completedCount).toBe(0);
    expect(stats.overall.successRate).toBe(0);
  });

  it('computes overall stats for completed quests', () => {
    const quests = [
      makeQuest({ assignedTo: 'A' }),
      makeQuest({ assignedTo: 'B' }),
      makeQuest({ assignedTo: 'A', status: 'failed', completedAt: null, failedAt: new Date() }),
    ];
    const stats = computePeerStats(quests);
    expect(stats.totalPlayers).toBe(2);
    expect(stats.totalCompletedQuests).toBe(2);
    expect(stats.overall.completedCount).toBe(2);
    // 2 completed out of 3 terminal
    expect(stats.overall.successRate).toBeCloseTo(0.667, 2);
  });

  it('excludes active quests from stats', () => {
    const quests = [
      makeQuest({ status: 'active', completedAt: null }),
      makeQuest({ status: 'completed' }),
    ];
    const stats = computePeerStats(quests);
    expect(stats.totalCompletedQuests).toBe(1);
    expect(stats.overall.completedCount).toBe(1);
    expect(stats.overall.successRate).toBe(1);
  });

  it('breaks down stats by quest type', () => {
    const quests = [
      makeQuest({ questType: 'vocabulary' }),
      makeQuest({ questType: 'vocabulary' }),
      makeQuest({ questType: 'conversation' }),
    ];
    const stats = computePeerStats(quests);
    expect(stats.byQuestType.vocabulary.completedCount).toBe(2);
    expect(stats.byQuestType.conversation.completedCount).toBe(1);
  });

  it('breaks down stats by difficulty', () => {
    const quests = [
      makeQuest({ difficulty: 'beginner' }),
      makeQuest({ difficulty: 'advanced', experienceReward: 50 }),
    ];
    const stats = computePeerStats(quests);
    expect(stats.byDifficulty.beginner.completedCount).toBe(1);
    expect(stats.byDifficulty.advanced.completedCount).toBe(1);
    expect(stats.byDifficulty.advanced.avgXpEarned).toBe(50);
  });

  it('computes correct average and median completion times', () => {
    const base = new Date('2026-03-01T10:00:00Z');
    const quests = [
      makeQuest({ assignedAt: base, completedAt: new Date(base.getTime() + 10_000) }), // 10s
      makeQuest({ assignedAt: base, completedAt: new Date(base.getTime() + 20_000) }), // 20s
      makeQuest({ assignedAt: base, completedAt: new Date(base.getTime() + 30_000) }), // 30s
    ];
    const stats = computePeerStats(quests);
    expect(stats.overall.avgCompletionTimeMs).toBe(20_000);
    expect(stats.overall.medianCompletionTimeMs).toBe(20_000);
  });

  it('computes average attempts', () => {
    const quests = [
      makeQuest({ attemptCount: 1 }),
      makeQuest({ attemptCount: 3 }),
    ];
    const stats = computePeerStats(quests);
    expect(stats.overall.avgAttempts).toBe(2);
  });

  it('handles quests with null assignedTo', () => {
    const quests = [
      makeQuest({ assignedTo: null }),
      makeQuest({ assignedTo: 'A' }),
    ];
    const stats = computePeerStats(quests);
    // null assignedTo is filtered from player count
    expect(stats.totalPlayers).toBe(1);
    expect(stats.overall.completedCount).toBe(2);
  });

  it('handles abandoned quests in success rate', () => {
    const quests = [
      makeQuest({ status: 'completed' }),
      makeQuest({ status: 'abandoned', completedAt: null, abandonedAt: new Date() }),
    ];
    const stats = computePeerStats(quests);
    expect(stats.overall.successRate).toBe(0.5);
  });
});

describe('computePlayerComparison', () => {
  it('returns player stats and peer stats', () => {
    const quests = [
      makeQuest({ assignedTo: 'Alice' }),
      makeQuest({ assignedTo: 'Alice' }),
      makeQuest({ assignedTo: 'Bob' }),
      makeQuest({ assignedTo: 'Charlie' }),
    ];
    const result = computePlayerComparison(quests, 'Alice');
    expect(result.player.completedCount).toBe(2);
    expect(result.peers.totalPlayers).toBe(3);
    expect(result.peers.totalCompletedQuests).toBe(4);
  });

  it('computes percentile rankings', () => {
    const base = new Date('2026-03-01T10:00:00Z');
    const quests = [
      // Alice: 2 quests, fast completion, 50 XP
      makeQuest({ assignedTo: 'Alice', assignedAt: base, completedAt: new Date(base.getTime() + 5_000), experienceReward: 25 }),
      makeQuest({ assignedTo: 'Alice', assignedAt: base, completedAt: new Date(base.getTime() + 5_000), experienceReward: 25 }),
      // Bob: 1 quest, slow completion, 25 XP
      makeQuest({ assignedTo: 'Bob', assignedAt: base, completedAt: new Date(base.getTime() + 60_000), experienceReward: 25 }),
      // Charlie: 3 quests, medium completion, 75 XP
      makeQuest({ assignedTo: 'Charlie', assignedAt: base, completedAt: new Date(base.getTime() + 30_000), experienceReward: 25 }),
      makeQuest({ assignedTo: 'Charlie', assignedAt: base, completedAt: new Date(base.getTime() + 30_000), experienceReward: 25 }),
      makeQuest({ assignedTo: 'Charlie', assignedAt: base, completedAt: new Date(base.getTime() + 30_000), experienceReward: 25 }),
    ];

    const alice = computePlayerComparison(quests, 'Alice');
    // Alice has fastest time → high completion time percentile (inverted)
    expect(alice.percentiles.completionTime).toBeGreaterThanOrEqual(67);
    // Alice has 2 quests (middle) → mid percentile for quests completed
    expect(alice.percentiles.questsCompleted).toBeGreaterThanOrEqual(33);
    // Alice has 50 XP (middle)
    expect(alice.percentiles.xpEarned).toBeGreaterThanOrEqual(33);
  });

  it('returns 50th percentile defaults when player has no data', () => {
    const quests = [
      makeQuest({ assignedTo: 'Bob' }),
    ];
    const result = computePlayerComparison(quests, 'Alice');
    expect(result.player.completedCount).toBe(0);
    // No completion time → defaults to 50
    expect(result.percentiles.completionTime).toBe(50);
  });

  it('does not leak player names in the response', () => {
    const quests = [
      makeQuest({ assignedTo: 'Alice' }),
      makeQuest({ assignedTo: 'Bob' }),
    ];
    const result = computePlayerComparison(quests, 'Alice');
    const json = JSON.stringify(result);
    expect(json).not.toContain('Alice');
    expect(json).not.toContain('Bob');
  });

  it('handles single player gracefully', () => {
    const quests = [
      makeQuest({ assignedTo: 'Solo' }),
      makeQuest({ assignedTo: 'Solo' }),
    ];
    const result = computePlayerComparison(quests, 'Solo');
    expect(result.player.completedCount).toBe(2);
    expect(result.peers.totalPlayers).toBe(1);
  });

  it('includes failed quests in success rate calculations', () => {
    const quests = [
      makeQuest({ assignedTo: 'Alice', status: 'completed' }),
      makeQuest({ assignedTo: 'Alice', status: 'failed', completedAt: null }),
      makeQuest({ assignedTo: 'Bob', status: 'completed' }),
      makeQuest({ assignedTo: 'Bob', status: 'completed' }),
    ];
    const result = computePlayerComparison(quests, 'Alice');
    expect(result.player.successRate).toBe(0.5);
    // Bob has 100% success rate, Alice has 50% → Alice is at 0th percentile
    expect(result.percentiles.successRate).toBe(0);
  });
});
