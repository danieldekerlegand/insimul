/**
 * Tests for BusinessDetailCard helper logic
 *
 * Tests the data transformation functions used to compute
 * owner display name, employee counts, and inventory totals.
 */

import { describe, it, expect } from 'vitest';

// Helper functions extracted from BusinessDetailCard logic

function getOwnerDisplayName(owner: { firstName: string; lastName: string } | null): string {
  if (!owner) return 'Unknown';
  return `${owner.firstName} ${owner.lastName}`;
}

function computeTotalItems(
  containers: Array<{
    items: Array<{ itemId: string; itemName: string; quantity: number }> | null;
  }>
): number {
  return containers.reduce((sum, c) => {
    return sum + (c.items?.reduce((s, i) => s + i.quantity, 0) ?? 0);
  }, 0);
}

function formatInventorySummary(totalItems: number, containerCount: number): string {
  return `${totalItems} items in ${containerCount} containers`;
}

function formatEmployeeBadge(vocation: string, shift: string): string {
  return `${vocation} (${shift})`;
}

describe('BusinessDetailCard helpers', () => {
  describe('getOwnerDisplayName', () => {
    it('returns full name when owner exists', () => {
      expect(getOwnerDisplayName({ firstName: 'John', lastName: 'Smith' })).toBe('John Smith');
    });

    it('returns Unknown when owner is null', () => {
      expect(getOwnerDisplayName(null)).toBe('Unknown');
    });
  });

  describe('computeTotalItems', () => {
    it('returns 0 for empty containers array', () => {
      expect(computeTotalItems([])).toBe(0);
    });

    it('returns 0 when containers have null items', () => {
      expect(computeTotalItems([{ items: null }, { items: null }])).toBe(0);
    });

    it('returns 0 when containers have empty items', () => {
      expect(computeTotalItems([{ items: [] }])).toBe(0);
    });

    it('sums quantities across single container', () => {
      expect(computeTotalItems([{
        items: [
          { itemId: '1', itemName: 'Bread', quantity: 5 },
          { itemId: '2', itemName: 'Cheese', quantity: 3 },
        ],
      }])).toBe(8);
    });

    it('sums quantities across multiple containers', () => {
      expect(computeTotalItems([
        {
          items: [
            { itemId: '1', itemName: 'Bread', quantity: 5 },
          ],
        },
        {
          items: [
            { itemId: '2', itemName: 'Ale', quantity: 10 },
            { itemId: '3', itemName: 'Wine', quantity: 2 },
          ],
        },
      ])).toBe(17);
    });

    it('handles mix of null and populated items', () => {
      expect(computeTotalItems([
        { items: null },
        {
          items: [
            { itemId: '1', itemName: 'Sword', quantity: 1 },
          ],
        },
        { items: [] },
      ])).toBe(1);
    });
  });

  describe('formatInventorySummary', () => {
    it('formats zero state', () => {
      expect(formatInventorySummary(0, 0)).toBe('0 items in 0 containers');
    });

    it('formats single container with items', () => {
      expect(formatInventorySummary(5, 1)).toBe('5 items in 1 containers');
    });

    it('formats multiple containers with items', () => {
      expect(formatInventorySummary(42, 3)).toBe('42 items in 3 containers');
    });
  });

  describe('formatEmployeeBadge', () => {
    it('formats vocation and shift', () => {
      expect(formatEmployeeBadge('Baker', 'day')).toBe('Baker (day)');
    });

    it('formats night shift', () => {
      expect(formatEmployeeBadge('Bartender', 'night')).toBe('Bartender (night)');
    });
  });
});
