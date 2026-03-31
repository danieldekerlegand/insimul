#!/usr/bin/env tsx
/**
 * Migration script to re-download Polyhaven model assets at 1k resolution
 * with all companion files (.bin geometry + textures).
 *
 * The original seed (002) downloaded high-res .gltf files but missed
 * the companion .bin and texture files. This script re-downloads
 * everything at 1k resolution so all references resolve correctly.
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/003-fix-model-companions.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { getPolyhavenModelUrl } from '../services/assets/polyhaven-api.js';
import { downloadFile } from '../services/assets/asset-downloader.js';

const MODELS_DIR = path.resolve(__dirname, '../../client/public/assets/polyhaven/models');

async function fixModelCompanions() {
  console.log('🔧 Re-downloading model assets at 1k with all companion files...\n');

  // Find all .gltf files in the models directory
  let gltfFiles: string[];
  try {
    const allFiles = await fs.readdir(MODELS_DIR);
    gltfFiles = allFiles.filter(f => f.endsWith('.gltf'));
  } catch {
    console.error('❌ Models directory not found:', MODELS_DIR);
    process.exit(1);
  }

  console.log(`Found ${gltfFiles.length} .gltf files in ${MODELS_DIR}\n`);

  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const gltfFile of gltfFiles) {
    const assetId = gltfFile.replace('.gltf', '');
    console.log(`\n📦 ${assetId}`);

    try {
      // Get 1k resolution URLs from Polyhaven API (main gltf + all companions)
      const result = await getPolyhavenModelUrl(assetId, '1k');
      const companions = result.companionFiles;

      // Re-download the .gltf file at 1k resolution
      const gltfPath = path.join(MODELS_DIR, gltfFile);
      console.log(`  ⬇️ ${gltfFile} (1k)`);
      await downloadFile(result.url, gltfPath);
      const gltfStats = await fs.stat(gltfPath);
      console.log(`    ✅ ${(gltfStats.size / 1024).toFixed(0)} KB`);

      // Download all companion files
      let companionCount = 0;
      if (companions && Object.keys(companions).length > 0) {
        for (const [relPath, url] of Object.entries(companions)) {
          const destPath = path.join(MODELS_DIR, relPath);
          const destDir = path.dirname(destPath);
          await fs.mkdir(destDir, { recursive: true });

          // Skip if already exists
          try {
            await fs.access(destPath);
            console.log(`  ✓ ${relPath} (exists)`);
            companionCount++;
            continue;
          } catch {
            // Doesn't exist, download it
          }

          try {
            console.log(`  ⬇️ ${relPath}`);
            await downloadFile(url, destPath);
            const stats = await fs.stat(destPath);
            console.log(`    ✅ ${(stats.size / 1024).toFixed(0)} KB`);
            companionCount++;
          } catch (error: any) {
            console.warn(`    ⚠️ ${error.message}`);
          }
        }
      }

      console.log(`  ✅ Done (${companionCount} companions)`);
      fixed++;

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error: any) {
      console.error(`  ❌ ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Done! Fixed: ${fixed}, Failed: ${failed}`);
}

fixModelCompanions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
