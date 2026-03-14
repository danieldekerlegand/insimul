import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HandsFreeController, type HandsFreeCallbacks } from '../src/lib/hands-free-controller';

// --- Web Audio API mocks (same pattern as voice-activity-detector tests) ---

class MockAnalyserNode {
  fftSize = 2048;
  private _timeDomainData: Float32Array = new Float32Array(2048);

  _setTimeDomainData(data: Float32Array) {
    this._timeDomainData = data;
  }

  getFloatTimeDomainData(array: Float32Array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = i < this._timeDomainData.length ? this._timeDomainData[i] : 0;
    }
  }
}

class MockMediaStreamSource {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockAudioContext {
  state = 'running';
  createMediaStreamSource = vi.fn(() => new MockMediaStreamSource());
  createAnalyser = vi.fn(() => new MockAnalyserNode());
  close = vi.fn(async () => { this.state = 'closed'; });
}

const mockTrack = { stop: vi.fn() };
const mockStream = { getTracks: () => [mockTrack] } as unknown as MediaStream;

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);

// Mock SpeechRecognition
let capturedSpeechCallbacks: Record<string, Function> = {};

vi.mock('../src/lib/speech-recognition', () => {
  return {
    isSpeechRecognitionSupported: vi.fn(() => true),
    SpeechRecognitionService: class {
      start = vi.fn();
      stop = vi.fn();
      dispose = vi.fn();
      isListening = false;
      constructor(opts: any) {
        capturedSpeechCallbacks = {
          onInterimResult: opts.onInterimResult,
          onFinalResult: opts.onFinalResult,
          onError: opts.onError,
          onEnd: opts.onEnd,
        };
      }
    },
    serverSideSTT: vi.fn(),
  };
});

// Inject globals
(globalThis as any).window = {
  AudioContext: MockAudioContext,
};

// navigator is a getter on globalThis, so use defineProperty
Object.defineProperty(globalThis, 'navigator', {
  value: { mediaDevices: { getUserMedia: mockGetUserMedia } },
  writable: true,
  configurable: true,
});

function toneData(amplitude: number, length = 2048): Float32Array {
  const arr = new Float32Array(length);
  arr.fill(amplitude);
  return arr;
}

function getMockAnalyser(controller: HandsFreeController): MockAnalyserNode {
  const vad = (controller as any).vad;
  return vad ? (vad as any).analyser as MockAnalyserNode : null!;
}

function makeCallbacks(overrides: Partial<HandsFreeCallbacks> = {}): HandsFreeCallbacks {
  return {
    onTranscript: vi.fn(),
    onInterimTranscript: vi.fn(),
    onEnergyChange: vi.fn(),
    onSpeechStart: vi.fn(),
    onSpeechEnd: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

describe('HandsFreeController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetUserMedia.mockClear();
    mockTrack.stop.mockClear();
    capturedSpeechCallbacks = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start and open the microphone', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);

    expect(controller.isActive).toBe(false);
    await controller.start();
    expect(controller.isActive).toBe(true);
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });

    controller.stop();
  });

  it('should report error when mic access is denied', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('NotAllowedError'));
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);

    await controller.start();
    expect(callbacks.onError).toHaveBeenCalledWith('Microphone access denied');
    expect(controller.isActive).toBe(false);
  });

  it('should stop and release the microphone', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);

    await controller.start();
    controller.stop();

    expect(controller.isActive).toBe(false);
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('should trigger onSpeechStart when VAD detects speech', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);
    await controller.start();

    const analyser = getMockAnalyser(controller);
    // Simulate speech (amplitude 0.1 → RMS well above 0.015 threshold)
    analyser._setTimeDomainData(toneData(0.1));

    vi.advanceTimersByTime(50); // one VAD poll
    expect(callbacks.onSpeechStart).toHaveBeenCalled();
    expect(controller.isRecognising).toBe(true);

    controller.stop();
  });

  it('should deliver transcript when speech ends after silence', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);
    await controller.start();

    const analyser = getMockAnalyser(controller);

    // Speech start
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);
    expect(callbacks.onSpeechStart).toHaveBeenCalled();

    // Simulate speech recognition delivering a final result
    capturedSpeechCallbacks.onFinalResult?.('hello world');

    // Silence for 1.5s
    analyser._setTimeDomainData(toneData(0.0));
    vi.advanceTimersByTime(1600);

    expect(callbacks.onSpeechEnd).toHaveBeenCalled();
    expect(callbacks.onTranscript).toHaveBeenCalledWith('hello world');

    controller.stop();
  });

  it('should deliver interim transcript from speech recognition', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);
    await controller.start();

    const analyser = getMockAnalyser(controller);

    // Speech start
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);

    // Simulate interim result
    capturedSpeechCallbacks.onInterimResult?.('hel');
    expect(callbacks.onInterimTranscript).toHaveBeenCalledWith('hel');

    controller.stop();
  });

  it('should report energy changes via callback', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);
    await controller.start();

    const analyser = getMockAnalyser(controller);
    analyser._setTimeDomainData(toneData(0.05));
    vi.advanceTimersByTime(50);

    expect(callbacks.onEnergyChange).toHaveBeenCalled();
    const energy = (callbacks.onEnergyChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(energy).toBeCloseTo(0.05, 2);

    controller.stop();
  });

  it('should not deliver empty transcript', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);
    await controller.start();

    const analyser = getMockAnalyser(controller);

    // Speech start with no actual recognition result
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);

    // Silence → speech end, but no transcript was produced
    analyser._setTimeDomainData(toneData(0.0));
    vi.advanceTimersByTime(1600);

    expect(callbacks.onSpeechEnd).toHaveBeenCalled();
    expect(callbacks.onTranscript).not.toHaveBeenCalled();

    controller.stop();
  });

  it('should not start if already active', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);

    await controller.start();
    await controller.start(); // second call should be no-op

    expect(mockGetUserMedia).toHaveBeenCalledTimes(1);

    controller.stop();
  });

  it('should handle multiple speech cycles', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);
    await controller.start();

    const analyser = getMockAnalyser(controller);

    // First speech cycle
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);
    capturedSpeechCallbacks.onFinalResult?.('first');
    analyser._setTimeDomainData(toneData(0.0));
    vi.advanceTimersByTime(1600);

    expect(callbacks.onTranscript).toHaveBeenCalledWith('first');

    // Second speech cycle
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);
    capturedSpeechCallbacks.onFinalResult?.('second');
    analyser._setTimeDomainData(toneData(0.0));
    vi.advanceTimersByTime(1600);

    expect(callbacks.onTranscript).toHaveBeenCalledWith('second');
    expect(callbacks.onTranscript).toHaveBeenCalledTimes(2);

    controller.stop();
  });

  it('should use interim text as fallback when no final result', async () => {
    const callbacks = makeCallbacks();
    const controller = new HandsFreeController(callbacks);
    await controller.start();

    const analyser = getMockAnalyser(controller);

    // Speech start
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);

    // Only interim result, no final
    capturedSpeechCallbacks.onInterimResult?.('partial text');

    // Silence
    analyser._setTimeDomainData(toneData(0.0));
    vi.advanceTimersByTime(1600);

    // Should fall back to interim text
    expect(callbacks.onTranscript).toHaveBeenCalledWith('partial text');

    controller.stop();
  });
});
