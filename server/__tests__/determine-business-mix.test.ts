/**
 * Tests for determineBusinessMix, generateBusinessName, and getVacanciesForBusinessType
 * in the WorldGenerator class.
 *
 * These are private methods, so we access them via prototype for unit testing.
 */

import { describe, it, expect, vi } from 'vitest';
import type { BusinessType, OccupationVocation } from '../../shared/schema';

// Valid BusinessType values from shared/schema.ts
const VALID_BUSINESS_TYPES: BusinessType[] = [
  'Generic', 'LawFirm', 'ApartmentComplex', 'Bakery', 'Hospital', 'Bank',
  'Hotel', 'Restaurant', 'GroceryStore', 'Bar', 'Daycare', 'School',
  'PoliceStation', 'FireStation', 'TownHall', 'Church', 'Farm', 'Factory',
  'Shop', 'Mortuary', 'RealEstateOffice', 'InsuranceOffice', 'JewelryStore',
  'TattoParlor', 'Brewery', 'Pharmacy', 'DentalOffice', 'OptometryOffice',
  'University',
  'Harbor', 'Boatyard', 'FishMarket', 'CustomsHouse', 'Lighthouse',
  'Warehouse',
  'Blacksmith', 'Tailor', 'Butcher', 'BookStore', 'HerbShop', 'PawnShop',
  'Barbershop', 'Bathhouse', 'Carpenter', 'Stables', 'Clinic',
];

const VALID_OCCUPATIONS: OccupationVocation[] = [
  'Owner', 'Manager', 'Worker', 'Doctor', 'Lawyer', 'Apprentice',
  'Secretary', 'Cashier', 'Janitor', 'Builder', 'HotelMaid', 'Waiter',
  'Laborer', 'Groundskeeper', 'Bottler', 'Cook', 'Dishwasher', 'Stocker',
  'Seamstress', 'Farmhand', 'Miner', 'Painter', 'BankTeller', 'Grocer',
  'Bartender', 'Concierge', 'DaycareProvider', 'Landlord', 'Baker',
  'Plasterer', 'Barber', 'Butcher', 'Firefighter', 'PoliceOfficer',
  'Carpenter', 'TaxiDriver', 'BusDriver', 'Blacksmith', 'Woodworker',
  'Stonecutter', 'Dressmaker', 'Distiller', 'Plumber', 'Joiner',
  'Innkeeper', 'Nurse', 'Farmer', 'Shoemaker', 'Brewer', 'TattooArtist',
  'Puddler', 'Clothier', 'Teacher', 'Principal', 'Tailor', 'Druggist',
  'InsuranceAgent', 'Jeweler', 'FireChief', 'PoliceChief', 'Realtor',
  'Mortician', 'Engineer', 'Pharmacist', 'Architect', 'Optometrist',
  'Dentist', 'PlasticSurgeon', 'Professor', 'Mayor',
];

// Mock all heavy dependencies so we can import WorldGenerator
vi.mock('../db/storage', () => ({ storage: {} }));
vi.mock('./genealogy-generator', () => ({ GenealogyGenerator: class {} }));
vi.mock('./geography-generator', () => ({ GeographyGenerator: class {} }));
vi.mock('../extensions/tott/business-system.js', () => ({ foundBusiness: vi.fn(), closeBusiness: vi.fn() }));
vi.mock('../extensions/tott/hiring-system.js', () => ({ fillVacancy: vi.fn() }));
vi.mock('../extensions/tott/routine-system.js', () => ({ generateDefaultRoutine: vi.fn(), setRoutine: vi.fn(), updateAllWhereabouts: vi.fn() }));
vi.mock('../extensions/tott/event-system.js', () => ({ triggerAutomaticEvents: vi.fn() }));
vi.mock('../extensions/tott/social-dynamics-system.js', () => ({ updateRelationship: vi.fn() }));
vi.mock('../extensions/tott/knowledge-system.js', () => ({ initializeFamilyKnowledge: vi.fn(), initializeCoworkerKnowledge: vi.fn() }));
vi.mock('../extensions/tott/economics-system.js', () => ({ addMoney: vi.fn() }));
vi.mock('../extensions/tott/town-events-system.js', () => ({ adjustCommunityMorale: vi.fn(), scheduleFestival: vi.fn() }));
vi.mock('../services/assets/visual-asset-generator.js', () => ({ visualAssetGenerator: {} }));
vi.mock('./item-placement-generator.js', () => ({ placeItemsInWorld: vi.fn() }));
vi.mock('../../../shared/quests/main-quest-npc-spawner.js', () => ({ spawnMainQuestNPCs: vi.fn() }));
vi.mock('./occupation-assignment.js', () => ({ assignDefaultOccupations: vi.fn() }));

// Dynamic import after mocks are set up
const { WorldGenerator } = await import('../generators/world-generator');

// Access private methods via prototype
const generator = new WorldGenerator();
const determineBusinessMix = (generator as any).determineBusinessMix.bind(generator);
const generateBusinessName = (generator as any).generateBusinessName.bind(generator);
const getVacanciesForBusinessType = (generator as any).getVacanciesForBusinessType.bind(generator);

