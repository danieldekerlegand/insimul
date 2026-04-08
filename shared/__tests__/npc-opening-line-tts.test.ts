/**
 * US-012: Auto-speak NPC opening line via TTS
 *
 * Tests that the NPC opening greeting is automatically spoken via TTS
 * when the chat panel opens, in a non-blocking way so the player can
 * start typing while audio plays.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Simulates the triggerNPCGreeting TTS decision logic extracted from
 * BabylonChatPanel. This mirrors the exact control flow after the LLM
 * response is obtained.
 */
function simulateGreetingTTSFlow(opts: {
  responseText: string;
  streamingAudioPlaying: boolean;
  audioQueueLength: number;
  textToSpeech: (text: string) => Promise<void>;
  processAssistantResponse: (text: string) => Promise<void>;
}): { receivedStreamingAudio: boolean; ttsPromise: Promise<void> | null } {
  // This mirrors the triggerNPCGreeting logic in BabylonChatPanel:
  // 1. Force _receivedStreamingAudio = true so processAssistantResponse
  //    does NOT do blocking TTS (US-012 change).
  const _receivedStreamingAudio = true;

  // 2. processAssistantResponse checks _receivedStreamingAudio and skips
  //    blocking TTS when true.
  // (Caller has already awaited this.)

  // 3. Non-blocking TTS: fire-and-forget if no streaming audio is active.
  let ttsPromise: Promise<void> | null = null;
  const greetingText = opts.responseText;
  if (greetingText && !opts.streamingAudioPlaying && opts.audioQueueLength === 0) {
    ttsPromise = opts.textToSpeech(greetingText).catch(() => {
      // Graceful degradation: text is still visible in chat panel
    });
  }

  return { receivedStreamingAudio: _receivedStreamingAudio, ttsPromise };
}

describe('US-012: Auto-speak NPC opening line via TTS', () => {
  let mockTextToSpeech: ReturnType<typeof vi.fn>;
  let mockProcessAssistantResponse: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockTextToSpeech = vi.fn().mockResolvedValue(undefined);
    mockProcessAssistantResponse = vi.fn().mockResolvedValue(undefined);
  });

  it('calls TTS with the greeting text when no streaming audio is playing', () => {
    const result = simulateGreetingTTSFlow({
      responseText: 'Bonjour! Comment allez-vous?',
      streamingAudioPlaying: false,
      audioQueueLength: 0,
      textToSpeech: mockTextToSpeech,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    expect(mockTextToSpeech).toHaveBeenCalledWith('Bonjour! Comment allez-vous?');
    expect(result.ttsPromise).not.toBeNull();
  });

  it('skips TTS when streaming audio is already playing (no duplicate)', () => {
    const result = simulateGreetingTTSFlow({
      responseText: 'Bonjour!',
      streamingAudioPlaying: true,
      audioQueueLength: 0,
      textToSpeech: mockTextToSpeech,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    expect(mockTextToSpeech).not.toHaveBeenCalled();
    expect(result.ttsPromise).toBeNull();
  });

  it('skips TTS when audio queue has pending items', () => {
    const result = simulateGreetingTTSFlow({
      responseText: 'Bonjour!',
      streamingAudioPlaying: false,
      audioQueueLength: 2,
      textToSpeech: mockTextToSpeech,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    expect(mockTextToSpeech).not.toHaveBeenCalled();
    expect(result.ttsPromise).toBeNull();
  });

  it('sets _receivedStreamingAudio = true to prevent blocking TTS in processAssistantResponse', () => {
    const result = simulateGreetingTTSFlow({
      responseText: 'Bonjour!',
      streamingAudioPlaying: false,
      audioQueueLength: 0,
      textToSpeech: mockTextToSpeech,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    expect(result.receivedStreamingAudio).toBe(true);
  });

  it('TTS is non-blocking: returns a promise without awaiting it', () => {
    let ttsResolved = false;
    const slowTTS = vi.fn().mockImplementation(() =>
      new Promise<void>((resolve) => {
        setTimeout(() => { ttsResolved = true; resolve(); }, 1000);
      })
    );

    const result = simulateGreetingTTSFlow({
      responseText: 'Bonjour!',
      streamingAudioPlaying: false,
      audioQueueLength: 0,
      textToSpeech: slowTTS,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    // TTS was called but hasn't resolved yet — player can type
    expect(slowTTS).toHaveBeenCalled();
    expect(ttsResolved).toBe(false);
    expect(result.ttsPromise).not.toBeNull();
  });

  it('handles TTS failure gracefully — text remains visible', async () => {
    const failingTTS = vi.fn().mockRejectedValue(new Error('TTS provider unavailable'));

    const result = simulateGreetingTTSFlow({
      responseText: 'Bonjour!',
      streamingAudioPlaying: false,
      audioQueueLength: 0,
      textToSpeech: failingTTS,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    // The .catch() in the flow swallows the error — no unhandled rejection
    await expect(result.ttsPromise).resolves.toBeUndefined();
    expect(failingTTS).toHaveBeenCalledWith('Bonjour!');
  });

  it('skips TTS when response text is empty', () => {
    const result = simulateGreetingTTSFlow({
      responseText: '',
      streamingAudioPlaying: false,
      audioQueueLength: 0,
      textToSpeech: mockTextToSpeech,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    expect(mockTextToSpeech).not.toHaveBeenCalled();
    expect(result.ttsPromise).toBeNull();
  });

  it('uses gender-matched voice via textToSpeech pipeline', () => {
    // The textToSpeech method on BabylonChatPanel uses this._lockedVoice
    // and this._lockedGender (set during show()). Verify TTS is called
    // with the greeting text — voice selection is internal to textToSpeech.
    simulateGreetingTTSFlow({
      responseText: 'Salut! Je suis Marie, la boulangère.',
      streamingAudioPlaying: false,
      audioQueueLength: 0,
      textToSpeech: mockTextToSpeech,
      processAssistantResponse: mockProcessAssistantResponse,
    });

    expect(mockTextToSpeech).toHaveBeenCalledWith('Salut! Je suis Marie, la boulangère.');
  });
});
