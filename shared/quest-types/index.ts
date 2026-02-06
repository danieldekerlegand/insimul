/**
 * Quest Type Registry
 *
 * Central registry for all quest types. Provides utilities for looking up
 * quest type definitions based on world type or game type.
 */

import { languageLearningQuestType } from './language-learning';
import { rpgQuestType } from './rpg';
import { strategyQuestType } from './strategy';
import { survivalQuestType } from './survival';
import { platformerQuestType } from './platformer';
import { puzzleQuestType } from './puzzle';
import { shooterQuestType } from './shooter';
import type { QuestTypeDefinition, World } from './types';

/**
 * Registry of all available quest types
 */
export const QUEST_TYPE_REGISTRY: Record<string, QuestTypeDefinition> = {
  'language-learning': languageLearningQuestType,
  'rpg': rpgQuestType,
  'strategy': strategyQuestType,
  'survival': survivalQuestType,
  'platformer': platformerQuestType,
  'puzzle': puzzleQuestType,
  'shooter': shooterQuestType,
};

/**
 * Get quest type definition for a world
 *
 * Looks up the appropriate quest type based on the world's gameType or worldType.
 * Falls back to language-learning if no match found.
 *
 * @param world - The world object
 * @returns Quest type definition
 */
export function getQuestTypeForWorld(world: World): QuestTypeDefinition {
  // First try explicit gameType
  if (world.gameType && QUEST_TYPE_REGISTRY[world.gameType]) {
    return QUEST_TYPE_REGISTRY[world.gameType];
  }

  // Then try to infer from worldType
  const worldType = world.worldType?.toLowerCase() || '';

  // Map world types to game types
  if (worldType.includes('medieval') ||
      worldType.includes('fantasy') ||
      worldType.includes('cyberpunk') ||
      worldType.includes('sci-fi') ||
      worldType.includes('steampunk') ||
      worldType.includes('post-apocalyptic')) {
    return QUEST_TYPE_REGISTRY['rpg'];
  }

  // Strategy games
  if (worldType.includes('strategy') || worldType.includes('empire') || worldType.includes('civilization')) {
    return QUEST_TYPE_REGISTRY['strategy'];
  }

  // Survival games
  if (worldType.includes('survival') || worldType.includes('wilderness') || worldType.includes('zombie')) {
    return QUEST_TYPE_REGISTRY['survival'];
  }

  // Platformer games
  if (worldType.includes('platformer') || worldType.includes('mario') || worldType.includes('jump')) {
    return QUEST_TYPE_REGISTRY['platformer'];
  }

  // Puzzle games
  if (worldType.includes('puzzle') || worldType.includes('mystery') || worldType.includes('logic')) {
    return QUEST_TYPE_REGISTRY['puzzle'];
  }

  // Shooter games
  if (worldType.includes('shooter') || worldType.includes('fps') || worldType.includes('military') || worldType.includes('tactical')) {
    return QUEST_TYPE_REGISTRY['shooter'];
  }

  // Default to language-learning
  return QUEST_TYPE_REGISTRY['language-learning'];
}

/**
 * Get quest type definition by ID
 *
 * @param questTypeId - The quest type ID
 * @returns Quest type definition or undefined
 */
export function getQuestTypeById(questTypeId: string): QuestTypeDefinition | undefined {
  return QUEST_TYPE_REGISTRY[questTypeId];
}

/**
 * Get all available quest types
 *
 * @returns Array of all quest type definitions
 */
export function getAllQuestTypes(): QuestTypeDefinition[] {
  return Object.values(QUEST_TYPE_REGISTRY);
}

/**
 * Check if a quest type exists
 *
 * @param questTypeId - The quest type ID to check
 * @returns True if quest type exists
 */
export function hasQuestType(questTypeId: string): boolean {
  return questTypeId in QUEST_TYPE_REGISTRY;
}

// Re-export types for convenience
export * from './types';
export { languageLearningQuestType } from './language-learning';
export { rpgQuestType } from './rpg';
export { strategyQuestType } from './strategy';
export { survivalQuestType } from './survival';
export { platformerQuestType } from './platformer';
export { puzzleQuestType } from './puzzle';
export { shooterQuestType } from './shooter';
