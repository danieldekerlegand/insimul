/**
 * gRPC Conversation Server
 *
 * Handles bidirectional streaming conversations between players and NPCs.
 * Runs on a separate port from the Express HTTP server.
 */

import * as grpc from '@grpc/grpc-js';
import { loadConversationProto } from './proto-loader.js';
import { getProvider } from './providers/provider-registry.js';
import { buildContext } from './context-manager.js';
import type { ContextManagerStorage } from './context-manager.js';
import type { IStreamingLLMProvider, ConversationContext } from './providers/llm-provider.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface SessionState {
  sessionId: string;
  characterId: string;
  worldId: string;
  playerId: string;
  languageCode: string;
  conversationContext: ConversationContext | null;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  active: boolean;
  lastActivity: number;
}

export interface GrpcServerOptions {
  port?: number;
  llmProvider?: IStreamingLLMProvider;
  storageOverride?: ContextManagerStorage;
}

// ── Session store ─────────────────────────────────────────────────────

const sessions = new Map<string, SessionState>();
const MAX_HISTORY = 20;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function getSession(sessionId: string): SessionState | undefined {
  return sessions.get(sessionId);
}

export function createSession(
  sessionId: string,
  characterId: string,
  worldId: string,
  playerId: string,
  languageCode: string,
): SessionState {
  const session: SessionState = {
    sessionId,
    characterId,
    worldId,
    playerId,
    languageCode,
    conversationContext: null,
    history: [],
    active: true,
    lastActivity: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

export function endSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let cleaned = 0;
  const ids = Array.from(sessions.keys());
  for (const id of ids) {
    const session = sessions.get(id)!;
    if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
      sessions.delete(id);
      cleaned++;
    }
  }
  return cleaned;
}

function addToHistory(
  session: SessionState,
  role: 'user' | 'assistant',
  content: string,
): void {
  session.history.push({ role, content });
  if (session.history.length > MAX_HISTORY) {
    session.history = session.history.slice(-MAX_HISTORY);
  }
  session.lastActivity = Date.now();
}

// ── gRPC Handlers ─────────────────────────────────────────────────────

