import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResearchAnonymizer, ANONYMIZATION_CONFIGS } from '../services/research-anonymizer';
import { exportResearchData, researchDataToCsv } from '../services/research-export';

// Mock storage
vi.mock('../db/storage', () => ({
  storage: {
    getWorld: vi.fn(),
    getPlaythroughsByWorld: vi.fn(),
    getTracesByPlaythrough: vi.fn(),
    getDeltasByPlaythrough: vi.fn(),
    getCharactersByWorld: vi.fn(),
  },
}));

vi.mock('../services/reputation-service', () => ({
  getPlaythroughReputations: vi.fn(),
}));

import { storage } from '../db/storage';
import { getPlaythroughReputations } from '../services/reputation-service';

const mockStorage = storage as any;
const mockGetReps = getPlaythroughReputations as any;

function makeSampleCharacter(overrides: Record<string, any> = {}) {
  return {
    id: 'char-1',
    worldId: 'world-1',
    firstName: 'John',
    lastName: 'Doe',
    middleName: null,
    maidenName: null,
    suffix: null,
    birthYear: 1950,
    isAlive: true,
    gender: 'male',
    personality: { openness: 0.7, conscientiousness: 0.5, extroversion: 0.3, agreeableness: 0.8, neuroticism: 0.2 },
    physicalTraits: {},
    mentalTraits: {},
    skills: { cooking: 5 },
    memory: 0.5,
    mentalModels: { 'char-2': { trust: 0.8 } },
    thoughts: [{ text: 'I am hungry' }],
    relationships: {},
    socialAttributes: {},
    coworkerIds: ['char-2'],
    friendIds: ['char-3'],
    neighborIds: [],
    immediateFamilyIds: [],
    extendedFamilyIds: [],
    parentIds: [],
    childIds: [],
    spouseId: 'char-4',
    genealogyData: { tree: 'big' },
    generationMethod: 'tott',
    generationConfig: {},
    currentLocation: 'loc-1',
    occupation: 'chef',
    status: 'active',
    currentOccupationId: 'occ-1',
    currentResidenceId: 'res-1',
    collegeGraduate: false,
    retired: false,
    departureYear: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeSamplePlaythrough(overrides: Record<string, any> = {}) {
  return {
    id: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    worldSnapshotVersion: 1,
    name: 'Test Playthrough',
    description: 'A test',
    notes: null,
    status: 'active',
    currentTimestep: 42,
    playtime: 3600,
    actionsCount: 100,
    decisionsCount: 10,
    startedAt: new Date('2026-01-01'),
    lastPlayedAt: new Date('2026-03-01'),
    completedAt: null,
    playerCharacterId: 'char-1',
    saveData: { slot_0: { hp: 100 } },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-01'),
    ...overrides,
  };
}

function makeSampleTrace(overrides: Record<string, any> = {}) {
  return {
    id: 'trace-1',
    playthroughId: 'pt-1',
    userId: 'user-1',
    actionType: 'move',
    actionName: 'Walk to market',
    actionData: { destination: 'market' },
    timestep: 5,
    characterId: 'char-1',
    targetId: null,
    targetType: null,
    locationId: 'loc-1',
    outcome: 'success',
    outcomeData: {},
    stateChanges: [],
    narrativeText: 'You walk to the market.',
    durationMs: 200,
    timestamp: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

function makeSampleReputation(overrides: Record<string, any> = {}) {
  return {
    id: 'rep-1',
    playthroughId: 'pt-1',
    userId: 'user-1',
    entityType: 'settlement',
    entityId: 'settlement-1',
    score: 25,
    violationCount: 1,
    warningCount: 0,
    lastViolation: null,
    violationHistory: [],
    standing: 'friendly',
    isBanned: false,
    banExpiry: null,
    totalFinesPaid: 0,
    outstandingFines: 0,
    hasDiscounts: false,
    hasSpecialAccess: false,
    notes: 'Good citizen',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ── Anonymizer unit tests ───────────────────────────────────────────────

describe('ResearchAnonymizer', () => {
  it('produces deterministic IDs with the same salt', () => {
    const a = new ResearchAnonymizer('test-salt');
    const b = new ResearchAnonymizer('test-salt');
    expect(a.anonymizeId('user-1')).toBe(b.anonymizeId('user-1'));
  });

  it('produces different IDs with different salts', () => {
    const a = new ResearchAnonymizer('salt-a');
    const b = new ResearchAnonymizer('salt-b');
    expect(a.anonymizeId('user-1')).not.toBe(b.anonymizeId('user-1'));
  });

  it('returns consistent anonymous names for the same input', () => {
    const anon = new ResearchAnonymizer();
    const name1 = anon.anonymizeName('John Doe');
    const name2 = anon.anonymizeName('John Doe');
    expect(name1).toBe(name2);
    expect(name1).toBe('Participant_001');
  });

  it('assigns sequential names to different inputs', () => {
    const anon = new ResearchAnonymizer();
    expect(anon.anonymizeName('Alice')).toBe('Participant_001');
    expect(anon.anonymizeName('Bob')).toBe('Participant_002');
    expect(anon.anonymizeName('Charlie')).toBe('Participant_003');
  });

  it('returns empty string for falsy name', () => {
    const anon = new ResearchAnonymizer();
    expect(anon.anonymizeName('')).toBe('');
  });

  it('anonymizes a record with ID, name, and removed fields', () => {
    const anon = new ResearchAnonymizer('fixed-salt');
    const record = {
      id: 'char-1',
      worldId: 'world-1',
      firstName: 'John',
      lastName: 'Doe',
      genealogyData: { tree: 'data' },
      personality: { openness: 0.7 },
    };

    const result = anon.anonymizeRecord(record, ANONYMIZATION_CONFIGS.character);

    // IDs should be hashed
    expect(result.id).not.toBe('char-1');
    expect(result.id).toHaveLength(16);
    expect(result.worldId).not.toBe('world-1');

    // Names should be anonymized
    expect(result.firstName).toBe('Participant_001');
    expect(result.lastName).toBe('Participant_002');

    // Removed fields should be gone
    expect(result.genealogyData).toBeUndefined();

    // Non-PII fields should remain
    expect(result.personality).toEqual({ openness: 0.7 });
  });

  it('anonymizes ID arrays', () => {
    const anon = new ResearchAnonymizer('fixed-salt');
    const record = {
      id: 'char-1',
      worldId: 'world-1',
      firstName: 'A',
      lastName: 'B',
      coworkerIds: ['char-2', 'char-3'],
      friendIds: ['char-4'],
      genealogyData: {},
      mentalModels: {},
      thoughts: [],
    };

    const result = anon.anonymizeRecord(record, ANONYMIZATION_CONFIGS.character);

    expect(result.coworkerIds).toHaveLength(2);
    expect(result.coworkerIds[0]).not.toBe('char-2');
    expect(result.coworkerIds[0]).toHaveLength(16);
    // Same ID should always hash the same way
    expect(result.coworkerIds[0]).toBe(anon.anonymizeId('char-2'));
  });

  it('exposes the salt for reproducibility', () => {
    const anon = new ResearchAnonymizer('my-salt');
    expect(anon.getSalt()).toBe('my-salt');
  });

  it('auto-generates a salt when none is provided', () => {
    const anon = new ResearchAnonymizer();
    expect(anon.getSalt()).toBeTruthy();
    expect(anon.getSalt().length).toBeGreaterThan(0);
  });
});

// ── Export service tests ────────────────────────────────────────────────

describe('exportResearchData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports and anonymizes all data for a world', async () => {
    const pt = makeSamplePlaythrough();
    const trace = makeSampleTrace();
    const char = makeSampleCharacter();
    const rep = makeSampleReputation();

    mockStorage.getWorld.mockResolvedValue({ id: 'world-1', name: 'Test' });
    mockStorage.getPlaythroughsByWorld.mockResolvedValue([pt]);
    mockStorage.getTracesByPlaythrough.mockResolvedValue([trace]);
    mockStorage.getDeltasByPlaythrough.mockResolvedValue([]);
    mockStorage.getCharactersByWorld.mockResolvedValue([char]);
    mockGetReps.mockResolvedValue([rep]);

    const result = await exportResearchData({
      worldId: 'world-1',
      anonymizer: new ResearchAnonymizer('test-salt'),
    });

    expect(result.format).toBe('json');
    expect(result.exportedAt).toBeTruthy();
    expect(result.anonymizationSalt).toBe('test-salt');
    expect(result.worldId).not.toBe('world-1'); // anonymized

    // Playthroughs anonymized
    expect(result.data.playthroughs).toHaveLength(1);
    const anonPt = result.data.playthroughs[0];
    expect(anonPt.id).not.toBe('pt-1');
    expect(anonPt.userId).not.toBe('user-1');
    expect(anonPt.saveData).toBeUndefined(); // removed

    // Traces anonymized
    expect(result.data.traces).toHaveLength(1);
    const anonTrace = result.data.traces[0];
    expect(anonTrace.id).not.toBe('trace-1');
    expect(anonTrace.userId).not.toBe('user-1');
    expect(anonTrace.actionType).toBe('move'); // non-PII preserved

    // Characters anonymized
    expect(result.data.characters).toHaveLength(1);
    const anonChar = result.data.characters[0];
    expect(anonChar.firstName).toMatch(/^Participant_\d+$/);
    expect(anonChar.lastName).toMatch(/^Participant_\d+$/);
    expect(anonChar.personality).toEqual(char.personality); // preserved
    expect(anonChar.genealogyData).toBeUndefined(); // removed
    expect(anonChar.mentalModels).toBeUndefined(); // removed
    expect(anonChar.thoughts).toBeUndefined(); // removed

    // Reputations anonymized
    expect(result.data.reputations).toHaveLength(1);
    const anonRep = result.data.reputations[0];
    expect(anonRep.notes).toBeUndefined(); // removed
    expect(anonRep.score).toBe(25); // preserved
  });

  it('throws when world not found', async () => {
    mockStorage.getWorld.mockResolvedValue(null);
    await expect(exportResearchData({ worldId: 'nonexistent' })).rejects.toThrow(
      'World not found'
    );
  });

  it('excludes characters when includeCharacters is false', async () => {
    mockStorage.getWorld.mockResolvedValue({ id: 'world-1' });
    mockStorage.getPlaythroughsByWorld.mockResolvedValue([]);
    mockGetReps.mockResolvedValue([]);

    const result = await exportResearchData({
      worldId: 'world-1',
      includeCharacters: false,
    });

    expect(result.data.characters).toHaveLength(0);
    expect(mockStorage.getCharactersByWorld).not.toHaveBeenCalled();
  });

  it('excludes traces when includeTraces is false', async () => {
    mockStorage.getWorld.mockResolvedValue({ id: 'world-1' });
    mockStorage.getPlaythroughsByWorld.mockResolvedValue([makeSamplePlaythrough()]);
    mockStorage.getCharactersByWorld.mockResolvedValue([]);
    mockGetReps.mockResolvedValue([]);

    const result = await exportResearchData({
      worldId: 'world-1',
      includeTraces: false,
    });

    expect(result.data.traces).toHaveLength(0);
    expect(mockStorage.getTracesByPlaythrough).not.toHaveBeenCalled();
  });

  it('includes deltas when includeDeltas is true', async () => {
    const delta = {
      id: 'delta-1',
      playthroughId: 'pt-1',
      entityType: 'character',
      entityId: 'char-2',
      operation: 'update',
      deltaData: { health: 50 },
      fullData: null,
      timestep: 10,
      appliedAt: new Date(),
      description: 'Took damage',
      tags: ['combat'],
      createdAt: new Date(),
    };

    mockStorage.getWorld.mockResolvedValue({ id: 'world-1' });
    mockStorage.getPlaythroughsByWorld.mockResolvedValue([makeSamplePlaythrough()]);
    mockStorage.getDeltasByPlaythrough.mockResolvedValue([delta]);
    mockStorage.getTracesByPlaythrough.mockResolvedValue([]);
    mockStorage.getCharactersByWorld.mockResolvedValue([]);
    mockGetReps.mockResolvedValue([]);

    const result = await exportResearchData({
      worldId: 'world-1',
      includeDeltas: true,
      anonymizer: new ResearchAnonymizer('salt'),
    });

    expect(result.data.deltas).toHaveLength(1);
    expect(result.data.deltas[0].id).not.toBe('delta-1');
    expect(result.data.deltas[0].entityType).toBe('character');
  });
});

// ── CSV conversion tests ────────────────────────────────────────────────

describe('researchDataToCsv', () => {
  it('converts data arrays to CSV strings', () => {
    const data = {
      playthroughs: [
        { id: 'a1', status: 'active', playtime: 3600 },
        { id: 'a2', status: 'completed', playtime: 7200 },
      ],
      traces: [
        { id: 'b1', actionType: 'move', outcome: 'success' },
      ],
      characters: [],
      deltas: [],
      reputations: [],
    };

    const csvFiles = researchDataToCsv(data);

    // Playthroughs CSV
    expect(csvFiles.playthroughs).toContain('id,status,playtime');
    expect(csvFiles.playthroughs).toContain('a1,active,3600');
    expect(csvFiles.playthroughs).toContain('a2,completed,7200');

    // Traces CSV
    expect(csvFiles.traces).toContain('id,actionType,outcome');
    expect(csvFiles.traces).toContain('b1,move,success');

    // Empty datasets
    expect(csvFiles.characters).toBe('');
    expect(csvFiles.deltas).toBe('');
  });

  it('escapes commas and quotes in CSV values', () => {
    const data = {
      playthroughs: [{ id: 'x', note: 'hello, world', detail: 'say "hi"' }],
      traces: [],
      characters: [],
      deltas: [],
      reputations: [],
    };

    const csvFiles = researchDataToCsv(data);
    expect(csvFiles.playthroughs).toContain('"hello, world"');
    expect(csvFiles.playthroughs).toContain('"say ""hi"""');
  });

  it('serializes objects as JSON in CSV', () => {
    const data = {
      playthroughs: [{ id: 'x', config: { nested: true } }],
      traces: [],
      characters: [],
      deltas: [],
      reputations: [],
    };

    const csvFiles = researchDataToCsv(data);
    // JSON objects get CSV-escaped (internal quotes doubled, value wrapped in quotes)
    expect(csvFiles.playthroughs).toContain('"{""nested"":true}"');
  });
});
