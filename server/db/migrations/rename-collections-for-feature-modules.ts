/**
 * Migration: Rename language-learning-specific MongoDB collections
 * to generic feature-module names.
 *
 * This migration renames:
 *   - vocabularyentries → knowledgeentries
 *   - languageprogress  → proficiencyprogress
 *   - languageassessments → assessments
 *
 * Run this ONCE when you're ready to cut over from language-specific
 * collection names to generic names. After running, update the Mongoose
 * model definitions in mongo-storage.ts to use the new names.
 *
 * Usage:
 *   npx tsx server/db/migrations/rename-collections-for-feature-modules.ts
 *
 * The script is idempotent — if a target collection already exists and
 * the source doesn't, it skips that rename.
 */

import mongoose from 'mongoose';

const RENAMES: Array<{ from: string; to: string }> = [
  { from: 'vocabularyentries', to: 'knowledgeentries' },
  { from: 'languageprogress', to: 'proficiencyprogress' },
  { from: 'languageassessments', to: 'assessments' },
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/insimul';
  console.log(`Connecting to ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Failed to get database handle.');
    process.exit(1);
  }

  const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
  console.log(`Found ${existingCollections.length} collections.`);

  for (const { from, to } of RENAMES) {
    if (!existingCollections.includes(from)) {
      if (existingCollections.includes(to)) {
        console.log(`  ✓ ${from} → ${to} (already renamed)`);
      } else {
        console.log(`  - ${from} does not exist, skipping`);
      }
      continue;
    }

    if (existingCollections.includes(to)) {
      console.warn(`  ⚠ Both "${from}" and "${to}" exist. Skipping to avoid data loss.`);
      console.warn(`    Manually merge or drop one before re-running.`);
      continue;
    }

    console.log(`  Renaming ${from} → ${to}...`);
    await db.collection(from).rename(to);
    console.log(`  ✓ ${from} → ${to}`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
