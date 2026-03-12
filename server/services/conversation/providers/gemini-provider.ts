/**
 * Gemini Streaming LLM Provider
 *
 * Implements IStreamingLLMProvider using Google's Generative AI SDK
 * with generateContentStream for token-by-token delivery.
 */

import { getGenerativeAI, GEMINI_MODELS } from '../../../config/gemini.js';
import type {
  IStreamingLLMProvider,
  ConversationContext,
  StreamCompletionOptions,
} from './llm-provider.js';

export class GeminiStreamingProvider implements IStreamingLLMProvider {
  readonly name = 'gemini';
  private modelName: string;

  constructor(modelName?: string) {
    this.modelName = modelName || GEMINI_MODELS.PRO;
  }

  async *streamCompletion(
    prompt: string,
    context: ConversationContext,
    options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    const genAI = getGenerativeAI();
    const model = genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: context.systemPrompt,
    });

    // Build chat history from conversation history
    const history = (options?.conversationHistory || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: options?.temperature ?? 0.8,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    });

    const result = await chat.sendMessageStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }
}
