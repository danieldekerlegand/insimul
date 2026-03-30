#!/usr/bin/env tsx
/**
 * Migration 045: Add environmental items from unused visual assets
 *
 * Creates base items for ~100 visual assets that exist as model_prop but
 * have no corresponding item. These are environmental/nature props (stumps,
 * rocks, shrubs, street lamps, etc.) that should be recognizable and
 * translatable for language learning — but NOT collectable.
 *
 * Also fixes 8 base items with broken visualAssetId references.
 *
 * Excludes PolyHaven collection assets (tagged "collection:*") for now.
 *
 * Idempotent — skips items that already exist by name.
 *
 * Usage:
 *   npx tsx server/migrations/045-add-environmental-items.ts
 *   npx tsx server/migrations/045-add-environmental-items.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';

const DRY_RUN = process.argv.includes('--dry-run');

function humanizeName(assetName: string): string {
  let name = assetName.replace(/\s*\(.*?\)\s*$/, '').trim();
  name = name.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  name = name.replace(/\s+\d{1,2}$/, '');
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function deriveObjectRole(asset: { name: string; tags: string[] }): string {
  const tags = (asset.tags || []).map(t => t.toLowerCase());
  const baseName = asset.name.replace(/\s*\(.*?\)\s*$/, '').trim().toLowerCase();

  const ROLE_TAGS = [
    'stump', 'rock', 'rock_large', 'boulder', 'shrub', 'bush', 'fern', 'herb', 'plant', 'tree',
    'lamp', 'prop', 'decoration', 'sign', 'fan', 'marker', 'pipe', 'duct', 'vent',
  ];
  for (const role of ROLE_TAGS) {
    if (tags.includes(role)) return role;
  }
  const lastTag = tags[tags.length - 1];
  if (lastTag && !['base', 'objects', 'model', 'polyhaven', 'generic', 'nature'].includes(lastTag)) {
    return lastTag.replace(/\s+/g, '_');
  }
  return baseName.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function deriveCategory(asset: { name: string; tags: string[] }): string {
  const tags = new Set((asset.tags || []).map(t => t.toLowerCase()));
  const name = asset.name.toLowerCase();

  if (tags.has('lamp') || tags.has('lamp_table') || name.includes('lamp') || name.includes('lantern')) return 'light_source';
  if (tags.has('sign') || name.includes('sign')) return 'decoration';
  if (tags.has('fan') || tags.has('appliances')) return 'equipment';
  if (tags.has('industrial') || tags.has('pipes') || tags.has('vent') || tags.has('airduct')) return 'equipment';
  if (tags.has('marker') || name.includes('marker')) return 'decoration';
  return 'decoration'; // default for environmental
}

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) { console.error('MONGO_URL not set'); process.exit(1); }

  await mongoose.connect(mongoUrl);
  const Item = mongoose.connection.collection('items');
  const VisualAsset = mongoose.connection.collection('visualassets');

  console.log(`\n📦 Migration 045: Add environmental items${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // ── Step 1: Find unused non-PolyHaven-collection props ─────────────────
  const allItems = await Item.find({ isBase: true }, { projection: { visualAssetId: 1, name: 1 } }).toArray();
  const usedIds = new Set(allItems.map(i => i.visualAssetId).filter(Boolean));
  const existingNames = new Set(allItems.map(i => i.name));

  const unusedProps = await VisualAsset.find({
    assetType: 'model_prop',
  }).toArray();

  const toAdd = unusedProps.filter(p => {
    // Skip if already used
    if (usedIds.has(p._id.toString())) return false;
    // Skip PolyHaven collection items
    if ((p.tags || []).some((t: string) => t.startsWith('collection:'))) return false;
    return true;
  });

  console.log(`   Found ${toAdd.length} unused non-collection props to add as environmental items`);

  // ── Step 2: Create environmental base items ────────────────────────────
  let created = 0;
  let skipped = 0;

  for (const asset of toAdd) {
    const name = humanizeName(asset.name);
    if (existingNames.has(name)) {
      skipped++;
      continue;
    }

    const objectRole = deriveObjectRole(asset as any);
    const category = deriveCategory(asset as any);

    const item = {
      worldId: null,
      name,
      description: `${name} — an environmental object.`,
      itemType: 'environmental',
      icon: '🌿',
      value: 0,
      sellValue: 0,
      weight: 0,
      tradeable: false,
      stackable: false,
      maxStack: 1,
      worldType: null,
      objectRole,
      visualAssetId: asset._id.toString(),
      category,
      material: null,
      baseType: objectRole,
      rarity: 'common',
      effects: null,
      lootWeight: 0,
      tags: ['environmental', category, objectRole],
      isBase: true,
      possessable: false,
      metadata: {},
      translations: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!DRY_RUN) {
      await Item.insertOne(item);
    }
    existingNames.add(name);
    created++;
  }

  console.log(`   ✅ Created ${created} environmental items`);
  if (skipped > 0) console.log(`   ⏭️  Skipped ${skipped} (name already exists)`);

  // ── Step 3: Fix broken visualAssetId references ────────────────────────
  console.log('\n   Step 3: Fix broken asset references');

  // Find items whose visualAssetId doesn't match any existing asset
  const allItemsFull = await Item.find(
    { isBase: true, visualAssetId: { $ne: null } },
    { projection: { name: 1, objectRole: 1, visualAssetId: 1 } },
  ).toArray();

  let fixed = 0;
  for (const item of allItemsFull) {
    const assetId = item.visualAssetId;
    let exists = false;
    try {
      exists = !!(await VisualAsset.findOne({ _id: new mongoose.Types.ObjectId(assetId) }));
    } catch { /* invalid ObjectId format */ }

    if (!exists) {
      // Try to find a matching asset by objectRole in tags
      const replacement = await VisualAsset.findOne({
        assetType: 'model_prop',
        tags: item.objectRole,
      });

      if (replacement && !DRY_RUN) {
        await Item.updateOne(
          { _id: item._id },
          { $set: { visualAssetId: replacement._id.toString(), updatedAt: new Date() } },
        );
        console.log(`   🔧 Fixed ${item.name}: ${assetId} → ${replacement._id} (${replacement.name})`);
        fixed++;
      } else if (replacement) {
        console.log(`   Would fix ${item.name}: → ${replacement.name} (dry run)`);
        fixed++;
      } else {
        console.log(`   ⚠️  No replacement found for ${item.name} (role: ${item.objectRole})`);
      }
    }
  }

  console.log(`   ✅ Fixed ${fixed} broken asset references`);

  // ── Summary ────────────────────────────────────────────────────────────
  const totalBase = await Item.countDocuments({ isBase: true });
  const totalEnv = await Item.countDocuments({ isBase: true, itemType: 'environmental' });
  console.log(`\n   📊 Final state: ${totalBase} base items (${totalEnv} environmental)`);

  await mongoose.disconnect();
  console.log(`\n✅ Migration 045 complete${DRY_RUN ? ' (dry run — no changes made)' : ''}\n`);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
