/**
 * Tests for the Spending Sinks Service — recurring gold drains and economic pressure.
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
  calculateHousingCost,
  calculateFoodCost,
  calculateMaintenanceCost,
  calculateTax,
  calculateSpendingSinks,
  applySpendingSinks,
  processWorldSpendingSinks,
  DEFAULT_CONFIG,
} from '../services/spending-sinks';
import { setGold, getGold } from '../services/mercantile';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Spending Sinks Service', () => {
  beforeEach(() => {
    mockTruths = [];
    vi.clearAllMocks();
  });

  // ── Pure calculation functions ──────────────────────────────────────────

  describe('calculateHousingCost', () => {
    it('scales with residence quality', () => {
      expect(calculateHousingCost(1.0)).toBe(5);   // baseRent * 1.0
      expect(calculateHousingCost(0.5)).toBe(3);   // baseRent * 0.5 rounded
    });

    it('enforces minimum quality of 0.2', () => {
      expect(calculateHousingCost(0)).toBe(1);     // baseRent * 0.2 = 1
      expect(calculateHousingCost(0.1)).toBe(1);   // baseRent * 0.2 = 1 (clamped)
    });

    it('returns 0 for zero base rent config', () => {
      expect(calculateHousingCost(1.0, { ...DEFAULT_CONFIG, baseRent: 0 })).toBe(0);
    });
  });

  describe('calculateFoodCost', () => {
    it('returns base food cost', () => {
      expect(calculateFoodCost()).toBe(3);
    });

    it('respects custom config', () => {
      expect(calculateFoodCost({ ...DEFAULT_CONFIG, baseFoodCost: 10 })).toBe(10);
    });
  });

  describe('calculateMaintenanceCost', () => {
    it('calculates percentage of equipped item value', () => {
      expect(calculateMaintenanceCost(100)).toBe(2);   // 100 * 0.02
      expect(calculateMaintenanceCost(500)).toBe(10);  // 500 * 0.02
    });

    it('returns 0 for no equipment', () => {
      expect(calculateMaintenanceCost(0)).toBe(0);
    });

    it('rounds to nearest integer', () => {
      expect(calculateMaintenanceCost(75)).toBe(2);    // 75 * 0.02 = 1.5 → 2
    });
  });

  describe('calculateTax', () => {
    it('exempts poor characters', () => {
      expect(calculateTax(50)).toBe(0);    // at poverty exemption
      expect(calculateTax(30)).toBe(0);    // below poverty exemption
    });

    it('applies no tax below first bracket', () => {
      expect(calculateTax(100)).toBe(0);   // 100 < 500 threshold
      expect(calculateTax(499)).toBe(0);
    });

    it('applies first bracket for moderate wealth', () => {
      expect(calculateTax(600)).toBe(12);  // 600 * 0.02
    });

    it('applies second bracket for higher wealth', () => {
      expect(calculateTax(3000)).toBe(150); // 3000 * 0.05
    });

    it('applies highest bracket for rich characters', () => {
      expect(calculateTax(15000)).toBe(1200); // 15000 * 0.08
    });
  });

  describe('calculateSpendingSinks', () => {
    it('returns full breakdown for a normal character', () => {
      const result = calculateSpendingSinks(500, 0.5, 100);
      expect(result.housing).toBeGreaterThan(0);
      expect(result.food).toBe(3);
      expect(result.maintenance).toBe(2);
      expect(result.tax).toBe(0); // 500 is exactly at threshold, not above
      expect(result.total).toBe(result.housing + result.food + result.maintenance + result.tax);
    });

    it('exempts poor characters from housing and tax', () => {
      const result = calculateSpendingSinks(30, 0.5, 0);
      expect(result.housing).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.food).toBe(3); // still must eat
      expect(result.total).toBe(3);
    });

    it('sums all components correctly', () => {
      const result = calculateSpendingSinks(3000, 1.0, 200);
      expect(result.total).toBe(result.housing + result.food + result.maintenance + result.tax);
      expect(result.housing).toBe(5);
      expect(result.food).toBe(3);
      expect(result.maintenance).toBe(4);
      expect(result.tax).toBe(150);
      expect(result.total).toBe(162);
    });
  });

  // ── Integration with gold persistence ──────────────────────────────────

  describe('applySpendingSinks', () => {
    it('deducts gold from a character', async () => {
      await setGold('world-1', 'player-1', 500);
      const result = await applySpendingSinks({
        entityId: 'player-1',
        worldId: 'world-1',
        residenceQuality: 0.5,
        equippedItemsTotalValue: 100,
      });

      expect(result.goldBefore).toBe(500);
      expect(result.goldAfter).toBeLessThan(500);
      expect(result.inDebt).toBe(false);
      expect(result.breakdown.total).toBeGreaterThan(0);
    });

    it('sets gold to 0 and flags debt when character cannot afford', async () => {
      await setGold('world-1', 'poor-npc', 2);
      const result = await applySpendingSinks({
        entityId: 'poor-npc',
        worldId: 'world-1',
        residenceQuality: 0.5,
        equippedItemsTotalValue: 0,
      });

      expect(result.goldAfter).toBe(0);
      expect(result.inDebt).toBe(true);
    });

    it('does nothing when total sink is 0', async () => {
      await setGold('world-1', 'player-1', 30);
      const result = await applySpendingSinks(
        {
          entityId: 'player-1',
          worldId: 'world-1',
          residenceQuality: 0,
          equippedItemsTotalValue: 0,
        },
        0,
        { ...DEFAULT_CONFIG, baseFoodCost: 0 },
      );

      // Poor + 0 food + 0 maintenance + 0 tax = 0 total
      expect(result.goldAfter).toBe(30);
      expect(result.breakdown.total).toBe(0);
    });
  });

  describe('processWorldSpendingSinks', () => {
    it('processes multiple characters and sums totals', async () => {
      await setGold('world-1', 'char-a', 1000);
      await setGold('world-1', 'char-b', 500);
      await setGold('world-1', 'char-c', 1);

      const { results, totalDrained, charactersInDebt } = await processWorldSpendingSinks(
        'world-1',
        [
          { entityId: 'char-a', worldId: 'world-1', residenceQuality: 0.8, equippedItemsTotalValue: 200 },
          { entityId: 'char-b', worldId: 'world-1', residenceQuality: 0.5, equippedItemsTotalValue: 0 },
          { entityId: 'char-c', worldId: 'world-1', residenceQuality: 0.3, equippedItemsTotalValue: 0 },
        ],
      );

      expect(results).toHaveLength(3);
      expect(totalDrained).toBeGreaterThan(0);
      expect(charactersInDebt).toBeGreaterThanOrEqual(1); // char-c with 1 gold can't cover food
    });

    it('returns 0 drain for empty character list', async () => {
      const { results, totalDrained, charactersInDebt } = await processWorldSpendingSinks(
        'world-1',
        [],
      );

      expect(results).toHaveLength(0);
      expect(totalDrained).toBe(0);
      expect(charactersInDebt).toBe(0);
    });
  });
});
