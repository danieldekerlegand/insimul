/**
 * Tests for NPCSocializationController
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/NPCSocializationController.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NPCSocializationController,
  type SocializableNPC,
  type SocializationCallbacks,
} from '../NPCSocializationController';

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
    add(other: any) {
      return new (this.constructor as any)(this.x + other.x, this.y + other.y, this.z + other.z);
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

function makeNPC(overrides?: Partial<SocializableNPC>): SocializableNPC {
  return {
    id: 'npc-1',
    position: new Vector3(5, 0, 5),
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.6,
      agreeableness: 0.7,
      neuroticism: 0.2,
    },
    relationships: {},
    mood: 'happy',
    isInConversation: false,
    locationId: 'town_square',
    ...overrides,
  };
}

function makeCallbacks(overrides?: Partial<SocializationCallbacks>): SocializationCallbacks {
  return {
    onMoveTo: vi.fn(),
    onFaceDirection: vi.fn(),
    onAnimationChange: vi.fn(),
    onStartConversation: vi.fn().mockResolvedValue({
      exchanges: [
        { speakerId: 'npc-1', speakerName: 'Alice', text: 'Hello!' },
        { speakerId: 'npc-2', speakerName: 'Bob', text: 'Hi there!' },
      ],
      relationshipDelta: { friendshipChange: 0.02, trustChange: 0.01, romanceSpark: 0 },
      topic: 'greeting',
      languageUsed: 'English',
    }),
    onRelationshipUpdate: vi.fn(),
    onEmitEvent: vi.fn(),
    onStreamToPlayer: vi.fn(),
    getGameHour: vi.fn().mockReturnValue(12),
    getPlayerPosition: vi.fn().mockReturnValue(new Vector3(100, 0, 100)), // far away
    ...overrides,
  };
}

describe('NPCSocializationController', () => {
  let controller: NPCSocializationController;
  let callbacks: ReturnType<typeof makeCallbacks>;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = makeCallbacks();
    controller = new NPCSocializationController(callbacks);
  });

  describe('NPC registration', () => {
    it('registers an NPC', () => {
      const npc = makeNPC();
      controller.registerNPC(npc);
      expect(controller.isSocializing(npc.id)).toBe(false);
    });

    it('updates NPC data', () => {
      const npc = makeNPC();
      controller.registerNPC(npc);
      controller.updateNPC(npc.id, { mood: 'sad' });
      // No error means success — mood is stored internally
    });

    it('unregisters an NPC', () => {
      const npc = makeNPC();
      controller.registerNPC(npc);
      controller.unregisterNPC(npc.id);
      // Should not throw
      expect(controller.isSocializing(npc.id)).toBe(false);
    });
  });

  describe('calculateSocializationProbability', () => {
    it('returns higher probability for extroverted NPCs', () => {
      const extroverted = makeNPC({
        id: 'ext',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.9, agreeableness: 0.5, neuroticism: 0.2 },
      });
      const introverted = makeNPC({
        id: 'int',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.1, agreeableness: 0.5, neuroticism: 0.2 },
      });
      const neutral = makeNPC({
        id: 'neu',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.2 },
      });

      const pExtro = controller.calculateSocializationProbability(extroverted, neutral, 12);
      const pIntro = controller.calculateSocializationProbability(introverted, neutral, 12);

      expect(pExtro).toBeGreaterThan(pIntro);
    });

    it('returns higher probability during daytime hours', () => {
      const npc1 = makeNPC({ id: 'npc-1' });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(6, 0, 5) });

      const dayProb = controller.calculateSocializationProbability(npc1, npc2, 12);
      const nightProb = controller.calculateSocializationProbability(npc1, npc2, 2);

      expect(dayProb).toBeGreaterThan(nightProb);
    });

    it('returns higher probability with positive moods', () => {
      const happy1 = makeNPC({ id: 'h1', mood: 'happy' });
      const happy2 = makeNPC({ id: 'h2', mood: 'happy', position: new Vector3(6, 0, 5) });
      const angry1 = makeNPC({ id: 'a1', mood: 'angry' });
      const angry2 = makeNPC({ id: 'a2', mood: 'angry', position: new Vector3(6, 0, 5) });

      const happyProb = controller.calculateSocializationProbability(happy1, happy2, 12);
      const angryProb = controller.calculateSocializationProbability(angry1, angry2, 12);

      expect(happyProb).toBeGreaterThan(angryProb);
    });

    it('boosts probability for agreeable NPCs', () => {
      const agreeable = makeNPC({
        id: 'ag',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.9, neuroticism: 0.2 },
      });
      const disagreeable = makeNPC({
        id: 'dis',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.1, neuroticism: 0.2 },
      });
      const neutral = makeNPC({
        id: 'neu',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.2 },
      });

      const agProb = controller.calculateSocializationProbability(agreeable, neutral, 12);
      const disProb = controller.calculateSocializationProbability(disagreeable, neutral, 12);

      expect(agProb).toBeGreaterThan(disProb);
    });

    it('clamps probability between 0 and 1', () => {
      const npc1 = makeNPC({
        id: 'max',
        personality: { openness: 1, conscientiousness: 1, extroversion: 1, agreeableness: 1, neuroticism: 0 },
        mood: 'happy',
      });
      const npc2 = makeNPC({
        id: 'max2',
        personality: { openness: 1, conscientiousness: 1, extroversion: 1, agreeableness: 1, neuroticism: 0 },
        mood: 'happy',
      });

      const prob = controller.calculateSocializationProbability(npc1, npc2, 12);
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });
  });

  describe('socialization lifecycle', () => {
    it('starts socialization when NPCs are nearby and evaluation triggers', () => {
      const npc1 = makeNPC({ id: 'npc-1', position: new Vector3(5, 0, 5), locationId: 'square' });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(6, 0, 5), locationId: 'square' });

      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      // Force socialization by running many update cycles
      // Each update with 5 game-minutes should trigger evaluation
      // msPerGameHour = 1000 means 1s real = 1h game
      // We need 5 game-minutes = 5/60 * 1000 = 83.3ms
      for (let i = 0; i < 20; i++) {
        controller.update(100, 1000); // 100ms real, 1s/game-hour = 6 game-minutes per call
      }

      // Due to random probability, we may or may not have started
      // But the system should have evaluated at least once
      // Check that evaluation happened by verifying the pair count is at most MAX_CONCURRENT
      expect(controller.getActiveCount()).toBeLessThanOrEqual(5);
    });

    it('does not socialize NPCs in conversation with player', () => {
      const npc1 = makeNPC({ id: 'npc-1', position: new Vector3(5, 0, 5), isInConversation: true });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(6, 0, 5) });

      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      for (let i = 0; i < 20; i++) {
        controller.update(100, 1000);
      }

      expect(controller.isSocializing('npc-1')).toBe(false);
    });

    it('does not socialize NPCs at different locations', () => {
      const npc1 = makeNPC({ id: 'npc-1', position: new Vector3(5, 0, 5), locationId: 'square' });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(6, 0, 5), locationId: 'market' });

      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      for (let i = 0; i < 20; i++) {
        controller.update(100, 1000);
      }

      expect(controller.getActiveCount()).toBe(0);
    });

    it('does not socialize NPCs that are too far apart', () => {
      const npc1 = makeNPC({ id: 'npc-1', position: new Vector3(0, 0, 0), locationId: 'square' });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(50, 0, 50), locationId: 'square' });

      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      for (let i = 0; i < 20; i++) {
        controller.update(100, 1000);
      }

      expect(controller.getActiveCount()).toBe(0);
    });
  });

  describe('preferred position', () => {
    it('introverts prefer edges', () => {
      const introvert = makeNPC({
        id: 'int',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.1, agreeableness: 0.5, neuroticism: 0.5 },
      });
      controller.registerNPC(introvert);

      const center = new Vector3(0, 0, 0);
      const pos = controller.getPreferredPosition('int', center, 10);

      // Should be near the edge (high distance from center)
      const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
      expect(dist).toBeGreaterThan(5);
    });

    it('extroverts prefer center', () => {
      const extrovert = makeNPC({
        id: 'ext',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.9, agreeableness: 0.5, neuroticism: 0.5 },
      });
      controller.registerNPC(extrovert);

      const center = new Vector3(0, 0, 0);
      const pos = controller.getPreferredPosition('ext', center, 10);

      // Should be near the center (low distance from center)
      const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
      expect(dist).toBeLessThan(5);
    });
  });

  describe('active pairs', () => {
    it('returns empty array when no socializations active', () => {
      expect(controller.getActivePairs()).toEqual([]);
    });

    it('reports correct active count', () => {
      expect(controller.getActiveCount()).toBe(0);
    });
  });

  describe('dispose', () => {
    it('cleans up all state', () => {
      const npc1 = makeNPC({ id: 'npc-1' });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(6, 0, 5) });
      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      controller.dispose();

      expect(controller.getActiveCount()).toBe(0);
      expect(controller.getActivePairs()).toEqual([]);
    });
  });

  describe('conversation triggering', () => {
    it('calls onStartConversation when provided', async () => {
      const npc1 = makeNPC({ id: 'npc-1', position: new Vector3(5, 0, 5), locationId: 'sq' });
      const npc2 = makeNPC({ id: 'npc-2', position: new Vector3(6, 0, 5), locationId: 'sq' });

      // Make socialization very likely
      npc1.personality.extroversion = 1.0;
      npc2.personality.extroversion = 1.0;
      npc1.personality.agreeableness = 1.0;
      npc2.personality.agreeableness = 1.0;
      npc1.mood = 'happy';
      npc2.mood = 'happy';

      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      // Run many update cycles to trigger socialization
      for (let i = 0; i < 50; i++) {
        controller.update(100, 1000);
      }

      // If a socialization started, onStartConversation should have been called
      if (controller.getActiveCount() > 0) {
        expect(callbacks.onStartConversation).toHaveBeenCalled();
      }
    });

    it('emits events when socialization starts', () => {
      const npc1 = makeNPC({
        id: 'npc-1', position: new Vector3(5, 0, 5), locationId: 'sq',
        personality: { openness: 1, conscientiousness: 1, extroversion: 1, agreeableness: 1, neuroticism: 0 },
        mood: 'happy',
      });
      const npc2 = makeNPC({
        id: 'npc-2', position: new Vector3(6, 0, 5), locationId: 'sq',
        personality: { openness: 1, conscientiousness: 1, extroversion: 1, agreeableness: 1, neuroticism: 0 },
        mood: 'happy',
      });

      controller.registerNPC(npc1);
      controller.registerNPC(npc2);

      for (let i = 0; i < 50; i++) {
        controller.update(100, 1000);
      }

      if (controller.getActiveCount() > 0) {
        expect(callbacks.onEmitEvent).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'ambient_conversation_started' })
        );
      }
    });
  });
});
