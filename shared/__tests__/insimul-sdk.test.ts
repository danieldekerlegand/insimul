/**
 * Unit tests for @insimul/typescript
 *
 * Tests the InsimulClient, StreamingAudioPlayer, and MicCapture classes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  InsimulClient,
  ConversationState,
} from '../../packages/typescript/src/index.js';

// ── Mock fetch for SSE testing ──────────────────────────────────────────────

function createMockSSEResponse(events: string[]): Response {
  const sseData = events.map((e) => `data: ${e}\n\n`).join('');
  const encoder = new TextEncoder();
  const encoded = encoder.encode(sseData);

  let consumed = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (!consumed) {
        controller.enqueue(encoded);
        consumed = true;
      } else {
        controller.close();
      }
    },
  });

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    body: stream,
    headers: new Headers({ 'Content-Type': 'text/event-stream' }),
  } as unknown as Response;
}

// ── InsimulClient Tests ─────────────────────────────────────────────────────

describe('InsimulClient', () => {
  let client: InsimulClient;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new InsimulClient({
      serverUrl: 'http://localhost:3000',
      worldId: 'test-world',
      apiKey: 'test-key',
    });
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a client with correct options', () => {
    expect(client.getSessionId()).toBeNull();
    expect(client.getState()).toBe(ConversationState.CONVERSATION_STATE_UNSPECIFIED);
  });

  it('should start a conversation and generate session ID', () => {
    const sessionId = client.startConversation({ characterId: 'npc_1' });
    expect(sessionId).toBeTruthy();
    expect(sessionId.startsWith('sdk_')).toBe(true);
    expect(client.getSessionId()).toBe(sessionId);
    expect(client.getState()).toBe(ConversationState.STARTED);
  });

  it('should resume a conversation with provided session ID', () => {
    const sessionId = client.startConversation({
      characterId: 'npc_1',
      sessionId: 'existing_session_123',
    });
    expect(sessionId).toBe('existing_session_123');
    expect(client.getSessionId()).toBe('existing_session_123');
  });

  it('should throw when sending text without starting conversation', async () => {
    await expect(client.sendText('hello', 'npc_1')).rejects.toThrow(
      'No active conversation',
    );
  });

  it('should stream text chunks via callbacks', async () => {
    const textChunks: Array<{ text: string; isFinal: boolean }> = [];

    client.on({
      onTextChunk: (chunk) => textChunks.push(chunk),
    });

    client.startConversation({ characterId: 'npc_1' });

    fetchSpy.mockResolvedValueOnce(
      createMockSSEResponse([
        JSON.stringify({ type: 'text', text: 'Hello', isFinal: false }),
        JSON.stringify({ type: 'text', text: ' there!', isFinal: false }),
        JSON.stringify({ type: 'text', text: '', isFinal: true }),
        '[DONE]',
      ]),
    );

    await client.sendText('hi', 'npc_1');

    expect(textChunks).toHaveLength(3);
    expect(textChunks[0]).toEqual({ text: 'Hello', isFinal: false });
    expect(textChunks[1]).toEqual({ text: ' there!', isFinal: false });
    expect(textChunks[2]).toEqual({ text: '', isFinal: true });
  });

  it('should dispatch audio chunk events', async () => {
    const audioChunks: Array<{ durationMs: number }> = [];

    client.on({
      onAudioChunk: (chunk) => audioChunks.push({ durationMs: chunk.durationMs }),
    });

    client.startConversation({ characterId: 'npc_1' });

    // base64 of a tiny buffer
    const fakeAudio = btoa(String.fromCharCode(0, 0, 0, 0));

    fetchSpy.mockResolvedValueOnce(
      createMockSSEResponse([
        JSON.stringify({
          type: 'audio',
          data: fakeAudio,
          encoding: 3,
          sampleRate: 24000,
          durationMs: 500,
        }),
        '[DONE]',
      ]),
    );

    await client.sendText('hello', 'npc_1');

    expect(audioChunks).toHaveLength(1);
    expect(audioChunks[0].durationMs).toBe(500);
  });

  it('should dispatch viseme/facial data events', async () => {
    const facialEvents: Array<{ visemeCount: number }> = [];

    client.on({
      onVisemeData: (data) => facialEvents.push({ visemeCount: data.visemes.length }),
    });

    client.startConversation({ characterId: 'npc_1' });

    fetchSpy.mockResolvedValueOnce(
      createMockSSEResponse([
        JSON.stringify({
          type: 'facial',
          visemes: [
            { phoneme: 'aa', weight: 0.8, durationMs: 100 },
            { phoneme: 'oh', weight: 0.6, durationMs: 80 },
          ],
        }),
        '[DONE]',
      ]),
    );

    await client.sendText('hello', 'npc_1');

    expect(facialEvents).toHaveLength(1);
    expect(facialEvents[0].visemeCount).toBe(2);
  });

  it('should dispatch error events from SSE stream', async () => {
    const errors: string[] = [];

    client.on({
      onError: (err) => errors.push(err.message),
    });

    client.startConversation({ characterId: 'npc_1' });

    fetchSpy.mockResolvedValueOnce(
      createMockSSEResponse([
        JSON.stringify({ type: 'error', message: 'LLM provider not available' }),
        '[DONE]',
      ]),
    );

    await client.sendText('hello', 'npc_1');

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('LLM provider not available');
  });

  it('should send correct request body with auth header', async () => {
    client.startConversation({ characterId: 'npc_1' });

    fetchSpy.mockResolvedValueOnce(
      createMockSSEResponse(['[DONE]']),
    );

    await client.sendText('hello', 'npc_1');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/conversation/stream');
    expect(opts.headers['Authorization']).toBe('Bearer test-key');
    expect(opts.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(opts.body);
    expect(body.worldId).toBe('test-world');
    expect(body.characterId).toBe('npc_1');
    expect(body.text).toBe('hello');
  });

  it('should end conversation and clean up', async () => {
    client.startConversation({ characterId: 'npc_1' });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    } as unknown as Response);

    await client.endConversation();

    expect(client.getSessionId()).toBeNull();
    expect(client.getState()).toBe(ConversationState.ENDED);
  });

  it('should handle health check', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          healthy: true,
          version: '1.0.0',
          services: { llm: true },
        }),
    } as unknown as Response);

    const health = await client.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.version).toBe('1.0.0');
  });

  it('should handle fetch errors gracefully', async () => {
    const errors: string[] = [];

    client.on({
      onError: (err) => errors.push(err.message),
    });

    client.startConversation({ characterId: 'npc_1' });

    fetchSpy.mockRejectedValueOnce(new Error('Network failure'));

    await client.sendText('hello', 'npc_1');

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('Network failure');
  });

  it('should fire onStateChange callbacks', () => {
    const states: ConversationState[] = [];

    client.on({
      onStateChange: (state) => states.push(state),
    });

    client.startConversation({ characterId: 'npc_1' });

    expect(states).toEqual([ConversationState.STARTED]);
  });

  it('should strip trailing slashes from server URL', () => {
    const c = new InsimulClient({
      serverUrl: 'http://localhost:3000///',
      worldId: 'w',
    });
    c.startConversation({ characterId: 'npc_1' });

    fetchSpy.mockResolvedValueOnce(
      createMockSSEResponse(['[DONE]']),
    );

    c.sendText('hi', 'npc_1');

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/conversation/stream');
  });
});

// ── Provider Registry (basic) ───────────────────────────────────────────────

describe('SDK exports', () => {
  it('should export all expected types and classes', async () => {
    const sdk = await import('../../packages/typescript/src/index.js');

    // Classes
    expect(sdk.InsimulClient).toBeDefined();
    expect(sdk.StreamingAudioPlayer).toBeDefined();
    expect(sdk.MicCapture).toBeDefined();

    // Enums
    expect(sdk.AudioEncoding).toBeDefined();
    expect(sdk.ConversationState).toBeDefined();
    expect(sdk.SystemCommandType).toBeDefined();

    // Enum values
    expect(sdk.AudioEncoding.OPUS).toBe(2);
    expect(sdk.ConversationState.ACTIVE).toBe(2);
    expect(sdk.SystemCommandType.END).toBe(1);
  });
});
