/**
 * AI Bundler — Bundles local AI model files into game exports.
 *
 * Packages GGUF (llama.cpp), Piper TTS voice models, and Whisper STT models
 * into exported game projects so they can run AI inference fully offline.
 *
 * Model files are resolved from environment variables or conventional paths:
 *   - GGUF model:   LOCAL_MODEL_PATH or models/<LOCAL_MODEL_NAME>.gguf
 *   - Piper voices: PIPER_VOICES_DIR/<voice>.onnx
 *   - Whisper:      WHISPER_MODEL_PATH or models/whisper-base.bin
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { BundledAsset } from './asset-bundler';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type AIProvider = 'cloud' | 'local';

export interface AIBundleOptions {
  /** Include GGUF LLM model (default: true) */
  includeLLM?: boolean;
  /** Include Piper TTS voice models (default: true) */
  includeTTS?: boolean;
  /** Include Whisper STT model (default: true) */
  includeSTT?: boolean;
  /** Override voice names to bundle (default: all voices in PIPER_VOICES_DIR) */
  voices?: string[];
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
  provider: 'local';
  llm: { modelPath: string; fileSizeBytes: number } | null;
  tts: { voicePaths: Record<string, string>; totalSizeBytes: number } | null;
  stt: { modelPath: string; fileSizeBytes: number } | null;
  totalSizeBytes: number;
}

export interface AIBundleResult {
  assets: BundledAsset[];
  manifest: AIBundleManifest;
  totalSizeBytes: number;
}

// ─────────────────────────────────────────────
// Default voice mappings (Insimul voice names → Piper voice file basenames)
// ─────────────────────────────────────────────

const DEFAULT_VOICE_MAP: Record<string, string> = {
  Kore: 'en_US-amy-medium',
  Charon: 'en_US-ryan-medium',
  Aoede: 'en_US-lessac-medium',
  Puck: 'en_US-joe-medium',
};

// ─────────────────────────────────────────────
// Path resolution
// ─────────────────────────────────────────────

function getProjectRoot(): string {
  const thisDir = path.dirname(new URL(import.meta.url).pathname);
  return path.resolve(thisDir, '..', '..', '..');
}

