import { getGenAI, isGeminiConfigured, getGeminiApiKey, GEMINI_MODELS } from "../config/gemini.js";
import { ttsCache, TTSCache } from "./tts-cache.js";
import { wrapWithEmotionalProsody } from "@shared/emotional-tone.js";

/** Retry an async operation with exponential backoff on transient failures. */
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.code ?? err?.statusCode;
      const isTransient = status === 429 || status === 503 || status === 500 ||
        (err?.message && /ECONNRESET|ETIMEDOUT|socket hang up|fetch failed/i.test(err.message));
      if (!isTransient || attempt === maxAttempts - 1) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200;
      console.warn(`[TTS/STT] Transient error (attempt ${attempt + 1}/${maxAttempts}), retrying in ${Math.round(delay)}ms:`, err?.message || err);
      await new Promise(r => setTimeout(r, delay));
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
  japanese: 'ja-JP', ja: 'ja-JP', 日本語: 'ja-JP',
  korean: 'ko-KR', ko: 'ko-KR', 한국어: 'ko-KR',
  chinese: 'zh-CN', zh: 'zh-CN', 中文: 'zh-CN', mandarin: 'zh-CN',
  arabic: 'ar-XA', ar: 'ar-XA', العربية: 'ar-XA',
  russian: 'ru-RU', ru: 'ru-RU', русский: 'ru-RU',
  dutch: 'nl-NL', nl: 'nl-NL',
  turkish: 'tr-TR', tr: 'tr-TR',
  hindi: 'hi-IN', hi: 'hi-IN',
  chitimacha: 'en-US', // No TTS support; fall back to English
};

function resolveLanguageCode(lang: string): string {
  const lower = lang.toLowerCase().trim();
  // Direct match
  if (LANGUAGE_CODE_MAP[lower]) return LANGUAGE_CODE_MAP[lower];
  // If it already looks like a BCP-47 code (e.g. "fr-FR"), use it directly
  if (/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(lower)) return lang;
  // Partial match (e.g. "Brazilian Portuguese" → "portuguese")
  for (const [key, code] of Object.entries(LANGUAGE_CODE_MAP)) {
    if (lower.includes(key)) return code;
  }
  return 'en-US';
}

/** Fallback: detect language from text content when no explicit language is provided. */
function detectLanguageFromText(text: string): string {
  const isFrench = /[àâäéèêëïîôùûüÿçœæ]/i.test(text) || /\b(vous|est|les|des|une|dans)\b/i.test(text);
  if (isFrench) return 'fr-FR';
  const isSpanish = /[ñ¿¡]/i.test(text) || /\b(está|usted|gracias|señor)\b/i.test(text);
  if (isSpanish) return 'es-ES';
  const isGerman = /[äöüß]/i.test(text) || /\b(ich|und|der|die|das)\b/i.test(text);
  if (isGerman) return 'de-DE';
  return 'en-US';
}

/**
 * Text-to-Speech using Google Cloud Text-to-Speech with gemini-2.5-pro-tts.
 * Results are cached using an LRU cache to avoid redundant API calls.
 * Supports emotional tone modulation via SSML prosody tags.
 */
export async function textToSpeech(
  text: string,
  voiceName: string = "Kore",
  gender: string = "neutral",
  encoding: "MP3" | "WAV" = "MP3",
  emotionalTone?: string,
  targetLanguage?: string
): Promise<Buffer> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const cacheKey = TTSCache.makeKey(text, voiceName, gender, encoding, emotionalTone) + (targetLanguage ? `:${targetLanguage}` : '');
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Use Google Cloud Text-to-Speech API
    const { TextToSpeechClient } = await import("@google-cloud/text-to-speech");
    const ttsClient = new TextToSpeechClient({
      apiKey: getGeminiApiKey()
    });

    // Determine language code from explicit targetLanguage, falling back to text heuristic
    const languageCode = targetLanguage
      ? resolveLanguageCode(targetLanguage)
      : detectLanguageFromText(text);

    // Map gender to SSML gender format
    const ssmlGender = gender.toLowerCase() === 'female' ? 'FEMALE' :
                       gender.toLowerCase() === 'male' ? 'MALE' : 'NEUTRAL';

    // Map encoding - WAV is LINEAR16 in Google Cloud TTS
    const audioEncoding = encoding === "WAV" ? "LINEAR16" : "MP3";

    // Apply emotional prosody via SSML if tone is provided
    const { ssml, isSSML } = wrapWithEmotionalProsody(text, emotionalTone);
    const input = isSSML ? { ssml } : { text };

    const [response] = await withRetry(() => ttsClient.synthesizeSpeech({
      input,
      voice: {
        languageCode: languageCode,
        ssmlGender: ssmlGender as any
      },
      audioConfig: {
        audioEncoding: audioEncoding as any,
        // For WAV, set sample rate
        ...(encoding === "WAV" && { sampleRateHertz: 24000 })
      }
    }));

    if (!response.audioContent) {
      throw new Error("No audio content in response");
    }

    // Convert to Buffer
    const audioBuffer = Buffer.from(response.audioContent as Uint8Array);

    // If WAV format, we need to add WAV header since LINEAR16 is raw PCM
    const result = encoding === "WAV"
      ? addWavHeader(audioBuffer, 24000, 1)
      : audioBuffer;

    ttsCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("TTS error:", error);
    throw new Error(`TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add WAV header to raw PCM data
 */
function addWavHeader(pcmData: Buffer, sampleRate: number, numChannels: number): Buffer {
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  
  return Buffer.concat([header, pcmData]);
}

/**
 * Speech-to-Text using Gemini's audio understanding
 */
export async function speechToText(audioBuffer: Buffer, mimeType: string = 'audio/wav', languageHint?: string): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    const client = getGenAI();
    const prompt = languageHint
      ? `Generate a transcript of this audio. The speaker is expected to be speaking in ${languageHint}. Transcribe in the original language.`
      : 'Generate a transcript of this audio.';

    // For smaller files (< 20MB), use inline audio
    if (audioBuffer.length < 20 * 1024 * 1024) {
      const response = await withRetry(() => client.models.generateContent({
        model: GEMINI_MODELS.PRO,
        contents: [
          prompt,
          {
            inlineData: {
              data: audioBuffer.toString('base64'),
              mimeType: mimeType,
            }
          }
        ]
      }));

      return response.text || '';
    } else {
      // For larger files, use the Files API
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');

      const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.audio`);

      try {
        await fs.writeFile(tempPath, audioBuffer);

        const uploadedFile = await client.files.upload({
          path: tempPath,
          mimeType: mimeType,
        });

        const response = await withRetry(() => client.models.generateContent({
          model: GEMINI_MODELS.PRO,
          contents: [
            prompt,
            { fileData: { fileUri: uploadedFile.uri, mimeType: mimeType } }
          ]
        }));

        return response.text || '';
      } finally {
        // Clean up temp file
        try {
          await fs.unlink(tempPath);
        } catch (err) {
          console.error('Failed to delete temp file:', err);
        }
      }
    }
  } catch (error) {
    console.error("STT error:", error);
    throw new Error(`STT failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get available TTS voices
 */
export function getAvailableVoices() {
  return [
    { voice: "Kore", language: "en", gender: "female" },
    { voice: "Charon", language: "en", gender: "male" },
    { voice: "Aoede", language: "en", gender: "female" },
    { voice: "Puck", language: "en", gender: "male" },
  ];
}
