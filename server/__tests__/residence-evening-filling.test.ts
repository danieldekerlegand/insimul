/**
 * Tests for residence filling during evening and night hours.
 *
 * Verifies that characters without explicit routines are placed at their
 * residence during evening (17–21) and night (22–5) hours via the
 * isEveningOrNight, defaultHomeOccasion helpers and the updated
 * updateAllWhereabouts logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---------- Mock storage before importing the module ----------

const mockCharacters: any[] = [];
const mockUpdatedCharacters: Map<string, any> = new Map();

vi.mock('../db/storage', () => ({
  storage: {
    getCharactersByWorld: vi.fn(async () => mockCharacters),
    getCharacter: vi.fn(async (id: string) => mockCharacters.find(c => c.id === id)),
    updateCharacter: vi.fn(async (id: string, data: any) => {
      mockUpdatedCharacters.set(id, data);
    }),
  },
}));

// Mock prolog queries to return null (no Prolog routines)
vi.mock('../extensions/tott/prolog-queries.js', () => ({
  prologRoutine: vi.fn(async () => null),
}));

import {
  isEveningOrNight,
  defaultHomeOccasion,
  updateAllWhereabouts,
} from '../extensions/tott/routine-system';

// ---------- Helpers ----------

function makeCharacter(overrides: Partial<{
  id: string;
  worldId: string;
  firstName: string;
  lastName: string;
  isAlive: boolean;
  currentResidenceId: string | null;
  customData: any;
}> = {}) {
  return {
    id: overrides.id ?? 'char-1',
    worldId: overrides.worldId ?? 'world-1',
    firstName: overrides.firstName ?? 'Alice',
    lastName: overrides.lastName ?? 'Smith',
    isAlive: overrides.isAlive ?? true,
    currentResidenceId: 'currentResidenceId' in overrides ? overrides.currentResidenceId : 'res-1',
    currentLocation: null,
    customData: overrides.customData ?? {},
  };
}

// ---------- Tests ----------

describe('isEveningOrNight', () => {
  it('returns true for evening hours (17-21)', () => {
    expect(isEveningOrNight(17)).toBe(true);
    expect(isEveningOrNight(18)).toBe(true);
    expect(isEveningOrNight(20)).toBe(true);
    expect(isEveningOrNight(21)).toBe(true);
  });

  it('returns true for night hours (22-5)', () => {
    expect(isEveningOrNight(22)).toBe(true);
    expect(isEveningOrNight(23)).toBe(true);
    expect(isEveningOrNight(0)).toBe(true);
    expect(isEveningOrNight(3)).toBe(true);
    expect(isEveningOrNight(5)).toBe(true);
  });

  it('returns false for daytime hours (6-16)', () => {
    expect(isEveningOrNight(6)).toBe(false);
    expect(isEveningOrNight(8)).toBe(false);
    expect(isEveningOrNight(12)).toBe(false);
    expect(isEveningOrNight(16)).toBe(false);
  });
});

describe('defaultHomeOccasion', () => {
  it('returns sleeping for late night (22-5)', () => {
    expect(defaultHomeOccasion(22)).toBe('sleeping');
    expect(defaultHomeOccasion(23)).toBe('sleeping');
    expect(defaultHomeOccasion(0)).toBe('sleeping');
    expect(defaultHomeOccasion(3)).toBe('sleeping');
    expect(defaultHomeOccasion(5)).toBe('sleeping');
  });

  it('returns relaxing for evening hours (17-21)', () => {
    expect(defaultHomeOccasion(17)).toBe('relaxing');
    expect(defaultHomeOccasion(18)).toBe('relaxing');
    expect(defaultHomeOccasion(20)).toBe('relaxing');
    expect(defaultHomeOccasion(21)).toBe('relaxing');
  });
});

describe('updateAllWhereabouts — residence filling', () => {
  beforeEach(() => {
    mockCharacters.length = 0;
    mockUpdatedCharacters.clear();
    vi.clearAllMocks();
  });

  it('places characters at their residence during evening when no routine exists', async () => {
    mockCharacters.push(makeCharacter({ id: 'c1', currentResidenceId: 'res-A' }));

    const count = await updateAllWhereabouts('world-1', 100, 'day', 19);
    expect(count).toBe(1);

    // Character should have been updated with residence location
    expect(mockUpdatedCharacters.has('c1')).toBe(true);
    const data = mockUpdatedCharacters.get('c1');
    expect(data.customData.currentWhereabouts.location).toBe('res-A');
    expect(data.customData.currentWhereabouts.locationType).toBe('home');
    expect(data.customData.currentWhereabouts.occasion).toBe('relaxing');
  });

  it('places characters at residence with sleeping occasion during night', async () => {
    mockCharacters.push(makeCharacter({ id: 'c2', currentResidenceId: 'res-B' }));

    const count = await updateAllWhereabouts('world-1', 200, 'night', 23);
    expect(count).toBe(1);

    const data = mockUpdatedCharacters.get('c2');
    expect(data.customData.currentWhereabouts.location).toBe('res-B');
    expect(data.customData.currentWhereabouts.occasion).toBe('sleeping');
  });

  it('does not place characters at residence during daytime', async () => {
    mockCharacters.push(makeCharacter({ id: 'c3', currentResidenceId: 'res-C' }));

    const count = await updateAllWhereabouts('world-1', 300, 'day', 10);
    expect(count).toBe(0);
  });

  it('skips dead characters', async () => {
    mockCharacters.push(makeCharacter({ id: 'c4', isAlive: false, currentResidenceId: 'res-D' }));

    const count = await updateAllWhereabouts('world-1', 400, 'night', 22);
    expect(count).toBe(0);
  });

  it('skips characters without a residence', async () => {
    mockCharacters.push(makeCharacter({ id: 'c5', currentResidenceId: null }));

    const count = await updateAllWhereabouts('world-1', 500, 'night', 1);
    expect(count).toBe(0);
  });

  it('handles multiple characters, some with routines and some without', async () => {
    // Character with a routine (has customData.routine set)
    mockCharacters.push(makeCharacter({
      id: 'c6',
      currentResidenceId: 'res-E',
      customData: {
        routine: {
          characterId: 'c6',
          routine: {
            day: [{ startHour: 17, endHour: 22, location: 'bar-1', locationType: 'leisure', occasion: 'socializing' }],
            night: [{ startHour: 22, endHour: 6, location: 'res-E', locationType: 'home', occasion: 'sleeping' }],
          },
          lastUpdated: Date.now(),
        },
      },
    }));

    // Character without a routine
    mockCharacters.push(makeCharacter({ id: 'c7', currentResidenceId: 'res-F' }));

    const count = await updateAllWhereabouts('world-1', 600, 'day', 19);
    expect(count).toBe(2);

    // c6 should follow their routine (bar-1)
    const c6Data = mockUpdatedCharacters.get('c6');
    expect(c6Data.customData.currentWhereabouts.location).toBe('bar-1');

    // c7 should default to residence
    const c7Data = mockUpdatedCharacters.get('c7');
    expect(c7Data.customData.currentWhereabouts.location).toBe('res-F');
    expect(c7Data.customData.currentWhereabouts.locationType).toBe('home');
  });

  it('fills residences at early morning hours (0-5)', async () => {
    mockCharacters.push(makeCharacter({ id: 'c8', currentResidenceId: 'res-G' }));

    const count = await updateAllWhereabouts('world-1', 700, 'night', 3);
    expect(count).toBe(1);

    const data = mockUpdatedCharacters.get('c8');
    expect(data.customData.currentWhereabouts.location).toBe('res-G');
    expect(data.customData.currentWhereabouts.occasion).toBe('sleeping');
  });
});
