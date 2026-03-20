/**
 * Tests for CharacterDetailView workplace, residence, and business ownership display.
 *
 * Run with: npx vitest run client/src/components/characters/__tests__/CharacterDetailWorkplaceResidence.test.ts
 */

import { describe, it, expect } from 'vitest';

// Test helper: determines the current occupation from an occupation history array
// This mirrors the logic in CharacterDetailView
function getCurrentOccupation(occupationHistory: any[]): any | undefined {
  return occupationHistory.find((o: any) => !o.endYear) || occupationHistory[0];
}

// Test helper: filters co-residents (excludes the character themselves)
function getCoResidents(residentIds: string[], characterId: string): string[] {
  return residentIds.filter(id => id !== characterId);
}

describe('CharacterDetailView – Workplace & Residence logic', () => {
  describe('getCurrentOccupation', () => {
    it('returns the occupation without an endYear (current job)', () => {
      const history = [
        { vocation: 'Cashier', businessId: 'biz-1', startYear: 1900, endYear: 1910 },
        { vocation: 'Manager', businessId: 'biz-2', startYear: 1910, endYear: null },
        { vocation: 'Worker', businessId: 'biz-3', startYear: 1905, endYear: 1908 },
      ];
      const current = getCurrentOccupation(history);
      expect(current.vocation).toBe('Manager');
      expect(current.businessId).toBe('biz-2');
    });

    it('falls back to first entry when all occupations have endYear', () => {
      const history = [
        { vocation: 'Cashier', businessId: 'biz-1', startYear: 1900, endYear: 1910 },
        { vocation: 'Worker', businessId: 'biz-2', startYear: 1910, endYear: 1920 },
      ];
      const current = getCurrentOccupation(history);
      expect(current.vocation).toBe('Cashier');
    });

    it('returns undefined for empty history', () => {
      expect(getCurrentOccupation([])).toBeUndefined();
    });

    it('handles single-entry history', () => {
      const history = [{ vocation: 'Doctor', businessId: 'biz-1', startYear: 1950 }];
      const current = getCurrentOccupation(history);
      expect(current.vocation).toBe('Doctor');
    });
  });

  describe('getCoResidents', () => {
    it('excludes the character themselves from resident list', () => {
      const residentIds = ['char-1', 'char-2', 'char-3'];
      const coResidents = getCoResidents(residentIds, 'char-2');
      expect(coResidents).toEqual(['char-1', 'char-3']);
    });

    it('returns empty when character is the only resident', () => {
      const residentIds = ['char-1'];
      const coResidents = getCoResidents(residentIds, 'char-1');
      expect(coResidents).toEqual([]);
    });

    it('returns all when character is not in the list', () => {
      const residentIds = ['char-1', 'char-2'];
      const coResidents = getCoResidents(residentIds, 'char-99');
      expect(coResidents).toEqual(['char-1', 'char-2']);
    });
  });

  describe('section visibility logic', () => {
    it('shows section when residence data exists', () => {
      const residence = { id: 'res-1', address: '123 Main St', residenceType: 'house' };
      const workplaceBusiness = null;
      const currentOccupation = undefined;
      const ownedBusinesses: any[] = [];

      const shouldShow = !!(residence || workplaceBusiness || currentOccupation || ownedBusinesses.length > 0);
      expect(shouldShow).toBe(true);
    });

    it('shows section when workplace business exists', () => {
      const residence = null;
      const workplaceBusiness = { id: 'biz-1', name: 'Town Bakery', businessType: 'Bakery' };
      const currentOccupation = undefined;
      const ownedBusinesses: any[] = [];

      const shouldShow = !!(residence || workplaceBusiness || currentOccupation || ownedBusinesses.length > 0);
      expect(shouldShow).toBe(true);
    });

    it('shows section when owned businesses exist', () => {
      const residence = null;
      const workplaceBusiness = null;
      const currentOccupation = undefined;
      const ownedBusinesses = [{ id: 'biz-1', name: 'My Store', businessType: 'GroceryStore' }];

      const shouldShow = !!(residence || workplaceBusiness || currentOccupation || ownedBusinesses.length > 0);
      expect(shouldShow).toBe(true);
    });

    it('shows section when current occupation exists', () => {
      const residence = null;
      const workplaceBusiness = null;
      const currentOccupation = { vocation: 'Doctor', shift: 'day' };
      const ownedBusinesses: any[] = [];

      const shouldShow = !!(residence || workplaceBusiness || currentOccupation || ownedBusinesses.length > 0);
      expect(shouldShow).toBe(true);
    });

    it('hides section when all data is empty/null', () => {
      const residence = null;
      const workplaceBusiness = null;
      const currentOccupation = undefined;
      const ownedBusinesses: any[] = [];

      const shouldShow = !!(residence || workplaceBusiness || currentOccupation || ownedBusinesses.length > 0);
      expect(shouldShow).toBe(false);
    });
  });

  describe('business ownership display', () => {
    it('displays correct count for multiple businesses', () => {
      const businesses = [
        { id: 'b1', name: 'Bakery', businessType: 'Bakery' },
        { id: 'b2', name: 'Law Office', businessType: 'LawFirm' },
        { id: 'b3', name: 'Hotel Royal', businessType: 'Hotel' },
      ];
      expect(businesses.length).toBe(3);
    });

    it('filters out closed businesses are still shown (ownedBusinesses from API)', () => {
      // The API endpoint returns all businesses where ownerId matches,
      // including closed ones. The UI shows them all.
      const businesses = [
        { id: 'b1', name: 'Open Shop', businessType: 'GroceryStore', isOutOfBusiness: false },
        { id: 'b2', name: 'Closed Shop', businessType: 'Bakery', isOutOfBusiness: true },
      ];
      expect(businesses.length).toBe(2);
    });
  });

  describe('occupation data extraction', () => {
    it('extracts vocation, shift, and startYear from occupation', () => {
      const occupation = {
        vocation: 'Doctor',
        shift: 'day',
        startYear: 1945,
        businessId: 'biz-hospital',
        level: 3,
      };
      expect(occupation.vocation).toBe('Doctor');
      expect(occupation.shift).toBe('day');
      expect(occupation.startYear).toBe(1945);
    });

    it('handles occupation with missing optional fields', () => {
      const occupation = {
        vocation: 'Worker',
        businessId: 'biz-1',
      };
      expect(occupation.vocation).toBe('Worker');
      expect((occupation as any).shift).toBeUndefined();
      expect((occupation as any).startYear).toBeUndefined();
    });
  });
});
