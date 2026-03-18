import type { Quest, InsertQuest } from '../../shared/schema.js';
import {
  type TimedChallengeTemplate,
  type TimedChallengeResult,
  type TimedChallengeState,
  TIMED_CHALLENGE_TEMPLATES,
  createTimedChallengeState,
  isTimedChallengeExpired,
  getElapsedSeconds,
  calculateTimedChallengeResult,
} from '../../shared/timed-challenge.js';

export interface QuestStorage {
  getQuest(id: string): Promise<Quest | undefined>;
  updateQuest(id: string, data: Partial<InsertQuest>): Promise<Quest | undefined>;
  getQuestsByWorld(worldId: string): Promise<Quest[]>;
}

export interface AbandonResult {
  quest: Quest;
  canRetry: boolean;
  attemptsRemaining: number;
}

export interface FailResult {
  quest: Quest;
  canRetry: boolean;
  attemptsRemaining: number;
  reason: string;
}

export interface RetryResult {
  quest: Quest;
  attemptNumber: number;
  maxAttempts: number;
}

const MAX_ATTEMPTS_DEFAULT = 3;

/**
 * Abandon a quest. Sets status to 'abandoned', records the reason and timestamp,
 * and preserves current progress for potential retry.
 */
export async function abandonQuest(
  storage: QuestStorage,
  questId: string,
  worldId: string,
  reason?: string,
): Promise<AbandonResult> {
  const quest = await storage.getQuest(questId);
  if (!quest) {
    throw new QuestLifecycleError('Quest not found', 'NOT_FOUND');
  }
  if (quest.worldId !== worldId) {
    throw new QuestLifecycleError('Quest does not belong to this world', 'WRONG_WORLD');
  }
  if (quest.status !== 'active') {
    throw new QuestLifecycleError(
      `Cannot abandon a quest with status '${quest.status}'`,
      'INVALID_STATUS',
    );
  }

  const attemptCount = quest.attemptCount ?? 1;
  const maxAttempts = quest.maxAttempts ?? MAX_ATTEMPTS_DEFAULT;
  const canRetry = attemptCount < maxAttempts;

  const updated = await storage.updateQuest(questId, {
    status: 'abandoned',
    abandonedAt: new Date() as any,
    abandonReason: reason ?? null,
  });

  return {
    quest: updated!,
    canRetry,
    attemptsRemaining: Math.max(0, maxAttempts - attemptCount),
  };
}

/**
 * Fail a quest. Sets status to 'failed', records the reason and timestamp.
 */
export async function failQuest(
  storage: QuestStorage,
  questId: string,
  worldId: string,
  reason: string,
): Promise<FailResult> {
  const quest = await storage.getQuest(questId);
  if (!quest) {
    throw new QuestLifecycleError('Quest not found', 'NOT_FOUND');
  }
  if (quest.worldId !== worldId) {
    throw new QuestLifecycleError('Quest does not belong to this world', 'WRONG_WORLD');
  }
  if (quest.status !== 'active') {
    throw new QuestLifecycleError(
      `Cannot fail a quest with status '${quest.status}'`,
      'INVALID_STATUS',
    );
  }

  const attemptCount = quest.attemptCount ?? 1;
  const maxAttempts = quest.maxAttempts ?? MAX_ATTEMPTS_DEFAULT;
  const canRetry = attemptCount < maxAttempts;

  const updated = await storage.updateQuest(questId, {
    status: 'failed',
    failedAt: new Date() as any,
    failureReason: reason,
  });

  return {
    quest: updated!,
    canRetry,
    attemptsRemaining: Math.max(0, maxAttempts - attemptCount),
    reason,
  };
}

/**
 * Retry a failed or abandoned quest. Resets status to 'active', increments attempt count,
 * and clears progress so the player starts fresh.
 */
export async function retryQuest(
  storage: QuestStorage,
  questId: string,
  worldId: string,
): Promise<RetryResult> {
  const quest = await storage.getQuest(questId);
  if (!quest) {
    throw new QuestLifecycleError('Quest not found', 'NOT_FOUND');
  }
  if (quest.worldId !== worldId) {
    throw new QuestLifecycleError('Quest does not belong to this world', 'WRONG_WORLD');
  }
  if (quest.status !== 'failed' && quest.status !== 'abandoned') {
    throw new QuestLifecycleError(
      `Cannot retry a quest with status '${quest.status}'`,
      'INVALID_STATUS',
    );
  }

  const attemptCount = quest.attemptCount ?? 1;
  const maxAttempts = quest.maxAttempts ?? MAX_ATTEMPTS_DEFAULT;

  if (attemptCount >= maxAttempts) {
    throw new QuestLifecycleError(
      `Maximum attempts (${maxAttempts}) reached for this quest`,
      'MAX_ATTEMPTS',
    );
  }

  const newAttemptCount = attemptCount + 1;

  // Reset objectives' completed state while preserving structure
  const resetObjectives = Array.isArray(quest.objectives)
    ? quest.objectives.map((obj: any) => ({
        ...obj,
        completed: false,
        current: 0,
      }))
    : [];

  const updated = await storage.updateQuest(questId, {
    status: 'active',
    attemptCount: newAttemptCount,
    progress: { percentComplete: 0 } as any,
    objectives: resetObjectives,
    failedAt: null as any,
    abandonedAt: null as any,
    failureReason: null,
    abandonReason: null,
    completedAt: null as any,
  });

  return {
    quest: updated!,
    attemptNumber: newAttemptCount,
    maxAttempts,
  };
}

