/**
 * Gemini Native Audio Provider
 *
 * Wraps the existing nativeAudioChat/nativeTextToAudioChat behind INativeAudioProvider.
 */

import type { INativeAudioProvider, NativeAudioRequest, NativeAudioResponse } from './types.js';
import { nativeAudioRegistry } from './registry.js';

class GeminiNativeAudioProvider implements INativeAudioProvider {
  readonly name = 'gemini';

  async chat(request: NativeAudioRequest): Promise<NativeAudioResponse> {
    const { nativeAudioChat, nativeTextToAudioChat } = await import('../gemini-native-audio.js');

    if (request.audioData) {
      return nativeAudioChat({
        audioData: request.audioData,
        mimeType: request.mimeType ?? 'audio/webm',
        systemPrompt: request.systemPrompt,
        history: request.history,
        voice: request.voice,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        emotionalTone: request.emotionalTone,
        returnAudio: request.returnAudio,
      });
    }

    return nativeTextToAudioChat(
      request.textMessage!,
      request.systemPrompt,
      request.history,
      request.voice,
      request.temperature,
      request.maxTokens,
      request.emotionalTone,
    );
  }
}

nativeAudioRegistry.register('gemini', () => new GeminiNativeAudioProvider());
