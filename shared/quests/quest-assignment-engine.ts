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
} from '../language/quest-templates.js';
import type { InsertQuest, Character, Quest, World, Settlement, TimeOfDay, ActivityOccasion } from '../schema.js';
import type { PlayerProficiency } from '../language/utils.js';
import { convertQuestToProlog } from '../prolog/quest-converter.js';
import { validateAndNormalizeObjectives } from '../quest-objective-types.js';
// Inline types from routine system (avoiding server-only import)
interface TimeBlock {
  startHour: number;
  endHour: number;
  location: string;
  locationType: string;
  occasion: string;
}
interface DailyRoutine {
  day: TimeBlock[];
  night: TimeBlock[];
}
interface RoutineData {
  characterId: string;
  routine: DailyRoutine;
  lastUpdated: number;
}
import {
  buildPerformanceRecords,
  computeDifficultyAdjustment,
  applyAdjustment,
  type DifficultyAdjustment,
} from '../quest-difficulty-adjustment.js';

// --- Types ---

export interface WorldContext {
  world: World;
  characters: Character[];
  settlements: Settlement[];
  existingQuests: Quest[];
}

export interface ScheduleContext {
  currentHour: number;  // 0-23
  timeOfDay: TimeOfDay; // 'day' | 'night'
}

export interface AssignmentOptions {
  count?: number; // Number of quests to generate (default 3)
  playerName: string;
  playerCharacterId?: string;
  proficiency?: PlayerProficiency;
  excludeTemplateIds?: string[]; // Templates to skip
  preferredCategories?: string[]; // Bias toward these categories
  schedule?: ScheduleContext; // Current time for NPC availability filtering
  /** Completed quest history for dynamic difficulty adjustment */
  questHistory?: Quest[];
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

/** Returns difficulties the player can handle, adjusted by performance. */
function allowedDifficulties(proficiency?: PlayerProficiency, adjustment?: DifficultyAdjustment): string[] {
  const base = proficiencyToDifficulty(proficiency);
  const primary = adjustment ? adjustment.recommendedDifficulty : base;
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
  weather: ['rain', 'snow', 'wind', 'cloud', 'storm', 'hot', 'cold', 'warm', 'sunny', 'foggy'],
  celebration: ['festival', 'celebration', 'music', 'dance', 'tradition', 'feast'],
  cooking: ['stir', 'boil', 'chop', 'bake', 'recipe', 'ingredient', 'measure', 'taste'],
  crafts: ['hammer', 'thread', 'clay', 'forge', 'weave', 'carve', 'tool', 'workshop'],
};

/** Grammar patterns by difficulty. */
const GRAMMAR_PATTERNS: Record<string, string[]> = {
  beginner: ['present tense', 'articles', 'plural nouns', 'simple negation'],
  intermediate: ['past tense', 'future tense', 'possessives', 'comparatives'],
  advanced: ['subjunctive', 'conditional', 'relative clauses', 'passive voice'],
};

/** Entity data resolved alongside template parameters. */
interface ResolvedEntities {
  /** Map from param name → picked NPC (for 'npc' type params) */
  npcByParam: Map<string, Character>;
  /** Map from param name → picked location name (for 'location' type params) */
  locationByParam: Map<string, string>;
}

interface FillResult {
  params: Record<string, string | number>;
  entities: ResolvedEntities;
  /** True if a required NPC or location was unavailable */
  missingEntity: boolean;
}

/**
 * Fill template parameters with real world data.
 * Also tracks entity IDs so objectives can be enriched with structured fields.
 */
function fillParameters(
  template: QuestTemplate,
  ctx: WorldContext,
  playerName: string,
  difficulty: string,
): FillResult {
  const npcs = getNPCs(ctx.characters, playerName);
  const locations = getLocationNames(ctx.settlements);
  const params: Record<string, string | number> = {};
  const npcByParam = new Map<string, Character>();
  const locationByParam = new Map<string, string>();
  let missingEntity = false;

  for (const param of template.parameters) {
    switch (param.type) {
      case 'npc': {
        const npc = npcs.length > 0 ? pick(npcs) : null;
        if (!npc) {
          missingEntity = true;
          params[param.name] = 'a friendly local';
        } else {
          params[param.name] = charName(npc);
          npcByParam.set(param.name, npc);
        }
        break;
      }
      case 'location': {
        const loc = pick(locations);
        params[param.name] = loc;
        locationByParam.set(param.name, loc);
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

  return { params, entities: { npcByParam, locationByParam }, missingEntity };
}

// --- Template selection ---

/**
 * Select templates ensuring variety (no consecutive same-category).
 */
function selectTemplates(
  count: number,
  options: AssignmentOptions,
  existingQuests: Quest[],
  adjustment?: DifficultyAdjustment,
): QuestTemplate[] {
  const allowed = allowedDifficulties(options.proficiency, adjustment);
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

// --- Objective type → target requirement ---

const NPC_OBJECTIVE_TYPES = new Set([
  'talk_to_npc', 'complete_conversation', 'conversation_initiation',
  'build_friendship', 'give_gift', 'escort_npc', 'introduce_self',
  'ask_for_directions', 'order_food', 'haggle_price',
  'teach_vocabulary', 'teach_phrase', 'listen_and_repeat',
  'listening_comprehension', 'deliver_item',
]);

const LOCATION_OBJECTIVE_TYPES = new Set([
  'visit_location', 'discover_location', 'navigate_language',
  'follow_directions',
]);

// --- Objective building ---

function buildObjectives(
  template: QuestTemplate,
  params: Record<string, string | number>,
  entities: ResolvedEntities,
): any[] {
  // Find the first NPC and location from resolved entities for enrichment
  const firstNpc = entities.npcByParam.size > 0
    ? entities.npcByParam.values().next().value as Character
    : null;
  const firstLocation = entities.locationByParam.size > 0
    ? entities.locationByParam.values().next().value as string
    : null;

  return template.objectiveTemplates.map((ot, idx) => {
    const count =
      typeof params[Object.keys(params).find((k) => k.includes('Count') || k === 'count') ?? ''] === 'number'
        ? params[Object.keys(params).find((k) => k.includes('Count') || k === 'count') ?? '']
        : ot.requiredCount;

    const description = interpolate(ot.descriptionTemplate, params);
    const obj: Record<string, any> = {
      id: `obj_${idx}`,
      type: ot.type,
      description,
      requiredCount: typeof count === 'number' ? count : ot.requiredCount,
      currentCount: 0,
      completed: false,
    };

    // Enrich NPC-based objectives with entity fields
    if (NPC_OBJECTIVE_TYPES.has(ot.type)) {
      // Try to find the NPC param referenced in this objective's description template
      let npc: Character | null = null;
      const npcEntries = Array.from(entities.npcByParam.entries());
      for (let ei = 0; ei < npcEntries.length; ei++) {
        const [paramName, paramNpc] = npcEntries[ei];
        if (ot.descriptionTemplate.includes(`{{${paramName}}}`)) {
          npc = paramNpc;
          break;
        }
      }
      // Fall back to the first available NPC
      if (!npc) npc = firstNpc;
      if (npc) {
        obj.npcId = npc.id;
        obj.npcName = charName(npc);
        obj.target = charName(npc);
      }
    }

    // Enrich location-based objectives with entity fields
    if (LOCATION_OBJECTIVE_TYPES.has(ot.type)) {
      let loc: string | null = null;
      const locEntries = Array.from(entities.locationByParam.entries());
      for (let ei = 0; ei < locEntries.length; ei++) {
        const [paramName, paramLoc] = locEntries[ei];
        if (ot.descriptionTemplate.includes(`{{${paramName}}}`)) {
          loc = paramLoc;
          break;
        }
      }
      if (!loc) loc = firstLocation;
      if (loc) {
        obj.locationName = loc;
        obj.target = loc;
      }
    }

    return obj;
  });
}

// --- NPC schedule helpers ---

/** Occasions where an NPC is unavailable for quest-giving. */
const UNAVAILABLE_OCCASIONS: ActivityOccasion[] = ['sleeping', 'commuting'];

/** Extract routine data from a character's customData. */
export function getNPCRoutine(character: Character): DailyRoutine | null {
  const customData = (character as any).customData as Record<string, any> | undefined;
  const routineData = customData?.routine as RoutineData | undefined;
  return routineData?.routine ?? null;
}

/** Get the time block an NPC occupies at a given hour and time of day. */
export function getNPCTimeBlock(
  character: Character,
  schedule: ScheduleContext,
): TimeBlock | null {
  const routine = getNPCRoutine(character);
  if (!routine) return null;

  const blocks = schedule.timeOfDay === 'day' ? routine.day : routine.night;
  return blocks.find(
    (b) => schedule.currentHour >= b.startHour && schedule.currentHour < b.endHour,
  ) ?? null;
}

/** Check if an NPC is available for quest-giving at the current time. */
export function isNPCAvailable(
  character: Character,
  schedule: ScheduleContext,
): boolean {
  const block = getNPCTimeBlock(character, schedule);
  // No routine data = assume available (backward compatible)
  if (!block) return true;
  return !UNAVAILABLE_OCCASIONS.includes(block.occasion);
}

/** Get available hours when an NPC is not sleeping/commuting (day schedule). */
export function getNPCAvailableHours(character: Character): { start: number; end: number }[] {
  const routine = getNPCRoutine(character);
  if (!routine) return [{ start: 0, end: 24 }];

  const ranges: { start: number; end: number }[] = [];
  for (const block of routine.day) {
    if (!UNAVAILABLE_OCCASIONS.includes(block.occasion)) {
      ranges.push({ start: block.startHour, end: block.endHour });
    }
  }
  return ranges;
}

// --- NPC assignment ---

/**
 * Pick an NPC to be the quest giver. Prefers NPCs with occupations
 * relevant to the quest category. When schedule context is provided,
 * filters out NPCs who are sleeping or commuting.
 */
function pickQuestGiver(
  template: QuestTemplate,
  ctx: WorldContext,
  playerName: string,
  schedule?: ScheduleContext,
): { name: string; id?: string; location?: string; availableHours?: { start: number; end: number }[] } | null {
  let npcs = getNPCs(ctx.characters, playerName);
  if (npcs.length === 0) return null;

  // Filter by schedule availability when time context is provided
  if (schedule) {
    const available = npcs.filter((npc) => isNPCAvailable(npc, schedule));
    if (available.length > 0) {
      npcs = available;
    }
    // If all NPCs are unavailable, fall through to use the full list
  }

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
    weather_time: ['farmer', 'fisherman', 'guard', 'merchant', 'innkeeper'],
  };

  const keywords = categoryKeywords[template.category] ?? [];

  // Try to find an NPC with a matching occupation
  let chosen: Character | null = null;
  if (keywords.length > 0) {
    const matched = npcs.filter((npc) => {
      const occ = (npc.occupation ?? '').toLowerCase();
      return keywords.some((kw) => occ.includes(kw));
    });
    if (matched.length > 0) {
      chosen = pick(matched);
    }
  }

  if (!chosen) {
    chosen = pick(npcs);
  }

  const result: { name: string; id?: string; location?: string; availableHours?: { start: number; end: number }[] } = {
    name: charName(chosen),
    id: chosen.id,
  };

  // Attach schedule metadata
  if (schedule) {
    const block = getNPCTimeBlock(chosen, schedule);
    if (block) {
      result.location = block.location;
    }
  }
  result.availableHours = getNPCAvailableHours(chosen);

  return result;
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

  // Compute dynamic difficulty adjustment from quest history
  let adjustment: DifficultyAdjustment | undefined;
  if (options.questHistory && options.questHistory.length > 0) {
    const records = buildPerformanceRecords(options.questHistory);
    const currentDifficulty = proficiencyToDifficulty(options.proficiency) as 'beginner' | 'intermediate' | 'advanced';
    adjustment = computeDifficultyAdjustment(records, currentDifficulty);
  }

  const templates = selectTemplates(count, options, ctx.existingQuests, adjustment);
  const quests: AssignedQuest[] = [];

  for (const template of templates) {
    const difficulty = adjustment ? adjustment.recommendedDifficulty : template.difficulty;
    const { params, entities, missingEntity } = fillParameters(template, ctx, options.playerName, difficulty);

    // Skip quests that require NPC/location entities that don't exist
    const needsNpc = template.parameters.some(p => p.type === 'npc');
    const needsLocation = template.parameters.some(p => p.type === 'location');
    if (missingEntity && needsNpc && entities.npcByParam.size === 0) continue;
    if (needsLocation && entities.locationByParam.size === 0) continue;

    const rewards = scaleRewards(template, difficulty);
    const rawObjectives = buildObjectives(template, params, entities);

    // Apply objective count adjustment if performance warrants it
    let adjustedObjectives = rawObjectives;
    if (adjustment && adjustment.objectiveCountMultiplier !== 1.0) {
      adjustedObjectives = rawObjectives.map(obj => ({
        ...obj,
        requiredCount: Math.max(1, Math.round(obj.requiredCount * adjustment!.objectiveCountMultiplier)),
      }));
    }

    const objectives = validateAndNormalizeObjectives(adjustedObjectives);
    const questGiver = pickQuestGiver(template, ctx, options.playerName, options.schedule);

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
      questGiverSchedule: questGiver ? {
        location: questGiver.location ?? null,
        availableHours: questGiver.availableHours ?? [],
      } : null,
      difficultyAdjustment: adjustment ? {
        direction: adjustment.direction,
        reason: adjustment.reason,
        confidence: adjustment.confidence,
      } : null,
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
