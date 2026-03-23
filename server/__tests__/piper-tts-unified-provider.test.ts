/**
 * Piper TTS Provider (Unified AI Interface) Tests
 *
 * Tests for the batch ITTSProvider that integrates Piper into the
 * unified AI provider system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PiperTTSProvider,
  VOICE_MODEL_MAP,
  LANGUAGE_MODEL_MAP,
  PIPER_SAMPLE_RATE,
  buildWavHeader,
} from '../services/ai/providers/local/piper-tts-provider.js';
import { ttsCache } from '../services/tts-cache.js';

// ── Test Setup ──────────────────────────────────────────────────────

const MOCK_VOICES_DIR = '/tmp/piper-test-voices';

// Mock fs.existsSync to simulate voice model files
vi.mock('fs', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      existsSync: vi.fn((p: string) => {
        if (typeof p === 'string' && p.startsWith(MOCK_VOICES_DIR) && p.endsWith('.onnx')) {
          return true;
        }
        // For isAvailable() — check the voices dir itself
        if (p === MOCK_VOICES_DIR) return true;
        return false;
      }),
    },
    existsSync: vi.fn((p: string) => {
      if (typeof p === 'string' && p.startsWith(MOCK_VOICES_DIR) && p.endsWith('.onnx')) {
        return true;
      }
      if (p === MOCK_VOICES_DIR) return true;
      return false;
    }),
  };
});

describe('PiperTTSProvider (Unified)', () => {
  let provider: PiperTTSProvider;

  beforeEach(() => {
    provider = new PiperTTSProvider(MOCK_VOICES_DIR, '/usr/local/bin/piper');
    ttsCache.clear();
  });

  // ── Provider Properties ─────────────────────────────────────────

  describe('provider properties', () => {
    it('has name "piper-tts"', () => {
      expect(provider.name).toBe('piper-tts');
    });

    it('reports available when voices dir is set', () => {
      expect(provider.isAvailable()).toBe(true);
    });

    it('reports unavailable when voices dir is empty', () => {
      const emptyProvider = new PiperTTSProvider('', '/usr/local/bin/piper');
      expect(emptyProvider.isAvailable()).toBe(false);
    });
  });

  // ── Voice Model Resolution ──────────────────────────────────────

  describe('resolveModelPath', () => {
    it('resolves voice-specific model for Kore', () => {
      const result = provider.resolveModelPath('Kore');
      expect(result).toContain('en_US-lessac-medium.onnx');
    });

    it('resolves voice-specific model for Puck', () => {
      const result = provider.resolveModelPath('Puck');
      expect(result).toContain('en_US-ryan-medium.onnx');
    });

    it('resolves voice-specific model for Aoede', () => {
      const result = provider.resolveModelPath('Aoede');
      expect(result).toContain('en_US-amy-medium.onnx');
    });

    it('resolves voice-specific model for Charon', () => {
      const result = provider.resolveModelPath('Charon');
      expect(result).toContain('en_US-arctic-medium.onnx');
    });

    it('resolves language-specific model for French', () => {
      const result = provider.resolveModelPath('Kore', 'fr-FR');
      expect(result).toContain('.onnx');
    });

    it('resolves language-specific model for Spanish', () => {
      const result = provider.resolveModelPath('Puck', 'es');
      expect(result).toContain('.onnx');
    });

    it('resolves language-specific model for German', () => {
      const result = provider.resolveModelPath('Charon', 'de-DE');
      expect(result).toContain('.onnx');
    });

    it('returns null when voicesDir is empty', () => {
      const emptyProvider = new PiperTTSProvider('', '/usr/local/bin/piper');
      expect(emptyProvider.resolveModelPath('Kore')).toBeNull();
    });

    it('falls back to English model for unknown voice name', () => {
      const result = provider.resolveModelPath('UnknownVoice');
      // Should fall back to female English default
      expect(result).toContain('en_US-lessac-medium.onnx');
    });

    it('maps all known voices to models', () => {
      for (const voiceName of Object.keys(VOICE_MODEL_MAP)) {
        const result = provider.resolveModelPath(voiceName);
        expect(result).toBeTruthy();
        expect(result).toContain('.onnx');
      }
    });
  });

  // ── Voice Model Map ─────────────────────────────────────────────

  describe('VOICE_MODEL_MAP', () => {
    it('has entries for Kore, Charon, Aoede, Puck', () => {
      expect(VOICE_MODEL_MAP['Kore']).toBeDefined();
      expect(VOICE_MODEL_MAP['Charon']).toBeDefined();
      expect(VOICE_MODEL_MAP['Aoede']).toBeDefined();
      expect(VOICE_MODEL_MAP['Puck']).toBeDefined();
    });

    it('includes gender info for each voice', () => {
      for (const [, info] of Object.entries(VOICE_MODEL_MAP)) {
        expect(info.gender).toMatch(/^(male|female)$/);
        expect(info.model).toMatch(/^[a-z]{2}_[A-Z]{2}-.+/);
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
    it('returns 1.0 with no options', () => {
      expect(provider.computeLengthScale()).toBeCloseTo(1.0);
    });

    it('uses speed option directly', () => {
      expect(provider.computeLengthScale({ speed: 1.5 })).toBeCloseTo(1.0 / 1.5);
    });

    it('maps happy emotional tone to faster rate', () => {
      const scale = provider.computeLengthScale({ emotionalTone: 'happy' });
      // happy → 105% rate → 1/1.05 ≈ 0.952
      expect(scale).toBeLessThan(1.0);
    });

    it('maps sad emotional tone to slower rate', () => {
      const scale = provider.computeLengthScale({ emotionalTone: 'sad' });
      // sad → 85% rate → 1/0.85 ≈ 1.176
      expect(scale).toBeGreaterThan(1.0);
    });

    it('speed option takes priority over emotional tone', () => {
      const scale = provider.computeLengthScale({ speed: 2.0, emotionalTone: 'sad' });
      expect(scale).toBeCloseTo(0.5);
    });
  });

  // ── WAV Header ──────────────────────────────────────────────────

  describe('buildWavHeader', () => {
    it('creates a 44-byte header', () => {
      const header = buildWavHeader(100, PIPER_SAMPLE_RATE);
      expect(header.length).toBe(44);
    });

    it('starts with RIFF', () => {
      const header = buildWavHeader(100, PIPER_SAMPLE_RATE);
      expect(header.toString('ascii', 0, 4)).toBe('RIFF');
    });

    it('contains WAVE format', () => {
      const header = buildWavHeader(100, PIPER_SAMPLE_RATE);
      expect(header.toString('ascii', 8, 12)).toBe('WAVE');
    });

    it('encodes correct sample rate', () => {
      const header = buildWavHeader(100, PIPER_SAMPLE_RATE);
      expect(header.readUInt32LE(24)).toBe(PIPER_SAMPLE_RATE);
    });

    it('encodes correct data size', () => {
      const dataSize = 4410;
      const header = buildWavHeader(dataSize, PIPER_SAMPLE_RATE);
      expect(header.readUInt32LE(40)).toBe(dataSize);
    });
  });

  // ── Synthesis (with mocked synthesizeRaw) ──────────────────────

  describe('synthesize', () => {
    it('returns WAV buffer on success', async () => {
      const pcmData = Buffer.alloc(4410, 0);
      vi.spyOn(provider, 'synthesizeRaw').mockResolvedValue(pcmData);

      const result = await provider.synthesize('Hello world', 'Kore');
      // WAV = 44 header + PCM data
      expect(result.length).toBe(44 + pcmData.length);
      expect(result.toString('ascii', 0, 4)).toBe('RIFF');
    });

    it('throws when no model found', async () => {
      const emptyProvider = new PiperTTSProvider('', '/usr/local/bin/piper');
      await expect(emptyProvider.synthesize('Hello', 'Kore')).rejects.toThrow(
        /No Piper voice model found/,
      );
    });

    it('throws when Piper returns empty audio', async () => {
      vi.spyOn(provider, 'synthesizeRaw').mockResolvedValue(Buffer.alloc(0));
      await expect(provider.synthesize('Hello', 'Kore')).rejects.toThrow(
        /empty audio/,
      );
    });

    it('uses cache on repeated calls', async () => {
      const pcmData = Buffer.alloc(200, 0x42);
      const spy = vi.spyOn(provider, 'synthesizeRaw').mockResolvedValue(pcmData);

      const result1 = await provider.synthesize('Cached text', 'Kore');
      expect(spy).toHaveBeenCalledTimes(1);

      const result2 = await provider.synthesize('Cached text', 'Kore');
      expect(spy).toHaveBeenCalledTimes(1); // Not called again
      expect(result1.equals(result2)).toBe(true);
    });

    it('passes language code to model resolution', async () => {
      const pcmData = Buffer.alloc(100, 0);
      vi.spyOn(provider, 'synthesizeRaw').mockResolvedValue(pcmData);
      const spy = vi.spyOn(provider, 'resolveModelPath');

      await provider.synthesize('Bonjour', 'Kore', { languageCode: 'fr-FR' });
      expect(spy).toHaveBeenCalledWith('Kore', 'fr-FR');
    });

    it('applies emotional tone to length scale', async () => {
      const pcmData = Buffer.alloc(100, 0);
      const spy = vi.spyOn(provider, 'synthesizeRaw').mockResolvedValue(pcmData);

      await provider.synthesize('Hello', 'Kore', { emotionalTone: 'happy' });

      // Should have been called with a length_scale < 1.0 (faster)
      const callArgs = spy.mock.calls[0];
      expect(callArgs[2]).toBeLessThan(1.0);
    });

    it('uses default voice when none specified', async () => {
      const pcmData = Buffer.alloc(100, 0);
      vi.spyOn(provider, 'synthesizeRaw').mockResolvedValue(pcmData);
      const spy = vi.spyOn(provider, 'resolveModelPath');

      await provider.synthesize('Hello');
      expect(spy).toHaveBeenCalledWith('Kore', undefined);
    });
  });

  // ── Constants ───────────────────────────────────────────────────

  describe('constants', () => {
    it('PIPER_SAMPLE_RATE is 22050', () => {
      expect(PIPER_SAMPLE_RATE).toBe(22050);
    });
  });
});
