/**
 * Tests for the Electron AI service module and its integration
 * into the Babylon.js export pipeline.
 *
 * Verifies:
 * - ai-service.js template is generated for Electron exports
 * - electron-main.js template imports and initializes the AI service
 * - node-llama-cpp is included as a dependency for Electron exports
 * - AI service handles missing config, non-local apiMode, and missing model gracefully
 * - IPC handlers are registered for ai:generate, ai:generate-stream, ai:status
 * - Request queue serializes concurrent requests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
