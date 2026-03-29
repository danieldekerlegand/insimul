#!/usr/bin/env tsx
/**
 * Migration 043: Seed default character templates
 *
 * Creates 3 base character templates (worldId: null, isBase: true):
 * - Explorer: balanced stats, basic equipment, exploration-focused
 * - Scholar: language-focused, reading/writing skills
 * - Trader: commerce-focused, high gold, bargaining skills
 *
 * All templates include MVT predicates (health, energy, speaks_language, gold, at_location, occupation, age).
 *
 * Idempotent — skips templates that already exist by name.
 *
 * Usage:
 *   npx tsx server/migrations/043-seed-character-templates.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

interface StartingTruth {
  predicate: string;
  args: any[];
}

const EXPLORER_TRUTHS: StartingTruth[] = [
  // MVT predicates
  { predicate: 'health', args: ['player', 100, 100] },
  { predicate: 'energy', args: ['player', 100, 100] },
  { predicate: 'speaks_language', args: ['player', 'english', 'b1'] },
  { predicate: 'speaks_language', args: ['player', 'french', 'a1'] },
  { predicate: 'gold', args: ['player', 100] },
  { predicate: 'at_location', args: ['player', 'town_square'] },
  { predicate: 'occupation', args: ['player', 'explorer'] },
  { predicate: 'age', args: ['player', 25] },
  // Equipment
  { predicate: 'has_item', args: ['player', 'backpack', 1] },
  { predicate: 'has_item', args: ['player', 'compass', 1] },
  { predicate: 'has_item', args: ['player', 'map', 1] },
  // Skills
  { predicate: 'has_skill', args: ['player', 'exploration', 2] },
  { predicate: 'has_skill', args: ['player', 'survival', 1] },
];

const SCHOLAR_TRUTHS: StartingTruth[] = [
  // MVT predicates
  { predicate: 'health', args: ['player', 80, 80] },
  { predicate: 'energy', args: ['player', 120, 120] },
  { predicate: 'speaks_language', args: ['player', 'english', 'b2'] },
  { predicate: 'speaks_language', args: ['player', 'french', 'a2'] },
  { predicate: 'gold', args: ['player', 50] },
  { predicate: 'at_location', args: ['player', 'town_square'] },
  { predicate: 'occupation', args: ['player', 'scholar'] },
  { predicate: 'age', args: ['player', 30] },
  // Equipment
  { predicate: 'has_item', args: ['player', 'notebook', 1] },
  { predicate: 'has_item', args: ['player', 'quill', 1] },
  { predicate: 'has_item', args: ['player', 'dictionary', 1] },
  // Skills
  { predicate: 'has_skill', args: ['player', 'reading', 3] },
  { predicate: 'has_skill', args: ['player', 'writing', 2] },
  { predicate: 'has_skill', args: ['player', 'linguistics', 1] },
  // Traits
  { predicate: 'has_trait', args: ['player', 'bookworm'] },
];

const TRADER_TRUTHS: StartingTruth[] = [
  // MVT predicates
  { predicate: 'health', args: ['player', 90, 90] },
  { predicate: 'energy', args: ['player', 90, 90] },
  { predicate: 'speaks_language', args: ['player', 'english', 'b1'] },
  { predicate: 'speaks_language', args: ['player', 'french', 'a1'] },
  { predicate: 'gold', args: ['player', 200] },
  { predicate: 'at_location', args: ['player', 'town_square'] },
  { predicate: 'occupation', args: ['player', 'trader'] },
  { predicate: 'age', args: ['player', 35] },
  // Equipment
  { predicate: 'has_item', args: ['player', 'merchant_ledger', 1] },
  { predicate: 'has_item', args: ['player', 'sample_goods', 1] },
  // Skills
  { predicate: 'has_skill', args: ['player', 'bargaining', 3] },
  { predicate: 'has_skill', args: ['player', 'appraisal', 2] },
];

const TEMPLATES = [
  {
    name: 'Explorer',
    description: 'A balanced adventurer with basic equipment, survival skills, and a thirst for discovery. Speaks English at B1 and French at A1.',
    startingTruths: EXPLORER_TRUTHS,
  },
  {
    name: 'Scholar',
    description: 'A language-focused intellectual with strong reading and writing skills. Speaks English at B2 and French at A2. Starts with less gold and health but more energy.',
    startingTruths: SCHOLAR_TRUTHS,
  },
  {
    name: 'Trader',
    description: 'A commerce-focused merchant with bargaining expertise and a large purse. Speaks English at B1 and French at A1. Starts with 200 gold.',
    startingTruths: TRADER_TRUTHS,
  },
];

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 043: Seed default character templates');
  console.log('='.repeat(60) + '\n');

  // Check existing base templates (use a dummy worldId — query always includes worldId: null base templates)
  const existing = await storage.getCharacterTemplates('__none__');
  const existingNames = new Set(existing.filter(t => t.isBase).map(t => t.name));

  let created = 0;
  let skipped = 0;

  for (const template of TEMPLATES) {
    if (existingNames.has(template.name)) {
      console.log(`  ⏭  "${template.name}" already exists — skipping`);
      skipped++;
      continue;
    }

    await storage.createCharacterTemplate({
      worldId: null,
      name: template.name,
      description: template.description,
      startingTruths: template.startingTruths,
      isDefault: template.name === 'Explorer', // Explorer is the default
      isBase: true,
    });

    console.log(`  ✅ Created "${template.name}" template (${template.startingTruths.length} truths)`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped\n`);
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
