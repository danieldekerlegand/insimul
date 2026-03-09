#!/usr/bin/env tsx
/**
 * Migration: Seed Base Items
 *
 * Inserts global base items (isBase=true, worldId=null) into the database.
 * These items serve as templates for each world type, providing default
 * inventories, shop stock, loot tables, and objectRole mappings.
 *
 * Usage:
 *   npx tsx server/migrations/011-seed-base-items.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

interface BaseItem {
  name: string;
  description: string;
  itemType: string;
  icon: string;
  value: number;
  sellValue: number;
  weight: number;
  tradeable: boolean;
  stackable: boolean;
  maxStack: number;
  worldType: string | null;
  objectRole: string | null;
  effects: Record<string, number> | null;
  lootWeight: number;
  tags: string[];
}

const BASE_ITEMS: BaseItem[] = [
  // ============= MEDIEVAL-FANTASY =============

  // Weapons
  {
    name: 'Iron Sword', description: 'A well-forged iron sword suitable for combat.',
    itemType: 'weapon', icon: '⚔️', value: 25, sellValue: 15, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'sword',
    effects: { attackPower: 0.5 }, lootWeight: 20, tags: ['weapon', 'melee', 'loot:common'],
  },
  {
    name: 'Dagger', description: 'A sharp steel dagger, quick and deadly.',
    itemType: 'weapon', icon: '🗡️', value: 10, sellValue: 6, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'dagger',
    effects: { attackPower: 0.3 }, lootWeight: 30, tags: ['weapon', 'melee', 'loot:common'],
  },
  {
    name: 'Wooden Bow', description: 'A simple bow crafted from yew wood.',
    itemType: 'weapon', icon: '🏹', value: 18, sellValue: 11, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'bow',
    effects: { attackPower: 0.4 }, lootWeight: 15, tags: ['weapon', 'ranged', 'loot:common'],
  },

  // Armor
  {
    name: 'Wooden Shield', description: 'A simple wooden shield offering modest protection.',
    itemType: 'armor', icon: '🛡️', value: 20, sellValue: 12, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'shield',
    effects: { defense: 8 }, lootWeight: 15, tags: ['armor', 'loot:common'],
  },
  {
    name: 'Chainmail Vest', description: 'A vest of interlocking iron rings.',
    itemType: 'armor', icon: '🦺', value: 40, sellValue: 24, weight: 8,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'chainmail',
    effects: { defense: 15 }, lootWeight: 8, tags: ['armor', 'loot:uncommon'],
  },
  {
    name: 'Leather Boots', description: 'Comfortable leather boots for long journeys.',
    itemType: 'armor', icon: '👢', value: 12, sellValue: 7, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'boots',
    effects: { defense: 5 }, lootWeight: 20, tags: ['armor', 'loot:common'],
  },

  // Consumables
  {
    name: 'Health Potion', description: 'Restores a moderate amount of health.',
    itemType: 'consumable', icon: '🧪', value: 15, sellValue: 9, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'medieval-fantasy', objectRole: 'potion',
    effects: { health: 50 }, lootWeight: 25, tags: ['consumable', 'healing', 'loot:common'],
  },
  {
    name: 'Antidote', description: 'Cures common poisons.',
    itemType: 'consumable', icon: '💊', value: 12, sellValue: 7, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { cure_poison: 1 }, lootWeight: 10, tags: ['consumable', 'loot:uncommon'],
  },
  {
    name: 'Healing Herb', description: 'A herb with mild restorative properties.',
    itemType: 'consumable', icon: '🌿', value: 8, sellValue: 5, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: 'medieval-fantasy', objectRole: 'herb',
    effects: { health: 20 }, lootWeight: 35, tags: ['consumable', 'healing', 'material', 'loot:common'],
  },

  // Food & Drink
  {
    name: 'Bread', description: 'A fresh loaf of bread.',
    itemType: 'food', icon: '🍞', value: 2, sellValue: 1, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { energy: 10 }, lootWeight: 40, tags: ['food', 'loot:common'],
  },
  {
    name: 'Meat Pie', description: 'A hearty meat pie.',
    itemType: 'food', icon: '🥧', value: 5, sellValue: 3, weight: 0.8,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { energy: 25 }, lootWeight: 15, tags: ['food', 'loot:common'],
  },
  {
    name: 'Water Flask', description: 'A flask of clean water.',
    itemType: 'drink', icon: '🫗', value: 1, sellValue: 0, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { energy: 5 }, lootWeight: 30, tags: ['drink', 'loot:common'],
  },

  // Tools
  {
    name: 'Torch', description: 'A sturdy torch for dark places.',
    itemType: 'tool', icon: '🔥', value: 3, sellValue: 1, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: 'torch',
    effects: null, lootWeight: 25, tags: ['tool', 'light', 'loot:common'],
  },
  {
    name: 'Iron Pickaxe', description: 'A heavy pickaxe for mining.',
    itemType: 'tool', icon: '⛏️', value: 15, sellValue: 9, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'pickaxe',
    effects: null, lootWeight: 5, tags: ['tool'],
  },
  {
    name: 'Rope', description: 'Strong hemp rope, 50 feet.',
    itemType: 'tool', icon: '🪢', value: 5, sellValue: 3, weight: 3,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: null, lootWeight: 10, tags: ['tool', 'loot:common'],
  },
  {
    name: 'Oil Lantern', description: 'A lantern that casts a warm glow.',
    itemType: 'tool', icon: '🏮', value: 8, sellValue: 5, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'lantern',
    effects: null, lootWeight: 10, tags: ['tool', 'light', 'loot:uncommon'],
  },

  // Collectibles
  {
    name: 'Golden Goblet', description: 'An ornate goblet, likely used in royal feasts.',
    itemType: 'collectible', icon: '🏆', value: 50, sellValue: 30, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'goblet',
    effects: null, lootWeight: 3, tags: ['collectible', 'treasure', 'loot:rare'],
  },
  {
    name: 'Jeweled Crown', description: 'A crown encrusted with jewels, symbol of authority.',
    itemType: 'key', icon: '👑', value: 100, sellValue: 60, weight: 1,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'crown',
    effects: null, lootWeight: 1, tags: ['key', 'treasure', 'loot:rare'],
  },
  {
    name: 'Treasure Chest', description: 'A sturdy chest that once held valuables.',
    itemType: 'collectible', icon: '📦', value: 30, sellValue: 18, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'chest',
    effects: null, lootWeight: 5, tags: ['collectible', 'container', 'loot:uncommon'],
  },
  {
    name: 'Silver Ring', description: 'A finely crafted silver ring.',
    itemType: 'collectible', icon: '💍', value: 30, sellValue: 18, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'ring',
    effects: null, lootWeight: 5, tags: ['collectible', 'jewelry', 'loot:uncommon'],
  },
  {
    name: 'Gold Amulet', description: 'An ornate gold amulet.',
    itemType: 'collectible', icon: '📿', value: 50, sellValue: 30, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'amulet',
    effects: null, lootWeight: 3, tags: ['collectible', 'jewelry', 'loot:rare'],
  },
  {
    name: 'Gemstone', description: 'A polished precious gemstone.',
    itemType: 'material', icon: '💎', value: 40, sellValue: 24, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: 'gemstone',
    effects: null, lootWeight: 3, tags: ['material', 'treasure', 'loot:rare'],
  },

  // Materials
  {
    name: 'Iron Ore', description: 'Raw iron ore ready for smelting.',
    itemType: 'material', icon: '🪨', value: 5, sellValue: 3, weight: 3,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'crafting', 'loot:common'],
  },

  // ============= CYBERPUNK =============

  // Weapons
  {
    name: 'Cyber-Blade', description: 'A retractable mono-molecular blade implant.',
    itemType: 'weapon', icon: '🔪', value: 35, sellValue: 21, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: 'blade',
    effects: { attackPower: 0.6 }, lootWeight: 15, tags: ['weapon', 'melee', 'cyber', 'loot:uncommon'],
  },
  {
    name: 'Pulse Pistol', description: 'A compact energy sidearm.',
    itemType: 'weapon', icon: '🔫', value: 30, sellValue: 18, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: 'pistol',
    effects: { attackPower: 0.7 }, lootWeight: 20, tags: ['weapon', 'ranged', 'loot:common'],
  },
  {
    name: 'EMP Grenade', description: 'Disables electronics in a small radius.',
    itemType: 'weapon', icon: '💣', value: 20, sellValue: 12, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'cyberpunk', objectRole: null,
    effects: { attackPower: 0.8 }, lootWeight: 10, tags: ['weapon', 'explosive', 'loot:uncommon'],
  },

  // Consumables
  {
    name: 'Neural Stim', description: 'Boosts cognitive function temporarily.',
    itemType: 'consumable', icon: '💉', value: 18, sellValue: 11, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'cyberpunk', objectRole: null,
    effects: { energy: 40 }, lootWeight: 20, tags: ['consumable', 'stim', 'loot:common'],
  },
  {
    name: 'Med-Hypo', description: 'An auto-injecting medical treatment.',
    itemType: 'consumable', icon: '🩹', value: 15, sellValue: 9, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'cyberpunk', objectRole: null,
    effects: { health: 50 }, lootWeight: 25, tags: ['consumable', 'healing', 'loot:common'],
  },
  {
    name: 'Synth-Food Bar', description: 'Compressed synthetic nutrition.',
    itemType: 'food', icon: '🍫', value: 3, sellValue: 1, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: 'cyberpunk', objectRole: null,
    effects: { energy: 15 }, lootWeight: 35, tags: ['food', 'loot:common'],
  },

  // Key/Quest items
  {
    name: 'Encrypted Data Pad', description: 'A handheld device containing encrypted data.',
    itemType: 'key', icon: '📱', value: 40, sellValue: 24, weight: 0.5,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: 'data_pad',
    effects: null, lootWeight: 5, tags: ['key', 'tech', 'loot:rare'],
  },
  {
    name: 'Energy Core', description: 'A pulsating core of stored energy.',
    itemType: 'material', icon: '⚡', value: 35, sellValue: 21, weight: 2,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'cyberpunk', objectRole: 'energy_core',
    effects: null, lootWeight: 8, tags: ['material', 'tech', 'loot:uncommon'],
  },
  {
    name: 'Cyber-Deck', description: 'A portable hacking interface.',
    itemType: 'tool', icon: '💻', value: 50, sellValue: 30, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: 'console',
    effects: null, lootWeight: 3, tags: ['tool', 'tech', 'loot:rare'],
  },
  {
    name: 'Supply Crate', description: 'A crate of supplies from the corporate sector.',
    itemType: 'collectible', icon: '📦', value: 20, sellValue: 12, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: 'crate',
    effects: null, lootWeight: 10, tags: ['collectible', 'container', 'loot:uncommon'],
  },
  {
    name: 'Credstick', description: 'A digital currency storage device.',
    itemType: 'collectible', icon: '💳', value: 25, sellValue: 25, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'cyberpunk', objectRole: null,
    effects: null, lootWeight: 15, tags: ['collectible', 'currency', 'loot:common'],
  },

  // ============= SCI-FI-SPACE =============

  {
    name: 'Plasma Pistol', description: 'A standard-issue plasma sidearm.',
    itemType: 'weapon', icon: '🔫', value: 30, sellValue: 18, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: 'pistol',
    effects: { attackPower: 0.8 }, lootWeight: 20, tags: ['weapon', 'ranged', 'loot:common'],
  },
  {
    name: 'Energy Cell', description: 'A rechargeable power source for weapons.',
    itemType: 'material', icon: '🔋', value: 8, sellValue: 5, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 30, tags: ['material', 'ammo', 'loot:common'],
  },
  {
    name: 'Emergency Ration', description: 'Compact emergency food supply.',
    itemType: 'food', icon: '🥫', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { energy: 20 }, lootWeight: 25, tags: ['food', 'loot:common'],
  },
  {
    name: 'Oxygen Tank', description: 'A portable oxygen supply.',
    itemType: 'consumable', icon: '🫁', value: 12, sellValue: 7, weight: 3,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { health: 30 }, lootWeight: 15, tags: ['consumable', 'survival', 'loot:common'],
  },
  {
    name: 'Repair Kit', description: 'Tools and parts for equipment maintenance.',
    itemType: 'tool', icon: '🔧', value: 20, sellValue: 12, weight: 2,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 10, tags: ['tool', 'loot:uncommon'],
  },
  {
    name: 'Medi-Gel', description: 'An advanced wound-sealing compound.',
    itemType: 'consumable', icon: '🩹', value: 18, sellValue: 11, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { health: 60 }, lootWeight: 20, tags: ['consumable', 'healing', 'loot:common'],
  },
  {
    name: 'Star Map Fragment', description: 'A piece of an ancient navigation chart.',
    itemType: 'key', icon: '🗺️', value: 60, sellValue: 36, weight: 0.1,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 2, tags: ['key', 'loot:rare'],
  },

  // ============= WESTERN =============

  {
    name: 'Revolver', description: 'A classic six-shooter from a wilder age.',
    itemType: 'weapon', icon: '🔫', value: 25, sellValue: 15, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: 'revolver',
    effects: { attackPower: 0.5 }, lootWeight: 15, tags: ['weapon', 'ranged', 'loot:common'],
  },
  {
    name: 'Lasso', description: 'A sturdy rope for wrangling.',
    itemType: 'tool', icon: '🪢', value: 8, sellValue: 5, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: null, lootWeight: 10, tags: ['tool', 'loot:common'],
  },
  {
    name: 'Whiskey', description: 'A bottle of strong frontier whiskey.',
    itemType: 'drink', icon: '🥃', value: 5, sellValue: 3, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'western', objectRole: null,
    effects: { health: 10, energy: 15 }, lootWeight: 20, tags: ['drink', 'loot:common'],
  },
  {
    name: 'Dynamite', description: 'Explosive sticks for demolition.',
    itemType: 'weapon', icon: '🧨', value: 15, sellValue: 9, weight: 1,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'western', objectRole: null,
    effects: { attackPower: 1.0 }, lootWeight: 5, tags: ['weapon', 'explosive', 'loot:uncommon'],
  },
  {
    name: 'Wanted Poster', description: 'A poster describing a notorious outlaw.',
    itemType: 'quest', icon: '📜', value: 0, sellValue: 0, weight: 0.1,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: 'wanted_poster',
    effects: null, lootWeight: 0, tags: ['quest'],
  },
  {
    name: 'Bandage', description: 'Basic medical wrappings.',
    itemType: 'consumable', icon: '🩹', value: 5, sellValue: 3, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'western', objectRole: null,
    effects: { health: 25 }, lootWeight: 25, tags: ['consumable', 'healing', 'loot:common'],
  },

  // ============= UNIVERSAL (all world types) =============

  {
    name: 'Bookshelf', description: 'A shelf filled with dusty tomes and secrets.',
    itemType: 'collectible', icon: '📚', value: 10, sellValue: 6, weight: 10,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'bookshelf',
    effects: null, lootWeight: 0, tags: ['collectible', 'furniture'],
  },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const itemsCollection = db.collection('items');

  // Check for existing base items
  const existingCount = await itemsCollection.countDocuments({ isBase: true });
  console.log(`Found ${existingCount} existing base items.`);

  let inserted = 0;
  let skipped = 0;

  for (const item of BASE_ITEMS) {
    // Skip if a base item with the same name and worldType already exists
    const existing = await itemsCollection.findOne({
      name: item.name,
      worldType: item.worldType,
      isBase: true,
    });
    if (existing) {
      console.log(`  Skipping "${item.name}" [${item.worldType || 'universal'}] (already exists)`);
      skipped++;
      continue;
    }

    await itemsCollection.insertOne({
      ...item,
      isBase: true,
      worldId: null,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`  Inserted "${item.name}" [${item.worldType || 'universal'}] (${item.itemType})`);
    inserted++;
  }

  console.log(`\nDone! Inserted ${inserted} base items, skipped ${skipped}.`);
  console.log(`Total base items in database: ${await itemsCollection.countDocuments({ isBase: true })}`);

  // Create indexes
  await itemsCollection.createIndex({ worldId: 1 });
  await itemsCollection.createIndex({ isBase: 1, worldType: 1 });
  console.log('Indexes created.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
