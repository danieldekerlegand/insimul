import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    position: new Vector3(3, 0, 3), // Within 6-unit radius of player at origin
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
    getPlayerVelocity: () => 3.0, // Walking speed (above 1.0 threshold)
    onShowWalkingInterrupt: vi.fn(),
    onDismissWalkingInterrupt: vi.fn(),
    ...overrides,
  };
}

/** Advance the controller to trigger walking interrupt evaluation (uses real time, not game time) */
function advanceForWalkingInterrupt(
  controller: NPCInitiatedConversationController,
  msPerGameHour = 60000,
) {
  // Advance 1.6 seconds real time to pass the 1.5s eval interval
  vi.advanceTimersByTime(1600);
  // Use small dt to advance real-time-based walking interrupt eval
  // without advancing enough game time to trigger callout eval (needs 30 game-seconds = 500ms dt)
  controller.update(100, msPerGameHour);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('NPC Walking Interrupts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateWalkingInterruptProbability', () => {
    it('returns base 10% for a neutral NPC', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      const npc = makeNPC();

      const prob = ctrl.calculateWalkingInterruptProbability(npc, false);
      expect(prob).toBeCloseTo(0.1);
    });

    it('adds +10% for extroverts (extroversion > 0.7)', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      const npc = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.8, agreeableness: 0.5, neuroticism: 0.3 },
      });

      const prob = ctrl.calculateWalkingInterruptProbability(npc, false);
      expect(prob).toBeCloseTo(0.2);
    });

    it('adds +15% for quest-bearers', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      const npc = makeNPC();

      const prob = ctrl.calculateWalkingInterruptProbability(npc, true);
      expect(prob).toBeCloseTo(0.25);
    });

    it('combines extrovert and quest-bearer bonuses', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      const npc = makeNPC({
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.9, agreeableness: 0.5, neuroticism: 0.3 },
      });

      const prob = ctrl.calculateWalkingInterruptProbability(npc, true);
      expect(prob).toBeCloseTo(0.35);
    });

    it('clamps probability to [0, 1]', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      const npc = makeNPC();
      const prob = ctrl.calculateWalkingInterruptProbability(npc, false);
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });
  });

  describe('isPlayerWalking', () => {
    it('returns true when velocity > 1.0', () => {
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ getPlayerVelocity: () => 2.0 }),
      );
      expect(ctrl.isPlayerWalking()).toBe(true);
    });

    it('returns false when velocity <= 1.0', () => {
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ getPlayerVelocity: () => 0.5 }),
      );
      expect(ctrl.isPlayerWalking()).toBe(false);
    });

    it('returns false when getPlayerVelocity is not provided', () => {
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ getPlayerVelocity: undefined }),
      );
      expect(ctrl.isPlayerWalking()).toBe(false);
    });
  });

  describe('walking interrupt setting', () => {
    it('defaults to "on"', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      expect(ctrl.getWalkingInterruptSetting()).toBe('on');
    });

    it('can be set to "off" to disable walking interrupts', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      ctrl.setWalkingInterruptSetting('off');
      expect(ctrl.getWalkingInterruptSetting()).toBe('off');
    });

    it('can be set to "reduced"', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      ctrl.setWalkingInterruptSetting('reduced');
      expect(ctrl.getWalkingInterruptSetting()).toBe('reduced');
    });

    it('does not evaluate walking interrupts when set to "off"', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt }),
      );
      ctrl.registerNPC(makeNPC());
      ctrl.setWalkingInterruptSetting('off');

      // Force random to always succeed
      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).not.toHaveBeenCalled();

      vi.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('evaluateWalkingInterrupt via update()', () => {
    it('fires a walking interrupt for NPC within 6 units when player is walking', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt }),
      );
      ctrl.registerNPC(makeNPC({ position: new Vector3(4, 0, 0) })); // ~4 units from origin

      // Force random to always succeed
      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).toHaveBeenCalledWith(
        'npc_baker',
        'Pierre',
        expect.any(String),
        false,
      );

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('does NOT fire for NPC beyond 6-unit radius', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt }),
      );
      ctrl.registerNPC(makeNPC({ position: new Vector3(7, 0, 0) })); // ~7 units away

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).not.toHaveBeenCalled();

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('does NOT fire when player is stationary', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({
          onShowWalkingInterrupt,
          getPlayerVelocity: () => 0.3, // Below threshold
        }),
      );
      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).not.toHaveBeenCalled();

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('does NOT fire when player is in conversation', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({
          onShowWalkingInterrupt,
          isPlayerInConversation: () => true,
        }),
      );
      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).not.toHaveBeenCalled();

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('does NOT fire when NPC is in conversation', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt }),
      );
      ctrl.registerNPC(makeNPC({ isInConversation: true }));

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).not.toHaveBeenCalled();

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('does NOT fire when there is an active callout', () => {
      const onShowWalkingInterrupt = vi.fn();
      const onShowCallout = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt, onShowCallout }),
      );

      const npc = makeNPC();
      ctrl.registerNPC(npc);

      vi.spyOn(Math, 'random').mockReturnValue(0);

      // Trigger a callout first (need to advance 30 game-seconds)
      const msPerGameHour = 60000;
      const realMsFor30GameSec = (30 * msPerGameHour) / 3600;
      ctrl.update(realMsFor30GameSec, msPerGameHour);
      expect(onShowCallout).toHaveBeenCalled();

      // Now try a walking interrupt — should be blocked by active callout
      vi.advanceTimersByTime(1600);
      ctrl.update(1600, msPerGameHour);
      expect(onShowWalkingInterrupt).not.toHaveBeenCalled();

      vi.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('cooldowns', () => {
    it('enforces 8-second global cooldown between walking interrupts', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt }),
      );

      ctrl.registerNPC(makeNPC({ id: 'npc1', position: new Vector3(3, 0, 0) }));
      ctrl.registerNPC(makeNPC({ id: 'npc2', position: new Vector3(0, 0, 3) }));

      vi.spyOn(Math, 'random').mockReturnValue(0);

      // First interrupt fires
      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).toHaveBeenCalledTimes(1);

      // Dismiss the active interrupt
      vi.advanceTimersByTime(5100); // 2s bubble + 3s respond + buffer

      // Try again immediately — still within 8s global cooldown
      vi.advanceTimersByTime(1600);
      ctrl.update(1600, 60000);
      expect(onShowWalkingInterrupt).toHaveBeenCalledTimes(1); // Still 1

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('enforces 3-minute per-NPC cooldown', () => {
      const onShowWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt }),
      );

      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);

      // First interrupt fires
      advanceForWalkingInterrupt(ctrl);
      expect(onShowWalkingInterrupt).toHaveBeenCalledTimes(1);

      // Dismiss the active interrupt
      vi.advanceTimersByTime(5100);

      // Wait 9 seconds (past global cooldown) and try again
      vi.advanceTimersByTime(9000);
      ctrl.update(1600, 60000);
      // Still 1 because per-NPC cooldown is 3 minutes
      expect(onShowWalkingInterrupt).toHaveBeenCalledTimes(1);

      vi.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('speech bubble and respond prompt', () => {
    it('shows bubble for 2 seconds then respond prompt for 3 seconds', () => {
      const onShowWalkingInterrupt = vi.fn();
      const onDismissWalkingInterrupt = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onShowWalkingInterrupt, onDismissWalkingInterrupt }),
      );
      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(ctrl.hasActiveWalkingInterrupt()).toBe(true);

      // After 2 seconds, bubble timer fires
      vi.advanceTimersByTime(2000);
      // Still active during respond window
      expect(ctrl.hasActiveWalkingInterrupt()).toBe(true);

      // After 3 more seconds, respond timer fires and dismisses
      vi.advanceTimersByTime(3000);
      expect(ctrl.hasActiveWalkingInterrupt()).toBe(false);
      expect(onDismissWalkingInterrupt).toHaveBeenCalledWith('npc_baker');

      vi.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('acceptWalkingInterrupt', () => {
    it('opens chat when player accepts during active walking interrupt', async () => {
      const onOpenChat = vi.fn().mockResolvedValue(undefined);
      const onDismissWalkingInterrupt = vi.fn();
      const onEmitEvent = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onOpenChat, onDismissWalkingInterrupt, onEmitEvent }),
      );
      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);
      expect(ctrl.hasActiveWalkingInterrupt()).toBe(true);

      const accepted = await ctrl.acceptWalkingInterrupt();
      expect(accepted).toBe(true);
      expect(onOpenChat).toHaveBeenCalledWith('npc_baker');
      expect(onDismissWalkingInterrupt).toHaveBeenCalledWith('npc_baker');
      expect(ctrl.hasActiveWalkingInterrupt()).toBe(false);

      // Check emitted event
      const acceptEvent = onEmitEvent.mock.calls.find(
        (c: any[]) => c[0]?.type === 'walking_interrupt' && c[0]?.accepted === true,
      );
      expect(acceptEvent).toBeTruthy();

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('returns false when no walking interrupt is active', async () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      const accepted = await ctrl.acceptWalkingInterrupt();
      expect(accepted).toBe(false);
    });
  });

  describe('event emission', () => {
    it('emits walking_interrupt event when interrupt fires', () => {
      const onEmitEvent = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({ onEmitEvent }),
      );
      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);

      const interruptEvent = onEmitEvent.mock.calls.find(
        (c: any[]) => c[0]?.type === 'walking_interrupt',
      );
      expect(interruptEvent).toBeTruthy();
      expect(interruptEvent![0]).toMatchObject({
        type: 'walking_interrupt',
        npcId: 'npc_baker',
        npcName: 'Pierre',
        accepted: false,
        isQuestBearer: false,
      });

      vi.spyOn(Math, 'random').mockRestore();
    });

    it('includes quest-bearer flag in event', () => {
      const onEmitEvent = vi.fn();
      const ctrl = new NPCInitiatedConversationController(
        makeCallbacks({
          onEmitEvent,
          isNpcQuestBearer: () => true,
        }),
      );
      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);

      advanceForWalkingInterrupt(ctrl);

      const interruptEvent = onEmitEvent.mock.calls.find(
        (c: any[]) => c[0]?.type === 'walking_interrupt',
      );
      expect(interruptEvent![0].isQuestBearer).toBe(true);

      vi.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('dispose', () => {
    it('clears walking interrupt state on dispose', () => {
      const ctrl = new NPCInitiatedConversationController(makeCallbacks());
      ctrl.registerNPC(makeNPC());

      vi.spyOn(Math, 'random').mockReturnValue(0);
      advanceForWalkingInterrupt(ctrl);
      expect(ctrl.hasActiveWalkingInterrupt()).toBe(true);

      ctrl.dispose();
      expect(ctrl.hasActiveWalkingInterrupt()).toBe(false);

      vi.spyOn(Math, 'random').mockRestore();
    });
  });
});
