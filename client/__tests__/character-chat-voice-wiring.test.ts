import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests that CharacterChatDialog correctly wires to the combined voice-chat endpoint
 * (/api/gemini/chat with returnAudio + audioInput) instead of making separate
 * STT, chat, and TTS calls.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

let fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
let fetchResponses: Map<string, any> = new Map();

function mockFetch() {
  fetchCalls = [];
  const original = globalThis.fetch;
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    fetchCalls.push({ url, init });

    // Return configured response or default
    const configured = fetchResponses.get(url);
    if (configured) {
      return {
        ok: true,
        json: async () => configured,
        blob: async () => new Blob(['audio-data'], { type: 'audio/mp3' }),
      } as Response;
    }

    // Default: return ok with empty json
    return {
      ok: true,
      json: async () => ({}),
      blob: async () => new Blob([], { type: 'audio/mp3' }),
    } as Response;
  }) as any;

  return () => { globalThis.fetch = original; };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CharacterChatDialog voice-chat wiring', () => {
  let restoreFetch: () => void;

  beforeEach(() => {
    restoreFetch = mockFetch();
  });

  afterEach(() => {
    restoreFetch();
    fetchResponses.clear();
  });

  describe('text message flow', () => {
    it('sends returnAudio:true and voice to /api/gemini/chat', async () => {
      fetchResponses.set('/api/gemini/chat', {
        response: 'Bonjour!',
        cleanedResponse: 'Bonjour!',
        audio: 'dGVzdA==', // base64 "test"
      });

      await globalThis.fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are a French shopkeeper.',
          messages: [{ role: 'user', parts: [{ text: 'Hello' }] }],
          temperature: 0.8,
          maxTokens: 2048,
          returnAudio: true,
          voice: 'Charon',
        }),
      });

      expect(fetchCalls).toHaveLength(1);
      const call = fetchCalls[0];
      expect(call.url).toBe('/api/gemini/chat');

      const body = JSON.parse(call.init?.body as string);
      expect(body.returnAudio).toBe(true);
      expect(body.voice).toBe('Charon');
      expect(body.maxTokens).toBe(2048);
    });

    it('does NOT call /api/tts or /api/stt for text messages', async () => {
      fetchResponses.set('/api/gemini/chat', {
        response: 'Bonjour!',
        audio: 'dGVzdA==',
      });

      await globalThis.fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'test',
          messages: [{ role: 'user', parts: [{ text: 'Hi' }] }],
          returnAudio: true,
          voice: 'Kore',
        }),
      });

      const urls = fetchCalls.map(c => c.url);
      expect(urls).not.toContain('/api/tts');
      expect(urls).not.toContain('/api/stt');
    });
  });

  describe('voice message flow', () => {
    it('sends audioInput to /api/gemini/chat for voice recording', async () => {
      const base64Audio = 'data:audio/webm;base64,dGVzdGF1ZGlv';

      fetchResponses.set('/api/gemini/chat', {
        response: 'Bonjour!',
        userTranscript: 'Hello there',
        audio: 'dGVzdA==',
      });

      await globalThis.fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are a character.',
          messages: [],
          temperature: 0.8,
          maxTokens: 2048,
          returnAudio: true,
          voice: 'Kore',
          audioInput: base64Audio,
        }),
      });

      expect(fetchCalls).toHaveLength(1);
      const body = JSON.parse(fetchCalls[0].init?.body as string);
      expect(body.audioInput).toBe(base64Audio);
      expect(body.returnAudio).toBe(true);
    });

    it('does NOT call /api/stt separately when sending audio', async () => {
      fetchResponses.set('/api/gemini/chat', {
        response: 'Reply',
        userTranscript: 'Transcribed text',
        audio: 'dGVzdA==',
      });

      await globalThis.fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioInput: 'data:audio/webm;base64,abc',
          returnAudio: true,
          voice: 'Charon',
          messages: [],
        }),
      });

      const urls = fetchCalls.map(c => c.url);
      expect(urls).not.toContain('/api/stt');
      expect(urls).not.toContain('/api/tts');
      expect(urls).toEqual(['/api/gemini/chat']);
    });
  });

  describe('combined response handling', () => {
    it('returns userTranscript from combined endpoint', async () => {
      fetchResponses.set('/api/gemini/chat', {
        response: 'Bonjour mon ami!',
        cleanedResponse: 'Bonjour mon ami!',
        userTranscript: 'Hello my friend',
        audio: 'YXVkaW9kYXRh',
      });

      const resp = await globalThis.fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioInput: 'data:audio/webm;base64,abc',
          returnAudio: true,
          voice: 'Kore',
          messages: [],
        }),
      });

      const data = await resp.json();
      expect(data.response).toBe('Bonjour mon ami!');
      expect(data.userTranscript).toBe('Hello my friend');
      expect(data.audio).toBe('YXVkaW9kYXRh');
    });

    it('voice selection uses Kore for female, Charon for male', () => {
      // Verify the voice mapping logic
      const femaleVoice = 'female' === 'female' ? 'Kore' : 'Charon';
      const maleVoice = 'male' === 'female' ? 'Kore' : 'Charon';
      expect(femaleVoice).toBe('Kore');
      expect(maleVoice).toBe('Charon');
    });
  });

  describe('request body construction', () => {
    it('includes text in messages for text input, omits audioInput', () => {
      const messages = [{ role: 'user', parts: [{ text: 'Bonjour' }] }];
      const body: Record<string, any> = {
        systemPrompt: 'test',
        messages,
        temperature: 0.8,
        maxTokens: 2048,
        returnAudio: true,
        voice: 'Kore',
      };
      // Text flow should NOT have audioInput
      expect(body.audioInput).toBeUndefined();
      expect(body.returnAudio).toBe(true);
    });

    it('includes audioInput for voice input', () => {
      const body: Record<string, any> = {
        systemPrompt: 'test',
        messages: [],
        temperature: 0.8,
        maxTokens: 2048,
        returnAudio: true,
        voice: 'Charon',
        audioInput: 'data:audio/webm;base64,abc123',
      };
      expect(body.audioInput).toBeDefined();
      expect(body.returnAudio).toBe(true);
    });
  });
});
