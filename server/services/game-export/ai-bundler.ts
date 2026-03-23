/**
 * AI Bundler — Packages local AI models (LLM, TTS, STT) for game exports.
 *
 * Reads model files from configured paths and produces bundled assets
 * with a manifest for inclusion in exported game projects.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type AIProvider = 'cloud' | 'local';

export interface AIBundleOptions {
  /** Which AI provider mode to bundle for */
  provider: AIProvider;
  /** Include LLM model file (GGUF) */
  includeLLM?: boolean;
  /** Include TTS voice models (Piper ONNX) */
  includeTTS?: boolean;
  /** Include STT model (Whisper GGML) */
  includeSTT?: boolean;
}

export interface AIModelEntry {
  /** Relative path within the export's AI directory */
  exportPath: string;
  /** File buffer */
  buffer: Buffer;
  /** Size in bytes */
  sizeBytes: number;
  /** Model type */
  type: 'llm' | 'tts' | 'stt';
  /** Human-readable model name */
  name: string;
}

export interface AIBundleManifest {
  provider: AIProvider;
  models: {
    name: string;
    type: string;
    path: string;
    sizeBytes: number;
  }[];
  totalSizeBytes: number;
}

export interface AIBundleResult {
  models: AIModelEntry[];
  manifest: AIBundleManifest;
  totalSizeBytes: number;
}

// ─────────────────────────────────────────────
// Environment config
// ─────────────────────────────────────────────

function getModelPaths() {
  return {
    llmPath: process.env.LOCAL_MODEL_PATH || '',
    llmName: process.env.LOCAL_MODEL_NAME || 'phi-4-mini-q4',
    piperVoicesDir: process.env.PIPER_VOICES_DIR || '',
    whisperModelPath: process.env.WHISPER_MODEL_PATH || '',
    whisperModelSize: process.env.WHISPER_MODEL_SIZE || 'base',
  };
}

// ─────────────────────────────────────────────
// Model bundling helpers
// ─────────────────────────────────────────────

function bundleLLMModel(llmPath: string, llmName: string): AIModelEntry | null {
  if (!llmPath || !existsSync(llmPath)) {
    console.warn('[AI-Bundler] LLM model not found:', llmPath || '(not configured)');
    return null;
  }

  const stat = statSync(llmPath);
  const fileName = basename(llmPath);

  return {
    exportPath: `ai/models/${fileName}`,
    buffer: readFileSync(llmPath),
    sizeBytes: stat.size,
    type: 'llm',
    name: llmName,
  };
}

function bundleTTSModels(voicesDir: string): AIModelEntry[] {
  if (!voicesDir || !existsSync(voicesDir)) {
    console.warn('[AI-Bundler] Piper voices directory not found:', voicesDir || '(not configured)');
    return [];
  }

  const entries: AIModelEntry[] = [];
  const files = readdirSync(voicesDir);

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    // Piper models are .onnx files with companion .onnx.json config files
    if (ext !== '.onnx' && ext !== '.json') continue;

    const filePath = join(voicesDir, file);
    const stat = statSync(filePath);
    if (!stat.isFile()) continue;

    entries.push({
      exportPath: `ai/models/voices/${file}`,
      buffer: readFileSync(filePath),
      sizeBytes: stat.size,
      type: 'tts',
      name: file.replace(/\.(onnx|onnx\.json|json)$/, ''),
    });
  }

  return entries;
}

function bundleSTTModel(whisperPath: string, modelSize: string): AIModelEntry | null {
  if (!whisperPath || !existsSync(whisperPath)) {
    console.warn('[AI-Bundler] Whisper model not found:', whisperPath || '(not configured)');
    return null;
  }

  const stat = statSync(whisperPath);
  const fileName = basename(whisperPath);

  return {
    exportPath: `ai/models/${fileName}`,
    buffer: readFileSync(whisperPath),
    sizeBytes: stat.size,
    type: 'stt',
    name: `whisper-${modelSize}`,
  };
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Build the AI bundle manifest without reading model files.
 * Useful for displaying estimated sizes before download.
 */
export function getAIBundleEstimate(): AIBundleManifest {
  const paths = getModelPaths();
  const models: AIBundleManifest['models'] = [];
  let totalSizeBytes = 0;

  if (paths.llmPath && existsSync(paths.llmPath)) {
    const size = statSync(paths.llmPath).size;
    models.push({ name: paths.llmName, type: 'llm', path: `ai/models/${basename(paths.llmPath)}`, sizeBytes: size });
    totalSizeBytes += size;
  }

  if (paths.piperVoicesDir && existsSync(paths.piperVoicesDir)) {
    const files = readdirSync(paths.piperVoicesDir).filter(f => f.endsWith('.onnx') || f.endsWith('.json'));
    for (const file of files) {
      const filePath = join(paths.piperVoicesDir, file);
      if (statSync(filePath).isFile()) {
        const size = statSync(filePath).size;
        models.push({ name: file, type: 'tts', path: `ai/models/voices/${file}`, sizeBytes: size });
        totalSizeBytes += size;
      }
    }
  }

  if (paths.whisperModelPath && existsSync(paths.whisperModelPath)) {
    const size = statSync(paths.whisperModelPath).size;
    models.push({ name: `whisper-${paths.whisperModelSize}`, type: 'stt', path: `ai/models/${basename(paths.whisperModelPath)}`, sizeBytes: size });
    totalSizeBytes += size;
  }

  return { provider: 'local', models, totalSizeBytes };
}

/**
 * Bundle AI model files for inclusion in a game export.
 *
 * Returns model buffers + manifest JSON. Only reads files when
 * provider is 'local' and the relevant include flags are set.
 */
export function bundleAIModels(options: AIBundleOptions): AIBundleResult {
  const models: AIModelEntry[] = [];

  if (options.provider === 'cloud') {
    // Cloud mode — no models to bundle, just return empty manifest
    return {
      models: [],
      manifest: { provider: 'cloud', models: [], totalSizeBytes: 0 },
      totalSizeBytes: 0,
    };
  }

  const paths = getModelPaths();

  // Bundle LLM model
  if (options.includeLLM !== false) {
    const llm = bundleLLMModel(paths.llmPath, paths.llmName);
    if (llm) models.push(llm);
  }

  // Bundle TTS voice models
  if (options.includeTTS !== false) {
    const ttsModels = bundleTTSModels(paths.piperVoicesDir);
    models.push(...ttsModels);
  }

  // Bundle STT model
  if (options.includeSTT !== false) {
    const stt = bundleSTTModel(paths.whisperModelPath, paths.whisperModelSize);
    if (stt) models.push(stt);
  }

  const totalSizeBytes = models.reduce((sum, m) => sum + m.sizeBytes, 0);

  const manifest: AIBundleManifest = {
    provider: 'local',
    models: models.map(m => ({
      name: m.name,
      type: m.type,
      path: m.exportPath,
      sizeBytes: m.sizeBytes,
    })),
    totalSizeBytes,
  };

  console.log(`[AI-Bundler] Bundled ${models.length} models, total ${(totalSizeBytes / 1024 / 1024).toFixed(1)} MB`);

  return { models, manifest, totalSizeBytes };
}

/**
 * Generate manifest JSON string for inclusion in exports.
 */
export function generateAIManifestJson(manifest: AIBundleManifest): string {
  return JSON.stringify(manifest, null, 2);
}
