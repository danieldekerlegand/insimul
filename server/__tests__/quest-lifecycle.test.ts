import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  abandonQuest,
  failQuest,
  retryQuest,
  checkQuestExpiration,
  QuestLifecycleError,
  type QuestStorage,
} from '../../shared/quests/quest-lifecycle.js';

function makeQuest(overrides: Record<string, any> = {}) {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    title: 'Learn Greetings',
    description: 'Practice basic French greetings',
    questType: 'vocabulary',
    difficulty: 'beginner',
    targetLanguage: 'French',
    status: 'active',
    assignedTo: 'player-1',
    attemptCount: 1,
    maxAttempts: 3,
    objectives: [
      { type: 'use_vocabulary', description: 'Use 3 French greetings', completed: false, current: 1, required: 3 },
      { type: 'talk_to_npc', description: 'Talk to the baker', completed: true, current: 1, required: 1 },
    ],
    progress: { percentComplete: 40 },
    expiresAt: null,
    failedAt: null,
    abandonedAt: null,
    failureReason: null,
    abandonReason: null,
    completedAt: null,
    ...overrides,
  } as any;
}

function makeMockStorage(quest: any | null = makeQuest()): QuestStorage {
  return {
    getQuest: vi.fn().mockResolvedValue(quest),
    updateQuest: vi.fn().mockImplementation(async (_id, data) => ({ ...quest, ...data })),
    getQuestsByWorld: vi.fn().mockResolvedValue(quest ? [quest] : []),
  };
}

