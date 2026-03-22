import { describe, it, expect } from 'vitest';
import {
  quaterniusAssetManifest,
  bodies,
  hair,
  outfits,
  animals,
  getBodiesByGender,
  getHairByGender,
  getRiggedHair,
  getFullOutfitsByGender,
  getOutfitPartsBySet,
  getOutfitSets,
  toDisplayName,
  BASE_PATH,
  type Gender,
} from '../game-engine/quaternius-asset-manifest';

describe('quaternius-asset-manifest', () => {
  describe('manifest structure', () => {
    it('exports a complete manifest with all categories', () => {
      expect(quaterniusAssetManifest).toHaveProperty('bodies');
      expect(quaterniusAssetManifest).toHaveProperty('hair');
      expect(quaterniusAssetManifest).toHaveProperty('outfits');
      expect(quaterniusAssetManifest).toHaveProperty('animals');
    });

    it('has correct asset counts', () => {
      expect(bodies).toHaveLength(5);
      expect(hair).toHaveLength(16);
      expect(outfits).toHaveLength(24);
      expect(animals).toHaveLength(12);
    });
  });

  describe('asset paths', () => {
    it('all paths start with the base path', () => {
      const allAssets = [...bodies, ...hair, ...outfits, ...animals];
      for (const asset of allAssets) {
        expect(asset.path).toContain(BASE_PATH);
      }
    });

    it('all paths contain the asset id as directory and filename', () => {
      const allAssets = [...bodies, ...hair, ...outfits, ...animals];
      for (const asset of allAssets) {
        expect(asset.path).toBe(`${BASE_PATH}/${asset.id}/${asset.id}.${asset.format}`);
      }
    });

    it('all assets have a non-empty displayName', () => {
      const allAssets = [...bodies, ...hair, ...outfits, ...animals];
      for (const asset of allAssets) {
        expect(asset.displayName.length).toBeGreaterThan(0);
      }
    });
  });

  describe('bodies', () => {
    it('has both male and female bodies', () => {
      const males = bodies.filter((b) => b.gender === 'male');
      const females = bodies.filter((b) => b.gender === 'female');
      expect(males.length).toBeGreaterThan(0);
      expect(females.length).toBeGreaterThan(0);
    });

    it('animated bodies use glb format', () => {
      const animated = bodies.filter((b) => b.id.startsWith('anim'));
      for (const body of animated) {
        expect(body.format).toBe('glb');
      }
    });
  });

  describe('hair', () => {
    it('has both rigged and non-rigged variants', () => {
      const rigged = hair.filter((h) => h.rigged);
      const nonRigged = hair.filter((h) => !h.rigged);
      expect(rigged).toHaveLength(8);
      expect(nonRigged).toHaveLength(8);
    });

    it('has male-affinity, female-affinity, and unisex hair', () => {
      const male = hair.filter((h) => h.genderAffinity === 'male');
      const female = hair.filter((h) => h.genderAffinity === 'female');
      const unisex = hair.filter((h) => h.genderAffinity === null);
      expect(male.length).toBeGreaterThan(0);
      expect(female.length).toBeGreaterThan(0);
      expect(unisex.length).toBeGreaterThan(0);
    });
  });

  describe('outfits', () => {
    it('has full outfits for both genders', () => {
      const maleFull = outfits.filter((o) => o.gender === 'male' && o.part === 'full');
      const femaleFull = outfits.filter((o) => o.gender === 'female' && o.part === 'full');
      expect(maleFull.length).toBeGreaterThan(0);
      expect(femaleFull.length).toBeGreaterThan(0);
    });

    it('has peasant and ranger sets for both genders', () => {
      for (const gender of ['male', 'female'] as Gender[]) {
        const sets = getOutfitSets(gender);
        expect(sets).toContain('peasant');
        expect(sets).toContain('ranger');
      }
    });

    it('each outfit set has individual parts', () => {
      const malePeasantParts = getOutfitPartsBySet('male', 'peasant');
      expect(malePeasantParts.length).toBeGreaterThanOrEqual(4);
      const partTypes = malePeasantParts.map((p) => p.part);
      expect(partTypes).toContain('arms');
      expect(partTypes).toContain('body');
      expect(partTypes).toContain('feet');
      expect(partTypes).toContain('legs');
    });
  });

  describe('animals', () => {
    it('all animals use gltf format', () => {
      for (const animal of animals) {
        expect(animal.format).toBe('gltf');
      }
    });

    it('includes expected animals', () => {
      const ids = animals.map((a) => a.id);
      expect(ids).toContain('animal_horse');
      expect(ids).toContain('animal_wolf');
      expect(ids).toContain('animal_cow');
    });
  });

  describe('query helpers', () => {
    it('getBodiesByGender returns only the specified gender', () => {
      const males = getBodiesByGender('male');
      expect(males.every((b) => b.gender === 'male')).toBe(true);
      expect(males.length).toBe(3);
    });

    it('getHairByGender includes unisex + gender-specific hair', () => {
      const maleHair = getHairByGender('male');
      expect(maleHair.every((h) => h.genderAffinity === 'male' || h.genderAffinity === null)).toBe(true);
      // Should include unisex hair
      expect(maleHair.some((h) => h.genderAffinity === null)).toBe(true);
      // Should include male-specific hair
      expect(maleHair.some((h) => h.genderAffinity === 'male')).toBe(true);
      // Should not include female-only hair
      expect(maleHair.some((h) => h.genderAffinity === 'female')).toBe(false);
    });

    it('getRiggedHair returns only rigged hair', () => {
      const rigged = getRiggedHair();
      expect(rigged.every((h) => h.rigged)).toBe(true);
      expect(rigged).toHaveLength(8);
    });

    it('getRiggedHair filters by gender', () => {
      const riggedMale = getRiggedHair('male');
      expect(riggedMale.every((h) => h.rigged)).toBe(true);
      expect(riggedMale.every((h) => h.genderAffinity === 'male' || h.genderAffinity === null)).toBe(true);
    });

    it('getFullOutfitsByGender returns only full outfits', () => {
      const maleFull = getFullOutfitsByGender('male');
      expect(maleFull.every((o) => o.part === 'full' && o.gender === 'male')).toBe(true);
      expect(maleFull).toHaveLength(2);
    });

    it('getOutfitPartsBySet excludes full outfit', () => {
      const parts = getOutfitPartsBySet('female', 'ranger');
      expect(parts.every((p) => p.part !== 'full')).toBe(true);
      expect(parts.length).toBeGreaterThan(0);
    });

    it('getOutfitSets returns unique set names', () => {
      const sets = getOutfitSets('male');
      expect(new Set(sets).size).toBe(sets.length);
    });
  });

  describe('toDisplayName', () => {
    it('converts underscored names to title case', () => {
      expect(toDisplayName('hair_hair_long')).toBe('Hair Long');
      expect(toDisplayName('animal_fox')).toBe('Fox');
    });

    it('strips known prefixes', () => {
      expect(toDisplayName('anim_ual1_standard')).toBe('Ual1 Standard');
      expect(toDisplayName('char_superhero_female_fullbody')).toBe('Superhero Female Fullbody');
      expect(toDisplayName('outfit_male_peasant')).toBe('Male Peasant');
    });
  });

  describe('no duplicate IDs', () => {
    it('all asset IDs are unique across the entire manifest', () => {
      const allAssets = [...bodies, ...hair, ...outfits, ...animals];
      const ids = allAssets.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
