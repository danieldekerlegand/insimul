/**
 * Gemini/Flux/SD/DALL-E Image Providers
 *
 * Re-exports existing ImageGenerationManager providers behind IImageGenerationProvider.
 */

import type { IImageGenerationProvider, ImageGenerationRequest, ImageGenerationResponse } from './types.js';
import { imageRegistry } from './registry.js';
import type { GenerationProvider } from '@shared/schema';

/**
 * Adapter that wraps the existing ImageGenerationManager for a specific provider.
 */
class ImageProviderAdapter implements IImageGenerationProvider {
  constructor(readonly name: string, private providerKey: GenerationProvider) {}

  async isAvailable(): Promise<boolean> {
    const { imageGenerator } = await import('../image-generation.js');
    const available = await imageGenerator.getAvailableProviders();
    return available.includes(this.providerKey);
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const { imageGenerator } = await import('../image-generation.js');
    return imageGenerator.generateImage(this.providerKey, request);
  }
}

// Register all image providers
for (const [name, key] of [
  ['flux', 'flux'],
  ['stable-diffusion', 'stable-diffusion'],
  ['dalle', 'dalle'],
  ['gemini-imagen', 'gemini-imagen'],
] as const) {
  imageRegistry.register(name, () => new ImageProviderAdapter(name, key as GenerationProvider));
}
