import { describe, it, expect } from 'vitest';
import {
  ACTIVITY_TAXONOMY,
  LEGACY_EVENT_ALIASES,
  getActivitiesByCategory,
  getActivityByEvent,
  isValidActivity,
  type ActivityVerb,
} from '../game-engine/activity-types';

const ASSESSMENT_VERBS: ActivityVerb[] = [
  'assessment_start',
  'assessment_phase_start',
  'assessment_phase_complete',
  'assessment_tier_change',
  'assessment_complete',
  'onboarding_step_start',
  'onboarding_step_complete',
  'onboarding_complete',
];

const ASSESSMENT_EVENTS = [
  'assessment_started',
  'assessment_phase_started',
  'assessment_phase_completed',
  'assessment_tier_change',
  'assessment_completed',
  'onboarding_step_started',
  'onboarding_step_completed',
  'onboarding_completed',
];

describe('Assessment activity types', () => {
  it('all 8 assessment verbs exist in ACTIVITY_TAXONOMY', () => {
    for (const verb of ASSESSMENT_VERBS) {
      expect(ACTIVITY_TAXONOMY[verb]).toBeDefined();
    }
  });

  it('all assessment activities belong to the assessment category', () => {
    for (const verb of ASSESSMENT_VERBS) {
      expect(ACTIVITY_TAXONOMY[verb].category).toBe('assessment');
    }
  });

  it('each assessment verb emits the correct event name', () => {
    const expected: Record<string, string> = {
      assessment_start: 'assessment_started',
      assessment_phase_start: 'assessment_phase_started',
      assessment_phase_complete: 'assessment_phase_completed',
      assessment_tier_change: 'assessment_tier_change',
      assessment_complete: 'assessment_completed',
      onboarding_step_start: 'onboarding_step_started',
      onboarding_step_complete: 'onboarding_step_completed',
      onboarding_complete: 'onboarding_completed',
    };
    for (const [verb, event] of Object.entries(expected)) {
      expect(ACTIVITY_TAXONOMY[verb as ActivityVerb].emitsEvent).toBe(event);
    }
  });

  it('assessment verbs do not require a target', () => {
    for (const verb of ASSESSMENT_VERBS) {
      expect(ACTIVITY_TAXONOMY[verb].requiresTarget).toBe(false);
    }
  });

  it('all assessment verbs have Prolog predicates', () => {
    for (const verb of ASSESSMENT_VERBS) {
      expect(ACTIVITY_TAXONOMY[verb].prologPredicate).toBeTruthy();
    }
  });

  it('all assessment verbs have telemetry fields', () => {
    for (const verb of ASSESSMENT_VERBS) {
      expect(ACTIVITY_TAXONOMY[verb].telemetryFields.length).toBeGreaterThan(0);
    }
  });

  it('isValidActivity returns true for all assessment verbs', () => {
    for (const verb of ASSESSMENT_VERBS) {
      expect(isValidActivity(verb)).toBe(true);
    }
  });

  it('getActivitiesByCategory returns all 8 assessment activities', () => {
    const activities = getActivitiesByCategory('assessment');
    expect(activities).toHaveLength(8);
    const verbs = activities.map(a => a.verb);
    for (const verb of ASSESSMENT_VERBS) {
      expect(verbs).toContain(verb);
    }
  });

  it('getActivityByEvent resolves assessment event names', () => {
    for (const event of ASSESSMENT_EVENTS) {
      const activity = getActivityByEvent(event);
      expect(activity).toBeDefined();
      expect(activity!.category).toBe('assessment');
    }
  });

  it('LEGACY_EVENT_ALIASES maps assessment events to verbs', () => {
    for (const event of ASSESSMENT_EVENTS) {
      expect(LEGACY_EVENT_ALIASES[event]).toBeDefined();
      expect(ASSESSMENT_VERBS).toContain(LEGACY_EVENT_ALIASES[event]);
    }
  });
});
