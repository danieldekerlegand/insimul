/**
 * AI Service Provider System
 *
 * Unified provider interfaces and registry for TTS, STT, native audio,
 * content generation, and image generation.
 */

// Types
export type {
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
  GeneratedImageResult,
} from './types.js';

// Registry
export {
  getTTSProvider,
  getSTTProvider,
  getNativeAudioProvider,
  getContentProvider,
  getImageProvider,
  listAllProviders,
  ttsRegistry,
  sttRegistry,
  nativeAudioRegistry,
  contentRegistry,
  imageRegistry,
} from './registry.js';

// Register built-in Gemini providers (side-effect imports)
import './gemini-tts.js';
import './gemini-stt.js';
import './gemini-native-audio.js';
import './gemini-content.js';
import './gemini-image.js';

// Register local providers (side-effect imports)
import './whisper-stt.js';