function createHandlers(options: GrpcServerOptions) {
  const llmProvider = options.llmProvider ?? getProvider();
  const storageOverride = options.storageOverride;

  async function handleConversationStream(call: grpc.ServerDuplexStream<any, any>) {
    call.on('data', async (request: any) => {
      try {
        if (request.textInput) {
          await handleTextInput(call, request.textInput, llmProvider, storageOverride);
        } else if (request.systemCommand) {
          handleSystemCommand(call, request.systemCommand);
        }
        // AudioChunk handled in US-010
      } catch (err: any) {
        console.error('[gRPC] ConversationStream error:', err.message);
        call.write({
          conversationMeta: {
            sessionId: request?.textInput?.sessionId ?? '',
            state: 'ENDED',
          },
        });
      }
    });

    call.on('end', () => {
      call.end();
    });

    call.on('error', (err: any) => {
      if (err.code !== grpc.status.CANCELLED) {
        console.error('[gRPC] Stream error:', err.message);
      }
    });
  }

  async function handleTextInput(
    call: grpc.ServerDuplexStream<any, any>,
    textInput: any,
    provider: IStreamingLLMProvider,
    ctxStorage?: ContextManagerStorage,
  ) {
    const { text, sessionId, characterId, languageCode } = textInput;

    // Get or create session
    let session = sessions.get(sessionId);
    if (!session) {
      // Derive worldId and playerId from context
      // For now use characterId lookup; playerId defaults to sessionId
      const worldId = textInput.worldId ?? '';
      const playerId = textInput.playerId ?? sessionId;
      session = createSession(sessionId, characterId, worldId, playerId, languageCode);
    }

    // Build context on first message or if character changed
    if (!session.conversationContext || session.characterId !== characterId) {
      session.characterId = characterId;
      try {
        const fullCtx = await buildContext(
          characterId,
          session.playerId,
          session.worldId,
          sessionId,
          ctxStorage,
        );
        session.conversationContext = fullCtx.conversationContext;
      } catch {
        // Fallback minimal context if context-manager fails
        session.conversationContext = {
          systemPrompt: `You are an NPC in a game world. Respond in character.`,
          characterName: characterId,
        };
      }
    }

    // Send ACTIVE state
    call.write({
      conversationMeta: { sessionId, state: 'ACTIVE' },
    });

    // Add user message to history
    addToHistory(session, 'user', text);

    // Stream LLM response token-by-token
    let fullResponse = '';
    try {
      const tokens = provider.streamCompletion(text, session.conversationContext, {
        languageCode,
        conversationHistory: session.history.slice(0, -1), // exclude current message (already in prompt)
      });

      for await (const token of tokens) {
        fullResponse += token;
        call.write({
          textChunk: {
            text: token,
            isFinal: false,
            languageCode,
            sessionId,
          },
        });
      }
    } catch (err: any) {
      console.error('[gRPC] LLM streaming error:', err.message);
    }

    // Send final marker
    call.write({
      textChunk: {
        text: '',
        isFinal: true,
        languageCode,
        sessionId,
      },
    });

    // Store assistant response in history
    if (fullResponse) {
      addToHistory(session, 'assistant', fullResponse);
    }
  }

  function handleSystemCommand(call: grpc.ServerDuplexStream<any, any>, command: any) {
    const { sessionId } = command;
    const type = command.type as string;

    if (type === 'END' || type === '1') {
      endSession(sessionId);
      call.write({
        conversationMeta: { sessionId, state: 'ENDED' },
      });
    } else if (type === 'PAUSE' || type === '2') {
      const session = sessions.get(sessionId);
      if (session) session.active = false;
      call.write({
        conversationMeta: { sessionId, state: 'PAUSED' },
      });
    } else if (type === 'RESUME' || type === '3') {
      const session = sessions.get(sessionId);
      if (session) {
        session.active = true;
        session.lastActivity = Date.now();
      }
      call.write({
        conversationMeta: { sessionId, state: 'ACTIVE' },
      });
    }
  }

  function handleHealthCheck(
    _call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ) {
    callback(null, { healthy: true, version: '1.0.0' });
  }

  return {
    ConversationStream: handleConversationStream,
    HealthCheck: handleHealthCheck,
    // NpcToNpcStream will be implemented in US-007
    NpcToNpcStream: (call: grpc.ServerWritableStream<any, any>) => {
      call.write({
        conversationMeta: { sessionId: '', state: 'ENDED' },
      });
      call.end();
    },
  };
}

// ── Server lifecycle ──────────────────────────────────────────────────

let grpcServer: grpc.Server | null = null;
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export async function startGrpcServer(options: GrpcServerOptions = {}): Promise<grpc.Server> {
  const port = options.port ?? parseInt(process.env.GRPC_PORT ?? '50051', 10);

  const proto = await loadConversationProto();
  const insimul = proto.insimul as grpc.GrpcObject;
  const conversation = insimul.conversation as grpc.GrpcObject;
  const ServiceConstructor = conversation.InsimulConversation as grpc.ServiceClientConstructor;

  const server = new grpc.Server();
  server.addService(ServiceConstructor.service, createHandlers(options));

  return new Promise((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, boundPort) => {
        if (err) {
          reject(err);
          return;
        }

        grpcServer = server;

        // Periodic session cleanup every 5 minutes
        cleanupInterval = setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

        console.log(`[gRPC] Conversation server listening on port ${boundPort}`);
        resolve(server);
      },
    );
  });
}

export function stopGrpcServer(): Promise<void> {
  return new Promise((resolve) => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
    if (grpcServer) {
      grpcServer.tryShutdown(() => {
        grpcServer = null;
        sessions.clear();
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export { sessions };
