/**
 * Gemini Live Session Manager Tests
 *
 * Tests session creation, lifecycle, callbacks, limits, and expiration.
 * Mocks the Gemini Live API to avoid real API calls.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LiveSessionManager,
  LiveConversationSession,
  type LiveSessionConfig,
  type LiveSessionCallbacks,
} from '../services/conversation/live/live-session-manager.js';

// ── Mock Gemini SDK ──────────────────────────────────────────────────

const mockSendRealtimeInput = vi.fn();
const mockSendClientContent = vi.fn();
const mockClose = vi.fn();

let capturedCallbacks: {
  onopen?: (() => void) | null;
  onmessage?: (e: any) => void;
  onerror?: ((e: any) => void) | null;
  onclose?: (() => void) | null;
} = {};

const mockRawSession = {
  sendRealtimeInput: mockSendRealtimeInput,
  sendClientContent: mockSendClientContent,
  close: mockClose,
  conn: {},
};

vi.mock('../config/gemini.js', () => ({
  getGenAI: () => ({
    live: {
      connect: vi.fn(async (params: any) => {
        capturedCallbacks = params.callbacks || {};
        // Simulate onopen
        setTimeout(() => capturedCallbacks.onopen?.(), 0);
        return mockRawSession;
      }),
    },
  }),
  GEMINI_MODELS: {
    LIVE: 'gemini-3.1-flash-live-preview',
    PRO: 'gemini-2.5-pro',
    FLASH: 'gemini-2.5-flash',
    FLASH_LITE: 'gemini-2.5-flash-lite',
    SPEECH: 'gemini-2.5-flash-preview-tts',
  },
}));

// ── Test helpers ─────────────────────────────────────────────────────

function makeConfig(overrides?: Partial<LiveSessionConfig>): LiveSessionConfig {
  return {
    systemPrompt: 'You are a friendly NPC named Pierre.',
    voiceName: 'Charon',
    languageCode: 'fr-FR',
    characterId: 'npc-1',
    worldId: 'world-1',
    playerId: 'player-1',
    ...overrides,
  };
}

function makeCallbacks(overrides?: Partial<LiveSessionCallbacks>): LiveSessionCallbacks {
  return {
    onAudioChunk: vi.fn(),
    onTextChunk: vi.fn(),
    onTurnComplete: vi.fn(),
    onInterrupted: vi.fn(),
    onTranscription: vi.fn(),
    onGenerationComplete: vi.fn(),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe('LiveSessionManager', () => {
  let manager: LiveSessionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallbacks = {};
    manager = new LiveSessionManager({
      inactivityTimeoutMs: 1000,
      maxConcurrentSessions: 3,
    });
  });

  afterEach(() => {
    manager.destroy();
  });

  it('creates a session and receives onopen callback', async () => {
    const config = makeConfig();
    const callbacks = makeCallbacks();

    const session = await manager.createSession(config, callbacks);

    expect(session).toBeInstanceOf(LiveConversationSession);
    expect(session.id).toMatch(/^live-/);
    expect(session.isClosed).toBe(false);
    expect(manager.activeSessionCount).toBe(1);

    // System prompt was sent via sendClientContent
    expect(mockSendClientContent).toHaveBeenCalledWith(
      expect.objectContaining({
        turns: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            parts: expect.arrayContaining([
              expect.objectContaining({ text: expect.stringContaining('Pierre') }),
            ]),
          }),
        ]),
        turnComplete: false,
      }),
    );
  });

  it('retrieves session by ID', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());
    expect(manager.getSession(session.id)).toBe(session);
    expect(manager.getSession('nonexistent')).toBeUndefined();
  });

  it('ends a session and cleans up', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());
    manager.endSession(session.id);

    expect(session.isClosed).toBe(true);
    expect(mockClose).toHaveBeenCalled();
    expect(manager.activeSessionCount).toBe(0);
    expect(manager.getSession(session.id)).toBeUndefined();
  });

  it('enforces max concurrent session limit', async () => {
    await manager.createSession(makeConfig(), makeCallbacks());
    await manager.createSession(makeConfig(), makeCallbacks());
    await manager.createSession(makeConfig(), makeCallbacks());

    await expect(
      manager.createSession(makeConfig(), makeCallbacks()),
    ).rejects.toThrow(/Maximum concurrent Live sessions/);
  });

  it('auto-expires sessions after inactivity', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());
    const sessionId = session.id;

    // Fast-forward time by manipulating lastActivity
    // Access private field via any cast
    (session as any).lastActivity = Date.now() - 2000;

    // Trigger cleanup
    (manager as any).cleanupExpired();

    expect(manager.getSession(sessionId)).toBeUndefined();
    expect(session.isClosed).toBe(true);
  });

  it('destroy closes all sessions', async () => {
    await manager.createSession(makeConfig(), makeCallbacks());
    await manager.createSession(makeConfig(), makeCallbacks());

    expect(manager.activeSessionCount).toBe(2);
    manager.destroy();
    expect(manager.activeSessionCount).toBe(0);
  });
});

describe('LiveConversationSession', () => {
  let manager: LiveSessionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallbacks = {};
    manager = new LiveSessionManager({
      inactivityTimeoutMs: 60_000,
      maxConcurrentSessions: 10,
    });
  });

  afterEach(() => {
    manager.destroy();
  });

  it('sendText calls sendClientContent with user turn', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());
    mockSendClientContent.mockClear();

    session.sendText('Bonjour!');

    expect(mockSendClientContent).toHaveBeenCalledWith({
      turns: [{ role: 'user', parts: [{ text: 'Bonjour!' }] }],
      turnComplete: true,
    });
  });

  it('sendAudio calls sendRealtimeInput', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());

    session.sendAudio('base64data', 'audio/pcm;rate=16000');

    expect(mockSendRealtimeInput).toHaveBeenCalledWith({
      audio: { data: 'base64data', mimeType: 'audio/pcm;rate=16000' },
    });
  });

  it('dispatches text chunks and turnComplete', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);

    // Simulate server sending text parts
    session.handleMessage({
      serverContent: {
        modelTurn: {
          role: 'model',
          parts: [{ text: 'Bonjour, ' }],
        },
      },
    } as any);

    session.handleMessage({
      serverContent: {
        modelTurn: {
          role: 'model',
          parts: [{ text: 'comment allez-vous?' }],
        },
      },
    } as any);

    // Turn complete
    session.handleMessage({
      serverContent: { turnComplete: true },
    } as any);

    expect(callbacks.onTextChunk).toHaveBeenCalledTimes(2);
    expect(callbacks.onTextChunk).toHaveBeenCalledWith('Bonjour, ');
    expect(callbacks.onTextChunk).toHaveBeenCalledWith('comment allez-vous?');
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith('Bonjour, comment allez-vous?');
  });

  it('dispatches audio chunks', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);

    session.handleMessage({
      serverContent: {
        modelTurn: {
          role: 'model',
          parts: [
            { inlineData: { data: 'audiobase64', mimeType: 'audio/pcm;rate=24000' } },
          ],
        },
      },
    } as any);

    expect(callbacks.onAudioChunk).toHaveBeenCalledWith('audiobase64', 'audio/pcm;rate=24000');
  });

  it('dispatches interrupted and resets accumulated text', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);

    // Accumulate some text
    session.handleMessage({
      serverContent: {
        modelTurn: { role: 'model', parts: [{ text: 'partial' }] },
      },
    } as any);

    // Interrupted
    session.handleMessage({
      serverContent: { interrupted: true },
    } as any);

    expect(callbacks.onInterrupted).toHaveBeenCalled();

    // Next turn should start fresh
    session.handleMessage({
      serverContent: {
        modelTurn: { role: 'model', parts: [{ text: 'fresh' }] },
      },
    } as any);
    session.handleMessage({
      serverContent: { turnComplete: true },
    } as any);

    expect(callbacks.onTurnComplete).toHaveBeenCalledWith('fresh');
  });

  it('does not send after close', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());
    session.close();
    mockSendClientContent.mockClear();
    mockSendRealtimeInput.mockClear();

    session.sendText('ignored');
    session.sendAudio('ignored', 'audio/pcm');

    expect(mockSendClientContent).not.toHaveBeenCalled();
    expect(mockSendRealtimeInput).not.toHaveBeenCalled();
  });

  it('dispatches input transcription', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);

    session.handleMessage({
      serverContent: {
        inputTranscription: { text: 'Bonjour monsieur', finished: true },
      },
    } as any);

    expect(callbacks.onTranscription).toHaveBeenCalledWith('Bonjour monsieur');
  });

  it('does not dispatch transcription when text is empty', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);

    session.handleMessage({
      serverContent: {
        inputTranscription: { text: '', finished: false },
      },
    } as any);

    expect(callbacks.onTranscription).not.toHaveBeenCalled();
  });

  it('dispatches generationComplete', async () => {
    const onGenerationComplete = vi.fn();
    const callbacks = makeCallbacks({ onGenerationComplete });
    const session = await manager.createSession(makeConfig(), callbacks);

    session.handleMessage({
      serverContent: { generationComplete: true },
    } as any);

    expect(onGenerationComplete).toHaveBeenCalled();
  });

  it('handles turnComplete and generationComplete in same message', async () => {
    const onGenerationComplete = vi.fn();
    const callbacks = makeCallbacks({ onGenerationComplete });
    const session = await manager.createSession(makeConfig(), callbacks);

    // Accumulate some text first
    session.handleMessage({
      serverContent: {
        modelTurn: { role: 'model', parts: [{ text: 'Au revoir!' }] },
      },
    } as any);

    // Both turnComplete and generationComplete in one message
    session.handleMessage({
      serverContent: { turnComplete: true, generationComplete: true },
    } as any);

    expect(callbacks.onTurnComplete).toHaveBeenCalledWith('Au revoir!');
    expect(onGenerationComplete).toHaveBeenCalled();
  });

  it('handles interleaved audio and text parts in a single message', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);

    session.handleMessage({
      serverContent: {
        modelTurn: {
          role: 'model',
          parts: [
            { text: 'Salut!' },
            { inlineData: { data: 'audio1', mimeType: 'audio/pcm;rate=24000' } },
            { text: ' Comment ça va?' },
            { inlineData: { data: 'audio2', mimeType: 'audio/pcm;rate=24000' } },
          ],
        },
      },
    } as any);

    expect(callbacks.onTextChunk).toHaveBeenCalledTimes(2);
    expect(callbacks.onTextChunk).toHaveBeenCalledWith('Salut!');
    expect(callbacks.onTextChunk).toHaveBeenCalledWith(' Comment ça va?');
    expect(callbacks.onAudioChunk).toHaveBeenCalledTimes(2);
    expect(callbacks.onAudioChunk).toHaveBeenCalledWith('audio1', 'audio/pcm;rate=24000');
    expect(callbacks.onAudioChunk).toHaveBeenCalledWith('audio2', 'audio/pcm;rate=24000');
  });

  it('defaults audio mimeType when not provided', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);

    session.handleMessage({
      serverContent: {
        modelTurn: {
          role: 'model',
          parts: [{ inlineData: { data: 'audiodata' } }],
        },
      },
    } as any);

    expect(callbacks.onAudioChunk).toHaveBeenCalledWith('audiodata', 'audio/pcm;rate=24000');
  });

  it('full round-trip: send text, receive audio+text, turn complete', async () => {
    const callbacks = makeCallbacks();
    const session = await manager.createSession(makeConfig(), callbacks);
    mockSendClientContent.mockClear();

    // Player sends text
    session.sendText('Bonjour!');
    expect(mockSendClientContent).toHaveBeenCalledWith({
      turns: [{ role: 'user', parts: [{ text: 'Bonjour!' }] }],
      turnComplete: true,
    });

    // Model responds with interleaved audio + text
    session.handleMessage({
      serverContent: {
        modelTurn: {
          role: 'model',
          parts: [
            { text: 'Bonjour! ' },
            { inlineData: { data: 'chunk1', mimeType: 'audio/pcm;rate=24000' } },
          ],
        },
      },
    } as any);

    session.handleMessage({
      serverContent: {
        modelTurn: {
          role: 'model',
          parts: [
            { text: 'Je suis Pierre.' },
            { inlineData: { data: 'chunk2', mimeType: 'audio/pcm;rate=24000' } },
          ],
        },
      },
    } as any);

    // Turn and generation complete
    session.handleMessage({
      serverContent: { turnComplete: true, generationComplete: true },
    } as any);

    // Verify all callbacks fired correctly
    expect(callbacks.onTextChunk).toHaveBeenCalledTimes(2);
    expect(callbacks.onAudioChunk).toHaveBeenCalledTimes(2);
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith('Bonjour! Je suis Pierre.');
    expect(callbacks.onGenerationComplete).toHaveBeenCalled();
  });

  it('sendAudio uses default mimeType when not provided', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());

    session.sendAudio('base64data');

    expect(mockSendRealtimeInput).toHaveBeenCalledWith({
      audio: { data: 'base64data', mimeType: 'audio/pcm;rate=16000' },
    });
  });

  it('updates lastActivity on sendText, sendAudio, and handleMessage', async () => {
    const session = await manager.createSession(makeConfig(), makeCallbacks());

    const initialIdle = session.idleMs;
    // idleMs should be very small right after creation
    expect(initialIdle).toBeLessThan(100);

    // Manually set lastActivity to the past
    (session as any).lastActivity = Date.now() - 5000;
    expect(session.idleMs).toBeGreaterThanOrEqual(4900);

    // sendText should reset
    session.sendText('test');
    expect(session.idleMs).toBeLessThan(100);

    // Set to past again and test sendAudio
    (session as any).lastActivity = Date.now() - 5000;
    session.sendAudio('data');
    expect(session.idleMs).toBeLessThan(100);

    // Set to past again and test handleMessage
    (session as any).lastActivity = Date.now() - 5000;
    session.handleMessage({ serverContent: { turnComplete: true } } as any);
    expect(session.idleMs).toBeLessThan(100);
  });
});
