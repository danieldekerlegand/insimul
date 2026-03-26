/**
 * Tests for building occupantIds wiring in IR generation and DataSource fallback.
 */

import { describe, it, expect } from 'vitest';

/**
 * Extracts the occupantIds logic from ir-generator.ts into a testable function.
 * This mirrors the logic at the building construction loop.
 */
function buildOccupantIds(
  business: { id: string; ownerId?: string | null } | null,
  lotId: string | null,
  activeOccupantsByBusiness: Map<string, string[]>,
  residentsByLot: Map<string, string[]>,
): string[] {
  let occupantIds: string[] = [];
  if (business) {
    const employeeIds = activeOccupantsByBusiness.get(business.id) || [];
    if (business.ownerId) {
      occupantIds = [business.ownerId, ...employeeIds.filter(id => id !== business.ownerId)];
    } else {
      occupantIds = employeeIds;
    }
  } else if (lotId) {
    occupantIds = residentsByLot.get(lotId) || [];
  }
  return [...new Set(occupantIds.filter(Boolean))];
}

describe('buildOccupantIds (ir-generator logic)', () => {
  it('returns owner first followed by employees for a business building', () => {
    const activeOccupants = new Map([['biz1', ['char-a', 'char-b']]]);
    const residents = new Map<string, string[]>();
    const result = buildOccupantIds(
      { id: 'biz1', ownerId: 'owner-1' },
      'lot-1',
      activeOccupants,
      residents,
    );
    expect(result).toEqual(['owner-1', 'char-a', 'char-b']);
  });

  it('deduplicates when owner is also an employee', () => {
    const activeOccupants = new Map([['biz1', ['owner-1', 'char-b']]]);
    const residents = new Map<string, string[]>();
    const result = buildOccupantIds(
      { id: 'biz1', ownerId: 'owner-1' },
      'lot-1',
      activeOccupants,
      residents,
    );
    expect(result).toEqual(['owner-1', 'char-b']);
  });

  it('returns only employees when business has no owner', () => {
    const activeOccupants = new Map([['biz1', ['char-a']]]);
    const residents = new Map<string, string[]>();
    const result = buildOccupantIds(
      { id: 'biz1', ownerId: null },
      'lot-1',
      activeOccupants,
      residents,
    );
    expect(result).toEqual(['char-a']);
  });

  it('returns residentIds for residence buildings (no business)', () => {
    const activeOccupants = new Map<string, string[]>();
    const residents = new Map([['lot-1', ['res-a', 'res-b']]]);
    const result = buildOccupantIds(null, 'lot-1', activeOccupants, residents);
    expect(result).toEqual(['res-a', 'res-b']);
  });

  it('returns empty array for residence with no residents', () => {
    const activeOccupants = new Map<string, string[]>();
    const residents = new Map<string, string[]>();
    const result = buildOccupantIds(null, 'lot-1', activeOccupants, residents);
    expect(result).toEqual([]);
  });

  it('returns empty array for building with no business and no lot', () => {
    const activeOccupants = new Map<string, string[]>();
    const residents = new Map<string, string[]>();
    const result = buildOccupantIds(null, null, activeOccupants, residents);
    expect(result).toEqual([]);
  });

  it('filters out null/undefined entries', () => {
    const activeOccupants = new Map([['biz1', [null as any, 'char-a', undefined as any]]]);
    const residents = new Map<string, string[]>();
    const result = buildOccupantIds(
      { id: 'biz1', ownerId: null },
      null,
      activeOccupants,
      residents,
    );
    expect(result).toEqual(['char-a']);
  });

  it('removes duplicate residentIds', () => {
    const activeOccupants = new Map<string, string[]>();
    const residents = new Map([['lot-1', ['res-a', 'res-a', 'res-b']]]);
    const result = buildOccupantIds(null, 'lot-1', activeOccupants, residents);
    expect(result).toEqual(['res-a', 'res-b']);
  });
});

