/**
 * Tests for the Electron AI service module and its integration
 * into the Babylon.js export pipeline.
 *
 * Verifies:
 * - ai-service.js template is generated for Electron exports
 * - electron-main.js template imports and initializes the AI service
 * - node-llama-cpp is included as a dependency for Electron exports
 * - AI service handles missing config, non-local apiMode, and missing model gracefully
 * - IPC handlers are registered for ai:generate, ai:generate-stream, ai:status, ai:tts
 * - Request queue serializes concurrent requests
 * - Piper TTS voice model mapping, WAV header generation, and model path resolution
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateProjectFiles } from '../services/game-export/babylon/babylon-project-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

const __dirname_test = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname_test, '..', 'services', 'game-export', 'babylon', 'templates');

// ── Minimal WorldIR fixture ──────────────────────────────────────────────

function createMinimalIR(): WorldIR {
  return {
    meta: {
      worldId: 'world-test',
      worldName: 'Test World',
      worldType: 'fantasy',
      gameType: 'rpg',
      exportVersion: '1.0.0',
    },
    entities: {
      characters: [],
      npcs: [],
      items: [],
      businesses: [],
    },
    geography: {
      settlements: [],
      lots: [],
      residences: [],
      roads: [],
      waterFeatures: [],
    },
    systems: {
      rules: [],
      actions: [],
      quests: [],
      dialogueContexts: [],
    },
    theme: {
      palette: {},
      skybox: 'default',
      terrain: 'grass',
      architecture: 'medieval',
      lighting: 'natural',
    },
    aiConfig: {
      apiMode: 'local',
      insimulEndpoint: '',
      geminiModel: '',
      geminiApiKeyPlaceholder: '',
      voiceEnabled: true,
      defaultVoice: 'Kore',
      localModelPath: 'ai/models/phi-4-mini-q4.gguf',
      localModelName: 'phi-4-mini-q4',
    },
    resources: null,
  } as unknown as WorldIR;
}

// ── Template content tests ───────────────────────────────────────────────

describe('electron-ai-service.js template', () => {
  let aiServiceContent: string;

  beforeEach(() => {
    aiServiceContent = readFileSync(join(TEMPLATES_DIR, 'electron-ai-service.js'), 'utf8');
  });

  it('exports initAIService and disposeAIService', () => {
    expect(aiServiceContent).toContain('module.exports = { initAIService, disposeAIService }');
  });

  it('defines initAIService as an async function', () => {
    expect(aiServiceContent).toContain('async function initAIService(app, mainWindow)');
  });

  it('reads ai_config.json to check apiMode', () => {
    expect(aiServiceContent).toContain('ai_config.json');
    expect(aiServiceContent).toContain("config.apiMode !== 'local'");
  });

  it('loads node-llama-cpp dynamically', () => {
    expect(aiServiceContent).toContain("require('node-llama-cpp')");
  });

  it('detects GPU type from llama instance', () => {
    expect(aiServiceContent).toContain('llama.gpu');
    expect(aiServiceContent).toContain("String(llama.gpu) : 'cpu'");
  });

  it('registers ai:status IPC handler', () => {
    expect(aiServiceContent).toContain("ipcMain.handle('ai:status'");
  });

  it('registers ai:generate IPC handler', () => {
    expect(aiServiceContent).toContain("ipcMain.handle('ai:generate'");
  });

  it('registers ai:generate-stream IPC handler with streaming tokens', () => {
    expect(aiServiceContent).toContain("ipcMain.handle('ai:generate-stream'");
    expect(aiServiceContent).toContain("sender.send('ai:stream-token'");
    expect(aiServiceContent).toContain("sender.send('ai:stream-end')");
  });

  it('implements FIFO request queue for serialization', () => {
    expect(aiServiceContent).toContain('function enqueue(fn)');
    expect(aiServiceContent).toContain('requestQueue');
  });

  it('sets aiAvailable = false on model load failure', () => {
    expect(aiServiceContent).toContain('aiAvailable = false');
  });

  it('gracefully handles missing ai_config.json', () => {
    expect(aiServiceContent).toContain('No ai_config.json found');
  });

  it('gracefully handles missing model file', () => {
    expect(aiServiceContent).toContain('Model file not found');
  });

  it('disposes all resources on cleanup', () => {
    expect(aiServiceContent).toContain('async function disposeAIService()');
    expect(aiServiceContent).toContain('state.context.dispose()');
    expect(aiServiceContent).toContain('state.model.dispose()');
    expect(aiServiceContent).toContain('state.llama.dispose()');
  });

  it('checks sender.isDestroyed() before sending stream tokens', () => {
    expect(aiServiceContent).toContain('sender.isDestroyed()');
  });
});

// ── electron-main.js integration tests ───────────────────────────────────

describe('electron-main.js template', () => {
  let mainContent: string;

  beforeEach(() => {
    mainContent = readFileSync(join(TEMPLATES_DIR, 'electron-main.js'), 'utf8');
  });

  it('imports initAIService and disposeAIService from ai-service', () => {
    expect(mainContent).toContain("require('./ai-service')");
    expect(mainContent).toContain('initAIService');
    expect(mainContent).toContain('disposeAIService');
  });

  it('calls initAIService during app.whenReady()', () => {
    expect(mainContent).toContain('await initAIService(app, win)');
  });

  it('calls disposeAIService on window-all-closed', () => {
    expect(mainContent).toContain('await disposeAIService()');
  });
});

// ── Project generator integration tests ──────────────────────────────────

describe('babylon-project-generator electron AI integration', () => {
  it('includes electron/ai-service.js in generated files', () => {
    const ir = createMinimalIR();
    const files = generateProjectFiles(ir, { mode: 'electron' });
    const aiServiceFile = files.find(f => f.path === 'electron/ai-service.js');
    expect(aiServiceFile).toBeDefined();
    expect(aiServiceFile!.content).toContain('initAIService');
  });

  it('does NOT include ai-service.js for web mode', () => {
    const ir = createMinimalIR();
    const files = generateProjectFiles(ir, { mode: 'web' });
    const aiServiceFile = files.find(f => f.path === 'electron/ai-service.js');
    expect(aiServiceFile).toBeUndefined();
  });

  it('adds node-llama-cpp as a dependency for electron mode', () => {
    const ir = createMinimalIR();
    const files = generateProjectFiles(ir, { mode: 'electron' });
    const pkgFile = files.find(f => f.path === 'package.json');
    expect(pkgFile).toBeDefined();
    const pkg = JSON.parse(pkgFile!.content as string);
    expect(pkg.dependencies['node-llama-cpp']).toBe('^3.18.1');
  });

  it('does NOT add node-llama-cpp for web mode', () => {
    const ir = createMinimalIR();
    const files = generateProjectFiles(ir, { mode: 'web' });
    const pkgFile = files.find(f => f.path === 'package.json');
    const pkg = JSON.parse(pkgFile!.content as string);
    expect(pkg.dependencies['node-llama-cpp']).toBeUndefined();
  });

  it('adds electron-rebuild as a devDependency for electron mode', () => {
    const ir = createMinimalIR();
    const files = generateProjectFiles(ir, { mode: 'electron' });
    const pkgFile = files.find(f => f.path === 'package.json');
    const pkg = JSON.parse(pkgFile!.content as string);
    expect(pkg.devDependencies['electron-rebuild']).toBeDefined();
  });

  it('includes postinstall script for electron-rebuild', () => {
    const ir = createMinimalIR();
    const files = generateProjectFiles(ir, { mode: 'electron' });
    const pkgFile = files.find(f => f.path === 'package.json');
    const pkg = JSON.parse(pkgFile!.content as string);
    expect(pkg.scripts.postinstall).toBe('electron-rebuild');
  });

  it('includes node-llama-cpp and ai-service.js in build files list', () => {
    const ir = createMinimalIR();
    const files = generateProjectFiles(ir, { mode: 'electron' });
    const pkgFile = files.find(f => f.path === 'package.json');
    const pkg = JSON.parse(pkgFile!.content as string);
    expect(pkg.build.files).toContain('electron/ai-service.js');
    expect(pkg.build.files).toContain('node_modules/node-llama-cpp/**/*');
  });
});

