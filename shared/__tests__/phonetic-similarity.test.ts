/**
 * Tests for phonetic similarity scoring module.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  phoneticEncode,
  phoneticSimilarity,
  phoneticSimilarityBatch,
} from '../language/phonetic-similarity.js';

describe('phoneticEncode', () => {
  it('returns empty string for empty input', () => {
    expect(phoneticEncode('')).toBe('');
  });

  it('encodes identical words identically', () => {
    expect(phoneticEncode('hello')).toBe(phoneticEncode('hello'));
  });

  it('collapses duplicate consonants', () => {
    const encoded = phoneticEncode('batter');
    expect(encoded).not.toContain('TT');
  });

  it('maps ph to F sound', () => {
    const phone = phoneticEncode('phone');
    const fone = phoneticEncode('fone');
    expect(phone).toBe(fone);
  });

  it('maps c before e/i to S', () => {
    const city = phoneticEncode('city');
    expect(city).toContain('S');
  });

  it('handles French nasal vowels', () => {
    // "bon" and "bom" should encode similarly (nasal AN/ON)
    const bon = phoneticEncode('bon');
    const bom = phoneticEncode('bom');
    expect(bon).toBe(bom);
  });

  it('strips punctuation and non-letter characters', () => {
    expect(phoneticEncode("don't")).toBe(phoneticEncode('dont'));
  });

  it('is case-insensitive', () => {
    expect(phoneticEncode('Hello')).toBe(phoneticEncode('hello'));
  });
});

describe('phoneticSimilarity', () => {
  it('returns 1.0 for identical words', () => {
    const result = phoneticSimilarity('hello', 'hello');
    expect(result.similarity).toBe(1);
    expect(result.textSimilarity).toBe(1);
    expect(result.phoneticSimilarity).toBe(1);
  });

  it('scores phonetically similar words higher than text-only would', () => {
    // "phone" vs "fone" — sound alike, spelled differently
    const result = phoneticSimilarity('phone', 'fone');
    expect(result.similarity).toBeGreaterThan(result.textSimilarity);
    expect(result.phoneticSimilarity).toBeGreaterThan(result.textSimilarity);
  });

  it('scores sound-alike misspellings favorably', () => {
    // STT might transcribe "bonjour" as "bonzhur"
    const result = phoneticSimilarity('bonjour', 'bonzhur');
    expect(result.similarity).toBeGreaterThanOrEqual(0.6);
  });

  it('scores completely different words low', () => {
    const result = phoneticSimilarity('hello', 'pizza');
    expect(result.similarity).toBeLessThan(0.5);
  });

  it('handles empty strings', () => {
    const result = phoneticSimilarity('', '');
    expect(result.similarity).toBe(1);
  });

  it('handles one empty string', () => {
    const result = phoneticSimilarity('hello', '');
    expect(result.similarity).toBe(0);
  });

  it('never scores lower than pure text similarity', () => {
    // The blended score should always be >= text-only score
    const pairs = [
      ['cat', 'kat'],
      ['night', 'nite'],
      ['through', 'thru'],
      ['enough', 'enuf'],
    ];
    for (const [a, b] of pairs) {
      const result = phoneticSimilarity(a, b);
      expect(result.similarity).toBeGreaterThanOrEqual(result.textSimilarity);
    }
  });

  it('respects custom phonetic weight', () => {
    const low = phoneticSimilarity('phone', 'fone', 0.1);
    const high = phoneticSimilarity('phone', 'fone', 0.9);
    // Higher phonetic weight should give more credit to sound-alike words
    expect(high.similarity).toBeGreaterThanOrEqual(low.similarity);
  });

  it('handles accented characters', () => {
    const result = phoneticSimilarity('café', 'cafe');
    expect(result.similarity).toBeGreaterThanOrEqual(0.7);
  });

  it('recognizes "tion" and "shun" as similar', () => {
    const result = phoneticSimilarity('nation', 'nashun');
    expect(result.similarity).toBeGreaterThanOrEqual(0.5);
  });
});

describe('phoneticSimilarityBatch', () => {
  it('scores multiple pairs at once', () => {
    const results = phoneticSimilarityBatch([
      { expected: 'hello', spoken: 'hello' },
      { expected: 'world', spoken: 'wurld' },
      { expected: 'phone', spoken: 'fone' },
    ]);
    expect(results).toHaveLength(3);
    expect(results[0].similarity).toBe(1);
    expect(results[1].similarity).toBeGreaterThan(0.5);
    expect(results[2].similarity).toBeGreaterThan(results[2].textSimilarity);
  });

  it('returns empty array for empty input', () => {
    expect(phoneticSimilarityBatch([])).toHaveLength(0);
  });
});

describe('integration with pronunciation scoring', () => {
  // Dynamically import to verify integration works end-to-end
  let scorePronunciation: any;

  beforeAll(async () => {
    const mod = await import('../language/pronunciation-scoring.js');
    scorePronunciation = mod.scorePronunciation;
  });

  it('scores phonetically similar phrases higher with phonetic scoring', () => {
    // "phone" spoken as "fone" should get decent score
    const result = scorePronunciation('phone', 'fone');
    expect(result.overallScore).toBeGreaterThanOrEqual(60);
  });

  it('still scores exact matches at 100', () => {
    const result = scorePronunciation('hello world', 'hello world');
    expect(result.overallScore).toBe(100);
  });

  it('still marks completely missed words', () => {
    const result = scorePronunciation('hello world goodbye', 'hello');
    const missed = result.wordResults.filter((w: any) => w.match === 'missed');
    expect(missed.length).toBeGreaterThan(0);
  });
});
