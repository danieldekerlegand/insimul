/**
 * Arrival Encounter — Pre-test assessment definition
 *
 * Administered when a player first arrives in a new city. Measures baseline
 * language proficiency across 4 sections: reading, writing, listening,
 * and conversation. Total: 53 points.
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

// Re-export types for consumers that import from this file
export type { AssessmentDefinition, AssessmentPhase, AssessmentTask, ContentTemplate, ConversationQuestConfig, PhaseType, ScoringDimension };

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
      description: resolveTemplate(phase.description, vars),
      tasks: phase.tasks.map(task => ({
        ...task,
        prompt: resolveTemplate(task.prompt, vars),
      })),
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Arrival Encounter definition
// ─────────────────────────────────────────────────────────────────────────────

export const ARRIVAL_ENCOUNTER: AssessmentDefinition = {
  id: 'arrival_encounter',
  type: 'arrival_encounter',
  name: 'Arrival Encounter',
  description:
    'Baseline {{targetLanguage}} proficiency assessment upon arriving in {{cityName}}.',
  totalMaxPoints: 53,

  phases: [
    // ── Section 1: Reading Comprehension (15 pts) ───────────────────────────
    {
      id: 'arrival_reading',
      name: 'Reading Comprehension',
      type: 'reading',
      maxScore: 15,
      maxPoints: 15,
      description:
        'Read a short passage in {{targetLanguage}} and answer comprehension questions.',
      tasks: [
        {
          id: 'arrival_reading_comprehension',
          name: 'Reading Passage',
          type: 'reading_comprehension',
          prompt:
            'Read the following passage in {{targetLanguage}} carefully, then answer the comprehension questions below.',
          maxScore: 15,
          maxPoints: 15,
          scoringMethod: 'llm',
          contentTemplate: {
            topic: 'A visitor arriving in {{cityName}} for the first time — reading signs, navigating the train station, and finding their accommodation. Include local landmarks and simple directions.',
            difficulty: 'beginner',
            lengthSentences: 5,
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
      id: 'arrival_writing',
      name: 'Writing Assessment',
      type: 'writing',
      maxScore: 15,
      maxPoints: 15,
      description:
        'Complete writing tasks in {{targetLanguage}}.',
      tasks: [
        {
          id: 'arrival_writing_response',
          name: 'Writing Prompts',
          type: 'writing_prompt',
          prompt:
            'Respond to the following writing prompts in {{targetLanguage}}. Write as much as you can.',
          maxScore: 15,
          maxPoints: 15,
          scoringMethod: 'llm',
          contentTemplate: {
            topic: 'Arriving in {{cityName}} — write a message to a friend about your arrival, and describe what you see around you in the city.',
            difficulty: 'beginner',
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
      id: 'arrival_listening',
      name: 'Listening Comprehension',
      type: 'listening',
      maxScore: 13,
      maxPoints: 13,
      description:
        'Listen to a passage in {{targetLanguage}} and answer comprehension questions.',
      tasks: [
        {
          id: 'arrival_listening_comprehension',
          name: 'Listening Passage',
          type: 'listening_comprehension',
          prompt:
            'Listen to the following passage in {{targetLanguage}}, then answer the comprehension questions. You may replay the audio.',
          maxScore: 13,
          maxPoints: 13,
          scoringMethod: 'llm',
          contentTemplate: {
            topic: 'A local resident giving a welcome announcement at the {{cityName}} visitor center — mentioning opening hours, nearby attractions, local customs, and a brief weather forecast.',
            difficulty: 'beginner',
            lengthSentences: 5,
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
      id: 'arrival_conversation',
      name: 'Conversation',
      type: 'conversation',
      maxScore: 10,
      maxPoints: 10,
      description:
        'Walk to the marked NPC and have a guided conversation in {{targetLanguage}}.',
      tasks: [
        {
          id: 'arrival_conversation_quest',
          name: 'Guided Conversation',
          type: 'conversation_quest',
          prompt:
            'Have a conversation with the NPC in {{targetLanguage}}. The conversation will adapt to your level. Topics include greetings, travel, and getting around {{cityName}}.',
          maxScore: 10,
          maxPoints: 10,
          scoringMethod: 'llm',
          questConfig: {
            minExchanges: 6,
            maxExchanges: 12,
            topics: ['greetings', 'travel', 'directions'],
            npcRole: 'A friendly local resident of {{cityName}} who enjoys meeting visitors and helping them get oriented.',
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
