/**
 * Tests for new quest objective types: photograph_activity and observe_activity
 */

import { describe, it, expect } from 'vitest';
import {
  VALID_OBJECTIVE_TYPES,
  ACHIEVABLE_OBJECTIVE_TYPES,
  normalizeObjectiveType,
} from '../quest-objective-types';

describe('Activity objective types', () => {
  it('photograph_activity is a valid objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('photograph_activity')).toBe(true);
  });

  it('observe_activity is a valid objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('observe_activity')).toBe(true);
  });

  it('photograph_activity has correct metadata', () => {
    const type = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'photograph_activity');
    expect(type).toBeDefined();
    expect(type!.requiresTarget).toBe('npc');
    expect(type!.countable).toBe(true);
  });

  it('observe_activity has correct metadata', () => {
    const type = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'observe_activity');
    expect(type).toBeDefined();
    expect(type!.requiresTarget).toBe('npc');
    expect(type!.countable).toBe(true);
  });

  describe('normalization aliases', () => {
    it('normalizes photo_activity to photograph_activity', () => {
      expect(normalizeObjectiveType('photo_activity')).toBe('photograph_activity');
    });

    it('normalizes capture_activity to photograph_activity', () => {
      expect(normalizeObjectiveType('capture_activity')).toBe('photograph_activity');
    });

    it('normalizes watch_activity to observe_activity', () => {
      expect(normalizeObjectiveType('watch_activity')).toBe('observe_activity');
    });

    it('normalizes observe_npc to observe_activity', () => {
      expect(normalizeObjectiveType('observe_npc')).toBe('observe_activity');
    });

    it('normalizes observe to observe_activity', () => {
      expect(normalizeObjectiveType('observe')).toBe('observe_activity');
    });

    it('normalizes watch_work to observe_activity', () => {
      expect(normalizeObjectiveType('watch_work')).toBe('observe_activity');
    });
  });
});
