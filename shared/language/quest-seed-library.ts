/**
 * Quest Content Seed Library
 *
 * Parameterized quest seeds that produce complete quest data including
 * Prolog content. Each seed is a self-contained template that can be
 * instantiated with world-specific parameters (NPC names, locations,
 * vocabulary, etc.) to produce ready-to-insert quest records.
 */

import { convertQuestToProlog } from '../prolog/quest-converter';

// ── Types ───────────────────────────────────────────────────────────────────

export interface QuestSeed {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Parameter definitions required to instantiate this seed */
  params: SeedParam[];
  /** Template with {{param}} placeholders */
  titleTemplate: string;
  descriptionTemplate: string;
  questType: string;
  objectiveTemplates: SeedObjective[];
  completionCriteria: SeedCompletionCriteria;
  /** Base XP reward (scaled by difficulty multiplier) */
  baseXp: number;
  tags: string[];
}

export interface SeedParam {
  name: string;
  type: 'string' | 'number' | 'string[]';
  description: string;
  /** Default value used when not provided */
  defaultValue?: string | number | string[];
}

export interface SeedObjective {
  type: string;
  descriptionTemplate: string;
  /** Use a number or '{{paramName}}' referencing a numeric param */
  countTemplate: number | string;
  /** Additional fields passed through to objective data */
  extra?: Record<string, string | number>;
}

export interface SeedCompletionCriteria {
  type: string;
  [key: string]: string | number | string[] | undefined;
}

export interface InstantiateParams {
  worldId: string;
  targetLanguage: string;
  assignedTo: string;
  assignedBy?: string;
  /** Values for the seed's param placeholders */
  values?: Record<string, string | number | string[]>;
}

export interface InstantiatedQuest {
  worldId: string;
  assignedTo: string;
  assignedBy?: string;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  targetLanguage: string;
  objectives: any[];
  completionCriteria: Record<string, any>;
  experienceReward: number;
  rewards: Record<string, any>;
  tags: string[];
  status: string;
  content: string;
}

// ── Difficulty multipliers ──────────────────────────────────────────────────

const DIFFICULTY_XP_MULTIPLIER: Record<string, number> = {
  beginner: 1,
  intermediate: 1.5,
  advanced: 2.5,
};

// ── Seed Library ────────────────────────────────────────────────────────────

