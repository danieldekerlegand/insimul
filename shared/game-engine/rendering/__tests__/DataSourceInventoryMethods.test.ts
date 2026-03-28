/**
 * Tests for DataSource inventory and trading interface methods:
 * getPlayerInventory, getContainerContents, and existing inventory methods.
 *
 * Tests FileDataSource (pure logic, no network) and verifies ApiDataSource
 * implements the interface correctly via a mock fetch.
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

describe('DataSource inventory and trading methods', () => {
  // ── FileDataSource ──────────────────────────────────────────────────────

  describe('FileDataSource', () => {
    let storage: MemoryStorage;
    let ds: FileDataSource;

    beforeEach(() => {
      storage = new MemoryStorage();
      ds = new FileDataSource(storage);
    });

    describe('getPlayerInventory', () => {
      it('returns empty inventory for new player', async () => {
        const inv = await ds.getPlayerInventory('world1', 'player1');
        expect(inv).toEqual({ entityId: 'player1', items: [], gold: 0 });
      });

      it('returns inventory after items are added via transferItem', async () => {
        await ds.transferItem('world1', {
          toEntityId: 'player1',
          itemId: 'sword',
          itemName: 'Iron Sword',
          itemType: 'weapon',
          quantity: 1,
          transactionType: 'quest_reward',
        });

        const inv = await ds.getPlayerInventory('world1', 'player1');
        expect(inv.items).toHaveLength(1);
        expect(inv.items[0].name).toBe('Iron Sword');
        expect(inv.items[0].quantity).toBe(1);
      });

      it('delegates to getEntityInventory (same result)', async () => {
        await ds.transferItem('world1', {
          toEntityId: 'player1',
          itemId: 'potion',
          itemName: 'Health Potion',
          quantity: 3,
          transactionType: 'quest_reward',
        });

        const playerInv = await ds.getPlayerInventory('world1', 'player1');
        const entityInv = await ds.getEntityInventory('world1', 'player1');
        expect(playerInv).toEqual(entityInv);
      });
    });

    describe('getContainerContents', () => {
      it('returns null in exported/file mode', async () => {
        const result = await ds.getContainerContents('container123');
        expect(result).toBeNull();
      });
    });

    describe('getEntityInventory', () => {
      it('returns empty inventory for unknown entity', async () => {
        const inv = await ds.getEntityInventory('world1', 'npc1');
        expect(inv).toEqual({ entityId: 'npc1', items: [], gold: 0 });
      });
    });

    describe('transferItem', () => {
      it('transfers items between entities', async () => {
        // Give player some items first
        await ds.transferItem('world1', {
          toEntityId: 'player1',
          itemId: 'gem',
          itemName: 'Ruby',
          itemType: 'material',
          quantity: 5,
          transactionType: 'quest_reward',
        });

        // Transfer some to an NPC
        await ds.transferItem('world1', {
          fromEntityId: 'player1',
          toEntityId: 'npc1',
          itemId: 'gem',
          itemName: 'Ruby',
          quantity: 2,
          transactionType: 'give',
        });

        const playerInv = await ds.getPlayerInventory('world1', 'player1');
        expect(playerInv.items[0].quantity).toBe(3);

        const npcInv = await ds.getEntityInventory('world1', 'npc1');
        expect(npcInv.items[0].quantity).toBe(2);
      });

      it('returns success with timestamp', async () => {
        const result = await ds.transferItem('world1', {
          toEntityId: 'player1',
          itemId: 'key',
          itemName: 'Dungeon Key',
          quantity: 1,
          transactionType: 'quest_reward',
        });

        expect(result.success).toBe(true);
        expect(result.timestamp).toBeGreaterThan(0);
      });
    });

    describe('getMerchantInventory', () => {
      it('returns null for non-merchant character', async () => {
        const inv = await ds.getMerchantInventory('world1', 'unknown-npc');
        expect(inv).toBeNull();
      });
    });

    describe('loadWorldItems', () => {
      it('returns empty array when no items file exists', async () => {
        const items = await ds.loadWorldItems('world1');
        expect(items).toEqual([]);
      });
    });
  });

  // ── ApiDataSource ───────────────────────────────────────────────────────

  describe('ApiDataSource', () => {
    let ds: ApiDataSource;

    beforeEach(() => {
      ds = new ApiDataSource('test-token', 'http://localhost:3000');
      // Mock fetch globally
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
      ds.dispose();
    });

    describe('getPlayerInventory', () => {
      it('calls the entity inventory API endpoint', async () => {
        const mockResponse = { entityId: 'player1', items: [{ id: 'sword', name: 'Sword' }], gold: 50 };
        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await ds.getPlayerInventory('world1', 'player1');

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/worlds/world1/entities/player1/inventory',
          expect.objectContaining({
            headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
          }),
        );
        expect(result).toEqual(mockResponse);
      });

      it('returns default inventory on API failure', async () => {
        (fetch as any).mockResolvedValueOnce({ ok: false });

        const result = await ds.getPlayerInventory('world1', 'player1');
        expect(result).toEqual({ entityId: 'player1', items: [], gold: 0 });
      });
    });

    describe('getContainerContents', () => {
      it('fetches container by ID from API', async () => {
        const mockContainer = { id: 'c1', name: 'Chest', items: [{ id: 'gold', quantity: 10 }] };
        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContainer),
        });

        const result = await ds.getContainerContents('c1');

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/containers/c1',
          expect.objectContaining({
            headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
          }),
        );
        expect(result).toEqual(mockContainer);
      });

      it('returns null when container not found', async () => {
        (fetch as any).mockResolvedValueOnce({ ok: false });

        const result = await ds.getContainerContents('nonexistent');
        expect(result).toBeNull();
      });
    });

    describe('transferItem', () => {
      it('posts transfer to API', async () => {
        const mockResult = { success: true, timestamp: Date.now() };
        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResult),
        });

        const transfer = {
          fromEntityId: 'player1',
          toEntityId: 'merchant1',
          itemId: 'gem',
          quantity: 1,
          transactionType: 'sell' as const,
          totalPrice: 50,
        };

        const result = await ds.transferItem('world1', transfer);

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/worlds/world1/inventory/transfer',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(transfer),
          }),
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('getMerchantInventory', () => {
      it('fetches merchant inventory from API', async () => {
        const mockInv = { merchantId: 'm1', items: [], goldReserve: 200 };
        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockInv),
        });

        const result = await ds.getMerchantInventory('world1', 'm1');
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/worlds/world1/merchants/m1/inventory',
          expect.any(Object),
        );
        expect(result).toEqual(mockInv);
      });
    });
  });
});
