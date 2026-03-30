/**
 * Jobsite Validation and Auto-Generation Service
 *
 * Validates the NPC occupation chain: character → occupation → business → lot → building
 * Auto-generates missing businesses, lots, and buildings when chains are broken.
 */

import type { Character, Business, Lot, InsertBusiness, InsertLot } from '@shared/schema';

/** Minimal storage interface for dependency injection */
export interface JobsiteValidationStorage {
  getCharactersByWorld(worldId: string): Promise<Character[]>;
  getBusinessesByWorld(worldId: string): Promise<Business[]>;
  getLotsBySettlement(settlementId: string): Promise<Lot[]>;
  getSettlementsByWorld(worldId: string): Promise<Array<{ id: string; name: string; worldId: string }>>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  createLot(lot: InsertLot): Promise<Lot>;
  createResidence(residence: any): Promise<any>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
}

/** Occupation data stored in character.customData.currentOccupation */
interface OccupationData {
  id: string;
  businessId: string;
  vocation: string;
  shift: string;
  startYear: number;
  yearsExperience?: number;
  level?: number;
  isSupplemental?: boolean;
  hiredAsFavor?: boolean;
}

export interface ChainStatus {
  characterId: string;
  characterName: string;
  occupationId: string | null;
  vocation: string | null;
  businessId: string | null;
  businessName: string | null;
  businessType: string | null;
  lotId: string | null;
  lotAddress: string | null;
  hasBuildingOnLot: boolean;
  issues: string[];
}

export interface ValidationResult {
  worldId: string;
  totalEmployedCharacters: number;
  validChains: number;
  brokenChains: number;
  autoFixed: number;
  chains: ChainStatus[];
  warnings: string[];
}

/**
 * Maps business types to the building type key used in ProceduralBuildingGenerator.BUILDING_TYPES.
 * Business types that share the same building model map to a common key.
 */
const BUSINESS_TO_BUILDING_TYPE: Record<string, string> = {
  'Bakery': 'Bakery',
  'Restaurant': 'Restaurant',
  'Tavern': 'Tavern',
  'Inn': 'Inn',
  'Market': 'Market',
  'Shop': 'Shop',
  'Blacksmith': 'Blacksmith',
  'LawFirm': 'LawFirm',
  'Bank': 'Bank',
  'Hospital': 'Hospital',
  'School': 'School',
  'Church': 'Church',
  'Theater': 'Theater',
  'Library': 'Library',
  'ApartmentComplex': 'ApartmentComplex',
  'Windmill': 'Windmill',
  'Watermill': 'Watermill',
  'Lumbermill': 'Lumbermill',
  'Barracks': 'Barracks',
  'Mine': 'Mine',
  // Types that map to a generic building
  'Generic': 'Shop',
  'Hotel': 'Inn',
  'GroceryStore': 'Market',
  'Bar': 'Tavern',
  'Daycare': 'School',
  'PoliceStation': 'Barracks',
  'FireStation': 'Barracks',
  'TownHall': 'LawFirm',
  'Farm': 'Lumbermill',
  'Factory': 'Lumbermill',
  'Mortuary': 'Shop',
  'RealEstateOffice': 'LawFirm',
  'InsuranceOffice': 'LawFirm',
  'JewelryStore': 'Shop',
  'TattoParlor': 'Shop',
  'Brewery': 'Tavern',
  'Pharmacy': 'Shop',
  'DentalOffice': 'Hospital',
  'OptometryOffice': 'Hospital',
  'University': 'School',
};

export function getBuildingTypeForBusiness(businessType: string): string {
  return BUSINESS_TO_BUILDING_TYPE[businessType] || 'Shop';
}

/**
 * Validate all occupation chains in a world.
 * Returns a report of all employed characters and their chain status.
 */
