/**
 * Migration: Populate natureConfig and itemConfig with actual asset IDs
 *
 * The previous populate migration created config entries with `{ mode: 'asset' }`
 * but no `assetId`, so nothing actually rendered. This migration:
 *   1. Builds a polyhavenId → VisualAsset ID lookup from existing DB assets
 *   2. For assets on disk but not yet in the DB, creates VisualAsset records
 *   3. Updates every asset collection's worldTypeConfig.natureConfig and
 *      worldTypeConfig.itemConfig with real assetId references
 *
 * Uses the same default set of models for all collections — they can be
 * manually customized per-collection afterward.
 *
 * Non-destructive: preserves existing assetId values; only fills in missing ones.
 *
 * Usage:
 *   npx tsx server/db/migrations/populate-nature-and-item-assets.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import mongoose, { Schema } from 'mongoose';
import { storage } from '../storage.js';

const AssetCollectionModel = mongoose.models.AssetCollection ||
  mongoose.model('AssetCollection', new Schema({}, { strict: false }), 'assetcollections');

// ─── Asset directories ──────────────────────────────────────────────────────

const CLIENT_PUBLIC = path.resolve(__dirname, '../../../client/public');
const NATURE_DIR = path.join(CLIENT_PUBLIC, 'assets/models/nature/polyhaven');
const PROPS_DIR = path.join(CLIENT_PUBLIC, 'assets/models/props/polyhaven');
const FURNITURE_DIR = path.join(CLIENT_PUBLIC, 'assets/models/furniture/polyhaven');

// ─── Default nature mappings (config key → polyhavenId) ─────────────────────

const NATURE_DEFAULTS: Record<string, Record<string, string>> = {
  trees: {
    oak: 'tree_small_02',
    pine: 'pine_tree_01',
    birch: 'tree_small_02',      // reuse oak model as placeholder
    willow: 'jacaranda_tree',
    palm: 'jacaranda_tree',
    maple: 'tree_small_02',      // reuse
    cypress: 'fir_tree_01',
    dead_tree: 'dead_tree_trunk',
  },
  vegetation: {
    grass_patch: 'shrub_03',
    bush: 'shrub_02',
    shrub: 'shrub_01',
    flower_bed: 'crystalline_iceplant',
    fern: 'fern_02',
    ivy: 'moss_01',
    tall_grass: 'shrub_03',
    moss: 'moss_01',
  },
  water: {
    fountain: 'potted_plant_02',  // closest available decorative piece
    pond: 'rock_moss_set_02',     // mossy rocks suggest water presence
    stream: 'rock_moss_set_01',
    well: 'wooden_bucket_01',
    puddle: 'rock_moss_set_02',
  },
  rocks: {
    boulder: 'boulder_01',
    rock: 'rock_07',
    pebbles: 'moon_rock_01',
    cliff_face: 'boulder_01',
    stone_pile: 'rock_moss_set_01',
  },
};

// ─── Default item/object mappings (config key → polyhavenId) ────────────────

const OBJECT_DEFAULTS: Record<string, string> = {
  chair: 'GreenChair_01',
  table: 'WoodenTable_01',
  barrel: 'wine_barrel_01',
  crate: 'wooden_crate_01',
  lantern: 'Lantern_01',
  sign: 'wooden_crate_02',         // placeholder
  cart: 'wooden_barrels_01',       // placeholder
  fence: 'wooden_crate_02',       // placeholder
  bench: 'WoodenChair_01',
  ladder: 'wooden_crate_01',      // placeholder
  bucket: 'wooden_bucket_01',
  basket: 'wicker_basket_01',
  pot: 'brass_pot_01',
  candle: 'wooden_candlestick',
  bookshelf: 'wooden_bookshelf_worn',
  bed: 'GothicBed_01',
  chest: 'treasure_chest',
  wardrobe: 'GothicCabinet_01',
  anvil: 'wooden_hammer_01',      // closest tool
  workbench: 'WoodenTable_03',
  stool: 'wooden_stool_01',
  rug: 'Ottoman_01',              // placeholder soft furnishing
  painting: 'ornate_mirror_01',
  mirror: 'ornate_mirror_01',
  fireplace: 'stone_fire_pit',
  broom: 'wooden_hammer_01',      // placeholder
  shovel: 'rusted_spade_01',
  axe: 'wooden_axe',
  hammer: 'wooden_hammer_01',
  saw: 'handsaw_wood',
  sword: 'antique_estoc',
  shield: 'kite_shield',
  bow: 'baseball_bat',            // placeholder ranged
  staff: 'baseball_bat',
};

const QUEST_OBJECT_DEFAULTS: Record<string, string> = {
  collectible: 'brass_vase_01',
  marker: 'Lantern_01',
  container: 'treasure_chest',
  key: 'gate_latch_01',
  scroll: 'book_encyclopedia_set_01',
  chest: 'treasure_chest',
  artifact: 'brass_goblets',
  gem: 'brass_vase_02',
  potion: 'wine_bottles_01',
  map: 'book_encyclopedia_set_01',
  letter: 'book_encyclopedia_set_01',
  relic: 'brass_diya_lantern',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function findGltfInDir(dir: string, modelName: string): string | null {
  const modelDir = path.join(dir, modelName);
  if (!fs.existsSync(modelDir)) return null;
  const files = fs.readdirSync(modelDir);
  const gltf = files.find(f => f.endsWith('.gltf') || f.endsWith('.glb'));
  return gltf || null;
}

function resolveModelPath(polyhavenId: string): { relativePath: string; category: string } | null {
  // Check nature first, then props, then furniture
  const dirs: Array<{ dir: string; category: string; base: string }> = [
    { dir: NATURE_DIR, category: 'nature', base: 'assets/models/nature/polyhaven' },
    { dir: PROPS_DIR, category: 'props', base: 'assets/models/props/polyhaven' },
    { dir: FURNITURE_DIR, category: 'furniture', base: 'assets/models/furniture/polyhaven' },
  ];

  for (const { dir, category, base } of dirs) {
    const file = findGltfInDir(dir, polyhavenId);
    if (file) {
      return {
        relativePath: `${base}/${polyhavenId}/${file}`,
        category,
      };
    }
  }
  return null;
}

/** Build lookup: polyhavenId (folder name) → asset ID */
function buildPolyhavenMap(allAssets: Array<{ id: string; filePath: string | null; name: string | null }>): Map<string, string> {
  const map = new Map<string, string>();
  for (const a of allAssets) {
    if (a.filePath) {
      const parts = a.filePath.split('/');
      // polyhaven path pattern: assets/models/{category}/polyhaven/{modelName}/{file}
      if (parts.length >= 2) {
        const folderName = parts[parts.length - 2];
        if (!map.has(folderName)) {
          map.set(folderName, a.id);
        }
      }
    }
    // Also match by asset name (before parenthetical)
    if (a.name) {
      const baseName = a.name.split(' (')[0].trim();
      if (!map.has(baseName)) {
        map.set(baseName, a.id);
      }
    }
  }
  return map;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function run() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/insimul';
  console.log(`Connecting to ${mongoUri.replace(/\/\/[^@]+@/, '//***@')}...`);
  await mongoose.connect(mongoUri);

  // 1. Build polyhaven ID → asset ID map from existing DB assets
  console.log('\n─── Building asset lookup ───');
  const allAssets = await storage.getAllVisualAssets();
  const polyhavenMap = buildPolyhavenMap(allAssets as any[]);
  console.log(`  ${polyhavenMap.size} polyhaven IDs indexed from ${allAssets.length} total assets`);

  // 2. Collect all unique polyhaven IDs we need
  const allNeededIds = new Set<string>();
  for (const group of Object.values(NATURE_DEFAULTS)) {
    for (const id of Object.values(group)) allNeededIds.add(id);
  }
  for (const id of Object.values(OBJECT_DEFAULTS)) allNeededIds.add(id);
  for (const id of Object.values(QUEST_OBJECT_DEFAULTS)) allNeededIds.add(id);

  // 3. Create VisualAsset records for models on disk but not in DB
  console.log('\n─── Ensuring all needed assets exist in DB ───');
  let created = 0;
  let alreadyExist = 0;
  let notOnDisk = 0;

  for (const polyhavenId of allNeededIds) {
    if (polyhavenMap.has(polyhavenId)) {
      alreadyExist++;
      continue;
    }

    const resolved = resolveModelPath(polyhavenId);
    if (!resolved) {
      console.log(`  ⚠ ${polyhavenId} — not found on disk, skipping`);
      notOnDisk++;
      continue;
    }

    // Determine asset type based on category
    let assetType = 'model_prop';
    if (resolved.category === 'nature') assetType = 'model_nature';

    // Get file size
    const fullPath = path.join(CLIENT_PUBLIC, resolved.relativePath);
    let fileSize = 0;
    try { fileSize = fs.statSync(fullPath).size; } catch { /* ok */ }

    const asset = await storage.createVisualAsset({
      worldId: null,
      name: polyhavenId,
      description: `Polyhaven ${resolved.category} asset`,
      assetType,
      filePath: resolved.relativePath,
      fileName: resolved.relativePath.split('/').pop() || `${polyhavenId}.gltf`,
      fileSize,
      mimeType: resolved.relativePath.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json',
      generationProvider: 'manual',
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['polyhaven', 'model', resolved.category],
      metadata: { polyhavenId },
    });

    polyhavenMap.set(polyhavenId, asset.id);
    console.log(`  + Created asset for ${polyhavenId} → ${asset.id}`);
    created++;
  }

  console.log(`\n  Summary: ${alreadyExist} already in DB, ${created} created, ${notOnDisk} not on disk`);

  // 4. Build the default assetId maps
  const natureAssetIds: Record<string, Record<string, string | undefined>> = {};
  for (const [group, entries] of Object.entries(NATURE_DEFAULTS)) {
    natureAssetIds[group] = {};
    for (const [key, polyhavenId] of Object.entries(entries)) {
      natureAssetIds[group][key] = polyhavenMap.get(polyhavenId);
    }
  }

  const objectAssetIds: Record<string, string | undefined> = {};
  for (const [key, polyhavenId] of Object.entries(OBJECT_DEFAULTS)) {
    objectAssetIds[key] = polyhavenMap.get(polyhavenId);
  }

  const questObjectAssetIds: Record<string, string | undefined> = {};
  for (const [key, polyhavenId] of Object.entries(QUEST_OBJECT_DEFAULTS)) {
    questObjectAssetIds[key] = polyhavenMap.get(polyhavenId);
  }

  // 5. Update all asset collections
  console.log('\n─── Updating asset collections ───');
  const collections = await AssetCollectionModel.find({});
  let updated = 0;
  let skipped = 0;

  for (const doc of collections) {
    const data = doc.toObject() as any;
    const existing = data.worldTypeConfig || {};
    let changed = false;

    // ── Nature config ──
    const existingNature = existing.natureConfig || {};
    const mergedNature: any = { ...existingNature };

    for (const [group, entries] of Object.entries(natureAssetIds)) {
      if (!mergedNature[group]) mergedNature[group] = {};
      for (const [key, assetId] of Object.entries(entries)) {
        if (!assetId) continue;
        if (!mergedNature[group][key]) {
          mergedNature[group][key] = { mode: 'asset', assetId };
          changed = true;
        } else if (!mergedNature[group][key].assetId) {
          mergedNature[group][key].assetId = assetId;
          changed = true;
        }
      }
    }

    // ── Item config ──
    const existingItems = existing.itemConfig || {};
    const mergedItems: any = { ...existingItems };

    // Objects
    if (!mergedItems.objects) mergedItems.objects = {};
    for (const [key, assetId] of Object.entries(objectAssetIds)) {
      if (!assetId) continue;
      if (!mergedItems.objects[key]) {
        mergedItems.objects[key] = { mode: 'asset', assetId };
        changed = true;
      } else if (!mergedItems.objects[key].assetId) {
        mergedItems.objects[key].assetId = assetId;
        changed = true;
      }
    }

    // Quest objects
    if (!mergedItems.questObjects) mergedItems.questObjects = {};
    for (const [key, assetId] of Object.entries(questObjectAssetIds)) {
      if (!assetId) continue;
      if (!mergedItems.questObjects[key]) {
        mergedItems.questObjects[key] = { mode: 'asset', assetId };
        changed = true;
      } else if (!mergedItems.questObjects[key].assetId) {
        mergedItems.questObjects[key].assetId = assetId;
        changed = true;
      }
    }

    if (changed) {
      await AssetCollectionModel.updateOne(
        { _id: doc._id },
        { $set: {
          'worldTypeConfig.natureConfig': mergedNature,
          'worldTypeConfig.itemConfig': mergedItems,
        }},
      );
      console.log(`  → "${data.name}" — updated natureConfig + itemConfig`);
      updated++;
    } else {
      console.log(`  ✓ "${data.name}" — already has assetIds, skipping`);
      skipped++;
    }

    // Also ensure these asset IDs are in the collection's assetIds array
    const allAssetIdsToAdd = new Set<string>();
    for (const group of Object.values(natureAssetIds)) {
      for (const id of Object.values(group)) { if (id) allAssetIdsToAdd.add(id); }
    }
    for (const id of Object.values(objectAssetIds)) { if (id) allAssetIdsToAdd.add(id); }
    for (const id of Object.values(questObjectAssetIds)) { if (id) allAssetIdsToAdd.add(id); }

    const existingAssetIds = new Set((data.assetIds || []) as string[]);
    const newIds = [...allAssetIdsToAdd].filter(id => !existingAssetIds.has(id));
    if (newIds.length > 0) {
      await AssetCollectionModel.updateOne(
        { _id: doc._id },
        { $push: { assetIds: { $each: newIds } } },
      );
      console.log(`    + Added ${newIds.length} asset IDs to collection's assetIds array`);
    }
  }

  console.log(`\nDone. Updated: ${updated}, Already complete: ${skipped}, Total: ${collections.length}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
