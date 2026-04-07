/**
 * HTTP/SSE Bridge for the Conversation Service
 *
 * Provides Express endpoints that bridge HTTP clients to the gRPC conversation
 * pipeline (LLM streaming, TTS, viseme generation). Clients connect via SSE
 * (Server-Sent Events) for streaming responses.
 *
 * This enables browser clients (like BabylonChatPanel) to use the conversation
 * service without needing a gRPC-Web proxy.
 */

import type { Request, Response, Express } from 'express';
import {
  getSession,
  createSession,
  endSession as endSessionFn,
} from './grpc-server.js';
import { getProvider } from './providers/provider-registry.js';
import { buildContext } from './context-manager.js';
import type { IStreamingLLMProvider, ConversationContext } from './providers/llm-provider.js';
import type { ITTSProvider, VoiceProfile } from './tts/tts-provider.js';
import { splitAtSentenceBoundaries, assignVoiceProfile, getTTSProvider } from './tts/tts-provider.js';
// Side-effect import: registers 'google' TTS provider in the provider registry
import './tts/google-tts-provider.js';
import './tts/gemini-tts-provider.js';
import type { IVisemeGenerator, VisemeQuality } from './viseme/viseme-generator.js';
import { createVisemeGenerator } from './viseme/viseme-generator.js';
import { PipelineTimer, getConversationMetrics, QUALITY_TIER_CONFIGS } from './conversation-metrics.js';
import type { QualityTierConfig } from './conversation-metrics.js';
import { responseCache } from './response-cache.js';
import { analyzeConversation } from './quest-trigger-analyzer.js';
import type { ActiveQuest } from './quest-trigger-analyzer.js';
import { cleanForSpeech } from './streaming-chat.js';
import { conversationContextCache, ConversationContextCache } from './conversation-context-cache.js';
import { compressConversationHistory, type GeminiMessage } from './conversation-compression.js';
import { prologLLMRouter } from '../prolog-llm-router.js';
import { GEMINI_MODELS } from '../../config/gemini.js';
import { getLiveSessionManager } from './live/live-session-manager.js';
import type { LiveSessionCallbacks } from './live/live-session-manager.js';
import { runSideChannel } from './live/live-side-channel.js';
import type { SideChannelContext, SideChannelCallbacks } from './live/live-side-channel.js';

// ── Message complexity classification ───────────────────────────────────

/**
 * Classify message as 'simple' or 'complex' for tiered model routing.
 * Simple: short messages with history (continuation), no question marks or quest keywords.
 * Complex: everything else — defaults to PRO model.
 */
export function classifyMessageComplexity(
  text: string,
  historyLength: number,
): 'simple' | 'complex' {
  const wordCount = text.trim().split(/\s+/).length;
  const hasQuestion = text.includes('?');
  const questKeywords = /quest|mission|task|objective|help|explain|tell me|how|why|what|where|who|history/i;
  const hasQuestKeyword = questKeywords.test(text);

  if (wordCount < 15 && historyLength > 2 && !hasQuestion && !hasQuestKeyword) {
    return 'simple';
  }
  return 'complex';
}

// ── Greeting/farewell classification ────────────────────────────────────

const GREETING_PATTERNS = /^(hello|hi|hey|bonjour|salut|bonsoir|hola|buenos?\s*d[ií]as|guten\s*tag|guten\s*morgen|hallo|good\s*(morning|afternoon|evening|day)|greetings|howdy|yo)\b/i;
const FAREWELL_PATTERNS = /^(bye|goodbye|farewell|au\s*revoir|adieu|adi[oó]s|hasta\s*(luego|la\s*vista)|auf\s*wiedersehen|tsch[uü]ss?|see\s*ya|later|take\s*care|good\s*night|bonne\s*nuit)\b/i;

