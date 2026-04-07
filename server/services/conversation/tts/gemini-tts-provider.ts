/**
 * Gemini TTS Provider
 *
 * Uses Gemini's native TTS model (gemini-2.5-flash-preview-tts) for
 * text-to-speech synthesis. ~5x faster than Google Cloud TTS for short
 * sentences, with built-in multilingual support.
 *
 * Output: PCM 24kHz mono (audio/L16).
 * Auto-registers as 'gemini-tts' on import.
 */

import { AudioEncoding } from '../../../../shared/proto/conversation.js';
import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from '../../../config/gemini.js';
import {
  registerTTSProvider,
  splitAtSentenceBoundaries,
  type AudioChunkOutput,
  type ITTSProvider,
  type TTSOptions,
  type VoiceProfile,
} from './tts-provider.js';

// ── Voice name mapping ──────────────────────────────────────────────
// Gemini TTS supports these built-in voices. We map our VoiceProfile
// names to Gemini's voice names.

const GEMINI_VOICE_MAP: Record<string, string> = {
  // Female voices
  'Aoede': 'Aoede',
  'Kore': 'Kore',
  'Leda': 'Leda',
  'Zephyr': 'Zephyr',
  // Male voices
  'Puck': 'Puck',
  'Charon': 'Charon',
  'Fenrir': 'Fenrir',
  'Orus': 'Orus',
};

// Default voices by gender
const DEFAULT_VOICE: Record<string, string> = {
  female: 'Kore',
  male: 'Charon',
};

export class GeminiTTSProvider implements ITTSProvider {
  readonly name = 'gemini-tts';

  async *synthesize(
    text: string,
    voice: VoiceProfile,
    options?: TTSOptions,
  ): AsyncIterable<AudioChunkOutput> {
    if (!isGeminiConfigured()) {
      console.warn('[GeminiTTS] No API key configured. Skipping synthesis.');
      return;
    }

    const sentences = splitAtSentenceBoundaries(text);
    if (sentences.length === 0) return;

    const ai = getGenAI();
    const voiceName = GEMINI_VOICE_MAP[voice.name] || DEFAULT_VOICE[voice.gender] || 'Kore';
    const sampleRate = 24000;

    // Synthesize each sentence and yield its audio chunk immediately
    for (const sentence of sentences) {
      try {
        const result = await ai.models.generateContent({
          model: GEMINI_MODELS.SPEECH,
          contents: `Read the following text aloud exactly as written:\n\n"${sentence}"`,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName,
                },
              },
            },
          },
        });

        // Extract audio from response
        const parts = result.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            const audioData = Uint8Array.from(
              Buffer.from(part.inlineData.data, 'base64'),
            );

            // PCM 24kHz mono: 2 bytes per sample
            const durationMs = Math.round((audioData.length / 2 / sampleRate) * 1000);

            yield {
              data: audioData,
              encoding: AudioEncoding.PCM,
              sampleRate,
              durationMs,
            };
          }
        }
      } catch (err) {
        console.error(`[GeminiTTS] Synthesis failed for sentence: ${(err as Error).message}`);
        // Continue with remaining sentences
      }
    }
  }
}

// ── Auto-register ────────────────────────────────────────────────────

registerTTSProvider('gemini-tts', () => new GeminiTTSProvider());