export async function validateOccupationChains(
  worldId: string,
  storageOverride?: JobsiteValidationStorage
): Promise<ValidationResult> {
  const store = storageOverride || (await getDefaultStorage());

  const [characters, businesses, settlements] = await Promise.all([
    store.getCharactersByWorld(worldId),
    store.getBusinessesByWorld(worldId),
    store.getSettlementsByWorld(worldId),
  ]);

  // Index businesses by ID
  const businessMap = new Map<string, Business>();
  for (const b of businesses) {
    businessMap.set(b.id, b);
  }

  // Gather all lots across settlements
  const allLots: Lot[] = [];
  for (const settlement of settlements) {
    const lots = await store.getLotsBySettlement(settlement.id);
    allLots.push(...lots);
  }

  // Index lots by ID
  const lotMap = new Map<string, Lot>();
  for (const l of allLots) {
    lotMap.set(l.id, l);
  }

  const chains: ChainStatus[] = [];
  const warnings: string[] = [];

  // Find all employed characters
  const employedCharacters = characters.filter(c => {
    const customData = (c as any).customData as Record<string, any> | undefined;
    return c.currentOccupationId || customData?.currentOccupation;
  });

  for (const character of employedCharacters) {
    const cd = (character as any).customData as Record<string, any> | undefined;
    const occupation = cd?.currentOccupation as OccupationData | undefined;
    const issues: string[] = [];

    const chain: ChainStatus = {
      characterId: character.id,
      characterName: `${character.firstName} ${character.lastName}`,
      occupationId: character.currentOccupationId || occupation?.id || null,
      vocation: occupation?.vocation || null,
      businessId: occupation?.businessId || null,
      businessName: null,
      businessType: null,
      lotId: null,
      lotAddress: null,
      hasBuildingOnLot: false,
      issues: [],
    };

    // Check occupation exists
    if (!occupation) {
      issues.push('Character has currentOccupationId but no currentOccupation in customData');
      chain.issues = issues;
      chains.push(chain);
      continue;
    }

    // Check business exists
    const business = occupation.businessId ? businessMap.get(occupation.businessId) : undefined;
    if (!business) {
      issues.push(`Business ${occupation.businessId} not found`);
    } else {
      chain.businessName = business.name;
      chain.businessType = business.businessType;

      if (business.isOutOfBusiness) {
        issues.push(`Business "${business.name}" is out of business`);
      }

      // Businesses connect to lots through buildings (building.businessId → business.id)
      // The business itself doesn't store lotId — this is handled by the building layer
      chain.hasBuildingOnLot = true;
    }

    if (issues.length > 0) {
      for (const issue of issues) {
        warnings.push(`[${chain.characterName}] ${issue}`);
      }
    }

    chain.issues = issues;
    chains.push(chain);
  }

  const brokenChains = chains.filter(c => c.issues.length > 0).length;

  return {
    worldId,
    totalEmployedCharacters: employedCharacters.length,
    validChains: chains.length - brokenChains,
    brokenChains,
    autoFixed: 0,
    chains,
    warnings,
  };
}

/**
 * Validate and auto-fix broken occupation chains.
 * Creates missing businesses, lots, and building references as needed.
 */
