import { describe, it, expect, vi } from 'vitest';
import {
  calculateNextReset,
  isReadyForReset,
  calculateStreak,
  streakBonusMultiplier,
  buildResetUpdate,
  buildRecurringCompletionUpdate,
  getRecurringQuestStatus,
  generateRecurringQuests,
} from '../../shared/quests/daily-quest-manager.js';
import type { Quest, InsertQuest } from '../../shared/schema';

// --- Fixtures ---

function makeQuest(overrides: Record<string, any> = {}): Quest {
  return {
    id: `quest-${Math.random().toString(36).slice(2, 8)}`,
    worldId: 'world-1',
    title: 'Daily Vocab',
    description: 'Practice vocabulary daily',
    status: 'active',
    assignedTo: 'Player1',
    questType: 'vocabulary',
    difficulty: 'beginner',
    targetLanguage: 'French',
    objectives: [
      { id: 'obj_0', type: 'use_vocabulary', description: 'Use 5 words', requiredCount: 5, currentCount: 0, completed: false },
    ],
    progress: { percentComplete: 0 },
    experienceReward: 30,
    recurrencePattern: 'daily',
    recurrenceResetAt: null,
    completionCount: 0,
    lastCompletedAt: null,
    streakCount: 0,
    sourceQuestId: null,
    tags: ['recurring:daily'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

function makeWorld() {
  return {
    id: 'world-1',
    name: 'Test Village',
    description: 'A test world',
    targetLanguage: 'French',
    worldType: 'village',
    gameType: 'language-learning',
  } as any;
}

function makeCtx() {
  return {
    world: makeWorld(),
    characters: [
      { id: 'c1', firstName: 'Marie', lastName: 'Dupont', status: 'active', occupation: 'teacher' } as any,
      { id: 'c2', firstName: 'Pierre', lastName: 'Martin', status: 'active', occupation: 'merchant' } as any,
    ],
    settlements: [{ id: 's1', name: 'Petit Village', worldId: 'world-1' } as any],
    existingQuests: [],
  };
}

// --- Tests ---

describe('Daily Quest Manager', () => {
  describe('calculateNextReset', () => {
    it('calculates next daily reset', () => {
      const from = new Date('2026-03-17T10:00:00Z');
      const next = calculateNextReset('daily', from, 0);
      expect(next.toISOString()).toBe('2026-03-18T00:00:00.000Z');
    });

    it('returns same day if reset hour has not passed', () => {
      const from = new Date('2026-03-17T04:00:00Z');
      const next = calculateNextReset('daily', from, 6);
      expect(next.toISOString()).toBe('2026-03-17T06:00:00.000Z');
    });

    it('calculates next weekly reset (Monday)', () => {
      // 2026-03-17 is a Tuesday
      const from = new Date('2026-03-17T10:00:00Z');
      const next = calculateNextReset('weekly', from, 0);
      expect(next.getUTCDay()).toBe(1); // Monday
      expect(next > from).toBe(true);
    });

    it('calculates next monthly reset', () => {
      const from = new Date('2026-03-17T10:00:00Z');
      const next = calculateNextReset('monthly', from, 0);
      expect(next.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    });

    it('handles month boundary for monthly reset on day 1', () => {
      const from = new Date('2026-03-01T00:00:00Z');
      const next = calculateNextReset('monthly', from, 0);
      // Should go to next month since from === reset time
      expect(next.getUTCMonth()).toBe(3); // April
    });
  });

  describe('isReadyForReset', () => {
    it('returns false for non-recurring quests', () => {
      const quest = makeQuest({ recurrencePattern: null });
      expect(isReadyForReset(quest)).toBe(false);
    });

    it('returns true when reset time has passed', () => {
      const pastReset = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const quest = makeQuest({ recurrenceResetAt: pastReset });
      expect(isReadyForReset(quest)).toBe(true);
    });

    it('returns false when reset time is in the future', () => {
      const futureReset = new Date(Date.now() + 60 * 60 * 1000);
      const quest = makeQuest({ recurrenceResetAt: futureReset });
      expect(isReadyForReset(quest)).toBe(false);
    });

    it('returns true when no reset time is set', () => {
      const quest = makeQuest({ recurrenceResetAt: null });
      expect(isReadyForReset(quest)).toBe(true);
    });
  });

  describe('calculateStreak', () => {
    it('returns 0 when never completed', () => {
      expect(calculateStreak(null, 'daily', 5)).toBe(0);
    });

    it('maintains streak for recent daily completion', () => {
      const yesterday = new Date(Date.now() - 20 * 60 * 60 * 1000);
      expect(calculateStreak(yesterday, 'daily', 5)).toBe(5);
    });

    it('breaks streak after missing a daily period', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(calculateStreak(threeDaysAgo, 'daily', 5)).toBe(0);
    });

    it('maintains streak for recent weekly completion', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(calculateStreak(fiveDaysAgo, 'weekly', 3)).toBe(3);
    });

    it('breaks streak after missing a weekly period', () => {
      const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
      expect(calculateStreak(threeWeeksAgo, 'weekly', 3)).toBe(0);
    });
  });

  describe('streakBonusMultiplier', () => {
    it('returns 1.0 for 0 streak', () => {
      expect(streakBonusMultiplier(0)).toBe(1.0);
    });

    it('returns 1.5 for 5 streak', () => {
      expect(streakBonusMultiplier(5)).toBe(1.5);
    });

    it('caps at 2.0', () => {
      expect(streakBonusMultiplier(10)).toBe(2.0);
      expect(streakBonusMultiplier(15)).toBe(2.0);
    });
  });

  describe('buildResetUpdate', () => {
    it('resets quest to active with cleared progress', () => {
      const quest = makeQuest({
        status: 'completed',
        completedAt: new Date(),
        progress: { percentComplete: 100 },
        objectives: [
          { id: 'obj_0', type: 'use_vocabulary', requiredCount: 5, currentCount: 5, completed: true },
        ],
      });

      const update = buildResetUpdate(quest);

      expect(update.status).toBe('active');
      expect(update.completedAt).toBeNull();
      expect((update.progress as any).percentComplete).toBe(0);
      expect(update.recurrenceResetAt).toBeInstanceOf(Date);
      expect((update.objectives as any[])[0].currentCount).toBe(0);
      expect((update.objectives as any[])[0].completed).toBe(false);
    });

    it('calculates streak correctly on reset', () => {
      const recentCompletion = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const quest = makeQuest({
        status: 'completed',
        lastCompletedAt: recentCompletion,
        streakCount: 3,
      });

      const update = buildResetUpdate(quest);
      expect(update.streakCount).toBe(3); // Maintained
    });
  });

  describe('buildRecurringCompletionUpdate', () => {
    it('marks quest complete with incremented count and streak', () => {
      const quest = makeQuest({ completionCount: 2, streakCount: 4 });

      const update = buildRecurringCompletionUpdate(quest);

      expect(update.status).toBe('completed');
      expect(update.completedAt).toBeInstanceOf(Date);
      expect(update.lastCompletedAt).toBeInstanceOf(Date);
      expect(update.completionCount).toBe(3);
      expect(update.streakCount).toBe(5);
      expect(update.recurrenceResetAt).toBeInstanceOf(Date);
    });
  });

  describe('getRecurringQuestStatus', () => {
    it('returns active recurring quests', async () => {
      const quests = [
        makeQuest({ status: 'active', recurrenceResetAt: new Date(Date.now() + 86400000) }),
        makeQuest({ status: 'active', recurrencePattern: null }), // non-recurring
      ];

      const updateQuest = vi.fn();
      const status = await getRecurringQuestStatus(quests, 'Player1', 'world-1', updateQuest);

      expect(status.activeQuests).toHaveLength(1);
      expect(status.completedThisPeriod).toHaveLength(0);
      expect(updateQuest).not.toHaveBeenCalled();
    });

    it('resets completed quests when reset time has passed', async () => {
      const pastReset = new Date(Date.now() - 3600000);
      const quest = makeQuest({
        status: 'completed',
        recurrenceResetAt: pastReset,
        lastCompletedAt: new Date(Date.now() - 7200000),
        streakCount: 2,
      });

      const updateQuest = vi.fn(async (id: string, data: any) => ({
        ...quest,
        ...data,
        id,
      }));

      const status = await getRecurringQuestStatus([quest], 'Player1', 'world-1', updateQuest);

      expect(status.activeQuests).toHaveLength(1);
      expect(status.completedThisPeriod).toHaveLength(0);
      expect(updateQuest).toHaveBeenCalledTimes(1);
    });

    it('keeps completed quests in completedThisPeriod when not yet reset', async () => {
      const futureReset = new Date(Date.now() + 86400000);
      const quest = makeQuest({
        status: 'completed',
        recurrenceResetAt: futureReset,
        streakCount: 3,
      });

      const updateQuest = vi.fn();
      const status = await getRecurringQuestStatus([quest], 'Player1', 'world-1', updateQuest);

      expect(status.activeQuests).toHaveLength(0);
      expect(status.completedThisPeriod).toHaveLength(1);
      expect(status.streak).toBe(3);
      expect(updateQuest).not.toHaveBeenCalled();
    });
  });

  describe('generateRecurringQuests', () => {
    it('creates recurring quests with recurrence fields', async () => {
      const saved: InsertQuest[] = [];
      const saveQuest = vi.fn(async (quest: InsertQuest) => {
        saved.push(quest);
        return { ...quest, id: `gen-${saved.length}`, createdAt: new Date(), updatedAt: new Date() } as any;
      });

      const result = await generateRecurringQuests(
        makeCtx(),
        'Player1',
        'daily',
        saveQuest,
        { dailyQuestCount: 2 },
      );

      expect(result).toHaveLength(2);
      expect(saveQuest).toHaveBeenCalledTimes(2);

      for (const quest of saved) {
        expect(quest.recurrencePattern).toBe('daily');
        expect(quest.recurrenceResetAt).toBeInstanceOf(Date);
        expect(quest.completionCount).toBe(0);
        expect(quest.streakCount).toBe(0);
        expect((quest.tags as string[])).toContain('recurring:daily');
      }
    });

    it('supports weekly pattern', async () => {
      const saved: InsertQuest[] = [];
      const saveQuest = vi.fn(async (quest: InsertQuest) => {
        saved.push(quest);
        return { ...quest, id: `gen-${saved.length}`, createdAt: new Date(), updatedAt: new Date() } as any;
      });

      await generateRecurringQuests(makeCtx(), 'Player1', 'weekly', saveQuest, { dailyQuestCount: 1 });

      expect(saved[0].recurrencePattern).toBe('weekly');
      expect((saved[0].tags as string[])).toContain('recurring:weekly');
    });
  });
});
