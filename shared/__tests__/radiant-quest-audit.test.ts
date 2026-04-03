/**
 * Radiant Quest Generation & Assignment Audit
 *
 * Verifies that procedurally generated side quests:
 * 1. Are created with correct status and fields
 * 2. Get distributed to NPCs properly
 * 3. Follow the correct lifecycle: available → (NPC assigned) → accepted → active
 * 4. Don't accumulate without bound
 * 5. Side-quest generator produces valid quest shapes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameQuestManager, type GameQuestManagerConfig } from '../game-engine/logic/GameQuestManager';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import type { Quest, InsertQuest, Character, World, Settlement } from '../schema';

// ── Mock Storage ──────────────────────────────────────────────────────────────

function createMockStorage(initialQuests: Quest[] = [], initialCharacters: Character[] = []) {
  const quests = [...initialQuests];
  const characters = [...initialCharacters];

  return {
    getQuestsByWorld: vi.fn(async () => quests),
    getCharactersByWorld: vi.fn(async () => characters),
    getSettlementsByWorld: vi.fn(async () => [] as Settlement[]),
    getBusinessesByWorld: vi.fn(async () => []),
    getWorld: vi.fn(async () => ({
      id: 'world-1',
      name: 'Test World',
      targetLanguage: 'French',
    } as World)),
    createQuest: vi.fn(async (q: InsertQuest) => {
      const created = { ...q, id: `q-${quests.length + 1}`, createdAt: new Date(), updatedAt: new Date() } as Quest;
      quests.push(created);
      return created;
    }),
    updateQuest: vi.fn(async (id: string, updates: Partial<Quest>) => {
      const idx = quests.findIndex(q => q.id === id);
      if (idx === -1) return null;
      quests[idx] = { ...quests[idx], ...updates };
      return quests[idx];
    }),
    getQuest: vi.fn(async (id: string) => quests.find(q => q.id === id) ?? null),
    _quests: quests,
    _characters: characters,
  };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const id = overrides.id ?? `char-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    worldId: 'world-1',
    firstName: overrides.firstName ?? 'Jean',
    lastName: overrides.lastName ?? 'Dupont',
    occupation: overrides.occupation ?? 'baker',
    isAlive: true,
    isNPC: true,
    ...overrides,
  } as Character;
}

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  const id = overrides.id ?? `quest-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    worldId: 'world-1',
    title: 'Test Quest',
    description: 'Test description',
    questType: 'conversation',
    difficulty: 'beginner',
    targetLanguage: 'French',
    assignedTo: 'Player',
    assignedBy: null,
    assignedByCharacterId: null,
    status: 'available',
    objectives: [{ id: 'obj_1', type: 'talk_to_npc', description: 'Talk', completed: false }],
    experienceReward: 50,
    tags: ['side-quest'],
    ...overrides,
  } as Quest;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Radiant Quest Distribution', () => {
  let storage: ReturnType<typeof createMockStorage>;
  let eventBus: GameEventBus;
  let manager: GameQuestManager;

  function createManager(quests: Quest[] = [], characters: Character[] = []) {
    storage = createMockStorage(quests, characters);
    eventBus = new GameEventBus();
    manager = new GameQuestManager({
      storage: storage as any,
      eventBus,
      worldId: 'world-1',
      playerName: 'Player',
      targetLanguage: 'French',
    } as GameQuestManagerConfig);
    return manager;
  }

  describe('distributeRadiantQuests', () => {
    it('assigns available quests without NPC to eligible NPCs', async () => {
      const npc = makeCharacter({ id: 'npc-1', firstName: 'Marie', lastName: 'Laurent' });
      const quest = makeQuest({ status: 'available', assignedByCharacterId: null });

      createManager([quest], [npc]);
      const count = await manager.distributeRadiantQuests(5);

      expect(count).toBe(1);
      expect(storage.updateQuest).toHaveBeenCalledWith(quest.id, expect.objectContaining({
        assignedByCharacterId: 'npc-1',
        assignedBy: 'Marie Laurent',
      }));
    });

    it('does NOT pick up active quests (they are already in progress)', async () => {
      const npc = makeCharacter({ id: 'npc-1' });
      const activeQuest = makeQuest({ status: 'active', assignedByCharacterId: null });

      createManager([activeQuest], [npc]);
      const count = await manager.distributeRadiantQuests(5);

      expect(count).toBe(0);
      expect(storage.updateQuest).not.toHaveBeenCalled();
    });

    it('skips quests that already have an NPC assigned', async () => {
      const npc = makeCharacter({ id: 'npc-1' });
      const alreadyAssigned = makeQuest({ status: 'available', assignedByCharacterId: 'npc-2' });

      createManager([alreadyAssigned], [npc]);
      const count = await manager.distributeRadiantQuests(5);

      expect(count).toBe(0);
    });

    it('respects maxOffering limit', async () => {
      const npcs = [
        makeCharacter({ id: 'npc-1', firstName: 'A', lastName: 'A' }),
        makeCharacter({ id: 'npc-2', firstName: 'B', lastName: 'B' }),
        makeCharacter({ id: 'npc-3', firstName: 'C', lastName: 'C' }),
      ];
      const quests = [
        makeQuest({ id: 'q1', status: 'available', assignedByCharacterId: null }),
        makeQuest({ id: 'q2', status: 'available', assignedByCharacterId: null }),
        makeQuest({ id: 'q3', status: 'available', assignedByCharacterId: null }),
      ];

      createManager(quests, npcs);
      const count = await manager.distributeRadiantQuests(2);

      expect(count).toBe(2);
    });

    it('subtracts already-offering NPCs from slot count', async () => {
      const npc1 = makeCharacter({ id: 'npc-1', firstName: 'A', lastName: 'A' });
      const npc2 = makeCharacter({ id: 'npc-2', firstName: 'B', lastName: 'B' });
      const existingOffering = makeQuest({ id: 'existing', status: 'available', assignedByCharacterId: 'npc-1' });
      const unassigned = makeQuest({ id: 'new', status: 'available', assignedByCharacterId: null });

      createManager([existingOffering, unassigned], [npc1, npc2]);
      // maxOffering=2, but 1 slot taken by npc-1, so only 1 slot open
      const count = await manager.distributeRadiantQuests(2);

      expect(count).toBe(1);
      expect(storage.updateQuest).toHaveBeenCalledWith('new', expect.objectContaining({
        assignedByCharacterId: 'npc-2',
      }));
    });

    it('skips dead NPCs', async () => {
      const deadNpc = makeCharacter({ id: 'npc-1', isAlive: false });
      const quest = makeQuest({ status: 'available', assignedByCharacterId: null });

      createManager([quest], [deadNpc]);
      const count = await manager.distributeRadiantQuests(5);

      expect(count).toBe(0);
    });

    it('skips NPCs without an occupation', async () => {
      const noOccupation = makeCharacter({ id: 'npc-1', occupation: null as any });
      const quest = makeQuest({ status: 'available', assignedByCharacterId: null });

      createManager([quest], [noOccupation]);
      const count = await manager.distributeRadiantQuests(5);

      expect(count).toBe(0);
    });

    it('does not change quest status during distribution', async () => {
      const npc = makeCharacter({ id: 'npc-1', firstName: 'Marie', lastName: 'Laurent' });
      const quest = makeQuest({ status: 'available', assignedByCharacterId: null });

      createManager([quest], [npc]);
      await manager.distributeRadiantQuests(5);

      // Should NOT include a status field in the update
      const updateCall = storage.updateQuest.mock.calls[0];
      expect(updateCall[1]).not.toHaveProperty('status');
    });

    it('returns 0 when no quests need distribution', async () => {
      const npc = makeCharacter({ id: 'npc-1' });
      createManager([], [npc]);
      const count = await manager.distributeRadiantQuests(5);
      expect(count).toBe(0);
    });

    it('returns 0 when no eligible NPCs exist', async () => {
      const quest = makeQuest({ status: 'available', assignedByCharacterId: null });
      createManager([quest], []);
      const count = await manager.distributeRadiantQuests(5);
      expect(count).toBe(0);
    });
  });

  describe('acceptQuestFromNpc', () => {
    it('changes quest status from available to active', async () => {
      const quest = makeQuest({ id: 'q1', status: 'available', assignedByCharacterId: 'npc-1' });
      createManager([quest], []);

      await manager.acceptQuestFromNpc('q1');

      expect(storage.updateQuest).toHaveBeenCalledWith('q1', expect.objectContaining({
        status: 'active',
      }));
    });
  });
});

describe('Radiant Quest Lifecycle', () => {
  it('full cycle: available → distributed → accepted → active', async () => {
    const npc = makeCharacter({ id: 'npc-1', firstName: 'Marie', lastName: 'Laurent' });
    const quest = makeQuest({ id: 'q1', status: 'available', assignedByCharacterId: null, assignedTo: 'Player' });

    const storage = createMockStorage([quest], [npc]);
    const eventBus = new GameEventBus();
    const manager = new GameQuestManager({
      storage: storage as any,
      eventBus,
      worldId: 'world-1',
      playerName: 'Player',
      targetLanguage: 'French',
    } as GameQuestManagerConfig);

    // Step 1: distribute assigns NPC
    await manager.distributeRadiantQuests(5);
    const distributed = storage._quests.find(q => q.id === 'q1')!;
    expect(distributed.assignedByCharacterId).toBe('npc-1');
    expect(distributed.status).toBe('available'); // Still available, not active

    // Step 2: player accepts from NPC
    await manager.acceptQuestFromNpc('q1');
    const accepted = storage._quests.find(q => q.id === 'q1')!;
    expect(accepted.status).toBe('active');
  });
});

describe('Side Quest Generator Output Shape', () => {
  it('generateSideQuests produces quests with required fields', async () => {
    // Import and test the generator directly
    const { generateSideQuests } = await import('../../shared/quests/side-quest-generator');

    const world = { id: 'world-1', name: 'La Louisiane', targetLanguage: 'French' } as World;
    // Characters need status='active' and occupation matching QUEST_GIVING_OCCUPATIONS (case-sensitive)
    const characters = [
      makeCharacter({ id: 'npc-1', firstName: 'Pierre', lastName: 'Boulanger', occupation: 'Baker', status: 'active' as any }),
      makeCharacter({ id: 'npc-2', firstName: 'Marie', lastName: 'Dupont', occupation: 'Doctor', status: 'active' as any }),
    ];
    const settlements = [{ id: 's1', name: 'Bayou Town', worldId: 'world-1' }] as Settlement[];

    const quests = generateSideQuests({
      world,
      characters,
      settlements,
      targetLanguage: 'French',
      playerName: 'Player',
      maxQuests: 3,
    } as any);

    expect(quests.length).toBeGreaterThan(0);
    expect(quests.length).toBeLessThanOrEqual(3);

    for (const q of quests) {
      // Every side quest must have required fields
      expect(q.worldId).toBe('world-1');
      expect(q.assignedTo).toBe('Player');
      expect(q.status).toBe('available');
      expect(q.title).toBeTruthy();
      expect(q.description).toBeTruthy();
      expect(q.questType).toBeTruthy();
      expect(q.objectives).toBeDefined();
      expect(Array.isArray(q.objectives)).toBe(true);
      expect((q.objectives as any[]).length).toBeGreaterThan(0);

      // Side quests should have an NPC giver
      expect(q.assignedByCharacterId).toBeTruthy();
      expect(q.assignedBy).toBeTruthy();

      // Should have XP reward
      expect(q.experienceReward).toBeGreaterThan(0);

      // Each objective should have required shape
      for (const obj of q.objectives as any[]) {
        expect(obj.id).toBeTruthy();
        expect(obj.type).toBeTruthy();
        expect(obj.description).toBeTruthy();
        expect(obj.completed).toBe(false);
      }
    }
  });

  it('fetch quests are created with available status', async () => {
    const { generateFetchQuests } = await import('../../shared/quests/fetch-quest-generator');

    const world = { id: 'world-1', name: 'La Louisiane', targetLanguage: 'French' } as World;
    const characters = [
      makeCharacter({ id: 'npc-1', firstName: 'Pierre', lastName: 'Boulanger', occupation: 'baker' }),
      makeCharacter({ id: 'npc-2', firstName: 'Marie', lastName: 'Pêcheur', occupation: 'fisher' }),
    ];
    const settlements = [{ id: 's1', name: 'Bayou Town', worldId: 'world-1' }] as Settlement[];

    const quests = generateFetchQuests({
      world,
      characters,
      settlements,
      targetLanguage: 'French',
      playerName: 'Player',
      maxQuests: 2,
    } as any);

    for (const q of quests) {
      expect(q.status).toBe('available');
    }
  });
});

describe('Quest Accumulation Guard', () => {
  it('_generateContextualQuests counts pending-distribution quests toward threshold', async () => {
    // Create 6 active quests + 3 available unassigned (total 9 >= 8 threshold)
    const activeQuests = Array.from({ length: 6 }, (_, i) =>
      makeQuest({ id: `active-${i}`, status: 'active', assignedTo: 'Player' }),
    );
    const pendingQuests = Array.from({ length: 3 }, (_, i) =>
      makeQuest({ id: `pending-${i}`, status: 'available', assignedByCharacterId: null, assignedTo: 'Player' }),
    );

    const storage = createMockStorage([...activeQuests, ...pendingQuests], []);
    const eventBus = new GameEventBus();
    const manager = new GameQuestManager({
      storage: storage as any,
      eventBus,
      worldId: 'world-1',
      playerName: 'Player',
      targetLanguage: 'French',
    } as GameQuestManagerConfig);

    // Access private method via any cast - should NOT generate more quests
    await (manager as any)._generateContextualQuests();

    // createQuest should NOT have been called since 6+3 >= 8
    expect(storage.createQuest).not.toHaveBeenCalled();
  });
});
