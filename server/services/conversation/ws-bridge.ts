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
import { buildContext, getLastPromptSectionTokens } from './context-manager.js';
import type { IStreamingLLMProvider, ConversationContext } from './providers/llm-provider.js';
import type { ITTSProvider, VoiceProfile } from './tts/tts-provider.js';
import { splitAtSentenceBoundaries, assignVoiceProfile } from './tts/tts-provider.js';
import type { IVisemeGenerator, VisemeQuality } from './viseme/viseme-generator.js';
import { createVisemeGenerator } from './viseme/viseme-generator.js';
import { initiateConversation } from './npc-conversation-engine.js';
import {
  conversationContextCache,
  ConversationContextCache,
} from './conversation-context-cache.js';
import { PipelineTimer, getConversationMetrics } from './conversation-metrics.js';
import { greetingCache } from './greeting-cache.js';
import { classifyConversation } from './conversation-classifier.js';
import type { ModelTier } from './conversation-classifier.js';
import { speculativeCache, canonicalizeMessage } from './speculative-cache.js';
import type { CEFRLevel } from '@shared/assessment/cefr-mapping';

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

  // Derive turn number from conversation history (each turn = 1 user + 1 assistant message)
  const turnNumber = Math.floor(session.history.length / 2) + 1;

  // Build context on first message or character change, using cache when possible
  if (!session.conversationContext || session.characterId !== characterId) {
    session.characterId = characterId;
    const cacheKey = ConversationContextCache.chatKey(worldId, characterId, session.playerId);
    const cached = conversationContextCache.get(cacheKey);

    if (cached?.formattedContext) {
      // Cache hit — restore LLM context from cached data
      const contextTimer = new PipelineTimer('context_cache_hit');
      try {
        session.conversationContext = JSON.parse(cached.formattedContext);
      } catch {
        session.conversationContext = null;
      }
      contextTimer.stop();
    }

    if (!session.conversationContext) {
      // Cache miss — full buildContext() call
      const contextTimer = new PipelineTimer('context_cache_miss');
      try {
        const fullCtx = await buildContext(characterId, session.playerId, worldId, sessionId, undefined, undefined, turnNumber);
        session.conversationContext = fullCtx.conversationContext;

        // Store full context in cache (turn 1 prompt for future cache hits)
        if (turnNumber === 1) {
          conversationContextCache.set(cacheKey, {
            messages: [],
            formattedContext: JSON.stringify(fullCtx.conversationContext),
            systemPrompt: fullCtx.conversationContext.systemPrompt,
          });
        }

        // Record context token count metric
        const sectionTokens = getLastPromptSectionTokens();
        if (sectionTokens) {
          getConversationMetrics().record('context_tokens', sectionTokens.total);
        }
      } catch {
        session.conversationContext = {
          systemPrompt: 'You are an NPC in a game world. Respond in character.',
          characterName: characterId,
        };
      }
      contextTimer.stop();
    }
  } else if (turnNumber >= 2) {
    // Follow-up turn with existing context — rebuild system prompt with trimmed content.
    // The expensive DB data is already cached; only the prompt text shrinks.
    try {
      const trimmedCtx = await buildContext(characterId, session.playerId, worldId, sessionId, undefined, undefined, turnNumber);
      session.conversationContext = {
        ...session.conversationContext,
        systemPrompt: trimmedCtx.conversationContext.systemPrompt,
      };

      const sectionTokens = getLastPromptSectionTokens();
      if (sectionTokens) {
        getConversationMetrics().record('context_tokens', sectionTokens.total);
      }
    } catch {
      // Keep existing full context if trimming fails
    }
  }

  // Notify ACTIVE state
  sendJSON(ws, { type: 'meta', sessionId, state: 'ACTIVE' });

  // Add user message to history
  addToHistory(session, 'user', text);

  // ── Speculative cache check (turn 1 only) ──────────────────────────
  // If player sends a likely opening message, serve the pre-generated response instantly.
  if (turnNumber === 1) {
    const specHit = speculativeCache.get(worldId, characterId, text);
    if (specHit) {
      const specTimer = new PipelineTimer('speculative_cache_hit');

      // Stream the cached response as text chunks (simulate streaming for client compat)
      sendJSON(ws, { type: 'text', text: specHit.text, isFinal: false, languageCode, sessionId });
      sendJSON(ws, { type: 'text', text: '', isFinal: true, languageCode, sessionId });

      // Send pre-generated TTS audio if available
      if (specHit.audio) {
        sendBinary(ws, specHit.audio);
        sendJSON(ws, { type: 'audio_meta', encoding: 'pcm', sampleRate: 24000, durationMs: 0 });
      }

      // Store in history
      addToHistory(session, 'assistant', specHit.text);
      const cacheKey = ConversationContextCache.chatKey(worldId, characterId, session.playerId);
      conversationContextCache.append(cacheKey, { role: 'user', content: text });
      conversationContextCache.append(cacheKey, { role: 'assistant', content: specHit.text });

      specTimer.stop();
      sendJSON(ws, { type: 'done' });

      // Kick off real LLM generation in background to validate/correct
      generateBackgroundCorrection(ws, text, session, worldId, characterId, languageCode, specHit.text, options).catch(() => {
        // Background correction is best-effort
      });
      return;
    } else {
      getConversationMetrics().record('speculative_cache_miss', 0);
    }
  }

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

  // Classify conversation to determine model tier
  const classification = classifyConversation({
    message: text,
    turnNumber,
    isQuestConversation: false,
    isNpcToNpc: false,
    cefrLevel: session.languageCode !== 'en' ? undefined : undefined,
    systemPrompt: session.conversationContext?.systemPrompt,
  });
  const modelTier: ModelTier = classification.tier;

  // Track tier-specific latency
  const tierFirstTokenStage = modelTier === 'fast' ? 'llm_fast_first_token' : 'llm_full_first_token' as const;
  const tierTotalStage = modelTier === 'fast' ? 'llm_fast_total' : 'llm_full_total' as const;
  const llmStartMs = Date.now();
  let firstTokenRecorded = false;

  try {
    const tokens = llmProvider.streamCompletion(text, session.conversationContext!, {
      languageCode,
      conversationHistory: session.history.slice(0, -1),
      modelTier,
    });

    for await (const token of tokens) {
      // Record first token latency (both general and tier-specific)
      if (!firstTokenRecorded) {
        const firstTokenMs = Date.now() - llmStartMs;
        getConversationMetrics().record('llm_first_token', firstTokenMs);
        getConversationMetrics().record(tierFirstTokenStage, firstTokenMs);
        firstTokenRecorded = true;
      }

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

    // Record total LLM latency (both general and tier-specific)
    const totalMs = Date.now() - llmStartMs;
    getConversationMetrics().record('llm_total', totalMs);
    getConversationMetrics().record(tierTotalStage, totalMs);
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

    // Append messages to context cache for follow-up continuity
    const cacheKey = ConversationContextCache.chatKey(worldId, characterId, session.playerId);
    conversationContextCache.append(cacheKey, { role: 'user', content: text });
    conversationContextCache.append(cacheKey, { role: 'assistant', content: fullResponse });
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

// ── NPC-to-NPC conversations ─────────────────────────────────────────

async function handleNpcToNpc(
  ws: WebSocket,
  msg: {
    npc1Id: string;
    npc2Id: string;
    worldId: string;
    topic?: string;
    languageCode?: string;
  },
  options: WSBridgeOptions,
): Promise<void> {
  const { npc1Id, npc2Id, worldId, topic, languageCode = 'en' } = msg;

  const sessionId = `npc-npc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startMs = Date.now();
  sendJSON(ws, { type: 'meta', sessionId, state: 'STARTED' });

  try {
    let llmProvider: IStreamingLLMProvider | undefined;
    try {
      llmProvider = options.llmProvider ?? getProvider();
    } catch {
      // LLM not available — engine will use fallback templates
    }

    // Track first line timing for latency metric
    let firstLineTime: number | null = null;

    // Resolve TTS provider once
    let ttsProvider: ITTSProvider | null = options.ttsProvider ?? null;
    if (!ttsProvider) {
      try {
        const ttsModule = await import('./tts/tts-provider.js');
        ttsProvider = ttsModule.getTTSProvider?.() ?? null;
      } catch { /* TTS not available */ }
    }

    const result = await initiateConversation(npc1Id, npc2Id, worldId, {
      topic: topic || undefined,
      languageCode,
      llmProvider,
      onLineReady: (speaker, speakerId, line, lineIndex) => {
        if (firstLineTime === null) {
          firstLineTime = Date.now() - startMs;
        }

        // Send per-line message immediately as each line is parsed
        sendJSON(ws, {
          type: 'npc_npc_line',
          sessionId,
          speaker,
          speakerId,
          line,
          lineIndex,
        });

        // TTS per line if enabled (using SentenceAccumulator pattern)
        if (ttsProvider) {
          const voice = assignVoiceProfile({});
          // Fire-and-forget TTS for each line
          (async () => {
            try {
              const audioChunks = ttsProvider!.synthesize(line, voice, { languageCode });
              for await (const chunk of audioChunks) {
                sendBinary(ws, chunk.data instanceof Uint8Array ? chunk.data : new Uint8Array(chunk.data));
                sendJSON(ws, {
                  type: 'audio_meta',
                  sessionId,
                  speakerId,
                  encoding: chunk.encoding,
                  sampleRate: chunk.sampleRate,
                  durationMs: chunk.durationMs,
                });
              }
            } catch (err: any) {
              console.error('[WS-Bridge] NpcToNpc TTS error:', err.message);
            }
          })();
        }
      },
    });

    // Also send full exchanges for clients that need the complete data
    for (const exchange of result.exchanges) {
      sendJSON(ws, {
        type: 'npc_exchange',
        sessionId,
        speakerId: exchange.speakerId,
        speakerName: exchange.speakerName,
        text: exchange.text,
        timestamp: exchange.timestamp,
      });
    }

    // Record first-line latency metric
    if (firstLineTime !== null) {
      getConversationMetrics().record('npc_npc_first_line', firstLineTime);
    }

    // Send relationship delta
    sendJSON(ws, {
      type: 'relationship_delta',
      sessionId,
      npc1Id,
      npc2Id,
      topic: result.topic,
      ...result.relationshipDelta,
      durationMs: result.durationMs,
    });

    sendJSON(ws, { type: 'meta', sessionId, state: 'ENDED' });
  } catch (err: any) {
    console.error('[WS-Bridge] NpcToNpc error:', err.message);
    sendJSON(ws, { type: 'error', message: err.message || 'NPC conversation failed' });
    sendJSON(ws, { type: 'meta', sessionId, state: 'ENDED' });
  }
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

// ── LLM context pre-warming ──────────────────────────────────────────

/**
 * Pre-warm the LLM context for an NPC before the player opens chat.
 * Builds context and caches it so that the first turn is instant.
 * Fire-and-forget — does not block the WebSocket message loop.
 */
async function handlePreWarm(
  ws: WebSocket,
  msg: { characterId: string; worldId: string; playerId: string },
): Promise<void> {
  const { characterId, worldId, playerId } = msg;
  const cacheKey = ConversationContextCache.chatKey(worldId, characterId, playerId);

  // Skip if already cached
  if (conversationContextCache.has(cacheKey)) {
    sendJSON(ws, { type: 'pre_warm_ack', characterId, status: 'already_cached' });
    return;
  }

  const timer = new PipelineTimer('pre_warm');
  try {
    const fullCtx = await buildContext(characterId, playerId, worldId, `prewarm-${Date.now()}`);
    conversationContextCache.set(cacheKey, {
      messages: [],
      formattedContext: JSON.stringify(fullCtx.conversationContext),
      systemPrompt: fullCtx.conversationContext.systemPrompt,
    });
    const elapsed = timer.stop();
    sendJSON(ws, { type: 'pre_warm_ack', characterId, status: 'warmed', durationMs: elapsed });

    // Fire-and-forget: generate speculative responses for likely openings
    generateSpeculativeResponses(worldId, characterId, fullCtx.conversationContext, {}).catch(() => {
      // Speculative generation is best-effort
    });
  } catch (err: any) {
    timer.stop();
    console.error('[WS-Bridge] Pre-warm error:', err.message);
    sendJSON(ws, { type: 'pre_warm_ack', characterId, status: 'error' });
  }
}

/**
 * Generate speculative responses for likely player openings using FAST tier.
 * Called after pre-warm context is built. Runs in background.
 */
async function generateSpeculativeResponses(
  worldId: string,
  characterId: string,
  context: ConversationContext,
  options: WSBridgeOptions,
): Promise<void> {
  // Skip if already have speculative entries for this NPC
  if (speculativeCache.has(worldId, characterId)) return;

  let llmProvider: IStreamingLLMProvider;
  try {
    llmProvider = options.llmProvider ?? getProvider();
  } catch {
    return;
  }

  // Resolve TTS provider for audio pre-generation
  let ttsProvider: ITTSProvider | null = options.ttsProvider ?? null;
  if (!ttsProvider) {
    try {
      const ttsModule = await import('./tts/tts-provider.js');
      ttsProvider = ttsModule.getTTSProvider?.() ?? null;
    } catch {
      // TTS not available
    }
  }

  const voiceProfile: VoiceProfile | undefined = ttsProvider
    ? assignVoiceProfile({ gender: (context as any)?.characterGender })
    : undefined;

  const specTimer = new PipelineTimer('speculative_generation');
  try {
    // TODO: derive CEFR level from context if available
    const cefrLevel = (context as any)?.cefrLevel;
    await speculativeCache.generate(worldId, characterId, context, llmProvider, cefrLevel, ttsProvider, voiceProfile);
  } catch {
    // Non-fatal
  }
  specTimer.stop();
}

/**
 * Background correction: after serving a speculative response, generate the
 * real LLM response. If it differs significantly, send a correction to the client.
 * This ensures accuracy while still providing instant first response.
 */
async function generateBackgroundCorrection(
  ws: WebSocket,
  text: string,
  session: any,
  worldId: string,
  characterId: string,
  languageCode: string,
  speculativeText: string,
  options: WSBridgeOptions,
): Promise<void> {
  let llmProvider: IStreamingLLMProvider;
  try {
    llmProvider = options.llmProvider ?? getProvider();
  } catch {
    return;
  }

  try {
    let realResponse = '';
    const tokens = llmProvider.streamCompletion(text, session.conversationContext!, {
      languageCode,
      conversationHistory: session.history.slice(0, -2), // exclude speculative pair
      modelTier: 'full' as ModelTier,
    });
    for await (const token of tokens) {
      realResponse += token;
    }

    if (!realResponse) return;

    // Check if responses differ significantly (>30% different by length ratio or content)
    const lengthRatio = Math.abs(realResponse.length - speculativeText.length) / Math.max(realResponse.length, speculativeText.length);
    const isDifferent = lengthRatio > 0.3 || !realResponse.toLowerCase().includes(speculativeText.substring(0, 20).toLowerCase());

    if (isDifferent) {
      // Send correction to client
      sendJSON(ws, {
        type: 'speculative_correction',
        correctedText: realResponse,
        languageCode,
      });

      // Update history with the corrected response
      if (session.history.length >= 2) {
        session.history[session.history.length - 1] = { role: 'assistant', content: realResponse };
      }

      // Update context cache
      const cacheKey = ConversationContextCache.chatKey(worldId, characterId, session.playerId);
      // Re-append corrected response (the cache append is additive, so we rebuild)
      conversationContextCache.append(cacheKey, { role: 'assistant', content: realResponse });
    }
  } catch {
    // Background correction failure is non-fatal
  }
}

// ── Greeting cache serving ───────────────────────────────────────────

/**
 * Serve a cached greeting instantly for a NEW conversation.
 * If a greeting is cached, sends it immediately via WebSocket.
 * The client can display this while the LLM pipeline builds the full context.
 */
function handleGreetingRequest(
  ws: WebSocket,
  msg: {
    characterId: string;
    worldId: string;
    cefrLevel?: string;
    context?: 'morning' | 'afternoon' | 'evening' | 'rainy' | 'general';
  },
): void {
  const { characterId, worldId, cefrLevel, context } = msg;

  const greeting = greetingCache.get(
    worldId,
    characterId,
    context,
    cefrLevel as CEFRLevel | undefined,
  );

  if (greeting) {
    const timer = new PipelineTimer('greeting_cache_hit');
    sendJSON(ws, {
      type: 'greeting',
      characterId,
      text: greeting,
      source: 'cache',
    });
    timer.stop();
  } else {
    const timer = new PipelineTimer('greeting_cache_miss');
    sendJSON(ws, {
      type: 'greeting',
      characterId,
      text: null,
      source: 'miss',
    });
    timer.stop();
  }
}

// ── Context cache invalidation ────────────────────────────────────────

/**
 * Invalidate cached context for a specific NPC conversation.
 * Called when CEFR level changes, quests change, relationships change,
 * or world time advances significantly.
 *
 * If characterId and playerId are provided, invalidates that specific conversation.
 * Otherwise, clears the entire cache (e.g., world time advance > 1 game hour).
 */
export function invalidateContextCache(
  worldId: string,
  characterId?: string,
  playerId?: string,
): void {
  if (characterId && playerId) {
    const key = ConversationContextCache.chatKey(worldId, characterId, playerId);
    conversationContextCache.delete(key);
  } else {
    // World-level invalidation — clear entire cache
    conversationContextCache.clear();
  }

  // Also invalidate greeting cache on context invalidation
  if (characterId) {
    greetingCache.invalidate(worldId, characterId);
  } else {
    greetingCache.invalidateWorld(worldId);
  }

  // Also invalidate speculative cache on context invalidation
  if (characterId) {
    speculativeCache.invalidate(worldId, characterId);
  } else {
    speculativeCache.invalidateWorld(worldId);
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
        } else if (message.npcToNpc) {
          const { npc1Id, npc2Id, worldId, topic, languageCode } = message.npcToNpc;
          await handleNpcToNpc(ws, { npc1Id, npc2Id, worldId, topic, languageCode }, options);
        } else if (message.invalidateContext) {
          // Cache invalidation: client signals context change (CEFR level, quest, relationship, time)
          const { worldId, characterId, playerId, reason } = message.invalidateContext;
          invalidateContextCache(worldId, characterId, playerId);
          // Also clear session context so next turn rebuilds
          if (currentSessionId) {
            const sess = getSession(currentSessionId);
            if (sess) sess.conversationContext = null;
          }
          sendJSON(ws, { type: 'context_invalidated', reason });
        } else if (message.preWarm) {
          // Pre-warm LLM context for an NPC before conversation starts
          const { characterId, worldId, playerId } = message.preWarm;
          // Fire-and-forget — don't await, let it run in background
          handlePreWarm(ws, { characterId, worldId, playerId }).catch((err: any) => {
            console.error('[WS-Bridge] Pre-warm background error:', err.message);
          });
        } else if (message.requestGreeting) {
          // Serve cached greeting instantly for new conversation
          const { characterId, worldId, cefrLevel, context } = message.requestGreeting;
          handleGreetingRequest(ws, { characterId, worldId, cefrLevel, context });
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
