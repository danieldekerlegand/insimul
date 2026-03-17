/**
 * Departure Encounter — Post-test assessment definition
 *
 * Administered when a player is preparing to leave a city. Measures
 * language proficiency gained through gameplay across 4 sections:
 * reading, writing, listening, and conversation.
 * Total: 53 points (parallel structure to Arrival Encounter).
 *
 * Content is generated at runtime by the LLM using the contentTemplate
 * in each task. Template variables: {{targetLanguage}}, {{cityName}}
 */

import type {
  AssessmentDefinition,
  AssessmentPhase,
  AssessmentTask,
  ContentTemplate,
  ConversationQuestConfig,
  PhaseType,
  ScoringDimension,
} from './assessment-types';

export { resolveTemplate, resolveAssessment } from './arrival-encounter';
export type { AssessmentDefinition, AssessmentPhase, AssessmentTask, ContentTemplate, ConversationQuestConfig, PhaseType, ScoringDimension };

// ─────────────────────────────────────────────────────────────────────────────
// Departure Encounter definition
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTURE_ENCOUNTER: AssessmentDefinition = {
  id: 'departure_encounter',
  type: 'departure_encounter',
  name: 'Departure Encounter',
  description:
    'Post-gameplay {{targetLanguage}} proficiency assessment before departing {{cityName}}.',
  totalMaxPoints: 53,

  phases: [
    // ── Section 1: Reading Comprehension (15 pts) ───────────────────────────
    {
      id: 'departure_reading',
      name: 'Reading Comprehension',
      type: 'reading',
      maxScore: 15,
      maxPoints: 15,
      description:
        'Read a short passage in {{targetLanguage}} and answer comprehension questions.',
      tasks: [
        {
          id: 'departure_reading_comprehension',
          name: 'Reading Passage',
          type: 'reading_comprehension',
          prompt:
            'Read the following passage in {{targetLanguage}} carefully, then answer the comprehension questions below.',
          maxScore: 15,
          maxPoints: 15,
          scoringMethod: 'llm',
          contentTemplate: {
            topic: 'A traveler reflecting on their time in {{cityName}} — reading a local newspaper article about an upcoming festival, community events, and travel advisories for departing visitors.',
            difficulty: 'intermediate',
            lengthSentences: 6,
            questionCount: 3,
          },
          scoringDimensions: [
            { id: 'comprehension', name: 'Comprehension', maxScore: 5, description: 'Understanding of main ideas and details in the passage' },
            { id: 'vocabulary_recognition', name: 'Vocabulary Recognition', maxScore: 5, description: 'Ability to understand key vocabulary in context' },
            { id: 'inference', name: 'Inference', maxScore: 5, description: 'Ability to draw conclusions from the text' },
          ],
        },
      ],
    },

    // ── Section 2: Writing (15 pts) ─────────────────────────────────────────
    {
      id: 'departure_writing',
      name: 'Writing Assessment',
      type: 'writing',
      maxScore: 15,
      maxPoints: 15,
      description:
        'Complete writing tasks in {{targetLanguage}}.',
      tasks: [
        {
          id: 'departure_writing_response',
          name: 'Writing Prompts',
          type: 'writing_prompt',
          prompt:
            'Respond to the following writing prompts in {{targetLanguage}}. Write as much as you can.',
          maxScore: 15,
          maxPoints: 15,
          scoringMethod: 'llm',
          contentTemplate: {
            topic: 'Leaving {{cityName}} — write a guest review for a place you stayed, and write a postcard to someone back home describing your favorite experiences and what you will miss.',
            difficulty: 'intermediate',
            promptCount: 2,
          },
          scoringDimensions: [
            { id: 'task_completion', name: 'Task Completion', maxScore: 5, description: 'Response addresses the prompt requirements' },
            { id: 'vocabulary', name: 'Vocabulary', maxScore: 5, description: 'Range and appropriateness of word choice' },
            { id: 'grammar', name: 'Grammar', maxScore: 5, description: 'Correct sentence structure and verb forms' },
          ],
        },
      ],
    },

    // ── Section 3: Listening Comprehension (13 pts) ─────────────────────────
    {
      id: 'departure_listening',
      name: 'Listening Comprehension',
      type: 'listening',
      maxScore: 13,
      maxPoints: 13,
      description:
        'Listen to a passage in {{targetLanguage}} and answer comprehension questions.',
      tasks: [
        {
          id: 'departure_listening_comprehension',
          name: 'Listening Passage',
          type: 'listening_comprehension',
          prompt:
            'Listen to the following passage in {{targetLanguage}}, then answer the comprehension questions. You may replay the audio.',
          maxScore: 13,
          maxPoints: 13,
          scoringMethod: 'llm',
          contentTemplate: {
            topic: 'A departure announcement at the {{cityName}} transit station — mentioning platform numbers, departure times, travel safety tips, and a farewell message from the city.',
            difficulty: 'intermediate',
            lengthSentences: 6,
            questionCount: 3,
          },
          scoringDimensions: [
            { id: 'comprehension', name: 'Comprehension', maxScore: 5, description: 'Understanding of main ideas and details from the audio' },
            { id: 'detail_extraction', name: 'Detail Extraction', maxScore: 4, description: 'Ability to identify specific information from the audio' },
            { id: 'inference', name: 'Inference', maxScore: 4, description: 'Ability to draw conclusions from what was heard' },
          ],
        },
      ],
    },

    // ── Section 4: Conversation (10 pts) ────────────────────────────────────
    {
      id: 'departure_conversation',
      name: 'Conversation',
      type: 'conversation',
      maxScore: 10,
      maxPoints: 10,
      description:
        'Walk to the marked NPC and have a farewell conversation in {{targetLanguage}}.',
      tasks: [
        {
          id: 'departure_conversation_quest',
          name: 'Farewell Conversation',
          type: 'conversation_quest',
          prompt:
            'Have a conversation with the NPC in {{targetLanguage}}. Discuss your favorite experiences in {{cityName}}, what you learned, and your future plans.',
          maxScore: 10,
          maxPoints: 10,
          scoringMethod: 'llm',
          questConfig: {
            minExchanges: 6,
            maxExchanges: 12,
            topics: ['farewell', 'experiences', 'future_plans'],
            npcRole: 'A local friend the player made during their stay in {{cityName}} who wants to say goodbye and hear about their experiences.',
          },
          scoringDimensions: [
            { id: 'accuracy', name: 'Accuracy', maxScore: 2, description: 'Grammatical correctness and appropriate word forms' },
            { id: 'fluency', name: 'Fluency', maxScore: 2, description: 'Natural flow, pace, and cohesion of speech' },
            { id: 'vocabulary', name: 'Vocabulary', maxScore: 2, description: 'Range and precision of word choice' },
            { id: 'comprehension', name: 'Comprehension', maxScore: 2, description: 'Understanding of NPC prompts and contextual cues' },
            { id: 'pragmatics', name: 'Pragmatics', maxScore: 2, description: 'Socially appropriate language use and cultural awareness' },
          ],
        },
      ],
    },
  ],
};
