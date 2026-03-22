/**
 * Gemini TTS Provider
 *
 * Wraps the existing Google Cloud TTS logic from server/services/tts-stt.ts
 * behind the unified ITTSProvider interface. Preserves caching, retry with
 * exponential backoff, emotional prosody, and language detection.
 */

import { isGeminiConfigured, getGeminiApiKey } from '../../../../config/gemini.js';
import { ttsCache, TTSCache } from '../../../tts-cache.js';
import { wrapWithEmotionalProsody } from '@shared/emotional-tone.js';
import type { ITTSProvider, TTSOptions } from '../../ai-provider.js';

/** Retry an async operation with exponential backoff on transient failures. */
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.code ?? err?.statusCode;
      const isTransient =
        status === 429 ||
        status === 503 ||
        status === 500 ||
        (err?.message && /ECONNRESET|ETIMEDOUT|socket hang up|fetch failed/i.test(err.message));
      if (!isTransient || attempt === maxAttempts - 1) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200;
      console.warn(
        `[GeminiTTS] Transient error (attempt ${attempt + 1}/${maxAttempts}), retrying in ${Math.round(delay)}ms:`,
        err?.message || err,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

/** Map common language names/codes to BCP-47 codes for Google Cloud TTS. */
const LANGUAGE_CODE_MAP: Record<string, string> = {
  english: 'en-US', en: 'en-US',
  french: 'fr-FR', fr: 'fr-FR', français: 'fr-FR',
  spanish: 'es-ES', es: 'es-ES', español: 'es-ES',
  german: 'de-DE', de: 'de-DE', deutsch: 'de-DE',
  italian: 'it-IT', it: 'it-IT', italiano: 'it-IT',
  portuguese: 'pt-BR', pt: 'pt-BR', português: 'pt-BR',
  japanese: 'ja-JP', ja: 'ja-JP', '日本語': 'ja-JP',
  korean: 'ko-KR', ko: 'ko-KR', '한국어': 'ko-KR',
  chinese: 'zh-CN', zh: 'zh-CN', '中文': 'zh-CN', mandarin: 'zh-CN',
  arabic: 'ar-XA', ar: 'ar-XA', 'العربية': 'ar-XA',
  russian: 'ru-RU', ru: 'ru-RU', 'русский': 'ru-RU',
  dutch: 'nl-NL', nl: 'nl-NL',
  turkish: 'tr-TR', tr: 'tr-TR',
  hindi: 'hi-IN', hi: 'hi-IN',
  chitimacha: 'en-US',
};

function resolveLanguageCode(lang: string): string {
  const lower = lang.toLowerCase().trim();
  if (LANGUAGE_CODE_MAP[lower]) return LANGUAGE_CODE_MAP[lower];
  if (/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(lower)) return lang;
  for (const [key, code] of Object.entries(LANGUAGE_CODE_MAP)) {
    if (lower.includes(key)) return code;
  }
  return 'en-US';
}

/** Fallback: detect language from text content. */
function detectLanguageFromText(text: string): string {
  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(text) || /\b(vous|est|les|des|une|dans)\b/i.test(text))
    return 'fr-FR';
  if (/[ñ¿¡]/i.test(text) || /\b(está|usted|gracias|señor)\b/i.test(text))
    return 'es-ES';
  if (/[äöüß]/i.test(text) || /\b(ich|und|der|die|das)\b/i.test(text))
    return 'de-DE';
  return 'en-US';
}

/** Add WAV header to raw PCM data. */
function addWavHeader(pcmData: Buffer, sampleRate: number, numChannels: number): Buffer {
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

export class GeminiTTSProvider implements ITTSProvider {
  readonly name = 'gemini-tts';

  async synthesize(text: string, voice: string = 'Kore', options?: TTSOptions): Promise<Buffer> {
    if (!isGeminiConfigured()) {
      throw new Error('Gemini API key is not configured');
    }

    const encoding = 'MP3' as const;
    const gender = 'neutral';
    const emotionalTone = options?.emotionalTone;
    const targetLanguage = options?.languageCode;

    const cacheKey =
      TTSCache.makeKey(text, voice, gender, encoding, emotionalTone) +
      (targetLanguage ? `:${targetLanguage}` : '');
    const cached = ttsCache.get(cacheKey);
    if (cached) return cached;

    try {
      const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
      const ttsClient = new TextToSpeechClient({ apiKey: getGeminiApiKey() });

      const languageCode = targetLanguage
        ? resolveLanguageCode(targetLanguage)
        : detectLanguageFromText(text);

      const { ssml, isSSML } = wrapWithEmotionalProsody(text, emotionalTone);
      const input = isSSML ? { ssml } : { text };

      const [response] = await withRetry(() =>
        ttsClient.synthesizeSpeech({
          input,
          voice: { languageCode, ssmlGender: 'NEUTRAL' as any },
          audioConfig: { audioEncoding: 'MP3' as any },
        }),
      );

      if (!response.audioContent) {
        throw new Error('No audio content in response');
      }

      const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
      ttsCache.set(cacheKey, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('[GeminiTTS] Error:', error);
      throw new Error(`TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Re-export utilities for shared use
export { LANGUAGE_CODE_MAP, resolveLanguageCode, detectLanguageFromText, withRetry };
