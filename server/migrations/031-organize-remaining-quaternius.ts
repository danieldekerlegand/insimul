#!/usr/bin/env tsx
/**
 * Migration 031: Organize remaining Quaternius assets
 *
 * Covers packs missed by migration 030:
 *   - Universal Base Characters (Godot glTF)
 *   - Universal Animation Libraries (Godot glb)
 *   - Modular Character Outfits (Godot glTF)
 *   - Medieval Village MegaKit (structural)
 *   - Modular Medieval Buildings (structural, OBJ→glTF)
 *   - Modular SciFi MegaKit (structural + props)
 *
 * Usage:
 *   npx tsx server/migrations/031-organize-remaining-quaternius.ts
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

// ─── Dest dirs ───────────────────────────────────────────────────────────────

const DEST = {
  characters: path.join(PUBLIC_DIR, 'assets/models/characters/quaternius'),
  structural: path.join(PUBLIC_DIR, 'assets/models/structural/quaternius'),
  props: path.join(PUBLIC_DIR, 'assets/models/props/quaternius'),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyWithCompanions(srcFile: string, destDir: string, targetName: string): string {
  ensureDir(destDir);
  const srcDir = path.dirname(srcFile);
  const ext = path.extname(srcFile);
  const destFile = path.join(destDir, targetName + ext);
  fs.copyFileSync(srcFile, destFile);

  const srcBase = path.basename(srcFile, ext);

  // Copy .bin companion
  const binFile = path.join(srcDir, srcBase + '.bin');
  if (fs.existsSync(binFile)) {
    fs.copyFileSync(binFile, path.join(destDir, targetName + '.bin'));
    if (ext === '.gltf') {
      let content = fs.readFileSync(destFile, 'utf-8');
      content = content.replace(
        new RegExp(srcBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.bin', 'g'),
        targetName + '.bin'
      );
      fs.writeFileSync(destFile, content);
    }
  }

  // Copy textures dir
  const texDir = path.join(srcDir, 'textures');
  if (fs.existsSync(texDir)) {
    const dt = path.join(destDir, 'textures');
    ensureDir(dt);
    for (const f of fs.readdirSync(texDir)) fs.copyFileSync(path.join(texDir, f), path.join(dt, f));
  }

  return destFile;
}

function convertObj(srcObj: string, destDir: string, targetName: string): string | null {
  ensureDir(destDir);
  const destFile = path.join(destDir, targetName + '.gltf');
  try {
    execSync(`npx obj2gltf -i "${srcObj}" -o "${destFile}"`, { timeout: 30000, stdio: 'pipe' });
    return destFile;
  } catch { return null; }
}

// ─── Source definitions ─────────────────────────────────────────────────────

interface SourceEntry {
  srcFile: string;
  targetName: string;
  destDir: string;
  assetType: string;
  tags: string[];
  pack: string;
}

function collectEntries(): SourceEntry[] {
  const entries: SourceEntry[] = [];

  // ── Universal Base Characters ──
  const ubcBase = path.join(QUAT_SRC, 'Universal Base Characters[Standard]');
  if (fs.existsSync(ubcBase)) {
    // Full body characters
    const godotChars = path.join(ubcBase, 'Base Characters/Godot - UE');
    if (fs.existsSync(godotChars)) {
      for (const f of fs.readdirSync(godotChars).filter(f => f.endsWith('.gltf'))) {
        const base = path.basename(f, '.gltf');
        entries.push({
          srcFile: path.join(godotChars, f),
          targetName: 'char_' + base.toLowerCase().replace(/\s+/g, '_'),
          destDir: DEST.characters,
          assetType: 'model_character',
          tags: ['character', 'base', 'quaternius'],
          pack: 'Universal Base Characters[Standard]',
        });
      }
    }
    // Hairstyles (use "Origin at 0" versions)
    const hairDir = path.join(ubcBase, 'Hairstyles/Origin at 0/glTF (Godot)');
    if (fs.existsSync(hairDir)) {
      for (const f of fs.readdirSync(hairDir).filter(f => f.endsWith('.gltf'))) {
        const base = path.basename(f, '.gltf');
        entries.push({
          srcFile: path.join(hairDir, f),
          targetName: 'hair_' + base.toLowerCase().replace(/\s+/g, '_'),
          destDir: DEST.characters,
          assetType: 'model_character',
          tags: ['character', 'hairstyle', 'quaternius'],
          pack: 'Universal Base Characters[Standard]',
        });
      }
    }
  }

  // ── Universal Animation Library ──
  const ual1 = path.join(QUAT_SRC, 'Universal Animation Library[Standard]/Unreal-Godot');
  if (fs.existsSync(ual1)) {
    for (const f of fs.readdirSync(ual1).filter(f => f.endsWith('.glb') || f.endsWith('.gltf'))) {
      const base = path.basename(f, path.extname(f));
      entries.push({
        srcFile: path.join(ual1, f),
        targetName: 'anim_' + base.toLowerCase().replace(/\s+/g, '_'),
        destDir: DEST.characters,
        assetType: 'model_character',
        tags: ['animation', 'library', 'quaternius'],
        pack: 'Universal Animation Library[Standard]',
      });
    }
  }

  // ── Universal Animation Library 2 ──
  const ual2Base = path.join(QUAT_SRC, 'Universal Animation Library 2[Standard]');
  if (fs.existsSync(ual2Base)) {
    const ual2Main = path.join(ual2Base, 'Unreal-Godot');
    if (fs.existsSync(ual2Main)) {
      for (const f of fs.readdirSync(ual2Main).filter(f => f.endsWith('.glb') || f.endsWith('.gltf'))) {
        const base = path.basename(f, path.extname(f));
        entries.push({
          srcFile: path.join(ual2Main, f),
          targetName: 'anim2_' + base.toLowerCase().replace(/\s+/g, '_'),
          destDir: DEST.characters,
          assetType: 'model_character',
          tags: ['animation', 'library', 'quaternius'],
          pack: 'Universal Animation Library 2[Standard]',
        });
      }
    }
    const ual2Fem = path.join(ual2Base, 'Female Mannequin/Unreal-Godot');
    if (fs.existsSync(ual2Fem)) {
      for (const f of fs.readdirSync(ual2Fem).filter(f => f.endsWith('.glb') || f.endsWith('.gltf'))) {
        const base = path.basename(f, path.extname(f));
        entries.push({
          srcFile: path.join(ual2Fem, f),
          targetName: 'anim2_' + base.toLowerCase().replace(/\s+/g, '_'),
          destDir: DEST.characters,
          assetType: 'model_character',
          tags: ['animation', 'library', 'female', 'quaternius'],
          pack: 'Universal Animation Library 2[Standard]',
        });
      }
    }
  }

  // ── Modular Character Outfits - Fantasy ──
  const outfitsBase = path.join(QUAT_SRC, 'Modular Character Outfits - Fantasy[Standard]/Exports/glTF (Godot-Unreal)');
  if (fs.existsSync(outfitsBase)) {
    for (const subdir of ['Outfits', 'Modular Parts']) {
      const dir = path.join(outfitsBase, subdir);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.gltf'))) {
        const base = path.basename(f, '.gltf');
        entries.push({
          srcFile: path.join(dir, f),
          targetName: 'outfit_' + base.toLowerCase().replace(/\s+/g, '_'),
          destDir: DEST.characters,
          assetType: 'model_character',
          tags: ['character', 'outfit', 'fantasy', 'quaternius'],
          pack: 'Modular Character Outfits - Fantasy[Standard]',
        });
      }
    }
  }

  // ── Medieval Village MegaKit (structural) ──
  const mvGltf = path.join(QUAT_SRC, 'Medieval Village MegaKit[Standard]');
  if (fs.existsSync(mvGltf)) {
    // Find the glTF directory
    const gltfDirs = ['Exports/glTF', 'glTF'];
    for (const gd of gltfDirs) {
      const dir = path.join(mvGltf, gd);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.gltf'))) {
        const base = path.basename(f, '.gltf');
        entries.push({
          srcFile: path.join(dir, f),
          targetName: 'medvillage_' + base.toLowerCase().replace(/\s+/g, '_'),
          destDir: DEST.structural,
          assetType: 'model_building',
          tags: ['structural', 'medieval', 'village', 'modular', 'quaternius'],
          pack: 'Medieval Village MegaKit[Standard]',
        });
      }
    }
  }

  // ── Modular Medieval Buildings (structural, OBJ) ──
  const mmbObj = path.join(QUAT_SRC, 'Modular Medieval Buildings - Jul 2017/OBJ');
  if (fs.existsSync(mmbObj)) {
    for (const f of fs.readdirSync(mmbObj).filter(f => f.endsWith('.obj'))) {
      const base = path.basename(f, '.obj');
      entries.push({
        srcFile: path.join(mmbObj, f),
        targetName: 'medbuilding_' + base.toLowerCase().replace(/\s+/g, '_'),
        destDir: DEST.structural,
        assetType: 'model_building',
        tags: ['structural', 'medieval', 'castle', 'modular', 'quaternius'],
        pack: 'Modular Medieval Buildings - Jul 2017',
      });
    }
  }

  // ── Modular SciFi MegaKit (structural + props) ──
  const scifiBase = path.join(QUAT_SRC, 'Modular SciFi MegaKit[Standard]/glTF');
  if (fs.existsSync(scifiBase)) {
    // Walk all subdirectories
    const walkDir = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          walkDir(path.join(dir, entry.name));
        } else if (entry.name.endsWith('.gltf')) {
          const base = path.basename(entry.name, '.gltf');
          // Determine if prop or structural based on subdirectory
          const relDir = path.relative(scifiBase, dir);
          const isProp = relDir.startsWith('Props') || relDir.startsWith('Alien');
          entries.push({
            srcFile: path.join(dir, entry.name),
            targetName: 'scifimod_' + base.toLowerCase().replace(/\s+/g, '_'),
            destDir: isProp ? DEST.props : DEST.structural,
            assetType: isProp ? 'model_prop' : 'model_building',
            tags: ['structural', 'scifi', 'modular', 'quaternius'],
            pack: 'Modular SciFi MegaKit[Standard]',
          });
        }
      }
    };
    walkDir(scifiBase);
  }

  return entries;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 031: Organize Remaining Quaternius Assets');
  console.log('='.repeat(60) + '\n');

  const entries = collectEntries();
  console.log(`Found ${entries.length} assets to process\n`);

  // Build set of already-organized names
  const alreadyDone = new Set<string>();
  for (const destDir of Object.values(DEST)) {
    if (fs.existsSync(destDir)) {
      for (const d of fs.readdirSync(destDir)) alreadyDone.add(d);
    }
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  const toRegister: Array<{ name: string; filePath: string; assetType: string; tags: string[]; pack: string }> = [];

  for (const entry of entries) {
    if (alreadyDone.has(entry.targetName)) {
      skipped++;
      continue;
    }

    const destSubDir = path.join(entry.destDir, entry.targetName);
    let destFile: string | null = null;

    if (entry.srcFile.endsWith('.gltf') || entry.srcFile.endsWith('.glb')) {
      destFile = copyWithCompanions(entry.srcFile, destSubDir, entry.targetName);
    } else if (entry.srcFile.endsWith('.obj')) {
      destFile = convertObj(entry.srcFile, destSubDir, entry.targetName);
    }

    if (destFile && fs.existsSync(destFile)) {
      toRegister.push({
        name: path.basename(entry.srcFile, path.extname(entry.srcFile)).replace(/_/g, ' '),
        filePath: destFile.replace(PUBLIC_DIR + '/', ''),
        assetType: entry.assetType,
        tags: entry.tags,
        pack: entry.pack,
      });
      alreadyDone.add(entry.targetName);
      processed++;
    } else {
      failed++;
    }
  }

  console.log(`Organized: ${processed} | Skipped: ${skipped} | Failed: ${failed}\n`);

  // Register in DB
  console.log(`Registering ${toRegister.length} assets...`);
  let registered = 0;
  for (const a of toRegister) {
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
      if (registered % 50 === 0) console.log(`  ...${registered}`);
    } catch (err: any) {
      console.error(`  Failed: ${a.name} - ${err.message?.substring(0, 80)}`);
    }
  }

  console.log(`\n` + '='.repeat(60));
  console.log(`  Done! Organized: ${processed} | Registered: ${registered}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
