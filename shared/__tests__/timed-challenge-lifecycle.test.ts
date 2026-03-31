import { describe, it, expect } from 'vitest';
import {
  startTimedChallenge,
  completeTimedChallenge,
  checkTimedChallengeExpiration,
  type QuestStorage,
} from '../quests/quest-lifecycle.js';
import type { Quest, InsertQuest } from '../schema';

// ── In-memory quest storage for testing ─────────────────────────────────────

function createMockStorage(initialQuests: Quest[] = []): QuestStorage {
  const quests = new Map<string, Quest>();
  for (const q of initialQuests) {
    quests.set(q.id, { ...q });
  }
  return {
    async getQuest(id: string) {
      return quests.get(id) ? { ...quests.get(id)! } : undefined;
    },
    async updateQuest(id: string, data: Partial<InsertQuest>) {
      const existing = quests.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...data } as Quest;
      quests.set(id, updated);
      return { ...updated };
    },
    async getQuestsByWorld(worldId: string) {
      return [...quests.values()].filter((q) => q.worldId === worldId);
    },
  };
}

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    assignedTo: 'player',
    title: 'Test Timed Quest',
    description: 'A timed challenge',
    questType: 'vocabulary',
    difficulty: 'beginner',
    targetLanguage: 'French',
    status: 'active',
    objectives: [],
    progress: {},
    experienceReward: 50,
    rewards: {},
    tags: [],
    relatedTruthIds: [],
    completionCriteria: {},
    assignedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Quest;
}

// ── startTimedChallenge ─────────────────────────────────────────────────────

describe('startTimedChallenge', () => {
  it('sets timed challenge state in progress', async () => {
    const quest = makeQuest();
    const storage = createMockStorage([quest]);
    const result = await startTimedChallenge(storage, 'quest-1', 'world-1', 'speed_round', 'B1');

    expect(result.template).toBe('speed_round');
    expect(result.timeLimitSeconds).toBe(180);
    const progress = result.quest.progress as any;
    expect(progress.timedChallenge).toBeDefined();
    expect(progress.timedChallenge.template).toBe('speed_round');
  });

  it('adjusts time for A1 learners', async () => {
    const quest = makeQuest();
    const storage = createMockStorage([quest]);
    const result = await startTimedChallenge(storage, 'quest-1', 'world-1', 'speed_round', 'A1');
    expect(result.timeLimitSeconds).toBe(270); // 180 * 1.5
  });

  it('sets expiresAt timestamp', async () => {
    const quest = makeQuest();
    const storage = createMockStorage([quest]);
    const result = await startTimedChallenge(storage, 'quest-1', 'world-1', 'speed_round', 'B1');
    expect(result.quest.expiresAt).toBeDefined();
  });

  it('adds timed-challenge tag', async () => {
    const quest = makeQuest({ tags: ['existing-tag'] });
    const storage = createMockStorage([quest]);
    const result = await startTimedChallenge(storage, 'quest-1', 'world-1', 'speed_round', 'B1');
    expect(result.quest.tags).toContain('timed-challenge');
    expect(result.quest.tags).toContain('existing-tag');
  });

  it('throws for non-active quest', async () => {
    const quest = makeQuest({ status: 'completed' });
    const storage = createMockStorage([quest]);
    await expect(
      startTimedChallenge(storage, 'quest-1', 'world-1', 'speed_round', 'B1'),
    ).rejects.toThrow('Cannot start timed challenge');
  });

  it('throws for wrong world', async () => {
    const quest = makeQuest();
    const storage = createMockStorage([quest]);
    await expect(
      startTimedChallenge(storage, 'quest-1', 'wrong-world', 'speed_round', 'B1'),
    ).rejects.toThrow('does not belong to this world');
  });
});

// ── completeTimedChallenge ──────────────────────────────────────────────────

