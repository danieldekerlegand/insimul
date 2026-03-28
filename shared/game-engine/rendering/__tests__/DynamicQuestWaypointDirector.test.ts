/**
 * Tests for DynamicQuestWaypointDirector
 *
 * Verifies dynamic waypoint resolution for quest objectives including:
 * - Explicit position resolution
 * - NPC-based position lookup
 * - Business-type matching
 * - Conversation-only nearest NPC fallback
 * - Compass data calculation
 * - Distance-based alpha fading
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DynamicQuestWaypointDirector,
  type DirectorQuest,
  type DirectorBuildingEntry,
  type DirectorNpcPosition,
  type WaypointPosition,
} from '../../logic/DynamicQuestWaypointDirector';

describe('DynamicQuestWaypointDirector', () => {
  let director: DynamicQuestWaypointDirector;
  let buildingData: Map<string, DirectorBuildingEntry>;
  let npcBuildingMap: Map<string, string>;
  let npcPositions: DirectorNpcPosition[];
  const playerPos: WaypointPosition = { x: 0, y: 0, z: 0 };

  beforeEach(() => {
    director = new DynamicQuestWaypointDirector();

    buildingData = new Map([
      ['building_restaurant', {
        position: { x: 50, y: 0, z: 50 },
        metadata: { name: 'Le Bistro', type: 'restaurant', businessType: 'restaurant' },
      }],
      ['building_shop', {
        position: { x: -30, y: 0, z: 20 },
        metadata: { name: 'General Store', type: 'shop', businessType: 'shop', ownerId: 'npc_shopkeeper' },
      }],
      ['building_forge', {
        position: { x: 80, y: 0, z: -10 },
        metadata: { name: 'The Forge', type: 'workshop', businessType: 'forge' },
      }],
    ]);

    npcBuildingMap = new Map([
      ['npc_chef', 'building_restaurant'],
      ['npc_shopkeeper', 'building_shop'],
    ]);

    npcPositions = [
      { id: 'npc_chef', position: { x: 52, y: 0, z: 48 }, role: 'cook', name: 'Pierre' },
      { id: 'npc_shopkeeper', position: { x: -28, y: 0, z: 22 }, role: 'merchant', name: 'Marie' },
      { id: 'npc_villager', position: { x: 10, y: 0, z: 5 }, role: 'villager', name: 'Jean' },
    ];
  });

  describe('resolveWaypoints', () => {
    it('resolves objectives with explicit positions', () => {
      const quest: DirectorQuest = {
        id: 'q1', title: 'Visit Location', status: 'active', questType: 'exploration',
        objectives: [{
          id: 'obj1', type: 'visit_location', completed: false,
          locationPosition: { x: 100, y: 0, z: 100 },
          locationName: 'Town Square',
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 100, y: 0, z: 100 });
      expect(waypoints[0].objectiveType).toBe('visit_location');
      expect(waypoints[0].label).toBe('Town Square');
    });

    it('resolves NPC-based objectives from NPC positions', () => {
      const quest: DirectorQuest = {
        id: 'q2', title: 'Talk to Chef', status: 'active', questType: 'conversation',
        objectives: [{
          id: 'obj1', type: 'talk_to_npc', completed: false,
          npcId: 'npc_chef', npcName: 'Pierre',
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 52, y: 0, z: 48 });
      expect(waypoints[0].label).toBe('Pierre');
    });

    it('falls back to building position when NPC not in npcPositions', () => {
      const quest: DirectorQuest = {
        id: 'q3', title: 'Talk to Missing NPC', status: 'active', questType: 'conversation',
        objectives: [{
          id: 'obj1', type: 'talk_to_npc', completed: false,
          npcId: 'npc_chef', npcName: 'Pierre',
        }],
      };

      // Remove chef from live positions
      const filteredPositions = npcPositions.filter(n => n.id !== 'npc_chef');

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, filteredPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      // Falls back to building position
      expect(waypoints[0].position).toEqual({ x: 50, y: 0, z: 50 });
    });

    it('resolves business-type objectives (order_food → restaurant)', () => {
      const quest: DirectorQuest = {
        id: 'q4', title: 'Lunch Order', status: 'active', questType: 'commerce',
        objectives: [{
          id: 'obj1', type: 'order_food', completed: false,
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 50, y: 0, z: 50 });
      expect(waypoints[0].label).toBe('Le Bistro');
    });

    it('resolves haggle_price to shop building', () => {
      const quest: DirectorQuest = {
        id: 'q5', title: 'Bargain Hunter', status: 'active', questType: 'commerce',
        objectives: [{
          id: 'obj1', type: 'haggle_price', completed: false,
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: -30, y: 0, z: 20 });
    });

    it('resolves craft_item to workshop/forge', () => {
      const quest: DirectorQuest = {
        id: 'q6', title: 'First Craft', status: 'active', questType: 'crafting',
        objectives: [{
          id: 'obj1', type: 'craft_item', completed: false,
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 80, y: 0, z: -10 });
    });

    it('resolves conversation-only objectives to nearest NPC', () => {
      const quest: DirectorQuest = {
        id: 'q7', title: 'Have a Chat', status: 'active', questType: 'conversation',
        objectives: [{
          id: 'obj1', type: 'complete_conversation', completed: false,
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      // Nearest NPC to playerPos(0,0,0) is Jean at (10,0,5)
      expect(waypoints[0].position).toEqual({ x: 10, y: 0, z: 5 });
      expect(waypoints[0].label).toBe('Jean');
    });

    it('skips completed objectives', () => {
      const quest: DirectorQuest = {
        id: 'q8', title: 'Multi-step', status: 'active', questType: 'exploration',
        objectives: [
          { id: 'obj1', type: 'visit_location', completed: true, locationPosition: { x: 10, y: 0, z: 10 } },
          { id: 'obj2', type: 'talk_to_npc', completed: false, npcId: 'npc_chef', npcName: 'Pierre' },
        ],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].objectiveType).toBe('talk_to_npc');
    });

    it('handles quests with no resolvable positions gracefully', () => {
      const quest: DirectorQuest = {
        id: 'q9', title: 'Mystery Quest', status: 'active', questType: 'unknown',
        objectives: [{
          id: 'obj1', type: 'defeat_enemies', completed: false,
        }],
      };

      const emptyBuildings = new Map<string, DirectorBuildingEntry>();
      const emptyNpcMap = new Map<string, string>();

      const waypoints = director.resolveWaypoints(quest, emptyBuildings, emptyNpcMap, [], playerPos);
      expect(waypoints).toHaveLength(0);
    });

    it('resolves completionCriteria objectives', () => {
      const quest: DirectorQuest = {
        id: 'q10', title: 'Criteria Quest', status: 'active', questType: 'exploration',
        completionCriteria: {
          objectives: [{
            id: 'crit1', type: 'visit_location', completed: false,
            position: { x: 200, y: 0, z: 200 },
          }],
        },
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 200, y: 0, z: 200 });
    });

    it('resolves escort destination position', () => {
      const quest: DirectorQuest = {
        id: 'q11', title: 'Escort Quest', status: 'active', questType: 'escort',
        objectives: [{
          id: 'obj1', type: 'escort_npc', completed: false,
          destinationPosition: { x: 300, y: 0, z: 300 },
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 300, y: 0, z: 300 });
      expect(waypoints[0].label).toBe('Destination');
    });

    it('falls back to quest giver NPC when no other position available', () => {
      const quest: DirectorQuest = {
        id: 'q12', title: 'Quest From Chef', status: 'active', questType: 'collection',
        assignedByCharacterId: 'npc_chef',
        objectives: [{
          id: 'obj1', type: 'collect_item', completed: false,
          itemName: 'Rare Herb',
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 52, y: 0, z: 48 });
      expect(waypoints[0].label).toBe('Quest Giver');
    });

    it('resolves location name from building metadata', () => {
      const quest: DirectorQuest = {
        id: 'q13', title: 'Visit Forge', status: 'active', questType: 'exploration',
        objectives: [{
          id: 'obj1', type: 'visit_location', completed: false,
          locationName: 'The Forge',
        }],
      };

      const waypoints = director.resolveWaypoints(quest, buildingData, npcBuildingMap, npcPositions, playerPos);
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0].position).toEqual({ x: 80, y: 0, z: -10 });
    });
  });

  describe('getCompassData', () => {
    it('returns null for empty waypoints', () => {
      const result = director.getCompassData([], playerPos, 0);
      expect(result).toBeNull();
    });

    it('points to nearest waypoint', () => {
      const waypoints = [
        { objectiveId: 'far', objectiveType: 'visit_location', position: { x: 100, y: 0, z: 0 } },
        { objectiveId: 'near', objectiveType: 'talk_to_npc', position: { x: 10, y: 0, z: 0 }, label: 'Pierre' },
      ];

      const result = director.getCompassData(waypoints, playerPos, 0);
      expect(result).not.toBeNull();
      expect(result!.distance).toBeCloseTo(10, 0);
      expect(result!.label).toBe('Pierre');
      expect(result!.objectiveType).toBe('talk_to_npc');
    });

    it('calculates correct angle when target is to the right', () => {
      const waypoints = [
        { objectiveId: 'wp1', objectiveType: 'visit_location', position: { x: 10, y: 0, z: 0 } },
      ];

      // Player facing north (z+), target is to the east (x+)
      const result = director.getCompassData(waypoints, playerPos, 0);
      expect(result).not.toBeNull();
      // atan2(10, 0) = PI/2, relative to forward angle 0
      expect(result!.angle).toBeCloseTo(Math.PI / 2, 1);
    });

    it('calculates correct angle when target is straight ahead', () => {
      const waypoints = [
        { objectiveId: 'wp1', objectiveType: 'visit_location', position: { x: 0, y: 0, z: 10 } },
      ];

      // Player facing north (forward angle = 0)
      const result = director.getCompassData(waypoints, playerPos, 0);
      expect(result).not.toBeNull();
      expect(result!.angle).toBeCloseTo(0, 1);
    });

    it('calculates correct angle when target is behind', () => {
      const waypoints = [
        { objectiveId: 'wp1', objectiveType: 'visit_location', position: { x: 0, y: 0, z: -10 } },
      ];

      // Player facing north, target is south
      const result = director.getCompassData(waypoints, playerPos, 0);
      expect(result).not.toBeNull();
      expect(Math.abs(result!.angle)).toBeCloseTo(Math.PI, 1);
    });
  });

  describe('getDistanceAlpha', () => {
    it('returns 0 when very close (< 3)', () => {
      expect(director.getDistanceAlpha(playerPos, { x: 1, y: 0, z: 1 })).toBe(0);
    });

    it('fades in between 3 and 8 units', () => {
      const alpha = director.getDistanceAlpha(playerPos, { x: 5, y: 0, z: 0 });
      expect(alpha).toBeGreaterThan(0);
      expect(alpha).toBeLessThan(1);
    });

    it('returns 1.0 at medium distance', () => {
      expect(director.getDistanceAlpha(playerPos, { x: 50, y: 0, z: 0 })).toBe(1.0);
    });

    it('dims at very far distance (> 200)', () => {
      expect(director.getDistanceAlpha(playerPos, { x: 250, y: 0, z: 0 })).toBe(0.2);
    });

    it('fades between 150 and 200', () => {
      const alpha = director.getDistanceAlpha(playerPos, { x: 175, y: 0, z: 0 });
      expect(alpha).toBeGreaterThan(0.2);
      expect(alpha).toBeLessThan(1.0);
    });
  });
});
