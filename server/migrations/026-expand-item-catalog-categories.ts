#!/usr/bin/env tsx
/**
 * Migration 026: Expand Base Item Catalog with New Categories
 *
 * Adds ~120 new base items in categories underrepresented in the current catalog:
 *   - Musical instruments (universal)
 *   - Clothing & accessories (universal)
 *   - Kitchen & cooking (universal)
 *   - Garden & nature (universal)
 *   - Stationery & writing (universal)
 *   - Toys & games (universal)
 *   - Hygiene & grooming (universal)
 *   - Religious & ceremonial (universal)
 *   - Fishing & hunting (universal)
 *   - Textile & sewing (universal)
 *
 * Usage:
 *   npx tsx server/migrations/026-expand-item-catalog-categories.ts
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
  possessable: boolean;
}

export const NEW_ITEMS: BaseItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MUSICAL INSTRUMENTS (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Lute', description: 'A stringed instrument with a warm, mellow tone.',
    itemType: 'collectible', icon: '🪕', value: 20, sellValue: 12, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['instrument', 'music', 'loot:uncommon'],
    category: 'instrument', material: 'wood', baseType: 'lute', rarity: 'uncommon', possessable: true },

  { name: 'Drum', description: 'A hand drum with a taut animal-skin head.',
    itemType: 'collectible', icon: '🥁', value: 10, sellValue: 6, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['instrument', 'music', 'loot:common'],
    category: 'instrument', material: 'wood', baseType: 'drum', rarity: 'common', possessable: true },

  { name: 'Flute', description: 'A simple wooden flute with a clear, sweet sound.',
    itemType: 'collectible', icon: '🎵', value: 8, sellValue: 5, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['instrument', 'music', 'loot:common'],
    category: 'instrument', material: 'wood', baseType: 'flute', rarity: 'common', possessable: true },

  { name: 'Harp', description: 'A small lap harp with delicate strings.',
    itemType: 'collectible', icon: '🎶', value: 40, sellValue: 24, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 3, tags: ['instrument', 'music', 'loot:rare'],
    category: 'instrument', material: 'wood', baseType: 'harp', rarity: 'rare', possessable: true },

  { name: 'Tambourine', description: 'A small frame drum with jingling metal discs.',
    itemType: 'collectible', icon: '🎵', value: 6, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['instrument', 'music', 'loot:common'],
    category: 'instrument', material: 'wood', baseType: 'tambourine', rarity: 'common', possessable: true },

  { name: 'Horn', description: 'A curved animal horn used as a signaling instrument.',
    itemType: 'collectible', icon: '📯', value: 12, sellValue: 7, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['instrument', 'music', 'loot:uncommon'],
    category: 'instrument', material: 'bone', baseType: 'horn', rarity: 'uncommon', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOTHING & ACCESSORIES (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Scarf', description: 'A woven scarf for warmth.',
    itemType: 'collectible', icon: '🧣', value: 4, sellValue: 2, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['clothing', 'loot:common'],
    category: 'clothing', material: 'cloth', baseType: 'scarf', rarity: 'common', possessable: true },

  { name: 'Gloves', description: 'A pair of leather work gloves.',
    itemType: 'collectible', icon: '🧤', value: 5, sellValue: 3, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['clothing', 'loot:common'],
    category: 'clothing', material: 'leather', baseType: 'gloves', rarity: 'common', possessable: true },

  { name: 'Belt', description: 'A sturdy leather belt with a brass buckle.',
    itemType: 'collectible', icon: '👔', value: 6, sellValue: 3, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['clothing', 'loot:common'],
    category: 'clothing', material: 'leather', baseType: 'belt', rarity: 'common', possessable: true },

  { name: 'Satchel', description: 'A leather satchel worn over the shoulder.',
    itemType: 'collectible', icon: '👜', value: 10, sellValue: 6, weight: 0.8,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['clothing', 'container', 'loot:common'],
    category: 'clothing', material: 'leather', baseType: 'bag', rarity: 'common', possessable: true },

  { name: 'Apron', description: 'A thick canvas apron for working.',
    itemType: 'collectible', icon: '👔', value: 3, sellValue: 1, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['clothing', 'loot:common'],
    category: 'clothing', material: 'cloth', baseType: 'apron', rarity: 'common', possessable: true },

  { name: 'Brooch', description: 'A decorative metal brooch for fastening garments.',
    itemType: 'collectible', icon: '📌', value: 12, sellValue: 7, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['jewelry', 'clothing', 'loot:uncommon'],
    category: 'jewelry', material: 'brass', baseType: 'brooch', rarity: 'uncommon', possessable: true },

  { name: 'Sandals', description: 'Simple leather sandals.',
    itemType: 'collectible', icon: '👡', value: 4, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['clothing', 'loot:common'],
    category: 'clothing', material: 'leather', baseType: 'shoes', rarity: 'common', possessable: true },

  { name: 'Headband', description: 'A cloth headband to keep hair and sweat at bay.',
    itemType: 'collectible', icon: '🎀', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['clothing', 'loot:common'],
    category: 'clothing', material: 'cloth', baseType: 'headband', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // KITCHEN & COOKING (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Rolling Pin', description: 'A wooden rolling pin for flattening dough.',
    itemType: 'tool', icon: '🪵', value: 4, sellValue: 2, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'cooking', 'loot:common'],
    category: 'kitchen', material: 'wood', baseType: 'rolling_pin', rarity: 'common', possessable: true },

  { name: 'Ladle', description: 'A deep-bowled spoon for serving soups and stews.',
    itemType: 'tool', icon: '🥄', value: 3, sellValue: 1, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['tool', 'cooking', 'loot:common'],
    category: 'kitchen', material: 'wood', baseType: 'ladle', rarity: 'common', possessable: true },

  { name: 'Cutting Board', description: 'A flat wooden board for preparing food.',
    itemType: 'tool', icon: '🪵', value: 5, sellValue: 3, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'cooking', 'loot:common'],
    category: 'kitchen', material: 'wood', baseType: 'cutting_board', rarity: 'common', possessable: true },

  { name: 'Kettle', description: 'A metal kettle for boiling water.',
    itemType: 'tool', icon: '🫖', value: 8, sellValue: 5, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['tool', 'cooking', 'loot:common'],
    category: 'kitchen', material: 'iron', baseType: 'kettle', rarity: 'common', possessable: true },

  { name: 'Plate', description: 'A simple ceramic plate.',
    itemType: 'collectible', icon: '🍽️', value: 2, sellValue: 1, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['kitchen', 'loot:common'],
    category: 'kitchen', material: 'ceramic', baseType: 'plate', rarity: 'common', possessable: true },

  { name: 'Cup', description: 'A basic drinking cup.',
    itemType: 'collectible', icon: '🥤', value: 1, sellValue: 0, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['kitchen', 'loot:common'],
    category: 'kitchen', material: 'ceramic', baseType: 'cup', rarity: 'common', possessable: true },

  { name: 'Kitchen Knife', description: 'A sharp knife for preparing food.',
    itemType: 'tool', icon: '🔪', value: 6, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'cooking', 'loot:common'],
    category: 'kitchen', material: 'iron', baseType: 'knife', rarity: 'common', possessable: true },

  { name: 'Pitcher', description: 'A ceramic pitcher for pouring liquids.',
    itemType: 'collectible', icon: '🫗', value: 4, sellValue: 2, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['kitchen', 'container', 'loot:common'],
    category: 'kitchen', material: 'ceramic', baseType: 'pitcher', rarity: 'common', possessable: true },

  { name: 'Spice Pouch', description: 'A small cloth pouch filled with aromatic spices.',
    itemType: 'material', icon: '🌶️', value: 8, sellValue: 5, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['ingredient', 'cooking', 'loot:uncommon'],
    category: 'ingredient', material: null, baseType: 'spice', rarity: 'uncommon', possessable: true },

  { name: 'Salt', description: 'A pouch of coarse salt, essential for preserving and flavoring food.',
    itemType: 'material', icon: '🧂', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['ingredient', 'cooking', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'salt', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // GARDEN & NATURE (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Seed Packet', description: 'A packet of assorted plant seeds.',
    itemType: 'material', icon: '🌱', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['garden', 'natural', 'loot:common'],
    category: 'garden', material: null, baseType: 'seeds', rarity: 'common', possessable: true },

  { name: 'Shovel', description: 'A sturdy shovel for digging.',
    itemType: 'tool', icon: '🪏', value: 8, sellValue: 5, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'garden', 'loot:common'],
    category: 'garden', material: 'iron', baseType: 'shovel', rarity: 'common', possessable: true },

  { name: 'Watering Can', description: 'A tin watering can with a perforated spout.',
    itemType: 'tool', icon: '🚿', value: 5, sellValue: 3, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'garden', 'loot:common'],
    category: 'garden', material: 'iron', baseType: 'watering_can', rarity: 'common', possessable: true },

  { name: 'Pruning Shears', description: 'Small shears for trimming plants.',
    itemType: 'tool', icon: '✂️', value: 6, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['tool', 'garden', 'loot:common'],
    category: 'garden', material: 'iron', baseType: 'shears', rarity: 'common', possessable: true },

  { name: 'Herb Bundle', description: 'A tied bundle of aromatic herbs.',
    itemType: 'material', icon: '🌿', value: 4, sellValue: 2, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['ingredient', 'natural', 'garden', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'herb', rarity: 'common', possessable: true },

  { name: 'Potted Plant', description: 'A small ceramic pot with a thriving green plant.',
    itemType: 'collectible', icon: '🪴', value: 6, sellValue: 3, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'potted_plant',
    effects: null, lootWeight: 6, tags: ['decoration', 'garden', 'loot:common'],
    category: 'decoration', material: 'ceramic', baseType: 'potted_plant', rarity: 'common', possessable: true },

  { name: 'Dried Herbs', description: 'A string of dried herbs hung for storage.',
    itemType: 'material', icon: '🍃', value: 3, sellValue: 2, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['ingredient', 'natural', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'dried_herb', rarity: 'common', possessable: true },

  { name: 'Mushroom', description: 'A freshly picked wild mushroom.',
    itemType: 'food', icon: '🍄', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: { energy: 3, health: 2 }, lootWeight: 15, tags: ['food', 'natural', 'ingredient', 'loot:common'],
    category: 'food', material: null, baseType: 'mushroom', rarity: 'common', possessable: true },

  { name: 'Pinecone', description: 'A dried pinecone from an evergreen tree.',
    itemType: 'collectible', icon: '🌲', value: 1, sellValue: 0, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 18, tags: ['natural', 'collectible', 'loot:common'],
    category: 'collectible', material: null, baseType: 'pinecone', rarity: 'common', possessable: true },

  { name: 'Acorn', description: 'A small acorn from an oak tree.',
    itemType: 'collectible', icon: '🌰', value: 1, sellValue: 0, weight: 0.05,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 20, tags: ['natural', 'collectible', 'loot:common'],
    category: 'collectible', material: null, baseType: 'nut', rarity: 'common', possessable: true },

  { name: 'Feather', description: 'A colorful bird feather.',
    itemType: 'material', icon: '🪶', value: 1, sellValue: 0, weight: 0.01,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'natural', 'crafting', 'loot:common'],
    category: 'raw_material', material: null, baseType: 'feather', rarity: 'common', possessable: true },

  { name: 'Seashell', description: 'A smooth spiral seashell.',
    itemType: 'collectible', icon: '🐚', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['natural', 'collectible', 'loot:common'],
    category: 'collectible', material: null, baseType: 'shell', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATIONERY & WRITING (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Quill Pen', description: 'A feathered quill pen for writing.',
    itemType: 'tool', icon: '🪶', value: 3, sellValue: 1, weight: 0.05,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['tool', 'writing', 'loot:common'],
    category: 'stationery', material: null, baseType: 'pen', rarity: 'common', possessable: true },

  { name: 'Ledger', description: 'A thick record-keeping ledger.',
    itemType: 'collectible', icon: '📒', value: 8, sellValue: 5, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['writing', 'document', 'loot:uncommon'],
    category: 'stationery', material: 'paper', baseType: 'ledger', rarity: 'uncommon', possessable: true },

  { name: 'Seal Stamp', description: 'A brass stamp for pressing wax seals.',
    itemType: 'tool', icon: '🔏', value: 15, sellValue: 9, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 4, tags: ['tool', 'writing', 'loot:uncommon'],
    category: 'stationery', material: 'brass', baseType: 'stamp', rarity: 'uncommon', possessable: true },

  { name: 'Envelope', description: 'A sealed paper envelope.',
    itemType: 'collectible', icon: '✉️', value: 1, sellValue: 0, weight: 0.05,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['writing', 'loot:common'],
    category: 'stationery', material: 'paper', baseType: 'envelope', rarity: 'common', possessable: true },

  { name: 'Chalk', description: 'A stick of white chalk for marking surfaces.',
    itemType: 'tool', icon: '🖍️', value: 1, sellValue: 0, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['tool', 'writing', 'loot:common'],
    category: 'stationery', material: null, baseType: 'chalk', rarity: 'common', possessable: true },

  { name: 'Map', description: 'A hand-drawn map of the local area.',
    itemType: 'collectible', icon: '🗺️', value: 10, sellValue: 6, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['document', 'navigation', 'loot:uncommon'],
    category: 'stationery', material: 'paper', baseType: 'map', rarity: 'uncommon', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOYS & GAMES (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Rag Doll', description: 'A hand-sewn cloth doll with button eyes.',
    itemType: 'collectible', icon: '🧸', value: 4, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['toy', 'collectible', 'loot:common'],
    category: 'toy', material: 'cloth', baseType: 'doll', rarity: 'common', possessable: true },

  { name: 'Toy Soldier', description: 'A small carved wooden soldier.',
    itemType: 'collectible', icon: '🪖', value: 3, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['toy', 'collectible', 'loot:common'],
    category: 'toy', material: 'wood', baseType: 'figurine', rarity: 'common', possessable: true },

  { name: 'Chess Set', description: 'A wooden box containing a full set of chess pieces.',
    itemType: 'collectible', icon: '♟️', value: 20, sellValue: 12, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 3, tags: ['toy', 'game', 'loot:uncommon'],
    category: 'toy', material: 'wood', baseType: 'board_game', rarity: 'uncommon', possessable: true },

  { name: 'Playing Cards', description: 'A deck of illustrated playing cards.',
    itemType: 'collectible', icon: '🃏', value: 3, sellValue: 1, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['toy', 'game', 'loot:common'],
    category: 'toy', material: 'paper', baseType: 'cards', rarity: 'common', possessable: true },

  { name: 'Spinning Top', description: 'A brightly painted wooden spinning top.',
    itemType: 'collectible', icon: '🪀', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['toy', 'loot:common'],
    category: 'toy', material: 'wood', baseType: 'top', rarity: 'common', possessable: true },

  { name: 'Yo-Yo', description: 'A simple wooden yo-yo on a string.',
    itemType: 'collectible', icon: '🪀', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['toy', 'loot:common'],
    category: 'toy', material: 'wood', baseType: 'yoyo', rarity: 'common', possessable: true },

  { name: 'Marbles', description: 'A pouch of colorful glass marbles.',
    itemType: 'collectible', icon: '🔮', value: 2, sellValue: 1, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['toy', 'game', 'loot:common'],
    category: 'toy', material: 'glass', baseType: 'marbles', rarity: 'common', possessable: true },

  { name: 'Kite', description: 'A lightweight kite made of cloth and sticks.',
    itemType: 'collectible', icon: '🪁', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['toy', 'loot:common'],
    category: 'toy', material: 'cloth', baseType: 'kite', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // HYGIENE & GROOMING (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Soap', description: 'A bar of lye soap.',
    itemType: 'consumable', icon: '🧼', value: 2, sellValue: 1, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['hygiene', 'loot:common'],
    category: 'hygiene', material: null, baseType: 'soap', rarity: 'common', possessable: true },

  { name: 'Comb', description: 'A carved comb for grooming hair.',
    itemType: 'collectible', icon: '💇', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['hygiene', 'grooming', 'loot:common'],
    category: 'hygiene', material: 'wood', baseType: 'comb', rarity: 'common', possessable: true },

  { name: 'Towel', description: 'A folded cloth towel.',
    itemType: 'collectible', icon: '🧻', value: 2, sellValue: 1, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['hygiene', 'loot:common'],
    category: 'hygiene', material: 'cloth', baseType: 'towel', rarity: 'common', possessable: true },

  { name: 'Perfume Bottle', description: 'A small glass bottle of fragrant perfume.',
    itemType: 'collectible', icon: '🧴', value: 15, sellValue: 9, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 4, tags: ['hygiene', 'luxury', 'loot:uncommon'],
    category: 'hygiene', material: 'glass', baseType: 'perfume', rarity: 'uncommon', possessable: true },

  { name: 'Razor', description: 'A straight razor for shaving.',
    itemType: 'tool', icon: '🪒', value: 5, sellValue: 3, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['hygiene', 'grooming', 'loot:common'],
    category: 'hygiene', material: 'steel', baseType: 'razor', rarity: 'common', possessable: true },

  { name: 'Brush', description: 'A wooden brush with stiff bristles.',
    itemType: 'tool', icon: '🖌️', value: 3, sellValue: 1, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['hygiene', 'grooming', 'loot:common'],
    category: 'hygiene', material: 'wood', baseType: 'brush', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // RELIGIOUS & CEREMONIAL (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Incense Stick', description: 'A fragrant stick of incense.',
    itemType: 'consumable', icon: '🕯️', value: 2, sellValue: 1, weight: 0.05,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['ceremonial', 'loot:common'],
    category: 'ceremonial', material: null, baseType: 'incense', rarity: 'common', possessable: true },

  { name: 'Prayer Beads', description: 'A string of polished prayer beads.',
    itemType: 'collectible', icon: '📿', value: 8, sellValue: 5, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['ceremonial', 'religious', 'loot:uncommon'],
    category: 'ceremonial', material: 'wood', baseType: 'beads', rarity: 'uncommon', possessable: true },

  { name: 'Holy Symbol', description: 'A small amulet bearing a sacred symbol.',
    itemType: 'collectible', icon: '✝️', value: 12, sellValue: 7, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['ceremonial', 'religious', 'loot:uncommon'],
    category: 'ceremonial', material: 'iron', baseType: 'amulet', rarity: 'uncommon', possessable: true },

  { name: 'Offering Bowl', description: 'A shallow ceramic bowl used for offerings.',
    itemType: 'collectible', icon: '🥣', value: 5, sellValue: 3, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['ceremonial', 'religious', 'container', 'loot:common'],
    category: 'ceremonial', material: 'ceramic', baseType: 'bowl', rarity: 'common', possessable: true },

  { name: 'Ritual Candle', description: 'A thick beeswax candle inscribed with symbols.',
    itemType: 'consumable', icon: '🕯️', value: 4, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['ceremonial', 'light', 'loot:common'],
    category: 'ceremonial', material: null, baseType: 'candle', rarity: 'common', possessable: true },

  { name: 'Relic', description: 'An ancient religious relic of unknown origin.',
    itemType: 'collectible', icon: '🏺', value: 50, sellValue: 30, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 1, tags: ['ceremonial', 'treasure', 'loot:rare'],
    category: 'ceremonial', material: null, baseType: 'relic', rarity: 'rare', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // FISHING & HUNTING (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Fishing Rod', description: 'A simple wooden fishing rod with a line and hook.',
    itemType: 'tool', icon: '🎣', value: 10, sellValue: 6, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['tool', 'fishing', 'loot:common'],
    category: 'tool', material: 'wood', baseType: 'fishing_rod', rarity: 'common', possessable: true },

  { name: 'Fish Hook', description: 'A small barbed metal hook for catching fish.',
    itemType: 'material', icon: '🪝', value: 1, sellValue: 0, weight: 0.02,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['material', 'fishing', 'loot:common'],
    category: 'component', material: 'iron', baseType: 'hook', rarity: 'common', possessable: true },

  { name: 'Bait Worms', description: 'A tin of live bait worms.',
    itemType: 'material', icon: '🪱', value: 1, sellValue: 0, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['fishing', 'loot:common'],
    category: 'component', material: null, baseType: 'bait', rarity: 'common', possessable: true },

  { name: 'Snare', description: 'A simple wire snare for catching small game.',
    itemType: 'tool', icon: '🪤', value: 4, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'hunting', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'trap', rarity: 'common', possessable: true },

  { name: 'Animal Pelt', description: 'A tanned animal pelt.',
    itemType: 'material', icon: '🧥', value: 8, sellValue: 5, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['material', 'hunting', 'crafting', 'loot:uncommon'],
    category: 'raw_material', material: 'leather', baseType: 'pelt', rarity: 'uncommon', possessable: true },

  { name: 'Antler', description: 'A shed deer antler, useful for tools and crafting.',
    itemType: 'material', icon: '🦌', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['material', 'natural', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'bone', baseType: 'antler', rarity: 'common', possessable: true },

  { name: 'Raw Fish', description: 'A freshly caught fish.',
    itemType: 'food', icon: '🐟', value: 3, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: { energy: 5, health: 2 }, lootWeight: 10, tags: ['food', 'fishing', 'ingredient', 'loot:common'],
    category: 'food', material: null, baseType: 'fish', rarity: 'common', possessable: true },

  { name: 'Cooked Fish', description: 'A fire-roasted fish.',
    itemType: 'food', icon: '🍣', value: 6, sellValue: 4, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: { energy: 12, health: 8 }, lootWeight: 8, tags: ['food', 'cooked', 'loot:common'],
    category: 'food', material: null, baseType: 'cooked_meal', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXTILE & SEWING (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Bolt of Cloth', description: 'A rolled bolt of woven fabric.',
    itemType: 'material', icon: '🧶', value: 8, sellValue: 5, weight: 2,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['material', 'crafting', 'textile', 'loot:common'],
    category: 'raw_material', material: 'cloth', baseType: 'cloth_bolt', rarity: 'common', possessable: true },

  { name: 'Yarn Ball', description: 'A ball of spun wool yarn.',
    itemType: 'material', icon: '🧶', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['material', 'crafting', 'textile', 'loot:common'],
    category: 'raw_material', material: 'fiber', baseType: 'yarn', rarity: 'common', possessable: true },

  { name: 'Thimble', description: 'A small metal thimble to protect the finger while sewing.',
    itemType: 'tool', icon: '🧵', value: 2, sellValue: 1, weight: 0.02,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'textile', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'thimble', rarity: 'common', possessable: true },

  { name: 'Scissors', description: 'A pair of iron scissors.',
    itemType: 'tool', icon: '✂️', value: 5, sellValue: 3, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'textile', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'scissors', rarity: 'common', possessable: true },

  { name: 'Dye Powder', description: 'A pouch of colored dye powder for fabrics.',
    itemType: 'material', icon: '🎨', value: 5, sellValue: 3, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['material', 'crafting', 'textile', 'loot:uncommon'],
    category: 'refined_material', material: null, baseType: 'dye', rarity: 'uncommon', possessable: true },

  { name: 'Leather Strip', description: 'A strip of cured leather for binding and crafting.',
    itemType: 'material', icon: '🟫', value: 3, sellValue: 2, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'leather', baseType: 'leather_strip', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL DECORATIVE ITEMS (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Painting', description: 'A small framed painting.',
    itemType: 'collectible', icon: '🖼️', value: 20, sellValue: 12, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'painting',
    effects: null, lootWeight: 3, tags: ['decoration', 'art', 'loot:uncommon'],
    category: 'decoration', material: 'wood', baseType: 'painting', rarity: 'uncommon', possessable: false },

  { name: 'Tapestry', description: 'A woven wall tapestry depicting a scene.',
    itemType: 'collectible', icon: '🧵', value: 25, sellValue: 15, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'tapestry',
    effects: null, lootWeight: 2, tags: ['decoration', 'art', 'loot:uncommon'],
    category: 'decoration', material: 'cloth', baseType: 'tapestry', rarity: 'uncommon', possessable: false },

  { name: 'Rug', description: 'A hand-woven floor rug.',
    itemType: 'collectible', icon: '🟫', value: 15, sellValue: 9, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'rug',
    effects: null, lootWeight: 0, tags: ['decoration', 'furniture'],
    category: 'decoration', material: 'cloth', baseType: 'rug', rarity: 'common', possessable: false },

  { name: 'Vase', description: 'A decorative ceramic vase.',
    itemType: 'collectible', icon: '🏺', value: 10, sellValue: 6, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'vase',
    effects: null, lootWeight: 5, tags: ['decoration', 'loot:common'],
    category: 'decoration', material: 'ceramic', baseType: 'vase', rarity: 'common', possessable: true },

  { name: 'Statuette', description: 'A small carved statuette.',
    itemType: 'collectible', icon: '🗿', value: 18, sellValue: 11, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 4, tags: ['decoration', 'art', 'loot:uncommon'],
    category: 'decoration', material: 'stone', baseType: 'statuette', rarity: 'uncommon', possessable: true },

  { name: 'Wind Chime', description: 'A set of metal tubes that tinkle in the breeze.',
    itemType: 'collectible', icon: '🎐', value: 6, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['decoration', 'loot:common'],
    category: 'decoration', material: 'iron', baseType: 'wind_chime', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL FURNITURE (universal, NOT possessable)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Stool', description: 'A simple three-legged wooden stool.',
    itemType: 'collectible', icon: '🪑', value: 5, sellValue: 2, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'stool',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'stool', rarity: 'common', possessable: false },

  { name: 'Workbench', description: 'A heavy wooden workbench for crafting.',
    itemType: 'collectible', icon: '🪵', value: 20, sellValue: 10, weight: 25,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'workbench',
    effects: null, lootWeight: 0, tags: ['furniture', 'crafting'],
    category: 'furniture', material: 'wood', baseType: 'workbench', rarity: 'common', possessable: false },

  { name: 'Coat Rack', description: 'A standing wooden coat rack.',
    itemType: 'collectible', icon: '🧥', value: 8, sellValue: 4, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'coat_rack',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'coat_rack', rarity: 'common', possessable: false },

  { name: 'Wardrobe', description: 'A tall wooden wardrobe for storing clothes.',
    itemType: 'collectible', icon: '🗄️', value: 25, sellValue: 12, weight: 30,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'wardrobe',
    effects: null, lootWeight: 0, tags: ['furniture', 'container'],
    category: 'furniture', material: 'wood', baseType: 'wardrobe', rarity: 'common', possessable: false },

  { name: 'Hearth', description: 'A stone fireplace for warmth and cooking.',
    itemType: 'collectible', icon: '🔥', value: 30, sellValue: 15, weight: 50,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'hearth',
    effects: null, lootWeight: 0, tags: ['furniture', 'cooking'],
    category: 'furniture', material: 'stone', baseType: 'hearth', rarity: 'common', possessable: false },

  { name: 'Writing Desk', description: 'A wooden desk with drawers and an inkwell holder.',
    itemType: 'collectible', icon: '🪵', value: 22, sellValue: 11, weight: 15,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'desk',
    effects: null, lootWeight: 0, tags: ['furniture', 'writing'],
    category: 'furniture', material: 'wood', baseType: 'desk', rarity: 'common', possessable: false },

  { name: 'Bench', description: 'A long wooden bench for sitting.',
    itemType: 'collectible', icon: '🪑', value: 10, sellValue: 5, weight: 10,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'bench',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'bench', rarity: 'common', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS USEFUL ITEMS (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Whistle', description: 'A small metal whistle for signaling.',
    itemType: 'tool', icon: '🎵', value: 3, sellValue: 1, weight: 0.05,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'whistle', rarity: 'common', possessable: true },

  { name: 'Magnifying Glass', description: 'A handheld lens for close examination.',
    itemType: 'tool', icon: '🔍', value: 12, sellValue: 7, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 4, tags: ['tool', 'loot:uncommon'],
    category: 'tool', material: 'glass', baseType: 'magnifier', rarity: 'uncommon', possessable: true },

  { name: 'Hourglass', description: 'A small hourglass for measuring time.',
    itemType: 'collectible', icon: '⏳', value: 10, sellValue: 6, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['collectible', 'loot:uncommon'],
    category: 'collectible', material: 'glass', baseType: 'hourglass', rarity: 'uncommon', possessable: true },

  { name: 'Sponge', description: 'A natural sea sponge.',
    itemType: 'collectible', icon: '🧽', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['natural', 'hygiene', 'loot:common'],
    category: 'hygiene', material: null, baseType: 'sponge', rarity: 'common', possessable: true },

  { name: 'Blanket', description: 'A warm woolen blanket.',
    itemType: 'collectible', icon: '🛏️', value: 8, sellValue: 5, weight: 2,
    tradeable: true, stackable: true, maxStack: 3,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['clothing', 'loot:common'],
    category: 'clothing', material: 'cloth', baseType: 'blanket', rarity: 'common', possessable: true },

  { name: 'Basket', description: 'A woven basket for carrying goods.',
    itemType: 'collectible', icon: '🧺', value: 4, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['container', 'loot:common'],
    category: 'container', material: 'fiber', baseType: 'basket', rarity: 'common', possessable: true },

  { name: 'Lockpick', description: 'A thin metal pick for opening locks.',
    itemType: 'tool', icon: '🔑', value: 8, sellValue: 5, weight: 0.05,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['tool', 'loot:uncommon'],
    category: 'tool', material: 'iron', baseType: 'lockpick', rarity: 'uncommon', possessable: true },

  { name: 'Compass Rose', description: 'A brass compass for navigation.',
    itemType: 'tool', icon: '🧭', value: 15, sellValue: 9, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 4, tags: ['tool', 'navigation', 'loot:uncommon'],
    category: 'tool', material: 'brass', baseType: 'compass', rarity: 'uncommon', possessable: true },

  { name: 'Whetstone', description: 'A flat stone for sharpening blades.',
    itemType: 'tool', icon: '🪨', value: 4, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'crafting', 'loot:common'],
    category: 'tool', material: 'stone', baseType: 'whetstone', rarity: 'common', possessable: true },

  { name: 'Tongs', description: 'A pair of metal tongs for handling hot objects.',
    itemType: 'tool', icon: '🔧', value: 5, sellValue: 3, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['tool', 'crafting', 'cooking', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'tongs', rarity: 'common', possessable: true },

  { name: 'Pillow', description: 'A soft stuffed pillow.',
    itemType: 'collectible', icon: '🛏️', value: 4, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['furniture', 'loot:common'],
    category: 'clothing', material: 'cloth', baseType: 'pillow', rarity: 'common', possessable: true },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const col = db.collection('items');

  console.log(`Inserting ${NEW_ITEMS.length} new base items across new categories...`);

  let inserted = 0;
  let skipped = 0;

  for (const item of NEW_ITEMS) {
    const existing = await col.findOne({
      name: item.name,
      isBase: true,
      worldType: item.worldType,
    });

    if (existing) {
      skipped++;
      continue;
    }

    await col.insertOne({
      ...item,
      worldId: null,
      isBase: true,
      metadata: {},
      craftingRecipe: null,
      questRelevance: [],
      loreText: null,
      languageLearningData: null,
      relatedTruthIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    inserted++;
  }

  console.log(`  Inserted: ${inserted}, Skipped (duplicate): ${skipped}`);

  // Summary
  const totalBase = await col.countDocuments({ isBase: true });
  const byCategory = await col.aggregate([
    { $match: { isBase: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  console.log(`\nTotal base items: ${totalBase}`);
  console.log('By category:');
  for (const { _id, count } of byCategory) {
    console.log(`  ${_id ?? 'uncategorized'}: ${count}`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
