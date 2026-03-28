/**
 * Tests for AI model bundling verification in the Babylon.js export pipeline.
 *
 * Verifies that:
 * - AI models (LLM, TTS, STT) are bundled when aiProvider === 'local'
 * - Export paths use the correct Babylon.js prefix (assets/ai/)
 * - ai_config.json has localModelPath pointing to the correct relative path
 * - The manifest is included in the bundle
 * - Models are skipped gracefully when files are missing
 * - Cloud mode does not bundle AI models
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  bundleAIModels,
  getAIBundleEstimate,
  getEngineAIPrefix,
  type AIBundleResult,
} from '../services/game-export/ai-bundler';
import { generateDataFiles } from '../services/game-export/babylon/babylon-data-generator';
import { bundleBabylonPlugin } from '../services/game-export/plugin-bundler';
import type { WorldIR, AIConfigIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────

let tempDir: string;

beforeEach(() => {
  tempDir = join(tmpdir(), `insimul-babylon-ai-test-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
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
      characters: [{
        id: 'char-1',
        worldId: 'test-world',
        firstName: 'Mira',
        middleName: null,
        lastName: 'Sage',
        suffix: null,
        gender: 'female',
        isAlive: true,
        birthYear: 1990,
        personality: { openness: 0.8, conscientiousness: 0.7, extroversion: 0.6, agreeableness: 0.9, neuroticism: 0.2 },
        physicalTraits: {},
        mentalTraits: {},
        skills: {},
        relationships: {},
        socialAttributes: {},
        coworkerIds: [],
        friendIds: [],
        neighborIds: [],
        immediateFamilyIds: [],
        extendedFamilyIds: [],
        parentIds: [],
        childIds: [],
        spouseId: null,
        genealogyData: {},
        currentLocation: 'settlement-1',
        occupation: 'Healer',
        status: null,
      }],
      npcs: [{
        characterId: 'char-1',
        role: 'healer',
        homePosition: { x: 10, y: 0, z: 20 },
        patrolRadius: 10,
        disposition: 90,
        settlementId: 'settlement-1',
        questIds: [],
        greeting: null,
      }],
      buildings: [],
      businesses: [],
      roads: [],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
      items: [],
      lootTables: [],
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
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        roadColor: { r: 0.4, g: 0.35, b: 0.3 },
        roadRadius: 3,
      },
    },
    assets: { models: [], textures: [], audio: [], animations: [] },
    player: {
      speed: 5,
      jumpHeight: 2,
      gravity: -9.81,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
    },
    ui: {},
    combat: { style: 'melee', settings: {} },
    survival: null,
    resources: null,
    aiConfig: {
      apiMode: 'insimul',
      insimulEndpoint: '/api/gemini/chat',
      geminiModel: 'gemini-3.1-flash',
      geminiApiKeyPlaceholder: 'YOUR_GEMINI_API_KEY',
      voiceEnabled: true,
      defaultVoice: 'Kore',
      ...aiConfig,
    },
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// Babylon engine prefix
// ─────────────────────────────────────────────

describe('AI bundler — Babylon.js engine prefix', () => {
  it('uses assets/ai/ prefix for Babylon.js exports', () => {
    expect(getEngineAIPrefix('babylon')).toBe('assets/ai');
  });
});

// ─────────────────────────────────────────────
// AI model bundling for Babylon.js
// ─────────────────────────────────────────────

describe('AI model bundling for Babylon.js export', () => {
  it('bundles LLM model at assets/ai/models/ path', async () => {
    const modelPath = join(tempDir, 'phi-4-mini-q4.gguf');
    writeFileSync(modelPath, 'fake-gguf-model-data');
    process.env.LOCAL_MODEL_PATH = modelPath;

    const result = await bundleAIModels('babylon');
    expect(result.manifest.llm).not.toBeNull();
    expect(result.manifest.llm!.modelPath).toBe('assets/ai/models/phi-4-mini-q4.gguf');
    expect(result.manifest.llm!.fileSizeBytes).toBe(20);

    const llmAsset = result.assets.find(a => a.role === 'llm_model');
    expect(llmAsset).toBeDefined();
    expect(llmAsset!.exportPath).toBe('assets/ai/models/phi-4-mini-q4.gguf');
  });

  it('bundles Piper TTS voices at assets/ai/voices/ path', async () => {
    const voicesDir = join(tempDir, 'voices');
    mkdirSync(voicesDir, { recursive: true });
    writeFileSync(join(voicesDir, 'en_US-amy-medium.onnx'), 'fake-onnx-voice');
    writeFileSync(join(voicesDir, 'en_US-amy-medium.onnx.json'), '{"sample_rate":22050}');
    process.env.PIPER_VOICES_DIR = voicesDir;

    const result = await bundleAIModels('babylon', { voices: ['Kore'] });
    expect(result.manifest.tts).not.toBeNull();
    expect(result.manifest.tts!.voicePaths['Kore']).toBe('assets/ai/voices/en_US-amy-medium.onnx');

    const voiceAsset = result.assets.find(a => a.role === 'tts_voice_Kore');
    expect(voiceAsset).toBeDefined();
    expect(voiceAsset!.exportPath).toBe('assets/ai/voices/en_US-amy-medium.onnx');

    const voiceConfig = result.assets.find(a => a.role === 'tts_voice_Kore_config');
    expect(voiceConfig).toBeDefined();
    expect(voiceConfig!.exportPath).toBe('assets/ai/voices/en_US-amy-medium.onnx.json');
  });

  it('bundles Whisper STT model at assets/ai/models/ path', async () => {
    const whisperPath = join(tempDir, 'whisper-base.bin');
    writeFileSync(whisperPath, 'fake-whisper-model');
    process.env.WHISPER_MODEL_PATH = whisperPath;

    const result = await bundleAIModels('babylon');
    expect(result.manifest.stt).not.toBeNull();
    expect(result.manifest.stt!.modelPath).toBe('assets/ai/models/whisper-base.bin');
  });

  it('bundles all three model types together', async () => {
    // Set up LLM
    const modelPath = join(tempDir, 'test-llm.gguf');
    writeFileSync(modelPath, 'A'.repeat(100));
    process.env.LOCAL_MODEL_PATH = modelPath;

    // Set up TTS
    const voicesDir = join(tempDir, 'voices');
    mkdirSync(voicesDir, { recursive: true });
    writeFileSync(join(voicesDir, 'en_US-amy-medium.onnx'), 'B'.repeat(50));
    process.env.PIPER_VOICES_DIR = voicesDir;

    // Set up STT
    const whisperPath = join(tempDir, 'whisper.bin');
    writeFileSync(whisperPath, 'C'.repeat(75));
    process.env.WHISPER_MODEL_PATH = whisperPath;

    const result = await bundleAIModels('babylon', { voices: ['Kore'] });

    expect(result.manifest.llm).not.toBeNull();
    expect(result.manifest.tts).not.toBeNull();
    expect(result.manifest.stt).not.toBeNull();
    expect(result.totalSizeBytes).toBe(100 + 50 + 75 + result.assets.find(a => a.role === 'ai_manifest')!.buffer.length);
  });

  it('includes ai-manifest.json in the bundle', async () => {
    const result = await bundleAIModels('babylon');
    const manifestAsset = result.assets.find(a => a.role === 'ai_manifest');
    expect(manifestAsset).toBeDefined();
    expect(manifestAsset!.exportPath).toBe('assets/ai/ai-manifest.json');

    const parsed = JSON.parse(manifestAsset!.buffer.toString('utf-8'));
    expect(parsed.provider).toBe('local');
  });

  it('gracefully handles missing model files', async () => {
    process.env.LOCAL_MODEL_PATH = '/nonexistent/model.gguf';
    process.env.WHISPER_MODEL_PATH = '/nonexistent/whisper.bin';

    const result = await bundleAIModels('babylon');
    expect(result.manifest.llm).toBeNull();
    expect(result.manifest.stt).toBeNull();
    // Only the manifest JSON should be present
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].role).toBe('ai_manifest');
  });
});

// ─────────────────────────────────────────────
// ai_config.json — localModelPath rewriting
// ─────────────────────────────────────────────

describe('ai_config.json — local model path rewriting', () => {
  it('rewrites localModelPath to relative export path when apiMode is local', () => {
    const ir = makeMinimalIR({
      apiMode: 'local',
      localModelPath: '/server/models/phi-4-mini-q4.gguf',
      localModelName: 'phi-4-mini-q4',
    });
    const files = generateDataFiles(ir);
    const aiConfigFile = files.find(f => f.path === 'public/data/ai_config.json');

    expect(aiConfigFile).toBeDefined();
    const parsed = JSON.parse(aiConfigFile!.content);
    expect(parsed.apiMode).toBe('local');
    expect(parsed.localModelPath).toBe('./assets/ai/models/phi-4-mini-q4.gguf');
    expect(parsed.localModelName).toBe('phi-4-mini-q4');
  });

  it('uses default model name when localModelName is not set', () => {
    const ir = makeMinimalIR({
      apiMode: 'local',
      localModelPath: '/server/models/some-model.gguf',
    });
    const files = generateDataFiles(ir);
    const aiConfigFile = files.find(f => f.path === 'public/data/ai_config.json');
    const parsed = JSON.parse(aiConfigFile!.content);
    expect(parsed.localModelPath).toBe('./assets/ai/models/phi-4-mini-q4.gguf');
  });

  it('does not rewrite localModelPath for non-local apiModes', () => {
    const ir = makeMinimalIR({
      apiMode: 'insimul',
    });
    const files = generateDataFiles(ir);
    const aiConfigFile = files.find(f => f.path === 'public/data/ai_config.json');
    const parsed = JSON.parse(aiConfigFile!.content);
    expect(parsed.apiMode).toBe('insimul');
    expect(parsed.localModelPath).toBeUndefined();
  });

  it('preserves all other aiConfig fields when rewriting', () => {
    const ir = makeMinimalIR({
      apiMode: 'local',
      localModelPath: '/abs/path.gguf',
      localModelName: 'phi-4-mini-q4',
      voiceEnabled: true,
      defaultVoice: 'Charon',
      geminiModel: 'gemini-3.1-flash',
    });
    const files = generateDataFiles(ir);
    const parsed = JSON.parse(files.find(f => f.path === 'public/data/ai_config.json')!.content);
    expect(parsed.voiceEnabled).toBe(true);
    expect(parsed.defaultVoice).toBe('Charon');
    expect(parsed.geminiModel).toBe('gemini-3.1-flash');
    expect(parsed.insimulEndpoint).toBe('/api/gemini/chat');
  });
});

// ─────────────────────────────────────────────
// Plugin bundler — local AI config
// ─────────────────────────────────────────────

describe('Babylon plugin bundler — local AI config', () => {
  it('sets aiProvider to local when apiMode is local', () => {
    const ir = makeMinimalIR({
      apiMode: 'local',
      localModelPath: './assets/ai/models/phi-4-mini-q4.gguf',
      localModelName: 'phi-4-mini-q4',
    });
    const files = bundleBabylonPlugin(ir);
    const configFile = files.find(f => f.path.includes('insimul-config.ts'));

    expect(configFile).toBeDefined();
    expect(configFile!.content).toContain('"local"');
    expect(configFile!.content).toContain('aiModelBasePath');
  });

  it('includes local AI config fields in AI_CONFIG', () => {
    const ir = makeMinimalIR({
      apiMode: 'local',
      localModelPath: './assets/ai/models/phi-4-mini-q4.gguf',
      localModelName: 'phi-4-mini-q4',
    });
    const files = bundleBabylonPlugin(ir);
    const configFile = files.find(f => f.path.includes('insimul-config.ts'));

    expect(configFile!.content).toContain('AI_CONFIG');
    expect(configFile!.content).toContain('"local"');
    expect(configFile!.content).toContain('phi-4-mini-q4');
  });

  it('AIConfig interface supports local apiMode', () => {
    const ir = makeMinimalIR();
    const files = bundleBabylonPlugin(ir);
    const configFile = files.find(f => f.path.includes('insimul-config.ts'));

    expect(configFile!.content).toContain("apiMode: 'insimul' | 'gemini' | 'local'");
  });
});

// ─────────────────────────────────────────────
// Bundle size estimation
// ─────────────────────────────────────────────

describe('AI bundle size estimation for export dialog', () => {
  it('returns accurate size estimate with all model types', () => {
    const modelPath = join(tempDir, 'model.gguf');
    const whisperPath = join(tempDir, 'whisper.bin');
    const voicesDir = join(tempDir, 'voices');
    mkdirSync(voicesDir, { recursive: true });

    writeFileSync(modelPath, 'A'.repeat(2000));
    writeFileSync(whisperPath, 'B'.repeat(1500));
    writeFileSync(join(voicesDir, 'en_US-amy-medium.onnx'), 'C'.repeat(500));
    writeFileSync(join(voicesDir, 'en_US-amy-medium.onnx.json'), '{}');

    process.env.LOCAL_MODEL_PATH = modelPath;
    process.env.WHISPER_MODEL_PATH = whisperPath;
    process.env.PIPER_VOICES_DIR = voicesDir;

    const estimate = getAIBundleEstimate();
    expect(estimate.totalSizeBytes).toBe(2000 + 1500 + 500 + 2); // gguf + whisper + onnx + json
    expect(estimate.models.length).toBe(4); // llm + stt + onnx + json
  });

  it('returns zero when no models configured', () => {
    const estimate = getAIBundleEstimate();
    expect(estimate.totalSizeBytes).toBe(0);
    expect(estimate.models).toHaveLength(0);
  });
});