export const QUEST_SEEDS: QuestSeed[] = [
  // ── Conversation ────────────────────────────────────────────────────────
  {
    id: 'greetings_101',
    name: 'First Words',
    category: 'conversation',
    difficulty: 'beginner',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC to greet' },
      { name: 'greetingWords', type: 'string[]', description: 'Greeting vocabulary', defaultValue: ['hello', 'goodbye', 'please', 'thank you'] },
    ],
    titleTemplate: 'First Words with {{npcName}}',
    descriptionTemplate: 'Introduce yourself to {{npcName}} using basic greetings in {{targetLanguage}}.',
    questType: 'conversation',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Have a greeting conversation with {{npcName}}', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use greeting words during the conversation', countTemplate: 3 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 3 },
    baseXp: 20,
    tags: ['greeting', 'beginner', 'conversation'],
  },
  {
    id: 'deep_discussion',
    name: 'In-Depth Discussion',
    category: 'conversation',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC to converse with' },
      { name: 'topic', type: 'string', description: 'Conversation topic', defaultValue: 'daily life' },
      { name: 'turns', type: 'number', description: 'Required conversation turns', defaultValue: 8 },
    ],
    titleTemplate: 'Discussing {{topic}} with {{npcName}}',
    descriptionTemplate: 'Have an extended conversation about {{topic}} with {{npcName}}, using at least 50% {{targetLanguage}}.',
    questType: 'conversation',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Hold a {{turns}}-turn conversation with {{npcName}}', countTemplate: '{{turns}}' },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 8 },
    baseXp: 40,
    tags: ['conversation', 'sustained', 'intermediate'],
  },
  {
    id: 'debate_club',
    name: 'Debate Club',
    category: 'conversation',
    difficulty: 'advanced',
    params: [
      { name: 'npcName', type: 'string', description: 'Debate partner' },
      { name: 'topic', type: 'string', description: 'Debate topic', defaultValue: 'local traditions' },
      { name: 'turns', type: 'number', description: 'Required turns', defaultValue: 12 },
    ],
    titleTemplate: 'The Great Debate: {{topic}}',
    descriptionTemplate: 'Engage {{npcName}} in a spirited debate about {{topic}}, arguing your position entirely in {{targetLanguage}}.',
    questType: 'conversation',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Debate {{npcName}} for {{turns}} turns', countTemplate: '{{turns}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use opinion and argument vocabulary', countTemplate: 5 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 12 },
    baseXp: 60,
    tags: ['conversation', 'debate', 'advanced'],
  },

  // ── Vocabulary ──────────────────────────────────────────────────────────
  {
    id: 'market_words',
    name: 'Market Day',
    category: 'vocabulary',
    difficulty: 'beginner',
    params: [
      { name: 'location', type: 'string', description: 'Market location', defaultValue: 'the market' },
      { name: 'wordCount', type: 'number', description: 'Words to learn', defaultValue: 5 },
    ],
    titleTemplate: 'Market Day at {{location}}',
    descriptionTemplate: 'Visit {{location}} and learn {{wordCount}} food and shopping words in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'learn_new_words', descriptionTemplate: 'Learn {{wordCount}} market vocabulary words', countTemplate: '{{wordCount}}' },
      { type: 'visit_location', descriptionTemplate: 'Visit {{location}}', countTemplate: 1 },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 25,
    tags: ['vocabulary', 'food', 'shopping', 'beginner'],
  },
  {
    id: 'profession_talk',
    name: 'What Do You Do?',
    category: 'vocabulary',
    difficulty: 'intermediate',
    params: [
      { name: 'npcCount', type: 'number', description: 'NPCs to interview', defaultValue: 3 },
      { name: 'wordCount', type: 'number', description: 'Profession words to learn', defaultValue: 6 },
    ],
    titleTemplate: 'What Do You Do? ({{npcCount}} interviews)',
    descriptionTemplate: 'Interview {{npcCount}} workers about their jobs and learn {{wordCount}} profession words in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Interview {{npcCount}} workers about their professions', countTemplate: '{{npcCount}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use {{wordCount}} profession vocabulary words', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 6 },
    baseXp: 35,
    tags: ['vocabulary', 'professions', 'intermediate'],
  },
  {
    id: 'color_hunt',
    name: 'Color Scavenger Hunt',
    category: 'vocabulary',
    difficulty: 'beginner',
    params: [
      { name: 'itemCount', type: 'number', description: 'Items to find', defaultValue: 5 },
    ],
    titleTemplate: 'Color Scavenger Hunt',
    descriptionTemplate: 'Find {{itemCount}} objects of different colors and name each color in {{targetLanguage}}.',
    questType: 'scavenger_hunt',
    objectiveTemplates: [
      { type: 'find_vocabulary_items', descriptionTemplate: 'Find {{itemCount}} colored objects and name their colors', countTemplate: '{{itemCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 20,
    tags: ['vocabulary', 'colors', 'scavenger_hunt', 'beginner'],
  },
  {
    id: 'word_master',
    name: 'Word Mastery',
    category: 'vocabulary',
    difficulty: 'advanced',
    params: [
      { name: 'wordCount', type: 'number', description: 'Words to master', defaultValue: 10 },
      { name: 'usesPerWord', type: 'number', description: 'Correct uses per word', defaultValue: 3 },
    ],
    titleTemplate: 'Master {{wordCount}} Words',
    descriptionTemplate: 'Demonstrate mastery of {{wordCount}} vocabulary words by using each correctly {{usesPerWord}} times.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'master_words', descriptionTemplate: 'Master {{wordCount}} words ({{usesPerWord}} correct uses each)', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 10 },
    baseXp: 50,
    tags: ['vocabulary', 'mastery', 'advanced'],
  },

  // ── Shopping & Economic ──────────────────────────────────────────────────
  {
    id: 'shop_basics',
    name: 'Shopping Basics',
    category: 'shopping',
    difficulty: 'beginner',
    params: [
      { name: 'businessName', type: 'string', description: 'Name of the business', defaultValue: 'the shop' },
      { name: 'businessType', type: 'string', description: 'Type of business', defaultValue: 'Shop' },
      { name: 'wordCount', type: 'number', description: 'Words to learn', defaultValue: 5 },
    ],
    titleTemplate: 'Shopping at {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and learn {{wordCount}} shopping words in {{targetLanguage}} — money, price, to buy, and more.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'collect_vocabulary', descriptionTemplate: 'Learn {{wordCount}} shopping vocabulary words', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 25,
    tags: ['shopping', 'vocabulary', 'beginner', 'business'],
  },
  {
    id: 'bakery_order',
    name: 'At the Bakery',
    category: 'shopping',
    difficulty: 'beginner',
    params: [
      { name: 'businessName', type: 'string', description: 'Name of the bakery', defaultValue: 'the bakery' },
      { name: 'ownerName', type: 'string', description: 'Baker NPC name' },
      { name: 'wordCount', type: 'number', description: 'Words to use', defaultValue: 4 },
    ],
    titleTemplate: 'Ordering at {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and order from {{ownerName}} using food and shopping vocabulary in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Place an order with {{ownerName}}', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use {{wordCount}} food and shopping words', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 3 },
    baseXp: 25,
    tags: ['shopping', 'food', 'conversation', 'beginner', 'business'],
  },
  {
    id: 'price_check',
    name: 'How Much Is That?',
    category: 'shopping',
    difficulty: 'intermediate',
    params: [
      { name: 'businessName', type: 'string', description: 'Shop name', defaultValue: 'the shop' },
      { name: 'ownerName', type: 'string', description: 'Shop owner NPC' },
      { name: 'wordCount', type: 'number', description: 'Number and shopping words to use', defaultValue: 6 },
    ],
    titleTemplate: 'Prices at {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and ask {{ownerName}} about prices using numbers and shopping vocabulary in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Ask {{ownerName}} about prices', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use {{wordCount}} number and shopping words', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 6 },
    baseXp: 35,
    tags: ['shopping', 'numbers', 'vocabulary', 'intermediate', 'business'],
  },
  {
    id: 'shopping_errands',
    name: 'Shopping Errands',
    category: 'shopping',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC who needs items' },
      { name: 'itemCount', type: 'number', description: 'Items to collect', defaultValue: 3 },
    ],
    titleTemplate: 'Errands for {{npcName}}',
    descriptionTemplate: '{{npcName}} gives you a shopping list in {{targetLanguage}}. Buy {{itemCount}} items from local businesses and deliver them.',
    questType: 'delivery',
    objectiveTemplates: [
      { type: 'collect_item', descriptionTemplate: 'Buy {{itemCount}} items from local shops', countTemplate: '{{itemCount}}' },
      { type: 'deliver_item', descriptionTemplate: 'Deliver the shopping to {{npcName}}', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use shopping vocabulary while buying items', countTemplate: 5 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 40,
    tags: ['shopping', 'delivery', 'intermediate', 'business'],
  },
  {
    id: 'merchant_talk',
    name: 'Meet the Merchants',
    category: 'shopping',
    difficulty: 'intermediate',
    params: [
      { name: 'npcCount', type: 'number', description: 'Merchants to interview', defaultValue: 3 },
      { name: 'wordCount', type: 'number', description: 'Economic words to learn', defaultValue: 5 },
    ],
    titleTemplate: 'Meet the Merchants ({{npcCount}} interviews)',
    descriptionTemplate: 'Interview {{npcCount}} business owners and learn {{wordCount}} economic vocabulary words in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Interview {{npcCount}} business owners about their trade', countTemplate: '{{npcCount}}' },
      { type: 'collect_vocabulary', descriptionTemplate: 'Learn {{wordCount}} economic and profession words', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 35,
    tags: ['shopping', 'professions', 'vocabulary', 'intermediate', 'business'],
  },

  // ── Grammar ─────────────────────────────────────────────────────────────
  {
    id: 'grammar_drill',
    name: 'Grammar Practice',
    category: 'grammar',
    difficulty: 'intermediate',
    params: [
      { name: 'pattern', type: 'string', description: 'Grammar pattern', defaultValue: 'present tense' },
      { name: 'count', type: 'number', description: 'Correct uses needed', defaultValue: 5 },
    ],
    titleTemplate: 'Practice: {{pattern}}',
    descriptionTemplate: 'Practice the {{pattern}} grammar pattern by using it correctly {{count}} times in conversation.',
    questType: 'grammar',
    objectiveTemplates: [
      { type: 'grammar_pattern', descriptionTemplate: 'Use {{pattern}} correctly {{count}} times', countTemplate: '{{count}}', extra: { pattern: '{{pattern}}' } },
    ],
    completionCriteria: { type: 'grammar_pattern', requiredCount: 5 },
    baseXp: 30,
    tags: ['grammar', 'practice', 'intermediate'],
  },
  {
    id: 'conjugation_challenge',
    name: 'Conjugation Challenge',
    category: 'grammar',
    difficulty: 'advanced',
    params: [
      { name: 'tense', type: 'string', description: 'Verb tense to practice', defaultValue: 'past tense' },
      { name: 'verbCount', type: 'number', description: 'Distinct verbs to conjugate', defaultValue: 8 },
    ],
    titleTemplate: 'Conjugation Challenge: {{tense}}',
    descriptionTemplate: 'Correctly conjugate {{verbCount}} different verbs in the {{tense}} during conversations.',
    questType: 'grammar',
    objectiveTemplates: [
      { type: 'grammar_pattern', descriptionTemplate: 'Conjugate {{verbCount}} verbs in {{tense}}', countTemplate: '{{verbCount}}', extra: { pattern: '{{tense}}' } },
    ],
    completionCriteria: { type: 'grammar_pattern', requiredCount: 8 },
    baseXp: 55,
    tags: ['grammar', 'conjugation', 'advanced'],
  },
  {
    id: 'past_tense_tales',
    name: 'Past Tense Tales',
    category: 'grammar',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC to tell your story to' },
      { name: 'verbCount', type: 'number', description: 'Past tense verbs to use', defaultValue: 5 },
    ],
    titleTemplate: 'Past Tense Tales with {{npcName}}',
    descriptionTemplate: 'Tell {{npcName}} about what you did yesterday, using {{verbCount}} past tense verbs in {{targetLanguage}}.',
    questType: 'grammar',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Tell {{npcName}} about yesterday using past tense', countTemplate: 1, extra: { grammarFocus: 'past_tense', grammarPatterns: '{{targetLanguage}} past tense' } },
      { type: 'use_vocabulary', descriptionTemplate: 'Use {{verbCount}} past tense verb forms correctly', countTemplate: '{{verbCount}}', extra: { grammarPatterns: 'past tense' } },
    ],
    completionCriteria: { type: 'grammar_accuracy', requiredAccuracy: 60, requiredCorrectUses: 5 },
    baseXp: 35,
    tags: ['grammar', 'past_tense', 'conversation', 'intermediate'],
  },
  {
    id: 'question_master',
    name: 'Question Master',
    category: 'grammar',
    difficulty: 'intermediate',
    params: [
      { name: 'questionCount', type: 'number', description: 'Questions to ask', defaultValue: 5 },
    ],
    titleTemplate: 'Question Master ({{questionCount}} questions)',
    descriptionTemplate: 'Ask {{questionCount}} questions to NPCs using correct question formation in {{targetLanguage}}.',
    questType: 'grammar',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Ask NPCs {{questionCount}} questions with correct grammar', countTemplate: '{{questionCount}}', extra: { grammarFocus: 'question_formation', grammarPatterns: 'question formation' } },
    ],
    completionCriteria: { type: 'grammar_accuracy', requiredAccuracy: 60, requiredCorrectUses: 5 },
    baseXp: 35,
    tags: ['grammar', 'questions', 'conversation', 'intermediate'],
  },
  {
    id: 'polite_requests',
    name: 'Polite Requests',
    category: 'grammar',
    difficulty: 'intermediate',
    params: [
      { name: 'shopCount', type: 'number', description: 'Shops to visit', defaultValue: 3 },
    ],
    titleTemplate: 'Polite Requests ({{shopCount}} shops)',
    descriptionTemplate: 'Visit {{shopCount}} different shops and make formal requests using polite grammar forms in {{targetLanguage}}.',
    questType: 'grammar',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Make polite requests at {{shopCount}} different shops', countTemplate: '{{shopCount}}', extra: { grammarFocus: 'formal_register', grammarPatterns: 'formal register,polite forms' } },
      { type: 'use_vocabulary', descriptionTemplate: 'Use formal/polite grammar forms correctly', countTemplate: 3, extra: { grammarPatterns: 'formal register' } },
    ],
    completionCriteria: { type: 'grammar_accuracy', requiredAccuracy: 60, requiredCorrectUses: 3 },
    baseXp: 40,
    tags: ['grammar', 'polite_forms', 'formal', 'shopping', 'intermediate'],
  },

  // ── Translation ─────────────────────────────────────────────────────────
  {
    id: 'translate_signs',
    name: 'Sign Reader',
    category: 'translation',
    difficulty: 'beginner',
    params: [
      { name: 'signCount', type: 'number', description: 'Signs to translate', defaultValue: 4 },
      { name: 'location', type: 'string', description: 'Area with signs', defaultValue: 'town square' },
    ],
    titleTemplate: 'Reading Signs at {{location}}',
    descriptionTemplate: 'Walk around {{location}} and translate {{signCount}} signs from {{targetLanguage}} to English.',
    questType: 'translation',
    objectiveTemplates: [
      { type: 'translation_challenge', descriptionTemplate: 'Translate {{signCount}} signs at {{location}}', countTemplate: '{{signCount}}' },
      { type: 'visit_location', descriptionTemplate: 'Visit {{location}}', countTemplate: 1 },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 4 },
    baseXp: 20,
    tags: ['translation', 'reading', 'beginner'],
  },
  {
    id: 'phrase_translator',
    name: 'Phrase Translator',
    category: 'translation',
    difficulty: 'intermediate',
    params: [
      { name: 'phraseCount', type: 'number', description: 'Phrases to translate', defaultValue: 6 },
    ],
    titleTemplate: 'Translate {{phraseCount}} Phrases',
    descriptionTemplate: 'Translate {{phraseCount}} common phrases between English and {{targetLanguage}}.',
    questType: 'translation_challenge',
    objectiveTemplates: [
      { type: 'translation_challenge', descriptionTemplate: 'Correctly translate {{phraseCount}} phrases', countTemplate: '{{phraseCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 6 },
    baseXp: 35,
    tags: ['translation', 'phrases', 'intermediate'],
  },

  // ── Navigation ──────────────────────────────────────────────────────────
  {
    id: 'follow_the_path',
    name: 'Follow Directions',
    category: 'navigation',
    difficulty: 'intermediate',
    params: [
      { name: 'stepCount', type: 'number', description: 'Direction steps', defaultValue: 4 },
      { name: 'npcName', type: 'string', description: 'Direction-giver NPC' },
    ],
    titleTemplate: 'Follow {{npcName}}\'s Directions',
    descriptionTemplate: '{{npcName}} gives you {{stepCount}} directions in {{targetLanguage}}. Follow them to reach the destination!',
    questType: 'follow_instructions',
    objectiveTemplates: [
      { type: 'follow_directions', descriptionTemplate: 'Follow {{stepCount}} directional steps from {{npcName}}', countTemplate: '{{stepCount}}' },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 35,
    tags: ['navigation', 'directions', 'listening', 'intermediate'],
  },
  {
    id: 'city_navigator',
    name: 'City Navigator',
    category: 'navigation',
    difficulty: 'advanced',
    params: [
      { name: 'destination', type: 'string', description: 'Final destination' },
      { name: 'waypointCount', type: 'number', description: 'Waypoints to pass', defaultValue: 3 },
    ],
    titleTemplate: 'Navigate to {{destination}}',
    descriptionTemplate: 'Navigate through {{waypointCount}} waypoints to reach {{destination}}, asking for directions only in {{targetLanguage}}.',
    questType: 'navigation',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Reach {{destination}} via {{waypointCount}} waypoints', countTemplate: '{{waypointCount}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use directional vocabulary when asking for help', countTemplate: 4 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 55,
    tags: ['navigation', 'directions', 'advanced'],
  },

  // ── Cultural Immersion ──────────────────────────────────────────────────
  {
    id: 'cultural_customs',
    name: 'Local Customs',
    category: 'cultural',
    difficulty: 'intermediate',
    params: [
      { name: 'npcCount', type: 'number', description: 'NPCs to talk to', defaultValue: 3 },
      { name: 'customTopic', type: 'string', description: 'Cultural topic', defaultValue: 'local festivals' },
    ],
    titleTemplate: 'Learning About {{customTopic}}',
    descriptionTemplate: 'Talk to {{npcCount}} locals to learn about {{customTopic}} and pick up cultural vocabulary in {{targetLanguage}}.',
    questType: 'cultural',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Talk to {{npcCount}} locals about {{customTopic}}', countTemplate: '{{npcCount}}' },
      { type: 'learn_new_words', descriptionTemplate: 'Learn cultural vocabulary words', countTemplate: 4 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 6 },
    baseXp: 35,
    tags: ['cultural', 'conversation', 'intermediate'],
  },
  {
    id: 'storyteller',
    name: 'The Storyteller',
    category: 'cultural',
    difficulty: 'advanced',
    params: [
      { name: 'npcName', type: 'string', description: 'Storyteller NPC' },
      { name: 'questionCount', type: 'number', description: 'Comprehension questions', defaultValue: 5 },
    ],
    titleTemplate: '{{npcName}}\'s Tale',
    descriptionTemplate: 'Listen to {{npcName}} tell a traditional story in {{targetLanguage}}, then answer {{questionCount}} comprehension questions.',
    questType: 'listening_comprehension',
    objectiveTemplates: [
      { type: 'listening_comprehension', descriptionTemplate: 'Answer {{questionCount}} questions about {{npcName}}\'s story', countTemplate: '{{questionCount}}' },
    ],
    completionCriteria: { type: 'conversation_engagement', requiredMessages: 5 },
    baseXp: 55,
    tags: ['cultural', 'listening', 'comprehension', 'advanced'],
  },
  {
    id: 'festival_day',
    name: 'Festival Day',
    category: 'cultural',
    difficulty: 'beginner',
    params: [
      { name: 'npcCount', type: 'number', description: 'Villagers to talk to', defaultValue: 3 },
      { name: 'location', type: 'string', description: 'Festival location', defaultValue: 'town square' },
      { name: 'festivalName', type: 'string', description: 'Name of the festival', defaultValue: 'the harvest celebration' },
    ],
    titleTemplate: 'Festival Day: {{festivalName}}',
    descriptionTemplate: 'The village is celebrating {{festivalName}}! Visit {{location}} and talk to {{npcCount}} villagers to learn celebration vocabulary in {{targetLanguage}}.',
    questType: 'cultural',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit the festival at {{location}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Talk to {{npcCount}} villagers about the festival', countTemplate: '{{npcCount}}' },
      { type: 'collect_vocabulary', descriptionTemplate: 'Learn 5 celebration vocabulary words', countTemplate: 5 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 25,
    tags: ['cultural', 'festival', 'celebration', 'beginner'],
  },
  {
    id: 'recipe_quest',
    name: 'Traditional Recipe',
    category: 'cultural',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'Chef or baker NPC' },
      { name: 'dishName', type: 'string', description: 'Name of the dish', defaultValue: 'a traditional dish' },
      { name: 'stepCount', type: 'number', description: 'Cooking instructions to follow', defaultValue: 4 },
    ],
    titleTemplate: 'The Recipe: {{dishName}}',
    descriptionTemplate: 'Visit {{npcName}} to learn how to make {{dishName}}. Follow cooking instructions given entirely in {{targetLanguage}}, practicing imperative verb forms and cooking vocabulary.',
    questType: 'cultural',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Learn the recipe from {{npcName}}', countTemplate: 1 },
      { type: 'follow_directions', descriptionTemplate: 'Follow {{stepCount}} cooking instructions in {{targetLanguage}}', countTemplate: '{{stepCount}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use 5 cooking vocabulary words', countTemplate: 5 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 40,
    tags: ['cultural', 'cooking', 'imperative', 'vocabulary', 'intermediate'],
  },
  {
    id: 'cultural_exchange',
    name: 'Cultural Exchange',
    category: 'cultural',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC interested in cultural exchange' },
      { name: 'topic', type: 'string', description: 'Cultural topic to discuss', defaultValue: 'daily traditions' },
    ],
    titleTemplate: 'Cultural Exchange with {{npcName}}',
    descriptionTemplate: '{{npcName}} is curious about your culture. Share your traditions while learning about theirs in {{targetLanguage}}, practicing both formal and informal registers.',
    questType: 'cultural',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Have a cultural exchange conversation with {{npcName}} about {{topic}}', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use 6 cultural comparison words and phrases', countTemplate: 6 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 8 },
    baseXp: 40,
    tags: ['cultural', 'exchange', 'register', 'conversation', 'intermediate'],
  },
  {
    id: 'proverb_hunter',
    name: 'Proverb Hunter',
    category: 'cultural',
    difficulty: 'advanced',
    params: [
      { name: 'npcCount', type: 'number', description: 'Elders to visit', defaultValue: 3 },
      { name: 'proverbCount', type: 'number', description: 'Proverbs to collect and explain', defaultValue: 3 },
    ],
    titleTemplate: 'Proverb Hunter ({{proverbCount}} proverbs)',
    descriptionTemplate: 'Seek out {{npcCount}} village elders to collect local proverbs in {{targetLanguage}}. Listen carefully and explain the meaning of each proverb.',
    questType: 'cultural',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Visit {{npcCount}} elders to collect proverbs', countTemplate: '{{npcCount}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use 5 idiomatic expressions in conversation', countTemplate: 5 },
      { type: 'listening_comprehension', descriptionTemplate: 'Explain the meaning of {{proverbCount}} proverbs', countTemplate: '{{proverbCount}}' },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 55,
    tags: ['cultural', 'proverbs', 'idioms', 'listening', 'advanced'],
  },
  {
    id: 'traditional_craft',
    name: 'Traditional Craft',
    category: 'cultural',
    difficulty: 'advanced',
    params: [
      { name: 'npcName', type: 'string', description: 'Artisan NPC' },
      { name: 'location', type: 'string', description: 'Workshop location', defaultValue: 'the workshop' },
      { name: 'craftName', type: 'string', description: 'Name of the craft', defaultValue: 'a traditional craft' },
    ],
    titleTemplate: 'The Art of {{craftName}}',
    descriptionTemplate: 'Visit {{npcName}} at {{location}} to learn about {{craftName}}. Observe the process, identify tools and materials, and describe the craft in {{targetLanguage}}.',
    questType: 'cultural',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{npcName}}\'s workshop at {{location}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Learn about {{craftName}} from {{npcName}}', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use 6 craft-related vocabulary words', countTemplate: 6 },
      { type: 'identify_object', descriptionTemplate: 'Identify 4 tools or materials by their names in the target language', countTemplate: 4 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 55,
    tags: ['cultural', 'craft', 'artisan', 'vocabulary', 'advanced'],
  },

  // ── Social / Relationships ─────────────────────────────────────────
  {
    id: 'make_a_friend',
    name: 'Making Friends',
    category: 'social',
    difficulty: 'beginner',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC to befriend' },
      { name: 'conversationCount', type: 'number', description: 'Conversations needed', defaultValue: 3 },
    ],
    titleTemplate: 'Befriend {{npcName}}',
    descriptionTemplate: 'Build a friendship with {{npcName}} by having {{conversationCount}} conversations in {{targetLanguage}}.',
    questType: 'social',
    objectiveTemplates: [
      { type: 'build_friendship', descriptionTemplate: 'Have {{conversationCount}} conversations with {{npcName}}', countTemplate: '{{conversationCount}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use social vocabulary during your conversations', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 25,
    tags: ['social', 'friendship', 'conversation', 'beginner'],
  },
  {
    id: 'gift_giving',
    name: 'A Thoughtful Gift',
    category: 'social',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC to give a gift to' },
    ],
    titleTemplate: 'A Gift for {{npcName}}',
    descriptionTemplate: 'Find a thoughtful gift and present it to {{npcName}} to strengthen your bond.',
    questType: 'social',
    objectiveTemplates: [
      { type: 'collect_item', descriptionTemplate: 'Find a gift for {{npcName}}', countTemplate: 1 },
      { type: 'give_gift', descriptionTemplate: 'Present the gift to {{npcName}}', countTemplate: 1 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 30,
    tags: ['social', 'gift', 'relationship', 'intermediate'],
  },
  {
    id: 'community_welcome',
    name: 'Community Welcome',
    category: 'social',
    difficulty: 'beginner',
    params: [
      { name: 'npcCount', type: 'number', description: 'Community members to meet', defaultValue: 5 },
    ],
    titleTemplate: 'Meet the Community ({{npcCount}} people)',
    descriptionTemplate: 'Introduce yourself to {{npcCount}} community members and learn social vocabulary in {{targetLanguage}}.',
    questType: 'social',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Talk to {{npcCount}} community members', countTemplate: '{{npcCount}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use social and greeting vocabulary', countTemplate: 5 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 25,
    tags: ['social', 'community', 'greeting', 'beginner'],
  },
  {
    id: 'language_partner',
    name: 'Language Partner',
    category: 'social',
    difficulty: 'advanced',
    params: [
      { name: 'npcName', type: 'string', description: 'Language partner NPC' },
      { name: 'turns', type: 'number', description: 'Conversation turns', defaultValue: 8 },
      { name: 'wordCount', type: 'number', description: 'Words to use', defaultValue: 8 },
    ],
    titleTemplate: 'Language Partner: {{npcName}}',
    descriptionTemplate: 'Build a deep friendship with {{npcName}} through sustained {{targetLanguage}} conversation.',
    questType: 'social',
    objectiveTemplates: [
      { type: 'build_friendship', descriptionTemplate: 'Build rapport with {{npcName}} through conversations', countTemplate: 3 },
      { type: 'complete_conversation', descriptionTemplate: 'Have a {{turns}}-turn conversation with {{npcName}}', countTemplate: '{{turns}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use {{wordCount}} vocabulary words while chatting', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 50,
    tags: ['social', 'friendship', 'conversation', 'advanced'],
  },

  // ── Time & Schedule ─────────────────────────────────────────────────────
  {
    id: 'time_keeper',
    name: 'Keep the Appointment',
    category: 'time_activity',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC giving the time' },
      { name: 'location', type: 'string', description: 'Meeting location' },
    ],
    titleTemplate: 'Meet {{npcName}} on Time',
    descriptionTemplate: '{{npcName}} tells you a meeting time in {{targetLanguage}}. Arrive at {{location}} at the correct time.',
    questType: 'time_activity',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Arrive at {{location}} at the time {{npcName}} specified', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use time-related vocabulary', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 30,
    tags: ['time', 'vocabulary', 'listening', 'intermediate'],
  },

  // ── Visual Vocabulary ───────────────────────────────────────────────────
  {
    id: 'name_that_thing',
    name: 'Name That Thing',
    category: 'visual_vocabulary',
    difficulty: 'beginner',
    params: [
      { name: 'objectCount', type: 'number', description: 'Objects to identify', defaultValue: 5 },
    ],
    titleTemplate: 'Name That Thing ({{objectCount}} objects)',
    descriptionTemplate: 'An NPC points to {{objectCount}} objects. Name each one in {{targetLanguage}}.',
    questType: 'visual_vocabulary',
    objectiveTemplates: [
      { type: 'identify_object', descriptionTemplate: 'Correctly name {{objectCount}} objects in the target language', countTemplate: '{{objectCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 15,
    tags: ['visual', 'vocabulary', 'beginner'],
  },

  // ── Business Tour Chain ────────────────────────────────────────────────
  {
    id: 'business_tour_intro',
    name: 'Welcome to the Settlement',
    category: 'exploration',
    difficulty: 'beginner',
    params: [
      { name: 'guideName', type: 'string', description: 'NPC guide who introduces the tour' },
      { name: 'settlementName', type: 'string', description: 'Name of the settlement', defaultValue: 'town' },
    ],
    titleTemplate: 'Welcome to {{settlementName}}',
    descriptionTemplate: '{{guideName}} offers to show you around {{settlementName}}. Meet them to begin a tour of the local businesses.',
    questType: 'conversation',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Meet {{guideName}} to start the tour', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use greeting words in {{targetLanguage}}', countTemplate: 2 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 15,
    tags: ['business_tour', 'beginner', 'exploration', 'greeting', 'chain_start'],
  },
  {
    id: 'business_tour_market',
    name: 'The Local Market',
    category: 'exploration',
    difficulty: 'beginner',
    params: [
      { name: 'merchantName', type: 'string', description: 'Market merchant NPC' },
      { name: 'marketName', type: 'string', description: 'Name of the market', defaultValue: 'the market' },
    ],
    titleTemplate: 'Visit {{marketName}}',
    descriptionTemplate: 'Visit {{marketName}} and meet {{merchantName}}. Learn the names of common goods in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Go to {{marketName}}', countTemplate: 1 },
      { type: 'talk_to_npc', descriptionTemplate: 'Talk to {{merchantName}} about their wares', countTemplate: 1 },
      { type: 'collect_vocabulary', descriptionTemplate: 'Learn 3 market vocabulary words', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 20,
    tags: ['business_tour', 'beginner', 'vocabulary', 'market', 'shopping'],
  },
  {
    id: 'business_tour_tavern',
    name: 'The Local Tavern',
    category: 'exploration',
    difficulty: 'beginner',
    params: [
      { name: 'tavernKeeper', type: 'string', description: 'Tavern keeper NPC' },
      { name: 'tavernName', type: 'string', description: 'Name of the tavern', defaultValue: 'the tavern' },
    ],
    titleTemplate: 'Visit {{tavernName}}',
    descriptionTemplate: 'Stop by {{tavernName}} and chat with {{tavernKeeper}}. Order a drink using {{targetLanguage}} and learn food vocabulary.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Go to {{tavernName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Have a conversation with {{tavernKeeper}}', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use food and drink vocabulary', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 20,
    tags: ['business_tour', 'beginner', 'vocabulary', 'food', 'tavern'],
  },
  {
    id: 'business_tour_workshop',
    name: 'The Workshop',
    category: 'exploration',
    difficulty: 'beginner',
    params: [
      { name: 'crafterName', type: 'string', description: 'Crafter/workshop owner NPC' },
      { name: 'workshopName', type: 'string', description: 'Name of the workshop', defaultValue: 'the workshop' },
    ],
    titleTemplate: 'Visit {{workshopName}}',
    descriptionTemplate: 'Tour {{workshopName}} and talk to {{crafterName}} about their craft. Learn the names of tools and materials in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Go to {{workshopName}}', countTemplate: 1 },
      { type: 'talk_to_npc', descriptionTemplate: 'Ask {{crafterName}} about their craft', countTemplate: 1 },
      { type: 'collect_vocabulary', descriptionTemplate: 'Learn 3 tool and material words', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 20,
    tags: ['business_tour', 'beginner', 'vocabulary', 'crafting', 'workshop'],
  },
  {
    id: 'business_tour_finale',
    name: 'Tour Complete',
    category: 'exploration',
    difficulty: 'beginner',
    params: [
      { name: 'guideName', type: 'string', description: 'NPC guide from the intro' },
      { name: 'settlementName', type: 'string', description: 'Name of the settlement', defaultValue: 'town' },
    ],
    titleTemplate: 'Tour of {{settlementName}} Complete',
    descriptionTemplate: 'Return to {{guideName}} and tell them about your favorite business. Use the vocabulary you learned to describe your experience in {{targetLanguage}}.',
    questType: 'conversation',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Return to {{guideName}} and share your experience', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use vocabulary from the tour in conversation', countTemplate: 5 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 25,
    tags: ['business_tour', 'beginner', 'conversation', 'review', 'chain_end'],
  },

  // ── Multi-stage Quest Chains ────────────────────────────────────────────
  {
    id: 'newcomer_arc',
    name: 'The Newcomer',
    category: 'conversation',
    difficulty: 'beginner',
    params: [
      { name: 'npcName', type: 'string', description: 'Welcoming NPC' },
      { name: 'location', type: 'string', description: 'Starting location', defaultValue: 'town square' },
    ],
    titleTemplate: 'Welcome to Town: {{npcName}}',
    descriptionTemplate: '{{npcName}} welcomes you to {{location}}. Learn basic greetings, then introduce yourself to the neighbors.',
    questType: 'conversation',
    objectiveTemplates: [
      { type: 'complete_conversation', descriptionTemplate: 'Greet {{npcName}} at {{location}}', countTemplate: 1 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use basic greeting vocabulary', countTemplate: 3 },
      { type: 'talk_to_npc', descriptionTemplate: 'Introduce yourself to 2 neighbors', countTemplate: 2 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 30,
    tags: ['newcomer', 'greeting', 'beginner', 'starter'],
  },

  // ── Spaced Repetition Review ────────────────────────────────────────────
  {
    id: 'vocabulary_review',
    name: 'Vocabulary Review',
    category: 'vocabulary',
    difficulty: 'beginner',
    params: [
      { name: 'wordCount', type: 'number', description: 'Words to review', defaultValue: 5 },
      { name: 'reviewWords', type: 'string[]', description: 'Words due for SRS review', defaultValue: [] },
    ],
    titleTemplate: 'Vocabulary Review: {{wordCount}} Words',
    descriptionTemplate: 'Review {{wordCount}} vocabulary words that are due for spaced repetition practice in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'use_vocabulary', descriptionTemplate: 'Use {{wordCount}} review words in conversation', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 15,
    tags: ['vocabulary', 'review', 'srs', 'spaced-repetition'],
  },
  {
    id: 'srs_identify_review',
    name: 'Word Recognition',
    category: 'visual_vocabulary',
    difficulty: 'beginner',
    params: [
      { name: 'wordCount', type: 'number', description: 'Objects to identify', defaultValue: 5 },
      { name: 'reviewWords', type: 'string[]', description: 'Words due for SRS review', defaultValue: [] },
    ],
    titleTemplate: 'Word Recognition: {{wordCount}} Objects',
    descriptionTemplate: 'Identify {{wordCount}} objects by their {{targetLanguage}} names to reinforce your vocabulary.',
    questType: 'visual_vocabulary',
    objectiveTemplates: [
      { type: 'identify_object', descriptionTemplate: 'Identify {{wordCount}} objects using review vocabulary', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 15,
    tags: ['vocabulary', 'visual', 'review', 'srs', 'spaced-repetition'],
  },
  {
    id: 'srs_translation_review',
    name: 'Translation Review',
    category: 'translation',
    difficulty: 'intermediate',
    params: [
      { name: 'wordCount', type: 'number', description: 'Words to translate', defaultValue: 5 },
      { name: 'reviewWords', type: 'string[]', description: 'Words due for SRS review', defaultValue: [] },
    ],
    titleTemplate: 'Translation Review: {{wordCount}} Words',
    descriptionTemplate: 'Translate {{wordCount}} review words between English and {{targetLanguage}} to strengthen recall.',
    questType: 'translation_challenge',
    objectiveTemplates: [
      { type: 'translation_challenge', descriptionTemplate: 'Translate {{wordCount}} review words correctly', countTemplate: '{{wordCount}}' },
    ],
    completionCriteria: { type: 'vocabulary_usage', requiredCount: 5 },
    baseXp: 25,
    tags: ['vocabulary', 'translation', 'review', 'srs', 'spaced-repetition'],
  },
  {
    id: 'srs_mixed_review',
    name: 'Mixed Review Session',
    category: 'vocabulary',
    difficulty: 'intermediate',
    params: [
      { name: 'useCount', type: 'number', description: 'Words to use in conversation', defaultValue: 3 },
      { name: 'identifyCount', type: 'number', description: 'Objects to identify', defaultValue: 3 },
      { name: 'reviewWords', type: 'string[]', description: 'Words due for SRS review', defaultValue: [] },
    ],
    titleTemplate: 'Mixed Review Session',
    descriptionTemplate: 'Practice review words through multiple activities: use {{useCount}} in conversation and identify {{identifyCount}} objects in {{targetLanguage}}.',
    questType: 'vocabulary',
    objectiveTemplates: [
      { type: 'use_vocabulary', descriptionTemplate: 'Use {{useCount}} review words in conversation', countTemplate: '{{useCount}}' },
      { type: 'identify_object', descriptionTemplate: 'Identify {{identifyCount}} objects by their target-language names', countTemplate: '{{identifyCount}}' },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 30,
    tags: ['vocabulary', 'mixed', 'review', 'srs', 'spaced-repetition'],
  },
];

// ── Instantiation ───────────────────────────────────────────────────────────

/**
 * Resolve a template string by replacing {{param}} placeholders.
 */
export function resolveTemplate(template: string, values: Record<string, string | number | string[]>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = values[key];
    if (val === undefined) return `{{${key}}}`;
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  });
}

/**
 * Merge user-provided values with seed defaults, producing a complete values map.
 */
export function resolveParams(seed: QuestSeed, provided: Record<string, string | number | string[]> = {}): Record<string, string | number | string[]> {
  const resolved: Record<string, string | number | string[]> = {};
  for (const p of seed.params) {
    if (provided[p.name] !== undefined) {
      resolved[p.name] = provided[p.name];
    } else if (p.defaultValue !== undefined) {
      resolved[p.name] = p.defaultValue;
    }
  }
  return resolved;
}

/**
 * Instantiate a quest seed into a complete quest record with Prolog content.
 */
export function instantiateSeed(seed: QuestSeed, params: InstantiateParams): InstantiatedQuest {
  const values = resolveParams(seed, params.values);
  // Add targetLanguage to values so templates can reference it
  values.targetLanguage = params.targetLanguage;

  const title = resolveTemplate(seed.titleTemplate, values);
  const description = resolveTemplate(seed.descriptionTemplate, values);

  const objectives = seed.objectiveTemplates.map((ot) => {
    const count = typeof ot.countTemplate === 'string'
      ? Number(resolveTemplate(ot.countTemplate, values)) || 1
      : ot.countTemplate;
    const resolvedExtra: Record<string, any> = {};
    if (ot.extra) {
      for (const [k, v] of Object.entries(ot.extra)) {
        resolvedExtra[k] = typeof v === 'string' ? resolveTemplate(v, values) : v;
      }
    }
    return {
      type: ot.type,
      description: resolveTemplate(ot.descriptionTemplate, values),
      requiredCount: count,
      ...resolvedExtra,
    };
  });

  const completionCriteria: Record<string, any> = {};
  for (const [k, v] of Object.entries(seed.completionCriteria)) {
    completionCriteria[k] = typeof v === 'string' ? resolveTemplate(v, values) : v;
  }
  // Resolve numeric string values back to numbers
  for (const key of Object.keys(completionCriteria)) {
    const val = completionCriteria[key];
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      completionCriteria[key] = Number(val);
    }
  }

  const xpMultiplier = DIFFICULTY_XP_MULTIPLIER[seed.difficulty] || 1;
  const experienceReward = Math.round(seed.baseXp * xpMultiplier);

  // Build quest data for Prolog conversion
  const questData = {
    title,
    description,
    questType: seed.questType,
    difficulty: seed.difficulty,
    status: 'active',
    assignedTo: params.assignedTo,
    assignedBy: params.assignedBy || null,
    targetLanguage: params.targetLanguage,
    objectives,
    completionCriteria,
    experienceReward,
    tags: seed.tags,
  };

  const { prologContent } = convertQuestToProlog(questData);

  return {
    worldId: params.worldId,
    assignedTo: params.assignedTo,
    assignedBy: params.assignedBy,
    title,
    description,
    questType: seed.questType,
    difficulty: seed.difficulty,
    targetLanguage: params.targetLanguage,
    objectives,
    completionCriteria,
    experienceReward,
    rewards: { experience: experienceReward },
    tags: seed.tags,
    status: 'active',
    content: prologContent,
  };
}

// ── Query helpers ───────────────────────────────────────────────────────────

export function getSeedsByCategory(category: string): QuestSeed[] {
  return QUEST_SEEDS.filter(s => s.category === category);
}

export function getSeedsByDifficulty(difficulty: string): QuestSeed[] {
  return QUEST_SEEDS.filter(s => s.difficulty === difficulty);
}

export function getSeedById(id: string): QuestSeed | undefined {
  return QUEST_SEEDS.find(s => s.id === id);
}

export function getSeedCategories(): string[] {
  return Array.from(new Set(QUEST_SEEDS.map(s => s.category)));
}

/**
 * Instantiate a batch of seeds, useful for seeding a new world with starter quests.
 */
export function instantiateStarterQuests(params: InstantiateParams & { npcNames: string[]; locations: string[] }): InstantiatedQuest[] {
  const starterIds = ['greetings_101', 'market_words', 'name_that_thing', 'newcomer_arc'];
  const quests: InstantiatedQuest[] = [];

  for (const id of starterIds) {
    const seed = getSeedById(id);
    if (!seed) continue;

    const values: Record<string, string | number | string[]> = { ...params.values };
    // Auto-assign NPC and location from available pool
    if (!values.npcName && params.npcNames.length > 0) {
      values.npcName = params.npcNames[quests.length % params.npcNames.length];
    }
    if (!values.location && params.locations.length > 0) {
      values.location = params.locations[quests.length % params.locations.length];
    }

    quests.push(instantiateSeed(seed, { ...params, values }));
  }

  return quests;
}

// ── Business Tour Chain ─────────────────────────────────────────────────────

/** IDs of the seeds that make up the business tour chain, in order. */
export const BUSINESS_TOUR_SEED_IDS = [
  'business_tour_intro',
  'business_tour_market',
  'business_tour_tavern',
  'business_tour_workshop',
  'business_tour_finale',
] as const;

export interface BusinessTourParams extends InstantiateParams {
  settlementName: string;
  /** NPC who acts as the tour guide (intro + finale) */
  guideName: string;
  /** Business-specific NPCs — must have at least 3 entries (merchant, tavernKeeper, crafter) */
  businessNpcs: { merchantName: string; tavernKeeper: string; crafterName: string };
  /** Business-specific location names */
  businessLocations?: { marketName?: string; tavernName?: string; workshopName?: string };
}

/**
 * Instantiate the full business tour quest chain.
 * Returns an ordered array of quests ready to be saved as a linear chain.
 * Each quest includes a `questChainOrder` field for chain ordering.
 */
export function instantiateBusinessTourChain(params: BusinessTourParams): (InstantiatedQuest & { questChainOrder: number })[] {
  const valuesByStep: Record<string, Record<string, string | number | string[]>> = {
    business_tour_intro: {
      guideName: params.guideName,
      settlementName: params.settlementName,
    },
    business_tour_market: {
      merchantName: params.businessNpcs.merchantName,
      ...(params.businessLocations?.marketName ? { marketName: params.businessLocations.marketName } : {}),
    },
    business_tour_tavern: {
      tavernKeeper: params.businessNpcs.tavernKeeper,
      ...(params.businessLocations?.tavernName ? { tavernName: params.businessLocations.tavernName } : {}),
    },
    business_tour_workshop: {
      crafterName: params.businessNpcs.crafterName,
      ...(params.businessLocations?.workshopName ? { workshopName: params.businessLocations.workshopName } : {}),
    },
    business_tour_finale: {
      guideName: params.guideName,
      settlementName: params.settlementName,
    },
  };

  const quests: (InstantiatedQuest & { questChainOrder: number })[] = [];

  for (let i = 0; i < BUSINESS_TOUR_SEED_IDS.length; i++) {
    const seedId = BUSINESS_TOUR_SEED_IDS[i];
    const seed = getSeedById(seedId);
    if (!seed) continue;

    const quest = instantiateSeed(seed, {
      worldId: params.worldId,
      targetLanguage: params.targetLanguage,
      assignedTo: params.assignedTo,
      assignedBy: params.assignedBy ?? params.guideName,
      values: { ...params.values, ...valuesByStep[seedId] },
    });

    quests.push({ ...quest, questChainOrder: i });
  }

  return quests;
}
