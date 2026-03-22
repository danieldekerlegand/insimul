import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for the Gemini AI Provider.
 *
 * All Gemini SDK calls are mocked — these tests verify the provider wiring,
 * interface compliance, factory registration, batch chunking, streaming,
 * and graceful degradation.
 */

// ---- Mocks (paths relative to THIS file → resolve to same module the source uses) ----

const mockGenerateContent = vi.fn();
const mockSendMessageStream = vi.fn();
const mockStartChat = vi.fn(() => ({ sendMessageStream: mockSendMessageStream }));
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
  startChat: mockStartChat,
}));

const mockGenAIGenerateContent = vi.fn();
const mockFilesUpload = vi.fn();

// server/__tests__/../../config = server/config — which is server/../config — WRONG
// From server/__tests__, ../config/gemini.js → server/config/gemini.js ✓
vi.mock('../config/gemini.js', () => ({
  getGenerativeAI: vi.fn(() => ({ getGenerativeModel: mockGetGenerativeModel })),
  getGenAI: vi.fn(() => ({
    models: { generateContent: mockGenAIGenerateContent },
    files: { upload: mockFilesUpload },
  })),
  isGeminiConfigured: vi.fn(() => true),
  getGeminiApiKey: vi.fn(() => 'test-key'),
  GEMINI_MODELS: { PRO: 'gemini-3.1-pro-preview', FLASH: 'gemini-2.5-flash', SPEECH: 'gemini-2.0-flash-exp' },
}));

vi.mock('../services/tts-cache.js', () => {
  const cache = new Map<string, Buffer>();
  return {
    ttsCache: {
      get: vi.fn((key: string) => cache.get(key) ?? null),
      set: vi.fn((key: string, val: Buffer) => cache.set(key, val)),
    },
    TTSCache: { makeKey: vi.fn((...args: string[]) => args.join(':')) },
  };
});

vi.mock('@shared/emotional-tone.js', () => ({
  wrapWithEmotionalProsody: vi.fn((text: string, _tone?: string) => ({
    ssml: `<speak>${text}</speak>`,
    isSSML: !!_tone,
  })),
}));

vi.mock('@google-cloud/text-to-speech', () => {
  class MockTextToSpeechClient {
    async synthesizeSpeech() {
      return [{ audioContent: new Uint8Array([1, 2, 3]) }];
    }
  }
  return { TextToSpeechClient: MockTextToSpeechClient };
});

// ---- Import after mocks ----

import { resetAIProvider, getAIProvider } from '../services/ai/ai-provider-factory';
import { GeminiAIProvider } from '../services/ai/providers/gemini/gemini-ai-provider';
import { GeminiTTSProvider } from '../services/ai/providers/gemini/gemini-tts-provider';
import { GeminiSTTProvider } from '../services/ai/providers/gemini/gemini-stt-provider';

