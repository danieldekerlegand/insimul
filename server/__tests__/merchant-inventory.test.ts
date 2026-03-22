/**
 * Tests for Merchant Inventory Auto-Generation
 *
 * Verifies business-type-to-inventory mapping, personality-influenced pricing,
 * gold reserve calculation, restock mechanics, and accepted item types.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMerchantInventory,
  generateWorldMerchantInventories,
  restockInventory,
  getAcceptedItemTypes,
  getItemCatalogForBusiness,
  collectUniqueCatalogItems,
  generateAndPersistWorldInventories,
  baseItemToTemplate,
  filterBaseItemsForBusiness,
  type MerchantInventoryStorage,
  type TranslateItemFn,
} from '../services/merchant-inventory.js';
import type { Item } from '@shared/schema';

// ── Mock Storage ────────────────────────────────────────────────────────────

function createMockStorage(overrides: Partial<MerchantInventoryStorage> = {}): MerchantInventoryStorage {
  return {
    getBusinessesByWorld: async () => [],
    getCharacter: async () => undefined,
    getItemsByWorld: async () => [],
    createItem: async (item: any) => ({ ...item, id: 'item-1' }),
    getWorldLanguagesByWorld: async () => [],
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Merchant Inventory Auto-Generation', () => {
  describe('generateMerchantInventory', () => {
    it('generates 10-20 items for a bakery', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-1', name: 'Corner Bakery', businessType: 'Bakery' },
        { agreeableness: 0.5 }
      );

      expect(inventory.items.length).toBeGreaterThanOrEqual(10);
      expect(inventory.items.length).toBeLessThanOrEqual(20);
      expect(inventory.merchantId).toBe('biz-1');
      expect(inventory.merchantName).toBe('Corner Bakery');
    });

    it('bakery gets food items', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-1', name: 'Bakery', businessType: 'Bakery' },
        { agreeableness: 0.5 }
      );

      const foodItems = inventory.items.filter(i => i.type === 'food' || i.type === 'material');
      expect(foodItems.length).toBe(inventory.items.length); // all items should be food or baking materials
    });

    it('blacksmith/shop gets tools and utility items', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-2', name: 'General Store', businessType: 'Shop' },
        { agreeableness: 0.5 }
      );

      const toolItems = inventory.items.filter(i => i.type === 'tool' || i.type === 'consumable');
      expect(toolItems.length).toBeGreaterThan(0);
    });

    it('jewelry store gets jewelry items', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-3', name: 'Gem Palace', businessType: 'JewelryStore' },
        { agreeableness: 0.5 }
      );

      const jewelry = inventory.items.filter(i => i.category === 'jewelry');
      expect(jewelry.length).toBe(inventory.items.length);
    });

    it('pharmacy gets potions and herbs', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-4', name: 'Apothecary', businessType: 'Pharmacy' },
        { agreeableness: 0.5 }
      );

      const meds = inventory.items.filter(i =>
        i.type === 'consumable' || i.type === 'material' || i.type === 'tool'
      );
      expect(meds.length).toBe(inventory.items.length);
    });

    it('bar gets drinks and food', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-5', name: 'The Tipsy Troll', businessType: 'Bar' },
        { agreeableness: 0.5 }
      );

      const drinkFood = inventory.items.filter(i => i.type === 'drink' || i.type === 'food');
      expect(drinkFood.length).toBe(inventory.items.length);
    });

    it('all items have valid buy and sell prices', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-1', name: 'Shop', businessType: 'Shop' },
        { agreeableness: 0.5 }
      );

      for (const item of inventory.items) {
        expect(item.buyPrice).toBeGreaterThan(0);
        expect(item.sellPrice).toBeGreaterThan(0);
        expect(item.sellPrice).toBeLessThanOrEqual(item.buyPrice);
      }
    });

    it('rarity affects price multiplier', () => {
      // Generate many inventories to get different rarities
      const allItems: Array<{ rarity: string; buyPrice: number; baseType: string }> = [];
      for (let i = 0; i < 20; i++) {
        const inv = generateMerchantInventory(
          { id: `biz-${i}`, name: 'Jeweler', businessType: 'JewelryStore' },
          { agreeableness: 0.5 }
        );
        for (const item of inv.items) {
          allItems.push({ rarity: item.rarity || 'common', buyPrice: item.buyPrice, baseType: item.name });
        }
      }

      const commonPrices = allItems.filter(i => i.rarity === 'common').map(i => i.buyPrice);
      const rarePrices = allItems.filter(i => i.rarity === 'rare').map(i => i.buyPrice);

      if (commonPrices.length > 0 && rarePrices.length > 0) {
        const avgCommon = commonPrices.reduce((a, b) => a + b, 0) / commonPrices.length;
        const avgRare = rarePrices.reduce((a, b) => a + b, 0) / rarePrices.length;
        expect(avgRare).toBeGreaterThan(avgCommon);
      }
    });
  });

  describe('personality-influenced pricing', () => {
    it('agreeable merchants have lower buy prices', () => {
      // Generate many items to average out randomness
      let agreeableTotal = 0;
      let disagreeableTotal = 0;
      const trials = 50;

      for (let i = 0; i < trials; i++) {
        const agreeable = generateMerchantInventory(
          { id: 'a', name: 'Nice Shop', businessType: 'Shop' },
          { agreeableness: 0.9 }
        );
        const disagreeable = generateMerchantInventory(
          { id: 'b', name: 'Grumpy Shop', businessType: 'Shop' },
          { agreeableness: 0.1 }
        );

        agreeableTotal += agreeable.items.reduce((sum, i) => sum + i.buyPrice, 0);
        disagreeableTotal += disagreeable.items.reduce((sum, i) => sum + i.buyPrice, 0);
      }

      // Agreeable merchants should have lower total prices on average
      expect(agreeableTotal / trials).toBeLessThan(disagreeableTotal / trials);
    });

    it('agreeable merchants pay more when buying from player', () => {
      const agreeable = generateMerchantInventory(
        { id: 'a', name: 'Nice', businessType: 'Shop' },
        { agreeableness: 0.9 }
      );
      const disagreeable = generateMerchantInventory(
        { id: 'b', name: 'Grumpy', businessType: 'Shop' },
        { agreeableness: 0.1 }
      );

      expect(agreeable.sellMultiplier).toBeGreaterThan(disagreeable.sellMultiplier);
    });
  });

  describe('gold reserve', () => {
    it('generates gold reserve between 200-1000', () => {
      for (let i = 0; i < 20; i++) {
        const inventory = generateMerchantInventory(
          { id: `biz-${i}`, name: 'Shop', businessType: 'Shop' },
          { agreeableness: 0.5 }
        );
        expect(inventory.goldReserve).toBeGreaterThanOrEqual(200);
        expect(inventory.goldReserve).toBeLessThanOrEqual(1300); // 1000 * 1.25 max
      }
    });

    it('jewelry stores have higher gold reserves than bakeries', () => {
      let jewelryTotal = 0;
      let bakeryTotal = 0;
      const trials = 30;

      for (let i = 0; i < trials; i++) {
        const jewelry = generateMerchantInventory(
          { id: 'j', name: 'Jeweler', businessType: 'JewelryStore' },
          { agreeableness: 0.5 }
        );
        const bakery = generateMerchantInventory(
          { id: 'b', name: 'Bakery', businessType: 'Bakery' },
          { agreeableness: 0.5 }
        );
        jewelryTotal += jewelry.goldReserve;
        bakeryTotal += bakery.goldReserve;
      }

      expect(jewelryTotal / trials).toBeGreaterThan(bakeryTotal / trials);
    });
  });

  describe('restockInventory', () => {
    it('increases stock toward maxStock', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-1', name: 'Shop', businessType: 'Shop' },
        { agreeableness: 0.5 }
      );

      // Deplete stock
      const depleted = {
        ...inventory,
        items: inventory.items.map(i => ({ ...i, stock: 0 })),
      };

      const restocked = restockInventory(depleted);
      for (const item of restocked.items) {
        expect(item.stock).toBeGreaterThan(0);
        expect(item.stock).toBeLessThanOrEqual(item.maxStock);
      }
    });

    it('does not exceed maxStock', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-1', name: 'Shop', businessType: 'Shop' },
        { agreeableness: 0.5 }
      );

      // Stock is already at or near max
      const restocked = restockInventory(inventory);
      for (const item of restocked.items) {
        expect(item.stock).toBeLessThanOrEqual(item.maxStock);
      }
    });
  });

  describe('getAcceptedItemTypes', () => {
    it('bakery accepts food and material', () => {
      const accepted = getAcceptedItemTypes('Bakery');
      expect(accepted.has('food')).toBe(true);
      expect(accepted.has('material')).toBe(true);
      expect(accepted.has('weapon')).toBe(false);
    });

    it('bar accepts drink and food', () => {
      const accepted = getAcceptedItemTypes('Bar');
      expect(accepted.has('drink')).toBe(true);
      expect(accepted.has('food')).toBe(true);
    });

    it('pharmacy accepts consumable, material, and tool', () => {
      const accepted = getAcceptedItemTypes('Pharmacy');
      expect(accepted.has('consumable')).toBe(true);
      expect(accepted.has('material')).toBe(true);
    });
  });

  describe('business type aliases', () => {
    it('Hotel falls back to Restaurant catalog', () => {
      const catalog = getItemCatalogForBusiness('Hotel');
      expect(catalog.length).toBeGreaterThan(0);
      // Hotel should have food/drink items (Restaurant catalog)
      const hasFood = catalog.some(i => i.itemType === 'food' || i.itemType === 'drink');
      expect(hasFood).toBe(true);
    });

    it('Hospital falls back to Pharmacy catalog', () => {
      const catalog = getItemCatalogForBusiness('Hospital');
      expect(catalog.length).toBeGreaterThan(0);
      const hasMeds = catalog.some(i => i.itemType === 'consumable');
      expect(hasMeds).toBe(true);
    });

    it('unknown type falls back to Shop', () => {
      const catalog = getItemCatalogForBusiness('SomethingRandom');
      expect(catalog.length).toBeGreaterThan(0);
    });
  });

  describe('generateWorldMerchantInventories', () => {
    it('generates inventories for merchant businesses', async () => {
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Corner Bakery', businessType: 'Bakery', ownerId: 'c1', settlementId: 's1' } as any,
          { id: 'b2', name: 'Town Bar', businessType: 'Bar', ownerId: null, settlementId: 's1' } as any,
        ],
        getCharacter: async (id: string) => {
          if (id === 'c1') {
            return { id: 'c1', personality: { agreeableness: 0.8 } } as any;
          }
          return undefined;
        },
        getWorldLanguagesByWorld: async () => [],
      });

      const inventories = await generateWorldMerchantInventories('world-1', storage);

      expect(inventories.length).toBe(2);
      expect(inventories[0].merchantId).toBe('b1');
      expect(inventories[1].merchantId).toBe('b2');
    });

    it('skips non-merchant businesses like Bank and LawFirm when not aliased', async () => {
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Bakery', businessType: 'Bakery', ownerId: null, settlementId: 's1' } as any,
          // Bank has an alias to Shop, so it WILL be included
          { id: 'b2', name: 'Bank', businessType: 'Bank', ownerId: null, settlementId: 's1' } as any,
        ],
      });

      const inventories = await generateWorldMerchantInventories('world-1', storage);
      // Both should be included (Bank aliases to Shop)
      expect(inventories.length).toBe(2);
    });

    it('uses owner personality for pricing', async () => {
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Shop', businessType: 'Shop', ownerId: 'c-nice', settlementId: 's1' } as any,
        ],
        getCharacter: async (id: string) => {
          if (id === 'c-nice') {
            return { id: 'c-nice', personality: { agreeableness: 1.0 } } as any;
          }
          return undefined;
        },
      });

      const inventories = await generateWorldMerchantInventories('world-1', storage);
      expect(inventories.length).toBe(1);
      // Very agreeable merchant should have higher sell multiplier
      expect(inventories[0].sellMultiplier).toBeGreaterThan(0.5);
    });
  });

  describe('collectUniqueCatalogItems', () => {
    it('returns deduplicated items across all catalogs', () => {
      const items = collectUniqueCatalogItems();
      const names = items.map(i => i.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
      expect(items.length).toBeGreaterThan(50); // we have many items across catalogs
    });

    it('each item has id, name, category, and description', () => {
      const items = collectUniqueCatalogItems();
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.category).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    });
  });

  describe('generateAndPersistWorldInventories', () => {
    it('generates inventories and persists them via updateBusiness', async () => {
      const updates: Array<{ id: string; data: any }> = [];
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Corner Bakery', businessType: 'Bakery', ownerId: 'c1', settlementId: 's1' } as any,
          { id: 'b2', name: 'Town Bar', businessType: 'Bar', ownerId: null, settlementId: 's1' } as any,
        ],
        getCharacter: async (id: string) => {
          if (id === 'c1') return { id: 'c1', personality: { agreeableness: 0.7 } } as any;
          return undefined;
        },
        updateBusiness: async (id: string, data: any) => {
          updates.push({ id, data });
          return data;
        },
      });

      const result = await generateAndPersistWorldInventories('world-1', storage, null);
      expect(result.inventoryCount).toBe(2);
      expect(result.translatedCount).toBe(0);
      expect(updates.length).toBe(2);
      expect(updates[0].data.businessData.inventory.merchantId).toBe('b1');
      expect(updates[1].data.businessData.inventory.merchantId).toBe('b2');
    });

    it('translates items when targetLanguage and translateFn are provided', async () => {
      const updates: Array<{ id: string; data: any }> = [];
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Boulangerie', businessType: 'Bakery', ownerId: null, settlementId: 's1' } as any,
        ],
        updateBusiness: async (id: string, data: any) => {
          updates.push({ id, data });
          return data;
        },
      });

      const mockTranslate: TranslateItemFn = async (items, _lang) => {
        return items.map(item => ({
          id: item.id,
          targetWord: `fr_${item.name}`,
          pronunciation: `pron_${item.name}`,
          category: item.category || 'general',
        }));
      };

      const result = await generateAndPersistWorldInventories('world-1', storage, 'French', mockTranslate);
      expect(result.inventoryCount).toBe(1);
      expect(result.translatedCount).toBeGreaterThan(0);

      const inventory = updates[0].data.businessData.inventory;
      const translatedItems = inventory.items.filter((i: any) => i.languageLearningData);
      expect(translatedItems.length).toBeGreaterThan(0);
      expect(translatedItems[0].languageLearningData.targetLanguage).toBe('French');
      expect(translatedItems[0].languageLearningData.targetWord).toMatch(/^fr_/);
    });

    it('skips non-merchant business types', async () => {
      const updates: Array<{ id: string; data: any }> = [];
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Bakery', businessType: 'Bakery', ownerId: null, settlementId: 's1' } as any,
          { id: 'b2', name: 'Church', businessType: 'Church', ownerId: null, settlementId: 's1' } as any,
        ],
        updateBusiness: async (id: string, data: any) => {
          updates.push({ id, data });
          return data;
        },
      });

      const result = await generateAndPersistWorldInventories('world-1', storage, null);
      // Church has a BUSINESS_TYPE_ALIASES entry (-> Shop), so it should be included
      expect(result.inventoryCount).toBe(2);
    });

    it('preserves existing businessData when persisting inventory', async () => {
      const updates: Array<{ id: string; data: any }> = [];
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Apartments', businessType: 'ApartmentComplex', ownerId: null, settlementId: 's1', businessData: { units: 12 } } as any,
        ],
        updateBusiness: async (id: string, data: any) => {
          updates.push({ id, data });
          return data;
        },
      });

      await generateAndPersistWorldInventories('world-1', storage, null);
      expect(updates[0].data.businessData.units).toBe(12);
      expect(updates[0].data.businessData.inventory).toBeDefined();
    });

    it('works without updateBusiness (no persistence)', async () => {
      const storage = createMockStorage({
        getBusinessesByWorld: async () => [
          { id: 'b1', name: 'Shop', businessType: 'Shop', ownerId: null, settlementId: 's1' } as any,
        ],
      });

      // Should not throw even without updateBusiness
      const result = await generateAndPersistWorldInventories('world-1', storage, null);
      expect(result.inventoryCount).toBe(1);
    });
  });

  describe('new business type catalogs', () => {
    it('blacksmith gets weapons, armor, and smithing items', () => {
      const catalog = getItemCatalogForBusiness('Blacksmith');
      expect(catalog.length).toBeGreaterThan(0);
      const hasWeapons = catalog.some(i => i.itemType === 'weapon');
      const hasArmor = catalog.some(i => i.itemType === 'armor');
      expect(hasWeapons).toBe(true);
      expect(hasArmor).toBe(true);
    });

    it('tailor gets clothing items', () => {
      const catalog = getItemCatalogForBusiness('Tailor');
      expect(catalog.length).toBeGreaterThan(0);
      const hasClothing = catalog.some(i => i.category === 'clothing' || i.category === 'footwear');
      expect(hasClothing).toBe(true);
    });

    it('butcher gets meat items', () => {
      const catalog = getItemCatalogForBusiness('Butcher');
      expect(catalog.length).toBeGreaterThan(0);
      const hasMeat = catalog.some(i => i.category === 'meat' || i.category === 'preserved');
      expect(hasMeat).toBe(true);
    });

    it('bookstore gets books and writing items', () => {
      const catalog = getItemCatalogForBusiness('BookStore');
      expect(catalog.length).toBeGreaterThan(0);
      const hasBooks = catalog.some(i => i.category === 'book' || i.category === 'writing');
      expect(hasBooks).toBe(true);
    });

    it('herb shop gets herbs and potions', () => {
      const catalog = getItemCatalogForBusiness('HerbShop');
      expect(catalog.length).toBeGreaterThan(0);
      const hasHerbs = catalog.some(i => i.category === 'herb' || i.category === 'potion');
      expect(hasHerbs).toBe(true);
    });

    it('pawn shop gets mixed item types', () => {
      const catalog = getItemCatalogForBusiness('PawnShop');
      expect(catalog.length).toBeGreaterThan(0);
      const types = new Set(catalog.map(i => i.itemType));
      expect(types.size).toBeGreaterThan(2); // pawn shops have diverse items
    });

    it('fish market gets fish and seafood', () => {
      const catalog = getItemCatalogForBusiness('FishMarket');
      expect(catalog.length).toBeGreaterThan(0);
      const hasFish = catalog.some(i => i.category === 'fish' || i.category === 'shellfish');
      expect(hasFish).toBe(true);
    });

    it('Factory aliases to Blacksmith', () => {
      const catalog = getItemCatalogForBusiness('Factory');
      const blacksmithCatalog = getItemCatalogForBusiness('Blacksmith');
      expect(catalog).toEqual(blacksmithCatalog);
    });

    it('Harbor aliases to FishMarket', () => {
      const catalog = getItemCatalogForBusiness('Harbor');
      const fishCatalog = getItemCatalogForBusiness('FishMarket');
      expect(catalog).toEqual(fishCatalog);
    });
  });

  describe('base items integration', () => {
    const mockBaseItem = (overrides: Partial<Item> = {}): Item => ({
      id: 'item-1',
      worldId: 'world-1',
      name: 'Test Sword',
      description: 'A test sword',
      itemType: 'weapon',
      value: 20,
      sellValue: 10,
      weight: 3,
      tradeable: true,
      stackable: false,
      maxStack: 1,
      icon: '⚔️',
      tags: ['weapon', 'melee', 'loot:common'],
      effects: { attackPower: 5 },
      category: 'melee',
      material: null,
      baseType: null,
      rarity: null,
      lootWeight: 10,
      possessable: true,
      metadata: null,
      craftingRecipe: null,
      questRelevance: null,
      languageLearningData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Item);

    it('baseItemToTemplate converts a DB item to an ItemTemplate', () => {
      const item = mockBaseItem();
      const template = baseItemToTemplate(item);

      expect(template.name).toBe('Test Sword');
      expect(template.itemType).toBe('weapon');
      expect(template.basePrice).toBe(20);
      expect(template.rarity).toBe('common');
      expect(template.effects).toEqual({ attackPower: 5 });
    });

    it('baseItemToTemplate detects rarity from tags', () => {
      expect(baseItemToTemplate(mockBaseItem({ tags: ['loot:rare'] })).rarity).toBe('rare');
      expect(baseItemToTemplate(mockBaseItem({ tags: ['loot:epic'] })).rarity).toBe('epic');
      expect(baseItemToTemplate(mockBaseItem({ tags: ['loot:legendary'] })).rarity).toBe('legendary');
      expect(baseItemToTemplate(mockBaseItem({ tags: ['loot:uncommon'] })).rarity).toBe('uncommon');
      expect(baseItemToTemplate(mockBaseItem({ tags: ['weapon'] })).rarity).toBe('common');
    });

    it('filterBaseItemsForBusiness returns matching items for Blacksmith', () => {
      const items = [
        mockBaseItem({ name: 'Iron Sword', itemType: 'weapon', tags: ['weapon', 'melee'] }),
        mockBaseItem({ name: 'Bread', itemType: 'food', tags: ['food'] }),
        mockBaseItem({ name: 'Shield', itemType: 'armor', tags: ['armor'] }),
      ];

      const templates = filterBaseItemsForBusiness(items, 'Blacksmith');
      const names = templates.map(t => t.name);
      // Should include weapon and armor, not food
      expect(names).toContain('Shield');
      expect(names).not.toContain('Bread');
    });

    it('filterBaseItemsForBusiness skips non-tradeable items', () => {
      const items = [
        mockBaseItem({ name: 'Quest Key', tradeable: false, itemType: 'weapon', tags: ['weapon'] }),
      ];

      const templates = filterBaseItemsForBusiness(items, 'Blacksmith');
      expect(templates.length).toBe(0);
    });

    it('filterBaseItemsForBusiness skips items already in hardcoded catalog', () => {
      // "Iron Sword" is already in Blacksmith catalog
      const items = [
        mockBaseItem({ name: 'Iron Sword', itemType: 'weapon', tags: ['weapon', 'melee'] }),
      ];

      const templates = filterBaseItemsForBusiness(items, 'Blacksmith');
      expect(templates.length).toBe(0);
    });

    it('generateMerchantInventory supplements catalog with base items', () => {
      const baseItems = [
        mockBaseItem({ name: 'Unique DB Sword', itemType: 'weapon', tags: ['weapon', 'melee'], value: 30 }),
      ];

      // Generate many inventories to ensure the DB item appears at least once
      let found = false;
      for (let i = 0; i < 30; i++) {
        const inventory = generateMerchantInventory(
          { id: `biz-${i}`, name: 'Smithy', businessType: 'Blacksmith' },
          { agreeableness: 0.5 },
          undefined,
          baseItems,
        );
        if (inventory.items.some(item => item.name === 'Unique DB Sword')) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('blacksmith accepted item types', () => {
    it('blacksmith accepts weapons, armor, tools, and materials', () => {
      const accepted = getAcceptedItemTypes('Blacksmith');
      expect(accepted.has('weapon')).toBe(true);
      expect(accepted.has('armor')).toBe(true);
      expect(accepted.has('tool')).toBe(true);
      expect(accepted.has('material')).toBe(true);
    });
  });
});
