/**
 * Unified AI Provider Interface
 *
 * Composes text generation (batch + streaming), TTS, STT, and image generation
 * behind a single provider abstraction. Services inject IAIProvider instead of
 * calling Gemini (or any other backend) directly.
 */

/* ------------------------------------------------------------------ */
/*  Shared request / response types                                    */
/* ------------------------------------------------------------------ */

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  tokensUsed: number;
  model: string;
  provider: string;
}

export interface LLMBatchRequest {
  prompts: string[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMBatchResponse {
  responses: LLMResponse[];
  totalTokensUsed: number;
  failedIndices: number[];
}

export interface StreamCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  languageCode?: string;
  characterPersonality?: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ConversationContext {
  systemPrompt: string;
  characterName?: string;
  worldContext?: string;
  characterGender?: string;
}

/* ------------------------------------------------------------------ */
/*  TTS / STT types                                                    */
/* ------------------------------------------------------------------ */

export interface TTSOptions {
  languageCode?: string;
  emotionalTone?: string;
  speed?: number;
  pitch?: number;
}

export interface STTOptions {
  languageCode?: string;
  /** When true, attempt automatic language detection */
  autoDetect?: boolean;
}

export interface STTResult {
  text: string;
  languageCode?: string;
  confidence?: number;
}

/* ------------------------------------------------------------------ */
/*  Image generation types                                             */
/* ------------------------------------------------------------------ */

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  style?: string;
  negativePrompt?: string;
}

/* ------------------------------------------------------------------ */
/*  Provider interfaces                                                */
/* ------------------------------------------------------------------ */

/** Text-to-speech provider */
export interface ITTSProvider {
  readonly name: string;
  synthesize(text: string, voice: string, options?: TTSOptions): Promise<Buffer>;
}

/** Speech-to-text provider */
export interface ISTTProvider {
  readonly name: string;
  transcribe(audio: Buffer, options?: STTOptions): Promise<STTResult>;
}

/**
 * Unified AI provider — the single interface that all services depend on.
 *
 * Not every backend supports every capability. Optional methods return
 * null / throw when the capability is unavailable, and callers should
 * handle graceful degradation the same way they already handle a missing
 * Gemini API key.
 */
export interface IAIProvider {
  readonly name: string;

  /* ---- Text generation (batch) ---- */
  generate(request: LLMRequest): Promise<LLMResponse>;
  generateBatch(request: LLMBatchRequest): Promise<LLMBatchResponse>;

  /* ---- Streaming text generation ---- */
  generateStream(
    prompt: string,
    context: ConversationContext,
    options?: StreamCompletionOptions,
  ): AsyncIterable<string>;

  /* ---- Cost estimation ---- */
  estimateCost(promptTokens: number, completionTokens: number): number;

  /* ---- TTS / STT (optional capabilities) ---- */
  tts: ITTSProvider | null;
  stt: ISTTProvider | null;

  /* ---- Image generation (optional) ---- */
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<Buffer | null>;
}
