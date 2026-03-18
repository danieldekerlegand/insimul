/**
 * Crafting Quest Generator
 *
 * Generates item-interaction quests with language-gated crafting mechanics.
 * Players must learn material/tool vocabulary in the target language before
 * they can craft items. CEFR level gates which recipes are available.
 *
 * Quest tiers:
 *   - A1 (Beginner): Identify materials, learn tool names, simple 2-ingredient crafts
 *   - A2 (Intermediate): Multi-step crafts with NPC instruction conversations
 *   - B1 (Advanced): Complex recipes requiring translation of written instructions
 *   - B2 (Expert): Freeform crafting with NPC negotiation for rare materials
 */

import type { Character, World, InsertQuest } from '../../shared/schema.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';
import type { CEFRLevel } from '../../shared/assessment/cefr-mapping.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CraftingQuestOptions {
  world: World;
  characters: Character[];
  /** Items available in the world (simplified for quest generation) */
  items: CraftableItemInfo[];
  /** Player name (default: 'Player') */
  assignedTo?: string;
  /** Player's current CEFR level — gates which quests are available */
  playerCefrLevel?: CEFRLevel;
  /** Max quests to return (default: all applicable) */
  maxQuests?: number;
}

export interface CraftableItemInfo {
  id: string;
  name: string;
  itemType: string;
  category?: string | null;
  material?: string | null;
  craftingRecipe?: {
    ingredients: Array<{ itemId: string; quantity: number }>;
    craftTime: number;
    requiredLevel: number;
    requiredStation?: string;
  } | null;
  languageLearningData?: {
    targetWord: string;
    targetLanguage: string;
    pronunciation: string;
    category: string;
  } | null;
}

// ── CEFR level ordering ──────────────────────────────────────────────────────

const CEFR_ORDER: Record<CEFRLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

function cefrAtLeast(player: CEFRLevel, required: CEFRLevel): boolean {
  return CEFR_ORDER[player] >= CEFR_ORDER[required];
}

// ── Craft station → vocabulary mapping ───────────────────────────────────────

export interface StationVocabulary {
  station: string;
  tools: string[];
  materials: string[];
  actions: string[];
}

const STATION_VOCABULARY: StationVocabulary[] = [
  {
    station: 'forge',
    tools: ['hammer', 'anvil', 'tongs', 'bellows'],
    materials: ['iron', 'steel', 'coal', 'ore'],
    actions: ['heat', 'strike', 'shape', 'cool', 'temper'],
  },
  {
    station: 'workbench',
    tools: ['saw', 'chisel', 'plane', 'clamp'],
    materials: ['wood', 'plank', 'nail', 'glue'],
    actions: ['cut', 'carve', 'sand', 'join', 'measure'],
  },
  {
    station: 'loom',
    tools: ['needle', 'scissors', 'shuttle', 'spindle'],
    materials: ['thread', 'cloth', 'wool', 'dye'],
    actions: ['weave', 'spin', 'sew', 'dye', 'stitch'],
  },
  {
    station: 'kitchen',
    tools: ['knife', 'pot', 'pan', 'spoon'],
    materials: ['flour', 'water', 'salt', 'butter'],
    actions: ['mix', 'cook', 'bake', 'stir', 'knead'],
  },
  {
    station: 'alchemy_table',
    tools: ['mortar', 'pestle', 'flask', 'burner'],
    materials: ['herb', 'root', 'crystal', 'oil'],
    actions: ['grind', 'boil', 'distill', 'combine', 'extract'],
  },
];

const DEFAULT_STATION = STATION_VOCABULARY[0]; // forge

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function getActiveNPCs(characters: Character[]): Character[] {
  return characters.filter(c => c.status === 'active');
}

function getCraftableItems(items: CraftableItemInfo[]): CraftableItemInfo[] {
  return items.filter(i => i.craftingRecipe != null);
}

function getStationVocabulary(station?: string): StationVocabulary {
  if (!station) return DEFAULT_STATION;
  return STATION_VOCABULARY.find(s => s.station === station) ?? DEFAULT_STATION;
}

function getMaterialItems(items: CraftableItemInfo[]): CraftableItemInfo[] {
  return items.filter(i => i.itemType === 'material');
}

