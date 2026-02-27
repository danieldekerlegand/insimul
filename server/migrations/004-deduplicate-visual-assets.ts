#!/usr/bin/env tsx
/**
 * Migration: Deduplicate VisualAsset records
 *
 * The original seed migration (002) created a separate VisualAsset record for each
 * asset entry in each collection, even when the same polyhavenId was used across
 * multiple collections. This resulted in ~198 records instead of ~79 unique assets.
 *
 * This migration:
 * 1. Finds all VisualAsset records with a polyhavenId in their metadata
 * 2. Groups them by polyhavenId
 * 3. For each group with duplicates, picks one "survivor" (the earliest created)
 * 4. Updates all AssetCollection.assetIds arrays to reference the survivor
 * 5. Deletes the duplicate records
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/004-deduplicate-visual-assets.ts
 */

// CRITICAL: Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

import { storage } from '../db/storage.js';
import type { VisualAsset } from '@shared/schema';

export async function deduplicateVisualAssets() {
  console.log('🔧 Starting VisualAsset deduplication...\n');

  // 1. Fetch all visual assets
  const allAssets = await storage.getAllVisualAssets();
  console.log(`📊 Total VisualAsset records: ${allAssets.length}`);

  // 2. Group by polyhavenId
  const byPolyhavenId = new Map<string, typeof allAssets>();

  for (const asset of allAssets) {
    const polyhavenId = (asset.metadata as any)?.polyhavenId;
    if (!polyhavenId) continue;

    if (!byPolyhavenId.has(polyhavenId)) {
      byPolyhavenId.set(polyhavenId, []);
    }
    byPolyhavenId.get(polyhavenId)!.push(asset);
  }

  console.log(`🔑 Unique polyhavenIds found: ${byPolyhavenId.size}`);

  // 3. Identify duplicates
  let totalDuplicates = 0;
  const mergeMap = new Map<string, string>(); // oldId -> survivorId

  for (const [polyhavenId, assets] of Array.from(byPolyhavenId.entries())) {
    if (assets.length <= 1) continue;

    // Pick the earliest-created as the survivor
    const sorted = assets.sort((a: VisualAsset, b: VisualAsset) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });

    const survivor = sorted[0];
    const duplicates = sorted.slice(1);

    totalDuplicates += duplicates.length;

    for (const dup of duplicates) {
      mergeMap.set(dup.id, survivor.id);
    }

    console.log(`  ${polyhavenId}: keeping ${survivor.id.substring(0, 8)}..., removing ${duplicates.length} duplicate(s)`);
  }

  if (totalDuplicates === 0) {
    console.log('\n✅ No duplicates found. Database is already clean.');
    return;
  }

  console.log(`\n📋 Found ${totalDuplicates} duplicate records to merge`);

  // 4. Update all AssetCollection fields: assetIds, config3D model maps, and texture IDs
  const allCollections = await storage.getAllAssetCollections();
  let collectionsUpdated = 0;

  // Helper: remap IDs in a Record<string, string> (model maps like natureModels, objectModels, etc.)
  const remapRecord = (record: Record<string, string> | null | undefined): { updated: Record<string, string>; changed: boolean } => {
    if (!record || typeof record !== 'object') return { updated: record || {}, changed: false };
    let changed = false;
    const updated: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      const survivorId = mergeMap.get(value);
      if (survivorId) {
        updated[key] = survivorId;
        changed = true;
      } else {
        updated[key] = value;
      }
    }
    return { updated, changed };
  };

  // Helper: remap a single ID field (texture IDs)
  const remapId = (id: string | null | undefined): { updated: string | null; changed: boolean } => {
    if (!id) return { updated: id || null, changed: false };
    const survivorId = mergeMap.get(id);
    if (survivorId) return { updated: survivorId, changed: true };
    return { updated: id, changed: false };
  };

  for (const collection of allCollections) {
    const patch: Record<string, any> = {};
    let changed = false;

    // Remap assetIds array
    const assetIds = (collection.assetIds as string[]) || [];
    const updatedIds = assetIds.map(id => {
      const survivorId = mergeMap.get(id);
      if (survivorId) {
        changed = true;
        return survivorId;
      }
      return id;
    });
    const uniqueIds = Array.from(new Set(updatedIds));
    if (uniqueIds.length !== assetIds.length || changed) {
      patch.assetIds = uniqueIds;
      changed = true;
    }

    // Remap config3D Record fields
    const recordFields = ['buildingModels', 'natureModels', 'characterModels', 'objectModels', 'questObjectModels', 'playerModels', 'audioAssets'] as const;
    for (const field of recordFields) {
      const result = remapRecord((collection as any)[field]);
      if (result.changed) {
        patch[field] = result.updated;
        changed = true;
      }
    }

    // Remap texture ID fields
    const idFields = ['groundTextureId', 'roadTextureId', 'wallTextureId', 'roofTextureId'] as const;
    for (const field of idFields) {
      const result = remapId((collection as any)[field]);
      if (result.changed) {
        patch[field] = result.updated;
        changed = true;
      }
    }

    if (changed) {
      await storage.updateAssetCollection(collection.id, patch as any);
      collectionsUpdated++;
      const patchedFields = Object.keys(patch).join(', ');
      console.log(`  Updated collection "${collection.name}": patched [${patchedFields}]`);
    }
  }

  console.log(`\n📦 Updated ${collectionsUpdated} collection(s)`);

  // 5. Delete duplicate VisualAsset records
  let deletedCount = 0;
  let deleteErrors = 0;

  console.log(`  Attempting to delete ${mergeMap.size} duplicate records...`);

  for (const [dupId, survivorId] of Array.from(mergeMap.entries())) {
    try {
      const success = await storage.deleteVisualAsset(dupId);
      if (success) {
        deletedCount++;
      } else {
        deleteErrors++;
        console.error(`  ⚠️  deleteVisualAsset returned false for ${dupId} (survivor: ${survivorId.substring(0, 8)}...)`);
      }
    } catch (error: any) {
      deleteErrors++;
      console.error(`  ❌ Exception deleting ${dupId}: ${error.message}`);
    }
  }

  console.log(`\n🗑️  Deleted ${deletedCount} duplicate record(s)`);
  if (deleteErrors > 0) {
    console.log(`⚠️  ${deleteErrors} deletion(s) failed`);
  }

  // 6. Verify
  const remainingAssets = await storage.getAllVisualAssets();
  const remainingPolyhaven = remainingAssets.filter(a => (a.metadata as any)?.polyhavenId);
  const remainingUniqueIds = new Set(remainingPolyhaven.map(a => (a.metadata as any).polyhavenId));

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Deduplication complete!`);
  console.log(`   Before: ${allAssets.length} total records`);
  console.log(`   After:  ${remainingAssets.length} total records`);
  console.log(`   Unique polyhavenIds: ${remainingUniqueIds.size}`);
  console.log(`${'='.repeat(50)}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deduplicateVisualAssets()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}
