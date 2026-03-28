/**
 * Tests for ScheduleExecutor activity tracking features.
 *
 * Tests getCurrentActivity(), setCurrentActivity(), getActivityAnimation(),
 * and the BUSINESS_ACTIVITY_LABELS / BUSINESS_ACTIVITY_ANIMATIONS mappings.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import {
  ScheduleExecutor,
  BUSINESS_ACTIVITY_LABELS,
  BUSINESS_ACTIVITY_ANIMATIONS,
} from '../ScheduleExecutor';

// ── Mocks ─────────────────────────────────────────────────────────────────────

function makeGameTime() {
  return {
    fractionalHour: 10,
    hour: 10,
    minute: 0,
    timeScale: 1,
    msPerGameHour: 60000,
  } as any;
}

function makeEventBus() {
  return {
    on: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  } as any;
}

function makeScheduleSystem(overrides: Record<string, any> = {}) {
  return {
    getEntry: vi.fn(() => ({
      workBuildingId: 'bakery-1',
      homeBuildingId: 'home-1',
      personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
    })),
    pickNextGoal: vi.fn(() => null),
    findSidewalkPath: vi.fn(() => []),
    getRandomSidewalkTarget: vi.fn(() => null),
    getBuildingDoor: vi.fn(() => new Vector3(0, 0, 0)),
    getBuildingBusinessType: vi.fn((id: string) => {
      if (id === 'bakery-1') return 'Bakery';
      if (id === 'blacksmith-1') return 'Blacksmith';
      if (id === 'bar-1') return 'Bar';
      return undefined;
    }),
    ...overrides,
  } as any;
}

function makeAmbientLife() {
  return {
    update: vi.fn(() => null),
    clearActivity: vi.fn(),
    getActivityDescription: vi.fn(() => null),
    dispose: vi.fn(),
  } as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ScheduleExecutor Activity Tracking', () => {
  let executor: ScheduleExecutor;
  let scheduleSystem: ReturnType<typeof makeScheduleSystem>;

  beforeEach(() => {
    scheduleSystem = makeScheduleSystem();
    executor = new ScheduleExecutor(
      makeGameTime(),
      makeEventBus(),
      scheduleSystem,
      makeAmbientLife(),
    );
    executor.registerNPC('npc-1');
  });

  afterEach(() => {
    executor.dispose();
  });

  describe('getCurrentActivity', () => {
    it('returns null for NPC with no activity', () => {
      expect(executor.getCurrentActivity('npc-1')).toBeNull();
    });

    it('returns null for unregistered NPC', () => {
      expect(executor.getCurrentActivity('nonexistent')).toBeNull();
    });

    it('returns explicit activity set via setCurrentActivity', () => {
      executor.setCurrentActivity('npc-1', 'Painting');
      expect(executor.getCurrentActivity('npc-1')).toBe('Painting');
    });

    it('returns null after clearing activity', () => {
      executor.setCurrentActivity('npc-1', 'Cooking');
      executor.setCurrentActivity('npc-1', null);
      expect(executor.getCurrentActivity('npc-1')).toBeNull();
    });

    it('derives activity from business type when working', () => {
      // Simulate NPC working at a bakery
      const state = executor.getState('npc-1');
      if (state) {
        state.occasion = 'working';
        state.currentGoal = {
          type: 'go_to_building',
          buildingId: 'bakery-1',
          expiresAt: 99999,
        } as any;
      }

      const activity = executor.getCurrentActivity('npc-1');
      expect(activity).toBeTruthy();
      expect(BUSINESS_ACTIVITY_LABELS['Bakery']).toContain(activity);
    });

    it('prioritizes explicit activity over derived', () => {
      const state = executor.getState('npc-1');
      if (state) {
        state.occasion = 'working';
        state.currentGoal = { type: 'go_to_building', buildingId: 'bakery-1', expiresAt: 99999 } as any;
      }
      executor.setCurrentActivity('npc-1', 'Custom Activity');
      expect(executor.getCurrentActivity('npc-1')).toBe('Custom Activity');
    });

    it('returns null for non-working occasions', () => {
      const state = executor.getState('npc-1');
      if (state) {
        state.occasion = 'leisure';
      }
      expect(executor.getCurrentActivity('npc-1')).toBeNull();
    });
  });

  describe('setCurrentActivity', () => {
    it('does nothing for unregistered NPCs', () => {
      // Should not throw
      executor.setCurrentActivity('nonexistent', 'Cooking');
    });
  });

  describe('getActivityAnimation', () => {
    it('returns null for non-working NPCs', () => {
      expect(executor.getActivityAnimation('npc-1')).toBeNull();
    });

    it('returns specific animation for working NPC at known business', () => {
      const state = executor.getState('npc-1');
      if (state) {
        state.occasion = 'working';
        state.currentGoal = { type: 'go_to_building', buildingId: 'bakery-1', expiresAt: 99999 } as any;
      }

      const anim = executor.getActivityAnimation('npc-1');
      expect(anim).toBeTruthy();
      expect(BUSINESS_ACTIVITY_ANIMATIONS['Bakery']).toContain(anim);
    });

    it('returns null for unknown business type', () => {
      scheduleSystem.getBuildingBusinessType.mockReturnValue(undefined);
      const state = executor.getState('npc-1');
      if (state) {
        state.occasion = 'working';
        state.currentGoal = { type: 'go_to_building', buildingId: 'unknown-1', expiresAt: 99999 } as any;
      }
      expect(executor.getActivityAnimation('npc-1')).toBeNull();
    });
  });

  describe('activity cleared on building exit', () => {
    it('clears currentActivityLabel when NPC exits building', () => {
      executor.setCurrentActivity('npc-1', 'Cooking');
      const state = executor.getState('npc-1');
      if (state) {
        state.isInsideBuilding = true;
        state.insideBuildingId = 'bakery-1';
        state.buildingExitTime = 0; // Already expired
        state.occasion = 'working';
      }

      // Trigger update which should cause exit
      executor.update(Date.now());

      // After exit, activity should be cleared
      expect(state?.currentActivityLabel).toBeNull();
    });
  });
});

describe('BUSINESS_ACTIVITY_LABELS', () => {
  it('has labels for all major business types', () => {
    const requiredTypes = ['Bakery', 'Blacksmith', 'Restaurant', 'Tailor', 'Bar', 'Farm', 'Library'];
    for (const type of requiredTypes) {
      expect(BUSINESS_ACTIVITY_LABELS[type]).toBeDefined();
      expect(BUSINESS_ACTIVITY_LABELS[type].length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all labels are non-empty strings', () => {
    for (const [type, labels] of Object.entries(BUSINESS_ACTIVITY_LABELS)) {
      for (const label of labels) {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('BUSINESS_ACTIVITY_ANIMATIONS', () => {
  it('has animations for key business types', () => {
    expect(BUSINESS_ACTIVITY_ANIMATIONS['Bakery']).toContain('knead_dough');
    expect(BUSINESS_ACTIVITY_ANIMATIONS['Blacksmith']).toContain('hammer');
    expect(BUSINESS_ACTIVITY_ANIMATIONS['Bar']).toContain('pour');
    expect(BUSINESS_ACTIVITY_ANIMATIONS['Restaurant']).toContain('stir');
    expect(BUSINESS_ACTIVITY_ANIMATIONS['Carpenter']).toContain('chop');
  });
});
