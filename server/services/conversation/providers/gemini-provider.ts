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

    // Select model and parameters based on tier
    const isFastTier = options?.modelTier === 'fast';
    const modelName = isFastTier ? GEMINI_MODELS.FLASH : this.modelName;
    const defaultMaxTokens = isFastTier ? 256 : 1024;
    const defaultTemperature = isFastTier ? 0.7 : 0.8;
    const thinkingLevel = isFastTier ? THINKING_LEVELS.MINIMAL : THINKING_LEVELS.LOW;

    const response = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        temperature: options?.temperature ?? defaultTemperature,
        maxOutputTokens: options?.maxTokens ?? defaultMaxTokens,
        thinkingConfig: { thinkingLevel },
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
