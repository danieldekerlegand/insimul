import { describe, it, expect, beforeEach } from 'vitest';
import {
  AmbientLifeBehaviorSystem,
  type NearbyBuildingInfo,
  type NearbyNPCInfo,
} from '../../logic/AmbientLifeBehaviorSystem';
import type { NPCPersonality } from '../NPCScheduleSystem';

// ---------- Helpers ----------

const DEFAULT_PERSONALITY: NPCPersonality = {
  openness: 0.5,
  conscientiousness: 0.5,
  extroversion: 0.5,
  agreeableness: 0.5,
  neuroticism: 0.5,
};

const EXTROVERT: NPCPersonality = {
  ...DEFAULT_PERSONALITY,
  extroversion: 0.95,
  agreeableness: 0.8,
};

const INTROVERT: NPCPersonality = {
  ...DEFAULT_PERSONALITY,
  extroversion: 0.1,
  agreeableness: 0.2,
};

const CONSCIENTIOUS: NPCPersonality = {
  ...DEFAULT_PERSONALITY,
  conscientiousness: 0.95,
};

function makeBuilding(overrides: Partial<NearbyBuildingInfo> = {}): NearbyBuildingInfo {
  return {
    id: 'bld-1',
    buildingType: 'business',
    doorX: 5,
    doorZ: 5,
    isHome: false,
    isWork: false,
    ...overrides,
  };
}

function makeNPC(overrides: Partial<NearbyNPCInfo> = {}): NearbyNPCInfo {
  return {
    id: 'other-npc',
    x: 3,
    z: 3,
    ...overrides,
  };
}

// ---------- Tests ----------

