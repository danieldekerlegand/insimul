/**
 * Tests for NPCInitiatedConversationController
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/NPCInitiatedConversationController.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NPCInitiatedConversationController,
  type ApproachableNPC,
  type ApproachCallbacks,
} from '../NPCInitiatedConversationController';

// Mock Vector3 (Babylon.js isn't available in test environment)
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
    ...overrides,
  };
}

describe('NPCInitiatedConversationController', () => {
  let controller: NPCInitiatedConversationController;
  let callbacks: ReturnType<typeof makeCallbacks>;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = makeCallbacks();
    controller = new NPCInitiatedConversationController(callbacks);
  });

  describe('calculateApproachProbability', () => {
    it('returns higher probability for extroverted NPCs', () => {
      const extroverted = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.9, agreeableness: 0.5, neuroticism: 0.2 } });
      const introverted = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.1, agreeableness: 0.5, neuroticism: 0.2 } });

      const pExtro = controller.calculateApproachProbability(extroverted, undefined, 12);
      const pIntro = controller.calculateApproachProbability(introverted, undefined, 12);

      expect(pExtro).toBeGreaterThan(pIntro);
    });

    it('returns higher probability for agreeable NPCs', () => {
      const agreeable = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.9, neuroticism: 0.3 } });
      const disagreeable = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.1, neuroticism: 0.3 } });

      const pAgree = controller.calculateApproachProbability(agreeable, undefined, 12);
      const pDisagree = controller.calculateApproachProbability(disagreeable, undefined, 12);

      expect(pAgree).toBeGreaterThan(pDisagree);
    });

    it('returns higher probability with strong relationship', () => {
      const npc = makeNPC();
      const noRel = controller.calculateApproachProbability(npc, undefined, 12);
      const strongRel = controller.calculateApproachProbability(npc, { strength: 0.9, trust: 0.8 }, 12);

      expect(strongRel).toBeGreaterThan(noRel);
    });

    it('returns higher probability for positive moods', () => {
      const happy = makeNPC({ mood: 'happy' });
      const angry = makeNPC({ mood: 'angry' });

      const pHappy = controller.calculateApproachProbability(happy, undefined, 12);
      const pAngry = controller.calculateApproachProbability(angry, undefined, 12);

      expect(pHappy).toBeGreaterThan(pAngry);
    });

    it('reduces probability at night', () => {
      const npc = makeNPC();
      const pDay = controller.calculateApproachProbability(npc, undefined, 14);
      const pNight = controller.calculateApproachProbability(npc, undefined, 2);

      expect(pDay).toBeGreaterThan(pNight);
    });

    it('reduces probability for neurotic NPCs', () => {
      const calm = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.1 } });
      const neurotic = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.9 } });

      const pCalm = controller.calculateApproachProbability(calm, undefined, 12);
      const pNeurotic = controller.calculateApproachProbability(neurotic, undefined, 12);

      expect(pCalm).toBeGreaterThan(pNeurotic);
    });

    it('clamps probability between 0 and 1', () => {
      const extreme = makeNPC({
        personality: { openness: 1, conscientiousness: 1, extroversion: 1, agreeableness: 1, neuroticism: 0 },
        mood: 'excited',
      });
      const prob = controller.calculateApproachProbability(extreme, { strength: 1, trust: 1 }, 12);
      expect(prob).toBeLessThanOrEqual(1);
      expect(prob).toBeGreaterThanOrEqual(0);
    });
  });

  describe('approach lifecycle', () => {
    it('starts with no active approach', () => {
      expect(controller.hasActiveApproach()).toBe(false);
      expect(controller.getApproachingNPCId()).toBeNull();
    });

    it('does not evaluate when paused', () => {
      controller.registerNPC(makeNPC({ position: new Vector3(3, 0, 3) }));
      controller.pause();

      // Force evaluation by advancing enough game time
      // With msPerGameHour=60000, dt=60000 means 60 game-minutes
      controller.update(60000, 60000);

      expect(callbacks.onMoveTo).not.toHaveBeenCalled();
    });

    it('does not evaluate when player is in conversation', () => {
      (callbacks.isPlayerInConversation as any).mockReturnValue(true);
      controller.registerNPC(makeNPC({ position: new Vector3(3, 0, 3) }));

      controller.update(60000, 60000);

      expect(callbacks.onMoveTo).not.toHaveBeenCalled();
    });

    it('does not evaluate when no NPCs are near the player', () => {
      controller.registerNPC(makeNPC({ position: new Vector3(100, 0, 100) }));

      controller.update(60000, 60000);

      expect(callbacks.onMoveTo).not.toHaveBeenCalled();
    });

    it('does not approach NPCs already in conversation', () => {
      controller.registerNPC(makeNPC({
        position: new Vector3(3, 0, 3),
        isInConversation: true,
      }));

      controller.update(60000, 60000);

      expect(callbacks.onMoveTo).not.toHaveBeenCalled();
    });
  });

  describe('acceptApproach', () => {
    it('returns false when no active approach', async () => {
      const result = await controller.acceptApproach();
      expect(result).toBe(false);
    });
  });

  describe('registerNPC / unregisterNPC', () => {
    it('tracks registered NPCs', () => {
      const npc = makeNPC();
      controller.registerNPC(npc);
      // Can update without error
      controller.updateNPC(npc.id, { mood: 'sad' });
      controller.unregisterNPC(npc.id);
    });
  });

  describe('dispose', () => {
    it('cleans up all resources', () => {
      controller.registerNPC(makeNPC());
      controller.dispose();
      expect(controller.hasActiveApproach()).toBe(false);
    });
  });

  describe('pause/resume', () => {
    it('can pause and resume', () => {
      controller.pause();
      controller.resume();
      // Should not throw
      controller.update(100, 60000);
    });
  });
});
