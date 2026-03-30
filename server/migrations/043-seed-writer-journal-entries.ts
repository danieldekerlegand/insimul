#!/usr/bin/env tsx
/**
 * Migration 043: Seed writer's journal entries and clue letters as gametexts.
 *
 * Creates 6 journal entries (one per main quest chapter) from the missing
 * writer's perspective, plus 6 clue letters. These are collectible documents
 * that advance the main quest's collect_text objectives and reveal the mystery
 * progressively.
 *
 * Uses {{variable|fallback}} template syntax for character/settlement names.
 *
 * Usage: npx tsx server/migrations/043-seed-writer-journal-entries.ts [--dry-run] [--worldId=xxx]
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
const worldIdArg = process.argv.find(a => a.startsWith('--worldId='))?.split('=')[1];

const WRITER_JOURNAL_ENTRIES = [
  // ── Chapter 1: Assignment Abroad ──
  {
    title: "Journal de {{writer_name|l'écrivain}} — Entrée 1",
    titleTranslation: "{{writer_name|The Writer}}'s Journal — Entry 1",
    textCategory: 'journal',
    cefrLevel: 'A1',
    difficulty: 'beginner',
    clueText: 'The writer mentions receiving a strange letter about the founding families.',
    spawnLocationHint: 'residence',
    tags: ['main_quest', 'chapter:1', 'chapterId:ch1_assignment_abroad', 'writer_journal', 'clue'],
    pages: [{
      content: "Aujourd'hui j'ai reçu une lettre étrange. Quelqu'un connaît mon travail sur les familles fondatrices de {{settlement_name|notre village}}. Ils disent que j'approche de la vérité. Quelle vérité?",
      contentTranslation: "Today I received a strange letter. Someone knows about my work on the founding families of {{settlement_name|our village}}. They say I'm getting close to the truth. What truth?"
    }],
    vocabularyHighlights: [
      { word: 'lettre', translation: 'letter', partOfSpeech: 'noun' },
      { word: 'étrange', translation: 'strange', partOfSpeech: 'adjective' },
      { word: 'vérité', translation: 'truth', partOfSpeech: 'noun' },
      { word: 'familles', translation: 'families', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: "Qu'a reçu l'écrivain?", questionTranslation: 'What did the writer receive?', options: ['Un cadeau', 'Une lettre étrange', 'Un livre'], correctIndex: 1 }],
  },
  // ── Chapter 2: Following the Trail ──
  {
    title: "Journal de {{writer_name|l'écrivain}} — Entrée 2",
    titleTranslation: "{{writer_name|The Writer}}'s Journal — Entry 2",
    textCategory: 'journal',
    cefrLevel: 'A1',
    difficulty: 'beginner',
    clueText: 'The writer discovered old documents hidden in a garden shed.',
    spawnLocationHint: 'bookshop',
    tags: ['main_quest', 'chapter:2', 'chapterId:ch2_following_the_trail', 'writer_journal', 'clue'],
    pages: [{
      content: "J'ai trouvé des documents anciens dans le jardin, cachés sous le plancher d'un vieux cabanon. Des actes de propriété datant de la fondation de {{settlement_name|notre village}}. Les noms sur les actes... ce ne sont pas ceux que l'on connaît.",
      contentTranslation: "I found old documents in the garden, hidden under the floor of an old shed. Property deeds dating from the founding of {{settlement_name|our village}}. The names on the deeds... they're not the ones we know."
    }],
    vocabularyHighlights: [
      { word: 'documents', translation: 'documents', partOfSpeech: 'noun' },
      { word: 'jardin', translation: 'garden', partOfSpeech: 'noun' },
      { word: 'cachés', translation: 'hidden', partOfSpeech: 'adjective' },
      { word: 'fondation', translation: 'founding', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Où les documents étaient-ils cachés?', questionTranslation: 'Where were the documents hidden?', options: ['Dans la bibliothèque', 'Sous le plancher du cabanon', 'Dans une boîte'], correctIndex: 1 }],
  },
  // ── Chapter 3: The Inner Circle ──
  {
    title: "Journal de {{writer_name|l'écrivain}} — Entrée 3",
    titleTranslation: "{{writer_name|The Writer}}'s Journal — Entry 3",
    textCategory: 'journal',
    cefrLevel: 'A2',
    difficulty: 'intermediate',
    clueText: 'The writer suspects the patron is hiding something about the manuscript.',
    spawnLocationHint: 'cafe',
    tags: ['main_quest', 'chapter:3', 'chapterId:ch3_the_inner_circle', 'writer_journal', 'clue'],
    pages: [{
      content: "Mon éditeur me conseille la prudence. Il dit que certaines personnes puissantes ne veulent pas que ce livre soit publié. Le patron qui finance mes recherches... je commence à douter de ses intentions. Pourquoi s'intéresse-t-il autant à mon manuscrit?",
      contentTranslation: "My editor advises caution. He says certain powerful people don't want this book published. The patron who funds my research... I'm starting to doubt his intentions. Why is he so interested in my manuscript?"
    }],
    vocabularyHighlights: [
      { word: 'prudence', translation: 'caution', partOfSpeech: 'noun' },
      { word: 'puissantes', translation: 'powerful', partOfSpeech: 'adjective' },
      { word: 'douter', translation: 'to doubt', partOfSpeech: 'verb' },
      { word: 'manuscrit', translation: 'manuscript', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: "De quoi l'écrivain commence-t-il à douter?", questionTranslation: 'What does the writer begin to doubt?', options: ['De son talent', 'Des intentions du patron', 'De la qualité du café'], correctIndex: 1 }],
  },
  // ── Chapter 4: Hidden Connections ──
  {
    title: "Journal de {{writer_name|l'écrivain}} — Entrée 4",
    titleTranslation: "{{writer_name|The Writer}}'s Journal — Entry 4",
    textCategory: 'journal',
    cefrLevel: 'A2',
    difficulty: 'intermediate',
    clueText: 'The writer found coded messages in their own first novel.',
    spawnLocationHint: 'library',
    tags: ['main_quest', 'chapter:4', 'chapterId:ch4_hidden_connections', 'writer_journal', 'clue'],
    pages: [{
      content: "Incroyable. En relisant mon premier roman, j'ai découvert quelque chose que j'avais oublié — ou peut-être que je ne l'avais jamais remarqué consciemment. Les premières lettres de chaque chapitre forment un message. Un message que quelqu'un d'autre a caché dans mon propre livre.",
      contentTranslation: "Incredible. Rereading my first novel, I discovered something I had forgotten — or perhaps never consciously noticed. The first letters of each chapter form a message. A message that someone else hid in my own book."
    }],
    vocabularyHighlights: [
      { word: 'incroyable', translation: 'incredible', partOfSpeech: 'adjective' },
      { word: 'découvert', translation: 'discovered', partOfSpeech: 'verb' },
      { word: 'lettres', translation: 'letters', partOfSpeech: 'noun' },
      { word: 'message', translation: 'message', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: "Qu'a découvert l'écrivain dans son roman?", questionTranslation: 'What did the writer discover in their novel?', options: ['Une erreur', 'Un message caché', 'Un dessin'], correctIndex: 1 }],
  },
  // ── Chapter 5: The Reckoning ──
  {
    title: "Journal de {{writer_name|l'écrivain}} — Entrée 5",
    titleTranslation: "{{writer_name|The Writer}}'s Journal — Entry 5",
    textCategory: 'journal',
    cefrLevel: 'B1',
    difficulty: 'advanced',
    clueText: 'The writer decided to go into hiding to protect the manuscript.',
    spawnLocationHint: 'hidden',
    tags: ['main_quest', 'chapter:5', 'chapterId:ch5_the_reckoning', 'writer_journal', 'clue'],
    pages: [{
      content: "C'est décidé. Je dois disparaître. Le manuscrit est trop important pour être détruit, et je sais maintenant que certaines personnes feront tout pour l'empêcher d'être publié. J'ai confié des copies à des personnes de confiance. Si quelqu'un lit ces mots, suivez les indices. La vérité doit être connue.",
      contentTranslation: "It's decided. I must disappear. The manuscript is too important to be destroyed, and I now know that certain people will do anything to prevent it from being published. I've entrusted copies to trusted people. If someone reads these words, follow the clues. The truth must be known."
    }],
    vocabularyHighlights: [
      { word: 'disparaître', translation: 'to disappear', partOfSpeech: 'verb' },
      { word: 'détruit', translation: 'destroyed', partOfSpeech: 'adjective' },
      { word: 'confiance', translation: 'trust', partOfSpeech: 'noun' },
      { word: 'indices', translation: 'clues', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: "Pourquoi l'écrivain veut-il disparaître?", questionTranslation: 'Why does the writer want to disappear?', options: ['Il est fatigué', 'Pour protéger le manuscrit', 'Pour voyager'], correctIndex: 1 }],
  },
  // ── Chapter 6: The Final Chapter ──
  {
    title: "Journal de {{writer_name|l'écrivain}} — Dernière entrée",
    titleTranslation: "{{writer_name|The Writer}}'s Journal — Final Entry",
    textCategory: 'journal',
    cefrLevel: 'B1',
    difficulty: 'advanced',
    clueText: 'The writer reveals their hiding location in a final cryptic entry.',
    spawnLocationHint: 'hidden',
    tags: ['main_quest', 'chapter:6', 'chapterId:ch6_the_final_chapter', 'writer_journal', 'clue', 'final_revelation'],
    pages: [{
      content: "À celui ou celle qui trouvera ce journal: le manuscrit est complet. Il contient la vérité sur les fondateurs de {{settlement_name|notre village}}, sur les mensonges qui ont bâti la prospérité de certains, et sur les vies qui ont été sacrifiées. Je suis en sécurité. Cherchez-moi là où les premiers mots ont été écrits.",
      contentTranslation: "To whoever finds this journal: the manuscript is complete. It contains the truth about the founders of {{settlement_name|our village}}, about the lies that built the prosperity of some, and about the lives that were sacrificed. I am safe. Look for me where the first words were written."
    }],
    vocabularyHighlights: [
      { word: 'complet', translation: 'complete', partOfSpeech: 'adjective' },
      { word: 'mensonges', translation: 'lies', partOfSpeech: 'noun' },
      { word: 'prospérité', translation: 'prosperity', partOfSpeech: 'noun' },
      { word: 'sacrifiées', translation: 'sacrificed', partOfSpeech: 'adjective' },
    ],
    comprehensionQuestions: [{ question: 'Où faut-il chercher l\'écrivain?', questionTranslation: 'Where should you look for the writer?', options: ['Au café', 'Là où les premiers mots ont été écrits', 'À la mairie'], correctIndex: 1 }],
  },
];

// Clue letters — found at various locations, provide additional context
const CLUE_LETTERS = [
  {
    title: "Lettre anonyme — \"Arrêtez vos recherches\"",
    titleTranslation: "Anonymous Letter — \"Stop your research\"",
    textCategory: 'letter',
    cefrLevel: 'A1',
    difficulty: 'beginner',
    spawnLocationHint: 'residence',
    tags: ['main_quest', 'chapter:1', 'clue', 'letter', 'threatening'],
    pages: [{
      content: "Vous posez trop de questions. {{settlement_name|Ce village}} a ses secrets, et certains secrets doivent rester cachés. Arrêtez vos recherches si vous tenez à votre tranquillité.",
      contentTranslation: "You're asking too many questions. {{settlement_name|This village}} has its secrets, and some secrets must stay hidden. Stop your research if you value your peace."
    }],
    vocabularyHighlights: [
      { word: 'questions', translation: 'questions', partOfSpeech: 'noun' },
      { word: 'secrets', translation: 'secrets', partOfSpeech: 'noun' },
      { word: 'cachés', translation: 'hidden', partOfSpeech: 'adjective' },
    ],
    comprehensionQuestions: [{ question: 'Que demande la lettre?', questionTranslation: 'What does the letter ask?', options: ["D'écrire un livre", "D'arrêter les recherches", 'De partir en vacances'], correctIndex: 1 }],
  },
  {
    title: "Lettre de l'éditeur à {{writer_name|l'écrivain}}",
    titleTranslation: "Letter from the editor to {{writer_name|the writer}}",
    textCategory: 'letter',
    cefrLevel: 'A2',
    difficulty: 'intermediate',
    spawnLocationHint: 'office',
    tags: ['main_quest', 'chapter:3', 'clue', 'letter', 'editor'],
    pages: [{
      content: "Cher {{writer_name|ami}}, je vous en prie, soyez prudent. Les trois premiers chapitres que vous m'avez envoyés sont extraordinaires — mais aussi dangereux. Si ce que vous écrivez est vrai, des personnes très influentes voudront vous faire taire. Détruisez cette lettre après l'avoir lue.",
      contentTranslation: "Dear {{writer_name|friend}}, I beg you, be careful. The first three chapters you sent me are extraordinary — but also dangerous. If what you write is true, very influential people will want to silence you. Destroy this letter after reading it."
    }],
    vocabularyHighlights: [
      { word: 'prudent', translation: 'careful', partOfSpeech: 'adjective' },
      { word: 'dangereux', translation: 'dangerous', partOfSpeech: 'adjective' },
      { word: 'influentes', translation: 'influential', partOfSpeech: 'adjective' },
      { word: 'détruisez', translation: 'destroy', partOfSpeech: 'verb' },
    ],
    comprehensionQuestions: [{ question: "Que demande l'éditeur?", questionTranslation: 'What does the editor ask?', options: ["D'écrire plus vite", "D'être prudent", "De publier immédiatement"], correctIndex: 1 }],
  },
];

async function run() {
  const mongoUrl = process.env.MONGO_URL!;
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  // Determine worldId
  let worldId = worldIdArg;
  if (!worldId) {
    const worlds = await db.collection('worlds').find({}).limit(1).toArray();
    worldId = worlds[0]?._id?.toString();
  }
  if (!worldId) {
    console.error('No worldId found. Pass --worldId=xxx');
    process.exit(1);
  }

  console.log(dryRun ? '🔍 DRY RUN\n' : '📦 SEEDING\n');
  console.log(`World: ${worldId}`);

  const allTexts = [...WRITER_JOURNAL_ENTRIES, ...CLUE_LETTERS];
  console.log(`${allTexts.length} texts to seed (${WRITER_JOURNAL_ENTRIES.length} journal entries + ${CLUE_LETTERS.length} clue letters)\n`);

  // Check existing
  const existingTitles = new Set(
    (await db.collection('gametexts').find({ worldId }, { projection: { title: 1 } }).toArray())
      .map(t => t.title)
  );

  const toInsert = allTexts.filter(t => !existingTitles.has(t.title));
  console.log(`Already exist: ${allTexts.length - toInsert.length}`);
  console.log(`New to insert: ${toInsert.length}`);

  if (toInsert.length > 0 && !dryRun) {
    const docs = toInsert.map(t => ({
      ...t,
      worldId,
      targetLanguage: 'French',
      authorName: null,
      isGenerated: false,
      generationPrompt: null,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const result = await db.collection('gametexts').insertMany(docs);
    console.log(`\n✅ Inserted ${result.insertedCount} texts`);
  } else if (toInsert.length > 0) {
    for (const t of toInsert) console.log(`  ${t.title} (${t.textCategory}, ${t.cefrLevel})`);
  }

  const total = await db.collection('gametexts').countDocuments({ worldId });
  console.log(`\nTotal gametexts for world: ${total}`);

  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
