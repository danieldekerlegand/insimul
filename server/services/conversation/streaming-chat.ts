import type { Response } from 'express';

/**
 * Split text into sentences at natural boundaries.
 * Returns an array of non-empty trimmed sentences.
 *
 * Uses a negative lookbehind to avoid splitting on common abbreviations
 * (Dr., Mr., Mrs., Ms., Prof., St., Jr., Sr., etc.) and single-letter
 * initials (e.g. "J. K. Rowling").
 */
export function splitIntoSentences(text: string): string[] {
  // Negative lookbehind: don't split after common abbreviations or single-letter initials
  const abbrevPattern = /(?<!(?:Dr|Mr|Mrs|Ms|Prof|St|Jr|Sr|Rev|Gen|Gov|Sgt|Cpl|Pvt|Lt|Capt|Col|Maj|Sra|Srta|Mme|Mlle|M|Dra|Sig|Herr|Frau)\.)(?<!(?:\b[A-Z])\.)(?<=[.!?…])\s+/;
  const parts = text.split(abbrevPattern);
  return parts.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Accumulator that detects complete sentences from a stream of text chunks.
 * Yields sentences as they become complete while buffering partial text.
 */
export class SentenceAccumulator {
  private buffer = '';

  /** Feed a text chunk. Returns any newly completed sentences. */
  push(chunk: string): string[] {
    this.buffer += chunk;
    const sentences = splitIntoSentences(this.buffer);
    if (sentences.length <= 1) {
      // No complete sentence yet (or only one partial)
      return [];
    }
    // All but the last element are complete sentences
    const complete = sentences.slice(0, -1);
    this.buffer = sentences[sentences.length - 1];
    return complete;
  }

  /** Flush the remaining buffer as a final sentence. */
  flush(): string | null {
    const remaining = this.buffer.trim();
    this.buffer = '';
    return remaining.length > 0 ? remaining : null;
  }
}

/**
 * Strip ALL non-spoken content from text destined for TTS.
 * This must be aggressive — TTS reads every character literally,
 * so any markdown, marker blocks, or inline translations will be spoken.
 */
export function cleanForSpeech(text: string): string {
  return text
    // 1. Strip system marker blocks (complete)
    .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
    .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
    .replace(/\*\*VOCAB_HINTS\*\*[\s\S]*?\*\*END_VOCAB\*\*/g, '')
    .replace(/\*\*EVAL\*\*[\s\S]*?\*\*END_EVAL\*\*/g, '')
    // 2. Strip orphaned/partial marker tags
    .replace(/\*\*(VOCAB_HINTS|END_VOCAB|GRAMMAR_FEEDBACK|END_GRAMMAR|QUEST_ASSIGN|END_QUEST|EVAL|END_EVAL)\*\*/g, '')
    // 3. Strip all markdown formatting — bold, italic, bold-italic
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // 4. Strip markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // 5. Strip markdown links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 6. Strip parenthetical English translations e.g. "(Hello!)" or "(it's raining)"
    .replace(/\s*\([A-Z][^)]{1,60}\)/g, '')
    // 7. Strip action descriptions like *points to door* — these are stage directions, not speech
    .replace(/\*[^*]{1,80}\*/g, '')
    // 8. Collapse multiple spaces/newlines
    .replace(/\s+/g, ' ')
    .trim();
}

export interface StreamingChatOptions {
  systemPrompt: string;
  messages: Array<{ role: string; parts: Array<{ text: string }> }>;
  temperature?: number;
  maxTokens?: number;
  returnAudio?: boolean;
  voice?: string;
  gender?: string;
  emotionalTone?: string;
  targetLanguage?: string;
}

/** Dependency injection interface for testing */
export interface StreamingDeps {
  createChatStream: (options: {
    systemPrompt: string;
    messages: StreamingChatOptions['messages'];
    temperature: number;
    maxTokens: number;
  }) => Promise<AsyncIterable<{ text(): string }>>;
  textToSpeech: (text: string, voice?: string, gender?: string, encoding?: "MP3" | "WAV", emotionalTone?: string) => Promise<Buffer>;
}

/**
 * Core streaming logic — processes a text stream, accumulates sentences,
 * and fires TTS with limited concurrency. Separated from HTTP/Gemini concerns for testability.
 *
 * TTS concurrency is capped at MAX_TTS_CONCURRENT to avoid overwhelming the API
 * and causing rate-limit delays that stall the audio queue on the client.
 */
const MAX_TTS_CONCURRENT = 5;

