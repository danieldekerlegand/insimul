/**
 * Assessment Module — Definition & Registration
 */

import type { FeatureModuleDefinition } from '../types';

export const ASSESSMENT_MODULE: FeatureModuleDefinition = {
  id: 'assessment',
  name: 'Assessment',
  description: 'Multi-phase assessment framework with pluggable instrument types',
  dependencies: [],
  genreFeatureFlags: ['assessment'],
  questObjectiveTypes: ['complete_assessment'],
  questRewardTypes: [],
  xpEventTypes: ['assessment_phase_complete', 'assessment_complete'],
};

export * from './types';
