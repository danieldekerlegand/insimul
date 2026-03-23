import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  bundleAIModels,
  generateAIManifestJson,
  getEngineAIPrefix,
  type AIBundleOptions,
} from '../services/game-export/ai-bundler';

// ─────────────────────────────────────────────
// Test fixtures — create temp model files
// ─────────────────────────────────────────────

let tmpDir: string;
let llmModelPath: string;
let ttsVoicesDir: string;
let sttModelPath: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-bundler-test-'));

  // Fake GGUF model (~100 bytes for testing)
  llmModelPath = path.join(tmpDir, 'phi-4-mini-q4.gguf');
  fs.writeFileSync(llmModelPath, Buffer.alloc(128, 0xAB));

  // Fake Piper TTS voice pair (.onnx + .onnx.json)
  ttsVoicesDir = path.join(tmpDir, 'voices');
  fs.mkdirSync(ttsVoicesDir);
  fs.writeFileSync(path.join(ttsVoicesDir, 'en_US-lessac-medium.onnx'), Buffer.alloc(64, 0xCD));
  fs.writeFileSync(
    path.join(ttsVoicesDir, 'en_US-lessac-medium.onnx.json'),
    JSON.stringify({ sample_rate: 22050, phoneme_type: 'espeak' }),
  );
  fs.writeFileSync(path.join(ttsVoicesDir, 'fr_FR-siwis-medium.onnx'), Buffer.alloc(48, 0xEF));

  // Fake Whisper GGML model
  sttModelPath = path.join(tmpDir, 'ggml-base.bin');
  fs.writeFileSync(sttModelPath, Buffer.alloc(96, 0x42));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('bundleAIModels', () => {
  it('returns an empty disabled pack when no options provided and no env vars set', async () => {
    // Clear env vars that might interfere
    const saved = {
      LOCAL_MODEL_PATH: process.env.LOCAL_MODEL_PATH,
      PIPER_VOICES_DIR: process.env.PIPER_VOICES_DIR,
      WHISPER_MODEL_PATH: process.env.WHISPER_MODEL_PATH,
    };
    delete process.env.LOCAL_MODEL_PATH;
    delete process.env.PIPER_VOICES_DIR;
    delete process.env.WHISPER_MODEL_PATH;

    try {
      const result = await bundleAIModels({});
      expect(result.models).toHaveLength(0);
      expect(result.modelPack.enabled).toBe(false);
      expect(result.modelPack.llmModel).toBeNull();
      expect(result.modelPack.ttsModels).toHaveLength(0);
      expect(result.modelPack.sttModel).toBeNull();
      expect(result.totalSizeBytes).toBe(0);
    } finally {
      // Restore env
      for (const [k, v] of Object.entries(saved)) {
        if (v !== undefined) process.env[k] = v;
      }
    }
  });

  it('bundles an LLM model file', async () => {
    const result = await bundleAIModels({
      llmModelPath,
      llmModelName: 'phi-4-mini-q4',
      llmQuantization: 'q4_k_m',
      contextSize: 4096,
    });

    expect(result.models).toHaveLength(1);
    expect(result.modelPack.enabled).toBe(true);
    expect(result.modelPack.llmModel).not.toBeNull();
    expect(result.modelPack.llmModel!.id).toBe('phi-4-mini-q4');
    expect(result.modelPack.llmModel!.format).toBe('gguf');
    expect(result.modelPack.llmModel!.quantization).toBe('q4_k_m');
    expect(result.modelPack.llmModel!.contextSize).toBe(4096);
    expect(result.modelPack.llmModel!.sizeBytes).toBe(128);
    expect(result.modelPack.llmModel!.exportPath).toBe('ai/models/phi-4-mini-q4.gguf');

    // Verify binary content
    const bundled = result.models[0];
    expect(bundled.buffer.length).toBe(128);
    expect(bundled.category).toBe('llm');
  });

  it('bundles TTS voice models with config files', async () => {
    const result = await bundleAIModels({ ttsVoicesDir });

    // 2 .onnx files + 1 .onnx.json config = 3 bundled files
    expect(result.models).toHaveLength(3);
    expect(result.modelPack.enabled).toBe(true);
    expect(result.modelPack.ttsModels).toHaveLength(2);

    const lessac = result.modelPack.ttsModels.find(m => m.id === 'en_US-lessac-medium');
    expect(lessac).toBeDefined();
    expect(lessac!.format).toBe('piper-voice');
    // Size includes both .onnx and .onnx.json
    expect(lessac!.sizeBytes).toBeGreaterThan(64);

    const siwis = result.modelPack.ttsModels.find(m => m.id === 'fr_FR-siwis-medium');
    expect(siwis).toBeDefined();
    expect(siwis!.sizeBytes).toBe(48); // No config file for this one
  });

  it('filters TTS voices by name when specified', async () => {
    const result = await bundleAIModels({
      ttsVoicesDir,
      ttsVoiceNames: ['en_US-lessac-medium'],
    });

    expect(result.modelPack.ttsModels).toHaveLength(1);
    expect(result.modelPack.ttsModels[0].id).toBe('en_US-lessac-medium');
  });

  it('bundles an STT model file', async () => {
    const result = await bundleAIModels({ sttModelPath });

    expect(result.models).toHaveLength(1);
    expect(result.modelPack.enabled).toBe(true);
    expect(result.modelPack.sttModel).not.toBeNull();
    expect(result.modelPack.sttModel!.id).toBe('whisper-ggml-base');
    expect(result.modelPack.sttModel!.format).toBe('ggml');
    expect(result.modelPack.sttModel!.sizeBytes).toBe(96);
  });

  it('bundles all model types together', async () => {
    const result = await bundleAIModels({
      llmModelPath,
      llmModelName: 'phi-4-mini-q4',
      ttsVoicesDir,
      sttModelPath,
    });

    expect(result.modelPack.enabled).toBe(true);
    expect(result.modelPack.llmModel).not.toBeNull();
    expect(result.modelPack.ttsModels).toHaveLength(2);
    expect(result.modelPack.sttModel).not.toBeNull();
    // 1 LLM + 2 TTS .onnx + 1 TTS .onnx.json + 1 STT = 5 files
    expect(result.models).toHaveLength(5);
    expect(result.totalSizeBytes).toBe(128 + 64 + 48 + 96 + Buffer.byteLength(
      JSON.stringify({ sample_rate: 22050, phoneme_type: 'espeak' }),
    ));
  });

  it('uses custom export prefix', async () => {
    const result = await bundleAIModels({
      llmModelPath,
      exportPrefix: 'Content/AI',
    });

    expect(result.models[0].exportPath).toBe('Content/AI/models/phi-4-mini-q4.gguf');
    expect(result.modelPack.llmModel!.exportPath).toBe('Content/AI/models/phi-4-mini-q4.gguf');
  });

  it('handles missing model files gracefully', async () => {
    const result = await bundleAIModels({
      llmModelPath: '/nonexistent/model.gguf',
      sttModelPath: '/nonexistent/whisper.bin',
    });

    expect(result.models).toHaveLength(0);
    expect(result.modelPack.enabled).toBe(false);
  });

  it('includes runtime config defaults', async () => {
    const result = await bundleAIModels({ llmModelPath });

    expect(result.modelPack.runtimeConfig).toEqual({
      gpuLayers: -1,
      contextSize: 4096,
      temperature: 0.7,
    });
  });

  it('passes custom runtime config', async () => {
    const result = await bundleAIModels({
      llmModelPath,
      gpuLayers: 32,
      contextSize: 8192,
      temperature: 0.5,
    });

    expect(result.modelPack.runtimeConfig).toEqual({
      gpuLayers: 32,
      contextSize: 8192,
      temperature: 0.5,
    });
  });
});

