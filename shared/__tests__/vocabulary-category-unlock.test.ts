import { describe, it, expect } from 'vitest';
import {
  DEFAULT_UNLOCKED_CATEGORIES,
  ALL_VOCABULARY_CATEGORIES,
  extractVocabCategoryUnlocks,
  applyVocabCategoryUnlocks,
  getInitialUnlockedCategories,
  getUnlockedCategoriesFromSaveData,
  isCategoryUnlocked,
  getCategoryLockStatus,
} from '../language/vocabulary-category-unlock';

describe('vocabulary-category-unlock', () => {
  describe('DEFAULT_UNLOCKED_CATEGORIES', () => {
    it('includes greetings, numbers, and actions', () => {
      expect(DEFAULT_UNLOCKED_CATEGORIES).toContain('greetings');
      expect(DEFAULT_UNLOCKED_CATEGORIES).toContain('numbers');
      expect(DEFAULT_UNLOCKED_CATEGORIES).toContain('actions');
    });

    it('is a subset of ALL_VOCABULARY_CATEGORIES', () => {
      for (const cat of DEFAULT_UNLOCKED_CATEGORIES) {
        expect(ALL_VOCABULARY_CATEGORIES).toContain(cat);
      }
    });
  });

  describe('ALL_VOCABULARY_CATEGORIES', () => {
    it('contains 20 categories', () => {
      expect(ALL_VOCABULARY_CATEGORIES).toHaveLength(20);
    });
  });

  describe('extractVocabCategoryUnlocks', () => {
    it('returns empty array for null/undefined', () => {
      expect(extractVocabCategoryUnlocks(null)).toEqual([]);
      expect(extractVocabCategoryUnlocks(undefined)).toEqual([]);
    });

    it('returns empty array when no vocabulary_category unlocks', () => {
      const unlocks = [
        { type: 'area', id: 'forest', name: 'Forest' },
        { type: 'npc', id: 'merchant', name: 'Merchant' },
      ];
      expect(extractVocabCategoryUnlocks(unlocks)).toEqual([]);
    });

    it('extracts vocabulary_category entries', () => {
      const unlocks = [
        { type: 'area', id: 'forest', name: 'Forest' },
        { type: 'vocabulary_category', id: 'food', name: 'Food & Drink' },
        { type: 'vocabulary_category', id: 'family', name: 'Family' },
      ];
      const result = extractVocabCategoryUnlocks(unlocks);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('food');
      expect(result[1].id).toBe('family');
    });
  });

  describe('applyVocabCategoryUnlocks', () => {
    it('adds new categories to unlocked set', () => {
      const current = ['greetings', 'numbers', 'actions'];
      const newUnlocks = [
        { type: 'vocabulary_category' as const, id: 'food', name: 'Food' },
      ];
      const result = applyVocabCategoryUnlocks(current, newUnlocks);
      expect(result.updated).toContain('food');
      expect(result.newlyUnlocked).toEqual(['food']);
    });

    it('deduplicates already-unlocked categories', () => {
      const current = ['greetings', 'numbers', 'actions', 'food'];
      const newUnlocks = [
        { type: 'vocabulary_category' as const, id: 'food', name: 'Food' },
        { type: 'vocabulary_category' as const, id: 'family', name: 'Family' },
      ];
      const result = applyVocabCategoryUnlocks(current, newUnlocks);
      expect(result.newlyUnlocked).toEqual(['family']);
      expect(result.updated).toHaveLength(5);
    });

    it('ignores invalid category names', () => {
      const current = ['greetings'];
      const newUnlocks = [
        { type: 'vocabulary_category' as const, id: 'invalid_category', name: 'Bad' },
      ];
      const result = applyVocabCategoryUnlocks(current, newUnlocks);
      expect(result.newlyUnlocked).toEqual([]);
      expect(result.updated).toEqual(['greetings']);
    });

    it('handles empty new unlocks', () => {
      const current = ['greetings', 'numbers'];
      const result = applyVocabCategoryUnlocks(current, []);
      expect(result.newlyUnlocked).toEqual([]);
      expect(result.updated).toEqual(['greetings', 'numbers']);
    });
  });

  describe('getInitialUnlockedCategories', () => {
    it('returns a copy of default categories', () => {
      const initial = getInitialUnlockedCategories();
      expect(initial).toEqual(DEFAULT_UNLOCKED_CATEGORIES);
      // Verify it's a copy, not same reference
      initial.push('food');
      expect(getInitialUnlockedCategories()).not.toContain('food');
    });
  });

  describe('getUnlockedCategoriesFromSaveData', () => {
    it('returns defaults when saveData is null', () => {
      expect(getUnlockedCategoriesFromSaveData(null)).toEqual(DEFAULT_UNLOCKED_CATEGORIES);
    });

    it('returns defaults when saveData has no key', () => {
      expect(getUnlockedCategoriesFromSaveData({ foo: 'bar' })).toEqual(DEFAULT_UNLOCKED_CATEGORIES);
    });

    it('returns stored categories when present', () => {
      const saveData = { unlockedVocabularyCategories: ['greetings', 'food', 'family'] };
      expect(getUnlockedCategoriesFromSaveData(saveData)).toEqual(['greetings', 'food', 'family']);
    });
  });

  describe('isCategoryUnlocked', () => {
    it('returns true for default categories with no saveData', () => {
      expect(isCategoryUnlocked('greetings', null)).toBe(true);
      expect(isCategoryUnlocked('numbers', null)).toBe(true);
    });

    it('returns false for locked categories with no saveData', () => {
      expect(isCategoryUnlocked('food', null)).toBe(false);
      expect(isCategoryUnlocked('weather', null)).toBe(false);
    });

    it('respects stored unlock state', () => {
      const saveData = { unlockedVocabularyCategories: ['greetings', 'food'] };
      expect(isCategoryUnlocked('food', saveData)).toBe(true);
      expect(isCategoryUnlocked('family', saveData)).toBe(false);
    });
  });

  describe('getCategoryLockStatus', () => {
    it('returns all 20 categories with lock status', () => {
      const status = getCategoryLockStatus(null);
      expect(status).toHaveLength(20);
    });

    it('marks default categories as unlocked when no saveData', () => {
      const status = getCategoryLockStatus(null);
      const greetings = status.find(s => s.category === 'greetings');
      const food = status.find(s => s.category === 'food');
      expect(greetings?.unlocked).toBe(true);
      expect(food?.unlocked).toBe(false);
    });

    it('reflects saved unlock state', () => {
      const saveData = { unlockedVocabularyCategories: ['greetings', 'numbers', 'actions', 'food', 'weather'] };
      const status = getCategoryLockStatus(saveData);
      const food = status.find(s => s.category === 'food');
      const weather = status.find(s => s.category === 'weather');
      const family = status.find(s => s.category === 'family');
      expect(food?.unlocked).toBe(true);
      expect(weather?.unlocked).toBe(true);
      expect(family?.unlocked).toBe(false);
    });
  });
});
