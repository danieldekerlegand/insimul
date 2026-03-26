/**
 * Tests for housing assignment in IR generation and NPC schedule system.
 *
 * Verifies:
 * - buildNPCSchedule uses character's assigned home building over first residence
 * - CharacterIR includes homeResidenceId
 * - NPCScheduleSystem assigns fallback home to homeless NPCs at night
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { buildNPCSchedule } from '../services/game-export/ir-generator';

// ---------- Helpers ----------

function makeBuildings() {
  return [
    { id: 'bld-res-1', settlementId: 's1', businessId: null, spec: { buildingRole: 'residence_small' } },
    { id: 'bld-res-2', settlementId: 's1', businessId: null, spec: { buildingRole: 'residence_medium' } },
    { id: 'bld-res-3', settlementId: 's1', businessId: null, spec: { buildingRole: 'residence_small' } },
    { id: 'bld-work-1', settlementId: 's1', businessId: 'biz1', spec: { buildingRole: 'commercial_shop' } },
  ];
}

// ---------- Tests ----------

describe('buildNPCSchedule — home building assignment', () => {
  it('uses assignedHomeBuildingId when provided', () => {
    const buildings = makeBuildings();
    const schedule = buildNPCSchedule(
      {
        id: 'char-1',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
        occupation: null,
        friendIds: [],
        assignedHomeBuildingId: 'bld-res-2',
      },
      buildings,
      's1',
    );

    expect(schedule.homeBuildingId).toBe('bld-res-2');
    // Sleep blocks should reference the assigned home
    const sleepBlocks = schedule.blocks.filter(b => b.activity === 'sleep');
    expect(sleepBlocks.length).toBeGreaterThan(0);
    for (const block of sleepBlocks) {
      expect(block.buildingId).toBe('bld-res-2');
    }
  });

  it('falls back to first residence when assignedHomeBuildingId is null', () => {
    const buildings = makeBuildings();
    const schedule = buildNPCSchedule(
      {
        id: 'char-2',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
        occupation: null,
        friendIds: [],
        assignedHomeBuildingId: null,
      },
      buildings,
      's1',
    );

    // Should fall back to first residence building
    expect(schedule.homeBuildingId).toBe('bld-res-1');
  });

  it('falls back to first residence when assignedHomeBuildingId is not provided', () => {
    const buildings = makeBuildings();
    const schedule = buildNPCSchedule(
      {
        id: 'char-3',
        personality: null,
        occupation: 'farmer',
        friendIds: [],
      },
      buildings,
      's1',
    );

    expect(schedule.homeBuildingId).toBe('bld-res-1');
  });

  it('returns null homeBuildingId when no residences exist', () => {
    const buildings = [
      { id: 'bld-work-1', settlementId: 's1', businessId: 'biz1', spec: { buildingRole: 'commercial_shop' } },
    ];
    const schedule = buildNPCSchedule(
      {
        id: 'char-4',
        personality: null,
        occupation: null,
        friendIds: [],
        assignedHomeBuildingId: null,
      },
      buildings,
      's1',
    );

    expect(schedule.homeBuildingId).toBeNull();
  });

  it('generates schedule with all required fields', () => {
    const buildings = makeBuildings();
    const schedule = buildNPCSchedule(
      {
        id: 'char-5',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
        occupation: 'teacher',
        friendIds: ['friend-1'],
        assignedHomeBuildingId: 'bld-res-3',
      },
      buildings,
      's1',
    );

    expect(schedule).toHaveProperty('homeBuildingId', 'bld-res-3');
    expect(schedule).toHaveProperty('workBuildingId');
    expect(schedule).toHaveProperty('friendBuildingIds');
    expect(schedule).toHaveProperty('wakeHour');
    expect(schedule).toHaveProperty('bedtimeHour');
    expect(schedule).toHaveProperty('blocks');
    expect(schedule.blocks.length).toBeGreaterThan(0);
  });
});

describe('NPCScheduleSystem — homeless NPC fallback', () => {
  // These tests require the Babylon.js mock
  let NPCScheduleSystem: any;
  let Vector3: any;

  beforeAll(async () => {
    vi.mock('@babylonjs/core', () => {
      class V3 {
        constructor(public x: number, public y: number, public z: number) {}
        clone() { return new V3(this.x, this.y, this.z); }
        add(other: V3) { return new V3(this.x + other.x, this.y + other.y, this.z + other.z); }
        static Distance(a: V3, b: V3) {
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        static Zero() { return new V3(0, 0, 0); }
      }
      return { Vector3: V3 };
    });

    const mod = await import('../../client/src/components/3DGame/NPCScheduleSystem');
    NPCScheduleSystem = mod.NPCScheduleSystem;
    const babylonMod = await import('@babylonjs/core');
    Vector3 = babylonMod.Vector3;
  });

  function makeSystem() {
    const sys = new NPCScheduleSystem();
    const V = (x: number, z: number) => new Vector3(x, 0, z);
    sys.registerBuilding('home-1', V(0, 0), 0, 4, 'residence');
    sys.registerBuilding('home-2', V(10, 0), 0, 4, 'residence');
    sys.registerBuilding('work-1', V(20, 0), 0, 4, 'business');
    return sys;
  }

  function hourToNow(hour: number): number {
    return hour * 60000;
  }

  it('assigns a fallback residence to homeless NPC at night', () => {
    const sys = makeSystem();
    // Register NPC without a home building
    sys.registerNPC('homeless-npc', 'work-1', undefined, undefined, {
      openness: 0.5, conscientiousness: 0.5, extroversion: 0.5,
      agreeableness: 0.5, neuroticism: 0.5,
    });

    // Night time (hour 22)
    const goal = sys.pickNextGoal('homeless-npc', hourToNow(22));
    expect(goal).not.toBeNull();
    // Should go to a building (not idle)
    expect(goal!.type).not.toBe('idle_at_building');
    // The building should be one of the residences
    if (goal!.buildingId) {
      expect(['home-1', 'home-2']).toContain(goal!.buildingId);
    }
  });

  it('NPC with home goes home at night as before', () => {
    const sys = makeSystem();
    sys.registerNPC('homed-npc', 'work-1', 'home-1', undefined, {
      openness: 0.5, conscientiousness: 0.5, extroversion: 0.5,
      agreeableness: 0.5, neuroticism: 0.5,
    });

    const goal = sys.pickNextGoal('homed-npc', hourToNow(22));
    expect(goal).not.toBeNull();
    expect(goal!.buildingId).toBe('home-1');
  });

  it('fallback residence assignment is deterministic for the same NPC', () => {
    const sys = makeSystem();
    sys.registerNPC('consistent-npc', undefined, undefined, undefined, {
      openness: 0.5, conscientiousness: 0.5, extroversion: 0.5,
      agreeableness: 0.5, neuroticism: 0.5,
    });

    const goal1 = sys.pickNextGoal('consistent-npc', hourToNow(23));
    const goal2 = sys.pickNextGoal('consistent-npc', hourToNow(23));

    expect(goal1!.buildingId).toBe(goal2!.buildingId);
  });
});
