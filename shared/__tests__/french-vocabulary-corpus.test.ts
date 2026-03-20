import { describe, it, expect } from 'vitest';
import {
  FRENCH_VOCABULARY_CORPUS,
  FrenchVocabularyCategory,
  FrenchVocabularyEntry,
  getFrenchCorpusSize,
  getFrenchCorpusByDifficulty,
  getFrenchCorpusByCategory,
  getFrenchCorpusCategorySummary,
  getFrenchCorpusByPartOfSpeech,
  getFrenchCorpusByGender,
  searchFrenchCorpus,
  getAllFrenchCorpusEntries,
} from '../language/french-vocabulary-corpus';

describe('French Vocabulary Corpus', () => {
  it('should have at least 2000 entries', () => {
    const size = getFrenchCorpusSize();
    expect(size).toBeGreaterThanOrEqual(2000);
  });

  it('should have entries in all categories', () => {
    const categories = Object.keys(FRENCH_VOCABULARY_CORPUS) as FrenchVocabularyCategory[];
    expect(categories.length).toBeGreaterThanOrEqual(20);
    for (const cat of categories) {
      expect(FRENCH_VOCABULARY_CORPUS[cat].length).toBeGreaterThan(0);
    }
  });

  it('should have valid entries with all required fields', () => {
    const allEntries = getAllFrenchCorpusEntries();
    for (const entry of allEntries) {
      expect(entry.english).toBeTruthy();
      expect(entry.french).toBeTruthy();
      expect(entry.pronunciation).toBeTruthy();
      expect(entry.partOfSpeech).toBeTruthy();
      expect(entry.difficulty).toBeTruthy();
      expect(entry.category).toBeTruthy();
    }
  });

  it('should have entries across all difficulty levels', () => {
    const beginner = getFrenchCorpusByDifficulty('beginner');
    const intermediate = getFrenchCorpusByDifficulty('intermediate');
    const advanced = getFrenchCorpusByDifficulty('advanced');

    expect(beginner.length).toBeGreaterThan(100);
    expect(intermediate.length).toBeGreaterThan(500);
    expect(advanced.length).toBeGreaterThan(50);

    // Total should match corpus size
    expect(beginner.length + intermediate.length + advanced.length).toBe(getFrenchCorpusSize());
  });

  it('should return entries by category', () => {
    const food = getFrenchCorpusByCategory('food');
    expect(food.length).toBeGreaterThan(20);
    for (const entry of food) {
      expect(entry.category).toBe('food');
    }
  });

  it('should return category summary with correct counts', () => {
    const summary = getFrenchCorpusCategorySummary();
    const totalFromSummary = summary.reduce((sum, s) => sum + s.count, 0);
    expect(totalFromSummary).toBe(getFrenchCorpusSize());
  });

  it('should filter by part of speech', () => {
    const nouns = getFrenchCorpusByPartOfSpeech('noun');
    expect(nouns.length).toBeGreaterThan(100);
    for (const entry of nouns) {
      expect(entry.partOfSpeech).toBe('noun');
    }

    const verbs = getFrenchCorpusByPartOfSpeech('verb');
    expect(verbs.length).toBeGreaterThan(50);
  });

  it('should filter by gender', () => {
    const masculine = getFrenchCorpusByGender('m');
    const feminine = getFrenchCorpusByGender('f');
    expect(masculine.length).toBeGreaterThan(50);
    expect(feminine.length).toBeGreaterThan(50);

    for (const entry of masculine) {
      expect(entry.gender).toBe('m');
    }
    for (const entry of feminine) {
      expect(entry.gender).toBe('f');
    }
  });

  it('should search by English word', () => {
    const results = searchFrenchCorpus('bread');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].french).toBe('pain');
  });

  it('should search by French word', () => {
    const results = searchFrenchCorpus('bonjour');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.english === 'hello' || r.english === 'good morning')).toBe(true);
  });

  it('should have correct French translations for common words', () => {
    const hello = searchFrenchCorpus('hello');
    expect(hello.some(e => e.french === 'bonjour')).toBe(true);

    const water = searchFrenchCorpus('water').filter(e => e.category === 'food');
    expect(water.some(e => e.french === 'eau')).toBe(true);

    const dog = searchFrenchCorpus('dog');
    expect(dog.some(e => e.french === 'chien')).toBe(true);
  });

  it('should have nouns with gender annotations', () => {
    const allEntries = getAllFrenchCorpusEntries();
    const nouns = allEntries.filter(e => e.partOfSpeech === 'noun');
    const nounsWithGender = nouns.filter(e => e.gender);
    // Most nouns should have gender
    expect(nounsWithGender.length / nouns.length).toBeGreaterThan(0.9);
  });

  it('should have IPA pronunciation for all entries', () => {
    const allEntries = getAllFrenchCorpusEntries();
    for (const entry of allEntries) {
      expect(entry.pronunciation.length).toBeGreaterThan(0);
    }
  });

  it('should have consistent category assignments', () => {
    const categories = Object.keys(FRENCH_VOCABULARY_CORPUS) as FrenchVocabularyCategory[];
    for (const cat of categories) {
      for (const entry of FRENCH_VOCABULARY_CORPUS[cat]) {
        expect(entry.category).toBe(cat);
      }
    }
  });

  it('getAllFrenchCorpusEntries should return flat array matching corpus size', () => {
    const all = getAllFrenchCorpusEntries();
    expect(all.length).toBe(getFrenchCorpusSize());
  });
});
