/**
 * Tests for the LLM provider abstraction layer.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock gemini config
const mockGenerateContent = vi.fn();
const mockGenAI = {
  models: { generateContent: mockGenerateContent },
};

vi.mock('../config/gemini.js', () => ({
  getGenAI: () => mockGenAI,
  isGeminiConfigured: () => true,
  GEMINI_MODELS: { PRO: 'gemini-2.5-pro', FLASH: 'gemini-2.5-flash' },
}));

import {
  GeminiProvider,
  createLLMProvider,
  getDefaultLLMProvider,
  setDefaultLLMProvider,
  type ILLMProvider,
} from '../services/llm-provider.js';

describe('GeminiProvider', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('generates a response', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'Hello world' });

    const provider = new GeminiProvider();
    const result = await provider.generate({ prompt: 'Say hello' });

    expect(result.text).toBe('Hello world');
    expect(result.provider).toBe('gemini');
    expect(result.tokensUsed).toBeGreaterThan(0);
  });

  it('passes systemPrompt as systemInstruction', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'response' });

    const provider = new GeminiProvider();
    await provider.generate({ prompt: 'test', systemPrompt: 'Be helpful' });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.systemInstruction).toBe('Be helpful');
  });

  it('passes responseMimeType in config', async () => {
    mockGenerateContent.mockResolvedValue({ text: '{"key":"value"}' });

    const provider = new GeminiProvider();
    await provider.generate({ prompt: 'test', responseMimeType: 'application/json' });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.responseMimeType).toBe('application/json');
  });

  it('passes inlineData for multimodal requests', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'analysis' });

    const provider = new GeminiProvider();
    await provider.generate({
      prompt: 'Analyze this audio',
      inlineData: [{ data: 'base64data', mimeType: 'audio/wav' }],
    });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.contents).toHaveLength(2);
    expect(call.contents[0]).toBe('Analyze this audio');
    expect(call.contents[1]).toEqual({
      inlineData: { data: 'base64data', mimeType: 'audio/wav' },
    });
  });

  it('passes temperature and maxTokens', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'resp' });

    const provider = new GeminiProvider();
    await provider.generate({ prompt: 'test', temperature: 0.2, maxTokens: 500 });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.temperature).toBe(0.2);
    expect(call.config.maxOutputTokens).toBe(500);
  });

  it('handles empty text response', async () => {
    mockGenerateContent.mockResolvedValue({ text: undefined });

    const provider = new GeminiProvider();
    const result = await provider.generate({ prompt: 'test' });

    expect(result.text).toBe('');
  });

  it('isConfigured returns true when Gemini is set up', () => {
    const provider = new GeminiProvider();
    expect(provider.isConfigured()).toBe(true);
  });

  it('uses custom model from config', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'resp' });

    const provider = new GeminiProvider({ model: 'gemini-2.5-pro' });
    await provider.generate({ prompt: 'test' });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.model).toBe('gemini-2.5-pro');
  });
});

describe('GeminiProvider.generateBatch', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('processes multiple prompts', async () => {
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'Response 1' })
      .mockResolvedValueOnce({ text: 'Response 2' });

    const provider = new GeminiProvider();
    const result = await provider.generateBatch({
      prompts: ['Prompt 1', 'Prompt 2'],
    });

    expect(result.responses).toHaveLength(2);
    expect(result.responses[0].text).toBe('Response 1');
    expect(result.responses[1].text).toBe('Response 2');
    expect(result.failedIndices).toEqual([]);
  });

  it('tracks failed indices', async () => {
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'OK' })
      .mockRejectedValueOnce(new Error('fail'));

    const provider = new GeminiProvider();
    const result = await provider.generateBatch({
      prompts: ['Good', 'Bad'],
    });

    expect(result.responses).toHaveLength(1);
    expect(result.failedIndices).toContain(1);
  });
});

describe('createLLMProvider', () => {
  it('creates a GeminiProvider by default', () => {
    const provider = createLLMProvider();
    expect(provider.name).toBe('gemini');
  });

  it('throws for unimplemented providers', () => {
    expect(() => createLLMProvider({ provider: 'openai' })).toThrow('not yet implemented');
    expect(() => createLLMProvider({ provider: 'anthropic' })).toThrow('not yet implemented');
  });
});

describe('getDefaultLLMProvider / setDefaultLLMProvider', () => {
  afterEach(() => {
    // Reset to default
    setDefaultLLMProvider(new GeminiProvider());
  });

  it('returns a provider', () => {
    const provider = getDefaultLLMProvider();
    expect(provider.name).toBe('gemini');
  });

  it('can be overridden', () => {
    const custom: ILLMProvider = {
      name: 'custom',
      isConfigured: () => true,
      generate: vi.fn(),
      generateBatch: vi.fn(),
      estimateCost: () => 0,
    };

    setDefaultLLMProvider(custom);
    expect(getDefaultLLMProvider().name).toBe('custom');
  });
});
