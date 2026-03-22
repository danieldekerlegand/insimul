#!/usr/bin/env tsx
/**
 * Migration 027: Create base item asset collections
 *
 * Creates 3 base asset collections (props, furniture, weapons) and maps
 * existing visual assets to item objectRoles via the `objectModels` field.
 *
 * Asset IDs are looked up dynamically from the visualassets collection
 * by matching on asset name, so this works across environments.
 *
 * Usage:
 *   npx tsx server/migrations/027-create-base-item-asset-collections.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

// ─── Asset name → objectRole mappings ────────────────────────────────────────

// Each entry: [objectRole, assetName (to match in visualassets)]
const PROPS_MAPPINGS: Array<[string, string]> = [
  ['barrel', 'Barrel_01'],
  ['barrel_fire', 'barrel_stove'],
  ['bucket', 'wooden_bucket_01'],
  ['crate', 'wooden_crate_01'],
  ['chest', 'treasure_chest'],
  ['fire_pit', 'stone_fire_pit'],
  ['boombox', 'boombox'],
  ['register', 'CashRegister_01'],
  ['rock', 'boulder_01'],
  ['oil_lamp', 'vintage_oil_lamp'],
  ['goblet', 'brass_goblets'],
  ['tea_set', 'tea_set_01'],
  ['plant', 'potted_plant_02'],
];

const FURNITURE_MAPPINGS: Array<[string, string]> = [
  ['bed', 'GothicBed_01'],
  ['book', 'book_encyclopedia_set_01'],
  ['bookshelf', 'wooden_bookshelf_worn'],
  ['cabinet', 'GothicCabinet_01'],
  ['candleholder', 'brass_candleholders'],
  ['chair', 'ArmChair_01'],
  ['chandelier', 'Chandelier_01'],
  ['clock', 'vintage_grandfather_clock_01'],
  ['lantern', 'Lantern_01'],
  ['shelf', 'Shelf_01'],
  ['table', 'wooden_table_02'],
  ['bar_stool', 'bar_chair_round_01'],
  ['console', 'ClassicConsole_01'],
];

const WEAPONS_MAPPINGS: Array<[string, string]> = [
  ['axe', 'wooden_axe'],
  ['saber', 'wooden_handle_saber'],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a map of asset name (lowercased) → { id, name } from all visual assets */
async function buildAssetNameMap(): Promise<Map<string, { id: string; name: string }>> {
  const allAssets = await storage.getAllVisualAssets();
  const map = new Map<string, { id: string; name: string }>();
  for (const a of allAssets) {
    if (a.name) {
      // Index by exact name
      map.set(a.name, { id: a.id, name: a.name });
    }
    // Also index by filePath filename component (e.g. "wooden_axe" from path)
    if (a.filePath) {
      const parts = a.filePath.split('/');
      // Typically: assets/models/props/polyhaven/wooden_axe/wooden_axe.gltf
      // The folder name (second-to-last) is often the asset identifier
      if (parts.length >= 2) {
        const folderName = parts[parts.length - 2];
        if (!map.has(folderName)) {
          map.set(folderName, { id: a.id, name: a.name });
        }
      }
    }
  }
  return map;
}

/** Resolve a list of [role, assetName] mappings into { objectModels, assetIds } */
function resolveMapping(
  mappings: Array<[string, string]>,
  nameMap: Map<string, { id: string; name: string }>,
): { objectModels: Record<string, string>; assetIds: string[]; missing: string[] } {
  const objectModels: Record<string, string> = {};
  const assetIdSet = new Set<string>();
  const missing: string[] = [];

  for (const [role, assetName] of mappings) {
    const found = nameMap.get(assetName);
    if (found) {
      objectModels[role] = found.id;
      assetIdSet.add(found.id);
    } else {
      missing.push(`${role} (${assetName})`);
    }
  }

  return { objectModels, assetIds: Array.from(assetIdSet), missing };
}

// ─── Collection definitions ──────────────────────────────────────────────────

interface CollectionDef {
  name: string;
  description: string;
  collectionType: string;
  mappings: Array<[string, string]>;
  tags: string[];
  purpose: string;
}

const COLLECTIONS: CollectionDef[] = [
  {
    name: 'Base Props & Objects',
    description: 'Base collection of prop and object models for game worlds — barrels, crates, buckets, chests, and other interactive/decorative objects.',
    collectionType: 'props',
    mappings: PROPS_MAPPINGS,
    tags: ['base', 'props', 'objects', 'polyhaven'],
    purpose: 'Default prop models mapped to item objectRoles for all world types',
  },
  {
    name: 'Base Furniture',
    description: 'Base collection of furniture models — beds, chairs, tables, shelves, cabinets, and other interior furnishings.',
    collectionType: 'furniture',
    mappings: FURNITURE_MAPPINGS,
    tags: ['base', 'furniture', 'interior', 'polyhaven'],
    purpose: 'Default furniture models mapped to item objectRoles for building interiors',
  },
  {
    name: 'Base Weapons & Tools',
    description: 'Base collection of weapon and tool models — axes, sabers, lanterns, and other equippable/usable items.',
    collectionType: 'weapons',
    mappings: WEAPONS_MAPPINGS,
    tags: ['base', 'weapons', 'tools', 'polyhaven'],
    purpose: 'Default weapon and tool models mapped to item objectRoles for equippable items',
  },
];

// ─── Main migration ──────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 027: Create Base Item Asset Collections');
  console.log('='.repeat(60) + '\n');

  // Step 1: Build asset name lookup map
  console.log('Loading all visual assets...');
  const nameMap = await buildAssetNameMap();
  console.log(`  ${nameMap.size} asset name entries indexed\n`);

  // Step 2: Check for existing base collections to avoid duplicates
  const existingCollections = await storage.getAllAssetCollections();
  const existingNames = new Set(existingCollections.map(c => c.name));

  let created = 0;
  let skipped = 0;

  for (const def of COLLECTIONS) {
    console.log(`--- ${def.name} ---`);

    if (existingNames.has(def.name)) {
      console.log(`  Already exists, skipping.\n`);
      skipped++;
      continue;
    }

    // Resolve asset mappings
    const { objectModels, assetIds, missing } = resolveMapping(def.mappings, nameMap);

    console.log(`  Resolved ${Object.keys(objectModels).length}/${def.mappings.length} objectRole mappings`);
    if (missing.length > 0) {
      console.log(`  Missing: ${missing.join(', ')}`);
    }

    if (Object.keys(objectModels).length === 0) {
      console.log(`  No assets found, skipping collection creation.\n`);
      skipped++;
      continue;
    }

    // Log mappings
    for (const [role, assetId] of Object.entries(objectModels)) {
      console.log(`    ${role} -> ${assetId.substring(0, 16)}...`);
    }

    // Create the collection
    const collection = await storage.createAssetCollection({
      name: def.name,
      description: def.description,
      collectionType: def.collectionType,
      objectModels,
      assetIds,
      tags: def.tags,
      purpose: def.purpose,
      isBase: true,
      isPublic: true,
      isActive: true,
    } as any);

    console.log(`  Created: ${collection.id}\n`);
    created++;
  }

  console.log('='.repeat(60));
  console.log(`  Migration complete! ${created} created, ${skipped} skipped`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
