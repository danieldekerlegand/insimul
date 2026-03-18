import { describe, it, expect } from 'vitest';
import {
  streakMultiplier,
  difficultyMultiplier,
  getStreakMilestone,
  getNextMilestone,
  calculateQuestBonus,
  isStreakActive,
  updatePlayerStreak,
  STREAK_MILESTONES,
} from '../quest-bonus-calculator';

// ── streakMultiplier ────────────────────────────────────────────────────────

describe('streakMultiplier', () => {
  it('returns 1.0 for streak 0', () => {
    expect(streakMultiplier(0)).toBe(1.0);
  });

  it('returns 1.1 for streak 1', () => {
    expect(streakMultiplier(1)).toBeCloseTo(1.1);
  });

  it('returns 1.5 for streak 5', () => {
    expect(streakMultiplier(5)).toBeCloseTo(1.5);
  });

  it('caps at 2.0 for streak 10', () => {
    expect(streakMultiplier(10)).toBe(2.0);
  });

  it('caps at 2.0 for streak 20', () => {
    expect(streakMultiplier(20)).toBe(2.0);
  });
});

// ── difficultyMultiplier ────────────────────────────────────────────────────

describe('difficultyMultiplier', () => {
  it('returns 1.0 for beginner', () => {
    expect(difficultyMultiplier('beginner')).toBe(1.0);
  });

  it('returns 1.25 for intermediate', () => {
    expect(difficultyMultiplier('intermediate')).toBe(1.25);
  });

  it('returns 1.5 for advanced', () => {
    expect(difficultyMultiplier('advanced')).toBe(1.5);
  });

  it('returns 1.0 for unknown difficulty', () => {
    expect(difficultyMultiplier('unknown')).toBe(1.0);
  });
});

// ── getStreakMilestone ──────────────────────────────────────────────────────

describe('getStreakMilestone', () => {
  it('returns milestone at threshold 3', () => {
    const m = getStreakMilestone(3);
    expect(m).not.toBeNull();
    expect(m!.label).toBe('Hot Streak');
    expect(m!.bonusXP).toBe(25);
  });

  it('returns milestone at threshold 7', () => {
    const m = getStreakMilestone(7);
    expect(m).not.toBeNull();
    expect(m!.label).toBe('Weekly Warrior');
  });

  it('returns null for non-milestone streak', () => {
    expect(getStreakMilestone(4)).toBeNull();
    expect(getStreakMilestone(0)).toBeNull();
  });

  it('returns milestone at threshold 100', () => {
    const m = getStreakMilestone(100);
    expect(m).not.toBeNull();
    expect(m!.label).toBe('Language Legend');
    expect(m!.bonusXP).toBe(1500);
  });
});

// ── getNextMilestone ────────────────────────────────────────────────────────

describe('getNextMilestone', () => {
  it('returns Hot Streak for streak 0', () => {
    const m = getNextMilestone(0);
    expect(m!.threshold).toBe(3);
  });

  it('returns Weekly Warrior for streak 5', () => {
    const m = getNextMilestone(5);
    expect(m!.threshold).toBe(7);
  });

  it('returns null past last milestone', () => {
    expect(getNextMilestone(100)).toBeNull();
    expect(getNextMilestone(150)).toBeNull();
  });
});

// ── calculateQuestBonus ─────────────────────────────────────────────────────

