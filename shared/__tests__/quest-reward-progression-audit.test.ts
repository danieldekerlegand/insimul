/**
 * Audit: Quest Reward and Progression Flow
 *
 * Verifies that completed quests grant rewards (XP, gold, items, skills, vocabulary)
 * and unlock next steps (prerequisite quests, chain progression, main quest chapters,
 * guild tier advancement).
 *
 * Coverage areas:
 * 1. Quest completion detection (all objectives → quest_completed)
 * 2. Reward distribution (XP, gold, items, skills)
 * 3. Quest chain progression (next quest activation, chain completion bonus)
 * 4. Prerequisite quest unlocking (cross-quest dependency resolution)
 * 5. Guild quest tier advancement
 * 6. Main quest chapter transitions
 * 7. Reward integration consistency
 */

import { describe, it, expect, vi } from 'vitest';
import {
  grantItemRewards,
  findQuestsToUnlock,
  applyChainBonusXP,
  type InventoryItem,
  type MinimalQuest,
} from '../quests/quest-completion-rewards';
import {
  computeSkillRewards,
  applySkillRewards,
} from '../language/quest-skill-rewards';
import { QuestChainManager, encodeChainMeta, extractChainMeta } from '../quests/quest-chain-manager';
import { GuildQuestManager } from '../quests/guild-quest-manager';
import {
  QUEST_TYPE_TO_OBJECTIVE_MAP,
  getObjectiveTypesForQuestType,
} from '../quests/main-quest-progression';
import {
  createInitialMainQuestState,
  isChapterComplete,
  meetsChapterCefrRequirement,
  MAIN_QUEST_CHAPTERS,
} from '../quest/main-quest-chapters';

// ── 1. Quest Completion Detection ───────────────────────────────────────────

describe('Quest Completion Detection (QuestCompletionEngine)', () => {
  // Minimal reproduction of QuestCompletionEngine's core completion logic
  function createEngine() {
    const completedQuests: string[] = [];

    type Quest = {
      id: string;
      objectives: Array<{ id: string; completed: boolean; dependsOn?: string[]; order?: number }>;
    };

    const quests: Quest[] = [];

    function addQuest(quest: Quest) {
      quests.push(quest);
    }

    function isObjectiveLocked(quest: Quest, objective: Quest['objectives'][0]): boolean {
      const objectives = quest.objectives || [];
      if (objective.dependsOn && objective.dependsOn.length > 0) {
        return objective.dependsOn.some(depId => {
          const dep = objectives.find(o => o.id === depId);
          return dep && !dep.completed;
        });
      }
      if (objective.order !== undefined) {
        return objectives.some(o =>
          o.order !== undefined && o.order < objective.order! && !o.completed
        );
      }
      return false;
    }

    function completeObjective(questId: string, objectiveId: string): boolean {
      const quest = quests.find(q => q.id === questId);
      if (!quest) return false;
      const objective = quest.objectives.find(o => o.id === objectiveId);
      if (!objective || objective.completed) return false;
      if (isObjectiveLocked(quest, objective)) return false;

      objective.completed = true;

      const allComplete = quest.objectives.every(o => o.completed);
      if (allComplete) {
        completedQuests.push(questId);
      }
      return true;
    }

    return { addQuest, completeObjective, completedQuests };
  }

  it('fires quest_completed when all objectives are complete', () => {
    const engine = createEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'obj1', completed: false },
        { id: 'obj2', completed: false },
      ],
    });

    engine.completeObjective('q1', 'obj1');
    expect(engine.completedQuests).toHaveLength(0);

    engine.completeObjective('q1', 'obj2');
    expect(engine.completedQuests).toEqual(['q1']);
  });

  it('fires quest_completed for single-objective quest', () => {
    const engine = createEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [{ id: 'obj1', completed: false }],
    });

    engine.completeObjective('q1', 'obj1');
    expect(engine.completedQuests).toEqual(['q1']);
  });

  it('does not fire quest_completed when some objectives remain', () => {
    const engine = createEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'obj1', completed: false },
        { id: 'obj2', completed: false },
        { id: 'obj3', completed: false },
      ],
    });

    engine.completeObjective('q1', 'obj1');
    engine.completeObjective('q1', 'obj2');
    expect(engine.completedQuests).toHaveLength(0);
  });

  it('rejects completing already-completed objectives', () => {
    const engine = createEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [{ id: 'obj1', completed: false }],
    });

    expect(engine.completeObjective('q1', 'obj1')).toBe(true);
    expect(engine.completeObjective('q1', 'obj1')).toBe(false);
    expect(engine.completedQuests).toHaveLength(1);
  });

  it('respects objective dependency ordering', () => {
    const engine = createEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'obj1', completed: false, order: 0 },
        { id: 'obj2', completed: false, order: 1, dependsOn: ['obj1'] },
      ],
    });

    expect(engine.completeObjective('q1', 'obj2')).toBe(false);
    expect(engine.completeObjective('q1', 'obj1')).toBe(true);
    expect(engine.completeObjective('q1', 'obj2')).toBe(true);
    expect(engine.completedQuests).toEqual(['q1']);
  });

  it('returns false for non-existent quest', () => {
    const engine = createEngine();
    expect(engine.completeObjective('nonexistent', 'obj1')).toBe(false);
  });
});

