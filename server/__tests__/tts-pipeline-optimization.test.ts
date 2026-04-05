import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  splitIntoSentences,
  SentenceAccumulator,
  cleanForSpeech,
  processStreamWithTTS,
} from '../services/conversation/streaming-chat';
import { TTSCache } from '../services/conversation/tts-cache';
import { GreetingCache } from '../services/conversation/greeting-cache';
import type { CEFRLevel } from '@shared/assessment/cefr-mapping';

// ── splitIntoSentences optimizations ────────────────────────────────

describe('splitIntoSentences — enhanced boundary detection', () => {
  it('handles triple-dot ellipsis without splitting', () => {
    const result = splitIntoSentences('I was thinking... maybe we should go. Yes.');
    expect(result).toEqual([
      'I was thinking\u2026 maybe we should go.',
      'Yes.',
    ]);
  });

  it('handles unicode ellipsis without splitting mid-sentence', () => {
    // Unicode ellipsis is NOT a sentence boundary — only . ! ? » are
    const result = splitIntoSentences('Well\u2026 I suppose so. Okay.');
    expect(result).toEqual(['Well\u2026 I suppose so.', 'Okay.']);
  });

  it('handles French guillemets as sentence boundaries', () => {
    const result = splitIntoSentences('Il a dit \u00abbonjour\u00bb. Puis il est parti.');
    expect(result).toEqual([
      'Il a dit \u00abbonjour\u00bb.',
      'Puis il est parti.',
    ]);
  });

  it('handles closing guillemet as sentence end', () => {
    const result = splitIntoSentences('\u00abBonjour!\u00bb Elle a souri.');
    expect(result).toEqual([
      '\u00abBonjour!\u00bb',
      'Elle a souri.',
    ]);
  });

  it('handles Spanish inverted punctuation', () => {
    const result = splitIntoSentences('\u00bfC\u00f3mo est\u00e1s? Bien, gracias.');
    expect(result).toEqual([
      'C\u00f3mo est\u00e1s?',
      'Bien, gracias.',
    ]);
  });

  it('handles inverted exclamation', () => {
    const result = splitIntoSentences('\u00a1Hola! \u00bfQu\u00e9 tal?');
    expect(result).toEqual([
      'Hola!',
      'Qu\u00e9 tal?',
    ]);
  });

  it('preserves abbreviation handling', () => {
    const result = splitIntoSentences('Dr. Smith is here. He arrived.');
    expect(result).toEqual(['Dr. Smith is here.', 'He arrived.']);
  });

  it('preserves single-letter initial handling', () => {
    const result = splitIntoSentences('J. K. Rowling wrote that. Amazing.');
    expect(result).toEqual(['J. K. Rowling wrote that.', 'Amazing.']);
  });

  it('handles French abbreviations', () => {
    const result = splitIntoSentences('Mme. Dupont est l\u00e0. Bonjour.');
    expect(result).toEqual(['Mme. Dupont est l\u00e0.', 'Bonjour.']);
  });

  it('handles multiple ellipses in one text — ellipses do not split', () => {
    const result = splitIntoSentences('Well... you see... it happened. The end.');
    expect(result).toEqual([
      'Well\u2026 you see\u2026 it happened.',
      'The end.',
    ]);
  });
});

// ── cleanForSpeech optimizations ────────────────────────────────────

describe('cleanForSpeech — enhanced cleaning', () => {
  it('strips QUEST_PROGRESS markers', () => {
    const text = 'Hello! **QUEST_PROGRESS** step 2 done **END_QUEST_PROGRESS** Continue.';
    expect(cleanForSpeech(text)).toBe('Hello! Continue.');
  });

  it('strips French guillemets', () => {
    const text = 'Il a dit \u00abbonjour\u00bb et \u00abau revoir\u00bb.';
    expect(cleanForSpeech(text)).toBe('Il a dit bonjour et au revoir.');
  });

  it('strips all marker types in one pass', () => {
    const text = '**GRAMMAR_FEEDBACK** x **END_GRAMMAR** Hello **VOCAB_HINTS** y **END_VOCAB** world';
    expect(cleanForSpeech(text)).toBe('Hello world');
  });

  it('handles text with no markers unchanged', () => {
    expect(cleanForSpeech('Simple text here.')).toBe('Simple text here.');
  });

  it('strips action descriptions', () => {
    expect(cleanForSpeech('Hello! *waves hand* How are you?')).toBe('Hello! How are you?');
  });

  it('strips markdown links', () => {
    expect(cleanForSpeech('Check [this page](http://example.com) out.')).toBe('Check this page out.');
  });
});

