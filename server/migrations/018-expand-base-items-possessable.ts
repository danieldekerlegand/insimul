#!/usr/bin/env tsx
/**
 * Migration 018: Expand Base Items with Possessable Flag
 *
 * 1. Backfills `possessable` on all existing base items (furniture/large containers = false, rest = true)
 * 2. Adds ~200 new base items across all world types with full taxonomy and possessable flag
 * 3. Each world type gets a rich default item set tied to asset collection objectRoles
 *
 * Usage:
 *   npx tsx server/migrations/018-expand-base-items-possessable.ts
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

// ── Existing item possessable backfill ──────────────────────────────────────

/** Items that should NOT be possessable (furniture, large structures, fixtures) */
const NON_POSSESSABLE_NAMES = [
  'Bookshelf', 'Barrel', 'Crate', 'Treasure Chest', 'Supply Crate',
];

// ── New items ───────────────────────────────────────────────────────────────

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

const NEW_ITEMS: BaseItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSAL ITEMS (worldType: null — available in all worlds)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Additional Food & Drink ──
  { name: 'Cheese', description: 'A wedge of aged cheese.',
    itemType: 'food', icon: '🧀', value: 3, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: { energy: 8, health: 3 }, lootWeight: 15, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'cheese', rarity: 'common', possessable: true },

  { name: 'Egg', description: 'A fresh egg.',
    itemType: 'food', icon: '🥚', value: 1, sellValue: 0, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: { energy: 4 }, lootWeight: 20, tags: ['food', 'ingredient', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'egg', rarity: 'common', possessable: true },

  { name: 'Honey', description: 'A jar of golden honey.',
    itemType: 'food', icon: '🍯', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: { energy: 10, health: 5 }, lootWeight: 10, tags: ['food', 'ingredient', 'loot:uncommon'],
    category: 'food', material: null, baseType: 'honey', rarity: 'uncommon', possessable: true },

  { name: 'Berries', description: 'A handful of wild berries.',
    itemType: 'food', icon: '🫐', value: 1, sellValue: 0, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: { energy: 4, health: 2 }, lootWeight: 25, tags: ['food', 'natural', 'loot:common'],
    category: 'food', material: null, baseType: 'fruit', rarity: 'common', possessable: true },

  { name: 'Milk', description: 'A bottle of fresh milk.',
    itemType: 'drink', icon: '🥛', value: 2, sellValue: 1, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: { energy: 6, health: 3 }, lootWeight: 15, tags: ['drink', 'ingredient', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Water Bottle', description: 'A container of clean water.',
    itemType: 'drink', icon: '💧', value: 1, sellValue: 0, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: { energy: 3 }, lootWeight: 30, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Flour', description: 'A sack of ground flour for baking.',
    itemType: 'material', icon: '🌾', value: 2, sellValue: 1, weight: 2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['ingredient', 'crafting', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'flour', rarity: 'common', possessable: true },

  { name: 'Sugar', description: 'Granulated sugar for sweetening food.',
    itemType: 'material', icon: '🍬', value: 3, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['ingredient', 'crafting', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'sugar', rarity: 'common', possessable: true },

  { name: 'Oil', description: 'A bottle of cooking oil, also useful as fuel.',
    itemType: 'material', icon: '🫒', value: 3, sellValue: 2, weight: 1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['ingredient', 'fuel', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'oil', rarity: 'common', possessable: true },

  // ── Additional Materials ──
  { name: 'Rope Coil', description: 'A coil of strong rope.',
    itemType: 'material', icon: '🪢', value: 4, sellValue: 2, weight: 2,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 12, tags: ['material', 'utility', 'loot:common'],
    category: 'utility', material: 'fiber', baseType: 'rope', rarity: 'common', possessable: true },

  { name: 'Nails', description: 'A pouch of iron nails.',
    itemType: 'material', icon: '📌', value: 2, sellValue: 1, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'crafting', 'loot:common'],
    category: 'component', material: 'iron', baseType: 'nails', rarity: 'common', possessable: true },

  { name: 'Wax', description: 'A block of beeswax.',
    itemType: 'material', icon: '🕯️', value: 2, sellValue: 1, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: null, baseType: 'wax', rarity: 'common', possessable: true },

  { name: 'Thread', description: 'A spool of thread for sewing.',
    itemType: 'material', icon: '🧵', value: 1, sellValue: 0, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'fiber', baseType: 'thread', rarity: 'common', possessable: true },

  { name: 'Ink', description: 'A small bottle of black ink.',
    itemType: 'material', icon: '🖋️', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['material', 'crafting', 'loot:common'],
    category: 'refined_material', material: null, baseType: 'ink', rarity: 'common', possessable: true },

  { name: 'Parchment', description: 'A blank sheet of parchment for writing.',
    itemType: 'material', icon: '📃', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'paper', baseType: 'parchment', rarity: 'common', possessable: true },

  // ── Universal Tools ──
  { name: 'Needle', description: 'A fine sewing needle.',
    itemType: 'tool', icon: '🪡', value: 1, sellValue: 0, weight: 0.05,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'crafting', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'needle', rarity: 'common', possessable: true },

  { name: 'Saw', description: 'A hand saw for cutting wood.',
    itemType: 'tool', icon: '🪚', value: 8, sellValue: 5, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 6, tags: ['tool', 'crafting', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'saw', rarity: 'common', possessable: true },

  { name: 'Bucket', description: 'A sturdy bucket for carrying water and goods.',
    itemType: 'tool', icon: '🪣', value: 3, sellValue: 2, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'bucket',
    effects: null, lootWeight: 10, tags: ['tool', 'utility', 'loot:common'],
    category: 'container', material: 'wood', baseType: 'bucket', rarity: 'common', possessable: true },

  { name: 'Mortar and Pestle', description: 'For grinding herbs and ingredients.',
    itemType: 'tool', icon: '⚗️', value: 6, sellValue: 4, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['tool', 'crafting', 'alchemy', 'loot:uncommon'],
    category: 'tool', material: 'stone', baseType: 'mortar', rarity: 'uncommon', possessable: true },

  // ── Universal Collectibles ──
  { name: 'Flower', description: 'A beautiful wildflower.',
    itemType: 'collectible', icon: '🌸', value: 1, sellValue: 0, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 20, tags: ['collectible', 'natural', 'gift', 'loot:common'],
    category: 'collectible', material: null, baseType: 'flower', rarity: 'common', possessable: true },

  { name: 'Pendant', description: 'A simple pendant on a chain.',
    itemType: 'collectible', icon: '📿', value: 8, sellValue: 5, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['jewelry', 'loot:uncommon'],
    category: 'jewelry', material: null, baseType: 'pendant', rarity: 'uncommon', possessable: true },

  { name: 'Mirror', description: 'A small hand mirror.',
    itemType: 'collectible', icon: '🪞', value: 10, sellValue: 6, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 5, tags: ['collectible', 'loot:uncommon'],
    category: 'collectible', material: 'glass', baseType: 'mirror', rarity: 'uncommon', possessable: true },

  { name: 'Dice', description: 'A pair of carved dice.',
    itemType: 'collectible', icon: '🎲', value: 2, sellValue: 1, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 10, tags: ['collectible', 'game', 'loot:common'],
    category: 'collectible', material: 'bone', baseType: 'dice', rarity: 'common', possessable: true },

  { name: 'Bell', description: 'A small metal bell.',
    itemType: 'collectible', icon: '🔔', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: null,
    effects: null, lootWeight: 8, tags: ['collectible', 'loot:common'],
    category: 'collectible', material: 'iron', baseType: 'bell', rarity: 'common', possessable: true },

  // ── Universal Furniture (NOT possessable) ──
  { name: 'Chair', description: 'A simple wooden chair.',
    itemType: 'collectible', icon: '🪑', value: 8, sellValue: 4, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'chair',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'chair', rarity: 'common', possessable: false },

  { name: 'Table', description: 'A sturdy wooden table.',
    itemType: 'collectible', icon: '🪵', value: 15, sellValue: 8, weight: 12,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'table',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'table', rarity: 'common', possessable: false },

  { name: 'Bed', description: 'A simple bed with a straw mattress.',
    itemType: 'collectible', icon: '🛏️', value: 20, sellValue: 10, weight: 20,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'bed',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'bed', rarity: 'common', possessable: false },

  { name: 'Shelf', description: 'A wall-mounted wooden shelf.',
    itemType: 'collectible', icon: '📚', value: 10, sellValue: 5, weight: 8,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'shelf',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'shelf', rarity: 'common', possessable: false },

  { name: 'Chest', description: 'A large wooden storage chest.',
    itemType: 'collectible', icon: '🗃️', value: 12, sellValue: 6, weight: 10,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'chest',
    effects: null, lootWeight: 0, tags: ['furniture', 'container'],
    category: 'furniture', material: 'wood', baseType: 'chest', rarity: 'common', possessable: false },

  { name: 'Chandelier', description: 'An ornate hanging light fixture.',
    itemType: 'collectible', icon: '💡', value: 30, sellValue: 15, weight: 10,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: null, objectRole: 'chandelier',
    effects: null, lootWeight: 0, tags: ['furniture', 'light'],
    category: 'furniture', material: 'iron', baseType: 'chandelier', rarity: 'uncommon', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDIEVAL-FANTASY
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Battle Axe', description: 'A heavy double-bladed axe meant for war.',
    itemType: 'weapon', icon: '🪓', value: 35, sellValue: 21, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.7 }, lootWeight: 8, tags: ['weapon', 'melee', 'loot:uncommon'],
    category: 'melee_weapon', material: 'iron', baseType: 'axe', rarity: 'uncommon', possessable: true },

  { name: 'Mace', description: 'A flanged iron mace designed to crush armor.',
    itemType: 'weapon', icon: '🔨', value: 28, sellValue: 17, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.6 }, lootWeight: 10, tags: ['weapon', 'melee', 'loot:uncommon'],
    category: 'melee_weapon', material: 'iron', baseType: 'mace', rarity: 'uncommon', possessable: true },

  { name: 'Halberd', description: 'A polearm combining an axe blade with a spear tip.',
    itemType: 'weapon', icon: '🔱', value: 40, sellValue: 24, weight: 6,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.8 }, lootWeight: 5, tags: ['weapon', 'melee', 'loot:rare'],
    category: 'melee_weapon', material: 'steel', baseType: 'halberd', rarity: 'rare', possessable: true },

  { name: 'Enchanted Ring', description: 'A ring pulsing with faint magical energy.',
    itemType: 'collectible', icon: '💍', value: 60, sellValue: 36, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { defense: 3, attackPower: 0.2 }, lootWeight: 2, tags: ['jewelry', 'magic', 'loot:rare'],
    category: 'jewelry', material: 'gold', baseType: 'ring', rarity: 'rare', possessable: true },

  { name: 'Cloak', description: 'A hooded traveling cloak of woven wool.',
    itemType: 'armor', icon: '🧥', value: 12, sellValue: 7, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { defense: 3 }, lootWeight: 12, tags: ['armor', 'loot:common'],
    category: 'light_armor', material: 'cloth', baseType: 'cloak', rarity: 'common', possessable: true },

  { name: 'Gauntlets', description: 'Iron gauntlets protecting the hands.',
    itemType: 'armor', icon: '🧤', value: 18, sellValue: 11, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { defense: 5 }, lootWeight: 8, tags: ['armor', 'loot:uncommon'],
    category: 'hand_armor', material: 'iron', baseType: 'gauntlets', rarity: 'uncommon', possessable: true },

  { name: 'Holy Water', description: 'A vial of blessed water, effective against undead.',
    itemType: 'consumable', icon: '💧', value: 15, sellValue: 9, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { attackPower: 0.5 }, lootWeight: 5, tags: ['consumable', 'magic', 'loot:uncommon'],
    category: 'potion', material: null, baseType: 'vial', rarity: 'uncommon', possessable: true },

  { name: 'Elixir of Strength', description: 'A potent brew that temporarily boosts strength.',
    itemType: 'consumable', icon: '🧪', value: 30, sellValue: 18, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'medieval-fantasy', objectRole: 'potion',
    effects: { attackPower: 0.3 }, lootWeight: 3, tags: ['consumable', 'magic', 'loot:rare'],
    category: 'potion', material: null, baseType: 'elixir', rarity: 'rare', possessable: true },

  { name: 'Dragon Scale', description: 'A shimmering scale from a great dragon.',
    itemType: 'material', icon: '🐉', value: 100, sellValue: 60, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: null, lootWeight: 1, tags: ['material', 'rare', 'crafting', 'loot:legendary'],
    category: 'rare_material', material: null, baseType: 'scale', rarity: 'legendary', possessable: true },

  { name: 'Quiver', description: 'A leather quiver for carrying arrows.',
    itemType: 'tool', icon: '🏹', value: 8, sellValue: 5, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: null, lootWeight: 10, tags: ['equipment', 'loot:common'],
    category: 'equipment', material: 'leather', baseType: 'quiver', rarity: 'common', possessable: true },

  { name: 'Spell Book', description: 'A tome of arcane spells bound in aged leather.',
    itemType: 'collectible', icon: '📕', value: 50, sellValue: 30, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'book',
    effects: null, lootWeight: 2, tags: ['collectible', 'magic', 'knowledge', 'loot:rare'],
    category: 'document', material: 'paper', baseType: 'book', rarity: 'rare', possessable: true },

  { name: 'Crystal Ball', description: 'A smooth crystal sphere used for divination.',
    itemType: 'collectible', icon: '🔮', value: 75, sellValue: 45, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: null, lootWeight: 1, tags: ['collectible', 'magic', 'loot:epic'],
    category: 'treasure', material: 'glass', baseType: 'crystal_ball', rarity: 'epic', possessable: true },

  { name: 'Candleholder', description: 'An ornate brass candleholder.',
    itemType: 'collectible', icon: '🕯️', value: 6, sellValue: 3, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'candleholder',
    effects: null, lootWeight: 10, tags: ['decoration', 'light', 'loot:common'],
    category: 'decoration', material: 'brass', baseType: 'candleholder', rarity: 'common', possessable: true },

  { name: 'Goblet', description: 'A fine drinking goblet.',
    itemType: 'collectible', icon: '🏆', value: 8, sellValue: 5, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'goblet',
    effects: null, lootWeight: 10, tags: ['collectible', 'loot:common'],
    category: 'collectible', material: 'brass', baseType: 'goblet', rarity: 'common', possessable: true },

  { name: 'Stew', description: 'A bowl of hearty stew.',
    itemType: 'food', icon: '🍲', value: 5, sellValue: 3, weight: 1,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { health: 15, energy: 20 }, lootWeight: 10, tags: ['food', 'cooked', 'loot:common'],
    category: 'food', material: null, baseType: 'cooked_meal', rarity: 'common', possessable: true },

  { name: 'Roasted Chicken', description: 'A whole roasted chicken, golden and crispy.',
    itemType: 'food', icon: '🍗', value: 6, sellValue: 4, weight: 1.5,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'medieval-fantasy', objectRole: null,
    effects: { health: 20, energy: 25 }, lootWeight: 8, tags: ['food', 'cooked', 'loot:common'],
    category: 'food', material: null, baseType: 'cooked_meal', rarity: 'common', possessable: true },

  // Medieval furniture (not possessable)
  { name: 'Gothic Cabinet', description: 'An ornate Gothic wooden cabinet.',
    itemType: 'collectible', icon: '🗄️', value: 25, sellValue: 12, weight: 25,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'cabinet',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'cabinet', rarity: 'uncommon', possessable: false },

  { name: 'Commode', description: 'A Gothic commode with drawers.',
    itemType: 'collectible', icon: '🪵', value: 18, sellValue: 9, weight: 18,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'medieval-fantasy', objectRole: 'commode',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'commode', rarity: 'common', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // CYBERPUNK
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Shock Baton', description: 'An electrified melee weapon favored by street enforcers.',
    itemType: 'weapon', icon: '⚡', value: 30, sellValue: 18, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: { attackPower: 0.5 }, lootWeight: 12, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'composite', baseType: 'baton', rarity: 'common', possessable: true },

  { name: 'Plasma Rifle', description: 'A military-grade plasma discharge rifle.',
    itemType: 'weapon', icon: '🔫', value: 80, sellValue: 48, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: { attackPower: 0.9 }, lootWeight: 3, tags: ['weapon', 'ranged', 'loot:rare'],
    category: 'ranged_weapon', material: 'composite', baseType: 'rifle', rarity: 'rare', possessable: true },

  { name: 'Nano-Wire', description: 'Monomolecular wire that can cut through almost anything.',
    itemType: 'weapon', icon: '🧵', value: 50, sellValue: 30, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: { attackPower: 0.7 }, lootWeight: 5, tags: ['weapon', 'melee', 'loot:rare'],
    category: 'melee_weapon', material: 'composite', baseType: 'wire', rarity: 'rare', possessable: true },

  { name: 'Holo-Shield', description: 'A projected energy barrier worn on the forearm.',
    itemType: 'armor', icon: '🛡️', value: 45, sellValue: 27, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: { defense: 15 }, lootWeight: 5, tags: ['armor', 'tech', 'loot:uncommon'],
    category: 'shield', material: 'composite', baseType: 'shield', rarity: 'uncommon', possessable: true },

  { name: 'Synth-Armor Vest', description: 'Lightweight body armor made from synthetic fibers.',
    itemType: 'armor', icon: '🦺', value: 35, sellValue: 21, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: { defense: 12 }, lootWeight: 8, tags: ['armor', 'loot:uncommon'],
    category: 'light_armor', material: 'composite', baseType: 'body_armor', rarity: 'uncommon', possessable: true },

  { name: 'Combat Helmet', description: 'Ballistic helmet with integrated HUD.',
    itemType: 'armor', icon: '⛑️', value: 30, sellValue: 18, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: { defense: 8 }, lootWeight: 6, tags: ['armor', 'tech', 'loot:uncommon'],
    category: 'head_armor', material: 'composite', baseType: 'helmet', rarity: 'uncommon', possessable: true },

  { name: 'Neural Interface', description: 'A cortical implant for direct net access.',
    itemType: 'tool', icon: '🧠', value: 100, sellValue: 60, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: null, lootWeight: 1, tags: ['implant', 'tech', 'loot:epic'],
    category: 'implant', material: 'composite', baseType: 'implant', rarity: 'epic', possessable: true },

  { name: 'Reflex Booster', description: 'A spinal implant that increases reaction speed.',
    itemType: 'consumable', icon: '💉', value: 60, sellValue: 36, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: { attackPower: 0.2 }, lootWeight: 3, tags: ['implant', 'tech', 'loot:rare'],
    category: 'implant', material: 'composite', baseType: 'implant', rarity: 'rare', possessable: true },

  { name: 'Stim Pack', description: 'A cocktail of combat stimulants.',
    itemType: 'consumable', icon: '💊', value: 15, sellValue: 9, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'cyberpunk', objectRole: null,
    effects: { health: 30, energy: 20 }, lootWeight: 12, tags: ['consumable', 'medical', 'loot:common'],
    category: 'medical', material: null, baseType: 'stim', rarity: 'common', possessable: true },

  { name: 'E-Ration', description: 'A vacuum-sealed nutrient block.',
    itemType: 'food', icon: '🍱', value: 5, sellValue: 3, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'cyberpunk', objectRole: null,
    effects: { energy: 15, health: 5 }, lootWeight: 15, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'ration', rarity: 'common', possessable: true },

  { name: 'Neon Drink', description: 'A luminous cocktail from a street bar.',
    itemType: 'drink', icon: '🍹', value: 8, sellValue: 5, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'cyberpunk', objectRole: null,
    effects: { energy: 10 }, lootWeight: 10, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Hacking Spike', description: 'A single-use device for bypassing electronic locks.',
    itemType: 'key', icon: '🔌', value: 20, sellValue: 12, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'cyberpunk', objectRole: null,
    effects: null, lootWeight: 8, tags: ['key', 'tech', 'loot:uncommon'],
    category: 'key', material: 'composite', baseType: 'spike', rarity: 'uncommon', possessable: true },

  { name: 'ID Chip', description: 'A forged identity chip.',
    itemType: 'key', icon: '💳', value: 25, sellValue: 15, weight: 0.05,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: null,
    effects: null, lootWeight: 3, tags: ['key', 'quest', 'loot:rare'],
    category: 'key', material: 'composite', baseType: 'chip', rarity: 'rare', possessable: true },

  { name: 'Scrap Metal', description: 'Salvaged scrap useful for repairs and upgrades.',
    itemType: 'material', icon: '🔩', value: 2, sellValue: 1, weight: 2,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: 'cyberpunk', objectRole: null,
    effects: null, lootWeight: 25, tags: ['material', 'crafting', 'loot:common'],
    category: 'raw_material', material: 'iron', baseType: 'scrap', rarity: 'common', possessable: true },

  { name: 'Circuit Board', description: 'A salvaged circuit board with usable components.',
    itemType: 'material', icon: '🖥️', value: 8, sellValue: 5, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: 'cyberpunk', objectRole: null,
    effects: null, lootWeight: 12, tags: ['material', 'crafting', 'tech', 'loot:common'],
    category: 'component', material: 'composite', baseType: 'circuit', rarity: 'common', possessable: true },

  { name: 'Boombox', description: 'A vintage portable sound system blasting tunes.',
    itemType: 'collectible', icon: '📻', value: 15, sellValue: 9, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'cyberpunk', objectRole: 'boombox',
    effects: null, lootWeight: 0, tags: ['decoration'],
    category: 'decoration', material: 'composite', baseType: 'boombox', rarity: 'common', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCI-FI-SPACE
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Laser Rifle', description: 'A long-range laser weapon with pinpoint accuracy.',
    itemType: 'weapon', icon: '🔫', value: 60, sellValue: 36, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { attackPower: 0.7 }, lootWeight: 5, tags: ['weapon', 'ranged', 'loot:uncommon'],
    category: 'ranged_weapon', material: 'composite', baseType: 'rifle', rarity: 'uncommon', possessable: true },

  { name: 'Stun Baton', description: 'A non-lethal electric baton used by security forces.',
    itemType: 'weapon', icon: '⚡', value: 20, sellValue: 12, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { attackPower: 0.3 }, lootWeight: 10, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'composite', baseType: 'baton', rarity: 'common', possessable: true },

  { name: 'Photon Blade', description: 'A blade of focused light energy.',
    itemType: 'weapon', icon: '🔦', value: 90, sellValue: 54, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { attackPower: 0.9 }, lootWeight: 2, tags: ['weapon', 'melee', 'loot:epic'],
    category: 'melee_weapon', material: 'composite', baseType: 'blade', rarity: 'epic', possessable: true },

  { name: 'EVA Suit', description: 'An extravehicular activity suit for spacewalks.',
    itemType: 'armor', icon: '🧑‍🚀', value: 80, sellValue: 48, weight: 8,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { defense: 20 }, lootWeight: 3, tags: ['armor', 'tech', 'loot:rare'],
    category: 'heavy_armor', material: 'composite', baseType: 'suit', rarity: 'rare', possessable: true },

  { name: 'Shield Generator', description: 'A personal energy shield device.',
    itemType: 'armor', icon: '🛡️', value: 70, sellValue: 42, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { defense: 18 }, lootWeight: 3, tags: ['armor', 'tech', 'loot:rare'],
    category: 'shield', material: 'composite', baseType: 'shield', rarity: 'rare', possessable: true },

  { name: 'Bio-Gel Pack', description: 'A regenerative gel that heals wounds rapidly.',
    itemType: 'consumable', icon: '💚', value: 25, sellValue: 15, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { health: 40 }, lootWeight: 8, tags: ['consumable', 'medical', 'loot:uncommon'],
    category: 'medical', material: null, baseType: 'gel', rarity: 'uncommon', possessable: true },

  { name: 'Stim Injector', description: 'An auto-injector loaded with performance enhancers.',
    itemType: 'consumable', icon: '💉', value: 18, sellValue: 11, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { energy: 30, attackPower: 0.1 }, lootWeight: 10, tags: ['consumable', 'medical', 'loot:common'],
    category: 'medical', material: null, baseType: 'injector', rarity: 'common', possessable: true },

  { name: 'Nutrient Paste', description: 'A tube of nutritionally complete paste.',
    itemType: 'food', icon: '🥫', value: 4, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { energy: 12, health: 5 }, lootWeight: 15, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'ration', rarity: 'common', possessable: true },

  { name: 'Protein Bar', description: 'A dense protein supplement bar.',
    itemType: 'food', icon: '🍫', value: 3, sellValue: 2, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'sci-fi-space', objectRole: null,
    effects: { energy: 10 }, lootWeight: 18, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'ration', rarity: 'common', possessable: true },

  { name: 'Data Crystal', description: 'A crystalline storage medium containing encrypted data.',
    itemType: 'key', icon: '💎', value: 30, sellValue: 18, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 5, tags: ['key', 'tech', 'quest', 'loot:rare'],
    category: 'data', material: null, baseType: 'crystal', rarity: 'rare', possessable: true },

  { name: 'Access Keycard', description: 'A security keycard for restricted areas.',
    itemType: 'key', icon: '🪪', value: 15, sellValue: 0, weight: 0.05,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 5, tags: ['key', 'quest', 'loot:uncommon'],
    category: 'key', material: 'composite', baseType: 'keycard', rarity: 'uncommon', possessable: true },

  { name: 'Titanium Alloy', description: 'A lightweight, incredibly strong alloy.',
    itemType: 'material', icon: '🔩', value: 20, sellValue: 12, weight: 2,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 8, tags: ['material', 'crafting', 'loot:uncommon'],
    category: 'refined_material', material: 'titanium', baseType: 'alloy', rarity: 'uncommon', possessable: true },

  { name: 'Quantum Chip', description: 'A processing chip utilizing quantum superposition.',
    itemType: 'material', icon: '🖥️', value: 50, sellValue: 30, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 3, tags: ['material', 'crafting', 'tech', 'loot:rare'],
    category: 'component', material: 'composite', baseType: 'chip', rarity: 'rare', possessable: true },

  { name: 'Scanner', description: 'A handheld device for analyzing materials and life forms.',
    itemType: 'tool', icon: '📡', value: 25, sellValue: 15, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 6, tags: ['tool', 'tech', 'loot:uncommon'],
    category: 'tool', material: 'composite', baseType: 'scanner', rarity: 'uncommon', possessable: true },

  { name: 'Multi-Tool', description: 'A versatile engineering tool with multiple attachments.',
    itemType: 'tool', icon: '🔧', value: 15, sellValue: 9, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'sci-fi-space', objectRole: null,
    effects: null, lootWeight: 10, tags: ['tool', 'loot:common'],
    category: 'tool', material: 'composite', baseType: 'multi_tool', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // WESTERN
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Rifle', description: 'A lever-action hunting rifle.',
    itemType: 'weapon', icon: '🔫', value: 40, sellValue: 24, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: { attackPower: 0.7 }, lootWeight: 8, tags: ['weapon', 'ranged', 'loot:uncommon'],
    category: 'ranged_weapon', material: 'iron', baseType: 'rifle', rarity: 'uncommon', possessable: true },

  { name: 'Shotgun', description: 'A double-barreled shotgun.',
    itemType: 'weapon', icon: '🔫', value: 50, sellValue: 30, weight: 5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: { attackPower: 0.8 }, lootWeight: 5, tags: ['weapon', 'ranged', 'loot:uncommon'],
    category: 'ranged_weapon', material: 'iron', baseType: 'shotgun', rarity: 'uncommon', possessable: true },

  { name: 'Bowie Knife', description: 'A large fixed-blade frontier knife.',
    itemType: 'weapon', icon: '🔪', value: 15, sellValue: 9, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: { attackPower: 0.4 }, lootWeight: 15, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'steel', baseType: 'knife', rarity: 'common', possessable: true },

  { name: 'Leather Duster', description: 'A long leather coat worn against wind and dust.',
    itemType: 'armor', icon: '🧥', value: 20, sellValue: 12, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: { defense: 5 }, lootWeight: 8, tags: ['armor', 'loot:common'],
    category: 'light_armor', material: 'leather', baseType: 'coat', rarity: 'common', possessable: true },

  { name: 'Cowboy Hat', description: 'A wide-brimmed hat offering shade on the trail.',
    itemType: 'armor', icon: '🤠', value: 10, sellValue: 6, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: { defense: 2 }, lootWeight: 12, tags: ['armor', 'loot:common'],
    category: 'head_armor', material: 'leather', baseType: 'hat', rarity: 'common', possessable: true },

  { name: 'Bullets', description: 'A box of pistol and rifle ammunition.',
    itemType: 'material', icon: '🔴', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: 'western', objectRole: null,
    effects: null, lootWeight: 20, tags: ['ammunition', 'loot:common'],
    category: 'ammunition', material: 'iron', baseType: 'ammo', rarity: 'common', possessable: true },

  { name: 'Moonshine', description: 'Illegally distilled corn whiskey. Potent.',
    itemType: 'drink', icon: '🥃', value: 8, sellValue: 5, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'western', objectRole: null,
    effects: { energy: 15, health: -5 }, lootWeight: 10, tags: ['drink', 'loot:uncommon'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'uncommon', possessable: true },

  { name: 'Beef Jerky', description: 'Dried and salted strips of beef for the trail.',
    itemType: 'food', icon: '🥩', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'western', objectRole: null,
    effects: { energy: 12, health: 5 }, lootWeight: 15, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'dried_meat', rarity: 'common', possessable: true },

  { name: 'Canned Beans', description: 'A tin of baked beans. Trail staple.',
    itemType: 'food', icon: '🥫', value: 2, sellValue: 1, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'western', objectRole: null,
    effects: { energy: 10, health: 5 }, lootWeight: 18, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'canned_food', rarity: 'common', possessable: true },

  { name: 'Pocket Watch', description: 'A ticking brass pocket watch on a chain.',
    itemType: 'collectible', icon: '⌚', value: 20, sellValue: 12, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: null, lootWeight: 5, tags: ['collectible', 'loot:uncommon'],
    category: 'jewelry', material: 'brass', baseType: 'watch', rarity: 'uncommon', possessable: true },

  { name: 'Harmonica', description: 'A tin harmonica for campfire tunes.',
    itemType: 'collectible', icon: '🎵', value: 5, sellValue: 3, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: null, lootWeight: 8, tags: ['collectible', 'loot:common'],
    category: 'collectible', material: 'iron', baseType: 'instrument', rarity: 'common', possessable: true },

  { name: 'Gold Nugget', description: 'A small nugget of raw gold panned from the river.',
    itemType: 'material', icon: '✨', value: 30, sellValue: 25, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'western', objectRole: null,
    effects: null, lootWeight: 3, tags: ['material', 'treasure', 'loot:rare'],
    category: 'ore', material: 'gold', baseType: 'nugget', rarity: 'rare', possessable: true },

  { name: 'Tobacco Pouch', description: 'A leather pouch of rolling tobacco.',
    itemType: 'consumable', icon: '🤎', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'western', objectRole: null,
    effects: null, lootWeight: 12, tags: ['consumable', 'loot:common'],
    category: 'consumable', material: null, baseType: 'tobacco', rarity: 'common', possessable: true },

  { name: 'Lantern', description: 'A brass hurricane lantern for the frontier night.',
    itemType: 'tool', icon: '🔦', value: 8, sellValue: 5, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: 'lantern',
    effects: null, lootWeight: 8, tags: ['tool', 'light', 'loot:common'],
    category: 'light_source', material: 'brass', baseType: 'lantern', rarity: 'common', possessable: true },

  { name: 'Axe', description: 'A sturdy felling axe for chopping wood.',
    itemType: 'tool', icon: '🪓', value: 10, sellValue: 6, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: 'axe',
    effects: { attackPower: 0.3 }, lootWeight: 8, tags: ['tool', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'axe', rarity: 'common', possessable: true },

  { name: 'Saddle', description: 'A leather riding saddle.',
    itemType: 'tool', icon: '🐎', value: 25, sellValue: 15, weight: 8,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: null,
    effects: null, lootWeight: 3, tags: ['equipment', 'loot:uncommon'],
    category: 'equipment', material: 'leather', baseType: 'saddle', rarity: 'uncommon', possessable: false },

  // Western furniture (not possessable)
  { name: 'Bar Stool', description: 'A round wooden bar stool.',
    itemType: 'collectible', icon: '🪑', value: 6, sellValue: 3, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: 'bar_stool',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'stool', rarity: 'common', possessable: false },

  { name: 'Rocking Chair', description: 'A solid wood rocking chair for the porch.',
    itemType: 'collectible', icon: '🪑', value: 12, sellValue: 6, weight: 8,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: 'chair',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'chair', rarity: 'common', possessable: false },

  { name: 'Cash Register', description: 'A vintage brass cash register.',
    itemType: 'collectible', icon: '🏧', value: 30, sellValue: 15, weight: 15,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'western', objectRole: 'register',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'brass', baseType: 'register', rarity: 'uncommon', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORICAL-ANCIENT
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Bronze Sword', description: 'A short sword cast from bronze.',
    itemType: 'weapon', icon: '⚔️', value: 20, sellValue: 12, weight: 2.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: null,
    effects: { attackPower: 0.4 }, lootWeight: 12, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'bronze', baseType: 'sword', rarity: 'common', possessable: true },

  { name: 'Javelin', description: 'A throwing spear used by ancient warriors.',
    itemType: 'weapon', icon: '🔱', value: 10, sellValue: 6, weight: 2,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'historical-ancient', objectRole: null,
    effects: { attackPower: 0.4 }, lootWeight: 15, tags: ['weapon', 'ranged', 'loot:common'],
    category: 'ranged_weapon', material: 'iron', baseType: 'javelin', rarity: 'common', possessable: true },

  { name: 'Gladius', description: 'The iconic Roman short sword.',
    itemType: 'weapon', icon: '⚔️', value: 30, sellValue: 18, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: null,
    effects: { attackPower: 0.5 }, lootWeight: 8, tags: ['weapon', 'melee', 'loot:uncommon'],
    category: 'melee_weapon', material: 'iron', baseType: 'sword', rarity: 'uncommon', possessable: true },

  { name: 'Round Shield', description: 'A wooden round shield with bronze boss.',
    itemType: 'armor', icon: '🛡️', value: 15, sellValue: 9, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: null,
    effects: { defense: 8 }, lootWeight: 10, tags: ['armor', 'shield', 'loot:common'],
    category: 'shield', material: 'wood', baseType: 'shield', rarity: 'common', possessable: true },

  { name: 'Toga', description: 'A finely woven toga for civic occasions.',
    itemType: 'armor', icon: '👔', value: 12, sellValue: 7, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: null,
    effects: { defense: 2 }, lootWeight: 8, tags: ['armor', 'clothing', 'loot:common'],
    category: 'light_armor', material: 'cloth', baseType: 'toga', rarity: 'common', possessable: true },

  { name: 'Laurel Wreath', description: 'A crown of laurel leaves, symbol of victory.',
    itemType: 'collectible', icon: '🏅', value: 30, sellValue: 18, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: null,
    effects: null, lootWeight: 3, tags: ['collectible', 'treasure', 'loot:rare'],
    category: 'treasure', material: null, baseType: 'wreath', rarity: 'rare', possessable: true },

  { name: 'Amphora', description: 'A two-handled clay vessel for wine or oil.',
    itemType: 'collectible', icon: '🏺', value: 8, sellValue: 5, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: 'vase',
    effects: null, lootWeight: 8, tags: ['container', 'loot:common'],
    category: 'container', material: 'clay', baseType: 'amphora', rarity: 'common', possessable: true },

  { name: 'Olive Oil', description: 'A flask of fragrant olive oil.',
    itemType: 'food', icon: '🫒', value: 5, sellValue: 3, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'historical-ancient', objectRole: null,
    effects: { energy: 8 }, lootWeight: 12, tags: ['food', 'ingredient', 'loot:common'],
    category: 'ingredient', material: null, baseType: 'oil', rarity: 'common', possessable: true },

  { name: 'Flatbread', description: 'A round disc of baked flatbread.',
    itemType: 'food', icon: '🫓', value: 2, sellValue: 1, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'historical-ancient', objectRole: null,
    effects: { energy: 8, health: 3 }, lootWeight: 18, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'bread', rarity: 'common', possessable: true },

  { name: 'Wine Jug', description: 'A clay jug of local wine.',
    itemType: 'drink', icon: '🍷', value: 6, sellValue: 4, weight: 2,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'historical-ancient', objectRole: null,
    effects: { energy: 12 }, lootWeight: 10, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Papyrus Scroll', description: 'A scroll of papyrus inscribed with ancient text.',
    itemType: 'collectible', icon: '📜', value: 15, sellValue: 9, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'historical-ancient', objectRole: null,
    effects: null, lootWeight: 6, tags: ['collectible', 'knowledge', 'loot:uncommon'],
    category: 'document', material: 'paper', baseType: 'scroll', rarity: 'uncommon', possessable: true },

  { name: 'Ancient Coin', description: 'A coin stamped with a forgotten ruler.',
    itemType: 'collectible', icon: '🪙', value: 10, sellValue: 8, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 50,
    worldType: 'historical-ancient', objectRole: null,
    effects: null, lootWeight: 8, tags: ['currency', 'collectible', 'loot:common'],
    category: 'currency', material: 'bronze', baseType: 'coin', rarity: 'common', possessable: true },

  { name: 'Brass Pot', description: 'A well-used brass cooking pot.',
    itemType: 'tool', icon: '🍲', value: 6, sellValue: 3, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: 'pot',
    effects: null, lootWeight: 8, tags: ['tool', 'cooking', 'loot:common'],
    category: 'tool', material: 'brass', baseType: 'pot', rarity: 'common', possessable: true },

  { name: 'Brass Pan', description: 'A wide brass pan for frying.',
    itemType: 'tool', icon: '🍳', value: 5, sellValue: 3, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: 'pan',
    effects: null, lootWeight: 8, tags: ['tool', 'cooking', 'loot:common'],
    category: 'tool', material: 'brass', baseType: 'pan', rarity: 'common', possessable: true },

  // Historical furniture (not possessable)
  { name: 'Stone Fire Pit', description: 'A circular fire pit made of stacked stones.',
    itemType: 'collectible', icon: '🔥', value: 5, sellValue: 2, weight: 30,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'historical-ancient', objectRole: 'fire_pit',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'stone', baseType: 'fire_pit', rarity: 'common', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-APOCALYPTIC
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Pipe Wrench', description: 'A heavy wrench that doubles as a blunt weapon.',
    itemType: 'weapon', icon: '🔧', value: 8, sellValue: 5, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { attackPower: 0.3 }, lootWeight: 15, tags: ['weapon', 'melee', 'tool', 'loot:common'],
    category: 'melee_weapon', material: 'iron', baseType: 'wrench', rarity: 'common', possessable: true },

  { name: 'Makeshift Rifle', description: 'A cobbled-together rifle made from scavenged parts.',
    itemType: 'weapon', icon: '🔫', value: 25, sellValue: 15, weight: 4,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { attackPower: 0.5 }, lootWeight: 8, tags: ['weapon', 'ranged', 'loot:uncommon'],
    category: 'ranged_weapon', material: 'iron', baseType: 'rifle', rarity: 'uncommon', possessable: true },

  { name: 'Spiked Bat', description: 'A wooden bat driven through with nails.',
    itemType: 'weapon', icon: '🏏', value: 12, sellValue: 7, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { attackPower: 0.4 }, lootWeight: 12, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'wood', baseType: 'club', rarity: 'common', possessable: true },

  { name: 'Scrap Armor', description: 'Armor cobbled from car parts and road signs.',
    itemType: 'armor', icon: '🦺', value: 15, sellValue: 9, weight: 6,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { defense: 10 }, lootWeight: 8, tags: ['armor', 'loot:common'],
    category: 'heavy_armor', material: 'iron', baseType: 'body_armor', rarity: 'common', possessable: true },

  { name: 'Gas Mask', description: 'A respirator mask filtering out toxins.',
    itemType: 'armor', icon: '😷', value: 20, sellValue: 12, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { defense: 3 }, lootWeight: 8, tags: ['armor', 'survival', 'loot:uncommon'],
    category: 'head_armor', material: null, baseType: 'mask', rarity: 'uncommon', possessable: true },

  { name: 'Canned Food', description: 'A dented can of pre-war food. Still edible.',
    itemType: 'food', icon: '🥫', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { energy: 15, health: 5 }, lootWeight: 15, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'canned_food', rarity: 'common', possessable: true },

  { name: 'Purified Water', description: 'A precious bottle of clean water.',
    itemType: 'drink', icon: '💧', value: 8, sellValue: 5, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { energy: 10, health: 10 }, lootWeight: 10, tags: ['drink', 'survival', 'loot:uncommon'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'uncommon', possessable: true },

  { name: 'Rad-Away', description: 'A chemical solution that flushes radiation from the body.',
    itemType: 'consumable', icon: '💊', value: 15, sellValue: 9, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: { health: 25 }, lootWeight: 8, tags: ['consumable', 'medical', 'loot:uncommon'],
    category: 'medical', material: null, baseType: 'medicine', rarity: 'uncommon', possessable: true },

  { name: 'Duct Tape', description: 'The universal repair material of the wasteland.',
    itemType: 'material', icon: '🩹', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: null, lootWeight: 18, tags: ['material', 'crafting', 'loot:common'],
    category: 'component', material: null, baseType: 'tape', rarity: 'common', possessable: true },

  { name: 'Fuel Can', description: 'A can of gasoline. Highly valuable for trade.',
    itemType: 'material', icon: '⛽', value: 20, sellValue: 15, weight: 4,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: null, lootWeight: 5, tags: ['material', 'fuel', 'loot:rare'],
    category: 'fuel', material: null, baseType: 'fuel', rarity: 'rare', possessable: true },

  { name: 'Survival Axe', description: 'A weathered axe for chopping and defense.',
    itemType: 'tool', icon: '🪓', value: 12, sellValue: 7, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: 'axe',
    effects: { attackPower: 0.3 }, lootWeight: 10, tags: ['tool', 'weapon', 'loot:common'],
    category: 'tool', material: 'iron', baseType: 'axe', rarity: 'common', possessable: true },

  { name: 'Geiger Counter', description: 'A clicking device that measures radiation levels.',
    itemType: 'tool', icon: '☢️', value: 30, sellValue: 18, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: null,
    effects: null, lootWeight: 3, tags: ['tool', 'survival', 'loot:rare'],
    category: 'tool', material: null, baseType: 'detector', rarity: 'rare', possessable: true },

  // Post-apocalyptic furniture (not possessable)
  { name: 'Barrel Stove', description: 'A fire barrel used for warmth in the ruins.',
    itemType: 'collectible', icon: '🔥', value: 5, sellValue: 2, weight: 20,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'post-apocalyptic', objectRole: 'barrel_fire',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'iron', baseType: 'stove', rarity: 'common', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // TROPICAL-PIRATE
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Cutlass', description: 'A curved pirate sword for close-quarters combat.',
    itemType: 'weapon', icon: '⚔️', value: 25, sellValue: 15, weight: 2.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: 'saber',
    effects: { attackPower: 0.5 }, lootWeight: 12, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'steel', baseType: 'sword', rarity: 'common', possessable: true },

  { name: 'Flintlock Pistol', description: 'A single-shot black-powder pistol.',
    itemType: 'weapon', icon: '🔫', value: 30, sellValue: 18, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: null,
    effects: { attackPower: 0.6 }, lootWeight: 8, tags: ['weapon', 'ranged', 'loot:uncommon'],
    category: 'ranged_weapon', material: 'iron', baseType: 'pistol', rarity: 'uncommon', possessable: true },

  { name: 'Boarding Axe', description: 'A short axe used for climbing ship hulls in boarding actions.',
    itemType: 'weapon', icon: '🪓', value: 15, sellValue: 9, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: null,
    effects: { attackPower: 0.4 }, lootWeight: 10, tags: ['weapon', 'melee', 'loot:common'],
    category: 'melee_weapon', material: 'iron', baseType: 'axe', rarity: 'common', possessable: true },

  { name: 'Pirate Hat', description: 'A tricorn hat marking the wearer as a sea rover.',
    itemType: 'armor', icon: '🎩', value: 12, sellValue: 7, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: null,
    effects: { defense: 2 }, lootWeight: 8, tags: ['armor', 'loot:common'],
    category: 'head_armor', material: 'cloth', baseType: 'hat', rarity: 'common', possessable: true },

  { name: 'Rum', description: 'A bottle of dark Caribbean rum.',
    itemType: 'drink', icon: '🍾', value: 8, sellValue: 5, weight: 1.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'tropical-pirate', objectRole: null,
    effects: { energy: 15, health: -3 }, lootWeight: 15, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Coconut', description: 'A fresh coconut full of sweet water.',
    itemType: 'food', icon: '🥥', value: 2, sellValue: 1, weight: 1,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'tropical-pirate', objectRole: null,
    effects: { energy: 8, health: 5 }, lootWeight: 15, tags: ['food', 'natural', 'loot:common'],
    category: 'food', material: null, baseType: 'fruit', rarity: 'common', possessable: true },

  { name: 'Banana', description: 'A ripe yellow banana.',
    itemType: 'food', icon: '🍌', value: 1, sellValue: 0, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'tropical-pirate', objectRole: null,
    effects: { energy: 5, health: 3 }, lootWeight: 20, tags: ['food', 'natural', 'loot:common'],
    category: 'food', material: null, baseType: 'fruit', rarity: 'common', possessable: true },

  { name: 'Treasure Map', description: 'A weathered map with an X marking buried treasure.',
    itemType: 'quest', icon: '🗺️', value: 50, sellValue: 0, weight: 0.1,
    tradeable: false, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: null,
    effects: null, lootWeight: 1, tags: ['quest', 'loot:legendary'],
    category: 'document', material: 'paper', baseType: 'map', rarity: 'legendary', possessable: true },

  { name: 'Gold Doubloon', description: 'A Spanish gold coin, the currency of the seas.',
    itemType: 'collectible', icon: '🪙', value: 20, sellValue: 18, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 99,
    worldType: 'tropical-pirate', objectRole: null,
    effects: null, lootWeight: 8, tags: ['currency', 'treasure', 'loot:uncommon'],
    category: 'currency', material: 'gold', baseType: 'coin', rarity: 'uncommon', possessable: true },

  { name: 'Pearl', description: 'A lustrous pearl from a tropical oyster.',
    itemType: 'collectible', icon: '⚪', value: 25, sellValue: 20, weight: 0.1,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'tropical-pirate', objectRole: null,
    effects: null, lootWeight: 5, tags: ['collectible', 'treasure', 'loot:rare'],
    category: 'gemstone', material: null, baseType: 'pearl', rarity: 'rare', possessable: true },

  { name: 'Spyglass', description: 'A collapsible brass telescope for sighting distant ships.',
    itemType: 'tool', icon: '🔭', value: 20, sellValue: 12, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: null,
    effects: null, lootWeight: 5, tags: ['tool', 'navigation', 'loot:uncommon'],
    category: 'tool', material: 'brass', baseType: 'telescope', rarity: 'uncommon', possessable: true },

  { name: 'Compass', description: 'A brass compass that always points north... mostly.',
    itemType: 'tool', icon: '🧭', value: 15, sellValue: 9, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: null,
    effects: null, lootWeight: 6, tags: ['tool', 'navigation', 'loot:uncommon'],
    category: 'tool', material: 'brass', baseType: 'compass', rarity: 'uncommon', possessable: true },

  { name: 'Fishing Net', description: 'A wide net for catching fish.',
    itemType: 'tool', icon: '🥅', value: 8, sellValue: 5, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'loot:common'],
    category: 'tool', material: 'fiber', baseType: 'net', rarity: 'common', possessable: true },

  { name: 'Pirate Lantern', description: 'A maritime wooden lantern.',
    itemType: 'tool', icon: '🔦', value: 10, sellValue: 6, weight: 1.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'tropical-pirate', objectRole: 'lantern',
    effects: null, lootWeight: 8, tags: ['tool', 'light', 'loot:common'],
    category: 'light_source', material: 'wood', baseType: 'lantern', rarity: 'common', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEAMPUNK
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Steam Pistol', description: 'A pressure-powered pistol with brass fittings.',
    itemType: 'weapon', icon: '🔫', value: 35, sellValue: 21, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: null,
    effects: { attackPower: 0.5 }, lootWeight: 10, tags: ['weapon', 'ranged', 'loot:common'],
    category: 'ranged_weapon', material: 'brass', baseType: 'pistol', rarity: 'common', possessable: true },

  { name: 'Clockwork Sword', description: 'A sword with a clockwork mechanism that vibrates the blade.',
    itemType: 'weapon', icon: '⚔️', value: 55, sellValue: 33, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: null,
    effects: { attackPower: 0.7 }, lootWeight: 5, tags: ['weapon', 'melee', 'tech', 'loot:rare'],
    category: 'melee_weapon', material: 'steel', baseType: 'sword', rarity: 'rare', possessable: true },

  { name: 'Aether Goggles', description: 'Brass goggles that reveal invisible aether currents.',
    itemType: 'armor', icon: '🥽', value: 25, sellValue: 15, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: null,
    effects: { defense: 3 }, lootWeight: 8, tags: ['armor', 'tech', 'loot:uncommon'],
    category: 'head_armor', material: 'brass', baseType: 'goggles', rarity: 'uncommon', possessable: true },

  { name: 'Reinforced Corset', description: 'A steel-boned corset offering surprising protection.',
    itemType: 'armor', icon: '🦺', value: 30, sellValue: 18, weight: 3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: null,
    effects: { defense: 8 }, lootWeight: 6, tags: ['armor', 'loot:uncommon'],
    category: 'light_armor', material: 'steel', baseType: 'body_armor', rarity: 'uncommon', possessable: true },

  { name: 'Clockwork Key', description: 'A complex winding key for clockwork mechanisms.',
    itemType: 'key', icon: '🔑', value: 15, sellValue: 9, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: null,
    effects: null, lootWeight: 8, tags: ['key', 'tech', 'loot:uncommon'],
    category: 'key', material: 'brass', baseType: 'key', rarity: 'uncommon', possessable: true },

  { name: 'Gear Set', description: 'Assorted brass gears for clockwork mechanisms.',
    itemType: 'material', icon: '⚙️', value: 5, sellValue: 3, weight: 1,
    tradeable: true, stackable: true, maxStack: 30,
    worldType: 'steampunk', objectRole: null,
    effects: null, lootWeight: 15, tags: ['material', 'crafting', 'tech', 'loot:common'],
    category: 'component', material: 'brass', baseType: 'gear', rarity: 'common', possessable: true },

  { name: 'Steam Core', description: 'A pressurized steam canister, the heart of steam-powered devices.',
    itemType: 'material', icon: '♨️', value: 20, sellValue: 12, weight: 3,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'steampunk', objectRole: null,
    effects: null, lootWeight: 5, tags: ['material', 'crafting', 'tech', 'loot:uncommon'],
    category: 'component', material: 'iron', baseType: 'core', rarity: 'uncommon', possessable: true },

  { name: 'Tea', description: 'A tin of fine loose-leaf tea.',
    itemType: 'drink', icon: '🍵', value: 5, sellValue: 3, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'steampunk', objectRole: null,
    effects: { energy: 10 }, lootWeight: 12, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Scone', description: 'A fresh cream scone, perfect with tea.',
    itemType: 'food', icon: '🧁', value: 3, sellValue: 2, weight: 0.2,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'steampunk', objectRole: null,
    effects: { energy: 8, health: 3 }, lootWeight: 10, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'pastry', rarity: 'common', possessable: true },

  { name: 'Blowtorch', description: 'A brass blowtorch for welding and metalwork.',
    itemType: 'tool', icon: '🔥', value: 12, sellValue: 7, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: 'blowtorch',
    effects: null, lootWeight: 6, tags: ['tool', 'crafting', 'loot:common'],
    category: 'tool', material: 'brass', baseType: 'blowtorch', rarity: 'common', possessable: true },

  { name: 'Pocket Chronometer', description: 'A precision brass timepiece.',
    itemType: 'collectible', icon: '⌚', value: 30, sellValue: 18, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: null,
    effects: null, lootWeight: 5, tags: ['collectible', 'tech', 'loot:uncommon'],
    category: 'jewelry', material: 'brass', baseType: 'watch', rarity: 'uncommon', possessable: true },

  { name: 'Monocle', description: 'A brass-rimmed monocle for the distinguished inventor.',
    itemType: 'collectible', icon: '🧐', value: 15, sellValue: 9, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: null,
    effects: null, lootWeight: 8, tags: ['collectible', 'loot:common'],
    category: 'collectible', material: 'brass', baseType: 'monocle', rarity: 'common', possessable: true },

  { name: 'Oil Lamp', description: 'An ornate Victorian oil lamp.',
    itemType: 'tool', icon: '🪔', value: 8, sellValue: 5, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: 'oil_lamp',
    effects: null, lootWeight: 8, tags: ['tool', 'light', 'loot:common'],
    category: 'light_source', material: 'brass', baseType: 'lamp', rarity: 'common', possessable: true },

  { name: 'Tea Set', description: 'A delicate porcelain tea set.',
    itemType: 'collectible', icon: '🫖', value: 20, sellValue: 12, weight: 2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: 'tea_set',
    effects: null, lootWeight: 0, tags: ['decoration'],
    category: 'decoration', material: 'ceramic', baseType: 'tea_set', rarity: 'uncommon', possessable: false },

  // Steampunk furniture (not possessable)
  { name: 'Grandfather Clock', description: 'An ornate ticking grandfather clock.',
    itemType: 'collectible', icon: '🕰️', value: 40, sellValue: 20, weight: 30,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: 'clock',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'clock', rarity: 'uncommon', possessable: false },

  { name: 'Filing Cabinet', description: 'A vintage wooden filing cabinet.',
    itemType: 'collectible', icon: '🗄️', value: 15, sellValue: 8, weight: 15,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'steampunk', objectRole: 'drawer',
    effects: null, lootWeight: 0, tags: ['furniture'],
    category: 'furniture', material: 'wood', baseType: 'cabinet', rarity: 'common', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN-REALISTIC
  // ═══════════════════════════════════════════════════════════════════════════

  { name: 'Smartphone', description: 'A modern smartphone with various apps.',
    itemType: 'tool', icon: '📱', value: 30, sellValue: 18, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 5, tags: ['tool', 'tech', 'loot:uncommon'],
    category: 'tool', material: 'composite', baseType: 'phone', rarity: 'uncommon', possessable: true },

  { name: 'Backpack', description: 'A sturdy canvas backpack.',
    itemType: 'tool', icon: '🎒', value: 15, sellValue: 9, weight: 1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 8, tags: ['equipment', 'loot:common'],
    category: 'equipment', material: 'cloth', baseType: 'backpack', rarity: 'common', possessable: true },

  { name: 'First Aid Kit', description: 'A medical kit with bandages, antiseptic, and painkillers.',
    itemType: 'consumable', icon: '🩹', value: 12, sellValue: 7, weight: 1,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'modern-realistic', objectRole: null,
    effects: { health: 30 }, lootWeight: 8, tags: ['consumable', 'medical', 'loot:uncommon'],
    category: 'medical', material: null, baseType: 'kit', rarity: 'uncommon', possessable: true },

  { name: 'Energy Drink', description: 'A carbonated energy drink.',
    itemType: 'drink', icon: '🥤', value: 3, sellValue: 2, weight: 0.5,
    tradeable: true, stackable: true, maxStack: 10,
    worldType: 'modern-realistic', objectRole: null,
    effects: { energy: 20 }, lootWeight: 15, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Coffee', description: 'A cup of hot coffee.',
    itemType: 'drink', icon: '☕', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'modern-realistic', objectRole: null,
    effects: { energy: 15 }, lootWeight: 18, tags: ['drink', 'loot:common'],
    category: 'drink', material: null, baseType: 'beverage', rarity: 'common', possessable: true },

  { name: 'Sandwich', description: 'A fresh deli sandwich.',
    itemType: 'food', icon: '🥪', value: 4, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'modern-realistic', objectRole: null,
    effects: { energy: 15, health: 5 }, lootWeight: 15, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'cooked_meal', rarity: 'common', possessable: true },

  { name: 'Pizza Slice', description: 'A slice of hot pizza.',
    itemType: 'food', icon: '🍕', value: 3, sellValue: 2, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 8,
    worldType: 'modern-realistic', objectRole: null,
    effects: { energy: 12, health: 3 }, lootWeight: 15, tags: ['food', 'loot:common'],
    category: 'food', material: null, baseType: 'cooked_meal', rarity: 'common', possessable: true },

  { name: 'Notebook', description: 'A blank notebook for writing notes.',
    itemType: 'collectible', icon: '📓', value: 2, sellValue: 1, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 10, tags: ['collectible', 'loot:common'],
    category: 'document', material: 'paper', baseType: 'notebook', rarity: 'common', possessable: true },

  { name: 'Wallet', description: 'A leather wallet containing some cash.',
    itemType: 'collectible', icon: '👛', value: 15, sellValue: 10, weight: 0.2,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 8, tags: ['collectible', 'currency', 'loot:common'],
    category: 'currency', material: 'leather', baseType: 'wallet', rarity: 'common', possessable: true },

  { name: 'Umbrella', description: 'A compact folding umbrella.',
    itemType: 'tool', icon: '☂️', value: 5, sellValue: 3, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 8, tags: ['tool', 'loot:common'],
    category: 'tool', material: null, baseType: 'umbrella', rarity: 'common', possessable: true },

  { name: 'Flashlight', description: 'A battery-powered LED flashlight.',
    itemType: 'tool', icon: '🔦', value: 8, sellValue: 5, weight: 0.5,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 10, tags: ['tool', 'light', 'loot:common'],
    category: 'light_source', material: null, baseType: 'flashlight', rarity: 'common', possessable: true },

  { name: 'Sunglasses', description: 'A pair of stylish sunglasses.',
    itemType: 'collectible', icon: '🕶️', value: 10, sellValue: 6, weight: 0.1,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 8, tags: ['collectible', 'clothing', 'loot:common'],
    category: 'collectible', material: null, baseType: 'glasses', rarity: 'common', possessable: true },

  { name: 'Headphones', description: 'Over-ear headphones for music.',
    itemType: 'collectible', icon: '🎧', value: 15, sellValue: 9, weight: 0.3,
    tradeable: true, stackable: false, maxStack: 1,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 6, tags: ['collectible', 'tech', 'loot:uncommon'],
    category: 'collectible', material: null, baseType: 'headphones', rarity: 'uncommon', possessable: true },

  { name: 'USB Drive', description: 'A small USB flash drive with unknown data.',
    itemType: 'key', icon: '💾', value: 5, sellValue: 2, weight: 0.05,
    tradeable: true, stackable: true, maxStack: 5,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 6, tags: ['key', 'tech', 'quest', 'loot:uncommon'],
    category: 'data', material: null, baseType: 'drive', rarity: 'uncommon', possessable: true },

  { name: 'Battery', description: 'A rechargeable battery pack.',
    itemType: 'material', icon: '🔋', value: 5, sellValue: 3, weight: 0.3,
    tradeable: true, stackable: true, maxStack: 20,
    worldType: 'modern-realistic', objectRole: null,
    effects: null, lootWeight: 12, tags: ['material', 'tech', 'loot:common'],
    category: 'component', material: null, baseType: 'battery', rarity: 'common', possessable: true },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const col = db.collection('items');

  // ── Step 1: Backfill possessable on existing items ──
  console.log('Step 1: Backfilling possessable field on existing items...');

  // Set non-possessable items
  const nonPossResult = await col.updateMany(
    { isBase: true, name: { $in: NON_POSSESSABLE_NAMES } },
    { $set: { possessable: false, updatedAt: new Date() } }
  );
  console.log(`  Marked ${nonPossResult.modifiedCount} existing items as non-possessable`);

  // Set all other base items as possessable (where not already set)
  const possResult = await col.updateMany(
    { isBase: true, possessable: { $exists: false } },
    { $set: { possessable: true, updatedAt: new Date() } }
  );
  console.log(`  Marked ${possResult.modifiedCount} existing items as possessable`);

  // ── Step 2: Insert new items ──
  console.log(`Step 2: Inserting ${NEW_ITEMS.length} new base items...`);

  let inserted = 0;
  let skipped = 0;

  for (const item of NEW_ITEMS) {
    // Check for duplicates by name + worldType
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
      translations: null,
      relatedTruthIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    inserted++;
  }

  console.log(`  Inserted: ${inserted}, Skipped (duplicate): ${skipped}`);

  // ── Summary ──
  const totalBase = await col.countDocuments({ isBase: true });
  const byWorldType = await col.aggregate([
    { $match: { isBase: true } },
    { $group: { _id: '$worldType', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();

  console.log(`\nTotal base items: ${totalBase}`);
  console.log('By world type:');
  for (const { _id, count } of byWorldType) {
    console.log(`  ${_id ?? 'universal'}: ${count}`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
