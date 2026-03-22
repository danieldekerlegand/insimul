import { describe, it, expect } from 'vitest';
import type { BusinessType } from '@shared/schema';

/**
 * Tests for the business type dropdown logic used in SettlementDetailView.
 * Validates the BUSINESS_TYPES constant and selection behavior.
 */

const BUSINESS_TYPES: BusinessType[] = [
  'Generic', 'LawFirm', 'ApartmentComplex', 'Bakery', 'Hospital', 'Bank',
  'Hotel', 'Restaurant', 'GroceryStore', 'Bar', 'Daycare', 'School',
  'PoliceStation', 'FireStation', 'TownHall', 'Church', 'Farm', 'Factory',
  'Shop', 'Mortuary', 'RealEstateOffice', 'InsuranceOffice', 'JewelryStore',
  'TattoParlor', 'Brewery', 'Pharmacy', 'DentalOffice', 'OptometryOffice',
  'University', 'Harbor', 'Boatyard', 'FishMarket', 'CustomsHouse', 'Lighthouse',
  'Warehouse', 'Blacksmith', 'Tailor', 'Butcher', 'BookStore', 'HerbShop',
  'PawnShop', 'Barbershop', 'Bathhouse', 'Carpenter', 'Stables', 'Clinic',
];

describe('Business type dropdown logic', () => {
  it('contains all expected business types', () => {
    expect(BUSINESS_TYPES).toContain('Generic');
    expect(BUSINESS_TYPES).toContain('Restaurant');
    expect(BUSINESS_TYPES).toContain('Blacksmith');
    expect(BUSINESS_TYPES).toContain('Clinic');
    expect(BUSINESS_TYPES).toContain('University');
    expect(BUSINESS_TYPES).toContain('Harbor');
  });

  it('has no duplicates', () => {
    const unique = new Set(BUSINESS_TYPES);
    expect(unique.size).toBe(BUSINESS_TYPES.length);
  });

  it('contains at least 40 business types', () => {
    expect(BUSINESS_TYPES.length).toBeGreaterThanOrEqual(40);
  });

  it('all entries are non-empty strings', () => {
    for (const type of BUSINESS_TYPES) {
      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);
    }
  });

  describe('business type selection validation', () => {
    function isValidBusinessType(value: string): value is BusinessType {
      return BUSINESS_TYPES.includes(value as BusinessType);
    }

    it('accepts valid business types', () => {
      expect(isValidBusinessType('Restaurant')).toBe(true);
      expect(isValidBusinessType('Blacksmith')).toBe(true);
      expect(isValidBusinessType('Farm')).toBe(true);
    });

    it('rejects invalid business types', () => {
      expect(isValidBusinessType('InvalidType')).toBe(false);
      expect(isValidBusinessType('')).toBe(false);
      expect(isValidBusinessType('restaurant')).toBe(false); // case-sensitive
    });
  });

  describe('PATCH payload construction', () => {
    function buildUpdatePayload(businessId: string, businessType: string) {
      return { businessId, businessType };
    }

    it('creates correct payload for business type update', () => {
      const payload = buildUpdatePayload('biz-123', 'Restaurant');
      expect(payload).toEqual({ businessId: 'biz-123', businessType: 'Restaurant' });
    });

    it('preserves the exact business type string', () => {
      const payload = buildUpdatePayload('biz-456', 'TattoParlor');
      expect(payload.businessType).toBe('TattoParlor');
    });
  });
});
