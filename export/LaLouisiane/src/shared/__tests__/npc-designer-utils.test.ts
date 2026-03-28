import { describe, it, expect } from 'vitest';
import {
  getDefaultDesign,
  randomizeDesign,
  designToPreset,
  presetToDesign,
  availableBodies,
  availableHair,
  availableOutfits,
  resolveAssetPath,
  DEFAULT_SKIN_TONES,
  DEFAULT_HAIR_COLORS,
  DEFAULT_OUTFIT_COLORS,
  type NPCDesignState,
} from '../game-engine/npc-designer-utils';
import type { NPCPreset } from '../game-engine/types';

describe('npc-designer-utils', () => {
  describe('getDefaultDesign', () => {
    it('returns a valid male design by default', () => {
      const design = getDefaultDesign();
      expect(design.gender).toBe('male');
      expect(design.bodyId).toBeTruthy();
      expect(design.hairId).toBeNull();
      expect(design.outfitId).toBeNull();
      expect(DEFAULT_SKIN_TONES).toContain(design.skinColor);
      expect(DEFAULT_HAIR_COLORS).toContain(design.hairColor);
      expect(DEFAULT_OUTFIT_COLORS).toContain(design.outfitColor);
    });

    it('returns a valid female design when specified', () => {
      const design = getDefaultDesign('female');
      expect(design.gender).toBe('female');
      expect(design.bodyId).toBeTruthy();
      // Body should be a female body
      const femaleBodies = availableBodies('female');
      expect(femaleBodies.map(b => b.id)).toContain(design.bodyId);
    });
  });

  describe('randomizeDesign', () => {
    it('returns a design with all required fields', () => {
      const design = randomizeDesign();
      expect(['male', 'female']).toContain(design.gender);
      expect(design.bodyId).toBeTruthy();
      expect(design.skinColor).toBeTruthy();
      expect(design.hairColor).toBeTruthy();
      expect(design.outfitColor).toBeTruthy();
    });

    it('selects body matching the randomized gender', () => {
      // Run multiple times to cover both genders
      for (let i = 0; i < 20; i++) {
        const design = randomizeDesign();
        const genderBodies = availableBodies(design.gender);
        expect(genderBodies.map(b => b.id)).toContain(design.bodyId);
      }
    });

    it('selects hair matching the randomized gender when present', () => {
      for (let i = 0; i < 20; i++) {
        const design = randomizeDesign();
        if (design.hairId) {
          const genderHair = availableHair(design.gender);
          expect(genderHair.map(h => h.id)).toContain(design.hairId);
        }
      }
    });

    it('selects outfit matching the randomized gender when present', () => {
      for (let i = 0; i < 20; i++) {
        const design = randomizeDesign();
        if (design.outfitId) {
          const genderOutfits = availableOutfits(design.gender);
          expect(genderOutfits.map(o => o.id)).toContain(design.outfitId);
        }
      }
    });
  });

  describe('designToPreset / presetToDesign', () => {
    it('round-trips a design through preset format', () => {
      const design: NPCDesignState = {
        gender: 'female',
        bodyId: 'anim2_mannequin_f',
        hairId: 'hair_hair_long',
        outfitId: 'outfit_female_ranger',
        skinColor: '#D4A574',
        hairColor: '#1C1C1C',
        outfitColor: '#2F4F4F',
      };

      const preset = designToPreset(design, 'Test Ranger');
      expect(preset.name).toBe('Test Ranger');
      expect(preset.gender).toBe('female');
      expect(preset.bodyId).toBe('anim2_mannequin_f');
      expect(preset.hairId).toBe('hair_hair_long');
      expect(preset.outfitId).toBe('outfit_female_ranger');

      const restored = presetToDesign(preset);
      expect(restored).toEqual(design);
    });

    it('handles null hair/outfit correctly', () => {
      const design: NPCDesignState = {
        gender: 'male',
        bodyId: 'anim_ual1_standard',
        hairId: null,
        outfitId: null,
        skinColor: '#FFDFC4',
        hairColor: '#3B2F2F',
        outfitColor: '#8B4513',
      };

      const preset = designToPreset(design, 'Bald Man');
      expect(preset.hairId).toBeUndefined();
      expect(preset.outfitId).toBeUndefined();

      const restored = presetToDesign(preset);
      expect(restored.hairId).toBeNull();
      expect(restored.outfitId).toBeNull();
    });
  });

  describe('availableBodies', () => {
    it('returns only male bodies for male gender', () => {
      const maleBodies = availableBodies('male');
      expect(maleBodies.length).toBeGreaterThan(0);
      maleBodies.forEach(b => expect(b.gender).toBe('male'));
    });

    it('returns only female bodies for female gender', () => {
      const femaleBodies = availableBodies('female');
      expect(femaleBodies.length).toBeGreaterThan(0);
      femaleBodies.forEach(b => expect(b.gender).toBe('female'));
    });
  });

  describe('availableHair', () => {
    it('excludes rigged and eyebrow entries', () => {
      const maleHair = availableHair('male');
      maleHair.forEach(h => {
        expect(h.rigged).toBe(false);
        expect(h.id).not.toContain('eyebrows');
      });
    });

    it('includes unisex hair for both genders', () => {
      const maleHair = availableHair('male');
      const femaleHair = availableHair('female');
      // 'Long' and 'Buns' are unisex
      expect(maleHair.some(h => h.displayName === 'Long')).toBe(true);
      expect(femaleHair.some(h => h.displayName === 'Long')).toBe(true);
    });
  });

  describe('availableOutfits', () => {
    it('returns only full outfits', () => {
      const maleOutfits = availableOutfits('male');
      maleOutfits.forEach(o => {
        expect(o.gender).toBe('male');
        expect(o.part).toBe('full');
      });
    });
  });

  describe('resolveAssetPath', () => {
    it('resolves a known body ID to a path', () => {
      const path = resolveAssetPath('anim_ual1_standard');
      expect(path).toBeTruthy();
      expect(path).toContain('quaternius');
      expect(path).toContain('anim_ual1_standard');
    });

    it('resolves a known hair ID to a path', () => {
      const path = resolveAssetPath('hair_hair_long');
      expect(path).toBeTruthy();
      expect(path).toContain('hair_hair_long');
    });

    it('resolves a known outfit ID to a path', () => {
      const path = resolveAssetPath('outfit_male_peasant');
      expect(path).toBeTruthy();
      expect(path).toContain('outfit_male_peasant');
    });

    it('returns null for unknown IDs', () => {
      expect(resolveAssetPath('nonexistent_model')).toBeNull();
    });
  });

  describe('color palettes', () => {
    it('has valid hex color values in skin tones', () => {
      DEFAULT_SKIN_TONES.forEach(c => {
        expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('has valid hex color values in hair colors', () => {
      DEFAULT_HAIR_COLORS.forEach(c => {
        expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('has valid hex color values in outfit colors', () => {
      DEFAULT_OUTFIT_COLORS.forEach(c => {
        expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
