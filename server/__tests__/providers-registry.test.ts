/**
 * Provider Registry and Interface Tests
 *
 * Tests for the unified provider registry, type interfaces,
 * and mock provider implementations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ttsRegistry,
  sttRegistry,
  nativeAudioRegistry,
  contentRegistry,
  imageRegistry,
  getTTSProvider,
  getSTTProvider,
  getNativeAudioProvider,
  getContentProvider,
  getImageProvider,
  listAllProviders,
} from '../services/providers/registry.js';
import type {
  IBatchTTSProvider,
  IBatchSTTProvider,
  INativeAudioProvider,
  IContentGenerationProvider,
  IImageGenerationProvider,
  TTSRequest,
  TTSResponse,
  STTRequest,
  STTResponse,
  NativeAudioRequest,
  NativeAudioResponse,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from '../services/providers/types.js';

// ── Mock Providers ───────────────────────────────────────────────────

class MockTTSProvider implements IBatchTTSProvider {
  readonly name = 'mock-tts';
  async synthesize(req: TTSRequest): Promise<TTSResponse> {
    return { audioBuffer: Buffer.from(req.text), encoding: req.encoding ?? 'MP3' };
  }
  getAvailableVoices() {
    return [{ voice: 'TestVoice', language: 'en', gender: 'neutral' }];
  }
}

class MockSTTProvider implements IBatchSTTProvider {
  readonly name = 'mock-stt';
  async transcribe(req: STTRequest): Promise<STTResponse> {
    return { transcript: `transcribed:${req.audioBuffer.length}bytes` };
  }
}

class MockNativeAudioProvider implements INativeAudioProvider {
  readonly name = 'mock-native';
  async chat(req: NativeAudioRequest): Promise<NativeAudioResponse> {
    return {
      text: `response to: ${req.textMessage || 'audio'}`,
      audioData: req.returnAudio ? 'base64audio' : null,
      audioMimeType: 'audio/wav',
    };
  }
}

class MockContentProvider implements IContentGenerationProvider {
  readonly name = 'mock-content';
  async generate(req: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    return { text: `generated:${req.prompt.substring(0, 20)}`, model: 'mock', provider: this.name };
  }
}

class MockImageProvider implements IImageGenerationProvider {
  readonly name = 'mock-image';
  async isAvailable() { return true; }
  async generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return {
      success: true,
      images: [{ data: Buffer.from('fake-image'), mimeType: 'image/png' }],
    };
  }
}

// ── Registry Tests ───────────────────────────────────────────────────

describe('Provider Registry', () => {
  beforeEach(() => {
    ttsRegistry.clear();
    sttRegistry.clear();
    nativeAudioRegistry.clear();
    contentRegistry.clear();
    imageRegistry.clear();
  });

  describe('TTS Registry', () => {
    it('registers and retrieves a TTS provider', () => {
      ttsRegistry.register('mock', () => new MockTTSProvider());
      const provider = getTTSProvider('mock');
      expect(provider.name).toBe('mock-tts');
    });

    it('throws when TTS provider not found', () => {
      expect(() => getTTSProvider('nonexistent')).toThrow('Provider "nonexistent" not found');
    });

    it('uses env var default for TTS', () => {
      const orig = process.env.BATCH_TTS_PROVIDER;
      process.env.BATCH_TTS_PROVIDER = 'mock';
      ttsRegistry.register('mock', () => new MockTTSProvider());
      const provider = getTTSProvider();
      expect(provider.name).toBe('mock-tts');
      if (orig !== undefined) process.env.BATCH_TTS_PROVIDER = orig;
      else delete process.env.BATCH_TTS_PROVIDER;
    });
  });

  describe('STT Registry', () => {
    it('registers and retrieves an STT provider', () => {
      sttRegistry.register('mock', () => new MockSTTProvider());
      const provider = getSTTProvider('mock');
      expect(provider.name).toBe('mock-stt');
    });

    it('throws when STT provider not found', () => {
      expect(() => getSTTProvider('nonexistent')).toThrow('Provider "nonexistent" not found');
    });
  });

  describe('Native Audio Registry', () => {
    it('registers and retrieves a native audio provider', () => {
      nativeAudioRegistry.register('mock', () => new MockNativeAudioProvider());
      const provider = getNativeAudioProvider('mock');
      expect(provider.name).toBe('mock-native');
    });

    it('throws when native audio provider not found', () => {
      expect(() => getNativeAudioProvider('nonexistent')).toThrow('Provider "nonexistent" not found');
    });
  });

  describe('Content Registry', () => {
    it('registers and retrieves a content provider', () => {
      contentRegistry.register('mock', () => new MockContentProvider());
      const provider = getContentProvider('mock');
      expect(provider.name).toBe('mock-content');
    });

    it('throws when content provider not found', () => {
      expect(() => getContentProvider('nonexistent')).toThrow('Provider "nonexistent" not found');
    });
  });

  describe('Image Registry', () => {
    it('registers and retrieves an image provider', () => {
      imageRegistry.register('mock', () => new MockImageProvider());
      const provider = getImageProvider('mock');
      expect(provider.name).toBe('mock-image');
    });

    it('throws when image provider not found', () => {
      expect(() => getImageProvider('nonexistent')).toThrow('Provider "nonexistent" not found');
    });
  });

  describe('listAllProviders', () => {
    it('returns all registered provider names by type', () => {
      ttsRegistry.register('a', () => new MockTTSProvider());
      sttRegistry.register('b', () => new MockSTTProvider());
      contentRegistry.register('c', () => new MockContentProvider());

      const all = listAllProviders();
      expect(all.tts).toContain('a');
      expect(all.stt).toContain('b');
      expect(all.content).toContain('c');
      expect(all.nativeAudio).toEqual([]);
      expect(all.image).toEqual([]);
    });
  });

  describe('clear', () => {
    it('clears all providers from a registry', () => {
      ttsRegistry.register('a', () => new MockTTSProvider());
      ttsRegistry.register('b', () => new MockTTSProvider());
      expect(ttsRegistry.list()).toHaveLength(2);
      ttsRegistry.clear();
      expect(ttsRegistry.list()).toHaveLength(0);
    });
  });
});

// ── Mock Provider Behavior Tests ─────────────────────────────────────

describe('Mock Provider Behavior', () => {
  it('TTS provider synthesizes text to buffer', async () => {
    const provider = new MockTTSProvider();
    const result = await provider.synthesize({ text: 'hello', encoding: 'WAV' });
    expect(result.audioBuffer).toBeInstanceOf(Buffer);
    expect(result.encoding).toBe('WAV');
  });

  it('STT provider transcribes audio', async () => {
    const provider = new MockSTTProvider();
    const result = await provider.transcribe({ audioBuffer: Buffer.from('audio'), mimeType: 'audio/wav' });
    expect(result.transcript).toContain('5bytes');
  });

  it('Native audio provider handles text input', async () => {
    const provider = new MockNativeAudioProvider();
    const result = await provider.chat({
      textMessage: 'hello',
      systemPrompt: 'You are helpful',
      history: [],
      returnAudio: true,
    });
    expect(result.text).toContain('hello');
    expect(result.audioData).toBe('base64audio');
  });

  it('Native audio provider handles audio input', async () => {
    const provider = new MockNativeAudioProvider();
    const result = await provider.chat({
      audioData: 'base64data',
      systemPrompt: 'You are helpful',
      history: [],
      returnAudio: false,
    });
    expect(result.text).toContain('audio');
    expect(result.audioData).toBeNull();
  });

  it('Content provider generates text', async () => {
    const provider = new MockContentProvider();
    const result = await provider.generate({ prompt: 'Write something creative' });
    expect(result.text).toContain('generated:');
    expect(result.provider).toBe('mock-content');
  });

  it('Image provider generates images', async () => {
    const provider = new MockImageProvider();
    expect(await provider.isAvailable()).toBe(true);
    const result = await provider.generateImage({ prompt: 'A cat' });
    expect(result.success).toBe(true);
    expect(result.images).toHaveLength(1);
    expect(result.images![0].mimeType).toBe('image/png');
  });

  it('TTS provider returns available voices', () => {
    const provider = new MockTTSProvider();
    const voices = provider.getAvailableVoices();
    expect(voices).toHaveLength(1);
    expect(voices[0].voice).toBe('TestVoice');
  });
});

// ── Provider Registration via Index (side-effect imports) ────────────

describe('Built-in Gemini Providers Registration', () => {
  it('registers gemini TTS provider via index import', async () => {
    // Clear first, then import index which registers built-in providers
    ttsRegistry.clear();
    sttRegistry.clear();
    nativeAudioRegistry.clear();
    contentRegistry.clear();
    imageRegistry.clear();

    await import('../services/providers/index.js');

    // After importing index, the built-in providers should be registered
    expect(ttsRegistry.list()).toContain('gemini');
    expect(sttRegistry.list()).toContain('gemini');
    expect(nativeAudioRegistry.list()).toContain('gemini');
    expect(contentRegistry.list()).toContain('gemini');
    expect(imageRegistry.list()).toContain('flux');
    expect(imageRegistry.list()).toContain('dalle');
    expect(imageRegistry.list()).toContain('stable-diffusion');
    expect(imageRegistry.list()).toContain('gemini-imagen');
  });
});
