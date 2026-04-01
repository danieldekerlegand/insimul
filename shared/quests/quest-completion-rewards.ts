/**
 * Quest Completion Rewards & Progression
 *
 * Shared logic for granting item rewards, unlocking prerequisite-dependent
 * quests, and applying chain-completion bonus XP when a quest is completed.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ItemReward {
  itemId: string;
  quantity: number;
  name: string;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  name: string;
}

export interface MinimalQuest {
  id: string;
  status: string;
  prerequisiteQuestIds?: string[] | null;
}

// ── Item Reward Granting ─────────────────────────────────────────────────────

/**
 * Merges item rewards into an existing inventory array (mutates in place).
 * If an item already exists, its quantity is incremented; otherwise it is appended.
 * Returns the list of items that were actually granted.
 */
export function grantItemRewards(
  currentInventory: InventoryItem[],
  itemRewards: ItemReward[],
): InventoryItem[] {
  const granted: InventoryItem[] = [];
  for (const reward of itemRewards) {
    const existing = currentInventory.find(item => item.itemId === reward.itemId);
    if (existing) {
      existing.quantity += reward.quantity;
      granted.push({ itemId: reward.itemId, quantity: reward.quantity, name: reward.name });
    } else {
      const newItem = { itemId: reward.itemId, quantity: reward.quantity, name: reward.name };
      currentInventory.push(newItem);
      granted.push(newItem);
    }
  }
  return granted;
}

// ── Prerequisite Quest Unlocking ─────────────────────────────────────────────

/**
 * Given a just-completed quest ID and all quests in the world, returns the IDs
 * of quests whose prerequisites are now fully met and should be unlocked
 * (status changed from 'unavailable' → 'available').
 */
export function findQuestsToUnlock(
  completedQuestId: string,
  allQuests: MinimalQuest[],
): string[] {
  const unlocked: string[] = [];

  for (const candidate of allQuests) {
    if (candidate.status !== 'unavailable') continue;
    const prereqs = candidate.prerequisiteQuestIds;
    if (!prereqs || prereqs.length === 0) continue;
    if (!prereqs.includes(completedQuestId)) continue;

    const allMet = prereqs.every(prereqId => {
      if (prereqId === completedQuestId) return true; // just completed
      const prereqQuest = allQuests.find(q => q.id === prereqId);
      return prereqQuest?.status === 'completed';
    });

    if (allMet) {
      unlocked.push(candidate.id);
    }
  }

  return unlocked;
}

// ── Chain Completion Bonus XP ────────────────────────────────────────────────

/**
 * Computes the new XP total after adding chain completion bonus XP.
 * Returns null if no bonus should be applied.
 */
export function applyChainBonusXP(
  currentXP: number,
  chainBonusXP: number,
): { newXP: number } | null {
  if (chainBonusXP <= 0) return null;
  return { newXP: currentXP + chainBonusXP };
}