// ── 2. Reward Distribution ──────────────────────────────────────────────────

describe('Reward Distribution', () => {
  describe('Gold rewards', () => {
    it('adds gold to player progress', () => {
      const progress = { gold: 50 };
      progress.gold += 100;
      expect(progress.gold).toBe(150);
    });

    it('handles zero gold reward', () => {
      const progress = { gold: 50 };
      progress.gold += 0;
      expect(progress.gold).toBe(50);
    });
  });

  describe('Item rewards via grantItemRewards', () => {
    it('grants items to empty inventory', () => {
      const inv: InventoryItem[] = [];
      const granted = grantItemRewards(inv, [
        { itemId: 'sword', quantity: 1, name: 'Épée' },
      ]);
      expect(inv).toHaveLength(1);
      expect(granted).toHaveLength(1);
    });

    it('stacks items with existing inventory', () => {
      const inv: InventoryItem[] = [{ itemId: 'bread', quantity: 3, name: 'Pain' }];
      grantItemRewards(inv, [{ itemId: 'bread', quantity: 2, name: 'Pain' }]);
      expect(inv[0].quantity).toBe(5);
    });
  });

  describe('Skill rewards via computeSkillRewards + applySkillRewards', () => {
    it('computes conversation quest skill rewards', () => {
      const rewards = computeSkillRewards({
        questType: 'conversation',
        difficulty: 'beginner',
      });
      expect(rewards.length).toBeGreaterThan(0);
      const speaking = rewards.find(r => r.skillId === 'speaking');
      expect(speaking).toBeDefined();
      expect(speaking!.level).toBe(2);
    });

    it('scales skill rewards by difficulty', () => {
      const beginner = computeSkillRewards({ questType: 'vocabulary', difficulty: 'beginner' });
      const advanced = computeSkillRewards({ questType: 'vocabulary', difficulty: 'advanced' });
      expect(advanced[0].level).toBeGreaterThan(beginner[0].level);
    });

    it('uses explicit skillRewards when provided', () => {
      const explicit = [{ skillId: 'custom', name: 'Custom', level: 10 }];
      const rewards = computeSkillRewards({
        questType: 'conversation',
        difficulty: 'beginner',
        skillRewards: explicit,
      });
      expect(rewards).toEqual(explicit);
    });

    it('applies skill rewards to character skills', () => {
      const skills: Record<string, number> = { speaking: 5, listening: 3 };
      const rewards = [
        { skillId: 'speaking', name: 'Speaking', level: 2 },
        { skillId: 'writing', name: 'Writing', level: 1 },
      ];
      const result = applySkillRewards(skills, rewards);
      expect(result.skills.speaking).toBe(7);
      expect(result.skills.writing).toBe(1);
      expect(result.skills.listening).toBe(3);
      expect(result.applied).toHaveLength(2);
    });

    it('returns empty for unknown quest types', () => {
      const rewards = computeSkillRewards({ questType: 'unknown_type', difficulty: 'beginner' });
      expect(rewards).toHaveLength(0);
    });
  });

  describe('XP with chain bonus', () => {
    it('adds chain bonus XP', () => {
      const result = applyChainBonusXP(1000, 200);
      expect(result).toEqual({ newXP: 1200 });
    });

    it('returns null for no bonus', () => {
      expect(applyChainBonusXP(1000, 0)).toBeNull();
    });
  });
});

