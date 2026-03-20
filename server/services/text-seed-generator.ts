/**
 * Procedural text seed generator for language-learning worlds.
 * Generates reading content (books, journals, letters, flyers, recipes) using templates.
 * No LLM dependency — all content is template-driven for deterministic, offline seeding.
 */
import type {
  InsertGameText,
  TextCategory,
  CefrLevel,
  TextPage,
  VocabularyHighlight,
  ComprehensionQuestion,
} from "@shared/schema";

export interface TextSeedOptions {
  worldId: string;
  targetLanguage: string;
  writerName?: string;
}

interface TextTemplate {
  title: string;
  titleTranslation: string;
  textCategory: TextCategory;
  cefrLevel: CefrLevel;
  pages: TextPage[];
  vocabularyHighlights: VocabularyHighlight[];
  comprehensionQuestions: ComprehensionQuestion[];
  authorName?: string;
  clueText?: string;
  difficulty: string;
  tags: string[];
  spawnLocationHint: string;
}

function cefrToDifficulty(level: CefrLevel): string {
  switch (level) {
    case 'A1': return 'beginner';
    case 'A2': return 'beginner';
    case 'B1': return 'intermediate';
    case 'B2': return 'advanced';
  }
}

// ---- Main quest book templates (12 books, 3 per CEFR level) ----

