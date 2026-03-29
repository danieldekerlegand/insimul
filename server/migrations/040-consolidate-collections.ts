#!/usr/bin/env tsx
/**
 * Migration 040: Consolidate MongoDB collections
 *
 * Merges:
 *   1. proficiencyprogress + knowledgeentries + grammarpatterns + conversationrecords + readingprogress → languageprogress
 *   2. assessmentsessions + evaluationresponses → assessments (unified with docType discriminator)
 *   3. technicaltelemetry + engagementevents → telemetry
 *   4. texts → gametexts (texts removed, gametexts kept)
 *   5. terrainfeatures + waterfeatures → geographicfeatures
 *   6. residences + publicbuildings → buildings
 *   7. playersessions → embedded in playerprogresses
 *
 * After migration, drops the 11 old collections.
 *
 * Usage: npx tsx server/migrations/040-consolidate-collections.ts [--dry-run]
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dryRun = process.argv.includes('--dry-run');

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUrl) { console.error('No MONGO_URL env var found'); process.exit(1); }

  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  console.log(dryRun ? '🔍 DRY RUN — no changes will be made\n' : '🗑️  LIVE RUN — migrating and dropping collections\n');

  // ── 1. Migrate proficiencyprogress → languageprogress ───────────────────
  const profDocs = await db.collection('proficiencyprogress').find({}).toArray();
  if (profDocs.length > 0) {
    console.log(`Migrating ${profDocs.length} proficiencyprogress docs → languageprogress`);
    if (!dryRun) {
      for (const doc of profDocs) {
        const { _id, ...data } = doc;
        // Merge any existing vocabulary/grammar/conversation/reading data from old collections
        const query = { playerId: data.playerId, worldId: data.worldId, playthroughId: data.playthroughId || null };

        const vocabDocs = await db.collection('knowledgeentries').find(query).toArray();
        const grammarDocs = await db.collection('grammarpatterns').find(query).toArray();
        const convoDocs = await db.collection('conversationrecords').find(query).toArray();
        const readingDoc = await db.collection('readingprogress').findOne(query);

        await db.collection('languageprogress').updateOne(
          query,
          {
            $set: {
              ...data,
              vocabulary: vocabDocs.map(({ _id, playerId, worldId, playthroughId, ...rest }) => rest),
              grammarPatterns: grammarDocs.map(({ _id, playerId, worldId, playthroughId, ...rest }) => rest),
              conversations: convoDocs.map(({ _id, playerId, worldId, playthroughId, ...rest }) => rest),
              reading: readingDoc
                ? { articlesRead: readingDoc.articlesRead, quizAnswers: readingDoc.quizAnswers, totalCorrect: readingDoc.totalCorrect, totalAttempted: readingDoc.totalAttempted, xpFromReading: readingDoc.xpFromReading }
                : { articlesRead: [], quizAnswers: [], totalCorrect: 0, totalAttempted: 0, xpFromReading: 0 },
            }
          },
          { upsert: true }
        );
      }
      console.log(`  ✓ Migrated ${profDocs.length} docs`);
    }
  } else {
    // Still check for orphaned conversation records / vocabulary entries without a parent progress doc
    const orphanedConvos = await db.collection('conversationrecords').countDocuments();
    if (orphanedConvos > 0) {
      console.log(`Migrating ${orphanedConvos} orphaned conversationrecords → languageprogress`);
      if (!dryRun) {
        const convoDocs = await db.collection('conversationrecords').find({}).toArray();
        // Group by playerId+worldId+playthroughId
        const groups = new Map<string, any[]>();
        for (const doc of convoDocs) {
          const key = `${doc.playerId}|${doc.worldId}|${doc.playthroughId || ''}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(doc);
        }
        for (const [, docs] of Array.from(groups.entries())) {
          const first = docs[0];
          await db.collection('languageprogress').updateOne(
            { playerId: first.playerId, worldId: first.worldId, playthroughId: first.playthroughId || null },
            {
              $set: {
                playerId: first.playerId,
                worldId: first.worldId,
                playthroughId: first.playthroughId || null,
                conversations: docs.map(({ _id, playerId, worldId, playthroughId, ...rest }) => rest),
                updatedAt: new Date(),
              },
              $setOnInsert: { createdAt: new Date() }
            },
            { upsert: true }
          );
        }
        console.log(`  ✓ Migrated ${orphanedConvos} conversation records`);
      }
    }
  }

  // ── 2. Migrate residences → buildings ───────────────────────────────────
  const residenceDocs = await db.collection('residences').find({}).toArray();
  if (residenceDocs.length > 0) {
    console.log(`Migrating ${residenceDocs.length} residences → buildings`);
    if (!dryRun) {
      const buildingDocs = residenceDocs.map(({ _id, ...data }) => ({ ...data, buildingCategory: 'residence' }));
      await db.collection('buildings').insertMany(buildingDocs);
      console.log(`  ✓ Migrated ${residenceDocs.length} residences`);
    }
  }

  const publicBuildingDocs = await db.collection('publicbuildings').find({}).toArray();
  if (publicBuildingDocs.length > 0) {
    console.log(`Migrating ${publicBuildingDocs.length} publicbuildings → buildings`);
    if (!dryRun) {
      const buildingDocs = publicBuildingDocs.map(({ _id, ...data }) => ({ ...data, buildingCategory: 'public' }));
      await db.collection('buildings').insertMany(buildingDocs);
      console.log(`  ✓ Migrated ${publicBuildingDocs.length} public buildings`);
    }
  }

  // ── 3. Migrate terrainfeatures + waterfeatures → geographicfeatures ────
  const terrainDocs = await db.collection('terrainfeatures').find({}).toArray();
  if (terrainDocs.length > 0) {
    console.log(`Migrating ${terrainDocs.length} terrainfeatures → geographicfeatures`);
    if (!dryRun) {
      const geoDocs = terrainDocs.map(({ _id, ...data }) => ({ ...data, featureCategory: 'terrain' }));
      await db.collection('geographicfeatures').insertMany(geoDocs);
      console.log(`  ✓ Migrated ${terrainDocs.length} terrain features`);
    }
  }

  const waterDocs = await db.collection('waterfeatures').find({}).toArray();
  if (waterDocs.length > 0) {
    console.log(`Migrating ${waterDocs.length} waterfeatures → geographicfeatures`);
    if (!dryRun) {
      const geoDocs = waterDocs.map(({ _id, ...data }) => ({ ...data, featureCategory: 'water' }));
      await db.collection('geographicfeatures').insertMany(geoDocs);
      console.log(`  ✓ Migrated ${waterDocs.length} water features`);
    }
  }

  // ── 4. Migrate playersessions → embedded in playerprogresses ───────────
  const sessionDocs = await db.collection('playersessions').find({}).toArray();
  if (sessionDocs.length > 0) {
    console.log(`Migrating ${sessionDocs.length} playersessions → embedded in playerprogresses`);
    if (!dryRun) {
      // Group sessions by progressId
      const byProgress = new Map<string, any[]>();
      for (const doc of sessionDocs) {
        const pid = doc.progressId;
        if (!byProgress.has(pid)) byProgress.set(pid, []);
        byProgress.get(pid)!.push(doc);
      }
      for (const [progressId, sessions] of Array.from(byProgress.entries())) {
        await db.collection('playerprogresses').updateOne(
          { _id: progressId },
          { $set: { sessions: sessions.map(({ _id, progressId, ...rest }) => rest) } }
        );
      }
      console.log(`  ✓ Embedded ${sessionDocs.length} sessions into ${byProgress.size} progress docs`);
    }
  }

  // ── 5. Migrate technicaltelemetry + engagementevents → telemetry ───────
  const techDocs = await db.collection('technicaltelemetry').find({}).toArray();
  if (techDocs.length > 0) {
    console.log(`Migrating ${techDocs.length} technicaltelemetry → telemetry`);
    if (!dryRun) {
      const telDocs = techDocs.map(({ _id, metricType, ...data }) => ({ ...data, category: 'technical', eventType: metricType }));
      await db.collection('telemetry').insertMany(telDocs);
      console.log(`  ✓ Migrated ${techDocs.length} technical telemetry`);
    }
  }

  const engDocs = await db.collection('engagementevents').find({}).toArray();
  if (engDocs.length > 0) {
    console.log(`Migrating ${engDocs.length} engagementevents → telemetry`);
    if (!dryRun) {
      const telDocs = engDocs.map(({ _id, ...data }) => ({ ...data, category: 'engagement' }));
      await db.collection('telemetry').insertMany(telDocs);
      console.log(`  ✓ Migrated ${engDocs.length} engagement events`);
    }
  }

  // ── 6. Migrate assessmentsessions + evaluationresponses → assessments ──
  const sessionAssessDocs = await db.collection('assessmentsessions').find({}).toArray();
  if (sessionAssessDocs.length > 0) {
    console.log(`Migrating ${sessionAssessDocs.length} assessmentsessions → assessments`);
    if (!dryRun) {
      const docs = sessionAssessDocs.map(({ _id, ...data }) => ({ ...data, docType: 'session' }));
      await db.collection('assessments').insertMany(docs);
      console.log(`  ✓ Migrated ${sessionAssessDocs.length} assessment sessions`);
    }
  }

  const evalDocs = await db.collection('evaluationresponses').find({}).toArray();
  if (evalDocs.length > 0) {
    console.log(`Migrating ${evalDocs.length} evaluationresponses → assessments`);
    if (!dryRun) {
      const docs = evalDocs.map(({ _id, ...data }) => ({ ...data, docType: 'evaluation' }));
      await db.collection('assessments').insertMany(docs);
      console.log(`  ✓ Migrated ${evalDocs.length} evaluation responses`);
    }
  }

  // ── 7. Migrate playthroughrelationships → truths ────────────────────────
  const relDocs = await db.collection('playthroughrelationships').find({}).toArray();
  if (relDocs.length > 0) {
    console.log(`Migrating ${relDocs.length} playthroughrelationships → truths`);
    if (!dryRun) {
      const truthDocs = relDocs.map(({ _id, playthroughId, fromCharacterId, toCharacterId, type, strength, ...rest }) => ({
        worldId: null,
        playthroughId,
        title: `${type} relationship: ${fromCharacterId} → ${toCharacterId}`,
        content: `relationship('${fromCharacterId}', '${toCharacterId}', '${type}', ${strength}).`,
        entryType: 'relationship',
        timestep: 0,
        source: 'relationship',
        sourceData: { fromCharacterId, toCharacterId, type, strength, ...rest },
        relatedCharacterIds: [fromCharacterId, toCharacterId],
        createdAt: new Date(),
      }));
      await db.collection('truths').insertMany(truthDocs);
      console.log(`  ✓ Migrated ${relDocs.length} relationships`);
    }
  }

  // ── 8. Migrate occupations → truths ────────────────────────────────────
  const occDocs = await db.collection('occupations').find({}).toArray();
  if (occDocs.length > 0) {
    console.log(`Migrating ${occDocs.length} occupations → truths`);
    if (!dryRun) {
      const truthDocs = occDocs.map(({ _id, worldId, characterId, businessId, vocation, shift, startYear, ...rest }) => ({
        worldId,
        title: `${vocation} at ${businessId}`,
        content: `employed_at('${characterId}', '${businessId}', '${vocation}', '${shift}', ${startYear}).`,
        entryType: 'occupation',
        characterId,
        timestep: 0,
        timeYear: startYear,
        source: 'occupation',
        sourceData: { characterId, businessId, vocation, shift, startYear, ...rest },
        relatedCharacterIds: [characterId],
        createdAt: new Date(),
      }));
      await db.collection('truths').insertMany(truthDocs);
      console.log(`  ✓ Migrated ${occDocs.length} occupations`);
    }
  }

  // ── 9. Migrate playerprogresses → truths ───────────────────────────────
  const progDocs = await db.collection('playerprogresses').find({}).toArray();
  if (progDocs.length > 0) {
    console.log(`Migrating ${progDocs.length} playerprogresses → truths`);
    if (!dryRun) {
      const truthDocs = progDocs.map(({ _id, worldId, userId, playthroughId, ...rest }) => ({
        worldId,
        playthroughId: playthroughId || null,
        title: `Player progress: ${userId}`,
        content: `player_progress('${userId}', '${worldId}').`,
        entryType: 'player_progress',
        timestep: 0,
        source: 'player_progress',
        sourceData: { userId, playthroughId, ...rest },
        createdAt: new Date(),
      }));
      await db.collection('truths').insertMany(truthDocs);
      console.log(`  ✓ Migrated ${progDocs.length} player progress records`);
    }
  }

  // ── 10. Migrate achievements → truths ──────────────────────────────────
  const achDocs = await db.collection('achievements').find({}).toArray();
  if (achDocs.length > 0) {
    console.log(`Migrating ${achDocs.length} achievements → truths`);
    if (!dryRun) {
      const truthDocs = achDocs.map(({ _id, worldId, name, achievementType, experienceReward, ...rest }) => ({
        worldId: worldId || null,
        title: name,
        content: `achievement('${name}', '${achievementType}', ${experienceReward || 0}).`,
        entryType: 'achievement',
        timestep: 0,
        source: 'achievement',
        sourceData: { name, achievementType, experienceReward, ...rest },
        createdAt: new Date(),
      }));
      await db.collection('truths').insertMany(truthDocs);
      console.log(`  ✓ Migrated ${achDocs.length} achievements`);
    }
  }

  // ── 11. Migrate charactertemplates → characters with isTemplate=true ─────
  const templateDocs = await db.collection('charactertemplates').find({}).toArray();
  if (templateDocs.length > 0) {
    console.log(`Migrating ${templateDocs.length} charactertemplates → characters`);
    if (!dryRun) {
      const charDocs = templateDocs.map(({ _id, name, description, ...rest }) => ({
        ...rest,
        firstName: name,
        lastName: 'Template',
        gender: 'other',
        isTemplate: true,
        status: description,
        createdAt: rest.createdAt || new Date(),
        updatedAt: rest.updatedAt || new Date(),
      }));
      await db.collection('characters').insertMany(charDocs);
      console.log(`  ✓ Migrated ${templateDocs.length} character templates`);
    }
  }

  // ── Drop old collections ───────────────────────────────────────────────
  const toDrop = [
    'proficiencyprogress',
    'knowledgeentries',
    'grammarpatterns',
    'conversationrecords',
    'readingprogress',
    'assessmentsessions',
    'evaluationresponses',
    'technicaltelemetry',
    'engagementevents',
    'texts',
    'terrainfeatures',
    'waterfeatures',
    'publicbuildings',
    'playersessions',
    'residences',
    // Also drop the old assessment collection name if it exists separately from the unified one
    'languageassessments',
    // Drop old vocabulary collection name
    'vocabularyentries',
    // Settlement history events merged into truths
    'settlementhistoryevents',
    // Round 2: merged into truths collection
    'occupations',
    'achievements',
    'playtraces',
    'playthroughrelationships',
    'reputations',
    'playerprogresses',
    'languageprogress',
    'languagechatmessages',
    // Character templates merged into characters with isTemplate=true
    'charactertemplates',
  ];

  console.log(`\nDropping ${toDrop.length} old collections...`);
  for (const name of toDrop) {
    try {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        const count = await db.collection(name).countDocuments();
        if (dryRun) {
          console.log(`  Would drop: ${name} (${count} docs)`);
        } else {
          await db.collection(name).drop();
          console.log(`  ✓ Dropped: ${name} (${count} docs)`);
        }
      }
    } catch (e: any) {
      console.log(`  ⚠ Skipped ${name}: ${e.message}`);
    }
  }

  // Final count — in dry-run, count which collections would actually be dropped
  const remaining = await db.listCollections().toArray();
  if (dryRun) {
    const dropSet = new Set(toDrop);
    const wouldRemain = remaining.filter(c => !dropSet.has(c.name));
    console.log(`\n🔍 Would result in ${wouldRemain.length} collections:`);
    for (const c of wouldRemain.sort((a, b) => a.name.localeCompare(b.name))) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  ${c.name}: ${count}`);
    }
  } else {
    const finalCollections = await db.listCollections().toArray();
    console.log(`\n✅ Final count: ${finalCollections.length} collections`);
  }

  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
