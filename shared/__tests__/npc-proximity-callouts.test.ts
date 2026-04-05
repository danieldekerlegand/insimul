import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import {
  NPCInitiatedConversationController,
  type ApproachCallbacks,
  type ApproachableNPC,
} from '../game-engine/rendering/NPCInitiatedConversationController';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeNPC(overrides: Partial<ApproachableNPC> = {}): ApproachableNPC {
  return {
    id: 'npc_baker',
    name: 'Pierre',
    position: new Vector3(5, 0, 5),
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.3,
    },
    relationships: {},
    mood: 'neutral',
    isInConversation: false,
    occupation: 'baker',
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
    getEnvironment: () => ({
      weather: 'clear',
      timePeriod: 'midday',
      hasActiveQuestForPlayer: false,
      playerIsNew: false,
    }),
    getCachedGreeting: () => 'Bonjour!',
    onShowCallout: vi.fn(),
    onDismissCallout: vi.fn(),
    isNpcQuestBearer: () => false,
    ...overrides,
  };
}

/** Advance the controller by a certain number of game-seconds */
function advanceGameTime(
  controller: NPCInitiatedConversationController,
  gameSeconds: number,
  msPerGameHour = 60000,
) {
  // Convert game-seconds to real ms: realMs = gameSeconds * msPerGameHour / 3600
  const realMs = (gameSeconds * msPerGameHour) / 3600;
  controller.update(realMs, msPerGameHour);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('NPC Proximity Callouts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('calculateCalloutProbability', () => {
    it('returns base 20% for a neutral NPC', () => {
      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      const npc = makeNPC();

      const prob = ctrl.calculateCalloutProbability(npc, false);
      expect(prob).toBeCloseTo(0.2);
    });

    it('adds +20% for extroversion > 0.7', () => {
      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      const npc = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.8, agreeableness: 0.5, neuroticism: 0.3 },
      });

      const prob = ctrl.calculateCalloutProbability(npc, false);
      expect(prob).toBeCloseTo(0.4);
    });

    it('subtracts -10% for introverts (extroversion < 0.3)', () => {
      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      const npc = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.2, agreeableness: 0.5, neuroticism: 0.3 },
      });

      const prob = ctrl.calculateCalloutProbability(npc, false);
      expect(prob).toBeCloseTo(0.1);
    });

    it('returns 50% for quest-bearer NPCs regardless of personality', () => {
      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      const npc = makeNPC({
        personality: { openness: 0.1, conscientiousness: 0.1, extroversion: 0.1, agreeableness: 0.1, neuroticism: 0.9 },
      });

      const prob = ctrl.calculateCalloutProbability(npc, true);
      expect(prob).toBe(0.5);
    });

    it('clamps probability to [0, 1]', () => {
      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      // Very introverted NPC — probability could go below 0
      const introvert = makeNPC({
        personality: { openness: 0.1, conscientiousness: 0.1, extroversion: 0.1, agreeableness: 0.1, neuroticism: 0.9 },
      });
      expect(ctrl.calculateCalloutProbability(introvert, false)).toBeGreaterThanOrEqual(0);
      expect(ctrl.calculateCalloutProbability(introvert, false)).toBeLessThanOrEqual(1);
    });
  });

  describe('evaluateCallout via update()', () => {
    it('fires a callout when NPC is within 8 units and random rolls succeed', () => {
      // Force random to always succeed
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) })); // 5 units away

      // Advance 30 game-seconds to trigger evaluation
      advanceGameTime(ctrl, 31);

      expect(callbacks.onShowCallout).toHaveBeenCalledWith(
        'npc_baker', 'Pierre', 'Bonjour!', false,
      );
      expect(ctrl.hasActiveCallout()).toBe(true);

      vi.restoreAllMocks();
    });

    it('does not fire callout when NPC is beyond 8 units', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(10, 0, 0) })); // 10 units away

      advanceGameTime(ctrl, 31);

      expect(callbacks.onShowCallout).not.toHaveBeenCalled();
      expect(ctrl.hasActiveCallout()).toBe(false);

      vi.restoreAllMocks();
    });

    it('does not fire callout when player is in conversation', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks({ isPlayerInConversation: () => true });
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);

      expect(callbacks.onShowCallout).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('does not fire callout when there is already an active approach', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      const npc = makeNPC({ position: new Vector3(5, 0, 0) });
      ctrl.registerNPC(npc);

      // Trigger an approach first (advance enough game-minutes)
      advanceGameTime(ctrl, 200); // This triggers evaluateApproach too

      // If an approach started, callout should not happen
      // (either approach OR callout, not both)
      const calloutCount = (callbacks.onShowCallout as any).mock.calls.length;
      const approachStarted = ctrl.hasActiveApproach();
      if (approachStarted) {
        expect(calloutCount).toBe(0);
      }

      vi.restoreAllMocks();
    });

    it('respects per-NPC cooldown of 60 seconds', () => {
      let callCount = 0;
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks({
        onShowCallout: vi.fn(() => { callCount++; }),
      });
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      // First callout
      advanceGameTime(ctrl, 31);
      expect(callCount).toBe(1);

      // Dismiss the callout so the next eval can fire
      // Simulate the auto-dismiss timer
      vi.runAllTimers();

      // Try again immediately — should be blocked by NPC cooldown
      advanceGameTime(ctrl, 31);
      expect(callCount).toBe(1); // Still 1

      vi.restoreAllMocks();
    });

    it('respects global cooldown of 15 seconds', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const onShowCallout = vi.fn();
      const callbacks = makeCallbacks({ onShowCallout });
      const ctrl = new NPCInitiatedConversationController(callbacks);

      // Register two NPCs nearby
      ctrl.registerNPC(makeNPC({ id: 'npc1', name: 'Pierre', position: new Vector3(3, 0, 0) }));
      ctrl.registerNPC(makeNPC({ id: 'npc2', name: 'Marie', position: new Vector3(4, 0, 0) }));

      // Trigger first callout
      advanceGameTime(ctrl, 31);
      expect(onShowCallout).toHaveBeenCalledTimes(1);

      // Dismiss the active callout
      vi.runAllTimers();

      // Try again very soon — global cooldown should block
      // (Date.now() hasn't advanced enough in real-time)
      advanceGameTime(ctrl, 31);
      // Global cooldown is real-time (15s), which hasn't passed
      // The second NPC should still be blocked
      expect(onShowCallout).toHaveBeenCalledTimes(1);

      vi.restoreAllMocks();
    });

    it('uses cached greeting from GreetingCache when available', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks({
        getCachedGreeting: () => 'Salut, comment ça va?',
      });
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);

      expect(callbacks.onShowCallout).toHaveBeenCalledWith(
        'npc_baker', 'Pierre', 'Salut, comment ça va?', false,
      );

      vi.restoreAllMocks();
    });

    it('falls back to template greeting when cache misses', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks({
        getCachedGreeting: () => null,
      });
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);

      expect(callbacks.onShowCallout).toHaveBeenCalled();
      // The greeting text should be a non-empty string (from template)
      const callArgs = (callbacks.onShowCallout as any).mock.calls[0];
      expect(callArgs[2]).toBeTruthy();
      expect(typeof callArgs[2]).toBe('string');

      vi.restoreAllMocks();
    });

    it('marks quest-bearer NPCs with isQuestBearer=true', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks({
        isNpcQuestBearer: (npcId) => npcId === 'npc_baker',
      });
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);

      expect(callbacks.onShowCallout).toHaveBeenCalledWith(
        'npc_baker', 'Pierre', 'Bonjour!', true,
      );

      vi.restoreAllMocks();
    });

    it('emits npc_callout event when callout fires', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);

      expect(callbacks.onEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'npc_callout',
          npcId: 'npc_baker',
          npcName: 'Pierre',
          accepted: false,
        }),
      );

      vi.restoreAllMocks();
    });
  });

  describe('callout auto-dismiss', () => {
    it('auto-dismisses callout bubble after 4 seconds + respond window after 3 more', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);
      expect(ctrl.hasActiveCallout()).toBe(true);

      // After 4s the bubble timer fires
      vi.advanceTimersByTime(4000);
      // Callout still active (respond window open)
      expect(ctrl.hasActiveCallout()).toBe(true);

      // After 3 more seconds, respond timer fires
      vi.advanceTimersByTime(3000);
      expect(ctrl.hasActiveCallout()).toBe(false);
      expect(callbacks.onDismissCallout).toHaveBeenCalledWith('npc_baker');

      vi.restoreAllMocks();
    });
  });

  describe('acceptCallout', () => {
    it('opens chat when player presses G during callout', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);
      expect(ctrl.hasActiveCallout()).toBe(true);

      const result = await ctrl.acceptCallout();
      expect(result).toBe(true);
      expect(callbacks.onOpenChat).toHaveBeenCalledWith('npc_baker');
      expect(callbacks.onDismissCallout).toHaveBeenCalledWith('npc_baker');
      expect(ctrl.hasActiveCallout()).toBe(false);

      vi.restoreAllMocks();
    });

    it('emits accepted npc_callout event', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);
      await ctrl.acceptCallout();

      expect(callbacks.onEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'npc_callout',
          npcId: 'npc_baker',
          accepted: true,
        }),
      );

      vi.restoreAllMocks();
    });

    it('returns false when no active callout', async () => {
      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);

      const result = await ctrl.acceptCallout();
      expect(result).toBe(false);
    });
  });

  describe('dispose', () => {
    it('clears callout state on dispose', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const callbacks = makeCallbacks();
      const ctrl = new NPCInitiatedConversationController(callbacks);
      ctrl.registerNPC(makeNPC({ position: new Vector3(5, 0, 0) }));

      advanceGameTime(ctrl, 31);
      expect(ctrl.hasActiveCallout()).toBe(true);

      ctrl.dispose();
      expect(ctrl.hasActiveCallout()).toBe(false);

      vi.restoreAllMocks();
    });
  });
});