// ── AI service logic unit tests (mock-based) ─────────────────────────────

describe('ai-service request queue logic', () => {
  it('serializes concurrent requests through FIFO queue', async () => {
    const order: number[] = [];
    let queue: Promise<void> = Promise.resolve();

    function enqueue<T>(fn: () => Promise<T>): Promise<T> {
      const result = queue.then(fn, fn);
      queue = result.then(() => {}, () => {});
      return result;
    }

    const p1 = enqueue(async () => {
      await new Promise(r => setTimeout(r, 10));
      order.push(1);
    });
    const p2 = enqueue(async () => {
      order.push(2);
    });
    const p3 = enqueue(async () => {
      order.push(3);
    });

    await Promise.all([p1, p2, p3]);
    expect(order).toEqual([1, 2, 3]);
  });

  it('continues queue even if a request fails', async () => {
    const results: string[] = [];
    let queue: Promise<void> = Promise.resolve();

    function enqueue<T>(fn: () => Promise<T>): Promise<T> {
      const result = queue.then(fn, fn);
      queue = result.then(() => {}, () => {});
      return result;
    }

    const p1 = enqueue(async () => {
      results.push('first');
    });
    const p2 = enqueue(async () => {
      throw new Error('fail');
    }).catch(() => {
      results.push('caught');
    });
    const p3 = enqueue(async () => {
      results.push('third');
    });

    await Promise.all([p1, p2, p3]);
    expect(results).toEqual(['first', 'caught', 'third']);
  });
});

