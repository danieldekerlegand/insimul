/**
 * Tests for Migration 026: Expand Base Item Catalog with New Categories
 *
 * Validates that all new items have correct structure, required fields,
 * and that new categories are properly represented.
 */

import { describe, it, expect } from 'vitest';
import { NEW_ITEMS } from '../migrations/026-expand-item-catalog-categories';

// Expected new categories introduced by this migration
const NEW_CATEGORIES = [
  'instrument',
  'clothing',
  'kitchen',
  'garden',
  'stationery',
  'toy',
  'hygiene',
  'ceremonial',
];

// Valid item types from the schema
const VALID_ITEM_TYPES = [
  'weapon', 'armor', 'consumable', 'food', 'drink',
  'material', 'tool', 'collectible', 'key', 'quest', 'currency',
];

// Valid rarity values
const VALID_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

describe('Migration 026: Expand Item Catalog Categories', () => {
  describe('item count', () => {
    it('adds a substantial number of new items', () => {
      expect(NEW_ITEMS.length).toBeGreaterThanOrEqual(90);
    });
  });

  describe('new categories', () => {
    it('introduces all expected new categories', () => {
      const categories = new Set(NEW_ITEMS.map(i => i.category));
      for (const cat of NEW_CATEGORIES) {
        expect(categories.has(cat)).toBe(true);
      }
    });

    it('each new category has at least 3 items', () => {
      const categoryCounts = new Map<string, number>();
      for (const item of NEW_ITEMS) {
        categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
      }
      for (const cat of NEW_CATEGORIES) {
        expect(categoryCounts.get(cat)).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('item structure', () => {
    it('all items have required string fields', () => {
      for (const item of NEW_ITEMS) {
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.itemType).toBeTruthy();
        expect(item.icon).toBeTruthy();
        expect(item.category).toBeTruthy();
        expect(item.baseType).toBeTruthy();
        expect(item.rarity).toBeTruthy();
      }
    });

    it('all items have valid itemType', () => {
      for (const item of NEW_ITEMS) {
        expect(VALID_ITEM_TYPES).toContain(item.itemType);
      }
    });

    it('all items have valid rarity', () => {
      for (const item of NEW_ITEMS) {
        expect(VALID_RARITIES).toContain(item.rarity);
      }
    });

    it('all items have numeric value and sellValue', () => {
      for (const item of NEW_ITEMS) {
        expect(typeof item.value).toBe('number');
        expect(item.value).toBeGreaterThanOrEqual(0);
        expect(typeof item.sellValue).toBe('number');
        expect(item.sellValue).toBeGreaterThanOrEqual(0);
      }
    });

    it('sellValue does not exceed value', () => {
      for (const item of NEW_ITEMS) {
        expect(item.sellValue).toBeLessThanOrEqual(item.value);
      }
    });

    it('all items have numeric weight > 0', () => {
      for (const item of NEW_ITEMS) {
        expect(typeof item.weight).toBe('number');
        expect(item.weight).toBeGreaterThan(0);
      }
    });

    it('all items have non-empty tags array', () => {
      for (const item of NEW_ITEMS) {
        expect(Array.isArray(item.tags)).toBe(true);
        expect(item.tags.length).toBeGreaterThan(0);
      }
    });

    it('all items have a boolean possessable field', () => {
      for (const item of NEW_ITEMS) {
        expect(typeof item.possessable).toBe('boolean');
      }
    });

    it('stackable items have maxStack > 1', () => {
      for (const item of NEW_ITEMS) {
        if (item.stackable) {
          expect(item.maxStack).toBeGreaterThan(1);
        }
      }
    });
  });

  describe('item names', () => {
    it('all names are unique', () => {
      const names = NEW_ITEMS.map(i => i.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('no duplicate name+worldType combinations', () => {
      const combos = NEW_ITEMS.map(i => `${i.name}::${i.worldType}`);
      const uniqueCombos = new Set(combos);
      expect(uniqueCombos.size).toBe(combos.length);
    });
  });

  describe('universal items', () => {
    it('all items are universal (worldType: null)', () => {
      for (const item of NEW_ITEMS) {
        expect(item.worldType).toBeNull();
      }
    });
  });

  describe('furniture items', () => {
    it('furniture items are not possessable', () => {
      const furniture = NEW_ITEMS.filter(i => i.category === 'furniture');
      for (const item of furniture) {
        expect(item.possessable).toBe(false);
      }
    });

    it('furniture items have lootWeight of 0', () => {
      const furniture = NEW_ITEMS.filter(i => i.category === 'furniture');
      for (const item of furniture) {
        expect(item.lootWeight).toBe(0);
      }
    });
  });

  describe('loot weight distribution', () => {
    it('common items have higher loot weights than rare items on average', () => {
      const commonWeights = NEW_ITEMS
        .filter(i => i.rarity === 'common' && i.lootWeight > 0)
        .map(i => i.lootWeight);
      const rareWeights = NEW_ITEMS
        .filter(i => i.rarity === 'rare' && i.lootWeight > 0)
        .map(i => i.lootWeight);

      if (commonWeights.length > 0 && rareWeights.length > 0) {
        const avgCommon = commonWeights.reduce((a, b) => a + b, 0) / commonWeights.length;
        const avgRare = rareWeights.reduce((a, b) => a + b, 0) / rareWeights.length;
        expect(avgCommon).toBeGreaterThan(avgRare);
      }
    });
  });

  describe('category coverage', () => {
    it('has musical instruments', () => {
      const instruments = NEW_ITEMS.filter(i => i.category === 'instrument');
      expect(instruments.length).toBeGreaterThanOrEqual(5);
    });

    it('has clothing items', () => {
      const clothing = NEW_ITEMS.filter(i => i.category === 'clothing');
      expect(clothing.length).toBeGreaterThanOrEqual(5);
    });

    it('has kitchen items', () => {
      const kitchen = NEW_ITEMS.filter(i => i.category === 'kitchen');
      expect(kitchen.length).toBeGreaterThanOrEqual(5);
    });

    it('has garden/nature items', () => {
      const garden = NEW_ITEMS.filter(i => i.category === 'garden');
      expect(garden.length).toBeGreaterThanOrEqual(1);
      const nature = NEW_ITEMS.filter(i => i.tags.includes('natural') || i.tags.includes('garden'));
      expect(nature.length).toBeGreaterThanOrEqual(5);
    });

    it('has toy items', () => {
      const toys = NEW_ITEMS.filter(i => i.category === 'toy');
      expect(toys.length).toBeGreaterThanOrEqual(5);
    });

    it('has hygiene items', () => {
      const hygiene = NEW_ITEMS.filter(i => i.category === 'hygiene');
      expect(hygiene.length).toBeGreaterThanOrEqual(5);
    });

    it('has ceremonial items', () => {
      const ceremonial = NEW_ITEMS.filter(i => i.category === 'ceremonial');
      expect(ceremonial.length).toBeGreaterThanOrEqual(5);
    });

    it('has stationery items', () => {
      const stationery = NEW_ITEMS.filter(i => i.category === 'stationery');
      expect(stationery.length).toBeGreaterThanOrEqual(5);
    });
  });
});
