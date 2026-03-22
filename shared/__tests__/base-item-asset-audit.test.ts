import { describe, it, expect } from 'vitest';
import {
  BASE_ITEM_CATALOG,
  EXISTING_ASSETS,
  OBJECT_ROLE_TO_ASSET,
  ASSET_RECOMMENDATIONS,
  buildItemAssetMappings,
  generateAuditSummary,
  getUnresolvedItems,
  getItemsByWorldType,
  type AuditItem,
} from '../audits/base-item-asset-audit';

describe('Base Item Asset Audit', () => {
  describe('BASE_ITEM_CATALOG', () => {
    it('contains all 270 base items', () => {
      expect(BASE_ITEM_CATALOG.length).toBe(270);
    });

    it('has no duplicate items (name + worldType)', () => {
      const keys = BASE_ITEM_CATALOG.map(
        (item) => `${item.name}::${item.worldType ?? 'universal'}`
      );
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('every item has required fields', () => {
      for (const item of BASE_ITEM_CATALOG) {
        expect(item.name).toBeTruthy();
        expect(item.itemType).toBeTruthy();
        expect(item.category).toBeTruthy();
        expect(item.rarity).toBeTruthy();
        expect(typeof item.possessable).toBe('boolean');
      }
    });

    it('covers all expected world types', () => {
      const worldTypes = new Set(
        BASE_ITEM_CATALOG.map((i) => i.worldType ?? 'universal')
      );
      expect(worldTypes).toContain('universal');
      expect(worldTypes).toContain('medieval-fantasy');
      expect(worldTypes).toContain('cyberpunk');
      expect(worldTypes).toContain('sci-fi-space');
      expect(worldTypes).toContain('western');
      expect(worldTypes).toContain('historical-ancient');
      expect(worldTypes).toContain('post-apocalyptic');
      expect(worldTypes).toContain('tropical-pirate');
      expect(worldTypes).toContain('steampunk');
      expect(worldTypes).toContain('modern-realistic');
    });

    it('covers all item types', () => {
      const itemTypes = new Set(BASE_ITEM_CATALOG.map((i) => i.itemType));
      expect(itemTypes).toContain('weapon');
      expect(itemTypes).toContain('armor');
      expect(itemTypes).toContain('consumable');
      expect(itemTypes).toContain('food');
      expect(itemTypes).toContain('drink');
      expect(itemTypes).toContain('tool');
      expect(itemTypes).toContain('material');
      expect(itemTypes).toContain('collectible');
      expect(itemTypes).toContain('key');
      expect(itemTypes).toContain('quest');
    });

    it('furniture items are not possessable', () => {
      const furniture = BASE_ITEM_CATALOG.filter(
        (i) => i.category === 'furniture'
      );
      expect(furniture.length).toBeGreaterThan(0);
      for (const item of furniture) {
        expect(item.possessable).toBe(false);
      }
    });
  });

  describe('OBJECT_ROLE_TO_ASSET', () => {
    it('maps all objectRoles found in the catalog', () => {
      const catalogRoles = new Set(
        BASE_ITEM_CATALOG.filter((i) => i.objectRole !== null).map(
          (i) => i.objectRole!
        )
      );
      for (const role of catalogRoles) {
        expect(OBJECT_ROLE_TO_ASSET).toHaveProperty(role);
      }
    });
  });

  describe('buildItemAssetMappings', () => {
    const mappings = buildItemAssetMappings();

    it('returns one mapping per catalog item', () => {
      expect(mappings.length).toBe(BASE_ITEM_CATALOG.length);
    });

    it('correctly identifies items with objectRole', () => {
      const withRole = mappings.filter((m) => m.hasObjectRole);
      const catalogWithRole = BASE_ITEM_CATALOG.filter(
        (i) => i.objectRole !== null
      );
      expect(withRole.length).toBe(catalogWithRole.length);
    });

    it('items with objectRole have existing asset IDs', () => {
      const withRole = mappings.filter((m) => m.hasObjectRole);
      for (const m of withRole) {
        expect(m.existingAssetId).toBeTruthy();
      }
    });
  });

  describe('generateAuditSummary', () => {
    const summary = generateAuditSummary();

    it('total equals catalog size', () => {
      expect(summary.totalItems).toBe(BASE_ITEM_CATALOG.length);
    });

    it('withObjectRole + withoutObjectRole = totalItems', () => {
      expect(summary.withObjectRole + summary.withoutObjectRole).toBe(
        summary.totalItems
      );
    });

    it('mapped counts are consistent', () => {
      expect(
        summary.withExisting3DAsset + summary.withRecommendation + summary.unresolved
      ).toBe(summary.totalItems);
    });

    it('byWorldType totals sum to totalItems', () => {
      const sum = Object.values(summary.byWorldType).reduce(
        (acc, v) => acc + v.total,
        0
      );
      expect(sum).toBe(summary.totalItems);
    });

    it('byItemType totals sum to totalItems', () => {
      const sum = Object.values(summary.byItemType).reduce(
        (acc, v) => acc + v.total,
        0
      );
      expect(sum).toBe(summary.totalItems);
    });

    it('most items have either an existing asset or a recommendation', () => {
      const coveragePercent =
        ((summary.withExisting3DAsset + summary.withRecommendation) /
          summary.totalItems) *
        100;
      // We should have at least 90% coverage
      expect(coveragePercent).toBeGreaterThan(90);
    });
  });

  describe('getUnresolvedItems', () => {
    const unresolved = getUnresolvedItems();

    it('returns only items without existing assets or recommendations', () => {
      for (const m of unresolved) {
        expect(m.hasExisting3DAsset).toBe(false);
        expect(m.recommendation).toBeUndefined();
      }
    });

    it('unresolved count matches summary', () => {
      const summary = generateAuditSummary();
      expect(unresolved.length).toBe(summary.unresolved);
    });
  });

  describe('getItemsByWorldType', () => {
    const grouped = getItemsByWorldType();

    it('has a key for each world type in the catalog', () => {
      const worldTypes = new Set(
        BASE_ITEM_CATALOG.map((i) => i.worldType ?? 'universal')
      );
      for (const wt of worldTypes) {
        expect(grouped).toHaveProperty(wt);
        expect(grouped[wt].length).toBeGreaterThan(0);
      }
    });

    it('total items across groups equals catalog size', () => {
      const total = Object.values(grouped).reduce(
        (acc, items) => acc + items.length,
        0
      );
      expect(total).toBe(BASE_ITEM_CATALOG.length);
    });
  });

  describe('ASSET_RECOMMENDATIONS coverage', () => {
    it('all items now have objectRoles assigned', () => {
      const withoutRole = BASE_ITEM_CATALOG.filter(
        (i) => i.objectRole === null
      );
      expect(withoutRole.length).toBe(0);
    });

    it('all recommendations have valid source and format', () => {
      const validSources = [
        'polyhaven',
        'sketchfab',
        'quaternius',
        'kaykit',
        'kenney',
        'opengameart',
        'custom',
      ];
      const validFormats = ['gltf', 'glb'];
      for (const [, rec] of Object.entries(ASSET_RECOMMENDATIONS)) {
        expect(validSources).toContain(rec.source);
        expect(validFormats).toContain(rec.format);
        expect(rec.assetId).toBeTruthy();
        expect(rec.license).toBeTruthy();
      }
    });
  });

  describe('complete objectRole coverage', () => {
    it('every item in the catalog has a non-null objectRole', () => {
      for (const item of BASE_ITEM_CATALOG) {
        expect(item.objectRole).not.toBeNull();
      }
    });

    it('every objectRole maps to an entry in OBJECT_ROLE_TO_ASSET', () => {
      const roles = new Set(
        BASE_ITEM_CATALOG.map((i) => i.objectRole!).filter(Boolean)
      );
      for (const role of roles) {
        expect(
          OBJECT_ROLE_TO_ASSET[role],
          `Missing OBJECT_ROLE_TO_ASSET entry for role: ${role}`
        ).toBeTruthy();
      }
    });

    it('100% of items have an existing 3D asset mapping', () => {
      const summary = generateAuditSummary();
      expect(summary.withObjectRole).toBe(summary.totalItems);
      expect(summary.withoutObjectRole).toBe(0);
    });
  });
});
