import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GeminiMessage } from '../services/conversation/conversation-compression';

// Mock the gemini config module
vi.mock('../config/gemini.js', () => ({
  isGeminiConfigured: vi.fn(() => true),
  getGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn(async () => ({
        text: 'Summary: The user and assistant discussed greetings and the weather.'
      }))
    }
  })),
  GEMINI_MODELS: { FLASH: 'gemini-3.1-flash-lite-preview', PRO: 'gemini-3.1-pro-preview', SPEECH: 'gemini-3.1-flash-preview-tts', LIVE: 'gemini-3.1-flash-live' }
}));

function makeMessages(count: number): GeminiMessage[] {
  const messages: GeminiMessage[] = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      role: i % 2 === 0 ? 'user' : 'model',
      parts: [{ text: `Message ${i + 1}` }]
    });
  }
  return messages;
}

describe('compressConversationHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns messages unchanged when below threshold', async () => {
    const { compressConversationHistory } = await import('../services/conversation/conversation-compression');
    const messages = makeMessages(10);
    const result = await compressConversationHistory(messages, { threshold: 20 });
    expect(result).toEqual(messages);
    expect(result.length).toBe(10);
  });

  it('returns messages unchanged when exactly at threshold', async () => {
    const { compressConversationHistory } = await import('../services/conversation/conversation-compression');
    const messages = makeMessages(20);
    const result = await compressConversationHistory(messages, { threshold: 20 });
    expect(result).toEqual(messages);
  });

  it('compresses messages when above threshold', async () => {
    const { compressConversationHistory } = await import('../services/conversation/conversation-compression');
    const messages = makeMessages(30);
    const result = await compressConversationHistory(messages, { threshold: 20, keepRecent: 10 });

    // Should have: 2 summary messages + 10 recent = 12
    expect(result.length).toBe(12);
    // First message should be the summary context
    expect(result[0].role).toBe('user');
    expect(result[0].parts[0].text).toContain('[Previous conversation summary:');
    // Second message is the acknowledgment
    expect(result[1].role).toBe('model');
    expect(result[1].parts[0].text).toContain('context from our previous conversation');
    // Last messages should be the recent ones (messages 21-30)
    expect(result[2].parts[0].text).toBe('Message 21');
    expect(result[11].parts[0].text).toBe('Message 30');
  });

  it('keeps recent messages intact after compression', async () => {
    const { compressConversationHistory } = await import('../services/conversation/conversation-compression');
    const messages = makeMessages(25);
    const result = await compressConversationHistory(messages, { threshold: 20, keepRecent: 10 });

    // Recent 10 messages should be preserved exactly
    const recent = result.slice(2); // skip summary pair
    for (let i = 0; i < 10; i++) {
      expect(recent[i].parts[0].text).toBe(`Message ${16 + i}`);
    }
  });

  it('falls back to recent-only when Gemini is not configured', async () => {
    const geminiConfig = await import('../config/gemini.js');
    vi.mocked(geminiConfig.isGeminiConfigured).mockReturnValue(false);

    const { compressConversationHistory } = await import('../services/conversation/conversation-compression');
    const messages = makeMessages(30);
    const result = await compressConversationHistory(messages, { threshold: 20, keepRecent: 10 });

    // Should just return recent messages without summary
    expect(result.length).toBe(10);
    expect(result[0].parts[0].text).toBe('Message 21');

    // Restore for subsequent tests
    vi.mocked(geminiConfig.isGeminiConfigured).mockReturnValue(true);
  });

  it('falls back to recent-only when summarization throws', async () => {
    const geminiConfig = await import('../config/gemini.js');
    vi.mocked(geminiConfig.getGenAI).mockReturnValue({
      models: {
        generateContent: vi.fn(async () => { throw new Error('API error'); })
      }
    } as any);

    const { compressConversationHistory } = await import('../services/conversation/conversation-compression');
    const messages = makeMessages(30);
    const result = await compressConversationHistory(messages, { threshold: 20, keepRecent: 10 });

    expect(result.length).toBe(10);
    expect(result[0].parts[0].text).toBe('Message 21');
  });

  it('uses default threshold of 20 and keepRecent of 10', async () => {
    const { compressConversationHistory } = await import('../services/conversation/conversation-compression');
    const messages = makeMessages(15);
    const result = await compressConversationHistory(messages);
    expect(result).toEqual(messages); // below default threshold of 20
  });
});

describe('compressTextHistory', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the mock to ensure Gemini is configured
    const geminiMock = vi.mocked(await import('../config/gemini.js'));
    geminiMock.isGeminiConfigured.mockReturnValue(true);
    geminiMock.getGenAI.mockReturnValue({
      models: {
        generateContent: vi.fn(async () => ({
          text: 'Summary: Language practice conversation about greetings.'
        }))
      }
    } as any);
  });

  it('returns formatted text when below threshold', async () => {
    const { compressTextHistory } = await import('../services/conversation/conversation-compression');
    const messages = [
      { role: 'user', content: 'Hello', inLanguage: null },
      { role: 'assistant', content: 'Hi there', inLanguage: 'Saluton' }
    ];

    const result = await compressTextHistory(messages, 'Esperanto', { threshold: 20 });
    expect(result).toContain('User: Hello');
    expect(result).toContain('Assistant: Hi there');
    expect(result).toContain('(Esperanto): Saluton');
  });

  it('compresses when above threshold', async () => {
    const { compressTextHistory } = await import('../services/conversation/conversation-compression');
    const messages = Array.from({ length: 25 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i + 1}`,
      inLanguage: null
    }));

    const result = await compressTextHistory(messages, 'Esperanto', { threshold: 20, keepRecent: 10 });
    expect(result).toContain('[Earlier conversation summary:');
    // Should contain recent messages
    expect(result).toContain('Message 16');
    expect(result).toContain('Message 25');
  });
});
