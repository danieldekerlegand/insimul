/**
 * Tests for ConversationClient local AI integration.
 *
 * Verifies that:
 * 1. ConversationClient routes through LocalAIClient when provided
 * 2. sendText() streams tokens via onTextChunk, fires onComplete
 * 3. sendText() generates TTS audio and emits onAudioChunk
 * 4. sendAudio() transcribes via STT then routes through text flow
 * 5. State transitions match HTTP SSE flow (thinking → speaking → idle)
 * 6. HTTP SSE path preserved when localAI is null
 * 7. abort() cancels in-flight local AI requests
 * 8. isAvailable() returns true when localAI is set
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationClient } from '../ConversationClient';
import type { ConversationClientCallbacks, ConversationState } from '../ConversationClient';
import type { LocalAIClient } from '../LocalAIClient';

function createMockLocalAI(overrides: Partial<LocalAIClient> = {}): LocalAIClient {
  return {
    generate: vi.fn().mockResolvedValue('full response'),
    generateStream: vi.fn().mockImplementation(
      async (_prompt: string, _sys: string | undefined, _opts: any, onToken?: (t: string) => void) => {
        onToken?.('Hello');
        onToken?.(' world');
        return 'Hello world';
      },
    ),
    textToSpeech: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
    speechToText: vi.fn().mockResolvedValue({ text: 'transcribed text' }),
    ...overrides,
  } as LocalAIClient;
}

function trackStates(client: ConversationClient, callbacks: ConversationClientCallbacks): ConversationState[] {
  const states: ConversationState[] = [];
  callbacks.onStateChange = (state) => states.push(state);
  client.setCallbacks(callbacks);
  return states;
}

describe('ConversationClient with LocalAIClient', () => {
  let mockLocalAI: LocalAIClient;
  let client: ConversationClient;
  let callbacks: ConversationClientCallbacks;
  let states: ConversationState[];

  beforeEach(() => {
    mockLocalAI = createMockLocalAI();
    client = new ConversationClient({ localAI: mockLocalAI });
    client.setCharacter('npc-1', 'world-1');
    callbacks = {};
    states = trackStates(client, callbacks);
  });

  describe('sendText() with local AI', () => {
    it('should stream tokens via onTextChunk callback', async () => {
      const chunks: Array<{ text: string; isFinal: boolean }> = [];
      callbacks.onTextChunk = (text, isFinal) => chunks.push({ text, isFinal });
      client.setCallbacks(callbacks);
      states = trackStates(client, callbacks);

      const result = await client.sendText('Hello NPC');

      expect(result).toBe('Hello world');
      // Two tokens + final empty chunk
      expect(chunks).toEqual([
        { text: 'Hello', isFinal: false },
        { text: ' world', isFinal: false },
        { text: '', isFinal: true },
      ]);
    });

    it('should fire onComplete with full text', async () => {
      const completions: string[] = [];
      callbacks.onComplete = (text) => completions.push(text);
      client.setCallbacks(callbacks);
      states = trackStates(client, callbacks);

      await client.sendText('Hello NPC');

      expect(completions).toEqual(['Hello world']);
    });

    it('should transition through thinking → speaking → idle', async () => {
      await client.sendText('Hello NPC');

      expect(states).toContain('thinking');
      expect(states).toContain('speaking');
      expect(states[states.length - 1]).toBe('idle');
    });

    it('should call generateStream with system prompt from builder', async () => {
      client.setSystemPromptBuilder((charId, worldId) => `You are ${charId} in ${worldId}`);

      await client.sendText('Hello NPC');

      expect(mockLocalAI.generateStream).toHaveBeenCalledWith(
        'Hello NPC',
        'You are npc-1 in world-1',
        undefined,
        expect.any(Function),
      );
    });

    it('should generate TTS audio and emit onAudioChunk', async () => {
      const audioChunks: any[] = [];
      callbacks.onAudioChunk = (chunk) => audioChunks.push(chunk);
      client.setCallbacks(callbacks);
      states = trackStates(client, callbacks);

      await client.sendText('Hello NPC');

      expect(mockLocalAI.textToSpeech).toHaveBeenCalledWith('Hello world');
      expect(audioChunks).toHaveLength(1);
      expect(audioChunks[0].encoding).toBe(3); // MP3
      expect(audioChunks[0].data).toBeInstanceOf(Uint8Array);
    });

    it('should still complete when TTS fails', async () => {
      mockLocalAI = createMockLocalAI({
        textToSpeech: vi.fn().mockRejectedValue(new Error('TTS failed')),
      });
      client = new ConversationClient({ localAI: mockLocalAI });
      client.setCharacter('npc-1', 'world-1');
      callbacks = {};
      states = trackStates(client, callbacks);

      const completions: string[] = [];
      callbacks.onComplete = (text) => completions.push(text);
      client.setCallbacks(callbacks);
      states = trackStates(client, callbacks);

      const result = await client.sendText('Hello NPC');

      expect(result).toBe('Hello world');
      expect(completions).toEqual(['Hello world']);
    });

    it('should skip TTS when no onAudioChunk callback', async () => {
      // Don't set onAudioChunk callback
      client.setCallbacks(callbacks);

      await client.sendText('Hello NPC');

      expect(mockLocalAI.textToSpeech).not.toHaveBeenCalled();
    });
  });

  describe('sendAudio() with local AI', () => {
    it('should transcribe audio then route through text flow', async () => {
      // Override generateStream to use transcribed text
      (mockLocalAI.generateStream as ReturnType<typeof vi.fn>).mockImplementation(
        async (prompt: string, _sys: any, _opts: any, onToken?: (t: string) => void) => {
          onToken?.(prompt.toUpperCase());
          return prompt.toUpperCase();
        },
      );

      const blob = new Blob(['fake audio'], { type: 'audio/webm' });
      const result = await client.sendAudio(blob, 'en');

      expect(mockLocalAI.speechToText).toHaveBeenCalledWith(blob, 'en');
      expect(result).toBe('TRANSCRIBED TEXT');
    });

    it('should return empty string when STT produces no text', async () => {
      mockLocalAI = createMockLocalAI({
        speechToText: vi.fn().mockResolvedValue({ text: '' }),
      });
      client = new ConversationClient({ localAI: mockLocalAI });
      client.setCharacter('npc-1', 'world-1');
      callbacks = {};
      states = trackStates(client, callbacks);

      const blob = new Blob(['fake audio'], { type: 'audio/webm' });
      const result = await client.sendAudio(blob);

      expect(result).toBe('');
      expect(states[states.length - 1]).toBe('idle');
    });
  });

  describe('abort() with local AI', () => {
    it('should suppress callbacks after abort and return empty', async () => {
      const chunks: string[] = [];

      mockLocalAI = createMockLocalAI({
        generateStream: vi.fn().mockImplementation(
          async (_p: string, _s: any, _o: any, onToken?: (t: string) => void) => {
            onToken?.('first');
            // Simulate abort happening mid-stream
            client.abort();
            onToken?.('second'); // Should be suppressed by _aborted flag
            return 'first second';
          },
        ),
      });
      client = new ConversationClient({ localAI: mockLocalAI });
      client.setCharacter('npc-1', 'world-1');
      callbacks.onTextChunk = (text) => chunks.push(text);
      client.setCallbacks(callbacks);

      const result = await client.sendText('test');

      // After abort, sendTextLocal returns '' early
      expect(result).toBe('');
      // 'first' was emitted before abort
      expect(chunks).toContain('first');
      // 'second' was suppressed
      expect(chunks).not.toContain('second');
    });
  });

  describe('isAvailable() with local AI', () => {
    it('should return true when localAI is set', async () => {
      const available = await client.isAvailable();
      expect(available).toBe(true);
    });

    it('should return false without localAI and no remote service', async () => {
      const clientNoAI = new ConversationClient();
      // Mock fetch to fail
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('no server'));
      const available = await clientNoAI.isAvailable();
      expect(available).toBe(false);
      clientNoAI.dispose();
    });
  });

  describe('fallback to HTTP when localAI is null', () => {
    it('should not call localAI methods when not provided', async () => {
      const clientNoAI = new ConversationClient();
      clientNoAI.setCharacter('npc-1', 'world-1');

      // Mock fetch to return a streaming response
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"type":"text","text":"Hi","isFinal":true}\n\ndata: [DONE]\n\n'));
          controller.close();
        },
      });
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream,
      });

      const result = await clientNoAI.sendText('Hello');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/conversation/stream'),
        expect.any(Object),
      );
      expect(result).toBe('Hi');
      clientNoAI.dispose();
    });
  });

  describe('error handling', () => {
    it('should transition to error state on generateStream failure', async () => {
      mockLocalAI = createMockLocalAI({
        generateStream: vi.fn().mockRejectedValue(new Error('LLM crashed')),
      });
      client = new ConversationClient({ localAI: mockLocalAI });
      client.setCharacter('npc-1', 'world-1');
      const errors: Error[] = [];
      callbacks = { onError: (err) => errors.push(err) };
      states = trackStates(client, callbacks);

      await expect(client.sendText('Hello')).rejects.toThrow('LLM crashed');
      expect(states).toContain('error');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('LLM crashed');
    });

    it('should require character/world to be set', async () => {
      const freshClient = new ConversationClient({ localAI: mockLocalAI });
      await expect(freshClient.sendText('Hello')).rejects.toThrow('character and world must be set');
    });
  });
});
