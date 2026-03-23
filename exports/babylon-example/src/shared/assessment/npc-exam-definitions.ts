/**
 * NPC Exam Definitions
 *
 * Pre-built exam templates that NPCs can use to quiz players during gameplay.
 * Each template generates an NpcExamConfig with placeholder questions that
 * are filled in at runtime by the LLM based on the target language and
 * the player's current proficiency level.
 */

import type { NpcExamCategory, NpcExamConfig, NpcExamDifficulty, NpcExamQuestion } from './npc-exam-types';

export interface NpcExamTemplate {
  id: string;
  name: string;
  category: NpcExamCategory;
  description: string;
  /** Default difficulty (can be overridden at runtime) */
  defaultDifficulty: NpcExamDifficulty;
  /** Number of questions to generate */
  questionCount: number;
  /** Points per question */
  pointsPerQuestion: number;
  /** Time limit in seconds */
  timeLimitSeconds: number;
  /** Topic keywords for LLM content generation */
  topicKeywords: string[];
  /** LLM prompt template for generating questions */
  generationPrompt: string;
}

export const NPC_EXAM_TEMPLATES: NpcExamTemplate[] = [
  {
    id: 'vocab_object_naming',
    name: 'Object Naming Quiz',
    category: 'vocabulary_quiz',
    description: 'NPC points to objects and asks the player to name them in the target language.',
    defaultDifficulty: 'beginner',
    questionCount: 5,
    pointsPerQuestion: 2,
    timeLimitSeconds: 120,
    topicKeywords: ['objects', 'nouns', 'everyday items'],
    generationPrompt:
      'Generate {{questionCount}} vocabulary quiz questions where the player must name common objects in {{targetLanguage}}. ' +
      'Difficulty: {{difficulty}}. Each question should describe an object in English and expect the {{targetLanguage}} word. ' +
      'Include the expected answer and 1-2 acceptable alternatives (e.g., synonyms or variant spellings).',
  },
  {
    id: 'vocab_category_match',
    name: 'Category Quiz',
    category: 'vocabulary_quiz',
    description: 'NPC asks the player to name items belonging to a category in the target language.',
    defaultDifficulty: 'beginner',
    questionCount: 5,
    pointsPerQuestion: 2,
    timeLimitSeconds: 120,
    topicKeywords: ['categories', 'grouping', 'classification'],
    generationPrompt:
      'Generate {{questionCount}} vocabulary category questions in {{targetLanguage}}. ' +
      'Difficulty: {{difficulty}}. Each question asks the player to name one item in a category ' +
      '(e.g., "Name a fruit in {{targetLanguage}}"). Include multiple acceptable answers.',
  },
  {
    id: 'translation_phrases',
    name: 'Translation Challenge',
    category: 'translation_quiz',
    description: 'NPC gives phrases to translate between English and the target language.',
    defaultDifficulty: 'intermediate',
    questionCount: 5,
    pointsPerQuestion: 3,
    timeLimitSeconds: 180,
    topicKeywords: ['translation', 'phrases', 'sentences'],
    generationPrompt:
      'Generate {{questionCount}} translation questions between English and {{targetLanguage}}. ' +
      'Difficulty: {{difficulty}}. Mix directions (some English→{{targetLanguage}}, some {{targetLanguage}}→English). ' +
      'Include the expected answer and acceptable alternatives.',
  },
  {
    id: 'listening_comprehension',
    name: 'Listening Quiz',
    category: 'listening_quiz',
    description: 'NPC tells a short story and asks comprehension questions.',
    defaultDifficulty: 'intermediate',
    questionCount: 4,
    pointsPerQuestion: 3,
    timeLimitSeconds: 240,
    topicKeywords: ['listening', 'comprehension', 'story'],
    generationPrompt:
      'Generate a short story (3-5 sentences) in {{targetLanguage}} and {{questionCount}} comprehension questions about it. ' +
      'Difficulty: {{difficulty}}. Questions should be in English. Include expected answers.',
  },
  {
    id: 'grammar_fill_blank',
    name: 'Grammar Quiz',
    category: 'grammar_quiz',
    description: 'NPC presents sentences with blanks to fill in using correct grammar.',
    defaultDifficulty: 'intermediate',
    questionCount: 5,
    pointsPerQuestion: 2,
    timeLimitSeconds: 150,
    topicKeywords: ['grammar', 'conjugation', 'sentence structure'],
    generationPrompt:
      'Generate {{questionCount}} fill-in-the-blank grammar questions in {{targetLanguage}}. ' +
      'Difficulty: {{difficulty}}. Each question presents a sentence with a blank and asks for the correct word/form. ' +
      'Include the expected answer and acceptable alternatives.',
  },
  {
    id: 'conversation_roleplay',
    name: 'Conversation Quiz',
    category: 'conversation_quiz',
    description: 'NPC presents conversational scenarios and asks for appropriate responses.',
    defaultDifficulty: 'intermediate',
    questionCount: 4,
    pointsPerQuestion: 3,
    timeLimitSeconds: 180,
    topicKeywords: ['conversation', 'social', 'dialogue'],
    generationPrompt:
      'Generate {{questionCount}} conversational scenario questions in {{targetLanguage}}. ' +
      'Difficulty: {{difficulty}}. Each presents a social situation and asks what the player would say. ' +
      'Include the expected response and acceptable alternatives.',
  },
  {
    id: 'pronunciation_phrases',
    name: 'Pronunciation Quiz',
    category: 'pronunciation_quiz',
    description: 'NPC asks the player to pronounce phrases in the target language. Scored by pronunciation accuracy.',
    defaultDifficulty: 'beginner',
    questionCount: 5,
    pointsPerQuestion: 3,
    timeLimitSeconds: 180,
    topicKeywords: ['pronunciation', 'speaking', 'phrases', 'accent'],
    generationPrompt:
      'Generate {{questionCount}} pronunciation quiz items in {{targetLanguage}}. ' +
      'Difficulty: {{difficulty}}. Each item should have a prompt like "Say: [phrase in {{targetLanguage}}]" ' +
      'and the expected answer is the phrase itself. Include 1-2 acceptable phonetic variants. ' +
      'Focus on common phrases appropriate for the difficulty level.',
  },
];

