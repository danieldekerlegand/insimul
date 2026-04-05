import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  splitIntoSentences,
  SentenceAccumulator,
  cleanForSpeech,
  processStreamWithTTS,
} from '../services/conversation/streaming-chat';

describe('splitIntoSentences', () => {
  it('splits on periods', () => {
    expect(splitIntoSentences('Hello world. How are you?')).toEqual([
      'Hello world.',
      'How are you?',
    ]);
  });

  it('splits on exclamation marks', () => {
    expect(splitIntoSentences('Wow! That is great!')).toEqual([
      'Wow!',
      'That is great!',
    ]);
  });

  it('splits on question marks', () => {
    expect(splitIntoSentences('Who are you? What do you want?')).toEqual([
      'Who are you?',
      'What do you want?',
    ]);
  });

  it('handles mixed punctuation', () => {
    expect(splitIntoSentences('Hi there. How are you? Great!')).toEqual([
      'Hi there.',
      'How are you?',
      'Great!',
    ]);
  });

  it('returns single item for no sentence boundary', () => {
    expect(splitIntoSentences('Hello world')).toEqual(['Hello world']);
  });

  it('handles empty string', () => {
    expect(splitIntoSentences('')).toEqual([]);
  });

  it('handles ellipsis (not a sentence boundary)', () => {
    // Ellipsis (…) is NOT treated as a sentence boundary — it indicates a pause, not end of sentence
    const result = splitIntoSentences('Well\u2026 I suppose so. Okay.');
    expect(result).toEqual(['Well\u2026 I suppose so.', 'Okay.']);
  });
});

describe('SentenceAccumulator', () => {
  let acc: SentenceAccumulator;

  beforeEach(() => {
    acc = new SentenceAccumulator();
  });

  it('returns nothing for partial text', () => {
    expect(acc.push('Hello wor')).toEqual([]);
    expect(acc.push('ld how')).toEqual([]);
  });

  it('returns complete sentence when boundary is found', () => {
    acc.push('Hello world');
    const result = acc.push('. How are you');
    expect(result).toEqual(['Hello world.']);
  });

  it('accumulates across multiple pushes', () => {
    expect(acc.push('First sentence')).toEqual([]);
    expect(acc.push('. ')).toEqual([]);
    expect(acc.push('Second sentence. Third')).toEqual([
      'First sentence.',
      'Second sentence.',
    ]);
    const remaining = acc.flush();
    expect(remaining).toBe('Third');
  });

  it('flush returns remaining buffer', () => {
    acc.push('Some partial text');
    expect(acc.flush()).toBe('Some partial text');
  });

  it('flush returns null for empty buffer', () => {
    expect(acc.flush()).toBeNull();
  });

  it('handles streaming token-by-token', () => {
    const tokens = ['H', 'ello', ' world', '.', ' How', ' are', ' you', '?', ' Fine', '.'];
    const sentences: string[] = [];

    for (const token of tokens) {
      sentences.push(...acc.push(token));
    }
    const last = acc.flush();
    if (last) sentences.push(last);

    expect(sentences).toEqual([
      'Hello world.',
      'How are you?',
      'Fine.',
    ]);
  });
});

describe('cleanForSpeech', () => {
  it('strips GRAMMAR_FEEDBACK markers', () => {
    const text = 'Hello! **GRAMMAR_FEEDBACK** some feedback **END_GRAMMAR** Goodbye.';
    expect(cleanForSpeech(text)).toBe('Hello! Goodbye.');
  });

  it('strips QUEST_ASSIGN markers', () => {
    const text = 'Here is a quest. **QUEST_ASSIGN** quest data **END_QUEST** Good luck!';
    expect(cleanForSpeech(text)).toBe('Here is a quest. Good luck!');
  });

  it('returns plain text unchanged', () => {
    expect(cleanForSpeech('Hello world.')).toBe('Hello world.');
  });
});

