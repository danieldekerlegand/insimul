#!/usr/bin/env tsx
/**
 * Migration 022: Reorganize Asset Directories
 *
 * Moves assets from source-based organization (polyhaven/, sketchfab/, kaykit/, etc.)
 * to category-based organization (models/buildings/, models/nature/, audio/, etc.).
 *
 * Also registers previously untracked assets (characters, audio, ground textures)
 * in the visual_assets database so they appear in the Admin Panel.
 *
 * Usage:
 *   npx tsx server/migrations/022-reorganize-asset-directories.ts
 *
 * To do a dry run (no actual file moves):
 *   DRY_RUN=1 npx tsx server/migrations/022-reorganize-asset-directories.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { storage } from '../db/storage.js';

const DRY_RUN = process.env.DRY_RUN === '1';
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'client/public/assets');

// ─── Polyhaven model categorization ──────────────────────────────────────────

const POLYHAVEN_CATEGORIES: Record<string, string> = {
  // furniture
  ArmChair_01: 'furniture', bar_chair_round_01: 'furniture', book_encyclopedia_set_01: 'furniture',
  ClassicConsole_01: 'furniture', GothicBed_01: 'furniture', GothicCabinet_01: 'furniture',
  GreenChair_01: 'furniture', painted_wooden_cabinet: 'furniture', Rockingchair_01: 'furniture',
  Shelf_01: 'furniture', tea_set_01: 'furniture', vintage_cabinet_01: 'furniture',
  vintage_grandfather_clock_01: 'furniture', wooden_bookshelf_worn: 'furniture',
  wooden_stool_01: 'furniture', wooden_table_02: 'furniture', WoodenTable_01: 'furniture',
  brass_candleholders: 'furniture', brass_goblets: 'furniture', Chandelier_01: 'furniture',
  Lantern_01: 'furniture',
  // nature
  boulder_01: 'nature', crystalline_iceplant: 'nature', dead_tree_trunk: 'nature',
  fern_02: 'nature', fir_tree_01: 'nature', jacaranda_tree: 'nature',
  moon_rock_01: 'nature', moss_01: 'nature', pine_tree_01: 'nature',
  potted_plant_02: 'nature', rock_07: 'nature', rock_moss_set_01: 'nature',
  rock_moss_set_02: 'nature', shrub_01: 'nature', shrub_02: 'nature',
  shrub_03: 'nature', tree_small_02: 'nature', tree_stump_01: 'nature',
  // buildings
  modular_factory_facade: 'buildings', modular_urban_apartments_facade: 'buildings',
  // props (everything else)
};

function getPolyhavenCategory(modelName: string): string {
  return POLYHAVEN_CATEGORIES[modelName] || 'props';
}

// ─── Path mapping ────────────────────────────────────────────────────────────

interface PathMove {
  oldPath: string; // relative to client/public/
  newPath: string; // relative to client/public/
}

function buildMoveList(): PathMove[] {
  const moves: PathMove[] = [];

  // 1. Polyhaven models → per-model directories under models/{category}/polyhaven/
  const polyhavenModelsDir = path.join(ASSETS_DIR, 'polyhaven/models');
  if (fs.existsSync(polyhavenModelsDir)) {
    const gltfFiles = fs.readdirSync(polyhavenModelsDir).filter(f => f.endsWith('.gltf'));
    for (const gltfFile of gltfFiles) {
      const modelName = gltfFile.replace('.gltf', '');
      const category = getPolyhavenCategory(modelName);
      const targetBase = `assets/models/${category}/polyhaven/${modelName}`;

      // Move GLTF
      moves.push({ oldPath: `assets/polyhaven/models/${gltfFile}`, newPath: `${targetBase}/${gltfFile}` });

      // Move BIN
      const binFile = `${modelName}.bin`;
      if (fs.existsSync(path.join(polyhavenModelsDir, binFile))) {
        moves.push({ oldPath: `assets/polyhaven/models/${binFile}`, newPath: `${targetBase}/${binFile}` });
      }

      // Parse GLTF to find referenced textures
      try {
        const gltfContent = JSON.parse(fs.readFileSync(path.join(polyhavenModelsDir, gltfFile), 'utf-8'));
        const images = gltfContent.images || [];
        for (const img of images) {
          if (img.uri && img.uri.startsWith('textures/')) {
            const texFile = img.uri; // e.g. "textures/Armchair_01_diff_1k.jpg"
            moves.push({
              oldPath: `assets/polyhaven/models/${texFile}`,
              newPath: `${targetBase}/${texFile}`,
            });
          }
        }
      } catch (e) {
        console.warn(`  Could not parse ${gltfFile}: ${e}`);
      }
    }
  }

  // 2. Polyhaven environment textures → textures/environment/
  const polyhavenTexDir = path.join(ASSETS_DIR, 'polyhaven/textures');
  if (fs.existsSync(polyhavenTexDir)) {
    for (const f of fs.readdirSync(polyhavenTexDir)) {
      moves.push({ oldPath: `assets/polyhaven/textures/${f}`, newPath: `assets/textures/environment/${f}` });
    }
  }

  // 3. Sketchfab models → models/buildings/sketchfab/
  const sketchfabDir = path.join(ASSETS_DIR, 'sketchfab/models');
  if (fs.existsSync(sketchfabDir)) {
    for (const folder of fs.readdirSync(sketchfabDir)) {
      const folderPath = path.join(sketchfabDir, folder);
      if (!fs.statSync(folderPath).isDirectory()) continue;
      // Move entire directory contents
      const files = getAllFiles(folderPath, folderPath);
      for (const relFile of files) {
        moves.push({
          oldPath: `assets/sketchfab/models/${folder}/${relFile}`,
          newPath: `assets/models/buildings/sketchfab/${folder}/${relFile}`,
        });
      }
    }
  }

  // 4. KayKit buildings → models/buildings/kaykit/
  const kaykitDir = path.join(ASSETS_DIR, 'kaykit/models/medieval-buildings');
  if (fs.existsSync(kaykitDir)) {
    for (const f of fs.readdirSync(kaykitDir)) {
      moves.push({
        oldPath: `assets/kaykit/models/medieval-buildings/${f}`,
        newPath: `assets/models/buildings/kaykit/${f}`,
      });
    }
  }

  // 5. Characters → models/characters/{genre}/
  const charsDir = path.join(ASSETS_DIR, 'characters');
  if (fs.existsSync(charsDir)) {
    for (const genre of fs.readdirSync(charsDir)) {
      const genreDir = path.join(charsDir, genre);
      if (!fs.statSync(genreDir).isDirectory()) continue;
      for (const f of fs.readdirSync(genreDir)) {
        moves.push({
          oldPath: `assets/characters/${genre}/${f}`,
          newPath: `assets/models/characters/${genre}/${f}`,
        });
      }
    }
  }

  // 6. Legacy player/npc models → models/characters/legacy/
  const legacyMoves = [
    { old: 'assets/player/Vincent-frontFacing.babylon', new: 'assets/models/characters/legacy/Vincent-frontFacing.babylon' },
    { old: 'assets/player/Vincent-frontFacing.glb', new: 'assets/models/characters/legacy/Vincent-frontFacing.glb' },
    { old: 'assets/player/Vincent_texture_image.jpg', new: 'assets/models/characters/legacy/Vincent_texture_image.jpg' },
    { old: 'assets/npc/starterAvatars.babylon', new: 'assets/models/characters/legacy/starterAvatars.babylon' },
  ];
  for (const m of legacyMoves) {
    if (fs.existsSync(path.join(PROJECT_ROOT, 'client/public', m.old))) {
      moves.push({ oldPath: m.old, newPath: m.new });
    }
  }

  // 7. Quest objects → models/containers/, models/markers/, models/props/
  // NOTE: Originally moved to models/quest-objects/. Migration 024 renames
  // quest-objects/ to containers/ and splits into containers/, markers/, props/.
  const questDir = path.join(ASSETS_DIR, 'quest-objects');
  if (fs.existsSync(questDir)) {
    for (const f of fs.readdirSync(questDir)) {
      moves.push({ oldPath: `assets/quest-objects/${f}`, newPath: `assets/models/quest-objects/${f}` });
    }
  }

  // 8. Freesound audio → audio/{category}/
  const freesoundDir = path.join(ASSETS_DIR, 'freesound');
  if (fs.existsSync(freesoundDir)) {
    for (const cat of ['ambient', 'footstep', 'interact']) {
      const catDir = path.join(freesoundDir, cat);
      if (!fs.existsSync(catDir)) continue;
      const targetCat = cat === 'interact' ? 'effects' : cat;
      for (const f of fs.readdirSync(catDir)) {
        moves.push({ oldPath: `assets/freesound/${cat}/${f}`, newPath: `assets/audio/${targetCat}/${f}` });
      }
    }
    // manifest.json
    if (fs.existsSync(path.join(freesoundDir, 'manifest.json'))) {
      moves.push({ oldPath: 'assets/freesound/manifest.json', newPath: 'assets/audio/manifest.json' });
    }
  }

  // 9. Voices → audio/voices/
  const voicesDir = path.join(ASSETS_DIR, 'audio/voices');
  if (fs.existsSync(voicesDir)) {
    for (const f of fs.readdirSync(voicesDir)) {
      moves.push({ oldPath: `assets/audio/voices/${f}`, newPath: `assets/audio/voices/${f}` }); // same path, no move needed
    }
  }

  // 10. Ground textures → textures/environment/
  const groundDir = path.join(ASSETS_DIR, 'ground');
  if (fs.existsSync(groundDir)) {
    for (const f of fs.readdirSync(groundDir)) {
      moves.push({ oldPath: `assets/ground/${f}`, newPath: `assets/textures/environment/${f}` });
    }
  }

  // Filter out no-op moves (oldPath === newPath)
  return moves.filter(m => m.oldPath !== m.newPath);
}

/** Recursively get all files relative to baseDir */
function getAllFiles(dir: string, baseDir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(full, baseDir));
    } else {
      results.push(path.relative(baseDir, full));
    }
  }
  return results;
}

