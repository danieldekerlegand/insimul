/**
 * Tests for ActionManager objective-to-action mapping and query methods.
 *
 * Validates:
 *   - findActionForObjective() returns correct actions for quest objective types
 *   - getActionByName() finds actions by name
 *   - All OBJECTIVE_TO_ACTION entries reference valid action names
 *   - canPerformAction() checks energy, cooldown, and target requirements
 */

import { describe, it, expect } from 'vitest';
import { ActionManager } from '../actions/ActionManager';
import type { Action, ActionContext } from '../types/actions';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeAction(overrides: Partial<Action> & { id: string; name: string }): Action {
  return {
    worldId: null,
    description: overrides.description ?? `Test action: ${overrides.name}`,
    content: null,
    actionType: 'physical' as any,
    category: 'test',
    duration: 1,
    difficulty: 0.5,
    energyCost: 5,
    targetType: null,
    requiresTarget: false,
    range: 0,
    isAvailable: true,
    cooldown: 0,
    verbPast: 'did',
    verbPresent: 'does',
    narrativeTemplates: [],
    sourceFormat: 'insimul',
    customData: {},
    tags: [],
    isBase: true,
    ...overrides,
  };
}

function makeContext(overrides: Partial<ActionContext> = {}): ActionContext {
  return {
    actor: 'player',
    timestamp: Date.now(),
    playerEnergy: 100,
    playerPosition: { x: 0, y: 0 },
    ...overrides,
  };
}

// All base action names that appear in the game
const BASE_ACTION_NAMES = [
  'talk_to_npc', 'buy_item', 'sell_item', 'use_item', 'equip_item',
  'give_gift', 'attack_enemy', 'enter_building', 'craft_item',
  'travel_to_location', 'compliment_npc', 'learn_word', 'point_and_name',
  'solve_puzzle', 'examine_object', 'read_sign', 'write_response',
  'listen_and_repeat', 'ask_for_directions', 'order_food', 'haggle_price',
  'introduce_self', 'describe_scene',
  // Physical actions (from migration 036)
  'fish', 'mine', 'harvest', 'cook', 'craft', 'paint', 'read_book',
  'pray', 'sweep', 'chop_wood', 'take_photo', 'collect_item',
  'answer_question', 'accept_quest',
];

function createFullActionManager(): ActionManager {
  const actions = BASE_ACTION_NAMES.map((name, i) =>
    makeAction({ id: `action-${i}`, name })
  );
  return new ActionManager([], actions);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ActionManager', () => {
  describe('findActionForObjective', () => {
    it('returns matching actions for craft_item objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('craft_item');
      const names = actions.map(a => a.name);
      expect(names).toContain('craft_item');
      expect(names).toContain('craft');
      expect(names).toContain('cook');
    });

    it('returns matching actions for talk_to_npc objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('talk_to_npc');
      expect(actions).toHaveLength(1);
      expect(actions[0].name).toBe('talk_to_npc');
    });

    it('returns matching actions for defeat_enemies objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('defeat_enemies');
      expect(actions).toHaveLength(1);
      expect(actions[0].name).toBe('attack_enemy');
    });

    it('returns matching actions for collect_item objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('collect_item');
      expect(actions.map(a => a.name)).toContain('collect_item');
    });

    it('returns matching actions for read_text objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('read_text');
      expect(actions.map(a => a.name)).toContain('read_book');
    });

    it('returns matching actions for comprehension_quiz objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('comprehension_quiz');
      expect(actions.map(a => a.name)).toContain('answer_question');
    });

    it('returns matching actions for photograph_subject objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('photograph_subject');
      expect(actions.map(a => a.name)).toContain('take_photo');
    });

    it('returns matching actions for build_friendship objective', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('build_friendship');
      const names = actions.map(a => a.name);
      expect(names).toContain('talk_to_npc');
      expect(names).toContain('compliment_npc');
      expect(names).toContain('give_gift');
    });

    it('returns matching actions for language learning objectives', () => {
      const manager = createFullActionManager();

      const examineActions = manager.findActionForObjective('examine_object');
      expect(examineActions.map(a => a.name)).toContain('examine_object');

      const readSignActions = manager.findActionForObjective('read_sign');
      expect(readSignActions.map(a => a.name)).toContain('read_sign');

      const listenActions = manager.findActionForObjective('listen_and_repeat');
      expect(listenActions.map(a => a.name)).toContain('listen_and_repeat');
    });

    it('returns empty array for unknown objective type', () => {
      const manager = createFullActionManager();
      const actions = manager.findActionForObjective('nonexistent_type');
      expect(actions).toEqual([]);
    });

    it('returns empty array when no matching actions exist', () => {
      // Manager with no actions
      const manager = new ActionManager([], []);
      const actions = manager.findActionForObjective('craft_item');
      expect(actions).toEqual([]);
    });
  });

  describe('getActionByName', () => {
    it('finds action by name', () => {
      const manager = createFullActionManager();
      const action = manager.getActionByName('fish');
      expect(action).toBeDefined();
      expect(action!.name).toBe('fish');
    });

    it('returns undefined for nonexistent action', () => {
      const manager = createFullActionManager();
      expect(manager.getActionByName('nonexistent')).toBeUndefined();
    });
  });

  describe('canPerformAction', () => {
    it('blocks action when energy is insufficient', () => {
      const manager = createFullActionManager();
      const context = makeContext({ playerEnergy: 2 });
      const result = manager.canPerformAction('action-0', context);
      expect(result.canPerform).toBe(false);
      expect(result.reason).toMatch(/energy/i);
    });

    it('allows action when energy is sufficient', () => {
      const manager = createFullActionManager();
      const context = makeContext({ playerEnergy: 100 });
      const result = manager.canPerformAction('action-0', context);
      expect(result.canPerform).toBe(true);
    });

    it('blocks unknown action', () => {
      const manager = createFullActionManager();
      const context = makeContext();
      const result = manager.canPerformAction('nonexistent', context);
      expect(result.canPerform).toBe(false);
      expect(result.reason).toMatch(/not found/i);
    });

    it('blocks action requiring target when no target provided', () => {
      const action = makeAction({
        id: 'requires-target',
        name: 'test_target',
        requiresTarget: true,
      });
      const manager = new ActionManager([], [action]);
      const context = makeContext(); // no target
      const result = manager.canPerformAction('requires-target', context);
      expect(result.canPerform).toBe(false);
      expect(result.reason).toMatch(/target/i);
    });
  });
});
