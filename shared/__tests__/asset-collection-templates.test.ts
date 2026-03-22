import { describe, it, expect } from 'vitest';
import {
  COLLECTION_TEMPLATES,
  COMMON_OBJECT_MODELS,
  mergeWithCommon,
  getTemplateForWorldType,
  type TemplateAssetEntry,
} from '../../server/services/asset-collection-templates';
import {
  BASE_ITEM_CATALOG,
  OBJECT_ROLE_TO_ASSET,
} from '../audits/base-item-asset-audit';

describe('Asset Collection Templates', () => {
  describe('COMMON_OBJECT_MODELS', () => {
    it('covers all objectRoles used by base items', () => {
      const itemRoles = new Set(
        BASE_ITEM_CATALOG.filter((i) => i.objectRole !== null).map(
          (i) => i.objectRole!
        )
      );
      const commonRoles = new Set(
        COMMON_OBJECT_MODELS.map((a) => a.slotKey)
      );
      const missing: string[] = [];
      for (const role of itemRoles) {
        if (!commonRoles.has(role)) {
          missing.push(role);
        }
      }
      expect(
        missing,
        `COMMON_OBJECT_MODELS missing roles: ${missing.join(', ')}`
      ).toHaveLength(0);
    });

    it('all entries have valid slotCategory', () => {
      for (const entry of COMMON_OBJECT_MODELS) {
        expect(entry.slotCategory).toBe('objectModels');
      }
    });

    it('has no duplicate slotKeys', () => {
      const keys = COMMON_OBJECT_MODELS.map((a) => a.slotKey);
      const unique = new Set(keys);
      expect(unique.size).toBe(keys.length);
    });

    it('all polyhavenIds are non-empty strings', () => {
      for (const entry of COMMON_OBJECT_MODELS) {
        expect(entry.polyhavenId).toBeTruthy();
      }
    });
  });

  describe('mergeWithCommon', () => {
    it('includes all common models when template has no objectModels', () => {
      const result = mergeWithCommon([
        { polyhavenId: 'tree_01', slotCategory: 'natureModels', slotKey: 'tree', assetType: 'model_nature', name: 'Tree' },
      ]);
      expect(result.length).toBe(1 + COMMON_OBJECT_MODELS.length);
    });

    it('template-specific objectModels override common ones', () => {
      const override: TemplateAssetEntry = {
        polyhavenId: 'custom_sword',
        slotCategory: 'objectModels',
        slotKey: 'sword',
        assetType: 'model_prop',
        name: 'Custom Sword',
      };
      const result = mergeWithCommon([override]);
      const swordEntries = result.filter((a) => a.slotKey === 'sword' && a.slotCategory === 'objectModels');
      expect(swordEntries.length).toBe(1);
      expect(swordEntries[0].polyhavenId).toBe('custom_sword');
    });

    it('questObjectModels entries are not overridden by common objectModels', () => {
      const questEntry: TemplateAssetEntry = {
        polyhavenId: 'quest_sword',
        slotCategory: 'questObjectModels',
        slotKey: 'sword',
        assetType: 'model_prop',
        name: 'Quest Sword',
      };
      const result = mergeWithCommon([questEntry]);
      const questSwords = result.filter(
        (a) => a.slotKey === 'sword' && a.slotCategory === 'questObjectModels'
      );
      const objectSwords = result.filter(
        (a) => a.slotKey === 'sword' && a.slotCategory === 'objectModels'
      );
      expect(questSwords.length).toBe(1);
      expect(questSwords[0].polyhavenId).toBe('quest_sword');
      // Common sword should still be present in objectModels since questObjectModels doesn't override it
      expect(objectSwords.length).toBe(1);
    });
  });

  describe('COLLECTION_TEMPLATES', () => {
    const templateKeys = Object.keys(COLLECTION_TEMPLATES);

    it('all templates include common object models', () => {
      for (const key of templateKeys) {
        const template = COLLECTION_TEMPLATES[key];
        const objectModelSlots = new Set(
          template.assets
            .filter((a) => a.slotCategory === 'objectModels')
            .map((a) => a.slotKey)
        );
        // Every common role should be present
        for (const common of COMMON_OBJECT_MODELS) {
          expect(
            objectModelSlots.has(common.slotKey),
            `Template "${key}" missing objectModel for role: ${common.slotKey}`
          ).toBe(true);
        }
      }
    });

    it('every template has a non-empty assets array', () => {
      for (const key of templateKeys) {
        expect(COLLECTION_TEMPLATES[key].assets.length).toBeGreaterThan(0);
      }
    });

    it('template assets are larger than common (includes theme + common)', () => {
      for (const key of templateKeys) {
        expect(COLLECTION_TEMPLATES[key].assets.length).toBeGreaterThanOrEqual(
          COMMON_OBJECT_MODELS.length
        );
      }
    });
  });

  describe('getTemplateForWorldType', () => {
    it('returns exact match', () => {
      const template = getTemplateForWorldType('medieval-fantasy');
      expect(template).not.toBeNull();
      expect(template!.worldType).toBe('medieval-fantasy');
    });

    it('returns fallback for unknown type', () => {
      const template = getTemplateForWorldType('alien-world-xyz');
      expect(template).not.toBeNull();
    });
  });
});