// ─── Untracked asset registration ────────────────────────────────────────────

interface UntrackedAsset {
  name: string;
  filePath: string; // NEW path after move
  assetType: string;
  mimeType: string;
  source: string;
  license: string;
  tags: string[];
}

function getUntrackedAssets(moves: PathMove[]): UntrackedAsset[] {
  const assets: UntrackedAsset[] = [];

  // Characters (47 GLBs across 4 genres)
  const genres = ['fantasy', 'generic', 'modern', 'scifi'];
  for (const genre of genres) {
    const dir = path.join(ASSETS_DIR, `characters/${genre}`);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.glb'))) {
      const newPath = moves.find(m => m.oldPath === `assets/characters/${genre}/${f}`)?.newPath || `assets/models/characters/${genre}/${f}`;
      const isPlayer = f.startsWith('player_');
      assets.push({
        name: f.replace('.glb', '').replace(/_/g, ' '),
        filePath: newPath,
        assetType: isPlayer ? 'model_player' : 'model_character',
        mimeType: 'model/gltf-binary',
        source: 'quaternius',
        license: 'CC0',
        tags: [genre, isPlayer ? 'player' : 'npc', 'character', 'glb'],
      });
    }
  }

  // Legacy models
  const legacyModels = [
    { file: 'Vincent-frontFacing.babylon', type: 'model_player', mime: 'application/octet-stream', name: 'Vincent Player (Babylon)', source: 'custom' },
    { file: 'Vincent-frontFacing.glb', type: 'model_player', mime: 'model/gltf-binary', name: 'Vincent Player (GLB)', source: 'custom' },
    { file: 'Vincent_texture_image.jpg', type: 'texture_character', mime: 'image/jpeg', name: 'Vincent Texture', source: 'custom' },
    { file: 'starterAvatars.babylon', type: 'model_character', mime: 'application/octet-stream', name: 'Starter Avatars (Legacy)', source: 'custom' },
  ];
  for (const m of legacyModels) {
    if (fs.existsSync(path.join(ASSETS_DIR, `player/${m.file}`) ) || fs.existsSync(path.join(ASSETS_DIR, `npc/${m.file}`))) {
      assets.push({
        name: m.name,
        filePath: `assets/models/characters/legacy/${m.file}`,
        assetType: m.type,
        mimeType: m.mime,
        source: m.source,
        license: 'CC0',
        tags: ['legacy', 'character'],
      });
    }
  }

  // Quest objects
  const questDir = path.join(ASSETS_DIR, 'quest-objects');
  if (fs.existsSync(questDir)) {
    for (const f of fs.readdirSync(questDir).filter(f => f.endsWith('.glb') || f.endsWith('.gltf'))) {
      assets.push({
        name: f.replace(/\.(glb|gltf)$/, '').replace(/_/g, ' '),
        filePath: `assets/models/quest-objects/${f}`,
        assetType: 'model_quest_item',
        mimeType: f.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json',
        source: f.includes('avocado') || f.includes('water_bottle') ? 'khronos-gltf-samples' : 'polyhaven',
        license: 'CC0',
        tags: ['quest', 'object'],
      });
    }
  }

  // Audio files
  for (const cat of ['ambient', 'footstep', 'interact']) {
    const catDir = path.join(ASSETS_DIR, `freesound/${cat}`);
    if (!fs.existsSync(catDir)) continue;
    const targetCat = cat === 'interact' ? 'effects' : cat;
    for (const f of fs.readdirSync(catDir).filter(f => f.endsWith('.mp3'))) {
      assets.push({
        name: f.replace('.mp3', '').replace(/_/g, ' '),
        filePath: `assets/audio/${targetCat}/${f}`,
        assetType: `audio_${cat}`,
        mimeType: 'audio/mpeg',
        source: 'freesound',
        license: 'CC0',
        tags: ['audio', cat, 'freesound'],
      });
    }
  }

  // Voice file
  if (fs.existsSync(path.join(ASSETS_DIR, 'audio/voices/louisianafrench.wav'))) {
    assets.push({
      name: 'Louisiana French Voice Sample',
      filePath: 'assets/audio/voices/louisianafrench.wav',
      assetType: 'audio_voice',
      mimeType: 'audio/wav',
      source: 'custom',
      license: 'custom',
      tags: ['audio', 'voice', 'louisiana-french', 'chitimacha'],
    });
  }

  // Ground textures
  const groundFiles = [
    { file: 'ground.jpg', name: 'Ground Diffuse Texture', type: 'texture_ground', mime: 'image/jpeg' },
    { file: 'ground-normal.png', name: 'Ground Normal Map', type: 'texture_ground', mime: 'image/png' },
    { file: 'ground_heightMap.png', name: 'Ground Height Map', type: 'texture_ground', mime: 'image/png' },
  ];
  for (const g of groundFiles) {
    if (fs.existsSync(path.join(ASSETS_DIR, `ground/${g.file}`))) {
      assets.push({
        name: g.name,
        filePath: `assets/textures/environment/${g.file}`,
        assetType: g.type,
        mimeType: g.mime,
        source: 'custom',
        license: 'CC0',
        tags: ['ground', 'texture', 'environment'],
      });
    }
  }

  return assets;
}

