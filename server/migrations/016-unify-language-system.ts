/**
 * Migration 016: Unify Language System
 *
 * Backfills WorldLanguage records for existing worlds that have a `targetLanguage`
 * set but no corresponding WorldLanguage record with `isLearningTarget: true`.
 *
 * Also sets `isLearningTarget: false` on all existing WorldLanguage records that
 * don't have the field set.
 *
 * Run with: npx tsx server/migrations/016-unify-language-system.ts
 */

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/insimul';

const BCP47_MAP: Record<string, string> = {
  'English': 'en-US', 'French': 'fr-FR', 'Spanish': 'es-ES', 'German': 'de-DE',
  'Italian': 'it-IT', 'Portuguese': 'pt-BR', 'Japanese': 'ja-JP', 'Chinese': 'zh-CN',
  'Mandarin Chinese': 'zh-CN', 'Chinese (Mandarin)': 'zh-CN', 'Korean': 'ko-KR',
  'Arabic': 'ar-SA', 'Russian': 'ru-RU', 'Hindi': 'hi-IN', 'Turkish': 'tr-TR',
  'Dutch': 'nl-NL', 'Swedish': 'sv-SE', 'Norwegian': 'nb-NO', 'Danish': 'da-DK',
  'Finnish': 'fi-FI', 'Polish': 'pl-PL', 'Czech': 'cs-CZ', 'Greek': 'el-GR',
  'Thai': 'th-TH', 'Vietnamese': 'vi-VN', 'Indonesian': 'id-ID', 'Swahili': 'sw-KE',
  'Hebrew': 'he-IL', 'Romanian': 'ro-RO', 'Hungarian': 'hu-HU', 'Bengali': 'bn-BD',
};

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;

  const worldsCol = db.collection('worlds');
  const langsCol = db.collection('worldlanguages');

  // 1. Set isLearningTarget: false on all existing WorldLanguage records where the field is missing
  const defaultResult = await langsCol.updateMany(
    { isLearningTarget: { $exists: false } },
    { $set: { isLearningTarget: false } },
  );
  console.log(`Set isLearningTarget=false on ${defaultResult.modifiedCount} existing WorldLanguage records.`);

  // 2. For worlds with targetLanguage set, ensure a matching WorldLanguage record exists
  const worldsWithTarget = await worldsCol.find({
    targetLanguage: { $ne: null, $exists: true },
  }).toArray();

  console.log(`Found ${worldsWithTarget.length} worlds with targetLanguage set.`);

  let created = 0;
  let updated = 0;

  for (const world of worldsWithTarget) {
    const worldId = world._id?.toString() || world.id;
    const targetLang: string = world.targetLanguage;

    // Check if a WorldLanguage record already has isLearningTarget for this world
    const existingTarget = await langsCol.findOne({
      worldId,
      isLearningTarget: true,
    });

    if (existingTarget) {
      console.log(`  World ${worldId}: already has learning target "${existingTarget.name}". Skipping.`);
      continue;
    }

    // Check if there's a WorldLanguage whose name matches the target language
    const matchingLang = await langsCol.findOne({
      worldId,
      name: { $regex: new RegExp(`^${targetLang}`, 'i') },
    });

    if (matchingLang) {
      // Mark it as the learning target
      await langsCol.updateOne(
        { _id: matchingLang._id },
        { $set: { isLearningTarget: true } },
      );
      console.log(`  World ${worldId}: marked existing "${matchingLang.name}" as learning target.`);
      updated++;
    } else {
      // Create a new "real" WorldLanguage record
      await langsCol.insertOne({
        worldId,
        scopeType: 'world',
        scopeId: worldId,
        name: targetLang,
        description: `The ${targetLang} language — the player's learning target.`,
        kind: 'real',
        realCode: BCP47_MAP[targetLang] || 'en-US',
        isPrimary: true,
        isLearningTarget: true,
        influenceLanguageIds: [],
        realInfluenceCodes: [],
        config: null,
        features: null,
        phonemes: null,
        grammar: null,
        writingSystem: null,
        culturalContext: null,
        phoneticInventory: null,
        sampleWords: null,
        sampleTexts: null,
        etymology: null,
        dialectVariations: null,
        learningModules: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  World ${worldId}: created real WorldLanguage record for "${targetLang}".`);
      created++;
    }

    // Also mark any existing primary conlang as NOT the learning target
    await langsCol.updateMany(
      { worldId, kind: 'constructed', isLearningTarget: { $ne: false } },
      { $set: { isLearningTarget: false } },
    );
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
