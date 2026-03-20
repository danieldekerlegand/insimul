/**
 * Tests for bilingual-names.ts translation dictionaries and lookup functions
 */

import { describe, it, expect } from 'vitest';
import {
  getBilingualBusinessName,
  getBilingualResidenceName,
  getBilingualMunicipalName,
  getBilingualStreetName,
  getBilingualObjectLabel,
  getBusinessDetailText,
  BUSINESS_TRANSLATIONS,
  RESIDENCE_TRANSLATIONS,
  MUNICIPAL_TRANSLATIONS,
  STREET_TRANSLATIONS,
  WORLD_OBJECT_TRANSLATIONS,
  BUSINESS_DETAIL_TRANSLATIONS,
} from '../language/bilingual-names';

describe('getBilingualBusinessName', () => {
  it('returns correct French translation', () => {
    const result = getBilingualBusinessName('french', 'bakery');
    expect(result).toEqual({ targetLanguage: 'Boulangerie', english: 'Bakery' });
  });

  it('returns null for unsupported language', () => {
    expect(getBilingualBusinessName('martian', 'bakery')).toBeNull();
  });

  it('returns null for unknown business type', () => {
    expect(getBilingualBusinessName('french', 'starport')).toBeNull();
  });
});

describe('getBilingualResidenceName', () => {
  it('returns correct French house translation', () => {
    const result = getBilingualResidenceName('french', 'house');
    expect(result).toEqual({ targetLanguage: 'Maison', english: 'House' });
  });

  it('returns correct French cottage translation', () => {
    const result = getBilingualResidenceName('french', 'cottage');
    expect(result).toEqual({ targetLanguage: 'Chaumière', english: 'Cottage' });
  });

  it('returns correct Spanish apartment translation', () => {
    const result = getBilingualResidenceName('spanish', 'apartment');
    expect(result).toEqual({ targetLanguage: 'Apartamento', english: 'Apartment' });
  });

  it('returns null for unsupported language', () => {
    expect(getBilingualResidenceName('martian', 'house')).toBeNull();
  });
});

describe('getBilingualMunicipalName', () => {
  it('returns French courthouse', () => {
    const result = getBilingualMunicipalName('french', 'courthouse');
    expect(result).toEqual({ targetLanguage: 'Palais de justice', english: 'Courthouse' });
  });

  it('returns French museum', () => {
    const result = getBilingualMunicipalName('french', 'museum');
    expect(result).toEqual({ targetLanguage: 'Musée', english: 'Museum' });
  });

  it('returns German fire station', () => {
    const result = getBilingualMunicipalName('german', 'fire station');
    expect(result).toEqual({ targetLanguage: 'Feuerwehr', english: 'Fire station' });
  });
});

describe('getBilingualStreetName', () => {
  it('returns French street name', () => {
    const result = getBilingualStreetName('french', 'street', 'Dupont');
    expect(result).toEqual({ targetLanguage: 'Rue Dupont', english: 'Street Dupont' });
  });

  it('returns French avenue name', () => {
    const result = getBilingualStreetName('french', 'avenue', 'de la République');
    expect(result).toEqual({ targetLanguage: 'Avenue de la République', english: 'Avenue de la République' });
  });

  it('returns null for unknown street type', () => {
    expect(getBilingualStreetName('french', 'wormhole', 'Alpha')).toBeNull();
  });
});

describe('getBilingualObjectLabel', () => {
  it('returns French tree label', () => {
    const result = getBilingualObjectLabel('french', 'tree');
    expect(result).toEqual({ targetLanguage: 'Arbre', english: 'Tree' });
  });

  it('returns French fountain label', () => {
    const result = getBilingualObjectLabel('french', 'fountain');
    expect(result).toEqual({ targetLanguage: 'Fontaine', english: 'Fountain' });
  });

  it('returns Spanish horse label', () => {
    const result = getBilingualObjectLabel('spanish', 'horse');
    expect(result).toEqual({ targetLanguage: 'Caballo', english: 'Horse' });
  });

  it('returns null for unknown object type', () => {
    expect(getBilingualObjectLabel('french', 'spaceship')).toBeNull();
  });
});

describe('getBusinessDetailText', () => {
  it('returns French bakery detail', () => {
    expect(getBusinessDetailText('french', 'bakery')).toBe('Boulangerie artisanale');
  });

  it('returns French tavern detail', () => {
    expect(getBusinessDetailText('french', 'tavern')).toBe('Taverne du village');
  });

  it('returns null for unsupported language', () => {
    expect(getBusinessDetailText('spanish', 'bakery')).toBeNull();
  });

  it('returns null for unknown business type', () => {
    expect(getBusinessDetailText('french', 'spaceship')).toBeNull();
  });
});

describe('translation dictionaries completeness', () => {
  const frenchBusinessKeys = Object.keys(BUSINESS_TRANSLATIONS.french);

  it('French has all business types covered', () => {
    expect(frenchBusinessKeys.length).toBeGreaterThanOrEqual(19);
  });

  it('French residence translations cover all size types', () => {
    const keys = Object.keys(RESIDENCE_TRANSLATIONS.french);
    expect(keys).toContain('residence_small');
    expect(keys).toContain('residence_medium');
    expect(keys).toContain('residence_large');
    expect(keys).toContain('house');
    expect(keys).toContain('mansion');
  });

  it('French municipal translations cover key buildings', () => {
    const keys = Object.keys(MUNICIPAL_TRANSLATIONS.french);
    expect(keys).toContain('courthouse');
    expect(keys).toContain('post office');
    expect(keys).toContain('fire station');
    expect(keys).toContain('police station');
    expect(keys).toContain('museum');
    expect(keys).toContain('theater');
  });

  it('French street translations cover common types', () => {
    const keys = Object.keys(STREET_TRANSLATIONS.french);
    expect(keys).toContain('street');
    expect(keys).toContain('avenue');
    expect(keys).toContain('boulevard');
    expect(keys).toContain('lane');
    expect(keys).toContain('main street');
  });

  it('French object translations cover common world objects', () => {
    const keys = Object.keys(WORLD_OBJECT_TRANSLATIONS.french);
    expect(keys).toContain('tree');
    expect(keys).toContain('bench');
    expect(keys).toContain('fountain');
    expect(keys).toContain('door');
    expect(keys).toContain('horse');
    expect(keys.length).toBeGreaterThanOrEqual(25);
  });

  it('all languages have same business types covered', () => {
    const languages = Object.keys(BUSINESS_TRANSLATIONS);
    for (const lang of languages) {
      expect(Object.keys(BUSINESS_TRANSLATIONS[lang]).sort())
        .toEqual(frenchBusinessKeys.sort());
    }
  });

  it('French detail translations cover all business types', () => {
    const detailKeys = Object.keys(BUSINESS_DETAIL_TRANSLATIONS.french);
    for (const key of frenchBusinessKeys) {
      expect(detailKeys).toContain(key);
    }
  });
});
