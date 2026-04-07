/**
 * Gemini Live Session Manager
 *
 * Creates and maintains persistent Gemini Live sessions for bidirectional
 * audio streaming in NPC conversations.
 */

import type { Session, LiveServerMessage, Modality } from '@google/genai';
import { getGenAI, GEMINI_MODELS } from '../../../config/gemini.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface LiveSessionCallbacks {
  /** Called when an audio chunk is received from the model */
  onAudioChunk?: (data: string, mimeType: string) => void;
  /** Called when a text chunk is received from the model */
  onTextChunk?: (text: string) => void;
  /** Called when the model's turn is complete */
  onTurnComplete?: (fullText: string) => void;
  /** Called when the model's generation was interrupted */
  onInterrupted?: () => void;
  /** Called when input audio transcription is available */
  onTranscription?: (text: string) => void;
}

export interface LiveSessionConfig {
  /** System prompt for the NPC */
  systemPrompt: string;
  /** Gemini prebuilt voice name (e.g. 'Aoede', 'Puck') */
  voiceName?: string;
  /** Target language code (e.g. 'fr-FR', 'es-ES') */
  languageCode?: string;
  /** Character ID for session tracking */
  characterId?: string;
  /** World ID for session tracking */
  worldId?: string;
  /** Player ID for session tracking */
  playerId?: string;
}

// ── LiveConversationSession ───────────────────────────────────────────

/**
 * Wrapper around a raw Gemini Live Session that handles audio/text
 * routing, turn management, and event dispatching.
 */
export class LiveConversationSession {
  readonly id: string;
  readonly createdAt: number;
  private lastActivity: number;
  private accumulatedText: string = '';
  private closed: boolean = false;