describe('processStreamWithTTS', () => {
  async function* makeStream(chunks: string[]): AsyncGenerator<{ text(): string }> {
    for (const c of chunks) {
      yield { text: () => c };
    }
  }

  it('sends text events for each chunk', async () => {
    const events: string[] = [];
    const sendSSE = (data: string) => events.push(data);

    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    await processStreamWithTTS(
      makeStream(['Hello. ', 'World.']),
      sendSSE,
      { returnAudio: false, voice: 'Kore', gender: 'female' },
      mockTTS,
    );

    // Should have 2 text events
    const textEvents = events.filter(e => {
      try { return JSON.parse(e).text; } catch { return false; }
    });
    expect(textEvents).toHaveLength(2);
    expect(JSON.parse(textEvents[0]).text).toBe('Hello. ');
    expect(JSON.parse(textEvents[1]).text).toBe('World.');

    // No audio when returnAudio is false
    const audioEvents = events.filter(e => {
      try { return JSON.parse(e).audio; } catch { return false; }
    });
    expect(audioEvents).toHaveLength(0);
    expect(mockTTS).not.toHaveBeenCalled();
  });

  it('generates per-sentence audio when returnAudio is true', async () => {
    const events: string[] = [];
    const sendSSE = (data: string) => events.push(data);

    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('fake-audio'));

    await processStreamWithTTS(
      makeStream(['Hello there. ', 'How are you? ', 'I am fine.']),
      sendSSE,
      { returnAudio: true, voice: 'Charon', gender: 'male' },
      mockTTS,
    );

    // Should have 3 text events
    const textEvents = events.filter(e => {
      try { return JSON.parse(e).text; } catch { return false; }
    });
    expect(textEvents).toHaveLength(3);

    // Should have audio events with sequential sentenceIndex
    const audioEvents = events.filter(e => {
      try { return JSON.parse(e).audio; } catch { return false; }
    });
    expect(audioEvents.length).toBeGreaterThan(0);

    const indices = audioEvents.map(e => JSON.parse(e).sentenceIndex).sort();
    // Should start at 0 and be sequential
    expect(indices[0]).toBe(0);
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBe(indices[i - 1] + 1);
    }

    // TTS should have been called with cleaned text, voice, gender, encoding
    for (const call of mockTTS.mock.calls) {
      expect(call[1]).toBe('Charon');
      expect(call[2]).toBe('male');
      expect(call[3]).toBe('MP3');
    }
  });

  it('flushes remaining text as final sentence', async () => {
    const events: string[] = [];
    const sendSSE = (data: string) => events.push(data);

    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    // Single chunk with no trailing sentence boundary
    await processStreamWithTTS(
      makeStream(['Hello world']),
      sendSSE,
      { returnAudio: true, voice: 'Kore', gender: 'female' },
      mockTTS,
    );

    // TTS should still be called for the flushed text
    expect(mockTTS).toHaveBeenCalledWith('Hello world', 'Kore', 'female', 'MP3', undefined, undefined);
  });

  it('handles TTS failure gracefully', async () => {
    const events: string[] = [];
    const sendSSE = (data: string) => events.push(data);

    const mockTTS = vi.fn().mockRejectedValue(new Error('TTS service down'));

    // Should not throw even if TTS fails
    await processStreamWithTTS(
      makeStream(['Hello. Goodbye.']),
      sendSSE,
      { returnAudio: true, voice: 'Kore', gender: 'female' },
      mockTTS,
    );

    // Text events should still be sent
    const textEvents = events.filter(e => {
      try { return JSON.parse(e).text; } catch { return false; }
    });
    expect(textEvents).toHaveLength(1);

    // No audio events since TTS failed
    const audioEvents = events.filter(e => {
      try { return JSON.parse(e).audio; } catch { return false; }
    });
    expect(audioEvents).toHaveLength(0);
  });

  it('skips empty text chunks', async () => {
    const events: string[] = [];
    const sendSSE = (data: string) => events.push(data);
    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    async function* streamWithEmpty(): AsyncGenerator<{ text(): string }> {
      yield { text: () => '' };
      yield { text: () => 'Hello.' };
      yield { text: () => '' };
    }

    await processStreamWithTTS(
      streamWithEmpty(),
      sendSSE,
      { returnAudio: false, voice: 'Kore', gender: 'female' },
      mockTTS,
    );

    const textEvents = events.filter(e => {
      try { return JSON.parse(e).text; } catch { return false; }
    });
    expect(textEvents).toHaveLength(1);
  });

  it('passes emotionalTone to TTS function', async () => {
    const events: string[] = [];
    const sendSSE = (data: string) => events.push(data);

    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    await processStreamWithTTS(
      makeStream(['Hello world']),
      sendSSE,
      { returnAudio: true, voice: 'Kore', gender: 'female', emotionalTone: 'happy' },
      mockTTS,
    );

    expect(mockTTS).toHaveBeenCalledWith('Hello world', 'Kore', 'female', 'MP3', 'happy', undefined);
  });

  it('strips system markers before TTS', async () => {
    const events: string[] = [];
    const sendSSE = (data: string) => events.push(data);

    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    await processStreamWithTTS(
      makeStream(['Hello! **GRAMMAR_FEEDBACK** fix this **END_GRAMMAR** Bye.']),
      sendSSE,
      { returnAudio: true, voice: 'Kore', gender: 'female' },
      mockTTS,
    );

    // TTS should be called with cleaned text (no markers)
    const ttsTexts = mockTTS.mock.calls.map((c: any[]) => c[0]);
    for (const t of ttsTexts) {
      expect(t).not.toContain('GRAMMAR_FEEDBACK');
    }
  });
});
