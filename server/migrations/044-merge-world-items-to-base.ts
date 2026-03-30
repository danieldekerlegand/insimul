#!/usr/bin/env tsx
/**
 * Migration 044: Merge world items into base items + rename field
 *
 * Two operations:
 *   1. Rename `languageLearningData` → `translations` on ALL items, converting
 *      from the old format `{ targetWord, targetLanguage, pronunciation, category }`
 *      to the new dict format `{ [language]: { targetWord, pronunciation, category } }`.
 *   2. Copy translations from world items → matching base items, then delete
 *      world items for world 69c7f646ffaa372a57a04123 (1929 items, all duplicates
 *      of base items; 643 have French translations that base items lack).
 *
 * Idempotent — safe to run multiple times.
 *
 * Usage:
 *   npx tsx server/migrations/044-merge-world-items-to-base.ts
 *   npx tsx server/migrations/044-merge-world-items-to-base.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';

const WORLD_ID = '69c7f646ffaa372a57a04123';
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Convert old `languageLearningData` format to new `translations` dict.
 * Old: { targetWord, targetLanguage, pronunciation, category }
 * New: { [targetLanguage]: { targetWord, pronunciation, category } }
 */
function convertLLDToTranslations(
  lld: any,
): Record<string, { targetWord: string; pronunciation: string; category: string }> | null {
  if (!lld) return null;

  // Already in new dict format (no targetLanguage key at top level)
  if (typeof lld === 'object' && !lld.targetLanguage && !lld.targetWord) {
    return lld;
  }

  // Old format: { targetWord, targetLanguage, pronunciation, category }
  if (lld.targetLanguage && lld.targetWord) {
    return {
      [lld.targetLanguage]: {
        targetWord: lld.targetWord,
        pronunciation: lld.pronunciation || '',
        category: lld.category || 'general',
      },
    };
  }

  return null;
}

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('MONGO_URL not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  const Item = mongoose.connection.collection('items');

  console.log(`\n📦 Migration 044: Merge world items → base items${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // ── Step 1: Rename languageLearningData → translations on ALL items ─────
  console.log('   Step 1: Rename languageLearningData → translations');

  const itemsWithOldField = await Item.countDocuments({ languageLearningData: { $exists: true } });
  console.log(`   Found ${itemsWithOldField} items with old languageLearningData field`);

  if (itemsWithOldField > 0 && !DRY_RUN) {
    // For each item with the old field, convert and rename
    const cursor = Item.find({ languageLearningData: { $exists: true } });
    let renamed = 0;
    for await (const doc of cursor) {
      const converted = convertLLDToTranslations(doc.languageLearningData);
      await Item.updateOne(
        { _id: doc._id },
        {
          $set: { translations: converted, updatedAt: new Date() },
          $unset: { languageLearningData: '' },
        },
      );
      renamed++;
    }
    console.log(`   ✅ Renamed & converted ${renamed} items`);
  } else if (itemsWithOldField > 0) {
    console.log(`   Would rename ${itemsWithOldField} items (dry run)`);
  } else {
    console.log(`   ⏭️  No items with old field name (already migrated)`);
  }

  // ── Step 2: Copy translations from world items → base items ────────────
  console.log('\n   Step 2: Copy translations from world items → base items');

  const worldItemsWithTranslations = await Item.find(
    { worldId: WORLD_ID, translations: { $ne: null } },
    { projection: { name: 1, translations: 1 } },
  ).toArray();

  console.log(`   Found ${worldItemsWithTranslations.length} world items with translations`);

  const translationsByName = new Map<string, any>();
  for (const item of worldItemsWithTranslations) {
    if (!translationsByName.has(item.name)) {
      translationsByName.set(item.name, item.translations);
    }
  }

  console.log(`   ${translationsByName.size} unique names with translations to transfer`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [name, translations] of translationsByName) {
    const baseItem = await Item.findOne({ isBase: true, name });
    if (!baseItem) {
      notFound++;
      continue;
    }

    // Skip if base item already has translations
    if (baseItem.translations && Object.keys(baseItem.translations).length > 0) {
      skipped++;
      continue;
    }

    if (!DRY_RUN) {
      await Item.updateOne(
        { _id: baseItem._id },
        { $set: { translations, updatedAt: new Date() } },
      );
    }
    updated++;
  }

  console.log(`   ✅ Updated ${updated} base items with translations`);
  if (skipped > 0) console.log(`   ⏭️  Skipped ${skipped} base items (already had translations)`);
  if (notFound > 0) console.log(`   ⚠️  ${notFound} world item names had no matching base item`);

  // ── Step 3: Delete world items ─────────────────────────────────────────
  const totalWorldItems = await Item.countDocuments({ worldId: WORLD_ID });
  console.log(`\n   Step 3: ${DRY_RUN ? 'Would delete' : 'Deleting'} ${totalWorldItems} world items for world ${WORLD_ID}`);

  if (!DRY_RUN && totalWorldItems > 0) {
    const result = await Item.deleteMany({ worldId: WORLD_ID });
    console.log(`   ✅ Deleted ${result.deletedCount} world items`);
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const remainingBase = await Item.countDocuments({ isBase: true });
  const remainingBaseWithTranslations = await Item.countDocuments({
    isBase: true,
    translations: { $ne: null },
  });
  console.log(`\n   📊 Final state: ${remainingBase} base items (${remainingBaseWithTranslations} with translations)`);

  await mongoose.disconnect();
  console.log(`\n✅ Migration 044 complete${DRY_RUN ? ' (dry run — no changes made)' : ''}\n`);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
