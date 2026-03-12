/**
 * Integration tests for building lifecycle functions:
 * constructBuilding, demolishBuilding, handleBusinessSuccession
 *
 * Functions under test are in server/extensions/tott/building-commission-system.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock storage singleton (vi.hoisted so it's available to hoisted vi.mock) ----
const mockStorage = vi.hoisted(() => ({
  getLot: vi.fn(),
  updateLot: vi.fn(),
  getBusiness: vi.fn(),
  updateBusiness: vi.fn(),
  getCharacter: vi.fn(),
  getWorld: vi.fn(),
  getSettlementsByWorld: vi.fn(),
  getLotsBySettlement: vi.fn(),
  createTruth: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

// ---- Mock dependent TotT modules ----
vi.mock('../extensions/tott/personality-behavior-system.js', () => ({
  getPersonality: vi.fn(() => ({
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5,
  })),
}));

vi.mock('../extensions/tott/hiring-system.js', () => ({
  getBusinessEmployees: vi.fn(() => []),
}));

vi.mock('../extensions/tott/business-system.js', () => ({
  closeBusiness: vi.fn(),
  transferOwnership: vi.fn(),
}));

vi.mock('../extensions/tott/prolog-queries.js', () => ({
  prologAssertFact: vi.fn(),
}));

import {
  constructBuilding,
  demolishBuilding,
  handleBusinessSuccession,
} from '../extensions/tott/building-commission-system';
import { getBusinessEmployees } from '../extensions/tott/hiring-system.js';
import { closeBusiness, transferOwnership } from '../extensions/tott/business-system.js';

// ---- Helpers ----
const WORLD_ID = 'world-1';

function makeLot(overrides: Record<string, any> = {}) {
  return {
    id: 'lot-1',
    worldId: WORLD_ID,
    settlementId: 'settlement-1',
    buildingId: null,
    buildingType: 'vacant',
    formerBuildingIds: [],
    address: '123 Main St',
    ...overrides,
  };
}

function makeBusiness(overrides: Record<string, any> = {}) {
  return {
    id: 'biz-1',
    worldId: WORLD_ID,
    name: 'Test Bakery',
    businessType: 'bakery',
    lotId: 'lot-1',
    isOutOfBusiness: false,
    ownerId: 'char-owner',
    ...overrides,
  };
}

function makeCharacter(overrides: Record<string, any> = {}) {
  return {
    id: 'char-1',
    worldId: WORLD_ID,
    firstName: 'Alice',
    lastName: 'Smith',
    status: 'active',
    retired: false,
    birthYear: 1980,
    relationships: null,
    ...overrides,
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe('Building Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- constructBuilding ----------
  describe('constructBuilding', () => {
    it('finds a vacant lot and updates lot.buildingId', async () => {
      const lot = makeLot();
      const updatedLot = { ...lot, buildingId: 'lot-1', buildingType: 'residence' };

      mockStorage.getLot.mockResolvedValue(lot);
      mockStorage.updateLot.mockResolvedValue(updatedLot);

      const result = await constructBuilding(WORLD_ID, 'lot-1', null, 'house');

      expect(result.lot.buildingId).toBe('lot-1');
      expect(result.lot.buildingType).toBe('residence');
      expect(result.buildingId).toBe('lot-1'); // no businessId → uses lotId
      expect(mockStorage.updateLot).toHaveBeenCalledWith('lot-1', {
        buildingId: 'lot-1',
        buildingType: 'residence',
      });
    });

    it('links an existing business to the lot', async () => {
      const lot = makeLot();
      const biz = makeBusiness({ id: 'biz-99', lotId: null });
      const updatedLot = { ...lot, buildingId: 'biz-99', buildingType: 'business' };

      mockStorage.getLot.mockResolvedValue(lot);
      mockStorage.getBusiness.mockResolvedValue(biz);
      mockStorage.updateBusiness.mockResolvedValue(undefined);
      mockStorage.updateLot.mockResolvedValue(updatedLot);

      const result = await constructBuilding(WORLD_ID, 'lot-1', 'biz-99', 'shop');

      expect(result.buildingId).toBe('biz-99');
      expect(result.business).toBeDefined();
      expect(mockStorage.updateBusiness).toHaveBeenCalledWith('biz-99', { lotId: 'lot-1' });
    });

    it('throws when lot is already occupied', async () => {
      const occupiedLot = makeLot({ buildingId: 'existing-bldg', buildingType: 'business' });
      mockStorage.getLot.mockResolvedValue(occupiedLot);

      await expect(constructBuilding(WORLD_ID, 'lot-1', null, 'house')).rejects.toThrow(
        /not vacant/
      );
    });

    it('throws when lot does not exist', async () => {
      mockStorage.getLot.mockResolvedValue(null);

      await expect(constructBuilding(WORLD_ID, 'lot-999', null, 'house')).rejects.toThrow(
        /not found/
      );
    });
  });

  // ---------- demolishBuilding ----------
  describe('demolishBuilding', () => {
    it('returns lot to vacant and populates formerBuildingIds', async () => {
      const lot = makeLot({ buildingId: 'bldg-1', buildingType: 'residence' });
      const updatedLot = {
        ...lot,
        buildingId: null,
        buildingType: 'vacant',
        formerBuildingIds: ['bldg-1'],
      };

      // findLotByBuildingId searches settlements → lots
      mockStorage.getWorld.mockResolvedValue({ id: WORLD_ID });
      mockStorage.getSettlementsByWorld.mockResolvedValue([{ id: 'settlement-1' }]);
      mockStorage.getLotsBySettlement.mockResolvedValue([lot]);
      mockStorage.updateLot.mockResolvedValue(updatedLot);

      const result = await demolishBuilding(WORLD_ID, 'bldg-1');

      expect(result.formerBuildingId).toBe('bldg-1');
      expect(result.lot.buildingType).toBe('vacant');
      expect(result.lot.formerBuildingIds).toContain('bldg-1');
      expect(mockStorage.updateLot).toHaveBeenCalledWith(
        'lot-1',
        expect.objectContaining({
          buildingId: null,
          buildingType: 'vacant',
          formerBuildingIds: ['bldg-1'],
        })
      );
    });

    it('throws when business is still active', async () => {
      const lot = makeLot({ buildingId: 'biz-1', buildingType: 'business' });
      const activeBusiness = makeBusiness({ isOutOfBusiness: false });

      mockStorage.getWorld.mockResolvedValue({ id: WORLD_ID });
      mockStorage.getSettlementsByWorld.mockResolvedValue([{ id: 'settlement-1' }]);
      mockStorage.getLotsBySettlement.mockResolvedValue([lot]);
      mockStorage.getBusiness.mockResolvedValue(activeBusiness);

      await expect(demolishBuilding(WORLD_ID, 'biz-1')).rejects.toThrow(/still active/);
    });

    it('clears business lotId when demolishing a closed business', async () => {
      const lot = makeLot({ buildingId: 'biz-1', buildingType: 'business' });
      const closedBusiness = makeBusiness({ isOutOfBusiness: true });
      const updatedLot = {
        ...lot,
        buildingId: null,
        buildingType: 'vacant',
        formerBuildingIds: ['biz-1'],
      };

      mockStorage.getWorld.mockResolvedValue({ id: WORLD_ID });
      mockStorage.getSettlementsByWorld.mockResolvedValue([{ id: 'settlement-1' }]);
      mockStorage.getLotsBySettlement.mockResolvedValue([lot]);
      mockStorage.getBusiness.mockResolvedValue(closedBusiness);
      mockStorage.updateBusiness.mockResolvedValue(undefined);
      mockStorage.updateLot.mockResolvedValue(updatedLot);

      const result = await demolishBuilding(WORLD_ID, 'biz-1');

      expect(result.lot.buildingType).toBe('vacant');
      expect(mockStorage.updateBusiness).toHaveBeenCalledWith('biz-1', { lotId: null });
    });
  });

  // ---------- handleBusinessSuccession ----------
  describe('handleBusinessSuccession', () => {
    it('transfers to family member (spouse) when available', async () => {
      const owner = makeCharacter({
        id: 'char-owner',
        firstName: 'Bob',
        lastName: 'Jones',
        relationships: {
          'char-spouse': { type: 'spouse' },
        },
      });
      const spouse = makeCharacter({
        id: 'char-spouse',
        firstName: 'Carol',
        lastName: 'Jones',
      });
      const business = makeBusiness({ id: 'biz-1', ownerId: 'char-owner' });

      mockStorage.getBusiness.mockResolvedValue(business);
      mockStorage.getCharacter.mockImplementation(async (id: string) => {
        if (id === 'char-owner') return owner;
        if (id === 'char-spouse') return spouse;
        return null;
      });
      mockStorage.createTruth.mockResolvedValue({});

      const result = await handleBusinessSuccession(WORLD_ID, 'biz-1', 'char-owner');

      expect(result.outcome).toBe('family_successor');
      expect(result.successorId).toBe('char-spouse');
      expect(result.successorRelation).toBe('spouse');
      expect(transferOwnership).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId: 'biz-1',
          newOwnerId: 'char-spouse',
          transferReason: 'inheritance',
        })
      );
    });

    it('transfers to adult child when no spouse available', async () => {
      const owner = makeCharacter({
        id: 'char-owner',
        firstName: 'Bob',
        lastName: 'Jones',
        birthYear: 1960,
        relationships: {
          'char-child': { type: 'child' },
        },
      });
      const child = makeCharacter({
        id: 'char-child',
        firstName: 'Dave',
        lastName: 'Jones',
        birthYear: 1990,
      });
      const business = makeBusiness({ id: 'biz-1', ownerId: 'char-owner' });

      mockStorage.getBusiness.mockResolvedValue(business);
      mockStorage.getCharacter.mockImplementation(async (id: string) => {
        if (id === 'char-owner') return owner;
        if (id === 'char-child') return child;
        return null;
      });
      mockStorage.createTruth.mockResolvedValue({});

      const result = await handleBusinessSuccession(WORLD_ID, 'biz-1', 'char-owner');

      expect(result.outcome).toBe('family_successor');
      expect(result.successorId).toBe('char-child');
      expect(result.successorRelation).toBe('child');
    });

    it('transfers to senior employee when no family available', async () => {
      const owner = makeCharacter({
        id: 'char-owner',
        firstName: 'Bob',
        lastName: 'Jones',
        relationships: null,
      });
      const employee = makeCharacter({
        id: 'char-emp',
        firstName: 'Eve',
        lastName: 'Worker',
      });
      const business = makeBusiness({ id: 'biz-1', ownerId: 'char-owner' });

      mockStorage.getBusiness.mockResolvedValue(business);
      mockStorage.getCharacter.mockImplementation(async (id: string) => {
        if (id === 'char-owner') return owner;
        return null;
      });
      mockStorage.createTruth.mockResolvedValue({});

      // Mock getBusinessEmployees to return an employee
      vi.mocked(getBusinessEmployees).mockResolvedValue([
        {
          character: employee,
          occupation: { startYear: 2010, title: 'Baker', businessId: 'biz-1' } as any,
        },
      ]);

      const result = await handleBusinessSuccession(WORLD_ID, 'biz-1', 'char-owner');

      expect(result.outcome).toBe('employee_successor');
      expect(result.successorId).toBe('char-emp');
      expect(result.successorRelation).toBe('senior employee');
      expect(transferOwnership).toHaveBeenCalled();
    });

    it('closes business when no successor exists', async () => {
      const owner = makeCharacter({
        id: 'char-owner',
        firstName: 'Bob',
        lastName: 'Jones',
        relationships: null,
      });
      const business = makeBusiness({ id: 'biz-1', ownerId: 'char-owner' });

      mockStorage.getBusiness.mockResolvedValue(business);
      mockStorage.getCharacter.mockImplementation(async (id: string) => {
        if (id === 'char-owner') return owner;
        return null;
      });
      mockStorage.createTruth.mockResolvedValue({});

      // No employees
      vi.mocked(getBusinessEmployees).mockResolvedValue([]);

      const result = await handleBusinessSuccession(WORLD_ID, 'biz-1', 'char-owner');

      expect(result.outcome).toBe('business_closed');
      expect(result.successorId).toBeUndefined();
      expect(closeBusiness).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId: 'biz-1',
          reason: 'retirement',
          notifyEmployees: true,
        })
      );
    });
  });
});
