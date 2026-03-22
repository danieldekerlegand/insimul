#!/usr/bin/env tsx
/**
 * Migration 031: Download ALL remaining Polyhaven models
 *
 * Fetches the full Polyhaven model catalog (~421 models), skips ones already
 * on disk, and downloads the rest. Each model is also registered as a visual
 * asset in the database.
 *
 * Usage:
 *   npx tsx server/migrations/031-download-all-polyhaven-models.ts
 *
 * Optional env vars:
 *   BATCH_SIZE     — concurrent downloads per batch (default 3)
 *   BATCH_DELAY_MS — pause between batches in ms (default 1000)
 *   DRY_RUN=1      — list what would be downloaded without downloading
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';
import { queryPolyhavenAssets, getPolyhavenModelUrl } from '../services/polyhaven-api.js';
import { preprocessPolyhavenAsset } from '../services/asset-downloader.js';

// ─── Config ──────────────────────────────────────────────────────────────────

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '3', 10);
const BATCH_DELAY_MS = parseInt(process.env.BATCH_DELAY_MS || '1000', 10);
const DRY_RUN = process.env.DRY_RUN === '1';

const POLYHAVEN_DIR = path.resolve(
  __dirname,
  '../../client/public/assets/models/props/polyhaven'
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function alreadyOnDisk(polyhavenId: string): boolean {
  const dir = path.join(POLYHAVEN_DIR, polyhavenId);
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir);
  return files.some((f) => f.endsWith('.gltf') || f.endsWith('.glb'));
}

function inferTags(asset: { categories: string[]; tags: string[] }): string[] {
  const tags: string[] = [];
  if (asset.categories) tags.push(...asset.categories);
  if (asset.tags) {
    // Take up to 5 tags to keep it manageable
    tags.push(...asset.tags.slice(0, 5));
  }
  return [...new Set(tags)];
}

async function downloadOne(
  polyhavenId: string,
  tags: string[]
): Promise<{ id: string; filePath: string } | null> {
  try {
    const modelInfo = await getPolyhavenModelUrl(polyhavenId, '1k');

    const downloadResult = await preprocessPolyhavenAsset(
      modelInfo.url,
      'model_prop',
      polyhavenId,
      modelInfo.companionFiles
    );

    // Register as visual asset
    const asset = await storage.createVisualAsset({
      worldId: null,
      name: `${polyhavenId} (${tags[0] || 'prop'})`,
      description: `Polyhaven model: ${polyhavenId}`,
      assetType: 'model_prop',
      filePath: downloadResult.localPath,
      fileName: downloadResult.localPath.split('/').pop() || `${polyhavenId}.glb`,
      fileSize: downloadResult.metadata.fileSize,
      mimeType: 'model/gltf-binary',
      generationProvider: 'manual',
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['polyhaven', 'model', ...tags],
      metadata: {
        polyhavenId,
        resolution: modelInfo.resolution,
      },
    });

    return { id: asset.id, filePath: downloadResult.localPath };
  } catch (error: any) {
    console.error(`    FAILED ${polyhavenId}: ${error.message}`);
    return null;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 031: Download ALL Remaining Polyhaven Models');
  console.log('='.repeat(60) + '\n');

  // Step 1: Fetch full catalog
  console.log('Fetching Polyhaven model catalog...');
  const allAssets = await queryPolyhavenAssets('models');
  console.log(`  Total models on Polyhaven: ${allAssets.length}\n`);

  // Step 2: Build set of already-downloaded IDs
  // Check both disk and DB
  const existingOnDisk = new Set<string>();
  if (fs.existsSync(POLYHAVEN_DIR)) {
    for (const dir of fs.readdirSync(POLYHAVEN_DIR)) {
      if (alreadyOnDisk(dir)) {
        existingOnDisk.add(dir);
      }
    }
  }
  console.log(`  Already on disk: ${existingOnDisk.size}`);

  // Also check DB for any registered assets we might have elsewhere
  const dbAssets = await storage.getAllVisualAssets();
  const dbPolyhavenIds = new Set<string>();
  for (const a of dbAssets) {
    if (a.metadata && typeof a.metadata === 'object' && 'polyhavenId' in (a.metadata as any)) {
      dbPolyhavenIds.add((a.metadata as any).polyhavenId);
    }
  }
  console.log(`  Already in DB: ${dbPolyhavenIds.size}`);

  // Step 3: Filter to models we still need
  const toDownload = allAssets.filter(
    (a) => !existingOnDisk.has(a.id) && !dbPolyhavenIds.has(a.id)
  );

  // Also find on-disk but not in DB (need to register)
  const toRegister = allAssets.filter(
    (a) => existingOnDisk.has(a.id) && !dbPolyhavenIds.has(a.id)
  );

  console.log(`  Need to download: ${toDownload.length}`);
  console.log(`  Need to register (on disk, not in DB): ${toRegister.length}\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — would download:');
    for (const a of toDownload) {
      console.log(`  ${a.id} (${a.categories.join(', ')})`);
    }
    console.log('\nWould register:');
    for (const a of toRegister) {
      console.log(`  ${a.id}`);
    }
    return;
  }

  // Step 4: Register on-disk models that aren't in DB yet
  let registered = 0;
  for (const asset of toRegister) {
    const dir = path.join(POLYHAVEN_DIR, asset.id);
    const files = fs.readdirSync(dir);
    const gltfFile = files.find((f) => f.endsWith('.gltf') || f.endsWith('.glb'));
    if (!gltfFile) continue;

    const fullPath = path.join(dir, gltfFile);
    const relativePath = `assets/models/props/polyhaven/${asset.id}/${gltfFile}`;
    const stat = fs.statSync(fullPath);
    const tags = inferTags(asset);

    await storage.createVisualAsset({
      worldId: null,
      name: `${asset.id} (${tags[0] || 'prop'})`,
      description: `Polyhaven model: ${asset.id}`,
      assetType: 'model_prop',
      filePath: relativePath,
      fileName: gltfFile,
      fileSize: stat.size,
      mimeType: gltfFile.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json',
      generationProvider: 'manual',
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['polyhaven', 'model', ...tags],
      metadata: { polyhavenId: asset.id },
    });
    registered++;
    console.log(`  Registered: ${asset.id}`);
  }
  if (registered > 0) {
    console.log(`  Registered ${registered} existing models\n`);
  }

  // Step 5: Download remaining models in batches
  let downloaded = 0;
  let failed = 0;
  const totalBatches = Math.ceil(toDownload.length / BATCH_SIZE);

  for (let i = 0; i < toDownload.length; i += BATCH_SIZE) {
    const batch = toDownload.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(
      `\n── Batch ${batchNum}/${totalBatches} (${batch.map((a) => a.id).join(', ')}) ──`
    );

    const results = await Promise.all(
      batch.map(async (asset) => {
        const tags = inferTags(asset);
        console.log(`  [${asset.id}] downloading...`);
        const result = await downloadOne(asset.id, tags);
        if (result) {
          downloaded++;
          console.log(`  [${asset.id}] ✅ done`);
        } else {
          failed++;
          console.log(`  [${asset.id}] ❌ failed`);
        }
        return result;
      })
    );

    // Rate-limit between batches
    if (i + BATCH_SIZE < toDownload.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }

    // Progress update
    const total = downloaded + failed;
    console.log(
      `  Progress: ${total}/${toDownload.length} (${downloaded} ok, ${failed} failed)`
    );
  }

  // Step 6: Summary
  console.log('\n' + '='.repeat(60));
  console.log('  Migration complete!');
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Registered (existing): ${registered}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total on disk now: ~${existingOnDisk.size + downloaded}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
