/**
 * Whisper.cpp Speech-to-Text Provider
 *
 * Implements ISTTProvider using a local whisper.cpp binary for offline
 * speech-to-text. Buffers the incoming audio stream, writes a 16 kHz
 * mono WAV file, invokes the whisper.cpp CLI, and parses the output.
 *
 * Environment variables:
 *   WHISPER_CPP_PATH  – path to the whisper.cpp `main` binary (default: "whisper-cpp")
 *   WHISPER_MODEL_PATH – path to the GGML model file (required)
 *   WHISPER_MODEL_SIZE – model size hint used in logs (default: "base")
 */

import { spawn } from 'child_process';
import { writeFile, unlink, mkdtemp, rmdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  type ISTTProvider,
  type TranscriptionResult,
  type AudioStreamChunk,
  type STTOptions,
  registerSTTProvider,
} from './stt-provider.js';

// ── BCP-47 → Whisper language code mapping ──────────────────────────

const BCP47_TO_WHISPER: Record<string, string> = {
  'en': 'en', 'en-us': 'en', 'en-gb': 'en',
  'fr': 'fr', 'fr-fr': 'fr', 'fr-ca': 'fr',
  'es': 'es', 'es-es': 'es', 'es-mx': 'es',
  'de': 'de', 'de-de': 'de',
  'it': 'it', 'it-it': 'it',
  'pt': 'pt', 'pt-br': 'pt',
  'ja': 'ja', 'ja-jp': 'ja',
  'ko': 'ko', 'ko-kr': 'ko',
  'zh': 'zh', 'zh-cn': 'zh', 'zh-tw': 'zh',
  'ar': 'ar', 'ar-xa': 'ar',
  'ru': 'ru', 'ru-ru': 'ru',
  'nl': 'nl', 'nl-nl': 'nl',
  'tr': 'tr', 'tr-tr': 'tr',
  'hi': 'hi', 'hi-in': 'hi',
};

function bcp47ToWhisperLang(code: string): string | undefined {
  return BCP47_TO_WHISPER[code.toLowerCase()];
}

// ── WAV helpers ─────────────────────────────────────────────────────

/**
 * Build a minimal 16-bit PCM WAV header for the given raw PCM data.
 */
export function buildWavHeader(pcmByteLength: number, sampleRate: number, channels: number): Buffer {
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmByteLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmByteLength, 40);
  return header;
}

/**
 * Wrap raw PCM bytes (assumed 16-bit, 16 kHz, mono) into a WAV buffer.
 */
export function wrapPcmAsWav(pcm: Buffer, sampleRate = 16000, channels = 1): Buffer {
  return Buffer.concat([buildWavHeader(pcm.length, sampleRate, channels), pcm]);
}

/**
 * Merge an array of Uint8Array chunks into a single Buffer.
 */
export function mergeChunks(chunks: Uint8Array[]): Buffer {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = Buffer.alloc(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

// ── Provider ────────────────────────────────────────────────────────

export interface WhisperSTTConfig {
  /** Path to the whisper.cpp binary. Default: "whisper-cpp" */
  binaryPath?: string;
  /** Path to the GGML model file. */
  modelPath?: string;
  /** Model size label (for logging). Default: "base" */
  modelSize?: string;
}

export class WhisperSTTProvider implements ISTTProvider {
  readonly name = 'whisper';

  private binaryPath: string;
  private modelPath: string;
  private modelSize: string;

  constructor(config?: WhisperSTTConfig) {
    this.binaryPath = config?.binaryPath ?? process.env.WHISPER_CPP_PATH ?? 'whisper-cpp';
    this.modelPath = config?.modelPath ?? process.env.WHISPER_MODEL_PATH ?? '';
    this.modelSize = config?.modelSize ?? process.env.WHISPER_MODEL_SIZE ?? 'base';
  }

  /**
   * Return true when both the binary path and model path are configured.
   */
  isConfigured(): boolean {
    return this.binaryPath.length > 0 && this.modelPath.length > 0;
  }

  async *streamTranscription(
    audioStream: AsyncIterable<AudioStreamChunk>,
    options?: STTOptions,
  ): AsyncIterable<TranscriptionResult> {
    if (!this.isConfigured()) {
      console.warn('[WhisperSTT] Not configured — WHISPER_MODEL_PATH is required');
      return;
    }

    // Buffer all incoming audio chunks (whisper.cpp is batch, not streaming)
    const rawChunks: Uint8Array[] = [];
    let lastSampleRate = options?.sampleRate ?? 16000;

    for await (const chunk of audioStream) {
      rawChunks.push(chunk.data);
      lastSampleRate = chunk.sampleRate;
    }

    if (rawChunks.length === 0) {
      return;
    }

    const pcmData = mergeChunks(rawChunks);

    // Wrap raw PCM as WAV (whisper.cpp expects a WAV file)
    const wavData = wrapPcmAsWav(pcmData, lastSampleRate, 1);

    // Write to temp file
    const tempDir = await mkdtemp(join(tmpdir(), 'whisper-'));
    const tempFile = join(tempDir, 'audio.wav');
    await writeFile(tempFile, wavData);

    try {
      const languageHint = options?.languageCode
        ? bcp47ToWhisperLang(options.languageCode)
        : undefined;

      const text = await this.invokeWhisper(tempFile, languageHint);
      const trimmed = text.trim();

      if (trimmed.length > 0) {
        yield {
          text: trimmed,
          isFinal: true,
          confidence: 0.85, // whisper.cpp doesn't expose per-segment confidence
          languageDetected: options?.languageCode ?? 'en',
        };
      }
    } finally {
      // Clean up temp files
      await unlink(tempFile).catch(() => {});
      await rmdir(tempDir).catch(() => {});
    }
  }

  /**
   * Invoke the whisper.cpp binary and return the transcribed text.
   * Exported for testing.
   */
  invokeWhisper(filePath: string, language?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [
        '-m', this.modelPath,
        '-f', filePath,
        '--no-timestamps',
        '--print-special', 'false',
        '-t', '4', // threads
      ];

      if (language) {
        args.push('-l', language);
      }

      const proc = spawn(this.binaryPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.on('error', (err) => {
        reject(new Error(`[WhisperSTT] Failed to spawn "${this.binaryPath}": ${err.message}`));
      });

      proc.on('close', (code) => {
        if (code === 0) {
          // whisper.cpp may output lines with leading whitespace and
          // "[segment]" markers — strip them to get clean text.
          const cleaned = stdout
            .split('\n')
            .map((line) => line.replace(/^\s*\[.*?\]\s*/, '').trim())
            .filter(Boolean)
            .join(' ');
          resolve(cleaned);
        } else {
          reject(
            new Error(`[WhisperSTT] whisper.cpp exited with code ${code}: ${stderr.slice(0, 500)}`),
          );
        }
      });
    });
  }
}

// Auto-register when imported (only if model path is configured)
registerSTTProvider('whisper', () => new WhisperSTTProvider());
