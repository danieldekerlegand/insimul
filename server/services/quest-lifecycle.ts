import type { Quest, InsertQuest } from '../../shared/schema.js';

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

export class QuestLifecycleError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'WRONG_WORLD' | 'INVALID_STATUS' | 'MAX_ATTEMPTS',
  ) {
    super(message);
    this.name = 'QuestLifecycleError';
  }
}
