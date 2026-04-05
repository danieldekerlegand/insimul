/**
 * Local Native Audio Provider
 *
 * Implements INativeAudioProvider using a fully local pipeline:
 *   whisper.cpp (STT) → llama.cpp (LLM) → Piper (TTS)
 *
 * Mirrors the Gemini native audio interface so voice chat works offline.
 */

import type { INativeAudioProvider, NativeAudioRequest, NativeAudioResponse } from '../../../providers/types.js';
import { nativeAudioRegistry } from '../../../providers/registry.js';
import { getSTTProvider } from '../../../conversation/stt/stt-provider.js';
import { getProvider } from '../../../conversation/providers/provider-registry.js';
import {
  getTTSProvider,
  assignVoiceProfile,
  VOICE_PROFILES,
  type VoiceProfile,
} from '../../../conversation/tts/tts-provider.js';
import type { AudioStreamChunk } from '../../../conversation/stt/stt-provider.js';
import { AudioEncoding } from '../../../../../shared/proto/conversation.js';
import { cleanForSpeech } from '../../../conversation/streaming-chat.js';

// ── Text cleaning ──────────────────────────────────────────────────

// Consolidated into cleanForSpeech from streaming-chat.ts
const cleanForTTS = cleanForSpeech;

/** Resolve a VoiceProfile from a voice name string. */
function resolveVoice(voiceName?: string): VoiceProfile {
  if (voiceName) {
    const found = VOICE_PROFILES.find(
      v => v.name.toLowerCase() === voiceName.toLowerCase(),
    );
    if (found) return found;
  }
  return VOICE_PROFILES.find(v => v.name === 'Kore')!;
}

/** Convert Gemini-style history to simple role/content pairs. */
function convertHistory(
  history: Array<{ role: string; parts: Array<{ text: string }> }>,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return history
    .filter(msg => msg.parts?.[0]?.text)
    .map(msg => ({
      role: (msg.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: msg.parts.map(p => p.text).join(' '),
    }));
}

// ── Provider Implementation ────────────────────────────────────────

export class LocalNativeAudioProvider implements INativeAudioProvider {
  readonly name = 'local';

  async chat(request: NativeAudioRequest): Promise<NativeAudioResponse> {
    const voice = resolveVoice(request.voice);
    const history = convertHistory(request.history);
    const temperature = request.temperature ?? 0.7;
    const maxTokens = request.maxTokens ?? 1000;

    // ── Step 1: Determine user input text ────────────────────────
    let userText: string;

    if (request.textMessage) {
      userText = request.textMessage;
    } else if (request.audioData) {
      userText = await this.transcribe(request.audioData, request.mimeType);
    } else {
      return { text: '', audioData: null, audioMimeType: 'audio/wav' };
    }

    if (!userText.trim()) {
      return { text: '', audioData: null, audioMimeType: 'audio/wav' };
    }

    // ── Step 2: Generate text response via LLM ───────────────────
    let responseText: string;
    try {
      const llm = getProvider(process.env.LLM_PROVIDER === 'local' ? 'local' : undefined);
      let fullResponse = '';
      for await (const token of llm.streamCompletion(userText, {
        systemPrompt: request.systemPrompt,
      }, {
        temperature,
        maxTokens,
        conversationHistory: history,
      })) {
        fullResponse += token;
      }
      responseText = fullResponse;
    } catch (err) {
      console.error('[LocalNativeAudio] LLM generation failed:', (err as Error).message);
      return {
        text: '',
        audioData: null,
        audioMimeType: 'audio/wav',
        audioFailed: true,
      };
    }

    if (!responseText.trim()) {
      return { text: responseText, audioData: null, audioMimeType: 'audio/wav' };
    }

    // ── Step 3: Synthesize audio via TTS ─────────────────────────
    let audioData: string | null = null;
    const audioMimeType = 'audio/wav';

    if (request.returnAudio !== false) {
      const cleanedText = cleanForTTS(responseText);
      if (cleanedText) {
        try {
          audioData = await this.synthesize(cleanedText, voice, request.emotionalTone);
        } catch (err) {
          console.error('[LocalNativeAudio] TTS synthesis failed:', (err as Error).message);
        }
      }
    }

    return {
      text: responseText,
      audioData,
      audioMimeType,
      audioFailed: request.returnAudio !== false && !audioData,
    };
  }

  /** Transcribe base64 audio via the STT provider. */
  private async transcribe(audioDataBase64: string, mimeType?: string): Promise<string> {
    const stt = getSTTProvider(process.env.STT_PROVIDER === 'whisper' ? 'whisper' : undefined);
    const audioBuffer = Buffer.from(audioDataBase64, 'base64');

    async function* audioStream(): AsyncIterable<AudioStreamChunk> {
      yield {
        data: new Uint8Array(audioBuffer),
        encoding: AudioEncoding.PCM,
        sampleRate: 16000,
      };
    }

    let transcript = '';
    for await (const result of stt.streamTranscription(audioStream(), {
      sampleRate: 16000,
      encoding: AudioEncoding.PCM,
    })) {
      if (result.isFinal) {
        transcript += (transcript ? ' ' : '') + result.text;
      }
    }
    return transcript;
  }

  /** Synthesize text to base64 WAV audio via the TTS provider. */
  private async synthesize(
    text: string,
    voice: VoiceProfile,
    emotionalTone?: string,
  ): Promise<string | null> {
    const tts = getTTSProvider(process.env.TTS_PROVIDER === 'piper' ? 'piper' : undefined);

    // Adjust speaking rate based on emotional tone
    const ttsOptions: { languageCode?: string; speakingRate?: number } = {};
    if (emotionalTone) {
      const toneRateMap: Record<string, number> = {
        happy: 1.1,
        excited: 1.2,
        sad: 0.85,
        angry: 1.15,
        calm: 0.9,
        fearful: 1.1,
      };
      ttsOptions.speakingRate = toneRateMap[emotionalTone.toLowerCase()];
    }

    const audioChunks: Buffer[] = [];
    for await (const chunk of tts.synthesize(text, voice, ttsOptions)) {
      audioChunks.push(Buffer.from(chunk.data));
    }

    if (audioChunks.length === 0) return null;

    const combined = Buffer.concat(audioChunks);
    return combined.toString('base64');
  }
}

// ── Auto-register ──────────────────────────────────────────────────

nativeAudioRegistry.register('local', () => new LocalNativeAudioProvider());
