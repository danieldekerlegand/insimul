/**
 * Daily / Recurring Quest Manager
 *
 * Manages quests that reset on a schedule (daily, weekly, monthly).
 * Handles reset timing, streak tracking, and recurring quest generation.
 */

import type { Quest, InsertQuest } from '../schema.js';
import { assignQuests, type WorldContext, type AssignmentOptions } from './quest-assignment-engine.js';

// --- Types ---

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

export interface DailyQuestConfig {
  /** Number of daily quests to maintain per player (default 3) */
  dailyQuestCount: number;
  /** Hour (UTC) when daily quests reset (default 0 = midnight UTC) */
  resetHourUTC: number;
}

const DEFAULT_CONFIG: DailyQuestConfig = {
  dailyQuestCount: 3,
  resetHourUTC: 0,
};

export interface RecurringQuestStatus {
  /** Quests available for the current period */
  activeQuests: Quest[];
  /** Quests completed in the current period (awaiting reset) */
  completedThisPeriod: Quest[];
  /** Current streak count */
  streak: number;
  /** When quests next reset */
  nextResetAt: Date;
  /** Whether new quests were generated this call */
  generated: boolean;
}

// --- Reset time calculation ---

/**
 * Calculate the next reset time for a given recurrence pattern.
 */
export function calculateNextReset(
  pattern: RecurrencePattern,
  fromDate: Date = new Date(),
  resetHourUTC: number = 0,
): Date {
  const next = new Date(fromDate);
  next.setUTCHours(resetHourUTC, 0, 0, 0);

  switch (pattern) {
    case 'daily':
      // Next day at reset hour
      if (next <= fromDate) {
        next.setUTCDate(next.getUTCDate() + 1);
      }
      break;
    case 'weekly':
      // Next Monday at reset hour
      const daysUntilMonday = (8 - next.getUTCDay()) % 7 || 7;
      if (next <= fromDate) {
        next.setUTCDate(next.getUTCDate() + daysUntilMonday);
      }
      break;
    case 'monthly':
      // First day of next month at reset hour
      next.setUTCDate(1);
      if (next <= fromDate) {
        next.setUTCMonth(next.getUTCMonth() + 1);
      }
      break;
  }

  return next;
}

/**
 * Check if a quest's recurrence period has elapsed and it should be reset.
 */
export function isReadyForReset(quest: Quest, now: Date = new Date()): boolean {
  if (!quest.recurrencePattern) return false;
  if (!quest.recurrenceResetAt) return true; // Never had a reset time — needs one
  return now >= new Date(quest.recurrenceResetAt);
}

/**
 * Calculate streak: consecutive periods where the quest was completed.
 * A streak breaks if the player misses a full period.
 */
export function calculateStreak(
  lastCompletedAt: Date | null,
  recurrencePattern: RecurrencePattern,
  currentStreak: number,
  now: Date = new Date(),
): number {
  if (!lastCompletedAt) return 0;

  const lastCompleted = new Date(lastCompletedAt);
  const msSinceCompletion = now.getTime() - lastCompleted.getTime();

  // Max gap before streak breaks (2x the period to allow for the current period)
  const maxGapMs = {
    daily: 2 * 24 * 60 * 60 * 1000,
    weekly: 2 * 7 * 24 * 60 * 60 * 1000,
    monthly: 2 * 31 * 24 * 60 * 60 * 1000,
  };

  if (msSinceCompletion > maxGapMs[recurrencePattern]) {
    return 0; // Streak broken
  }

  return currentStreak;
}

// --- Streak bonus XP ---

/**
 * Calculate bonus XP multiplier based on streak.
 * Starts at 1.0x, increases by 0.1 per streak day, capped at 2.0x.
 */
export function streakBonusMultiplier(streakCount: number): number {
  return Math.min(2.0, 1.0 + streakCount * 0.1);
}

// --- Core quest management ---

/**
 * Reset a completed recurring quest for a new period.
 * Returns the update payload to apply to the quest.
 */
export function buildResetUpdate(
  quest: Quest,
  config: Partial<DailyQuestConfig> = {},
): Partial<Quest> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const pattern = quest.recurrencePattern as RecurrencePattern;
  const nextReset = calculateNextReset(pattern, new Date(), cfg.resetHourUTC);

  // Calculate streak
  const streak = calculateStreak(
    quest.lastCompletedAt,
    pattern,
    quest.streakCount ?? 0,
  );

  return {
    status: 'active',
    completedAt: null,
    progress: { percentComplete: 0 },
    recurrenceResetAt: nextReset,
    streakCount: streak,
    // Reset objectives to incomplete
    objectives: Array.isArray(quest.objectives)
      ? (quest.objectives as any[]).map((obj: any) => ({
          ...obj,
          currentCount: 0,
          completed: false,
        }))
      : [],
  };
}

