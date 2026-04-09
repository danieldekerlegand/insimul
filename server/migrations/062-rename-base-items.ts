#!/usr/bin/env tsx
/**
 * Migration 062: Rename base items for language learning
 *
 * Replaces asset-tag names (Prop, Rpg, Scifi, numbered potions, etc.)
 * with descriptive, learnable names. Clears old translations so they
 * can be regenerated with the new names.
 *
 * Usage:
 *   npx tsx server/migrations/062-rename-base-items.ts --dry-run
 *   npx tsx server/migrations/062-rename-base-items.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URL || 'mongodb://localhost:27017/insimul';
const DRY_RUN = process.argv.includes('--dry-run');

const RENAMES: Record<string, string> = {
  // ── Potions ──────────────────────────────────────────────────────────────
  'Potion1 Empty': 'Empty Red Potion',
  'Potion2 Empty': 'Empty Blue Potion',
  'Potion3 Empty': 'Empty Green Potion',
  'Potion4 Empty': 'Empty Yellow Potion',
  'Potion5 Empty': 'Empty Purple Potion',
  'Potion6 Empty': 'Empty Orange Potion',
  'Potion7 Empty': 'Empty Pink Potion',
  'Potion8 Empty': 'Empty Clear Potion',
  'Potion9 Empty': 'Empty Dark Potion',
  'Potion10 Empty': 'Empty Silver Flask',
  'Potion10 Filled': 'Silver Flask',
  'Potion11 Empty': 'Empty White Flask',
  'Potion11 Filled': 'White Flask',
  'Avocado Empty': 'Avocado Half',

  // ── Prop → Real Names ────────────────────────────────────────────────────
  'Prop Locker': 'Locker',
  'Prop Shelves Wide Short': 'Wide Short Shelf',
  'Prop Shelves Thin Tall': 'Tall Narrow Shelf',
  'Prop Shelves Thin Short': 'Short Narrow Shelf',
  'Prop Shelves Wide Tall': 'Tall Wide Shelf',
  'Prop Mine': 'Pickaxe',
  'Prop Crate': 'Wooden Crate',
  'Prop Crate Large': 'Large Wooden Crate',
  'Prop Crate Tarp': 'Covered Crate',
  'Prop Crate Tarp Large': 'Large Covered Crate',
  'Prop Crate3': 'Iron Crate',
  'Prop Crate4': 'Metal Crate',
  'Prop Chair': 'Wooden Chair',
  'Prop Desk Small': 'Small Desk',
  'Prop Desk Medium': 'Writing Desk',
  'Prop Desk L': 'Large Desk',
  'Prop Mug': 'Mug',
  'Prop Barrel1': 'Barrel',
  'Prop Barrel2 Open': 'Open Barrel',
  'Prop Barrel2 Closed': 'Sealed Barrel',
  'Prop Barrel Large': 'Large Barrel',
  'Prop Chest': 'Treasure Chest',
  'Prop Clamp': 'Clamp',
  'Prop Healthpack': 'First Aid Kit',
  'Prop Healthpack Tube': 'Bandage',
  'Prop Syringe': 'Syringe',
  'Prop Grenade': 'Grenade',
  'Prop Keycard': 'Keycard',
  'Prop Ammo': 'Ammunition Box',
  'Prop Ammo Closed': 'Sealed Ammo Box',
  'Prop Ammo Small': 'Small Ammo Pouch',
  'Prop Satellite Dish': 'Satellite Dish',
  'Prop Access Point': 'Wireless Antenna',
  'Prop Cable': 'Cable',
  'Prop Computer': 'Computer',
  'Prop Fan Small': 'Small Fan',
  'Prop Item Holder': 'Display Stand',
  'Prop Light Corner': 'Corner Lamp',
  'Prop Light Floor': 'Floor Lamp',
  'Prop Light Small': 'Small Lamp',
  'Prop Light Wide': 'Wall Light',
  'Prop Pipe Holder': 'Pipe Bracket',
  'Prop Rail': 'Railing',
  'Prop Rail Round Big': 'Large Round Railing',
  'Prop Rail Round Small': 'Small Round Railing',
  'Prop Rail Incline Long L': 'Long Left Ramp Rail',
  'Prop Rail Incline Long R': 'Long Right Ramp Rail',
  'Prop Rail Incline Short L': 'Short Left Ramp Rail',
  'Prop Rail Incline Short R': 'Short Right Ramp Rail',
  'Prop Vent Big': 'Large Vent',
  'Prop Vent Small': 'Small Vent',
  'Prop Vent Wide': 'Wide Vent',

  // ── RPG/SciFi Tags ──────────────────────────────────────────────────────
  'Helmet Rpg': 'Steel Helmet',
  'Scroll Rpg': 'Ancient Scroll',
  'Bow Rpg': 'Longbow',
  'Ring Rpg': 'Signet Ring',
  'Necklace Rpg': 'Gold Necklace',
  'Syringe Scifi': 'Injector',
  'Gun Revolver Scifi': 'Revolver',
  'Gun Rifle Scifi': 'Rifle',
  'Health Pack Scifi': 'Medical Kit',
  'Energy Core Scifi': 'Energy Core',
  'Data Pad Scifi': 'Data Tablet',
  'Grenade Scifi': 'Flash Grenade',
  'Keycard Scifi': 'Access Card',

  // ── Modular ──────────────────────────────────────────────────────────────
  'Modular Electric Cables': 'Electric Cables',
  'Modular Street Seating': 'Street Bench',
  'Modular Wooden Pier': 'Wooden Pier',
  'Modular Airduct Rectangular': 'Air Duct',
  'Modular Industrial Pipes': 'Industrial Pipes',
  'Modular Pipes': 'Pipes',

  // ── Empty suffix ─────────────────────────────────────────────────────────
  'Stall Empty': 'Empty Market Stall',
  'Stall Cart Empty': 'Empty Cart',
  'Farm Crate Empty': 'Empty Farm Crate',
  'Cargo Train Wagon Empty': 'Empty Cargo Wagon',
};

async function main() {
  console.log(`\n=== Migration 062: Rename Base Items ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const coll = db.collection('items');

  let renamed = 0;
  let notFound = 0;

  for (const [oldName, newName] of Object.entries(RENAMES)) {
    const item = await coll.findOne({ name: oldName, isBase: true });
    if (!item) {
      notFound++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  ${oldName} → ${newName}`);
      renamed++;
      continue;
    }

    // Rename and clear translation (will need regeneration)
    await coll.updateOne(
      { _id: item._id },
      {
        $set: { name: newName, updatedAt: new Date() },
        $unset: { translations: '' },
      },
    );
    renamed++;
    console.log(`  ✓ ${oldName} → ${newName}`);
  }

  console.log(`\nRenamed: ${renamed}${DRY_RUN ? ' (dry run)' : ''}`);
  if (notFound > 0) console.log(`Not found (already renamed?): ${notFound}`);

  // Capitalize 'environmental' category
  if (!DRY_RUN) {
    const envResult = await coll.updateMany(
      { isBase: true, itemType: 'environmental' },
      { $set: { itemType: 'Environmental' } },
    );
    // Actually, item types should stay lowercase for consistency with code lookups.
    // Instead, we'll capitalize in the UI display layer.
    if (envResult.modifiedCount > 0) {
      // Revert — capitalize only in the UI
      await coll.updateMany(
        { isBase: true, itemType: 'Environmental' },
        { $set: { itemType: 'environmental' } },
      );
    }
  }

  console.log(`\n=== Done ===\n`);
  console.log('Next steps:');
  console.log('  1. Review renamed items in the Admin Panel');
  console.log('  2. Run: npx tsx server/migrations/046-translate-base-items-french.ts');
  console.log('     to regenerate French translations for renamed items');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
