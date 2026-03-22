/**
 * Local AI Provider — llama.cpp via node-llama-cpp
 *
 * Provides local text generation using GGUF models with no external API dependency.
 * Model loads once at startup and stays in memory. Concurrent requests are
 * queued automatically by node-llama-cpp's context sequencing.
 */

import { getLlama, type Llama, LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp';
import type { ILLMProvider, LLMRequest, LLMResponse, LLMBatchRequest, LLMBatchResponse } from '../../../llm-provider.js';

export interface LocalAIProviderConfig {
  /** Absolute path to a GGUF model file */
  modelPath?: string;
  /** Named model for bundled selection (e.g. 'phi-4-mini-q4') */
  modelName?: string;
  /** Number of GPU layers to offload (-1 = auto, 0 = CPU only) */
  gpuLayers?: number;
  /** Context window size in tokens */
  contextSize?: number;
  /** Default generation temperature */
  defaultTemperature?: number;
  /** Default max output tokens */
  maxTokens?: number;
}

interface LoadedState {
  llama: Llama;
  model: LlamaModel;
  context: LlamaContext;
}

export class LocalAIProvider implements ILLMProvider {
  readonly name = 'local';

  private config: Required<LocalAIProviderConfig>;
  private state: LoadedState | null = null;
  private loadPromise: Promise<LoadedState> | null = null;

  /** Queue to serialize generation requests (llama.cpp is single-threaded per context) */
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(config: LocalAIProviderConfig = {}) {
    this.config = {
      modelPath: config.modelPath || process.env.LOCAL_MODEL_PATH || '',
      modelName: config.modelName || process.env.LOCAL_MODEL_NAME || '',
      gpuLayers: config.gpuLayers ?? parseIntOrDefault(process.env.LOCAL_GPU_LAYERS, -1),
      contextSize: config.contextSize ?? parseIntOrDefault(process.env.LOCAL_CONTEXT_SIZE, 4096),
      defaultTemperature: config.defaultTemperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2048,
    };
  }

  /** Resolve the model path from config or environment */
  getModelPath(): string {
    if (this.config.modelPath) return this.config.modelPath;
    if (this.config.modelName) {
      // Convention: models stored in project-root/models/<name>.gguf
      return `models/${this.config.modelName}.gguf`;
    }
    throw new Error(
      'No model configured. Set LOCAL_MODEL_PATH (path to .gguf file) or LOCAL_MODEL_NAME in environment.'
    );
  }

  /** Load the llama instance, model, and context. Safe to call multiple times. */
  async ensureLoaded(): Promise<LoadedState> {
    if (this.state) return this.state;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.load();
    try {
      this.state = await this.loadPromise;
      return this.state;
    } catch (err) {
      this.loadPromise = null;
      throw err;
    }
  }

  private async load(): Promise<LoadedState> {
    const modelPath = this.getModelPath();
    console.log(`[local-ai] Loading llama.cpp engine...`);

    const llama = await getLlama();
    console.log(`[local-ai] GPU support: ${llama.gpu ? llama.gpu : 'CPU-only'}`);

    console.log(`[local-ai] Loading model: ${modelPath}`);
    const gpuLayers = this.config.gpuLayers === -1 ? undefined : this.config.gpuLayers;
    const model = await llama.loadModel({
      modelPath,
      gpuLayers: gpuLayers as number | undefined,
    });

    const context = await model.createContext({
      contextSize: this.config.contextSize,
    });

    console.log(`[local-ai] Model loaded. Context size: ${this.config.contextSize} tokens`);
    return { llama, model, context };
  }

  /** Generate a single response */
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const { context } = await this.ensureLoaded();

    return this.enqueue(async () => {
      const session = new LlamaChatSession({ contextSequence: context.getSequence() });

      try {
        const prompt = request.systemPrompt
          ? `${request.systemPrompt}\n\n${request.prompt}`
          : request.prompt;

        const response = await session.prompt(prompt, {
          temperature: request.temperature ?? this.config.defaultTemperature,
          maxTokens: request.maxTokens ?? this.config.maxTokens,
        });

        const tokensUsed = Math.ceil(response.length / 4); // rough estimate
        return {
          text: response,
          tokensUsed,
          model: this.config.modelName || 'local-gguf',
          provider: this.name,
        };
      } finally {
        session.dispose();
      }
    });
  }

  /** Stream tokens as an async iterable */
  async *generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number }
  ): AsyncIterable<string> {
    const { context } = await this.ensureLoaded();

    const session = new LlamaChatSession({ contextSequence: context.getSequence() });

    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

      const chunks: string[] = [];
      let resolve: (() => void) | null = null;
      let done = false;

      // Run prompt in background, collecting chunks
      const promptPromise = session.prompt(fullPrompt, {
        temperature: options?.temperature ?? this.config.defaultTemperature,
        maxTokens: options?.maxTokens ?? this.config.maxTokens,
        onTextChunk(chunk: string) {
          chunks.push(chunk);
          if (resolve) {
            resolve();
            resolve = null;
          }
        },
      });

      // Yield chunks as they arrive
      while (!done) {
        if (chunks.length > 0) {
          while (chunks.length > 0) {
            yield chunks.shift()!;
          }
        } else {
          // Wait for next chunk or completion
          const chunkOrDone = await Promise.race([
            new Promise<'chunk'>(r => { resolve = () => r('chunk'); }),
            promptPromise.then(() => 'done' as const),
          ]);
          if (chunkOrDone === 'done') {
            done = true;
            // Yield any remaining chunks
            while (chunks.length > 0) {
              yield chunks.shift()!;
            }
          }
        }
      }

      await promptPromise;
    } finally {
      session.dispose();
    }
  }

  /** Process batch requests sequentially through the queue */
  async generateBatch(request: LLMBatchRequest): Promise<LLMBatchResponse> {
    const responses: LLMResponse[] = [];
    const failedIndices: number[] = [];
    let totalTokensUsed = 0;

    for (let i = 0; i < request.prompts.length; i++) {
      try {
        const result = await this.generate({
          prompt: request.prompts[i],
          systemPrompt: request.systemPrompt,
          temperature: request.temperature,
          maxTokens: request.maxTokens,
        });
        responses.push(result);
        totalTokensUsed += result.tokensUsed;
      } catch {
        failedIndices.push(i);
      }
    }

    return { responses, totalTokensUsed, failedIndices };
  }

  /** Local models have zero API cost */
  estimateCost(_promptTokens: number, _completionTokens: number): number {
    return 0;
  }

  /** Check if the provider is ready (model loaded) */
  isLoaded(): boolean {
    return this.state !== null;
  }

  /** Dispose of all resources */
  async dispose(): Promise<void> {
    if (this.state) {
      await this.state.context.dispose();
      this.state.model.dispose();
      await this.state.llama.dispose();
      this.state = null;
    }
    this.loadPromise = null;
  }

  /** Enqueue a generation to serialize access to the context */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.requestQueue.then(fn, fn);
    this.requestQueue = result.then(() => {}, () => {});
    return result;
  }
}

function parseIntOrDefault(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
