/**
 * Tests for the Mercantile Service — gold management, pricing, and transaction validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Top-level mocks ─────────────────────────────────────────────────────────

let mockTruths: any[] = [];

vi.mock('../db/storage', () => ({
  storage: {
    getTruthsByWorld: vi.fn(async () => mockTruths),
    createTruth: vi.fn(async (data: any) => {
      const truth = { ...data, id: `truth_${Date.now()}_${Math.random().toString(36).slice(2, 5)}` };
      mockTruths.push(truth);
      return truth;
    }),
    updateTruth: vi.fn(async (id: string, updates: any) => {
      const idx = mockTruths.findIndex((t: any) => t.id === id);
      if (idx >= 0) {
        mockTruths[idx] = { ...mockTruths[idx], ...updates };
      }
      return mockTruths[idx];
    }),
  },
}));

vi.mock('../services/playthrough-overlay', () => ({
  getTruthsWithOverlay: vi.fn(async () => mockTruths),
  createTruthInPlaythrough: vi.fn(async (_pid: string, data: any) => {
    const truth = { ...data, id: `pt_${Date.now()}_${Math.random().toString(36).slice(2, 5)}` };
    mockTruths.push(truth);
    return truth;
  }),
  updateTruthInPlaythrough: vi.fn(async (_pid: string, id: string, updates: any) => {
    const idx = mockTruths.findIndex((t: any) => t.id === id);
    if (idx >= 0) {
      mockTruths[idx] = { ...mockTruths[idx], ...updates };
    }
    return mockTruths[idx];
  }),
}));

import {
  calculateBuyPrice,
  calculateSellPrice,
  getGold,
  setGold,
  adjustGold,
  validateTransaction,
  executeGoldTransfer,
} from '../services/mercantile';
import { storage } from '../db/storage';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Mercantile Service', () => {
  beforeEach(() => {
    mockTruths = [];
    vi.clearAllMocks();
  });

  // ── Pure pricing functions ──────────────────────────────────────────────

  describe('calculateBuyPrice', () => {
    it('returns base value with default multiplier', () => {
      expect(calculateBuyPrice(100)).toBe(100);
    });

    it('applies buy multiplier', () => {
      expect(calculateBuyPrice(100, 1.5)).toBe(150);
    });

    it('returns minimum of 1 for zero value', () => {
      expect(calculateBuyPrice(0)).toBe(1);
    });

    it('floors fractional prices', () => {
      expect(calculateBuyPrice(10, 1.33)).toBe(13);
    });
  });

  describe('calculateSellPrice', () => {
    it('uses sellValue when provided', () => {
      expect(calculateSellPrice(100, 50)).toBe(50);
    });

    it('falls back to value * default multiplier when no sellValue', () => {
      expect(calculateSellPrice(100)).toBe(60);
    });

    it('falls back to value * custom multiplier', () => {
      expect(calculateSellPrice(100, undefined, 0.5)).toBe(50);
    });

    it('returns minimum of 1 for very low values', () => {
      expect(calculateSellPrice(1, undefined, 0.1)).toBe(1);
    });

    it('ignores sellValue of 0', () => {
      expect(calculateSellPrice(100, 0)).toBe(60);
    });
  });

  // ── Gold management ─────────────────────────────────────────────────────

  describe('getGold', () => {
    it('returns default starting gold when no truth exists', async () => {
      const gold = await getGold('world-1', 'player-1');
      expect(gold).toBe(100);
    });

    it('returns stored gold amount from truth', async () => {
      mockTruths.push({
        id: 'gold-truth-1',
        entryType: 'gold_balance',
        characterId: 'player-1',
        customData: { amount: 500 },
      });
      const gold = await getGold('world-1', 'player-1');
      expect(gold).toBe(500);
    });

    it('handles stringified customData', async () => {
      mockTruths.push({
        id: 'gold-truth-1',
        entryType: 'gold_balance',
        characterId: 'player-1',
        customData: JSON.stringify({ amount: 250 }),
      });
      const gold = await getGold('world-1', 'player-1');
      expect(gold).toBe(250);
    });
  });

  describe('setGold', () => {
    it('creates a new truth when none exists', async () => {
      const result = await setGold('world-1', 'player-1', 250);
      expect(result).toBe(250);
      expect(storage.createTruth).toHaveBeenCalledWith(
        expect.objectContaining({
          entryType: 'gold_balance',
          characterId: 'player-1',
          customData: expect.objectContaining({ amount: 250 }),
        }),
      );
    });

    it('updates existing truth', async () => {
      mockTruths.push({
        id: 'gold-truth-1',
        entryType: 'gold_balance',
        characterId: 'player-1',
        customData: { amount: 100 },
      });
      const result = await setGold('world-1', 'player-1', 300);
      expect(result).toBe(300);
      expect(storage.updateTruth).toHaveBeenCalledWith(
        'gold-truth-1',
        expect.objectContaining({
          customData: expect.objectContaining({ amount: 300 }),
        }),
      );
    });

    it('clamps negative values to 0', async () => {
      const result = await setGold('world-1', 'player-1', -50);
      expect(result).toBe(0);
    });

    it('floors fractional values', async () => {
      const result = await setGold('world-1', 'player-1', 99.7);
      expect(result).toBe(99);
    });
  });

  describe('adjustGold', () => {
    it('adds gold successfully', async () => {
      mockTruths.push({
        id: 'gold-truth-1',
        entryType: 'gold_balance',
        characterId: 'player-1',
        customData: { amount: 100 },
      });
      const result = await adjustGold('world-1', 'player-1', 50);
      expect(result).toEqual({ newBalance: 150 });
    });

    it('subtracts gold successfully', async () => {
      mockTruths.push({
        id: 'gold-truth-1',
        entryType: 'gold_balance',
        characterId: 'player-1',
        customData: { amount: 100 },
      });
      const result = await adjustGold('world-1', 'player-1', -30);
      expect(result).toEqual({ newBalance: 70 });
    });

    it('returns error on insufficient funds', async () => {
      mockTruths.push({
        id: 'gold-truth-1',
        entryType: 'gold_balance',
        characterId: 'player-1',
        customData: { amount: 30 },
      });
      const result = await adjustGold('world-1', 'player-1', -50);
      expect(result).toEqual({ error: 'insufficient_funds', available: 30 });
    });
  });

  describe('validateTransaction', () => {
    it('succeeds when buyer has enough gold', async () => {
      mockTruths.push(
        { id: 'g1', entryType: 'gold_balance', characterId: 'buyer', customData: { amount: 200 } },
        { id: 'g2', entryType: 'gold_balance', characterId: 'seller', customData: { amount: 50 } },
      );
      const result = await validateTransaction('world-1', 'buyer', 'seller', 150);
      expect(result.valid).toBe(true);
      expect(result.buyerGold).toBe(200);
      expect(result.sellerGold).toBe(50);
    });

    it('fails when buyer lacks gold', async () => {
      mockTruths.push(
        { id: 'g1', entryType: 'gold_balance', characterId: 'buyer', customData: { amount: 10 } },
        { id: 'g2', entryType: 'gold_balance', characterId: 'seller', customData: { amount: 50 } },
      );
      const result = await validateTransaction('world-1', 'buyer', 'seller', 150);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient gold');
    });
  });

  describe('executeGoldTransfer', () => {
    it('moves gold between entities', async () => {
      mockTruths.push(
        { id: 'g1', entryType: 'gold_balance', characterId: 'buyer', customData: { amount: 200 } },
        { id: 'g2', entryType: 'gold_balance', characterId: 'seller', customData: { amount: 50 } },
      );
      const result = await executeGoldTransfer('world-1', 'buyer', 'seller', 100);
      expect(result).toEqual({ buyerGold: 100, sellerGold: 150 });
    });

    it('rejects when buyer cannot afford', async () => {
      mockTruths.push(
        { id: 'g1', entryType: 'gold_balance', characterId: 'buyer', customData: { amount: 30 } },
        { id: 'g2', entryType: 'gold_balance', characterId: 'seller', customData: { amount: 50 } },
      );
      const result = await executeGoldTransfer('world-1', 'buyer', 'seller', 100);
      expect(result).toEqual(expect.objectContaining({ error: expect.any(String) }));
    });
  });
});