describe('activeOccupantsByBusiness map building', () => {
  it('filters out ended occupations (endYear is not null)', () => {
    const allOccupations = [
      { businessId: 'biz1', characterId: 'char-a', endYear: null },
      { businessId: 'biz1', characterId: 'char-b', endYear: 2020 },
      { businessId: 'biz1', characterId: 'char-c', endYear: null },
    ];
    const map = new Map<string, string[]>();
    for (const occ of allOccupations) {
      if (occ.endYear != null) continue;
      const list = map.get(occ.businessId) || [];
      list.push(occ.characterId);
      map.set(occ.businessId, list);
    }
    expect(map.get('biz1')).toEqual(['char-a', 'char-c']);
  });
});

describe('residentsByLot map building', () => {
  it('maps lotId to residentIds, skipping empty arrays', () => {
    const allResidences = [
      { lotId: 'lot-1', residentIds: ['res-a', 'res-b'] },
      { lotId: 'lot-2', residentIds: [] },
      { lotId: null, residentIds: ['res-c'] },
      { lotId: 'lot-3', residentIds: ['res-d'] },
    ];
    const map = new Map<string, string[]>();
    for (const res of allResidences) {
      if (res.lotId && Array.isArray(res.residentIds) && res.residentIds.length > 0) {
        map.set(res.lotId, res.residentIds);
      }
    }
    expect(map.get('lot-1')).toEqual(['res-a', 'res-b']);
    expect(map.has('lot-2')).toBe(false);
    expect(map.has('lot-3')).toBe(true);
  });
});

/**
 * Tests for the DataSource ownerId fallback logic.
 * Mirrors FileDataSource.loadSettlementBusinesses fallback path.
 */
describe('DataSource business ownerId fallback', () => {
  function deriveBusinessFromBuilding(
    building: any,
    businessIRs: any[],
  ) {
    const bizIR = businessIRs.find((biz: any) => biz.id === building.businessId);
    const hasOccupants = building.occupantIds?.length > 0;
    const ownerId = hasOccupants ? building.occupantIds[0] : (bizIR?.ownerId || null);
    const employees = hasOccupants ? building.occupantIds.slice(1) : [];
    return {
      id: building.businessId || building.id,
      ownerId,
      employees,
      businessType: bizIR?.businessType || building.spec?.buildingRole || 'Shop',
      name: bizIR?.name || building.spec?.buildingRole || 'Business',
    };
  }

  it('derives ownerId from occupantIds[0] when available', () => {
    const building = {
      id: 'bld-1',
      businessId: 'biz-1',
      occupantIds: ['owner-1', 'emp-1', 'emp-2'],
      spec: { buildingRole: 'Shop' },
    };
    const result = deriveBusinessFromBuilding(building, []);
    expect(result.ownerId).toBe('owner-1');
    expect(result.employees).toEqual(['emp-1', 'emp-2']);
  });

  it('falls back to BusinessIR.ownerId when occupantIds is empty', () => {
    const building = {
      id: 'bld-1',
      businessId: 'biz-1',
      occupantIds: [],
      spec: { buildingRole: 'Shop' },
    };
    const businessIRs = [{ id: 'biz-1', ownerId: 'owner-from-ir', businessType: 'Bakery', name: 'Good Bread' }];
    const result = deriveBusinessFromBuilding(building, businessIRs);
    expect(result.ownerId).toBe('owner-from-ir');
    expect(result.employees).toEqual([]);
  });

  it('returns null ownerId when both occupantIds and BusinessIR are empty', () => {
    const building = {
      id: 'bld-1',
      businessId: 'biz-1',
      occupantIds: [],
      spec: { buildingRole: 'Shop' },
    };
    const result = deriveBusinessFromBuilding(building, []);
    expect(result.ownerId).toBeNull();
  });

  it('uses BusinessIR name and type when available', () => {
    const building = {
      id: 'bld-1',
      businessId: 'biz-1',
      occupantIds: [],
      spec: { buildingRole: 'Shop' },
    };
    const businessIRs = [{ id: 'biz-1', ownerId: 'o1', businessType: 'Bakery', name: 'Good Bread' }];
    const result = deriveBusinessFromBuilding(building, businessIRs);
    expect(result.businessType).toBe('Bakery');
    expect(result.name).toBe('Good Bread');
  });
});
