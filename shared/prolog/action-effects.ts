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

// ── Combat Effects ────────────────────────────────────────────────────────

const COMBAT_EFFECTS: Record<string, EffectDefinition> = {
  // Base combat
  attack_enemy: {
    actionId: 'attack_enemy',
    effects: [
      'modify_health(Target, -10)',
      'modify_energy(Actor, -10)',
      'modify_xp(Actor, combat, 5)',
    ],
  },

  // Sword attacks
  sword_attack: {
    actionId: 'sword_attack',
    effects: [
      'modify_health(Target, -15)',
      'modify_energy(Actor, -12)',
      'modify_xp(Actor, combat, 8)',
    ],
  },
  sword_combo: {
    actionId: 'sword_combo',
    effects: [
      'modify_health(Target, -25)',
      'modify_energy(Actor, -20)',
      'modify_xp(Actor, combat, 12)',
    ],
  },
  sword_dash: {
    actionId: 'sword_dash',
    effects: [
      'modify_health(Target, -20)',
      'modify_energy(Actor, -18)',
      'modify_xp(Actor, combat, 10)',
    ],
  },

  // Unarmed attacks
  punch: {
    actionId: 'punch',
    effects: [
      'modify_health(Target, -8)',
      'modify_energy(Actor, -8)',
      'modify_xp(Actor, combat, 4)',
    ],
  },
  punch_heavy: {
    actionId: 'punch_heavy',
    effects: [
      'modify_health(Target, -15)',
      'modify_energy(Actor, -15)',
      'modify_xp(Actor, combat, 6)',
    ],
  },
  melee_hook: {
    actionId: 'melee_hook',
    effects: [
      'modify_health(Target, -12)',
      'modify_energy(Actor, -12)',
      'modify_xp(Actor, combat, 5)',
    ],
  },

  // Shield attacks
  shield_bash: {
    actionId: 'shield_bash',
    effects: [
      'modify_health(Target, -8)',
      'modify_energy(Actor, -10)',
      'modify_xp(Actor, combat, 5)',
    ],
  },
  shield_dash: {
    actionId: 'shield_dash',
    effects: [
      'modify_health(Target, -10)',
      'modify_energy(Actor, -15)',
      'modify_xp(Actor, combat, 6)',
    ],
  },

  // Ranged attacks
  pistol_shoot: {
    actionId: 'pistol_shoot',
    effects: [
      'modify_health(Target, -20)',
      'modify_energy(Actor, -10)',
      'modify_xp(Actor, combat, 10)',
    ],
  },
  throw_projectile: {
    actionId: 'throw_projectile',
    effects: [
      'modify_health(Target, -12)',
      'modify_energy(Actor, -8)',
      'retract(has_item(Actor, projectile, _))',
      'modify_xp(Actor, combat, 5)',
    ],
  },

  // Defense actions — energy cost only
  defend: {
    actionId: 'defend',
    effects: [
      'modify_energy(Actor, -5)',
    ],
  },
  shield_block: {
    actionId: 'shield_block',
    effects: [
      'modify_energy(Actor, -5)',
    ],
  },
  sword_block: {
    actionId: 'sword_block',
    effects: [
      'modify_energy(Actor, -5)',
    ],
  },

  // Magic actions
  cast_spell: {
    actionId: 'cast_spell',
    effects: [
      'modify_health(Target, -25)',
      'modify_energy(Actor, -20)',
      'modify_xp(Actor, magic, 10)',
    ],
  },
  spell_channel: {
    actionId: 'spell_channel',
    effects: [
      'modify_energy(Actor, -20)',
      'modify_xp(Actor, magic, 8)',
    ],
  },
};

// ── Social Effects ────────────────────────────────────────────────────────

