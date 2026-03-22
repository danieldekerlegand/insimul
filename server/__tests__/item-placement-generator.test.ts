/**
 * Tests for item-placement-generator.ts
 *
 * Covers business item rules, residence rules, exterior rules,
 * business exterior rules, and pure utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  BUSINESS_ITEM_RULES,
  RESIDENCE_ITEM_RULES,
  EXTERIOR_ITEM_RULES,
  BUSINESS_EXTERIOR_RULES,
  itemMatchesRules,
  filterByWorldType,
  selectItemsForLocation,
  pickRandom,
  randInt,
  getExteriorLots,
  generateExteriorPosition,
  type ItemRuleSet,
} from '../generators/item-placement-generator';
import type { Item, Lot } from '../../shared/schema';

// ── Mock data factories ─────────────────────────────────────────────────────

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    worldId: null,
    name: 'Test Item',
    description: 'A test item',
    itemType: 'collectible',
    icon: null,
    value: 10,
    sellValue: 5,
    weight: 1,
    tradeable: true,
    stackable: true,
    maxStack: 99,
    worldType: null,
    objectRole: null,
    category: null,
    material: null,
    baseType: null,
    rarity: 'common',
    effects: null,
    lootWeight: 1,
    tags: ['collectible'],
    isBase: true,
    possessable: true,
    metadata: {},
    craftingRecipe: null,
    questRelevance: [],
    loreText: null,
    languageLearningData: null,
    relatedTruthIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Item;
}

function makeLot(overrides: Partial<Lot> = {}): Lot {
  return {
    id: 'lot-1',
    worldId: 'world-1',
    settlementId: 'settlement-1',
    address: '123 Main St',
    houseNumber: 123,
    streetName: 'Main St',
    block: null,
    districtName: null,
    buildingId: null,
    buildingType: 'vacant',
    positionX: 10,
    positionZ: 20,
    facingAngle: 0,
    elevation: 0,
    lotWidth: 12,
    lotDepth: 16,
    streetEdgeId: null,
    distanceAlongStreet: 0,
    side: 'left',
    blockId: null,
    foundationType: 'flat',
    neighboringLotIds: [],
    distanceFromDowntown: 0,
    formerBuildingIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Lot;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Item Placement Generator', () => {
  describe('BUSINESS_ITEM_RULES', () => {
    it('covers all major business types', () => {
      const expectedTypes = [
        'Bakery', 'Restaurant', 'Bar', 'GroceryStore', 'Brewery', 'Butcher',
        'FishMarket', 'Shop', 'JewelryStore', 'BookStore', 'HerbShop', 'PawnShop',
        'Tailor', 'Blacksmith', 'Carpenter', 'Farm', 'Factory', 'Warehouse',
        'Pharmacy', 'Hospital', 'Clinic', 'Barbershop', 'Bathhouse', 'Hotel',
        'Church', 'School', 'University', 'Bank', 'TownHall',
        'Harbor', 'Boatyard', 'Stables', 'PoliceStation', 'FireStation',
      ];
      for (const type of expectedTypes) {
        expect(BUSINESS_ITEM_RULES[type], `Missing rules for ${type}`).toBeDefined();
      }
    });

    it('all rules have valid min <= max', () => {
      for (const [type, rules] of Object.entries(BUSINESS_ITEM_RULES)) {
        expect(rules.min, `${type} min`).toBeGreaterThanOrEqual(1);
        expect(rules.max, `${type} max`).toBeGreaterThanOrEqual(rules.min);
      }
    });

    it('all rules have non-empty tags and itemTypes', () => {
      for (const [type, rules] of Object.entries(BUSINESS_ITEM_RULES)) {
        expect(rules.tags.length, `${type} tags`).toBeGreaterThan(0);
        expect(rules.itemTypes.length, `${type} itemTypes`).toBeGreaterThan(0);
      }
    });

    it('food businesses prioritize food/drink tags', () => {
      const foodBusinesses = ['Bakery', 'Restaurant', 'Bar', 'GroceryStore', 'Butcher', 'FishMarket'];
      for (const type of foodBusinesses) {
        const rules = BUSINESS_ITEM_RULES[type];
        const hasFoodOrDrink = rules.tags.includes('food') || rules.tags.includes('drink');
        expect(hasFoodOrDrink, `${type} should have food/drink tags`).toBe(true);
      }
    });

    it('craft businesses prioritize tool/material tags', () => {
      const craftBusinesses = ['Blacksmith', 'Carpenter', 'Factory'];
      for (const type of craftBusinesses) {
        const rules = BUSINESS_ITEM_RULES[type];
        const hasCraftTags = rules.tags.includes('tool') || rules.tags.includes('material') || rules.tags.includes('crafting');
        expect(hasCraftTags, `${type} should have craft tags`).toBe(true);
      }
    });

    it('Blacksmith can place weapons', () => {
      const rules = BUSINESS_ITEM_RULES['Blacksmith'];
      expect(rules.itemTypes).toContain('weapon');
    });

    it('BookStore uses book-related tags', () => {
      const rules = BUSINESS_ITEM_RULES['BookStore'];
      expect(rules.tags).toContain('book');
    });
  });

  describe('BUSINESS_EXTERIOR_RULES', () => {
    it('covers key businesses that would have outdoor items', () => {
      const expected = ['Bakery', 'Bar', 'Brewery', 'Blacksmith', 'Farm', 'Warehouse', 'Harbor'];
      for (const type of expected) {
        expect(BUSINESS_EXTERIOR_RULES[type], `Missing exterior rules for ${type}`).toBeDefined();
      }
    });

    it('all rules have valid min <= max', () => {
      for (const [type, rules] of Object.entries(BUSINESS_EXTERIOR_RULES)) {
        expect(rules.min, `${type} min`).toBeGreaterThanOrEqual(1);
        expect(rules.max, `${type} max`).toBeGreaterThanOrEqual(rules.min);
      }
    });

    it('exterior rules place fewer items than interior rules', () => {
      for (const [type, extRules] of Object.entries(BUSINESS_EXTERIOR_RULES)) {
        const intRules = BUSINESS_ITEM_RULES[type];
        if (intRules) {
          expect(extRules.max, `${type} exterior max should be <= interior max`).toBeLessThanOrEqual(intRules.max);
        }
      }
    });
  });

  describe('RESIDENCE_ITEM_RULES', () => {
    it('includes household item tags', () => {
      expect(RESIDENCE_ITEM_RULES.tags).toContain('food');
      expect(RESIDENCE_ITEM_RULES.tags).toContain('drink');
      expect(RESIDENCE_ITEM_RULES.tags).toContain('tool');
      expect(RESIDENCE_ITEM_RULES.tags).toContain('book');
      expect(RESIDENCE_ITEM_RULES.tags).toContain('tableware');
    });

    it('places a reasonable number of items', () => {
      expect(RESIDENCE_ITEM_RULES.min).toBeGreaterThanOrEqual(2);
      expect(RESIDENCE_ITEM_RULES.max).toBeLessThanOrEqual(15);
    });
  });

  describe('itemMatchesRules', () => {
    it('matches by tag', () => {
      const item = makeItem({ itemType: 'weapon', tags: ['food'] });
      expect(itemMatchesRules(item, { tags: ['food'], itemTypes: [] })).toBe(true);
    });

    it('matches by itemType', () => {
      const item = makeItem({ itemType: 'weapon', tags: [] });
      expect(itemMatchesRules(item, { tags: [], itemTypes: ['weapon'] })).toBe(true);
    });

    it('returns false when neither matches', () => {
      const item = makeItem({ itemType: 'armor', tags: ['heavy'] });
      expect(itemMatchesRules(item, { tags: ['food'], itemTypes: ['weapon'] })).toBe(false);
    });

    it('handles null tags gracefully', () => {
      const item = makeItem({ tags: null as any });
      expect(itemMatchesRules(item, { tags: ['food'], itemTypes: ['collectible'] })).toBe(true);
    });
  });

  describe('filterByWorldType', () => {
    it('returns all items when worldType is undefined', () => {
      const items = [makeItem({ worldType: 'medieval-fantasy' }), makeItem({ worldType: 'cyberpunk' })];
      expect(filterByWorldType(items, undefined)).toHaveLength(2);
    });

    it('includes items with matching worldType', () => {
      const items = [
        makeItem({ id: '1', worldType: 'medieval-fantasy' }),
        makeItem({ id: '2', worldType: 'cyberpunk' }),
        makeItem({ id: '3', worldType: null }),
      ];
      const filtered = filterByWorldType(items, 'medieval-fantasy');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(i => i.id)).toContain('1');
      expect(filtered.map(i => i.id)).toContain('3');
    });
  });

  describe('pickRandom', () => {
    it('returns empty for empty array', () => {
      expect(pickRandom([], 5)).toHaveLength(0);
    });

    it('returns empty for count <= 0', () => {
      expect(pickRandom([1, 2, 3], 0)).toHaveLength(0);
    });

    it('returns at most count elements', () => {
      expect(pickRandom([1, 2, 3, 4, 5], 3)).toHaveLength(3);
    });

    it('returns all elements when count >= length', () => {
      const result = pickRandom([1, 2, 3], 5);
      expect(result).toHaveLength(3);
    });

    it('does not mutate the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      pickRandom(original, 3);
      expect(original).toEqual(copy);
    });
  });

  describe('randInt', () => {
    it('returns values within range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randInt(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(10);
      }
    });

    it('returns min when min === max', () => {
      expect(randInt(7, 7)).toBe(7);
    });
  });

  describe('selectItemsForLocation', () => {
    const rules: ItemRuleSet = { tags: ['food'], itemTypes: ['food'], min: 2, max: 5 };

    it('selects only matching items', () => {
      const items = [
        makeItem({ id: '1', itemType: 'food', tags: ['food'] }),
        makeItem({ id: '2', itemType: 'weapon', tags: ['weapon'] }),
        makeItem({ id: '3', itemType: 'food', tags: ['food', 'ingredient'] }),
      ];
      const selected = selectItemsForLocation(items, rules);
      for (const item of selected) {
        expect(itemMatchesRules(item, rules)).toBe(true);
      }
    });

    it('returns empty when no items match', () => {
      const items = [makeItem({ itemType: 'weapon', tags: ['weapon'] })];
      expect(selectItemsForLocation(items, rules)).toHaveLength(0);
    });

    it('respects min/max bounds', () => {
      const items = Array.from({ length: 20 }, (_, i) =>
        makeItem({ id: `${i}`, itemType: 'food', tags: ['food'] }),
      );
      for (let trial = 0; trial < 20; trial++) {
        const selected = selectItemsForLocation(items, rules);
        expect(selected.length).toBeGreaterThanOrEqual(rules.min);
        expect(selected.length).toBeLessThanOrEqual(rules.max);
      }
    });

    it('caps count at eligible.length when fewer items than max', () => {
      const items = [
        makeItem({ id: '1', itemType: 'food', tags: ['food'] }),
      ];
      const bigRules: ItemRuleSet = { tags: ['food'], itemTypes: ['food'], min: 1, max: 100 };
      const selected = selectItemsForLocation(items, bigRules);
      expect(selected.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getExteriorLots', () => {
    it('returns only vacant lots', () => {
      const lots = [
        makeLot({ id: 'v1', buildingType: 'vacant' }),
        makeLot({ id: 'b1', buildingType: 'business' }),
        makeLot({ id: 'r1', buildingType: 'residence' }),
        makeLot({ id: 'v2', buildingType: 'vacant' }),
      ];
      const result = getExteriorLots(lots);
      expect(result).toHaveLength(2);
      expect(result.map(l => l.id)).toEqual(['v1', 'v2']);
    });
  });

  describe('generateExteriorPosition', () => {
    it('generates positions within lot bounds', () => {
      const lot = makeLot({ positionX: 50, positionZ: 100, lotWidth: 20, lotDepth: 30 });
      for (let i = 0; i < 50; i++) {
        const pos = generateExteriorPosition(lot);
        expect(pos.x).toBeGreaterThanOrEqual(40);
        expect(pos.x).toBeLessThanOrEqual(60);
        expect(pos.z).toBeGreaterThanOrEqual(85);
        expect(pos.z).toBeLessThanOrEqual(115);
      }
    });
  });

  describe('Business-specific item matching', () => {
    it('Bakery matches food items', () => {
      const rules = BUSINESS_ITEM_RULES['Bakery'];
      const bread = makeItem({ itemType: 'food', tags: ['food', 'baked'] });
      expect(itemMatchesRules(bread, rules)).toBe(true);
    });

    it('Blacksmith matches weapon and tool items', () => {
      const rules = BUSINESS_ITEM_RULES['Blacksmith'];
      const sword = makeItem({ itemType: 'weapon', tags: ['weapon', 'metal'] });
      const hammer = makeItem({ itemType: 'tool', tags: ['tool'] });
      expect(itemMatchesRules(sword, rules)).toBe(true);
      expect(itemMatchesRules(hammer, rules)).toBe(true);
    });

    it('BookStore matches book items but not food', () => {
      const rules = BUSINESS_ITEM_RULES['BookStore'];
      const book = makeItem({ itemType: 'collectible', tags: ['book'] });
      const food = makeItem({ itemType: 'food', tags: ['food'] });
      expect(itemMatchesRules(book, rules)).toBe(true);
      expect(itemMatchesRules(food, rules)).toBe(false);
    });

    it('Hospital matches consumable healing items', () => {
      const rules = BUSINESS_ITEM_RULES['Hospital'];
      const potion = makeItem({ itemType: 'consumable', tags: ['healing'] });
      expect(itemMatchesRules(potion, rules)).toBe(true);
    });

    it('Stables matches food and tool items', () => {
      const rules = BUSINESS_ITEM_RULES['Stables'];
      const hay = makeItem({ itemType: 'food', tags: ['food'] });
      const rope = makeItem({ itemType: 'tool', tags: ['rope'] });
      expect(itemMatchesRules(hay, rules)).toBe(true);
      expect(itemMatchesRules(rope, rules)).toBe(true);
    });
  });
});
