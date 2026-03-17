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
import type { ISTTProvider, AudioStreamChunk } from './stt/stt-provider.js';
import type { ITTSProvider, VoiceProfile, AudioChunkOutput } from './tts/tts-provider.js';
import { splitAtSentenceBoundaries, assignVoiceProfile, VOICE_PROFILES } from './tts/tts-provider.js';
import type { IVisemeGenerator } from './viseme/viseme-generator.js';
import type { VisemeQuality } from './viseme/viseme-generator.js';
import { createVisemeGenerator } from './viseme/viseme-generator.js';
import { PipelineTimer, getConversationMetrics } from './conversation-metrics.js';

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
  sttProvider?: ISTTProvider;
  ttsProvider?: ITTSProvider;
  storageOverride?: ContextManagerStorage;
  /** Enable audio response pipeline (TTS synthesis of LLM output) */
  enableAudioResponse?: boolean;
  /** Viseme generator for lip sync data */
  visemeGenerator?: IVisemeGenerator;
  /** Viseme quality level: 'full' (15 OVR), 'simplified' (5 shapes), 'disabled' */
  visemeQuality?: VisemeQuality;
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

// ── Connection Pool (cached provider instances) ──────────────────────

const providerPool: {
  llm: IStreamingLLMProvider | null;
  stt: ISTTProvider | null;
  tts: ITTSProvider | null;
} = { llm: null, stt: null, tts: null };

/** Get or cache a warm provider instance to avoid re-creation overhead. */
function getPooledLLM(options: GrpcServerOptions): IStreamingLLMProvider {
  if (options.llmProvider) return options.llmProvider;
  if (!providerPool.llm) providerPool.llm = getProvider();
  return providerPool.llm;
}

export function clearProviderPool(): void {
  providerPool.llm = null;
  providerPool.stt = null;
  providerPool.tts = null;
}

// ── Per-session voice profile cache ──────────────────────────────────

const voiceProfileCache = new Map<string, VoiceProfile>();

function getVoiceForSession(sessionId: string, characterId: string, gender?: string): VoiceProfile {
  const key = `${sessionId}:${characterId}`;
  let profile = voiceProfileCache.get(key);
  if (!profile) {
    profile = assignVoiceProfile({ gender: gender ?? 'male' });
    voiceProfileCache.set(key, profile);
  }
  return profile;
}

export function setVoiceForSession(sessionId: string, characterId: string, profile: VoiceProfile): void {
  voiceProfileCache.set(`${sessionId}:${characterId}`, profile);
}

