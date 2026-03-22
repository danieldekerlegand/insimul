#!/usr/bin/env tsx
/**
 * Migration 030: Organize ALL remaining Quaternius assets
 *
 * Copies glTF files or converts OBJ→glTF for all Quaternius packs,
 * organizes them into categorized directories under assets/models/,
 * and registers them as visual assets in the database.
 *
 * Categories:
 *   props/quaternius/     — items, props, food, weapons, tools
 *   furniture/quaternius/ — furniture, interior items
 *   buildings/quaternius/ — buildings, structures
 *   characters/quaternius/ — characters, outfits
 *   animals/              — animal models (moved from characters/quaternius/)
 *   vehicles/quaternius/  — cars, trains, transport
 *
 * Usage:
 *   npx tsx server/migrations/030-organize-all-quaternius-assets.ts
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

const PUBLIC_DIR = path.resolve(__dirname, '../../client/public');
const QUAT_SRC = path.join(PUBLIC_DIR, 'assets/models/Quaternius');

const DEST_DIRS = {
  props: path.join(PUBLIC_DIR, 'assets/models/props/quaternius'),
  furniture: path.join(PUBLIC_DIR, 'assets/models/furniture/quaternius'),
  buildings: path.join(PUBLIC_DIR, 'assets/models/buildings/quaternius'),
  characters: path.join(PUBLIC_DIR, 'assets/models/characters/quaternius'),
  animals: path.join(PUBLIC_DIR, 'assets/models/animals'),
  vehicles: path.join(PUBLIC_DIR, 'assets/models/vehicles/quaternius'),
  weapons: path.join(PUBLIC_DIR, 'assets/models/props/quaternius'), // weapons go in props
  food: path.join(PUBLIC_DIR, 'assets/models/props/quaternius'),    // food goes in props
  scifi: path.join(PUBLIC_DIR, 'assets/models/props/quaternius'),   // scifi props
};

// ─── Pack definitions ────────────────────────────────────────────────────────

interface PackDef {
  packDir: string;
  /** Where to find the source files within the pack */
  gltfDir?: string;  // subdir containing .gltf files
  objDir?: string;   // subdir containing .obj files
  category: keyof typeof DEST_DIRS;
  assetType: string;
  prefix: string;    // prefix for target names to avoid collisions
  tags: string[];
  /** If set, only include files matching these patterns (case-insensitive substring match) */
  include?: string[];
  /** Exclude files matching these patterns */
  exclude?: string[];
}

