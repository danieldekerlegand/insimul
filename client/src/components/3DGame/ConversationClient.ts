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
import type { DataSource } from './DataSource';
import type { LocalAIClient } from './LocalAIClient';

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
  /** Optional local AI client for offline Electron exports */
  localAI?: LocalAIClient;
  /** System prompt builder for local AI — receives characterId/worldId, returns prompt */
  systemPromptBuilder?: (characterId: string, worldId: string) => string;
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
  private dataSource: DataSource | null = null;
  private localAI: LocalAIClient | null = null;
  private systemPromptBuilder: ((characterId: string, worldId: string) => string) | null = null;
  private _aborted = false;

  constructor(options: ConversationClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.sessionId = options.sessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.localAI = options.localAI ?? null;
    this.systemPromptBuilder = options.systemPromptBuilder ?? null;
  }

  setLocalAI(localAI: LocalAIClient): void {
    this.localAI = localAI;
  }

  setSystemPromptBuilder(builder: (characterId: string, worldId: string) => string): void {
    this.systemPromptBuilder = builder;
  }

  private useLocalAI(): boolean {
    return this.localAI !== null;
  }

  /**
   * Set the DataSource for health checks.
   */
  setDataSource(ds: DataSource): void {
    this.dataSource = ds;
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
   * Check if conversation is available (local AI or remote service).
   * Caches the remote result for the session lifetime.
   */
  async isAvailable(): Promise<boolean> {
    if (this.useLocalAI()) return true;
    if (this._available !== null) return this._available;
    if (this.dataSource) {
      this._available = await this.dataSource.checkConversationHealth();
    } else {
      try {
        const res = await fetch(`${this.baseUrl}/api/conversation/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        this._available = res.ok;
      } catch {
        this._available = false;
      }
    }
    return this._available;
  }

  /**
   * Send a text message and receive streaming responses.
   * Routes through local AI when available, otherwise uses HTTP SSE.
   * Returns the full accumulated response text.
   */
  async sendText(text: string, languageCode: string = 'en'): Promise<string> {
    if (!this.characterId || !this.worldId) {
      throw new Error('ConversationClient: character and world must be set before sending');
    }

    if (this.useLocalAI()) {
      return this.sendTextLocal(text, languageCode);
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
   * Routes through local AI when available (STT first, then text flow).
   * Returns the full accumulated response text.
   */
  async sendAudio(audioBlob: Blob, languageCode: string = 'en'): Promise<string> {
    if (!this.characterId || !this.worldId) {
      throw new Error('ConversationClient: character and world must be set before sending');
    }

    if (this.useLocalAI()) {
      return this.sendAudioLocal(audioBlob, languageCode);
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
    this._aborted = true;
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

  // ── Local AI paths ─────────────────────────────────────────────────────

  private async sendTextLocal(text: string, _languageCode: string): Promise<string> {
    this._aborted = false;
    this.setState('thinking');

    try {
      const systemPrompt = this.systemPromptBuilder
        ? this.systemPromptBuilder(this.characterId, this.worldId)
        : undefined;

      let fullText = '';
      const result = await this.localAI!.generateStream(
        text,
        systemPrompt,
        undefined,
        (token: string) => {
          if (this._aborted) return;
          fullText += token;
          this.setState('speaking');
          this.callbacks.onTextChunk?.(token, false);
        },
      );

      if (this._aborted) return '';

      // Final text chunk
      fullText = result || fullText;
      this.callbacks.onTextChunk?.('', true);

      // Generate TTS audio if available
      await this.generateLocalTTS(fullText);

      this.callbacks.onComplete?.(fullText);
      this.setState('idle');
      return fullText;
    } catch (err: any) {
      if (this._aborted) return '';
      this.setState('error');
      this.callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private async sendAudioLocal(audioBlob: Blob, languageCode: string): Promise<string> {
    this._aborted = false;
    this.setState('thinking');

    try {
      const { text: transcribed } = await this.localAI!.speechToText(audioBlob, languageCode);
      if (this._aborted) return '';
      if (!transcribed) {
        this.setState('idle');
        return '';
      }
      // Route through local text flow (setState is handled inside)
      return await this.sendTextLocal(transcribed, languageCode);
    } catch (err: any) {
      if (this._aborted) return '';
      this.setState('error');
      this.callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private async generateLocalTTS(text: string): Promise<void> {
    if (this._aborted || !this.callbacks.onAudioChunk) return;
    try {
      const audioBuffer = await this.localAI!.textToSpeech(text);
      if (this._aborted || !audioBuffer) return;
      this.callbacks.onAudioChunk({
        data: new Uint8Array(audioBuffer),
        encoding: 3, // MP3
        sampleRate: 24000,
        durationMs: 0,
      });
    } catch {
      // TTS failure is non-fatal — text still works
    }
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
    let textComplete = false;

    // Resolve the text promise as soon as all text is received (isFinal),
    // while continuing to consume audio/viseme events in the background.
    // IMPORTANT: onComplete is NOT called here — only when the stream truly ends,
    // so that streamingAudioPlayer.finish() isn't called prematurely.
    let resolveText: ((text: string) => void) | null = null;
    const textPromise = new Promise<string>((resolve) => { resolveText = resolve; });

    const readLoop = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
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
                // When server signals all text is sent, resolve the promise
                // so the caller can proceed while audio continues streaming.
                // Do NOT call onComplete yet — that signals end of audio.
                if (parsed.isFinal && !textComplete) {
                  textComplete = true;
                  resolveText?.(fullText);
                }
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
        // Stream fully ended — now it's safe to signal completion
        this.callbacks.onComplete?.(fullText);
        if (!textComplete) {
          resolveText?.(fullText);
        }
        this.setState('idle');
      }
    };

    // Start consuming the stream — don't await it
    readLoop().catch(err => {
      console.error('[ConversationClient] SSE read error:', err);
      if (!textComplete) resolveText?.('');
    });

    return textPromise;
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
