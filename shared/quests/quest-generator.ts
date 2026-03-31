/**
 * Quest Generator Service
 *
 * Generates quests based on world type and game type using an LLM provider.
 * Supports both language-learning and RPG quest types with appropriate
 * categories, objectives, and rewards.
 */

import { getQuestTypeForWorld, getQuestTypesForWorld, type World } from '../quest-types/index.js';
import type { InsertQuest } from '../schema.js';
/** LLM provider interface — implemented server-side by Gemini, etc. */
export interface ILLMProvider {
  generate(prompt: string, options?: { systemPrompt?: string; temperature?: number; maxTokens?: number }): Promise<string>;
}
import type { PlayerProficiency } from '../language/language-utils.js';
import {
  buildObjectiveTypePrompt,
  validateAndNormalizeObjectives,
} from '../quest-objective-types.js';
import { getQuestDifficultyInfo, type CEFRLevel } from '../quest-difficulty.js';
import { cefrToVocabularyRange, getQuestPoolSizes } from '../language/cefr-adaptation.js';
import {
  buildHintGenerationPrompt,
  buildQuestHints,
  type QuestHintsData,
} from '../quest-hints.js';
import {
  type WorldStateContext,
  buildWorldContextPrompt,
  bindQuestToWorldEntities,
} from './world-state-context.js';

/** Default LLM provider — must be set via setDefaultLLMProvider() before use */
let defaultProvider: ILLMProvider | null = null;

/** Set the default LLM provider (called once at startup by the server) */
export function setDefaultLLMProvider(provider: ILLMProvider): void {
  defaultProvider = provider;
}

function getDefaultProvider(): ILLMProvider {
  if (!defaultProvider) {
    throw new Error('No LLM provider configured. Call setDefaultLLMProvider() first.');
  }
  return defaultProvider;
}

/**
 * Call LLM for quest generation.
 * Returns a JSON string representing a single quest object.
 */
