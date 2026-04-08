import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import { NpcAudioLock } from '../game-engine/rendering/NpcAudioLock';
import { NPCAmbientConversationManager, type ConversationProvider, type AmbientConversationLine } from '../game-engine/rendering/NPCAmbientConversationManager';

// The manager uses window.setInterval/clearInterval which doesn't exist in Node
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// ── Mock StreamingAudioPlayer ──────────────────────────────────────────
// Mock before importing the module so vitest intercepts the import

let mockPlayerInstances: any[] = [];

vi.mock('../game-engine/rendering/StreamingAudioPlayer', () => ({
  StreamingAudioPlayer: vi.fn().mockImplementation(function(_opts: any) {
    let completeCb: (() => void) | undefined;
    const instance = {
      pushChunk: vi.fn(),
      finish: vi.fn().mockImplementation(() => {
        // Simulate playback completing immediately after finish() is called
        if (completeCb) Promise.resolve().then(completeCb);
      }),
      stop: vi.fn(),
      dispose: vi.fn(),
      setCallbacks: vi.fn().mockImplementation((cbs: any) => {
        completeCb = cbs.onComplete;
      }),
      setNpcPosition: vi.fn(),
      setListenerPosition: vi.fn(),
    };
    mockPlayerInstances.push(instance);
    return instance;
  }),
}));

// ── Mock fetch for TTS ─────────────────────────────────────────────────

const fakeTTSBuffer = new Uint8Array([0x49, 0x44, 0x33]).buffer; // minimal MP3 header bytes

// ── Helpers ────────────────────────────────────────────────────────────

function makeMockMesh(position: Vector3): any {
  return {
    position: position.clone(),
    rotation: { y: 0 },
    isEnabled: () => true,
  };
}

function makeMockScene(): any {
  return {};
}

function makeMockTalkingIndicator(): any {
  return {
    show: vi.fn(),
    hide: vi.fn(),
    updateText: vi.fn(),
    setGUI: vi.fn(),
  };
}

function makeSampleLines(npc1Id: string, npc2Id: string, count = 4): AmbientConversationLine[] {
  const lines: AmbientConversationLine[] = [];
  for (let i = 0; i < count; i++) {
    const isNpc1 = i % 2 === 0;
    lines.push({
      speakerId: isNpc1 ? npc1Id : npc2Id,
      speakerName: isNpc1 ? 'Alice' : 'Bob',
      text: `Line ${i + 1} from ${isNpc1 ? 'Alice' : 'Bob'}`,
      gender: isNpc1 ? 'female' : 'male',
    });
  }
  return lines;
}

