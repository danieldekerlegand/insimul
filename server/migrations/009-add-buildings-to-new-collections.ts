#!/usr/bin/env tsx
/**
 * Migration: Copy building models to newly seeded collections
 *
 * Migration 007 only assigned Sketchfab building models to 7 world types.
 * This migration copies those same building model assignments to the new
 * collections seeded in 002, where medieval-style buildings are thematically
 * appropriate.
 *
 * Does NOT re-download anything — reads existing VisualAsset IDs from the DB.
 *
 * Usage:
 *   npx tsx server/migrations/009-add-buildings-to-new-collections.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

// World types that should receive the same medieval/historical building set.
// Excludes: wild-west, tropical-pirate, cyberpunk, sci-fi-space, post-apocalyptic,
// dieselpunk, solarpunk, superhero, modern-realistic (buildings would be wrong theme).
const TARGET_WORLD_TYPES = [
  'historical-ancient',
  'historical-renaissance',
  'historical-victorian',
  'horror',
  'urban-fantasy',
  'steampunk',         // Victorian-ish overlap; also was missed by migration 007
  'wild-west',         // Frontier buildings are rougher but better than none
  'tropical-pirate',   // Colonial-era overlap
];

async function run() {
  console.log('Building models: copying to new collections...\n');

  const allCollections = await storage.getAllAssetCollections();

  // Find the source collection — medieval-fantasy has the most complete building set
  const source = allCollections.find(
    c => c.worldType === 'medieval-fantasy' && (c as any).isBase === true
  );

  if (!source) {
    console.error('Source collection (medieval-fantasy isBase) not found. Run migration 007 first.');
    process.exit(1);
  }

  const sourceBuildingModels = (source as any).buildingModels as Record<string, string> || {};
  const buildingAssetIds = Object.values(sourceBuildingModels);

  if (buildingAssetIds.length === 0) {
    console.error('Source collection has no building models. Run migration 007 first.');
    process.exit(1);
  }

  console.log(`Source: "${source.name}" — ${buildingAssetIds.length} building roles\n`);
  for (const [role, id] of Object.entries(sourceBuildingModels)) {
    console.log(`  ${role}: ${id.substring(0, 12)}...`);
  }
  console.log();

  let updatedCount = 0;
  let skippedCount = 0;

  for (const wt of TARGET_WORLD_TYPES) {
    const collection = allCollections.find(
      c => c.worldType === wt && (c as any).isBase === true
    );

    if (!collection) {
      console.log(`  [skip] No isBase collection found for worldType: ${wt}`);
      skippedCount++;
      continue;
    }

    const existingBuildings = (collection as any).buildingModels as Record<string, string> || {};
    if (Object.keys(existingBuildings).length > 0) {
      console.log(`  [skip] "${collection.name}" already has ${Object.keys(existingBuildings).length} building models`);
      skippedCount++;
      continue;
    }

    const existingAssetIds: string[] = (collection.assetIds as string[]) || [];
    const mergedAssetIds = [...existingAssetIds];
    for (const id of buildingAssetIds) {
      if (!mergedAssetIds.includes(id)) mergedAssetIds.push(id);
    }

    try {
      await storage.updateAssetCollection(collection.id, {
        buildingModels: sourceBuildingModels,
        assetIds: mergedAssetIds,
      } as any);
      updatedCount++;
      console.log(`  [updated] "${collection.name}" (${wt})`);
    } catch (err: any) {
      console.error(`  [error] Failed to update "${collection.name}": ${err.message}`);
    }
  }

  console.log(`\nDone. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
