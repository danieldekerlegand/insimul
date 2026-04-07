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

// Mock buildContext — capture the gameState argument
const mockBuildContext = vi.fn();
vi.mock('../services/conversation/context-manager.js', () => ({
  buildContext: (...args: any[]) => mockBuildContext(...args),
}));

// Mock LLM provider — capture the system prompt it receives
let capturedContext: any = null;
vi.mock('../services/conversation/providers/provider-registry.js', () => ({
  getProvider: () => ({
    name: 'mock',
    streamCompletion: (_text: string, ctx: any) => {
      capturedContext = ctx;
      return (async function* () { yield 'Bonjour!'; })();
    },
  }),
}));

// Mock TTS
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

describe('HTTP Bridge — gameState passthrough (US-005)', () => {
  let registerConversationRoutes: typeof import('../services/conversation/http-bridge').registerConversationRoutes;

  beforeEach(async () => {
    vi.resetModules();
    mockSessions.clear();
    capturedContext = null;
    mockBuildContext.mockReset();

    // Default buildContext mock — includes vocabulary review words when playerVocabulary is provided
    mockBuildContext.mockImplementation(async (_charId: string, _playerId: string, _worldId: string, _sessionId: string, _storage: any, gameState: any) => ({
      conversationContext: {
        systemPrompt: gameState?.cefrLevel
          ? `Server prompt with CEFR ${gameState.cefrLevel}. ${gameState.playerVocabulary ? `Review words: ${gameState.playerVocabulary.map((v: any) => v.word).join(', ')}` : ''}`
          : 'Server-built prompt for NPC',
        characterName: 'Jean Dupont',
        worldContext: 'French Village',
        characterGender: 'male',
      },
    }));

    const mod = await import('../services/conversation/http-bridge');
    registerConversationRoutes = mod.registerConversationRoutes;
  });

  async function simulateStreamRequest(body: Record<string, any>) {
    const handlers: Record<string, Function> = {};
    const fakeApp = {
      post: (path: string, handler: Function) => { handlers[path] = handler; },
      get: (path: string, handler: Function) => { handlers[path] = handler; },
    };
    registerConversationRoutes(fakeApp as any);

    const fakeRes = {
      setHeader: vi.fn(),
      flushHeaders: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
      writableEnded: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const fakeReq = { body };

    const handler = handlers['/api/conversation/stream'];
    expect(handler).toBeDefined();
    await handler(fakeReq, fakeRes);

    return { capturedContext, fakeRes };
  }

  it('passes cefrLevel and playerVocabulary to buildContext via gameState', async () => {
    const vocabulary = [
      { word: 'bonjour', masteryLevel: 'learning', encounters: 3 },
      { word: 'merci', masteryLevel: 'mastered', encounters: 10 },
    ];

    await simulateStreamRequest({
      sessionId: 'gs-1',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Bonjour!',
      languageCode: 'fr',
      cefrLevel: 'A1',
      playerVocabulary: vocabulary,
    });

    // buildContext should have been called with gameState containing cefrLevel and playerVocabulary
    expect(mockBuildContext).toHaveBeenCalled();
    const gameStateArg = mockBuildContext.mock.calls[0][5]; // 6th arg is gameState
    expect(gameStateArg).toBeDefined();
    expect(gameStateArg.cefrLevel).toBe('A1');
    expect(gameStateArg.playerVocabulary).toEqual(vocabulary);
  });

  it('passes playerGrammarPatterns to buildContext via gameState', async () => {
    const grammarPatterns = [
      { pattern: 'passé composé', accuracy: 0.7, encounters: 5 },
      { pattern: 'imparfait', accuracy: 0.4, encounters: 2 },
    ];

    await simulateStreamRequest({
      sessionId: 'gs-2',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Bonjour!',
      languageCode: 'fr',
      cefrLevel: 'B1',
      playerGrammarPatterns: grammarPatterns,
    });

    const gameStateArg = mockBuildContext.mock.calls[0][5];
    expect(gameStateArg.playerGrammarPatterns).toEqual(grammarPatterns);
    expect(gameStateArg.cefrLevel).toBe('B1');
  });

  it('server prompt includes vocabulary review words when playerVocabulary is provided', async () => {
    const vocabulary = [
      { word: 'bonjour', masteryLevel: 'learning', encounters: 3 },
      { word: 'au revoir', masteryLevel: 'learning', encounters: 1 },
    ];

    const result = await simulateStreamRequest({
      sessionId: 'gs-3',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Salut!',
      languageCode: 'fr',
      cefrLevel: 'A1',
      playerVocabulary: vocabulary,
    });

    // The server-built prompt (from our mockBuildContext) should contain vocabulary words
    expect(result.capturedContext.systemPrompt).toContain('bonjour');
    expect(result.capturedContext.systemPrompt).toContain('au revoir');
    expect(result.capturedContext.systemPrompt).toContain('CEFR A1');
  });

  it('does not pass gameState fields when not provided in request', async () => {
    await simulateStreamRequest({
      sessionId: 'gs-4',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Hello!',
      languageCode: 'en',
    });

    expect(mockBuildContext).toHaveBeenCalled();
    const gameStateArg = mockBuildContext.mock.calls[0][5];
    // gameState should be empty (no cefrLevel, no vocabulary, no grammar)
    expect(gameStateArg.cefrLevel).toBeUndefined();
    expect(gameStateArg.playerVocabulary).toBeUndefined();
    expect(gameStateArg.playerGrammarPatterns).toBeUndefined();
  });

  it('gameState fields are passed alongside prologFacts', async () => {
    const prologFacts = [{ predicate: 'knows', args: ['player', 'french'] }];
    const vocabulary = [{ word: 'chat', masteryLevel: 'learning', encounters: 1 }];

    await simulateStreamRequest({
      sessionId: 'gs-5',
      characterId: 'char-1',
      worldId: 'world-1',
      text: 'Le chat!',
      languageCode: 'fr',
      prologFacts,
      cefrLevel: 'A2',
      playerVocabulary: vocabulary,
    });

    const gameStateArg = mockBuildContext.mock.calls[0][5];
    expect(gameStateArg.prologFacts).toEqual(prologFacts);
    expect(gameStateArg.cefrLevel).toBe('A2');
    expect(gameStateArg.playerVocabulary).toEqual(vocabulary);
  });
});
