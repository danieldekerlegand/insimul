import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import { NPCInitiatedConversationController, type ApproachCallbacks, type ApproachableNPC } from '../game-engine/rendering/NPCInitiatedConversationController';
import { GameEventBus } from '../game-engine/logic/GameEventBus';

// ── Helpers ─────────────────────────────────────────────────────────────

function makeNPC(id: string, position: Vector3, overrides: Partial<ApproachableNPC> = {}): ApproachableNPC {
  return {
    id,
    name: `NPC_${id}`,
    position,
    personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
    relationships: {},
    mood: 'neutral',
    isInConversation: false,
    ...overrides,
  };
}

function makeCallbacks(overrides: Partial<ApproachCallbacks> = {}): ApproachCallbacks {
  return {
    onMoveTo: vi.fn(),
    onFaceDirection: vi.fn(),
    onAnimationChange: vi.fn(),
    onShowGreeting: vi.fn(),
    onDismissGreeting: vi.fn(),
    onOpenChat: vi.fn().mockResolvedValue(undefined),
    getGameHour: () => 12,
    getPlayerPosition: () => new Vector3(0, 0, 0),
    isPlayerInConversation: () => false,
    onEmitEvent: vi.fn(),
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('Pre-warm LLM context on player proximity', () => {
  let controller: NPCInitiatedConversationController;
  let callbacks: ApproachCallbacks;
  let emittedEvents: any[];

  beforeEach(() => {
    emittedEvents = [];
    callbacks = makeCallbacks({
      onEmitEvent: (event: any) => emittedEvents.push(event),
    });
    controller = new NPCInitiatedConversationController(callbacks);
  });

  it('emits player_near_npc when NPC is within 10-unit radius', () => {
    const npc = makeNPC('baker', new Vector3(8, 0, 0)); // 8 units away
    controller.registerNPC(npc);

    // Call update to trigger evaluatePreWarm
    controller.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(1);
    expect(preWarmEvents[0].npcId).toBe('baker');
    expect(preWarmEvents[0].npcName).toBe('NPC_baker');
    expect(preWarmEvents[0].distance).toBeCloseTo(8);
  });

  it('does NOT emit player_near_npc when NPC is beyond 10-unit radius', () => {
    const npc = makeNPC('baker', new Vector3(11, 0, 0)); // 11 units away
    controller.registerNPC(npc);

    controller.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(0);
  });

  it('only pre-warms the nearest NPC when multiple are in range', () => {
    const npcClose = makeNPC('close', new Vector3(3, 0, 0)); // 3 units
    const npcFar = makeNPC('far', new Vector3(9, 0, 0)); // 9 units
    controller.registerNPC(npcClose);
    controller.registerNPC(npcFar);

    controller.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(1);
    expect(preWarmEvents[0].npcId).toBe('close');
  });

  it('does not re-emit for the same NPC until player moves away', () => {
    const npc = makeNPC('baker', new Vector3(5, 0, 0));
    controller.registerNPC(npc);

    // First update — should fire
    controller.update(100, 60000);
    // Second update — same NPC, should NOT fire again
    controller.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(1);
  });

  it('re-emits after player moves away and returns', () => {
    const npc = makeNPC('baker', new Vector3(5, 0, 0));
    controller.registerNPC(npc);

    // First approach
    controller.update(100, 60000);
    expect(emittedEvents.filter((e) => e.type === 'player_near_npc')).toHaveLength(1);

    // Move player away (NPC now 15 units away — out of range)
    const farCallbacks = makeCallbacks({
      ...callbacks,
      getPlayerPosition: () => new Vector3(20, 0, 0),
      onEmitEvent: callbacks.onEmitEvent,
    });
    // Need a new controller or override position — use original with moved NPC
    controller.updateNPC('baker', { position: new Vector3(35, 0, 0) });
    controller.update(100, 60000);

    // Move back in range — but cooldown is 60s, so advance time
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61000);
    controller.updateNPC('baker', { position: new Vector3(5, 0, 0) });
    controller.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(2);

    vi.useRealTimers();
  });

  it('respects 60-second cooldown per NPC', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const npc = makeNPC('baker', new Vector3(5, 0, 0));
    controller.registerNPC(npc);

    // First trigger
    controller.update(100, 60000);
    expect(emittedEvents.filter((e) => e.type === 'player_near_npc')).toHaveLength(1);

    // Move player away to reset lastPreWarmedNpcId
    controller.updateNPC('baker', { position: new Vector3(20, 0, 0) });
    controller.update(100, 60000);

    // Move back in range but within cooldown (30s later)
    vi.setSystemTime(now + 30000);
    controller.updateNPC('baker', { position: new Vector3(5, 0, 0) });
    controller.update(100, 60000);

    // Should NOT fire again — within 60s cooldown
    expect(emittedEvents.filter((e) => e.type === 'player_near_npc')).toHaveLength(1);

    // After cooldown (61s later)
    vi.setSystemTime(now + 61000);
    controller.update(100, 60000);

    expect(emittedEvents.filter((e) => e.type === 'player_near_npc')).toHaveLength(2);

    vi.useRealTimers();
  });

  it('does not emit when player is in conversation', () => {
    const inConvoCallbacks = makeCallbacks({
      isPlayerInConversation: () => true,
      onEmitEvent: (event: any) => emittedEvents.push(event),
    });
    const ctrl = new NPCInitiatedConversationController(inConvoCallbacks);
    ctrl.registerNPC(makeNPC('baker', new Vector3(5, 0, 0)));

    ctrl.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(0);
  });

  it('skips NPCs that are in conversation', () => {
    const busyNpc = makeNPC('busy', new Vector3(3, 0, 0), { isInConversation: true });
    const freeNpc = makeNPC('free', new Vector3(8, 0, 0));
    controller.registerNPC(busyNpc);
    controller.registerNPC(freeNpc);

    controller.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(1);
    expect(preWarmEvents[0].npcId).toBe('free');
  });

  it('does not emit when player position is null', () => {
    const nullPosCallbacks = makeCallbacks({
      getPlayerPosition: () => null,
      onEmitEvent: (event: any) => emittedEvents.push(event),
    });
    const ctrl = new NPCInitiatedConversationController(nullPosCallbacks);
    ctrl.registerNPC(makeNPC('baker', new Vector3(5, 0, 0)));

    ctrl.update(100, 60000);

    const preWarmEvents = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(preWarmEvents).toHaveLength(0);
  });

  it('switches to closer NPC when a new one enters range', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const npcA = makeNPC('far_npc', new Vector3(9, 0, 0));
    controller.registerNPC(npcA);

    controller.update(100, 60000);
    expect(emittedEvents.filter((e) => e.type === 'player_near_npc')[0].npcId).toBe('far_npc');

    // A closer NPC enters range
    const npcB = makeNPC('close_npc', new Vector3(2, 0, 0));
    controller.registerNPC(npcB);

    controller.update(100, 60000);
    const events = emittedEvents.filter((e) => e.type === 'player_near_npc');
    expect(events).toHaveLength(2);
    expect(events[1].npcId).toBe('close_npc');

    vi.useRealTimers();
  });

  it('dispose clears pre-warm state', () => {
    const npc = makeNPC('baker', new Vector3(5, 0, 0));
    controller.registerNPC(npc);

    controller.update(100, 60000);
    expect(emittedEvents.filter((e) => e.type === 'player_near_npc')).toHaveLength(1);

    controller.dispose();

    // After dispose, registering new NPC and updating should work fresh
    const ctrl2 = new NPCInitiatedConversationController(callbacks);
    ctrl2.registerNPC(npc);
    ctrl2.update(100, 60000);
    expect(emittedEvents.filter((e) => e.type === 'player_near_npc')).toHaveLength(2);
  });
});

describe('GameEventBus player_near_npc event', () => {
  it('emits and receives player_near_npc events with correct typing', () => {
    const bus = new GameEventBus();
    const received: any[] = [];

    bus.on('player_near_npc', (event) => {
      received.push(event);
    });

    bus.emit({
      type: 'player_near_npc',
      npcId: 'baker',
      npcName: 'Baker',
      worldId: 'world1',
      distance: 5.5,
    });

    expect(received).toHaveLength(1);
    expect(received[0].npcId).toBe('baker');
    expect(received[0].distance).toBe(5.5);
  });
});
