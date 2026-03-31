import { describe, it, expect } from 'vitest';
import { generateSeedQuests } from '../../shared/quests/quest-seed-generator.js';
import type { World, Character, Settlement } from '../../shared/schema';

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    id: 'world-1',
    name: 'Test World',
    targetLanguage: 'French',
    ...overrides,
  } as World;
}

function makeSettlement(name: string, boundaryPolygon: Array<{ x: number; z: number }>, elevation = 0): Settlement {
  return {
    id: `settlement-${name}`,
    worldId: 'world-1',
    name,
    settlementType: 'town',
    boundaryPolygon,
    elevation,
  } as unknown as Settlement;
}

function makeCharacter(firstName: string, lastName: string): Character {
  return {
    id: `char-${firstName}`,
    worldId: 'world-1',
    firstName,
    lastName,
    status: 'active',
  } as Character;
}

const SETTLEMENTS_WITH_POSITIONS = [
  makeSettlement('Market Square', [
    { x: 0, z: 0 },
    { x: 10, z: 0 },
    { x: 10, z: 10 },
    { x: 0, z: 10 },
  ], 5),
  makeSettlement('Harbor District', [
    { x: 20, z: 20 },
    { x: 30, z: 20 },
    { x: 30, z: 30 },
    { x: 20, z: 30 },
  ], 0),
  makeSettlement('Old Town', [
    { x: -10, z: -10 },
    { x: 0, z: -10 },
    { x: 0, z: 0 },
    { x: -10, z: 0 },
  ], 10),
];

const CHARACTERS = [
  makeCharacter('Marie', 'Dupont'),
  makeCharacter('Jean', 'Martin'),
];

describe('quest seed generator — locationPosition', () => {
  it('sets locationPosition on quests that reference locations', () => {
    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: SETTLEMENTS_WITH_POSITIONS,
    });

    // Find quests with visit_location objectives
    const locationQuests = quests.filter(q =>
      q.objectives?.some((o: any) => o.type === 'visit_location' || o.type === 'discover_location')
    );

    expect(locationQuests.length).toBeGreaterThan(0);

    for (const quest of locationQuests) {
      expect(quest.locationName).toBeTruthy();
      expect(quest.locationPosition).toBeDefined();
      expect(quest.locationPosition).toHaveProperty('x');
      expect(quest.locationPosition).toHaveProperty('y');
      expect(quest.locationPosition).toHaveProperty('z');
    }
  });

  it('sets locationPosition on individual objectives that reference locations', () => {
    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: SETTLEMENTS_WITH_POSITIONS,
    });

    const visitQuest = quests.find(q =>
      q.objectives?.some((o: any) => o.type === 'visit_location')
    );
    expect(visitQuest).toBeDefined();

    const visitObj = visitQuest!.objectives!.find((o: any) => o.type === 'visit_location');
    expect(visitObj.locationPosition).toBeDefined();
    expect(typeof visitObj.locationPosition.x).toBe('number');
    expect(typeof visitObj.locationPosition.z).toBe('number');
  });

  it('computes correct center position from boundary polygon', () => {
    // Use a single settlement so we know exactly which one gets picked
    const singleSettlement = [
      makeSettlement('Market Square', [
        { x: 0, z: 0 },
        { x: 10, z: 0 },
        { x: 10, z: 10 },
        { x: 0, z: 10 },
      ], 5),
    ];

    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: singleSettlement,
      onlyTypes: ['visit_location'],
    });

    const marketQuest = quests.find(q =>
      q.objectives?.some((o: any) => o.target === 'Market Square')
    );

    expect(marketQuest).toBeDefined();
    // Center of (0,0), (10,0), (10,10), (0,10) = (5, 5), elevation = 5
    expect(marketQuest!.locationPosition).toEqual({ x: 5, y: 5, z: 5 });
  });

  it('enriches navigation waypoints with positions', () => {
    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: SETTLEMENTS_WITH_POSITIONS,
      onlyTypes: ['navigate_language'],
    });

    const navQuest = quests.find(q =>
      q.objectives?.some((o: any) => o.type === 'navigate_language')
    );
    expect(navQuest).toBeDefined();

    const navObj = navQuest!.objectives!.find((o: any) => o.type === 'navigate_language');
    expect(navObj.navigationWaypoints).toBeDefined();

    for (const wp of navObj.navigationWaypoints) {
      expect(wp.locationPosition).toBeDefined();
      expect(typeof wp.locationPosition.x).toBe('number');
    }
  });

  it('enriches direction steps with positions', () => {
    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: SETTLEMENTS_WITH_POSITIONS,
      onlyTypes: ['follow_directions'],
    });

    const dirQuest = quests.find(q =>
      q.objectives?.some((o: any) => o.type === 'follow_directions')
    );
    expect(dirQuest).toBeDefined();

    const dirObj = dirQuest!.objectives!.find((o: any) => o.type === 'follow_directions');
    expect(dirObj.directionSteps).toBeDefined();

    for (const step of dirObj.directionSteps) {
      expect(step.locationPosition).toBeDefined();
      expect(typeof step.locationPosition.x).toBe('number');
    }
  });

  it('handles settlements without boundary polygon gracefully', () => {
    const emptySettlements = [
      { id: 's1', worldId: 'world-1', name: 'Ghost Town', settlementType: 'town' } as unknown as Settlement,
    ];

    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: emptySettlements,
      onlyTypes: ['visit_location'],
    });

    // Should still generate quests, just without position data
    expect(quests.length).toBeGreaterThan(0);

    for (const quest of quests) {
      // locationPosition should not be set when no boundary polygon exists
      expect(quest.locationPosition).toBeUndefined();
    }
  });

  it('every seed objective gets a locationPosition fallback when settlements exist', () => {
    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: SETTLEMENTS_WITH_POSITIONS,
    });

    // Filter to seed quests only (exclude assessment quests added at the end)
    const seedQuests = quests.filter(q => q.tags?.includes('seed'));

    expect(seedQuests.length).toBeGreaterThan(0);

    for (const quest of seedQuests) {
      for (const obj of (quest.objectives ?? []) as any[]) {
        expect(obj.locationPosition).toBeDefined();
        expect(typeof obj.locationPosition.x).toBe('number');
        expect(typeof obj.locationPosition.z).toBe('number');
      }
    }
  });

  it('objectives without explicit location get a fallback position', () => {
    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: SETTLEMENTS_WITH_POSITIONS,
      onlyTypes: ['talk_to_npc'],
    });

    // Filter to seed quests only
    const seedQuests = quests.filter(q => q.tags?.includes('seed'));
    expect(seedQuests.length).toBeGreaterThan(0);

    for (const quest of seedQuests) {
      for (const obj of (quest.objectives ?? []) as any[]) {
        // talk_to_npc objectives don't reference locations directly,
        // but should still get a fallback locationPosition
        expect(obj.locationPosition).toBeDefined();
        expect(typeof obj.locationPosition.x).toBe('number');
      }
    }
  });

  it('does not set fallback locationPosition when no settlements have positions', () => {
    const emptySettlements = [
      { id: 's1', worldId: 'world-1', name: 'Ghost Town', settlementType: 'town' } as unknown as Settlement,
    ];

    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: emptySettlements,
      onlyTypes: ['use_vocabulary'],
    });

    expect(quests.length).toBeGreaterThan(0);

    for (const quest of quests) {
      for (const obj of (quest.objectives ?? []) as any[]) {
        // No settlement has a boundary polygon, so no positions available
        expect(obj.locationPosition).toBeUndefined();
      }
    }
  });
});
