/**
 * HTTP Bridge Live Session Tests
 *
 * Tests the SSE Live session path in http-bridge.ts:
 * - useLiveSession=true creates a per-request Live session and streams audio+text via SSE
 * - Falls back to text+TTS pipeline if Live session creation fails
 * - Closes Live session after turnComplete
 * - Side-channel fires for language analysis
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import type { Request, Response, Express } from 'express';
import { registerConversationRoutes } from '../services/conversation/http-bridge.js';

// ── Mock dependencies ──────────────────────────────────────────────────

// Track registered routes
const registeredRoutes: Record<string, Function> = {};
const mockApp = {
  post: vi.fn((path: string, handler: Function) => {
    registeredRoutes[path] = handler;
  }),
  get: vi.fn((path: string, handler: Function) => {
    registeredRoutes[path] = handler;
  }),
} as unknown as Express;

// Mock LiveSessionManager
const mockLiveSession = {
  id: 'live-test-123',
  isClosed: false,
  lastPlayerMessage: '',
  sendText: vi.fn(),
  sendAudio: vi.fn(),
  close: vi.fn(),
  callbacks: null as any,
};

const mockCreateSession = vi.fn();
const mockGetSession = vi.fn();
const mockEndSession = vi.fn();

vi.mock('../services/conversation/live/live-session-manager.js', () => ({
  getLiveSessionManager: () => ({
    createSession: (...args: any[]) => mockCreateSession(...args),
    getSession: (...args: any[]) => mockGetSession(...args),
    endSession: (...args: any[]) => mockEndSession(...args),
    activeSessionCount: 0,
  }),
}));

// Mock side-channel
const mockRunSideChannel = vi.fn();
vi.mock('../services/conversation/live/live-side-channel.js', () => ({
  runSideChannel: (...args: any[]) => mockRunSideChannel(...args),
}));

// Mock gRPC session
const mockSessionData = {
  history: [] as Array<{ role: string; content: string }>,
  lastActivity: Date.now(),
  conversationContext: {
    systemPrompt: 'You are an NPC.',
    characterName: 'Pierre',
  },
  characterId: 'npc-pierre',
  playerId: 'player-1',
};

vi.mock('../services/conversation/grpc-server.js', () => ({
  getSession: vi.fn(() => mockSessionData),
  createSession: vi.fn(() => mockSessionData),
  endSession: vi.fn(),
}));

// Mock LLM provider (for fallback path)
const mockStreamCompletion = vi.fn();
vi.mock('../services/conversation/providers/provider-registry.js', () => ({
  getProvider: () => ({
    streamCompletion: (...args: any[]) => mockStreamCompletion(...args),
  }),
}));

// Mock TTS provider
vi.mock('../services/conversation/tts/tts-provider.js', () => ({
  getTTSProvider: () => null,
  splitAtSentenceBoundaries: (text: string) => [text],
  assignVoiceProfile: () => ({ name: 'default', gender: 'neutral' }),
}));
vi.mock('../services/conversation/tts/google-tts-provider.js', () => ({}));
vi.mock('../services/conversation/tts/gemini-tts-provider.js', () => ({}));

// Mock viseme
vi.mock('../services/conversation/viseme/viseme-generator.js', () => ({
  createVisemeGenerator: () => null,
}));

// Mock metrics
vi.mock('../services/conversation/conversation-metrics.js', () => {
  class PipelineTimer {
    constructor(_name: string) {}
    stop() {}
  }
  return {
    PipelineTimer,
    getConversationMetrics: () => ({
      qualityTier: 'standard',
      tierConfig: { ttsBehavior: 'all', visemeQuality: 'standard' },
      getSnapshot: () => ({}),
    }),
    QUALITY_TIER_CONFIGS: {},
  };
});

vi.mock('../services/conversation/response-cache.js', () => ({
  responseCache: { getStats: () => ({}) },
}));

vi.mock('../services/conversation/quest-trigger-analyzer.js', () => ({
  analyzeConversation: vi.fn(() => ({ triggers: [], markerContent: '' })),
}));

vi.mock('../services/conversation/streaming-chat.js', () => ({
  cleanForSpeech: (text: string) => text,
}));

vi.mock('../services/conversation/conversation-context-cache.js', () => ({
  conversationContextCache: { get: () => null, set: vi.fn(), append: vi.fn() },
  ConversationContextCache: { chatKey: () => 'test-key' },
}));

vi.mock('../services/conversation/conversation-compression.js', () => ({
  compressConversationHistory: vi.fn(),
}));

vi.mock('../services/prolog-llm-router.js', () => ({
  prologLLMRouter: {
    tryPrologFirst: vi.fn(async () => ({ answered: false, confidence: 0 })),
  },
}));

vi.mock('../../config/gemini.js', () => ({
  getGenAI: () => ({}),
  GEMINI_MODELS: {
    LIVE: 'gemini-3.1-flash-live-preview',
    PRO: 'gemini-2.5-pro',
    FLASH: 'gemini-2.5-flash',
  },
}));

vi.mock('../services/conversation/context-manager.js', () => ({
  buildContext: vi.fn(async () => ({
    conversationContext: {
      systemPrompt: 'You are Pierre.',
      characterName: 'Pierre',
      characterGender: 'male',
    },
  })),
}));

// ── Helpers ──────────────────────────────────────────────────────────

function createMockResponse(): Response & { _sseEvents: any[]; _ended: boolean } {
  const events: any[] = [];
  let ended = false;
  const res = {
    _sseEvents: events,
    _ended: ended,
    writableEnded: false,
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    write: vi.fn((data: string) => {
      if (data.startsWith('data: ') && data !== 'data: [DONE]\n\n') {
        try {
          const json = JSON.parse(data.slice(6).trim());
          events.push(json);
        } catch {
          events.push(data);
        }
      }
    }),
    end: vi.fn(() => {
      res.writableEnded = true;
      res._ended = true;
    }),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as any;
  return res;
}

function createMockRequest(body: Record<string, any>): Request {
  return { body } as Request;
}

/** Simulate Live session: createSession captures callbacks, then we can fire them */
function setupLiveSessionMock() {
  mockCreateSession.mockImplementation(async (config: any, callbacks: any) => {
    mockLiveSession.callbacks = callbacks;
    return mockLiveSession;
  });
}

