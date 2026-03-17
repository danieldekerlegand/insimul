#!/usr/bin/env tsx
/**
 * Migration: Add Language Learning Base Actions
 *
 * Adds 10 new base actions for language learning interactions.
 * These complement the existing base actions from migration 019 and map
 * to the new 'language' actionType added to the Action interface.
 *
 * Usage:
 *   npx tsx server/migrations/020-language-learning-actions.ts
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

const ActionModel = mongoose.models.Action || mongoose.model('Action', ActionSchema, 'actions');

// ── Language Learning Base Actions ─────────────────────────────────────

export const LANGUAGE_LEARNING_ACTIONS = [
  {
    name: 'examine_object',
    description: 'Inspect a world object to see its name in the target language',
    content: `action examine_object {
  requires(near(?actor, ?object, 5), is_examinable(?object))
  effects(
    reveal_name(?object, ?language),
    add_vocabulary(?actor, ?word, ?language),
    add_xp(?actor, language, 3),
    add_event(?actor, examined_object, ?object)
  )
  energy_cost: 0
  target_type: object
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.1,
    energyCost: 0,
    targetType: 'object',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'examined',
    verbPresent: 'examines',
    tags: ['language-learning', 'vocabulary', 'exploration'],
  },
  {
    name: 'read_sign',
    description: 'Read text on signs, menus, or books written in the target language',
    content: `action read_sign {
  requires(near(?actor, ?sign, 5), is_readable(?sign))
  effects(
    display_text(?sign, ?language),
    add_xp(?actor, language, 3),
    add_event(?actor, read_sign, ?sign)
  )
  energy_cost: 0
  target_type: object
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.2,
    energyCost: 0,
    targetType: 'object',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'read',
    verbPresent: 'reads',
    tags: ['language-learning', 'reading', 'comprehension'],
  },
  {
    name: 'write_response',
    description: 'Compose written text in the target language in response to a prompt',
    content: `action write_response {
  requires(has_prompt(?actor, ?prompt))
  effects(
    evaluate_writing(?actor, ?response, ?language),
    add_xp(?actor, language, 5),
    add_event(?actor, wrote_response, ?prompt)
  )
  energy_cost: 1
  target_type: self
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.5,
    energyCost: 1,
    targetType: 'self',
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: 'wrote a response',
    verbPresent: 'writes a response',
    tags: ['language-learning', 'writing', 'composition'],
  },
  {
    name: 'listen_and_repeat',
    description: 'Listen to an NPC phrase and repeat it back via speech',
    content: `action listen_and_repeat {
  requires(near(?actor, ?npc), is_npc(?npc), in_conversation(?actor, ?npc))
  effects(
    play_phrase(?npc, ?phrase, ?language),
    evaluate_pronunciation(?actor, ?phrase),
    add_xp(?actor, language, 4),
    add_event(?actor, listened_and_repeated, ?npc)
  )
  energy_cost: 0
  target_type: other
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.4,
    energyCost: 0,
    targetType: 'other',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'listened and repeated',
    verbPresent: 'listens and repeats',
    tags: ['language-learning', 'pronunciation', 'listening'],
  },
  {
    name: 'point_and_name',
    description: 'Point at an object and name it in the target language',
    content: `action point_and_name {
  requires(near(?actor, ?object, 5), is_examinable(?object))
  effects(
    evaluate_naming(?actor, ?object, ?language),
    add_xp(?actor, language, 4),
    add_event(?actor, pointed_and_named, ?object)
  )
  energy_cost: 0
  target_type: object
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.3,
    energyCost: 0,
    targetType: 'object',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'pointed at and named',
    verbPresent: 'points at and names',
    tags: ['language-learning', 'vocabulary', 'identification'],
  },
  {
    name: 'ask_for_directions',
    description: 'Ask an NPC for directions using the target language',
    content: `action ask_for_directions {
  requires(near(?actor, ?npc), is_npc(?npc), in_conversation(?actor, ?npc))
  effects(
    evaluate_request(?actor, ?language),
    provide_directions(?npc, ?destination, ?language),
    add_xp(?actor, language, 5),
    add_event(?actor, asked_directions, ?npc)
  )
  energy_cost: 0
  target_type: other
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.4,
    energyCost: 0,
    targetType: 'other',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'asked for directions',
    verbPresent: 'asks for directions',
    tags: ['language-learning', 'conversation', 'navigation'],
  },
  {
    name: 'order_food',
    description: 'Order food or drinks at a restaurant or market in the target language',
    content: `action order_food {
  requires(
    near(?actor, ?npc),
    is_npc(?npc),
    in_conversation(?actor, ?npc),
    npc_sells_food(?npc)
  )
  effects(
    evaluate_order(?actor, ?language),
    add_item(?actor, ?food),
    add_xp(?actor, language, 5),
    add_event(?actor, ordered_food, ?npc)
  )
  energy_cost: 0
  target_type: other
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.4,
    energyCost: 0,
    targetType: 'other',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'ordered food',
    verbPresent: 'orders food',
    tags: ['language-learning', 'conversation', 'commerce'],
  },
  {
    name: 'haggle_price',
    description: 'Negotiate a price with a merchant using the target language',
    content: `action haggle_price {
  requires(
    near(?actor, ?merchant),
    is_merchant(?merchant),
    in_conversation(?actor, ?merchant)
  )
  effects(
    evaluate_negotiation(?actor, ?language),
    modify_price(?merchant, ?item, ?discount),
    add_xp(?actor, language, 6),
    add_event(?actor, haggled_price, ?merchant)
  )
  energy_cost: 1
  target_type: other
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.6,
    energyCost: 1,
    targetType: 'other',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'haggled with',
    verbPresent: 'haggles with',
    tags: ['language-learning', 'conversation', 'commerce', 'negotiation'],
  },
  {
    name: 'introduce_self',
    description: 'Introduce yourself to an NPC in the target language',
    content: `action introduce_self {
  requires(near(?actor, ?npc), is_npc(?npc), in_conversation(?actor, ?npc))
  effects(
    evaluate_introduction(?actor, ?language),
    modify_relationship(?actor, ?npc, familiarity, +2),
    add_xp(?actor, language, 3),
    add_event(?actor, introduced_self, ?npc)
  )
  energy_cost: 0
  target_type: other
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.2,
    energyCost: 0,
    targetType: 'other',
    requiresTarget: true,
    range: 5,
    cooldown: 0,
    verbPast: 'introduced oneself to',
    verbPresent: 'introduces oneself to',
    tags: ['language-learning', 'conversation', 'social'],
  },
  {
    name: 'describe_scene',
    description: 'Describe what you see in the current location in the target language',
    content: `action describe_scene {
  requires(is_alive(?actor))
  effects(
    evaluate_description(?actor, ?language),
    add_xp(?actor, language, 5),
    add_event(?actor, described_scene, ?location)
  )
  energy_cost: 1
  target_type: self
  cooldown: 0
}`,
    actionType: 'language',
    category: 'language-learning',
    duration: 1,
    difficulty: 0.5,
    energyCost: 1,
    targetType: 'self',
    requiresTarget: false,
    range: 0,
    cooldown: 0,
    verbPast: 'described the scene',
    verbPresent: 'describes the scene',
    tags: ['language-learning', 'composition', 'observation'],
  },
];

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected\n');

  const actionNames = LANGUAGE_LEARNING_ACTIONS.map(a => a.name);

  // Check for existing language learning actions
  const existing = await ActionModel.countDocuments({
    isBase: true,
    name: { $in: actionNames },
  });

  console.log(`Existing language learning base actions: ${existing}`);
  console.log(`New actions to insert: ${LANGUAGE_LEARNING_ACTIONS.length}`);

  if (dryRun) {
    console.log('\nDRY RUN — would insert:');
    for (const action of LANGUAGE_LEARNING_ACTIONS) {
      console.log(`   ${action.name} (${action.actionType}/${action.category})`);
    }
    await mongoose.disconnect();
    return;
  }

  // Remove any existing language learning base actions (idempotent)
  if (existing > 0) {
    console.log(`\nRemoving ${existing} existing language learning actions...`);
    await ActionModel.deleteMany({ isBase: true, name: { $in: actionNames } });
  }

  // Insert new language learning actions
  console.log(`\nInserting ${LANGUAGE_LEARNING_ACTIONS.length} language learning actions...`);
  for (const action of LANGUAGE_LEARNING_ACTIONS) {
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

  console.log(`\nMigration complete! Added ${LANGUAGE_LEARNING_ACTIONS.length} language learning actions.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