const SOCIAL_EFFECTS: Record<string, EffectDefinition> = {
  talk_to_npc: {
    actionId: 'talk_to_npc',
    effects: [
      'assert(met(Actor, Target))',
    ],
  },
  greet: {
    actionId: 'greet',
    effects: [
      'modify_disposition(Target, Actor, 5)',
      'assert(met(Actor, Target))',
    ],
  },
  compliment_npc: {
    actionId: 'compliment_npc',
    effects: [
      'modify_disposition(Target, Actor, 10)',
    ],
  },
  insult_npc: {
    actionId: 'insult_npc',
    effects: [
      'modify_disposition(Target, Actor, -15)',
    ],
  },
  threaten: {
    actionId: 'threaten',
    effects: [
      'modify_disposition(Target, Actor, -20)',
    ],
  },
  flirt: {
    actionId: 'flirt',
    effects: [
      'modify_disposition(Target, Actor, 8)',
    ],
  },
  persuade: {
    actionId: 'persuade',
    effects: [
      'modify_disposition(Target, Actor, 5)',
      'modify_xp(Actor, speech, 5)',
    ],
  },
  bribe: {
    actionId: 'bribe',
    effects: [
      'modify_disposition(Target, Actor, 15)',
      'modify_gold(Actor, -20)',
    ],
  },
  gossip: {
    actionId: 'gossip',
    effects: [
      'modify_disposition(Target, Actor, 3)',
    ],
  },
  confess: {
    actionId: 'confess',
    effects: [
      'modify_disposition(Target, Actor, 5)',
    ],
  },
  apologize: {
    actionId: 'apologize',
    effects: [
      'modify_disposition(Target, Actor, 10)',
    ],
  },
  comfort: {
    actionId: 'comfort',
    effects: [
      'modify_disposition(Target, Actor, 8)',
    ],
  },
  argue: {
    actionId: 'argue',
    effects: [
      'modify_disposition(Target, Actor, -10)',
    ],
  },
  joke: {
    actionId: 'joke',
    effects: [
      'modify_disposition(Target, Actor, 5)',
    ],
  },
  share_story: {
    actionId: 'share_story',
    effects: [
      'modify_disposition(Target, Actor, 5)',
    ],
  },
  ask_about: {
    actionId: 'ask_about',
    effects: [
      'modify_disposition(Target, Actor, 3)',
    ],
  },
  give_gift: {
    actionId: 'give_gift',
    effects: [
      'modify_disposition(Target, Actor, 20)',
      'retract(has_item(Actor, Gift, _))',
    ],
  },
  steal: {
    actionId: 'steal',
    effects: [
      'assert(has_item(Actor, StolenItem, 1))',
      'modify_disposition(Target, Actor, -30)',
      'modify_xp(Actor, stealth, 5)',
    ],
  },
  eavesdrop: {
    actionId: 'eavesdrop',
    effects: [
      'modify_xp(Actor, stealth, 3)',
    ],
  },
  request_quest: {
    actionId: 'request_quest',
    effects: [
      'assert(quest_active(Actor, QuestId))',
      'retract(npc_quest_available(Target, QuestId))',
    ],
  },
};

// ── Language Effects ──────────────────────────────────────────────────────

const LANGUAGE_EFFECTS: Record<string, EffectDefinition> = {
  ask_for_directions: {
    actionId: 'ask_for_directions',
    effects: [
      'modify_xp(Actor, language, 5)',
    ],
  },
  introduce_self: {
    actionId: 'introduce_self',
    effects: [
      'assert(met(Actor, Target))',
      'modify_xp(Actor, language, 5)',
    ],
  },
  order_food: {
    actionId: 'order_food',
    effects: [
      'modify_gold(Actor, -5)',
      'assert(has_item(Actor, food, 1))',
      'modify_xp(Actor, language, 8)',
    ],
  },
  haggle_price: {
    actionId: 'haggle_price',
    effects: [
      'modify_xp(Actor, language, 10)',
      'modify_xp(Actor, bargaining, 3)',
    ],
  },
  describe_scene: {
    actionId: 'describe_scene',
    effects: [
      'modify_xp(Actor, language, 10)',
    ],
  },
  listen_and_repeat: {
    actionId: 'listen_and_repeat',
    effects: [
      'modify_xp(Actor, language, 10)',
    ],
  },
  answer_question: {
    actionId: 'answer_question',
    effects: [
      'modify_xp(Actor, language, 15)',
    ],
  },
  write_response: {
    actionId: 'write_response',
    effects: [
      'modify_xp(Actor, language, 15)',
    ],
  },
  teach_vocabulary: {
    actionId: 'teach_vocabulary',
    effects: [
      'modify_xp(Actor, language, 20)',
      'modify_disposition(Target, Actor, 5)',
    ],
  },
  read_book: {
    actionId: 'read_book',
    effects: [
      'modify_xp(Actor, language, 10)',
    ],
  },
  read_sign: {
    actionId: 'read_sign',
    effects: [
      'assert(knows_vocabulary(Actor, Lang, signs))',
      'modify_xp(Actor, language, 5)',
    ],
  },
  examine_object: {
    actionId: 'examine_object',
    effects: [
      'assert(knows_vocabulary(Actor, Lang, objects))',
      'modify_xp(Actor, language, 5)',
    ],
  },
  point_and_name: {
    actionId: 'point_and_name',
    effects: [
      'assert(knows_vocabulary(Actor, Lang, objects))',
      'modify_xp(Actor, language, 5)',
    ],
  },
};

