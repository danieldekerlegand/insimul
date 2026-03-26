#!/usr/bin/env tsx
/**
 * Migration 036: Seed Player Action Prolog Definitions
 *
 * Ensures every player action in the game has a corresponding base Action
 * record in the database with Prolog content defining requires() preconditions
 * and effects() postconditions.
 *
 * Covers physical actions (fishing, mining, harvesting, cooking, crafting,
 * painting, reading, praying, sweeping, chopping), photography, item
 * collection, book reading, question answering, and quest acceptance.
 *
 * Idempotent: removes existing actions by name before re-inserting.
 *
 * Usage:
 *   npx tsx server/migrations/036-seed-player-action-prolog-definitions.ts
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

// ── Mongoose schema (inline, minimal) ──────────────────────────────────

const { Schema } = mongoose;

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

const ActionModel =
  mongoose.models.Action || mongoose.model('Action', ActionSchema, 'actions');

// ── Player Action Definitions with Prolog Content ───────────────────────

export const PLAYER_ACTION_DEFINITIONS = [
  // ── Physical / Resource-gathering actions ─────────────────────────────

  {
    name: 'fish',
    description: 'Fish in a body of water to catch fish',
    content: `action fish {
  requires(
    at_location_type(?actor, water),
    has_item(?actor, fishing_rod),
    energy_gte(?actor, 15)
  )
  effects(
    item_add(?actor, fish, 1),
    skill_xp(?actor, fishing, 15),
    energy_subtract(?actor, 15),
    add_event(?actor, physical_action_completed, fishing)
  )
}`,
    actionType: 'physical',
    category: 'resource-gathering',
    duration: 8,
    difficulty: 0.3,
    energyCost: 15,
    targetType: 'location',
    requiresTarget: false,
    range: 5,
    cooldown: 0,
    verbPast: 'fished',
    verbPresent: 'fishes',
    tags: ['physical', 'resource-gathering', 'fishing', 'outdoor'],
  },

  {
    name: 'mine',
    description: 'Mine rocks to extract ore and gems',
    content: `action mine {
  requires(
    at_location_type(?actor, mine),
    has_item(?actor, pickaxe),
    energy_gte(?actor, 20)
  )
  effects(
    item_add(?actor, ore, 1),
    skill_xp(?actor, mining, 20),
    energy_subtract(?actor, 20),
    add_event(?actor, physical_action_completed, mining)
  )
}`,
    actionType: 'physical',
    category: 'resource-gathering',
    duration: 7,
    difficulty: 0.4,
    energyCost: 20,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'mined',
    verbPresent: 'mines',
    tags: ['physical', 'resource-gathering', 'mining', 'outdoor'],
  },

  {
    name: 'harvest',
    description: 'Harvest crops, herbs, or flowers from a garden or farm',
    content: `action harvest {
  requires(
    at_location_type(?actor, garden),
    energy_gte(?actor, 10)
  )
  effects(
    item_add(?actor, herbs, 1),
    skill_xp(?actor, harvesting, 10),
    energy_subtract(?actor, 10),
    add_event(?actor, physical_action_completed, harvesting)
  )
}`,
    actionType: 'physical',
    category: 'resource-gathering',
    duration: 5,
    difficulty: 0.2,
    energyCost: 10,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'harvested',
    verbPresent: 'harvests',
    tags: ['physical', 'resource-gathering', 'harvesting', 'farming'],
  },

  {
    name: 'cook',
    description: 'Cook a meal at a stove, hearth, or campfire',
    content: `action cook {
  requires(
    at_location_type(?actor, kitchen),
    energy_gte(?actor, 10)
  )
  effects(
    item_add(?actor, prepared_food, 1),
    skill_xp(?actor, cooking, 15),
    energy_subtract(?actor, 10),
    add_event(?actor, physical_action_completed, cooking)
  )
}`,
    actionType: 'physical',
    category: 'crafting',
    duration: 6,
    difficulty: 0.3,
    energyCost: 10,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'cooked',
    verbPresent: 'cooks',
    tags: ['physical', 'crafting', 'cooking', 'indoor'],
  },

  {
    name: 'craft',
    description: 'Craft tools or items at a workbench or forge',
    content: `action craft {
  requires(
    at_location_type(?actor, workbench),
    energy_gte(?actor, 15)
  )
  effects(
    item_add(?actor, crafted_item, 1),
    skill_xp(?actor, crafting, 18),
    energy_subtract(?actor, 15),
    add_event(?actor, physical_action_completed, crafting)
  )
}`,
    actionType: 'physical',
    category: 'crafting',
    duration: 8,
    difficulty: 0.4,
    energyCost: 15,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'crafted',
    verbPresent: 'crafts',
    tags: ['physical', 'crafting', 'production'],
  },

  {
    name: 'paint',
    description: 'Paint at an easel or art studio',
    content: `action paint {
  requires(
    at_location_type(?actor, easel),
    energy_gte(?actor, 10)
  )
  effects(
    item_add(?actor, painting, 1),
    skill_xp(?actor, painting, 15),
    energy_subtract(?actor, 10),
    add_event(?actor, physical_action_completed, painting)
  )
}`,
    actionType: 'physical',
    category: 'crafting',
    duration: 10,
    difficulty: 0.4,
    energyCost: 10,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'painted',
    verbPresent: 'paints',
    tags: ['physical', 'crafting', 'painting', 'art'],
  },

  {
    name: 'read_book',
    description: 'Read a book at a bookshelf or library for knowledge',
    content: `action read_book {
  requires(
    at_location_type(?actor, library),
    energy_gte(?actor, 5)
  )
  effects(
    skill_xp(?actor, reading, 8),
    energy_subtract(?actor, 5),
    add_event(?actor, physical_action_completed, reading)
  )
}`,
    actionType: 'mental',
    category: 'learning',
    duration: 5,
    difficulty: 0.2,
    energyCost: 5,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'read a book',
    verbPresent: 'reads a book',
    tags: ['mental', 'learning', 'reading', 'indoor'],
  },

  {
    name: 'pray',
    description: 'Pray at a shrine, church, or chapel',
    content: `action pray {
  requires(
    at_location_type(?actor, shrine),
    energy_gte(?actor, 5)
  )
  effects(
    skill_xp(?actor, faith, 5),
    energy_subtract(?actor, 5),
    add_event(?actor, physical_action_completed, praying)
  )
}`,
    actionType: 'mental',
    category: 'spiritual',
    duration: 5,
    difficulty: 0.1,
    energyCost: 5,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'prayed',
    verbPresent: 'prays',
    tags: ['mental', 'spiritual', 'praying', 'indoor'],
  },

  {
    name: 'sweep',
    description: 'Sweep and clean an area',
    content: `action sweep {
  requires(
    energy_gte(?actor, 5)
  )
  effects(
    skill_xp(?actor, cleaning, 5),
    energy_subtract(?actor, 5),
    add_event(?actor, physical_action_completed, sweeping)
  )
}`,
    actionType: 'physical',
    category: 'chores',
    duration: 4,
    difficulty: 0.1,
    energyCost: 5,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'swept',
    verbPresent: 'sweeps',
    tags: ['physical', 'chores', 'sweeping', 'cleaning'],
  },

  {
    name: 'chop_wood',
    description: 'Chop wood at a wood pile or lumber yard',
    content: `action chop_wood {
  requires(
    at_location_type(?actor, wood_pile),
    has_item(?actor, axe),
    energy_gte(?actor, 15)
  )
  effects(
    item_add(?actor, firewood, 1),
    skill_xp(?actor, woodcutting, 12),
    energy_subtract(?actor, 15),
    add_event(?actor, physical_action_completed, chopping)
  )
}`,
    actionType: 'physical',
    category: 'resource-gathering',
    duration: 6,
    difficulty: 0.3,
    energyCost: 15,
    targetType: 'location',
    requiresTarget: false,
    range: 3,
    cooldown: 0,
    verbPast: 'chopped wood',
    verbPresent: 'chops wood',
    tags: ['physical', 'resource-gathering', 'chopping', 'outdoor'],
  },

  // ── Interaction actions ───────────────────────────────────────────────

  {
    name: 'take_photo',
    description: 'Take a photo of the current scene using camera mode',
    content: `action take_photo {
  requires(
    energy_gte(?actor, 2)
  )
  effects(
    item_add(?actor, photo, 1),
    skill_xp(?actor, photography, 5),
    energy_subtract(?actor, 2),
    add_event(?actor, took_photo, ?location)
  )
}`,
    actionType: 'mental',
    category: 'exploration',
    duration: 1,
    difficulty: 0.1,
    energyCost: 2,
    targetType: 'self',
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: 'took a photo',
    verbPresent: 'takes a photo',
    tags: ['mental', 'exploration', 'photography', 'camera'],
  },

  {
    name: 'collect_item',
    description: 'Pick up an item from the world',
    content: `action collect_item {
  requires(
    near(?actor, ?item, 3),
    is_collectible(?item)
  )
  effects(
    item_add(?actor, ?item, 1),
    remove_from_world(?item),
    add_event(?actor, item_collected, ?item)
  )
}`,
    actionType: 'physical',
    category: 'exploration',
    duration: 1,
    difficulty: 0.0,
    energyCost: 0,
    targetType: 'object',
    requiresTarget: true,
    range: 3,
    cooldown: 0,
    verbPast: 'collected',
    verbPresent: 'collects',
    tags: ['physical', 'exploration', 'collecting', 'item'],
  },

  {
    name: 'answer_question',
    description: 'Answer a comprehension question about a text or conversation',
    content: `action answer_question {
  requires(
    has_active_question(?actor, ?question)
  )
  effects(
    evaluate_answer(?actor, ?question, ?answer),
    skill_xp(?actor, comprehension, 10),
    add_event(?actor, answered_question, ?question)
  )
}`,
    actionType: 'mental',
    category: 'learning',
    duration: 1,
    difficulty: 0.5,
    energyCost: 0,
    targetType: 'self',
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: 'answered a question',
    verbPresent: 'answers a question',
    tags: ['mental', 'learning', 'comprehension', 'language-learning'],
  },

  {
    name: 'accept_quest',
    description: 'Accept a quest from an NPC or notice board',
    content: `action accept_quest {
  requires(
    quest_available(?quest),
    not(quest_active(?actor, ?quest))
  )
  effects(
    activate_quest(?actor, ?quest),
    add_event(?actor, quest_accepted, ?quest)
  )
}`,
    actionType: 'social',
    category: 'quest',
    duration: 1,
    difficulty: 0.0,
    energyCost: 0,
    targetType: 'self',
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: 'accepted a quest',
    verbPresent: 'accepts a quest',
    tags: ['social', 'quest', 'progression'],
  },
];

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected\n');

  const actionNames = PLAYER_ACTION_DEFINITIONS.map((a) => a.name);

  const existing = await ActionModel.countDocuments({
    isBase: true,
    name: { $in: actionNames },
  });

  console.log(`Existing matching base actions: ${existing}`);
  console.log(`Actions to seed: ${PLAYER_ACTION_DEFINITIONS.length}`);

  if (dryRun) {
    console.log('\nDRY RUN — would insert:');
    for (const action of PLAYER_ACTION_DEFINITIONS) {
      console.log(`   ${action.name} (${action.actionType}/${action.category})`);
    }
    await mongoose.disconnect();
    return;
  }

  // Remove existing matching actions (idempotent)
  if (existing > 0) {
    console.log(`\nRemoving ${existing} existing matching actions...`);
    await ActionModel.deleteMany({ isBase: true, name: { $in: actionNames } });
  }

  // Insert new action definitions
  console.log(
    `\nInserting ${PLAYER_ACTION_DEFINITIONS.length} player action definitions...`
  );
  for (const action of PLAYER_ACTION_DEFINITIONS) {
    await ActionModel.create({
      ...action,
      isBase: true,
      worldId: null,
      isActive: true,
      isAvailable: true,
      sourceFormat: 'insimul',
    });
    console.log(`   ${action.name}`);
  }

  console.log(
    `\nMigration complete! Added ${PLAYER_ACTION_DEFINITIONS.length} player action definitions.`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
