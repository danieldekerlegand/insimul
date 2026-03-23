/**
 * Streaming LLM Provider Registry
 *
 * Manages registration and retrieval of streaming LLM providers.
 * Default provider is configured via the LLM_PROVIDER environment variable.
 */

import type { IStreamingLLMProvider, StreamingLLMProviderFactory } from './llm-provider.js';
import { GeminiStreamingProvider } from './gemini-provider.js';
import { LocalStreamingProvider } from './local-streaming-provider.js';

const providers = new Map<string, StreamingLLMProviderFactory>();

/**
 * Register a provider factory under a given name.
 */
export function registerProvider(name: string, factory: StreamingLLMProviderFactory): void {
  providers.set(name, factory);
}

/**
 * Get a provider instance by name.
 * Falls back to the LLM_PROVIDER env var, then to 'gemini'.
 */
export function getProvider(name?: string): IStreamingLLMProvider {
  const providerName = name || process.env.LLM_PROVIDER || 'gemini';
  const factory = providers.get(providerName);
  if (!factory) {
    throw new Error(
      `LLM provider '${providerName}' is not registered. Available: ${Array.from(providers.keys()).join(', ')}`,
    );
  }
  return factory();
}

/**
 * List all registered provider names.
 */
export function listProviders(): string[] {
  return Array.from(providers.keys());
}

// Register built-in providers
registerProvider('gemini', () => new GeminiStreamingProvider());
registerProvider('local', () => new LocalStreamingProvider());
