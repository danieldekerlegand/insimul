import { describe, it, expect, vi } from 'vitest';
import {
  generateMainQuest,
  generateMainQuestAuto,
  selectBestArc,
  resolveBindings,
  type NarrativeBindings,
} from '../services/main-quest-generator';
import {
  NARRATIVE_ARCS,
  getArcsForCefrLevel,
  getArcsByTheme,
  listNarrativeArcs,
} from '../services/narrative-templates';
import type { WorldStateContext } from '../services/world-state-context';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeWorldStateContext(
  overrides: Partial<WorldStateContext> = {},
): WorldStateContext {
  return {
    world: {
      id: 'world-1',
      name: 'Test World',
      targetLanguage: 'French',
      worldType: 'language-learning',
    } as any,
    npcs: [
      { id: 'npc-1', name: 'Marie Dupont', occupation: 'elder', personality: 'warm', settlementName: 'Villeneuve' },
      { id: 'npc-2', name: 'Jean Marchand', occupation: 'merchant', personality: 'friendly', settlementName: 'Villeneuve' },
      { id: 'npc-3', name: 'Pierre Forgeron', occupation: 'blacksmith', personality: 'reserved', settlementName: 'Villeneuve' },
      { id: 'npc-4', name: 'Sophie Martin', occupation: 'farmer', personality: 'outgoing', settlementName: 'Villeneuve' },
      { id: 'npc-5', name: 'Luc Berger', occupation: 'teacher', personality: 'curious', settlementName: 'Villeneuve' },
    ],
    businesses: [
      {
        name: "Marchand's Goods",
        businessType: 'general_store',
        ownerName: 'Jean Marchand',
        ownerId: 'npc-2',
        settlementName: 'Villeneuve',
        inventory: [{ nameLocal: 'pain', nameEnglish: 'bread', category: 'food', price: 5 }],
      },
    ],
    locations: [
      { name: 'Villeneuve', type: 'town', landmarks: ['Market Square', 'Town Hall'] },
    ],
    items: ['bread', 'apple', 'map'],
    completedQuestTitles: [],
    activeQuestTitles: [],
    timeOfDay: 'morning',
    ...overrides,
  };
}

// ─── Narrative Templates ─────────────────────────────────────────────────────

