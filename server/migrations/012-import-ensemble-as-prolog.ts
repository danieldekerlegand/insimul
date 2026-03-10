#!/usr/bin/env tsx
/**
 * Migration: Import Ensemble JSON seed data as Prolog base rules and actions
 *
 * Reads all Ensemble volition rule files (800 rules) and action files (474 actions)
 * from server/seed/ensemble/, converts them to Prolog using ensemble-converter.ts,
 * and inserts them as base rules/actions (isBase=true, worldId=null).
 *
 * Entries that cannot be converted are skipped with a reason logged.
 *
 * Usage:
 *   npx tsx server/migrations/012-import-ensemble-as-prolog.ts
 *
 * Options:
 *   --dry-run    Show what would be imported without writing to DB
 *   --rules-only Only import volition rules
 *   --actions-only Only import actions
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

// ── Import converter (relative path for tsx) ────────────────────────────

import {
  convertVolitionRuleFile,
  convertActionFile,
  type ConversionResult,
} from '../../shared/prolog/ensemble-converter';

// ── Mongoose schemas (inline, minimal) ──────────────────────────────────

const { Schema } = mongoose;

const RuleSchema = new Schema({
  worldId: { type: String, default: null },
  isBase: { type: Boolean, default: false },
  name: { type: String, required: true },
  description: { type: String, default: null },
  content: { type: String, default: null },
  prologContent: { type: String, default: null },
  sourceFormat: { type: String, default: 'ensemble' },
  ruleType: { type: String, default: 'volition' },
  category: { type: String, default: null },
  priority: { type: Number, default: 5 },
  likelihood: { type: Number, default: 0.5 },
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
  actionType: { type: String, required: true },
  category: { type: String, default: null },
  sourceFormat: { type: String, default: 'ensemble' },
  energyCost: { type: Number, default: 0 },
  cooldown: { type: Number, default: null },
  targetType: { type: String, default: null },
  prerequisites: { type: Schema.Types.Mixed, default: [] },
  effects: { type: Schema.Types.Mixed, default: [] },
  prologContent: { type: String, default: null },
  tags: { type: [String], default: [] },
  customData: { type: Schema.Types.Mixed, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RuleModel = mongoose.models.Rule || mongoose.model('Rule', RuleSchema);
const ActionModel = mongoose.models.Action || mongoose.model('Action', ActionSchema);

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rulesOnly = args.includes('--rules-only');
  const actionsOnly = args.includes('--actions-only');

  console.log('=== Migration 012: Import Ensemble JSON as Prolog ===');
  if (dryRun) console.log('  (DRY RUN — no database writes)');

  const seedDir = path.resolve(__dirname, '../seed/ensemble');

  if (!dryRun) {
    await mongoose.connect(MONGO_URL);
    console.log(`Connected to MongoDB: ${MONGO_URL}`);
  }

  let totalRulesImported = 0;
  let totalRulesSkipped = 0;
  let totalActionsImported = 0;
  let totalActionsSkipped = 0;

  // ── Volition Rules ──────────────────────────────────────────────────

  if (!actionsOnly) {
    const volitionDir = path.join(seedDir, 'volitionRules');
    const ruleFiles = fs.readdirSync(volitionDir).filter(f => f.endsWith('.json'));
    console.log(`\n📜 Processing ${ruleFiles.length} volition rule files...`);

    for (const file of ruleFiles) {
      const filePath = path.join(volitionDir, file);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const category = fileData.category || file.replace('.json', '');
      const rules = fileData.rules || [];

      const results = convertVolitionRuleFile({
        fileName: fileData.fileName || file,
        category,
        rules,
      });

      let fileImported = 0;
      let fileSkipped = 0;

      for (const result of results) {
        if (result.skipped || !result.prologContent) {
          fileSkipped++;
          totalRulesSkipped++;
          continue;
        }

        if (!dryRun) {
          // Check if rule already exists (by name + isBase)
          const existing = await RuleModel.findOne({
            name: result.name,
            isBase: true,
            sourceFormat: 'ensemble',
          });

          if (existing) {
            // Update prologContent
            await RuleModel.updateOne(
              { _id: existing._id },
              {
                prologContent: result.prologContent,
                updatedAt: new Date(),
              }
            );
          } else {
            await RuleModel.create({
              worldId: null,
              isBase: true,
              name: result.name,
              description: `Ensemble volition rule: ${result.name}`,
              content: result.prologContent,
              prologContent: result.prologContent,
              sourceFormat: 'ensemble',
              ruleType: 'volition',
              category,
              priority: 5,
              likelihood: 0.5,
              tags: [category, 'ensemble', 'volition'],
              isActive: true,
            });
          }
        }

        fileImported++;
        totalRulesImported++;
      }

      console.log(`  ${file}: ${fileImported} imported, ${fileSkipped} skipped (of ${rules.length})`);
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────

  if (!rulesOnly) {
    const actionsDir = path.join(seedDir, 'actions');
    const actionFiles = fs.readdirSync(actionsDir).filter(f => f.endsWith('.json'));
    console.log(`\n⚡ Processing ${actionFiles.length} action files...`);

    for (const file of actionFiles) {
      const filePath = path.join(actionsDir, file);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const category = fileData.category || file.replace('.json', '');
      const actions = fileData.actions || [];

      const results = convertActionFile({
        category,
        actions,
      });

      let fileImported = 0;
      let fileSkipped = 0;

      for (const result of results) {
        if (result.skipped || !result.prologContent) {
          fileSkipped++;
          totalActionsSkipped++;
          continue;
        }

        if (!dryRun) {
          // Determine action type from category
          let actionType = 'social';
          if (category.startsWith('conversational')) actionType = 'conversation';
          else if (category.startsWith('romantic')) actionType = 'romantic';
          else if (category.startsWith('hostile')) actionType = 'hostile';
          else if (category.startsWith('deceptive')) actionType = 'deceptive';
          else if (category.startsWith('impression')) actionType = 'impression';
          else if (category.startsWith('emotional')) actionType = 'emotional';
          else if (category.startsWith('trust')) actionType = 'trust';
          else if (category.startsWith('virtue')) actionType = 'virtue';
          else if (category.startsWith('dominance')) actionType = 'dominance';
          else if (category.startsWith('self')) actionType = 'self_improvement';
          else if (category.startsWith('physical')) actionType = 'physical';
          else if (category.startsWith('intent')) actionType = 'intent';
          else if (category.startsWith('relationship')) actionType = 'relationship';
          else if (category.startsWith('behavioral')) actionType = 'behavioral';
          else if (category.startsWith('information')) actionType = 'information';
          else if (category.startsWith('theatrical')) actionType = 'theatrical';
          else if (category.startsWith('status')) actionType = 'status';
          else if (category.startsWith('gratitude')) actionType = 'gratitude';
          else if (category.startsWith('rejection')) actionType = 'rejection';

          // Check if action already exists
          const existing = await ActionModel.findOne({
            name: result.name,
            isBase: true,
            sourceFormat: 'ensemble',
          });

          if (existing) {
            await ActionModel.updateOne(
              { _id: existing._id },
              {
                prologContent: result.prologContent,
                updatedAt: new Date(),
              }
            );
          } else {
            await ActionModel.create({
              worldId: null,
              isBase: true,
              name: result.name,
              description: `Ensemble action: ${result.name}`,
              actionType,
              category,
              sourceFormat: 'ensemble',
              energyCost: 0,
              prologContent: result.prologContent,
              tags: [category, 'ensemble'],
              isActive: true,
            });
          }
        }

        fileImported++;
        totalActionsImported++;
      }

      console.log(`  ${file}: ${fileImported} imported, ${fileSkipped} skipped (of ${actions.length})`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────

  console.log('\n=== Summary ===');
  console.log(`Volition rules: ${totalRulesImported} imported, ${totalRulesSkipped} skipped`);
  console.log(`Actions: ${totalActionsImported} imported, ${totalActionsSkipped} skipped`);
  console.log(`Total: ${totalRulesImported + totalActionsImported} imported, ${totalRulesSkipped + totalActionsSkipped} skipped`);

  if (!dryRun) {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }

  console.log('Done!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
