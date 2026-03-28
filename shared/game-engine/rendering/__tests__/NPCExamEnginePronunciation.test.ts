/**
 * Tests for NpcExamEngine audio-level pronunciation scoring integration.
 *
 * Covers:
 * - Pronunciation questions route through audio scoring
 * - Text questions still use text scoring
 * - Audio scoring fallback on API failure
 * - Pronunciation data in exam results
 * - onAudioAnswer callback for pronunciation questions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NpcExamEngine, type NpcExamCallbacks, type AudioAnswer } from '../NPCExamEngine';
import type { NpcExamConfig, NpcExamQuestion } from '../../../assessment/npc-exam-types';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeExamConfig(overrides: Partial<NpcExamConfig> = {}): NpcExamConfig {
  return {
    examId: 'exam-1',
    npcId: 'npc-1',
    npcName: 'Teacher',
    category: 'pronunciation_quiz',
    difficulty: 'beginner',
    targetLanguage: 'French',
    questions: [
      {
        id: 'q-1',
        prompt: 'Say "bonjour"',
        expectedAnswer: 'bonjour',
        maxPoints: 10,
        isPronunciation: true,
        expectedPhrase: 'bonjour',
        languageHint: 'French',
      },
    ],
    timeLimitSeconds: 0,
    totalMaxPoints: 10,
    topics: ['greetings'],
    ...overrides,
  };
}

function makePronunciationApiResponse(overrides: Record<string, unknown> = {}) {
  return {
    overallScore: 85,
    spokenPhrase: 'bonjour',
    feedback: 'Good pronunciation!',
    expectedPhrase: 'bonjour',
    wordResults: [{ expected: 'bonjour', spoken: 'bonjour', match: 'exact', similarity: 1 }],
    audioWordScores: [
      { word: 'bonjour', confidence: 0.95, pronunciationScore: 88 },
    ],
    fluencyScore: 82,
    grade: 'B',
    scoringMethod: 'audio',
    ...overrides,
  };
}

function makeEventBus() {
  return { emit: vi.fn() } as any;
}

describe('NpcExamEngine pronunciation integration', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('scores pronunciation questions via audio API when audio answer provided', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test-token' });
    const config = makeExamConfig();

    // Mock pronunciation API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makePronunciationApiResponse(),
    });

    const callbacks: NpcExamCallbacks = {
      onQuestion: (q) => {
        // Submit audio answer for pronunciation question
        expect(q.isPronunciation).toBe(true);
        q.onAudioAnswer({ audio: 'base64-audio-data', mimeType: 'audio/wav' });
      },
      onQuestionResult: (result) => {
        expect(result.pronunciationData).toBeDefined();
        expect(result.pronunciationData!.scoringMethod).toBe('audio');
        expect(result.pronunciationData!.grade).toBe('B');
        expect(result.pronunciationData!.fluencyScore).toBe(82);
        expect(result.pronunciationData!.audioWordScores).toHaveLength(1);
        expect(result.score).toBe(9); // 85% of 10, rounded
      },
    };

    const result = await engine.runExam(config, callbacks);
    expect(result).not.toBeNull();
    expect(result!.totalScore).toBe(9);
  });

  it('falls back to text scoring when pronunciation API fails', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test-token' });
    const config = makeExamConfig();

    // Mock pronunciation API failure
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const callbacks: NpcExamCallbacks = {
      onQuestion: (q) => {
        q.onAudioAnswer({ audio: 'base64-audio-data' });
      },
      onQuestionResult: (result) => {
        // Falls back to scoreNpcExamQuestion with empty string
        expect(result.pronunciationData).toBeUndefined();
        expect(result.score).toBe(0);
      },
    };

    const result = await engine.runExam(config, callbacks);
    expect(result).not.toBeNull();
  });

  it('uses text scoring for non-pronunciation questions', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test-token' });
    const config = makeExamConfig({
      category: 'vocabulary_quiz',
      questions: [{
        id: 'q-1',
        prompt: 'What is "hello" in French?',
        expectedAnswer: 'bonjour',
        maxPoints: 10,
      }],
    });

    // Mock for persist call (assessment session creation)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'session-1' }),
    });

    const callbacks: NpcExamCallbacks = {
      onQuestion: (q) => {
        expect(q.isPronunciation).toBe(false);
        q.onAnswer('bonjour');
      },
      onQuestionResult: (result) => {
        expect(result.pronunciationData).toBeUndefined();
        expect(result.correct).toBe(true);
        expect(result.score).toBe(10);
      },
    };

    const result = await engine.runExam(config, callbacks);
    expect(result).not.toBeNull();
    expect(result!.totalScore).toBe(10);
  });

  it('sends correct payload to pronunciation API', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'my-token' });
    const config = makeExamConfig();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makePronunciationApiResponse(),
    });

    const callbacks: NpcExamCallbacks = {
      onQuestion: (q) => {
        q.onAudioAnswer({ audio: 'base64data', mimeType: 'audio/webm' });
      },
    };

    await engine.runExam(config, callbacks);

    // First fetch call should be to pronunciation API
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/pronunciation/score');
    expect(options.method).toBe('POST');
    expect(options.headers['Authorization']).toBe('Bearer my-token');

    const body = JSON.parse(options.body);
    expect(body.audio).toBe('base64data');
    expect(body.expectedPhrase).toBe('bonjour');
    expect(body.mimeType).toBe('audio/webm');
    expect(body.languageHint).toBe('French');
  });

  it('handles text answer on pronunciation question as text scoring', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test-token' });
    const config = makeExamConfig();

    // Mock for persist call
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'session-1' }),
    });

    const callbacks: NpcExamCallbacks = {
      onQuestion: (q) => {
        // Use text answer even though it's a pronunciation question
        q.onAnswer('bonjour');
      },
      onQuestionResult: (result) => {
        // Should fall through to text scoring
        expect(result.pronunciationData).toBeUndefined();
        expect(result.correct).toBe(true);
      },
    };

    const result = await engine.runExam(config, callbacks);
    expect(result).not.toBeNull();
  });

  it('includes pronunciation results in exam completion event', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test-token' });
    const config = makeExamConfig();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makePronunciationApiResponse({ overallScore: 90 }),
    });

    const callbacks: NpcExamCallbacks = {
      onQuestion: (q) => {
        q.onAudioAnswer({ audio: 'base64data' });
      },
    };

    const result = await engine.runExam(config, callbacks);
    expect(result).not.toBeNull();
    expect(result!.questionResults![0].pronunciationData).toBeDefined();
    expect(result!.questionResults![0].pronunciationData!.grade).toBe('B');
  });

  it('handles mixed pronunciation and text questions in one exam', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test-token' });
    const config = makeExamConfig({
      questions: [
        {
          id: 'q-1',
          prompt: 'Say "bonjour"',
          expectedAnswer: 'bonjour',
          maxPoints: 5,
          isPronunciation: true,
          expectedPhrase: 'bonjour',
        },
        {
          id: 'q-2',
          prompt: 'Translate "hello"',
          expectedAnswer: 'bonjour',
          maxPoints: 5,
        },
      ],
      totalMaxPoints: 10,
    });

    // Mock pronunciation API for first question
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makePronunciationApiResponse({ overallScore: 80 }),
    });
    // Mock for persist calls
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'session-1' }),
    });

    let questionIndex = 0;
    const callbacks: NpcExamCallbacks = {
      onQuestion: (q) => {
        if (questionIndex === 0) {
          q.onAudioAnswer({ audio: 'audio-data' });
        } else {
          q.onAnswer('bonjour');
        }
        questionIndex++;
      },
    };

    const result = await engine.runExam(config, callbacks);
    expect(result).not.toBeNull();
    expect(result!.questionResults).toHaveLength(2);
    // First: pronunciation scored
    expect(result!.questionResults![0].pronunciationData).toBeDefined();
    expect(result!.questionResults![0].score).toBe(4); // 80% of 5
    // Second: text scored
    expect(result!.questionResults![1].pronunciationData).toBeUndefined();
    expect(result!.questionResults![1].correct).toBe(true);
  });
});
