/**
 * Electron AI Service — Piper TTS Integration
 *
 * Runs in Electron's main process. Spawns the Piper binary as a subprocess
 * to synthesize speech from text. Voice models (.onnx) are bundled in the
 * export under ai/models/voices/.
 *
 * Usage: call initAIService(app) from electron-main.js during startup.
 */

const { ipcMain } = require('electron');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// ── Voice model mapping ─────────────────────────────────────────────

const VOICE_MODEL_MAP = {
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

const LANGUAGE_MODEL_MAP = {
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

const PIPER_SAMPLE_RATE = 22050;

// ── WAV header builder ──────────────────────────────────────────────

function buildWavHeader(dataLength, sampleRate) {
  const header = Buffer.alloc(44);
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);       // PCM format chunk size
  header.writeUInt16LE(1, 20);        // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

// ── Model path resolution ───────────────────────────────────────────

function resolveModelPath(voicesDir, voice, languageCode) {
  if (!voicesDir) return null;

  const voiceInfo = VOICE_MODEL_MAP[voice];

  // Try voice-specific model first
  if (voiceInfo) {
    const voicePath = path.join(voicesDir, `${voiceInfo.model}.onnx`);
    if (fs.existsSync(voicePath)) return voicePath;
  }

  // Try language-specific model
  if (languageCode) {
    const langKey = languageCode.split('-')[0];
    const langModels = LANGUAGE_MODEL_MAP[languageCode] || LANGUAGE_MODEL_MAP[langKey];
    if (langModels) {
      const gender = voiceInfo ? voiceInfo.gender : 'female';
      const modelName = gender === 'female' ? langModels.female : langModels.male;
      const langPath = path.join(voicesDir, `${modelName}.onnx`);
      if (fs.existsSync(langPath)) return langPath;
    }
  }

  // Fallback: English model by gender
  const gender = voiceInfo ? voiceInfo.gender : 'female';
  const fallback = gender === 'female' ? 'en_US-lessac-medium' : 'en_US-arctic-medium';
  const fallbackPath = path.join(voicesDir, `${fallback}.onnx`);
  if (fs.existsSync(fallbackPath)) return fallbackPath;

  return null;
}

// ── Piper subprocess synthesis ──────────────────────────────────────

function synthesizeRaw(piperBinary, text, modelPath, lengthScale) {
  return new Promise((resolve, reject) => {
    const args = ['--model', modelPath, '--output_raw'];
    if (lengthScale !== undefined && lengthScale !== 1.0) {
      args.push('--length_scale', lengthScale.toFixed(2));
    }

    const proc = spawn(piperBinary, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const chunks = [];
    let stderr = '';

    proc.stdout.on('data', (chunk) => chunks.push(chunk));
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

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

// ── TTS Cache ───────────────────────────────────────────────────────

const ttsCache = new Map();
const MAX_CACHE_SIZE = 200;

function getCacheKey(text, voice, speed) {
  return `${voice}:${speed}:${text}`;
}

function cacheGet(key) {
  return ttsCache.get(key) || null;
}

function cacheSet(key, value) {
  if (ttsCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry
    const firstKey = ttsCache.keys().next().value;
    ttsCache.delete(firstKey);
  }
  ttsCache.set(key, value);
}

// ── Main init function ──────────────────────────────────────────────

let ttsAvailable = false;
let voicesDir = '';
let piperBinary = 'piper';

function initAIService(app) {
  // Resolve paths relative to app root
  const appRoot = app.isPackaged
    ? path.dirname(app.getPath('exe'))
    : path.join(__dirname, '..');

  voicesDir = path.join(appRoot, 'ai', 'models', 'voices');
  piperBinary = path.join(appRoot, 'ai', 'bin', 'piper');

  // Fall back to system piper if bundled binary doesn't exist
  if (!fs.existsSync(piperBinary)) {
    piperBinary = 'piper';
  }

  // Check if any voice models are available
  ttsAvailable = fs.existsSync(voicesDir) && fs.readdirSync(voicesDir).some(
    (f) => f.endsWith('.onnx'),
  );

  if (ttsAvailable) {
    console.log(`[ai-service] Piper TTS available. Voices: ${voicesDir}`);
  } else {
    console.log('[ai-service] Piper TTS not available (no voice models found)');
  }

  // ── IPC Handlers ────────────────────────────────────────────────

  ipcMain.handle('ai:tts', async (_event, { text, voice, speed, languageCode }) => {
    if (!ttsAvailable) return null;
    if (!text || typeof text !== 'string' || text.trim().length === 0) return null;

    const voiceName = voice || 'Kore';
    const lengthScale = speed ? (1.0 / speed) : 1.0;
    const cacheKey = getCacheKey(text, voiceName, lengthScale);

    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const modelPath = resolveModelPath(voicesDir, voiceName, languageCode);
    if (!modelPath) {
      console.warn(`[ai-service] No voice model found for "${voiceName}"`);
      return null;
    }

    try {
      const pcmData = await synthesizeRaw(piperBinary, text, modelPath, lengthScale);
      if (pcmData.length === 0) {
        console.warn('[ai-service] Piper returned empty audio');
        return null;
      }

      const wavHeader = buildWavHeader(pcmData.length, PIPER_SAMPLE_RATE);
      const wavBuffer = Buffer.concat([wavHeader, pcmData]);

      // Return as ArrayBuffer for IPC transfer
      const arrayBuffer = wavBuffer.buffer.slice(
        wavBuffer.byteOffset,
        wavBuffer.byteOffset + wavBuffer.byteLength,
      );

      cacheSet(cacheKey, arrayBuffer);
      return arrayBuffer;
    } catch (err) {
      console.error(`[ai-service] TTS synthesis failed: ${err.message}`);
      return null;
    }
  });

  ipcMain.handle('ai:status', async () => {
    return {
      ttsAvailable,
      voicesDir,
      voiceCount: ttsAvailable
        ? fs.readdirSync(voicesDir).filter((f) => f.endsWith('.onnx')).length
        : 0,
    };
  });

  return { ttsAvailable };
}

module.exports = { initAIService };

// Exported for testing
module.exports._internal = {
  VOICE_MODEL_MAP,
  LANGUAGE_MODEL_MAP,
  PIPER_SAMPLE_RATE,
  buildWavHeader,
  resolveModelPath,
  synthesizeRaw,
  getCacheKey,
};
