/**
 * Shopping & Economic Vocabulary Quest Generator
 *
 * Generates language-learning quests tied to real businesses in the game world.
 * Each quest uses actual business names, owners, and types to create
 * contextualized shopping and economic vocabulary practice.
 */

import type { Character, World, InsertQuest } from '../../shared/schema.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';

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

export interface ShoppingQuestOptions {
  world: World;
  businesses: BusinessInfo[];
  characters: Character[];
  /** Player name (default: 'Player') */
  assignedTo?: string;
  /** Max quests to generate (default: all applicable) */
  maxQuests?: number;
}

// ── Business type → vocabulary category mapping ──────────────────────────────

/** Maps business types to the vocabulary categories relevant for shopping there */
const BUSINESS_VOCABULARY_MAP: Record<string, { categories: string[]; items: string[] }> = {
  GroceryStore: {
    categories: ['food', 'shopping', 'numbers'],
    items: ['bread', 'milk', 'cheese', 'fruit', 'vegetable', 'meat', 'fish', 'egg', 'rice'],
  },
  Bakery: {
    categories: ['food', 'shopping'],
    items: ['bread', 'cake', 'pastry', 'flour', 'sugar'],
  },
  Restaurant: {
    categories: ['food', 'shopping', 'social'],
    items: ['soup', 'meat', 'fish', 'wine', 'beer', 'water'],
  },
  Bar: {
    categories: ['food', 'shopping', 'social'],
    items: ['beer', 'wine', 'water'],
  },
  Pharmacy: {
    categories: ['shopping', 'body'],
    items: ['medicine', 'bandage'],
  },
  Shop: {
    categories: ['shopping', 'clothing', 'household'],
    items: ['shirt', 'shoes', 'hat', 'bag'],
  },
  JewelryStore: {
    categories: ['shopping', 'numbers'],
    items: ['ring', 'necklace', 'bracelet'],
  },
  FishMarket: {
    categories: ['food', 'shopping', 'numbers'],
    items: ['fish', 'shrimp', 'crab'],
  },
  Bookstore: {
    categories: ['shopping'],
    items: ['book', 'pen', 'paper'],
  },
  HardwareStore: {
    categories: ['shopping', 'household'],
    items: ['hammer', 'nail', 'rope', 'tool'],
  },
  Hotel: {
    categories: ['shopping', 'numbers', 'time'],
    items: ['room', 'key', 'bed'],
  },
  Brewery: {
    categories: ['food', 'shopping'],
    items: ['beer', 'barrel', 'grain'],
  },
};

/** Business types that are shoppable (player can buy things) */
const SHOPPABLE_BUSINESS_TYPES = new Set(Object.keys(BUSINESS_VOCABULARY_MAP));

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
  return businesses.filter(b => !b.isOutOfBusiness && SHOPPABLE_BUSINESS_TYPES.has(b.businessType));
}

function getOwner(business: BusinessInfo, characters: Character[]): Character | null {
  if (!business.ownerId) return null;
  return characters.find(c => c.id === business.ownerId && c.status === 'active') ?? null;
}

function getActiveNPCs(characters: Character[]): Character[] {
  return characters.filter(c => c.status === 'active');
}

// ── Quest builders ───────────────────────────────────────────────────────────

interface QuestBuildContext {
  world: World;
  targetLanguage: string;
  assignedTo: string;
  characters: Character[];
}

function buildShopVocabQuest(business: BusinessInfo, owner: Character | null, ctx: QuestBuildContext): InsertQuest {
  const vocabInfo = BUSINESS_VOCABULARY_MAP[business.businessType] ?? { categories: ['shopping'], items: [] };
  const ownerLabel = owner ? charName(owner) : 'the shopkeeper';

  return {
    worldId: ctx.world.id,
    title: `Shopping at ${business.name}`,
    description: `Visit ${business.name} and learn shopping vocabulary in ${ctx.targetLanguage}. Talk to ${ownerLabel} about what they sell.`,
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
        id: 'obj_1', type: 'collect_vocabulary',
        description: `Learn 5 shopping vocabulary words at ${business.name}`,
        requiredCount: 5, currentCount: 0, completed: false,
        vocabularyCategories: vocabInfo.categories,
      },
    ],
    experienceReward: 25,
    rewards: { xp: 25, fluency: 3 },
    tags: ['seed', 'shopping', 'vocabulary', 'business', `business-type:${business.businessType}`],
  };
}

