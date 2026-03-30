#!/usr/bin/env tsx
/**
 * Migration 044: Seed physical document gametexts for clues and red herrings.
 *
 * Any narrative element that describes a physical text (letter, receipt, diary,
 * map, notebook) should have a corresponding gametext so it exists in-game.
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

const PHYSICAL_TEXTS = [
  // ── Red Herring: Torn letter ──
  {
    title: "Lettre déchirée — \"Fuite vers la côte\"",
    titleTranslation: "Torn Letter — \"Escape to the coast\"",
    textCategory: 'letter',
    cefrLevel: 'A1',
    difficulty: 'beginner',
    clueText: 'Red herring: handwriting doesn\'t match the writer\'s.',
    spawnLocationHint: 'residence',
    tags: ['red_herring', 'clue', 'letter', 'written_evidence'],
    pages: [{
      content: "Il faut partir. La côte est notre seule chance. Prenez le train de minuit et ne regardez pas en arrière. Brûlez cette lettre.",
      contentTranslation: "We must leave. The coast is our only chance. Take the midnight train and don't look back. Burn this letter."
    }],
    vocabularyHighlights: [
      { word: 'partir', translation: 'to leave', partOfSpeech: 'verb' },
      { word: 'côte', translation: 'coast', partOfSpeech: 'noun' },
      { word: 'train', translation: 'train', partOfSpeech: 'noun' },
      { word: 'brûlez', translation: 'burn', partOfSpeech: 'verb' },
    ],
    comprehensionQuestions: [{ question: 'Quel transport est mentionné?', questionTranslation: 'What transport is mentioned?', options: ['Un bateau', 'Le train de minuit', 'Un avion'], correctIndex: 1 }],
  },
  // ── Red Herring: Café receipt ──
  {
    title: "Reçu du Café du Pont",
    titleTranslation: "Café du Pont Receipt",
    textCategory: 'letter',
    cefrLevel: 'A1',
    difficulty: 'beginner',
    clueText: 'Red herring: shows two coffees, but waiter remembers only the writer alone.',
    spawnLocationHint: 'cafe',
    tags: ['red_herring', 'clue', 'receipt', 'cafe'],
    pages: [{
      content: "Café du Pont\nDate: {{settlement_name|Village}} — le jour de la disparition\n\n2x Café noir ............. 4,00€\n1x Croissant ............. 2,50€\n\nTotal: 6,50€\nMerci de votre visite!",
      contentTranslation: "Café du Pont\nDate: {{settlement_name|Village}} — the day of disappearance\n\n2x Black coffee .......... €4.00\n1x Croissant ............. €2.50\n\nTotal: €6.50\nThank you for your visit!"
    }],
    vocabularyHighlights: [
      { word: 'café', translation: 'coffee', partOfSpeech: 'noun' },
      { word: 'noir', translation: 'black', partOfSpeech: 'adjective' },
      { word: 'disparition', translation: 'disappearance', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Combien de cafés ont été commandés?', questionTranslation: 'How many coffees were ordered?', options: ['Un', 'Deux', 'Trois'], correctIndex: 1 }],
  },
  // ── Clue: Diary entry ──
  {
    title: "Page de journal intime — \"Ils savent\"",
    titleTranslation: "Diary Page — \"They know\"",
    textCategory: 'journal',
    cefrLevel: 'A2',
    difficulty: 'intermediate',
    clueText: 'Written three days before the disappearance. Shows the writer felt threatened.',
    spawnLocationHint: 'hidden',
    tags: ['main_quest', 'clue', 'diary', 'chapter:4', 'chapterId:ch4_hidden_messages'],
    pages: [{
      content: "Trois jours avant...\n\nIls savent pour le manuscrit. J'ai vu quelqu'un fouiller dans mon bureau hier soir. Je dois agir vite. Les copies sont en sécurité — dispersées chez des personnes de confiance. Si quelqu'un trouve ce journal, suivez les indices dans mon premier roman.",
      contentTranslation: "Three days before...\n\nThey know about the manuscript. I saw someone searching my office last night. I must act quickly. The copies are safe — dispersed with trusted people. If someone finds this journal, follow the clues in my first novel."
    }],
    vocabularyHighlights: [
      { word: 'manuscrit', translation: 'manuscript', partOfSpeech: 'noun' },
      { word: 'fouiller', translation: 'to search', partOfSpeech: 'verb' },
      { word: 'confiance', translation: 'trust', partOfSpeech: 'noun' },
      { word: 'indices', translation: 'clues', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: "Qu'a vu l'écrivain?", questionTranslation: 'What did the writer see?', options: ['Un animal', 'Quelqu\'un fouillant dans son bureau', 'Un ami'], correctIndex: 1 }],
  },
  // ── Clue: Map with red crosses ──
  {
    title: "Carte marquée de croix rouges",
    titleTranslation: "Map Marked with Red Crosses",
    textCategory: 'letter',
    cefrLevel: 'A2',
    difficulty: 'intermediate',
    clueText: 'Three red crosses mark locations the writer visited in secret.',
    spawnLocationHint: 'hidden',
    tags: ['main_quest', 'clue', 'map', 'chapter:4', 'chapterId:ch4_hidden_messages'],
    pages: [{
      content: "Une carte dessinée à la main de la région autour de {{settlement_name|notre village}}. Trois croix rouges marquent des endroits spécifiques — une ferme isolée, une grotte près de la côte, et un jardin derrière une vieille église. Au dos: \"Les réponses sont là où personne ne regarde.\"",
      contentTranslation: "A hand-drawn map of the region around {{settlement_name|our village}}. Three red crosses mark specific places — an isolated farm, a cave near the coast, and a garden behind an old church. On the back: \"The answers are where nobody looks.\""
    }],
    vocabularyHighlights: [
      { word: 'carte', translation: 'map', partOfSpeech: 'noun' },
      { word: 'croix', translation: 'crosses', partOfSpeech: 'noun' },
      { word: 'endroits', translation: 'places', partOfSpeech: 'noun' },
      { word: 'réponses', translation: 'answers', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Combien de croix rouges y a-t-il?', questionTranslation: 'How many red crosses are there?', options: ['Deux', 'Trois', 'Quatre'], correctIndex: 1 }],
  },
  // ── Clue: First edition with penciled note ──
  {
    title: "Première édition — Note au crayon",
    titleTranslation: "First Edition — Penciled Note",
    textCategory: 'book',
    cefrLevel: 'A1',
    difficulty: 'beginner',
    clueText: 'Inside cover has a date and "the garden remembers" in pencil.',
    spawnLocationHint: 'bookshop',
    tags: ['main_quest', 'clue', 'book', 'chapter:2', 'chapterId:ch2_following_the_trail'],
    pages: [{
      content: "Sur la page de garde, au crayon, d'une écriture tremblante:\n\n\"14 mars — le jardin se souvient.\"\n\nLe reste du livre est un roman sur les premiers habitants de la région. Mais cette note... elle ne fait pas partie de l'histoire.",
      contentTranslation: "On the title page, in pencil, in a trembling hand:\n\n\"March 14 — the garden remembers.\"\n\nThe rest of the book is a novel about the region's first inhabitants. But this note... it's not part of the story."
    }],
    vocabularyHighlights: [
      { word: 'crayon', translation: 'pencil', partOfSpeech: 'noun' },
      { word: 'jardin', translation: 'garden', partOfSpeech: 'noun' },
      { word: 'souvient', translation: 'remembers', partOfSpeech: 'verb' },
      { word: 'habitants', translation: 'inhabitants', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Que dit la note au crayon?', questionTranslation: 'What does the penciled note say?', options: ['"Bonne lecture"', '"Le jardin se souvient"', '"À bientôt"'], correctIndex: 1 }],
  },
  // ── Clue: Soggy notebook from cave ──
  {
    title: "Carnet mouillé — Notes de recherche",
    titleTranslation: "Soggy Notebook — Research Notes",
    textCategory: 'journal',
    cefrLevel: 'A2',
    difficulty: 'intermediate',
    clueText: 'Research notes about the founding families, found in a cave.',
    spawnLocationHint: 'hidden',
    tags: ['main_quest', 'clue', 'notebook', 'chapter:4', 'chapterId:ch4_hidden_messages'],
    pages: [{
      content: "Les pages sont tachées d'eau, mais on peut encore lire:\n\n\"...les familles fondatrices ont acquis ces terres par... [illisible] ...les documents originaux ont été falsifiés en 18... [illisible] ...personne ne sait ce qui est arrivé aux vrais propriétaires...\"",
      contentTranslation: "The pages are water-stained, but you can still read:\n\n\"...the founding families acquired these lands through... [illegible] ...the original documents were forged in 18... [illegible] ...no one knows what happened to the real owners...\""
    }],
    vocabularyHighlights: [
      { word: 'tachées', translation: 'stained', partOfSpeech: 'adjective' },
      { word: 'terres', translation: 'lands', partOfSpeech: 'noun' },
      { word: 'falsifiés', translation: 'forged/falsified', partOfSpeech: 'adjective' },
      { word: 'propriétaires', translation: 'owners', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Que révèlent les notes?', questionTranslation: 'What do the notes reveal?', options: ['Une recette', 'Des documents falsifiés', 'Un poème'], correctIndex: 1 }],
  },
  // ── Clue: Bench carving ──
  {
    title: "Message gravé sur un banc",
    titleTranslation: "Message Carved into a Bench",
    textCategory: 'letter',
    cefrLevel: 'A1',
    difficulty: 'beginner',
    clueText: 'Carved message signed with the writer\'s initials.',
    spawnLocationHint: 'park',
    tags: ['main_quest', 'clue', 'carving', 'chapter:2', 'chapterId:ch2_following_the_trail'],
    pages: [{
      content: "Gravé dans le bois du banc, à moitié caché par la mousse:\n\n\"La vérité est plantée ici, attendant de fleurir.\"\n\n— Initiales: {{writer_name|M.D.}}",
      contentTranslation: "Carved into the wood of the bench, half-hidden by moss:\n\n\"The truth is planted here, waiting to bloom.\"\n\n— Initials: {{writer_name|M.D.}}"
    }],
    vocabularyHighlights: [
      { word: 'gravé', translation: 'carved', partOfSpeech: 'adjective' },
      { word: 'banc', translation: 'bench', partOfSpeech: 'noun' },
      { word: 'vérité', translation: 'truth', partOfSpeech: 'noun' },
      { word: 'fleurir', translation: 'to bloom', partOfSpeech: 'verb' },
    ],
    comprehensionQuestions: [{ question: 'Où est gravé le message?', questionTranslation: 'Where is the message carved?', options: ['Sur un arbre', 'Sur un banc', 'Sur un mur'], correctIndex: 1 }],
  },
];

async function run() {
  const mongoUrl = process.env.MONGO_URL!;
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  const worlds = await db.collection('worlds').find({}).limit(1).toArray();
  const worldId = worlds[0]?._id?.toString();
  if (!worldId) { console.error('No world found'); process.exit(1); }

  console.log(dryRun ? '🔍 DRY RUN\n' : '📦 SEEDING\n');
  console.log(`World: ${worldId}`);
  console.log(`${PHYSICAL_TEXTS.length} physical document texts to seed\n`);

  const existingTitles = new Set(
    (await db.collection('gametexts').find({ worldId }, { projection: { title: 1 } }).toArray()).map(t => t.title)
  );

  const toInsert = PHYSICAL_TEXTS.filter(t => !existingTitles.has(t.title));
  console.log(`Already exist: ${PHYSICAL_TEXTS.length - toInsert.length}`);
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
