/**
 * Tests for Whisper.cpp STT Provider
 *
 * Tests the WhisperSTTProvider implementation, WAV helpers, and
 * provider registry integration. Uses mocked child_process to avoid
 * requiring an actual whisper.cpp binary.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  type TranscriptionResult,
  type AudioStreamChunk,
  registerSTTProvider,
  getSTTProvider,
  getRegisteredSTTProviders,
  clearSTTProviders,
} from '../services/conversation/stt/stt-provider.js';
import {
  WhisperSTTProvider,
  buildWavHeader,
  wrapPcmAsWav,
  mergeChunks,
} from '../services/conversation/stt/whisper-stt-provider.js';
import { AudioEncoding } from '@shared/proto/conversation.js';

// ── Helpers ──────────────────────────────────────────────────────────

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

// ── WAV Helper Tests ─────────────────────────────────────────────────

describe('WAV Helpers', () => {
  describe('buildWavHeader', () => {
    it('produces a 44-byte WAV header', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.length).toBe(44);
    });

    it('starts with RIFF magic', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.toString('ascii', 0, 4)).toBe('RIFF');
    });

    it('contains WAVE format', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.toString('ascii', 8, 12)).toBe('WAVE');
    });

    it('contains fmt chunk', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.toString('ascii', 12, 16)).toBe('fmt ');
    });

    it('contains data chunk', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.toString('ascii', 36, 40)).toBe('data');
    });

    it('encodes correct file size', () => {
      const pcmSize = 32000;
      const header = buildWavHeader(pcmSize, 16000, 1);
      // RIFF chunk size = 36 + data size
      expect(header.readUInt32LE(4)).toBe(36 + pcmSize);
    });

    it('encodes correct data size', () => {
      const pcmSize = 32000;
      const header = buildWavHeader(pcmSize, 16000, 1);
      expect(header.readUInt32LE(40)).toBe(pcmSize);
    });

    it('encodes correct sample rate', () => {
      const header = buildWavHeader(1000, 44100, 1);
      expect(header.readUInt32LE(24)).toBe(44100);
    });

    it('encodes correct channel count', () => {
      const header = buildWavHeader(1000, 16000, 2);
      expect(header.readUInt16LE(22)).toBe(2);
    });

    it('sets PCM audio format (1)', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.readUInt16LE(20)).toBe(1);
    });

    it('sets 16-bit samples', () => {
      const header = buildWavHeader(1000, 16000, 1);
      expect(header.readUInt16LE(34)).toBe(16);
    });

    it('calculates correct byte rate for mono 16kHz', () => {
      const header = buildWavHeader(1000, 16000, 1);
      // byteRate = 16000 * 1 * 2 = 32000
      expect(header.readUInt32LE(28)).toBe(32000);
    });

    it('calculates correct byte rate for stereo 44.1kHz', () => {
      const header = buildWavHeader(1000, 44100, 2);
      // byteRate = 44100 * 2 * 2 = 176400
      expect(header.readUInt32LE(28)).toBe(176400);
    });
  });

  describe('wrapPcmAsWav', () => {
    it('prepends 44-byte header to PCM data', () => {
      const pcm = Buffer.alloc(100, 0x42);
      const wav = wrapPcmAsWav(pcm);
      expect(wav.length).toBe(44 + 100);
    });

    it('preserves PCM data after header', () => {
      const pcm = Buffer.from([1, 2, 3, 4, 5]);
      const wav = wrapPcmAsWav(pcm);
      expect(wav.slice(44)).toEqual(pcm);
    });

    it('uses default 16kHz mono', () => {
      const pcm = Buffer.alloc(10);
      const wav = wrapPcmAsWav(pcm);
      expect(wav.readUInt32LE(24)).toBe(16000); // sample rate
      expect(wav.readUInt16LE(22)).toBe(1); // channels
    });

    it('accepts custom sample rate and channels', () => {
      const pcm = Buffer.alloc(10);
      const wav = wrapPcmAsWav(pcm, 48000, 2);
      expect(wav.readUInt32LE(24)).toBe(48000);
      expect(wav.readUInt16LE(22)).toBe(2);
    });
  });

  describe('mergeChunks', () => {
    it('merges empty array to empty buffer', () => {
      const result = mergeChunks([]);
      expect(result.length).toBe(0);
    });

    it('merges single chunk', () => {
      const chunk = new Uint8Array([1, 2, 3]);
      const result = mergeChunks([chunk]);
      expect(result).toEqual(Buffer.from([1, 2, 3]));
    });

    it('merges multiple chunks in order', () => {
      const a = new Uint8Array([1, 2]);
      const b = new Uint8Array([3, 4, 5]);
      const result = mergeChunks([a, b]);
      expect(result).toEqual(Buffer.from([1, 2, 3, 4, 5]));
    });

    it('handles large chunks', () => {
      const a = new Uint8Array(10000).fill(0xAA);
      const b = new Uint8Array(5000).fill(0xBB);
      const result = mergeChunks([a, b]);
      expect(result.length).toBe(15000);
      expect(result[0]).toBe(0xAA);
      expect(result[10000]).toBe(0xBB);
    });
  });
});

// ── Provider Tests ───────────────────────────────────────────────────

describe('WhisperSTTProvider', () => {
  beforeEach(() => {
    clearSTTProviders();
  });

  describe('construction', () => {
    it('creates with default config', () => {
      const provider = new WhisperSTTProvider();
      expect(provider.name).toBe('whisper');
    });

    it('accepts custom config', () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/usr/local/bin/whisper',
        modelPath: '/models/ggml-base.bin',
        modelSize: 'base',
      });
      expect(provider.name).toBe('whisper');
      expect(provider.isConfigured()).toBe(true);
    });

    it('isConfigured returns false when model path is empty', () => {
      const provider = new WhisperSTTProvider({
        binaryPath: 'whisper-cpp',
        modelPath: '',
      });
      expect(provider.isConfigured()).toBe(false);
    });

    it('isConfigured returns true when both paths are set', () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/usr/local/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });
      expect(provider.isConfigured()).toBe(true);
    });
  });

  describe('streamTranscription — unconfigured', () => {
    it('yields nothing when not configured', async () => {
      const provider = new WhisperSTTProvider({ binaryPath: '', modelPath: '' });
      const chunks = createAudioChunks(3);
      const results: TranscriptionResult[] = [];

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks))) {
        results.push(result);
      }

      expect(results.length).toBe(0);
    });
  });

  describe('streamTranscription — with mocked invokeWhisper', () => {
    it('yields a final result from whisper output', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      // Mock the invokeWhisper method to avoid needing the binary
      vi.spyOn(provider, 'invokeWhisper').mockResolvedValue('Hello world');

      const chunks = createAudioChunks(3);
      const results: TranscriptionResult[] = [];

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks), {
        languageCode: 'en-US',
      })) {
        results.push(result);
      }

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Hello world');
      expect(results[0].isFinal).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0);
      expect(results[0].languageDetected).toBe('en-US');
    });

    it('yields nothing for empty whisper output', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      vi.spyOn(provider, 'invokeWhisper').mockResolvedValue('   \n  ');

      const chunks = createAudioChunks(3);
      const results: TranscriptionResult[] = [];

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks))) {
        results.push(result);
      }

      expect(results.length).toBe(0);
    });

    it('yields nothing for empty audio stream', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      const spy = vi.spyOn(provider, 'invokeWhisper').mockResolvedValue('ignored');

      const results: TranscriptionResult[] = [];
      for await (const result of provider.streamTranscription(toAsyncIterable([]))) {
        results.push(result);
      }

      expect(results.length).toBe(0);
      expect(spy).not.toHaveBeenCalled();
    });

    it('passes language hint to invokeWhisper', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      const spy = vi.spyOn(provider, 'invokeWhisper').mockResolvedValue('Bonjour');

      const chunks = createAudioChunks(2);
      const results: TranscriptionResult[] = [];

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks), {
        languageCode: 'fr-FR',
      })) {
        results.push(result);
      }

      expect(spy).toHaveBeenCalledWith(expect.any(String), 'fr');
      expect(results[0].languageDetected).toBe('fr-FR');
    });

    it('passes undefined language for unknown BCP-47 codes', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      const spy = vi.spyOn(provider, 'invokeWhisper').mockResolvedValue('text');

      const chunks = createAudioChunks(1);
      for await (const _result of provider.streamTranscription(toAsyncIterable(chunks), {
        languageCode: 'xx-YY',
      })) {
        // consume
      }

      expect(spy).toHaveBeenCalledWith(expect.any(String), undefined);
    });

    it('uses sample rate from audio chunks', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      vi.spyOn(provider, 'invokeWhisper').mockResolvedValue('test');

      const chunks: AudioStreamChunk[] = [{
        data: new Uint8Array(200),
        encoding: AudioEncoding.PCM,
        sampleRate: 44100,
      }];

      const results: TranscriptionResult[] = [];
      for await (const result of provider.streamTranscription(toAsyncIterable(chunks))) {
        results.push(result);
      }

      expect(results.length).toBe(1);
    });

    it('handles invokeWhisper error gracefully', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      vi.spyOn(provider, 'invokeWhisper').mockRejectedValue(
        new Error('[WhisperSTT] whisper.cpp exited with code 1'),
      );

      const chunks = createAudioChunks(2);

      await expect(async () => {
        for await (const _result of provider.streamTranscription(toAsyncIterable(chunks))) {
          // consume
        }
      }).rejects.toThrow('whisper.cpp exited with code 1');
    });
  });

  describe('provider registry integration', () => {
    it('registers as "whisper" via factory', () => {
      registerSTTProvider('whisper', () => new WhisperSTTProvider());
      const providers = getRegisteredSTTProviders();
      expect(providers).toContain('whisper');
    });

    it('can be retrieved via getSTTProvider', async () => {
      await import('../services/conversation/stt/whisper-stt-provider.js');
      // Re-register since we cleared in beforeEach
      registerSTTProvider('whisper', () => new WhisperSTTProvider());

      const provider = getSTTProvider('whisper');
      expect(provider.name).toBe('whisper');
    });

    it('coexists with other providers', () => {
      registerSTTProvider('whisper', () => new WhisperSTTProvider());
      registerSTTProvider('mock', () => ({
        name: 'mock',
        async *streamTranscription() { /* empty */ },
      }));

      const providers = getRegisteredSTTProviders();
      expect(providers).toContain('whisper');
      expect(providers).toContain('mock');
      expect(providers.length).toBe(2);
    });
  });

  describe('TranscriptionResult shape', () => {
    it('returns all required fields', async () => {
      const provider = new WhisperSTTProvider({
        binaryPath: '/bin/whisper',
        modelPath: '/models/ggml-base.bin',
      });

      vi.spyOn(provider, 'invokeWhisper').mockResolvedValue('Test output');

      const chunks = createAudioChunks(1);

      for await (const result of provider.streamTranscription(toAsyncIterable(chunks))) {
        expect(typeof result.text).toBe('string');
        expect(typeof result.isFinal).toBe('boolean');
        expect(typeof result.confidence).toBe('number');
        expect(typeof result.languageDetected).toBe('string');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(result.isFinal).toBe(true);
      }
    });
  });
});