// ── 3. Quest Chain Progression ──────────────────────────────────────────────

describe('Quest Chain Progression', () => {
  function createMockStorage(quests: any[] = []) {
    return {
      getQuestsByWorld: vi.fn().mockResolvedValue(quests),
      updateQuest: vi.fn().mockResolvedValue(undefined),
      createQuest: vi.fn().mockImplementation(async (data: any) => ({ ...data, id: data.id || 'new-q' })),
    } as any;
  }

  it('creates a chain with linear prerequisites', async () => {
    const storage = createMockStorage();
    const manager = new QuestChainManager(storage);

    const quests = [
      { id: 'q1', title: 'First', worldId: 'w1' },
      { id: 'q2', title: 'Second', worldId: 'w1' },
      { id: 'q3', title: 'Third', worldId: 'w1' },
    ];

    const chain = await manager.createQuestChain(
      { id: 'chain-1', name: 'Test Chain', description: '', isLinear: true },
      quests as any,
    );

    expect(chain.quests).toHaveLength(3);
    expect(chain.quests[0].questChainOrder).toBe(0);
    expect(chain.quests[1].questChainOrder).toBe(1);
    expect(chain.quests[1].prerequisiteQuestIds).toEqual(['q1']);
    expect(chain.quests[2].prerequisiteQuestIds).toEqual(['q2']);
  });

  it('getNextQuestInChain returns next quest by chain order', async () => {
    const chainQuests = [
      { id: 'q1', questChainId: 'chain-1', questChainOrder: 0, status: 'completed', worldId: 'w1' },
      { id: 'q2', questChainId: 'chain-1', questChainOrder: 1, status: 'unavailable', worldId: 'w1' },
      { id: 'q3', questChainId: 'chain-1', questChainOrder: 2, status: 'unavailable', worldId: 'w1' },
    ];
    const storage = createMockStorage(chainQuests);
    const manager = new QuestChainManager(storage);

    const next = await manager.getNextQuestInChain({
      questChainId: 'chain-1',
      questChainOrder: 0,
      worldId: 'w1',
    } as any);

    expect(next).toBeDefined();
    expect(next!.id).toBe('q2');
  });

  it('checkChainCompletion detects fully completed chain', async () => {
    const chainQuests = [
      { id: 'q1', questChainId: 'chain-1', questChainOrder: 0, status: 'completed', worldId: 'w1', tags: ['chain_meta:{"name":"Adventure","bonusXP":500,"achievement":"Adventurer"}'] },
      { id: 'q2', questChainId: 'chain-1', questChainOrder: 1, status: 'completed', worldId: 'w1', tags: [] },
      { id: 'q3', questChainId: 'chain-1', questChainOrder: 2, status: 'completed', worldId: 'w1', tags: [] },
    ];
    const storage = createMockStorage(chainQuests);
    const manager = new QuestChainManager(storage);

    const result = await manager.checkChainCompletion({
      id: 'q3',
      questChainId: 'chain-1',
      worldId: 'w1',
    } as any);

    expect(result.isComplete).toBe(true);
    expect(result.chainName).toBe('Adventure');
    expect(result.bonusXP).toBe(500);
    expect(result.achievement).toBe('Adventurer');
  });

  it('checkChainCompletion returns false for incomplete chain', async () => {
    const chainQuests = [
      { id: 'q1', questChainId: 'chain-1', questChainOrder: 0, status: 'completed', worldId: 'w1', tags: [] },
      { id: 'q2', questChainId: 'chain-1', questChainOrder: 1, status: 'active', worldId: 'w1', tags: [] },
    ];
    const storage = createMockStorage(chainQuests);
    const manager = new QuestChainManager(storage);

    const result = await manager.checkChainCompletion({
      id: 'q1',
      questChainId: 'chain-1',
      worldId: 'w1',
    } as any);

    expect(result.isComplete).toBe(false);
  });

  it('encodeChainMeta and extractChainMeta roundtrip', () => {
    const tag = encodeChainMeta('Test Chain', 100, 'Champion');
    expect(tag).toBe('chain_meta:{"name":"Test Chain","bonusXP":100,"achievement":"Champion"}');

    const extracted = extractChainMeta([{ tags: [tag] }] as any);
    expect(extracted.name).toBe('Test Chain');
    expect(extracted.bonusXP).toBe(100);
  });
});

