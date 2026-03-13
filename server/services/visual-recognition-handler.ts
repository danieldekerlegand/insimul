/**
 * Visual Recognition Task Handler
 *
 * Handles assessment tasks where participants identify objects/images
 * in a target language. Used for receptive vocabulary assessment through
 * visual stimuli (picture naming, picture identification).
 *
 * Task flow:
 *   1. Generate a task with visual stimuli (images + target-language labels)
 *   2. Present stimuli to participant with multiple-choice or free-response options
 *   3. Collect responses with timing data
 *   4. Score responses for accuracy and speed
 */

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export type StimulusCategory =
  | 'objects'
  | 'animals'
  | 'food'
  | 'colors'
  | 'body_parts'
  | 'clothing'
  | 'furniture'
  | 'transportation'
  | 'nature'
  | 'professions';

export type TaskFormat = 'multiple_choice' | 'free_response';
export type TaskDirection = 'image_to_word' | 'word_to_image';

export interface VisualStimulus {
  id: string;
  imageUrl: string;
  targetWord: string;
  targetLanguage: string;
  nativeWord: string;
  category: StimulusCategory;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface VisualRecognitionTask {
  id: string;
  participantId: string;
  worldId: string;
  studyId?: string;
  targetLanguage: string;
  format: TaskFormat;
  direction: TaskDirection;
  stimuli: TaskStimulus[];
  timeLimit?: number; // seconds per item, undefined = no limit
  testWindow?: 'pre' | 'post' | 'delayed';
  createdAt: Date;
}

export interface TaskStimulus {
  stimulusId: string;
  imageUrl: string;
  prompt: string; // what the participant sees (image label or word)
  options?: string[]; // for multiple_choice
  correctAnswer: string;
  category: StimulusCategory;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StimulusResponse {
  stimulusId: string;
  answer: string;
  responseTimeMs: number;
}

export interface VisualRecognitionResult {
  taskId: string;
  participantId: string;
  totalItems: number;
  correctCount: number;
  accuracy: number; // 0-1
  averageResponseTimeMs: number;
  itemResults: ItemResult[];
  subscores: Record<StimulusCategory, CategoryScore>;
  score: number; // 0-100 normalized
}

export interface ItemResult {
  stimulusId: string;
  correct: boolean;
  answer: string;
  correctAnswer: string;
  responseTimeMs: number;
  category: StimulusCategory;
}

export interface CategoryScore {
  correct: number;
  total: number;
  accuracy: number;
  averageResponseTimeMs: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Stimulus Bank
// ───────────────────────────────────────────────────────────────────────────

/** Default stimulus bank with common vocabulary items */
const STIMULUS_BANK: VisualStimulus[] = [
  // Objects - Easy
  { id: 'obj_book', imageUrl: '/assets/stimuli/book.png', targetWord: '', targetLanguage: '', nativeWord: 'book', category: 'objects', difficulty: 'easy' },
  { id: 'obj_pen', imageUrl: '/assets/stimuli/pen.png', targetWord: '', targetLanguage: '', nativeWord: 'pen', category: 'objects', difficulty: 'easy' },
  { id: 'obj_phone', imageUrl: '/assets/stimuli/phone.png', targetWord: '', targetLanguage: '', nativeWord: 'phone', category: 'objects', difficulty: 'easy' },
  { id: 'obj_key', imageUrl: '/assets/stimuli/key.png', targetWord: '', targetLanguage: '', nativeWord: 'key', category: 'objects', difficulty: 'medium' },
  { id: 'obj_clock', imageUrl: '/assets/stimuli/clock.png', targetWord: '', targetLanguage: '', nativeWord: 'clock', category: 'objects', difficulty: 'medium' },
  // Animals - Easy
  { id: 'ani_cat', imageUrl: '/assets/stimuli/cat.png', targetWord: '', targetLanguage: '', nativeWord: 'cat', category: 'animals', difficulty: 'easy' },
  { id: 'ani_dog', imageUrl: '/assets/stimuli/dog.png', targetWord: '', targetLanguage: '', nativeWord: 'dog', category: 'animals', difficulty: 'easy' },
  { id: 'ani_bird', imageUrl: '/assets/stimuli/bird.png', targetWord: '', targetLanguage: '', nativeWord: 'bird', category: 'animals', difficulty: 'easy' },
  { id: 'ani_fish', imageUrl: '/assets/stimuli/fish.png', targetWord: '', targetLanguage: '', nativeWord: 'fish', category: 'animals', difficulty: 'medium' },
  { id: 'ani_horse', imageUrl: '/assets/stimuli/horse.png', targetWord: '', targetLanguage: '', nativeWord: 'horse', category: 'animals', difficulty: 'medium' },
  // Food - Easy
  { id: 'food_apple', imageUrl: '/assets/stimuli/apple.png', targetWord: '', targetLanguage: '', nativeWord: 'apple', category: 'food', difficulty: 'easy' },
  { id: 'food_bread', imageUrl: '/assets/stimuli/bread.png', targetWord: '', targetLanguage: '', nativeWord: 'bread', category: 'food', difficulty: 'easy' },
  { id: 'food_water', imageUrl: '/assets/stimuli/water.png', targetWord: '', targetLanguage: '', nativeWord: 'water', category: 'food', difficulty: 'easy' },
  { id: 'food_cheese', imageUrl: '/assets/stimuli/cheese.png', targetWord: '', targetLanguage: '', nativeWord: 'cheese', category: 'food', difficulty: 'medium' },
  { id: 'food_rice', imageUrl: '/assets/stimuli/rice.png', targetWord: '', targetLanguage: '', nativeWord: 'rice', category: 'food', difficulty: 'medium' },
  // Colors - Easy
  { id: 'col_red', imageUrl: '/assets/stimuli/red.png', targetWord: '', targetLanguage: '', nativeWord: 'red', category: 'colors', difficulty: 'easy' },
  { id: 'col_blue', imageUrl: '/assets/stimuli/blue.png', targetWord: '', targetLanguage: '', nativeWord: 'blue', category: 'colors', difficulty: 'easy' },
  { id: 'col_green', imageUrl: '/assets/stimuli/green.png', targetWord: '', targetLanguage: '', nativeWord: 'green', category: 'colors', difficulty: 'easy' },
  { id: 'col_yellow', imageUrl: '/assets/stimuli/yellow.png', targetWord: '', targetLanguage: '', nativeWord: 'yellow', category: 'colors', difficulty: 'medium' },
  { id: 'col_purple', imageUrl: '/assets/stimuli/purple.png', targetWord: '', targetLanguage: '', nativeWord: 'purple', category: 'colors', difficulty: 'hard' },
  // Body parts - Medium
  { id: 'body_hand', imageUrl: '/assets/stimuli/hand.png', targetWord: '', targetLanguage: '', nativeWord: 'hand', category: 'body_parts', difficulty: 'easy' },
  { id: 'body_head', imageUrl: '/assets/stimuli/head.png', targetWord: '', targetLanguage: '', nativeWord: 'head', category: 'body_parts', difficulty: 'easy' },
  { id: 'body_eye', imageUrl: '/assets/stimuli/eye.png', targetWord: '', targetLanguage: '', nativeWord: 'eye', category: 'body_parts', difficulty: 'medium' },
  { id: 'body_ear', imageUrl: '/assets/stimuli/ear.png', targetWord: '', targetLanguage: '', nativeWord: 'ear', category: 'body_parts', difficulty: 'medium' },
  { id: 'body_knee', imageUrl: '/assets/stimuli/knee.png', targetWord: '', targetLanguage: '', nativeWord: 'knee', category: 'body_parts', difficulty: 'hard' },
];

export function getStimulusBank(): VisualStimulus[] {
  return [...STIMULUS_BANK];
}

// ───────────────────────────────────────────────────────────────────────────
// Translation Map (common languages)
// ───────────────────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<string, Record<string, string>> = {
  spanish: {
    book: 'libro', pen: 'bolígrafo', phone: 'teléfono', key: 'llave', clock: 'reloj',
    cat: 'gato', dog: 'perro', bird: 'pájaro', fish: 'pez', horse: 'caballo',
    apple: 'manzana', bread: 'pan', water: 'agua', cheese: 'queso', rice: 'arroz',
    red: 'rojo', blue: 'azul', green: 'verde', yellow: 'amarillo', purple: 'morado',
    hand: 'mano', head: 'cabeza', eye: 'ojo', ear: 'oreja', knee: 'rodilla',
  },
  french: {
    book: 'livre', pen: 'stylo', phone: 'téléphone', key: 'clé', clock: 'horloge',
    cat: 'chat', dog: 'chien', bird: 'oiseau', fish: 'poisson', horse: 'cheval',
    apple: 'pomme', bread: 'pain', water: 'eau', cheese: 'fromage', rice: 'riz',
    red: 'rouge', blue: 'bleu', green: 'vert', yellow: 'jaune', purple: 'violet',
    hand: 'main', head: 'tête', eye: 'œil', ear: 'oreille', knee: 'genou',
  },
  german: {
    book: 'Buch', pen: 'Stift', phone: 'Telefon', key: 'Schlüssel', clock: 'Uhr',
    cat: 'Katze', dog: 'Hund', bird: 'Vogel', fish: 'Fisch', horse: 'Pferd',
    apple: 'Apfel', bread: 'Brot', water: 'Wasser', cheese: 'Käse', rice: 'Reis',
    red: 'rot', blue: 'blau', green: 'grün', yellow: 'gelb', purple: 'lila',
    hand: 'Hand', head: 'Kopf', eye: 'Auge', ear: 'Ohr', knee: 'Knie',
  },
  japanese: {
    book: '本', pen: 'ペン', phone: '電話', key: '鍵', clock: '時計',
    cat: '猫', dog: '犬', bird: '鳥', fish: '魚', horse: '馬',
    apple: 'りんご', bread: 'パン', water: '水', cheese: 'チーズ', rice: 'ご飯',
    red: '赤', blue: '青', green: '緑', yellow: '黄色', purple: '紫',
    hand: '手', head: '頭', eye: '目', ear: '耳', knee: '膝',
  },
};

/** Get translation for a word in the target language */
export function getTranslation(nativeWord: string, targetLanguage: string): string | undefined {
  const langMap = TRANSLATIONS[targetLanguage.toLowerCase()];
  return langMap?.[nativeWord.toLowerCase()];
}

/** Get all supported languages */
export function getSupportedLanguages(): string[] {
  return Object.keys(TRANSLATIONS);
}

// ───────────────────────────────────────────────────────────────────────────
// Task Generation
// ───────────────────────────────────────────────────────────────────────────

export interface GenerateTaskOptions {
  participantId: string;
  worldId: string;
  targetLanguage: string;
  format?: TaskFormat;
  direction?: TaskDirection;
  itemCount?: number;
  categories?: StimulusCategory[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  studyId?: string;
  testWindow?: 'pre' | 'post' | 'delayed';
  /** Custom vocabulary map to override defaults: nativeWord -> targetWord */
  customVocabulary?: Record<string, string>;
}

/** Generate a visual recognition assessment task */
export function generateTask(options: GenerateTaskOptions): VisualRecognitionTask {
  const {
    participantId,
    worldId,
    targetLanguage,
    format = 'multiple_choice',
    direction = 'image_to_word',
    itemCount = 10,
    categories,
    difficulty,
    timeLimit,
    studyId,
    testWindow,
    customVocabulary,
  } = options;

  // Filter stimulus bank
  let candidates = STIMULUS_BANK.filter((s) => {
    if (categories && !categories.includes(s.category)) return false;
    if (difficulty && s.difficulty !== difficulty) return false;
    // Ensure we have a translation
    const translation = customVocabulary?.[s.nativeWord] ?? getTranslation(s.nativeWord, targetLanguage);
    return translation != null;
  });

  // Shuffle and pick
  candidates = shuffle(candidates);
  const selected = candidates.slice(0, Math.min(itemCount, candidates.length));

  // Build task stimuli
  const stimuli: TaskStimulus[] = selected.map((s) => {
    const targetWord = customVocabulary?.[s.nativeWord] ?? getTranslation(s.nativeWord, targetLanguage)!;

    if (direction === 'image_to_word') {
      // Show image, participant picks the target-language word
      const correctAnswer = targetWord;
      const distractors = format === 'multiple_choice'
        ? generateDistractors(targetWord, targetLanguage, s.category, selected, customVocabulary)
        : undefined;

      return {
        stimulusId: s.id,
        imageUrl: s.imageUrl,
        prompt: s.nativeWord, // image label for accessibility
        options: distractors ? shuffle([correctAnswer, ...distractors]) : undefined,
        correctAnswer,
        category: s.category,
        difficulty: s.difficulty,
      };
    } else {
      // Show target-language word, participant picks the correct image
      const correctAnswer = s.imageUrl;
      const distractors = format === 'multiple_choice'
        ? generateImageDistractors(s.imageUrl, s.category, selected)
        : undefined;

      return {
        stimulusId: s.id,
        imageUrl: s.imageUrl,
        prompt: targetWord,
        options: distractors ? shuffle([correctAnswer, ...distractors]) : undefined,
        correctAnswer,
        category: s.category,
        difficulty: s.difficulty,
      };
    }
  });

  const taskId = `vrt_${participantId}_${Date.now()}`;

  return {
    id: taskId,
    participantId,
    worldId,
    studyId,
    targetLanguage,
    format,
    direction,
    stimuli,
    timeLimit,
    testWindow,
    createdAt: new Date(),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Scoring
// ───────────────────────────────────────────────────────────────────────────

/** Score a completed visual recognition task */
export function scoreTask(
  task: VisualRecognitionTask,
  responses: StimulusResponse[],
): VisualRecognitionResult {
  const responseMap = new Map(responses.map((r) => [r.stimulusId, r]));
  const itemResults: ItemResult[] = [];
  const categoryData: Record<string, { correct: number; total: number; totalTime: number }> = {};

  for (const stimulus of task.stimuli) {
    const response = responseMap.get(stimulus.stimulusId);
    const answer = response?.answer ?? '';
    const responseTimeMs = response?.responseTimeMs ?? 0;
    const correct = normalizeAnswer(answer) === normalizeAnswer(stimulus.correctAnswer);

    itemResults.push({
      stimulusId: stimulus.stimulusId,
      correct,
      answer,
      correctAnswer: stimulus.correctAnswer,
      responseTimeMs,
      category: stimulus.category,
    });

    if (!categoryData[stimulus.category]) {
      categoryData[stimulus.category] = { correct: 0, total: 0, totalTime: 0 };
    }
    categoryData[stimulus.category].total++;
    categoryData[stimulus.category].totalTime += responseTimeMs;
    if (correct) categoryData[stimulus.category].correct++;
  }

  const correctCount = itemResults.filter((r) => r.correct).length;
  const totalItems = itemResults.length;
  const accuracy = totalItems > 0 ? correctCount / totalItems : 0;
  const totalTime = itemResults.reduce((sum, r) => sum + r.responseTimeMs, 0);
  const averageResponseTimeMs = totalItems > 0 ? totalTime / totalItems : 0;

  const subscores: Record<string, CategoryScore> = {};
  for (const [category, data] of Object.entries(categoryData)) {
    subscores[category] = {
      correct: data.correct,
      total: data.total,
      accuracy: data.total > 0 ? data.correct / data.total : 0,
      averageResponseTimeMs: data.total > 0 ? data.totalTime / data.total : 0,
    };
  }

  return {
    taskId: task.id,
    participantId: task.participantId,
    totalItems,
    correctCount,
    accuracy,
    averageResponseTimeMs: Math.round(averageResponseTimeMs),
    itemResults,
    subscores: subscores as Record<StimulusCategory, CategoryScore>,
    score: Math.round(accuracy * 100),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

/** Normalize answer for comparison (lowercase, trim, remove accents for leniency) */
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Shuffle array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Generate word distractors for multiple choice */
function generateDistractors(
  correctAnswer: string,
  targetLanguage: string,
  category: StimulusCategory,
  selectedStimuli: VisualStimulus[],
  customVocabulary?: Record<string, string>,
  count: number = 3,
): string[] {
  // Prefer distractors from same category for higher difficulty
  const sameCategoryWords = selectedStimuli
    .filter((s) => s.category === category)
    .map((s) => customVocabulary?.[s.nativeWord] ?? getTranslation(s.nativeWord, targetLanguage))
    .filter((w): w is string => w != null && normalizeAnswer(w) !== normalizeAnswer(correctAnswer));

  // Fall back to other categories if needed
  const otherWords = selectedStimuli
    .filter((s) => s.category !== category)
    .map((s) => customVocabulary?.[s.nativeWord] ?? getTranslation(s.nativeWord, targetLanguage))
    .filter((w): w is string => w != null && normalizeAnswer(w) !== normalizeAnswer(correctAnswer));

  const pool = [...sameCategoryWords, ...otherWords];

  // Deduplicate
  const unique = Array.from(new Set(pool.map((w) => normalizeAnswer(w))))
    .map((norm) => pool.find((w) => normalizeAnswer(w) === norm)!);

  return unique.slice(0, count);
}

/** Generate image URL distractors for word_to_image format */
function generateImageDistractors(
  correctUrl: string,
  category: StimulusCategory,
  selectedStimuli: VisualStimulus[],
  count: number = 3,
): string[] {
  const others = selectedStimuli
    .filter((s) => s.imageUrl !== correctUrl)
    .map((s) => s.imageUrl);

  return others.slice(0, count);
}

/** Validate that responses match expected stimulus IDs */
export function validateResponses(
  task: VisualRecognitionTask,
  responses: StimulusResponse[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const stimulusIds = new Set(task.stimuli.map((s) => s.stimulusId));

  for (const response of responses) {
    if (!stimulusIds.has(response.stimulusId)) {
      errors.push(`Unknown stimulus ID: ${response.stimulusId}`);
    }
    if (response.responseTimeMs < 0) {
      errors.push(`Invalid response time for ${response.stimulusId}: ${response.responseTimeMs}`);
    }
  }

  const respondedIds = new Set(responses.map((r) => r.stimulusId));
  for (const id of Array.from(stimulusIds)) {
    if (!respondedIds.has(id)) {
      errors.push(`Missing response for stimulus: ${id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
