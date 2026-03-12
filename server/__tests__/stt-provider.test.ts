/**
 * Tests for STT Provider Interface, Registry, and Google STT Provider
 *
 * US-008: STT provider interface and implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  type ISTTProvider,
  type TranscriptionResult,
  type AudioStreamChunk,
  type STTOptions,
  registerSTTProvider,
  getSTTProvider,
  getRegisteredSTTProviders,
  clearSTTProviders,
} from '../services/conversation/stt/stt-provider.js';
import { AudioEncoding } from '@shared/proto/conversation.js';

// ── Mock STT Provider ─────────────────────────────────────────────────

class MockSTTProvider implements ISTTProvider {
  readonly name = 'mock';
  public callCount = 0;
  public lastOptions: STTOptions | undefined;
  public resultsToReturn: TranscriptionResult[] = [];

  async *streamTranscription(
    audioStream: AsyncIterable<AudioStreamChunk>,
    options?: STTOptions,
  ): AsyncIterable<TranscriptionResult> {
    this.callCount++;
    this.lastOptions = options;

    // Consume the audio stream (simulates processing)
    let chunkCount = 0;
    for await (const _chunk of audioStream) {
      chunkCount++;
    }

    // Yield results
    for (const result of this.resultsToReturn) {
      yield result;
    }
  }
}

// ── Slow partial results provider ────────────────────────────────────

class PartialResultsSTTProvider implements ISTTProvider {
  readonly name = 'partial';

  async *streamTranscription(
    audioStream: AsyncIterable<AudioStreamChunk>,
    options?: STTOptions,
  ): AsyncIterable<TranscriptionResult> {
    // Consume audio
    for await (const _chunk of audioStream) {
      // no-op
    }

    // Simulate partial then final results
    yield {
      text: 'Hello',
      isFinal: false,
      confidence: 0.7,
      languageDetected: options?.languageCode ?? 'en-US',
    };
    yield {
      text: 'Hello world',
      isFinal: true,
      confidence: 0.95,
      languageDetected: options?.languageCode ?? 'en-US',
    };
  }
}

// ── Helper to create audio chunks ────────────────────────────────────

function createAudioChunks(count: number, bytesEach = 100): AudioStreamChunk[] {
  const chunks: AudioStreamChunk[] = [];
  for (let i = 0; i < count; i++) {
    chunks.push({
      data: new Uint8Array(bytesEach).fill(i % 256),
      encoding: AudioEncoding.PCM,
      sampleRate: 16000,
    });
  }
  return chunks;
}

function toAsyncIterable(chunks: AudioStreamChunk[]): AsyncIterable<AudioStreamChunk> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('STT Provider Interface', () => {
  beforeEach(() => {
    clearSTTProviders();
  });

  describe('Provider Registry', () => {
    it('registers and retrieves a provider', () => {
      const mock = new MockSTTProvider();
      registerSTTProvider('mock', () => mock);

      const provider = getSTTProvider('mock');
      expect(provider).toBe(mock);
      expect(provider.name).toBe('mock');
    });

    it('throws for unknown provider', () => {
      expect(() => getSTTProvider('nonexistent')).toThrow(
        'STT provider "nonexistent" not found',
      );
    });

    it('lists registered providers', () => {
      registerSTTProvider('a', () => new MockSTTProvider());
      registerSTTProvider('b', () => new MockSTTProvider());

      const providers = getRegisteredSTTProviders();
      expect(providers).toContain('a');
      expect(providers).toContain('b');
      expect(providers.length).toBe(2);
    });

    it('clears all providers', () => {
      registerSTTProvider('mock', () => new MockSTTProvider());
      expect(getRegisteredSTTProviders().length).toBe(1);

      clearSTTProviders();
      expect(getRegisteredSTTProviders().length).toBe(0);
    });

    it('overwrites provider with same name', () => {
      const mock1 = new MockSTTProvider();
      const mock2 = new MockSTTProvider();
      mock2.resultsToReturn = [{ text: 'second', isFinal: true, confidence: 1, languageDetected: 'en' }];

      registerSTTProvider('mock', () => mock1);
      registerSTTProvider('mock', () => mock2);

      const provider = getSTTProvider('mock') as MockSTTProvider;
      expect(provider.resultsToReturn.length).toBe(1);
      expect(provider.resultsToReturn[0].text).toBe('second');
    });

    it('error message lists available providers', () => {
      registerSTTProvider('alpha', () => new MockSTTProvider());
      registerSTTProvider('beta', () => new MockSTTProvider());

      try {
        getSTTProvider('gamma');
        expect.unreachable('should throw');
      } catch (err: any) {
        expect(err.message).toContain('alpha');
        expect(err.message).toContain('beta');
      }
    });
  });

  describe('Mock STT Provider — streamTranscription', () => {
    it('returns streaming transcription results', async () => {
      const mock = new MockSTTProvider();
      mock.resultsToReturn = [
        { text: 'Hello', isFinal: false, confidence: 0.8, languageDetected: 'en-US' },
        { text: 'Hello world', isFinal: true, confidence: 0.95, languageDetected: 'en-US' },
      ];

      const chunks = createAudioChunks(3);
      const results: TranscriptionResult[] = [];

      for await (const result of mock.streamTranscription(toAsyncIterable(chunks))) {
        results.push(result);
      }

      expect(results.length).toBe(2);
      expect(results[0].text).toBe('Hello');
      expect(results[0].isFinal).toBe(false);
      expect(results[1].text).toBe('Hello world');
      expect(results[1].isFinal).toBe(true);
    });

    it('passes options through to provider', async () => {
      const mock = new MockSTTProvider();
      const chunks = createAudioChunks(1);
      const opts: STTOptions = { languageCode: 'fr-FR', sampleRate: 44100 };

      for await (const _result of mock.streamTranscription(toAsyncIterable(chunks), opts)) {
        // consume
      }

      expect(mock.lastOptions).toEqual(opts);
      expect(mock.callCount).toBe(1);
    });

    it('handles empty audio stream', async () => {
      const mock = new MockSTTProvider();
      mock.resultsToReturn = [];

      const results: TranscriptionResult[] = [];
      for await (const result of mock.streamTranscription(toAsyncIterable([]))) {
        results.push(result);
      }

      expect(results.length).toBe(0);
      expect(mock.callCount).toBe(1);
    });

    it('handles large audio stream', async () => {
      const mock = new MockSTTProvider();
      mock.resultsToReturn = [
        { text: 'Long speech', isFinal: true, confidence: 0.9, languageDetected: 'en-US' },
      ];

      const chunks = createAudioChunks(100, 1000); // 100 chunks, 1KB each
      const results: TranscriptionResult[] = [];

      for await (const result of mock.streamTranscription(toAsyncIterable(chunks))) {
        results.push(result);
      }

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Long speech');
    });
  });

  describe('Partial Results Provider', () => {
    it('yields partial then final results', async () => {
      const provider = new PartialResultsSTTProvider();
      const chunks = createAudioChunks(5);
      const results: TranscriptionResult[] = [];

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks), {
        languageCode: 'en-US',
      })) {
        results.push(result);
      }

      expect(results.length).toBe(2);
      expect(results[0].isFinal).toBe(false);
      expect(results[0].text).toBe('Hello');
      expect(results[1].isFinal).toBe(true);
      expect(results[1].text).toBe('Hello world');
      expect(results[1].confidence).toBe(0.95);
    });

    it('uses provided language code for detection', async () => {
      const provider = new PartialResultsSTTProvider();
      const chunks = createAudioChunks(1);
      const results: TranscriptionResult[] = [];

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks), {
        languageCode: 'ja-JP',
      })) {
        results.push(result);
      }

      expect(results[0].languageDetected).toBe('ja-JP');
      expect(results[1].languageDetected).toBe('ja-JP');
    });
  });

  describe('TranscriptionResult shape', () => {
    it('has all required fields', async () => {
      const mock = new MockSTTProvider();
      mock.resultsToReturn = [
        { text: 'test', isFinal: true, confidence: 0.99, languageDetected: 'de-DE' },
      ];

      for await (const result of mock.streamTranscription(toAsyncIterable(createAudioChunks(1)))) {
        expect(typeof result.text).toBe('string');
        expect(typeof result.isFinal).toBe('boolean');
        expect(typeof result.confidence).toBe('number');
        expect(typeof result.languageDetected).toBe('string');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Google STT Provider', () => {
    it('instantiates via import', async () => {
      // Import triggers auto-registration
      await import('../services/conversation/stt/google-stt-provider.js');

      const providers = getRegisteredSTTProviders();
      expect(providers).toContain('google');

      const provider = getSTTProvider('google');
      expect(provider.name).toBe('google');
    });

    it('returns empty results when no API key configured', async () => {
      const { GoogleSTTProvider } = await import('../services/conversation/stt/google-stt-provider.js');
      registerSTTProvider('google', () => new GoogleSTTProvider());
      const provider = getSTTProvider('google');

      // Without GOOGLE_CLOUD_API_KEY, recognizeChunk returns null
      const chunks = createAudioChunks(3, 16000); // enough to trigger processing
      const results: TranscriptionResult[] = [];

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks), {
        languageCode: 'en-US',
        sampleRate: 16000,
      })) {
        results.push(result);
      }

      // Without API key, provider gracefully returns no results
      expect(results.length).toBe(0);
    });
  });

  describe('AudioStreamChunk shape', () => {
    it('supports PCM encoding', () => {
      const chunk: AudioStreamChunk = {
        data: new Uint8Array(100),
        encoding: AudioEncoding.PCM,
        sampleRate: 16000,
      };
      expect(chunk.encoding).toBe(AudioEncoding.PCM);
    });

    it('supports OPUS encoding', () => {
      const chunk: AudioStreamChunk = {
        data: new Uint8Array(50),
        encoding: AudioEncoding.OPUS,
        sampleRate: 48000,
      };
      expect(chunk.encoding).toBe(AudioEncoding.OPUS);
    });

    it('supports MP3 encoding', () => {
      const chunk: AudioStreamChunk = {
        data: new Uint8Array(200),
        encoding: AudioEncoding.MP3,
        sampleRate: 44100,
      };
      expect(chunk.encoding).toBe(AudioEncoding.MP3);
    });
  });
});
