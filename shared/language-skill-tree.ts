/**
 * Language Skill Tree Types
 *
 * Defines a 5-tier skill tree for language learning progression.
 * Each tier has nodes representing specific skills to unlock.
 */

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;             // 1-5
  condition: SkillCondition;
  unlocked: boolean;
  progress: number;         // 0.0-1.0
}

export interface SkillCondition {
  type: 'words_learned' | 'words_mastered' | 'conversations' | 'grammar_patterns'
      | 'target_language_pct' | 'fluency' | 'sustained_turns' | 'quest_count';
  threshold: number;
}

export interface SkillTier {
  tier: number;
  name: string;
  fluencyRange: [number, number];
  color: string;
  nodes: SkillNode[];
}

export const SKILL_TIERS: SkillTier[] = [
  {
    tier: 1,
    name: 'First Words',
    fluencyRange: [0, 20],
    color: '#6bbd5b',
    nodes: [
      {
        id: 'greetings',
        name: 'Greetings',
        description: 'Learn 5 basic greeting words',
        icon: '👋',
        tier: 1,
        condition: { type: 'words_learned', threshold: 5 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'first_chat',
        name: 'First Chat',
        description: 'Complete 3 conversations with NPCs',
        icon: '💬',
        tier: 1,
        condition: { type: 'conversations', threshold: 3 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'word_hunter',
        name: 'Word Hunter',
        description: 'Learn 10 new words',
        icon: '📖',
        tier: 1,
        condition: { type: 'words_learned', threshold: 10 },
        unlocked: false,
        progress: 0,
      },
    ],
  },
  {
    tier: 2,
    name: 'Simple Sentences',
    fluencyRange: [20, 40],
    color: '#4a9fd6',
    nodes: [
      {
        id: 'grammar_basics',
        name: 'Grammar Basics',
        description: 'Use 5 different grammar patterns',
        icon: '📝',
        tier: 2,
        condition: { type: 'grammar_patterns', threshold: 5 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'word_master_1',
        name: 'Word Master I',
        description: 'Master 20 words through repeated use',
        icon: '⭐',
        tier: 2,
        condition: { type: 'words_mastered', threshold: 20 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'chatterbox',
        name: 'Chatterbox',
        description: 'Complete 15 conversations',
        icon: '🗣️',
        tier: 2,
        condition: { type: 'conversations', threshold: 15 },
        unlocked: false,
        progress: 0,
      },
    ],
  },
  {
    tier: 3,
    name: 'Getting Conversational',
    fluencyRange: [40, 60],
    color: '#c06bc0',
    nodes: [
      {
        id: 'sustained_speaker',
        name: 'Sustained Speaker',
        description: 'Maintain 10-turn conversations',
        icon: '🎙️',
        tier: 3,
        condition: { type: 'sustained_turns', threshold: 10 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'half_immersion',
        name: 'Half Immersion',
        description: 'Use target language 50%+ in conversations',
        icon: '🌊',
        tier: 3,
        condition: { type: 'target_language_pct', threshold: 50 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'quest_learner',
        name: 'Quest Learner',
        description: 'Complete 10 language quests',
        icon: '🏅',
        tier: 3,
        condition: { type: 'quest_count', threshold: 10 },
        unlocked: false,
        progress: 0,
      },
    ],
  },
  {
    tier: 4,
    name: 'Fluent Speaker',
    fluencyRange: [60, 80],
    color: '#e8a838',
    nodes: [
      {
        id: 'word_master_2',
        name: 'Word Master II',
        description: 'Master 100 words',
        icon: '🌟',
        tier: 4,
        condition: { type: 'words_mastered', threshold: 100 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'grammar_ace',
        name: 'Grammar Ace',
        description: 'Achieve 80%+ grammar accuracy across conversations',
        icon: '🎯',
        tier: 4,
        condition: { type: 'grammar_patterns', threshold: 15 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'deep_immersion',
        name: 'Deep Immersion',
        description: 'Use target language 80%+ in conversations',
        icon: '🏊',
        tier: 4,
        condition: { type: 'target_language_pct', threshold: 80 },
        unlocked: false,
        progress: 0,
      },
    ],
  },
  {
    tier: 5,
    name: 'Near Native',
    fluencyRange: [80, 100],
    color: '#e84040',
    nodes: [
      {
        id: 'full_immersion',
        name: 'Full Immersion',
        description: 'Hold conversations entirely in target language',
        icon: '🌍',
        tier: 5,
        condition: { type: 'target_language_pct', threshold: 95 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'polyglot',
        name: 'Polyglot',
        description: 'Reach 90% fluency',
        icon: '👑',
        tier: 5,
        condition: { type: 'fluency', threshold: 90 },
        unlocked: false,
        progress: 0,
      },
      {
        id: 'word_master_3',
        name: 'Word Master III',
        description: 'Master 250 words',
        icon: '💎',
        tier: 5,
        condition: { type: 'words_mastered', threshold: 250 },
        unlocked: false,
        progress: 0,
      },
    ],
  },
];

export interface SkillTreeState {
  nodes: SkillNode[];
}

export function createDefaultSkillTreeState(): SkillTreeState {
  return {
    nodes: SKILL_TIERS.flatMap(tier => tier.nodes.map(n => ({ ...n }))),
  };
}

/**
 * Update skill node progress based on current player stats
 */
export function updateSkillProgress(
  state: SkillTreeState,
  stats: {
    wordsLearned: number;
    wordsMastered: number;
    conversations: number;
    grammarPatterns: number;
    avgTargetLanguagePct: number;
    fluency: number;
    maxSustainedTurns: number;
    questsCompleted: number;
  }
): SkillNode[] {
  const newlyUnlocked: SkillNode[] = [];

  for (const node of state.nodes) {
    if (node.unlocked) continue;

    const { type, threshold } = node.condition;
    let current = 0;

    switch (type) {
      case 'words_learned': current = stats.wordsLearned; break;
      case 'words_mastered': current = stats.wordsMastered; break;
      case 'conversations': current = stats.conversations; break;
      case 'grammar_patterns': current = stats.grammarPatterns; break;
      case 'target_language_pct': current = stats.avgTargetLanguagePct; break;
      case 'fluency': current = stats.fluency; break;
      case 'sustained_turns': current = stats.maxSustainedTurns; break;
      case 'quest_count': current = stats.questsCompleted; break;
    }

    node.progress = Math.min(1, current / threshold);

    if (current >= threshold) {
      node.unlocked = true;
      newlyUnlocked.push(node);
    }
  }

  return newlyUnlocked;
}
