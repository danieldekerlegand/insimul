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

declare global {
  interface Window {
    electronAPI?: {
      readFile?: (path: string) => Promise<string>;
      aiAvailable?: boolean;
      aiGenerate?: (prompt: string, options?: LocalAIGenerateOptions) => Promise<string>;
      aiGenerateStream?: (
        prompt: string,
        options: LocalAIGenerateOptions | undefined,
        onChunk: (token: string) => void,
      ) => Promise<string>;
      aiTTS?: (text: string, voice?: string, speed?: number) => Promise<ArrayBuffer | null>;
      aiSTT?: (audioBuffer: ArrayBuffer, languageHint?: string) => Promise<{ text: string }>;
      aiStatus?: () => Promise<LocalAIStatus>;
    };
  }
}

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

// ── Client ──────────────────────────────────────────────────────────────────

export class LocalAIClient {
  /**
   * Returns true if running in Electron with AI models loaded.
   */
  static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return window.electronAPI?.aiAvailable === true;
  }

  private assertAvailable(): void {
    if (!LocalAIClient.isAvailable()) {
      throw new Error('LocalAIClient: AI is not available. Check isAvailable() before calling.');
    }
  }

  /**
   * Generate a complete text response.
   */
  async generate(prompt: string, systemPrompt?: string, options?: Omit<LocalAIGenerateOptions, 'systemPrompt'>): Promise<string> {
    this.assertAvailable();
    return window.electronAPI!.aiGenerate!(prompt, { ...options, systemPrompt });
  }

  /**
   * Stream tokens one by one via callback. Returns full accumulated text.
   */
  async generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: Omit<LocalAIGenerateOptions, 'systemPrompt'>,
    onToken?: (token: string) => void,
  ): Promise<string> {
    this.assertAvailable();
    return window.electronAPI!.aiGenerateStream!(
      prompt,
      { ...options, systemPrompt },
      onToken ?? (() => {}),
    );
  }

  /**
   * Convert text to speech audio. Returns ArrayBuffer or null if TTS unavailable.
   */
  async textToSpeech(text: string, voice?: string, speed?: number): Promise<ArrayBuffer | null> {
    this.assertAvailable();
    if (!window.electronAPI!.aiTTS) return null;
    return window.electronAPI!.aiTTS(text, voice, speed);
  }

  /**
   * Convert audio blob to text via local Whisper STT.
   */
  async speechToText(audioBlob: Blob, languageHint?: string): Promise<{ text: string }> {
    this.assertAvailable();
    if (!window.electronAPI!.aiSTT) return { text: '' };
    const buffer = await audioBlob.arrayBuffer();
    return window.electronAPI!.aiSTT(buffer, languageHint);
  }

  /**
   * Get AI service status (model name, GPU info, etc.).
   */
  async getStatus(): Promise<LocalAIStatus> {
    this.assertAvailable();
    if (!window.electronAPI!.aiStatus) {
      throw new Error('LocalAIClient: aiStatus not available');
    }
    return window.electronAPI!.aiStatus();
  }
}
