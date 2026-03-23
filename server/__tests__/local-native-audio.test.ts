/**
 * Tests for the Local Native Audio Provider.
 *
 * Mocks the STT, LLM, and TTS provider registries to verify the pipeline
 * orchestration, voice resolution, marker stripping, and error handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock provider registries
vi.mock('../services/conversation/stt/stt-provider.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/conversation/stt/stt-provider.js')>();
  return {
    ...original,
    getSTTProvider: vi.fn(),
  };
});

vi.mock('../services/conversation/providers/provider-registry.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/conversation/providers/provider-registry.js')>();
  return {
    ...original,
    getProvider: vi.fn(),
  };
});

vi.mock('../services/conversation/tts/tts-provider.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/conversation/tts/tts-provider.js')>();
  return {
    ...original,
    getTTSProvider: vi.fn(),
  };
});

import { LocalNativeAudioProvider } from '../services/ai/providers/local/local-native-audio.js';
import { getSTTProvider } from '../services/conversation/stt/stt-provider.js';
import { getProvider } from '../services/conversation/providers/provider-registry.js';
import { getTTSProvider } from '../services/conversation/tts/tts-provider.js';
import { AudioEncoding } from '../../shared/proto/conversation.js';
import type { ISTTProvider, TranscriptionResult } from '../services/conversation/stt/stt-provider.js';
import type { IStreamingLLMProvider } from '../services/conversation/providers/llm-provider.js';
import type { ITTSProvider, AudioChunkOutput } from '../services/conversation/tts/tts-provider.js';
import type { NativeAudioRequest } from '../services/providers/types.js';

// ── Mock factories ───────────────────────────────────────────────────

function createMockSTT(transcript: string): ISTTProvider {
  return {
    name: 'mock-stt',
    async *streamTranscription(): AsyncIterable<TranscriptionResult> {
      if (transcript) {
        yield { text: transcript, isFinal: true, confidence: 0.95, languageDetected: 'en-US' };
      }
    },
  };
}

function createMockLLM(response: string): IStreamingLLMProvider {
  return {
    name: 'mock-llm',
    async *streamCompletion(): AsyncIterable<string> {
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        yield (i > 0 ? ' ' : '') + words[i];
      }
    },
  };
}

function createMockTTS(): ITTSProvider {
  return {
    name: 'mock-tts',
    async *synthesize(): AsyncIterable<AudioChunkOutput> {
      // Produce a small WAV-like buffer
      yield {
        data: new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]),
        encoding: AudioEncoding.PCM,
        sampleRate: 22050,
        durationMs: 500,
      };
    },
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe('LocalNativeAudioProvider', () => {
  let provider: LocalNativeAudioProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new LocalNativeAudioProvider();
    (getSTTProvider as any).mockReturnValue(createMockSTT('Hello there'));
    (getProvider as any).mockReturnValue(createMockLLM('Greetings, traveler!'));
    (getTTSProvider as any).mockReturnValue(createMockTTS());
  });

  function makeRequest(overrides?: Partial<NativeAudioRequest>): NativeAudioRequest {
    return {
      systemPrompt: 'You are a friendly NPC.',
      history: [],
      ...overrides,
    };
  }

  describe('audio input (STT → LLM → TTS)', () => {
    it('runs the full pipeline with audio input', async () => {
      const result = await provider.chat(makeRequest({
        audioData: Buffer.from('mock-audio').toString('base64'),
        mimeType: 'audio/webm',
      }));

      expect(result.text).toBe('Greetings, traveler!');
      expect(result.audioData).toBeTruthy();
      expect(result.audioMimeType).toBe('audio/wav');
      expect(result.audioFailed).toBeFalsy();
    });

    it('returns empty result when STT produces no transcript', async () => {
      (getSTTProvider as any).mockReturnValue(createMockSTT(''));

      const result = await provider.chat(makeRequest({
        audioData: Buffer.from('silent-audio').toString('base64'),
      }));

      expect(result.text).toBe('');
      expect(result.audioData).toBeNull();
    });
  });

  describe('text input (LLM → TTS)', () => {
    it('skips STT when textMessage is provided', async () => {
      const result = await provider.chat(makeRequest({
        textMessage: 'Hello there',
      }));

      expect(result.text).toBe('Greetings, traveler!');
      expect(result.audioData).toBeTruthy();
      // STT should not have been called
      expect(getSTTProvider).not.toHaveBeenCalled();
    });
  });

  describe('voice resolution', () => {
    it('uses specified voice name', async () => {
      const result = await provider.chat(makeRequest({
        textMessage: 'Hi',
        voice: 'Charon',
      }));

      expect(result.text).toBeTruthy();
      expect(result.audioData).toBeTruthy();
    });

    it('defaults to Kore when no voice specified', async () => {
      const result = await provider.chat(makeRequest({
        textMessage: 'Hi',
      }));

      expect(result.audioData).toBeTruthy();
    });
  });

  describe('system marker stripping', () => {
    it('strips markers before TTS synthesis', async () => {
      const textWithMarkers =
        'Hello! **GRAMMAR_FEEDBACK**fix grammar**END_GRAMMAR** **QUEST_ASSIGN**quest**END_QUEST**';
      (getProvider as any).mockReturnValue(createMockLLM(textWithMarkers));

      const synthesizedTexts: string[] = [];
      const mockTTS: ITTSProvider = {
        name: 'mock-tts',
        async *synthesize(text: string): AsyncIterable<AudioChunkOutput> {
          synthesizedTexts.push(text);
          yield { data: new Uint8Array([1, 2, 3]), encoding: AudioEncoding.PCM, sampleRate: 22050, durationMs: 100 };
        },
      };
      (getTTSProvider as any).mockReturnValue(mockTTS);

      await provider.chat(makeRequest({ textMessage: 'test' }));

      const allSynthesized = synthesizedTexts.join(' ');
      expect(allSynthesized).not.toContain('GRAMMAR_FEEDBACK');
      expect(allSynthesized).not.toContain('QUEST_ASSIGN');
      expect(allSynthesized).toContain('Hello!');
    });
  });

  describe('conversation history', () => {
    it('converts Gemini-style history to simple format', async () => {
      let capturedOptions: any;
      const mockLLM: IStreamingLLMProvider = {
        name: 'mock-llm',
        async *streamCompletion(_p: string, _c: any, options?: any): AsyncIterable<string> {
          capturedOptions = options;
          yield 'Response';
        },
      };
      (getProvider as any).mockReturnValue(mockLLM);

      await provider.chat(makeRequest({
        textMessage: 'Hello',
        history: [
          { role: 'user', parts: [{ text: 'Hi' }] },
          { role: 'model', parts: [{ text: 'Hello!' }] },
        ],
      }));

      expect(capturedOptions.conversationHistory).toEqual([
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
      ]);
    });
  });

  describe('LLM parameters', () => {
    it('passes temperature and maxTokens to LLM', async () => {
      let capturedOptions: any;
      const mockLLM: IStreamingLLMProvider = {
        name: 'mock-llm',
        async *streamCompletion(_p: string, _c: any, options?: any): AsyncIterable<string> {
          capturedOptions = options;
          yield 'Hi';
        },
      };
      (getProvider as any).mockReturnValue(mockLLM);

      await provider.chat(makeRequest({
        textMessage: 'Hello',
        temperature: 0.3,
        maxTokens: 200,
      }));

      expect(capturedOptions.temperature).toBe(0.3);
      expect(capturedOptions.maxTokens).toBe(200);
    });

    it('uses defaults when temperature/maxTokens not specified', async () => {
      let capturedOptions: any;
      const mockLLM: IStreamingLLMProvider = {
        name: 'mock-llm',
        async *streamCompletion(_p: string, _c: any, options?: any): AsyncIterable<string> {
          capturedOptions = options;
          yield 'Hi';
        },
      };
      (getProvider as any).mockReturnValue(mockLLM);

      await provider.chat(makeRequest({ textMessage: 'Hello' }));

      expect(capturedOptions.temperature).toBe(0.7);
      expect(capturedOptions.maxTokens).toBe(1000);
    });
  });

  describe('emotional tone', () => {
    it('adjusts TTS for emotional tone', async () => {
      let capturedOptions: any;
      const mockTTS: ITTSProvider = {
        name: 'mock-tts',
        async *synthesize(_text: string, _voice: any, options?: any): AsyncIterable<AudioChunkOutput> {
          capturedOptions = options;
          yield { data: new Uint8Array([1]), encoding: AudioEncoding.PCM, sampleRate: 22050, durationMs: 100 };
        },
      };
      (getTTSProvider as any).mockReturnValue(mockTTS);

      await provider.chat(makeRequest({
        textMessage: 'Hello',
        emotionalTone: 'happy',
      }));

      expect(capturedOptions.speakingRate).toBe(1.1);
    });
  });

  describe('error handling', () => {
    it('returns audioFailed when TTS throws', async () => {
      const mockTTS: ITTSProvider = {
        name: 'mock-tts',
        async *synthesize(): AsyncIterable<AudioChunkOutput> {
          throw new Error('TTS binary not found');
        },
      };
      (getTTSProvider as any).mockReturnValue(mockTTS);

      const result = await provider.chat(makeRequest({ textMessage: 'Hello' }));

      expect(result.text).toBe('Greetings, traveler!');
      expect(result.audioData).toBeNull();
      expect(result.audioFailed).toBe(true);
    });

    it('returns empty result when LLM fails', async () => {
      const mockLLM: IStreamingLLMProvider = {
        name: 'mock-llm',
        async *streamCompletion(): AsyncIterable<string> {
          throw new Error('Model not loaded');
        },
      };
      (getProvider as any).mockReturnValue(mockLLM);

      const result = await provider.chat(makeRequest({ textMessage: 'Hello' }));

      expect(result.text).toBe('');
      expect(result.audioFailed).toBe(true);
    });

    it('returns empty when no audio or text input provided', async () => {
      const result = await provider.chat(makeRequest());

      expect(result.text).toBe('');
      expect(result.audioData).toBeNull();
    });

    it('skips TTS when returnAudio is false', async () => {
      const result = await provider.chat(makeRequest({
        textMessage: 'Hello',
        returnAudio: false,
      }));

      expect(result.text).toBe('Greetings, traveler!');
      expect(result.audioData).toBeNull();
      expect(result.audioFailed).toBeFalsy();
      expect(getTTSProvider).not.toHaveBeenCalled();
    });

    it('returns null audio when LLM produces empty response', async () => {
      (getProvider as any).mockReturnValue(createMockLLM(''));

      const result = await provider.chat(makeRequest({ textMessage: 'Hello' }));

      expect(result.text).toBe('');
      expect(result.audioData).toBeNull();
    });
  });

  describe('provider name', () => {
    it('has name "local"', () => {
      expect(provider.name).toBe('local');
    });
  });
});
