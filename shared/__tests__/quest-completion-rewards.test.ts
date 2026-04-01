/**
 * Tests for quest completion rewards and progression:
 * 1. Item reward granting to player inventory
 * 2. Prerequisite-dependent quest auto-unlocking
 * 3. Chain completion bonus XP application
 */

import { describe, it, expect } from 'vitest';
import {
  grantItemRewards,
  findQuestsToUnlock,
  applyChainBonusXP,
  type InventoryItem,
  type ItemReward,
  type MinimalQuest,
} from '../quests/quest-completion-rewards';

// ── grantItemRewards ─────────────────────────────────────────────────────────

describe('grantItemRewards', () => {
  it('adds new items to an empty inventory', () => {
    const inventory: InventoryItem[] = [];
    const rewards: ItemReward[] = [
      { itemId: 'bread', quantity: 3, name: 'Pain' },
      { itemId: 'sword', quantity: 1, name: 'Épée' },
    ];

    const granted = grantItemRewards(inventory, rewards);

    expect(inventory).toHaveLength(2);
    expect(inventory[0]).toEqual({ itemId: 'bread', quantity: 3, name: 'Pain' });
    expect(inventory[1]).toEqual({ itemId: 'sword', quantity: 1, name: 'Épée' });
    expect(granted).toHaveLength(2);
  });

  it('increments quantity for existing items', () => {
    const inventory: InventoryItem[] = [
      { itemId: 'bread', quantity: 2, name: 'Pain' },
    ];
    const rewards: ItemReward[] = [
      { itemId: 'bread', quantity: 5, name: 'Pain' },
    ];

    grantItemRewards(inventory, rewards);

    expect(inventory).toHaveLength(1);
    expect(inventory[0].quantity).toBe(7);
  });

  it('handles mix of new and existing items', () => {
    const inventory: InventoryItem[] = [
      { itemId: 'gold_coin', quantity: 10, name: 'Pièce d\'or' },
    ];
    const rewards: ItemReward[] = [
      { itemId: 'gold_coin', quantity: 5, name: 'Pièce d\'or' },
      { itemId: 'map', quantity: 1, name: 'Carte' },
    ];

    grantItemRewards(inventory, rewards);

    expect(inventory).toHaveLength(2);
    expect(inventory[0].quantity).toBe(15); // gold_coin: 10 + 5
    expect(inventory[1]).toEqual({ itemId: 'map', quantity: 1, name: 'Carte' });
  });

  it('returns empty array for empty rewards', () => {
    const inventory: InventoryItem[] = [{ itemId: 'x', quantity: 1, name: 'X' }];
    const granted = grantItemRewards(inventory, []);

    expect(granted).toHaveLength(0);
    expect(inventory).toHaveLength(1);
  });

  it('grants multiple of the same item reward', () => {
    const inventory: InventoryItem[] = [];
    const rewards: ItemReward[] = [
      { itemId: 'potion', quantity: 2, name: 'Potion' },
      { itemId: 'potion', quantity: 3, name: 'Potion' },
    ];

    grantItemRewards(inventory, rewards);

    // First reward adds potion with qty 2, second increments to 5
    expect(inventory).toHaveLength(1);
    expect(inventory[0].quantity).toBe(5);
  });
});

// ── findQuestsToUnlock ───────────────────────────────────────────────────────

describe('findQuestsToUnlock', () => {
  it('unlocks quest with single prerequisite that was just completed', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'unavailable', prerequisiteQuestIds: ['q1'] },
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    expect(unlocked).toEqual(['q2']);
  });

  it('unlocks quest when all multiple prerequisites are met', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'completed' },
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: ['q1', 'q2'] },
    ];

    // q2 was already completed, now q1 is being completed — but wait,
    // q1 is also already completed. Let's test with q2 being the trigger.
    const unlocked = findQuestsToUnlock('q2', quests);

    expect(unlocked).toEqual(['q3']);
  });

  it('does NOT unlock quest when some prerequisites are incomplete', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'active' }, // not completed
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: ['q1', 'q2'] },
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    expect(unlocked).toEqual([]);
  });

  it('ignores quests that are not unavailable', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'available', prerequisiteQuestIds: ['q1'] }, // already available
      { id: 'q3', status: 'active', prerequisiteQuestIds: ['q1'] }, // already active
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    expect(unlocked).toEqual([]);
  });

  it('ignores quests with no prerequisites', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'unavailable' }, // no prereqs
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: [] },
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    expect(unlocked).toEqual([]);
  });

  it('ignores quests whose prerequisites do not include the completed quest', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'unavailable', prerequisiteQuestIds: ['q99'] },
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    expect(unlocked).toEqual([]);
  });

  it('unlocks multiple quests at once', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'unavailable', prerequisiteQuestIds: ['q1'] },
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: ['q1'] },
      { id: 'q4', status: 'unavailable', prerequisiteQuestIds: ['q1'] },
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    expect(unlocked).toEqual(['q2', 'q3', 'q4']);
  });

  it('handles chain: completing q1 unlocks q2, but q3 (needs q2) stays locked', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'unavailable', prerequisiteQuestIds: ['q1'] },
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: ['q2'] },
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    // q2 should unlock, but q3 should NOT (q2 is still unavailable, not completed)
    expect(unlocked).toEqual(['q2']);
  });

  it('handles null prerequisiteQuestIds gracefully', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'unavailable', prerequisiteQuestIds: null },
    ];

    const unlocked = findQuestsToUnlock('q1', quests);

    expect(unlocked).toEqual([]);
  });
});

// ── applyChainBonusXP ────────────────────────────────────────────────────────

describe('applyChainBonusXP', () => {
  it('adds bonus XP to current total', () => {
    const result = applyChainBonusXP(500, 100);

    expect(result).toEqual({ newXP: 600 });
  });

  it('returns null for zero bonus', () => {
    const result = applyChainBonusXP(500, 0);

    expect(result).toBeNull();
  });

  it('returns null for negative bonus', () => {
    const result = applyChainBonusXP(500, -10);

    expect(result).toBeNull();
  });

  it('works with zero current XP', () => {
    const result = applyChainBonusXP(0, 250);

    expect(result).toEqual({ newXP: 250 });
  });

  it('handles large XP values', () => {
    const result = applyChainBonusXP(99999, 1500);

    expect(result).toEqual({ newXP: 101499 });
  });
});
