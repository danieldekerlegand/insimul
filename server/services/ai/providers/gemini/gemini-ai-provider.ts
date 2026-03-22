/**
 * Gemini AI Provider
 *
 * Wraps the existing Gemini integration (server/config/gemini.ts) behind the
 * unified IAIProvider interface. Zero regression — delegates to the same
 * singleton instances and preserves all existing fallback behaviour.
 */

import {
  getGenerativeAI,
  getGenAI,
  isGeminiConfigured,
  GEMINI_MODELS,
} from '../../../../config/gemini.js';
import { registerAIProvider } from '../../ai-provider-factory.js';
import type {
  IAIProvider,
  LLMRequest,
  LLMResponse,
  LLMBatchRequest,
  LLMBatchResponse,
  ConversationContext,
  StreamCompletionOptions,
  ImageGenerationOptions,
} from '../../ai-provider.js';
import { GeminiTTSProvider } from './gemini-tts-provider.js';
import { GeminiSTTProvider } from './gemini-stt-provider.js';

export class GeminiAIProvider implements IAIProvider {
  readonly name = 'gemini' as const;

  private model: string;
  private defaultTemperature: number;
  private maxTokens: number;

  readonly tts: GeminiTTSProvider | null;
  readonly stt: GeminiSTTProvider | null;

  constructor(model?: string) {
    this.model = model || GEMINI_MODELS.FLASH;
    this.defaultTemperature = 0.7;
    this.maxTokens = 2048;

    // TTS/STT are available when Gemini is configured
    this.tts = isGeminiConfigured() ? new GeminiTTSProvider() : null;
    this.stt = isGeminiConfigured() ? new GeminiSTTProvider() : null;
  }

  /* ---- Text generation (single) ---- */

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const genAI = getGenerativeAI();
    const model = genAI.getGenerativeModel({ model: this.model });

    const prompt = request.systemPrompt
      ? `${request.systemPrompt}\n\n${request.prompt}`
      : request.prompt;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: request.temperature ?? this.defaultTemperature,
        maxOutputTokens: request.maxTokens || this.maxTokens,
      },
    });

    const text = result.response.text();
    const tokensUsed = Math.ceil(text.length / 4); // rough estimate

    return { text, tokensUsed, model: this.model, provider: this.name };
  }

  /* ---- Text generation (batch) ---- */

  async generateBatch(request: LLMBatchRequest): Promise<LLMBatchResponse> {
    const responses: LLMResponse[] = [];
    const failedIndices: number[] = [];
    let totalTokensUsed = 0;

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
        }),
      );

      const results = await Promise.all(promises);
      for (const result of results) {
        if (result) {
          responses.push(result);
          totalTokensUsed += result.tokensUsed;
        }
      }

      if (i + chunkSize < request.prompts.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return { responses, totalTokensUsed, failedIndices };
  }

  /* ---- Streaming text generation ---- */

  async *generateStream(
    prompt: string,
    context: ConversationContext,
    options?: StreamCompletionOptions,
  ): AsyncIterable<string> {
    const genAI = getGenerativeAI();
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODELS.PRO,
      systemInstruction: context.systemPrompt,
    });

    const history = (options?.conversationHistory || []).map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
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

  /* ---- Cost estimation ---- */

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Gemini 2.5 Flash pricing (approx)
    return promptTokens * 0.00001 + completionTokens * 0.00004;
  }

  /* ---- Image generation ---- */

  async generateImage(
    prompt: string,
    _options?: ImageGenerationOptions,
  ): Promise<Buffer | null> {
    if (!isGeminiConfigured()) return null;

    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.PRO,
        contents: `You are an expert at creating detailed image generation prompts. Given this request: "${prompt}", create a highly detailed, specific image generation prompt. Return ONLY the enhanced prompt.`,
      });

      // Gemini Imagen not yet available via API — return null
      // The enhanced prompt is logged for debugging but not returned as an image
      if (response.text) {
        console.log('[GeminiAIProvider] Enhanced image prompt generated (Imagen not yet available)');
      }
      return null;
    } catch {
      return null;
    }
  }
}

// Self-register with the factory on module load
registerAIProvider('gemini', () => new GeminiAIProvider());
