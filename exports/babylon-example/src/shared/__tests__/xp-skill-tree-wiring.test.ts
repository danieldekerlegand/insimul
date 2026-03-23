import { describe, it, expect } from 'vitest';
import {
  createDefaultSkillTreeState,
  updateSkillProgress,
} from '../language/language-skill-tree';
import { getLevelForXP, LEVEL_THRESHOLDS } from '../language/gamification';
import { getRewardsForLevel } from '../language/level-rewards';

describe('XP to Skill Tree Progression Wiring', () => {
  it('skill tree updates when stats change from gameplay XP gains', () => {
    const state = createDefaultSkillTreeState();

    // Simulate a player who has done enough gameplay to earn XP:
    // Learned 10 words, completed 3 conversations
    const stats = {
      wordsLearned: 10,
      wordsMastered: 0,
      conversations: 3,
      grammarPatterns: 0,
      avgTargetLanguagePct: 0,
      fluency: 0,
      maxSustainedTurns: 0,
      questsCompleted: 0,
    };

    const unlocked = updateSkillProgress(state, stats);
    const unlockedIds = unlocked.map(n => n.id);

    // Should unlock tier 1 skills
    expect(unlockedIds).toContain('greetings');   // words_learned >= 5
    expect(unlockedIds).toContain('first_chat');   // conversations >= 3
    expect(unlockedIds).toContain('word_hunter');   // words_learned >= 10
  });

  it('progressive XP accumulation unlocks higher tiers', () => {
    const state = createDefaultSkillTreeState();

    // First update: tier 1
    updateSkillProgress(state, {
      wordsLearned: 10, wordsMastered: 0, conversations: 3,
      grammarPatterns: 0, avgTargetLanguagePct: 0, fluency: 0,
      maxSustainedTurns: 0, questsCompleted: 0,
    });
    const tier1Unlocked = state.nodes.filter(n => n.tier === 1 && n.unlocked).length;
    expect(tier1Unlocked).toBe(3);

    // Second update: tier 2 progress
    const unlocked2 = updateSkillProgress(state, {
      wordsLearned: 30, wordsMastered: 20, conversations: 15,
      grammarPatterns: 5, avgTargetLanguagePct: 30, fluency: 25,
      maxSustainedTurns: 5, questsCompleted: 3,
    });

    const tier2Ids = unlocked2.filter(n => n.tier === 2).map(n => n.id);
    expect(tier2Ids).toContain('grammar_basics');
    expect(tier2Ids).toContain('word_master_1');
    expect(tier2Ids).toContain('chatterbox');
  });

  it('level-up triggers rewards that can be applied', () => {
    // Simulate XP accumulation that crosses a level boundary
    const xpBefore = 40; // Level 1
    const xpAfter = 55;  // Level 2

    const oldLevel = getLevelForXP(xpBefore);
    const newLevel = getLevelForXP(xpAfter);

    expect(oldLevel).toBe(1);
    expect(newLevel).toBe(2);

    const rewards = getRewardsForLevel(newLevel);
    // Level 2 should have skill points
    expect(rewards.some(r => r.type === 'skill_points')).toBe(true);
  });

  it('tier milestone level-up grants conversation topics and quest tiers', () => {
    // Level 5 is end of Beginner tier
    const level5Rewards = getRewardsForLevel(5);
    expect(level5Rewards.some(r => r.type === 'conversation_topic' && r.value === 'daily_life')).toBe(true);
    expect(level5Rewards.some(r => r.type === 'quest_tier' && r.value === 'elementary')).toBe(true);

    // Level 10 is end of Elementary tier
    const level10Rewards = getRewardsForLevel(10);
    expect(level10Rewards.some(r => r.type === 'conversation_topic' && r.value === 'culture')).toBe(true);
    expect(level10Rewards.some(r => r.type === 'quest_tier' && r.value === 'intermediate')).toBe(true);
  });

  it('XP thresholds are monotonically increasing', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
    }
  });

  it('level-up rewards scale with level', () => {
    const earlyRewards = getRewardsForLevel(3);
    const lateRewards = getRewardsForLevel(18);

    const earlySP = earlyRewards.find(r => r.type === 'skill_points');
    const lateSP = lateRewards.find(r => r.type === 'skill_points');

    expect(earlySP?.value).toBeLessThan(lateSP?.value as number);
  });
});