function getToolItems(items: CraftableItemInfo[]): CraftableItemInfo[] {
  return items.filter(i => i.itemType === 'tool');
}

// ── Quest build context ──────────────────────────────────────────────────────

interface CraftingQuestContext {
  world: World;
  targetLanguage: string;
  assignedTo: string;
  npcs: Character[];
  craftableItems: CraftableItemInfo[];
  materialItems: CraftableItemInfo[];
  toolItems: CraftableItemInfo[];
  allItems: CraftableItemInfo[];
}

// ── A1: Material Identification ──────────────────────────────────────────────

function buildMaterialIdentificationQuest(ctx: CraftingQuestContext): InsertQuest {
  const station = pick(STATION_VOCABULARY);
  const materialNames = station.materials.slice(0, 4).join(', ');

  return {
    worldId: ctx.world.id,
    title: `Know Your Materials: The ${station.station.charAt(0).toUpperCase() + station.station.slice(1)}`,
    description: `Visit the ${station.station} and learn the names of crafting materials in ${ctx.targetLanguage}. Identify ${materialNames} before you can start crafting.`,
    questType: 'vocabulary',
    difficulty: 'beginner',
    cefrLevel: 'A1',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: ctx.npcs.length > 0 ? charName(ctx.npcs[0]) : null,
    assignedByCharacterId: ctx.npcs[0]?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'examine_object',
        description: `Examine 4 materials at the ${station.station} to learn their names in ${ctx.targetLanguage}`,
        requiredCount: 4, currentCount: 0, completed: false,
        vocabularyCategories: ['materials', 'crafting'],
      },
      {
        id: 'obj_1', type: 'identify_object',
        description: `Identify each material by its ${ctx.targetLanguage} name (${materialNames})`,
        requiredCount: 4, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 20,
    rewards: { xp: 20, fluency: 2 },
    tags: ['seed', 'crafting', 'vocabulary', 'materials', 'A1', `station:${station.station}`],
  };
}

// ── A1: Tool Naming ──────────────────────────────────────────────────────────

function buildToolNamingQuest(ctx: CraftingQuestContext): InsertQuest {
  const station = pick(STATION_VOCABULARY);
  const toolNames = station.tools.slice(0, 4).join(', ');

  return {
    worldId: ctx.world.id,
    title: `Tools of the Trade: ${station.station.charAt(0).toUpperCase() + station.station.slice(1)}`,
    description: `Learn the names of tools used at the ${station.station} in ${ctx.targetLanguage}. Point at each tool and name it.`,
    questType: 'vocabulary',
    difficulty: 'beginner',
    cefrLevel: 'A1',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: ctx.npcs.length > 0 ? charName(ctx.npcs[0]) : null,
    assignedByCharacterId: ctx.npcs[0]?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'point_and_name',
        description: `Point at 4 tools and name them in ${ctx.targetLanguage} (${toolNames})`,
        requiredCount: 4, currentCount: 0, completed: false,
        vocabularyCategories: ['tools', 'crafting'],
      },
      {
        id: 'obj_1', type: 'collect_vocabulary',
        description: `Add 4 tool words to your vocabulary bank`,
        requiredCount: 4, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 20,
    rewards: { xp: 20, fluency: 2 },
    tags: ['seed', 'crafting', 'vocabulary', 'tools', 'A1', `station:${station.station}`],
  };
}

// ── A1: Simple Craft ─────────────────────────────────────────────────────────

function buildSimpleCraftQuest(ctx: CraftingQuestContext): InsertQuest {
  const station = pick(STATION_VOCABULARY);
  const materials = pickN(station.materials, 2);

  return {
    worldId: ctx.world.id,
    title: `First Craft: A Simple Creation`,
    description: `Collect ${materials.join(' and ')} and craft your first item at the ${station.station}. Use the material names in ${ctx.targetLanguage} when talking to the craftsperson.`,
    questType: 'vocabulary',
    difficulty: 'beginner',
    cefrLevel: 'A1',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: ctx.npcs.length > 0 ? charName(ctx.npcs[0]) : null,
    assignedByCharacterId: ctx.npcs[0]?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'collect_item',
        description: `Collect crafting materials: ${materials.join(', ')}`,
        requiredCount: 2, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'use_vocabulary',
        description: `Use 2 material names in ${ctx.targetLanguage} when requesting materials`,
        requiredCount: 2, currentCount: 0, completed: false,
        vocabularyCategories: ['materials', 'crafting'],
      },
      {
        id: 'obj_2', type: 'craft_item',
        description: `Craft an item at the ${station.station}`,
        requiredCount: 1, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 30,
    rewards: { xp: 30, fluency: 3 },
    tags: ['seed', 'crafting', 'item-interaction', 'A1', `station:${station.station}`],
  };
}

