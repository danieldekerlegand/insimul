import { describe, it, expect } from 'vitest';
import {
  generateNumberPracticeQuests,
  getNumberQuestBusinessTypes,
  getEligibleNumberQuests,
  type BusinessInfo,
  type NumberQuestOptions,
} from '../../shared/quests/number-practice-quest-generator.js';
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

describe('number-practice-quest-generator', () => {
  describe('generateNumberPracticeQuests', () => {
    it('generates quests when businesses exist', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      expect(quests.length).toBeGreaterThan(0);
    });

    it('returns empty array when no businesses exist', () => {
      const quests = generateNumberPracticeQuests({
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

      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: closedBusinesses,
        characters: SAMPLE_CHARACTERS,
      });

      expect(quests).toEqual([]);
    });

    it('skips non-commercial business types', () => {
      const nonCommercial = [
        makeBusiness({ businessType: 'Church' }),
        makeBusiness({ businessType: 'PoliceStation' }),
        makeBusiness({ businessType: 'TownHall' }),
      ];

      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: nonCommercial,
        characters: SAMPLE_CHARACTERS,
      });

      expect(quests).toEqual([]);
    });

    it('all quests have required fields', () => {
      const quests = generateNumberPracticeQuests({
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

    it('tags all quests with numbers', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      for (const quest of quests) {
        expect(quest.tags).toContain('numbers');
      }
    });

    it('uses real business names in quest titles and descriptions', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const allText = quests.map(q => `${q.title} ${q.description}`).join(' ');
      const hasBusinessName = SAMPLE_BUSINESSES.some(b => allText.includes(b.name));
      expect(hasBusinessName).toBe(true);
    });

    it('assigns quests to business owners when available', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const ownerNames = SAMPLE_CHARACTERS.map(c => `${c.firstName} ${c.lastName}`);
      const hasOwnerAssignment = quests.some(q => q.assignedBy && ownerNames.includes(q.assignedBy));
      expect(hasOwnerAssignment).toBe(true);
    });

    it('generates Prolog content for quests', () => {
      const quests = generateNumberPracticeQuests({
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
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
        maxQuests: 2,
      });

      expect(quests.length).toBeLessThanOrEqual(2);
    });

    it('works with custom assignedTo', () => {
      const quests = generateNumberPracticeQuests({
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

      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: ownerlessBiz,
        characters: [],
      });

      // Should still generate inventory count quests (don't need NPCs)
      expect(quests.length).toBeGreaterThan(0);
      for (const quest of quests) {
        expect(quest.title).toBeTruthy();
        expect(quest.objectives).toBeDefined();
      }
    });

    it('deduplicates inventory count quests by business type', () => {
      const duplicateTypeBiz = [
        makeBusiness({ id: 'b1', name: 'Shop A', businessType: 'Bakery' }),
        makeBusiness({ id: 'b2', name: 'Shop B', businessType: 'Bakery' }),
        makeBusiness({ id: 'b3', name: 'Shop C', businessType: 'Bakery' }),
      ];

      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: duplicateTypeBiz,
        characters: [],
      });

      const countQuests = quests.filter(q => q.title.startsWith('Counting at'));
      expect(countQuests.length).toBe(1);
    });

    it('generates inventory count quest (beginner)', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const countQuest = quests.find(q => q.title.includes('Counting'));
      expect(countQuest).toBeDefined();
      expect(countQuest!.difficulty).toBe('beginner');
      expect(countQuest!.tags).toContain('counting');
    });

    it('generates price comparison quest when 2+ businesses exist', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const comparisonQuest = quests.find(q => q.title.includes('Best Deal'));
      expect(comparisonQuest).toBeDefined();
      expect(comparisonQuest!.tags).toContain('comparison');
    });

    it('generates make change quest', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const changeQuest = quests.find(q => q.title.includes('Making Change'));
      expect(changeQuest).toBeDefined();
      expect(changeQuest!.tags).toContain('arithmetic');
    });

    it('generates house numbers quest', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const houseQuest = quests.find(q => q.title.includes('Address'));
      expect(houseQuest).toBeDefined();
      expect(houseQuest!.difficulty).toBe('beginner');
      expect(houseQuest!.tags).toContain('navigation');
    });

    it('generates time meeting quest', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const timeQuest = quests.find(q => q.title.includes('on Time'));
      expect(timeQuest).toBeDefined();
      expect(timeQuest!.tags).toContain('time');
    });

    it('generates large numbers quest', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const largeQuest = quests.find(q => q.title.includes('Big Numbers'));
      expect(largeQuest).toBeDefined();
      expect(largeQuest!.difficulty).toBe('advanced');
      expect(largeQuest!.tags).toContain('ordinals');
    });
  });

  describe('CEFR level filtering', () => {
    it('A1 generates only beginner quests (counting + house numbers)', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
        cefrLevel: 'A1',
      });

      // Should have inventory count quests and house numbers, but NOT prices/change/time/comparison/large
      expect(quests.length).toBeGreaterThan(0);
      for (const quest of quests) {
        expect(quest.difficulty).toBe('beginner');
      }
      expect(quests.some(q => q.title.includes('Making Change'))).toBe(false);
      expect(quests.some(q => q.title.includes('Big Numbers'))).toBe(false);
      expect(quests.some(q => q.title.includes('Best Deal'))).toBe(false);
    });

    it('A2 adds intermediate number quests', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
        cefrLevel: 'A2',
      });

      // Should have A1 quests plus prices, change, and time
      expect(quests.some(q => q.title.includes('Counting'))).toBe(true);
      expect(quests.some(q => q.title.includes('Prices'))).toBe(true);
      // Should NOT have large numbers or price comparison
      expect(quests.some(q => q.title.includes('Big Numbers'))).toBe(false);
      expect(quests.some(q => q.title.includes('Best Deal'))).toBe(false);
    });

    it('B1 adds advanced quests including price comparison and large numbers', () => {
      const quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
        cefrLevel: 'B1',
      });

      expect(quests.some(q => q.title.includes('Big Numbers'))).toBe(true);
      expect(quests.some(q => q.title.includes('Best Deal'))).toBe(true);
    });

    it('default (no cefrLevel) generates B1-level quests', () => {
      const defaultQuests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
      });

      const b1Quests = generateNumberPracticeQuests({
        world: MOCK_WORLD,
        businesses: SAMPLE_BUSINESSES,
        characters: SAMPLE_CHARACTERS,
        cefrLevel: 'B1',
      });

      // Both should generate the same number of quest types
      expect(defaultQuests.length).toBe(b1Quests.length);
    });
  });

  describe('getNumberQuestBusinessTypes', () => {
    it('returns an array of business types', () => {
      const types = getNumberQuestBusinessTypes();
      expect(types.length).toBeGreaterThan(0);
      expect(types).toContain('GroceryStore');
      expect(types).toContain('Bakery');
      expect(types).toContain('Restaurant');
      expect(types).toContain('Shop');
    });

    it('does not include non-commercial businesses', () => {
      const types = getNumberQuestBusinessTypes();
      expect(types).not.toContain('Church');
      expect(types).not.toContain('PoliceStation');
      expect(types).not.toContain('TownHall');
    });
  });

  describe('getEligibleNumberQuests', () => {
    it('A1 returns only beginner quest types', () => {
      const types = getEligibleNumberQuests('A1');
      expect(types).toContain('inventory_count');
      expect(types).toContain('house_numbers');
      expect(types).not.toContain('market_prices');
      expect(types).not.toContain('large_numbers');
    });

    it('B1 includes all quest types', () => {
      const types = getEligibleNumberQuests('B1');
      expect(types).toContain('inventory_count');
      expect(types).toContain('market_prices');
      expect(types).toContain('make_change');
      expect(types).toContain('price_comparison');
      expect(types).toContain('large_numbers');
    });

    it('defaults to B1 for unknown level', () => {
      const defaultTypes = getEligibleNumberQuests();
      const b1Types = getEligibleNumberQuests('B1');
      expect(defaultTypes).toEqual(b1Types);
    });
  });
});
