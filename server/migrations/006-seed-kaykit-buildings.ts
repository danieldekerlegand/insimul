#!/usr/bin/env tsx
/**
 * Migration: Seed KayKit Medieval Building Models
 *
 * Registers KayKit Medieval Hexagon Pack building models as VisualAssets
 * and adds buildingModels config3D entries to relevant collections.
 *
 * Source: KayKit Medieval Hexagon Pack (CC0 License)
 * https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0
 *
 * Files are pre-downloaded to: client/public/assets/kaykit/models/medieval-buildings/
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/006-seed-kaykit-buildings.ts
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

// ─── KayKit building definitions ───────────────────────────────────────────────

interface KayKitBuilding {
  fileName: string;          // e.g. "building_tavern_blue"
  name: string;              // Display name
  semanticRole: string;      // config3D buildingModels key
  description: string;
}

const KAYKIT_BUILDINGS: KayKitBuilding[] = [
  {
    fileName: 'building_home_A_blue',
    name: 'Medieval House A',
    semanticRole: 'default',
    description: 'Low-poly medieval house with pitched roof'
  },
  {
    fileName: 'building_home_B_blue',
    name: 'Medieval House B',
    semanticRole: 'smallResidence',
    description: 'Low-poly small medieval cottage'
  },
  {
    fileName: 'building_castle_blue',
    name: 'Medieval Castle',
    semanticRole: 'largeResidence',
    description: 'Low-poly medieval castle with towers'
  },
  {
    fileName: 'building_tavern_blue',
    name: 'Medieval Tavern',
    semanticRole: 'tavern',
    description: 'Low-poly medieval tavern building'
  },
  {
    fileName: 'building_market_blue',
    name: 'Medieval Market',
    semanticRole: 'shop',
    description: 'Low-poly medieval market stall building'
  },
  {
    fileName: 'building_blacksmith_blue',
    name: 'Medieval Blacksmith',
    semanticRole: 'blacksmith',
    description: 'Low-poly medieval blacksmith forge'
  },
  {
    fileName: 'building_church_blue',
    name: 'Medieval Church',
    semanticRole: 'church',
    description: 'Low-poly medieval church with steeple'
  },
  {
    fileName: 'building_well_blue',
    name: 'Medieval Well',
    semanticRole: 'municipal',
    description: 'Low-poly medieval town well'
  },
  {
    fileName: 'building_windmill_blue',
    name: 'Medieval Windmill',
    semanticRole: 'windmill',
    description: 'Low-poly medieval windmill'
  },
  {
    fileName: 'building_watermill_blue',
    name: 'Medieval Watermill',
    semanticRole: 'watermill',
    description: 'Low-poly medieval watermill'
  },
  {
    fileName: 'building_lumbermill_blue',
    name: 'Medieval Lumbermill',
    semanticRole: 'lumbermill',
    description: 'Low-poly medieval lumber mill'
  },
  {
    fileName: 'building_barracks_blue',
    name: 'Medieval Barracks',
    semanticRole: 'barracks',
    description: 'Low-poly medieval military barracks'
  },
  {
    fileName: 'building_mine_blue',
    name: 'Medieval Mine',
    semanticRole: 'mine',
    description: 'Low-poly medieval mine entrance'
  }
];

// Collections that should receive medieval building models
const MEDIEVAL_WORLD_TYPES = [
  'medieval-fantasy',
  'high-fantasy',
  'dark-fantasy',
  'low-fantasy',
  'historical-medieval',
  'mythological',
  'generic',
];

const ASSET_DIR = 'assets/kaykit/models/medieval-buildings';

// ─── Main migration ────────────────────────────────────────────────────────────

async function run() {
  console.log('🏰 Seeding KayKit Medieval Building Models...\n');

  // Verify files exist on disk
  const projectRoot = path.resolve(__dirname, '../..');
  const absoluteDir = path.join(projectRoot, 'client/public', ASSET_DIR);

  let missingFiles = 0;
  for (const building of KAYKIT_BUILDINGS) {
    const gltfPath = path.join(absoluteDir, `${building.fileName}.gltf`);
    const binPath = path.join(absoluteDir, `${building.fileName}.bin`);
    if (!fs.existsSync(gltfPath)) {
      console.error(`  ❌ Missing: ${gltfPath}`);
      missingFiles++;
    }
    if (!fs.existsSync(binPath)) {
      console.error(`  ❌ Missing: ${binPath}`);
      missingFiles++;
    }
  }
  // Check shared texture
  const texturePath = path.join(absoluteDir, 'hexagons_medieval.png');
  if (!fs.existsSync(texturePath)) {
    console.error(`  ❌ Missing shared texture: ${texturePath}`);
    missingFiles++;
  }

  if (missingFiles > 0) {
    console.error(`\n❌ ${missingFiles} files missing. Aborting.`);
    process.exit(1);
  }
  console.log('  ✅ All building files verified on disk.\n');

  // Step 1: Create VisualAsset records for each building (deduplicate by fileName)
  const existingAssets = await storage.getAllVisualAssets();
  const existingByFileName = new Map<string, string>();
  for (const a of existingAssets) {
    if (a.metadata && (a.metadata as any).kayKitId) {
      existingByFileName.set((a.metadata as any).kayKitId, a.id);
    }
  }

  const assetIdMap = new Map<string, string>(); // semanticRole -> VisualAsset ID

  for (const building of KAYKIT_BUILDINGS) {
    const kayKitId = building.fileName;

    // Check if already created
    if (existingByFileName.has(kayKitId)) {
      const existingId = existingByFileName.get(kayKitId)!;
      console.log(`  ♻️  ${kayKitId} -> reusing ${existingId}`);
      assetIdMap.set(building.semanticRole, existingId);
      continue;
    }

    // Get file size
    const filePath = path.join(absoluteDir, `${building.fileName}.gltf`);
    const stats = fs.statSync(filePath);

    const asset = await storage.createVisualAsset({
      name: building.name,
      description: building.description,
      assetType: 'model_building',
      filePath: `${ASSET_DIR}/${building.fileName}.gltf`,
      fileName: `${building.fileName}.gltf`,
      fileSize: stats.size,
      mimeType: 'model/gltf+json',
      generationProvider: 'kaykit',
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['building', 'medieval', 'low-poly', 'kaykit', 'cc0', building.semanticRole],
      status: 'completed',
      metadata: {
        kayKitId,
        provider: 'kaykit',
        pack: 'medieval-hexagon-pack',
        license: 'CC0',
        source: 'https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0'
      }
    });

    console.log(`  ✅ ${kayKitId} (${building.semanticRole}) -> created ${asset.id.substring(0, 10)}...`);
    assetIdMap.set(building.semanticRole, asset.id);
  }

  console.log(`\nCreated/reused ${assetIdMap.size} building VisualAssets.\n`);

  // Step 2: Update relevant collections
  const allCollections = await storage.getAllAssetCollections();
  let updatedCount = 0;

  for (const collection of allCollections) {
    const wt = (collection.worldType || '').toLowerCase();
    if (!MEDIEVAL_WORLD_TYPES.some(t => wt === t || wt.includes(t))) {
      continue;
    }

    console.log(`\n📦 Updating collection: "${collection.name}" (worldType: ${collection.worldType})`);

    // Get current state
    const currentAssetIds: string[] = (collection.assetIds as string[]) || [];
    const currentBuildingModels: Record<string, string> = (collection.buildingModels as Record<string, string>) || {};

    // Add new asset IDs and building model mappings
    const newAssetIds = [...currentAssetIds];
    const newBuildingModels = { ...currentBuildingModels };
    let addedCount = 0;

    for (const [role, assetId] of Array.from(assetIdMap.entries())) {
      // Add to assetIds if not already present
      if (!newAssetIds.includes(assetId)) {
        newAssetIds.push(assetId);
      }

      // Add to buildingModels if role not already mapped
      if (!newBuildingModels[role]) {
        newBuildingModels[role] = assetId;
        addedCount++;
      }
    }

    if (addedCount === 0) {
      console.log(`  ⏭️  Already has all building model roles. Skipping.`);
      continue;
    }

    // Update collection
    await storage.updateAssetCollection(collection.id, {
      assetIds: newAssetIds,
      buildingModels: newBuildingModels
    } as any);

    console.log(`  ✅ Updated: assetIds ${currentAssetIds.length} -> ${newAssetIds.length}, buildingModels: +${addedCount} roles`);
    console.log(`     Roles added: ${Array.from(assetIdMap.keys()).filter(r => !currentBuildingModels[r]).join(', ')}`);
    updatedCount++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ KayKit Medieval Buildings migration completed!`);
  console.log(`   VisualAssets: ${assetIdMap.size}`);
  console.log(`   Collections updated: ${updatedCount}`);
  console.log(`${'='.repeat(50)}\n`);
}

run()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