/**
 * Build the update payload when completing a recurring quest.
 */
export function buildRecurringCompletionUpdate(
  quest: Quest,
  config: Partial<DailyQuestConfig> = {},
): Partial<Quest> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const pattern = quest.recurrencePattern as RecurrencePattern;
  const now = new Date();
  const nextReset = calculateNextReset(pattern, now, cfg.resetHourUTC);

  return {
    status: 'completed',
    completedAt: now,
    lastCompletedAt: now,
    completionCount: (quest.completionCount ?? 0) + 1,
    streakCount: (quest.streakCount ?? 0) + 1,
    recurrenceResetAt: nextReset,
    progress: { percentComplete: 100 },
  };
}

/**
 * Get recurring quests for a player in a world, resetting any that are due.
 *
 * @param worldQuests - All quests in the world (pre-fetched)
 * @param playerName - The player to check
 * @param updateQuest - Callback to persist quest updates
 * @param config - Daily quest configuration
 * @returns Status of the player's recurring quests
 */
export async function getRecurringQuestStatus(
  worldQuests: Quest[],
  playerName: string,
  worldId: string,
  updateQuest: (id: string, data: Partial<Quest>) => Promise<Quest | undefined>,
  config: Partial<DailyQuestConfig> = {},
): Promise<RecurringQuestStatus> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = new Date();

  // Find all recurring quests for this player
  const recurringQuests = worldQuests.filter(
    (q) =>
      q.worldId === worldId &&
      q.assignedTo === playerName &&
      q.recurrencePattern != null,
  );

  const activeQuests: Quest[] = [];
  const completedThisPeriod: Quest[] = [];
  let maxStreak = 0;

  for (const quest of recurringQuests) {
    if (quest.status === 'completed' && isReadyForReset(quest, now)) {
      // Reset the quest for a new period
      const resetData = buildResetUpdate(quest, cfg);
      const updated = await updateQuest(quest.id, resetData as any);
      if (updated) {
        activeQuests.push(updated);
        maxStreak = Math.max(maxStreak, updated.streakCount ?? 0);
      }
    } else if (quest.status === 'completed') {
      completedThisPeriod.push(quest);
      maxStreak = Math.max(maxStreak, quest.streakCount ?? 0);
    } else if (quest.status === 'active') {
      activeQuests.push(quest);
      maxStreak = Math.max(maxStreak, quest.streakCount ?? 0);
    }
  }

  // Calculate next reset from the earliest recurring pattern
  const patterns = recurringQuests
    .map((q) => q.recurrencePattern as RecurrencePattern)
    .filter(Boolean);
  const nextResetAt =
    patterns.length > 0
      ? calculateNextReset(patterns[0], now, cfg.resetHourUTC)
      : calculateNextReset('daily', now, cfg.resetHourUTC);

  return {
    activeQuests,
    completedThisPeriod,
    streak: maxStreak,
    nextResetAt,
    generated: false,
  };
}

/**
 * Create daily recurring quests for a player using the assignment engine.
 *
 * @param ctx - World context for quest generation
 * @param playerName - The player to assign quests to
 * @param pattern - Recurrence pattern (default 'daily')
 * @param saveQuest - Callback to persist each generated quest
 * @param config - Daily quest configuration
 * @returns Array of created recurring quests
 */
export async function generateRecurringQuests(
  ctx: WorldContext,
  playerName: string,
  pattern: RecurrencePattern = 'daily',
  saveQuest: (quest: InsertQuest) => Promise<Quest>,
  config: Partial<DailyQuestConfig> = {},
): Promise<Quest[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = new Date();
  const nextReset = calculateNextReset(pattern, now, cfg.resetHourUTC);

  const options: AssignmentOptions = {
    playerName,
    count: cfg.dailyQuestCount,
  };

  const assigned = assignQuests(
    { ...ctx, existingQuests: ctx.existingQuests },
    options,
  );

  const created: Quest[] = [];
  for (const quest of assigned) {
    const { templateId, filledParameters, ...questData } = quest;
    const recurringQuest: InsertQuest = {
      ...(questData as InsertQuest),
      recurrencePattern: pattern,
      recurrenceResetAt: nextReset,
      completionCount: 0,
      streakCount: 0,
      tags: [...((questData.tags as string[]) ?? []), `recurring:${pattern}`],
    };

    const saved = await saveQuest(recurringQuest);
    created.push(saved);
  }

  return created;
}
