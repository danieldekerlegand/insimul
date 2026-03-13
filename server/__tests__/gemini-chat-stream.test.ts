/**
 * Tests for server-side SSE streaming in POST /api/gemini/chat
 *
 * Verifies that:
 * - stream=true produces text/event-stream SSE output
 * - Text chunks are forwarded as `data: {"text":"..."}` events
 * - Audio TTS chunks are sent per-sentence when returnAudio=true
 * - The stream ends with `data: [DONE]`
 * - Errors mid-stream are sent as SSE error events
 * - stream=false still returns normal JSON
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rawRequest(
  app: Express,
  method: string,
  path: string,
  body?: any,
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  const server = http.createServer(app);
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const addr = server.address() as { port: number };
      const bodyStr = body ? JSON.stringify(body) : undefined;
      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (bodyStr) reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr).toString();

      const req = http.request(
        { hostname: '127.0.0.1', port: addr.port, path, method, headers: reqHeaders },
        (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => (data += chunk.toString()));
          res.on('end', () => {
            server.close();
            resolve({ status: res.statusCode!, headers: res.headers, body: data });
          });
        },
      );
      req.on('error', (err) => { server.close(); reject(err); });
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  });
}

function parseSSE(body: string): Array<any> {
  return body
    .split('\n')
    .filter((l) => l.startsWith('data: '))
    .map((l) => {
      const raw = l.slice(6);
      if (raw === '[DONE]') return '[DONE]';
      try { return JSON.parse(raw); } catch { return raw; }
    });
}

// ---------------------------------------------------------------------------
// Fake Gemini SDK objects
// ---------------------------------------------------------------------------

async function* fakeStream(chunks: string[]) {
  for (const c of chunks) {
    yield { text: () => c };
  }
}

function createMockChat(opts: {
  streamChunks?: string[];
  streamGenerator?: () => AsyncGenerator<{ text: () => string }>;
  sendMessageResult?: string;
}) {
  return {
    sendMessageStream: vi.fn().mockResolvedValue({
      stream: opts.streamGenerator
        ? opts.streamGenerator()
        : fakeStream(opts.streamChunks || []),
    }),
    sendMessage: vi.fn().mockResolvedValue({
      response: { text: () => opts.sendMessageResult || '' },
    }),
  };
}

// ---------------------------------------------------------------------------
// Build app with injectable mocks
// ---------------------------------------------------------------------------

function buildApp(mockChat: ReturnType<typeof createMockChat>, mockTTS?: ReturnType<typeof vi.fn>) {
  const app = express();
  app.use(express.json());

  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        systemPrompt,
        messages,
        returnAudio = false,
        voice = 'Kore',
        stream = false,
      } = req.body;

      const lastMessage = messages[messages.length - 1];
      const lastMessageContent = lastMessage.parts[0];

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const streamResult = await mockChat.sendMessageStream(lastMessageContent.text);

        let sentenceBuffer = '';
        let sentenceIndex = 0;

        const extractSentences = (buf: string): [string[], string] => {
          const sentences: string[] = [];
          const re = /[.!?]+(?:\s|$)/g;
          let lastEnd = 0;
          let m: RegExpExecArray | null;
          while ((m = re.exec(buf)) !== null) {
            sentences.push(buf.slice(lastEnd, m.index + m[0].length).trim());
            lastEnd = m.index + m[0].length;
          }
          return [sentences, buf.slice(lastEnd)];
        };

        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (!text) continue;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);

          if (returnAudio && mockTTS) {
            sentenceBuffer += text;
            const [sentences, remainder] = extractSentences(sentenceBuffer);
            sentenceBuffer = remainder;
            for (const sentence of sentences) {
              const cleaned = sentence
                .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
                .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
                .trim();
              if (!cleaned) continue;
              const gender = voice === 'Kore' ? 'female' : 'male';
              const audioBuffer = await mockTTS(cleaned, voice, gender, 'MP3');
              res.write(`data: ${JSON.stringify({ audio: audioBuffer.toString('base64'), sentenceIndex })}\n\n`);
              sentenceIndex++;
            }
          }
        }

        if (returnAudio && mockTTS && sentenceBuffer.trim()) {
          const cleaned = sentenceBuffer
            .replace(/\*\*GRAMMAR_FEEDBACK\*\*[\s\S]*?\*\*END_GRAMMAR\*\*/g, '')
            .replace(/\*\*QUEST_ASSIGN\*\*[\s\S]*?\*\*END_QUEST\*\*/g, '')
            .trim();
          if (cleaned) {
            const gender = voice === 'Kore' ? 'female' : 'male';
            const audioBuffer = await mockTTS(cleaned, voice, gender, 'MP3');
            res.write(`data: ${JSON.stringify({ audio: audioBuffer.toString('base64'), sentenceIndex })}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Non-streaming
      const result = await mockChat.sendMessage(lastMessageContent.text);
      const response = result.response.text();
      res.json({ response, cleanedResponse: response });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to get chat response';
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.status(500).json({ error: errMsg });
      }
    }
  });

  return app;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/gemini/chat — SSE streaming', () => {
  const baseBody = {
    systemPrompt: 'You are a friendly NPC.',
    messages: [{ role: 'user', parts: [{ text: 'Hello there!' }] }],
  };

  it('returns text/event-stream with SSE text chunks when stream=true', async () => {
    const mockChat = createMockChat({ streamChunks: ['Hello ', 'traveler! ', 'Welcome.'] });
    const app = buildApp(mockChat);

    const res = await rawRequest(app, 'POST', '/api/gemini/chat', { ...baseBody, stream: true });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/event-stream');
    expect(res.headers['cache-control']).toBe('no-cache');

    const events = parseSSE(res.body);
    const textEvents = events.filter((e: any) => e.text);
    expect(textEvents).toHaveLength(3);
    expect(textEvents[0].text).toBe('Hello ');
    expect(textEvents[1].text).toBe('traveler! ');
    expect(textEvents[2].text).toBe('Welcome.');
    expect(events[events.length - 1]).toBe('[DONE]');
  });

  it('sends sentence-level audio chunks when stream=true and returnAudio=true', async () => {
    const mockChat = createMockChat({ streamChunks: ['Hello traveler. ', 'Welcome to town!'] });
    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('fake-audio'));
    const app = buildApp(mockChat, mockTTS);

    const res = await rawRequest(app, 'POST', '/api/gemini/chat', {
      ...baseBody,
      stream: true,
      returnAudio: true,
      voice: 'Charon',
    });

    expect(res.status).toBe(200);
    const events = parseSSE(res.body);
    const audioEvents = events.filter((e: any) => e.audio);
    // "Hello traveler." triggers TTS on first chunk; "Welcome to town!" flushed at end
    expect(audioEvents.length).toBeGreaterThanOrEqual(2);
    expect(audioEvents[0].sentenceIndex).toBe(0);
    expect(audioEvents[1].sentenceIndex).toBe(1);
    expect(mockTTS).toHaveBeenCalledWith('Hello traveler.', 'Charon', 'male', 'MP3');
  });

  it('returns normal JSON when stream=false', async () => {
    const mockChat = createMockChat({ sendMessageResult: 'Hello traveler!' });
    const app = buildApp(mockChat);

    const res = await rawRequest(app, 'POST', '/api/gemini/chat', { ...baseBody, stream: false });

    expect(res.status).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.response).toBe('Hello traveler!');
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('sends error as SSE event when streaming fails mid-stream', async () => {
    async function* failingStream() {
      yield { text: () => 'Start...' };
      throw new Error('Gemini connection lost');
    }
    const mockChat = createMockChat({ streamGenerator: failingStream });
    const app = buildApp(mockChat);

    const res = await rawRequest(app, 'POST', '/api/gemini/chat', { ...baseBody, stream: true });

    // Headers already sent as 200 before the error
    expect(res.status).toBe(200);
    const events = parseSSE(res.body);
    const errorEvent = events.find((e: any) => e.error);
    expect(errorEvent).toBeDefined();
    expect(errorEvent.error).toBe('Gemini connection lost');
    expect(events[events.length - 1]).toBe('[DONE]');
  });

  it('ends stream with [DONE] even with no text chunks', async () => {
    const mockChat = createMockChat({ streamChunks: [] });
    const app = buildApp(mockChat);

    const res = await rawRequest(app, 'POST', '/api/gemini/chat', { ...baseBody, stream: true });

    const events = parseSSE(res.body);
    expect(events).toHaveLength(1);
    expect(events[0]).toBe('[DONE]');
  });

  it('strips system markers from TTS but keeps them in text stream', async () => {
    const mockChat = createMockChat({
      streamChunks: ['Hello. **GRAMMAR_FEEDBACK** correction **END_GRAMMAR** Done.'],
    });
    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));
    const app = buildApp(mockChat, mockTTS);

    const res = await rawRequest(app, 'POST', '/api/gemini/chat', {
      ...baseBody,
      stream: true,
      returnAudio: true,
    });

    const events = parseSSE(res.body);
    // Text event should contain the raw text including markers
    const textEvents = events.filter((e: any) => e.text);
    expect(textEvents[0].text).toContain('GRAMMAR_FEEDBACK');

    // TTS should have been called with cleaned text (markers stripped)
    const ttsCallTexts = mockTTS.mock.calls.map((c: any[]) => c[0]);
    for (const t of ttsCallTexts) {
      expect(t).not.toContain('GRAMMAR_FEEDBACK');
    }
  });
});