function buildOrderingQuest(business: BusinessInfo, owner: Character | null, ctx: QuestBuildContext): InsertQuest {
  const ownerLabel = owner ? charName(owner) : 'the owner';
  const vocabInfo = BUSINESS_VOCABULARY_MAP[business.businessType] ?? { categories: ['shopping'], items: [] };

  return {
    worldId: ctx.world.id,
    title: `Ordering at ${business.name}`,
    description: `Visit ${business.name} and practice ordering from ${ownerLabel} in ${ctx.targetLanguage}. Use food and shopping words.`,
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
        description: `Order from ${ownerLabel} at ${business.name}`,
        target: owner ? charName(owner) : undefined,
        npcId: owner?.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use 4 food and shopping vocabulary words`,
        requiredCount: 4, currentCount: 0, completed: false,
        vocabularyCategories: vocabInfo.categories,
      },
    ],
    experienceReward: 25,
    rewards: { xp: 25, fluency: 3 },
    tags: ['seed', 'shopping', 'food', 'conversation', 'business', `business-type:${business.businessType}`],
  };
}

function buildPriceQuest(business: BusinessInfo, owner: Character | null, ctx: QuestBuildContext): InsertQuest {
  const ownerLabel = owner ? charName(owner) : 'the shopkeeper';

  return {
    worldId: ctx.world.id,
    title: `Prices at ${business.name}`,
    description: `Visit ${business.name} and ask ${ownerLabel} about prices. Practice numbers and shopping vocabulary in ${ctx.targetLanguage}.`,
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
        description: `Ask ${ownerLabel} about prices at ${business.name}`,
        target: owner ? charName(owner) : undefined,
        npcId: owner?.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use 6 number and shopping words (how much, expensive, cheap, etc.)`,
        requiredCount: 6, currentCount: 0, completed: false,
        vocabularyCategories: ['shopping', 'numbers'],
      },
    ],
    experienceReward: 35,
    rewards: { xp: 35, fluency: 4 },
    tags: ['seed', 'shopping', 'numbers', 'intermediate', 'business', `business-type:${business.businessType}`],
  };
}

function buildShoppingErrandsQuest(
  businesses: BusinessInfo[],
  requester: Character | null,
  ctx: QuestBuildContext,
): InsertQuest {
  const shopNames = businesses.map(b => b.name).join(', ');
  const requesterLabel = requester ? charName(requester) : 'A local resident';
  const items = businesses.map(b => {
    const vocabInfo = BUSINESS_VOCABULARY_MAP[b.businessType];
    return vocabInfo?.items?.[0] ?? 'item';
  });

  return {
    worldId: ctx.world.id,
    title: `Shopping Errands for ${requester ? charName(requester) : 'a Friend'}`,
    description: `${requesterLabel} gives you a shopping list in ${ctx.targetLanguage}. Buy ${items.length} items from ${shopNames} and deliver them.`,
    questType: 'delivery',
    difficulty: 'intermediate',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: requester ? charName(requester) : null,
    assignedByCharacterId: requester?.id ?? null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'collect_item',
        description: `Buy ${items.length} items from local shops (${shopNames})`,
        requiredCount: items.length, currentCount: 0, completed: false,
        shopItems: items,
      },
      {
        id: 'obj_1', type: 'deliver_item',
        description: `Deliver the shopping to ${requesterLabel}`,
        target: requester ? charName(requester) : undefined,
        npcId: requester?.id,
        requiredCount: 1, currentCount: 0, completed: false,
      },
      {
        id: 'obj_2', type: 'use_vocabulary',
        description: `Use 5 shopping vocabulary words while buying items`,
        requiredCount: 5, currentCount: 0, completed: false,
        vocabularyCategories: ['shopping'],
      },
    ],
    experienceReward: 40,
    rewards: { xp: 40, fluency: 4 },
    tags: ['seed', 'shopping', 'delivery', 'intermediate', 'business'],
  };
}

