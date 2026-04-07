/**
 * WebSocket Bridge Tests
 *
 * Tests for the gRPC-to-WebSocket bridge: message round-trips,
 * session management, reconnection, and system commands.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import WebSocket from 'ws';
import {
  startWSBridge,
  stopWSBridge,
  connectionSessions,
  audioBuffers,
} from '../services/conversation/ws-bridge.js';
import {
  getSession,
  createSession,
  endSession,
} from '../services/conversation/grpc-server.js';
import type { IStreamingLLMProvider, ConversationContext, StreamCompletionOptions } from '../services/conversation/providers/llm-provider.js';
import { conversationContextCache, ConversationContextCache } from '../services/conversation/conversation-context-cache.js';

// ── Mock LLM Provider ─────────────────────────────────────────────────

class MockLLMProvider implements IStreamingLLMProvider {
  readonly name = 'mock-ws';

  async *streamCompletion(
    prompt: string,
    context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    const words = `Hello from ${context.characterName || 'NPC'}!`.split(' ');
    for (const word of words) {
      yield word + ' ';
    }
  }
}

class EmptyLLMProvider implements IStreamingLLMProvider {
  readonly name = 'mock-empty';

  async *streamCompletion(
    _prompt: string,
    _context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    // Returns nothing — simulates empty/filtered LLM response
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

const TEST_PORT = 50099;

function connectWS(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function waitForMessages(ws: WebSocket, count: number, timeoutMs = 5000): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const messages: any[] = [];
    const timeout = setTimeout(() => {
      resolve(messages); // Return what we have on timeout
    }, timeoutMs);

    ws.on('message', (raw: Buffer, isBinary: boolean) => {
      if (isBinary) {
        messages.push({ _binary: true, data: new Uint8Array(raw) });
      } else {
        messages.push(JSON.parse(raw.toString()));
      }
      if (messages.length >= count) {
        clearTimeout(timeout);
        resolve(messages);
      }
    });
  });
}

function waitForDone(ws: WebSocket, timeoutMs = 5000): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const messages: any[] = [];
    const timeout = setTimeout(() => {
      resolve(messages);
    }, timeoutMs);

    ws.on('message', (raw: Buffer, isBinary: boolean) => {
      if (isBinary) {
        messages.push({ _binary: true, data: new Uint8Array(raw) });
      } else {
        const msg = JSON.parse(raw.toString());
        messages.push(msg);
        if (msg.type === 'done') {
          clearTimeout(timeout);
          resolve(messages);
        }
      }
    });
  });
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('WebSocket Bridge', () => {
  const mockLLM = new MockLLMProvider();

  beforeEach(async () => {
    startWSBridge({ port: TEST_PORT, llmProvider: mockLLM });
  });

  afterEach(async () => {
    await stopWSBridge();
    // Clean up any leftover sessions
    const sessionId = 'test-session-1';
    if (getSession(sessionId)) {
      endSession(sessionId);
    }
    conversationContextCache.clear();
  });

  it('should accept WebSocket connections', async () => {
    const ws = await connectWS();
    expect(ws.readyState).toBe(WebSocket.OPEN);
    ws.close();
  });

  it('should stream text responses for textInput messages', async () => {
    // Pre-create session with context to avoid MongoDB call in buildContext
    const session = createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const ws = await connectWS();
    const messagesPromise = waitForDone(ws);

    // Use a non-greeting message to avoid Prolog-first interception
    ws.send(JSON.stringify({
      textInput: {
        text: 'Tell me about this place.',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
      },
    }));

    const messages = await messagesPromise;

    // Should have meta (ACTIVE), text chunks, final text, done
    const metaMsg = messages.find((m: any) => m.type === 'meta');
    expect(metaMsg).toBeDefined();
    expect(metaMsg!.state).toBe('ACTIVE');

    const textMessages = messages.filter((m: any) => m.type === 'text');
    expect(textMessages.length).toBeGreaterThan(0);

    // Should have a final text marker
    const finalText = textMessages.find((m: any) => m.isFinal === true);
    expect(finalText).toBeDefined();

    // Non-final text chunks should contain actual text from mock LLM
    const nonFinalText = textMessages.filter((m: any) => !m.isFinal);
    expect(nonFinalText.length).toBeGreaterThan(0);
    const fullText = nonFinalText.map((m: any) => m.text).join('');
    expect(fullText).toContain('Hello');

    // Should end with done
    const doneMsg = messages.find((m: any) => m.type === 'done');
    expect(doneMsg).toBeDefined();

    ws.close();
  });

  it('should create a session on first message and store history', async () => {
    // Pre-create session with context to avoid MongoDB call in buildContext
    const session = createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const ws = await connectWS();
    const messagesPromise = waitForDone(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Hi',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
      },
    }));

    await messagesPromise;

    const updatedSession = getSession('test-session-1');
    expect(updatedSession).toBeDefined();
    expect(updatedSession!.characterId).toBe('char-1');
    expect(updatedSession!.history.length).toBe(2); // user + assistant

    ws.close();
  });

  it('should handle system command END', async () => {
    const ws = await connectWS();

    // Create a session first
    createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');

    const messagesPromise = waitForMessages(ws, 1);

    ws.send(JSON.stringify({
      systemCommand: { type: 'END', sessionId: 'test-session-1' },
    }));

    const messages = await messagesPromise;
    expect(messages[0].type).toBe('meta');
    expect(messages[0].state).toBe('ENDED');

    // Session should be deleted
    expect(getSession('test-session-1')).toBeUndefined();

    ws.close();
  });

  it('should handle system command PAUSE and RESUME', async () => {
    const ws = await connectWS();

    createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');

    // PAUSE
    const pausePromise = waitForMessages(ws, 1);
    ws.send(JSON.stringify({
      systemCommand: { type: 'PAUSE', sessionId: 'test-session-1' },
    }));
    const pauseMsgs = await pausePromise;
    expect(pauseMsgs[0].state).toBe('PAUSED');
    expect(getSession('test-session-1')!.active).toBe(false);

    // RESUME
    const resumePromise = waitForMessages(ws, 1);
    ws.send(JSON.stringify({
      systemCommand: { type: 'RESUME', sessionId: 'test-session-1' },
    }));
    const resumeMsgs = await resumePromise;
    expect(resumeMsgs[0].state).toBe('ACTIVE');
    expect(getSession('test-session-1')!.active).toBe(true);

    ws.close();
  });

  it('should support session reconnection via resumeSession', async () => {
    // Create session from a first connection
    createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    const session = getSession('test-session-1')!;
    session.history.push({ role: 'user', content: 'old msg' });

    // New connection resumes the session
    const ws = await connectWS();
    const messagesPromise = waitForMessages(ws, 2);

    ws.send(JSON.stringify({
      resumeSession: { sessionId: 'test-session-1' },
    }));

    const messages = await messagesPromise;

    const metaMsg = messages.find((m: any) => m.type === 'meta');
    expect(metaMsg).toBeDefined();
    expect(metaMsg!.state).toBe('ACTIVE');

    const restoredMsg = messages.find((m: any) => m.type === 'session_restored');
    expect(restoredMsg).toBeDefined();
    expect(restoredMsg!.historyLength).toBe(1);

    ws.close();
  });

  it('should return error for resuming non-existent session', async () => {
    const ws = await connectWS();
    const messagesPromise = waitForMessages(ws, 1);

    ws.send(JSON.stringify({
      resumeSession: { sessionId: 'non-existent' },
    }));

    const messages = await messagesPromise;
    expect(messages[0].type).toBe('error');
    expect(messages[0].message).toContain('Session not found');

    ws.close();
  });

  it('should handle malformed JSON gracefully', async () => {
    const ws = await connectWS();
    const messagesPromise = waitForMessages(ws, 1);

    ws.send('not valid json{{{');

    const messages = await messagesPromise;
    expect(messages[0].type).toBe('error');

    ws.close();
  });

  it('should preserve session on disconnect (for reconnection)', async () => {
    // Pre-create session with context
    const session = createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const ws = await connectWS();
    const messagesPromise = waitForDone(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Hi',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
      },
    }));

    await messagesPromise;

    // Close the connection
    ws.close();

    // Wait for close to propagate
    await new Promise((r) => setTimeout(r, 100));

    // Session should still exist
    expect(getSession('test-session-1')).toBeDefined();
  });

  it('should cache context after first message and hit cache on second', async () => {
    // Pre-create session with context to avoid MongoDB call
    const session = createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const cacheKey = ConversationContextCache.chatKey('world-1', 'char-1', 'player-1');

    // Cache should be empty initially
    expect(conversationContextCache.has(cacheKey)).toBe(false);

    const ws = await connectWS();

    // First message
    let messagesPromise = waitForDone(ws);
    ws.send(JSON.stringify({
      textInput: {
        text: 'Hello!',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
      },
    }));
    await messagesPromise;

    // After first message, cache should be populated with the conversation
    const cached = conversationContextCache.get(cacheKey);
    expect(cached).toBeDefined();
    expect(cached!.messages.length).toBeGreaterThan(0);

    // Second message — context should be reused from session (no rebuild)
    messagesPromise = waitForDone(ws);
    ws.send(JSON.stringify({
      textInput: {
        text: 'How are you?',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
      },
    }));
    await messagesPromise;

    // Cache should have more messages now
    const updatedCache = conversationContextCache.get(cacheKey);
    expect(updatedCache!.messages.length).toBeGreaterThan(cached!.messages.length);

    ws.close();
  });

  it('should fall through to LLM for complex messages (Prolog routing)', async () => {
    // Pre-create session with context
    const session = createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const ws = await connectWS();
    const messagesPromise = waitForDone(ws);

    // Complex message should NOT be intercepted by Prolog
    ws.send(JSON.stringify({
      textInput: {
        text: 'Can you tell me about the history of this village?',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
      },
    }));

    const messages = await messagesPromise;

    // Should have text responses from the LLM (not Prolog template)
    const textMessages = messages.filter((m: any) => m.type === 'text' && !m.isFinal);
    expect(textMessages.length).toBeGreaterThan(0);
    const fullText = textMessages.map((m: any) => m.text).join('');
    expect(fullText).toContain('Hello'); // From mock LLM

    ws.close();
  });

  it('should attempt Prolog-first routing for greetings (falls through in test env)', async () => {
    // Pre-create session with context
    const session = createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const ws = await connectWS();
    const messagesPromise = waitForDone(ws);

    // 'bonjour' is a greeting — Prolog routing will be attempted but fall through
    // (no Prolog engine in test env), so LLM will handle it
    ws.send(JSON.stringify({
      textInput: {
        text: 'bonjour',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'fr',
      },
    }));

    const messages = await messagesPromise;

    // Should still get a response (either from Prolog or LLM fallback)
    const textMessages = messages.filter((m: any) => m.type === 'text');
    expect(textMessages.length).toBeGreaterThan(0);
    const doneMsg = messages.find((m: any) => m.type === 'done');
    expect(doneMsg).toBeDefined();

    ws.close();
  });

  it('should accept prologFacts field in textInput without breaking', async () => {
    // Pre-create session with context
    const session = createSession('test-session-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const ws = await connectWS();
    const messagesPromise = waitForDone(ws);

    // Send message with empty prologFacts — verifies the WS bridge
    // correctly destructures the field without errors (non-empty facts
    // trigger buildContext() which requires MongoDB, not available in test)
    ws.send(JSON.stringify({
      textInput: {
        text: 'What do you sell?',
        sessionId: 'test-session-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
        prologFacts: [],
      },
    }));

    const messages = await messagesPromise;

    const doneMsg = messages.find((m: any) => m.type === 'done');
    expect(doneMsg).toBeDefined();
    const textMessages = messages.filter((m: any) => m.type === 'text');
    expect(textMessages.length).toBeGreaterThan(0);

    ws.close();
  });
});

describe('WebSocket Bridge - Empty Response Detection', () => {
  const emptyLLM = new EmptyLLMProvider();
  const EMPTY_PORT = 50098;

  beforeEach(async () => {
    startWSBridge({ port: EMPTY_PORT, llmProvider: emptyLLM });
  });

  afterEach(async () => {
    await stopWSBridge();
    const sessionId = 'test-empty-1';
    if (getSession(sessionId)) {
      endSession(sessionId);
    }
  });

  it('should detect empty LLM response and send fallback text', async () => {
    const session = createSession('test-empty-1', 'char-1', 'world-1', 'player-1', 'en');
    session.conversationContext = { systemPrompt: 'You are an NPC.', characterName: 'TestNPC' };

    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const w = new WebSocket(`ws://localhost:${EMPTY_PORT}`);
      w.on('open', () => resolve(w));
      w.on('error', reject);
    });

    const messagesPromise = waitForDone(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Tell me something.',
        sessionId: 'test-empty-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
      },
    }));

    const messages = await messagesPromise;

    // Should have an error event about empty response
    const errorMsg = messages.find((m: any) => m.type === 'error' && m.message?.includes('empty'));
    expect(errorMsg).toBeDefined();

    // Should have fallback text
    const textMessages = messages.filter((m: any) => m.type === 'text');
    const fallbackText = textMessages.find((m: any) => m.text?.includes('lost my train of thought'));
    expect(fallbackText).toBeDefined();

    // Should still complete with done
    const doneMsg = messages.find((m: any) => m.type === 'done');
    expect(doneMsg).toBeDefined();

    ws.close();
  });
});