function buildMainQuestBooks(writerName: string): TextTemplate[] {
  return [
    // A1 Books (1-3): Simple present, basic vocabulary
    {
      title: "Le Jardin Secret",
      titleTranslation: "The Secret Garden",
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [
        {
          content: `${writerName} aime le jardin. Le jardin est grand et beau. Il y a des fleurs rouges et jaunes. ${writerName} écrit dans le jardin chaque jour. C'est son endroit préféré.`,
          contentTranslation: `${writerName} loves the garden. The garden is big and beautiful. There are red and yellow flowers. ${writerName} writes in the garden every day. It is their favorite place.`,
        },
      ],
      vocabularyHighlights: [
        { word: "jardin", translation: "garden", partOfSpeech: "noun" },
        { word: "fleurs", translation: "flowers", partOfSpeech: "noun" },
        { word: "beau", translation: "beautiful", partOfSpeech: "adjective" },
        { word: "écrit", translation: "writes", partOfSpeech: "verb" },
        { word: "préféré", translation: "favorite", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: `Où est-ce que ${writerName} écrit ?`,
          questionTranslation: `Where does ${writerName} write?`,
          options: ["Dans la maison", "Dans le jardin", "À l'école", "Au café"],
          correctIndex: 1,
        },
        {
          question: "De quelle couleur sont les fleurs ?",
          questionTranslation: "What color are the flowers?",
          options: ["Bleues et blanches", "Rouges et jaunes", "Vertes et roses", "Noires et grises"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} mentions a favorite garden — could this be where they spent their last days?`,
      difficulty: 'beginner',
      tags: ['main_quest', 'chapter_1', 'clue'],
      spawnLocationHint: 'library',
    },
    {
      title: "Ma Ville",
      titleTranslation: "My Town",
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [
        {
          content: `La ville est petite. Il y a une boulangerie, un café et une bibliothèque. Les gens sont gentils. ${writerName} connaît tout le monde ici. Mais un jour, ${writerName} n'est plus là.`,
          contentTranslation: `The town is small. There is a bakery, a café, and a library. The people are kind. ${writerName} knows everyone here. But one day, ${writerName} is no longer there.`,
        },
      ],
      vocabularyHighlights: [
        { word: "ville", translation: "town", partOfSpeech: "noun" },
        { word: "boulangerie", translation: "bakery", partOfSpeech: "noun" },
        { word: "bibliothèque", translation: "library", partOfSpeech: "noun" },
        { word: "gentils", translation: "kind", partOfSpeech: "adjective" },
        { word: "connaît", translation: "knows", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: "Comment est la ville ?",
          questionTranslation: "How is the town?",
          options: ["Grande", "Petite", "Moderne", "Dangereuse"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} describes a disagreement with a patron who funded their work.`,
      difficulty: 'beginner',
      tags: ['main_quest', 'chapter_1', 'clue'],
      spawnLocationHint: 'bookshop',
    },
    {
      title: "Les Amis",
      titleTranslation: "The Friends",
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [
        {
          content: `${writerName} a trois amis. Marie est professeur. Pierre travaille au café. Sophie aime les livres. Ils se retrouvent le samedi au marché. ${writerName} dit toujours : « L'amitié est importante. »`,
          contentTranslation: `${writerName} has three friends. Marie is a teacher. Pierre works at the café. Sophie loves books. They meet on Saturday at the market. ${writerName} always says: "Friendship is important."`,
        },
      ],
      vocabularyHighlights: [
        { word: "amis", translation: "friends", partOfSpeech: "noun" },
        { word: "professeur", translation: "teacher", partOfSpeech: "noun" },
        { word: "travaille", translation: "works", partOfSpeech: "verb" },
        { word: "livres", translation: "books", partOfSpeech: "noun" },
        { word: "amitié", translation: "friendship", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: `Combien d'amis a ${writerName} ?`,
          questionTranslation: `How many friends does ${writerName} have?`,
          options: ["Deux", "Trois", "Quatre", "Cinq"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} describes a secret meeting place where friends gathered.`,
      difficulty: 'beginner',
      tags: ['main_quest', 'chapter_2', 'clue'],
      spawnLocationHint: 'cafe',
    },
    // A2 Books (4-6): Past tense, basic connectors
    {
      title: "Le Voyage Inattendu",
      titleTranslation: "The Unexpected Journey",
      textCategory: 'book',
      cefrLevel: 'A2',
      pages: [
        {
          content: `L'année dernière, ${writerName} a décidé de partir en voyage. Personne ne savait où. Un matin, la maison était vide. Sur la table, il y avait une lettre. La lettre disait : « Je dois découvrir la vérité. Ne me cherchez pas. »`,
          contentTranslation: `Last year, ${writerName} decided to go on a trip. Nobody knew where. One morning, the house was empty. On the table, there was a letter. The letter said: "I must discover the truth. Don't look for me."`,
        },
      ],
      vocabularyHighlights: [
        { word: "voyage", translation: "journey", partOfSpeech: "noun" },
        { word: "décidé", translation: "decided", partOfSpeech: "verb" },
        { word: "vide", translation: "empty", partOfSpeech: "adjective" },
        { word: "vérité", translation: "truth", partOfSpeech: "noun" },
        { word: "cherchez", translation: "look for", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: `Qu'est-ce que ${writerName} a trouvé sur la table ?`,
          questionTranslation: `What did ${writerName} find on the table?`,
          options: ["Un livre", "Une lettre", "Un cadeau", "Une carte"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} left a cryptic farewell letter — they were searching for something.`,
      difficulty: 'beginner',
      tags: ['main_quest', 'chapter_2', 'clue'],
      spawnLocationHint: 'newspaper',
    },
    {
      title: "Souvenirs d'Enfance",
      titleTranslation: "Childhood Memories",
      textCategory: 'book',
      cefrLevel: 'A2',
      pages: [
        {
          content: `Quand ${writerName} était enfant, il aimait explorer la forêt près du village. Un jour, il a trouvé une vieille cabane cachée derrière les arbres. C'était un endroit magique. Plus tard, ${writerName} a écrit : « La cabane garde mes secrets. »`,
          contentTranslation: `When ${writerName} was a child, they loved to explore the forest near the village. One day, they found an old cabin hidden behind the trees. It was a magical place. Later, ${writerName} wrote: "The cabin keeps my secrets."`,
        },
      ],
      vocabularyHighlights: [
        { word: "enfant", translation: "child", partOfSpeech: "noun" },
        { word: "forêt", translation: "forest", partOfSpeech: "noun" },
        { word: "cabane", translation: "cabin", partOfSpeech: "noun" },
        { word: "cachée", translation: "hidden", partOfSpeech: "adjective" },
        { word: "secrets", translation: "secrets", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: `Qu'est-ce que ${writerName} a trouvé dans la forêt ?`,
          questionTranslation: `What did ${writerName} find in the forest?`,
          options: ["Un animal", "Une rivière", "Une cabane", "Un trésor"],
          correctIndex: 2,
        },
      ],
      authorName: writerName,
      clueText: `A childhood cabin in the forest — a possible hiding place.`,
      difficulty: 'beginner',
      tags: ['main_quest', 'chapter_3', 'clue'],
      spawnLocationHint: 'residence',
    },
    {
      title: "La Bibliothèque Oubliée",
      titleTranslation: "The Forgotten Library",
      textCategory: 'book',
      cefrLevel: 'A2',
      pages: [
        {
          content: `Il y a longtemps, la ville avait une grande bibliothèque. Mais les gens l'ont oubliée. ${writerName} l'a redécouverte. Il y a trouvé des documents importants sur l'histoire du village. ${writerName} a dit à son éditeur : « Ces documents changent tout. »`,
          contentTranslation: `Long ago, the town had a big library. But the people forgot about it. ${writerName} rediscovered it. There, they found important documents about the village's history. ${writerName} said to their editor: "These documents change everything."`,
        },
      ],
      vocabularyHighlights: [
        { word: "oubliée", translation: "forgotten", partOfSpeech: "adjective" },
        { word: "redécouverte", translation: "rediscovered", partOfSpeech: "verb" },
        { word: "documents", translation: "documents", partOfSpeech: "noun" },
        { word: "histoire", translation: "history", partOfSpeech: "noun" },
        { word: "éditeur", translation: "editor", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: `Qu'est-ce que ${writerName} a trouvé dans la bibliothèque ?`,
          questionTranslation: `What did ${writerName} find in the library?`,
          options: ["Des livres de cuisine", "Des documents importants", "Des lettres d'amour", "Des photos"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} found documents that "change everything" — what were they about?`,
      difficulty: 'beginner',
      tags: ['main_quest', 'chapter_3', 'clue'],
      spawnLocationHint: 'school',
    },
    // B1 Books (7-9): All tenses, conditionals, idiomatic expressions
    {
      title: "Les Ombres du Passé",
      titleTranslation: "Shadows of the Past",
      textCategory: 'book',
      cefrLevel: 'B1',
      pages: [
        {
          content: `Si ${writerName} avait su ce qui l'attendait, aurait-il quand même ouvert cette porte ? Les documents révélaient un scandale vieux de cent ans : la famille fondatrice du village avait bâti sa fortune sur un mensonge. ${writerName} hésitait. Publier la vérité détruirait des réputations. Garder le silence trahirait ses principes.`,
          contentTranslation: `If ${writerName} had known what awaited them, would they still have opened that door? The documents revealed a scandal a hundred years old: the founding family of the village had built its fortune on a lie. ${writerName} hesitated. Publishing the truth would destroy reputations. Keeping silent would betray their principles.`,
        },
        {
          content: `Chaque nuit, ${writerName} relisait les documents dans son bureau. Les mots dansaient devant ses yeux fatigués. « Il faut que je sois courageux », se disait-il. Mais le courage a un prix, et ${writerName} commençait à comprendre lequel.`,
          contentTranslation: `Every night, ${writerName} reread the documents in their office. The words danced before their tired eyes. "I must be brave," they told themselves. But courage has a price, and ${writerName} was beginning to understand which one.`,
        },
      ],
      vocabularyHighlights: [
        { word: "scandale", translation: "scandal", partOfSpeech: "noun" },
        { word: "mensonge", translation: "lie", partOfSpeech: "noun" },
        { word: "hésitait", translation: "hesitated", partOfSpeech: "verb" },
        { word: "réputations", translation: "reputations", partOfSpeech: "noun" },
        { word: "trahirait", translation: "would betray", partOfSpeech: "verb" },
        { word: "courageux", translation: "brave", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Que révélaient les documents ?",
          questionTranslation: "What did the documents reveal?",
          options: ["Une recette ancienne", "Un scandale vieux de cent ans", "Une carte au trésor", "Un poème oublié"],
          correctIndex: 1,
        },
        {
          question: `Pourquoi ${writerName} hésitait-il ?`,
          questionTranslation: `Why did ${writerName} hesitate?`,
          options: [
            "Il ne savait pas lire les documents",
            "Publier détruirait des réputations",
            "Il voulait garder les documents",
            "Les documents étaient faux",
          ],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} discovered a century-old scandal about the founding family — this is what drove them into hiding.`,
      difficulty: 'intermediate',
      tags: ['main_quest', 'chapter_4', 'clue'],
      spawnLocationHint: 'church',
    },
    {
      title: "Correspondance Secrète",
      titleTranslation: "Secret Correspondence",
      textCategory: 'book',
      cefrLevel: 'B1',
      pages: [
        {
          content: `${writerName} avait entretenu une correspondance secrète avec un historien de la capitale. Dans ses lettres, il décrivait ses découvertes avec prudence, utilisant des codes que seul son correspondant pouvait comprendre. « L'arbre au centre de la place cache plus que son ombre », écrivait-il dans sa dernière lettre.`,
          contentTranslation: `${writerName} had maintained a secret correspondence with a historian from the capital. In their letters, they described their discoveries cautiously, using codes that only their correspondent could understand. "The tree in the center of the square hides more than its shadow," they wrote in their last letter.`,
        },
      ],
      vocabularyHighlights: [
        { word: "correspondance", translation: "correspondence", partOfSpeech: "noun" },
        { word: "historien", translation: "historian", partOfSpeech: "noun" },
        { word: "découvertes", translation: "discoveries", partOfSpeech: "noun" },
        { word: "prudence", translation: "caution", partOfSpeech: "noun" },
        { word: "codes", translation: "codes", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: `Avec qui ${writerName} correspondait-il ?`,
          questionTranslation: `With whom did ${writerName} correspond?`,
          options: ["Un journaliste", "Un historien", "Un policier", "Un médecin"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} used coded messages — "The tree in the center of the square hides more than its shadow."`,
      difficulty: 'intermediate',
      tags: ['main_quest', 'chapter_4', 'clue'],
      spawnLocationHint: 'city_hall',
    },
    {
      title: "Le Dernier Chapitre",
      titleTranslation: "The Last Chapter",
      textCategory: 'book',
      cefrLevel: 'B1',
      pages: [
        {
          content: `Le manuscrit inachevé de ${writerName} se trouvait dans un tiroir verrouillé. Le dernier paragraphe disait : « J'ai compris que la vérité ne peut pas être enfermée dans un livre. Elle vit dans les murs de ce village, dans les souvenirs des anciens. Si quelqu'un lit ces mots, qu'il sache que je n'ai pas disparu. Je me suis simplement retiré là où personne ne pense à regarder. »`,
          contentTranslation: `${writerName}'s unfinished manuscript was in a locked drawer. The last paragraph said: "I understood that truth cannot be locked in a book. It lives in the walls of this village, in the memories of the elders. If someone reads these words, let them know that I have not disappeared. I have simply retreated to where no one thinks to look."`,
        },
      ],
      vocabularyHighlights: [
        { word: "manuscrit", translation: "manuscript", partOfSpeech: "noun" },
        { word: "inachevé", translation: "unfinished", partOfSpeech: "adjective" },
        { word: "verrouillé", translation: "locked", partOfSpeech: "adjective" },
        { word: "disparu", translation: "disappeared", partOfSpeech: "verb" },
        { word: "retiré", translation: "retreated", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: `Selon ${writerName}, où vit la vérité ?`,
          questionTranslation: `According to ${writerName}, where does the truth live?`,
          options: [
            "Dans un livre",
            "À la bibliothèque",
            "Dans les murs du village et les souvenirs des anciens",
            "Dans la forêt",
          ],
          correctIndex: 2,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} "retreated to where no one thinks to look" — the unfinished manuscript is the biggest clue yet.`,
      difficulty: 'intermediate',
      tags: ['main_quest', 'chapter_5', 'clue'],
      spawnLocationHint: 'hidden',
    },
    // B2 Books (10-12): Literary language, metaphor, complex grammar
    {
      title: "Réflexions sur la Mémoire",
      titleTranslation: "Reflections on Memory",
      textCategory: 'book',
      cefrLevel: 'B2',
      pages: [
        {
          content: `La mémoire est une rivière capricieuse. Elle emporte certains souvenirs dans ses courants tumultueux tandis qu'elle en dépose d'autres sur ses berges, intacts et lumineux. ${writerName} avait consacré sa vie à naviguer cette rivière, à repêcher les fragments oubliés de l'histoire collective. Mais ce faisant, il s'était attiré l'inimitié de ceux qui préféraient que certaines vérités restent submergées.`,
          contentTranslation: `Memory is a capricious river. It carries some memories away in its tumultuous currents while depositing others on its banks, intact and luminous. ${writerName} had devoted their life to navigating this river, to fishing out the forgotten fragments of collective history. But in doing so, they had earned the enmity of those who preferred certain truths to remain submerged.`,
        },
      ],
      vocabularyHighlights: [
        { word: "capricieuse", translation: "capricious", partOfSpeech: "adjective" },
        { word: "tumultueux", translation: "tumultuous", partOfSpeech: "adjective" },
        { word: "consacré", translation: "devoted", partOfSpeech: "verb" },
        { word: "inimitié", translation: "enmity", partOfSpeech: "noun" },
        { word: "submergées", translation: "submerged", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "À quoi la mémoire est-elle comparée ?",
          questionTranslation: "What is memory compared to?",
          options: ["Un océan", "Une rivière capricieuse", "Un lac tranquille", "Une montagne"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} made enemies among those who wanted truths to stay hidden — powerful people threatened them.`,
      difficulty: 'advanced',
      tags: ['main_quest', 'chapter_5', 'clue'],
      spawnLocationHint: 'hidden',
    },
    {
      title: "L'Exil Volontaire",
      titleTranslation: "Voluntary Exile",
      textCategory: 'book',
      cefrLevel: 'B2',
      pages: [
        {
          content: `Il existe une forme de courage qui ressemble à la lâcheté : celle de choisir l'effacement plutôt que l'affrontement. ${writerName} en était venu à cette conclusion après des mois de harcèlement discret — des menaces voilées, des portes qui se ferment, des amitiés qui se dissolvent comme du sucre dans l'eau. La cabane dans la forêt, celle de son enfance, était devenue son sanctuaire involontaire.`,
          contentTranslation: `There exists a form of courage that resembles cowardice: choosing erasure over confrontation. ${writerName} had come to this conclusion after months of quiet harassment — veiled threats, closing doors, friendships dissolving like sugar in water. The cabin in the forest, the one from childhood, had become their involuntary sanctuary.`,
        },
      ],
      vocabularyHighlights: [
        { word: "lâcheté", translation: "cowardice", partOfSpeech: "noun" },
        { word: "effacement", translation: "erasure", partOfSpeech: "noun" },
        { word: "harcèlement", translation: "harassment", partOfSpeech: "noun" },
        { word: "voilées", translation: "veiled", partOfSpeech: "adjective" },
        { word: "sanctuaire", translation: "sanctuary", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: `Pourquoi ${writerName} a-t-il choisi l'exil ?`,
          questionTranslation: `Why did ${writerName} choose exile?`,
          options: [
            "Pour écrire un nouveau livre",
            "À cause de mois de harcèlement et de menaces",
            "Pour voyager à l'étranger",
            "Parce qu'il s'ennuyait",
          ],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} went to the childhood cabin — the forest sanctuary. They are hiding there voluntarily.`,
      difficulty: 'advanced',
      tags: ['main_quest', 'chapter_6', 'clue'],
      spawnLocationHint: 'hidden',
    },
    {
      title: "Épilogue : La Vérité Retrouvée",
      titleTranslation: "Epilogue: The Truth Rediscovered",
      textCategory: 'book',
      cefrLevel: 'B2',
      pages: [
        {
          content: `Quiconque prétend que la vérité finit toujours par triompher n'a jamais vécu dans un village où les murs ont des oreilles et les sourires dissimulent des poignards. ${writerName} savait que publier son manuscrit reviendrait à allumer un incendie dans une poudrière. Pourtant, il l'avait confié à la seule personne en qui il avait encore confiance — en laissant des indices pour que le bon lecteur puisse reconstituer le puzzle. Si vous lisez ces lignes, c'est que vous êtes ce lecteur.`,
          contentTranslation: `Whoever claims that truth always prevails has never lived in a village where walls have ears and smiles conceal daggers. ${writerName} knew that publishing their manuscript would be like lighting a fire in a powder keg. Yet, they had entrusted it to the only person they still trusted — leaving clues so that the right reader could piece together the puzzle. If you are reading these lines, you are that reader.`,
        },
      ],
      vocabularyHighlights: [
        { word: "triompher", translation: "to prevail", partOfSpeech: "verb" },
        { word: "dissimulent", translation: "conceal", partOfSpeech: "verb" },
        { word: "poignards", translation: "daggers", partOfSpeech: "noun" },
        { word: "poudrière", translation: "powder keg", partOfSpeech: "noun" },
        { word: "reconstituer", translation: "to piece together", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: `Qu'est-ce que ${writerName} a confié à une personne de confiance ?`,
          questionTranslation: `What did ${writerName} entrust to a trusted person?`,
          options: ["De l'argent", "Son manuscrit", "Une clé", "Un tableau"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} entrusted the manuscript to someone and left clues for "the right reader" — that's the player.`,
      difficulty: 'advanced',
      tags: ['main_quest', 'chapter_6', 'clue'],
      spawnLocationHint: 'hidden',
    },
  ];
}

