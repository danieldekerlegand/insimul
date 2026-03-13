import { describe, it, expect } from 'vitest';
import {
  computeRMS,
  hasVoiceActivity,
  findVoiceBounds,
  audioBufferToWav,
} from '../src/lib/audio-utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Create a Float32Array of silence (all zeros). */
function makeSilence(length: number): Float32Array {
  return new Float32Array(length);
}

/** Create a Float32Array with a constant amplitude. */
function makeTone(length: number, amplitude: number): Float32Array {
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    buf[i] = amplitude * Math.sin((2 * Math.PI * 440 * i) / 48000);
  }
  return buf;
}

/** Create samples with silence, then voice, then silence. */
function makePaddedSpeech(
  leadingSilence: number,
  speechLen: number,
  trailingSilence: number,
  amplitude = 0.5,
): Float32Array {
  const total = leadingSilence + speechLen + trailingSilence;
  const buf = new Float32Array(total);
  for (let i = leadingSilence; i < leadingSilence + speechLen; i++) {
    buf[i] = amplitude * Math.sin((2 * Math.PI * 440 * i) / 48000);
  }
  return buf;
}

/** Minimal mock AudioBuffer for testing trimAudioBuffer / audioBufferToWav. */
function mockAudioBuffer(
  samples: Float32Array,
  sampleRate = 48000,
  numberOfChannels = 1,
): AudioBuffer {
  return {
    length: samples.length,
    sampleRate,
    numberOfChannels,
    duration: samples.length / sampleRate,
    getChannelData: (ch: number) => {
      if (ch !== 0) throw new Error('Only one channel mocked');
      return samples;
    },
  } as unknown as AudioBuffer;
}

// ─── computeRMS ──────────────────────────────────────────────────────────────

describe('computeRMS', () => {
  it('returns 0 for silence', () => {
    expect(computeRMS(makeSilence(1000))).toBe(0);
  });

  it('returns correct RMS for constant signal', () => {
    const samples = new Float32Array(100).fill(0.5);
    expect(computeRMS(samples)).toBeCloseTo(0.5, 5);
  });

  it('returns 0 for empty array', () => {
    expect(computeRMS(new Float32Array(0))).toBe(0);
  });

  it('respects start/end range', () => {
    const samples = new Float32Array(100);
    // Set only the second half to 0.5
    for (let i = 50; i < 100; i++) samples[i] = 0.5;
    expect(computeRMS(samples, 50, 100)).toBeCloseTo(0.5, 5);
    expect(computeRMS(samples, 0, 50)).toBe(0);
  });
});

// ─── hasVoiceActivity ────────────────────────────────────────────────────────

describe('hasVoiceActivity', () => {
  it('returns false for pure silence', () => {
    expect(hasVoiceActivity(makeSilence(5000))).toBe(false);
  });

  it('returns true for loud signal', () => {
    expect(hasVoiceActivity(makeTone(5000, 0.5))).toBe(true);
  });

  it('returns false for signal below threshold', () => {
    expect(hasVoiceActivity(makeTone(5000, 0.005), 0.01)).toBe(false);
  });

  it('detects short burst of speech in silence', () => {
    const samples = makePaddedSpeech(4000, 2400, 4000, 0.3);
    expect(hasVoiceActivity(samples, 0.01)).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(hasVoiceActivity(new Float32Array(0))).toBe(false);
  });
});

// ─── findVoiceBounds ─────────────────────────────────────────────────────────

describe('findVoiceBounds', () => {
  it('returns null for silence', () => {
    expect(findVoiceBounds(makeSilence(5000))).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(findVoiceBounds(new Float32Array(0))).toBeNull();
  });

  it('finds bounds of speech in the middle', () => {
    const leadingSilence = 4800;
    const speechLen = 9600;
    const trailingSilence = 4800;
    const samples = makePaddedSpeech(leadingSilence, speechLen, trailingSilence, 0.5);
    const bounds = findVoiceBounds(samples, 0.01);

    expect(bounds).not.toBeNull();
    const [start, end] = bounds!;
    // Start should be near the beginning of speech (within a window)
    expect(start).toBeLessThanOrEqual(leadingSilence);
    expect(start).toBeGreaterThanOrEqual(leadingSilence - 2400);
    // End should be near the end of speech (within a window)
    expect(end).toBeGreaterThanOrEqual(leadingSilence + speechLen);
    expect(end).toBeLessThanOrEqual(leadingSilence + speechLen + 2400);
  });

  it('entire buffer is speech', () => {
    const samples = makeTone(4800, 0.5);
    const bounds = findVoiceBounds(samples, 0.01);
    expect(bounds).not.toBeNull();
    const [start, end] = bounds!;
    expect(start).toBe(0);
    expect(end).toBe(samples.length);
  });
});

// ─── audioBufferToWav ────────────────────────────────────────────────────────

describe('audioBufferToWav', () => {
  it('produces a valid WAV blob', () => {
    const samples = makeTone(4800, 0.5);
    const buffer = mockAudioBuffer(samples);
    const blob = audioBufferToWav(buffer);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/wav');
    // WAV = 44 bytes header + numSamples * 2 bytes (16-bit)
    expect(blob.size).toBe(44 + 4800 * 2);
  });

  it('handles empty buffer', () => {
    const samples = new Float32Array(0);
    const buffer = mockAudioBuffer(samples);
    const blob = audioBufferToWav(buffer);

    expect(blob.size).toBe(44); // Header only
  });
});
