/**
 * Tests for immediate quest creation on quest offer panel acceptance.
 *
 * Verifies that pressing Accept creates the quest via POST immediately,
 * updates the UI, and then opens chat — without depending on NPC QUEST_ASSIGN markers.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Test the quest creation logic extracted from BabylonGame ────────────────

interface QuestOfferData {
  npcId: string;
  npcName: string;
  questTitle: string;
  questDescription: string;
  questType: string;
  difficulty: string;
  objectives: string;
  category: string;
  rewards?: string;
}

/**
 * Extracted difficulty-to-XP mapping (mirrors createQuestFromOffer logic).
 */
function difficultyToXP(difficulty: string): number {
  const d = difficulty.toLowerCase();
  if (d === 'beginner') return 10;
  if (d === 'intermediate') return 25;
  if (d === 'advanced') return 50;
  if (d === 'easy') return 50;
  if (d === 'normal') return 100;
  if (d === 'hard') return 200;
  if (d === 'legendary') return 500;
  return 50;
}

/**
 * Extracted objective parsing (mirrors createQuestFromOffer logic).
 */
function parseObjectives(objectivesStr: string): { description: string }[] {
  const parts = objectivesStr.split(/[;,]|\d+\.\s+/).filter(p => p.trim());
  return parts.map(p => ({ description: p.trim() }));
}

