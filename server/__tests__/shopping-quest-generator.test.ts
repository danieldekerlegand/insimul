import { describe, it, expect } from 'vitest';
import {
  generateShoppingQuests,
  getShoppableBusinessTypes,
  getBusinessVocabularyCategories,
  getBusinessItems,
  type BusinessInfo,
  type ShoppingQuestOptions,
} from '../../shared/quests/shopping-quest-generator.js';
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

function makeBusiness(overrides: Partial<BusinessInfo> = {}): BusinessInfo {
  return {
    id: `biz-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Test Shop',
    businessType: 'Shop',
    ownerId: null,
    isOutOfBusiness: false,
    ...overrides,
  };
}

const SAMPLE_BUSINESSES: BusinessInfo[] = [
  makeBusiness({ id: 'biz-1', name: "Marie's Bakery", businessType: 'Bakery', ownerId: 'char-marie' }),
  makeBusiness({ id: 'biz-2', name: 'Town Grocery', businessType: 'GroceryStore', ownerId: 'char-pierre' }),
  makeBusiness({ id: 'biz-3', name: "Luc's Restaurant", businessType: 'Restaurant', ownerId: 'char-luc' }),
  makeBusiness({ id: 'biz-4', name: 'Harbor Fish Market', businessType: 'FishMarket' }),
  makeBusiness({ id: 'biz-5', name: 'Village Pharmacy', businessType: 'Pharmacy', ownerId: 'char-anne' }),
];

const SAMPLE_CHARACTERS: Character[] = [
  makeCharacter({ id: 'char-marie', firstName: 'Marie', lastName: 'Boulanger' }),
  makeCharacter({ id: 'char-pierre', firstName: 'Pierre', lastName: 'Marchand' }),
  makeCharacter({ id: 'char-luc', firstName: 'Luc', lastName: 'Cuisinier' }),
  makeCharacter({ id: 'char-anne', firstName: 'Anne', lastName: 'Pharmacien' }),
  makeCharacter({ id: 'char-extra', firstName: 'Claude', lastName: 'Villager' }),
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('shopping-quest-generator', () => {
  describe('generateShoppingQuests', () => {
    it('generates quests when businesses exist', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      expect(quests.length).toBeGreaterThan(0);
    });

    it('returns empty array when no businesses exist', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: [],
        characters: SAMPLE_CHARACTERS,
      });

      expect(quests).toEqual([]);
    });

    it('skips out-of-business businesses', () => {
      const closedBusinesses = SAMPLE_BUSINESSES.map(b => ({
        ...b,
        isOutOfBusiness: true,
      }));

      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: closedBusinesses,
        characters: SAMPLE_CHARACTERS,
      });

      expect(quests).toEqual([]);
    });

    it('skips non-shoppable business types', () => {
      const nonShoppable = [
        makeBusiness({ businessType: 'Church' }),
        makeBusiness({ businessType: 'PoliceStation' }),
        makeBusiness({ businessType: 'TownHall' }),
      ];

      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: nonShoppable,
        characters: SAMPLE_CHARACTERS,
      });

      expect(quests).toEqual([]);
    });

    it('all quests have required fields', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      for (const quest of quests) {
        expect(quest.worldId).toBe('world-1');
        expect(quest.title).toBeTruthy();
        expect(quest.description).toBeTruthy();
        expect(quest.questType).toBeTruthy();
        expect(quest.difficulty).toBeTruthy();
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

    it('tags all quests with shopping and business', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      for (const quest of quests) {
        expect(quest.tags).toContain('shopping');
        expect(quest.tags).toContain('business');
      }
    });

    it('uses real business names in quest titles and descriptions', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      // At least one quest should reference a real business name
      const allText = quests.map(q => `${q.title} ${q.description}`).join(' ');
      const hasBusinessName = SAMPLE_BUSINESSES.some(b => allText.includes(b.name));
      expect(hasBusinessName).toBe(true);
    });

    it('assigns quests to business owners when available', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      // At least some quests should have assignedBy from a business owner
      const ownerNames = SAMPLE_CHARACTERS.map(c => `${c.firstName} ${c.lastName}`);
      const hasOwnerAssignment = quests.some(q => q.assignedBy && ownerNames.includes(q.assignedBy));
      expect(hasOwnerAssignment).toBe(true);
    });

    it('generates Prolog content for quests', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      for (const quest of quests) {
        expect((quest as any).content).toBeTruthy();
        expect((quest as any).content).toContain('quest(');
      }
    });

    it('respects maxQuests option', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
        maxQuests: 2,
      });

      expect(quests.length).toBeLessThanOrEqual(2);
    });

    it('generates ordering quest for food businesses', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: [makeBusiness({ name: 'Le Pain', businessType: 'Bakery', ownerId: 'char-marie' })],
        characters: SAMPLE_CHARACTERS,
      });

      const orderingQuest = quests.find(q => q.title.includes('Ordering'));
      expect(orderingQuest).toBeDefined();
      expect(orderingQuest!.title).toContain('Le Pain');
    });

    it('generates price quest', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const priceQuest = quests.find(q => q.title.includes('Prices'));
      expect(priceQuest).toBeDefined();
      expect(priceQuest!.difficulty).toBe('intermediate');
    });

    it('generates errands quest when 2+ businesses exist', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const errandsQuest = quests.find(q => q.title.includes('Errands'));
      expect(errandsQuest).toBeDefined();
      expect(errandsQuest!.questType).toBe('delivery');
    });

    it('generates merchant interview quest when businesses have owners', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const merchantQuest = quests.find(q => q.title.includes('Merchants'));
      expect(merchantQuest).toBeDefined();
    });

    it('works with custom assignedTo', () => {
      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
        assignedTo: 'Custom Player',
      });

      for (const quest of quests) {
        expect(quest.assignedTo).toBe('Custom Player');
      }
    });

    it('handles businesses without owners gracefully', () => {
      const ownerlessBiz = [
        makeBusiness({ name: 'Empty Shop', businessType: 'Shop' }),
        makeBusiness({ name: 'No-Owner Bakery', businessType: 'Bakery' }),
      ];

      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: ownerlessBiz,
        characters: [],
      });

      expect(quests.length).toBeGreaterThan(0);
      // Quests should still be valid without owner assignments
      for (const quest of quests) {
        expect(quest.title).toBeTruthy();
        expect(quest.objectives).toBeDefined();
      }
    });

    it('deduplicates shop vocab quests by business type', () => {
      const duplicateTypeBiz = [
        makeBusiness({ id: 'b1', name: 'Shop A', businessType: 'Bakery' }),
        makeBusiness({ id: 'b2', name: 'Shop B', businessType: 'Bakery' }),
        makeBusiness({ id: 'b3', name: 'Shop C', businessType: 'Bakery' }),
      ];

      const quests = generateShoppingQuests({
        world: MOCK_WORLD,
        businesses: duplicateTypeBiz,
        characters: [],
      });

      const shopVocabQuests = quests.filter(q => q.title.startsWith('Shopping at'));
      // Should only have 1 shop vocab quest for Bakery type
      expect(shopVocabQuests.length).toBe(1);
    });
  });

  describe('getShoppableBusinessTypes', () => {
    it('returns an array of business types', () => {
      const types = getShoppableBusinessTypes();
      expect(types.length).toBeGreaterThan(0);
      expect(types).toContain('GroceryStore');
      expect(types).toContain('Bakery');
      expect(types).toContain('Restaurant');
      expect(types).toContain('Shop');
    });

    it('does not include non-commercial businesses', () => {
      const types = getShoppableBusinessTypes();
      expect(types).not.toContain('Church');
      expect(types).not.toContain('PoliceStation');
      expect(types).not.toContain('TownHall');
    });
  });

  describe('getBusinessVocabularyCategories', () => {
    it('returns categories for known business types', () => {
      const categories = getBusinessVocabularyCategories('GroceryStore');
      expect(categories).toContain('food');
      expect(categories).toContain('shopping');
    });

    it('returns default shopping for unknown types', () => {
      const categories = getBusinessVocabularyCategories('UnknownType');
      expect(categories).toEqual(['shopping']);
    });

    it('bakery has food category', () => {
      const categories = getBusinessVocabularyCategories('Bakery');
      expect(categories).toContain('food');
      expect(categories).toContain('shopping');
    });
  });

  describe('getBusinessItems', () => {
    it('returns items for grocery store', () => {
      const items = getBusinessItems('GroceryStore');
      expect(items.length).toBeGreaterThan(0);
      expect(items).toContain('bread');
      expect(items).toContain('milk');
    });

    it('returns empty for unknown business type', () => {
      const items = getBusinessItems('UnknownType');
      expect(items).toEqual([]);
    });
  });
});
