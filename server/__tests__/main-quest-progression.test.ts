import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainQuestProgressionManager } from '../services/main-quest-progression';
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

vi.mock('../db/storage', () => ({
  storage: {
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
  },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

const WORLD_ID = 'world_1';
const PLAYER_ID = 'player_1';

function getManager() {
  return new MainQuestProgressionManager();
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

      expect(state.currentChapterId).toBe('ch1_arrival');
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
      expect(state.currentChapterId).toBe('ch1_arrival');
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

  describe('recordQuestCompletion', () => {
    it('increments matching objective progress', async () => {
      const manager = getManager();
      // Ch1 has vocabulary (req 2) and conversation (req 3)
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

    it('does not increment beyond required count', async () => {
      const manager = getManager();
      // Complete vocabulary objective (requires 2)
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      // Third vocabulary should return null (objective already done)
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'vocabulary', 'A1',
      );
      expect(result).toBeNull();
    });

    it('advances chapter when all objectives complete', async () => {
      const manager = getManager();
      // Complete ch1: 2 vocabulary + 3 conversation
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'conversation', 'A1',
      );

      expect(result!.chapterAdvance).toBeDefined();
      expect(result!.chapterAdvance!.advanced).toBe(true);
      expect(result!.chapterAdvance!.completedChapterId).toBe('ch1_arrival');
      expect(result!.chapterAdvance!.bonusXP).toBe(300);
      expect(result!.chapterAdvance!.outroNarrative).toBeTruthy();
      // Ch2 also requires A1, so it should auto-activate
      expect(result!.chapterAdvance!.nextChapterId).toBe('ch2_settling_in');
      expect(result!.chapterAdvance!.introNarrative).toBeTruthy();
    });

    it('awards XP on chapter completion', async () => {
      const manager = getManager();
      // Complete ch1
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.totalXPEarned).toBe(300);
    });

    it('sets next chapter to available when CEFR not met', async () => {
      const manager = getManager();
      // Skip to ch2 and complete it so ch3 (requires A2) is next
      const state = createInitialMainQuestState();
      state.currentChapterId = 'ch2_settling_in';
      state.chapters[0].status = 'completed';
      state.chapters[1].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      // Complete ch2: 2 vocab + 2 conversation + 2 grammar
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'grammar', 'A1');
      const result = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'grammar', 'A1',
      );

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
      expect(chapter!.id).toBe('ch3_making_friends');

      const updated = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(updated.currentChapterId).toBe('ch3_making_friends');
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
      expect(summary.chapters[0].chapter.id).toBe('ch1_arrival');
      expect(summary.chapters[0].progress.status).toBe('active');
      expect(summary.chapters[0].completionPercent).toBe(0);
      expect(summary.chapters[0].cefrMet).toBe(true);
    });

    it('reflects partial completion correctly', async () => {
      const manager = getManager();
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');

      const summary = await manager.getJournalSummary(WORLD_ID, PLAYER_ID, 'A1');
      // ch1: 1 of 5 total = 20%
      expect(summary.chapters[0].completionPercent).toBe(20);
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
      expect(beats[0].chapterId).toBe('ch1_arrival');
      expect(beats[0].text).toBe(MAIN_QUEST_CHAPTERS[0].introNarrative);
    });

    it('returns outro beat for completed chapter', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      state.chapters[0].status = 'completed';
      state.currentChapterId = 'ch2_settling_in';
      state.chapters[1].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      const types = beats.map(b => b.type);
      expect(types).toContain('chapter_outro'); // ch1 outro
      expect(types).toContain('chapter_intro'); // ch2 intro
    });

    it('does not return already-delivered beats', async () => {
      const manager = getManager();
      const introId = narrativeBeatId('chapter_intro', 'ch1_arrival');

      // Mark the intro as delivered
      await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, introId);

      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats).toHaveLength(0);
    });

    it('returns empty when all beats delivered', async () => {
      const manager = getManager();
      const state = createInitialMainQuestState();
      state.narrativeBeatsDelivered = [{
        id: narrativeBeatId('chapter_intro', 'ch1_arrival'),
        type: 'chapter_intro',
        chapterId: 'ch1_arrival',
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
      const beatId = narrativeBeatId('chapter_intro', 'ch1_arrival');

      const result = await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beatId);
      expect(result).toBe(true);

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.narrativeBeatsDelivered).toHaveLength(1);
      expect(state.narrativeBeatsDelivered[0].id).toBe(beatId);
      expect(state.narrativeBeatsDelivered[0].type).toBe('chapter_intro');
      expect(state.narrativeBeatsDelivered[0].chapterId).toBe('ch1_arrival');
      expect(state.narrativeBeatsDelivered[0].deliveredAt).toBeTruthy();
    });

    it('returns false for duplicate delivery', async () => {
      const manager = getManager();
      const beatId = narrativeBeatId('chapter_intro', 'ch1_arrival');

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
      const beatId = narrativeBeatId('chapter_outro', 'ch1_arrival');
      const result = await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beatId);
      expect(result).toBe(true);

      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.narrativeBeatsDelivered[0].type).toBe('chapter_outro');
      expect(state.narrativeBeatsDelivered[0].text).toBe(MAIN_QUEST_CHAPTERS[0].outroNarrative);
    });
  });

  describe('full chapter progression flow', () => {
    it('completes ch1 and transitions to ch2 with narrative beats', async () => {
      const manager = getManager();

      // 1. Verify initial state has ch1 intro pending
      let beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats).toHaveLength(1);
      expect(beats[0].type).toBe('chapter_intro');
      expect(beats[0].chapterId).toBe('ch1_arrival');

      // 2. Deliver the intro beat
      await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beats[0].id);

      // 3. Complete all ch1 objectives
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      const completionResult = await manager.recordQuestCompletion(
        WORLD_ID, PLAYER_ID, 'conversation', 'A1',
      );

      // 4. Chapter should advance
      expect(completionResult!.chapterAdvance!.advanced).toBe(true);
      expect(completionResult!.chapterAdvance!.nextChapterId).toBe('ch2_settling_in');

      // 5. Now pending beats should include ch1 outro + ch2 intro
      beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      const beatTypes = beats.map(b => `${b.type}:${b.chapterId}`);
      expect(beatTypes).toContain('chapter_outro:ch1_arrival');
      expect(beatTypes).toContain('chapter_intro:ch2_settling_in');

      // 6. Deliver both and verify no more pending
      for (const beat of beats) {
        await manager.markNarrativeBeatDelivered(WORLD_ID, PLAYER_ID, beat.id);
      }
      beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats).toHaveLength(0);

      // 7. Verify final state
      const state = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(state.currentChapterId).toBe('ch2_settling_in');
      expect(state.totalXPEarned).toBe(300);
      expect(state.chapters[0].status).toBe('completed');
      expect(state.chapters[1].status).toBe('active');
      expect(state.narrativeBeatsDelivered).toHaveLength(3); // ch1 intro + ch1 outro + ch2 intro
    });

    it('blocks chapter progression when CEFR level insufficient', async () => {
      const manager = getManager();

      // Complete ch1 and ch2 at A1, then ch3 requires A2
      const state = createInitialMainQuestState();
      state.currentChapterId = 'ch2_settling_in';
      state.chapters[0].status = 'completed';
      state.chapters[1].status = 'active';
      await manager.saveMainQuestState(WORLD_ID, PLAYER_ID, state);

      // Complete ch2
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'vocabulary', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'conversation', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'grammar', 'A1');
      await manager.recordQuestCompletion(WORLD_ID, PLAYER_ID, 'grammar', 'A1');

      // Ch3 should be available but not active
      const finalState = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(finalState.currentChapterId).toBeNull();
      expect(finalState.chapters[2].status).toBe('available');

      // Now level up to A2 and try unlock
      const unlocked = await manager.tryUnlockNextChapter(WORLD_ID, PLAYER_ID, 'A2');
      expect(unlocked).not.toBeNull();
      expect(unlocked!.id).toBe('ch3_making_friends');

      const afterUnlock = await manager.getMainQuestState(WORLD_ID, PLAYER_ID);
      expect(afterUnlock.currentChapterId).toBe('ch3_making_friends');
      expect(afterUnlock.chapters[2].status).toBe('active');

      // Ch3 intro should now be pending
      const beats = await manager.getPendingNarrativeBeats(WORLD_ID, PLAYER_ID);
      expect(beats.some(b => b.type === 'chapter_intro' && b.chapterId === 'ch3_making_friends')).toBe(true);
    });
  });
});
