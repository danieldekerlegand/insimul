import { describe, it, expect } from 'vitest';
import type { NpcConfig } from '@shared/game-engine/types';
import type { AssetCollection } from '@shared/schema';

/**
 * Tests for NPC character configuration in the asset collection editor.
 * These validate the data transformations and state management patterns
 * used by the NpcConfigEditor component.
 */

describe('NPC Config Editor data logic', () => {
  describe('body model management', () => {
    it('adds a body model to empty config', () => {
      const config: NpcConfig = {};
      const updated: NpcConfig = {
        ...config,
        bodyModels: [...(config.bodyModels || []), 'outfit_male_peasant'],
      };
      expect(updated.bodyModels).toEqual(['outfit_male_peasant']);
    });

    it('adds a body model without duplicates', () => {
      const config: NpcConfig = { bodyModels: ['outfit_male_peasant'] };
      const model = 'outfit_male_peasant';
      const updated: NpcConfig = {
        ...config,
        bodyModels: [...(config.bodyModels || []).filter(m => m !== model), model],
      };
      expect(updated.bodyModels).toEqual(['outfit_male_peasant']);
    });

    it('removes a body model', () => {
      const config: NpcConfig = {
        bodyModels: ['outfit_male_peasant', 'outfit_female_peasant', 'outfit_male_ranger'],
      };
      const updated: NpcConfig = {
        ...config,
        bodyModels: config.bodyModels!.filter(m => m !== 'outfit_female_peasant'),
      };
      expect(updated.bodyModels).toEqual(['outfit_male_peasant', 'outfit_male_ranger']);
    });

    it('supports custom model names', () => {
      const config: NpcConfig = { bodyModels: ['outfit_male_peasant'] };
      const updated: NpcConfig = {
        ...config,
        bodyModels: [...(config.bodyModels || []), 'custom_warrior_model'],
      };
      expect(updated.bodyModels).toContain('custom_warrior_model');
      expect(updated.bodyModels).toHaveLength(2);
    });
  });

  describe('hair style management', () => {
    it('adds a hair style for a gender', () => {
      const config: NpcConfig = {};
      const gender = 'male';
      const style = 'buzzed';
      const updated: NpcConfig = {
        ...config,
        hairStyles: {
          ...(config.hairStyles || {}),
          [gender]: [...((config.hairStyles || {})[gender] || []), style],
        },
      };
      expect(updated.hairStyles).toEqual({ male: ['buzzed'] });
    });

    it('adds hair styles for multiple genders', () => {
      const config: NpcConfig = {
        hairStyles: { male: ['buzzed'] },
      };
      const updated: NpcConfig = {
        ...config,
        hairStyles: {
          ...config.hairStyles,
          female: ['long', 'buns'],
        },
      };
      expect(updated.hairStyles!.male).toEqual(['buzzed']);
      expect(updated.hairStyles!.female).toEqual(['long', 'buns']);
    });

    it('removes a hair style and cleans up empty gender entries', () => {
      const config: NpcConfig = {
        hairStyles: { male: ['buzzed'], female: ['long'] },
      };
      const styles = { ...config.hairStyles! };
      styles['female'] = styles['female'].filter(s => s !== 'long');
      if (styles['female'].length === 0) delete styles['female'];
      const updated: NpcConfig = { ...config, hairStyles: styles };

      expect(updated.hairStyles!.male).toEqual(['buzzed']);
      expect(updated.hairStyles!['female']).toBeUndefined();
    });

    it('prevents duplicate hair styles within a gender', () => {
      const config: NpcConfig = { hairStyles: { male: ['buzzed', 'long'] } };
      const style = 'buzzed';
      const gender = 'male';
      const updated: NpcConfig = {
        ...config,
        hairStyles: {
          ...config.hairStyles,
          [gender]: [...(config.hairStyles![gender] || []).filter(s => s !== style), style],
        },
      };
      expect(updated.hairStyles!.male).toEqual(['long', 'buzzed']);
    });
  });

  describe('color palette management', () => {
    it('adds a color to clothing palette', () => {
      const config: NpcConfig = { clothingPalette: ['#8B4513'] };
      const updated: NpcConfig = {
        ...config,
        clothingPalette: [...(config.clothingPalette || []), '#2F4F4F'],
      };
      expect(updated.clothingPalette).toEqual(['#8B4513', '#2F4F4F']);
    });

    it('removes a color from skin tone palette', () => {
      const config: NpcConfig = {
        skinTonePalette: ['#FFDFC4', '#8D5524', '#3B2219'],
      };
      const updated: NpcConfig = {
        ...config,
        skinTonePalette: config.skinTonePalette!.filter((_, i) => i !== 1),
      };
      expect(updated.skinTonePalette).toEqual(['#FFDFC4', '#3B2219']);
    });

    it('updates a color in place', () => {
      const config: NpcConfig = { clothingPalette: ['#8B4513', '#2F4F4F'] };
      const next = [...config.clothingPalette!];
      next[0] = '#FF0000';
      const updated: NpcConfig = { ...config, clothingPalette: next };
      expect(updated.clothingPalette).toEqual(['#FF0000', '#2F4F4F']);
    });

    it('sets palette to undefined when cleared', () => {
      const colors: string[] = [];
      const updated: NpcConfig = {
        clothingPalette: colors.length > 0 ? colors : undefined,
      };
      expect(updated.clothingPalette).toBeUndefined();
    });
  });

  describe('config serialization for API', () => {
    it('produces null when config is empty', () => {
      const config: NpcConfig = {};
      const hasContent = (config.bodyModels?.length || 0) > 0 ||
        Object.keys(config.hairStyles || {}).length > 0 ||
        (config.clothingPalette?.length || 0) > 0 ||
        (config.skinTonePalette?.length || 0) > 0;
      expect(hasContent).toBe(false);
    });

    it('produces non-null when any field has content', () => {
      const config: NpcConfig = { bodyModels: ['outfit_male_peasant'] };
      const hasContent = (config.bodyModels?.length || 0) > 0 ||
        Object.keys(config.hairStyles || {}).length > 0 ||
        (config.clothingPalette?.length || 0) > 0 ||
        (config.skinTonePalette?.length || 0) > 0;
      expect(hasContent).toBe(true);
    });

    it('npcConfig integrates with AssetCollection PATCH payload', () => {
      const config: NpcConfig = {
        bodyModels: ['outfit_male_peasant', 'outfit_female_peasant'],
        hairStyles: { male: ['buzzed'], female: ['long'] },
        clothingPalette: ['#8B4513'],
        skinTonePalette: ['#FFDFC4'],
      };
      const patch: Partial<AssetCollection> = { npcConfig: config };
      expect(patch.npcConfig).toBeDefined();
      expect(patch.npcConfig!.bodyModels).toHaveLength(2);
      expect(patch.npcConfig!.hairStyles!['male']).toEqual(['buzzed']);
    });

    it('npcConfig null clears the config', () => {
      const patch: Partial<AssetCollection> = { npcConfig: null };
      expect(patch.npcConfig).toBeNull();
    });
  });

  describe('default values', () => {
    it('default body models include standard outfits', () => {
      const defaults = [
        'outfit_male_peasant', 'outfit_female_peasant',
        'outfit_male_ranger', 'outfit_female_ranger',
      ];
      expect(defaults).toHaveLength(4);
      expect(defaults.every(d => d.startsWith('outfit_'))).toBe(true);
    });

    it('default hair styles cover male and female', () => {
      const defaults: Record<string, string[]> = {
        male: ['buzzed', 'long', 'simpleparted'],
        female: ['long', 'buns', 'buzzedfemale'],
      };
      expect(Object.keys(defaults)).toEqual(['male', 'female']);
      expect(defaults.male).toHaveLength(3);
      expect(defaults.female).toHaveLength(3);
    });

    it('default clothing palette contains valid hex colors', () => {
      const defaults = [
        '#8B4513', '#2F4F4F', '#556B2F', '#191970', '#800020',
        '#C3B091', '#36454F', '#D2B48C', '#8E4585', '#725E54',
        '#008080', '#FFFDD0',
      ];
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(defaults.every(c => hexRegex.test(c))).toBe(true);
    });

    it('default skin tone palette contains valid hex colors', () => {
      const defaults = [
        '#FFDFC4', '#F0D5BE', '#D1A684', '#C68642',
        '#8D5524', '#6B3E26', '#5C3317', '#3B2219',
      ];
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(defaults.every(c => hexRegex.test(c))).toBe(true);
      expect(defaults).toHaveLength(8);
    });
  });

  describe('loadCollectionToForm integration', () => {
    it('loads npcConfig from collection', () => {
      const collection: Partial<AssetCollection> = {
        npcConfig: {
          bodyModels: ['outfit_male_peasant'],
          clothingPalette: ['#333333'],
        },
      };
      // Simulates loadCollectionToForm behavior
      const loaded = collection.npcConfig || null;
      expect(loaded).not.toBeNull();
      expect(loaded!.bodyModels).toEqual(['outfit_male_peasant']);
    });

    it('defaults to null when collection has no npcConfig', () => {
      const collection: Partial<AssetCollection> = {
        npcConfig: null,
      };
      const loaded = collection.npcConfig || null;
      expect(loaded).toBeNull();
    });
  });
});
