/**
 * Tests for the Web Speech API wrapper (speech-recognition.ts)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SpeechRecognitionService,
  isSpeechRecognitionSupported,
} from '@/lib/speech-recognition';

// Mock SpeechRecognition instance
let mockInstance: any;

class MockSpeechRecognition {
  lang = '';
  interimResults = false;
  continuous = false;
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    mockInstance = this;
  }

  start() {
    this.onstart?.();
  }
  stop() {
    this.onend?.();
  }
  abort() {}
}

// Track calls with spies
const startSpy = vi.spyOn(MockSpeechRecognition.prototype, 'start');
const stopSpy = vi.spyOn(MockSpeechRecognition.prototype, 'stop');
const abortSpy = vi.spyOn(MockSpeechRecognition.prototype, 'abort');

describe('isSpeechRecognitionSupported', () => {
  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('returns true when SpeechRecognition is available', () => {
    (globalThis as any).window = { SpeechRecognition: MockSpeechRecognition };
    expect(isSpeechRecognitionSupported()).toBe(true);
  });

  it('returns true when webkitSpeechRecognition is available', () => {
    (globalThis as any).window = { webkitSpeechRecognition: MockSpeechRecognition };
    expect(isSpeechRecognitionSupported()).toBe(true);
  });

  it('returns false when neither is available', () => {
    (globalThis as any).window = {};
    expect(isSpeechRecognitionSupported()).toBe(false);
  });
});

describe('SpeechRecognitionService', () => {
  beforeEach(() => {
    mockInstance = null;
    startSpy.mockClear();
    stopSpy.mockClear();
    abortSpy.mockClear();
    (globalThis as any).window = {
      SpeechRecognition: MockSpeechRecognition,
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('starts listening and sets isListening', () => {
    const service = new SpeechRecognitionService();
    expect(service.isListening).toBe(false);

    service.start();
    expect(startSpy).toHaveBeenCalled();
    expect(service.isListening).toBe(true);
  });

  it('sets correct language and options', () => {
    const service = new SpeechRecognitionService({
      lang: 'es-ES',
      continuous: true,
      interimResults: false,
    });
    service.start();

    expect(mockInstance.lang).toBe('es-ES');
    expect(mockInstance.continuous).toBe(true);
    expect(mockInstance.interimResults).toBe(false);
  });

  it('calls onInterimResult for non-final results', () => {
    const onInterimResult = vi.fn();
    const service = new SpeechRecognitionService({ onInterimResult });
    service.start();

    mockInstance.onresult?.({
      resultIndex: 0,
      results: {
        length: 1,
        0: { isFinal: false, 0: { transcript: 'hello' }, length: 1 },
      },
    });

    expect(onInterimResult).toHaveBeenCalledWith('hello');
  });

  it('calls onFinalResult for final results', () => {
    const onFinalResult = vi.fn();
    const service = new SpeechRecognitionService({ onFinalResult });
    service.start();

    mockInstance.onresult?.({
      resultIndex: 0,
      results: {
        length: 1,
        0: { isFinal: true, 0: { transcript: 'hello world' }, length: 1 },
      },
    });

    expect(onFinalResult).toHaveBeenCalledWith('hello world');
  });

  it('calls onError for real errors (not no-speech)', () => {
    const onError = vi.fn();
    const service = new SpeechRecognitionService({ onError });
    service.start();

    // no-speech and aborted are not real errors
    mockInstance.onerror?.({ error: 'no-speech' });
    expect(onError).not.toHaveBeenCalled();

    mockInstance.onerror?.({ error: 'aborted' });
    expect(onError).not.toHaveBeenCalled();

    // network error is real
    mockInstance.onerror?.({ error: 'network' });
    expect(onError).toHaveBeenCalledWith('network');
  });

  it('calls onEnd and resets isListening when recognition ends', () => {
    const onEnd = vi.fn();
    const service = new SpeechRecognitionService({ onEnd });
    service.start();
    expect(service.isListening).toBe(true);

    mockInstance.onend?.();
    expect(service.isListening).toBe(false);
    expect(onEnd).toHaveBeenCalled();
  });

  it('stop() calls recognition.stop()', () => {
    const service = new SpeechRecognitionService();
    service.start();
    service.stop();

    expect(stopSpy).toHaveBeenCalled();
  });

  it('abort() calls recognition.abort()', () => {
    const service = new SpeechRecognitionService();
    service.start();
    service.abort();

    expect(abortSpy).toHaveBeenCalled();
    expect(service.isListening).toBe(false);
  });

  it('does nothing when start() called while already listening', () => {
    const service = new SpeechRecognitionService();
    service.start();
    service.start(); // second call

    // start should only be called once because service is already listening
    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  it('updateOptions changes language on active instance', () => {
    const service = new SpeechRecognitionService({ lang: 'en-US' });
    service.start();
    expect(mockInstance.lang).toBe('en-US');

    service.updateOptions({ lang: 'fr-FR' });
    expect(mockInstance.lang).toBe('fr-FR');
  });

  it('dispose cleans up resources', () => {
    const service = new SpeechRecognitionService();
    service.start();
    service.dispose();

    expect(abortSpy).toHaveBeenCalled();
    expect(service.isListening).toBe(false);
  });

  it('isSupported reflects window availability', () => {
    const service = new SpeechRecognitionService();
    expect(service.isSupported).toBe(true);
  });

  it('handles multiple results in a single event', () => {
    const onInterimResult = vi.fn();
    const onFinalResult = vi.fn();
    const service = new SpeechRecognitionService({ onInterimResult, onFinalResult });
    service.start();

    mockInstance.onresult?.({
      resultIndex: 0,
      results: {
        length: 2,
        0: { isFinal: true, 0: { transcript: 'hello ' }, length: 1 },
        1: { isFinal: false, 0: { transcript: 'wor' }, length: 1 },
      },
    });

    expect(onFinalResult).toHaveBeenCalledWith('hello ');
    expect(onInterimResult).toHaveBeenCalledWith('wor');
  });
});

describe('SpeechRecognitionService without browser support', () => {
  beforeEach(() => {
    (globalThis as any).window = {};
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('calls onError when API is not available', () => {
    const onError = vi.fn();
    const service = new SpeechRecognitionService({ onError });
    service.start();

    expect(onError).toHaveBeenCalledWith(
      'Web Speech API not supported in this browser',
    );
  });

  it('isSupported returns false', () => {
    const service = new SpeechRecognitionService();
    expect(service.isSupported).toBe(false);
  });
});
