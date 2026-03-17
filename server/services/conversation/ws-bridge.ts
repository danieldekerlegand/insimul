/**
 * WebSocket-to-gRPC Bridge for the Conversation Service
 *
 * Provides a WebSocket server that proxies JSON messages to the internal gRPC
 * conversation pipeline (LLM streaming, TTS, viseme generation). Designed for
 * clients that lack native gRPC support — primarily the Godot plugin and as a
 * browser fallback when gRPC-Web proxy is unavailable.
 *
 * Protocol:
 *  - Text messages: JSON objects matching ConversationRequest/Response shapes
 *  - Binary messages: raw audio data (AudioChunk input)
 *  - Each WebSocket connection maps 1:1 to a conversation session
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HTTPServer } from 'http';
import {
  getSession,
  createSession,
  endSession,
} from './grpc-server.js';
import { getProvider } from './providers/provider-registry.js';
import { buildContext } from './context-manager.js';
import type { IStreamingLLMProvider, ConversationContext } from './providers/llm-provider.js';
import type { ITTSProvider, VoiceProfile } from './tts/tts-provider.js';
import { splitAtSentenceBoundaries, assignVoiceProfile } from './tts/tts-provider.js';
import type { IVisemeGenerator, VisemeQuality } from './viseme/viseme-generator.js';
import { createVisemeGenerator } from './viseme/viseme-generator.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface WSBridgeOptions {
  /** WebSocket server port (default 50052). Ignored when httpServer is provided. */
  port?: number;
  /** Attach to an existing HTTP server instead of listening on a standalone port. */
  httpServer?: HTTPServer;
  /** Override LLM provider for testing. */
  llmProvider?: IStreamingLLMProvider;
  /** Override TTS provider for testing. */
  ttsProvider?: ITTSProvider;
  /** Override viseme generator for testing. */
  visemeGenerator?: IVisemeGenerator;
  /** Viseme quality: 'full', 'simplified', or 'disabled'. */
  visemeQuality?: VisemeQuality;
}

/** Maps WebSocket connections to their session IDs for reconnection. */
const connectionSessions = new Map<WebSocket, string>();

// ── Helpers ───────────────────────────────────────────────────────────

function sendJSON(ws: WebSocket, data: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sendBinary(ws: WebSocket, data: Uint8Array): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(data);
  }
}

function addToHistory(
  session: { history: Array<{ role: 'user' | 'assistant'; content: string }>; lastActivity: number },
  role: 'user' | 'assistant',
  content: string,
): void {
  session.history.push({ role, content });
  if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }
  session.lastActivity = Date.now();
}

// ── Text streaming pipeline ───────────────────────────────────────────

