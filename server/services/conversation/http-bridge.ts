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
import type { IVisemeGenerator, VisemeQuality } from './viseme/viseme-generator.js';
import { createVisemeGenerator } from './viseme/viseme-generator.js';
import { PipelineTimer, getConversationMetrics } from './conversation-metrics.js';
import { analyzeConversation } from './quest-trigger-analyzer.js';
import type { ActiveQuest } from './quest-trigger-analyzer.js';

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

/**
 * Strip ALL non-spoken content from text destined for TTS.
 * TTS reads every character literally — markdown, markers, translations all get spoken.
 */
function cleanForTTS(text: string): string {
  return text
    // Strip complete marker blocks
    .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
    .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
    .replace(/\*\*VOCAB_HINTS\*\*[\s\S]*?\*\*END_VOCAB\*\*/g, '')
    .replace(/\*\*EVAL\*\*[\s\S]*?\*\*END_EVAL\*\*/g, '')
    .replace(/\*\*QUEST_PROGRESS\*\*[\s\S]*?\*\*END_QUEST_PROGRESS\*\*/g, '')
    // Strip orphaned marker tags
    .replace(/\*\*(VOCAB_HINTS|END_VOCAB|GRAMMAR_FEEDBACK|END_GRAMMAR|QUEST_ASSIGN|END_QUEST|EVAL|END_EVAL|QUEST_PROGRESS|END_QUEST_PROGRESS)\*\*/g, '')
    // Strip markdown bold/italic (***text***, **text**, *text*)
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Strip markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Strip markdown links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip parenthetical English translations
    .replace(/\s*\([A-Z][^)]{1,60}\)/g, '')
    // Strip action/stage directions like *points to door*
    .replace(/\*[^*]{1,80}\*/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
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

// ── Main streaming pipeline ──────────────────────────────────────────────

async function streamTextResponse(
  res: Response,
  text: string,
  sessionId: string,
  characterId: string,
  worldId: string,
  languageCode: string,
  activeQuests?: ActiveQuest[],
): Promise<void> {
  const metrics = getConversationMetrics();
  const e2eTimer = new PipelineTimer('end_to_end');

  // Get or create session
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, characterId, worldId, sessionId, languageCode);
  }

  // Build context on first message
  if (!session.conversationContext || session.characterId !== characterId) {
    session.characterId = characterId;
    const ctxTimer = new PipelineTimer('context');
    try {
      const fullCtx = await buildContext(characterId, session.playerId, worldId, sessionId);
      session.conversationContext = fullCtx.conversationContext;
    } catch {
      session.conversationContext = {
        systemPrompt: 'You are an NPC in a game world. Respond in character.',
        characterName: characterId,
      };
    }
    ctxTimer.stop();
  }

  // Add user message to history
  addToHistory(session, 'user', text);

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

  // Attempt TTS + viseme setup (optional — gracefully skip if unavailable)
  let ttsProvider: ITTSProvider | null = null;
  let visemeGen: IVisemeGenerator | null = null;
  try {
    ttsProvider = getTTSProvider();
  } catch {
    // TTS not available — text-only mode
  }
  try {
    visemeGen = createVisemeGenerator();
  } catch {
    // Viseme generation not available
  }

  // Stream LLM tokens
  let fullResponse = '';
  let sentenceBuffer = '';
  const ttsPromises: Array<Promise<void>> = [];

  // Adaptive quality: degrade viseme quality when latency is high
  const effectiveVisemeQuality = metrics.isDegraded ? 'simplified' : 'full';

  const synthesizeSentence = (sentence: string) => {
    if (!ttsProvider) return;
    // Strip ALL non-spoken content before TTS
    const stripped = cleanForTTS(sentence);
    if (!stripped) return;
    // Skip TTS entirely when adaptive quality degrades and latency is very high
    if (metrics.isDegraded) {
      const e2eStats = metrics.getStageStats('end_to_end');
      if (e2eStats && e2eStats.p95 > 4000) return;
    }
    const voice: VoiceProfile = assignVoiceProfile({
      gender: (session as any)?.conversationContext?.characterGender,
    });
    const promise = (async () => {
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
    })();
    ttsPromises.push(promise);
  };

  const llmTotalTimer = new PipelineTimer('llm_total');
  const llmFirstTokenTimer = new PipelineTimer('llm_first_token');
  let firstTokenRecorded = false;

  // Track whether we're inside a marker block so we can route
  // marker content as metadata events instead of text/TTS.
  let insideMarkerBlock: (typeof MARKER_BLOCKS)[number] | null = null;
  let markerBuffer = '';       // accumulates content inside a marker block
  let dialogueBuffer = '';     // accumulates tokens outside marker blocks (for text SSE)

  try {
    const tokens = llmProvider.streamCompletion(text, session.conversationContext!, {
      languageCode,
      conversationHistory: session.history.slice(0, -1),
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

  // Synthesize remaining text
  if (ttsProvider && sentenceBuffer.trim()) {
    synthesizeSentence(sentenceBuffer.trim());
  }

  // Final text marker
  sendSSE(res, { type: 'text', text: '', isFinal: true });

  // Wait for TTS to complete before closing the SSE stream
  if (ttsPromises.length > 0) {
    await Promise.all(ttsPromises);
  }

  // Store response in history
  if (fullResponse) {
    addToHistory(session, 'assistant', fullResponse);
  }

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

// ── Route registration ───────────────────────────────────────────────────

export function registerConversationRoutes(app: Express): void {
  /**
   * POST /api/conversation/stream
   * Body: { sessionId, characterId, worldId, text, languageCode }
   * Response: SSE stream of text/audio/facial/meta events
   */
  app.post('/api/conversation/stream', async (req: Request, res: Response) => {
    const { sessionId, characterId, worldId, text, languageCode, activeQuests } = req.body;

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
      await streamTextResponse(res, text, sessionId, characterId, worldId, languageCode || 'en', activeQuests);
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
    const { playerMessage, npcResponse, targetLanguage, playerProficiency, includeEval } = req.body;

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

      // Use the conversation LLM provider (fast model) for metadata extraction
      let llmProvider: IStreamingLLMProvider;
      try {
        llmProvider = getProvider();
      } catch {
        // Fallback to Gemini directly
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const { getGeminiApiKey, GEMINI_MODELS } = await import('../../config/gemini.js');
        const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
        const model = genAI.getGenerativeModel({
          model: GEMINI_MODELS.FLASH,
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        try {
          const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
          return res.json(parsed);
        } catch {
          return res.json({ vocabHints: [], grammarFeedback: { status: 'no_target_language', errors: [] }, raw: text });
        }
      }

      // Stream and collect full response
      let fullText = '';
      const tokens = llmProvider.streamCompletion(prompt, {
        systemPrompt: 'You are a language analysis engine. Return only valid JSON.',
        characterName: 'system',
      }, { languageCode: 'en' });
      for await (const token of tokens) {
        fullText += token;
      }

      try {
        const parsed = JSON.parse(fullText.replace(/```json\n?|\n?```/g, '').trim());
        res.json(parsed);
      } catch {
        res.json({ vocabHints: [], grammarFeedback: { status: 'no_target_language', errors: [] }, raw: fullText });
      }
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
    const { word, targetLanguage } = req.body;

    if (!word || !targetLanguage) {
      res.status(400).json({ error: 'Missing required fields: word, targetLanguage' });
      return;
    }

    try {
      const prompt = `Translate the following ${targetLanguage} word to English. Return ONLY valid JSON with no markdown.\n\nWord: "${word}"\n\n{"translation": "English meaning", "context": "brief usage note or empty string"}`;

      let llmProvider: IStreamingLLMProvider;
      try {
        llmProvider = getProvider();
      } catch {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const { getGeminiApiKey, GEMINI_MODELS } = await import('../../config/gemini.js');
        const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
        const model = genAI.getGenerativeModel({
          model: GEMINI_MODELS.FLASH,
          generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        try {
          const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
          return res.json({ word, translation: parsed.translation, context: parsed.context });
        } catch {
          return res.json({ word, translation: text.trim() });
        }
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
        res.json({ word, translation: parsed.translation, context: parsed.context });
      } catch {
        res.json({ word, translation: fullText.trim() });
      }
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
    res.json(metrics.getSnapshot());
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
}