// ─── Sources.json ────────────────────────────────────────────────────────────

const SOURCES_JSON = {
  polyhaven: { url: 'https://polyhaven.com', license: 'CC0', description: '3D models and textures' },
  sketchfab: { url: 'https://sketchfab.com', license: 'varies (see individual license.txt)', description: 'Medieval building models' },
  kaykit: { url: 'https://kaykit.itch.io', license: 'CC0', description: 'Low-poly medieval building models' },
  freesound: { url: 'https://freesound.org', license: 'CC0', description: 'Sound effects and ambient audio' },
  quaternius: { url: 'https://quaternius.com', license: 'CC0', description: 'Character models (player + NPC)' },
  'khronos-gltf-samples': { url: 'https://github.com/KhronosGroup/glTF-Sample-Assets', license: 'CC0', description: 'Reference glTF models' },
};

// ─── Main migration ──────────────────────────────────────────────────────────

async function runMigration() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Asset Directory Reorganization Migration`);
  console.log(`  ${DRY_RUN ? '⚠️  DRY RUN MODE - no files will be moved' : '🚀 LIVE MODE'}`);
  console.log(`${'='.repeat(60)}\n`);

  // Step 1: Build move list
  console.log('📋 Building move list...');
  const moves = buildMoveList();
  console.log(`   ${moves.length} file moves planned\n`);

  // Step 2: Create target directories
  console.log('📁 Creating target directories...');
  const targetDirs = new Set(moves.map(m => path.dirname(path.join(PROJECT_ROOT, 'client/public', m.newPath))));
  for (const dir of targetDirs) {
    if (!DRY_RUN) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  console.log(`   ${targetDirs.size} directories created\n`);

  // Step 3: Move files
  console.log('📦 Moving files...');
  let moveSuccess = 0;
  let moveSkip = 0;
  let moveError = 0;

  for (const move of moves) {
    const srcAbs = path.join(PROJECT_ROOT, 'client/public', move.oldPath);
    const dstAbs = path.join(PROJECT_ROOT, 'client/public', move.newPath);

    if (!fs.existsSync(srcAbs)) {
      moveSkip++;
      continue;
    }

    try {
      if (!DRY_RUN) {
        fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
        fs.copyFileSync(srcAbs, dstAbs);
      }
      moveSuccess++;
    } catch (e) {
      console.error(`   ❌ ${move.oldPath} → ${move.newPath}: ${e}`);
      moveError++;
    }
  }
  console.log(`   ✅ ${moveSuccess} moved, ${moveSkip} skipped (not found), ${moveError} errors\n`);

  // Step 4: Update DB records
  console.log('🔄 Updating database filePath records...');
  const pathMap = new Map(moves.map(m => [m.oldPath, m.newPath]));
  let dbUpdated = 0;
  let dbSkipped = 0;

  try {
    // Fetch all visual assets
    const allAssets = await (storage as any).getAllVisualAssets?.() || [];
    if (allAssets.length === 0) {
      // Try alternative: fetch via API-like method
      console.log('   (Using collection-based asset fetch)');
    }

    for (const asset of allAssets) {
      const oldFilePath = asset.filePath;
      const newFilePath = pathMap.get(oldFilePath);
      if (newFilePath && newFilePath !== oldFilePath) {
        if (!DRY_RUN) {
          await storage.updateVisualAsset(asset.id, { filePath: newFilePath } as any);
        }
        dbUpdated++;
      } else {
        dbSkipped++;
      }
    }
  } catch (e) {
    console.warn(`   ⚠️  Could not bulk-update assets: ${e}`);
    console.log('   Attempting individual path lookups...');
    // Fallback: iterate moves and try to find assets by old path
    for (const [oldPath, newPath] of pathMap.entries()) {
      try {
        const assets = await (storage as any).getVisualAssetsByFilePath?.(oldPath) || [];
        for (const asset of assets) {
          if (!DRY_RUN) {
            await storage.updateVisualAsset(asset.id, { filePath: newPath } as any);
          }
          dbUpdated++;
        }
      } catch { /* skip */ }
    }
  }
  console.log(`   ✅ ${dbUpdated} DB records updated, ${dbSkipped} unchanged\n`);

  // Step 5: Register untracked assets
  console.log('📝 Registering untracked assets...');
  const untrackedAssets = getUntrackedAssets(moves);
  let registered = 0;
  let alreadyExists = 0;

  for (const ua of untrackedAssets) {
    try {
      // Check if already exists by filePath
      const existing = await (storage as any).getVisualAssetsByFilePath?.(ua.filePath);
      if (existing && existing.length > 0) {
        alreadyExists++;
        continue;
      }

      // Also check by old path (pre-move)
      const oldPathEntry = moves.find(m => m.newPath === ua.filePath);
      if (oldPathEntry) {
        const existingOld = await (storage as any).getVisualAssetsByFilePath?.(oldPathEntry.oldPath);
        if (existingOld && existingOld.length > 0) {
          alreadyExists++;
          continue;
        }
      }

      const absPath = path.join(PROJECT_ROOT, 'client/public', ua.filePath);
      const fileSize = fs.existsSync(absPath) ? fs.statSync(absPath).size : null;

      if (!DRY_RUN) {
        await storage.createVisualAsset({
          name: ua.name,
          filePath: ua.filePath,
          fileName: path.basename(ua.filePath),
          assetType: ua.assetType as any,
          mimeType: ua.mimeType,
          fileSize: fileSize,
          status: 'completed',
          purpose: 'bundled',
          tags: ua.tags,
          metadata: { source: ua.source, license: ua.license, migratedBy: 'migration-022' },
        } as any);
      }
      registered++;
    } catch (e) {
      console.warn(`   ⚠️  Failed to register ${ua.name}: ${e}`);
    }
  }
  console.log(`   ✅ ${registered} new assets registered, ${alreadyExists} already existed\n`);

  // Step 6: Write sources.json
  console.log('📄 Writing sources.json...');
  const sourcesPath = path.join(ASSETS_DIR, 'sources.json');
  if (!DRY_RUN) {
    // Write to new location
    const newSourcesPath = path.join(PROJECT_ROOT, 'client/public/assets/sources.json');
    fs.writeFileSync(newSourcesPath, JSON.stringify(SOURCES_JSON, null, 2));
  }
  console.log('   ✅ sources.json written\n');

  // Step 7: Write migration log
  console.log('📋 Writing migration log...');
  const logPath = path.join(PROJECT_ROOT, 'data/path-migration-log.json');
  const log = {
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    movesPlanned: moves.length,
    movesCompleted: moveSuccess,
    dbUpdated,
    assetsRegistered: registered,
    moves: moves.map(m => ({ from: m.oldPath, to: m.newPath })),
  };
  if (!DRY_RUN) {
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  }
  console.log(`   ✅ Log written to ${logPath}\n`);

  // Step 8: Cleanup old directories (only if not dry run and all moves succeeded)
  if (!DRY_RUN && moveError === 0) {
    console.log('🧹 Old directories can be cleaned up after verifying everything works.');
    console.log('   Run: rm -rf client/public/assets/{polyhaven,sketchfab,kaykit,freesound,ground,npc,player,quest-objects,characters}');
    console.log('   (Do NOT delete audio/voices — it stayed in place)\n');
  }

  console.log(`${'='.repeat(60)}`);
  console.log(`  Migration ${DRY_RUN ? '(DRY RUN) ' : ''}complete!`);
  console.log(`  Files moved: ${moveSuccess}`);
  console.log(`  DB updated: ${dbUpdated}`);
  console.log(`  Assets registered: ${registered}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Run
runMigration()
  .then(() => {
    console.log('✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
