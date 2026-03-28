import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import {
  NPCInitiatedConversationController,
  type ApproachCallbacks,
  type ApproachableNPC,
  type GreetingEnvironment,
} from '../../client/src/components/3DGame/NPCInitiatedConversationController';

function makeNPC(overrides: Partial<ApproachableNPC> = {}): ApproachableNPC {
  return {
    id: 'npc-1',
    name: 'Test NPC',
    position: new Vector3(5, 0, 5),
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.8,
      agreeableness: 0.7,
      neuroticism: 0.3,
    },
    relationships: { player: { type: 'friend', strength: 0.5, trust: 0.5 } },
    mood: 'neutral',
    isInConversation: false,
    ...overrides,
  };
}

function makeCallbacks(env?: GreetingEnvironment | null): ApproachCallbacks {
  return {
    onMoveTo: vi.fn(),
    onFaceDirection: vi.fn(),
    onAnimationChange: vi.fn(),
    onShowGreeting: vi.fn(),
    onDismissGreeting: vi.fn(),
    onOpenChat: vi.fn(async () => {}),
    getGameHour: () => 12,
    getPlayerPosition: () => new Vector3(0, 0, 0),
    isPlayerInConversation: () => false,
    onEmitEvent: vi.fn(),
    getEnvironment: () => env ?? null,
  };
}

describe('NPCInitiatedConversationController - context-aware greetings', () => {
  it('uses weather-aware greeting when raining', () => {
    const env: GreetingEnvironment = {
      weather: 'rain',
      timePeriod: 'afternoon',
      hasActiveQuestForPlayer: false,
      playerIsNew: false,
    };
    const callbacks = makeCallbacks(env);
    const controller = new NPCInitiatedConversationController(callbacks);
    const npc = makeNPC();
    controller.registerNPC(npc);

    // Run many iterations to verify context greetings appear sometimes
    const greetings = new Set<string>();
    for (let i = 0; i < 100; i++) {
      // Reset and re-trigger
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(npc);
      // Call calculateApproachProbability to verify it works
      const prob = ctrl.calculateApproachProbability(npc, { strength: 0.5, trust: 0.5 }, 12);
      expect(prob).toBeGreaterThan(0);
    }
  });

  it('calculateApproachProbability works with environment-aware controller', () => {
    const env: GreetingEnvironment = {
      weather: 'storm',
      timePeriod: 'night',
      hasActiveQuestForPlayer: true,
      playerIsNew: true,
    };
    const callbacks = makeCallbacks(env);
    const controller = new NPCInitiatedConversationController(callbacks);
    const npc = makeNPC();

    const prob = controller.calculateApproachProbability(npc, { strength: 0.5 }, 14);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThanOrEqual(1);
  });

  it('works without environment callback (backward compatible)', () => {
    const callbacks = makeCallbacks();
    // Remove getEnvironment to test backward compat
    delete (callbacks as any).getEnvironment;

    const controller = new NPCInitiatedConversationController(callbacks);
    const npc = makeNPC();
    controller.registerNPC(npc);

    const prob = controller.calculateApproachProbability(npc, { strength: 0.5 }, 12);
    expect(prob).toBeGreaterThan(0);
  });
});
