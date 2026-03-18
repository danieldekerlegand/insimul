/**
 * Tests for Base Items inclusion in all worlds by default.
 *
 * Verifies that base items are automatically included in world item queries,
 * can be disabled per-world via config, and that disabled items are filtered out.
 */

import { describe, it, expect, vi } from 'vitest';

// ── Helpers to simulate getItemsByWorld logic ───────────────────────────────

interface MockItem {
  id: string;
  name: string;
  worldId: string | null;
  isBase: boolean;
  objectRole: string | null;
}

function getItemsByWorldLogic(
  worldItems: MockItem[],
  baseItems: MockItem[],
  disabledBaseItemIds: string[] = []
): MockItem[] {
  const worldObjectRoles = new Set(worldItems.map(d => d.objectRole).filter(Boolean));
  const disabledSet = new Set(disabledBaseItemIds);
  const filteredBase = baseItems.filter(b =>
    (!b.objectRole || !worldObjectRoles.has(b.objectRole)) &&
    !disabledSet.has(b.id)
  );
  return [...worldItems, ...filteredBase];
}

// ── Toggle config logic (mirrors server route) ─────────────────────────────

function toggleBaseItem(
  config: { enabledBaseItems: string[]; disabledBaseItems: string[] },
  resourceId: string,
  enabled: boolean
) {
  const result = { ...config };
  if (enabled) {
    result.enabledBaseItems = [...result.enabledBaseItems.filter(id => id !== resourceId), resourceId];
    result.disabledBaseItems = result.disabledBaseItems.filter(id => id !== resourceId);
  } else {
    result.disabledBaseItems = [...result.disabledBaseItems.filter(id => id !== resourceId), resourceId];
    result.enabledBaseItems = result.enabledBaseItems.filter(id => id !== resourceId);
  }
  return result;
}

// ── isEnabled logic (mirrors client) ────────────────────────────────────────

function isBaseItemEnabled(
  itemId: string,
  config: { enabledBaseItems: string[]; disabledBaseItems: string[] }
): boolean {
  if (config.disabledBaseItems.includes(itemId)) return false;
  return config.enabledBaseItems.includes(itemId) || config.enabledBaseItems.length === 0;
}

// ── Test data ───────────────────────────────────────────────────────────────

