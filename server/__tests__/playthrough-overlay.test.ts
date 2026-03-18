import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/storage', () => ({
  storage: {
    getTruthsByWorld: vi.fn(),
    getTruthsByCharacter: vi.fn(),
    getTruth: vi.fn(),
    getDeltasByEntityType: vi.fn(),
    createPlaythroughDelta: vi.fn(),
  },
}));

// Import after mock setup
import { storage } from '../db/storage';
const mockStorage = storage as any;

import {
  getTruthsWithOverlay,
  getTruthsByCharacterWithOverlay,
  getTruthWithOverlay,
  createTruthInPlaythrough,
  updateTruthInPlaythrough,
  deleteTruthInPlaythrough,
} from '../services/playthrough-overlay';

const baseTruths = [
  { id: 'truth-1', worldId: 'w1', characterId: 'c1', title: 'Base Truth 1', entryType: 'event', content: 'content1' },
  { id: 'truth-2', worldId: 'w1', characterId: 'c2', title: 'Base Truth 2', entryType: 'ownership', content: 'content2' },
  { id: 'truth-3', worldId: 'w1', characterId: 'c1', title: 'Base Truth 3', entryType: 'event', content: 'content3' },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage.getTruthsByWorld.mockResolvedValue([...baseTruths]);
  mockStorage.getDeltasByEntityType.mockResolvedValue([]);
  mockStorage.createPlaythroughDelta.mockImplementation(async (delta: any) => ({
    id: 'delta-1',
    ...delta,
    appliedAt: new Date(),
    createdAt: new Date(),
  }));
});

