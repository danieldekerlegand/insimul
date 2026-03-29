#!/usr/bin/env tsx
/**
 * Migration 039: Regenerate all action content as proper Prolog
 *
 * Replaces the custom Insimul DSL format in the `content` field with
 * canonical Prolog predicates using the action-converter. This makes
 * the content field genuinely executable by tau-prolog and passes
 * the content validator.
 *
 * Before:
 *   action buy_item {
 *     description("Purchase an item")
 *     action_type: economic
 *     energy_cost: 0
 *     ...
 *   }
 *
 * After:
 *   % Action: buy_item
 *   % Purchase an item from a merchant NPC
 *   % Type: economic / commerce
 *
 *   action(buy_item, 'buy_item', economic, 0).
 *   action_difficulty(buy_item, 0.1).
 *   action_duration(buy_item, 1).
 *   action_category(buy_item, commerce).
 *   action_parent(buy_item, trade).
 *   action_verb(buy_item, past, 'bought').
 *   action_verb(buy_item, present, 'buys').
 *   action_target_type(buy_item, other).
 *   action_requires_target(buy_item).
 *
 *   % Can Actor perform this action?
 *   can_perform(Actor, buy_item, Target) :-
 *       action(buy_item, _, _, EnergyCost),
 *       energy(Actor, E),
 *       E >= EnergyCost.
 *
 * Usage:
 *   npx tsx server/migrations/039-regenerate-action-prolog-content.ts
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
  console.log('  Migration 039: Regenerate action content as Prolog');
  console.log('='.repeat(60) + '\n');

  const allActions = await storage.getBaseActions();
  console.log(`Found ${allActions.length} base actions to convert\n`);

  let converted = 0;
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

    await storage.updateAction(action.id, {
      content: result.prologContent,
      sourceFormat: 'prolog',
    } as any);

    converted++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  Done!`);
  console.log(`    Converted: ${converted}`);
  console.log(`    Errors: ${errors}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((err) => { console.error('Migration failed:', err); process.exit(1); });
