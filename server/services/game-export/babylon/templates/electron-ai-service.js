/**
 * Electron AI Service — node-llama-cpp inference + Piper TTS
 *
 * Loads a GGUF model once at startup for text generation, and integrates
 * Piper TTS for speech synthesis. Registers IPC handlers for text generation
 * (single + streaming), TTS, and status queries.
 * LLM requests are serialized through a FIFO queue since llama.cpp
 * uses a single context.
 */

const { ipcMain } = require('electron');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// ── LLM State ────────────────────────────────────────────────────────

/** @type {{ llama: any, model: any, context: any } | null} */
let state = null;

/** @type {boolean} */
let aiAvailable = false;

/** @type {{ modelName: string, gpuType: string }} */
let modelInfo = { modelName: '', gpuType: 'none' };

/** @type {Promise<void>} */
let requestQueue = Promise.resolve();

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

// ── TTS State ───────────────────────────────────────────────────────

let ttsAvailable = false;
let voicesDir = '';
let piperBinary = 'piper';

/**
 * Initialize the AI service: load the LLM model and set up Piper TTS,
 * then register IPC handlers.
 * Call this from electron/main.js during app.whenReady().
 *
 * @param {Electron.App} app - The Electron app instance
 * @param {Electron.BrowserWindow | null} mainWindow - The main window (for streaming)
 */
async function initAIService(app, mainWindow) {
  registerIPCHandlers(mainWindow);

  const appRoot = app.isPackaged
    ? path.dirname(app.getPath('exe'))
    : path.join(__dirname, '..');

  // ── Piper TTS Setup ──────────────────────────────────────────────
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

  // ── LLM Setup ────────────────────────────────────────────────────

  // Read AI config to determine if local AI is enabled
  const configPath = path.join(appRoot, 'dist', 'data', 'ai_config.json');
  if (!fs.existsSync(configPath)) {
    console.log('[ai-service] No ai_config.json found — AI disabled');
    return;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('[ai-service] Failed to parse ai_config.json:', err.message);
    return;
  }

  if (config.apiMode !== 'local') {
    console.log(`[ai-service] apiMode is '${config.apiMode}', not 'local' — skipping model load`);
    return;
  }

  // Resolve model path
  const modelPath = config.localModelPath
    ? path.resolve(appRoot, config.localModelPath)
    : path.join(appRoot, 'ai', 'models', 'phi-4-mini-q4.gguf');

  if (!fs.existsSync(modelPath)) {
    console.error(`[ai-service] Model file not found: ${modelPath}`);
    return;
  }

  modelInfo.modelName = config.localModelName || path.basename(modelPath, '.gguf');

  try {
    console.log('[ai-service] Loading node-llama-cpp engine...');
    const { getLlama, LlamaChatSession } = require('node-llama-cpp');

    const llama = await getLlama();
    modelInfo.gpuType = llama.gpu ? String(llama.gpu) : 'cpu';
    console.log(`[ai-service] GPU: ${modelInfo.gpuType}`);

    console.log(`[ai-service] Loading model: ${modelPath}`);
    const model = await llama.loadModel({ modelPath });

    const contextSize = config.contextSize || 4096;
    const context = await model.createContext({ contextSize });
    console.log(`[ai-service] Model loaded. Context: ${contextSize} tokens`);

    state = { llama, model, context, LlamaChatSession };
    aiAvailable = true;
  } catch (err) {
    console.error('[ai-service] Failed to load model:', err.message);
    aiAvailable = false;
  }
}

/**
 * Enqueue a task to serialize access to the llama context.
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
function enqueue(fn) {
  const result = requestQueue.then(fn, fn);
  requestQueue = result.then(() => {}, () => {});
  return result;
}

/**
 * Register all AI-related IPC handlers.
 * @param {Electron.BrowserWindow | null} mainWindow
 */
function registerIPCHandlers(mainWindow) {
  // --- Status ---
  ipcMain.handle('ai:status', () => ({
    loaded: aiAvailable,
    modelName: modelInfo.modelName,
    gpuType: modelInfo.gpuType,
    ttsAvailable,
    voicesDir,
    voiceCount: ttsAvailable && voicesDir && fs.existsSync(voicesDir)
      ? fs.readdirSync(voicesDir).filter((f) => f.endsWith('.onnx')).length
      : 0,
  }));

  // --- Single completion ---
  ipcMain.handle('ai:generate', async (_event, { prompt, systemPrompt, temperature, maxTokens }) => {
    if (!state || !aiAvailable) {
      return { error: 'AI not available' };
    }

    return enqueue(async () => {
      const session = new state.LlamaChatSession({
        contextSequence: state.context.getSequence(),
      });

      try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const response = await session.prompt(fullPrompt, {
          temperature: temperature ?? 0.7,
          maxTokens: maxTokens ?? 2048,
        });

        return { text: response, model: modelInfo.modelName };
      } finally {
        session.dispose();
      }
    });
  });

  // --- Streaming completion ---
  ipcMain.handle('ai:generate-stream', async (event, { prompt, systemPrompt, temperature, maxTokens }) => {
    if (!state || !aiAvailable) {
      return { error: 'AI not available' };
    }

    // Resolve the sender window for streaming tokens back
    const sender = event.sender;

    return enqueue(async () => {
      const session = new state.LlamaChatSession({
        contextSequence: state.context.getSequence(),
      });

      try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const fullText = await session.prompt(fullPrompt, {
          temperature: temperature ?? 0.7,
          maxTokens: maxTokens ?? 2048,
          onTextChunk(chunk) {
            if (!sender.isDestroyed()) {
              sender.send('ai:stream-token', chunk);
            }
          },
        });

        if (!sender.isDestroyed()) {
          sender.send('ai:stream-end');
        }

        return { text: fullText, model: modelInfo.modelName };
      } catch (err) {
        if (!sender.isDestroyed()) {
          sender.send('ai:stream-error', err.message);
        }
        return { error: err.message };
      } finally {
        session.dispose();
      }
    });
  });

  // --- Text-to-speech via Piper ---
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
}

/**
 * Clean up AI resources. Call on app quit.
 */
async function disposeAIService() {
  if (state) {
    await state.context.dispose();
    state.model.dispose();
    await state.llama.dispose();
    state = null;
    aiAvailable = false;
  }
}

module.exports = { initAIService, disposeAIService };

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
