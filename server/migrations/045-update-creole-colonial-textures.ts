#!/usr/bin/env tsx
/**
 * Migration 045: Update Creole Colonial asset collection textures
 *
 * Updates the proceduralBuildings stylePresets with new wall/roof textures:
 *   - commercial_food: blue_painted_planks + red_slate_roof_tiles_01
 *   - commercial_retail: dark_wooden_planks + roof_slates_03
 *   - commercial_service: green_rough_planks + roof_slates_02
 *   - civic: wood_plank_wall + grey_roof_01
 *   - industrial: wooden_rough_planks + corrugated_iron
 *   - maritime: dark_wooden_planks + corrugated_iron
 *   - residential: blue_painted_planks + red_slate_roof_tiles_01
 *
 * Also updates ground texture from forest_floor to sparse_grass.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Texture mapping by category keyword in preset name
const WALL_TEXTURES: Record<string, string> = {
  'commercial food': 'blue_painted_planks',
  'commercial retail': 'dark_wooden_planks',
  'commercial service': 'green_rough_planks',
  'civic': 'wood_plank_wall',
  'industrial': 'wooden_rough_planks',
  'maritime': 'dark_wooden_planks',
  'residential': 'blue_painted_planks',
};

const ROOF_TEXTURES: Record<string, string> = {
  'commercial food': 'red_slate_roof_tiles_01',
  'commercial retail': 'roof_slates_03',
  'commercial service': 'roof_slates_02',
  'civic': 'grey_roof_01',
  'industrial': 'corrugated_iron',
  'maritime': 'corrugated_iron',
  'residential': 'red_slate_roof_tiles_01',
};

async function run() {
  await mongoose.connect(process.env.MONGO_URL!);
  const db = mongoose.connection.db!;
  const collections = db.collection('assetcollections');

  // Find Creole Colonial / French Louisiana collections
  const query = {
    $or: [
      { name: /creole/i },
      { name: /french louisiana/i },
      { worldType: 'historical-french-colonial' },
      { worldType: 'creole-colonial' },
    ],
  };

  const docs = await collections.find(query).toArray();
  console.log(`Found ${docs.length} Creole Colonial asset collection(s)`);

  for (const doc of docs) {
    console.log(`\nUpdating: ${doc.name} (${doc._id})`);
    console.log(`  worldType: ${doc.worldType}`);

    const pb = doc.proceduralBuildings || {};
    const presets = pb.stylePresets || [];

    let updated = 0;
    for (const preset of presets) {
      const name = (preset.name || '').toLowerCase();
      for (const [category, wallTex] of Object.entries(WALL_TEXTURES)) {
        if (name.includes(category)) {
          const oldWall = preset.wallTextureId || preset.wallTexture || 'none';
          const oldRoof = preset.roofTextureId || preset.roofTexture || 'none';
          preset.wallTexture = wallTex;
          preset.roofTexture = ROOF_TEXTURES[category];
          // Also update ID fields if they exist (some presets use wallTextureId)
          if (preset.wallTextureId) preset.wallTextureId = wallTex;
          if (preset.roofTextureId) preset.roofTextureId = ROOF_TEXTURES[category];
          console.log(`  ${preset.name}: wall ${oldWall} → ${wallTex}, roof ${oldRoof} → ${ROOF_TEXTURES[category]}`);
          updated++;
          break;
        }
      }
    }

    pb.stylePresets = presets;

    // Also update ground texture ID on the collection document
    const updateFields: Record<string, any> = {
      proceduralBuildings: pb,
      updatedAt: new Date(),
    };

    // Update groundTextureId if it was pointing to forest_floor
    if (doc.groundTextureId) {
      console.log(`  groundTextureId: keeping existing ${doc.groundTextureId}`);
    }

    // Update worldTypeConfig if present
    if (doc.worldTypeConfig?.groundConfig?.ground?.texture) {
      doc.worldTypeConfig.groundConfig.ground.texture = 'sparse_grass';
      updateFields.worldTypeConfig = doc.worldTypeConfig;
      console.log(`  worldTypeConfig ground: → sparse_grass`);
    }

    await collections.updateOne({ _id: doc._id }, { $set: updateFields });
    console.log(`  Updated ${updated} style presets`);
  }

  // Also update any world documents that reference the ground texture
  const worldsCol = db.collection('worlds');
  const worlds = await worldsCol.find({
    $or: [
      { worldType: 'historical-french-colonial' },
      { worldType: 'creole-colonial' },
    ],
  }).toArray();

  console.log(`\nFound ${worlds.length} world(s) with matching worldType`);
  for (const world of worlds) {
    const w3d = world.world3DConfig || {};
    let changed = false;

    // Update ground texture reference
    if (w3d.groundTextureId) {
      console.log(`  World ${world.name}: groundTextureId=${w3d.groundTextureId} (keeping — resolve via asset collection)`);
    }

    // Update proceduralBuildings in the world's 3D config
    if (w3d.proceduralBuildings?.stylePresets) {
      for (const preset of w3d.proceduralBuildings.stylePresets) {
        const name = (preset.name || '').toLowerCase();
        for (const [category, wallTex] of Object.entries(WALL_TEXTURES)) {
          if (name.includes(category)) {
            preset.wallTextureId = wallTex;
            preset.roofTextureId = ROOF_TEXTURES[category];
            changed = true;
            break;
          }
        }
      }
      if (changed) {
        await worldsCol.updateOne(
          { _id: world._id },
          { $set: { world3DConfig: w3d } }
        );
        console.log(`  World ${world.name}: updated style presets in world3DConfig`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
