#!/usr/bin/env tsx
/**
 * Migration: Consolidate Action Schema
 *
 * Makes Prolog the single source of truth for action content by:
 *   1. Merging prologContent into content (Prolog wins if it exists)
 *   2. Converting legacy actions to Prolog where prologContent is missing
 *   3. Removing deprecated fields: prologContent, prerequisites, effects,
 *      sideEffects, triggerConditions
 *
 * Denormalized DB columns kept for queries: actionType, category, energyCost,
 * cooldown, targetType, duration, difficulty, isActive, requiresTarget, range,
 * isAvailable
 *
 * Usage:
 *   npx tsx server/migrations/014-consolidate-action-schema.ts
 *   npx tsx server/migrations/014-consolidate-action-schema.ts --dry-run
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

import { convertActionToProlog } from '../../shared/prolog/action-converter';
import { extractActionMetadata } from '../../shared/prolog/prolog-metadata-extractor';

// ── Mongoose schema (full, to read all fields before removal) ───────────

const { Schema } = mongoose;

const ActionSchema = new Schema({
  worldId: { type: String, default: null },
  isBase: { type: Boolean, default: false },
  name: { type: String, required: true },
  description: { type: String, default: null },
  actionType: { type: String, required: true },
  category: { type: String, default: null },
  sourceFormat: { type: String, default: 'insimul' },
  energyCost: { type: Number, default: null },
  cooldown: { type: Number, default: null },
  targetType: { type: String, default: null },
  duration: { type: Number, default: 1 },
  difficulty: { type: Number, default: 0.5 },
  requiresTarget: { type: Boolean, default: false },
  range: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  prerequisites: { type: Schema.Types.Mixed, default: [] },
  effects: { type: Schema.Types.Mixed, default: [] },
  sideEffects: { type: Schema.Types.Mixed, default: [] },
  triggerConditions: { type: Schema.Types.Mixed, default: [] },
  prologContent: { type: String, default: null },
  verbPast: { type: String, default: null },
  verbPresent: { type: String, default: null },
  narrativeTemplates: { type: Schema.Types.Mixed, default: [] },
  customData: { type: Schema.Types.Mixed, default: null },
  tags: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ActionModel = mongoose.models.Action || mongoose.model('Action', ActionSchema);

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('=== Migration 014: Consolidate Action Schema ===');
  if (dryRun) console.log('  (DRY RUN — no database writes)\n');

  await mongoose.connect(MONGO_URL);
  console.log(`Connected to MongoDB: ${MONGO_URL}\n`);

  const allActions = await ActionModel.find({});
  console.log(`Found ${allActions.length} total actions\n`);

  let consolidated = 0;
  let converted = 0;
  let alreadyProlog = 0;
  let failed = 0;
  const failures: { name: string; reason: string }[] = [];

  for (const action of allActions) {
    const doc = action.toObject();
    const name = doc.name || doc._id.toString();

    let finalContent: string;

    // Determine the best Prolog content
    if (doc.prologContent && doc.prologContent.trim()) {
      // prologContent exists — use it as canonical
      finalContent = doc.prologContent.trim();
      consolidated++;
    } else if (doc.sourceFormat === 'prolog' && doc.content && doc.content.trim()) {
      // content is already Prolog (unlikely for actions but handle it)
      finalContent = doc.content.trim();
      alreadyProlog++;
    } else {
      // No prologContent — convert from structured data
      try {
        const result = convertActionToProlog({
          name: doc.name,
          description: doc.description,
          actionType: doc.actionType,
          category: doc.category,
          energyCost: doc.energyCost,
          difficulty: doc.difficulty,
          duration: doc.duration,
          targetType: doc.targetType,
          requiresTarget: doc.requiresTarget,
          range: doc.range,
          cooldown: doc.cooldown,
          prerequisites: Array.isArray(doc.prerequisites) ? doc.prerequisites : [],
          effects: Array.isArray(doc.effects) ? doc.effects : [],
          sideEffects: Array.isArray(doc.sideEffects) ? doc.sideEffects : [],
          triggerConditions: Array.isArray(doc.triggerConditions) ? doc.triggerConditions : [],
        });

        if (result.prologContent && result.prologContent.trim()) {
          finalContent = result.prologContent.trim();
          converted++;
        } else {
          finalContent = `% Could not convert action: ${name}\naction(${sanitizeAtom(name)}, '${name}', ${sanitizeAtom(doc.actionType || 'social')}, ${doc.energyCost || 1}).`;
          failed++;
          failures.push({ name, reason: 'converter produced empty output' });
        }
      } catch (err: any) {
        finalContent = `% Conversion error: ${err.message}\naction(${sanitizeAtom(name)}, '${name}', ${sanitizeAtom(doc.actionType || 'social')}, ${doc.energyCost || 1}).`;
        failed++;
        failures.push({ name, reason: err.message });
      }
    }

    // Extract metadata from Prolog to keep denormalized columns in sync
    const extracted = extractActionMetadata(finalContent);
    const finalActionType = extracted.actionType || doc.actionType || 'social';
    const finalEnergyCost = extracted.energyCost ?? doc.energyCost ?? 1;
    const finalDifficulty = extracted.difficulty ?? doc.difficulty ?? 0.5;
    const finalDuration = extracted.duration ?? doc.duration ?? 1;
    const finalTargetType = extracted.targetType || doc.targetType || null;
    const finalCooldown = extracted.cooldown ?? doc.cooldown ?? 0;

    if (!dryRun) {
      await ActionModel.updateOne(
        { _id: doc._id },
        {
          $set: {
            content: finalContent,
            sourceFormat: 'prolog',
            actionType: finalActionType,
            energyCost: finalEnergyCost,
            difficulty: finalDifficulty,
            duration: finalDuration,
            targetType: finalTargetType,
            cooldown: finalCooldown,
            updatedAt: new Date(),
          },
          $unset: {
            prologContent: '',
            prerequisites: '',
            effects: '',
            sideEffects: '',
            triggerConditions: '',
          },
        }
      );
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────

  console.log('\n=== Summary ===');
  console.log(`Total actions:      ${allActions.length}`);
  console.log(`Consolidated:       ${consolidated} (prologContent → content)`);
  console.log(`Already Prolog:     ${alreadyProlog}`);
  console.log(`Converted:          ${converted} (structured data → Prolog)`);
  console.log(`Failed/placeholder: ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  - ${f.name}: ${f.reason}`);
    }
  }

  // ── Verify ──────────────────────────────────────────────────────────

  if (!dryRun) {
    console.log('\nVerifying...');
    const postActions = await ActionModel.find({});
    let emptyContent = 0;
    let hasPrologContent = 0;
    let hasPrerequisites = 0;
    let hasEffects = 0;

    for (const action of postActions) {
      const doc = action.toObject();
      if (!doc.content || !doc.content.trim()) emptyContent++;
      if (doc.prologContent) hasPrologContent++;
      if (doc.prerequisites && Array.isArray(doc.prerequisites) && doc.prerequisites.length > 0) hasPrerequisites++;
      if (doc.effects && Array.isArray(doc.effects) && doc.effects.length > 0) hasEffects++;
    }

    console.log(`  Actions with empty content: ${emptyContent}`);
    console.log(`  Actions still with prologContent: ${hasPrologContent} (should be 0)`);
    console.log(`  Actions still with prerequisites[]: ${hasPrerequisites} (should be 0)`);
    console.log(`  Actions still with effects[]: ${hasEffects} (should be 0)`);

    if (emptyContent === 0 && hasPrologContent === 0 && hasPrerequisites === 0 && hasEffects === 0) {
      console.log('  ✅ All checks passed!');
    } else {
      console.log('  ⚠️  Some checks failed — review above');
    }
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

function sanitizeAtom(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
