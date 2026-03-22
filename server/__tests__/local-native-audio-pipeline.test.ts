/**
 * Tests for the Local Native Audio Pipeline (STT → LLM → TTS).
 *
 * Uses mock providers to verify the pipeline correctly orchestrates
 * transcription, LLM generation, and speech synthesis.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the provider registries before importing the pipeline
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

import {
  localAudioPipeline,
  localAudioPipelineStreaming,
  type LocalAudioPipelineRequest,
} from '../services/conversation/local-native-audio-pipeline.js';
import { getSTTProvider } from '../services/conversation/stt/stt-provider.js';
import { getProvider } from '../services/conversation/providers/provider-registry.js';
import { getTTSProvider } from '../services/conversation/tts/tts-provider.js';
import { AudioEncoding } from '../../shared/proto/conversation.js';
import type { ISTTProvider, TranscriptionResult, AudioStreamChunk } from '../services/conversation/stt/stt-provider.js';
import type { IStreamingLLMProvider, ConversationContext, StreamCompletionOptions } from '../services/conversation/providers/llm-provider.js';
import type { ITTSProvider, VoiceProfile, AudioChunkOutput, TTSOptions } from '../services/conversation/tts/tts-provider.js';

// ── Mock Factories ────────────────────────────────────────────────────

function createMockSTT(transcript: string): ISTTProvider {
  return {
    name: 'mock-stt',
    async *streamTranscription(): AsyncIterable<TranscriptionResult> {
      yield { text: transcript, isFinal: true, confidence: 0.95, languageDetected: 'en-US' };
    },
  };
}

function createMockLLM(response: string): IStreamingLLMProvider {
  return {
    name: 'mock-llm',
    async *streamCompletion(): AsyncIterable<string> {
      // Yield tokens word by word
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        yield (i > 0 ? ' ' : '') + words[i];
      }
    },
  };
}

function createMockTTS(chunkDurationMs: number = 500): ITTSProvider {
  return {
    name: 'mock-tts',
    async *synthesize(text: string): AsyncIterable<AudioChunkOutput> {
      yield {
        data: new Uint8Array([0x52, 0x49, 0x46, 0x46]), // "RIFF" header stub
        encoding: AudioEncoding.PCM,
        sampleRate: 22050,
        durationMs: chunkDurationMs,
      };
    },
  };
}

// ── Setup ─────────────────────────────────────────────────────────────

function makeRequest(overrides?: Partial<LocalAudioPipelineRequest>): LocalAudioPipelineRequest {
  return {
    audioData: Buffer.from('mock-audio-data'),
    systemPrompt: 'You are a friendly NPC in a village.',
    history: [],
    ...overrides,
  };
}

describe('local-native-audio-pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSTTProvider as any).mockReturnValue(createMockSTT('Hello there'));
    (getProvider as any).mockReturnValue(createMockLLM('Greetings, traveler! Welcome to our village.'));
    (getTTSProvider as any).mockReturnValue(createMockTTS());
  });

  describe('localAudioPipeline', () => {
    it('runs the full STT → LLM → TTS pipeline', async () => {
      const result = await localAudioPipeline(makeRequest());

      expect(result.userTranscript).toBe('Hello there');
      expect(result.responseText).toBe('Greetings, traveler! Welcome to our village.');
      expect(result.audioChunks.length).toBeGreaterThan(0);
      expect(result.totalAudioDurationMs).toBeGreaterThan(0);
      expect(result.timing.sttMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.llmMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.ttsMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.totalMs).toBeGreaterThanOrEqual(0);
    });

    it('returns empty result when STT produces no transcript', async () => {
      (getSTTProvider as any).mockReturnValue(createMockSTT(''));

      const result = await localAudioPipeline(makeRequest());

      expect(result.userTranscript).toBe('');
      expect(result.responseText).toBe('');
      expect(result.audioChunks).toHaveLength(0);
      expect(result.totalAudioDurationMs).toBe(0);
    });

    it('returns empty audio when LLM produces no response', async () => {
      (getProvider as any).mockReturnValue(createMockLLM(''));

      const result = await localAudioPipeline(makeRequest());

      expect(result.userTranscript).toBe('Hello there');
      expect(result.responseText).toBe('');
      expect(result.audioChunks).toHaveLength(0);
    });

    it('uses specified provider overrides', async () => {
      await localAudioPipeline(makeRequest(), {
        sttProvider: 'whisper',
        llmProvider: 'local',
        ttsProvider: 'piper',
      });

      expect(getSTTProvider).toHaveBeenCalledWith('whisper');
      expect(getProvider).toHaveBeenCalledWith('local');
      expect(getTTSProvider).toHaveBeenCalledWith('piper');
    });

    it('uses default providers when no overrides specified', async () => {
      await localAudioPipeline(makeRequest());

      expect(getSTTProvider).toHaveBeenCalledWith(undefined);
      expect(getProvider).toHaveBeenCalledWith(undefined);
      expect(getTTSProvider).toHaveBeenCalledWith(undefined);
    });

    it('resolves voice from explicit name', async () => {
      const result = await localAudioPipeline(makeRequest({ voice: 'Charon' }));

      // Should still produce audio (voice resolved successfully)
      expect(result.audioChunks.length).toBeGreaterThan(0);
    });

    it('resolves voice from character attributes', async () => {
      const result = await localAudioPipeline(makeRequest({
        characterAttributes: {
          gender: 'male',
          age: 60,
          personality: { extroversion: -0.5 },
        },
      }));

      expect(result.audioChunks.length).toBeGreaterThan(0);
    });

    it('defaults to Kore voice when no voice info provided', async () => {
      const result = await localAudioPipeline(makeRequest());

      expect(result.audioChunks.length).toBeGreaterThan(0);
    });

    it('strips system markers before TTS synthesis', async () => {
      const textWithMarkers =
        'Hello! **GRAMMAR_FEEDBACK**fix your grammar**END_GRAMMAR** **QUEST_ASSIGN**quest data**END_QUEST**';
      (getProvider as any).mockReturnValue(createMockLLM(textWithMarkers));

      // Track what text is sent to TTS
      const synthesizedTexts: string[] = [];
      const mockTTS: ITTSProvider = {
        name: 'mock-tts',
        async *synthesize(text: string): AsyncIterable<AudioChunkOutput> {
          synthesizedTexts.push(text);
          yield { data: new Uint8Array([1, 2, 3]), encoding: AudioEncoding.PCM, sampleRate: 22050, durationMs: 100 };
        },
      };
      (getTTSProvider as any).mockReturnValue(mockTTS);

      await localAudioPipeline(makeRequest());

      // Verify markers were stripped from TTS input
      const allSynthesized = synthesizedTexts.join(' ');
      expect(allSynthesized).not.toContain('GRAMMAR_FEEDBACK');
      expect(allSynthesized).not.toContain('QUEST_ASSIGN');
      expect(allSynthesized).toContain('Hello!');
    });

    it('passes conversation history to LLM', async () => {
      let capturedOptions: StreamCompletionOptions | undefined;
      const mockLLM: IStreamingLLMProvider = {
        name: 'mock-llm',
        async *streamCompletion(
          _prompt: string,
          _context: ConversationContext,
          options?: StreamCompletionOptions,
        ): AsyncIterable<string> {
          capturedOptions = options;
          yield 'Response';
        },
      };
      (getProvider as any).mockReturnValue(mockLLM);

      const history = [
        { role: 'user' as const, content: 'Hi' },
        { role: 'assistant' as const, content: 'Hello!' },
      ];
      await localAudioPipeline(makeRequest({ history }));

      expect(capturedOptions?.conversationHistory).toEqual(history);
    });

    it('passes temperature and maxTokens to LLM', async () => {
      let capturedOptions: StreamCompletionOptions | undefined;
      const mockLLM: IStreamingLLMProvider = {
        name: 'mock-llm',
        async *streamCompletion(
          _prompt: string,
          _context: ConversationContext,
          options?: StreamCompletionOptions,
        ): AsyncIterable<string> {
          capturedOptions = options;
          yield 'Hi';
        },
      };
      (getProvider as any).mockReturnValue(mockLLM);

      await localAudioPipeline(makeRequest({ temperature: 0.3, maxTokens: 200 }));

      expect(capturedOptions?.temperature).toBe(0.3);
      expect(capturedOptions?.maxTokens).toBe(200);
    });

    it('accumulates multiple audio chunks with correct total duration', async () => {
      // TTS that produces 3 chunks per sentence
      const mockTTS: ITTSProvider = {
        name: 'mock-tts',
        async *synthesize(): AsyncIterable<AudioChunkOutput> {
          yield { data: new Uint8Array([1]), encoding: AudioEncoding.PCM, sampleRate: 22050, durationMs: 100 };
          yield { data: new Uint8Array([2]), encoding: AudioEncoding.PCM, sampleRate: 22050, durationMs: 200 };
          yield { data: new Uint8Array([3]), encoding: AudioEncoding.PCM, sampleRate: 22050, durationMs: 150 };
        },
      };
      (getTTSProvider as any).mockReturnValue(mockTTS);

      // LLM produces 2 sentences
      (getProvider as any).mockReturnValue(createMockLLM('First sentence. Second sentence.'));

      const result = await localAudioPipeline(makeRequest());

      // 2 sentences × 3 chunks = 6 chunks
      expect(result.audioChunks).toHaveLength(6);
      // 2 × (100 + 200 + 150) = 900ms
      expect(result.totalAudioDurationMs).toBe(900);
    });
  });

  describe('localAudioPipelineStreaming', () => {
    it('yields events in order: transcript → tokens → response_complete → audio → done', async () => {
      const events: string[] = [];

      for await (const event of localAudioPipelineStreaming(makeRequest())) {
        events.push(event.type);
      }

      expect(events[0]).toBe('transcript');
      expect(events).toContain('token');
      expect(events).toContain('response_complete');
      expect(events).toContain('audio_chunk');
      expect(events[events.length - 1]).toBe('done');
    });

    it('yields the correct transcript text', async () => {
      const transcriptEvents: string[] = [];

      for await (const event of localAudioPipelineStreaming(makeRequest())) {
        if (event.type === 'transcript') {
          transcriptEvents.push(event.text);
        }
      }

      expect(transcriptEvents).toEqual(['Hello there']);
    });

    it('yields individual tokens from LLM', async () => {
      (getProvider as any).mockReturnValue(createMockLLM('Hello world'));
      const tokens: string[] = [];

      for await (const event of localAudioPipelineStreaming(makeRequest())) {
        if (event.type === 'token') {
          tokens.push(event.text);
        }
      }

      expect(tokens.join('')).toBe('Hello world');
    });

    it('yields response_complete with full text', async () => {
      let completeText = '';

      for await (const event of localAudioPipelineStreaming(makeRequest())) {
        if (event.type === 'response_complete') {
          completeText = event.text;
        }
      }

      expect(completeText).toBe('Greetings, traveler! Welcome to our village.');
    });

    it('stops after transcript when STT returns empty', async () => {
      (getSTTProvider as any).mockReturnValue(createMockSTT(''));

      const events: string[] = [];
      for await (const event of localAudioPipelineStreaming(makeRequest())) {
        events.push(event.type);
      }

      expect(events).toEqual(['transcript']);
    });

    it('stops after response_complete when LLM returns empty', async () => {
      (getProvider as any).mockReturnValue(createMockLLM(''));

      const events: string[] = [];
      for await (const event of localAudioPipelineStreaming(makeRequest())) {
        events.push(event.type);
      }

      // transcript + empty tokens stream → response_complete only
      expect(events).toContain('transcript');
      expect(events).not.toContain('audio_chunk');
      expect(events).not.toContain('done');
    });

    it('yields audio chunks for each TTS sentence', async () => {
      (getProvider as any).mockReturnValue(createMockLLM('First. Second.'));

      const audioChunks: number[] = [];
      for await (const event of localAudioPipelineStreaming(makeRequest())) {
        if (event.type === 'audio_chunk') {
          audioChunks.push(event.durationMs);
        }
      }

      // 2 sentences → 2 audio chunks (1 per sentence from mock)
      expect(audioChunks).toHaveLength(2);
    });
  });
});
