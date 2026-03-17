#!/usr/bin/env tsx
/**
 * Migration: Replace Base Actions and Base Rules
 *
 * Removes all existing base actions (474 Ensemble + any others) and base rules
 * (33 handcrafted + 800 Ensemble volition rules) and replaces them with a small,
 * grounded set that maps directly to what players can actually do in the game.
 *
 * The old base sets were too granular and abstract — most had no corresponding
 * game mechanic and could never be triggered or completed.
 *
 * Usage:
 *   npx tsx server/migrations/019-replace-base-actions-and-rules.ts
 *
 * Options:
 *   --dry-run    Show counts without modifying the database
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

const dryRun = process.argv.includes('--dry-run');

// ── Mongoose schemas (inline, minimal) ──────────────────────────────────

const { Schema } = mongoose;

const RuleSchema = new Schema({
  worldId: { type: String, default: null },
  isBase: { type: Boolean, default: false },
  name: { type: String, required: true },
  description: { type: String, default: null },
  content: { type: String, required: true },
  sourceFormat: { type: String, default: 'insimul' },
  ruleType: { type: String, required: true },
  category: { type: String, default: null },
  priority: { type: Number, default: 5 },
  likelihood: { type: Number, default: 1.0 },
  tags: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ActionSchema = new Schema({
  worldId: { type: String, default: null },
  isBase: { type: Boolean, default: false },
  name: { type: String, required: true },
  description: { type: String, default: null },
  content: { type: String, default: null },
  sourceFormat: { type: String, default: 'insimul' },
  actionType: { type: String, required: true },
  category: { type: String, default: null },
  duration: { type: Number, default: 1 },
  difficulty: { type: Number, default: 0.5 },
  energyCost: { type: Number, default: 1 },
  targetType: { type: String, default: null },
  requiresTarget: { type: Boolean, default: false },
  range: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  cooldown: { type: Number, default: 0 },
  verbPast: { type: String, default: null },
  verbPresent: { type: String, default: null },
  tags: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RuleModel = mongoose.models.Rule || mongoose.model('Rule', RuleSchema, 'rules');
const ActionModel = mongoose.models.Action || mongoose.model('Action', ActionSchema, 'actions');

// ── New Base Actions ────────────────────────────────────────────────────
// These map 1:1 to actual game mechanics in the Babylon.js client.

const NEW_BASE_ACTIONS = [
  {
    name: "talk_to_npc",
    description: "Start or continue a conversation with a nearby NPC",
    content: `action talk_to_npc {
  requires(near(?actor, ?target), is_npc(?target))
  effects(
    add_event(?actor, conversation, ?target),
    modify_relationship(?actor, ?target, familiarity, +1)
  )
  energy_cost: 0
  target_type: other
  cooldown: 0
}`,
    actionType: "social",
    category: "conversation",
    duration: 1,
    difficulty: 0.1,
    energyCost: 0,
    targetType: "other",
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: "talked to",
    verbPresent: "talks to",
    tags: ["conversation", "social", "language-learning"],
  },
  {
    name: "buy_item",
    description: "Purchase an item from a merchant NPC",
    content: `action buy_item {
  requires(
    near(?actor, ?merchant),
    is_merchant(?merchant),
    has_gold(?actor, ?cost),
    merchant_has_item(?merchant, ?item, ?cost)
  )
  effects(
    remove_gold(?actor, ?cost),
    add_gold(?merchant, ?cost),
    add_item(?actor, ?item),
    remove_item(?merchant, ?item)
  )
  energy_cost: 0
  target_type: other
  cooldown: 0
}`,
    actionType: "economic",
    category: "trade",
    duration: 1,
    difficulty: 0.1,
    energyCost: 0,
    targetType: "other",
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: "bought",
    verbPresent: "buys",
    tags: ["trade", "merchant", "economy"],
  },
  {
    name: "sell_item",
    description: "Sell an item from inventory to a merchant NPC",
    content: `action sell_item {
  requires(
    near(?actor, ?merchant),
    is_merchant(?merchant),
    has_item(?actor, ?item),
    item_is_tradeable(?item)
  )
  effects(
    remove_item(?actor, ?item),
    add_item(?merchant, ?item),
    add_gold(?actor, ?value),
    remove_gold(?merchant, ?value)
  )
  energy_cost: 0
  target_type: other
  cooldown: 0
}`,
    actionType: "economic",
    category: "trade",
    duration: 1,
    difficulty: 0.1,
    energyCost: 0,
    targetType: "other",
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: "sold",
    verbPresent: "sells",
    tags: ["trade", "merchant", "economy"],
  },
  {
    name: "use_item",
    description: "Use a consumable item from inventory (food, potion, etc.)",
    content: `action use_item {
  requires(
    has_item(?actor, ?item),
    is_consumable(?item)
  )
  effects(
    remove_item(?actor, ?item),
    apply_effects(?actor, ?item)
  )
  energy_cost: 0
  target_type: self
  cooldown: 0
}`,
    actionType: "physical",
    category: "inventory",
    duration: 1,
    difficulty: 0.0,
    energyCost: 0,
    targetType: "self",
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: "used",
    verbPresent: "uses",
    tags: ["inventory", "consumable"],
  },
  {
    name: "equip_item",
    description: "Equip a weapon, armor, or accessory from inventory",
    content: `action equip_item {
  requires(
    has_item(?actor, ?item),
    is_equippable(?item)
  )
  effects(
    equip(?actor, ?item),
    apply_stat_bonus(?actor, ?item)
  )
  energy_cost: 0
  target_type: self
  cooldown: 0
}`,
    actionType: "physical",
    category: "inventory",
    duration: 1,
    difficulty: 0.0,
    energyCost: 0,
    targetType: "self",
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: "equipped",
    verbPresent: "equips",
    tags: ["inventory", "equipment", "gear"],
  },
  {
    name: "give_gift",
    description: "Give an item from inventory to an NPC during conversation",
    content: `action give_gift {
  requires(
    near(?actor, ?target),
    is_npc(?target),
    has_item(?actor, ?item),
    in_conversation(?actor, ?target)
  )
  effects(
    remove_item(?actor, ?item),
    add_item(?target, ?item),
    modify_relationship(?actor, ?target, affinity, +5)
  )
  energy_cost: 1
  target_type: other
  cooldown: 0
}`,
    actionType: "social",
    category: "conversation",
    duration: 1,
    difficulty: 0.2,
    energyCost: 1,
    targetType: "other",
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: "gave a gift to",
    verbPresent: "gives a gift to",
    tags: ["social", "gift", "relationship"],
  },
  {
    name: "attack_enemy",
    description: "Attack a hostile NPC or creature in combat range",
    content: `action attack_enemy {
  requires(
    near(?actor, ?target, 5),
    is_hostile(?target),
    is_alive(?target),
    not(in_settlement_safe_zone(?actor))
  )
  effects(
    deal_damage(?actor, ?target),
    add_event(?actor, combat, ?target)
  )
  energy_cost: 1
  target_type: other
  cooldown: 1
}`,
    actionType: "physical",
    category: "combat",
    duration: 1,
    difficulty: 0.5,
    energyCost: 1,
    targetType: "other",
    requiresTarget: true,
    range: 5,
    cooldown: 1,
    verbPast: "attacked",
    verbPresent: "attacks",
    tags: ["combat", "melee"],
  },
  {
    name: "enter_building",
    description: "Enter a building through its door when nearby",
    content: `action enter_building {
  requires(
    near(?actor, ?door, 3),
    is_door(?door),
    door_belongs_to(?door, ?building)
  )
  effects(
    move_to_interior(?actor, ?building),
    add_event(?actor, entered_building, ?building)
  )
  energy_cost: 0
  target_type: location
  cooldown: 0
}`,
    actionType: "physical",
    category: "navigation",
    duration: 1,
    difficulty: 0.0,
    energyCost: 0,
    targetType: "location",
    requiresTarget: true,
    range: 3,
    cooldown: 0,
    verbPast: "entered",
    verbPresent: "enters",
    tags: ["navigation", "building"],
  },
  {
    name: "craft_item",
    description: "Craft an item using a known recipe and required materials",
    content: `action craft_item {
  requires(
    knows_recipe(?actor, ?recipe),
    has_materials(?actor, ?recipe)
  )
  effects(
    consume_materials(?actor, ?recipe),
    add_item(?actor, ?output),
    add_event(?actor, crafted, ?output)
  )
  energy_cost: 2
  target_type: self
  cooldown: 0
}`,
    actionType: "physical",
    category: "crafting",
    duration: 1,
    difficulty: 0.3,
    energyCost: 2,
    targetType: "self",
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: "crafted",
    verbPresent: "crafts",
    tags: ["crafting", "production"],
  },
  {
    name: "travel_to_location",
    description: "Walk or navigate to a specific location or settlement",
    content: `action travel_to_location {
  requires(
    is_alive(?actor)
  )
  effects(
    move_to(?actor, ?destination),
    add_event(?actor, traveled, ?destination)
  )
  energy_cost: 0
  target_type: location
  cooldown: 0
}`,
    actionType: "physical",
    category: "navigation",
    duration: 1,
    difficulty: 0.0,
    energyCost: 0,
    targetType: "location",
    requiresTarget: true,
    range: 0,
    cooldown: 0,
    verbPast: "traveled to",
    verbPresent: "travels to",
    tags: ["navigation", "movement"],
  },
  {
    name: "compliment_npc",
    description: "Compliment an NPC during conversation to improve relationship",
    content: `action compliment_npc {
  requires(
    near(?actor, ?target),
    is_npc(?target),
    in_conversation(?actor, ?target)
  )
  effects(
    modify_relationship(?actor, ?target, affinity, +3),
    modify_mood(?target, happy, +2),
    add_event(?actor, complimented, ?target)
  )
  energy_cost: 1
  target_type: other
  cooldown: 0
}`,
    actionType: "social",
    category: "conversation",
    duration: 1,
    difficulty: 0.1,
    energyCost: 1,
    targetType: "other",
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: "complimented",
    verbPresent: "compliments",
    tags: ["social", "conversation", "relationship"],
  },
  {
    name: "learn_word",
    description: "Learn a new vocabulary word through conversation or interaction",
    content: `action learn_word {
  requires(
    in_conversation(?actor, ?npc),
    word_is_new(?actor, ?word, ?language)
  )
  effects(
    add_vocabulary(?actor, ?word, ?language),
    add_xp(?actor, language, 5),
    add_event(?actor, learned_word, ?word)
  )
  energy_cost: 0
  target_type: self
  cooldown: 0
}`,
    actionType: "mental",
    category: "language-learning",
    duration: 1,
    difficulty: 0.2,
    energyCost: 0,
    targetType: "self",
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: "learned",
    verbPresent: "learns",
    tags: ["language-learning", "vocabulary", "education"],
  },
  {
    name: "point_and_name",
    description: "Point at a world object and name it in the target language for vocabulary practice",
    content: `action point_and_name {
  requires(
    near(?actor, ?object),
    has_vocab_tag(?object, ?word, ?language),
    not(already_named(?actor, ?object))
  )
  effects(
    mark_named(?actor, ?object),
    add_vocabulary(?actor, ?word, ?language),
    add_xp(?actor, language, 5),
    add_event(?actor, object_named, ?object)
  )
  energy_cost: 0
  target_type: object
  cooldown: 0
}`,
    actionType: "mental",
    category: "language-learning",
    duration: 1,
    difficulty: 0.3,
    energyCost: 0,
    targetType: "object",
    requiresTarget: true,
    range: 8,
    cooldown: 0,
    verbPast: "named",
    verbPresent: "names",
    tags: ["language-learning", "vocabulary", "education", "object-interaction"],
  },
  {
    name: "solve_puzzle",
    description: "Attempt to solve a puzzle encountered in the world",
    content: `action solve_puzzle {
  requires(
    near(?actor, ?puzzle),
    is_puzzle(?puzzle),
    not(puzzle_solved(?actor, ?puzzle))
  )
  effects(
    mark_puzzle_solved(?actor, ?puzzle),
    grant_puzzle_reward(?actor, ?puzzle),
    add_event(?actor, solved_puzzle, ?puzzle)
  )
  energy_cost: 1
  target_type: object
  cooldown: 0
}`,
    actionType: "mental",
    category: "puzzle",
    duration: 1,
    difficulty: 0.5,
    energyCost: 1,
    targetType: "object",
    requiresTarget: true,
    range: 3,
    cooldown: 0,
    verbPast: "solved",
    verbPresent: "solves",
    tags: ["puzzle", "challenge"],
  },
];

// ── New Base Rules ──────────────────────────────────────────────────────
// These map to actual game constraints and triggers that fire in the engine.

const NEW_BASE_RULES = [
  {
    name: "no_combat_in_settlement",
    description: "Combat is prohibited inside settlement safe zones",
    content: `rule no_combat_in_settlement {
  when (
    attempts_action(?actor, attack_enemy) and
    in_settlement_safe_zone(?actor)
  )
  then {
    block_action(?actor, attack_enemy)
    add_violation(?actor, combat_in_settlement)
    modify_reputation(?actor, ?settlement, -5)
    notify(?actor, "Combat is not allowed here!")
  }
  priority: 10
  likelihood: 1.0
}`,
    ruleType: "trigger",
    category: "settlement",
    priority: 10,
    likelihood: 1.0,
    tags: ["combat", "settlement", "safety", "rule-enforcement"],
  },
  {
    name: "must_pay_for_items",
    description: "Items can only be obtained from merchants by paying",
    content: `rule must_pay_for_items {
  when (
    attempts_action(?actor, buy_item) and
    merchant_has_item(?merchant, ?item, ?cost) and
    has_gold(?actor, ?gold) and
    ?gold < ?cost
  )
  then {
    block_action(?actor, buy_item)
    notify(?actor, "You don't have enough gold!")
  }
  priority: 10
  likelihood: 1.0
}`,
    ruleType: "trigger",
    category: "economy",
    priority: 10,
    likelihood: 1.0,
    tags: ["economy", "merchant", "trade"],
  },
  {
    name: "reputation_decay_on_violation",
    description: "Breaking settlement rules reduces reputation with that settlement",
    content: `rule reputation_decay_on_violation {
  when (
    has_violation(?actor, ?violation) and
    in_settlement(?actor, ?settlement)
  )
  then {
    modify_reputation(?actor, ?settlement, -10)
    record_violation(?settlement, ?actor, ?violation)
    notify(?actor, "Your reputation has decreased due to rule violations")
  }
  priority: 9
  likelihood: 1.0
}`,
    ruleType: "trigger",
    category: "reputation",
    priority: 9,
    likelihood: 1.0,
    tags: ["reputation", "violation", "settlement"],
  },
  {
    name: "merchant_sells_only_own_stock",
    description: "Merchants can only sell items in their inventory",
    content: `rule merchant_sells_only_own_stock {
  when (
    attempts_action(?actor, buy_item) and
    targets(?actor, ?item) and
    interacting_with(?actor, ?merchant) and
    not(merchant_has_item(?merchant, ?item, _))
  )
  then {
    block_action(?actor, buy_item)
    notify(?actor, "This merchant doesn't have that item")
  }
  priority: 10
  likelihood: 1.0
}`,
    ruleType: "trigger",
    category: "economy",
    priority: 10,
    likelihood: 1.0,
    tags: ["economy", "merchant", "inventory"],
  },
  {
    name: "quest_completion_grants_xp",
    description: "Completing a quest grants experience points to the player",
    content: `rule quest_completion_grants_xp {
  when (
    quest_completed(?actor, ?quest) and
    quest_reward(?quest, xp, ?amount)
  )
  then {
    add_xp(?actor, ?amount)
    notify(?actor, "Quest complete! Earned XP")
    add_event(?actor, quest_completed, ?quest)
  }
  priority: 8
  likelihood: 1.0
}`,
    ruleType: "trigger",
    category: "quest",
    priority: 8,
    likelihood: 1.0,
    tags: ["quest", "reward", "progression"],
  },
  {
    name: "conversation_builds_relationship",
    description: "Having conversations with NPCs gradually increases familiarity",
    content: `rule conversation_builds_relationship {
  when (
    conversation_ended(?actor, ?npc) and
    conversation_turns(?actor, ?npc, ?turns) and
    ?turns > 2
  )
  then {
    modify_relationship(?actor, ?npc, familiarity, +1)
    modify_relationship(?actor, ?npc, affinity, +1)
  }
  priority: 5
  likelihood: 0.8
}`,
    ruleType: "trigger",
    category: "social",
    priority: 5,
    likelihood: 0.8,
    tags: ["social", "conversation", "relationship"],
  },
  {
    name: "language_use_grants_xp",
    description: "Using target language words in conversation grants language XP",
    content: `rule language_use_grants_xp {
  when (
    used_target_language(?actor, ?word, ?language) and
    in_conversation(?actor, ?npc)
  )
  then {
    add_xp(?actor, language, 2)
    track_vocabulary_use(?actor, ?word, ?language)
  }
  priority: 6
  likelihood: 1.0
}`,
    ruleType: "trigger",
    category: "language-learning",
    priority: 6,
    likelihood: 1.0,
    tags: ["language-learning", "vocabulary", "progression"],
  },
  {
    name: "death_triggers_respawn",
    description: "When a player's health reaches zero, they respawn at full health",
    content: `rule death_triggers_respawn {
  when (
    health(?actor, ?hp) and
    ?hp =< 0 and
    is_player(?actor)
  )
  then {
    respawn(?actor)
    set_health(?actor, max)
    notify(?actor, "You have been defeated. Respawning...")
  }
  priority: 10
  likelihood: 1.0
}`,
    ruleType: "trigger",
    category: "combat",
    priority: 10,
    likelihood: 1.0,
    tags: ["combat", "death", "respawn"],
  },
];

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('✅ Connected\n');

  // Count existing base data
  const existingBaseRules = await RuleModel.countDocuments({ isBase: true });
  const existingBaseActions = await ActionModel.countDocuments({ isBase: true });

  console.log(`📊 Existing base rules:   ${existingBaseRules}`);
  console.log(`📊 Existing base actions: ${existingBaseActions}`);
  console.log('');

  if (dryRun) {
    console.log('🔍 DRY RUN — would delete:');
    console.log(`   ${existingBaseRules} base rules`);
    console.log(`   ${existingBaseActions} base actions`);
    console.log(`\n   Then insert:`);
    console.log(`   ${NEW_BASE_RULES.length} new base rules`);
    console.log(`   ${NEW_BASE_ACTIONS.length} new base actions`);
    await mongoose.disconnect();
    return;
  }

  // Delete all existing base rules and actions
  console.log('🗑️  Deleting existing base rules...');
  const rulesDeleted = await RuleModel.deleteMany({ isBase: true });
  console.log(`   Deleted ${rulesDeleted.deletedCount} base rules`);

  console.log('🗑️  Deleting existing base actions...');
  const actionsDeleted = await ActionModel.deleteMany({ isBase: true });
  console.log(`   Deleted ${actionsDeleted.deletedCount} base actions`);

  // Insert new base rules
  console.log(`\n📝 Inserting ${NEW_BASE_RULES.length} new base rules...`);
  for (const rule of NEW_BASE_RULES) {
    await RuleModel.create({
      ...rule,
      isBase: true,
      worldId: null,
      isActive: true,
      sourceFormat: 'insimul',
    });
    console.log(`   ✅ ${rule.name}`);
  }

  // Insert new base actions
  console.log(`\n⚡ Inserting ${NEW_BASE_ACTIONS.length} new base actions...`);
  for (const action of NEW_BASE_ACTIONS) {
    await ActionModel.create({
      ...action,
      isBase: true,
      worldId: null,
      isActive: true,
      isAvailable: true,
      sourceFormat: 'insimul',
    });
    console.log(`   ✅ ${action.name}`);
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Base rules:   ${existingBaseRules} → ${NEW_BASE_RULES.length}`);
  console.log(`   Base actions: ${existingBaseActions} → ${NEW_BASE_ACTIONS.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
