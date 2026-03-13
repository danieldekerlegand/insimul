import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for the SSE streaming response parsing logic used by CharacterChatDialog.
 * We extract the core parsing algorithm to test it without React rendering.
 */

/** Simulates parsing an SSE stream, mirroring sendMessageStreaming's logic. */
function parseSSEStream(raw: string, onChunk: (text: string) => void): { fullResponse: string; error?: string } {
  let fullResponse = '';
  let error: string | undefined;

  const lines = raw.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6);
    if (payload === '[DONE]') continue;

    try {
      const event = JSON.parse(payload);
      if (event.type === 'chunk' && event.text) {
        onChunk(event.text);
      } else if (event.type === 'done') {
        fullResponse = event.response;
      } else if (event.type === 'error') {
        error = event.error;
      }
    } catch (e) {
      if (e instanceof SyntaxError) continue;
      throw e;
    }
  }

  return { fullResponse, error };
}

describe('SSE streaming response parsing', () => {
  it('parses chunk events and accumulates text', () => {
    const chunks: string[] = [];
    const raw = [
      'data: {"type":"chunk","text":"Hello"}',
      'data: {"type":"chunk","text":" world"}',
      'data: {"type":"chunk","text":"!"}',
      'data: {"type":"done","response":"Hello world!","cleanedResponse":"Hello world!"}',
      'data: [DONE]',
    ].join('\n');

    const result = parseSSEStream(raw, (text) => chunks.push(text));

    expect(chunks).toEqual(['Hello', ' world', '!']);
    expect(result.fullResponse).toBe('Hello world!');
    expect(result.error).toBeUndefined();
  });

  it('returns error from error events', () => {
    const chunks: string[] = [];
    const raw = [
      'data: {"type":"error","error":"Gemini returned empty response."}',
      'data: [DONE]',
    ].join('\n');

    const result = parseSSEStream(raw, (text) => chunks.push(text));

    expect(chunks).toEqual([]);
    expect(result.error).toBe('Gemini returned empty response.');
  });

  it('skips malformed JSON lines gracefully', () => {
    const chunks: string[] = [];
    const raw = [
      'data: {"type":"chunk","text":"Hi"}',
      'data: {malformed',
      'data: {"type":"chunk","text":" there"}',
      'data: {"type":"done","response":"Hi there","cleanedResponse":"Hi there"}',
      'data: [DONE]',
    ].join('\n');

    const result = parseSSEStream(raw, (text) => chunks.push(text));

    expect(chunks).toEqual(['Hi', ' there']);
    expect(result.fullResponse).toBe('Hi there');
  });

  it('ignores non-data lines', () => {
    const chunks: string[] = [];
    const raw = [
      ':comment',
      '',
      'data: {"type":"chunk","text":"test"}',
      'event: message',
      'data: {"type":"done","response":"test","cleanedResponse":"test"}',
      'data: [DONE]',
    ].join('\n');

    const result = parseSSEStream(raw, (text) => chunks.push(text));

    expect(chunks).toEqual(['test']);
    expect(result.fullResponse).toBe('test');
  });

  it('preserves full response with markers in done event for post-processing', () => {
    const chunks: string[] = [];
    const rawWithMarkers = 'Bonjour! **QUEST_ASSIGN** Title: Learn French **END_QUEST**';
    const cleaned = 'Bonjour!';
    const raw = [
      'data: {"type":"chunk","text":"Bonjour! **QUEST_ASSIGN** Title: Learn French **END_QUEST**"}',
      `data: ${JSON.stringify({ type: 'done', response: rawWithMarkers, cleanedResponse: cleaned })}`,
      'data: [DONE]',
    ].join('\n');

    const result = parseSSEStream(raw, (text) => chunks.push(text));

    // Full response includes markers for quest parsing
    expect(result.fullResponse).toBe(rawWithMarkers);
  });

  it('handles empty stream with no chunks', () => {
    const chunks: string[] = [];
    const raw = [
      'data: {"type":"done","response":"","cleanedResponse":""}',
      'data: [DONE]',
    ].join('\n');

    const result = parseSSEStream(raw, (text) => chunks.push(text));

    expect(chunks).toEqual([]);
    expect(result.fullResponse).toBe('');
  });
});
