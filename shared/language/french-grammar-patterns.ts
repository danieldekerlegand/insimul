/**
 * French Grammar Pattern Definitions
 *
 * Provides canonical grammar pattern definitions for French with
 * explanations, examples, and difficulty tiers. Used to seed
 * GrammarPattern records in LanguageProgress and to configure
 * grammar-focused quest objectives.
 */

export type FrenchDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type FrenchGrammarCategory =
  | 'articles'
  | 'adjectives'
  | 'verbs'
  | 'pronouns'
  | 'negation'
  | 'questions'
  | 'prepositions'
  | 'syntax';

/**
 * A grammar pattern definition with pedagogical content.
 * These are templates — actual player tracking uses GrammarPattern from progress.ts.
 */
export interface FrenchGrammarPatternDef {
  /** Unique pattern identifier matching grammarFocus values */
  id: string;
  /** Human-readable name */
  name: string;
  /** Which grammar category this belongs to */
  category: FrenchGrammarCategory;
  /** Difficulty tier */
  difficulty: FrenchDifficulty;
  /** Short explanation of the rule */
  explanation: string;
  /** Correct usage examples (French with English translation) */
  examples: { french: string; english: string }[];
  /** Common mistakes learners make */
  commonErrors: { incorrect: string; correct: string; why: string }[];
  /** Pattern strings used in GrammarFocusConfig.grammarPatterns */
  patternTags: string[];
}

/**
 * All French grammar pattern definitions organized for language learning.
 */