async function handleTextInput(
  ws: WebSocket,
  msg: {
    text: string;
    sessionId: string;
    characterId: string;
    worldId: string;
    languageCode?: string;
  },
  options: WSBridgeOptions,
): Promise<void> {
  const { text, sessionId, characterId, worldId, languageCode = 'en' } = msg;

  // Get or create session
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, characterId, worldId, sessionId, languageCode);
  }
  connectionSessions.set(ws, sessionId);

  // Build context on first message or character change
  if (!session.conversationContext || session.characterId !== characterId) {
    session.characterId = characterId;
    try {
      const fullCtx = await buildContext(characterId, session.playerId, worldId, sessionId);
      session.conversationContext = fullCtx.conversationContext;
    } catch {
      session.conversationContext = {
        systemPrompt: 'You are an NPC in a game world. Respond in character.',
        characterName: characterId,
      };
    }
  }

  // Notify ACTIVE state
  sendJSON(ws, { type: 'meta', sessionId, state: 'ACTIVE' });

  // Add user message to history
  addToHistory(session, 'user', text);

  // Resolve LLM provider
  let llmProvider: IStreamingLLMProvider;
  try {
    llmProvider = options.llmProvider ?? getProvider();
  } catch {
    sendJSON(ws, { type: 'error', message: 'LLM provider not available' });
    sendJSON(ws, { type: 'done' });
    return;
  }

  // Attempt TTS + viseme (optional)
  let ttsProvider: ITTSProvider | null = options.ttsProvider ?? null;
  if (!ttsProvider) {
    try {
      const ttsModule = await import('./tts/tts-provider.js');
      ttsProvider = ttsModule.getTTSProvider?.() ?? null;
    } catch {
      // TTS not available
    }
  }
  const visemeQuality: VisemeQuality = options.visemeQuality ?? 'full';
  let visemeGen: IVisemeGenerator | null = null;
  if (visemeQuality !== 'disabled') {
    try {
      visemeGen = options.visemeGenerator ?? createVisemeGenerator();
    } catch {
      // Viseme not available
    }
  }

  // Stream LLM tokens
  let fullResponse = '';
  let sentenceBuffer = '';
  const ttsPromises: Array<Promise<void>> = [];

  const synthesizeSentence = (sentence: string) => {
    if (!ttsProvider) return;
    const voice: VoiceProfile = assignVoiceProfile({
      gender: (session as any)?.conversationContext?.characterGender,
    });
    const promise = (async () => {
      try {
        const audioChunks = ttsProvider!.synthesize(sentence, voice, {
          languageCode: languageCode || undefined,
        });
        for await (const chunk of audioChunks) {
          // Viseme data before audio
          if (visemeGen && visemeQuality !== 'disabled') {
            const facialData = visemeGen.generateVisemes(sentence, chunk.durationMs, visemeQuality);
            if (facialData.visemes.length > 0) {
              sendJSON(ws, { type: 'facial', visemes: facialData.visemes });
            }
          }
          // Audio as binary WebSocket frame
          sendBinary(ws, chunk.data instanceof Uint8Array ? chunk.data : new Uint8Array(chunk.data));
          // Audio metadata as JSON
          sendJSON(ws, {
            type: 'audio_meta',
            encoding: chunk.encoding,
            sampleRate: chunk.sampleRate,
            durationMs: chunk.durationMs,
          });
        }
      } catch (err: any) {
        console.error('[WS-Bridge] TTS error:', err.message);
      }
    })();
    ttsPromises.push(promise);
  };

  try {
    const tokens = llmProvider.streamCompletion(text, session.conversationContext!, {
      languageCode,
      conversationHistory: session.history.slice(0, -1),
    });

    for await (const token of tokens) {
      fullResponse += token;

      // Stream text chunk immediately
      sendJSON(ws, { type: 'text', text: token, isFinal: false, languageCode, sessionId });

      // TTS pipelining
      if (ttsProvider) {
        sentenceBuffer += token;
        const sentences = splitAtSentenceBoundaries(sentenceBuffer);
        if (sentences.length > 1) {
          for (let i = 0; i < sentences.length - 1; i++) {
            synthesizeSentence(sentences[i]);
          }
          sentenceBuffer = sentences[sentences.length - 1];
        }
      }
    }
  } catch (err: any) {
    console.error('[WS-Bridge] LLM streaming error:', err.message);
    sendJSON(ws, { type: 'error', message: 'LLM streaming failed' });
  }

  // Remaining sentence buffer
  if (ttsProvider && sentenceBuffer.trim()) {
    synthesizeSentence(sentenceBuffer.trim());
  }

  // Final text marker
  sendJSON(ws, { type: 'text', text: '', isFinal: true, languageCode, sessionId });

  // Wait for TTS to complete
  if (ttsPromises.length > 0) {
    await Promise.all(ttsPromises);
  }

  // Store response
  if (fullResponse) {
    addToHistory(session, 'assistant', fullResponse);
  }

  sendJSON(ws, { type: 'done' });
}

// ── Audio input handling ──────────────────────────────────────────────

/** Buffered audio chunks per session, keyed by sessionId. */
const audioBuffers = new Map<string, Array<{ data: Uint8Array; encoding: number; sampleRate: number }>>();

function handleAudioChunk(
  ws: WebSocket,
  data: Uint8Array,
  sessionId: string,
): void {
  if (!audioBuffers.has(sessionId)) {
    audioBuffers.set(sessionId, []);
  }
  audioBuffers.get(sessionId)!.push({
    data,
    encoding: 1, // PCM default
    sampleRate: 16000,
  });
}

async function processAudioBuffer(
  ws: WebSocket,
  sessionId: string,
  characterId: string,
  worldId: string,
  languageCode: string,
  options: WSBridgeOptions,
): Promise<void> {
  const chunks = audioBuffers.get(sessionId) ?? [];
  audioBuffers.delete(sessionId);

  const audioChunks = chunks.filter((c) => c.data.length > 0);
  if (audioChunks.length === 0) return;

  // Transcribe via STT
  let sttProvider;
  try {
    const sttModule = await import('./stt/stt-provider.js');
    sttProvider = sttModule.getSTTProvider?.() ?? null;
  } catch {
    // STT not available
  }

  if (!sttProvider) {
    sendJSON(ws, { type: 'error', message: 'STT provider not available' });
    return;
  }

  const audioStream: AsyncIterable<{ data: Uint8Array; encoding: number; sampleRate: number }> = {
    async *[Symbol.asyncIterator]() {
      for (const chunk of audioChunks) {
        yield chunk;
      }
    },
  };

  let fullText = '';
  const transcriptionResults = sttProvider.streamTranscription(audioStream, {
    languageCode,
    sampleRate: 16000,
    encoding: 1,
  });

  for await (const result of transcriptionResults) {
    if (result.text) {
      fullText = result.isFinal ? result.text : fullText + result.text;
    }
  }

  if (!fullText.trim()) {
    sendJSON(ws, { type: 'error', message: 'No speech detected' });
    return;
  }

  // Send transcript to client
  sendJSON(ws, { type: 'transcript', text: fullText.trim() });

  // Feed through text pipeline
  await handleTextInput(ws, {
    text: fullText.trim(),
    sessionId,
    characterId,
    worldId,
    languageCode,
  }, options);
}

