#!/usr/bin/env tsx
/**
 * Migration 024: Rename quest-objects directory to containers + reorganize
 *
 * Splits the former `models/quest-objects/` directory into three semantic categories:
 *   - containers/ — chests, crates, barrels (storage)
 *   - markers/    — quest markers, visual indicators
 *   - props/      — collectible items, lamps, bottles
 *
 * Also updates DB filePath records that still reference the old directory.
 *
 * Usage:
 *   npx tsx server/migrations/024-rename-quest-objects-to-containers.ts
 *
 * Dry run:
 *   DRY_RUN=1 npx tsx server/migrations/024-rename-quest-objects-to-containers.ts
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

// ─── File classification ────────────────────────────────────────────────────

const CONTAINER_FILES = ['chest.glb', 'treasure_chest.gltf'];
const MARKER_FILES = ['quest_marker.glb', 'lantern_marker.gltf'];
// Everything else goes to props

interface PathMove {
  oldPath: string;
  newPath: string;
}

function classifyFile(filename: string): 'containers' | 'markers' | 'props' {
  if (CONTAINER_FILES.includes(filename)) return 'containers';
  if (MARKER_FILES.includes(filename)) return 'markers';
  return 'props';
}

function buildMoveList(): PathMove[] {
  const moves: PathMove[] = [];
  const questDir = path.join(ASSETS_DIR, 'models/quest-objects');

  if (!fs.existsSync(questDir)) {
    console.log('  quest-objects directory does not exist (already migrated or clean install)');
    return moves;
  }

  for (const f of fs.readdirSync(questDir)) {
    const category = classifyFile(f);
    moves.push({
      oldPath: `assets/models/quest-objects/${f}`,
      newPath: `assets/models/${category}/${f}`,
    });
  }

  return moves;
}

// ─── Main migration ──────────────────────────────────────────────────────────

async function runMigration() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Migration 024: Rename quest-objects → containers/markers/props');
  console.log(`  ${DRY_RUN ? '⚠️  DRY RUN MODE' : '🚀 LIVE MODE'}`);
  console.log(`${'='.repeat(60)}\n`);

  const moves = buildMoveList();
  console.log(`  ${moves.length} file moves planned\n`);

  // Create target directories
  for (const dir of ['containers', 'markers', 'props']) {
    const target = path.join(ASSETS_DIR, 'models', dir);
    if (!DRY_RUN) {
      fs.mkdirSync(target, { recursive: true });
    }
  }

  // Move files
  let moveSuccess = 0;
  for (const move of moves) {
    const srcAbs = path.join(PROJECT_ROOT, 'client/public', move.oldPath);
    const dstAbs = path.join(PROJECT_ROOT, 'client/public', move.newPath);

    if (!fs.existsSync(srcAbs)) {
      console.log(`  skip (not found): ${move.oldPath}`);
      continue;
    }

    if (!DRY_RUN) {
      fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
      fs.copyFileSync(srcAbs, dstAbs);
      fs.unlinkSync(srcAbs);
    }
    console.log(`  ${move.oldPath} → ${move.newPath}`);
    moveSuccess++;
  }

  // Remove old directory if empty
  const questDir = path.join(ASSETS_DIR, 'models/quest-objects');
  if (!DRY_RUN && fs.existsSync(questDir)) {
    const remaining = fs.readdirSync(questDir);
    if (remaining.length === 0) {
      fs.rmdirSync(questDir);
      console.log('\n  Removed empty models/quest-objects/ directory');
    }
  }

  // Update DB filePath records
  console.log('\n  Updating DB records...');
  let dbUpdated = 0;
  try {
    const allAssets = await (storage as any).getAllVisualAssets?.() || [];
    const pathMap = new Map(moves.map(m => [m.oldPath, m.newPath]));

    for (const asset of allAssets) {
      const newPath = pathMap.get(asset.filePath);
      if (newPath) {
        if (!DRY_RUN) {
          await storage.updateVisualAsset(asset.id, { filePath: newPath } as any);
        }
        dbUpdated++;
      }
    }
  } catch (e) {
    console.warn(`  Could not bulk-update: ${e}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Files moved: ${moveSuccess}`);
  console.log(`  DB updated: ${dbUpdated}`);
  console.log(`${'='.repeat(60)}\n`);
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((err) => { console.error('Failed:', err); process.exit(1); });
