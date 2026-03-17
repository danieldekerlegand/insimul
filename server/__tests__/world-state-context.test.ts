import { describe, it, expect } from 'vitest';
import {
  buildWorldStateContext,
  buildWorldContextPrompt,
  bindQuestToWorldEntities,
  getCurrentTimeOfDay,
  type WorldStateContext,
} from '../services/world-state-context';

// --- Test fixtures ---

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
    isPlayer: false,
    occupation: 'merchant',
    currentOccupation: 'merchant',
    personality: { openness: 80, conscientiousness: 50, extroversion: 75, agreeableness: 60, neuroticism: 30 },
    ...overrides,
  } as any;
}

function makeSettlement(overrides: Record<string, any> = {}) {
  return {
    id: 'settlement-1',
    name: 'Petit Village',
    settlementType: 'village',
    worldId: 'world-1',
    landmarks: ['Town Fountain', 'Clock Tower'],
    ...overrides,
  } as any;
}

function makeBusiness(overrides: Record<string, any> = {}) {
  return {
    id: 'biz-1',
    name: 'Le Bon Pain',
    businessType: 'Bakery',
    ownerId: 'char-baker',
    settlementId: 'settlement-1',
    isOutOfBusiness: false,
    inventory: [
      { nameLocal: 'pain', nameEnglish: 'bread', category: 'food', price: 5 },
      { nameLocal: 'croissant', nameEnglish: 'croissant', category: 'food', price: 3 },
    ],
    ...overrides,
  } as any;
}

function makeItem(overrides: Record<string, any> = {}) {
  return {
    id: 'item-1',
    name: 'Wooden Sword',
    itemType: 'weapon',
    ...overrides,
  } as any;
}

function makeQuest(overrides: Record<string, any> = {}) {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    title: 'Learn Greetings',
    status: 'active',
    assignedTo: 'Player',
    ...overrides,
  } as any;
}

// --- Tests ---

describe('buildWorldStateContext', () => {
  it('builds context with NPCs, businesses, locations, items', () => {
    const baker = makeCharacter({ id: 'char-baker', firstName: 'Jean', lastName: 'Blanc', currentOccupation: 'baker' });
    const ctx = buildWorldStateContext({
      world: makeWorld(),
      characters: [baker],
      settlements: [makeSettlement()],
      businesses: [makeBusiness()],
      items: [makeItem()],
      existingQuests: [],
    });

    expect(ctx.npcs).toHaveLength(1);
    expect(ctx.npcs[0].name).toBe('Jean Blanc');
    expect(ctx.npcs[0].occupation).toBe('baker');
    expect(ctx.businesses).toHaveLength(1);
    expect(ctx.businesses[0].name).toBe('Le Bon Pain');
    expect(ctx.businesses[0].ownerName).toBe('Jean Blanc');
    expect(ctx.businesses[0].inventory).toHaveLength(2);
    expect(ctx.locations).toHaveLength(1);
    expect(ctx.locations[0].name).toBe('Petit Village');
    expect(ctx.locations[0].landmarks).toContain('Town Fountain');
    expect(ctx.items).toContain('Wooden Sword');
  });

  it('excludes inactive characters from NPC list', () => {
    const inactive = makeCharacter({ firstName: 'Dead', lastName: 'Guy', status: 'deceased' });
    const npc = makeCharacter({ firstName: 'Marie', lastName: 'Dupont' });
    const ctx = buildWorldStateContext({
      world: makeWorld(),
      characters: [inactive, npc],
      settlements: [],
      businesses: [],
      items: [],
      existingQuests: [],
    });

    expect(ctx.npcs).toHaveLength(1);
    expect(ctx.npcs[0].name).toBe('Marie Dupont');
  });

  it('excludes out-of-business businesses', () => {
    const ctx = buildWorldStateContext({
      world: makeWorld(),
      characters: [],
      settlements: [],
      businesses: [
        makeBusiness({ name: 'Open Shop', isOutOfBusiness: false }),
        makeBusiness({ name: 'Closed Shop', isOutOfBusiness: true }),
      ],
      items: [],
      existingQuests: [],
    });

    expect(ctx.businesses).toHaveLength(1);
    expect(ctx.businesses[0].name).toBe('Open Shop');
  });

  it('tracks completed and active quest titles separately', () => {
    const ctx = buildWorldStateContext({
      world: makeWorld(),
      characters: [],
      settlements: [],
      businesses: [],
      items: [],
      existingQuests: [
        makeQuest({ title: 'Active Quest', status: 'active' }),
        makeQuest({ title: 'Done Quest', status: 'completed' }),
        makeQuest({ title: 'Failed Quest', status: 'failed' }),
      ],
    });

    expect(ctx.activeQuestTitles).toEqual(['Active Quest']);
    expect(ctx.completedQuestTitles).toEqual(['Done Quest']);
  });

  it('summarizes personality traits', () => {
    const curious = makeCharacter({
      firstName: 'Alex', lastName: 'Smith',
      personality: { openness: 90, conscientiousness: 80, extroversion: 20, agreeableness: 75, neuroticism: 30 },
    });
    const ctx = buildWorldStateContext({
      world: makeWorld(),
      characters: [curious],
      settlements: [],
      businesses: [],
      items: [],
      existingQuests: [],
    });

    expect(ctx.npcs[0].personality).toContain('curious');
    expect(ctx.npcs[0].personality).toContain('diligent');
    expect(ctx.npcs[0].personality).toContain('reserved');
    expect(ctx.npcs[0].personality).toContain('warm');
  });

  it('uses provided timeOfDay when given', () => {
    const ctx = buildWorldStateContext({
      world: makeWorld(),
      characters: [],
      settlements: [],
      businesses: [],
      items: [],
      existingQuests: [],
      timeOfDay: 'evening',
    });

    expect(ctx.timeOfDay).toBe('evening');
  });
});

