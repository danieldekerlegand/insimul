/**
 * Notice Generator
 *
 * Generates diverse notice board articles authored by NPCs from a settlement.
 * Notices span all difficulty levels, cover various notice types, and include
 * vocabulary words and comprehension questions for language learning.
 *
 * Also generates longer literary documents (stories, poems) for world placement.
 */

import type { NoticeArticle } from './BabylonNoticeBoardPanel';

interface NPCAuthorInfo {
  characterId: string;
  name: string;
  occupation?: string;
}

// ── Notice templates by occupation and difficulty ────────────────────────────

interface NoticeTemplate {
  titleFn: (npc: NPCAuthorInfo, settlement: string) => string;
  titleTransFn: (npc: NPCAuthorInfo, settlement: string) => string;
  bodyFn: (npc: NPCAuthorInfo, settlement: string) => string;
  bodyTransFn: (npc: NPCAuthorInfo, settlement: string) => string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  noticeType: 'letter' | 'flyer' | 'official' | 'wanted' | 'advertisement';
  vocabularyWords: { word: string; meaning: string }[];
  comprehensionQuestion: {
    question: string;
    questionTranslation: string;
    options: string[];
    correctIndex: number;
  };
  questHook?: {
    questId: string;
    questTitle: string;
    questTitleTranslation: string;
  };
}

