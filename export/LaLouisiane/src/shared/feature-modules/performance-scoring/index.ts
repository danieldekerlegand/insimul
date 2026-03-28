/**
 * Performance Scoring Module — Definition & Registration
 */

import type { FeatureModuleDefinition } from '../types';

export const PERFORMANCE_SCORING_MODULE: FeatureModuleDefinition = {
  id: 'performance-scoring',
  name: 'Performance Scoring',
  description: 'Compare player output against expected output with graded feedback',
  dependencies: [],
  genreFeatureFlags: ['performanceScoring'],
  questObjectiveTypes: ['achieve_performance_grade'],
  questRewardTypes: [],
  xpEventTypes: ['performance_graded'],
};

export * from './types';
