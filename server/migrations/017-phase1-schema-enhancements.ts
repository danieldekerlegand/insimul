#!/usr/bin/env tsx
/**
 * Migration 017: Phase 1 Schema Enhancements
 *
 * Adds default values for new fields across multiple collections:
 * 1. Worlds: timestepUnit, gameplayTimestepUnit
 * 2. Truths: historicalEra, historicalSignificance, causesTruthIds, causedByTruthIds
 * 3. Items: craftingRecipe, questRelevance, loreText, languageLearningData
 * 4. Grammars: truthBindings, contextType
 * 5. World Languages: culturalTruthIds, historicalTruthIds, idiomsAndProverbs
 *
 * Uses $exists: false guards so re-running is safe (won't overwrite existing data).
 *
 * Usage:
 *   npx tsx server/migrations/017-phase1-schema-enhancements.ts
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

async function main() {
  console.log('=== Migration 017: Phase 1 Schema Enhancements ===\n');

  await mongoose.connect(MONGO_URL);
  console.log(`Connected to MongoDB: ${MONGO_URL}\n`);

  const db = mongoose.connection.db!;

  // ── 1. Worlds: default timestep values ─────────────────────────────────────

  console.log('Phase 1: Updating worlds with default timestep values...');
  const worldsCollection = db.collection('worlds');

  const worldTimestepResult = await worldsCollection.updateMany(
    { timestepUnit: { $exists: false } },
    { $set: { timestepUnit: 'year', updatedAt: new Date() } }
  );
  console.log(`  Set timestepUnit on ${worldTimestepResult.modifiedCount} worlds`);

  const worldGameplayResult = await worldsCollection.updateMany(
    { gameplayTimestepUnit: { $exists: false } },
    { $set: { gameplayTimestepUnit: 'day', updatedAt: new Date() } }
  );
  console.log(`  Set gameplayTimestepUnit on ${worldGameplayResult.modifiedCount} worlds`);

  // Also handle null values (field exists but is null)
  const worldTimestepNullResult = await worldsCollection.updateMany(
    { timestepUnit: null },
    { $set: { timestepUnit: 'year', updatedAt: new Date() } }
  );
  console.log(`  Fixed null timestepUnit on ${worldTimestepNullResult.modifiedCount} worlds`);

  const worldGameplayNullResult = await worldsCollection.updateMany(
    { gameplayTimestepUnit: null },
    { $set: { gameplayTimestepUnit: 'day', updatedAt: new Date() } }
  );
  console.log(`  Fixed null gameplayTimestepUnit on ${worldGameplayNullResult.modifiedCount} worlds`);

  // ── 2. Truths: default historical fields ───────────────────────────────────

  console.log('\nPhase 2: Updating truths with default historical fields...');
  const truthsCollection = db.collection('truths');

  const truthHistEraResult = await truthsCollection.updateMany(
    { historicalEra: { $exists: false } },
    { $set: { historicalEra: null } }
  );
  console.log(`  Set historicalEra on ${truthHistEraResult.modifiedCount} truths`);

  const truthHistSigResult = await truthsCollection.updateMany(
    { historicalSignificance: { $exists: false } },
    { $set: { historicalSignificance: null } }
  );
  console.log(`  Set historicalSignificance on ${truthHistSigResult.modifiedCount} truths`);

  const truthCausesResult = await truthsCollection.updateMany(
    { causesTruthIds: { $exists: false } },
    { $set: { causesTruthIds: [] } }
  );
  console.log(`  Set causesTruthIds on ${truthCausesResult.modifiedCount} truths`);

  const truthCausedByResult = await truthsCollection.updateMany(
    { causedByTruthIds: { $exists: false } },
    { $set: { causedByTruthIds: [] } }
  );
  console.log(`  Set causedByTruthIds on ${truthCausedByResult.modifiedCount} truths`);

  // ── 3. Items: default new fields ───────────────────────────────────────────

  console.log('\nPhase 3: Updating items with default new fields...');
  const itemsCollection = db.collection('items');

  const itemCraftingResult = await itemsCollection.updateMany(
    { craftingRecipe: { $exists: false } },
    { $set: { craftingRecipe: null } }
  );
  console.log(`  Set craftingRecipe on ${itemCraftingResult.modifiedCount} items`);

  const itemQuestResult = await itemsCollection.updateMany(
    { questRelevance: { $exists: false } },
    { $set: { questRelevance: [] } }
  );
  console.log(`  Set questRelevance on ${itemQuestResult.modifiedCount} items`);

  const itemLoreResult = await itemsCollection.updateMany(
    { loreText: { $exists: false } },
    { $set: { loreText: null } }
  );
  console.log(`  Set loreText on ${itemLoreResult.modifiedCount} items`);

  const itemLangResult = await itemsCollection.updateMany(
    { languageLearningData: { $exists: false } },
    { $set: { languageLearningData: null } }
  );
  console.log(`  Set languageLearningData on ${itemLangResult.modifiedCount} items`);

  // ── 4. Grammars: default new fields ────────────────────────────────────────

  console.log('\nPhase 4: Updating grammars with default new fields...');
  const grammarsCollection = db.collection('grammars');

  const grammarBindingsResult = await grammarsCollection.updateMany(
    { truthBindings: { $exists: false } },
    { $set: { truthBindings: [] } }
  );
  console.log(`  Set truthBindings on ${grammarBindingsResult.modifiedCount} grammars`);

  const grammarContextResult = await grammarsCollection.updateMany(
    { contextType: { $exists: false } },
    { $set: { contextType: null } }
  );
  console.log(`  Set contextType on ${grammarContextResult.modifiedCount} grammars`);

  // ── 5. World Languages: default new fields ─────────────────────────────────

  console.log('\nPhase 5: Updating world languages with default new fields...');
  const languagesCollection = db.collection('worldlanguages');

  const langCulturalResult = await languagesCollection.updateMany(
    { culturalTruthIds: { $exists: false } },
    { $set: { culturalTruthIds: [] } }
  );
  console.log(`  Set culturalTruthIds on ${langCulturalResult.modifiedCount} world languages`);

  const langHistoricalResult = await languagesCollection.updateMany(
    { historicalTruthIds: { $exists: false } },
    { $set: { historicalTruthIds: [] } }
  );
  console.log(`  Set historicalTruthIds on ${langHistoricalResult.modifiedCount} world languages`);

  const langIdiomsResult = await languagesCollection.updateMany(
    { idiomsAndProverbs: { $exists: false } },
    { $set: { idiomsAndProverbs: [] } }
  );
  console.log(`  Set idiomsAndProverbs on ${langIdiomsResult.modifiedCount} world languages`);

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n=== Summary ===');
  console.log(`Worlds updated:           ${worldTimestepResult.modifiedCount + worldGameplayResult.modifiedCount + worldTimestepNullResult.modifiedCount + worldGameplayNullResult.modifiedCount} field-updates`);
  console.log(`Truths updated:           ${truthHistEraResult.modifiedCount + truthHistSigResult.modifiedCount + truthCausesResult.modifiedCount + truthCausedByResult.modifiedCount} field-updates`);
  console.log(`Items updated:            ${itemCraftingResult.modifiedCount + itemQuestResult.modifiedCount + itemLoreResult.modifiedCount + itemLangResult.modifiedCount} field-updates`);
  console.log(`Grammars updated:         ${grammarBindingsResult.modifiedCount + grammarContextResult.modifiedCount} field-updates`);
  console.log(`World languages updated:  ${langCulturalResult.modifiedCount + langHistoricalResult.modifiedCount + langIdiomsResult.modifiedCount} field-updates`);

  await mongoose.disconnect();
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
