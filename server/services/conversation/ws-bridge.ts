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
import './tts/gemini-tts-provider.js';
import type { IVisemeGenerator, VisemeQuality } from './viseme/viseme-generator.js';
import { createVisemeGenerator } from './viseme/viseme-generator.js';
import { resolveLanguageCode } from './tts/language-voices.js';
import { initiateConversation } from './npc-conversation-engine.js';
import {
  conversationContextCache,
  ConversationContextCache,
} from './conversation-context-cache.js';
import { PipelineTimer, getConversationMetrics, QUALITY_TIER_CONFIGS } from './conversation-metrics.js';
import type { QualityTierConfig } from './conversation-metrics.js';
import { greetingCache } from './greeting-cache.js';
import { classifyConversation } from './conversation-classifier.js';
import type { ModelTier } from './conversation-classifier.js';
import { speculativeCache, canonicalizeMessage } from './speculative-cache.js';
import { responseCache, ResponseCache, isCacheableMessage } from './response-cache.js';
import type { CEFRLevel } from '@shared/assessment/cefr-mapping';
import { prologLLMRouter } from '../prolog-llm-router.js';
import { classifyMessageComplexity } from './http-bridge.js';
import { compressConversationHistory, type GeminiMessage } from './conversation-compression.js';
import { GEMINI_MODELS } from '../../config/gemini.js';
import { getLiveSessionManager } from './live/live-session-manager.js';
import type { LiveSessionCallbacks } from './live/live-session-manager.js';
import { runSideChannel } from './live/live-side-channel.js';
import type { SideChannelContext } from './live/live-side-channel.js';

// ── Greeting/farewell classification ────────────────────────────────────

const GREETING_PATTERNS = /^(hello|hi|hey|bonjour|salut|bonsoir|hola|buenos?\s*d[ií]as|guten\s*tag|guten\s*morgen|hallo|good\s*(morning|afternoon|evening|day)|greetings|howdy|yo)\b/i;
const FAREWELL_PATTERNS = /^(bye|goodbye|farewell|au\s*revoir|adieu|adi[oó]s|hasta\s*(luego|la\s*vista)|auf\s*wiedersehen|tsch[uü]ss?|see\s*ya|later|take\s*care|good\s*night|bonne\s*nuit)\b/i;

function classifyGreetingFarewell(text: string): 'greeting' | 'farewell' | null {
  const trimmed = text.trim();
  if (GREETING_PATTERNS.test(trimmed)) return 'greeting';
  if (FAREWELL_PATTERNS.test(trimmed)) return 'farewell';
  return null;
}

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

