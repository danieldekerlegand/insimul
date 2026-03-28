import { describe, it, expect } from 'vitest';
import {
  mergeTruths,
  partitionTruths,
  isBaseTruth,
  isPlaythroughTruth,
  type TruthLike,
} from '../game-engine/truth-merge.js';

const baseTruth = (id: string, title: string): TruthLike => ({
  id,
  playthroughId: null,
  title,
  entryType: 'backstory',
});

const gameplayTruth = (id: string, playthroughId: string, title: string): TruthLike => ({
  id,
  playthroughId,
  title,
  entryType: 'event',
});

describe('truth-merge', () => {
  describe('mergeTruths', () => {
    it('returns base truths when no gameplay truths exist', () => {
      const base = [baseTruth('t1', 'Town founded'), baseTruth('t2', 'River runs through')];
      const result = mergeTruths(base, []);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual(['t1', 't2']);
    });

    it('appends gameplay truths after base truths', () => {
      const base = [baseTruth('t1', 'Town founded')];
      const gameplay = [gameplayTruth('t3', 'pt-1', 'Player arrived')];
      const result = mergeTruths(base, gameplay);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('t1');
      expect(result[1].id).toBe('t3');
    });

    it('excludes soft-deleted base truths (Set)', () => {
      const base = [baseTruth('t1', 'Old item'), baseTruth('t2', 'Kept item')];
      const gameplay = [gameplayTruth('t3', 'pt-1', 'New event')];
      const deleted = new Set(['t1']);
      const result = mergeTruths(base, gameplay, deleted);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual(['t2', 't3']);
    });

    it('excludes soft-deleted base truths (array)', () => {
      const base = [baseTruth('t1', 'Old'), baseTruth('t2', 'Kept')];
      const result = mergeTruths(base, [], ['t1']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t2');
    });

    it('returns empty array when all base truths deleted and no gameplay', () => {
      const base = [baseTruth('t1', 'Gone')];
      const result = mergeTruths(base, [], ['t1']);
      expect(result).toHaveLength(0);
    });

    it('handles empty inputs', () => {
      expect(mergeTruths([], [])).toEqual([]);
    });

    it('does not modify original arrays', () => {
      const base = [baseTruth('t1', 'A')];
      const gameplay = [gameplayTruth('t2', 'pt-1', 'B')];
      const result = mergeTruths(base, gameplay, ['t1']);
      expect(base).toHaveLength(1);
      expect(gameplay).toHaveLength(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('partitionTruths', () => {
    it('separates base and gameplay truths', () => {
      const truths = [
        baseTruth('t1', 'Base'),
        gameplayTruth('t2', 'pt-1', 'Gameplay'),
        baseTruth('t3', 'Base2'),
        gameplayTruth('t4', 'pt-1', 'Gameplay2'),
      ];
      const { base, gameplay } = partitionTruths(truths);
      expect(base.map((t) => t.id)).toEqual(['t1', 't3']);
      expect(gameplay.map((t) => t.id)).toEqual(['t2', 't4']);
    });

    it('handles all base truths', () => {
      const truths = [baseTruth('t1', 'A'), baseTruth('t2', 'B')];
      const { base, gameplay } = partitionTruths(truths);
      expect(base).toHaveLength(2);
      expect(gameplay).toHaveLength(0);
    });

    it('handles empty array', () => {
      const { base, gameplay } = partitionTruths([]);
      expect(base).toHaveLength(0);
      expect(gameplay).toHaveLength(0);
    });
  });

  describe('isBaseTruth', () => {
    it('returns true for null playthroughId', () => {
      expect(isBaseTruth(baseTruth('t1', 'A'))).toBe(true);
    });

    it('returns true for undefined playthroughId', () => {
      expect(isBaseTruth({ id: 't1' })).toBe(true);
    });

    it('returns false for gameplay truth', () => {
      expect(isBaseTruth(gameplayTruth('t1', 'pt-1', 'A'))).toBe(false);
    });
  });

  describe('isPlaythroughTruth', () => {
    it('returns true when playthroughId matches', () => {
      expect(isPlaythroughTruth(gameplayTruth('t1', 'pt-1', 'A'), 'pt-1')).toBe(true);
    });

    it('returns false when playthroughId differs', () => {
      expect(isPlaythroughTruth(gameplayTruth('t1', 'pt-1', 'A'), 'pt-2')).toBe(false);
    });

    it('returns false for base truth', () => {
      expect(isPlaythroughTruth(baseTruth('t1', 'A'), 'pt-1')).toBe(false);
    });
  });
});
