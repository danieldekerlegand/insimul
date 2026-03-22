/**
 * Gemini STT Provider
 *
 * Wraps the existing speechToText service behind the IBatchSTTProvider interface.
 */

import type { IBatchSTTProvider, STTRequest, STTResponse } from './types.js';
import { sttRegistry } from './registry.js';

class GeminiBatchSTTProvider implements IBatchSTTProvider {
  readonly name = 'gemini';

  async transcribe(request: STTRequest): Promise<STTResponse> {
    const { speechToText } = await import('../tts-stt.js');
    const transcript = await speechToText(
      request.audioBuffer,
      request.mimeType ?? 'audio/wav',
      request.languageHint,
    );
    return { transcript };
  }
}

sttRegistry.register('gemini', () => new GeminiBatchSTTProvider());
