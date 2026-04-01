import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainQuestProgressionManager, QUEST_TYPE_TO_OBJECTIVE_MAP, getObjectiveTypesForQuestType } from '../../shared/quests/main-quest-progression.js';
import {
  MAIN_QUEST_CHAPTERS,
  createInitialMainQuestState,
  narrativeBeatId,
  type MainQuestState,
} from '../../shared/quest/main-quest-chapters';

// ── Mock storage ────────────────────────────────────────────────────────────

interface StoredTruth {
  id: string;
  worldId: string;
  characterId: string;
  title: string;
  content: string;
  entryType: string;
  category: string;
}

let mockTruths: StoredTruth[] = [];
let truthIdCounter = 0;

function createMockStorage() {
  return {
    getTruthsByWorld: vi.fn(async (worldId: string) =>
      mockTruths.filter(t => t.worldId === worldId),
    ),
    createTruth: vi.fn(async (data: Omit<StoredTruth, 'id'>) => {
      const truth: StoredTruth = { ...data, id: `truth_${++truthIdCounter}` };
      mockTruths.push(truth);
      return truth;
    }),
    updateTruth: vi.fn(async (id: string, data: Partial<StoredTruth>) => {
      const idx = mockTruths.findIndex(t => t.id === id);
      if (idx === -1) return undefined;
      mockTruths[idx] = { ...mockTruths[idx], ...data };
      return mockTruths[idx];
    }),
    // Stubs for methods called during chapter advance (quest record sync)
    getQuestsByWorld: vi.fn(async () => []),
    getWorld: vi.fn(async () => ({ targetLanguage: 'French' })),
    getSettlementsByWorld: vi.fn(async () => [{ name: 'Bayou Lafourche' }]),
    createQuest: vi.fn(async (data: any) => ({ ...data, id: `quest_${++truthIdCounter}` })),
    updateQuest: vi.fn(async () => ({})),
  } as any;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const WORLD_ID = 'world_1';
const PLAYER_ID = 'player_1';

function getManager() {
  return new MainQuestProgressionManager(createMockStorage());
}

/**
 * Complete all ch1 objectives using DB quest types (not chapter objective types):
 * - ch1_greetings: use_vocabulary (2) ← vocabulary quests
 * - ch1_ask_around: complete_conversation (3) ← conversation quests
 * - ch1_collect_texts: find_text (2) ← reading quests
 */
async function completeCh1(manager: MainQuestProgressionManager) {
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');
  return manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');
}

/**
 * Complete all ch2 objectives using DB quest types:
 * - ch2_explore_town: visit_location (2) ← exploration quests
 * - ch2_interview_locals: complete_conversation (3) ← conversation quests
 * - ch2_find_first_book: find_text (1) ← reading quests (first unfilled find_text)
 * - ch2_read_signs: read_sign (2) ← reading quests (maps to read_sign after find_text filled)
 * - ch2_grammar_basics: use_vocabulary (2) ← grammar quests (maps to use_vocabulary)
 * - ch2_collect_texts: find_text (2) ← reading quests
 */
async function completeCh2(manager: MainQuestProgressionManager) {
  // exploration → visit_location: ch2_explore_town(2)
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'exploration', 'A1');
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'exploration', 'A1');
  // conversation → complete_conversation: ch2_interview_locals(3)
  for (let i = 0; i < 3; i++) {
    await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
  }
  // reading → find_text(1) + read_sign(2) + find_text(2) = 5 reading quests
  for (let i = 0; i < 5; i++) {
    await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');
  }
  // grammar → use_vocabulary: ch2_grammar_basics(2)
  await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'grammar', 'A1');
  return manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'grammar', 'A1');
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('MainQuestProgressionManager', () => {
  beforeEach(() => {
    mockTruths = [];
    truthIdCounter = 0;
    vi.clearAllMocks();
  });

  describe('getMainQuestState', () => {
    it('returns initial state when no state exists', async () => {
      const manager = getManager();
      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);

      expect(state.currentChapterId).toBe('ch1_assignment_abroad');
      expect(state.totalXPEarned).toBe(0);
      expect(state.chapters).toHaveLength(6);
      expect(state.chapters[0].status).toBe('active');
      expect(state.narrativeBeatsDelivered).toEqual([]);
    });

    it('returns saved state when it exists', async () => {
      const manager = getManager();
      const customState: MainQuestState = {
        ...createInitialMainQuestState(),
        totalXPEarned: 500,
      };
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, customState);

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.totalXPEarned).toBe(500);
    });

    it('reinitializes on corrupted state', async () => {
      mockTruths.push({
        id: 'truth_bad',
        worldId: WORLD_ID,
        characterId: PLAYER_ID,
        title: 'Main Quest Progress',
        content: 'not valid json{{{',
        entryType: 'fact',
        category: 'main_quest_state',
      });

      const manager = getManager();
      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBe('ch1_assignment_abroad');
    });
  });

  describe('saveMainQuestState', () => {
    it('creates a truth on first save', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      expect(mockTruths).toHaveLength(1);
      expect(mockTruths[0].category).toBe('main_quest_state');
      expect(mockTruths[0].characterId).toBe(PLAYER_ID);
    });

    it('updates existing truth on subsequent saves', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      state.totalXPEarned = 999;
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      expect(mockTruths).toHaveLength(1);
      const parsed = JSON.parse(mockTruths[0].content);
      expect(parsed.totalXPEarned).toBe(999);
    });
  });

  describe('quest type to objective type mapping', () => {
    it('maps vocabulary quest type to use_vocabulary objective', () => {
      expect(getObjectiveTypesForQuestType('vocabulary')).toContain('use_vocabulary');
    });

    it('maps conversation quest type to complete_conversation objective', () => {
      expect(getObjectiveTypesForQuestType('conversation')).toContain('complete_conversation');
    });

    it('maps reading quest type to find_text, read_text, and read_sign objectives', () => {
      const types = getObjectiveTypesForQuestType('reading');
      expect(types).toContain('find_text');
      expect(types).toContain('read_text');
      expect(types).toContain('read_sign');
    });

    it('maps exploration quest type to visit_location objective', () => {
      expect(getObjectiveTypesForQuestType('exploration')).toContain('visit_location');
    });

    it('maps grammar quest type to use_vocabulary and write_response objectives', () => {
      const types = getObjectiveTypesForQuestType('grammar');
      expect(types).toContain('use_vocabulary');
      expect(types).toContain('write_response');
    });

    it('maps translation_challenge directly', () => {
      expect(getObjectiveTypesForQuestType('translation_challenge')).toContain('translation_challenge');
    });

    it('passes through unknown types as-is', () => {
      expect(getObjectiveTypesForQuestType('unknown_type')).toEqual(['unknown_type']);
    });

    it('every chapter objective type is reachable from at least one quest type', () => {
      const allObjectiveTypes = new Set<string>();
      for (const ch of MAIN_QUEST_CHAPTERS) {
        for (const obj of ch.objectives) {
          allObjectiveTypes.add(obj.questType);
        }
      }

      const reachableTypes = new Set<string>();
      for (const mappedTypes of Object.values(QUEST_TYPE_TO_OBJECTIVE_MAP)) {
        for (const t of mappedTypes) {
          reachableTypes.add(t);
        }
      }

      for (const objType of allObjectiveTypes) {
        expect(reachableTypes).toContain(objType);
      }
    });
  });

  describe('recordQuestCompletion', () => {
    it('increments matching objective progress via quest type mapping', async () => {
      const manager = getManager();
      // 'vocabulary' quest type maps to 'use_vocabulary' → matches ch1_greetings
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'vocabulary', 'A1',
      );

      expect(result).not.toBeNull();
      expect(result!.updated).toBe(true);
      expect(result!.objectiveId).toBe('ch1_greetings');
      expect(result!.current).toBe(1);
      expect(result!.required).toBe(2);
      expect(result!.objectiveCompleted).toBe(false);
    });

    it('marks objective as completed when count reaches required', async () => {
      const manager = getManager();
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'vocabulary', 'A1',
      );

      expect(result!.objectiveCompleted).toBe(true);
      expect(result!.current).toBe(2);
    });

    it('returns null for non-matching quest type', async () => {
      const manager = getManager();
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'combat', 'A1',
      );
      expect(result).toBeNull();
    });

    it('returns null when no active chapter', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      state.currentChapterId = null;
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'vocabulary', 'A1',
      );
      expect(result).toBeNull();
    });

    it('reading quests fill find_text objectives before read_sign', async () => {
      const manager = getManager();
      // Complete ch1 to get to ch2 which has both find_text and read_sign
      await completeCh1(manager);

      // In ch2, objectives in order: visit_location, complete_conversation, find_text(1), read_sign(2), use_vocabulary, find_text(2)
      // First reading → ch2_find_first_book (find_text, needs 1)
      const r1 = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');
      expect(r1!.objectiveId).toBe('ch2_find_first_book');
      expect(r1!.objectiveCompleted).toBe(true);

      // Next reading → ch2_read_signs (read_sign, needs 2)
      const r2 = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');
      expect(r2!.objectiveId).toBe('ch2_read_signs');
      expect(r2!.current).toBe(1);
    });

    it('advances chapter when all objectives complete', async () => {
      const manager = getManager();
      const result = await completeCh1(manager);

      expect(result!.chapterAdvance).toBeDefined();
      expect(result!.chapterAdvance!.advanced).toBe(true);
      expect(result!.chapterAdvance!.completedChapterId).toBe('ch1_assignment_abroad');
      expect(result!.chapterAdvance!.bonusXP).toBe(300);
      expect(result!.chapterAdvance!.outroNarrative).toBeTruthy();
      // Ch2 also requires A1, so it should auto-activate
      expect(result!.chapterAdvance!.nextChapterId).toBe('ch2_following_the_trail');
      expect(result!.chapterAdvance!.introNarrative).toBeTruthy();
    });

    it('awards XP on chapter completion', async () => {
      const manager = getManager();
      await completeCh1(manager);

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.totalXPEarned).toBe(300);
    });

    it('sets next chapter to available when CEFR not met', async () => {
      const manager = getManager();
      // Set up ch2 as active (ch1 already completed)
      const state = createInitialMainQuestState();
      state.currentChapterId = 'ch2_following_the_trail';
      state.chapters[0].status = 'completed';
      state.chapters[1].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const result = await completeCh2(manager);

      expect(result!.chapterAdvance!.advanced).toBe(true);
      // Ch3 requires A2 but player is A1 — should be available, not active
      expect(result!.chapterAdvance!.nextChapterId).toBeUndefined();

      const updatedState = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(updatedState.currentChapterId).toBeNull();
      expect(updatedState.chapters[2].status).toBe('available');
    });
  });

  describe('tryUnlockNextChapter', () => {
    it('unlocks available chapter when CEFR level meets requirement', async () => {
      const manager = getManager();
      // Set up ch3 as available (A2 required)
      const state = createInitialMainQuestState();
      state.currentChapterId = null;
      state.chapters[0].status = 'completed';
      state.chapters[1].status = 'completed';
      state.chapters[2].status = 'available';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const chapter = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A2');
      expect(chapter).not.toBeNull();
      expect(chapter!.id).toBe('ch3_the_inner_circle');

      const updated = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(updated.currentChapterId).toBe('ch3_the_inner_circle');
      expect(updated.chapters[2].status).toBe('active');
    });

    it('returns null when no available chapters', async () => {
      const manager = getManager();
      const chapter = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'B2');
      expect(chapter).toBeNull();
    });

    it('returns null when CEFR still insufficient', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      state.currentChapterId = null;
      state.chapters[0].status = 'completed';
      state.chapters[1].status = 'completed';
      state.chapters[2].status = 'available'; // requires A2
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const chapter = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A1');
      expect(chapter).toBeNull();
    });
  });

  describe('getJournalSummary', () => {
    it('returns all chapters with progress', async () => {
      const manager = getManager();
      const summary = await manager.getJournalSummary(WORLD_ID, PLAYER_ID, 'A1');

      expect(summary.chapters).toHaveLength(6);
      expect(summary.chapters[0].chapter.id).toBe('ch1_assignment_abroad');
      expect(summary.chapters[0].progress.status).toBe('active');
      expect(summary.chapters[0].completionPercent).toBe(0);
      expect(summary.chapters[0].cefrMet).toBe(true);
    });

    it('reflects partial completion correctly', async () => {
      const manager = getManager();
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');

      const summary = await manager.getJournalSummary(WORLD_ID, PLAYER_ID, 'A1');
      // ch1: 1 of 7 total (2 vocab + 3 convo + 2 reading) = 14%
      expect(summary.chapters[0].completionPercent).toBe(14);
    });

    it('shows CEFR met status for each chapter', async () => {
      const manager = getManager();
      const summary = await manager.getJournalSummary(WORLD_ID, PLAYER_ID, 'A1');

      // A1 meets ch1 (A1) and ch2 (A1)
      expect(summary.chapters[0].cefrMet).toBe(true);
      expect(summary.chapters[1].cefrMet).toBe(true);
      // A1 doesn't meet ch3 (A2)
      expect(summary.chapters[2].cefrMet).toBe(false);
    });
  });

  describe('getPendingNarrativeBeats', () => {
    it('returns intro beat for active chapter', async () => {
      const manager = getManager();
      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);

      expect(beats).toHaveLength(1);
      expect(beats[0].type).toBe('chapter_intro');
      expect(beats[0].chapterId).toBe('ch1_assignment_abroad');
      expect(beats[0].text).toBe(MAIN_QUEST_CHAPTERS[0].introNarrative);
    });

    it('returns outro beat for completed chapter', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      state.chapters[0].status = 'completed';
      state.currentChapterId = 'ch2_following_the_trail';
      state.chapters[1].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      const types = beats.map(b => b.type);
      expect(types).toContain('chapter_outro'); // ch1 outro
      expect(types).toContain('chapter_intro'); // ch2 intro
    });

    it('does not return already-delivered beats', async () => {
      const manager = getManager();
      const introId = narrativeBeatId('chapter_intro', 'ch1_assignment_abroad');

      // Mark the intro as delivered
      await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, introId);

      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats).toHaveLength(0);
    });

    it('returns empty when all beats delivered', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      state.narrativeBeatsDelivered = [{
        id: narrativeBeatId('chapter_intro', 'ch1_assignment_abroad'),
        type: 'chapter_intro',
        chapterId: 'ch1_assignment_abroad',
        text: MAIN_QUEST_CHAPTERS[0].introNarrative,
        deliveredAt: new Date().toISOString(),
      }];
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats).toHaveLength(0);
    });
  });

  describe('markNarrativeBeatDelivered', () => {
    it('records a narrative beat delivery', async () => {
      const manager = getManager();
      const beatId = narrativeBeatId('chapter_intro', 'ch1_assignment_abroad');

      const result = await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beatId);
      expect(result).toBe(true);

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.narrativeBeatsDelivered).toHaveLength(1);
      expect(state.narrativeBeatsDelivered[0].id).toBe(beatId);
      expect(state.narrativeBeatsDelivered[0].type).toBe('chapter_intro');
      expect(state.narrativeBeatsDelivered[0].chapterId).toBe('ch1_assignment_abroad');
      expect(state.narrativeBeatsDelivered[0].deliveredAt).toBeTruthy();
    });

    it('returns false for duplicate delivery', async () => {
      const manager = getManager();
      const beatId = narrativeBeatId('chapter_intro', 'ch1_assignment_abroad');

      await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beatId);
      const result = await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beatId);
      expect(result).toBe(false);
    });

    it('returns false for invalid chapter', async () => {
      const manager = getManager();
      const beatId = narrativeBeatId('chapter_intro', 'nonexistent_chapter');
      const result = await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beatId);
      expect(result).toBe(false);
    });

    it('handles outro beats correctly', async () => {
      const manager = getManager();
      const beatId = narrativeBeatId('chapter_outro', 'ch1_assignment_abroad');
      const result = await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beatId);
      expect(result).toBe(true);

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.narrativeBeatsDelivered[0].type).toBe('chapter_outro');
      expect(state.narrativeBeatsDelivered[0].text).toBe(MAIN_QUEST_CHAPTERS[0].outroNarrative);
    });
  });

  describe('text/reading objectives', () => {
    it('reading quest maps to find_text objectives', async () => {
      const manager = getManager();
      // 'reading' maps to ['find_text', 'read_text', 'read_sign']
      // Ch1 has ch1_collect_texts with questType find_text
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'reading', 'A1',
      );

      expect(result).not.toBeNull();
      expect(result!.updated).toBe(true);
      expect(result!.objectiveId).toBe('ch1_collect_texts');
      expect(result!.current).toBe(1);
      expect(result!.required).toBe(2);
    });

    it('completes reading objective when count reaches required', async () => {
      const manager = getManager();
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'reading', 'A1',
      );

      expect(result!.objectiveCompleted).toBe(true);
      expect(result!.current).toBe(2);
    });

    it('does not advance chapter with only text objectives done', async () => {
      const manager = getManager();
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'reading', 'A1');

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBe('ch1_assignment_abroad');
      expect(state.chapters[0].status).toBe('active');
    });

    it('chapter does not complete without reading objectives', async () => {
      const manager = getManager();
      // Complete vocabulary and conversation but NOT reading
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBe('ch1_assignment_abroad');
      expect(state.chapters[0].status).toBe('active');
    });

    it('every chapter has a find_text objective', () => {
      for (const chapter of MAIN_QUEST_CHAPTERS) {
        const hasFindText = chapter.objectives.some(obj => obj.questType === 'find_text');
        expect(hasFindText).toBe(true);
      }
    });

    it('total find_text required count increases with chapter difficulty', () => {
      const textCounts = MAIN_QUEST_CHAPTERS.map(ch =>
        ch.objectives
          .filter(obj => obj.questType === 'find_text')
          .reduce((sum, obj) => sum + obj.requiredCount, 0),
      );
      // Each subsequent chapter should require >= the previous (total across all find_text objectives)
      for (let i = 1; i < textCounts.length; i++) {
        expect(textCounts[i]).toBeGreaterThanOrEqual(textCounts[i - 1]);
      }
    });
  });

  describe('full chapter progression flow', () => {
    it('completes ch1 and transitions to ch2 with narrative beats', async () => {
      const manager = getManager();

      // 1. Verify initial state has ch1 intro pending
      let beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats).toHaveLength(1);
      expect(beats[0].type).toBe('chapter_intro');
      expect(beats[0].chapterId).toBe('ch1_assignment_abroad');

      // 2. Deliver the intro beat
      await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beats[0].id);

      // 3. Complete all ch1 objectives (including reading)
      const completionResult = await completeCh1(manager);

      // 4. Chapter should advance
      expect(completionResult!.chapterAdvance!.advanced).toBe(true);
      expect(completionResult!.chapterAdvance!.nextChapterId).toBe('ch2_following_the_trail');

      // 5. Now pending beats should include ch1 outro + ch2 intro
      beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      const beatTypes = beats.map(b => `${b.type}:${b.chapterId}`);
      expect(beatTypes).toContain('chapter_outro:ch1_assignment_abroad');
      expect(beatTypes).toContain('chapter_intro:ch2_following_the_trail');

      // 6. Deliver both and verify no more pending
      for (const beat of beats) {
        await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beat.id);
      }
      beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats).toHaveLength(0);

      // 7. Verify final state
      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBe('ch2_following_the_trail');
      expect(state.totalXPEarned).toBe(300);
      expect(state.chapters[0].status).toBe('completed');
      expect(state.chapters[1].status).toBe('active');
      expect(state.narrativeBeatsDelivered).toHaveLength(3); // ch1 intro + ch1 outro + ch2 intro
    });

    it('blocks chapter progression when CEFR level insufficient', async () => {
      const manager = getManager();

      // Complete ch1 and ch2 at A1, then ch3 requires A2
      const state = createInitialMainQuestState();
      state.currentChapterId = 'ch2_following_the_trail';
      state.chapters[0].status = 'completed';
      state.chapters[1].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      // Complete ch2 (including reading)
      await completeCh2(manager);

      // Ch3 should be available but not active
      const finalState = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(finalState.currentChapterId).toBeNull();
      expect(finalState.chapters[2].status).toBe('available');

      // Now level up to A2 and try unlock
      const unlocked = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A2');
      expect(unlocked).not.toBeNull();
      expect(unlocked!.id).toBe('ch3_the_inner_circle');

      const afterUnlock = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(afterUnlock.currentChapterId).toBe('ch3_the_inner_circle');
      expect(afterUnlock.chapters[2].status).toBe('active');

      // Ch3 intro should now be pending
      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats.some(b => b.type === 'chapter_intro' && b.chapterId === 'ch3_the_inner_circle')).toBe(true);
    });
  });

  describe('E2E: full main quest completion — The Missing Writer', () => {
    /**
     * Complete a chapter by sending the correct sequence of quest types.
     * Returns the result from the final completion call.
     */
    async function completeChapter(
      manager: MainQuestProgressionManager,
      chapterId: string,
      cefrLevel: string,
    ) {
      const chapter = MAIN_QUEST_CHAPTERS.find(ch => ch.id === chapterId);
      if (!chapter) throw new Error(`Unknown chapter: ${chapterId}`);

      // For each objective, send the appropriate quest type the required number of times
      let lastResult: any = null;
      for (const obj of chapter.objectives) {
        // Determine which DB quest type to send for this objective type
        const questType = objectiveTypeToQuestType(obj.questType);
        for (let i = 0; i < obj.requiredCount; i++) {
          lastResult = await manager.recordQuestCompletion(
            WORLD_ID, PLAYER_ID, questType, cefrLevel,
          );
        }
      }
      return lastResult;
    }

    /** Map chapter objective types to DB quest types that can satisfy them */
    function objectiveTypeToQuestType(objectiveType: string): string {
      const reverseMap: Record<string, string> = {
        use_vocabulary: 'vocabulary',
        complete_conversation: 'conversation',
        find_text: 'reading',
        visit_location: 'exploration',
        read_text: 'reading',
        read_sign: 'reading',
        collect_item: 'collection',
        translation_challenge: 'translation_challenge',
        write_response: 'grammar',
      };
      return reverseMap[objectiveType] || objectiveType;
    }

    it('can complete all 6 chapters from start to finish', async () => {
      const manager = getManager();

      // Chapter 1: Assignment Abroad (A1)
      const ch1Result = await completeChapter(manager, 'ch1_assignment_abroad', 'A1');
      expect(ch1Result!.chapterAdvance!.advanced).toBe(true);
      expect(ch1Result!.chapterAdvance!.completedChapterId).toBe('ch1_assignment_abroad');
      expect(ch1Result!.chapterAdvance!.nextChapterId).toBe('ch2_following_the_trail');

      let state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBe('ch2_following_the_trail');
      expect(state.totalXPEarned).toBe(300);

      // Chapter 2: Following the Trail (A1)
      const ch2Result = await completeChapter(manager, 'ch2_following_the_trail', 'A1');
      expect(ch2Result!.chapterAdvance!.advanced).toBe(true);
      expect(ch2Result!.chapterAdvance!.completedChapterId).toBe('ch2_following_the_trail');
      // Ch3 requires A2, so it should NOT auto-activate at A1
      state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBeNull();
      expect(state.chapters[2].status).toBe('available');
      expect(state.totalXPEarned).toBe(800); // 300 + 500

      // Unlock Chapter 3 with A2
      const ch3 = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A2');
      expect(ch3!.id).toBe('ch3_the_inner_circle');

      // Chapter 3: The Inner Circle (A2)
      const ch3Result = await completeChapter(manager, 'ch3_the_inner_circle', 'A2');
      expect(ch3Result!.chapterAdvance!.advanced).toBe(true);
      expect(ch3Result!.chapterAdvance!.completedChapterId).toBe('ch3_the_inner_circle');
      // Ch4 also requires A2, should auto-activate
      expect(ch3Result!.chapterAdvance!.nextChapterId).toBe('ch4_hidden_messages');
      state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.totalXPEarned).toBe(1550); // 800 + 750

      // Chapter 4: Hidden Messages (A2)
      const ch4Result = await completeChapter(manager, 'ch4_hidden_messages', 'A2');
      expect(ch4Result!.chapterAdvance!.advanced).toBe(true);
      expect(ch4Result!.chapterAdvance!.completedChapterId).toBe('ch4_hidden_messages');
      // Ch5 requires B1, should NOT activate at A2
      state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBeNull();
      expect(state.chapters[4].status).toBe('available');
      expect(state.totalXPEarned).toBe(2550); // 1550 + 1000

      // Unlock Chapter 5 with B1
      const ch5 = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'B1');
      expect(ch5!.id).toBe('ch5_the_truth_emerges');

      // Chapter 5: The Truth Emerges (B1)
      const ch5Result = await completeChapter(manager, 'ch5_the_truth_emerges', 'B1');
      expect(ch5Result!.chapterAdvance!.advanced).toBe(true);
      // Ch6 requires B2, should NOT activate at B1
      state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBeNull();
      expect(state.chapters[5].status).toBe('available');
      expect(state.totalXPEarned).toBe(4050); // 2550 + 1500

      // Unlock Chapter 6 with B2
      const ch6 = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'B2');
      expect(ch6!.id).toBe('ch6_the_final_chapter');

      // Chapter 6: The Final Chapter (B2)
      const ch6Result = await completeChapter(manager, 'ch6_the_final_chapter', 'B2');
      expect(ch6Result!.chapterAdvance!.advanced).toBe(true);
      expect(ch6Result!.chapterAdvance!.completedChapterId).toBe('ch6_the_final_chapter');

      // All chapters complete — currentChapterId should be null
      state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBeNull();
      expect(state.totalXPEarned).toBe(6050); // 4050 + 2000
      // All chapters marked completed
      for (const cp of state.chapters) {
        expect(cp.status).toBe('completed');
      }
    });

    it('generates case notes for every objective completion', async () => {
      const manager = getManager();
      await completeCh1(manager);

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      // Ch1 has 7 total completions (2+3+2) + 1 chapter complete note = 8
      expect(state.caseNotes).toBeDefined();
      expect(state.caseNotes!.length).toBeGreaterThanOrEqual(7);
      // Should have a chapter_event note
      expect(state.caseNotes!.some(n => n.category === 'chapter_event')).toBe(true);
    });

    it('CEFR gating at every boundary', async () => {
      const manager = getManager();

      // Complete ch1+ch2 at A1
      await completeCh1(manager);
      await completeChapter(manager, 'ch2_following_the_trail', 'A1');

      // A1 cannot unlock ch3 (requires A2)
      let ch = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A1');
      expect(ch).toBeNull();

      // A2 unlocks ch3
      ch = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A2');
      expect(ch!.id).toBe('ch3_the_inner_circle');

      // Complete ch3+ch4 at A2
      await completeChapter(manager, 'ch3_the_inner_circle', 'A2');
      await completeChapter(manager, 'ch4_hidden_messages', 'A2');

      // A2 cannot unlock ch5 (requires B1)
      ch = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A2');
      expect(ch).toBeNull();

      // B1 unlocks ch5
      ch = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'B1');
      expect(ch!.id).toBe('ch5_the_truth_emerges');

      // Complete ch5 at B1
      await completeChapter(manager, 'ch5_the_truth_emerges', 'B1');

      // B1 cannot unlock ch6 (requires B2)
      ch = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'B1');
      expect(ch).toBeNull();

      // B2 unlocks ch6
      ch = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'B2');
      expect(ch!.id).toBe('ch6_the_final_chapter');
    });

    it('social quest types also count as conversation completions', async () => {
      const manager = getManager();
      // 'social' and 'business-roleplay' should also map to complete_conversation
      const r1 = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'social', 'A1');
      expect(r1!.objectiveId).toBe('ch1_ask_around');

      const r2 = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'business-roleplay', 'A1');
      expect(r2!.objectiveId).toBe('ch1_ask_around');
    });

    it('visual_vocabulary quest type counts as vocabulary completion', async () => {
      const manager = getManager();
      const r = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'visual_vocabulary', 'A1');
      expect(r!.objectiveId).toBe('ch1_greetings');
    });

    it('navigation quest type counts as visit_location completion', async () => {
      const manager = getManager();
      await completeCh1(manager);
      // Now in ch2 — first visit_location objective is ch2_explore_town
      const r = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'navigation', 'A1');
      expect(r!.objectiveId).toBe('ch2_explore_town');
    });

    it('translation quest type counts as translation_challenge completion', async () => {
      const manager = getManager();
      // Set up ch4 as active (has translation_challenge objective)
      const state = createInitialMainQuestState();
      state.currentChapterId = 'ch4_hidden_messages';
      for (let i = 0; i < 3; i++) state.chapters[i].status = 'completed';
      state.chapters[3].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const r = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'translation', 'A2');
      expect(r!.objectiveId).toBe('ch4_translation_work');
    });

    it('collection quest type satisfies collect_item objectives', async () => {
      const manager = getManager();
      // Set up ch3 as active (has collect_item objective: ch3_collect_documents)
      const state = createInitialMainQuestState();
      state.currentChapterId = 'ch3_the_inner_circle';
      for (let i = 0; i < 2; i++) state.chapters[i].status = 'completed';
      state.chapters[2].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      // The first 3 conversation completions fill ch3_befriend_editor first
      // Then collection goes to ch3_collect_documents
      const r = await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'collection', 'A2');
      expect(r!.objectiveId).toBe('ch3_collect_documents');
    });
  });
});
