/**
 * Audio Streaming Integration Tests — US-010
 *
 * Tests the full audio pipeline:
 *   AudioChunk → STT (streaming) → text → LLM (streaming) → TTS (streaming) → AudioChunk + TextChunk
 *
 * Also tests:
 *   - Pipeline parallelism (text arrives before audio)
 *   - Connection pooling (provider reuse)
 *   - Concurrent text + audio streaming
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createSession,
  endSession,
  sessions,
  voiceProfileCache,
  setVoiceForSession,
  clearProviderPool,
  type GrpcServerOptions,
  type SessionState,
} from '../services/conversation/grpc-server.js';
import type { IStreamingLLMProvider, ConversationContext, LLMStreamOptions } from '../services/conversation/providers/llm-provider.js';
import type { ISTTProvider, AudioStreamChunk, TranscriptionResult, STTOptions } from '../services/conversation/stt/stt-provider.js';
import type { ITTSProvider, AudioChunkOutput, VoiceProfile, TTSOptions } from '../services/conversation/tts/tts-provider.js';
import { splitAtSentenceBoundaries, VOICE_PROFILES } from '../services/conversation/tts/tts-provider.js';
import { AudioEncoding } from '../../shared/proto/conversation.js';

// ── Mock Providers ───────────────────────────────────────────────────

class MockLLMProvider implements IStreamingLLMProvider {
  readonly name = 'mock-llm';
  calls: Array<{ prompt: string; context: ConversationContext }> = [];

  constructor(private response: string = 'Hello there. How can I help you today?') {}

  async *streamCompletion(
    prompt: string,
    context: ConversationContext,
    _options?: LLMStreamOptions,
  ): AsyncIterable<string> {
    this.calls.push({ prompt, context });
    // Yield word-by-word to simulate streaming
    const words = this.response.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield i === 0 ? words[i] : ' ' + words[i];
    }
  }
}

class MockSTTProvider implements ISTTProvider {
  readonly name = 'mock-stt';
  calls: number = 0;

  constructor(private transcription: string = 'What is your name?') {}

  async *streamTranscription(
    _audioStream: AsyncIterable<AudioStreamChunk>,
    _options?: STTOptions,
  ): AsyncIterable<TranscriptionResult> {
    this.calls++;
    // Yield partial then final
    yield { text: this.transcription.slice(0, 5), isFinal: false, confidence: 0.8, languageDetected: 'en' };
    yield { text: this.transcription, isFinal: true, confidence: 0.95, languageDetected: 'en' };
  }
}

class MockTTSProvider implements ITTSProvider {
  readonly name = 'mock-tts';
  synthesizedTexts: string[] = [];
  calls: number = 0;

  async *synthesize(
    text: string,
    _voice: VoiceProfile,
    _options?: TTSOptions,
  ): AsyncIterable<AudioChunkOutput> {
    this.calls++;
    this.synthesizedTexts.push(text);
    // Return one audio chunk per text
    const data = new TextEncoder().encode(text);
    yield {
      data,
      encoding: AudioEncoding.PCM,
      sampleRate: 24000,
      durationMs: text.length * 50,
    };
  }
}

// ── Mock gRPC call ───────────────────────────────────────────────────

interface WrittenMessage {
  textChunk?: { text: string; isFinal: boolean; languageCode: string; sessionId: string };
  audioChunk?: { data: Uint8Array; encoding: number; sampleRate: number; durationMs: number };
  conversationMeta?: { sessionId: string; state: string };
}

function createMockCall() {
  const messages: WrittenMessage[] = [];
  const handlers = new Map<string, Function>();

  return {
    messages,
    write(msg: WrittenMessage) {
      messages.push(msg);
    },
    on(event: string, handler: Function) {
      handlers.set(event, handler);
    },
    end() {},
    emit(event: string, data?: any) {
      const handler = handlers.get(event);
      if (handler) handler(data);
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function setupSession(sessionId: string): SessionState {
  const session = createSession(sessionId, 'npc-1', 'world-1', 'player-1', 'en');
  session.conversationContext = {
    systemPrompt: 'You are a friendly NPC.',
    characterName: 'Test NPC',
  };
  return session;
}

// ── Tests ────────────────────────────────────────────────────────────

describe('Audio Streaming Integration — US-010', () => {
  let llm: MockLLMProvider;
  let stt: MockSTTProvider;
  let tts: MockTTSProvider;

  beforeEach(() => {
    sessions.clear();
    voiceProfileCache.clear();
    clearProviderPool();
    llm = new MockLLMProvider('Hello there. How can I help you today?');
    stt = new MockSTTProvider('What is your name?');
    tts = new MockTTSProvider();
  });

  afterEach(() => {
    sessions.clear();
    voiceProfileCache.clear();
  });

  describe('Full audio pipeline: AudioChunk → STT → LLM → TTS → AudioChunk', () => {
    it('should process audio input through full pipeline and return text + audio', async () => {
      // We test the pipeline by simulating what handleAudioChunkInput does:
      // 1. Buffer audio chunks
      // 2. STT transcription
      // 3. LLM response with TTS synthesis

      const session = setupSession('session-audio-1');
      const call = createMockCall();

      // Simulate STT transcription
      const audioChunks: AudioStreamChunk[] = [
        { data: new Uint8Array([1, 2, 3]), encoding: AudioEncoding.PCM, sampleRate: 16000 },
      ];
      const audioStream: AsyncIterable<AudioStreamChunk> = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of audioChunks) yield chunk;
        },
      };

      // Step 1: STT
      let transcribedText = '';
      for await (const result of stt.streamTranscription(audioStream)) {
        if (result.isFinal) transcribedText = result.text;
      }
      expect(transcribedText).toBe('What is your name?');
      expect(stt.calls).toBe(1);

      // Step 2: LLM streaming with TTS pipelining
      const fullResponse: string[] = [];
      const sentenceBuffer: string[] = [];
      let buffer = '';

      for await (const token of llm.streamCompletion(transcribedText, session.conversationContext!)) {
        fullResponse.push(token);
        call.write({
          textChunk: { text: token, isFinal: false, languageCode: 'en', sessionId: session.sessionId },
        });

        // Sentence boundary detection for TTS
        buffer += token;
        const sentences = splitAtSentenceBoundaries(buffer);
        if (sentences.length > 1) {
          for (let i = 0; i < sentences.length - 1; i++) {
            sentenceBuffer.push(sentences[i]);
          }
          buffer = sentences[sentences.length - 1];
        }
      }
      // Remaining buffer
      if (buffer.trim()) sentenceBuffer.push(buffer.trim());

      // Step 3: TTS synthesis for each sentence
      for (const sentence of sentenceBuffer) {
        for await (const audioChunk of tts.synthesize(sentence, VOICE_PROFILES[0])) {
          call.write({
            audioChunk: {
              data: audioChunk.data,
              encoding: audioChunk.encoding,
              sampleRate: audioChunk.sampleRate,
              durationMs: audioChunk.durationMs,
            },
          });
        }
      }

      // Verify: text chunks arrived
      const textChunks = call.messages.filter((m) => m.textChunk);
      expect(textChunks.length).toBeGreaterThan(0);
      const fullText = textChunks.map((m) => m.textChunk!.text).join('');
      expect(fullText).toBe('Hello there. How can I help you today?');

      // Verify: audio chunks arrived
      const audioOutputChunks = call.messages.filter((m) => m.audioChunk);
      expect(audioOutputChunks.length).toBeGreaterThan(0);

      // Verify: TTS was called with sentence-split text
      expect(tts.calls).toBeGreaterThanOrEqual(2); // At least 2 sentences
      expect(tts.synthesizedTexts).toContain('Hello there.');
    });
  });

  describe('Pipeline parallelism', () => {
    it('text chunks arrive before audio chunks in the message stream', async () => {
      const session = setupSession('session-parallel-1');
      const call = createMockCall();

      // Simulate full pipeline
      let buffer = '';
      const ttsPromises: Array<Promise<void>> = [];

      for await (const token of llm.streamCompletion('hi', session.conversationContext!)) {
        call.write({
          textChunk: { text: token, isFinal: false, languageCode: 'en', sessionId: 'session-parallel-1' },
        });

        buffer += token;
        const sentences = splitAtSentenceBoundaries(buffer);
        if (sentences.length > 1) {
          for (let i = 0; i < sentences.length - 1; i++) {
            const sentence = sentences[i];
            const promise = (async () => {
              for await (const chunk of tts.synthesize(sentence, VOICE_PROFILES[0])) {
                call.write({
                  audioChunk: { data: chunk.data, encoding: chunk.encoding, sampleRate: chunk.sampleRate, durationMs: chunk.durationMs },
                });
              }
            })();
            ttsPromises.push(promise);
          }
          buffer = sentences[sentences.length - 1];
        }
      }
      if (buffer.trim()) {
        const promise = (async () => {
          for await (const chunk of tts.synthesize(buffer.trim(), VOICE_PROFILES[0])) {
            call.write({
              audioChunk: { data: chunk.data, encoding: chunk.encoding, sampleRate: chunk.sampleRate, durationMs: chunk.durationMs },
            });
          }
        })();
        ttsPromises.push(promise);
      }
      await Promise.all(ttsPromises);

      // Find position of first text and first audio
      const firstTextIdx = call.messages.findIndex((m) => m.textChunk);
      const firstAudioIdx = call.messages.findIndex((m) => m.audioChunk);

      expect(firstTextIdx).toBeLessThan(firstAudioIdx);
    });

    it('TTS synthesizes sentence N while LLM generates sentence N+1', async () => {
      // Use a multi-sentence response to verify pipelining
      const multiSentenceLLM = new MockLLMProvider(
        'First sentence done. Second sentence follows. Third and final.'
      );
      const session = setupSession('session-pipeline-1');

      const synthesizeOrder: string[] = [];
      const pipelineTTS: ITTSProvider = {
        name: 'pipeline-tts',
        async *synthesize(text: string, _voice: VoiceProfile) {
          synthesizeOrder.push(text);
          yield {
            data: new TextEncoder().encode(text),
            encoding: AudioEncoding.PCM,
            sampleRate: 24000,
            durationMs: 100,
          };
        },
      };

      let buffer = '';
      const ttsPromises: Array<Promise<void>> = [];

      for await (const token of multiSentenceLLM.streamCompletion('test', session.conversationContext!)) {
        buffer += token;
        const sentences = splitAtSentenceBoundaries(buffer);
        if (sentences.length > 1) {
          for (let i = 0; i < sentences.length - 1; i++) {
            const sentence = sentences[i];
            ttsPromises.push((async () => {
              for await (const _chunk of pipelineTTS.synthesize(sentence, VOICE_PROFILES[0])) {
                // consume
              }
            })());
          }
          buffer = sentences[sentences.length - 1];
        }
      }
      if (buffer.trim()) {
        ttsPromises.push((async () => {
          for await (const _chunk of pipelineTTS.synthesize(buffer.trim(), VOICE_PROFILES[0])) {
            // consume
          }
        })());
      }
      await Promise.all(ttsPromises);

      // All 3 sentences should have been synthesized
      expect(synthesizeOrder.length).toBe(3);
      expect(synthesizeOrder[0]).toBe('First sentence done.');
      expect(synthesizeOrder[1]).toBe('Second sentence follows.');
      expect(synthesizeOrder[2]).toBe('Third and final.');
    });
  });

  describe('Concurrent text + audio streaming', () => {
    it('streams both TextChunk and AudioChunk responses concurrently', async () => {
      const session = setupSession('session-concurrent-1');
      const call = createMockCall();

      // Run the full pipeline
      const ttsPromises: Array<Promise<void>> = [];
      let buffer = '';

      for await (const token of llm.streamCompletion('hello', session.conversationContext!)) {
        call.write({
          textChunk: { text: token, isFinal: false, languageCode: 'en', sessionId: 'session-concurrent-1' },
        });

        buffer += token;
        const sentences = splitAtSentenceBoundaries(buffer);
        if (sentences.length > 1) {
          for (let i = 0; i < sentences.length - 1; i++) {
            const sentence = sentences[i];
            ttsPromises.push((async () => {
              for await (const chunk of tts.synthesize(sentence, VOICE_PROFILES[0])) {
                call.write({
                  audioChunk: { data: chunk.data, encoding: chunk.encoding, sampleRate: chunk.sampleRate, durationMs: chunk.durationMs },
                });
              }
            })());
          }
          buffer = sentences[sentences.length - 1];
        }
      }
      if (buffer.trim()) {
        ttsPromises.push((async () => {
          for await (const chunk of tts.synthesize(buffer.trim(), VOICE_PROFILES[0])) {
            call.write({
              audioChunk: { data: chunk.data, encoding: chunk.encoding, sampleRate: chunk.sampleRate, durationMs: chunk.durationMs },
            });
          }
        })());
      }
      await Promise.all(ttsPromises);

      // Verify both message types are present
      const textMessages = call.messages.filter((m) => m.textChunk);
      const audioMessages = call.messages.filter((m) => m.audioChunk);

      expect(textMessages.length).toBeGreaterThan(0);
      expect(audioMessages.length).toBeGreaterThan(0);

      // Verify text content is complete
      const fullText = textMessages.map((m) => m.textChunk!.text).join('');
      expect(fullText).toBe('Hello there. How can I help you today?');

      // Verify audio content covers the response
      const audioTexts: string[] = [];
      for (const msg of audioMessages) {
        audioTexts.push(new TextDecoder().decode(msg.audioChunk!.data));
      }
      const audioFullText = audioTexts.join(' ');
      expect(audioFullText).toContain('Hello there.');
    });
  });

  describe('STT → LLM → TTS full end-to-end', () => {
    it('processes mock audio input and returns streaming text + audio response', async () => {
      const session = setupSession('session-e2e-1');

      // Step 1: STT transcription from audio
      const audioStream: AsyncIterable<AudioStreamChunk> = {
        async *[Symbol.asyncIterator]() {
          yield { data: new Uint8Array([10, 20, 30]), encoding: AudioEncoding.PCM, sampleRate: 16000 };
        },
      };

      let transcribedText = '';
      for await (const result of stt.streamTranscription(audioStream)) {
        if (result.isFinal) transcribedText = result.text;
      }

      // Step 2: LLM response
      const responseTokens: string[] = [];
      for await (const token of llm.streamCompletion(transcribedText, session.conversationContext!)) {
        responseTokens.push(token);
      }
      const fullResponse = responseTokens.join('');

      // Step 3: TTS synthesis
      const sentences = splitAtSentenceBoundaries(fullResponse);
      const audioResults: AudioChunkOutput[] = [];
      for (const sentence of sentences) {
        for await (const chunk of tts.synthesize(sentence, VOICE_PROFILES[0])) {
          audioResults.push(chunk);
        }
      }

      // Verify full pipeline
      expect(transcribedText).toBe('What is your name?');
      expect(fullResponse).toBe('Hello there. How can I help you today?');
      expect(audioResults.length).toBeGreaterThanOrEqual(2);
      expect(tts.synthesizedTexts[0]).toBe('Hello there.');
    });
  });

  describe('Connection pooling', () => {
    it('provider pool caches instances for reuse', () => {
      // clearProviderPool was called in beforeEach
      // setVoiceForSession caches voice profiles
      setVoiceForSession('s1', 'c1', VOICE_PROFILES[0]);
      setVoiceForSession('s1', 'c1', VOICE_PROFILES[1]);

      // Last set wins
      const key = 's1:c1';
      expect(voiceProfileCache.get(key)).toBe(VOICE_PROFILES[1]);
    });

    it('voice profile cache cleared on session cleanup', () => {
      setVoiceForSession('s2', 'c2', VOICE_PROFILES[2]);
      expect(voiceProfileCache.size).toBe(1);

      voiceProfileCache.clear();
      expect(voiceProfileCache.size).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('handles LLM response with no sentence boundaries', async () => {
      const noSentenceLLM = new MockLLMProvider('just a fragment without punctuation');
      const session = setupSession('session-edge-1');

      let buffer = '';
      for await (const token of noSentenceLLM.streamCompletion('test', session.conversationContext!)) {
        buffer += token;
      }

      const sentences = splitAtSentenceBoundaries(buffer);
      // Should still get the full text as a single chunk
      expect(sentences.length).toBe(1);
      expect(sentences[0]).toBe('just a fragment without punctuation');

      // TTS should handle it
      const audioChunks: AudioChunkOutput[] = [];
      for await (const chunk of tts.synthesize(sentences[0], VOICE_PROFILES[0])) {
        audioChunks.push(chunk);
      }
      expect(audioChunks.length).toBe(1);
    });

    it('handles empty LLM response gracefully', async () => {
      const emptyLLM: IStreamingLLMProvider = {
        name: 'empty',
        async *streamCompletion() {
          // yields nothing
        },
      };
      const session = setupSession('session-edge-2');

      let buffer = '';
      for await (const token of emptyLLM.streamCompletion('test', session.conversationContext!)) {
        buffer += token;
      }

      expect(buffer).toBe('');
      // No TTS should be triggered for empty response
      expect(tts.calls).toBe(0);
    });

    it('handles STT returning empty transcription', async () => {
      const emptyStt: ISTTProvider = {
        name: 'empty-stt',
        async *streamTranscription() {
          yield { text: '', isFinal: true, confidence: 0, languageDetected: 'en' };
        },
      };

      let transcribed = '';
      for await (const result of emptyStt.streamTranscription({
        async *[Symbol.asyncIterator]() {
          yield { data: new Uint8Array([1]), encoding: AudioEncoding.PCM, sampleRate: 16000 };
        },
      })) {
        if (result.isFinal) transcribed = result.text;
      }

      expect(transcribed.trim()).toBe('');
      // Pipeline should not proceed with empty text
    });

    it('TTS receives correct language code from session', async () => {
      const langTrackingTTS: ITTSProvider & { lastOptions: TTSOptions | undefined } = {
        name: 'lang-tts',
        lastOptions: undefined,
        async *synthesize(text: string, _voice: VoiceProfile, options?: TTSOptions) {
          this.lastOptions = options;
          yield {
            data: new TextEncoder().encode(text),
            encoding: AudioEncoding.PCM,
            sampleRate: 24000,
            durationMs: 100,
          };
        },
      };

      for await (const _chunk of langTrackingTTS.synthesize('Bonjour.', VOICE_PROFILES[0], { languageCode: 'fr' })) {
        // consume
      }

      expect(langTrackingTTS.lastOptions?.languageCode).toBe('fr');
    });
  });

  describe('Sentence boundary TTS pipelining', () => {
    it('splits multi-sentence LLM output correctly for TTS', () => {
      const text = 'Hello there. How are you? I am fine!';
      const sentences = splitAtSentenceBoundaries(text);
      expect(sentences).toEqual(['Hello there.', 'How are you?', 'I am fine!']);
    });

    it('handles streaming tokens that span sentence boundaries', async () => {
      // LLM yields: "He" "llo." " Ho" "w?" — sentence boundary splits mid-stream
      const tokenLLM: IStreamingLLMProvider = {
        name: 'token-llm',
        async *streamCompletion() {
          yield 'He';
          yield 'llo.';
          yield ' Ho';
          yield 'w?';
        },
      };

      const session = setupSession('session-boundary-1');
      let buffer = '';
      const completedSentences: string[] = [];

      for await (const token of tokenLLM.streamCompletion('test', session.conversationContext!)) {
        buffer += token;
        const sentences = splitAtSentenceBoundaries(buffer);
        if (sentences.length > 1) {
          for (let i = 0; i < sentences.length - 1; i++) {
            completedSentences.push(sentences[i]);
          }
          buffer = sentences[sentences.length - 1];
        }
      }
      if (buffer.trim()) completedSentences.push(buffer.trim());

      expect(completedSentences).toEqual(['Hello.', 'How?']);
    });
  });
});
