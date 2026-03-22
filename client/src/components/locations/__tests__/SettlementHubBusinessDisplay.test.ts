/**
 * Tests for business owner and employee display logic in SettlementHub.
 * Validates the characterNameMap lookup and display string generation.
 */

import { describe, it, expect } from 'vitest';

// Extracted logic: build a character name map from residents
function buildCharacterNameMap(residents: Array<{ id: string; firstName?: string | null; lastName?: string | null }>) {
  const map = new Map<string, string>();
  residents.forEach(c => {
    map.set(c.id, `${c.firstName ?? '?'} ${c.lastName ?? ''}`.trim());
  });
  return map;
}

// Extracted logic: get display info for a business
function getBusinessDisplayInfo(
  business: { ownerId?: string | null; employees?: Array<{ id: string; shift: string }> },
  characterNameMap: Map<string, string>,
) {
  const ownerName = business.ownerId ? characterNameMap.get(business.ownerId) ?? null : null;
  const employeeCount = business.employees?.length ?? 0;
  return { ownerName, employeeCount };
}

describe('SettlementHub business owner/employee display', () => {
  const residents = [
    { id: 'char-1', firstName: 'Alice', lastName: 'Smith' },
    { id: 'char-2', firstName: 'Bob', lastName: 'Jones' },
    { id: 'char-3', firstName: 'Carol', lastName: null },
    { id: 'char-4', firstName: null, lastName: null },
  ];

  const characterNameMap = buildCharacterNameMap(residents);

  describe('buildCharacterNameMap', () => {
    it('maps character IDs to full names', () => {
      expect(characterNameMap.get('char-1')).toBe('Alice Smith');
      expect(characterNameMap.get('char-2')).toBe('Bob Jones');
    });

    it('handles null lastName', () => {
      expect(characterNameMap.get('char-3')).toBe('Carol');
    });

    it('handles null firstName and lastName', () => {
      expect(characterNameMap.get('char-4')).toBe('?');
    });

    it('returns undefined for unknown IDs', () => {
      expect(characterNameMap.get('char-unknown')).toBeUndefined();
    });
  });

  describe('getBusinessDisplayInfo', () => {
    it('returns owner name and employee count', () => {
      const biz = {
        ownerId: 'char-1',
        employees: [
          { id: 'char-2', shift: 'day' },
          { id: 'char-3', shift: 'night' },
        ],
      };
      const info = getBusinessDisplayInfo(biz, characterNameMap);
      expect(info.ownerName).toBe('Alice Smith');
      expect(info.employeeCount).toBe(2);
    });

    it('returns null owner for missing ownerId', () => {
      const biz = { ownerId: null, employees: [{ id: 'char-2', shift: 'day' }] };
      const info = getBusinessDisplayInfo(biz, characterNameMap);
      expect(info.ownerName).toBeNull();
      expect(info.employeeCount).toBe(1);
    });

    it('returns null owner for unknown ownerId', () => {
      const biz = { ownerId: 'char-unknown', employees: [] };
      const info = getBusinessDisplayInfo(biz, characterNameMap);
      expect(info.ownerName).toBeNull();
      expect(info.employeeCount).toBe(0);
    });

    it('returns 0 employees when employees array is missing', () => {
      const biz = { ownerId: 'char-1' };
      const info = getBusinessDisplayInfo(biz, characterNameMap);
      expect(info.ownerName).toBe('Alice Smith');
      expect(info.employeeCount).toBe(0);
    });

    it('returns 0 employees for empty array', () => {
      const biz = { ownerId: 'char-2', employees: [] };
      const info = getBusinessDisplayInfo(biz, characterNameMap);
      expect(info.ownerName).toBe('Bob Jones');
      expect(info.employeeCount).toBe(0);
    });

    it('handles business with no ownerId field', () => {
      const biz = { employees: [{ id: 'char-1', shift: 'day' }] };
      const info = getBusinessDisplayInfo(biz, characterNameMap);
      expect(info.ownerName).toBeNull();
      expect(info.employeeCount).toBe(1);
    });
  });
});
