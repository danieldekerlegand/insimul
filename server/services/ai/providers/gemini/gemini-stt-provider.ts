/**
 * Gemini STT Provider
 *
 * Wraps the existing Gemini audio-understanding STT logic from
 * server/services/tts-stt.ts behind the unified ISTTProvider interface.
 * Preserves retry with exponential backoff, inline vs Files API split,
 * and graceful degradation when the API key is missing.
 */

import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from '../../../../config/gemini.js';
import type { ISTTProvider, STTOptions, STTResult } from '../../ai-provider.js';

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
        `[GeminiSTT] Transient error (attempt ${attempt + 1}/${maxAttempts}), retrying in ${Math.round(delay)}ms:`,
        err?.message || err,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

export class GeminiSTTProvider implements ISTTProvider {
  readonly name = 'gemini-stt';

  async transcribe(audio: Buffer, options?: STTOptions): Promise<STTResult> {
    if (!isGeminiConfigured()) {
      throw new Error('Gemini API key is not configured');
    }

    const languageHint = options?.languageCode;
    const mimeType = 'audio/wav';

    try {
      const client = getGenAI();
      const prompt = languageHint
        ? `Generate a transcript of this audio. The speaker is expected to be speaking in ${languageHint}. Transcribe in the original language.`
        : 'Generate a transcript of this audio.';

      // For smaller files (< 20MB), use inline audio
      if (audio.length < 20 * 1024 * 1024) {
        const response = await withRetry(() =>
          client.models.generateContent({
            model: GEMINI_MODELS.PRO,
            contents: [
              prompt,
              {
                inlineData: {
                  data: audio.toString('base64'),
                  mimeType,
                },
              },
            ],
          }),
        );

        return {
          text: response.text || '',
          languageCode: languageHint,
        };
      }

      // For larger files, use the Files API
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');

      const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.audio`);

      try {
        await fs.writeFile(tempPath, audio);

        const uploadedFile = await client.files.upload({
          file: tempPath,
          config: { mimeType },
        });

        const response = await withRetry(() =>
          client.models.generateContent({
            model: GEMINI_MODELS.PRO,
            contents: [
              prompt,
              { fileData: { fileUri: uploadedFile.uri, mimeType } },
            ],
          }),
        );

        return {
          text: response.text || '',
          languageCode: languageHint,
        };
      } finally {
        try {
          const fs2 = await import('fs/promises');
          await fs2.unlink(tempPath);
        } catch {
          // Ignore cleanup failures
        }
      }
    } catch (error) {
      console.error('[GeminiSTT] Error:', error);
      throw new Error(`STT failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
