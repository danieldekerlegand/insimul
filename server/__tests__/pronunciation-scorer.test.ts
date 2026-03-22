/**
 * Tests for audio-level pronunciation scoring service.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ILLMProvider, LLMRequest, LLMResponse, LLMBatchRequest, LLMBatchResponse } from '../services/llm-provider.js';

function createMockProvider(generateFn: (req: LLMRequest) => Promise<LLMResponse>): ILLMProvider {
  return {
    name: 'mock',
    isConfigured: () => true,
    generate: generateFn,
    generateBatch: vi.fn(),
    estimateCost: () => 0,
  };
}

function createUnconfiguredProvider(): ILLMProvider {
  return {
    name: 'mock',
    isConfigured: () => false,
    generate: vi.fn(),
    generateBatch: vi.fn(),
    estimateCost: () => 0,
  };
}

// Mock tts-stt for fallback path
vi.mock('../services/tts-stt.js', () => ({
  speechToText: vi.fn().mockResolvedValue('bonjour le monde'),
}));

import { scoreAudioPronunciation } from '../services/pronunciation-scorer.js';

describe('scoreAudioPronunciation', () => {
  const fakeAudio = Buffer.from('fake-audio-data');
  const expectedPhrase = 'Bonjour le monde';

  it('returns audio-level result when provider succeeds', async () => {
    const provider = createMockProvider(async () => ({
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
      tokensUsed: 100,
      model: 'mock',
      provider: 'mock',
    }));

    const result = await scoreAudioPronunciation(fakeAudio, expectedPhrase, 'audio/wav', 'French', provider);

    expect(result.scoringMethod).toBe('audio');
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.audioWordScores).toHaveLength(3);
    expect(result.audioWordScores[0].word).toBe('bonjour');
    expect(result.fluencyScore).toBe(85);
    expect(result.grade).toMatch(/^[A-D]$/);
    expect(result.feedback).toContain('monde');
  });

  it('handles response with markdown code fences', async () => {
    const provider = createMockProvider(async () => ({
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
      tokensUsed: 50,
      model: 'mock',
      provider: 'mock',
    }));

    const result = await scoreAudioPronunciation(fakeAudio, 'hello world', 'audio/wav', undefined, provider);

    expect(result.scoringMethod).toBe('audio');
    expect(result.audioWordScores).toHaveLength(2);
  });

  it('falls back to text scoring when provider returns invalid JSON', async () => {
    const provider = createMockProvider(async () => ({
      text: 'Sorry, I cannot analyze this audio.',
      tokensUsed: 10,
      model: 'mock',
      provider: 'mock',
    }));

    const result = await scoreAudioPronunciation(fakeAudio, expectedPhrase, 'audio/wav', undefined, provider);

    expect(result.scoringMethod).toBe('text-fallback');
    expect(result.spokenPhrase).toBe('bonjour le monde');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });

  it('falls back to text scoring when provider throws', async () => {
    const provider = createMockProvider(async () => {
      throw new Error('API quota exceeded');
    });

    const result = await scoreAudioPronunciation(fakeAudio, expectedPhrase, 'audio/wav', undefined, provider);

    expect(result.scoringMethod).toBe('text-fallback');
    expect(result.audioWordScores).toBeDefined();
  });

  it('falls back to text scoring when provider is not configured', async () => {
    const provider = createUnconfiguredProvider();

    const result = await scoreAudioPronunciation(fakeAudio, expectedPhrase, 'audio/wav', undefined, provider);

    expect(result.scoringMethod).toBe('text-fallback');
    expect(provider.generate).not.toHaveBeenCalled();
  });

  it('clamps scores to valid ranges', async () => {
    const provider = createMockProvider(async () => ({
      text: JSON.stringify({
        transcript: 'hello',
        words: [
          { word: 'hello', confidence: 1.5, pronunciationScore: 150 },
        ],
        fluencyScore: -10,
        overallScore: 200,
        feedback: 'Test',
      }),
      tokensUsed: 20,
      model: 'mock',
      provider: 'mock',
    }));

    const result = await scoreAudioPronunciation(fakeAudio, 'hello', 'audio/wav', undefined, provider);

    expect(result.audioWordScores[0].confidence).toBeLessThanOrEqual(1);
    expect(result.audioWordScores[0].pronunciationScore).toBeLessThanOrEqual(100);
    expect(result.fluencyScore).toBeGreaterThanOrEqual(0);
  });

  it('passes inlineData with audio to provider', async () => {
    const generateFn = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        transcript: 'bonjour',
        words: [{ word: 'bonjour', confidence: 0.9, pronunciationScore: 80 }],
        fluencyScore: 80,
        overallScore: 80,
        feedback: 'Good.',
      }),
      tokensUsed: 20,
      model: 'mock',
      provider: 'mock',
    });
    const provider = createMockProvider(generateFn);

    await scoreAudioPronunciation(fakeAudio, 'bonjour', 'audio/webm', 'French', provider);

    const call = generateFn.mock.calls[0][0] as LLMRequest;
    expect(call.inlineData).toHaveLength(1);
    expect(call.inlineData![0].mimeType).toBe('audio/webm');
    expect(call.inlineData![0].data).toBe(fakeAudio.toString('base64'));
    expect(call.prompt).toContain('French');
  });
});