// ── Piper TTS Tests (sandbox-based) ─────────────────────────────────────

const templatePath = join(__dirname_test, '..', 'services', 'game-export', 'babylon', 'templates', 'electron-ai-service.js');
const templateContent = readFileSync(templatePath, 'utf-8');

const MOCK_DIR = '/tmp/electron-ai-test-voices';

// Create a mock require function and evaluate the CJS module
function loadModule(existsSyncFn?: (p: string) => boolean) {
  const mockFs = {
    existsSync: existsSyncFn ?? ((p: string) => {
      if (typeof p === 'string' && p.startsWith(MOCK_DIR) && p.endsWith('.onnx')) return true;
      if (p === MOCK_DIR) return true;
      return false;
    }),
    readdirSync: () => ['en_US-lessac-medium.onnx'],
    readFileSync: () => '{}',
  };

  const mockIpcMain = { handle: () => {} };

  const mockRequire = (mod: string) => {
    if (mod === 'electron') return { ipcMain: mockIpcMain };
    if (mod === 'node:child_process') return { spawn: () => {} };
    if (mod === 'node:path') return path;
    if (mod === 'node:fs') return mockFs;
    throw new Error(`Unexpected require: ${mod}`);
  };

  const moduleExports: Record<string, any> = {};
  const moduleObj = { exports: moduleExports };
  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', templateContent);
  fn(moduleObj, moduleExports, mockRequire, __dirname_test, __filename);
  return moduleObj.exports;
}

const mod = loadModule();
const {
  VOICE_MODEL_MAP,
  LANGUAGE_MODEL_MAP,
  PIPER_SAMPLE_RATE,
  buildWavHeader,
  resolveModelPath,
  getCacheKey,
} = mod._internal;

// ── Template structure ──────────────────────────────────────────────

describe('Electron AI Service — template structure', () => {
  it('exports initAIService function', () => {
    expect(typeof mod.initAIService).toBe('function');
  });

  it('exports _internal for testing', () => {
    expect(mod._internal).toBeDefined();
  });

  it('registers ai:tts IPC handler', () => {
    expect(templateContent).toContain("ipcMain.handle('ai:tts'");
  });

  it('registers ai:status IPC handler', () => {
    expect(templateContent).toContain("ipcMain.handle('ai:status'");
  });

  it('includes graceful null return on failure', () => {
    expect(templateContent).toContain('return null;');
  });

  it('resolves piper binary from app root', () => {
    expect(templateContent).toContain("path.join(appRoot, 'ai', 'bin', 'piper')");
  });

  it('resolves voices dir from app root', () => {
    expect(templateContent).toContain("path.join(appRoot, 'ai', 'models', 'voices')");
  });
});

// ── Voice Model Map ─────────────────────────────────────────────────

