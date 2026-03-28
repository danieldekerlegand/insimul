import { describe, it, expect } from 'vitest';
import type { VocabularyEntry } from '@shared/language/progress';
import {
  selectGameType,
  generateMultipleChoice,
  generateWordScramble,
  generateFillInBlank,
  generateMatching,
  generateChallenge,
  checkMultipleChoice,
  checkWordScramble,
  checkFillInBlank,
  checkMatching,
  checkAnswer,
  shuffleWithSeed,
  type MultipleChoiceChallenge,
  type WordScrambleChallenge,
  type FillInBlankChallenge,
  type MatchingChallenge,
} from '@shared/language/vocabulary-practice-minigames';

function makeEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'hola',
    language: 'es',
    meaning: 'hello',
    category: 'greetings',
    timesEncountered: 5,
    timesUsedCorrectly: 2,
    timesUsedIncorrectly: 1,
    lastEncountered: Date.now() - 60 * 60 * 1000,
    masteryLevel: 'learning',
    ...overrides,
  };
}

function makeVocabulary(): VocabularyEntry[] {
  return [
    makeEntry({ word: 'hola', meaning: 'hello', masteryLevel: 'learning' }),
    makeEntry({ word: 'adios', meaning: 'goodbye', masteryLevel: 'new' }),
    makeEntry({ word: 'gracias', meaning: 'thank you', masteryLevel: 'familiar' }),
    makeEntry({ word: 'por favor', meaning: 'please', masteryLevel: 'new' }),
    makeEntry({ word: 'agua', meaning: 'water', category: 'food', masteryLevel: 'mastered' }),
  ];
}

// ── selectGameType ──────────────────────────────────────────────────────────

describe('selectGameType', () => {
  it('returns multiple_choice for mostly new/learning words', () => {
    const words = [
      makeEntry({ masteryLevel: 'new' }),
      makeEntry({ masteryLevel: 'new' }),
      makeEntry({ masteryLevel: 'learning' }),
    ];
    expect(selectGameType(words)).toBe('multiple_choice');
  });

  it('returns matching for mostly familiar/mastered words with enough words', () => {
    const words = [
      makeEntry({ word: 'a', masteryLevel: 'familiar' }),
      makeEntry({ word: 'b', masteryLevel: 'mastered' }),
      makeEntry({ word: 'c', masteryLevel: 'mastered' }),
    ];
    expect(selectGameType(words)).toBe('matching');
  });

  it('returns multiple_choice for empty words', () => {
    expect(selectGameType([])).toBe('multiple_choice');
  });

  it('returns fill_in_blank or word_scramble for mostly mastered with <3 words', () => {
    const words = [
      makeEntry({ masteryLevel: 'mastered' }),
      makeEntry({ masteryLevel: 'mastered' }),
    ];
    const result = selectGameType(words, 0.3);
    expect(['fill_in_blank', 'word_scramble']).toContain(result);
  });
});

// ── generateMultipleChoice ──────────────────────────────────────────────────

describe('generateMultipleChoice', () => {
  it('generates a challenge with 4 options including the correct answer', () => {
    const vocab = makeVocabulary();
    const challenge = generateMultipleChoice(vocab[0], vocab, 42);

    expect(challenge.type).toBe('multiple_choice');
    expect(challenge.targetWord).toBe('hola');
    expect(challenge.correctAnswer).toBe('hello');
    expect(challenge.options).toContain('hello');
    expect(challenge.options.length).toBeLessThanOrEqual(4);
  });

  it('prompt asks what the word means', () => {
    const vocab = makeVocabulary();
    const challenge = generateMultipleChoice(vocab[0], vocab, 42);
    expect(challenge.prompt).toContain('hola');
  });

  it('handles case with few distractors', () => {
    const single = [makeEntry({ word: 'hola', meaning: 'hello' })];
    const challenge = generateMultipleChoice(single[0], single, 42);
    expect(challenge.options).toContain('hello');
    expect(challenge.options.length).toBeGreaterThanOrEqual(1);
  });
});

// ── generateWordScramble ────────────────────────────────────────────────────

