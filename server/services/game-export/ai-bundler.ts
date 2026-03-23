/**
 * AI Bundler — Bundles AI model files into game exports for offline inference.
 *
 * Reads GGUF (LLM), Piper (TTS), and Whisper (STT) model files from disk
 * and packages them into the export archive alongside a model manifest.
 *
 * Works alongside asset-bundler.ts (visual assets) and plugin-bundler.ts
 * (SDK/config) to produce fully self-contained game exports.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ModelPackIR, ModelFileIR, ModelCategory } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface BundledModel {
  /** Relative path inside the export ZIP (e.g. "ai/models/phi-4-mini-q4.gguf") */
  exportPath: string;
  /** Binary content */
  buffer: Buffer;
  /** Model category */
  category: ModelCategory;
  /** Model identifier */
  modelId: string;
}

export interface AIBundleResult {
  /** Model files ready for ZIP inclusion */
  models: BundledModel[];
  /** The model pack IR for inclusion in the world IR */
  modelPack: ModelPackIR;
  /** Total size of all model files in bytes */
  totalSizeBytes: number;
}

export interface AIBundleOptions {
  /** Absolute path to the GGUF model file for text generation */
  llmModelPath?: string;
  /** Friendly name for the LLM model (e.g. 'phi-4-mini-q4') */
  llmModelName?: string;
  /** Quantization label (e.g. 'q4_k_m') */
  llmQuantization?: string;
  /** Context window size in tokens */
  contextSize?: number;
  /** Directory containing Piper voice model files (.onnx + .onnx.json) */
  ttsVoicesDir?: string;
  /** Specific voice names to include (if empty, includes all found) */
  ttsVoiceNames?: string[];
  /** Absolute path to the Whisper GGML model file */
  sttModelPath?: string;
  /** GPU layers hint (-1 = auto) */
  gpuLayers?: number;
  /** Default temperature for generation */
  temperature?: number;
  /** Engine-specific export prefix (e.g. 'Content/AI' for Unreal) */
  exportPrefix?: string;
}

// ─────────────────────────────────────────────
// Default model paths from environment
// ─────────────────────────────────────────────

function resolveDefaults(opts: AIBundleOptions): AIBundleOptions {
  return {
    llmModelPath: opts.llmModelPath || process.env.LOCAL_MODEL_PATH || undefined,
    llmModelName: opts.llmModelName || process.env.LOCAL_MODEL_NAME || undefined,
    llmQuantization: opts.llmQuantization || undefined,
    contextSize: opts.contextSize ?? parseInt(process.env.LOCAL_CONTEXT_SIZE || '4096', 10),
    ttsVoicesDir: opts.ttsVoicesDir || process.env.PIPER_VOICES_DIR || undefined,
    ttsVoiceNames: opts.ttsVoiceNames || [],
    sttModelPath: opts.sttModelPath || process.env.WHISPER_MODEL_PATH || undefined,
    gpuLayers: opts.gpuLayers ?? parseInt(process.env.LOCAL_GPU_LAYERS || '-1', 10),
    temperature: opts.temperature ?? 0.7,
    exportPrefix: opts.exportPrefix || 'ai',
  };
}

// ─────────────────────────────────────────────
// Individual model bundlers
// ─────────────────────────────────────────────

function bundleLLMModel(
  modelPath: string,
  modelName: string,
  exportPrefix: string,
  quantization?: string,
  contextSize?: number,
): { bundled: BundledModel; fileIR: ModelFileIR } | null {
  if (!fs.existsSync(modelPath)) {
    console.warn(`[AIBundler] LLM model not found: ${modelPath}`);
    return null;
  }

  const stat = fs.statSync(modelPath);
  const filename = path.basename(modelPath);
  const exportPath = `${exportPrefix}/models/${filename}`;
  const buffer = fs.readFileSync(modelPath);

  const fileIR: ModelFileIR = {
    id: modelName || path.parse(filename).name,
    name: modelName || path.parse(filename).name,
    category: 'llm',
    filename,
    exportPath,
    sizeBytes: stat.size,
    format: 'gguf',
    quantization,
    contextSize,
  };

  const bundled: BundledModel = {
    exportPath,
    buffer,
    category: 'llm',
    modelId: fileIR.id,
  };

  console.log(`[AIBundler] Bundled LLM: ${filename} (${formatSize(stat.size)})`);
  return { bundled, fileIR };
}

