/**
 * Quest Assignment Engine
 *
 * Generates real playable quests from templates by filling parameters with
 * actual world data (NPCs, locations, vocabulary). Selects templates based
 * on player proficiency, ensures variety, and produces ready-to-play quests.
 */

import {
  QUEST_TEMPLATES,
  type QuestTemplate,
} from '../../shared/language/quest-templates.js';
import type { InsertQuest, Character, Quest, World, Settlement } from '../../shared/schema.js';
import type { PlayerProficiency } from '../../shared/language/utils.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';
import { validateAndNormalizeObjectives } from '../../shared/quest-objective-types.js';

// --- Types ---

export interface WorldContext {
  world: World;
  characters: Character[];
  settlements: Settlement[];
  existingQuests: Quest[];
}

export interface AssignmentOptions {
  count?: number; // Number of quests to generate (default 3)
  playerName: string;
  playerCharacterId?: string;
  proficiency?: PlayerProficiency;
  excludeTemplateIds?: string[]; // Templates to skip
  preferredCategories?: string[]; // Bias toward these categories
}

export interface AssignedQuest {
  templateId: string;
  filledParameters: Record<string, string | number>;
  [key: string]: any;
}

// --- Difficulty mapping ---

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'] as const;

function proficiencyToDifficulty(proficiency?: PlayerProficiency): string {
  if (!proficiency) return 'beginner';
  if (proficiency.overallFluency < 30) return 'beginner';
  if (proficiency.overallFluency < 60) return 'intermediate';
  return 'advanced';
}

function difficultyIndex(d: string): number {
  return DIFFICULTY_ORDER.indexOf(d as any);
}

/** Returns difficulties the player can handle (at-level and one below). */
function allowedDifficulties(proficiency?: PlayerProficiency): string[] {
  const primary = proficiencyToDifficulty(proficiency);
  const idx = difficultyIndex(primary);
  if (idx <= 0) return [primary];
  return [DIFFICULTY_ORDER[idx - 1], primary];
}

// --- Reward scaling ---

function scaleRewards(
  template: QuestTemplate,
  difficulty: string,
): { xp: number; fluency: number } {
  const multiplier =
    difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 1.5 : 2;
  return {
    xp: Math.round(template.rewardScale.xp * multiplier),
    fluency: Math.round(template.rewardScale.fluency * multiplier),
  };
}

// --- Parameter filling ---

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick N unique random elements from an array. */
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

/** Build a display name from a Character's first/last name. */
function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

/** Get NPC characters (non-player, active characters). */
function getNPCs(characters: Character[], playerName: string): Character[] {
  return characters.filter(
    (c) => charName(c) !== playerName && c.status === 'active',
  );
}

/** Get location names from settlements. */
function getLocationNames(settlements: Settlement[]): string[] {
  const names: string[] = [];
  for (const s of settlements) {
    if (s.name) names.push(s.name);
  }
  return names.length > 0 ? names : ['Town Square', 'Market', 'Village Center'];
}

/** Vocabulary categories with sample counts for parameter filling. */
const VOCABULARY_CATEGORIES: Record<string, string[]> = {
  food: ['bread', 'cheese', 'apple', 'fish', 'rice', 'milk', 'egg', 'meat'],
  professions: ['baker', 'farmer', 'blacksmith', 'merchant', 'teacher', 'healer'],
  greetings: ['hello', 'good morning', 'how are you', 'goodbye', 'please', 'thank you'],
  colors: ['red', 'blue', 'green', 'yellow', 'white', 'black'],
  animals: ['cat', 'dog', 'horse', 'bird', 'fish', 'cow'],
  family: ['mother', 'father', 'sister', 'brother', 'child', 'grandmother'],
  directions: ['left', 'right', 'straight', 'turn', 'stop', 'go'],
  time: ['morning', 'afternoon', 'evening', 'today', 'tomorrow', 'yesterday'],
};

/** Grammar patterns by difficulty. */
const GRAMMAR_PATTERNS: Record<string, string[]> = {
  beginner: ['present tense', 'articles', 'plural nouns', 'simple negation'],
  intermediate: ['past tense', 'future tense', 'possessives', 'comparatives'],
  advanced: ['subjunctive', 'conditional', 'relative clauses', 'passive voice'],
};

/**
 * Fill template parameters with real world data.
 */
