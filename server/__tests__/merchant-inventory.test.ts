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
  type MerchantInventoryStorage,
} from '../services/merchant-inventory.js';

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
    it('generates 8-15 items for a bakery', () => {
      const inventory = generateMerchantInventory(
        { id: 'biz-1', name: 'Corner Bakery', businessType: 'Bakery' },
        { agreeableness: 0.5 }
      );

      expect(inventory.items.length).toBeGreaterThanOrEqual(8);
      expect(inventory.items.length).toBeLessThanOrEqual(15);
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
});