function classifyGreetingFarewell(text: string): 'greeting' | 'farewell' | null {
  const trimmed = text.trim();
  if (GREETING_PATTERNS.test(trimmed)) return 'greeting';
  if (FAREWELL_PATTERNS.test(trimmed)) return 'farewell';
  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function sendSSE(res: Response, data: object): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/** Marker block names and their opening/closing tags */
const MARKER_BLOCKS = [
  { open: '**VOCAB_HINTS**', close: '**END_VOCAB**', type: 'vocab_hints' },
  { open: '**GRAMMAR_FEEDBACK**', close: '**END_GRAMMAR**', type: 'grammar_feedback' },
  { open: '**QUEST_ASSIGN**', close: '**END_QUEST**', type: 'quest_assign' },
  { open: '**EVAL**', close: '**END_EVAL**', type: 'eval' },
  { open: '**QUEST_PROGRESS**', close: '**END_QUEST_PROGRESS**', type: 'quest_progress' },
] as const;

// cleanForTTS consolidated into cleanForSpeech imported from streaming-chat.ts
const cleanForTTS = cleanForSpeech;

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

// ── Main streaming pipeline ──────────────────────────────────────────────

async function streamTextResponse(
  res: Response,
  text: string,
  sessionId: string,
  characterId: string,
  worldId: string,
  languageCode: string,
  activeQuests?: ActiveQuest[],
  prologFacts?: Array<{ predicate: string; args: Array<string | number> }>,
  clientSystemPrompt?: string,
  clientCharacterGender?: string,
  clientGameState?: { cefrLevel?: string; playerVocabulary?: any[]; playerGrammarPatterns?: any[] },
): Promise<void> {
  const metrics = getConversationMetrics();
  const e2eTimer = new PipelineTimer('end_to_end');

  // Get or create session
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, characterId, worldId, sessionId, languageCode);
  }

  // Check context cache key for later use
  const cacheKey = ConversationContextCache.chatKey(worldId, characterId, session.playerId);

  // Always use the client-provided system prompt if present (it has the latest
  // language directives, CEFR modes, scaffolding, etc.)
  if (clientSystemPrompt) {
    if (!session.conversationContext) {
      session.conversationContext = {
        systemPrompt: clientSystemPrompt,
        characterName: characterId,
        characterGender: clientCharacterGender || undefined,
      } as any;
    } else {
      // Update the prompt on an existing session (may have changed since last turn)
      session.conversationContext.systemPrompt = clientSystemPrompt;
      if (clientCharacterGender) {
        (session.conversationContext as any).characterGender = clientCharacterGender;
      }
    }
    session.characterId = characterId;
    // If we don't have characterName/worldContext yet, fetch them from buildContext
    if (!session.conversationContext!.characterName || session.conversationContext!.characterName === characterId) {
      try {
        const fullCtx = await buildContext(characterId, session.playerId, worldId, sessionId, undefined, {
          prologFacts,
          ...(clientGameState?.cefrLevel ? { cefrLevel: clientGameState.cefrLevel } : {}),
          ...(clientGameState?.playerVocabulary ? { playerVocabulary: clientGameState.playerVocabulary } : {}),
          ...(clientGameState?.playerGrammarPatterns ? { playerGrammarPatterns: clientGameState.playerGrammarPatterns } : {}),
        });
        session.conversationContext!.characterName = fullCtx.conversationContext.characterName;
        (session.conversationContext as any).worldContext = fullCtx.conversationContext.worldContext;
        (session.conversationContext as any).characterGender = fullCtx.conversationContext.characterGender;
      } catch {
        // Keep what we have — characterId as name is acceptable fallback
      }
    }
  } else {
    // No client prompt — build server-side context on first message or character change
    const hasPrologFacts = prologFacts && prologFacts.length > 0;
    const needsRebuild = !session.conversationContext || session.characterId !== characterId || hasPrologFacts;
    if (needsRebuild) {
      session.characterId = characterId;
      const ctxTimer = new PipelineTimer('context');

      // Try cache first (skip if prologFacts provided — those change per turn)
      const cached = !hasPrologFacts ? conversationContextCache.get(cacheKey) : undefined;
      if (cached?.systemPrompt) {
        console.log(`[ConversationBridge] Context cache HIT for ${cacheKey}`);
        session.conversationContext = {
          systemPrompt: cached.systemPrompt,
          characterName: cached.formattedContext || characterId,
        };
      } else {
        console.log(`[ConversationBridge] Context cache MISS for ${cacheKey}`);
        try {
          const fullCtx = await buildContext(characterId, session.playerId, worldId, sessionId, undefined, {
            prologFacts,
            ...(clientGameState?.cefrLevel ? { cefrLevel: clientGameState.cefrLevel } : {}),
            ...(clientGameState?.playerVocabulary ? { playerVocabulary: clientGameState.playerVocabulary } : {}),
            ...(clientGameState?.playerGrammarPatterns ? { playerGrammarPatterns: clientGameState.playerGrammarPatterns } : {}),
          });
          session.conversationContext = fullCtx.conversationContext;

          // Cache the built context
          conversationContextCache.set(cacheKey, {
            messages: [],
            systemPrompt: fullCtx.conversationContext.systemPrompt,
            formattedContext: fullCtx.conversationContext.characterName,
          });
        } catch {
          session.conversationContext = {
            systemPrompt: 'You are an NPC in a game world. Respond in character.',
            characterName: characterId,
          };
        }
      }
      ctxTimer.stop();
    }
  }

  // Add user message to history
  addToHistory(session, 'user', text);

  // Prolog-first routing: intercept greetings and farewells
  const greetingType = classifyGreetingFarewell(text);
  if (greetingType) {
    try {
      const prologResult = await prologLLMRouter.tryPrologFirst(worldId, greetingType, {
        speakerId: characterId,
      }, languageCode);
      if (prologResult.answered && prologResult.confidence >= 0.6 && prologResult.answer) {
        console.log(`[ConversationBridge] Prolog-first: ${text} -> answered (confidence: ${prologResult.confidence})`);
        const prologResponse = prologResult.answer;

        // Send the Prolog response as text
        sendSSE(res, { type: 'text', text: prologResponse, isFinal: false });
        sendSSE(res, { type: 'text', text: '', isFinal: true });

        // TTS for the Prolog response
        let ttsProvider: ITTSProvider | null = null;
        try { ttsProvider = getTTSProvider(); } catch { /* TTS not available */ }
        if (ttsProvider) {
          const voice: VoiceProfile = assignVoiceProfile({
            gender: (session as any)?.conversationContext?.characterGender,
          });
          try {
            const audioChunks = ttsProvider.synthesize(prologResponse, voice, {
              languageCode: languageCode || undefined,
            });
            for await (const chunk of audioChunks) {
              const base64 = Buffer.from(chunk.data).toString('base64');
              sendSSE(res, {
                type: 'audio',
                data: base64,
                encoding: chunk.encoding,
                sampleRate: chunk.sampleRate,
                durationMs: chunk.durationMs,
              });
            }
          } catch (err: any) {
            console.error('[ConversationBridge] Prolog TTS error:', err.message);
          }
        }

        // Store in history and cache
        addToHistory(session, 'assistant', prologResponse);
        conversationContextCache.append(cacheKey, { role: 'user', content: text }, session.conversationContext?.systemPrompt);
        conversationContextCache.append(cacheKey, { role: 'assistant', content: prologResponse });

        e2eTimer.stop();
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      console.log(`[ConversationBridge] Prolog-first: ${text} -> fell through to LLM`);
    } catch {
      // Prolog routing failed, fall through to LLM
    }
  }

  // Get LLM provider
  let llmProvider: IStreamingLLMProvider;
  try {
    llmProvider = getProvider();
  } catch {
    sendSSE(res, { type: 'error', message: 'LLM provider not available' });
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // Adaptive quality tier
  const tierConfig: QualityTierConfig = metrics.tierConfig;

  // Send quality tier info as first SSE event
  sendSSE(res, { type: 'quality_tier', tier: metrics.qualityTier, config: tierConfig });

  // Attempt TTS + viseme setup (optional — gracefully skip if unavailable)
  let ttsProvider: ITTSProvider | null = null;
  let visemeGen: IVisemeGenerator | null = null;
  if (tierConfig.ttsBehavior !== 'disabled') {
    try {
      ttsProvider = getTTSProvider();
    } catch {
      // TTS not available — text-only mode
    }
  }
  if (tierConfig.visemeQuality !== 'disabled') {
    try {
      visemeGen = createVisemeGenerator();
    } catch {
      // Viseme generation not available
    }
  }

  // Stream LLM tokens
  let fullResponse = '';
  let sentenceBuffer = '';
  // TTS serialization: chain promises so audio plays in sentence order
  let ttsChain: Promise<void> = Promise.resolve();
  let ttsSentenceCount = 0;

  // Adaptive quality: use tier-based viseme quality
  const effectiveVisemeQuality = tierConfig.visemeQuality;

  const synthesizeSentence = (sentence: string) => {
    if (!ttsProvider) return;
    // Strip ALL non-spoken content before TTS
    const stripped = cleanForTTS(sentence);
    if (!stripped) return;
    // In 'first_sentence' mode, only synthesize the first sentence
    if (tierConfig.ttsBehavior === 'first_sentence' && ttsSentenceCount >= 1) return;
    ttsSentenceCount++;
    const voice: VoiceProfile = assignVoiceProfile({
      gender: (session as any)?.conversationContext?.characterGender,
    });
    // Chain TTS calls sequentially so audio arrives in sentence order
    ttsChain = ttsChain.then(async () => {
      const ttsTimer = new PipelineTimer('tts_total');
      let firstChunkRecorded = false;
      const ttsFirstChunkTimer = new PipelineTimer('tts_first_chunk');
      try {
        const audioChunks = ttsProvider!.synthesize(stripped, voice, {
          languageCode: languageCode || undefined,
        });
        for await (const chunk of audioChunks) {
          if (!firstChunkRecorded) {
            ttsFirstChunkTimer.stop();
            firstChunkRecorded = true;
          }

          // Send viseme data before audio
          if (visemeGen) {
            const visemeTimer = new PipelineTimer('viseme');
            const facialData = visemeGen.generateVisemes(stripped, chunk.durationMs, effectiveVisemeQuality as any);
            visemeTimer.stop();
            if (facialData.visemes.length > 0) {
              sendSSE(res, { type: 'facial', visemes: facialData.visemes });
            }
          }

          // Send audio as base64
          const base64 = Buffer.from(chunk.data).toString('base64');
          sendSSE(res, {
            type: 'audio',
            data: base64,
            encoding: chunk.encoding,
            sampleRate: chunk.sampleRate,
            durationMs: chunk.durationMs,
          });
        }
      } catch (err: any) {
        console.error('[ConversationBridge] TTS error:', err.message);
      }
      if (!firstChunkRecorded) ttsFirstChunkTimer.stop();
      ttsTimer.stop();
    });
  };

  const llmTotalTimer = new PipelineTimer('llm_total');
  const llmFirstTokenTimer = new PipelineTimer('llm_first_token');
  let firstTokenRecorded = false;

  // Track whether we're inside a marker block so we can route
  // marker content as metadata events instead of text/TTS.
  let insideMarkerBlock: (typeof MARKER_BLOCKS)[number] | null = null;
  let markerBuffer = '';       // accumulates content inside a marker block
  let dialogueBuffer = '';     // accumulates tokens outside marker blocks (for text SSE)

  // ── Debug: log full LLM context sent for player-NPC chat (SSE path) ──
  console.debug('[LLM:PlayerNPC:SSE] ══════════════════════════════════════════');
  console.debug('[LLM:PlayerNPC:SSE] Character:', session.conversationContext!.characterName);
  console.debug('[LLM:PlayerNPC:SSE] Language code:', languageCode);
  console.debug('[LLM:PlayerNPC:SSE] History length:', session.history.length - 1, 'messages');
  console.debug('[LLM:PlayerNPC:SSE] ── SYSTEM PROMPT ──');
  console.debug(session.conversationContext!.systemPrompt);
  console.debug('[LLM:PlayerNPC:SSE] ── USER MESSAGE ──');
  console.debug(text);
  console.debug('[LLM:PlayerNPC:SSE] ── CONVERSATION HISTORY ──');
  for (const msg of session.history.slice(0, -1)) {
    console.debug(`  [${msg.role}] ${msg.content.slice(0, 200)}${msg.content.length > 200 ? '...' : ''}`);
  }
  console.debug('[LLM:PlayerNPC:SSE] ══════════════════════════════════════════');

  try {
    // Tiered model routing: simple messages → FLASH, complex → PRO
    const complexity = classifyMessageComplexity(text, session.history.length);
    const modelOverride = complexity === 'simple' ? GEMINI_MODELS.FLASH : undefined;
    console.log(`[ConversationBridge] Message complexity: ${complexity} -> ${complexity === 'simple' ? 'FLASH' : 'PRO'}`);

    const tokens = llmProvider.streamCompletion(text, session.conversationContext!, {
      languageCode,
      conversationHistory: session.history.slice(0, -1),
      modelOverride,
    });

    for await (const token of tokens) {
      if (!firstTokenRecorded) {
        llmFirstTokenTimer.stop();
        firstTokenRecorded = true;
      }
      fullResponse += token;
      dialogueBuffer += token;

      // Check if we're entering a marker block
      if (!insideMarkerBlock) {
        for (const block of MARKER_BLOCKS) {
          const openIdx = dialogueBuffer.indexOf(block.open);
          if (openIdx !== -1) {
            // Send any dialogue text BEFORE the marker as a text event
            const preMarker = dialogueBuffer.slice(0, openIdx);
            if (preMarker) {
              sendSSE(res, { type: 'text', text: preMarker, isFinal: false });
              // Also feed pre-marker text to TTS sentence buffer
              if (ttsProvider) {
                sentenceBuffer += preMarker;
                const sentences = splitAtSentenceBoundaries(sentenceBuffer);
                if (sentences.length > 1) {
                  for (let i = 0; i < sentences.length - 1; i++) {
                    synthesizeSentence(sentences[i]);
                  }
                  sentenceBuffer = sentences[sentences.length - 1];
                }
              }
            }
            // Start accumulating marker content (after the opening tag)
            markerBuffer = dialogueBuffer.slice(openIdx + block.open.length);
            dialogueBuffer = '';
            insideMarkerBlock = block;
            break;
          }
        }

        // If not inside a marker, stream dialogue text normally
        if (!insideMarkerBlock) {
          // Only emit text when we have a reasonable chunk (avoid per-token SSE for markers that may be building)
          // Check if buffer might be starting a marker (starts with **)
          const mightBeMarker = dialogueBuffer.trimStart().startsWith('**') && !dialogueBuffer.includes('\n');
          if (!mightBeMarker || dialogueBuffer.length > 30) {
            sendSSE(res, { type: 'text', text: dialogueBuffer, isFinal: false });
            // Feed to TTS sentence buffer
            if (ttsProvider) {
              sentenceBuffer += dialogueBuffer;
              const sentences = splitAtSentenceBoundaries(sentenceBuffer);
              if (sentences.length > 1) {
                for (let i = 0; i < sentences.length - 1; i++) {
                  synthesizeSentence(sentences[i]);
                }
                sentenceBuffer = sentences[sentences.length - 1];
              }
            }
            dialogueBuffer = '';
          }
        }
      } else {
        // Inside a marker block — accumulate content until closing tag
        markerBuffer += token;
        dialogueBuffer = ''; // Don't send marker content as dialogue

        if (markerBuffer.includes(insideMarkerBlock.close)) {
          // Extract content before the closing tag
          const closeIdx = markerBuffer.indexOf(insideMarkerBlock.close);
          const content = markerBuffer.slice(0, closeIdx).trim();
          const afterClose = markerBuffer.slice(closeIdx + insideMarkerBlock.close.length);

          // Send as a metadata event — NOT text, NOT TTS
          sendSSE(res, { type: insideMarkerBlock.type, content });

          // Reset — anything after the closing tag is regular dialogue
          insideMarkerBlock = null;
          markerBuffer = '';
          dialogueBuffer = afterClose;
        }
      }
    }
  } catch (err: any) {
    console.error('[ConversationBridge] LLM streaming error:', err.message);
    sendSSE(res, { type: 'error', message: 'LLM streaming failed' });
  }

  // Flush any remaining dialogue buffer as text
  if (dialogueBuffer.trim()) {
    sendSSE(res, { type: 'text', text: dialogueBuffer, isFinal: false });
    if (ttsProvider) {
      sentenceBuffer += dialogueBuffer;
    }
  }

  // If we were still inside a marker block at EOF, send what we have as metadata
  if (insideMarkerBlock && markerBuffer.trim()) {
    sendSSE(res, { type: insideMarkerBlock.type, content: markerBuffer.trim() });
  }
  if (!firstTokenRecorded) llmFirstTokenTimer.stop();
  llmTotalTimer.stop();

  // Detect empty LLM response
  if (!fullResponse.trim()) {
    console.warn(`[ConversationBridge] WARNING: Empty LLM response for session ${sessionId}`);
    sendSSE(res, { type: 'error', message: 'NPC response was empty. This may be due to safety filters or a temporary issue.' });
    const fallbackText = '*pauses and looks confused* ... Pardon, I lost my train of thought.';
    sendSSE(res, { type: 'text', text: fallbackText, isFinal: true });
    fullResponse = fallbackText;
  } else {
    // Synthesize remaining text
    if (ttsProvider && sentenceBuffer.trim()) {
      synthesizeSentence(sentenceBuffer.trim());
    }

    // Final text marker
    sendSSE(res, { type: 'text', text: '', isFinal: true });
  }

  // Wait for TTS chain to complete before closing the SSE stream
  await ttsChain;

  // Store response in history and append to context cache
  if (fullResponse) {
    addToHistory(session, 'assistant', fullResponse);
    conversationContextCache.append(cacheKey, { role: 'user', content: text }, session.conversationContext?.systemPrompt);
    conversationContextCache.append(cacheKey, { role: 'assistant', content: fullResponse });

    // Update player-NPC relationship (fire-and-forget, non-fatal)
    const relExchangeCount = session.history.filter(h => h.role === 'user').length;
    const relAgreeableness = (session.conversationContext as any)?.characterPersonality?.agreeableness ?? 0.5;
    const relQuality = 0.02 + (relAgreeableness * 0.03) * (relExchangeCount / 5);
    import('../../extensions/tott/social-dynamics-system.js')
      .then(({ updateRelationship }) =>
        updateRelationship(characterId, session.playerId, relQuality, new Date().getFullYear())
      )
      .then(() => console.log(`[ConversationBridge] Relationship updated: ${characterId} += ${relQuality.toFixed(3)}`))
      .catch((err: any) => console.warn('[ConversationBridge] Relationship update failed (non-fatal):', err.message));
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
      console.log(`[ConversationBridge] Compressed history: ${oldLength} -> ${session.history.length} messages`);
    } catch (err: any) {
      console.warn('[ConversationBridge] History compression failed:', err.message);
    }
  }

  // ── Debug: log LLM response ──
  console.debug('[LLM:PlayerNPC:SSE] ── RESPONSE ──');
  console.debug(fullResponse || '(empty response)');
  console.debug('[LLM:PlayerNPC:SSE] ── END ──');

  // Run quest trigger analysis on the player message
  if (activeQuests && activeQuests.length > 0) {
    try {
      const analysisResult = analyzeConversation({
        playerMessage: text,
        npcCharacterId: characterId,
        conversationTurnCount: session.history.filter(h => h.role === 'user').length,
        activeQuests,
      });
      if (analysisResult.triggers.length > 0) {
        sendSSE(res, { type: 'quest_progress', content: analysisResult.markerContent, triggers: analysisResult.triggers });
      }
    } catch (err: any) {
      console.error('[ConversationBridge] Quest trigger analysis error:', err.message);
    }
  }

  e2eTimer.stop();

  res.write('data: [DONE]\n\n');
  res.end();
}