export const FRENCH_GRAMMAR_PATTERNS: FrenchGrammarPatternDef[] = [
  // ── Articles ────────────────────────────────────────────────────────────

  {
    id: 'definite_articles',
    name: 'Definite Articles',
    category: 'articles',
    difficulty: 'beginner',
    explanation:
      'French has four definite articles: le (masculine singular), la (feminine singular), l\' (before vowel/silent h), and les (plural). They must agree with the noun in gender and number.',
    examples: [
      { french: 'Le chat dort.', english: 'The cat is sleeping.' },
      { french: 'La maison est grande.', english: 'The house is big.' },
      { french: "L'école est fermée.", english: 'The school is closed.' },
      { french: 'Les enfants jouent.', english: 'The children are playing.' },
    ],
    commonErrors: [
      { incorrect: 'Le école', correct: "L'école", why: "Use l' before a vowel sound." },
      { incorrect: 'Le maison', correct: 'La maison', why: 'Maison is feminine — use la.' },
    ],
    patternTags: ['definite articles', 'article agreement'],
  },

  {
    id: 'indefinite_articles',
    name: 'Indefinite Articles',
    category: 'articles',
    difficulty: 'beginner',
    explanation:
      'French indefinite articles are un (masculine), une (feminine), and des (plural). They correspond to "a/an" and "some" in English.',
    examples: [
      { french: "J'ai un livre.", english: 'I have a book.' },
      { french: 'Elle a une idée.', english: 'She has an idea.' },
      { french: 'Il y a des pommes.', english: 'There are some apples.' },
    ],
    commonErrors: [
      { incorrect: 'un idée', correct: 'une idée', why: 'Idée is feminine — use une.' },
      { incorrect: 'J\'ai de livres', correct: "J'ai des livres", why: 'Use des for plural indefinite, not de alone.' },
    ],
    patternTags: ['indefinite articles', 'article agreement'],
  },

  {
    id: 'partitive_articles',
    name: 'Partitive Articles',
    category: 'articles',
    difficulty: 'intermediate',
    explanation:
      'Partitive articles (du, de la, de l\', des) express an unspecified quantity — "some" or "any". They change to de/d\' after negation.',
    examples: [
      { french: 'Je veux du pain.', english: 'I want some bread.' },
      { french: 'Elle boit de la limonade.', english: 'She drinks some lemonade.' },
      { french: "Je ne veux pas de pain.", english: "I don't want any bread." },
    ],
    commonErrors: [
      { incorrect: 'Je ne veux pas du pain', correct: 'Je ne veux pas de pain', why: 'After negation, du/de la become de.' },
      { incorrect: 'Je veux de pain', correct: 'Je veux du pain', why: 'In affirmative sentences use the full partitive, not just de.' },
    ],
    patternTags: ['partitive articles', 'article agreement'],
  },

  // ── Adjectives ──────────────────────────────────────────────────────────

  {
    id: 'adjective_agreement',
    name: 'Adjective Agreement',
    category: 'adjectives',
    difficulty: 'beginner',
    explanation:
      'French adjectives must agree in gender and number with the noun they modify. Generally add -e for feminine, -s for plural, -es for feminine plural.',
    examples: [
      { french: 'Un petit garçon.', english: 'A small boy.' },
      { french: 'Une petite fille.', english: 'A small girl.' },
      { french: 'De petits garçons.', english: 'Small boys.' },
      { french: 'De petites filles.', english: 'Small girls.' },
    ],
    commonErrors: [
      { incorrect: 'une petit fille', correct: 'une petite fille', why: 'Add -e to match the feminine noun.' },
      { incorrect: 'les grand maisons', correct: 'les grandes maisons', why: 'Adjective needs both feminine -e and plural -s.' },
    ],
    patternTags: ['adjective agreement', 'gender agreement'],
  },

  {
    id: 'adjective_placement',
    name: 'Adjective Placement',
    category: 'adjectives',
    difficulty: 'intermediate',
    explanation:
      'Most French adjectives follow the noun, unlike English. A small group (BANGS: Beauty, Age, Number, Goodness, Size) come before the noun.',
    examples: [
      { french: 'Une voiture rouge.', english: 'A red car.' },
      { french: 'Un beau jardin.', english: 'A beautiful garden.' },
      { french: 'Une vieille maison.', english: 'An old house.' },
      { french: 'Un livre intéressant.', english: 'An interesting book.' },
    ],
    commonErrors: [
      { incorrect: 'une rouge voiture', correct: 'une voiture rouge', why: 'Color adjectives follow the noun.' },
      { incorrect: 'une maison belle', correct: 'une belle maison', why: 'Beauty adjectives (BANGS) precede the noun.' },
    ],
    patternTags: ['adjective placement', 'word order'],
  },

  // ── Verbs ───────────────────────────────────────────────────────────────

  {
    id: 'present_tense',
    name: 'Present Tense Conjugation',
    category: 'verbs',
    difficulty: 'beginner',
    explanation:
      'French verbs are grouped into three conjugations: -er (parler), -ir (finir), -re (vendre). Each has regular endings. Many common verbs (être, avoir, aller, faire) are irregular.',
    examples: [
      { french: 'Je parle français.', english: 'I speak French.' },
      { french: 'Nous finissons le travail.', english: 'We finish the work.' },
      { french: 'Il vend des livres.', english: 'He sells books.' },
      { french: 'Elles sont contentes.', english: 'They are happy.' },
    ],
    commonErrors: [
      { incorrect: 'Je parles', correct: 'Je parle', why: 'First person singular -er verbs end in -e, not -es.' },
      { incorrect: 'Il a content', correct: 'Il est content', why: 'Use être (not avoir) for states/adjectives.' },
    ],
    patternTags: ['present tense', 'verb conjugation'],
  },

  {
    id: 'past_tense_passe_compose',
    name: 'Passé Composé',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation:
      'The passé composé is formed with an auxiliary (avoir or être) + past participle. Most verbs use avoir; movement/state-change verbs and all reflexives use être. With être, the participle agrees with the subject.',
    examples: [
      { french: "J'ai mangé une pomme.", english: 'I ate an apple.' },
      { french: 'Elle est allée au marché.', english: 'She went to the market.' },
      { french: 'Nous avons fini.', english: 'We have finished.' },
      { french: 'Ils se sont levés tôt.', english: 'They got up early.' },
    ],
    commonErrors: [
      { incorrect: "J'ai allé", correct: 'Je suis allé', why: 'Aller uses être as its auxiliary.' },
      { incorrect: 'Elle est allé', correct: 'Elle est allée', why: 'With être, add -e for feminine subjects.' },
    ],
    patternTags: ['past tense', 'passé composé', 'verb conjugation', 'past participle agreement'],
  },

  {
    id: 'imparfait',
    name: 'Imparfait (Imperfect Tense)',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation:
      'The imparfait describes ongoing or habitual past actions, background descriptions, and states. Formed from the nous-form present stem + endings: -ais, -ais, -ait, -ions, -iez, -aient.',
    examples: [
      { french: 'Quand j\'étais petit, je jouais dehors.', english: 'When I was small, I used to play outside.' },
      { french: 'Il faisait beau ce jour-là.', english: 'The weather was nice that day.' },
      { french: 'Nous habitions à Paris.', english: 'We used to live in Paris.' },
    ],
    commonErrors: [
      { incorrect: "Quand j'ai été petit", correct: "Quand j'étais petit", why: 'Ongoing past states use imparfait, not passé composé.' },
      { incorrect: 'Je jouait', correct: 'Je jouais', why: 'First person imparfait ends in -ais, not -ait.' },
    ],
    patternTags: ['imparfait', 'past tense', 'verb conjugation'],
  },

  {
    id: 'futur_simple',
    name: 'Future Simple',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation:
      'The futur simple is formed by adding endings (-ai, -as, -a, -ons, -ez, -ont) to the infinitive (or irregular stem). Used for future plans, predictions, and promises.',
    examples: [
      { french: 'Je parlerai avec lui demain.', english: 'I will speak with him tomorrow.' },
      { french: 'Nous irons à la plage.', english: 'We will go to the beach.' },
      { french: 'Il fera chaud cet été.', english: 'It will be hot this summer.' },
    ],
    commonErrors: [
      { incorrect: 'Je allerai', correct: "J'irai", why: 'Aller has an irregular future stem: ir-.' },
      { incorrect: 'Nous parleront', correct: 'Nous parlerons', why: 'Nous takes -ons, not -ont (that is ils/elles).' },
    ],
    patternTags: ['future tense', 'verb conjugation'],
  },

  {
    id: 'subject_verb_agreement',
    name: 'Subject-Verb Agreement',
    category: 'verbs',
    difficulty: 'beginner',
    explanation:
      'French verbs must agree with their subject in person and number. Each of the six forms (je, tu, il/elle, nous, vous, ils/elles) typically has a distinct ending.',
    examples: [
      { french: 'Je suis fatigué.', english: 'I am tired.' },
      { french: 'Vous êtes prêts ?', english: 'Are you ready?' },
      { french: 'Les filles chantent bien.', english: 'The girls sing well.' },
    ],
    commonErrors: [
      { incorrect: 'Les filles chante', correct: 'Les filles chantent', why: 'Plural subjects need the third-person plural ending -ent.' },
      { incorrect: 'Nous est contents', correct: 'Nous sommes contents', why: 'Use the nous form of être: sommes.' },
    ],
    patternTags: ['subject-verb agreement', 'verb conjugation'],
  },

  {
    id: 'subjunctive',
    name: 'Subjunctive Mood',
    category: 'verbs',
    difficulty: 'advanced',
    explanation:
      'The subjonctif is used after expressions of desire, doubt, emotion, or necessity (il faut que, je veux que, bien que). Formed from the ils-form present stem + endings: -e, -es, -e, -ions, -iez, -ent.',
    examples: [
      { french: 'Il faut que tu viennes.', english: 'You must come.' },
      { french: 'Je veux que nous parlions.', english: 'I want us to talk.' },
      { french: 'Bien qu\'il soit tard, je reste.', english: 'Although it is late, I am staying.' },
    ],
    commonErrors: [
      { incorrect: 'Il faut que tu viens', correct: 'Il faut que tu viennes', why: 'After il faut que, use subjunctive, not indicative.' },
      { incorrect: 'Je veux que nous parlons', correct: 'Je veux que nous parlions', why: 'Verbs after que + desire/will take the subjunctive.' },
    ],
    patternTags: ['subjunctive', 'verb conjugation'],
  },

  {
    id: 'conditional',
    name: 'Conditional Mood',
    category: 'verbs',
    difficulty: 'advanced',
    explanation:
      'The conditionnel uses the future stem + imparfait endings (-ais, -ais, -ait, -ions, -iez, -aient). Used for politeness, hypotheticals, and wishes.',
    examples: [
      { french: 'Je voudrais un café, s\'il vous plaît.', english: 'I would like a coffee, please.' },
      { french: "Si j'avais le temps, je voyagerais.", english: 'If I had the time, I would travel.' },
      { french: 'Pourriez-vous m\'aider ?', english: 'Could you help me?' },
    ],
    commonErrors: [
      { incorrect: "Si j'aurais le temps", correct: "Si j'avais le temps", why: "After si (if), use imparfait — never conditionnel. The conditionnel goes in the result clause." },
      { incorrect: 'Je voudrait', correct: 'Je voudrais', why: 'First person conditionnel ends in -ais, not -ait.' },
    ],
    patternTags: ['conditional', 'verb conjugation', 'formal register'],
  },

  // ── Pronouns ────────────────────────────────────────────────────────────

  {
    id: 'direct_object_pronouns',
    name: 'Direct Object Pronouns',
    category: 'pronouns',
    difficulty: 'intermediate',
    explanation:
      'Direct object pronouns (me, te, le/la, nous, vous, les) replace a noun receiving the action directly. They go before the conjugated verb (or before the infinitive).',
    examples: [
      { french: 'Je le vois.', english: 'I see him/it.' },
      { french: 'Elle les achète.', english: 'She buys them.' },
      { french: 'Tu me comprends ?', english: 'Do you understand me?' },
    ],
    commonErrors: [
      { incorrect: 'Je vois le', correct: 'Je le vois', why: 'Object pronouns go before the verb in French.' },
      { incorrect: 'Elle achète les', correct: 'Elle les achète', why: 'Place les before the verb, not after.' },
    ],
    patternTags: ['object pronouns', 'pronoun placement'],
  },

  {
    id: 'indirect_object_pronouns',
    name: 'Indirect Object Pronouns',
    category: 'pronouns',
    difficulty: 'intermediate',
    explanation:
      'Indirect object pronouns (me, te, lui, nous, vous, leur) replace a noun preceded by à. They also go before the conjugated verb.',
    examples: [
      { french: 'Je lui parle.', english: 'I speak to him/her.' },
      { french: 'Elle leur donne des cadeaux.', english: 'She gives them gifts.' },
      { french: 'Il nous écrit.', english: 'He writes to us.' },
    ],
    commonErrors: [
      { incorrect: 'Je parle lui', correct: 'Je lui parle', why: 'Indirect object pronouns go before the verb.' },
      { incorrect: 'Je les parle', correct: 'Je leur parle', why: 'Parler à uses indirect (leur), not direct (les).' },
    ],
    patternTags: ['object pronouns', 'pronoun placement'],
  },

  {
    id: 'pronoun_y_en',
    name: 'Pronouns Y and En',
    category: 'pronouns',
    difficulty: 'advanced',
    explanation:
      'Y replaces à + location/thing ("there" / "to it"). En replaces de + noun ("some" / "of it/them"). Both go before the conjugated verb.',
    examples: [
      { french: "J'y vais demain.", english: "I'm going there tomorrow." },
      { french: "J'en veux trois.", english: 'I want three (of them).' },
      { french: 'Tu y penses ?', english: 'Are you thinking about it?' },
      { french: "Elle n'en a pas.", english: "She doesn't have any." },
    ],
    commonErrors: [
      { incorrect: 'Je vais y', correct: "J'y vais", why: 'Y goes before the conjugated verb.' },
      { incorrect: 'Je veux trois de eux', correct: "J'en veux trois", why: 'Use en to replace de + noun, not a full prepositional phrase.' },
    ],
    patternTags: ['pronoun y', 'pronoun en', 'pronoun placement'],
  },

  // ── Negation ────────────────────────────────────────────────────────────

  {
    id: 'basic_negation',
    name: 'Basic Negation',
    category: 'negation',
    difficulty: 'beginner',
    explanation:
      'French negation wraps the conjugated verb with ne...pas. In spoken French ne is often dropped, but it is required in writing. With compound tenses, ne...pas wraps the auxiliary.',
    examples: [
      { french: 'Je ne parle pas anglais.', english: "I don't speak English." },
      { french: "Il n'a pas mangé.", english: "He didn't eat." },
      { french: 'Nous ne sommes pas prêts.', english: "We aren't ready." },
    ],
    commonErrors: [
      { incorrect: 'Je parle pas', correct: 'Je ne parle pas', why: 'Include ne in written French.' },
      { incorrect: "Je n'ai mangé pas", correct: "Je n'ai pas mangé", why: 'Pas goes after the auxiliary, before the past participle.' },
    ],
    patternTags: ['negation', 'ne...pas'],
  },

  {
    id: 'advanced_negation',
    name: 'Advanced Negation Forms',
    category: 'negation',
    difficulty: 'advanced',
    explanation:
      'Beyond ne...pas, French has ne...jamais (never), ne...rien (nothing), ne...plus (no longer), ne...personne (nobody), and ne...que (only). Each replaces pas.',
    examples: [
      { french: 'Je ne mange jamais de viande.', english: 'I never eat meat.' },
      { french: 'Il ne dit rien.', english: 'He says nothing.' },
      { french: 'Elle ne travaille plus ici.', english: 'She no longer works here.' },
      { french: 'Je ne bois que de l\'eau.', english: 'I only drink water.' },
    ],
    commonErrors: [
      { incorrect: 'Je ne mange pas jamais', correct: 'Je ne mange jamais', why: 'Jamais replaces pas — don\'t use both.' },
      { incorrect: 'Il ne dit pas rien', correct: 'Il ne dit rien', why: 'Rien replaces pas entirely.' },
    ],
    patternTags: ['negation', 'ne...jamais', 'ne...rien'],
  },

  // ── Questions ───────────────────────────────────────────────────────────

  {
    id: 'question_formation',
    name: 'Question Formation',
    category: 'questions',
    difficulty: 'beginner',
    explanation:
      'French has three ways to ask yes/no questions: (1) rising intonation, (2) est-ce que + statement, (3) inversion (subject-verb swap). Inversion is more formal.',
    examples: [
      { french: 'Tu parles français ?', english: 'You speak French? (intonation)' },
      { french: 'Est-ce que tu parles français ?', english: 'Do you speak French? (est-ce que)' },
      { french: 'Parles-tu français ?', english: 'Do you speak French? (inversion)' },
    ],
    commonErrors: [
      { incorrect: 'Est-ce que parles-tu', correct: 'Est-ce que tu parles', why: "Don't combine est-ce que with inversion." },
      { incorrect: 'Parle-tu', correct: 'Parles-tu', why: 'Add -s to first conjugation verbs in inverted tu-form.' },
    ],
    patternTags: ['question formation', 'inversion'],
  },

  {
    id: 'interrogative_words',
    name: 'Interrogative Words',
    category: 'questions',
    difficulty: 'intermediate',
    explanation:
      'French question words: qui (who), que/quoi (what), où (where), quand (when), pourquoi (why), comment (how), combien (how much/many), quel/quelle (which). They combine with est-ce que or inversion.',
    examples: [
      { french: 'Où habites-tu ?', english: 'Where do you live?' },
      { french: "Qu'est-ce que tu fais ?", english: 'What are you doing?' },
      { french: 'Combien ça coûte ?', english: 'How much does it cost?' },
      { french: 'Pourquoi es-tu en retard ?', english: 'Why are you late?' },
    ],
    commonErrors: [
      { incorrect: 'Que tu fais ?', correct: "Qu'est-ce que tu fais ?", why: 'Que as subject complement needs est-ce que or inversion.' },
      { incorrect: 'Quel heure est-il ?', correct: 'Quelle heure est-il ?', why: 'Heure is feminine — use quelle.' },
    ],
    patternTags: ['question formation', 'interrogative words'],
  },

  // ── Prepositions ────────────────────────────────────────────────────────

  {
    id: 'prepositions_location',
    name: 'Prepositions with Places',
    category: 'prepositions',
    difficulty: 'intermediate',
    explanation:
      'French uses different prepositions for places: à (cities), en (feminine countries/continents), au (masculine countries), aux (plural countries). "From" uses de/d\', du, des accordingly.',
    examples: [
      { french: "J'habite à Paris.", english: 'I live in Paris.' },
      { french: 'Elle va en France.', english: 'She is going to France.' },
      { french: 'Il travaille au Canada.', english: 'He works in Canada.' },
      { french: 'Nous allons aux États-Unis.', english: 'We are going to the United States.' },
    ],
    commonErrors: [
      { incorrect: 'Je vais à France', correct: 'Je vais en France', why: 'Feminine countries take en, not à.' },
      { incorrect: 'Il habite en Canada', correct: 'Il habite au Canada', why: 'Canada is masculine — use au.' },
    ],
    patternTags: ['prepositions', 'location prepositions'],
  },

  // ── Syntax ──────────────────────────────────────────────────────────────

  {
    id: 'formal_register',
    name: 'Formal Register (Vous vs Tu)',
    category: 'syntax',
    difficulty: 'beginner',
    explanation:
      'French distinguishes formal vous and informal tu for "you". Use vous with strangers, elders, authority figures, and in professional settings. Tu is for friends, family, children, and peers.',
    examples: [
      { french: 'Comment allez-vous ?', english: 'How are you? (formal)' },
      { french: 'Comment vas-tu ?', english: 'How are you? (informal)' },
      { french: 'Pourriez-vous répéter ?', english: 'Could you repeat? (formal)' },
      { french: 'Tu peux répéter ?', english: 'Can you repeat? (informal)' },
    ],
    commonErrors: [
      { incorrect: 'Tu pouvez', correct: 'Vous pouvez', why: 'Pouvez is the vous form — use vous, not tu.' },
      { incorrect: 'Comment allez-tu ?', correct: 'Comment vas-tu ?', why: 'Allez is the vous form; use vas with tu.' },
    ],
    patternTags: ['formal register', 'polite forms', 'tu vs vous'],
  },

  {
    id: 'avoir_expressions',
    name: 'Avoir Expressions',
    category: 'syntax',
    difficulty: 'beginner',
    explanation:
      'French uses avoir (to have) where English uses "to be" for many common expressions: avoir faim (to be hungry), avoir soif (thirsty), avoir chaud/froid (hot/cold), avoir peur (afraid), avoir raison/tort (right/wrong), avoir ___ ans (to be ___ years old).',
    examples: [
      { french: "J'ai faim.", english: 'I am hungry.' },
      { french: 'Elle a vingt ans.', english: 'She is twenty years old.' },
      { french: 'Nous avons froid.', english: 'We are cold.' },
      { french: 'Tu as raison.', english: 'You are right.' },
    ],
    commonErrors: [
      { incorrect: 'Je suis faim', correct: "J'ai faim", why: "Use avoir, not être, for hunger — it's 'I have hunger' in French." },
      { incorrect: 'Elle est vingt ans', correct: 'Elle a vingt ans', why: "Age uses avoir — 'she has twenty years'." },
    ],
    patternTags: ['avoir expressions', 'idiomatic expressions'],
  },

  {
    id: 'reflexive_verbs',
    name: 'Reflexive Verbs',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation:
      'Reflexive verbs use a reflexive pronoun (me, te, se, nous, vous, se) matching the subject. Common examples: se lever (get up), se laver (wash oneself), s\'appeler (to be called). In passé composé, reflexives always use être.',
    examples: [
      { french: 'Je me lève à sept heures.', english: 'I get up at seven.' },
      { french: 'Comment vous appelez-vous ?', english: 'What is your name?' },
      { french: 'Ils se sont couchés tard.', english: 'They went to bed late.' },
    ],
    commonErrors: [
      { incorrect: 'Je lève', correct: 'Je me lève', why: 'Se lever is reflexive — include the pronoun me.' },
      { incorrect: 'Elle s\'a lavée', correct: "Elle s'est lavée", why: 'Reflexive verbs use être in passé composé, not avoir.' },
    ],
    patternTags: ['reflexive verbs', 'verb conjugation'],
  },
];