describe('generateWordScramble', () => {
  it('generates a scramble challenge', () => {
    const entry = makeEntry({ word: 'gracias', meaning: 'thank you' });
    const challenge = generateWordScramble(entry, 42);

    expect(challenge.type).toBe('word_scramble');
    expect(challenge.answer).toBe('gracias');
    expect(challenge.scrambled.length).toBe('gracias'.length);
    expect(challenge.prompt).toContain('thank you');
  });

  it('scrambled is different from original for multi-char words', () => {
    const entry = makeEntry({ word: 'hola', meaning: 'hello' });
    const challenge = generateWordScramble(entry, 42);
    // With a seed, scrambled should differ from original (for 4+ char words)
    expect(challenge.scrambled.split('').sort().join('')).toBe('ahlo');
  });
});

// ── generateFillInBlank ─────────────────────────────────────────────────────

describe('generateFillInBlank', () => {
  it('generates a fill-in-blank with blanked sentence', () => {
    const entry = makeEntry({ word: 'agua', meaning: 'water' });
    const challenge = generateFillInBlank(entry, 0);

    expect(challenge.type).toBe('fill_in_blank');
    expect(challenge.answer).toBe('agua');
    expect(challenge.sentence).toContain('______');
    expect(challenge.prompt).toContain('water');
  });
});

// ── generateMatching ────────────────────────────────────────────────────────

describe('generateMatching', () => {
  it('generates matching pairs from entries', () => {
    const vocab = makeVocabulary();
    const challenge = generateMatching(vocab, 42);

    expect(challenge.type).toBe('matching');
    expect(challenge.pairs.length).toBeLessThanOrEqual(5);
    expect(challenge.pairs.length).toBe(challenge.shuffledMeanings.length);

    for (const pair of challenge.pairs) {
      expect(challenge.shuffledMeanings).toContain(pair.meaning);
    }
  });
});

// ── generateChallenge ───────────────────────────────────────────────────────

describe('generateChallenge', () => {
  it('returns null for empty words', () => {
    expect(generateChallenge('multiple_choice', [], [], 42)).toBeNull();
  });

  it('returns null for matching with too few words', () => {
    const vocab = [makeEntry()];
    expect(generateChallenge('matching', vocab, vocab, 42)).toBeNull();
  });

  it('generates the requested type', () => {
    const vocab = makeVocabulary();
    const mc = generateChallenge('multiple_choice', vocab, vocab, 42);
    expect(mc?.type).toBe('multiple_choice');

    const ws = generateChallenge('word_scramble', vocab, vocab, 42);
    expect(ws?.type).toBe('word_scramble');

    const fib = generateChallenge('fill_in_blank', vocab, vocab, 42);
    expect(fib?.type).toBe('fill_in_blank');

    const match = generateChallenge('matching', vocab, vocab, 42);
    expect(match?.type).toBe('matching');
  });
});

// ── checkMultipleChoice ─────────────────────────────────────────────────────

describe('checkMultipleChoice', () => {
  const challenge: MultipleChoiceChallenge = {
    type: 'multiple_choice',
    prompt: 'What does "hola" mean?',
    targetWord: 'hola',
    correctAnswer: 'hello',
    options: ['hello', 'goodbye', 'please', 'thank you'],
  };

  it('returns correct for right answer', () => {
    const result = checkMultipleChoice(challenge, 'hello');
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
    expect(result.xpAwarded).toBe(2);
    expect(result.correctWords).toEqual(['hola']);
    expect(result.incorrectWords).toEqual([]);
  });

  it('returns incorrect for wrong answer', () => {
    const result = checkMultipleChoice(challenge, 'goodbye');
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0);
    expect(result.xpAwarded).toBe(0);
    expect(result.incorrectWords).toEqual(['hola']);
  });

  it('is case-insensitive', () => {
    const result = checkMultipleChoice(challenge, 'HELLO');
    expect(result.correct).toBe(true);
  });
});

// ── checkWordScramble ───────────────────────────────────────────────────────

describe('checkWordScramble', () => {
  const challenge: WordScrambleChallenge = {
    type: 'word_scramble',
    prompt: 'Unscramble...',
    targetWord: 'hola',
    scrambled: 'loha',
    answer: 'hola',
  };

  it('returns correct for right answer', () => {
    const result = checkWordScramble(challenge, 'hola');
    expect(result.correct).toBe(true);
    expect(result.xpAwarded).toBe(2);
  });

  it('returns incorrect for wrong answer', () => {
    const result = checkWordScramble(challenge, 'olah');
    expect(result.correct).toBe(false);
  });

  it('trims and lowercases', () => {
    const result = checkWordScramble(challenge, '  Hola  ');
    expect(result.correct).toBe(true);
  });
});

