/**
 * LLM Provider Abstraction Layer
 *
 * Provider-agnostic interface for LLM calls used by the historical simulation
 * enrichment system and other AI features. Only Gemini is implemented initially;
 * OpenAI, Anthropic, and local models can be added later without architectural changes.
 */

import { getGenAI, GEMINI_MODELS, THINKING_LEVELS } from '../config/gemini.js';

export interface LLMProviderConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
  baseUrl?: string; // for local models (Ollama, LMStudio)
  defaultTemperature?: number;
  maxTokens?: number;
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMBatchRequest {
  prompts: string[];
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

export interface LLMBatchResponse {
  responses: LLMResponse[];
  totalTokensUsed: number;
  failedIndices: number[];
}

/** Abstract LLM provider interface */
export interface ILLMProvider {
  readonly name: string;

  /** Generate a single response */
  generate(request: LLMRequest): Promise<LLMResponse>;

  /** Generate responses for a batch of prompts (may be sequential or parallel) */
  generateBatch(request: LLMBatchRequest): Promise<LLMBatchResponse>;

  /** Estimate cost for a request (in USD) */
  estimateCost(promptTokens: number, completionTokens: number): number;
}

/** Gemini implementation (primary provider) */
export class GeminiProvider implements ILLMProvider {
  readonly name = 'gemini';
  private model: string;
  private defaultTemperature: number;
  private maxTokens: number;

  constructor(config: LLMProviderConfig) {
    this.model = config.model || GEMINI_MODELS.FLASH;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.maxTokens = config.maxTokens || 2048;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const ai = getGenAI();

    const result = await ai.models.generateContent({
      model: this.model,
      contents: request.systemPrompt ? `${request.systemPrompt}\n\n${request.prompt}` : request.prompt,
      config: {
        temperature: request.temperature ?? this.defaultTemperature,
        maxOutputTokens: request.maxTokens || this.maxTokens,
        thinkingConfig: { thinkingLevel: THINKING_LEVELS.LOW },
      },
    });

    const text = result.text || '';
    const tokensUsed = text.length / 4; // rough estimate

    return { text, tokensUsed: Math.ceil(tokensUsed), model: this.model, provider: this.name };
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
        }).catch(err => {
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

    return { responses, totalTokensUsed, failedIndices };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Gemini 3.1 Flash-Lite pricing (approx)
    return (promptTokens * 0.0000025 + completionTokens * 0.000015);
  }
}

/** Factory function to create the appropriate provider */
export function createLLMProvider(config?: Partial<LLMProviderConfig>): ILLMProvider {
  const providerType = config?.provider || 'gemini';

  switch (providerType) {
    case 'gemini':
      return new GeminiProvider(config as LLMProviderConfig || { provider: 'gemini' });
    case 'openai':
    case 'anthropic':
    case 'local':
      throw new Error(`LLM provider '${providerType}' is not yet implemented. Use 'gemini' for now.`);
    default:
      throw new Error(`Unknown LLM provider: ${providerType}`);
  }
}

/** Estimate cost for historical simulation enrichment */
export function estimateEnrichmentCost(
  eventCount: number,
  tier: 'none' | 'minor' | 'major' | 'all',
  provider: ILLMProvider
): { estimatedCost: number; llmCalls: number; description: string } {
  if (tier === 'none') {
    return { estimatedCost: 0, llmCalls: 0, description: 'No LLM enrichment — all events use Tracery grammars' };
  }

  // Estimate event distribution: 70% minor, 20% moderate, 10% major
  const minor = Math.floor(eventCount * 0.7);
  const moderate = Math.floor(eventCount * 0.2);
  const major = eventCount - minor - moderate;

  let llmCalls = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  if (tier === 'minor' || tier === 'all') {
    // Tier 1 still uses Tracery, but moderate events get short LLM descriptions
    const moderateBatches = Math.ceil(moderate / 15); // 15 events per batch
    llmCalls += moderateBatches;
    totalPromptTokens += moderateBatches * 800; // ~800 tokens per batch prompt
    totalCompletionTokens += moderate * 30; // ~30 tokens per event description
  }

  if (tier === 'major' || tier === 'all') {
    // Major events get individual calls
    llmCalls += major;
    totalPromptTokens += major * 500; // ~500 tokens per major event prompt
    totalCompletionTokens += major * 200; // ~200 tokens per major event narrative
  }

  if (tier === 'all') {
    // All events get some LLM touch
    const minorBatches = Math.ceil(minor / 20);
    llmCalls += minorBatches;
    totalPromptTokens += minorBatches * 600;
    totalCompletionTokens += minor * 15;
  }

  const estimatedCost = provider.estimateCost(totalPromptTokens, totalCompletionTokens);

  return {
    estimatedCost,
    llmCalls,
    description: `~${llmCalls} LLM calls for ${eventCount} events (${tier} enrichment). Estimated cost: $${estimatedCost.toFixed(4)}`,
  };
}