// ---- Journals (4, one per CEFR level) ----

function buildJournals(): TextTemplate[] {
  return [
    {
      title: "Journal de Marie",
      titleTranslation: "Marie's Journal",
      textCategory: 'journal',
      cefrLevel: 'A1',
      pages: [
        {
          content: "Lundi. Aujourd'hui, je suis allée au marché. J'ai acheté du pain et du fromage. Il fait beau. Les enfants jouent dans la rue. Je suis contente.",
          contentTranslation: "Monday. Today, I went to the market. I bought bread and cheese. The weather is nice. The children are playing in the street. I am happy.",
        },
      ],
      vocabularyHighlights: [
        { word: "marché", translation: "market", partOfSpeech: "noun" },
        { word: "pain", translation: "bread", partOfSpeech: "noun" },
        { word: "fromage", translation: "cheese", partOfSpeech: "noun" },
        { word: "enfants", translation: "children", partOfSpeech: "noun" },
        { word: "contente", translation: "happy", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Qu'est-ce que Marie a acheté ?",
          questionTranslation: "What did Marie buy?",
          options: ["Du lait", "Du pain et du fromage", "Des fruits", "De la viande"],
          correctIndex: 1,
        },
      ],
      difficulty: 'beginner',
      tags: ['daily_life', 'market'],
      spawnLocationHint: 'residence',
    },
    {
      title: "Journal du Boulanger",
      titleTranslation: "The Baker's Journal",
      textCategory: 'journal',
      cefrLevel: 'A2',
      pages: [
        {
          content: "Ce matin, je me suis levé à quatre heures comme d'habitude. La pâte n'a pas bien levé parce qu'il faisait trop froid dans la boulangerie. J'ai dû recommencer. Les clients attendaient et j'étais en retard. Heureusement, tout le monde a été patient.",
          contentTranslation: "This morning, I got up at four o'clock as usual. The dough didn't rise well because it was too cold in the bakery. I had to start over. The customers were waiting and I was late. Fortunately, everyone was patient.",
        },
      ],
      vocabularyHighlights: [
        { word: "pâte", translation: "dough", partOfSpeech: "noun" },
        { word: "levé", translation: "risen/got up", partOfSpeech: "verb" },
        { word: "froid", translation: "cold", partOfSpeech: "adjective" },
        { word: "recommencer", translation: "start over", partOfSpeech: "verb" },
        { word: "patient", translation: "patient", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Pourquoi la pâte n'a pas bien levé ?",
          questionTranslation: "Why didn't the dough rise well?",
          options: ["Il faisait trop chaud", "Il faisait trop froid", "Il n'y avait pas de farine", "Le four était cassé"],
          correctIndex: 1,
        },
      ],
      difficulty: 'beginner',
      tags: ['daily_life', 'work'],
      spawnLocationHint: 'residence',
    },
    {
      title: "Carnet de Voyage",
      titleTranslation: "Travel Notebook",
      textCategory: 'journal',
      cefrLevel: 'B1',
      pages: [
        {
          content: "Je ne m'attendais pas à ce que ce village me touche autant. Les ruelles pavées, l'odeur du pain frais le matin, les conversations animées sur la place — tout me rappelait une époque que je n'ai jamais connue mais qui semblait m'attendre. J'ai décidé de rester quelques jours de plus.",
          contentTranslation: "I didn't expect this village to move me so much. The cobblestone alleyways, the smell of fresh bread in the morning, the animated conversations in the square — everything reminded me of an era I never knew but that seemed to be waiting for me. I decided to stay a few more days.",
        },
      ],
      vocabularyHighlights: [
        { word: "ruelles", translation: "alleyways", partOfSpeech: "noun" },
        { word: "pavées", translation: "cobblestone", partOfSpeech: "adjective" },
        { word: "animées", translation: "animated/lively", partOfSpeech: "adjective" },
        { word: "époque", translation: "era", partOfSpeech: "noun" },
        { word: "semblait", translation: "seemed", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: "Qu'est-ce que le narrateur a décidé de faire ?",
          questionTranslation: "What did the narrator decide to do?",
          options: ["Partir immédiatement", "Écrire un livre", "Rester quelques jours de plus", "Acheter une maison"],
          correctIndex: 2,
        },
      ],
      difficulty: 'intermediate',
      tags: ['travel', 'culture'],
      spawnLocationHint: 'residence',
    },
    {
      title: "Réflexions Nocturnes",
      titleTranslation: "Night Reflections",
      textCategory: 'journal',
      cefrLevel: 'B2',
      pages: [
        {
          content: "L'insomnie a ceci de particulier qu'elle transforme le monde familier en territoire inconnu. À trois heures du matin, ma chambre devient un théâtre d'ombres où chaque meuble acquiert une présence menaçante. C'est dans ces moments-là que les pensées les plus honnêtes surgissent — celles qu'on n'oserait jamais formuler à la lumière du jour.",
          contentTranslation: "Insomnia has this peculiarity: it transforms the familiar world into unknown territory. At three in the morning, my room becomes a shadow theater where each piece of furniture acquires a menacing presence. It's in those moments that the most honest thoughts emerge — those one would never dare formulate in daylight.",
        },
      ],
      vocabularyHighlights: [
        { word: "insomnie", translation: "insomnia", partOfSpeech: "noun" },
        { word: "menaçante", translation: "menacing", partOfSpeech: "adjective" },
        { word: "surgissent", translation: "emerge", partOfSpeech: "verb" },
        { word: "formuler", translation: "to formulate", partOfSpeech: "verb" },
        { word: "oserait", translation: "would dare", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: "Selon l'auteur, quand les pensées les plus honnêtes surgissent-elles ?",
          questionTranslation: "According to the author, when do the most honest thoughts emerge?",
          options: ["Le matin", "L'après-midi", "Pendant l'insomnie, la nuit", "En vacances"],
          correctIndex: 2,
        },
      ],
      difficulty: 'advanced',
      tags: ['philosophy', 'introspection'],
      spawnLocationHint: 'residence',
    },
  ];
}

