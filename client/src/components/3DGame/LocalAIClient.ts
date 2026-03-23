/**
 * LocalAIClient
 *
 * Renderer-side abstraction over Electron IPC AI calls.
 * When running in an Electron export with local AI enabled,
 * window.electronAPI exposes AI methods. This client wraps them
 * so game code doesn't need to know about IPC details.
 *
 * All methods throw if local AI is not available — callers should
 * check isAvailable() first.
 */

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
      aiStatus?: () => Promise<{ loaded: boolean; modelName: string; gpuLayers: number; gpuType: string }>;
    };
  }
}

export interface LocalAIGenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export class LocalAIClient {
  /**
   * Check if local AI is available (running in Electron with loaded model).
   */
  static isAvailable(): boolean {
    return window.electronAPI?.aiAvailable === true;
  }

  /**
   * Generate a full completion (accumulates all tokens).
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
   * Convert text to speech audio. Returns ArrayBuffer (WAV/MP3) or null if TTS unavailable.
   */
  async textToSpeech(text: string, voice?: string): Promise<ArrayBuffer | null> {
    this.assertAvailable();
    if (!window.electronAPI!.aiTTS) return null;
    return window.electronAPI!.aiTTS(text, voice);
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

  private assertAvailable(): void {
    if (!LocalAIClient.isAvailable()) {
      throw new Error('LocalAIClient: local AI is not available');
    }
  }
}
