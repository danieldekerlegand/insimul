import { describe, it, expect, vi } from 'vitest';

// Mock Babylon.js imports so the module loads in a Node test environment
vi.mock('@babylonjs/core', () => ({}));
vi.mock('@babylonjs/loaders/glTF', () => ({}));

import { getInteriorModelPath } from '../InteriorSceneManager';

describe('getInteriorModelPath', () => {
  it('returns a model path for known businessType', () => {
    const path = getInteriorModelPath('business', 'Bar');
    expect(path).toBeTruthy();
    expect(path).toContain('/assets/models/interiors/tavern/');
  });

  it('prefers businessType over buildingType', () => {
    const path = getInteriorModelPath('residence', 'Restaurant');
    expect(path).toBeTruthy();
    expect(path).toContain('/assets/models/interiors/restaurant/');
  });

  it('falls back to buildingType when businessType is undefined', () => {
    const path = getInteriorModelPath('Church');
    expect(path).toBeTruthy();
    expect(path).toContain('/assets/models/interiors/church/');
  });

  it('falls back to buildingType when businessType is not in map', () => {
    const path = getInteriorModelPath('residence', 'UnknownType');
    expect(path).toBeTruthy();
    expect(path).toContain('/assets/models/interiors/residence/');
  });

  it('returns null for types not in the model map', () => {
    expect(getInteriorModelPath('Theater')).toBeNull();
    expect(getInteriorModelPath('business', 'Theater')).toBeNull();
    expect(getInteriorModelPath('AutoRepair')).toBeNull();
    expect(getInteriorModelPath('spaceship')).toBeNull();
  });

  it('returns null for empty strings', () => {
    expect(getInteriorModelPath('')).toBeNull();
    expect(getInteriorModelPath('', '')).toBeNull();
  });

  it('returns a valid path for all residence types', () => {
    for (const type of ['residence', 'residence_small', 'residence_large', 'ApartmentComplex', 'mansion']) {
      const path = getInteriorModelPath(type);
      expect(path, `expected model for ${type}`).toBeTruthy();
      expect(path).toContain('/assets/models/interiors/');
    }
  });

  it('returns a valid path for all shop types', () => {
    for (const type of ['Shop', 'GroceryStore', 'Pharmacy', 'JewelryStore', 'BookStore', 'HerbShop', 'PawnShop']) {
      const path = getInteriorModelPath('business', type);
      expect(path, `expected model for ${type}`).toBeTruthy();
      expect(path).toContain('/assets/models/interiors/shop/');
    }
  });
});