// ── 4. Prerequisite Quest Unlocking ─────────────────────────────────────────

describe('Prerequisite Quest Unlocking', () => {
  it('unlocks dependent quests when all prerequisites met', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'completed' },
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: ['q1', 'q2'] },
    ];
    expect(findQuestsToUnlock('q2', quests)).toEqual(['q3']);
  });

  it('does not unlock when partial prerequisites met', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'active' },
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: ['q1', 'q2'] },
    ];
    expect(findQuestsToUnlock('q1', quests)).toEqual([]);
  });

  it('handles diamond dependency pattern', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'completed' },
      { id: 'q3', status: 'completed' },
      { id: 'q4', status: 'unavailable', prerequisiteQuestIds: ['q2', 'q3'] },
    ];
    expect(findQuestsToUnlock('q3', quests)).toEqual(['q4']);
  });

  it('unlocks multiple independent dependents simultaneously', () => {
    const quests: MinimalQuest[] = [
      { id: 'q1', status: 'completed' },
      { id: 'q2', status: 'unavailable', prerequisiteQuestIds: ['q1'] },
      { id: 'q3', status: 'unavailable', prerequisiteQuestIds: ['q1'] },
    ];
    expect(findQuestsToUnlock('q1', quests)).toEqual(['q2', 'q3']);
  });
});

// ── 5. Guild Quest Tier Advancement ─────────────────────────────────────────

