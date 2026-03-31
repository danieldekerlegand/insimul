/**
 * Tests that every business gets an owner assigned during generation.
 * Covers Phase 1 (lot-based), Phase 2 (no-lot), and Phase 3 (remaining unowned).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock storage ----
const mockStorage = vi.hoisted(() => ({
  getCharactersByWorld: vi.fn(),
  getBusinessesBySettlement: vi.fn(),
  updateBusiness: vi.fn(),
  updateCharacter: vi.fn(),
}));

vi.mock('../db/storage', () => ({ storage: mockStorage }));
vi.mock('./genealogy-generator', () => ({ GenealogyGenerator: class {} }));
vi.mock('./geography-generator', () => ({ GeographyGenerator: class {} }));
vi.mock('../extensions/tott/business-system.js', () => ({
  foundBusiness: vi.fn(async (opts: any) => ({
    id: `biz-new-${opts.businessType}`,
    worldId: opts.worldId,
    name: opts.name,
    businessType: opts.businessType,
    ownerId: opts.founderId,
    founderId: opts.founderId,
    address: opts.address,
  })),
  closeBusiness: vi.fn(),
}));
vi.mock('../extensions/tott/hiring-system.js', () => ({ fillVacancy: vi.fn() }));
vi.mock('../extensions/tott/routine-system.js', () => ({
  generateDefaultRoutine: vi.fn(),
  setRoutine: vi.fn(),
  updateAllWhereabouts: vi.fn(),
}));
vi.mock('../extensions/tott/event-system.js', () => ({ triggerAutomaticEvents: vi.fn() }));
vi.mock('../extensions/tott/social-dynamics-system.js', () => ({ updateRelationship: vi.fn() }));
vi.mock('../extensions/tott/knowledge-system.js', () => ({
  initializeFamilyKnowledge: vi.fn(),
  initializeCoworkerKnowledge: vi.fn(),
}));
vi.mock('../extensions/tott/economics-system.js', () => ({ addMoney: vi.fn() }));
vi.mock('../extensions/tott/town-events-system.js', () => ({
  adjustCommunityMorale: vi.fn(),
  scheduleFestival: vi.fn(),
}));
vi.mock('../services/assets/visual-asset-generator.js', () => ({ visualAssetGenerator: {} }));
vi.mock('./item-placement-generator.js', () => ({ placeItemsInWorld: vi.fn() }));
vi.mock('../../../shared/quests/main-quest-npc-spawner.js', () => ({ spawnMainQuestNPCs: vi.fn() }));
vi.mock('./occupation-assignment.js', () => ({ assignDefaultOccupations: vi.fn() }));

const { WorldGenerator } = await import('../generators/world-generator');

function makeCharacter(id: string, age: number, isAlive = true) {
  return {
    id,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    birthYear: 2000 - age,
    isAlive,
    occupation: null,
    customData: {},
  };
}

function makeBusiness(id: string, overrides: Record<string, any> = {}) {
  return {
    id,
    worldId: 'world-1',
    settlementId: 'settlement-1',
    name: `Business ${id}`,
    businessType: 'Shop',
    ownerId: null,
    founderId: null,
    address: `${id} Main St`,
    isOutOfBusiness: false,
    ...overrides,
  };
}

describe('generateInitialBusinesses - owner assignment', () => {
  const generator = new WorldGenerator();
  const generateInitialBusinesses = (generator as any).generateInitialBusinesses.bind(generator);

  const baseConfig = {
    worldId: 'world-1',
    settlementId: 'settlement-1',
    population: 100,
    currentYear: 2000,
    terrain: 'plains',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.updateBusiness.mockResolvedValue({});
    mockStorage.updateCharacter.mockResolvedValue({});
  });

  it('assigns owners to all geography-generated businesses when enough founders exist', async () => {
    const characters = [
      makeCharacter('c1', 30),
      makeCharacter('c2', 35),
      makeCharacter('c3', 40),
      makeCharacter('c4', 45),
      makeCharacter('c5', 50),
    ];
    const unownedBusinesses = [
      makeBusiness('b1'),
      makeBusiness('b2'),
      makeBusiness('b3'),
    ];

    mockStorage.getCharactersByWorld.mockResolvedValue(characters);
    mockStorage.getBusinessesBySettlement.mockResolvedValue(unownedBusinesses);

    const result = await generateInitialBusinesses(baseConfig);

    // Every returned business should have an owner
    for (const biz of result) {
      expect(biz.ownerId).toBeTruthy();
    }

    // All original unowned businesses should have been updated with an owner
    const updateCalls = mockStorage.updateBusiness.mock.calls;
    const updatedIds = updateCalls
      .filter((call: any[]) => call[1].ownerId)
      .map((call: any[]) => call[0]);

    // At minimum, the 3 geography businesses should have owners
    for (const biz of unownedBusinesses) {
      expect(updatedIds).toContain(biz.id);
    }
  });

  it('assigns owners to excess lot businesses even when business plan is smaller', async () => {
    // Create many unowned businesses but only a few characters
    // The business plan will be small for low population, but all lot businesses should get owners
    const characters = [
      makeCharacter('c1', 25),
      makeCharacter('c2', 30),
      makeCharacter('c3', 35),
    ];
    const manyUnownedBusinesses = [
      makeBusiness('b1'),
      makeBusiness('b2'),
      makeBusiness('b3'),
      makeBusiness('b4'),
      makeBusiness('b5'),
      makeBusiness('b6'),
      makeBusiness('b7'),
      makeBusiness('b8'),
    ];

    mockStorage.getCharactersByWorld.mockResolvedValue(characters);
    mockStorage.getBusinessesBySettlement.mockResolvedValue(manyUnownedBusinesses);

    await generateInitialBusinesses(baseConfig);

    // Check that updateBusiness was called with ownerId for businesses not covered by the plan
    const updateCalls = mockStorage.updateBusiness.mock.calls;
    const ownerUpdates = updateCalls.filter((call: any[]) => call[1].ownerId);

    // All 8 businesses should get an owner (via phase 1 + phase 3)
    const updatedIds = new Set(ownerUpdates.map((call: any[]) => call[0]));
    for (const biz of manyUnownedBusinesses) {
      expect(updatedIds).toContain(biz.id);
    }
  });

  it('closes unowned businesses when no adult characters exist', async () => {
    // Only children - no valid founders
    const characters = [
      makeCharacter('c1', 10),
      makeCharacter('c2', 12),
    ];
    const unownedBusinesses = [
      makeBusiness('b1'),
      makeBusiness('b2'),
    ];

    mockStorage.getCharactersByWorld.mockResolvedValue(characters);
    mockStorage.getBusinessesBySettlement.mockResolvedValue(unownedBusinesses);

    await generateInitialBusinesses(baseConfig);

    // Businesses should be closed since no adults are available
    const updateCalls = mockStorage.updateBusiness.mock.calls;
    const closedCalls = updateCalls.filter(
      (call: any[]) => call[1].isOutOfBusiness === true
    );
    expect(closedCalls.length).toBe(2);
  });

  it('skips already-owned businesses', async () => {
    const characters = [makeCharacter('c1', 30)];
    const businesses = [
      makeBusiness('b1', { ownerId: 'existing-owner', founderId: 'existing-owner' }),
      makeBusiness('b2'), // unowned
    ];

    mockStorage.getCharactersByWorld.mockResolvedValue(characters);
    mockStorage.getBusinessesBySettlement.mockResolvedValue(businesses);

    await generateInitialBusinesses(baseConfig);

    // b1 should NOT be touched (already owned)
    const updateCalls = mockStorage.updateBusiness.mock.calls;
    const b1Updates = updateCalls.filter((call: any[]) => call[0] === 'b1');
    expect(b1Updates.length).toBe(0);
  });

  it('does not leave any active business without an owner', async () => {
    const characters = [
      makeCharacter('c1', 30),
      makeCharacter('c2', 35),
    ];
    const unownedBusinesses = [
      makeBusiness('b1'),
      makeBusiness('b2'),
      makeBusiness('b3'),
      makeBusiness('b4'),
      makeBusiness('b5'),
    ];

    mockStorage.getCharactersByWorld.mockResolvedValue(characters);
    mockStorage.getBusinessesBySettlement.mockResolvedValue(unownedBusinesses);

    await generateInitialBusinesses(baseConfig);

    const updateCalls = mockStorage.updateBusiness.mock.calls;

    // Every business should either have an owner or be closed
    for (const biz of unownedBusinesses) {
      const updates = updateCalls.filter((call: any[]) => call[0] === biz.id);
      const hasOwner = updates.some((call: any[]) => call[1].ownerId);
      const isClosed = updates.some((call: any[]) => call[1].isOutOfBusiness === true);
      expect(hasOwner || isClosed).toBe(true);
    }
  });
});
