/**
 * Tests for NPC occupation assignment during world generation.
 * Covers: pickDefaultOccupation, getDefaultOccupationForAge,
 *         and assignDefaultOccupations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock storage ----
const mockStorage = vi.hoisted(() => ({
  getCharactersByWorld: vi.fn(),
  updateCharacter: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

import {
  pickDefaultOccupation,
  getDefaultOccupationForAge,
  assignDefaultOccupations,
} from '../generators/occupation-assignment';

// ---- Helper to make a minimal character-like object ----
function makeChar(overrides: Record<string, any> = {}) {
  return {
    id: 'char-1',
    worldId: 'world-1',
    firstName: 'Test',
    lastName: 'Person',
    gender: 'male',
    birthYear: 1880,
    isAlive: true,
    currentLocation: 'loc-1',
    occupation: null,
    personality: { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 },
    ...overrides,
  } as any;
}

// ---------- getDefaultOccupationForAge ----------
describe('getDefaultOccupationForAge', () => {
  it('returns null for toddlers (age < 6)', () => {
    expect(getDefaultOccupationForAge(0)).toBeNull();
    expect(getDefaultOccupationForAge(3)).toBeNull();
    expect(getDefaultOccupationForAge(5)).toBeNull();
  });

  it('returns Student for children (6-17)', () => {
    expect(getDefaultOccupationForAge(6)).toBe('Student');
    expect(getDefaultOccupationForAge(12)).toBe('Student');
    expect(getDefaultOccupationForAge(17)).toBe('Student');
  });

  it('returns null for working-age adults (18-65)', () => {
    expect(getDefaultOccupationForAge(18)).toBeNull();
    expect(getDefaultOccupationForAge(40)).toBeNull();
    expect(getDefaultOccupationForAge(65)).toBeNull();
  });

  it('returns Retired for elderly (> 65)', () => {
    expect(getDefaultOccupationForAge(66)).toBe('Retired');
    expect(getDefaultOccupationForAge(80)).toBe('Retired');
  });
});

// ---------- pickDefaultOccupation ----------
describe('pickDefaultOccupation', () => {
  it('assigns a terrain-appropriate occupation for plains', () => {
    const character = makeChar();
    const valid = ['Farmer', 'Farmhand', 'Laborer'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(pickDefaultOccupation(character, 'plains'));
    }
  });

  it('assigns mountain-appropriate occupations', () => {
    const character = makeChar();
    const valid = ['Miner', 'Laborer', 'Carpenter', 'Stonecutter'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(pickDefaultOccupation(character, 'mountains'));
    }
  });

  it('assigns forest-appropriate occupations', () => {
    const character = makeChar();
    const valid = ['Carpenter', 'Woodworker', 'Laborer', 'Farmer'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(pickDefaultOccupation(character, 'forest'));
    }
  });

  it('falls back to plains pool for unknown terrain', () => {
    const character = makeChar();
    const valid = ['Farmer', 'Farmhand', 'Laborer'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(pickDefaultOccupation(character, 'swamp'));
    }
  });

  it('uses personality-driven occupation for high openness + extroversion', () => {
    const character = makeChar({
      personality: { openness: 0.8, conscientiousness: 0, extroversion: 0.5, agreeableness: 0, neuroticism: 0 },
    });
    const valid = ['Tailor', 'Painter', 'Baker', 'Barber'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(pickDefaultOccupation(character, 'plains'));
    }
  });

  it('uses personality-driven occupation for high conscientiousness + agreeableness', () => {
    const character = makeChar({
      personality: { openness: 0, conscientiousness: 0.8, extroversion: 0, agreeableness: 0.5, neuroticism: 0 },
    });
    const valid = ['Carpenter', 'Seamstress', 'Shoemaker', 'Baker'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(pickDefaultOccupation(character, 'plains'));
    }
  });

  it('uses terrain pool when personality is neutral', () => {
    const character = makeChar({
      personality: { openness: 0.2, conscientiousness: 0.2, extroversion: 0.1, agreeableness: 0.1, neuroticism: 0 },
    });
    const valid = ['Farmer', 'Farmhand', 'Laborer'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(pickDefaultOccupation(character, 'plains'));
    }
  });
});

// ---------- assignDefaultOccupations ----------
describe('assignDefaultOccupations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStorage.updateCharacter.mockResolvedValue(undefined);
  });

  it('assigns Student to school-age children', async () => {
    mockStorage.getCharactersByWorld.mockResolvedValue([
      makeChar({ id: 'child-1', birthYear: 1892 }), // age 8
    ]);

    const result = await assignDefaultOccupations({ worldId: 'w1', currentYear: 1900, terrain: 'plains' });

    expect(result).toBe(1);
    expect(mockStorage.updateCharacter).toHaveBeenCalledWith('child-1', { occupation: 'Student' });
  });

  it('assigns Retired to elderly characters and sets retired flag', async () => {
    mockStorage.getCharactersByWorld.mockResolvedValue([
      makeChar({ id: 'elder-1', birthYear: 1830 }), // age 70
    ]);

    const result = await assignDefaultOccupations({ worldId: 'w1', currentYear: 1900, terrain: 'plains' });

    expect(result).toBe(1);
    expect(mockStorage.updateCharacter).toHaveBeenCalledWith('elder-1', { occupation: 'Retired', retired: true });
  });

  it('skips toddlers (age < 6)', async () => {
    mockStorage.getCharactersByWorld.mockResolvedValue([
      makeChar({ id: 'baby-1', birthYear: 1897 }), // age 3
    ]);

    const result = await assignDefaultOccupations({ worldId: 'w1', currentYear: 1900, terrain: 'plains' });

    expect(result).toBe(0);
    expect(mockStorage.updateCharacter).not.toHaveBeenCalled();
  });

  it('skips characters that already have an occupation', async () => {
    mockStorage.getCharactersByWorld.mockResolvedValue([
      makeChar({ id: 'emp-1', birthYear: 1870, occupation: 'Owner (Agriculture)' }),
    ]);

    const result = await assignDefaultOccupations({ worldId: 'w1', currentYear: 1900, terrain: 'plains' });

    expect(result).toBe(0);
    expect(mockStorage.updateCharacter).not.toHaveBeenCalled();
  });

  it('skips dead characters', async () => {
    mockStorage.getCharactersByWorld.mockResolvedValue([
      makeChar({ id: 'dead-1', birthYear: 1860, isAlive: false }),
    ]);

    const result = await assignDefaultOccupations({ worldId: 'w1', currentYear: 1900, terrain: 'plains' });

    expect(result).toBe(0);
    expect(mockStorage.updateCharacter).not.toHaveBeenCalled();
  });

  it('assigns terrain-appropriate occupation to working-age adults', async () => {
    mockStorage.getCharactersByWorld.mockResolvedValue([
      makeChar({ id: 'adult-1', birthYear: 1870 }), // age 30
    ]);

    const result = await assignDefaultOccupations({ worldId: 'w1', currentYear: 1900, terrain: 'mountains' });

    expect(result).toBe(1);
    const call = mockStorage.updateCharacter.mock.calls[0];
    expect(call[0]).toBe('adult-1');
    expect(['Miner', 'Laborer', 'Carpenter', 'Stonecutter']).toContain(call[1].occupation);
  });

  it('handles a mixed population correctly', async () => {
    mockStorage.getCharactersByWorld.mockResolvedValue([
      makeChar({ id: 'baby', birthYear: 1898 }),        // age 2 — skip
      makeChar({ id: 'child', birthYear: 1890 }),       // age 10 — Student
      makeChar({ id: 'adult', birthYear: 1865 }),       // age 35 — terrain occupation
      makeChar({ id: 'owner', birthYear: 1860, occupation: 'Owner (Retail)' }), // skip
      makeChar({ id: 'elder', birthYear: 1830 }),       // age 70 — Retired
      makeChar({ id: 'dead', birthYear: 1850, isAlive: false }), // skip
    ]);

    const result = await assignDefaultOccupations({ worldId: 'w1', currentYear: 1900, terrain: 'plains' });

    // child + adult + elder = 3
    expect(result).toBe(3);
    expect(mockStorage.updateCharacter).toHaveBeenCalledTimes(3);

    const childCall = mockStorage.updateCharacter.mock.calls.find((c: any[]) => c[0] === 'child');
    expect(childCall![1]).toEqual({ occupation: 'Student' });

    const elderCall = mockStorage.updateCharacter.mock.calls.find((c: any[]) => c[0] === 'elder');
    expect(elderCall![1]).toEqual({ occupation: 'Retired', retired: true });
  });
});
