#!/usr/bin/env tsx
/**
 * Migration 042: Seed notice board templates as gametexts.
 *
 * Converts the hardcoded NoticeGenerator templates into gametexts with
 * {{variable|fallback}} template syntax. These are editable in the Texts UI
 * and resolved at game startup with current world data.
 *
 * Usage: npx tsx server/migrations/042-seed-notice-gametexts.ts [--dry-run]
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

interface NoticeGameText {
  title: string;
  titleTranslation: string;
  textCategory: string;
  pages: Array<{ content: string; contentTranslation: string }>;
  vocabularyHighlights: Array<{ word: string; translation: string; partOfSpeech: string }>;
  comprehensionQuestions: Array<{ question: string; questionTranslation: string; options: string[]; correctIndex: number }>;
  cefrLevel: string;
  targetLanguage: string;
  difficulty: string;
  tags: string[];
  status: string;
  isGenerated: boolean;
}

// Convert NoticeGenerator templates to gametext format with {{variable|fallback}} syntax
const NOTICE_TEMPLATES: NoticeGameText[] = [
  // ── Merchant (beginner) ──
  {
    title: 'Boutique de {{npc_name|le marchand}}',
    titleTranslation: "{{npc_name|the merchant}}'s Shop",
    textCategory: 'flyer',
    pages: [{
      content: '{{npc_name|Le marchand}} vend des marchandises à {{settlement_name|notre village}}. Nous avons des vêtements, des outils, et des provisions. Venez voir!',
      contentTranslation: '{{npc_name|The merchant}} sells goods in {{settlement_name|our village}}. We have clothing, tools, and provisions. Come see!'
    }],
    vocabularyHighlights: [
      { word: 'marchandises', translation: 'goods', partOfSpeech: 'noun' },
      { word: 'vêtements', translation: 'clothing', partOfSpeech: 'noun' },
      { word: 'outils', translation: 'tools', partOfSpeech: 'noun' },
      { word: 'provisions', translation: 'provisions', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Que vend cette boutique?', questionTranslation: 'What does this shop sell?', options: ['Des animaux', 'Des vêtements et des outils', 'Des livres'], correctIndex: 1 }],
    cefrLevel: 'A1', targetLanguage: 'French', difficulty: 'beginner',
    tags: ['notice', 'advertisement', 'merchant', 'shopkeeper', 'vendor', 'trader'], status: 'published', isGenerated: false,
  },
  // ── Baker (beginner) ──
  {
    title: 'Pain frais chez {{npc_name|le boulanger}}',
    titleTranslation: "Fresh Bread at {{npc_name|the baker}}'s",
    textCategory: 'flyer',
    pages: [{
      content: '{{npc_name|Le boulanger}} prépare du pain chaque matin. Du pain blanc, du pain complet, et des croissants. Ouvert de six heures à midi.',
      contentTranslation: '{{npc_name|The baker}} bakes bread every morning. White bread, whole wheat bread, and croissants. Open from six o\'clock to noon.'
    }],
    vocabularyHighlights: [
      { word: 'pain', translation: 'bread', partOfSpeech: 'noun' },
      { word: 'matin', translation: 'morning', partOfSpeech: 'noun' },
      { word: 'blanc', translation: 'white', partOfSpeech: 'adjective' },
      { word: 'midi', translation: 'noon', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'À quelle heure ouvre la boulangerie?', questionTranslation: 'What time does the bakery open?', options: ['À huit heures', 'À six heures', 'À dix heures'], correctIndex: 1 }],
    cefrLevel: 'A1', targetLanguage: 'French', difficulty: 'beginner',
    tags: ['notice', 'advertisement', 'baker', 'boulanger'], status: 'published', isGenerated: false,
  },
  // ── Farmer (beginner) ──
  {
    title: 'Fruits et Légumes Frais',
    titleTranslation: 'Fresh Fruits and Vegetables',
    textCategory: 'flyer',
    pages: [{
      content: '{{npc_name|Le fermier}} vend des fruits et des légumes de sa ferme. Tout est frais et naturel. Venez au marché le matin!',
      contentTranslation: '{{npc_name|The farmer}} sells fruits and vegetables from the farm. Everything is fresh and natural. Come to the market in the morning!'
    }],
    vocabularyHighlights: [
      { word: 'légumes', translation: 'vegetables', partOfSpeech: 'noun' },
      { word: 'ferme', translation: 'farm', partOfSpeech: 'noun' },
      { word: 'frais', translation: 'fresh', partOfSpeech: 'adjective' },
      { word: 'naturel', translation: 'natural', partOfSpeech: 'adjective' },
    ],
    comprehensionQuestions: [{ question: "D'où viennent les légumes?", questionTranslation: 'Where do the vegetables come from?', options: ['Du magasin', 'De la ferme', "D'un autre pays"], correctIndex: 1 }],
    cefrLevel: 'A1', targetLanguage: 'French', difficulty: 'beginner',
    tags: ['notice', 'flyer', 'farmer', 'fermier', 'agricultor'], status: 'published', isGenerated: false,
  },
  // ── Guard (intermediate) ──
  {
    title: 'Sécurité de {{settlement_name|notre village}}',
    titleTranslation: '{{settlement_name|Our Village}} Security',
    textCategory: 'notice',
    pages: [{
      content: '{{npc_name|Le garde}}, garde de {{settlement_name|notre village}}, rappelle aux habitants de verrouiller leurs portes la nuit. Des voyageurs inconnus ont été aperçus dans la région. Signalez toute activité suspecte.',
      contentTranslation: '{{npc_name|The guard}}, guard of {{settlement_name|our village}}, reminds inhabitants to lock their doors at night. Unknown travelers have been seen in the area. Report any suspicious activity.'
    }],
    vocabularyHighlights: [
      { word: 'sécurité', translation: 'security', partOfSpeech: 'noun' },
      { word: 'verrouiller', translation: 'to lock', partOfSpeech: 'verb' },
      { word: 'portes', translation: 'doors', partOfSpeech: 'noun' },
      { word: 'voyageurs', translation: 'travelers', partOfSpeech: 'noun' },
      { word: 'suspecte', translation: 'suspicious', partOfSpeech: 'adjective' },
    ],
    comprehensionQuestions: [{ question: 'Que doivent faire les habitants?', questionTranslation: 'What should inhabitants do?', options: ['Partir du village', 'Verrouiller leurs portes', 'Acheter des armes'], correctIndex: 1 }],
    cefrLevel: 'A2', targetLanguage: 'French', difficulty: 'intermediate',
    tags: ['notice', 'official', 'guard', 'soldier', 'sheriff', 'constable', 'watchman'], status: 'published', isGenerated: false,
  },
  // ── Mayor (intermediate) ──
  {
    title: 'Annonce du Conseil de {{settlement_name|notre village}}',
    titleTranslation: '{{settlement_name|Our Village}} Council Announcement',
    textCategory: 'notice',
    pages: [{
      content: 'Le conseil de {{settlement_name|notre village}} organise une assemblée publique pour discuter des projets du village. Tous les habitants sont invités à donner leur avis. La réunion aura lieu à la mairie.',
      contentTranslation: 'The {{settlement_name|our village}} council is organizing a public assembly to discuss village projects. All inhabitants are invited to give their opinion. The meeting will be held at the town hall.'
    }],
    vocabularyHighlights: [
      { word: 'assemblée', translation: 'assembly', partOfSpeech: 'noun' },
      { word: 'projets', translation: 'projects', partOfSpeech: 'noun' },
      { word: 'habitants', translation: 'inhabitants', partOfSpeech: 'noun' },
      { word: 'avis', translation: 'opinion', partOfSpeech: 'noun' },
      { word: 'mairie', translation: 'town hall', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Où aura lieu la réunion?', questionTranslation: 'Where will the meeting be held?', options: ['Au marché', 'À la mairie', "À l'église"], correctIndex: 1 }],
    cefrLevel: 'A2', targetLanguage: 'French', difficulty: 'intermediate',
    tags: ['notice', 'official', 'mayor', 'official', 'magistrate', 'councillor'], status: 'published', isGenerated: false,
  },
  // ── Blacksmith (intermediate) ──
  {
    title: 'La Forge de {{npc_name|le forgeron}}',
    titleTranslation: "{{npc_name|the blacksmith}}'s Forge",
    textCategory: 'flyer',
    pages: [{
      content: '{{npc_name|Le forgeron}} répare les outils et fabrique des objets en métal. Apportez vos outils cassés. Les réparations prennent un à trois jours selon le travail nécessaire.',
      contentTranslation: '{{npc_name|The blacksmith}} repairs tools and crafts metal objects. Bring your broken tools. Repairs take one to three days depending on the work needed.'
    }],
    vocabularyHighlights: [
      { word: 'répare', translation: 'repairs', partOfSpeech: 'verb' },
      { word: 'outils', translation: 'tools', partOfSpeech: 'noun' },
      { word: 'métal', translation: 'metal', partOfSpeech: 'noun' },
      { word: 'cassés', translation: 'broken', partOfSpeech: 'adjective' },
      { word: 'travail', translation: 'work', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Combien de temps prennent les réparations?', questionTranslation: 'How long do repairs take?', options: ['Une heure', 'Un à trois jours', 'Une semaine'], correctIndex: 1 }],
    cefrLevel: 'A2', targetLanguage: 'French', difficulty: 'intermediate',
    tags: ['notice', 'advertisement', 'blacksmith', 'forgeron', 'smith', 'metalworker'], status: 'published', isGenerated: false,
  },
  // ── Doctor (intermediate) ──
  {
    title: 'Cabinet de {{npc_name|le médecin}}',
    titleTranslation: "{{npc_name|the doctor}}'s Practice",
    textCategory: 'flyer',
    pages: [{
      content: '{{npc_name|Le médecin}} soigne les malades de {{settlement_name|notre village}}. Consultations tous les jours sauf le dimanche. En cas d\'urgence, venez directement. Apportez vos remèdes si vous en avez.',
      contentTranslation: '{{npc_name|The doctor}} treats the sick of {{settlement_name|our village}}. Consultations every day except Sunday. In case of emergency, come directly. Bring your remedies if you have any.'
    }],
    vocabularyHighlights: [
      { word: 'soigne', translation: 'treats/heals', partOfSpeech: 'verb' },
      { word: 'malades', translation: 'sick people', partOfSpeech: 'noun' },
      { word: 'urgence', translation: 'emergency', partOfSpeech: 'noun' },
      { word: 'remèdes', translation: 'remedies', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Quel jour le cabinet est-il fermé?', questionTranslation: 'Which day is the practice closed?', options: ['Le lundi', 'Le samedi', 'Le dimanche'], correctIndex: 2 }],
    cefrLevel: 'A2', targetLanguage: 'French', difficulty: 'intermediate',
    tags: ['notice', 'flyer', 'doctor', 'healer', 'physician', 'apothecary', 'herbalist', 'médecin'], status: 'published', isGenerated: false,
  },
  // ── Teacher (advanced) ──
  {
    title: 'Cours dispensés par {{npc_name|le professeur}}',
    titleTranslation: 'Lessons by {{npc_name|the teacher}}',
    textCategory: 'notice',
    pages: [{
      content: '{{npc_name|Le professeur}} propose des cours de lecture et d\'écriture aux habitants de {{settlement_name|notre village}}. Les leçons sont adaptées à tous les niveaux, des débutants aux plus avancés. L\'éducation est la clé de notre prospérité commune.',
      contentTranslation: '{{npc_name|The teacher}} offers reading and writing lessons to the inhabitants of {{settlement_name|our village}}. Lessons are adapted to all levels, from beginners to advanced. Education is the key to our shared prosperity.'
    }],
    vocabularyHighlights: [
      { word: 'cours', translation: 'lessons/classes', partOfSpeech: 'noun' },
      { word: 'écriture', translation: 'writing', partOfSpeech: 'noun' },
      { word: 'niveaux', translation: 'levels', partOfSpeech: 'noun' },
      { word: 'éducation', translation: 'education', partOfSpeech: 'noun' },
      { word: 'prospérité', translation: 'prosperity', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'À qui sont destinés les cours?', questionTranslation: 'Who are the lessons for?', options: ['Seulement les enfants', 'Tous les niveaux', 'Les experts uniquement'], correctIndex: 1 }],
    cefrLevel: 'B1', targetLanguage: 'French', difficulty: 'advanced',
    tags: ['notice', 'advertisement', 'teacher', 'scholar', 'professor', 'librarian', 'tutor'], status: 'published', isGenerated: false,
  },
  // ── Priest (advanced) ──
  {
    title: 'Appel à la Communauté',
    titleTranslation: 'Call to the Community',
    textCategory: 'notice',
    pages: [{
      content: '{{npc_name|Le prêtre}} invite les habitants de {{settlement_name|notre village}} à se rassembler pour une cérémonie de bénédiction des récoltes. Cette tradition ancienne renforce les liens de notre communauté et honore le travail de nos agriculteurs. Chacun est le bienvenu.',
      contentTranslation: '{{npc_name|The priest}} invites the inhabitants of {{settlement_name|our village}} to gather for a harvest blessing ceremony. This ancient tradition strengthens the bonds of our community and honors the work of our farmers. Everyone is welcome.'
    }],
    vocabularyHighlights: [
      { word: 'cérémonie', translation: 'ceremony', partOfSpeech: 'noun' },
      { word: 'bénédiction', translation: 'blessing', partOfSpeech: 'noun' },
      { word: 'récoltes', translation: 'harvests', partOfSpeech: 'noun' },
      { word: 'tradition', translation: 'tradition', partOfSpeech: 'noun' },
      { word: 'communauté', translation: 'community', partOfSpeech: 'noun' },
    ],
    comprehensionQuestions: [{ question: 'Quel est le but de la cérémonie?', questionTranslation: 'What is the purpose of the ceremony?', options: ['Vendre des produits', 'Bénir les récoltes', 'Élire un nouveau maire'], correctIndex: 1 }],
    cefrLevel: 'B1', targetLanguage: 'French', difficulty: 'advanced',
    tags: ['notice', 'official', 'priest', 'cleric', 'monk', 'nun', 'chaplain', 'prêtre'], status: 'published', isGenerated: false,
  },
];

async function run() {
  const mongoUrl = process.env.MONGO_URL!;
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  console.log(dryRun ? '🔍 DRY RUN\n' : '📦 SEEDING\n');
  console.log(`${NOTICE_TEMPLATES.length} notice templates to seed\n`);

  // Check which already exist (by title)
  const existingTitles = new Set(
    (await db.collection('gametexts').find({}, { projection: { title: 1 } }).toArray())
      .map(t => t.title)
  );

  const toInsert = NOTICE_TEMPLATES.filter(t => !existingTitles.has(t.title));
  console.log(`Already exist: ${NOTICE_TEMPLATES.length - toInsert.length}`);
  console.log(`New to insert: ${toInsert.length}`);

  if (toInsert.length > 0 && !dryRun) {
    const docs = toInsert.map(t => ({
      ...t,
      worldId: null, // Base templates available to all worlds
      authorName: null,
      clueText: null,
      spawnLocationHint: 'notice_board',
      generationPrompt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const result = await db.collection('gametexts').insertMany(docs);
    console.log(`\n✅ Inserted ${result.insertedCount} notice templates`);
  } else if (toInsert.length > 0) {
    for (const t of toInsert) console.log(`  ${t.title} (${t.textCategory}, ${t.cefrLevel})`);
  }

  const total = await db.collection('gametexts').countDocuments();
  console.log(`\nTotal gametexts: ${total}`);

  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