// ── A2: Apprentice Lesson ────────────────────────────────────────────────────

function buildApprenticeLessonQuest(ctx: CraftingQuestContext): InsertQuest | null {
  if (ctx.npcs.length === 0) return null;

  const mentor = pick(ctx.npcs);
  const station = pick(STATION_VOCABULARY);
  const actions = pickN(station.actions, 3);

  return {
    worldId: ctx.world.id,
    title: `Apprentice to ${charName(mentor)}`,
    description: `${charName(mentor)} will teach you crafting at the ${station.station}. Listen to instructions in ${ctx.targetLanguage} and follow each step. Learn the action words: ${actions.join(', ')}.`,
    questType: 'cultural',
    difficulty: 'intermediate',
    cefrLevel: 'A2',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: charName(mentor),
    assignedByCharacterId: mentor.id,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'talk_to_npc',
        description: `Talk to ${charName(mentor)} to begin the crafting lesson`,
        target: charName(mentor), npcId: mentor.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'collect_vocabulary',
        description: `Learn 3 crafting action words: ${actions.join(', ')}`,
        requiredCount: 3, currentCount: 0, completed: false,
        vocabularyCategories: ['actions', 'crafting'],
      },
      {
        id: 'obj_2', type: 'follow_directions',
        description: `Follow 3 crafting steps given in ${ctx.targetLanguage}`,
        requiredCount: 3, currentCount: 0, completed: false,
      },
      {
        id: 'obj_3', type: 'craft_item',
        description: `Complete the craft under ${charName(mentor)}'s guidance`,
        requiredCount: 1, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 40,
    rewards: { xp: 40, fluency: 4 },
    tags: ['seed', 'crafting', 'conversation', 'item-interaction', 'A2', `station:${station.station}`],
  };
}

// ── A2: Gather and Craft ─────────────────────────────────────────────────────

