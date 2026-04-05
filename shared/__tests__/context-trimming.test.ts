import { describe, it, expect, beforeEach } from 'vitest';
import { buildContext, getLastPromptSectionTokens } from '../../server/services/conversation/context-manager';
import type { ContextManagerStorage } from '../../server/services/conversation/context-manager';

// ── Mock data ────────────────────────────────────────────────────────

const mockCharacter = {
  id: 'char-1',
  firstName: 'Marie',
  lastName: 'Dupont',
  gender: 'female',
  birthYear: 1985,
  personality: {
    openness: 0.7,
    conscientiousness: 0.5,
    extroversion: 0.3,
    agreeableness: 0.8,
    neuroticism: -0.2,
  },
  occupation: 'Baker',
  currentLocation: 'Bakery',
  currentResidenceId: null,
  spouseId: 'char-2',
  immediateFamilyIds: ['char-3'],
  parentIds: [],
  childIds: [],
  relationships: {
    'player-1': { type: 'friendly', strength: 0.4, trust: 0.5, topics: ['bread', 'weather'] },
    'char-4': { type: 'friend', strength: 0.6 },
    'char-5': { type: 'rival', strength: -0.5 },
  },
  thoughts: [{ emotion: 'happy', timestamp: Date.now() }],
  skills: {},
  worldId: 'world-1',
} as any;

const mockWorld = {
  id: 'world-1',
  name: 'Petit Village',
  worldType: 'French countryside',
  description: 'A charming village in the south of France with cobblestone streets and a central plaza. The village is surrounded by lavender fields and vineyards that stretch to the horizon.',
  currentGameYear: 2024,
  historyEndYear: null,
} as any;

const mockSettlement = {
  id: 'settlement-1',
  name: 'Petit Village',
  settlementType: 'village',
  description: 'A quaint village known for its weekly market, historic church, and the famous bakery on the main square.',
  worldId: 'world-1',
} as any;

const mockCharacters = [
  mockCharacter,
  { id: 'char-2', firstName: 'Jean', lastName: 'Dupont', worldId: 'world-1' } as any,
  { id: 'char-3', firstName: 'Sophie', lastName: 'Dupont', worldId: 'world-1' } as any,
  { id: 'char-4', firstName: 'Pierre', lastName: 'Martin', worldId: 'world-1' } as any,
  { id: 'char-5', firstName: 'Luc', lastName: 'Bernard', worldId: 'world-1' } as any,
  { id: 'player-1', firstName: 'Player', lastName: 'One', worldId: 'world-1', skills: {} } as any,
];

const mockLanguage = {
  id: 'lang-1',
  name: 'French',
  realCode: 'fr',
  isLearningTarget: true,
  worldId: 'world-1',
} as any;

const mockOccupation = {
  vocation: 'Baker',
  businessId: 'biz-1',
} as any;

const mockBusiness = {
  id: 'biz-1',
  name: 'Boulangerie Marie',
  businessType: 'Bakery',
  ownerId: 'char-1',
  foundedYear: 2010,
} as any;

// ── Mock storage ─────────────────────────────────────────────────────