async function callLLM(prompt: string, provider?: ILLMProvider): Promise<string> {
  const llm = provider ?? getDefaultProvider();

  const objectiveTypeConstraints = buildObjectiveTypePrompt();
  const hintPrompt = buildHintGenerationPrompt();

  const systemPrompt = `You are a quest designer for a language-learning game. Generate a single quest as a JSON object with these fields:
{
  "title": "Short quest title",
  "description": "Quest story and goals",
  "category": "combat" | "exploration" | "social" | "crafting" | "vocabulary" | "grammar" | "conversation",
  "difficulty": "beginner" | "easy" | "normal" | "hard" | "expert",
  "objectives": [{ "type": "string", "description": "string", "target": "string", "required": number, "hints": [...] }],
  "rewards": { "experience": number, "gold": number, "items": [{ "name": "string", "quantity": number }] }
}

${objectiveTypeConstraints}

${hintPrompt}

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const response = await llm.generate({ prompt, systemPrompt });

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
 * Map player fluency to an appropriate quest difficulty
 */
function fluencyToDifficulty(fluency: number): string {
  if (fluency < 30) return 'beginner';
  if (fluency < 60) return 'intermediate';
  return 'advanced';
}

/**
 * Build a proficiency context string for the LLM prompt
 */
function buildProficiencyPrompt(proficiency: PlayerProficiency): string {
  let prompt = `\nPLAYER PROFICIENCY:
- Fluency: ${proficiency.overallFluency.toFixed(0)}/100
- Vocabulary: ${proficiency.vocabularyCount} words encountered, ${proficiency.masteredWordCount} mastered
- Conversations completed: ${proficiency.conversationCount}`;

  if (proficiency.weakGrammarPatterns.length > 0) {
    prompt += `\n- Weak grammar areas: ${proficiency.weakGrammarPatterns.slice(0, 3).join(', ')}`;
    prompt += `\n- IMPORTANT: Generate quests that target these weak areas to help the player improve.`;
  }
  if (proficiency.strongGrammarPatterns.length > 0) {
    prompt += `\n- Strong grammar areas: ${proficiency.strongGrammarPatterns.slice(0, 3).join(', ')} (avoid over-testing these)`;
  }

  if (proficiency.overallFluency < 20) {
    prompt += `\n- The player is a BEGINNER. Quests should use simple vocabulary (1-3 new words), short conversations, and lots of English support.`;
  } else if (proficiency.overallFluency < 40) {
    prompt += `\n- The player is ELEMENTARY. Quests can introduce 3-5 new words and require short conversations in the target language.`;
  } else if (proficiency.overallFluency < 60) {
    prompt += `\n- The player is INTERMEDIATE. Quests should use 5-8 new words, multi-step objectives, and expect significant target language usage.`;
  } else if (proficiency.overallFluency < 80) {
    prompt += `\n- The player is ADVANCED. Quests should challenge with 8-12 new words, nuanced objectives, and mostly target language.`;
  } else {
    prompt += `\n- The player is NEAR-NATIVE. Quests should be fully in the target language with complex, nuanced objectives.`;
  }

  return prompt;
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
  playerProficiency?: PlayerProficiency;
  worldStateContext?: WorldStateContext;
  provider?: ILLMProvider;
}): Promise<InsertQuest & { hintsData?: QuestHintsData }> {
  const { world, questType, category, difficulty, assignedTo, assignedBy, playerProficiency, worldStateContext, provider } = params;

  // Build AI prompt using quest type's generation prompt
  const basePrompt = questType.generationPrompt(world);
  const proficiencyContext = playerProficiency ? buildProficiencyPrompt(playerProficiency) : '';
  const worldContext = worldStateContext ? buildWorldContextPrompt(worldStateContext) : '';
  const fullPrompt = `${basePrompt}
${proficiencyContext}
${worldContext}
Category: ${category}
Difficulty: ${difficulty}

Generate a quest following the format specified above.`;

  // Call LLM to generate quest
  const response = await callLLM(fullPrompt, provider);
  let questData = JSON.parse(response);

  // Bind generated quest to real world entities
  if (worldStateContext) {
    questData = bindQuestToWorldEntities(questData, worldStateContext);
  }

  // Validate and normalize AI-generated objectives to achievable types
  const rawObjectives = questData.objectives || [];
  const validObjectives = validateAndNormalizeObjectives(rawObjectives);

  if (validObjectives.length === 0 && rawObjectives.length > 0) {
    console.warn(
      `[QuestGenerator] All ${rawObjectives.length} AI-generated objectives were unachievable, adding fallback`,
    );
    validObjectives.push({
      type: 'talk_to_npc',
      description: 'Talk to a local to learn more',
      target: 'any',
      required: 1,
    });
  }

  // Extract AI-generated hints from objectives, then strip them from stored objectives
  const aiHints = extractAIHints(rawObjectives, validObjectives);

  // Get difficulty scaling
  const scaling = questType.difficultyScaling[difficulty] || { xp: 50, multiplier: 1 };

  // Compute CEFR alignment and difficulty indicators
  const difficultyInfo = getQuestDifficultyInfo(difficulty, category, validObjectives.length);

  // Generate a temporary quest ID for hints (will be replaced with real ID after storage)
  const tempQuestId = `temp-${Date.now()}`;
  const hintsData = buildQuestHints(tempQuestId, validObjectives, aiHints);

  // Map to InsertQuest schema
  const quest: InsertQuest & { hintsData?: QuestHintsData } = {
    worldId: world.id,
    gameType: questType.id,
    questType: category,
    difficulty,
    cefrLevel: difficultyInfo.cefrLevel,
    difficultyStars: difficultyInfo.stars,
    estimatedMinutes: difficultyInfo.estimatedMinutes,
    title: questData.title,
    description: questData.description,
    objectives: validObjectives,
    experienceReward: questData.rewards?.experience || scaling.xp || 50,
    rewards: questData.rewards || {},
    status: 'available',
    assignedTo: assignedTo || '',
    assignedBy: assignedBy || null,
    targetLanguage: world.targetLanguage || 'English',
    hintsData,
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
 * Extract AI-generated hints from raw objectives and map to valid objective indices.
 */
function extractAIHints(
  rawObjectives: any[],
  validObjectives: any[],
): Array<{ objectiveIndex: number; hints: Array<{ level: 1 | 2 | 3; text: string }> }> {
  const result: Array<{ objectiveIndex: number; hints: Array<{ level: 1 | 2 | 3; text: string }> }> = [];

  for (let vi = 0; vi < validObjectives.length; vi++) {
    const validObj = validObjectives[vi];
    // Find matching raw objective (by description match since types may have been normalized)
    const rawObj = rawObjectives.find(r =>
      r.description === validObj.description || r.target === validObj.target
    );

    if (rawObj?.hints && Array.isArray(rawObj.hints) && rawObj.hints.length >= 1) {
      result.push({
        objectiveIndex: vi,
        hints: rawObj.hints
          .filter((h: any) => h && typeof h.text === 'string' && h.level >= 1 && h.level <= 3)
          .map((h: any) => ({ level: h.level as 1 | 2 | 3, text: h.text })),
      });
    }

    // Strip hints from the stored objective to avoid bloating the objectives array
    delete validObj.hints;
  }

  return result;
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
    playerProficiency?: PlayerProficiency;
    worldStateContext?: WorldStateContext;
    provider?: ILLMProvider;
  }
): Promise<InsertQuest[]> {
  // Support cross-genre quest mixing: resolve all applicable quest types
  const questTypes = getQuestTypesForWorld(world);
  const quests: InsertQuest[] = [];

  for (let i = 0; i < count; i++) {
    // Rotate across quest types for variety when mixing genres
    const questType = questTypes[i % questTypes.length];
    const category = options?.category || randomCategory(questType);

    let difficulty: string;
    if (options?.difficulty) {
      difficulty = options.difficulty;
    } else if (options?.playerProficiency) {
      // Mix confidence (below-level) and growth (at-level) quests:
      // ~2/3 at the player's level, ~1/3 one tier below for confidence
      const atLevel = fluencyToDifficulty(options.playerProficiency.overallFluency);
      const belowLevel = fluencyToDifficulty(Math.max(0, options.playerProficiency.overallFluency - 30));
      difficulty = (i % 3 === 0 && atLevel !== belowLevel) ? belowLevel : atLevel;
    } else {
      difficulty = randomDifficulty(questType);
    }

    const quest = await generateQuestForType({
      world,
      questType,
      category,
      difficulty,
      assignedTo: options?.assignedTo,
      playerProficiency: options?.playerProficiency,
      worldStateContext: options?.worldStateContext,
      provider: options?.provider,
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
  playerProficiency?: PlayerProficiency;
  worldStateContext?: WorldStateContext;
  questHint?: {
    category?: string;
    difficulty?: string;
    objectives?: string[];
  };
  provider?: ILLMProvider;
}): Promise<InsertQuest & { hintsData?: QuestHintsData }> {
  const { world, npcId, npcName, playerId, playerName, conversationContext, playerProficiency, worldStateContext, questHint, provider } = params;

  const questType = getQuestTypeForWorld(world);

  // Build context-aware prompt
  const category = questHint?.category || randomCategory(questType);
  const difficulty = questHint?.difficulty
    || (playerProficiency ? fluencyToDifficulty(playerProficiency.overallFluency) : 'normal');
  const proficiencyContext = playerProficiency ? buildProficiencyPrompt(playerProficiency) : '';
  const worldContext = worldStateContext ? buildWorldContextPrompt(worldStateContext) : '';

  const prompt = `${questType.generationPrompt(world)}
${proficiencyContext}
${worldContext}
NPC: ${npcName}
Player: ${playerName}
Conversation Context: ${conversationContext}

Category: ${category}
Difficulty: ${difficulty}

Generate a quest that fits naturally with the conversation context. The quest should:
- Be related to topics discussed in the conversation
- Match the NPC's role and personality
- Have 2-3 objectives that make sense in the context
- Reference ACTUAL NPCs and locations from the world context above
${questHint?.objectives ? `- Include objectives related to: ${questHint.objectives.join(', ')}` : ''}
${playerProficiency ? '- Match difficulty to the player\'s current proficiency level' : ''}

Return JSON format as specified above.`;

  const response = await callLLM(prompt, provider);
  let questData = JSON.parse(response);

  // Bind generated quest to real world entities
  if (worldStateContext) {
    questData = bindQuestToWorldEntities(questData, worldStateContext);
  }

  // Validate and normalize AI-generated objectives
  const rawObjectives = questData.objectives || [];
  const validObjectives = validateAndNormalizeObjectives(rawObjectives);

  if (validObjectives.length === 0 && rawObjectives.length > 0) {
    console.warn(
      `[QuestGenerator] All dialogue-quest objectives were unachievable, adding fallback`,
    );
    validObjectives.push({
      type: 'complete_conversation',
      description: `Continue your conversation with ${npcName}`,
      target: npcName,
      required: 3,
    });
  }

  // Extract AI-generated hints
  const aiHints = extractAIHints(rawObjectives, validObjectives);

  const scaling = questType.difficultyScaling[difficulty] || { xp: 50, multiplier: 1 };

  // Compute CEFR alignment and difficulty indicators
  const difficultyInfo = getQuestDifficultyInfo(difficulty, category, validObjectives.length);

  const tempQuestId = `temp-${Date.now()}`;
  const hintsData = buildQuestHints(tempQuestId, validObjectives, aiHints);

  const quest: InsertQuest & { hintsData?: QuestHintsData } = {
    worldId: world.id,
    gameType: questType.id,
    questType: category,
    difficulty,
    cefrLevel: difficultyInfo.cefrLevel,
    difficultyStars: difficultyInfo.stars,
    estimatedMinutes: difficultyInfo.estimatedMinutes,
    title: questData.title,
    description: questData.description,
    objectives: validObjectives,
    experienceReward: questData.rewards?.experience || scaling.xp || 50,
    rewards: questData.rewards || {},
    status: 'active',
    assignedTo: playerName,
    assignedBy: npcName,
    assignedByCharacterId: npcId,
    targetLanguage: world.targetLanguage || 'English',
    conversationContext,
    hintsData,
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

/**
 * Map CEFR level to quest difficulty.
 */
function cefrToDifficulty(level: CEFRLevel): string {
  switch (level) {
    case 'A1': return 'beginner';
    case 'A2': return 'beginner';
    case 'B1': return 'intermediate';
    case 'B2': return 'advanced';
  }
}

/**
 * Generate CEFR-stratified quest pools for world creation.
 * Produces quest batches at each CEFR level with vocabulary drawn from
 * frequency-ranked ranges.
 */
export async function generateCEFRStratifiedQuests(
  world: World,
  options?: {
    worldStateContext?: WorldStateContext;
    provider?: ILLMProvider;
  },
): Promise<InsertQuest[]> {
  const poolSizes = getQuestPoolSizes();
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const allQuests: InsertQuest[] = [];

  for (const level of levels) {
    const count = poolSizes[level];
    const vocabRange = cefrToVocabularyRange(level);
    const difficulty = cefrToDifficulty(level);

    const proficiency: PlayerProficiency = {
      overallFluency: level === 'A1' ? 10 : level === 'A2' ? 30 : level === 'B1' ? 50 : 70,
      vocabularyCount: vocabRange.min,
      masteredWordCount: 0,
      weakGrammarPatterns: [],
      strongGrammarPatterns: [],
      conversationCount: 0,
    };

    const quests = await generateQuestsForWorld(world, count, {
      difficulty,
      playerProficiency: proficiency,
      worldStateContext: options?.worldStateContext,
      provider: options?.provider,
    });

    // Tag each quest with the target CEFR level and vocabulary range
    for (const quest of quests) {
      quest.cefrLevel = level;
      allQuests.push(quest);
    }
  }

  return allQuests;
}
