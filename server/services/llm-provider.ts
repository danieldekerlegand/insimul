/**
 * LLM Provider Abstraction Layer
 *
 * Provider-agnostic interface for batch LLM calls used by rule generation,
 * character interaction, quest generation, and historical simulation enrichment.
 *
 * Follows the same registry pattern as the streaming LLM provider in
 * conversation/providers/provider-registry.ts.
 */

import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from '../config/gemini.js';

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  tokensUsed: number;
  model: string;
  provider: string;
}

/** Abstract LLM provider interface for batch (non-streaming) completion */
export interface ILLMProvider {
  readonly name: string;

  /** Generate a single response */
  generate(request: LLMRequest): Promise<LLMResponse>;

  /** Check if the provider is configured and ready */
  isConfigured(): boolean;
}

export type LLMProviderFactory = () => ILLMProvider;

// ── Provider Registry ─────────────────────────────────────────────────

const providers = new Map<string, LLMProviderFactory>();

/** Register a provider factory under a given name. */
export function registerLLMProvider(name: string, factory: LLMProviderFactory): void {
  providers.set(name, factory);
}

/**
 * Get a provider instance by name.
 * Falls back to the LLM_PROVIDER env var, then to 'gemini'.
 */
export function getLLMProvider(name?: string): ILLMProvider {
  const providerName = name || process.env.LLM_PROVIDER || 'gemini';
  const factory = providers.get(providerName);
  if (!factory) {
    throw new Error(
      `LLM provider '${providerName}' is not registered. Available: ${listLLMProviders().join(', ') || 'none'}`,
    );
  }
  return factory();
}

/** List all registered provider names. */
export function listLLMProviders(): string[] {
  return Array.from(providers.keys());
}

/** Clear all registered providers (for testing). */
export function clearLLMProviders(): void {
  providers.clear();
}

// ── Gemini Implementation ─────────────────────────────────────────────

export class GeminiProvider implements ILLMProvider {
  readonly name = 'gemini';
  private model: string;
  private defaultTemperature: number;
  private maxTokens: number;

  constructor(options?: { model?: string; temperature?: number; maxTokens?: number }) {
    this.model = options?.model || GEMINI_MODELS.PRO;
    this.defaultTemperature = options?.temperature ?? 0.7;
    this.maxTokens = options?.maxTokens || 4096;
  }

  isConfigured(): boolean {
    return isGeminiConfigured();
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured');
    }

    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: this.model,
      config: {
        systemInstruction: request.systemPrompt,
        temperature: request.temperature ?? this.defaultTemperature,
        maxOutputTokens: request.maxTokens || this.maxTokens,
      },
      contents: request.prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error('AI service returned empty response');
    }

    return {
      text,
      tokensUsed: Math.ceil(text.length / 4),
      model: this.model,
      provider: this.name,
    };
  }
}

// Register Gemini as built-in provider
registerLLMProvider('gemini', () => new GeminiProvider());
