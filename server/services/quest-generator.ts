/**
 * Quest Generator Service
 *
 * Generates quests based on world type and game type using AI.
 * Supports both language-learning and RPG quest types with appropriate
 * categories, objectives, and rewards.
 */

import { getQuestTypeForWorld, type World } from '../../shared/quest-types/index.js';
import type { InsertQuest } from '../../shared/schema.js';
import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from '../config/gemini.js';

/**
 * Call LLM for quest generation using Gemini API.
 * Returns a JSON string representing a single quest object.
 */
async function callLLM(prompt: string): Promise<string> {
  if (!isGeminiConfigured()) {
    console.warn('[QuestGenerator] Gemini not configured, using fallback quest');
    return JSON.stringify({
      title: 'Explore the World',
      description: 'Discover new locations and meet interesting characters.',
      category: 'exploration',
      difficulty: 'easy',
      objectives: [
        { type: 'reach_location', description: 'Visit the town square', target: 'town_square' }
      ],
      rewards: { experience: 50, gold: 100 }
    });
  }

  const ai = getGenAI();

  const systemPrompt = `You are a quest designer. Generate a single quest as a JSON object with these fields:
{
  "title": "Short quest title",
  "description": "Quest story and goals",
  "category": "combat" | "exploration" | "social" | "crafting" | "vocabulary" | "grammar" | "conversation",
  "difficulty": "beginner" | "easy" | "normal" | "hard" | "expert",
  "objectives": [{ "type": "string", "description": "string", "target": "string", "required": number }],
  "rewards": { "experience": number, "gold": number, "items": [{ "name": "string", "quantity": number }] }
}

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.PRO,
    config: { systemInstruction: systemPrompt },
    contents: prompt,
  });

  if (!response.text) {
    throw new Error('AI service returned empty response');
  }

  let text = response.text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  // Validate it parses as JSON
  JSON.parse(text);
  return text;
}

/**
 * Generate a random category from quest type
 */
function randomCategory(questType: any): string {
  const categories = questType.questCategories;
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex].id;
}

/**
 * Generate a quest for a specific quest type
 */
export async function generateQuestForType(params: {
  world: World;
  questType: any;
  category: string;
  difficulty: string;
  assignedTo?: string;
  assignedBy?: string;
}): Promise<InsertQuest> {
  const { world, questType, category, difficulty, assignedTo, assignedBy } = params;

  // Build AI prompt using quest type's generation prompt
  const basePrompt = questType.generationPrompt(world);
  const fullPrompt = `${basePrompt}

Category: ${category}
Difficulty: ${difficulty}

Generate a quest following the format specified above.`;

  // Call LLM to generate quest
  const response = await callLLM(fullPrompt);
  const questData = JSON.parse(response);

  // Get difficulty scaling
  const scaling = questType.difficultyScaling[difficulty] || { xp: 50, multiplier: 1 };

  // Map to InsertQuest schema
  const quest: InsertQuest = {
    worldId: world.id,
    gameType: questType.id,
    questType: category,
    difficulty,
    title: questData.title,
    description: questData.description,
    objectives: questData.objectives || [],
    experienceReward: questData.rewards?.experience || scaling.xp || 50,
    rewards: questData.rewards || {},
    status: 'available',
    assignedTo: assignedTo || '',
    assignedBy: assignedBy || null,
    targetLanguage: world.targetLanguage || 'English',
  };

  // Add enhanced rewards if present
  if (questData.rewards?.items) {
    quest.itemRewards = questData.rewards.items;
  }
  if (questData.rewards?.skills) {
    quest.skillRewards = questData.rewards.skills;
  }
  if (questData.rewards?.unlocks) {
    quest.unlocks = questData.rewards.unlocks;
  }

  return quest;
}

/**
 * Generate multiple quests for a world
 */
export async function generateQuestsForWorld(
  world: World,
  count: number = 5,
  options?: {
    category?: string;
    difficulty?: string;
    assignedTo?: string;
  }
): Promise<InsertQuest[]> {
  const questType = getQuestTypeForWorld(world);
  const quests: InsertQuest[] = [];

  for (let i = 0; i < count; i++) {
    const category = options?.category || randomCategory(questType);
    const difficulty = options?.difficulty || randomDifficulty(questType);

    const quest = await generateQuestForType({
      world,
      questType,
      category,
      difficulty,
      assignedTo: options?.assignedTo,
    });

    quests.push(quest);
  }

  return quests;
}

/**
 * Generate a random difficulty from quest type
 */
function randomDifficulty(questType: any): string {
  const difficulties = Object.keys(questType.difficultyScaling);
  const randomIndex = Math.floor(Math.random() * difficulties.length);
  return difficulties[randomIndex];
}

/**
 * Generate a quest from dialogue context
 */
export async function generateQuestFromDialogue(params: {
  world: World;
  npcId: string;
  npcName: string;
  playerId: string;
  playerName: string;
  conversationContext: string;
  questHint?: {
    category?: string;
    difficulty?: string;
    objectives?: string[];
  };
}): Promise<InsertQuest> {
  const { world, npcId, npcName, playerId, playerName, conversationContext, questHint } = params;

  const questType = getQuestTypeForWorld(world);

  // Build context-aware prompt
  const category = questHint?.category || randomCategory(questType);
  const difficulty = questHint?.difficulty || 'normal';

  const prompt = `${questType.generationPrompt(world)}

NPC: ${npcName}
Player: ${playerName}
Conversation Context: ${conversationContext}

Category: ${category}
Difficulty: ${difficulty}

Generate a quest that fits naturally with the conversation context. The quest should:
- Be related to topics discussed in the conversation
- Match the NPC's role and personality
- Have 2-3 objectives that make sense in the context
${questHint?.objectives ? `- Include objectives related to: ${questHint.objectives.join(', ')}` : ''}

Return JSON format as specified above.`;

  const response = await callLLM(prompt);
  const questData = JSON.parse(response);

  const scaling = questType.difficultyScaling[difficulty] || { xp: 50, multiplier: 1 };

  const quest: InsertQuest = {
    worldId: world.id,
    gameType: questType.id,
    questType: category,
    difficulty,
    title: questData.title,
    description: questData.description,
    objectives: questData.objectives || [],
    experienceReward: questData.rewards?.experience || scaling.xp || 50,
    rewards: questData.rewards || {},
    status: 'active',
    assignedTo: playerName,
    assignedBy: npcName,
    assignedByCharacterId: npcId,
    targetLanguage: world.targetLanguage || 'English',
    conversationContext,
  };

  // Add enhanced rewards
  if (questData.rewards?.items) {
    quest.itemRewards = questData.rewards.items;
  }
  if (questData.rewards?.skills) {
    quest.skillRewards = questData.rewards.skills;
  }

  return quest;
}
