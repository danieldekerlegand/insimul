import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock grpc-server sessions
const mockSessions = new Map<string, any>();
vi.mock('../services/conversation/grpc-server.js', () => ({
  getSession: (id: string) => mockSessions.get(id),
  createSession: (sessionId: string, characterId: string, worldId: string, playerId: string, languageCode: string) => {
    const session = {
      sessionId, characterId, worldId, playerId, languageCode,
      conversationContext: null,
      history: [],
      active: true,
      lastActivity: Date.now(),
    };
    mockSessions.set(sessionId, session);
    return session;
  },
  endSession: (id: string) => mockSessions.delete(id),
}));

// Mock buildContext
const mockBuildContext = vi.fn();
vi.mock('../services/conversation/context-manager.js', () => ({
  buildContext: (...args: any[]) => mockBuildContext(...args),
}));

// Mock LLM provider — capture the system prompt it receives
let capturedContext: any = null;
const mockStreamCompletion = vi.fn(function* (_text: string, ctx: any) {
  capturedContext = ctx;
  yield 'Hello!';
});
vi.mock('../services/conversation/providers/provider-registry.js', () => ({
  getProvider: () => ({
    name: 'mock',
    streamCompletion: (text: string, ctx: any, opts: any) => {
      capturedContext = ctx;
      return (async function* () { yield 'Hello!'; })();
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

// Mock metrics
vi.mock('../services/conversation/conversation-metrics.js', () => ({
  PipelineTimer: class { stop() {} },
  getConversationMetrics: () => ({
    isDegraded: false,
    getStageStats: () => null,
    getSnapshot: () => ({}),
  }),
}));

// Mock quest trigger analyzer
vi.mock('../services/conversation/quest-trigger-analyzer.js', () => ({
  analyzeConversation: () => ({ triggers: [], markerContent: '' }),
}));

describe('HTTP Bridge — client-provided systemPrompt (US-001)', () => {
  let registerConversationRoutes: typeof import('../services/conversation/http-bridge').registerConversationRoutes;

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

    const mod = await import('../services/conversation/http-bridge');
    registerConversationRoutes = mod.registerConversationRoutes;
  });

  /**
   * Simulates a POST to /api/conversation/stream by calling the route handler directly.
   * Captures SSE events and the system prompt seen by the LLM.
   */
  async function simulateStreamRequest(body: Record<string, any>) {
    // Build a minimal Express app mock
    const handlers: Record<string, Function> = {};
    const fakeApp = {
      post: (path: string, handler: Function) => { handlers[path] = handler; },
      get: (path: string, handler: Function) => { handlers[path] = handler; },
    };
    registerConversationRoutes(fakeApp as any);

    const sseEvents: any[] = [];
    const fakeRes = {
      setHeader: vi.fn(),
      flushHeaders: vi.fn(),
      write: vi.fn((data: string) => {
        if (data.startsWith('data: ') && !data.includes('[DONE]')) {
          try {
            const parsed = JSON.parse(data.replace('data: ', '').trim());
            sseEvents.push(parsed);
          } catch { /* skip */ }
        }
      }),
      end: vi.fn(),
      writableEnded: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const fakeReq = { body };

    const handler = handlers['/api/conversation/stream'];
    expect(handler).toBeDefined();
    await handler(fakeReq, fakeRes);

    return { sseEvents, capturedContext, fakeRes };
  }

  it('uses client-provided systemPrompt when present', async () => {
    const clientPrompt = 'You are Pierre, a baker. LANGUAGE LEARNING MODE: French. CRITICAL LANGUAGE RULE: Respond entirely in French.';

    const result = await simulateStreamRequest({
      sessionId: 'test-1',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Bonjour!',
      languageCode: 'fr',
      systemPrompt: clientPrompt,
    });

    // The LLM should receive the client-provided prompt, not the server-built one
    expect(result.capturedContext).toBeDefined();
    expect(result.capturedContext.systemPrompt).toBe(clientPrompt);
    expect(result.capturedContext.systemPrompt).not.toContain('Server-built prompt');
  });

  it('falls back to server-built prompt when systemPrompt is not provided', async () => {
    const result = await simulateStreamRequest({
      sessionId: 'test-2',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Hello!',
      languageCode: 'en',
    });

    // Should have called buildContext and used its result
    expect(mockBuildContext).toHaveBeenCalled();
    expect(result.capturedContext).toBeDefined();
    expect(result.capturedContext.systemPrompt).toBe('Server-built prompt for NPC');
    expect(result.capturedContext.characterName).toBe('Jean Dupont');
  });

  it('preserves characterName and worldContext from buildContext when using client prompt', async () => {
    const clientPrompt = 'Custom prompt with language directives';

    const result = await simulateStreamRequest({
      sessionId: 'test-3',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Bonjour!',
      languageCode: 'fr',
      systemPrompt: clientPrompt,
    });

    // Should use client prompt but fetch characterName/worldContext/gender from buildContext
    expect(result.capturedContext.systemPrompt).toBe(clientPrompt);
    expect(result.capturedContext.characterName).toBe('Jean Dupont');
    expect(result.capturedContext.worldContext).toBe('French Village (Year 2024)');
    expect(result.capturedContext.characterGender).toBe('male');
  });

  it('uses client prompt even when buildContext fails for metadata', async () => {
    mockBuildContext.mockRejectedValue(new Error('DB unavailable'));
    const clientPrompt = 'Client prompt that should still work';

    const result = await simulateStreamRequest({
      sessionId: 'test-4',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Hello',
      languageCode: 'en',
      systemPrompt: clientPrompt,
    });

    // Client prompt should still be used even though buildContext failed
    expect(result.capturedContext.systemPrompt).toBe(clientPrompt);
  });

  it('does not call buildContext for system prompt when client prompt is provided', async () => {
    const clientPrompt = 'Full client-side prompt with all directives';

    // Pre-populate session with characterName so buildContext is NOT needed for metadata
    mockSessions.set('test-5', {
      sessionId: 'test-5',
      characterId: 'char-1',
      worldId: 'world-1',
      playerId: 'test-5',
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

    const result = await simulateStreamRequest({
      sessionId: 'test-5',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Bonjour Marie!',
      languageCode: 'fr',
      systemPrompt: clientPrompt,
    });

    // Since session already has characterName, buildContext should NOT be called
    expect(mockBuildContext).not.toHaveBeenCalled();
    expect(result.capturedContext.systemPrompt).toBe(clientPrompt);
    expect(result.capturedContext.characterName).toBe('Marie Curie');
  });
});