const NOTICE_TEMPLATES: NoticeTemplate[] = [
  // ── BEGINNER notices ──
  {
    titleFn: () => 'Le Marché du Village',
    titleTransFn: () => 'The Village Market',
    bodyFn: (_npc, s) => `Le marché de ${s} est ouvert tous les jours. Venez acheter du pain, du fromage, et des fruits frais. Les prix sont bons!`,
    bodyTransFn: (_npc, s) => `The ${s} market is open every day. Come buy bread, cheese, and fresh fruits. The prices are good!`,
    difficulty: 'beginner',
    noticeType: 'flyer',
    vocabularyWords: [
      { word: 'marché', meaning: 'market' },
      { word: 'pain', meaning: 'bread' },
      { word: 'fromage', meaning: 'cheese' },
      { word: 'fruits', meaning: 'fruits' },
    ],
    comprehensionQuestion: {
      question: 'Quand est-ce que le marché est ouvert?',
      questionTranslation: 'When is the market open?',
      options: ['Le lundi', 'Tous les jours', 'Le weekend'],
      correctIndex: 1,
    },
  },
  {
    titleFn: () => 'Chien Perdu!',
    titleTransFn: () => 'Lost Dog!',
    bodyFn: (npc) => `Mon chien est perdu! Il est petit et brun. Il s'appelle Max. Si vous le trouvez, venez chez ${npc.name}. Merci beaucoup!`,
    bodyTransFn: (npc) => `My dog is lost! He is small and brown. His name is Max. If you find him, come to ${npc.name}'s house. Thank you very much!`,
    difficulty: 'beginner',
    noticeType: 'flyer',
    vocabularyWords: [
      { word: 'chien', meaning: 'dog' },
      { word: 'perdu', meaning: 'lost' },
      { word: 'petit', meaning: 'small' },
      { word: 'brun', meaning: 'brown' },
      { word: 'merci', meaning: 'thank you' },
    ],
    comprehensionQuestion: {
      question: 'Comment s\'appelle le chien?',
      questionTranslation: 'What is the dog\'s name?',
      options: ['Rex', 'Max', 'Buddy'],
      correctIndex: 1,
    },
    questHook: {
      questId: 'quest_find_dog',
      questTitle: 'Trouver le chien perdu',
      questTitleTranslation: 'Find the lost dog',
    },
  },
  {
    titleFn: () => 'Leçons de Musique',
    titleTransFn: () => 'Music Lessons',
    bodyFn: (npc) => `${npc.name} donne des leçons de musique. Le piano et la guitare. Les leçons sont le mardi et le jeudi. Venez apprendre!`,
    bodyTransFn: (npc) => `${npc.name} gives music lessons. Piano and guitar. Lessons are on Tuesday and Thursday. Come learn!`,
    difficulty: 'beginner',
    noticeType: 'advertisement',
    vocabularyWords: [
      { word: 'musique', meaning: 'music' },
      { word: 'leçons', meaning: 'lessons' },
      { word: 'piano', meaning: 'piano' },
      { word: 'guitare', meaning: 'guitar' },
      { word: 'apprendre', meaning: 'to learn' },
    ],
    comprehensionQuestion: {
      question: 'Quels jours sont les leçons?',
      questionTranslation: 'What days are the lessons?',
      options: ['Lundi et mercredi', 'Mardi et jeudi', 'Samedi et dimanche'],
      correctIndex: 1,
    },
  },
  {
    titleFn: () => 'La Boulangerie Est Ouverte',
    titleTransFn: () => 'The Bakery Is Open',
    bodyFn: (npc) => `La boulangerie de ${npc.name} est ouverte du lundi au samedi, de sept heures à dix-huit heures. Nous avons du pain frais, des croissants, et des gâteaux.`,
    bodyTransFn: (npc) => `${npc.name}'s bakery is open Monday through Saturday, from seven o'clock to six o'clock. We have fresh bread, croissants, and cakes.`,
    difficulty: 'beginner',
    noticeType: 'advertisement',
    vocabularyWords: [
      { word: 'boulangerie', meaning: 'bakery' },
      { word: 'ouverte', meaning: 'open' },
      { word: 'croissants', meaning: 'croissants' },
      { word: 'gâteaux', meaning: 'cakes' },
    ],
    comprehensionQuestion: {
      question: 'La boulangerie est ouverte quel jour?',
      questionTranslation: 'The bakery is open which day?',
      options: ['Le dimanche', 'Du lundi au samedi', 'Seulement le mardi'],
      correctIndex: 1,
    },
  },
  // ── INTERMEDIATE notices ──
  {
    titleFn: () => 'Bienvenue aux Nouveaux Arrivants',
    titleTransFn: () => 'Welcome to Newcomers',
    bodyFn: (_npc, s) => `Le conseil de ${s} souhaite la bienvenue à tous les nouveaux habitants. Une réunion d'accueil aura lieu demain soir à la mairie. Tous les citoyens sont invités à participer.`,
    bodyTransFn: (_npc, s) => `The ${s} council welcomes all new inhabitants. A welcome meeting will take place tomorrow evening at the town hall. All citizens are invited to participate.`,
    difficulty: 'intermediate',
    noticeType: 'official',
    vocabularyWords: [
      { word: 'bienvenue', meaning: 'welcome' },
      { word: 'habitants', meaning: 'inhabitants' },
      { word: 'réunion', meaning: 'meeting' },
      { word: 'mairie', meaning: 'town hall' },
      { word: 'citoyens', meaning: 'citizens' },
    ],
    comprehensionQuestion: {
      question: 'Où aura lieu la réunion?',
      questionTranslation: 'Where will the meeting take place?',
      options: ['Au marché', 'À la mairie', 'À l\'église'],
      correctIndex: 1,
    },
    questHook: {
      questId: 'quest_town_meeting',
      questTitle: 'Assister à la réunion',
      questTitleTranslation: 'Attend the meeting',
    },
  },
  {
    titleFn: () => 'Offre d\'Emploi: Apprenti Forgeron',
    titleTransFn: () => 'Job Offer: Blacksmith Apprentice',
    bodyFn: (npc) => `${npc.name} cherche un apprenti pour travailler à la forge. Le candidat doit être fort et motivé. L'apprentissage dure deux ans. Le salaire est négociable. Présentez-vous à la forge.`,
    bodyTransFn: (npc) => `${npc.name} is looking for an apprentice to work at the forge. The candidate must be strong and motivated. The apprenticeship lasts two years. Salary is negotiable. Present yourself at the forge.`,
    difficulty: 'intermediate',
    noticeType: 'advertisement',
    vocabularyWords: [
      { word: 'apprenti', meaning: 'apprentice' },
      { word: 'forgeron', meaning: 'blacksmith' },
      { word: 'travailler', meaning: 'to work' },
      { word: 'salaire', meaning: 'salary' },
      { word: 'candidat', meaning: 'candidate' },
    ],
    comprehensionQuestion: {
      question: 'Combien de temps dure l\'apprentissage?',
      questionTranslation: 'How long does the apprenticeship last?',
      options: ['Un an', 'Deux ans', 'Trois ans'],
      correctIndex: 1,
    },
    questHook: {
      questId: 'quest_blacksmith_apprentice',
      questTitle: 'Rencontrer le forgeron',
      questTitleTranslation: 'Meet the blacksmith',
    },
  },
  {
    titleFn: () => 'Festival de la Moisson',
    titleTransFn: () => 'Harvest Festival',
    bodyFn: (_npc, s) => `Le festival annuel de la moisson de ${s} commence la semaine prochaine. Il y aura de la musique, de la danse, et un grand banquet. Chaque famille est priée d'apporter un plat traditionnel.`,
    bodyTransFn: (_npc, s) => `The annual harvest festival of ${s} begins next week. There will be music, dancing, and a grand banquet. Each family is asked to bring a traditional dish.`,
    difficulty: 'intermediate',
    noticeType: 'flyer',
    vocabularyWords: [
      { word: 'festival', meaning: 'festival' },
      { word: 'moisson', meaning: 'harvest' },
      { word: 'musique', meaning: 'music' },
      { word: 'danse', meaning: 'dance' },
      { word: 'banquet', meaning: 'banquet' },
      { word: 'famille', meaning: 'family' },
    ],
    comprehensionQuestion: {
      question: 'Que doit apporter chaque famille?',
      questionTranslation: 'What must each family bring?',
      options: ['De l\'argent', 'Un plat traditionnel', 'Des fleurs'],
      correctIndex: 1,
    },
  },
  {
    titleFn: () => 'Avis de Recherche',
    titleTransFn: () => 'Wanted Notice',
    bodyFn: (_npc, s) => `Attention! Un voleur a été signalé dans les environs de ${s}. Il porte un manteau noir et un chapeau. Si vous avez des informations, contactez immédiatement la garde du village.`,
    bodyTransFn: (_npc, s) => `Attention! A thief has been reported in the vicinity of ${s}. He wears a black coat and a hat. If you have any information, contact the village guard immediately.`,
    difficulty: 'intermediate',
    noticeType: 'wanted',
    vocabularyWords: [
      { word: 'voleur', meaning: 'thief' },
      { word: 'manteau', meaning: 'coat' },
      { word: 'chapeau', meaning: 'hat' },
      { word: 'garde', meaning: 'guard' },
      { word: 'informations', meaning: 'information' },
    ],
    comprehensionQuestion: {
      question: 'Que porte le voleur?',
      questionTranslation: 'What is the thief wearing?',
      options: ['Un manteau rouge', 'Un manteau noir et un chapeau', 'Une cape bleue'],
      correctIndex: 1,
    },
    questHook: {
      questId: 'quest_catch_thief',
      questTitle: 'Attraper le voleur',
      questTitleTranslation: 'Catch the thief',
    },
  },
  // ── ADVANCED notices ──
  {
    titleFn: () => 'Avis Important: Travaux de Réparation',
    titleTransFn: () => 'Important Notice: Repair Work',
    bodyFn: () => 'En raison de travaux de réparation sur le pont principal, la circulation sera déviée par le chemin forestier pendant les deux prochaines semaines. Les commerçants devront ajuster leurs livraisons. Nous nous excusons pour la gêne occasionnée et remercions la population pour sa patience.',
    bodyTransFn: () => 'Due to repair work on the main bridge, traffic will be diverted through the forest path for the next two weeks. Merchants will need to adjust their deliveries. We apologize for the inconvenience and thank the population for its patience.',
    difficulty: 'advanced',
    noticeType: 'official',
    vocabularyWords: [
      { word: 'travaux', meaning: 'work/construction' },
      { word: 'pont', meaning: 'bridge' },
      { word: 'circulation', meaning: 'traffic' },
      { word: 'commerçants', meaning: 'merchants' },
      { word: 'livraisons', meaning: 'deliveries' },
      { word: 'patience', meaning: 'patience' },
    ],
    comprehensionQuestion: {
      question: 'Combien de temps dureront les travaux?',
      questionTranslation: 'How long will the work last?',
      options: ['Un jour', 'Une semaine', 'Deux semaines'],
      correctIndex: 2,
    },
  },
  {
    titleFn: () => 'Débat Public sur l\'Avenir du Village',
    titleTransFn: () => 'Public Debate on the Future of the Village',
    bodyFn: (_npc, s) => `Le conseil municipal de ${s} organise un débat ouvert à tous les habitants concernant les projets d'expansion du village. Les sujets abordés incluront la construction d'une nouvelle école, l'amélioration des routes commerciales, et la protection des terres agricoles. Votre voix compte!`,
    bodyTransFn: (_npc, s) => `The municipal council of ${s} is organizing a debate open to all inhabitants regarding village expansion projects. Topics addressed will include the construction of a new school, improvement of trade routes, and protection of agricultural lands. Your voice matters!`,
    difficulty: 'advanced',
    noticeType: 'official',
    vocabularyWords: [
      { word: 'débat', meaning: 'debate' },
      { word: 'conseil', meaning: 'council' },
      { word: 'expansion', meaning: 'expansion' },
      { word: 'école', meaning: 'school' },
      { word: 'agricoles', meaning: 'agricultural' },
    ],
    comprehensionQuestion: {
      question: 'Quel sujet n\'est PAS mentionné dans le débat?',
      questionTranslation: 'Which topic is NOT mentioned in the debate?',
      options: ['Une nouvelle école', 'Un nouveau temple', 'Les routes commerciales'],
      correctIndex: 1,
    },
  },
  {
    titleFn: () => 'Appel aux Volontaires: Reconstruction',
    titleTransFn: () => 'Call for Volunteers: Reconstruction',
    bodyFn: (npc, s) => `Suite à la tempête de la semaine dernière, plusieurs bâtiments de ${s} ont subi des dommages importants. ${npc.name} coordonne les efforts de reconstruction et fait appel à tous les volontaires disponibles. Les matériaux sont fournis par la communauté. Rendez-vous chaque matin à l'aube sur la place principale.`,
    bodyTransFn: (npc, s) => `Following last week's storm, several buildings in ${s} suffered significant damage. ${npc.name} is coordinating reconstruction efforts and calling for all available volunteers. Materials are provided by the community. Meet every morning at dawn in the main square.`,
    difficulty: 'advanced',
    noticeType: 'official',
    vocabularyWords: [
      { word: 'tempête', meaning: 'storm' },
      { word: 'bâtiments', meaning: 'buildings' },
      { word: 'dommages', meaning: 'damage' },
      { word: 'volontaires', meaning: 'volunteers' },
      { word: 'reconstruction', meaning: 'reconstruction' },
      { word: 'communauté', meaning: 'community' },
    ],
    comprehensionQuestion: {
      question: 'Quand doivent se retrouver les volontaires?',
      questionTranslation: 'When should volunteers meet?',
      options: ['Le soir à la mairie', 'Chaque matin à l\'aube', 'Le dimanche après-midi'],
      correctIndex: 1,
    },
    questHook: {
      questId: 'quest_rebuild',
      questTitle: 'Aider à la reconstruction',
      questTitleTranslation: 'Help with the reconstruction',
    },
  },
  {
    titleFn: () => 'Lettre Ouverte: Protection de la Forêt',
    titleTransFn: () => 'Open Letter: Protecting the Forest',
    bodyFn: (npc) => `Chers concitoyens, je m'adresse à vous aujourd'hui avec une profonde inquiétude. La forêt ancienne qui borde notre village est menacée par l'exploitation excessive du bois. Cette forêt abrite des espèces rares et fournit l'eau pure de notre rivière. Je propose la création d'une zone protégée. — ${npc.name}`,
    bodyTransFn: (npc) => `Dear fellow citizens, I address you today with deep concern. The ancient forest bordering our village is threatened by excessive logging. This forest shelters rare species and provides the pure water of our river. I propose the creation of a protected zone. — ${npc.name}`,
    difficulty: 'advanced',
    noticeType: 'letter',
    vocabularyWords: [
      { word: 'forêt', meaning: 'forest' },
      { word: 'menacée', meaning: 'threatened' },
      { word: 'espèces', meaning: 'species' },
      { word: 'rivière', meaning: 'river' },
      { word: 'protégée', meaning: 'protected' },
      { word: 'inquiétude', meaning: 'concern' },
    ],
    comprehensionQuestion: {
      question: 'Que propose l\'auteur de la lettre?',
      questionTranslation: 'What does the letter\'s author propose?',
      options: ['Couper plus d\'arbres', 'Créer une zone protégée', 'Construire un barrage'],
      correctIndex: 1,
    },
  },
];