describe('NPCAmbientConversationManager — US-005 streamed TTS playback', () => {
  let manager: NPCAmbientConversationManager;
  let lock: NpcAudioLock;
  let scene: any;
  let indicator: any;
  let animCb: ReturnType<typeof vi.fn>;
  let conversationProvider: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockPlayerInstances = [];

    lock = new NpcAudioLock();
    scene = makeMockScene();
    indicator = makeMockTalkingIndicator();
    animCb = vi.fn();
    conversationProvider = vi.fn();

    manager = new NPCAmbientConversationManager(scene, 'world1', indicator);
    manager.setAudioLock(lock);
    manager.setAnimationCallback(animCb);
    manager.setServerUrl('http://test-server');
    manager.setConversationProvider(conversationProvider);
    manager.setTargetLanguage('French');
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── Conversation provider is called with maxExchanges ──

  it('calls conversationProvider with maxExchanges between 3-5', async () => {
    const lines = makeSampleLines('a', 'b', 4);
    conversationProvider.mockResolvedValue(lines);

    // Mock fetch for TTS
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    }));


    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    // Let the async conversation start
    await vi.advanceTimersByTimeAsync(100);

    expect(conversationProvider).toHaveBeenCalledTimes(1);
    const callArgs = conversationProvider.mock.calls[0];
    expect(callArgs[0]).toBe('a'); // npc1Id
    expect(callArgs[1]).toBe('b'); // npc2Id
    // maxExchanges should be 3, 4, or 5
    expect(callArgs[2]).toBeGreaterThanOrEqual(3);
    expect(callArgs[2]).toBeLessThanOrEqual(5);
    expect(callArgs[3]).toBeInstanceOf(AbortSignal); // signal
  });

  // ── TTS called for each line ──

  it('calls TTS endpoint for each conversation line', async () => {
    const lines = makeSampleLines('a', 'b', 3);
    conversationProvider.mockResolvedValue(lines);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    });
    vi.stubGlobal('fetch', fetchMock);



    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    // Process all async operations and pauses
    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(600);
    }

    // TTS should be called once per line
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // Each call should be to the TTS endpoint
    for (const call of fetchMock.mock.calls) {
      expect(call[0]).toBe('http://test-server/api/tts');
    }
  });

  // ── Sequential playback (StreamingAudioPlayer created per line) ──

  it('creates a StreamingAudioPlayer for each line (sequential)', async () => {
    const lines = makeSampleLines('a', 'b', 3);
    conversationProvider.mockResolvedValue(lines);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    }));



    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(600);
    }

    // One player per line
    expect(mockPlayerInstances.length).toBe(3);
  });

  // ── No speech bubbles in streamed mode ──

  it('does not show speech bubbles (talkingIndicator) during streamed conversation', async () => {
    const lines = makeSampleLines('a', 'b', 2);
    conversationProvider.mockResolvedValue(lines);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    }));



    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(600);
    }

    // talkingIndicator.show should NOT be called during streamed conversation
    // (it's only called in the fallback timer-based path)
    expect(indicator.show).not.toHaveBeenCalled();
  });

  // ── Animations alternate based on speaker ──

  it('sets talk animation for speaker and idle for listener on each line', async () => {
    const lines = makeSampleLines('a', 'b', 2);
    conversationProvider.mockResolvedValue(lines);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    }));



    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();

    // Advance in smaller steps to ensure microtasks and timers interleave properly
    for (let i = 0; i < 15; i++) {
      await vi.advanceTimersByTimeAsync(500);
    }

    // First line: Alice (a) talks, Bob (b) idles
    // Second line: Bob (b) talks, Alice (a) idles
    const talkCalls = animCb.mock.calls.filter((c: any[]) => c[1] === 'talk');
    const idleCalls = animCb.mock.calls.filter((c: any[]) => c[1] === 'idle');

    expect(talkCalls.some((c: any[]) => c[0] === 'a')).toBe(true);
    expect(talkCalls.some((c: any[]) => c[0] === 'b')).toBe(true);
    expect(idleCalls.length).toBeGreaterThanOrEqual(2);
  });

  // ── Audio lock released after conversation finishes ──

  it('releases audio lock when all lines finish playing', async () => {
    const lines = makeSampleLines('a', 'b', 2);
    conversationProvider.mockResolvedValue(lines);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    }));



    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    // Lock should be acquired
    expect(lock.isLocked()).toBe(true);
    expect(lock.currentOwner).toBe('ambient');

    // Process all lines
    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(600);
    }

    // Lock should be released after conversation ends
    expect(lock.isLocked()).toBe(false);
    expect(manager.getActiveConversationCount()).toBe(0);
  });

  // ── Conversation ends naturally without timer expiry ──

  it('streamed conversations do not expire by timer', async () => {
    const lines = makeSampleLines('a', 'b', 2);
    // Provider returns slowly — we'll resolve it manually
    let resolveProvider: (val: AmbientConversationLine[]) => void;
    conversationProvider.mockImplementation(() =>
      new Promise<AmbientConversationLine[]>(r => { resolveProvider = r; })
    );

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    }));

    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(1);

    // Advance past the old 20s timer
    vi.advanceTimersByTime(25000);

    // Streamed conversation should still be active (not expired by timer)
    expect(manager.getActiveConversationCount()).toBe(1);
  });

  // ── Empty conversation from provider ──

  it('ends conversation and releases lock when provider returns empty lines', async () => {
    conversationProvider.mockResolvedValue([]);

    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    await vi.advanceTimersByTimeAsync(100);

    expect(manager.getActiveConversationCount()).toBe(0);
    expect(lock.isLocked()).toBe(false);
  });

  // ── TTS failure skips line silently ──

  it('skips line silently when TTS fails', async () => {
    const lines = makeSampleLines('a', 'b', 2);
    conversationProvider.mockResolvedValue(lines);

    // TTS fails for all requests
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }));

    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(600);
    }

    // No audio players created since TTS failed
    expect(mockPlayerInstances.length).toBe(0);
    // Conversation should still complete and clean up
    expect(lock.isLocked()).toBe(false);
  });

  // ── Fallback mode without provider ──

  it('uses timer-based animation when no conversation provider is set', () => {
    // Create a new manager without conversation provider
    const mgr = new NPCAmbientConversationManager(scene, 'world2', indicator);
    mgr.setAudioLock(lock);
    mgr.setAnimationCallback(animCb);

    mgr.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    mgr.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    mgr.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    mgr.start();
    vi.advanceTimersByTime(5000);

    expect(mgr.getActiveConversationCount()).toBe(1);
    // Should use talkingIndicator in fallback mode
    expect(indicator.show).toHaveBeenCalled();

    mgr.dispose();
  });

  // ── Abort on stop ──

  it('aborts in-progress streamed conversation when manager is stopped', async () => {
    let resolveProvider: (val: AmbientConversationLine[]) => void;
    conversationProvider.mockImplementation(() =>
      new Promise<AmbientConversationLine[]>(r => { resolveProvider = r; })
    );

    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(1);

    // Stop the manager — should abort the in-progress conversation
    manager.stop();

    expect(manager.getActiveConversationCount()).toBe(0);
    expect(lock.isLocked()).toBe(false);
  });

  // ── Gender-matched voice selection ──

  it('passes correct gender to TTS for each speaker', async () => {
    const lines: AmbientConversationLine[] = [
      { speakerId: 'a', speakerName: 'Alice', text: 'Bonjour!', gender: 'female' },
      { speakerId: 'b', speakerName: 'Bob', text: 'Salut!', gender: 'male' },
    ];
    conversationProvider.mockResolvedValue(lines);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeTTSBuffer),
    });
    vi.stubGlobal('fetch', fetchMock);



    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle', 'female', 28);
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle', 'male', 35);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    manager.start();

    // Advance in smaller steps to ensure microtasks and timers interleave properly
    for (let i = 0; i < 15; i++) {
      await vi.advanceTimersByTimeAsync(500);
    }

    expect(fetchMock).toHaveBeenCalledTimes(2);
    // First call: Alice (female)
    const body1 = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body1.gender).toBe('female');
    // Second call: Bob (male)
    const body2 = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body2.gender).toBe('male');
  });
});
