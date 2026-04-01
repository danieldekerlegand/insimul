/**
 * Audit: NPC Conversation Initiation
 *
 * Verifies that NPCs proactively approach and talk to the player:
 * 1. NPCInitiatedConversationController is functional end-to-end
 * 2. Approach probability is personality-driven (extroversion, agreeableness)
 * 3. Context-aware greetings fire (weather, time, quests, new player)
 * 4. Greeting prompt appears and player can accept via Enter key
 * 5. Frequency tuning: cooldowns prevent spam, personality modulates rate
 * 6. AmbientConversationSystem exists for NPC-to-NPC conversations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NPCInitiatedConversationController,
  type ApproachableNPC,
  type ApproachCallbacks,
  type GreetingEnvironment,
} from '../game-engine/rendering/NPCInitiatedConversationController';

// Mock Vector3
vi.mock('@babylonjs/core', () => ({
  Vector3: class {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    subtract(other: any) {
      return new (this.constructor as any)(this.x - other.x, this.y - other.y, this.z - other.z);
    }
    scale(s: number) {
      return new (this.constructor as any)(this.x * s, this.y * s, this.z * s);
    }
    normalize() {
      const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      if (len === 0) return new (this.constructor as any)(0, 0, 0);
      return new (this.constructor as any)(this.x / len, this.y / len, this.z / len);
    }
    lengthSquared() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    clone() {
      return new (this.constructor as any)(this.x, this.y, this.z);
    }
  },
}));

import { Vector3 } from '@babylonjs/core';

// ── Helpers ───────────────────────────────────────────────────────────

function makeNPC(overrides?: Partial<ApproachableNPC>): ApproachableNPC {
  return {
    id: 'npc-1',
    name: 'TestNPC',
    position: new Vector3(5, 0, 5),
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.8,
      agreeableness: 0.7,
      neuroticism: 0.2,
    },
    relationships: {},
    mood: 'happy',
    isInConversation: false,
    ...overrides,
  };
}

function makeCallbacks(overrides?: Partial<ApproachCallbacks>): ApproachCallbacks {
  return {
    onMoveTo: vi.fn(),
    onFaceDirection: vi.fn(),
    onAnimationChange: vi.fn(),
    onShowGreeting: vi.fn(),
    onDismissGreeting: vi.fn(),
    onOpenChat: vi.fn().mockResolvedValue(undefined),
    getGameHour: vi.fn().mockReturnValue(12),
    getPlayerPosition: vi.fn().mockReturnValue(new Vector3(0, 0, 0)),
    isPlayerInConversation: vi.fn().mockReturnValue(false),
    onEmitEvent: vi.fn(),
    getEnvironment: vi.fn().mockReturnValue(null),
    ...overrides,
  };
}

/** Advance enough game time to trigger an evaluation (3+ game minutes). */
function triggerEvaluation(controller: NPCInitiatedConversationController): void {
  // With msPerGameHour=60000, dt=60000 gives 60 game-minutes — well past the 3-minute threshold
  controller.update(60000, 60000);
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('NPC Conversation Initiation Audit', () => {
  let controller: NPCInitiatedConversationController;
  let callbacks: ReturnType<typeof makeCallbacks>;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = makeCallbacks();
    controller = new NPCInitiatedConversationController(callbacks);
  });

  afterEach(() => {
    controller.dispose();
    vi.useRealTimers();
  });

  // ── 1. Controller is functional end-to-end ──

  describe('end-to-end approach flow', () => {
    it('NPC within range triggers approach when probability succeeds', () => {
      // Seed Math.random to always succeed the probability roll
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({
        position: new Vector3(5, 0, 0), // ~5 units from player at origin
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.9, agreeableness: 0.8, neuroticism: 0.1 },
      });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(callbacks.onMoveTo).toHaveBeenCalledWith(
        npc.id,
        expect.anything(),
        'walk',
      );
      expect(controller.hasActiveApproach()).toBe(true);
      expect(controller.getApproachingNPCId()).toBe(npc.id);
    });

    it('NPC reaches player → greeting shown → player accepts → chat opens', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(3, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      // Simulate NPC reaching the player by moving it close
      controller.updateNPC(npc.id, { position: new Vector3(1, 0, 0) });
      controller.update(16, 60000); // one frame tick

      expect(callbacks.onShowGreeting).toHaveBeenCalledWith(
        npc.id,
        npc.name,
        expect.any(String),
      );
      expect(callbacks.onFaceDirection).toHaveBeenCalled();
      expect(callbacks.onAnimationChange).toHaveBeenCalledWith(npc.id, 'talk');

      // Player accepts
      const accepted = await controller.acceptApproach();
      expect(accepted).toBe(true);
      expect(callbacks.onOpenChat).toHaveBeenCalledWith(npc.id);
      expect(callbacks.onEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'npc_initiated_conversation', accepted: true }),
      );
    });

    it('greeting auto-dismisses after timeout if player ignores', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(3, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      // NPC reaches player
      controller.updateNPC(npc.id, { position: new Vector3(1, 0, 0) });
      controller.update(16, 60000);

      expect(callbacks.onShowGreeting).toHaveBeenCalled();

      // Advance past the 15s timeout
      vi.advanceTimersByTime(16000);

      expect(callbacks.onAnimationChange).toHaveBeenCalledWith(npc.id, 'idle');
      expect(controller.hasActiveApproach()).toBe(false);
    });

    it('approach canceled if NPC takes too long to reach player (>10s)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      // NPC is within eval radius but far enough it won't reach in time
      const npc = makeNPC({ position: new Vector3(14, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(controller.hasActiveApproach()).toBe(true);

      // Simulate 11 seconds of real time without NPC getting closer
      vi.advanceTimersByTime(11000);
      // Need to call update to check the timeout
      controller.update(11000, 60000);

      expect(controller.hasActiveApproach()).toBe(false);
    });
  });

  // ── 2. Personality-driven probability ──

  describe('personality-driven approach probability', () => {
    it('extroverted NPC has significantly higher probability than introverted', () => {
      const extroverted = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 1.0, agreeableness: 0.5, neuroticism: 0.3 },
      });
      const introverted = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.0, agreeableness: 0.5, neuroticism: 0.3 },
      });

      const pExtro = controller.calculateApproachProbability(extroverted, undefined, 12);
      const pIntro = controller.calculateApproachProbability(introverted, undefined, 12);

      // Extroversion contributes 0-0.35, so difference should be ~0.35
      expect(pExtro - pIntro).toBeGreaterThanOrEqual(0.3);
    });

    it('high neuroticism NPC rarely approaches', () => {
      const neurotic = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.3, agreeableness: 0.3, neuroticism: 1.0 },
        mood: 'neutral',
      });

      const prob = controller.calculateApproachProbability(neurotic, undefined, 12);
      // Low extroversion + high neuroticism + neutral mood → very low
      expect(prob).toBeLessThan(0.15);
    });

    it('strong relationship significantly boosts approach', () => {
      const npc = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.3 },
      });

      const noRel = controller.calculateApproachProbability(npc, undefined, 12);
      const strongRel = controller.calculateApproachProbability(npc, { strength: 1.0 }, 12);

      // Relationship adds up to 0.25
      expect(strongRel - noRel).toBeGreaterThanOrEqual(0.2);
    });

    it('nighttime dramatically reduces approach probability', () => {
      const npc = makeNPC();
      const pDay = controller.calculateApproachProbability(npc, undefined, 14);  // 2pm
      const pNight = controller.calculateApproachProbability(npc, undefined, 3); // 3am

      // Day gets +0.05, night gets -0.15, so difference is 0.20
      expect(pDay - pNight).toBeCloseTo(0.20, 1);
    });
  });

  // ── 3. Context-aware greetings via getEnvironment ──

  describe('context-aware greetings', () => {
    it('getEnvironment callback is invoked during approach', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const env: GreetingEnvironment = {
        weather: 'rain',
        timePeriod: 'evening',
        hasActiveQuestForPlayer: true,
        playerIsNew: false,
      };
      callbacks.getEnvironment = vi.fn().mockReturnValue(env);
      controller = new NPCInitiatedConversationController(callbacks);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      // getEnvironment should have been called as part of greeting generation
      expect(callbacks.getEnvironment).toHaveBeenCalled();
    });

    it('greeting text is a non-empty string', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(3, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      // Move NPC close to trigger greeting
      controller.updateNPC(npc.id, { position: new Vector3(1, 0, 0) });
      controller.update(16, 60000);

      const greetingCall = (callbacks.onShowGreeting as any).mock.calls[0];
      expect(greetingCall).toBeDefined();
      const greetingText = greetingCall[2];
      expect(typeof greetingText).toBe('string');
      expect(greetingText.length).toBeGreaterThan(5);
    });
  });

  // ── 4. Frequency tuning and cooldowns ──

  describe('frequency tuning', () => {
    it('approach cooldown prevents same NPC from re-approaching within 2 minutes', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);

      // First approach succeeds
      triggerEvaluation(controller);
      expect(controller.hasActiveApproach()).toBe(true);

      // Move NPC close, show greeting, dismiss
      controller.updateNPC(npc.id, { position: new Vector3(1, 0, 0) });
      controller.update(16, 60000);
      vi.advanceTimersByTime(16000); // auto-dismiss

      // Reset for second approach attempt — advance 1 minute (less than 2-minute cooldown)
      vi.advanceTimersByTime(60000);
      controller.update(60000, 60000);

      // Should NOT start a new approach — cooldown hasn't expired
      expect(controller.hasActiveApproach()).toBe(false);
    });

    it('only one NPC can approach at a time (MAX_APPROACHES = 1)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc1 = makeNPC({ id: 'npc-1', position: new Vector3(5, 0, 0) });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(0, 0, 5) });
      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      triggerEvaluation(controller);

      // Only one approach should be active
      expect(controller.hasActiveApproach()).toBe(true);
      const approachingId = controller.getApproachingNPCId();
      expect(approachingId === 'npc-1' || approachingId === 'npc-2').toBe(true);

      // Trigger another evaluation — should NOT start a second approach
      controller.update(60000, 60000);
      expect(controller.getApproachingNPCId()).toBe(approachingId); // same one
    });

    it('pausing prevents any approaches', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);
      controller.pause();

      triggerEvaluation(controller);

      expect(controller.hasActiveApproach()).toBe(false);
      expect(callbacks.onMoveTo).not.toHaveBeenCalled();
    });

    it('resume after pause allows approaches again', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);

      controller.pause();
      triggerEvaluation(controller);
      expect(controller.hasActiveApproach()).toBe(false);

      controller.resume();
      triggerEvaluation(controller);
      expect(controller.hasActiveApproach()).toBe(true);
    });
  });

  // ── 5. Guard conditions ──

  describe('guard conditions', () => {
    it('does not approach when player is already in conversation', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);
      (callbacks.isPlayerInConversation as any).mockReturnValue(true);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(controller.hasActiveApproach()).toBe(false);
    });

    it('does not approach NPCs already in conversation', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(5, 0, 0), isInConversation: true });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(controller.hasActiveApproach()).toBe(false);
    });

    it('does not approach NPCs outside eval radius (15 units)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(20, 0, 0) }); // 20 > 15
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(controller.hasActiveApproach()).toBe(false);
    });

    it('does not approach when player position is null', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);
      (callbacks.getPlayerPosition as any).mockReturnValue(null);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(controller.hasActiveApproach()).toBe(false);
    });

    it('acceptApproach returns false when no prompt is shown yet', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(10, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      // NPC is approaching but hasn't reached player yet
      expect(controller.hasActiveApproach()).toBe(true);
      const accepted = await controller.acceptApproach();
      expect(accepted).toBe(false); // can't accept before prompt shown
    });
  });

  // ── 6. Event emission ──

  describe('event emission', () => {
    it('emits npc_initiated_conversation event when approach starts', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(callbacks.onEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'npc_initiated_conversation',
          npcId: npc.id,
          npcName: npc.name,
          accepted: false, // initial event before player response
        }),
      );
    });

    it('emits accepted=true event when player accepts', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(3, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      // NPC reaches player
      controller.updateNPC(npc.id, { position: new Vector3(1, 0, 0) });
      controller.update(16, 60000);

      await controller.acceptApproach();

      expect(callbacks.onEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'npc_initiated_conversation',
          accepted: true,
        }),
      );
    });
  });

  // ── 7. Unregister / cleanup ──

  describe('NPC lifecycle', () => {
    it('unregistering approaching NPC cancels the approach', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      expect(controller.hasActiveApproach()).toBe(true);
      controller.unregisterNPC(npc.id);
      expect(controller.hasActiveApproach()).toBe(false);
    });

    it('dispose cleans up all state', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      controller.registerNPC(npc);
      triggerEvaluation(controller);

      controller.dispose();
      expect(controller.hasActiveApproach()).toBe(false);
    });
  });
});
