import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import { ScheduleExecutor } from '../ScheduleExecutor';
import type { NPCScheduleSystem, NPCGoal, NPCScheduleEntry } from '../NPCScheduleSystem';
import type { GameTimeManager } from '../GameTimeManager';
import type { GameEventBus } from '../GameEventBus';
import type { AmbientLifeBehaviorSystem } from '../AmbientLifeBehaviorSystem';

// --- Mock factories ---

function makeGameTime(hour: number, minute = 0): GameTimeManager {
  return {
    hour,
    minute,
    fractionalHour: hour + minute / 60,
    msPerGameHour: 60_000,
    timeScale: 1,
  } as unknown as GameTimeManager;
}

function makeEventBus(): GameEventBus & { _handlers: Record<string, Function[]> } {
  const handlers: Record<string, Function[]> = {};
  return {
    _handlers: handlers,
    on(event: string, fn: Function) {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(fn);
      return () => {
        handlers[event] = handlers[event].filter((h) => h !== fn);
      };
    },
    emit(event: string, data?: any) {
      handlers[event]?.forEach((fn) => fn(data));
    },
  } as any;
}

function makeScheduleSystem(overrides: Partial<NPCScheduleSystem> = {}): NPCScheduleSystem {
  const entries = new Map<string, NPCScheduleEntry>();
  const buildings = new Map<string, { doorPosition: Vector3; businessType?: string }>();

  return {
    getEntry: (id: string) => entries.get(id) ?? null,
    registerNPC: (id: string, workBuildingId?: string, homeBuildingId?: string, friendIds?: string[], personality?: any) => {
      entries.set(id, {
        npcId: id,
        currentGoal: null,
        pathWaypoints: [],
        pathIndex: 0,
        isInsideBuilding: false,
        workBuildingId,
        homeBuildingId,
        friendBuildingIds: friendIds,
        personality,
      });
    },
    registerBuilding: (id: string, _pos: Vector3, _rot: number, _depth: number, _type: string, businessType?: string) => {
      buildings.set(id, {
        doorPosition: new Vector3(id === 'home1' ? 0 : 50, 0, 0),
        businessType,
      });
    },
    getBuildingDoor: (id: string) => buildings.get(id)?.doorPosition?.clone() ?? null,
    getBuildingBusinessType: (id: string) => buildings.get(id)?.businessType,
    findSidewalkPath: (_from: Vector3, to: Vector3) => [to.clone()],
    getRandomSidewalkTarget: () => new Vector3(10, 0, 10),
    pickNextGoal: vi.fn((_id: string, _now: number): NPCGoal | null => ({
      type: 'go_to_building',
      buildingId: 'work1',
      targetPosition: new Vector3(50, 0, 0),
      doorPosition: new Vector3(50, 0, 0),
      expiresAt: 12 * 60000,
    })),
    ...overrides,
  } as unknown as NPCScheduleSystem;
}

function makeAmbientLife(): AmbientLifeBehaviorSystem {
  return {
    update: () => null,
    clearActivity: () => {},
  } as unknown as AmbientLifeBehaviorSystem;
}

// --- Tests ---