/**
 * Build an NpcExamConfig from a template, NPC info, and generated questions.
 */
export function buildNpcExamFromTemplate(
  template: NpcExamTemplate,
  npcId: string,
  npcName: string,
  targetLanguage: string,
  questions: NpcExamQuestion[],
  difficulty?: NpcExamDifficulty,
): NpcExamConfig {
  const effectiveDifficulty = difficulty ?? template.defaultDifficulty;
  const totalMaxPoints = questions.reduce((sum, q) => sum + q.maxPoints, 0);

  return {
    examId: `${template.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    npcId,
    npcName,
    category: template.category,
    difficulty: effectiveDifficulty,
    targetLanguage,
    questions,
    timeLimitSeconds: template.timeLimitSeconds,
    totalMaxPoints,
    topics: template.topicKeywords,
  };
}

/**
 * Get the LLM prompt for generating exam questions from a template.
 */
export function buildExamGenerationPrompt(
  template: NpcExamTemplate,
  targetLanguage: string,
  difficulty?: NpcExamDifficulty,
): string {
  const effectiveDifficulty = difficulty ?? template.defaultDifficulty;
  return template.generationPrompt
    .replace(/\{\{questionCount\}\}/g, String(template.questionCount))
    .replace(/\{\{targetLanguage\}\}/g, targetLanguage)
    .replace(/\{\{difficulty\}\}/g, effectiveDifficulty);
}

/**
 * Look up a template by ID.
 */
export function getNpcExamTemplate(templateId: string): NpcExamTemplate | undefined {
  return NPC_EXAM_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get templates suitable for a given difficulty level.
 */
export function getTemplatesForDifficulty(difficulty: NpcExamDifficulty): NpcExamTemplate[] {
  return NPC_EXAM_TEMPLATES.filter(t => t.defaultDifficulty === difficulty);
}
