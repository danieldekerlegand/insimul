import { describe, it, expect } from 'vitest';
import {
  getAdjustedTimeLimit,
  getScoringTier,
  tierXPMultiplier,
  speedBonusMultiplier,
  calculateTimedChallengeResult,
  createTimedChallengeState,
  isTimedChallengeExpired,
  getRemainingSeconds,
  getElapsedSeconds,
  TIMED_CHALLENGE_TEMPLATES,
} from '../timed-challenge';

// ── getAdjustedTimeLimit ────────────────────────────────────────────────────

describe('getAdjustedTimeLimit', () => {
  it('gives A1 learners 50% more time', () => {
    expect(getAdjustedTimeLimit(180, 'A1')).toBe(270); // 180 * 1.5
  });

  it('gives A2 learners 25% more time', () => {
    expect(getAdjustedTimeLimit(180, 'A2')).toBe(225); // 180 * 1.25
  });

  it('uses base time for B1', () => {
    expect(getAdjustedTimeLimit(180, 'B1')).toBe(180);
  });

  it('reduces time for B2', () => {
    expect(getAdjustedTimeLimit(200, 'B2')).toBe(170); // 200 * 0.85
  });

  it('defaults to B1 multiplier for null CEFR', () => {
    expect(getAdjustedTimeLimit(180, null)).toBe(180);
    expect(getAdjustedTimeLimit(180, undefined)).toBe(180);
  });

  it('defaults to 1.0x for unknown CEFR level', () => {
    expect(getAdjustedTimeLimit(180, 'X9')).toBe(180);
  });
});

// ── getScoringTier ──────────────────────────────────────────────────────────

describe('getScoringTier', () => {
  const tiers = { gold: 10, silver: 7, bronze: 4 };

  it('returns gold when reaching gold threshold', () => {
    expect(getScoringTier(10, tiers)).toBe('gold');
    expect(getScoringTier(15, tiers)).toBe('gold');
  });

  it('returns silver when between silver and gold', () => {
    expect(getScoringTier(7, tiers)).toBe('silver');
    expect(getScoringTier(9, tiers)).toBe('silver');
  });

  it('returns bronze when between bronze and silver', () => {
    expect(getScoringTier(4, tiers)).toBe('bronze');
    expect(getScoringTier(6, tiers)).toBe('bronze');
  });

  it('returns none when below bronze', () => {
    expect(getScoringTier(0, tiers)).toBe('none');
    expect(getScoringTier(3, tiers)).toBe('none');
  });
});

// ── tierXPMultiplier ────────────────────────────────────────────────────────

describe('tierXPMultiplier', () => {
  it('returns 2.0 for gold', () => {
    expect(tierXPMultiplier('gold')).toBe(2.0);
  });

  it('returns 1.5 for silver', () => {
    expect(tierXPMultiplier('silver')).toBe(1.5);
  });

  it('returns 1.0 for bronze', () => {
    expect(tierXPMultiplier('bronze')).toBe(1.0);
  });

  it('returns 0.5 for none', () => {
    expect(tierXPMultiplier('none')).toBe(0.5);
  });
});

// ── speedBonusMultiplier ────────────────────────────────────────────────────

describe('speedBonusMultiplier', () => {
  it('returns 1.5 for instant completion', () => {
    expect(speedBonusMultiplier(0, 180)).toBe(1.5);
  });

  it('returns 1.0 at the time limit', () => {
    expect(speedBonusMultiplier(180, 180)).toBe(1.0);
  });

  it('returns 1.25 at half time', () => {
    expect(speedBonusMultiplier(90, 180)).toBeCloseTo(1.25);
  });

  it('returns 1.0 for zero time limit', () => {
    expect(speedBonusMultiplier(10, 0)).toBe(1.0);
  });

  it('clamps elapsed to time limit', () => {
    // Even if elapsed > limit, should return 1.0 (not below)
    expect(speedBonusMultiplier(200, 180)).toBe(1.0);
  });
});

// ── calculateTimedChallengeResult ───────────────────────────────────────────

