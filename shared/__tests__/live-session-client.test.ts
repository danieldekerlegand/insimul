/**
 * Live Session Client Support Tests (US-004)
 *
 * Tests that ServerChatProvider and InsimulClient correctly expose
 * Live session methods and handle the associated WS message types.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock WebSocket ──────────────────────────────────────────────────────

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onmessage: ((e: { data: string | Blob }) => void) | null = null;

  sentMessages: string[] = [];

  send(data: string | Uint8Array): void {
    if (typeof data === 'string') {
      this.sentMessages.push(data);
    } else {
      this.sentMessages.push(`[binary:${data.length}bytes]`);
    }
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
  }

  // Test helper: simulate receiving a JSON message
  receiveJSON(data: object): void {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  // Test helper: simulate receiving a binary message
  receiveBinary(data: Uint8Array): void {
    const blob = new Blob([data]);
    this.onmessage?.({ data: blob });
  }
}

// Assign to global so ServerChatProvider can use it
(globalThis as any).WebSocket = MockWebSocket;

// ── Import after mock ───────────────────────────────────────────────────

import { ServerChatProvider } from '../../packages/typescript/src/providers/chat/server-chat-provider.js';

// ── Helpers ─────────────────────────────────────────────────────────────

function createProvider(): ServerChatProvider {
  return new ServerChatProvider({
    serverUrl: 'http://localhost:8080',
    preferWebSocket: true,
  });
}

async function initWithMockWS(provider: ServerChatProvider): Promise<MockWebSocket> {
  // Start initialize which opens a WS connection
  const initPromise = provider.initialize();

  // Wait a tick for the WS constructor to fire
  await new Promise((r) => setTimeout(r, 0));

  // Find the created MockWebSocket (it's on the provider internally)
  // Trigger onopen via the global mock
  const ws = (provider as any).ws as MockWebSocket | null;
  // If ws is null, the constructor hasn't run yet — need to trigger onopen
  // The WS is created in ensureWSConnected via new WebSocket(url)
  // Let's wait for the promise to set up, then manually trigger
  await new Promise((r) => setTimeout(r, 10));

  const wsInstance = (provider as any).ws as MockWebSocket;
  if (wsInstance) {
    await initPromise;
    return wsInstance;
  }

  // Fallback: just wait for init
  await initPromise.catch(() => {});
  return (provider as any).ws as MockWebSocket;
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('ServerChatProvider Live Session', () => {
  let provider: ServerChatProvider;
  let ws: MockWebSocket;

  beforeEach(async () => {
    // Create a fresh provider and manually inject a mock WS
    provider = createProvider();
    ws = new MockWebSocket();
    (provider as any).ws = ws;
    (provider as any).wsConnecting = null;

    // Set up normal message handler
    ws.onmessage = (event: any) => {
      if (typeof event.data === 'string') {
        (provider as any).handleWSMessage(event.data);
      }
    };
  });

  describe('startLiveSession', () => {
    it('sends startLiveSession WS message with correct parameters', async () => {
      const startPromise = provider.startLiveSession({
        characterId: 'npc-123',
        worldId: 'world-456',
        systemPrompt: 'You are Pierre.',
        voiceName: 'Kore',
        languageCode: 'fr-FR',
      });

      // Simulate server acknowledgment
      await new Promise((r) => setTimeout(r, 0));
      ws.onmessage?.({ data: JSON.stringify({
        type: 'live_session_started',
        sessionId: 'sdk-session',
        liveSessionId: 'live-abc',
      }) });

      const liveId = await startPromise;

      expect(liveId).toBe('live-abc');
      expect(provider.isLiveSession).toBe(true);

      // Verify the sent message
      const sent = JSON.parse(ws.sentMessages[0]);
      expect(sent.startLiveSession).toBeDefined();
      expect(sent.startLiveSession.characterId).toBe('npc-123');
      expect(sent.startLiveSession.worldId).toBe('world-456');
      expect(sent.startLiveSession.systemPrompt).toBe('You are Pierre.');
      expect(sent.startLiveSession.voiceName).toBe('Kore');
      expect(sent.startLiveSession.languageCode).toBe('fr-FR');
    });

    it('rejects on error message from server', async () => {
      const startPromise = provider.startLiveSession({
        characterId: 'npc-123',
        worldId: 'world-456',
      });

      await new Promise((r) => setTimeout(r, 0));
      ws.onmessage?.({ data: JSON.stringify({
        type: 'error',
        message: 'Session limit reached',
      }) });

      await expect(startPromise).rejects.toThrow('Session limit reached');
      expect(provider.isLiveSession).toBe(false);
    });

    it('rejects on timeout', async () => {
      // Use a short timeout by testing with real timers and a patched timeout
      // Override the startLiveSession timeout to be very short for testing
      const origSend = ws.send.bind(ws);
      ws.send = (data: string | Uint8Array) => {
        origSend(data);
        // Don't send any response — let it time out
      };

      // Monkey-patch the timeout to be short (10ms instead of 10s)
      const origSetTimeout = globalThis.setTimeout;
      (globalThis as any).setTimeout = (fn: any, ms: number, ...args: any[]) => {
        // Replace the 10000ms timeout with 50ms
        const adjustedMs = ms >= 10000 ? 50 : ms;
        return origSetTimeout(fn, adjustedMs, ...args);
      };

      try {
        await expect(provider.startLiveSession({
          characterId: 'npc-123',
          worldId: 'world-456',
        })).rejects.toThrow('timeout');
      } finally {
        globalThis.setTimeout = origSetTimeout;
      }
    }, 5000);
  });

  describe('sendAudioChunk', () => {
    it('sends base64-encoded audio via audioInput message', async () => {
      // Set up live session as active
      (provider as any).liveSessionActive = true;
      (provider as any).liveSessionId = 'live-abc';

      const audioData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      provider.sendAudioChunk(audioData);

      const sent = JSON.parse(ws.sentMessages[0]);
      expect(sent.audioInput).toBeDefined();
      expect(sent.audioInput.data).toBeTruthy();
      // Verify it's valid base64
      const decoded = atob(sent.audioInput.data);
      expect(decoded.length).toBe(4);
    });

    it('throws when no active Live session', () => {
      expect(() => {
        provider.sendAudioChunk(new Uint8Array([0x01]));
      }).toThrow('No active Live session');
    });
  });

  describe('endLiveSession', () => {
    it('sends endLiveSession message and resets state', async () => {
      (provider as any).liveSessionActive = true;
      (provider as any).liveSessionId = 'live-abc';

      await provider.endLiveSession();

      const sent = JSON.parse(ws.sentMessages[0]);
      expect(sent.endLiveSession).toBeDefined();
      expect(provider.isLiveSession).toBe(false);
    });

    it('does nothing when no active session', async () => {
      await provider.endLiveSession();
      expect(ws.sentMessages).toHaveLength(0);
    });
  });

  describe('WS event dispatch', () => {
    it('fires onTranscript callback for transcript messages', () => {
      const onTranscript = vi.fn();
      provider.setCallbacks({ onTranscript });

      ws.receiveJSON({ type: 'transcript', text: 'Bonjour monsieur' });

      expect(onTranscript).toHaveBeenCalledWith('Bonjour monsieur');
    });

    it('fires onInterrupted callback for interrupted messages', () => {
      const onInterrupted = vi.fn();
      provider.setCallbacks({ onInterrupted });

      ws.receiveJSON({ type: 'interrupted', sessionId: 'sdk-session' });

      expect(onInterrupted).toHaveBeenCalled();
    });

    it('resets live session state on live_session_ended', () => {
      (provider as any).liveSessionActive = true;
      (provider as any).liveSessionId = 'live-abc';

      ws.receiveJSON({ type: 'live_session_ended', liveSessionId: 'live-abc' });

      expect(provider.isLiveSession).toBe(false);
    });

    it('still dispatches text and audio_meta during live session', () => {
      (provider as any).liveSessionActive = true;
      const onTextChunk = vi.fn();
      provider.setCallbacks({ onTextChunk });

      ws.receiveJSON({ type: 'text', text: 'Bonjour!', isFinal: false });

      expect(onTextChunk).toHaveBeenCalledWith('Bonjour!', false);
    });

    it('dispatches done event during live session', () => {
      (provider as any).liveSessionActive = true;
      const onComplete = vi.fn();
      provider.setCallbacks({ onComplete });

      // Accumulate some text first
      ws.receiveJSON({ type: 'text', text: 'Hello', isFinal: false });
      ws.receiveJSON({ type: 'done' });

      expect(onComplete).toHaveBeenCalledWith('Hello');
    });
  });

  describe('dispose', () => {
    it('ends live session before closing WS', async () => {
      (provider as any).liveSessionActive = true;
      (provider as any).liveSessionId = 'live-abc';

      await provider.dispose();

      // First message should be endLiveSession, second should be systemCommand END
      expect(ws.sentMessages.length).toBeGreaterThanOrEqual(1);
      const endMsg = JSON.parse(ws.sentMessages[0]);
      expect(endMsg.endLiveSession).toBeDefined();
    });
  });
});

describe('InsimulClient Live Session', () => {
  it('exposes startLiveSession, sendAudioChunk, endLiveSession, isLiveSession', async () => {
    // Dynamic import to avoid circular issues
    const { InsimulClient } = await import('../../packages/typescript/src/client.js');

    // Create with a mock server chat provider
    const mockChatProvider = {
      type: 'server' as const,
      initialize: vi.fn().mockResolvedValue(undefined),
      isSupported: () => true,
      isReady: () => true,
      setCallbacks: vi.fn(),
      setCharacter: vi.fn(),
      setSystemPrompt: vi.fn(),
      setGameContext: vi.fn(),
      sendText: vi.fn().mockResolvedValue('response'),
      sendAudio: vi.fn().mockResolvedValue('response'),
      abort: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
      startLiveSession: vi.fn().mockResolvedValue('live-123'),
      sendAudioChunk: vi.fn(),
      endLiveSession: vi.fn().mockResolvedValue(undefined),
      isLiveSession: true,
    };

    const mockTTSProvider = {
      type: 'none' as const,
      initialize: vi.fn().mockResolvedValue(undefined),
      isSupported: () => true,
      isReady: () => true,
      setCallbacks: vi.fn(),
      setVoice: vi.fn(),
      synthesize: vi.fn().mockResolvedValue(null),
      abort: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
    };

    const mockSTTProvider = {
      type: 'none' as const,
      initialize: vi.fn().mockResolvedValue(undefined),
      isSupported: () => true,
      isReady: () => true,
      setCallbacks: vi.fn(),
      transcribe: vi.fn().mockResolvedValue(''),
      abort: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
    };

    const client = new InsimulClient({
      chat: mockChatProvider as any,
      tts: mockTTSProvider as any,
      stt: mockSTTProvider as any,
    });

    await client.initialize();

    // startLiveSession
    const liveId = await client.startLiveSession({
      characterId: 'npc-1',
      worldId: 'world-1',
      voiceName: 'Kore',
      languageCode: 'fr-FR',
    });
    expect(liveId).toBe('live-123');
    expect(mockChatProvider.startLiveSession).toHaveBeenCalledWith({
      characterId: 'npc-1',
      worldId: 'world-1',
      voiceName: 'Kore',
      languageCode: 'fr-FR',
    });

    // sendAudioChunk
    const audio = new Uint8Array([1, 2, 3]);
    client.sendAudioChunk(audio);
    expect(mockChatProvider.sendAudioChunk).toHaveBeenCalledWith(audio);

    // isLiveSession
    expect(client.isLiveSession).toBe(true);

    // endLiveSession
    await client.endLiveSession();
    expect(mockChatProvider.endLiveSession).toHaveBeenCalled();
  });

  it('throws when chat provider is not server', async () => {
    const { InsimulClient } = await import('../../packages/typescript/src/client.js');

    const mockBrowserChat = {
      type: 'browser' as const,
      initialize: vi.fn().mockResolvedValue(undefined),
      isSupported: () => true,
      isReady: () => true,
      setCallbacks: vi.fn(),
      setCharacter: vi.fn(),
      setSystemPrompt: vi.fn(),
      sendText: vi.fn().mockResolvedValue(''),
      sendAudio: vi.fn().mockResolvedValue(''),
      abort: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
    };

    const mockTTS = {
      type: 'none' as const,
      initialize: vi.fn().mockResolvedValue(undefined),
      isSupported: () => true,
      isReady: () => true,
      setCallbacks: vi.fn(),
      setVoice: vi.fn(),
      synthesize: vi.fn().mockResolvedValue(null),
      abort: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
    };

    const mockSTT = {
      type: 'none' as const,
      initialize: vi.fn().mockResolvedValue(undefined),
      isSupported: () => true,
      isReady: () => true,
      setCallbacks: vi.fn(),
      transcribe: vi.fn().mockResolvedValue(''),
      abort: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
    };

    const client = new InsimulClient({
      chat: mockBrowserChat as any,
      tts: mockTTS as any,
      stt: mockSTT as any,
    });

    await client.initialize();

    await expect(client.startLiveSession({
      characterId: 'npc-1',
      worldId: 'world-1',
    })).rejects.toThrow('Live sessions require the server chat provider');

    expect(() => client.sendAudioChunk(new Uint8Array([1]))).toThrow(
      'Live sessions require the server chat provider',
    );
  });
});
