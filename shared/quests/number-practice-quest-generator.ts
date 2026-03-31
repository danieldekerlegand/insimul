/**
 * Number & Counting Practice Quest Generator
 *
 * Generates language-learning quests focused on number vocabulary at businesses.
 * Covers counting (1–10), prices (10–100), large numbers (100–1000),
 * ordinals, time-telling, and price comparison — scaled by CEFR level.
 */

import type { Character, World, InsertQuest } from '../schema.js';
import { convertQuestToProlog } from '../prolog/quest-converter.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BusinessInfo {
  id: string;
  name: string;
  businessType: string;
  ownerId?: string | null;
  settlementId?: string | null;
  lotId?: string | null;
  isOutOfBusiness?: boolean;
}

export interface NumberQuestOptions {
  world: World;
  businesses: BusinessInfo[];
  characters: Character[];
  /** Player name (default: 'Player') */
  assignedTo?: string;
  /** CEFR level filters which quest types are generated */
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  /** Max quests to generate (default: all applicable) */
  maxQuests?: number;
}

// ── Business types that support number quests ────────────────────────────────

/** Business types where counting / pricing makes sense */
const NUMBER_BUSINESS_TYPES = new Set([
  'GroceryStore',
  'Bakery',
  'Restaurant',
  'Bar',
  'Pharmacy',
  'Shop',
  'JewelryStore',
  'FishMarket',
  'Bookstore',
  'HardwareStore',
  'Hotel',
  'Brewery',
]);

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

function getActiveBusinesses(businesses: BusinessInfo[]): BusinessInfo[] {
  return businesses.filter(b => !b.isOutOfBusiness && NUMBER_BUSINESS_TYPES.has(b.businessType));
}

function getOwner(business: BusinessInfo, characters: Character[]): Character | null {
  if (!business.ownerId) return null;
  return characters.find(c => c.id === business.ownerId && c.status === 'active') ?? null;
}

function getActiveNPCs(characters: Character[]): Character[] {
  return characters.filter(c => c.status === 'active');
}

// ── CEFR level → quest eligibility ──────────────────────────────────────────

type QuestId = 'inventory_count' | 'house_numbers' | 'market_prices' | 'make_change' | 'time_meeting' | 'price_comparison' | 'large_numbers';

/** Maps CEFR levels to the number quest types available at that level and below */
const CEFR_QUEST_MAP: Record<string, QuestId[]> = {
  A1: ['inventory_count', 'house_numbers'],
  A2: ['inventory_count', 'house_numbers', 'market_prices', 'make_change', 'time_meeting'],
  B1: ['inventory_count', 'house_numbers', 'market_prices', 'make_change', 'time_meeting', 'price_comparison', 'large_numbers'],
  B2: ['inventory_count', 'house_numbers', 'market_prices', 'make_change', 'time_meeting', 'price_comparison', 'large_numbers'],
};

function getEligibleQuestTypes(cefrLevel?: string): QuestId[] {
  if (!cefrLevel || !CEFR_QUEST_MAP[cefrLevel]) {
    return CEFR_QUEST_MAP['B1']; // Default: include most quest types
  }
  return CEFR_QUEST_MAP[cefrLevel];
}

// ── Quest builders ───────────────────────────────────────────────────────────

interface QuestBuildContext {
  world: World;
  targetLanguage: string;
  assignedTo: string;
  characters: Character[];
}

