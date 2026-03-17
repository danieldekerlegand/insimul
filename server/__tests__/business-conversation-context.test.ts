import { describe, it, expect } from 'vitest';
import { buildBusinessContext } from '../services/conversation/context-manager';
import type { Business } from '@shared/schema';

function makeBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: 'biz-1',
    worldId: 'world-1',
    settlementId: 'settlement-1',
    name: "Rosa's Bakery",
    businessType: 'Bakery',
    ownerId: 'char-owner',
    founderId: 'char-founder',
    isOutOfBusiness: false,
    foundedYear: 1920,
    closedYear: null,
    lotId: null,
    vacancies: { day: [], night: [] },
    businessData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Business;
}

describe('buildBusinessContext', () => {
  it('returns null when no business is provided', () => {
    expect(buildBusinessContext(null, 'Baker', false)).toBeNull();
    expect(buildBusinessContext(undefined, 'Baker', false)).toBeNull();
  });

  it('includes business type role context for known types', () => {
    const biz = makeBusiness({ businessType: 'Bakery' });
    const result = buildBusinessContext(biz, 'Baker', false);
    expect(result).toContain('bake and sell bread');
  });

  it('includes vocation behavior for known vocations', () => {
    const biz = makeBusiness({ businessType: 'Bakery' });
    const result = buildBusinessContext(biz, 'Baker', false);
    expect(result).toContain('baked goods fresh each day');
  });

  it('uses Owner behavior when vocation is unknown but NPC is the owner', () => {
    const biz = makeBusiness({ businessType: 'Shop' });
    const result = buildBusinessContext(biz, 'Shopkeeper', true);
    expect(result).toContain('take pride in your business');
  });

  it('does not use Owner behavior when NPC is not the owner and vocation is unknown', () => {
    const biz = makeBusiness({ businessType: 'Shop' });
    const result = buildBusinessContext(biz, 'Shopkeeper', false);
    expect(result).not.toContain('take pride in your business');
  });

  it('includes business founding year', () => {
    const biz = makeBusiness({ foundedYear: 1920 });
    const result = buildBusinessContext(biz, 'Baker', false);
    expect(result).toContain('founded in year 1920');
  });

  it('works for Restaurant with Waiter vocation', () => {
    const biz = makeBusiness({ businessType: 'Restaurant', name: 'The Golden Spoon' });
    const result = buildBusinessContext(biz, 'Waiter', false);
    expect(result).toContain('serve food and drinks');
    expect(result).toContain('take orders');
  });

  it('works for Bar with Bartender vocation', () => {
    const biz = makeBusiness({ businessType: 'Bar', name: 'The Rusty Nail' });
    const result = buildBusinessContext(biz, 'Bartender', false);
    expect(result).toContain('social atmosphere');
    expect(result).toContain('mix drinks');
  });

  it('works for Hospital with Doctor vocation', () => {
    const biz = makeBusiness({ businessType: 'Hospital', name: 'General Hospital' });
    const result = buildBusinessContext(biz, 'Doctor', false);
    expect(result).toContain('medical care');
    expect(result).toContain('diagnose and treat');
  });

  it('works for GroceryStore with Grocer vocation', () => {
    const biz = makeBusiness({ businessType: 'GroceryStore', name: "Miller's Grocery" });
    const result = buildBusinessContext(biz, 'Grocer', false);
    expect(result).toContain('sell groceries');
    expect(result).toContain('shelves stocked');
  });

  it('returns context even for unknown business type if vocation is known', () => {
    const biz = makeBusiness({ businessType: 'Generic' as any });
    const result = buildBusinessContext(biz, 'Owner', true);
    expect(result).toContain('take pride in your business');
  });

  it('includes business name in founding year line', () => {
    const biz = makeBusiness({ name: 'The Golden Spoon', foundedYear: 1885 });
    const result = buildBusinessContext(biz, 'Cook', false);
    expect(result).toContain('The Golden Spoon was founded in year 1885');
  });

  it('handles Owner vocation explicitly', () => {
    const biz = makeBusiness({ businessType: 'LawFirm' });
    const result = buildBusinessContext(biz, 'Owner', false);
    expect(result).toContain('legal counsel');
    expect(result).toContain('take pride in your business');
  });
});

describe('buildBusinessContext in system prompt integration', () => {
  it('covers all standard business types', () => {
    const businessTypes = [
      'Bakery', 'Restaurant', 'Bar', 'GroceryStore', 'Hotel', 'Hospital',
      'Bank', 'LawFirm', 'Shop', 'Pharmacy', 'School', 'University',
      'Farm', 'Factory', 'Brewery', 'Church', 'PoliceStation', 'FireStation',
      'TownHall', 'Daycare', 'JewelryStore', 'TattoParlor', 'DentalOffice',
      'OptometryOffice', 'RealEstateOffice', 'InsuranceOffice', 'Mortuary',
      'ApartmentComplex',
    ];

    for (const bt of businessTypes) {
      const biz = makeBusiness({ businessType: bt });
      const result = buildBusinessContext(biz, 'Worker', false);
      expect(result).toBeTruthy();
      expect(result!.length).toBeGreaterThan(10);
    }
  });

  it('covers key vocations', () => {
    const vocations = [
      'Owner', 'Manager', 'Cashier', 'Waiter', 'Bartender', 'Baker',
      'Cook', 'Doctor', 'Nurse', 'Teacher', 'Grocer', 'Butcher',
      'Barber', 'Farmer', 'Innkeeper', 'Concierge',
    ];

    for (const voc of vocations) {
      const biz = makeBusiness({ businessType: 'Shop' });
      const result = buildBusinessContext(biz, voc, false);
      expect(result).toBeTruthy();
    }
  });
});
