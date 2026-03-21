/**
 * NPC Occupation Assignment
 * Assigns default occupations to all characters during world generation.
 * Children become students, elderly become retired, and unemployed adults
 * get terrain/personality-appropriate occupations.
 */

import { storage } from '../db/storage';
import type { Character, OccupationVocation } from '../../shared/schema';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Terrain-weighted default occupation pools */
export const terrainOccupations: Record<string, OccupationVocation[]> = {
  plains: ['Farmer', 'Farmer', 'Farmer', 'Farmhand', 'Laborer'],
  hills: ['Farmer', 'Farmhand', 'Laborer', 'Carpenter'],
  mountains: ['Miner', 'Miner', 'Laborer', 'Carpenter', 'Stonecutter'],
  coast: ['Laborer', 'Farmer', 'Cook', 'Carpenter'],
  river: ['Farmer', 'Laborer', 'Carpenter', 'Cook'],
  forest: ['Carpenter', 'Woodworker', 'Laborer', 'Farmer'],
  desert: ['Farmer', 'Laborer', 'Laborer', 'Stonecutter'],
};

/**
 * Pick a default occupation for an unemployed adult based on terrain and personality.
 */
export function pickDefaultOccupation(character: Character, terrain: string): string {
  const personality = character.personality as {
    openness: number; conscientiousness: number;
    extroversion: number; agreeableness: number; neuroticism: number;
  } | null;

  // Personality-driven overrides (only if personality has strong signal)
  if (personality) {
    if (personality.openness > 0.5 && personality.extroversion > 0.3) {
      return pickRandom(['Tailor', 'Painter', 'Baker', 'Barber']);
    }
    if (personality.conscientiousness > 0.5 && personality.agreeableness > 0.3) {
      return pickRandom(['Carpenter', 'Seamstress', 'Shoemaker', 'Baker']);
    }
  }

  const pool = terrainOccupations[terrain] || terrainOccupations.plains;
  return pickRandom(pool);
}

/**
 * Determine the default occupation label for a character by age.
 * Returns null for characters too young (< 6) to have any label.
 */
export function getDefaultOccupationForAge(age: number): string | null {
  if (age < 6) return null;
  if (age < 18) return 'Student';
  if (age > 65) return 'Retired';
  return null; // Working-age — needs pickDefaultOccupation
}

/**
 * Assign default occupations to all characters who don't already have one.
 */
export async function assignDefaultOccupations(config: {
  worldId: string;
  currentYear: number;
  terrain: string;
}): Promise<number> {
  const characters = await storage.getCharactersByWorld(config.worldId);
  const unassigned = characters.filter(c => c.isAlive && !c.occupation);
  let assignedCount = 0;

  for (const character of unassigned) {
    const age = config.currentYear - (character.birthYear || config.currentYear);
    let occupation: string | null = null;

    if (age < 6) {
      // Toddlers/infants — no occupation
      continue;
    } else if (age < 18) {
      occupation = 'Student';
    } else if (age > 65) {
      occupation = 'Retired';
      await storage.updateCharacter(character.id, { occupation, retired: true } as any);
      assignedCount++;
      continue;
    } else {
      // Working-age adult without a business job — assign a default
      occupation = pickDefaultOccupation(character, config.terrain);
    }

    await storage.updateCharacter(character.id, { occupation });
    assignedCount++;
  }

  console.log(`   ✓ Assigned default occupations to ${assignedCount} characters`);
  return assignedCount;
}
