/**
 * Tests for BusinessBehaviorSystem
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  BusinessBehaviorSystem,
  BUSINESS_WORK_ACTIONS,
  type BusinessBehaviorCallbacks,
  type NPCWorkState,
} from '../../client/src/components/3DGame/BusinessBehaviorSystem';

function createCallbacks(): BusinessBehaviorCallbacks & {
  animChanges: Array<{ npcId: string; state: string }>;
  statusTexts: Array<{ npcId: string; text: string }>;
} {
  const animChanges: Array<{ npcId: string; state: string }> = [];
  const statusTexts: Array<{ npcId: string; text: string }> = [];
  return {
    animChanges,
    statusTexts,
    onAnimationChange: vi.fn((npcId, state) => animChanges.push({ npcId, state })),
    onStatusText: vi.fn((npcId, text) => statusTexts.push({ npcId, text })),
  };
}

describe('BusinessBehaviorSystem', () => {
  let system: BusinessBehaviorSystem;
  let callbacks: ReturnType<typeof createCallbacks>;

  beforeEach(() => {
    callbacks = createCallbacks();
    system = new BusinessBehaviorSystem(callbacks);
  });

  describe('registration', () => {
    it('registers owner NPCs and tracks them', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      expect(system.getTrackedCount()).toBe(1);
      expect(system.getState('npc1')).toBeDefined();
      expect(system.getState('npc1')!.role).toBe('owner');
      expect(system.getState('npc1')!.businessType).toBe('Bakery');
    });

    it('registers employee NPCs', () => {
      system.registerNPC('npc2', 'employee', 'Bar');
      expect(system.getTrackedCount()).toBe(1);
      expect(system.getState('npc2')!.role).toBe('employee');
    });

    it('ignores visitor NPCs', () => {
      system.registerNPC('visitor1', 'visitor', 'Bakery');
      expect(system.getTrackedCount()).toBe(0);
    });

    it('triggers initial animation on registration', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      expect(callbacks.onAnimationChange).toHaveBeenCalledWith('npc1', expect.any(String));
      expect(callbacks.onStatusText).toHaveBeenCalledWith('npc1', expect.any(String));
    });

    it('unregisters an NPC', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      system.unregisterNPC('npc1');
      expect(system.getTrackedCount()).toBe(0);
    });

    it('clearAll removes all tracked NPCs', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      system.registerNPC('npc2', 'employee', 'Bakery');
      system.clearAll();
      expect(system.getTrackedCount()).toBe(0);
    });
  });

  describe('work action cycling', () => {
    it('advances to next action when time expires', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      const state = system.getState('npc1')!;
      const startIndex = state.currentActionIndex;
      const actions = BUSINESS_WORK_ACTIONS['Bakery'];
      const duration = actions[startIndex].duration;

      // Advance time past the current action duration
      system.update(duration + 1);

      const newIndex = state.currentActionIndex;
      expect(newIndex).toBe((startIndex + 1) % actions.length);
    });

    it('does not advance when time has not expired', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      const state = system.getState('npc1')!;
      const startIndex = state.currentActionIndex;

      // Advance less than any action's duration
      system.update(1);

      expect(state.currentActionIndex).toBe(startIndex);
    });

    it('plays walk transition when station changes', () => {
      // Use Bakery which has station changes between actions
      system.registerNPC('npc1', 'owner', 'Bakery');
      const state = system.getState('npc1')!;
      // Force to action 0 (counter station)
      state.currentActionIndex = 0;
      const actions = BUSINESS_WORK_ACTIONS['Bakery'];
      state.timeRemaining = actions[0].duration;

      callbacks.animChanges.length = 0;

      // Expire the action
      system.update(actions[0].duration + 1);

      // If station changed, should see a 'walk' animation for transition
      if (actions[0].station !== actions[1].station) {
        expect(state.isTransitioning).toBe(true);
        expect(callbacks.animChanges.some(c => c.state === 'walk')).toBe(true);
      }
    });

    it('completes transition and sets next action animation', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      const state = system.getState('npc1')!;
      // Force a station-changing transition
      state.currentActionIndex = 0;
      const actions = BUSINESS_WORK_ACTIONS['Bakery'];
      state.timeRemaining = 0.1;

      // Trigger advance
      system.update(0.2);

      if (state.isTransitioning) {
        callbacks.animChanges.length = 0;
        // Complete the transition (2 second walk)
        system.update(3);
        expect(state.isTransitioning).toBe(false);
        // Should have set the next action's animation
        const nextAction = actions[state.currentActionIndex];
        expect(callbacks.animChanges.some(c => c.state === nextAction.animation)).toBe(true);
      }
    });

    it('loops through all actions for each business type', () => {
      for (const [type, actions] of Object.entries(BUSINESS_WORK_ACTIONS)) {
        const sys = new BusinessBehaviorSystem(createCallbacks());
        sys.registerNPC('test', 'owner', type);
        const st = sys.getState('test')!;
        st.currentActionIndex = 0;
        st.timeRemaining = actions[0].duration;
        st.isTransitioning = false;

        // Cycle through all actions
        for (let i = 0; i < actions.length; i++) {
          st.timeRemaining = 0;
          st.isTransitioning = false;
          sys.update(1);
          // Complete any transition
          if (st.isTransitioning) {
            sys.update(3);
          }
        }
        // Should have looped back
        expect(st.currentActionIndex).toBeLessThan(actions.length);
      }
    });
  });

  describe('serve customer mode', () => {
    it('enters serve mode when player is near owner', () => {
      system.registerNPC('owner1', 'owner', 'Bakery');
      expect(system.isServingPlayer('owner1')).toBe(false);

      system.update(0.016, true, 'owner1');
      expect(system.isServingPlayer('owner1')).toBe(true);
    });

    it('does not enter serve mode for employees', () => {
      system.registerNPC('emp1', 'employee', 'Bakery');
      system.update(0.016, true, 'emp1');
      expect(system.isServingPlayer('emp1')).toBe(false);
    });

    it('exits serve mode when player moves away', () => {
      system.registerNPC('owner1', 'owner', 'Bakery');
      system.update(0.016, true, 'owner1');
      expect(system.isServingPlayer('owner1')).toBe(true);

      system.update(0.016, false);
      expect(system.isServingPlayer('owner1')).toBe(false);
    });

    it('sets talk animation during serve mode', () => {
      system.registerNPC('owner1', 'owner', 'Bakery');
      callbacks.animChanges.length = 0;

      system.update(0.016, true, 'owner1');
      expect(callbacks.animChanges.some(c => c.npcId === 'owner1' && c.state === 'talk')).toBe(true);
    });

    it('resumes work cycle after serve mode ends', () => {
      system.registerNPC('owner1', 'owner', 'Bakery');
      system.update(0.016, true, 'owner1');

      callbacks.animChanges.length = 0;
      system.update(0.016, false);

      // Should have set a work animation
      expect(callbacks.onAnimationChange).toHaveBeenCalled();
      expect(system.isServingPlayer('owner1')).toBe(false);
    });
  });

  describe('getActionsForBusiness', () => {
    it('returns defined actions for known business types', () => {
      const actions = system.getActionsForBusiness('Bakery');
      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].name).toBe('Kneading dough');
    });

    it('returns default actions for unknown business types', () => {
      const actions = system.getActionsForBusiness('UnknownBiz');
      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].name).toBe('Working');
    });

    it('has actions defined for all major business types', () => {
      const expectedTypes = ['Bakery', 'Bar', 'Restaurant', 'Shop', 'GroceryStore', 'Hospital', 'Church', 'School'];
      for (const type of expectedTypes) {
        expect(BUSINESS_WORK_ACTIONS[type]).toBeDefined();
        expect(BUSINESS_WORK_ACTIONS[type].length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('getAllStates', () => {
    it('returns all tracked NPC states', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      system.registerNPC('npc2', 'employee', 'Bakery');
      const states = system.getAllStates();
      expect(states.length).toBe(2);
    });
  });

  describe('getCurrentAction', () => {
    it('returns serve customer action when serving', () => {
      system.registerNPC('owner1', 'owner', 'Bakery');
      system.update(0.016, true, 'owner1');
      const state = system.getState('owner1')!;
      const action = system.getCurrentAction(state);
      expect(action.name).toBe('Serving customer');
    });

    it('returns the correct work action from the cycle', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      const state = system.getState('npc1')!;
      const actions = BUSINESS_WORK_ACTIONS['Bakery'];
      const action = system.getCurrentAction(state);
      expect(action).toBe(actions[state.currentActionIndex]);
    });
  });

  describe('dispose', () => {
    it('clears all state', () => {
      system.registerNPC('npc1', 'owner', 'Bakery');
      system.dispose();
      expect(system.getTrackedCount()).toBe(0);
    });
  });
});