describe('calculateTimedChallengeResult', () => {
  const tiers = { gold: 10, silver: 7, bronze: 4 };

  it('calculates gold tier result', () => {
    const result = calculateTimedChallengeResult(12, 15, 90, 180, tiers);
    expect(result.tier).toBe('gold');
    expect(result.completedCount).toBe(12);
    expect(result.totalObjectives).toBe(15);
    expect(result.elapsedSeconds).toBe(90);
    expect(result.timeLimitSeconds).toBe(180);
    // gold (2.0) * speed at 50% (1.25) = 2.5
    expect(result.timeBonus).toBeCloseTo(2.5, 1);
  });

  it('calculates no-tier result with base timeBonus', () => {
    const result = calculateTimedChallengeResult(2, 15, 170, 180, tiers);
    expect(result.tier).toBe('none');
    // none tier: speed bonus is NOT applied (fixed at 1.0 * 0.5)
    expect(result.timeBonus).toBe(0.5);
  });

  it('calculates bronze tier at the time limit', () => {
    const result = calculateTimedChallengeResult(5, 15, 180, 180, tiers);
    expect(result.tier).toBe('bronze');
    // bronze (1.0) * speed at 100% (1.0) = 1.0
    expect(result.timeBonus).toBe(1.0);
  });
});

// ── createTimedChallengeState ───────────────────────────────────────────────

describe('createTimedChallengeState', () => {
  it('creates state for speed_round template', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    expect(state.template).toBe('speed_round');
    expect(state.timeLimitSeconds).toBe(180); // B1 = base
    expect(state.tiers).toEqual({ gold: 12, silver: 8, bronze: 5 });
    expect(state.startedAt).toBeTruthy();
  });

  it('adjusts time for A1 learners', () => {
    const state = createTimedChallengeState('vocabulary_sprint', 'A1');
    // base 120 * 1.5 = 180
    expect(state.timeLimitSeconds).toBe(180);
  });

  it('adjusts time for B2 learners', () => {
    const state = createTimedChallengeState('rapid_conversation', 'B2');
    // base 300 * 0.85 = 255
    expect(state.timeLimitSeconds).toBe(255);
  });
});

// ── isTimedChallengeExpired ─────────────────────────────────────────────────

describe('isTimedChallengeExpired', () => {
  it('returns false when time remains', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    expect(isTimedChallengeExpired(state)).toBe(false);
  });

  it('returns true when time has passed', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    // Set startedAt to 200 seconds ago (limit is 180)
    state.startedAt = new Date(Date.now() - 200_000).toISOString();
    expect(isTimedChallengeExpired(state)).toBe(true);
  });

  it('returns true at exactly the limit', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    const start = new Date(state.startedAt);
    const atLimit = new Date(start.getTime() + 180_000);
    expect(isTimedChallengeExpired(state, atLimit)).toBe(true);
  });
});

// ── getRemainingSeconds / getElapsedSeconds ─────────────────────────────────

describe('getRemainingSeconds', () => {
  it('returns full time at start', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    const now = new Date(state.startedAt);
    expect(getRemainingSeconds(state, now)).toBe(180);
  });

  it('returns 0 when expired', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    state.startedAt = new Date(Date.now() - 300_000).toISOString();
    expect(getRemainingSeconds(state)).toBe(0);
  });
});

describe('getElapsedSeconds', () => {
  it('returns 0 at start', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    const now = new Date(state.startedAt);
    expect(getElapsedSeconds(state, now)).toBe(0);
  });

  it('returns elapsed time correctly', () => {
    const state = createTimedChallengeState('speed_round', 'B1');
    const now = new Date(new Date(state.startedAt).getTime() + 60_000);
    expect(getElapsedSeconds(state, now)).toBeCloseTo(60, 0);
  });
});

// ── TIMED_CHALLENGE_TEMPLATES ───────────────────────────────────────────────

describe('TIMED_CHALLENGE_TEMPLATES', () => {
  it('has all four templates', () => {
    expect(Object.keys(TIMED_CHALLENGE_TEMPLATES)).toEqual([
      'speed_round',
      'rapid_conversation',
      'vocabulary_sprint',
      'shopping_spree',
    ]);
  });

  it('has valid tier thresholds (gold > silver > bronze)', () => {
    for (const config of Object.values(TIMED_CHALLENGE_TEMPLATES)) {
      expect(config.tiers.gold).toBeGreaterThan(config.tiers.silver);
      expect(config.tiers.silver).toBeGreaterThan(config.tiers.bronze);
      expect(config.tiers.bronze).toBeGreaterThan(0);
    }
  });

  it('has positive base time limits', () => {
    for (const config of Object.values(TIMED_CHALLENGE_TEMPLATES)) {
      expect(config.baseTimeLimitSeconds).toBeGreaterThan(0);
    }
  });
});
