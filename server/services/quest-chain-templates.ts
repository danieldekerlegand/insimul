/**
 * Quest Chain Templates
 *
 * Predefined quest chain templates for progressive language learning.
 * Each template defines a sequence of quests that build on each other,
 * progressing from simple to complex language skills.
 */

export interface ChainQuestDef {
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  targetLanguage: string;
  status: string;
  experienceReward: number;
  objectives: Array<Record<string, unknown>>;
  completionCriteria: Record<string, unknown>;
  tags: string[];
}

export interface QuestChainTemplate {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  isLinear: boolean;
  bonusXP: number;
  achievement: string;
  quests: ChainQuestDef[];
}

/**
 * First Words - 5 quests progressing from greetings to storytelling
 */
const firstWords: QuestChainTemplate = {
  name: 'First Words',
  description: 'Learn the basics of communication, from simple greetings to telling your own story.',
  category: 'vocabulary',
  difficulty: 'beginner',
  isLinear: true,
  bonusXP: 200,
  achievement: 'First Words Master',
  quests: [
    {
      title: 'Hello, World!',
      description: 'Learn basic greetings and how to say hello to the people of the town.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'active',
      experienceReward: 50,
      objectives: [
        { type: 'use_vocabulary', description: 'Use a greeting word in conversation', target: 'greeting', required: 3, current: 0, completed: false },
        { type: 'talk_to_npc', description: 'Greet 2 different townspeople', target: 'any', required: 2, current: 0, completed: false },
      ],
      completionCriteria: { type: 'vocabulary_usage', requiredCount: 3, description: 'Use 3 greeting words in conversation' },
      tags: ['greetings', 'beginner', 'social'],
    },
    {
      title: 'Who Am I?',
      description: 'Learn to introduce yourself — share your name and where you come from.',
      questType: 'conversation',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 75,
      objectives: [
        { type: 'complete_conversation', description: 'Introduce yourself to a townsperson', target: 'any', required: 1, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use introduction phrases', target: 'introduction', required: 3, current: 0, completed: false },
      ],
      completionCriteria: { type: 'conversation_turns', requiredTurns: 4, description: 'Have a 4-turn introduction conversation' },
      tags: ['introduction', 'beginner', 'social'],
    },
    {
      title: 'Curious Minds',
      description: 'Practice asking questions — learn how to ask about people, places, and things.',
      questType: 'grammar',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 100,
      objectives: [
        { type: 'use_vocabulary', description: 'Use question words', target: 'question', required: 5, current: 0, completed: false },
        { type: 'talk_to_npc', description: 'Ask questions to 3 different NPCs', target: 'any', required: 3, current: 0, completed: false },
      ],
      completionCriteria: { type: 'vocabulary_usage', requiredCount: 5, description: 'Use 5 question words in conversation' },
      tags: ['questions', 'beginner', 'grammar'],
    },
    {
      title: 'Painting with Words',
      description: 'Learn to describe the world around you — colors, sizes, and qualities.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 100,
      objectives: [
        { type: 'identify_object', description: 'Describe 5 objects using adjectives', target: 'any', required: 5, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use descriptive words', target: 'adjective', required: 5, current: 0, completed: false },
      ],
      completionCriteria: { type: 'vocabulary_usage', requiredCount: 5, description: 'Use 5 descriptive words' },
      tags: ['description', 'beginner', 'vocabulary'],
    },
    {
      title: 'My Story',
      description: 'Put it all together — tell a short story about yourself and your journey.',
      questType: 'conversation',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 150,
      objectives: [
        { type: 'complete_conversation', description: 'Tell your story to a townsperson', target: 'any', required: 1, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use words from previous quests', target: 'mixed', required: 8, current: 0, completed: false },
      ],
      completionCriteria: { type: 'conversation_turns', requiredTurns: 6, description: 'Have a 6-turn storytelling conversation' },
      tags: ['storytelling', 'beginner', 'conversation'],
    },
  ],
};

/**
 * Market Day - 3 quests: learn food vocabulary → visit market → complete a purchase
 */
const marketDay: QuestChainTemplate = {
  name: 'Market Day',
  description: 'Learn the language of commerce — from food words to making your first purchase.',
  category: 'vocabulary',
  difficulty: 'beginner',
  isLinear: true,
  bonusXP: 150,
  achievement: 'Market Regular',
  quests: [
    {
      title: 'Food for Thought',
      description: 'Learn the names of common foods and drinks at the market stalls.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'active',
      experienceReward: 75,
      objectives: [
        { type: 'collect_vocabulary', description: 'Learn 8 food-related words', target: 'food', required: 8, current: 0, completed: false },
        { type: 'identify_object', description: 'Identify 3 food items by name', target: 'food', required: 3, current: 0, completed: false },
      ],
      completionCriteria: { type: 'vocabulary_usage', requiredCount: 8, description: 'Learn 8 food vocabulary words' },
      tags: ['food', 'beginner', 'vocabulary'],
    },
    {
      title: 'Window Shopping',
      description: 'Visit the market and talk to vendors about their wares.',
      questType: 'conversation',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 100,
      objectives: [
        { type: 'visit_location', description: 'Visit the market area', target: 'market', required: 1, current: 0, completed: false },
        { type: 'talk_to_npc', description: 'Talk to 2 market vendors', target: 'vendor', required: 2, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use food vocabulary with vendors', target: 'food', required: 4, current: 0, completed: false },
      ],
      completionCriteria: { type: 'conversation_turns', requiredTurns: 4, description: 'Have conversations with market vendors' },
      tags: ['market', 'beginner', 'social'],
    },
    {
      title: 'The Big Purchase',
      description: 'Use your new vocabulary to negotiate and complete a purchase at the market.',
      questType: 'conversation',
      difficulty: 'intermediate',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 150,
      objectives: [
        { type: 'complete_conversation', description: 'Complete a purchase conversation', target: 'vendor', required: 1, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use number and price vocabulary', target: 'commerce', required: 5, current: 0, completed: false },
        { type: 'collect_item', description: 'Receive a purchased item', target: 'any', required: 1, current: 0, completed: false },
      ],
      completionCriteria: { type: 'conversation_turns', requiredTurns: 6, description: 'Complete a full purchase transaction' },
      tags: ['commerce', 'intermediate', 'conversation'],
    },
  ],
};

/**
 * Town Explorer - 4 quests: learn directions → follow → give → navigate independently
 */
const townExplorer: QuestChainTemplate = {
  name: 'Town Explorer',
  description: 'Master the language of navigation — from learning direction words to guiding others.',
  category: 'vocabulary',
  difficulty: 'beginner',
  isLinear: true,
  bonusXP: 175,
  achievement: 'Town Navigator',
  quests: [
    {
      title: 'Which Way?',
      description: 'Learn the basic direction words — left, right, forward, back, near, far.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'active',
      experienceReward: 75,
      objectives: [
        { type: 'collect_vocabulary', description: 'Learn 6 direction words', target: 'direction', required: 6, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use direction words in context', target: 'direction', required: 4, current: 0, completed: false },
      ],
      completionCriteria: { type: 'vocabulary_usage', requiredCount: 6, description: 'Learn 6 direction words' },
      tags: ['directions', 'beginner', 'vocabulary'],
    },
    {
      title: 'Follow the Leader',
      description: 'A townsperson gives you directions — follow them to reach the destination.',
      questType: 'conversation',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 100,
      objectives: [
        { type: 'follow_directions', description: 'Follow spoken directions to a destination', target: 'any', required: 1, current: 0, completed: false },
        { type: 'visit_location', description: 'Reach the correct destination', target: 'destination', required: 1, current: 0, completed: false },
      ],
      completionCriteria: { type: 'all_objectives_complete', description: 'Follow directions to reach the destination' },
      tags: ['directions', 'beginner', 'navigation'],
    },
    {
      title: 'Tour Guide',
      description: 'A lost visitor asks for help — give them directions to a landmark.',
      questType: 'conversation',
      difficulty: 'intermediate',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 125,
      objectives: [
        { type: 'talk_to_npc', description: 'Talk to the lost visitor', target: 'visitor', required: 1, current: 0, completed: false },
        { type: 'navigate_language', description: 'Give directions using direction vocabulary', target: 'any', required: 1, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use direction words to guide them', target: 'direction', required: 5, current: 0, completed: false },
      ],
      completionCriteria: { type: 'conversation_turns', requiredTurns: 5, description: 'Give complete directions to the visitor' },
      tags: ['directions', 'intermediate', 'social'],
    },
    {
      title: 'Free Roam',
      description: 'Navigate to 3 landmarks on your own, asking for help only in the target language.',
      questType: 'conversation',
      difficulty: 'intermediate',
      targetLanguage: '',
      status: 'pending',
      experienceReward: 150,
      objectives: [
        { type: 'discover_location', description: 'Find 3 landmarks independently', target: 'landmark', required: 3, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Ask for directions in target language', target: 'direction', required: 6, current: 0, completed: false },
      ],
      completionCriteria: { type: 'all_objectives_complete', description: 'Navigate to 3 landmarks independently' },
      tags: ['navigation', 'intermediate', 'exploration'],
    },
  ],
};

/** All available quest chain templates */
export const questChainTemplates: Record<string, QuestChainTemplate> = {
  'first-words': firstWords,
  'market-day': marketDay,
  'town-explorer': townExplorer,
};

/**
 * Get a template by ID, applying the world's target language.
 */
export function getChainTemplate(templateId: string, targetLanguage: string): QuestChainTemplate | null {
  const template = questChainTemplates[templateId];
  if (!template) return null;

  return {
    ...template,
    quests: template.quests.map(q => ({
      ...q,
      targetLanguage,
    })),
  };
}

/**
 * List available template summaries (without full quest data).
 */
export function listChainTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  questCount: number;
  difficulty: string;
  bonusXP: number;
  achievement: string;
}> {
  return Object.entries(questChainTemplates).map(([id, t]) => ({
    id,
    name: t.name,
    description: t.description,
    questCount: t.quests.length,
    difficulty: t.difficulty,
    bonusXP: t.bonusXP,
    achievement: t.achievement,
  }));
}