function buildGatherAndCraftQuest(ctx: CraftingQuestContext): InsertQuest | null {
  if (ctx.npcs.length === 0) return null;

  const npc = pick(ctx.npcs);
  const station = pick(STATION_VOCABULARY);
  const materials = pickN(station.materials, 3);

  return {
    worldId: ctx.world.id,
    title: `${charName(npc)}'s Special Order`,
    description: `${charName(npc)} needs a custom item crafted. Gather ${materials.length} materials and craft the item. You must ask for each material by name in ${ctx.targetLanguage}.`,
    questType: 'vocabulary',
    difficulty: 'intermediate',
    cefrLevel: 'A2',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: charName(npc),
    assignedByCharacterId: npc.id,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'talk_to_npc',
        description: `Talk to ${charName(npc)} to learn what they need`,
        target: charName(npc), npcId: npc.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'collect_item',
        description: `Gather ${materials.length} materials: ${materials.join(', ')}`,
        requiredCount: materials.length, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use ${materials.length} material names in ${ctx.targetLanguage} when gathering`,
        requiredCount: materials.length, currentCount: 0, completed: false,
        vocabularyCategories: ['materials', 'crafting'],
      },
      {
        id: 'obj_3', type: 'craft_item',
        description: `Craft the requested item at the ${station.station}`,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_4', type: 'deliver_item',
        description: `Deliver the crafted item to ${charName(npc)}`,
        target: charName(npc), npcId: npc.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 45,
    rewards: { xp: 45, fluency: 5 },
    tags: ['seed', 'crafting', 'delivery', 'item-interaction', 'A2', `station:${station.station}`],
  };
}

// ── B1: Recipe Translation ───────────────────────────────────────────────────

function buildRecipeTranslationQuest(ctx: CraftingQuestContext): InsertQuest | null {
  if (ctx.npcs.length === 0) return null;

  const npc = pick(ctx.npcs);
  const station = pick(STATION_VOCABULARY);

  return {
    worldId: ctx.world.id,
    title: `The Ancient Recipe`,
    description: `${charName(npc)} found a crafting recipe written entirely in ${ctx.targetLanguage}. Translate the recipe, gather the ingredients, and craft the item described.`,
    questType: 'translation',
    difficulty: 'advanced',
    cefrLevel: 'B1',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: charName(npc),
    assignedByCharacterId: npc.id,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'talk_to_npc',
        description: `Receive the recipe from ${charName(npc)}`,
        target: charName(npc), npcId: npc.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'read_sign',
        description: `Read the recipe written in ${ctx.targetLanguage}`,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'translation_challenge',
        description: `Translate 3 key recipe instructions to understand the steps`,
        requiredCount: 3, currentCount: 0, completed: false,
      },
      {
        id: 'obj_3', type: 'collect_item',
        description: `Gather the ingredients described in the recipe`,
        requiredCount: 3, currentCount: 0, completed: false,
      },
      {
        id: 'obj_4', type: 'craft_item',
        description: `Follow the translated recipe to craft the item`,
        requiredCount: 1, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 55,
    rewards: { xp: 55, fluency: 6 },
    tags: ['seed', 'crafting', 'translation', 'item-interaction', 'B1', `station:${station.station}`],
  };
}

// ── B1: Craft Description ────────────────────────────────────────────────────

function buildCraftDescriptionQuest(ctx: CraftingQuestContext): InsertQuest | null {
  if (ctx.npcs.length < 2) return null;

  const [teacher, student] = pickN(ctx.npcs, 2);
  const station = pick(STATION_VOCABULARY);

  return {
    worldId: ctx.world.id,
    title: `Teach the Craft`,
    description: `Learn a crafting technique from ${charName(teacher)}, then describe the full process to ${charName(student)} in ${ctx.targetLanguage}. Use action verbs and material names.`,
    questType: 'cultural',
    difficulty: 'advanced',
    cefrLevel: 'B1',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: charName(teacher),
    assignedByCharacterId: teacher.id,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'complete_conversation',
        description: `Learn the crafting technique from ${charName(teacher)}`,
        target: charName(teacher), npcId: teacher.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'craft_item',
        description: `Practice the craft yourself at the ${station.station}`,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'complete_conversation',
        description: `Describe the crafting process to ${charName(student)} in ${ctx.targetLanguage}`,
        target: charName(student), npcId: student.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_3', type: 'use_vocabulary',
        description: `Use 6 crafting action verbs and material names in your explanation`,
        requiredCount: 6, currentCount: 0, completed: false,
        vocabularyCategories: ['actions', 'materials', 'crafting'],
      },
    ],
    experienceReward: 50,
    rewards: { xp: 50, fluency: 6 },
    tags: ['seed', 'crafting', 'conversation', 'item-interaction', 'B1', `station:${station.station}`],
  };
}

// ── B2: Master Crafter Negotiation ───────────────────────────────────────────

function buildMasterCrafterQuest(ctx: CraftingQuestContext): InsertQuest | null {
  if (ctx.npcs.length < 2) return null;

  const [merchant, crafter] = pickN(ctx.npcs, 2);
  const station = pick(STATION_VOCABULARY);

  return {
    worldId: ctx.world.id,
    title: `The Master's Commission`,
    description: `Negotiate with ${charName(merchant)} in ${ctx.targetLanguage} to acquire rare materials, then work with ${charName(crafter)} to craft a masterwork item. Requires fluent use of crafting, negotiation, and material vocabulary.`,
    questType: 'cultural',
    difficulty: 'advanced',
    cefrLevel: 'B2',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: charName(crafter),
    assignedByCharacterId: crafter.id,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'talk_to_npc',
        description: `Discuss the commission with ${charName(crafter)}`,
        target: charName(crafter), npcId: crafter.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'haggle_price',
        description: `Negotiate with ${charName(merchant)} in ${ctx.targetLanguage} for rare materials`,
        target: charName(merchant), npcId: merchant.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'collect_item',
        description: `Acquire the rare materials for the masterwork`,
        requiredCount: 3, currentCount: 0, completed: false,
      },
      {
        id: 'obj_3', type: 'use_vocabulary',
        description: `Use 8 crafting and negotiation words in ${ctx.targetLanguage}`,
        requiredCount: 8, currentCount: 0, completed: false,
        vocabularyCategories: ['materials', 'crafting', 'shopping', 'numbers'],
      },
      {
        id: 'obj_4', type: 'craft_item',
        description: `Craft the masterwork item at the ${station.station}`,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_5', type: 'deliver_item',
        description: `Present the masterwork to ${charName(crafter)}`,
        target: charName(crafter), npcId: crafter.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 65,
    rewards: { xp: 65, fluency: 7 },
    tags: ['seed', 'crafting', 'negotiation', 'item-interaction', 'B2', `station:${station.station}`],
  };
}

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate item-interaction quests with language-gated crafting.
 * Quests are filtered by the player's CEFR level — higher proficiency
 * unlocks more complex crafting quests.
 */
