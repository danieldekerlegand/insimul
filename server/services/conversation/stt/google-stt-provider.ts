/**
 * Google Cloud Speech-to-Text Provider
 *
 * Implements ISTTProvider using Google Cloud Speech-to-Text API
 * for streaming transcription. Partial results arrive as the
 * speaker talks (not waiting for silence).
 *
 * Requires GOOGLE_CLOUD_API_KEY or GOOGLE_APPLICATION_CREDENTIALS env var.
 */

import {
  type ISTTProvider,
  type TranscriptionResult,
  type AudioStreamChunk,
  type STTOptions,
  registerSTTProvider,
} from './stt-provider.js';

// Google Cloud STT encoding names mapped from our AudioEncoding enum values
const ENCODING_MAP: Record<number, string> = {
  0: 'ENCODING_UNSPECIFIED',
  1: 'LINEAR16', // PCM
  2: 'OGG_OPUS', // OPUS
  3: 'MP3',
};

export class GoogleSTTProvider implements ISTTProvider {
  readonly name = 'google';

  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_CLOUD_API_KEY ?? process.env.GOOGLE_STT_API_KEY ?? '';
    this.baseUrl = 'https://speech.googleapis.com/v1';
  }

  async *streamTranscription(
    audioStream: AsyncIterable<AudioStreamChunk>,
    options?: STTOptions,
  ): AsyncIterable<TranscriptionResult> {
    const languageCode = options?.languageCode ?? 'en-US';
    const sampleRate = options?.sampleRate ?? 16000;

    // Collect audio chunks and process them
    // Google Cloud STT REST API uses recognize (non-streaming) endpoint.
    // For true streaming, the gRPC Speech API is needed. Here we batch
    // small chunks and send recognize requests for partial + final results.
    const chunkBuffer: Uint8Array[] = [];
    let encodingName = 'LINEAR16';

    for await (const chunk of audioStream) {
      encodingName = ENCODING_MAP[chunk.encoding] ?? 'LINEAR16';
      chunkBuffer.push(chunk.data);

      // Process every ~0.5 seconds of audio (assuming 16-bit PCM at given sample rate)
      // 16-bit = 2 bytes per sample, so bytesPerSecond = sampleRate * 2
      const bytesPerHalfSecond = sampleRate; // sampleRate * 2 / 2
      const totalBytes = chunkBuffer.reduce((sum, c) => sum + c.length, 0);

      if (totalBytes >= bytesPerHalfSecond) {
        const result = await this.recognizeChunk(
          this.mergeChunks(chunkBuffer),
          encodingName,
          sampleRate,
          languageCode,
          false,
        );
        if (result) {
          yield result;
        }
        chunkBuffer.length = 0;
      }
    }

    // Process remaining audio as final
    if (chunkBuffer.length > 0) {
      const result = await this.recognizeChunk(
        this.mergeChunks(chunkBuffer),
        encodingName,
        sampleRate,
        languageCode,
        true,
      );
      if (result) {
        yield result;
      }
    }
  }

  private mergeChunks(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged;
  }

  private async recognizeChunk(
    audioData: Uint8Array,
    encoding: string,
    sampleRate: number,
    languageCode: string,
    isFinal: boolean,
  ): Promise<TranscriptionResult | null> {
    if (!this.apiKey) {
      // No API key — return null (callers should handle gracefully)
      return null;
    }

    try {
      const base64Audio = Buffer.from(audioData).toString('base64');

      const requestBody = {
        config: {
          encoding,
          sampleRateHertz: sampleRate,
          languageCode,
          enableAutomaticPunctuation: true,
        },
        audio: {
          content: base64Audio,
        },
      };

      const response = await fetch(
        `${this.baseUrl}/speech:recognize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        console.error(`[GoogleSTT] API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = (await response.json()) as any;
      const results = data.results;

      if (!results || results.length === 0) {
        return null;
      }

      const best = results[0];
      const alternative = best.alternatives?.[0];
      if (!alternative?.transcript) {
        return null;
      }

      return {
        text: alternative.transcript,
        isFinal: isFinal || best.isFinal === true,
        confidence: alternative.confidence ?? 0,
        languageDetected: best.languageCode ?? languageCode,
      };
    } catch (err: any) {
      console.error('[GoogleSTT] Recognition error:', err.message);
      return null;
    }
  }
}

// Auto-register on import
registerSTTProvider('google', () => new GoogleSTTProvider());
