/**
 * Google Cloud Text-to-Speech Provider
 *
 * Streaming TTS implementation using Google Cloud TTS REST API.
 * Synthesizes text sentence-by-sentence, yielding audio chunks
 * as each sentence completes so playback can start while later
 * sentences are still being synthesized.
 *
 * Auto-registers as 'google' on import.
 */

import { AudioEncoding } from '../../../../shared/proto/conversation.js';
import {
  registerTTSProvider,
  splitAtSentenceBoundaries,
  type AudioChunkOutput,
  type ITTSProvider,
  type TTSOptions,
  type VoiceProfile,
} from './tts-provider.js';

// ── Google Cloud TTS REST types ──────────────────────────────────────

interface GoogleTTSRequest {
  input: { text: string };
  voice: {
    languageCode: string;
    ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  audioConfig: {
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    sampleRateHertz?: number;
    pitch?: number;
    speakingRate?: number;
  };
}

interface GoogleTTSResponse {
  audioContent: string; // base64-encoded audio
}

// ── Encoding mapping ─────────────────────────────────────────────────

function toGoogleEncoding(enc?: AudioEncoding): 'MP3' | 'LINEAR16' | 'OGG_OPUS' {
  switch (enc) {
    case AudioEncoding.PCM: return 'LINEAR16';
    case AudioEncoding.OPUS: return 'OGG_OPUS';
    case AudioEncoding.MP3:
    default: return 'MP3';
  }
}

function toProtoEncoding(googleEnc: string): AudioEncoding {
  switch (googleEnc) {
    case 'LINEAR16': return AudioEncoding.PCM;
    case 'OGG_OPUS': return AudioEncoding.OPUS;
    case 'MP3':
    default: return AudioEncoding.MP3;
  }
}

/** Estimate duration from audio data size and encoding. */
function estimateDurationMs(dataSize: number, encoding: string, sampleRate: number): number {
  switch (encoding) {
    case 'LINEAR16':
      // 16-bit mono PCM: 2 bytes per sample
      return Math.round((dataSize / 2 / sampleRate) * 1000);
    case 'MP3':
      // Rough estimate: ~16 kbps at normal rate
      return Math.round((dataSize / 2000) * 1000);
    case 'OGG_OPUS':
      // Rough estimate: ~12 kbps
      return Math.round((dataSize / 1500) * 1000);
    default:
      return 0;
  }
}

// ── Provider Implementation ──────────────────────────────────────────

export class GoogleTTSProvider implements ITTSProvider {
  readonly name = 'google';

  private apiKey: string | undefined;
  private baseUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  constructor() {
    this.apiKey = process.env.GOOGLE_TTS_API_KEY ?? process.env.GEMINI_API_KEY;
  }

  async *synthesize(
    text: string,
    voice: VoiceProfile,
    options?: TTSOptions,
  ): AsyncIterable<AudioChunkOutput> {
    if (!this.apiKey) {
      console.warn('[GoogleTTS] No API key configured (GOOGLE_TTS_API_KEY or GEMINI_API_KEY). Skipping synthesis.');
      return;
    }

    const sentences = splitAtSentenceBoundaries(text);
    if (sentences.length === 0) return;

    const languageCode = options?.languageCode ?? 'en-US';
    const googleEncoding = toGoogleEncoding(options?.encoding);
    const sampleRate = googleEncoding === 'LINEAR16' ? 24000 : 24000;
    const speakingRate = options?.speakingRate ?? voice.speakingRate;
    const pitch = options?.pitch ?? voice.pitch;
    const ssmlGender = voice.gender === 'female' ? 'FEMALE' as const : 'MALE' as const;

    // Synthesize each sentence and yield its audio chunk immediately
    for (const sentence of sentences) {
      const body: GoogleTTSRequest = {
        input: { text: sentence },
        voice: {
          languageCode,
          ssmlGender,
        },
        audioConfig: {
          audioEncoding: googleEncoding,
          sampleRateHertz: sampleRate,
          pitch,
          speakingRate,
        },
      };

      try {
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[GoogleTTS] API error ${response.status}: ${errorText}`);
          continue; // Skip this sentence, try next
        }

        const json = (await response.json()) as GoogleTTSResponse;
        if (!json.audioContent) continue;

        // Decode base64 audio
        const audioData = Uint8Array.from(
          Buffer.from(json.audioContent, 'base64'),
        );

        const durationMs = estimateDurationMs(audioData.length, googleEncoding, sampleRate);

        yield {
          data: audioData,
          encoding: toProtoEncoding(googleEncoding),
          sampleRate,
          durationMs,
        };
      } catch (err) {
        console.error(`[GoogleTTS] Synthesis failed for sentence: ${(err as Error).message}`);
        // Continue with remaining sentences
      }
    }
  }
}

// ── Auto-register ────────────────────────────────────────────────────

registerTTSProvider('google', () => new GoogleTTSProvider());
