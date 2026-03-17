/**
 * Tests for language learning action types, activity verbs, and objective types.
 */
import { describe, it, expect } from 'vitest';
import {
  ACTIVITY_TAXONOMY,
  isValidActivity,
  getActivitiesByCategory,
  getActivityByEvent,
  LEGACY_EVENT_ALIASES,
  type ActivityVerb,
} from '../game-engine/activity-types';
import {
  ACHIEVABLE_OBJECTIVE_TYPES,
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
} from '../quest-objective-types';
import { LANGUAGE_LEARNING_ACTIONS } from '../../server/migrations/020-language-learning-actions';

// ── The 10 new language learning action names ───────────────────────────

const LANGUAGE_ACTION_NAMES = [
  'examine_object',
  'read_sign',
  'write_response',
  'listen_and_repeat',
  'point_and_name',
  'ask_for_directions',
  'order_food',
  'haggle_price',
  'introduce_self',
  'describe_scene',
] as const;

describe('Language Learning Action Types', () => {
  describe('Activity Verbs', () => {
    it('all 10 language learning verbs are valid activity verbs', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        expect(isValidActivity(name)).toBe(true);
      }
    });

    it('all 10 language learning verbs have taxonomy entries', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        expect(ACTIVITY_TAXONOMY[name as ActivityVerb]).toBeDefined();
      }
    });

    it('all language learning activities belong to the "language" category', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        const def = ACTIVITY_TAXONOMY[name as ActivityVerb];
        expect(def.category).toBe('language');
      }
    });

    it('each activity has a unique emitsEvent', () => {
      const events = LANGUAGE_ACTION_NAMES.map(
        name => ACTIVITY_TAXONOMY[name as ActivityVerb].emitsEvent,
      );
      expect(new Set(events).size).toBe(events.length);
    });

    it('each activity has a non-empty prologPredicate', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        const def = ACTIVITY_TAXONOMY[name as ActivityVerb];
        expect(def.prologPredicate.length).toBeGreaterThan(0);
      }
    });

    it('each activity has at least one telemetry field', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        const def = ACTIVITY_TAXONOMY[name as ActivityVerb];
        expect(def.telemetryFields.length).toBeGreaterThan(0);
      }
    });

    it('getActivitiesByCategory("language") includes all new verbs', () => {
      const languageActivities = getActivitiesByCategory('language');
      const verbs = languageActivities.map(a => a.verb);
      for (const name of LANGUAGE_ACTION_NAMES) {
        expect(verbs).toContain(name);
      }
    });

    it('getActivityByEvent resolves new events to correct verbs', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        const def = ACTIVITY_TAXONOMY[name as ActivityVerb];
        const resolved = getActivityByEvent(def.emitsEvent);
        expect(resolved).toBeDefined();
        expect(resolved!.verb).toBe(name);
      }
    });
  });

  describe('Legacy Event Aliases', () => {
    it('all new event names have legacy aliases', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        const def = ACTIVITY_TAXONOMY[name as ActivityVerb];
        expect(LEGACY_EVENT_ALIASES[def.emitsEvent]).toBe(name);
      }
    });
  });

  describe('Quest Objective Types', () => {
    it('all 10 language learning actions are valid objective types', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        expect(VALID_OBJECTIVE_TYPES.has(name)).toBe(true);
      }
    });

    it('all 10 actions appear in ACHIEVABLE_OBJECTIVE_TYPES with correct structure', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        const obj = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === name);
        expect(obj).toBeDefined();
        expect(obj!.description.length).toBeGreaterThan(0);
        expect(obj!.playerAction.length).toBeGreaterThan(0);
        expect(['npc', 'item', 'location', 'none']).toContain(obj!.requiresTarget);
      }
    });

    it('normalizeObjectiveType resolves aliases for new types', () => {
      const aliases: Record<string, string> = {
        'examine': 'examine_object',
        'inspect': 'examine_object',
        'read': 'read_sign',
        'repeat': 'listen_and_repeat',
        'haggle': 'haggle_price',
        'negotiate': 'haggle_price',
        'order': 'order_food',
        'introduce': 'introduce_self',
        'describe': 'describe_scene',
        'ask_directions': 'ask_for_directions',
      };
      for (const [alias, canonical] of Object.entries(aliases)) {
        expect(normalizeObjectiveType(alias)).toBe(canonical);
      }
    });

    it('normalizeObjectiveType returns canonical type for direct matches', () => {
      for (const name of LANGUAGE_ACTION_NAMES) {
        expect(normalizeObjectiveType(name)).toBe(name);
      }
    });
  });

  describe('Migration Actions', () => {
    it('defines exactly 10 language learning actions', () => {
      expect(LANGUAGE_LEARNING_ACTIONS).toHaveLength(10);
    });

    it('all migration actions use actionType "language"', () => {
      for (const action of LANGUAGE_LEARNING_ACTIONS) {
        expect(action.actionType).toBe('language');
      }
    });

    it('all migration actions have category "language-learning"', () => {
      for (const action of LANGUAGE_LEARNING_ACTIONS) {
        expect(action.category).toBe('language-learning');
      }
    });

    it('all migration actions have Prolog content', () => {
      for (const action of LANGUAGE_LEARNING_ACTIONS) {
        expect(action.content).toBeDefined();
        expect(action.content.length).toBeGreaterThan(0);
        expect(action.content).toContain(`action ${action.name}`);
      }
    });

    it('all migration actions have verb past and present forms', () => {
      for (const action of LANGUAGE_LEARNING_ACTIONS) {
        expect(action.verbPast).toBeTruthy();
        expect(action.verbPresent).toBeTruthy();
      }
    });

    it('all migration actions have language-learning tag', () => {
      for (const action of LANGUAGE_LEARNING_ACTIONS) {
        expect(action.tags).toContain('language-learning');
      }
    });

    it('action names match the canonical language action names', () => {
      const names = LANGUAGE_LEARNING_ACTIONS.map(a => a.name);
      for (const name of LANGUAGE_ACTION_NAMES) {
        expect(names).toContain(name);
      }
    });

    it('difficulty is between 0 and 1 for all actions', () => {
      for (const action of LANGUAGE_LEARNING_ACTIONS) {
        expect(action.difficulty).toBeGreaterThanOrEqual(0);
        expect(action.difficulty).toBeLessThanOrEqual(1);
      }
    });

    it('energyCost is non-negative for all actions', () => {
      for (const action of LANGUAGE_LEARNING_ACTIONS) {
        expect(action.energyCost).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
