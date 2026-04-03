/**
 * E2E Quest Completion Flow Smoke Tests
 *
 * Tests the full quest completion pipeline end-to-end:
 *   QCE objective tracking → quest completed callback → reward granting
 *   → prerequisite unlocking → chain completion → vocab unlocks → skill rewards
 *
 * These complement quest-e2e-smoke.test.ts (which tests individual objective handlers)
 * by validating that the pieces fit together as a complete system.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../game-engine/logic/QuestCompletionEngine';
import {
  grantItemRewards,
  findQuestsToUnlock,
  applyChainBonusXP,
  type ItemReward,
  type InventoryItem,
  type MinimalQuest,
} from '../quests/quest-completion-rewards';
import {
  computeSkillRewards,
  applySkillRewards,
} from '../language/quest-skill-rewards';
import {
  extractVocabCategoryUnlocks,
  applyVocabCategoryUnlocks,
  getInitialUnlockedCategories,
} from '../language/vocabulary-category-unlock';
import { encodeChainMeta, extractChainMeta } from '../quests/quest-chain-manager';

// ── Helpers ─────────────────────────────────────────────────────────────────

let objectiveIdCounter = 0;

function makeObjective(overrides: Partial<CompletionObjective> & { type: string }): CompletionObjective {
  return {
    id: `obj_${++objectiveIdCounter}`,
    questId: 'test-quest',
    description: `Test ${overrides.type} objective`,
    completed: false,
    ...overrides,
  };
}

function makeQuest(objectives: CompletionObjective[], id = 'test-quest'): CompletionQuest {
  for (const o of objectives) o.questId = id;
  return { id, objectives };
}

// ── 1. Full Single-Quest Completion Flow ────────────────────────────────────

describe('E2E: single quest completion → rewards', () => {
  let engine: QuestCompletionEngine;
  let completedQuests: string[];

  beforeEach(() => {
    objectiveIdCounter = 0;
    engine = new QuestCompletionEngine();
    completedQuests = [];
    engine.setOnQuestCompleted(id => completedQuests.push(id));
  });

  it('completing all objectives triggers quest completion and reward pipeline', () => {
    // Setup: quest with 3 objectives + item rewards
    const obj1 = makeObjective({ type: 'talk_to_npc', npcId: 'baker1' });
    const obj2 = makeObjective({ type: 'collect_item', itemName: 'flour', itemCount: 2 });
    const obj3 = makeObjective({ type: 'deliver_item', npcId: 'baker1', itemName: 'flour' });
    const quest = makeQuest([obj1, obj2, obj3], 'baking-quest');
    engine.addQuest(quest);

    // Phase 1: complete talk_to_npc
    engine.trackEvent({ type: 'npc_conversation', npcId: 'baker1' });
    expect(obj1.completed).toBe(true);
    expect(completedQuests).toHaveLength(0);

    // Phase 2: collect items (2 needed)
    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'flour' });
    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'flour' });
    expect(obj2.completed).toBe(true);
    expect(completedQuests).toHaveLength(0);

    // Phase 3: deliver item → quest completes
    engine.trackEvent({ type: 'item_delivery', npcId: 'baker1', playerItemNames: ['flour'] });
    expect(obj3.completed).toBe(true);
    expect(completedQuests).toEqual(['baking-quest']);

    // Phase 4: simulate server-side reward granting
    const inventory: InventoryItem[] = [{ itemId: 'gold_coin', quantity: 10, name: 'Gold Coin' }];
    const itemRewards: ItemReward[] = [
      { itemId: 'bread', quantity: 3, name: 'Fresh Bread' },
      { itemId: 'gold_coin', quantity: 5, name: 'Gold Coin' },
    ];
    const granted = grantItemRewards(inventory, itemRewards);

    expect(granted).toHaveLength(2);
    expect(inventory.find(i => i.itemId === 'bread')?.quantity).toBe(3);
    expect(inventory.find(i => i.itemId === 'gold_coin')?.quantity).toBe(15); // 10 + 5

    // Phase 5: compute and apply skill rewards
    const skillRewards = computeSkillRewards({ questType: 'conversation', difficulty: 'intermediate' });
    expect(skillRewards.length).toBeGreaterThan(0);

    const { skills, applied } = applySkillRewards({ speaking: 5 }, skillRewards);
    expect(skills.speaking).toBeGreaterThan(5);
    expect(applied.length).toBe(skillRewards.length);
  });

  it('ordered objectives must complete sequentially before quest completes', () => {
    const obj1 = makeObjective({ type: 'visit_location', id: 'go-market', locationName: 'market', order: 1 });
    const obj2 = makeObjective({ type: 'talk_to_npc', id: 'talk-vendor', npcId: 'vendor1', order: 2 });
    const obj3 = makeObjective({ type: 'collect_item', id: 'buy-fish', itemName: 'fish', itemCount: 1, order: 3 });
    const quest = makeQuest([obj1, obj2, obj3], 'shopping-quest');
    engine.addQuest(quest);

    // Try completing out of order — should not work
    engine.trackEvent({ type: 'npc_conversation', npcId: 'vendor1' });
    expect(obj2.completed).toBe(false);

    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'fish' });
    expect(obj3.completed).toBe(false);

    // Complete in order
    engine.trackEvent({ type: 'location_discovery', locationId: 'market-1', locationName: 'The Market' });
    expect(obj1.completed).toBe(true);

    engine.trackEvent({ type: 'npc_conversation', npcId: 'vendor1' });
    expect(obj2.completed).toBe(true);

    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'fish' });
    expect(obj3.completed).toBe(true);
    expect(completedQuests).toEqual(['shopping-quest']);
  });

  it('vocabulary unlock flow: quest completion → category unlock', () => {
    const obj = makeObjective({ type: 'use_vocabulary', requiredCount: 3, targetWords: ['pain', 'fromage', 'vin'] });
    const quest = makeQuest([obj], 'food-vocab-quest');
    engine.addQuest(quest);

    engine.trackEvent({ type: 'vocabulary_usage', word: 'pain' });
    engine.trackEvent({ type: 'vocabulary_usage', word: 'fromage' });
    engine.trackEvent({ type: 'vocabulary_usage', word: 'vin' });
    expect(obj.completed).toBe(true);
    expect(completedQuests).toEqual(['food-vocab-quest']);

    // Simulate vocab category unlock
    const unlocks = [
      { type: 'vocabulary_category', id: 'food', name: 'Food & Drink' },
    ];
    const extracted = extractVocabCategoryUnlocks(unlocks);
    expect(extracted).toHaveLength(1);

    const initial = getInitialUnlockedCategories();
    const { updated, newlyUnlocked } = applyVocabCategoryUnlocks(initial, extracted);
    expect(newlyUnlocked).toContain('food');
    expect(updated).toContain('food');
    expect(updated.length).toBe(initial.length + 1);
  });
});

// ── 2. Prerequisite Unlocking Flow ──────────────────────────────────────────

describe('E2E: quest prerequisite unlocking', () => {
  let engine: QuestCompletionEngine;
  let completedQuests: string[];

  beforeEach(() => {
    objectiveIdCounter = 0;
    engine = new QuestCompletionEngine();
    completedQuests = [];
    engine.setOnQuestCompleted(id => completedQuests.push(id));
  });

  it('completing a quest unlocks dependent quests', () => {
    // World quests with prerequisite dependencies
    const allQuests: MinimalQuest[] = [
      { id: 'intro-quest', status: 'completed' },
      { id: 'main-quest', status: 'active' }, // currently being completed
      { id: 'sequel-quest', status: 'unavailable', prerequisiteQuestIds: ['main-quest'] },
      { id: 'advanced-quest', status: 'unavailable', prerequisiteQuestIds: ['main-quest', 'intro-quest'] },
      { id: 'unrelated-quest', status: 'unavailable', prerequisiteQuestIds: ['other-quest'] },
    ];

    const unlocked = findQuestsToUnlock('main-quest', allQuests);
    expect(unlocked).toContain('sequel-quest');
    expect(unlocked).toContain('advanced-quest'); // both prereqs met (intro=completed, main=just completed)
    expect(unlocked).not.toContain('unrelated-quest');
  });

  it('partial prerequisite satisfaction does NOT unlock', () => {
    const allQuests: MinimalQuest[] = [
      { id: 'quest-a', status: 'completed' }, // just completed
      { id: 'quest-b', status: 'active' },    // not yet completed
      { id: 'blocked-quest', status: 'unavailable', prerequisiteQuestIds: ['quest-a', 'quest-b'] },
    ];

    const unlocked = findQuestsToUnlock('quest-a', allQuests);
    expect(unlocked).not.toContain('blocked-quest');
  });

  it('multi-step prerequisite chain: A → B → C', () => {
    // Step 1: Complete A, unlock B
    const questsStep1: MinimalQuest[] = [
      { id: 'A', status: 'active' },
      { id: 'B', status: 'unavailable', prerequisiteQuestIds: ['A'] },
      { id: 'C', status: 'unavailable', prerequisiteQuestIds: ['B'] },
    ];

    const afterA = findQuestsToUnlock('A', questsStep1);
    expect(afterA).toEqual(['B']);

    // Step 2: Complete B, unlock C
    const questsStep2: MinimalQuest[] = [
      { id: 'A', status: 'completed' },
      { id: 'B', status: 'active' },
      { id: 'C', status: 'unavailable', prerequisiteQuestIds: ['B'] },
    ];

    const afterB = findQuestsToUnlock('B', questsStep2);
    expect(afterB).toEqual(['C']);
  });

  it('completing prerequisite does not unlock already-available/completed quests', () => {
    const allQuests: MinimalQuest[] = [
      { id: 'prereq', status: 'active' },
      { id: 'already-available', status: 'available', prerequisiteQuestIds: ['prereq'] },
      { id: 'already-completed', status: 'completed', prerequisiteQuestIds: ['prereq'] },
      { id: 'should-unlock', status: 'unavailable', prerequisiteQuestIds: ['prereq'] },
    ];

    const unlocked = findQuestsToUnlock('prereq', allQuests);
    expect(unlocked).toEqual(['should-unlock']);
  });
});

// ── 3. Quest Chain Completion Flow ──────────────────────────────────────────

describe('E2E: quest chain completion', () => {
  it('encodes and extracts chain metadata from quest tags', () => {
    const encoded = encodeChainMeta('Boulangerie Chain', 500, 'Master Baker');
    expect(encoded).toContain('Boulangerie Chain');

    // Simulate quests with chain meta tag
    const chainQuests = [
      { id: 'q1', tags: [encoded], questChainId: 'chain1' },
      { id: 'q2', tags: [], questChainId: 'chain1' },
    ] as any;

    const meta = extractChainMeta(chainQuests);
    expect(meta.name).toBe('Boulangerie Chain');
    expect(meta.bonusXP).toBe(500);
    expect(meta.achievement).toBe('Master Baker');
  });

  it('chain bonus XP applies correctly after chain completion', () => {
    const currentXP = 1000;
    const chainBonusXP = 500;

    const result = applyChainBonusXP(currentXP, chainBonusXP);
    expect(result).not.toBeNull();
    expect(result!.newXP).toBe(1500);
  });

  it('zero bonus XP returns null (no-op)', () => {
    expect(applyChainBonusXP(1000, 0)).toBeNull();
    expect(applyChainBonusXP(1000, -10)).toBeNull();
  });

  it('full chain flow: complete 3 quests → chain complete → bonus XP', () => {
    const engine = new QuestCompletionEngine();
    const completedQuests: string[] = [];
    engine.setOnQuestCompleted(id => completedQuests.push(id));

    // 3-quest chain
    const chain = [
      makeQuest(
        [makeObjective({ type: 'talk_to_npc', npcId: 'npc1' })],
        'chain-q1',
      ),
      makeQuest(
        [makeObjective({ type: 'collect_item', itemName: 'herbs', itemCount: 1 })],
        'chain-q2',
      ),
      makeQuest(
        [makeObjective({ type: 'deliver_item', npcId: 'npc1', itemName: 'herbs' })],
        'chain-q3',
      ),
    ];

    for (const q of chain) engine.addQuest(q);

    // Complete quest 1
    engine.trackEvent({ type: 'npc_conversation', npcId: 'npc1' });
    expect(completedQuests).toContain('chain-q1');

    // Complete quest 2
    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'herbs' });
    expect(completedQuests).toContain('chain-q2');

    // Complete quest 3
    engine.trackEvent({ type: 'item_delivery', npcId: 'npc1', playerItemNames: ['herbs'] });
    expect(completedQuests).toContain('chain-q3');
    expect(completedQuests).toHaveLength(3);

    // Simulate chain completion check
    const chainMeta = encodeChainMeta('Herb Gathering', 300, 'Herbalist');
    const chainQuests = chain.map((q, i) => ({
      id: q.id,
      status: 'completed',
      tags: i === 0 ? [chainMeta] : [],
      questChainId: 'herb-chain',
      questChainOrder: i,
    })) as any;

    const meta = extractChainMeta(chainQuests);
    expect(meta.bonusXP).toBe(300);

    const allComplete = chainQuests.every((q: any) => q.status === 'completed');
    expect(allComplete).toBe(true);

    const xpResult = applyChainBonusXP(500, meta.bonusXP);
    expect(xpResult!.newXP).toBe(800);
  });
});

// ── 4. Skill Reward Computation Flow ────────────────────────────────────────

describe('E2E: skill reward computation and application', () => {
  it('conversation quest at intermediate difficulty awards speaking + listening', () => {
    const rewards = computeSkillRewards({ questType: 'conversation', difficulty: 'intermediate' });
    expect(rewards.some(r => r.skillId === 'speaking')).toBe(true);
    expect(rewards.some(r => r.skillId === 'listening')).toBe(true);

    const speakingReward = rewards.find(r => r.skillId === 'speaking')!;
    expect(speakingReward.level).toBe(4); // base 2 * multiplier 2
  });

  it('translation quest awards reading + writing skills', () => {
    const rewards = computeSkillRewards({ questType: 'translation', difficulty: 'beginner' });
    expect(rewards.some(r => r.skillId === 'reading')).toBe(true);
    expect(rewards.some(r => r.skillId === 'writing')).toBe(true);
  });

  it('explicit skillRewards override computed rewards', () => {
    const explicit = [{ skillId: 'custom', name: 'Custom', level: 10 }];
    const rewards = computeSkillRewards({ questType: 'conversation', difficulty: 'advanced', skillRewards: explicit });
    expect(rewards).toEqual(explicit);
  });

  it('unknown quest type returns empty rewards', () => {
    const rewards = computeSkillRewards({ questType: 'unknown_type', difficulty: 'beginner' });
    expect(rewards).toHaveLength(0);
  });

  it('applying rewards accumulates on existing skills', () => {
    const current = { speaking: 10, listening: 5 };
    const rewards = computeSkillRewards({ questType: 'conversation', difficulty: 'advanced' });
    const { skills } = applySkillRewards(current, rewards);

    expect(skills.speaking).toBeGreaterThan(10);
    expect(skills.listening).toBeGreaterThan(5);
  });

  it('applying rewards creates new skill entries', () => {
    const current: Record<string, number> = {};
    const rewards = [{ skillId: 'grammar', name: 'Grammar', level: 5 }];
    const { skills } = applySkillRewards(current, rewards);
    expect(skills.grammar).toBe(5);
  });
});

// ── 5. Vocabulary Category Unlock Flow ──────────────────────────────────────

describe('E2E: vocabulary category unlocking', () => {
  it('initial categories are greetings, numbers, actions', () => {
    const initial = getInitialUnlockedCategories();
    expect(initial).toContain('greetings');
    expect(initial).toContain('numbers');
    expect(initial).toContain('actions');
    expect(initial).toHaveLength(3);
  });

  it('extracting vocab unlocks from quest unlocks array', () => {
    const questUnlocks = [
      { type: 'vocabulary_category', id: 'food', name: 'Food & Drink' },
      { type: 'vocabulary_category', id: 'family', name: 'Family' },
      { type: 'area_unlock', id: 'harbor', name: 'Harbor District' }, // not a vocab unlock
    ];
    const extracted = extractVocabCategoryUnlocks(questUnlocks);
    expect(extracted).toHaveLength(2);
    expect(extracted.map(e => e.id)).toEqual(['food', 'family']);
  });

  it('applying vocab unlocks deduplicates existing categories', () => {
    const current = ['greetings', 'numbers', 'food'];
    const newUnlocks = [
      { type: 'vocabulary_category' as const, id: 'food', name: 'Food' },     // already unlocked
      { type: 'vocabulary_category' as const, id: 'family', name: 'Family' },  // new
    ];
    const { updated, newlyUnlocked } = applyVocabCategoryUnlocks(current, newUnlocks);
    expect(newlyUnlocked).toEqual(['family']);
    expect(updated).toContain('food');
    expect(updated).toContain('family');
    expect(updated.length).toBe(4); // greetings, numbers, food, family
  });

  it('invalid category names are ignored', () => {
    const current = getInitialUnlockedCategories();
    const bad = [{ type: 'vocabulary_category' as const, id: 'nonexistent_category', name: 'Bad' }];
    const { newlyUnlocked } = applyVocabCategoryUnlocks(current, bad);
    expect(newlyUnlocked).toHaveLength(0);
  });

  it('null/undefined unlocks returns empty', () => {
    expect(extractVocabCategoryUnlocks(null)).toEqual([]);
    expect(extractVocabCategoryUnlocks(undefined)).toEqual([]);
  });
});

// ── 6. Multi-Quest Concurrent Tracking ──────────────────────────────────────

describe('E2E: multiple active quests tracked simultaneously', () => {
  let engine: QuestCompletionEngine;
  let completedQuests: string[];

  beforeEach(() => {
    objectiveIdCounter = 0;
    engine = new QuestCompletionEngine();
    completedQuests = [];
    engine.setOnQuestCompleted(id => completedQuests.push(id));
  });

  it('single event can complete objectives across multiple quests', () => {
    // Two quests both require talking to baker
    const quest1 = makeQuest(
      [makeObjective({ type: 'talk_to_npc', npcId: 'baker1' })],
      'quest-a',
    );
    const quest2 = makeQuest(
      [makeObjective({ type: 'talk_to_npc', npcId: 'baker1' })],
      'quest-b',
    );
    engine.addQuest(quest1);
    engine.addQuest(quest2);

    // One event completes both
    engine.trackEvent({ type: 'npc_conversation', npcId: 'baker1' });
    expect(completedQuests).toContain('quest-a');
    expect(completedQuests).toContain('quest-b');
  });

  it('events only match relevant quests by NPC/item', () => {
    const quest1 = makeQuest(
      [makeObjective({ type: 'talk_to_npc', npcId: 'baker1' })],
      'baker-quest',
    );
    const quest2 = makeQuest(
      [makeObjective({ type: 'talk_to_npc', npcId: 'smith1' })],
      'smith-quest',
    );
    engine.addQuest(quest1);
    engine.addQuest(quest2);

    engine.trackEvent({ type: 'npc_conversation', npcId: 'baker1' });
    expect(completedQuests).toEqual(['baker-quest']);

    engine.trackEvent({ type: 'npc_conversation', npcId: 'smith1' });
    expect(completedQuests).toContain('smith-quest');
  });

  it('mixed objective types across concurrent quests', () => {
    const collectQuest = makeQuest(
      [makeObjective({ type: 'collect_item', itemName: 'herbs', itemCount: 1 })],
      'collect-quest',
    );
    const talkQuest = makeQuest(
      [makeObjective({ type: 'talk_to_npc', npcId: 'healer1' })],
      'talk-quest',
    );
    const locationQuest = makeQuest(
      [makeObjective({ type: 'visit_location', locationName: 'forest' })],
      'location-quest',
    );
    engine.addQuest(collectQuest);
    engine.addQuest(talkQuest);
    engine.addQuest(locationQuest);

    engine.trackEvent({ type: 'location_discovery', locationId: 'f1', locationName: 'Dark Forest' });
    expect(completedQuests).toEqual(['location-quest']);

    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'herbs' });
    expect(completedQuests).toContain('collect-quest');

    engine.trackEvent({ type: 'npc_conversation', npcId: 'healer1' });
    expect(completedQuests).toContain('talk-quest');
    expect(completedQuests).toHaveLength(3);
  });
});

// ── 7. Complete E2E Scenario: New Player First Quest Chain ──────────────────

describe('E2E: new player first quest chain scenario', () => {
  it('full scenario: arrival → explore → talk → collect → complete → rewards → unlock next', () => {
    const engine = new QuestCompletionEngine();
    const completedQuests: string[] = [];
    engine.setOnQuestCompleted(id => completedQuests.push(id));

    // Arrival quest: visit the market, talk to a merchant, buy something
    const arrivalQuest = makeQuest([
      makeObjective({ type: 'visit_location', locationName: 'market', order: 1 }),
      makeObjective({ type: 'talk_to_npc', npcId: 'merchant1', order: 2 }),
      makeObjective({ type: 'buy_item', requiredCount: 1, order: 3 }),
    ], 'arrival-quest');
    engine.addQuest(arrivalQuest);

    // Step 1: Visit the market
    engine.trackEvent({ type: 'location_discovery', locationId: 'm1', locationName: 'Grand Market' });
    expect(arrivalQuest.objectives[0].completed).toBe(true);

    // Step 2: Talk to merchant
    engine.trackEvent({ type: 'npc_conversation', npcId: 'merchant1' });
    expect(arrivalQuest.objectives[1].completed).toBe(true);

    // Step 3: Buy an item
    engine.trackEvent({ type: 'item_purchased', itemName: 'bread', merchantId: 'merchant1' });
    expect(arrivalQuest.objectives[2].completed).toBe(true);
    expect(completedQuests).toEqual(['arrival-quest']);

    // Reward pipeline
    const playerInventory: InventoryItem[] = [];
    const itemRewards: ItemReward[] = [
      { itemId: 'market_map', quantity: 1, name: 'Market Map' },
    ];
    grantItemRewards(playerInventory, itemRewards);
    expect(playerInventory).toHaveLength(1);
    expect(playerInventory[0].name).toBe('Market Map');

    // Skill rewards
    const skillRewards = computeSkillRewards({ questType: 'vocabulary', difficulty: 'beginner' });
    const playerSkills: Record<string, number> = {};
    const { skills } = applySkillRewards(playerSkills, skillRewards);
    expect(skills.vocabulary).toBe(3); // base 3 * multiplier 1

    // Vocab unlock
    const unlocks = [{ type: 'vocabulary_category', id: 'shopping', name: 'Shopping' }];
    const vocabExtracted = extractVocabCategoryUnlocks(unlocks);
    const initialCats = getInitialUnlockedCategories();
    const { newlyUnlocked } = applyVocabCategoryUnlocks(initialCats, vocabExtracted);
    expect(newlyUnlocked).toEqual(['shopping']);

    // Prerequisite unlocking
    const worldQuests: MinimalQuest[] = [
      { id: 'arrival-quest', status: 'completed' },
      { id: 'advanced-shopping', status: 'unavailable', prerequisiteQuestIds: ['arrival-quest'] },
      { id: 'guild-intro', status: 'unavailable', prerequisiteQuestIds: ['arrival-quest'] },
      { id: 'endgame', status: 'unavailable', prerequisiteQuestIds: ['arrival-quest', 'advanced-shopping'] },
    ];
    const unlockedQuests = findQuestsToUnlock('arrival-quest', worldQuests);
    expect(unlockedQuests).toContain('advanced-shopping');
    expect(unlockedQuests).toContain('guild-intro');
    expect(unlockedQuests).not.toContain('endgame'); // still needs advanced-shopping
  });
});

// ── 8. Objective Serialization Across Sessions ──────────────────────────────

describe('E2E: save/load objective progress across sessions', () => {
  it('partial progress persists across engine instances', () => {
    // Session 1: partial progress
    const engine1 = new QuestCompletionEngine();
    const obj1 = makeObjective({ type: 'collect_item', itemName: 'ore', itemCount: 5, id: 'ore-obj' });
    const obj2 = makeObjective({ type: 'talk_to_npc', npcId: 'smith1', id: 'talk-obj' });
    const quest = makeQuest([obj1, obj2], 'mining-quest');
    engine1.addQuest(quest);

    engine1.trackEvent({ type: 'collect_item_by_name', itemName: 'ore' });
    engine1.trackEvent({ type: 'collect_item_by_name', itemName: 'ore' });
    engine1.trackEvent({ type: 'collect_item_by_name', itemName: 'ore' });
    expect(obj1.completed).toBe(false);
    expect(obj1.collectedCount).toBe(3);

    const savedState = engine1.serializeObjectiveStates();

    // Session 2: restore and continue
    const engine2 = new QuestCompletionEngine();
    const completedQuests: string[] = [];
    engine2.setOnQuestCompleted(id => completedQuests.push(id));

    const obj1Restored = makeObjective({ type: 'collect_item', itemName: 'ore', itemCount: 5, id: 'ore-obj' });
    const obj2Restored = makeObjective({ type: 'talk_to_npc', npcId: 'smith1', id: 'talk-obj' });
    const questRestored = makeQuest([obj1Restored, obj2Restored], 'mining-quest');
    engine2.addQuest(questRestored);
    engine2.restoreObjectiveStates(savedState);

    expect(obj1Restored.collectedCount).toBe(3);
    expect(obj1Restored.completed).toBe(false);

    // Complete remaining
    engine2.trackEvent({ type: 'collect_item_by_name', itemName: 'ore' });
    engine2.trackEvent({ type: 'collect_item_by_name', itemName: 'ore' });
    expect(obj1Restored.completed).toBe(true);

    engine2.trackEvent({ type: 'npc_conversation', npcId: 'smith1' });
    expect(obj2Restored.completed).toBe(true);
    expect(completedQuests).toEqual(['mining-quest']);
  });
});
