/**
 * Unified AI Provider Configuration
 *
 * Reads AI provider settings from environment variables and provides
 * startup logging for the active provider configuration.
 */

import { isGeminiConfigured, GEMINI_MODELS } from './gemini.js';

export type AIProviderType = 'gemini' | 'local';
export type WhisperModelSize = 'tiny' | 'base' | 'small' | 'medium' | 'large';

export interface AIConfig {
  provider: AIProviderType;
  gemini: {
    configured: boolean;
  };
  local: {
    modelPath: string | undefined;
    modelName: string;
    gpuLayers: number | 'auto';
    contextSize: number;
    piperVoicesDir: string | undefined;
    whisperModelPath: string | undefined;
    whisperModelSize: WhisperModelSize;
  };
}

const VALID_PROVIDERS: AIProviderType[] = ['gemini', 'local'];
const VALID_WHISPER_SIZES: WhisperModelSize[] = ['tiny', 'base', 'small', 'medium', 'large'];

/**
 * Read and validate all AI provider configuration from environment variables.
 */
export function getAIConfig(): AIConfig {
  const rawProvider = process.env.AI_PROVIDER || 'gemini';
  const provider: AIProviderType = VALID_PROVIDERS.includes(rawProvider as AIProviderType)
    ? (rawProvider as AIProviderType)
    : 'gemini';

  const rawGpuLayers = process.env.LOCAL_GPU_LAYERS;
  let gpuLayers: number | 'auto' = 'auto';
  if (rawGpuLayers !== undefined && rawGpuLayers !== '' && rawGpuLayers !== 'auto') {
    const parsed = parseInt(rawGpuLayers, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      gpuLayers = parsed;
    }
  }

  const rawContextSize = process.env.LOCAL_CONTEXT_SIZE;
  let contextSize = 4096;
  if (rawContextSize !== undefined && rawContextSize !== '') {
    const parsed = parseInt(rawContextSize, 10);
    if (!isNaN(parsed) && parsed > 0) {
      contextSize = parsed;
    }
  }

  const rawWhisperSize = process.env.WHISPER_MODEL_SIZE || 'base';
  const whisperModelSize: WhisperModelSize = VALID_WHISPER_SIZES.includes(rawWhisperSize as WhisperModelSize)
    ? (rawWhisperSize as WhisperModelSize)
    : 'base';

  return {
    provider,
    gemini: {
      configured: isGeminiConfigured(),
    },
    local: {
      modelPath: process.env.LOCAL_MODEL_PATH || undefined,
      modelName: process.env.LOCAL_MODEL_NAME || 'phi-4-mini-q4',
      gpuLayers,
      contextSize,
      piperVoicesDir: process.env.PIPER_VOICES_DIR || undefined,
      whisperModelPath: process.env.WHISPER_MODEL_PATH || undefined,
      whisperModelSize,
    },
  };
}

/**
 * Log AI provider status on startup. Replaces logGeminiStatus().
 */
export function logAIStatus(): void {
  const config = getAIConfig();

  console.log('\n🤖 AI Provider Configuration:');
  console.log(`   Active provider: ${config.provider}`);

  if (config.provider === 'gemini') {
    if (config.gemini.configured) {
      console.log('   ✅ Gemini AI configured');
      console.log(`   Models: PRO=${GEMINI_MODELS.PRO}, FLASH=${GEMINI_MODELS.FLASH}`);
    } else {
      console.warn('   ⚠️  Gemini API key not found');
      console.warn('   Set GEMINI_API_KEY or GEMINI_FREE_API_KEY in .env');
      console.warn('   AI features will use fallbacks');
    }
  } else if (config.provider === 'local') {
    const local = config.local;

    // Text generation
    if (local.modelPath) {
      console.log(`   ✅ Local LLM model: ${local.modelPath}`);
    } else {
      console.log(`   📦 Local LLM model: ${local.modelName} (bundled)`);
    }
    console.log(`   Context size: ${local.contextSize} tokens`);
    console.log(`   GPU layers: ${local.gpuLayers}`);

    // TTS
    if (local.piperVoicesDir) {
      console.log(`   ✅ Piper TTS voices: ${local.piperVoicesDir}`);
    } else {
      console.warn('   ⚠️  PIPER_VOICES_DIR not set — local TTS unavailable');
    }

    // STT
    if (local.whisperModelPath) {
      console.log(`   ✅ Whisper STT model: ${local.whisperModelPath} (${local.whisperModelSize})`);
    } else {
      console.warn('   ⚠️  WHISPER_MODEL_PATH not set — local STT unavailable');
    }

    // Gemini fallback
    if (config.gemini.configured) {
      console.log('   ℹ️  Gemini API key also available (fallback)');
    }
  }
}
