/**
 * Main Quest NPC Spawner
 *
 * Creates the writer's associates during world generation.
 * Each NPC is assigned to an appropriate business and tagged
 * via generationConfig so the conversation system can inject
 * main-quest-specific context.
 */

import { storage } from '../db/storage.js';
import type { Character, Business, InsertCharacter } from '../../shared/schema.js';
import {
  MAIN_QUEST_NPC_DEFINITIONS,
  MAIN_QUEST_NPC_TAG,
  type MainQuestNPCRole,
  type MainQuestNPCDefinition,
} from '../../shared/quest/main-quest-npcs.js';

/** Names by language for procedural NPC naming */
const NAMES_BY_LANGUAGE: Record<string, { male: string[][]; female: string[][] }> = {
  French: {
    male: [
      ['Henri', 'Beaumont'],
      ['Marcel', 'Lefèvre'],
      ['Étienne', 'Moreau'],
      ['Jacques', 'Duval'],
      ['Pierre', 'Renard'],
    ],
    female: [
      ['Claire', 'Beaumont'],
      ['Marguerite', 'Lefèvre'],
      ['Élise', 'Moreau'],
      ['Jeanne', 'Duval'],
      ['Colette', 'Renard'],
    ],
  },
  Spanish: {
    male: [
      ['Enrique', 'Mendoza'],
      ['Carlos', 'Herrera'],
      ['Diego', 'Vargas'],
      ['Alejandro', 'Ruiz'],
      ['Tomás', 'Castillo'],
    ],
    female: [
      ['Clara', 'Mendoza'],
      ['Lucía', 'Herrera'],
      ['Elena', 'Vargas'],
      ['Isabel', 'Ruiz'],
      ['Sofía', 'Castillo'],
    ],
  },
  German: {
    male: [
      ['Heinrich', 'Schreiber'],
      ['Friedrich', 'Braun'],
      ['Karl', 'Vogel'],
      ['Wilhelm', 'Richter'],
      ['Otto', 'Keller'],
    ],
    female: [
      ['Klara', 'Schreiber'],
      ['Frieda', 'Braun'],
      ['Hilde', 'Vogel'],
      ['Greta', 'Richter'],
      ['Elsa', 'Keller'],
    ],
  },
  Italian: {
    male: [
      ['Enrico', 'Bianchi'],
      ['Marco', 'Colombo'],
      ['Luca', 'Ferrara'],
      ['Giovanni', 'Ricci'],
      ['Alessandro', 'Rossi'],
    ],
    female: [
      ['Chiara', 'Bianchi'],
      ['Margherita', 'Colombo'],
      ['Elena', 'Ferrara'],
      ['Giovanna', 'Ricci'],
      ['Alessandra', 'Rossi'],
    ],
  },
};

const DEFAULT_NAMES = {
  male: [
    ['James', 'Harwick'],
    ['Thomas', 'Pemberton'],
    ['Charles', 'Whitfield'],
    ['Edward', 'Blackwell'],
    ['Arthur', 'Crane'],
  ],
  female: [
    ['Margaret', 'Harwick'],
    ['Eleanor', 'Pemberton'],
    ['Charlotte', 'Whitfield'],
    ['Alice', 'Blackwell'],
    ['Helen', 'Crane'],
  ],
};

export interface SpawnResult {
  created: number;
  npcs: Array<{ role: MainQuestNPCRole; characterId: string; name: string }>;
}

/**
 * Spawn all main quest NPCs for a world.
 * Idempotent — skips NPCs that already exist.
 */
export async function spawnMainQuestNPCs(
  worldId: string,
  targetLanguage?: string,
): Promise<SpawnResult> {
  const existingCharacters = await storage.getCharactersByWorld(worldId);
  const businesses = await storage.getBusinessesByWorld(worldId);

  // Check which roles already exist
  const existingRoles = new Set<string>();
  for (const char of existingCharacters) {
    const config = char.generationConfig as Record<string, any> | null;
    if (config?.mainQuestRole) {
      existingRoles.add(config.mainQuestRole);
    }
  }

  const result: SpawnResult = { created: 0, npcs: [] };
  const usedBusinessIds = new Set<string>();
  const usedNameIndices = new Set<number>();

  for (const def of MAIN_QUEST_NPC_DEFINITIONS) {
    if (existingRoles.has(def.role)) {
      // Already exists — find and report
      const existing = existingCharacters.find(
        c => (c.generationConfig as Record<string, any> | null)?.mainQuestRole === def.role,
      );
      if (existing) {
        result.npcs.push({
          role: def.role,
          characterId: existing.id,
          name: `${existing.firstName} ${existing.lastName}`,
        });
      }
      continue;
    }

    // Pick a business for this NPC (if applicable)
    const business = findBusiness(businesses, def.preferredBusinessTypes, usedBusinessIds);
    if (business) {
      usedBusinessIds.add(business.id);
    }

    // Pick a name
    const [firstName, lastName] = pickName(targetLanguage, usedNameIndices);

    // Pick a gender (alternate)
    const gender = result.created % 2 === 0 ? 'male' : 'female';

    const location = business?.name ?? 'town center';

    const insertData: InsertCharacter & { age?: number; occupation?: string } = {
      worldId,
      firstName,
      lastName,
      gender,
      birthYear: 1970,
      isAlive: true,
      personality: def.personality,
      currentLocation: location,
      occupation: def.occupation,
      status: 'active',
      generationMethod: 'insimul',
      generationConfig: {
        mainQuestRole: def.role,
        mainQuestNPC: true,
        tag: MAIN_QUEST_NPC_TAG,
      },
    };

    const character = await storage.createCharacter(insertData);

    result.npcs.push({
      role: def.role,
      characterId: character.id,
      name: `${character.firstName} ${character.lastName}`,
    });
    result.created++;
  }

  return result;
}

/**
 * Find main quest NPCs in a world by their roles.
 */
export async function getMainQuestNPCs(
  worldId: string,
): Promise<Map<MainQuestNPCRole, Character>> {
  const characters = await storage.getCharactersByWorld(worldId);
  const map = new Map<MainQuestNPCRole, Character>();

  for (const char of characters) {
    const config = char.generationConfig as Record<string, any> | null;
    if (config?.mainQuestRole) {
      map.set(config.mainQuestRole as MainQuestNPCRole, char);
    }
  }

  return map;
}

/** Find a suitable business from preferred types */
function findBusiness(
  businesses: Business[],
  preferredTypes: string[],
  usedIds: Set<string>,
): Business | null {
  for (const type of preferredTypes) {
    const match = businesses.find(
      b => b.businessType === type && !usedIds.has(b.id),
    );
    if (match) return match;
  }
  return null;
}

/** Pick a culturally appropriate name */
function pickName(
  targetLanguage: string | undefined,
  usedIndices: Set<number>,
): [string, string] {
  const lang = targetLanguage ?? '';
  const pool = NAMES_BY_LANGUAGE[lang] ?? null;
  const names = pool?.male ?? DEFAULT_NAMES.male;

  // Pick an unused index
  for (let i = 0; i < names.length; i++) {
    if (!usedIndices.has(i)) {
      usedIndices.add(i);
      return [names[i][0], names[i][1]];
    }
  }

  // Fallback: use a random one
  const idx = Math.floor(Math.random() * names.length);
  usedIndices.add(idx);
  return [names[idx][0], names[idx][1]];
}
