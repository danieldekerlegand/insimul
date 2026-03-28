/**
 * Tests for quest management methods on the DataSource interface.
 * Covers FileDataSource (local state) and ApiDataSource (fetch mocking).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileDataSource, ApiDataSource, LocalGameState } from '../DataSource';

// In-memory storage mock
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

// ── FileDataSource tests ──────────────────────────────────────────────────

describe('FileDataSource quest management', () => {
  let storage: MemoryStorage;
  let ds: FileDataSource;

  beforeEach(() => {
    storage = new MemoryStorage();
    ds = new FileDataSource(storage);
    // Inject world data directly to avoid file I/O
    (ds as any).worldData = {
      quests: [
        {
          id: 'q1', title: 'Main Quest 1', status: 'active', questType: 'main_quest',
          questChainOrder: 0,
          objectives: [
            { id: 'obj1', title: 'Talk to elder', targetNpcId: 'npc-elder', completed: false },
          ],
        },
        {
          id: 'q2', title: 'Main Quest 2', status: 'locked', questType: 'main_quest',
          questChainOrder: 1, cefrRequirement: 'A2',
          objectives: [],
        },
        {
          id: 'q3', title: 'Side Quest', status: 'active', questType: 'side_quest',
          objectives: [
            { id: 'obj3', title: 'Deliver package', npcId: 'npc-merchant', completed: false },
          ],
        },
      ],
      characters: [],
      npcs: [],
    };
  });

  describe('completeQuest', () => {
    it('marks a quest as completed in local state', async () => {
      const result = await ds.completeQuest('world1', 'q1');
      expect(result).toEqual({ success: true, questId: 'q1' });

      const updates = ds.localState.getQuestUpdates();
      expect(updates['q1'].status).toBe('completed');
      expect(updates['q1'].completedAt).toBeDefined();
    });
  });

  describe('getNpcQuestGuidance', () => {
    it('returns guidance when NPC has active quest objectives (targetNpcId)', async () => {
      const result = await ds.getNpcQuestGuidance('world1', 'npc-elder');
      expect(result?.hasGuidance).toBe(true);
      expect(result?.systemPromptAddition).toContain('Main Quest 1');
      expect(result?.systemPromptAddition).toContain('Talk to elder');
    });

    it('returns guidance when NPC has active quest objectives (npcId)', async () => {
      const result = await ds.getNpcQuestGuidance('world1', 'npc-merchant');
      expect(result?.hasGuidance).toBe(true);
      expect(result?.systemPromptAddition).toContain('Side Quest');
    });

    it('returns no guidance for NPCs without quest objectives', async () => {
      const result = await ds.getNpcQuestGuidance('world1', 'npc-random');
      expect(result?.hasGuidance).toBe(false);
      expect(result?.systemPromptAddition).toBeUndefined();
    });

    it('ignores completed quests', async () => {
      ds.localState.updateQuest('q3', { status: 'completed' });
      const result = await ds.getNpcQuestGuidance('world1', 'npc-merchant');
      expect(result?.hasGuidance).toBe(false);
    });
  });

  describe('getMainQuestJournal', () => {
    it('returns chapters from main quests', async () => {
      const journal = await ds.getMainQuestJournal('world1', 'player1');
      expect(journal.chapters).toHaveLength(2);
      expect(journal.chapters[0].title).toBe('Main Quest 1');
      expect(journal.chapters[0].status).toBe('active');
      expect(journal.chapters[1].status).toBe('locked');
      expect(journal.state.currentChapterId).toBe('q1');
    });

    it('reflects local quest status updates', async () => {
      ds.localState.updateQuest('q1', { status: 'completed' });
      const journal = await ds.getMainQuestJournal('world1', 'player1');
      expect(journal.chapters[0].status).toBe('completed');
    });

    it('passes cefrLevel through', async () => {
      const journal = await ds.getMainQuestJournal('world1', 'player1', 'B1');
      expect(journal.playerCefrLevel).toBe('B1');
    });
  });

  describe('tryUnlockMainQuest', () => {
    it('unlocks a locked quest when CEFR level is sufficient', async () => {
      ds.localState.updateQuest('q1', { status: 'completed' });
      await ds.tryUnlockMainQuest('world1', 'player1', 'A2');
      const updates = ds.localState.getQuestUpdates();
      expect(updates['q2']?.status).toBe('active');
    });

    it('does not unlock when CEFR level is insufficient', async () => {
      await ds.tryUnlockMainQuest('world1', 'player1', 'A1');
      const updates = ds.localState.getQuestUpdates();
      expect(updates['q2']?.status).toBeUndefined();
    });
  });

  describe('recordMainQuestCompletion', () => {
    it('returns a recorded result', async () => {
      const result = await ds.recordMainQuestCompletion('world1', 'player1', 'conversation');
      expect(result.result.questType).toBe('conversation');
      expect(result.result.recorded).toBe(true);
    });
  });
});

// ── ApiDataSource tests ───────────────────────────────────────────────────

describe('ApiDataSource quest management', () => {
  let ds: ApiDataSource;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    (globalThis as any).fetch = fetchSpy;
    ds = new ApiDataSource('test-token', 'http://localhost:3000');
  });

  function mockFetchResponse(data: any, ok = true) {
    fetchSpy.mockResolvedValueOnce({
      ok,
      json: async () => data,
    });
  }

  describe('completeQuest', () => {
    it('POSTs to the correct endpoint', async () => {
      mockFetchResponse({ success: true, bonusXP: 50 });
      const result = await ds.completeQuest('w1', 'q1');
      expect(result).toEqual({ success: true, bonusXP: 50 });
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/quests/q1/complete',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('returns null on failure', async () => {
      mockFetchResponse(null, false);
      const result = await ds.completeQuest('w1', 'q1');
      expect(result).toBeNull();
    });
  });

  describe('getNpcQuestGuidance', () => {
    it('GETs the guidance endpoint', async () => {
      mockFetchResponse({ hasGuidance: true, systemPromptAddition: 'Help the player!' });
      const result = await ds.getNpcQuestGuidance('w1', 'npc1');
      expect(result).toEqual({ hasGuidance: true, systemPromptAddition: 'Help the player!' });
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/quests/npc-guidance/npc1',
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('returns null on fetch error', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));
      const result = await ds.getNpcQuestGuidance('w1', 'npc1');
      expect(result).toBeNull();
    });
  });

  describe('getMainQuestJournal', () => {
    it('GETs journal with optional cefrLevel', async () => {
      mockFetchResponse({ state: { currentChapterId: 'ch1' }, chapters: [] });
      await ds.getMainQuestJournal('w1', 'p1', 'B1');
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/main-quest/p1?cefrLevel=B1',
        expect.any(Object),
      );
    });

    it('GETs journal without cefrLevel', async () => {
      mockFetchResponse({ state: {}, chapters: [] });
      await ds.getMainQuestJournal('w1', 'p1');
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/main-quest/p1',
        expect.any(Object),
      );
    });

    it('returns null on failure', async () => {
      mockFetchResponse(null, false);
      const result = await ds.getMainQuestJournal('w1', 'p1');
      expect(result).toBeNull();
    });
  });

  describe('tryUnlockMainQuest', () => {
    it('POSTs cefrLevel to unlock endpoint', async () => {
      mockFetchResponse({});
      await ds.tryUnlockMainQuest('w1', 'p1', 'A2');
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/main-quest/p1/try-unlock',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ cefrLevel: 'A2' }),
        }),
      );
    });
  });

  describe('recordMainQuestCompletion', () => {
    it('POSTs questType and cefrLevel', async () => {
      mockFetchResponse({ result: { chapterAdvance: { advanced: true } } });
      const result = await ds.recordMainQuestCompletion('w1', 'p1', 'conversation', 'B1');
      expect(result.result.chapterAdvance.advanced).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/main-quest/p1/record-completion',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ questType: 'conversation', cefrLevel: 'B1' }),
        }),
      );
    });

    it('returns null on failure', async () => {
      mockFetchResponse(null, false);
      const result = await ds.recordMainQuestCompletion('w1', 'p1', 'conversation');
      expect(result).toBeNull();
    });
  });
});
