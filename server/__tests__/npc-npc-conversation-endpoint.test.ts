/**
 * Tests for the NPC-NPC ambient conversation integration.
 * Tests the conversation engine functions used by the endpoint.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initiateConversation,
  selectTopics,
  calculateExchangeCount,
  calculateRelationshipDelta,
  generateFallbackConversation,
  resetRateLimiting,
} from '../services/conversation/npc-conversation-engine';
import type { BigFivePersonality } from '../services/conversation/context-manager';

function makeCharacter(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'npc-1',
    firstName: overrides.firstName ?? 'Alice',
    lastName: overrides.lastName ?? 'Smith',
    worldId: overrides.worldId ?? 'world-1',
    personality: overrides.personality ?? {
      openness: 0.5,
      conscientiousness: 0.3,
      extroversion: 0.4,
      agreeableness: 0.6,
      neuroticism: 0.2,
    },
    occupation: overrides.occupation ?? 'Baker',
    currentLocation: overrides.currentLocation ?? 'town_square',
    relationships: overrides.relationships ?? {},
    gender: overrides.gender ?? 'female',
    birthYear: overrides.birthYear ?? 1990,
  } as any;
}

function makeWorld(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'world-1',
    name: overrides.name ?? 'Testville',
    worldType: overrides.worldType ?? 'medieval',
    currentGameYear: overrides.currentGameYear ?? 1200,
  } as any;
}

function makeMockStorage(chars: any[], world: any, languages: any[] = []) {
  const charMap = new Map<string, any>();
  for (const c of chars) charMap.set(c.id, c);
  return {
    getCharacter: async (id: string) => charMap.get(id),
    getWorld: async (_id: string) => world,
    getCharactersByWorld: async (_wid: string) => chars,
    getWorldLanguagesByWorld: async (_wid: string) => languages,
    getCurrentOccupation: async (_cid: string) => undefined,
    getBusiness: async (_id: string) => undefined,
  };
}

describe('NPC-NPC ambient conversation integration', () => {
  beforeEach(() => {
    resetRateLimiting();
  });

  describe('topic selection with environment', () => {
    const npc1 = makeCharacter({ firstName: 'Alice', occupation: 'Baker' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', occupation: 'Baker' });

    it('boosts weather topic weight in bad weather', () => {
      const clearTopics = selectTopics(npc1, npc2, 0.3, { weather: 'clear' });
      const stormTopics = selectTopics(npc1, npc2, 0.3, { weather: 'storm' });

      const clearWeather = clearTopics.find(t => t.topic === 'weather');
      const stormWeather = stormTopics.find(t => t.topic === 'weather');

      expect(stormWeather!.weight).toBeGreaterThan(clearWeather!.weight);
    });

    it('includes work topic when both have same occupation', () => {
      const topics = selectTopics(npc1, npc2, 0.0);
      const workTopic = topics.find(t => t.topic === 'work');
      expect(workTopic).toBeDefined();
      expect(workTopic!.weight).toBe(1.5);
    });

    it('includes romance only with strong relationship and compatible personality', () => {
      const topics = selectTopics(npc1, npc2, 0.6);
      expect(topics.some(t => t.topic === 'romance')).toBe(true);

      const weakTopics = selectTopics(npc1, npc2, 0.1);
      expect(weakTopics.some(t => t.topic === 'romance')).toBe(false);
    });
  });

  describe('exchange count from personality', () => {
    it('extroverts talk longer', () => {
      const extro: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0.9, agreeableness: 0, neuroticism: 0 };
      const intro: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 0.1, agreeableness: 0, neuroticism: 0 };

      expect(calculateExchangeCount(extro, extro)).toBeGreaterThan(calculateExchangeCount(intro, intro));
    });

    it('returns values in range 3-8', () => {
      const maxExtro: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: 1, agreeableness: 0, neuroticism: 0 };
      const minExtro: BigFivePersonality = { openness: 0, conscientiousness: 0, extroversion: -1, agreeableness: 0, neuroticism: 0 };

      expect(calculateExchangeCount(maxExtro, maxExtro)).toBeLessThanOrEqual(8);
      expect(calculateExchangeCount(minExtro, minExtro)).toBeGreaterThanOrEqual(3);
    });
  });

  describe('relationship delta', () => {
    const p: BigFivePersonality = { openness: 0.5, conscientiousness: 0.3, extroversion: 0.4, agreeableness: 0.6, neuroticism: 0.2 };

    it('positive delta for friendly conversations', () => {
      const delta = calculateRelationshipDelta('daily_greeting', 4, p, p, 0.0);
      expect(delta.friendshipChange).toBeGreaterThan(0);
      expect(delta.trustChange).toBeGreaterThan(0);
    });

    it('negative delta for rivalry', () => {
      const delta = calculateRelationshipDelta('rivalry', 4, p, p, -0.5);
      expect(delta.friendshipChange).toBeLessThan(0);
    });

    it('romance spark only for romance topic', () => {
      const normal = calculateRelationshipDelta('work', 4, p, p, 0.3);
      const romantic = calculateRelationshipDelta('romance', 4, p, p, 0.5);

      expect(normal.romanceSpark).toBe(0);
      expect(romantic.romanceSpark).toBeGreaterThan(0);
    });

    it('caps friendship change at ±0.1', () => {
      const delta = calculateRelationshipDelta('work', 8, p, p, 0.0);
      expect(delta.friendshipChange).toBeGreaterThanOrEqual(-0.1);
      expect(delta.friendshipChange).toBeLessThanOrEqual(0.1);
    });
  });

  describe('fallback conversations', () => {
    const npc1 = makeCharacter({ firstName: 'Alice' });
    const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob' });

    it('produces exchanges for known topics', () => {
      for (const topic of ['greeting', 'work', 'gossip', 'weather']) {
        const exchanges = generateFallbackConversation(npc1, npc2, topic);
        expect(exchanges.length).toBeGreaterThanOrEqual(2);
        expect(exchanges[0].speakerId).toBe(npc1.id);
      }
    });

    it('falls back to default template for unknown topics', () => {
      const exchanges = generateFallbackConversation(npc1, npc2, 'quantum_physics');
      expect(exchanges.length).toBeGreaterThanOrEqual(2);
    });

    it('produces French exchanges when targetLanguage is French', () => {
      const exchanges = generateFallbackConversation(npc1, npc2, 'greeting', 'French');
      expect(exchanges.length).toBeGreaterThanOrEqual(2);
      // French greeting template starts with "Bonjour"
      const allText = exchanges.map(e => e.text).join(' ');
      expect(allText).toContain('Bonjour');
    });

    it('produces English exchanges when no targetLanguage', () => {
      const exchanges = generateFallbackConversation(npc1, npc2, 'greeting');
      expect(exchanges.length).toBeGreaterThanOrEqual(2);
      const allText = exchanges.map(e => e.text).join(' ');
      expect(allText).toContain('Good day');
    });

    it('falls back to English for unsupported languages', () => {
      const exchanges = generateFallbackConversation(npc1, npc2, 'greeting', 'Japanese');
      expect(exchanges.length).toBeGreaterThanOrEqual(2);
      const allText = exchanges.map(e => e.text).join(' ');
      expect(allText).toContain('Good day');
    });
  });

  describe('full conversation flow (no LLM)', () => {
    it('produces complete conversation result', async () => {
      const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
      const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
      const world = makeWorld();
      const storage = makeMockStorage([npc1, npc2], world);

      const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
        storageOverride: storage,
      });

      expect(result.npc1Id).toBe('npc-1');
      expect(result.npc2Id).toBe('npc-2');
      expect(result.worldId).toBe('world-1');
      expect(result.exchanges.length).toBeGreaterThanOrEqual(2);
      expect(result.topic).toBeTruthy();
      expect(result.relationshipDelta).toBeDefined();
      expect(result.relationshipDelta.friendshipChange).toBeDefined();
      expect(result.relationshipDelta.trustChange).toBeDefined();
    });

    it('uses custom topic when provided', async () => {
      const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
      const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
      const world = makeWorld();
      const storage = makeMockStorage([npc1, npc2], world);

      const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
        topic: 'dragon_attack',
        storageOverride: storage,
      });

      expect(result.topic).toBe('dragon_attack');
    });

    it('uses world language when available', async () => {
      const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
      const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
      const world = makeWorld();
      const languages = [{ id: 'l-1', name: 'Chitimacha', worldId: 'world-1' }];
      const storage = makeMockStorage([npc1, npc2], world, languages);

      const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
        storageOverride: storage,
      });

      expect(result.languageUsed).toBe('Chitimacha');
    });

    it('throws when NPC not found', async () => {
      const world = makeWorld();
      const storage = makeMockStorage([], world);

      await expect(
        initiateConversation('missing-1', 'missing-2', 'world-1', { storageOverride: storage })
      ).rejects.toThrow('not found');
    });

    it('respects rate limiting', async () => {
      const chars = Array.from({ length: 8 }, (_, i) => makeCharacter({
        id: `npc-${i}`,
        firstName: `NPC${i}`,
        lastName: 'Test',
      }));
      const world = makeWorld();
      const storage = makeMockStorage(chars, world);

      // Start 3 concurrent conversations (the max)
      const convos = [
        initiateConversation('npc-0', 'npc-1', 'world-1', { storageOverride: storage }),
        initiateConversation('npc-2', 'npc-3', 'world-1', { storageOverride: storage }),
        initiateConversation('npc-4', 'npc-5', 'world-1', { storageOverride: storage }),
      ];

      // 4th should fail
      await expect(
        initiateConversation('npc-6', 'npc-7', 'world-1', { storageOverride: storage })
      ).rejects.toThrow('Rate limit');

      await Promise.allSettled(convos);
    });
  });

  describe('environment-aware conversations', () => {
    it('passes environment context through', async () => {
      const npc1 = makeCharacter({ id: 'npc-1', firstName: 'Alice', lastName: 'Smith' });
      const npc2 = makeCharacter({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
      const world = makeWorld();
      const storage = makeMockStorage([npc1, npc2], world);

      const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
        environment: { weather: 'rain', gameHour: 14, season: 'autumn' },
        storageOverride: storage,
      });

      // Should not throw and should produce valid result
      expect(result.exchanges.length).toBeGreaterThanOrEqual(2);
    });
  });
});
