/**
 * Tests for VoiceWebSocketClient — standalone WebSocket voice chat client.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceWebSocketClient, type VoiceWSCallbacks } from '../src/lib/voice-websocket-client';

// ─── Mock WebSocket ──────────────────────────────────────────────────────────

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;

  sent: string[] = [];

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
    // Auto-open unless suppressed for testing reconnect failures
    if (!MockWebSocket.suppressAutoOpen) {
      setTimeout(() => this.onopen?.(), 0);
    }
  }

  static suppressAutoOpen = false;

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  // Test helper: simulate server message
  simulateMessage(msg: Record<string, unknown>): void {
    this.onmessage?.({ data: JSON.stringify(msg) });
  }

  simulateError(): void {
    this.onerror?.();
  }
}

// ─── Setup ───────────────────────────────────────────────────────────────────

let originalWebSocket: typeof WebSocket;

beforeEach(() => {
  MockWebSocket.instances = [];
  MockWebSocket.suppressAutoOpen = false;
  originalWebSocket = globalThis.WebSocket as any;
  (globalThis as any).WebSocket = MockWebSocket;
  // Ensure window globals are available in test environment
  if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = {};
  }
  (globalThis as any).window.location = { protocol: 'https:', host: 'localhost:3000' };
  // Mock AudioContext for jitter buffer (must be a real constructor)
  class MockAudioContext {
    state = 'running';
    destination = {};
    decodeAudioData = vi.fn().mockResolvedValue({
      duration: 0.1, length: 4410, sampleRate: 44100, numberOfChannels: 1,
    });
    createBufferSource = vi.fn().mockReturnValue({
      buffer: null, connect: vi.fn(), start: vi.fn(), onended: null,
    });
    close = vi.fn().mockResolvedValue(undefined);
  }
  (globalThis as any).window.AudioContext = MockAudioContext;
  vi.useFakeTimers();
});

afterEach(() => {
  (globalThis as any).WebSocket = originalWebSocket;
  vi.useRealTimers();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('VoiceWebSocketClient', () => {
  function createClient(callbacks: VoiceWSCallbacks = {}) {
    return new VoiceWebSocketClient(callbacks, {
      pingIntervalMs: 10_000,
      reconnectDelayMs: 500,
      maxReconnectAttempts: 2,
      jitterBufferSize: 1,
    });
  }

  function getLastWS(): MockWebSocket {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }

  it('starts in disconnected state', () => {
    const client = createClient();
    expect(client.state).toBe('disconnected');
    expect(client.clientId).toBeNull();
    expect(client.roomId).toBeNull();
    expect(client.muted).toBe(false);
    expect(client.isCapturing).toBe(false);
    expect(client.isFallback).toBe(false);
    client.destroy();
  });

  it('connects and transitions to connected state', async () => {
    const onStateChange = vi.fn();
    const client = createClient({ onStateChange });

    client.connect();
    expect(client.state).toBe('connecting');
    expect(onStateChange).toHaveBeenCalledWith('connecting');

    // Trigger WebSocket open
    await vi.advanceTimersByTimeAsync(10);

    expect(client.state).toBe('connected');
    expect(onStateChange).toHaveBeenCalledWith('connected');
    client.destroy();
  });

  it('builds correct WebSocket URL', () => {
    const client = createClient();
    client.connect();

    expect(getLastWS().url).toBe('wss://localhost:3000/ws/voice');
    client.destroy();
  });

  it('joins room and transitions to in_room state', async () => {
    const onStateChange = vi.fn();
    const client = createClient({ onStateChange });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);

    client.joinRoom('room1', 'world1', 'char1');

    const ws = getLastWS();
    const joinMsg = JSON.parse(ws.sent[0]);
    expect(joinMsg).toEqual({
      type: 'join',
      roomId: 'room1',
      worldId: 'world1',
      characterId: 'char1',
    });

    // Simulate server confirmation
    ws.simulateMessage({
      type: 'joined',
      roomId: 'room1',
      clientId: 'vc_1',
      peers: [],
    });

    expect(client.state).toBe('in_room');
    expect(client.clientId).toBe('vc_1');
    expect(client.roomId).toBe('room1');
    client.destroy();
  });

  it('leaves room and returns to connected state', async () => {
    const client = createClient();

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    // Join room
    ws.simulateMessage({ type: 'joined', roomId: 'r1', clientId: 'c1', peers: [] });
    expect(client.state).toBe('in_room');

    client.leaveRoom();

    const leaveMsg = JSON.parse(ws.sent[0]);
    expect(leaveMsg).toEqual({ type: 'leave' });
    expect(client.state).toBe('connected');
    expect(client.roomId).toBeNull();
    client.destroy();
  });

  it('sends audio data', async () => {
    const client = createClient();

    client.connect();
    await vi.advanceTimersByTimeAsync(10);

    client.sendAudio('dGVzdA==');

    const ws = getLastWS();
    const msg = JSON.parse(ws.sent[0]);
    expect(msg).toEqual({ type: 'audio', data: 'dGVzdA==' });
    client.destroy();
  });

  it('does not send audio when muted', async () => {
    const client = createClient();

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    client.setMuted(true);
    expect(client.muted).toBe(true);

    // Mute message sent
    const muteMsg = JSON.parse(ws.sent[0]);
    expect(muteMsg).toEqual({ type: 'mute', muted: true });

    client.sendAudio('dGVzdA==');

    // No audio message sent (only the mute message)
    expect(ws.sent.length).toBe(1);
    client.destroy();
  });

  it('calls onAudio callback when audio received', async () => {
    const onAudio = vi.fn();
    const client = createClient({ onAudio });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    ws.simulateMessage({
      type: 'audio',
      fromClientId: 'peer1',
      data: 'YXVkaW8=',
    });

    expect(onAudio).toHaveBeenCalledWith('peer1', 'YXVkaW8=');
    client.destroy();
  });

  it('calls onTranscript callback when transcript received', async () => {
    const onTranscript = vi.fn();
    const client = createClient({ onTranscript });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    ws.simulateMessage({
      type: 'transcript',
      text: 'Hello world',
      isFinal: false,
    });

    expect(onTranscript).toHaveBeenCalledWith('Hello world', false);

    ws.simulateMessage({
      type: 'transcript',
      text: 'Hello world!',
      isFinal: true,
    });

    expect(onTranscript).toHaveBeenCalledWith('Hello world!', true);
    client.destroy();
  });

  it('calls onError callback on error message', async () => {
    const onError = vi.fn();
    const client = createClient({ onError });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    ws.simulateMessage({ type: 'error', message: 'Room is full' });

    expect(onError).toHaveBeenCalledWith('Room is full');
    client.destroy();
  });

  it('calls onError on WebSocket connection error', async () => {
    const onError = vi.fn();
    const client = createClient({ onError });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    ws.simulateError();

    expect(onError).toHaveBeenCalledWith('WebSocket connection error');
    client.destroy();
  });

  it('sends ping at configured interval', async () => {
    const client = createClient();

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    // Advance past ping interval
    await vi.advanceTimersByTimeAsync(10_000);

    const pingMsg = ws.sent.find(s => JSON.parse(s).type === 'ping');
    expect(pingMsg).toBeDefined();
    expect(JSON.parse(pingMsg!)).toEqual({ type: 'ping' });
    client.destroy();
  });

  it('attempts reconnection on unexpected close', async () => {
    const onStateChange = vi.fn();
    const client = createClient({ onStateChange });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    expect(client.state).toBe('connected');

    // Simulate unexpected close (readyState changes but we trigger the callback)
    const ws = getLastWS();
    ws.readyState = MockWebSocket.CLOSED;
    ws.onclose?.();
    expect(client.state).toBe('disconnected');

    // Advance past reconnect delay — triggers new connect()
    await vi.advanceTimersByTimeAsync(600);

    // Should have created a new WebSocket instance
    expect(MockWebSocket.instances.length).toBe(2);
    client.destroy();
  });

  it('falls back to HTTP after max reconnect attempts', async () => {
    const onFallbackToHTTP = vi.fn();
    const client = createClient({ onFallbackToHTTP });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);

    // Suppress auto-open so reconnected sockets don't reset the counter
    MockWebSocket.suppressAutoOpen = true;

    // Unexpected close → triggers reconnect attempt 1
    getLastWS().readyState = MockWebSocket.CLOSED;
    getLastWS().onclose?.();
    await vi.advanceTimersByTimeAsync(600);

    // Reconnect attempt 1 created, fails immediately
    getLastWS().readyState = MockWebSocket.CLOSED;
    getLastWS().onclose?.();
    await vi.advanceTimersByTimeAsync(600);

    // Reconnect attempt 2 created, fails immediately — exhausted
    getLastWS().readyState = MockWebSocket.CLOSED;
    getLastWS().onclose?.();

    expect(onFallbackToHTTP).toHaveBeenCalled();
    expect(client.isFallback).toBe(true);

    MockWebSocket.suppressAutoOpen = false;
    client.destroy();
  });

  it('does not reconnect on intentional disconnect', async () => {
    const client = createClient();

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    expect(client.state).toBe('connected');

    client.disconnect();
    expect(client.state).toBe('disconnected');

    // Advance well past reconnect delay
    await vi.advanceTimersByTimeAsync(5000);

    // Should NOT have created a new WebSocket
    expect(MockWebSocket.instances.length).toBe(1);
    client.destroy();
  });

  it('handles invalid JSON messages gracefully', async () => {
    const onError = vi.fn();
    const client = createClient({ onError });

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    // Send invalid JSON — should not throw
    ws.onmessage?.({ data: 'not json' });
    expect(onError).not.toHaveBeenCalled();
    client.destroy();
  });

  it('disconnect clears room state', async () => {
    const client = createClient();

    client.connect();
    await vi.advanceTimersByTimeAsync(10);
    const ws = getLastWS();

    ws.simulateMessage({ type: 'joined', roomId: 'r1', clientId: 'c1', peers: [] });
    expect(client.roomId).toBe('r1');

    client.disconnect();

    expect(client.roomId).toBeNull();
    expect(client.clientId).toBeNull();
    expect(client.state).toBe('disconnected');
  });

  it('ignores sendAudio when WebSocket not open', () => {
    const client = createClient();
    // Not connected — should not throw
    client.sendAudio('dGVzdA==');
    expect(MockWebSocket.instances.length).toBe(0);
    client.destroy();
  });
});
