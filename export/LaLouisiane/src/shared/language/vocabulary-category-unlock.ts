/**
 * Vocabulary Category Unlocking via Quest Progression
 *
 * Categories start locked except for a starter set. Completing quests
 * with `unlocks` entries of type `vocabulary_category` adds the named
 * category to the player's unlocked set (persisted in playerProgress.saveData).
 */

import type { VocabularyCategory } from './vocabulary-corpus';

/** Categories available from the start of the game */
export const DEFAULT_UNLOCKED_CATEGORIES: VocabularyCategory[] = [
  'greetings',
  'numbers',
  'actions',
];

/** All 20 categories in the corpus */
export const ALL_VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  'greetings', 'numbers', 'food', 'family', 'body',
  'emotions', 'actions', 'colors', 'time', 'places',
  'professions', 'nature', 'weather', 'transportation',
  'clothing', 'household', 'animals', 'shopping',
  'directions', 'social',
];

/** Shape of a quest unlock entry that targets a vocabulary category */
export interface VocabCategoryUnlock {
  type: 'vocabulary_category';
  id: string;   // the VocabularyCategory key (e.g. 'food')
  name: string;  // display name (e.g. 'Food & Drink')
}

/**
 * Extract vocabulary-category unlocks from a quest's `unlocks` array.
 */
export function extractVocabCategoryUnlocks(
  unlocks: Array<{ type: string; id: string; name: string }> | null | undefined,
): VocabCategoryUnlock[] {
  if (!unlocks) return [];
  return unlocks.filter(
    (u): u is VocabCategoryUnlock => u.type === 'vocabulary_category',
  );
}

/**
 * Given the current set of unlocked categories and a list of newly unlocked ones,
 * return the merged set (deduped) and which categories were actually new.
 */
export function applyVocabCategoryUnlocks(
  current: string[],
  newUnlocks: VocabCategoryUnlock[],
): { updated: string[]; newlyUnlocked: string[] } {
  const set = new Set(current);
  const newlyUnlocked: string[] = [];

  for (const unlock of newUnlocks) {
    if (ALL_VOCABULARY_CATEGORIES.includes(unlock.id as VocabularyCategory) && !set.has(unlock.id)) {
      set.add(unlock.id);
      newlyUnlocked.push(unlock.id);
    }
  }

  return { updated: Array.from(set), newlyUnlocked };
}

/**
 * Get the initial unlocked-categories array for a new playthrough.
 */
export function getInitialUnlockedCategories(): string[] {
  return [...DEFAULT_UNLOCKED_CATEGORIES];
}

/**
 * Read the unlocked categories from a playerProgress saveData blob.
 * Falls back to defaults if the key is absent.
 */
export function getUnlockedCategoriesFromSaveData(
  saveData: Record<string, any> | null | undefined,
): string[] {
  if (!saveData || !Array.isArray(saveData.unlockedVocabularyCategories)) {
    return getInitialUnlockedCategories();
  }
  return saveData.unlockedVocabularyCategories;
}

/**
 * Check whether a specific category is unlocked for the player.
 */
export function isCategoryUnlocked(
  category: string,
  saveData: Record<string, any> | null | undefined,
): boolean {
  const unlocked = getUnlockedCategoriesFromSaveData(saveData);
  return unlocked.includes(category);
}

/**
 * Return all categories with their lock status.
 */
export function getCategoryLockStatus(
  saveData: Record<string, any> | null | undefined,
): Array<{ category: VocabularyCategory; unlocked: boolean }> {
  const unlocked = new Set(getUnlockedCategoriesFromSaveData(saveData));
  return ALL_VOCABULARY_CATEGORIES.map(cat => ({
    category: cat,
    unlocked: unlocked.has(cat),
  }));
}
