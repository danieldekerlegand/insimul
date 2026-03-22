/**
 * Piper TTS Provider
 *
 * Local text-to-speech using Piper (https://github.com/rhasspy/piper).
 * Piper runs as a subprocess: text on stdin → raw 16-bit PCM on stdout.
 * Voice models are .onnx files stored in PIPER_VOICES_DIR.
 *
 * Auto-registers as 'piper' on import.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { AudioEncoding } from '../../../../shared/proto/conversation.js';
import { ttsCache } from '../../tts-cache.js';
import {
  registerTTSProvider,
  splitAtSentenceBoundaries,
  type AudioChunkOutput,
  type ITTSProvider,
  type TTSOptions,
  type VoiceProfile,
} from './tts-provider.js';

// ── Voice model mapping ─────────────────────────────────────────────

/** Maps voice profile names to Piper ONNX model filenames (without extension). */
const VOICE_MODEL_MAP: Record<string, string> = {
  // Female voices
  Aoede: 'en_US-amy-medium',
  Kore: 'en_US-lessac-medium',
  Leda: 'en_US-lessac-low',
  Zephyr: 'en_US-ljspeech-medium',
  // Male voices
  Puck: 'en_US-ryan-medium',
  Charon: 'en_US-arctic-medium',
  Fenrir: 'en_US-arctic-medium',
  Orus: 'en_US-arctic-medium',
};

/** Maps language codes to Piper model prefixes for multi-language support. */
const LANGUAGE_MODEL_MAP: Record<string, { female: string; male: string }> = {
  'en': { female: 'en_US-lessac-medium', male: 'en_US-arctic-medium' },
  'en-US': { female: 'en_US-lessac-medium', male: 'en_US-arctic-medium' },
  'en-GB': { female: 'en_GB-alba-medium', male: 'en_GB-alan-medium' },
  'fr': { female: 'fr_FR-siwis-medium', male: 'fr_FR-tom-medium' },
  'fr-FR': { female: 'fr_FR-siwis-medium', male: 'fr_FR-tom-medium' },
  'es': { female: 'es_ES-sharvard-medium', male: 'es_ES-davefx-medium' },
  'es-ES': { female: 'es_ES-sharvard-medium', male: 'es_ES-davefx-medium' },
  'de': { female: 'de_DE-eva_k-x_low', male: 'de_DE-thorsten-medium' },
  'de-DE': { female: 'de_DE-eva_k-x_low', male: 'de_DE-thorsten-medium' },
};

// ── Piper output constants ──────────────────────────────────────────

const PIPER_SAMPLE_RATE = 22050; // Piper outputs 22050 Hz by default
const PIPER_BYTES_PER_SAMPLE = 2; // 16-bit PCM = 2 bytes

// ── WAV header builder ──────────────────────────────────────────────

