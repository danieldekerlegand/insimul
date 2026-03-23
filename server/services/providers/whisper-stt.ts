/**
 * Whisper.cpp Batch STT Provider
 *
 * Wraps the WhisperSTTProvider behind the IBatchSTTProvider interface
 * so it can be used by HTTP routes via the unified provider registry.
 *
 * Supports audio input in webm, wav, mp3, and raw PCM formats.
 * Converts non-PCM formats to 16kHz mono WAV via ffmpeg when available,
 * or passes through WAV files directly.
 */

import type { IBatchSTTProvider, STTRequest, STTResponse } from './types.js';
import { sttRegistry } from './registry.js';
import {
  WhisperSTTProvider,
  wrapPcmAsWav,
} from '../conversation/stt/whisper-stt-provider.js';
import { AudioEncoding } from '../../../shared/proto/conversation.js';
import type { AudioStreamChunk } from '../conversation/stt/stt-provider.js';
import { spawn } from 'child_process';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// ── Language hint mapping ────────────────────────────────────────────

const LANGUAGE_NAME_TO_BCP47: Record<string, string> = {
  english: 'en-US',
  french: 'fr-FR',
  spanish: 'es-ES',
  german: 'de-DE',
  italian: 'it-IT',
  portuguese: 'pt-BR',
  japanese: 'ja-JP',
  korean: 'ko-KR',
  chinese: 'zh-CN',
  arabic: 'ar-XA',
  russian: 'ru-RU',
  dutch: 'nl-NL',
  turkish: 'tr-TR',
  hindi: 'hi-IN',
};

function languageHintToBcp47(hint?: string): string | undefined {
  if (!hint) return undefined;
  const lower = hint.toLowerCase().trim();
  // Already a BCP-47 code (e.g. "en-US", "fr")
  if (/^[a-z]{2}(-[a-z]{2,})?$/i.test(lower)) return lower;
  return LANGUAGE_NAME_TO_BCP47[lower];
}

// ── MIME type → encoding mapping ─────────────────────────────────────

const MIME_TO_ENCODING: Record<string, AudioEncoding> = {
  'audio/pcm': AudioEncoding.PCM,
  'audio/wav': AudioEncoding.PCM,
  'audio/wave': AudioEncoding.PCM,
  'audio/x-wav': AudioEncoding.PCM,
  'audio/webm': AudioEncoding.OPUS,
  'audio/ogg': AudioEncoding.OPUS,
  'audio/mp3': AudioEncoding.MP3,
  'audio/mpeg': AudioEncoding.MP3,
};

function isWavFormat(mimeType?: string): boolean {
  if (!mimeType) return false;
  const lower = mimeType.toLowerCase();
  return lower === 'audio/wav' || lower === 'audio/wave' || lower === 'audio/x-wav';
}

function needsConversion(mimeType?: string): boolean {
  if (!mimeType) return false;
  const lower = mimeType.toLowerCase();
  return !isWavFormat(lower) && lower !== 'audio/pcm';
}

// ── Audio format conversion via ffmpeg ───────────────────────────────

/**
 * Convert audio buffer to 16kHz mono WAV using ffmpeg.
 * Falls back to passing through the buffer if ffmpeg is unavailable.
 */
async function convertToWav(audioBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const tempDir = await mkdtemp(join(tmpdir(), 'whisper-convert-'));
  const inputExt = mimeType.includes('webm') ? '.webm'
    : mimeType.includes('mp3') || mimeType.includes('mpeg') ? '.mp3'
    : mimeType.includes('ogg') ? '.ogg'
    : '.bin';
  const inputPath = join(tempDir, `input${inputExt}`);
  const outputPath = join(tempDir, 'output.wav');

  await writeFile(inputPath, audioBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('ffmpeg', [
        '-y', '-i', inputPath,
        '-ar', '16000', '-ac', '1', '-f', 'wav',
        outputPath,
      ], { stdio: ['ignore', 'ignore', 'pipe'] });

      let stderr = '';
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

      proc.on('error', () => {
        reject(new Error('[WhisperBatchSTT] ffmpeg not found — install ffmpeg for non-WAV audio format support'));
      });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`[WhisperBatchSTT] ffmpeg exited with code ${code}: ${stderr.slice(0, 300)}`));
      });
    });

    const { readFile } = await import('fs/promises');
    return await readFile(outputPath);
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    const { rmdir } = await import('fs/promises');
    await rmdir(tempDir).catch(() => {});
  }
}

// ── Provider ─────────────────────────────────────────────────────────

export class WhisperBatchSTTProvider implements IBatchSTTProvider {
  readonly name = 'whisper';
  private whisper = new WhisperSTTProvider();

  async transcribe(request: STTRequest): Promise<STTResponse> {
    if (!this.whisper.isConfigured()) {
      throw new Error(
        '[WhisperBatchSTT] Not configured — set WHISPER_MODEL_PATH and optionally WHISPER_CPP_PATH',
      );
    }

    const mimeType = request.mimeType?.toLowerCase() ?? 'audio/wav';
    let audioData = request.audioBuffer;

    // Convert non-WAV/PCM formats to WAV via ffmpeg
    if (needsConversion(mimeType)) {
      audioData = await convertToWav(audioData, mimeType);
    } else if (mimeType === 'audio/pcm') {
      // Wrap raw PCM as WAV for whisper.cpp
      audioData = wrapPcmAsWav(audioData);
    }
    // WAV files are passed through directly

    // Build a single-chunk async iterable for the streaming provider
    const encoding = MIME_TO_ENCODING[mimeType] ?? AudioEncoding.PCM;
    const chunk: AudioStreamChunk = {
      data: new Uint8Array(audioData),
      encoding: isWavFormat(mimeType) || mimeType === 'audio/pcm' ? AudioEncoding.PCM : encoding,
      sampleRate: 16000,
    };

    async function* audioStream(): AsyncIterable<AudioStreamChunk> {
      yield chunk;
    }

    const bcp47 = languageHintToBcp47(request.languageHint);
    let transcript = '';

    for await (const result of this.whisper.streamTranscription(audioStream(), {
      languageCode: bcp47,
      sampleRate: 16000,
    })) {
      if (result.isFinal) {
        transcript += (transcript ? ' ' : '') + result.text;
      }
    }

    return { transcript };
  }
}

sttRegistry.register('whisper', () => new WhisperBatchSTTProvider());
