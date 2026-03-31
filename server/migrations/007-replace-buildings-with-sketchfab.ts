#!/usr/bin/env tsx
/**
 * Migration: Replace KayKit Cartoonish Buildings with Realistic Sketchfab Models
 *
 * Downloads 13 curated CC-BY licensed Sketchfab models and updates the
 * buildingModels config3D entries in all relevant collections.
 *
 * All models have been manually verified for:
 *   - License: CC-BY (Attribution)
 *   - Face count: game-ready (<50K faces)
 *   - Visual quality: realistic / semi-realistic medieval style
 *   - Downloadable: true
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/007-replace-buildings-with-sketchfab.ts
 */

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
import { getDownloadUrl } from '../services/assets/sketchfab-api.js';
import { preprocessSketchfabAsset } from '../services/assets/asset-downloader.js';

// ─── Curated Sketchfab building models ──────────────────────────────────────

interface SketchfabBuilding {
  uid: string;
  name: string;
  semanticRole: string;
  faces: number;
  license: string;
}

const SKETCHFAB_BUILDINGS: SketchfabBuilding[] = [
  {
    uid: '0bbda345359349ea95280f597c8a4bd4',
    name: 'Medieval House 1',
    semanticRole: 'default',
    faces: 691,
    license: 'CC-BY',
  },
  {
    uid: 'cf179aa6dc0944f1974ce3f7812031a6',
    name: 'Medieval House 3',
    semanticRole: 'smallResidence',
    faces: 697,
    license: 'CC-BY',
  },
  {
    uid: '3eb9e3b600264e2f99100fc43619497e',
    name: 'Medieval House - Generic Textures - Game Ready',
    semanticRole: 'largeResidence',
    faces: 8124,
    license: 'CC-BY',
  },
  {
    uid: 'a06dfdc919334bfc95de720ad98f4295',
    name: 'Medieval Tavern (2k vertices)',
    semanticRole: 'tavern',
    faces: 3850,
    license: 'CC-BY',
  },
  {
    uid: '7d9b2922dd0941dab820c4763078c789',
    name: 'Medieval Food Stall',
    semanticRole: 'shop',
    faces: 25283,
    license: 'CC-BY',
  },
  {
    uid: 'd93444656b204ddd8270b9a9be0d99ec',
    name: "The Blacksmith's",
    semanticRole: 'blacksmith',
    faces: 17683,
    license: 'CC-BY',
  },
  {
    uid: 'b5eaf6f238b1490a80c682ed238a7230',
    name: 'Low Poly Medieval Gothic Church',
    semanticRole: 'church',
    faces: 9548,
    license: 'CC-BY',
  },
  {
    uid: 'e883e0175881444197b38d4c19d59a16',
    name: 'Stylised Medieval Buildings - Town Hall',
    semanticRole: 'municipal',
    faces: 490,
    license: 'CC-BY',
  },
  {
    uid: '080f516a0b6b402092c1314913341db8',
    name: 'Medieval Mill',
    semanticRole: 'windmill',
    faces: 11068,
    license: 'CC-BY',
  },
  {
    uid: '0e5944ed90664d408548b6d19601c7a8',
    name: 'Watermill',
    semanticRole: 'watermill',
    faces: 9309,
    license: 'CC-BY',
  },
  {
    uid: '39e4cd568ce74dd3a58118d3a5b94471',
    name: 'Old Sawmill',
    semanticRole: 'lumbermill',
    faces: 41515,
    license: 'CC-BY',
  },
  {
    uid: '1086c3c8d5434cf89b1cab8792ba9151',
    name: 'Medieval Barrack',
    semanticRole: 'barracks',
    faces: 6862,
    license: 'CC-BY',
  },
  {
    uid: '00b563b64111430e9ebdb71ae784979c',
    name: 'Mine Shaft Kit',
    semanticRole: 'mine',
    faces: 6017,
    license: 'CC-BY',
  },
];

// Collections that should receive these building models
const TARGET_WORLD_TYPES = [
  'medieval-fantasy',
  'high-fantasy',
  'dark-fantasy',
  'low-fantasy',
  'historical-medieval',
  'mythological',
  'generic',
];

