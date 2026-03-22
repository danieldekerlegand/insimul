#!/usr/bin/env tsx
/**
 * Migration 034: Move animal model assets from characters/quaternius to animals directory
 *
 * Updates the filePath for all animal visual assets in the database to reflect
 * their new location under assets/models/animals/ instead of
 * assets/models/characters/quaternius/.
 *
 * Usage:
 *   npx tsx server/migrations/034-move-animal-assets-to-animals-dir.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

const OLD_PREFIX = 'assets/models/characters/quaternius/animal_';
const NEW_PREFIX = 'assets/models/animals/animal_';

export async function migrate() {
  console.log('[Migration 034] Moving animal assets from characters to animals directory...');

  const allAssets = await storage.getAllVisualAssets();
  const animalAssets = allAssets.filter(a =>
    a.filePath && a.filePath.startsWith(OLD_PREFIX)
  );

  if (animalAssets.length === 0) {
    console.log('  No animal assets found with old path prefix. Already migrated or not present.');
    return;
  }

  console.log(`  Found ${animalAssets.length} animal assets to update.`);

  let updated = 0;
  for (const asset of animalAssets) {
    const newPath = asset.filePath!.replace(
      'assets/models/characters/quaternius/',
      'assets/models/animals/'
    );
    await storage.updateVisualAsset(asset.id, {
      filePath: newPath,
      assetType: 'model_animal',
    });
    console.log(`  Updated: ${asset.name} -> ${newPath}`);
    updated++;
  }

  console.log(`\n  Migration complete. Updated ${updated} animal assets.`);
}

migrate()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