const PACKS: PackDef[] = [
  // ── glTF-ready packs ──
  {
    packDir: 'Fantasy Props MegaKit[Standard]',
    gltfDir: 'Exports/glTF',
    category: 'props',
    assetType: 'model_prop',
    prefix: 'fantasy_',
    tags: ['fantasy', 'props', 'quaternius'],
    // Already organized a few; exclude those
    exclude: ['Key_Gold', 'Potion_1', 'Torch_Metal'],
  },
  {
    packDir: 'Sci-Fi Essentials Kit[Standard]',
    gltfDir: 'glTF',
    category: 'scifi',
    assetType: 'model_prop',
    prefix: 'scifi_',
    tags: ['scifi', 'quaternius'],
    exclude: ['Gun_Revolver', 'Gun_Rifle', 'Prop_Grenade', 'Prop_HealthPack', 'Prop_KeyCard', 'Prop_Syringe', 'Prop_Barrel1', 'Prop_Desk_Small'],
  },
  {
    packDir: 'Ultimate Animated Animals - July 2021',
    gltfDir: 'glTF',
    category: 'animals',
    assetType: 'model_animal',
    prefix: 'animal_',
    tags: ['animal', 'animated', 'quaternius'],
  },

  // ── OBJ-only packs (will convert) ──
  {
    packDir: 'Ultimate RPG Items Pack - Aug 2019',
    objDir: 'OBJ',
    category: 'props',
    assetType: 'model_prop',
    prefix: 'rpg_',
    tags: ['rpg', 'fantasy', 'quaternius'],
    exclude: ['Necklace1', 'Armor_Leather', 'Crown2', 'Crystal1', 'Ring1', 'Gold_Ingots',
              'Bow_Wooden', 'Arrow', 'Armor_Metal', 'Glove', 'Scroll', 'Backpack'],
  },
  {
    packDir: 'Medieval Weapons Pack by @Quaternius',
    objDir: 'OBJ',
    category: 'weapons',
    assetType: 'model_prop',
    prefix: 'medieval_',
    tags: ['medieval', 'weapon', 'quaternius'],
    exclude: ['Spear'], // already organized
  },
  {
    packDir: 'Ultimate Gun Pack - July 2019',
    objDir: 'OBJ',
    category: 'weapons',
    assetType: 'model_prop',
    prefix: 'gun_',
    tags: ['gun', 'modern', 'quaternius'],
    exclude: ['Accessories'], // skip accessories subfolder items
  },
  {
    packDir: 'Ultimate Food Pack - Oct 2019',
    objDir: 'OBJ',
    category: 'food',
    assetType: 'model_prop',
    prefix: 'food_',
    tags: ['food', 'quaternius'],
  },
  {
    packDir: 'Survival Pack - Sept 2020',
    objDir: 'OBJ',
    category: 'props',
    assetType: 'model_prop',
    prefix: 'survival_',
    tags: ['survival', 'quaternius'],
    exclude: ['Battery_Big', 'Matchbox', 'WoodenTorch'], // already organized
  },
  {
    packDir: 'Ultimate House Interior Pack - June 2020',
    objDir: 'OBJ',
    category: 'furniture',
    assetType: 'model_prop',
    prefix: 'interior_',
    tags: ['furniture', 'interior', 'quaternius'],
  },
  {
    packDir: 'Furniture Pack - March 2019',
    objDir: 'OBJ',
    category: 'furniture',
    assetType: 'model_prop',
    prefix: 'furn_',
    tags: ['furniture', 'quaternius'],
  },
  {
    packDir: 'RPG Asset Pack - May 2017',
    objDir: 'OBJ',
    category: 'props',
    assetType: 'model_prop',
    prefix: 'rpgclassic_',
    tags: ['rpg', 'fantasy', 'quaternius'],
    exclude: ['KnightHelmet', 'desktop.ini'],
  },
  {
    packDir: 'Junk Food Pack - Apr 2017',
    objDir: 'OBJ',
    category: 'food',
    assetType: 'model_prop',
    prefix: 'junkfood_',
    tags: ['food', 'junkfood', 'quaternius'],
  },
  {
    packDir: 'Buildings Pack - Jan 2019',
    objDir: 'OBJ',
    category: 'buildings',
    assetType: 'model_building',
    prefix: 'bldg_',
    tags: ['building', 'quaternius'],
  },
  {
    packDir: 'Farm Buildings - Sept 2018',
    objDir: 'OBJ',
    category: 'buildings',
    assetType: 'model_building',
    prefix: 'farm_',
    tags: ['building', 'farm', 'quaternius'],
  },
  {
    packDir: 'Public Transport Pack - Feb 2017',
    objDir: 'OBJ',
    category: 'vehicles',
    assetType: 'model_prop',
    prefix: 'transport_',
    tags: ['vehicle', 'transport', 'quaternius'],
  },
  {
    packDir: 'Realistic Car Pack - Nov 2018',
    objDir: 'OBJ',
    category: 'vehicles',
    assetType: 'model_prop',
    prefix: 'car_',
    tags: ['vehicle', 'car', 'quaternius'],
  },
  {
    packDir: 'Train Pack - April 2019',
    objDir: 'OBJ',
    category: 'vehicles',
    assetType: 'model_prop',
    prefix: 'train_',
    tags: ['vehicle', 'train', 'quaternius'],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyGltfWithCompanions(srcFile: string, destDir: string, targetName: string): string {
  ensureDir(destDir);
  const srcDir = path.dirname(srcFile);
  const ext = path.extname(srcFile);
  const destFile = path.join(destDir, targetName + ext);

  fs.copyFileSync(srcFile, destFile);

  // Copy companion .bin
  const srcBase = path.basename(srcFile, ext);
  const binFile = path.join(srcDir, srcBase + '.bin');
  if (fs.existsSync(binFile)) {
    fs.copyFileSync(binFile, path.join(destDir, targetName + '.bin'));
    let content = fs.readFileSync(destFile, 'utf-8');
    content = content.replace(new RegExp(srcBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.bin', 'g'), targetName + '.bin');
    fs.writeFileSync(destFile, content);
  }

  // Copy textures
  const texturesDir = path.join(srcDir, 'textures');
  if (fs.existsSync(texturesDir)) {
    const dt = path.join(destDir, 'textures');
    ensureDir(dt);
    for (const f of fs.readdirSync(texturesDir)) {
      fs.copyFileSync(path.join(texturesDir, f), path.join(dt, f));
    }
  }

  return destFile;
}

function convertObjToGltf(srcObj: string, destDir: string, targetName: string): string | null {
  ensureDir(destDir);
  const destFile = path.join(destDir, targetName + '.gltf');
  try {
    execSync(`npx obj2gltf -i "${srcObj}" -o "${destFile}"`, { timeout: 30000, stdio: 'pipe' });
    return destFile;
  } catch {
    return null;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 030: Organize ALL Quaternius Assets');
  console.log('='.repeat(60) + '\n');

  // Build set of already-organized target names
  const alreadyOrganized = new Set<string>();
  for (const [, destDir] of Object.entries(DEST_DIRS)) {
    if (fs.existsSync(destDir)) {
      for (const d of fs.readdirSync(destDir)) {
        alreadyOrganized.add(d);
      }
    }
  }
  console.log(`Already organized: ${alreadyOrganized.size} models\n`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  const assetsToRegister: Array<{ name: string; filePath: string; assetType: string; tags: string[]; pack: string }> = [];

  for (const pack of PACKS) {
    const packPath = path.join(QUAT_SRC, pack.packDir);
    if (!fs.existsSync(packPath)) {
      console.log(`SKIP: ${pack.packDir} (not found)\n`);
      continue;
    }

    console.log(`--- ${pack.packDir} ---`);

    // Collect source files
    let sourceFiles: string[] = [];
    if (pack.gltfDir) {
      const gltfPath = path.join(packPath, pack.gltfDir);
      if (fs.existsSync(gltfPath)) {
        sourceFiles = fs.readdirSync(gltfPath)
          .filter(f => f.endsWith('.gltf') || f.endsWith('.glb'))
          .map(f => path.join(gltfPath, f));
      }
    } else if (pack.objDir) {
      const objPath = path.join(packPath, pack.objDir);
      if (fs.existsSync(objPath)) {
        sourceFiles = fs.readdirSync(objPath)
          .filter(f => f.endsWith('.obj'))
          .map(f => path.join(objPath, f));
      }
    }

    if (sourceFiles.length === 0) {
      console.log(`  No source files found\n`);
      continue;
    }

    let packProcessed = 0;
    let packSkipped = 0;

    for (const srcFile of sourceFiles) {
      const baseName = path.basename(srcFile, path.extname(srcFile));
      const targetName = pack.prefix + baseName.toLowerCase().replace(/\s+/g, '_');

      // Check excludes
      if (pack.exclude?.some(ex => baseName.includes(ex))) {
        packSkipped++;
        continue;
      }

      // Check includes
      if (pack.include && !pack.include.some(inc => baseName.toLowerCase().includes(inc.toLowerCase()))) {
        packSkipped++;
        continue;
      }

      // Check if already organized
      if (alreadyOrganized.has(targetName)) {
        packSkipped++;
        continue;
      }

      const destDir = path.join(DEST_DIRS[pack.category], targetName);
      let destFile: string | null = null;

      if (srcFile.endsWith('.gltf') || srcFile.endsWith('.glb')) {
        destFile = copyGltfWithCompanions(srcFile, destDir, targetName);
      } else if (srcFile.endsWith('.obj')) {
        destFile = convertObjToGltf(srcFile, destDir, targetName);
      }

      if (destFile && fs.existsSync(destFile)) {
        const relativePath = destFile.replace(PUBLIC_DIR + '/', '');
        assetsToRegister.push({
          name: baseName.replace(/_/g, ' '),
          filePath: relativePath,
          assetType: pack.assetType,
          tags: pack.tags,
          pack: pack.packDir,
        });
        alreadyOrganized.add(targetName);
        packProcessed++;
      } else {
        totalFailed++;
      }
    }

    console.log(`  Processed: ${packProcessed} | Skipped: ${packSkipped}`);
    totalProcessed += packProcessed;
    totalSkipped += packSkipped;
    console.log('');
  }

  // ── Register all assets in the database ──
  console.log(`\nRegistering ${assetsToRegister.length} assets in database...`);

  let registered = 0;
  for (const a of assetsToRegister) {
    try {
      const fullPath = path.join(PUBLIC_DIR, a.filePath);
      const stat = fs.statSync(fullPath);
      await storage.createVisualAsset({
        worldId: null,
        name: `${a.name} (${a.tags[0]})`,
        description: `Quaternius: ${a.name} from ${a.pack}`,
        assetType: a.assetType,
        filePath: a.filePath,
        fileName: path.basename(a.filePath),
        fileSize: stat.size,
        mimeType: a.filePath.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json',
        generationProvider: 'manual',
        purpose: 'procedural',
        usageContext: '3d_game',
        tags: ['quaternius', 'model', 'cc0', ...a.tags],
        metadata: { source: 'quaternius', pack: a.pack },
      });
      registered++;
      if (registered % 50 === 0) console.log(`  ...${registered} registered`);
    } catch (err: any) {
      console.error(`  Failed to register ${a.name}: ${err.message?.substring(0, 80)}`);
    }
  }

  console.log(`  Registered: ${registered}\n`);

  console.log('='.repeat(60));
  console.log(`  Migration complete!`);
  console.log(`  Organized: ${totalProcessed} | Skipped: ${totalSkipped} | Failed: ${totalFailed}`);
  console.log(`  Registered in DB: ${registered}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