function buildInventoryCountQuest(business: BusinessInfo, owner: Character | null, ctx: QuestBuildContext): InsertQuest {
  const ownerLabel = owner ? charName(owner) : 'the shopkeeper';
  const itemCount = 5;

  return {
    worldId: ctx.world.id,
    title: `Counting at ${business.name}`,
    description: `Visit ${business.name} and help ${ownerLabel} count inventory. Report the numbers in ${ctx.targetLanguage} (1–10).`,
    questType: 'vocabulary',
    difficulty: 'beginner',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: owner ? charName(owner) : null,
    assignedByCharacterId: owner?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'visit_location',
        description: `Visit ${business.name}`,
        target: business.name, locationName: business.name,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'complete_conversation',
        description: `Count ${itemCount} items with ${ownerLabel} and report totals`,
        target: owner ? charName(owner) : undefined,
        npcId: owner?.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use ${itemCount} number words (1–10) in ${ctx.targetLanguage}`,
        requiredCount: itemCount, currentCount: 0, completed: false,
        vocabularyCategories: ['numbers'],
      },
    ],
    experienceReward: 25,
    rewards: { xp: 25, fluency: 3 },
    tags: ['seed', 'numbers', 'counting', 'vocabulary', 'beginner', 'business', `business-type:${business.businessType}`],
  };
}

function buildMarketPricesQuest(business: BusinessInfo, owner: Character | null, ctx: QuestBuildContext): InsertQuest {
  const ownerLabel = owner ? charName(owner) : 'the shopkeeper';
  const priceCount = 3;

  return {
    worldId: ctx.world.id,
    title: `Prices at ${business.name}`,
    description: `Ask ${ownerLabel} about prices at ${business.name}. Remember and report ${priceCount} prices correctly in ${ctx.targetLanguage} (10–100).`,
    questType: 'vocabulary',
    difficulty: 'intermediate',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: owner ? charName(owner) : null,
    assignedByCharacterId: owner?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'visit_location',
        description: `Visit ${business.name}`,
        target: business.name, locationName: business.name,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'complete_conversation',
        description: `Ask ${ownerLabel} for ${priceCount} item prices`,
        target: owner ? charName(owner) : undefined,
        npcId: owner?.id,
        requiredCount: priceCount, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use number vocabulary (10–100) to discuss prices`,
        requiredCount: priceCount, currentCount: 0, completed: false,
        vocabularyCategories: ['numbers', 'shopping'],
      },
    ],
    experienceReward: 35,
    rewards: { xp: 35, fluency: 4 },
    tags: ['seed', 'numbers', 'prices', 'vocabulary', 'intermediate', 'business', `business-type:${business.businessType}`],
  };
}

function buildMakeChangeQuest(business: BusinessInfo, owner: Character | null, ctx: QuestBuildContext): InsertQuest {
  const ownerLabel = owner ? charName(owner) : 'the shopkeeper';
  const itemCount = 2;

  return {
    worldId: ctx.world.id,
    title: `Making Change at ${business.name}`,
    description: `Buy ${itemCount} items from ${ownerLabel} at ${business.name}. Pay and verify your change using number vocabulary in ${ctx.targetLanguage}.`,
    questType: 'vocabulary',
    difficulty: 'intermediate',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: owner ? charName(owner) : null,
    assignedByCharacterId: owner?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'visit_location',
        description: `Visit ${business.name}`,
        target: business.name, locationName: business.name,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'haggle_price',
        description: `Purchase ${itemCount} items from ${ownerLabel} and verify change`,
        target: owner ? charName(owner) : undefined,
        npcId: owner?.id,
        requiredCount: itemCount, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use number and money vocabulary to verify amounts`,
        requiredCount: 4, currentCount: 0, completed: false,
        vocabularyCategories: ['numbers', 'shopping'],
      },
    ],
    experienceReward: 35,
    rewards: { xp: 35, fluency: 4 },
    tags: ['seed', 'numbers', 'money', 'arithmetic', 'intermediate', 'business', `business-type:${business.businessType}`],
  };
}

function buildHouseNumbersQuest(npc: Character | null, ctx: QuestBuildContext): InsertQuest {
  const npcLabel = npc ? charName(npc) : 'A local resident';
  const locationCount = 3;

  return {
    worldId: ctx.world.id,
    title: `Find the Address (${locationCount} buildings)`,
    description: `${npcLabel} gives you building addresses in ${ctx.targetLanguage}. Find ${locationCount} buildings by their number.`,
    questType: 'vocabulary',
    difficulty: 'beginner',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: npc ? charName(npc) : null,
    assignedByCharacterId: npc?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'talk_to_npc',
        description: `Get address numbers from ${npcLabel} in ${ctx.targetLanguage}`,
        target: npc ? charName(npc) : undefined,
        npcId: npc?.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'visit_location',
        description: `Find ${locationCount} buildings by their address number`,
        requiredCount: locationCount, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use number words to confirm addresses`,
        requiredCount: locationCount, currentCount: 0, completed: false,
        vocabularyCategories: ['numbers'],
      },
    ],
    experienceReward: 25,
    rewards: { xp: 25, fluency: 3 },
    tags: ['seed', 'numbers', 'navigation', 'vocabulary', 'beginner'],
  };
}

