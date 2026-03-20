/**
 * Tests for WorldSignProvider
 *
 * Validates sign generation for businesses, residences, municipal buildings,
 * streets, and world objects across supported languages.
 */

import { describe, it, expect } from 'vitest';
import {
  getBusinessSign,
  getResidenceSign,
  getMunicipalSign,
  getStreetSign,
  getObjectLabel,
  generateBusinessSigns,
  generateResidenceSigns,
  getSupportedLanguages,
} from '../language/world-sign-provider';

describe('getBusinessSign', () => {
  it('returns French sign for bakery', () => {
    const sign = getBusinessSign('french', 'biz-1', 'bakery');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Boulangerie');
    expect(sign!.nativeText).toBe('Bakery');
    expect(sign!.detailText).toBe('Boulangerie artisanale');
    expect(sign!.category).toBe('business');
  });

  it('returns French sign for tavern', () => {
    const sign = getBusinessSign('french', 'biz-2', 'tavern');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Taverne');
    expect(sign!.detailText).toBe('Taverne du village');
  });

  it('uses business name as fallback when type not found', () => {
    const sign = getBusinessSign('french', 'biz-3', 'Unknown Type', 'Le Petit Café');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Le Petit Café');
  });

  it('returns null for unsupported language', () => {
    expect(getBusinessSign('klingon', 'biz-1', 'bakery')).toBeNull();
  });

  it('returns null when type not found and no name fallback', () => {
    expect(getBusinessSign('french', 'biz-1', 'spaceship')).toBeNull();
  });

  it('is case-insensitive for language', () => {
    const sign = getBusinessSign('French', 'biz-1', 'bakery');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Boulangerie');
  });

  it('works for Spanish', () => {
    const sign = getBusinessSign('spanish', 'biz-1', 'bakery');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Panadería');
  });

  it('works for German', () => {
    const sign = getBusinessSign('german', 'biz-1', 'bakery');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Bäckerei');
  });

  it('works for Italian', () => {
    const sign = getBusinessSign('italian', 'biz-1', 'bakery');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Panetteria');
  });
});

describe('getResidenceSign', () => {
  it('returns French sign for house', () => {
    const sign = getResidenceSign('french', 'res-1', 'house');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Maison');
    expect(sign!.nativeText).toBe('House');
    expect(sign!.category).toBe('residence');
  });

  it('returns French sign for mansion', () => {
    const sign = getResidenceSign('french', 'res-2', 'mansion');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Manoir');
  });

  it('handles size-based residence types', () => {
    expect(getResidenceSign('french', 'r1', 'residence_small')!.targetText).toBe('Petite maison');
    expect(getResidenceSign('french', 'r2', 'residence_medium')!.targetText).toBe('Maison');
    expect(getResidenceSign('french', 'r3', 'residence_large')!.targetText).toBe('Grande maison');
  });

  it('formats nativeText with underscores replaced by spaces', () => {
    const sign = getResidenceSign('french', 'r1', 'residence_small');
    expect(sign!.nativeText).toBe('Residence small');
  });

  it('returns null for unsupported language', () => {
    expect(getResidenceSign('klingon', 'res-1', 'house')).toBeNull();
  });

  it('returns null for unknown residence type', () => {
    expect(getResidenceSign('french', 'res-1', 'spaceship')).toBeNull();
  });
});

describe('getMunicipalSign', () => {
  it('returns French sign for courthouse', () => {
    const sign = getMunicipalSign('french', 'mun-1', 'courthouse');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Palais de justice');
    expect(sign!.nativeText).toBe('Courthouse');
    expect(sign!.category).toBe('municipal');
  });

  it('returns French sign for post office', () => {
    const sign = getMunicipalSign('french', 'mun-2', 'post office');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Bureau de poste');
  });

  it('returns French sign for theater', () => {
    const sign = getMunicipalSign('french', 'mun-3', 'theater');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Théâtre');
  });

  it('returns null for unknown building type', () => {
    expect(getMunicipalSign('french', 'mun-1', 'spaceport')).toBeNull();
  });
});

