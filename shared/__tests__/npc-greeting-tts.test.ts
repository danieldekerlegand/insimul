import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock StreamingAudioPlayer before importing the module under test
const mockCallbacks: any = {};
const mockPlayer = {
  pushChunk: vi.fn(),
  finish: vi.fn(function () {
    // Simulate immediate playback completion
    setTimeout(() => mockCallbacks.onComplete?.(), 0);
  }),
  stop: vi.fn(),
  dispose: vi.fn(),
  setCallbacks: vi.fn((cbs: any) => Object.assign(mockCallbacks, cbs)),
  setNpcPosition: vi.fn(),
};

vi.mock('../game-engine/rendering/StreamingAudioPlayer', () => {
  return {
    StreamingAudioPlayer: function () { return mockPlayer; },
  };
});

// Mock Vector3 from Babylon
vi.mock('@babylonjs/core', () => ({
  Vector3: class Vector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    static Distance(a: any, b: any) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
    }
  },
}));

import { generateAndSpeakGreeting, type GreetingNPC, type GreetingWorldData } from '../game-engine/rendering/NpcGreetingTTS';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeNPC(overrides?: Partial<GreetingNPC>): GreetingNPC {
  return {
    id: 'npc-001',
    name: 'Marie Dupont',
    gender: 'female',
    age: 35,
    occupation: 'baker',
    personality: {
      openness: 0.7,
      conscientiousness: 0.6,
      extroversion: 0.8,
      agreeableness: 0.7,
      neuroticism: 0.3,
    },
    meshPosition: { x: 5, y: 0, z: 10 } as any,
    ...overrides,
  };
}

function makeWorldData(overrides?: Partial<GreetingWorldData>): GreetingWorldData {
  return {
    targetLanguage: 'French',
    timeOfDay: '10',
    serverUrl: 'http://test-server',
    ...overrides,
  };
}

