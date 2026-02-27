#!/usr/bin/env tsx
/**
 * Migration: Patch Generic Collection with missing assets
 *
 * The Generic Default Collection was seeded with only 2 nature models (tree, rock)
 * and 3 object models (storage, lamp, prop). This patch adds:
 * - Nature: shrub, bush, rock_large, tree_dead
 * - Objects: storage_alt, furniture_stool, furniture_table, decoration, lamp_table
 *
 * All referenced Polyhaven assets are already downloaded on disk.
 * This script creates VisualAsset records pointing to the existing files,
 * appends them to the collection's assetIds, and updates config3D fields.
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/005-patch-generic-collection.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

import { storage } from '../db/storage.js';

interface AssetToAdd {
  polyhavenId: string;
  semanticRole: string;
  assetType: string;
  category: 'nature' | 'objects';
  configField: 'natureModels' | 'objectModels';
  description: string;
}

const ASSETS_TO_ADD: AssetToAdd[] = [
  // Nature models
  { polyhavenId: 'shrub_02', semanticRole: 'shrub', assetType: 'model_prop', category: 'nature', configField: 'natureModels', description: 'Generic shrub' },
  { polyhavenId: 'fern_02', semanticRole: 'bush', assetType: 'model_prop', category: 'nature', configField: 'natureModels', description: 'Generic fern bush' },
  { polyhavenId: 'rock_moss_set_01', semanticRole: 'rock_large', assetType: 'model_prop', category: 'nature', configField: 'natureModels', description: 'Mossy rock set' },
  { polyhavenId: 'dead_tree_trunk', semanticRole: 'tree_dead', assetType: 'model_tree', category: 'nature', configField: 'natureModels', description: 'Dead tree trunk' },
  // Object models
  { polyhavenId: 'wine_barrel_01', semanticRole: 'storage_alt', assetType: 'model_prop', category: 'objects', configField: 'objectModels', description: 'Wine barrel for storage' },
  { polyhavenId: 'wooden_stool_01', semanticRole: 'furniture_stool', assetType: 'model_prop', category: 'objects', configField: 'objectModels', description: 'Wooden stool' },
  { polyhavenId: 'wooden_table_02', semanticRole: 'furniture_table', assetType: 'model_prop', category: 'objects', configField: 'objectModels', description: 'Wooden table' },
  { polyhavenId: 'stone_fire_pit', semanticRole: 'decoration', assetType: 'model_prop', category: 'objects', configField: 'objectModels', description: 'Stone fire pit decoration' },
  { polyhavenId: 'street_lamp_01', semanticRole: 'lamp_table', assetType: 'model_prop', category: 'objects', configField: 'objectModels', description: 'Street lamp' },
];

async function patchGenericCollection() {
  console.log('🔧 Patching Generic Default Collection...\n');

  // 1. Find the generic base collection
  const allCollections = await storage.getAllAssetCollections();
  const generic = allCollections.find(c => c.worldType === 'generic' && (c as any).isBase === true);

  if (!generic) {
    console.error('❌ Generic base collection not found!');
    return;
  }

  console.log(`Found collection: "${generic.name}" (${generic.id})`);
  console.log(`Current assetIds: ${((generic.assetIds as string[]) || []).length}`);

  // 2. Check which polyhavenIds already have VisualAsset records (from deduplication)
  const allAssets = await storage.getAllVisualAssets();
  const existingByPolyhaven = new Map<string, string>(); // polyhavenId -> assetId
  for (const asset of allAssets) {
    const phId = (asset.metadata as any)?.polyhavenId;
    if (phId) existingByPolyhaven.set(phId, asset.id);
  }

  // 3. For each asset to add, reuse existing or create new VisualAsset record
  const newAssetIds: string[] = [];
  const natureModelUpdates: Record<string, string> = {};
  const objectModelUpdates: Record<string, string> = {};
  const projectRoot = path.resolve(__dirname, '../..');

  for (const assetDef of ASSETS_TO_ADD) {
    const existing = existingByPolyhaven.get(assetDef.polyhavenId);

    if (existing) {
      console.log(`  ♻️  ${assetDef.polyhavenId} (${assetDef.semanticRole}) -> reusing ${existing.substring(0, 8)}...`);
      newAssetIds.push(existing);

      if (assetDef.configField === 'natureModels') {
        natureModelUpdates[assetDef.semanticRole] = existing;
      } else {
        objectModelUpdates[assetDef.semanticRole] = existing;
      }
      continue;
    }

    // Verify file exists on disk
    const localPath = `assets/polyhaven/models/${assetDef.polyhavenId}.gltf`;
    const fullPath = path.join(projectRoot, 'client/public', localPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`  ⚠️  ${assetDef.polyhavenId}: file not found at ${fullPath}, skipping`);
      continue;
    }

    // Create new VisualAsset record
    const visualAsset = await storage.createVisualAsset({
      name: `${assetDef.polyhavenId} (${assetDef.semanticRole})`,
      description: assetDef.description,
      assetType: assetDef.assetType as any,
      filePath: localPath,
      fileName: `${assetDef.polyhavenId}.gltf`,
      generationProvider: 'polyhaven' as any,
      generationPrompt: assetDef.polyhavenId,
      purpose: 'base-collection',
      tags: ['base', 'generic', assetDef.category, assetDef.semanticRole],
      status: 'completed',
      metadata: {
        polyhavenId: assetDef.polyhavenId,
        semanticRole: assetDef.semanticRole,
        priority: 2,
      },
    });

    console.log(`  ✅ ${assetDef.polyhavenId} (${assetDef.semanticRole}) -> created ${visualAsset.id.substring(0, 8)}...`);
    newAssetIds.push(visualAsset.id);

    if (assetDef.configField === 'natureModels') {
      natureModelUpdates[assetDef.semanticRole] = visualAsset.id;
    } else {
      objectModelUpdates[assetDef.semanticRole] = visualAsset.id;
    }
  }

  // 4. Update the collection: append new assetIds and merge config3D fields
  const currentAssetIds = (generic.assetIds as string[]) || [];
  const mergedAssetIds = Array.from(new Set([...currentAssetIds, ...newAssetIds]));

  const currentNatureModels = (generic as any).natureModels as Record<string, string> || {};
  const currentObjectModels = (generic as any).objectModels as Record<string, string> || {};

  const patch: Record<string, any> = {
    assetIds: mergedAssetIds,
    natureModels: { ...currentNatureModels, ...natureModelUpdates },
    objectModels: { ...currentObjectModels, ...objectModelUpdates },
  };

  await storage.updateAssetCollection(generic.id, patch as any);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Generic collection patched!`);
  console.log(`   assetIds: ${currentAssetIds.length} -> ${mergedAssetIds.length}`);
  console.log(`   natureModels: ${Object.keys(currentNatureModels).length} -> ${Object.keys(patch.natureModels).length} keys`);
  console.log(`   objectModels: ${Object.keys(currentObjectModels).length} -> ${Object.keys(patch.objectModels).length} keys`);
  console.log(`${'='.repeat(50)}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  patchGenericCollection()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}
