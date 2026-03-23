/**
 * NPC Exam Encounter Definitions
 *
 * Lightweight reading and writing exam definitions triggered by teacher/professor
 * NPCs during gameplay. Unlike the full 4-phase arrival/departure encounters,
 * these use 1-2 assessment phases and are CEFR-adaptive based on player level.
 *
 * Exam triggers: teacher NPC interaction, every 5 quests, or after 30 min gameplay.
 * Reuses existing assessment infrastructure (content generation + scoring endpoints).
 */

import type {
  AssessmentDefinition,
  AssessmentPhase,
  CEFRLevel,
  ContentTemplate,
} from './assessment-types';

// ─────────────────────────────────────────────────────────────────────────────
// CEFR-scaled content templates
// ─────────────────────────────────────────────────────────────────────────────

const READING_TEMPLATES: Record<CEFRLevel, ContentTemplate> = {
  A1: {
    topic: 'A simple sign, menu, or notice found in {{cityName}} — very short sentences with basic vocabulary about everyday objects and places.',
    difficulty: 'beginner',
    lengthSentences: 3,
    questionCount: 2,
  },
  A2: {
    topic: 'A short notice posted on a community board in {{cityName}} — describing an upcoming event, market hours, or a lost item with simple details.',
    difficulty: 'beginner',
    lengthSentences: 5,
    questionCount: 3,
  },
  B1: {
    topic: 'A newspaper article from {{cityName}} about a local festival, community project, or seasonal event — includes opinions and moderate vocabulary.',
    difficulty: 'intermediate',
    lengthSentences: 7,
    questionCount: 3,
  },
  B2: {
    topic: 'An editorial or feature article from {{cityName}} discussing cultural traditions, urban development, or environmental changes — complex sentences with idioms.',
    difficulty: 'advanced',
    lengthSentences: 10,
    questionCount: 4,
  },
};

