/**
 * Local Streaming LLM Provider
 *
 * Adapts the LocalAIProvider (llama.cpp) to the IStreamingLLMProvider interface
 * used by the conversation system, enabling NPC-NPC conversations via local models.
 */

import type {
  IStreamingLLMProvider,
  ConversationContext,
  StreamCompletionOptions,
} from './llm-provider.js';
import { LocalAIProvider } from '../../ai/providers/local/local-ai-provider.js';

export class LocalStreamingProvider implements IStreamingLLMProvider {
  readonly name = 'local';
  private provider: LocalAIProvider;

  constructor() {
    this.provider = new LocalAIProvider();
  }

  async *streamCompletion(
    prompt: string,
    context: ConversationContext,
    options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    yield* this.provider.generateStream(
      prompt,
      context.systemPrompt,
      {
        temperature: options?.temperature ?? 0.8,
        maxTokens: options?.maxTokens ?? 1024,
      },
    );
  }
}
