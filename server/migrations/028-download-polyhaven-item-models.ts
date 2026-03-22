#!/usr/bin/env tsx
/**
 * Migration 028: Download Polyhaven models for unmapped item roles
 *
 * Downloads ~31 new models from Polyhaven and registers them as visual assets,
 * then maps all ~41 roles (including 10 already on disk) to the appropriate
 * base asset collections via objectModels.
 *
 * Usage:
 *   npx tsx server/migrations/028-download-polyhaven-item-models.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

// ─── Role → Polyhaven model mappings ─────────────────────────────────────────

interface RoleMapping {
  role: string;
  polyhavenId: string;
  collection: 'props' | 'furniture' | 'weapons';
  assetType: string;
  tags: string[];
}

const ROLE_MAPPINGS: RoleMapping[] = [
  // Weapons
  { role: 'dagger', polyhavenId: 'ornate_medieval_dagger', collection: 'weapons', assetType: 'model_prop', tags: ['weapon', 'dagger', 'medieval'] },
  { role: 'mace', polyhavenId: 'ornate_medieval_mace', collection: 'weapons', assetType: 'model_prop', tags: ['weapon', 'mace', 'medieval'] },
  { role: 'shield', polyhavenId: 'kite_shield', collection: 'weapons', assetType: 'model_prop', tags: ['armor', 'shield', 'medieval'] },
  { role: 'sword', polyhavenId: 'antique_estoc', collection: 'weapons', assetType: 'model_prop', tags: ['weapon', 'sword'] },
  { role: 'knife', polyhavenId: 'machete', collection: 'weapons', assetType: 'model_prop', tags: ['weapon', 'knife', 'blade'] },
  { role: 'pistol', polyhavenId: 'service_pistol', collection: 'weapons', assetType: 'model_prop', tags: ['weapon', 'pistol', 'firearm'] },
  { role: 'hammer', polyhavenId: 'wooden_hammer_01', collection: 'weapons', assetType: 'model_prop', tags: ['tool', 'hammer'] },
  { role: 'pickaxe', polyhavenId: 'picke_dirty_01', collection: 'weapons', assetType: 'model_prop', tags: ['tool', 'pickaxe', 'mining'] },
  { role: 'saw', polyhavenId: 'handsaw_wood', collection: 'weapons', assetType: 'model_prop', tags: ['tool', 'saw'] },
  { role: 'shovel', polyhavenId: 'rusted_spade_01', collection: 'weapons', assetType: 'model_prop', tags: ['tool', 'shovel', 'spade'] },
  { role: 'staff', polyhavenId: 'baseball_bat', collection: 'weapons', assetType: 'model_prop', tags: ['weapon', 'staff', 'club'] },
  { role: 'blowtorch', polyhavenId: 'brass_blowtorch', collection: 'weapons', assetType: 'model_prop', tags: ['tool', 'blowtorch'] },
  { role: 'small_tool', polyhavenId: 'flathead_screwdriver', collection: 'weapons', assetType: 'model_prop', tags: ['tool', 'screwdriver'] },

  // Props
  { role: 'bottle', polyhavenId: 'wine_bottles_01', collection: 'props', assetType: 'model_prop', tags: ['container', 'bottle', 'wine'] },
  { role: 'can', polyhavenId: 'can_rusted', collection: 'props', assetType: 'model_prop', tags: ['container', 'can'] },
  { role: 'candle', polyhavenId: 'wooden_candlestick', collection: 'props', assetType: 'model_prop', tags: ['light', 'candle'] },
  { role: 'food_bowl', polyhavenId: 'wooden_bowl_01', collection: 'props', assetType: 'model_prop', tags: ['food', 'bowl'] },
  { role: 'food_loaf', polyhavenId: 'croissant', collection: 'props', assetType: 'model_prop', tags: ['food', 'bread', 'loaf'] },
  { role: 'food_plate', polyhavenId: 'carved_wooden_plate', collection: 'props', assetType: 'model_prop', tags: ['food', 'plate'] },
  { role: 'food_small', polyhavenId: 'food_apple_01', collection: 'props', assetType: 'model_prop', tags: ['food', 'fruit', 'apple'] },
  { role: 'food_wedge', polyhavenId: 'carrot_cake', collection: 'props', assetType: 'model_prop', tags: ['food', 'cake', 'wedge'] },
  { role: 'herb', polyhavenId: 'celandine_01', collection: 'props', assetType: 'model_prop', tags: ['nature', 'herb', 'plant'] },
  { role: 'jar', polyhavenId: 'jug_01', collection: 'props', assetType: 'model_prop', tags: ['container', 'jar', 'jug'] },
  { role: 'mortar', polyhavenId: 'pot_enamel_01', collection: 'props', assetType: 'model_prop', tags: ['tool', 'mortar', 'pot'] },
  { role: 'pan', polyhavenId: 'brass_pan_01', collection: 'props', assetType: 'model_prop', tags: ['tool', 'pan', 'cooking'] },
  { role: 'pot', polyhavenId: 'brass_pot_01', collection: 'props', assetType: 'model_prop', tags: ['tool', 'pot', 'cooking'] },
  { role: 'pouch', polyhavenId: 'wicker_basket_01', collection: 'props', assetType: 'model_prop', tags: ['container', 'basket', 'pouch'] },
  { role: 'rope', polyhavenId: 'garden_hose_wall_mounted_01', collection: 'props', assetType: 'model_prop', tags: ['tool', 'rope', 'coil'] },
  { role: 'sack', polyhavenId: 'compost_bag_02', collection: 'props', assetType: 'model_prop', tags: ['container', 'sack', 'bag'] },
  { role: 'scroll', polyhavenId: 'postcard_set_01', collection: 'props', assetType: 'model_prop', tags: ['paper', 'scroll', 'document'] },
  { role: 'small_box', polyhavenId: 'cardboard_box_01', collection: 'props', assetType: 'model_prop', tags: ['container', 'box'] },
  { role: 'small_prop', polyhavenId: 'vintage_lighter', collection: 'props', assetType: 'model_prop', tags: ['prop', 'lighter', 'small'] },
  { role: 'stone', polyhavenId: 'stone_01', collection: 'props', assetType: 'model_prop', tags: ['nature', 'stone', 'rock'] },
  { role: 'tank', polyhavenId: 'propane_tank', collection: 'props', assetType: 'model_prop', tags: ['container', 'tank', 'propane'] },
  { role: 'toolbox', polyhavenId: 'metal_tool_chest', collection: 'props', assetType: 'model_prop', tags: ['container', 'toolbox'] },
  { role: 'vase', polyhavenId: 'brass_vase_01', collection: 'props', assetType: 'model_prop', tags: ['decoration', 'vase'] },
  { role: 'wire_coil', polyhavenId: 'modular_electric_cables', collection: 'props', assetType: 'model_prop', tags: ['material', 'wire', 'cable'] },
  { role: 'wood', polyhavenId: 'bark_debris_01', collection: 'props', assetType: 'model_prop', tags: ['nature', 'wood', 'bark'] },
  { role: 'torch', polyhavenId: 'Lantern_01', collection: 'props', assetType: 'model_prop', tags: ['light', 'torch', 'lantern'] },

  // Furniture
  { role: 'commode', polyhavenId: 'GothicCommode_01', collection: 'furniture', assetType: 'model_prop', tags: ['furniture', 'commode'] },
  { role: 'drawer', polyhavenId: 'vintage_wooden_drawer_01', collection: 'furniture', assetType: 'model_prop', tags: ['furniture', 'drawer'] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PROPS_DIR = path.resolve(__dirname, '../../client/public/assets/models/props/polyhaven');
const FURNITURE_DIR = path.resolve(__dirname, '../../client/public/assets/models/furniture/polyhaven');
const NATURE_DIR = path.resolve(__dirname, '../../client/public/assets/models/nature/polyhaven');

function getLocalDir(polyhavenId: string): string {
  // Check all possible directories
  for (const dir of [PROPS_DIR, FURNITURE_DIR, NATURE_DIR]) {
    const fullPath = path.join(dir, polyhavenId);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return path.join(PROPS_DIR, polyhavenId);
}

function findGltfFile(dir: string): string | null {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const gltf = files.find(f => f.endsWith('.gltf') || f.endsWith('.glb'));
  return gltf ? path.join(dir, gltf) : null;
}

/** Build a lookup of polyhavenId → existing asset from DB */
async function buildExistingAssetMap(): Promise<Map<string, { id: string; filePath: string }>> {
  const allAssets = await storage.getAllVisualAssets();
  const map = new Map<string, { id: string; filePath: string }>();
  for (const a of allAssets) {
    if (a.filePath) {
      const parts = a.filePath.split('/');
      if (parts.length >= 2) {
        const folderName = parts[parts.length - 2];
        map.set(folderName, { id: a.id, filePath: a.filePath });
      }
    }
    if (a.name) {
      // Also match by first part of name (before parenthetical)
      const baseName = a.name.split(' (')[0].trim();
      if (!map.has(baseName)) {
        map.set(baseName, { id: a.id, filePath: a.filePath || '' });
      }
    }
  }
  return map;
}

