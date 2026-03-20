#!/usr/bin/env tsx
/**
 * Migration: Seed Text Base Items
 *
 * Inserts base items for each text category (book, journal, letter, flyer, recipe)
 * with objectRole mappings (text_book, text_journal, etc.) so the 3D game can
 * resolve them to procedural meshes via ProceduralQuestObjects.
 *
 * Usage:
 *   npx tsx server/migrations/025-seed-text-base-items.ts
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

interface TextBaseItem {
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
  objectRole: string;
  effects: null;
  lootWeight: number;
  tags: string[];
}

const TEXT_BASE_ITEMS: TextBaseItem[] = [
  {
    name: 'Book',
    description: 'A leather-bound book with worn pages.',
    itemType: 'collectible',
    icon: '\uD83D\uDCD5',
    value: 5,
    sellValue: 3,
    weight: 1,
    tradeable: false,
    stackable: false,
    maxStack: 1,
    worldType: null,
    objectRole: 'text_book',
    effects: null,
    lootWeight: 0,
    tags: ['collectible', 'text', 'readable'],
  },
  {
    name: 'Journal',
    description: 'A small personal diary with handwritten entries.',
    itemType: 'collectible',
    icon: '\uD83D\uDCD3',
    value: 5,
    sellValue: 3,
    weight: 0.5,
    tradeable: false,
    stackable: false,
    maxStack: 1,
    worldType: null,
    objectRole: 'text_journal',
    effects: null,
    lootWeight: 0,
    tags: ['collectible', 'text', 'readable'],
  },
  {
    name: 'Letter',
    description: 'A sealed envelope containing a letter.',
    itemType: 'collectible',
    icon: '\u2709\uFE0F',
    value: 3,
    sellValue: 1,
    weight: 0.1,
    tradeable: false,
    stackable: false,
    maxStack: 1,
    worldType: null,
    objectRole: 'text_letter',
    effects: null,
    lootWeight: 0,
    tags: ['collectible', 'text', 'readable'],
  },
  {
    name: 'Flyer',
    description: 'A printed broadsheet or announcement.',
    itemType: 'collectible',
    icon: '\uD83D\uDCC4',
    value: 1,
    sellValue: 0,
    weight: 0.1,
    tradeable: false,
    stackable: false,
    maxStack: 1,
    worldType: null,
    objectRole: 'text_flyer',
    effects: null,
    lootWeight: 0,
    tags: ['collectible', 'text', 'readable'],
  },
  {
    name: 'Recipe',
    description: 'A rolled parchment with cooking instructions.',
    itemType: 'collectible',
    icon: '\uD83C\uDF73',
    value: 3,
    sellValue: 1,
    weight: 0.2,
    tradeable: false,
    stackable: false,
    maxStack: 1,
    worldType: null,
    objectRole: 'text_recipe',
    effects: null,
    lootWeight: 0,
    tags: ['collectible', 'text', 'readable'],
  },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const itemsCollection = db.collection('items');

  let inserted = 0;
  let skipped = 0;

  for (const item of TEXT_BASE_ITEMS) {
    const existing = await itemsCollection.findOne({
      objectRole: item.objectRole,
      isBase: true,
    });
    if (existing) {
      console.log(`  Skipping "${item.name}" [${item.objectRole}] (already exists)`);
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

    console.log(`  Inserted "${item.name}" [${item.objectRole}]`);
    inserted++;
  }

  console.log(`\nDone! Inserted ${inserted} text base items, skipped ${skipped}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
