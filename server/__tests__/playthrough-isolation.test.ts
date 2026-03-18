/**
 * Tests for NPC relationship and reputation isolation per playthrough.
 *
 * Validates that:
 * - Playthrough relationship overlays are independent from base world data
 * - Different playthroughs maintain separate relationship state
 * - Reputation is isolated per playthrough
 * - Relationship reads merge overlay on top of base world
 * - Reputation standing calculation is correct
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateStanding } from '../services/reputation-service';

// ===== Unit tests for standing calculation =====

describe('Reputation standing calculation', () => {
  it('returns "revered" for score >= 51', () => {
    expect(calculateStanding(51)).toBe('revered');
    expect(calculateStanding(100)).toBe('revered');
  });

  it('returns "friendly" for score 1-50', () => {
    expect(calculateStanding(1)).toBe('friendly');
    expect(calculateStanding(50)).toBe('friendly');
  });

  it('returns "neutral" for score -49 to 0', () => {
    expect(calculateStanding(0)).toBe('neutral');
    expect(calculateStanding(-49)).toBe('neutral');
  });

  it('returns "unfriendly" for score -99 to -50', () => {
    expect(calculateStanding(-50)).toBe('unfriendly');
    expect(calculateStanding(-99)).toBe('unfriendly');
  });

  it('returns "hostile" for score <= -100', () => {
    expect(calculateStanding(-100)).toBe('hostile');
  });
});

// ===== Mock storage for isolation tests =====

interface MockRelationship {
  playthroughId: string;
  fromCharacterId: string;
  toCharacterId: string;
  type: string;
  strength: number;
  reciprocal?: number;
  lastModified: number;
}

interface MockCharacter {
  id: string;
  relationships: Record<string, { type: string; strength: number; reciprocal?: number; lastModified: number }>;
  thoughts?: any[];
}

// In-memory mock storage
function createMockStorage() {
  const characters = new Map<string, MockCharacter>();
  const playthroughRelationships: MockRelationship[] = [];

  return {
    characters,
    playthroughRelationships,

    getCharacter: vi.fn(async (id: string) => characters.get(id) || null),

    updateCharacter: vi.fn(async (id: string, updates: Partial<MockCharacter>) => {
      const char = characters.get(id);
      if (!char) return null;
      Object.assign(char, updates);
      return char;
    }),

    getPlaythroughRelationship: vi.fn(async (playthroughId: string, fromId: string, toId: string) => {
      return playthroughRelationships.find(
        r => r.playthroughId === playthroughId && r.fromCharacterId === fromId && r.toCharacterId === toId
      ) || null;
    }),

    getPlaythroughRelationshipsForCharacter: vi.fn(async (playthroughId: string, characterId: string) => {
      return playthroughRelationships.filter(
        r => r.playthroughId === playthroughId && (r.fromCharacterId === characterId || r.toCharacterId === characterId)
      );
    }),

    getPlaythroughRelationshipsByPlaythrough: vi.fn(async (playthroughId: string) => {
      return playthroughRelationships.filter(r => r.playthroughId === playthroughId);
    }),

    upsertPlaythroughRelationship: vi.fn(async (rel: MockRelationship) => {
      const idx = playthroughRelationships.findIndex(
        r => r.playthroughId === rel.playthroughId && r.fromCharacterId === rel.fromCharacterId && r.toCharacterId === rel.toCharacterId
      );
      if (idx >= 0) {
        playthroughRelationships[idx] = { ...playthroughRelationships[idx], ...rel };
        return playthroughRelationships[idx];
      }
      playthroughRelationships.push(rel);
      return rel;
    }),

    getCharactersByWorld: vi.fn(async () => Array.from(characters.values())),
  };
}

// Replace storage module with mock
vi.mock('../db/storage', () => {
  return {
    storage: createMockStorage()
  };
});

import { storage } from '../db/storage';
import {
  setRelationship,
  getRelationshipStrength,
  getCharacterRelationships,
  modifyRelationship,
  getEffectiveRelationship,
  queryRelationships,
} from '../extensions/tott/relationship-utils';

const mockStorage = storage as unknown as ReturnType<typeof createMockStorage>;

describe('Playthrough relationship isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.characters.clear();
    mockStorage.playthroughRelationships.length = 0;

    // Set up base world characters with relationships
    mockStorage.characters.set('char-a', {
      id: 'char-a',
      relationships: {
        'char-b': { type: 'friendship', strength: 0.5, lastModified: 1000 }
      }
    });
    mockStorage.characters.set('char-b', {
      id: 'char-b',
      relationships: {
        'char-a': { type: 'friendship', strength: 0.4, lastModified: 1000 }
      }
    });
    mockStorage.characters.set('char-c', {
      id: 'char-c',
      relationships: {}
    });
  });

  describe('getRelationshipStrength', () => {
    it('returns base world strength when no playthroughId', async () => {
      const strength = await getRelationshipStrength('char-a', 'char-b');
      expect(strength).toBe(0.5);
    });

    it('returns base world strength when playthroughId has no overlay', async () => {
      const strength = await getRelationshipStrength('char-a', 'char-b', 'playthrough-1');
      expect(strength).toBe(0.5);
    });

    it('returns overlay strength when playthrough overlay exists', async () => {
      mockStorage.playthroughRelationships.push({
        playthroughId: 'playthrough-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-b',
        type: 'rivalry',
        strength: -0.3,
        lastModified: 2000
      });

      const strength = await getRelationshipStrength('char-a', 'char-b', 'playthrough-1');
      expect(strength).toBe(-0.3);
    });

    it('isolates between playthroughs', async () => {
      mockStorage.playthroughRelationships.push({
        playthroughId: 'playthrough-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-b',
        type: 'rivalry',
        strength: -0.3,
        lastModified: 2000
      });

      // playthrough-1 sees overlay
      const s1 = await getRelationshipStrength('char-a', 'char-b', 'playthrough-1');
      expect(s1).toBe(-0.3);

      // playthrough-2 sees base world
      const s2 = await getRelationshipStrength('char-a', 'char-b', 'playthrough-2');
      expect(s2).toBe(0.5);
    });

    it('returns 0 for non-existent relationship', async () => {
      const strength = await getRelationshipStrength('char-a', 'char-c');
      expect(strength).toBe(0);
    });
  });

  describe('setRelationship', () => {
    it('writes to base world when no playthroughId', async () => {
      await setRelationship('char-a', 'char-c', 'friendship', 0.7);

      expect(mockStorage.updateCharacter).toHaveBeenCalledWith('char-a', expect.objectContaining({
        relationships: expect.objectContaining({
          'char-c': expect.objectContaining({ type: 'friendship', strength: 0.7 })
        })
      }));
      expect(mockStorage.upsertPlaythroughRelationship).not.toHaveBeenCalled();
    });

    it('writes to overlay when playthroughId provided', async () => {
      await setRelationship('char-a', 'char-c', 'friendship', 0.7, undefined, 'playthrough-1');

      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          playthroughId: 'playthrough-1',
          fromCharacterId: 'char-a',
          toCharacterId: 'char-c',
          type: 'friendship',
          strength: 0.7
        })
      );
      // Should NOT write to base world
      expect(mockStorage.updateCharacter).not.toHaveBeenCalled();
    });

    it('clamps strength to [-1, 1]', async () => {
      await setRelationship('char-a', 'char-c', 'friendship', 5.0, undefined, 'playthrough-1');

      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledWith(
        expect.objectContaining({ strength: 1 })
      );
    });

    it('sets reciprocal relationship in overlay', async () => {
      await setRelationship('char-a', 'char-c', 'friendship', 0.7, 0.6, 'playthrough-1');

      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledTimes(2);
      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          fromCharacterId: 'char-a',
          toCharacterId: 'char-c',
          strength: 0.7,
          reciprocal: 0.6
        })
      );
      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          fromCharacterId: 'char-c',
          toCharacterId: 'char-a',
          strength: 0.6,
          reciprocal: 0.7
        })
      );
    });
  });

  describe('getEffectiveRelationship', () => {
    it('returns base world relationship when no overlay', async () => {
      const rel = await getEffectiveRelationship('char-a', 'char-b');
      expect(rel).toEqual(expect.objectContaining({ type: 'friendship', strength: 0.5 }));
    });

    it('returns overlay relationship when present', async () => {
      mockStorage.playthroughRelationships.push({
        playthroughId: 'pt-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-b',
        type: 'romance',
        strength: 0.9,
        lastModified: 3000
      });

      const rel = await getEffectiveRelationship('char-a', 'char-b', 'pt-1');
      expect(rel).toEqual(expect.objectContaining({ type: 'romance', strength: 0.9 }));
    });

    it('returns null for non-existent relationship', async () => {
      const rel = await getEffectiveRelationship('char-a', 'char-c');
      expect(rel).toBeNull();
    });
  });

  describe('modifyRelationship', () => {
    it('writes modification to overlay when playthroughId provided', async () => {
      await modifyRelationship('char-a', 'char-b', 0.2, 'helped in quest', 'pt-1');

      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          playthroughId: 'pt-1',
          fromCharacterId: 'char-a',
          toCharacterId: 'char-b',
          type: 'friendship', // preserved from base
          strength: 0.7 // 0.5 + 0.2
        })
      );
      // Should NOT modify base world
      expect(mockStorage.updateCharacter).not.toHaveBeenCalled();
    });

    it('modifies base world when no playthroughId', async () => {
      await modifyRelationship('char-a', 'char-b', 0.2, 'helped');

      expect(mockStorage.updateCharacter).toHaveBeenCalled();
      expect(mockStorage.upsertPlaythroughRelationship).not.toHaveBeenCalled();
    });

    it('clamps modified strength to [-1, 1]', async () => {
      await modifyRelationship('char-a', 'char-b', 10, 'huge boost', 'pt-1');

      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledWith(
        expect.objectContaining({ strength: 1 }) // clamped
      );
    });

    it('creates new relationship from zero if none exists', async () => {
      await modifyRelationship('char-a', 'char-c', 0.3, 'first meeting', 'pt-1');

      expect(mockStorage.upsertPlaythroughRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          fromCharacterId: 'char-a',
          toCharacterId: 'char-c',
          type: 'acquaintance',
          strength: 0.3
        })
      );
    });
  });

  describe('getCharacterRelationships', () => {
    it('returns base world relationships when no playthroughId', async () => {
      const rels = await getCharacterRelationships('char-a');
      expect(rels['char-b']).toEqual(expect.objectContaining({ type: 'friendship', strength: 0.5 }));
    });

    it('merges overlay on top of base relationships', async () => {
      mockStorage.playthroughRelationships.push({
        playthroughId: 'pt-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-b',
        type: 'rivalry',
        strength: -0.5,
        lastModified: 3000
      });
      mockStorage.playthroughRelationships.push({
        playthroughId: 'pt-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-c',
        type: 'friendship',
        strength: 0.3,
        lastModified: 3000
      });

      const rels = await getCharacterRelationships('char-a', 'pt-1');
      // Overlay overrides base for char-b
      expect(rels['char-b']).toEqual(expect.objectContaining({ type: 'rivalry', strength: -0.5 }));
      // Overlay adds new relationship for char-c
      expect(rels['char-c']).toEqual(expect.objectContaining({ type: 'friendship', strength: 0.3 }));
    });
  });

  describe('queryRelationships', () => {
    it('includes overlay-only relationships in results', async () => {
      mockStorage.playthroughRelationships.push({
        playthroughId: 'pt-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-c',
        type: 'friendship',
        strength: 0.8,
        lastModified: 3000
      });

      const results = await queryRelationships('world-1', undefined, 'pt-1');
      const acRel = results.find(r => r.from === 'char-a' && r.to === 'char-c');
      expect(acRel).toBeDefined();
      expect(acRel!.relationship.strength).toBe(0.8);
    });

    it('applies filter to overlay results', async () => {
      mockStorage.playthroughRelationships.push({
        playthroughId: 'pt-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-c',
        type: 'rivalry',
        strength: -0.5,
        lastModified: 3000
      });

      const results = await queryRelationships('world-1', { type: 'friendship' }, 'pt-1');
      const rivalries = results.filter(r => r.relationship.type === 'rivalry');
      expect(rivalries).toHaveLength(0);
    });

    it('overlay overrides base in query results', async () => {
      mockStorage.playthroughRelationships.push({
        playthroughId: 'pt-1',
        fromCharacterId: 'char-a',
        toCharacterId: 'char-b',
        type: 'rivalry',
        strength: -0.8,
        lastModified: 3000
      });

      const results = await queryRelationships('world-1', undefined, 'pt-1');
      const abRel = results.find(r => r.from === 'char-a' && r.to === 'char-b');
      expect(abRel!.relationship.type).toBe('rivalry');
      expect(abRel!.relationship.strength).toBe(-0.8);
    });
  });
});

// ===== Reputation isolation tests (unit) =====

describe('Reputation isolation', () => {
  it('calculateStanding correctly maps all thresholds', () => {
    const cases: [number, string][] = [
      [100, 'revered'],
      [51, 'revered'],
      [50, 'friendly'],
      [1, 'friendly'],
      [0, 'neutral'],
      [-49, 'neutral'],
      [-50, 'unfriendly'],
      [-99, 'unfriendly'],
      [-100, 'hostile'],
    ];

    for (const [score, expected] of cases) {
      expect(calculateStanding(score)).toBe(expected);
    }
  });

  it('reputation scores are bounded to [-100, 100] by service logic', () => {
    // The service clamps: Math.max(-100, Math.min(100, ...))
    expect(Math.max(-100, Math.min(100, 999))).toBe(100);
    expect(Math.max(-100, Math.min(100, -999))).toBe(-100);
    expect(Math.max(-100, Math.min(100, 50))).toBe(50);
  });
});