describe('buildWorldContextPrompt', () => {
  function makeContext(overrides: Partial<WorldStateContext> = {}): WorldStateContext {
    return {
      world: makeWorld(),
      npcs: [
        { id: 'npc-1', name: 'Marie Dupont', occupation: 'teacher', personality: 'warm', settlementName: 'Petit Village' },
        { id: 'npc-2', name: 'Pierre Martin', occupation: 'merchant', personality: 'outgoing', settlementName: 'Petit Village' },
      ],
      businesses: [
        {
          name: 'Le Bon Pain', businessType: 'Bakery', ownerName: 'Jean Blanc', ownerId: 'npc-3',
          settlementName: 'Petit Village',
          inventory: [{ nameLocal: 'pain', nameEnglish: 'bread', category: 'food', price: 5 }],
        },
      ],
      locations: [
        { name: 'Petit Village', type: 'village', landmarks: ['Town Fountain'] },
      ],
      items: ['Wooden Sword', 'Healing Potion'],
      completedQuestTitles: [],
      activeQuestTitles: ['Learn Greetings'],
      timeOfDay: 'morning',
      ...overrides,
    };
  }

  it('includes NPC names with occupations', () => {
    const prompt = buildWorldContextPrompt(makeContext());
    expect(prompt).toContain('Marie Dupont');
    expect(prompt).toContain('teacher');
    expect(prompt).toContain('Pierre Martin');
    expect(prompt).toContain('merchant');
  });

  it('includes business names with inventory', () => {
    const prompt = buildWorldContextPrompt(makeContext());
    expect(prompt).toContain('Le Bon Pain');
    expect(prompt).toContain('Bakery');
    expect(prompt).toContain('pain');
  });

  it('includes location names with landmarks', () => {
    const prompt = buildWorldContextPrompt(makeContext());
    expect(prompt).toContain('Petit Village');
    expect(prompt).toContain('Town Fountain');
  });

  it('includes time of day and vocabulary themes', () => {
    const prompt = buildWorldContextPrompt(makeContext({ timeOfDay: 'morning' }));
    expect(prompt).toContain('morning');
    expect(prompt).toContain('greetings');
    expect(prompt).toContain('breakfast');
  });

  it('includes active quest titles to avoid duplicates', () => {
    const prompt = buildWorldContextPrompt(makeContext());
    expect(prompt).toContain('Learn Greetings');
    expect(prompt).toContain('avoid duplicating');
  });

  it('instructs AI to reference actual entities', () => {
    const prompt = buildWorldContextPrompt(makeContext());
    expect(prompt).toContain('ACTUAL NPCs');
    expect(prompt).toContain('Do NOT invent entity names');
  });

  it('handles empty context gracefully', () => {
    const prompt = buildWorldContextPrompt(makeContext({
      npcs: [],
      businesses: [],
      locations: [],
      items: [],
      activeQuestTitles: [],
    }));
    expect(prompt).toContain('TIME OF DAY');
    expect(prompt).not.toContain('AVAILABLE NPCs');
  });
});

