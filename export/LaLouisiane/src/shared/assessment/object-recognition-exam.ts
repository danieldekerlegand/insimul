/**
 * Object Recognition Exam
 *
 * NPC-administered vocabulary exam where the player identifies objects
 * visible in a business interior. The NPC highlights an object and asks
 * "What is this called?" — the player responds in the target language.
 *
 * Scoring uses Levenshtein distance:
 *   - Exact match (distance 0) → full points
 *   - Close match (distance ≤ 2) → partial points (half)
 *   - Wrong (distance > 2) → 0 points
 */

import type { AssessmentDefinition, CEFRLevel } from './assessment-types';
import type {
  BusinessVocabulary,
  ObjectRecognitionResult,
  ObjectVocabularyItem,
} from './npc-exam-types';

// ───────────────────────────────────────────────────────────────────────────
// Business-specific object vocabularies
// ───────────────────────────────────────────────────────────────────────────

const BAKERY_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'bread', englishName: 'bread', category: 'food' },
  { key: 'oven', englishName: 'oven', category: 'equipment' },
  { key: 'flour', englishName: 'flour', category: 'food' },
  { key: 'counter', englishName: 'counter', category: 'furniture' },
  { key: 'display_case', englishName: 'display case', category: 'furniture' },
  { key: 'rolling_pin', englishName: 'rolling pin', category: 'tool' },
  { key: 'cake', englishName: 'cake', category: 'food' },
  { key: 'basket', englishName: 'basket', category: 'container' },
];

const RESTAURANT_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'plate', englishName: 'plate', category: 'equipment' },
  { key: 'cup', englishName: 'cup', category: 'equipment' },
  { key: 'menu', englishName: 'menu', category: 'equipment' },
  { key: 'table', englishName: 'table', category: 'furniture' },
  { key: 'chair', englishName: 'chair', category: 'furniture' },
  { key: 'kitchen', englishName: 'kitchen', category: 'furniture' },
  { key: 'spoon', englishName: 'spoon', category: 'tool' },
  { key: 'bowl', englishName: 'bowl', category: 'equipment' },
];

const BLACKSMITH_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'anvil', englishName: 'anvil', category: 'tool' },
  { key: 'hammer', englishName: 'hammer', category: 'tool' },
  { key: 'forge', englishName: 'forge', category: 'equipment' },
  { key: 'tongs', englishName: 'tongs', category: 'tool' },
  { key: 'metal', englishName: 'metal', category: 'equipment' },
  { key: 'workbench', englishName: 'workbench', category: 'furniture' },
  { key: 'barrel', englishName: 'barrel', category: 'container' },
  { key: 'tool_rack', englishName: 'tool rack', category: 'furniture' },
];

const SHOP_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'counter', englishName: 'counter', category: 'furniture' },
  { key: 'shelf', englishName: 'shelf', category: 'furniture' },
  { key: 'crate', englishName: 'crate', category: 'container' },
  { key: 'display_table', englishName: 'display table', category: 'furniture' },
  { key: 'goods', englishName: 'goods', category: 'equipment' },
  { key: 'scale', englishName: 'scale', category: 'tool' },
  { key: 'bag', englishName: 'bag', category: 'container' },
  { key: 'coin_box', englishName: 'coin box', category: 'container' },
];

const BAR_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'bar_counter', englishName: 'bar', category: 'furniture' },
  { key: 'stool', englishName: 'stool', category: 'furniture' },
  { key: 'barrel', englishName: 'barrel', category: 'container' },
  { key: 'mug', englishName: 'mug', category: 'equipment' },
  { key: 'bottle', englishName: 'bottle', category: 'container' },
  { key: 'table', englishName: 'table', category: 'furniture' },
  { key: 'tap', englishName: 'tap', category: 'equipment' },
  { key: 'glass', englishName: 'glass', category: 'equipment' },
];

const GROCERY_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'counter', englishName: 'counter', category: 'furniture' },
  { key: 'shelf', englishName: 'shelf', category: 'furniture' },
  { key: 'basket', englishName: 'basket', category: 'container' },
  { key: 'fruit', englishName: 'fruit', category: 'food' },
  { key: 'vegetables', englishName: 'vegetables', category: 'food' },
  { key: 'sack', englishName: 'sack', category: 'container' },
  { key: 'scale', englishName: 'scale', category: 'tool' },
  { key: 'crate', englishName: 'crate', category: 'container' },
];

