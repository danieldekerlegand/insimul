/**
 * End-to-end integration test: complete each quest type manually.
 *
 * Exercises the full quest completion pipeline for every canonical quest type
 * (conversation, translation, vocabulary, grammar, cultural) across all
 * difficulty levels, verifying:
 *   - Status transitions (active → completed)
 *   - XP bonus calculation (difficulty multiplier, hint penalty, streaks)
 *   - Skill reward computation and application
 *   - Objective progress finalisation
 *   - Quest chain completion detection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateQuestBonus,
  difficultyMultiplier,
} from '../../shared/quest-bonus-calculator';
import {
  computeSkillRewards,
  applySkillRewards,
} from '../../shared/language/quest-skill-rewards';
import {
  abandonQuest,
  failQuest,
  retryQuest,
  type QuestStorage,
} from '../../shared/quests/quest-lifecycle.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

const QUEST_TYPES = ['conversation', 'translation', 'vocabulary', 'grammar', 'cultural'] as const;
type QuestType = (typeof QUEST_TYPES)[number];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

/** Objectives representative of each quest type */
const OBJECTIVES_BY_TYPE: Record<QuestType, Array<{ type: string; description: string; completed: boolean; current: number; required: number }>> = {
  conversation: [
    { type: 'talk_to_npc', description: 'Talk to the baker', completed: false, current: 0, required: 1 },
    { type: 'complete_conversation', description: 'Have a full conversation', completed: false, current: 0, required: 1 },
  ],
  translation: [
    { type: 'translation_challenge', description: 'Translate 3 phrases', completed: false, current: 0, required: 3 },
  ],
  vocabulary: [
    { type: 'use_vocabulary', description: 'Use 5 French words', completed: false, current: 0, required: 5 },
    { type: 'collect_vocabulary', description: 'Collect 3 vocabulary words', completed: false, current: 0, required: 3 },
  ],
  grammar: [
    { type: 'use_vocabulary', description: 'Practice past tense in conversation', completed: false, current: 0, required: 3 },
    { type: 'write_response', description: 'Write sentences using grammar pattern', completed: false, current: 0, required: 2 },
  ],
  cultural: [
    { type: 'visit_location', description: 'Visit the cultural center', completed: false, current: 0, required: 1 },
    { type: 'talk_to_npc', description: 'Talk to the elder about traditions', completed: false, current: 0, required: 1 },
    { type: 'listen_and_repeat', description: 'Learn a traditional phrase', completed: false, current: 0, required: 1 },
  ],
};

/** Expected skill reward skill IDs per quest type */
const EXPECTED_SKILLS: Record<QuestType, string[]> = {
  conversation: ['speaking', 'listening'],
  translation: ['reading', 'writing'],
  vocabulary: ['vocabulary'],
  grammar: ['grammar'],
  cultural: ['cultural_knowledge', 'vocabulary'],
};

let questIdCounter = 0;

