/**
 * Local Native Audio Pipeline (STT → LLM → TTS)
 *
 * Orchestrates a fully local/pluggable audio conversation pipeline:
 * 1. STT provider transcribes incoming audio to text
 * 2. Streaming LLM provider generates a response
 * 3. TTS provider synthesizes audio from the response
 *
 * Mirrors the interface of gemini-native-audio.ts but uses the provider
 * registries so any combination of local or cloud backends can be swapped in.
 */

import { getSTTProvider, type ISTTProvider, type AudioStreamChunk, type STTOptions } from './stt/stt-provider.js';
import { getProvider } from './providers/provider-registry.js';
import type { IStreamingLLMProvider } from './providers/llm-provider.js';
import {
  getTTSProvider,
  type ITTSProvider,
  type VoiceProfile,
  type TTSOptions,
  assignVoiceProfile,
  splitAtSentenceBoundaries,
  VOICE_PROFILES,
} from './tts/tts-provider.js';
import type { ConversationContext, StreamCompletionOptions } from './providers/llm-provider.js';
import { AudioEncoding } from '../../../shared/proto/conversation.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface LocalAudioPipelineRequest {
  /** Raw audio bytes (PCM 16-bit, 16 kHz mono expected by most STT) */
  audioData: Buffer;
  /** Audio encoding of the input */
  encoding?: AudioEncoding;
  /** Sample rate of the input audio (default 16000) */
  sampleRate?: number;
  /** System prompt for the character */
  systemPrompt: string;
  /** Conversation history */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Voice profile name (e.g. 'Kore', 'Charon') or auto-assign from character */
  voice?: string;
  /** Character attributes for automatic voice assignment */
  characterAttributes?: {
    gender: string;
    age?: number;
    personality?: {
      openness?: number;
      conscientiousness?: number;
      extroversion?: number;
      agreeableness?: number;
      neuroticism?: number;
    };
  };
  /** Language hint for STT */
  languageCode?: string;
  /** LLM temperature */
  temperature?: number;
  /** Max tokens for LLM */
  maxTokens?: number;
}

export interface LocalAudioPipelineResponse {
  /** Transcribed user input */
  userTranscript: string;
  /** LLM-generated response text */
  responseText: string;
  /** Synthesized audio chunks (concatenated WAV/PCM) */
  audioChunks: Array<{ data: Uint8Array; durationMs: number }>;
  /** Total audio duration in milliseconds */
  totalAudioDurationMs: number;
  /** Pipeline timing breakdown */
  timing: {
    sttMs: number;
    llmMs: number;
    ttsMs: number;
    totalMs: number;
  };
}

export interface LocalAudioPipelineOptions {
  /** Override STT provider name */
  sttProvider?: string;
  /** Override LLM provider name */
  llmProvider?: string;
  /** Override TTS provider name */
  ttsProvider?: string;
}

// ── Pipeline ──────────────────────────────────────────────────────────

/**
 * Run the full local audio pipeline: audio in → text + audio out.
 */
export async function localAudioPipeline(
  request: LocalAudioPipelineRequest,
  options?: LocalAudioPipelineOptions,
): Promise<LocalAudioPipelineResponse> {
  const totalStart = Date.now();

  const stt = getSTTProvider(options?.sttProvider);
  const llm = getProvider(options?.llmProvider);
  const tts = getTTSProvider(options?.ttsProvider);

  // ── Step 1: STT ─────────────────────────────────────────────────
  const sttStart = Date.now();
  const transcript = await transcribeAudio(stt, request);
  const sttMs = Date.now() - sttStart;

  if (!transcript.trim()) {
    return {
      userTranscript: '',
      responseText: '',
      audioChunks: [],
      totalAudioDurationMs: 0,
      timing: { sttMs, llmMs: 0, ttsMs: 0, totalMs: Date.now() - totalStart },
    };
  }

  // ── Step 2: LLM ─────────────────────────────────────────────────
  const llmStart = Date.now();
  const responseText = await generateResponse(llm, transcript, request);
  const llmMs = Date.now() - llmStart;

  if (!responseText.trim()) {
    return {
      userTranscript: transcript,
      responseText: '',
      audioChunks: [],
      totalAudioDurationMs: 0,
      timing: { sttMs, llmMs, ttsMs: 0, totalMs: Date.now() - totalStart },
    };
  }

  // ── Step 3: TTS ─────────────────────────────────────────────────
  const ttsStart = Date.now();
  const voice = resolveVoice(request);
  const { audioChunks, totalAudioDurationMs } = await synthesizeResponse(tts, responseText, voice, request);
  const ttsMs = Date.now() - ttsStart;

  return {
    userTranscript: transcript,
    responseText,
    audioChunks,
    totalAudioDurationMs,
    timing: { sttMs, llmMs, ttsMs, totalMs: Date.now() - totalStart },
  };
}

/**
 * Streaming variant: yields partial results as each pipeline stage completes.
 * Allows the caller to display transcript immediately, then text tokens, then audio.
 */