// ── Exploration Effects ──────────────────────────────────────────────────

const EXPLORATION_EFFECTS: Record<string, EffectDefinition> = {
  travel_to_location: {
    actionId: 'travel_to_location',
    effects: [
      'retract(at_location(Actor, _))',
      'assert(at_location(Actor, Loc))',
      'assert(location_discovered(Loc))',
      'modify_energy(Actor, -10)',
    ],
  },
  enter_building: {
    actionId: 'enter_building',
    effects: [
      'retract(at_location(Actor, _))',
      'assert(at_location(Actor, Building))',
    ],
  },
};

// ── Item Effects ─────────────────────────────────────────────────────────

const ITEM_EFFECTS: Record<string, EffectDefinition> = {
  equip_item: {
    actionId: 'equip_item',
    effects: [
      'assert(has_equipped(Actor, Slot, ItemId))',
    ],
  },
  use_item: {
    actionId: 'use_item',
    effects: [
      'retract(has_item(Actor, Item, _))',
    ],
  },
  consume: {
    actionId: 'consume',
    effects: [
      'retract(has_item(Actor, Item, _))',
      'modify_health(Actor, 10)',
      'modify_energy(Actor, 10)',
    ],
  },
  drop_item: {
    actionId: 'drop_item',
    effects: [
      'retract(has_item(Actor, Item, _))',
    ],
  },
  collect_item: {
    actionId: 'collect_item',
    effects: [
      'assert(has_item(Actor, Item, 1))',
    ],
  },
};

// ── Survival Effects ────────────────────────────────────────────────────

const SURVIVAL_EFFECTS: Record<string, EffectDefinition> = {
  rest: {
    actionId: 'rest',
    effects: [
      'modify_energy(Actor, 20)',
    ],
  },
  sleep: {
    actionId: 'sleep',
    effects: [
      'modify_energy(Actor, 50)',
      'modify_health(Actor, 10)',
    ],
  },
  sit: {
    actionId: 'sit',
    effects: [
      'modify_energy(Actor, 5)',
    ],
  },
};

// ── Movement / Idle / Expression (no effects — animation-only) ──────────

const ANIMATION_ONLY_EFFECTS: Record<string, EffectDefinition> = {
  idle: { actionId: 'idle', effects: [] },
  walk: { actionId: 'walk', effects: [] },
  run: { actionId: 'run', effects: [] },
  jump: { actionId: 'jump', effects: [] },
  dance: { actionId: 'dance', effects: [] },
  wave: { actionId: 'wave', effects: [] },
  clap: { actionId: 'clap', effects: [] },
  point: { actionId: 'point', effects: [] },
  // Combat animation-only
  react: { actionId: 'react', effects: [] },
  die: { actionId: 'die', effects: [] },
  hit_head: { actionId: 'hit_head', effects: [] },
  hit_reaction: { actionId: 'hit_reaction', effects: [] },
  knockback: { actionId: 'knockback', effects: [] },
  sword_idle: { actionId: 'sword_idle', effects: [] },
  pistol_aim: { actionId: 'pistol_aim', effects: [] },
  pistol_reload: { actionId: 'pistol_reload', effects: [] },
  zombie_attack: { actionId: 'zombie_attack', effects: [] },
  zombie_idle: { actionId: 'zombie_idle', effects: [] },
  zombie_walk: { actionId: 'zombie_walk', effects: [] },
};

// ── Combined Export ──────────────────────────────────────────────────────────

export const ACTION_EFFECTS: Record<string, EffectDefinition> = {
  ...RESOURCE_EFFECTS,
  ...COMMERCE_EFFECTS,
  ...COMBAT_EFFECTS,
  ...SOCIAL_EFFECTS,
  ...LANGUAGE_EFFECTS,
  ...EXPLORATION_EFFECTS,
  ...ITEM_EFFECTS,
  ...SURVIVAL_EFFECTS,
  ...ANIMATION_ONLY_EFFECTS,
};