export function generateCraftingQuests(options: CraftingQuestOptions): InsertQuest[] {
  const {
    world,
    characters,
    items,
    assignedTo = 'Player',
    playerCefrLevel = 'A1',
    maxQuests,
  } = options;

  const targetLanguage = world.targetLanguage || 'English';
  const npcs = getActiveNPCs(characters);
  const craftableItems = getCraftableItems(items);
  const materialItems = getMaterialItems(items);
  const toolItems = getToolItems(items);

  const ctx: CraftingQuestContext = {
    world,
    targetLanguage,
    assignedTo,
    npcs,
    craftableItems,
    materialItems,
    toolItems,
    allItems: items,
  };

  const quests: InsertQuest[] = [];

  // A1 quests — always available
  quests.push(buildMaterialIdentificationQuest(ctx));
  quests.push(buildToolNamingQuest(ctx));
  quests.push(buildSimpleCraftQuest(ctx));

  // A2 quests — require at least A2
  if (cefrAtLeast(playerCefrLevel, 'A2')) {
    const apprentice = buildApprenticeLessonQuest(ctx);
    if (apprentice) quests.push(apprentice);

    const gather = buildGatherAndCraftQuest(ctx);
    if (gather) quests.push(gather);
  }

  // B1 quests — require at least B1
  if (cefrAtLeast(playerCefrLevel, 'B1')) {
    const recipe = buildRecipeTranslationQuest(ctx);
    if (recipe) quests.push(recipe);

    const describe = buildCraftDescriptionQuest(ctx);
    if (describe) quests.push(describe);
  }

  // B2 quests — require B2
  if (cefrAtLeast(playerCefrLevel, 'B2')) {
    const master = buildMasterCrafterQuest(ctx);
    if (master) quests.push(master);
  }

  // Add Prolog content to all quests
  for (const quest of quests) {
    try {
      const result = convertQuestToProlog(quest as any);
      if (result.prologContent) {
        (quest as any).content = result.prologContent;
      }
    } catch {
      // Non-critical: quest works without Prolog content
    }
  }

  return maxQuests ? quests.slice(0, maxQuests) : quests;
}

/**
 * Get station vocabulary for a given station type.
 */
export function getStationVocab(station: string): StationVocabulary | null {
  return STATION_VOCABULARY.find(s => s.station === station) ?? null;
}

/**
 * Get all available crafting station types.
 */
export function getCraftingStations(): string[] {
  return STATION_VOCABULARY.map(s => s.station);
}

/**
 * Get vocabulary categories for a crafting station.
 */
export function getStationVocabularyCategories(station: string): string[] {
  const sv = getStationVocabulary(station);
  const categories = ['crafting', 'tools', 'materials', 'actions'];
  // Return relevant categories based on whether station has vocabulary
  if (sv.tools.length === 0 && sv.materials.length === 0 && sv.actions.length === 0) {
    return ['crafting'];
  }
  return categories;
}

/**
 * Check if a CEFR level meets the minimum for a quest's cefrLevel gate.
 */
export function meetsLanguageRequirement(playerLevel: CEFRLevel, requiredLevel: CEFRLevel): boolean {
  return cefrAtLeast(playerLevel, requiredLevel);
}
