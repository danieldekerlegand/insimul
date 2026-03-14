/**
 * Tests for BabylonChatPanel Web Speech API integration.
 * Tests browser TTS (SpeechSynthesis) behavior and speech cleanup.
 * BabylonChatPanel is tightly coupled to Babylon.js GUI, so we test
 * the speech logic patterns directly.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SpeechRecognitionService,
  isSpeechRecognitionSupported,
} from '@/lib/speech-recognition';

// --- Mock SpeechSynthesis ---

let mockUtteranceHandlers: Record<string, ((...args: any[]) => void) | null>;
let mockSpeakCalls: any[];
let mockCancelCalls: number;

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: any = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
    // Store handlers for test access
    mockUtteranceHandlers = {
      get onend() { return mockSpeakCalls[mockSpeakCalls.length - 1]?.utterance?.onend ?? null; },
      get onerror() { return mockSpeakCalls[mockSpeakCalls.length - 1]?.utterance?.onerror ?? null; },
    };
  }
}

function setupSpeechSynthesisMock() {
  mockSpeakCalls = [];
  mockCancelCalls = 0;

  (globalThis as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  (globalThis as any).speechSynthesis = {
    speak: (utterance: any) => {
      mockSpeakCalls.push({ utterance });
    },
    cancel: () => {
      mockCancelCalls++;
    },
    getVoices: () => [],
  };
}

// --- Mock SpeechRecognition ---

let mockRecognitionInstance: any;

class MockSpeechRecognition {
  lang = '';
  interimResults = false;
  continuous = false;
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    mockRecognitionInstance = this;
  }

  start() { this.onstart?.(); }
  stop() { this.onend?.(); }
  abort() { this.onend?.(); }
}

describe('Browser SpeechSynthesis (TTS) integration patterns', () => {
  beforeEach(() => {
    setupSpeechSynthesisMock();
    (globalThis as any).window = {
      ...((globalThis as any).window || {}),
      speechSynthesis: (globalThis as any).speechSynthesis,
    };
  });

  afterEach(() => {
    delete (globalThis as any).SpeechSynthesisUtterance;
    delete (globalThis as any).speechSynthesis;
  });

  it('browserTextToSpeech resolves when utterance ends', async () => {
    // Simulate the pattern used in BabylonChatPanel.browserTextToSpeech
    const browserTTS = (text: string): Promise<void> => {
      if (!('speechSynthesis' in globalThis)) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const utterance = new (globalThis as any).SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        (globalThis as any).speechSynthesis.speak(utterance);
      });
    };

    const promise = browserTTS('Hello world');

    // Trigger the onend callback
    expect(mockSpeakCalls).toHaveLength(1);
    mockSpeakCalls[0].utterance.onend();

    await expect(promise).resolves.toBeUndefined();
  });

  it('browserTextToSpeech resolves on error without rejecting', async () => {
    const browserTTS = (text: string): Promise<void> => {
      if (!('speechSynthesis' in globalThis)) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const utterance = new (globalThis as any).SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        (globalThis as any).speechSynthesis.speak(utterance);
      });
    };

    const promise = browserTTS('Test error');
    mockSpeakCalls[0].utterance.onerror();

    await expect(promise).resolves.toBeUndefined();
  });

  it('browserTextToSpeech resolves immediately when speechSynthesis unavailable', async () => {
    delete (globalThis as any).speechSynthesis;

    const browserTTS = (text: string): Promise<void> => {
      if (!('speechSynthesis' in globalThis)) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const utterance = new (globalThis as any).SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        (globalThis as any).speechSynthesis.speak(utterance);
      });
    };

    await expect(browserTTS('No synthesis')).resolves.toBeUndefined();
  });
});

describe('stopAllAudio cancels speechSynthesis', () => {
  beforeEach(() => {
    setupSpeechSynthesisMock();
    (globalThis as any).window = {
      ...((globalThis as any).window || {}),
      speechSynthesis: (globalThis as any).speechSynthesis,
    };
  });

  afterEach(() => {
    delete (globalThis as any).SpeechSynthesisUtterance;
    delete (globalThis as any).speechSynthesis;
  });

  it('calls speechSynthesis.cancel() when stopping audio', () => {
    // Simulate the stopAllAudio pattern
    const stopAllAudio = () => {
      if ('speechSynthesis' in globalThis) {
        (globalThis as any).speechSynthesis.cancel();
      }
    };

    stopAllAudio();
    expect(mockCancelCalls).toBe(1);
  });

  it('does not throw when speechSynthesis is unavailable', () => {
    delete (globalThis as any).speechSynthesis;

    const stopAllAudio = () => {
      if ('speechSynthesis' in globalThis) {
        (globalThis as any).speechSynthesis.cancel();
      }
    };

    expect(() => stopAllAudio()).not.toThrow();
  });
});

describe('dispose() cleans up speech resources', () => {
  beforeEach(() => {
    mockRecognitionInstance = null;
    (globalThis as any).window = {
      SpeechRecognition: MockSpeechRecognition,
    };
    setupSpeechSynthesisMock();
    (globalThis as any).window.speechSynthesis = (globalThis as any).speechSynthesis;
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).SpeechSynthesisUtterance;
    delete (globalThis as any).speechSynthesis;
  });

  it('disposes SpeechRecognitionService on cleanup', () => {
    const service = new SpeechRecognitionService({ lang: 'en-US' });
    service.start();
    expect(service.isListening).toBe(true);

    service.dispose();
    expect(service.isListening).toBe(false);
  });

  it('cancels speechSynthesis and disposes recognition on full cleanup', () => {
    const service = new SpeechRecognitionService({ lang: 'en-US' });
    service.start();

    // Simulate the dispose pattern from BabylonChatPanel
    if ('speechSynthesis' in globalThis) {
      (globalThis as any).speechSynthesis.cancel();
    }
    service.dispose();

    expect(mockCancelCalls).toBe(1);
    expect(service.isListening).toBe(false);
  });
});

describe('Speech recognition with language detection', () => {
  beforeEach(() => {
    mockRecognitionInstance = null;
    (globalThis as any).window = {
      SpeechRecognition: MockSpeechRecognition,
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('configures recognition with target language BCP-47 code', () => {
    const service = new SpeechRecognitionService({
      lang: 'es-ES',
      interimResults: true,
      continuous: false,
    });
    service.start();

    expect(mockRecognitionInstance.lang).toBe('es-ES');
    expect(mockRecognitionInstance.interimResults).toBe(true);
    expect(mockRecognitionInstance.continuous).toBe(false);
  });

  it('defaults to en-US when no language specified', () => {
    const service = new SpeechRecognitionService();
    service.start();
    expect(mockRecognitionInstance.lang).toBe('en-US');
  });

  it('shows interim results for real-time feedback', () => {
    const interimResults: string[] = [];
    const service = new SpeechRecognitionService({
      lang: 'fr-FR',
      interimResults: true,
      onInterimResult: (text) => interimResults.push(text),
    });
    service.start();

    // Simulate interim results as user speaks
    mockRecognitionInstance.onresult({
      resultIndex: 0,
      results: {
        length: 1,
        0: { isFinal: false, 0: { transcript: 'Bon' }, length: 1 },
      },
    });
    mockRecognitionInstance.onresult({
      resultIndex: 0,
      results: {
        length: 1,
        0: { isFinal: false, 0: { transcript: 'Bonjour' }, length: 1 },
      },
    });

    expect(interimResults).toEqual(['Bon', 'Bonjour']);
  });

  it('delivers final transcript for sending to chat', () => {
    let finalTranscript = '';
    const service = new SpeechRecognitionService({
      lang: 'fr-FR',
      onFinalResult: (text) => { finalTranscript = text; },
    });
    service.start();

    mockRecognitionInstance.onresult({
      resultIndex: 0,
      results: {
        length: 1,
        0: { isFinal: true, 0: { transcript: 'Bonjour, comment allez-vous?' }, length: 1 },
      },
    });

    expect(finalTranscript).toBe('Bonjour, comment allez-vous?');
  });

  it('falls back gracefully when Web Speech API unavailable', () => {
    (globalThis as any).window = {};
    expect(isSpeechRecognitionSupported()).toBe(false);

    const onError = vi.fn();
    const service = new SpeechRecognitionService({ onError });
    service.start();

    expect(onError).toHaveBeenCalledWith('Web Speech API not supported in this browser');
    expect(service.isListening).toBe(false);
  });
});
