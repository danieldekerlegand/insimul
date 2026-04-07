/**
 * Centralized Gemini AI Configuration
 *
 * This module provides a single source of truth for Gemini AI setup,
 * ensuring consistency across the entire codebase.
 */

import { GoogleGenAI, ThinkingLevel } from '@google/genai';

/**
 * Gemini model configurations — Gemini 3.1 series
 */
export const GEMINI_MODELS = {
  /** Primary model for complex tasks (rule generation, world building, etc.) */
  PRO: 'gemini-2.5-pro',

  /** Fast model for NPC chat and high-volume tasks — best speed/quality balance */
  FLASH: 'gemini-2.5-flash',

  /** Ultra-light model for simple tasks (translation, classification) */
  FLASH_LITE: 'gemini-2.5-flash-lite',

  /** Model for speech/TTS tasks */
  SPEECH: 'gemini-2.5-flash-preview-tts',

  /** Real-time audio-to-audio model (Flash Live) */
  LIVE: 'gemini-3.1-flash-live-preview',
} as const;

/**
 * Thinking levels for Gemini 3.1 reasoning control.
 * Controls the depth of internal reasoning before generating a response.
 * Re-exports the SDK enum for convenience.
 */
export const THINKING_LEVELS = {
  /** Minimal reasoning — fastest, lowest cost */
  MINIMAL: ThinkingLevel.MINIMAL,
  /** Low reasoning — fast, cost-efficient */
  LOW: ThinkingLevel.LOW,
  /** Balanced reasoning — good default for most tasks */
  MEDIUM: ThinkingLevel.MEDIUM,
  /** Maximum reasoning depth — best quality, highest cost */
  HIGH: ThinkingLevel.HIGH,
} as const;

export { ThinkingLevel };

/**
 * Get the Gemini API key from environment variables
 */
export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_FREE_API_KEY || process.env.GEMINI_API_KEY;
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!getGeminiApiKey();
}

/**
 * Shared GoogleGenAI instance (@google/genai)
 */
let genAIInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY or GEMINI_FREE_API_KEY in .env');
  }

  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey });
  }

  return genAIInstance;
}

/**
 * Build a thinkingConfig object for the @google/genai SDK.
 * Returns an empty object for models that don't support thinking (gemini-2.x).
 * @param level - Thinking level (defaults to MEDIUM for balanced cost/quality)
 * @param model - Model name to check for thinking support
 */
export function buildThinkingConfig(level: ThinkingLevel = ThinkingLevel.MEDIUM, model?: string) {
  // gemini-2.x models don't support thinkingConfig
  if (model && !model.includes('3.')) {
    return {};
  }
  // If no model specified, skip thinking by default (safe for all models)
  if (!model) {
    return {};
  }
  return { thinkingConfig: { thinkingLevel: level } };
}

/**
 * Log Gemini configuration status on startup
 */
export function logGeminiStatus() {
  if (isGeminiConfigured()) {
    console.log('✅ Gemini AI configured');
    console.log(`   Models: PRO=${GEMINI_MODELS.PRO}, FLASH=${GEMINI_MODELS.FLASH}`);
  } else {
    console.warn('⚠️  Gemini API key not found');
    console.warn('   Set GEMINI_API_KEY or GEMINI_FREE_API_KEY in .env');
    console.warn('   Some features (AI chat, name generation) will use fallbacks');
  }
}
