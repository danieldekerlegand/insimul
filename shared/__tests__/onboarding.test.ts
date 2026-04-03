import { describe, it, expect } from 'vitest';
import {
  LANGUAGE_LEARNING_ONBOARDING,
  getAssessmentStepIds,
  getSkippableStepIds,
  getAssessmentPhaseMap,
} from '../onboarding/language-onboarding';
import type {
  OnboardingDefinition,
  OnboardingStep,
  OnboardingState,
  StepProgress,
} from '../onboarding/onboarding-types';

describe('onboarding-types', () => {
  it('types are structurally sound', () => {
    const step: OnboardingStep = {
      id: 'test',
      type: 'narrative',
      name: 'Test Step',
      description: 'A test step',
      skippable: true,
      prerequisites: [],
    };
    expect(step.type).toBe('narrative');
    expect(step.skippable).toBe(true);
  });

  it('OnboardingState tracks progress', () => {
    const progress: StepProgress = {
      stepId: 'test',
      state: 'completed',
      startedAt: '2026-01-01T00:00:00Z',
      completedAt: '2026-01-01T00:01:00Z',
    };
    const state: OnboardingState = {
      definitionId: 'test_def',
      playerId: 'p1',
      worldId: 'w1',
      currentStepId: null,
      steps: [progress],
      startedAt: '2026-01-01T00:00:00Z',
      completedAt: '2026-01-01T00:01:00Z',
    };
    expect(state.steps).toHaveLength(1);
    expect(state.steps[0].state).toBe('completed');
  });
});

describe('LANGUAGE_LEARNING_ONBOARDING', () => {
  const onboarding = LANGUAGE_LEARNING_ONBOARDING;

  it('has correct top-level metadata', () => {
    expect(onboarding.id).toBe('language_learning_onboarding');
    expect(onboarding.genre).toBe('language_learning');
    expect(onboarding.estimatedDurationMinutes).toBeGreaterThan(0);
  });

  it('has exactly 10 steps', () => {
    expect(onboarding.steps).toHaveLength(10);
  });

  it('starts with a narrative step and ends with a narrative step', () => {
    expect(onboarding.steps[0].type).toBe('narrative');
    expect(onboarding.steps[9].type).toBe('narrative');
  });

  it('has 4 assessment steps referencing all arrival encounter phases', () => {
    const assessmentSteps = onboarding.steps.filter(s => s.type === 'assessment');
    expect(assessmentSteps).toHaveLength(4);

    const phaseIds = assessmentSteps.map(s => s.externalRef);
    expect(phaseIds).toContain('arrival_reading');
    expect(phaseIds).toContain('arrival_writing');
    expect(phaseIds).toContain('arrival_listening');
    expect(phaseIds).toContain('arrival_conversation');
  });

  it('assessment steps are not skippable', () => {
    const assessmentSteps = onboarding.steps.filter(s => s.type === 'assessment');
    for (const step of assessmentSteps) {
      expect(step.skippable).toBe(false);
    }
  });

  it('tutorial steps are skippable', () => {
    const tutorialTypes = ['movement', 'ui', 'interaction'];
    const tutorials = onboarding.steps.filter(s => tutorialTypes.includes(s.type));
    expect(tutorials.length).toBeGreaterThan(0);
    for (const step of tutorials) {
      expect(step.skippable).toBe(true);
    }
  });

  it('all step IDs are unique', () => {
    const ids = onboarding.steps.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prerequisites reference valid step IDs', () => {
    const validIds = new Set(onboarding.steps.map(s => s.id));
    for (const step of onboarding.steps) {
      for (const prereq of step.prerequisites) {
        expect(validIds.has(prereq)).toBe(true);
      }
    }
  });

  it('steps form a linear chain (each depends on the previous)', () => {
    for (let i = 1; i < onboarding.steps.length; i++) {
      const prev = onboarding.steps[i - 1];
      const curr = onboarding.steps[i];
      expect(curr.prerequisites).toContain(prev.id);
    }
  });

  it('first step has no prerequisites', () => {
    expect(onboarding.steps[0].prerequisites).toHaveLength(0);
  });

  it('interleaves tutorial and assessment steps', () => {
    const types = onboarding.steps.map(s => s.type);
    // Should not have consecutive assessment steps
    for (let i = 1; i < types.length; i++) {
      if (types[i] === 'assessment') {
        expect(types[i - 1]).not.toBe('assessment');
      }
    }
  });

  it('assessment steps have config with assessmentId and phaseId', () => {
    const assessmentSteps = onboarding.steps.filter(s => s.type === 'assessment');
    for (const step of assessmentSteps) {
      expect(step.config).toBeDefined();
      expect(step.config!.assessmentId).toBe('arrival_encounter');
      expect(step.config!.phaseId).toBe(step.externalRef);
    }
  });
});

describe('helper functions', () => {
  it('getAssessmentStepIds returns 4 assessment step IDs', () => {
    const ids = getAssessmentStepIds();
    expect(ids).toHaveLength(4);
    expect(ids).toContain('assessment_reading');
    expect(ids).toContain('assessment_writing');
    expect(ids).toContain('assessment_listening');
    expect(ids).toContain('assessment_conversation');
  });

  it('getSkippableStepIds returns tutorial/narrative skippable steps', () => {
    const ids = getSkippableStepIds();
    expect(ids.length).toBeGreaterThan(0);
    // Assessment steps should not be skippable
    for (const id of ids) {
      expect(id).not.toMatch(/^assessment_/);
    }
  });

  it('getAssessmentPhaseMap maps step IDs to arrival encounter phase IDs', () => {
    const map = getAssessmentPhaseMap();
    expect(Object.keys(map)).toHaveLength(4);
    expect(map['assessment_reading']).toBe('arrival_reading');
    expect(map['assessment_writing']).toBe('arrival_writing');
    expect(map['assessment_listening']).toBe('arrival_listening');
    expect(map['assessment_conversation']).toBe('arrival_conversation');
  });
});
