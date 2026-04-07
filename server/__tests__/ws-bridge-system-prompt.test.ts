import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';

// Mock grpc-server sessions
const mockSessions = new Map<string, any>();
vi.mock('../services/conversation/grpc-server.js', () => ({
  getSession: (id: string) => mockSessions.get(id),
  createSession: (sessionId: string, characterId: string, worldId: string, playerId: string, languageCode: string) => {
    const session = {
      sessionId, characterId, worldId, playerId, languageCode,
      conversationContext: null as any,
      history: [] as any[],
      active: true,
      lastActivity: Date.now(),
    };
    mockSessions.set(sessionId, session);
    return session;
  },
  endSession: (id: string) => mockSessions.delete(id),
}));

// Mock buildContext — capture calls
const mockBuildContext = vi.fn();
vi.mock('../services/conversation/context-manager.js', () => ({
  buildContext: (...args: any[]) => mockBuildContext(...args),
}));

// Mock LLM provider — capture the system prompt it receives
let capturedContext: any = null;
vi.mock('../services/conversation/providers/provider-registry.js', () => ({
  getProvider: () => ({
    name: 'mock',
    streamCompletion: (_text: string, ctx: any, _opts: any) => {
      capturedContext = ctx;
      return (async function* () { yield 'Bonjour!'; })();
    },
  }),
}));

// Mock TTS — not needed for this test
vi.mock('../services/conversation/tts/tts-provider.js', () => ({
  getTTSProvider: () => { throw new Error('no TTS'); },
  splitAtSentenceBoundaries: (s: string) => [s],
  assignVoiceProfile: () => ({ name: 'default', languageCode: 'en-US' }),
}));
vi.mock('../services/conversation/tts/google-tts-provider.js', () => ({}));

// Mock viseme
vi.mock('../services/conversation/viseme/viseme-generator.js', () => ({
  createVisemeGenerator: () => null,
}));

// Mock language-voices
vi.mock('../services/conversation/tts/language-voices.js', () => ({
  resolveLanguageCode: (code: string) => code || 'en',
}));

// Mock npc-conversation-engine
vi.mock('../services/conversation/npc-conversation-engine.js', () => ({
  initiateConversation: vi.fn(),
}));

describe('WS Bridge — client-provided systemPrompt (US-002)', () => {
  let startWSBridge: typeof import('../services/conversation/ws-bridge').startWSBridge;
  let stopWSBridge: typeof import('../services/conversation/ws-bridge').stopWSBridge;
  let server: WebSocketServer;

  beforeEach(async () => {
    vi.resetModules();
    mockSessions.clear();
    capturedContext = null;
    mockBuildContext.mockReset();

    // Default buildContext mock
    mockBuildContext.mockResolvedValue({
      conversationContext: {
        systemPrompt: 'Server-built prompt for NPC',
        characterName: 'Jean Dupont',
        worldContext: 'French Village (Year 2024)',
        characterGender: 'male',
      },
    });

    const mod = await import('../services/conversation/ws-bridge');
    startWSBridge = mod.startWSBridge;
    stopWSBridge = mod.stopWSBridge;
  });

  afterEach(async () => {
    await stopWSBridge();
  });

  /** Helper: start WS bridge and connect a client */
  function startAndConnect(port: number): Promise<WebSocket> {
    server = startWSBridge({ port });
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
    });
  }

  /** Helper: collect all JSON messages until 'done' */
  function collectMessages(ws: WebSocket): Promise<any[]> {
    const messages: any[] = [];
    return new Promise((resolve) => {
      ws.on('message', (raw: Buffer) => {
        try {
          const msg = JSON.parse(raw.toString());
          messages.push(msg);
          if (msg.type === 'done') {
            resolve(messages);
          }
        } catch { /* binary or non-JSON — skip */ }
      });
    });
  }

  it('uses client-provided systemPrompt when present in textInput', async () => {
    const clientPrompt = 'You are Pierre, a baker. LANGUAGE LEARNING MODE: French. CRITICAL LANGUAGE RULE: Respond entirely in French.';
    const ws = await startAndConnect(50090);
    const messagesP = collectMessages(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Bonjour!',
        sessionId: 'test-ws-1',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'fr',
        systemPrompt: clientPrompt,
      },
    }));

    await messagesP;

    // The LLM should receive the client-provided prompt
    expect(capturedContext).toBeDefined();
    expect(capturedContext.systemPrompt).toBe(clientPrompt);
    expect(capturedContext.systemPrompt).not.toContain('Server-built prompt');

    ws.close();
  });

  it('falls back to server-built prompt when systemPrompt is not provided', async () => {
    const ws = await startAndConnect(50091);
    const messagesP = collectMessages(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Hello!',
        sessionId: 'test-ws-2',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
      },
    }));

    await messagesP;

    // Should have called buildContext and used its result
    expect(mockBuildContext).toHaveBeenCalled();
    expect(capturedContext).toBeDefined();
    expect(capturedContext.systemPrompt).toBe('Server-built prompt for NPC');
    expect(capturedContext.characterName).toBe('Jean Dupont');

    ws.close();
  });

  it('preserves characterName and worldContext from buildContext when using client prompt', async () => {
    const clientPrompt = 'Custom prompt with language directives';
    const ws = await startAndConnect(50092);
    const messagesP = collectMessages(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Bonjour!',
        sessionId: 'test-ws-3',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'fr',
        systemPrompt: clientPrompt,
      },
    }));

    await messagesP;

    // Should use client prompt but fetch metadata from buildContext
    expect(capturedContext.systemPrompt).toBe(clientPrompt);
    expect(capturedContext.characterName).toBe('Jean Dupont');
    expect(capturedContext.worldContext).toBe('French Village (Year 2024)');
    expect(capturedContext.characterGender).toBe('male');

    ws.close();
  });

  it('uses client prompt even when buildContext fails for metadata', async () => {
    mockBuildContext.mockRejectedValue(new Error('DB unavailable'));
    const clientPrompt = 'Client prompt that should still work';
    const ws = await startAndConnect(50093);
    const messagesP = collectMessages(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Hello',
        sessionId: 'test-ws-4',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'en',
        systemPrompt: clientPrompt,
      },
    }));

    await messagesP;

    // Client prompt should still be used even though buildContext failed
    expect(capturedContext.systemPrompt).toBe(clientPrompt);

    ws.close();
  });

  it('does not call buildContext when session already has metadata and client prompt provided', async () => {
    // Pre-populate session with characterName
    mockSessions.set('test-ws-5', {
      sessionId: 'test-ws-5',
      characterId: 'char-1',
      worldId: 'world-1',
      playerId: 'test-ws-5',
      languageCode: 'fr',
      conversationContext: {
        systemPrompt: 'old prompt',
        characterName: 'Marie Curie',
        worldContext: 'Paris 1900',
        characterGender: 'female',
      },
      history: [],
      active: true,
      lastActivity: Date.now(),
    });

    const clientPrompt = 'Full client-side prompt with all directives';
    const ws = await startAndConnect(50094);
    const messagesP = collectMessages(ws);

    ws.send(JSON.stringify({
      textInput: {
        text: 'Bonjour Marie!',
        sessionId: 'test-ws-5',
        characterId: 'char-1',
        worldId: 'world-1',
        languageCode: 'fr',
        systemPrompt: clientPrompt,
      },
    }));

    await messagesP;

    // Since session already has characterName, buildContext should NOT be called
    expect(mockBuildContext).not.toHaveBeenCalled();
    expect(capturedContext.systemPrompt).toBe(clientPrompt);
    expect(capturedContext.characterName).toBe('Marie Curie');

    ws.close();
  });
});
