/**
 * Gemini TTS Batch Provider
 *
 * Uses the streaming Gemini TTS provider and concatenates PCM chunks into a
 * single audio buffer for the /api/tts endpoint.
 */

import type { IBatchTTSProvider, TTSRequest, TTSResponse } from './types.js';
import { ttsRegistry } from './registry.js';
import { getTTSProvider as getStreamingTTSProvider } from '../conversation/tts/tts-provider.js';
import { assignVoiceProfile } from '../conversation/tts/tts-provider.js';

class GeminiBatchTTSProvider implements IBatchTTSProvider {
  readonly name = 'gemini';

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const streamingProvider = getStreamingTTSProvider();
    const voice = assignVoiceProfile({ gender: request.gender ?? 'neutral' });
    const chunks: Buffer[] = [];

    for await (const chunk of streamingProvider.synthesize(
      request.text,
      voice,
      { languageCode: request.targetLanguage },
    )) {
      chunks.push(Buffer.from(chunk.data));
    }

    const audioBuffer = Buffer.concat(chunks);
    // Streaming provider returns PCM; report encoding accordingly
    return { audioBuffer, encoding: 'PCM' };
  }

  getAvailableVoices() {
    return [
      { voice: 'Kore', language: 'en', gender: 'female' },
      { voice: 'Charon', language: 'en', gender: 'male' },
      { voice: 'Aoede', language: 'en', gender: 'female' },
      { voice: 'Puck', language: 'en', gender: 'male' },
    ];
  }
}

ttsRegistry.register('gemini', () => new GeminiBatchTTSProvider());
