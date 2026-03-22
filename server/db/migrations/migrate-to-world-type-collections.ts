/**
 * Migration: Convert legacy AssetCollections to World Type Collections
 *
 * This migration populates the new `worldTypeConfig` field from legacy flat fields:
 *   - groundTextureId, roadTextureId → worldTypeConfig.groundConfig
 *   - buildingModels, buildingTypeConfigs, categoryPresets, proceduralBuildings → worldTypeConfig.buildingConfig
 *   - characterModels, playerModels, npcConfig → worldTypeConfig.characterConfig
 *   - natureModels → worldTypeConfig.natureConfig
 *   - objectModels, questObjectModels → worldTypeConfig.itemConfig
 *   - audioAssets → worldTypeConfig.audioAssets
 *   - modelScaling entries → distributed to their respective modules
 *
 * Non-destructive: old fields are preserved for backward compatibility.
 * Also updates collectionType to 'world_type_collection'.
 *
 * Usage:
 *   npx tsx server/db/migrations/migrate-to-world-type-collections.ts
 *
 * Idempotent: skips collections that already have worldTypeConfig populated.
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

async function run() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/insimul';
  console.log(`Connecting to ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  const collections = await AssetCollectionModel.find({});
  console.log(`Found ${collections.length} asset collections to migrate.`);

  let migrated = 0;
  let skipped = 0;

  for (const doc of collections) {
    const data = doc.toObject() as any;

    // Skip if already migrated
    if (data.worldTypeConfig && Object.keys(data.worldTypeConfig).length > 0) {
      console.log(`  ✓ "${data.name}" — already has worldTypeConfig, skipping`);
      skipped++;
      continue;
    }

    const worldTypeConfig: any = {};
    const scaling = data.modelScaling || {};

    // ─── Ground Config ─────────────────────────────────────────────────
    if (data.groundTextureId || data.roadTextureId) {
      worldTypeConfig.groundConfig = {};
      if (data.groundTextureId) {
        worldTypeConfig.groundConfig.ground = { mode: 'asset', textureId: data.groundTextureId };
      }
      if (data.roadTextureId) {
        worldTypeConfig.groundConfig.road = { mode: 'asset', textureId: data.roadTextureId };
      }
    }

    // ─── Building Config ───────────────────────────────────────────────
    const hasBuildingData = data.buildingTypeConfigs || data.categoryPresets ||
      data.proceduralBuildings || (data.buildingModels && Object.keys(data.buildingModels).length > 0);

    if (hasBuildingData) {
      worldTypeConfig.buildingConfig = {};

      // Migrate buildingTypeConfigs (already in the right format)
      if (data.buildingTypeConfigs) {
        worldTypeConfig.buildingConfig.buildingTypeConfigs = data.buildingTypeConfigs;
      } else if (data.buildingModels && Object.keys(data.buildingModels).length > 0) {
        // Convert legacy buildingModels to buildingTypeConfigs
        const btc: Record<string, any> = {};
        for (const [role, assetId] of Object.entries(data.buildingModels)) {
          const scalingKey = `buildingModels.${role}`;
          btc[role] = {
            mode: 'asset',
            assetId,
            ...(scaling[scalingKey] ? { modelScaling: scaling[scalingKey] } : {}),
          };
        }
        worldTypeConfig.buildingConfig.buildingTypeConfigs = btc;
      }

      if (data.categoryPresets) {
        worldTypeConfig.buildingConfig.categoryPresets = data.categoryPresets;
      }
      if (data.proceduralBuildings) {
        worldTypeConfig.buildingConfig.proceduralDefaults = data.proceduralBuildings;
      }
    }

    // ─── Character Config ──────────────────────────────────────────────
    const hasCharacterData = (data.characterModels && Object.keys(data.characterModels).length > 0) ||
      (data.playerModels && Object.keys(data.playerModels).length > 0) ||
      data.npcConfig;

    if (hasCharacterData) {
      worldTypeConfig.characterConfig = {};

      if (data.playerModels && Object.keys(data.playerModels).length > 0) {
        const pm: Record<string, any> = {};
        for (const [role, assetId] of Object.entries(data.playerModels)) {
          const scalingKey = `playerModels.${role}`;
          pm[role] = {
            mode: 'asset',
            assetId,
            ...(scaling[scalingKey] ? { modelScaling: scaling[scalingKey] } : {}),
          };
        }
        worldTypeConfig.characterConfig.playerModels = pm;
      }

      if (data.characterModels && Object.keys(data.characterModels).length > 0) {
        const cm: Record<string, any> = {};
        for (const [role, assetId] of Object.entries(data.characterModels)) {
          const scalingKey = `characterModels.${role}`;
          cm[role] = {
            mode: 'asset',
            assetId,
            ...(scaling[scalingKey] ? { modelScaling: scaling[scalingKey] } : {}),
          };
        }
        worldTypeConfig.characterConfig.characterModels = cm;
      }

      if (data.npcConfig) {
        if (data.npcConfig.bodyModels) worldTypeConfig.characterConfig.npcBodyModels = data.npcConfig.bodyModels;
        if (data.npcConfig.hairStyles) worldTypeConfig.characterConfig.npcHairStyles = data.npcConfig.hairStyles;
        if (data.npcConfig.clothingPalette) worldTypeConfig.characterConfig.npcClothingPalette = data.npcConfig.clothingPalette;
        if (data.npcConfig.skinTonePalette) worldTypeConfig.characterConfig.npcSkinTonePalette = data.npcConfig.skinTonePalette;
      }
    }

    // ─── Nature Config ─────────────────────────────────────────────────
    if (data.natureModels && Object.keys(data.natureModels).length > 0) {
      // Put all nature models under "trees" group by default
      // (can be reorganized later in the UI)
      const trees: Record<string, any> = {};
      for (const [name, assetId] of Object.entries(data.natureModels)) {
        const scalingKey = `natureModels.${name}`;
        trees[name] = {
          mode: 'asset',
          assetId,
          ...(scaling[scalingKey] ? { modelScaling: scaling[scalingKey] } : {}),
        };
      }
      worldTypeConfig.natureConfig = { trees };
    }

    // ─── Item Config ───────────────────────────────────────────────────
    const hasItemData = (data.objectModels && Object.keys(data.objectModels).length > 0) ||
      (data.questObjectModels && Object.keys(data.questObjectModels).length > 0);

    if (hasItemData) {
      worldTypeConfig.itemConfig = {};

      if (data.objectModels && Object.keys(data.objectModels).length > 0) {
        const objects: Record<string, any> = {};
        for (const [name, assetId] of Object.entries(data.objectModels)) {
          const scalingKey = `objectModels.${name}`;
          objects[name] = {
            mode: 'asset',
            assetId,
            ...(scaling[scalingKey] ? { modelScaling: scaling[scalingKey] } : {}),
          };
        }
        worldTypeConfig.itemConfig.objects = objects;
      }

      if (data.questObjectModels && Object.keys(data.questObjectModels).length > 0) {
        const questObjects: Record<string, any> = {};
        for (const [name, assetId] of Object.entries(data.questObjectModels)) {
          const scalingKey = `questObjectModels.${name}`;
          questObjects[name] = {
            mode: 'asset',
            assetId,
            ...(scaling[scalingKey] ? { modelScaling: scaling[scalingKey] } : {}),
          };
        }
        worldTypeConfig.itemConfig.questObjects = questObjects;
      }
    }

    // ─── Audio ─────────────────────────────────────────────────────────
    if (data.audioAssets && Object.keys(data.audioAssets).length > 0) {
      worldTypeConfig.audioAssets = data.audioAssets;
    }

    // Only update if we have any data to migrate
    if (Object.keys(worldTypeConfig).length > 0) {
      await AssetCollectionModel.updateOne(
        { _id: doc._id },
        {
          $set: {
            worldTypeConfig,
            collectionType: 'world_type_collection',
          },
        }
      );
      console.log(`  → "${data.name}" — migrated (${Object.keys(worldTypeConfig).length} config modules)`);
      migrated++;
    } else {
      // Still update collectionType even if no config data
      await AssetCollectionModel.updateOne(
        { _id: doc._id },
        { $set: { collectionType: 'world_type_collection' } }
      );
      console.log(`  · "${data.name}" — no legacy config data, updated collectionType only`);
      skipped++;
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}, Total: ${collections.length}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