describe('Electron AI Service — VOICE_MODEL_MAP', () => {
  it('maps all expected voice names', () => {
    const expected = ['Aoede', 'Kore', 'Leda', 'Zephyr', 'Puck', 'Charon', 'Fenrir', 'Orus'];
    for (const name of expected) {
      expect(VOICE_MODEL_MAP[name]).toBeDefined();
      expect(VOICE_MODEL_MAP[name].model).toBeTruthy();
      expect(VOICE_MODEL_MAP[name].gender).toMatch(/^(male|female)$/);
    }
  });

  it('female voices map to female gender', () => {
    expect(VOICE_MODEL_MAP.Aoede.gender).toBe('female');
    expect(VOICE_MODEL_MAP.Kore.gender).toBe('female');
    expect(VOICE_MODEL_MAP.Leda.gender).toBe('female');
    expect(VOICE_MODEL_MAP.Zephyr.gender).toBe('female');
  });

  it('male voices map to male gender', () => {
    expect(VOICE_MODEL_MAP.Puck.gender).toBe('male');
    expect(VOICE_MODEL_MAP.Charon.gender).toBe('male');
    expect(VOICE_MODEL_MAP.Fenrir.gender).toBe('male');
    expect(VOICE_MODEL_MAP.Orus.gender).toBe('male');
  });

  it('matches server-side voice model names', () => {
    expect(VOICE_MODEL_MAP.Kore.model).toBe('en_US-lessac-medium');
    expect(VOICE_MODEL_MAP.Puck.model).toBe('en_US-ryan-medium');
    expect(VOICE_MODEL_MAP.Aoede.model).toBe('en_US-amy-medium');
    expect(VOICE_MODEL_MAP.Charon.model).toBe('en_US-arctic-medium');
  });
});

// ── Language Model Map ──────────────────────────────────────────────

describe('Electron AI Service — LANGUAGE_MODEL_MAP', () => {
  it('supports English, French, Spanish, and German', () => {
    expect(LANGUAGE_MODEL_MAP['en']).toBeDefined();
    expect(LANGUAGE_MODEL_MAP['fr']).toBeDefined();
    expect(LANGUAGE_MODEL_MAP['es']).toBeDefined();
    expect(LANGUAGE_MODEL_MAP['de']).toBeDefined();
  });

  it('supports regional variants', () => {
    expect(LANGUAGE_MODEL_MAP['en-US']).toBeDefined();
    expect(LANGUAGE_MODEL_MAP['en-GB']).toBeDefined();
    expect(LANGUAGE_MODEL_MAP['fr-FR']).toBeDefined();
    expect(LANGUAGE_MODEL_MAP['es-ES']).toBeDefined();
    expect(LANGUAGE_MODEL_MAP['de-DE']).toBeDefined();
  });

  it('has male and female models for each language', () => {
    for (const [, models] of Object.entries(LANGUAGE_MODEL_MAP)) {
      const m = models as { female: string; male: string };
      expect(m.female).toBeTruthy();
      expect(m.male).toBeTruthy();
    }
  });
});

// ── WAV Header ──────────────────────────────────────────────────────

describe('Electron AI Service — buildWavHeader', () => {
  it('creates a 44-byte header', () => {
    const header = buildWavHeader(1000, PIPER_SAMPLE_RATE);
    expect(header.length).toBe(44);
  });

  it('starts with RIFF magic', () => {
    const header = buildWavHeader(1000, PIPER_SAMPLE_RATE);
    expect(header.toString('ascii', 0, 4)).toBe('RIFF');
  });

  it('contains WAVE format tag', () => {
    const header = buildWavHeader(1000, PIPER_SAMPLE_RATE);
    expect(header.toString('ascii', 8, 12)).toBe('WAVE');
  });

  it('encodes correct sample rate', () => {
    const header = buildWavHeader(1000, PIPER_SAMPLE_RATE);
    expect(header.readUInt32LE(24)).toBe(PIPER_SAMPLE_RATE);
  });

  it('encodes correct data chunk size', () => {
    const dataSize = 8820;
    const header = buildWavHeader(dataSize, PIPER_SAMPLE_RATE);
    expect(header.readUInt32LE(40)).toBe(dataSize);
  });

  it('encodes correct RIFF chunk size (36 + data)', () => {
    const dataSize = 8820;
    const header = buildWavHeader(dataSize, PIPER_SAMPLE_RATE);
    expect(header.readUInt32LE(4)).toBe(36 + dataSize);
  });

  it('sets PCM format (1)', () => {
    const header = buildWavHeader(100, PIPER_SAMPLE_RATE);
    expect(header.readUInt16LE(20)).toBe(1);
  });

  it('sets mono channel', () => {
    const header = buildWavHeader(100, PIPER_SAMPLE_RATE);
    expect(header.readUInt16LE(22)).toBe(1);
  });

  it('sets 16 bits per sample', () => {
    const header = buildWavHeader(100, PIPER_SAMPLE_RATE);
    expect(header.readUInt16LE(34)).toBe(16);
  });
});

