import { describe, it, expect } from 'vitest';
import {
  computePerformanceScore,
  computeDifficultyAdjustment,
  applyAdjustment,
  buildPerformanceRecords,
  type QuestPerformanceRecord,
} from '../quest-difficulty-adjustment';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<QuestPerformanceRecord> = {}): QuestPerformanceRecord {
  return {
    difficulty: 'intermediate',
    status: 'completed',
    objectiveCompletionRate: 1.0,
    attemptCount: 1,
    completionTimeMs: null,
    estimatedTimeMs: null,
    ...overrides,
  };
}

function makeRecords(count: number, overrides: Partial<QuestPerformanceRecord> = {}): QuestPerformanceRecord[] {
  return Array.from({ length: count }, () => makeRecord(overrides));
}

// ─── computePerformanceScore ─────────────────────────────────────────────────

describe('computePerformanceScore', () => {
  it('returns 0.5 for empty records', () => {
    expect(computePerformanceScore([])).toBe(0.5);
  });

  it('returns high score for perfect performance', () => {
    const records = makeRecords(5, {
      status: 'completed',
      objectiveCompletionRate: 1.0,
      attemptCount: 1,
    });
    const score = computePerformanceScore(records);
    expect(score).toBeGreaterThanOrEqual(0.85);
  });

  it('returns low score for poor performance', () => {
    const records = makeRecords(5, {
      status: 'failed',
      objectiveCompletionRate: 0.2,
      attemptCount: 3,
    });
    const score = computePerformanceScore(records);
    expect(score).toBeLessThan(0.4);
  });

  it('returns mid-range score for mixed results', () => {
    const records = [
      makeRecord({ status: 'completed', objectiveCompletionRate: 1.0 }),
      makeRecord({ status: 'failed', objectiveCompletionRate: 0.5 }),
      makeRecord({ status: 'completed', objectiveCompletionRate: 0.8 }),
      makeRecord({ status: 'abandoned', objectiveCompletionRate: 0.0 }),
      makeRecord({ status: 'completed', objectiveCompletionRate: 0.9 }),
    ];
    const score = computePerformanceScore(records);
    expect(score).toBeGreaterThan(0.3);
    expect(score).toBeLessThan(0.8);
  });

  it('factors in time efficiency for timed records', () => {
    const fastRecords = makeRecords(5, {
      completionTimeMs: 60_000,
      estimatedTimeMs: 300_000,
    });
    const slowRecords = makeRecords(5, {
      completionTimeMs: 600_000,
      estimatedTimeMs: 300_000,
    });
    const fastScore = computePerformanceScore(fastRecords);
    const slowScore = computePerformanceScore(slowRecords);
    expect(fastScore).toBeGreaterThan(slowScore);
  });

  it('weights attempt efficiency — fewer attempts scores higher', () => {
    const oneAttempt = makeRecords(5, { attemptCount: 1 });
    const manyAttempts = makeRecords(5, { attemptCount: 4 });
    expect(computePerformanceScore(oneAttempt)).toBeGreaterThan(
      computePerformanceScore(manyAttempts),
    );
  });
});

// ─── computeDifficultyAdjustment ─────────────────────────────────────────────

describe('computeDifficultyAdjustment', () => {
  it('returns no adjustment with insufficient history', () => {
    const records = makeRecords(2);
    const adj = computeDifficultyAdjustment(records, 'intermediate');
    expect(adj.direction).toBe(0);
    expect(adj.confidence).toBe(0);
    expect(adj.recommendedDifficulty).toBe('intermediate');
  });

  it('recommends harder difficulty for high performers', () => {
    const records = makeRecords(5, {
      status: 'completed',
      objectiveCompletionRate: 1.0,
      attemptCount: 1,
    });
    const adj = computeDifficultyAdjustment(records, 'beginner');
    expect(adj.direction).toBe(1);
    expect(adj.recommendedDifficulty).toBe('intermediate');
    expect(adj.confidence).toBeGreaterThan(0);
  });

  it('recommends easier difficulty for struggling players', () => {
    const records = makeRecords(5, {
      status: 'failed',
      objectiveCompletionRate: 0.2,
      attemptCount: 3,
    });
    const adj = computeDifficultyAdjustment(records, 'advanced');
    expect(adj.direction).toBe(-1);
    expect(adj.recommendedDifficulty).toBe('intermediate');
  });

  it('stays at beginner when already easiest and struggling', () => {
    const records = makeRecords(5, {
      status: 'failed',
      objectiveCompletionRate: 0.1,
      attemptCount: 4,
    });
    const adj = computeDifficultyAdjustment(records, 'beginner');
    expect(adj.direction).toBe(-1);
    expect(adj.recommendedDifficulty).toBe('beginner');
    expect(adj.objectiveCountMultiplier).toBeLessThan(1.0);
    expect(adj.timeMultiplier).toBeGreaterThan(1.0);
  });

  it('stays at advanced when already hardest and excelling', () => {
    const records = makeRecords(5, {
      status: 'completed',
      objectiveCompletionRate: 1.0,
      attemptCount: 1,
    });
    const adj = computeDifficultyAdjustment(records, 'advanced');
    expect(adj.direction).toBe(1);
    expect(adj.recommendedDifficulty).toBe('advanced');
    expect(adj.objectiveCountMultiplier).toBeGreaterThan(1.0);
  });

  it('maintains difficulty in the flow zone', () => {
    const records = [
      makeRecord({ status: 'completed', objectiveCompletionRate: 0.9 }),
      makeRecord({ status: 'completed', objectiveCompletionRate: 0.7 }),
      makeRecord({ status: 'failed', objectiveCompletionRate: 0.4 }),
      makeRecord({ status: 'completed', objectiveCompletionRate: 0.8 }),
      makeRecord({ status: 'completed', objectiveCompletionRate: 0.6 }),
    ];
    const adj = computeDifficultyAdjustment(records, 'intermediate');
    expect(adj.direction).toBe(0);
    expect(adj.recommendedDifficulty).toBe('intermediate');
    expect(adj.objectiveCountMultiplier).toBe(1.0);
    expect(adj.timeMultiplier).toBe(1.0);
  });

  it('uses only the most recent window of records', () => {
    // Old records: struggling
    const old = makeRecords(20, {
      status: 'failed',
      objectiveCompletionRate: 0.1,
      attemptCount: 4,
    });
    // Recent records: excelling
    const recent = makeRecords(5, {
      status: 'completed',
      objectiveCompletionRate: 1.0,
      attemptCount: 1,
    });
    const allRecords = [...old, ...recent];
    const adj = computeDifficultyAdjustment(allRecords, 'beginner', 5);
    expect(adj.direction).toBe(1);
  });

  it('detects high attempt count as struggle signal', () => {
    const records = makeRecords(5, {
      status: 'completed',
      objectiveCompletionRate: 0.6,
      attemptCount: 3,
    });
    const adj = computeDifficultyAdjustment(records, 'intermediate');
    expect(adj.direction).toBe(-1);
  });
});

