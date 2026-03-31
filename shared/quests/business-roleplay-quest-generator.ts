/**
 * Business Role-Play Quest Generator
 *
 * Generates role-play scenario quests centered on business interactions.
 * Uses real world data (businesses, their owners/employees, locations) to
 * instantiate business-specific quest seeds.
 */

import type { Character, World } from '../schema.js';
import {
  BUSINESS_ROLEPLAY_SEEDS,
  BUSINESS_TYPE_TO_SEEDS,
  getMultiBusinessSeeds,
} from '../language/business-roleplay-seeds.js';
import { instantiateSeed, type InstantiatedQuest } from '../language/quest-seed-library.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BusinessInfo {
  id: string;
  name: string;
  businessType: string;
  ownerId: string;
  lotId?: string | null;
  isOutOfBusiness?: boolean;
}

export interface BusinessRoleplpayQuestOptions {
  world: World;
  businesses: BusinessInfo[];
  characters: Character[];
  assignedTo?: string;
  /** Only generate quests for these business type IDs */
  businessTypeFilter?: string[];
  /** Maximum number of quests to generate */
  maxQuests?: number;
  /** Difficulty filter */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function getOwnerName(business: BusinessInfo, characters: Character[]): string {
  const owner = characters.find(c => c.id === business.ownerId);
  return owner ? charName(owner) : 'the owner';
}

// ── Generator ────────────────────────────────────────────────────────────────

/**
 * Generate business role-play quests from real world data.
 *
 * For each active business in the world, looks up applicable quest seeds and
 * instantiates them with the business name, owner NPC, and location.
 * Also generates multi-business scenarios (tours, shopping lists, etc.)
 * when enough businesses are available.
 */
export function generateBusinessRoleplayQuests(
  options: BusinessRoleplpayQuestOptions,
): InstantiatedQuest[] {
  const {
    world,
    businesses,
    characters,
    assignedTo = 'Player',
    businessTypeFilter,
    maxQuests,
    difficulty,
  } = options;

  const targetLanguage = world.targetLanguage || 'English';
  const activeBusinesses = businesses.filter(b => !b.isOutOfBusiness);

  if (activeBusinesses.length === 0) return [];

  const quests: InstantiatedQuest[] = [];

  // Phase 1: Generate business-specific quests
  for (const business of activeBusinesses) {
    if (businessTypeFilter && !businessTypeFilter.includes(business.businessType)) {
      continue;
    }

    const seedIds = BUSINESS_TYPE_TO_SEEDS[business.businessType];
    if (!seedIds || seedIds.length === 0) continue;

    for (const seedId of seedIds) {
      const seed = BUSINESS_ROLEPLAY_SEEDS.find(s => s.id === seedId);
      if (!seed) continue;
      if (difficulty && seed.difficulty !== difficulty) continue;

      const ownerName = getOwnerName(business, characters);

      const quest = instantiateSeed(seed, {
        worldId: world.id,
        targetLanguage,
        assignedTo,
        assignedBy: ownerName,
        values: {
          businessName: business.name,
          npcName: ownerName,
          location: business.name,
        },
      });

      // Add business metadata to tags
      quest.tags = [
        ...quest.tags,
        `business:${business.businessType}`,
        `businessId:${business.id}`,
      ];

      quests.push(quest);
    }
  }

  // Phase 2: Generate multi-business scenarios if enough businesses exist
  if (activeBusinesses.length >= 2) {
    const multiSeeds = getMultiBusinessSeeds();
    const activeChars = characters.filter(c => c.status === 'active');

    for (const seed of multiSeeds) {
      if (difficulty && seed.difficulty !== difficulty) continue;

      if (seed.id === 'business_tour' || seed.id === 'shopping_list') {
        const guide = activeChars.length > 0 ? pick(activeChars) : null;
        const quest = instantiateSeed(seed, {
          worldId: world.id,
          targetLanguage,
          assignedTo,
          assignedBy: guide ? charName(guide) : undefined,
          values: {
            npcName: guide ? charName(guide) : 'a local guide',
            businessCount: Math.min(activeBusinesses.length, 3),
            itemCount: Math.min(activeBusinesses.length + 1, 4),
          },
        });
        quest.tags = [...quest.tags, 'multi_business'];
        quests.push(quest);
      }

      if ((seed.id === 'supply_chain_delivery' || seed.id === 'business_dispute') && activeBusinesses.length >= 2) {
        const [bizA, bizB] = shuffled(activeBusinesses).slice(0, 2);
        const ownerA = getOwnerName(bizA, characters);
        const ownerB = getOwnerName(bizB, characters);

        const quest = instantiateSeed(seed, {
          worldId: world.id,
          targetLanguage,
          assignedTo,
          values: {
            senderNpc: ownerA,
            receiverNpc: ownerB,
            senderBusiness: bizA.name,
            receiverBusiness: bizB.name,
            npcA: ownerA,
            npcB: ownerB,
            businessA: bizA.name,
            businessB: bizB.name,
          },
        });
        quest.tags = [
          ...quest.tags,
          'multi_business',
          `businessId:${bizA.id}`,
          `businessId:${bizB.id}`,
        ];
        quests.push(quest);
      }
    }
  }

  // Apply max limit
  if (maxQuests && quests.length > maxQuests) {
    return shuffled(quests).slice(0, maxQuests);
  }

  return quests;
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
