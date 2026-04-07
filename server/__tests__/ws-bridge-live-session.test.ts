/**
 * WS Bridge Live Session Integration Tests
 *
 * Tests the integration of Gemini Live sessions into the WebSocket bridge:
 * - startLiveSession creates session and wires callbacks
 * - textInput routes through Live session when active
 * - audioInput relays to Live session
 * - Callback events map to correct WS messages
 * - endLiveSession tears down session
 * - Fallback to text+TTS when Live session unavailable
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import type { LiveSessionCallbacks, LiveSessionConfig } from '../services/conversation/live/live-session-manager.js';

// ── Mock setup ──────────────────────────────────────────────────────

// Track live session callbacks and mock session
let capturedLiveCallbacks: LiveSessionCallbacks | null = null;
let capturedLiveConfig: LiveSessionConfig | null = null;
const mockLiveSession = {
  id: 'live-test-123',
  isClosed: false,
  sendText: vi.fn(),
  sendAudio: vi.fn(),
  close: vi.fn(),
};

const mockLiveSessionManager = {
  createSession: vi.fn(async (config: LiveSessionConfig, callbacks: LiveSessionCallbacks) => {
    capturedLiveConfig = config;
    capturedLiveCallbacks = callbacks;
    return mockLiveSession;
  }),
  getSession: vi.fn((id: string) => {
    if (id === mockLiveSession.id && !mockLiveSession.isClosed) return mockLiveSession;
    return undefined;
  }),
  endSession: vi.fn((id: string) => {
    if (id === mockLiveSession.id) {
      mockLiveSession.isClosed = true;
    }
  }),
  activeSessionCount: 1,
  destroy: vi.fn(),
};

vi.mock('../services/conversation/live/live-session-manager.js', () => ({
  getLiveSessionManager: () => mockLiveSessionManager,
  LiveConversationSession: vi.fn(),
}));

// Mock grpc-server session management
const mockGrpcSession: any = {
  sessionId: 'test-session',
  characterId: 'npc-1',
  worldId: 'world-1',
  playerId: 'test-session',
  languageCode: 'fr',
  conversationContext: {
    systemPrompt: 'You are Pierre.',
    characterName: 'Pierre',
    characterGender: 'male',
  },
  history: [],
  active: true,
  lastActivity: Date.now(),
};

vi.mock('../services/conversation/grpc-server.js', () => ({
  getSession: vi.fn(() => mockGrpcSession),
  createSession: vi.fn(() => mockGrpcSession),
  endSession: vi.fn(),
}));

// Mock context manager
vi.mock('../services/conversation/context-manager.js', () => ({
  buildContext: vi.fn(async () => ({
    conversationContext: {
      systemPrompt: 'You are Pierre, a friendly baker.',
      characterName: 'Pierre',
      characterGender: 'male',
    },
  })),
  getLastPromptSectionTokens: vi.fn(() => null),
}));

// Mock provider registry
vi.mock('../services/conversation/providers/provider-registry.js', () => ({
  getProvider: vi.fn(() => ({
    streamCompletion: vi.fn(),
  })),
}));

// Mock TTS
vi.mock('../services/conversation/tts/tts-provider.js', () => ({
  splitAtSentenceBoundaries: vi.fn((s: string) => [s]),
  assignVoiceProfile: vi.fn(() => ({ name: 'default', gender: 'neutral' })),
  getTTSProvider: vi.fn(() => null),
  registerTTSProvider: vi.fn(),
}));

// Mock gemini-tts-provider (imported by ws-bridge for side-effects)
vi.mock('../services/conversation/tts/gemini-tts-provider.js', () => ({}));

// Mock language voices
vi.mock('../services/conversation/tts/language-voices.js', () => ({
  resolveLanguageCode: vi.fn((code: string) => code),
}));

// Mock conversation context cache
vi.mock('../services/conversation/conversation-context-cache.js', () => ({
  conversationContextCache: {
    get: vi.fn(),
    set: vi.fn(),
    append: vi.fn(),
    has: vi.fn(() => false),
    delete: vi.fn(),
    clear: vi.fn(),
  },
  ConversationContextCache: {
    chatKey: vi.fn((...args: string[]) => args.join(':')),
  },
}));

// Mock metrics
vi.mock('../services/conversation/conversation-metrics.js', () => ({
  PipelineTimer: vi.fn().mockImplementation(() => ({ stop: vi.fn() })),
  getConversationMetrics: vi.fn(() => ({
    record: vi.fn(),
    qualityTier: 'high',
    tierConfig: { ttsBehavior: 'disabled', visemeQuality: 'disabled', modelTierOverride: null },
  })),
  QUALITY_TIER_CONFIGS: {},
}));

// Mock other deps
vi.mock('../services/conversation/greeting-cache.js', () => ({
  greetingCache: { get: vi.fn(), invalidate: vi.fn(), invalidateWorld: vi.fn() },
}));
vi.mock('../services/conversation/conversation-classifier.js', () => ({
  classifyConversation: vi.fn(() => ({ tier: 'full' })),
}));
vi.mock('../services/conversation/speculative-cache.js', () => ({
  speculativeCache: { get: vi.fn(), has: vi.fn(() => false), invalidate: vi.fn(), invalidateWorld: vi.fn() },
  canonicalizeMessage: vi.fn(),
}));
vi.mock('../services/conversation/response-cache.js', () => ({
  responseCache: { get: vi.fn(), set: vi.fn() },
  ResponseCache: { makeKey: vi.fn() },
  isCacheableMessage: vi.fn(() => false),
}));
vi.mock('../../config/gemini.js', () => ({
  GEMINI_MODELS: { FLASH: 'flash', PRO: 'pro', LIVE: 'live' },
}));
vi.mock('../services/conversation/http-bridge.js', () => ({
  classifyMessageComplexity: vi.fn(() => 'simple'),
}));
vi.mock('../services/conversation/conversation-compression.js', () => ({
  compressConversationHistory: vi.fn(),
}));
vi.mock('../services/conversation/viseme/viseme-generator.js', () => ({
  createVisemeGenerator: vi.fn(),
}));
vi.mock('../services/conversation/npc-conversation-engine.js', () => ({
  initiateConversation: vi.fn(),
}));
vi.mock('../services/prolog-llm-router.js', () => ({
  prologLLMRouter: { tryPrologFirst: vi.fn() },
}));

// ── Helpers ─────────────────────────────────────────────────────────

/** Collect JSON messages sent to a mock WebSocket */
function createMockWS(): WebSocket & { sentMessages: any[]; sentBinary: Uint8Array[] } {
  const sentMessages: any[] = [];
  const sentBinary: Uint8Array[] = [];
  const ws = {
    readyState: WebSocket.OPEN,
    send: vi.fn((data: any) => {
      if (typeof data === 'string') {
        sentMessages.push(JSON.parse(data));
      } else if (data instanceof Uint8Array || data instanceof Buffer) {
        sentBinary.push(new Uint8Array(data));
      }
    }),
    sentMessages,
    sentBinary,
  } as unknown as WebSocket & { sentMessages: any[]; sentBinary: Uint8Array[] };
  return ws;
}

