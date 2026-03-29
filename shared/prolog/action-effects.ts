/**
 * Action Effects — Prolog effect definitions for action outcomes
 *
 * Defines what Prolog side-effects occur when an action is performed.
 * Used by the action converter to generate action_effect/2 predicates.
 *
 * Effect terms reference predicates from:
 *   - gameplay-predicates.ts (has_item, health, energy, gold, xp, etc.)
 *   - helper-predicates.ts (skill XP helpers)
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface EffectDefinition {
  actionId: string;
  effects: string[];
}

// ── Resource Effects ───────────────────────────────────────────────────────

const RESOURCE_EFFECTS: Record<string, EffectDefinition> = {
  gather: {
    actionId: 'gather',
    effects: [
      'modify_energy(Actor, -10)',
    ],
  },

  chop_tree: {
    actionId: 'chop_tree',
    effects: [
      'assert(has_item(Actor, wood, 1))',
      'modify_energy(Actor, -15)',
      'modify_skill_xp(Actor, woodcutting, 1)',
    ],
  },
  mine_rock: {
    actionId: 'mine_rock',
    effects: [
      'assert(has_item(Actor, ore, 1))',
      'modify_energy(Actor, -20)',
      'modify_skill_xp(Actor, mining, 1)',
    ],
  },
  fish: {
    actionId: 'fish',
    effects: [
      'assert(has_item(Actor, fish, 1))',
      'modify_energy(Actor, -15)',
      'modify_skill_xp(Actor, fishing, 1)',
    ],
  },
  gather_herb: {
    actionId: 'gather_herb',
    effects: [
      'assert(has_item(Actor, herbs, 1))',
      'modify_energy(Actor, -10)',
      'modify_skill_xp(Actor, herbalism, 1)',
    ],
  },

  // Farming
  farm_plant: {
    actionId: 'farm_plant',
    effects: [
      'modify_energy(Actor, -10)',
      'modify_skill_xp(Actor, farming, 1)',
    ],
  },
  farm_water: {
    actionId: 'farm_water',
    effects: [
      'modify_energy(Actor, -5)',
      'modify_skill_xp(Actor, farming, 1)',
    ],
  },
  farm_harvest: {
    actionId: 'farm_harvest',
    effects: [
      'assert(has_item(Actor, crop, 1))',
      'modify_energy(Actor, -10)',
      'modify_skill_xp(Actor, farming, 1)',
    ],
  },

  // Crafting
  cook: {
    actionId: 'cook',
    effects: [
      'assert(has_item(Actor, prepared_food, 1))',
      'modify_energy(Actor, -10)',
      'modify_skill_xp(Actor, cooking, 1)',
    ],
  },
  craft_item: {
    actionId: 'craft_item',
    effects: [
      'assert(has_item(Actor, crafted_item, 1))',
      'modify_energy(Actor, -15)',
      'modify_skill_xp(Actor, crafting, 1)',
    ],
  },
  fix_repair: {
    actionId: 'fix_repair',
    effects: [
      'modify_energy(Actor, -15)',
      'modify_skill_xp(Actor, crafting, 1)',
    ],
  },
};

// ── Commerce Effects ──────────────────────────────────────────────────────

const COMMERCE_EFFECTS: Record<string, EffectDefinition> = {
  trade: {
    actionId: 'trade',
    effects: [
      'modify_skill_xp(Actor, bargaining, 1)',
    ],
  },
  buy_item: {
    actionId: 'buy_item',
    effects: [
      'assert(has_item(Actor, Item, 1))',
      'modify_gold(Actor, -Price)',
      'modify_gold(Target, Price)',
    ],
  },
  sell_item: {
    actionId: 'sell_item',
    effects: [
      'retract(has_item(Actor, Item, _))',
      'modify_gold(Actor, Price)',
      'modify_gold(Target, -Price)',
    ],
  },
  work: {
    actionId: 'work',
    effects: [
      'modify_gold(Actor, 10)',
      'modify_energy(Actor, -20)',
    ],
  },
  paint: {
    actionId: 'paint',
    effects: [
      'modify_energy(Actor, -10)',
      'modify_skill_xp(Actor, art, 1)',
    ],
  },
  sweep: {
    actionId: 'sweep',
    effects: [
      'modify_energy(Actor, -5)',
    ],
  },
  push_object: {
    actionId: 'push_object',
    effects: [
      'modify_energy(Actor, -10)',
    ],
  },
};

// ── Combined Export ──────────────────────────────────────────────────────────

export const ACTION_EFFECTS: Record<string, EffectDefinition> = {
  ...RESOURCE_EFFECTS,
  ...COMMERCE_EFFECTS,
};