// ─── applyAdjustment ────────────────────────────────────────────────────────

describe('applyAdjustment', () => {
  it('applies multipliers to objective count and time', () => {
    const result = applyAdjustment(
      {
        direction: -1,
        confidence: 0.7,
        reason: 'struggling',
        recommendedDifficulty: 'beginner',
        objectiveCountMultiplier: 0.8,
        timeMultiplier: 1.3,
      },
      5,
      10,
    );
    expect(result.objectiveCount).toBe(4);
    expect(result.estimatedMinutes).toBe(13);
    expect(result.difficulty).toBe('beginner');
  });

  it('never returns objective count below 1', () => {
    const result = applyAdjustment(
      {
        direction: -1,
        confidence: 0.5,
        reason: 'test',
        recommendedDifficulty: 'beginner',
        objectiveCountMultiplier: 0.1,
        timeMultiplier: 1.0,
      },
      1,
      5,
    );
    expect(result.objectiveCount).toBe(1);
  });

  it('never returns estimated minutes below 1', () => {
    const result = applyAdjustment(
      {
        direction: 1,
        confidence: 0.5,
        reason: 'test',
        recommendedDifficulty: 'advanced',
        objectiveCountMultiplier: 1.0,
        timeMultiplier: 0.01,
      },
      3,
      1,
    );
    expect(result.estimatedMinutes).toBe(1);
  });

  it('passes through neutral adjustment unchanged', () => {
    const result = applyAdjustment(
      {
        direction: 0,
        confidence: 0.5,
        reason: 'flow zone',
        recommendedDifficulty: 'intermediate',
        objectiveCountMultiplier: 1.0,
        timeMultiplier: 1.0,
      },
      3,
      10,
    );
    expect(result.objectiveCount).toBe(3);
    expect(result.estimatedMinutes).toBe(10);
    expect(result.difficulty).toBe('intermediate');
  });
});

// ─── buildPerformanceRecords ─────────────────────────────────────────────────

describe('buildPerformanceRecords', () => {
  it('filters out active quests', () => {
    const quests = [
      { status: 'active', difficulty: 'beginner' },
      { status: 'completed', difficulty: 'beginner', objectives: [{ completed: true }] },
    ];
    const records = buildPerformanceRecords(quests);
    expect(records).toHaveLength(1);
    expect(records[0].status).toBe('completed');
  });

  it('computes objective completion rate', () => {
    const quests = [{
      status: 'completed',
      difficulty: 'intermediate',
      objectives: [
        { completed: true },
        { completed: false },
        { completed: true },
        { completed: true },
      ],
    }];
    const records = buildPerformanceRecords(quests);
    expect(records[0].objectiveCompletionRate).toBe(0.75);
  });

  it('computes completion time from assignedAt and completedAt', () => {
    const quests = [{
      status: 'completed',
      difficulty: 'beginner',
      assignedAt: '2026-03-01T10:00:00Z',
      completedAt: '2026-03-01T10:05:00Z',
      objectives: [],
    }];
    const records = buildPerformanceRecords(quests);
    expect(records[0].completionTimeMs).toBe(5 * 60_000);
  });

  it('handles null objectives gracefully', () => {
    const quests = [{ status: 'failed', difficulty: 'advanced', objectives: null }];
    const records = buildPerformanceRecords(quests);
    expect(records[0].objectiveCompletionRate).toBe(0);
  });

  it('converts estimatedMinutes to milliseconds', () => {
    const quests = [{
      status: 'completed',
      difficulty: 'beginner',
      estimatedMinutes: 10,
      objectives: [],
    }];
    const records = buildPerformanceRecords(quests);
    expect(records[0].estimatedTimeMs).toBe(600_000);
  });

  it('defaults attempt count to 1', () => {
    const quests = [{ status: 'completed', difficulty: 'beginner', objectives: [] }];
    const records = buildPerformanceRecords(quests);
    expect(records[0].attemptCount).toBe(1);
  });
});
