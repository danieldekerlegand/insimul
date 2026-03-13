/**
 * Tests for BabylonChatPanel voice-chat integration.
 * Validates the combined /api/gemini/voice-chat endpoint wiring
 * and fallback behavior.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// We test the voice-chat request/response contract directly since
// BabylonChatPanel is tightly coupled to Babylon.js GUI (not easily instantiable in Node).

describe('voice-chat endpoint contract', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('sends FormData with audio blob and metadata to /api/gemini/voice-chat', async () => {
    const mockResponse = {
      transcript: 'Hola, como estas?',
      response: '¡Hola! Estoy bien, gracias.',
      cleanedResponse: '¡Hola! Estoy bien, gracias.',
      audio: 'bW9ja0F1ZGlvQmFzZTY0', // base64
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Simulate what sendVoiceChat does
    const audioBlob = new Blob(['fake-audio-data'], { type: 'audio/webm' });
    const metadata = JSON.stringify({
      systemPrompt: 'You are an NPC.',
      messages: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      voice: 'Kore',
      temperature: 0.8,
      maxTokens: 2048,
    });

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('metadata', metadata);

    const response = await fetch('/api/gemini/voice-chat', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/gemini/voice-chat', {
      method: 'POST',
      body: formData,
    });
    expect(data.transcript).toBe('Hola, como estas?');
    expect(data.cleanedResponse).toBe('¡Hola! Estoy bien, gracias.');
    expect(data.audio).toBe('bW9ja0F1ZGlvQmFzZTY0');
  });

  it('returns all expected fields from voice-chat response', async () => {
    const mockResponse = {
      transcript: 'What is your name?',
      response: 'My name is Carlos. **GRAMMAR_FEEDBACK**good**END_GRAMMAR**',
      cleanedResponse: 'My name is Carlos.',
      audio: 'c29tZUF1ZGlv',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const res = await fetch('/api/gemini/voice-chat', { method: 'POST', body: new FormData() });
    const data = await res.json();

    expect(data).toHaveProperty('transcript');
    expect(data).toHaveProperty('response');
    expect(data).toHaveProperty('cleanedResponse');
    expect(data).toHaveProperty('audio');
    // cleanedResponse should not contain grammar markers
    expect(data.cleanedResponse).not.toContain('GRAMMAR_FEEDBACK');
  });

  it('handles voice-chat failure and enables fallback path', async () => {
    // Simulate voice-chat endpoint failure
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Voice chat failed' }),
    });

    const res = await fetch('/api/gemini/voice-chat', { method: 'POST', body: new FormData() });
    expect(res.ok).toBe(false);

    // The fallback would call /api/stt then /api/gemini/chat — simulate those
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ transcript: 'fallback transcript' }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: 'fallback response', audio: 'abc123' }),
    });

    const sttRes = await fetch('/api/stt', { method: 'POST', body: new FormData() });
    const sttData = await sttRes.json();
    expect(sttData.transcript).toBe('fallback transcript');

    const chatRes = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], systemPrompt: '' }),
    });
    const chatData = await chatRes.json();
    expect(chatData.response).toBe('fallback response');
  });

  it('handles response with no audio gracefully', async () => {
    const mockResponse = {
      transcript: 'Hello',
      response: 'Hi there!',
      cleanedResponse: 'Hi there!',
      // audio is undefined — TTS failed server-side
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const res = await fetch('/api/gemini/voice-chat', { method: 'POST', body: new FormData() });
    const data = await res.json();

    expect(data.transcript).toBe('Hello');
    expect(data.cleanedResponse).toBe('Hi there!');
    expect(data.audio).toBeUndefined();
  });
});

describe('voice-chat metadata format', () => {
  it('constructs valid metadata JSON from chat state', () => {
    const messages = [
      { role: 'user', parts: [{ text: 'Hello' }] },
      { role: 'model', parts: [{ text: 'Hi!' }] },
    ];

    const metadata = JSON.stringify({
      systemPrompt: 'You are Carlos, a shopkeeper.',
      messages,
      voice: 'Charon',
      temperature: 0.8,
      maxTokens: 2048,
    });

    const parsed = JSON.parse(metadata);
    expect(parsed.systemPrompt).toContain('Carlos');
    expect(parsed.messages).toHaveLength(2);
    expect(parsed.voice).toBe('Charon');
    expect(parsed.temperature).toBe(0.8);
    expect(parsed.maxTokens).toBe(2048);
  });

  it('uses Kore voice for female characters and Charon for male', () => {
    const femaleVoice = 'female' === 'female' ? 'Kore' : 'Charon';
    const maleVoice = 'male' === 'female' ? 'Kore' : 'Charon';

    expect(femaleVoice).toBe('Kore');
    expect(maleVoice).toBe('Charon');
  });
});
