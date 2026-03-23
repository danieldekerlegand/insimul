/**
 * Tests for Whisper.cpp Batch STT Provider
 *
 * Tests the WhisperBatchSTTProvider that wraps the streaming whisper provider
 * behind the IBatchSTTProvider interface used by HTTP routes.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sttRegistry } from '../services/providers/registry.js';
import type { TranscriptionResult } from '../services/conversation/stt/stt-provider.js';

// ── Mock the underlying WhisperSTTProvider ───────────────────────────

let mockIsConfigured = true;
let mockStreamResults: TranscriptionResult[] = [
  { text: 'Hello world', isFinal: true, confidence: 0.85, languageDetected: 'en' },
];
let mockStreamError: Error | null = null;
let lastStreamOptions: any = null;

vi.mock('../services/conversation/stt/whisper-stt-provider.js', () => {
  return {
    WhisperSTTProvider: class {
      readonly name = 'whisper';
      isConfigured() { return mockIsConfigured; }
      async *streamTranscription(_stream: any, options: any) {
        lastStreamOptions = options;
        if (mockStreamError) throw mockStreamError;
        for (const result of mockStreamResults) {
          yield result;
        }
      }
    },
    wrapPcmAsWav: (buf: Buffer) => {
      const header = Buffer.alloc(44);
      header.write('RIFF', 0);
      header.write('WAVE', 8);
      return Buffer.concat([header, buf]);
    },
  };
});

// Import after mocks
import { WhisperBatchSTTProvider } from '../services/providers/whisper-stt.js';

// ── Tests ────────────────────────────────────────────────────────────

describe('WhisperBatchSTTProvider', () => {
  let provider: WhisperBatchSTTProvider;

  beforeEach(() => {
    mockIsConfigured = true;
    mockStreamResults = [
      { text: 'Hello world', isFinal: true, confidence: 0.85, languageDetected: 'en' },
    ];
    mockStreamError = null;
    lastStreamOptions = null;
    provider = new WhisperBatchSTTProvider();
  });

  describe('registration', () => {
    it('registers as "whisper" in the stt registry', () => {
      // The import side-effect should have registered it
      expect(sttRegistry.list()).toContain('whisper');
    });

    it('has correct provider name', () => {
      expect(provider.name).toBe('whisper');
    });
  });

  describe('transcribe', () => {
    it('transcribes WAV audio', async () => {
      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(1000),
        mimeType: 'audio/wav',
      });
      expect(result.transcript).toBe('Hello world');
    });

    it('transcribes raw PCM audio by wrapping as WAV', async () => {
      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(500),
        mimeType: 'audio/pcm',
      });
      expect(result.transcript).toBe('Hello world');
    });

    it('returns empty transcript when whisper yields nothing', async () => {
      mockStreamResults = [];
      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
        mimeType: 'audio/wav',
      });
      expect(result.transcript).toBe('');
    });

    it('passes language hint "French" as BCP-47 code fr-FR', async () => {
      mockStreamResults = [
        { text: 'Bonjour', isFinal: true, confidence: 0.9, languageDetected: 'fr' },
      ];

      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
        mimeType: 'audio/wav',
        languageHint: 'French',
      });

      expect(result.transcript).toBe('Bonjour');
      expect(lastStreamOptions.languageCode).toBe('fr-FR');
    });

    it('passes BCP-47 language hint directly', async () => {
      await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
        mimeType: 'audio/wav',
        languageHint: 'es-MX',
      });
      expect(lastStreamOptions.languageCode).toBe('es-mx');
    });

    it('handles undefined language hint', async () => {
      await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
        mimeType: 'audio/wav',
      });
      expect(lastStreamOptions.languageCode).toBeUndefined();
    });

    it('concatenates multiple final results', async () => {
      mockStreamResults = [
        { text: 'Hello', isFinal: true, confidence: 0.8, languageDetected: 'en' },
        { text: 'world', isFinal: true, confidence: 0.9, languageDetected: 'en' },
      ];

      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
        mimeType: 'audio/wav',
      });
      expect(result.transcript).toBe('Hello world');
    });

    it('defaults to audio/wav when no mimeType provided', async () => {
      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
      });
      expect(result.transcript).toBe('Hello world');
    });
  });

  describe('error handling', () => {
    it('throws when whisper is not configured', async () => {
      mockIsConfigured = false;
      provider = new WhisperBatchSTTProvider();

      await expect(
        provider.transcribe({
          audioBuffer: Buffer.alloc(100),
          mimeType: 'audio/wav',
        }),
      ).rejects.toThrow('Not configured');
    });

    it('propagates whisper transcription errors', async () => {
      mockStreamError = new Error('whisper.cpp crashed');

      await expect(
        provider.transcribe({
          audioBuffer: Buffer.alloc(100),
          mimeType: 'audio/wav',
        }),
      ).rejects.toThrow('whisper.cpp crashed');
    });
  });

  describe('language hint mapping', () => {
    const testCases = [
      { input: 'English', expected: 'en-US' },
      { input: 'French', expected: 'fr-FR' },
      { input: 'Spanish', expected: 'es-ES' },
      { input: 'German', expected: 'de-DE' },
      { input: 'Japanese', expected: 'ja-JP' },
      { input: 'en-US', expected: 'en-us' },
      { input: 'fr', expected: 'fr' },
      { input: undefined, expected: undefined },
    ];

    for (const { input, expected } of testCases) {
      it(`maps "${input}" → "${expected}"`, async () => {
        await provider.transcribe({
          audioBuffer: Buffer.alloc(100),
          mimeType: 'audio/wav',
          languageHint: input,
        });
        expect(lastStreamOptions.languageCode).toBe(expected);
      });
    }
  });

  describe('MIME type handling', () => {
    it('treats audio/wave as WAV (no conversion)', async () => {
      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
        mimeType: 'audio/wave',
      });
      expect(result.transcript).toBe('Hello world');
    });

    it('treats audio/x-wav as WAV (no conversion)', async () => {
      const result = await provider.transcribe({
        audioBuffer: Buffer.alloc(100),
        mimeType: 'audio/x-wav',
      });
      expect(result.transcript).toBe('Hello world');
    });
  });
});