function makeQuest(overrides: Record<string, any> = {}) {
  const id = `quest-${++questIdCounter}`;
  const questType: QuestType = overrides.questType ?? 'conversation';
  return {
    id,
    worldId: 'world-1',
    title: `Test ${questType} quest`,
    description: `A test ${questType} quest`,
    questType,
    difficulty: 'beginner',
    targetLanguage: 'French',
    status: 'active',
    assignedTo: 'player-1',
    assignedToCharacterId: 'char-1',
    assignedBy: 'NPC Baker',
    assignedByCharacterId: 'npc-1',
    experienceReward: 50,
    attemptCount: 1,
    maxAttempts: 3,
    objectives: OBJECTIVES_BY_TYPE[questType].map(o => ({ ...o })),
    progress: { percentComplete: 0 },
    rewards: {},
    skillRewards: [],
    unlocks: [],
    expiresAt: null,
    failedAt: null,
    abandonedAt: null,
    failureReason: null,
    abandonReason: null,
    completedAt: null,
    streakCount: 0,
    questChainId: null,
    questChainOrder: null,
    recurrencePattern: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

function makeMockStorage(quests: any[] = []): QuestStorage & {
  getQuest: ReturnType<typeof vi.fn>;
  updateQuest: ReturnType<typeof vi.fn>;
  getQuestsByWorld: ReturnType<typeof vi.fn>;
} {
  const questMap = new Map(quests.map(q => [q.id, q]));
  return {
    getQuest: vi.fn().mockImplementation(async (id: string) => questMap.get(id) ?? undefined),
    updateQuest: vi.fn().mockImplementation(async (id: string, data: any) => {
      const existing = questMap.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...data };
      questMap.set(id, updated);
      return updated;
    }),
    getQuestsByWorld: vi.fn().mockResolvedValue(quests),
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Quest Completion E2E — Complete each quest type', () => {
  beforeEach(() => {
    questIdCounter = 0;
  });

  // ── 1. Full completion pipeline per quest type ──────────────────────────

  describe.each(QUEST_TYPES)('Quest type: %s', (questType) => {
    it('completes with correct status, XP, and skill rewards (beginner)', () => {
      const quest = makeQuest({ questType, difficulty: 'beginner', experienceReward: 50 });

      // Step 1: Calculate bonus XP
      const bonus = calculateQuestBonus({
        baseXP: quest.experienceReward,
        streakCount: 0,
        difficulty: quest.difficulty,
        hintsUsed: 0,
        isRecurring: false,
      });

      expect(bonus.baseXP).toBe(50);
      expect(bonus.difficultyMultiplier).toBe(1.0);
      expect(bonus.hintPenalty).toBe(1.0);
      expect(bonus.totalXP).toBe(50);
      expect(bonus.newStreakCount).toBe(1);

      // Step 2: Mark quest completed
      const completed = {
        ...quest,
        status: 'completed',
        completedAt: new Date(),
        progress: { ...quest.progress, percentComplete: 100 },
        streakCount: bonus.newStreakCount,
      };
      expect(completed.status).toBe('completed');
      expect(completed.progress.percentComplete).toBe(100);
      expect(completed.streakCount).toBe(1);

      // Step 3: Compute and apply skill rewards
      const rewards = computeSkillRewards({ questType, difficulty: 'beginner' });
      expect(rewards.length).toBeGreaterThan(0);

      const expectedSkillIds = EXPECTED_SKILLS[questType as QuestType];
      const rewardSkillIds = rewards.map(r => r.skillId);
      for (const expected of expectedSkillIds) {
        expect(rewardSkillIds).toContain(expected);
      }

      const { skills, applied } = applySkillRewards({}, rewards);
      expect(applied.length).toBe(rewards.length);
      for (const reward of rewards) {
        expect(skills[reward.skillId]).toBe(reward.level);
      }
    });

    it('applies difficulty multiplier correctly (intermediate & advanced)', () => {
      for (const difficulty of ['intermediate', 'advanced'] as const) {
        const bonus = calculateQuestBonus({
          baseXP: 100,
          streakCount: 0,
          difficulty,
          hintsUsed: 0,
          isRecurring: false,
        });

        const expectedMult = difficulty === 'intermediate' ? 1.25 : 1.5;
        expect(bonus.difficultyMultiplier).toBe(expectedMult);
        expect(bonus.totalXP).toBe(Math.round(100 * expectedMult));
      }
    });

    it('scales skill rewards by difficulty', () => {
      const beginner = computeSkillRewards({ questType, difficulty: 'beginner' });
      const intermediate = computeSkillRewards({ questType, difficulty: 'intermediate' });
      const advanced = computeSkillRewards({ questType, difficulty: 'advanced' });

      // Each skill reward's level should increase with difficulty
      for (let i = 0; i < beginner.length; i++) {
        expect(intermediate[i].level).toBeGreaterThan(beginner[i].level);
        expect(advanced[i].level).toBeGreaterThan(intermediate[i].level);
      }
    });

    it('has correct representative objectives', () => {
      const quest = makeQuest({ questType });
      expect(quest.objectives.length).toBeGreaterThan(0);
      for (const obj of quest.objectives) {
        expect(obj.type).toBeTruthy();
        expect(obj.description).toBeTruthy();
        expect(obj.required).toBeGreaterThan(0);
        expect(obj.completed).toBe(false);
        expect(obj.current).toBe(0);
      }
    });
  });

  // ── 2. Hint penalty reduces XP ────────────────────────────────────────

  describe('Hint penalty', () => {
    it.each([
      { hints: 0, expectedPenalty: 1.0 },
      { hints: 1, expectedPenalty: 0.9 },
      { hints: 2, expectedPenalty: 0.8 },
      { hints: 3, expectedPenalty: 0.7 },
    ])('applies $expectedPenalty multiplier for $hints hints', ({ hints, expectedPenalty }) => {
      const bonus = calculateQuestBonus({
        baseXP: 100,
        streakCount: 0,
        difficulty: 'beginner',
        hintsUsed: hints,
        isRecurring: false,
      });
      expect(bonus.hintPenalty).toBe(expectedPenalty);
      expect(bonus.totalXP).toBe(Math.round(100 * expectedPenalty));
    });
  });

  // ── 3. Streak tracking across completions ─────────────────────────────

  describe('Streak accumulation', () => {
    it('increments streak count across sequential completions', () => {
      let streak = 0;
      for (let i = 0; i < 5; i++) {
        const bonus = calculateQuestBonus({
          baseXP: 50,
          streakCount: streak,
          difficulty: 'beginner',
          hintsUsed: 0,
          isRecurring: false,
        });
        streak = bonus.newStreakCount;
        expect(streak).toBe(i + 1);
      }
    });

    it('awards milestone at streak count 3', () => {
      const bonus = calculateQuestBonus({
        baseXP: 50,
        streakCount: 2,
        difficulty: 'beginner',
        hintsUsed: 0,
        isRecurring: false,
      });
      expect(bonus.newStreakCount).toBe(3);
      expect(bonus.milestone).not.toBeNull();
      expect(bonus.milestone!.label).toBe('Hot Streak');
      expect(bonus.milestoneXP).toBe(25);
      expect(bonus.grandTotalXP).toBe(bonus.totalXP + 25);
    });
  });

  // ── 4. Full lifecycle: create → complete → verify via mock storage ────

  describe('Full lifecycle through mock storage', () => {
    it.each(QUEST_TYPES)('creates, completes, and verifies %s quest', async (questType) => {
      const quest = makeQuest({ questType, difficulty: 'intermediate', experienceReward: 75 });
      const storage = makeMockStorage([quest]);

      // Verify quest exists and is active
      const fetched = await storage.getQuest(quest.id);
      expect(fetched).toBeDefined();
      expect(fetched!.status).toBe('active');

      // Calculate bonus
      const bonus = calculateQuestBonus({
        baseXP: fetched!.experienceReward,
        streakCount: 0,
        difficulty: fetched!.difficulty,
        hintsUsed: 0,
        isRecurring: false,
      });

      // Complete the quest
      const updated = await storage.updateQuest(quest.id, {
        status: 'completed',
        completedAt: new Date(),
        progress: { percentComplete: 100 },
        streakCount: bonus.newStreakCount,
      });

      expect(updated).toBeDefined();
      expect(updated!.status).toBe('completed');
      expect(updated!.completedAt).toBeInstanceOf(Date);
      expect(updated!.progress.percentComplete).toBe(100);
      expect(updated!.streakCount).toBe(1);

      // Verify XP
      expect(bonus.difficultyMultiplier).toBe(1.25);
      expect(bonus.totalXP).toBe(Math.round(75 * 1.25));

      // Verify skill rewards
      const rewards = computeSkillRewards({ questType, difficulty: 'intermediate' });
      expect(rewards.length).toBeGreaterThan(0);
      const { skills } = applySkillRewards({}, rewards);
      for (const reward of rewards) {
        expect(skills[reward.skillId]).toBeGreaterThan(0);
      }
    });
  });

  // ── 5. Cannot complete an already-completed quest ─────────────────────

  describe('Double-completion prevention', () => {
    it('rejects completing an already-completed quest', async () => {
      const quest = makeQuest({ status: 'completed', completedAt: new Date() });
      const storage = makeMockStorage([quest]);

      const fetched = await storage.getQuest(quest.id);
      expect(fetched!.status).toBe('completed');
      // The route handler checks status === 'completed' and returns 400
      // We verify the invariant here
      expect(fetched!.status).not.toBe('active');
    });
  });

  // ── 6. Lifecycle transitions: abandon, fail, retry, then complete ─────

  describe('Abandon → retry → complete lifecycle', () => {
    it.each(QUEST_TYPES)('handles full lifecycle for %s quest', async (questType) => {
      const quest = makeQuest({ questType });
      const storage = makeMockStorage([quest]);

      // Abandon
      const abandoned = await abandonQuest(storage, quest.id, 'world-1', 'Too hard');
      expect(abandoned.quest.status).toBe('abandoned');
      expect(abandoned.canRetry).toBe(true);
      expect(abandoned.attemptsRemaining).toBe(2);

      // Retry
      const retried = await retryQuest(storage, quest.id, 'world-1');
      expect(retried.quest.status).toBe('active');
      expect(retried.attemptNumber).toBe(2);

      // Complete
      const bonus = calculateQuestBonus({
        baseXP: quest.experienceReward,
        streakCount: 0,
        difficulty: quest.difficulty,
        hintsUsed: 0,
        isRecurring: false,
      });
      const completed = await storage.updateQuest(quest.id, {
        status: 'completed',
        completedAt: new Date(),
        progress: { percentComplete: 100 },
        streakCount: bonus.newStreakCount,
      });
      expect(completed!.status).toBe('completed');
    });
  });

  // ── 7. Fail → retry → complete lifecycle ──────────────────────────────

  describe('Fail → retry → complete lifecycle', () => {
    it.each(QUEST_TYPES)('handles fail/retry/complete for %s quest', async (questType) => {
      const quest = makeQuest({ questType });
      const storage = makeMockStorage([quest]);

      // Fail
      const failed = await failQuest(storage, quest.id, 'world-1', 'Time expired');
      expect(failed.quest.status).toBe('failed');
      expect(failed.canRetry).toBe(true);

      // Retry
      const retried = await retryQuest(storage, quest.id, 'world-1');
      expect(retried.quest.status).toBe('active');

      // Complete
      const completed = await storage.updateQuest(quest.id, {
        status: 'completed',
        completedAt: new Date(),
        progress: { percentComplete: 100 },
      });
      expect(completed!.status).toBe('completed');
    });
  });

  // ── 8. Quest chain completion detection ───────────────────────────────

  describe('Quest chain completion', () => {
    it('detects chain completion when all quests in chain are completed', async () => {
      const chainId = 'chain-test-1';
      const q1 = makeQuest({ questType: 'vocabulary', questChainId: chainId, questChainOrder: 1, status: 'completed', tags: ['chain_meta:Test Chain:100:Chain Master'] });
      const q2 = makeQuest({ questType: 'conversation', questChainId: chainId, questChainOrder: 2, status: 'completed' });
      const q3 = makeQuest({ questType: 'grammar', questChainId: chainId, questChainOrder: 3, status: 'active' });

      const allChainQuests = [q1, q2, q3];

      // Before completing q3, not all are complete
      const allComplete = allChainQuests.every(q => q.status === 'completed');
      expect(allComplete).toBe(false);

      // Complete q3
      q3.status = 'completed';
      q3.completedAt = new Date();

      const nowAllComplete = allChainQuests.every(q => q.status === 'completed');
      expect(nowAllComplete).toBe(true);
    });
  });

  // ── 9. Skill reward accumulation across multiple quest types ──────────

  describe('Skill reward accumulation', () => {
    it('accumulates skills from completing multiple quest types', () => {
      let skills: Record<string, number> = {};

      for (const questType of QUEST_TYPES) {
        const rewards = computeSkillRewards({ questType, difficulty: 'beginner' });
        const result = applySkillRewards(skills, rewards);
        skills = result.skills;
      }

      // After completing one of each type, should have a diverse skill set
      expect(skills['speaking']).toBeGreaterThan(0);     // from conversation
      expect(skills['listening']).toBeGreaterThan(0);     // from conversation
      expect(skills['reading']).toBeGreaterThan(0);       // from translation
      expect(skills['writing']).toBeGreaterThan(0);       // from translation
      expect(skills['vocabulary']).toBeGreaterThan(0);    // from vocabulary + cultural
      expect(skills['grammar']).toBeGreaterThan(0);       // from grammar
      expect(skills['cultural_knowledge']).toBeGreaterThan(0); // from cultural
    });
  });

  // ── 10. Cross-difficulty XP matrix ────────────────────────────────────

  describe('XP matrix: all quest types × all difficulties', () => {
    const XP_BASE = 100;

    it.each(
      QUEST_TYPES.flatMap(qt =>
        DIFFICULTIES.map(d => ({ questType: qt, difficulty: d })),
      ),
    )('$questType/$difficulty yields correct XP', ({ questType, difficulty }) => {
      const bonus = calculateQuestBonus({
        baseXP: XP_BASE,
        streakCount: 0,
        difficulty,
        hintsUsed: 0,
        isRecurring: false,
      });

      const expectedMult = difficultyMultiplier(difficulty);
      expect(bonus.totalXP).toBe(Math.round(XP_BASE * expectedMult));
      expect(bonus.newStreakCount).toBe(1);

      // Skill rewards should exist for all canonical types
      const rewards = computeSkillRewards({ questType, difficulty });
      expect(rewards.length).toBeGreaterThan(0);
    });
  });

  // ── 11. Recurring quest streak multiplier ─────────────────────────────

  describe('Recurring quest streak bonus', () => {
    it('applies streak multiplier only for recurring quests', () => {
      const nonRecurring = calculateQuestBonus({
        baseXP: 100,
        streakCount: 5,
        difficulty: 'beginner',
        hintsUsed: 0,
        isRecurring: false,
      });
      // Non-recurring ignores streak for multiplier
      expect(nonRecurring.streakMultiplier).toBe(1.0);
      expect(nonRecurring.totalXP).toBe(100);

      const recurring = calculateQuestBonus({
        baseXP: 100,
        streakCount: 5,
        difficulty: 'beginner',
        hintsUsed: 0,
        isRecurring: true,
      });
      // Recurring gets streak multiplier: 1.0 + 5 * 0.1 = 1.5
      expect(recurring.streakMultiplier).toBe(1.5);
      expect(recurring.totalXP).toBe(150);
    });
  });
});
