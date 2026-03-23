import { describe, it, expect } from 'vitest';
import {
  createOnboardingState,
  getNextAvailableStep,
  isOnboardingComplete,
  unlockAvailableSteps,
  OnboardingDefinition,
  OnboardingState,
} from '../onboarding/onboarding-types';

const TEST_DEFINITION: OnboardingDefinition = {
  id: 'test-onboarding',
  name: 'Test Onboarding',
  description: 'A test onboarding sequence',
  genre: 'generic',
  required: true,
  version: 1,
  estimatedMinutes: 10,
  steps: [
    {
      id: 'welcome',
      type: 'narrative',
      title: 'Welcome',
      description: 'Welcome to the game, {{playerName}}!',
      order: 1,
      skippable: false,
      completionCondition: { type: 'auto' },
      prerequisites: [],
    },
    {
      id: 'move-tutorial',
      type: 'movement',
      title: 'Learn to Move',
      description: 'Walk to the marker.',
      order: 2,
      skippable: false,
      completionCondition: { type: 'position', target: { x: 10, y: 0, z: 5 }, radius: 2 },
      prerequisites: ['welcome'],
      hint: 'Use WASD to move.',
    },
    {
      id: 'talk-npc',
      type: 'interaction',
      title: 'Talk to NPC',
      description: 'Speak with the guide.',
      order: 3,
      skippable: true,
      completionCondition: { type: 'event', eventId: 'npc_conversation_complete' },
      prerequisites: ['move-tutorial'],
    },
    {
      id: 'initial-assessment',
      type: 'assessment',
      title: 'Quick Assessment',
      description: 'Take a short assessment.',
      order: 4,
      skippable: false,
      completionCondition: { type: 'assessment_complete' },
      prerequisites: ['talk-npc'],
      assessmentId: 'arrival-encounter',
    },
  ],
};

describe('Onboarding Types', () => {
  describe('createOnboardingState', () => {
    it('creates initial state with correct structure', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'player-1', 'world-1');

      expect(state.definitionId).toBe('test-onboarding');
      expect(state.playerId).toBe('player-1');
      expect(state.worldId).toBe('world-1');
      expect(state.status).toBe('not_started');
      expect(state.currentStepId).toBeNull();
      expect(state.startedAt).toBeNull();
      expect(state.completedAt).toBeNull();
    });

    it('marks steps with no prerequisites as available', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      expect(state.steps['welcome'].status).toBe('available');
    });

    it('marks steps with prerequisites as locked', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      expect(state.steps['move-tutorial'].status).toBe('locked');
      expect(state.steps['talk-npc'].status).toBe('locked');
      expect(state.steps['initial-assessment'].status).toBe('locked');
    });

    it('creates a StepState for every step', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      expect(Object.keys(state.steps)).toHaveLength(TEST_DEFINITION.steps.length);
    });
  });

  describe('getNextAvailableStep', () => {
    it('returns the first available step by order', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      const next = getNextAvailableStep(TEST_DEFINITION, state);
      expect(next?.id).toBe('welcome');
    });

    it('returns null when no steps are available', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      state.steps['welcome'].status = 'active';
      const next = getNextAvailableStep(TEST_DEFINITION, state);
      expect(next).toBeNull();
    });

    it('skips completed steps and returns next available', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      state.steps['welcome'].status = 'completed';
      state.steps['move-tutorial'].status = 'available';
      const next = getNextAvailableStep(TEST_DEFINITION, state);
      expect(next?.id).toBe('move-tutorial');
    });
  });

  describe('isOnboardingComplete', () => {
    it('returns false when steps are still locked/available/active', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      expect(isOnboardingComplete(state)).toBe(false);
    });

    it('returns true when all steps are completed', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      for (const key of Object.keys(state.steps)) {
        state.steps[key].status = 'completed';
      }
      expect(isOnboardingComplete(state)).toBe(true);
    });

    it('returns true when steps are a mix of completed and skipped', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      state.steps['welcome'].status = 'completed';
      state.steps['move-tutorial'].status = 'completed';
      state.steps['talk-npc'].status = 'skipped';
      state.steps['initial-assessment'].status = 'completed';
      expect(isOnboardingComplete(state)).toBe(true);
    });
  });

  describe('unlockAvailableSteps', () => {
    it('unlocks steps whose prerequisites are completed', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      state.steps['welcome'].status = 'completed';

      const unlocked = unlockAvailableSteps(TEST_DEFINITION, state);

      expect(unlocked).toEqual(['move-tutorial']);
      expect(state.steps['move-tutorial'].status).toBe('available');
    });

    it('unlocks steps whose prerequisites are skipped', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      state.steps['welcome'].status = 'completed';
      state.steps['move-tutorial'].status = 'completed';
      state.steps['talk-npc'].status = 'skipped';

      const unlocked = unlockAvailableSteps(TEST_DEFINITION, state);

      expect(unlocked).toEqual(['initial-assessment']);
      expect(state.steps['initial-assessment'].status).toBe('available');
    });

    it('does not unlock steps with unsatisfied prerequisites', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      // Nothing completed yet
      const unlocked = unlockAvailableSteps(TEST_DEFINITION, state);
      expect(unlocked).toEqual([]);
    });

    it('does not affect already available or completed steps', () => {
      const state = createOnboardingState(TEST_DEFINITION, 'p', 'w');
      state.steps['welcome'].status = 'completed';
      state.steps['move-tutorial'].status = 'available';

      const unlocked = unlockAvailableSteps(TEST_DEFINITION, state);
      // move-tutorial was already available, not re-unlocked
      expect(unlocked).toEqual([]);
    });
  });
});