/**
 * Check if a quest has expired based on its expiresAt timestamp.
 * If expired, automatically fails it.
 */
export async function checkQuestExpiration(
  storage: QuestStorage,
  questId: string,
  worldId: string,
): Promise<FailResult | null> {
  const quest = await storage.getQuest(questId);
  if (!quest || quest.status !== 'active' || !quest.expiresAt) {
    return null;
  }

  if (new Date(quest.expiresAt) <= new Date()) {
    return failQuest(storage, questId, worldId, 'Quest expired');
  }

  return null;
}

// ── Timed Challenge Lifecycle ────────────────────────────────────────────────

export interface StartTimedChallengeResult {
  quest: Quest;
  timeLimitSeconds: number;
  template: TimedChallengeTemplate;
}

/**
 * Start a timed challenge on an active quest. Sets the timer state in
 * quest.progress and computes the expiresAt timestamp based on CEFR level.
 */
export async function startTimedChallenge(
  storage: QuestStorage,
  questId: string,
  worldId: string,
  template: TimedChallengeTemplate,
  cefrLevel?: string | null,
): Promise<StartTimedChallengeResult> {
  const quest = await storage.getQuest(questId);
  if (!quest) {
    throw new QuestLifecycleError('Quest not found', 'NOT_FOUND');
  }
  if (quest.worldId !== worldId) {
    throw new QuestLifecycleError('Quest does not belong to this world', 'WRONG_WORLD');
  }
  if (quest.status !== 'active') {
    throw new QuestLifecycleError(
      `Cannot start timed challenge on a quest with status '${quest.status}'`,
      'INVALID_STATUS',
    );
  }

  const timedState = createTimedChallengeState(template, cefrLevel);
  const expiresAt = new Date(
    new Date(timedState.startedAt).getTime() + timedState.timeLimitSeconds * 1000,
  );

  const existingProgress = (quest.progress as Record<string, any>) ?? {};
  const updated = await storage.updateQuest(questId, {
    progress: { ...existingProgress, timedChallenge: timedState } as any,
    expiresAt: expiresAt as any,
    tags: [...(quest.tags ?? []).filter((t: string) => t !== 'timed-challenge'), 'timed-challenge'],
  });

  return {
    quest: updated!,
    timeLimitSeconds: timedState.timeLimitSeconds,
    template,
  };
}

export interface CompleteTimedChallengeResult {
  quest: Quest;
  result: TimedChallengeResult;
}

/**
 * Complete a timed challenge quest. Calculates scoring tier and time bonus.
 * The quest remains active — the caller should use the result to apply rewards
 * and then mark the quest as completed.
 */
export async function completeTimedChallenge(
  storage: QuestStorage,
  questId: string,
  worldId: string,
  completedCount: number,
): Promise<CompleteTimedChallengeResult> {
  const quest = await storage.getQuest(questId);
  if (!quest) {
    throw new QuestLifecycleError('Quest not found', 'NOT_FOUND');
  }
  if (quest.worldId !== worldId) {
    throw new QuestLifecycleError('Quest does not belong to this world', 'WRONG_WORLD');
  }
  if (quest.status !== 'active') {
    throw new QuestLifecycleError(
      `Cannot complete timed challenge on a quest with status '${quest.status}'`,
      'INVALID_STATUS',
    );
  }

  const progress = quest.progress as Record<string, any> | null;
  const timedState = progress?.timedChallenge as TimedChallengeState | undefined;
  if (!timedState) {
    throw new QuestLifecycleError(
      'Quest does not have timed challenge state',
      'INVALID_STATUS',
    );
  }

  const config = TIMED_CHALLENGE_TEMPLATES[timedState.template];
  const elapsed = getElapsedSeconds(timedState);
  const result = calculateTimedChallengeResult(
    completedCount,
    config.defaultTargetCount,
    elapsed,
    timedState.timeLimitSeconds,
    timedState.tiers,
  );

  // Persist the result and update best score
  const bestScore = Math.max(completedCount, timedState.bestScore ?? 0);
  const updated = await storage.updateQuest(questId, {
    progress: {
      ...progress,
      timedChallenge: { ...timedState, bestScore },
      timedResult: result,
    } as any,
  });

  return { quest: updated!, result };
}

/**
 * Check if a timed challenge quest has expired based on its timer state.
 * If expired, fails the quest with the appropriate reason.
 */
export async function checkTimedChallengeExpiration(
  storage: QuestStorage,
  questId: string,
  worldId: string,
): Promise<FailResult | null> {
  const quest = await storage.getQuest(questId);
  if (!quest || quest.status !== 'active') return null;

  const progress = quest.progress as Record<string, any> | null;
  const timedState = progress?.timedChallenge as TimedChallengeState | undefined;
  if (!timedState) return null;

  if (isTimedChallengeExpired(timedState)) {
    return failQuest(storage, questId, worldId, 'Timed challenge expired');
  }
  return null;
}

export class QuestLifecycleError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'WRONG_WORLD' | 'INVALID_STATUS' | 'MAX_ATTEMPTS',
  ) {
    super(message);
    this.name = 'QuestLifecycleError';
  }
}
