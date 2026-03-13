/**
 * Arrival Encounter — pre-test assessment definition (US-5.06)
 *
 * 4 phases, 53 total points, template strings with {{targetLanguage}} and {{cityName}}.
 */

import type { AssessmentDefinition } from './assessment-types';

export const ARRIVAL_ENCOUNTER: AssessmentDefinition = {
  id: 'arrival_encounter',
  type: 'arrival_encounter',
  name: 'Arrival Encounter',
  description: 'Initial language proficiency assessment upon arriving in the city.',
  totalMaxScore: 53,
  scoringDimensions: [
    { id: 'vocabulary', name: 'Vocabulary', maxScore: 5, description: 'Range and accuracy of word choice' },
    { id: 'grammar', name: 'Grammar', maxScore: 5, description: 'Grammatical accuracy and complexity' },
    { id: 'fluency', name: 'Fluency', maxScore: 5, description: 'Smoothness and natural flow of communication' },
    { id: 'comprehension', name: 'Comprehension', maxScore: 5, description: 'Understanding of spoken and written input' },
    { id: 'task_completion', name: 'Task Completion', maxScore: 5, description: 'Ability to accomplish communicative goals' },
  ],
  phases: [
    {
      id: 'conversational',
      name: 'Conversational',
      order: 1,
      maxScore: 25,
      timeLimitSeconds: 600,
      systemPromptTemplate: `You are a friendly local in {{cityName}} who speaks {{targetLanguage}}. A traveler has just arrived and approaches you for help. Have a natural conversation to help them orient themselves. Assess their {{targetLanguage}} ability through natural dialogue — ask about their trip, where they're staying, what they want to see. Adapt your language complexity to their level.`,
      tasks: [
        { id: 'conv_greeting', title: 'Greeting & Introduction', description: 'Exchange greetings and introductions', maxScore: 5, dimensionId: 'vocabulary' },
        { id: 'conv_directions', title: 'Asking/Giving Directions', description: 'Navigate a directions exchange', maxScore: 5, dimensionId: 'fluency' },
        { id: 'conv_preferences', title: 'Expressing Preferences', description: 'Discuss preferences and opinions', maxScore: 5, dimensionId: 'grammar' },
        { id: 'conv_problem', title: 'Problem Solving', description: 'Handle a small problem or misunderstanding', maxScore: 5, dimensionId: 'comprehension' },
        { id: 'conv_closing', title: 'Closing Conversation', description: 'Wrap up conversation naturally', maxScore: 5, dimensionId: 'task_completion' },
      ],
    },
    {
      id: 'listening',
      name: 'Listening',
      order: 2,
      maxScore: 7,
      timeLimitSeconds: 300,
      tasks: [
        { id: 'listen_directions', title: 'Following Directions', description: 'Follow spoken directions to a location', maxScore: 4, dimensionId: 'comprehension' },
        { id: 'listen_extraction', title: 'Information Extraction', description: 'Answer questions about spoken information', maxScore: 3, dimensionId: 'comprehension' },
      ],
    },
    {
      id: 'writing',
      name: 'Writing',
      order: 3,
      maxScore: 11,
      timeLimitSeconds: 420,
      tasks: [
        { id: 'write_form', title: 'Form Completion', description: 'Fill out a registration or check-in form', maxScore: 5, dimensionId: 'task_completion' },
        { id: 'write_message', title: 'Brief Message', description: 'Write a short message or note', maxScore: 6, dimensionId: 'grammar' },
      ],
    },
    {
      id: 'visual',
      name: 'Visual Recognition',
      order: 4,
      maxScore: 10,
      timeLimitSeconds: 300,
      tasks: [
        { id: 'visual_signs', title: 'Sign Reading', description: 'Identify meaning of signs in {{targetLanguage}}', maxScore: 5, dimensionId: 'vocabulary' },
        { id: 'visual_objects', title: 'Object Identification', description: 'Name objects verbally and by selection', maxScore: 5, dimensionId: 'vocabulary' },
      ],
    },
  ],
};