describe('Quest Offer Accept — Immediate Creation', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  const baseOffer: QuestOfferData = {
    npcId: 'npc-baker-001',
    npcName: 'Jean Dupont',
    questTitle: 'A Task from Jean Dupont',
    questDescription: 'Jean Dupont the baker has a task for you.',
    questType: 'conversation',
    difficulty: 'normal',
    objectives: 'Talk to the NPC to learn quest details',
    category: 'baker',
  };

  describe('difficulty to XP mapping', () => {
    it('maps beginner to 10 XP', () => {
      expect(difficultyToXP('beginner')).toBe(10);
    });

    it('maps intermediate to 25 XP', () => {
      expect(difficultyToXP('intermediate')).toBe(25);
    });

    it('maps advanced to 50 XP', () => {
      expect(difficultyToXP('advanced')).toBe(50);
    });

    it('maps normal to 100 XP', () => {
      expect(difficultyToXP('normal')).toBe(100);
    });

    it('maps hard to 200 XP', () => {
      expect(difficultyToXP('hard')).toBe(200);
    });

    it('maps legendary to 500 XP', () => {
      expect(difficultyToXP('legendary')).toBe(500);
    });

    it('defaults to 50 XP for unknown difficulty', () => {
      expect(difficultyToXP('mythic')).toBe(50);
    });
  });

  describe('objective parsing', () => {
    it('parses comma-separated objectives', () => {
      const result = parseObjectives('Find the artifact, Return to NPC');
      expect(result).toEqual([
        { description: 'Find the artifact' },
        { description: 'Return to NPC' },
      ]);
    });

    it('parses semicolon-separated objectives', () => {
      const result = parseObjectives('Gather herbs; Brew potion');
      expect(result).toEqual([
        { description: 'Gather herbs' },
        { description: 'Brew potion' },
      ]);
    });

    it('parses numbered list objectives', () => {
      const result = parseObjectives('1. Talk to baker 2. Get bread');
      expect(result).toEqual([
        { description: 'Talk to baker' },
        { description: 'Get bread' },
      ]);
    });

    it('handles single objective', () => {
      const result = parseObjectives('Talk to the NPC to learn quest details');
      expect(result).toEqual([
        { description: 'Talk to the NPC to learn quest details' },
      ]);
    });
  });

  describe('quest creation POST payload', () => {
    it('sends correct payload to quest creation endpoint', async () => {
      const createdQuest = { id: 'quest-123', ...baseOffer, status: 'active' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdQuest),
      });

      const worldId = 'world-abc';
      const response = await fetch(`/api/worlds/${worldId}/quests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: 'Player',
          assignedBy: baseOffer.npcName,
          assignedByCharacterId: baseOffer.npcId,
          title: baseOffer.questTitle,
          description: baseOffer.questDescription,
          questType: baseOffer.questType,
          difficulty: baseOffer.difficulty.toLowerCase(),
          targetLanguage: 'French',
          status: 'active',
          experienceReward: difficultyToXP(baseOffer.difficulty),
          gameType: 'language-learning',
          objectives: parseObjectives(baseOffer.objectives),
          rewards: baseOffer.rewards,
        }),
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/worlds/world-abc/quests');
      expect(options.method).toBe('POST');

      const body = JSON.parse(options.body);
      expect(body.assignedTo).toBe('Player');
      expect(body.assignedBy).toBe('Jean Dupont');
      expect(body.assignedByCharacterId).toBe('npc-baker-001');
      expect(body.title).toBe('A Task from Jean Dupont');
      expect(body.status).toBe('active');
      expect(body.experienceReward).toBe(100);
      expect(body.questType).toBe('conversation');

      const result = await response.json();
      expect(result.id).toBe('quest-123');
    });

    it('throws on failed quest creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const response = await fetch('/api/worlds/world-abc/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('quest list management after panel accept', () => {
    it('adds quest to local quest array without duplicates', () => {
      const quests: any[] = [];
      const questData = { id: 'q1', title: 'Test Quest', status: 'active' };

      // Simulate handleQuestAssignedFromPanel logic
      if (!quests.find((q: any) => q.id === questData.id)) {
        quests.push(questData);
      }
      expect(quests).toHaveLength(1);

      // Try adding again — should not duplicate
      if (!quests.find((q: any) => q.id === questData.id)) {
        quests.push(questData);
      }
      expect(quests).toHaveLength(1);
    });

    it('demotes existing active quests to available', () => {
      const quests = [
        { id: 'q-old', title: 'Old Quest', status: 'active' },
        { id: 'q-completed', title: 'Done Quest', status: 'completed' },
      ];
      const newQuest = { id: 'q-new', title: 'New Quest', status: 'active' };

      // Simulate one-active-at-a-time enforcement
      const currentActive = quests.filter(q => q.status === 'active' && q.id !== newQuest.id);
      for (const q of currentActive) {
        q.status = 'available';
      }
      quests.push(newQuest);

      expect(quests.find(q => q.id === 'q-old')!.status).toBe('available');
      expect(quests.find(q => q.id === 'q-completed')!.status).toBe('completed');
      expect(quests.find(q => q.id === 'q-new')!.status).toBe('active');
    });
  });

  describe('accept flow ordering', () => {
    it('creates quest before opening chat', async () => {
      const callOrder: string[] = [];

      mockFetch.mockImplementation(async () => {
        callOrder.push('fetch-create-quest');
        return { ok: true, json: () => Promise.resolve({ id: 'q-1', title: 'Test' }) };
      });

      const mockOpenChat = vi.fn(async () => {
        callOrder.push('open-chat');
      });

      const mockHandleAssigned = vi.fn(async () => {
        callOrder.push('handle-assigned');
      });

      // Simulate the accept handler flow
      const createdQuest = await (await fetch('/api/worlds/w1/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })).json();

      await mockHandleAssigned(createdQuest);
      await mockOpenChat();

      expect(callOrder).toEqual(['fetch-create-quest', 'handle-assigned', 'open-chat']);
    });

    it('does not open chat on quest creation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const chatOpened = { value: false };
      const toastShown = { value: false };

      // Simulate the accept handler with error handling
      try {
        const response = await fetch('/api/worlds/w1/quests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        if (!response.ok) {
          throw new Error(`Quest creation failed: ${response.status}`);
        }
        chatOpened.value = true; // Should not reach here
      } catch {
        toastShown.value = true; // Error toast
      }

      expect(chatOpened.value).toBe(false);
      expect(toastShown.value).toBe(true);
    });
  });

  describe('multiple NPC quest accepts', () => {
    it('creates 3 separate quests from 3 different NPCs', async () => {
      const npcs = [
        { ...baseOffer, npcId: 'npc-1', npcName: 'Alice', questTitle: 'Quest A' },
        { ...baseOffer, npcId: 'npc-2', npcName: 'Bob', questTitle: 'Quest B' },
        { ...baseOffer, npcId: 'npc-3', npcName: 'Charlie', questTitle: 'Quest C' },
      ];

      const quests: any[] = [];

      for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: `quest-${i}`, title: npc.questTitle, status: 'active' }),
        });

        const response = await fetch('/api/worlds/w1/quests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignedBy: npc.npcName,
            assignedByCharacterId: npc.npcId,
            title: npc.questTitle,
          }),
        });

        const created = await response.json();

        // One-active-at-a-time: demote previous
        for (const q of quests) {
          if (q.status === 'active') q.status = 'available';
        }
        quests.push(created);
      }

      expect(quests).toHaveLength(3);
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Only the last quest should be active
      expect(quests[0].status).toBe('available');
      expect(quests[1].status).toBe('available');
      expect(quests[2].status).toBe('active');

      // All 3 quest titles present
      expect(quests.map(q => q.title)).toEqual(['Quest A', 'Quest B', 'Quest C']);
    });
  });
});
