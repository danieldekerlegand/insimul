#!/usr/bin/env tsx
/**
 * Migration 029: Organize Quaternius assets and map to item roles
 *
 * 1. Copies glTF files (or converts OBJ->glTF) from Quaternius packs
 *    into organized directories under assets/models/props/quaternius/
 * 2. Registers them as visual assets in the database
 * 3. Maps them to item objectRoles in the base asset collections
 *
 * Usage:
 *   npx tsx server/migrations/029-organize-quaternius-assets.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const PUBLIC_DIR = path.resolve(__dirname, '../../client/public');
const QUAT_SRC = path.join(PUBLIC_DIR, 'assets/models/Quaternius');
const QUAT_DST = path.join(PUBLIC_DIR, 'assets/models/props/quaternius');

// ─── Asset mapping: role → { source pack, source file, target name } ────────

interface AssetEntry {
  role: string;
  pack: string;
  /** Relative path within the pack to the source file (.gltf or .obj) */
  srcRelPath: string;
  /** Target filename (without extension) */
  targetName: string;
  collection: 'props' | 'furniture' | 'weapons';
  tags: string[];
}

const ASSETS: AssetEntry[] = [
  // === From Fantasy Props MegaKit (has glTF) ===
  { role: 'key', pack: 'Fantasy Props MegaKit[Standard]', srcRelPath: 'Exports/glTF/Key_Gold.gltf', targetName: 'key_gold', collection: 'props', tags: ['key', 'gold', 'fantasy'] },
  { role: 'potion', pack: 'Fantasy Props MegaKit[Standard]', srcRelPath: 'Exports/glTF/Potion_1.gltf', targetName: 'potion_1', collection: 'props', tags: ['potion', 'consumable', 'fantasy'] },
  { role: 'torch', pack: 'Fantasy Props MegaKit[Standard]', srcRelPath: 'Exports/glTF/Torch_Metal.gltf', targetName: 'torch_metal', collection: 'props', tags: ['light', 'torch', 'fantasy'] },

  // === From Sci-Fi Essentials Kit (has glTF) ===
  { role: 'revolver', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Gun_Revolver.gltf', targetName: 'gun_revolver_scifi', collection: 'weapons', tags: ['weapon', 'revolver', 'scifi'] },
  { role: 'rifle', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Gun_Rifle.gltf', targetName: 'gun_rifle_scifi', collection: 'weapons', tags: ['weapon', 'rifle', 'scifi'] },
  { role: 'grenade', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Prop_Grenade.gltf', targetName: 'grenade_scifi', collection: 'weapons', tags: ['weapon', 'grenade', 'scifi'] },
  { role: 'med_pack', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Prop_HealthPack.gltf', targetName: 'health_pack_scifi', collection: 'props', tags: ['consumable', 'medpack', 'scifi'] },
  { role: 'card', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Prop_KeyCard.gltf', targetName: 'keycard_scifi', collection: 'props', tags: ['key', 'keycard', 'scifi'] },
  { role: 'syringe', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Prop_Syringe.gltf', targetName: 'syringe_scifi', collection: 'props', tags: ['consumable', 'syringe', 'scifi'] },
  { role: 'energy_core', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Prop_Barrel1.gltf', targetName: 'energy_core_scifi', collection: 'props', tags: ['energy', 'core', 'scifi'] },
  { role: 'data_pad', pack: 'Sci-Fi Essentials Kit[Standard]', srcRelPath: 'glTF/Prop_Desk_Small.gltf', targetName: 'data_pad_scifi', collection: 'props', tags: ['datapad', 'computer', 'scifi'] },

  // === From Ultimate RPG Items Pack (OBJ → glTF conversion) ===
  { role: 'amulet', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Necklace1.obj', targetName: 'necklace_rpg', collection: 'props', tags: ['amulet', 'necklace', 'fantasy'] },
  { role: 'armor_piece', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Armor_Leather.obj', targetName: 'armor_leather', collection: 'weapons', tags: ['armor', 'leather', 'fantasy'] },
  { role: 'crown', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Crown2.obj', targetName: 'crown', collection: 'props', tags: ['crown', 'royal', 'fantasy'] },
  { role: 'gemstone', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Crystal1.obj', targetName: 'crystal', collection: 'props', tags: ['gemstone', 'crystal', 'fantasy'] },
  { role: 'ring', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Ring1.obj', targetName: 'ring_rpg', collection: 'props', tags: ['ring', 'jewelry', 'fantasy'] },
  { role: 'helmet', pack: 'RPG Asset Pack - May 2017', srcRelPath: 'OBJ/KnightHelmet.obj', targetName: 'helmet_rpg', collection: 'weapons', tags: ['helmet', 'armor', 'fantasy'] },
  { role: 'ingot', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Gold_Ingots.obj', targetName: 'gold_ingots', collection: 'props', tags: ['ingot', 'gold', 'material'] },
  { role: 'bow', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Bow_Wooden.obj', targetName: 'bow_rpg', collection: 'weapons', tags: ['weapon', 'bow', 'fantasy'] },
  { role: 'quiver', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Arrow.obj', targetName: 'arrow_quiver', collection: 'weapons', tags: ['quiver', 'arrow', 'fantasy'] },
  { role: 'chainmail', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Armor_Metal.obj', targetName: 'armor_metal', collection: 'weapons', tags: ['armor', 'chainmail', 'metal'] },
  { role: 'boots', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Glove.obj', targetName: 'glove_boots', collection: 'weapons', tags: ['armor', 'boots', 'gloves'] },
  { role: 'spool', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Scroll.obj', targetName: 'scroll_rpg', collection: 'props', tags: ['scroll', 'spool', 'fantasy'] },
  { role: 'saddle', pack: 'Ultimate RPG Items Pack - Aug 2019', srcRelPath: 'OBJ/Backpack.obj', targetName: 'backpack_saddle', collection: 'props', tags: ['backpack', 'saddle'] },

  // === From Medieval Weapons Pack (OBJ → glTF) ===
  { role: 'spear', pack: 'Medieval Weapons Pack by @Quaternius', srcRelPath: 'OBJ/Spear.obj', targetName: 'spear_medieval', collection: 'weapons', tags: ['weapon', 'spear', 'medieval'] },

  // === From Survival Pack (OBJ → glTF) ===
  { role: 'battery', pack: 'Survival Pack - Sept 2020', srcRelPath: 'OBJ/Battery_Big.obj', targetName: 'battery_survival', collection: 'props', tags: ['battery', 'material', 'survival'] },
  { role: 'dynamite', pack: 'Survival Pack - Sept 2020', srcRelPath: 'OBJ/Matchbox.obj', targetName: 'matchbox', collection: 'props', tags: ['fire', 'dynamite', 'survival'] },
  { role: 'rod', pack: 'Survival Pack - Sept 2020', srcRelPath: 'OBJ/WoodenTorch.obj', targetName: 'wooden_torch', collection: 'weapons', tags: ['tool', 'rod', 'torch'] },

];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Copy a glTF file and its companion files (.bin, textures) to dest dir */
function copyGltfWithCompanions(srcFile: string, destDir: string, targetName: string): string {
  ensureDir(destDir);
  const srcDir = path.dirname(srcFile);
  const ext = path.extname(srcFile);
  const destFile = path.join(destDir, targetName + ext);

  // Copy the main gltf file
  fs.copyFileSync(srcFile, destFile);

  // Copy companion .bin files
  const srcBaseName = path.basename(srcFile, ext);
  const binFile = path.join(srcDir, srcBaseName + '.bin');
  if (fs.existsSync(binFile)) {
    fs.copyFileSync(binFile, path.join(destDir, targetName + '.bin'));
    // Update the bin reference in the gltf file
    let gltfContent = fs.readFileSync(destFile, 'utf-8');
    gltfContent = gltfContent.replace(new RegExp(srcBaseName + '\\.bin', 'g'), targetName + '.bin');
    fs.writeFileSync(destFile, gltfContent);
  }

  // Copy texture directories if they exist
  const texturesDir = path.join(srcDir, 'textures');
  if (fs.existsSync(texturesDir)) {
    const destTextures = path.join(destDir, 'textures');
    ensureDir(destTextures);
    for (const f of fs.readdirSync(texturesDir)) {
      fs.copyFileSync(path.join(texturesDir, f), path.join(destTextures, f));
    }
  }

  return destFile;
}

/** Convert OBJ to glTF using obj2gltf */
function convertObjToGltf(srcObj: string, destDir: string, targetName: string): string | null {
  ensureDir(destDir);
  const destFile = path.join(destDir, targetName + '.gltf');

  try {
    // Check if there's an MTL file alongside
    const mtlFile = srcObj.replace('.obj', '.mtl');
    const hasMtl = fs.existsSync(mtlFile);

    console.log(`    Converting OBJ -> glTF${hasMtl ? ' (with materials)' : ''}...`);
    execSync(`npx obj2gltf -i "${srcObj}" -o "${destFile}"`, {
      timeout: 30000,
      stdio: 'pipe',
    });

    return destFile;
  } catch (error: any) {
    console.error(`    FAILED to convert: ${error.message?.substring(0, 100)}`);
    return null;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 029: Organize Quaternius Assets');
  console.log('='.repeat(60) + '\n');

  // Verify source directory exists
  if (!fs.existsSync(QUAT_SRC)) {
    console.error('ERROR: Quaternius source directory not found:', QUAT_SRC);
    process.exit(1);
  }

  // Get base collections
  const allCollections = await storage.getAllAssetCollections();
  const collectionMap: Record<string, any> = {};
  for (const c of allCollections) {
    if (c.name === 'Base Props & Objects') collectionMap['props'] = c;
    if (c.name === 'Base Furniture') collectionMap['furniture'] = c;
    if (c.name === 'Base Weapons & Tools') collectionMap['weapons'] = c;
  }

  if (!collectionMap['props'] || !collectionMap['furniture'] || !collectionMap['weapons']) {
    console.error('ERROR: Base collections not found. Run migrations 027 first.');
    process.exit(1);
  }

  // Track updates per collection
  const collectionUpdates: Record<string, { objectModels: Record<string, string>; assetIds: string[] }> = {
    props: { objectModels: {}, assetIds: [] },
    furniture: { objectModels: {}, assetIds: [] },
    weapons: { objectModels: {}, assetIds: [] },
  };

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of ASSETS) {
    console.log(`[${entry.role}] ${entry.pack} -> ${entry.targetName}`);

    // Check if already mapped
    const col = collectionMap[entry.collection];
    if (col.objectModels?.[entry.role]) {
      console.log('  Already mapped, skipping.\n');
      skipped++;
      continue;
    }

    // Find source file
    const srcFile = path.join(QUAT_SRC, entry.pack, entry.srcRelPath);
    if (!fs.existsSync(srcFile)) {
      console.error(`  Source file not found: ${srcFile}\n`);
      failed++;
      continue;
    }

    // Determine target directory
    const destDir = path.join(QUAT_DST, entry.targetName);
    let destFile: string | null;

    if (srcFile.endsWith('.gltf') || srcFile.endsWith('.glb')) {
      // Copy glTF directly
      console.log('  Copying glTF...');
      destFile = copyGltfWithCompanions(srcFile, destDir, entry.targetName);
    } else if (srcFile.endsWith('.obj')) {
      // Convert OBJ to glTF
      console.log('  Converting OBJ...');
      destFile = convertObjToGltf(srcFile, destDir, entry.targetName);
    } else {
      console.error(`  Unsupported format: ${srcFile}\n`);
      failed++;
      continue;
    }

    if (!destFile || !fs.existsSync(destFile)) {
      failed++;
      console.log('');
      continue;
    }

    // Get relative path for DB
    const relativePath = destFile.replace(PUBLIC_DIR + '/', '');
    const stat = fs.statSync(destFile);

    // Register as visual asset
    const asset = await storage.createVisualAsset({
      worldId: null,
      name: `${entry.targetName} (${entry.tags[0]})`,
      description: `Quaternius asset: ${entry.targetName} from ${entry.pack}`,
      assetType: 'model_prop',
      filePath: relativePath,
      fileName: path.basename(destFile),
      fileSize: stat.size,
      mimeType: 'model/gltf+json',
      generationProvider: 'manual',
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['quaternius', 'model', 'cc0', ...entry.tags],
      metadata: {
        source: 'quaternius',
        pack: entry.pack,
        originalFile: entry.srcRelPath,
      },
    });

    console.log(`  Registered: ${asset.id} -> ${relativePath}`);

    // Queue mapping update
    collectionUpdates[entry.collection].objectModels[entry.role] = asset.id;
    collectionUpdates[entry.collection].assetIds.push(asset.id);
    processed++;
    console.log('');
  }

  // Apply collection updates
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

  // Add alias for spool -> use spinning_wheel (already in DB from Polyhaven)
  // and saddle -> use saddle if we find one

  console.log('\n' + '='.repeat(60));
  console.log(`  Migration complete!`);
  console.log(`  Processed: ${processed} | Skipped: ${skipped} | Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