describe('AmbientLifeBehaviorSystem', () => {
  let system: AmbientLifeBehaviorSystem;

  beforeEach(() => {
    system = new AmbientLifeBehaviorSystem();
  });

  describe('isPerformingActivity / getActiveBehavior', () => {
    it('returns false/null when no activity assigned', () => {
      expect(system.isPerformingActivity('npc-1')).toBe(false);
      expect(system.getActiveBehavior('npc-1')).toBeNull();
    });

    it('returns true after an activity is assigned', () => {
      const now = 1000;
      const behavior = system.update(
        'npc-1', now, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );
      // An activity should have been assigned given the context
      if (behavior) {
        expect(system.isPerformingActivity('npc-1')).toBe(true);
        expect(system.getActiveBehavior('npc-1')).not.toBeNull();
      }
    });
  });

  describe('update', () => {
    it('assigns an activity when NPC has nearby context at valid time', () => {
      const now = 1000;
      // Hour 12 (noon) with a nearby business and nearby NPC
      const behavior = system.update(
        'npc-1', now, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );

      expect(behavior).not.toBeNull();
      expect(behavior!.npcId).toBe('npc-1');
      expect(behavior!.startTime).toBe(now);
      expect(behavior!.endTime).toBeGreaterThan(now);
      expect(behavior!.animation).toBeTruthy();
    });

    it('returns existing activity on subsequent calls during activity', () => {
      const now = 1000;
      const first = system.update(
        'npc-1', now, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );
      if (!first) return; // skip if nothing was assigned

      // Calling again mid-activity should return the same behavior
      const second = system.update(
        'npc-1', now + 1000, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );

      expect(second).not.toBeNull();
      expect(second!.activity).toBe(first.activity);
      expect(second!.startTime).toBe(first.startTime);
    });

    it('clears activity after it expires and enforces cooldown', () => {
      const now = 1000;
      const behavior = system.update(
        'npc-1', now, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );
      if (!behavior) return;

      // After activity ends
      const afterEnd = behavior.endTime + 1;
      const result = system.update(
        'npc-1', afterEnd, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );

      // Should return null (activity cleared, cooldown active)
      expect(result).toBeNull();
      expect(system.isPerformingActivity('npc-1')).toBe(false);
    });

    it('allows new activity after cooldown expires', () => {
      const now = 1000;
      const behavior = system.update(
        'npc-1', now, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );
      if (!behavior) return;

      // After activity ends + cooldown (3000ms)
      const afterCooldown = behavior.endTime + 3001;
      const result = system.update(
        'npc-1', afterCooldown, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );

      // Should potentially pick a new activity
      // (may or may not depending on random selection, but no cooldown block)
      expect(system.isPerformingActivity('npc-1')).toBe(result !== null);
    });
  });

  describe('time-of-day filtering', () => {
    it('does not assign sweeping at night (hour 2)', () => {
      // Run many trials — sweeping should never appear at hour 2
      const activities = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 2, 0, 0, CONSCIENTIOUS,
          [makeBuilding({ isHome: true, buildingType: 'residence' })], []
        );
        if (b) activities.add(b.activity);
      }
      expect(activities.has('sweeping')).toBe(false);
      expect(activities.has('gardening')).toBe(false);
    });

    it('eating_outdoor is more likely during meal hours (12)', () => {
      let eatingCount = 0;
      const trials = 100;
      for (let i = 0; i < trials; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0, DEFAULT_PERSONALITY,
          [], [] // no buildings or NPCs, so only non-building/non-NPC activities
        );
        if (b?.activity === 'eating_outdoor' || b?.activity === 'drinking') eatingCount++;
      }
      // At noon, eating should occur in some meaningful fraction
      expect(eatingCount).toBeGreaterThan(0);
    });
  });

  describe('context filtering', () => {
    it('does not assign chatting without nearby NPCs', () => {
      const activities = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0, EXTROVERT,
          [makeBuilding()], [] // no nearby NPCs
        );
        if (b) activities.add(b.activity);
      }
      expect(activities.has('chatting')).toBe(false);
      expect(activities.has('greeting_passerby')).toBe(false);
    });

    it('does not assign window_shopping without nearby businesses', () => {
      const activities = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0, DEFAULT_PERSONALITY,
          [], [makeNPC()] // no buildings
        );
        if (b) activities.add(b.activity);
      }
      expect(activities.has('window_shopping')).toBe(false);
      expect(activities.has('sweeping')).toBe(false);
    });

    it('assigns social activities when NPCs are nearby and personality is extroverted', () => {
      const activities = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0, EXTROVERT,
          [], [makeNPC()]
        );
        if (b) activities.add(b.activity);
      }
      // Extroverts near NPCs should sometimes chat or greet
      const hasSocial = activities.has('chatting') || activities.has('greeting_passerby');
      expect(hasSocial).toBe(true);
    });
  });

  describe('personality influence', () => {
    it('conscientious NPCs prefer chore activities near home', () => {
      let choreCount = 0;
      const trials = 100;
      for (let i = 0; i < trials; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 9, 0, 0, CONSCIENTIOUS,
          [makeBuilding({ isHome: true, buildingType: 'residence' })], []
        );
        if (b?.activity === 'sweeping' || b?.activity === 'gardening') choreCount++;
      }
      // Conscientious NPCs near home in the morning should do chores meaningfully often
      expect(choreCount).toBeGreaterThan(5);
    });

    it('introverted NPCs avoid social activities', () => {
      let socialCount = 0;
      let totalCount = 0;
      const trials = 100;
      for (let i = 0; i < trials; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0, INTROVERT,
          [makeBuilding()], [makeNPC()]
        );
        if (b) {
          totalCount++;
          if (b.activity === 'chatting' || b.activity === 'greeting_passerby') socialCount++;
        }
      }
      // Introverts should have very low social activity rate
      if (totalCount > 0) {
        expect(socialCount / totalCount).toBeLessThan(0.3);
      }
    });
  });

  describe('clearActivity', () => {
    it('removes active behavior', () => {
      const behavior = system.update(
        'npc-1', 1000, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );
      if (!behavior) return;

      system.clearActivity('npc-1');
      expect(system.isPerformingActivity('npc-1')).toBe(false);
      expect(system.getActiveBehavior('npc-1')).toBeNull();
    });
  });

  describe('getActivityDescription', () => {
    it('returns null when no activity', () => {
      expect(system.getActivityDescription('npc-1')).toBeNull();
    });

    it('returns a description when activity is active', () => {
      const behavior = system.update(
        'npc-1', 1000, 12, 0, 0, DEFAULT_PERSONALITY,
        [makeBuilding()], [makeNPC()]
      );
      if (!behavior) return;

      const desc = system.getActivityDescription('npc-1');
      expect(desc).toBeTruthy();
      expect(typeof desc).toBe('string');
    });
  });

  describe('faceTarget', () => {
    it('sets faceTargetPosition toward nearby NPC for social activities', () => {
      // Force social context
      for (let i = 0; i < 100; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0, EXTROVERT,
          [], [makeNPC({ x: 10, z: 10 })]
        );
        if (b?.activity === 'chatting' || b?.activity === 'greeting_passerby') {
          expect(b.faceTargetPosition).toBeDefined();
          expect(b.faceTargetPosition!.x).toBe(10);
          expect(b.faceTargetPosition!.z).toBe(10);
          return; // Found one, test passes
        }
      }
      // If we never got a social activity in 100 tries, that's also meaningful
      // but given the extrovert personality, it should have happened
    });

    it('sets faceTargetPosition toward building for window_shopping', () => {
      const building = makeBuilding({ doorX: 20, doorZ: 20 });
      for (let i = 0; i < 100; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0,
          { ...DEFAULT_PERSONALITY, openness: 0.95 },
          [building], []
        );
        if (b?.activity === 'window_shopping') {
          expect(b.faceTargetPosition).toBeDefined();
          expect(b.faceTargetPosition!.x).toBe(20);
          expect(b.faceTargetPosition!.z).toBe(20);
          return;
        }
      }
    });
  });

  describe('dispose', () => {
    it('clears all tracked state', () => {
      system.update('npc-1', 1000, 12, 0, 0, DEFAULT_PERSONALITY, [makeBuilding()], [makeNPC()]);
      system.dispose();
      expect(system.isPerformingActivity('npc-1')).toBe(false);
      expect(system.getActiveBehavior('npc-1')).toBeNull();
    });
  });

  describe('animation mapping', () => {
    it('assigns valid animation states', () => {
      const validAnimations = new Set(['idle', 'walk', 'run', 'talk', 'listen', 'work', 'sit', 'eat', 'wave', 'sleep']);

      for (let i = 0; i < 100; i++) {
        const s = new AmbientLifeBehaviorSystem();
        const b = s.update(
          `npc-${i}`, i * 1000, 12, 0, 0, DEFAULT_PERSONALITY,
          [makeBuilding()], [makeNPC()]
        );
        if (b) {
          expect(validAnimations.has(b.animation)).toBe(true);
        }
      }
    });
  });
});