function buildMerchantInterviewQuest(
  businesses: BusinessInfo[],
  ctx: QuestBuildContext,
): InsertQuest {
  const owners = businesses
    .map(b => getOwner(b, ctx.characters))
    .filter((o): o is Character => o !== null);

  const ownerNames = owners.length > 0
    ? owners.map(o => charName(o)).join(', ')
    : 'local business owners';

  return {
    worldId: ctx.world.id,
    title: `Meet the Merchants (${businesses.length} interviews)`,
    description: `Interview ${businesses.length} business owners and learn economic vocabulary in ${ctx.targetLanguage}. Visit ${businesses.map(b => b.name).join(', ')}.`,
    questType: 'vocabulary',
    difficulty: 'intermediate',
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: null,
    assignedByCharacterId: null,
    status: 'active',
    objectives: [
      {
        id: 'obj_0', type: 'talk_to_npc',
        description: `Interview ${businesses.length} business owners (${ownerNames})`,
        requiredCount: businesses.length, currentCount: 0, completed: false,
      },
      {
        id: 'obj_1', type: 'collect_vocabulary',
        description: `Learn 5 economic and profession vocabulary words`,
        requiredCount: 5, currentCount: 0, completed: false,
        vocabularyCategories: ['shopping', 'professions'],
      },
    ],
    experienceReward: 35,
    rewards: { xp: 35, fluency: 4 },
    tags: ['seed', 'shopping', 'professions', 'intermediate', 'business'],
  };
}

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate shopping and economic vocabulary quests tied to real businesses
 * in the game world. Returns InsertQuest objects ready for database insertion.
 */
export function generateShoppingQuests(options: ShoppingQuestOptions): InsertQuest[] {
  const { world, businesses, characters, assignedTo = 'Player', maxQuests } = options;

  const activeBusinesses = getActiveBusinesses(businesses);
  if (activeBusinesses.length === 0) return [];

  const targetLanguage = world.targetLanguage || 'English';
  const npcs = getActiveNPCs(characters);
  const ctx: QuestBuildContext = { world, targetLanguage, assignedTo, characters };
  const quests: InsertQuest[] = [];

  // 1. One "shop vocab" quest per business type (deduplicate by type)
  const byType = new Map<string, BusinessInfo>();
  for (const b of activeBusinesses) {
    if (!byType.has(b.businessType)) byType.set(b.businessType, b);
  }
  for (const business of Array.from(byType.values())) {
    const owner = getOwner(business, characters);
    quests.push(buildShopVocabQuest(business, owner, ctx));
  }

  // 2. Ordering quest for food-related businesses
  const foodBusinessTypes = new Set(['Bakery', 'Restaurant', 'Bar', 'GroceryStore', 'FishMarket']);
  const foodBusinesses = activeBusinesses.filter(b => foodBusinessTypes.has(b.businessType));
  if (foodBusinesses.length > 0) {
    const foodBiz = pick(foodBusinesses);
    const owner = getOwner(foodBiz, characters);
    quests.push(buildOrderingQuest(foodBiz, owner, ctx));
  }

  // 3. Price negotiation quest (any shop with items)
  if (activeBusinesses.length > 0) {
    const priceBiz = pick(activeBusinesses);
    const owner = getOwner(priceBiz, characters);
    quests.push(buildPriceQuest(priceBiz, owner, ctx));
  }

  // 4. Shopping errands quest (requires 2+ businesses)
  if (activeBusinesses.length >= 2) {
    const errandShops = pickN(activeBusinesses, Math.min(3, activeBusinesses.length));
    const requester = npcs.length > 0 ? pick(npcs) : null;
    quests.push(buildShoppingErrandsQuest(errandShops, requester, ctx));
  }

  // 5. Merchant interview quest (requires 2+ businesses with owners)
  const businessesWithOwners = activeBusinesses.filter(b => getOwner(b, characters) !== null);
  if (businessesWithOwners.length >= 2) {
    const interviewees = pickN(businessesWithOwners, Math.min(3, businessesWithOwners.length));
    quests.push(buildMerchantInterviewQuest(interviewees, ctx));
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
 * Get the list of business types that can generate shopping quests.
 */
export function getShoppableBusinessTypes(): string[] {
  return Array.from(SHOPPABLE_BUSINESS_TYPES);
}

/**
 * Get vocabulary categories relevant to a business type.
 */
export function getBusinessVocabularyCategories(businessType: string): string[] {
  return BUSINESS_VOCABULARY_MAP[businessType]?.categories ?? ['shopping'];
}

/**
 * Get example items for a business type (for quest descriptions).
 */
export function getBusinessItems(businessType: string): string[] {
  return BUSINESS_VOCABULARY_MAP[businessType]?.items ?? [];
}
