/**
 * Gemini Streaming LLM Provider
 *
 * Implements IStreamingLLMProvider using @google/genai SDK
 * with generateContentStream for token-by-token delivery.
 */

import { getGenAI, GEMINI_MODELS, THINKING_LEVELS } from '../../../config/gemini.js';
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
    const ai = getGenAI();

    // Build chat history from conversation history
    const history = (options?.conversationHistory || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }));

    // Build contents: system prompt exchange + history + current prompt
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (context.systemPrompt) {
      contents.push({ role: 'user', parts: [{ text: context.systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
    }

    contents.push(...history);
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContentStream({
      model: this.modelName,
      contents,
      config: {
        temperature: options?.temperature ?? 0.8,
        maxOutputTokens: options?.maxTokens ?? 1024,
        thinkingConfig: { thinkingLevel: THINKING_LEVELS.LOW },
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  }
}