function mockLLMSuccess(greeting: string) {
  return new Response(JSON.stringify({ greeting, fallback: false }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockLLMFallback() {
  return new Response(JSON.stringify({ greeting: null, fallback: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockTTSSuccess() {
  const audioData = new Uint8Array([0xff, 0xfb, 0x90, 0x00]); // Fake MP3 header
  return new Response(audioData, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}

describe('generateAndSpeakGreeting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls LLM endpoint with correct NPC data', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour, comment allez-vous?'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    const result = await promise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const llmCall = mockFetch.mock.calls[0];
    expect(llmCall[0]).toBe('http://test-server/api/npc-greeting/generate');
    const body = JSON.parse(llmCall[1].body);
    expect(body.npcName).toBe('Marie Dupont');
    expect(body.occupation).toBe('baker');
    expect(body.targetLanguage).toBe('French');
    expect(body.timeOfDay).toBe('morning');
    expect(body.personality.extroversion).toBe(0.8);
    expect(result.text).toBe('Bonjour, comment allez-vous?');
    expect(result.usedFallback).toBe(false);
  });

  it('calls TTS endpoint with gender-matched voice and target language', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    await promise;

    const ttsCall = mockFetch.mock.calls[1];
    expect(ttsCall[0]).toBe('http://test-server/api/tts');
    const body = JSON.parse(ttsCall[1].body);
    expect(body.text).toBe('Bonjour!');
    expect(body.voice).toBe('Kore'); // female mid-age
    expect(body.gender).toBe('female');
    expect(body.encoding).toBe('MP3');
  });

  it('uses male voice for male NPC', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC({ gender: 'male', age: 30 }), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    await promise;

    const body = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body.voice).toBe('Puck'); // male mid-age
    expect(body.gender).toBe('male');
  });

  it('uses young voice for NPC under 25', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Salut!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC({ age: 20 }), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    await promise;

    const body = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body.voice).toBe('Aoede'); // female young
  });

  it('uses senior voice for NPC 55+', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonsoir!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC({ gender: 'male', age: 60 }), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    await promise;

    const body = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body.voice).toBe('Orus'); // male senior
  });

  it('falls back to hardcoded greeting on LLM failure', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    const result = await promise;

    expect(result.usedFallback).toBe(true);
    // Should be one of the French greetings
    expect(['Bonjour!', 'Salut!', 'Coucou!', 'Bonsoir!']).toContain(result.text);
  });

  it('falls back to hardcoded greeting on LLM fallback response', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMFallback())
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    const result = await promise;

    expect(result.usedFallback).toBe(true);
  });

  it('falls back on LLM network error', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    const result = await promise;

    expect(result.usedFallback).toBe(true);
  });

  it('silently skips audio when TTS fails', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    const result = await generateAndSpeakGreeting(makeNPC(), makeWorldData());

    expect(result.text).toBe('Bonjour!');
    expect(result.usedFallback).toBe(false);
    // StreamingAudioPlayer should NOT have been used
    expect(mockPlayer.pushChunk).not.toHaveBeenCalled();
  });

  it('silently skips audio when TTS returns empty buffer', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(new Response(new ArrayBuffer(0), { status: 200 }));

    const result = await generateAndSpeakGreeting(makeNPC(), makeWorldData());

    expect(result.text).toBe('Bonjour!');
    expect(mockPlayer.pushChunk).not.toHaveBeenCalled();
  });

  it('plays audio via StreamingAudioPlayer on success', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData());
    await vi.advanceTimersByTimeAsync(50);
    await promise;

    expect(mockPlayer.pushChunk).toHaveBeenCalledTimes(1);
    const chunk = mockPlayer.pushChunk.mock.calls[0][0];
    expect(chunk.encoding).toBe(3); // MP3
    expect(chunk.data).toBeInstanceOf(Uint8Array);
    expect(mockPlayer.finish).toHaveBeenCalled();
  });

  it('rejects with AbortError when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      generateAndSpeakGreeting(makeNPC(), makeWorldData(), { signal: controller.signal })
    ).rejects.toThrow('Aborted');
  });

  it('rejects with AbortError when signal is aborted during LLM call', async () => {
    const controller = new AbortController();
    mockFetch.mockImplementationOnce(() => {
      controller.abort();
      throw new DOMException('Aborted', 'AbortError');
    });

    await expect(
      generateAndSpeakGreeting(makeNPC(), makeWorldData(), { signal: controller.signal })
    ).rejects.toThrow('Aborted');
  });

  it('stops audio and rejects when signal is aborted during playback', async () => {
    const controller = new AbortController();

    // Override finish to NOT auto-complete — simulate ongoing playback
    mockPlayer.finish.mockImplementationOnce(() => {
      // Simulate abort during playback (synchronously to avoid unhandled rejection)
      controller.abort();
    });

    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData(), { signal: controller.signal });

    await expect(promise).rejects.toThrow('Aborted');
    expect(mockPlayer.stop).toHaveBeenCalled();
  });

  it('uses voice name override when provided', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData(), { voiceName: 'Charon' });
    await vi.advanceTimersByTimeAsync(50);
    await promise;

    const body = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body.voice).toBe('Charon');
  });

  it('maps time of day correctly', async () => {
    const timeTests = [
      { input: '5', expected: 'early morning' },
      { input: '9', expected: 'morning' },
      { input: '14', expected: 'afternoon' },
      { input: '19', expected: 'evening' },
      { input: '22', expected: 'night' },
      { input: 'sunset', expected: 'sunset' },
    ];

    for (const { input, expected } of timeTests) {
      vi.clearAllMocks();
      mockFetch
        .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
        .mockResolvedValueOnce(mockTTSSuccess());

      const promise = generateAndSpeakGreeting(makeNPC(), makeWorldData({ timeOfDay: input }));
      await vi.advanceTimersByTimeAsync(50);
      await promise;

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.timeOfDay).toBe(expected);
    }
  });

  it('uses English fallback for unknown language', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(
      makeNPC(),
      makeWorldData({ targetLanguage: 'Klingon' }),
    );
    await vi.advanceTimersByTimeAsync(50);
    const result = await promise;

    expect(result.usedFallback).toBe(true);
    expect(['Hello!', 'Hi there!', 'Good day!', 'Hey!', 'Greetings!']).toContain(result.text);
  });

  it('defaults to empty serverUrl (same origin) when not provided', async () => {
    mockFetch
      .mockResolvedValueOnce(mockLLMSuccess('Bonjour!'))
      .mockResolvedValueOnce(mockTTSSuccess());

    const promise = generateAndSpeakGreeting(makeNPC(), { targetLanguage: 'French' });
    await vi.advanceTimersByTimeAsync(50);
    await promise;

    expect(mockFetch.mock.calls[0][0]).toBe('/api/npc-greeting/generate');
    expect(mockFetch.mock.calls[1][0]).toBe('/api/tts');
  });
});