const HOSPITAL_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'bed', englishName: 'bed', category: 'furniture' },
  { key: 'desk', englishName: 'desk', category: 'furniture' },
  { key: 'medicine', englishName: 'medicine', category: 'equipment' },
  { key: 'bandage', englishName: 'bandage', category: 'equipment' },
  { key: 'chair', englishName: 'chair', category: 'furniture' },
  { key: 'bottle', englishName: 'bottle', category: 'container' },
];

const SCHOOL_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'desk', englishName: 'desk', category: 'furniture' },
  { key: 'chair', englishName: 'chair', category: 'furniture' },
  { key: 'book', englishName: 'book', category: 'equipment' },
  { key: 'board', englishName: 'board', category: 'equipment' },
  { key: 'pen', englishName: 'pen', category: 'tool' },
  { key: 'paper', englishName: 'paper', category: 'equipment' },
];

/** All business vocabularies indexed by business type */
export const BUSINESS_VOCABULARIES: Record<string, BusinessVocabulary> = {
  bakery: { businessType: 'bakery', objects: BAKERY_OBJECTS },
  restaurant: { businessType: 'restaurant', objects: RESTAURANT_OBJECTS },
  blacksmith: { businessType: 'blacksmith', objects: BLACKSMITH_OBJECTS },
  forge: { businessType: 'forge', objects: BLACKSMITH_OBJECTS },
  workshop: { businessType: 'workshop', objects: BLACKSMITH_OBJECTS },
  shop: { businessType: 'shop', objects: SHOP_OBJECTS },
  store: { businessType: 'store', objects: SHOP_OBJECTS },
  market: { businessType: 'market', objects: SHOP_OBJECTS },
  bar: { businessType: 'bar', objects: BAR_OBJECTS },
  tavern: { businessType: 'tavern', objects: BAR_OBJECTS },
  inn: { businessType: 'inn', objects: BAR_OBJECTS },
  grocery: { businessType: 'grocery', objects: GROCERY_OBJECTS },
  grocery_store: { businessType: 'grocery_store', objects: GROCERY_OBJECTS },
  hospital: { businessType: 'hospital', objects: HOSPITAL_OBJECTS },
  school: { businessType: 'school', objects: SCHOOL_OBJECTS },
};

/** Fallback objects when business type is unknown */
const GENERIC_OBJECTS: ObjectVocabularyItem[] = [
  { key: 'table', englishName: 'table', category: 'furniture' },
  { key: 'chair', englishName: 'chair', category: 'furniture' },
  { key: 'door', englishName: 'door', category: 'furniture' },
  { key: 'shelf', englishName: 'shelf', category: 'furniture' },
  { key: 'barrel', englishName: 'barrel', category: 'container' },
  { key: 'crate', englishName: 'crate', category: 'container' },
];

export const GENERIC_VOCABULARY: BusinessVocabulary = {
  businessType: 'generic',
  objects: GENERIC_OBJECTS,
};

// ───────────────────────────────────────────────────────────────────────────
// Levenshtein distance & scoring
// ───────────────────────────────────────────────────────────────────────────

/** Compute Levenshtein edit distance between two strings */
export function levenshteinDistance(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  // Use single-row optimization
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  let curr = new Array<number>(lb + 1);

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[lb];
}

/** Points per question by CEFR level */
const POINTS_PER_QUESTION: Record<CEFRLevel, number> = {
  A1: 2,
  A2: 2,
  B1: 3,
  B2: 3,
};

/** Number of objects to quiz by CEFR level */
const QUESTION_COUNT: Record<CEFRLevel, number> = {
  A1: 3,
  A2: 4,
  B1: 5,
  B2: 5,
};

/** Maximum Levenshtein distance for a "close" match */
export const CLOSE_MATCH_THRESHOLD = 2;

/**
 * Score a player's answer against the expected answer.
 * - Exact match → full points
 * - Close match (Levenshtein ≤ CLOSE_MATCH_THRESHOLD) → half points (rounded up)
 * - Wrong → 0 points
 */
