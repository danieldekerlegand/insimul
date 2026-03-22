/**
 * AI Provider Factory
 *
 * Reads AI_PROVIDER env var ('gemini' | 'local', default 'gemini') and returns
 * the correct provider singleton. The provider is resolved once at startup and
 * reused for all subsequent calls.
 */

import type { IAIProvider } from './ai-provider.js';

export type AIProviderType = 'gemini' | 'local';

/** Registry of provider factory functions, keyed by provider type. */
const providerFactories = new Map<AIProviderType, () => IAIProvider>();

/** Cached singleton instance. */
let providerInstance: IAIProvider | null = null;

/**
 * Register a provider factory. Called at module load time by each provider
 * implementation (e.g. gemini-ai-provider.ts registers 'gemini').
 */
export function registerAIProvider(type: AIProviderType, factory: () => IAIProvider): void {
  providerFactories.set(type, factory);
}

/**
 * Get the resolved AI provider type from the environment.
 */
export function getAIProviderType(): AIProviderType {
  const env = process.env.AI_PROVIDER?.toLowerCase();
  if (env === 'local') return 'local';
  return 'gemini';
}

/**
 * Get (or create) the AI provider singleton.
 *
 * @param type - Override the env-var-based provider type (useful for tests).
 */
export function getAIProvider(type?: AIProviderType): IAIProvider {
  const resolved = type ?? getAIProviderType();

  // Return cached instance if it matches the requested type.
  if (providerInstance && providerInstance.name === resolved) {
    return providerInstance;
  }

  const factory = providerFactories.get(resolved);
  if (!factory) {
    const available = Array.from(providerFactories.keys()).join(', ');
    throw new Error(
      `AI provider '${resolved}' is not registered. Available: ${available || 'none'}. ` +
      `Set AI_PROVIDER env var to a registered provider.`,
    );
  }

  providerInstance = factory();
  return providerInstance;
}

/**
 * List all registered provider types.
 */
export function listAIProviders(): AIProviderType[] {
  return Array.from(providerFactories.keys());
}

/**
 * Reset the singleton and optionally clear all registrations (for testing only).
 */
export function resetAIProvider(clearRegistry = false): void {
  providerInstance = null;
  if (clearRegistry) {
    providerFactories.clear();
  }
}

/**
 * Log the active AI provider status at startup.
 */
export function logAIProviderStatus(): void {
  const type = getAIProviderType();
  const available = listAIProviders();
  const isRegistered = available.includes(type);

  if (isRegistered) {
    try {
      const provider = getAIProvider();
      console.log(`✅ AI Provider: ${provider.name}`);
      if (provider.tts) console.log(`   TTS: ${provider.tts.name}`);
      else console.log('   TTS: not available');
      if (provider.stt) console.log(`   STT: ${provider.stt.name}`);
      else console.log('   STT: not available');
    } catch (err: any) {
      console.warn(`⚠️  AI Provider '${type}' registered but failed to initialize: ${err.message}`);
    }
  } else {
    console.warn(`⚠️  AI Provider '${type}' is not registered.`);
    console.warn(`   Available providers: ${available.join(', ') || 'none'}`);
    console.warn('   Set AI_PROVIDER to a registered provider in .env');
  }
}
