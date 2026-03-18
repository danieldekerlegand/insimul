/**
 * Tests for LocalGameState and FileDataSource local state management.
 * Pure-logic tests — no Babylon.js or file I/O needed.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LocalGameState, type LocalStateData } from '../DataSource';

// In-memory storage mock implementing the Storage subset used by LocalGameState
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

describe('LocalGameState', () => {
  let storage: MemoryStorage;
  let state: LocalGameState;

  beforeEach(() => {
    storage = new MemoryStorage();
    state = new LocalGameState(storage);
  });

  // ── Playthrough ────────────────────────────────────────────────────────────

  describe('playthrough management', () => {
    it('generates a unique playthrough ID on creation', () => {
      const id = state.getPlaythroughId();
      expect(id).toMatch(/^exported-/);
    });

    it('startPlaythrough persists name and returns id', () => {
      const result = state.startPlaythrough('My Adventure');
      expect(result.name).toBe('My Adventure');
      expect(result.id).toBe(state.getPlaythroughId());
    });

    it('preserves playthrough ID across instances', () => {
      const id = state.getPlaythroughId();
      const state2 = new LocalGameState(storage);
      expect(state2.getPlaythroughId()).toBe(id);
    });
  });

  // ── Quest Updates ──────────────────────────────────────────────────────────

  describe('quest updates', () => {
    it('stores and retrieves quest updates', () => {
      state.updateQuest('q1', { progress: { step: 1 } });
      const updates = state.getQuestUpdates();
      expect(updates['q1']).toEqual({ progress: { step: 1 } });
    });

    it('merges multiple updates to the same quest', () => {
      state.updateQuest('q1', { progress: { step: 1 } });
      state.updateQuest('q1', { status: 'completed' });
      const updates = state.getQuestUpdates();
      expect(updates['q1']).toEqual({ progress: { step: 1 }, status: 'completed' });
    });

    it('overwrites conflicting keys on merge', () => {
      state.updateQuest('q1', { progress: { step: 1 } });
      state.updateQuest('q1', { progress: { step: 2 } });
      expect(state.getQuestUpdates()['q1'].progress).toEqual({ step: 2 });
    });

    it('persists quest updates across instances', () => {
      state.updateQuest('q1', { progress: { step: 3 } });
      const state2 = new LocalGameState(storage);
      expect(state2.getQuestUpdates()['q1'].progress).toEqual({ step: 3 });
    });
  });

  // ── Inventory ──────────────────────────────────────────────────────────────

  describe('inventory management', () => {
    it('returns empty inventory for unknown entity', () => {
      const inv = state.getInventory('player');
      expect(inv).toEqual({ entityId: 'player', items: [], gold: 0 });
    });

    it('initializeInventory sets initial state only once', () => {
      state.initializeInventory('player', [{ id: 'sword', name: 'Sword', quantity: 1 }], 100);
      const inv = state.getInventory('player');
      expect(inv.items).toHaveLength(1);
      expect(inv.gold).toBe(100);

      // Second init should not overwrite
      state.initializeInventory('player', [], 0);
      const inv2 = state.getInventory('player');
      expect(inv2.items).toHaveLength(1);
      expect(inv2.gold).toBe(100);
    });
  });

  // ── Item Transfers ─────────────────────────────────────────────────────────

  describe('item transfers', () => {
    it('adds item to destination on transfer', () => {
      const result = state.transferItem({
        toEntityId: 'player',
        itemId: 'potion',
        itemName: 'Health Potion',
        itemType: 'consumable',
        quantity: 1,
        transactionType: 'quest_reward',
      });
      expect(result.success).toBe(true);
      const inv = state.getInventory('player');
      expect(inv.items).toHaveLength(1);
      expect(inv.items[0].name).toBe('Health Potion');
    });

    it('removes item from source on transfer', () => {
      state.initializeInventory('merchant', [
        { id: 'bread', name: 'Bread', quantity: 5 },
      ], 100);

      state.transferItem({
        fromEntityId: 'merchant',
        toEntityId: 'player',
        itemId: 'bread',
        itemName: 'Bread',
        quantity: 2,
        transactionType: 'buy',
        totalPrice: 4,
      });

      const merchantInv = state.getInventory('merchant');
      expect(merchantInv.items[0].quantity).toBe(3);

      const playerInv = state.getInventory('player');
      expect(playerInv.items[0].name).toBe('Bread');
      expect(playerInv.items[0].quantity).toBe(2);
    });

    it('removes item entirely when quantity drops to zero', () => {
      state.initializeInventory('player', [
        { id: 'key', name: 'Key', quantity: 1 },
      ], 0);

      state.transferItem({
        fromEntityId: 'player',
        itemId: 'key',
        quantity: 1,
        transactionType: 'discard',
      });

      const inv = state.getInventory('player');
      expect(inv.items).toHaveLength(0);
    });

    it('stacks items when adding to existing', () => {
      state.transferItem({
        toEntityId: 'player',
        itemId: 'coin',
        itemName: 'Gold Coin',
        quantity: 5,
        transactionType: 'quest_reward',
      });
      state.transferItem({
        toEntityId: 'player',
        itemId: 'coin',
        itemName: 'Gold Coin',
        quantity: 3,
        transactionType: 'quest_reward',
      });

      const inv = state.getInventory('player');
      expect(inv.items).toHaveLength(1);
      expect(inv.items[0].quantity).toBe(8);
    });

    it('handles buy transaction gold changes', () => {
      state.initializeInventory('player', [], 100);
      state.initializeInventory('merchant', [
        { id: 'sword', name: 'Sword', quantity: 1 },
      ], 50);

      state.transferItem({
        fromEntityId: 'merchant',
        toEntityId: 'player',
        itemId: 'sword',
        itemName: 'Sword',
        quantity: 1,
        transactionType: 'buy',
        totalPrice: 25,
      });

      expect(state.getInventory('player').gold).toBe(75);
    });

    it('handles sell transaction gold changes', () => {
      state.initializeInventory('player', [
        { id: 'gem', name: 'Gem', quantity: 1 },
      ], 10);

      state.transferItem({
        fromEntityId: 'player',
        toEntityId: 'merchant',
        itemId: 'gem',
        itemName: 'Gem',
        quantity: 1,
        transactionType: 'sell',
        totalPrice: 30,
      });

      expect(state.getInventory('player').gold).toBe(40);
    });
  });

  // ── Merchant Inventory ─────────────────────────────────────────────────────

  describe('merchant inventory', () => {
    it('returns null for unknown merchant', () => {
      expect(state.getMerchantInventory('unknown')).toBeNull();
    });

    it('caches and retrieves merchant inventory', () => {
      const inv = { merchantId: 'm1', items: [{ id: 'item1' }], goldReserve: 200 };
      state.setMerchantInventory('m1', inv);
      expect(state.getMerchantInventory('m1')).toEqual(inv);
    });

    it('persists merchant inventory across instances', () => {
      state.setMerchantInventory('m1', { items: [] });
      const state2 = new LocalGameState(storage);
      expect(state2.getMerchantInventory('m1')).toEqual({ items: [] });
    });
  });

  // ── Fines ──────────────────────────────────────────────────────────────────

  describe('fines', () => {
    it('payFines returns success with zero when no fines exist', () => {
      const result = state.payFines('settlement1');
      expect(result.success).toBe(true);
      expect(result.finesPaid).toBe(0);
    });

    it('tracks accumulated fines and clears on payment', () => {
      state.addFine('settlement1', 50);
      state.addFine('settlement1', 25);
      const result = state.payFines('settlement1');
      expect(result.finesPaid).toBe(75);

      // After payment, fines should be zero
      const result2 = state.payFines('settlement1');
      expect(result2.finesPaid).toBe(0);
    });
  });

  // ── Reset ──────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears all state and generates new playthrough ID', () => {
      const oldId = state.getPlaythroughId();
      state.updateQuest('q1', { status: 'done' });
      state.initializeInventory('player', [{ id: 'x' }], 100);
      state.addFine('s1', 50);

      state.reset();

      expect(state.getPlaythroughId()).not.toBe(oldId);
      expect(state.getQuestUpdates()).toEqual({});
      expect(state.getInventory('player').items).toEqual([]);
      expect(state.payFines('s1').finesPaid).toBe(0);
    });
  });

  // ── Corrupted storage ─────────────────────────────────────────────────────

  describe('corrupted storage recovery', () => {
    it('starts fresh when storage contains invalid JSON', () => {
      storage.setItem('insimul_local_state', 'not valid json!!!');
      const state2 = new LocalGameState(storage);
      expect(state2.getPlaythroughId()).toMatch(/^exported-/);
      expect(state2.getQuestUpdates()).toEqual({});
    });
  });
});