describe('GeminiAIProvider', () => {
  let provider: GeminiAIProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    resetAIProvider();
    provider = new GeminiAIProvider();
  });

  afterEach(() => {
    resetAIProvider(true);
  });

  it('registers itself with the factory as "gemini"', () => {
    const resolved = getAIProvider('gemini');
    expect(resolved.name).toBe('gemini');
  });

  it('implements all IAIProvider properties', () => {
    expect(provider.name).toBe('gemini');
    expect(typeof provider.generate).toBe('function');
    expect(typeof provider.generateBatch).toBe('function');
    expect(typeof provider.generateStream).toBe('function');
    expect(typeof provider.estimateCost).toBe('function');
    expect(typeof provider.generateImage).toBe('function');
    expect(provider.tts).toBeInstanceOf(GeminiTTSProvider);
    expect(provider.stt).toBeInstanceOf(GeminiSTTProvider);
  });

  describe('generate()', () => {
    it('calls Gemini SDK and returns LLMResponse', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'Hello world' },
      });

      const res = await provider.generate({ prompt: 'Say hello' });

      expect(res.text).toBe('Hello world');
      expect(res.provider).toBe('gemini');
      expect(res.model).toBe('gemini-2.5-flash');
      expect(res.tokensUsed).toBeGreaterThan(0);
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });

    it('prepends systemPrompt to prompt', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'ok' },
      });

      await provider.generate({ prompt: 'Do this', systemPrompt: 'You are helpful' });

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents[0].parts[0].text).toContain('You are helpful');
      expect(call.contents[0].parts[0].text).toContain('Do this');
    });

    it('uses custom temperature and maxTokens', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'ok' },
      });

      await provider.generate({ prompt: 'x', temperature: 0.1, maxTokens: 100 });

      const config = mockGenerateContent.mock.calls[0][0].generationConfig;
      expect(config.temperature).toBe(0.1);
      expect(config.maxOutputTokens).toBe(100);
    });
  });

  describe('generateBatch()', () => {
    it('processes prompts in chunks of 5', async () => {
      const prompts = Array.from({ length: 7 }, (_, i) => `prompt-${i}`);
      mockGenerateContent.mockImplementation(() =>
        Promise.resolve({ response: { text: () => 'result' } }),
      );

      const res = await provider.generateBatch({ prompts });

      expect(res.responses).toHaveLength(7);
      expect(res.failedIndices).toHaveLength(0);
      expect(res.totalTokensUsed).toBeGreaterThan(0);
    });

    it('records failed indices without crashing', async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ response: { text: () => 'ok' } });

      const res = await provider.generateBatch({ prompts: ['bad', 'good'] });

      expect(res.responses).toHaveLength(1);
      expect(res.failedIndices).toContain(0);
    });
  });

  describe('generateStream()', () => {
    it('yields text chunks from the stream', async () => {
      const chunks = ['Hello', ' ', 'world'];
      mockSendMessageStream.mockResolvedValueOnce({
        stream: (async function* () {
          for (const c of chunks) yield { text: () => c };
        })(),
      });

      const context = { systemPrompt: 'Be nice', characterName: 'NPC' };
      const collected: string[] = [];

      for await (const token of provider.generateStream('Hi', context)) {
        collected.push(token);
      }

      expect(collected).toEqual(chunks);
    });

    it('passes conversation history to chat', async () => {
      mockSendMessageStream.mockResolvedValueOnce({
        stream: (async function* () {
          yield { text: () => 'done' };
        })(),
      });

      const context = { systemPrompt: 'sys' };
      const options = {
        conversationHistory: [
          { role: 'user' as const, content: 'hello' },
          { role: 'assistant' as const, content: 'hi' },
        ],
      };

      for await (const _ of provider.generateStream('next', context, options)) {
        // consume
      }

      const historyArg = mockStartChat.mock.calls[0][0].history;
      expect(historyArg).toHaveLength(2);
      expect(historyArg[0].role).toBe('user');
      expect(historyArg[1].role).toBe('model');
    });
  });

  describe('estimateCost()', () => {
    it('returns a positive number for non-zero tokens', () => {
      expect(provider.estimateCost(1000, 500)).toBeGreaterThan(0);
    });

    it('returns 0 for zero tokens', () => {
      expect(provider.estimateCost(0, 0)).toBe(0);
    });
  });

  describe('generateImage()', () => {
    it('returns null (Imagen not yet available)', async () => {
      mockGenAIGenerateContent.mockResolvedValueOnce({ text: 'enhanced prompt' });
      const result = await provider.generateImage('a cat');
      expect(result).toBeNull();
    });
  });
});

describe('GeminiTTSProvider', () => {
  it('has the correct provider name', () => {
    expect(new GeminiTTSProvider().name).toBe('gemini-tts');
  });

  it('synthesize returns a Buffer', async () => {
    const tts = new GeminiTTSProvider();
    const result = await tts.synthesize('hello');
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});

describe('GeminiSTTProvider', () => {
  it('has the correct provider name', () => {
    expect(new GeminiSTTProvider().name).toBe('gemini-stt');
  });

  it('transcribe returns STTResult with text', async () => {
    mockGenAIGenerateContent.mockResolvedValueOnce({ text: 'hello world' });
    const stt = new GeminiSTTProvider();
    const result = await stt.transcribe(Buffer.from('fake-audio'), { languageCode: 'en-US' });
    expect(result.text).toBe('hello world');
    expect(result.languageCode).toBe('en-US');
  });

  it('transcribe works without language hint', async () => {
    mockGenAIGenerateContent.mockResolvedValueOnce({ text: 'bonjour' });
    const stt = new GeminiSTTProvider();
    const result = await stt.transcribe(Buffer.from('fake-audio'));
    expect(result.text).toBe('bonjour');
    expect(result.languageCode).toBeUndefined();
  });
});

describe('Shared utilities', () => {
  it('resolveLanguageCode maps known languages', async () => {
    const { resolveLanguageCode } = await import('../services/ai/providers/gemini/gemini-tts-provider');
    expect(resolveLanguageCode('french')).toBe('fr-FR');
    expect(resolveLanguageCode('en')).toBe('en-US');
    expect(resolveLanguageCode('chitimacha')).toBe('en-US');
    expect(resolveLanguageCode('pt-BR')).toBe('pt-BR');
    expect(resolveLanguageCode('unknown-language')).toBe('en-US');
  });

  it('detectLanguageFromText detects languages', async () => {
    const { detectLanguageFromText } = await import('../services/ai/providers/gemini/gemini-tts-provider');
    expect(detectLanguageFromText('Bonjour, vous êtes ici')).toBe('fr-FR');
    expect(detectLanguageFromText('Hello world')).toBe('en-US');
    expect(detectLanguageFromText('Hola señor')).toBe('es-ES');
    expect(detectLanguageFromText('Das ist gut')).toBe('de-DE');
  });
});
