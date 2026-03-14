import { describe, it, expect } from 'vitest';
import {
  createSkillTreeState,
  updateSkillProgress,
  type SkillTreeConfig,
  type SkillTreeState,
} from '../skill-tree';
import {
  LANGUAGE_SKILL_TREE_CONFIG,
  createDefaultSkillTreeState,
  updateSkillProgress as languageUpdateSkillProgress,
  SKILL_TIERS,
} from '../language-skill-tree';

// --- Generic framework tests ---

type TestCondition = 'kills' | 'quests_done';

const TEST_CONFIG: SkillTreeConfig<TestCondition> = {
  tiers: [
    {
      tier: 1,
      name: 'Novice',
      range: [0, 50],
      color: '#aaa',
      nodes: [
        { id: 'first_blood', name: 'First Blood', description: 'Get 1 kill', icon: 'X', tier: 1, condition: { type: 'kills', threshold: 1 }, unlocked: false, progress: 0 },
        { id: 'quest_starter', name: 'Quest Starter', description: 'Complete 2 quests', icon: 'Q', tier: 1, condition: { type: 'quests_done', threshold: 2 }, unlocked: false, progress: 0 },
      ],
    },
    {
      tier: 2,
      name: 'Veteran',
      range: [50, 100],
      color: '#f00',
      nodes: [
        { id: 'slayer', name: 'Slayer', description: 'Get 50 kills', icon: 'S', tier: 2, condition: { type: 'kills', threshold: 50 }, unlocked: false, progress: 0 },
      ],
    },
  ],
  statResolver: {
    kills: s => s.kills ?? 0,
    quests_done: s => s.questsDone ?? 0,
  },
};

describe('Generic Skill Tree', () => {
  it('createSkillTreeState produces all nodes from tiers', () => {
    const state = createSkillTreeState(TEST_CONFIG);
    expect(state.nodes).toHaveLength(3);
    expect(state.nodes.every(n => !n.unlocked)).toBe(true);
    expect(state.nodes.every(n => n.progress === 0)).toBe(true);
  });

  it('createSkillTreeState deep-copies nodes', () => {
    const state = createSkillTreeState(TEST_CONFIG);
    state.nodes[0].unlocked = true;
    const state2 = createSkillTreeState(TEST_CONFIG);
    expect(state2.nodes[0].unlocked).toBe(false);
  });

  it('updateSkillProgress unlocks nodes when thresholds are met', () => {
    const state = createSkillTreeState(TEST_CONFIG);
    const unlocked = updateSkillProgress(state, { kills: 1, questsDone: 0 }, TEST_CONFIG);
    expect(unlocked).toHaveLength(1);
    expect(unlocked[0].id).toBe('first_blood');
    expect(state.nodes[0].unlocked).toBe(true);
    expect(state.nodes[0].progress).toBe(1);
  });

  it('updateSkillProgress tracks partial progress', () => {
    const state = createSkillTreeState(TEST_CONFIG);
    updateSkillProgress(state, { kills: 25 }, TEST_CONFIG);
    const slayer = state.nodes.find(n => n.id === 'slayer')!;
    expect(slayer.progress).toBe(0.5);
    expect(slayer.unlocked).toBe(false);
  });

  it('updateSkillProgress caps progress at 1.0', () => {
    const state = createSkillTreeState(TEST_CONFIG);
    updateSkillProgress(state, { kills: 200 }, TEST_CONFIG);
    const slayer = state.nodes.find(n => n.id === 'slayer')!;
    expect(slayer.progress).toBe(1);
    expect(slayer.unlocked).toBe(true);
  });

  it('updateSkillProgress skips already-unlocked nodes', () => {
    const state = createSkillTreeState(TEST_CONFIG);
    updateSkillProgress(state, { kills: 1 }, TEST_CONFIG);
    const unlocked2 = updateSkillProgress(state, { kills: 5 }, TEST_CONFIG);
    expect(unlocked2).toHaveLength(0); // first_blood already unlocked
  });

  it('handles missing stats gracefully (defaults to 0)', () => {
    const state = createSkillTreeState(TEST_CONFIG);
    updateSkillProgress(state, {}, TEST_CONFIG);
    expect(state.nodes.every(n => n.progress === 0)).toBe(true);
  });
});

// --- Language skill tree backward-compatibility tests ---

describe('Language Skill Tree (backward compat)', () => {
  it('SKILL_TIERS has 5 tiers with correct names', () => {
    expect(SKILL_TIERS).toHaveLength(5);
    expect(SKILL_TIERS.map(t => t.name)).toEqual([
      'First Words', 'Simple Sentences', 'Getting Conversational', 'Fluent Speaker', 'Near Native',
    ]);
  });

  it('createDefaultSkillTreeState produces all 15 nodes', () => {
    const state = createDefaultSkillTreeState();
    expect(state.nodes).toHaveLength(15);
    expect(state.nodes.every(n => !n.unlocked)).toBe(true);
  });

  it('updateSkillProgress unlocks language nodes correctly', () => {
    const state = createDefaultSkillTreeState();
    const unlocked = languageUpdateSkillProgress(state, {
      wordsLearned: 10,
      wordsMastered: 0,
      conversations: 3,
      grammarPatterns: 0,
      avgTargetLanguagePct: 0,
      fluency: 0,
      maxSustainedTurns: 0,
      questsCompleted: 0,
    });
    const unlockedIds = unlocked.map(n => n.id);
    expect(unlockedIds).toContain('greetings');
    expect(unlockedIds).toContain('first_chat');
    expect(unlockedIds).toContain('word_hunter');
  });

  it('LANGUAGE_SKILL_TREE_CONFIG tiers match SKILL_TIERS', () => {
    expect(LANGUAGE_SKILL_TREE_CONFIG.tiers).toBe(SKILL_TIERS);
  });
});
