/**
 * Periodic Encounter Definition
 *
 * A conversational-only 5-minute assessment (/25 points) triggered
 * at milestone levels (5, 10, 15, 20). Measures speaking proficiency
 * across 5 dimensions: accuracy, fluency, vocabulary, comprehension,
 * and pragmatics.
 */

import type { AssessmentDefinition } from './assessment-types';

/** Levels at which a periodic assessment is triggered */
export const PERIODIC_ASSESSMENT_LEVELS = [5, 10, 15, 20] as const;

/** Minimum cooldown between periodic assessments in milliseconds (60 minutes) */
export const PERIODIC_ASSESSMENT_COOLDOWN_MS = 60 * 60 * 1000;

/** The 5 scoring dimensions for conversational assessment, each scored 1-5 */
const CONVERSATIONAL_DIMENSIONS = [
  {
    id: 'accuracy',
    name: 'Accuracy',
    description: 'Grammatical correctness and proper word forms',
    maxScore: 5,
  },
  {
    id: 'fluency',
    name: 'Fluency',
    description: 'Natural flow, pace, and minimal hesitation',
    maxScore: 5,
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary',
    description: 'Range and appropriateness of word choice',
    maxScore: 5,
  },
  {
    id: 'comprehension',
    name: 'Comprehension',
    description: 'Understanding of prompts and conversation context',
    maxScore: 5,
  },
  {
    id: 'pragmatics',
    name: 'Pragmatics',
    description: 'Appropriate register, politeness, and cultural awareness',
    maxScore: 5,
  },
];

export const PERIODIC_ENCOUNTER: AssessmentDefinition = {
  id: 'periodic_assessment',
  type: 'periodic',
  name: 'Progress Check',
  description:
    'A brief conversational check-in to measure your current speaking proficiency. ' +
    'Chat naturally with a local resident about everyday topics.',
  phases: [
    {
      id: 'periodic_conversational',
      name: 'Conversation',
      type: 'conversation',
      description:
        'Have a natural conversation with a local resident. ' +
        'They will guide the discussion through everyday topics appropriate to your level.',
      tasks: [
        {
          id: 'periodic_conv_task',
          name: 'Natural Conversation',
          description:
            'Engage in a 5-minute conversation covering greetings, daily life, ' +
            'opinions, and situational responses in {{targetLanguage}}.',
          prompt:
            'You are a friendly local resident in {{cityName}}. ' +
            'Have a natural conversation with the learner in {{targetLanguage}}, ' +
            'starting with a greeting and gradually exploring topics like daily routines, ' +
            'local places, preferences, and plans. Adjust complexity to match their responses. ' +
            'After 8-10 exchanges, wrap up naturally.',
          maxScore: 25,
          scoringDimensions: CONVERSATIONAL_DIMENSIONS,
          timeLimitSeconds: 300,
        },
      ],
      maxScore: 25,
      timeLimitSeconds: 300,
    },
  ],
  totalMaxPoints: 25,
  timeLimitSeconds: 300,
};

/**
 * Check whether a given level is a periodic assessment milestone.
 */
export function isPeriodicAssessmentLevel(level: number): boolean {
  return (PERIODIC_ASSESSMENT_LEVELS as readonly number[]).includes(level);
}

/**
 * Check whether enough time has passed since the last periodic assessment.
 */
export function isPeriodicAssessmentCooldownMet(
  lastAssessmentTimestamp: number | null,
  now: number = Date.now(),
): boolean {
  if (lastAssessmentTimestamp === null) return true;
  return now - lastAssessmentTimestamp >= PERIODIC_ASSESSMENT_COOLDOWN_MS;
}
