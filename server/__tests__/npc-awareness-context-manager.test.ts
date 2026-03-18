import { describe, it, expect } from 'vitest';
import { buildContext, buildBusinessContext } from '../services/conversation/context-manager';
import type { ContextManagerStorage } from '../services/conversation/context-manager';
import type { Character, World, Settlement, Business } from '@shared/schema';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'npc-1',
    worldId: 'world-1',
    firstName: 'Maria',
    lastName: 'Santos',
    gender: 'female',
    age: 35,
    birthYear: 1890,
    occupation: 'Baker',
    personality: {
      openness: 0.7,
      conscientiousness: 0.6,
      extroversion: 0.5,
      agreeableness: 0.8,
      neuroticism: 0.3,
    },
    relationships: {},
    thoughts: [{ emotion: 'happy', timestamp: Date.now() }],
    currentLocation: 'Town Square',
    currentResidenceId: null,
    spouseId: null,
    immediateFamilyIds: [],
    parentIds: [],
    childIds: [],
    skills: {},
    ...overrides,
  } as Character;
}

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    id: 'world-1',
    name: 'Test World',
    worldType: 'historical',
    description: 'A test world',
    currentGameYear: 1925,
    historyEndYear: 1925,
    ...overrides,
  } as World;
}

const mockStorage: ContextManagerStorage = {
  getCharacter: async (id: string) => {
    if (id === 'npc-1') return makeCharacter();
    if (id === 'player-1') return makeCharacter({ id: 'player-1', firstName: 'Player', lastName: 'One' });
    return undefined;
  },
  getWorld: async () => makeWorld(),
  getCharactersByWorld: async () => [makeCharacter(), makeCharacter({ id: 'player-1', firstName: 'Player', lastName: 'One' })],
  getWorldLanguagesByWorld: async () => [],
  getCurrentOccupation: async () => undefined,
  getBusiness: async () => undefined,
  getSettlementsByWorld: async () => [],
  getResidence: async () => undefined,
};

describe('buildContext with NPC awareness', () => {
  it('includes weather in system prompt when provided', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage, {
      weather: 'rain',
      gameHour: 14,
    });

    expect(ctx.conversationContext.systemPrompt).toContain('rainy');
    expect(ctx.weather).toBe('rain');
  });

  it('includes time description in system prompt', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage, {
      gameHour: 6,
    });

    expect(ctx.conversationContext.systemPrompt).toContain('sunrise');
    expect(ctx.gameHour).toBe(6);
  });

  it('includes season in system prompt when provided', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage, {
      season: 'winter',
      gameHour: 12,
    });

    expect(ctx.conversationContext.systemPrompt).toContain('winter');
    expect(ctx.season).toBe('winter');
  });

  it('includes player progress - new to town', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage, {
      gameHour: 12,
      playerProgress: { questsCompleted: 0, reputation: 0, isNewToTown: true },
    });

    expect(ctx.conversationContext.systemPrompt).toContain('new in town');
    expect(ctx.playerProgress.isNewToTown).toBe(true);
  });

  it('includes player progress - experienced player', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage, {
      gameHour: 12,
      playerProgress: { questsCompleted: 7, reputation: 80, isNewToTown: false },
    });

    expect(ctx.conversationContext.systemPrompt).toContain('well-known');
    expect(ctx.playerProgress.questsCompleted).toBe(7);
  });

  it('includes active quest context for NPC quest givers', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage, {
      gameHour: 12,
      activeQuests: [
        { questId: 'q1', questName: 'Deliver Bread', assignedByThisNPC: true, status: 'active' },
      ],
    });

    expect(ctx.conversationContext.systemPrompt).toContain('Deliver Bread');
    expect(ctx.conversationContext.systemPrompt).toContain('in progress');
  });

  it('includes storm weather behavioral hint', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage, {
      weather: 'storm',
      gameHour: 14,
    });

    expect(ctx.conversationContext.systemPrompt).toContain('shelter');
  });

  it('defaults gracefully when no game state provided', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', mockStorage);

    expect(ctx.weather).toBe('clear');
    expect(ctx.playerProgress.isNewToTown).toBe(true);
    expect(ctx.activeQuests).toEqual([]);
  });
});
