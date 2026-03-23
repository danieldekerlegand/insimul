/**
 * LocalAIClient — Client-side abstraction for local AI via Electron IPC.
 *
 * Wraps `window.electronAPI.aiGenerate` / `window.electronAPI.aiGenerateStream`
 * so game code can use local LLM inference without knowing about IPC details.
 *
 * When not running in Electron or when AI is not loaded, `isAvailable()` returns
 * false and callers should fall back to server-side APIs.
 */

export interface LocalAIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

interface ElectronAIAPI {
  aiAvailable?: boolean;
  aiGenerate?: (prompt: string, systemPrompt?: string, options?: LocalAIGenerateOptions) => Promise<string>;
  aiGenerateStream?: (
    prompt: string,
    systemPrompt?: string,
    options?: LocalAIGenerateOptions,
    onToken?: (token: string) => void,
  ) => Promise<string>;
  aiStatus?: () => Promise<{ loaded: boolean; modelName: string; gpuLayers: number; gpuType: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAIAPI & Record<string, unknown>;
  }
}

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
  static async getStatus(): Promise<{ loaded: boolean; modelName: string; gpuLayers: number; gpuType: string } | null> {
    if (typeof window === 'undefined' || !window.electronAPI?.aiStatus) return null;
    return window.electronAPI.aiStatus();
  }
}