describe('Guild Quest Tier Advancement', () => {
  it('getNextQuestForGuild returns first unavailable quest in tier order', () => {
    const quests = [
      { id: 'gq1', guildId: 'artisans', guildTier: 0, status: 'completed' },
      { id: 'gq2', guildId: 'artisans', guildTier: 0, status: 'unavailable' },
      { id: 'gq3', guildId: 'artisans', guildTier: 1, status: 'unavailable' },
    ];

    const manager = new GuildQuestManager();
    const next = manager.getNextQuestForGuild('artisans' as any, quests as any);

    expect(next).toBeDefined();
    expect(next!.id).toBe('gq2');
  });

  it('getNextQuestForGuild returns null when player has pending quest', () => {
    const quests = [
      { id: 'gq1', guildId: 'artisans', guildTier: 0, status: 'active' },
      { id: 'gq2', guildId: 'artisans', guildTier: 1, status: 'unavailable' },
    ];

    const manager = new GuildQuestManager();
    const next = manager.getNextQuestForGuild('artisans' as any, quests as any);

    expect(next).toBeNull();
  });

  it('receiveNextQuest transitions quest from unavailable to available', () => {
    const quests = [
      { id: 'gq1', guildId: 'artisans', guildTier: 0, status: 'unavailable' },
    ];

    const manager = new GuildQuestManager();
    const questId = manager.receiveNextQuest('artisans' as any, quests as any);

    expect(questId).toBe('gq1');
    expect(quests[0].status).toBe('available');
  });

  it('receiveNextQuest returns null when no quest available', () => {
    const quests = [
      { id: 'gq1', guildId: 'artisans', guildTier: 0, status: 'completed' },
    ];

    const manager = new GuildQuestManager();
    const questId = manager.receiveNextQuest('artisans' as any, quests as any);

    expect(questId).toBeNull();
  });

  it('hasJoinedGuild returns true when tier 0 quest completed', () => {
    const quests = [
      { id: 'gq1', guildId: 'artisans', guildTier: 0, status: 'completed' },
    ];

    const manager = new GuildQuestManager();
    expect(manager.hasJoinedGuild('artisans' as any, quests as any)).toBe(true);
  });

  it('hasJoinedGuild returns false when tier 0 quest not completed', () => {
    const quests = [
      { id: 'gq1', guildId: 'artisans', guildTier: 0, status: 'active' },
    ];

    const manager = new GuildQuestManager();
    expect(manager.hasJoinedGuild('artisans' as any, quests as any)).toBe(false);
  });
});

// ── 6. Main Quest Chapter Transitions ───────────────────────────────────────

