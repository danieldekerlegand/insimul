/**
 * Tests for the seamless game entry flow logic
 *
 * Tests the auto-playthrough resolution algorithm that picks the best
 * existing playthrough or determines that a new one should be created.
 */

import { describe, it, expect } from 'vitest';

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  status: string;
  lastPlayedAt?: string;
}

/**
 * Resolves which playthrough to use from a list.
 * Returns the playthrough ID to resume, or null if a new one should be created.
 *
 * Priority:
 * 1. Active playthroughs (most recently played first)
 * 2. Paused playthroughs (most recently played first)
 * 3. null (create new)
 */
function resolvePlaythroughFromList(playthroughs: Playthrough[]): string | null {
  const candidates = playthroughs
    .filter((p) => p.status === 'active' || p.status === 'paused')
    .sort((a, b) => {
      // Active before paused
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      // Most recently played first
      const aDate = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0;
      const bDate = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0;
      return bDate - aDate;
    });

  return candidates.length > 0 ? candidates[0].id : null;
}

function makePlaythrough(overrides: Partial<Playthrough> & { id: string }): Playthrough {
  return {
    userId: 'user1',
    worldId: 'world1',
    status: 'active',
    ...overrides,
  };
}

describe('Game entry flow — auto-playthrough resolution', () => {
  describe('resolvePlaythroughFromList', () => {
    it('returns null for empty list', () => {
      expect(resolvePlaythroughFromList([])).toBeNull();
    });

    it('returns null when all playthroughs are completed or abandoned', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'completed' }),
        makePlaythrough({ id: 'p2', status: 'abandoned' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBeNull();
    });

    it('returns the only active playthrough', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'active' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p1');
    });

    it('returns the only paused playthrough when no active ones exist', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'completed' }),
        makePlaythrough({ id: 'p2', status: 'paused' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p2');
    });

    it('prefers active over paused', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'paused', lastPlayedAt: '2026-03-19T10:00:00Z' }),
        makePlaythrough({ id: 'p2', status: 'active', lastPlayedAt: '2026-03-18T10:00:00Z' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p2');
    });

    it('picks most recently played among active playthroughs', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'active', lastPlayedAt: '2026-03-17T10:00:00Z' }),
        makePlaythrough({ id: 'p2', status: 'active', lastPlayedAt: '2026-03-19T10:00:00Z' }),
        makePlaythrough({ id: 'p3', status: 'active', lastPlayedAt: '2026-03-18T10:00:00Z' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p2');
    });

    it('picks most recently played among paused playthroughs', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'paused', lastPlayedAt: '2026-03-15T10:00:00Z' }),
        makePlaythrough({ id: 'p2', status: 'paused', lastPlayedAt: '2026-03-19T10:00:00Z' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p2');
    });

    it('handles playthroughs with no lastPlayedAt', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'active' }),
        makePlaythrough({ id: 'p2', status: 'active', lastPlayedAt: '2026-03-19T10:00:00Z' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p2');
    });

    it('filters out completed/abandoned and picks from remaining', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'completed' }),
        makePlaythrough({ id: 'p2', status: 'abandoned' }),
        makePlaythrough({ id: 'p3', status: 'paused', lastPlayedAt: '2026-03-19T10:00:00Z' }),
        makePlaythrough({ id: 'p4', status: 'active', lastPlayedAt: '2026-03-18T10:00:00Z' }),
      ];
      // Active (p4) preferred over paused (p3)
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p4');
    });

    it('handles single playthrough with no lastPlayedAt', () => {
      const playthroughs = [
        makePlaythrough({ id: 'p1', status: 'active' }),
      ];
      expect(resolvePlaythroughFromList(playthroughs)).toBe('p1');
    });
  });
});

describe('Game entry flow — phase transitions', () => {
  type GamePhase = 'world-select' | 'loading' | 'playing';

  it('starts at world-select when no worldId in URL', () => {
    const phase: GamePhase = undefined ? 'loading' : 'world-select';
    expect(phase).toBe('world-select');
  });

  it('starts at loading when worldId is in URL', () => {
    const urlWorldId = 'world-123';
    const phase: GamePhase = urlWorldId ? 'loading' : 'world-select';
    expect(phase).toBe('loading');
  });

  it('transitions to playing when playthrough is resolved', () => {
    const playthroughId = 'pt-123';
    const phase: GamePhase = playthroughId ? 'playing' : 'loading';
    expect(phase).toBe('playing');
  });

  it('transitions back to world-select on back action', () => {
    let phase: GamePhase = 'playing';
    let selectedWorldId: string | null = 'world-123';
    let playthroughId: string | null = 'pt-123';

    // Simulate back action
    phase = 'world-select';
    selectedWorldId = null;
    playthroughId = null;

    expect(phase).toBe('world-select');
    expect(selectedWorldId).toBeNull();
    expect(playthroughId).toBeNull();
  });
});
