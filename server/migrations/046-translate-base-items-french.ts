#!/usr/bin/env tsx
/**
 * Migration 046: Translate all base items to French
 *
 * Batch-translates all base items that lack a French translation using
 * the existing LLM-based batchTranslateItems service. Results are merged
 * into each item's `translations` dict under the `French` key.
 *
 * Requires: GEMINI_API_KEY in .env
 *
 * Usage:
 *   npx tsx server/migrations/046-translate-base-items-french.ts
 *   npx tsx server/migrations/046-translate-base-items-french.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { batchTranslateItems } from '../services/item-translation.js';

const TARGET_LANGUAGE = 'French';
const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) { console.error('MONGO_URL not set'); process.exit(1); }

  await mongoose.connect(mongoUrl);
  const Item = mongoose.connection.collection('items');

  console.log(`\n📦 Migration 046: Translate base items to ${TARGET_LANGUAGE}${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // Get all base items
  const allBase = await Item.find(
    { isBase: true },
    { projection: { name: 1, category: 1, description: 1, translations: 1 } },
  ).toArray();

  console.log(`   Total base items: ${allBase.length}`);

  // Filter to items missing French translation
  const untranslated = allBase.filter(item =>
    !item.translations || !(item.translations as Record<string, any>)[TARGET_LANGUAGE],
  );

  console.log(`   Already translated: ${allBase.length - untranslated.length}`);
  console.log(`   Need translation: ${untranslated.length}`);

  if (untranslated.length === 0) {
    console.log('\n   All items already have French translations.');
    await mongoose.disconnect();
    return;
  }

  if (DRY_RUN) {
    console.log(`\n   Would translate ${untranslated.length} items (dry run)`);
    await mongoose.disconnect();
    console.log(`\n✅ Migration 046 complete (dry run)\n`);
    return;
  }

  // Batch translate
  const itemsForTranslation = untranslated.map(item => ({
    id: item._id.toString(),
    name: item.name as string,
    category: (item.category as string) || undefined,
    description: (item.description as string) || undefined,
  }));

  console.log(`\n   Translating ${itemsForTranslation.length} items in batches of 50...`);

  const results = await batchTranslateItems(itemsForTranslation, TARGET_LANGUAGE, 50);

  console.log(`   LLM returned ${results.length} translations`);

  // Merge into items
  let updated = 0;
  for (const t of results) {
    const item = untranslated.find(i => i._id.toString() === t.id);
    if (!item) continue;

    const existing = (item.translations as Record<string, any>) || {};
    const merged = {
      ...existing,
      [TARGET_LANGUAGE]: {
        targetWord: t.targetWord,
        pronunciation: t.pronunciation,
        category: t.category,
      },
    };

    await Item.updateOne(
      { _id: item._id },
      { $set: { translations: merged, updatedAt: new Date() } },
    );
    updated++;
  }

  console.log(`   ✅ Updated ${updated} items with ${TARGET_LANGUAGE} translations`);

  // Summary
  const totalWithFrench = await Item.countDocuments({
    isBase: true,
    [`translations.${TARGET_LANGUAGE}`]: { $exists: true },
  });
  console.log(`\n   📊 Final state: ${totalWithFrench}/${allBase.length} base items have ${TARGET_LANGUAGE} translations`);

  await mongoose.disconnect();
  console.log(`\n✅ Migration 046 complete\n`);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