// ── Generator functions ─────────────────────────────────────────────────────

/**
 * Generate notice board articles for a settlement using its NPC data.
 * Returns 4-8 notices at varying difficulty levels.
 */
export function generateSettlementNotices(
  settlementId: string,
  settlementName: string,
  npcs: NPCAuthorInfo[],
): NoticeArticle[] {
  if (npcs.length === 0) {
    // Fallback: create generic NPCs
    npcs = [
      { characterId: `${settlementId}_mayor`, name: 'Le Maire', occupation: 'Mayor' },
      { characterId: `${settlementId}_merchant`, name: 'Le Marchand', occupation: 'Merchant' },
      { characterId: `${settlementId}_guard`, name: 'Le Garde', occupation: 'Guard' },
    ];
  }

  const articles: NoticeArticle[] = [];
  const usedTemplateIndices = new Set<number>();

  // Pick templates ensuring difficulty spread: 2 beginner, 2-3 intermediate, 1-2 advanced
  const beginnerTemplates = NOTICE_TEMPLATES.filter(t => t.difficulty === 'beginner');
  const intermediateTemplates = NOTICE_TEMPLATES.filter(t => t.difficulty === 'intermediate');
  const advancedTemplates = NOTICE_TEMPLATES.filter(t => t.difficulty === 'advanced');

  const pick = (pool: NoticeTemplate[], count: number): NoticeTemplate[] => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const selectedTemplates = [
    ...pick(beginnerTemplates, 2),
    ...pick(intermediateTemplates, 3),
    ...pick(advancedTemplates, 2),
  ];

  for (let i = 0; i < selectedTemplates.length; i++) {
    const template = selectedTemplates[i];
    const npc = npcs[i % npcs.length];

    const xpByDifficulty = { beginner: 10, intermediate: 15, advanced: 25 };

    const article: NoticeArticle = {
      id: `notice_${settlementId}_${i}`,
      title: template.titleFn(npc, settlementName),
      titleTranslation: template.titleTransFn(npc, settlementName),
      body: template.bodyFn(npc, settlementName),
      bodyTranslation: template.bodyTransFn(npc, settlementName),
      difficulty: template.difficulty,
      vocabularyWords: template.vocabularyWords,
      comprehensionQuestion: template.comprehensionQuestion,
      author: {
        characterId: npc.characterId,
        name: npc.name,
        occupation: npc.occupation,
      },
      settlementId,
      noticeType: template.noticeType,
      readingXp: xpByDifficulty[template.difficulty],
      documentType: 'notice',
    };

    if (template.questHook) {
      article.questHook = {
        ...template.questHook,
        questId: `${template.questHook.questId}_${settlementId}`,
      };
    }

    articles.push(article);
  }

  return articles;
}

