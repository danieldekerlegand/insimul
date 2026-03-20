/**
 * Tests for exterior item placement in world locations.
 *
 * Verifies that items are correctly placed in exterior locations (vacant lots)
 * with appropriate position data for collection quests.
 */

import { describe, it, expect } from 'vitest';
import {
  EXTERIOR_ITEM_RULES,
  getExteriorLots,
  generateExteriorPosition,
  selectItemsForLocation,
  itemMatchesRules,
} from '../generators/item-placement-generator';
import type { Item, Lot } from '../../shared/schema';

// ── Mock data factories ─────────────────────────────────────────────────────

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    worldId: null,
    name: 'Test Item',
    description: 'A test item',
    itemType: 'collectible',
    icon: null,
    value: 10,
    sellValue: 5,
    weight: 1,
    tradeable: true,
    stackable: true,
    maxStack: 99,
    worldType: null,
    objectRole: null,
    category: null,
    material: null,
    baseType: null,
    rarity: 'common',
    effects: null,
    lootWeight: 1,
    tags: ['collectible'],
    isBase: true,
    possessable: true,
    metadata: {},
    craftingRecipe: null,
    questRelevance: [],
    loreText: null,
    languageLearningData: null,
    relatedTruthIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Item;
}

function makeLot(overrides: Partial<Lot> = {}): Lot {
  return {
    id: 'lot-1',
    worldId: 'world-1',
    settlementId: 'settlement-1',
    address: '123 Main St',
    houseNumber: 123,
    streetName: 'Main St',
    block: null,
    districtName: null,
    buildingId: null,
    buildingType: 'vacant',
    positionX: 10,
    positionZ: 20,
    facingAngle: 0,
    elevation: 0,
    lotWidth: 12,
    lotDepth: 16,
    streetEdgeId: null,
    distanceAlongStreet: 0,
    side: 'left',
    blockId: null,
    foundationType: 'flat',
    neighboringLotIds: [],
    distanceFromDowntown: 0,
    formerBuildingIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Lot;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Exterior Item Placement', () => {
  describe('EXTERIOR_ITEM_RULES', () => {
    it('defines valid tag and type arrays', () => {
      expect(EXTERIOR_ITEM_RULES.tags.length).toBeGreaterThan(0);
      expect(EXTERIOR_ITEM_RULES.itemTypes.length).toBeGreaterThan(0);
    });

    it('has reasonable min/max bounds', () => {
      expect(EXTERIOR_ITEM_RULES.min).toBeGreaterThanOrEqual(1);
      expect(EXTERIOR_ITEM_RULES.max).toBeGreaterThanOrEqual(EXTERIOR_ITEM_RULES.min);
    });

    it('matches collectible items', () => {
      const collectible = makeItem({ itemType: 'collectible', tags: ['collectible'] });
      expect(itemMatchesRules(collectible, EXTERIOR_ITEM_RULES)).toBe(true);
    });

    it('matches material items', () => {
      const material = makeItem({ itemType: 'material', tags: ['material'] });
      expect(itemMatchesRules(material, EXTERIOR_ITEM_RULES)).toBe(true);
    });

    it('does not match armor items without matching tags', () => {
      const armor = makeItem({ itemType: 'armor', tags: ['heavy'] });
      expect(itemMatchesRules(armor, EXTERIOR_ITEM_RULES)).toBe(false);
    });
  });

  describe('getExteriorLots', () => {
    it('returns vacant lots', () => {
      const lots = [
        makeLot({ id: 'vacant-1', buildingType: 'vacant' }),
        makeLot({ id: 'biz-1', buildingType: 'business' }),
        makeLot({ id: 'res-1', buildingType: 'residence' }),
      ];
      const exterior = getExteriorLots(lots);
      expect(exterior).toHaveLength(1);
      expect(exterior[0].id).toBe('vacant-1');
    });

    it('returns lots with null buildingType', () => {
      const lots = [
        makeLot({ id: 'null-1', buildingType: null as any }),
        makeLot({ id: 'biz-1', buildingType: 'business' }),
      ];
      const exterior = getExteriorLots(lots);
      expect(exterior).toHaveLength(1);
      expect(exterior[0].id).toBe('null-1');
    });

    it('returns empty array when all lots have buildings', () => {
      const lots = [
        makeLot({ id: 'biz-1', buildingType: 'business' }),
        makeLot({ id: 'res-1', buildingType: 'residence' }),
      ];
      expect(getExteriorLots(lots)).toHaveLength(0);
    });

    it('returns empty array for empty input', () => {
      expect(getExteriorLots([])).toHaveLength(0);
    });

    it('returns multiple vacant lots', () => {
      const lots = [
        makeLot({ id: 'v1', buildingType: 'vacant' }),
        makeLot({ id: 'v2', buildingType: 'vacant' }),
        makeLot({ id: 'b1', buildingType: 'business' }),
        makeLot({ id: 'v3', buildingType: 'vacant' }),
      ];
      expect(getExteriorLots(lots)).toHaveLength(3);
    });
  });

  describe('generateExteriorPosition', () => {
    it('generates position near the lot center', () => {
      const lot = makeLot({ positionX: 50, positionZ: 100, lotWidth: 12, lotDepth: 16 });
      const pos = generateExteriorPosition(lot);
      // Should be within lot bounds (50 ± 6, 100 ± 8)
      expect(pos.x).toBeGreaterThanOrEqual(50 - 6);
      expect(pos.x).toBeLessThanOrEqual(50 + 6);
      expect(pos.z).toBeGreaterThanOrEqual(100 - 8);
      expect(pos.z).toBeLessThanOrEqual(100 + 8);
    });

    it('handles lots with zero position', () => {
      const lot = makeLot({ positionX: 0, positionZ: 0, lotWidth: 10, lotDepth: 10 });
      const pos = generateExteriorPosition(lot);
      expect(pos.x).toBeGreaterThanOrEqual(-5);
      expect(pos.x).toBeLessThanOrEqual(5);
      expect(pos.z).toBeGreaterThanOrEqual(-5);
      expect(pos.z).toBeLessThanOrEqual(5);
    });

    it('handles lots with null position (defaults to 0)', () => {
      const lot = makeLot({ positionX: null as any, positionZ: null as any });
      const pos = generateExteriorPosition(lot);
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.z).toBe('number');
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);
    });

    it('returns positions rounded to 2 decimal places', () => {
      const lot = makeLot({ positionX: 10.123, positionZ: 20.456 });
      const pos = generateExteriorPosition(lot);
      const xDecimals = pos.x.toString().split('.')[1]?.length ?? 0;
      const zDecimals = pos.z.toString().split('.')[1]?.length ?? 0;
      expect(xDecimals).toBeLessThanOrEqual(2);
      expect(zDecimals).toBeLessThanOrEqual(2);
    });

    it('generates different positions across calls (statistical)', () => {
      const lot = makeLot({ positionX: 50, positionZ: 50, lotWidth: 20, lotDepth: 20 });
      const positions = Array.from({ length: 10 }, () => generateExteriorPosition(lot));
      // At least some positions should differ (extremely unlikely all 10 are identical)
      const uniqueX = new Set(positions.map(p => p.x));
      expect(uniqueX.size).toBeGreaterThan(1);
    });
  });

  describe('selectItemsForLocation with EXTERIOR_ITEM_RULES', () => {
    it('selects items matching exterior rules', () => {
      const items = [
        makeItem({ id: '1', name: 'Stone', itemType: 'material', tags: ['material'] }),
        makeItem({ id: '2', name: 'Gem', itemType: 'collectible', tags: ['collectible'] }),
        makeItem({ id: '3', name: 'Sword', itemType: 'weapon', tags: ['weapon'] }),
      ];
      const selected = selectItemsForLocation(items, EXTERIOR_ITEM_RULES);
      // Should only select material/collectible items, not weapon
      for (const item of selected) {
        expect(item.itemType).not.toBe('weapon');
      }
    });

    it('returns empty array when no items match', () => {
      const items = [
        makeItem({ id: '1', name: 'Sword', itemType: 'weapon', tags: ['weapon'] }),
        makeItem({ id: '2', name: 'Plate Armor', itemType: 'armor', tags: ['heavy'] }),
      ];
      const selected = selectItemsForLocation(items, EXTERIOR_ITEM_RULES);
      expect(selected).toHaveLength(0);
    });

    it('respects min/max bounds', () => {
      const items = Array.from({ length: 20 }, (_, i) =>
        makeItem({ id: `item-${i}`, name: `Item ${i}`, itemType: 'collectible', tags: ['collectible'] }),
      );
      const selected = selectItemsForLocation(items, EXTERIOR_ITEM_RULES);
      expect(selected.length).toBeGreaterThanOrEqual(EXTERIOR_ITEM_RULES.min);
      expect(selected.length).toBeLessThanOrEqual(EXTERIOR_ITEM_RULES.max);
    });

    it('filters by world type', () => {
      const items = [
        makeItem({ id: '1', name: 'Medieval Gem', itemType: 'collectible', tags: ['collectible'], worldType: 'medieval-fantasy' }),
        makeItem({ id: '2', name: 'Cyber Chip', itemType: 'collectible', tags: ['collectible'], worldType: 'cyberpunk' }),
        makeItem({ id: '3', name: 'Universal Rock', itemType: 'material', tags: ['material'], worldType: null }),
      ];
      const selected = selectItemsForLocation(items, EXTERIOR_ITEM_RULES, 'medieval-fantasy');
      // Should not include cyberpunk item
      for (const item of selected) {
        expect(item.worldType).not.toBe('cyberpunk');
      }
    });
  });
});