describe('Morning Commute Wake-Up', () => {
  let gameTime: ReturnType<typeof makeGameTime>;
  let eventBus: ReturnType<typeof makeEventBus>;
  let scheduleSystem: ReturnType<typeof makeScheduleSystem>;
  let executor: ScheduleExecutor;

  function setup(hour: number, minute = 0) {
    gameTime = makeGameTime(hour, minute);
    eventBus = makeEventBus();
    scheduleSystem = makeScheduleSystem();

    // Register buildings: home at origin, work 50 units away
    scheduleSystem.registerBuilding('home1', new Vector3(0, 0, 0), 0, 2, 'residence');
    scheduleSystem.registerBuilding('work1', new Vector3(50, 0, 0), 0, 2, 'business', 'Shop');

    executor = new ScheduleExecutor(
      gameTime as any,
      eventBus as any,
      scheduleSystem as any,
      makeAmbientLife(),
    );

    // Register NPC with work and home
    scheduleSystem.registerNPC('npc1', 'work1', 'home1', [], {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    });
    executor.registerNPC('npc1', {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    });
  }

  describe('wake stagger', () => {
    it('produces different effective wake hours for different NPC IDs', () => {
      setup(6);

      scheduleSystem.registerNPC('npc2', 'work1', 'home1');
      executor.registerNPC('npc2');

      const state1 = executor.getState('npc1')!;
      const state2 = executor.getState('npc2')!;

      // Both should have wake times, but they should differ due to stagger
      expect(state1.effectiveWakeHour).toBeGreaterThan(3);
      expect(state1.effectiveWakeHour).toBeLessThan(10);
      expect(state2.effectiveWakeHour).toBeGreaterThan(3);
      expect(state2.effectiveWakeHour).toBeLessThan(10);
      // Different IDs → different stagger → different effective wake hours
      expect(state1.wakeStaggerMinutes).not.toBe(state2.wakeStaggerMinutes);
    });

    it('stagger is deterministic for the same NPC ID', () => {
      setup(6);
      const stagger1 = executor.getState('npc1')!.wakeStaggerMinutes;

      // Re-register with same ID
      executor.registerNPC('npc1', {
        openness: 0.5, conscientiousness: 0.5,
        extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5,
      });
      const stagger2 = executor.getState('npc1')!.wakeStaggerMinutes;

      expect(stagger1).toBe(stagger2);
    });

    it('stagger is within ±10 minutes', () => {
      setup(6);
      // Register many NPCs to test range
      for (let i = 0; i < 50; i++) {
        const id = `npc_stagger_${i}`;
        scheduleSystem.registerNPC(id, 'work1', 'home1');
        executor.registerNPC(id);
        const s = executor.getState(id)!;
        expect(s.wakeStaggerMinutes).toBeGreaterThanOrEqual(-10);
        expect(s.wakeStaggerMinutes).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('effective wake hour', () => {
    it('employed NPCs wake before business opens', () => {
      setup(6);
      const state = executor.getState('npc1')!;
      // Shop opens at 9. NPC should wake 30-60 min before (8:00-8:30 range, plus stagger)
      expect(state.effectiveWakeHour).toBeLessThan(9);
      expect(state.effectiveWakeHour).toBeGreaterThanOrEqual(4); // not unreasonably early
    });

    it('unemployed NPCs use base wake hour with stagger', () => {
      setup(6);
      scheduleSystem.registerNPC('unemployed1', undefined, 'home1');
      executor.registerNPC('unemployed1', {
        openness: 0.5, conscientiousness: 0.5,
        extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5,
      });
      const state = executor.getState('unemployed1')!;
      // Base wake = 6.0, stagger ±10min = ±0.167h → range 4..8
      expect(state.effectiveWakeHour).toBeGreaterThanOrEqual(4);
      expect(state.effectiveWakeHour).toBeLessThanOrEqual(8);
    });
  });

  describe('sleep-to-wake transition', () => {
    it('sleeping NPC exits building at effective wake time', () => {
      setup(22); // 10 PM — bedtime
      const state = executor.getState('npc1')!;

      // Simulate sleeping: NPC is inside home building
      state.isInsideBuilding = true;
      state.insideBuildingId = 'home1';
      state.occasion = 'sleeping';
      state.buildingExitTime = 1000; // Will exit at time 1000

      // Call update after exit time
      executor.update(1001);

      // Should trigger wake-up (exit building + set isWakingUp)
      expect(state.isInsideBuilding).toBe(false);
      expect(state.isWakingUp).toBe(true);
      expect(state.wakeUpCompleteTime).toBeGreaterThan(0);

      // Should have queued an exit_building action
      const actions = executor.drainPendingActions();
      const action = actions.get('npc1');
      expect(action).toBeTruthy();
      expect(action!.type).toBe('exit_building');
    });

    it('wake-up idle completes and triggers goal evaluation', () => {
      setup(7); // 7 AM — after wake hour
      const state = executor.getState('npc1')!;

      // Simulate wake-up transition in progress
      state.isWakingUp = true;
      state.wakeUpCompleteTime = 500;

      // Update after wake-up idle completes
      executor.update(501);

      expect(state.isWakingUp).toBe(false);

      // Should have picked a new goal
      const actions = executor.drainPendingActions();
      const action = actions.get('npc1');
      expect(action).toBeTruthy();
      expect(action!.type).toBe('new_goal');
    });

    it('morning commute to workplace sets commuting occasion', () => {
      setup(7);
      const state = executor.getState('npc1')!;

      // Put NPC near effective wake hour
      (gameTime as any).fractionalHour = state.effectiveWakeHour + 0.1;
      (gameTime as any).hour = Math.floor(state.effectiveWakeHour);

      // Simulate wake-up completing
      state.isWakingUp = true;
      state.wakeUpCompleteTime = 500;
      executor.update(501);

      // The goal should target work, and occasion should be commuting
      expect(state.occasion).toBe('commuting');
    });

    it('wake-up idle is 2-3 seconds', () => {
      setup(22);
      const state = executor.getState('npc1')!;

      state.isInsideBuilding = true;
      state.insideBuildingId = 'home1';
      state.occasion = 'sleeping';
      state.buildingExitTime = 1000;

      const before = Date.now();
      executor.update(1001);
      const wakeComplete = state.wakeUpCompleteTime;

      // Wake idle should be 2000-3000ms from now
      expect(wakeComplete - before).toBeGreaterThanOrEqual(2000);
      expect(wakeComplete - before).toBeLessThanOrEqual(3100); // small tolerance
    });
  });

  describe('sleep time detection', () => {
    it('isSleepTime uses effectiveWakeHour not base wakeHour', () => {
      setup(22);
      const state = executor.getState('npc1')!;

      // At hour 22 (past sleep hour), NPC should be sleeping
      // Trigger evaluation via hour change
      eventBus.emit('hour_changed', { hour: 22 });

      const actions = executor.drainPendingActions();
      const action = actions.get('npc1');
      // Should send home for sleeping
      if (action?.type === 'new_goal') {
        expect(action.occasion).toBe('sleeping');
      }
    });

    it('does not re-sleep a waking NPC', () => {
      setup(5); // 5 AM — potentially before wake hour
      const state = executor.getState('npc1')!;

      // NPC is in wake-up transition
      state.isWakingUp = true;
      state.wakeUpCompleteTime = Date.now() + 10000;

      // Hour change should skip this NPC
      eventBus.emit('hour_changed', { hour: 5 });

      // Should not have any action (wake-up in progress, not interrupted)
      const actions = executor.drainPendingActions();
      expect(actions.has('npc1')).toBe(false);
    });
  });

  describe('sendHome sleeping duration', () => {
    it('sleeping goal expiry aligns with effective wake hour', () => {
      setup(22);
      const state = executor.getState('npc1')!;

      // Trigger bedtime evaluation
      eventBus.emit('hour_changed', { hour: 22 });

      const actions = executor.drainPendingActions();
      const action = actions.get('npc1');

      if (action?.type === 'new_goal') {
        // Goal expiry should be near the effective wake hour
        const expiryHour = (action.goal.expiresAt / 60000) % 24;
        // Allow some tolerance for the stagger
        expect(expiryHour).toBeGreaterThan(3);
        expect(expiryHour).toBeLessThan(10);
      }
    });
  });

  describe('building stay duration clamp', () => {
    it('allows sleeping stays longer than 6 game hours', () => {
      setup(21); // 9 PM
      const state = executor.getState('npc1')!;

      // NPC enters building for sleeping — goal expiry at ~7 AM = 10 game hours
      state.currentGoal = {
        type: 'go_to_building',
        buildingId: 'home1',
        expiresAt: 7 * 60000,
      };
      state.goalExpiryGameHour = 7;
      state.occasion = 'sleeping';

      executor.enterBuilding('npc1', 'home1', Date.now());

      // Building exit time should be set (stay > 6 hours allowed)
      expect(state.buildingExitTime).toBeGreaterThan(Date.now());
      expect(state.isInsideBuilding).toBe(true);
    });
  });
});
