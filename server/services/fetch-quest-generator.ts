/**
 * Fetch Quest Generator
 *
 * Generates diverse fetch quests across three difficulty tiers:
 *   - Beginner: fetch 1 common item from a known location
 *   - Intermediate: fetch 2-3 items from different locations
 *   - Advanced: fetch items requiring NPC interaction first
 *
 * All quests integrate language-learning objectives (vocabulary, conversation).
 * Supports quest chains and scavenger/investigation-style variants.
 */

import type { Character, Settlement, World, InsertQuest } from '../../shared/schema.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface FetchQuestOptions {
  world: World;
  characters: Character[];
  settlements: Settlement[];
  /** Player name (default: 'Player') */
  assignedTo?: string;
  /** Difficulty filter — if omitted, generates all difficulties */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Max quests to return (default: all) */
  maxQuests?: number;
}

interface FetchQuestContext {
  world: World;
  targetLanguage: string;
  assignedTo: string;
  npcs: Character[];
  locations: string[];
}

// ── Template definition ──────────────────────────────────────────────────────

interface FetchQuestTemplate {
  id: string;
  title: (ctx: FetchQuestContext) => string;
  description: (ctx: FetchQuestContext) => string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questType: string;
  buildObjectives: (ctx: FetchQuestContext) => any[];
  xp: number;
  tags: string[];
  /** If set, this quest unlocks a follow-up chain */
  chainUnlocks?: string;
  /** If set, this quest requires a prior chain quest */
  chainRequires?: string;
}

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

function obj(id: string, type: string, description: string, extra: Record<string, any> = {}) {
  return {
    id, type, description,
    requiredCount: 1, currentCount: 0, completed: false,
    ...extra,
  };
}

function getActiveNPCs(characters: Character[]): Character[] {
  return characters.filter(c => c.status === 'active');
}

function getLocationNames(settlements: Settlement[]): string[] {
  const names = settlements.map(s => s.name).filter(Boolean) as string[];
  return names.length > 0 ? names : ['Town Square', 'Market', 'Village Center'];
}

// ── Item pools (thematic groupings for fetch variety) ────────────────────────

const ITEM_POOLS = {
  food: ['bread', 'cheese', 'fruit', 'fish', 'eggs', 'milk', 'rice', 'meat', 'vegetables', 'honey'],
  flowers: ['rose', 'sunflower', 'daisy', 'lily', 'tulip', 'lavender'],
  herbs: ['basil', 'mint', 'rosemary', 'thyme', 'parsley', 'sage'],
  tools: ['hammer', 'saw', 'rope', 'nails', 'bucket', 'shovel'],
  books: ['book', 'map', 'letter', 'journal', 'scroll', 'newspaper'],
  clothing: ['hat', 'scarf', 'shoes', 'gloves', 'coat', 'belt'],
  medicine: ['bandage', 'medicine', 'ointment', 'tonic', 'herbs'],
  crafting: ['wood', 'stone', 'leather', 'thread', 'clay', 'wool', 'iron'],
  treasure: ['coin', 'gem', 'ring', 'amulet', 'key', 'locket'],
  cooking: ['flour', 'sugar', 'butter', 'salt', 'spices', 'oil', 'vinegar'],
} as const;

type ItemCategory = keyof typeof ITEM_POOLS;

function pickItems(category: ItemCategory, count: number): string[] {
  return pickN([...ITEM_POOLS[category]], count);
}

function pickItemsMultiCategory(categories: ItemCategory[], count: number): string[] {
  const pool = categories.flatMap(c => [...ITEM_POOLS[c]]);
  return pickN(pool, count);
}

// ── Vocabulary categories mapped to fetch themes ─────────────────────────────

const FETCH_VOCAB_CATEGORIES: Record<string, string[]> = {
  food: ['food', 'shopping', 'numbers'],
  flowers: ['nature', 'colors'],
  herbs: ['nature', 'food'],
  tools: ['household', 'professions'],
  books: ['education', 'shopping'],
  clothing: ['clothing', 'shopping', 'colors'],
  medicine: ['body', 'health'],
  crafting: ['household', 'professions'],
  treasure: ['shopping', 'numbers'],
  cooking: ['food', 'household'],
};

// ── Template library (30+ templates) ─────────────────────────────────────────