// ── SentenceAccumulator with new boundaries ─────────────────────────

describe('SentenceAccumulator — streaming with ellipses and guillemets', () => {
  let acc: SentenceAccumulator;

  beforeEach(() => {
    acc = new SentenceAccumulator();
  });

  it('buffers text with triple-dot ellipsis mid-sentence', () => {
    // Triple dots get normalized to …, which is NOT a sentence boundary
    expect(acc.push('Wait...')).toEqual([]);
    // The '. ' after "think so" IS a boundary, splitting "Wait… I think so." from "Yes."
    const result = acc.push(' I think so. Yes.');
    expect(result).toEqual(['Wait\u2026 I think so.']);
    expect(acc.flush()).toBe('Yes.');
  });

  it('handles guillemet-terminated sentences in streaming', () => {
    expect(acc.push('\u00abBonjour!\u00bb ')).toEqual([]);
    const result = acc.push('Comment allez-vous?');
    expect(result).toEqual(['\u00abBonjour!\u00bb']);
    expect(acc.flush()).toBe('Comment allez-vous?');
  });
});

// ── processStreamWithTTS — queue depth callback ─────────────────────

describe('processStreamWithTTS — queue depth tracking', () => {
  async function* makeStream(chunks: string[]): AsyncGenerator<{ text(): string }> {
    for (const c of chunks) {
      yield { text: () => c };
    }
  }

  it('reports queue depth via callback', async () => {
    const depths: number[] = [];
    const sendSSE = vi.fn();
    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    await processStreamWithTTS(
      makeStream(['Hello. ', 'World. ', 'Goodbye.']),
      sendSSE,
      { returnAudio: true, voice: 'Kore', gender: 'female' },
      mockTTS,
      (depth) => depths.push(depth),
    );

    // Should have recorded some depths > 0 and final 0 (drained)
    expect(depths.length).toBeGreaterThan(0);
    expect(depths[depths.length - 1]).toBe(0); // queue drained signal
  });

  it('does not call depth callback when returnAudio is false', async () => {
    const depths: number[] = [];
    const sendSSE = vi.fn();
    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    await processStreamWithTTS(
      makeStream(['Hello. World.']),
      sendSSE,
      { returnAudio: false, voice: 'Kore', gender: 'female' },
      mockTTS,
      (depth) => depths.push(depth),
    );

    expect(depths).toEqual([]);
  });

  it('passes targetLanguage to TTS function', async () => {
    const sendSSE = vi.fn();
    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('audio'));

    await processStreamWithTTS(
      makeStream(['Bonjour.']),
      sendSSE,
      { returnAudio: true, voice: 'Kore', gender: 'female', targetLanguage: 'French' },
      mockTTS,
    );

    expect(mockTTS).toHaveBeenCalledWith('Bonjour.', 'Kore', 'female', 'MP3', undefined, 'French');
  });
});

// ── TTSCache — TTL expiration ───────────────────────────────────────

describe('TTSCache — TTL support', () => {
  it('returns cached buffer within TTL', () => {
    const cache = new TTSCache(10, 1024 * 1024, 5 * 60 * 1000);
    const key = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3');
    const buf = Buffer.from('audio-data');
    cache.set(key, buf);
    expect(cache.get(key)).toEqual(buf);
  });

  it('expires entries beyond TTL', () => {
    // Use a very short TTL for testing
    const cache = new TTSCache(10, 1024 * 1024, 1); // 1ms TTL
    const key = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3');
    cache.set(key, Buffer.from('audio-data'));

    // Manually advance — since TTL is 1ms, a tiny delay will expire it
    // Use vi.useFakeTimers for deterministic test
    vi.useFakeTimers();
    vi.advanceTimersByTime(2);
    expect(cache.get(key)).toBeUndefined();
    expect(cache.size).toBe(0); // evicted on access
    vi.useRealTimers();
  });

  it('generates correct cache keys with emotional tone', () => {
    const key1 = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3', 'happy');
    const key2 = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3', 'sad');
    const key3 = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3');
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key3).toContain('neutral');
  });

  it('respects LRU eviction with TTL', () => {
    const cache = new TTSCache(2, 1024 * 1024, 60000);
    cache.set('a', Buffer.from('1'));
    cache.set('b', Buffer.from('2'));
    cache.set('c', Buffer.from('3')); // should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeDefined();
    expect(cache.get('c')).toBeDefined();
  });
});

