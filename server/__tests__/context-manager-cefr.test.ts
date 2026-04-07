import { describe, it, expect } from 'vitest';
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
    ...overrides,
  } as World;
}

function makeFrenchLanguage(): WorldLanguage {
  return {
    id: 'lang-fr',
    worldId: 'world-1',
    name: 'French',
    realCode: 'fr',
    isLearningTarget: true,
    description: 'French language',
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
    getWorldLanguagesByWorld: async () => [makeFrenchLanguage()],
    getCurrentOccupation: async () => undefined,
    getBusiness: async () => undefined,
    getSettlementsByWorld: async () => [],
    getResidence: async () => undefined,
    ...overrides,
  };
}

describe('buildContext with CEFR language mode directives', () => {
  it('includes simplified directive and frequency constraint for CEFR A1 (beginner)', async () => {
    // Player has no skills => proficiency = 0 => beginner => A1
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', makeStorage());

    const prompt = ctx.conversationContext.systemPrompt;
    expect(prompt).toContain('LANGUAGE LEARNING MODE');
    expect(prompt).toContain('CEFR A1');
    // Should contain a language mode directive (simplified, bilingual, or natural — depends on NPC hash)
    expect(prompt).toMatch(/LANGUAGE MODE — (SIMPLIFIED|BILINGUAL|NATURAL)/);
    // Should contain frequency constraint for A1 (top 200 words)
    expect(prompt).toContain('VOCABULARY');
    // Should contain CRITICAL LANGUAGE RULE at the end
    expect(prompt).toContain('CRITICAL LANGUAGE RULE');
    expect(prompt).toContain('French');
    expect(prompt).toContain('non-negotiable');
  });

  it('includes natural directive for CEFR B2 (advanced)', async () => {
    // Player with high French skill => advanced => B2
    const storage = makeStorage({
      getCharactersByWorld: async () => [
        makeCharacter(),
        makeCharacter({
          id: 'player-1',
          firstName: 'Player',
          lastName: 'One',
          skills: { 'lang-fr': 0.9 },
        }),
      ],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);

    const prompt = ctx.conversationContext.systemPrompt;
    expect(prompt).toContain('CEFR B2');
    expect(prompt).toContain('LANGUAGE LEARNING MODE');
    // B2 should allow full vocabulary range
    expect(prompt).toContain('full range');
    expect(prompt).toContain('CRITICAL LANGUAGE RULE');
  });

  it('includes B1 directive for intermediate proficiency', async () => {
    // Player with intermediate French skill => intermediate => B1
    const storage = makeStorage({
      getCharactersByWorld: async () => [
        makeCharacter(),
        makeCharacter({
          id: 'player-1',
          firstName: 'Player',
          lastName: 'One',
          skills: { 'lang-fr': 0.5 },
        }),
      ],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);

    const prompt = ctx.conversationContext.systemPrompt;
    expect(prompt).toContain('CEFR B1');
    expect(prompt).toContain('intermediate');
  });

  it('uses explicit cefrLevel from gameState when provided', async () => {
    // Even though player skill is 0 (beginner/A1), gameState overrides to B1
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', makeStorage(), {
      cefrLevel: 'B1' as any,
    });

    const prompt = ctx.conversationContext.systemPrompt;
    expect(prompt).toContain('CEFR B1');
    expect(ctx.languageLearning?.cefrLevel).toBe('B1');
  });

  it('places CRITICAL LANGUAGE RULE at the very end of the prompt', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', makeStorage());

    const prompt = ctx.conversationContext.systemPrompt;
    const criticalRuleIdx = prompt.indexOf('CRITICAL LANGUAGE RULE');
    const stayInCharIdx = prompt.indexOf('Stay in character');
    // CRITICAL LANGUAGE RULE must come after behavioral instructions
    expect(criticalRuleIdx).toBeGreaterThan(stayInCharIdx);
    // Should be near the end of the prompt
    expect(prompt.slice(criticalRuleIdx)).toContain('non-negotiable');
  });

  it('does not include language directives when no target language', async () => {
    const storage = makeStorage({
      getWorldLanguagesByWorld: async () => [],
    });

    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', storage);

    const prompt = ctx.conversationContext.systemPrompt;
    expect(prompt).not.toContain('LANGUAGE LEARNING MODE');
    expect(prompt).not.toContain('CRITICAL LANGUAGE RULE');
    expect(ctx.languageLearning).toBeNull();
  });

  it('populates cefrLevel on the languageLearning object', async () => {
    const ctx = await buildContext('npc-1', 'player-1', 'world-1', 'session-1', makeStorage());

    expect(ctx.languageLearning).not.toBeNull();
    expect(ctx.languageLearning!.cefrLevel).toBe('A1');
    expect(ctx.languageLearning!.targetLanguage).toBe('French');
  });
});
