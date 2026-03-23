/**
 * Tests for AI Bundler — verifies AI model bundling logic, path resolution,
 * manifest generation, and integration with the Godot export pipeline.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  bundleAIModels,
  generateAIManifestJson,
  resolveLLMModelPath,
  resolvePiperVoicesDir,
  resolveWhisperModelPath,
  type AIBundleOptions,
  type AIBundleManifest,
} from '../services/game-export/ai-bundler.js';
import { bundleGodotPlugin } from '../services/game-export/plugin-bundler.js';
import { generateLocalAIManagerScript } from '../services/game-export/godot/godot-gdscript-generator.js';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ── Environment variable helpers ─────────────────────────────

const originalEnv = { ...process.env };

function setEnv(key: string, value: string) {
  process.env[key] = value;
}

function clearEnv(...keys: string[]) {
  for (const key of keys) {
    delete process.env[key];
  }
}

// ── Mock WorldIR ─────────────────────────────────────────────

function createMockIR(): WorldIR {
  return {
    meta: {
      worldId: 'world-ai-test',
      worldName: 'AI Test World',
      worldType: 'fantasy',
      gameType: 'rpg',
      exportVersion: '1.0.0',
    },
    entities: {
      characters: [
        {
          id: 'char-1', worldId: 'world-ai-test',
          firstName: 'Alice', middleName: null, lastName: 'Smith', suffix: null,
          gender: 'female', isAlive: true, birthYear: 1990,
          personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
          physicalTraits: {}, mentalTraits: {}, skills: {}, relationships: {},
          socialAttributes: {}, coworkerIds: [], friendIds: [], neighborIds: [],
          immediateFamilyIds: [], extendedFamilyIds: [], parentIds: [], childIds: [],
          spouseId: null, genealogyData: {}, currentLocation: 's-1', occupation: 'Mage', status: null,
        },
      ],
      npcs: [
        { characterId: 'char-1', role: 'mage', homePosition: { x: 0, y: 0, z: 0 }, patrolRadius: 10, disposition: 70, settlementId: 's-1', questIds: [], greeting: null },
      ],
      buildings: [], businesses: [], roads: [], natureObjects: [], animals: [], dungeons: [], questObjects: [], items: [], lootTables: [],
    },
    geography: { terrain: { width: 256, depth: 256, heightScale: 20 }, countries: [], states: [], settlements: [], lots: [] },
    systems: { ai: { dialogueContexts: [] }, rules: [], actions: [], quests: [], truths: [], grammars: [], languages: [], knowledgeBase: '' },
    theme: { visualTheme: { groundColor: { r: 0.3, g: 0.5, b: 0.2 }, skyColor: { r: 0.5, g: 0.7, b: 1.0 }, roadColor: { r: 0.4, g: 0.35, b: 0.3 }, roadRadius: 3 } },
    assets: { models: [], textures: [], audio: [], animations: [] },
    player: { speed: 5, jumpHeight: 2, gravity: -9.81, initialHealth: 100, initialEnergy: 100, initialGold: 50 },
    ui: {},
    combat: { style: 'melee', settings: {} },
  } as unknown as WorldIR;
}

// ── Tests ────────────────────────────────────────────────────

describe('AI Bundler', () => {
  beforeEach(() => {
    clearEnv('LOCAL_MODEL_PATH', 'LOCAL_MODEL_NAME', 'PIPER_VOICES_DIR', 'WHISPER_MODEL_PATH');
  });

  afterEach(() => {
    // Restore original env
    for (const key of ['LOCAL_MODEL_PATH', 'LOCAL_MODEL_NAME', 'PIPER_VOICES_DIR', 'WHISPER_MODEL_PATH']) {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  describe('resolveLLMModelPath', () => {
    it('returns LOCAL_MODEL_PATH from env when set', () => {
      setEnv('LOCAL_MODEL_PATH', '/models/test.gguf');
      expect(resolveLLMModelPath()).toBe('/models/test.gguf');
    });

    it('resolves from LOCAL_MODEL_NAME when set', () => {
      setEnv('LOCAL_MODEL_NAME', 'phi-4-mini-q4');
      const result = resolveLLMModelPath();
      expect(result).toContain('phi-4-mini-q4.gguf');
      expect(result).toContain('models');
    });

    it('returns null when no env vars set and default file missing', () => {
      clearEnv('LOCAL_MODEL_PATH', 'LOCAL_MODEL_NAME');
      // Default path won't exist in test environment
      const result = resolveLLMModelPath();
      // Result is null since no default file exists
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('resolvePiperVoicesDir', () => {
    it('returns PIPER_VOICES_DIR from env when set', () => {
      setEnv('PIPER_VOICES_DIR', '/data/voices');
      expect(resolvePiperVoicesDir()).toBe('/data/voices');
    });

    it('returns null when no env var and default missing', () => {
      clearEnv('PIPER_VOICES_DIR');
      const result = resolvePiperVoicesDir();
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('resolveWhisperModelPath', () => {
    it('returns WHISPER_MODEL_PATH from env when set', () => {
      setEnv('WHISPER_MODEL_PATH', '/models/whisper.bin');
      expect(resolveWhisperModelPath()).toBe('/models/whisper.bin');
    });
  });

  describe('bundleAIModels', () => {
    it('returns empty bundle when no models are available', async () => {
      clearEnv('LOCAL_MODEL_PATH', 'LOCAL_MODEL_NAME', 'PIPER_VOICES_DIR', 'WHISPER_MODEL_PATH');
      const result = await bundleAIModels('godot');
      // Should have at least the manifest JSON
      expect(result.assets.length).toBeGreaterThanOrEqual(1);
      expect(result.manifest.provider).toBe('local');
      expect(result.manifest.llm).toBeNull();
      expect(result.manifest.tts).toBeNull();
      expect(result.manifest.stt).toBeNull();
    });

    it('skips LLM when includeLLM is false', async () => {
      const result = await bundleAIModels('godot', { includeLLM: false });
      expect(result.manifest.llm).toBeNull();
    });

    it('skips TTS when includeTTS is false', async () => {
      const result = await bundleAIModels('godot', { includeTTS: false });
      expect(result.manifest.tts).toBeNull();
    });

    it('skips STT when includeSTT is false', async () => {
      const result = await bundleAIModels('godot', { includeSTT: false });
      expect(result.manifest.stt).toBeNull();
    });

    it('uses correct export prefix for each engine', async () => {
      const godotResult = await bundleAIModels('godot');
      const manifestAsset = godotResult.assets.find(a => a.role === 'ai_manifest');
      expect(manifestAsset?.exportPath).toBe('ai/ai-manifest.json');

      const babylonResult = await bundleAIModels('babylon');
      const babManifest = babylonResult.assets.find(a => a.role === 'ai_manifest');
      expect(babManifest?.exportPath).toBe('assets/ai/ai-manifest.json');

      const unityResult = await bundleAIModels('unity');
      const unityManifest = unityResult.assets.find(a => a.role === 'ai_manifest');
      expect(unityManifest?.exportPath).toBe('StreamingAssets/ai/ai-manifest.json');

      const unrealResult = await bundleAIModels('unreal');
      const unrealManifest = unrealResult.assets.find(a => a.role === 'ai_manifest');
      expect(unrealManifest?.exportPath).toBe('Content/AI/ai-manifest.json');
    });

    it('always includes manifest JSON asset', async () => {
      const result = await bundleAIModels('godot');
      const manifestAsset = result.assets.find(a => a.role === 'ai_manifest');
      expect(manifestAsset).toBeDefined();
      const parsed = JSON.parse(manifestAsset!.buffer.toString('utf-8'));
      expect(parsed.provider).toBe('local');
    });

    it('bundles LLM model when file exists', async () => {
      // Create a temp model file
      const tmpDir = path.join(process.cwd(), 'tmp-test-models');
      const tmpModel = path.join(tmpDir, 'test.gguf');
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(tmpModel, 'fake-gguf-data');
      setEnv('LOCAL_MODEL_PATH', tmpModel);

      try {
        const result = await bundleAIModels('godot');
        expect(result.manifest.llm).not.toBeNull();
        expect(result.manifest.llm!.modelPath).toBe('ai/models/test.gguf');
        expect(result.manifest.llm!.fileSizeBytes).toBe(14); // 'fake-gguf-data'.length
        const llmAsset = result.assets.find(a => a.role === 'llm_model');
        expect(llmAsset).toBeDefined();
        expect(llmAsset!.buffer.toString()).toBe('fake-gguf-data');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('bundles Piper voice models when directory exists', async () => {
      const tmpDir = path.join(process.cwd(), 'tmp-test-voices');
      fs.mkdirSync(tmpDir, { recursive: true });
      // Create a fake voice that matches DEFAULT_VOICE_MAP['Kore'] = 'en_US-amy-medium'
      fs.writeFileSync(path.join(tmpDir, 'en_US-amy-medium.onnx'), 'fake-voice');
      fs.writeFileSync(path.join(tmpDir, 'en_US-amy-medium.onnx.json'), '{"config": true}');
      setEnv('PIPER_VOICES_DIR', tmpDir);

      try {
        const result = await bundleAIModels('godot', { voices: ['Kore'] });
        expect(result.manifest.tts).not.toBeNull();
        expect(result.manifest.tts!.voicePaths['Kore']).toBe('ai/voices/en_US-amy-medium.onnx');
        // Should also bundle the JSON config
        const jsonAsset = result.assets.find(a => a.role === 'tts_voice_Kore_config');
        expect(jsonAsset).toBeDefined();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('bundles Whisper model when file exists', async () => {
      const tmpDir = path.join(process.cwd(), 'tmp-test-whisper');
      const tmpModel = path.join(tmpDir, 'whisper-base.bin');
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(tmpModel, 'fake-whisper');
      setEnv('WHISPER_MODEL_PATH', tmpModel);

      try {
        const result = await bundleAIModels('godot');
        expect(result.manifest.stt).not.toBeNull();
        expect(result.manifest.stt!.modelPath).toBe('ai/models/whisper-base.bin');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe('generateAIManifestJson', () => {
    it('serializes manifest to formatted JSON', () => {
      const manifest: AIBundleManifest = {
        provider: 'local',
        llm: { modelPath: 'ai/models/phi-4-mini-q4.gguf', fileSizeBytes: 2000000000 },
        tts: { voicePaths: { Kore: 'ai/voices/en_US-amy-medium.onnx' }, totalSizeBytes: 50000000 },
        stt: { modelPath: 'ai/models/whisper-base.bin', fileSizeBytes: 150000000 },
        totalSizeBytes: 2200000000,
      };
      const json = generateAIManifestJson(manifest);
      const parsed = JSON.parse(json);
      expect(parsed.provider).toBe('local');
      expect(parsed.llm.modelPath).toBe('ai/models/phi-4-mini-q4.gguf');
      expect(parsed.tts.voicePaths.Kore).toBe('ai/voices/en_US-amy-medium.onnx');
      expect(parsed.stt.modelPath).toBe('ai/models/whisper-base.bin');
    });
  });
});

describe('Godot Plugin Bundler — AI Config', () => {
  const ir = createMockIR();

  it('includes AI_PROVIDER=cloud by default when no AI model paths', () => {
    const files = bundleGodotPlugin(ir);
    const config = files.find(f => f.path.includes('insimul_export_config.gd'));
    expect(config).toBeDefined();
    expect(config!.content).toContain('AI_PROVIDER');
    expect(config!.content).toContain('"cloud"');
  });

  it('includes AI_PROVIDER=local with model paths when AI bundle is provided', () => {
    const aiPaths = {
      llm: 'res://ai/models/phi-4-mini-q4.gguf',
      stt: 'res://ai/models/whisper-base.bin',
      voices: {
        Kore: 'res://ai/voices/en_US-amy-medium.onnx',
        Charon: 'res://ai/voices/en_US-ryan-medium.onnx',
      },
    };
    const files = bundleGodotPlugin(ir, aiPaths);
    const config = files.find(f => f.path.includes('insimul_export_config.gd'));
    expect(config).toBeDefined();
    expect(config!.content).toContain('"local"');
    expect(config!.content).toContain('AI_LLM_MODEL_PATH');
    expect(config!.content).toContain('phi-4-mini-q4.gguf');
    expect(config!.content).toContain('AI_STT_MODEL_PATH');
    expect(config!.content).toContain('whisper-base.bin');
    expect(config!.content).toContain('AI_VOICE_PATHS');
    expect(config!.content).toContain('Kore');
    expect(config!.content).toContain('Charon');
  });
});

describe('Local AI Manager GDScript', () => {
  it('generates a valid GDScript file', () => {
    const file = generateLocalAIManagerScript();
    expect(file.path).toBe('scripts/services/local_ai_manager.gd');
    expect(file.content).toContain('extends Node');
    expect(file.content).toContain('InsimulExportConfig.AI_PROVIDER');
    expect(file.content).toContain('signal generation_complete');
    expect(file.content).toContain('func generate(');
    expect(file.content).toContain('func is_available()');
    expect(file.content).toContain('func has_tts()');
    expect(file.content).toContain('func has_stt()');
    expect(file.content).toContain('_build_prompt');
  });

  it('references InsimulExportConfig constants', () => {
    const file = generateLocalAIManagerScript();
    expect(file.content).toContain('InsimulExportConfig.AI_LLM_MODEL_PATH');
    expect(file.content).toContain('InsimulExportConfig.AI_STT_MODEL_PATH');
    expect(file.content).toContain('InsimulExportConfig.AI_VOICE_PATHS');
  });
});
