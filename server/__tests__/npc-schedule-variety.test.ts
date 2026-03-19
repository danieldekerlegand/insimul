/**
 * Tests for NPC daily schedule variety with personality-driven randomization.
 *
 * Validates that Big Five personality traits produce meaningfully different
 * schedules and that the day-seed mechanism provides day-to-day variety
 * while remaining deterministic within a single day.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---------- Mock Babylon.js Vector3 ----------

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

// ---------- Import after mock ----------

import { Vector3 } from '@babylonjs/core';
import { NPCScheduleSystem, type NPCPersonality, type NPCGoal } from '../../client/src/components/3DGame/NPCScheduleSystem';

// ---------- Helpers ----------

function makeSystem(): NPCScheduleSystem {
  const sys = new NPCScheduleSystem();
  // Register some buildings
  const V = (x: number, z: number) => new Vector3(x, 0, z) as any;
  sys.registerBuilding('home-1', V(0, 0), 0, 4, 'residence');
  sys.registerBuilding('home-2', V(10, 0), 0, 4, 'residence');
  sys.registerBuilding('work-1', V(20, 0), 0, 4, 'business');
  sys.registerBuilding('shop-1', V(30, 0), 0, 4, 'business');
  sys.registerBuilding('shop-2', V(40, 0), 0, 4, 'business');
  sys.registerBuilding('shop-3', V(50, 0), 0, 4, 'business');
  sys.registerBuilding('friend-home', V(60, 0), 0, 4, 'residence');
  return sys;
}

/** Convert a game hour to a `now` timestamp (ms) that pickNextGoal expects. */
function hourToNow(hour: number, day: number = 0): number {
  return (day * 24 + hour) * 60000;
}

const INTROVERT: NPCPersonality = {
  openness: 0.3, conscientiousness: 0.7, extroversion: 0.1,
  agreeableness: 0.4, neuroticism: 0.7,
};

const EXTROVERT: NPCPersonality = {
  openness: 0.7, conscientiousness: 0.3, extroversion: 0.9,
  agreeableness: 0.7, neuroticism: 0.2,
};

const CONSCIENTIOUS: NPCPersonality = {
  openness: 0.5, conscientiousness: 0.95, extroversion: 0.5,
  agreeableness: 0.5, neuroticism: 0.3,
};

const SPONTANEOUS: NPCPersonality = {
  openness: 0.8, conscientiousness: 0.1, extroversion: 0.5,
  agreeableness: 0.5, neuroticism: 0.3,
};

const NEUTRAL: NPCPersonality = {
  openness: 0.5, conscientiousness: 0.5, extroversion: 0.5,
  agreeableness: 0.5, neuroticism: 0.5,
};

// ---------- Tests ----------

