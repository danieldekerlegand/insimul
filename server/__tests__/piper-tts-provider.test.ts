/**
 * Piper TTS Provider Tests
 *
 * Tests for voice model resolution, audio encoding, length scale computation,
 * caching, and streaming synthesis with mocked Piper subprocess.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEncoding } from '../../shared/proto/conversation.js';
import {
  VOICE_PROFILES,
  getRegisteredTTSProviders,
  registerTTSProvider,
  getTTSProvider,
  type AudioChunkOutput,
} from '../services/conversation/tts/tts-provider.js';

// Must import after tts-provider so registry is available
import {
  PiperTTSProvider,
  VOICE_MODEL_MAP,
  LANGUAGE_MODEL_MAP,
  PIPER_SAMPLE_RATE,
} from '../services/conversation/tts/piper-tts-provider.js';
import { ttsCache } from '../services/tts-cache.js';

// ── Test Setup ──────────────────────────────────────────────────────

const MOCK_VOICES_DIR = '/tmp/piper-test-voices';

// Mock fs.existsSync to simulate voice model files
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      existsSync: vi.fn((p: string) => {
        if (typeof p === 'string' && p.startsWith(MOCK_VOICES_DIR) && p.endsWith('.onnx')) {
          return true;
        }
        return false;
      }),
    },
    existsSync: vi.fn((p: string) => {
      if (typeof p === 'string' && p.startsWith(MOCK_VOICES_DIR) && p.endsWith('.onnx')) {
        return true;
      }
      return false;
    }),
  };
});

describe('PiperTTSProvider', () => {
  let provider: PiperTTSProvider;

  beforeEach(() => {
    provider = new PiperTTSProvider(MOCK_VOICES_DIR, '/usr/local/bin/piper');
    ttsCache.clear();
  });

  // ── Registration ────────────────────────────────────────────────

  describe('auto-registration', () => {
    it('registers as "piper" provider', () => {
      expect(getRegisteredTTSProviders()).toContain('piper');
    });

    it('can be retrieved via getTTSProvider', () => {
      const p = getTTSProvider('piper');
      expect(p.name).toBe('piper');
    });
  });

  // ── Voice Model Resolution ──────────────────────────────────────

  describe('resolveModelPath', () => {
    it('resolves voice-specific model for known voice names', () => {
      const kore = VOICE_PROFILES.find(v => v.name === 'Kore')!;
      const result = provider.resolveModelPath(kore);
      expect(result).toContain('en_US-lessac-medium.onnx');
    });

    it('resolves language-specific model for French', () => {
      const voice = VOICE_PROFILES.find(v => v.gender === 'female' && v.ageRange === 'middle')!;
      const result = provider.resolveModelPath(voice, 'fr-FR');
      expect(result).toContain('.onnx');
    });

    it('resolves language-specific model for male German', () => {
      const voice = VOICE_PROFILES.find(v => v.gender === 'male' && v.ageRange === 'middle')!;
      const result = provider.resolveModelPath(voice, 'de');
      expect(result).toContain('.onnx');
    });

    it('returns null when voicesDir is empty', () => {
      const emptyProvider = new PiperTTSProvider('', '/usr/local/bin/piper');
      const voice = VOICE_PROFILES[0];
      expect(emptyProvider.resolveModelPath(voice)).toBeNull();
    });

    it('maps all 8 voice profiles to model names', () => {
      for (const voice of VOICE_PROFILES) {
        const modelName = VOICE_MODEL_MAP[voice.name];
        expect(modelName).toBeTruthy();
        expect(modelName).toMatch(/^[a-z]{2}_[A-Z]{2}-/);
      }
    });
  });

  // ── Voice Model Map ─────────────────────────────────────────────

  describe('VOICE_MODEL_MAP', () => {
    it('has entries for all 8 voice profile names', () => {
      for (const voice of VOICE_PROFILES) {
        expect(VOICE_MODEL_MAP[voice.name]).toBeDefined();
      }
    });

    it('all model names follow Piper naming convention', () => {
      for (const model of Object.values(VOICE_MODEL_MAP)) {
        expect(model).toMatch(/^[a-z]{2}_[A-Z]{2}-.+-(low|medium|high|x_low)$/);
      }
    });
  });

  // ── Language Model Map ──────────────────────────────────────────

  describe('LANGUAGE_MODEL_MAP', () => {
    it('supports English, French, Spanish, and German', () => {
      expect(LANGUAGE_MODEL_MAP['en']).toBeDefined();
      expect(LANGUAGE_MODEL_MAP['fr']).toBeDefined();
      expect(LANGUAGE_MODEL_MAP['es']).toBeDefined();
      expect(LANGUAGE_MODEL_MAP['de']).toBeDefined();
    });

    it('has both male and female models per language', () => {
      for (const [, models] of Object.entries(LANGUAGE_MODEL_MAP)) {
        expect(models.female).toBeTruthy();
        expect(models.male).toBeTruthy();
      }
    });
  });

  // ── Length Scale Computation ─────────────────────────────────────

  describe('computeLengthScale', () => {
    it('returns inverse of default voice speaking rate', () => {
      const voice = { ...VOICE_PROFILES[0], speakingRate: 1.0 };
      expect(provider.computeLengthScale(voice)).toBeCloseTo(1.0);
    });

    it('faster rate produces smaller length scale', () => {
      const voice = { ...VOICE_PROFILES[0], speakingRate: 1.5 };
      expect(provider.computeLengthScale(voice)).toBeCloseTo(1.0 / 1.5);
    });

    it('slower rate produces larger length scale', () => {
      const voice = { ...VOICE_PROFILES[0], speakingRate: 0.5 };
      expect(provider.computeLengthScale(voice)).toBeCloseTo(2.0);
    });

    it('options speakingRate overrides voice rate', () => {
      const voice = { ...VOICE_PROFILES[0], speakingRate: 1.0 };
      const scale = provider.computeLengthScale(voice, { speakingRate: 2.0 });
      expect(scale).toBeCloseTo(0.5);
    });
  });

  // ── Audio Encoding ──────────────────────────────────────────────

  describe('encodeAudio', () => {
    const samplePcm = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);

    it('returns raw PCM when encoding is PCM', () => {
      const result = provider.encodeAudio(samplePcm, AudioEncoding.PCM);
      expect(result.encoding).toBe(AudioEncoding.PCM);
      expect(result.data.length).toBe(samplePcm.length);
    });

    it('returns WAV (PCM with header) for default encoding', () => {
      const result = provider.encodeAudio(samplePcm);
      expect(result.encoding).toBe(AudioEncoding.PCM);
      // WAV header is 44 bytes + data
      expect(result.data.length).toBe(44 + samplePcm.length);
    });

    it('WAV header starts with RIFF', () => {
      const result = provider.encodeAudio(samplePcm);
      const header = Buffer.from(result.data.slice(0, 4));
      expect(header.toString('ascii')).toBe('RIFF');
    });

    it('WAV header contains WAVE format', () => {
      const result = provider.encodeAudio(samplePcm);
      const format = Buffer.from(result.data.slice(8, 12));
      expect(format.toString('ascii')).toBe('WAVE');
    });

    it('WAV header encodes correct sample rate', () => {
      const result = provider.encodeAudio(samplePcm);
      const buf = Buffer.from(result.data);
      const sampleRate = buf.readUInt32LE(24);
      expect(sampleRate).toBe(PIPER_SAMPLE_RATE);
    });
  });

  // ── Streaming Synthesis (with mocked synthesizeSegment) ─────────

  describe('synthesize', () => {
    it('yields audio chunks for each sentence', async () => {
      const pcmData = Buffer.alloc(4410, 0);
      vi.spyOn(provider, 'synthesizeSegment').mockResolvedValue(pcmData);

      const voice = VOICE_PROFILES.find(v => v.name === 'Kore')!;
      const chunks: AudioChunkOutput[] = [];

      for await (const chunk of provider.synthesize('Hello. World.', voice)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0].sampleRate).toBe(PIPER_SAMPLE_RATE);
      expect(chunks[0].durationMs).toBeGreaterThan(0);
    });

    it('handles empty text gracefully', async () => {
      const voice = VOICE_PROFILES[0];
      const chunks: AudioChunkOutput[] = [];
      for await (const chunk of provider.synthesize('', voice)) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(0);
    });

    it('skips synthesis when no model found', async () => {
      const noModelProvider = new PiperTTSProvider('', '/usr/local/bin/piper');
      const voice = VOICE_PROFILES[0];
      const chunks: AudioChunkOutput[] = [];
      for await (const chunk of noModelProvider.synthesize('Hello.', voice)) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(0);
    });

    it('continues on per-sentence errors', async () => {
      let callCount = 0;
      vi.spyOn(provider, 'synthesizeSegment').mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Piper exited with code 1');
        }
        return Buffer.alloc(100, 0);
      });

      const voice = VOICE_PROFILES.find(v => v.name === 'Kore')!;
      const chunks: AudioChunkOutput[] = [];
      for await (const chunk of provider.synthesize('Fail. Succeed.', voice)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
    });

    it('uses cache on repeated synthesis', async () => {
      const pcmData = Buffer.alloc(200, 0x42);
      const spy = vi.spyOn(provider, 'synthesizeSegment').mockResolvedValue(pcmData);

      const voice = VOICE_PROFILES.find(v => v.name === 'Kore')!;

      // First call - synthesizes
      const chunks1: AudioChunkOutput[] = [];
      for await (const chunk of provider.synthesize('Cached.', voice)) {
        chunks1.push(chunk);
      }
      expect(chunks1).toHaveLength(1);
      expect(spy).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const chunks2: AudioChunkOutput[] = [];
      for await (const chunk of provider.synthesize('Cached.', voice)) {
        chunks2.push(chunk);
      }
      expect(chunks2).toHaveLength(1);
      expect(spy).toHaveBeenCalledTimes(1); // Not called again
    });

    it('skips empty PCM data', async () => {
      vi.spyOn(provider, 'synthesizeSegment').mockResolvedValue(Buffer.alloc(0));

      const voice = VOICE_PROFILES.find(v => v.name === 'Kore')!;
      const chunks: AudioChunkOutput[] = [];
      for await (const chunk of provider.synthesize('Hello.', voice)) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(0);
    });

    it('passes length_scale to synthesizeSegment', async () => {
      const pcmData = Buffer.alloc(100, 0);
      const spy = vi.spyOn(provider, 'synthesizeSegment').mockResolvedValue(pcmData);

      const voice = VOICE_PROFILES.find(v => v.name === 'Kore')!;
      for await (const _ of provider.synthesize('Hello.', voice, { speakingRate: 2.0 })) {
        // consume
      }

      // length_scale should be 1/2.0 = 0.5
      expect(spy).toHaveBeenCalledWith('Hello.', expect.any(String), 0.5);
    });
  });

  // ── Provider Properties ─────────────────────────────────────────

  describe('provider properties', () => {
    it('has name "piper"', () => {
      expect(provider.name).toBe('piper');
    });

    it('uses PIPER_SAMPLE_RATE of 22050', () => {
      expect(PIPER_SAMPLE_RATE).toBe(22050);
    });
  });
});