function fillParameters(
  template: QuestTemplate,
  ctx: WorldContext,
  playerName: string,
  difficulty: string,
): Record<string, string | number> {
  const npcs = getNPCs(ctx.characters, playerName);
  const locations = getLocationNames(ctx.settlements);
  const params: Record<string, string | number> = {};

  for (const param of template.parameters) {
    switch (param.type) {
      case 'npc': {
        const npc = npcs.length > 0 ? pick(npcs) : null;
        params[param.name] = npc ? charName(npc) : 'a friendly local';
        break;
      }
      case 'location': {
        params[param.name] = pick(locations);
        break;
      }
      case 'number': {
        // Scale counts by difficulty
        const base =
          template.objectiveTemplates.find((o) =>
            o.descriptionTemplate.includes(`{{${param.name}}}`),
          )?.requiredCount ?? 3;
        const scale =
          difficulty === 'beginner' ? 0.8 : difficulty === 'advanced' ? 1.5 : 1;
        params[param.name] = Math.max(1, Math.round(base * scale));
        break;
      }
      case 'vocabulary_set': {
        // Pick vocabulary from a relevant category
        const allWords = Object.values(VOCABULARY_CATEGORIES).flat();
        const words = pickN(allWords, 3);
        params[param.name] = words.join(', ');
        break;
      }
      case 'grammar_pattern': {
        const patterns = GRAMMAR_PATTERNS[difficulty] ?? GRAMMAR_PATTERNS.beginner;
        params[param.name] = pick(patterns);
        break;
      }
      case 'category': {
        // Use the param description as a hint for the category
        const hint = param.description.toLowerCase();
        if (hint.includes('food')) {
          params[param.name] = 'food';
        } else if (hint.includes('language')) {
          params[param.name] = ctx.world.targetLanguage || 'the target language';
        } else {
          params[param.name] = param.description;
        }
        break;
      }
      default:
        params[param.name] = param.description;
    }
  }

  return params;
}

// --- Template selection ---

/**
 * Select templates ensuring variety (no consecutive same-category).
 */
function selectTemplates(
  count: number,
  options: AssignmentOptions,
  existingQuests: Quest[],
): QuestTemplate[] {
  const allowed = allowedDifficulties(options.proficiency);
  const exclude = new Set(options.excludeTemplateIds ?? []);

  // Also exclude templates already active for this player
  for (const q of existingQuests) {
    if (
      q.assignedTo === options.playerName &&
      q.status === 'active' &&
      q.tags &&
      Array.isArray(q.tags)
    ) {
      const tid = (q.tags as string[]).find((t) => t.startsWith('template:'));
      if (tid) exclude.add(tid.replace('template:', ''));
    }
  }

  // Filter eligible templates
  let eligible = QUEST_TEMPLATES.filter(
    (t) => allowed.includes(t.difficulty) && !exclude.has(t.id),
  );

  if (eligible.length === 0) {
    // Fallback: allow all difficulties
    eligible = QUEST_TEMPLATES.filter((t) => !exclude.has(t.id));
  }

  if (eligible.length === 0) {
    eligible = [...QUEST_TEMPLATES];
  }

  // Prefer categories if specified
  const preferred = options.preferredCategories;
  if (preferred && preferred.length > 0) {
    const preferredTemplates = eligible.filter((t) =>
      preferred.includes(t.category),
    );
    if (preferredTemplates.length >= count) {
      eligible = preferredTemplates;
    }
  }

  // Select with variety — avoid consecutive same category
  const selected: QuestTemplate[] = [];
  const remaining = [...eligible];
  let lastCategory = '';

  for (let i = 0; i < count && remaining.length > 0; i++) {
    // Prefer different category than last
    const differentCategory = remaining.filter(
      (t) => t.category !== lastCategory,
    );
    const pool = differentCategory.length > 0 ? differentCategory : remaining;

    const choice = pick(pool);
    selected.push(choice);
    lastCategory = choice.category;

    // Remove chosen to avoid duplicates in this batch
    const idx = remaining.indexOf(choice);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  return selected;
}

// --- Description interpolation ---

function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  let result = template;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }
  return result;
}

// --- Objective building ---