function buildTimeMeetingQuest(business: BusinessInfo, npc: Character | null, ctx: QuestBuildContext): InsertQuest {
  const npcLabel = npc ? charName(npc) : 'A local friend';
  const timeCount = 2;

  return {
    worldId: ctx.world.id,
    title: `Meet ${npc ? charName(npc) : 'a Friend'} on Time`,
    description: `${npcLabel} tells you meeting times in ${ctx.targetLanguage}. Arrive at ${business.name} at the right time and schedule ${timeCount} follow-up meetings.`,
    questType: 'vocabulary',
    difficulty: 'intermediate',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: npc ? charName(npc) : null,
    assignedByCharacterId: npc?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'visit_location',
        description: `Arrive at ${business.name} at the time ${npcLabel} specified`,
        target: business.name, locationName: business.name,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'complete_conversation',
        description: `Schedule ${timeCount} meetings using time vocabulary`,
        target: npc ? charName(npc) : undefined,
        npcId: npc?.id,
        requiredCount: timeCount, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use time and number words in ${ctx.targetLanguage}`,
        requiredCount: 4, currentCount: 0, completed: false,
        vocabularyCategories: ['numbers', 'time'],
      },
    ],
    experienceReward: 35,
    rewards: { xp: 35, fluency: 4 },
    tags: ['seed', 'numbers', 'time', 'scheduling', 'intermediate', 'business', `business-type:${business.businessType}`],
  };
}

function buildPriceComparisonQuest(
  businesses: BusinessInfo[],
  requester: Character | null,
  ctx: QuestBuildContext,
): InsertQuest {
  const requesterLabel = requester ? charName(requester) : 'A local resident';
  const shopNames = businesses.map(b => b.name).join(', ');

  return {
    worldId: ctx.world.id,
    title: `Best Deal in Town (${businesses.length} shops)`,
    description: `${requesterLabel} needs the best price. Visit ${shopNames}, compare prices in ${ctx.targetLanguage}, and report which shop has the best deal.`,
    questType: 'vocabulary',
    difficulty: 'intermediate',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: requester ? charName(requester) : null,
    assignedByCharacterId: requester?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'visit_location',
        description: `Visit ${businesses.length} shops to compare prices (${shopNames})`,
        requiredCount: businesses.length, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'use_vocabulary',
        description: `Use number and comparison vocabulary (more, less, cheaper, expensive)`,
        requiredCount: 6, currentCount: 0, completed: false,
        vocabularyCategories: ['numbers', 'shopping'],
      },
      {
        id: 'obj_2', type: 'talk_to_npc',
        description: `Report the best price to ${requesterLabel}`,
        target: requester ? charName(requester) : undefined,
        npcId: requester?.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
    ],
    experienceReward: 40,
    rewards: { xp: 40, fluency: 5 },
    tags: ['seed', 'numbers', 'prices', 'comparison', 'intermediate', 'business'],
  };
}

function buildLargeNumbersQuest(business: BusinessInfo, owner: Character | null, ctx: QuestBuildContext): InsertQuest {
  const ownerLabel = owner ? charName(owner) : 'the manager';
  const wordCount = 5;

  return {
    worldId: ctx.world.id,
    title: `Big Numbers at ${business.name}`,
    description: `Help ${ownerLabel} at ${business.name} with large quantities. Use numbers 100–1000 and ordinals in ${ctx.targetLanguage}.`,
    questType: 'vocabulary',
    difficulty: 'advanced',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: owner ? charName(owner) : null,
    assignedByCharacterId: owner?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'visit_location',
        description: `Visit ${business.name}`,
        target: business.name, locationName: business.name,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'complete_conversation',
        description: `Discuss large quantities and order numbers with ${ownerLabel}`,
        target: owner ? charName(owner) : undefined,
        npcId: owner?.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use ${wordCount} large number and ordinal words (100–1000, first, second, etc.)`,
        requiredCount: wordCount, currentCount: 0, completed: false,
        vocabularyCategories: ['numbers'],
      },
    ],
    experienceReward: 55,
    rewards: { xp: 55, fluency: 5 },
    tags: ['seed', 'numbers', 'ordinals', 'vocabulary', 'advanced', 'business', `business-type:${business.businessType}`],
  };
}

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate number and counting practice quests tied to real businesses
 * in the game world. Returns InsertQuest objects ready for database insertion.
 */