// ── Lookup Helpers ──────────────────────────────────────────────────────────

/** Get all patterns for a given difficulty level. */
export function getPatternsByDifficulty(difficulty: FrenchDifficulty): FrenchGrammarPatternDef[] {
  return FRENCH_GRAMMAR_PATTERNS.filter(p => p.difficulty === difficulty);
}

/** Get all patterns in a given category. */
export function getPatternsByCategory(category: FrenchGrammarCategory): FrenchGrammarPatternDef[] {
  return FRENCH_GRAMMAR_PATTERNS.filter(p => p.category === category);
}

/** Find a pattern by its id. */
export function getPatternById(id: string): FrenchGrammarPatternDef | undefined {
  return FRENCH_GRAMMAR_PATTERNS.find(p => p.id === id);
}

/**
 * Find patterns whose patternTags match a given grammar focus tag.
 * Uses case-insensitive partial matching, consistent with GrammarTriggerAnalyzer.
 */
export function getPatternsByTag(tag: string): FrenchGrammarPatternDef[] {
  const lower = tag.toLowerCase();
  return FRENCH_GRAMMAR_PATTERNS.filter(p =>
    p.patternTags.some(t => t.toLowerCase().includes(lower) || lower.includes(t.toLowerCase())),
  );
}

/**
 * Convert a FrenchGrammarPatternDef into the GrammarPattern shape used in LanguageProgress.
 * Initializes tracking fields to zero/empty.
 */
export function toGrammarPattern(def: FrenchGrammarPatternDef): {
  id: string;
  pattern: string;
  language: string;
  timesUsedCorrectly: number;
  timesUsedIncorrectly: number;
  mastered: boolean;
  examples: string[];
  explanations: string[];
} {
  return {
    id: def.id,
    pattern: def.name,
    language: 'fr',
    timesUsedCorrectly: 0,
    timesUsedIncorrectly: 0,
    mastered: false,
    examples: def.examples.map(e => e.french),
    explanations: [def.explanation],
  };
}

/**
 * Build a GrammarFocusConfig from a pattern definition.
 * Useful for creating grammar-focused quest objectives from pattern defs.
 */
export function toGrammarFocusConfig(def: FrenchGrammarPatternDef, requiredAccuracy = 70, requiredCorrectUses = 5): {
  grammarFocus: string;
  grammarPatterns: string[];
  requiredAccuracy: number;
  requiredCorrectUses: number;
} {
  return {
    grammarFocus: def.id,
    grammarPatterns: def.patternTags,
    requiredAccuracy,
    requiredCorrectUses,
  };
}
