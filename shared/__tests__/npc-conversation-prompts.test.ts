import { describe, it, expect } from 'vitest';
import type { VocabularyEntry, GrammarPattern } from '../language/progress.js';
import {
  getReviewWordsForNPC,
  getWeakGrammarPatterns,
  buildVocabGrammarPrompt,
  type VocabGrammarPromptContext,
} from '../language/npc-conversation-prompts.js';

// ── Test Helpers ─────────────────────────────────────────────────────────────

function makeVocabEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'bonjour',
    language: 'French',
    meaning: 'hello',
    category: 'greetings',
    timesEncountered: 3,
    timesUsedCorrectly: 1,
    timesUsedIncorrectly: 0,
    lastEncountered: Date.now() - 60 * 60 * 1000, // 1 hour ago
    masteryLevel: 'learning',
    ...overrides,
  };
}

function makeGrammarPattern(overrides: Partial<GrammarPattern> = {}): GrammarPattern {
  return {
    id: 'past-tense-1',
    pattern: 'past tense',
    language: 'French',
    timesUsedCorrectly: 2,
    timesUsedIncorrectly: 5,
    mastered: false,
    examples: ['J\'ai mangé', 'Il a parlé'],
    explanations: ['Use avoir + past participle for most verbs'],
    ...overrides,
  };
}

// ── getReviewWordsForNPC ─────────────────────────────────────────────────────

describe('getReviewWordsForNPC', () => {
  it('returns empty array for empty vocabulary', () => {
    expect(getReviewWordsForNPC([])).toEqual([]);
  });

  it('selects words due for review', () => {
    const now = Date.now();
    const vocab: VocabularyEntry[] = [
      makeVocabEntry({ word: 'bonjour', meaning: 'hello', masteryLevel: 'learning', lastEncountered: now - 2 * 60 * 60 * 1000 }),
      makeVocabEntry({ word: 'merci', meaning: 'thank you', masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 }),
      makeVocabEntry({ word: 'chat', meaning: 'cat', masteryLevel: 'mastered', lastEncountered: now - 1000 }), // not due
    ];

    const result = getReviewWordsForNPC(vocab, 5, now);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some(w => w.word === 'merci')).toBe(true);
    expect(result.some(w => w.word === 'bonjour')).toBe(true);
  });

  it('returns word, meaning, masteryLevel, and category', () => {
    const now = Date.now();
    const vocab = [makeVocabEntry({ lastEncountered: now - 2 * 60 * 60 * 1000 })];
    const result = getReviewWordsForNPC(vocab, 5, now);

    expect(result[0]).toEqual({
      word: 'bonjour',
      meaning: 'hello',
      masteryLevel: 'learning',
      category: 'greetings',
    });
  });

  it('respects the count limit', () => {
    const now = Date.now();
    const vocab = Array.from({ length: 20 }, (_, i) =>
      makeVocabEntry({
        word: `word${i}`,
        meaning: `meaning${i}`,
        lastEncountered: now - 2 * 60 * 60 * 1000,
      }),
    );
    const result = getReviewWordsForNPC(vocab, 3, now);
    expect(result.length).toBe(3);
  });
});

// ── getWeakGrammarPatterns ───────────────────────────────────────────────────

describe('getWeakGrammarPatterns', () => {
  it('returns empty array for empty grammar patterns', () => {
    expect(getWeakGrammarPatterns([])).toEqual([]);
  });

  it('filters out patterns with high accuracy', () => {
    const patterns = [
      makeGrammarPattern({ timesUsedCorrectly: 9, timesUsedIncorrectly: 1 }), // 90% - above threshold
    ];
    expect(getWeakGrammarPatterns(patterns)).toEqual([]);
  });

  it('filters out patterns with too few attempts', () => {
    const patterns = [
      makeGrammarPattern({ timesUsedCorrectly: 0, timesUsedIncorrectly: 1 }), // only 1 attempt
    ];
    expect(getWeakGrammarPatterns(patterns)).toEqual([]);
  });

  it('returns patterns below accuracy threshold with enough attempts', () => {
    const patterns = [
      makeGrammarPattern({ pattern: 'past tense', timesUsedCorrectly: 2, timesUsedIncorrectly: 5 }), // 29%
      makeGrammarPattern({ pattern: 'gender agreement', timesUsedCorrectly: 3, timesUsedIncorrectly: 4, id: 'gender-1' }), // 43%
    ];
    const result = getWeakGrammarPatterns(patterns);
    expect(result.length).toBe(2);
    // Sorted by accuracy ascending
    expect(result[0].pattern).toBe('past tense');
    expect(result[0].accuracy).toBe(29);
    expect(result[1].pattern).toBe('gender agreement');
    expect(result[1].accuracy).toBe(43);
  });

  it('limits to count parameter', () => {
    const patterns = Array.from({ length: 10 }, (_, i) =>
      makeGrammarPattern({
        id: `p-${i}`,
        pattern: `pattern-${i}`,
        timesUsedCorrectly: 1,
        timesUsedIncorrectly: 5,
      }),
    );
    const result = getWeakGrammarPatterns(patterns, 2);
    expect(result.length).toBe(2);
  });

  it('includes recent examples', () => {
    const patterns = [
      makeGrammarPattern({
        timesUsedCorrectly: 1,
        timesUsedIncorrectly: 4,
        examples: ['ex1', 'ex2', 'ex3', 'ex4'],
      }),
    ];
    const result = getWeakGrammarPatterns(patterns);
    expect(result[0].recentExamples).toEqual(['ex2', 'ex3', 'ex4']); // last 3
  });
});