/** Maps WebSocket connections to their active Live session IDs. */
const connectionLiveSessions = new Map<WebSocket, string>();

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
    prologFacts?: Array<{ predicate: string; args: Array<string | number> }>;
    systemPrompt?: string;
    cefrLevel?: string;
    playerVocabulary?: any[];
    playerGrammarPatterns?: any[];
  },
  options: WSBridgeOptions,
): Promise<void> {
  const { text, sessionId, characterId, worldId, languageCode: rawLangCode, prologFacts, systemPrompt: clientSystemPrompt, cefrLevel, playerVocabulary, playerGrammarPatterns } = msg;
  const languageCode = resolveLanguageCode(rawLangCode || 'en');

  // ── Live session routing ─────────────────────────────────────────────
  // If this WS connection has an active Live session, route text through it
  const liveSessionId = connectionLiveSessions.get(ws);
  if (liveSessionId) {
    const manager = getLiveSessionManager();
    const liveSession = manager.getSession(liveSessionId);
    if (liveSession && !liveSession.isClosed) {
      console.log(`[WS-Bridge] Routing text to Live session ${liveSessionId}`);
      sendJSON(ws, { type: 'meta', sessionId, state: 'ACTIVE' });
      liveSession.sendText(text);
      return;
    }
    // Live session gone — fall through to text+TTS pipeline
    connectionLiveSessions.delete(ws);
    console.log(`[WS-Bridge] Live session ${liveSessionId} expired, falling back to text+TTS`);
  }

  // Get or create session
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, characterId, worldId, sessionId, languageCode);
  }
  connectionSessions.set(ws, sessionId);

  // Derive turn number from conversation history (each turn = 1 user + 1 assistant message)
  const turnNumber = Math.floor(session.history.length / 2) + 1;
  const cacheKey = ConversationContextCache.chatKey(worldId, characterId, session.playerId);
  const hasPrologFacts = prologFacts && prologFacts.length > 0;
  const gameStateOverrides = {
    prologFacts,
    ...(cefrLevel ? { cefrLevel } : {}),
    ...(playerVocabulary ? { playerVocabulary } : {}),
    ...(playerGrammarPatterns ? { playerGrammarPatterns } : {}),
  };

  // Use client-provided system prompt if present
  if (clientSystemPrompt) {
    session.characterId = characterId;
    console.log(`[WS-Bridge] Using client-provided system prompt (${clientSystemPrompt.length} chars)`);
    session.conversationContext = {
      systemPrompt: clientSystemPrompt,
      characterName: session.conversationContext?.characterName ?? characterId,
      worldContext: session.conversationContext?.worldContext,
      characterGender: session.conversationContext?.characterGender,
    };
    // If we don't have characterName/worldContext yet, fetch them from buildContext
    if (!session.conversationContext.characterName || session.conversationContext.characterName === characterId) {
      try {
        const fullCtx = await buildContext(characterId, session.playerId, worldId, sessionId, undefined, gameStateOverrides, turnNumber);
        session.conversationContext.characterName = fullCtx.conversationContext.characterName;
        (session.conversationContext as any).worldContext = fullCtx.conversationContext.worldContext;
        (session.conversationContext as any).characterGender = fullCtx.conversationContext.characterGender;
      } catch {
        // Keep what we have — characterId as name is acceptable fallback
      }
    }
  } else if (!session.conversationContext || session.characterId !== characterId || hasPrologFacts) {
    // Build context on first message or character change, using cache when possible
    session.characterId = characterId;

    // Skip cache if prologFacts provided (they change per turn)
    const cached = !hasPrologFacts ? conversationContextCache.get(cacheKey) : undefined;

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
        const fullCtx = await buildContext(characterId, session.playerId, worldId, sessionId, undefined, gameStateOverrides, turnNumber);
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

  // ── Response cache check (generic messages only) ──────────────────
  // Check for cached responses to common greetings/farewells/social exchanges.
  const cefrForCache = (session.languageCode !== 'en' ? session.languageCode : 'A1') as string;
  const responseCacheKey = isCacheableMessage(text)
    ? ResponseCache.makeKey(characterId, cefrForCache, text, turnNumber)
    : null;

  if (responseCacheKey) {
    const cachedResp = responseCache.get(responseCacheKey);
    if (cachedResp) {
      const cacheTimer = new PipelineTimer('response_cache_hit');

      // Stream the cached response
      sendJSON(ws, { type: 'text', text: cachedResp.text, isFinal: false, languageCode, sessionId });
      sendJSON(ws, { type: 'text', text: '', isFinal: true, languageCode, sessionId });

      // Store in history
      addToHistory(session, 'assistant', cachedResp.text);
      const cacheKey = ConversationContextCache.chatKey(worldId, characterId, session.playerId);
      conversationContextCache.append(cacheKey, { role: 'user', content: text });
      conversationContextCache.append(cacheKey, { role: 'assistant', content: cachedResp.text });

      cacheTimer.stop();
      sendJSON(ws, { type: 'done' });
      return;
    } else {
      getConversationMetrics().record('response_cache_miss', 0);
    }
  }

  // Prolog-first routing: intercept greetings and farewells
  const greetingType = classifyGreetingFarewell(text);
  if (greetingType) {
    try {
      const prologResult = await prologLLMRouter.tryPrologFirst(worldId, greetingType, {
        speakerId: characterId,
      }, languageCode);
      if (prologResult.answered && prologResult.confidence >= 0.6 && prologResult.answer) {
        console.log(`[WS-Bridge] Prolog-first: ${text} -> answered (confidence: ${prologResult.confidence})`);
        const prologResponse = prologResult.answer;

        // Send the Prolog response as text
        sendJSON(ws, { type: 'text', text: prologResponse, isFinal: false, languageCode, sessionId });
        sendJSON(ws, { type: 'text', text: '', isFinal: true, languageCode, sessionId });

        // TTS for the Prolog response
        let ttsForProlog: ITTSProvider | null = options.ttsProvider ?? null;
        if (!ttsForProlog) {
          try {
            const ttsModule = await import('./tts/tts-provider.js');
            ttsForProlog = ttsModule.getTTSProvider?.() ?? null;
          } catch { /* TTS not available */ }
        }
        if (ttsForProlog) {
          const voice: VoiceProfile = assignVoiceProfile({
            gender: (session as any)?.conversationContext?.characterGender,
          });
          try {
            const audioChunks = ttsForProlog.synthesize(prologResponse, voice, {
              languageCode: languageCode || undefined,
            });
            for await (const chunk of audioChunks) {
              sendBinary(ws, chunk.data instanceof Uint8Array ? chunk.data : new Uint8Array(chunk.data));
              sendJSON(ws, {
                type: 'audio_meta',
                encoding: chunk.encoding,
                sampleRate: chunk.sampleRate,
                durationMs: chunk.durationMs,
              });
            }
          } catch (err: any) {
            console.error('[WS-Bridge] Prolog TTS error:', err.message);
          }
        }

        // Store in history and cache
        addToHistory(session, 'assistant', prologResponse);
        conversationContextCache.append(cacheKey, { role: 'user', content: text }, session.conversationContext?.systemPrompt);
        conversationContextCache.append(cacheKey, { role: 'assistant', content: prologResponse });

        sendJSON(ws, { type: 'done' });
        return;
      }
      console.log(`[WS-Bridge] Prolog-first: ${text} -> fell through to LLM`);
    } catch {
      // Prolog routing failed, fall through to LLM
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

  // Adaptive quality tier
  const metrics = getConversationMetrics();
  const tierConfig: QualityTierConfig = metrics.tierConfig;

  // Send current quality tier to client
  sendJSON(ws, { type: 'quality_tier', tier: metrics.qualityTier, config: tierConfig });

  // Attempt TTS + viseme (optional), respecting quality tier
  let ttsProvider: ITTSProvider | null = null;
  if (tierConfig.ttsBehavior !== 'disabled') {
    ttsProvider = options.ttsProvider ?? null;
    if (!ttsProvider) {
      try {
        const ttsModule = await import('./tts/tts-provider.js');
        ttsProvider = ttsModule.getTTSProvider?.() ?? null;
      } catch {
        // TTS not available
      }
    }
  }
  const effectiveVisemeQuality: VisemeQuality = tierConfig.visemeQuality === 'disabled'
    ? 'disabled'
    : (options.visemeQuality ?? tierConfig.visemeQuality as VisemeQuality);
  let visemeGen: IVisemeGenerator | null = null;
  if (effectiveVisemeQuality !== 'disabled') {
    try {
      visemeGen = options.visemeGenerator ?? createVisemeGenerator();
    } catch {
      // Viseme not available
    }
  }

  // Stream LLM tokens
  let fullResponse = '';
  let sentenceBuffer = '';
  // TTS serialization: chain promises so audio plays in sentence order
  let ttsChain: Promise<void> = Promise.resolve();
  let ttsSentenceCount = 0;

  const synthesizeSentence = (sentence: string) => {
    if (!ttsProvider) return;
    // In 'first_sentence' mode, only synthesize the first sentence
    if (tierConfig.ttsBehavior === 'first_sentence' && ttsSentenceCount >= 1) return;
    ttsSentenceCount++;
    const voice: VoiceProfile = assignVoiceProfile({
      gender: (session as any)?.conversationContext?.characterGender,
    });
    // Chain TTS calls sequentially so audio arrives in sentence order
    ttsChain = ttsChain.then(async () => {
      try {
        const audioChunks = ttsProvider!.synthesize(sentence, voice, {
          languageCode: languageCode || undefined,
        });
        for await (const chunk of audioChunks) {
          // Viseme data before audio
          if (visemeGen && effectiveVisemeQuality !== 'disabled') {
            const facialData = visemeGen.generateVisemes(sentence, chunk.durationMs, effectiveVisemeQuality);
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
    });
  };

  // ── Debug: log full LLM context sent for player-NPC chat (WS path) ──
  console.debug('[LLM:PlayerNPC:WS] ══════════════════════════════════════════');
  console.debug('[LLM:PlayerNPC:WS] Character:', session.conversationContext!.characterName);
  console.debug('[LLM:PlayerNPC:WS] Language code:', languageCode);
  console.debug('[LLM:PlayerNPC:WS] History length:', session.history.length - 1, 'messages');
  console.debug('[LLM:PlayerNPC:WS] ── SYSTEM PROMPT ──');
  console.debug(session.conversationContext!.systemPrompt);
  console.debug('[LLM:PlayerNPC:WS] ── USER MESSAGE ──');
  console.debug(text);
  console.debug('[LLM:PlayerNPC:WS] ── CONVERSATION HISTORY ──');
  for (const msg of session.history.slice(0, -1)) {
    console.debug(`  [${msg.role}] ${msg.content.slice(0, 200)}${msg.content.length > 200 ? '...' : ''}`);
  }
  console.debug('[LLM:PlayerNPC:WS] ══════════════════════════════════════════');

  // Classify conversation to determine model tier
  const classification = classifyConversation({
    message: text,
    turnNumber,
    isQuestConversation: false,
    isNpcToNpc: false,
    cefrLevel: session.languageCode !== 'en' ? undefined : undefined,
    systemPrompt: session.conversationContext?.systemPrompt,
  });
  // Quality tier can force FAST model for non-quest conversations
  const modelTier: ModelTier = tierConfig.modelTierOverride ?? classification.tier;

  // Track tier-specific latency
  const tierFirstTokenStage = modelTier === 'fast' ? 'llm_fast_first_token' : 'llm_full_first_token' as const;
  const tierTotalStage = modelTier === 'fast' ? 'llm_fast_total' : 'llm_full_total' as const;
  const llmStartMs = Date.now();
  let firstTokenRecorded = false;

  try {
    // Tiered model routing: simple messages → FLASH, complex → PRO
    const complexity = classifyMessageComplexity(text, session.history.length);
    const modelOverride = complexity === 'simple' ? GEMINI_MODELS.FLASH : undefined;
    console.log(`[WS-Bridge] Message complexity: ${complexity} -> ${complexity === 'simple' ? 'FLASH' : 'PRO'}`);

    const tokens = llmProvider.streamCompletion(text, session.conversationContext!, {
      languageCode,
      conversationHistory: session.history.slice(0, -1),
      modelTier,
      modelOverride,
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

  // Detect empty LLM response
  if (!fullResponse.trim()) {
    console.warn(`[WS-Bridge] WARNING: Empty LLM response for session ${sessionId}`);
    sendJSON(ws, { type: 'error', message: 'NPC response was empty. This may be due to safety filters or a temporary issue.' });
    const fallbackText = '*pauses and looks confused* ... Pardon, I lost my train of thought.';
    sendJSON(ws, { type: 'text', text: fallbackText, isFinal: true, languageCode, sessionId });
    fullResponse = fallbackText;
  } else {
    // Remaining sentence buffer
    if (ttsProvider && sentenceBuffer.trim()) {
      synthesizeSentence(sentenceBuffer.trim());
    }

    // Final text marker
    sendJSON(ws, { type: 'text', text: '', isFinal: true, languageCode, sessionId });
  }

  // Wait for TTS chain to complete
  await ttsChain;

  // Store response and append to context cache
  if (fullResponse) {
    addToHistory(session, 'assistant', fullResponse);

    // Append messages to context cache for follow-up continuity
    conversationContextCache.append(cacheKey, { role: 'user', content: text }, session.conversationContext?.systemPrompt);
    conversationContextCache.append(cacheKey, { role: 'assistant', content: fullResponse });

    // Cache the response for future identical exchanges (generic messages only)
    if (responseCacheKey) {
      responseCache.set(responseCacheKey, fullResponse);
    }

    // Update player-NPC relationship (fire-and-forget, non-fatal)
    const relExchangeCount = session.history.filter(h => h.role === 'user').length;
    const relAgreeableness = (session.conversationContext as any)?.characterPersonality?.agreeableness ?? 0.5;
    const relQuality = 0.02 + (relAgreeableness * 0.03) * (relExchangeCount / 5);
    import('../../extensions/tott/social-dynamics-system.js')
      .then(({ updateRelationship }) =>
        updateRelationship(characterId, session.playerId, relQuality, new Date().getFullYear())
      )
      .then(() => console.log(`[WS-Bridge] Relationship updated: ${characterId} += ${relQuality.toFixed(3)}`))
      .catch((err: any) => console.warn('[WS-Bridge] Relationship update failed (non-fatal):', err.message));
  }

  // Compress history if it exceeds threshold
  if (session.history.length > 20) {
    try {
      const geminiMessages: GeminiMessage[] = session.history.map(h => ({
        role: h.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: h.content }],
      }));
      const compressed = await compressConversationHistory(geminiMessages);
      const oldLength = session.history.length;
      session.history = compressed.map(m => ({
        role: m.role === 'model' ? 'assistant' as const : 'user' as const,
        content: m.parts.map(p => p.text).join(' '),
      }));
      console.log(`[WS-Bridge] Compressed history: ${oldLength} -> ${session.history.length} messages`);
    } catch (err: any) {
      console.warn('[WS-Bridge] History compression failed:', err.message);
    }
  }

  // ── Debug: log LLM response ──
  console.debug('[LLM:PlayerNPC:WS] ── RESPONSE ──');
  console.debug(fullResponse || '(empty response)');
  console.debug('[LLM:PlayerNPC:WS] ── END ──');

  sendJSON(ws, { type: 'done' });
}

// ── Live session handling ────────────────────────────────────────────

/**
 * Start a Gemini Live session for bidirectional audio streaming.
 * Creates callbacks that map Live session events to WS messages.
 */
async function handleStartLiveSession(
  ws: WebSocket,
  msg: {
    characterId: string;
    worldId: string;
    sessionId: string;
    systemPrompt?: string;
    voiceName?: string;
    languageCode?: string;
    targetLanguage?: string;
    playerProficiency?: string;
    activeQuests?: any[];
    activeObjectives?: any[];
  },
): Promise<void> {
  const { characterId, worldId, sessionId, systemPrompt, voiceName, languageCode, targetLanguage, playerProficiency, activeQuests, activeObjectives } = msg;
  const resolvedLangCode = resolveLanguageCode(languageCode || 'en');

  // Build system prompt if not provided
  let prompt = systemPrompt || '';
  if (!prompt) {
    try {
      const playerId = sessionId; // WS bridge uses sessionId as playerId
      const fullCtx = await buildContext(characterId, playerId, worldId, sessionId);
      prompt = fullCtx.conversationContext.systemPrompt;
    } catch {
      prompt = 'You are an NPC in a game world. Respond in character.';
    }
  }

  // Get or create the conversation session for history tracking
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, characterId, worldId, sessionId, resolvedLangCode);
  }
  connectionSessions.set(ws, sessionId);

  // Track turn count for side-channel analysis; player message comes from
  // the LiveConversationSession (set by sendText or transcription callback)
  let liveSessionRef: { lastPlayerMessage: string } | null = null;
  let turnCount = 0;

  // Build side-channel context for parallel language analysis
  const sideChannelCtx: SideChannelContext = {
    targetLanguage: targetLanguage || '',
    playerProficiency: playerProficiency,
    activeQuests: activeQuests,
    activeObjectives: activeObjectives,
    npcCharacterId: characterId,
    conversationTurnCount: 0,
  };

  // Wire Live session callbacks to WS events
  const callbacks: LiveSessionCallbacks = {
    onAudioChunk: (data: string, mimeType: string) => {
      // Send base64-decoded audio as binary frame
      sendBinary(ws, Buffer.from(data, 'base64'));
      // Parse sample rate from mimeType (e.g. 'audio/pcm;rate=24000')
      const rateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      sendJSON(ws, {
        type: 'audio_meta',
        encoding: 'pcm',
        sampleRate,
        durationMs: 0,
      });
    },
    onTextChunk: (text: string) => {
      sendJSON(ws, { type: 'text', text, isFinal: false, languageCode: resolvedLangCode, sessionId });
    },
    onTurnComplete: (fullText: string) => {
      // Final text marker
      sendJSON(ws, { type: 'text', text: '', isFinal: true, languageCode: resolvedLangCode, sessionId });
      // Store in conversation history
      if (fullText) {
        addToHistory(session, 'assistant', fullText);
      }
      sendJSON(ws, { type: 'done' });

      // Fork side-channel language analysis (fire-and-forget, never blocks audio)
      if (fullText && sideChannelCtx.targetLanguage) {
        turnCount++;
        sideChannelCtx.conversationTurnCount = turnCount;
        const playerMsg = liveSessionRef?.lastPlayerMessage || '';
        runSideChannel(playerMsg, fullText, sideChannelCtx, {
          onVocabHints: (hints) => {
            sendJSON(ws, { type: 'vocab_hints', hints, sessionId });
          },
          onGrammarFeedback: (feedback) => {
            sendJSON(ws, { type: 'grammar_feedback', feedback, sessionId });
          },
          onEval: (scores) => {
            sendJSON(ws, { type: 'eval', scores, sessionId });
          },
          onQuestProgress: (triggers, markerContent) => {
            sendJSON(ws, { type: 'quest_progress', triggers, content: markerContent, sessionId });
          },
          onGoalEvaluation: (evaluations) => {
            sendJSON(ws, { type: 'goal_evaluation', evaluations, sessionId });
          },
        });
      }
    },
    onInterrupted: () => {
      sendJSON(ws, { type: 'interrupted', sessionId });
    },
    onTranscription: (text: string) => {
      sendJSON(ws, { type: 'transcript', text, sessionId });
      // Store player's transcribed speech in history
      if (text.trim()) {
        addToHistory(session, 'user', text.trim());
        // Also set on session ref so side-channel can read it
        if (liveSessionRef) {
          liveSessionRef.lastPlayerMessage = text.trim();
        }
      }
    },
    onGenerationComplete: () => {
      // No additional action needed — turnComplete already sends 'done'
    },
  };

  try {
    const manager = getLiveSessionManager();
    const liveSession = await manager.createSession(
      {
        systemPrompt: prompt,
        voiceName,
        languageCode: resolvedLangCode,
        characterId,
        worldId,
        playerId: sessionId,
      },
      callbacks,
    );

    // Track the live session for this WS connection and side-channel
    connectionLiveSessions.set(ws, liveSession.id);
    liveSessionRef = liveSession;

    console.log(`[WS-Bridge] Live session ${liveSession.id} started for character ${characterId}`);
    sendJSON(ws, { type: 'live_session_started', sessionId, liveSessionId: liveSession.id });
  } catch (err: any) {
    console.error('[WS-Bridge] Failed to start Live session:', err.message);
    sendJSON(ws, { type: 'error', message: `Live session failed: ${err.message}` });
  }
}

/**
 * Handle audio input routed directly to a Live session.
 */
function handleLiveAudioInput(
  ws: WebSocket,
  data: string,
): void {
  const liveSessionId = connectionLiveSessions.get(ws);
  if (!liveSessionId) {
    sendJSON(ws, { type: 'error', message: 'No active Live session' });
    return;
  }
  const manager = getLiveSessionManager();
  const liveSession = manager.getSession(liveSessionId);
  if (!liveSession) {
    connectionLiveSessions.delete(ws);
    sendJSON(ws, { type: 'error', message: 'Live session expired' });
    return;
  }
  liveSession.sendAudio(data);
}

/**
 * End the Live session for a WebSocket connection.
 */
function handleEndLiveSession(ws: WebSocket): void {
  const liveSessionId = connectionLiveSessions.get(ws);
  if (liveSessionId) {
    const manager = getLiveSessionManager();
    manager.endSession(liveSessionId);
    connectionLiveSessions.delete(ws);
    console.log(`[WS-Bridge] Live session ${liveSessionId} ended`);
    sendJSON(ws, { type: 'live_session_ended', liveSessionId });
  }
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
      // Serve template instantly while LLM generates
      onTemplateReady: (templateExchanges) => {
        sendJSON(ws, {
          type: 'npc_npc_template',
          sessionId,
          source: 'template',
          exchanges: templateExchanges.map((e) => ({
            speakerId: e.speakerId,
            speakerName: e.speakerName,
            text: e.text,
            timestamp: e.timestamp,
          })),
        });
      },
      // Replace template with LLM-generated content when ready
      onReplacementReady: (llmExchanges) => {
        sendJSON(ws, {
          type: 'npc_npc_replace',
          sessionId,
          source: 'llm',
          exchanges: llmExchanges.map((e) => ({
            speakerId: e.speakerId,
            speakerName: e.speakerName,
            text: e.text,
            timestamp: e.timestamp,
          })),
        });
      },
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

    // Send relationship delta with source info
    sendJSON(ws, {
      type: 'relationship_delta',
      sessionId,
      npc1Id,
      npc2Id,
      topic: result.topic,
      source: result.source,
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
  let server: WebSocketServer;

  if (options.httpServer) {
    // Use noServer mode + manual upgrade handling to avoid conflicts with
    // Vite's middleware-mode upgrade handler on the same HTTP server.
    server = new WebSocketServer({ noServer: true });

    options.httpServer.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
      if (pathname === '/ws/conversation') {
        server.handleUpgrade(request, socket, head, (ws) => {
          server.emit('connection', ws, request);
        });
      }
      // Other upgrade requests (Vite HMR, etc.) are left unhandled here
      // so their respective handlers can pick them up.
    });
  } else {
    server = new WebSocketServer({
      port: options.port ?? parseInt(process.env.WS_BRIDGE_PORT ?? '50052', 10),
    });
  }
  wss = server;

  server.on('connection', (ws: WebSocket) => {
    let currentSessionId: string | null = null;

    ws.on('message', async (raw: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
      try {
        if (isBinary) {
          // Binary frame = audio data
          const data = raw instanceof Buffer ? new Uint8Array(raw) : new Uint8Array(raw as ArrayBuffer);

          // If there's an active Live session, route audio directly to it
          const activeLiveId = connectionLiveSessions.get(ws);
          if (activeLiveId) {
            const liveManager = getLiveSessionManager();
            const liveSess = liveManager.getSession(activeLiveId);
            if (liveSess && !liveSess.isClosed) {
              const base64 = Buffer.from(data).toString('base64');
              liveSess.sendAudio(base64);
              return;
            }
            // Live session gone — fall through to buffered audio path
            connectionLiveSessions.delete(ws);
          }

          if (currentSessionId) {
            handleAudioChunk(ws, data, currentSessionId);
          }
          return;
        }

        // Text frame = JSON message
        const message = JSON.parse(raw.toString());

        if (message.textInput) {
          const { text, sessionId, characterId, worldId, languageCode, prologFacts, systemPrompt, cefrLevel, playerVocabulary, playerGrammarPatterns } = message.textInput;
          currentSessionId = sessionId;
          await handleTextInput(ws, { text, sessionId, characterId, worldId, languageCode, prologFacts, systemPrompt, cefrLevel, playerVocabulary, playerGrammarPatterns }, options);
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
        } else if (message.startLiveSession) {
          // Start a Gemini Live session for bidirectional audio streaming
          const { characterId, worldId, sessionId, systemPrompt, voiceName, languageCode, targetLanguage, playerProficiency, activeQuests, activeObjectives } = message.startLiveSession;
          currentSessionId = sessionId;
          await handleStartLiveSession(ws, { characterId, worldId, sessionId, systemPrompt, voiceName, languageCode, targetLanguage, playerProficiency, activeQuests, activeObjectives });
        } else if (message.audioInput) {
          // Relay mic audio to the active Live session
          const { data } = message.audioInput;
          if (data) {
            handleLiveAudioInput(ws, data);
          }
        } else if (message.endLiveSession) {
          // Tear down the Live session
          handleEndLiveSession(ws);
        } else if (message.resumeSession) {
          // Reconnection or initial connect: client provides sessionId
          const { sessionId } = message.resumeSession;
          currentSessionId = sessionId;
          const session = getSession(sessionId);
          if (session) {
            connectionSessions.set(ws, sessionId);
            session.lastActivity = Date.now();
            sendJSON(ws, { type: 'meta', sessionId, state: 'ACTIVE' });
            sendJSON(ws, {
              type: 'session_restored',
              sessionId,
              historyLength: session.history.length,
            });
          } else {
            // New session — acknowledge without error. Session will be
            // created on the first textInput message.
            sendJSON(ws, { type: 'meta', sessionId, state: 'ACTIVE' });
          }
        }
      } catch (err: any) {
        console.error('[WS-Bridge] Message handling error:', err.message);
        sendJSON(ws, { type: 'error', message: err.message || 'Internal error' });
      }
    });

    ws.on('close', () => {
      // Don't delete the conversation session — allow reconnection
      connectionSessions.delete(ws);
      // End Live session on disconnect
      handleEndLiveSession(ws);
    });

    ws.on('error', (err: Error) => {
      console.error('[WS-Bridge] Connection error:', err.message);
      connectionSessions.delete(ws);
      handleEndLiveSession(ws);
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

export { connectionSessions, connectionLiveSessions, audioBuffers };
