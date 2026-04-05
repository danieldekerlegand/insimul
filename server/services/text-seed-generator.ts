/**
 * Procedural text seed generator for language-learning worlds.
 * Generates 20 reading texts in French covering fiction, non-fiction, journal entries,
 * letters, recipes, and poems — all themed around Louisiana Creole/Chitimacha culture.
 *
 * 5 texts are written by the missing writer character with progressive mystery clues.
 * CEFR distribution: 8×A1, 6×A2, 4×B1, 2×B2.
 *
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
    case 'C1': return 'advanced';
    case 'C2': return 'advanced';
  }
}

// ── Missing writer's diary entries (5 journals, progressive clues) ───────────

function buildWriterJournals(writerName: string): TextTemplate[] {
  return [
    // Clue 1 (A1): Writer's daily life, love of the bayou — establishes character
    {
      title: "Journal — Lundi matin",
      titleTranslation: "Journal — Monday Morning",
      textCategory: 'journal',
      cefrLevel: 'A1',
      pages: [
        {
          content: `Lundi. Je suis ${writerName}. J'habite près du bayou. Le matin, je marche sous les cyprès. L'eau est calme. Les oiseaux chantent. J'écris dans mon cahier. C'est mon endroit préféré. Personne ne vient ici. C'est mon secret.`,
          contentTranslation: `Monday. I am ${writerName}. I live near the bayou. In the morning, I walk under the cypress trees. The water is calm. The birds sing. I write in my notebook. It is my favorite place. Nobody comes here. It is my secret.`,
        },
      ],
      vocabularyHighlights: [
        { word: "bayou", translation: "bayou (slow waterway)", partOfSpeech: "noun" },
        { word: "cyprès", translation: "cypress trees", partOfSpeech: "noun" },
        { word: "oiseaux", translation: "birds", partOfSpeech: "noun" },
        { word: "cahier", translation: "notebook", partOfSpeech: "noun" },
        { word: "secret", translation: "secret", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: `Où est-ce que ${writerName} habite ?`,
          questionTranslation: `Where does ${writerName} live?`,
          options: ["En ville", "Près du bayou", "À la montagne", "Au bord de la mer"],
          correctIndex: 1,
        },
        {
          question: `Quand est-ce que ${writerName} marche ?`,
          questionTranslation: `When does ${writerName} walk?`,
          options: ["Le soir", "L'après-midi", "Le matin", "La nuit"],
          correctIndex: 2,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} has a secret spot near the bayou under the cypress trees — a place nobody visits.`,
      difficulty: 'beginner',
      tags: ['main_quest', 'missing_writer', 'clue_1'],
      spawnLocationHint: 'residence',
    },
    // Clue 2 (A2): Discovery of old Chitimacha documents
    {
      title: "Journal — La Découverte",
      titleTranslation: "Journal — The Discovery",
      textCategory: 'journal',
      cefrLevel: 'A2',
      pages: [
        {
          content: `Mercredi. J'ai trouvé quelque chose d'extraordinaire aujourd'hui. Dans la vieille bibliothèque, derrière les étagères, il y avait une boîte en bois. À l'intérieur, j'ai découvert des documents anciens — des textes en langue chitimacha, écrits à la main. Ces documents racontent l'histoire vraie de notre village. L'histoire que personne ne veut entendre.`,
          contentTranslation: `Wednesday. I found something extraordinary today. In the old library, behind the shelves, there was a wooden box. Inside, I discovered ancient documents — texts in the Chitimacha language, written by hand. These documents tell the true history of our village. The history that nobody wants to hear.`,
        },
      ],
      vocabularyHighlights: [
        { word: "étagères", translation: "shelves", partOfSpeech: "noun" },
        { word: "boîte", translation: "box", partOfSpeech: "noun" },
        { word: "anciens", translation: "ancient", partOfSpeech: "adjective" },
        { word: "langue", translation: "language", partOfSpeech: "noun" },
        { word: "histoire", translation: "history/story", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Où a-t-il trouvé la boîte ?",
          questionTranslation: "Where did he find the box?",
          options: ["Dans le bayou", "Dans la bibliothèque", "Dans la forêt", "Chez lui"],
          correctIndex: 1,
        },
        {
          question: "En quelle langue sont les documents ?",
          questionTranslation: "In what language are the documents?",
          options: ["En français", "En anglais", "En chitimacha", "En espagnol"],
          correctIndex: 2,
        },
        {
          question: "Que racontent les documents ?",
          questionTranslation: "What do the documents tell?",
          options: ["Des recettes", "L'histoire vraie du village", "Des poèmes", "Des nouvelles"],
          correctIndex: 1,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} found hidden Chitimacha documents in the old library — behind the shelves, in a wooden box.`,
      difficulty: 'beginner',
      tags: ['main_quest', 'missing_writer', 'clue_2'],
      spawnLocationHint: 'library',
    },
    // Clue 3 (B1): Threats and coded location references
    {
      title: "Journal — Les Menaces",
      titleTranslation: "Journal — The Threats",
      textCategory: 'journal',
      cefrLevel: 'B1',
      pages: [
        {
          content: `Samedi soir. Quelqu'un est entré dans mon bureau pendant que j'étais au marché. Mes papiers étaient dérangés, et la copie des documents chitimacha avait disparu. Ce n'est pas la première fois — la semaine dernière, j'ai reçu une lettre anonyme qui disait : « Cessez vos recherches si vous tenez à votre tranquillité. » Je sais que la famille Beaumont est derrière tout ça. Ces documents prouvent que leurs ancêtres ont volé les terres des Chitimacha.`,
          contentTranslation: `Saturday evening. Someone entered my office while I was at the market. My papers were disturbed, and the copy of the Chitimacha documents had disappeared. This is not the first time — last week, I received an anonymous letter that said: "Stop your research if you value your peace." I know the Beaumont family is behind all this. These documents prove that their ancestors stole the Chitimacha lands.`,
        },
        {
          content: `J'ai caché les originaux dans un endroit sûr. La cabane au bord du bayou — celle que mon grand-père a construite — personne ne la connaît sauf moi. Demain, j'y emmènerai aussi mon manuscrit. Si quelque chose m'arrive, il faut chercher « là où les hérons se reposent ». C'est le nom que mon grand-père donnait à cet endroit.`,
          contentTranslation: `I hid the originals in a safe place. The cabin at the edge of the bayou — the one my grandfather built — nobody knows about it except me. Tomorrow, I will bring my manuscript there too. If something happens to me, look for "where the herons rest." That is the name my grandfather gave to this place.`,
        },
      ],
      vocabularyHighlights: [
        { word: "menaces", translation: "threats", partOfSpeech: "noun" },
        { word: "dérangés", translation: "disturbed", partOfSpeech: "adjective" },
        { word: "anonyme", translation: "anonymous", partOfSpeech: "adjective" },
        { word: "ancêtres", translation: "ancestors", partOfSpeech: "noun" },
        { word: "hérons", translation: "herons", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Que disait la lettre anonyme ?",
          questionTranslation: "What did the anonymous letter say?",
          options: [
            "Bienvenue au village",
            "Cessez vos recherches",
            "Venez à la fête",
            "Partagez vos découvertes",
          ],
          correctIndex: 1,
        },
        {
          question: "Où a-t-il caché les documents originaux ?",
          questionTranslation: "Where did he hide the original documents?",
          options: [
            "Dans la bibliothèque",
            "Chez un ami",
            "Dans la cabane au bord du bayou",
            "Dans son bureau",
          ],
          correctIndex: 2,
        },
        {
          question: `Comment s'appelle l'endroit secret ?`,
          questionTranslation: `What is the secret place called?`,
          options: [
            "Le jardin secret",
            "La maison du bayou",
            "Là où les hérons se reposent",
            "La cabane aux oiseaux",
          ],
          correctIndex: 2,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} hid originals at "where the herons rest" — a cabin by the bayou built by their grandfather. The Beaumont family is behind the threats.`,
      difficulty: 'intermediate',
      tags: ['main_quest', 'missing_writer', 'clue_3'],
      spawnLocationHint: 'hidden',
    },
    // Clue 4 (B1): Decision to disappear, leaving breadcrumbs
    {
      title: "Journal — La Dernière Nuit",
      titleTranslation: "Journal — The Last Night",
      textCategory: 'journal',
      cefrLevel: 'B1',
      pages: [
        {
          content: `Vendredi, 23h. Je prends ma décision ce soir. Demain matin, je quitterai ma maison. Je ne peux plus rester ici — les Beaumont ont trop d'influence. Le maire refuse de m'écouter. Même mes voisins commencent à m'éviter. Mais je ne vais pas abandonner la vérité. J'ai laissé des indices dans mes textes, éparpillés dans les endroits que j'aime : la bibliothèque, le café, l'église. Le bon lecteur saura les trouver.`,
          contentTranslation: `Friday, 11pm. I am making my decision tonight. Tomorrow morning, I will leave my house. I can no longer stay here — the Beaumonts have too much influence. The mayor refuses to listen to me. Even my neighbors are starting to avoid me. But I will not abandon the truth. I have left clues in my texts, scattered in the places I love: the library, the café, the church. The right reader will know how to find them.`,
        },
        {
          content: `J'emporte mes cahiers et le manuscrit à la cabane. Le chemin passe derrière le vieux chêne du cimetière, puis suit le sentier des pêcheurs jusqu'au coude du bayou. De là, on voit les cyprès géants — la cabane est cachée entre eux. Si vous lisez ces mots, suivez ce chemin. La vérité sur notre village vous attend.`,
          contentTranslation: `I am taking my notebooks and the manuscript to the cabin. The path goes behind the old oak tree in the cemetery, then follows the fishermen's trail to the bend in the bayou. From there, you can see the giant cypress trees — the cabin is hidden among them. If you are reading these words, follow this path. The truth about our village awaits you.`,
        },
      ],
      vocabularyHighlights: [
        { word: "indices", translation: "clues", partOfSpeech: "noun" },
        { word: "éparpillés", translation: "scattered", partOfSpeech: "adjective" },
        { word: "sentier", translation: "trail/path", partOfSpeech: "noun" },
        { word: "cimetière", translation: "cemetery", partOfSpeech: "noun" },
        { word: "chêne", translation: "oak tree", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: `Pourquoi ${writerName} quitte-t-il sa maison ?`,
          questionTranslation: `Why is ${writerName} leaving their house?`,
          options: [
            "Pour voyager",
            "Parce que les Beaumont ont trop d'influence",
            "Pour chercher du travail",
            "Parce que la maison est vieille",
          ],
          correctIndex: 1,
        },
        {
          question: "Par où passe le chemin vers la cabane ?",
          questionTranslation: "Which way does the path to the cabin go?",
          options: [
            "Par la route principale",
            "Par la rivière",
            "Derrière le vieux chêne du cimetière",
            "Par le marché",
          ],
          correctIndex: 2,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} left clues scattered in the library, café, and church. The path: behind the cemetery oak, follow the fishermen's trail to the bayou bend, look for giant cypress trees.`,
      difficulty: 'intermediate',
      tags: ['main_quest', 'missing_writer', 'clue_4'],
      spawnLocationHint: 'church',
    },
    // Clue 5 (B2): Literary farewell, final revelation through metaphor
    {
      title: "Journal — Épilogue",
      titleTranslation: "Journal — Epilogue",
      textCategory: 'journal',
      cefrLevel: 'B2',
      pages: [
        {
          content: `Celui qui prétend que la vérité triomphe toujours n'a jamais vécu dans un village où les sourires dissimulent des siècles de mensonges. Les Chitimacha le savaient — leur mot pour « mémoire » signifie aussi « racine ». On ne peut pas arracher une racine sans ébranler l'arbre tout entier. C'est précisément ce que mes découvertes font : elles ébranlent les fondations mêmes de cette communauté, construite sur des terres volées et une histoire réécrite.`,
          contentTranslation: `Whoever claims that truth always prevails has never lived in a village where smiles conceal centuries of lies. The Chitimacha knew this — their word for "memory" also means "root." You cannot uproot a root without shaking the entire tree. That is precisely what my discoveries do: they shake the very foundations of this community, built on stolen land and a rewritten history.`,
        },
        {
          content: `Je ne suis pas parti par lâcheté. Je me suis retiré pour protéger ce qui compte : les documents, le manuscrit, et la possibilité que quelqu'un, un jour, ait le courage de publier ce que je n'ai pas pu. La cabane de mon grand-père est devenue mon refuge et mon bureau. Les hérons sont mes seuls compagnons. Si vous me cherchez, ne regardez pas derrière vous — regardez là où l'eau et les racines se rencontrent, là où les anciens plantaient leurs espoirs avant qu'on les leur arrache.`,
          contentTranslation: `I did not leave out of cowardice. I withdrew to protect what matters: the documents, the manuscript, and the possibility that someone, someday, will have the courage to publish what I could not. My grandfather's cabin has become my refuge and my office. The herons are my only companions. If you are looking for me, do not look behind you — look where the water and the roots meet, where the elders planted their hopes before they were torn away.`,
        },
      ],
      vocabularyHighlights: [
        { word: "dissimulent", translation: "conceal", partOfSpeech: "verb" },
        { word: "ébranler", translation: "to shake/undermine", partOfSpeech: "verb" },
        { word: "lâcheté", translation: "cowardice", partOfSpeech: "noun" },
        { word: "refuge", translation: "refuge/shelter", partOfSpeech: "noun" },
        { word: "racines", translation: "roots", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Que signifie le mot chitimacha pour « mémoire » ?",
          questionTranslation: "What does the Chitimacha word for 'memory' also mean?",
          options: ["Arbre", "Eau", "Racine", "Terre"],
          correctIndex: 2,
        },
        {
          question: `Pourquoi ${writerName} s'est-il retiré ?`,
          questionTranslation: `Why did ${writerName} withdraw?`,
          options: [
            "Par lâcheté",
            "Pour protéger les documents et le manuscrit",
            "Pour voyager",
            "Parce qu'il était malade",
          ],
          correctIndex: 1,
        },
        {
          question: "Où faut-il chercher selon le journal ?",
          questionTranslation: "Where should you look according to the journal?",
          options: [
            "Derrière la bibliothèque",
            "Au centre du village",
            "Là où l'eau et les racines se rencontrent",
            "Dans la maison du maire",
          ],
          correctIndex: 2,
        },
      ],
      authorName: writerName,
      clueText: `${writerName} is at the grandfather's cabin — "where the water and the roots meet." They have the manuscript and original Chitimacha documents. They are alive, waiting for someone brave enough to publish the truth.`,
      difficulty: 'advanced',
      tags: ['main_quest', 'missing_writer', 'clue_5'],
      spawnLocationHint: 'hidden',
    },
  ];
}

// ── Fiction / Short Stories (3 books) ────────────────────────────────────────

function buildFiction(): TextTemplate[] {
  return [
    // A1: Children's bayou animal story
    {
      title: "Le Petit Héron Blanc",
      titleTranslation: "The Little White Heron",
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [
        {
          content: "Il y a un petit héron blanc. Il habite dans le bayou. Chaque matin, il cherche des poissons. Il est patient. Il attend longtemps. Puis — splash ! Il attrape un poisson. Le héron est content. Il rentre chez lui dans le grand cyprès.",
          contentTranslation: "There is a little white heron. It lives in the bayou. Every morning, it looks for fish. It is patient. It waits a long time. Then — splash! It catches a fish. The heron is happy. It goes home to the big cypress tree.",
        },
      ],
      vocabularyHighlights: [
        { word: "héron", translation: "heron", partOfSpeech: "noun" },
        { word: "poissons", translation: "fish", partOfSpeech: "noun" },
        { word: "patient", translation: "patient", partOfSpeech: "adjective" },
        { word: "attrape", translation: "catches", partOfSpeech: "verb" },
        { word: "content", translation: "happy", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Où habite le héron ?",
          questionTranslation: "Where does the heron live?",
          options: ["Dans la forêt", "Dans le bayou", "À la montagne", "Dans un jardin"],
          correctIndex: 1,
        },
        {
          question: "Qu'est-ce que le héron attrape ?",
          questionTranslation: "What does the heron catch?",
          options: ["Un insecte", "Une grenouille", "Un poisson", "Un crabe"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['fiction', 'bayou', 'animals'],
      spawnLocationHint: 'library',
    },
    // A2: Creole folk tale
    {
      title: "La Légende du Bayou Bleu",
      titleTranslation: "The Legend of the Blue Bayou",
      textCategory: 'book',
      cefrLevel: 'A2',
      pages: [
        {
          content: "Autrefois, il y avait une jeune fille chitimacha qui s'appelait Nayeli. Elle aimait chanter au bord du bayou. Sa voix était si belle que même les alligators l'écoutaient en silence. Un jour, un homme méchant est venu et a voulu couper les cyprès pour vendre le bois. Nayeli a chanté toute la nuit. Le matin, le bayou avait monté et les arbres étaient protégés par l'eau.",
          contentTranslation: "Long ago, there was a young Chitimacha girl named Nayeli. She loved to sing at the edge of the bayou. Her voice was so beautiful that even the alligators listened in silence. One day, a mean man came and wanted to cut down the cypress trees to sell the wood. Nayeli sang all night. In the morning, the bayou had risen and the trees were protected by the water.",
        },
        {
          content: "Depuis ce jour, les gens du village disent que quand le vent souffle dans les cyprès, c'est la voix de Nayeli qui protège encore le bayou. Les pêcheurs laissent toujours des fleurs sur l'eau pour la remercier. C'est pour cela qu'on appelle cet endroit « le Bayou Bleu » — parce que les fleurs bleues flottent sur l'eau calme.",
          contentTranslation: "Since that day, the people of the village say that when the wind blows through the cypress trees, it is Nayeli's voice still protecting the bayou. The fishermen always leave flowers on the water to thank her. That is why this place is called 'the Blue Bayou' — because the blue flowers float on the calm water.",
        },
      ],
      vocabularyHighlights: [
        { word: "légende", translation: "legend", partOfSpeech: "noun" },
        { word: "chanter", translation: "to sing", partOfSpeech: "verb" },
        { word: "alligators", translation: "alligators", partOfSpeech: "noun" },
        { word: "protégés", translation: "protected", partOfSpeech: "adjective" },
        { word: "pêcheurs", translation: "fishermen", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Comment s'appelle la jeune fille ?",
          questionTranslation: "What is the girl's name?",
          options: ["Marie", "Nayeli", "Sophie", "Louise"],
          correctIndex: 1,
        },
        {
          question: "Pourquoi l'homme méchant est-il venu ?",
          questionTranslation: "Why did the mean man come?",
          options: [
            "Pour pêcher",
            "Pour écouter Nayeli",
            "Pour couper les cyprès",
            "Pour nager dans le bayou",
          ],
          correctIndex: 2,
        },
        {
          question: "Pourquoi cet endroit s'appelle le Bayou Bleu ?",
          questionTranslation: "Why is this place called the Blue Bayou?",
          options: [
            "L'eau est bleue",
            "Le ciel est toujours bleu",
            "Des fleurs bleues flottent sur l'eau",
            "Les poissons sont bleus",
          ],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['fiction', 'folk_tale', 'chitimacha', 'bayou'],
      spawnLocationHint: 'bookshop',
    },
    // B1: Story about changing traditions
    {
      title: "Le Dernier Pêcheur du Bayou",
      titleTranslation: "The Last Fisherman of the Bayou",
      textCategory: 'book',
      cefrLevel: 'B1',
      pages: [
        {
          content: "Antoine pêchait dans le bayou depuis quarante ans, comme son père avant lui et le père de son père. Chaque matin, il sortait sa pirogue à l'aube et ne rentrait qu'au crépuscule. Mais les temps avaient changé. Les jeunes préféraient travailler en ville. Les restaurants achetaient leur poisson surgelé au supermarché. Antoine était le dernier pêcheur du bayou.",
          contentTranslation: "Antoine had been fishing in the bayou for forty years, like his father before him and his father's father. Every morning, he would take out his pirogue at dawn and not return until dusk. But times had changed. The young people preferred to work in the city. The restaurants bought their frozen fish from the supermarket. Antoine was the last fisherman of the bayou.",
        },
        {
          content: "Un après-midi, une jeune fille s'est arrêtée au bord de l'eau. « Monsieur, vous pouvez m'apprendre à pêcher ? » Antoine l'a regardée avec surprise. Personne ne lui avait posé cette question depuis des années. « Tu veux vraiment apprendre ? C'est un travail difficile. » Elle a souri. « Mon arrière-grand-mère était chitimacha. Elle disait que le bayou, c'est notre mémoire. Je veux me souvenir. » Antoine a souri aussi. Il n'était peut-être pas le dernier, finalement.",
          contentTranslation: "One afternoon, a young girl stopped at the water's edge. 'Sir, can you teach me to fish?' Antoine looked at her with surprise. Nobody had asked him that question in years. 'Do you really want to learn? It's hard work.' She smiled. 'My great-grandmother was Chitimacha. She used to say that the bayou is our memory. I want to remember.' Antoine smiled too. Perhaps he was not the last one, after all.",
        },
      ],
      vocabularyHighlights: [
        { word: "pirogue", translation: "pirogue (flat-bottomed boat)", partOfSpeech: "noun" },
        { word: "aube", translation: "dawn", partOfSpeech: "noun" },
        { word: "crépuscule", translation: "dusk", partOfSpeech: "noun" },
        { word: "surgelé", translation: "frozen", partOfSpeech: "adjective" },
        { word: "mémoire", translation: "memory", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Depuis combien de temps Antoine pêche-t-il ?",
          questionTranslation: "How long has Antoine been fishing?",
          options: ["Dix ans", "Vingt ans", "Quarante ans", "Soixante ans"],
          correctIndex: 2,
        },
        {
          question: "Pourquoi Antoine est-il le dernier pêcheur ?",
          questionTranslation: "Why is Antoine the last fisherman?",
          options: [
            "Le bayou est pollué",
            "Les jeunes préfèrent travailler en ville",
            "Il n'y a plus de poissons",
            "La pêche est interdite",
          ],
          correctIndex: 1,
        },
        {
          question: "Que disait l'arrière-grand-mère de la jeune fille ?",
          questionTranslation: "What did the girl's great-grandmother say?",
          options: [
            "Le bayou est dangereux",
            "Il faut aller en ville",
            "Le bayou, c'est notre mémoire",
            "La pêche est un mauvais métier",
          ],
          correctIndex: 2,
        },
      ],
      difficulty: 'intermediate',
      tags: ['fiction', 'traditions', 'chitimacha', 'bayou'],
      spawnLocationHint: 'cafe',
    },
  ];
}

// ── Non-fiction / Local History (3 books) ────────────────────────────────────

function buildNonFiction(): TextTemplate[] {
  return [
    // A1: Simple village description
    {
      title: "Notre Village",
      titleTranslation: "Our Village",
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [
        {
          content: "Notre village est petit. Il y a une église, un marché et un café. Les maisons sont vieilles et jolies. Les rues sont bordées de chênes. Il y a un bayou derrière le village. Les gens parlent français et anglais. Certaines personnes âgées parlent aussi créole. Le village est calme et agréable.",
          contentTranslation: "Our village is small. There is a church, a market, and a café. The houses are old and pretty. The streets are lined with oak trees. There is a bayou behind the village. The people speak French and English. Some elderly people also speak Creole. The village is calm and pleasant.",
        },
      ],
      vocabularyHighlights: [
        { word: "église", translation: "church", partOfSpeech: "noun" },
        { word: "marché", translation: "market", partOfSpeech: "noun" },
        { word: "bordées", translation: "lined", partOfSpeech: "adjective" },
        { word: "créole", translation: "Creole", partOfSpeech: "noun" },
        { word: "agréable", translation: "pleasant", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Comment est le village ?",
          questionTranslation: "How is the village?",
          options: ["Grand et moderne", "Petit et calme", "Bruyant et sale", "Nouveau et luxueux"],
          correctIndex: 1,
        },
        {
          question: "Quelles langues parle-t-on au village ?",
          questionTranslation: "What languages are spoken in the village?",
          options: [
            "Français seulement",
            "Anglais seulement",
            "Français, anglais et créole",
            "Espagnol et français",
          ],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['non_fiction', 'local_history', 'village'],
      spawnLocationHint: 'city_hall',
    },
    // A2: History of the Chitimacha people
    {
      title: "Les Chitimacha : Peuple du Bayou",
      titleTranslation: "The Chitimacha: People of the Bayou",
      textCategory: 'book',
      cefrLevel: 'A2',
      pages: [
        {
          content: "Les Chitimacha sont un peuple autochtone de Louisiane. Ils vivaient ici bien avant l'arrivée des Européens. Le mot « Chitimacha » veut dire « ceux qui ont des marmites ». Ils étaient célèbres pour leur vannerie — des paniers magnifiques faits avec des cannes de rivière. Aujourd'hui, leur réserve se trouve près de Charenton, en Louisiane.",
          contentTranslation: "The Chitimacha are an indigenous people of Louisiana. They lived here long before the arrival of Europeans. The word 'Chitimacha' means 'those who have cooking pots.' They were famous for their basketry — magnificent baskets made with river cane. Today, their reservation is located near Charenton, Louisiana.",
        },
        {
          content: "La langue chitimacha est une langue isolée — elle n'est liée à aucune autre langue au monde. Malheureusement, le dernier locuteur natif est décédé en 1940. Mais aujourd'hui, la tribu travaille dur pour faire revivre sa langue grâce aux enregistrements et aux documents anciens. C'est un effort courageux de préservation culturelle.",
          contentTranslation: "The Chitimacha language is a language isolate — it is not related to any other language in the world. Unfortunately, the last native speaker passed away in 1940. But today, the tribe works hard to revive its language thanks to recordings and ancient documents. It is a courageous effort in cultural preservation.",
        },
      ],
      vocabularyHighlights: [
        { word: "autochtone", translation: "indigenous", partOfSpeech: "adjective" },
        { word: "vannerie", translation: "basketry", partOfSpeech: "noun" },
        { word: "paniers", translation: "baskets", partOfSpeech: "noun" },
        { word: "locuteur", translation: "speaker", partOfSpeech: "noun" },
        { word: "préservation", translation: "preservation", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Que signifie le mot « Chitimacha » ?",
          questionTranslation: "What does the word 'Chitimacha' mean?",
          options: [
            "Ceux du bayou",
            "Ceux qui ont des marmites",
            "Les pêcheurs",
            "Les premiers hommes",
          ],
          correctIndex: 1,
        },
        {
          question: "Pour quoi les Chitimacha étaient-ils célèbres ?",
          questionTranslation: "What were the Chitimacha famous for?",
          options: ["La pêche", "La cuisine", "La vannerie", "La musique"],
          correctIndex: 2,
        },
        {
          question: "Quand le dernier locuteur natif est-il décédé ?",
          questionTranslation: "When did the last native speaker pass away?",
          options: ["En 1900", "En 1920", "En 1940", "En 1960"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['non_fiction', 'chitimacha', 'local_history', 'language_preservation'],
      spawnLocationHint: 'school',
    },
    // B1: Deeper regional history
    {
      title: "Bayou Lafourche : Mémoire et Vérité",
      titleTranslation: "Bayou Lafourche: Memory and Truth",
      textCategory: 'book',
      cefrLevel: 'B1',
      pages: [
        {
          content: "L'histoire officielle de notre région est incomplète. On raconte que les premiers colons ont trouvé des terres vides et fertiles. Mais la vérité est plus complexe. Les Chitimacha occupaient ces terres depuis des milliers d'années. Leur civilisation était sophistiquée : ils avaient des systèmes d'irrigation, des routes commerciales et une tradition orale riche. L'arrivée des colons français au XVIIIe siècle a provoqué la guerre des Chitimacha, un conflit sanglant qui a duré douze ans.",
          contentTranslation: "The official history of our region is incomplete. It is told that the first settlers found empty and fertile lands. But the truth is more complex. The Chitimacha had occupied these lands for thousands of years. Their civilization was sophisticated: they had irrigation systems, trade routes, and a rich oral tradition. The arrival of French settlers in the 18th century triggered the Chitimacha War, a bloody conflict that lasted twelve years.",
        },
        {
          content: "Après la guerre, les Chitimacha ont perdu la plupart de leurs terres. Les familles fondatrices du village — dont les Beaumont — ont bâti leur fortune sur ces terres confisquées. Pendant des générations, cette histoire a été effacée des archives locales. Ce n'est que récemment que des chercheurs ont commencé à rétablir la vérité, souvent face à une résistance considérable de la part des descendants des familles fondatrices.",
          contentTranslation: "After the war, the Chitimacha lost most of their lands. The founding families of the village — including the Beaumonts — built their fortune on these confiscated lands. For generations, this history was erased from the local archives. It is only recently that researchers have begun to restore the truth, often facing considerable resistance from the descendants of the founding families.",
        },
      ],
      vocabularyHighlights: [
        { word: "colons", translation: "settlers/colonists", partOfSpeech: "noun" },
        { word: "confisquées", translation: "confiscated", partOfSpeech: "adjective" },
        { word: "effacée", translation: "erased", partOfSpeech: "adjective" },
        { word: "archives", translation: "archives", partOfSpeech: "noun" },
        { word: "résistance", translation: "resistance", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Combien de temps a duré la guerre des Chitimacha ?",
          questionTranslation: "How long did the Chitimacha War last?",
          options: ["Deux ans", "Cinq ans", "Douze ans", "Vingt ans"],
          correctIndex: 2,
        },
        {
          question: "Sur quoi les familles fondatrices ont-elles bâti leur fortune ?",
          questionTranslation: "On what did the founding families build their fortune?",
          options: [
            "Le commerce de poisson",
            "Les terres confisquées aux Chitimacha",
            "Le pétrole",
            "Le tourisme",
          ],
          correctIndex: 1,
        },
      ],
      difficulty: 'intermediate',
      tags: ['non_fiction', 'local_history', 'chitimacha', 'beaumont_family'],
      spawnLocationHint: 'church',
    },
  ];
}

// ── Letters (3) ──────────────────────────────────────────────────────────────

function buildLetters(): TextTemplate[] {
  return [
    // A1: Simple letter home
    {
      title: "Lettre à Maman",
      titleTranslation: "Letter to Mom",
      textCategory: 'letter',
      cefrLevel: 'A1',
      pages: [
        {
          content: "Chère Maman,\n\nJe suis bien arrivée au village. La maison est petite mais jolie. Il y a un grand bayou derrière. Je vois des hérons chaque matin. Les voisins sont gentils. Ils m'ont donné du gumbo — c'est une soupe. C'est très bon ! Le village est calme. Je suis contente.\n\nGros bisous,\nCéline",
          contentTranslation: "Dear Mom,\n\nI arrived safely at the village. The house is small but pretty. There is a big bayou behind it. I see herons every morning. The neighbors are kind. They gave me gumbo — it's a soup. It's very good! The village is calm. I am happy.\n\nBig kisses,\nCéline",
        },
      ],
      vocabularyHighlights: [
        { word: "arrivée", translation: "arrived", partOfSpeech: "verb" },
        { word: "voisins", translation: "neighbors", partOfSpeech: "noun" },
        { word: "soupe", translation: "soup", partOfSpeech: "noun" },
        { word: "gentils", translation: "kind", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Qu'est-ce que les voisins ont donné à Céline ?",
          questionTranslation: "What did the neighbors give Céline?",
          options: ["Du pain", "Du gumbo", "Du fromage", "Du gâteau"],
          correctIndex: 1,
        },
        {
          question: "Qu'est-ce que Céline voit chaque matin ?",
          questionTranslation: "What does Céline see every morning?",
          options: ["Des chats", "Des alligators", "Des hérons", "Des canards"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['correspondence', 'daily_life', 'village'],
      spawnLocationHint: 'residence',
    },
    // A2: Teacher's letter about language preservation
    {
      title: "Lettre de la Maîtresse",
      titleTranslation: "Letter from the Teacher",
      textCategory: 'letter',
      cefrLevel: 'A2',
      pages: [
        {
          content: "Cher Monsieur le Maire,\n\nJe vous écris au sujet du programme de français à l'école. Nos enfants parlent de moins en moins français à la maison. Leurs grands-parents parlaient créole, mais cette génération est en train de perdre sa langue. Je propose de créer un cours spécial : « Nos langues, notre histoire. » Les élèves pourraient apprendre des mots en créole louisianais et découvrir l'histoire des Chitimacha.\n\nCordialement,\nMme Thibodaux",
          contentTranslation: "Dear Mr. Mayor,\n\nI am writing to you about the French program at school. Our children speak less and less French at home. Their grandparents spoke Creole, but this generation is losing its language. I propose creating a special course: 'Our Languages, Our History.' The students could learn words in Louisiana Creole and discover the history of the Chitimacha.\n\nSincerely,\nMrs. Thibodaux",
        },
      ],
      vocabularyHighlights: [
        { word: "programme", translation: "program", partOfSpeech: "noun" },
        { word: "génération", translation: "generation", partOfSpeech: "noun" },
        { word: "perdre", translation: "to lose", partOfSpeech: "verb" },
        { word: "élèves", translation: "students", partOfSpeech: "noun" },
        { word: "découvrir", translation: "to discover", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: "Quel est le problème selon Mme Thibodaux ?",
          questionTranslation: "What is the problem according to Mrs. Thibodaux?",
          options: [
            "L'école est trop petite",
            "Les enfants perdent leur langue",
            "Il n'y a pas de professeurs",
            "Les parents ne viennent pas aux réunions",
          ],
          correctIndex: 1,
        },
        {
          question: "Que propose Mme Thibodaux ?",
          questionTranslation: "What does Mrs. Thibodaux propose?",
          options: [
            "Fermer l'école",
            "Un voyage à Paris",
            "Un cours sur les langues et l'histoire locale",
            "Un nouveau professeur",
          ],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['correspondence', 'language_preservation', 'education'],
      spawnLocationHint: 'school',
    },
    // B2: Letter about the missing writer between characters
    {
      title: "Lettre au Rédacteur en Chef",
      titleTranslation: "Letter to the Editor-in-Chief",
      textCategory: 'letter',
      cefrLevel: 'B2',
      pages: [
        {
          content: "Monsieur le Rédacteur en Chef,\n\nJe me permets de vous écrire au sujet de la disparition de notre concitoyen et écrivain. Contrairement à ce que laissent entendre certaines voix bien placées dans notre communauté, il ne s'agit pas d'un simple « départ volontaire ». J'étais son ami le plus proche, et je peux vous assurer qu'il vivait dans la peur ces derniers mois. Ses recherches sur les origines du village dérangeaient des personnes influentes — des personnes dont les noms figurent sur la plaque de la mairie.",
          contentTranslation: "Dear Editor-in-Chief,\n\nI am taking the liberty of writing to you about the disappearance of our fellow citizen and writer. Contrary to what certain well-placed voices in our community suggest, this is not a simple 'voluntary departure.' I was his closest friend, and I can assure you that he lived in fear these last months. His research on the village's origins disturbed influential people — people whose names appear on the town hall plaque.",
        },
        {
          content: "Avant de disparaître, il m'a confié qu'il avait trouvé des documents qui remettraient en question la légitimité même des propriétés foncières les plus anciennes du canton. Je vous supplie de mener une enquête journalistique sérieuse. La vérité ne doit pas être sacrifiée sur l'autel de la complaisance locale. Notre village mérite de connaître son histoire — toute son histoire.\n\nVeuillez agréer mes salutations les plus respectueuses,\nDr. Philippe Landry",
          contentTranslation: "Before disappearing, he confided in me that he had found documents that would call into question the very legitimacy of the oldest land properties in the township. I beg you to conduct a serious journalistic investigation. The truth must not be sacrificed on the altar of local complacency. Our village deserves to know its history — all of its history.\n\nYours most respectfully,\nDr. Philippe Landry",
        },
      ],
      vocabularyHighlights: [
        { word: "disparition", translation: "disappearance", partOfSpeech: "noun" },
        { word: "concitoyen", translation: "fellow citizen", partOfSpeech: "noun" },
        { word: "propriétés foncières", translation: "land properties", partOfSpeech: "noun" },
        { word: "enquête", translation: "investigation", partOfSpeech: "noun" },
        { word: "complaisance", translation: "complacency", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Selon Dr. Landry, comment vivait l'écrivain avant de disparaître ?",
          questionTranslation: "According to Dr. Landry, how was the writer living before disappearing?",
          options: [
            "Heureux et calme",
            "Dans la peur",
            "En voyage",
            "Malade",
          ],
          correctIndex: 1,
        },
        {
          question: "Que remettraient en question les documents trouvés ?",
          questionTranslation: "What would the found documents call into question?",
          options: [
            "L'existence du bayou",
            "L'âge de l'église",
            "La légitimité des propriétés foncières anciennes",
            "Le nom du village",
          ],
          correctIndex: 2,
        },
      ],
      difficulty: 'advanced',
      tags: ['correspondence', 'main_quest', 'about_missing_writer'],
      spawnLocationHint: 'newspaper',
    },
  ];
}

// ── Recipes (3, Louisiana cuisine) ───────────────────────────────────────────

function buildRecipes(): TextTemplate[] {
  return [
    // A1: Beignets
    {
      title: "Beignets de la Louisiane",
      titleTranslation: "Louisiana Beignets",
      textCategory: 'recipe',
      cefrLevel: 'A1',
      pages: [
        {
          content: "🍩 Beignets\n\nIngrédients :\n- 300g de farine\n- 2 œufs\n- 200ml de lait\n- 50g de sucre\n- 1 cuillère de levure\n- De l'huile pour frire\n- Du sucre glace\n\nMélangez la farine, le sucre et la levure. Ajoutez les œufs et le lait. Mélangez bien. La pâte est épaisse. Faites chauffer l'huile. Mettez des petites boules de pâte dans l'huile. Attendez 3 minutes. Les beignets sont dorés ? C'est prêt ! Mettez du sucre glace. Bon appétit !",
          contentTranslation: "🍩 Beignets\n\nIngredients:\n- 300g flour\n- 2 eggs\n- 200ml milk\n- 50g sugar\n- 1 spoon of yeast\n- Oil for frying\n- Powdered sugar\n\nMix the flour, sugar, and yeast. Add the eggs and milk. Mix well. The dough is thick. Heat the oil. Put small balls of dough in the oil. Wait 3 minutes. The beignets are golden? It's ready! Put powdered sugar on top. Enjoy!",
        },
      ],
      vocabularyHighlights: [
        { word: "farine", translation: "flour", partOfSpeech: "noun" },
        { word: "levure", translation: "yeast", partOfSpeech: "noun" },
        { word: "pâte", translation: "dough", partOfSpeech: "noun" },
        { word: "dorés", translation: "golden", partOfSpeech: "adjective" },
        { word: "sucre glace", translation: "powdered sugar", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Combien de temps faut-il cuire les beignets ?",
          questionTranslation: "How long do you cook the beignets?",
          options: ["1 minute", "3 minutes", "5 minutes", "10 minutes"],
          correctIndex: 1,
        },
        {
          question: "Que met-on sur les beignets à la fin ?",
          questionTranslation: "What do you put on the beignets at the end?",
          options: ["Du chocolat", "Du miel", "Du sucre glace", "De la crème"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['food', 'cooking', 'louisiana', 'dessert'],
      spawnLocationHint: 'restaurant',
    },
    // A1: Gumbo (simple)
    {
      title: "Gumbo de Grand-mère",
      titleTranslation: "Grandmother's Gumbo",
      textCategory: 'recipe',
      cefrLevel: 'A1',
      pages: [
        {
          content: "🍲 Gumbo\n\nLe gumbo est une soupe. C'est le plat de la Louisiane.\n\nIngrédients :\n- Du poulet\n- Des crevettes\n- Des saucisses\n- Du riz\n- Des oignons, du céleri, des poivrons\n- Du gombo (un légume vert)\n\nCoupez le poulet et les saucisses. Coupez les légumes. Faites cuire le poulet. Ajoutez les légumes. Ajoutez de l'eau. Attendez 30 minutes. Ajoutez les crevettes. Servez sur du riz. C'est délicieux !",
          contentTranslation: "🍲 Gumbo\n\nGumbo is a soup. It is the dish of Louisiana.\n\nIngredients:\n- Chicken\n- Shrimp\n- Sausages\n- Rice\n- Onions, celery, bell peppers\n- Okra (a green vegetable)\n\nCut the chicken and the sausages. Cut the vegetables. Cook the chicken. Add the vegetables. Add water. Wait 30 minutes. Add the shrimp. Serve on rice. It's delicious!",
        },
      ],
      vocabularyHighlights: [
        { word: "poulet", translation: "chicken", partOfSpeech: "noun" },
        { word: "crevettes", translation: "shrimp", partOfSpeech: "noun" },
        { word: "saucisses", translation: "sausages", partOfSpeech: "noun" },
        { word: "légume", translation: "vegetable", partOfSpeech: "noun" },
        { word: "délicieux", translation: "delicious", partOfSpeech: "adjective" },
      ],
      comprehensionQuestions: [
        {
          question: "Qu'est-ce que le gumbo ?",
          questionTranslation: "What is gumbo?",
          options: ["Un gâteau", "Une soupe", "Une salade", "Un sandwich"],
          correctIndex: 1,
        },
        {
          question: "Combien de temps faut-il attendre après avoir ajouté les légumes ?",
          questionTranslation: "How long do you wait after adding the vegetables?",
          options: ["10 minutes", "20 minutes", "30 minutes", "60 minutes"],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['food', 'cooking', 'louisiana', 'traditional'],
      spawnLocationHint: 'restaurant',
    },
    // A2: Jambalaya
    {
      title: "Jambalaya Créole",
      titleTranslation: "Creole Jambalaya",
      textCategory: 'recipe',
      cefrLevel: 'A2',
      pages: [
        {
          content: "🍚 Jambalaya Créole\n\nLe jambalaya est un plat d'origine créole. Il ressemble à la paella espagnole parce que les premiers colons venaient d'Espagne.\n\nIngrédients (pour 6 personnes) :\n- 500g de riz\n- 300g de poulet coupé en morceaux\n- 200g de saucisse andouille\n- 200g de crevettes\n- 2 oignons, 3 branches de céleri, 2 poivrons verts\n- 400g de tomates en boîte\n- 2 gousses d'ail, sel, poivre, piment de Cayenne\n\nD'abord, faites revenir le poulet et la saucisse dans une grande marmite. Ensuite, ajoutez les oignons, le céleri et les poivrons — c'est la « sainte trinité » de la cuisine cajun. Ajoutez l'ail, les tomates et 750ml d'eau. Quand l'eau bout, ajoutez le riz et baissez le feu. Couvrez pendant 20 minutes. Ajoutez les crevettes dans les cinq dernières minutes.",
          contentTranslation: "🍚 Creole Jambalaya\n\nJambalaya is a dish of Creole origin. It resembles Spanish paella because the first settlers came from Spain.\n\nIngredients (serves 6):\n- 500g rice\n- 300g chicken cut into pieces\n- 200g andouille sausage\n- 200g shrimp\n- 2 onions, 3 celery stalks, 2 green bell peppers\n- 400g canned tomatoes\n- 2 garlic cloves, salt, pepper, cayenne pepper\n\nFirst, brown the chicken and sausage in a large pot. Then, add the onions, celery, and bell peppers — this is the 'holy trinity' of Cajun cooking. Add the garlic, tomatoes, and 750ml water. When the water boils, add the rice and lower the heat. Cover for 20 minutes. Add the shrimp in the last five minutes.",
        },
      ],
      vocabularyHighlights: [
        { word: "marmite", translation: "large pot", partOfSpeech: "noun" },
        { word: "faire revenir", translation: "to brown/sauté", partOfSpeech: "verb" },
        { word: "bout", translation: "boils", partOfSpeech: "verb" },
        { word: "baissez", translation: "lower", partOfSpeech: "verb" },
        { word: "couvrez", translation: "cover", partOfSpeech: "verb" },
      ],
      comprehensionQuestions: [
        {
          question: "Qu'est-ce que la « sainte trinité » de la cuisine cajun ?",
          questionTranslation: "What is the 'holy trinity' of Cajun cooking?",
          options: [
            "Poulet, crevettes, saucisse",
            "Sel, poivre, piment",
            "Oignons, céleri, poivrons",
            "Ail, tomates, riz",
          ],
          correctIndex: 2,
        },
        {
          question: "Pourquoi le jambalaya ressemble à la paella ?",
          questionTranslation: "Why does jambalaya resemble paella?",
          options: [
            "Ils utilisent le même riz",
            "Les premiers colons venaient d'Espagne",
            "C'est la même recette",
            "Ils ont le même goût",
          ],
          correctIndex: 1,
        },
        {
          question: "Quand ajoute-t-on les crevettes ?",
          questionTranslation: "When do you add the shrimp?",
          options: [
            "Au début",
            "Avec le poulet",
            "Avec le riz",
            "Dans les cinq dernières minutes",
          ],
          correctIndex: 3,
        },
      ],
      difficulty: 'beginner',
      tags: ['food', 'cooking', 'louisiana', 'creole', 'traditional'],
      spawnLocationHint: 'restaurant',
    },
  ];
}

// ── Poems (3, as books with 'poem' tag) ──────────────────────────────────────

function buildPoems(): TextTemplate[] {
  return [
    // A1: Simple nature poem
    {
      title: "Le Bayou le Matin",
      titleTranslation: "The Bayou in the Morning",
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [
        {
          content: "Le soleil se lève,\nL'eau est douce et calme.\nLe héron se promène,\nSous les branches des cyprès.\n\nLes poissons nagent,\nLes oiseaux chantent.\nLe bayou se réveille,\nC'est un nouveau jour.\n\nJe suis ici,\nJe regarde, j'écoute.\nLe bayou me parle,\nEt je suis en paix.",
          contentTranslation: "The sun rises,\nThe water is gentle and calm.\nThe heron walks,\nUnder the branches of the cypress trees.\n\nThe fish swim,\nThe birds sing.\nThe bayou wakes up,\nIt is a new day.\n\nI am here,\nI watch, I listen.\nThe bayou speaks to me,\nAnd I am at peace.",
        },
      ],
      vocabularyHighlights: [
        { word: "se lève", translation: "rises", partOfSpeech: "verb" },
        { word: "douce", translation: "gentle/sweet", partOfSpeech: "adjective" },
        { word: "nagent", translation: "swim", partOfSpeech: "verb" },
        { word: "se réveille", translation: "wakes up", partOfSpeech: "verb" },
        { word: "paix", translation: "peace", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Quand se passe le poème ?",
          questionTranslation: "When does the poem take place?",
          options: ["Le soir", "La nuit", "Le matin", "L'après-midi"],
          correctIndex: 2,
        },
        {
          question: "Comment se sent le narrateur ?",
          questionTranslation: "How does the narrator feel?",
          options: ["Triste", "En colère", "Fatigué", "En paix"],
          correctIndex: 3,
        },
      ],
      difficulty: 'beginner',
      tags: ['poem', 'bayou', 'nature'],
      spawnLocationHint: 'library',
    },
    // A1: Children's counting rhyme
    {
      title: "Comptine du Marché",
      titleTranslation: "Market Counting Rhyme",
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [
        {
          content: "Un, deux, trois,\nJe vais au marché.\nQuatre, cinq, six,\nJ'achète du riz.\nSept, huit, neuf,\nJe casse un œuf.\nDix, onze, douze,\nMa marmite est rouge !\n\nDans ma marmite, qu'est-ce qu'il y a ?\nDu gumbo pour toi et moi !\nDes crevettes et du poulet,\nLe meilleur plat du quartier !",
          contentTranslation: "One, two, three,\nI go to the market.\nFour, five, six,\nI buy rice.\nSeven, eight, nine,\nI crack an egg.\nTen, eleven, twelve,\nMy pot is red!\n\nIn my pot, what is there?\nGumbo for you and me!\nShrimp and chicken,\nThe best dish in the neighborhood!",
        },
      ],
      vocabularyHighlights: [
        { word: "marché", translation: "market", partOfSpeech: "noun" },
        { word: "riz", translation: "rice", partOfSpeech: "noun" },
        { word: "œuf", translation: "egg", partOfSpeech: "noun" },
        { word: "marmite", translation: "pot", partOfSpeech: "noun" },
        { word: "quartier", translation: "neighborhood", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Où va le narrateur ?",
          questionTranslation: "Where does the narrator go?",
          options: ["À l'école", "Au marché", "Au café", "À la maison"],
          correctIndex: 1,
        },
        {
          question: "Qu'est-ce qu'il y a dans la marmite ?",
          questionTranslation: "What is in the pot?",
          options: ["De la soupe", "Du gumbo", "Des crêpes", "Du chocolat"],
          correctIndex: 1,
        },
      ],
      difficulty: 'beginner',
      tags: ['poem', 'counting', 'food', 'louisiana'],
      spawnLocationHint: 'school',
    },
    // A2: Poem about memory and roots
    {
      title: "Les Racines",
      titleTranslation: "The Roots",
      textCategory: 'book',
      cefrLevel: 'A2',
      pages: [
        {
          content: "Sous les eaux sombres du bayou,\nLes racines des cyprès s'entrelacent,\nComme les histoires de nos ancêtres\nQui refusent de s'effacer.\n\nMa grand-mère parlait créole,\nSon sourire avait le goût du café.\nElle disait : « N'oublie jamais\nD'où tu viens, mon enfant. »\n\nLes langues se perdent comme des feuilles\nEmportées par le courant.\nMais les racines restent, profondes,\nEt un jour, les feuilles reviennent.",
          contentTranslation: "Under the dark waters of the bayou,\nThe roots of the cypress trees intertwine,\nLike the stories of our ancestors\nThat refuse to fade away.\n\nMy grandmother spoke Creole,\nHer smile had the taste of coffee.\nShe used to say: 'Never forget\nWhere you come from, my child.'\n\nLanguages are lost like leaves\nCarried away by the current.\nBut the roots remain, deep,\nAnd one day, the leaves return.",
        },
      ],
      vocabularyHighlights: [
        { word: "racines", translation: "roots", partOfSpeech: "noun" },
        { word: "s'entrelacent", translation: "intertwine", partOfSpeech: "verb" },
        { word: "ancêtres", translation: "ancestors", partOfSpeech: "noun" },
        { word: "s'effacer", translation: "to fade away", partOfSpeech: "verb" },
        { word: "courant", translation: "current", partOfSpeech: "noun" },
      ],
      comprehensionQuestions: [
        {
          question: "Quelle langue parlait la grand-mère ?",
          questionTranslation: "What language did the grandmother speak?",
          options: ["Français", "Anglais", "Créole", "Chitimacha"],
          correctIndex: 2,
        },
        {
          question: "À quoi les langues perdues sont-elles comparées ?",
          questionTranslation: "What are lost languages compared to?",
          options: [
            "Des pierres",
            "Des feuilles emportées par le courant",
            "Des oiseaux",
            "Des étoiles",
          ],
          correctIndex: 1,
        },
        {
          question: "Que disait la grand-mère ?",
          questionTranslation: "What did the grandmother say?",
          options: [
            "Sois fort",
            "Étudie bien",
            "N'oublie jamais d'où tu viens",
            "Mange bien",
          ],
          correctIndex: 2,
        },
      ],
      difficulty: 'beginner',
      tags: ['poem', 'memory', 'creole', 'language_preservation'],
      spawnLocationHint: 'cafe',
    },
  ];
}

// ── LLM generation prompt template ───────────────────────────────────────────

/**
 * Builds a prompt template for LLM-based text generation that enforces:
 * target language, CEFR constraints, clue embedding, and world-contextual content.
 */
