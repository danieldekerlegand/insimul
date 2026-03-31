import { describe, it, expect } from 'vitest';
import {
  generateFullNarrative,
  resolveNarrativeBindings,
  listFullNarrativeTemplates,
} from '../../shared/quests/comprehensive-quest-generator.js';
import {
  THE_STRANGERS_JOURNEY,
  FULL_NARRATIVE_TEMPLATES,
  getAllSubQuests,
  getSubQuestCount,
  getAllVocabularyDomains,
  getChaptersForCefrLevel,
} from '../../shared/quests/full-narrative-template.js';
import type { WorldStateContext } from '../../shared/quests/world-state-context.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<WorldStateContext> = {}): WorldStateContext {
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
      { id: 'npc-4', name: 'Sophie Martin', occupation: 'teacher', personality: 'outgoing', settlementName: 'Villeneuve' },
      { id: 'npc-5', name: 'Luc Berger', occupation: 'farmer', personality: 'curious', settlementName: 'Villeneuve' },
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
      {
        name: "Forgeron's Forge",
        businessType: 'blacksmith',
        ownerName: 'Pierre Forgeron',
        ownerId: 'npc-3',
        settlementName: 'Villeneuve',
        inventory: [],
      },
    ],
    locations: [
      { name: 'Villeneuve', type: 'town', landmarks: ['Market Square', 'Town Hall'] },
      { name: 'Old Quarter', type: 'district', landmarks: ['Fountain'] },
    ],
    items: ['bread', 'apple', 'map', 'candle'],
    completedQuestTitles: [],
    activeQuestTitles: [],
    timeOfDay: 'morning',
    ...overrides,
  };
}

// ─── Template Structure Tests ────────────────────────────────────────────────

