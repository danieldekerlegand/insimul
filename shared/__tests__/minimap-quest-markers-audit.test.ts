/**
 * Minimap Quest Markers & Waypoint Guidance Audit
 *
 * Verifies:
 * 1. extractObjectiveMarkers generates markers for all active quest objectives
 * 2. Dynamic position resolution fills gaps for objectives without explicit positions
 * 3. Color/shape mapping covers all objective types
 * 4. DynamicQuestWaypointDirector resolves positions via NPC/building/business fallbacks
 * 5. Distance fading is consistent between systems
 * 6. Marker cleanup on quest completion/abandonment
 */

import { describe, it, expect } from 'vitest';
import {
  extractObjectiveMarkers,
  getObjectiveMarkerColor,
  getObjectiveMarkerShape,
  type QuestObjectiveMarker,
} from '../game-engine/logic/QuestMinimapMarkers';
import {
  DynamicQuestWaypointDirector,
  type DirectorQuest,
  type DirectorBuildingEntry,
  type DirectorNpcPosition,
  type WaypointPosition,
} from '../game-engine/logic/DynamicQuestWaypointDirector';
import { computeWaypointAlpha } from '../game-engine/logic/waypointFading';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeQuest(overrides: Partial<any> = {}): any {
  return {
    id: 'q1',
    title: 'Test Quest',
    status: 'active',
    objectives: [],
    ...overrides,
  };
}

function makeObjective(overrides: Partial<any> = {}): any {
  return {
    type: 'visit_location',
    description: 'Test objective',
    completed: false,
    ...overrides,
  };
}

// ── extractObjectiveMarkers ─────────────────────────────────────────────────

