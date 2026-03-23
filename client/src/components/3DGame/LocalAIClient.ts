/**
 * LocalAIClient — Client-side abstraction for local AI via Electron IPC.
 *
 * Wraps `window.electronAPI` AI methods so game code can use local LLM
 * inference, TTS, and STT without knowing about IPC details.
 *
 * When not running in Electron or when AI is not loaded, `isAvailable()`
 * returns false and callers should fall back to server-side APIs.
 *
 * Provides both static methods (for one-off calls like NPC conversation
 * generation) and instance methods (for ConversationClient integration).
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface LocalAIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LocalAIStatus {
  loaded: boolean;
  modelName: string;
  gpuLayers: number;
  gpuType: string;
}

declare global {
  interface Window {
    electronAPI?: {
      readFile?: (path: string) => Promise<string>;
      aiAvailable?: boolean;
      aiGenerate?: (prompt: string, systemPrompt?: string, options?: LocalAIGenerateOptions) => Promise<string>;
      aiGenerateStream?: (
        prompt: string,
        systemPrompt?: string,
        options?: LocalAIGenerateOptions,
        onToken?: (token: string) => void,
      ) => Promise<string>;
      aiTTS?: (text: string, voice?: string, speed?: number) => Promise<ArrayBuffer | null>;
      aiSTT?: (audioBuffer: ArrayBuffer, languageHint?: string) => Promise<{ text: string }>;
      aiStatus?: () => Promise<LocalAIStatus>;
    };
  }
}

// ── Client ──────────────────────────────────────────────────────────────────

export class LocalAIClient {
  /**
   * Check whether local AI is available (running in Electron with AI loaded).
   */
  static isAvailable(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.electronAPI?.aiAvailable &&
      window.electronAPI?.aiGenerate
    );
  }

  private assertAvailable(): void {
    if (!LocalAIClient.isAvailable()) {
      throw new Error('Local AI is not available');
    }
  }

  // ── Static methods (for one-off usage) ──────────────────────────────────

  /**
   * Generate a full response from the local LLM.
   * Throws if not available — callers should check `isAvailable()` first.
   */
  static async generate(
    prompt: string,
    systemPrompt?: string,
    options?: LocalAIGenerateOptions,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Local AI is not available');
    }
    return window.electronAPI!.aiGenerate!(prompt, systemPrompt, options);
  }

  /**
   * Stream tokens from the local LLM.
   * Returns the full accumulated text. Calls `onToken` for each chunk.
   */
  static async generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: LocalAIGenerateOptions,
    onToken?: (token: string) => void,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Local AI is not available');
    }
    if (window.electronAPI!.aiGenerateStream) {
      return window.electronAPI!.aiGenerateStream(prompt, systemPrompt, options, onToken);
    }
    // Fall back to non-streaming generate
    const result = await window.electronAPI!.aiGenerate!(prompt, systemPrompt, options);
    onToken?.(result);
    return result;
  }

  /**
   * Query AI status (model name, GPU info).
   */
  static async getStatus(): Promise<LocalAIStatus | null> {
    if (typeof window === 'undefined' || !window.electronAPI?.aiStatus) return null;
    return window.electronAPI.aiStatus();
  }

  // ── Instance methods (for ConversationClient integration) ───────────────

  /**
   * Generate a complete text response (instance version).
   */
  async generate(prompt: string, systemPrompt?: string, options?: LocalAIGenerateOptions): Promise<string> {
    this.assertAvailable();
    return window.electronAPI!.aiGenerate!(prompt, systemPrompt, options);
  }

  /**
   * Stream tokens one by one via callback. Returns full accumulated text.
   */
  async generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: LocalAIGenerateOptions,
    onToken?: (token: string) => void,
  ): Promise<string> {
    this.assertAvailable();
    if (window.electronAPI!.aiGenerateStream) {
      return window.electronAPI!.aiGenerateStream(prompt, systemPrompt, options, onToken);
    }
    const result = await window.electronAPI!.aiGenerate!(prompt, systemPrompt, options);
    onToken?.(result);
    return result;
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