function bundleTTSModels(
  voicesDir: string,
  voiceNames: string[],
  exportPrefix: string,
): { bundled: BundledModel[]; fileIRs: ModelFileIR[] } {
  const bundled: BundledModel[] = [];
  const fileIRs: ModelFileIR[] = [];

  if (!fs.existsSync(voicesDir)) {
    console.warn(`[AIBundler] TTS voices directory not found: ${voicesDir}`);
    return { bundled, fileIRs };
  }

  const entries = fs.readdirSync(voicesDir);
  // Piper voices consist of .onnx model + .onnx.json config pairs
  const onnxFiles = entries.filter(f => f.endsWith('.onnx') && !f.endsWith('.onnx.json'));

  for (const onnxFile of onnxFiles) {
    const voiceName = path.parse(onnxFile).name;

    // If specific voices requested, skip others
    if (voiceNames.length > 0 && !voiceNames.includes(voiceName)) {
      continue;
    }

    const onnxPath = path.join(voicesDir, onnxFile);
    const configPath = `${onnxPath}.json`;

    if (!fs.existsSync(onnxPath)) continue;

    const onnxStat = fs.statSync(onnxPath);
    const onnxBuffer = fs.readFileSync(onnxPath);
    const onnxExportPath = `${exportPrefix}/voices/${onnxFile}`;

    bundled.push({
      exportPath: onnxExportPath,
      buffer: onnxBuffer,
      category: 'tts',
      modelId: voiceName,
    });

    let totalSize = onnxStat.size;

    // Bundle companion config file if present
    if (fs.existsSync(configPath)) {
      const configBuffer = fs.readFileSync(configPath);
      bundled.push({
        exportPath: `${exportPrefix}/voices/${onnxFile}.json`,
        buffer: configBuffer,
        category: 'tts',
        modelId: `${voiceName}_config`,
      });
      totalSize += configBuffer.length;
    }

    fileIRs.push({
      id: voiceName,
      name: voiceName,
      category: 'tts',
      filename: onnxFile,
      exportPath: onnxExportPath,
      sizeBytes: totalSize,
      format: 'piper-voice',
    });

    console.log(`[AIBundler] Bundled TTS voice: ${voiceName} (${formatSize(totalSize)})`);
  }

  return { bundled, fileIRs };
}

function bundleSTTModel(
  modelPath: string,
  exportPrefix: string,
): { bundled: BundledModel; fileIR: ModelFileIR } | null {
  if (!fs.existsSync(modelPath)) {
    console.warn(`[AIBundler] STT model not found: ${modelPath}`);
    return null;
  }

  const stat = fs.statSync(modelPath);
  const filename = path.basename(modelPath);
  const exportPath = `${exportPrefix}/stt/${filename}`;
  const buffer = fs.readFileSync(modelPath);

  const fileIR: ModelFileIR = {
    id: `whisper-${path.parse(filename).name}`,
    name: `Whisper ${path.parse(filename).name}`,
    category: 'stt',
    filename,
    exportPath,
    sizeBytes: stat.size,
    format: 'ggml',
  };

  const bundled: BundledModel = {
    exportPath,
    buffer,
    category: 'stt',
    modelId: fileIR.id,
  };

  console.log(`[AIBundler] Bundled STT: ${filename} (${formatSize(stat.size)})`);
  return { bundled, fileIR };
}

// ─────────────────────────────────────────────
// Main bundle function
// ─────────────────────────────────────────────

