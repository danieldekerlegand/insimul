import { describe, it, expect } from 'vitest';
import { generateSeedQuests } from '../../shared/quests/quest-seed-generator.js';

describe('gain_reputation quest seed', () => {
  const world = {
    id: 'world-1',
    name: 'Test World',
    targetLanguage: 'French',
  } as any;

  const characters = [
    { id: 'npc-1', firstName: 'Marie', lastName: 'Dupont', status: 'active' },
    { id: 'npc-2', firstName: 'Jean', lastName: 'Marchand', status: 'active' },
  ] as any[];

  const settlements = [
    { name: 'Coteau-Bas' },
  ] as any[];

  it('generates a gain_reputation quest with factionId and reputationRequired', () => {
    const quests = generateSeedQuests({
      world,
      characters,
      settlements,
      onlyTypes: ['gain_reputation'],
    });

    expect(quests.length).toBeGreaterThanOrEqual(1);
    const quest = quests.find(q => q.title === 'Earn Their Trust');
    expect(quest).toBeDefined();

    const objectives = quest!.objectives as any[];
    expect(objectives).toHaveLength(1);

    const obj = objectives[0];
    expect(obj.type).toBe('gain_reputation');
    expect(obj.factionId).toBe('Coteau-Bas');
    expect(obj.reputationRequired).toBe(10);
    expect(obj.reputationGained).toBe(0);
  });

  it('uses first settlement name as factionId', () => {
    const quests = generateSeedQuests({
      world,
      characters,
      settlements: [{ name: 'Riverside' }] as any[],
      onlyTypes: ['gain_reputation'],
    });

    const obj = (quests[0].objectives as any[])[0];
    expect(obj.factionId).toBe('Riverside');
    expect(obj.description).toContain('Riverside');
  });

  it('falls back to default location when no settlements provided', () => {
    const quests = generateSeedQuests({
      world,
      characters,
      settlements: [],
      onlyTypes: ['gain_reputation'],
    });

    const obj = (quests[0].objectives as any[])[0];
    // Should use one of the fallback location names
    expect(obj.factionId).toBeTruthy();
    expect(obj.reputationRequired).toBe(10);
  });
});
