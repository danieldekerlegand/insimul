#!/usr/bin/env tsx
/**
 * Migration: Add examine_object base action
 *
 * Adds the examine_object action that lets players inspect world objects
 * and see their names in the target language. This supports language learning
 * by associating physical objects with vocabulary in the learner's target language.
 *
 * Usage:
 *   npx tsx server/migrations/020-add-examine-object-action.ts
 *
 * Options:
 *   --dry-run    Show what would be inserted without modifying the database
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

// ── New Action ─────────────────────────────────────────────────────────

const EXAMINE_OBJECT_ACTION = {
  name: "examine_object",
  description: "Examine a nearby world object to learn its name in the target language",
  content: `action examine_object {
  requires(
    near(?actor, ?object, 5),
    is_world_object(?object),
    has_language_data(?object, ?target_word, ?language)
  )
  effects(
    add_vocabulary(?actor, ?target_word, ?language),
    add_xp(?actor, language, 3),
    add_event(?actor, examined_object, ?object)
  )
  energy_cost: 0
  target_type: object
  cooldown: 0
}`,
  actionType: "mental",
  category: "language-learning",
  duration: 1,
  difficulty: 0.1,
  energyCost: 0,
  targetType: "object",
  requiresTarget: true,
  range: 5,
  cooldown: 0,
  verbPast: "examined",
  verbPresent: "examines",
  tags: ["language-learning", "vocabulary", "examination", "passive"],
};

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected\n');

  const existing = await ActionModel.findOne({ name: 'examine_object', isBase: true });

  if (existing) {
    console.log('examine_object base action already exists — skipping');
    await mongoose.disconnect();
    return;
  }

  if (dryRun) {
    console.log('DRY RUN — would insert:');
    console.log(`   examine_object (${EXAMINE_OBJECT_ACTION.actionType}, ${EXAMINE_OBJECT_ACTION.category})`);
    await mongoose.disconnect();
    return;
  }

  console.log('Inserting examine_object base action...');
  await ActionModel.create({
    ...EXAMINE_OBJECT_ACTION,
    isBase: true,
    worldId: null,
    isActive: true,
    isAvailable: true,
    sourceFormat: 'insimul',
  });
  console.log('   Done: examine_object');

  console.log('\nMigration complete!');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
