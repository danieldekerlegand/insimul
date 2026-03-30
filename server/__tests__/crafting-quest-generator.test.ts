import { describe, it, expect } from 'vitest';
import {
  generateCraftingQuests,
  getCraftingStations,
  getStationVocab,
  meetsLanguageRequirement,
  type CraftingQuestOptions,
  type CraftableItemInfo,
} from '../services/crafting-quest-generator';
import type { Character, World } from '../../shared/schema';

// ── Test fixtures ────────────────────────────────────────────────────────────

const MOCK_WORLD: World = {
  id: 'world-1',
  name: 'Test World',
  targetLanguage: 'French',
  description: 'A test world',
  worldType: 'village',
  userId: 'user-1',
} as World;

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: `char-${Math.random().toString(36).slice(2, 8)}`,
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'active',
    worldId: 'world-1',
    ...overrides,
  } as Character;
}

function makeItem(overrides: Partial<CraftableItemInfo> = {}): CraftableItemInfo {
  return {
    id: `item-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Iron Sword',
    itemType: 'weapon',
    category: 'melee_weapon',
    material: 'iron',
    craftingRecipe: null,
    translations: null,
    ...overrides,
  };
}

const SAMPLE_CHARACTERS: Character[] = [
  makeCharacter({ id: 'char-1', firstName: 'Marie', lastName: 'Forge' }),
  makeCharacter({ id: 'char-2', firstName: 'Pierre', lastName: 'Artisan' }),
  makeCharacter({ id: 'char-3', firstName: 'Luc', lastName: 'Merchant' }),
];

const SAMPLE_ITEMS: CraftableItemInfo[] = [
  makeItem({ id: 'item-1', name: 'Iron Sword', itemType: 'weapon', material: 'iron', craftingRecipe: {
    ingredients: [{ itemId: 'item-iron', quantity: 2 }, { itemId: 'item-wood', quantity: 1 }],
    craftTime: 30, requiredLevel: 1, requiredStation: 'forge',
  }}),
  makeItem({ id: 'item-2', name: 'Wooden Shield', itemType: 'armor', material: 'wood', craftingRecipe: {
    ingredients: [{ itemId: 'item-wood', quantity: 3 }],
    craftTime: 20, requiredLevel: 1, requiredStation: 'workbench',
  }}),
  makeItem({ id: 'item-iron', name: 'Iron Ore', itemType: 'material', material: 'iron' }),
  makeItem({ id: 'item-wood', name: 'Wood Plank', itemType: 'material', material: 'wood' }),
  makeItem({ id: 'item-hammer', name: 'Hammer', itemType: 'tool' }),
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('crafting-quest-generator', () => {
  describe('generateCraftingQuests', () => {
    it('generates A1 quests for beginners', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'A1',
      });

      expect(quests.length).toBe(3); // material ID, tool naming, simple craft
      for (const quest of quests) {
        expect(quest.cefrLevel).toBe('A1');
      }
    });

    it('generates A1 + A2 quests at A2 level', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'A2',
      });

      const a1Quests = quests.filter(q => q.cefrLevel === 'A1');
      const a2Quests = quests.filter(q => q.cefrLevel === 'A2');

      expect(a1Quests.length).toBe(3);
      expect(a2Quests.length).toBe(2); // apprentice + gather-and-craft
    });

    it('generates up to B1 quests at B1 level', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B1',
      });

      const b1Quests = quests.filter(q => q.cefrLevel === 'B1');
      expect(b1Quests.length).toBeGreaterThan(0);
    });

    it('generates B2 quests only at B2 level', () => {
      const questsB1 = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B1',
      });

      const questsB2 = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      const b2InB1 = questsB1.filter(q => q.cefrLevel === 'B2');
      const b2InB2 = questsB2.filter(q => q.cefrLevel === 'B2');

      expect(b2InB1.length).toBe(0);
      expect(b2InB2.length).toBeGreaterThan(0);
    });

    it('all quests have required fields', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      for (const quest of quests) {
        expect(quest.worldId).toBe('world-1');
        expect(quest.title).toBeTruthy();
        expect(quest.description).toBeTruthy();
        expect(quest.questType).toBeTruthy();
        expect(quest.difficulty).toBeTruthy();
        expect(quest.cefrLevel).toBeTruthy();
        expect(quest.targetLanguage).toBe('French');
        expect(quest.assignedTo).toBe('Player');
        expect(quest.status).toBe('active');
        expect(quest.objectives).toBeDefined();
        expect((quest.objectives as any[]).length).toBeGreaterThan(0);
        expect(quest.experienceReward).toBeGreaterThan(0);
        expect(quest.tags).toBeDefined();
        expect(quest.tags!.length).toBeGreaterThan(0);
      }
    });

    it('tags all quests with crafting', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
      });

      for (const quest of quests) {
        expect(quest.tags).toContain('crafting');
      }
    });

    it('generates Prolog content for quests', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
      });

      for (const quest of quests) {
        expect((quest as any).content).toBeTruthy();
        expect((quest as any).content).toContain('quest(');
      }
    });

    it('respects maxQuests option', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        maxQuests: 2,
      });

      expect(quests.length).toBeLessThanOrEqual(2);
    });

    it('works with custom assignedTo', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        assignedTo: 'Custom Player',
      });

      for (const quest of quests) {
        expect(quest.assignedTo).toBe('Custom Player');
      }
    });

    it('generates quests even with no items', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: [],
      });

      // A1 quests use station vocabulary, not item data directly
      expect(quests.length).toBeGreaterThan(0);
    });

    it('skips NPC-dependent quests when no characters provided', () => {
      const questsNoNPCs = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: [],
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      const questsWithNPCs = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      // With no NPCs, A2/B1/B2 quests that require NPCs are skipped
      expect(questsNoNPCs.length).toBeLessThan(questsWithNPCs.length);
    });

    it('includes craft_item objectives in crafting quests', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      const questsWithCraftObj = quests.filter(q =>
        (q.objectives as any[]).some(o => o.type === 'craft_item'),
      );

      // Most crafting quests should have a craft_item objective
      expect(questsWithCraftObj.length).toBeGreaterThan(0);
    });

    it('includes vocabulary objectives in all quests', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      const vocabObjectiveTypes = new Set([
        'use_vocabulary', 'collect_vocabulary', 'identify_object',
        'examine_object', 'point_and_name', 'read_sign', 'translation_challenge',
      ]);

      for (const quest of quests) {
        const hasVocab = (quest.objectives as any[]).some(o => vocabObjectiveTypes.has(o.type));
        expect(hasVocab).toBe(true);
      }
    });

    it('quest difficulty scales with CEFR level', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      const a1Quest = quests.find(q => q.cefrLevel === 'A1');
      const b2Quest = quests.find(q => q.cefrLevel === 'B2');

      expect(a1Quest).toBeDefined();
      expect(b2Quest).toBeDefined();
      expect(a1Quest!.experienceReward!).toBeLessThan(b2Quest!.experienceReward!);
    });

    it('defaults to A1 when no CEFR level specified', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
      });

      // Only A1 quests should be generated
      for (const quest of quests) {
        expect(quest.cefrLevel).toBe('A1');
      }
    });

    it('uses world targetLanguage in quest descriptions', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
      });

      const allDescriptions = quests.map(q => q.description).join(' ');
      expect(allDescriptions).toContain('French');
    });

    it('B1 recipe translation quest includes translation_challenge objective', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B1',
      });

      const recipeQuest = quests.find(q => q.title === 'The Ancient Recipe');
      expect(recipeQuest).toBeDefined();

      const translationObj = (recipeQuest!.objectives as any[]).find(o => o.type === 'translation_challenge');
      expect(translationObj).toBeDefined();
      expect(translationObj.requiredCount).toBe(3);
    });

    it('B2 master crafter quest includes haggle_price objective', () => {
      const quests = generateCraftingQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        items: SAMPLE_ITEMS,
        playerCefrLevel: 'B2',
      });

      const masterQuest = quests.find(q => q.title === "The Master's Commission");
      expect(masterQuest).toBeDefined();

      const haggleObj = (masterQuest!.objectives as any[]).find(o => o.type === 'haggle_price');
      expect(haggleObj).toBeDefined();
    });
  });

  describe('getCraftingStations', () => {
    it('returns all station types', () => {
      const stations = getCraftingStations();
      expect(stations.length).toBeGreaterThan(0);
      expect(stations).toContain('forge');
      expect(stations).toContain('workbench');
      expect(stations).toContain('loom');
      expect(stations).toContain('kitchen');
      expect(stations).toContain('alchemy_table');
    });
  });

  describe('getStationVocab', () => {
    it('returns vocabulary for forge', () => {
      const vocab = getStationVocab('forge');
      expect(vocab).not.toBeNull();
      expect(vocab!.tools).toContain('hammer');
      expect(vocab!.materials).toContain('iron');
      expect(vocab!.actions).toContain('strike');
    });

    it('returns vocabulary for kitchen', () => {
      const vocab = getStationVocab('kitchen');
      expect(vocab).not.toBeNull();
      expect(vocab!.tools).toContain('knife');
      expect(vocab!.materials).toContain('flour');
      expect(vocab!.actions).toContain('cook');
    });

    it('returns null for unknown station', () => {
      const vocab = getStationVocab('unknown_station');
      expect(vocab).toBeNull();
    });
  });

  describe('meetsLanguageRequirement', () => {
    it('A1 meets A1', () => {
      expect(meetsLanguageRequirement('A1', 'A1')).toBe(true);
    });

    it('A1 does not meet A2', () => {
      expect(meetsLanguageRequirement('A1', 'A2')).toBe(false);
    });

    it('B2 meets all levels', () => {
      expect(meetsLanguageRequirement('B2', 'A1')).toBe(true);
      expect(meetsLanguageRequirement('B2', 'A2')).toBe(true);
      expect(meetsLanguageRequirement('B2', 'B1')).toBe(true);
      expect(meetsLanguageRequirement('B2', 'B2')).toBe(true);
    });

    it('B1 meets up to B1 but not B2', () => {
      expect(meetsLanguageRequirement('B1', 'A1')).toBe(true);
      expect(meetsLanguageRequirement('B1', 'B1')).toBe(true);
      expect(meetsLanguageRequirement('B1', 'B2')).toBe(false);
    });
  });
});