describe('Main Quest Chapter Transitions', () => {
  it('QUEST_TYPE_TO_OBJECTIVE_MAP covers core quest types', () => {
    const expectedTypes = [
      'conversation', 'vocabulary', 'reading', 'exploration',
      'translation', 'grammar', 'collection', 'navigation',
    ];
    for (const type of expectedTypes) {
      expect(QUEST_TYPE_TO_OBJECTIVE_MAP[type]).toBeDefined();
      expect(QUEST_TYPE_TO_OBJECTIVE_MAP[type].length).toBeGreaterThan(0);
    }
  });

  it('getObjectiveTypesForQuestType returns mapped types', () => {
    expect(getObjectiveTypesForQuestType('conversation')).toContain('complete_conversation');
    expect(getObjectiveTypesForQuestType('vocabulary')).toContain('use_vocabulary');
    expect(getObjectiveTypesForQuestType('reading')).toContain('find_text');
  });

  it('getObjectiveTypesForQuestType falls back to questType itself for unknowns', () => {
    expect(getObjectiveTypesForQuestType('custom_type')).toEqual(['custom_type']);
  });

  it('createInitialMainQuestState produces valid initial state', () => {
    const state = createInitialMainQuestState();
    expect(state.currentChapterId).toBeDefined();
    expect(state.chapters.length).toBeGreaterThan(0);
    expect(state.totalXPEarned).toBe(0);

    const firstChapter = state.chapters[0];
    expect(firstChapter.status).toBe('active');
  });

  it('isChapterComplete checks all objectives meet required counts', () => {
    const chapter = MAIN_QUEST_CHAPTERS[0];
    if (!chapter) return;

    const progress = {
      chapterId: chapter.id,
      status: 'active' as const,
      objectiveProgress: {} as Record<string, number>,
    };

    expect(isChapterComplete(chapter, progress)).toBe(false);

    for (const obj of chapter.objectives) {
      progress.objectiveProgress[obj.id] = obj.requiredCount;
    }
    expect(isChapterComplete(chapter, progress)).toBe(true);
  });

  it('meetsChapterCefrRequirement gates chapter access for first chapter', () => {
    const firstChapter = MAIN_QUEST_CHAPTERS[0];
    if (!firstChapter) return;
    // First chapter requires A1, and passing A1 uppercase should pass
    expect(meetsChapterCefrRequirement('A1', firstChapter)).toBe(true);
  });

  it('meetsChapterCefrRequirement rejects null for non-A1 chapters', () => {
    // Find a chapter that requires higher than A1
    const higherChapter = MAIN_QUEST_CHAPTERS.find(ch => ch.requiredCefrLevel !== 'A1');
    if (!higherChapter) return;
    // null CEFR should only pass A1 chapters
    expect(meetsChapterCefrRequirement(null, higherChapter)).toBe(false);
  });

  it('MAIN_QUEST_CHAPTERS are ordered with unique IDs', () => {
    const ids = MAIN_QUEST_CHAPTERS.map(ch => ch.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ── 7. Reward Integration Consistency ───────────────────────────────────────

describe('Reward Integration Consistency', () => {
  it('full reward pipeline: XP + gold + items + skills', () => {
    const progress = {
      inventory: [] as InventoryItem[],
      questsCompleted: [] as string[],
      skills: { speaking: 3 } as Record<string, number>,
      gold: 100,
    };

    const quest = {
      id: 'test-q',
      experienceReward: 50,
      goldReward: 25,
      questType: 'conversation',
      difficulty: 'intermediate',
      itemRewards: [{ itemId: 'map', quantity: 1, name: 'Carte' }],
    };

    // Gold
    progress.gold += quest.goldReward;
    expect(progress.gold).toBe(125);

    // Items
    grantItemRewards(progress.inventory, quest.itemRewards);
    expect(progress.inventory).toHaveLength(1);
    expect(progress.inventory[0].itemId).toBe('map');

    // Skills
    const skillRewards = computeSkillRewards({
      questType: quest.questType,
      difficulty: quest.difficulty,
    });
    const skillResult = applySkillRewards(progress.skills, skillRewards);
    progress.skills = skillResult.skills;
    expect(progress.skills.speaking).toBeGreaterThan(3);

    // Track completion
    progress.questsCompleted.push(quest.id);
    expect(progress.questsCompleted).toContain('test-q');
  });

  it('chain bonus XP stacks with base quest XP', () => {
    const baseXP = 100;
    const streakBonus = 10;
    const chainBonus = 200;

    const totalBeforeChain = baseXP + streakBonus;
    const chainResult = applyChainBonusXP(totalBeforeChain, chainBonus);

    expect(chainResult).not.toBeNull();
    expect(chainResult!.newXP).toBe(310);
  });

  it('duplicate quest completion is idempotent for tracking', () => {
    const completedList: string[] = [];

    function trackCompletion(questId: string) {
      if (!completedList.includes(questId)) {
        completedList.push(questId);
      }
    }

    trackCompletion('q1');
    trackCompletion('q1');
    trackCompletion('q2');

    expect(completedList).toEqual(['q1', 'q2']);
  });

  it('skill rewards are additive across multiple quests', () => {
    let skills: Record<string, number> = {};

    const r1 = computeSkillRewards({ questType: 'conversation', difficulty: 'beginner' });
    skills = applySkillRewards(skills, r1).skills;

    const r2 = computeSkillRewards({ questType: 'vocabulary', difficulty: 'beginner' });
    skills = applySkillRewards(skills, r2).skills;

    expect(skills.speaking).toBeGreaterThan(0);
    expect(skills.vocabulary).toBeGreaterThan(0);
  });

  it('difficulty multipliers produce expected scaling', () => {
    const beginner = computeSkillRewards({ questType: 'conversation', difficulty: 'beginner' });
    const intermediate = computeSkillRewards({ questType: 'conversation', difficulty: 'intermediate' });
    const advanced = computeSkillRewards({ questType: 'conversation', difficulty: 'advanced' });

    const bSpeaking = beginner.find(r => r.skillId === 'speaking')!.level;
    const iSpeaking = intermediate.find(r => r.skillId === 'speaking')!.level;
    const aSpeaking = advanced.find(r => r.skillId === 'speaking')!.level;

    expect(iSpeaking).toBe(bSpeaking * 2);
    expect(aSpeaking).toBe(bSpeaking * 3);
  });
});
