/**
 * Skill Tree Module — Definition & Registration
 */

import type { FeatureModuleDefinition } from '../types';

export const SKILL_TREE_MODULE: FeatureModuleDefinition = {
  id: 'skill-tree',
  name: 'Skill Tree',
  description: 'Tiered skill tree with unlockable nodes driven by module conditions',
  dependencies: [],
  genreFeatureFlags: ['skills'], // wires to existing GenreFeatures.skills flag
  questObjectiveTypes: ['unlock_skill'],
  questRewardTypes: ['skill_unlock'],
};

export * from './types';