// ── Conversation Goal Evaluation Prompt ──────────────────────────────────

/**
 * Build a prompt that asks the LLM to evaluate whether the player's conversation
 * achieved any of the active quest objectives. Returns a JSON array of evaluations.
 */
function buildConversationGoalPrompt(
  playerMessage: string,
  npcResponse: string,
  objectives: Array<{ questId: string; objectiveId: string; objectiveType: string; description: string; npcId?: string }>,
): string {
  const objectiveList = objectives.map((obj, i) =>
    `${i + 1}. [${obj.objectiveId}] (${obj.objectiveType}): "${obj.description}"`
  ).join('\n');

  return `You are evaluating whether a player's conversation exchange accomplished any quest objectives in a language learning RPG.

PLAYER SAID: "${playerMessage}"
NPC RESPONDED: "${npcResponse}"

ACTIVE QUEST OBJECTIVES TO EVALUATE:
${objectiveList}

For EACH objective, determine if the conversation exchange meaningfully progressed or completed it.
- "talk_to_npc" objectives: Met if the player had a substantive exchange (not just "hi").
- "conversation" objectives: Met if the player engaged with the topic described in the objective.
- "complete_conversation" objectives: Met if the player's exchange fulfilled the described goal.
- "use_vocabulary" objectives: Met if the player used relevant vocabulary in their message.

Return ONLY a JSON array. For each objective, include:
- "objectiveId": the objective ID
- "questId": the quest ID
- "goalMet": true/false
- "confidence": 0.0-1.0 (how confident you are)
- "extractedInfo": brief description of what the player achieved (or "" if goalMet is false)

IMPORTANT: Only set goalMet=true if you are genuinely confident (0.7+) that the exchange meaningfully addressed the objective. Do not be lenient — the player should actually engage with the goal, not just say anything.

Return JSON array only, no explanation:`;
}