// ── GreetingCache — TTS pre-synthesis ───────────────────────────────

describe('GreetingCache — TTS pre-synthesis at cache time', () => {
  it('pre-synthesizes audio when ttsFunc provided', async () => {
    const cache = new GreetingCache();
    const mockTTS = vi.fn().mockResolvedValue(Buffer.from('greeting-audio'));

    async function* mockLLM(): AsyncIterable<string> {
      yield '===NPC:npc1===\nmorning: Bonjour!\nafternoon: Bon après-midi!\nevening: Bonsoir!\nrainy: Il pleut!\ngeneral: Salut!\n';
    }

    const results = await cache.generateBatch(
      'world1',
      [{
        npcId: 'npc1',
        npcName: 'Pierre',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.7, agreeableness: 0.6, neuroticism: 0.3 },
        targetLanguage: 'French',
      }],
      'A1' as CEFRLevel,
      'French',
      (prompt: string, _sys: string) => mockLLM(),
      mockTTS,
    );

    expect(results.length).toBe(1);
    expect(mockTTS).toHaveBeenCalledTimes(5); // 5 greetings per NPC

    // All greetings should have audioBase64
    for (const greeting of results[0].greetings) {
      expect(greeting.audioBase64).toBeDefined();
      expect(greeting.audioBase64!.length).toBeGreaterThan(0);
    }
  });

  it('works without ttsFunc (no pre-synthesis)', async () => {
    const cache = new GreetingCache();

    async function* mockLLM(): AsyncIterable<string> {
      yield '===NPC:npc1===\nmorning: Hi!\ngeneral: Hello!\n';
    }

    const results = await cache.generateBatch(
      'world1',
      [{
        npcId: 'npc1',
        npcName: 'Test',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
        targetLanguage: 'English',
      }],
      'A1' as CEFRLevel,
      'English',
      (prompt: string, _sys: string) => mockLLM(),
    );

    expect(results.length).toBe(1);
    // No audio since no ttsFunc
    for (const greeting of results[0].greetings) {
      expect(greeting.audioBase64).toBeUndefined();
    }
  });

  it('handles TTS failure gracefully during pre-synthesis', async () => {
    const cache = new GreetingCache();
    const mockTTS = vi.fn().mockRejectedValue(new Error('TTS unavailable'));

    async function* mockLLM(): AsyncIterable<string> {
      yield '===NPC:npc1===\ngeneral: Hello!\n';
    }

    const results = await cache.generateBatch(
      'world1',
      [{
        npcId: 'npc1',
        npcName: 'Test',
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
        targetLanguage: 'English',
      }],
      'A1' as CEFRLevel,
      'English',
      (prompt: string, _sys: string) => mockLLM(),
      mockTTS,
    );

    // Should still return results despite TTS failure
    expect(results.length).toBe(1);
    expect(results[0].greetings.length).toBeGreaterThan(0);
    // Audio undefined due to failure
    expect(results[0].greetings[0].audioBase64).toBeUndefined();
  });

  it('getWithAudio returns text and audio', () => {
    const cache = new GreetingCache();
    cache.set('world1', 'npc1', 'Test', [
      { text: 'Hello!', context: 'general', cefrLevel: 'A1' as CEFRLevel, generatedAt: Date.now(), audioBase64: 'abc123' },
    ]);

    const result = cache.getWithAudio('world1', 'npc1');
    expect(result).not.toBeNull();
    expect(result!.text).toBe('Hello!');
    expect(result!.audioBase64).toBe('abc123');
  });
});
