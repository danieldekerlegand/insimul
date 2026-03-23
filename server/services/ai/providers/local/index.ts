/**
 * Local Provider barrel export.
 *
 * Importing this module registers the 'local' provider with the factory.
 */

import { registerAIProvider } from '../../ai-provider-factory.js';
import type {
  IAIProvider,
  ITTSProvider,
  ISTTProvider,
  LLMRequest,
  LLMResponse,
  LLMBatchRequest,
  LLMBatchResponse,
  ConversationContext,
  StreamCompletionOptions,
  ImageGenerationOptions,
} from '../../ai-provider.js';
import { LocalAIProvider } from './local-ai-provider.js';
import { PiperTTSProvider } from './piper-tts-provider.js';

/**
 * Full local AI provider that composes llama.cpp text generation
 * with Piper TTS into the unified IAIProvider interface.
 */
class LocalFullAIProvider implements IAIProvider {
  readonly name = 'local' as const;

  private llm: LocalAIProvider;
  readonly tts: ITTSProvider | null;
  readonly stt: ISTTProvider | null = null; // Whisper STT not yet implemented

  constructor() {
    this.llm = new LocalAIProvider();

    const piperTTS = new PiperTTSProvider();
    this.tts = piperTTS.isAvailable() ? piperTTS : null;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    return this.llm.generate(request);
  }

  async generateBatch(request: LLMBatchRequest): Promise<LLMBatchResponse> {
    return this.llm.generateBatch(request);
  }

  async *generateStream(
    prompt: string,
    context: ConversationContext,
    _options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    yield* this.llm.generateStream(prompt, context.systemPrompt, {
      temperature: _options?.temperature,
      maxTokens: _options?.maxTokens,
    });
  }

  estimateCost(_promptTokens: number, _completionTokens: number): number {
    return 0;
  }

  async generateImage(_prompt: string, _options?: ImageGenerationOptions): Promise<Buffer | null> {
    return null;
  }
}

// Self-register with the factory on module load
registerAIProvider('local', () => new LocalFullAIProvider());

export { LocalAIProvider } from './local-ai-provider.js';
export { PiperTTSProvider } from './piper-tts-provider.js';