function buildFetchTemplates(): FetchQuestTemplate[] {
  return [
    // ═════════════════════════════════════════════════════════════════════════
    // BEGINNER — single item from known location (10 templates)
    // ═════════════════════════════════════════════════════════════════════════

    {
      id: 'fetch_bread',
      title: () => 'Fresh Bread Run',
      description: (ctx) => `Fetch a loaf of bread from a local shop. Learn the word for "bread" in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'delivery',
      xp: 15,
      tags: ['fetch', 'food', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Go to ${loc}`, { target: loc, locationName: loc }),
          obj('obj_1', 'collect_item', 'Pick up the bread', { target: 'bread' }),
          obj('obj_2', 'use_vocabulary', `Say "bread" in ${ctx.targetLanguage}`, { requiredCount: 1 }),
        ];
      },
    },
    {
      id: 'fetch_flowers',
      title: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return npc ? `Flowers for ${charName(npc)}` : 'A Bouquet of Flowers';
      },
      description: (ctx) => `Find flowers and learn their name in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'delivery',
      xp: 15,
      tags: ['fetch', 'flowers', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const flower = pick([...ITEM_POOLS.flowers]);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        const objectives = [
          obj('obj_0', 'collect_item', `Find a ${flower}`, { target: flower }),
          obj('obj_1', 'use_vocabulary', `Learn the word for "${flower}" in ${ctx.targetLanguage}`, { requiredCount: 1 }),
        ];
        if (npc) {
          objectives.push(obj('obj_2', 'deliver_item', `Give the ${flower} to ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          }));
        }
        return objectives;
      },
    },
    {
      id: 'fetch_letter',
      title: () => 'Letter Carrier',
      description: (ctx) => `Pick up a letter and deliver it. Practice reading in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'delivery',
      xp: 15,
      tags: ['fetch', 'books', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'collect_item', 'Pick up the letter'),
          obj('obj_1', 'read_sign', `Read the letter in ${ctx.targetLanguage}`, { requiredCount: 1 }),
          ...(npc ? [obj('obj_2', 'deliver_item', `Deliver the letter to ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
        ];
      },
    },
    {
      id: 'fetch_medicine',
      title: () => 'Medicine Run',
      description: (ctx) => `Fetch medicine from the local area. Learn health vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'delivery',
      xp: 15,
      tags: ['fetch', 'medicine', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Go to ${loc}`, { target: loc, locationName: loc }),
          obj('obj_1', 'collect_item', 'Pick up the medicine', { target: 'medicine' }),
          obj('obj_2', 'use_vocabulary', `Use a health-related word in ${ctx.targetLanguage}`, { requiredCount: 1 }),
        ];
      },
    },
    {
      id: 'fetch_tool',
      title: () => 'Borrow a Tool',
      description: (ctx) => `Borrow a tool from a neighbor. Learn tool vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'collection',
      xp: 15,
      tags: ['fetch', 'tools', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const tool = pick([...ITEM_POOLS.tools]);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          ...(npc ? [obj('obj_0', 'talk_to_npc', `Ask ${charName(npc)} to borrow a ${tool}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
          obj(npc ? 'obj_1' : 'obj_0', 'collect_item', `Pick up the ${tool}`, { target: tool }),
          obj(npc ? 'obj_2' : 'obj_1', 'use_vocabulary', `Say "${tool}" in ${ctx.targetLanguage}`, { requiredCount: 1 }),
        ];
      },
    },
    {
      id: 'fetch_hat',
      title: () => 'The Missing Hat',
      description: (ctx) => `Find a lost hat. Learn clothing vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'collection',
      xp: 15,
      tags: ['fetch', 'clothing', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Search ${loc}`, { target: loc, locationName: loc }),
          obj('obj_1', 'collect_item', 'Find the hat', { target: 'hat' }),
          obj('obj_2', 'use_vocabulary', `Say "hat" in ${ctx.targetLanguage}`, { requiredCount: 1 }),
        ];
      },
    },
    {
      id: 'fetch_book',
      title: () => 'Library Errand',
      description: (ctx) => `Find and return a book. Practice reading words in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'delivery',
      xp: 15,
      tags: ['fetch', 'books', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'collect_item', 'Find the book', { target: 'book' }),
          obj('obj_1', 'examine_object', `Examine the book title in ${ctx.targetLanguage}`, { requiredCount: 1 }),
          ...(npc ? [obj('obj_2', 'deliver_item', `Return the book to ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
        ];
      },
    },
    {
      id: 'fetch_water',
      title: () => 'Water for the Garden',
      description: (ctx) => `Fetch water from a well or fountain. Learn nature vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'collection',
      xp: 15,
      tags: ['fetch', 'nature', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Go to the water source at ${loc}`, { target: loc, locationName: loc }),
          obj('obj_1', 'collect_item', 'Fill the bucket with water', { target: 'bucket' }),
          obj('obj_2', 'use_vocabulary', `Say "water" in ${ctx.targetLanguage}`, { requiredCount: 1 }),
        ];
      },
    },
    {
      id: 'fetch_gift_simple',
      title: () => 'A Simple Gift',
      description: (ctx) => `Find a small gift for someone special. Learn gift-giving phrases in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'delivery',
      xp: 20,
      tags: ['fetch', 'social', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'collect_item', 'Find a gift item'),
          ...(npc ? [
            obj('obj_1', 'give_gift', `Present the gift to ${charName(npc)}`, { target: charName(npc), npcId: npc.id }),
            obj('obj_2', 'use_vocabulary', `Use a greeting word in ${ctx.targetLanguage} when giving the gift`, { requiredCount: 1 }),
          ] : [
            obj('obj_1', 'use_vocabulary', `Learn a gift-giving phrase in ${ctx.targetLanguage}`, { requiredCount: 1 }),
          ]),
        ];
      },
    },
    {
      id: 'fetch_map',
      title: () => 'Find the Map',
      description: (ctx) => `Find a map of the area. Practice reading location names in ${ctx.targetLanguage}.`,
      difficulty: 'beginner',
      questType: 'collection',
      xp: 15,
      tags: ['fetch', 'navigation', 'beginner', 'single-item'],
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Search for a map at ${loc}`, { target: loc, locationName: loc }),
          obj('obj_1', 'collect_item', 'Pick up the map', { target: 'map' }),
          obj('obj_2', 'read_sign', `Read location names on the map in ${ctx.targetLanguage}`, { requiredCount: 1 }),
        ];
      },
    },

    // ═════════════════════════════════════════════════════════════════════════
    // INTERMEDIATE — 2-3 items from different locations (12 templates)
    // ═════════════════════════════════════════════════════════════════════════

    {
      id: 'fetch_picnic_supplies',
      title: () => 'Picnic Preparation',
      description: (ctx) => `Gather supplies for a picnic from different shops. Practice food vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'collection',
      xp: 30,
      tags: ['fetch', 'food', 'intermediate', 'multi-item'],
      buildObjectives: (ctx) => {
        const items = pickItems('food', 3);
        const locs = pickN(ctx.locations, 2);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Visit ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'collect_item', `Collect ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${locs.length + 1}`, 'use_vocabulary', `Use ${items.length} food words in ${ctx.targetLanguage}`, {
            requiredCount: items.length, vocabularyCategories: ['food'],
          }),
        ];
      },
    },
    {
      id: 'fetch_cooking_ingredients',
      title: () => 'Recipe Ingredients',
      description: (ctx) => `Gather ingredients for a recipe from around town. Learn cooking vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'collection',
      xp: 30,
      tags: ['fetch', 'cooking', 'intermediate', 'multi-item', 'chain-start'],
      chainUnlocks: 'cooking',
      buildObjectives: (ctx) => {
        const items = pickItems('cooking', 3);
        const locs = pickN(ctx.locations, 2);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Visit ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'collect_item', `Gather cooking ingredients: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${locs.length + 1}`, 'use_vocabulary', `Use 3 cooking words in ${ctx.targetLanguage}`, {
            requiredCount: 3, vocabularyCategories: ['food', 'household'],
          }),
        ];
      },
    },
    {
      id: 'fetch_cooking_lesson',
      title: () => 'Cooking Lesson',
      description: (ctx) => `Use the ingredients you gathered to cook with an NPC. Practice ${ctx.targetLanguage} while cooking.`,
      difficulty: 'intermediate',
      questType: 'crafting',
      xp: 35,
      tags: ['fetch', 'cooking', 'intermediate', 'chain-end'],
      chainRequires: 'cooking',
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'talk_to_npc', npc ? `Meet ${charName(npc)} for a cooking lesson` : 'Meet the cook for a lesson', {
            target: npc ? charName(npc) : undefined, npcId: npc?.id,
          }),
          obj('obj_1', 'craft_item', 'Help prepare the meal'),
          obj('obj_2', 'use_vocabulary', `Use 4 cooking and food words in ${ctx.targetLanguage}`, {
            requiredCount: 4, vocabularyCategories: ['food'],
          }),
        ];
      },
    },
    {
      id: 'fetch_repair_supplies',
      title: () => 'Fix-It Supplies',
      description: (ctx) => `Gather tools and materials for a repair. Learn tool vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'collection',
      xp: 30,
      tags: ['fetch', 'tools', 'intermediate', 'multi-item'],
      buildObjectives: (ctx) => {
        const items = pickItems('tools', 2);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        const locs = pickN(ctx.locations, 2);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Visit ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'collect_item', `Collect ${items.join(' and ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          ...(npc ? [obj(`obj_${locs.length + 1}`, 'deliver_item', `Bring supplies to ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
          obj(`obj_${npc ? locs.length + 2 : locs.length + 1}`, 'use_vocabulary', `Use 3 tool words in ${ctx.targetLanguage}`, {
            requiredCount: 3, vocabularyCategories: ['household'],
          }),
        ];
      },
    },
    {
      id: 'fetch_outfit',
      title: () => 'Put Together an Outfit',
      description: (ctx) => `Find clothing items from around town. Learn clothing vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'collection',
      xp: 30,
      tags: ['fetch', 'clothing', 'intermediate', 'multi-item'],
      buildObjectives: (ctx) => {
        const items = pickItems('clothing', 3);
        return [
          obj('obj_0', 'collect_item', `Find: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj('obj_1', 'use_vocabulary', `Name each clothing item in ${ctx.targetLanguage}`, {
            requiredCount: items.length, vocabularyCategories: ['clothing', 'colors'],
          }),
        ];
      },
    },
    {
      id: 'fetch_herbal_remedy',
      title: () => 'Herbal Remedy',
      description: (ctx) => `Gather herbs to make a remedy. Learn plant names in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'collection',
      xp: 30,
      tags: ['fetch', 'herbs', 'intermediate', 'multi-item'],
      buildObjectives: (ctx) => {
        const items = pickItems('herbs', 3);
        const locs = pickN(ctx.locations, 2);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Search for herbs near ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'collect_item', `Gather herbs: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${locs.length + 1}`, 'examine_object', `Examine each herb and learn its ${ctx.targetLanguage} name`, {
            requiredCount: items.length,
          }),
        ];
      },
    },
    {
      id: 'fetch_crafting_materials',
      title: () => 'Crafting Supply Run',
      description: (ctx) => `Collect materials for a crafting project. Learn material names in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'collection',
      xp: 30,
      tags: ['fetch', 'crafting', 'intermediate', 'multi-item', 'chain-start'],
      chainUnlocks: 'crafting',
      buildObjectives: (ctx) => {
        const items = pickItems('crafting', 3);
        const locs = pickN(ctx.locations, 2);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Gather materials at ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'collect_item', `Collect: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${locs.length + 1}`, 'use_vocabulary', `Name 3 materials in ${ctx.targetLanguage}`, {
            requiredCount: 3, vocabularyCategories: ['household'],
          }),
        ];
      },
    },
    {
      id: 'fetch_crafting_project',
      title: () => 'The Crafting Project',
      description: (ctx) => `Use the materials you gathered to craft something. Describe what you make in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'crafting',
      xp: 35,
      tags: ['fetch', 'crafting', 'intermediate', 'chain-end'],
      chainRequires: 'crafting',
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'craft_item', 'Craft an item from your materials'),
          obj('obj_1', 'describe_scene', `Describe what you crafted in ${ctx.targetLanguage}`, { requiredCount: 1 }),
          ...(npc ? [obj('obj_2', 'give_gift', `Show your creation to ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
        ];
      },
    },
    {
      id: 'fetch_delivery_chain',
      title: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return npc ? `Errands for ${charName(npc)}` : 'Multi-Stop Delivery';
      },
      description: (ctx) => `Pick up items from multiple locations and deliver them. Practice shopping phrases in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'delivery',
      xp: 35,
      tags: ['fetch', 'delivery', 'intermediate', 'multi-stop'],
      buildObjectives: (ctx) => {
        const items = pickItemsMultiCategory(['food', 'tools', 'books'], 2);
        const locs = pickN(ctx.locations, 2);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Pick up item at ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'collect_item', `Collect: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          ...(npc ? [obj(`obj_${locs.length + 1}`, 'deliver_item', `Deliver everything to ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
          obj(`obj_${npc ? locs.length + 2 : locs.length + 1}`, 'use_vocabulary', `Use 3 shopping phrases in ${ctx.targetLanguage}`, {
            requiredCount: 3, vocabularyCategories: ['shopping'],
          }),
        ];
      },
    },
    {
      id: 'fetch_market_haul',
      title: () => 'Market Day Haul',
      description: (ctx) => `Buy several items at the market and learn their names in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'collection',
      xp: 30,
      tags: ['fetch', 'food', 'shopping', 'intermediate', 'multi-item'],
      buildObjectives: (ctx) => {
        const items = pickItems('food', 3);
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Go to the market at ${loc}`, { target: loc, locationName: loc }),
          obj('obj_1', 'collect_item', `Buy: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj('obj_2', 'identify_object', `Identify 2 items by their ${ctx.targetLanguage} name`, { requiredCount: 2 }),
          obj('obj_3', 'use_vocabulary', `Use 3 food vocabulary words in ${ctx.targetLanguage}`, {
            requiredCount: 3, vocabularyCategories: ['food', 'numbers'],
          }),
        ];
      },
    },
    {
      id: 'fetch_treasure_map',
      title: () => 'Follow the Treasure Map',
      description: (ctx) => `Follow clues to find hidden items. Read directions in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'exploration',
      xp: 35,
      tags: ['fetch', 'treasure', 'intermediate', 'scavenger'],
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 3);
        const item = pick([...ITEM_POOLS.treasure]);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Search ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'read_sign', `Read treasure clues in ${ctx.targetLanguage}`, { requiredCount: 2 }),
          obj(`obj_${locs.length + 1}`, 'collect_item', `Find the hidden ${item}`, { target: item }),
        ];
      },
    },
    {
      id: 'fetch_care_package',
      title: () => 'Care Package',
      description: (ctx) => `Assemble a care package with different items. Describe each item in ${ctx.targetLanguage}.`,
      difficulty: 'intermediate',
      questType: 'delivery',
      xp: 30,
      tags: ['fetch', 'social', 'intermediate', 'multi-item'],
      buildObjectives: (ctx) => {
        const items = pickItemsMultiCategory(['food', 'medicine', 'books'], 3);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'collect_item', `Collect items for the care package: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj('obj_1', 'examine_object', `Examine each item and learn its ${ctx.targetLanguage} name`, { requiredCount: 2 }),
          ...(npc ? [obj('obj_2', 'deliver_item', `Deliver the care package to ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
        ];
      },
    },

    // ═════════════════════════════════════════════════════════════════════════
    // ADVANCED — require NPC interaction, investigation, scavenger (12 templates)
    // ═════════════════════════════════════════════════════════════════════════

    {
      id: 'fetch_npc_request',
      title: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return npc ? `${charName(npc)}'s Special Request` : 'A Special Request';
      },
      description: (ctx) => `Talk to an NPC to learn what they need, then fetch it. Have the entire conversation in ${ctx.targetLanguage}.`,
      difficulty: 'advanced',
      questType: 'delivery',
      xp: 45,
      tags: ['fetch', 'conversation', 'advanced', 'npc-interaction'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        const items = pickItems('food', 2);
        return [
          obj('obj_0', 'talk_to_npc', npc ? `Talk to ${charName(npc)} to learn what they need` : 'Talk to an NPC to learn their request', {
            target: npc ? charName(npc) : undefined, npcId: npc?.id,
          }),
          obj('obj_1', 'collect_item', `Find: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj('obj_2', 'deliver_item', npc ? `Deliver items to ${charName(npc)}` : 'Deliver the items', {
            target: npc ? charName(npc) : undefined, npcId: npc?.id,
          }),
          obj('obj_3', 'use_vocabulary', `Use 4 vocabulary words in ${ctx.targetLanguage} during the quest`, {
            requiredCount: 4,
          }),
        ];
      },
    },
    {
      id: 'fetch_interview_and_gather',
      title: () => 'Interview & Gather',
      description: (ctx) => `Interview NPCs to learn what ingredients are needed, then gather them. Conduct interviews in ${ctx.targetLanguage}.`,
      difficulty: 'advanced',
      questType: 'collection',
      xp: 50,
      tags: ['fetch', 'conversation', 'advanced', 'npc-interaction', 'multi-npc'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 2);
        const items = pickItems('herbs', 3);
        return [
          ...(npcs.length > 0
            ? npcs.map((npc, i) => obj(`obj_${i}`, 'talk_to_npc', `Interview ${charName(npc)} about needed items`, {
                target: charName(npc), npcId: npc.id,
              }))
            : [obj('obj_0', 'talk_to_npc', 'Interview locals about needed items', { requiredCount: 2 })]),
          obj(`obj_${Math.max(npcs.length, 1)}`, 'collect_item', `Gather: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${Math.max(npcs.length, 1) + 1}`, 'use_vocabulary', `Use 5 vocabulary words in ${ctx.targetLanguage}`, {
            requiredCount: 5,
          }),
        ];
      },
    },
    {
      id: 'fetch_scavenger_basic',
      title: () => 'Town Scavenger Hunt',
      description: (ctx) => `Find hidden items scattered across different locations. Identify each by its ${ctx.targetLanguage} name.`,
      difficulty: 'advanced',
      questType: 'scavenger_hunt',
      xp: 50,
      tags: ['fetch', 'scavenger', 'advanced', 'multi-location'],
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 3);
        const items = pickItemsMultiCategory(['treasure', 'flowers', 'herbs'], 4);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Search ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'collect_item', `Find ${items.length} hidden items`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${locs.length + 1}`, 'identify_object', `Name each item in ${ctx.targetLanguage}`, { requiredCount: items.length }),
        ];
      },
    },
    {
      id: 'fetch_clue_trail',
      title: () => 'Follow the Clues',
      description: (ctx) => `Follow a trail of clues from NPC to NPC, collecting items along the way. All clues are in ${ctx.targetLanguage}.`,
      difficulty: 'advanced',
      questType: 'exploration',
      xp: 50,
      tags: ['fetch', 'investigation', 'advanced', 'clue-trail'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 3);
        const locs = pickN(ctx.locations, 2);
        return [
          ...(npcs.length > 0
            ? npcs.map((npc, i) => obj(`obj_${i}`, 'talk_to_npc', `Get a clue from ${charName(npc)}`, {
                target: charName(npc), npcId: npc.id,
              }))
            : [obj('obj_0', 'talk_to_npc', 'Follow clues from 3 NPCs', { requiredCount: 3 })]),
          ...locs.map((loc, i) => obj(`obj_${Math.max(npcs.length, 1) + i}`, 'visit_location', `Follow a clue to ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${Math.max(npcs.length, 1) + locs.length}`, 'collect_item', 'Collect the final item', { requiredCount: 1 }),
          obj(`obj_${Math.max(npcs.length, 1) + locs.length + 1}`, 'read_sign', `Read ${ctx.targetLanguage} clues`, { requiredCount: 3 }),
        ];
      },
    },
    {
      id: 'fetch_lost_and_found',
      title: () => 'Lost & Found Investigation',
      description: (ctx) => `Someone lost several items. Interview witnesses and search locations to find them. Use ${ctx.targetLanguage} throughout.`,
      difficulty: 'advanced',
      questType: 'exploration',
      xp: 55,
      tags: ['fetch', 'investigation', 'advanced', 'npc-interaction'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 2);
        const locs = pickN(ctx.locations, 3);
        const items = pickItems('treasure', 2);
        return [
          ...(npcs.length > 0
            ? npcs.map((npc, i) => obj(`obj_${i}`, 'talk_to_npc', `Ask ${charName(npc)} if they saw anything`, {
                target: charName(npc), npcId: npc.id,
              }))
            : [obj('obj_0', 'talk_to_npc', 'Interview 2 witnesses', { requiredCount: 2 })]),
          ...locs.map((loc, i) => obj(`obj_${Math.max(npcs.length, 1) + i}`, 'visit_location', `Search ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${Math.max(npcs.length, 1) + locs.length}`, 'collect_item', `Recover lost items: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${Math.max(npcs.length, 1) + locs.length + 1}`, 'complete_conversation', `Describe what you found in ${ctx.targetLanguage}`, {
            requiredCount: 3,
          }),
        ];
      },
    },
    {
      id: 'fetch_negotiate_trade',
      title: () => 'The Art of the Deal',
      description: (ctx) => `Negotiate trades with NPCs to acquire specific items. Practice haggling in ${ctx.targetLanguage}.`,
      difficulty: 'advanced',
      questType: 'collection',
      xp: 50,
      tags: ['fetch', 'commerce', 'advanced', 'haggling'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 2);
        const items = pickItemsMultiCategory(['food', 'crafting'], 3);
        return [
          ...(npcs.length > 0
            ? npcs.map((npc, i) => obj(`obj_${i}`, 'haggle_price', `Negotiate with ${charName(npc)} in ${ctx.targetLanguage}`, {
                target: charName(npc), npcId: npc.id,
              }))
            : [obj('obj_0', 'haggle_price', `Negotiate with 2 merchants in ${ctx.targetLanguage}`, { requiredCount: 2 })]),
          obj(`obj_${Math.max(npcs.length, 1)}`, 'collect_item', `Acquire through trade: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${Math.max(npcs.length, 1) + 1}`, 'use_vocabulary', `Use 5 commerce and number words in ${ctx.targetLanguage}`, {
            requiredCount: 5, vocabularyCategories: ['shopping', 'numbers'],
          }),
        ];
      },
    },
    {
      id: 'fetch_cultural_artifacts',
      title: () => 'Cultural Artifact Hunt',
      description: (ctx) => `Seek cultural artifacts from different locations. Ask locals for help and learn history vocabulary in ${ctx.targetLanguage}.`,
      difficulty: 'advanced',
      questType: 'cultural',
      xp: 55,
      tags: ['fetch', 'cultural', 'advanced', 'scavenger'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 2);
        const locs = pickN(ctx.locations, 3);
        return [
          ...(npcs.length > 0
            ? npcs.map((npc, i) => obj(`obj_${i}`, 'talk_to_npc', `Ask ${charName(npc)} about local artifacts`, {
                target: charName(npc), npcId: npc.id,
              }))
            : [obj('obj_0', 'talk_to_npc', 'Ask locals about cultural artifacts', { requiredCount: 2 })]),
          ...locs.map((loc, i) => obj(`obj_${Math.max(npcs.length, 1) + i}`, 'visit_location', `Explore ${loc} for artifacts`, { target: loc, locationName: loc })),
          obj(`obj_${Math.max(npcs.length, 1) + locs.length}`, 'collect_item', 'Collect 3 cultural artifacts', { requiredCount: 3 }),
          obj(`obj_${Math.max(npcs.length, 1) + locs.length + 1}`, 'examine_object', `Examine artifacts and read their ${ctx.targetLanguage} descriptions`, { requiredCount: 3 }),
        ];
      },
    },
    {
      id: 'fetch_feast_preparation',
      title: () => 'Feast Preparation',
      description: (ctx) => `Help prepare a feast by gathering food, supplies, and decorations from NPCs and locations. Coordinate in ${ctx.targetLanguage}.`,
      difficulty: 'advanced',
      questType: 'collection',
      xp: 55,
      tags: ['fetch', 'food', 'social', 'advanced', 'multi-category'],
      buildObjectives: (ctx) => {
        const food = pickItems('food', 2);
        const decor = pickItems('flowers', 2);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        const locs = pickN(ctx.locations, 2);
        return [
          ...(npc ? [obj('obj_0', 'talk_to_npc', `Get the feast list from ${charName(npc)}`, {
            target: charName(npc), npcId: npc.id,
          })] : []),
          ...locs.map((loc, i) => obj(`obj_${(npc ? 1 : 0) + i}`, 'visit_location', `Shop at ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${(npc ? 1 : 0) + locs.length}`, 'collect_item', `Gather food: ${food.join(', ')}`, {
            requiredCount: food.length, shopItems: food,
          }),
          obj(`obj_${(npc ? 1 : 0) + locs.length + 1}`, 'collect_item', `Gather decorations: ${decor.join(', ')}`, {
            requiredCount: decor.length, shopItems: decor,
          }),
          obj(`obj_${(npc ? 1 : 0) + locs.length + 2}`, 'use_vocabulary', `Use 6 words in ${ctx.targetLanguage} while gathering supplies`, {
            requiredCount: 6, vocabularyCategories: ['food', 'nature', 'numbers'],
          }),
        ];
      },
    },
    {
      id: 'fetch_scavenger_photo',
      title: () => 'Identify & Collect Challenge',
      description: (ctx) => `Find items, identify them by name in ${ctx.targetLanguage}, then collect them. A vocabulary and exploration challenge.`,
      difficulty: 'advanced',
      questType: 'scavenger_hunt',
      xp: 50,
      tags: ['fetch', 'scavenger', 'vocabulary', 'advanced'],
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 3);
        return [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Explore ${loc}`, { target: loc, locationName: loc })),
          obj(`obj_${locs.length}`, 'identify_object', `Identify 5 objects by their ${ctx.targetLanguage} name`, { requiredCount: 5 }),
          obj(`obj_${locs.length + 1}`, 'collect_item', 'Collect 3 identified items', { requiredCount: 3 }),
          obj(`obj_${locs.length + 2}`, 'point_and_name', `Point at and name 3 items in ${ctx.targetLanguage}`, { requiredCount: 3 }),
        ];
      },
    },
    {
      id: 'fetch_secret_recipe',
      title: () => 'The Secret Recipe',
      description: (ctx) => `Each NPC knows one ingredient of a secret recipe. Interview them all in ${ctx.targetLanguage}, then gather the ingredients.`,
      difficulty: 'advanced',
      questType: 'collection',
      xp: 55,
      tags: ['fetch', 'investigation', 'cooking', 'advanced', 'multi-npc'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 3);
        const items = pickItems('cooking', 3);
        return [
          ...(npcs.length > 0
            ? npcs.map((npc, i) => obj(`obj_${i}`, 'talk_to_npc', `Ask ${charName(npc)} for a recipe ingredient`, {
                target: charName(npc), npcId: npc.id,
              }))
            : [obj('obj_0', 'talk_to_npc', 'Interview 3 NPCs about the recipe', { requiredCount: 3 })]),
          obj(`obj_${Math.max(npcs.length, 1)}`, 'collect_item', `Gather ingredients: ${items.join(', ')}`, {
            requiredCount: items.length, shopItems: items,
          }),
          obj(`obj_${Math.max(npcs.length, 1) + 1}`, 'complete_conversation', `Discuss the recipe in ${ctx.targetLanguage}`, { requiredCount: 3 }),
        ];
      },
    },
    {
      id: 'fetch_gift_exchange',
      title: () => 'Gift Exchange',
      description: (ctx) => `Organize a gift exchange: collect items for different NPCs and deliver them with a message in ${ctx.targetLanguage}.`,
      difficulty: 'advanced',
      questType: 'delivery',
      xp: 50,
      tags: ['fetch', 'social', 'advanced', 'multi-delivery'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 2);
        return [
          obj('obj_0', 'collect_item', 'Collect 2 gift items', { requiredCount: 2 }),
          ...(npcs.length >= 2
            ? npcs.map((npc, i) => obj(`obj_${i + 1}`, 'give_gift', `Present a gift to ${charName(npc)} with a message in ${ctx.targetLanguage}`, {
                target: charName(npc), npcId: npc.id,
              }))
            : [obj('obj_1', 'give_gift', 'Present gifts to 2 NPCs', { requiredCount: 2 })]),
          obj(`obj_${Math.max(npcs.length, 1) + 1}`, 'use_vocabulary', `Use 5 social phrases in ${ctx.targetLanguage}`, {
            requiredCount: 5, vocabularyCategories: ['social', 'greetings'],
          }),
        ];
      },
    },
    {
      id: 'fetch_relay_race',
      title: () => 'The Relay Quest',
      description: (ctx) => `NPCs send you from one to the next, each giving you an item to carry forward. Communicate in ${ctx.targetLanguage} at each stop.`,
      difficulty: 'advanced',
      questType: 'delivery',
      xp: 55,
      tags: ['fetch', 'relay', 'advanced', 'multi-npc', 'multi-stop'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 3);
        const locs = pickN(ctx.locations, 3);
        const objectives: any[] = [];
        const stops = Math.min(npcs.length, locs.length, 3);

        if (stops > 0) {
          for (let i = 0; i < stops; i++) {
            objectives.push(obj(`obj_${i * 3}`, 'visit_location', `Go to ${locs[i]}`, { target: locs[i], locationName: locs[i] }));
            objectives.push(obj(`obj_${i * 3 + 1}`, 'talk_to_npc', `Talk to ${charName(npcs[i])}`, {
              target: charName(npcs[i]), npcId: npcs[i].id,
            }));
            objectives.push(obj(`obj_${i * 3 + 2}`, 'collect_item', `Collect the relay item from ${charName(npcs[i])}`));
          }
        } else {
          objectives.push(obj('obj_0', 'visit_location', 'Visit 3 relay locations', { requiredCount: 3 }));
          objectives.push(obj('obj_1', 'talk_to_npc', 'Talk to relay NPCs', { requiredCount: 3 }));
          objectives.push(obj('obj_2', 'collect_item', 'Collect relay items', { requiredCount: 3 }));
        }

        objectives.push(obj(`obj_final`, 'use_vocabulary', `Use 6 words in ${ctx.targetLanguage} across all stops`, {
          requiredCount: 6,
        }));

        return objectives;
      },
    },
  ];
}

// ── Chain linking ─────────────────────────────────────────────────────────────

/**
 * Build quest chain metadata for templates that have chainUnlocks/chainRequires.
 * chainUnlocks names a chain key; chainRequires references the same chain key.
 */
function buildChainMetadata(templates: FetchQuestTemplate[]): Map<string, { chainId: string; order: number }> {
  const chains = new Map<string, { chainId: string; order: number }>();

  // Map chain key → template that unlocks it (the start of the chain)
  const unlocksByKey = new Map<string, string>();
  for (const t of templates) {
    if (t.chainUnlocks) unlocksByKey.set(t.chainUnlocks, t.id);
  }

  // Map chain key → template that requires it (the end of the chain)
  const requiresByKey = new Map<string, string>();
  for (const t of templates) {
    if (t.chainRequires) requiresByKey.set(t.chainRequires, t.id);
  }

  // Match pairs: a chain key present in both maps forms a pair
  unlocksByKey.forEach((startId, key) => {
    const endId = requiresByKey.get(key);
    if (endId) {
      const chainId = `fetch-chain-${key}`;
      chains.set(startId, { chainId, order: 0 });
      chains.set(endId, { chainId, order: 1 });
    }
  });

  return chains;
}

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate diverse fetch quests using world data (NPCs, locations).
 * Returns InsertQuest objects ready for database insertion.
 */
export function generateFetchQuests(options: FetchQuestOptions): InsertQuest[] {
  const { world, characters, settlements, assignedTo = 'Player', difficulty, maxQuests } = options;

  const npcs = getActiveNPCs(characters);
  const locations = getLocationNames(settlements);
  const targetLanguage = world.targetLanguage || 'English';
  const ctx: FetchQuestContext = { world, targetLanguage, assignedTo, npcs, locations };

  const allTemplates = buildFetchTemplates();
  const chainMeta = buildChainMetadata(allTemplates);

  const filtered = difficulty
    ? allTemplates.filter(t => t.difficulty === difficulty)
    : allTemplates;

  const quests: InsertQuest[] = [];

  for (const template of filtered) {
    const giver = npcs.length > 0 ? pick(npcs) : null;
    const chain = chainMeta.get(template.id);

    const quest: InsertQuest = {
      worldId: world.id,
      title: template.title(ctx),
      description: template.description(ctx),
      questType: template.questType,
      difficulty: template.difficulty,
      targetLanguage,
      assignedTo,
      assignedBy: giver ? charName(giver) : null,
      assignedByCharacterId: giver?.id ?? null,
      status: 'available',
      objectives: template.buildObjectives(ctx),
      experienceReward: template.xp,
      rewards: { xp: template.xp, fluency: Math.round(template.xp / 5) },
      tags: ['seed', 'fetch', `difficulty:${template.difficulty}`, ...template.tags],
      ...(chain ? {
        questChainId: chain.chainId,
        questChainOrder: chain.order,
      } : {}),
    };

    // Generate Prolog content
    try {
      const result = convertQuestToProlog(quest as any);
      if (result.prologContent) {
        (quest as any).content = result.prologContent;
      }
    } catch {
      // Non-critical
    }

    quests.push(quest);
  }

  return maxQuests ? quests.slice(0, maxQuests) : quests;
}

/**
 * Get the count of available fetch quest templates.
 */
export function getFetchQuestTemplateCount(): number {
  return buildFetchTemplates().length;
}

/**
 * Get template IDs grouped by difficulty.
 */
export function getFetchQuestsByDifficulty(): Record<string, string[]> {
  const templates = buildFetchTemplates();
  const result: Record<string, string[]> = { beginner: [], intermediate: [], advanced: [] };
  for (const t of templates) {
    result[t.difficulty].push(t.id);
  }
  return result;
}

/**
 * Get the item categories available for fetch quests.
 */
export function getFetchItemCategories(): string[] {
  return Object.keys(ITEM_POOLS);
}

/**
 * Get the vocabulary categories mapped to a fetch item category.
 */
export function getFetchVocabularyCategories(itemCategory: string): string[] {
  return FETCH_VOCAB_CATEGORIES[itemCategory] ?? ['shopping'];
}