function createHandlers(options: GrpcServerOptions) {
  const llmProvider = getPooledLLM(options);
  const sttProvider = options.sttProvider ?? null;
  const ttsProvider = options.ttsProvider ?? null;
  const enableAudioResponse = options.enableAudioResponse ?? (ttsProvider !== null);
  const storageOverride = options.storageOverride;
  const visemeQuality: VisemeQuality = options.visemeQuality ?? 'full';
  const visemeGen: IVisemeGenerator | null =
    visemeQuality === 'disabled' ? null : (options.visemeGenerator ?? createVisemeGenerator());

  // Per-stream audio buffer for collecting audio chunks until stream ends
  const audioBuffers = new Map<string, AudioStreamChunk[]>();

  async function handleConversationStream(call: grpc.ServerDuplexStream<any, any>) {
    call.on('data', async (request: any) => {
      try {
        if (request.textInput) {
          await handleTextInput(call, request.textInput, llmProvider, storageOverride, false);
        } else if (request.audioChunk) {
          await handleAudioChunkInput(call, request.audioChunk, llmProvider, sttProvider, ctxStorage);
        } else if (request.systemCommand) {
          handleSystemCommand(call, request.systemCommand);
        }
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

  const ctxStorage = storageOverride;

  /**
   * Handle text input with optional TTS audio pipeline.
   *
   * When `withAudio` is true and a TTS provider is available, the pipeline runs:
   *   LLM tokens → accumulate into sentences → TTS synthesis per sentence → AudioChunk responses
   * Text chunks are streamed immediately (text arrives before audio).
   * TTS runs in parallel: while LLM generates sentence N+1, TTS synthesizes sentence N.
   */
  async function handleTextInput(
    call: grpc.ServerDuplexStream<any, any>,
    textInput: any,
    provider: IStreamingLLMProvider,
    ctxStorageArg?: ContextManagerStorage,
    withAudio?: boolean,
  ) {
    const { text, sessionId, characterId, languageCode } = textInput;
    const metrics = getConversationMetrics();
    const shouldSynthesizeAudio = (withAudio ?? enableAudioResponse) && ttsProvider !== null;
    const e2eTimer = new PipelineTimer('end_to_end');

    // Adaptive quality: degrade viseme/TTS quality when latency is high
    let effectiveVisemeQuality = visemeQuality;
    if (metrics.isDegraded) {
      effectiveVisemeQuality = effectiveVisemeQuality === 'full' ? 'simplified' : effectiveVisemeQuality;
    }

    // Get or create session
    let session = sessions.get(sessionId);
    if (!session) {
      const worldId = textInput.worldId ?? '';
      const playerId = textInput.playerId ?? sessionId;
      session = createSession(sessionId, characterId, worldId, playerId, languageCode);
    }

    // Build context on first message or if character changed
    if (!session.conversationContext || session.characterId !== characterId) {
      session.characterId = characterId;
      const ctxTimer = new PipelineTimer('context');
      try {
        const fullCtx = await buildContext(
          characterId,
          session.playerId,
          session.worldId,
          sessionId,
          ctxStorageArg,
        );
        session.conversationContext = fullCtx.conversationContext;
      } catch {
        session.conversationContext = {
          systemPrompt: `You are an NPC in a game world. Respond in character.`,
          characterName: characterId,
        };
      }
      ctxTimer.stop();
    }

    // Send ACTIVE state
    call.write({
      conversationMeta: { sessionId, state: 'ACTIVE' },
    });

    // Add user message to history
    addToHistory(session, 'user', text);

    // Stream LLM response token-by-token, with optional TTS pipelining
    let fullResponse = '';
    const ttsPromises: Array<Promise<void>> = [];
    let sentenceBuffer = '';

    // TTS helper: synthesize a sentence and stream audio chunks + viseme data
    const synthesizeSentence = (sentence: string) => {
      if (!shouldSynthesizeAudio || !ttsProvider) return;
      // Skip TTS entirely when adaptive quality degrades and latency is very high
      if (metrics.isDegraded) {
        const e2eStats = metrics.getStageStats('end_to_end');
        if (e2eStats && e2eStats.p95 > 4000) return; // skip TTS if extremely slow
      }
      const voice = getVoiceForSession(sessionId, characterId, session?.conversationContext?.characterGender);
      const promise = (async () => {
        const ttsTimer = new PipelineTimer('tts_total');
        let firstChunkRecorded = false;
        const ttsFirstChunkTimer = new PipelineTimer('tts_first_chunk');
        try {
          const audioChunks = ttsProvider.synthesize(sentence, voice, {
            languageCode: languageCode || undefined,
          });
          for await (const chunk of audioChunks) {
            if (!firstChunkRecorded) {
              ttsFirstChunkTimer.stop();
              firstChunkRecorded = true;
            }

            // Generate viseme data synchronized to audio chunk timing
            if (visemeGen && effectiveVisemeQuality !== 'disabled') {
              const visemeTimer = new PipelineTimer('viseme');
              const facialData = visemeGen.generateVisemes(sentence, chunk.durationMs, effectiveVisemeQuality);
              visemeTimer.stop();
              if (facialData.visemes.length > 0) {
                call.write({ facialData });
              }
            }

            call.write({
              audioChunk: {
                data: chunk.data,
                encoding: chunk.encoding,
                sampleRate: chunk.sampleRate,
                durationMs: chunk.durationMs,
              },
            });
          }
        } catch (err: any) {
          console.error('[gRPC] TTS synthesis error:', err.message);
        }
        if (!firstChunkRecorded) ttsFirstChunkTimer.stop();
        ttsTimer.stop();
      })();
      ttsPromises.push(promise);
    };

    const llmTotalTimer = new PipelineTimer('llm_total');
    const llmFirstTokenTimer = new PipelineTimer('llm_first_token');
    let firstTokenRecorded = false;

    try {
      const tokens = provider.streamCompletion(text, session.conversationContext, {
        languageCode,
        conversationHistory: session.history.slice(0, -1),
      });

      for await (const token of tokens) {
        if (!firstTokenRecorded) {
          llmFirstTokenTimer.stop();
          firstTokenRecorded = true;
        }
        fullResponse += token;

        // Stream text chunk immediately (text arrives before audio)
        call.write({
          textChunk: {
            text: token,
            isFinal: false,
            languageCode,
            sessionId,
          },
        });

        // Accumulate into sentence buffer for TTS pipelining
        if (shouldSynthesizeAudio) {
          sentenceBuffer += token;
          const sentences = splitAtSentenceBoundaries(sentenceBuffer);
          if (sentences.length > 1) {
            // Complete sentence(s) detected — synthesize all but the last (which may be incomplete)
            for (let i = 0; i < sentences.length - 1; i++) {
              synthesizeSentence(sentences[i]);
            }
            sentenceBuffer = sentences[sentences.length - 1];
          }
        }
      }
    } catch (err: any) {
      console.error('[gRPC] LLM streaming error:', err.message);
    }
    if (!firstTokenRecorded) llmFirstTokenTimer.stop();
    llmTotalTimer.stop();

    // Synthesize any remaining text in the sentence buffer
    if (shouldSynthesizeAudio && sentenceBuffer.trim()) {
      synthesizeSentence(sentenceBuffer.trim());
    }

    // Send final text marker
    call.write({
      textChunk: {
        text: '',
        isFinal: true,
        languageCode,
        sessionId,
      },
    });

    // Let TTS finish in the background — audio chunks are streamed as they complete
    if (ttsPromises.length > 0) {
      Promise.all(ttsPromises).catch(err => {
        console.error('[gRPC] Background TTS error:', err);
      });
    }

    // Store assistant response in history
    if (fullResponse) {
      addToHistory(session, 'assistant', fullResponse);
    }

    e2eTimer.stop();
  }

  async function handleAudioChunkInput(
    call: grpc.ServerDuplexStream<any, any>,
    audioChunk: any,
    provider: IStreamingLLMProvider,
    stt: ISTTProvider | null,
    ctxStorageArg?: ContextManagerStorage,
  ) {
    if (!stt) {
      call.write({
        conversationMeta: {
          sessionId: audioChunk.sessionId ?? '',
          state: 'ENDED',
        },
      });
      return;
    }

    const { sessionId, characterId, encoding, sampleRate, data } = audioChunk;

    // Buffer audio chunk
    const bufferKey = sessionId ?? 'default';
    if (!audioBuffers.has(bufferKey)) {
      audioBuffers.set(bufferKey, []);
    }
    audioBuffers.get(bufferKey)!.push({
      data: data instanceof Uint8Array ? data : new Uint8Array(data),
      encoding: encoding ?? 1,
      sampleRate: sampleRate ?? 16000,
    });

    // If data is empty, it signals end-of-audio — process the buffered audio
    if (!data || data.length === 0) {
      const chunks = audioBuffers.get(bufferKey) ?? [];
      audioBuffers.delete(bufferKey);

      // Create async iterable from buffered chunks (exclude the empty terminator)
      const audioChunks = chunks.filter((c) => c.data.length > 0);
      const audioStream: AsyncIterable<AudioStreamChunk> = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of audioChunks) {
            yield chunk;
          }
        },
      };

      // Transcribe
      const sttTimer = new PipelineTimer('stt');
      let fullText = '';
      const transcriptionResults = stt.streamTranscription(audioStream, {
        languageCode: audioChunk.languageCode,
        sampleRate: sampleRate ?? 16000,
        encoding: encoding ?? 1,
      });

      for await (const result of transcriptionResults) {
        if (result.text) {
          fullText = result.isFinal ? result.text : fullText + result.text;
        }
      }
      sttTimer.stop();

      if (!fullText.trim()) {
        return;
      }

      // Feed transcribed text through the full pipeline (with audio response enabled)
      await handleTextInput(call, {
        text: fullText.trim(),
        sessionId,
        characterId,
        languageCode: audioChunk.languageCode ?? 'en',
      }, provider, ctxStorageArg, true);
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
        voiceProfileCache.clear();
        clearProviderPool();
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export { sessions, voiceProfileCache };
