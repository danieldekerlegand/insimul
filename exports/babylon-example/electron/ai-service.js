/**
 * Electron AI Service — IPC bridge for local AI capabilities
 *
 * Reads configuration from dist/data/ai_config.json and registers
 * IPC handlers for speech-to-text (ai:stt) in the Electron main process.
 */

const { ipcMain } = require('electron');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { WhisperSTTService } = require('./whisper-stt');

// ── Singleton ───────────────────────────────────────────────────────

const whisperService = new WhisperSTTService();

/**
 * Initialize the AI service. Call from main.js during app.whenReady().
 * @param {Electron.App} _app - Electron app instance (reserved for future use)
 */
async function initAIService(_app) {
  const appRoot = join(__dirname, '..');

  // Load ai_config.json
  let config = {};
  try {
    const configPath = join(appRoot, 'dist', 'data', 'ai_config.json');
    const raw = await readFile(configPath, 'utf8');
    config = JSON.parse(raw);
  } catch {
    console.warn('[AIService] Could not load ai_config.json — using defaults');
  }

  if (config.apiMode !== 'local') {
    console.log('[AIService] apiMode is not "local" — skipping local AI initialization');
    return;
  }

  await whisperService.init(appRoot, config);

  // Register IPC handler for speech-to-text
  ipcMain.handle('ai:stt', async (_event, audioBuffer, languageHint) => {
    return whisperService.transcribe(audioBuffer, languageHint);
  });

  // Register status handler
  ipcMain.handle('ai:stt-status', async () => {
    return { available: whisperService.available };
  });

  console.log('[AIService] STT IPC handlers registered');
}

module.exports = { initAIService };