describe('Full Narrative Template', () => {
  it('should have the strangers journey template', () => {
    expect(FULL_NARRATIVE_TEMPLATES['the_strangers_journey']).toBeDefined();
  });

  it('should have 3 acts', () => {
    expect(THE_STRANGERS_JOURNEY.acts).toHaveLength(3);
  });

  it('should have correct act types in order', () => {
    expect(THE_STRANGERS_JOURNEY.acts[0].actType).toBe('introduction');
    expect(THE_STRANGERS_JOURNEY.acts[1].actType).toBe('rising_action');
    expect(THE_STRANGERS_JOURNEY.acts[2].actType).toBe('climax_resolution');
  });

  it('should have 6 chapters total', () => {
    const chapterCount = THE_STRANGERS_JOURNEY.acts.reduce(
      (sum, a) => sum + a.chapters.length,
      0,
    );
    expect(chapterCount).toBe(6);
  });

  it('should have 17 subquests total', () => {
    expect(getSubQuestCount(THE_STRANGERS_JOURNEY)).toBe(17);
  });

  it('chapters should have monotonically increasing CEFR levels', () => {
    const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let prevIdx = 0;
    for (const act of THE_STRANGERS_JOURNEY.acts) {
      for (const chapter of act.chapters) {
        const idx = cefrOrder.indexOf(chapter.requiredCefrLevel);
        expect(idx).toBeGreaterThanOrEqual(prevIdx);
        prevIdx = idx;
      }
    }
  });

  it('each chapter should have prerequisite keys pointing to earlier chapters', () => {
    const seenKeys = new Set<string>();
    for (const act of THE_STRANGERS_JOURNEY.acts) {
      for (const chapter of act.chapters) {
        for (const prereq of chapter.prerequisiteChapterKeys) {
          expect(seenKeys.has(prereq)).toBe(true);
        }
        seenKeys.add(chapter.key);
      }
    }
  });

  it('each subquest should have valid structure', () => {
    const subquests = getAllSubQuests(THE_STRANGERS_JOURNEY);
    for (const sq of subquests) {
      expect(sq.key).toBeTruthy();
      expect(sq.title).toBeTruthy();
      expect(sq.description).toBeTruthy();
      expect(sq.questType).toBeTruthy();
      expect(sq.difficulty).toBeTruthy();
      expect(sq.cefrLevel).toMatch(/^[ABC][12]$/);
      expect(sq.estimatedMinutes).toBeGreaterThan(0);
      expect(sq.objectives.length).toBeGreaterThan(0);
      expect(sq.tags).toContain('main-quest');
      for (const obj of sq.objectives) {
        expect(obj.type).toBeTruthy();
        expect(obj.description).toBeTruthy();
        expect(obj.required).toBeGreaterThan(0);
      }
    }
  });

  it('should have unique subquest keys', () => {
    const subquests = getAllSubQuests(THE_STRANGERS_JOURNEY);
    const keys = subquests.map((sq) => sq.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('should require 4 archetypes', () => {
    expect(THE_STRANGERS_JOURNEY.requiredArchetypes).toEqual(
      expect.arrayContaining(['guide', 'merchant', 'elder', 'craftsman']),
    );
  });
});

describe('getAllVocabularyDomains', () => {
  it('should return unique domains across all chapters', () => {
    const domains = getAllVocabularyDomains(THE_STRANGERS_JOURNEY);
    expect(domains.length).toBeGreaterThan(5);
    expect(new Set(domains).size).toBe(domains.length);
  });
});

describe('getChaptersForCefrLevel', () => {
  it('A1 returns only A1 chapters', () => {
    const chapters = getChaptersForCefrLevel(THE_STRANGERS_JOURNEY, 'A1');
    expect(chapters.length).toBe(2);
    for (const ch of chapters) {
      expect(ch.requiredCefrLevel).toBe('A1');
    }
  });

  it('B2 returns all chapters', () => {
    const chapters = getChaptersForCefrLevel(THE_STRANGERS_JOURNEY, 'B2');
    expect(chapters.length).toBe(6);
  });

  it('A2 returns A1 and A2 chapters', () => {
    const chapters = getChaptersForCefrLevel(THE_STRANGERS_JOURNEY, 'A2');
    expect(chapters.length).toBe(4);
  });
});

// ─── Binding Resolution ──────────────────────────────────────────────────────

describe('resolveNarrativeBindings', () => {
  it('should resolve settlement name from locations', () => {
    const ctx = makeCtx();
    const bindings = resolveNarrativeBindings(THE_STRANGERS_JOURNEY, ctx);
    expect(bindings.settlementName).toBe('Villeneuve');
  });

  it('should assign different NPCs to different archetypes', () => {
    const ctx = makeCtx();
    const bindings = resolveNarrativeBindings(THE_STRANGERS_JOURNEY, ctx);
    const npcNames = [bindings.guide, bindings.merchant, bindings.elder, bindings.craftsman];
    const unique = new Set(npcNames);
    expect(unique.size).toBe(4);
  });

  it('should prefer occupation-matching NPCs', () => {
    const ctx = makeCtx();
    const bindings = resolveNarrativeBindings(THE_STRANGERS_JOURNEY, ctx);
    expect(bindings.elder).toBe('Marie Dupont');
    expect(bindings.merchant).toBe('Jean Marchand');
  });

  it('should resolve market and workshop names from businesses', () => {
    const ctx = makeCtx();
    const bindings = resolveNarrativeBindings(THE_STRANGERS_JOURNEY, ctx);
    expect(bindings.marketName).toBe("Marchand's Goods");
    expect(bindings.workshopName).toBe("Forgeron's Forge");
  });

  it('should fallback gracefully with empty world state', () => {
    const ctx = makeCtx({ npcs: [], businesses: [], locations: [], items: [] });
    const bindings = resolveNarrativeBindings(THE_STRANGERS_JOURNEY, ctx);
    expect(bindings.settlementName).toBe('the settlement');
    expect(bindings.guide).toBeTruthy();
    expect(bindings.merchant).toBeTruthy();
  });
});

// ─── Full Narrative Generation ───────────────────────────────────────────────

describe('generateFullNarrative', () => {
  it('should generate a complete narrative from the template', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    expect(result.templateId).toBe('the_strangers_journey');
    expect(result.name).toBe("The Stranger's Journey");
    expect(result.targetLanguage).toBe('French');
    expect(result.acts).toHaveLength(3);
    expect(result.totalQuestCount).toBe(17);
    expect(result.estimatedMinutes).toBeGreaterThan(0);
  });

  it('should produce quests with valid structure', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    for (const quest of result.allQuests) {
      expect(quest.worldId).toBe('world-1');
      expect(quest.title).toBeTruthy();
      expect(quest.description).toBeTruthy();
      expect(quest.questType).toBeTruthy();
      expect(quest.difficulty).toBeTruthy();
      expect(quest.targetLanguage).toBe('French');
      expect((quest.objectives as any[]).length).toBeGreaterThan(0);
      expect(quest.experienceReward).toBeGreaterThan(0);
      expect(quest.tags).toContain('main-quest');
      expect(quest.questChainId).toBeTruthy();
      expect(quest.questChainOrder).toBeGreaterThanOrEqual(0);
      expect(quest.cefrLevel).toBeTruthy();
      expect(quest.difficultyStars).toBeGreaterThan(0);
    }
  });

  it('should set first quest as active and rest as pending', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    expect(result.allQuests[0].status).toBe('active');
    for (let i = 1; i < result.allQuests.length; i++) {
      expect(result.allQuests[i].status).toBe('pending');
    }
  });

  it('should group quests into chapters with chain IDs', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    const chainIds = new Set<string>();
    for (const act of result.acts) {
      for (const chapter of act.chapters) {
        expect(chapter.quests.length).toBeGreaterThan(0);
        chainIds.add(chapter.questChainId);
        for (const quest of chapter.quests) {
          expect(quest.questChainId).toBe(chapter.questChainId);
        }
      }
    }
    // Each chapter should have a unique chain ID
    expect(chainIds.size).toBe(6);
  });

  it('should include narrative arc tags on quests', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    for (const quest of result.allQuests) {
      const tags = quest.tags as string[];
      expect(tags.some((t) => t.startsWith('narrative_arc:'))).toBe(true);
      expect(tags.some((t) => t.startsWith('arc_act:'))).toBe(true);
      expect(tags.some((t) => t.startsWith('arc_chapter:'))).toBe(true);
    }
  });

  it('should resolve NPC names in objective descriptions', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    // First quest objectives should reference the guide NPC
    const firstQuest = result.allQuests[0];
    const objectives = firstQuest.objectives as any[];
    const guideObj = objectives.find((o) => o.type === 'talk_to_npc');
    expect(guideObj).toBeDefined();
    // The target should be a real NPC name, not a placeholder
    expect(guideObj.target).not.toBe('guide');
    const npcNames = ctx.npcs.map((n) => n.name);
    expect(npcNames).toContain(guideObj.target);
  });

  it('should apply assignedTo to all quests', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx, {
      assignedTo: 'TestPlayer',
    });

    for (const quest of result.allQuests) {
      expect(quest.assignedTo).toBe('TestPlayer');
    }
  });

  it('should apply custom bindings', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx, {
      customBindings: { guide: 'Custom Guide Name' },
    });

    expect(result.bindings.guide).toBe('Custom Guide Name');
  });

  it('should throw for unknown template ID', () => {
    const ctx = makeCtx();
    expect(() => generateFullNarrative('nonexistent', ctx)).toThrow(
      'Unknown narrative template',
    );
  });

  it('should have increasing XP rewards as quests progress', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    // Later quests should generally have equal or higher XP than earlier ones
    const xpValues = result.allQuests.map((q) => q.experienceReward as number);
    expect(xpValues[xpValues.length - 1]).toBeGreaterThan(xpValues[0]);
  });

  it('should produce correct chapter structure per act', () => {
    const ctx = makeCtx();
    const result = generateFullNarrative('the_strangers_journey', ctx);

    expect(result.acts[0].chapters).toHaveLength(2); // Act I
    expect(result.acts[1].chapters).toHaveLength(2); // Act II
    expect(result.acts[2].chapters).toHaveLength(2); // Act III
  });

  it('should handle minimal world state gracefully', () => {
    const ctx = makeCtx({
      npcs: [{ id: 'npc-1', name: 'Solo NPC', occupation: 'resident', personality: 'friendly', settlementName: 'Town' }],
      businesses: [],
      locations: [{ name: 'Town', type: 'village', landmarks: [] }],
      items: [],
    });

    const result = generateFullNarrative('the_strangers_journey', ctx);
    expect(result.totalQuestCount).toBe(17);
    // Should still generate valid quests even with minimal state
    for (const quest of result.allQuests) {
      expect(quest.title).toBeTruthy();
      expect((quest.objectives as any[]).length).toBeGreaterThan(0);
    }
  });
});

// ─── Template Listing ────────────────────────────────────────────────────────

describe('listFullNarrativeTemplates', () => {
  it('should return template summaries', () => {
    const templates = listFullNarrativeTemplates();
    expect(templates.length).toBeGreaterThan(0);

    const first = templates[0];
    expect(first.id).toBeTruthy();
    expect(first.name).toBeTruthy();
    expect(first.actCount).toBe(3);
    expect(first.chapterCount).toBe(6);
    expect(first.questCount).toBe(17);
    expect(first.estimatedHours).toBeGreaterThan(0);
    expect(first.requiredArchetypes.length).toBeGreaterThan(0);
  });
});
