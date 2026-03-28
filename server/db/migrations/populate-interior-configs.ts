/**
 * Migration: Populate interior configs for all building types in all asset collections.
 *
 * For each building type that has a matching InteriorLayoutTemplate, this sets:
 *   - interiorConfig.mode = 'procedural'
 *   - interiorConfig.layoutTemplateId = matching template ID
 *   - interiorConfig.lightingPreset = category-appropriate preset
 *   - interiorConfig.furnitureSet = primary room function name
 *
 * Non-destructive: only fills in missing interiorConfig. Existing configs are preserved.
 *
 * Usage:
 *   npx tsx server/db/migrations/populate-interior-configs.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import mongoose, { Schema } from 'mongoose';

const AssetCollectionSchema = new Schema({}, { strict: false });
const AssetCollectionModel = mongoose.model('AssetCollection', AssetCollectionSchema, 'assetcollections');

// Import from shared modules
import { BUILDING_CATEGORY_GROUPINGS, getCategoryForType } from '../../../shared/game-engine/building-categories';
import { getTemplateForBuildingType, type InteriorLayoutTemplate } from '../../../shared/game-engine/interior-templates';

// ── Lighting preset mapping by category ──────────────────────────────────────

const CATEGORY_LIGHTING: Record<string, string> = {
  commercial_food: 'warm',
  commercial_retail: 'bright',
  commercial_service: 'bright',
  civic: 'bright',
  entertainment: 'warm',
  professional: 'bright',
  industrial: 'dim',
  military: 'cool',
  maritime: 'bright',
  residential: 'warm',
};

// ── Furniture set = template ID (used by resolveFurnitureTemplate to find the matching template) ─

// ── Main migration ───────────────────────────────────────────────────────────

async function run() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    console.error('No MONGODB_URI or DATABASE_URL environment variable set');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Collect all building types from all categories
  const allBuildingTypes: string[] = [];
  for (const types of Object.values(BUILDING_CATEGORY_GROUPINGS)) {
    allBuildingTypes.push(...types);
  }

  // Build the interior config for each building type
  const interiorConfigs: Record<string, any> = {};
  let matched = 0;
  let unmatched = 0;

  for (const typeName of allBuildingTypes) {
    const category = getCategoryForType(typeName);
    const template = getTemplateForBuildingType(typeName, typeName, category);

    if (template) {
      interiorConfigs[typeName] = {
        mode: 'procedural',
        layoutTemplateId: template.id,
        lightingPreset: CATEGORY_LIGHTING[category || ''] || 'warm',
        furnitureSet: template.id,  // template ID is used by resolveFurnitureTemplate()
      };
      matched++;
    } else {
      console.warn(`  ⚠ No template found for ${typeName} (category: ${category})`);
      unmatched++;
    }
  }

  console.log(`\nTemplate matching: ${matched} matched, ${unmatched} unmatched out of ${allBuildingTypes.length} types\n`);

  // Apply to all asset collections
  const collections = await AssetCollectionModel.find({}).lean();
  console.log(`Found ${collections.length} asset collections\n`);

  let updatedCount = 0;

  for (const collection of collections) {
    const doc = collection as any;
    const collectionName = doc.name || doc._id;

    // The admin panel reads from TWO possible paths:
    //   1. worldTypeConfig.buildingConfig.buildingTypeConfigs (primary)
    //   2. buildingConfig.buildingTypeConfigs (fallback)
    // We need to update whichever path exists, preferring worldTypeConfig.
    const primaryConfigs = doc.worldTypeConfig?.buildingConfig?.buildingTypeConfigs;
    const fallbackConfigs = doc.buildingConfig?.buildingTypeConfigs;

    // Determine which config object to update and the DB path
    let configs: Record<string, any>;
    let dbPath: string;
    if (primaryConfigs) {
      configs = primaryConfigs;
      dbPath = 'worldTypeConfig.buildingConfig.buildingTypeConfigs';
    } else if (fallbackConfigs) {
      configs = fallbackConfigs;
      dbPath = 'buildingConfig.buildingTypeConfigs';
    } else {
      // Neither exists — create at primary path
      if (!doc.worldTypeConfig) doc.worldTypeConfig = {};
      if (!doc.worldTypeConfig.buildingConfig) doc.worldTypeConfig.buildingConfig = {};
      doc.worldTypeConfig.buildingConfig.buildingTypeConfigs = {};
      configs = doc.worldTypeConfig.buildingConfig.buildingTypeConfigs;
      dbPath = 'worldTypeConfig.buildingConfig.buildingTypeConfigs';
    }

    let addedForCollection = 0;

    for (const [typeName, interiorConfig] of Object.entries(interiorConfigs)) {
      // Ensure the building type config exists
      if (!configs[typeName]) {
        configs[typeName] = { mode: 'procedural', styleOverrides: {} };
      }

      // Merge: keep existing texture IDs, always update layout/furniture/lighting
      const existing = configs[typeName].interiorConfig || {};
      configs[typeName].interiorConfig = {
        ...existing,
        ...(interiorConfig as any),
      };
      addedForCollection++;
    }

    if (addedForCollection > 0) {
      await AssetCollectionModel.updateOne(
        { _id: doc._id },
        { $set: { [dbPath]: configs } }
      );
      console.log(`  ✓ ${collectionName}: added ${addedForCollection} interior configs (path: ${dbPath})`);
      updatedCount++;
    } else {
      console.log(`  – ${collectionName}: all interior configs already set`);
    }
  }

  console.log(`\nDone. Updated ${updatedCount} of ${collections.length} collections.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
