/**
 * Quest Depletion Monitor
 *
 * Detects when a player's active quest count falls below a threshold
 * and auto-generates new quests using the quest assignment engine.
 */

import type { Quest, World, Character, Settlement, InsertQuest } from '../../shared/schema.js';
import { assignQuests, type WorldContext, type AssignmentOptions } from './quest-assignment-engine.js';

export interface DepletionConfig {
  /** Minimum active quests before auto-generation triggers (default 2) */
  minActiveQuests: number;
  /** Number of quests to generate when depleted (default 3) */
  replenishCount: number;
}

const DEFAULT_CONFIG: DepletionConfig = {
  minActiveQuests: 2,
  replenishCount: 3,
};

export interface DepletionCheckResult {
  depleted: boolean;
  activeCount: number;
  threshold: number;
  generatedQuests: Quest[];
}

/**
 * Count a player's active quests in a world.
 */
export function countActiveQuests(quests: Quest[], playerName: string, worldId: string): number {
  return quests.filter(
    (q) => q.worldId === worldId && q.assignedTo === playerName && q.status === 'active',
  ).length;
}

/**
 * Check if a player's quest pool is depleted and generate new quests if needed.
 *
 * @param worldQuests - All quests in the world (pre-fetched)
 * @param ctx - World context for quest generation
 * @param playerName - The player to check
 * @param config - Depletion thresholds
 * @param saveQuest - Callback to persist each generated quest
 * @returns Result with depletion status and any generated quests
 */
export async function checkAndReplenishQuests(
  worldQuests: Quest[],
  ctx: WorldContext,
  playerName: string,
  config: Partial<DepletionConfig> = {},
  saveQuest: (quest: InsertQuest) => Promise<Quest>,
): Promise<DepletionCheckResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const activeCount = countActiveQuests(worldQuests, playerName, ctx.world.id);

  if (activeCount >= cfg.minActiveQuests) {
    return { depleted: false, activeCount, threshold: cfg.minActiveQuests, generatedQuests: [] };
  }

  // Generate quests using the assignment engine
  const assignmentOptions: AssignmentOptions = {
    playerName,
    count: cfg.replenishCount,
  };

  const assigned = assignQuests(
    { ...ctx, existingQuests: worldQuests },
    assignmentOptions,
  );

  // Persist each generated quest
  const generatedQuests: Quest[] = [];
  for (const quest of assigned) {
    const { templateId, filledParameters, ...questData } = quest;
    const saved = await saveQuest(questData as InsertQuest);
    generatedQuests.push(saved);
  }

  return {
    depleted: true,
    activeCount,
    threshold: cfg.minActiveQuests,
    generatedQuests,
  };
}