describe('NPCScheduleSystem — personality-driven variety', () => {

  describe('daySeed', () => {
    it('returns deterministic values for same NPC + day + slot', () => {
      const sys = makeSystem();
      const now = hourToNow(10, 5);
      const a = sys.daySeed('npc-1', now, 0);
      const b = sys.daySeed('npc-1', now, 0);
      expect(a).toBe(b);
    });

    it('returns different values for different NPCs on the same day', () => {
      const sys = makeSystem();
      const now = hourToNow(10, 5);
      const a = sys.daySeed('npc-1', now, 0);
      const b = sys.daySeed('npc-2', now, 0);
      expect(a).not.toBe(b);
    });

    it('returns different values for the same NPC on different days', () => {
      const sys = makeSystem();
      const day1 = hourToNow(10, 1);
      const day2 = hourToNow(10, 2);
      const a = sys.daySeed('npc-1', day1, 0);
      const b = sys.daySeed('npc-1', day2, 0);
      expect(a).not.toBe(b);
    });

    it('returns different values for different slots on the same day', () => {
      const sys = makeSystem();
      const now = hourToNow(10, 5);
      const a = sys.daySeed('npc-1', now, 0);
      const b = sys.daySeed('npc-1', now, 1);
      expect(a).not.toBe(b);
    });

    it('returns values in [0, 1)', () => {
      const sys = makeSystem();
      for (let day = 0; day < 100; day++) {
        const val = sys.daySeed('test-npc', hourToNow(12, day), 0);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('night/bedtime behavior', () => {
    it('all NPCs go home or idle during deep night hours', () => {
      const sys = makeSystem();
      sys.registerNPC('npc-ext', 'work-1', 'home-1', ['friend-home'], EXTROVERT);
      sys.registerNPC('npc-int', 'work-1', 'home-2', ['friend-home'], INTROVERT);

      const midnightNow = hourToNow(2);
      const g1 = sys.pickNextGoal('npc-ext', midnightNow);
      const g2 = sys.pickNextGoal('npc-int', midnightNow);

      expect(g1).not.toBeNull();
      expect(g2).not.toBeNull();
      // Both should be home or idle
      expect(['go_to_building', 'idle_at_building']).toContain(g1!.type);
      expect(['go_to_building', 'idle_at_building']).toContain(g2!.type);
    });
  });

  describe('employed NPC schedule', () => {
    it('sends employed NPCs to work during work hours', () => {
      const sys = makeSystem();
      sys.registerNPC('worker', 'work-1', 'home-1', [], NEUTRAL);

      const workHourNow = hourToNow(10);
      const goal = sys.pickNextGoal('worker', workHourNow);
      expect(goal).not.toBeNull();
      expect(goal!.type).toBe('go_to_building');
      expect(goal!.buildingId).toBe('work-1');
    });

    it('high-conscientiousness NPCs eat at desk more often during lunch', () => {
      const sys = makeSystem();
      let atDeskCount = 0;
      const trials = 50;

      for (let day = 0; day < trials; day++) {
        const sysInner = makeSystem();
        sysInner.registerNPC('diligent', 'work-1', 'home-1', [], CONSCIENTIOUS);
        const lunchNow = hourToNow(12.5, day);
        const goal = sysInner.pickNextGoal('diligent', lunchNow);
        if (goal?.buildingId === 'work-1') atDeskCount++;
      }

      // Conscientious NPC should eat at desk at least some days
      expect(atDeskCount).toBeGreaterThan(5);
    });

    it('low-conscientiousness NPCs may leave work early', () => {
      const sys = makeSystem();
      let leftEarlyCount = 0;
      const trials = 50;

      for (let day = 0; day < trials; day++) {
        const sysInner = makeSystem();
        sysInner.registerNPC('sponty', 'work-1', 'home-1', ['friend-home'], SPONTANEOUS);
        const afternoonNow = hourToNow(16, day);
        const goal = sysInner.pickNextGoal('sponty', afternoonNow);
        if (goal?.buildingId !== 'work-1') leftEarlyCount++;
      }

      // Should leave early at least sometimes
      expect(leftEarlyCount).toBeGreaterThan(0);
    });
  });

  describe('evening personality differences', () => {
    it('extroverts visit friends or businesses more often in evenings', () => {
      const trials = 50;
      let extSocialCount = 0;
      let intSocialCount = 0;

      for (let day = 0; day < trials; day++) {
        const sysExt = makeSystem();
        sysExt.registerNPC('ext', 'work-1', 'home-1', ['friend-home'], EXTROVERT);
        const goal = sysExt.pickNextGoal('ext', hourToNow(18, day));
        if (goal?.type === 'visit_friend' || (goal?.type === 'go_to_building' && goal.buildingId !== 'home-1')) {
          extSocialCount++;
        }

        const sysInt = makeSystem();
        sysInt.registerNPC('int', 'work-1', 'home-2', ['friend-home'], INTROVERT);
        const goal2 = sysInt.pickNextGoal('int', hourToNow(18, day));
        if (goal2?.type === 'visit_friend' || (goal2?.type === 'go_to_building' && goal2.buildingId !== 'home-2')) {
          intSocialCount++;
        }
      }

      // Extrovert should socialize significantly more than introvert
      expect(extSocialCount).toBeGreaterThan(intSocialCount);
    });
  });

  describe('unemployed NPC schedule', () => {
    it('unemployed NPCs wander or visit shops during the day', () => {
      const sys = makeSystem();
      sys.registerNPC('jobless', undefined, 'home-1', ['friend-home'], NEUTRAL);

      const morningNow = hourToNow(9);
      const goal = sys.pickNextGoal('jobless', morningNow);
      expect(goal).not.toBeNull();
      expect(['go_to_building', 'wander_sidewalk']).toContain(goal!.type);
    });

    it('neurotic unemployed NPCs stay home longer in morning', () => {
      const trials = 50;
      let neuroticHomeCount = 0;
      let openHomeCount = 0;

      for (let day = 0; day < trials; day++) {
        const sysN = makeSystem();
        sysN.registerNPC('nervous', undefined, 'home-1', [], {
          openness: 0.2, conscientiousness: 0.5, extroversion: 0.3,
          agreeableness: 0.5, neuroticism: 0.9,
        });
        const goal = sysN.pickNextGoal('nervous', hourToNow(7, day));
        if (goal?.buildingId === 'home-1') neuroticHomeCount++;

        const sysO = makeSystem();
        sysO.registerNPC('explorer', undefined, 'home-2', [], {
          openness: 0.9, conscientiousness: 0.5, extroversion: 0.7,
          agreeableness: 0.5, neuroticism: 0.1,
        });
        const goal2 = sysO.pickNextGoal('explorer', hourToNow(7, day));
        if (goal2?.buildingId === 'home-2') openHomeCount++;
      }

      // Neurotic NPC should stay home more often in early morning
      expect(neuroticHomeCount).toBeGreaterThan(openHomeCount);
    });
  });

  describe('day-to-day variety', () => {
    it('same NPC gets different goals across different days', () => {
      const goalTypes = new Set<string>();
      const goalBuildings = new Set<string | undefined>();

      for (let day = 0; day < 20; day++) {
        const sys = makeSystem();
        sys.registerNPC('varied', 'work-1', 'home-1', ['friend-home'], EXTROVERT);
        const goal = sys.pickNextGoal('varied', hourToNow(18, day));
        if (goal) {
          goalTypes.add(goal.type);
          goalBuildings.add(goal.buildingId);
        }
      }

      // Should see at least 2 different goal types or buildings across 20 days
      const totalVariety = goalTypes.size + goalBuildings.size;
      expect(totalVariety).toBeGreaterThanOrEqual(3);
    });

    it('different NPCs get different goals at the same time', () => {
      const goals: (NPCGoal | null)[] = [];
      const now = hourToNow(18, 5);

      for (let i = 0; i < 10; i++) {
        const sys = makeSystem();
        sys.registerNPC(`npc-${i}`, 'work-1', 'home-1', ['friend-home'], {
          ...NEUTRAL,
          extroversion: 0.3 + (i * 0.07), // Vary extroversion across NPCs
        });
        goals.push(sys.pickNextGoal(`npc-${i}`, now));
      }

      // Not all goals should be identical
      const uniqueGoals = new Set(goals.map(g => g ? `${g.type}:${g.buildingId}` : 'null'));
      expect(uniqueGoals.size).toBeGreaterThan(1);
    });
  });

  describe('NPCPersonality type expansion', () => {
    it('accepts full Big Five personality', () => {
      const sys = makeSystem();
      // Should not throw
      sys.registerNPC('full-personality', 'work-1', 'home-1', [], {
        openness: 0.8,
        conscientiousness: 0.6,
        extroversion: 0.4,
        agreeableness: 0.7,
        neuroticism: 0.3,
      });

      const goal = sys.pickNextGoal('full-personality', hourToNow(10));
      expect(goal).not.toBeNull();
    });

    it('handles missing personality traits with defaults', () => {
      const sys = makeSystem();
      sys.registerNPC('partial', 'work-1', 'home-1', [], { extroversion: 0.8 });

      const goal = sys.pickNextGoal('partial', hourToNow(10));
      expect(goal).not.toBeNull();
    });

    it('handles undefined personality', () => {
      const sys = makeSystem();
      sys.registerNPC('no-personality', 'work-1', 'home-1', []);

      const goal = sys.pickNextGoal('no-personality', hourToNow(10));
      expect(goal).not.toBeNull();
    });
  });
});
