/**
 * LocalAIClient
 *
 * Renderer-side abstraction over Electron IPC AI capabilities.
 * Hides window.electronAPI details so game code can call generate(),
 * generateStream(), textToSpeech(), and speechToText() without
 * knowing whether it's running in Electron or not.
 *
 * All methods throw if AI is not available — callers should check
 * isAvailable() first.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface LocalAIGenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LocalAIStatus {
  loaded: boolean;
  modelName: string;
  gpuLayers: number;
  gpuType: string;
}

interface ElectronAIAPI {
  aiAvailable: boolean;
  aiGenerate(prompt: string, options?: { systemPrompt?: string; temperature?: number; maxTokens?: number }): Promise<string>;
  aiGenerateStream(
    prompt: string,
    options: { systemPrompt?: string; temperature?: number; maxTokens?: number },
    onChunk: (token: string) => void,
  ): Promise<string>;
  aiTTS(text: string, voice?: string, speed?: number): Promise<ArrayBuffer>;
  aiSTT(audioBuffer: ArrayBuffer, languageHint?: string): Promise<{ text: string; language: string }>;
  aiStatus(): Promise<LocalAIStatus>;
}

function getElectronAI(): ElectronAIAPI | null {
  if (typeof window === 'undefined') return null;
  const api = (window as any).electronAPI;
  if (!api || !api.aiAvailable) return null;
  return api as ElectronAIAPI;
}

// ── Client ──────────────────────────────────────────────────────────────────

export class LocalAIClient {
  /**
   * Returns true if running in Electron with AI models loaded.
   */
  static isAvailable(): boolean {
    return getElectronAI() !== null;
  }

  private getAPI(): ElectronAIAPI {
    const api = getElectronAI();
    if (!api) {
      throw new Error('LocalAIClient: AI is not available. Check isAvailable() before calling.');
    }
    return api;
  }

  /**
   * Generate a complete text response (accumulates tokens from stream).
   */
  async generate(prompt: string, options: LocalAIGenerateOptions = {}): Promise<string> {
    const api = this.getAPI();
    return api.aiGenerate(prompt, {
      systemPrompt: options.systemPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });
  }

  /**
   * Stream tokens one at a time. Calls onToken for each token, returns full text.
   */
  async generateStream(
    prompt: string,
    options: LocalAIGenerateOptions = {},
    onToken?: (token: string) => void,
  ): Promise<string> {
    const api = this.getAPI();
    return api.aiGenerateStream(
      prompt,
      {
        systemPrompt: options.systemPrompt,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      },
      onToken ?? (() => {}),
    );
  }

  /**
   * Convert text to speech audio. Returns a Blob with WAV audio data.
   */
  async textToSpeech(text: string, voice?: string, speed?: number): Promise<Blob> {
    const api = this.getAPI();
    const buffer = await api.aiTTS(text, voice, speed);
    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Convert audio blob to text via Whisper STT.
   */
  async speechToText(audioBlob: Blob, languageHint?: string): Promise<{ text: string; language: string }> {
    const api = this.getAPI();
    const buffer = await audioBlob.arrayBuffer();
    return api.aiSTT(buffer, languageHint);
  }

  /**
   * Get AI service status (model name, GPU info, etc.).
   */
  async getStatus(): Promise<LocalAIStatus> {
    const api = this.getAPI();
    return api.aiStatus();
  }
}
