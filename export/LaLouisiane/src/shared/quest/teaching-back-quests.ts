/**
 * Teaching-Back Quest Generator
 *
 * Generates quests where the player teaches vocabulary and phrases to NPC
 * learners. Teaching-back is a proven pedagogical technique: explaining
 * concepts to others reinforces the teacher's own understanding.
 *
 * The generator selects vocabulary the player has already learned and
 * creates quests where they must teach it to an NPC "newcomer" or student.
 */

import {
  QUEST_SEEDS,
  getSeedsByCategory,
  instantiateSeed,
  type InstantiateParams,
  type InstantiatedQuest,
  type QuestSeed,
} from '../language/quest-seed-library.js';

// ── Types ───────────────────────────────────────────────────────────────────

export interface TeachingQuestConfig {
  worldId: string;
  targetLanguage: string;
  /** Player's character name or ID */
  playerName: string;
  /** NPC who will be the "student" */
  studentNpcName: string;
  /** Player's current CEFR level — determines which seeds are available */
  playerCefrLevel?: string;
  /** Vocabulary the player has already learned (used to select teachable words) */
  knownVocabulary?: string[];
  /** Specific seed ID to use, or omit for automatic selection */
  seedId?: string;
  /** Optional NPC who assigns the quest (e.g., a teacher NPC) */
  assignedBy?: string;
}

/** Difficulty thresholds by CEFR level */
const CEFR_TO_MAX_DIFFICULTY: Record<string, string[]> = {
  'A1': ['intermediate'],
  'A2': ['intermediate'],
  'B1': ['intermediate', 'advanced'],
  'B2': ['intermediate', 'advanced'],
  'C1': ['intermediate', 'advanced'],
  'C2': ['intermediate', 'advanced'],
};

// ── Generator ───────────────────────────────────────────────────────────────

/**
 * Get all available teaching-back quest seeds.
 */
export function getTeachingSeeds(): QuestSeed[] {
  return getSeedsByCategory('teaching');
}

/**
 * Select a teaching seed appropriate for the player's level.
 */
export function selectTeachingSeed(
  cefrLevel?: string,
  seedId?: string,
): QuestSeed | null {
  const seeds = getTeachingSeeds();
  if (seeds.length === 0) return null;

  if (seedId) {
    return seeds.find(s => s.id === seedId) || null;
  }

  const allowedDifficulties = cefrLevel
    ? CEFR_TO_MAX_DIFFICULTY[cefrLevel] || ['intermediate']
    : ['intermediate'];

  const eligible = seeds.filter(s => allowedDifficulties.includes(s.difficulty));
  if (eligible.length === 0) return seeds[0];

  // Random selection from eligible seeds
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/**
 * Generate a teaching-back quest from configuration.
 *
 * Returns an InstantiatedQuest ready to be inserted into the database,
 * or null if no suitable seed is found.
 */
export function generateTeachingQuest(config: TeachingQuestConfig): InstantiatedQuest | null {
  const seed = selectTeachingSeed(config.playerCefrLevel, config.seedId);
  if (!seed) return null;

  // Build parameter values from config
  const values: Record<string, string | number | string[]> = {
    npcName: config.studentNpcName,
  };

  // Fill in seed-specific defaults
  for (const param of seed.params) {
    if (values[param.name] === undefined && param.defaultValue !== undefined) {
      values[param.name] = param.defaultValue;
    }
  }

  const params: InstantiateParams = {
    worldId: config.worldId,
    targetLanguage: config.targetLanguage,
    assignedTo: config.playerName,
    assignedBy: config.assignedBy,
    values,
  };

  return instantiateSeed(seed, params);
}

/**
 * Generate multiple teaching quests for a chapter-5 style progression.
 * Returns up to `count` quests, each using a different seed.
 */
export function generateTeachingQuestBatch(
  config: Omit<TeachingQuestConfig, 'seedId'>,
  count: number,
): InstantiatedQuest[] {
  const seeds = getTeachingSeeds();
  const allowedDifficulties = config.playerCefrLevel
    ? CEFR_TO_MAX_DIFFICULTY[config.playerCefrLevel] || ['intermediate']
    : ['intermediate'];

  const eligible = seeds.filter(s => allowedDifficulties.includes(s.difficulty));
  const selected = eligible.slice(0, count);

  return selected
    .map(seed => generateTeachingQuest({ ...config, seedId: seed.id }))
    .filter((q): q is InstantiatedQuest => q !== null);
}
