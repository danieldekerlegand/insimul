import { describe, it, expect } from 'vitest';
import {
  questNeedsVocabIntro,
  getQuestVocabCategories,
  selectCorpusWordsForQuest,
  filterUnknownWords,
  isAdvancedPlayer,
  buildVocabularyIntroduction,
  createNewVocabularyEntries,
  generateFlashcards,
  type QuestVocabInput,
  type IntroductionWord,
} from '../language/quest-vocabulary-introduction';
import type { VocabularyEntry } from '../language/progress';
import { VOCABULARY_CORPUS } from '../language/vocabulary-corpus';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeQuest(overrides: Partial<QuestVocabInput> = {}): QuestVocabInput {
  return {
    questId: 'q1',
    questTitle: 'Test Quest',
    questType: 'vocabulary',
    difficulty: 'beginner',
    ...overrides,
  };
}

function makeVocabEntry(word: string, mastery: 'new' | 'learning' | 'familiar' | 'mastered' = 'new'): VocabularyEntry {
  return {
    word,
    language: 'es',
    meaning: word,
    category: 'food',
    timesEncountered: mastery === 'new' ? 0 : 5,
    timesUsedCorrectly: mastery === 'mastered' ? 10 : mastery === 'familiar' ? 5 : 0,
    timesUsedIncorrectly: 0,
    lastEncountered: Date.now(),
    masteryLevel: mastery,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Quest Vocabulary Introduction', () => {
  describe('questNeedsVocabIntro', () => {
    it('returns true for vocabulary quest types', () => {
      expect(questNeedsVocabIntro(makeQuest({ questType: 'vocabulary' }))).toBe(true);
      expect(questNeedsVocabIntro(makeQuest({ questType: 'shopping' }))).toBe(true);
      expect(questNeedsVocabIntro(makeQuest({ questType: 'business_roleplay' }))).toBe(true);
      expect(questNeedsVocabIntro(makeQuest({ questType: 'visual_vocabulary' }))).toBe(true);
      expect(questNeedsVocabIntro(makeQuest({ questType: 'cultural' }))).toBe(true);
      expect(questNeedsVocabIntro(makeQuest({ questType: 'scavenger_hunt' }))).toBe(true);
    });

    it('returns true when quest has explicit vocabulary words', () => {
      expect(questNeedsVocabIntro(makeQuest({
        questType: 'conversation',
        vocabularyWords: ['bread', 'water'],
      }))).toBe(true);
    });

    it('returns true when quest has a vocabulary category', () => {
      expect(questNeedsVocabIntro(makeQuest({
        questType: 'conversation',
        vocabularyCategory: 'food',
      }))).toBe(true);
    });

    it('returns true when quest has a business type', () => {
      expect(questNeedsVocabIntro(makeQuest({
        questType: 'conversation',
        businessType: 'bakery',
      }))).toBe(true);
    });

    it('returns false for non-vocabulary quests without vocab data', () => {
      expect(questNeedsVocabIntro(makeQuest({ questType: 'conversation' }))).toBe(false);
      expect(questNeedsVocabIntro(makeQuest({ questType: 'grammar' }))).toBe(false);
    });
  });

  describe('getQuestVocabCategories', () => {
    it('returns explicit category', () => {
      const cats = getQuestVocabCategories(makeQuest({ vocabularyCategory: 'food' }));
      expect(cats).toContain('food');
    });

    it('maps business type to categories', () => {
      const cats = getQuestVocabCategories(makeQuest({ businessType: 'bakery' }));
      expect(cats).toContain('food');
      expect(cats).toContain('shopping');
      expect(cats).toContain('greetings');
    });

    it('maps tags to categories', () => {
      const cats = getQuestVocabCategories(makeQuest({ tags: ['food', 'shopping'] }));
      expect(cats).toContain('food');
      expect(cats).toContain('shopping');
    });

    it('returns empty for unknown inputs', () => {
      const cats = getQuestVocabCategories(makeQuest({
        questType: 'grammar',
        vocabularyCategory: undefined,
      }));
      expect(cats).toEqual([]);
    });
  });

  describe('selectCorpusWordsForQuest', () => {
    it('selects words from the right category', () => {
      const words = selectCorpusWordsForQuest(makeQuest({ vocabularyCategory: 'food' }), 5);
      expect(words.length).toBeGreaterThan(0);
      expect(words.length).toBeLessThanOrEqual(5);
      expect(words.every(w => w.category === 'food')).toBe(true);
    });

    it('filters by quest difficulty', () => {
      const words = selectCorpusWordsForQuest(
        makeQuest({ vocabularyCategory: 'food', difficulty: 'beginner' }),
        20,
      );
      expect(words.every(w => w.difficulty === 'beginner')).toBe(true);
    });

    it('allows lower difficulties for intermediate quests', () => {
      const words = selectCorpusWordsForQuest(
        makeQuest({ vocabularyCategory: 'food', difficulty: 'intermediate' }),
        30,
      );
      const difficulties = new Set(words.map(w => w.difficulty));
      // Should include beginner or intermediate but not advanced
      for (const d of difficulties) {
        expect(['beginner', 'intermediate']).toContain(d);
      }
    });

    it('returns empty for unknown category', () => {
      const words = selectCorpusWordsForQuest(makeQuest({ questType: 'grammar' }), 5);
      expect(words).toEqual([]);
    });
  });

  describe('filterUnknownWords', () => {
    it('filters out familiar and mastered words', () => {

      const corpusWords = VOCABULARY_CORPUS.food.slice(0, 5);
      const playerVocab = [
        makeVocabEntry(corpusWords[0].english, 'familiar'),
        makeVocabEntry(corpusWords[1].english, 'mastered'),
      ];
      const filtered = filterUnknownWords(corpusWords, playerVocab);
      expect(filtered.length).toBe(3);
      expect(filtered.every(w => w.english !== corpusWords[0].english && w.english !== corpusWords[1].english)).toBe(true);
    });

    it('keeps new and learning words', () => {

      const corpusWords = VOCABULARY_CORPUS.food.slice(0, 3);
      const playerVocab = [
        makeVocabEntry(corpusWords[0].english, 'new'),
        makeVocabEntry(corpusWords[1].english, 'learning'),
      ];
      const filtered = filterUnknownWords(corpusWords, playerVocab);
      expect(filtered.length).toBe(3);
    });

    it('returns all when player has no vocabulary', () => {

      const corpusWords = VOCABULARY_CORPUS.food.slice(0, 5);
      const filtered = filterUnknownWords(corpusWords, []);
      expect(filtered.length).toBe(5);
    });
  });

  describe('isAdvancedPlayer', () => {
    it('returns false for undefined', () => {
      expect(isAdvancedPlayer(undefined)).toBe(false);
    });

    it('returns false for A1 and A2', () => {
      expect(isAdvancedPlayer('A1')).toBe(false);
      expect(isAdvancedPlayer('A2')).toBe(false);
    });

    it('returns true for B1 and B2', () => {
      expect(isAdvancedPlayer('B1')).toBe(true);
      expect(isAdvancedPlayer('B2')).toBe(true);
    });
  });

  describe('buildVocabularyIntroduction', () => {
    it('returns shouldShow=false for non-vocabulary quests', () => {
      const result = buildVocabularyIntroduction(
        makeQuest({ questType: 'grammar' }),
        [],
      );
      expect(result.shouldShow).toBe(false);
      expect(result.words).toEqual([]);
    });

    it('returns words for vocabulary quests', () => {
      const result = buildVocabularyIntroduction(
        makeQuest({ vocabularyCategory: 'food' }),
        [],
      );
      expect(result.shouldShow).toBe(true);
      expect(result.words.length).toBeGreaterThanOrEqual(3);
      expect(result.words.length).toBeLessThanOrEqual(5);
    });

    it('returns shouldShow=false when all words are known', () => {

      // Make all food words familiar
      const playerVocab = VOCABULARY_CORPUS.food.map((w: any) =>
        makeVocabEntry(w.english, 'familiar'),
      );
      const result = buildVocabularyIntroduction(
        makeQuest({ vocabularyCategory: 'food', difficulty: 'beginner' }),
        playerVocab,
      );
      expect(result.shouldShow).toBe(false);
      expect(result.skipReason).toBe('all_words_known');
    });

    it('sets skippable=true for B1+ players', () => {
      const result = buildVocabularyIntroduction(
        makeQuest({ vocabularyCategory: 'food' }),
        [],
        'B1',
      );
      expect(result.skippable).toBe(true);
      expect(result.skipReason).toBe('advanced_player');
    });

    it('sets skippable=false for beginners', () => {
      const result = buildVocabularyIntroduction(
        makeQuest({ vocabularyCategory: 'food' }),
        [],
        'A1',
      );
      expect(result.skippable).toBe(false);
    });

    it('uses explicit vocabulary words when provided', () => {
      const result = buildVocabularyIntroduction(
        makeQuest({ vocabularyWords: ['bread', 'water', 'milk'] }),
        [],
      );
      expect(result.shouldShow).toBe(true);
      const englishWords = result.words.map(w => w.english);
      expect(englishWords).toContain('bread');
      expect(englishWords).toContain('water');
      expect(englishWords).toContain('milk');
    });

    it('fills introduction words with correct structure', () => {
      const result = buildVocabularyIntroduction(
        makeQuest({ vocabularyCategory: 'food' }),
        [],
      );
      for (const word of result.words) {
        expect(word).toHaveProperty('targetWord');
        expect(word).toHaveProperty('romanization');
        expect(word).toHaveProperty('english');
        expect(word).toHaveProperty('partOfSpeech');
        expect(word).toHaveProperty('exampleSentence');
        expect(word).toHaveProperty('exampleTranslation');
        expect(word).toHaveProperty('category');
        expect(word.english).toBeTruthy();
        expect(word.category).toBe('food');
      }
    });

    it('handles business quest types', () => {
      const result = buildVocabularyIntroduction(
        makeQuest({ questType: 'business_roleplay', businessType: 'bakery' }),
        [],
      );
      expect(result.shouldShow).toBe(true);
      expect(result.words.length).toBeGreaterThanOrEqual(3);
      const categories = new Set(result.words.map(w => w.category));
      // Bakery should pull from food, shopping, or greetings
      const validCats = new Set(['food', 'shopping', 'greetings']);
      for (const cat of categories) {
        expect(validCats.has(cat)).toBe(true);
      }
    });
  });

  describe('createNewVocabularyEntries', () => {
    it('creates entries with new mastery level', () => {
      const introWords: IntroductionWord[] = [
        {
          targetWord: 'pan',
          romanization: 'pahn',
          english: 'bread',
          partOfSpeech: 'noun',
          exampleSentence: 'Quiero pan.',
          exampleTranslation: 'I want bread.',
          category: 'food',
        },
      ];
      const entries = createNewVocabularyEntries(introWords, 'es');
      expect(entries).toHaveLength(1);
      expect(entries[0].word).toBe('pan');
      expect(entries[0].language).toBe('es');
      expect(entries[0].meaning).toBe('bread');
      expect(entries[0].masteryLevel).toBe('new');
      expect(entries[0].timesEncountered).toBe(1);
      expect(entries[0].timesUsedCorrectly).toBe(0);
      expect(entries[0].context).toBe('Quiero pan.');
    });

    it('uses english as word fallback when targetWord is empty', () => {
      const introWords: IntroductionWord[] = [
        {
          targetWord: '',
          romanization: '',
          english: 'bread',
          partOfSpeech: 'noun',
          exampleSentence: '',
          exampleTranslation: '',
          category: 'food',
        },
      ];
      const entries = createNewVocabularyEntries(introWords, 'fr');
      expect(entries[0].word).toBe('bread');
    });
  });

  describe('generateFlashcards', () => {
    it('generates flashcards from introduction words', () => {
      const introWords: IntroductionWord[] = [
        {
          targetWord: 'pan',
          romanization: 'pahn',
          english: 'bread',
          partOfSpeech: 'noun',
          exampleSentence: '',
          exampleTranslation: '',
          category: 'food',
        },
        {
          targetWord: 'agua',
          romanization: 'ah-gwah',
          english: 'water',
          partOfSpeech: 'noun',
          exampleSentence: '',
          exampleTranslation: '',
          category: 'food',
        },
      ];
      const cards = generateFlashcards(introWords);
      expect(cards).toHaveLength(2);
      expect(cards[0].front).toBe('pan');
      expect(cards[0].back).toBe('bread');
      expect(cards[0].category).toBe('food');
      expect(cards[1].front).toBe('agua');
      expect(cards[1].back).toBe('water');
    });

    it('uses english as fallback for front when targetWord empty', () => {
      const introWords: IntroductionWord[] = [
        {
          targetWord: '',
          romanization: '',
          english: 'bread',
          partOfSpeech: 'noun',
          exampleSentence: '',
          exampleTranslation: '',
          category: 'food',
        },
      ];
      const cards = generateFlashcards(introWords);
      expect(cards[0].front).toBe('bread');
    });
  });
});
