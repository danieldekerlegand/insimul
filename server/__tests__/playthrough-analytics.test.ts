import { describe, it, expect } from 'vitest';
import { computeCrossPlaythroughAnalytics } from '../services/playthrough-analytics';
import type { Playthrough } from '@shared/schema';

function makePlaythrough(overrides: Partial<Playthrough> = {}): Playthrough {
  return {
    id: `pt-${Math.random().toString(36).slice(2, 8)}`,
    userId: 'user-1',
    worldId: 'world-1',
    worldSnapshotVersion: 1,
    name: 'Test Playthrough',
    description: null,
    notes: null,
    status: 'active',
    currentTimestep: 10,
    playtime: 600,
    actionsCount: 50,
    decisionsCount: 5,
    startedAt: new Date('2026-03-01T10:00:00Z'),
    lastPlayedAt: new Date('2026-03-01T11:00:00Z'),
    completedAt: null,
    playerCharacterId: null,
    saveData: {},
    createdAt: new Date('2026-03-01T10:00:00Z'),
    updatedAt: new Date('2026-03-01T11:00:00Z'),
    ...overrides,
  } as Playthrough;
}

describe('computeCrossPlaythroughAnalytics', () => {
  it('returns zeroed analytics for empty input', () => {
    const result = computeCrossPlaythroughAnalytics([]);
    expect(result.totalPlaythroughs).toBe(0);
    expect(result.uniquePlayers).toBe(0);
    expect(result.totalPlaytime).toBe(0);
    expect(result.avgPlaytime).toBe(0);
    expect(result.medianPlaytime).toBe(0);
    expect(result.totalActions).toBe(0);
    expect(result.avgActions).toBe(0);
    expect(result.completionRate).toBe(0);
    expect(result.avgTimestep).toBe(0);
    expect(result.byStatus).toEqual([]);
    expect(result.engagementTimeline).toEqual([]);
    expect(result.topPlayersByPlaytime).toEqual([]);
    expect(result.topPlayersByActions).toEqual([]);
  });

  it('computes basic counts correctly', () => {
    const playthroughs = [
      makePlaythrough({ userId: 'user-1', status: 'active' }),
      makePlaythrough({ userId: 'user-2', status: 'completed' }),
      makePlaythrough({ userId: 'user-1', status: 'abandoned' }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.totalPlaythroughs).toBe(3);
    expect(result.uniquePlayers).toBe(2);
  });

  it('computes status breakdown with percentages', () => {
    const playthroughs = [
      makePlaythrough({ status: 'active' }),
      makePlaythrough({ status: 'active' }),
      makePlaythrough({ status: 'completed' }),
      makePlaythrough({ status: 'abandoned' }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    const activeStatus = result.byStatus.find(s => s.status === 'active');
    expect(activeStatus?.count).toBe(2);
    expect(activeStatus?.percentage).toBe(0.5);

    const completedStatus = result.byStatus.find(s => s.status === 'completed');
    expect(completedStatus?.count).toBe(1);
    expect(completedStatus?.percentage).toBe(0.25);
  });

  it('computes completion rate from completed and abandoned only', () => {
    const playthroughs = [
      makePlaythrough({ status: 'completed' }),
      makePlaythrough({ status: 'completed' }),
      makePlaythrough({ status: 'abandoned' }),
      makePlaythrough({ status: 'active' }), // not counted
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    // 2 completed / (2 completed + 1 abandoned) = 2/3
    expect(result.completionRate).toBeCloseTo(2 / 3);
  });

  it('computes playtime stats correctly', () => {
    const playthroughs = [
      makePlaythrough({ playtime: 100 }),
      makePlaythrough({ playtime: 200 }),
      makePlaythrough({ playtime: 300 }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.totalPlaytime).toBe(600);
    expect(result.avgPlaytime).toBe(200);
    expect(result.medianPlaytime).toBe(200);
  });

  it('computes median correctly for even number of items', () => {
    const playthroughs = [
      makePlaythrough({ playtime: 100 }),
      makePlaythrough({ playtime: 200 }),
      makePlaythrough({ playtime: 300 }),
      makePlaythrough({ playtime: 400 }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.medianPlaytime).toBe(250); // (200 + 300) / 2
  });

  it('aggregates actions and decisions', () => {
    const playthroughs = [
      makePlaythrough({ actionsCount: 10, decisionsCount: 2 }),
      makePlaythrough({ actionsCount: 30, decisionsCount: 8 }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.totalActions).toBe(40);
    expect(result.avgActions).toBe(20);
    expect(result.totalDecisions).toBe(10);
  });

  it('computes average timestep from non-zero values', () => {
    const playthroughs = [
      makePlaythrough({ currentTimestep: 0 }),
      makePlaythrough({ currentTimestep: 10 }),
      makePlaythrough({ currentTimestep: 20 }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    // Only 10 and 20 count (0 is filtered)
    expect(result.avgTimestep).toBe(15);
  });

  it('builds engagement timeline from start dates', () => {
    const playthroughs = [
      makePlaythrough({ startedAt: new Date('2026-03-01T10:00:00Z'), lastPlayedAt: new Date('2026-03-01T11:00:00Z') }),
      makePlaythrough({ startedAt: new Date('2026-03-01T14:00:00Z'), lastPlayedAt: new Date('2026-03-02T09:00:00Z') }),
      makePlaythrough({ startedAt: new Date('2026-03-02T08:00:00Z'), lastPlayedAt: new Date('2026-03-02T10:00:00Z') }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.engagementTimeline.length).toBe(2); // 2 unique dates
    const day1 = result.engagementTimeline.find(p => p.date === '2026-03-01');
    expect(day1?.started).toBe(2);
    expect(day1?.activeSessions).toBe(1); // only 1 lastPlayedAt on 03-01
  });

  it('builds player leaderboards', () => {
    const playthroughs = [
      makePlaythrough({ userId: 'alice', playtime: 500, actionsCount: 10 }),
      makePlaythrough({ userId: 'alice', playtime: 300, actionsCount: 20 }),
      makePlaythrough({ userId: 'bob', playtime: 1000, actionsCount: 5 }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    // Bob has most playtime (1000)
    expect(result.topPlayersByPlaytime[0].userId).toBe('bob');
    expect(result.topPlayersByPlaytime[0].totalPlaytime).toBe(1000);

    // Alice has most actions (30)
    expect(result.topPlayersByActions[0].userId).toBe('alice');
    expect(result.topPlayersByActions[0].totalActions).toBe(30);
    expect(result.topPlayersByActions[0].playthroughCount).toBe(2);
  });

  it('builds playtime distribution buckets', () => {
    const playthroughs = [
      makePlaythrough({ playtime: 30 }),    // <1m (< 60)
      makePlaythrough({ playtime: 120 }),   // 1-5m (60-300)
      makePlaythrough({ playtime: 600 }),   // 5-15m (300-900)
      makePlaythrough({ playtime: 4000 }),  // 1-2h (3600-7200)
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.playtimeDistribution.find(b => b.label === '<1m')?.count).toBe(1);
    expect(result.playtimeDistribution.find(b => b.label === '1-5m')?.count).toBe(1);
    expect(result.playtimeDistribution.find(b => b.label === '5-15m')?.count).toBe(1);
    expect(result.playtimeDistribution.find(b => b.label === '1-2h')?.count).toBe(1);
  });

  it('builds actions distribution buckets', () => {
    const playthroughs = [
      makePlaythrough({ actionsCount: 5 }),    // <10
      makePlaythrough({ actionsCount: 75 }),   // 50-100
      makePlaythrough({ actionsCount: 600 }),  // 500-1k
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.actionsDistribution.find(b => b.label === '<10')?.count).toBe(1);
    expect(result.actionsDistribution.find(b => b.label === '50-100')?.count).toBe(1);
    expect(result.actionsDistribution.find(b => b.label === '500-1k')?.count).toBe(1);
  });

  it('handles null/undefined fields gracefully', () => {
    const playthroughs = [
      makePlaythrough({
        playtime: null as any,
        actionsCount: null as any,
        decisionsCount: null as any,
        currentTimestep: null as any,
        lastPlayedAt: null,
        startedAt: null,
      }),
    ];

    const result = computeCrossPlaythroughAnalytics(playthroughs);

    expect(result.totalPlaytime).toBe(0);
    expect(result.totalActions).toBe(0);
    expect(result.totalDecisions).toBe(0);
    expect(result.avgTimestep).toBe(0);
  });
});
