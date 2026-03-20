import { describe, it, expect } from 'vitest';
import { generateSeedQuests } from '../services/quest-seed-generator';
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

  it('does not set locationPosition on quests without location references', () => {
    const quests = generateSeedQuests({
      world: makeWorld(),
      characters: CHARACTERS,
      settlements: SETTLEMENTS_WITH_POSITIONS,
      onlyTypes: ['use_vocabulary'],
    });

    // Vocabulary quests don't reference locations
    const vocabOnly = quests.filter(q =>
      !q.objectives?.some((o: any) =>
        o.type === 'visit_location' || o.type === 'discover_location'
      )
    );

    for (const quest of vocabOnly) {
      // These quests may still have locationPosition if they have visit_location sub-objectives
      // but pure vocabulary quests should not
      if (!quest.objectives?.some((o: any) => o.target && SETTLEMENTS_WITH_POSITIONS.some(s => s.name === o.target))) {
        expect(quest.locationPosition).toBeUndefined();
      }
    }
  });
});
