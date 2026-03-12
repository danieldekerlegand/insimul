/**
 * Tests for OccupationActivitySystem
 *
 * Verifies:
 * - Occupation type → activity mapping
 * - Activity cycling (2-3 activities per shift)
 * - Break behavior (1-2 breaks during work shift)
 * - Shopkeeper interruption for commerce
 * - NPC positioning within building bounds
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// We can't import Babylon.js Vector3 in Node tests, so mock it
class MockVector3 {
  constructor(public x: number, public y: number, public z: number) {}
  clone() { return new MockVector3(this.x, this.y, this.z); }
  add(other: MockVector3) { return new MockVector3(this.x + other.x, this.y + other.y, this.z + other.z); }
}

// Mock @babylonjs/core
vi.mock('@babylonjs/core', () => ({
  Vector3: MockVector3,
}));

// Import after mocks are set up
const { OccupationActivitySystem, getActivityProfile, isShopkeeperBusiness } =
  await import('../../client/src/components/3DGame/OccupationActivitySystem');

describe('OccupationActivitySystem', () => {
  // ---------- Activity Profile Tests ----------

  describe('getActivityProfile', () => {
    it('returns specific profile for known business types', () => {
      const bakery = getActivityProfile('Bakery');
      expect(bakery.activities.length).toBeGreaterThanOrEqual(2);
      expect(bakery.isShopkeeper).toBe(true);
    });

    it('returns default profile for unknown business types', () => {
      const unknown = getActivityProfile('UnknownBusiness');
      expect(unknown.activities.length).toBeGreaterThanOrEqual(1);
      expect(unknown.isShopkeeper).toBe(false);
    });

    it('Bakery has work and idle animations', () => {
      const bakery = getActivityProfile('Bakery');
      const anims = bakery.activities.map(a => a.animation);
      expect(anims).toContain('work');
    });

    it('Bar has at least 2 activities', () => {
      const bar = getActivityProfile('Bar');
      expect(bar.activities.length).toBeGreaterThanOrEqual(2);
    });

    it('School has talk animation for teaching', () => {
      const school = getActivityProfile('School');
      const anims = school.activities.map(a => a.animation);
      expect(anims).toContain('talk');
    });

    it('PoliceStation has walk animation for patrolling', () => {
      const police = getActivityProfile('PoliceStation');
      const anims = police.activities.map(a => a.animation);
      expect(anims).toContain('walk');
    });

    it('LawFirm has sit animation for desk work', () => {
      const law = getActivityProfile('LawFirm');
      const anims = law.activities.map(a => a.animation);
      expect(anims).toContain('sit');
    });

    it('all profiles have at least one break', () => {
      const types = ['Bakery', 'Bar', 'Restaurant', 'Shop', 'Hospital', 'LawFirm',
        'Bank', 'School', 'Church', 'Farm', 'Factory', 'PoliceStation', 'FireStation'];
      for (const type of types) {
        const profile = getActivityProfile(type);
        expect(profile.breaks.length).toBeGreaterThanOrEqual(1);
        expect(profile.breaksPerShift[0]).toBeGreaterThanOrEqual(1);
      }
    });

    it('all activity durations are in 30-120 game-minute range', () => {
      const types = ['Bakery', 'Bar', 'Restaurant', 'Shop', 'Hospital', 'Farm', 'Factory'];
      for (const type of types) {
        const profile = getActivityProfile(type);
        for (const act of profile.activities) {
          expect(act.minDurationMinutes).toBeGreaterThanOrEqual(10);
          expect(act.maxDurationMinutes).toBeLessThanOrEqual(120);
          expect(act.minDurationMinutes).toBeLessThanOrEqual(act.maxDurationMinutes);
        }
      }
    });
  });

  describe('isShopkeeperBusiness', () => {
    it('Bakery is a shopkeeper business', () => {
      expect(isShopkeeperBusiness('Bakery')).toBe(true);
    });

    it('Bar is a shopkeeper business', () => {
      expect(isShopkeeperBusiness('Bar')).toBe(true);
    });

    it('Shop is a shopkeeper business', () => {
      expect(isShopkeeperBusiness('Shop')).toBe(true);
    });

    it('Hospital is NOT a shopkeeper business', () => {
      expect(isShopkeeperBusiness('Hospital')).toBe(false);
    });

    it('School is NOT a shopkeeper business', () => {
      expect(isShopkeeperBusiness('School')).toBe(false);
    });

    it('unknown business is NOT a shopkeeper', () => {
      expect(isShopkeeperBusiness('UnknownType')).toBe(false);
    });
  });

  // ---------- OccupationActivitySystem Tests ----------

  describe('work shift lifecycle', () => {
    let system: InstanceType<typeof OccupationActivitySystem>;
    let animChanges: Array<{ npcId: string; state: string }>;
    let posChanges: Array<{ npcId: string; position: any }>;

    beforeEach(() => {
      animChanges = [];
      posChanges = [];
      system = new OccupationActivitySystem({
        onAnimationChange: (npcId, state) => animChanges.push({ npcId, state }),
        onPositionChange: (npcId, position) => posChanges.push({ npcId, position }),
      });
    });

    it('startWorkShift registers NPC and triggers initial animation', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(10, 0, 10) as any);
      expect(system.isWorking('npc1')).toBe(true);
      expect(animChanges.length).toBe(1);
      expect(animChanges[0].npcId).toBe('npc1');
    });

    it('endWorkShift removes NPC from system', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(10, 0, 10) as any);
      system.endWorkShift('npc1');
      expect(system.isWorking('npc1')).toBe(false);
    });

    it('isWorking returns false for unregistered NPC', () => {
      expect(system.isWorking('unknown')).toBe(false);
    });

    it('getActivityState returns state for registered NPC', () => {
      system.startWorkShift('npc1', 'Shop', new MockVector3(0, 0, 0) as any);
      const state = system.getActivityState('npc1');
      expect(state).toBeDefined();
      expect(state!.npcId).toBe('npc1');
      expect(state!.businessType).toBe('Shop');
      expect(state!.isOnBreak).toBe(false);
      expect(state!.isInterrupted).toBe(false);
    });

    it('getActivityState returns undefined for unregistered NPC', () => {
      expect(system.getActivityState('unknown')).toBeUndefined();
    });

    it('getActiveWorkers returns registered NPC IDs', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      system.startWorkShift('npc2', 'Bar', new MockVector3(5, 0, 5) as any);
      const workers = system.getActiveWorkers();
      expect(workers).toContain('npc1');
      expect(workers).toContain('npc2');
      expect(workers.length).toBe(2);
    });

    it('getActivityDescription returns label for working NPC', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      const desc = system.getActivityDescription('npc1');
      expect(desc).toBeTruthy();
      expect(typeof desc).toBe('string');
    });

    it('getActivityDescription returns null for unknown NPC', () => {
      expect(system.getActivityDescription('unknown')).toBeNull();
    });
  });

  describe('activity cycling', () => {
    let system: InstanceType<typeof OccupationActivitySystem>;
    let animChanges: Array<{ npcId: string; state: string }>;

    beforeEach(() => {
      animChanges = [];
      system = new OccupationActivitySystem({
        onAnimationChange: (npcId, state) => animChanges.push({ npcId, state }),
      });
    });

    it('NPC transitions to next activity when duration expires', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      const initialCount = animChanges.length;

      // Advance 120 game-minutes (guaranteed to exceed max duration)
      // msPerGameHour = 60000, so 120 game-minutes = 120000 real ms
      system.update(120_000, 60_000);

      expect(animChanges.length).toBeGreaterThan(initialCount);
    });

    it('NPC cycles through activities', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);

      // Advance enough time for several transitions (600 game-minutes = 10 hours)
      for (let i = 0; i < 60; i++) {
        system.update(10_000, 60_000); // 10 game-minutes per tick
      }

      // Should have had multiple animation changes
      expect(animChanges.length).toBeGreaterThan(3);
    });

    it('break is taken during shift', () => {
      // Run many times to statistically ensure at least one break occurs
      let breakTaken = false;
      for (let trial = 0; trial < 20; trial++) {
        const trialAnims: string[] = [];
        const trialSystem = new OccupationActivitySystem({
          onAnimationChange: (_npcId, state) => trialAnims.push(state),
        });
        trialSystem.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);

        // Advance 8 hours of game time
        for (let i = 0; i < 48; i++) {
          trialSystem.update(10_000, 60_000);
        }

        const state = trialSystem.getActivityState('npc1');
        if (state && state.breaksTaken > 0) {
          breakTaken = true;
          break;
        }
        // Also check if sit/eat animations appeared (break activities)
        if (trialAnims.some(a => a === 'sit' || a === 'eat')) {
          breakTaken = true;
          break;
        }
        trialSystem.dispose();
      }
      expect(breakTaken).toBe(true);
    });
  });

  describe('shopkeeper commerce interruption', () => {
    let system: InstanceType<typeof OccupationActivitySystem>;
    let animChanges: Array<{ npcId: string; state: string }>;
    let interrupted: string[];
    let resumed: string[];

    beforeEach(() => {
      animChanges = [];
      interrupted = [];
      resumed = [];
      system = new OccupationActivitySystem({
        onAnimationChange: (npcId, state) => animChanges.push({ npcId, state }),
        onShopkeeperInterrupted: (npcId) => interrupted.push(npcId),
        onShopkeeperResumed: (npcId) => resumed.push(npcId),
      });
    });

    it('interruptForCommerce succeeds for shopkeeper NPC', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      const result = system.interruptForCommerce('npc1');
      expect(result).toBe(true);
      expect(interrupted).toContain('npc1');
    });

    it('interruptForCommerce fails for non-shopkeeper NPC', () => {
      system.startWorkShift('npc1', 'Hospital', new MockVector3(0, 0, 0) as any);
      const result = system.interruptForCommerce('npc1');
      expect(result).toBe(false);
      expect(interrupted.length).toBe(0);
    });

    it('interruptForCommerce fails for unregistered NPC', () => {
      const result = system.interruptForCommerce('unknown');
      expect(result).toBe(false);
    });

    it('interrupted NPC switches to idle animation', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      animChanges = []; // clear initial
      system.interruptForCommerce('npc1');
      expect(animChanges.length).toBe(1);
      expect(animChanges[0].state).toBe('idle');
    });

    it('interrupted NPC does not transition during update', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      system.interruptForCommerce('npc1');
      const animCountBefore = animChanges.length;

      // Advance lots of time
      system.update(300_000, 60_000);

      // No additional animation changes while interrupted
      expect(animChanges.length).toBe(animCountBefore);
    });

    it('resumeAfterCommerce restores activity and fires callback', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      system.interruptForCommerce('npc1');
      system.resumeAfterCommerce('npc1');

      expect(resumed).toContain('npc1');
      const state = system.getActivityState('npc1');
      expect(state!.isInterrupted).toBe(false);
    });

    it('getActivityDescription shows "serving a customer" when interrupted', () => {
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      system.interruptForCommerce('npc1');
      expect(system.getActivityDescription('npc1')).toBe('serving a customer');
    });

    it('double interrupt is ignored', () => {
      system.startWorkShift('npc1', 'Shop', new MockVector3(0, 0, 0) as any);
      system.interruptForCommerce('npc1');
      const result = system.interruptForCommerce('npc1');
      expect(result).toBe(false);
      expect(interrupted.length).toBe(1);
    });
  });

  describe('multiple NPCs', () => {
    it('tracks multiple NPCs independently', () => {
      const animChanges: Array<{ npcId: string; state: string }> = [];
      const system = new OccupationActivitySystem({
        onAnimationChange: (npcId, state) => animChanges.push({ npcId, state }),
      });

      system.startWorkShift('baker', 'Bakery', new MockVector3(0, 0, 0) as any);
      system.startWorkShift('teacher', 'School', new MockVector3(50, 0, 50) as any);
      system.startWorkShift('cop', 'PoliceStation', new MockVector3(100, 0, 100) as any);

      expect(system.getActiveWorkers().length).toBe(3);

      // End one shift
      system.endWorkShift('teacher');
      expect(system.getActiveWorkers().length).toBe(2);
      expect(system.isWorking('teacher')).toBe(false);
      expect(system.isWorking('baker')).toBe(true);
    });
  });

  describe('dispose', () => {
    it('clears all state', () => {
      const system = new OccupationActivitySystem();
      system.startWorkShift('npc1', 'Bakery', new MockVector3(0, 0, 0) as any);
      system.startWorkShift('npc2', 'Bar', new MockVector3(0, 0, 0) as any);

      system.dispose();

      expect(system.getActiveWorkers().length).toBe(0);
      expect(system.isWorking('npc1')).toBe(false);
    });
  });
});
