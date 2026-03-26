#!/usr/bin/env tsx
/**
 * Migration 037: Seed Main Quest Chain
 *
 * Seeds the "Missing Writer Mystery" quest chain for all existing worlds
 * that don't already have it. New worlds created after this migration
 * will have the chain seeded automatically during creation.
 *
 * The chain consists of 8 quests using questChainId and questChainOrder:
 *   0: Arrival Assessment
 *   1: The Notice Board
 *   2: The Writer's Home
 *   3: Following the Trail
 *   4: The Hidden Writings
 *   5: The Secret Location
 *   6: The Final Chapter
 *   7: Departure Assessment
 *
 * Idempotent: skips worlds that already have main-quest tagged chain quests.
 *
 * Usage:
 *   npx tsx server/migrations/037-seed-main-quest-chain.ts
 *
 * Options:
 *   --dry-run    Show what would be created without modifying the database
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGODB_URL || process.env.DATABASE_URL || '';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`\n=== Migration 037: Seed Main Quest Chain ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  if (!MONGO_URL) {
    console.error('No MONGODB_URL or DATABASE_URL found in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB\n');

  // Dynamic imports after DB is connected (storage auto-connects)
  const { storage } = await import('../db/storage.js');
  const { seedMainQuestChain, hasMainQuestChain } = await import('../services/main-quest-chain-seeder.js');

  const worlds = await storage.getWorlds();
  console.log(`Found ${worlds.length} worlds\n`);

  let seeded = 0;
  let skipped = 0;

  for (const world of worlds) {
    const targetLanguage = world.targetLanguage || 'french';

    if (DRY_RUN) {
      const exists = await hasMainQuestChain(world.id);
      if (exists) {
        console.log(`  [SKIP] World "${world.name}" (${world.id}) — already has main quest chain`);
        skipped++;
      } else {
        console.log(`  [WOULD SEED] World "${world.name}" (${world.id}) — ${targetLanguage}`);
        seeded++;
      }
      continue;
    }

    const chain = await seedMainQuestChain(world.id, targetLanguage);
    if (chain) {
      console.log(`  [SEEDED] World "${world.name}" (${world.id}) — ${chain.quests.length} quests`);
      seeded++;
    } else {
      console.log(`  [SKIP] World "${world.name}" (${world.id}) — already has main quest chain`);
      skipped++;
    }
  }

  console.log(`\nDone: ${seeded} seeded, ${skipped} skipped\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
