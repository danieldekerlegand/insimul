/**
 * LLM Provider Abstraction Layer
 *
 * Provider-agnostic interface for batch LLM calls used by rule generation,
 * character interaction, quest generation, translation, pronunciation,
 * enrichment, and other AI features.
 *
 * Follows the same registry pattern as the streaming LLM provider in
 * conversation/providers/provider-registry.ts.
 */

import { getGenAI, isGeminiConfigured, GEMINI_MODELS, THINKING_LEVELS } from '../config/gemini.js';
import { LocalAIProvider, type LocalAIProviderConfig } from './ai/providers/local/local-ai-provider.js';

export interface LLMProviderConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
  baseUrl?: string; // for local models (Ollama, LMStudio)
  defaultTemperature?: number;
  maxTokens?: number;
}

export interface LLMInlineData {
  data: string; // base64-encoded
  mimeType: string;
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string; // e.g., 'application/json'
  inlineData?: LLMInlineData[]; // for multimodal inputs (audio, images)
}

export interface LLMResponse {
  text: string;
  tokensUsed: number;
  model: string;
  provider: string;
}

export interface LLMBatchRequest {
  prompts: string[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMBatchResponse {
  responses: LLMResponse[];
  failedIndices: number[];
  totalTokensUsed: number;
}

/** Abstract LLM provider interface for batch (non-streaming) completion */
export interface ILLMProvider {
  readonly name: string;

  /** Check if the provider is configured and ready */
  isConfigured(): boolean;

  /** Generate a single response */
  generate(request: LLMRequest): Promise<LLMResponse>;
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

  constructor(config?: Partial<LLMProviderConfig>) {
    this.model = config?.model || GEMINI_MODELS.PRO;
    this.defaultTemperature = config?.defaultTemperature ?? 0.7;
    this.maxTokens = config?.maxTokens || 4096;
  }

  isConfigured(): boolean {
    return isGeminiConfigured();
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured');
    }

    const ai = getGenAI();

    // Build contents array: prompt text + optional inline data
    const contents: Array<string | { inlineData: LLMInlineData }> = [request.prompt];
    if (request.inlineData) {
      for (const data of request.inlineData) {
        contents.push({ inlineData: data });
      }
    }

    const result = await ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        systemInstruction: request.systemPrompt,
        temperature: request.temperature ?? this.defaultTemperature,
        maxOutputTokens: request.maxTokens || this.maxTokens,
        ...(request.responseMimeType ? { responseMimeType: request.responseMimeType } : {}),
      },
    });

    const text = result.text;
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

  async generateBatch(request: LLMBatchRequest): Promise<LLMBatchResponse> {
    const responses: LLMResponse[] = [];
    const failedIndices: number[] = [];
    let totalTokensUsed = 0;

    // Process in chunks of 5 for rate limiting
    const chunkSize = 5;
    for (let i = 0; i < request.prompts.length; i += chunkSize) {
      const chunk = request.prompts.slice(i, i + chunkSize);
      const promises = chunk.map((prompt, idx) =>
        this.generate({
          prompt,
          systemPrompt: request.systemPrompt,
          temperature: request.temperature,
          maxTokens: request.maxTokens,
        }).catch(() => {
          failedIndices.push(i + idx);
          return null;
        })
      );

      const results = await Promise.all(promises);
      for (const result of results) {
        if (result) {
          responses.push(result);
          totalTokensUsed += result.tokensUsed;
        }
      }

      // Small delay between chunks for rate limiting
      if (i + chunkSize < request.prompts.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    return {
      responses,
      failedIndices,
      totalTokensUsed,
    };
  }
}

// Register Gemini as built-in provider
registerLLMProvider('gemini', () => new GeminiProvider());

/** Default singleton provider instance */
let defaultProvider: ILLMProvider | null = null;

/** Get the default LLM provider (creates one if needed) */
export function getDefaultLLMProvider(): ILLMProvider {
  if (!defaultProvider) {
    defaultProvider = new GeminiProvider();
  }
  return defaultProvider;
}

/** Override the default LLM provider (useful for testing) */
export function setDefaultLLMProvider(provider: ILLMProvider): void {
  defaultProvider = provider;
}

/** Factory function to create the appropriate provider */
export function createLLMProvider(config?: Partial<LLMProviderConfig>): ILLMProvider {
  const providerType = config?.provider || 'gemini';

  switch (providerType) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'local':
      return new LocalAIProvider(config as LocalAIProviderConfig);
    case 'openai':
    case 'anthropic':
      throw new Error(`LLM provider '${providerType}' is not yet implemented. Use 'gemini' or 'local' for now.`);
    default:
      throw new Error(`Unknown LLM provider: ${providerType}`);
  }
}