// ── System commands ───────────────────────────────────────────────────

function handleSystemCommand(
  ws: WebSocket,
  command: { type: string; sessionId: string },
): void {
  const { type, sessionId } = command;

  if (type === 'END' || type === '1') {
    endSession(sessionId);
    connectionSessions.delete(ws);
    sendJSON(ws, { type: 'meta', sessionId, state: 'ENDED' });
  } else if (type === 'PAUSE' || type === '2') {
    const session = getSession(sessionId);
    if (session) session.active = false;
    sendJSON(ws, { type: 'meta', sessionId, state: 'PAUSED' });
  } else if (type === 'RESUME' || type === '3') {
    const session = getSession(sessionId);
    if (session) {
      session.active = true;
      session.lastActivity = Date.now();
    }
    sendJSON(ws, { type: 'meta', sessionId, state: 'ACTIVE' });
  }
}

// ── WebSocket server lifecycle ────────────────────────────────────────

let wss: WebSocketServer | null = null;

export function startWSBridge(options: WSBridgeOptions = {}): WebSocketServer {
  const wssOptions: { port?: number; server?: HTTPServer; path?: string } = {};

  if (options.httpServer) {
    wssOptions.server = options.httpServer;
    wssOptions.path = '/ws/conversation';
  } else {
    wssOptions.port = options.port ?? parseInt(process.env.WS_BRIDGE_PORT ?? '50052', 10);
  }

  const server = new WebSocketServer(wssOptions);
  wss = server;

  server.on('connection', (ws: WebSocket) => {
    let currentSessionId: string | null = null;

    ws.on('message', async (raw: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
      try {
        if (isBinary) {
          // Binary frame = audio data
          const data = raw instanceof Buffer ? new Uint8Array(raw) : new Uint8Array(raw as ArrayBuffer);
          if (currentSessionId) {
            handleAudioChunk(ws, data, currentSessionId);
          }
          return;
        }

        // Text frame = JSON message
        const message = JSON.parse(raw.toString());

        if (message.textInput) {
          const { text, sessionId, characterId, worldId, languageCode } = message.textInput;
          currentSessionId = sessionId;
          await handleTextInput(ws, { text, sessionId, characterId, worldId, languageCode }, options);
        } else if (message.audioChunk) {
          const { sessionId, characterId, worldId, languageCode, data } = message.audioChunk;
          currentSessionId = sessionId;
          if (data) {
            // Base64-encoded audio in JSON (alternative to binary frames)
            const audioData = Uint8Array.from(Buffer.from(data, 'base64'));
            handleAudioChunk(ws, audioData, sessionId);
          }
        } else if (message.audioEnd) {
          // Signal end of audio — process buffered chunks
          const { sessionId, characterId, worldId, languageCode } = message.audioEnd;
          await processAudioBuffer(ws, sessionId, characterId, worldId, languageCode || 'en', options);
        } else if (message.systemCommand) {
          handleSystemCommand(ws, message.systemCommand);
        } else if (message.resumeSession) {
          // Reconnection: client provides previous sessionId to resume
          const { sessionId } = message.resumeSession;
          const session = getSession(sessionId);
          if (session) {
            currentSessionId = sessionId;
            connectionSessions.set(ws, sessionId);
            session.lastActivity = Date.now();
            sendJSON(ws, { type: 'meta', sessionId, state: 'ACTIVE' });
            sendJSON(ws, {
              type: 'session_restored',
              sessionId,
              historyLength: session.history.length,
            });
          } else {
            sendJSON(ws, { type: 'error', message: 'Session not found or expired' });
          }
        }
      } catch (err: any) {
        console.error('[WS-Bridge] Message handling error:', err.message);
        sendJSON(ws, { type: 'error', message: err.message || 'Internal error' });
      }
    });

    ws.on('close', () => {
      // Don't delete the session — allow reconnection
      connectionSessions.delete(ws);
    });

    ws.on('error', (err: Error) => {
      console.error('[WS-Bridge] Connection error:', err.message);
      connectionSessions.delete(ws);
    });
  });

  if (!options.httpServer) {
    const port = wssOptions.port;
    console.log(`[WS-Bridge] Conversation WebSocket bridge listening on port ${port}`);
  } else {
    console.log('[WS-Bridge] Conversation WebSocket bridge attached to HTTP server at /ws/conversation');
  }

  return server;
}

export function stopWSBridge(): Promise<void> {
  return new Promise((resolve) => {
    if (wss) {
      // Close all connections
      const clients = Array.from(wss.clients);
      for (const client of clients) {
        client.close(1001, 'Server shutting down');
      }
      wss.close(() => {
        wss = null;
        connectionSessions.clear();
        audioBuffers.clear();
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export { connectionSessions, audioBuffers };
