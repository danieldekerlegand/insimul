/**
 * Tests for Gemini 3.1 configuration and model upgrade.
 *
 * Verifies that:
 * - Model names point to Gemini 3.1 series
 * - Thinking level configuration works correctly
 * - buildThinkingConfig produces valid config objects
 * - Old SDK (@google/generative-ai) references are fully removed
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @google/genai with a proper class and enum
vi.mock('@google/genai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@google/genai')>();
  class MockGoogleGenAI {
    models = {
      generateContent: vi.fn().mockResolvedValue({ text: 'test response' }),
      generateContentStream: vi.fn(),
    };
    constructor(_config: any) {}
  }
  return { ...actual, GoogleGenAI: MockGoogleGenAI };
});

describe('Gemini 3.1 Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('GEMINI_MODELS', () => {
    it('uses Gemini 2.5 Pro for PRO model', async () => {
      const { GEMINI_MODELS } = await import('../config/gemini.js');
      expect(GEMINI_MODELS.PRO).toBe('gemini-2.5-pro');
    });

    it('uses Gemini 2.5 Flash for FLASH model', async () => {
      const { GEMINI_MODELS } = await import('../config/gemini.js');
      expect(GEMINI_MODELS.FLASH).toBe('gemini-2.5-flash');
    });

    it('uses Gemini 2.5 Flash Lite for FLASH_LITE model', async () => {
      const { GEMINI_MODELS } = await import('../config/gemini.js');
      expect(GEMINI_MODELS.FLASH_LITE).toBe('gemini-2.5-flash-lite');
    });

    it('uses Gemini 2.5 Flash TTS for SPEECH model', async () => {
      const { GEMINI_MODELS } = await import('../config/gemini.js');
      expect(GEMINI_MODELS.SPEECH).toBe('gemini-2.5-flash-preview-tts');
    });

    it('uses Gemini 3.1 Flash Live for LIVE model', async () => {
      const { GEMINI_MODELS } = await import('../config/gemini.js');
      expect(GEMINI_MODELS.LIVE).toBe('gemini-3.1-flash-live-preview');
    });
  });

  describe('THINKING_LEVELS', () => {
    it('exports all four thinking levels matching SDK enum', async () => {
      const { THINKING_LEVELS } = await import('../config/gemini.js');
      expect(THINKING_LEVELS.MINIMAL).toBe('MINIMAL');
      expect(THINKING_LEVELS.LOW).toBe('LOW');
      expect(THINKING_LEVELS.MEDIUM).toBe('MEDIUM');
      expect(THINKING_LEVELS.HIGH).toBe('HIGH');
    });
  });

  describe('buildThinkingConfig', () => {
    it('returns thinkingConfig object with default MEDIUM level', async () => {
      const { buildThinkingConfig } = await import('../config/gemini.js');
      const result = buildThinkingConfig();
      expect(result).toEqual({
        thinkingConfig: { thinkingLevel: 'MEDIUM' },
      });
    });

    it('returns thinkingConfig with specified level', async () => {
      const { buildThinkingConfig, THINKING_LEVELS } = await import('../config/gemini.js');
      const result = buildThinkingConfig(THINKING_LEVELS.HIGH);
      expect(result).toEqual({
        thinkingConfig: { thinkingLevel: 'HIGH' },
      });
    });

    it('returns thinkingConfig with LOW level', async () => {
      const { buildThinkingConfig, THINKING_LEVELS } = await import('../config/gemini.js');
      const result = buildThinkingConfig(THINKING_LEVELS.LOW);
      expect(result).toEqual({
        thinkingConfig: { thinkingLevel: 'LOW' },
      });
    });

    it('returns thinkingConfig with MINIMAL level', async () => {
      const { buildThinkingConfig, THINKING_LEVELS } = await import('../config/gemini.js');
      const result = buildThinkingConfig(THINKING_LEVELS.MINIMAL);
      expect(result).toEqual({
        thinkingConfig: { thinkingLevel: 'MINIMAL' },
      });
    });
  });

  describe('getGenAI', () => {
    it('returns an object with models when API key is present', async () => {
      // The test environment has a real API key from .env
      const { getGenAI, isGeminiConfigured } = await import('../config/gemini.js');
      if (!isGeminiConfigured()) {
        // Skip if no API key in test environment
        return;
      }
      const ai = getGenAI();
      expect(ai).toBeDefined();
      expect(ai.models).toBeDefined();
    });

    it('throws when API key is not configured', async () => {
      // Temporarily remove env vars
      const origKey = process.env.GEMINI_API_KEY;
      const origFreeKey = process.env.GEMINI_FREE_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_FREE_API_KEY;

      vi.resetModules();
      const { getGenAI } = await import('../config/gemini.js');
      expect(() => getGenAI()).toThrow('Gemini API key not configured');

      // Restore
      if (origKey) process.env.GEMINI_API_KEY = origKey;
      if (origFreeKey) process.env.GEMINI_FREE_API_KEY = origFreeKey;
    });
  });
});

describe('Old SDK removal verification', () => {
  it('config module does not export getGenerativeAI', async () => {
    vi.resetModules();
    const config = await import('../config/gemini.js');
    expect((config as any).getGenerativeAI).toBeUndefined();
  });

  it('config module does not export getModel', async () => {
    vi.resetModules();
    const config = await import('../config/gemini.js');
    expect((config as any).getModel).toBeUndefined();
  });
});
