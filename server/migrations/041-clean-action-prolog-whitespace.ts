#!/usr/bin/env tsx
/**
 * Migration 041: Clean action Prolog whitespace
 *
 * Re-runs the action converter on all 133 base actions to produce
 * clean Prolog output with no double-blank-lines or trailing blanks.
 *
 * Idempotent — safe to re-run.
 *
 * Usage:
 *   npx tsx server/migrations/041-clean-action-prolog-whitespace.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';
import { convertActionToProlog } from '../../shared/prolog/action-converter.js';

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 041: Clean action Prolog whitespace');
  console.log('='.repeat(60) + '\n');

  const allActions = await storage.getBaseActions();
  console.log(`Found ${allActions.length} base actions to clean\n`);

  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (const action of allActions) {
    const result = convertActionToProlog({
      name: action.name,
      description: action.description || undefined,
      actionType: action.actionType,
      category: action.category || undefined,
      parentAction: (action as any).parentAction || undefined,
      energyCost: action.energyCost,
      difficulty: action.difficulty,
      duration: action.duration,
      targetType: action.targetType,
      requiresTarget: action.requiresTarget,
      range: action.range,
      cooldown: action.cooldown,
      verbPast: action.verbPast || undefined,
      verbPresent: action.verbPresent || undefined,
    });

    if (result.errors.length > 0) {
      console.error(`  ERROR [${action.name}]: ${result.errors.join('; ')}`);
      errors++;
      continue;
    }

    if (action.content === result.prologContent) {
      unchanged++;
      continue;
    }

    await storage.updateAction(action.id, {
      content: result.prologContent,
      sourceFormat: 'prolog',
    } as any);

    updated++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  Done!`);
  console.log(`    Updated:   ${updated}`);
  console.log(`    Unchanged: ${unchanged}`);
  console.log(`    Errors:    ${errors}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((err) => { console.error('Migration failed:', err); process.exit(1); });
