#!/usr/bin/env tsx
/**
 * Migration 016: Expand Base Items with Taxonomy
 *
 * 1. Backfills taxonomy fields (category, material, baseType, rarity) on existing base items
 * 2. Adds new universal base items that could exist in most world types
 * 3. Adds crafting materials, natural resources, and common everyday items
 *
 * Usage:
 *   npx tsx server/migrations/016-expand-base-items-taxonomy.ts
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

// ── Taxonomy backfill for existing items ────────────────────────────────────

interface TaxonomyPatch {
  name: string;
  worldType: string | null;
  category: string;
  material: string | null;
  baseType: string;
  rarity: string;
}

const EXISTING_PATCHES: TaxonomyPatch[] = [
  // Medieval-Fantasy
  { name: 'Iron Sword', worldType: 'medieval-fantasy', category: 'melee_weapon', material: 'iron', baseType: 'sword', rarity: 'common' },
  { name: 'Dagger', worldType: 'medieval-fantasy', category: 'melee_weapon', material: 'steel', baseType: 'dagger', rarity: 'common' },
  { name: 'Wooden Bow', worldType: 'medieval-fantasy', category: 'ranged_weapon', material: 'wood', baseType: 'bow', rarity: 'common' },
  { name: 'Wooden Shield', worldType: 'medieval-fantasy', category: 'shield', material: 'wood', baseType: 'shield', rarity: 'common' },
  { name: 'Chainmail Vest', worldType: 'medieval-fantasy', category: 'heavy_armor', material: 'iron', baseType: 'body_armor', rarity: 'uncommon' },
  { name: 'Leather Boots', worldType: 'medieval-fantasy', category: 'light_armor', material: 'leather', baseType: 'boots', rarity: 'common' },
  { name: 'Health Potion', worldType: 'medieval-fantasy', category: 'potion', material: null, baseType: 'potion', rarity: 'common' },
  { name: 'Antidote', worldType: 'medieval-fantasy', category: 'potion', material: null, baseType: 'potion', rarity: 'uncommon' },
  { name: 'Healing Herb', worldType: 'medieval-fantasy', category: 'ingredient', material: null, baseType: 'herb', rarity: 'common' },
  { name: 'Bread', worldType: 'medieval-fantasy', category: 'food', material: null, baseType: 'bread', rarity: 'common' },
  { name: 'Meat Pie', worldType: 'medieval-fantasy', category: 'food', material: null, baseType: 'cooked_meal', rarity: 'common' },
  { name: 'Water Flask', worldType: 'medieval-fantasy', category: 'drink', material: null, baseType: 'flask', rarity: 'common' },
  { name: 'Torch', worldType: 'medieval-fantasy', category: 'light_source', material: 'wood', baseType: 'torch', rarity: 'common' },
  { name: 'Iron Pickaxe', worldType: 'medieval-fantasy', category: 'tool', material: 'iron', baseType: 'pickaxe', rarity: 'common' },
  { name: 'Rope', worldType: 'medieval-fantasy', category: 'utility', material: 'fiber', baseType: 'rope', rarity: 'common' },
  { name: 'Oil Lantern', worldType: 'medieval-fantasy', category: 'light_source', material: 'iron', baseType: 'lantern', rarity: 'uncommon' },
  { name: 'Golden Goblet', worldType: 'medieval-fantasy', category: 'treasure', material: 'gold', baseType: 'goblet', rarity: 'rare' },
  { name: 'Jeweled Crown', worldType: 'medieval-fantasy', category: 'treasure', material: 'gold', baseType: 'crown', rarity: 'rare' },
  { name: 'Treasure Chest', worldType: 'medieval-fantasy', category: 'container', material: 'wood', baseType: 'chest', rarity: 'uncommon' },
  { name: 'Silver Ring', worldType: 'medieval-fantasy', category: 'jewelry', material: 'silver', baseType: 'ring', rarity: 'uncommon' },
  { name: 'Gold Amulet', worldType: 'medieval-fantasy', category: 'jewelry', material: 'gold', baseType: 'amulet', rarity: 'rare' },
  { name: 'Gemstone', worldType: 'medieval-fantasy', category: 'gemstone', material: null, baseType: 'gemstone', rarity: 'rare' },
  { name: 'Iron Ore', worldType: 'medieval-fantasy', category: 'ore', material: 'iron', baseType: 'ore', rarity: 'common' },

  // Cyberpunk
  { name: 'Cyber-Blade', worldType: 'cyberpunk', category: 'melee_weapon', material: 'composite', baseType: 'blade', rarity: 'uncommon' },
  { name: 'Pulse Pistol', worldType: 'cyberpunk', category: 'ranged_weapon', material: 'composite', baseType: 'pistol', rarity: 'common' },
  { name: 'EMP Grenade', worldType: 'cyberpunk', category: 'explosive', material: null, baseType: 'grenade', rarity: 'uncommon' },
  { name: 'Neural Stim', worldType: 'cyberpunk', category: 'stimulant', material: null, baseType: 'stim', rarity: 'common' },
  { name: 'Med-Hypo', worldType: 'cyberpunk', category: 'medical', material: null, baseType: 'injector', rarity: 'common' },
  { name: 'Synth-Food Bar', worldType: 'cyberpunk', category: 'food', material: null, baseType: 'ration', rarity: 'common' },
  { name: 'Encrypted Data Pad', worldType: 'cyberpunk', category: 'data', material: null, baseType: 'data_pad', rarity: 'rare' },
  { name: 'Energy Core', worldType: 'cyberpunk', category: 'component', material: null, baseType: 'power_cell', rarity: 'uncommon' },
  { name: 'Cyber-Deck', worldType: 'cyberpunk', category: 'tool', material: 'composite', baseType: 'computer', rarity: 'rare' },
  { name: 'Supply Crate', worldType: 'cyberpunk', category: 'container', material: null, baseType: 'crate', rarity: 'uncommon' },
  { name: 'Credstick', worldType: 'cyberpunk', category: 'currency', material: null, baseType: 'currency', rarity: 'common' },

  // Sci-Fi
  { name: 'Plasma Pistol', worldType: 'sci-fi-space', category: 'ranged_weapon', material: 'composite', baseType: 'pistol', rarity: 'common' },
  { name: 'Energy Cell', worldType: 'sci-fi-space', category: 'ammunition', material: null, baseType: 'ammo', rarity: 'common' },
  { name: 'Emergency Ration', worldType: 'sci-fi-space', category: 'food', material: null, baseType: 'ration', rarity: 'common' },
  { name: 'Oxygen Tank', worldType: 'sci-fi-space', category: 'survival', material: null, baseType: 'tank', rarity: 'common' },
  { name: 'Repair Kit', worldType: 'sci-fi-space', category: 'tool', material: null, baseType: 'kit', rarity: 'uncommon' },
  { name: 'Medi-Gel', worldType: 'sci-fi-space', category: 'medical', material: null, baseType: 'salve', rarity: 'common' },
  { name: 'Star Map Fragment', worldType: 'sci-fi-space', category: 'data', material: null, baseType: 'map', rarity: 'rare' },

  // Western
  { name: 'Revolver', worldType: 'western', category: 'ranged_weapon', material: 'iron', baseType: 'pistol', rarity: 'common' },
  { name: 'Lasso', worldType: 'western', category: 'tool', material: 'fiber', baseType: 'rope', rarity: 'common' },
  { name: 'Whiskey', worldType: 'western', category: 'drink', material: null, baseType: 'bottle', rarity: 'common' },
  { name: 'Dynamite', worldType: 'western', category: 'explosive', material: null, baseType: 'explosive', rarity: 'uncommon' },
  { name: 'Wanted Poster', worldType: 'western', category: 'document', material: 'paper', baseType: 'poster', rarity: 'common' },
  { name: 'Bandage', worldType: 'western', category: 'medical', material: 'cloth', baseType: 'bandage', rarity: 'common' },

  // Universal
  { name: 'Bookshelf', worldType: null, category: 'furniture', material: 'wood', baseType: 'bookshelf', rarity: 'common' },
];

// ── New universal base items ────────────────────────────────────────────────

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
  category: string;
  material: string | null;
  baseType: string;
  rarity: string;
}

const NEW_ITEMS: BaseItem[] = [
  // ═══════════════════════════════════════════════════════════════
  // UNIVERSAL ITEMS (worldType: null — available in all worlds)
  // ═══════════════════════════════════════════════════════════════

  // ── Natural Resources / Raw Materials ──
  { name: 'Wood', description: 'A bundle of cut wood, useful for building and crafting.',
    itemType: 'material', icon: '🪵', value: 2, sellValue: 1, weight: 3,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: null, objectRole: 'wood',
    effects: null, lootWeight: 40, tags: ['material', 'crafting', 'natural', 'loot:common'],
    category: 'raw_material', material: 'wood', baseType: 'wood', rarity: 'common' },

  { name: 'Stone', description: 'A chunk of rough stone.',
    itemType: 'material', icon: '🪨', value: 1, sellValue: 0, weight: 4,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: null, objectRole: 'stone',
    effects: null, lootWeight: 40, tags: ['material', 'crafting', 'natural', 'loot:common'],
    category: 'raw_material', material: 'stone', baseType: 'stone', rarity: 'common' },

  { name: 'Fiber', description: 'Plant fibers that can be woven into cloth or rope.',
    itemType: 'material', icon: '🧵', value: 1, sellValue: 0, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 35, tags: ['material', 'crafting', 'natural', 'loot:common'],
    category: 'raw_material', material: 'fiber', baseType: 'fiber', rarity: 'common' },

  { name: 'Leather', description: 'Tanned animal hide, useful for armor and clothing.',
    itemType: 'material', icon: '🟤', value: 5, sellValue: 3, weight: 2,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 20, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'leather', baseType: 'leather', rarity: 'common' },

  { name: 'Cloth', description: 'A bolt of woven fabric.',
    itemType: 'material', icon: '🧶', value: 3, sellValue: 2, weight: 1,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 20, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'cloth', baseType: 'cloth', rarity: 'common' },

  { name: 'Clay', description: 'Wet clay that can be shaped and fired into pottery.',
    itemType: 'material', icon: '🏺', value: 1, sellValue: 0, weight: 3,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'crafting', 'natural', 'loot:common'],
    category: 'raw_material', material: 'clay', baseType: 'clay', rarity: 'common' },

  { name: 'Glass', description: 'A sheet of clear glass.',
    itemType: 'material', icon: '🪟', value: 4, sellValue: 2, weight: 1,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['material', 'crafting', 'loot:uncommon'],
    category: 'refined_material', material: 'glass', baseType: 'glass', rarity: 'common' },

  // ── Metals & Refined Materials ──
  { name: 'Iron Ingot', description: 'A bar of smelted iron, ready for smithing.',
    itemType: 'material', icon: '🔩', value: 8, sellValue: 5, weight: 3,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'crafting', 'metal', 'loot:common'],
    category: 'refined_material', material: 'iron', baseType: 'ingot', rarity: 'common' },

  { name: 'Steel Ingot', description: 'A refined steel bar, stronger than iron.',
    itemType: 'material', icon: '🔩', value: 15, sellValue: 9, weight: 3,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['material', 'crafting', 'metal', 'loot:uncommon'],
    category: 'refined_material', material: 'steel', baseType: 'ingot', rarity: 'uncommon' },

  { name: 'Silver Ingot', description: 'A gleaming silver bar.',
    itemType: 'material', icon: '🪙', value: 25, sellValue: 15, weight: 2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['material', 'crafting', 'metal', 'precious', 'loot:uncommon'],
    category: 'refined_material', material: 'silver', baseType: 'ingot', rarity: 'uncommon' },

  { name: 'Gold Ingot', description: 'A heavy bar of pure gold.',
    itemType: 'material', icon: '🥇', value: 50, sellValue: 30, weight: 4,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 2, tags: ['material', 'crafting', 'metal', 'precious', 'loot:rare'],
    category: 'refined_material', material: 'gold', baseType: 'ingot', rarity: 'rare' },

  { name: 'Copper Ore', description: 'Raw copper ore with a green patina.',
    itemType: 'material', icon: '🪨', value: 3, sellValue: 2, weight: 3,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 20, tags: ['material', 'crafting', 'ore', 'loot:common'],
    category: 'ore', material: 'copper', baseType: 'ore', rarity: 'common' },

  { name: 'Coal', description: 'A lump of coal, essential for smelting.',
    itemType: 'material', icon: '⬛', value: 2, sellValue: 1, weight: 2,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 25, tags: ['material', 'crafting', 'fuel', 'loot:common'],
    category: 'fuel', material: null, baseType: 'coal', rarity: 'common' },

  // ── Common Tools ──
  { name: 'Knife', description: 'A basic utility knife.',
    itemType: 'tool', icon: '🔪', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'knife',
    effects: { attackPower: 0.1 }, lootWeight: 15, tags: ['tool', 'melee', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'knife', rarity: 'common' },

  { name: 'Hammer', description: 'A sturdy hammer for building and repair.',
    itemType: 'tool', icon: '🔨', value: 8, sellValue: 5, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'hammer',
    effects: null, lootWeight: 10, tags: ['tool', 'crafting', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'hammer', rarity: 'common' },

  { name: 'Shovel', description: 'A metal-bladed shovel for digging.',
    itemType: 'tool', icon: '🪓', value: 7, sellValue: 4, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'shovel', rarity: 'common' },

  { name: 'Fishing Rod', description: 'A pole with line and hook for catching fish.',
    itemType: 'tool', icon: '🎣', value: 10, sellValue: 6, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['tool', 'loot:uncommon'],
    category: 'tool', material: 'wood', baseType: 'fishing_rod', rarity: 'common' },

  // ── Common Containers ──
  { name: 'Sack', description: 'A simple cloth sack for carrying goods.',
    itemType: 'tool', icon: '👝', value: 2, sellValue: 1, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['container', 'utility', 'loot:common'],
    category: 'container', material: 'cloth', baseType: 'sack', rarity: 'common' },

  { name: 'Barrel', description: 'A wooden barrel for storing liquids or dry goods.',
    itemType: 'collectible', icon: '🛢️', value: 5, sellValue: 3, weight: 8,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'barrel',
    effects: null, lootWeight: 5, tags: ['container', 'furniture', 'loot:common'],
    category: 'container', material: 'wood', baseType: 'barrel', rarity: 'common' },

  { name: 'Crate', description: 'A wooden crate, nailed shut.',
    itemType: 'collectible', icon: '📦', value: 3, sellValue: 2, weight: 6,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'crate',
    effects: null, lootWeight: 8, tags: ['container', 'loot:common'],
    category: 'container', material: 'wood', baseType: 'crate', rarity: 'common' },

  // ── Everyday Items ──
  { name: 'Candle', description: 'A tallow candle providing a dim, warm glow.',
    itemType: 'tool', icon: '🕯️', value: 1, sellValue: 0, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 20, tags: ['light', 'utility', 'loot:common'],
    category: 'light_source', material: null, baseType: 'candle', rarity: 'common' },

  { name: 'Key', description: 'A plain metal key. What does it unlock?',
    itemType: 'key', icon: '🔑', value: 5, sellValue: 0, weight: 0.1,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'key',
    effects: null, lootWeight: 5, tags: ['key', 'loot:uncommon'],
    category: 'key', material: 'iron', baseType: 'key', rarity: 'uncommon' },

  { name: 'Map', description: 'A hand-drawn map of the local area.',
    itemType: 'key', icon: '🗺️', value: 10, sellValue: 6, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 3, tags: ['key', 'navigation', 'loot:uncommon'],
    category: 'document', material: 'paper', baseType: 'map', rarity: 'uncommon' },

  { name: 'Book', description: 'A leather-bound book filled with knowledge.',
    itemType: 'collectible', icon: '📖', value: 8, sellValue: 5, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'book',
    effects: null, lootWeight: 8, tags: ['collectible', 'knowledge', 'loot:common'],
    category: 'document', material: 'paper', baseType: 'book', rarity: 'common' },

  { name: 'Letter', description: 'A sealed letter addressed to someone.',
    itemType: 'quest', icon: '✉️', value: 0, sellValue: 0, weight: 0.1,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 0, tags: ['quest', 'document'],
    category: 'document', material: 'paper', baseType: 'letter', rarity: 'common' },

  { name: 'Coin Purse', description: 'A small leather purse jingling with coins.',
    itemType: 'collectible', icon: '👛', value: 15, sellValue: 15, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['currency', 'loot:common'],
    category: 'currency', material: 'leather', baseType: 'purse', rarity: 'common' },

  // ── Food & Ingredients (universal) ──
  { name: 'Apple', description: 'A crisp, red apple.',
    itemType: 'food', icon: '🍎', value: 1, sellValue: 0, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: { energy: 5, health: 5 }, lootWeight: 25, tags: ['food', 'natural', 'loot:common'],
    category: 'food', material: null, baseType: 'fruit', rarity: 'common' },

  { name: 'Raw Meat', description: 'Uncooked meat. Should be cooked before eating.',
    itemType: 'food', icon: '🥩', value: 3, sellValue: 2, weight: 1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: { energy: 8 }, lootWeight: 15, tags: ['food', 'ingredient', 'raw', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'meat', rarity: 'common' },

  { name: 'Fish', description: 'A freshly caught fish.',
    itemType: 'food', icon: '🐟', value: 4, sellValue: 2, weight: 1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: { energy: 10 }, lootWeight: 10, tags: ['food', 'ingredient', 'raw', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'fish', rarity: 'common' },

  { name: 'Mushroom', description: 'A wild mushroom — edible, hopefully.',
    itemType: 'food', icon: '🍄', value: 2, sellValue: 1, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: { energy: 5 }, lootWeight: 20, tags: ['food', 'ingredient', 'natural', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'mushroom', rarity: 'common' },

  { name: 'Salt', description: 'A pouch of salt, essential for cooking and preserving.',
    itemType: 'material', icon: '🧂', value: 3, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['material', 'ingredient', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'spice', rarity: 'common' },

  // ── Miscellaneous / Environmental ──
  { name: 'Rock', description: 'A fist-sized rock. Could be thrown or used as a tool.',
    itemType: 'material', icon: '🪨', value: 0, sellValue: 0, weight: 2,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: 'rock',
    effects: null, lootWeight: 50, tags: ['material', 'natural', 'throwable', 'loot:common'],
    category: 'raw_material', material: 'stone', baseType: 'rock', rarity: 'common' },

  { name: 'Stick', description: 'A sturdy wooden stick. The foundation of many crafted tools.',
    itemType: 'material', icon: '🥢', value: 0, sellValue: 0, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 45, tags: ['material', 'crafting', 'natural', 'loot:common'],
    category: 'raw_material', material: 'wood', baseType: 'stick', rarity: 'common' },

  { name: 'Bone', description: 'An animal bone. Can be carved or ground into tools.',
    itemType: 'material', icon: '🦴', value: 1, sellValue: 0, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'bone', baseType: 'bone', rarity: 'common' },

  { name: 'Feather', description: 'A large bird feather, used for fletching or quills.',
    itemType: 'material', icon: '🪶', value: 1, sellValue: 0, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 20, tags: ['material', 'crafting', 'natural', 'loot:common'],
    category: 'raw_material', material: null, baseType: 'feather', rarity: 'common' },

  { name: 'Shell', description: 'A smooth sea shell. Valued as currency in some cultures.',
    itemType: 'collectible', icon: '🐚', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['collectible', 'natural', 'loot:common'],
    category: 'collectible', material: null, baseType: 'shell', rarity: 'common' },

  // ── Medieval-Fantasy Additions ──

  { name: 'Steel Sword', description: 'A finely tempered steel blade, sharper and more durable than iron.',
    itemType: 'weapon', icon: '⚔️', value: 45, sellValue: 27, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'sword',
    effects: { attackPower: 0.8 }, lootWeight: 8, tags: ['weapon', 'melee', 'loot:uncommon'],
    category: 'melee_weapon', material: 'steel', baseType: 'sword', rarity: 'uncommon' },

  { name: 'Longbow', description: 'A tall war bow with exceptional range.',
    itemType: 'weapon', icon: '🏹', value: 30, sellValue: 18, weight: 2.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'bow',
    effects: { attackPower: 0.6 }, lootWeight: 10, tags: ['weapon', 'ranged', 'loot:uncommon'],
    category: 'ranged_weapon', material: 'wood', baseType: 'bow', rarity: 'uncommon' },

  { name: 'Crossbow', description: 'A mechanical crossbow that fires bolts with great force.',
    itemType: 'weapon', icon: '🏹', value: 40, sellValue: 24, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.7 }, lootWeight: 5, tags: ['weapon', 'ranged', 'loot:uncommon'],
    category: 'ranged_weapon', material: 'wood', baseType: 'crossbow', rarity: 'uncommon' },

  { name: 'War Hammer', description: 'A heavy hammer designed for crushing armor.',
    itemType: 'weapon', icon: '🔨', value: 35, sellValue: 21, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.7 }, lootWeight: 8, tags: ['weapon', 'melee', 'loot:uncommon'],
    category: 'melee_weapon', material: 'iron', baseType: 'hammer', rarity: 'uncommon' },

  { name: 'Spear', description: 'A long-hafted weapon tipped with an iron head.',
    itemType: 'weapon', icon: '🔱', value: 15, sellValue: 9, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.4 }, lootWeight: 15, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'iron', baseType: 'spear', rarity: 'common' },

  { name: 'Staff', description: 'A hardwood staff, favored by travelers and mages.',
    itemType: 'weapon', icon: '🪄', value: 12, sellValue: 7, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.2 }, lootWeight: 12, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'wood', baseType: 'staff', rarity: 'common' },

  { name: 'Iron Shield', description: 'A heavy iron-banded shield.',
    itemType: 'armor', icon: '🛡️', value: 35, sellValue: 21, weight: 6,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'shield',
    effects: { defense: 12 }, lootWeight: 8, tags: ['armor', 'shield', 'loot:uncommon'],
    category: 'shield', material: 'iron', baseType: 'shield', rarity: 'uncommon' },

  { name: 'Leather Armor', description: 'Light armor fashioned from cured leather.',
    itemType: 'armor', icon: '🦺', value: 25, sellValue: 15, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { defense: 10 }, lootWeight: 12, tags: ['armor', 'loot:common'],
    category: 'light_armor', material: 'leather', baseType: 'body_armor', rarity: 'common' },

  { name: 'Plate Armor', description: 'Full plate armor providing exceptional protection.',
    itemType: 'armor', icon: '🦺', value: 80, sellValue: 48, weight: 15,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { defense: 25 }, lootWeight: 2, tags: ['armor', 'loot:rare'],
    category: 'heavy_armor', material: 'steel', baseType: 'body_armor', rarity: 'rare' },

  { name: 'Helmet', description: 'An iron helmet protecting the head.',
    itemType: 'armor', icon: '⛑️', value: 20, sellValue: 12, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { defense: 6 }, lootWeight: 10, tags: ['armor', 'loot:common'],
    category: 'head_armor', material: 'iron', baseType: 'helmet', rarity: 'common' },

  { name: 'Arrow', description: 'A bundle of wooden arrows tipped with iron.',
    itemType: 'material', icon: '➡️', value: 1, sellValue: 0, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: null, lootWeight: 25, tags: ['ammunition', 'loot:common'],
    category: 'ammunition', material: 'wood', baseType: 'arrow', rarity: 'common' },

  { name: 'Mana Potion', description: 'A shimmering blue potion that restores magical energy.',
    itemType: 'consumable', icon: '🧪', value: 20, sellValue: 12, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'medieval-fantasy', objectRole: 'potion',
    effects: { energy: 50 }, lootWeight: 15, tags: ['consumable', 'magic', 'loot:uncommon'],
    category: 'potion', material: null, baseType: 'potion', rarity: 'uncommon' },

  { name: 'Ale', description: 'A mug of dark, frothy ale.',
    itemType: 'drink', icon: '🍺', value: 3, sellValue: 1, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { energy: 10, health: 5 }, lootWeight: 20, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common' },

  { name: 'Wine', description: 'A bottle of fine red wine.',
    itemType: 'drink', icon: '🍷', value: 10, sellValue: 6, weight: 1.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { energy: 15, health: 5 }, lootWeight: 8, tags: ['drink', 'loot:uncommon'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'uncommon' },

  { name: 'Scroll', description: 'A rolled parchment containing written knowledge.',
    itemType: 'collectible', icon: '📜', value: 12, sellValue: 7, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: null, lootWeight: 8, tags: ['collectible', 'knowledge', 'loot:uncommon'],
    category: 'document', material: 'paper', baseType: 'scroll', rarity: 'uncommon' },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected.\n');

  const db = mongoose.connection.db!;
  const itemsCollection = db.collection('items');

  // ── Phase 1: Backfill taxonomy on existing base items ──
  console.log('Phase 1: Backfilling taxonomy on existing base items...');
  let patched = 0;
  let patchSkipped = 0;

  for (const patch of EXISTING_PATCHES) {
    const result = await itemsCollection.updateOne(
      { name: patch.name, worldType: patch.worldType, isBase: true },
      { $set: {
        category: patch.category,
        material: patch.material,
        baseType: patch.baseType,
        rarity: patch.rarity,
        updatedAt: new Date(),
      } }
    );
    if (result.modifiedCount > 0) {
      patched++;
    } else {
      patchSkipped++;
    }
  }
  console.log(`  Patched ${patched}, skipped ${patchSkipped} (not found or already set)\n`);

  // ── Phase 2: Insert new base items ──
  console.log('Phase 2: Inserting new base items...');
  let inserted = 0;
  let insertSkipped = 0;

  for (const item of NEW_ITEMS) {
    const existing = await itemsCollection.findOne({
      name: item.name,
      worldType: item.worldType,
      isBase: true,
    });
    if (existing) {
      console.log(`  Skipping "${item.name}" [${item.worldType || 'universal'}] (already exists)`);
      insertSkipped++;
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
    console.log(`  Inserted "${item.name}" [${item.worldType || 'universal'}] (${item.itemType} / ${item.category})`);
    inserted++;
  }

  console.log(`\nDone! Patched ${patched} existing items, inserted ${inserted} new items, skipped ${insertSkipped}.`);
  console.log(`Total base items: ${await itemsCollection.countDocuments({ isBase: true })}`);

  // Create index on new taxonomy fields
  await itemsCollection.createIndex({ category: 1 });
  await itemsCollection.createIndex({ baseType: 1 });
  await itemsCollection.createIndex({ material: 1 });
  console.log('Taxonomy indexes created.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
