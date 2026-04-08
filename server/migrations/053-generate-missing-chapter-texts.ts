#!/usr/bin/env tsx
/**
 * Migration 053: Generate Missing Chapter Texts
 *
 * Creates texts needed to satisfy each chapter's find_text objective count.
 * Also links unlinked recipes to early chapters.
 *
 * Usage:
 *   npx tsx server/migrations/053-generate-missing-chapter-texts.ts
 *   npx tsx server/migrations/053-generate-missing-chapter-texts.ts --dry-run
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
const WORLD_ID = '69cbbc6b7dbae7be5f935995';

interface NewText {
  title: string;
  titleTranslation: string;
  textCategory: string;
  cefrLevel: string;
  targetLanguage: string;
  difficulty: string;
  authorName: string | null;
  spawnLocationHint: string;
  clueText: string | null;
  narrativeChapterId: string;
  pages: Array<{ content: string; contentTranslation: string }>;
  vocabularyHighlights: Array<{ word: string; translation: string; partOfSpeech: string }>;
  tags: string[];
  status: string;
}

const NEW_TEXTS: NewText[] = [
  // ── Ch1: Need 1 more text (notices/signs for "Read the Signs" objective) ──
  {
    title: 'Avis de Disparition',
    titleTranslation: 'Missing Person Notice',
    textCategory: 'flyer',
    cefrLevel: 'A1',
    targetLanguage: 'French',
    difficulty: 'beginner',
    authorName: null,
    spawnLocationHint: 'city_hall',
    clueText: 'A missing person notice for Jean-Luc Moreau, posted three weeks ago. It mentions he was last seen near the old quarter.',
    narrativeChapterId: 'ch1_assignment_abroad',
    pages: [
      {
        content: "AVIS DE DISPARITION\n\nNom : Jean-Luc Moreau\nÂge : 58 ans\nDernier lieu connu : Le Vieux Quartier, Grand-Pre\n\nJean-Luc Moreau, écrivain et historien local, n'a pas été vu depuis trois semaines. Si vous avez des informations, contactez le bureau du journal.\n\nRécompense offerte.",
        contentTranslation: "MISSING PERSON NOTICE\n\nName: Jean-Luc Moreau\nAge: 58\nLast known location: The Old Quarter, Grand-Pre\n\nJean-Luc Moreau, local writer and historian, has not been seen for three weeks. If you have any information, contact the newspaper office.\n\nReward offered.",
      },
    ],
    vocabularyHighlights: [
      { word: 'disparition', translation: 'disappearance', partOfSpeech: 'noun' },
      { word: 'écrivain', translation: 'writer', partOfSpeech: 'noun' },
      { word: 'dernier', translation: 'last', partOfSpeech: 'adjective' },
      { word: 'semaines', translation: 'weeks', partOfSpeech: 'noun' },
      { word: 'récompense', translation: 'reward', partOfSpeech: 'noun' },
    ],
    tags: ['main-quest', 'clue', 'notice'],
    status: 'published',
  },

  // ── Ch5: Need 2 more texts (scholarly/advanced for "Scholarly Texts") ──
  {
    title: 'Les Droits Fonciers en Louisiane',
    titleTranslation: 'Land Rights in Louisiana',
    textCategory: 'book',
    cefrLevel: 'B1',
    targetLanguage: 'French',
    difficulty: 'advanced',
    authorName: 'Prof. Marie-Claire Dupont',
    spawnLocationHint: 'library',
    clueText: null,
    narrativeChapterId: 'ch5_the_truth_emerges',
    pages: [
      {
        content: "Les traités fonciers de la Louisiane coloniale constituent l'un des chapitres les plus complexes de l'histoire américaine. Les peuples autochtones, notamment les Chitimacha, possédaient des droits ancestraux sur ces terres bien avant l'arrivée des colons européens.\n\nLes documents originaux de ces transactions ont été, pour la plupart, perdus ou détruits. Cependant, des historiens locaux continuent de chercher les preuves de ces accords inégaux.",
        contentTranslation: "The land treaties of colonial Louisiana constitute one of the most complex chapters of American history. Indigenous peoples, notably the Chitimacha, held ancestral rights to these lands long before the arrival of European settlers.\n\nThe original documents from these transactions have been, for the most part, lost or destroyed. However, local historians continue to search for evidence of these unequal agreements.",
      },
      {
        content: "Parmi les familles fondatrices de Grand-Pre, certaines ont acquis d'immenses propriétés par des moyens aujourd'hui considérés comme frauduleux. Les Chitimacha affirment que leurs ancêtres n'ont jamais consenti à la vente de ces terres.\n\nLa question demeure : où sont les documents originaux ? Et qui profite de leur disparition ?",
        contentTranslation: "Among the founding families of Grand-Pre, some acquired immense properties through means now considered fraudulent. The Chitimacha assert that their ancestors never consented to the sale of these lands.\n\nThe question remains: where are the original documents? And who profits from their disappearance?",
      },
    ],
    vocabularyHighlights: [
      { word: 'droits fonciers', translation: 'land rights', partOfSpeech: 'noun' },
      { word: 'traités', translation: 'treaties', partOfSpeech: 'noun' },
      { word: 'autochtones', translation: 'indigenous', partOfSpeech: 'adjective' },
      { word: 'ancêtres', translation: 'ancestors', partOfSpeech: 'noun' },
      { word: 'frauduleux', translation: 'fraudulent', partOfSpeech: 'adjective' },
      { word: 'disparition', translation: 'disappearance', partOfSpeech: 'noun' },
    ],
    tags: ['scholarly', 'history', 'chitimacha'],
    status: 'published',
  },
  {
    title: "Rapport d'Enquête : Famille Beaumont",
    titleTranslation: 'Investigation Report: Beaumont Family',
    textCategory: 'journal',
    cefrLevel: 'B1',
    targetLanguage: 'French',
    difficulty: 'advanced',
    authorName: 'Jean-Luc Moreau',
    spawnLocationHint: 'hidden',
    clueText: "Jean-Luc's private investigation notes on the Beaumont family's connection to the historical land fraud. Contains dates, names, and references to hidden documents.",
    narrativeChapterId: 'ch5_the_truth_emerges',
    pages: [
      {
        content: "NOTES D'ENQUÊTE — CONFIDENTIEL\n\n15 mars : Rencontré Pierre Beaumont au café. Il a nié toute connaissance des anciens documents fonciers. Son visage disait le contraire.\n\n18 mars : Trouvé une référence dans les archives municipales — un acte de transfert daté de 1847, signé sous contrainte selon les témoignages Chitimacha.\n\n20 mars : Quelqu'un a fouillé mon bureau pendant la nuit. Rien n'a été volé, mais mes notes sur les Beaumont ont été déplacées.",
        contentTranslation: "INVESTIGATION NOTES — CONFIDENTIAL\n\nMarch 15: Met Pierre Beaumont at the café. He denied any knowledge of the old land documents. His face said otherwise.\n\nMarch 18: Found a reference in the municipal archives — a transfer deed dated 1847, signed under duress according to Chitimacha testimony.\n\nMarch 20: Someone searched my office during the night. Nothing was stolen, but my notes on the Beaumonts had been moved.",
      },
      {
        content: "22 mars : Lettre anonyme glissée sous ma porte : « Arrêtez de poser des questions. » Je ne m'arrêterai pas.\n\n25 mars : Les originaux existent. Je sais où ils sont. Je dois les mettre en sécurité avant qu'ils ne soient détruits.\n\nSi quelqu'un lit ces notes, cherchez le cyprès géant au bord du bayou. Là où l'eau et les racines se rencontrent.",
        contentTranslation: "March 22: Anonymous letter slipped under my door: 'Stop asking questions.' I will not stop.\n\nMarch 25: The originals exist. I know where they are. I must secure them before they are destroyed.\n\nIf anyone reads these notes, look for the giant cypress at the edge of the bayou. Where the water and the roots meet.",
      },
    ],
    vocabularyHighlights: [
      { word: 'enquête', translation: 'investigation', partOfSpeech: 'noun' },
      { word: 'confidentiel', translation: 'confidential', partOfSpeech: 'adjective' },
      { word: 'archives', translation: 'archives', partOfSpeech: 'noun' },
      { word: 'contrainte', translation: 'duress/coercion', partOfSpeech: 'noun' },
      { word: 'anonyme', translation: 'anonymous', partOfSpeech: 'adjective' },
      { word: 'cyprès', translation: 'cypress tree', partOfSpeech: 'noun' },
    ],
    tags: ['main-quest', 'clue', 'investigation'],
    status: 'published',
  },

  // ── Ch6: Need 3 more texts (culmination, mastery level) ──
  {
    title: "Le Manuscrit Retrouvé",
    titleTranslation: 'The Recovered Manuscript',
    textCategory: 'book',
    cefrLevel: 'B2',
    targetLanguage: 'French',
    difficulty: 'advanced',
    authorName: 'Jean-Luc Moreau',
    spawnLocationHint: 'hidden',
    clueText: "The manuscript Jean-Luc was writing — the complete account of the Beaumont family's land fraud against the Chitimacha people.",
    narrativeChapterId: 'ch6_the_final_chapter',
    pages: [
      {
        content: "AVANT-PROPOS\n\nCe que vous tenez entre vos mains est le fruit de trente années de recherche, d'entretiens et de découvertes. C'est aussi la raison pour laquelle j'ai dû disparaître.\n\nLes familles fondatrices de Grand-Pre — les Beaumont en tête — ont bâti leur fortune sur un mensonge. Les terres qu'elles possèdent ont été acquises par la fraude, la manipulation et la violence.\n\nLes Chitimacha le savent depuis toujours. Il est temps que le monde l'apprenne.",
        contentTranslation: "FOREWORD\n\nWhat you hold in your hands is the fruit of thirty years of research, interviews, and discoveries. It is also the reason I had to disappear.\n\nThe founding families of Grand-Pre — the Beaumonts foremost — built their fortune on a lie. The lands they possess were acquired through fraud, manipulation, and violence.\n\nThe Chitimacha have always known this. It is time the world learned.",
      },
      {
        content: "En 1847, un document fut rédigé — un prétendu accord de cession des terres Chitimacha aux colons. Les signatures au bas de la page furent obtenues sous la menace. Trois anciens Chitimacha furent emprisonnés jusqu'à ce qu'ils acceptent de signer.\n\nJ'ai retrouvé ce document. Il est ici, avec moi, dans la cabane de mon grand-père au bord du bayou. Et je ne le rendrai à personne — sauf au monde entier.",
        contentTranslation: "In 1847, a document was drafted — a supposed agreement ceding Chitimacha lands to the settlers. The signatures at the bottom of the page were obtained under threat. Three Chitimacha elders were imprisoned until they agreed to sign.\n\nI have recovered this document. It is here, with me, in my grandfather's cabin at the edge of the bayou. And I will give it to no one — except to the whole world.",
      },
    ],
    vocabularyHighlights: [
      { word: 'manuscrit', translation: 'manuscript', partOfSpeech: 'noun' },
      { word: 'disparaître', translation: 'to disappear', partOfSpeech: 'verb' },
      { word: 'fraude', translation: 'fraud', partOfSpeech: 'noun' },
      { word: 'cession', translation: 'cession/transfer', partOfSpeech: 'noun' },
      { word: 'menace', translation: 'threat', partOfSpeech: 'noun' },
      { word: 'emprisonnés', translation: 'imprisoned', partOfSpeech: 'adjective' },
    ],
    tags: ['main-quest', 'clue', 'manuscript', 'finale'],
    status: 'published',
  },
  {
    title: "Déclaration des Anciens Chitimacha",
    titleTranslation: 'Declaration of the Chitimacha Elders',
    textCategory: 'letter',
    cefrLevel: 'B2',
    targetLanguage: 'French',
    difficulty: 'advanced',
    authorName: null,
    spawnLocationHint: 'hidden',
    clueText: null,
    narrativeChapterId: 'ch6_the_final_chapter',
    pages: [
      {
        content: "Nous, les anciens du peuple Chitimacha, déclarons ceci :\n\nNos ancêtres n'ont jamais cédé ces terres de leur plein gré. Les documents que les familles fondatrices présentent comme preuve de propriété sont le produit de la coercition et du mensonge.\n\nNous demandons que la vérité soit connue. Nous demandons que justice soit rendue. Nous demandons que notre histoire soit racontée, non pas par ceux qui l'ont effacée, mais par ceux qui l'ont vécue.\n\nSigné au nom de nos ancêtres et de nos enfants.",
        contentTranslation: "We, the elders of the Chitimacha people, declare the following:\n\nOur ancestors never ceded these lands of their own free will. The documents that the founding families present as proof of ownership are the product of coercion and lies.\n\nWe demand that the truth be known. We demand that justice be served. We demand that our history be told, not by those who erased it, but by those who lived it.\n\nSigned on behalf of our ancestors and our children.",
      },
    ],
    vocabularyHighlights: [
      { word: 'déclaration', translation: 'declaration', partOfSpeech: 'noun' },
      { word: 'anciens', translation: 'elders', partOfSpeech: 'noun' },
      { word: 'coercition', translation: 'coercion', partOfSpeech: 'noun' },
      { word: 'justice', translation: 'justice', partOfSpeech: 'noun' },
      { word: 'plein gré', translation: 'free will', partOfSpeech: 'noun' },
    ],
    tags: ['chitimacha', 'historical', 'finale'],
    status: 'published',
  },
  {
    title: "L'Article Final",
    titleTranslation: 'The Final Article',
    textCategory: 'flyer',
    cefrLevel: 'B2',
    targetLanguage: 'French',
    difficulty: 'advanced',
    authorName: null,
    spawnLocationHint: 'newspaper',
    clueText: null,
    narrativeChapterId: 'ch6_the_final_chapter',
    pages: [
      {
        content: "LE COURRIER DE GRAND-PRE\nÉdition Spéciale\n\nL'ÉCRIVAIN DISPARU RETROUVÉ — LA VÉRITÉ SUR LES FAMILLES FONDATRICES\n\nJean-Luc Moreau, l'écrivain et historien local disparu depuis un mois, a été retrouvé vivant dans une cabane isolée au bord du bayou. Il s'était caché volontairement pour protéger un manuscrit explosif.\n\nLe manuscrit révèle que les terres des familles fondatrices de Grand-Pre ont été acquises par la fraude au détriment du peuple Chitimacha. Des documents originaux de 1847 prouvent que les signatures furent obtenues sous la contrainte.\n\nLa famille Beaumont n'a pas souhaité commenter.",
        contentTranslation: "THE GRAND-PRE COURIER\nSpecial Edition\n\nMISSING WRITER FOUND — THE TRUTH ABOUT THE FOUNDING FAMILIES\n\nJean-Luc Moreau, the local writer and historian who disappeared a month ago, has been found alive in an isolated cabin by the bayou. He had hidden voluntarily to protect an explosive manuscript.\n\nThe manuscript reveals that the founding families' lands in Grand-Pre were acquired through fraud at the expense of the Chitimacha people. Original documents from 1847 prove that signatures were obtained under duress.\n\nThe Beaumont family declined to comment.",
      },
    ],
    vocabularyHighlights: [
      { word: 'retrouvé', translation: 'found/recovered', partOfSpeech: 'adjective' },
      { word: 'volontairement', translation: 'voluntarily', partOfSpeech: 'adverb' },
      { word: 'explosif', translation: 'explosive', partOfSpeech: 'adjective' },
      { word: 'au détriment de', translation: 'at the expense of', partOfSpeech: 'phrase' },
      { word: 'commenter', translation: 'to comment', partOfSpeech: 'verb' },
    ],
    tags: ['newspaper', 'finale', 'resolution'],
    status: 'published',
  },
];

// Link recipes to ch2 (early game, market/food vocabulary)
const RECIPE_CHAPTER = 'ch2_following_the_trail';

async function main() {
  console.log(`\n=== Migration 053: Generate Missing Chapter Texts ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  if (!MONGO_URL) { console.error('No MONGO_URL'); process.exit(1); }
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db!;
  const textsCollection = db.collection('texts');

  // Check existing titles to avoid duplicates
  const existing = await textsCollection.find({ worldId: WORLD_ID }).toArray();
  const existingTitles = new Set(existing.map(t => t.title));

  let created = 0;
  for (const text of NEW_TEXTS) {
    if (existingTitles.has(text.title)) {
      console.log(`  SKIP: "${text.title}" (already exists)`);
      continue;
    }

    if (!DRY_RUN) {
      await textsCollection.insertOne({
        worldId: WORLD_ID,
        ...text,
        isGenerated: false,
        comprehensionQuestions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`  ✓ Created: "${text.title}" → ${text.narrativeChapterId}`);
    created++;
  }

  // Link unlinked recipes to ch2
  let recipesLinked = 0;
  const unlinkedRecipes = existing.filter(t => t.textCategory === 'recipe' && !t.narrativeChapterId);
  for (const recipe of unlinkedRecipes) {
    if (!DRY_RUN) {
      await textsCollection.updateOne(
        { _id: recipe._id },
        { $set: { narrativeChapterId: RECIPE_CHAPTER, updatedAt: new Date() } },
      );
    }
    console.log(`  ✓ Linked recipe: "${recipe.title}" → ${RECIPE_CHAPTER}`);
    recipesLinked++;
  }

  // Backfill narrativeChapterId on existing writer journal texts (from seed generator)
  const WRITER_JOURNAL_CHAPTERS: Record<string, string> = {
    'clue_1': 'ch1_assignment_abroad',
    'clue_2': 'ch3_the_inner_circle',
    'clue_3': 'ch4_hidden_messages',
    'clue_4': 'ch5_the_truth_emerges',
    'clue_5': 'ch6_the_final_chapter',
  };
  let journalsLinked = 0;
  const unlinkedJournals = existing.filter(t =>
    t.textCategory === 'journal' && !t.narrativeChapterId && Array.isArray(t.tags) && t.tags.some((tag: string) => tag.startsWith('clue_'))
  );
  for (const journal of unlinkedJournals) {
    const clueTag = (journal.tags as string[]).find((tag: string) => tag.startsWith('clue_'));
    const chapterId = clueTag ? WRITER_JOURNAL_CHAPTERS[clueTag] : null;
    if (chapterId) {
      if (!DRY_RUN) {
        await textsCollection.updateOne(
          { _id: journal._id },
          { $set: { narrativeChapterId: chapterId, updatedAt: new Date() } },
        );
      }
      console.log(`  ✓ Linked journal: "${journal.title}" → ${chapterId}`);
      journalsLinked++;
    }
  }

  console.log(`\n=== Done: ${created} texts created, ${recipesLinked} recipes linked, ${journalsLinked} journals linked ===\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