const baseItem1: MockItem = { id: 'base-1', name: 'Iron Sword', worldId: null, isBase: true, objectRole: 'sword' };
const baseItem2: MockItem = { id: 'base-2', name: 'Health Potion', worldId: null, isBase: true, objectRole: 'potion' };
const baseItem3: MockItem = { id: 'base-3', name: 'Wooden Shield', worldId: null, isBase: true, objectRole: 'shield' };
const worldItem1: MockItem = { id: 'world-1', name: 'Custom Sword', worldId: 'w1', isBase: false, objectRole: 'sword' };
const worldItem2: MockItem = { id: 'world-2', name: 'Magic Gem', worldId: 'w1', isBase: false, objectRole: null };

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Base Items Inclusion', () => {
  describe('getItemsByWorld logic', () => {
    it('includes all base items when no world items exist', () => {
      const result = getItemsByWorldLogic([], [baseItem1, baseItem2, baseItem3]);
      expect(result).toHaveLength(3);
      expect(result.map(i => i.id)).toEqual(['base-1', 'base-2', 'base-3']);
    });

    it('merges base items with world items', () => {
      const result = getItemsByWorldLogic([worldItem2], [baseItem1, baseItem2, baseItem3]);
      expect(result).toHaveLength(4); // 1 world + 3 base
      expect(result[0].id).toBe('world-2');
    });

    it('world items override base items with same objectRole', () => {
      // worldItem1 has objectRole 'sword', same as baseItem1
      const result = getItemsByWorldLogic([worldItem1], [baseItem1, baseItem2, baseItem3]);
      expect(result).toHaveLength(3); // 1 world + 2 base (sword is overridden)
      expect(result.find(i => i.id === 'base-1')).toBeUndefined();
      expect(result.find(i => i.id === 'world-1')).toBeDefined();
    });

    it('filters out disabled base items', () => {
      const result = getItemsByWorldLogic([], [baseItem1, baseItem2, baseItem3], ['base-2']);
      expect(result).toHaveLength(2);
      expect(result.find(i => i.id === 'base-2')).toBeUndefined();
    });

    it('filters multiple disabled base items', () => {
      const result = getItemsByWorldLogic([], [baseItem1, baseItem2, baseItem3], ['base-1', 'base-3']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('base-2');
    });

    it('disabled list does not affect world items', () => {
      const result = getItemsByWorldLogic([worldItem2], [baseItem1], ['world-2']);
      expect(result).toHaveLength(2); // world item is unaffected
      expect(result.find(i => i.id === 'world-2')).toBeDefined();
    });

    it('empty disabled list includes all base items', () => {
      const result = getItemsByWorldLogic([], [baseItem1, baseItem2, baseItem3], []);
      expect(result).toHaveLength(3);
    });
  });

  describe('toggle config logic', () => {
    it('disabling adds to disabledBaseItems and removes from enabled', () => {
      const config = { enabledBaseItems: ['base-1'], disabledBaseItems: [] };
      const result = toggleBaseItem(config, 'base-1', false);
      expect(result.disabledBaseItems).toContain('base-1');
      expect(result.enabledBaseItems).not.toContain('base-1');
    });

    it('enabling adds to enabledBaseItems and removes from disabled', () => {
      const config = { enabledBaseItems: [], disabledBaseItems: ['base-1'] };
      const result = toggleBaseItem(config, 'base-1', true);
      expect(result.enabledBaseItems).toContain('base-1');
      expect(result.disabledBaseItems).not.toContain('base-1');
    });

    it('does not duplicate IDs when toggling same item', () => {
      let config = { enabledBaseItems: [], disabledBaseItems: [] };
      config = toggleBaseItem(config, 'base-1', false);
      config = toggleBaseItem(config, 'base-1', false); // toggle again
      expect(config.disabledBaseItems.filter(id => id === 'base-1')).toHaveLength(1);
    });

    it('handles toggling multiple items', () => {
      let config = { enabledBaseItems: [], disabledBaseItems: [] };
      config = toggleBaseItem(config, 'base-1', false);
      config = toggleBaseItem(config, 'base-2', false);
      config = toggleBaseItem(config, 'base-1', true); // re-enable base-1
      expect(config.disabledBaseItems).toEqual(['base-2']);
      expect(config.enabledBaseItems).toEqual(['base-1']);
    });
  });

  describe('isBaseItemEnabled (client logic)', () => {
    it('returns true by default (no config)', () => {
      const config = { enabledBaseItems: [], disabledBaseItems: [] };
      expect(isBaseItemEnabled('base-1', config)).toBe(true);
    });

    it('returns false when item is in disabledBaseItems', () => {
      const config = { enabledBaseItems: [], disabledBaseItems: ['base-1'] };
      expect(isBaseItemEnabled('base-1', config)).toBe(false);
    });

    it('returns true when item is in enabledBaseItems', () => {
      const config = { enabledBaseItems: ['base-1'], disabledBaseItems: [] };
      expect(isBaseItemEnabled('base-1', config)).toBe(true);
    });

    it('disabled takes precedence over enabled', () => {
      const config = { enabledBaseItems: ['base-1'], disabledBaseItems: ['base-1'] };
      expect(isBaseItemEnabled('base-1', config)).toBe(false);
    });

    it('items not in either list are enabled when enabledBaseItems is empty', () => {
      const config = { enabledBaseItems: [], disabledBaseItems: ['base-2'] };
      expect(isBaseItemEnabled('base-1', config)).toBe(true);
      expect(isBaseItemEnabled('base-2', config)).toBe(false);
    });
  });
});
