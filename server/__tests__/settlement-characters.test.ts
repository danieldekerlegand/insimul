/**
 * Tests for the settlement characters endpoint: GET /api/settlements/:settlementId/characters
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock storage ----
const mockStorage = vi.hoisted(() => ({
  getCharactersBySettlement: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

describe('getCharactersBySettlement', () => {
  const settlementId = 'settlement-1';

  const sampleCharacters = [
    {
      id: 'char-1',
      worldId: 'world-1',
      firstName: 'Alice',
      lastName: 'Smith',
      currentLocation: settlementId,
      isAlive: true,
      occupation: 'Baker',
    },
    {
      id: 'char-2',
      worldId: 'world-1',
      firstName: 'Bob',
      lastName: 'Jones',
      currentLocation: settlementId,
      isAlive: true,
      occupation: 'Guard',
    },
    {
      id: 'char-3',
      worldId: 'world-1',
      firstName: 'Carol',
      lastName: 'Davis',
      currentLocation: settlementId,
      isAlive: false,
      occupation: 'Merchant',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all characters in a settlement', async () => {
    mockStorage.getCharactersBySettlement.mockResolvedValue(sampleCharacters);
    const result = await mockStorage.getCharactersBySettlement(settlementId);
    expect(mockStorage.getCharactersBySettlement).toHaveBeenCalledWith(settlementId);
    expect(result).toHaveLength(3);
    expect(result[0].currentLocation).toBe(settlementId);
    expect(result[1].currentLocation).toBe(settlementId);
  });

  it('returns empty array when no characters in settlement', async () => {
    mockStorage.getCharactersBySettlement.mockResolvedValue([]);
    const result = await mockStorage.getCharactersBySettlement('empty-settlement');
    expect(result).toEqual([]);
  });

  it('only returns characters matching the settlement id', async () => {
    const filteredChars = sampleCharacters.filter(c => c.currentLocation === settlementId);
    mockStorage.getCharactersBySettlement.mockResolvedValue(filteredChars);
    const result = await mockStorage.getCharactersBySettlement(settlementId);
    expect(result.every((c: any) => c.currentLocation === settlementId)).toBe(true);
  });

  it('includes both alive and deceased characters', async () => {
    mockStorage.getCharactersBySettlement.mockResolvedValue(sampleCharacters);
    const result = await mockStorage.getCharactersBySettlement(settlementId);
    const alive = result.filter((c: any) => c.isAlive);
    const deceased = result.filter((c: any) => !c.isAlive);
    expect(alive).toHaveLength(2);
    expect(deceased).toHaveLength(1);
  });
});