describe('extractObjectiveMarkers', () => {
  it('returns no markers for empty quest list', () => {
    expect(extractObjectiveMarkers([])).toEqual([]);
  });

  it('skips non-active quests', () => {
    const quests = [makeQuest({
      status: 'completed',
      objectives: [makeObjective({ locationPosition: { x: 10, y: 0, z: 20 } })],
    })];
    expect(extractObjectiveMarkers(quests)).toEqual([]);
  });

  it('skips completed objectives', () => {
    const quests = [makeQuest({
      objectives: [makeObjective({ completed: true, locationPosition: { x: 10, y: 0, z: 20 } })],
    })];
    expect(extractObjectiveMarkers(quests)).toEqual([]);
  });

  it('produces marker from objective with locationPosition', () => {
    const quests = [makeQuest({
      objectives: [makeObjective({ locationPosition: { x: 100, y: 0, z: 200 } })],
    })];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toEqual({ x: 100, z: 200 });
    expect(markers[0].questId).toBe('q1');
  });

  it('falls back to objective.position when locationPosition missing', () => {
    const quests = [makeQuest({
      objectives: [makeObjective({ position: { x: 50, y: 0, z: 60 } })],
    })];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toEqual({ x: 50, z: 60 });
  });

  it('falls back to quest-level locationPosition', () => {
    const quests = [makeQuest({
      locationPosition: { x: 30, y: 0, z: 40 },
      objectives: [makeObjective({})],
    })];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toEqual({ x: 30, z: 40 });
  });

  it('locationPosition takes precedence over position', () => {
    const quests = [makeQuest({
      objectives: [makeObjective({
        position: { x: 1, y: 0, z: 2 },
        locationPosition: { x: 10, y: 0, z: 20 },
      })],
    })];
    const markers = extractObjectiveMarkers(quests);
    expect(markers[0].position).toEqual({ x: 10, z: 20 });
  });

  it('silently skips objectives without any position when no resolved positions provided', () => {
    const quests = [makeQuest({
      objectives: [makeObjective({ type: 'talk_to_npc' })],
    })];
    expect(extractObjectiveMarkers(quests)).toEqual([]);
  });

  it('uses dynamically resolved positions as final fallback', () => {
    const quests = [makeQuest({
      objectives: [makeObjective({ type: 'talk_to_npc' })],
    })];
    const resolved = new Map([['q1_obj_0', { x: 77, z: 88 }]]);
    const markers = extractObjectiveMarkers(quests, resolved);
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toEqual({ x: 77, z: 88 });
    expect(markers[0].objectiveType).toBe('talk_to_npc');
  });

  it('prefers explicit positions over dynamically resolved', () => {
    const quests = [makeQuest({
      objectives: [makeObjective({
        type: 'talk_to_npc',
        locationPosition: { x: 10, y: 0, z: 20 },
      })],
    })];
    const resolved = new Map([['q1_obj_0', { x: 77, z: 88 }]]);
    const markers = extractObjectiveMarkers(quests, resolved);
    expect(markers[0].position).toEqual({ x: 10, z: 20 });
  });

  it('handles multi-objective quests with mixed position sources', () => {
    const quests = [makeQuest({
      objectives: [
        makeObjective({ type: 'visit_location', locationPosition: { x: 10, y: 0, z: 20 } }),
        makeObjective({ type: 'talk_to_npc' }),  // no position
        makeObjective({ type: 'collect_item', completed: true, locationPosition: { x: 30, y: 0, z: 40 } }),
      ],
    })];
    const resolved = new Map([['q1_obj_1', { x: 55, z: 66 }]]);
    const markers = extractObjectiveMarkers(quests, resolved);
    expect(markers).toHaveLength(2);
    expect(markers[0].objectiveType).toBe('visit_location');
    expect(markers[0].position).toEqual({ x: 10, z: 20 });
    expect(markers[1].objectiveType).toBe('talk_to_npc');
    expect(markers[1].position).toEqual({ x: 55, z: 66 });
  });

  it('produces markers from multiple active quests', () => {
    const quests = [
      makeQuest({ id: 'q1', objectives: [makeObjective({ locationPosition: { x: 10, y: 0, z: 20 } })] }),
      makeQuest({ id: 'q2', objectives: [makeObjective({ type: 'collect_item', locationPosition: { x: 30, y: 0, z: 40 } })] }),
      makeQuest({ id: 'q3', status: 'failed', objectives: [makeObjective({ locationPosition: { x: 50, y: 0, z: 60 } })] }),
    ];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(2);
    expect(markers[0].questId).toBe('q1');
    expect(markers[1].questId).toBe('q2');
  });

  it('marker cleanup: completed objectives removed, active ones remain', () => {
    const quests = [makeQuest({
      objectives: [
        makeObjective({ type: 'visit_location', completed: true, locationPosition: { x: 10, y: 0, z: 20 } }),
        makeObjective({ type: 'talk_to_npc', completed: false, locationPosition: { x: 30, y: 0, z: 40 } }),
      ],
    })];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(1);
    expect(markers[0].objectiveType).toBe('talk_to_npc');
  });

  it('marker cleanup: quest status change to completed removes all markers', () => {
    const questActive = makeQuest({
      objectives: [makeObjective({ locationPosition: { x: 10, y: 0, z: 20 } })],
    });
    expect(extractObjectiveMarkers([questActive])).toHaveLength(1);

    const questCompleted = { ...questActive, status: 'completed' };
    expect(extractObjectiveMarkers([questCompleted])).toHaveLength(0);
  });

  it('marker cleanup: quest status change to failed removes all markers', () => {
    const quest = makeQuest({
      objectives: [makeObjective({ locationPosition: { x: 10, y: 0, z: 20 } })],
    });
    expect(extractObjectiveMarkers([{ ...quest, status: 'failed' }])).toHaveLength(0);
  });
});

// ── getObjectiveMarkerColor ─────────────────────────────────────────────────

describe('getObjectiveMarkerColor', () => {
  const colorMap: Record<string, string[]> = {
    '#00BCD4': ['visit_location', 'discover_location', 'navigate_language', 'follow_directions'],
    '#4CAF50': ['talk_to_npc', 'complete_conversation', 'conversation_initiation', 'build_friendship',
      'give_gift', 'listen_and_repeat', 'ask_for_directions', 'listening_comprehension',
      'introduce_self', 'teach_vocabulary', 'teach_phrase', 'eavesdrop'],
    '#FFD700': ['collect_item', 'deliver_item', 'identify_object', 'collect_vocabulary',
      'examine_object', 'read_sign', 'point_and_name'],
    '#2196F3': ['use_vocabulary', 'pronunciation_check', 'translation_challenge',
      'write_response', 'describe_scene', 'reading_completed', 'listening_completed',
      'grammar_demonstrated', 'answer_question'],
    '#FF9800': ['order_food', 'haggle_price', 'gain_reputation'],
    '#FFC107': ['physical_action', 'observe_activity', 'farm_plant', 'farm_water',
      'farm_harvest', 'fish', 'mine', 'chop_tree', 'gather_herb'],
    '#F44336': ['defeat_enemies'],
    '#009688': ['craft_item'],
    '#9C27B0': ['escort_npc'],
  };

  for (const [expectedColor, types] of Object.entries(colorMap)) {
    for (const t of types) {
      it(`maps ${t} → ${expectedColor}`, () => {
        expect(getObjectiveMarkerColor(t)).toBe(expectedColor);
      });
    }
  }

  it('returns magenta default for unknown types', () => {
    expect(getObjectiveMarkerColor('unknown_type')).toBe('#E040FB');
  });
});

