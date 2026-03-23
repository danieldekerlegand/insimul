/**
 * Piper TTS Provider (Unified AI Interface)
 *
 * Local text-to-speech using Piper (https://github.com/rhasspy/piper).
 * Implements the batch ITTSProvider from ai-provider.ts — accepts a voice name
 * string (e.g. "Kore") and returns a complete WAV buffer.
 *
 * Piper runs as a subprocess: text on stdin → raw 16-bit PCM on stdout.
 * Voice models are .onnx files stored in PIPER_VOICES_DIR.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import type { ITTSProvider, TTSOptions } from '../../ai-provider.js';
import { ttsCache, TTSCache } from '../../../tts-cache.js';
import { getProsodyForEmotion } from '@shared/emotional-tone.js';

// ── Voice model mapping ─────────────────────────────────────────────

/** Maps voice names (used by the game) to Piper ONNX model filenames (without extension). */
const VOICE_MODEL_MAP: Record<string, { model: string; gender: 'female' | 'male' }> = {
  // Female voices
  Aoede:  { model: 'en_US-amy-medium',     gender: 'female' },
  Kore:   { model: 'en_US-lessac-medium',   gender: 'female' },
  Leda:   { model: 'en_US-lessac-low',      gender: 'female' },
  Zephyr: { model: 'en_US-ljspeech-medium', gender: 'female' },
  // Male voices
  Puck:   { model: 'en_US-ryan-medium',     gender: 'male' },
  Charon: { model: 'en_US-arctic-medium',   gender: 'male' },
  Fenrir: { model: 'en_US-arctic-medium',   gender: 'male' },
  Orus:   { model: 'en_US-arctic-medium',   gender: 'male' },
};

/** Maps language codes to Piper model prefixes for multi-language support. */
const LANGUAGE_MODEL_MAP: Record<string, { female: string; male: string }> = {
  'en':    { female: 'en_US-lessac-medium',   male: 'en_US-arctic-medium' },
  'en-US': { female: 'en_US-lessac-medium',   male: 'en_US-arctic-medium' },
  'en-GB': { female: 'en_GB-alba-medium',     male: 'en_GB-alan-medium' },
  'fr':    { female: 'fr_FR-siwis-medium',    male: 'fr_FR-tom-medium' },
  'fr-FR': { female: 'fr_FR-siwis-medium',    male: 'fr_FR-tom-medium' },
  'es':    { female: 'es_ES-sharvard-medium', male: 'es_ES-davefx-medium' },
  'es-ES': { female: 'es_ES-sharvard-medium', male: 'es_ES-davefx-medium' },
  'de':    { female: 'de_DE-eva_k-x_low',    male: 'de_DE-thorsten-medium' },
  'de-DE': { female: 'de_DE-eva_k-x_low',    male: 'de_DE-thorsten-medium' },
};

// ── Constants ────────────────────────────────────────────────────────

const PIPER_SAMPLE_RATE = 22050;

// ── WAV header builder ───────────────────────────────────────────────

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
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

// ── Provider Implementation ──────────────────────────────────────────

export class PiperTTSProvider implements ITTSProvider {
  readonly name = 'piper-tts';

  private voicesDir: string;
  private piperBinary: string;

  constructor(voicesDir?: string, piperBinary?: string) {
    this.voicesDir = voicesDir ?? process.env.PIPER_VOICES_DIR ?? '';
    this.piperBinary = piperBinary ?? process.env.PIPER_BINARY ?? 'piper';
  }

  /** Resolve the .onnx model path for a voice name and optional language. */
  resolveModelPath(voice: string, languageCode?: string): string | null {
    if (!this.voicesDir) return null;

    const voiceInfo = VOICE_MODEL_MAP[voice];

    // Try voice-specific model first
    if (voiceInfo) {
      const voicePath = path.join(this.voicesDir, `${voiceInfo.model}.onnx`);
      if (fs.existsSync(voicePath)) return voicePath;
    }

    // Try language-specific model
    if (languageCode) {
      const langModels = LANGUAGE_MODEL_MAP[languageCode] ?? LANGUAGE_MODEL_MAP[languageCode.split('-')[0]];
      if (langModels) {
        const gender = voiceInfo?.gender ?? 'female';
        const modelName = gender === 'female' ? langModels.female : langModels.male;
        const langPath = path.join(this.voicesDir, `${modelName}.onnx`);
        if (fs.existsSync(langPath)) return langPath;
      }
    }

    // Fallback: English model by gender
    const gender = voiceInfo?.gender ?? 'female';
    const fallback = gender === 'female' ? 'en_US-lessac-medium' : 'en_US-arctic-medium';
    const fallbackPath = path.join(this.voicesDir, `${fallback}.onnx`);
    if (fs.existsSync(fallbackPath)) return fallbackPath;

    return null;
  }

  /** Map emotional tone to Piper length_scale (speed adjustment). */
  computeLengthScale(options?: TTSOptions): number {
    let rate = 1.0;

    if (options?.speed) {
      rate = options.speed;
    } else if (options?.emotionalTone) {
      const params = getProsodyForEmotion(options.emotionalTone);
      if (params) {
        // Parse rate like "110%" → 1.1
        const match = params.rate.match(/^(\d+)%$/);
        if (match) {
          rate = parseInt(match[1], 10) / 100;
        }
      }
    }

    // Piper length_scale is inverse of speaking rate
    return 1.0 / rate;
  }

  /** Run the Piper binary on a text string, returning raw PCM. */
  synthesizeRaw(text: string, modelPath: string, lengthScale?: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const args = ['--model', modelPath, '--output_raw'];
      if (lengthScale !== undefined && lengthScale !== 1.0) {
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

      proc.stdin.write(text);
      proc.stdin.end();
    });
  }

  async synthesize(text: string, voice: string = 'Kore', options?: TTSOptions): Promise<Buffer> {
    const modelPath = this.resolveModelPath(voice, options?.languageCode);
    if (!modelPath) {
      throw new Error(
        `No Piper voice model found for "${voice}" in ${this.voicesDir || '(PIPER_VOICES_DIR not set)'}`,
      );
    }

    const lengthScale = this.computeLengthScale(options);
    const tone = options?.emotionalTone ?? 'neutral';
    const cacheKey = TTSCache.makeKey(text, voice, 'neutral', 'wav', tone) + `:piper:${lengthScale}`;

    const cached = ttsCache.get(cacheKey);
    if (cached) return cached;

    const pcmData = await this.synthesizeRaw(text, modelPath, lengthScale);
    if (pcmData.length === 0) {
      throw new Error('Piper returned empty audio');
    }

    const wavHeader = buildWavHeader(pcmData.length, PIPER_SAMPLE_RATE);
    const wavBuffer = Buffer.concat([wavHeader, pcmData]);

    ttsCache.set(cacheKey, wavBuffer);
    return wavBuffer;
  }

  /** Check if Piper is available (voices dir is set and exists). */
  isAvailable(): boolean {
    return !!this.voicesDir && fs.existsSync(this.voicesDir);
  }
}

// ── Exported constants for testing ───────────────────────────────────

export { VOICE_MODEL_MAP, LANGUAGE_MODEL_MAP, PIPER_SAMPLE_RATE, buildWavHeader };
