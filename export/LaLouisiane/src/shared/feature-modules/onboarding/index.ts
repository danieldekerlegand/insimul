/**
 * Onboarding Module — Definition & Registration
 */

import type { FeatureModuleDefinition } from '../types';
import { CORE_ONBOARDING_STEPS } from './types';

export const ONBOARDING_MODULE: FeatureModuleDefinition = {
  id: 'onboarding',
  name: 'Onboarding',
  description: 'Composable onboarding sequences with module-contributed steps',
  dependencies: [],
  genreFeatureFlags: ['onboarding'],
  questObjectiveTypes: [],
  questRewardTypes: [],
  xpEventTypes: ['onboarding_step_complete', 'onboarding_complete'],
  onboardingSteps: CORE_ONBOARDING_STEPS,
};

export * from './types';
