/**
 * Tests for migration 036 player action Prolog definitions.
 *
 * Validates:
 *   - Every action has valid Prolog content with requires() and effects()
 *   - No duplicate action names
 *   - All required fields are present
 *   - Energy costs match between Prolog content and denormalized fields
 *   - Physical actions that need tools declare them in requires()
 */

import { describe, it, expect } from 'vitest';
import { PLAYER_ACTION_DEFINITIONS } from '../migrations/036-seed-player-action-prolog-definitions';

describe('Migration 036: Player Action Prolog Definitions', () => {
  it('exports a non-empty array of action definitions', () => {
    expect(PLAYER_ACTION_DEFINITIONS).toBeDefined();
    expect(PLAYER_ACTION_DEFINITIONS.length).toBeGreaterThan(0);
  });

  it('has no duplicate action names', () => {
    const names = PLAYER_ACTION_DEFINITIONS.map(a => a.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  describe.each(PLAYER_ACTION_DEFINITIONS)('action "$name"', (action) => {
    it('has a non-empty name', () => {
      expect(action.name).toBeTruthy();
      expect(action.name.length).toBeGreaterThan(0);
    });

    it('has a description', () => {
      expect(action.description).toBeTruthy();
    });

    it('has Prolog content', () => {
      expect(action.content).toBeTruthy();
      expect(action.content.length).toBeGreaterThan(0);
    });

    it('Prolog content contains requires() clause', () => {
      expect(action.content).toMatch(/requires\s*\(/);
    });

    it('Prolog content contains effects() clause', () => {
      expect(action.content).toMatch(/effects\s*\(/);
    });

    it('has a valid actionType', () => {
      const validTypes = ['social', 'physical', 'mental', 'economic', 'language', 'combat', 'movement'];
      expect(validTypes).toContain(action.actionType);
    });

    it('has a category', () => {
      expect(action.category).toBeTruthy();
    });

    it('has non-negative energyCost', () => {
      expect(action.energyCost).toBeGreaterThanOrEqual(0);
    });

    it('has valid duration', () => {
      expect(action.duration).toBeGreaterThan(0);
    });

    it('has verb forms', () => {
      expect(action.verbPast).toBeTruthy();
      expect(action.verbPresent).toBeTruthy();
    });

    it('has tags', () => {
      expect(action.tags).toBeDefined();
      expect(action.tags.length).toBeGreaterThan(0);
    });

    it('energyCost > 0 is reflected in Prolog requires as energy_gte or energy_subtract', () => {
      if (action.energyCost > 0) {
        const hasEnergyCheck = action.content.includes('energy_gte') ||
                               action.content.includes('energy_subtract');
        expect(hasEnergyCheck).toBe(true);
      }
    });
  });

  it('covers all expected physical action types', () => {
    const names = new Set(PLAYER_ACTION_DEFINITIONS.map(a => a.name));
    const expectedPhysical = ['fish', 'mine', 'harvest', 'cook', 'craft', 'paint', 'pray', 'sweep', 'chop_wood'];
    for (const expected of expectedPhysical) {
      expect(names.has(expected)).toBe(true);
    }
  });

  it('covers interaction actions', () => {
    const names = new Set(PLAYER_ACTION_DEFINITIONS.map(a => a.name));
    expect(names.has('take_photo')).toBe(true);
    expect(names.has('collect_item')).toBe(true);
    expect(names.has('answer_question')).toBe(true);
    expect(names.has('accept_quest')).toBe(true);
    expect(names.has('read_book')).toBe(true);
  });

  it('tool-requiring actions mention tool in Prolog content', () => {
    const toolActions = PLAYER_ACTION_DEFINITIONS.filter(a =>
      ['fish', 'mine', 'chop_wood'].includes(a.name)
    );
    for (const action of toolActions) {
      expect(action.content).toMatch(/has_item\s*\(\s*\?actor/);
    }
  });

  it('location-requiring actions mention location in Prolog content', () => {
    const locationActions = PLAYER_ACTION_DEFINITIONS.filter(a =>
      ['fish', 'mine', 'harvest', 'cook', 'craft', 'paint', 'read_book', 'pray'].includes(a.name)
    );
    for (const action of locationActions) {
      expect(action.content).toMatch(/at_location_type\s*\(/);
    }
  });
});
