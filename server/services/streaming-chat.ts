import type { Response } from 'express';

/**
 * Split text into sentences at natural boundaries.
 * Returns an array of non-empty trimmed sentences.
 */
export function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace or end of string.
  // Handles ., !, ?, and ellipsis. Avoids splitting on abbreviations like "Mr." or "Dr."
  const parts = text.split(/(?<=[.!?…])\s+/);
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

/** Strip system markers that shouldn't be spoken */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
    .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
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
 * and fires TTS in parallel. Separated from HTTP/Gemini concerns for testability.
 */
export async function processStreamWithTTS(
  textStream: AsyncIterable<{ text(): string }>,
  sendSSE: (data: string) => void,
  options: { returnAudio: boolean; voice: string; gender: string; emotionalTone?: string },
  ttsFunc: (text: string, voice?: string, gender?: string, encoding?: "MP3" | "WAV", emotionalTone?: string) => Promise<Buffer>,
): Promise<void> {
  const accumulator = new SentenceAccumulator();
  let sentenceIndex = 0;
  const ttsPromises: Promise<void>[] = [];

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
        const promise = ttsFunc(cleaned, options.voice, options.gender, 'MP3', options.emotionalTone)
          .then(buf => {
            sendSSE(JSON.stringify({ audio: buf.toString('base64'), sentenceIndex: idx }));
          })
          .catch(err => {
            console.error(`[StreamingChat] TTS failed for sentence ${idx}:`, err);
          });
        ttsPromises.push(promise);
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
        const promise = ttsFunc(cleaned, options.voice, options.gender, 'MP3', options.emotionalTone)
          .then(buf => {
            sendSSE(JSON.stringify({ audio: buf.toString('base64'), sentenceIndex: idx }));
          })
          .catch(err => {
            console.error(`[StreamingChat] TTS failed for sentence ${idx}:`, err);
          });
        ttsPromises.push(promise);
      }
    }

    // Wait for all in-flight TTS to finish before closing
    await Promise.all(ttsPromises);
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
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const { getGeminiApiKey, GEMINI_MODELS } = await import('../config/gemini.js');

    const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODELS.PRO,
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    });

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand. I will roleplay as this character.' }] },
        ...messages.slice(0, -1),
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.parts[0].text;

    const streamResult = await chat.sendMessageStream(userText);
    const { textToSpeech } = await import('./tts-stt.js');

    await processStreamWithTTS(
      streamResult.stream,
      sendSSE,
      { returnAudio, voice, gender, emotionalTone },
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