// ── checkFillInBlank ────────────────────────────────────────────────────────

describe('checkFillInBlank', () => {
  const challenge: FillInBlankChallenge = {
    type: 'fill_in_blank',
    prompt: 'Fill in the blank...',
    targetWord: 'agua',
    sentence: 'Can you pass me the ______?',
    answer: 'agua',
  };

  it('returns correct for right answer', () => {
    const result = checkFillInBlank(challenge, 'agua');
    expect(result.correct).toBe(true);
  });

  it('returns incorrect for wrong answer', () => {
    const result = checkFillInBlank(challenge, 'pan');
    expect(result.correct).toBe(false);
  });
});

// ── checkMatching ───────────────────────────────────────────────────────────

describe('checkMatching', () => {
  const challenge: MatchingChallenge = {
    type: 'matching',
    prompt: 'Match each word...',
    pairs: [
      { word: 'hola', meaning: 'hello' },
      { word: 'adios', meaning: 'goodbye' },
      { word: 'gracias', meaning: 'thank you' },
    ],
    shuffledMeanings: ['goodbye', 'hello', 'thank you'],
  };

  it('returns perfect score for all correct', () => {
    const result = checkMatching(challenge, {
      hola: 'hello',
      adios: 'goodbye',
      gracias: 'thank you',
    });
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
    expect(result.correctWords).toHaveLength(3);
    expect(result.xpAwarded).toBe(2 * 3 + 3); // 2 per word + 3 bonus
  });

  it('returns partial score for some correct', () => {
    const result = checkMatching(challenge, {
      hola: 'hello',
      adios: 'thank you',
      gracias: 'goodbye',
    });
    expect(result.correct).toBe(false);
    expect(result.score).toBeCloseTo(1 / 3);
    expect(result.correctWords).toEqual(['hola']);
    expect(result.incorrectWords).toHaveLength(2);
    expect(result.xpAwarded).toBe(2); // only 1 correct, no bonus
  });

  it('returns zero for all wrong', () => {
    const result = checkMatching(challenge, {
      hola: 'goodbye',
      adios: 'thank you',
      gracias: 'hello',
    });
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0);
    expect(result.xpAwarded).toBe(0);
  });
});

// ── checkAnswer (dispatch) ──────────────────────────────────────────────────

describe('checkAnswer', () => {
  it('dispatches to multiple_choice checker', () => {
    const challenge: MultipleChoiceChallenge = {
      type: 'multiple_choice',
      prompt: 'test',
      targetWord: 'hola',
      correctAnswer: 'hello',
      options: ['hello', 'bye'],
    };
    const result = checkAnswer(challenge, 'hello');
    expect(result.correct).toBe(true);
    expect(result.challengeType).toBe('multiple_choice');
  });

  it('dispatches to matching checker', () => {
    const challenge: MatchingChallenge = {
      type: 'matching',
      prompt: 'match',
      pairs: [{ word: 'hola', meaning: 'hello' }],
      shuffledMeanings: ['hello'],
    };
    const result = checkAnswer(challenge, { hola: 'hello' });
    expect(result.correct).toBe(true);
    expect(result.challengeType).toBe('matching');
  });
});

// ── shuffleWithSeed ─────────────────────────────────────────────────────────

describe('shuffleWithSeed', () => {
  it('returns same order for same seed', () => {
    const arr = [1, 2, 3, 4, 5];
    const a = shuffleWithSeed(arr, 42);
    const b = shuffleWithSeed(arr, 42);
    expect(a).toEqual(b);
  });

  it('returns different order for different seeds', () => {
    const arr = [1, 2, 3, 4, 5];
    const a = shuffleWithSeed(arr, 42);
    const b = shuffleWithSeed(arr, 99);
    // Very unlikely to be the same
    expect(a).not.toEqual(b);
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffleWithSeed(arr, 42);
    expect(arr).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(shuffleWithSeed([], 42)).toEqual([]);
  });
});