describe('Narrative Templates', () => {
  it('should have at least 5 narrative arcs', () => {
    const arcIds = Object.keys(NARRATIVE_ARCS);
    expect(arcIds.length).toBeGreaterThanOrEqual(5);
  });

  it('each arc should have valid structure', () => {
    for (const [id, arc] of Object.entries(NARRATIVE_ARCS)) {
      expect(arc.id).toBe(id);
      expect(arc.nameGrammar.origin).toBeDefined();
      expect(arc.descriptionGrammar.origin).toBeDefined();
      expect(arc.stages.length).toBeGreaterThanOrEqual(2);
      expect(arc.completionBonusXP).toBeGreaterThan(0);
      expect(arc.achievement).toBeTruthy();
      expect(arc.requiredBindings.length).toBeGreaterThan(0);
    }
  });

  it('each stage should have valid objectives', () => {
    for (const arc of Object.values(NARRATIVE_ARCS)) {
      for (const stage of arc.stages) {
        expect(stage.stageKey).toBeTruthy();
        expect(stage.objectives.length).toBeGreaterThan(0);
        expect(stage.xpReward).toBeGreaterThan(0);
        expect(stage.tags.length).toBeGreaterThan(0);
        for (const obj of stage.objectives) {
          expect(obj.type).toBeTruthy();
          expect(obj.descriptionTemplate).toBeTruthy();
          expect(obj.requiredCount).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should filter arcs by CEFR level', () => {
    const a1Arcs = getArcsForCefrLevel('A1');
    const b1Arcs = getArcsForCefrLevel('B1');
    // B1 should include all A1 arcs plus any B1-specific ones
    expect(b1Arcs.length).toBeGreaterThanOrEqual(a1Arcs.length);
    // A1 arcs should only include arcs with minCefrLevel A1
    for (const arc of a1Arcs) {
      expect(arc.minCefrLevel).toBe('A1');
    }
  });

  it('should filter arcs by theme', () => {
    const cultural = getArcsByTheme('cultural');
    for (const arc of cultural) {
      expect(arc.theme).toBe('cultural');
    }
  });

  it('should list arc summaries', () => {
    const summaries = listNarrativeArcs();
    expect(summaries.length).toBe(Object.keys(NARRATIVE_ARCS).length);
    for (const s of summaries) {
      expect(s.id).toBeTruthy();
      expect(s.stageCount).toBeGreaterThan(0);
    }
  });
});

// ─── Binding Resolution ──────────────────────────────────────────────────────

describe('resolveBindings', () => {
  it('should resolve settlementName from locations', () => {
    const ctx = makeWorldStateContext();
    const arc = NARRATIVE_ARCS['newcomers-welcome'];
    const bindings = resolveBindings(arc, ctx);
    expect(bindings.settlementName).toBe('Villeneuve');
  });

  it('should assign different NPCs to different placeholders', () => {
    const ctx = makeWorldStateContext();
    const arc = NARRATIVE_ARCS['newcomers-welcome'];
    const bindings = resolveBindings(arc, ctx);

    // Should have bindings for all required NPC placeholders
    const npcBindings = Object.entries(bindings)
      .filter(([k]) => k.endsWith('Name') && k !== 'settlementName' && k !== 'locationName')
      .map(([, v]) => v);

    // All NPC bindings should be unique
    const unique = new Set(npcBindings);
    expect(unique.size).toBe(npcBindings.length);
  });

  it('should prefer occupation-matching NPCs', () => {
    const ctx = makeWorldStateContext();
    const arc = NARRATIVE_ARCS['newcomers-welcome'];
    const bindings = resolveBindings(arc, ctx);

    // elderName should prefer the NPC with occupation 'elder'
    expect(bindings.elderName).toBe('Marie Dupont');
    // merchantName should prefer the NPC with occupation 'merchant'
    expect(bindings.merchantName).toBe('Jean Marchand');
  });

  it('should fallback gracefully with no NPCs', () => {
    const ctx = makeWorldStateContext({ npcs: [] });
    const arc = NARRATIVE_ARCS['newcomers-welcome'];
    const bindings = resolveBindings(arc, ctx);

    // Should still produce bindings (fallback values)
    expect(bindings.settlementName).toBe('Villeneuve');
    expect(bindings.guideName).toBeTruthy();
  });
});

// ─── Main Quest Generation ───────────────────────────────────────────────────

describe('generateMainQuest', () => {
  it('should generate quests for newcomers-welcome arc', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx);

    expect(result.arcId).toBe('newcomers-welcome');
    expect(result.arcName).toBeTruthy();
    expect(result.arcDescription).toBeTruthy();
    expect(result.chainId).toContain('main_newcomers-welcome');
    expect(result.quests).toHaveLength(3);
    expect(result.completionBonusXP).toBe(250);
    expect(result.achievement).toBe('Welcome to Town');
  });

  it('should produce quests with correct structure', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx);

    for (const quest of result.quests) {
      expect(quest.worldId).toBe('world-1');
      expect(quest.title).toBeTruthy();
      expect(quest.description).toBeTruthy();
      expect(quest.questType).toBeTruthy();
      expect(quest.difficulty).toBeTruthy();
      expect(quest.targetLanguage).toBe('French');
      expect(quest.objectives).toBeDefined();
      expect((quest.objectives as any[]).length).toBeGreaterThan(0);
      expect(quest.experienceReward).toBeGreaterThan(0);
      expect(quest.tags).toContain('main-quest');
      expect(quest.questChainId).toBe(result.chainId);
    }
  });

  it('should set chain order correctly', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx);

    result.quests.forEach((quest, i) => {
      expect(quest.questChainOrder).toBe(i);
    });
  });

  it('should set first quest as active and rest as pending', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx);

    expect(result.quests[0].status).toBe('active');
    for (let i = 1; i < result.quests.length; i++) {
      expect(result.quests[i].status).toBe('pending');
    }
  });

  it('should expand NPC names into objective descriptions', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx);

    // The first quest should reference the guide NPC in at least one objective
    const firstQuest = result.quests[0];
    const objectives = firstQuest.objectives as any[];
    const hasNpcReference = objectives.some(
      (o) => ctx.npcs.some((npc) => o.description.includes(npc.name)),
    );
    expect(hasNpcReference).toBe(true);
  });

  it('should expand settlement name into descriptions', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx);

    // Arc description should contain the settlement name
    expect(result.arcDescription).toContain('Villeneuve');
  });

  it('should apply custom bindings', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx, {
      customBindings: { guideName: 'Custom Guide' },
    });

    // The custom guide name should appear in quest content
    const allText = result.quests.map((q) => {
      const objectives = q.objectives as any[];
      return q.description + ' ' + objectives.map((o) => o.description).join(' ');
    }).join(' ');
    expect(allText).toContain('Custom Guide');
  });

  it('should apply assignedTo', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx, {
      assignedTo: 'PlayerOne',
    });

    for (const quest of result.quests) {
      expect(quest.assignedTo).toBe('PlayerOne');
    }
  });

  it('should throw for unknown arc ID', () => {
    const ctx = makeWorldStateContext();
    expect(() => generateMainQuest('nonexistent', ctx)).toThrow('Unknown narrative arc');
  });

  it('should generate all 5 arcs without errors', () => {
    const ctx = makeWorldStateContext();
    for (const arcId of Object.keys(NARRATIVE_ARCS)) {
      const result = generateMainQuest(arcId, ctx);
      expect(result.quests.length).toBeGreaterThanOrEqual(2);
      expect(result.arcName).toBeTruthy();
    }
  });

  it('should include CEFR level and difficulty stars', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuest('newcomers-welcome', ctx);

    for (const quest of result.quests) {
      expect(quest.cefrLevel).toBeTruthy();
      expect(quest.difficultyStars).toBeGreaterThan(0);
      expect(quest.estimatedMinutes).toBeGreaterThan(0);
    }
  });
});

