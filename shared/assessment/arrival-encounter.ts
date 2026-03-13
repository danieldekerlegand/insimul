/**
 * Arrival Encounter — Pre-test assessment definition
 *
 * Administered when a player first arrives in a new city. Measures baseline
 * language proficiency across 4 phases: conversational, listening, writing,
 * and visual recognition. Total: 53 points.
 *
 * Template variables: {{targetLanguage}}, {{cityName}}
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AssessmentPhaseType = 'conversational' | 'listening' | 'writing' | 'visual';

export interface ScoringDimension {
  id: string;
  name: string;
  maxScore: number;
  description: string;
}

export interface AssessmentTask {
  id: string;
  name: string;
  instructions: string;
  maxScore: number;
  scoringDimensions?: ScoringDimension[];
  /** Task-specific configuration */
  config?: Record<string, unknown>;
}

export interface AssessmentPhase {
  id: string;
  name: string;
  type: AssessmentPhaseType;
  maxScore: number;
  estimatedMinutes: number;
  instructions: string;
  tasks: AssessmentTask[];
}

export interface AssessmentDefinition {
  id: string;
  name: string;
  description: string;
  testPhase: 'pre' | 'post';
  totalMaxScore: number;
  phases: AssessmentPhase[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Template helper
// ─────────────────────────────────────────────────────────────────────────────

export function resolveTemplate(
  text: string,
  vars: { targetLanguage: string; cityName: string },
): string {
  return text
    .replace(/\{\{targetLanguage\}\}/g, vars.targetLanguage)
    .replace(/\{\{cityName\}\}/g, vars.cityName);
}

export function resolveAssessment(
  definition: AssessmentDefinition,
  vars: { targetLanguage: string; cityName: string },
): AssessmentDefinition {
  return {
    ...definition,
    description: resolveTemplate(definition.description, vars),
    phases: definition.phases.map(phase => ({
      ...phase,
      instructions: resolveTemplate(phase.instructions, vars),
      tasks: phase.tasks.map(task => ({
        ...task,
        instructions: resolveTemplate(task.instructions, vars),
      })),
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Arrival Encounter definition
// ─────────────────────────────────────────────────────────────────────────────

export const ARRIVAL_ENCOUNTER: AssessmentDefinition = {
  id: 'arrival_encounter',
  name: 'Arrival Encounter',
  description:
    'Baseline {{targetLanguage}} proficiency assessment upon arriving in {{cityName}}.',
  testPhase: 'pre',
  totalMaxScore: 53,

  phases: [
    // ── Phase 1: Conversational (25 pts) ──────────────────────────────────
    {
      id: 'arrival_conversational',
      name: 'Conversational Assessment',
      type: 'conversational',
      maxScore: 25,
      estimatedMinutes: 10,
      instructions:
        'You have just arrived in {{cityName}}. A local resident greets you and strikes up a conversation. Respond naturally in {{targetLanguage}} as best you can.',
      tasks: [
        {
          id: 'arrival_conv_dialogue',
          name: 'Guided Conversation',
          instructions:
            'Have a conversation with the NPC in {{targetLanguage}}. The conversation will adapt to your level. Topics include greetings, travel, and getting around {{cityName}}.',
          maxScore: 25,
          scoringDimensions: [
            { id: 'accuracy', name: 'Accuracy', maxScore: 5, description: 'Grammatical correctness and appropriate word forms' },
            { id: 'fluency', name: 'Fluency', maxScore: 5, description: 'Natural flow, pace, and cohesion of speech' },
            { id: 'vocabulary', name: 'Vocabulary', maxScore: 5, description: 'Range and precision of word choice' },
            { id: 'comprehension', name: 'Comprehension', maxScore: 5, description: 'Understanding of NPC prompts and contextual cues' },
            { id: 'pragmatics', name: 'Pragmatics', maxScore: 5, description: 'Socially appropriate language use and cultural awareness' },
          ],
          config: {
            minExchanges: 6,
            maxExchanges: 12,
            tierAdvanceThreshold: 3,
            tierDropThreshold: 1,
          },
        },
      ],
    },

    // ── Phase 2: Listening (7 pts) ────────────────────────────────────────
    {
      id: 'arrival_listening',
      name: 'Listening Comprehension',
      type: 'listening',
      maxScore: 7,
      estimatedMinutes: 5,
      instructions:
        'Listen carefully to the locals speaking {{targetLanguage}} and complete the tasks below.',
      tasks: [
        {
          id: 'arrival_listen_directions',
          name: 'Following Directions',
          instructions:
            'An NPC gives you directions to a location in {{cityName}}. Follow the directions by moving to the correct spot.',
          maxScore: 4,
          config: {
            scoringMethod: 'position_tracking',
            checkpoints: 4,
          },
        },
        {
          id: 'arrival_listen_extraction',
          name: 'Information Extraction',
          instructions:
            'Listen to a short announcement in {{targetLanguage}} and answer 3 questions about what you heard.',
          maxScore: 3,
          config: {
            questionCount: 3,
            pointsPerQuestion: 1,
          },
        },
      ],
    },

    // ── Phase 3: Writing (11 pts) ─────────────────────────────────────────
    {
      id: 'arrival_writing',
      name: 'Writing Assessment',
      type: 'writing',
      maxScore: 11,
      estimatedMinutes: 7,
      instructions:
        'Complete the following writing tasks in {{targetLanguage}}.',
      tasks: [
        {
          id: 'arrival_write_form',
          name: 'Form Completion',
          instructions:
            'Fill out a visitor registration form for {{cityName}} in {{targetLanguage}}. Include your name, origin, reason for visit, and length of stay.',
          maxScore: 5,
          config: {
            scoringMethod: 'llm_evaluation',
            fields: ['name', 'origin', 'reason', 'duration', 'additional'],
          },
        },
        {
          id: 'arrival_write_message',
          name: 'Brief Message',
          instructions:
            'Write a short message in {{targetLanguage}} to a friend telling them you have arrived in {{cityName}} and what you plan to do.',
          maxScore: 6,
          scoringDimensions: [
            { id: 'task_completion', name: 'Task Completion', maxScore: 2, description: 'Message addresses the prompt requirements' },
            { id: 'vocabulary_range', name: 'Vocabulary', maxScore: 2, description: 'Appropriate and varied word choice' },
            { id: 'grammar_control', name: 'Grammar', maxScore: 2, description: 'Correct sentence structure and verb forms' },
          ],
        },
      ],
    },

    // ── Phase 4: Visual Recognition (10 pts) ──────────────────────────────
    {
      id: 'arrival_visual',
      name: 'Visual Recognition',
      type: 'visual',
      maxScore: 10,
      estimatedMinutes: 5,
      instructions:
        'Demonstrate your ability to read and identify {{targetLanguage}} in the environment around {{cityName}}.',
      tasks: [
        {
          id: 'arrival_visual_signs',
          name: 'Sign Reading',
          instructions:
            'Read 5 signs written in {{targetLanguage}} around {{cityName}} and select the correct meaning from 3 options each.',
          maxScore: 5,
          config: {
            itemCount: 5,
            optionsPerItem: 3,
            pointsPerItem: 1,
          },
        },
        {
          id: 'arrival_visual_objects',
          name: 'Object Identification',
          instructions:
            'Identify 5 objects labeled in {{targetLanguage}}. Say the name aloud and select the matching object.',
          maxScore: 5,
          config: {
            itemCount: 5,
            pointsPerItem: 1,
            requiresVerbal: true,
          },
        },
      ],
    },
  ],
};
