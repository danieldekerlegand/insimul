import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceActivityDetector, type VADOptions } from '../src/lib/audio-utils';

// --- Web Audio API mocks ---

class MockAnalyserNode {
  fftSize = 2048;
  private _timeDomainData: Float32Array = new Float32Array(2048);

  /** Test helper: set the fake waveform data returned by getFloatTimeDomainData */
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

// Inject mock AudioContext globally
(globalThis as any).window = {
  AudioContext: MockAudioContext,
};

function fakeStream(): MediaStream {
  return {} as MediaStream;
}

/** Generate a Float32Array filled with a constant amplitude (simulates a tone). */
function toneData(amplitude: number, length = 2048): Float32Array {
  const arr = new Float32Array(length);
  arr.fill(amplitude);
  return arr;
}

/** Get the mock analyser from inside the VAD (via the mock AudioContext chain). */
function getMockAnalyser(vad: VoiceActivityDetector): MockAnalyserNode {
  // After start(), the audioContext mock's createAnalyser was called.
  // We access it through the prototype chain. The simplest approach:
  // access the private field via cast.
  return (vad as any).analyser as MockAnalyserNode;
}

describe('VoiceActivityDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize in non-speaking state', () => {
    const vad = new VoiceActivityDetector();
    expect(vad.isSpeaking).toBe(false);
  });

  it('should detect speech start when energy exceeds threshold', () => {
    const onSpeechStart = vi.fn();
    const vad = new VoiceActivityDetector({ onSpeechStart, pollIntervalMs: 50 });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);
    // Simulate loud audio (amplitude 0.1 → RMS ≈ 0.1, well above default 0.015)
    analyser._setTimeDomainData(toneData(0.1));

    // Advance past one poll interval
    vi.advanceTimersByTime(50);

    expect(onSpeechStart).toHaveBeenCalledOnce();
    expect(vad.isSpeaking).toBe(true);

    vad.destroy();
  });

  it('should not fire speech start for quiet audio', () => {
    const onSpeechStart = vi.fn();
    const vad = new VoiceActivityDetector({ onSpeechStart, pollIntervalMs: 50 });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);
    // Very quiet — RMS ≈ 0.001, below threshold
    analyser._setTimeDomainData(toneData(0.001));

    vi.advanceTimersByTime(50);

    expect(onSpeechStart).not.toHaveBeenCalled();
    expect(vad.isSpeaking).toBe(false);

    vad.destroy();
  });

  it('should detect speech end after silence duration', () => {
    const onSpeechStart = vi.fn();
    const onSpeechEnd = vi.fn();
    const vad = new VoiceActivityDetector({
      onSpeechStart,
      onSpeechEnd,
      silenceDuration: 1.5,
      pollIntervalMs: 50,
    });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);

    // Phase 1: Speech detected
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);
    expect(vad.isSpeaking).toBe(true);

    // Phase 2: Go silent
    analyser._setTimeDomainData(toneData(0.001));

    // Advance 1 second — not enough for 1.5s silence duration
    vi.advanceTimersByTime(1000);
    expect(onSpeechEnd).not.toHaveBeenCalled();
    expect(vad.isSpeaking).toBe(true);

    // Advance another 600ms — now past 1.5s total silence
    vi.advanceTimersByTime(600);
    expect(onSpeechEnd).toHaveBeenCalledOnce();
    expect(vad.isSpeaking).toBe(false);

    vad.destroy();
  });

  it('should reset silence timer if speech resumes before duration', () => {
    const onSpeechEnd = vi.fn();
    const vad = new VoiceActivityDetector({
      onSpeechEnd,
      silenceDuration: 1.5,
      pollIntervalMs: 50,
    });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);

    // Start speaking
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);

    // Brief silence (1 second)
    analyser._setTimeDomainData(toneData(0.001));
    vi.advanceTimersByTime(1000);

    // Resume speaking before 1.5s silence elapses
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);

    // Go silent again — timer should restart from zero
    analyser._setTimeDomainData(toneData(0.001));
    vi.advanceTimersByTime(1000);
    expect(onSpeechEnd).not.toHaveBeenCalled();

    // Now complete the full 1.5s of silence
    vi.advanceTimersByTime(600);
    expect(onSpeechEnd).toHaveBeenCalledOnce();

    vad.destroy();
  });

  it('should fire onEnergyChange with each poll', () => {
    const onEnergyChange = vi.fn();
    const vad = new VoiceActivityDetector({ onEnergyChange, pollIntervalMs: 50 });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);
    analyser._setTimeDomainData(toneData(0.05));

    vi.advanceTimersByTime(150); // 3 polls

    expect(onEnergyChange).toHaveBeenCalledTimes(3);
    // RMS of constant 0.05 signal = 0.05
    expect(onEnergyChange.mock.calls[0][0]).toBeCloseTo(0.05, 2);

    vad.destroy();
  });

  it('should not fire speechStart more than once for continuous speech', () => {
    const onSpeechStart = vi.fn();
    const vad = new VoiceActivityDetector({ onSpeechStart, pollIntervalMs: 50 });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);
    analyser._setTimeDomainData(toneData(0.1));

    // Multiple polls with continuous speech
    vi.advanceTimersByTime(250); // 5 polls

    expect(onSpeechStart).toHaveBeenCalledOnce();

    vad.destroy();
  });

  it('should clean up on destroy', () => {
    const vad = new VoiceActivityDetector({ pollIntervalMs: 50 });
    vad.start(fakeStream());

    expect(vad.isSpeaking).toBe(false);
    vad.destroy();

    // Should not throw on double destroy
    vad.destroy();

    expect(vad.isSpeaking).toBe(false);
  });

  it('should support custom speech threshold', () => {
    const onSpeechStart = vi.fn();
    const vad = new VoiceActivityDetector({
      onSpeechStart,
      speechThreshold: 0.1,
      pollIntervalMs: 50,
    });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);

    // amplitude 0.05 → RMS 0.05, below custom threshold of 0.1
    analyser._setTimeDomainData(toneData(0.05));
    vi.advanceTimersByTime(50);
    expect(onSpeechStart).not.toHaveBeenCalled();

    // amplitude 0.15 → RMS 0.15, above threshold
    analyser._setTimeDomainData(toneData(0.15));
    vi.advanceTimersByTime(50);
    expect(onSpeechStart).toHaveBeenCalledOnce();

    vad.destroy();
  });

  it('should allow multiple speech start/end cycles', () => {
    const onSpeechStart = vi.fn();
    const onSpeechEnd = vi.fn();
    const vad = new VoiceActivityDetector({
      onSpeechStart,
      onSpeechEnd,
      silenceDuration: 0.5,
      pollIntervalMs: 50,
    });
    vad.start(fakeStream());

    const analyser = getMockAnalyser(vad);

    // Cycle 1: speak then silence
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);
    analyser._setTimeDomainData(toneData(0.001));
    vi.advanceTimersByTime(600);

    expect(onSpeechStart).toHaveBeenCalledTimes(1);
    expect(onSpeechEnd).toHaveBeenCalledTimes(1);

    // Cycle 2: speak again then silence
    analyser._setTimeDomainData(toneData(0.1));
    vi.advanceTimersByTime(50);
    analyser._setTimeDomainData(toneData(0.001));
    vi.advanceTimersByTime(600);

    expect(onSpeechStart).toHaveBeenCalledTimes(2);
    expect(onSpeechEnd).toHaveBeenCalledTimes(2);

    vad.destroy();
  });
});
