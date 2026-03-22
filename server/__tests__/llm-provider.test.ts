/**
 * Tests for the LLM provider abstraction layer, registry, and service migrations.
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
  registerLLMProvider,
  getLLMProvider,
  listLLMProviders,
  clearLLMProviders,
  type ILLMProvider,
  type LLMRequest,
  type LLMResponse,
} from '../services/llm-provider.js';

// ── Mock Provider ─────────────────────────────────────────────────────

class MockLLMProvider implements ILLMProvider {
  readonly name = 'mock';
  private configured = true;
  public lastRequest: LLMRequest | null = null;
  public responseText = 'Mock response';

  constructor(opts?: { configured?: boolean; responseText?: string }) {
    if (opts?.configured !== undefined) this.configured = opts.configured;
    if (opts?.responseText) this.responseText = opts.responseText;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    this.lastRequest = request;
    return {
      text: this.responseText,
      tokensUsed: Math.ceil(this.responseText.length / 4),
      model: 'mock-model',
      provider: this.name,
    };
  }
}

// ── GeminiProvider Tests ──────────────────────────────────────────────

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

  it('throws on empty text response', async () => {
    mockGenerateContent.mockResolvedValue({ text: undefined });

    const provider = new GeminiProvider();
    await expect(provider.generate({ prompt: 'test' })).rejects.toThrow('empty response');
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

// ── Provider Registry Tests ───────────────────────────────────────────

describe('LLM Provider Registry', () => {
  beforeEach(() => {
    clearLLMProviders();
  });

  afterEach(() => {
    // Re-register gemini so other tests still work
    clearLLMProviders();
    registerLLMProvider('gemini', () => new GeminiProvider());
  });

  it('registers and retrieves a provider', () => {
    registerLLMProvider('mock', () => new MockLLMProvider());
    const provider = getLLMProvider('mock');
    expect(provider.name).toBe('mock');
  });

  it('throws when provider not found', () => {
    expect(() => getLLMProvider('nonexistent')).toThrow(
      "LLM provider 'nonexistent' is not registered",
    );
  });

  it('lists registered providers', () => {
    registerLLMProvider('mock', () => new MockLLMProvider());
    registerLLMProvider('another', () => new MockLLMProvider());
    const names = listLLMProviders();
    expect(names).toContain('mock');
    expect(names).toContain('another');
  });

  it('clears all providers', () => {
    registerLLMProvider('mock', () => new MockLLMProvider());
    clearLLMProviders();
    expect(listLLMProviders()).toHaveLength(0);
  });

  it('defaults to LLM_PROVIDER env var', () => {
    const orig = process.env.LLM_PROVIDER;
    process.env.LLM_PROVIDER = 'mock';
    registerLLMProvider('mock', () => new MockLLMProvider());
    const provider = getLLMProvider();
    expect(provider.name).toBe('mock');
    if (orig !== undefined) {
      process.env.LLM_PROVIDER = orig;
    } else {
      delete process.env.LLM_PROVIDER;
    }
  });

  it('shows available providers in error message', () => {
    registerLLMProvider('alpha', () => new MockLLMProvider());
    registerLLMProvider('beta', () => new MockLLMProvider());
    try {
      getLLMProvider('nope');
    } catch (e: any) {
      expect(e.message).toContain('alpha');
      expect(e.message).toContain('beta');
    }
  });
});

// ── createLLMProvider / singleton tests ───────────────────────────────

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
    };

    setDefaultLLMProvider(custom);
    expect(getDefaultLLMProvider().name).toBe('custom');
  });
});

// ── gemini-ai service migration tests ─────────────────────────────────

describe('gemini-ai service with provider interface', () => {
  it('generateRule uses injected provider', async () => {
    const mock = new MockLLMProvider({ responseText: 'rule test_rule { when (true) then { noop } }' });
    const { generateRule } = await import('../services/gemini-ai.js');

    const result = await generateRule('test prompt', 'insimul', mock);
    expect(result).toBe('rule test_rule { when (true) then { noop } }');
    expect(mock.lastRequest?.prompt).toContain('insimul');
    expect(mock.lastRequest?.prompt).toContain('test prompt');
    expect(mock.lastRequest?.systemPrompt).toContain('insimul');
  });

  it('generateBulkRules uses injected provider', async () => {
    const mock = new MockLLMProvider({ responseText: 'bulk rules output' });
    const { generateBulkRules } = await import('../services/gemini-ai.js');

    const result = await generateBulkRules('bulk prompt', 'ensemble', mock);
    expect(result).toBe('bulk rules output');
    expect(mock.lastRequest?.systemPrompt).toContain('MULTIPLE');
    expect(mock.lastRequest?.systemPrompt).toContain('ensemble');
  });

  it('generateQuests parses JSON response', async () => {
    const questJson = JSON.stringify([{
      title: 'Test Quest',
      description: 'A test quest.',
      questType: 'side',
      difficulty: 'beginner',
      objectives: [{ type: 'investigate', description: 'Find the thing' }],
      rewards: { experience: 100, gold: 50 },
    }]);
    const mock = new MockLLMProvider({ responseText: questJson });
    const { generateQuests } = await import('../services/gemini-ai.js');

    const quests = await generateQuests('fantasy world', 1, mock);
    expect(quests).toHaveLength(1);
    expect(quests[0].title).toBe('Test Quest');
    expect(quests[0].questType).toBe('side');
    expect(quests[0].objectives).toHaveLength(1);
    expect(quests[0].rewards?.experience).toBe(100);
  });

  it('generateQuests strips markdown fences', async () => {
    const questJson = '```json\n' + JSON.stringify([{
      title: 'Fenced Quest',
      description: 'test',
      questType: 'main',
      difficulty: 'advanced',
      objectives: [],
    }]) + '\n```';
    const mock = new MockLLMProvider({ responseText: questJson });
    const { generateQuests } = await import('../services/gemini-ai.js');

    const quests = await generateQuests('test world', 1, mock);
    expect(quests[0].title).toBe('Fenced Quest');
  });

  it('generateQuests sanitizes invalid questType', async () => {
    const questJson = JSON.stringify([{
      title: 'Bad Type',
      description: 'test',
      questType: 'invalid',
      difficulty: 'invalid',
      objectives: [],
    }]);
    const mock = new MockLLMProvider({ responseText: questJson });
    const { generateQuests } = await import('../services/gemini-ai.js');

    const quests = await generateQuests('test', 1, mock);
    expect(quests[0].questType).toBe('side');
    expect(quests[0].difficulty).toBe('intermediate');
  });

  it('editRuleWithAI uses injected provider', async () => {
    const mock = new MockLLMProvider({ responseText: 'edited rule content' });
    const { editRuleWithAI } = await import('../services/gemini-ai.js');

    const result = await editRuleWithAI('old rule', 'make it better', 'kismet', mock);
    expect(result).toBe('edited rule content');
    expect(mock.lastRequest?.prompt).toContain('old rule');
    expect(mock.lastRequest?.prompt).toContain('make it better');
  });

  it('generateRule includes correct format example for each format', async () => {
    const { generateRule } = await import('../services/gemini-ai.js');

    for (const format of ['insimul', 'ensemble', 'kismet', 'tott']) {
      const mock = new MockLLMProvider({ responseText: 'output' });
      await generateRule('test', format, mock);
      expect(mock.lastRequest?.systemPrompt).toContain(format);
    }
  });
});

// ── character-interaction service migration tests ─────────────────────

// Valid MongoDB ObjectId format (24 hex chars) — character won't exist but won't throw CastError
const FAKE_CHAR_ID = '000000000000000000000001';

describe('character-interaction service with provider interface', () => {
  it('getCharacterResponse uses injected provider', async () => {
    const mock = new MockLLMProvider({ responseText: 'Hello traveler!' });
    const { getCharacterResponse } = await import('../services/character-interaction.js');

    const result = await getCharacterResponse('hi', FAKE_CHAR_ID, mock);
    expect(result.response).toBe('Hello traveler!');
    expect(result.audio).toBeNull();
  });

  it('getCharacterResponse returns fallback when provider not configured', async () => {
    const mock = new MockLLMProvider({ configured: false });
    const { getCharacterResponse } = await import('../services/character-interaction.js');

    const result = await getCharacterResponse('hi', FAKE_CHAR_ID, mock);
    expect(result.response).toContain('not configured');
    expect(result.audio).toBeNull();
  });

  it('getActionResponse uses injected provider', async () => {
    const mock = new MockLLMProvider({ responseText: 'The warrior charges forward.' });
    const { getActionResponse } = await import('../services/character-interaction.js');

    const result = await getActionResponse(FAKE_CHAR_ID, 'attack', 'in battle', mock);
    expect(result).toBe('The warrior charges forward.');
  });

  it('getActionResponse returns fallback when provider not configured', async () => {
    const mock = new MockLLMProvider({ configured: false });
    const { getActionResponse } = await import('../services/character-interaction.js');

    const result = await getActionResponse(FAKE_CHAR_ID, 'attack', undefined, mock);
    expect(result).toBe('The character performs the action.');
  });

  it('listNarrativeSections returns static data', async () => {
    const { listNarrativeSections } = await import('../services/character-interaction.js');
    const sections = listNarrativeSections();
    expect(sections.length).toBe(6);
    expect(sections[0].section).toBe('Introduction');
  });

  it('listNarrativeTriggers returns static data', async () => {
    const { listNarrativeTriggers } = await import('../services/character-interaction.js');
    const triggers = listNarrativeTriggers();
    expect(triggers.length).toBe(7);
    expect(triggers[0].trigger).toBe('Scene Start');
  });
});
