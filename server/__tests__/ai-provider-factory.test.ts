import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerAIProvider,
  getAIProvider,
  getAIProviderType,
  listAIProviders,
  resetAIProvider,
  logAIProviderStatus,
} from '../services/ai/ai-provider-factory.js';
import type { IAIProvider } from '../services/ai/ai-provider.js';

/** Minimal mock provider that satisfies IAIProvider. */
function createMockProvider(name: string = 'mock'): IAIProvider {
  return {
    name,
    generate: vi.fn().mockResolvedValue({ text: 'hello', tokensUsed: 5, model: 'mock', provider: name }),
    generateBatch: vi.fn().mockResolvedValue({ responses: [], totalTokensUsed: 0, failedIndices: [] }),
    generateStream: vi.fn().mockReturnValue((async function* () { yield 'hi'; })()),
    estimateCost: vi.fn().mockReturnValue(0),
    tts: null,
    stt: null,
    generateImage: vi.fn().mockResolvedValue(null),
  };
}

describe('AI Provider Factory', () => {
  beforeEach(() => {
    resetAIProvider(true);
    delete process.env.AI_PROVIDER;
  });

  describe('getAIProviderType', () => {
    it('defaults to gemini when AI_PROVIDER is unset', () => {
      expect(getAIProviderType()).toBe('gemini');
    });

    it('returns local when AI_PROVIDER=local', () => {
      process.env.AI_PROVIDER = 'local';
      expect(getAIProviderType()).toBe('local');
    });

    it('is case-insensitive', () => {
      process.env.AI_PROVIDER = 'LOCAL';
      expect(getAIProviderType()).toBe('local');
    });

    it('falls back to gemini for unknown values', () => {
      process.env.AI_PROVIDER = 'unknown';
      expect(getAIProviderType()).toBe('gemini');
    });
  });

  describe('registerAIProvider / getAIProvider', () => {
    it('registers and retrieves a provider', () => {
      const mock = createMockProvider('gemini');
      registerAIProvider('gemini', () => mock);

      const provider = getAIProvider('gemini');
      expect(provider).toBe(mock);
      expect(provider.name).toBe('gemini');
    });

    it('returns the cached singleton on subsequent calls', () => {
      let callCount = 0;
      registerAIProvider('gemini', () => {
        callCount++;
        return createMockProvider('gemini');
      });

      const first = getAIProvider('gemini');
      const second = getAIProvider('gemini');
      expect(first).toBe(second);
      expect(callCount).toBe(1);
    });

    it('throws for unregistered provider', () => {
      expect(() => getAIProvider('local')).toThrow(/not registered/);
    });

    it('uses AI_PROVIDER env var when no type argument given', () => {
      process.env.AI_PROVIDER = 'local';
      const mock = createMockProvider('local');
      registerAIProvider('local', () => mock);

      const provider = getAIProvider();
      expect(provider.name).toBe('local');
    });
  });

  describe('listAIProviders', () => {
    it('lists registered providers', () => {
      registerAIProvider('gemini', () => createMockProvider('gemini'));
      registerAIProvider('local', () => createMockProvider('local'));
      const list = listAIProviders();
      expect(list).toContain('gemini');
      expect(list).toContain('local');
    });
  });

  describe('resetAIProvider', () => {
    it('clears the cached singleton', () => {
      let callCount = 0;
      registerAIProvider('gemini', () => {
        callCount++;
        return createMockProvider('gemini');
      });

      getAIProvider('gemini');
      resetAIProvider();
      getAIProvider('gemini');
      expect(callCount).toBe(2);
    });
  });

  describe('logAIProviderStatus', () => {
    it('logs provider info without throwing', () => {
      registerAIProvider('gemini', () => createMockProvider('gemini'));
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logAIProviderStatus();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('AI Provider'));
      spy.mockRestore();
    });

    it('warns when provider is not registered', () => {
      process.env.AI_PROVIDER = 'local';
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logAIProviderStatus();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('not registered'));
      spy.mockRestore();
    });
  });

  describe('IAIProvider contract', () => {
    it('generate returns expected shape', async () => {
      const mock = createMockProvider('gemini');
      registerAIProvider('gemini', () => mock);
      const provider = getAIProvider('gemini');

      const result = await provider.generate({ prompt: 'test' });
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('tokensUsed');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('provider');
    });

    it('generateBatch returns expected shape', async () => {
      const mock = createMockProvider('gemini');
      registerAIProvider('gemini', () => mock);
      const provider = getAIProvider('gemini');

      const result = await provider.generateBatch({ prompts: ['a', 'b'] });
      expect(result).toHaveProperty('responses');
      expect(result).toHaveProperty('totalTokensUsed');
      expect(result).toHaveProperty('failedIndices');
    });

    it('generateStream yields tokens', async () => {
      const mock = createMockProvider('gemini');
      registerAIProvider('gemini', () => mock);
      const provider = getAIProvider('gemini');

      const tokens: string[] = [];
      for await (const token of provider.generateStream('hello', { systemPrompt: 'test' })) {
        tokens.push(token);
      }
      expect(tokens).toEqual(['hi']);
    });

    it('tts and stt are null by default on mock', () => {
      const mock = createMockProvider('gemini');
      expect(mock.tts).toBeNull();
      expect(mock.stt).toBeNull();
    });

    it('generateImage returns null for unsupported provider', async () => {
      const mock = createMockProvider('gemini');
      registerAIProvider('gemini', () => mock);
      const provider = getAIProvider('gemini');

      const result = await provider.generateImage('a cat');
      expect(result).toBeNull();
    });
  });
});
