/**
 * Multi-NPC Quest Generator
 *
 * Generates quests involving multiple NPCs across different businesses.
 * Resolves NPC role slots from scenario definitions using real world data,
 * then instantiates quest seeds with the resolved participants.
 */

import type { Character, World } from '../schema.js';
import type { BusinessInfo } from './business-roleplay-quest-generator.js';
import {
  MULTI_NPC_SCENARIOS,
  type MultiNpcScenario,
  type NpcRoleSlot,
  type QuestParticipant,
} from '../language/multi-npc-quest-scenarios.js';
import { instantiateSeed, type InstantiatedQuest } from '../language/quest-seed-library.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MultiNpcQuestOptions {
  world: World;
  businesses: BusinessInfo[];
  characters: Character[];
  assignedTo?: string;
  /** Only generate scenarios matching this difficulty */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Maximum number of quests to generate */
  maxQuests?: number;
  /** Specific scenario IDs to generate (if omitted, generate all eligible) */
  scenarioIds?: string[];
}

export interface MultiNpcInstantiatedQuest extends InstantiatedQuest {
  /** Structured participant data for all NPCs in the quest */
  participants: QuestParticipant[];
  /** The scenario that generated this quest */
  scenarioId: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── NPC Role Resolution ──────────────────────────────────────────────────────

interface BusinessWithOwner {
  business: BusinessInfo;
  owner: Character;
}

/**
 * Find businesses with known active owners.
 */
function getBusinessesWithOwners(
  businesses: BusinessInfo[],
  characters: Character[],
): BusinessWithOwner[] {
  const active = businesses.filter(b => !b.isOutOfBusiness);
  const results: BusinessWithOwner[] = [];

  for (const biz of active) {
    const owner = characters.find(c => c.id === biz.ownerId && c.status === 'active');
    if (owner) {
      results.push({ business: biz, owner });
    }
  }

  return results;
}

/**
 * Resolve all NPC role slots for a scenario.
 * Returns null if any role cannot be filled.
 */
export function resolveNpcRoles(
  scenario: MultiNpcScenario,
  businessesWithOwners: BusinessWithOwner[],
  allCharacters: Character[],
): { participants: QuestParticipant[]; values: Record<string, string | number> } | null {
  const participants: QuestParticipant[] = [];
  const values: Record<string, string | number> = {};
  const usedBusinessIds = new Set<string>();
  const usedCharacterIds = new Set<string>();

  // Shuffle to get varied assignments across generations
  const available = shuffled(businessesWithOwners);
  const activeNonOwners = shuffled(
    allCharacters.filter(c => c.status === 'active'),
  );

  for (const roleSlot of scenario.npcRoles) {
    if (roleSlot.requiresBusinessOwner) {
      const match = findMatchingBusiness(roleSlot, available, usedBusinessIds, usedCharacterIds);
      if (!match) return null;

      usedBusinessIds.add(match.business.id);
      usedCharacterIds.add(match.owner.id);

      const name = charName(match.owner);
      participants.push({
        role: roleSlot.role,
        npcId: match.owner.id,
        npcName: name,
        businessId: match.business.id,
        businessName: match.business.name,
        businessType: match.business.businessType,
      });

      values[roleSlot.paramName] = name;
      if (roleSlot.businessParamName) {
        values[roleSlot.businessParamName] = match.business.name;
      }
    } else {
      // Non-business-owner role (e.g., guide)
      const npc = activeNonOwners.find(c => !usedCharacterIds.has(c.id));
      if (!npc) return null;

      usedCharacterIds.add(npc.id);
      const name = charName(npc);
      participants.push({
        role: roleSlot.role,
        npcId: npc.id,
        npcName: name,
      });

      values[roleSlot.paramName] = name;
    }
  }

  return { participants, values };
}

function findMatchingBusiness(
  roleSlot: NpcRoleSlot,
  available: BusinessWithOwner[],
  usedBusinessIds: Set<string>,
  usedCharacterIds: Set<string>,
): BusinessWithOwner | null {
  for (const bwo of available) {
    if (usedBusinessIds.has(bwo.business.id)) continue;
    if (usedCharacterIds.has(bwo.owner.id)) continue;

    // Check business type filter
    if (roleSlot.businessTypes && roleSlot.businessTypes.length > 0) {
      if (!roleSlot.businessTypes.includes(bwo.business.businessType)) continue;
    }

    return bwo;
  }

  // If type-filtered search failed, try without type filter
  if (roleSlot.businessTypes && roleSlot.businessTypes.length > 0) {
    for (const bwo of available) {
      if (usedBusinessIds.has(bwo.business.id)) continue;
      if (usedCharacterIds.has(bwo.owner.id)) continue;
      return bwo;
    }
  }

  return null;
}

// ── Generator ────────────────────────────────────────────────────────────────

/**
 * Generate multi-NPC quests from scenario definitions using real world data.
 *
 * For each eligible scenario, resolves NPC role slots with actual characters
 * and businesses, then instantiates the quest seed with structured participant data.
 */
export function generateMultiNpcQuests(
  options: MultiNpcQuestOptions,
): MultiNpcInstantiatedQuest[] {
  const {
    world,
    businesses,
    characters,
    assignedTo = 'Player',
    difficulty,
    maxQuests,
    scenarioIds,
  } = options;

  const targetLanguage = world.targetLanguage || 'English';
  const businessesWithOwners = getBusinessesWithOwners(businesses, characters);
  const activeBusinessCount = businessesWithOwners.length;

  if (activeBusinessCount < 2) return [];

  // Filter eligible scenarios
  let scenarios = MULTI_NPC_SCENARIOS.filter(s => s.minBusinesses <= activeBusinessCount);

  if (difficulty) {
    scenarios = scenarios.filter(s => s.difficulty === difficulty);
  }

  if (scenarioIds && scenarioIds.length > 0) {
    scenarios = scenarios.filter(s => scenarioIds.includes(s.id));
  }

  const quests: MultiNpcInstantiatedQuest[] = [];

  for (const scenario of scenarios) {
    const resolved = resolveNpcRoles(scenario, businessesWithOwners, characters);
    if (!resolved) continue;

    // Build entity map from resolved participants
    const entities: Record<string, { id: string; name: string; type: 'npc' | 'location' }> = {};
    for (const roleSlot of scenario.npcRoles) {
      const participant = resolved.participants.find(p => p.role === roleSlot.role);
      if (participant) {
        entities[roleSlot.paramName] = { id: participant.npcId, name: participant.npcName, type: 'npc' as const };
      }
    }

    const quest = instantiateSeed(scenario.seed, {
      worldId: world.id,
      targetLanguage,
      assignedTo,
      assignedBy: resolved.participants[0]?.npcName,
      values: resolved.values,
      entities,
    });

    const multiNpcQuest: MultiNpcInstantiatedQuest = {
      ...quest,
      participants: resolved.participants,
      scenarioId: scenario.id,
      tags: [
        ...quest.tags,
        'multi_npc',
        'multi_business',
        `scenario:${scenario.id}`,
        ...resolved.participants
          .filter(p => p.businessId)
          .map(p => `businessId:${p.businessId}`),
      ],
    };

    quests.push(multiNpcQuest);
  }

  if (maxQuests && quests.length > maxQuests) {
    return shuffled(quests).slice(0, maxQuests);
  }

  return quests;
}