export async function processStreamWithTTS(
  textStream: AsyncIterable<{ text(): string }>,
  sendSSE: (data: string) => void,
  options: { returnAudio: boolean; voice: string; gender: string; emotionalTone?: string; targetLanguage?: string },
  ttsFunc: (text: string, voice?: string, gender?: string, encoding?: "MP3" | "WAV", emotionalTone?: string, targetLanguage?: string) => Promise<Buffer>,
): Promise<void> {
  const accumulator = new SentenceAccumulator();
  let sentenceIndex = 0;

  // Concurrency-limited TTS queue
  const ttsPromises: Promise<void>[] = [];
  let activeCount = 0;
  let resolveSlot: (() => void) | null = null;

  async function waitForSlot() {
    while (activeCount >= MAX_TTS_CONCURRENT) {
      await new Promise<void>(r => { resolveSlot = r; });
    }
  }

  function releaseSlot() {
    activeCount--;
    if (resolveSlot) {
      const r = resolveSlot;
      resolveSlot = null;
      r();
    }
  }

  function enqueueTTS(cleaned: string, idx: number) {
    activeCount++;
    const promise = ttsFunc(cleaned, options.voice, options.gender, 'MP3', options.emotionalTone, options.targetLanguage)
      .then(buf => {
        sendSSE(JSON.stringify({ audio: buf.toString('base64'), sentenceIndex: idx }));
      })
      .catch(err => {
        console.error(`[StreamingChat] TTS failed for sentence ${idx}:`, err);
        // Send a skip marker so the client doesn't wait forever for this chunk
        sendSSE(JSON.stringify({ audioSkipped: true, sentenceIndex: idx }));
      })
      .finally(releaseSlot);
    ttsPromises.push(promise);
  }

  for await (const chunk of textStream) {
    const text = chunk.text();
    if (!text) continue;

    // Send text token immediately for real-time display
    sendSSE(JSON.stringify({ text }));

    if (options.returnAudio) {
      const completeSentences = accumulator.push(text);
      for (const sentence of completeSentences) {
        const cleaned = cleanForSpeech(sentence);
        if (!cleaned) continue;
        const idx = sentenceIndex++;
        await waitForSlot();
        enqueueTTS(cleaned, idx);
      }
    }
  }

  // Flush remaining text as the last sentence
  if (options.returnAudio) {
    const remaining = accumulator.flush();
    if (remaining) {
      const cleaned = cleanForSpeech(remaining);
      if (cleaned) {
        const idx = sentenceIndex++;
        await waitForSlot();
        enqueueTTS(cleaned, idx);
      }
    }

    // Wait for all in-flight TTS to finish before closing
    await Promise.all(ttsPromises);

    // Tell the client how many audio chunks to expect so it can stop waiting early
    sendSSE(JSON.stringify({ totalSentences: sentenceIndex }));
  }
}

/**
 * Stream a Gemini chat response as SSE, generating TTS audio per sentence.
 *
 * SSE format per chunk:
 *   data: {"text":"token"}\n\n                          — text token
 *   data: {"audio":"<base64>","sentenceIndex":N}\n\n     — sentence audio
 *   data: [DONE]\n\n                                     — end of stream
 */
export async function streamChatWithTTS(
  res: Response,
  options: StreamingChatOptions,
): Promise<void> {
  const {
    systemPrompt,
    messages,
    temperature = 0.7,
    maxTokens = 1000,
    returnAudio = false,
    voice = 'Kore',
    gender = 'neutral',
    emotionalTone,
    targetLanguage,
  } = options;

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const sendSSE = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  try {
    const { getGenAI, GEMINI_MODELS, THINKING_LEVELS } = await import('../../config/gemini.js');

    const ai = getGenAI();

    // Build contents: system prompt exchange + history + current message
    const contents: any[] = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will stay in character and follow all language instructions.' }] },
      ...messages,
    ];

    const streamResult = await ai.models.generateContentStream({
      model: GEMINI_MODELS.PRO,
      contents,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        thinkingConfig: { thinkingLevel: THINKING_LEVELS.LOW },
      },
    });
    const { textToSpeech } = await import('./tts-stt.js');

    // Adapt the new SDK's stream (chunks with .text property) to the interface
    // expected by processStreamWithTTS (chunks with .text() method)
    const adaptedStream = (async function* () {
      for await (const chunk of streamResult) {
        yield { text: () => chunk.text || '' };
      }
    })();

    await processStreamWithTTS(
      adaptedStream,
      sendSSE,
      { returnAudio, voice, gender, emotionalTone, targetLanguage },
      textToSpeech,
    );

    sendSSE('[DONE]');
  } catch (error) {
    console.error('[StreamingChat] Error:', error);
    sendSSE(JSON.stringify({ error: error instanceof Error ? error.message : 'Streaming failed' }));
  } finally {
    res.end();
  }
}
