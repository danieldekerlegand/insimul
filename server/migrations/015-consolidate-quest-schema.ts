#!/usr/bin/env tsx
/**
 * Migration: Consolidate Quest Schema
 *
 * Renames prologContent → content for quests, making Prolog the single
 * source of truth for quest logic (availability rules, completion checks,
 * objective definitions as Prolog predicates).
 *
 * Quest runtime-mutable fields (objectives, progress, rewards, etc.) are
 * KEPT as separate DB columns because they are actively read/written by
 * the game engine at runtime.
 *
 * Usage:
 *   npx tsx server/migrations/015-consolidate-quest-schema.ts
 *   npx tsx server/migrations/015-consolidate-quest-schema.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

import { convertQuestToProlog } from '../../shared/prolog/quest-converter';

// ── Mongoose schema (full, to read all fields before removal) ───────────

const { Schema } = mongoose;

const QuestSchema = new Schema({
  worldId: { type: String, required: true },
  assignedTo: { type: String, required: true },
  assignedBy: { type: String, default: null },
  assignedToCharacterId: { type: String, default: null },
  assignedByCharacterId: { type: String, default: null },
  title: { type: String, required: true },
  description: { type: String, required: true },
  questType: { type: String, required: true },
  difficulty: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  gameType: { type: String, default: 'language-learning' },
  questChainId: { type: String, default: null },
  questChainOrder: { type: Number, default: null },
  prerequisiteQuestIds: { type: [String], default: null },
  objectives: { type: Schema.Types.Mixed, default: [] },
  progress: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'active' },
  completionCriteria: { type: Schema.Types.Mixed, default: {} },
  experienceReward: { type: Number, default: 0 },
  rewards: { type: Schema.Types.Mixed, default: {} },
  itemRewards: { type: Schema.Types.Mixed, default: null },
  skillRewards: { type: Schema.Types.Mixed, default: null },
  unlocks: { type: Schema.Types.Mixed, default: null },
  stages: { type: Schema.Types.Mixed, default: null },
  currentStageId: { type: String, default: null },
  parentQuestId: { type: String, default: null },
  failureConditions: { type: Schema.Types.Mixed, default: null },
  locationId: { type: String, default: null },
  locationName: { type: String, default: null },
  locationPosition: { type: Schema.Types.Mixed, default: null },
  assignedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  conversationContext: { type: String, default: null },
  tags: { type: Schema.Types.Mixed, default: [] },
  prologContent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const QuestModel = mongoose.models.Quest || mongoose.model('Quest', QuestSchema);

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('=== Migration 015: Consolidate Quest Schema ===');
  if (dryRun) console.log('  (DRY RUN — no database writes)\n');

  await mongoose.connect(MONGO_URL);
  console.log(`Connected to MongoDB: ${MONGO_URL}\n`);

  const allQuests = await QuestModel.find({});
  console.log(`Found ${allQuests.length} total quests\n`);

  let migrated = 0;
  let generated = 0;
  let failed = 0;
  const failures: { title: string; reason: string }[] = [];

  for (const quest of allQuests) {
    const doc = quest.toObject();
    const title = doc.title || doc._id.toString();

    let finalContent: string | null = null;

    if (doc.prologContent && doc.prologContent.trim()) {
      // Existing prologContent → move to content
      finalContent = doc.prologContent.trim();
      migrated++;
    } else {
      // No prologContent — generate from structured data
      try {
        const result = convertQuestToProlog({
          title: doc.title,
          description: doc.description,
          questType: doc.questType,
          difficulty: doc.difficulty,
          status: doc.status,
          assignedTo: doc.assignedTo,
          assignedBy: doc.assignedBy,
          targetLanguage: doc.targetLanguage,
          experienceReward: doc.experienceReward,
          objectives: Array.isArray(doc.objectives) ? doc.objectives : [],
          completionCriteria: doc.completionCriteria || {},
          prerequisiteQuestIds: Array.isArray(doc.prerequisiteQuestIds) ? doc.prerequisiteQuestIds : [],
          rewards: doc.rewards || {},
          itemRewards: doc.itemRewards,
          skillRewards: doc.skillRewards,
          unlocks: doc.unlocks,
          failureConditions: doc.failureConditions,
          questChainId: doc.questChainId,
          questChainOrder: doc.questChainOrder,
          tags: doc.tags,
          stages: doc.stages,
          parentQuestId: doc.parentQuestId,
        });

        if (result.prologContent && result.prologContent.trim()) {
          finalContent = result.prologContent.trim();
          generated++;
        } else {
          failed++;
          failures.push({ title, reason: 'converter produced empty output' });
        }
      } catch (err: any) {
        failed++;
        failures.push({ title, reason: err.message });
      }
    }

    if (!dryRun && finalContent) {
      await QuestModel.updateOne(
        { _id: doc._id },
        {
          $set: {
            content: finalContent,
            updatedAt: new Date(),
          },
          $unset: {
            prologContent: '',
          },
        }
      );
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────

  console.log('\n=== Summary ===');
  console.log(`Total quests:        ${allQuests.length}`);
  console.log(`Migrated:            ${migrated} (prologContent → content)`);
  console.log(`Generated:           ${generated} (structured data → Prolog)`);
  console.log(`Failed:              ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  - ${f.title}: ${f.reason}`);
    }
  }

  // ── Verify ──────────────────────────────────────────────────────────

  if (!dryRun) {
    console.log('\nVerifying...');
    const postQuests = await QuestModel.find({});
    let emptyContent = 0;
    let hasPrologContent = 0;

    for (const quest of postQuests) {
      const doc = quest.toObject();
      if (!doc.content || !doc.content.trim()) emptyContent++;
      if (doc.prologContent) hasPrologContent++;
    }

    console.log(`  Quests with empty content: ${emptyContent}`);
    console.log(`  Quests still with prologContent: ${hasPrologContent} (should be 0)`);

    if (hasPrologContent === 0) {
      console.log('  ✅ All checks passed!');
    } else {
      console.log('  ⚠️  Some checks failed — review above');
    }
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
