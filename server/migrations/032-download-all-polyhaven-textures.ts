#!/usr/bin/env tsx
/**
 * Migration 032: Download ALL Polyhaven PBR textures
 *
 * Downloads ~750 PBR texture sets from Polyhaven at 1k resolution (JPG).
 * Each texture gets 3 maps: diffuse, normal (GL), and ARM (AO/Roughness/Metallic).
 *
 * Files are stored under:
 *   client/public/assets/textures/polyhaven/{textureId}/
 *     {textureId}_diff_1k.jpg
 *     {textureId}_nor_gl_1k.jpg
 *     {textureId}_arm_1k.jpg
 *
 * Usage:
 *   npx tsx server/migrations/032-download-all-polyhaven-textures.ts
 *
 * Optional env vars:
 *   BATCH_SIZE     — concurrent downloads per batch (default 5)
 *   BATCH_DELAY_MS — pause between batches in ms (default 500)
 *   DRY_RUN=1      — list what would be downloaded without downloading
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import fsp from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';
import { queryPolyhavenAssets } from '../services/assets/polyhaven-api.js';
import { downloadFile } from '../services/assets/asset-downloader.js';

// ─── Config ──────────────────────────────────────────────────────────────────

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '5', 10);
const BATCH_DELAY_MS = parseInt(process.env.BATCH_DELAY_MS || '500', 10);
const DRY_RUN = process.env.DRY_RUN === '1';
const RESOLUTION = '1k';

const TEXTURES_DIR = path.resolve(
  __dirname,
  '../../client/public/assets/textures/polyhaven'
);

// Maps we want to download for each texture (format key → file suffix)
const MAPS_TO_DOWNLOAD = [
  { format: 'Diffuse', fileType: 'jpg', suffix: 'diff' },
  { format: 'nor_gl', fileType: 'jpg', suffix: 'nor_gl' },
  { format: 'arm', fileType: 'jpg', suffix: 'arm' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isTextureComplete(textureId: string): boolean {
  const dir = path.join(TEXTURES_DIR, textureId);
  if (!fs.existsSync(dir)) return false;
  // Check that all 3 maps exist
  return MAPS_TO_DOWNLOAD.every((map) => {
    const fileName = `${textureId}_${map.suffix}_${RESOLUTION}.${map.fileType}`;
    return fs.existsSync(path.join(dir, fileName));
  });
}

function isTexturePartial(textureId: string): boolean {
  const dir = path.join(TEXTURES_DIR, textureId);
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir);
  return files.length > 0 && !isTextureComplete(textureId);
}

/** Fetch file URLs for a specific texture from the Polyhaven API */
async function getTextureFileUrls(
  textureId: string
): Promise<{ suffix: string; url: string; fileName: string }[]> {
  const https = await import('https');

  const data: any = await new Promise((resolve, reject) => {
    https.default.get(
      `https://api.polyhaven.com/files/${encodeURIComponent(textureId)}`,
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${textureId}`));
          res.resume();
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on('error', reject);
  });

  const results: { suffix: string; url: string; fileName: string }[] = [];

  for (const map of MAPS_TO_DOWNLOAD) {
    const formatGroup = data[map.format];
    if (!formatGroup) continue;

    const resGroup = formatGroup[RESOLUTION];
    if (!resGroup) continue;

    const fileEntry = resGroup[map.fileType];
    if (!fileEntry || !fileEntry.url) continue;

    const fileName = `${textureId}_${map.suffix}_${RESOLUTION}.${map.fileType}`;
    results.push({ suffix: map.suffix, url: fileEntry.url, fileName });
  }

  return results;
}

async function downloadTexture(
  textureId: string,
  tags: string[]
): Promise<{ id: string; filePath: string } | null> {
  const dir = path.join(TEXTURES_DIR, textureId);
  await fsp.mkdir(dir, { recursive: true });

  try {
    const fileUrls = await getTextureFileUrls(textureId);

    if (fileUrls.length === 0) {
      console.error(`    No downloadable maps for ${textureId}`);
      return null;
    }

    let totalSize = 0;

    for (const { suffix, url, fileName } of fileUrls) {
      const destPath = path.join(dir, fileName);

      // Skip if already exists
      try {
        const stat = fs.statSync(destPath);
        totalSize += stat.size;
        continue;
      } catch {
        // doesn't exist, download
      }

      await downloadFile(url, destPath);
      const stat = fs.statSync(destPath);
      totalSize += stat.size;
    }

    // Use the diffuse map as the primary file path
    const primaryFile = `${textureId}_diff_${RESOLUTION}.jpg`;
    const relativePath = `assets/textures/polyhaven/${textureId}/${primaryFile}`;

    // Register as visual asset
    const asset = await storage.createVisualAsset({
      worldId: null,
      name: `${textureId} (texture)`,
      description: `Polyhaven PBR texture: ${textureId}`,
      assetType: 'texture_pbr',
      filePath: relativePath,
      fileName: primaryFile,
      fileSize: totalSize,
      mimeType: 'image/jpeg',
      generationProvider: 'manual',
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['polyhaven', 'texture', 'pbr', ...tags],
      metadata: {
        polyhavenId: textureId,
        resolution: RESOLUTION,
        maps: fileUrls.map((f) => f.suffix),
      },
    });

    return { id: asset.id, filePath: relativePath };
  } catch (error: any) {
    console.error(`    FAILED ${textureId}: ${error.message}`);
    return null;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 032: Download ALL Polyhaven PBR Textures');
  console.log('='.repeat(60) + '\n');

  // Step 1: Fetch full catalog
  console.log('Fetching Polyhaven texture catalog...');
  const allAssets = await queryPolyhavenAssets('textures');
  console.log(`  Total textures on Polyhaven: ${allAssets.length}\n`);

  // Step 2: Check what we already have
  const complete = new Set<string>();
  const partial = new Set<string>();

  if (fs.existsSync(TEXTURES_DIR)) {
    for (const dir of fs.readdirSync(TEXTURES_DIR)) {
      if (isTextureComplete(dir)) {
        complete.add(dir);
      } else if (isTexturePartial(dir)) {
        partial.add(dir);
      }
    }
  }

  // Check DB for registered assets
  const dbAssets = await storage.getAllVisualAssets();
  const dbPolyhavenIds = new Set<string>();
  for (const a of dbAssets) {
    if (
      a.assetType === 'texture_pbr' &&
      a.metadata &&
      typeof a.metadata === 'object' &&
      'polyhavenId' in (a.metadata as any)
    ) {
      dbPolyhavenIds.add((a.metadata as any).polyhavenId);
    }
  }

  console.log(`  Complete on disk: ${complete.size}`);
  console.log(`  Partial on disk: ${partial.size}`);
  console.log(`  Registered in DB: ${dbPolyhavenIds.size}`);

  // Step 3: Determine what needs work
  // Need to download: not complete on disk
  const toDownload = allAssets.filter((a) => !complete.has(a.id) || !dbPolyhavenIds.has(a.id));
  // On disk + complete but not in DB: just register
  const toRegisterOnly = allAssets.filter(
    (a) => complete.has(a.id) && !dbPolyhavenIds.has(a.id)
  );
  // Need full download
  const toFullDownload = allAssets.filter((a) => !complete.has(a.id));

  console.log(`  Need to download: ${toFullDownload.length}`);
  console.log(`  Need to register only: ${toRegisterOnly.length}\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — would download:');
    for (const a of toFullDownload.slice(0, 20)) {
      console.log(`  ${a.id} (${a.categories.join(', ')})`);
    }
    if (toFullDownload.length > 20) {
      console.log(`  ... and ${toFullDownload.length - 20} more`);
    }
    return;
  }

  // Step 4: Register complete-on-disk textures not in DB
  let registered = 0;
  for (const asset of toRegisterOnly) {
    const primaryFile = `${asset.id}_diff_${RESOLUTION}.jpg`;
    const relativePath = `assets/textures/polyhaven/${asset.id}/${primaryFile}`;
    const fullPath = path.join(TEXTURES_DIR, asset.id, primaryFile);

    try {
      const stat = fs.statSync(fullPath);
      const tags = [...new Set([...(asset.categories || []), ...(asset.tags || []).slice(0, 5)])];

      await storage.createVisualAsset({
        worldId: null,
        name: `${asset.id} (texture)`,
        description: `Polyhaven PBR texture: ${asset.id}`,
        assetType: 'texture_pbr',
        filePath: relativePath,
        fileName: primaryFile,
        fileSize: stat.size,
        mimeType: 'image/jpeg',
        generationProvider: 'manual',
        purpose: 'procedural',
        usageContext: '3d_game',
        tags: ['polyhaven', 'texture', 'pbr', ...tags],
        metadata: {
          polyhavenId: asset.id,
          resolution: RESOLUTION,
          maps: MAPS_TO_DOWNLOAD.map((m) => m.suffix),
        },
      });
      registered++;
    } catch {
      // Skip if file doesn't exist
    }
  }
  if (registered > 0) {
    console.log(`  Registered ${registered} existing textures\n`);
  }

  // Step 5: Download remaining textures in batches
  let downloaded = 0;
  let failed = 0;
  const totalBatches = Math.ceil(toFullDownload.length / BATCH_SIZE);

  for (let i = 0; i < toFullDownload.length; i += BATCH_SIZE) {
    const batch = toFullDownload.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(
      `\n── Batch ${batchNum}/${totalBatches} (${batch.map((a) => a.id).join(', ')}) ──`
    );

    await Promise.all(
      batch.map(async (asset) => {
        const tags = [...new Set([...(asset.categories || []), ...(asset.tags || []).slice(0, 5)])];
        console.log(`  [${asset.id}] downloading...`);
        const result = await downloadTexture(asset.id, tags);
        if (result) {
          downloaded++;
          console.log(`  [${asset.id}] done`);
        } else {
          failed++;
          console.log(`  [${asset.id}] failed`);
        }
      })
    );

    // Rate-limit between batches
    if (i + BATCH_SIZE < toFullDownload.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }

    // Progress update every 10 batches
    if (batchNum % 10 === 0 || i + BATCH_SIZE >= toFullDownload.length) {
      const total = downloaded + failed;
      const pct = ((total / toFullDownload.length) * 100).toFixed(1);
      console.log(
        `  Progress: ${total}/${toFullDownload.length} (${pct}%) — ${downloaded} ok, ${failed} failed`
      );
    }
  }

  // Step 6: Summary
  console.log('\n' + '='.repeat(60));
  console.log('  Migration complete!');
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Registered (existing): ${registered}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total textures now: ~${complete.size + downloaded}`);
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
