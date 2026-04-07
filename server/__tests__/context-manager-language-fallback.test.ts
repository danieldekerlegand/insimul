import { describe, it, expect, vi } from 'vitest';
import { buildContext } from '../services/conversation/context-manager';
import type { ContextManagerStorage } from '../services/conversation/context-manager';
import type { Character, World } from '@shared/schema';
import type { WorldLanguage } from '@shared/language';

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
    worldType: 'language-learning',
    description: 'A test world',
    currentGameYear: 1925,
    historyEndYear: 1925,
    targetLanguage: null,
    gameType: null,
    ...overrides,
  } as World;
}

function makeEnglishLanguage(): WorldLanguage {
  return {
    id: 'lang-en',
    worldId: 'world-1',
    name: 'English',
    realCode: 'en',
    isLearningTarget: false,
    isPrimary: true,
    description: 'English language',
  } as WorldLanguage;
}

function makeFrenchLanguage(overrides: Partial<WorldLanguage> = {}): WorldLanguage {
  return {
    id: 'lang-fr',
    worldId: 'world-1',
    name: 'French',
    realCode: 'fr',
    isLearningTarget: false, // NOT marked as learning target
    isPrimary: false,
    description: 'French language',
    ...overrides,
  } as WorldLanguage;
}

function makeStorage(overrides: Partial<ContextManagerStorage> = {}): ContextManagerStorage {
  return {
    getCharacter: async (id: string) => {
      if (id === 'npc-1') return makeCharacter();
      if (id === 'player-1') return makeCharacter({ id: 'player-1', firstName: 'Player', lastName: 'One' });
      return undefined;
    },
    getWorld: async () => makeWorld(),
    getCharactersByWorld: async () => [
      makeCharacter(),
      makeCharacter({ id: 'player-1', firstName: 'Player', lastName: 'One' }),
    ],
    getWorldLanguagesByWorld: async () => [makeEnglishLanguage()],
    getCurrentOccupation: async () => undefined,
    getBusiness: async () => undefined,
    getSettlementsByWorld: async () => [],
    getResidence: async () => undefined,
    ...overrides,
  };
}

describe('language learning detection fallback', () => {
  it('falls back to world.targetLanguage when no language has isLearningTarget', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const storage = makeStorage({
      getWorld: async () => makeWorld({ targetLanguage: 'French' }),
      getWorldLanguagesByWorld: async () => [makeEnglishLanguage(), makeFrenchLanguage()],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).toContain('LANGUAGE LEARNING MODE');
    expect(prompt).toContain('French');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No isLearningTarget in languages'),
      'French',
    );

    warnSpy.mockRestore();
  });

  it('constructs synthetic language when world.targetLanguage has no matching language entry', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const storage = makeStorage({
      getWorld: async () => makeWorld({ targetLanguage: 'Spanish' }),
      getWorldLanguagesByWorld: async () => [makeEnglishLanguage()], // No Spanish in languages
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).toContain('LANGUAGE LEARNING MODE');
    expect(prompt).toContain('Spanish');

    warnSpy.mockRestore();
  });

  it('falls back to gameType=language-learning with first non-English language', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const storage = makeStorage({
      getWorld: async () => makeWorld({ gameType: 'language-learning', targetLanguage: null }),
      getWorldLanguagesByWorld: async () => [makeEnglishLanguage(), makeFrenchLanguage()],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).toContain('LANGUAGE LEARNING MODE');
    expect(prompt).toContain('French');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('gameType=language-learning'),
      'French',
    );

    warnSpy.mockRestore();
  });

  it('returns null languageLearning when world.targetLanguage is null and not language-learning gameType', async () => {
    const storage = makeStorage({
      getWorld: async () => makeWorld({ targetLanguage: null, gameType: 'rpg' }),
      getWorldLanguagesByWorld: async () => [makeEnglishLanguage()],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).not.toContain('LANGUAGE LEARNING MODE');
  });

  it('returns null languageLearning when world.targetLanguage is English', async () => {
    const storage = makeStorage({
      getWorld: async () => makeWorld({ targetLanguage: 'English' }),
      getWorldLanguagesByWorld: async () => [makeEnglishLanguage()],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).not.toContain('LANGUAGE LEARNING MODE');
  });

  it('prefers isLearningTarget over fallback when a language has it set', async () => {
    const storage = makeStorage({
      getWorld: async () => makeWorld({ targetLanguage: 'Spanish' }),
      getWorldLanguagesByWorld: async () => [
        makeEnglishLanguage(),
        makeFrenchLanguage({ isLearningTarget: true }), // French is marked as target
      ],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);
    const prompt = ctx.conversationContext.systemPrompt;

    // Should use French (has isLearningTarget), not Spanish (world.targetLanguage)
    expect(prompt).toContain('LANGUAGE LEARNING MODE');
    expect(prompt).toContain('French');
    expect(prompt).not.toContain('Spanish');
  });
});
