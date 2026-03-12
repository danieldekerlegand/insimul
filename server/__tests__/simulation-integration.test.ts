/**
 * Integration tests for lo-fi simulation end-to-end (US-004)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IStorage } from '../db/storage';
import type { Character, World, Rule, Grammar } from '@shared/schema';

// ── Mock the singleton storage import used by TotT modules ──
vi.mock('../db/storage', () => ({
  storage: {
    getCharactersByWorld: vi.fn().mockResolvedValue([]),
    getCharacter: vi.fn().mockResolvedValue(null),
    updateCharacter: vi.fn().mockResolvedValue(null),
    getWorld: vi.fn().mockResolvedValue(null),
    getRulesByWorld: vi.fn().mockResolvedValue([]),
    getGrammarsByWorld: vi.fn().mockResolvedValue([]),
    getBusinessesByWorld: vi.fn().mockResolvedValue([]),
    getLotsByWorld: vi.fn().mockResolvedValue([]),
    getResidencesByWorld: vi.fn().mockResolvedValue([]),
    getSettlementsByWorld: vi.fn().mockResolvedValue([]),
    getCountriesByWorld: vi.fn().mockResolvedValue([]),
    getStatesByWorld: vi.fn().mockResolvedValue([]),
    getItemsByWorld: vi.fn().mockResolvedValue([]),
    getTruthsByWorld: vi.fn().mockResolvedValue([]),
    getAchievementsByWorld: vi.fn().mockResolvedValue([]),
    getLanguagesByWorld: vi.fn().mockResolvedValue([]),
    createTruth: vi.fn().mockResolvedValue({}),
  },
}));

// ── Mock Prolog modules to avoid complex initialization ──
vi.mock('../engines/prolog/prolog-sync.js', () => ({
  createPrologSyncService: vi.fn(() => ({
    syncWorldToProlog: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../engines/prolog/prolog-manager.js', () => ({
  PrologManager: vi.fn().mockImplementation(function (this: any) {
    this.initialize = vi.fn().mockResolvedValue(undefined);
    this.query = vi.fn().mockResolvedValue([]);
    this.assertFact = vi.fn().mockResolvedValue(undefined);
    this.addRule = vi.fn().mockResolvedValue(undefined);
  }),
}));

// ── Mock TotT extension modules (lazy-imported by simulateLoFi) ──

// Track deaths and marriages for assertions
let deathCount = 0;
let marriageCount = 0;
let timestepCallCount = 0;

vi.mock('../extensions/tott/autonomous-behavior-system.js', () => ({
  executeSimulationTimestep: vi.fn(async () => {
    timestepCallCount++;
    // Produce a marriage roughly every 50 timesteps
    const hasMarriage = timestepCallCount % 50 === 0;
    return {
      observations: [{ id: `obs-${timestepCallCount}` }],
      socializations: [{ id: `soc-${timestepCallCount}` }],
      totalInteractions: 1,
      lifeEvents: hasMarriage
        ? { marriages: [{ id: `m-${timestepCallCount}` }], proposals: [], conceptions: [], births: [], divorces: [] }
        : { marriages: [], proposals: [], conceptions: [], births: [], divorces: [] },
    };
  }),
  checkForMarriageProposals: vi.fn().mockResolvedValue([]),
  checkForReproduction: vi.fn().mockResolvedValue([]),
  checkForBirths: vi.fn().mockResolvedValue([]),
  checkForDivorces: vi.fn().mockResolvedValue([]),
  updateDynamicTracking: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/lifecycle-system.js', () => ({
  calculateDeathProbability: vi.fn((age: number): number => {
    // Realistic age-based death probability per timestep
    if (age < 50) return 0.00005;
    if (age < 60) return 0.001;
    if (age < 70) return 0.002;
    if (age < 80) return 0.005;
    if (age < 90) return 0.015;
    return 0.04;
  }),
  die: vi.fn(async () => {
    deathCount++;
    return { characterId: 'mock', cause: 'old_age', timestep: 0 };
  }),
}));

vi.mock('../extensions/tott/grieving-system.js', () => ({
  processDeathGrief: vi.fn().mockResolvedValue(undefined),
  updateGrief: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/building-commission-system.js', () => ({
  processAllConstructions: vi.fn().mockResolvedValue({ processed: 0 }),
}));

vi.mock('../extensions/tott/town-events-system.js', () => ({
  checkRandomEvents: vi.fn().mockResolvedValue([]),
  decayMorale: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/appearance-system.js', () => ({
  updateAppearanceForAge: vi.fn(),
}));

// ── Additional TotT module mocks for hi-fi simulation (US-005) ──

vi.mock('../extensions/tott/routine-system.js', () => ({
  updateAllWhereabouts: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/knowledge-system.js', () => ({
  propagateAllKnowledge: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/social-dynamics-system.js', () => ({
  decaySalience: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/economics-system.js', () => ({
  paySalaries: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/drama-recognition-system.js', () => ({
  excavateDrama: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../extensions/tott/artifact-system.js', () => ({
  ageArtifact: vi.fn().mockResolvedValue(undefined),
  getArtifactsByWorld: vi.fn().mockResolvedValue([]),
}));

vi.mock('../extensions/tott/education-system.js', () => ({
  updateStudentProgress: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock unified-syntax for Prolog step ──
vi.mock('../../client/src/lib/unified-syntax.js', () => ({
  InsimulRuleCompiler: vi.fn().mockImplementation(function (this: any) {
    this.compile = vi.fn().mockReturnValue([]);
    this.generateSwiProlog = vi.fn().mockReturnValue('');
  }),
}));

// ── Helpers ──

function makeCharacter(overrides: Partial<Character> & { id: string; firstName: string; lastName: string; gender: string; worldId: string; currentLocation: string }): Character {
  return {
    birthYear: 1900,
    isAlive: true,
    personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
    physicalTraits: {},
    mentalTraits: {},
    skills: {},
    memory: 0.5,
    mentalModels: {},
    thoughts: [],
    relationships: {},
    socialAttributes: {},
    coworkerIds: [],
    friendIds: [],
    neighborIds: [],
    immediateFamilyIds: [],
    extendedFamilyIds: [],
    parentIds: [],
    childIds: [],
    spouseId: null,
    genealogyData: {},
    generationMethod: null,
    generationConfig: {},
    occupation: null,
    status: 'active',
    currentOccupationId: null,
    currentResidenceId: null,
    collegeGraduate: false,
    retired: false,
    departureYear: null,
    middleName: null,
    suffix: null,
    maidenName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
    customData: { age: 1979 - (overrides.birthYear ?? 1900) },
    ...overrides,
  } as Character;
}

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    id: 'world-1',
    name: 'Test World',
    description: 'A test world',
    worldType: 'medieval-fantasy',
    gameType: 'simulation',
    targetLanguage: null,
    ownerId: null,
    visibility: 'private',
    isTemplate: false,
    allowedUserIds: [],
    maxPlayers: null,
    requiresAuth: false,
    selectedAssetCollectionId: null,
    cameraPerspective: null,
    timestepUnit: 'year',
    gameplayTimestepUnit: 'day',
    customTimestepLabel: null,
    customTimestepDurationMs: null,
    historyStartYear: 1839,
    historyEndYear: 1979,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as World;
}

function seedCharacters(worldId: string, count: number): Character[] {
  const chars: Character[] = [];
  const names = [
    ['James', 'Smith'], ['Mary', 'Johnson'], ['Robert', 'Williams'], ['Patricia', 'Brown'],
    ['John', 'Jones'], ['Jennifer', 'Davis'], ['Michael', 'Miller'], ['Linda', 'Wilson'],
    ['William', 'Moore'], ['Elizabeth', 'Taylor'], ['David', 'Anderson'], ['Barbara', 'Thomas'],
    ['Richard', 'Jackson'], ['Susan', 'White'], ['Joseph', 'Harris'], ['Jessica', 'Martin'],
    ['Thomas', 'Thompson'], ['Sarah', 'Garcia'], ['Charles', 'Martinez'], ['Karen', 'Robinson'],
  ];
  for (let i = 0; i < count; i++) {
    const [first, last] = names[i % names.length];
    const gender = i % 2 === 0 ? 'male' : 'female';
    // Mix of ages: some young, some middle-aged, some elderly
    const birthYear = i < 5 ? 1960 : i < 10 ? 1930 : i < 15 ? 1910 : 1890;
    // Pair up some married couples
    const spouseId = i < 6 && i % 2 === 0 ? `char-${i + 1}` : i < 6 && i % 2 === 1 ? `char-${i - 1}` : null;
    chars.push(makeCharacter({
      id: `char-${i}`,
      worldId,
      firstName: first,
      lastName: last,
      gender,
      birthYear,
      currentLocation: 'town-center',
      spouseId,
      customData: { age: 1979 - birthYear },
    }));
  }
  return chars;
}

// ── Tests ──

describe('Lo-fi simulation end-to-end (US-004)', () => {
  let mockStorage: IStorage;
  let characters: Character[];
  const worldId = 'world-1';
  const world = makeWorld({ id: worldId });

  beforeEach(() => {
    deathCount = 0;
    marriageCount = 0;
    timestepCallCount = 0;

    characters = seedCharacters(worldId, 20);

    mockStorage = {
      getWorld: vi.fn().mockResolvedValue(world),
      getCharactersByWorld: vi.fn().mockResolvedValue(characters),
      getRulesByWorld: vi.fn().mockResolvedValue([]),
      getGrammarsByWorld: vi.fn().mockResolvedValue([]),
      getCharacter: vi.fn().mockImplementation(async (id: string) =>
        characters.find(c => c.id === id) ?? null
      ),
      updateCharacter: vi.fn().mockResolvedValue(null),
      createTruth: vi.fn().mockResolvedValue({}),
      // Include other methods as no-ops
      getBusinessesByWorld: vi.fn().mockResolvedValue([]),
      getLotsByWorld: vi.fn().mockResolvedValue([]),
      getResidencesByWorld: vi.fn().mockResolvedValue([]),
      getSettlementsByWorld: vi.fn().mockResolvedValue([]),
      getCountriesByWorld: vi.fn().mockResolvedValue([]),
      getStatesByWorld: vi.fn().mockResolvedValue([]),
      getItemsByWorld: vi.fn().mockResolvedValue([]),
      getTruthsByWorld: vi.fn().mockResolvedValue([]),
      getAchievementsByWorld: vi.fn().mockResolvedValue([]),
      getLanguagesByWorld: vi.fn().mockResolvedValue([]),
    } as unknown as IStorage;
  });

  it('should complete 140-year simulation successfully', async () => {
    const { InsimulSimulationEngine } = await import('../engines/unified-engine.js');
    const engine = new InsimulSimulationEngine(mockStorage);

    const result = await engine.simulateLoFi(worldId, 'sim-1', {
      simulationMode: 'lo-fi',
      steps: 140,
      samplingRate: 3.6,
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  }, 60_000);

  it('should produce deaths during 140-year simulation', async () => {
    const { InsimulSimulationEngine } = await import('../engines/unified-engine.js');
    const engine = new InsimulSimulationEngine(mockStorage);

    const result = await engine.simulateLoFi(worldId, 'sim-1', {
      simulationMode: 'lo-fi',
      steps: 140,
      samplingRate: 3.6,
    });

    expect(result.success).toBe(true);
    expect(result.totalLifeEvents.deaths).toBeGreaterThan(0);
  }, 60_000);

  it('should produce marriages during 140-year simulation', async () => {
    const { InsimulSimulationEngine } = await import('../engines/unified-engine.js');
    const engine = new InsimulSimulationEngine(mockStorage);

    const result = await engine.simulateLoFi(worldId, 'sim-1', {
      simulationMode: 'lo-fi',
      steps: 140,
      samplingRate: 3.6,
    });

    expect(result.success).toBe(true);
    expect(result.totalLifeEvents.marriages).toBeGreaterThan(0);
  }, 60_000);

  it('should return valid rate table from world type', async () => {
    const { InsimulSimulationEngine } = await import('../engines/unified-engine.js');
    const engine = new InsimulSimulationEngine(mockStorage);

    const result = await engine.simulateLoFi(worldId, 'sim-1', {
      simulationMode: 'lo-fi',
      steps: 1, // Short run just to get rates
      samplingRate: 100,
    });

    expect(result.success).toBe(true);
    expect(result.rates).toBeDefined();
    expect(result.rates.birthRate).toBeGreaterThan(0);
    expect(result.rates.deathRateMultiplier).toBeGreaterThan(0);
  });
});

// ── Hi-fi simulation tests (US-005) ──

describe('Hi-fi simulation end-to-end (US-005)', () => {
  let mockStorage: IStorage;
  let characters: Character[];
  const worldId = 'world-1';
  const world = makeWorld({ id: worldId });

  beforeEach(() => {
    deathCount = 0;
    marriageCount = 0;
    timestepCallCount = 0;

    characters = seedCharacters(worldId, 10);

    mockStorage = {
      getWorld: vi.fn().mockResolvedValue(world),
      getCharactersByWorld: vi.fn().mockResolvedValue(characters),
      getRulesByWorld: vi.fn().mockResolvedValue([]),
      getGrammarsByWorld: vi.fn().mockResolvedValue([]),
      getCharacter: vi.fn().mockImplementation(async (id: string) =>
        characters.find(c => c.id === id) ?? null
      ),
      updateCharacter: vi.fn().mockResolvedValue(null),
      createTruth: vi.fn().mockResolvedValue({}),
      getBusinessesByWorld: vi.fn().mockResolvedValue([]),
      getLotsByWorld: vi.fn().mockResolvedValue([]),
      getResidencesByWorld: vi.fn().mockResolvedValue([]),
      getSettlementsByWorld: vi.fn().mockResolvedValue([]),
      getCountriesByWorld: vi.fn().mockResolvedValue([]),
      getStatesByWorld: vi.fn().mockResolvedValue([]),
      getItemsByWorld: vi.fn().mockResolvedValue([]),
      getTruthsByWorld: vi.fn().mockResolvedValue([]),
      getAchievementsByWorld: vi.fn().mockResolvedValue([]),
      getLanguagesByWorld: vi.fn().mockResolvedValue([]),
    } as unknown as IStorage;
  });

  it('should complete 10-step hi-fi simulation successfully', async () => {
    const { InsimulSimulationEngine } = await import('../engines/unified-engine.js');
    const engine = new InsimulSimulationEngine(mockStorage);

    const result = await engine.simulateHiFi(worldId, 'sim-hifi-1', {
      simulationMode: 'hi-fi',
      steps: 10,
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  }, 30_000);

  it('should produce 10 step results', async () => {
    const { InsimulSimulationEngine } = await import('../engines/unified-engine.js');
    const engine = new InsimulSimulationEngine(mockStorage);

    const result = await engine.simulateHiFi(worldId, 'sim-hifi-2', {
      simulationMode: 'hi-fi',
      steps: 10,
    });

    expect(result.success).toBe(true);
    expect(result.stepResults).toHaveLength(10);
  }, 30_000);

  it('should produce aggregate counters > 0', async () => {
    const { InsimulSimulationEngine } = await import('../engines/unified-engine.js');
    const engine = new InsimulSimulationEngine(mockStorage);

    const result = await engine.simulateHiFi(worldId, 'sim-hifi-3', {
      simulationMode: 'hi-fi',
      steps: 10,
    });

    expect(result.success).toBe(true);
    // At least one aggregate counter should be > 0
    const hasActivity =
      result.totalObservations > 0 ||
      result.totalSocializations > 0 ||
      result.totalKnowledgePropagations > 0;
    expect(hasActivity).toBe(true);
  }, 30_000);
});
