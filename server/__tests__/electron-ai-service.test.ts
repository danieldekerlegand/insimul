/**
 * Electron AI Service Tests
 *
 * Tests the Piper TTS integration for Electron exports.
 * The template is a CJS module for Electron's main process. We evaluate it
 * in a sandbox with mocked `electron` and `fs` to test the pure logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const templatePath = join(__dir, '..', 'services', 'game-export', 'babylon', 'templates', 'electron-ai-service.js');
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
  fn(moduleObj, moduleExports, mockRequire, __dir, __filename);
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