describe('calculateQuestBonus', () => {
  it('calculates base case with no bonuses', () => {
    const result = calculateQuestBonus({
      baseXP: 100,
      streakCount: 0,
      difficulty: 'beginner',
      hintsUsed: 0,
      isRecurring: false,
    });
    expect(result.baseXP).toBe(100);
    expect(result.difficultyMultiplier).toBe(1.0);
    expect(result.streakMultiplier).toBe(1.0); // not recurring
    expect(result.hintPenalty).toBe(1.0);
    expect(result.totalXP).toBe(100);
    expect(result.bonusXP).toBe(0);
    expect(result.newStreakCount).toBe(1);
  });

  it('applies difficulty multiplier for advanced', () => {
    const result = calculateQuestBonus({
      baseXP: 100,
      streakCount: 0,
      difficulty: 'advanced',
      hintsUsed: 0,
      isRecurring: false,
    });
    expect(result.difficultyMultiplier).toBe(1.5);
    expect(result.totalXP).toBe(150);
    expect(result.bonusXP).toBe(50);
  });

  it('applies streak multiplier only for recurring quests', () => {
    const recurring = calculateQuestBonus({
      baseXP: 100,
      streakCount: 5,
      difficulty: 'beginner',
      hintsUsed: 0,
      isRecurring: true,
    });
    expect(recurring.streakMultiplier).toBeCloseTo(1.5);
    expect(recurring.totalXP).toBe(150);

    const nonRecurring = calculateQuestBonus({
      baseXP: 100,
      streakCount: 5,
      difficulty: 'beginner',
      hintsUsed: 0,
      isRecurring: false,
    });
    expect(nonRecurring.streakMultiplier).toBe(1.0);
    expect(nonRecurring.totalXP).toBe(100);
  });

  it('applies hint penalty', () => {
    const result = calculateQuestBonus({
      baseXP: 100,
      streakCount: 0,
      difficulty: 'beginner',
      hintsUsed: 2,
      isRecurring: false,
    });
    expect(result.hintPenalty).toBe(0.8);
    expect(result.totalXP).toBe(80);
  });

  it('combines all multipliers', () => {
    const result = calculateQuestBonus({
      baseXP: 100,
      streakCount: 5,
      difficulty: 'advanced',
      hintsUsed: 1,
      isRecurring: true,
    });
    // 1.5 (difficulty) * 1.5 (streak) * 0.9 (hint) = 2.025
    expect(result.combinedMultiplier).toBeCloseTo(2.025);
    expect(result.totalXP).toBe(Math.round(100 * 2.025));
  });

  it('awards milestone bonus at threshold 3', () => {
    const result = calculateQuestBonus({
      baseXP: 100,
      streakCount: 2, // becomes 3
      difficulty: 'beginner',
      hintsUsed: 0,
      isRecurring: false,
    });
    expect(result.newStreakCount).toBe(3);
    expect(result.milestone).not.toBeNull();
    expect(result.milestone!.label).toBe('Hot Streak');
    expect(result.milestoneXP).toBe(25);
    expect(result.grandTotalXP).toBe(100 + 25);
  });

  it('no milestone at non-threshold streak', () => {
    const result = calculateQuestBonus({
      baseXP: 100,
      streakCount: 3, // becomes 4
      difficulty: 'beginner',
      hintsUsed: 0,
      isRecurring: false,
    });
    expect(result.milestone).toBeNull();
    expect(result.milestoneXP).toBe(0);
    expect(result.grandTotalXP).toBe(100);
  });
});

// ── isStreakActive ───────────────────────────────────────────────────────────

describe('isStreakActive', () => {
  it('returns false for null lastCompletedAt', () => {
    expect(isStreakActive(null)).toBe(false);
  });

  it('returns true if completed 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(isStreakActive(oneHourAgo)).toBe(true);
  });

  it('returns true if completed 47 hours ago', () => {
    const ago = new Date(Date.now() - 47 * 60 * 60 * 1000);
    expect(isStreakActive(ago)).toBe(true);
  });

  it('returns false if completed 49 hours ago', () => {
    const ago = new Date(Date.now() - 49 * 60 * 60 * 1000);
    expect(isStreakActive(ago)).toBe(false);
  });
});

// ── updatePlayerStreak ──────────────────────────────────────────────────────

describe('updatePlayerStreak', () => {
  it('returns 1 for first completion (null lastCompletedAt)', () => {
    expect(updatePlayerStreak(0, null)).toBe(1);
  });

  it('increments streak when active', () => {
    const recent = new Date(Date.now() - 60 * 60 * 1000);
    expect(updatePlayerStreak(5, recent)).toBe(6);
  });

  it('resets to 1 when streak is broken', () => {
    const old = new Date(Date.now() - 72 * 60 * 60 * 1000);
    expect(updatePlayerStreak(10, old)).toBe(1);
  });
});

// ── STREAK_MILESTONES ───────────────────────────────────────────────────────

describe('STREAK_MILESTONES', () => {
  it('has milestones in ascending threshold order', () => {
    for (let i = 1; i < STREAK_MILESTONES.length; i++) {
      expect(STREAK_MILESTONES[i].threshold).toBeGreaterThan(STREAK_MILESTONES[i - 1].threshold);
    }
  });

  it('has positive bonusXP for all milestones', () => {
    for (const m of STREAK_MILESTONES) {
      expect(m.bonusXP).toBeGreaterThan(0);
    }
  });
});
