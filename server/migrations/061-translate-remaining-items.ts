#!/usr/bin/env tsx
/**
 * Migration 061: Translate remaining 57 base items to French
 *
 * These are environmental/furniture items that weren't covered by the
 * LLM-based translation migration 046. Manual translations for common
 * French vocabulary words.
 *
 * Usage:
 *   npx tsx server/migrations/061-translate-remaining-items.ts
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

const TRANSLATIONS: Record<string, { targetWord: string; pronunciation: string; category: string }> = {
  'Food Stall': { targetWord: 'Étal de nourriture', pronunciation: 'ay-tal duh noo-ree-toor', category: 'furniture' },
  'Crystal Formation': { targetWord: 'Formation de cristal', pronunciation: 'for-mah-syon duh krees-tal', category: 'environmental' },
  'Ancient Ruins': { targetWord: 'Ruines anciennes', pronunciation: 'rween ahn-syen', category: 'environmental' },
  'Terminal': { targetWord: 'Terminal', pronunciation: 'tehr-mee-nal', category: 'furniture' },
  'Grass Patch': { targetWord: 'Parcelle d\'herbe', pronunciation: 'par-sel dehrb', category: 'environmental' },
  'Shrine Base': { targetWord: 'Base du sanctuaire', pronunciation: 'bahz doo sank-twehr', category: 'environmental' },
  'Shrine Orb': { targetWord: 'Orbe du sanctuaire', pronunciation: 'orb doo sank-twehr', category: 'environmental' },
  'Crosswalk': { targetWord: 'Passage piéton', pronunciation: 'pah-sahj pyay-ton', category: 'environmental' },
  'Center Line': { targetWord: 'Ligne centrale', pronunciation: 'leen-yuh sahn-tral', category: 'environmental' },
  'Market Stall': { targetWord: 'Étal de marché', pronunciation: 'ay-tal duh mar-shay', category: 'furniture' },
  'Flagpole': { targetWord: 'Mât de drapeau', pronunciation: 'mah duh dra-poh', category: 'environmental' },
  'Flower': { targetWord: 'Fleur', pronunciation: 'fluhr', category: 'environmental' },
  'Campfire Log': { targetWord: 'Bûche de feu de camp', pronunciation: 'boosh duh fuh duh kahn', category: 'environmental' },
  'Town Square Ground': { targetWord: 'Sol de la place', pronunciation: 'sol duh la plas', category: 'environmental' },
  'Settlement Sign': { targetWord: 'Panneau du village', pronunciation: 'pa-noh doo vee-lahj', category: 'environmental' },
  'Public Building': { targetWord: 'Bâtiment public', pronunciation: 'bah-tee-mahn poo-bleek', category: 'environmental' },
  'Park Bench': { targetWord: 'Banc de parc', pronunciation: 'bahn duh park', category: 'furniture' },
  'Bush': { targetWord: 'Buisson', pronunciation: 'bwee-son', category: 'environmental' },
  'Rock': { targetWord: 'Rocher', pronunciation: 'ro-shay', category: 'environmental' },
  'Camp Tent': { targetWord: 'Tente de camping', pronunciation: 'tahnt duh kahm-peeng', category: 'environmental' },
  'Oak Tree': { targetWord: 'Chêne', pronunciation: 'shehn', category: 'environmental' },
  'Hanging Lantern': { targetWord: 'Lanterne suspendue', pronunciation: 'lahn-tehrn soo-spahn-doo', category: 'environmental' },
  'Pedestal': { targetWord: 'Piédestal', pronunciation: 'pyay-des-tal', category: 'environmental' },
  'Outdoor Table': { targetWord: 'Table d\'extérieur', pronunciation: 'tabl deks-tay-ryuhr', category: 'furniture' },
  'Bedroll': { targetWord: 'Couchage', pronunciation: 'koo-shahj', category: 'furniture' },
  'Road': { targetWord: 'Route', pronunciation: 'root', category: 'environmental' },
  'Outdoor Chair': { targetWord: 'Chaise d\'extérieur', pronunciation: 'shehz deks-tay-ryuhr', category: 'furniture' },
  'Water Trough': { targetWord: 'Abreuvoir', pronunciation: 'ah-bruh-vwar', category: 'furniture' },
  'Campfire': { targetWord: 'Feu de camp', pronunciation: 'fuh duh kahn', category: 'environmental' },
  'Ruined Wall': { targetWord: 'Mur en ruines', pronunciation: 'moor ahn rween', category: 'environmental' },
  'Gravestone': { targetWord: 'Pierre tombale', pronunciation: 'pyehr tom-bal', category: 'environmental' },
  'Rubble': { targetWord: 'Décombres', pronunciation: 'day-kombr', category: 'environmental' },
  'Park Tree': { targetWord: 'Arbre du parc', pronunciation: 'arbr doo park', category: 'environmental' },
  'Standing Stone': { targetWord: 'Pierre dressée', pronunciation: 'pyehr dreh-say', category: 'environmental' },
  'Sidewalk': { targetWord: 'Trottoir', pronunciation: 'tro-twar', category: 'environmental' },
  'Residential Building': { targetWord: 'Bâtiment résidentiel', pronunciation: 'bah-tee-mahn ray-zee-dahn-syel', category: 'environmental' },
  'Roof': { targetWord: 'Toit', pronunciation: 'twah', category: 'environmental' },
  'Notice Board': { targetWord: 'Panneau d\'affichage', pronunciation: 'pa-noh da-fee-shahj', category: 'environmental' },
  'Planter': { targetWord: 'Jardinière', pronunciation: 'jar-dee-nyehr', category: 'furniture' },
  'Palm Tree': { targetWord: 'Palmier', pronunciation: 'pal-myay', category: 'environmental' },
  'Stone Pillar': { targetWord: 'Pilier de pierre', pronunciation: 'pee-lyay duh pyehr', category: 'environmental' },
  'Commercial Building': { targetWord: 'Bâtiment commercial', pronunciation: 'bah-tee-mahn ko-mehr-syal', category: 'environmental' },
  'Picnic Table': { targetWord: 'Table de pique-nique', pronunciation: 'tabl duh peek-neek', category: 'furniture' },
  'Crate': { targetWord: 'Caisse', pronunciation: 'kehs', category: 'container' },
  'Foundation': { targetWord: 'Fondation', pronunciation: 'fon-dah-syon', category: 'environmental' },
  'Signpost': { targetWord: 'Poteau indicateur', pronunciation: 'po-toh an-dee-ka-tuhr', category: 'environmental' },
  'Flower Cart': { targetWord: 'Charrette à fleurs', pronunciation: 'sha-ret ah fluhr', category: 'furniture' },
  'Pine Tree': { targetWord: 'Pin', pronunciation: 'pan', category: 'environmental' },
  'Lake': { targetWord: 'Lac', pronunciation: 'lak', category: 'environmental' },
  'Park Ground': { targetWord: 'Sol du parc', pronunciation: 'sol doo park', category: 'environmental' },
  'Wall': { targetWord: 'Mur', pronunciation: 'moor', category: 'environmental' },
  'Fountain': { targetWord: 'Fontaine', pronunciation: 'fon-ten', category: 'environmental' },
  'Well': { targetWord: 'Puits', pronunciation: 'pwee', category: 'environmental' },
  'Street Sign': { targetWord: 'Panneau de rue', pronunciation: 'pa-noh duh roo', category: 'environmental' },
  'Weapon Rack': { targetWord: 'Râtelier d\'armes', pronunciation: 'rah-tuh-lyay darm', category: 'furniture' },
  'Dead Tree': { targetWord: 'Arbre mort', pronunciation: 'arbr mor', category: 'environmental' },
  'Grave Base': { targetWord: 'Base de tombe', pronunciation: 'bahz duh tomb', category: 'environmental' },
};

async function main() {
  console.log('\n=== Migration 061: Translate Remaining Items ===\n');

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const coll = db.collection('items');

  let updated = 0;
  for (const [name, trans] of Object.entries(TRANSLATIONS)) {
    const result = await coll.updateMany(
      { name, isBase: true },
      { $set: { [`translations.French`]: trans } },
    );
    if (result.modifiedCount > 0) {
      updated += result.modifiedCount;
      console.log(`  ✓ ${name} → ${trans.targetWord}`);
    }
  }

  // Verify
  const remaining = await coll.countDocuments({
    isBase: true,
    $or: [{ translations: null }, { 'translations.French': { $exists: false } }],
  });

  console.log(`\nUpdated: ${updated} items`);
  console.log(`Remaining without French translation: ${remaining}`);
  console.log('\n=== Done ===\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