/**
 * Bundle AI model files for inclusion in a game export.
 *
 * Scans configured model paths and packages any found models into
 * binary buffers with a ModelPackIR manifest. Returns an empty pack
 * (enabled: false) if no models are configured or found.
 */
export async function bundleAIModels(options: AIBundleOptions = {}): Promise<AIBundleResult> {
  const opts = resolveDefaults(options);
  const exportPrefix = opts.exportPrefix!;

  const allModels: BundledModel[] = [];
  let llmFileIR: ModelFileIR | null = null;
  const ttsFileIRs: ModelFileIR[] = [];
  let sttFileIR: ModelFileIR | null = null;

  // ── LLM model ──
  if (opts.llmModelPath) {
    const result = bundleLLMModel(
      opts.llmModelPath,
      opts.llmModelName || '',
      exportPrefix,
      opts.llmQuantization,
      opts.contextSize,
    );
    if (result) {
      allModels.push(result.bundled);
      llmFileIR = result.fileIR;
    }
  }

  // ── TTS voices ──
  if (opts.ttsVoicesDir) {
    const result = bundleTTSModels(opts.ttsVoicesDir, opts.ttsVoiceNames || [], exportPrefix);
    allModels.push(...result.bundled);
    ttsFileIRs.push(...result.fileIRs);
  }

  // ── STT model ──
  if (opts.sttModelPath) {
    const result = bundleSTTModel(opts.sttModelPath, exportPrefix);
    if (result) {
      allModels.push(result.bundled);
      sttFileIR = result.fileIR;
    }
  }

  const totalSizeBytes = allModels.reduce((sum, m) => sum + m.buffer.length, 0);
  const hasAnyModels = allModels.length > 0;

  const modelPack: ModelPackIR = {
    version: '1.0.0',
    enabled: hasAnyModels,
    llmModel: llmFileIR,
    ttsModels: ttsFileIRs,
    sttModel: sttFileIR,
    totalSizeBytes,
    runtimeConfig: {
      gpuLayers: opts.gpuLayers ?? -1,
      contextSize: opts.contextSize ?? 4096,
      temperature: opts.temperature ?? 0.7,
    },
  };

  console.log(
    `[AIBundler] Bundle complete: ${allModels.length} files, ${formatSize(totalSizeBytes)} total` +
    ` (LLM: ${llmFileIR ? 'yes' : 'no'}, TTS: ${ttsFileIRs.length} voices, STT: ${sttFileIR ? 'yes' : 'no'})`,
  );

  return { models: allModels, modelPack, totalSizeBytes };
}

// ─────────────────────────────────────────────
// Model manifest generation
// ─────────────────────────────────────────────

/**
 * Generate an ai-manifest.json for the exported game to discover and load models.
 */
export function generateAIManifestJson(modelPack: ModelPackIR): string {
  return JSON.stringify({
    version: modelPack.version,
    description: 'Insimul AI Model Pack — bundled models for offline inference',
    enabled: modelPack.enabled,
    totalSizeBytes: modelPack.totalSizeBytes,
    runtimeConfig: modelPack.runtimeConfig,
    models: {
      llm: modelPack.llmModel,
      tts: modelPack.ttsModels,
      stt: modelPack.sttModel,
    },
  }, null, 2);
}

// ─────────────────────────────────────────────
// Engine-specific export path helpers
// ─────────────────────────────────────────────

export type TargetEngine = 'babylon' | 'unreal' | 'unity' | 'godot';

const ENGINE_AI_PREFIXES: Record<TargetEngine, string> = {
  babylon: 'public/data/ai',
  unity: 'Assets/StreamingAssets/ai',
  godot: 'ai',
  unreal: 'Content/AI',
};

/**
 * Get the correct AI model export prefix for a target engine.
 */
export function getEngineAIPrefix(engine: TargetEngine): string {
  return ENGINE_AI_PREFIXES[engine];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}
