import { describe, it, expect, vi } from 'vitest';
import {
  countActiveQuests,
  checkAndReplenishQuests,
  type DepletionConfig,
} from '../../shared/quests/quest-depletion-monitor.js';
import type { WorldContext } from '../../shared/quests/quest-assignment-engine.js';
import type { Quest, InsertQuest } from '../../shared/schema';

// --- Fixtures ---

function makeWorld(overrides: Record<string, any> = {}) {
  return {
    id: 'world-1',
    name: 'Test Village',
    description: 'A test world',
    targetLanguage: 'French',
    worldType: 'village',
    gameType: 'language-learning',
    ...overrides,
  } as any;
}

function makeCharacter(overrides: Record<string, any> = {}) {
  return {
    id: `char-${Math.random().toString(36).slice(2, 8)}`,
    firstName: 'NPC',
    lastName: 'Bob',
    status: 'active',
    occupation: 'merchant',
    ...overrides,
  } as any;
}

function makeSettlement(overrides: Record<string, any> = {}) {
  return {
    id: 'settlement-1',
    name: 'Petit Village',
    worldId: 'world-1',
    ...overrides,
  } as any;
}

function makeQuest(overrides: Record<string, any> = {}): Quest {
  return {
    id: `quest-${Math.random().toString(36).slice(2, 8)}`,
    worldId: 'world-1',
    title: 'Test Quest',
    description: 'A test quest',
    status: 'active',
    assignedTo: 'Player1',
    questType: 'vocabulary',
    difficulty: 'beginner',
    targetLanguage: 'French',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

function makeCtx(overrides: Partial<WorldContext> = {}): WorldContext {
  return {
    world: makeWorld(),
    characters: [
      makeCharacter({ firstName: 'Marie', lastName: 'Dupont', occupation: 'teacher' }),
      makeCharacter({ firstName: 'Pierre', lastName: 'Martin', occupation: 'merchant' }),
    ],
    settlements: [makeSettlement()],
    existingQuests: [],
    ...overrides,
  };
}

function makeSaveQuest(): (quest: InsertQuest) => Promise<Quest> {
  let counter = 0;
  return vi.fn(async (quest: InsertQuest) => ({
    ...quest,
    id: `generated-${++counter}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as any;
}

// --- Tests ---

describe('Quest Depletion Monitor', () => {
  describe('countActiveQuests', () => {
    it('counts only active quests for the specified player and world', () => {
      const quests = [
        makeQuest({ status: 'active', assignedTo: 'Player1', worldId: 'world-1' }),
        makeQuest({ status: 'active', assignedTo: 'Player1', worldId: 'world-1' }),
        makeQuest({ status: 'completed', assignedTo: 'Player1', worldId: 'world-1' }),
        makeQuest({ status: 'active', assignedTo: 'Player2', worldId: 'world-1' }),
        makeQuest({ status: 'active', assignedTo: 'Player1', worldId: 'world-2' }),
      ];

      expect(countActiveQuests(quests, 'Player1', 'world-1')).toBe(2);
    });

    it('returns 0 when no active quests exist', () => {
      const quests = [
        makeQuest({ status: 'completed', assignedTo: 'Player1', worldId: 'world-1' }),
        makeQuest({ status: 'failed', assignedTo: 'Player1', worldId: 'world-1' }),
      ];

      expect(countActiveQuests(quests, 'Player1', 'world-1')).toBe(0);
    });

    it('returns 0 for empty quest list', () => {
      expect(countActiveQuests([], 'Player1', 'world-1')).toBe(0);
    });
  });

  describe('checkAndReplenishQuests', () => {
    it('does not generate quests when above threshold', async () => {
      const quests = [
        makeQuest({ status: 'active' }),
        makeQuest({ status: 'active' }),
        makeQuest({ status: 'active' }),
      ];
      const saveQuest = makeSaveQuest();

      const result = await checkAndReplenishQuests(
        quests,
        makeCtx(),
        'Player1',
        { minActiveQuests: 2 },
        saveQuest,
      );

      expect(result.depleted).toBe(false);
      expect(result.activeCount).toBe(3);
      expect(result.generatedQuests).toHaveLength(0);
      expect(saveQuest).not.toHaveBeenCalled();
    });

    it('does not generate quests when exactly at threshold', async () => {
      const quests = [
        makeQuest({ status: 'active' }),
        makeQuest({ status: 'active' }),
      ];
      const saveQuest = makeSaveQuest();

      const result = await checkAndReplenishQuests(
        quests,
        makeCtx(),
        'Player1',
        { minActiveQuests: 2 },
        saveQuest,
      );

      expect(result.depleted).toBe(false);
      expect(result.activeCount).toBe(2);
      expect(result.generatedQuests).toHaveLength(0);
    });

    it('generates quests when below threshold', async () => {
      const quests = [
        makeQuest({ status: 'active' }),
        makeQuest({ status: 'completed' }),
      ];
      const saveQuest = makeSaveQuest();

      const result = await checkAndReplenishQuests(
        quests,
        makeCtx(),
        'Player1',
        { minActiveQuests: 2, replenishCount: 3 },
        saveQuest,
      );

      expect(result.depleted).toBe(true);
      expect(result.activeCount).toBe(1);
      expect(result.threshold).toBe(2);
      expect(result.generatedQuests).toHaveLength(3);
      expect(saveQuest).toHaveBeenCalledTimes(3);
    });

    it('generates quests when no active quests remain', async () => {
      const quests = [
        makeQuest({ status: 'completed' }),
      ];
      const saveQuest = makeSaveQuest();

      const result = await checkAndReplenishQuests(
        quests,
        makeCtx(),
        'Player1',
        { minActiveQuests: 2, replenishCount: 3 },
        saveQuest,
      );

      expect(result.depleted).toBe(true);
      expect(result.activeCount).toBe(0);
      expect(result.generatedQuests).toHaveLength(3);
    });

    it('uses default config when not specified', async () => {
      const saveQuest = makeSaveQuest();

      const result = await checkAndReplenishQuests(
        [],
        makeCtx(),
        'Player1',
        {},
        saveQuest,
      );

      // Default: minActiveQuests=2, replenishCount=3
      expect(result.depleted).toBe(true);
      expect(result.threshold).toBe(2);
      expect(result.generatedQuests).toHaveLength(3);
    });

    it('generated quests have correct worldId and assignedTo', async () => {
      const savedQuests: InsertQuest[] = [];
      const saveQuest = vi.fn(async (quest: InsertQuest) => {
        savedQuests.push(quest);
        return { ...quest, id: `gen-${savedQuests.length}`, createdAt: new Date(), updatedAt: new Date() } as any;
      });

      await checkAndReplenishQuests(
        [],
        makeCtx(),
        'Player1',
        { minActiveQuests: 2, replenishCount: 2 },
        saveQuest,
      );

      for (const quest of savedQuests) {
        expect(quest.worldId).toBe('world-1');
        expect(quest.assignedTo).toBe('Player1');
        expect(quest.status).toBe('active');
      }
    });

    it('respects custom replenish count', async () => {
      const saveQuest = makeSaveQuest();

      const result = await checkAndReplenishQuests(
        [],
        makeCtx(),
        'Player1',
        { minActiveQuests: 1, replenishCount: 5 },
        saveQuest,
      );

      expect(result.generatedQuests).toHaveLength(5);
    });

    it('only counts quests for the specified player', async () => {
      const quests = [
        makeQuest({ status: 'active', assignedTo: 'Player2' }),
        makeQuest({ status: 'active', assignedTo: 'Player2' }),
        makeQuest({ status: 'active', assignedTo: 'Player2' }),
      ];
      const saveQuest = makeSaveQuest();

      const result = await checkAndReplenishQuests(
        quests,
        makeCtx(),
        'Player1',
        { minActiveQuests: 2 },
        saveQuest,
      );

      // Player1 has 0 active quests, should trigger generation
      expect(result.depleted).toBe(true);
      expect(result.activeCount).toBe(0);
    });
  });
});
