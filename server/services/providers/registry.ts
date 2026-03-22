/**
 * Unified Provider Registry
 *
 * Central registry for all AI service providers (TTS, STT, native audio,
 * content generation, image generation). Each type has its own map and
 * env-var-based default.
 */

import type {
  IBatchTTSProvider,
  IBatchSTTProvider,
  INativeAudioProvider,
  IContentGenerationProvider,
  IImageGenerationProvider,
} from './types.js';

type Factory<T> = () => T;

// ── Generic registry helper ──────────────────────────────────────────

class TypedRegistry<T extends { readonly name: string }> {
  private factories = new Map<string, Factory<T>>();

  register(name: string, factory: Factory<T>): void {
    this.factories.set(name, factory);
  }

  get(name: string): T {
    const factory = this.factories.get(name);
    if (!factory) {
      const available = Array.from(this.factories.keys()).join(', ') || 'none';
      throw new Error(`Provider "${name}" not found. Available: ${available}`);
    }
    return factory();
  }

  getDefault(envVar: string, fallback: string): T {
    return this.get(process.env[envVar] || fallback);
  }

  list(): string[] {
    return Array.from(this.factories.keys());
  }

  clear(): void {
    this.factories.clear();
  }
}

// ── Registries ───────────────────────────────────────────────────────

export const ttsRegistry = new TypedRegistry<IBatchTTSProvider>();
export const sttRegistry = new TypedRegistry<IBatchSTTProvider>();
export const nativeAudioRegistry = new TypedRegistry<INativeAudioProvider>();
export const contentRegistry = new TypedRegistry<IContentGenerationProvider>();
export const imageRegistry = new TypedRegistry<IImageGenerationProvider>();

// ── Convenience getters ──────────────────────────────────────────────

export function getTTSProvider(name?: string): IBatchTTSProvider {
  return name ? ttsRegistry.get(name) : ttsRegistry.getDefault('BATCH_TTS_PROVIDER', 'gemini');
}

export function getSTTProvider(name?: string): IBatchSTTProvider {
  return name ? sttRegistry.get(name) : sttRegistry.getDefault('BATCH_STT_PROVIDER', 'gemini');
}

export function getNativeAudioProvider(name?: string): INativeAudioProvider {
  return name ? nativeAudioRegistry.get(name) : nativeAudioRegistry.getDefault('NATIVE_AUDIO_PROVIDER', 'gemini');
}

export function getContentProvider(name?: string): IContentGenerationProvider {
  return name ? contentRegistry.get(name) : contentRegistry.getDefault('CONTENT_PROVIDER', 'gemini');
}

export function getImageProvider(name?: string): IImageGenerationProvider {
  return name ? imageRegistry.get(name) : imageRegistry.getDefault('IMAGE_PROVIDER', 'flux');
}

export function listAllProviders(): Record<string, string[]> {
  return {
    tts: ttsRegistry.list(),
    stt: sttRegistry.list(),
    nativeAudio: nativeAudioRegistry.list(),
    content: contentRegistry.list(),
    image: imageRegistry.list(),
  };
}