export function buildTextGenerationPrompt(options: {
  targetLanguage: string;
  cefrLevel: CefrLevel;
  textCategory: TextCategory;
  genre?: string;
  topic?: string;
  writerName?: string;
  clueToEmbed?: string;
  settlementName?: string;
  characterNames?: string[];
  locationNames?: string[];
}): string {
  const {
    targetLanguage,
    cefrLevel,
    textCategory,
    genre,
    topic,
    writerName,
    clueToEmbed,
    settlementName,
    characterNames,
    locationNames,
  } = options;

  const cefrConstraints: Record<CefrLevel, string> = {
    A1: "Use only present tense. Sentences of 5-8 words max. Basic vocabulary (family, food, colors, animals, daily routine). No subordinate clauses. No idioms.",
    A2: "Use present and passé composé. Sentences up to 12 words. Basic connectors (mais, parce que, quand). Simple descriptions and narration. Everyday vocabulary.",
    B1: "Use all common tenses including imparfait, plus-que-parfait, and conditional. Complex sentences with subordination. Idiomatic expressions allowed. Topic-specific vocabulary.",
    B2: "Literary register. Subjunctive mood, passive voice, complex relative clauses. Metaphor, irony, and nuance. Sophisticated vocabulary. Cultural references.",
    C1: "Academic and literary register. Complex argumentation with nuanced hedging. Implicit meaning, irony, and sophisticated rhetorical devices. Specialized and abstract vocabulary.",
    C2: "Native-level mastery. Archaic forms, dialectal variation, dense cultural allusions. Full range of literary devices. Highly specialized and rare vocabulary. Pragmatic subtlety.",
  };

  const writerStyle = writerName
    ? `\n\nWRITER CHARACTER: This text is written by "${writerName}", a local writer who has disappeared. Use a distinctive first-person voice: introspective, poetic, with references to the bayou and nature metaphors. The writer is investigating hidden local history and feels threatened.`
    : '';

  const clueInstruction = clueToEmbed
    ? `\n\nCLUE EMBEDDING: Naturally weave the following clue into the text (do NOT state it directly — the reader should infer it): "${clueToEmbed}"`
    : '';

  const worldContext = [
    settlementName && `Settlement: ${settlementName}`,
    characterNames?.length && `Characters to reference: ${characterNames.join(', ')}`,
    locationNames?.length && `Locations to reference: ${locationNames.join(', ')}`,
  ].filter(Boolean).join('\n');

  return `Generate a ${textCategory} text for a language-learning game.

TARGET LANGUAGE: ${targetLanguage}
CEFR LEVEL: ${cefrLevel}
${genre ? `GENRE: ${genre}` : ''}
${topic ? `TOPIC: ${topic}` : ''}

CEFR CONSTRAINTS (${cefrLevel}):
${cefrConstraints[cefrLevel]}

${worldContext ? `WORLD CONTEXT:\n${worldContext}` : ''}
CULTURAL SETTING: Louisiana Creole / Chitimacha indigenous culture. The story takes place in a small bayou village with French-speaking inhabitants, Creole traditions, and connections to the Chitimacha people.${writerStyle}${clueInstruction}

OUTPUT FORMAT (JSON):
{
  "title": "Title in ${targetLanguage}",
  "titleTranslation": "Title in English",
  "pages": [
    {
      "content": "Text in ${targetLanguage} (100-200 words for A1/A2, 200-400 words for B1/B2)",
      "contentTranslation": "Faithful English translation"
    }
  ],
  "vocabularyHighlights": [
    { "word": "word in ${targetLanguage}", "translation": "English", "partOfSpeech": "noun|verb|adjective|adverb" }
  ] (provide 3-5 highlights),
  "comprehensionQuestions": [
    {
      "question": "Question in ${targetLanguage}",
      "questionTranslation": "Question in English",
      "options": ["4 options in ${targetLanguage}"],
      "correctIndex": 0
    }
  ] (provide 2-3 questions)
}

IMPORTANT:
- ALL content text must be in ${targetLanguage}
- ALL translations must be in English
- Vocabulary highlights should target words the learner likely does not know at this CEFR level
- Comprehension questions should test understanding of the text, not grammar
- Questions must have exactly 4 options with one correct answer
- Content must feel authentic and culturally grounded, not like a textbook exercise`;
}

// ── Main builder ─────────────────────────────────────────────────────────────

/**
 * Build all seed texts for a world. Returns InsertGameText[] ready to be saved.
 * Generates 20 texts: 5 writer journals, 3 fiction, 3 non-fiction, 3 letters, 3 recipes, 3 poems.
 * CEFR distribution: 8×A1, 6×A2, 4×B1, 2×B2.
 */
export function buildSeedTexts(options: TextSeedOptions): InsertGameText[] {
  const { worldId, targetLanguage, writerName = "Jean-Luc Moreau" } = options;

  const allTemplates: TextTemplate[] = [
    ...buildWriterJournals(writerName),
    ...buildFiction(),
    ...buildNonFiction(),
    ...buildLetters(),
    ...buildRecipes(),
    ...buildPoems(),
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
    generationPrompt: buildTextGenerationPrompt({
      targetLanguage,
      cefrLevel: t.cefrLevel,
      textCategory: t.textCategory,
      topic: t.tags[0],
      writerName: t.authorName,
    }),
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
