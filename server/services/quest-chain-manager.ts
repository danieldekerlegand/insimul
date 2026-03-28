/**
 * Quest Chain Manager
 *
 * Manages quest chains - sequences of quests that tell a story or build
 * towards a larger goal. Supports linear and non-linear quest chains
 * with prerequisites.
 */

import { storage } from '../db/storage.js';
import type { Quest, InsertQuest } from '../../shared/schema.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';
import { getChainTemplate, type QuestChainTemplate } from './quest-chain-templates.js';

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  worldId: string;
  quests: Quest[];
  isLinear: boolean;
}

export interface ChainCompletionResult {
  isComplete: boolean;
  bonusXP: number;
  achievement: string | null;
  chainName: string;
  totalQuests: number;
  completedQuests: number;
}

/** Chain metadata stored in each quest's tags for reconstruction */
const CHAIN_META_PREFIX = 'chain_meta:';

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

    // Save quests to database (with Prolog content)
    const createdQuests: Quest[] = [];
    for (const quest of chainQuests) {
      // Auto-generate Prolog content if not provided
      if (!quest.content && quest.title) {
        try {
          const result = convertQuestToProlog(quest as any);
          if (result.prologContent) (quest as any).content = result.prologContent;
        } catch (e) {
          console.warn('[QuestProlog] Failed to convert chain quest:', e);
        }
      }
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

  /**
   * Create a quest chain from a predefined template.
   */
  async createFromTemplate(
    templateId: string,
    worldId: string,
    targetLanguage: string,
    assignedTo?: string,
    assignedToCharacterId?: string,
  ): Promise<QuestChain | null> {
    const template = getChainTemplate(templateId, targetLanguage);
    if (!template) return null;

    const chainMeta = encodeChainMeta(template.name, template.bonusXP, template.achievement);

    const quests: InsertQuest[] = template.quests.map(q => ({
      ...q,
      worldId,
      assignedTo: assignedTo || 'unassigned',
      assignedToCharacterId: assignedToCharacterId || null,
      tags: [...(q.tags || []), chainMeta],
    }));

    return this.createQuestChain(
      { id: '', name: template.name, description: template.description, worldId, isLinear: template.isLinear },
      quests,
    );
  }

  /**
   * Check whether completing a quest finishes the entire chain.
   * Returns bonus XP and achievement info if the chain is now complete.
   */
  async checkChainCompletion(quest: Quest): Promise<ChainCompletionResult> {
    const noCompletion: ChainCompletionResult = {
      isComplete: false,
      bonusXP: 0,
      achievement: null,
      chainName: '',
      totalQuests: 0,
      completedQuests: 0,
    };

    if (!quest.questChainId) return noCompletion;

    const allQuests = await storage.getQuestsByWorld(quest.worldId);
    const chainQuests = allQuests.filter(q => q.questChainId === quest.questChainId);

    if (chainQuests.length === 0) return noCompletion;

    // Count completed (include the just-completed quest)
    const completedCount = chainQuests.filter(
      q => q.status === 'completed' || q.id === quest.id
    ).length;

    // Extract chain metadata from tags
    const meta = extractChainMeta(chainQuests);

    const result: ChainCompletionResult = {
      isComplete: completedCount >= chainQuests.length,
      bonusXP: meta.bonusXP,
      achievement: meta.achievement,
      chainName: meta.name,
      totalQuests: chainQuests.length,
      completedQuests: completedCount,
    };

    return result;
  }
}

/**
 * Encode chain metadata into a tag string for storage.
 */
export function encodeChainMeta(name: string, bonusXP: number, achievement: string): string {
  return `${CHAIN_META_PREFIX}${JSON.stringify({ name, bonusXP, achievement })}`;
}

/**
 * Extract chain metadata from quest tags.
 */
export function extractChainMeta(chainQuests: Quest[]): { name: string; bonusXP: number; achievement: string } {
  for (const quest of chainQuests) {
    const tags = quest.tags || [];
    for (const tag of tags) {
      if (typeof tag === 'string' && tag.startsWith(CHAIN_META_PREFIX)) {
        try {
          return JSON.parse(tag.slice(CHAIN_META_PREFIX.length));
        } catch {
          // ignore parse errors
        }
      }
    }
  }
  return { name: 'Quest Chain', bonusXP: 0, achievement: '' };
}

// Export singleton instance
export const questChainManager = new QuestChainManager();