// ── getObjectiveMarkerShape ─────────────────────────────────────────────────

describe('getObjectiveMarkerShape', () => {
  it('location types get diamond shape', () => {
    for (const t of ['visit_location', 'discover_location', 'navigate_language', 'follow_directions']) {
      expect(getObjectiveMarkerShape(t)).toBe('diamond');
    }
  });

  it('non-location types get circle shape', () => {
    for (const t of ['talk_to_npc', 'collect_item', 'defeat_enemies', 'craft_item', 'use_vocabulary']) {
      expect(getObjectiveMarkerShape(t)).toBe('circle');
    }
  });
});

// ── DynamicQuestWaypointDirector ────────────────────────────────────────────

describe('DynamicQuestWaypointDirector', () => {
  let director: DynamicQuestWaypointDirector;
  let buildingData: Map<string, DirectorBuildingEntry>;
  let npcBuildingMap: Map<string, string>;
  let npcPositions: DirectorNpcPosition[];
  const playerPos: WaypointPosition = { x: 0, y: 0, z: 0 };

  function makeDirectorQuest(overrides: Partial<DirectorQuest> = {}): DirectorQuest {
    return {
      id: 'q1',
      title: 'Test Quest',
      status: 'active',
      questType: 'side',
      objectives: [],
      ...overrides,
    };
  }

  beforeEach(() => {
    director = new DynamicQuestWaypointDirector();
    buildingData = new Map();
    npcBuildingMap = new Map();
    npcPositions = [];
  });

  it('resolves explicit objective position', () => {
    const quest = makeDirectorQuest({
      objectives: [{
        id: 'obj1', type: 'visit_location', completed: false,
        position: { x: 10, y: 0, z: 20 },
      }],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].position).toEqual({ x: 10, y: 0, z: 20 });
  });

  it('resolves NPC position by npcId from npcPositions array', () => {
    npcPositions.push({ id: 'npc1', position: { x: 50, y: 0, z: 60 }, name: 'Bob' });
    const quest = makeDirectorQuest({
      objectives: [{
        id: 'obj1', type: 'talk_to_npc', completed: false,
        npcId: 'npc1', npcName: 'Bob',
      }],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].position).toEqual({ x: 50, y: 0, z: 60 });
    expect(waypoints[0].label).toBe('Bob');
  });

  it('resolves NPC position via building map fallback', () => {
    buildingData.set('building1', {
      position: { x: 100, y: 0, z: 200 },
      metadata: { name: 'Bob House' },
    });
    npcBuildingMap.set('npc1', 'building1');
    const quest = makeDirectorQuest({
      objectives: [{
        id: 'obj1', type: 'talk_to_npc', completed: false,
        npcId: 'npc1', npcName: 'Bob',
      }],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].position).toEqual({ x: 100, y: 0, z: 200 });
  });

  it('resolves business-type matching for order_food', () => {
    buildingData.set('biz1', {
      position: { x: 30, y: 0, z: 40 },
      metadata: { name: 'Le Bistro', type: 'restaurant' },
    });
    const quest = makeDirectorQuest({
      objectives: [{
        id: 'obj1', type: 'order_food', completed: false,
      }],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].position).toEqual({ x: 30, y: 0, z: 40 });
  });

  it('resolves conversation-only objectives to nearest NPC', () => {
    npcPositions.push(
      { id: 'npc1', position: { x: 100, y: 0, z: 100 }, name: 'Far NPC' },
      { id: 'npc2', position: { x: 5, y: 0, z: 5 }, name: 'Near NPC' },
    );
    const quest = makeDirectorQuest({
      objectives: [{
        id: 'obj1', type: 'introduce_self', completed: false,
      }],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].position).toEqual({ x: 5, y: 0, z: 5 });
    expect(waypoints[0].label).toBe('Near NPC');
  });

  it('falls back to quest giver NPC', () => {
    npcPositions.push({ id: 'giver1', position: { x: 25, y: 0, z: 35 }, name: 'Quest Giver' });
    const quest = makeDirectorQuest({
      assignedByCharacterId: 'giver1',
      objectives: [{
        id: 'obj1', type: 'defeat_enemies', completed: false,
      }],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].label).toBe('Quest Giver');
  });

  it('skips completed objectives', () => {
    const quest = makeDirectorQuest({
      objectives: [
        { id: 'obj1', type: 'visit_location', completed: true, position: { x: 10, y: 0, z: 20 } },
        { id: 'obj2', type: 'collect_item', completed: false, position: { x: 30, y: 0, z: 40 } },
      ],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].objectiveType).toBe('collect_item');
  });

  it('returns null for unresolvable objectives', () => {
    const quest = makeDirectorQuest({
      objectives: [{
        id: 'obj1', type: 'defeat_enemies', completed: false,
      }],
    });
    const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
    expect(waypoints).toHaveLength(0);
  });

  describe('getCompassData', () => {
    it('returns null for empty waypoints', () => {
      expect(director.getCompassData([], playerPos, 0)).toBeNull();
    });

    it('returns compass data pointing to nearest waypoint', () => {
      const waypoints = [
        { objectiveId: 'far', objectiveType: 'visit_location', position: { x: 100, y: 0, z: 0 } },
        { objectiveId: 'near', objectiveType: 'talk_to_npc', position: { x: 10, y: 0, z: 0 } },
      ];
      const compass = director.getCompassData(waypoints, playerPos, 0);
      expect(compass).not.toBeNull();
      expect(compass!.objectiveType).toBe('talk_to_npc');
      expect(compass!.distance).toBeCloseTo(10, 1);
    });
  });
});

