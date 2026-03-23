#!/usr/bin/env tsx
/**
 * Migration 035: Regenerate base items from visual assets
 *
 * Replaces the existing 270 hand-authored base items with items derived
 * directly from visual assets. This guarantees every base item has a
 * working 3D model.
 *
 * Usage:
 *   npx tsx server/migrations/035-regenerate-base-items-from-assets.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { mapAssetToBaseItem } from '../services/asset-item-mapper.js';

export async function migrate() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) throw new Error('No MongoDB URI found');

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db!;

  console.log('[Migration 035] Regenerating base items from visual assets...');

  // 1. Query all prop visual assets
  const assets = await db.collection('visualassets').find({
    assetType: { $in: ['model_prop', 'model_quest_item'] }
  }).toArray();

  console.log(`  Found ${assets.length} prop/quest visual assets`);

  // 2. Map assets to items
  const newItems: any[] = [];
  let skipped = 0;
  const byCat: Record<string, number> = {};

  for (const asset of assets) {
    const item = mapAssetToBaseItem(asset as any);
    if (item) {
      newItems.push({
        ...item,
        worldId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      byCat[item.category] = (byCat[item.category] || 0) + 1;
    } else {
      skipped++;
    }
  }

  console.log(`  Mapped ${newItems.length} items, skipped ${skipped} assets`);
  console.log('  By category:');
  Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`    ${cat}: ${count}`);
  });

  // 3. Delete existing base items
  const deleteResult = await db.collection('items').deleteMany({ isBase: true });
  console.log(`  Deleted ${deleteResult.deletedCount} existing base items`);

  // 4. Insert new items
  if (newItems.length > 0) {
    const insertResult = await db.collection('items').insertMany(newItems);
    console.log(`  Inserted ${insertResult.insertedCount} new base items`);
  }

  // 5. Summary
  const totalItems = await db.collection('items').countDocuments();
  const totalBase = await db.collection('items').countDocuments({ isBase: true });
  console.log(`  Total items in DB: ${totalItems} (${totalBase} base)`);

  await mongoose.disconnect();
  console.log('[Migration 035] Done.');
}

// Run directly
migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