const WRITING_TEMPLATES: Record<CEFRLevel, ContentTemplate> = {
  A1: {
    topic: 'Write a very short message — introducing yourself or listing items you see in {{cityName}}. 1-3 simple sentences.',
    difficulty: 'beginner',
    promptCount: 1,
  },
  A2: {
    topic: 'Write a short message to a friend about something you did today in {{cityName}}, and describe a place you visited.',
    difficulty: 'beginner',
    promptCount: 2,
  },
  B1: {
    topic: 'Write a review of a shop or restaurant you visited in {{cityName}}, and compose a short letter requesting information about a local service.',
    difficulty: 'intermediate',
    promptCount: 2,
  },
  B2: {
    topic: 'Write a formal complaint letter about a service issue in {{cityName}}, and compose an opinion piece about a local cultural topic.',
    difficulty: 'advanced',
    promptCount: 2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Business-context variant templates
// ─────────────────────────────────────────────────────────────────────────────

export type BusinessContext = 'restaurant' | 'shop' | 'school' | 'market' | 'general';

const BUSINESS_READING_TOPICS: Record<BusinessContext, string> = {
  restaurant: 'A restaurant menu or daily specials board in {{cityName}} — dishes, ingredients, and prices.',
  shop: 'A product description or store policy notice in a shop in {{cityName}}.',
  school: 'A class schedule or school notice board in {{cityName}} — upcoming lessons, rules, and events.',
  market: 'A market vendor sign listing products, origins, and seasonal offerings in {{cityName}}.',
  general: 'A posted notice or informational sign found in {{cityName}}.',
};

const BUSINESS_WRITING_TOPICS: Record<BusinessContext, string> = {
  restaurant: 'Write a review of a meal or leave feedback for the restaurant in {{cityName}}.',
  shop: 'Write a shopping list or compose a message asking about product availability in {{cityName}}.',
  school: 'Write a note to your teacher or describe what you learned today in {{cityName}}.',
  market: 'Write a message to a friend describing the market in {{cityName}} and what you want to buy.',
  general: 'Write a short message about your experience in {{cityName}}.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Score configuration per CEFR level
// ─────────────────────────────────────────────────────────────────────────────

const READING_MAX_SCORES: Record<CEFRLevel, number> = { A1: 10, A2: 15, B1: 15, B2: 20 };
const WRITING_MAX_SCORES: Record<CEFRLevel, number> = { A1: 10, A2: 15, B1: 15, B2: 20 };

// ─────────────────────────────────────────────────────────────────────────────
// Phase builders
// ─────────────────────────────────────────────────────────────────────────────

export function buildReadingExamPhase(cefrLevel: CEFRLevel, businessContext?: BusinessContext): AssessmentPhase {
  const template = { ...READING_TEMPLATES[cefrLevel] };
  if (businessContext && businessContext !== 'general') {
    template.topic = BUSINESS_READING_TOPICS[businessContext];
  }
  const maxScore = READING_MAX_SCORES[cefrLevel];

  return {
    id: 'npc_exam_reading',
    name: 'Reading Comprehension',
    type: 'reading',
    description: 'Read a passage in {{targetLanguage}} and answer comprehension questions.',
    maxScore,
    maxPoints: maxScore,
    tasks: [{
      id: 'npc_exam_reading_task',
      name: 'Reading Passage',
      type: 'reading_comprehension',
      prompt: 'Read the following passage in {{targetLanguage}} carefully, then answer the comprehension questions below.',
      maxScore,
      maxPoints: maxScore,
      scoringMethod: 'llm',
      contentTemplate: template,
      scoringDimensions: [
        { id: 'comprehension', name: 'Comprehension', maxScore: Math.ceil(maxScore * 0.4), description: 'Understanding of main ideas and details' },
        { id: 'vocabulary_recognition', name: 'Vocabulary Recognition', maxScore: Math.ceil(maxScore * 0.3), description: 'Ability to understand key vocabulary in context' },
        { id: 'inference', name: 'Inference', maxScore: Math.floor(maxScore * 0.3), description: 'Ability to draw conclusions from the text' },
      ],
    }],
  };
}

export function buildWritingExamPhase(cefrLevel: CEFRLevel, businessContext?: BusinessContext): AssessmentPhase {
  const template = { ...WRITING_TEMPLATES[cefrLevel] };
  if (businessContext && businessContext !== 'general') {
    template.topic = BUSINESS_WRITING_TOPICS[businessContext];
  }
  const maxScore = WRITING_MAX_SCORES[cefrLevel];

  return {
    id: 'npc_exam_writing',
    name: 'Writing Assessment',
    type: 'writing',
    description: 'Complete writing tasks in {{targetLanguage}}.',
    maxScore,
    maxPoints: maxScore,
    tasks: [{
      id: 'npc_exam_writing_task',
      name: 'Writing Prompts',
      type: 'writing_prompt',
      prompt: 'Respond to the following writing prompts in {{targetLanguage}}. Write as much as you can.',
      maxScore,
      maxPoints: maxScore,
      scoringMethod: 'llm',
      contentTemplate: template,
      scoringDimensions: [
        { id: 'task_completion', name: 'Task Completion', maxScore: Math.ceil(maxScore / 3), description: 'Response addresses the prompt requirements' },
        { id: 'vocabulary', name: 'Vocabulary', maxScore: Math.ceil(maxScore / 3), description: 'Range and appropriateness of word choice' },
        { id: 'grammar', name: 'Grammar', maxScore: Math.floor(maxScore / 3), description: 'Correct sentence structure and verb forms' },
      ],
    }],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Encounter builders
// ─────────────────────────────────────────────────────────────────────────────

export type NPCExamType = 'reading' | 'writing' | 'reading_writing';

/**
 * Build an NPC exam encounter definition with the specified phase types,
 * scaled to the player's current CEFR level.
 */
export function buildNPCExamEncounter(
  examType: NPCExamType,
  cefrLevel: CEFRLevel,
  businessContext?: BusinessContext,
): AssessmentDefinition {
  const phases: AssessmentPhase[] = [];

  if (examType === 'reading' || examType === 'reading_writing') {
    phases.push(buildReadingExamPhase(cefrLevel, businessContext));
  }
  if (examType === 'writing' || examType === 'reading_writing') {
    phases.push(buildWritingExamPhase(cefrLevel, businessContext));
  }

  const totalMaxPoints = phases.reduce((sum, p) => sum + (p.maxScore ?? 0), 0);

  return {
    id: `npc_exam_${examType}_${cefrLevel.toLowerCase()}`,
    type: 'periodic',
    name: examType === 'reading_writing'
      ? 'Reading & Writing Exam'
      : examType === 'reading' ? 'Reading Exam' : 'Writing Exam',
    description: `A ${cefrLevel}-level ${examType.replace('_', ' & ')} exam administered by a local teacher.`,
    phases,
    totalMaxPoints,
    estimatedMinutes: examType === 'reading_writing' ? 10 : 5,
  };
}

/** Minimum number of completed quests between NPC exams */
export const NPC_EXAM_QUEST_INTERVAL = 5;

/** Minimum gameplay time between NPC exams in milliseconds (30 minutes) */
export const NPC_EXAM_TIME_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Check whether an NPC exam should be triggered based on quest count and time.
 */
export function shouldTriggerNPCExam(
  questsCompleted: number,
  lastExamTimestamp: number | null,
  now: number = Date.now(),
): boolean {
  if (questsCompleted > 0 && questsCompleted % NPC_EXAM_QUEST_INTERVAL === 0) {
    return true;
  }
  if (lastExamTimestamp !== null && now - lastExamTimestamp >= NPC_EXAM_TIME_INTERVAL_MS) {
    return true;
  }
  return false;
}