// ── Tests ────────────────────────────────────────────────────────────

describe('HTTP Bridge Live Session SSE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionData.history = [];
    mockLiveSession.isClosed = false;
    mockLiveSession.callbacks = null;
    // Re-register routes
    Object.keys(registeredRoutes).forEach(k => delete registeredRoutes[k]);
    registerConversationRoutes(mockApp);
  });

  describe('useLiveSession=true', () => {
    it('creates a Live session and sends text through it', async () => {
      setupLiveSessionMock();

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-pierre',
        worldId: 'world-1',
        text: 'Bonjour!',
        languageCode: 'fr-FR',
        useLiveSession: true,
        systemPrompt: 'You are Pierre.',
        voiceName: 'Puck',
        targetLanguage: 'French',
      });

      // Start the request handler
      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);

      // Wait for Live session to be created
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      // Verify session was created with correct config
      const [config] = mockCreateSession.mock.calls[0];
      expect(config.systemPrompt).toBe('You are Pierre.');
      expect(config.voiceName).toBe('Puck');
      expect(config.languageCode).toBe('fr-FR');
      expect(config.characterId).toBe('npc-pierre');

      // Verify text was sent
      expect(mockLiveSession.sendText).toHaveBeenCalledWith('Bonjour!');

      // Simulate audio chunk from Live API
      mockLiveSession.callbacks.onAudioChunk!('base64audiodata', 'audio/pcm;rate=24000');

      // Simulate text chunk
      mockLiveSession.callbacks.onTextChunk!('Bonjour, mon ami!');

      // Simulate turn complete
      mockLiveSession.callbacks.onTurnComplete!('Bonjour, mon ami!');

      await handlerPromise;

      // Verify audio SSE event was sent
      const audioEvents = res._sseEvents.filter((e: any) => e.type === 'audio');
      expect(audioEvents).toHaveLength(1);
      expect(audioEvents[0].data).toBe('base64audiodata');
      expect(audioEvents[0].sampleRate).toBe(24000);

      // Verify text SSE events
      const textEvents = res._sseEvents.filter((e: any) => e.type === 'text');
      expect(textEvents.length).toBeGreaterThanOrEqual(2);
      // Non-final text chunk
      expect(textEvents[0]).toMatchObject({ type: 'text', text: 'Bonjour, mon ami!', isFinal: false });
      // Final marker
      expect(textEvents[textEvents.length - 1]).toMatchObject({ type: 'text', text: '', isFinal: true });

      // Verify session was cleaned up
      expect(mockEndSession).toHaveBeenCalledWith('live-test-123');

      // Verify SSE stream was closed
      expect(res._ended).toBe(true);
    });

    it('streams audio chunks with correct encoding metadata', async () => {
      setupLiveSessionMock();

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'Hello',
        useLiveSession: true,
      });

      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      // Send multiple audio chunks
      mockLiveSession.callbacks.onAudioChunk!('chunk1', 'audio/pcm;rate=24000');
      mockLiveSession.callbacks.onAudioChunk!('chunk2', 'audio/pcm;rate=16000');
      mockLiveSession.callbacks.onTurnComplete!('Hi there');

      await handlerPromise;

      const audioEvents = res._sseEvents.filter((e: any) => e.type === 'audio');
      expect(audioEvents).toHaveLength(2);
      expect(audioEvents[0]).toMatchObject({ data: 'chunk1', sampleRate: 24000, encoding: 'pcm' });
      expect(audioEvents[1]).toMatchObject({ data: 'chunk2', sampleRate: 16000, encoding: 'pcm' });
    });

    it('fires side-channel analysis on turnComplete', async () => {
      setupLiveSessionMock();

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-pierre',
        worldId: 'world-1',
        text: 'Comment ça va?',
        useLiveSession: true,
        targetLanguage: 'French',
        playerProficiency: 'A2',
      });

      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      mockLiveSession.callbacks.onTurnComplete!('Ça va bien, merci!');

      await handlerPromise;

      // Side-channel should have been called
      expect(mockRunSideChannel).toHaveBeenCalledWith(
        'Comment ça va?',
        'Ça va bien, merci!',
        expect.objectContaining({
          targetLanguage: 'French',
          playerProficiency: 'A2',
          npcCharacterId: 'npc-pierre',
        }),
        expect.objectContaining({
          onVocabHints: expect.any(Function),
          onGrammarFeedback: expect.any(Function),
          onEval: expect.any(Function),
          onQuestProgress: expect.any(Function),
          onGoalEvaluation: expect.any(Function),
        }),
      );
    });

    it('closes Live session after turnComplete (per-request, not persistent)', async () => {
      setupLiveSessionMock();

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'Hi',
        useLiveSession: true,
      });

      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      mockLiveSession.callbacks.onTurnComplete!('Hello');

      await handlerPromise;

      expect(mockEndSession).toHaveBeenCalledWith('live-test-123');
    });

    it('handles interruption gracefully', async () => {
      setupLiveSessionMock();

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'Hi',
        useLiveSession: true,
      });

      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      mockLiveSession.callbacks.onInterrupted!();

      await handlerPromise;

      const interruptEvents = res._sseEvents.filter((e: any) => e.type === 'interrupted');
      expect(interruptEvents).toHaveLength(1);
      expect(mockEndSession).toHaveBeenCalled();
    });

    it('sends transcription events to client', async () => {
      setupLiveSessionMock();

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'Bonjour',
        useLiveSession: true,
      });

      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      mockLiveSession.callbacks.onTranscription!('Bonjour');
      mockLiveSession.callbacks.onTurnComplete!('Hello!');

      await handlerPromise;

      const transcriptEvents = res._sseEvents.filter((e: any) => e.type === 'transcript');
      expect(transcriptEvents).toHaveLength(1);
      expect(transcriptEvents[0].text).toBe('Bonjour');
    });
  });

  describe('fallback to text+TTS', () => {
    it('falls back when Live session creation fails', async () => {
      mockCreateSession.mockRejectedValue(new Error('Max sessions reached'));

      // Mock the LLM fallback path
      mockStreamCompletion.mockImplementation(async function* () {
        yield 'Fallback response';
      });

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'Hello',
        languageCode: 'en',
        useLiveSession: true,
      });

      await registeredRoutes['/api/conversation/stream'](req, res);

      // Should NOT have ended session (it was never created)
      expect(mockEndSession).not.toHaveBeenCalled();

      // Should have fallen back to text pipeline (LLM streaming was called)
      expect(mockStreamCompletion).toHaveBeenCalled();

      // Text events should exist from the fallback path
      const textEvents = res._sseEvents.filter((e: any) => e.type === 'text');
      expect(textEvents.length).toBeGreaterThan(0);
    });

    it('uses text+TTS pipeline when useLiveSession is not set', async () => {
      mockStreamCompletion.mockImplementation(async function* () {
        yield 'Normal response';
      });

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'Hello',
        languageCode: 'en',
      });

      await registeredRoutes['/api/conversation/stream'](req, res);

      // Live session should not be attempted
      expect(mockCreateSession).not.toHaveBeenCalled();

      // LLM streaming should be called
      expect(mockStreamCompletion).toHaveBeenCalled();
    });
  });

  describe('side-channel SSE callbacks', () => {
    it('emits vocab_hints as SSE when side-channel fires', async () => {
      setupLiveSessionMock();

      // Make side-channel call the vocab hints callback immediately
      mockRunSideChannel.mockImplementation(
        (_player: string, _npc: string, _ctx: any, callbacks: any) => {
          callbacks.onVocabHints([{ word: 'bonjour', translation: 'hello', context: 'greeting' }]);
        },
      );

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'Bonjour',
        useLiveSession: true,
        targetLanguage: 'French',
      });

      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      mockLiveSession.callbacks.onTurnComplete!('Hello!');

      await handlerPromise;

      const vocabEvents = res._sseEvents.filter((e: any) => e.type === 'vocab_hints');
      expect(vocabEvents).toHaveLength(1);
      expect(JSON.parse(vocabEvents[0].content)).toEqual([
        { word: 'bonjour', translation: 'hello', context: 'greeting' },
      ]);
    });

    it('emits grammar_feedback as SSE when side-channel fires', async () => {
      setupLiveSessionMock();

      mockRunSideChannel.mockImplementation(
        (_player: string, _npc: string, _ctx: any, callbacks: any) => {
          callbacks.onGrammarFeedback({ status: 'errors_found', errors: [{ pattern: 'gender', incorrect: 'le maison', corrected: 'la maison', explanation: 'maison is feminine' }] });
        },
      );

      const res = createMockResponse();
      const req = createMockRequest({
        sessionId: 'sess-1',
        characterId: 'npc-1',
        worldId: 'world-1',
        text: 'le maison est belle',
        useLiveSession: true,
        targetLanguage: 'French',
      });

      const handlerPromise = registeredRoutes['/api/conversation/stream'](req, res);
      await vi.waitFor(() => expect(mockCreateSession).toHaveBeenCalled());

      mockLiveSession.callbacks.onTurnComplete!('La maison est belle!');

      await handlerPromise;

      const grammarEvents = res._sseEvents.filter((e: any) => e.type === 'grammar_feedback');
      expect(grammarEvents).toHaveLength(1);
    });
  });
});
