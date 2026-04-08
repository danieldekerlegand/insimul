/**
 * Emergency / Situational Quest Generator
 *
 * Generates time-sensitive, practical-language quests from real world data.
 * Picks a random emergency scenario, fills it with actual businesses, NPCs,
 * and items from the world, and applies soft time-pressure bonus metadata.
 *
 * Soft time pressure: a bonus XP window is stored in the quest's `rewards`
 * field — completing within the window yields extra XP, but the quest never
 * hard-fails from time alone.
 */

import type { Character, Item, World } from '../schema.js';
import {
  EMERGENCY_QUEST_SEEDS,
  EMERGENCY_TIME_BONUS,
} from '../language/emergency-quest-seeds.js';
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

export interface EmergencyQuestOptions {
  world: World;
  businesses: BusinessInfo[];
  characters: Character[];
  items?: Pick<Item, 'id' | 'name'>[];
  assignedTo?: string;
  /** Generate only this specific scenario (seed ID) */
  scenarioFilter?: string;
  /** Maximum number of quests to generate (default: 1 for semi-random trigger) */
  maxQuests?: number;
  /** Difficulty filter */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function getOwnerName(business: BusinessInfo, characters: Character[]): string {
  const owner = characters.find(c => c.id === business.ownerId);
  return owner ? charName(owner) : 'the owner';
}

/** Business types that can serve as a healer / medical location */
const HEALER_BUSINESS_TYPES = new Set([
  'doctor_office', 'apothecary', 'clinic', 'hospital', 'pharmacy', 'herbalist',
]);

/** Business types where a "wrong order" scenario makes sense */
const ORDER_BUSINESS_TYPES = new Set([
  'restaurant', 'bakery', 'tavern', 'grocery', 'general_store', 'clothing_store',
  'bookstore', 'hardware_store',
]);

/** Common symptoms for the medical emergency scenario */
const SYMPTOMS = [
  'a bad headache',
  'a high fever',
  'a painful stomach ache',
  'a twisted ankle',
  'a deep cut on their hand',
  'trouble breathing',
  'a terrible cough',
];

/** Common lost items */
const LOST_ITEMS = [
  'a leather satchel',
  'a silver ring',
  'a wool scarf',
  'a walking stick',
  'a small coin purse',
  'a pair of spectacles',
  'a wooden flute',
];

// ── Generator ────────────────────────────────────────────────────────────────

/**
 * Generate emergency / situational quests from real world data.
 *
 * By default generates a single randomly-selected quest (semi-random trigger).
 * Pass `maxQuests` to generate more, or `scenarioFilter` for a specific type.
 */
export function generateEmergencyQuests(options: EmergencyQuestOptions): InstantiatedQuest[] {
  const {
    world,
    businesses,
    characters,
    items = [],
    assignedTo = 'Player',
    scenarioFilter,
    maxQuests = 1,
    difficulty,
  } = options;

  const targetLanguage = world.targetLanguage || 'English';
  const activeBusinesses = businesses.filter(b => !b.isOutOfBusiness);
  const activeChars = characters.filter(c => c.status === 'active');

  if (activeBusinesses.length === 0 || activeChars.length === 0) return [];

  // Filter seeds
  let seeds = scenarioFilter
    ? EMERGENCY_QUEST_SEEDS.filter(s => s.id === scenarioFilter)
    : [...EMERGENCY_QUEST_SEEDS];

  if (difficulty) {
    seeds = seeds.filter(s => s.difficulty === difficulty);
  }

  // Shuffle for semi-random selection
  seeds = shuffled(seeds);

  const quests: InstantiatedQuest[] = [];

  for (const seed of seeds) {
    if (quests.length >= maxQuests) break;

    const quest = tryInstantiate(seed, {
      activeBusinesses,
      activeChars,
      items,
      worldId: world.id,
      targetLanguage,
      assignedTo,
    });

    if (quest) quests.push(quest);
  }

  return quests;
}

// ── Per-scenario instantiation ──────────────────────────────────────────────

interface InstantiateContext {
  activeBusinesses: BusinessInfo[];
  activeChars: Character[];
  items: Pick<Item, 'id' | 'name'>[];
  worldId: string;
  targetLanguage: string;
  assignedTo: string;
}

function tryInstantiate(
  seed: typeof EMERGENCY_QUEST_SEEDS[number],
  ctx: InstantiateContext,
): InstantiatedQuest | null {
  switch (seed.id) {
    case 'lost_and_found': return tryLostAndFound(seed, ctx);
    case 'medical_emergency': return tryMedicalEmergency(seed, ctx);
    case 'wrong_order': return tryWrongOrder(seed, ctx);
    case 'rush_delivery': return tryRushDelivery(seed, ctx);
    default: return null;
  }
}

function tryLostAndFound(
  seed: typeof EMERGENCY_QUEST_SEEDS[number],
  ctx: InstantiateContext,
): InstantiatedQuest | null {
  if (ctx.activeBusinesses.length < 2) return null;

  const [bizA, bizB] = shuffled(ctx.activeBusinesses).slice(0, 2);
  const ownerNpc = ctx.activeChars.length > 0 ? pick(ctx.activeChars) : null;
  if (!ownerNpc) return null;

  const itemName = ctx.items.length > 0 ? pick(ctx.items).name : pick(LOST_ITEMS);

  const shopkeeperAChar = (ctx.activeChars as Character[]).find(c => c.id === bizA.ownerId);
  const shopkeeperBChar = (ctx.activeChars as Character[]).find(c => c.id === bizB.ownerId);

  const quest = instantiateSeed(seed, {
    worldId: ctx.worldId,
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: charName(ownerNpc),
    values: {
      itemName,
      ownerNpc: charName(ownerNpc),
      businessA: bizA.name,
      shopkeeperA: shopkeeperAChar ? charName(shopkeeperAChar) : 'the shopkeeper',
      businessB: bizB.name,
      shopkeeperB: shopkeeperBChar ? charName(shopkeeperBChar) : 'the shopkeeper',
    },
    entities: {
      ownerNpc: { id: ownerNpc.id, name: charName(ownerNpc), type: 'npc' as const },
      ...(shopkeeperAChar ? { shopkeeperA: { id: shopkeeperAChar.id, name: charName(shopkeeperAChar), type: 'npc' as const } } : {}),
      ...(shopkeeperBChar ? { shopkeeperB: { id: shopkeeperBChar.id, name: charName(shopkeeperBChar), type: 'npc' as const } } : {}),
      businessA: { id: bizA.id, name: bizA.name, type: 'location' as const },
      businessB: { id: bizB.id, name: bizB.name, type: 'location' as const },
    },
  });

  return applyEmergencyMetadata(quest, seed.id);
}

function tryMedicalEmergency(
  seed: typeof EMERGENCY_QUEST_SEEDS[number],
  ctx: InstantiateContext,
): InstantiatedQuest | null {
  // Look for a healer-type business; fall back to any business
  const healerBiz = ctx.activeBusinesses.find(b => HEALER_BUSINESS_TYPES.has(b.businessType))
    || pick(ctx.activeBusinesses);

  if (ctx.activeChars.length < 2) return null;

  const [patient, ...rest] = shuffled(ctx.activeChars);
  const healerNpc = rest.length > 0
    ? rest.find(c => c.id === healerBiz.ownerId) || rest[0]
    : patient; // edge case safety

  if (patient === healerNpc) return null;

  const quest = instantiateSeed(seed, {
    worldId: ctx.worldId,
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: charName(patient),
    values: {
      patientNpc: charName(patient),
      healerNpc: charName(healerNpc),
      healerBusiness: healerBiz.name,
      symptom: pick(SYMPTOMS),
    },
    entities: {
      patientNpc: { id: patient.id, name: charName(patient), type: 'npc' as const },
      healerNpc: { id: healerNpc.id, name: charName(healerNpc), type: 'npc' as const },
      healerBusiness: { id: healerBiz.id, name: healerBiz.name, type: 'location' as const },
    },
  });

  return applyEmergencyMetadata(quest, seed.id);
}

function tryWrongOrder(
  seed: typeof EMERGENCY_QUEST_SEEDS[number],
  ctx: InstantiateContext,
): InstantiatedQuest | null {
  const orderBiz = ctx.activeBusinesses.find(b => ORDER_BUSINESS_TYPES.has(b.businessType))
    || pick(ctx.activeBusinesses);

  const ownerChar = (ctx.activeChars as Character[]).find(c => c.id === orderBiz.ownerId);
  const ownerN = ownerChar ? charName(ownerChar) : 'the owner';

  const quest = instantiateSeed(seed, {
    worldId: ctx.worldId,
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    values: {
      businessName: orderBiz.name,
      npcName: ownerN,
      wrongItem: 'the wrong item',
      correctItem: 'what you ordered',
    },
    entities: {
      ...(ownerChar ? { npcName: { id: ownerChar.id, name: ownerN, type: 'npc' as const } } : {}),
      businessName: { id: orderBiz.id, name: orderBiz.name, type: 'location' as const },
    },
  });

  return applyEmergencyMetadata(quest, seed.id);
}

function tryRushDelivery(
  seed: typeof EMERGENCY_QUEST_SEEDS[number],
  ctx: InstantiateContext,
): InstantiatedQuest | null {
  if (ctx.activeBusinesses.length < 2) return null;

  const [bizA, bizB] = shuffled(ctx.activeBusinesses).slice(0, 2);
  const senderChar = (ctx.activeChars as Character[]).find(c => c.id === bizA.ownerId);
  const receiverChar = (ctx.activeChars as Character[]).find(c => c.id === bizB.ownerId);
  const senderName = senderChar ? charName(senderChar) : 'the sender';
  const receiverName = receiverChar ? charName(receiverChar) : 'the receiver';

  const quest = instantiateSeed(seed, {
    worldId: ctx.worldId,
    targetLanguage: ctx.targetLanguage,
    assignedTo: ctx.assignedTo,
    assignedBy: senderName,
    values: {
      senderNpc: senderName,
      senderBusiness: bizA.name,
      receiverNpc: receiverName,
      receiverBusiness: bizB.name,
      orderItem: 'supplies',
    },
    entities: {
      ...(senderChar ? { senderNpc: { id: senderChar.id, name: senderName, type: 'npc' as const } } : {}),
      ...(receiverChar ? { receiverNpc: { id: receiverChar.id, name: receiverName, type: 'npc' as const } } : {}),
      senderBusiness: { id: bizA.id, name: bizA.name, type: 'location' as const },
      receiverBusiness: { id: bizB.id, name: bizB.name, type: 'location' as const },
    },
  });

  return applyEmergencyMetadata(quest, seed.id);
}

// ── Metadata ─────────────────────────────────────────────────────────────────

/**
 * Attach emergency-specific metadata to the instantiated quest:
 *   - time bonus configuration in `rewards`
 *   - `emergency` tag
 */
function applyEmergencyMetadata(quest: InstantiatedQuest, seedId: string): InstantiatedQuest {
  const bonus = EMERGENCY_TIME_BONUS[seedId];

  quest.tags = Array.from(new Set([...quest.tags, 'emergency', 'situational', 'practical']));

  if (bonus) {
    quest.rewards = {
      ...quest.rewards,
      timeBonus: {
        bonusWindowMinutes: bonus.bonusWindowMinutes,
        bonusMultiplier: bonus.bonusMultiplier,
        bonusXp: Math.round(quest.experienceReward * (bonus.bonusMultiplier - 1)),
      },
    };
  }

  return quest;
}
