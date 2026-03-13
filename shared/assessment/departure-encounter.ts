/**
 * Departure Encounter — Post-test assessment definition
 *
 * Administered when a player is preparing to leave a city. Measures
 * language proficiency gained through gameplay across 4 phases:
 * conversational, listening, writing, and visual recognition.
 * Total: 53 points (parallel structure to Arrival Encounter).
 *
 * Template variables: {{targetLanguage}}, {{cityName}}
 */

import {
  type AssessmentDefinition,
  type AssessmentPhase,
  type AssessmentPhaseType,
  type AssessmentTask,
  type ScoringDimension,
  resolveTemplate,
  resolveAssessment,
} from './arrival-encounter';

export { resolveTemplate, resolveAssessment };
export type { AssessmentDefinition, AssessmentPhase, AssessmentPhaseType, AssessmentTask, ScoringDimension };

// ─────────────────────────────────────────────────────────────────────────────
// Departure Encounter definition
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTURE_ENCOUNTER: AssessmentDefinition = {
  id: 'departure_encounter',
  name: 'Departure Encounter',
  description:
    'Post-gameplay {{targetLanguage}} proficiency assessment before departing {{cityName}}.',
  testPhase: 'post',
  totalMaxScore: 53,

  phases: [
    // ── Phase 1: Conversational (25 pts) ──────────────────────────────────
    {
      id: 'departure_conversational',
      name: 'Conversational Assessment',
      type: 'conversational',
      maxScore: 25,
      estimatedMinutes: 10,
      instructions:
        'You are preparing to leave {{cityName}}. A local friend you have made during your stay wants to say goodbye. Have a farewell conversation in {{targetLanguage}}.',
      tasks: [
        {
          id: 'departure_conv_dialogue',
          name: 'Farewell Conversation',
          instructions:
            'Have a conversation with the NPC in {{targetLanguage}}. Discuss your favorite experiences in {{cityName}}, what you learned, and your future plans.',
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
      id: 'departure_listening',
      name: 'Listening Comprehension',
      type: 'listening',
      maxScore: 7,
      estimatedMinutes: 5,
      instructions:
        'Listen carefully to the locals speaking {{targetLanguage}} and complete the tasks below.',
      tasks: [
        {
          id: 'departure_listen_announcement',
          name: 'Travel Announcement',
          instructions:
            'Listen to a departure announcement in {{targetLanguage}} at the {{cityName}} station. Follow the instructions to reach the correct platform.',
          maxScore: 4,
          config: {
            scoringMethod: 'position_tracking',
            checkpoints: 4,
          },
        },
        {
          id: 'departure_listen_farewell',
          name: 'Farewell Message',
          instructions:
            'A local leaves you a voice message in {{targetLanguage}} wishing you well. Answer 3 questions about what they said.',
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
      id: 'departure_writing',
      name: 'Writing Assessment',
      type: 'writing',
      maxScore: 11,
      estimatedMinutes: 7,
      instructions:
        'Complete the following writing tasks in {{targetLanguage}}.',
      tasks: [
        {
          id: 'departure_write_review',
          name: 'Guest Review',
          instructions:
            'Write a guest review in {{targetLanguage}} for a place you stayed at in {{cityName}}. Include what you liked, any suggestions, and a recommendation.',
          maxScore: 5,
          config: {
            scoringMethod: 'llm_evaluation',
            fields: ['liked', 'suggestions', 'recommendation', 'rating', 'additional'],
          },
        },
        {
          id: 'departure_write_postcard',
          name: 'Postcard Home',
          instructions:
            'Write a postcard in {{targetLanguage}} to someone back home describing your time in {{cityName}} and what you will miss most.',
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
      id: 'departure_visual',
      name: 'Visual Recognition',
      type: 'visual',
      maxScore: 10,
      estimatedMinutes: 5,
      instructions:
        'Demonstrate your ability to read and identify {{targetLanguage}} as you navigate your departure from {{cityName}}.',
      tasks: [
        {
          id: 'departure_visual_signs',
          name: 'Transit Sign Reading',
          instructions:
            'Read 5 transit and departure signs written in {{targetLanguage}} around {{cityName}} and select the correct meaning from 3 options each.',
          maxScore: 5,
          config: {
            itemCount: 5,
            optionsPerItem: 3,
            pointsPerItem: 1,
          },
        },
        {
          id: 'departure_visual_items',
          name: 'Souvenir Identification',
          instructions:
            'Identify 5 souvenirs and local goods labeled in {{targetLanguage}}. Say the name aloud and select the matching item.',
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