describe('completeTimedChallenge', () => {
  it('calculates gold tier for high completion', async () => {
    const quest = makeQuest({
      progress: {
        timedChallenge: {
          startedAt: new Date(Date.now() - 60_000).toISOString(),
          timeLimitSeconds: 180,
          template: 'speed_round',
          tiers: { gold: 12, silver: 8, bronze: 5 },
        },
      } as any,
    });
    const storage = createMockStorage([quest]);
    const { result } = await completeTimedChallenge(storage, 'quest-1', 'world-1', 13);

    expect(result.tier).toBe('gold');
    expect(result.completedCount).toBe(13);
    expect(result.timeBonus).toBeGreaterThan(1.0);
  });

  it('calculates bronze tier', async () => {
    const quest = makeQuest({
      progress: {
        timedChallenge: {
          startedAt: new Date(Date.now() - 170_000).toISOString(),
          timeLimitSeconds: 180,
          template: 'speed_round',
          tiers: { gold: 12, silver: 8, bronze: 5 },
        },
      } as any,
    });
    const storage = createMockStorage([quest]);
    const { result } = await completeTimedChallenge(storage, 'quest-1', 'world-1', 6);

    expect(result.tier).toBe('bronze');
  });

  it('persists best score', async () => {
    const quest = makeQuest({
      progress: {
        timedChallenge: {
          startedAt: new Date(Date.now() - 60_000).toISOString(),
          timeLimitSeconds: 180,
          template: 'speed_round',
          tiers: { gold: 12, silver: 8, bronze: 5 },
          bestScore: 10,
        },
      } as any,
    });
    const storage = createMockStorage([quest]);
    const { quest: updated } = await completeTimedChallenge(storage, 'quest-1', 'world-1', 13);

    const progress = updated.progress as any;
    expect(progress.timedChallenge.bestScore).toBe(13);
  });

  it('keeps previous best if current is lower', async () => {
    const quest = makeQuest({
      progress: {
        timedChallenge: {
          startedAt: new Date(Date.now() - 60_000).toISOString(),
          timeLimitSeconds: 180,
          template: 'speed_round',
          tiers: { gold: 12, silver: 8, bronze: 5 },
          bestScore: 14,
        },
      } as any,
    });
    const storage = createMockStorage([quest]);
    const { quest: updated } = await completeTimedChallenge(storage, 'quest-1', 'world-1', 10);

    const progress = updated.progress as any;
    expect(progress.timedChallenge.bestScore).toBe(14);
  });

  it('throws if quest has no timed challenge state', async () => {
    const quest = makeQuest({ progress: {} as any });
    const storage = createMockStorage([quest]);
    await expect(
      completeTimedChallenge(storage, 'quest-1', 'world-1', 5),
    ).rejects.toThrow('does not have timed challenge state');
  });
});

// ── checkTimedChallengeExpiration ────────────────────────────────────────────

describe('checkTimedChallengeExpiration', () => {
  it('returns null for non-expired challenge', async () => {
    const quest = makeQuest({
      progress: {
        timedChallenge: {
          startedAt: new Date().toISOString(),
          timeLimitSeconds: 180,
          template: 'speed_round',
          tiers: { gold: 12, silver: 8, bronze: 5 },
        },
      } as any,
    });
    const storage = createMockStorage([quest]);
    const result = await checkTimedChallengeExpiration(storage, 'quest-1', 'world-1');
    expect(result).toBeNull();
  });

  it('fails expired challenge', async () => {
    const quest = makeQuest({
      progress: {
        timedChallenge: {
          startedAt: new Date(Date.now() - 200_000).toISOString(),
          timeLimitSeconds: 180,
          template: 'speed_round',
          tiers: { gold: 12, silver: 8, bronze: 5 },
        },
      } as any,
    });
    const storage = createMockStorage([quest]);
    const result = await checkTimedChallengeExpiration(storage, 'quest-1', 'world-1');
    expect(result).not.toBeNull();
    expect(result!.quest.status).toBe('failed');
    expect(result!.reason).toBe('Timed challenge expired');
  });

  it('returns null for quest without timed state', async () => {
    const quest = makeQuest();
    const storage = createMockStorage([quest]);
    const result = await checkTimedChallengeExpiration(storage, 'quest-1', 'world-1');
    expect(result).toBeNull();
  });

  it('returns null for non-active quest', async () => {
    const quest = makeQuest({ status: 'completed' });
    const storage = createMockStorage([quest]);
    const result = await checkTimedChallengeExpiration(storage, 'quest-1', 'world-1');
    expect(result).toBeNull();
  });
});
