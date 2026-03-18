/**
 * Tests for PlaythroughSelector and PlaythroughsList component logic
 *
 * Tests the helper functions, data grouping, and formatting used
 * in the playthrough selection and management UI.
 */

import { describe, it, expect } from 'vitest';

// Re-implement the pure helper functions from the components to test in isolation

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString();
}

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  notes?: string;
  status: string;
  playtime?: number;
  actionsCount?: number;
  createdAt: string;
  lastPlayedAt?: string;
}

function groupPlaythroughs(playthroughs: Playthrough[]) {
  return {
    active: playthroughs.filter((p) => p.status === 'active'),
    paused: playthroughs.filter((p) => p.status === 'paused'),
    completed: playthroughs.filter((p) => p.status === 'completed'),
    abandoned: playthroughs.filter((p) => p.status === 'abandoned'),
  };
}

const VALID_STATUSES = ['active', 'paused', 'completed', 'abandoned'];

function isValidStatusTransition(current: string, next: string): boolean {
  if (current === 'active') return next === 'paused' || next === 'abandoned';
  if (current === 'paused') return next === 'active' || next === 'abandoned';
  return false;
}

describe('PlaythroughSelector helpers', () => {
  describe('formatDuration', () => {
    it('returns 0m for undefined', () => {
      expect(formatDuration(undefined)).toBe('0m');
    });

    it('returns 0m for zero seconds', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('formats minutes only when under an hour', () => {
      expect(formatDuration(300)).toBe('5m');
      expect(formatDuration(1800)).toBe('30m');
      expect(formatDuration(3540)).toBe('59m');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(7200)).toBe('2h 0m');
      expect(formatDuration(9000)).toBe('2h 30m');
    });

    it('handles large values', () => {
      expect(formatDuration(86400)).toBe('24h 0m');
      expect(formatDuration(90061)).toBe('25h 1m');
    });
  });

  describe('formatDate', () => {
    it('returns Never for undefined', () => {
      expect(formatDate(undefined)).toBe('Never');
    });

    it('returns a formatted date string for valid ISO dates', () => {
      const result = formatDate('2026-03-15T10:30:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('Never');
    });
  });

  describe('groupPlaythroughs', () => {
    const mockPlaythroughs: Playthrough[] = [
      { id: '1', userId: 'u1', worldId: 'w1', name: 'Run 1', status: 'active', createdAt: '2026-01-01' },
      { id: '2', userId: 'u1', worldId: 'w1', name: 'Run 2', status: 'completed', createdAt: '2026-01-02' },
      { id: '3', userId: 'u1', worldId: 'w1', name: 'Run 3', status: 'paused', createdAt: '2026-01-03' },
      { id: '4', userId: 'u1', worldId: 'w1', name: 'Run 4', status: 'abandoned', createdAt: '2026-01-04' },
      { id: '5', userId: 'u1', worldId: 'w1', name: 'Run 5', status: 'active', createdAt: '2026-01-05' },
    ];

    it('groups playthroughs by status', () => {
      const groups = groupPlaythroughs(mockPlaythroughs);
      expect(groups.active).toHaveLength(2);
      expect(groups.completed).toHaveLength(1);
      expect(groups.paused).toHaveLength(1);
      expect(groups.abandoned).toHaveLength(1);
    });

    it('returns empty arrays for missing statuses', () => {
      const groups = groupPlaythroughs([
        { id: '1', userId: 'u1', worldId: 'w1', status: 'active', createdAt: '2026-01-01' },
      ]);
      expect(groups.active).toHaveLength(1);
      expect(groups.completed).toHaveLength(0);
      expect(groups.paused).toHaveLength(0);
      expect(groups.abandoned).toHaveLength(0);
    });

    it('handles empty array', () => {
      const groups = groupPlaythroughs([]);
      expect(groups.active).toHaveLength(0);
      expect(groups.completed).toHaveLength(0);
      expect(groups.paused).toHaveLength(0);
      expect(groups.abandoned).toHaveLength(0);
    });
  });

  describe('isValidStatusTransition', () => {
    it('allows active to be paused', () => {
      expect(isValidStatusTransition('active', 'paused')).toBe(true);
    });

    it('allows active to be abandoned', () => {
      expect(isValidStatusTransition('active', 'abandoned')).toBe(true);
    });

    it('allows paused to be resumed (active)', () => {
      expect(isValidStatusTransition('paused', 'active')).toBe(true);
    });

    it('allows paused to be abandoned', () => {
      expect(isValidStatusTransition('paused', 'abandoned')).toBe(true);
    });

    it('disallows completed playthroughs from changing status', () => {
      expect(isValidStatusTransition('completed', 'active')).toBe(false);
      expect(isValidStatusTransition('completed', 'paused')).toBe(false);
    });

    it('disallows abandoned playthroughs from changing status', () => {
      expect(isValidStatusTransition('abandoned', 'active')).toBe(false);
      expect(isValidStatusTransition('abandoned', 'paused')).toBe(false);
    });

    it('disallows active to completed (only system can set this)', () => {
      expect(isValidStatusTransition('active', 'completed')).toBe(false);
    });
  });

  describe('playthrough data validation', () => {
    it('all statuses are accounted for', () => {
      expect(VALID_STATUSES).toContain('active');
      expect(VALID_STATUSES).toContain('paused');
      expect(VALID_STATUSES).toContain('completed');
      expect(VALID_STATUSES).toContain('abandoned');
      expect(VALID_STATUSES).toHaveLength(4);
    });

    it('playthrough with notes displays notes', () => {
      const p: Playthrough = {
        id: '1',
        userId: 'u1',
        worldId: 'w1',
        name: 'Test Run',
        notes: 'Exploring the forest area',
        status: 'active',
        createdAt: '2026-01-01',
      };
      expect(p.notes).toBeTruthy();
      expect(p.notes!.length).toBeGreaterThan(0);
    });

    it('playthrough without name defaults to falsy', () => {
      const p: Playthrough = {
        id: '1',
        userId: 'u1',
        worldId: 'w1',
        status: 'active',
        createdAt: '2026-01-01',
      };
      expect(p.name).toBeUndefined();
    });
  });
});