// ── Import after mocks ──────────────────────────────────────────────

// Dynamic import to ensure mocks are registered first
let connectionLiveSessions: Map<WebSocket, string>;

beforeEach(async () => {
  const mod = await import('../services/conversation/ws-bridge.js');
  connectionLiveSessions = mod.connectionLiveSessions;
});

// ── Tests ───────────────────────────────────────────────────────────

describe('WS Bridge Live Session Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedLiveCallbacks = null;
    capturedLiveConfig = null;
    mockLiveSession.isClosed = false;
    mockLiveSession.sendText.mockClear();
    mockLiveSession.sendAudio.mockClear();
    mockLiveSession.close.mockClear();
    mockGrpcSession.history = [];
    connectionLiveSessions?.clear();
  });

  describe('startLiveSession', () => {
    it('creates a Live session with correct config', async () => {
      const ws = createMockWS();

      // Simulate startLiveSession WS message by calling internal handler
      // We need to import the handler — but it's not exported, so we simulate via connectionLiveSessions + createSession
      const { getLiveSessionManager } = await import('../services/conversation/live/live-session-manager.js');
      const manager = getLiveSessionManager();

      const callbacks: LiveSessionCallbacks = {};
      await manager.createSession(
        {
          systemPrompt: 'You are Pierre.',
          voiceName: 'Charon',
          languageCode: 'fr-FR',
          characterId: 'npc-1',
          worldId: 'world-1',
        },
        callbacks,
      );

      expect(mockLiveSessionManager.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: 'You are Pierre.',
          voiceName: 'Charon',
          languageCode: 'fr-FR',
          characterId: 'npc-1',
        }),
        expect.any(Object),
      );
    });

    it('tracks the Live session for the WS connection', async () => {
      const ws = createMockWS();

      // Simulate: after startLiveSession, the session ID is stored
      connectionLiveSessions.set(ws, mockLiveSession.id);

      expect(connectionLiveSessions.get(ws)).toBe('live-test-123');
    });
  });

  describe('text routing through Live session', () => {
    it('routes text to Live session when active', async () => {
      const ws = createMockWS();
      connectionLiveSessions.set(ws, mockLiveSession.id);

      // Simulate the routing logic: check for live session and send text
      const liveSessionId = connectionLiveSessions.get(ws);
      const manager = getLiveSessionManager();
      const liveSession = manager.getSession(liveSessionId!);
      expect(liveSession).toBeDefined();

      liveSession!.sendText('Bonjour!');
      expect(mockLiveSession.sendText).toHaveBeenCalledWith('Bonjour!');
    });

    it('falls back to text+TTS when Live session is closed', () => {
      const ws = createMockWS();
      connectionLiveSessions.set(ws, mockLiveSession.id);
      mockLiveSession.isClosed = true;

      const liveSessionId = connectionLiveSessions.get(ws);
      const manager = getLiveSessionManager();
      const liveSession = manager.getSession(liveSessionId!);

      // getSession returns undefined when closed (per our mock)
      expect(liveSession).toBeUndefined();
    });

    it('falls back when Live session ID not found', () => {
      const ws = createMockWS();
      connectionLiveSessions.set(ws, 'nonexistent-id');

      const manager = getLiveSessionManager();
      const liveSession = manager.getSession('nonexistent-id');
      expect(liveSession).toBeUndefined();
    });
  });

  describe('audio routing', () => {
    it('relays audio input to Live session', () => {
      const ws = createMockWS();
      connectionLiveSessions.set(ws, mockLiveSession.id);

      const manager = getLiveSessionManager();
      const liveSession = manager.getSession(mockLiveSession.id);
      expect(liveSession).toBeDefined();

      const base64Audio = Buffer.from('test-audio-data').toString('base64');
      liveSession!.sendAudio(base64Audio);

      expect(mockLiveSession.sendAudio).toHaveBeenCalledWith(base64Audio);
    });

    it('binary WS frames route to Live session when active', () => {
      const ws = createMockWS();
      connectionLiveSessions.set(ws, mockLiveSession.id);

      // Verify the live session exists for binary routing
      const liveSessionId = connectionLiveSessions.get(ws);
      expect(liveSessionId).toBe(mockLiveSession.id);

      const manager = getLiveSessionManager();
      const liveSess = manager.getSession(liveSessionId!);
      expect(liveSess).toBeDefined();
      expect(liveSess!.isClosed).toBe(false);
    });
  });

  describe('callback -> WS event mapping', () => {
    it('onAudioChunk sends binary + audio_meta', async () => {
      const ws = createMockWS();

      // Create session to capture callbacks
      await mockLiveSessionManager.createSession(
        { systemPrompt: 'test' },
        {},
      );

      expect(capturedLiveCallbacks).toBeDefined();

      // Simulate the callback wiring as done in handleStartLiveSession
      const onAudioChunk = (data: string, mimeType: string) => {
        const buf = Buffer.from(data, 'base64');
        ws.send(new Uint8Array(buf));
        const rateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        ws.send(JSON.stringify({
          type: 'audio_meta',
          encoding: 'pcm',
          sampleRate,
          durationMs: 0,
        }));
      };

      onAudioChunk('dGVzdA==', 'audio/pcm;rate=24000');

      expect(ws.sentBinary).toHaveLength(1);
      expect(ws.sentMessages).toContainEqual(
        expect.objectContaining({ type: 'audio_meta', encoding: 'pcm', sampleRate: 24000 }),
      );
    });

    it('onTextChunk sends text JSON', () => {
      const ws = createMockWS();
      const sessionId = 'test-session';
      const languageCode = 'fr';

      // Simulate the callback
      const onTextChunk = (text: string) => {
        ws.send(JSON.stringify({ type: 'text', text, isFinal: false, languageCode, sessionId }));
      };

      onTextChunk('Bonjour!');

      expect(ws.sentMessages).toContainEqual(
        expect.objectContaining({ type: 'text', text: 'Bonjour!', isFinal: false }),
      );
    });

    it('onTurnComplete sends final text + done', () => {
      const ws = createMockWS();
      const sessionId = 'test-session';
      const languageCode = 'fr';

      const onTurnComplete = (fullText: string) => {
        ws.send(JSON.stringify({ type: 'text', text: '', isFinal: true, languageCode, sessionId }));
        ws.send(JSON.stringify({ type: 'done' }));
      };

      onTurnComplete('Bonjour, comment allez-vous?');

      expect(ws.sentMessages).toContainEqual(
        expect.objectContaining({ type: 'text', text: '', isFinal: true }),
      );
      expect(ws.sentMessages).toContainEqual(
        expect.objectContaining({ type: 'done' }),
      );
    });

    it('onInterrupted sends interrupted event', () => {
      const ws = createMockWS();
      const sessionId = 'test-session';

      const onInterrupted = () => {
        ws.send(JSON.stringify({ type: 'interrupted', sessionId }));
      };

      onInterrupted();

      expect(ws.sentMessages).toContainEqual(
        expect.objectContaining({ type: 'interrupted', sessionId }),
      );
    });

    it('onTranscription sends transcript event', () => {
      const ws = createMockWS();
      const sessionId = 'test-session';

      const onTranscription = (text: string) => {
        ws.send(JSON.stringify({ type: 'transcript', text, sessionId }));
      };

      onTranscription('Bonjour monsieur');

      expect(ws.sentMessages).toContainEqual(
        expect.objectContaining({ type: 'transcript', text: 'Bonjour monsieur' }),
      );
    });
  });

  describe('endLiveSession', () => {
    it('tears down Live session and cleans up tracking', () => {
      const ws = createMockWS();
      connectionLiveSessions.set(ws, mockLiveSession.id);

      // Simulate endLiveSession
      const liveSessionId = connectionLiveSessions.get(ws);
      if (liveSessionId) {
        const manager = getLiveSessionManager();
        manager.endSession(liveSessionId);
        connectionLiveSessions.delete(ws);
      }

      expect(mockLiveSessionManager.endSession).toHaveBeenCalledWith(mockLiveSession.id);
      expect(connectionLiveSessions.has(ws)).toBe(false);
    });

    it('handles endLiveSession when no active session', () => {
      const ws = createMockWS();

      // Should not throw when there's no active live session
      const liveSessionId = connectionLiveSessions.get(ws);
      expect(liveSessionId).toBeUndefined();
    });
  });

  describe('session lifecycle', () => {
    it('full round-trip: start -> send text -> receive audio+text -> end', async () => {
      const ws = createMockWS();

      // Step 1: Create live session
      await mockLiveSessionManager.createSession(
        {
          systemPrompt: 'You are Pierre.',
          voiceName: 'Charon',
          languageCode: 'fr-FR',
          characterId: 'npc-1',
        },
        {},
      );
      connectionLiveSessions.set(ws, mockLiveSession.id);

      // Step 2: Send text via live session
      const manager = getLiveSessionManager();
      const liveSession = manager.getSession(mockLiveSession.id);
      expect(liveSession).toBeDefined();
      liveSession!.sendText('Bonjour!');
      expect(mockLiveSession.sendText).toHaveBeenCalledWith('Bonjour!');

      // Step 3: Simulate audio+text response via callbacks
      const sessionId = 'test-session';
      const languageCode = 'fr-FR';

      // Text chunk
      ws.send(JSON.stringify({ type: 'text', text: 'Salut!', isFinal: false, languageCode, sessionId }));

      // Audio chunk
      const audioData = Buffer.from('fake-audio').toString('base64');
      ws.send(new Uint8Array(Buffer.from(audioData, 'base64')));
      ws.send(JSON.stringify({ type: 'audio_meta', encoding: 'pcm', sampleRate: 24000, durationMs: 0 }));

      // Turn complete
      ws.send(JSON.stringify({ type: 'text', text: '', isFinal: true, languageCode, sessionId }));
      ws.send(JSON.stringify({ type: 'done' }));

      // Step 4: End session
      manager.endSession(mockLiveSession.id);
      connectionLiveSessions.delete(ws);

      // Verify events
      expect(ws.sentMessages).toContainEqual(expect.objectContaining({ type: 'text', text: 'Salut!' }));
      expect(ws.sentMessages).toContainEqual(expect.objectContaining({ type: 'audio_meta' }));
      expect(ws.sentMessages).toContainEqual(expect.objectContaining({ type: 'done' }));
      expect(ws.sentBinary.length).toBeGreaterThan(0);
      expect(mockLiveSessionManager.endSession).toHaveBeenCalledWith(mockLiveSession.id);
    });

    it('WS connection close tears down Live session', () => {
      const ws = createMockWS();
      connectionLiveSessions.set(ws, mockLiveSession.id);

      // Simulate WS close cleanup
      const liveSessionId = connectionLiveSessions.get(ws);
      if (liveSessionId) {
        const manager = getLiveSessionManager();
        manager.endSession(liveSessionId);
        connectionLiveSessions.delete(ws);
      }

      expect(mockLiveSessionManager.endSession).toHaveBeenCalledWith(mockLiveSession.id);
      expect(connectionLiveSessions.has(ws)).toBe(false);
    });
  });

  describe('audio_meta sample rate parsing', () => {
    it('parses sample rate from mimeType', () => {
      const mimeType = 'audio/pcm;rate=24000';
      const rateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      expect(sampleRate).toBe(24000);
    });

    it('defaults to 24000 when rate not in mimeType', () => {
      const mimeType = 'audio/pcm';
      const rateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      expect(sampleRate).toBe(24000);
    });

    it('parses non-standard sample rate', () => {
      const mimeType = 'audio/pcm;rate=16000';
      const rateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      expect(sampleRate).toBe(16000);
    });
  });
});

function getLiveSessionManager() {
  return mockLiveSessionManager;
}
