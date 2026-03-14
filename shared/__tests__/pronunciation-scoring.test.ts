/**
 * Tests for pronunciation scoring — text-based and audio-level helpers.
 */
import { describe, it, expect } from 'vitest';
import {
  scorePronunciation,
  computeGrade,
  buildAudioResult,
  textResultAsAudioResult,
  formatPronunciationFeedback,
  type GeminiPronunciationAnalysis,
} from '../language/pronunciation-scoring.js';

describe('scorePronunciation (text-based)', () => {
  it('returns 100 for exact match', () => {
    const result = scorePronunciation('hello world', 'hello world');
    expect(result.overallScore).toBe(100);
    expect(result.wordResults).toHaveLength(2);
    expect(result.wordResults.every(w => w.match === 'exact')).toBe(true);
  });

  it('handles empty expected phrase', () => {
    const result = scorePronunciation('', 'anything');
    expect(result.overallScore).toBe(100);
    expect(result.wordResults).toHaveLength(0);
  });

  it('marks missed words', () => {
    const result = scorePronunciation('bonjour le monde', 'bonjour');
    const missed = result.wordResults.filter(w => w.match === 'missed');
    expect(missed.length).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThan(100);
  });

  it('marks extra words', () => {
    const result = scorePronunciation('hello', 'hello world today');
    const extra = result.wordResults.filter(w => w.match === 'extra');
    expect(extra.length).toBeGreaterThan(0);
  });

  it('normalizes punctuation and case', () => {
    const result = scorePronunciation('Hello, World!', 'hello world');
    expect(result.overallScore).toBe(100);
  });
});

describe('computeGrade', () => {
  it('returns A for 90+', () => expect(computeGrade(95)).toBe('A'));
  it('returns A for exactly 90', () => expect(computeGrade(90)).toBe('A'));
  it('returns B for 70-89', () => expect(computeGrade(75)).toBe('B'));
  it('returns C for 40-69', () => expect(computeGrade(50)).toBe('C'));
  it('returns D for below 40', () => expect(computeGrade(20)).toBe('D'));
  it('returns D for 0', () => expect(computeGrade(0)).toBe('D'));
});

describe('buildAudioResult', () => {
  const analysis: GeminiPronunciationAnalysis = {
    transcript: 'bonjour le monde',
    words: [
      { word: 'bonjour', confidence: 0.95, pronunciationScore: 90 },
      { word: 'le', confidence: 1.0, pronunciationScore: 100 },
      { word: 'monde', confidence: 0.8, pronunciationScore: 70 },
    ],
    fluencyScore: 85,
    overallScore: 87,
    feedback: 'Good attempt!',
  };

  it('produces an audio result with blended score', () => {
    const result = buildAudioResult('Bonjour le monde', analysis);
    expect(result.scoringMethod).toBe('audio');
    // Blended: 87 * 0.7 + textScore * 0.3
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('has correct audioWordScores', () => {
    const result = buildAudioResult('Bonjour le monde', analysis);
    expect(result.audioWordScores).toHaveLength(3);
    expect(result.audioWordScores[0].word).toBe('bonjour');
    expect(result.audioWordScores[0].confidence).toBe(0.95);
    expect(result.audioWordScores[2].pronunciationScore).toBe(70);
  });

  it('clamps out-of-range values', () => {
    const badAnalysis: GeminiPronunciationAnalysis = {
      transcript: 'hi',
      words: [{ word: 'hi', confidence: 2.0, pronunciationScore: 200 }],
      fluencyScore: -50,
      overallScore: 300,
      feedback: '',
    };
    const result = buildAudioResult('hi', badAnalysis);
    expect(result.audioWordScores[0].confidence).toBe(1);
    expect(result.audioWordScores[0].pronunciationScore).toBe(100);
    expect(result.fluencyScore).toBe(0);
  });

  it('assigns correct grade', () => {
    const result = buildAudioResult('Bonjour le monde', analysis);
    expect(['A', 'B', 'C', 'D']).toContain(result.grade);
  });
});

describe('textResultAsAudioResult', () => {
  it('wraps a text result as audio fallback', () => {
    const textResult = scorePronunciation('hello world', 'hello world');
    const audioResult = textResultAsAudioResult(textResult);

    expect(audioResult.scoringMethod).toBe('text-fallback');
    expect(audioResult.overallScore).toBe(100);
    expect(audioResult.grade).toBe('A');
    expect(audioResult.fluencyScore).toBe(100);
    expect(audioResult.audioWordScores).toHaveLength(2);
    expect(audioResult.audioWordScores[0].word).toBe('hello');
    expect(audioResult.audioWordScores[0].confidence).toBe(1);
    expect(audioResult.audioWordScores[0].pronunciationScore).toBe(100);
  });

  it('marks missed words with issue description', () => {
    const textResult = scorePronunciation('hello world', '');
    const audioResult = textResultAsAudioResult(textResult);

    expect(audioResult.scoringMethod).toBe('text-fallback');
    expect(audioResult.audioWordScores.every(w => w.issue === 'word not detected')).toBe(true);
  });
});

describe('formatPronunciationFeedback', () => {
  it('includes score percentage', () => {
    const result = scorePronunciation('hello', 'hello');
    const formatted = formatPronunciationFeedback(result);
    expect(formatted).toContain('100%');
  });
});