// ─── Main migration ────────────────────────────────────────────────────────────

async function run() {
  console.log('🏰 Replacing KayKit buildings with curated Sketchfab models...\n');

  if (!process.env.SKETCHFAB_API_TOKEN) {
    console.error('❌ SKETCHFAB_API_TOKEN not set in .env — cannot download models.');
    process.exit(1);
  }

  // Step 1: Download all 13 models and create VisualAssets
  const roleToAssetId: Record<string, string> = {};
  const roleToPath: Record<string, string> = {};

  for (const building of SKETCHFAB_BUILDINGS) {
    console.log(`\n📦 [${building.semanticRole}] ${building.name} (${building.faces} faces)`);

    try {
      // Get download URL (time-limited)
      console.log('  Getting download URL...');
      const downloadInfo = await getDownloadUrl(building.uid);

      // Download and extract
      console.log('  Downloading and extracting...');
      const result = await preprocessSketchfabAsset(
        downloadInfo.gltfUrl,
        'model_building',
        building.uid,
        building.name
      );

      // Create VisualAsset record
      const isGlb = result.localPath.endsWith('.glb');
      const asset = await storage.createVisualAsset({
        worldId: null,
        name: building.name,
        description: `Sketchfab model (${building.license}): ${building.name}. ${building.faces} faces. UID: ${building.uid}`,
        assetType: 'model_building',
        filePath: result.localPath,
        fileName: result.localPath.split('/').pop() || `scene.${isGlb ? 'glb' : 'gltf'}`,
        fileSize: result.metadata.fileSize,
        mimeType: isGlb ? 'model/gltf-binary' : 'model/gltf+json',
        generationProvider: 'manual',
        purpose: 'procedural',
        usageContext: '3d_game',
        tags: ['sketchfab', 'building', 'medieval', 'realistic', building.semanticRole],
        metadata: {
          sketchfabUid: building.uid,
          semanticRole: building.semanticRole,
          faceCount: building.faces,
          license: building.license,
          source: 'sketchfab',
        },
      });

      roleToAssetId[building.semanticRole] = asset.id;
      roleToPath[building.semanticRole] = `/${result.localPath}`;
      console.log(`  ✅ Created asset ${asset.id} -> ${result.localPath}`);
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
      console.error('  Skipping this building role...');
    }
  }

  const successCount = Object.keys(roleToAssetId).length;
  console.log(`\n\n📊 Downloaded ${successCount}/${SKETCHFAB_BUILDINGS.length} models successfully.`);

  if (successCount === 0) {
    console.error('❌ No models were downloaded. Aborting collection updates.');
    process.exit(1);
  }

  // Step 2: Update all target collections
  console.log('\n🔄 Updating collections...\n');

  const allCollections = await storage.getAllAssetCollections();
  let updatedCount = 0;

  for (const collection of allCollections) {
    const wt = collection.worldType || '';
    if (!TARGET_WORLD_TYPES.includes(wt)) continue;

    const existingBuildingModels = (collection as any).buildingModels as Record<string, string> || {};
    const existingAssetIds: string[] = (collection.assetIds as string[]) || [];

    // Build updated buildingModels map
    const newBuildingModels: Record<string, string> = { ...existingBuildingModels };
    const newAssetIds = [...existingAssetIds];

    for (const [role, assetId] of Object.entries(roleToAssetId)) {
      newBuildingModels[role] = assetId;
      if (!newAssetIds.includes(assetId)) {
        newAssetIds.push(assetId);
      }
    }

    try {
      await storage.updateAssetCollection(collection.id, {
        buildingModels: newBuildingModels,
        assetIds: newAssetIds,
      } as any);

      updatedCount++;
      console.log(`  ✅ Updated: ${collection.name} (${wt})`);
    } catch (error: any) {
      console.error(`  ❌ Failed to update ${collection.name}: ${error.message}`);
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Models downloaded: ${successCount}/${SKETCHFAB_BUILDINGS.length}`);
  console.log(`   Collections updated: ${updatedCount}`);
  console.log(`\n   Building roles replaced:`);
  for (const [role, assetId] of Object.entries(roleToAssetId)) {
    console.log(`     ${role}: ${assetId}`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
