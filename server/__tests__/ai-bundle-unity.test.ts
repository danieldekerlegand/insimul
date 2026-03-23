/**
 * Tests for AI bundle integration into Unity export pipeline.
 *
 * Covers:
 * - AI bundler: cloud vs local mode, manifest generation
 * - Unity C# generator: includes LocalAIService and LlamaNativePlugin templates
 * - Unity exporter: AIConfig.json reflects local mode, AI manifest included
 * - AIConfigIR: supports 'local' apiMode with model path fields
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { bundleAIModels, getAIBundleEstimate, generateAIManifestJson } from '../services/game-export/ai-bundler';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import { generateDataFiles } from '../services/game-export/unity/unity-data-generator';
import type { WorldIR, AIConfigIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────

let tempDir: string;

beforeEach(() => {
  tempDir = join(tmpdir(), `insimul-ai-test-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
  // Restore env vars
  delete process.env.LOCAL_MODEL_PATH;
  delete process.env.LOCAL_MODEL_NAME;
  delete process.env.PIPER_VOICES_DIR;
  delete process.env.WHISPER_MODEL_PATH;
  delete process.env.WHISPER_MODEL_SIZE;
  delete process.env.AI_PROVIDER;
});

function makeMinimalIR(aiConfig?: Partial<AIConfigIR>): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      terrainSize: 512,
      genreConfig: { genre: 'rpg', features: { crafting: false, resources: false, survival: false } },
    },
    geography: {
      terrainSize: 512,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      roads: [],
      businesses: [],
      natureObjects: [],
      animals: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      items: [],
      lootTables: [],
      languages: [],
      knowledgeBase: null,
      dialogueContexts: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.5, g: 0.4, b: 0.3 },
        skyColor: { r: 0.6, g: 0.7, b: 0.9 },
        roadColor: { r: 0.3, g: 0.3, b: 0.3 },
        roadRadius: 1.5,
        settlementBaseColor: { r: 0.6, g: 0.5, b: 0.4 },
        settlementRoofColor: { r: 0.3, g: 0.2, b: 0.15 },
      },
      ambientLighting: { color: [0.4, 0.4, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, 1, 0], intensity: 1.0 },
      fog: { density: 0.02 },
    },
    assets: [],
    player: {
      speed: 5,
      jumpHeight: 1.2,
      gravity: 1,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 50, y: 0, z: 50 },
    },
    ui: { minimap: true, healthBar: true, staminaBar: false, ammoCounter: false, compass: true },
    combat: {
      style: 'melee',
      settings: {
        baseDamage: 10,
        criticalChance: 0.15,
        criticalMultiplier: 1.5,
        blockReduction: 0.25,
        dodgeChance: 0.1,
        attackCooldown: 1000,
        combatRange: 2,
      },
    },
    survival: null,
    resources: null,
    aiConfig: {
      apiMode: 'insimul',
      insimulEndpoint: '/api/gemini/chat',
      geminiModel: 'gemini-2.5-flash',
      geminiApiKeyPlaceholder: 'YOUR_GEMINI_API_KEY',
      voiceEnabled: true,
      defaultVoice: 'Kore',
      ...aiConfig,
    },
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// AI Bundler — cloud mode
// ─────────────────────────────────────────────

describe('AI Bundler - cloud mode', () => {
  it('returns empty bundle for cloud provider', () => {
    const result = bundleAIModels({ provider: 'cloud' });
    expect(result.models).toHaveLength(0);
    expect(result.manifest.provider).toBe('cloud');
    expect(result.totalSizeBytes).toBe(0);
  });

  it('generates valid manifest JSON for cloud mode', () => {
    const result = bundleAIModels({ provider: 'cloud' });
    const json = generateAIManifestJson(result.manifest);
    const parsed = JSON.parse(json);
    expect(parsed.provider).toBe('cloud');
    expect(parsed.models).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// AI Bundler — local mode with model files
// ─────────────────────────────────────────────

describe('AI Bundler - local mode', () => {
  it('bundles LLM model when LOCAL_MODEL_PATH is set', () => {
    const modelPath = join(tempDir, 'phi-4-mini-q4.gguf');
    writeFileSync(modelPath, 'fake-gguf-content');
    process.env.LOCAL_MODEL_PATH = modelPath;
    process.env.LOCAL_MODEL_NAME = 'phi-4-mini-q4';

    const result = bundleAIModels({ provider: 'local' });
    expect(result.models.length).toBeGreaterThanOrEqual(1);

    const llm = result.models.find(m => m.type === 'llm');
    expect(llm).toBeDefined();
    expect(llm!.exportPath).toBe('ai/models/phi-4-mini-q4.gguf');
    expect(llm!.name).toBe('phi-4-mini-q4');
    expect(llm!.sizeBytes).toBeGreaterThan(0);
  });

  it('bundles TTS voice models when PIPER_VOICES_DIR is set', () => {
    const voicesDir = join(tempDir, 'voices');
    mkdirSync(voicesDir, { recursive: true });
    writeFileSync(join(voicesDir, 'en_US-lessac-medium.onnx'), 'fake-onnx');
    writeFileSync(join(voicesDir, 'en_US-lessac-medium.onnx.json'), '{"sample_rate": 22050}');
    process.env.PIPER_VOICES_DIR = voicesDir;

    const result = bundleAIModels({ provider: 'local', includeLLM: false, includeSTT: false });
    const ttsModels = result.models.filter(m => m.type === 'tts');
    expect(ttsModels.length).toBe(2); // .onnx + .json
    expect(ttsModels[0].exportPath).toMatch(/^ai\/models\/voices\//);
  });

  it('bundles Whisper STT model when WHISPER_MODEL_PATH is set', () => {
    const whisperPath = join(tempDir, 'ggml-base.bin');
    writeFileSync(whisperPath, 'fake-whisper-model');
    process.env.WHISPER_MODEL_PATH = whisperPath;
    process.env.WHISPER_MODEL_SIZE = 'base';

    const result = bundleAIModels({ provider: 'local', includeLLM: false, includeTTS: false });
    const stt = result.models.find(m => m.type === 'stt');
    expect(stt).toBeDefined();
    expect(stt!.exportPath).toBe('ai/models/ggml-base.bin');
    expect(stt!.name).toBe('whisper-base');
  });

  it('skips models when include flags are false', () => {
    const modelPath = join(tempDir, 'test.gguf');
    writeFileSync(modelPath, 'content');
    process.env.LOCAL_MODEL_PATH = modelPath;

    const result = bundleAIModels({ provider: 'local', includeLLM: false, includeTTS: false, includeSTT: false });
    expect(result.models).toHaveLength(0);
  });

  it('handles missing model files gracefully', () => {
    process.env.LOCAL_MODEL_PATH = '/nonexistent/model.gguf';
    const result = bundleAIModels({ provider: 'local' });
    const llm = result.models.find(m => m.type === 'llm');
    expect(llm).toBeUndefined();
  });

  it('calculates total size correctly', () => {
    const modelPath = join(tempDir, 'test.gguf');
    const whisperPath = join(tempDir, 'whisper.bin');
    writeFileSync(modelPath, 'A'.repeat(100));
    writeFileSync(whisperPath, 'B'.repeat(200));
    process.env.LOCAL_MODEL_PATH = modelPath;
    process.env.WHISPER_MODEL_PATH = whisperPath;

    const result = bundleAIModels({ provider: 'local', includeTTS: false });
    expect(result.totalSizeBytes).toBe(300);
    expect(result.manifest.totalSizeBytes).toBe(300);
  });
});

// ─────────────────────────────────────────────
// AI Bundle estimate
// ─────────────────────────────────────────────

describe('AI Bundle estimate', () => {
  it('returns empty estimate when no models configured', () => {
    const estimate = getAIBundleEstimate();
    expect(estimate.models).toHaveLength(0);
    expect(estimate.totalSizeBytes).toBe(0);
  });

  it('includes model sizes in estimate', () => {
    const modelPath = join(tempDir, 'model.gguf');
    writeFileSync(modelPath, 'A'.repeat(500));
    process.env.LOCAL_MODEL_PATH = modelPath;

    const estimate = getAIBundleEstimate();
    expect(estimate.models.length).toBeGreaterThanOrEqual(1);
    expect(estimate.totalSizeBytes).toBe(500);
  });
});

// ─────────────────────────────────────────────
// Unity C# generator includes AI service templates
// ─────────────────────────────────────────────

describe('Unity C# generator - AI service templates', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes LlamaNativePlugin.cs', () => {
    const f = files.find(f => f.path.includes('LlamaNativePlugin.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('DllImport');
    expect(f!.content).toContain('llama_backend_init');
    expect(f!.content).toContain('IsAvailable');
  });

  it('includes LocalAIService.cs', () => {
    const f = files.find(f => f.path.includes('LocalAIService.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('LocalAIService');
    expect(f!.content).toContain('Generate(');
    expect(f!.content).toContain('TextToSpeech(');
    expect(f!.content).toContain('SpeechToText(');
    expect(f!.content).toContain('CloudGenerateFallback');
  });

  it('still includes InsimulAIService.cs', () => {
    const f = files.find(f => f.path.includes('InsimulAIService.cs'));
    expect(f).toBeDefined();
  });
});

// ─────────────────────────────────────────────
// Unity data generator - AI config with local mode
// ─────────────────────────────────────────────

describe('Unity data generator - AI config local mode', () => {
  it('exports AIConfig.json with local apiMode', () => {
    const ir = makeMinimalIR({
      apiMode: 'local',
      localModelPath: 'phi-4-mini-q4.gguf',
      localModelName: 'phi-4-mini-q4',
    });

    const files = generateDataFiles(ir);
    const configFile = files.find(f => f.path.endsWith('AIConfig.json'));
    expect(configFile).toBeDefined();

    const parsed = JSON.parse(configFile!.content);
    expect(parsed.apiMode).toBe('local');
    expect(parsed.localModelPath).toBe('phi-4-mini-q4.gguf');
    expect(parsed.localModelName).toBe('phi-4-mini-q4');
  });

  it('exports AIConfig.json with cloud apiMode by default', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const configFile = files.find(f => f.path.endsWith('AIConfig.json'));
    expect(configFile).toBeDefined();

    const parsed = JSON.parse(configFile!.content);
    expect(parsed.apiMode).toBe('insimul');
  });
});

// ─────────────────────────────────────────────
// AIConfigIR type validation
// ─────────────────────────────────────────────

describe('AIConfigIR local mode fields', () => {
  it('accepts local apiMode with model fields', () => {
    const config: AIConfigIR = {
      apiMode: 'local',
      insimulEndpoint: '/api/gemini/chat',
      geminiModel: 'gemini-2.5-flash',
      geminiApiKeyPlaceholder: '',
      voiceEnabled: true,
      defaultVoice: 'Kore',
      localModelPath: 'ai/models/phi-4-mini-q4.gguf',
      localModelName: 'phi-4-mini-q4',
    };
    expect(config.apiMode).toBe('local');
    expect(config.localModelPath).toBe('ai/models/phi-4-mini-q4.gguf');
  });

  it('optional local fields default to undefined', () => {
    const config: AIConfigIR = {
      apiMode: 'insimul',
      insimulEndpoint: '/api/gemini/chat',
      geminiModel: 'gemini-2.5-flash',
      geminiApiKeyPlaceholder: '',
      voiceEnabled: true,
      defaultVoice: 'Kore',
    };
    expect(config.localModelPath).toBeUndefined();
    expect(config.localModelName).toBeUndefined();
  });
});
