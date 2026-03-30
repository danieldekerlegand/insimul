#!/usr/bin/env tsx
/**
 * Migration 049: Backfill narrativeChapterId on existing quests and texts
 *
 * 1. Sets narrativeChapterId on chain quests based on questChainOrder
 * 2. Sets narrativeChapterId on texts with chapterId:xxx tags
 * 3. Sets narrativeChapterId on writer texts by CEFR level heuristic
 * 4. Ensures main quest NPC roles are filled (fallback assignment)
 *
 * Idempotent: skips records that already have narrativeChapterId set.
 *
 * Usage:
 *   npx tsx server/migrations/049-backfill-narrative-chapter-ids.ts
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Chapter mapping: questChainOrder → narrativeChapterId
const CHAIN_ORDER_TO_CHAPTER: Record<number, string> = {
  1: 'ch1_assignment_abroad',
  2: 'ch2_following_the_trail',
  3: 'ch3_the_inner_circle',
  4: 'ch4_hidden_messages',
  5: 'ch5_the_truth_emerges',
  6: 'ch6_the_final_chapter',
};

const CEFR_TO_CHAPTER: Record<string, string> = {
  'A1': 'ch1_assignment_abroad',
  'A2': 'ch3_the_inner_circle',
  'B1': 'ch5_the_truth_emerges',
  'B2': 'ch6_the_final_chapter',
};

async function run() {
  await mongoose.connect(process.env.MONGO_URL!);
  const db = mongoose.connection.db!;

  console.log('\n📝 Migration 049: Backfill narrativeChapterId\n');

  // ── 1. Chain quests ────────────────────────────────────────────────────
  const quests = db.collection('quests');
  const chainQuests = await quests.find({
    questChainId: { $exists: true, $ne: null },
    narrativeChapterId: { $in: [null, undefined] },
  }).toArray();

  let questsUpdated = 0;
  for (const q of chainQuests) {
    const order = q.questChainOrder ?? -1;
    const chapterId = CHAIN_ORDER_TO_CHAPTER[order];
    if (!chapterId) continue;

    await quests.updateOne({ _id: q._id }, { $set: { narrativeChapterId: chapterId } });
    questsUpdated++;
    console.log(`  Quest "${q.title}" (order ${order}) → ${chapterId}`);
  }
  console.log(`\n✅ Updated ${questsUpdated} chain quests`);

  // ── 2. Texts with chapterId tags ───────────────────────────────────────
  const texts = db.collection('gametexts');
  const allTexts = await texts.find({
    narrativeChapterId: { $in: [null, undefined] },
  }).toArray();

  let textsUpdated = 0;
  for (const t of allTexts) {
    const tags: string[] = t.tags || [];

    // Check for chapterId:xxx tag
    const chapterTag = tags.find((tag: string) => tag.startsWith('chapterId:'));
    if (chapterTag) {
      const chapterId = chapterTag.replace('chapterId:', '');
      await texts.updateOne({ _id: t._id }, { $set: { narrativeChapterId: chapterId } });
      textsUpdated++;
      console.log(`  Text "${t.title}" (tag) → ${chapterId}`);
      continue;
    }

    // Check for main-quest tag + clueText → assign by CEFR heuristic
    if (tags.includes('main-quest') || t.clueText) {
      const cefrLevel = t.cefrLevel || 'A1';
      const chapterId = CEFR_TO_CHAPTER[cefrLevel] || 'ch1_assignment_abroad';
      await texts.updateOne({ _id: t._id }, { $set: { narrativeChapterId: chapterId } });
      textsUpdated++;
      console.log(`  Text "${t.title}" (CEFR ${cefrLevel}) → ${chapterId}`);
    }
  }
  console.log(`\n✅ Updated ${textsUpdated} texts`);

  // ── 3. Verify NPC roles ────────────────────────────────────────────────
  const characters = db.collection('characters');
  const mainQuestNPCs = await characters.find({
    'generationConfig.mainQuestNPC': true,
  }).toArray();

  const roles = new Set(mainQuestNPCs.map((c: any) => c.generationConfig?.mainQuestRole).filter(Boolean));
  const allRoles = ['the_editor', 'the_neighbor', 'the_patron', 'the_scholar', 'the_confidant'];
  const missingRoles = allRoles.filter(r => !roles.has(r));

  if (missingRoles.length > 0) {
    console.log(`\n⚠️  Missing NPC roles: ${missingRoles.join(', ')}`);
    console.log('   Run ensureMainQuestRoles() at game start to auto-assign fallbacks.');
  } else {
    console.log(`\n✅ All 5 main quest NPC roles are assigned`);
    for (const npc of mainQuestNPCs) {
      console.log(`  ${npc.generationConfig?.mainQuestRole}: ${npc.firstName} ${npc.lastName}`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const totalQuests = await quests.countDocuments({ narrativeChapterId: { $exists: true, $ne: null } });
  const totalTexts = await texts.countDocuments({ narrativeChapterId: { $exists: true, $ne: null } });
  console.log(`\nFinal: ${totalQuests} quests and ${totalTexts} texts have narrativeChapterId`);

  await mongoose.disconnect();
  console.log('\nDone!');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