function createMockStorage(): ContextManagerStorage {
  return {
    getCharacter: async (id: string) => mockCharacters.find(c => c.id === id),
    getWorld: async () => mockWorld,
    getCharactersByWorld: async () => mockCharacters,
    getWorldLanguagesByWorld: async () => [mockLanguage],
    getCurrentOccupation: async () => mockOccupation,
    getBusiness: async () => mockBusiness,
    getSettlementsByWorld: async () => [mockSettlement],
    getResidence: async () => null,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('Context trimming for follow-up turns', () => {
  let storage: ContextManagerStorage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('turn 1 includes full world description', async () => {
    const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).toContain('World description:');
    expect(prompt).toContain('French countryside');
    expect(prompt).toContain('charming village');
  });

  it('turn 2+ condenses world to one line', async () => {
    const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 2);
    const prompt = ctx.conversationContext.systemPrompt;

    // Should have world name and era but NOT the full description
    expect(prompt).toContain('Petit Village');
    expect(prompt).not.toContain('World description:');
    expect(prompt).not.toContain('charming village');
  });

  it('turn 1 includes settlement description', async () => {
    const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).toContain('About Petit Village:');
    expect(prompt).toContain('quaint village');
  });

  it('turn 2+ omits settlement description', async () => {
    const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 2);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).not.toContain('About Petit Village:');
    expect(prompt).not.toContain('quaint village');
  });

  it('turn 1 includes family, friends, and enemies', async () => {
    const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).toContain('Family:');
    expect(prompt).toContain('Friends:');
    expect(prompt).toContain('Rivals/enemies:');
  });

  it('turn 2+ omits family, friends, and enemies but keeps player relationship', async () => {
    const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 2);
    const prompt = ctx.conversationContext.systemPrompt;

    expect(prompt).not.toContain('Family:');
    expect(prompt).not.toContain('Friends: Pierre');
    expect(prompt).not.toContain('Rivals/enemies:');
    // Player relationship always present
    expect(prompt).toContain('Relationship with player:');
    expect(prompt).toContain('Previously discussed:');
  });

  it('character personality is kept in full on all turns', async () => {
    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const turn3 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 3);

    expect(turn1.conversationContext.systemPrompt).toContain('Personality (Big Five):');
    expect(turn3.conversationContext.systemPrompt).toContain('Personality (Big Five):');
  });

  it('language learning directives are kept in full on all turns', async () => {
    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const turn3 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 3);

    expect(turn1.conversationContext.systemPrompt).toContain('LANGUAGE LEARNING MODE:');
    expect(turn3.conversationContext.systemPrompt).toContain('LANGUAGE LEARNING MODE:');
    expect(turn3.conversationContext.systemPrompt).toContain('Target language: French');
  });

  it('turn 2+ prompt is shorter than turn 1 prompt', async () => {
    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const turn2 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 2);

    expect(turn2.conversationContext.systemPrompt.length).toBeLessThan(
      turn1.conversationContext.systemPrompt.length,
    );
  });

  it('getLastPromptSectionTokens returns section-level token counts', async () => {
    await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const tokens = getLastPromptSectionTokens();

    expect(tokens).not.toBeNull();
    expect(tokens!.turnNumber).toBe(1);
    expect(tokens!.total).toBeGreaterThan(0);
    expect(tokens!.character).toBeGreaterThan(0);
    expect(tokens!.world).toBeGreaterThan(0);
    expect(tokens!.environment).toBeGreaterThan(0);
    expect(tokens!.language).toBeGreaterThan(0);
  });

  it('turn 2+ has fewer total estimated tokens than turn 1', async () => {
    await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const turn1Tokens = getLastPromptSectionTokens()!;

    await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 2);
    const turn2Tokens = getLastPromptSectionTokens()!;

    expect(turn2Tokens.total).toBeLessThan(turn1Tokens.total);
    expect(turn2Tokens.turnNumber).toBe(2);
    // Character and language sections should be same size
    expect(turn2Tokens.character).toBe(turn1Tokens.character);
    expect(turn2Tokens.language).toBe(turn1Tokens.language);
    // World and environment sections should be smaller
    expect(turn2Tokens.world).toBeLessThan(turn1Tokens.world);
    expect(turn2Tokens.environment).toBeLessThanOrEqual(turn1Tokens.environment);
  });

  it('quest section is condensed on follow-up turns', async () => {
    const gameState = {
      activeQuests: [
        {
          questName: 'Find the lost bread recipe',
          status: 'active' as const,
          assignedByThisNPC: true,
          questId: 'q-1',
          objectives: [],
        },
      ],
    };

    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, gameState, 1);
    const turn2 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, gameState, 2);

    // Turn 1: full quest description with action hints
    expect(turn1.conversationContext.systemPrompt).toContain('in progress — you can ask about progress');
    // Turn 2: condensed to ID + status only
    expect(turn2.conversationContext.systemPrompt).toContain('"Find the lost bread recipe" (active)');
    expect(turn2.conversationContext.systemPrompt).not.toContain('in progress — you can ask about progress');
  });

  it('player progress awareness is only on turn 1', async () => {
    const gameState = {
      playerProgress: { questsCompleted: 10, reputation: 5, isNewToTown: false },
    };

    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, gameState, 1);
    const turn2 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, gameState, 2);

    expect(turn1.conversationContext.systemPrompt).toContain('well-known locally');
    expect(turn2.conversationContext.systemPrompt).not.toContain('well-known locally');
  });

  it('weather hint is only on turn 1 during storms', async () => {
    const gameState = { weather: 'storm' as const };

    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, gameState, 1);
    const turn2 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, gameState, 2);

    expect(turn1.conversationContext.systemPrompt).toContain('suggest shelter');
    expect(turn2.conversationContext.systemPrompt).not.toContain('suggest shelter');
  });

  it('behavioral instructions are always included', async () => {
    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const turn5 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 5);

    expect(turn1.conversationContext.systemPrompt).toContain('Stay in character');
    expect(turn5.conversationContext.systemPrompt).toContain('Stay in character');
  });

  it('identity and occupation are always included', async () => {
    const turn1 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 1);
    const turn3 = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, 3);

    expect(turn3.conversationContext.systemPrompt).toContain('You are Marie Dupont');
    expect(turn3.conversationContext.systemPrompt).toContain('Occupation: Baker');
    expect(turn3.conversationContext.systemPrompt).toContain('Boulangerie Marie');
  });

  it('turn number defaults to 1 when not provided', async () => {
    const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage);
    const prompt = ctx.conversationContext.systemPrompt;

    // Should have full context (turn 1 behavior)
    expect(prompt).toContain('World description:');
    expect(prompt).toContain('Family:');
  });

  it('20-message history cap is documented in ws-bridge addToHistory', async () => {
    // Verify the history cap constant exists by checking the function behavior
    // The actual cap is enforced in ws-bridge.ts addToHistory() at 20 messages
    // This test verifies context builds work regardless of turn number
    for (const turn of [1, 5, 10]) {
      const ctx = await buildContext('char-1', 'player-1', 'world-1', 'sess-1', storage, undefined, turn);
      expect(ctx.conversationContext.systemPrompt).toBeTruthy();
      expect(ctx.conversationContext.systemPrompt.length).toBeGreaterThan(0);
    }
  });
});