  constructor(
    public readonly rawSession: Session,
    public readonly callbacks: LiveSessionCallbacks,
    public readonly config: LiveSessionConfig,
  ) {
    this.id = `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  /** Send raw audio to the Live session */
  sendAudio(data: string, mimeType: string = 'audio/pcm;rate=16000'): void {
    if (this.closed) return;
    this.lastActivity = Date.now();
    this.rawSession.sendRealtimeInput({
      audio: { data, mimeType },
    });
  }

  /** Send text input to the Live session */
  sendText(text: string): void {
    if (this.closed) return;
    this.lastActivity = Date.now();
    this.rawSession.sendClientContent({
      turns: [{ role: 'user', parts: [{ text }] }],
      turnComplete: true,
    });
  }

  /** Handle an incoming server message — dispatches to callbacks */
  handleMessage(msg: LiveServerMessage): void {
    this.lastActivity = Date.now();

    const serverContent = msg.serverContent;
    if (serverContent) {
      // Check for interruption
      if (serverContent.interrupted) {
        this.accumulatedText = '';
        this.callbacks.onInterrupted?.();
        return;
      }

      // Process model turn parts
      const parts = serverContent.modelTurn?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            // Audio part
            this.callbacks.onAudioChunk?.(
              part.inlineData.data,
              part.inlineData.mimeType || 'audio/pcm;rate=24000',
            );
          } else if (part.text) {
            // Text part
            this.accumulatedText += part.text;
            this.callbacks.onTextChunk?.(part.text);
          }
        }
      }

      // Turn complete
      if (serverContent.turnComplete) {
        const fullText = this.accumulatedText;
        this.accumulatedText = '';
        this.callbacks.onTurnComplete?.(fullText);
      }
    }
  }

  /** Milliseconds since last activity */
  get idleMs(): number {
    return Date.now() - this.lastActivity;
  }

  /** Close the session */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    try {
      this.rawSession.close();
    } catch {
      // Already closed or errored — ignore
    }
  }

  get isClosed(): boolean {
    return this.closed;
  }
}

// ── LiveSessionManager ────────────────────────────────────────────────

const DEFAULT_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_CONCURRENT_SESSIONS = 10;

export class LiveSessionManager {
  private sessions = new Map<string, LiveConversationSession>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private readonly inactivityTimeoutMs: number;
  private readonly maxConcurrentSessions: number;

  constructor(options?: {
    inactivityTimeoutMs?: number;
    maxConcurrentSessions?: number;
  }) {
    this.inactivityTimeoutMs = options?.inactivityTimeoutMs ?? DEFAULT_INACTIVITY_TIMEOUT_MS;
    this.maxConcurrentSessions = options?.maxConcurrentSessions ?? DEFAULT_MAX_CONCURRENT_SESSIONS;

    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 30_000);
  }

  /**
   * Create a new Gemini Live session.
   * Connects via ai.live.connect() with the specified config.
   */
  async createSession(
    config: LiveSessionConfig,
    callbacks: LiveSessionCallbacks,
  ): Promise<LiveConversationSession> {
    // Enforce concurrent session limit
    if (this.sessions.size >= this.maxConcurrentSessions) {
      throw new Error(
        `Maximum concurrent Live sessions (${this.maxConcurrentSessions}) reached`,
      );
    }

    const ai = getGenAI();

    // Build Live connect config
    const connectConfig: Record<string, unknown> = {
      responseModalities: ['AUDIO', 'TEXT'] as Modality[],
      systemInstruction: config.systemPrompt,
    };

    // Voice configuration
    if (config.voiceName) {
      connectConfig.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: config.voiceName },
        },
        ...(config.languageCode ? { languageCode: config.languageCode } : {}),
      };
    } else if (config.languageCode) {
      connectConfig.speechConfig = {
        languageCode: config.languageCode,
      };
    }

    // Enable input audio transcription
    connectConfig.inputAudioTranscription = {};

    // Create the wrapper first so we can wire up callbacks
    let session: LiveConversationSession;

    const rawSession = await ai.live.connect({
      model: GEMINI_MODELS.LIVE,
      callbacks: {
        onopen: () => {
          console.log(`[LiveSession] Session ${session?.id} connected`);
        },
        onmessage: (msg: LiveServerMessage) => {
          session?.handleMessage(msg);
        },
        onerror: (e: ErrorEvent) => {
          console.error(`[LiveSession] Session ${session?.id} error:`, e.message);
        },
        onclose: () => {
          console.log(`[LiveSession] Session ${session?.id} closed`);
          if (session) {
            this.sessions.delete(session.id);
          }
        },
      },
      config: connectConfig as any,
    });

    session = new LiveConversationSession(rawSession, callbacks, config);

    // Send system prompt as initial context
    rawSession.sendClientContent({
      turns: [
        {
          role: 'user',
          parts: [{ text: `[System: ${config.systemPrompt}]` }],
        },
      ],
      turnComplete: false,
    });

    this.sessions.set(session.id, session);
    console.log(
      `[LiveSession] Created session ${session.id} (${this.sessions.size}/${this.maxConcurrentSessions} active)`,
    );

    return session;
  }

  /** Retrieve an active session by ID */
  getSession(sessionId: string): LiveConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /** End a session and clean up */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.close();
      this.sessions.delete(sessionId);
      console.log(
        `[LiveSession] Ended session ${sessionId} (${this.sessions.size}/${this.maxConcurrentSessions} active)`,
      );
    }
  }

  /** Number of active sessions */
  get activeSessionCount(): number {
    return this.sessions.size;
  }

  /** Clean up expired sessions */
  private cleanupExpired(): void {
    const toRemove: string[] = [];
    this.sessions.forEach((session, id) => {
      if (session.idleMs > this.inactivityTimeoutMs) {
        console.log(`[LiveSession] Session ${id} expired after inactivity`);
        session.close();
        toRemove.push(id);
      }
    });
    toRemove.forEach(id => this.sessions.delete(id));
  }

  /** Shut down the manager and close all sessions */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.sessions.forEach(session => session.close());
    this.sessions.clear();
  }
}

/** Singleton instance */
let managerInstance: LiveSessionManager | null = null;

export function getLiveSessionManager(): LiveSessionManager {
  if (!managerInstance) {
    managerInstance = new LiveSessionManager();
  }
  return managerInstance;
}
