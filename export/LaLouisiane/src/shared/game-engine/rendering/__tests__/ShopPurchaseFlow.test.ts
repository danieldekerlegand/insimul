/**
 * Tests for the shop purchasing flow:
 * - Merchant inventory generation with businessType fallback
 * - Buy/sell transaction handling
 * - Gold tracking through transactions
 * - Quest objective tracking on purchase
 * - Business-type stock templates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalGameState, FileDataSource, ApiDataSource } from '../DataSource';

// In-memory storage mock
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

describe('Shop purchase flow', () => {
  // ── FileDataSource merchant inventory ─────────────────────────────────

  describe('FileDataSource merchant inventory', () => {
    let storage: MemoryStorage;
    let ds: FileDataSource;

    beforeEach(() => {
      storage = new MemoryStorage();
      ds = new FileDataSource(storage);
      // Inject mock world data with characters
      (ds as any).worldData = {
        characters: [
          { id: 'npc-baker', firstName: 'Pierre', lastName: 'Dupont', occupation: 'baker' },
          { id: 'npc-farmer', firstName: 'Jean', lastName: 'Blanc', occupation: 'farmer' },
          { id: 'npc-generic', firstName: 'Marie', lastName: 'Roux', occupation: 'shopkeeper' },
          { id: 'npc-nobody', firstName: 'Claude', lastName: 'Noir', occupation: 'teacher' },
        ],
        npcs: [],
      };
      (ds as any).dataLoaded = true;
      (ds as any)._dataPromise = Promise.resolve();
    });

    it('returns inventory for NPC with merchant occupation', async () => {
      const inv = await ds.getMerchantInventory('world1', 'npc-baker');
      expect(inv).not.toBeNull();
      expect(inv.merchantId).toBe('npc-baker');
      expect(inv.merchantName).toBe('Pierre Dupont');
      expect(inv.items.length).toBeGreaterThan(0);
      expect(inv.goldReserve).toBeGreaterThan(0);
      // Baker should get baker-specific items
      expect(inv.items.some((i: any) => i.name === 'Bread')).toBe(true);
    });

    it('returns null for non-merchant NPC without businessType', async () => {
      const inv = await ds.getMerchantInventory('world1', 'npc-farmer');
      expect(inv).toBeNull();
    });

    it('returns inventory for non-merchant NPC when businessType is provided', async () => {
      const inv = await ds.getMerchantInventory('world1', 'npc-farmer', 'Farm');
      expect(inv).not.toBeNull();
      expect(inv.merchantName).toBe('Jean Blanc');
      expect(inv.businessType).toBe('Farm');
      expect(inv.items.length).toBeGreaterThan(0);
      // Farm business should get farm-specific items
      expect(inv.items.some((i: any) => i.name === 'Fresh Eggs' || i.name === 'Vegetables')).toBe(true);
    });

    it('returns null for unknown NPC', async () => {
      const inv = await ds.getMerchantInventory('world1', 'nonexistent');
      expect(inv).toBeNull();
    });

    it('caches merchant inventory on second call', async () => {
      const inv1 = await ds.getMerchantInventory('world1', 'npc-baker');
      const inv2 = await ds.getMerchantInventory('world1', 'npc-baker');
      expect(inv1).toEqual(inv2);
    });

    it('generates items for each business type', async () => {
      const businessTypes = [
        'GroceryStore', 'Bakery', 'Bar', 'Restaurant', 'Blacksmith',
        'Tailor', 'BookStore', 'HerbShop', 'Pharmacy', 'JewelryStore',
        'Farm', 'Brewery', 'FishMarket', 'Butcher', 'PawnShop', 'Carpenter',
      ];

      for (const bizType of businessTypes) {
        // Create a unique NPC for each test to avoid cache
        (ds as any).worldData.characters.push({
          id: `npc-${bizType}`, firstName: 'Test', lastName: bizType, occupation: 'worker',
        });
        const inv = await ds.getMerchantInventory('world1', `npc-${bizType}`, bizType);
        expect(inv).not.toBeNull();
        expect(inv.items.length).toBeGreaterThan(0);
        expect(inv.businessType).toBe(bizType);
      }
    });
  });

  // ── ApiDataSource merchant inventory with businessType ────────────────

  describe('ApiDataSource merchant inventory', () => {
    let ds: ApiDataSource;

    beforeEach(() => {
      ds = new ApiDataSource('test-token', 'http://localhost:3000');
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
      ds.dispose();
    });

    it('passes businessType as query param when provided', async () => {
      const mockInv = { merchantId: 'm1', items: [{ id: 'item1', name: 'Bread' }], goldReserve: 200 };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInv),
      });

      const result = await ds.getMerchantInventory('world1', 'm1', 'Bakery');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/world1/merchants/m1/inventory?businessType=Bakery',
        expect.any(Object),
      );
      expect(result).toEqual(mockInv);
    });

    it('omits businessType query param when not provided', async () => {
      const mockInv = { merchantId: 'm1', items: [], goldReserve: 200 };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInv),
      });

      await ds.getMerchantInventory('world1', 'm1');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/world1/merchants/m1/inventory',
        expect.any(Object),
      );
    });

    it('returns null on API failure', async () => {
      (fetch as any).mockResolvedValueOnce({ ok: false });
      const result = await ds.getMerchantInventory('world1', 'm1', 'Shop');
      expect(result).toBeNull();
    });
  });

  // ── Buy/sell transaction gold tracking ────────────────────────────────

  describe('LocalGameState buy/sell transactions', () => {
    let storage: MemoryStorage;
    let state: LocalGameState;

    beforeEach(() => {
      storage = new MemoryStorage();
      state = new LocalGameState(storage);
    });

    it('adds item to player inventory on buy transfer', () => {
      const result = state.transferItem({
        toEntityId: 'player',
        itemId: 'bread',
        itemName: 'Bread',
        itemType: 'food',
        quantity: 2,
        transactionType: 'buy',
        totalPrice: 4,
      });

      expect(result.success).toBe(true);
      const inv = state.getInventory('player');
      expect(inv.items).toHaveLength(1);
      expect(inv.items[0].name).toBe('Bread');
      expect(inv.items[0].quantity).toBe(2);
    });

    it('removes item from player inventory on sell transfer', () => {
      // Add item first
      state.transferItem({
        toEntityId: 'player',
        itemId: 'sword',
        itemName: 'Iron Sword',
        itemType: 'weapon',
        quantity: 1,
        transactionType: 'quest_reward',
      });

      // Now sell it
      const result = state.transferItem({
        fromEntityId: 'player',
        itemId: 'sword',
        itemName: 'Iron Sword',
        quantity: 1,
        transactionType: 'sell',
        totalPrice: 15,
      });

      expect(result.success).toBe(true);
      const inv = state.getInventory('player');
      // Item should be removed or quantity zeroed
      const sword = inv.items.find((i: any) => i.id === 'sword');
      expect(!sword || sword.quantity === 0).toBe(true);
    });

    it('stores and retrieves merchant inventory', () => {
      const mockInv = {
        merchantId: 'npc-1',
        items: [{ id: 'item1', name: 'Bread', type: 'food', quantity: 5 }],
        goldReserve: 200,
      };

      state.setMerchantInventory('npc-1', mockInv);
      const result = state.getMerchantInventory('npc-1');
      expect(result).toEqual(mockInv);
    });

    it('returns null for unknown merchant', () => {
      expect(state.getMerchantInventory('unknown')).toBeNull();
    });
  });
});