describe('Quest Lifecycle', () => {
  // ── Abandon ──────────────────────────────────────────────────────────
  describe('abandonQuest', () => {
    it('sets status to abandoned with reason and timestamp', async () => {
      const storage = makeMockStorage();
      const result = await abandonQuest(storage, 'quest-1', 'world-1', 'Too hard');

      expect(storage.updateQuest).toHaveBeenCalledWith('quest-1', {
        status: 'abandoned',
        abandonedAt: expect.any(Date),
        abandonReason: 'Too hard',
      });
      expect(result.quest.status).toBe('abandoned');
      expect(result.canRetry).toBe(true);
      expect(result.attemptsRemaining).toBe(2);
    });

    it('works without a reason', async () => {
      const storage = makeMockStorage();
      const result = await abandonQuest(storage, 'quest-1', 'world-1');

      expect(storage.updateQuest).toHaveBeenCalledWith('quest-1', {
        status: 'abandoned',
        abandonedAt: expect.any(Date),
        abandonReason: null,
      });
      expect(result.quest.status).toBe('abandoned');
    });

    it('throws NOT_FOUND when quest does not exist', async () => {
      const storage = makeMockStorage(null);
      await expect(abandonQuest(storage, 'missing', 'world-1')).rejects.toThrow(QuestLifecycleError);
      await expect(abandonQuest(storage, 'missing', 'world-1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('throws WRONG_WORLD when worldId mismatches', async () => {
      const storage = makeMockStorage();
      await expect(abandonQuest(storage, 'quest-1', 'wrong-world')).rejects.toMatchObject({ code: 'WRONG_WORLD' });
    });

    it('throws INVALID_STATUS when quest is not active', async () => {
      const storage = makeMockStorage(makeQuest({ status: 'completed' }));
      await expect(abandonQuest(storage, 'quest-1', 'world-1')).rejects.toMatchObject({ code: 'INVALID_STATUS' });
    });

    it('reports canRetry=false at max attempts', async () => {
      const storage = makeMockStorage(makeQuest({ attemptCount: 3, maxAttempts: 3 }));
      const result = await abandonQuest(storage, 'quest-1', 'world-1');
      expect(result.canRetry).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
    });
  });

  // ── Fail ─────────────────────────────────────────────────────────────
  describe('failQuest', () => {
    it('sets status to failed with reason and timestamp', async () => {
      const storage = makeMockStorage();
      const result = await failQuest(storage, 'quest-1', 'world-1', 'Time ran out');

      expect(storage.updateQuest).toHaveBeenCalledWith('quest-1', {
        status: 'failed',
        failedAt: expect.any(Date),
        failureReason: 'Time ran out',
      });
      expect(result.quest.status).toBe('failed');
      expect(result.reason).toBe('Time ran out');
      expect(result.canRetry).toBe(true);
      expect(result.attemptsRemaining).toBe(2);
    });

    it('throws NOT_FOUND for missing quest', async () => {
      const storage = makeMockStorage(null);
      await expect(failQuest(storage, 'x', 'world-1', 'reason')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('throws INVALID_STATUS for already-failed quest', async () => {
      const storage = makeMockStorage(makeQuest({ status: 'failed' }));
      await expect(failQuest(storage, 'quest-1', 'world-1', 'reason')).rejects.toMatchObject({ code: 'INVALID_STATUS' });
    });

    it('reports canRetry=false at max attempts', async () => {
      const storage = makeMockStorage(makeQuest({ attemptCount: 3 }));
      const result = await failQuest(storage, 'quest-1', 'world-1', 'reason');
      expect(result.canRetry).toBe(false);
    });
  });

  // ── Retry ────────────────────────────────────────────────────────────
  describe('retryQuest', () => {
    it('resets a failed quest to active with incremented attempt count', async () => {
      const quest = makeQuest({ status: 'failed', attemptCount: 1 });
      const storage = makeMockStorage(quest);
      const result = await retryQuest(storage, 'quest-1', 'world-1');

      expect(storage.updateQuest).toHaveBeenCalledWith('quest-1', {
        status: 'active',
        attemptCount: 2,
        progress: { percentComplete: 0 },
        objectives: [
          { type: 'use_vocabulary', description: 'Use 3 French greetings', completed: false, current: 0, required: 3 },
          { type: 'talk_to_npc', description: 'Talk to the baker', completed: false, current: 0, required: 1 },
        ],
        failedAt: null,
        abandonedAt: null,
        failureReason: null,
        abandonReason: null,
        completedAt: null,
      });
      expect(result.attemptNumber).toBe(2);
      expect(result.maxAttempts).toBe(3);
    });

    it('resets an abandoned quest to active', async () => {
      const quest = makeQuest({ status: 'abandoned', attemptCount: 1 });
      const storage = makeMockStorage(quest);
      const result = await retryQuest(storage, 'quest-1', 'world-1');

      expect(result.quest.status).toBe('active');
      expect(result.attemptNumber).toBe(2);
    });

    it('throws INVALID_STATUS for active quest', async () => {
      const storage = makeMockStorage(makeQuest({ status: 'active' }));
      await expect(retryQuest(storage, 'quest-1', 'world-1')).rejects.toMatchObject({ code: 'INVALID_STATUS' });
    });

    it('throws MAX_ATTEMPTS when limit reached', async () => {
      const storage = makeMockStorage(makeQuest({ status: 'failed', attemptCount: 3, maxAttempts: 3 }));
      await expect(retryQuest(storage, 'quest-1', 'world-1')).rejects.toMatchObject({ code: 'MAX_ATTEMPTS' });
    });

    it('throws NOT_FOUND for missing quest', async () => {
      const storage = makeMockStorage(null);
      await expect(retryQuest(storage, 'x', 'world-1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  // ── Expiration ───────────────────────────────────────────────────────
  describe('checkQuestExpiration', () => {
    it('fails an expired quest', async () => {
      const pastDate = new Date(Date.now() - 60_000);
      const quest = makeQuest({ expiresAt: pastDate });
      const storage = makeMockStorage(quest);

      const result = await checkQuestExpiration(storage, 'quest-1', 'world-1');
      expect(result).not.toBeNull();
      expect(result!.quest.status).toBe('failed');
      expect(result!.reason).toBe('Quest expired');
    });

    it('returns null for non-expired quest', async () => {
      const futureDate = new Date(Date.now() + 60_000);
      const quest = makeQuest({ expiresAt: futureDate });
      const storage = makeMockStorage(quest);

      const result = await checkQuestExpiration(storage, 'quest-1', 'world-1');
      expect(result).toBeNull();
    });

    it('returns null for quest without expiration', async () => {
      const storage = makeMockStorage(makeQuest());
      const result = await checkQuestExpiration(storage, 'quest-1', 'world-1');
      expect(result).toBeNull();
    });

    it('returns null for non-active quest', async () => {
      const quest = makeQuest({ status: 'completed', expiresAt: new Date(Date.now() - 60_000) });
      const storage = makeMockStorage(quest);
      const result = await checkQuestExpiration(storage, 'quest-1', 'world-1');
      expect(result).toBeNull();
    });
  });
});
