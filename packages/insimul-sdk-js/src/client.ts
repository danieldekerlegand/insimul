/**
 * InsimulClient — Main SDK entry point for connecting to the Insimul
 * conversation service. Uses HTTP/SSE transport for broad browser compatibility.
 */

import type {
  InsimulClientOptions,
  ConversationOptions,
  InsimulEventCallbacks,
  TextChunk,
  AudioChunkOutput,
  FacialData,
  ActionTrigger,
  SSEEvent,
  HealthCheckResponse,
} from './types.js';
import { AudioEncoding, ConversationState } from './types.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function generateSessionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'sdk_';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ── InsimulClient ──────────────────────────────────────────────────────────

export class InsimulClient {
  private serverUrl: string;
  private apiKey: string | undefined;
  private worldId: string;
  private languageCode: string;

  private sessionId: string | null = null;
  private callbacks: InsimulEventCallbacks = {};
  private abortController: AbortController | null = null;
  private state: ConversationState = ConversationState.CONVERSATION_STATE_UNSPECIFIED;

  constructor(options: InsimulClientOptions) {
    // Strip trailing slash
    this.serverUrl = options.serverUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.worldId = options.worldId;
    this.languageCode = options.languageCode ?? 'en';
  }

  // ── Event Callbacks ────────────────────────────────────────────────────

  /** Register event callbacks for conversation events */
  public on(callbacks: InsimulEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /** Get the current session ID (null if no active conversation) */
  public getSessionId(): string | null {
    return this.sessionId;
  }

  /** Get the current conversation state */
  public getState(): ConversationState {
    return this.state;
  }

  // ── Conversation Lifecycle ─────────────────────────────────────────────

  /**
   * Start a new conversation or resume an existing one.
   * Returns the session ID for this conversation.
   */
  public startConversation(options: ConversationOptions): string {
    // End any existing conversation
    if (this.sessionId && this.abortController) {
      this.abortController.abort();
    }

    this.sessionId = options.sessionId ?? generateSessionId();
    this.setState(ConversationState.STARTED);
    return this.sessionId;
  }

  /**
   * Send a text message to the NPC. Responses stream back via callbacks.
   */
  public async sendText(
    text: string,
    characterId: string,
    options?: { languageCode?: string },
  ): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active conversation. Call startConversation() first.');
    }

    this.setState(ConversationState.ACTIVE);

    // Abort any in-flight request
    this.abortController?.abort();
    this.abortController = new AbortController();

    const body = {
      sessionId: this.sessionId,
      characterId,
      worldId: this.worldId,
      text,
      languageCode: options?.languageCode ?? this.languageCode,
    };

    try {
      const response = await fetch(`${this.serverUrl}/api/conversation/stream`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      await this.consumeSSEStream(response);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Intentional abort
      }
      const error = err instanceof Error ? err : new Error(String(err));
      this.callbacks.onError?.(error);
    }
  }

  /**
   * Send an audio chunk (recorded speech) to the NPC.
   * The server transcribes it via STT, then streams the NPC response back.
   */
  public async sendAudio(
    audioData: Blob,
    characterId: string,
    options?: { languageCode?: string },
  ): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active conversation. Call startConversation() first.');
    }

    this.setState(ConversationState.ACTIVE);

    this.abortController?.abort();
    this.abortController = new AbortController();

    const formData = new FormData();
    formData.append('audio', audioData, 'recording.webm');
    formData.append('sessionId', this.sessionId);
    formData.append('characterId', characterId);
    formData.append('worldId', this.worldId);
    formData.append('languageCode', options?.languageCode ?? this.languageCode);

    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.serverUrl}/api/conversation/stream-audio`, {
        method: 'POST',
        headers,
        body: formData,
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      await this.consumeSSEStream(response);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      this.callbacks.onError?.(error);
    }
  }

  /**
   * End the current conversation and clean up.
   */
  public async endConversation(): Promise<void> {
    if (!this.sessionId) return;

    this.abortController?.abort();
    this.abortController = null;

    try {
      await fetch(`${this.serverUrl}/api/conversation/end`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({ sessionId: this.sessionId }),
      });
    } catch {
      // Best-effort cleanup
    }

    this.setState(ConversationState.ENDED);
    this.sessionId = null;
  }

  // ── Health Check ───────────────────────────────────────────────────────

  /** Check if the conversation service is available */
  public async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${this.serverUrl}/api/conversation/health`, {
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json() as Promise<HealthCheckResponse>;
  }

  // ── Internal ───────────────────────────────────────────────────────────

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private setState(state: ConversationState): void {
    if (this.state !== state) {
      this.state = state;
      this.callbacks.onStateChange?.(state);
    }
  }

  /**
   * Consume an SSE response stream and dispatch events to callbacks.
   */
  private async consumeSSEStream(response: Response): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6); // Remove "data: " prefix

          if (data === '[DONE]') {
            return;
          }

          try {
            const event = JSON.parse(data) as SSEEvent;
            this.dispatchEvent(event);
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private dispatchEvent(event: SSEEvent): void {
    switch (event.type) {
      case 'text': {
        const chunk: TextChunk = {
          text: event.text,
          isFinal: event.isFinal,
        };
        this.callbacks.onTextChunk?.(chunk);
        break;
      }
      case 'audio': {
        const audioChunk: AudioChunkOutput = {
          data: base64ToUint8Array(event.data),
          encoding: event.encoding ?? AudioEncoding.MP3,
          sampleRate: event.sampleRate,
          durationMs: event.durationMs,
        };
        this.callbacks.onAudioChunk?.(audioChunk);
        break;
      }
      case 'facial': {
        const facialData: FacialData = { visemes: event.visemes };
        this.callbacks.onVisemeData?.(facialData);
        break;
      }
      case 'transcript': {
        // Transcript events are informational (STT result)
        // Dispatch as a text chunk with isFinal=true for simplicity
        this.callbacks.onTextChunk?.({
          text: event.text,
          isFinal: true,
        });
        break;
      }
      case 'error': {
        this.callbacks.onError?.(new Error(event.message));
        break;
      }
    }
  }
}
