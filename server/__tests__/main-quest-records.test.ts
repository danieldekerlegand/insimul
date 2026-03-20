import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMainQuestRecord,
  findMainQuestRecord,
  updateMainQuestObjectiveProgress,
  completeMainQuestRecord,
} from '../services/main-quest-records';
import { MAIN_QUEST_CHAPTERS } from '../../shared/quest/main-quest-chapters';
import type { Quest, InsertQuest } from '../../shared/schema';

// ── Mock storage ────────────────────────────────────────────────────────────

interface StoredQuest {
  id: string;
  [key: string]: any;
}

let mockQuests: StoredQuest[] = [];
let questIdCounter = 0;

vi.mock('../db/storage', () => ({
  storage: {
    getQuestsByWorld: vi.fn(async (worldId: string) =>
      mockQuests.filter(q => q.worldId === worldId),
    ),
    createQuest: vi.fn(async (data: InsertQuest) => {
      const quest: StoredQuest = {
        ...data,
        id: `quest_${++questIdCounter}`,
        assignedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockQuests.push(quest);
      return quest as unknown as Quest;
    }),
    updateQuest: vi.fn(async (id: string, data: Partial<InsertQuest>) => {
      const idx = mockQuests.findIndex(q => q.id === id);
      if (idx === -1) return undefined;
      mockQuests[idx] = { ...mockQuests[idx], ...data };
      return mockQuests[idx] as unknown as Quest;
    }),
  },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

const WORLD_ID = 'world_1';
const PLAYER_ID = 'player_1';
const TARGET_LANGUAGE = 'French';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Main Quest Records', () => {
  beforeEach(() => {
    mockQuests = [];
    questIdCounter = 0;
    vi.clearAllMocks();
  });

  describe('createMainQuestRecord', () => {
    it('creates a quest record for chapter 1', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      const quest = await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      expect(quest.title).toBe('Chapter 1: Arrival');
      expect(quest.questType).toBe('main_quest');
      expect(quest.status).toBe('active');
      expect(quest.worldId).toBe(WORLD_ID);
      expect(quest.assignedTo).toBe(PLAYER_ID);
      expect(quest.targetLanguage).toBe(TARGET_LANGUAGE);
      expect(quest.experienceReward).toBe(300);
      expect(quest.tags).toContain('main_quest');
      expect(quest.tags).toContain('chapter:1');
      expect(quest.tags).toContain('chapterId:ch1_arrival');
    });

    it('converts objectives to standard format', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      const quest = await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      expect(quest.objectives).toHaveLength(2);
      expect(quest.objectives[0]).toMatchObject({
        id: 'ch1_greetings',
        type: 'vocabulary',
        completed: false,
        current: 0,
        required: 2,
      });
      expect(quest.objectives[1]).toMatchObject({
        id: 'ch1_conversations',
        type: 'conversation',
        completed: false,
        current: 0,
        required: 3,
      });
    });

    it('includes gold and xp rewards', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      const quest = await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      expect(quest.rewards).toEqual({ gold: 50, xp: 300 });
    });

    it('does not create duplicate quest records', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      expect(mockQuests).toHaveLength(1);
    });

    it('creates records for different chapters', async () => {
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, MAIN_QUEST_CHAPTERS[0], TARGET_LANGUAGE);
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, MAIN_QUEST_CHAPTERS[1], TARGET_LANGUAGE);

      expect(mockQuests).toHaveLength(2);
      expect(mockQuests[0].title).toBe('Chapter 1: Arrival');
      expect(mockQuests[1].title).toBe('Chapter 2: Settling In');
    });

    it('sets difficulty based on CEFR level', async () => {
      const ch1 = await createMainQuestRecord(WORLD_ID, PLAYER_ID, MAIN_QUEST_CHAPTERS[0], TARGET_LANGUAGE);
      expect(ch1.difficulty).toBe('beginner'); // A1

      const ch3 = await createMainQuestRecord(WORLD_ID, PLAYER_ID, MAIN_QUEST_CHAPTERS[2], TARGET_LANGUAGE);
      expect(ch3.difficulty).toBe('intermediate'); // A2

      const ch5 = await createMainQuestRecord(WORLD_ID, PLAYER_ID, MAIN_QUEST_CHAPTERS[4], TARGET_LANGUAGE);
      expect(ch5.difficulty).toBe('advanced'); // B1
    });

    it('scales gold rewards with chapter number', async () => {
      const q1 = await createMainQuestRecord(WORLD_ID, PLAYER_ID, MAIN_QUEST_CHAPTERS[0], TARGET_LANGUAGE);
      expect(q1.rewards.gold).toBe(50);

      const q6 = await createMainQuestRecord(WORLD_ID, PLAYER_ID, MAIN_QUEST_CHAPTERS[5], TARGET_LANGUAGE);
      expect(q6.rewards.gold).toBe(500);
    });
  });

  describe('findMainQuestRecord', () => {
    it('finds an existing main quest record by chapter ID', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      const found = await findMainQuestRecord(WORLD_ID, chapter.id, PLAYER_ID);
      expect(found).toBeDefined();
      expect(found!.title).toBe('Chapter 1: Arrival');
    });

    it('returns undefined when no record exists', async () => {
      const found = await findMainQuestRecord(WORLD_ID, 'nonexistent', PLAYER_ID);
      expect(found).toBeUndefined();
    });

    it('does not match quests for different players', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      const found = await findMainQuestRecord(WORLD_ID, chapter.id, 'other_player');
      expect(found).toBeUndefined();
    });
  });

  describe('updateMainQuestObjectiveProgress', () => {
    it('updates objective progress on the quest record', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      const progress = { ch1_greetings: 1, ch1_conversations: 2 };
      const updated = await updateMainQuestObjectiveProgress(
        WORLD_ID, PLAYER_ID, chapter.id, progress, chapter,
      );

      expect(updated).toBeDefined();
      expect(updated!.objectives[0].current).toBe(1);
      expect(updated!.objectives[0].completed).toBe(false);
      expect(updated!.objectives[1].current).toBe(2);
      expect(updated!.objectives[1].completed).toBe(false);
    });

    it('marks objectives as completed when count met', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      const progress = { ch1_greetings: 2, ch1_conversations: 3 };
      const updated = await updateMainQuestObjectiveProgress(
        WORLD_ID, PLAYER_ID, chapter.id, progress, chapter,
      );

      expect(updated!.objectives[0].completed).toBe(true);
      expect(updated!.objectives[1].completed).toBe(true);
    });

    it('returns undefined when no quest record exists', async () => {
      const result = await updateMainQuestObjectiveProgress(
        WORLD_ID, PLAYER_ID, 'nonexistent', {}, MAIN_QUEST_CHAPTERS[0],
      );
      expect(result).toBeUndefined();
    });
  });

  describe('completeMainQuestRecord', () => {
    it('marks the quest record as completed', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      const completed = await completeMainQuestRecord(WORLD_ID, PLAYER_ID, chapter.id);

      expect(completed).toBeDefined();
      expect(completed!.status).toBe('completed');
      expect(completed!.completedAt).toBeDefined();
    });

    it('marks all objectives as completed', async () => {
      const chapter = MAIN_QUEST_CHAPTERS[0];
      await createMainQuestRecord(WORLD_ID, PLAYER_ID, chapter, TARGET_LANGUAGE);

      const completed = await completeMainQuestRecord(WORLD_ID, PLAYER_ID, chapter.id);
      const objectives = completed!.objectives as any[];

      expect(objectives.every((o: any) => o.completed)).toBe(true);
    });

    it('returns undefined when no quest record exists', async () => {
      const result = await completeMainQuestRecord(WORLD_ID, PLAYER_ID, 'nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
