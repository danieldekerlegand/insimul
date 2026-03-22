import { describe, it, expect } from 'vitest';

/**
 * Tests for the residence owner/resident display logic used in SettlementHub.
 * Since the project doesn't use React Testing Library, we test the pure
 * functions that drive the component's display.
 */

// Replicate the charNameMap logic from SettlementHub
function buildCharNameMap(
  characters: Array<{ id: string; firstName?: string | null; lastName?: string | null }>
): Map<string, string> {
  const map = new Map<string, string>();
  characters.forEach(c => {
    map.set(c.id, `${c.firstName || ''}${c.lastName ? ` ${c.lastName}` : ''}`.trim() || 'Unknown');
  });
  return map;
}

function getCharName(map: Map<string, string>, id: string): string {
  return map.get(id) || 'Unknown';
}

// Replicate the residence display classification logic
function classifyResidence(residence: { ownerIds?: string[]; residentIds?: string[] }) {
  const ownerIds = residence.ownerIds || [];
  const residentIds = residence.residentIds || [];
  if (ownerIds.length === 0 && residentIds.length === 0) return 'vacant';
  if (ownerIds.length > 0 && residentIds.length > 0) return 'occupied-with-owners';
  if (ownerIds.length > 0) return 'owners-only';
  return 'residents-only';
}

describe('SettlementHub residence owner/resident display', () => {
  const characters = [
    { id: 'c1', firstName: 'Alice', lastName: 'Smith' },
    { id: 'c2', firstName: 'Bob', lastName: 'Jones' },
    { id: 'c3', firstName: 'Charlie', lastName: null },
    { id: 'c4', firstName: null, lastName: null },
  ];

  describe('buildCharNameMap', () => {
    it('builds a map of character IDs to display names', () => {
      const map = buildCharNameMap(characters);
      expect(map.get('c1')).toBe('Alice Smith');
      expect(map.get('c2')).toBe('Bob Jones');
    });

    it('handles missing last name', () => {
      const map = buildCharNameMap(characters);
      expect(map.get('c3')).toBe('Charlie');
    });

    it('falls back to Unknown for missing names', () => {
      const map = buildCharNameMap(characters);
      expect(map.get('c4')).toBe('Unknown');
    });

    it('returns empty map for empty character list', () => {
      const map = buildCharNameMap([]);
      expect(map.size).toBe(0);
    });
  });

  describe('getCharName', () => {
    it('returns the character name from the map', () => {
      const map = buildCharNameMap(characters);
      expect(getCharName(map, 'c1')).toBe('Alice Smith');
    });

    it('returns Unknown for missing character ID', () => {
      const map = buildCharNameMap(characters);
      expect(getCharName(map, 'nonexistent')).toBe('Unknown');
    });
  });

  describe('classifyResidence', () => {
    it('classifies residence with no owners or residents as vacant', () => {
      expect(classifyResidence({ ownerIds: [], residentIds: [] })).toBe('vacant');
    });

    it('classifies residence with undefined arrays as vacant', () => {
      expect(classifyResidence({})).toBe('vacant');
    });

    it('classifies residence with owners and residents', () => {
      expect(classifyResidence({ ownerIds: ['c1'], residentIds: ['c1', 'c2'] })).toBe('occupied-with-owners');
    });

    it('classifies residence with owners only', () => {
      expect(classifyResidence({ ownerIds: ['c1'], residentIds: [] })).toBe('owners-only');
    });

    it('classifies residence with residents only', () => {
      expect(classifyResidence({ ownerIds: [], residentIds: ['c1'] })).toBe('residents-only');
    });
  });

  describe('owner/resident name resolution', () => {
    it('resolves multiple owner names joined by comma', () => {
      const map = buildCharNameMap(characters);
      const ownerIds = ['c1', 'c2'];
      const display = ownerIds.map(id => getCharName(map, id)).join(', ');
      expect(display).toBe('Alice Smith, Bob Jones');
    });

    it('resolves resident names with unknown IDs gracefully', () => {
      const map = buildCharNameMap(characters);
      const residentIds = ['c1', 'missing'];
      const display = residentIds.map(id => getCharName(map, id)).join(', ');
      expect(display).toBe('Alice Smith, Unknown');
    });

    it('handles empty owner/resident arrays', () => {
      const map = buildCharNameMap(characters);
      const display = ([] as string[]).map(id => getCharName(map, id)).join(', ');
      expect(display).toBe('');
    });
  });
});
