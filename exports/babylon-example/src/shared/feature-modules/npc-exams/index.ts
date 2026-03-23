/**
 * NPC Exams Module — Definition & Registration
 */

import type { FeatureModuleDefinition } from '../types';

export const NPC_EXAMS_MODULE: FeatureModuleDefinition = {
  id: 'npc-exams',
  name: 'NPC Exams',
  description: 'NPCs administer proficiency-adapted quizzes and exams',
  dependencies: [],
  genreFeatureFlags: ['npcExams'],
  questObjectiveTypes: ['pass_exam', 'complete_exam'],
  questRewardTypes: [],
  xpEventTypes: ['exam_complete', 'exam_passed'],
  skillTreeConditionTypes: ['exams_passed'],
};

export * from './types';
