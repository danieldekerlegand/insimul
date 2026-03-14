/**
 * Language Quest Template Library
 *
 * Pre-authored quest templates parameterized by vocabulary, grammar, difficulty,
 * location, and NPC assignment. AI fills in narrative flavor.
 */

export interface QuestTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectiveTemplates: ObjectiveTemplate[];
  rewardScale: { xp: number; fluency: number };
  parameters: QuestParameter[];
}

export interface ObjectiveTemplate {
  type: string;
  descriptionTemplate: string;  // Uses {{param}} placeholders
  requiredCount: number;
}

export interface QuestParameter {
  name: string;
  type: 'vocabulary_set' | 'grammar_pattern' | 'npc' | 'location' | 'number' | 'category';
  description: string;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // --- Conversation Quests ---
  {
    id: 'greet_the_locals',
    name: 'Greet the Locals',
    category: 'conversation',
    description: 'Practice basic greetings by talking to {{npcCount}} villagers.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'complete_conversation',
        descriptionTemplate: 'Talk to {{npcCount}} different NPCs using greeting words',
        requiredCount: 3,
      },
      {
        type: 'use_vocabulary',
        descriptionTemplate: 'Use at least {{wordCount}} greeting words',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 15, fluency: 2 },
    parameters: [
      { name: 'npcCount', type: 'number', description: 'Number of NPCs to greet' },
      { name: 'wordCount', type: 'number', description: 'Greeting words to use' },
    ],
  },
  {
    id: 'sustained_chat',
    name: 'Deep Conversation',
    category: 'conversation',
    description: 'Have a sustained conversation with {{npcName}} using at least 50% target language.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'sustained_conversation',
        descriptionTemplate: 'Hold a {{turns}}-turn conversation with {{npcName}}',
        requiredCount: 1,
      },
    ],
    rewardScale: { xp: 30, fluency: 4 },
    parameters: [
      { name: 'npcName', type: 'npc', description: 'NPC to converse with' },
      { name: 'turns', type: 'number', description: 'Minimum turns required' },
    ],
  },

  // --- Vocabulary Quests ---
  {
    id: 'food_vocabulary',
    name: 'The Market Run',
    category: 'vocabulary',
    description: 'Visit the market and learn {{wordCount}} food-related words.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'learn_new_words',
        descriptionTemplate: 'Learn {{wordCount}} food words',
        requiredCount: 5,
      },
      {
        type: 'visit_location',
        descriptionTemplate: 'Visit the market',
        requiredCount: 1,
      },
    ],
    rewardScale: { xp: 20, fluency: 3 },
    parameters: [
      { name: 'wordCount', type: 'number', description: 'Words to learn' },
      { name: 'vocabularyCategory', type: 'category', description: 'food' },
    ],
  },
  {
    id: 'profession_vocabulary',
    name: 'Meet the Workers',
    category: 'vocabulary',
    description: 'Talk to NPCs about their jobs and learn profession-related vocabulary.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'use_vocabulary_category',
        descriptionTemplate: 'Use {{wordCount}} profession words in conversations',
        requiredCount: 5,
      },
      {
        type: 'talk_to_npc',
        descriptionTemplate: 'Talk to {{npcCount}} workers about their professions',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 25, fluency: 3 },
    parameters: [
      { name: 'wordCount', type: 'number', description: 'Profession words to use' },
      { name: 'npcCount', type: 'number', description: 'Workers to interview' },
    ],
  },
  {
    id: 'master_words',
    name: 'Word Master',
    category: 'vocabulary',
    description: 'Master {{wordCount}} words by using them correctly multiple times.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'master_words',
        descriptionTemplate: 'Master {{wordCount}} vocabulary words through repeated correct usage',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 35, fluency: 5 },
    parameters: [
      { name: 'wordCount', type: 'number', description: 'Words to master' },
    ],
  },

  // --- Vocabulary Bank Collection Quests ---
  {
    id: 'word_explorer_nouns',
    name: 'Word Explorer: Nouns',
    category: 'vocabulary',
    description: 'Explore the area and collect {{wordCount}} noun words for your vocabulary bank.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'collect_vocabulary',
        descriptionTemplate: 'Collect {{wordCount}} nouns by interacting with objects',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 20, fluency: 3 },
    parameters: [
      { name: 'wordCount', type: 'number', description: 'Nouns to collect' },
      { name: 'vocabularyCategory', type: 'category', description: 'Target vocabulary category (e.g. food, household, animals)' },
    ],
  },
  {
    id: 'color_hunter',
    name: 'Color Hunter',
    category: 'vocabulary',
    description: 'Find {{wordCount}} objects and learn their color words in the target language.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'collect_vocabulary',
        descriptionTemplate: 'Find {{wordCount}} objects and learn their color adjectives',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 15, fluency: 2 },
    parameters: [
      { name: 'wordCount', type: 'number', description: 'Color words to collect' },
    ],
  },
  {
    id: 'action_spotter',
    name: 'Action Spotter',
    category: 'vocabulary',
    description: 'Observe {{npcCount}} NPCs and learn the verbs for what they are doing.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'collect_vocabulary',
        descriptionTemplate: 'Observe NPCs and collect {{wordCount}} action verbs',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 15, fluency: 2 },
    parameters: [
      { name: 'npcCount', type: 'number', description: 'NPCs to observe' },
      { name: 'wordCount', type: 'number', description: 'Action verbs to collect' },
    ],
  },

  // --- Grammar Quests ---
  {
    id: 'grammar_practice',
    name: 'Grammar Drill',
    category: 'grammar',
    description: 'Practice the {{pattern}} grammar pattern in conversation.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'practice_grammar',
        descriptionTemplate: 'Use the {{pattern}} pattern correctly {{count}} times',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 25, fluency: 3 },
    parameters: [
      { name: 'pattern', type: 'grammar_pattern', description: 'Grammar pattern to practice' },
      { name: 'count', type: 'number', description: 'Correct uses required' },
    ],
  },

  // --- Visual / Exploration Quests ---
  {
    id: 'scavenger_hunt',
    name: 'Word Scavenger Hunt',
    category: 'scavenger_hunt',
    description: 'Find {{itemCount}} objects in the world that match their target-language names.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'find_vocabulary_items',
        descriptionTemplate: 'Find {{itemCount}} objects matching their {{language}} names',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 20, fluency: 2 },
    parameters: [
      { name: 'itemCount', type: 'number', description: 'Objects to find' },
      { name: 'language', type: 'category', description: 'Target language name' },
    ],
  },
  {
    id: 'identify_objects',
    name: 'Name That Thing',
    category: 'visual_vocabulary',
    description: 'An NPC points to objects and asks you to name them in the target language.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'identify_object',
        descriptionTemplate: 'Correctly identify {{count}} objects by their target-language names',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 15, fluency: 2 },
    parameters: [
      { name: 'count', type: 'number', description: 'Objects to identify' },
    ],
  },

  {
    id: 'find_by_description',
    name: 'Find Something...',
    category: 'visual_vocabulary',
    description: 'An NPC describes an object by color or property in the target language. Find and click the matching object.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'identify_object',
        descriptionTemplate: 'Find {{count}} objects matching the description: "{{vocabulary_set}}"',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 20, fluency: 2.5 },
    parameters: [
      { name: 'count', type: 'number', description: 'Objects to find' },
      { name: 'vocabulary_set', type: 'vocabulary_set', description: 'Description in target language (e.g., "something blue", "a red fruit")' },
    ],
  },

  // --- Navigation Quests ---
  {
    id: 'follow_directions',
    name: 'Follow the Path',
    category: 'follow_instructions',
    description: 'An NPC gives you directions in the target language. Follow them!',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'follow_directions',
        descriptionTemplate: 'Follow {{stepCount}} steps of directions given in the target language',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 30, fluency: 4 },
    parameters: [
      { name: 'stepCount', type: 'number', description: 'Direction steps to follow' },
    ],
  },
  {
    id: 'navigate_to',
    name: 'Language Navigator',
    category: 'navigation',
    description: 'Navigate the world following target-language directions to reach {{destination}}.',
    difficulty: 'advanced',
    objectiveTemplates: [
      {
        type: 'navigate_language',
        descriptionTemplate: 'Reach {{destination}} following {{language}} directions',
        requiredCount: 1,
      },
    ],
    rewardScale: { xp: 40, fluency: 5 },
    parameters: [
      { name: 'destination', type: 'location', description: 'Destination to reach' },
      { name: 'language', type: 'category', description: 'Target language' },
    ],
  },

  // --- Translation Quests ---
  {
    id: 'translation_test',
    name: 'Translation Challenge',
    category: 'translation_challenge',
    description: 'Translate {{phraseCount}} phrases between English and the target language.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'translation_challenge',
        descriptionTemplate: 'Correctly translate {{phraseCount}} phrases',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 30, fluency: 4 },
    parameters: [
      { name: 'phraseCount', type: 'number', description: 'Phrases to translate' },
    ],
  },

  // --- Listening Quests ---
  {
    id: 'listen_and_learn',
    name: 'Story Time',
    category: 'listening_comprehension',
    description: 'Listen to {{npcName}} tell a story and answer comprehension questions.',
    difficulty: 'advanced',
    objectiveTemplates: [
      {
        type: 'listening_comprehension',
        descriptionTemplate: 'Answer {{questionCount}} comprehension questions about the story',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 40, fluency: 5 },
    parameters: [
      { name: 'npcName', type: 'npc', description: 'Storyteller NPC' },
      { name: 'questionCount', type: 'number', description: 'Questions to answer' },
    ],
  },

  // --- Cultural Quests ---
  {
    id: 'cultural_exploration',
    name: 'Cultural Explorer',
    category: 'cultural',
    description: 'Learn about the local culture by talking to {{npcCount}} NPCs and learning cultural vocabulary.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'complete_conversation',
        descriptionTemplate: 'Talk to {{npcCount}} NPCs about local culture',
        requiredCount: 3,
      },
      {
        type: 'learn_new_words',
        descriptionTemplate: 'Learn {{wordCount}} cultural vocabulary words',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 30, fluency: 4 },
    parameters: [
      { name: 'npcCount', type: 'number', description: 'NPCs to talk to' },
      { name: 'wordCount', type: 'number', description: 'Cultural words to learn' },
    ],
  },

  // --- Time-Based Activities ---
  {
    id: 'time_appointment',
    name: 'Keep the Appointment',
    category: 'time_activity',
    description: 'An NPC tells you a time to meet in the target language. Arrive at {{location}} at the right time.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'visit_location',
        descriptionTemplate: 'Arrive at {{location}} when the NPC told you to meet',
        requiredCount: 1,
      },
      {
        type: 'use_vocabulary',
        descriptionTemplate: 'Use {{count}} time-related words in conversation',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 30, fluency: 4 },
    parameters: [
      { name: 'location', type: 'location', description: 'Meeting location' },
      { name: 'count', type: 'number', description: 'Time vocabulary to use' },
    ],
  },
  {
    id: 'daily_schedule',
    name: 'A Day in the Life',
    category: 'time_activity',
    description: 'Follow a daily schedule described in the target language. Visit {{count}} locations at the right times.',
    difficulty: 'advanced',
    objectiveTemplates: [
      {
        type: 'follow_directions',
        descriptionTemplate: 'Follow the schedule and visit {{count}} locations in order',
        requiredCount: 4,
      },
    ],
    rewardScale: { xp: 45, fluency: 6 },
    parameters: [
      { name: 'count', type: 'number', description: 'Locations to visit in order' },
    ],
  },
];

/**
 * Get templates filtered by difficulty
 */
export function getTemplatesByDifficulty(difficulty: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter(t => t.difficulty === difficulty);
}

/**
 * Get templates filtered by category
 */
export function getTemplatesByCategory(category: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter(t => t.category === category);
}

/**
 * Build an LLM prompt to fill in narrative flavor for a quest template
 */
export function buildQuestNarrativePrompt(
  template: QuestTemplate,
  params: Record<string, string | number>,
  worldContext: { worldName: string; worldType: string; targetLanguage: string }
): string {
  let desc = template.description;
  for (const [key, val] of Object.entries(params)) {
    desc = desc.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }

  return `You are creating a quest for a ${worldContext.worldType} world called "${worldContext.worldName}" where the player is learning ${worldContext.targetLanguage}.

Quest template: "${template.name}"
Category: ${template.category}
Difficulty: ${template.difficulty}
Base description: ${desc}

Please provide:
1. A narrative-flavored quest title (keep it short, evocative)
2. A story-driven quest description (2-3 sentences, integrate the learning objectives into the narrative)
3. Any NPC dialogue that would accompany the quest

Return JSON format:
{
  "title": "...",
  "description": "...",
  "npcDialogue": "..."
}`;
}