// ── Model Path Resolution ───────────────────────────────────────────

describe('Electron AI Service — resolveModelPath', () => {
  it('resolves Kore to lessac model', () => {
    const result = resolveModelPath(MOCK_DIR, 'Kore');
    expect(result).toContain('en_US-lessac-medium.onnx');
  });

  it('resolves Puck to ryan model', () => {
    const result = resolveModelPath(MOCK_DIR, 'Puck');
    expect(result).toContain('en_US-ryan-medium.onnx');
  });

  it('resolves Aoede to amy model', () => {
    const result = resolveModelPath(MOCK_DIR, 'Aoede');
    expect(result).toContain('en_US-amy-medium.onnx');
  });

  it('resolves Charon to arctic model', () => {
    const result = resolveModelPath(MOCK_DIR, 'Charon');
    expect(result).toContain('en_US-arctic-medium.onnx');
  });

  it('falls back to female English for unknown voice', () => {
    const result = resolveModelPath(MOCK_DIR, 'UnknownVoice');
    expect(result).toContain('en_US-lessac-medium.onnx');
  });

  it('returns null when voicesDir is empty', () => {
    expect(resolveModelPath('', 'Kore')).toBeNull();
  });

  it('prefers voice-specific model even with language code', () => {
    // When the voice-specific model exists, it takes priority over language
    const result = resolveModelPath(MOCK_DIR, 'Kore', 'fr-FR');
    expect(result).toContain('en_US-lessac-medium.onnx');
  });

  it('falls back to language model when voice model missing', () => {
    // Mock: only language-specific models exist
    const langMod = loadModule((p: string) => {
      if (typeof p === 'string' && p.includes('fr_FR-siwis-medium.onnx')) return true;
      return false;
    });
    const result = langMod._internal.resolveModelPath(MOCK_DIR, 'Kore', 'fr-FR');
    expect(result).toContain('fr_FR-siwis-medium.onnx');
  });

  it('uses male language model when male voice model missing', () => {
    const langMod = loadModule((p: string) => {
      if (typeof p === 'string' && p.includes('de_DE-thorsten-medium.onnx')) return true;
      return false;
    });
    const result = langMod._internal.resolveModelPath(MOCK_DIR, 'Puck', 'de-DE');
    expect(result).toContain('de_DE-thorsten-medium.onnx');
  });

  it('falls back to base language code (es-MX → es)', () => {
    const langMod = loadModule((p: string) => {
      if (typeof p === 'string' && p.includes('es_ES-sharvard-medium.onnx')) return true;
      return false;
    });
    const result = langMod._internal.resolveModelPath(MOCK_DIR, 'Kore', 'es-MX');
    expect(result).toContain('es_ES-sharvard-medium.onnx');
  });

  it('resolves all known voices', () => {
    for (const voiceName of Object.keys(VOICE_MODEL_MAP)) {
      const result = resolveModelPath(MOCK_DIR, voiceName);
      expect(result).toBeTruthy();
      expect(result!.endsWith('.onnx')).toBe(true);
    }
  });

  it('returns null when model file does not exist', () => {
    const noFilesMod = loadModule(() => false);
    const result = noFilesMod._internal.resolveModelPath(MOCK_DIR, 'Kore');
    expect(result).toBeNull();
  });
});

// ── Cache Key ───────────────────────────────────────────────────────

describe('Electron AI Service — getCacheKey', () => {
  it('produces deterministic keys', () => {
    expect(getCacheKey('hello', 'Kore', 1.0)).toBe(getCacheKey('hello', 'Kore', 1.0));
  });

  it('differentiates by text', () => {
    expect(getCacheKey('hello', 'Kore', 1.0)).not.toBe(getCacheKey('world', 'Kore', 1.0));
  });

  it('differentiates by voice', () => {
    expect(getCacheKey('hello', 'Kore', 1.0)).not.toBe(getCacheKey('hello', 'Puck', 1.0));
  });

  it('differentiates by speed', () => {
    expect(getCacheKey('hello', 'Kore', 1.0)).not.toBe(getCacheKey('hello', 'Kore', 1.5));
  });
});

// ── Constants ───────────────────────────────────────────────────────

describe('Electron AI Service — constants', () => {
  it('PIPER_SAMPLE_RATE is 22050', () => {
    expect(PIPER_SAMPLE_RATE).toBe(22050);
  });
});
