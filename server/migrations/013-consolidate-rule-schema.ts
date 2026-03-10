#!/usr/bin/env tsx
/**
 * Migration: Consolidate Rule Schema
 *
 * Makes Prolog the single source of truth for rule content by:
 *   1. Merging prologContent into content (Prolog wins if both exist)
 *   2. Converting legacy content to Prolog where prologContent is missing
 *   3. Ensuring metadata facts exist in Prolog content
 *   4. Removing deprecated fields: prologContent, isCompiled, compiledOutput,
 *      conditions (JSON array), effects (JSON array), dependencies
 *
 * Usage:
 *   npx tsx server/migrations/013-consolidate-rule-schema.ts
 *   npx tsx server/migrations/013-consolidate-rule-schema.ts --dry-run
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

import { convertRuleToProlog } from '../../shared/prolog/rule-converter';
import {
  extractAllMetadata,
  ensureMetadataInProlog,
} from '../../shared/prolog/prolog-metadata-extractor';

// ── Mongoose schema (full, to read all fields before removal) ───────────

const { Schema } = mongoose;

const RuleSchema = new Schema({
  worldId: { type: String, default: null },
  isBase: { type: Boolean, default: false },
  name: { type: String, required: true },
  content: { type: String, required: true },
  prologContent: { type: String, default: null },
  sourceFormat: { type: String, required: true },
  ruleType: { type: String, required: true },
  category: { type: String, default: null },
  priority: { type: Number, default: 5 },
  likelihood: { type: Number, default: 1.0 },
  conditions: { type: Schema.Types.Mixed, default: [] },
  effects: { type: Schema.Types.Mixed, default: [] },
  tags: { type: [String], default: [] },
  dependencies: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  description: { type: String, default: null },
  isCompiled: { type: Boolean, default: false },
  compiledOutput: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RuleModel = mongoose.models.Rule || mongoose.model('Rule', RuleSchema);

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('=== Migration 013: Consolidate Rule Schema ===');
  if (dryRun) console.log('  (DRY RUN — no database writes)\n');

  await mongoose.connect(MONGO_URL);
  console.log(`Connected to MongoDB: ${MONGO_URL}\n`);

  const allRules = await RuleModel.find({});
  console.log(`Found ${allRules.length} total rules\n`);

  let consolidated = 0;
  let converted = 0;
  let alreadyProlog = 0;
  let failed = 0;
  const failures: { name: string; reason: string }[] = [];

  for (const rule of allRules) {
    const doc = rule.toObject();
    const name = doc.name || doc._id.toString();

    let finalContent: string;

    // Determine the best Prolog content
    if (doc.prologContent && doc.prologContent.trim()) {
      // prologContent exists — use it as canonical
      finalContent = doc.prologContent.trim();
      consolidated++;
    } else if (doc.sourceFormat === 'prolog' && doc.content && doc.content.trim()) {
      // content is already Prolog
      finalContent = doc.content.trim();
      alreadyProlog++;
    } else if (doc.content && doc.content.trim()) {
      // content is legacy format — try to convert
      try {
        const result = convertRuleToProlog({
          name: doc.name,
          content: doc.content,
          sourceFormat: doc.sourceFormat,
          ruleType: doc.ruleType,
          conditions: Array.isArray(doc.conditions) ? doc.conditions : [],
          effects: Array.isArray(doc.effects) ? doc.effects : [],
          priority: doc.priority,
          likelihood: doc.likelihood,
          category: doc.category,
          description: doc.description,
        });

        if (result.prologContent && result.prologContent.trim()) {
          finalContent = result.prologContent.trim();
          converted++;
        } else {
          // Conversion produced empty result — wrap raw content as comment
          finalContent = `% Could not convert from ${doc.sourceFormat}\n% Original: ${doc.name}\nrule_active(${sanitizeAtom(name)}).\nrule_priority(${sanitizeAtom(name)}, ${doc.priority || 5}).`;
          failed++;
          failures.push({ name, reason: 'converter produced empty output' });
        }
      } catch (err: any) {
        finalContent = `% Conversion error: ${err.message}\nrule_active(${sanitizeAtom(name)}).\nrule_priority(${sanitizeAtom(name)}, ${doc.priority || 5}).`;
        failed++;
        failures.push({ name, reason: err.message });
      }
    } else {
      // No content at all — create minimal placeholder
      finalContent = `rule_active(${sanitizeAtom(name)}).\nrule_priority(${sanitizeAtom(name)}, ${doc.priority || 5}).`;
      failed++;
      failures.push({ name, reason: 'no content' });
    }

    // Ensure metadata facts are present in the Prolog content
    finalContent = ensureMetadataInProlog(finalContent, {
      name: doc.name,
      priority: doc.priority ?? 5,
      likelihood: doc.likelihood ?? 1.0,
      ruleType: doc.ruleType,
      category: doc.category,
      isActive: doc.isActive,
    });

    // Validate: extract metadata back and check consistency
    const extracted = extractAllMetadata(finalContent);
    const priorityMismatch = extracted.priority != null && doc.priority != null
      && extracted.priority !== doc.priority;
    const likelihoodMismatch = extracted.likelihood != null && doc.likelihood != null
      && Math.abs(extracted.likelihood - doc.likelihood) > 0.01;

    // Use Prolog-derived values as canonical (they come from original data)
    const finalPriority = extracted.priority ?? doc.priority ?? 5;
    const finalLikelihood = extracted.likelihood ?? doc.likelihood ?? 1.0;

    if (!dryRun) {
      // Update the document
      await RuleModel.updateOne(
        { _id: doc._id },
        {
          $set: {
            content: finalContent,
            sourceFormat: 'prolog',
            priority: finalPriority,
            likelihood: finalLikelihood,
            updatedAt: new Date(),
          },
          $unset: {
            prologContent: '',
            isCompiled: '',
            compiledOutput: '',
            conditions: '',
            effects: '',
            dependencies: '',
          },
        }
      );
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────

  console.log('\n=== Summary ===');
  console.log(`Total rules:        ${allRules.length}`);
  console.log(`Consolidated:       ${consolidated} (prologContent → content)`);
  console.log(`Already Prolog:     ${alreadyProlog}`);
  console.log(`Converted:          ${converted} (legacy format → Prolog)`);
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
    const postRules = await RuleModel.find({});
    let emptyContent = 0;
    let hasPrologContent = 0;
    let hasConditions = 0;

    for (const rule of postRules) {
      const doc = rule.toObject();
      if (!doc.content || !doc.content.trim()) emptyContent++;
      if (doc.prologContent) hasPrologContent++;
      if (doc.conditions && Array.isArray(doc.conditions) && doc.conditions.length > 0) hasConditions++;
    }

    console.log(`  Rules with empty content: ${emptyContent}`);
    console.log(`  Rules still with prologContent: ${hasPrologContent} (should be 0)`);
    console.log(`  Rules still with conditions[]: ${hasConditions} (should be 0)`);

    if (emptyContent === 0 && hasPrologContent === 0 && hasConditions === 0) {
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