describe('bindQuestToWorldEntities', () => {
  const ctx: WorldStateContext = {
    world: makeWorld(),
    npcs: [
      { id: 'npc-1', name: 'Marie Dupont', occupation: 'teacher', personality: 'warm', settlementName: 'Petit Village' },
      { id: 'npc-2', name: 'Pierre Martin', occupation: 'merchant', personality: 'outgoing', settlementName: 'Petit Village' },
    ],
    businesses: [
      {
        name: 'Le Bon Pain', businessType: 'Bakery', ownerName: 'Jean Blanc', ownerId: 'npc-3',
        settlementName: 'Petit Village',
        inventory: [{ nameLocal: 'pain', nameEnglish: 'bread', category: 'food', price: 5 }],
      },
    ],
    locations: [
      { name: 'Petit Village', type: 'village', landmarks: ['Town Fountain'] },
    ],
    items: ['Wooden Sword'],
    completedQuestTitles: [],
    activeQuestTitles: [],
    timeOfDay: 'morning',
  };

  it('keeps valid NPC target names unchanged', () => {
    const quest = {
      objectives: [
        { type: 'talk_to_npc', target: 'Marie Dupont', description: 'Talk to Marie Dupont' },
      ],
    };
    const result = bindQuestToWorldEntities(quest, ctx);
    expect(result.objectives[0].target).toBe('Marie Dupont');
  });

  it('replaces invented NPC names with real ones', () => {
    const quest = {
      objectives: [
        { type: 'talk_to_npc', target: 'Fake NPC Name', description: 'Talk to Fake NPC Name' },
      ],
    };
    const result = bindQuestToWorldEntities(quest, ctx);
    // Should be replaced with a real NPC name
    const validNames = ctx.npcs.map(n => n.name);
    expect(validNames).toContain(result.objectives[0].target);
  });

  it('replaces invented location names with real ones', () => {
    const quest = {
      objectives: [
        { type: 'visit_location', target: 'Nonexistent Place', description: 'Visit Nonexistent Place' },
      ],
    };
    const result = bindQuestToWorldEntities(quest, ctx);
    const validNames = [...ctx.locations.map(l => l.name), ...ctx.businesses.map(b => b.name)];
    expect(validNames).toContain(result.objectives[0].target);
  });

  it('matches NPC names by substring', () => {
    const quest = {
      objectives: [
        { type: 'talk_to_npc', target: 'Marie', description: 'Talk to Marie' },
      ],
    };
    const result = bindQuestToWorldEntities(quest, ctx);
    expect(result.objectives[0].target).toBe('Marie Dupont');
  });

  it('does not modify "any" targets', () => {
    const quest = {
      objectives: [
        { type: 'talk_to_npc', target: 'any', description: 'Talk to anyone' },
      ],
    };
    const result = bindQuestToWorldEntities(quest, ctx);
    expect(result.objectives[0].target).toBe('any');
  });

  it('binds assignedBy to real NPC and sets character ID', () => {
    const quest = {
      assignedBy: 'Marie',
      objectives: [],
    };
    const result = bindQuestToWorldEntities(quest, ctx);
    expect(result.assignedBy).toBe('Marie Dupont');
    expect(result.assignedByCharacterId).toBe('npc-1');
  });

  it('handles quests with no objectives gracefully', () => {
    const quest = { title: 'Simple Quest' };
    const result = bindQuestToWorldEntities(quest, ctx);
    expect(result.title).toBe('Simple Quest');
  });

  it('binds locationName to real location', () => {
    const quest = {
      locationName: 'Village',
      objectives: [],
    };
    const result = bindQuestToWorldEntities(quest, ctx);
    expect(result.locationName).toBe('Petit Village');
  });
});

describe('getCurrentTimeOfDay', () => {
  it('returns a valid time period', () => {
    const time = getCurrentTimeOfDay();
    expect(['morning', 'afternoon', 'evening', 'night']).toContain(time);
  });
});