function buildObjectives(
  template: QuestTemplate,
  params: Record<string, string | number>,
): any[] {
  return template.objectiveTemplates.map((ot, idx) => {
    const count =
      typeof params[Object.keys(params).find((k) => k.includes('Count') || k === 'count') ?? ''] === 'number'
        ? params[Object.keys(params).find((k) => k.includes('Count') || k === 'count') ?? '']
        : ot.requiredCount;

    return {
      id: `obj_${idx}`,
      type: ot.type,
      description: interpolate(ot.descriptionTemplate, params),
      requiredCount: typeof count === 'number' ? count : ot.requiredCount,
      currentCount: 0,
      completed: false,
    };
  });
}

// --- NPC assignment ---

/**
 * Pick an NPC to be the quest giver. Prefers NPCs with occupations
 * relevant to the quest category.
 */
function pickQuestGiver(
  template: QuestTemplate,
  ctx: WorldContext,
  playerName: string,
): { name: string; id?: string } | null {
  const npcs = getNPCs(ctx.characters, playerName);
  if (npcs.length === 0) return null;

  // Simple heuristic: match occupation keywords to quest category
  const categoryKeywords: Record<string, string[]> = {
    vocabulary: ['teacher', 'scholar', 'librarian', 'merchant'],
    conversation: ['innkeeper', 'merchant', 'bartender', 'mayor'],
    grammar: ['teacher', 'scholar', 'scribe', 'professor'],
    cultural: ['elder', 'priest', 'historian', 'mayor'],
    translation_challenge: ['translator', 'merchant', 'scholar', 'diplomat'],
    scavenger_hunt: ['hunter', 'ranger', 'explorer', 'merchant'],
    visual_vocabulary: ['artist', 'merchant', 'crafter'],
    follow_instructions: ['guard', 'scout', 'ranger'],
    navigation: ['guard', 'scout', 'cartographer', 'merchant'],
    listening_comprehension: ['bard', 'elder', 'storyteller', 'priest'],
    time_activity: ['clockmaker', 'merchant', 'innkeeper'],
  };

  const keywords = categoryKeywords[template.category] ?? [];

  // Try to find an NPC with a matching occupation
  if (keywords.length > 0) {
    const matched = npcs.filter((npc) => {
      const occ = (npc.occupation ?? '').toLowerCase();
      return keywords.some((kw) => occ.includes(kw));
    });
    if (matched.length > 0) {
      const npc = pick(matched);
      return { name: charName(npc), id: npc.id };
    }
  }

  // Fallback: any NPC
  const npc = pick(npcs);
  return { name: charName(npc), id: npc.id };
}

// --- Main engine ---

/**
 * Generate playable quests from templates using real world data.
 *
 * @param ctx - World context with characters, settlements, existing quests
 * @param options - Assignment options (player, proficiency, count, etc.)
 * @returns Array of concrete, ready-to-save quest objects
 */
export function assignQuests(
  ctx: WorldContext,
  options: AssignmentOptions,
): AssignedQuest[] {
  const count = options.count ?? 3;
  const templates = selectTemplates(count, options, ctx.existingQuests);
  const quests: AssignedQuest[] = [];

  for (const template of templates) {
    const difficulty = template.difficulty;
    const params = fillParameters(template, ctx, options.playerName, difficulty);
    const rewards = scaleRewards(template, difficulty);
    const rawObjectives = buildObjectives(template, params);
    const objectives = validateAndNormalizeObjectives(rawObjectives);
    const questGiver = pickQuestGiver(template, ctx, options.playerName);

    const title = template.name;
    const description = interpolate(template.description, params);

    const quest: AssignedQuest = {
      worldId: ctx.world.id,
      assignedTo: options.playerName,
      assignedToCharacterId: options.playerCharacterId ?? null,
      assignedBy: questGiver?.name ?? null,
      assignedByCharacterId: questGiver?.id ?? null,
      title,
      description,
      questType: template.category,
      difficulty,
      targetLanguage: ctx.world.targetLanguage || 'English',
      gameType: 'language-learning',
      objectives,
      progress: { percentComplete: 0 },
      status: 'active',
      experienceReward: rewards.xp,
      rewards: { xp: rewards.xp, fluency: rewards.fluency },
      tags: [`template:${template.id}`, `category:${template.category}`],
      templateId: template.id,
      filledParameters: params,
    };

    // Generate Prolog content
    try {
      const result = convertQuestToProlog(quest as any);
      (quest as any).content = result.prologContent;
    } catch {
      // Non-critical — quest works without Prolog content
    }

    quests.push(quest);
  }

  return quests;
}