export function resolveLLMModelPath(): string | null {
  if (process.env.LOCAL_MODEL_PATH) return process.env.LOCAL_MODEL_PATH;
  if (process.env.LOCAL_MODEL_NAME) {
    return path.join(getProjectRoot(), 'models', `${process.env.LOCAL_MODEL_NAME}.gguf`);
  }
  // Default conventions — try Qwen (public) first, then Phi (gated)
  for (const name of ['qwen2.5-3b-instruct-q4_k_m', 'phi-4-mini-q4']) {
    const p = path.join(getProjectRoot(), 'models', `${name}.gguf`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function resolvePiperVoicesDir(): string | null {
  if (process.env.PIPER_VOICES_DIR) return process.env.PIPER_VOICES_DIR;
  const defaultDir = path.join(getProjectRoot(), 'models', 'piper-voices');
  if (fs.existsSync(defaultDir)) return defaultDir;
  return null;
}

export function resolveWhisperModelPath(): string | null {
  if (process.env.WHISPER_MODEL_PATH) return process.env.WHISPER_MODEL_PATH;
  const defaultPath = path.join(getProjectRoot(), 'models', 'whisper-base.bin');
  if (fs.existsSync(defaultPath)) return defaultPath;
  return null;
}

// ─────────────────────────────────────────────
// Availability check
// ─────────────────────────────────────────────

export interface LocalAIStatus {
  available: boolean;
  llm: { found: boolean; path: string | null; sizeBytes: number };
  tts: { found: boolean; dir: string | null; voiceCount: number; totalSizeBytes: number };
  stt: { found: boolean; path: string | null; sizeBytes: number };
  /** Human-readable list of what's missing */
  missing: string[];
}

/**
 * Check whether local AI models are available for bundling.
 * Does NOT read file contents — just checks existence and sizes.
 */
export function checkLocalAIAvailability(): LocalAIStatus {
  const missing: string[] = [];

  // LLM
  const llmPath = resolveLLMModelPath();
  const llmFound = llmPath !== null && fs.existsSync(llmPath);
  const llmSize = llmFound ? fs.statSync(llmPath!).size : 0;
  if (!llmFound) missing.push('LLM model (run: ./scripts/setup-local-ai.sh --llm-only)');

  // TTS
  const voicesDir = resolvePiperVoicesDir();
  let ttsFound = false;
  let voiceCount = 0;
  let ttsTotalSize = 0;
  if (voicesDir && fs.existsSync(voicesDir)) {
    const onnxFiles = fs.readdirSync(voicesDir).filter(f => f.endsWith('.onnx'));
    voiceCount = onnxFiles.length;
    ttsFound = voiceCount > 0;
    for (const f of onnxFiles) {
      ttsTotalSize += fs.statSync(path.join(voicesDir, f)).size;
    }
  }
  if (!ttsFound) missing.push('Piper TTS voices (run: ./scripts/setup-local-ai.sh --tts-only)');

  // STT
  const sttPath = resolveWhisperModelPath();
  const sttFound = sttPath !== null && fs.existsSync(sttPath);
  const sttSize = sttFound ? fs.statSync(sttPath!).size : 0;
  if (!sttFound) missing.push('Whisper STT model (run: ./scripts/setup-local-ai.sh --stt-only)');

  return {
    available: llmFound && ttsFound && sttFound,
    llm: { found: llmFound, path: llmPath, sizeBytes: llmSize },
    tts: { found: ttsFound, dir: voicesDir, voiceCount, totalSizeBytes: ttsTotalSize },
    stt: { found: sttFound, path: sttPath, sizeBytes: sttSize },
    missing,
  };
}

// ─────────────────────────────────────────────
// Engine-specific export path prefixes
// ─────────────────────────────────────────────

export type AITargetEngine = 'babylon' | 'godot' | 'unity' | 'unreal';

function getAIExportPrefix(engine: AITargetEngine): string {
  switch (engine) {
    case 'babylon': return 'assets/ai';
    case 'godot':   return 'ai';       // res://ai/ in Godot
    case 'unity':   return 'StreamingAssets/ai';
    case 'unreal':  return 'Content/AI';
  }
}

/**
 * Get the correct AI model export prefix for a target engine.
 * Public alias for use by other modules.
 */
export function getEngineAIPrefix(engine: AITargetEngine): string {
  return getAIExportPrefix(engine);
}

// ─────────────────────────────────────────────
// Bundle estimation (from Unity branch)
// ─────────────────────────────────────────────

/**
 * Build an AI bundle size estimate without reading full model files.
 * Useful for displaying estimated sizes before download.
 */
export function getAIBundleEstimate(): { models: { name: string; type: string; path: string; sizeBytes: number }[]; totalSizeBytes: number } {
  const models: { name: string; type: string; path: string; sizeBytes: number }[] = [];
  let totalSizeBytes = 0;

  const llmPath = resolveLLMModelPath();
  if (llmPath && fs.existsSync(llmPath)) {
    const size = fs.statSync(llmPath).size;
    models.push({ name: process.env.LOCAL_MODEL_NAME || 'phi-4-mini-q4', type: 'llm', path: `ai/models/${path.basename(llmPath)}`, sizeBytes: size });
    totalSizeBytes += size;
  }

  const voicesDir = resolvePiperVoicesDir();
  if (voicesDir && fs.existsSync(voicesDir)) {
    const files = fs.readdirSync(voicesDir).filter(f => f.endsWith('.onnx') || f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(voicesDir, file);
      if (fs.statSync(filePath).isFile()) {
        const size = fs.statSync(filePath).size;
        models.push({ name: file, type: 'tts', path: `ai/models/voices/${file}`, sizeBytes: size });
        totalSizeBytes += size;
      }
    }
  }

  const whisperPath = resolveWhisperModelPath();
  if (whisperPath && fs.existsSync(whisperPath)) {
    const size = fs.statSync(whisperPath).size;
    const modelSize = process.env.WHISPER_MODEL_SIZE || 'base';
    models.push({ name: `whisper-${modelSize}`, type: 'stt', path: `ai/models/${path.basename(whisperPath)}`, sizeBytes: size });
    totalSizeBytes += size;
  }

  return { models, totalSizeBytes };
}

// ─────────────────────────────────────────────
// Bundle AI models
// ─────────────────────────────────────────────

/**
 * Bundle AI model files for inclusion in a game export.
 * Returns binary assets and a manifest describing what was bundled.
 *
 * Missing model files are skipped with warnings — the export still succeeds
 * but the manifest reflects which components are absent.
 */
export async function bundleAIModels(
  engine: AITargetEngine,
  options: AIBundleOptions = {},
): Promise<AIBundleResult> {
  const prefix = getAIExportPrefix(engine);
  const assets: BundledAsset[] = [];
  let totalSizeBytes = 0;

  const manifest: AIBundleManifest = {
    provider: 'local',
    llm: null,
    tts: null,
    stt: null,
    totalSizeBytes: 0,
  };

  // ── LLM model (GGUF) ──
  if (options.includeLLM !== false) {
    const llmPath = resolveLLMModelPath();
    if (llmPath && fs.existsSync(llmPath)) {
      const buffer = fs.readFileSync(llmPath);
      const exportPath = `${prefix}/models/${path.basename(llmPath)}`;
      assets.push({ exportPath, buffer, category: 'ai' as any, role: 'llm_model' });
      manifest.llm = { modelPath: exportPath, fileSizeBytes: buffer.length };
      totalSizeBytes += buffer.length;
      console.log(`[AIBundler] LLM model bundled: ${path.basename(llmPath)} (${Math.round(buffer.length / 1024 / 1024)}MB)`);
    } else {
      console.warn(`[AIBundler] LLM model not found — skipping. Set LOCAL_MODEL_PATH or place model in models/`);
    }
  }

  // ── Piper TTS voices ──
  if (options.includeTTS !== false) {
    const voicesDir = resolvePiperVoicesDir();
    const voicePaths: Record<string, string> = {};
    let ttsSizeBytes = 0;

    if (voicesDir && fs.existsSync(voicesDir)) {
      const requestedVoices = options.voices ?? Object.keys(DEFAULT_VOICE_MAP);

      for (const voiceName of requestedVoices) {
        const piperBasename = DEFAULT_VOICE_MAP[voiceName] ?? voiceName;
        const onnxFile = path.join(voicesDir, `${piperBasename}.onnx`);
        const jsonFile = path.join(voicesDir, `${piperBasename}.onnx.json`);

        if (fs.existsSync(onnxFile)) {
          const buffer = fs.readFileSync(onnxFile);
          const exportPath = `${prefix}/voices/${piperBasename}.onnx`;
          assets.push({ exportPath, buffer, category: 'ai' as any, role: `tts_voice_${voiceName}` });
          voicePaths[voiceName] = exportPath;
          ttsSizeBytes += buffer.length;
          totalSizeBytes += buffer.length;

          // Bundle companion JSON config if present
          if (fs.existsSync(jsonFile)) {
            const jsonBuffer = fs.readFileSync(jsonFile);
            const jsonExportPath = `${prefix}/voices/${piperBasename}.onnx.json`;
            assets.push({ exportPath: jsonExportPath, buffer: jsonBuffer, category: 'ai' as any, role: `tts_voice_${voiceName}_config` });
            ttsSizeBytes += jsonBuffer.length;
            totalSizeBytes += jsonBuffer.length;
          }

          console.log(`[AIBundler] TTS voice bundled: ${voiceName} → ${piperBasename} (${Math.round(buffer.length / 1024 / 1024)}MB)`);
        } else {
          console.warn(`[AIBundler] TTS voice not found: ${piperBasename}.onnx in ${voicesDir}`);
        }
      }

      if (Object.keys(voicePaths).length > 0) {
        manifest.tts = { voicePaths, totalSizeBytes: ttsSizeBytes };
      }
    } else {
      console.warn(`[AIBundler] Piper voices directory not found — skipping TTS. Set PIPER_VOICES_DIR`);
    }
  }

  // ── Whisper STT model ──
  if (options.includeSTT !== false) {
    const whisperPath = resolveWhisperModelPath();
    if (whisperPath && fs.existsSync(whisperPath)) {
      const buffer = fs.readFileSync(whisperPath);
      const exportPath = `${prefix}/models/${path.basename(whisperPath)}`;
      assets.push({ exportPath, buffer, category: 'ai' as any, role: 'stt_model' });
      manifest.stt = { modelPath: exportPath, fileSizeBytes: buffer.length };
      totalSizeBytes += buffer.length;
      console.log(`[AIBundler] STT model bundled: ${path.basename(whisperPath)} (${Math.round(buffer.length / 1024 / 1024)}MB)`);
    } else {
      console.warn(`[AIBundler] Whisper model not found — skipping STT. Set WHISPER_MODEL_PATH`);
    }
  }

  // ── Write manifest JSON as a text asset ──
  manifest.totalSizeBytes = totalSizeBytes;
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestBuffer = Buffer.from(manifestJson, 'utf-8');
  assets.push({
    exportPath: `${prefix}/ai-manifest.json`,
    buffer: manifestBuffer,
    category: 'ai' as any,
    role: 'ai_manifest',
  });
  totalSizeBytes += manifestBuffer.length;

  console.log(`[AIBundler] Total AI bundle: ${assets.length} files, ${Math.round(totalSizeBytes / 1024 / 1024)}MB`);

  return { assets, manifest, totalSizeBytes };
}

/**
 * Generate the AI manifest as a JSON string (for text-based file inclusion).
 */
export function generateAIManifestJson(manifest: AIBundleManifest): string {
  return JSON.stringify(manifest, null, 2);
}
