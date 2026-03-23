/**
 * Whisper STT Service — Pure Node.js logic (no Electron dependency)
 *
 * Provides speech-to-text via whisper.cpp. Buffers audio, writes a temp
 * WAV file, invokes the whisper.cpp CLI, and parses the output.
 */

const { spawn } = require('node:child_process');
const { writeFile, unlink, mkdtemp, rmdir, access } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

// ── BCP-47 → Whisper language code mapping ──────────────────────────

const BCP47_TO_WHISPER = {
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

function bcp47ToWhisperLang(code) {
  return BCP47_TO_WHISPER[code.toLowerCase()];
}

// ── WAV helpers ─────────────────────────────────────────────────────

/**
 * Build a minimal 16-bit PCM WAV header.
 */
function buildWavHeader(pcmByteLength, sampleRate, channels) {
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
 * Wrap raw PCM bytes (16-bit, 16 kHz, mono) into a WAV buffer.
 */
function wrapPcmAsWav(pcm, sampleRate = 16000, channels = 1) {
  return Buffer.concat([buildWavHeader(pcm.length, sampleRate, channels), pcm]);
}

// ── Whisper STT Service ─────────────────────────────────────────────

class WhisperSTTService {
  constructor() {
    this.binaryPath = 'whisper-cpp';
    this.modelPath = '';
    this.available = false;
    this._queue = Promise.resolve();
  }

  /**
   * Initialize and verify model exists.
   * @param {string} appRoot - Absolute path to the app root directory
   * @param {object} [config] - Optional ai_config.json contents
   */
  async init(appRoot, config) {
    const modelRelative = config?.whisperModelPath || 'ai/models/whisper-base.bin';
    this.modelPath = join(appRoot, modelRelative);
    this.binaryPath = config?.whisperBinaryPath || 'whisper-cpp';

    try {
      await access(this.modelPath);
      this.available = true;
      console.log(`[WhisperSTT] Model loaded: ${this.modelPath}`);
    } catch {
      this.available = false;
      console.warn(`[WhisperSTT] Model not found at ${this.modelPath} — STT disabled`);
    }
  }

  /**
   * Transcribe audio buffer to text.
   * @param {ArrayBuffer|Buffer} audioBuffer - Raw audio data (PCM 16-bit 16kHz mono, or WAV)
   * @param {string} [languageHint] - BCP-47 language code
   * @returns {Promise<{text: string, language: string}>}
   */
  async transcribe(audioBuffer, languageHint) {
    if (!this.available) {
      return { text: '', language: '' };
    }

    // Serialize requests — whisper.cpp is single-threaded
    const result = new Promise((resolve, reject) => {
      this._queue = this._queue.then(() =>
        this._doTranscribe(audioBuffer, languageHint).then(resolve, reject)
      );
    });

    return result;
  }

  async _doTranscribe(audioBuffer, languageHint) {
    const buf = Buffer.isBuffer(audioBuffer)
      ? audioBuffer
      : Buffer.from(audioBuffer);

    // If the buffer already has a WAV header, use it as-is; otherwise wrap as WAV
    const isWav = buf.length >= 4 && buf.toString('ascii', 0, 4) === 'RIFF';
    const wavData = isWav ? buf : wrapPcmAsWav(buf);

    const tempDir = await mkdtemp(join(tmpdir(), 'whisper-'));
    const tempFile = join(tempDir, 'audio.wav');
    await writeFile(tempFile, wavData);

    try {
      const whisperLang = languageHint ? bcp47ToWhisperLang(languageHint) : undefined;
      const text = await this._invokeWhisper(tempFile, whisperLang);
      return {
        text: text.trim(),
        language: languageHint || 'en',
      };
    } catch (err) {
      console.error('[WhisperSTT] Transcription failed:', err.message);
      return { text: '', language: '' };
    } finally {
      await unlink(tempFile).catch(() => {});
      await rmdir(tempDir).catch(() => {});
    }
  }

  /**
   * Invoke the whisper.cpp binary and return the transcribed text.
   */
  _invokeWhisper(filePath, language) {
    return new Promise((resolve, reject) => {
      const args = [
        '-m', this.modelPath,
        '-f', filePath,
        '--no-timestamps',
        '--print-special', 'false',
        '-t', '4',
      ];

      if (language) {
        args.push('-l', language);
      }

      const proc = spawn(this.binaryPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('error', (err) => {
        reject(new Error(`[WhisperSTT] Failed to spawn "${this.binaryPath}": ${err.message}`));
      });

      proc.on('close', (code) => {
        if (code === 0) {
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

module.exports = {
  WhisperSTTService,
  buildWavHeader,
  wrapPcmAsWav,
  bcp47ToWhisperLang,
};
