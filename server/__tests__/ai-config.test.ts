import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock gemini module before importing ai-config
vi.mock('../config/gemini.js', () => ({
  isGeminiConfigured: vi.fn(() => false),
  GEMINI_MODELS: {
    PRO: 'gemini-3.1-pro-preview',
    FLASH: 'gemini-2.5-flash',
    SPEECH: 'gemini-2.0-flash-exp',
  },
}));

import { getAIConfig, logAIStatus, type AIConfig } from '../config/ai-config.js';
import { isGeminiConfigured } from '../config/gemini.js';

const mockedIsGeminiConfigured = vi.mocked(isGeminiConfigured);

describe('getAIConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Clear all AI-related env vars
    delete process.env.AI_PROVIDER;
    delete process.env.LOCAL_MODEL_PATH;
    delete process.env.LOCAL_MODEL_NAME;
    delete process.env.LOCAL_GPU_LAYERS;
    delete process.env.LOCAL_CONTEXT_SIZE;
    delete process.env.PIPER_VOICES_DIR;
    delete process.env.WHISPER_MODEL_PATH;
    delete process.env.WHISPER_MODEL_SIZE;
    mockedIsGeminiConfigured.mockReturnValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('defaults to gemini provider when AI_PROVIDER is not set', () => {
    const config = getAIConfig();
    expect(config.provider).toBe('gemini');
  });

  it('accepts "local" as AI_PROVIDER', () => {
    process.env.AI_PROVIDER = 'local';
    const config = getAIConfig();
    expect(config.provider).toBe('local');
  });

  it('falls back to gemini for invalid AI_PROVIDER values', () => {
    process.env.AI_PROVIDER = 'invalid-provider';
    const config = getAIConfig();
    expect(config.provider).toBe('gemini');
  });

  it('reads LOCAL_MODEL_PATH from env', () => {
    process.env.LOCAL_MODEL_PATH = '/models/test.gguf';
    const config = getAIConfig();
    expect(config.local.modelPath).toBe('/models/test.gguf');
  });

  it('defaults LOCAL_MODEL_NAME to phi-4-mini-q4', () => {
    const config = getAIConfig();
    expect(config.local.modelName).toBe('phi-4-mini-q4');
  });

  it('reads custom LOCAL_MODEL_NAME', () => {
    process.env.LOCAL_MODEL_NAME = 'llama-3-8b-q4';
    const config = getAIConfig();
    expect(config.local.modelName).toBe('llama-3-8b-q4');
  });

  it('defaults LOCAL_GPU_LAYERS to auto', () => {
    const config = getAIConfig();
    expect(config.local.gpuLayers).toBe('auto');
  });

  it('parses numeric LOCAL_GPU_LAYERS', () => {
    process.env.LOCAL_GPU_LAYERS = '32';
    const config = getAIConfig();
    expect(config.local.gpuLayers).toBe(32);
  });

  it('treats LOCAL_GPU_LAYERS=0 as valid', () => {
    process.env.LOCAL_GPU_LAYERS = '0';
    const config = getAIConfig();
    expect(config.local.gpuLayers).toBe(0);
  });

  it('falls back to auto for invalid LOCAL_GPU_LAYERS', () => {
    process.env.LOCAL_GPU_LAYERS = 'not-a-number';
    const config = getAIConfig();
    expect(config.local.gpuLayers).toBe('auto');
  });

  it('defaults LOCAL_CONTEXT_SIZE to 4096', () => {
    const config = getAIConfig();
    expect(config.local.contextSize).toBe(4096);
  });

  it('parses custom LOCAL_CONTEXT_SIZE', () => {
    process.env.LOCAL_CONTEXT_SIZE = '8192';
    const config = getAIConfig();
    expect(config.local.contextSize).toBe(8192);
  });

  it('keeps default for invalid LOCAL_CONTEXT_SIZE', () => {
    process.env.LOCAL_CONTEXT_SIZE = 'abc';
    const config = getAIConfig();
    expect(config.local.contextSize).toBe(4096);
  });

  it('reads PIPER_VOICES_DIR', () => {
    process.env.PIPER_VOICES_DIR = '/voices';
    const config = getAIConfig();
    expect(config.local.piperVoicesDir).toBe('/voices');
  });

  it('reads WHISPER_MODEL_PATH', () => {
    process.env.WHISPER_MODEL_PATH = '/models/whisper.bin';
    const config = getAIConfig();
    expect(config.local.whisperModelPath).toBe('/models/whisper.bin');
  });

  it('defaults WHISPER_MODEL_SIZE to base', () => {
    const config = getAIConfig();
    expect(config.local.whisperModelSize).toBe('base');
  });

  it('accepts valid WHISPER_MODEL_SIZE values', () => {
    for (const size of ['tiny', 'base', 'small', 'medium', 'large'] as const) {
      process.env.WHISPER_MODEL_SIZE = size;
      const config = getAIConfig();
      expect(config.local.whisperModelSize).toBe(size);
    }
  });

  it('falls back to base for invalid WHISPER_MODEL_SIZE', () => {
    process.env.WHISPER_MODEL_SIZE = 'huge';
    const config = getAIConfig();
    expect(config.local.whisperModelSize).toBe('base');
  });

  it('reflects Gemini configured status', () => {
    mockedIsGeminiConfigured.mockReturnValue(true);
    const config = getAIConfig();
    expect(config.gemini.configured).toBe(true);
  });
});

describe('logAIStatus', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AI_PROVIDER;
    delete process.env.LOCAL_MODEL_PATH;
    delete process.env.LOCAL_MODEL_NAME;
    delete process.env.LOCAL_GPU_LAYERS;
    delete process.env.LOCAL_CONTEXT_SIZE;
    delete process.env.PIPER_VOICES_DIR;
    delete process.env.WHISPER_MODEL_PATH;
    delete process.env.WHISPER_MODEL_SIZE;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockedIsGeminiConfigured.mockReturnValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('logs gemini as active provider by default', () => {
    mockedIsGeminiConfigured.mockReturnValue(true);
    logAIStatus();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Active provider: gemini'));
  });

  it('warns when gemini is not configured', () => {
    logAIStatus();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Gemini API key not found'));
  });

  it('logs local provider details', () => {
    process.env.AI_PROVIDER = 'local';
    process.env.LOCAL_MODEL_PATH = '/models/test.gguf';
    process.env.PIPER_VOICES_DIR = '/voices';
    process.env.WHISPER_MODEL_PATH = '/whisper.bin';

    logAIStatus();

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Active provider: local'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('/models/test.gguf'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('/voices'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('/whisper.bin'));
  });

  it('warns about missing local TTS/STT paths', () => {
    process.env.AI_PROVIDER = 'local';

    logAIStatus();

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('PIPER_VOICES_DIR not set'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('WHISPER_MODEL_PATH not set'));
  });

  it('notes Gemini fallback availability when using local provider', () => {
    process.env.AI_PROVIDER = 'local';
    mockedIsGeminiConfigured.mockReturnValue(true);

    logAIStatus();

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Gemini API key also available'));
  });
});
