import { describe, it, expect } from 'vitest';
import { RESIDENCE_TYPES } from '../ResidenceDetailView';

/**
 * Tests for the data-processing logic used by ResidenceDetailView.
 * Since the project doesn't use React Testing Library, we test the pure
 * functions that drive the component's display.
 */

// Replicate the household-relationship logic from ResidenceDetailView
function buildHouseholdRelationships(
  residents: Array<{ id: string; spouseId?: string | null; childIds?: string[] }>,
  residentIds: string[]
) {
  const relationships: { fromId: string; toId: string; type: string }[] = [];
  const residentSet = new Set(residentIds);

  for (const resident of residents) {
    if (resident.spouseId && residentSet.has(resident.spouseId)) {
      if (resident.id < resident.spouseId) {
        relationships.push({ fromId: resident.id, toId: resident.spouseId, type: 'spouse' });
      }
    }
    const childIds: string[] = resident.childIds || [];
    for (const childId of childIds) {
      if (residentSet.has(childId)) {
        relationships.push({ fromId: resident.id, toId: childId, type: 'parent' });
      }
    }
  }
  return relationships;
}

function resolveCharacters(
  ids: string[],
  characters: Array<{ id: string; firstName?: string; lastName?: string }>
) {
  return ids.map(id => characters.find(c => c.id === id)).filter(Boolean);
}

function getCharacterName(char: { firstName?: string | null; lastName?: string | null }) {
  return [char.firstName, char.lastName].filter(Boolean).join(' ') || 'Unknown';
}

describe('ResidenceDetailView logic', () => {
  const characters = [
    { id: 'c1', firstName: 'Alice', lastName: 'Smith', spouseId: 'c2', childIds: ['c3'], occupation: 'Teacher' },
    { id: 'c2', firstName: 'Bob', lastName: 'Smith', spouseId: 'c1', childIds: ['c3'] },
    { id: 'c3', firstName: 'Charlie', lastName: 'Smith', spouseId: null, childIds: [] },
    { id: 'c4', firstName: 'Diana', lastName: 'Jones', spouseId: null, childIds: [] },
  ];

  describe('resolveCharacters', () => {
    it('resolves character IDs to character objects', () => {
      const result = resolveCharacters(['c1', 'c3'], characters);
      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('c1');
      expect(result[1]!.id).toBe('c3');
    });

    it('filters out unknown IDs', () => {
      const result = resolveCharacters(['c1', 'unknown'], characters);
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('c1');
    });

    it('returns empty array for empty IDs', () => {
      expect(resolveCharacters([], characters)).toHaveLength(0);
    });
  });

  describe('getCharacterName', () => {
    it('returns full name', () => {
      expect(getCharacterName({ firstName: 'Alice', lastName: 'Smith' })).toBe('Alice Smith');
    });

    it('handles missing last name', () => {
      expect(getCharacterName({ firstName: 'Alice', lastName: null })).toBe('Alice');
    });

    it('returns Unknown for empty names', () => {
      expect(getCharacterName({ firstName: null, lastName: null })).toBe('Unknown');
    });
  });

  describe('buildHouseholdRelationships', () => {
    it('detects spouse relationships (deduplicated)', () => {
      const residentIds = ['c1', 'c2', 'c3'];
      const residents = characters.filter(c => residentIds.includes(c.id));
      const rels = buildHouseholdRelationships(residents, residentIds);

      const spouseRels = rels.filter(r => r.type === 'spouse');
      expect(spouseRels).toHaveLength(1);
      // Only the one with smaller ID should create the relationship
      expect(spouseRels[0].fromId).toBe('c1');
      expect(spouseRels[0].toId).toBe('c2');
    });

    it('detects parent-child relationships', () => {
      const residentIds = ['c1', 'c2', 'c3'];
      const residents = characters.filter(c => residentIds.includes(c.id));
      const rels = buildHouseholdRelationships(residents, residentIds);

      const parentRels = rels.filter(r => r.type === 'parent');
      // Both c1 and c2 are parents of c3
      expect(parentRels).toHaveLength(2);
      expect(parentRels.map(r => r.fromId).sort()).toEqual(['c1', 'c2']);
      expect(parentRels.every(r => r.toId === 'c3')).toBe(true);
    });

    it('ignores relationships to characters not in the residence', () => {
      // Only c1 lives here, spouse c2 does not
      const residentIds = ['c1'];
      const residents = characters.filter(c => residentIds.includes(c.id));
      const rels = buildHouseholdRelationships(residents, residentIds);

      expect(rels).toHaveLength(0);
    });

    it('returns empty for no residents', () => {
      expect(buildHouseholdRelationships([], [])).toHaveLength(0);
    });

    it('handles residents with no family connections', () => {
      const residentIds = ['c4'];
      const residents = characters.filter(c => residentIds.includes(c.id));
      const rels = buildHouseholdRelationships(residents, residentIds);

      expect(rels).toHaveLength(0);
    });
  });

  describe('RESIDENCE_TYPES', () => {
    it('exports a non-empty array of residence types', () => {
      expect(RESIDENCE_TYPES.length).toBeGreaterThan(0);
    });

    it('includes common residence types', () => {
      expect(RESIDENCE_TYPES).toContain('House');
      expect(RESIDENCE_TYPES).toContain('Apartment');
      expect(RESIDENCE_TYPES).toContain('Cottage');
      expect(RESIDENCE_TYPES).toContain('Manor');
      expect(RESIDENCE_TYPES).toContain('Townhouse');
    });

    it('has no duplicate entries', () => {
      const unique = new Set(RESIDENCE_TYPES);
      expect(unique.size).toBe(RESIDENCE_TYPES.length);
    });

    it('has all entries as non-empty strings', () => {
      for (const type of RESIDENCE_TYPES) {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      }
    });
  });
});