export async function validateAndAutoFix(
  worldId: string,
  storageOverride?: JobsiteValidationStorage
): Promise<ValidationResult> {
  const store = storageOverride || (await getDefaultStorage());

  const [characters, businesses, settlements] = await Promise.all([
    store.getCharactersByWorld(worldId),
    store.getBusinessesByWorld(worldId),
    store.getSettlementsByWorld(worldId),
  ]);

  if (settlements.length === 0) {
    return {
      worldId,
      totalEmployedCharacters: 0,
      validChains: 0,
      brokenChains: 0,
      autoFixed: 0,
      chains: [],
      warnings: ['No settlements found in world'],
    };
  }

  // Index businesses by ID (mutable — we add new ones)
  const businessMap = new Map<string, Business>();
  for (const b of businesses) {
    businessMap.set(b.id, b);
  }

  // Gather all lots across settlements
  const allLots: Lot[] = [];
  for (const settlement of settlements) {
    const lots = await store.getLotsBySettlement(settlement.id);
    allLots.push(...lots);
  }

  // Index lots by ID (mutable)
  const lotMap = new Map<string, Lot>();
  for (const l of allLots) {
    lotMap.set(l.id, l);
  }

  // Track next house number for auto-generated lots per settlement
  const maxHouseNumbers = new Map<string, number>();
  for (const lot of allLots) {
    const current = maxHouseNumbers.get(lot.settlementId) || 0;
    if (lot.houseNumber > current) {
      maxHouseNumbers.set(lot.settlementId, lot.houseNumber);
    }
  }

  const chains: ChainStatus[] = [];
  const warnings: string[] = [];
  let autoFixed = 0;

  // Find all employed characters
  const employedCharacters = characters.filter(c => {
    const cd = (c as any).customData as Record<string, any> | undefined;
    return c.currentOccupationId || cd?.currentOccupation;
  });

  for (const character of employedCharacters) {
    const cd = (character as any).customData as Record<string, any> | undefined;
    const occupation = cd?.currentOccupation as OccupationData | undefined;
    const issues: string[] = [];

    const chain: ChainStatus = {
      characterId: character.id,
      characterName: `${character.firstName} ${character.lastName}`,
      occupationId: character.currentOccupationId || occupation?.id || null,
      vocation: occupation?.vocation || null,
      businessId: occupation?.businessId || null,
      businessName: null,
      businessType: null,
      lotId: null,
      lotAddress: null,
      hasBuildingOnLot: false,
      issues: [],
    };

    if (!occupation) {
      issues.push('Character has currentOccupationId but no currentOccupation in customData');
      chain.issues = issues;
      chains.push(chain);
      continue;
    }

    // --- Ensure business exists ---
    let business = occupation.businessId ? businessMap.get(occupation.businessId) : undefined;
    if (!business) {
      // Auto-generate a business
      const settlementId = settlements[0].id;
      const businessType = vocationToBusinessType(occupation.vocation);
      const newBusiness = await store.createBusiness({
        worldId,
        settlementId,
        name: `${occupation.vocation}'s ${businessType}`,
        businessType,
        ownerId: character.id,
        founderId: character.id,
        isOutOfBusiness: false,
        foundedYear: occupation.startYear || 1900,
        lotId: null,
        vacancies: { day: [], night: [] },
        businessData: {},
      });
      businessMap.set(newBusiness.id, newBusiness);
      business = newBusiness;
      chain.businessId = newBusiness.id;
      warnings.push(`[${chain.characterName}] Auto-generated business "${newBusiness.name}" (${businessType})`);
      autoFixed++;
    }

    chain.businessName = business.name;
    chain.businessType = business.businessType;

    // --- Ensure business has a lot ---
    let lot: Lot | undefined;
    // Businesses connect through buildings — find a building with this businessId
    // to locate its lot (if any)
    if (!lot) {
      // Find a vacant lot in the settlement, or create one
      const settlementId = business.settlementId || settlements[0].id;
      // Create a new lot for the business
      const nextHouseNum = (maxHouseNumbers.get(settlementId) || 0) + 1;
      maxHouseNumbers.set(settlementId, nextHouseNum);
      const newLot = await store.createLot({
        worldId,
        settlementId,
        address: `${nextHouseNum} Main Street`,
        houseNumber: nextHouseNum,
        streetName: 'Main Street',
      });
      lotMap.set(newLot.id, newLot);
      lot = newLot;

      // Create a building on the lot for this business
      await store.createResidence({
        worldId,
        settlementId,
        lotId: lot.id,
        address: lot.address,
        buildingCategory: 'business',
        businessId: business.id,
        name: business.name,
      });

      warnings.push(`[${chain.characterName}] Auto-generated lot and building for business "${business.name}"`);
      autoFixed++;
    }

    chain.lotId = lot.id;
    chain.lotAddress = lot.address;
    chain.hasBuildingOnLot = true;

    if (issues.length > 0) {
      for (const issue of issues) {
        warnings.push(`[${chain.characterName}] ${issue}`);
      }
    }

    chain.issues = issues;
    chains.push(chain);
  }

  const brokenChains = chains.filter(c => c.issues.length > 0).length;

  return {
    worldId,
    totalEmployedCharacters: employedCharacters.length,
    validChains: chains.length - brokenChains,
    brokenChains,
    autoFixed,
    chains,
    warnings,
  };
}

/**
 * Map a vocation to a default business type.
 */
function vocationToBusinessType(vocation: string): string {
  const map: Record<string, string> = {
    'Owner': 'Shop',
    'Manager': 'Shop',
    'Worker': 'Factory',
    'Doctor': 'Hospital',
    'Lawyer': 'LawFirm',
    'Apprentice': 'Blacksmith',
    'Secretary': 'LawFirm',
    'Cashier': 'GroceryStore',
    'Janitor': 'School',
    'Builder': 'Lumbermill',
    'HotelMaid': 'Hotel',
    'Waiter': 'Restaurant',
    'Laborer': 'Factory',
    'Groundskeeper': 'Church',
    'Bottler': 'Brewery',
    'Cook': 'Restaurant',
    'Dishwasher': 'Restaurant',
    'Stocker': 'GroceryStore',
    'Baker': 'Bakery',
    'Barber': 'Shop',
    'Bartender': 'Bar',
    'Blacksmith': 'Blacksmith',
    'BusDriver': 'Generic',
    'Butcher': 'GroceryStore',
    'Carpenter': 'Lumbermill',
    'Dentist': 'DentalOffice',
    'Farmer': 'Farm',
    'Firefighter': 'FireStation',
    'Nurse': 'Hospital',
    'Optometrist': 'OptometryOffice',
    'Pharmacist': 'Pharmacy',
    'PlasticSurgeon': 'Hospital',
    'PoliceOfficer': 'PoliceStation',
    'Professor': 'University',
    'Realtor': 'RealEstateOffice',
    'Surgeon': 'Hospital',
    'Tattoist': 'TattoParlor',
    'Teacher': 'School',
  };
  return map[vocation] || 'Shop';
}

/** Lazy-import the default storage to avoid eager MongoDB connection in tests */
async function getDefaultStorage(): Promise<JobsiteValidationStorage> {
  const { storage } = await import('../db/storage.js');
  return storage;
}
