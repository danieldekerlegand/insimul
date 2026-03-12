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
import { splitAtSentenceBoundaries, assignVoiceProfile } from './tts/tts-provider.js';
import type { IVisemeGenerator, VisemeQuality } from './viseme/viseme-generator.js';
import { createVisemeGenerator } from './viseme/viseme-generator.js';

// ── Helpers ──────────────────────────────────────────────────────────────

function sendSSE(res: Response, data: object): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
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
): Promise<void> {
  // Get or create session
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, characterId, worldId, sessionId, languageCode);
  }

  // Build context on first message
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
    const ttsModule = await import('./tts/tts-provider.js');
    ttsProvider = ttsModule.getTTSProvider?.() ?? null;
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
          // Send viseme data before audio
          if (visemeGen) {
            const facialData = visemeGen.generateVisemes(sentence, chunk.durationMs, 'full');
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
      sendSSE(res, { type: 'text', text: token, isFinal: false });

      // TTS pipelining: accumulate into sentences
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
    console.error('[ConversationBridge] LLM streaming error:', err.message);
    sendSSE(res, { type: 'error', message: 'LLM streaming failed' });
  }

  // Synthesize remaining text
  if (ttsProvider && sentenceBuffer.trim()) {
    synthesizeSentence(sentenceBuffer.trim());
  }

  // Final text marker
  sendSSE(res, { type: 'text', text: '', isFinal: true });

  // Wait for TTS to complete
  if (ttsPromises.length > 0) {
    await Promise.all(ttsPromises);
  }

  // Store response in history
  if (fullResponse) {
    addToHistory(session, 'assistant', fullResponse);
  }

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
    const { sessionId, characterId, worldId, text, languageCode } = req.body;

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
      await streamTextResponse(res, text, sessionId, characterId, worldId, languageCode || 'en');
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
