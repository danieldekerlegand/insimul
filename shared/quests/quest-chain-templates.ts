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
  /** Links this quest to a narrative chapter (e.g. 'ch1_assignment_abroad') */
  narrativeChapterId?: string;
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

/**
 * Missing Writer Mystery - 8 quests: the main narrative arc
 *
 * A mysterious writer has vanished from the settlement. The player
 * investigates through a chain of quests that each require different
 * action types (reading, conversation, exploration, photography,
 * item collection) while reinforcing language skills.
 */
const missingWriterMystery: QuestChainTemplate = {
  name: 'The Missing Writer',
  description: 'Investigate the disappearance of a beloved local writer through clues scattered across the settlement.',
  category: 'narrative',
  difficulty: 'beginner',
  isLinear: true,
  bonusXP: 500,
  achievement: 'Mystery Solved',
  quests: [
    {
      title: 'The Notice Board',
      description: 'A weathered notice on the town board catches your eye — someone is missing. Read the notice, then visit the town clerk to learn more about the missing writer.',
      questType: 'exploration',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      narrativeChapterId: 'ch1_assignment_abroad',
      experienceReward: 75,
      objectives: [
        { type: 'read_document', description: 'Read the missing person notice on the town board', target: 'notice_board', required: 1, current: 0, completed: false },
        { type: 'talk_to_npc', description: "Talk to the town clerk about the missing writer", target: 'clerk', required: 1, current: 0, completed: false },
        { type: 'collect_clue', description: "Learn the writer's name", target: 'writer_name', required: 1, current: 0, completed: false },
      ],
      completionCriteria: { type: 'all_objectives_complete', description: 'Read the notice and speak with the clerk' },
      tags: ['reading', 'conversation', 'main-quest', 'narrative'],
    },
    {
      title: "The Writer's Home",
      description: "Visit the missing writer's residence on the edge of town. Search the house for their journal and read the first clue about where they may have gone.",
      questType: 'exploration',
      difficulty: 'beginner',
      targetLanguage: '',
      status: 'pending',
      narrativeChapterId: 'ch2_following_the_trail',
      experienceReward: 100,
      objectives: [
        { type: 'visit_location', description: "Visit the writer's residence", target: 'writer_home', required: 1, current: 0, completed: false },
        { type: 'collect_item', description: "Collect the writer's journal", target: 'writer_journal', required: 1, current: 0, completed: false },
        { type: 'read_document', description: 'Read the first journal entry for a clue', target: 'journal_clue_1', required: 1, current: 0, completed: false },
      ],
      completionCriteria: { type: 'all_objectives_complete', description: "Find and read the writer's journal" },
      tags: ['exploration', 'item-collection', 'reading', 'main-quest', 'narrative'],
    },
    {
      title: 'Following the Trail',
      description: 'The journal mentions three people who knew the writer well. Seek them out and hear their testimonies to piece together what happened.',
      questType: 'conversation',
      difficulty: 'intermediate',
      targetLanguage: '',
      status: 'pending',
      narrativeChapterId: 'ch3_the_inner_circle',
      experienceReward: 150,
      objectives: [
        { type: 'talk_to_npc', description: "Talk to the writer's neighbor about their last days", target: 'witness_neighbor', required: 1, current: 0, completed: false },
        { type: 'talk_to_npc', description: "Talk to the writer's colleague at the library", target: 'witness_colleague', required: 1, current: 0, completed: false },
        { type: 'talk_to_npc', description: "Talk to the writer's friend at the café", target: 'witness_friend', required: 1, current: 0, completed: false },
        { type: 'collect_clue', description: 'Collect 3 witness testimonies', target: 'testimony', required: 3, current: 0, completed: false },
      ],
      completionCriteria: { type: 'all_objectives_complete', description: 'Gather all three witness testimonies' },
      tags: ['conversation', 'social', 'main-quest', 'narrative'],
    },
    {
      title: 'The Hidden Writings',
      description: "The witnesses mention books the writer left around town. Find three of the writer's books scattered across the settlement and read them for embedded clues.",
      questType: 'collection',
      difficulty: 'intermediate',
      targetLanguage: '',
      status: 'pending',
      narrativeChapterId: 'ch4_hidden_messages',
      experienceReward: 150,
      objectives: [
        { type: 'collect_item', description: "Find the writer's book at the library", target: 'writer_book_1', required: 1, current: 0, completed: false },
        { type: 'collect_item', description: "Find the writer's book at the school", target: 'writer_book_2', required: 1, current: 0, completed: false },
        { type: 'collect_item', description: "Find the writer's book at the park bench", target: 'writer_book_3', required: 1, current: 0, completed: false },
        { type: 'read_document', description: 'Read all three books for hidden clues', target: 'book_clues', required: 3, current: 0, completed: false },
      ],
      completionCriteria: { type: 'all_objectives_complete', description: "Find and read all three of the writer's books" },
      tags: ['item-collection', 'reading', 'exploration', 'main-quest', 'narrative'],
    },
    {
      title: 'The Secret Location',
      description: "The clues from the books point to a hidden spot the writer loved. Follow the trail to discover the writer's secret retreat and investigate the scene.",
      questType: 'exploration',
      difficulty: 'intermediate',
      targetLanguage: '',
      status: 'pending',
      narrativeChapterId: 'ch5_the_truth_emerges',
      experienceReward: 175,
      objectives: [
        { type: 'visit_location', description: "Follow clues to the writer's secret spot", target: 'secret_location', required: 1, current: 0, completed: false },
        { type: 'photograph', description: 'Photograph the scene at the secret location', target: 'secret_scene', required: 1, current: 0, completed: false },
        { type: 'collect_item', description: "Collect the writer's final manuscript", target: 'final_manuscript', required: 1, current: 0, completed: false },
        { type: 'read_document', description: 'Read the final manuscript', target: 'manuscript_content', required: 1, current: 0, completed: false },
      ],
      completionCriteria: { type: 'all_objectives_complete', description: 'Investigate the secret location thoroughly' },
      tags: ['exploration', 'photography', 'reading', 'main-quest', 'narrative'],
    },
    {
      title: 'The Final Chapter',
      description: "You now know the truth. Confront the reality of the writer's disappearance through a conversation challenge — explain what you've discovered to the town, using everything you've learned.",
      questType: 'conversation',
      difficulty: 'advanced',
      targetLanguage: '',
      status: 'pending',
      narrativeChapterId: 'ch6_the_final_chapter',
      experienceReward: 200,
      objectives: [
        { type: 'complete_conversation', description: 'Present your findings to the town gathering', target: 'town_gathering', required: 1, current: 0, completed: false },
        { type: 'use_vocabulary', description: 'Use investigation vocabulary to explain the mystery', target: 'investigation', required: 8, current: 0, completed: false },
        { type: 'complete_conversation', description: "Deliver the writer's final message to the community", target: 'final_message', required: 1, current: 0, completed: false },
      ],
      completionCriteria: { type: 'conversation_turns', requiredTurns: 8, description: 'Complete the town gathering conversation challenge' },
      tags: ['conversation', 'vocabulary', 'main-quest', 'narrative', 'climax'],
    },
  ],
};

/** All available quest chain templates */
export const questChainTemplates: Record<string, QuestChainTemplate> = {
  'first-words': firstWords,
  'market-day': marketDay,
  'town-explorer': townExplorer,
  'missing-writer-mystery': missingWriterMystery,
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