// ── Live session SSE pipeline ───────────────────────────────────────────

/**
 * Stream a conversation response using a Gemini Live session via SSE.
 * Creates a per-request Live session (not persistent) since SSE doesn't
 * support continuous bidirectional communication. Still faster than text+TTS
 * because it eliminates sentence splitting — the Live API handles audio synthesis.
 *
 * Falls back to the text+TTS pipeline if Live session creation fails.
 */
async function streamLiveResponse(
  res: Response,
  text: string,
  sessionId: string,
  characterId: string,
  worldId: string,
  languageCode: string,
  activeQuests?: ActiveQuest[],
  clientSystemPrompt?: string,
  voiceName?: string,
  targetLanguage?: string,
  playerProficiency?: string,
  activeObjectives?: Array<{ questId: string; objectiveId: string; objectiveType: string; description: string; npcId?: string }>,
  prologFacts?: Array<{ predicate: string; args: Array<string | number> }>,
  clientCharacterGender?: string,
  clientGameState?: { cefrLevel?: string; playerVocabulary?: any[]; playerGrammarPatterns?: any[] },
): Promise<boolean> {
  const manager = getLiveSessionManager();

  // Build system prompt (use client-provided or build a default)
  let systemPrompt = clientSystemPrompt || 'You are an NPC in a game world. Respond in character.';

  // Get or create conversation session for history tracking
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, characterId, worldId, sessionId, languageCode);
  }
  if (clientSystemPrompt) {
    if (!session.conversationContext) {
      session.conversationContext = {
        systemPrompt: clientSystemPrompt,
        characterName: characterId,
        characterGender: clientCharacterGender || undefined,
      } as any;
    } else {
      session.conversationContext.systemPrompt = clientSystemPrompt;
    }
  }

  // Add user message to history
  addToHistory(session, 'user', text);

  let liveSession;
  try {
    // Build side-channel context
    const sideChannelCtx: SideChannelContext = {
      targetLanguage: targetLanguage || '',
      playerProficiency: playerProficiency,
      activeQuests: activeQuests,
      activeObjectives: activeObjectives,
      npcCharacterId: characterId,
      conversationTurnCount: session.history.filter(h => h.role === 'user').length,
    };

    // Build side-channel callbacks that emit SSE events
    const sideChannelCbs: SideChannelCallbacks = {
      onVocabHints: (hints) => {
        if (!res.writableEnded) sendSSE(res, { type: 'vocab_hints', content: JSON.stringify(hints) });
      },
      onGrammarFeedback: (feedback) => {
        if (!res.writableEnded) sendSSE(res, { type: 'grammar_feedback', content: JSON.stringify(feedback) });
      },
      onEval: (scores) => {
        if (!res.writableEnded) sendSSE(res, { type: 'eval', content: JSON.stringify(scores) });
      },
      onQuestProgress: (triggers, markerContent) => {
        if (!res.writableEnded) sendSSE(res, { type: 'quest_progress', content: markerContent, triggers });
      },
      onGoalEvaluation: (evaluations) => {
        if (!res.writableEnded) sendSSE(res, { type: 'goal_evaluation', evaluations });
      },
    };

    // Create a promise that resolves when turnComplete fires
    let resolveTurn: () => void;
    const turnCompletePromise = new Promise<void>(resolve => { resolveTurn = resolve; });

    const callbacks: LiveSessionCallbacks = {
      onAudioChunk: (data: string, mimeType: string) => {
        if (res.writableEnded) return;
        // Send audio as base64 SSE event (same format as existing pipeline)
        const sampleRate = mimeType.includes('24000') ? 24000 : 16000;
        sendSSE(res, {
          type: 'audio',
          data,
          encoding: 'pcm',
          sampleRate,
          durationMs: 0,
        });
      },
      onTextChunk: (chunkText: string) => {
        if (res.writableEnded) return;
        sendSSE(res, { type: 'text', text: chunkText, isFinal: false, languageCode, sessionId });
      },
      onTurnComplete: (fullText: string) => {
        // Final text marker
        if (!res.writableEnded) {
          sendSSE(res, { type: 'text', text: '', isFinal: true, languageCode, sessionId });
        }

        // Store in history
        if (fullText) {
          addToHistory(session!, 'assistant', fullText);
        }

        // Fork side-channel (fire-and-forget, never blocks SSE)
        if (text && fullText && sideChannelCtx.targetLanguage) {
          runSideChannel(text, fullText, sideChannelCtx, sideChannelCbs);
        }

        resolveTurn!();
      },
      onInterrupted: () => {
        if (!res.writableEnded) {
          sendSSE(res, { type: 'interrupted', sessionId });
        }
        resolveTurn!();
      },
      onTranscription: (transcribedText: string) => {
        if (!res.writableEnded) {
          sendSSE(res, { type: 'transcript', text: transcribedText, sessionId });
        }
      },
      onGenerationComplete: () => {
        // No-op — turnComplete already resolves the promise
      },
    };

    liveSession = await manager.createSession(
      {
        systemPrompt,
        voiceName: voiceName,
        languageCode: languageCode || undefined,
        characterId,
        worldId,
        playerId: sessionId,
      },
      callbacks,
    );

    console.log(`[ConversationBridge] Live session ${liveSession.id} created for SSE request`);

    // Send the player's text through the Live session
    liveSession.sendText(text);

    // Wait for the turn to complete (with timeout)
    const LIVE_TURN_TIMEOUT_MS = 30_000;
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Live session turn timed out')), LIVE_TURN_TIMEOUT_MS),
    );

    await Promise.race([turnCompletePromise, timeoutPromise]);

    // Allow a brief window for side-channel SSE events to flush before closing
    await new Promise<void>(resolve => setTimeout(resolve, 100));

    // Close the Live session (per-request, not persistent)
    manager.endSession(liveSession.id);

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }

    return true;
  } catch (err: any) {
    console.error('[ConversationBridge] Live session SSE failed, falling back to text+TTS:', err.message);

    // Clean up the Live session if it was created
    if (liveSession) {
      try { manager.endSession(liveSession.id); } catch { /* ignore */ }
    }

    return false; // Signal caller to fall back to text+TTS
  }
}

