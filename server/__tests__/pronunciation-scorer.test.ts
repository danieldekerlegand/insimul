/**
 * Tests for audio-level pronunciation scoring service.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Gemini config
const mockGenerateContent = vi.fn();
const mockGenAI = {
  models: { generateContent: mockGenerateContent },
};

vi.mock('../config/gemini.js', () => ({
  getGenAI: () => mockGenAI,
  isGeminiConfigured: () => true,
  getGeminiApiKey: () => 'fake-key',
  GEMINI_MODELS: { PRO: 'gemini-2.5-pro', FLASH: 'gemini-2.5-flash' },
}));

// Mock tts-stt for fallback path
vi.mock('../services/tts-stt.js', () => ({
  speechToText: vi.fn().mockResolvedValue('bonjour le monde'),
}));

import { scoreAudioPronunciation } from '../services/pronunciation-scorer.js';

describe('scoreAudioPronunciation', () => {
  const fakeAudio = Buffer.from('fake-audio-data');
  const expectedPhrase = 'Bonjour le monde';

  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('returns audio-level result when Gemini succeeds', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        transcript: 'bonjour le monde',
        words: [
          { word: 'bonjour', confidence: 0.95, pronunciationScore: 88 },
          { word: 'le', confidence: 0.99, pronunciationScore: 95 },
          { word: 'monde', confidence: 0.92, pronunciationScore: 82 },
        ],
        fluencyScore: 85,
        overallScore: 88,
        feedback: 'Good pronunciation! Minor vowel issues on "monde".',
      }),
    });

    const result = await scoreAudioPronunciation(fakeAudio, expectedPhrase, 'audio/wav', 'French');

    expect(result.scoringMethod).toBe('audio');
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.audioWordScores).toHaveLength(3);
    expect(result.audioWordScores[0].word).toBe('bonjour');
    expect(result.fluencyScore).toBe(85);
    expect(result.grade).toMatch(/^[A-D]$/);
    expect(result.feedback).toContain('monde');
  });

  it('handles Gemini response with markdown code fences', async () => {
    mockGenerateContent.mockResolvedValue({
      text: '```json\n' + JSON.stringify({
        transcript: 'hello world',
        words: [
          { word: 'hello', confidence: 1.0, pronunciationScore: 100 },
          { word: 'world', confidence: 0.9, pronunciationScore: 85 },
        ],
        fluencyScore: 90,
        overallScore: 92,
        feedback: 'Excellent!',
      }) + '\n```',
    });

    const result = await scoreAudioPronunciation(fakeAudio, 'hello world');

    expect(result.scoringMethod).toBe('audio');
    expect(result.audioWordScores).toHaveLength(2);
  });

  it('falls back to text scoring when Gemini returns invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'Sorry, I cannot analyze this audio.',
    });

    const result = await scoreAudioPronunciation(fakeAudio, expectedPhrase);

    expect(result.scoringMethod).toBe('text-fallback');
    expect(result.spokenPhrase).toBe('bonjour le monde');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });

  it('falls back to text scoring when Gemini throws', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'));

    const result = await scoreAudioPronunciation(fakeAudio, expectedPhrase);

    expect(result.scoringMethod).toBe('text-fallback');
    expect(result.audioWordScores).toBeDefined();
  });

  it('clamps scores to valid ranges', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        transcript: 'hello',
        words: [
          { word: 'hello', confidence: 1.5, pronunciationScore: 150 },
        ],
        fluencyScore: -10,
        overallScore: 200,
        feedback: 'Test',
      }),
    });

    const result = await scoreAudioPronunciation(fakeAudio, 'hello');

    expect(result.audioWordScores[0].confidence).toBeLessThanOrEqual(1);
    expect(result.audioWordScores[0].pronunciationScore).toBeLessThanOrEqual(100);
    expect(result.fluencyScore).toBeGreaterThanOrEqual(0);
  });

  it('includes language hint in Gemini prompt when provided', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        transcript: 'bonjour',
        words: [{ word: 'bonjour', confidence: 0.9, pronunciationScore: 80 }],
        fluencyScore: 80,
        overallScore: 80,
        feedback: 'Good.',
      }),
    });

    await scoreAudioPronunciation(fakeAudio, 'bonjour', 'audio/wav', 'French');

    const call = mockGenerateContent.mock.calls[0][0];
    const prompt = call.contents[0];
    expect(prompt).toContain('French');
  });

  it('sends audio as base64 inline data', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        transcript: 'hi',
        words: [{ word: 'hi', confidence: 1, pronunciationScore: 100 }],
        fluencyScore: 100,
        overallScore: 100,
        feedback: 'Perfect!',
      }),
    });

    await scoreAudioPronunciation(fakeAudio, 'hi', 'audio/webm');

    const call = mockGenerateContent.mock.calls[0][0];
    const audioContent = call.contents[1];
    expect(audioContent.inlineData.mimeType).toBe('audio/webm');
    expect(audioContent.inlineData.data).toBe(fakeAudio.toString('base64'));
  });
});
