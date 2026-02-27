#!/usr/bin/env tsx
/**
 * Utility script to delete all base asset collections and their associated VisualAssets
 * so the seed migration can recreate them with updated config3D mappings.
 *
 * Usage: npx tsx server/migrations/delete-base-collections.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { storage } from '../db/storage.js';

async function deleteBaseCollections() {
  console.log('🗑️  Deleting existing base asset collections...\n');

  const allCollections = await storage.getAllAssetCollections();
  const baseCollections = allCollections.filter(c => c.isBase === true);

  console.log(`Found ${baseCollections.length} base collections to delete.\n`);

  let deletedCollections = 0;
  let deletedAssets = 0;

  for (const collection of baseCollections) {
    console.log(`Deleting: ${collection.name} (${collection.worldType})`);

    // Delete associated VisualAssets
    const assetIds = (collection.assetIds as string[]) || [];
    for (const assetId of assetIds) {
      try {
        await storage.deleteVisualAsset(assetId);
        deletedAssets++;
      } catch (err) {
        // Asset may already be deleted or shared
      }
    }

    // Delete the collection itself
    await storage.deleteAssetCollection(collection.id);
    deletedCollections++;
    console.log(`  ✅ Deleted collection + ${assetIds.length} assets`);
  }

  console.log(`\n🎉 Done! Deleted ${deletedCollections} collections and ${deletedAssets} assets.`);
}

deleteBaseCollections()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });
