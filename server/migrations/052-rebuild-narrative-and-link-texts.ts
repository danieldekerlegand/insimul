#!/usr/bin/env tsx
/**
 * Migration 052: Rebuild Narrative Truth & Link Texts to Chapters
 *
 * Recreates the world_narrative truth that was lost, linking the existing
 * journal entries, books, and letters to the main quest chapters.
 *
 * Also backfills narrativeChapterId on texts based on CEFR level and category.
 *
 * Usage:
 *   npx tsx server/migrations/052-rebuild-narrative-and-link-texts.ts
 *   npx tsx server/migrations/052-rebuild-narrative-and-link-texts.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.DATABASE_URL || '';
const DRY_RUN = process.argv.includes('--dry-run');

// The writer's name — extracted from existing journal entries
const WRITER_NAME = 'Jean-Luc Moreau';
const SETTLEMENT_NAME = 'Grand-Pre';

// Chapter narratives with clue descriptions — rebuilds the full narrative truth
const NARRATIVE = {
  writerName: WRITER_NAME,
  settlementName: SETTLEMENT_NAME,
  chapters: [
    {
      chapterId: 'ch1_assignment_abroad',
      introNarrative: `The ferry docks in an unfamiliar harbor. Your editor back home wired ahead — the celebrated writer ${WRITER_NAME} vanished three weeks ago, and the local press has gone quiet. You clutch the thin dossier in your coat pocket. It is not much to go on, but it is a start.`,
      outroNarrative: `The editor at the local paper regards you with cautious respect. "You are the foreign reporter, yes? ${WRITER_NAME} was last seen near the old quarter. Ask the people there — they remember everything." Your investigation has begun.`,
      mysteryDetails: `${WRITER_NAME}, a celebrated local author known for writing about Chitimacha heritage and bayou culture, disappeared three weeks ago. The local newspaper has been unusually silent about it.`,
      clueDescriptions: [
        { clueId: 'notice_board', text: 'A weathered missing person notice on the town board, partially torn.' },
        { clueId: 'writer_name', text: `The writer's name: ${WRITER_NAME}. Ask around town.` },
      ],
    },
    {
      chapterId: 'ch2_following_the_trail',
      introNarrative: `The editor hands you a faded photograph of ${WRITER_NAME} — sharp eyes, ink-stained fingers, a half-smile. "This was taken at the Café du Pont, two days before the disappearance. Start there." You fold the photo carefully and step into the rain-washed streets.`,
      outroNarrative: `A bookseller slid a worn first edition across the counter. "Everybody loved this one," she said. "But the last book — that one made people nervous." You leaf through it under a streetlamp. Something is written in pencil on the inside cover: a date and the words "the garden remembers."`,
      mysteryDetails: `${WRITER_NAME} was a regular at the Café du Pont and the local bookshop. The bookseller remembers the last book being controversial — it touched on the old families' secrets.`,
      clueDescriptions: [
        { clueId: 'cafe_photo', text: `A photograph of ${WRITER_NAME} at the Café du Pont, taken two days before the disappearance.` },
        { clueId: 'first_edition', text: `${WRITER_NAME}'s first book, with a handwritten note: "the garden remembers."` },
      ],
    },
    {
      chapterId: 'ch3_the_inner_circle',
      introNarrative: `Your notebook is filling up. ${WRITER_NAME}'s editor reluctantly agreed to a meeting. The neighbor peers through curtains whenever you pass. And the patron — rumored to be the writer's biggest supporter — has declined two invitations. But you are patient. You are a reporter, and the truth is always there for those who ask the right questions in the right language.`,
      outroNarrative: `The patron finally let something slip over tea: "${WRITER_NAME} was writing about the old families — their secrets, their debts. Not everyone wanted those stories told." The neighbor confirmed it: late-night visitors, hushed arguments. The writer was not just writing fiction. They were documenting the truth.`,
      mysteryDetails: `${WRITER_NAME}'s inner circle — the editor, a wealthy patron, and a reclusive neighbor — each hold a piece of the puzzle. The writer was researching something controversial involving the old families.`,
      clueDescriptions: [
        { clueId: 'editor_testimony', text: `The editor reveals ${WRITER_NAME} had an unpublished manuscript about the old families.` },
        { clueId: 'patron_slip', text: `The patron admits ${WRITER_NAME} was writing about the old families' secrets and debts.` },
        { clueId: 'neighbor_account', text: `The neighbor saw late-night visitors and heard hushed arguments before the disappearance.` },
      ],
    },
    {
      chapterId: 'ch4_hidden_messages',
      introNarrative: `You sit at ${WRITER_NAME}'s favorite café table, books spread before you. A passage leaps off the page: "The lighthouse keeper knows what the tide brought in." But there is no lighthouse in this town. You check the map — there is one, twenty kilometers east, on a rocky stretch of coast. The trail leads outward.`,
      outroNarrative: `At a remote farmhouse you found a loose floorboard, and under it, a bundle of letters. ${WRITER_NAME} had been meeting someone here, trading pages of a manuscript for information. The final letter reads: "They are watching the house. I must go somewhere they cannot follow. Burn this." You did not burn it.`,
      mysteryDetails: `${WRITER_NAME} left coded messages in their books — allusions, anagrams, hidden references. The clues lead beyond the main settlement to secret meeting places.`,
      clueDescriptions: [
        { clueId: 'coded_passage', text: `A coded passage in ${WRITER_NAME}'s book referencing a lighthouse that doesn't exist in town.` },
        { clueId: 'hidden_letters', text: `A bundle of letters hidden under a floorboard at a remote farmhouse. ${WRITER_NAME} was trading manuscript pages for information.` },
        { clueId: 'burn_letter', text: `The final letter: "They are watching the house. I must go somewhere they cannot follow. Burn this."` },
      ],
    },
    {
      chapterId: 'ch5_the_truth_emerges',
      introNarrative: `Your desk at the boarding house is covered in notes, photographs, and pages torn from books. Red thread connects the pins on your map. The patron, the scholars, the secret meetings — it all points to one conclusion: ${WRITER_NAME} was not taken. They chose to disappear. But why? And where did they go? The confidant — the writer's oldest friend — may be the only one who knows.`,
      outroNarrative: `The confidant looked at you for a long time. Then she spoke: "${WRITER_NAME} found proof — real proof — of what the old families did. They wanted it destroyed. So the writer hid — and hid the manuscript with them. If you truly want to find ${WRITER_NAME}, go to the place where the first story was written." You know exactly where that is.`,
      mysteryDetails: `${WRITER_NAME} found proof of the old families' wrongdoing and went into hiding voluntarily to protect the manuscript. The confidant knows the truth.`,
      clueDescriptions: [
        { clueId: 'voluntary_disappearance', text: `${WRITER_NAME} was not taken — they chose to disappear to protect evidence.` },
        { clueId: 'confidant_reveal', text: `${WRITER_NAME}'s confidant reveals: "Go to the place where the first story was written."` },
        { clueId: 'manuscript_location', text: `${WRITER_NAME} is hiding with the manuscript — at their grandfather's cabin by the bayou.` },
      ],
    },
    {
      chapterId: 'ch6_the_final_chapter',
      introNarrative: `The road winds uphill past olive groves and crumbling stone walls. A cottage sits at the edge of a cliff overlooking the sea — smoke curling from the chimney. A typewriter clacks inside. You take a breath and knock. The door opens, and there stands ${WRITER_NAME}, alive and well, with ink on their fingers and a story they have been waiting to tell.`,
      outroNarrative: `Your article runs on the front page of both papers — the one back home and the one here. ${WRITER_NAME}'s manuscript is published at last, to great acclaim and some controversy. The patron sends a stiff letter of congratulations. The editor smiles. The neighbor waves. You walk the cobblestone streets one more time, fluent in the language and known to everyone. This place is no longer foreign. It is home.`,
      mysteryDetails: `${WRITER_NAME} is found alive at the grandfather's cabin, finishing the manuscript that documents the truth about the old families.`,
      clueDescriptions: [
        { clueId: 'writer_found', text: `${WRITER_NAME} is alive and well, finishing the manuscript at the cabin.` },
        { clueId: 'truth_published', text: `The manuscript is published. The truth about the old families is finally known.` },
      ],
    },
  ],
};

// Text-to-chapter mapping based on CEFR level and content type
const TEXT_CHAPTER_MAP: Record<string, { cefrLevels: string[]; categories?: string[] }> = {
  'ch1_assignment_abroad': { cefrLevels: ['A1'], categories: ['journal'] },
  'ch2_following_the_trail': { cefrLevels: ['A1'], categories: ['book', 'letter'] },
  'ch3_the_inner_circle': { cefrLevels: ['A2'], categories: ['journal', 'letter'] },
  'ch4_hidden_messages': { cefrLevels: ['A2', 'B1'], categories: ['book'] },
  'ch5_the_truth_emerges': { cefrLevels: ['B1'], categories: ['journal'] },
  'ch6_the_final_chapter': { cefrLevels: ['B2'], categories: ['journal', 'letter'] },
};

// Specific text-to-chapter assignments (by title)
const SPECIFIC_TEXT_CHAPTERS: Record<string, string> = {
  'Journal — Lundi matin': 'ch1_assignment_abroad',
  'Journal — La Découverte': 'ch3_the_inner_circle',
  'Journal — Les Menaces': 'ch4_hidden_messages',
  'Journal — La Dernière Nuit': 'ch5_the_truth_emerges',
  'Journal — Épilogue': 'ch6_the_final_chapter',
  'Lettre au Rédacteur en Chef': 'ch6_the_final_chapter',
  'Lettre de la Maîtresse': 'ch3_the_inner_circle',
  'Lettre à Maman': 'ch2_following_the_trail',
  'Bayou Lafourche : Mémoire et Vérité': 'ch4_hidden_messages',
  'Les Chitimacha : Peuple du Bayou': 'ch3_the_inner_circle',
  'Le Dernier Pêcheur du Bayou': 'ch5_the_truth_emerges',
  'La Légende du Bayou Bleu': 'ch2_following_the_trail',
};

async function main() {
  console.log(`\n=== Migration 052: Rebuild Narrative & Link Texts ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  if (!MONGO_URL) {
    console.error('No MONGO_URL found');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db!;
  const worldId = '69cbbc6b7dbae7be5f935995';

  // ── 1. Create/update world_narrative truth ──────────────────────────────
  console.log('1. Rebuilding world_narrative truth...');

  const truthsCollection = db.collection('truths');
  const existing = await truthsCollection.findOne({
    worldId,
    entryType: 'world_narrative',
  });

  if (existing) {
    console.log('   World narrative already exists — updating...');
    if (!DRY_RUN) {
      await truthsCollection.updateOne(
        { _id: existing._id },
        { $set: { content: JSON.stringify(NARRATIVE), updatedAt: new Date() } },
      );
    }
    console.log('   ✓ Updated existing narrative truth');
  } else {
    console.log('   Creating new world_narrative truth...');
    if (!DRY_RUN) {
      await truthsCollection.insertOne({
        worldId,
        title: 'World Narrative',
        content: JSON.stringify(NARRATIVE),
        entryType: 'world_narrative',
        category: 'narrative',
        importance: 10,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log('   ✓ Created world_narrative truth');
  }

  // ── 2. Link texts to narrative chapters ──────────────────────────────────
  console.log('\n2. Linking texts to narrative chapters...');

  const textsCollection = db.collection('texts');
  const texts = await textsCollection.find({ worldId }).toArray();
  let linked = 0;

  for (const text of texts) {
    // Check specific mapping first
    let chapterId = SPECIFIC_TEXT_CHAPTERS[text.title];

    // Fallback: match by CEFR level + category
    if (!chapterId) {
      for (const [chapId, criteria] of Object.entries(TEXT_CHAPTER_MAP)) {
        if (criteria.cefrLevels.includes(text.cefrLevel)) {
          if (!criteria.categories || criteria.categories.includes(text.textCategory)) {
            chapterId = chapId;
            break;
          }
        }
      }
    }

    if (chapterId && text.narrativeChapterId !== chapterId) {
      if (!DRY_RUN) {
        await textsCollection.updateOne(
          { _id: text._id },
          { $set: { narrativeChapterId: chapterId, updatedAt: new Date() } },
        );
      }
      console.log(`   ✓ "${text.title}" → ${chapterId}`);
      linked++;
    }
  }
  console.log(`   ${linked} texts linked to chapters`);

  // ── 3. Update main quest chapter records with narrative context ──────────
  console.log('\n3. Updating quest records with narrative context...');

  const questsCollection = db.collection('quests');
  const mainQuests = await questsCollection.find({
    worldId,
    tags: 'main_quest',
  }).toArray();

  let questsUpdated = 0;
  for (const quest of mainQuests) {
    const chapterTag = (quest.tags || []).find((t: string) => t.startsWith('chapterId:'));
    if (!chapterTag) continue;
    const chapterId = chapterTag.replace('chapterId:', '');

    const chapter = NARRATIVE.chapters.find(ch => ch.chapterId === chapterId);
    if (!chapter) continue;

    const conversationContext = JSON.stringify({
      introNarrative: chapter.introNarrative,
      outroNarrative: chapter.outroNarrative,
      mysteryDetails: chapter.mysteryDetails,
      clueDescriptions: chapter.clueDescriptions,
    });

    if (quest.conversationContext !== conversationContext) {
      if (!DRY_RUN) {
        await questsCollection.updateOne(
          { _id: quest._id },
          { $set: { conversationContext, narrativeChapterId: chapterId, updatedAt: new Date() } },
        );
      }
      console.log(`   ✓ ${quest.title} — narrative context updated`);
      questsUpdated++;
    }
  }
  console.log(`   ${questsUpdated} quest records updated`);

  console.log(`\n=== Done ===\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