function buildWavHeader(dataLength: number, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // chunk size
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

// ── Helper: estimate duration from PCM data ─────────────────────────

function estimatePcmDurationMs(dataSize: number, sampleRate: number): number {
  return Math.round((dataSize / PIPER_BYTES_PER_SAMPLE / sampleRate) * 1000);
}

// ── Provider Implementation ─────────────────────────────────────────

export class PiperTTSProvider implements ITTSProvider {
  readonly name = 'piper';

  private voicesDir: string;
  private piperBinary: string;

  constructor(voicesDir?: string, piperBinary?: string) {
    this.voicesDir = voicesDir ?? process.env.PIPER_VOICES_DIR ?? '';
    this.piperBinary = piperBinary ?? process.env.PIPER_BINARY ?? 'piper';
  }

  /** Resolve the .onnx model path for a given voice and language. */
  resolveModelPath(voice: VoiceProfile, languageCode?: string): string | null {
    if (!this.voicesDir) return null;

    // Try voice-specific model first
    const voiceModel = VOICE_MODEL_MAP[voice.name];
    if (voiceModel) {
      const voicePath = path.join(this.voicesDir, `${voiceModel}.onnx`);
      if (fs.existsSync(voicePath)) return voicePath;
    }

    // Try language-specific model
    if (languageCode) {
      const langModels = LANGUAGE_MODEL_MAP[languageCode] ?? LANGUAGE_MODEL_MAP[languageCode.split('-')[0]];
      if (langModels) {
        const modelName = voice.gender === 'female' ? langModels.female : langModels.male;
        const langPath = path.join(this.voicesDir, `${modelName}.onnx`);
        if (fs.existsSync(langPath)) return langPath;
      }
    }

    // Fallback: try any English model by gender
    const fallback = voice.gender === 'female' ? 'en_US-lessac-medium' : 'en_US-arctic-medium';
    const fallbackPath = path.join(this.voicesDir, `${fallback}.onnx`);
    if (fs.existsSync(fallbackPath)) return fallbackPath;

    return null;
  }

  /** Synthesize a single text segment via the Piper binary. */
  synthesizeSegment(
    text: string,
    modelPath: string,
    lengthScale?: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const args = ['--model', modelPath, '--output_raw'];

      // Map speaking rate to Piper's length_scale (inverse: higher rate = lower scale)
      if (lengthScale !== undefined) {
        args.push('--length_scale', lengthScale.toFixed(2));
      }

      const proc = spawn(this.piperBinary, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const chunks: Buffer[] = [];
      let stderr = '';

      proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
      proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

      proc.on('error', (err) => {
        reject(new Error(`Piper process failed to start: ${err.message}`));
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Piper exited with code ${code}: ${stderr.trim()}`));
          return;
        }
        resolve(Buffer.concat(chunks));
      });

      // Send text and close stdin to signal end of input
      proc.stdin.write(text);
      proc.stdin.end();
    });
  }

  /** Convert raw PCM to the requested encoding. */
  encodeAudio(pcmData: Buffer, encoding?: AudioEncoding): { data: Uint8Array; encoding: AudioEncoding } {
    switch (encoding) {
      case AudioEncoding.PCM:
        return { data: new Uint8Array(pcmData), encoding: AudioEncoding.PCM };
      default:
        // Default to WAV (PCM with header) — widely compatible
        const wavHeader = buildWavHeader(pcmData.length, PIPER_SAMPLE_RATE);
        const wavData = Buffer.concat([wavHeader, pcmData]);
        return { data: new Uint8Array(wavData), encoding: AudioEncoding.PCM };
    }
  }

  /** Map voice speaking rate + options to Piper length_scale. */
  computeLengthScale(voice: VoiceProfile, options?: TTSOptions): number {
    const rate = options?.speakingRate ?? voice.speakingRate;
    // Piper length_scale is inverse of speaking rate: 1.0 = normal, <1.0 = faster, >1.0 = slower
    return 1.0 / rate;
  }

  async *synthesize(
    text: string,
    voice: VoiceProfile,
    options?: TTSOptions,
  ): AsyncIterable<AudioChunkOutput> {
    const modelPath = this.resolveModelPath(voice, options?.languageCode);
    if (!modelPath) {
      console.warn(
        `[PiperTTS] No voice model found for "${voice.name}" in ${this.voicesDir || '(PIPER_VOICES_DIR not set)'}. Skipping synthesis.`,
      );
      return;
    }

    const sentences = splitAtSentenceBoundaries(text);
    if (sentences.length === 0) return;

    const lengthScale = this.computeLengthScale(voice, options);
    const targetEncoding = options?.encoding ?? AudioEncoding.PCM;

    for (const sentence of sentences) {
      const cacheKeyStr = `piper:${voice.name}:${voice.gender}:${lengthScale}:${sentence}`;
      const cached = ttsCache.get(cacheKeyStr);
      if (cached) {
        const { data, encoding } = this.encodeAudio(cached, targetEncoding);
        yield {
          data,
          encoding,
          sampleRate: PIPER_SAMPLE_RATE,
          durationMs: estimatePcmDurationMs(cached.length, PIPER_SAMPLE_RATE),
        };
        continue;
      }

      try {
        const pcmData = await this.synthesizeSegment(sentence, modelPath, lengthScale);
        if (pcmData.length === 0) continue;

        // Cache the raw PCM data
        ttsCache.set(cacheKeyStr, pcmData);

        const { data, encoding } = this.encodeAudio(pcmData, targetEncoding);

        yield {
          data,
          encoding,
          sampleRate: PIPER_SAMPLE_RATE,
          durationMs: estimatePcmDurationMs(pcmData.length, PIPER_SAMPLE_RATE),
        };
      } catch (err) {
        console.error(`[PiperTTS] Synthesis failed for sentence: ${(err as Error).message}`);
        // Continue with remaining sentences
      }
    }
  }
}

// ── Exported constants for testing ──────────────────────────────────

export { VOICE_MODEL_MAP, LANGUAGE_MODEL_MAP, PIPER_SAMPLE_RATE };

// ── Auto-register ───────────────────────────────────────────────────

registerTTSProvider('piper', () => new PiperTTSProvider());