export function scoreObjectAnswer(
  playerAnswer: string,
  expectedAnswer: string,
  maxPoints: number,
): ObjectRecognitionResult {
  const normalized = playerAnswer.trim().toLowerCase();
  const expected = expectedAnswer.trim().toLowerCase();

  if (normalized === expected) {
    return {
      objectKey: '',
      expectedAnswer,
      playerAnswer,
      score: maxPoints,
      maxScore: maxPoints,
      matchType: 'exact',
      distance: 0,
    };
  }

  const dist = levenshteinDistance(normalized, expected);
  if (dist <= CLOSE_MATCH_THRESHOLD) {
    return {
      objectKey: '',
      expectedAnswer,
      playerAnswer,
      score: Math.ceil(maxPoints / 2),
      maxScore: maxPoints,
      matchType: 'close',
      distance: dist,
    };
  }

  return {
    objectKey: '',
    expectedAnswer,
    playerAnswer,
    score: 0,
    maxScore: maxPoints,
    matchType: 'wrong',
    distance: dist,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Exam generation
// ───────────────────────────────────────────────────────────────────────────

/**
 * Get the vocabulary for a business type, falling back to generic.
 */
export function getBusinessVocabulary(businessType?: string): BusinessVocabulary {
  if (!businessType) return GENERIC_VOCABULARY;
  return BUSINESS_VOCABULARIES[businessType.toLowerCase()] ?? GENERIC_VOCABULARY;
}

/**
 * Select random objects from a vocabulary set for an exam.
 * Returns a shuffled subset of the requested count.
 */
export function selectExamObjects(
  vocabulary: BusinessVocabulary,
  count: number,
): ObjectVocabularyItem[] {
  const available = [...vocabulary.objects];
  const n = Math.min(count, available.length);
  // Fisher-Yates shuffle (partial)
  for (let i = available.length - 1; i > available.length - n - 1 && i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(available.length - n);
}

/**
 * Build an AssessmentDefinition for an object recognition exam.
 *
 * @param businessType - The type of business the player is in
 * @param cefrLevel - Player's current CEFR level
 * @param targetLanguage - The language being learned
 * @param npcName - Name of the NPC administering the exam
 */
export function buildObjectRecognitionExam(
  businessType: string | undefined,
  cefrLevel: CEFRLevel,
  targetLanguage: string,
  npcName: string,
): { definition: AssessmentDefinition; selectedObjects: ObjectVocabularyItem[] } {
  const vocabulary = getBusinessVocabulary(businessType);
  const questionCount = QUESTION_COUNT[cefrLevel];
  const pointsPerQuestion = POINTS_PER_QUESTION[cefrLevel];
  const selectedObjects = selectExamObjects(vocabulary, questionCount);
  const totalMaxPoints = selectedObjects.length * pointsPerQuestion;

  const tasks = selectedObjects.map((obj, i) => ({
    id: `obj_recog_${i}`,
    name: `Identify: ${obj.englishName}`,
    type: 'object_recognition' as const,
    prompt:
      `${npcName} points to a ${obj.englishName} and asks: ` +
      `"What is this called in ${targetLanguage}?"`,
    maxPoints: pointsPerQuestion,
    maxScore: pointsPerQuestion,
    scoringMethod: 'automated' as const,
  }));

  const definition: AssessmentDefinition = {
    id: `npc_obj_recog_${businessType ?? 'generic'}_${Date.now()}`,
    type: 'periodic',
    name: 'Object Recognition Quiz',
    description:
      `${npcName} quizzes you on objects found in this ${businessType ?? 'building'}. ` +
      `Name each object in ${targetLanguage}.`,
    targetLanguage,
    phases: [
      {
        id: 'object_recognition_phase',
        type: 'conversation',
        name: 'Object Recognition',
        description: `Identify ${selectedObjects.length} objects in ${targetLanguage}`,
        tasks,
        maxPoints: totalMaxPoints,
        maxScore: totalMaxPoints,
        timeLimitSeconds: selectedObjects.length * 30,
      },
    ],
    totalMaxPoints,
    estimatedMinutes: Math.ceil(selectedObjects.length * 0.5),
  };

  return { definition, selectedObjects };
}

/**
 * Score a complete object recognition exam.
 * Returns per-object results and aggregate score.
 */
export function scoreObjectRecognitionExam(
  selectedObjects: ObjectVocabularyItem[],
  playerAnswers: string[],
  expectedAnswers: string[],
  cefrLevel: CEFRLevel,
): { results: ObjectRecognitionResult[]; totalScore: number; totalMaxScore: number } {
  const pointsPerQuestion = POINTS_PER_QUESTION[cefrLevel];
  const results: ObjectRecognitionResult[] = [];
  let totalScore = 0;
  let totalMaxScore = 0;

  for (let i = 0; i < selectedObjects.length; i++) {
    const obj = selectedObjects[i];
    const playerAnswer = playerAnswers[i] ?? '';
    const expected = expectedAnswers[i] ?? obj.englishName;

    const result = scoreObjectAnswer(playerAnswer, expected, pointsPerQuestion);
    result.objectKey = obj.key;
    results.push(result);
    totalScore += result.score;
    totalMaxScore += result.maxScore;
  }

  return { results, totalScore, totalMaxScore };
}
