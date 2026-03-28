import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameTimeManager } from '../../logic/GameTimeManager';
import { GameEventBus } from '../../logic/GameEventBus';
import { NPCLocationCycler } from '../NPCLocationCycler';
import { NPCScheduleSystem } from '../NPCScheduleSystem';

// Minimal mock for Vector3 (NPCScheduleSystem uses it internally)
vi.mock('@babylonjs/core', () => ({
  Vector3: class Vector3 {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    add(other: any) { return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z); }
    subtract(other: any) { return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z); }
    normalize() {
      const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      return len > 0 ? new Vector3(this.x / len, this.y / len, this.z / len) : new Vector3();
    }
    scale(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
    static Distance(a: any, b: any) {
      const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  },
  Mesh: class {},
}));

describe('NPCLocationCycler', () => {
  let timeManager: GameTimeManager;
  let scheduleSystem: NPCScheduleSystem;
  let eventBus: GameEventBus;
  let cycler: NPCLocationCycler;

  beforeEach(() => {
    eventBus = new GameEventBus();
    timeManager = new GameTimeManager({ startHour: 8, startMinute: 0 });
    timeManager.setEventBus(eventBus);
    scheduleSystem = new NPCScheduleSystem();
    cycler = new NPCLocationCycler(timeManager, scheduleSystem);
    cycler.setEventBus(eventBus);
  });

  // ── Registration ──────────────────────────────────────────────────────

  it('registers and unregisters NPCs', () => {
    expect(cycler.npcCount).toBe(0);
    cycler.registerNPC('npc-1');
    cycler.registerNPC('npc-2');
    expect(cycler.npcCount).toBe(2);
    expect(cycler.getRegisteredNPCs()).toContain('npc-1');
    expect(cycler.getRegisteredNPCs()).toContain('npc-2');

    cycler.unregisterNPC('npc-1');
    expect(cycler.npcCount).toBe(1);
    expect(cycler.getRegisteredNPCs()).not.toContain('npc-1');
  });

  // ── Virtual time conversion ───────────────────────────────────────────

  it('converts game time to virtual now correctly', () => {
    // At 8:00, virtualNow should be 8 * 60000 = 480000
    const vNow = cycler.getVirtualNow();
    expect(vNow).toBe(8 * 60000);
  });

  it('updates virtual now as game time advances', () => {
    // Advance 2 game hours (2 * 60000ms at default rate)
    timeManager.update(120_000);
    const vNow = cycler.getVirtualNow();
    expect(vNow).toBe(10 * 60000);
  });

  // ── Sleep hour detection ──────────────────────────────────────────────

  it('correctly identifies sleep hours', () => {
    expect(cycler.isSleepHour(22)).toBe(true);
    expect(cycler.isSleepHour(23)).toBe(true);
    expect(cycler.isSleepHour(0)).toBe(true);
    expect(cycler.isSleepHour(3)).toBe(true);
    expect(cycler.isSleepHour(5)).toBe(true);
    expect(cycler.isSleepHour(6)).toBe(false);
    expect(cycler.isSleepHour(12)).toBe(false);
    expect(cycler.isSleepHour(21)).toBe(false);
  });

  // ── Goal evaluation ───────────────────────────────────────────────────

  it('evaluateNPC returns null for unregistered NPC', () => {
    expect(cycler.evaluateNPC('unknown')).toBeNull();
  });

  it('evaluateNPC picks a goal for registered NPC with schedule data', () => {
    // Register NPC in both systems
    scheduleSystem.registerNPC('npc-1', undefined, undefined);
    cycler.registerNPC('npc-1');

    const transition = cycler.evaluateNPC('npc-1');
    // With no buildings/streets, pickNextGoal returns an idle/wander goal
    expect(transition).not.toBeNull();
    expect(transition!.npcId).toBe('npc-1');
    expect(transition!.goal).toBeDefined();
    expect(transition!.goal.type).toBeDefined();
  });

  it('does not re-evaluate same hour if goal not expired', () => {
    scheduleSystem.registerNPC('npc-1');
    cycler.registerNPC('npc-1');

    // First evaluation picks a goal
    const first = cycler.evaluateNPC('npc-1');
    expect(first).not.toBeNull();

    // Second evaluation in same hour should return null (already evaluated)
    const second = cycler.evaluateNPC('npc-1');
    expect(second).toBeNull();
  });

  // ── Force reevaluation ────────────────────────────────────────────────

  it('forceReevaluation clears last-evaluated state', () => {
    scheduleSystem.registerNPC('npc-1');
    cycler.registerNPC('npc-1');

    cycler.evaluateNPC('npc-1');
    // Normally second eval returns null
    expect(cycler.evaluateNPC('npc-1')).toBeNull();

    // Force and re-eval should produce a transition
    cycler.forceReevaluation();
    expect(cycler.evaluateNPC('npc-1')).not.toBeNull();
  });

  // ── evaluateAll ───────────────────────────────────────────────────────

  it('evaluateAll returns transitions for all registered NPCs', () => {
    scheduleSystem.registerNPC('npc-1');
    scheduleSystem.registerNPC('npc-2');
    cycler.registerNPC('npc-1');
    cycler.registerNPC('npc-2');

    const transitions = cycler.evaluateAll();
    expect(transitions.length).toBe(2);
    const ids = transitions.map(t => t.npcId);
    expect(ids).toContain('npc-1');
    expect(ids).toContain('npc-2');
  });

  // ── Pending transitions ───────────────────────────────────────────────

  it('drainPendingTransitions returns and clears pending transitions', () => {
    scheduleSystem.registerNPC('npc-1');
    cycler.registerNPC('npc-1');

    cycler.evaluateAll();
    const first = cycler.drainPendingTransitions();
    expect(first.length).toBe(1);

    // Second drain should be empty
    const second = cycler.drainPendingTransitions();
    expect(second.length).toBe(0);
  });

  // ── Event-driven evaluation ───────────────────────────────────────────

  it('evaluates NPCs on hour_changed event', () => {
    scheduleSystem.registerNPC('npc-1');
    cycler.registerNPC('npc-1');

    // Advance time to trigger hour_changed
    timeManager.update(60_000); // 1 game hour

    const transitions = cycler.drainPendingTransitions();
    expect(transitions.length).toBe(1);
    expect(transitions[0].npcId).toBe('npc-1');
  });

  it('force-reevaluates on time_of_day_changed event', () => {
    // Start at hour 8 (morning), advance to hour 10 (midday transition)
    scheduleSystem.registerNPC('npc-1');
    cycler.registerNPC('npc-1');

    // Clear any initial transitions
    cycler.evaluateAll();
    cycler.drainPendingTransitions();

    // Advance from 8 to 10 (morning→midday triggers time_of_day_changed)
    timeManager.update(120_000); // 2 hours

    const transitions = cycler.drainPendingTransitions();
    expect(transitions.length).toBeGreaterThan(0);
  });

  // ── Sleep state tracking ──────────────────────────────────────────────

  it('tracks NPC sleep state based on game hour', () => {
    scheduleSystem.registerNPC('npc-1');
    cycler.registerNPC('npc-1');

    // At hour 8, not sleeping
    cycler.evaluateNPC('npc-1');
    expect(cycler.isNPCSleeping('npc-1')).toBe(false);

    // Advance to hour 23 (sleep time)
    timeManager.setTime(23, 0);
    cycler.forceReevaluation();
    cycler.evaluateNPC('npc-1');
    expect(cycler.isNPCSleeping('npc-1')).toBe(true);
  });

  // ── Duration conversion ───────────────────────────────────────────────

  it('converts game hours to virtual ms', () => {
    expect(cycler.durationToVirtualMs(1)).toBe(60000);
    expect(cycler.durationToVirtualMs(0.5)).toBe(30000);
    expect(cycler.durationToVirtualMs(24)).toBe(1440000);
  });

  // ── Dispose ───────────────────────────────────────────────────────────

  it('dispose clears all state and stops listening', () => {
    scheduleSystem.registerNPC('npc-1');
    cycler.registerNPC('npc-1');
    cycler.dispose();

    expect(cycler.npcCount).toBe(0);

    // Events should no longer trigger evaluations
    timeManager.update(60_000);
    const transitions = cycler.drainPendingTransitions();
    expect(transitions.length).toBe(0);
  });

  // ── getNPCState ───────────────────────────────────────────────────────

  it('returns undefined for unregistered NPC state', () => {
    expect(cycler.getNPCState('nope')).toBeUndefined();
  });

  it('returns state for registered NPC', () => {
    cycler.registerNPC('npc-1');
    const state = cycler.getNPCState('npc-1');
    expect(state).toBeDefined();
    expect(state!.lastEvaluatedHour).toBe(-1);
    expect(state!.goalExpiryHour).toBe(-1);
    expect(state!.isSleeping).toBe(false);
  });
});
