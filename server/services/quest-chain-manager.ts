/**
 * Quest Chain Manager
 *
 * Manages quest chains - sequences of quests that tell a story or build
 * towards a larger goal. Supports linear and non-linear quest chains
 * with prerequisites.
 */

import { storage } from '../db/storage.js';
import type { Quest, InsertQuest } from '../../shared/schema.js';

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  worldId: string;
  quests: Quest[];
  isLinear: boolean; // If true, must complete in order
}

export class QuestChainManager {
  /**
   * Create a quest chain from existing or new quests
   */
  async createQuestChain(
    chainData: Omit<QuestChain, 'quests'>,
    quests: InsertQuest[]
  ): Promise<QuestChain> {
    const chainId = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add chain info to each quest
    const chainQuests: InsertQuest[] = quests.map((quest, index) => {
      const questData: InsertQuest = {
        ...quest,
        questChainId: chainId,
        questChainOrder: index,
      };

      // For linear chains, add prerequisite to all quests except the first
      if (chainData.isLinear && index > 0) {
        questData.prerequisiteQuestIds = [quests[index - 1].id || ''];
      }

      return questData;
    });

    // Save quests to database
    const createdQuests: Quest[] = [];
    for (const quest of chainQuests) {
      const created = await storage.createQuest(quest);
      createdQuests.push(created);
    }

    return {
      id: chainId,
      ...chainData,
      quests: createdQuests,
    };
  }

  /**
   * Check if player can accept a quest (prerequisites met)
   */
  async canAcceptQuest(quest: Quest, playerId: string): Promise<boolean> {
    // If no prerequisites, quest is available
    if (!quest.prerequisiteQuestIds || quest.prerequisiteQuestIds.length === 0) {
      return true;
    }

    // Get all player quests
    const playerQuests = await storage.getQuestsByPlayer(playerId);

    // Get IDs of completed quests
    const completedQuestIds = playerQuests
      .filter(q => q.status === 'completed')
      .map(q => q.id);

    // Check if all prerequisites are completed
    return quest.prerequisiteQuestIds.every(prereqId =>
      completedQuestIds.includes(prereqId)
    );
  }

  /**
   * Get next quest in chain after completing current quest
   */
  async getNextQuestInChain(currentQuest: Quest): Promise<Quest | null> {
    if (!currentQuest.questChainId) return null;

    // Get all quests in the chain
    const allQuests = await storage.getQuestsByWorld(currentQuest.worldId);
    const chainQuests = allQuests.filter(
      q => q.questChainId === currentQuest.questChainId
    );

    // Sort by chain order
    chainQuests.sort((a, b) => {
      const orderA = a.questChainOrder || 0;
      const orderB = b.questChainOrder || 0;
      return orderA - orderB;
    });

    // Find next quest
    const nextOrder = (currentQuest.questChainOrder || 0) + 1;
    return chainQuests.find(q => q.questChainOrder === nextOrder) || null;
  }

  /**
   * Get quest chain progress for a player
   */
  async getChainProgress(chainId: string, worldId: string, playerId: string): Promise<{
    total: number;
    completed: number;
    current: Quest | null;
    percentComplete: number;
  }> {
    // Get all quests in the chain
    const allQuests = await storage.getQuestsByWorld(worldId);
    const chainQuests = allQuests.filter(q => q.questChainId === chainId);

    // Sort by chain order
    chainQuests.sort((a, b) => {
      const orderA = a.questChainOrder || 0;
      const orderB = b.questChainOrder || 0;
      return orderA - orderB;
    });

    // Get player quests to check completion
    const playerQuests = await storage.getQuestsByPlayer(playerId);
    const completedQuestIds = new Set(
      playerQuests.filter(q => q.status === 'completed').map(q => q.id)
    );

    // Count completed chain quests
    const completedCount = chainQuests.filter(q =>
      completedQuestIds.has(q.id)
    ).length;

    // Find current (first incomplete) quest
    const currentQuest = chainQuests.find(q =>
      !completedQuestIds.has(q.id)
    ) || null;

    return {
      total: chainQuests.length,
      completed: completedCount,
      current: currentQuest,
      percentComplete: chainQuests.length > 0
        ? Math.round((completedCount / chainQuests.length) * 100)
        : 0,
    };
  }

  /**
   * Get all quest chains for a world
   */
  async getQuestChains(worldId: string): Promise<QuestChain[]> {
    const allQuests = await storage.getQuestsByWorld(worldId);

    // Group quests by chain ID
    const chainMap = new Map<string, Quest[]>();

    allQuests.forEach(quest => {
      if (quest.questChainId) {
        const existing = chainMap.get(quest.questChainId) || [];
        existing.push(quest);
        chainMap.set(quest.questChainId, existing);
      }
    });

    // Convert to QuestChain objects
    const chains: QuestChain[] = [];

    for (const [chainId, quests] of chainMap.entries()) {
      // Sort quests by order
      quests.sort((a, b) => {
        const orderA = a.questChainOrder || 0;
        const orderB = b.questChainOrder || 0;
        return orderA - orderB;
      });

      // Determine if chain is linear by checking prerequisites
      const isLinear = quests.every((quest, index) => {
        if (index === 0) return true; // First quest has no prereqs
        const prereqs = quest.prerequisiteQuestIds || [];
        return prereqs.length === 1 && prereqs[0] === quests[index - 1].id;
      });

      // Use first quest's metadata for chain name/description
      const firstQuest = quests[0];

      chains.push({
        id: chainId,
        name: `Quest Chain: ${firstQuest.title}`, // Can be customized later
        description: 'A series of connected quests',
        worldId,
        quests,
        isLinear,
      });
    }

    return chains;
  }

  /**
   * Update quest chain order
   */
  async reorderQuestChain(
    chainId: string,
    questOrder: string[]
  ): Promise<void> {
    for (let i = 0; i < questOrder.length; i++) {
      const questId = questOrder[i];
      await storage.updateQuest(questId, {
        questChainOrder: i,
      });
    }
  }

  /**
   * Add quest to existing chain
   */
  async addQuestToChain(
    questId: string,
    chainId: string,
    position?: number
  ): Promise<Quest | null> {
    const quest = await storage.updateQuest(questId, {
      questChainId: chainId,
      questChainOrder: position,
    });

    return quest;
  }

  /**
   * Remove quest from chain
   */
  async removeQuestFromChain(questId: string): Promise<Quest | null> {
    const quest = await storage.updateQuest(questId, {
      questChainId: null,
      questChainOrder: null,
      prerequisiteQuestIds: [],
    });

    return quest;
  }
}

// Export singleton instance
export const questChainManager = new QuestChainManager();
