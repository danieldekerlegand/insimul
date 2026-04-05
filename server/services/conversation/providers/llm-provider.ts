/**
 * Streaming LLM Provider Interface for the Conversation Service
 *
 * Unlike the batch-oriented ILLMProvider in server/services/llm-provider.ts,
 * this interface is designed for real-time conversation with token-by-token
 * streaming via AsyncIterable.
 */

export interface StreamCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  languageCode?: string;
  /** Model tier: 'fast' uses lighter/faster model, 'full' uses primary model */
  modelTier?: 'fast' | 'full';
  characterPersonality?: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ConversationContext {
  systemPrompt: string;
  characterName?: string;
  worldContext?: string;
  characterGender?: string;
}

export interface IStreamingLLMProvider {
  readonly name: string;

  /**
   * Stream completion tokens from the LLM.
   * Returns an AsyncIterable that yields individual text tokens/chunks.
   */
  streamCompletion(
    prompt: string,
    context: ConversationContext,
    options?: StreamCompletionOptions,
  ): AsyncIterable<string>;
}

export type StreamingLLMProviderFactory = () => IStreamingLLMProvider;
