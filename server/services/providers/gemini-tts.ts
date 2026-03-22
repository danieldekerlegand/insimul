/**
 * Gemini/Google Cloud TTS Provider
 *
 * Wraps the existing textToSpeech service behind the IBatchTTSProvider interface.
 */

import type { IBatchTTSProvider, TTSRequest, TTSResponse } from './types.js';
import { ttsRegistry } from './registry.js';

class GeminiBatchTTSProvider implements IBatchTTSProvider {
  readonly name = 'gemini';

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const { textToSpeech } = await import('../tts-stt.js');
    const encoding = request.encoding ?? 'MP3';
    const audioBuffer = await textToSpeech(
      request.text,
      request.voice ?? 'Kore',
      request.gender ?? 'neutral',
      encoding,
      request.emotionalTone,
      request.targetLanguage,
    );
    return { audioBuffer, encoding };
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