// ---- Letters (4, one per CEFR level) ----

function buildLetters(): TextTemplate[] {
  return [
    {
      title: "Lettre à Grand-mère",
      titleTranslation: "Letter to Grandmother",
      textCategory: 'letter',
      cefrLevel: 'A1',
      pages: [
        {
          content: "Chère Grand-mère,\n\nJe suis bien arrivé au village. La maison est jolie. J'ai un chat qui s'appelle Minou. Je mange bien. La soupe est bonne.\n\nGros bisous,\nPaul",
          contentTranslation: "Dear Grandmother,\n\nI arrived safely at the village. The house is pretty. I have a cat named Minou. I eat well. The soup is good.\n\nBig kisses,\nPaul",
        },
      ],
      vocabularyHighlights: [
        { word: "arrivé", translation: "arrived", partOfSpeech: "verb" },
        { word: "jolie", translation: "pretty", partOfSpeech: "adjective" },
        { word: "chat", translation: "cat", partOfSpeech: "noun" },
        { word: "soupe", translation: "soup", partOfSpeech: "noun" },
        { word: "bisous", translation: "kisses", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Comment s'appelle le chat ?",
          questionTranslation: "What is the cat's name?",
          options: ["Paul", "Minou", "Grand-mère", "Bisou"],
          correctIndex: 1,
        },
      ],
      difficulty: 'beginner',
      tags: ['family', 'correspondence'],
      spawnLocationHint: 'residence',
    },
    {
      title: "Lettre au Maire",
      titleTranslation: "Letter to the Mayor",
      textCategory: 'letter',
      cefrLevel: 'A2',
      pages: [
        {
          content: "Monsieur le Maire,\n\nJe vous écris pour vous informer d'un problème dans notre quartier. La fontaine de la place est cassée depuis deux semaines. Les enfants n'ont plus d'eau pour jouer et les jardiniers ne peuvent pas arroser les fleurs. Pourriez-vous envoyer quelqu'un pour la réparer ?\n\nCordialement,\nMme Dupont",
          contentTranslation: "Mr. Mayor,\n\nI am writing to inform you of a problem in our neighborhood. The fountain in the square has been broken for two weeks. The children no longer have water to play with and the gardeners cannot water the flowers. Could you send someone to repair it?\n\nSincerely,\nMrs. Dupont",
        },
      ],
      vocabularyHighlights: [
        { word: "quartier", translation: "neighborhood", partOfSpeech: "noun" },
        { word: "fontaine", translation: "fountain", partOfSpeech: "noun" },
        { word: "cassée", translation: "broken", partOfSpeech: "adjective" },
        { word: "arroser", translation: "to water", partOfSpeech: "verb" },
        { word: "réparer", translation: "to repair", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: "Quel est le problème ?",
          questionTranslation: "What is the problem?",
          options: ["La rue est sale", "La fontaine est cassée", "Le parc est fermé", "L'école est trop petite"],
          correctIndex: 1,
        },
      ],
      difficulty: 'beginner',
      tags: ['civic', 'correspondence'],
      spawnLocationHint: 'city_hall',
    },
    {
      title: "Lettre d'un Ami Lointain",
      titleTranslation: "Letter from a Distant Friend",
      textCategory: 'letter',
      cefrLevel: 'B1',
      pages: [
        {
          content: "Mon cher ami,\n\nCela fait longtemps que je ne t'ai pas écrit, et je m'en excuse. La vie ici a beaucoup changé depuis ton départ. Le vieux café a fermé ses portes, remplacé par une boutique de souvenirs pour les touristes. Parfois, je m'assois sur le banc où nous avions l'habitude de discuter pendant des heures, et je me demande si tu te souviens de ces moments-là.\n\nTon ami fidèle,\nJean",
          contentTranslation: "My dear friend,\n\nIt's been a long time since I wrote to you, and I apologize. Life here has changed a lot since you left. The old café has closed its doors, replaced by a souvenir shop for tourists. Sometimes, I sit on the bench where we used to talk for hours, and I wonder if you remember those moments.\n\nYour faithful friend,\nJean",
        },
      ],
      vocabularyHighlights: [
        { word: "lointain", translation: "distant", partOfSpeech: "adjective" },
        { word: "m'en excuse", translation: "apologize for it", partOfSpeech: "verb" },
        { word: "souvenirs", translation: "memories/souvenirs", partOfSpeech: "noun" },
        { word: "habitude", translation: "habit", partOfSpeech: "noun" },
        { word: "fidèle", translation: "faithful", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Qu'est-ce qui a remplacé le vieux café ?",
          questionTranslation: "What replaced the old café?",
          options: ["Un restaurant", "Une boutique de souvenirs", "Un bureau de poste", "Une école"],
          correctIndex: 1,
        },
      ],
      difficulty: 'intermediate',
      tags: ['friendship', 'nostalgia'],
      spawnLocationHint: 'residence',
    },
    {
      title: "Lettre de Démission",
      titleTranslation: "Letter of Resignation",
      textCategory: 'letter',
      cefrLevel: 'B2',
      pages: [
        {
          content: "Madame la Directrice,\n\nC'est avec un mélange de regret et de soulagement que je vous adresse cette lettre de démission. Après quinze années passées au sein de cette institution, j'ai acquis la certitude que mes convictions ne sont plus compatibles avec les orientations actuelles de l'établissement. La décision de privilégier le rendement financier au détriment de la qualité éducative heurte profondément les valeurs qui m'ont poussé vers ce métier.\n\nJe vous prie d'agréer mes salutations distinguées,\nM. Laurent",
          contentTranslation: "Dear Director,\n\nIt is with a mixture of regret and relief that I address this letter of resignation to you. After fifteen years spent within this institution, I have become certain that my convictions are no longer compatible with the current directions of the establishment. The decision to prioritize financial returns at the expense of educational quality deeply offends the values that drew me to this profession.\n\nYours sincerely,\nMr. Laurent",
        },
      ],
      vocabularyHighlights: [
        { word: "démission", translation: "resignation", partOfSpeech: "noun" },
        { word: "soulagement", translation: "relief", partOfSpeech: "noun" },
        { word: "convictions", translation: "convictions", partOfSpeech: "noun" },
        { word: "détriment", translation: "detriment", partOfSpeech: "noun" },
        { word: "heurte", translation: "offends", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: "Pourquoi M. Laurent démissionne-t-il ?",
          questionTranslation: "Why is Mr. Laurent resigning?",
          options: [
            "Il déménage",
            "Il est en désaccord avec les orientations de l'établissement",
            "Il prend sa retraite",
            "Il a trouvé un meilleur salaire",
          ],
          correctIndex: 1,
        },
      ],
      difficulty: 'advanced',
      tags: ['formal', 'professional'],
      spawnLocationHint: 'office',
    },
  ];
}

