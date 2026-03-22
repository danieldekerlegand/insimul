/**
 * Gemini Content Generation Provider
 *
 * Wraps direct Gemini generateContent calls behind IContentGenerationProvider.
 * Replaces scattered GoogleGenerativeAI instantiation in routes.
 */

import type {
  IContentGenerationProvider,
  ContentGenerationRequest,
  ContentGenerationResponse,
} from './types.js';
import { contentRegistry } from './registry.js';

class GeminiContentProvider implements IContentGenerationProvider {
  readonly name = 'gemini';

  async generate(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const { getGenerativeAI, GEMINI_MODELS } = await import('../../config/gemini.js');

    const modelMap: Record<string, string> = {
      fast: GEMINI_MODELS.FLASH,
      standard: GEMINI_MODELS.FLASH,
      pro: GEMINI_MODELS.PRO,
    };
    const modelName = modelMap[request.model ?? 'fast'] ?? GEMINI_MODELS.FLASH;

    const genAI = getGenerativeAI();
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
        ...(request.responseMimeType && { responseMimeType: request.responseMimeType }),
      },
    });

    const prompt = request.systemPrompt
      ? `${request.systemPrompt}\n\n${request.prompt}`
      : request.prompt;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { text, model: modelName, provider: this.name };
  }
}

contentRegistry.register('gemini', () => new GeminiContentProvider());
