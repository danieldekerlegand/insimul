/**
 * Tests for Language Progress display fix.
 *
 * Verifies that:
 * 1. LanguageProgressTracker.loadFromServer() correctly loads and merges server data
 * 2. The persistent tracker provides data even when no conversation is active
 * 3. Vocabulary and grammar data from prior sessions is accessible
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LanguageProgressTracker } from '../LanguageProgressTracker';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('LanguageProgressTracker.loadFromServer', () => {
  let tracker: LanguageProgressTracker;

  beforeEach(() => {
    vi.clearAllMocks();
    tracker = new LanguageProgressTracker('player1', 'world1', 'Spanish', 'pt1');
  });

  afterEach(() => {
    tracker.dispose();
  });

  it('should load vocabulary from server into empty tracker', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: {
          overallFluency: 35,
          totalConversations: 5,
          totalWordsLearned: 10,
          streakDays: 2,
        },
        vocabulary: [
          {
            word: 'hola',
            meaning: 'hello',
            category: 'greetings',
            timesEncountered: 8,
            timesUsedCorrectly: 5,
            timesUsedIncorrectly: 1,
            lastEncountered: 1000,
            masteryLevel: 'familiar',
          },
          {
            word: 'gracias',
            meaning: 'thank you',
            category: 'greetings',
            timesEncountered: 3,
            timesUsedCorrectly: 2,
            timesUsedIncorrectly: 0,
            lastEncountered: 2000,
            masteryLevel: 'learning',
          },
        ],
        grammarPatterns: [
          {
            pattern: 'subject-verb agreement',
            correctUsages: 4,
            incorrectUsages: 2,
            masteryLevel: 'learning',
            examples: ['Yo soy estudiante'],
          },
        ],
        conversations: [
          {
            id: 'conv_100',
            characterId: 'npc1',
            characterName: 'Maria',
            timestamp: 100,
            turns: 6,
            wordsUsed: ['hola', 'gracias'],
            targetLanguagePercentage: 40,
            fluencyGained: 5,
          },
        ],
      }),
    });

    await tracker.loadFromServer();

    const progress = tracker.getProgress();
    expect(progress.overallFluency).toBe(35);
    expect(progress.totalConversations).toBe(5);
    expect(progress.totalWordsLearned).toBe(10);
    expect(progress.streakDays).toBe(2);

    const vocab = tracker.getVocabulary();
    expect(vocab).toHaveLength(2);
    expect(vocab.find(v => v.word === 'hola')).toMatchObject({
      meaning: 'hello',
      category: 'greetings',
      timesEncountered: 8,
      masteryLevel: 'familiar',
    });
    expect(vocab.find(v => v.word === 'gracias')).toMatchObject({
      meaning: 'thank you',
      masteryLevel: 'learning',
    });

    const patterns = tracker.getGrammarPatterns();
    expect(patterns).toHaveLength(1);
    expect(patterns[0].pattern).toBe('subject-verb agreement');
    expect(patterns[0].timesUsedCorrectly).toBe(4);
    expect(patterns[0].timesUsedIncorrectly).toBe(2);
  });

  it('should fetch with correct URL including playthroughId', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: null,
        vocabulary: [],
        grammarPatterns: [],
        conversations: [],
      }),
    });

    await tracker.loadFromServer();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/language-progress/player1/world1?playthroughId=pt1'
    );
  });

  it('should fetch without playthroughId when not set', async () => {
    const noPtTracker = new LanguageProgressTracker('player1', 'world1', 'Spanish');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: null,
        vocabulary: [],
        grammarPatterns: [],
        conversations: [],
      }),
    });

    await noPtTracker.loadFromServer();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/language-progress/player1/world1'
    );
    noPtTracker.dispose();
  });

  it('should merge server vocabulary with existing local vocabulary', async () => {
    // Add a local word first
    tracker.addVocabularyWord('hola', 'hello', 'greetings', true);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: { overallFluency: 20 },
        vocabulary: [
          {
            word: 'hola',
            meaning: 'hello',
            category: 'greetings',
            timesEncountered: 15, // more than local
            timesUsedCorrectly: 10,
            masteryLevel: 'mastered',
          },
          {
            word: 'adios',
            meaning: 'goodbye',
            category: 'greetings',
            timesEncountered: 5,
            timesUsedCorrectly: 3,
            masteryLevel: 'learning',
          },
        ],
        grammarPatterns: [],
        conversations: [],
      }),
    });

    await tracker.loadFromServer();

    const vocab = tracker.getVocabulary();
    expect(vocab).toHaveLength(2);

    // hola should be updated since server has more encounters
    const hola = vocab.find(v => v.word === 'hola')!;
    expect(hola.timesEncountered).toBe(15);
    expect(hola.masteryLevel).toBe('mastered');

    // adios should be added as new
    const adios = vocab.find(v => v.word === 'adios')!;
    expect(adios.meaning).toBe('goodbye');
    expect(adios.timesEncountered).toBe(5);
  });

  it('should not overwrite local word when local has more encounters', async () => {
    // Simulate many local encounters
    for (let i = 0; i < 20; i++) {
      tracker.addVocabularyWord('hola', 'hello', 'greetings', true);
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: {},
        vocabulary: [
          {
            word: 'hola',
            meaning: 'hello',
            timesEncountered: 5, // fewer than local
            timesUsedCorrectly: 2,
            masteryLevel: 'learning',
          },
        ],
        grammarPatterns: [],
        conversations: [],
      }),
    });

    await tracker.loadFromServer();

    const hola = tracker.getVocabulary().find(v => v.word === 'hola')!;
    expect(hola.timesEncountered).toBe(20);
  });

  it('should handle server error gracefully', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    // Should not throw
    await tracker.loadFromServer();

    // Tracker should still work with empty data
    expect(tracker.getVocabulary()).toHaveLength(0);
    expect(tracker.getGrammarPatterns()).toHaveLength(0);
  });

  it('should handle network failure gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await tracker.loadFromServer();

    expect(tracker.getVocabulary()).toHaveLength(0);
  });

  it('should merge grammar patterns from server', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: {},
        vocabulary: [],
        grammarPatterns: [
          {
            pattern: 'past tense',
            correctUsages: 8,
            incorrectUsages: 1,
            masteryLevel: 'mastered',
            examples: ['Yo comí'],
            explanations: ['Regular -er verbs use -í'],
          },
          {
            pattern: 'gender agreement',
            correctUsages: 3,
            incorrectUsages: 4,
            masteryLevel: 'learning',
          },
        ],
        conversations: [],
      }),
    });

    await tracker.loadFromServer();

    const patterns = tracker.getGrammarPatterns();
    expect(patterns).toHaveLength(2);

    const pastTense = patterns.find(p => p.pattern === 'past tense')!;
    expect(pastTense.mastered).toBe(true);
    expect(pastTense.timesUsedCorrectly).toBe(8);

    const gender = patterns.find(p => p.pattern === 'gender agreement')!;
    expect(gender.mastered).toBe(false);
    expect(gender.timesUsedIncorrectly).toBe(4);
  });

  it('should deduplicate conversations by ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: {},
        vocabulary: [],
        grammarPatterns: [],
        conversations: [
          { id: 'conv_1', characterId: 'npc1', timestamp: 100, turns: 5 },
          { id: 'conv_2', characterId: 'npc2', timestamp: 200, turns: 3 },
        ],
      }),
    });

    await tracker.loadFromServer();

    const convos = tracker.getRecentConversations(20);
    expect(convos).toHaveLength(2);
  });

  it('should recompute totalCorrectUsages from loaded vocabulary', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: { totalCorrectUsages: 0 }, // server might have stale value
        vocabulary: [
          { word: 'hola', meaning: 'hello', timesEncountered: 10, timesUsedCorrectly: 7, masteryLevel: 'familiar' },
          { word: 'adios', meaning: 'bye', timesEncountered: 5, timesUsedCorrectly: 3, masteryLevel: 'learning' },
        ],
        grammarPatterns: [],
        conversations: [],
      }),
    });

    await tracker.loadFromServer();

    const progress = tracker.getProgress();
    expect(progress.totalCorrectUsages).toBe(10); // 7 + 3
  });
});

describe('Persistent tracker provides data without active conversation', () => {
  it('should return vocabulary data from loaded server data', async () => {
    const tracker = new LanguageProgressTracker('player1', 'world1', 'Spanish');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: { overallFluency: 45 },
        vocabulary: [
          { word: 'casa', meaning: 'house', timesEncountered: 12, timesUsedCorrectly: 8, masteryLevel: 'familiar', category: 'general' },
        ],
        grammarPatterns: [
          { pattern: 'ser vs estar', correctUsages: 5, incorrectUsages: 2, masteryLevel: 'learning' },
        ],
        conversations: [],
      }),
    });

    await tracker.loadFromServer();

    // Simulate what getVocabularyData callback does
    const vocabulary = tracker.getVocabulary();
    const grammarPatterns = tracker.getGrammarPatterns();
    const progress = tracker.getProgress();

    expect(vocabulary).toHaveLength(1);
    expect(vocabulary[0].word).toBe('casa');
    expect(grammarPatterns).toHaveLength(1);
    expect(grammarPatterns[0].pattern).toBe('ser vs estar');
    expect(progress.overallFluency).toBe(45);

    tracker.dispose();
  });

  it('should accumulate conversation data across multiple conversations', async () => {
    const tracker = new LanguageProgressTracker('player1', 'world1', 'Spanish');

    // Load initial data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progress: { overallFluency: 10, totalConversations: 1, totalWordsLearned: 2 },
        vocabulary: [
          { word: 'hola', meaning: 'hello', timesEncountered: 3, timesUsedCorrectly: 2, masteryLevel: 'learning' },
        ],
        grammarPatterns: [],
        conversations: [],
      }),
    });
    await tracker.loadFromServer();

    // Simulate a new conversation adding a word
    tracker.addVocabularyWord('gracias', 'thank you', 'greetings', true);

    const vocab = tracker.getVocabulary();
    expect(vocab).toHaveLength(2);
    expect(vocab.find(v => v.word === 'hola')).toBeDefined();
    expect(vocab.find(v => v.word === 'gracias')).toBeDefined();

    tracker.dispose();
  });
});
