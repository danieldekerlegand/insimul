import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportPlaythrough,
  importPlaythrough,
  validatePortableSave,
  PORTABLE_SAVE_VERSION,
  type PortableSave,
} from '../services/playthrough-portable';

// Mock storage
vi.mock('../db/storage', () => ({
  storage: {
    getPlaythrough: vi.fn(),
    getDeltasByPlaythrough: vi.fn(),
    getTracesByPlaythrough: vi.fn(),
    getWorld: vi.fn(),
    createPlaythrough: vi.fn(),
    createPlaythroughDelta: vi.fn(),
    createPlayTrace: vi.fn(),
  },
}));

vi.mock('./reputation-service', () => ({
  getPlaythroughReputations: vi.fn(),
}));

// Also mock the actual import path used by the service
vi.mock('../services/reputation-service', () => ({
  getPlaythroughReputations: vi.fn(),
}));

vi.mock('../db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
  },
}));

import { storage } from '../db/storage';
import { getPlaythroughReputations } from '../services/reputation-service';
import { db } from '../db';

const mockStorage = storage as any;
const mockGetReps = getPlaythroughReputations as any;
const mockDb = db as any;

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

function makeSampleDelta(overrides: Record<string, any> = {}) {
  return {
    id: 'delta-1',
    playthroughId: 'pt-1',
    entityType: 'character',
    entityId: 'char-2',
    operation: 'update',
    deltaData: { health: 50 },
    fullData: null,
    timestep: 10,
    appliedAt: new Date(),
    description: 'Character took damage',
    tags: ['combat'],
    createdAt: new Date(),
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
    notes: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Build a valid PortableSave for testing import/validation.
 * Uses the same checksum logic as the real export.
 */
async function buildValidPortableSave(overrides: Partial<PortableSave> = {}): Promise<PortableSave> {
  // Set up mocks for export
  const pt = makeSamplePlaythrough();
  const delta = makeSampleDelta();
  const trace = makeSampleTrace();
  const rep = makeSampleReputation();

  mockStorage.getPlaythrough.mockResolvedValue(pt);
  mockStorage.getDeltasByPlaythrough.mockResolvedValue([delta]);
  mockStorage.getTracesByPlaythrough.mockResolvedValue([trace]);
  mockGetReps.mockResolvedValue([rep]);

  const exported = await exportPlaythrough('pt-1');
  return { ...exported, ...overrides };
}

describe('Playthrough Portable Save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Export ────────────────────────────────────────────────────────────
  describe('exportPlaythrough', () => {
    it('exports playthrough with deltas, traces, and reputations', async () => {
      const pt = makeSamplePlaythrough();
      const delta = makeSampleDelta();
      const trace = makeSampleTrace();
      const rep = makeSampleReputation();

      mockStorage.getPlaythrough.mockResolvedValue(pt);
      mockStorage.getDeltasByPlaythrough.mockResolvedValue([delta]);
      mockStorage.getTracesByPlaythrough.mockResolvedValue([trace]);
      mockGetReps.mockResolvedValue([rep]);

      const result = await exportPlaythrough('pt-1');

      expect(result.version).toBe(PORTABLE_SAVE_VERSION);
      expect(result.sourceWorldId).toBe('world-1');
      expect(result.sourceWorldSnapshotVersion).toBe(1);
      expect(result.checksum).toBeTruthy();
      expect(result.exportedAt).toBeTruthy();

      // Playthrough should not contain id or userId
      expect((result.playthrough as any).id).toBeUndefined();
      expect((result.playthrough as any).userId).toBeUndefined();
      expect(result.playthrough.name).toBe('Test Playthrough');
      expect(result.playthrough.currentTimestep).toBe(42);

      // Deltas should not contain id or playthroughId
      expect(result.deltas).toHaveLength(1);
      expect((result.deltas[0] as any).id).toBeUndefined();
      expect((result.deltas[0] as any).playthroughId).toBeUndefined();
      expect(result.deltas[0].entityType).toBe('character');

      // Traces should not contain id, playthroughId, or userId
      expect(result.traces).toHaveLength(1);
      expect((result.traces[0] as any).id).toBeUndefined();
      expect((result.traces[0] as any).playthroughId).toBeUndefined();
      expect((result.traces[0] as any).userId).toBeUndefined();

      // Reputations should not contain id, playthroughId, or userId
      expect(result.reputations).toHaveLength(1);
      expect((result.reputations[0] as any).id).toBeUndefined();
      expect((result.reputations[0] as any).playthroughId).toBeUndefined();
      expect((result.reputations[0] as any).userId).toBeUndefined();
      expect(result.reputations[0].score).toBe(25);
    });

    it('excludes traces when includeTraces is false', async () => {
      mockStorage.getPlaythrough.mockResolvedValue(makeSamplePlaythrough());
      mockStorage.getDeltasByPlaythrough.mockResolvedValue([]);
      mockStorage.getTracesByPlaythrough.mockResolvedValue([makeSampleTrace()]);
      mockGetReps.mockResolvedValue([]);

      const result = await exportPlaythrough('pt-1', { includeTraces: false });

      expect(result.traces).toHaveLength(0);
      expect(mockStorage.getTracesByPlaythrough).not.toHaveBeenCalled();
    });

    it('throws if playthrough not found', async () => {
      mockStorage.getPlaythrough.mockResolvedValue(null);

      await expect(exportPlaythrough('nonexistent')).rejects.toThrow('Playthrough not found');
    });
  });

  // ── Validation ────────────────────────────────────────────────────────
  describe('validatePortableSave', () => {
    it('accepts a valid save', async () => {
      const save = await buildValidPortableSave();
      expect(validatePortableSave(save)).toBeNull();
    });

    it('rejects non-object input', () => {
      expect(validatePortableSave(null)).toBe('Invalid save data: not an object');
      expect(validatePortableSave('string')).toBe('Invalid save data: not an object');
    });

    it('rejects wrong version', async () => {
      const save = await buildValidPortableSave();
      (save as any).version = 999;
      expect(validatePortableSave(save)).toMatch(/Unsupported save version/);
    });

    it('rejects missing fields', () => {
      expect(validatePortableSave({ version: 1 })).toMatch(/Missing or invalid/);
    });

    it('rejects tampered checksum', async () => {
      const save = await buildValidPortableSave();
      save.checksum = 'tampered1234567';
      expect(validatePortableSave(save)).toMatch(/Checksum mismatch/);
    });

    it('rejects tampered data', async () => {
      const save = await buildValidPortableSave();
      save.playthrough.name = 'HACKED';
      expect(validatePortableSave(save)).toMatch(/Checksum mismatch/);
    });
  });

  // ── Import ────────────────────────────────────────────────────────────
  describe('importPlaythrough', () => {
    it('creates a new playthrough with all associated data', async () => {
      const save = await buildValidPortableSave();

      const world = { id: 'world-2', name: 'Target World', version: 3 };
      mockStorage.getWorld.mockResolvedValue(world);
      mockStorage.createPlaythrough.mockResolvedValue({
        id: 'new-pt',
        userId: 'user-2',
        worldId: 'world-2',
        ...save.playthrough,
      });
      mockStorage.createPlaythroughDelta.mockResolvedValue({});
      mockStorage.createPlayTrace.mockResolvedValue({});
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await importPlaythrough(save, 'user-2', 'world-2');

      expect(result.id).toBe('new-pt');

      // Playthrough creation
      expect(mockStorage.createPlaythrough).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-2',
          worldId: 'world-2',
          worldSnapshotVersion: 3,
          name: 'Test Playthrough (imported)',
          status: 'active',
          currentTimestep: 42,
        })
      );

      // Deltas
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledTimes(1);
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
        expect.objectContaining({
          playthroughId: 'new-pt',
          entityType: 'character',
        })
      );

      // Traces
      expect(mockStorage.createPlayTrace).toHaveBeenCalledTimes(1);
      expect(mockStorage.createPlayTrace).toHaveBeenCalledWith(
        expect.objectContaining({
          playthroughId: 'new-pt',
          userId: 'user-2',
          actionType: 'move',
        })
      );

      // Reputations
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('throws if target world not found', async () => {
      const save = await buildValidPortableSave();
      mockStorage.getWorld.mockResolvedValue(null);

      await expect(importPlaythrough(save, 'user-2', 'world-999')).rejects.toThrow(
        'Target world not found'
      );
    });

    it('imports with empty deltas/traces/reputations', async () => {
      // Build a save with no related data
      mockStorage.getPlaythrough.mockResolvedValue(makeSamplePlaythrough());
      mockStorage.getDeltasByPlaythrough.mockResolvedValue([]);
      mockStorage.getTracesByPlaythrough.mockResolvedValue([]);
      mockGetReps.mockResolvedValue([]);

      const save = await exportPlaythrough('pt-1');

      const world = { id: 'world-2', name: 'Target', version: 1 };
      mockStorage.getWorld.mockResolvedValue(world);
      mockStorage.createPlaythrough.mockResolvedValue({ id: 'new-pt', ...save.playthrough });

      await importPlaythrough(save, 'user-2', 'world-2');

      expect(mockStorage.createPlaythroughDelta).not.toHaveBeenCalled();
      expect(mockStorage.createPlayTrace).not.toHaveBeenCalled();
    });

    it('sets status to paused when original status is missing', async () => {
      mockStorage.getPlaythrough.mockResolvedValue(
        makeSamplePlaythrough({ status: null })
      );
      mockStorage.getDeltasByPlaythrough.mockResolvedValue([]);
      mockStorage.getTracesByPlaythrough.mockResolvedValue([]);
      mockGetReps.mockResolvedValue([]);

      const save = await exportPlaythrough('pt-1');

      const world = { id: 'world-2', name: 'Target', version: 1 };
      mockStorage.getWorld.mockResolvedValue(world);
      mockStorage.createPlaythrough.mockResolvedValue({ id: 'new-pt', ...save.playthrough });

      await importPlaythrough(save, 'user-2', 'world-2');

      expect(mockStorage.createPlaythrough).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'paused' })
      );
    });
  });
});
