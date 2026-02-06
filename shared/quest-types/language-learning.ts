/**
 * Language Learning Quest Type
 *
 * Defines quests focused on language acquisition through conversation,
 * vocabulary practice, grammar exercises, translation, and cultural learning.
 */

import type { QuestTypeDefinition } from './types';

export const languageLearningQuestType: QuestTypeDefinition = {
  id: 'language-learning',
  name: 'Language Learning',

  questCategories: [
    {
      id: 'conversation',
      name: 'Conversation',
      icon: '💬',
      description: 'Practice speaking with NPCs',
    },
    {
      id: 'vocabulary',
      name: 'Vocabulary',
      icon: '📚',
      description: 'Learn and use new words',
    },
    {
      id: 'grammar',
      name: 'Grammar',
      icon: '📝',
      description: 'Master grammar patterns',
    },
    {
      id: 'translation',
      name: 'Translation',
      icon: '🔄',
      description: 'Translate text between languages',
    },
    {
      id: 'cultural',
      name: 'Cultural',
      icon: '🌍',
      description: 'Learn about culture and customs',
    },
  ],

  objectiveTypes: [
    {
      id: 'use_vocabulary',
      name: 'Use Vocabulary',
      trackingLogic: (context) => context.vocabularyUsage?.length || 0,
      completionCheck: (progress) => {
        const used = progress.vocabularyUsed || 0;
        const required = progress.vocabularyRequired || 0;
        return used >= required;
      },
    },
    {
      id: 'complete_conversation',
      name: 'Complete Conversation',
      trackingLogic: (context) => context.conversationTurns || 0,
      completionCheck: (progress) => {
        const turns = progress.conversationTurns || 0;
        const required = progress.requiredTurns || 0;
        return turns >= required;
      },
    },
    {
      id: 'practice_grammar',
      name: 'Practice Grammar',
      trackingLogic: (context) => context.grammarPatternsUsed?.length || 0,
      completionCheck: (progress) => {
        const used = progress.grammarPatternsUsed || 0;
        const required = progress.patternsRequired || 0;
        return used >= required;
      },
    },
    {
      id: 'collect_item',
      name: 'Collect Item',
      trackingLogic: (context) => context.itemsCollected || 0,
      completionCheck: (progress) => {
        const collected = progress.collected || 0;
        const required = progress.required || 0;
        return collected >= required;
      },
      visualIndicator: (scene, objective) => {
        // Quest objects already spawned by QuestObjectManager
      },
    },
    {
      id: 'visit_location',
      name: 'Visit Location',
      trackingLogic: (context) => context.playerPosition,
      completionCheck: (progress) => {
        if (!progress.playerPos || !progress.targetPos) return false;

        // Check if player is within 5 units of target
        const dx = progress.playerPos.x - progress.targetPos.x;
        const dz = progress.playerPos.z - progress.targetPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        return distance < 5;
      },
      visualIndicator: (scene, objective) => {
        // Cyan beacon spawned by QuestObjectManager
      },
    },
    {
      id: 'talk_to_npc',
      name: 'Talk to NPC',
      trackingLogic: (context) => context.npcTalkedTo || false,
      completionCheck: (progress) => progress.talked === true,
    },
    {
      id: 'use_vocabulary_category',
      name: 'Use Themed Vocabulary',
      trackingLogic: (context) => context.vocabularyByCategory,
      completionCheck: (progress) => {
        const used = progress.wordsUsed || [];
        const category = progress.targetCategory;
        const required = progress.requiredCount || 5;
        const categoryWords = category
          ? used.filter((w: any) => w.category === category)
          : used;
        return categoryWords.length >= required;
      },
    },
    {
      id: 'sustained_conversation',
      name: 'Sustained Conversation',
      trackingLogic: (context) => ({
        turns: context.conversationTurns,
        targetLanguageUsage: context.targetLanguagePercentage,
      }),
      completionCheck: (progress) => {
        return (progress.turns || 0) >= (progress.requiredTurns || 5) &&
               (progress.targetLanguageUsage || 0) >= (progress.minPercentage || 30);
      },
    },
    {
      id: 'master_words',
      name: 'Master Words',
      trackingLogic: (context) => context.masteredWords || 0,
      completionCheck: (progress) => {
        return (progress.masteredWords || 0) >= (progress.required || 3);
      },
    },
    {
      id: 'learn_new_words',
      name: 'Learn New Words',
      trackingLogic: (context) => context.newWordsLearned || 0,
      completionCheck: (progress) => {
        return (progress.newWordsLearned || 0) >= (progress.required || 5);
      },
    },
  ],

  rewardTypes: ['experience', 'fluency', 'items', 'unlock'],

  difficultyScaling: {
    beginner: {
      xp: 10,
      multiplier: 1,
    },
    intermediate: {
      xp: 25,
      multiplier: 1.5,
    },
    advanced: {
      xp: 50,
      multiplier: 2,
    },
  },

  generationPrompt: (world) => {
    const language = world.targetLanguage || 'the target language';
    const setting = world.worldType || 'fantasy';

    return `Generate a language-learning quest for learning ${language} in a ${setting} world.

World Description: ${world.description || 'A language learning environment'}

Create a quest that helps the player practice ${language} through natural interactions. The quest should:
- Have a clear narrative context that fits the ${setting} setting
- Include 2-4 objectives from: use_vocabulary, complete_conversation, practice_grammar, collect_item, visit_location, talk_to_npc, use_vocabulary_category, sustained_conversation, master_words, learn_new_words
- Specify vocabulary words or grammar patterns to practice
- Set appropriate difficulty (beginner/intermediate/advanced)
- Provide meaningful rewards (XP and fluency points)

Return JSON format:
{
  "title": "Quest title in English",
  "description": "Quest description with narrative context",
  "category": "conversation|vocabulary|grammar|translation|cultural",
  "difficulty": "beginner|intermediate|advanced",
  "objectives": [
    {
      "type": "use_vocabulary",
      "description": "Use 5 food-related words in conversation",
      "target": "food_vocabulary",
      "required": 5,
      "vocabularyWords": ["bread", "water", "apple", "cheese", "wine"]
    }
  ],
  "rewards": {
    "experience": 25,
    "fluency": 5
  }
}`;
  },
};