// ─── Arc Selection ───────────────────────────────────────────────────────────

describe('selectBestArc', () => {
  it('should return an arc for A1 level', () => {
    const arc = selectBestArc('A1', []);
    expect(arc).not.toBeNull();
    expect(arc!.minCefrLevel).toBe('A1');
  });

  it('should exclude completed arcs', () => {
    const arc = selectBestArc('A1', ['newcomers-welcome']);
    // Should either return null or a different arc
    if (arc) {
      expect(arc.id).not.toBe('newcomers-welcome');
    }
  });

  it('should prefer higher-level arcs within eligibility', () => {
    const arc = selectBestArc('B1', []);
    expect(arc).not.toBeNull();
    // Should pick B1-level arc over A1
    expect(arc!.minCefrLevel).not.toBe('A1');
  });

  it('should return null when all arcs are completed', () => {
    const allIds = Object.keys(NARRATIVE_ARCS);
    const arc = selectBestArc('B1', allIds);
    expect(arc).toBeNull();
  });
});

// ─── Auto Generation ─────────────────────────────────────────────────────────

describe('generateMainQuestAuto', () => {
  it('should automatically select and generate a quest', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuestAuto(ctx, 'A2', []);

    expect(result).not.toBeNull();
    expect(result!.quests.length).toBeGreaterThanOrEqual(2);
    expect(result!.arcName).toBeTruthy();
  });

  it('should return null when no arcs are available', () => {
    const ctx = makeWorldStateContext();
    const allIds = Object.keys(NARRATIVE_ARCS);
    const result = generateMainQuestAuto(ctx, 'A1', allIds);
    expect(result).toBeNull();
  });

  it('should set assignedTo when provided', () => {
    const ctx = makeWorldStateContext();
    const result = generateMainQuestAuto(ctx, 'A1', [], 'TestPlayer');

    expect(result).not.toBeNull();
    for (const quest of result!.quests) {
      expect(quest.assignedTo).toBe('TestPlayer');
    }
  });
});