// ── buildVocabGrammarPrompt ──────────────────────────────────────────────────

describe('buildVocabGrammarPrompt', () => {
  it('returns empty string when no review words and no grammar patterns', () => {
    const ctx: VocabGrammarPromptContext = {
      reviewWords: [],
      weakGrammarPatterns: [],
      playerProficiency: 'beginner',
      targetLanguage: 'French',
    };
    expect(buildVocabGrammarPrompt(ctx)).toBe('');
  });

  it('includes vocabulary review section when words are present', () => {
    const ctx: VocabGrammarPromptContext = {
      reviewWords: [
        { word: 'bonjour', meaning: 'hello', masteryLevel: 'new', category: 'greetings' },
        { word: 'merci', meaning: 'thank you', masteryLevel: 'familiar', category: 'greetings' },
      ],
      weakGrammarPatterns: [],
      playerProficiency: 'beginner',
      targetLanguage: 'French',
    };
    const prompt = buildVocabGrammarPrompt(ctx);
    expect(prompt).toContain('VOCABULARY & GRAMMAR REVIEW');
    expect(prompt).toContain('bonjour');
    expect(prompt).toContain('merci');
    expect(prompt).toContain('Words due for review');
    expect(prompt).toContain('naturally use 2-3');
  });

  it('includes mastery-specific instructions for new words', () => {
    const ctx: VocabGrammarPromptContext = {
      reviewWords: [
        { word: 'bonjour', meaning: 'hello', masteryLevel: 'new' },
      ],
      weakGrammarPatterns: [],
      playerProficiency: 'beginner',
      targetLanguage: 'French',
    };
    const prompt = buildVocabGrammarPrompt(ctx);
    expect(prompt).toContain('newer words');
    expect(prompt).toContain('pause briefly');
  });

  it('includes mastery-specific instructions for familiar words', () => {
    const ctx: VocabGrammarPromptContext = {
      reviewWords: [
        { word: 'merci', meaning: 'thank you', masteryLevel: 'familiar' },
      ],
      weakGrammarPatterns: [],
      playerProficiency: 'intermediate',
      targetLanguage: 'French',
    };
    const prompt = buildVocabGrammarPrompt(ctx);
    expect(prompt).toContain('familiar words');
    expect(prompt).toContain('recognize them in flow');
  });

  it('includes grammar focus section when patterns are present', () => {
    const ctx: VocabGrammarPromptContext = {
      reviewWords: [],
      weakGrammarPatterns: [
        { pattern: 'past tense', accuracy: 30, totalAttempts: 7, recentExamples: [] },
      ],
      playerProficiency: 'beginner',
      targetLanguage: 'French',
    };
    const prompt = buildVocabGrammarPrompt(ctx);
    expect(prompt).toContain('VOCABULARY & GRAMMAR REVIEW');
    expect(prompt).toContain('past tense');
    expect(prompt).toContain('30% accuracy');
    expect(prompt).toContain('gently correct');
    expect(prompt).toContain('Do NOT use grammar terminology');
  });

  it('includes both vocabulary and grammar when both are present', () => {
    const ctx: VocabGrammarPromptContext = {
      reviewWords: [
        { word: 'pain', meaning: 'bread', masteryLevel: 'learning' },
      ],
      weakGrammarPatterns: [
        { pattern: 'article usage', accuracy: 45, totalAttempts: 10, recentExamples: [] },
      ],
      playerProficiency: 'beginner',
      targetLanguage: 'French',
    };
    const prompt = buildVocabGrammarPrompt(ctx);
    expect(prompt).toContain('Words due for review');
    expect(prompt).toContain('pain');
    expect(prompt).toContain('Grammar patterns the player struggles with');
    expect(prompt).toContain('article usage');
  });

  it('includes target language and proficiency level', () => {
    const ctx: VocabGrammarPromptContext = {
      reviewWords: [{ word: 'chat', meaning: 'cat', masteryLevel: 'new' }],
      weakGrammarPatterns: [],
      playerProficiency: 'advanced',
      targetLanguage: 'Chitimacha',
    };
    const prompt = buildVocabGrammarPrompt(ctx);
    expect(prompt).toContain('Chitimacha');
    expect(prompt).toContain('advanced');
  });
});
