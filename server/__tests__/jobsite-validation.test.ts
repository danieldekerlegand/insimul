import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateOccupationChains,
  validateAndAutoFix,
  getBuildingTypeForBusiness,
  type JobsiteValidationStorage,
  type ValidationResult,
} from '../services/jobsite-validation.js';
import type { Character, Business, Lot, InsertBusiness, InsertLot } from '@shared/schema';

/** In-memory mock storage for testing */
class MockStorage implements JobsiteValidationStorage {
  characters: Character[] = [];
  businesses: Business[] = [];
  lots: Lot[] = [];
  settlements: Array<{ id: string; name: string; worldId: string }> = [];
  private nextId = 100;

  async getCharactersByWorld(worldId: string): Promise<Character[]> {
    return this.characters.filter(c => (c as any).worldId === worldId);
  }

  async getBusinessesByWorld(worldId: string): Promise<Business[]> {
    return this.businesses.filter(b => b.worldId === worldId);
  }

  async getLotsBySettlement(settlementId: string): Promise<Lot[]> {
    return this.lots.filter(l => l.settlementId === settlementId);
  }

  async getSettlementsByWorld(worldId: string): Promise<Array<{ id: string; name: string; worldId: string }>> {
    return this.settlements.filter(s => s.worldId === worldId);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const newBiz = {
      ...business,
      id: `biz_${this.nextId++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Business;
    this.businesses.push(newBiz);
    return newBiz;
  }

  async createLot(lot: InsertLot): Promise<Lot> {
    const newLot = {
      ...lot,
      id: `lot_${this.nextId++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Lot;
    this.lots.push(newLot);
    return newLot;
  }

  async updateBusiness(id: string, update: Partial<InsertBusiness>): Promise<Business | undefined> {
    const idx = this.businesses.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    this.businesses[idx] = { ...this.businesses[idx], ...update } as Business;
    return this.businesses[idx];
  }

  async updateLot(id: string, update: Partial<InsertLot>): Promise<Lot | undefined> {
    const idx = this.lots.findIndex(l => l.id === id);
    if (idx === -1) return undefined;
    this.lots[idx] = { ...this.lots[idx], ...update } as Lot;
    return this.lots[idx];
  }
}

function makeCharacter(overrides: Record<string, any> = {}): Character {
  return {
    id: overrides.id || 'char_1',
    worldId: overrides.worldId || 'world_1',
    firstName: overrides.firstName || 'John',
    lastName: overrides.lastName || 'Smith',
    currentOccupationId: overrides.currentOccupationId || null,
    customData: overrides.customData || {},
    ...overrides,
  } as unknown as Character;
}

function makeBusiness(overrides: Record<string, any> = {}): Business {
  return {
    id: overrides.id || 'biz_1',
    worldId: overrides.worldId || 'world_1',
    settlementId: overrides.settlementId || 'settle_1',
    name: overrides.name || 'Test Bakery',
    businessType: overrides.businessType || 'Bakery',
    ownerId: overrides.ownerId || 'char_1',
    founderId: overrides.founderId || 'char_1',
    isOutOfBusiness: overrides.isOutOfBusiness || false,
    foundedYear: overrides.foundedYear || 1900,
    lotId: overrides.lotId || null,
    vacancies: overrides.vacancies || { day: [], night: [] },
    businessData: overrides.businessData || {},
    createdAt: new Date(),
    updatedAt: new Date(),
    closedYear: null,
  } as unknown as Business;
}

function makeLot(overrides: Record<string, any> = {}): Lot {
  return {
    id: overrides.id || 'lot_1',
    worldId: overrides.worldId || 'world_1',
    settlementId: overrides.settlementId || 'settle_1',
    address: overrides.address || '1 Main Street',
    houseNumber: overrides.houseNumber || 1,
    streetName: overrides.streetName || 'Main Street',
    buildingId: overrides.buildingId || null,
    buildingType: overrides.buildingType || 'vacant',
    neighboringLotIds: overrides.neighboringLotIds || [],
    distanceFromDowntown: overrides.distanceFromDowntown || 1,
    formerBuildingIds: overrides.formerBuildingIds || [],
    block: null,
    districtName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Lot;
}

let storage: MockStorage;

beforeEach(() => {
  storage = new MockStorage();
  storage.settlements = [
    { id: 'settle_1', name: 'Testville', worldId: 'world_1' },
  ];
});

describe('getBuildingTypeForBusiness', () => {
  it('maps known business types to building types', () => {
    expect(getBuildingTypeForBusiness('Bakery')).toBe('Bakery');
    expect(getBuildingTypeForBusiness('Hospital')).toBe('Hospital');
    expect(getBuildingTypeForBusiness('LawFirm')).toBe('LawFirm');
    expect(getBuildingTypeForBusiness('Restaurant')).toBe('Restaurant');
  });

  it('maps aliased business types to building types', () => {
    expect(getBuildingTypeForBusiness('GroceryStore')).toBe('Market');
    expect(getBuildingTypeForBusiness('Bar')).toBe('Tavern');
    expect(getBuildingTypeForBusiness('Hotel')).toBe('Inn');
    expect(getBuildingTypeForBusiness('DentalOffice')).toBe('Hospital');
  });

  it('falls back to Shop for unknown business types', () => {
    expect(getBuildingTypeForBusiness('UnknownType')).toBe('Shop');
  });
});

describe('validateOccupationChains', () => {
  it('returns empty result for world with no employed characters', async () => {
    storage.characters = [makeCharacter()]; // no occupation
    const result = await validateOccupationChains('world_1', storage);
    expect(result.totalEmployedCharacters).toBe(0);
    expect(result.chains).toHaveLength(0);
    expect(result.brokenChains).toBe(0);
  });

  it('validates a complete chain successfully', async () => {
    const lot = makeLot({ id: 'lot_1', buildingId: 'biz_1', buildingType: 'business' });
    const business = makeBusiness({ id: 'biz_1', lotId: 'lot_1' });
    const character = makeCharacter({
      id: 'char_1',
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];
    storage.businesses = [business];
    storage.lots = [lot];

    const result = await validateOccupationChains('world_1', storage);
    expect(result.totalEmployedCharacters).toBe(1);
    expect(result.validChains).toBe(1);
    expect(result.brokenChains).toBe(0);
    expect(result.chains[0].hasBuildingOnLot).toBe(true);
    expect(result.chains[0].issues).toHaveLength(0);
  });

  it('detects missing business', async () => {
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_missing', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];

    const result = await validateOccupationChains('world_1', storage);
    expect(result.brokenChains).toBe(1);
    expect(result.chains[0].issues).toContain('Business biz_missing not found');
  });

  it('detects business with no lot', async () => {
    const business = makeBusiness({ id: 'biz_1', lotId: null });
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];
    storage.businesses = [business];

    const result = await validateOccupationChains('world_1', storage);
    expect(result.brokenChains).toBe(1);
    expect(result.chains[0].issues.some(i => i.includes('no lotId'))).toBe(true);
  });

  it('detects lot with no building', async () => {
    const lot = makeLot({ id: 'lot_1', buildingId: null, buildingType: 'vacant' });
    const business = makeBusiness({ id: 'biz_1', lotId: 'lot_1' });
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];
    storage.businesses = [business];
    storage.lots = [lot];

    const result = await validateOccupationChains('world_1', storage);
    expect(result.brokenChains).toBe(1);
    expect(result.chains[0].issues.some(i => i.includes('no building'))).toBe(true);
  });

  it('detects out-of-business flag', async () => {
    const lot = makeLot({ id: 'lot_1', buildingId: 'biz_1', buildingType: 'business' });
    const business = makeBusiness({ id: 'biz_1', lotId: 'lot_1', isOutOfBusiness: true });
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];
    storage.businesses = [business];
    storage.lots = [lot];

    const result = await validateOccupationChains('world_1', storage);
    expect(result.brokenChains).toBe(1);
    expect(result.chains[0].issues.some(i => i.includes('out of business'))).toBe(true);
  });

  it('handles multiple characters with mixed chain status', async () => {
    const lot = makeLot({ id: 'lot_1', buildingId: 'biz_1', buildingType: 'business' });
    const business = makeBusiness({ id: 'biz_1', lotId: 'lot_1' });

    const validChar = makeCharacter({
      id: 'char_1',
      firstName: 'Valid',
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    const brokenChar = makeCharacter({
      id: 'char_2',
      firstName: 'Broken',
      currentOccupationId: 'occ_2',
      customData: {
        currentOccupation: { id: 'occ_2', businessId: 'biz_missing', vocation: 'Cook', shift: 'day', startYear: 1900 },
      },
    });
    const unemployed = makeCharacter({ id: 'char_3', firstName: 'Unemployed' });

    storage.characters = [validChar, brokenChar, unemployed];
    storage.businesses = [business];
    storage.lots = [lot];

    const result = await validateOccupationChains('world_1', storage);
    expect(result.totalEmployedCharacters).toBe(2);
    expect(result.validChains).toBe(1);
    expect(result.brokenChains).toBe(1);
  });
});

describe('validateAndAutoFix', () => {
  it('auto-generates business when missing', async () => {
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_missing', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];

    const result = await validateAndAutoFix('world_1', storage);
    expect(result.autoFixed).toBeGreaterThan(0);
    // A business should have been created
    expect(storage.businesses.length).toBe(1);
    expect(storage.businesses[0].businessType).toBe('Bakery');
    // A lot should have been created and linked
    expect(storage.lots.length).toBe(1);
    expect(storage.lots[0].buildingType).toBe('business');
    expect(result.brokenChains).toBe(0);
  });

  it('links existing vacant lot when business has no lot', async () => {
    const vacantLot = makeLot({ id: 'lot_1', buildingType: 'vacant', buildingId: null });
    const business = makeBusiness({ id: 'biz_1', lotId: null });
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];
    storage.businesses = [business];
    storage.lots = [vacantLot];

    const result = await validateAndAutoFix('world_1', storage);
    expect(result.autoFixed).toBeGreaterThan(0);
    // Business should now have the lot
    expect(storage.businesses[0].lotId).toBe('lot_1');
    // Lot should now have the business
    expect(storage.lots[0].buildingId).toBe('biz_1');
    expect(storage.lots[0].buildingType).toBe('business');
  });

  it('creates new lot when no vacant lots available', async () => {
    const occupiedLot = makeLot({ id: 'lot_1', buildingType: 'business', buildingId: 'biz_other' });
    const business = makeBusiness({ id: 'biz_1', lotId: null });
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];
    storage.businesses = [business];
    storage.lots = [occupiedLot];

    const result = await validateAndAutoFix('world_1', storage);
    expect(result.autoFixed).toBeGreaterThan(0);
    // A new lot should have been created (original + 1 new)
    expect(storage.lots.length).toBe(2);
    const newLot = storage.lots[1];
    expect(newLot.houseNumber).toBe(2); // 1 existing + 1
    expect(newLot.buildingType).toBe('business');
  });

  it('fixes building link on lot when lot exists but not linked to business', async () => {
    const lot = makeLot({ id: 'lot_1', buildingType: 'vacant', buildingId: null });
    const business = makeBusiness({ id: 'biz_1', lotId: 'lot_1' });
    const character = makeCharacter({
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    storage.characters = [character];
    storage.businesses = [business];
    storage.lots = [lot];

    const result = await validateAndAutoFix('world_1', storage);
    expect(result.autoFixed).toBeGreaterThan(0);
    expect(storage.lots[0].buildingId).toBe('biz_1');
    expect(storage.lots[0].buildingType).toBe('business');
  });

  it('returns empty result for world with no settlements', async () => {
    storage.settlements = [];
    const result = await validateAndAutoFix('world_1', storage);
    expect(result.totalEmployedCharacters).toBe(0);
    expect(result.warnings).toContain('No settlements found in world');
  });

  it('handles world with employed NPCs — validates all chains and triggers auto-generation', async () => {
    // Two employed NPCs: one with complete chain, one with broken chain
    const lot = makeLot({ id: 'lot_1', buildingId: 'biz_1', buildingType: 'business' });
    const business = makeBusiness({ id: 'biz_1', lotId: 'lot_1', businessType: 'Bakery' });

    const validChar = makeCharacter({
      id: 'char_1',
      firstName: 'Alice',
      currentOccupationId: 'occ_1',
      customData: {
        currentOccupation: { id: 'occ_1', businessId: 'biz_1', vocation: 'Baker', shift: 'day', startYear: 1900 },
      },
    });
    const brokenChar = makeCharacter({
      id: 'char_2',
      firstName: 'Bob',
      currentOccupationId: 'occ_2',
      customData: {
        currentOccupation: { id: 'occ_2', businessId: 'biz_gone', vocation: 'Doctor', shift: 'day', startYear: 1900 },
      },
    });

    storage.characters = [validChar, brokenChar];
    storage.businesses = [business];
    storage.lots = [lot];

    const result = await validateAndAutoFix('world_1', storage);
    expect(result.totalEmployedCharacters).toBe(2);
    // Alice should be valid, Bob should have been auto-fixed
    expect(result.autoFixed).toBeGreaterThan(0);
    expect(result.brokenChains).toBe(0);
    // Bob's auto-generated business should be a Hospital (Doctor → Hospital mapping)
    const bobBiz = storage.businesses.find(b => b.ownerId === 'char_2');
    expect(bobBiz).toBeDefined();
    expect(bobBiz!.businessType).toBe('Hospital');
  });
});