// ---- Flyers (4, one per CEFR level) ----

function buildFlyers(): TextTemplate[] {
  return [
    {
      title: "Fête du Village",
      titleTranslation: "Village Festival",
      textCategory: 'flyer',
      cefrLevel: 'A1',
      pages: [
        {
          content: "🎉 FÊTE DU VILLAGE 🎉\n\nSamedi 15 juin\nDe 10h à 22h\nSur la grande place\n\nMusique ! Danse ! Nourriture !\nEntrée gratuite pour tous\n\nVenez nombreux !",
          contentTranslation: "🎉 VILLAGE FESTIVAL 🎉\n\nSaturday June 15\nFrom 10am to 10pm\nIn the main square\n\nMusic! Dance! Food!\nFree entry for all\n\nCome one, come all!",
        },
      ],
      vocabularyHighlights: [
        { word: "fête", translation: "festival/party", partOfSpeech: "noun" },
        { word: "musique", translation: "music", partOfSpeech: "noun" },
        { word: "nourriture", translation: "food", partOfSpeech: "noun" },
        { word: "gratuite", translation: "free", partOfSpeech: "adjective" },
        { word: "nombreux", translation: "in great numbers", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Quand est la fête ?",
          questionTranslation: "When is the festival?",
          options: ["Vendredi", "Samedi 15 juin", "Dimanche", "Lundi"],
          correctIndex: 1,
        },
      ],
      difficulty: 'beginner',
      tags: ['event', 'community'],
      spawnLocationHint: 'market',
    },
    {
      title: "Écrivain Disparu — Avez-vous des informations ?",
      titleTranslation: "Missing Writer — Do you have information?",
      textCategory: 'flyer',
      cefrLevel: 'A2',
      pages: [
        {
          content: "⚠️ AVIS DE RECHERCHE ⚠️\n\nL'écrivain bien connu de notre village n'a pas été vu depuis trois mois. Sa famille et ses amis sont très inquiets. Si vous avez vu cette personne ou si vous avez des informations, veuillez contacter le bureau du journal local.\n\nToute information est utile.\nMerci de votre aide.",
          contentTranslation: "⚠️ MISSING PERSON NOTICE ⚠️\n\nThe well-known writer of our village has not been seen for three months. Their family and friends are very worried. If you have seen this person or if you have information, please contact the local newspaper office.\n\nAny information is useful.\nThank you for your help.",
        },
      ],
      vocabularyHighlights: [
        { word: "disparu", translation: "missing/disappeared", partOfSpeech: "adjective" },
        { word: "inquiets", translation: "worried", partOfSpeech: "adjective" },
        { word: "informations", translation: "information", partOfSpeech: "noun" },
        { word: "veuillez", translation: "please (formal)", partOfSpeech: "verb" },
        { word: "utile", translation: "useful", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Depuis combien de temps l'écrivain a-t-il disparu ?",
          questionTranslation: "How long has the writer been missing?",
          options: ["Une semaine", "Un mois", "Trois mois", "Un an"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['main_quest', 'missing_person'],
      spawnLocationHint: 'market',
    },
    {
      title: "Cours de Cuisine Traditionnelle",
      titleTranslation: "Traditional Cooking Classes",
      textCategory: 'flyer',
      cefrLevel: 'B1',
      pages: [
        {
          content: "🍽️ APPRENEZ À CUISINER COMME NOS GRANDS-MÈRES ! 🍽️\n\nL'association culturelle du village vous invite à participer à une série de cours de cuisine traditionnelle. Chaque samedi matin, un chef local vous enseignera les recettes qui ont fait la renommée de notre région.\n\nAu programme : tarte aux pommes, ratatouille, soupe à l'oignon, cassoulet.\n\nInscription : 20€ par séance, matériel inclus.\nContact : association@village.fr",
          contentTranslation: "🍽️ LEARN TO COOK LIKE OUR GRANDMOTHERS! 🍽️\n\nThe village cultural association invites you to participate in a series of traditional cooking classes. Every Saturday morning, a local chef will teach you the recipes that made our region famous.\n\nOn the menu: apple tart, ratatouille, onion soup, cassoulet.\n\nRegistration: €20 per session, materials included.\nContact: association@village.fr",
        },
      ],
      vocabularyHighlights: [
        { word: "cuisiner", translation: "to cook", partOfSpeech: "verb" },
        { word: "enseignera", translation: "will teach", partOfSpeech: "verb" },
        { word: "renommée", translation: "fame/reputation", partOfSpeech: "noun" },
        { word: "inscription", translation: "registration", partOfSpeech: "noun" },
        { word: "séance", translation: "session", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Quand ont lieu les cours ?",
          questionTranslation: "When do the classes take place?",
          options: ["Le lundi soir", "Le samedi matin", "Le dimanche après-midi", "Tous les jours"],
          correctIndex: 1,
        },
      ],
      difficulty: 'intermediate',
      tags: ['food', 'culture', 'classes'],
      spawnLocationHint: 'market',
    },
    {
      title: "Conférence : Patrimoine et Identité Locale",
      titleTranslation: "Conference: Heritage and Local Identity",
      textCategory: 'flyer',
      cefrLevel: 'B2',
      pages: [
        {
          content: "📚 CONFÉRENCE-DÉBAT 📚\n\n« Patrimoine et Identité Locale : Comment préserver notre héritage culturel face à la mondialisation ? »\n\nIntervenants : Pr. Moreau (Université de Lyon), Dr. Petit (Historienne locale)\n\nLe débat abordera les tensions entre développement touristique et authenticité culturelle, ainsi que le rôle controversé de la presse locale dans la construction de la mémoire collective.\n\nEntrée libre sur réservation.\nMairie, salle des fêtes — Vendredi 20h30.",
          contentTranslation: "📚 CONFERENCE-DEBATE 📚\n\n'Heritage and Local Identity: How to preserve our cultural heritage in the face of globalization?'\n\nSpeakers: Prof. Moreau (University of Lyon), Dr. Petit (Local historian)\n\nThe debate will address tensions between tourism development and cultural authenticity, as well as the controversial role of the local press in constructing collective memory.\n\nFree entry by reservation.\nTown hall, function room — Friday 8:30pm.",
        },
      ],
      vocabularyHighlights: [
        { word: "patrimoine", translation: "heritage", partOfSpeech: "noun" },
        { word: "préserver", translation: "to preserve", partOfSpeech: "verb" },
        { word: "mondialisation", translation: "globalization", partOfSpeech: "noun" },
        { word: "controversé", translation: "controversial", partOfSpeech: "adjective" },
        { word: "mémoire collective", translation: "collective memory", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Quel est le thème principal de la conférence ?",
          questionTranslation: "What is the main theme of the conference?",
          options: [
            "L'économie locale",
            "Le patrimoine et l'identité locale",
            "La cuisine traditionnelle",
            "L'éducation des enfants",
          ],
          correctIndex: 1,
        },
      ],
      difficulty: 'advanced',
      tags: ['culture', 'academic', 'heritage'],
      spawnLocationHint: 'city_hall',
    },
  ];
}

// ---- Recipes (4, one per CEFR level) ----

function buildRecipes(): TextTemplate[] {
  return [
    {
      title: "Crêpes Simples",
      titleTranslation: "Simple Crêpes",
      textCategory: 'recipe',
      cefrLevel: 'A1',
      pages: [
        {
          content: "🥞 Crêpes\n\nIngrédients :\n- 250g de farine\n- 3 œufs\n- 500ml de lait\n- 1 cuillère de sucre\n- 1 pincée de sel\n\nMélangez la farine et les œufs. Ajoutez le lait. Mélangez bien. Faites cuire dans une poêle chaude. Bon appétit !",
          contentTranslation: "🥞 Crêpes\n\nIngredients:\n- 250g flour\n- 3 eggs\n- 500ml milk\n- 1 spoon of sugar\n- 1 pinch of salt\n\nMix the flour and eggs. Add the milk. Mix well. Cook in a hot pan. Enjoy!",
        },
      ],
      vocabularyHighlights: [
        { word: "farine", translation: "flour", partOfSpeech: "noun" },
        { word: "œufs", translation: "eggs", partOfSpeech: "noun" },
        { word: "lait", translation: "milk", partOfSpeech: "noun" },
        { word: "mélangez", translation: "mix", partOfSpeech: "verb" },
        { word: "poêle", translation: "frying pan", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Combien d'œufs faut-il ?",
          questionTranslation: "How many eggs do you need?",
          options: ["1", "2", "3", "4"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['food', 'cooking'],
      spawnLocationHint: 'restaurant',
    },
    {
      title: "Soupe à l'Oignon",
      titleTranslation: "Onion Soup",
      textCategory: 'recipe',
      cefrLevel: 'A2',
      pages: [
        {
          content: "🧅 Soupe à l'Oignon Gratinée\n\nIngrédients :\n- 4 gros oignons\n- 50g de beurre\n- 1 litre de bouillon de bœuf\n- Du pain rassis\n- Du gruyère râpé\n\nCoupez les oignons en rondelles. Faites-les revenir dans le beurre pendant 20 minutes jusqu'à ce qu'ils soient dorés. Ajoutez le bouillon et laissez mijoter 15 minutes. Versez dans des bols, ajoutez le pain et le fromage, puis passez au four 10 minutes.",
          contentTranslation: "🧅 French Onion Soup\n\nIngredients:\n- 4 large onions\n- 50g butter\n- 1 liter beef broth\n- Stale bread\n- Grated gruyère\n\nCut the onions into rings. Sauté them in butter for 20 minutes until golden. Add the broth and let simmer for 15 minutes. Pour into bowls, add bread and cheese, then bake for 10 minutes.",
        },
      ],
      vocabularyHighlights: [
        { word: "oignons", translation: "onions", partOfSpeech: "noun" },
        { word: "beurre", translation: "butter", partOfSpeech: "noun" },
        { word: "bouillon", translation: "broth", partOfSpeech: "noun" },
        { word: "mijoter", translation: "to simmer", partOfSpeech: "verb" },
        { word: "râpé", translation: "grated", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Combien de temps faut-il faire revenir les oignons ?",
          questionTranslation: "How long should you sauté the onions?",
          options: ["5 minutes", "10 minutes", "20 minutes", "30 minutes"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['food', 'cooking', 'traditional'],
      spawnLocationHint: 'restaurant',
    },
    {
      title: "Ratatouille Provençale",
      titleTranslation: "Provençal Ratatouille",
      textCategory: 'recipe',
      cefrLevel: 'B1',
      pages: [
        {
          content: "🍆 Ratatouille Provençale\n\nIngrédients :\n- 2 aubergines, 3 courgettes, 4 tomates\n- 2 poivrons (rouge et jaune), 2 oignons\n- 4 gousses d'ail, huile d'olive, herbes de Provence\n\nCommencez par couper tous les légumes en dés réguliers. Faites revenir chaque légume séparément dans l'huile d'olive — c'est le secret d'une bonne ratatouille, car chaque légume a un temps de cuisson différent. Réunissez-les ensuite dans une cocotte, ajoutez l'ail écrasé et les herbes. Laissez mijoter à feu doux pendant 45 minutes en remuant de temps en temps.",
          contentTranslation: "🍆 Provençal Ratatouille\n\nIngredients:\n- 2 eggplants, 3 zucchinis, 4 tomatoes\n- 2 bell peppers (red and yellow), 2 onions\n- 4 garlic cloves, olive oil, herbs of Provence\n\nStart by cutting all vegetables into even cubes. Sauté each vegetable separately in olive oil — this is the secret of a good ratatouille, because each vegetable has a different cooking time. Then combine them in a Dutch oven, add crushed garlic and herbs. Let simmer on low heat for 45 minutes, stirring from time to time.",
        },
      ],
      vocabularyHighlights: [
        { word: "aubergines", translation: "eggplants", partOfSpeech: "noun" },
        { word: "courgettes", translation: "zucchinis", partOfSpeech: "noun" },
        { word: "poivrons", translation: "bell peppers", partOfSpeech: "noun" },
        { word: "cocotte", translation: "Dutch oven", partOfSpeech: "noun" },
        { word: "feu doux", translation: "low heat", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Quel est le secret d'une bonne ratatouille ?",
          questionTranslation: "What is the secret of a good ratatouille?",
          options: [
            "Utiliser beaucoup de sel",
            "Cuire chaque légume séparément",
            "Ajouter du fromage",
            "Couper les légumes très petits",
          ],
          correctIndex: 1,
        },
      ],
      difficulty: 'intermediate',
      tags: ['food', 'cooking', 'traditional', 'provençal'],
      spawnLocationHint: 'restaurant',
    },
    {
      title: "Tarte Tatin Revisitée",
      titleTranslation: "Reinvented Tarte Tatin",
      textCategory: 'recipe',
      cefrLevel: 'B2',
      pages: [
        {
          content: "🍎 Tarte Tatin aux Pommes et au Romarin\n\nCette variation contemporaine du classique des sœurs Tatin marie l'acidité des pommes Granny Smith avec les notes boisées du romarin frais. Le caramel, volontairement poussé jusqu'à l'amertume, crée un contraste sophistiqué avec la douceur du fruit.\n\nPréparez d'abord le caramel à sec : versez 150g de sucre dans une poêle en fonte et laissez fondre sans remuer. Lorsqu'il atteint une couleur ambrée foncée, ajoutez 80g de beurre demi-sel en morceaux — attention aux projections. Disposez les quartiers de pommes en rosace serrée, parsemez de feuilles de romarin, puis recouvrez d'un disque de pâte feuilletée inversée. Enfournez 35 minutes à 190°C.",
          contentTranslation: "🍎 Apple and Rosemary Tarte Tatin\n\nThis contemporary variation on the Tatin sisters' classic pairs the acidity of Granny Smith apples with the woody notes of fresh rosemary. The caramel, deliberately pushed to bitterness, creates a sophisticated contrast with the sweetness of the fruit.\n\nFirst prepare a dry caramel: pour 150g sugar into a cast-iron pan and let it melt without stirring. When it reaches a dark amber color, add 80g semi-salted butter in pieces — watch for spattering. Arrange apple quarters in a tight rosette, sprinkle with rosemary leaves, then cover with a disc of inverted puff pastry. Bake 35 minutes at 190°C.",
        },
      ],
      vocabularyHighlights: [
        { word: "amertume", translation: "bitterness", partOfSpeech: "noun" },
        { word: "en fonte", translation: "cast-iron", partOfSpeech: "adjective" },
        { word: "ambrée", translation: "amber", partOfSpeech: "adjective" },
        { word: "rosace", translation: "rosette", partOfSpeech: "noun" },
        { word: "feuilletée", translation: "puff (pastry)", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Quel type de pommes est utilisé dans cette recette ?",
          questionTranslation: "What type of apples is used in this recipe?",
          options: ["Golden", "Granny Smith", "Fuji", "Gala"],
          correctIndex: 1,
        },
      ],
      difficulty: 'advanced',
      tags: ['food', 'cooking', 'gourmet', 'dessert'],
      spawnLocationHint: 'restaurant',
    },
  ];
}

/**
 * Build all seed texts for a world. Returns InsertGameText[] ready to be saved.
 */
export function buildSeedTexts(options: TextSeedOptions): InsertGameText[] {
  const { worldId, targetLanguage, writerName = "Jean-Luc Moreau" } = options;

  const allTemplates: TextTemplate[] = [
    ...buildMainQuestBooks(writerName),
    ...buildJournals(),
    ...buildLetters(),
    ...buildFlyers(),
    ...buildRecipes(),
  ];

  return allTemplates.map((t) => ({
    worldId,
    title: t.title,
    titleTranslation: t.titleTranslation,
    textCategory: t.textCategory,
    pages: t.pages,
    vocabularyHighlights: t.vocabularyHighlights,
    comprehensionQuestions: t.comprehensionQuestions,
    cefrLevel: t.cefrLevel,
    targetLanguage,
    authorName: t.authorName,
    clueText: t.clueText,
    difficulty: t.difficulty,
    tags: t.tags,
    isGenerated: true,
    spawnLocationHint: t.spawnLocationHint,
    status: 'published' as const,
  }));
}

/**
 * Seed texts into the database for a given world.
 * Returns the created GameText records.
 */
export async function seedTextsForWorld(
  storage: { createGameText: (text: InsertGameText) => Promise<any>; getGameTextsByWorld: (worldId: string) => Promise<any[]> },
  options: TextSeedOptions,
): Promise<{ created: number; skipped: boolean }> {
  const existing = await storage.getGameTextsByWorld(options.worldId);
  if (existing.length > 0) {
    return { created: 0, skipped: true };
  }

  const texts = buildSeedTexts(options);
  for (const text of texts) {
    await storage.createGameText(text);
  }

  return { created: texts.length, skipped: false };
}
