/**
 * ChatProvider interface — implemented by server, browser, and local providers.
 *
 * Each provider handles text/audio input and streams responses via callbacks.
 * The InsimulClient orchestrator selects which provider to use based on config.
 */

import type { AudioChunkOutput, FacialData, ActionTrigger } from '../../types.js';

export interface ChatProviderCallbacks {
  onTextChunk?: (text: string, isFinal: boolean) => void;
  onAudioChunk?: (chunk: AudioChunkOutput) => void;
  onFacialData?: (data: FacialData) => void;
  onActionTrigger?: (action: ActionTrigger) => void;
  onMetadata?: (type: string, content: string) => void;
  onComplete?: (fullText: string) => void;
  onStateChange?: (state: string) => void;
  onError?: (error: Error) => void;
}

export interface ChatProvider {
  /** Provider identifier */
  readonly type: 'server' | 'browser' | 'local';

  /** Initialize resources (model download, WS connection, etc.). Called lazily on first use. */
  initialize(): Promise<void>;

  /** Check if this provider can work in the current environment */
  isSupported(): boolean;

  /** Check if the provider is initialized and ready */
  isReady(): boolean;

  /** Register event callbacks */
  setCallbacks(callbacks: ChatProviderCallbacks): void;

  /** Set the character and world context */
  setCharacter(characterId: string, worldId: string, gender?: string): void;

  /** Set or update the system prompt */
  setSystemPrompt(prompt: string): void;

  /** Send text, receive streaming responses via callbacks. Returns full response text. */
  sendText(text: string, languageCode?: string): Promise<string>;

  /** Send audio for STT+LLM pipeline (server path). Returns full response text. */
  sendAudio(audioBlob: Blob, languageCode?: string): Promise<string>;

  /** Cancel in-flight request */
  abort(): void;

  /** End session / cleanup resources */
  dispose(): Promise<void>;
}
