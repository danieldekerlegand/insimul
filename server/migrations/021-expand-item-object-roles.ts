#!/usr/bin/env tsx
/**
 * Migration 021: Expand objectRole mappings for base items
 *
 * Many base items have objectRole: null, meaning they can't be rendered as 3D
 * objects in the game world. This migration assigns objectRole values to items
 * that can map to existing Polyhaven assets or shared generic roles, enabling
 * them to appear in business interiors, residences, quest scenes, and player
 * inventories.
 *
 * Strategy:
 * - Map items to existing Polyhaven models where a direct match exists
 * - Use generic role families (e.g., "bottle", "sack", "scroll") where multiple
 *   items share a visual form factor
 * - Leave truly unique items (armor worn on body, implants) unmapped since they
 *   are character attachments, not world props
 *
 * Usage:
 *   npx tsx server/migrations/021-expand-item-object-roles.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

interface RoleUpdate {
  name: string;
  worldType: string | null;
  objectRole: string;
}

const ROLE_UPDATES: RoleUpdate[] = [
  // ─── Universal Food & Drink ───────────────────────────────────────────────
  { name: 'Bread', worldType: null, objectRole: 'food_loaf' },
  { name: 'Meat Pie', worldType: null, objectRole: 'food_plate' },
  { name: 'Cheese', worldType: null, objectRole: 'food_wedge' },
  { name: 'Egg', worldType: null, objectRole: 'food_small' },
  { name: 'Honey', worldType: null, objectRole: 'jar' },
  { name: 'Berries', worldType: null, objectRole: 'food_bowl' },
  { name: 'Milk', worldType: null, objectRole: 'bottle' },
  { name: 'Water Bottle', worldType: null, objectRole: 'bottle' },
  { name: 'Flour', worldType: null, objectRole: 'sack' },
  { name: 'Sugar', worldType: null, objectRole: 'jar' },
  { name: 'Oil', worldType: null, objectRole: 'bottle' },
  { name: 'Apple', worldType: null, objectRole: 'food_small' },
  { name: 'Raw Meat', worldType: null, objectRole: 'food_plate' },
  { name: 'Fish', worldType: null, objectRole: 'food_plate' },
  { name: 'Mushroom', worldType: null, objectRole: 'food_small' },
  { name: 'Salt', worldType: null, objectRole: 'jar' },

  // ─── Universal Materials ──────────────────────────────────────────────────
  { name: 'Rope Coil', worldType: null, objectRole: 'rope' },
  { name: 'Nails', worldType: null, objectRole: 'small_box' },
  { name: 'Wax', worldType: null, objectRole: 'small_block' },
  { name: 'Thread', worldType: null, objectRole: 'spool' },
  { name: 'Ink', worldType: null, objectRole: 'inkwell' },
  { name: 'Parchment', worldType: null, objectRole: 'scroll' },
  { name: 'Wood', worldType: null, objectRole: 'plank' },
  { name: 'Stone', worldType: null, objectRole: 'ore_chunk' },
  { name: 'Fiber', worldType: null, objectRole: 'spool' },
  { name: 'Leather', worldType: null, objectRole: 'sack' },
  { name: 'Cloth', worldType: null, objectRole: 'sack' },
  { name: 'Clay', worldType: null, objectRole: 'ore_chunk' },
  { name: 'Glass', worldType: null, objectRole: 'bottle' },
  { name: 'Iron Ingot', worldType: null, objectRole: 'ingot' },
  { name: 'Steel Ingot', worldType: null, objectRole: 'ingot' },
  { name: 'Silver Ingot', worldType: null, objectRole: 'ingot' },
  { name: 'Gold Ingot', worldType: null, objectRole: 'ingot' },
  { name: 'Copper Ore', worldType: null, objectRole: 'ore_chunk' },
  { name: 'Coal', worldType: null, objectRole: 'ore_chunk' },

  // ─── Universal Tools ──────────────────────────────────────────────────────
  { name: 'Knife', worldType: null, objectRole: 'dagger' },
  { name: 'Hammer', worldType: null, objectRole: 'hammer' },
  { name: 'Shovel', worldType: null, objectRole: 'shovel' },
  { name: 'Fishing Rod', worldType: null, objectRole: 'rod' },
  { name: 'Needle', worldType: null, objectRole: 'small_tool' },
  { name: 'Saw', worldType: null, objectRole: 'saw' },
  { name: 'Mortar and Pestle', worldType: null, objectRole: 'mortar' },

  // ─── Universal Containers ─────────────────────────────────────────────────
  { name: 'Sack', worldType: null, objectRole: 'sack' },
  { name: 'Barrel', worldType: null, objectRole: 'barrel' },
  { name: 'Crate', worldType: null, objectRole: 'crate' },

  // ─── Universal Everyday ───────────────────────────────────────────────────
  { name: 'Candle', worldType: null, objectRole: 'candle' },
  { name: 'Key', worldType: null, objectRole: 'key' },
  { name: 'Map', worldType: null, objectRole: 'scroll' },
  { name: 'Book', worldType: null, objectRole: 'book' },
  { name: 'Letter', worldType: null, objectRole: 'scroll' },
  { name: 'Coin Purse', worldType: null, objectRole: 'pouch' },
  { name: 'Rock', worldType: null, objectRole: 'ore_chunk' },
  { name: 'Stick', worldType: null, objectRole: 'plank' },
  { name: 'Bone', worldType: null, objectRole: 'small_prop' },
  { name: 'Feather', worldType: null, objectRole: 'small_prop' },
  { name: 'Shell', worldType: null, objectRole: 'small_prop' },

  // ─── Universal Collectibles ───────────────────────────────────────────────
  { name: 'Flower', worldType: null, objectRole: 'plant' },
  { name: 'Pendant', worldType: null, objectRole: 'amulet' },
  { name: 'Mirror', worldType: null, objectRole: 'small_prop' },
  { name: 'Dice', worldType: null, objectRole: 'small_prop' },
  { name: 'Bell', worldType: null, objectRole: 'bell' },

  // ─── Medieval-Fantasy ─────────────────────────────────────────────────────
  { name: 'Water Flask', worldType: 'medieval-fantasy', objectRole: 'bottle' },
  { name: 'Rope', worldType: 'medieval-fantasy', objectRole: 'rope' },
  { name: 'Iron Ore', worldType: 'medieval-fantasy', objectRole: 'ore_chunk' },
  { name: 'Battle Axe', worldType: 'medieval-fantasy', objectRole: 'axe' },
  { name: 'Mace', worldType: 'medieval-fantasy', objectRole: 'mace' },
  { name: 'Halberd', worldType: 'medieval-fantasy', objectRole: 'spear' },
  { name: 'Steel Sword', worldType: 'medieval-fantasy', objectRole: 'sword' },
  { name: 'Longbow', worldType: 'medieval-fantasy', objectRole: 'bow' },
  { name: 'Crossbow', worldType: 'medieval-fantasy', objectRole: 'bow' },
  { name: 'War Hammer', worldType: 'medieval-fantasy', objectRole: 'hammer' },
  { name: 'Spear', worldType: 'medieval-fantasy', objectRole: 'spear' },
  { name: 'Staff', worldType: 'medieval-fantasy', objectRole: 'staff' },
  { name: 'Iron Shield', worldType: 'medieval-fantasy', objectRole: 'shield' },
  { name: 'Enchanted Ring', worldType: 'medieval-fantasy', objectRole: 'ring' },
  { name: 'Holy Water', worldType: 'medieval-fantasy', objectRole: 'potion' },
  { name: 'Dragon Scale', worldType: 'medieval-fantasy', objectRole: 'gemstone' },
  { name: 'Quiver', worldType: 'medieval-fantasy', objectRole: 'quiver' },
  { name: 'Crystal Ball', worldType: 'medieval-fantasy', objectRole: 'gemstone' },
  { name: 'Stew', worldType: 'medieval-fantasy', objectRole: 'food_bowl' },
  { name: 'Roasted Chicken', worldType: 'medieval-fantasy', objectRole: 'food_plate' },
  { name: 'Ale', worldType: 'medieval-fantasy', objectRole: 'goblet' },
  { name: 'Wine', worldType: 'medieval-fantasy', objectRole: 'goblet' },
  { name: 'Scroll', worldType: 'medieval-fantasy', objectRole: 'scroll' },
  { name: 'Arrow', worldType: 'medieval-fantasy', objectRole: 'small_prop' },
  { name: 'Mana Potion', worldType: 'medieval-fantasy', objectRole: 'potion' },
  { name: 'Antidote', worldType: 'medieval-fantasy', objectRole: 'potion' },
  { name: 'Helmet', worldType: 'medieval-fantasy', objectRole: 'helmet' },

  // ─── Cyberpunk ────────────────────────────────────────────────────────────
  { name: 'EMP Grenade', worldType: 'cyberpunk', objectRole: 'grenade' },
  { name: 'Neural Stim', worldType: 'cyberpunk', objectRole: 'syringe' },
  { name: 'Med-Hypo', worldType: 'cyberpunk', objectRole: 'syringe' },
  { name: 'Synth-Food Bar', worldType: 'cyberpunk', objectRole: 'food_bar' },
  { name: 'Credstick', worldType: 'cyberpunk', objectRole: 'card' },
  { name: 'Shock Baton', worldType: 'cyberpunk', objectRole: 'baton' },
  { name: 'Plasma Rifle', worldType: 'cyberpunk', objectRole: 'rifle' },
  { name: 'Nano-Wire', worldType: 'cyberpunk', objectRole: 'wire_coil' },
  { name: 'Reflex Booster', worldType: 'cyberpunk', objectRole: 'syringe' },
  { name: 'Stim Pack', worldType: 'cyberpunk', objectRole: 'med_pack' },
  { name: 'E-Ration', worldType: 'cyberpunk', objectRole: 'food_bar' },
  { name: 'Neon Drink', worldType: 'cyberpunk', objectRole: 'drink_can' },
  { name: 'Hacking Spike', worldType: 'cyberpunk', objectRole: 'card' },
  { name: 'ID Chip', worldType: 'cyberpunk', objectRole: 'card' },
  { name: 'Scrap Metal', worldType: 'cyberpunk', objectRole: 'ore_chunk' },
  { name: 'Circuit Board', worldType: 'cyberpunk', objectRole: 'small_prop' },

  // ─── Sci-Fi-Space ─────────────────────────────────────────────────────────
  { name: 'Energy Cell', worldType: 'sci-fi-space', objectRole: 'battery' },
  { name: 'Emergency Ration', worldType: 'sci-fi-space', objectRole: 'food_bar' },
  { name: 'Oxygen Tank', worldType: 'sci-fi-space', objectRole: 'tank' },
  { name: 'Repair Kit', worldType: 'sci-fi-space', objectRole: 'toolbox' },
  { name: 'Medi-Gel', worldType: 'sci-fi-space', objectRole: 'med_pack' },
  { name: 'Star Map Fragment', worldType: 'sci-fi-space', objectRole: 'scroll' },
  { name: 'Laser Rifle', worldType: 'sci-fi-space', objectRole: 'rifle' },
  { name: 'Stun Baton', worldType: 'sci-fi-space', objectRole: 'baton' },
  { name: 'Bio-Gel Pack', worldType: 'sci-fi-space', objectRole: 'med_pack' },
  { name: 'Stim Injector', worldType: 'sci-fi-space', objectRole: 'syringe' },
  { name: 'Nutrient Paste', worldType: 'sci-fi-space', objectRole: 'food_bar' },
  { name: 'Protein Bar', worldType: 'sci-fi-space', objectRole: 'food_bar' },
  { name: 'Data Crystal', worldType: 'sci-fi-space', objectRole: 'gemstone' },
  { name: 'Access Keycard', worldType: 'sci-fi-space', objectRole: 'card' },
  { name: 'Titanium Alloy', worldType: 'sci-fi-space', objectRole: 'ingot' },
  { name: 'Quantum Chip', worldType: 'sci-fi-space', objectRole: 'small_prop' },
  { name: 'Scanner', worldType: 'sci-fi-space', objectRole: 'small_tool' },
  { name: 'Multi-Tool', worldType: 'sci-fi-space', objectRole: 'small_tool' },

  // ─── Western ──────────────────────────────────────────────────────────────
  { name: 'Lasso', worldType: 'western', objectRole: 'rope' },
  { name: 'Whiskey', worldType: 'western', objectRole: 'bottle' },
  { name: 'Dynamite', worldType: 'western', objectRole: 'dynamite' },
  { name: 'Bandage', worldType: 'western', objectRole: 'med_pack' },
  { name: 'Rifle', worldType: 'western', objectRole: 'rifle' },
  { name: 'Shotgun', worldType: 'western', objectRole: 'rifle' },
  { name: 'Bowie Knife', worldType: 'western', objectRole: 'dagger' },
  { name: 'Bullets', worldType: 'western', objectRole: 'small_box' },
  { name: 'Moonshine', worldType: 'western', objectRole: 'bottle' },
  { name: 'Beef Jerky', worldType: 'western', objectRole: 'food_small' },
  { name: 'Canned Beans', worldType: 'western', objectRole: 'can' },
  { name: 'Pocket Watch', worldType: 'western', objectRole: 'small_prop' },
  { name: 'Harmonica', worldType: 'western', objectRole: 'small_prop' },
  { name: 'Gold Nugget', worldType: 'western', objectRole: 'ore_chunk' },
  { name: 'Tobacco Pouch', worldType: 'western', objectRole: 'pouch' },
  { name: 'Saddle', worldType: 'western', objectRole: 'saddle' },

  // ─── Historical-Ancient ───────────────────────────────────────────────────
  { name: 'Bronze Sword', worldType: 'historical-ancient', objectRole: 'sword' },
  { name: 'Javelin', worldType: 'historical-ancient', objectRole: 'spear' },
  { name: 'Gladius', worldType: 'historical-ancient', objectRole: 'sword' },
  { name: 'Round Shield', worldType: 'historical-ancient', objectRole: 'shield' },
  { name: 'Laurel Wreath', worldType: 'historical-ancient', objectRole: 'crown' },
  { name: 'Olive Oil', worldType: 'historical-ancient', objectRole: 'bottle' },
  { name: 'Flatbread', worldType: 'historical-ancient', objectRole: 'food_loaf' },
  { name: 'Wine Jug', worldType: 'historical-ancient', objectRole: 'bottle' },
  { name: 'Papyrus Scroll', worldType: 'historical-ancient', objectRole: 'scroll' },
  { name: 'Ancient Coin', worldType: 'historical-ancient', objectRole: 'small_prop' },

  // ─── Post-Apocalyptic ─────────────────────────────────────────────────────
  { name: 'Pipe Wrench', worldType: 'post-apocalyptic', objectRole: 'hammer' },
  { name: 'Makeshift Rifle', worldType: 'post-apocalyptic', objectRole: 'rifle' },
  { name: 'Spiked Bat', worldType: 'post-apocalyptic', objectRole: 'baton' },
  { name: 'Canned Food', worldType: 'post-apocalyptic', objectRole: 'can' },
  { name: 'Purified Water', worldType: 'post-apocalyptic', objectRole: 'bottle' },
  { name: 'Rad-Away', worldType: 'post-apocalyptic', objectRole: 'med_pack' },
  { name: 'Duct Tape', worldType: 'post-apocalyptic', objectRole: 'spool' },
  { name: 'Fuel Can', worldType: 'post-apocalyptic', objectRole: 'barrel' },
  { name: 'Geiger Counter', worldType: 'post-apocalyptic', objectRole: 'small_tool' },

  // ─── Tropical-Pirate ──────────────────────────────────────────────────────
  { name: 'Flintlock Pistol', worldType: 'tropical-pirate', objectRole: 'pistol' },
  { name: 'Boarding Axe', worldType: 'tropical-pirate', objectRole: 'axe' },
  { name: 'Rum', worldType: 'tropical-pirate', objectRole: 'bottle' },
  { name: 'Coconut', worldType: 'tropical-pirate', objectRole: 'food_small' },
  { name: 'Banana', worldType: 'tropical-pirate', objectRole: 'food_small' },
  { name: 'Treasure Map', worldType: 'tropical-pirate', objectRole: 'scroll' },
  { name: 'Gold Doubloon', worldType: 'tropical-pirate', objectRole: 'small_prop' },
  { name: 'Pearl', worldType: 'tropical-pirate', objectRole: 'gemstone' },
  { name: 'Spyglass', worldType: 'tropical-pirate', objectRole: 'small_tool' },
  { name: 'Compass', worldType: 'tropical-pirate', objectRole: 'small_tool' },
  { name: 'Fishing Net', worldType: 'tropical-pirate', objectRole: 'rope' },

  // ─── Steampunk ────────────────────────────────────────────────────────────
  { name: 'Steam Pistol', worldType: 'steampunk', objectRole: 'pistol' },
  { name: 'Clockwork Sword', worldType: 'steampunk', objectRole: 'sword' },
  { name: 'Clockwork Key', worldType: 'steampunk', objectRole: 'key' },
  { name: 'Gear Set', worldType: 'steampunk', objectRole: 'small_prop' },
  { name: 'Steam Core', worldType: 'steampunk', objectRole: 'battery' },
  { name: 'Tea', worldType: 'steampunk', objectRole: 'goblet' },
  { name: 'Scone', worldType: 'steampunk', objectRole: 'food_small' },
  { name: 'Pocket Chronometer', worldType: 'steampunk', objectRole: 'small_prop' },
  { name: 'Monocle', worldType: 'steampunk', objectRole: 'small_prop' },

  // ─── Modern-Realistic ─────────────────────────────────────────────────────
  { name: 'Smartphone', worldType: 'modern-realistic', objectRole: 'small_prop' },
  { name: 'Backpack', worldType: 'modern-realistic', objectRole: 'sack' },
  { name: 'First Aid Kit', worldType: 'modern-realistic', objectRole: 'toolbox' },
  { name: 'Energy Drink', worldType: 'modern-realistic', objectRole: 'drink_can' },
  { name: 'Coffee', worldType: 'modern-realistic', objectRole: 'goblet' },
  { name: 'Sandwich', worldType: 'modern-realistic', objectRole: 'food_plate' },
  { name: 'Pizza Slice', worldType: 'modern-realistic', objectRole: 'food_plate' },
  { name: 'Notebook', worldType: 'modern-realistic', objectRole: 'book' },
  { name: 'Wallet', worldType: 'modern-realistic', objectRole: 'pouch' },
  { name: 'Umbrella', worldType: 'modern-realistic', objectRole: 'staff' },
  { name: 'Flashlight', worldType: 'modern-realistic', objectRole: 'lantern' },
  { name: 'Sunglasses', worldType: 'modern-realistic', objectRole: 'small_prop' },
  { name: 'Headphones', worldType: 'modern-realistic', objectRole: 'small_prop' },
  { name: 'USB Drive', worldType: 'modern-realistic', objectRole: 'card' },
  { name: 'Battery', worldType: 'modern-realistic', objectRole: 'battery' },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const col = db.collection('items');

  console.log(`Updating objectRole for ${ROLE_UPDATES.length} base items...`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const update of ROLE_UPDATES) {
    // Build query: match by name, isBase=true, and worldType
    const query: any = {
      name: update.name,
      isBase: true,
    };
    if (update.worldType === null) {
      query.$or = [{ worldType: null }, { worldType: { $exists: false } }];
    } else {
      query.worldType = update.worldType;
    }

    // Only update if objectRole is currently null/missing
    const result = await col.updateOne(
      { ...query, $or: [{ objectRole: null }, { objectRole: { $exists: false } }] },
      { $set: { objectRole: update.objectRole, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      // Check if it exists but already has an objectRole
      const exists = await col.findOne(query);
      if (exists) {
        skipped++; // already has a role
      } else {
        notFound++; // item doesn't exist in DB
      }
    } else {
      updated++;
    }
  }

  // Summary
  const totalBase = await col.countDocuments({ isBase: true });
  const withRole = await col.countDocuments({ isBase: true, objectRole: { $ne: null, $exists: true } });
  const withoutRole = await col.countDocuments({
    isBase: true,
    $or: [{ objectRole: null }, { objectRole: { $exists: false } }],
  });

  console.log(`\nResults:`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (already has role): ${skipped}`);
  console.log(`  Not found in DB: ${notFound}`);
  console.log(`\nTotal base items: ${totalBase}`);
  console.log(`  With objectRole: ${withRole}`);
  console.log(`  Without objectRole: ${withoutRole}`);
  console.log(`  Coverage: ${Math.round((withRole / totalBase) * 100)}%`);

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