describe('determineBusinessMix', () => {
  it('returns only valid BusinessType values for a small village', () => {
    const result = determineBusinessMix(50, 'plains', 1920);
    expect(result.length).toBeGreaterThan(0);
    for (const bt of result) {
      expect(VALID_BUSINESS_TYPES).toContain(bt);
    }
  });

  it('returns only valid BusinessType values for a medium town', () => {
    const result = determineBusinessMix(400, 'plains', 1920);
    expect(result.length).toBeGreaterThan(0);
    for (const bt of result) {
      expect(VALID_BUSINESS_TYPES).toContain(bt);
    }
  });

  it('returns only valid BusinessType values for a large town', () => {
    const result = determineBusinessMix(1500, 'plains', 1920);
    expect(result.length).toBeGreaterThan(0);
    for (const bt of result) {
      expect(VALID_BUSINESS_TYPES).toContain(bt);
    }
  });

  it('includes Farm for any population', () => {
    const result = determineBusinessMix(10, 'plains', 1920);
    expect(result).toContain('Farm');
  });

  it('includes GroceryStore and Restaurant for population > 100', () => {
    const result = determineBusinessMix(200, 'plains', 1920);
    expect(result).toContain('GroceryStore');
    expect(result).toContain('Restaurant');
  });

  it('includes Clinic, Carpenter, Factory for population > 300', () => {
    const result = determineBusinessMix(400, 'plains', 1920);
    expect(result).toContain('Clinic');
    expect(result).toContain('Carpenter');
    expect(result).toContain('Factory');
  });

  it('includes LawFirm, School, Bank for population > 500', () => {
    const result = determineBusinessMix(600, 'plains', 1920);
    expect(result).toContain('LawFirm');
    expect(result).toContain('School');
    expect(result).toContain('Bank');
  });

  it('includes Bar and TownHall for population > 1000', () => {
    const result = determineBusinessMix(1500, 'plains', 1920);
    expect(result).toContain('Bar');
    expect(result).toContain('TownHall');
  });

  it('includes Blacksmith for mountains terrain', () => {
    const result = determineBusinessMix(50, 'mountains', 1920);
    expect(result).toContain('Blacksmith');
  });

  it('includes Harbor for coast terrain', () => {
    const result = determineBusinessMix(50, 'coast', 1920);
    expect(result).toContain('Harbor');
  });

  it('includes Harbor for river terrain', () => {
    const result = determineBusinessMix(50, 'river', 1920);
    expect(result).toContain('Harbor');
  });

  it('includes extra Carpenter for forest terrain', () => {
    const result = determineBusinessMix(50, 'forest', 1920);
    expect(result.filter((b: BusinessType) => b === 'Carpenter').length).toBeGreaterThanOrEqual(1);
  });

  it('adds extra Farm in pre-1900 era', () => {
    const result = determineBusinessMix(50, 'plains', 1850);
    const farmCount = result.filter((b: BusinessType) => b === 'Farm').length;
    expect(farmCount).toBe(2);
  });

  it('adds Shop in modern era (post-1950)', () => {
    const result = determineBusinessMix(200, 'plains', 2000);
    expect(result).toContain('Shop');
  });

  it('adds Hospital in modern era with population > 500', () => {
    const result = determineBusinessMix(600, 'plains', 2000);
    expect(result).toContain('Hospital');
  });

  it('returns valid types across all terrain and era combinations', () => {
    const terrains = ['plains', 'mountains', 'coast', 'river', 'forest', 'desert'];
    const years = [1800, 1920, 2000];
    const populations = [50, 200, 400, 600, 1500];

    for (const terrain of terrains) {
      for (const year of years) {
        for (const pop of populations) {
          const result = determineBusinessMix(pop, terrain, year);
          for (const bt of result) {
            expect(VALID_BUSINESS_TYPES).toContain(bt);
          }
        }
      }
    }
  });
});

describe('generateBusinessName', () => {
  const mockFounder = { lastName: 'Smith' } as any;

  it('returns a name containing the founder last name', () => {
    const name = generateBusinessName('Farm', mockFounder);
    expect(name).toContain('Smith');
  });

  it('returns a sensible name for each business type produced by determineBusinessMix', () => {
    const allTypes = determineBusinessMix(1500, 'mountains', 2000);
    const uniqueTypes = [...new Set(allTypes)] as BusinessType[];
    for (const bt of uniqueTypes) {
      const name = generateBusinessName(bt, mockFounder);
      expect(name).toBeTruthy();
      expect(name).toContain("Smith's");
    }
  });
});

describe('getVacanciesForBusinessType', () => {
  it('returns valid OccupationVocation values for all types produced by determineBusinessMix', () => {
    const allTypes = determineBusinessMix(1500, 'mountains', 2000);
    const uniqueTypes = [...new Set(allTypes)] as BusinessType[];
    for (const bt of uniqueTypes) {
      const vacancies = getVacanciesForBusinessType(bt);
      expect(vacancies).toHaveProperty('day');
      expect(vacancies).toHaveProperty('night');
      for (const occ of vacancies.day) {
        expect(VALID_OCCUPATIONS).toContain(occ);
      }
      for (const occ of vacancies.night) {
        expect(VALID_OCCUPATIONS).toContain(occ);
      }
    }
  });

  it('returns non-empty day vacancies for common business types', () => {
    const commonTypes: BusinessType[] = ['Farm', 'GroceryStore', 'Restaurant', 'Clinic', 'School', 'Bank'];
    for (const bt of commonTypes) {
      const vacancies = getVacanciesForBusinessType(bt);
      expect(vacancies.day.length).toBeGreaterThan(0);
    }
  });
});