describe('getStreetSign', () => {
  it('returns French street sign', () => {
    const sign = getStreetSign('french', 'st-1', 'street', 'Lafayette');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Rue Lafayette');
    expect(sign!.nativeText).toBe('Street Lafayette');
    expect(sign!.category).toBe('street');
  });

  it('returns French boulevard sign', () => {
    const sign = getStreetSign('french', 'st-2', 'boulevard', 'des Champs');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Boulevard des Champs');
  });

  it('returns French main street sign', () => {
    const sign = getStreetSign('french', 'st-3', 'main street', 'Centrale');
    expect(sign).not.toBeNull();
    expect(sign!.targetText).toBe('Grande Rue Centrale');
  });

  it('returns null for unknown street type', () => {
    expect(getStreetSign('french', 'st-1', 'hyperloop', 'Alpha')).toBeNull();
  });
});

describe('getObjectLabel', () => {
  it('returns French label for tree', () => {
    const label = getObjectLabel('french', 'obj-1', 'tree');
    expect(label).not.toBeNull();
    expect(label!.targetText).toBe('Arbre');
    expect(label!.nativeText).toBe('Tree');
    expect(label!.category).toBe('object');
    expect(label!.vocabularyCategory).toBe('nature');
  });

  it('returns French label for bench', () => {
    const label = getObjectLabel('french', 'obj-2', 'bench');
    expect(label).not.toBeNull();
    expect(label!.targetText).toBe('Banc');
  });

  it('categorizes animals correctly', () => {
    const label = getObjectLabel('french', 'obj-3', 'horse');
    expect(label).not.toBeNull();
    expect(label!.targetText).toBe('Cheval');
    expect(label!.vocabularyCategory).toBe('animals');
  });

  it('categorizes household items correctly', () => {
    const label = getObjectLabel('french', 'obj-4', 'table');
    expect(label).not.toBeNull();
    expect(label!.targetText).toBe('Table');
    expect(label!.vocabularyCategory).toBe('household');
  });

  it('returns null for unknown object', () => {
    expect(getObjectLabel('french', 'obj-1', 'teleporter')).toBeNull();
  });
});

describe('generateBusinessSigns', () => {
  it('generates signs for multiple businesses', () => {
    const businesses = [
      { id: 'b1', businessType: 'bakery', name: 'La Boulangerie' },
      { id: 'b2', businessType: 'tavern' },
      { id: 'b3', businessType: 'unknown_type' },
    ];
    const signs = generateBusinessSigns('french', businesses);
    expect(signs).toHaveLength(2); // unknown_type is skipped (no name fallback)
    expect(signs[0].targetText).toBe('Boulangerie');
    expect(signs[1].targetText).toBe('Taverne');
  });

  it('returns empty array for unsupported language', () => {
    const signs = generateBusinessSigns('klingon', [{ id: 'b1', businessType: 'bakery' }]);
    expect(signs).toHaveLength(0);
  });
});

describe('generateResidenceSigns', () => {
  it('generates signs for residences with explicit types', () => {
    const residences = [
      { id: 'r1', residenceType: 'house' },
      { id: 'r2', residenceType: 'mansion' },
    ];
    const signs = generateResidenceSigns('french', residences);
    expect(signs).toHaveLength(2);
    expect(signs[0].targetText).toBe('Maison');
    expect(signs[1].targetText).toBe('Manoir');
  });

  it('infers type from occupant count when residenceType is missing', () => {
    const residences = [
      { id: 'r1', residentIds: ['a'] },             // 1 occupant → residence_small
      { id: 'r2', residentIds: ['a', 'b', 'c', 'd', 'e'] }, // 5 → residence_medium
      { id: 'r3', residentIds: Array(10).fill('x') },        // 10 → residence_large
    ];
    const signs = generateResidenceSigns('french', residences);
    expect(signs).toHaveLength(3);
    expect(signs[0].targetText).toBe('Petite maison');
    expect(signs[1].targetText).toBe('Maison');
    expect(signs[2].targetText).toBe('Grande maison');
  });
});

describe('getSupportedLanguages', () => {
  it('returns languages for business category', () => {
    const langs = getSupportedLanguages('business');
    expect(langs).toContain('french');
    expect(langs).toContain('spanish');
    expect(langs).toContain('german');
    expect(langs).toContain('italian');
  });

  it('returns languages for residence category', () => {
    const langs = getSupportedLanguages('residence');
    expect(langs).toContain('french');
  });

  it('returns languages for all categories', () => {
    for (const cat of ['business', 'residence', 'municipal', 'street', 'object'] as const) {
      const langs = getSupportedLanguages(cat);
      expect(langs.length).toBeGreaterThan(0);
      expect(langs).toContain('french');
    }
  });
});