export async function* localAudioPipelineStreaming(
  request: LocalAudioPipelineRequest,
  options?: LocalAudioPipelineOptions,
): AsyncGenerator<LocalAudioPipelineEvent> {
  const stt = getSTTProvider(options?.sttProvider);
  const llm = getProvider(options?.llmProvider);
  const tts = getTTSProvider(options?.ttsProvider);

  // Step 1: STT
  const transcript = await transcribeAudio(stt, request);
  yield { type: 'transcript', text: transcript };

  if (!transcript.trim()) return;

  // Step 2: Stream LLM tokens, accumulating full response
  const context = buildConversationContext(request);
  const streamOptions: StreamCompletionOptions = {
    temperature: request.temperature,
    maxTokens: request.maxTokens,
    languageCode: request.languageCode,
    conversationHistory: request.history,
  };

  let fullResponse = '';
  for await (const token of llm.streamCompletion(transcript, context, streamOptions)) {
    fullResponse += token;
    yield { type: 'token', text: token };
  }
  yield { type: 'response_complete', text: fullResponse };

  if (!fullResponse.trim()) return;

  // Step 3: TTS on sentence boundaries for lower latency
  const voice = resolveVoice(request);
  const cleanedText = cleanResponseText(fullResponse);
  const sentences = splitAtSentenceBoundaries(cleanedText);
  const ttsOptions: TTSOptions = { languageCode: request.languageCode };

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    for await (const chunk of tts.synthesize(sentence, voice, ttsOptions)) {
      yield { type: 'audio_chunk', data: chunk.data, durationMs: chunk.durationMs };
    }
  }

  yield { type: 'done' };
}

export type LocalAudioPipelineEvent =
  | { type: 'transcript'; text: string }
  | { type: 'token'; text: string }
  | { type: 'response_complete'; text: string }
  | { type: 'audio_chunk'; data: Uint8Array; durationMs: number }
  | { type: 'done' };

// ── Internal helpers ──────────────────────────────────────────────────

async function transcribeAudio(
  stt: ISTTProvider,
  request: LocalAudioPipelineRequest,
): Promise<string> {
  const encoding = request.encoding ?? AudioEncoding.PCM;
  const sampleRate = request.sampleRate ?? 16000;

  // Wrap the buffer as a single-chunk async iterable
  async function* audioStream(): AsyncIterable<AudioStreamChunk> {
    yield { data: new Uint8Array(request.audioData), encoding, sampleRate };
  }

  const sttOptions: STTOptions = {
    languageCode: request.languageCode,
    sampleRate,
    encoding,
  };

  let finalTranscript = '';
  for await (const result of stt.streamTranscription(audioStream(), sttOptions)) {
    if (result.isFinal) {
      finalTranscript += (finalTranscript ? ' ' : '') + result.text;
    }
  }
  return finalTranscript;
}

async function generateResponse(
  llm: IStreamingLLMProvider,
  userText: string,
  request: LocalAudioPipelineRequest,
): Promise<string> {
  const context = buildConversationContext(request);
  const options: StreamCompletionOptions = {
    temperature: request.temperature,
    maxTokens: request.maxTokens,
    languageCode: request.languageCode,
    conversationHistory: request.history,
  };

  let fullResponse = '';
  for await (const token of llm.streamCompletion(userText, context, options)) {
    fullResponse += token;
  }
  return fullResponse;
}

function buildConversationContext(request: LocalAudioPipelineRequest): ConversationContext {
  return {
    systemPrompt: request.systemPrompt,
    characterName: undefined,
    worldContext: undefined,
    characterGender: request.characterAttributes?.gender,
  };
}

async function synthesizeResponse(
  tts: ITTSProvider,
  responseText: string,
  voice: VoiceProfile,
  request: LocalAudioPipelineRequest,
): Promise<{ audioChunks: Array<{ data: Uint8Array; durationMs: number }>; totalAudioDurationMs: number }> {
  const cleanedText = cleanResponseText(responseText);
  if (!cleanedText) {
    return { audioChunks: [], totalAudioDurationMs: 0 };
  }

  const ttsOptions: TTSOptions = { languageCode: request.languageCode };
  const audioChunks: Array<{ data: Uint8Array; durationMs: number }> = [];
  let totalAudioDurationMs = 0;

  // Synthesize sentence by sentence for pipeline-friendly streaming
  const sentences = splitAtSentenceBoundaries(cleanedText);
  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    for await (const chunk of tts.synthesize(sentence, voice, ttsOptions)) {
      audioChunks.push({ data: chunk.data, durationMs: chunk.durationMs });
      totalAudioDurationMs += chunk.durationMs;
    }
  }

  return { audioChunks, totalAudioDurationMs };
}

function resolveVoice(request: LocalAudioPipelineRequest): VoiceProfile {
  // Explicit voice name
  if (request.voice) {
    const found = VOICE_PROFILES.find(
      v => v.name.toLowerCase() === request.voice!.toLowerCase(),
    );
    if (found) return found;
  }
  // Auto-assign from character attributes
  if (request.characterAttributes) {
    return assignVoiceProfile(request.characterAttributes);
  }
  // Default: Kore (adult female, clear)
  return VOICE_PROFILES.find(v => v.name === 'Kore')!;
}

/**
 * Strip system markers (grammar feedback, quest assignments) from LLM output
 * before TTS synthesis.
 */
function cleanResponseText(text: string): string {
  return text
    .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
    .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
    .trim();
}