describe('generateAIManifestJson', () => {
  it('generates valid JSON manifest', async () => {
    const result = await bundleAIModels({
      llmModelPath,
      llmModelName: 'phi-4-mini-q4',
      ttsVoicesDir,
    });

    const manifestJson = generateAIManifestJson(result.modelPack);
    const manifest = JSON.parse(manifestJson);

    expect(manifest.version).toBe('1.0.0');
    expect(manifest.enabled).toBe(true);
    expect(manifest.models.llm).not.toBeNull();
    expect(manifest.models.llm.id).toBe('phi-4-mini-q4');
    expect(manifest.models.tts).toHaveLength(2);
    expect(manifest.runtimeConfig.gpuLayers).toBe(-1);
  });

  it('generates disabled manifest when no models', async () => {
    const result = await bundleAIModels({});
    const manifestJson = generateAIManifestJson(result.modelPack);
    const manifest = JSON.parse(manifestJson);

    expect(manifest.enabled).toBe(false);
    expect(manifest.models.llm).toBeNull();
    expect(manifest.models.tts).toHaveLength(0);
    expect(manifest.models.stt).toBeNull();
  });
});

describe('getEngineAIPrefix', () => {
  it('returns correct prefix for each engine', () => {
    expect(getEngineAIPrefix('babylon')).toBe('public/data/ai');
    expect(getEngineAIPrefix('unity')).toBe('Assets/StreamingAssets/ai');
    expect(getEngineAIPrefix('godot')).toBe('ai');
    expect(getEngineAIPrefix('unreal')).toBe('Content/AI');
  });
});
