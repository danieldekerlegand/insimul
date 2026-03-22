/**
 * Provider interfaces for AI services (TTS, STT, native audio, content generation, image generation).
 *
 * These are request/response (batch) interfaces used by HTTP routes.
 * For streaming conversation providers, see ../conversation/providers/ and ../conversation/tts/.
 */

// ── TTS Provider ─────────────────────────────────────────────────────

export interface TTSRequest {
  text: string;
  voice?: string;
  gender?: string;
  encoding?: 'MP3' | 'WAV';
  emotionalTone?: string;
  targetLanguage?: string;
}

export interface TTSResponse {
  audioBuffer: Buffer;
  encoding: 'MP3' | 'WAV';
}

export interface IBatchTTSProvider {
  readonly name: string;
  synthesize(request: TTSRequest): Promise<TTSResponse>;
  getAvailableVoices(): Array<{ voice: string; language: string; gender: string }>;
}

// ── STT Provider ─────────────────────────────────────────────────────

export interface STTRequest {
  audioBuffer: Buffer;
  mimeType?: string;
  languageHint?: string;
}

export interface STTResponse {
  transcript: string;
}

export interface IBatchSTTProvider {
  readonly name: string;
  transcribe(request: STTRequest): Promise<STTResponse>;
}

// ── Native Audio Provider ────────────────────────────────────────────

export interface NativeAudioRequest {
  audioData?: string;
  mimeType?: string;
  textMessage?: string;
  systemPrompt: string;
  history: Array<{ role: string; parts: Array<{ text: string }> }>;
  voice?: string;
  temperature?: number;
  maxTokens?: number;
  emotionalTone?: string;
  returnAudio?: boolean;
}

export interface NativeAudioResponse {
  text: string;
  audioData: string | null;
  audioMimeType: string;
  audioFailed?: boolean;
}

export interface INativeAudioProvider {
  readonly name: string;
  chat(request: NativeAudioRequest): Promise<NativeAudioResponse>;
}

// ── Content Generation Provider ──────────────────────────────────────

export interface ContentGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string;
  model?: 'fast' | 'standard' | 'pro';
}

export interface ContentGenerationResponse {
  text: string;
  model: string;
  provider: string;
}

export interface IContentGenerationProvider {
  readonly name: string;
  generate(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;
}

// ── Image Generation Provider ────────────────────────────────────────

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: string;
  quality?: 'standard' | 'high' | 'ultra';
  numberOfImages?: number;
  seed?: number;
  guidanceScale?: number;
  steps?: number;
}

export interface GeneratedImageResult {
  data: Buffer;
  mimeType: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface ImageGenerationResponse {
  success: boolean;
  images?: GeneratedImageResult[];
  error?: string;
  metadata?: Record<string, any>;
}

export interface IImageGenerationProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
}