// ─── Download function ──────────────────────────────────────────────────────

async function downloadPolyhaven(polyhavenId: string, assetType: string, tags: string[]): Promise<{ id: string; filePath: string } | null> {
  try {
    // Dynamically import the polyhaven API and downloader
    const { getPolyhavenModelUrl } = await import('../services/polyhaven-api.js');
    const { preprocessPolyhavenAsset } = await import('../services/asset-downloader.js');

    console.log(`    Fetching model URL for ${polyhavenId}...`);
    const modelInfo = await getPolyhavenModelUrl(polyhavenId, '1k');

    console.log(`    Downloading from ${modelInfo.url.substring(0, 80)}...`);
    const downloadResult = await preprocessPolyhavenAsset(
      modelInfo.url,
      assetType,
      polyhavenId,
      modelInfo.companionFiles
    );

    // Create visual asset record
    const asset = await storage.createVisualAsset({
      worldId: null,
      name: `${polyhavenId} (${tags[0] || 'prop'})`,
      description: `Polyhaven asset: ${polyhavenId}`,
      assetType,
      filePath: downloadResult.localPath,
      fileName: downloadResult.localPath.split('/').pop() || `${polyhavenId}.glb`,
      fileSize: downloadResult.metadata.fileSize,
      mimeType: 'model/gltf-binary',
      generationProvider: 'manual',
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['polyhaven', 'model', ...tags],
      metadata: {
        polyhavenId,
        resolution: modelInfo.resolution,
      },
    });

    console.log(`    Registered: ${asset.id}`);
    return { id: asset.id, filePath: downloadResult.localPath };
  } catch (error: any) {
    console.error(`    FAILED to download ${polyhavenId}: ${error.message}`);
    return null;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 028: Download Polyhaven Item Models');
  console.log('='.repeat(60) + '\n');

  // Step 1: Build existing asset map
  console.log('Loading existing visual assets...');
  const existingMap = await buildExistingAssetMap();
  console.log(`  ${existingMap.size} assets indexed\n`);

  // Step 2: Get base collections
  const allCollections = await storage.getAllAssetCollections();
  const collectionMap: Record<string, any> = {};
  for (const c of allCollections) {
    if (c.name === 'Base Props & Objects') collectionMap['props'] = c;
    if (c.name === 'Base Furniture') collectionMap['furniture'] = c;
    if (c.name === 'Base Weapons & Tools') collectionMap['weapons'] = c;
  }

  if (!collectionMap['props'] || !collectionMap['furniture'] || !collectionMap['weapons']) {
    console.error('ERROR: Base collections not found. Run migration 027 first.');
    process.exit(1);
  }

  // Step 3: Process each mapping
  let downloaded = 0;
  let reused = 0;
  let failed = 0;
  let mapped = 0;

  // Track updates per collection
  const collectionUpdates: Record<string, { objectModels: Record<string, string>; assetIds: string[] }> = {
    props: { objectModels: {}, assetIds: [] },
    furniture: { objectModels: {}, assetIds: [] },
    weapons: { objectModels: {}, assetIds: [] },
  };

  for (const mapping of ROLE_MAPPINGS) {
    console.log(`[${mapping.role}] -> ${mapping.polyhavenId}`);

    // Check if already mapped in the collection
    const col = collectionMap[mapping.collection];
    if (col.objectModels && col.objectModels[mapping.role]) {
      console.log(`  Already mapped, skipping.\n`);
      mapped++;
      continue;
    }

    // Check if asset exists in DB
    let assetInfo = existingMap.get(mapping.polyhavenId);

    if (assetInfo) {
      console.log(`  Found existing asset: ${assetInfo.id}`);
      reused++;
    } else {
      // Check if on disk but not in DB
      const localDir = getLocalDir(mapping.polyhavenId);
      const gltfFile = findGltfFile(localDir);

      if (gltfFile) {
        console.log(`  Found on disk but not in DB, registering...`);
        const relativePath = gltfFile.replace(path.resolve(__dirname, '../../client/public/') + '/', '');
        const stat = fs.statSync(gltfFile);
        const asset = await storage.createVisualAsset({
          worldId: null,
          name: `${mapping.polyhavenId} (${mapping.tags[0] || 'prop'})`,
          description: `Polyhaven asset: ${mapping.polyhavenId}`,
          assetType: mapping.assetType,
          filePath: relativePath,
          fileName: path.basename(gltfFile),
          fileSize: stat.size,
          mimeType: gltfFile.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json',
          generationProvider: 'manual',
          purpose: 'procedural',
          usageContext: '3d_game',
          tags: ['polyhaven', 'model', ...mapping.tags],
          metadata: { polyhavenId: mapping.polyhavenId },
        });
        assetInfo = { id: asset.id, filePath: relativePath };
        console.log(`  Registered: ${asset.id}`);
        reused++;
      } else {
        // Need to download
        console.log(`  Downloading from Polyhaven...`);
        assetInfo = await downloadPolyhaven(mapping.polyhavenId, mapping.assetType, mapping.tags);
        if (assetInfo) {
          downloaded++;
        } else {
          failed++;
          console.log('');
          continue;
        }
      }
    }

    // Queue the mapping update
    collectionUpdates[mapping.collection].objectModels[mapping.role] = assetInfo.id;
    collectionUpdates[mapping.collection].assetIds.push(assetInfo.id);
    mapped++;
    console.log('');
  }

  // Step 4: Apply collection updates
  console.log('Applying collection updates...');
  for (const [colKey, updates] of Object.entries(collectionUpdates)) {
    const col = collectionMap[colKey];
    if (Object.keys(updates.objectModels).length === 0) continue;

    const mergedModels = { ...(col.objectModels || {}), ...updates.objectModels };
    const mergedAssetIds = [...new Set([...(col.assetIds || []), ...updates.assetIds])];

    await storage.updateAssetCollection(col.id, {
      objectModels: mergedModels,
      assetIds: mergedAssetIds,
    } as any);

    console.log(`  ${col.name}: +${Object.keys(updates.objectModels).length} roles (${Object.keys(mergedModels).length} total)`);
  }

  // Step 5: Summary
  console.log('\n' + '='.repeat(60));
  console.log(`  Migration complete!`);
  console.log(`  Downloaded: ${downloaded} | Reused: ${reused} | Failed: ${failed} | Mapped: ${mapped}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
