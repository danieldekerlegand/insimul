import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  narrativeArcTemplates,
  getNarrativeArcTemplate,
  listNarrativeArcTemplates,
} from '../../shared/quests/narrative-arc-templates.js';
import { NarrativeArcManager } from '../../shared/quests/narrative-arc-manager.js';
import type {
  NarrativeArcTemplate,
  ArcQuestMetadata,
  CEFRLevel,
} from '../../shared/narrative-arc-types';
import {
  ARC_TAG_PREFIX,
  ARC_CHAPTER_TAG_PREFIX,
  ARC_ACT_TAG_PREFIX,
} from '../../shared/narrative-arc-types';
import type { Quest, InsertQuest } from '../../shared/schema';

// ── Template Tests ──────────────────────────────────────────────────────────

describe('Narrative Arc Templates', () => {
  it('has the_lost_heritage template', () => {
    expect(narrativeArcTemplates).toHaveProperty('the_lost_heritage');
  });

  it('the_lost_heritage has 3 acts', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    expect(t.acts).toHaveLength(3);
    expect(t.acts[0].actType).toBe('introduction');
    expect(t.acts[1].actType).toBe('rising_action');
    expect(t.acts[2].actType).toBe('climax_resolution');
  });

  it('each act has at least one chapter', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    for (const act of t.acts) {
      expect(act.chapters.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each chapter has at least one subquest', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    for (const act of t.acts) {
      for (const chapter of act.chapters) {
        expect(chapter.subQuests.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('chapters have sequential order', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    const orders: number[] = [];
    for (const act of t.acts) {
      for (const chapter of act.chapters) {
        orders.push(chapter.order);
      }
    }
    // Orders should be strictly increasing
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    }
  });

  it('CEFR levels progress from A1 to B2', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    const cefrOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    let maxCefrIdx = 0;
    for (const act of t.acts) {
      for (const chapter of act.chapters) {
        const idx = cefrOrder.indexOf(chapter.requiredCefrLevel);
        expect(idx).toBeGreaterThanOrEqual(maxCefrIdx);
        maxCefrIdx = idx;
      }
    }
    // Should reach at least B1
    expect(maxCefrIdx).toBeGreaterThanOrEqual(cefrOrder.indexOf('B1'));
  });

  it('all subquests have valid fields', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    for (const act of t.acts) {
      for (const chapter of act.chapters) {
        for (const sq of chapter.subQuests) {
          expect(sq.key).toBeTruthy();
          expect(sq.title).toBeTruthy();
          expect(sq.description).toBeTruthy();
          expect(sq.questType).toBeTruthy();
          expect(sq.difficulty).toBeTruthy();
          expect(sq.cefrLevel).toBeTruthy();
          expect(sq.estimatedMinutes).toBeGreaterThan(0);
          expect(sq.objectives.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('first chapter has no prerequisites', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    const firstChapter = t.acts[0].chapters[0];
    expect(firstChapter.prerequisiteChapterKeys).toEqual([]);
  });

  it('subsequent chapters reference valid prerequisite keys', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    const allKeys = new Set<string>();
    for (const act of t.acts) {
      for (const chapter of act.chapters) {
        allKeys.add(chapter.key);
      }
    }
    for (const act of t.acts) {
      for (const chapter of act.chapters) {
        for (const prereq of chapter.prerequisiteChapterKeys) {
          expect(allKeys.has(prereq)).toBe(true);
        }
      }
    }
  });
});

describe('getNarrativeArcTemplate', () => {
  it('returns template with target language applied', () => {
    const t = getNarrativeArcTemplate('the_lost_heritage', 'French');
    expect(t).not.toBeNull();
    expect(t!.targetLanguage).toBe('French');
    expect(t!.name).toBe('The Lost Heritage');
  });

  it('returns null for unknown template', () => {
    expect(getNarrativeArcTemplate('nonexistent', 'French')).toBeNull();
  });
});

describe('listNarrativeArcTemplates', () => {
  it('returns template summaries', () => {
    const list = listNarrativeArcTemplates();
    expect(list.length).toBeGreaterThan(0);

    const heritage = list.find(t => t.id === 'the_lost_heritage');
    expect(heritage).toBeDefined();
    expect(heritage!.name).toBe('The Lost Heritage');
    expect(heritage!.totalChapters).toBeGreaterThan(0);
    expect(heritage!.totalSubQuests).toBeGreaterThan(0);
    expect(heritage!.estimatedHours).toBeGreaterThan(0);
  });
});

// ── Manager Tests (with mocked storage) ─────────────────────────────────────

// Mock storage to avoid DB dependency
const mockQuests: Quest[] = [];
let questIdCounter = 0;

vi.mock('../db/storage', () => ({
  storage: {
    createQuest: vi.fn(async (data: InsertQuest) => {
      const quest: Quest = {
        ...data,
        id: `quest_${++questIdCounter}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Fill in required fields that InsertQuest might not have
        assignedBy: data.assignedBy || null,
        assignedByCharacterId: data.assignedByCharacterId || null,
        assignedToCharacterId: data.assignedToCharacterId || null,
        cefrLevel: data.cefrLevel || null,
        difficultyStars: data.difficultyStars || null,
        estimatedMinutes: data.estimatedMinutes || null,
        gameType: data.gameType || 'language-learning',
        questChainId: data.questChainId || null,
        questChainOrder: data.questChainOrder ?? null,
        prerequisiteQuestIds: data.prerequisiteQuestIds || null,
        objectives: data.objectives || [],
        progress: data.progress || {},
        completionCriteria: data.completionCriteria || {},
        experienceReward: data.experienceReward || 0,
        rewards: data.rewards || {},
        itemRewards: data.itemRewards || null,
        skillRewards: data.skillRewards || null,
        unlocks: data.unlocks || null,
        stages: data.stages || null,
        currentStageId: data.currentStageId || null,
        parentQuestId: data.parentQuestId || null,
        failureConditions: data.failureConditions || null,
        attemptCount: data.attemptCount || 1,
        maxAttempts: data.maxAttempts || 3,
        abandonedAt: null,
        failedAt: null,
        failureReason: null,
        abandonReason: null,
        locationId: data.locationId || null,
        locationName: data.locationName || null,
        locationPosition: data.locationPosition || null,
        recurrencePattern: data.recurrencePattern || null,
        recurrenceResetAt: null,
        completionCount: 0,
        lastCompletedAt: null,
        sourceQuestId: data.sourceQuestId || null,
        streakCount: 0,
        completedAt: null,
        expiresAt: null,
        conversationContext: data.conversationContext || null,
        content: data.content || null,
        relatedTruthIds: data.relatedTruthIds || [],
      } as any;
      mockQuests.push(quest);
      return quest;
    }),
    getQuestsByWorld: vi.fn(async () => [...mockQuests]),
    getQuest: vi.fn(async (id: string) => mockQuests.find(q => q.id === id)),
    updateQuest: vi.fn(async (id: string, data: Partial<InsertQuest>) => {
      const idx = mockQuests.findIndex(q => q.id === id);
      if (idx === -1) return undefined;
      mockQuests[idx] = { ...mockQuests[idx], ...data } as any;
      return mockQuests[idx];
    }),
    deleteQuest: vi.fn(async (id: string) => {
      const idx = mockQuests.findIndex(q => q.id === id);
      if (idx === -1) return false;
      mockQuests.splice(idx, 1);
      return true;
    }),
    getQuestsByPlayer: vi.fn(async (name: string) =>
      mockQuests.filter(q => q.assignedTo === name),
    ),
  },
}));

describe('NarrativeArcManager', () => {
  let manager: NarrativeArcManager;

  beforeEach(() => {
    mockQuests.length = 0;
    questIdCounter = 0;
    manager = new NarrativeArcManager();
    vi.clearAllMocks();
  });

  describe('createArc', () => {
    it('creates an arc with all chapters and subquests', async () => {
      const arc = await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );

      expect(arc).not.toBeNull();
      expect(arc!.name).toBe('The Lost Heritage');
      expect(arc!.targetLanguage).toBe('French');
      expect(arc!.templateId).toBe('the_lost_heritage');
      expect(arc!.acts).toHaveLength(3);
      expect(arc!.percentComplete).toBe(0);
      expect(arc!.currentActType).toBe('introduction');

      // Count total subquests created (excluding root quest)
      const subQuests = mockQuests.filter(
        q => !(q.tags || []).includes('main_quest_root'),
      );
      expect(subQuests.length).toBeGreaterThan(0);

      // Root quest should exist
      const root = mockQuests.find(q =>
        (q.tags || []).includes('main_quest_root'),
      );
      expect(root).toBeDefined();
      expect(root!.title).toContain('Main Quest');
    });

    it('first subquest is active, rest are pending', async () => {
      await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );

      const subQuests = mockQuests.filter(
        q =>
          (q.tags || []).includes('main_quest') &&
          !(q.tags || []).includes('main_quest_root'),
      );

      const activeQuests = subQuests.filter(q => q.status === 'active');
      const pendingQuests = subQuests.filter(q => q.status === 'pending');

      expect(activeQuests).toHaveLength(1);
      expect(pendingQuests.length).toBe(subQuests.length - 1);
    });

    it('subquests have arc metadata tags', async () => {
      await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );

      const subQuests = mockQuests.filter(
        q =>
          (q.tags || []).includes('main_quest') &&
          !(q.tags || []).includes('main_quest_root'),
      );

      for (const sq of subQuests) {
        const arcTag = (sq.tags || []).find(
          (t: string) => typeof t === 'string' && t.startsWith(ARC_TAG_PREFIX),
        );
        expect(arcTag).toBeDefined();

        // Parse the metadata
        const meta: ArcQuestMetadata = JSON.parse(
          arcTag!.slice(ARC_TAG_PREFIX.length),
        );
        expect(meta.templateId).toBe('the_lost_heritage');
        expect(meta.actType).toBeTruthy();
        expect(meta.chapterKey).toBeTruthy();
        expect(meta.subQuestKey).toBeTruthy();
        expect(typeof meta.mainQuestOrder).toBe('number');
      }
    });

    it('returns null for unknown template', async () => {
      const arc = await manager.createArc(
        'nonexistent',
        'world_1',
        'French',
        'player1',
      );
      expect(arc).toBeNull();
    });

    it('prevents duplicate arcs for same player', async () => {
      await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );
      const duplicate = await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );
      expect(duplicate).toBeNull();
    });

    it('subquests within a chapter are ordered sequentially via arc metadata', async () => {
      const arc = await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );

      // Get quests for getting_settled chapter (has 3 subquests)
      const chapterQuests = mockQuests.filter(
        q =>
          (q.tags || []).some(
            (t: string) =>
              typeof t === 'string' &&
              t === `${ARC_CHAPTER_TAG_PREFIX}getting_settled`,
          ),
      );

      expect(chapterQuests.length).toBe(3);

      // The chapter progress should track the subquest IDs in order
      const chapterProgress = arc!.acts
        .flatMap(a => a.chapters)
        .find(c => c.chapterKey === 'getting_settled');

      expect(chapterProgress).toBeDefined();
      expect(chapterProgress!.subQuestIds).toHaveLength(3);

      // Subquest IDs should match the created quests
      for (const sqId of chapterProgress!.subQuestIds) {
        expect(chapterQuests.some(q => q.id === sqId)).toBe(true);
      }

      // Arc metadata should have increasing mainQuestOrder
      const orders = chapterQuests.map(q => {
        const arcTag = (q.tags || []).find(
          (t: string) => typeof t === 'string' && t.startsWith(ARC_TAG_PREFIX),
        );
        return JSON.parse(arcTag!.slice(ARC_TAG_PREFIX.length)).mainQuestOrder;
      });
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i]).toBeGreaterThan(orders[i - 1]);
      }
    });
  });

  describe('getArcForPlayer', () => {
    it('returns null when no arc exists', async () => {
      const arc = await manager.getArcForPlayer('world_1', 'player1');
      expect(arc).toBeNull();
    });

    it('returns arc after creation', async () => {
      await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );
      const arc = await manager.getArcForPlayer('world_1', 'player1');
      expect(arc).not.toBeNull();
      expect(arc!.name).toBe('The Lost Heritage');
    });
  });

  describe('refreshArcProgress', () => {
    it('updates progress when subquests complete', async () => {
      const arc = await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );
      expect(arc).not.toBeNull();

      // Complete the first subquest
      const firstSubQuest = mockQuests.find(
        q => q.status === 'active' && (q.tags || []).includes('main_quest') && !(q.tags || []).includes('main_quest_root'),
      );
      expect(firstSubQuest).toBeDefined();

      // Mark it completed
      const idx = mockQuests.findIndex(q => q.id === firstSubQuest!.id);
      mockQuests[idx] = { ...mockQuests[idx], status: 'completed' } as any;

      const refreshed = await manager.refreshArcProgress(
        'world_1',
        'player1',
        'A1',
      );

      expect(refreshed).not.toBeNull();
      expect(refreshed!.percentComplete).toBeGreaterThan(0);
    });
  });

  describe('getMainQuestSubQuests', () => {
    it('returns all subquests excluding root', async () => {
      await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );

      const quests = await manager.getMainQuestSubQuests('world_1', 'player1');

      // Should not include the root quest
      expect(quests.every(q => !(q.tags || []).includes('main_quest_root'))).toBe(true);
      // All should have main_quest tag
      expect(quests.every(q => (q.tags || []).includes('main_quest'))).toBe(true);
      expect(quests.length).toBeGreaterThan(0);
    });
  });

  describe('deleteArc', () => {
    it('removes all arc quests', async () => {
      await manager.createArc(
        'the_lost_heritage',
        'world_1',
        'French',
        'player1',
      );

      const beforeCount = mockQuests.length;
      expect(beforeCount).toBeGreaterThan(0);

      const deleted = await manager.deleteArc('world_1', 'player1');
      expect(deleted).toBe(true);
      expect(mockQuests.length).toBe(0);
    });

    it('returns false when no arc exists', async () => {
      const deleted = await manager.deleteArc('world_1', 'player1');
      expect(deleted).toBe(false);
    });
  });
});

// ── Type Tests ──────────────────────────────────────────────────────────────

describe('Narrative Arc Types', () => {
  it('tag prefixes are distinct', () => {
    expect(ARC_TAG_PREFIX).not.toBe(ARC_CHAPTER_TAG_PREFIX);
    expect(ARC_TAG_PREFIX).not.toBe(ARC_ACT_TAG_PREFIX);
    expect(ARC_CHAPTER_TAG_PREFIX).not.toBe(ARC_ACT_TAG_PREFIX);
  });

  it('template structure counts match expectations', () => {
    const t = narrativeArcTemplates['the_lost_heritage'];
    let totalChapters = 0;
    let totalSubQuests = 0;
    for (const act of t.acts) {
      totalChapters += act.chapters.length;
      for (const chapter of act.chapters) {
        totalSubQuests += chapter.subQuests.length;
      }
    }
    // 8 chapters, 20+ subquests
    expect(totalChapters).toBe(8);
    expect(totalSubQuests).toBeGreaterThanOrEqual(16);
  });
});
