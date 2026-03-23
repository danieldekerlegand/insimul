/**
 * Electron AI Service — node-llama-cpp integration for local inference
 *
 * Loads a GGUF model once at startup, registers IPC handlers for
 * text generation (single + streaming) and status queries.
 * Requests are serialized through a FIFO queue since llama.cpp
 * uses a single context.
 */

const { ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

/** @type {{ llama: any, model: any, context: any } | null} */
let state = null;

/** @type {boolean} */
let aiAvailable = false;

/** @type {{ modelName: string, gpuType: string }} */
let modelInfo = { modelName: '', gpuType: 'none' };

/** @type {Promise<void>} */
let requestQueue = Promise.resolve();

/**
 * Initialize the AI service: load the model and register IPC handlers.
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
