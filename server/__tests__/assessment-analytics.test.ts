/**
 * Tests for Assessment Analytics Service
 *
 * Validates learning gain calculations, pre/post comparison building,
 * and aggregate analytics computation.
 */
import { describe, it, expect } from 'vitest';
import type { AssessmentSession } from '../../shared/assessment/assessment-types';
import {
  computeLearningGain,
  buildPrePostComparison,
  computeAssessmentAnalytics,
} from '../services/assessment-analytics';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<AssessmentSession> = {}): AssessmentSession {
  return {
    id: 'session-1',
    playerId: 'player-1',
    worldId: 'world-1',
    assessmentType: 'arrival',
    status: 'complete',
    phaseResults: [],
    totalMaxPoints: 100,
    totalScore: 0,
    cefrLevel: 'A1',
    dimensionScores: {
      comprehension: 1,
      fluency: 1,
      vocabulary: 1,
      grammar: 1,
      pronunciation: 1,
    },
    completedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ── computeLearningGain ─────────────────────────────────────────────────────

describe('computeLearningGain', () => {
  it('computes raw gain correctly', () => {
    const gain = computeLearningGain(30, 70, 100);
    expect(gain.rawGain).toBe(40);
  });

  it('computes normalized gain (Hake formula)', () => {
    // normalizedGain = (post - pre) / (max - pre) = (70 - 30) / (100 - 30) = 40/70
    const gain = computeLearningGain(30, 70, 100);
    expect(gain.normalizedGain).toBeCloseTo(40 / 70, 5);
  });

  it('returns null normalized gain when pre equals max', () => {
    const gain = computeLearningGain(100, 100, 100);
    expect(gain.normalizedGain).toBeNull();
  });

  it('computes percentage change', () => {
    const gain = computeLearningGain(50, 75, 100);
    expect(gain.percentChange).toBe(50); // (25/50)*100
  });

  it('returns null percentage change when pre is zero', () => {
    const gain = computeLearningGain(0, 50, 100);
    expect(gain.percentChange).toBeNull();
  });

  it('handles negative gain (regression)', () => {
    const gain = computeLearningGain(80, 60, 100);
    expect(gain.rawGain).toBe(-20);
    expect(gain.normalizedGain).toBeCloseTo(-20 / 20, 5); // -1.0
  });

  it('handles zero gain', () => {
    const gain = computeLearningGain(50, 50, 100);
    expect(gain.rawGain).toBe(0);
    expect(gain.normalizedGain).toBe(0);
    expect(gain.percentChange).toBe(0);
  });

  it('computes effect size', () => {
    const gain = computeLearningGain(30, 70, 100);
    // effectSize = rawGain / (max * 0.25) = 40 / 25 = 1.6
    expect(gain.effectSize).toBeCloseTo(1.6, 5);
  });
});

// ── buildPrePostComparison ──────────────────────────────────────────────────

describe('buildPrePostComparison', () => {
  it('builds comparison with correct overall gain', () => {
    const pre = makeSession({
      id: 'pre-1',
      assessmentType: 'arrival',
      totalScore: 30,
      totalMaxPoints: 100,
      cefrLevel: 'A1',
    });
    const post = makeSession({
      id: 'post-1',
      assessmentType: 'departure',
      totalScore: 70,
      totalMaxPoints: 100,
      cefrLevel: 'B1',
    });

    const comparison = buildPrePostComparison(pre, post);

    expect(comparison.playerId).toBe('player-1');
    expect(comparison.worldId).toBe('world-1');
    expect(comparison.overallGain.rawGain).toBe(40);
    expect(comparison.preSession.totalScore).toBe(30);
    expect(comparison.postSession.totalScore).toBe(70);
  });

  it('detects CEFR improvement', () => {
    const pre = makeSession({ cefrLevel: 'A1', totalScore: 20 });
    const post = makeSession({
      assessmentType: 'departure',
      cefrLevel: 'B1',
      totalScore: 60,
    });

    const comparison = buildPrePostComparison(pre, post);
    expect(comparison.cefrProgression.improved).toBe(true);
    expect(comparison.cefrProgression.levelsGained).toBe(2); // A1 -> B1
    expect(comparison.cefrProgression.pre).toBe('A1');
    expect(comparison.cefrProgression.post).toBe('B1');
  });

  it('handles no CEFR improvement', () => {
    const pre = makeSession({ cefrLevel: 'A2', totalScore: 30 });
    const post = makeSession({
      assessmentType: 'departure',
      cefrLevel: 'A2',
      totalScore: 35,
    });

    const comparison = buildPrePostComparison(pre, post);
    expect(comparison.cefrProgression.improved).toBe(false);
    expect(comparison.cefrProgression.levelsGained).toBe(0);
  });

  it('computes per-dimension gains', () => {
    const pre = makeSession({
      dimensionScores: {
        comprehension: 2,
        fluency: 1,
        vocabulary: 3,
        grammar: 2,
        pronunciation: 1,
      },
    });
    const post = makeSession({
      assessmentType: 'departure',
      dimensionScores: {
        comprehension: 4,
        fluency: 3,
        vocabulary: 4,
        grammar: 3,
        pronunciation: 2,
      },
    });

    const comparison = buildPrePostComparison(pre, post);
    expect(comparison.dimensionGains).toHaveLength(5);

    const comp = comparison.dimensionGains.find(d => d.dimension === 'comprehension')!;
    expect(comp.preScore).toBe(2);
    expect(comp.postScore).toBe(4);
    expect(comp.gain.rawGain).toBe(2);
  });

  it('identifies strongest and weakest growth dimensions', () => {
    const pre = makeSession({
      dimensionScores: {
        comprehension: 1,
        fluency: 1,
        vocabulary: 1,
        grammar: 1,
        pronunciation: 4,
      },
    });
    const post = makeSession({
      assessmentType: 'departure',
      dimensionScores: {
        comprehension: 4,
        fluency: 2,
        vocabulary: 3,
        grammar: 3,
        pronunciation: 4,
      },
    });

    const comparison = buildPrePostComparison(pre, post);
    // comprehension: gain 3, normalized = 3/4 = 0.75
    // fluency: gain 1, normalized = 1/4 = 0.25
    // vocabulary: gain 2, normalized = 2/4 = 0.5
    // grammar: gain 2, normalized = 2/4 = 0.5
    // pronunciation: gain 0, normalized = 0/1 = 0
    expect(comparison.strongestGrowth).toBe('comprehension');
    expect(comparison.weakestGrowth).toBe('pronunciation');
  });

  it('includes periodic assessment trajectory', () => {
    const pre = makeSession({ totalScore: 20 });
    const post = makeSession({
      assessmentType: 'departure',
      totalScore: 70,
    });
    const periodic = [
      makeSession({
        id: 'periodic-1',
        assessmentType: 'periodic',
        totalScore: 40,
        completedAt: '2026-01-15T00:00:00Z',
      }),
      makeSession({
        id: 'periodic-2',
        assessmentType: 'periodic',
        totalScore: 55,
        completedAt: '2026-02-01T00:00:00Z',
      }),
    ];

    const comparison = buildPrePostComparison(pre, post, periodic);
    expect(comparison.trajectory).toHaveLength(2);
    expect(comparison.trajectory[0].totalScore).toBe(40);
    expect(comparison.trajectory[1].totalScore).toBe(55);
    // Should be sorted chronologically
    expect(comparison.trajectory[0].completedAt).toBeLessThan(comparison.trajectory[1].completedAt);
  });

  it('computes phase gains from phase results', () => {
    const pre = makeSession({
      phaseResults: [
        { phaseId: 'reading-phase', totalScore: 5, maxScore: 15, taskResults: [] },
        { phaseId: 'writing-phase', totalScore: 3, maxScore: 10, taskResults: [] },
      ],
    });
    const post = makeSession({
      assessmentType: 'departure',
      phaseResults: [
        { phaseId: 'reading-phase', totalScore: 12, maxScore: 15, taskResults: [] },
        { phaseId: 'writing-phase', totalScore: 8, maxScore: 10, taskResults: [] },
      ],
    });

    const comparison = buildPrePostComparison(pre, post);
    const reading = comparison.phaseGains.find(p => p.phaseType === 'reading')!;
    expect(reading.preScore).toBe(5);
    expect(reading.postScore).toBe(12);
    expect(reading.gain.rawGain).toBe(7);
  });
});

// ── computeAssessmentAnalytics ──────────────────────────────────────────────

describe('computeAssessmentAnalytics', () => {
  it('returns empty analytics when no sessions', () => {
    const analytics = computeAssessmentAnalytics([], 'world-1');
    expect(analytics.totalAssessedPlayers).toBe(0);
    expect(analytics.playersWithPrePost).toBe(0);
    expect(analytics.avgNormalizedGain).toBeNull();
    expect(analytics.playerComparisons).toHaveLength(0);
  });

  it('counts assessed players correctly', () => {
    const sessions = [
      makeSession({ playerId: 'p1', assessmentType: 'arrival', totalScore: 30 }),
      makeSession({ playerId: 'p1', id: 's2', assessmentType: 'departure', totalScore: 70 }),
      makeSession({ playerId: 'p2', id: 's3', assessmentType: 'arrival', totalScore: 40 }),
      // p2 has no departure — won't be in pre/post comparisons
    ];

    const analytics = computeAssessmentAnalytics(sessions, 'world-1');
    expect(analytics.totalAssessedPlayers).toBe(2);
    expect(analytics.playersWithPrePost).toBe(1);
  });

  it('computes aggregate gains across players', () => {
    const sessions = [
      makeSession({
        playerId: 'p1',
        id: 's1',
        assessmentType: 'arrival',
        totalScore: 20,
        cefrLevel: 'A1',
        dimensionScores: { comprehension: 1, fluency: 1, vocabulary: 1, grammar: 1, pronunciation: 1 },
      }),
      makeSession({
        playerId: 'p1',
        id: 's2',
        assessmentType: 'departure',
        totalScore: 60,
        cefrLevel: 'B1',
        dimensionScores: { comprehension: 3, fluency: 3, vocabulary: 3, grammar: 3, pronunciation: 3 },
      }),
      makeSession({
        playerId: 'p2',
        id: 's3',
        assessmentType: 'arrival',
        totalScore: 40,
        cefrLevel: 'A2',
        dimensionScores: { comprehension: 2, fluency: 2, vocabulary: 2, grammar: 2, pronunciation: 2 },
      }),
      makeSession({
        playerId: 'p2',
        id: 's4',
        assessmentType: 'departure',
        totalScore: 80,
        cefrLevel: 'B2',
        dimensionScores: { comprehension: 4, fluency: 4, vocabulary: 4, grammar: 4, pronunciation: 4 },
      }),
    ];

    const analytics = computeAssessmentAnalytics(sessions, 'world-1');
    expect(analytics.playersWithPrePost).toBe(2);
    expect(analytics.avgNormalizedGain).not.toBeNull();
    expect(analytics.avgNormalizedGain!).toBeGreaterThan(0);
    expect(analytics.cefrImprovementRate).toBe(1); // both improved
    expect(analytics.preCefrDistribution['A1']).toBe(1);
    expect(analytics.preCefrDistribution['A2']).toBe(1);
    expect(analytics.postCefrDistribution['B1']).toBe(1);
    expect(analytics.postCefrDistribution['B2']).toBe(1);
  });

  it('computes score statistics', () => {
    const sessions = [
      makeSession({ playerId: 'p1', id: 's1', assessmentType: 'arrival', totalScore: 20 }),
      makeSession({ playerId: 'p1', id: 's2', assessmentType: 'departure', totalScore: 60 }),
      makeSession({ playerId: 'p2', id: 's3', assessmentType: 'arrival', totalScore: 40 }),
      makeSession({ playerId: 'p2', id: 's4', assessmentType: 'departure', totalScore: 80 }),
    ];

    const analytics = computeAssessmentAnalytics(sessions, 'world-1');
    expect(analytics.scoreStats.preAvg).toBe(30); // (20+40)/2
    expect(analytics.scoreStats.postAvg).toBe(70); // (60+80)/2
    expect(analytics.scoreStats.preMedian).toBe(30);
    expect(analytics.scoreStats.postMedian).toBe(70);
    expect(analytics.scoreStats.preStdDev).toBeGreaterThan(0);
  });

  it('skips incomplete sessions', () => {
    const sessions = [
      makeSession({ playerId: 'p1', id: 's1', assessmentType: 'arrival', status: 'in_progress' }),
      makeSession({ playerId: 'p1', id: 's2', assessmentType: 'departure', totalScore: 60 }),
    ];

    const analytics = computeAssessmentAnalytics(sessions, 'world-1');
    expect(analytics.playersWithPrePost).toBe(0);
  });

  it('computes aggregate dimension gains', () => {
    const sessions = [
      makeSession({
        playerId: 'p1',
        id: 's1',
        assessmentType: 'arrival',
        dimensionScores: { comprehension: 1, fluency: 2, vocabulary: 1, grammar: 1, pronunciation: 1 },
      }),
      makeSession({
        playerId: 'p1',
        id: 's2',
        assessmentType: 'departure',
        dimensionScores: { comprehension: 4, fluency: 3, vocabulary: 3, grammar: 2, pronunciation: 3 },
      }),
    ];

    const analytics = computeAssessmentAnalytics(sessions, 'world-1');
    expect(analytics.dimensionGains).toHaveLength(5);
    const comp = analytics.dimensionGains.find(d => d.dimension === 'comprehension')!;
    expect(comp.preScore).toBe(1);
    expect(comp.postScore).toBe(4);
    expect(comp.gain.rawGain).toBe(3);
  });

  it('handles arrival_encounter and departure_encounter types', () => {
    const sessions = [
      makeSession({ playerId: 'p1', id: 's1', assessmentType: 'arrival_encounter', totalScore: 25 }),
      makeSession({ playerId: 'p1', id: 's2', assessmentType: 'departure_encounter', totalScore: 65 }),
    ];

    const analytics = computeAssessmentAnalytics(sessions, 'world-1');
    expect(analytics.playersWithPrePost).toBe(1);
    expect(analytics.playerComparisons[0].overallGain.rawGain).toBe(40);
  });
});