// ── computeWaypointAlpha (shared fading) ────────────────────────────────────

describe('computeWaypointAlpha', () => {
  it('returns 0 when player has arrived (< 3 units)', () => {
    expect(computeWaypointAlpha(0)).toBe(0);
    expect(computeWaypointAlpha(2.9)).toBe(0);
  });

  it('fades in between 3 and 8 units', () => {
    expect(computeWaypointAlpha(3)).toBe(0);
    expect(computeWaypointAlpha(5.5)).toBeCloseTo(0.5, 2);
    expect(computeWaypointAlpha(8)).toBe(1.0);
  });

  it('full visibility between 8 and 150 units', () => {
    expect(computeWaypointAlpha(8)).toBe(1.0);
    expect(computeWaypointAlpha(50)).toBe(1.0);
    expect(computeWaypointAlpha(150)).toBe(1.0);
  });

  it('fades out between 150 and 200 units', () => {
    const alpha175 = computeWaypointAlpha(175);
    expect(alpha175).toBeGreaterThan(0.2);
    expect(alpha175).toBeLessThan(1.0);
  });

  it('returns dim alpha (0.2) beyond 200 units', () => {
    expect(computeWaypointAlpha(200)).toBe(0.2);
    expect(computeWaypointAlpha(500)).toBe(0.2);
  });

  it('DynamicQuestWaypointDirector uses shared fading', () => {
    const director = new DynamicQuestWaypointDirector();
    const playerPos: WaypointPosition = { x: 0, y: 0, z: 0 };
    const waypointPos: WaypointPosition = { x: 50, y: 0, z: 0 };
    expect(director.getDistanceAlpha(playerPos, waypointPos)).toBe(computeWaypointAlpha(50));
  });
});

// ── Integration: marker IDs match Director output ───────────────────────────

describe('Minimap ↔ Director ID consistency', () => {
  it('extractObjectiveMarkers marker IDs match Director objectiveId format', () => {
    const quest = {
      id: 'quest-abc',
      title: 'Test',
      status: 'active' as const,
      objectives: [
        { type: 'visit_location', description: 'Go', completed: false, locationPosition: { x: 10, y: 0, z: 20 } },
        { type: 'talk_to_npc', description: 'Talk', completed: false, locationPosition: { x: 30, y: 0, z: 40 } },
      ],
    };
    const markers = extractObjectiveMarkers([quest as any]);
    expect(markers[0].id).toBe('quest-abc_obj_0');
    expect(markers[1].id).toBe('quest-abc_obj_1');
  });

  it('resolved positions map keys match marker IDs for dynamic fallback', () => {
    const quest = {
      id: 'q99',
      title: 'Test',
      status: 'active' as const,
      objectives: [
        { type: 'talk_to_npc', description: 'Chat', completed: false },
      ],
    };
    const resolved = new Map([['q99_obj_0', { x: 42, z: 99 }]]);
    const markers = extractObjectiveMarkers([quest as any], resolved);
    expect(markers).toHaveLength(1);
    expect(markers[0].id).toBe('q99_obj_0');
    expect(markers[0].position).toEqual({ x: 42, z: 99 });
  });
});