export function generateNumberPracticeQuests(options: NumberQuestOptions): InsertQuest[] {
  const { world, businesses, characters, assignedTo = 'Player', cefrLevel, maxQuests } = options;

  const activeBusinesses = getActiveBusinesses(businesses);
  if (activeBusinesses.length === 0) return [];

  const targetLanguage = world.targetLanguage || 'English';
  const npcs = getActiveNPCs(characters);
  const ctx: QuestBuildContext = { world, targetLanguage, assignedTo, characters };
  const eligible = getEligibleQuestTypes(cefrLevel);
  const quests: InsertQuest[] = [];

  // 1. Inventory count quest (A1+) — one per business type
  if (eligible.includes('inventory_count')) {
    const byType = new Map<string, BusinessInfo>();
    for (const b of activeBusinesses) {
      if (!byType.has(b.businessType)) byType.set(b.businessType, b);
    }
    for (const business of Array.from(byType.values())) {
      const owner = getOwner(business, characters);
      quests.push(buildInventoryCountQuest(business, owner, ctx));
    }
  }

  // 2. House numbers quest (A1+) — needs at least one NPC
  if (eligible.includes('house_numbers') && npcs.length > 0) {
    const npc = pick(npcs);
    quests.push(buildHouseNumbersQuest(npc, ctx));
  }

  // 3. Market prices quest (A2+) — pick a business
  if (eligible.includes('market_prices') && activeBusinesses.length > 0) {
    const priceBiz = pick(activeBusinesses);
    const owner = getOwner(priceBiz, characters);
    quests.push(buildMarketPricesQuest(priceBiz, owner, ctx));
  }

  // 4. Make change quest (A2+) — pick a business
  if (eligible.includes('make_change') && activeBusinesses.length > 0) {
    const changeBiz = pick(activeBusinesses);
    const owner = getOwner(changeBiz, characters);
    quests.push(buildMakeChangeQuest(changeBiz, owner, ctx));
  }

  // 5. Time meeting quest (A2+) — needs a business and NPC
  if (eligible.includes('time_meeting') && activeBusinesses.length > 0 && npcs.length > 0) {
    const meetBiz = pick(activeBusinesses);
    const npc = pick(npcs);
    quests.push(buildTimeMeetingQuest(meetBiz, npc, ctx));
  }

  // 6. Price comparison quest (B1+) — needs 2+ businesses
  if (eligible.includes('price_comparison') && activeBusinesses.length >= 2) {
    const compareShops = pickN(activeBusinesses, Math.min(3, activeBusinesses.length));
    const requester = npcs.length > 0 ? pick(npcs) : null;
    quests.push(buildPriceComparisonQuest(compareShops, requester, ctx));
  }

  // 7. Large numbers quest (B1+) — pick a business
  if (eligible.includes('large_numbers') && activeBusinesses.length > 0) {
    const largeBiz = pick(activeBusinesses);
    const owner = getOwner(largeBiz, characters);
    quests.push(buildLargeNumbersQuest(largeBiz, owner, ctx));
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
 * Get the list of business types that support number practice quests.
 */
export function getNumberQuestBusinessTypes(): string[] {
  return Array.from(NUMBER_BUSINESS_TYPES);
}

/**
 * Get eligible quest types for a given CEFR level.
 */
export function getEligibleNumberQuests(cefrLevel?: string): string[] {
  return getEligibleQuestTypes(cefrLevel);
}
