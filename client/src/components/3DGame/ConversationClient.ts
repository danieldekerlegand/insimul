/**
 * ConversationClient
 *
 * Client-side wrapper that connects to the conversation streaming service
 * via SSE (Server-Sent Events) HTTP endpoint, which bridges to the gRPC
 * conversation service on the server.
 *
 * Provides streaming text, audio, and viseme (facial) data for NPC conversations.
 * Falls back gracefully when the service is unavailable.
 */

import type { AudioChunkOutput, FacialData } from '@shared/proto/conversation.ts';

// ── Types ───────────────────────────────────────────────────────────────────

export type ConversationState = 'idle' | 'connecting' | 'thinking' | 'speaking' | 'listening' | 'error';

export interface ConversationClientCallbacks {
  /** Partial text token — accumulate for typewriter effect */
  onTextChunk?: (text: string, isFinal: boolean) => void;
  /** Audio chunk ready for StreamingAudioPlayer */
  onAudioChunk?: (chunk: AudioChunkOutput) => void;
  /** Viseme data ready for LipSyncController */
  onFacialData?: (data: FacialData) => void;
  /** State change (thinking, speaking, etc.) */
  onStateChange?: (state: ConversationState) => void;
  /** Error occurred */
  onError?: (error: Error) => void;
  /** Metadata event — vocab hints, grammar feedback, quest assignments, etc. */
  onMetadata?: (type: string, content: string) => void;
  /** Full response complete */
  onComplete?: (fullText: string) => void;
}

export interface ConversationClientOptions {
  /** Base URL for API (default: '') */
  baseUrl?: string;
  /** Session ID — auto-generated if not provided */
  sessionId?: string;
}

// ── Class ───────────────────────────────────────────────────────────────────

export class ConversationClient {
  private sessionId: string;
  private characterId: string = '';
  private worldId: string = '';
  private baseUrl: string;
  private callbacks: ConversationClientCallbacks = {};
  private state: ConversationState = 'idle';
  private abortController: AbortController | null = null;
  private _available: boolean | null = null; // null = unknown

  constructor(options: ConversationClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.sessionId = options.sessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  setCallbacks(callbacks: ConversationClientCallbacks): void {
    this.callbacks = callbacks;
  }

  setCharacter(characterId: string, worldId: string): void {
    this.characterId = characterId;
    this.worldId = worldId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getState(): ConversationState {
    return this.state;
  }

  /**
   * Check if the conversation streaming service is available.
   * Caches the result for the session lifetime.
   */
  async isAvailable(): Promise<boolean> {
    if (this._available !== null) return this._available;
    try {
      const res = await fetch(`${this.baseUrl}/api/conversation/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      this._available = res.ok;
    } catch {
      this._available = false;
    }
    return this._available;
  }

  /**
   * Send a text message and receive streaming responses via SSE.
   * Returns the full accumulated response text.
   */
  async sendText(text: string, languageCode: string = 'en'): Promise<string> {
    if (!this.characterId || !this.worldId) {
      throw new Error('ConversationClient: character and world must be set before sending');
    }

    this.abort(); // cancel any in-flight request
    this.abortController = new AbortController();
    this.setState('thinking');

    try {
      const response = await fetch(`${this.baseUrl}/api/conversation/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          characterId: this.characterId,
          worldId: this.worldId,
          text,
          languageCode,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Conversation service returned ${response.status}`);
      }

      return await this.consumeSSEStream(response);
    } catch (err: any) {
      if (err.name === 'AbortError') return '';
      this.setState('error');
      this.callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Send recorded audio for STT + LLM + TTS pipeline.
   * Returns the full accumulated response text.
   */
  async sendAudio(audioBlob: Blob, languageCode: string = 'en'): Promise<string> {
    if (!this.characterId || !this.worldId) {
      throw new Error('ConversationClient: character and world must be set before sending');
    }

    this.abort();
    this.abortController = new AbortController();
    this.setState('thinking');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', this.sessionId);
      formData.append('characterId', this.characterId);
      formData.append('worldId', this.worldId);
      formData.append('languageCode', languageCode);

      const response = await fetch(`${this.baseUrl}/api/conversation/stream-audio`, {
        method: 'POST',
        body: formData,
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Conversation audio service returned ${response.status}`);
      }

      return await this.consumeSSEStream(response);
    } catch (err: any) {
      if (err.name === 'AbortError') return '';
      this.setState('error');
      this.callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /** Cancel any in-flight request */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.setState('idle');
  }

  /** End the session (cleanup) */
  async endSession(): Promise<void> {
    this.abort();
    try {
      await fetch(`${this.baseUrl}/api/conversation/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId }),
      });
    } catch {
      // Best-effort cleanup
    }
    this.setState('idle');
  }

  dispose(): void {
    this.abort();
  }

  // ── Internal ────────────────────────────────────────────────────────────

  private setState(state: ConversationState): void {
    if (this.state !== state) {
      this.state = state;
      this.callbacks.onStateChange?.(state);
    }
  }

  /**
   * Consume an SSE response stream, dispatching events to callbacks.
   * SSE format:
   *   data: {"type":"text","text":"Hello","isFinal":false}
   *   data: {"type":"audio","data":"<base64>","encoding":3,"sampleRate":24000,"durationMs":500}
   *   data: {"type":"facial","visemes":[...]}
   *   data: {"type":"meta","state":"speaking"}
   *   data: [DONE]
   */
  private async consumeSSEStream(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let hasAudio = false;
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep incomplete last line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            this.handleSSEEvent(parsed, fullText);

            if (parsed.type === 'text') {
              fullText += parsed.text;
              if (!hasAudio) this.setState('speaking');
            } else if (parsed.type === 'audio') {
              hasAudio = true;
              this.setState('speaking');
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    this.callbacks.onComplete?.(fullText);
    this.setState('idle');
    return fullText;
  }

  private handleSSEEvent(parsed: any, _accumulatedText: string): void {
    switch (parsed.type) {
      case 'text':
        this.callbacks.onTextChunk?.(parsed.text, parsed.isFinal ?? false);
        break;

      case 'audio': {
        if (parsed.data && this.callbacks.onAudioChunk) {
          // Decode base64 audio data
          const binaryStr = atob(parsed.data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          this.callbacks.onAudioChunk({
            data: bytes,
            encoding: parsed.encoding || 3, // default MP3
            sampleRate: parsed.sampleRate || 24000,
            durationMs: parsed.durationMs || 0,
          });
        }
        break;
      }

      case 'facial':
        if (parsed.visemes && this.callbacks.onFacialData) {
          this.callbacks.onFacialData({ visemes: parsed.visemes });
        }
        break;

      case 'transcript':
        // STT transcript of player audio — not used directly by callbacks
        // but could be useful for display
        break;

      case 'vocab_hints':
      case 'grammar_feedback':
      case 'quest_assign':
      case 'eval':
        // Metadata events — routed separately from spoken text
        this.callbacks.onMetadata?.(parsed.type, parsed.content ?? '');
        break;

      case 'error':
        this.callbacks.onError?.(new Error(parsed.message || 'Unknown streaming error'));
        break;
    }
  }
}