describe('PlaythroughOverlay', () => {
  describe('getTruthsWithOverlay', () => {
    it('returns base truths when no deltas exist', async () => {
      const result = await getTruthsWithOverlay('w1', 'pt-1');
      expect(result).toHaveLength(3);
      expect(result.map((t: any) => t.id)).toEqual(['truth-1', 'truth-2', 'truth-3']);
    });

    it('excludes truths deleted in playthrough', async () => {
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        { entityId: 'truth-2', operation: 'delete', timestep: 1 },
      ]);

      const result = await getTruthsWithOverlay('w1', 'pt-1');
      expect(result).toHaveLength(2);
      expect(result.map((t: any) => t.id)).toEqual(['truth-1', 'truth-3']);
    });

    it('includes truths created in playthrough', async () => {
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        {
          entityId: 'pt-truth-1',
          operation: 'create',
          fullData: { worldId: 'w1', characterId: 'c1', title: 'New Truth', entryType: 'event', content: 'new' },
          timestep: 1,
        },
      ]);

      const result = await getTruthsWithOverlay('w1', 'pt-1');
      expect(result).toHaveLength(4);
      expect(result[3]).toMatchObject({ id: 'pt-truth-1', title: 'New Truth' });
    });

    it('applies update deltas to base truths', async () => {
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        { entityId: 'truth-1', operation: 'update', deltaData: { title: 'Updated Title' }, timestep: 1 },
      ]);

      const result = await getTruthsWithOverlay('w1', 'pt-1');
      expect(result).toHaveLength(3);
      expect((result[0] as any).title).toBe('Updated Title');
      expect((result[0] as any).content).toBe('content1'); // unchanged field preserved
    });

    it('applies multiple update deltas in timestep order', async () => {
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        { entityId: 'truth-1', operation: 'update', deltaData: { title: 'First Update' }, timestep: 1 },
        { entityId: 'truth-1', operation: 'update', deltaData: { title: 'Second Update' }, timestep: 2 },
      ]);

      const result = await getTruthsWithOverlay('w1', 'pt-1');
      expect((result[0] as any).title).toBe('Second Update');
    });
  });

  describe('getTruthsByCharacterWithOverlay', () => {
    it('filters overlaid truths by characterId', async () => {
      const result = await getTruthsByCharacterWithOverlay('c1', 'pt-1', 'w1');
      expect(result).toHaveLength(2);
      expect(result.every((t: any) => t.characterId === 'c1')).toBe(true);
    });

    it('includes playthrough-created truths for the character', async () => {
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        {
          entityId: 'pt-truth-1',
          operation: 'create',
          fullData: { worldId: 'w1', characterId: 'c1', title: 'New', entryType: 'ownership', content: 'x' },
          timestep: 1,
        },
      ]);

      const result = await getTruthsByCharacterWithOverlay('c1', 'pt-1', 'w1');
      expect(result).toHaveLength(3);
    });
  });

  describe('getTruthWithOverlay', () => {
    it('returns base truth when no deltas', async () => {
      mockStorage.getTruth.mockResolvedValue(baseTruths[0]);
      const result = await getTruthWithOverlay('truth-1', 'pt-1');
      expect(result).toMatchObject({ id: 'truth-1', title: 'Base Truth 1' });
    });

    it('returns undefined for deleted truth', async () => {
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        { entityId: 'truth-1', operation: 'delete', timestep: 1 },
      ]);
      const result = await getTruthWithOverlay('truth-1', 'pt-1');
      expect(result).toBeUndefined();
    });

    it('returns created truth from playthrough', async () => {
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        {
          entityId: 'pt-truth-1',
          operation: 'create',
          fullData: { title: 'Created in PT', content: 'xyz' },
          timestep: 1,
        },
      ]);
      const result = await getTruthWithOverlay('pt-truth-1', 'pt-1');
      expect(result).toMatchObject({ id: 'pt-truth-1', title: 'Created in PT' });
    });

    it('merges update deltas onto base truth', async () => {
      mockStorage.getTruth.mockResolvedValue(baseTruths[0]);
      mockStorage.getDeltasByEntityType.mockResolvedValue([
        { entityId: 'truth-1', operation: 'update', deltaData: { title: 'Patched' }, timestep: 1 },
      ]);
      const result = await getTruthWithOverlay('truth-1', 'pt-1');
      expect((result as any).title).toBe('Patched');
      expect((result as any).content).toBe('content1');
    });
  });

  describe('createTruthInPlaythrough', () => {
    it('creates a delta with operation=create and returns the truth', async () => {
      const data = { worldId: 'w1', characterId: 'c1', title: 'New Truth', content: 'body', entryType: 'event' };
      const result = await createTruthInPlaythrough('pt-1', data, 5);

      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledOnce();
      const call = mockStorage.createPlaythroughDelta.mock.calls[0][0];
      expect(call.playthroughId).toBe('pt-1');
      expect(call.entityType).toBe('truth');
      expect(call.operation).toBe('create');
      expect(call.timestep).toBe(5);
      expect(call.fullData.title).toBe('New Truth');
      expect(result).toMatchObject({ title: 'New Truth', content: 'body' });
      expect((result as any).id).toBeDefined();
    });
  });

  describe('updateTruthInPlaythrough', () => {
    it('creates a delta with operation=update', async () => {
      mockStorage.getTruth.mockResolvedValue(baseTruths[0]);

      const result = await updateTruthInPlaythrough('pt-1', 'truth-1', { title: 'Updated' }, 3);

      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledOnce();
      const call = mockStorage.createPlaythroughDelta.mock.calls[0][0];
      expect(call.operation).toBe('update');
      expect(call.deltaData).toEqual({ title: 'Updated' });
      expect((result as any).title).toBe('Updated');
    });

    it('returns undefined if truth does not exist', async () => {
      mockStorage.getTruth.mockResolvedValue(undefined);
      const result = await updateTruthInPlaythrough('pt-1', 'nonexistent', { title: 'x' }, 0);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteTruthInPlaythrough', () => {
    it('creates a delta with operation=delete', async () => {
      mockStorage.getTruth.mockResolvedValue(baseTruths[0]);

      const result = await deleteTruthInPlaythrough('pt-1', 'truth-1', 2);

      expect(result).toBe(true);
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledOnce();
      const call = mockStorage.createPlaythroughDelta.mock.calls[0][0];
      expect(call.operation).toBe('delete');
      expect(call.entityId).toBe('truth-1');
    });

    it('returns false if truth does not exist', async () => {
      mockStorage.getTruth.mockResolvedValue(undefined);
      const result = await deleteTruthInPlaythrough('pt-1', 'nonexistent', 0);
      expect(result).toBe(false);
    });
  });
});
