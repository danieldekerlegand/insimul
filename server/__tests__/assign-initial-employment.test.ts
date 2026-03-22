/**
 * Tests for assignInitialEmployment in the WorldGenerator class.
 * Verifies that every business gets at least one employee during generation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Business, Character, BusinessType, OccupationVocation } from '../../shared/schema';

// Track fillVacancy calls to verify hiring behavior
const fillVacancyCalls: Array<{
  businessId: string;
  candidateId: string;
  vocation: string;
  shift: string;
}> = [];

const mockFillVacancy = vi.fn(async (
  businessId: string,
  candidateId: string,
  vocation: string,
  shift: string,
) => {
  fillVacancyCalls.push({ businessId, candidateId, vocation, shift });
});

// Track character updates
const characterUpdates: Record<string, any> = {};
const mockUpdateCharacter = vi.fn(async (id: string, data: any) => {
  characterUpdates[id] = { ...(characterUpdates[id] || {}), ...data };
});

// Mock characters pool
let mockCharacters: Character[] = [];

vi.mock('../db/storage', () => ({
  storage: {
    getCharactersByWorld: vi.fn(async () => mockCharacters),
    updateCharacter: (...args: any[]) => mockUpdateCharacter(...args),
  },
}));
vi.mock('./genealogy-generator', () => ({ GenealogyGenerator: class {} }));
vi.mock('./geography-generator', () => ({ GeographyGenerator: class {} }));
vi.mock('../extensions/tott/business-system.js', () => ({ foundBusiness: vi.fn(), closeBusiness: vi.fn() }));
vi.mock('../extensions/tott/hiring-system.js', () => ({
  fillVacancy: (...args: any[]) => mockFillVacancy(...args),
}));
vi.mock('../extensions/tott/routine-system.js', () => ({ generateDefaultRoutine: vi.fn(), setRoutine: vi.fn(), updateAllWhereabouts: vi.fn() }));
vi.mock('../extensions/tott/event-system.js', () => ({ triggerAutomaticEvents: vi.fn() }));
vi.mock('../extensions/tott/social-dynamics-system.js', () => ({ updateRelationship: vi.fn() }));
vi.mock('../extensions/tott/knowledge-system.js', () => ({ initializeFamilyKnowledge: vi.fn(), initializeCoworkerKnowledge: vi.fn() }));
vi.mock('../extensions/tott/economics-system.js', () => ({ addMoney: vi.fn() }));
vi.mock('../extensions/tott/town-events-system.js', () => ({ adjustCommunityMorale: vi.fn(), scheduleFestival: vi.fn() }));
vi.mock('../services/visual-asset-generator.js', () => ({ visualAssetGenerator: {} }));
vi.mock('./item-placement-generator.js', () => ({ placeItemsInWorld: vi.fn() }));
vi.mock('../services/main-quest-npc-spawner.js', () => ({ spawnMainQuestNPCs: vi.fn() }));
vi.mock('./occupation-assignment.js', () => ({ assignDefaultOccupations: vi.fn() }));

const { WorldGenerator } = await import('../generators/world-generator');

function makeCharacter(id: string, overrides: Partial<Character> = {}): Character {
  return {
    id,
    worldId: 'world1',
    firstName: `First${id}`,
    lastName: `Last${id}`,
    birthYear: 1880,
    isAlive: true,
    status: 'active',
    retired: false,
    ...overrides,
  } as Character;
}

function makeBusiness(id: string, type: BusinessType, ownerId: string, vacancies?: { day: OccupationVocation[]; night: OccupationVocation[] }): Business {
  return {
    id,
    worldId: 'world1',
    name: `Test ${type}`,
    businessType: type,
    ownerId,
    founderId: ownerId,
    vacancies: vacancies || { day: [], night: [] },
  } as Business;
}

const generator = new WorldGenerator();
const assignInitialEmployment = (generator as any).assignInitialEmployment.bind(generator);
const getDefaultVocationForBusinessType = (generator as any).getDefaultVocationForBusinessType.bind(generator);

describe('getDefaultVocationForBusinessType', () => {
  it('returns known defaults for common business types', () => {
    expect(getDefaultVocationForBusinessType('Farm')).toBe('Farmhand');
    expect(getDefaultVocationForBusinessType('School')).toBe('Teacher');
    expect(getDefaultVocationForBusinessType('Bar')).toBe('Bartender');
    expect(getDefaultVocationForBusinessType('Hospital')).toBe('Nurse');
  });

  it('returns Worker for unknown business types', () => {
    expect(getDefaultVocationForBusinessType('Generic')).toBe('Worker');
    expect(getDefaultVocationForBusinessType('Bakery')).toBe('Worker');
  });
});

describe('assignInitialEmployment', () => {
  beforeEach(() => {
    fillVacancyCalls.length = 0;
    mockFillVacancy.mockClear();
    mockUpdateCharacter.mockClear();
    Object.keys(characterUpdates).forEach(k => delete characterUpdates[k]);
  });

  it('assigns at least one employee to every business when enough candidates exist', async () => {
    const owner1 = makeCharacter('owner1');
    const owner2 = makeCharacter('owner2');
    const owner3 = makeCharacter('owner3');
    // 6 employable candidates (not owners)
    const candidates = Array.from({ length: 6 }, (_, i) => makeCharacter(`emp${i}`));
    mockCharacters = [owner1, owner2, owner3, ...candidates];

    const businesses = [
      makeBusiness('b1', 'Farm', 'owner1', { day: ['Farmer', 'Farmhand'], night: [] }),
      makeBusiness('b2', 'School', 'owner2', { day: ['Teacher', 'Teacher'], night: [] }),
      makeBusiness('b3', 'Bar', 'owner3', { day: ['Bartender'], night: ['Bartender'] }),
    ];

    await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    // Every business should have at least one hire
    const hiredPerBusiness = new Map<string, number>();
    for (const call of fillVacancyCalls) {
      hiredPerBusiness.set(call.businessId, (hiredPerBusiness.get(call.businessId) || 0) + 1);
    }

    expect(hiredPerBusiness.has('b1')).toBe(true);
    expect(hiredPerBusiness.has('b2')).toBe(true);
    expect(hiredPerBusiness.has('b3')).toBe(true);

    // Each business should have at least 1 employee
    for (const [, count] of hiredPerBusiness) {
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  it('distributes employees across all businesses before filling remaining vacancies', async () => {
    const owner1 = makeCharacter('owner1');
    const owner2 = makeCharacter('owner2');
    // Only 2 candidates for 2 businesses with 2+2=4 total vacancies
    const candidates = [makeCharacter('emp0'), makeCharacter('emp1')];
    mockCharacters = [owner1, owner2, ...candidates];

    const businesses = [
      makeBusiness('b1', 'Farm', 'owner1', { day: ['Farmer', 'Farmhand'], night: [] }),
      makeBusiness('b2', 'School', 'owner2', { day: ['Teacher', 'Teacher'], night: [] }),
    ];

    await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    // Both businesses should get exactly 1 employee each (2 candidates / 2 businesses)
    const hiredPerBusiness = new Map<string, number>();
    for (const call of fillVacancyCalls) {
      hiredPerBusiness.set(call.businessId, (hiredPerBusiness.get(call.businessId) || 0) + 1);
    }

    expect(hiredPerBusiness.get('b1')).toBe(1);
    expect(hiredPerBusiness.get('b2')).toBe(1);
  });

  it('assigns a default vocation when a business has no vacancies defined', async () => {
    const owner1 = makeCharacter('owner1');
    const candidates = [makeCharacter('emp0')];
    mockCharacters = [owner1, ...candidates];

    // Business with no vacancies
    const businesses = [
      makeBusiness('b1', 'Farm', 'owner1', { day: [], night: [] }),
    ];

    await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    expect(fillVacancyCalls.length).toBe(1);
    expect(fillVacancyCalls[0].businessId).toBe('b1');
    expect(fillVacancyCalls[0].vocation).toBe('Farmhand'); // default for Farm
    expect(fillVacancyCalls[0].shift).toBe('day');
  });

  it('handles the case where there are fewer candidates than businesses', async () => {
    const owner1 = makeCharacter('owner1');
    const owner2 = makeCharacter('owner2');
    const owner3 = makeCharacter('owner3');
    // Only 1 candidate for 3 businesses
    const candidates = [makeCharacter('emp0')];
    mockCharacters = [owner1, owner2, owner3, ...candidates];

    const businesses = [
      makeBusiness('b1', 'Farm', 'owner1', { day: ['Farmer'], night: [] }),
      makeBusiness('b2', 'School', 'owner2', { day: ['Teacher'], night: [] }),
      makeBusiness('b3', 'Bar', 'owner3', { day: ['Bartender'], night: [] }),
    ];

    const result = await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    // Only 1 employee should be hired total
    expect(result).toBe(1);
    expect(fillVacancyCalls.length).toBe(1);
  });

  it('does not assign owners as employees', async () => {
    const owner1 = makeCharacter('owner1');
    // No other candidates
    mockCharacters = [owner1];

    const businesses = [
      makeBusiness('b1', 'Farm', 'owner1', { day: ['Farmer'], night: [] }),
    ];

    const result = await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    expect(result).toBe(0);
    expect(fillVacancyCalls.length).toBe(0);
  });

  it('fills all vacancies when plenty of candidates exist', async () => {
    const owner1 = makeCharacter('owner1');
    // 10 candidates for 1 business with 3 vacancies
    const candidates = Array.from({ length: 10 }, (_, i) => makeCharacter(`emp${i}`));
    mockCharacters = [owner1, ...candidates];

    const businesses = [
      makeBusiness('b1', 'Restaurant', 'owner1', { day: ['Cook', 'Waiter'], night: ['Bartender'] }),
    ];

    const result = await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    expect(result).toBe(3); // All 3 vacancies filled
    expect(fillVacancyCalls.length).toBe(3);
  });

  it('excludes characters who are too young or too old', async () => {
    const owner1 = makeCharacter('owner1');
    const tooYoung = makeCharacter('young', { birthYear: 1910 }); // age 10 in 1920
    const tooOld = makeCharacter('old', { birthYear: 1840 }); // age 80 in 1920
    const justRight = makeCharacter('adult', { birthYear: 1890 }); // age 30 in 1920
    mockCharacters = [owner1, tooYoung, tooOld, justRight];

    const businesses = [
      makeBusiness('b1', 'Farm', 'owner1', { day: ['Farmer', 'Farmhand'], night: [] }),
    ];

    const result = await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    expect(result).toBe(1); // Only 'justRight' is employable
    expect(fillVacancyCalls[0].candidateId).toBe('adult');
  });

  it('excludes dead characters', async () => {
    const owner1 = makeCharacter('owner1');
    const dead = makeCharacter('dead', { isAlive: false });
    const alive = makeCharacter('alive');
    mockCharacters = [owner1, dead, alive];

    const businesses = [
      makeBusiness('b1', 'Farm', 'owner1', { day: ['Farmer'], night: [] }),
    ];

    await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    expect(fillVacancyCalls.length).toBe(1);
    expect(fillVacancyCalls[0].candidateId).toBe('alive');
  });

  it('prefers night vacancy when no day vacancies exist', async () => {
    const owner1 = makeCharacter('owner1');
    const candidates = [makeCharacter('emp0')];
    mockCharacters = [owner1, ...candidates];

    const businesses = [
      makeBusiness('b1', 'Bar', 'owner1', { day: [], night: ['Bartender'] }),
    ];

    await assignInitialEmployment({
      worldId: 'world1',
      businesses,
      currentYear: 1920,
    });

    expect(fillVacancyCalls.length).toBe(1);
    expect(fillVacancyCalls[0].shift).toBe('night');
    expect(fillVacancyCalls[0].vocation).toBe('Bartender');
  });
});