// ── Route registration ───────────────────────────────────────────────────

export function registerConversationRoutes(app: Express): void {
  /**
   * POST /api/conversation/stream
   * Body: { sessionId, characterId, worldId, text, languageCode }
   * Response: SSE stream of text/audio/facial/meta events
   */
  app.post('/api/conversation/stream', async (req: Request, res: Response) => {
    const { sessionId, characterId, worldId, text, languageCode, activeQuests, prologFacts, systemPrompt, characterGender, cefrLevel, playerVocabulary, playerGrammarPatterns, useLiveSession, voiceName, targetLanguage, playerProficiency, activeObjectives } = req.body;

    if (!sessionId || !characterId || !worldId || !text) {
      res.status(400).json({ error: 'Missing required fields: sessionId, characterId, worldId, text' });
      return;
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      // If useLiveSession requested, try Live session first
      if (useLiveSession) {
        const liveSuccess = await streamLiveResponse(
          res, text, sessionId, characterId, worldId, languageCode || 'en',
          activeQuests, systemPrompt, voiceName, targetLanguage, playerProficiency,
          activeObjectives, prologFacts, characterGender,
          { cefrLevel, playerVocabulary, playerGrammarPatterns },
        );
        if (liveSuccess) return; // Live session handled the response
        // Live session failed — fall through to text+TTS pipeline
        console.log('[ConversationBridge] Live session failed, falling back to text+TTS pipeline');
      }

      await streamTextResponse(res, text, sessionId, characterId, worldId, languageCode || 'en', activeQuests, prologFacts, systemPrompt, characterGender, { cefrLevel, playerVocabulary, playerGrammarPatterns });
    } catch (err: any) {
      console.error('[ConversationBridge] Stream error:', err);
      if (!res.writableEnded) {
        sendSSE(res, { type: 'error', message: err.message || 'Internal error' });
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  });

  /**
   * POST /api/conversation/stream-audio
   * Body (multipart): audio file, sessionId, characterId, worldId, languageCode
   * Response: SSE stream of text/audio/facial/meta events
   */
  app.post('/api/conversation/stream-audio', async (req: Request, res: Response) => {
    // For now, handle audio via STT → text pipeline
    const { sessionId, characterId, worldId, languageCode } = req.body;

    if (!sessionId || !characterId || !worldId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      // Extract audio from multipart form
      const audioFile = (req as any).file || (req as any).files?.audio?.[0];
      if (!audioFile) {
        sendSSE(res, { type: 'error', message: 'No audio file provided' });
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Transcribe audio
      let transcript = '';
      const sttTimer = new PipelineTimer('stt');
      try {
        const { speechToText } = await import('../../services/tts-stt.js');
        const audioBuffer = audioFile.buffer || audioFile;
        transcript = await speechToText(audioBuffer, audioFile.mimetype || 'audio/webm');
      } catch (err: any) {
        console.error('[ConversationBridge] STT error:', err.message);
        sendSSE(res, { type: 'error', message: 'Speech-to-text failed' });
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      sttTimer.stop();

      if (!transcript.trim()) {
        sendSSE(res, { type: 'error', message: 'No speech detected' });
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Send transcript back to client
      sendSSE(res, { type: 'transcript', text: transcript });

      // Feed transcript through the text pipeline
      await streamTextResponse(res, transcript, sessionId, characterId, worldId, languageCode || 'en');
    } catch (err: any) {
      console.error('[ConversationBridge] Audio stream error:', err);
      if (!res.writableEnded) {
        sendSSE(res, { type: 'error', message: err.message || 'Internal error' });
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  });

  /**
   * POST /api/conversation/end
   * Body: { sessionId }
   */
  app.post('/api/conversation/end', (req: Request, res: Response) => {
    const { sessionId } = req.body;
    if (sessionId) {
      endSessionFn(sessionId);
    }
    res.json({ ok: true });
  });

  /**
   * POST /api/conversation/metadata
   * Background metadata extraction — runs SEPARATELY from the dialogue.
   * Analyzes a conversation exchange for vocab hints, grammar feedback, and eval scores.
   * Body: { playerMessage, npcResponse, targetLanguage, playerProficiency?, includeEval? }
   * Response: JSON { vocabHints, grammarFeedback, eval? }
   */
  app.post('/api/conversation/metadata', async (req: Request, res: Response) => {
    const { playerMessage, npcResponse, targetLanguage, playerProficiency, includeEval, activeObjectives } = req.body;

    if (!playerMessage || !npcResponse || !targetLanguage) {
      res.status(400).json({ error: 'Missing required fields: playerMessage, npcResponse, targetLanguage' });
      return;
    }

    try {
      const { buildMetadataExtractionPrompt } = await import('../../../shared/language/utils.js');
      const prompt = buildMetadataExtractionPrompt(targetLanguage, playerMessage, npcResponse, {
        includeEval: includeEval ?? false,
        playerProficiency: playerProficiency ?? 'beginner',
      });

      // Run two parallel LLM calls:
      // 1. Metadata extraction (vocab, grammar, eval)
      // 2. Conversation goal evaluation (if active objectives provided)

      const metadataPromise = (async () => {
        let llmProvider: IStreamingLLMProvider;
        try {
          llmProvider = getProvider();
        } catch {
          const { getGenAI, GEMINI_MODELS, THINKING_LEVELS } = await import('../../config/gemini.js');
          const ai = getGenAI();
          const result = await ai.models.generateContent({
            model: GEMINI_MODELS.FLASH,
            contents: prompt,
            config: { temperature: 0.1, maxOutputTokens: 500 },
          });
          const text = result.text || '';
          try {
            return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
          } catch {
            return { vocabHints: [], grammarFeedback: { status: 'no_target_language', errors: [] } };
          }
        }

        let fullText = '';
        const tokens = llmProvider.streamCompletion(prompt, {
          systemPrompt: 'You are a language analysis engine. Return only valid JSON.',
          characterName: 'system',
        }, { languageCode: 'en' });
        for await (const token of tokens) {
          fullText += token;
        }

        try {
          return JSON.parse(fullText.replace(/```json\n?|\n?```/g, '').trim());
        } catch {
          return { vocabHints: [], grammarFeedback: { status: 'no_target_language', errors: [] } };
        }
      })();

      // Evaluate conversation goals in parallel (only if objectives provided)
      const goalEvalPromise = (async () => {
        if (!activeObjectives || activeObjectives.length === 0) return [];

        const goalPrompt = buildConversationGoalPrompt(playerMessage, npcResponse, activeObjectives);

        try {
          const { getGenAI, GEMINI_MODELS, THINKING_LEVELS } = await import('../../config/gemini.js');
          const ai = getGenAI();
          const result = await ai.models.generateContent({
            model: GEMINI_MODELS.FLASH,
            contents: goalPrompt,
            config: { temperature: 0.0, maxOutputTokens: 300 },
          });
          const text = result.text || '';
          try {
            const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
            return Array.isArray(parsed) ? parsed : parsed.evaluations || [];
          } catch {
            return [];
          }
        } catch (err: any) {
          console.warn('[ConversationBridge] Goal evaluation failed:', err.message);
          return [];
        }
      })();

      // Wait for both
      const [metadata, goalEvaluations] = await Promise.all([metadataPromise, goalEvalPromise]);

      // Always include goalEvaluations in response (even if empty) for schema consistency
      metadata.goalEvaluations = goalEvaluations;

      res.json(metadata);
    } catch (err: any) {
      console.error('[ConversationBridge] Metadata extraction error:', err.message);
      res.status(500).json({ error: 'Metadata extraction failed' });
    }
  });

  /**
   * POST /api/conversation/translate-word
   * On-demand single-word translation for hover-to-translate.
   * Body: { word, targetLanguage }
   * Response: { word, translation, context? }
   */
  app.post('/api/conversation/translate-word', async (req: Request, res: Response) => {
    const { word, targetLanguage, worldId } = req.body;

    if (!word || !targetLanguage) {
      res.status(400).json({ error: 'Missing required fields: word, targetLanguage' });
      return;
    }

    try {
      // Check translation cache first (if worldId provided)
      if (worldId) {
        const stor = await import('../../db/storage.js').then(m => m.storage);
        const cached = await stor.findTranslation(worldId, word, targetLanguage);
        if (cached) {
          // Cache hit — increment lookup count and return cached result
          stor.incrementTranslationLookup(worldId, word, targetLanguage).catch(() => {});
          return res.json({ word, translation: cached.translation, context: cached.partOfSpeech || '', cached: true });
        }
      }

      const prompt = `Translate the following ${targetLanguage} word to English. Return ONLY valid JSON with no markdown.\n\nWord: "${word}"\n\n{"translation": "English meaning", "context": "brief usage note or empty string"}`;

      let translationResult: { translation: string; context?: string } | null = null;

      let llmProvider: IStreamingLLMProvider;
      try {
        llmProvider = getProvider();
      } catch {
        const { getGenAI, GEMINI_MODELS, THINKING_LEVELS } = await import('../../config/gemini.js');
        const ai = getGenAI();
        const result = await ai.models.generateContent({
          model: GEMINI_MODELS.FLASH,
          contents: prompt,
          config: { temperature: 0.1, maxOutputTokens: 100 },
        });
        const text = result.text || '';
        try {
          const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
          translationResult = { translation: parsed.translation, context: parsed.context };
        } catch {
          translationResult = { translation: text.trim() };
        }

        // Cache the result
        if (worldId && translationResult) {
          const storForCache = await import('../../db/storage.js').then(m => m.storage);
          storForCache.upsertTranslation(worldId, word, targetLanguage, translationResult.translation, translationResult.context).catch(() => {});
        }

        return res.json({ word, ...translationResult });
      }

      let fullText = '';
      const tokens = llmProvider.streamCompletion(prompt, {
        systemPrompt: 'You are a translation engine. Return only valid JSON.',
        characterName: 'system',
      }, { languageCode: 'en' });
      for await (const token of tokens) {
        fullText += token;
      }

      try {
        const parsed = JSON.parse(fullText.replace(/```json\n?|\n?```/g, '').trim());
        translationResult = { translation: parsed.translation, context: parsed.context };
      } catch {
        translationResult = { translation: fullText.trim() };
      }

      // Cache the result
      if (worldId && translationResult) {
        const storForCache2 = await import('../../db/storage.js').then(m => m.storage);
        storForCache2.upsertTranslation(worldId, word, targetLanguage, translationResult.translation, translationResult.context).catch(() => {});
      }

      res.json({ word, ...translationResult });
    } catch (err: any) {
      console.error('[ConversationBridge] Word translation error:', err.message);
      res.status(500).json({ error: 'Translation failed' });
    }
  });

  /**
   * GET /api/metrics/conversation
   * Returns latency percentiles (p50/p95/p99) for each pipeline stage
   * over a rolling window of the last 100 conversations.
   */
  app.get('/api/metrics/conversation', (_req: Request, res: Response) => {
    const metrics = getConversationMetrics();
    const snapshot = metrics.getSnapshot();
    res.json({
      ...snapshot,
      qualityTier: metrics.qualityTier,
      tierConfig: metrics.tierConfig,
      responseCache: responseCache.getStats(),
    });
  });

  /**
   * GET /api/conversation/health
   * Health check for the conversation service
   */
  app.get('/api/conversation/health', (_req: Request, res: Response) => {
    let llmAvailable = false;
    try {
      getProvider();
      llmAvailable = true;
    } catch {
      // Provider not registered
    }
    res.json({
      healthy: llmAvailable,
      version: '1.0.0',
      services: { llm: llmAvailable },
    });
  });

  // ── Offline export endpoint ─────────────────────────────────────────
  // Exports world data in the format expected by the Insimul Unreal plugin's
  // FInsimulWorldExportLoader. Contains characters + pre-built dialogue contexts.

  app.get('/api/conversation/export/:worldId', async (req: Request, res: Response) => {
    const { worldId } = req.params;

    try {
      const stor = await import('../../db/storage.js').then(m => m.storage);

      const [world, characters, languages] = await Promise.all([
        stor.getWorld(worldId),
        stor.getCharactersByWorld(worldId),
        stor.getWorldLanguagesByWorld(worldId),
      ]);

      if (!world) {
        return res.status(404).json({ error: `World ${worldId} not found` });
      }

      // Build dialogue contexts for each character
      const dialogueContexts: Array<{
        characterId: string;
        characterName: string;
        systemPrompt: string;
        greeting: string;
        voice: string;
        truths: Array<{ title: string; content: string }>;
      }> = [];

      for (const char of characters) {
        try {
          const fullCtx = await buildContext(char.id, 'player', worldId, `export-${char.id}`);

          // Determine voice from gender
          const gender = (char.gender || '').toLowerCase();
          const voice = gender === 'female' ? 'Kore' : 'Charon';

          // Get truths for this character
          let truths: Array<{ title: string; content: string }> = [];
          try {
            const charTruths = await stor.getTruthsByCharacter(char.id);
            truths = charTruths.map((t: any) => ({
              title: t.title || '',
              content: t.content || '',
            }));
          } catch {
            // Truths not available
          }

          dialogueContexts.push({
            characterId: char.id,
            characterName: `${char.firstName} ${char.lastName}`.trim(),
            systemPrompt: fullCtx.conversationContext.systemPrompt,
            greeting: `Hello, I'm ${char.firstName}.`,
            voice,
            truths,
          });
        } catch (err: any) {
          console.warn(`[Export] Failed to build context for ${char.id}:`, err.message);
        }
      }

      // Build character data
      const exportedCharacters = characters.map((char) => {
        const personality = (char.personality || {}) as Record<string, number>;
        return {
          characterId: char.id,
          firstName: char.firstName,
          lastName: char.lastName,
          gender: char.gender || '',
          occupation: char.occupation || '',
          birthYear: char.birthYear || 0,
          isAlive: char.isAlive !== false,
          openness: personality.openness ?? 0,
          conscientiousness: personality.conscientiousness ?? 0,
          extroversion: personality.extroversion ?? 0,
          agreeableness: personality.agreeableness ?? 0,
          neuroticism: personality.neuroticism ?? 0,
        };
      });

      const exportData = {
        worldName: world.name,
        worldId: world.id,
        exportedAt: new Date().toISOString(),
        characters: exportedCharacters,
        dialogueContexts,
      };

      res.json(exportData);

      console.log(`[Export] Exported world '${world.name}': ${exportedCharacters.length} characters, ${dialogueContexts.length} contexts`);
    } catch (err: any) {
      console.error('[Export] Failed:', err);
      res.status(500).json({ error: err.message || 'Export failed' });
    }
  });
}
