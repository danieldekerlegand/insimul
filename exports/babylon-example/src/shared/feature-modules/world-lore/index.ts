/**
 * World Lore Module — Definition & Registration
 */

import type { FeatureModuleDefinition } from '../types';

export const WORLD_LORE_MODULE: FeatureModuleDefinition = {
  id: 'world-lore',
  name: 'World Lore',
  description: 'Rich world lore entries (languages, magic systems, factions, biomes, etc.)',
  dependencies: [],
  genreFeatureFlags: ['worldLore'],
  questObjectiveTypes: ['explore_lore', 'discover_lore_entry'],
  questRewardTypes: ['lore_entry'],
  xpEventTypes: ['lore_explored'],
  skillTreeConditionTypes: ['lore_entries_discovered'],
};

export * from './types';
