/**
 * Main Quest Chain Seeder
 *
 * Seeds the "Missing Writer Mystery" quest chain for a world using
 * the quest chain template system. This is the main narrative arc
 * that connects all game activities through a chain of 8 quests.
 *
 * Called during world creation and by migration 037 for existing worlds.
 */

import { storage } from '../db/storage.js';
import { questChainManager, type QuestChain } from './quest-chain-manager.js';

const TEMPLATE_ID = 'missing-writer-mystery';

/**
 * Check if the missing writer quest chain already exists for a world.
 */
export async function hasMainQuestChain(worldId: string): Promise<boolean> {
  const quests = await storage.getQuestsByWorld(worldId);
  return quests.some(q => q.tags?.includes('main-quest') && q.questChainId);
}

/**
 * Seed the missing writer mystery quest chain for a world.
 * Returns null if the chain already exists.
 */
export async function seedMainQuestChain(
  worldId: string,
  targetLanguage: string,
  assignedTo?: string,
  assignedToCharacterId?: string,
): Promise<QuestChain | null> {
  if (await hasMainQuestChain(worldId)) {
    return null;
  }

  const chain = await questChainManager.createFromTemplate(
    TEMPLATE_ID,
    worldId,
    targetLanguage,
    assignedTo,
    assignedToCharacterId,
  );

  if (chain) {
    console.log(
      `[MainQuestSeeder] Seeded "${chain.name}" chain (${chain.quests.length} quests) for world ${worldId}`,
    );
  }

  return chain;
}
