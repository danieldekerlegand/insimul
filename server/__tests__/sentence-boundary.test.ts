import { describe, it, expect } from 'vitest';
import { findSentenceBoundary, SentenceBuffer } from '../services/sentence-boundary';

describe('findSentenceBoundary', () => {
  it('returns 0 when no sentence boundary exists', () => {
    expect(findSentenceBoundary('Hello world')).toBe(0);
    expect(findSentenceBoundary('No ending punctuation here')).toBe(0);
  });

  it('detects period-terminated sentences', () => {
    const text = 'Hello world. How are you?';
    const boundary = findSentenceBoundary(text);
    expect(text.slice(0, boundary).trim()).toBe('Hello world.');
  });

  it('detects exclamation-terminated sentences', () => {
    const text = 'Watch out! Something is coming.';
    const boundary = findSentenceBoundary(text);
    // Should find the last boundary (after the period) since "coming." is followed by end of string (no space after)
    // Actually the period at end has no trailing space, so only "Watch out! " is found
    expect(text.slice(0, boundary).trim()).toBe('Watch out!');
  });

  it('detects question-terminated sentences', () => {
    const text = 'How are you? I am fine. ';
    const boundary = findSentenceBoundary(text);
    expect(boundary).toBeGreaterThan(0);
    expect(text.slice(0, boundary).trim()).toBe('How are you?');
  });

  it('finds the first sentence boundary', () => {
    const text = 'First sentence. Second sentence. Third still going';
    const boundary = findSentenceBoundary(text);
    expect(text.slice(0, boundary).trim()).toBe('First sentence.');
  });

  it('skips common abbreviations', () => {
    const text = 'Talk to Dr. Smith about it.';
    // "Dr." should not be a boundary; the final period has no trailing space
    const boundary = findSentenceBoundary(text);
    expect(boundary).toBe(0);
  });

  it('skips abbreviations like Mr. and Mrs.', () => {
    const text = 'Mr. Jones met Mrs. Smith. They talked.';
    const boundary = findSentenceBoundary(text);
    // Should find boundary after "Smith." not after "Mr." or "Mrs."
    expect(text.slice(0, boundary)).toContain('Smith.');
  });

  it('handles sentences with closing quotes', () => {
    const text = 'He said "hello." She replied.';
    const boundary = findSentenceBoundary(text);
    expect(boundary).toBeGreaterThan(0);
  });

  it('returns 0 for trailing sentence without space after punctuation', () => {
    expect(findSentenceBoundary('Hello world.')).toBe(0);
    expect(findSentenceBoundary('Done!')).toBe(0);
  });

  it('handles ellipsis-like patterns', () => {
    // "e.g." should be treated as abbreviation
    const text = 'Use tools e.g. hammers for building. ';
    const boundary = findSentenceBoundary(text);
    expect(text.slice(0, boundary).trim()).toBe('Use tools e.g. hammers for building.');
  });
});

describe('SentenceBuffer', () => {
  it('buffers text until a sentence boundary is found', () => {
    const buffer = new SentenceBuffer();
    expect(buffer.push('Hello ')).toEqual([]);
    expect(buffer.push('world')).toEqual([]);
    expect(buffer.push('. How')).toEqual(['Hello world.']);
  });

  it('returns multiple sentences when multiple boundaries found', () => {
    const buffer = new SentenceBuffer();
    const sentences = buffer.push('First. Second. Third');
    expect(sentences).toEqual(['First.', 'Second.']);
  });

  it('flushes remaining text at end of stream', () => {
    const buffer = new SentenceBuffer();
    buffer.push('Hello world');
    expect(buffer.flush()).toBe('Hello world');
  });

  it('flush returns null when buffer is empty', () => {
    const buffer = new SentenceBuffer();
    expect(buffer.flush()).toBeNull();
  });

  it('handles incremental streaming of a single sentence', () => {
    const buffer = new SentenceBuffer();
    expect(buffer.push('The ')).toEqual([]);
    expect(buffer.push('quick ')).toEqual([]);
    expect(buffer.push('brown ')).toEqual([]);
    expect(buffer.push('fox. ')).toEqual(['The quick brown fox.']);
  });

  it('handles realistic streaming chunks', () => {
    const buffer = new SentenceBuffer();
    const allSentences: string[] = [];

    // Simulate chunks arriving from an LLM stream
    allSentences.push(...buffer.push('Welcome to our '));
    allSentences.push(...buffer.push('village! My name '));
    allSentences.push(...buffer.push('is Elena. I have '));
    allSentences.push(...buffer.push('lived here for many years.'));

    // The final sentence won't be emitted until flush since no trailing space
    expect(allSentences).toEqual([
      'Welcome to our village!',
      'My name is Elena.',
    ]);

    const remaining = buffer.flush();
    expect(remaining).toBe('I have lived here for many years.');
  });

  it('handles abbreviations across chunk boundaries', () => {
    const buffer = new SentenceBuffer();
    const allSentences: string[] = [];

    allSentences.push(...buffer.push('Talk to Dr'));
    allSentences.push(...buffer.push('. Smith about '));
    allSentences.push(...buffer.push('the plan. '));

    // "Dr." split across chunks should still be detected as abbreviation
    // But "the plan." with trailing space should be a boundary
    expect(allSentences).toContainEqual(expect.stringContaining('the plan.'));
  });

  it('peek shows current buffer without modifying it', () => {
    const buffer = new SentenceBuffer();
    buffer.push('Hello ');
    expect(buffer.peek()).toBe('Hello ');
    buffer.push('world');
    expect(buffer.peek()).toBe('Hello world');
  });

  it('handles question marks in dialogue', () => {
    const buffer = new SentenceBuffer();
    const sentences = buffer.push('How are you? I am doing well. ');
    expect(sentences).toEqual(['How are you?', 'I am doing well.']);
  });

  it('handles empty chunks', () => {
    const buffer = new SentenceBuffer();
    expect(buffer.push('')).toEqual([]);
    buffer.push('Hello. ');
    expect(buffer.push('')).toEqual([]);
  });
});
