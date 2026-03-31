import { describe, it, expect } from 'vitest';
import { extractSentences } from '../services/conversation/sentence-splitter';

describe('extractSentences', () => {
  it('splits simple sentences on period + space', () => {
    const [sentences, remaining] = extractSentences('Hello there. How are you? ');
    expect(sentences).toEqual(['Hello there.', 'How are you?']);
    expect(remaining).toBe('');
  });

  it('returns incomplete text as remaining', () => {
    const [sentences, remaining] = extractSentences('First sentence. Second sen');
    expect(sentences).toEqual(['First sentence.']);
    expect(remaining).toBe('Second sen');
  });

  it('handles exclamation and question marks', () => {
    const [sentences, remaining] = extractSentences('Wow! Really? Yes. ');
    expect(sentences).toEqual(['Wow!', 'Really?', 'Yes.']);
    expect(remaining).toBe('');
  });

  it('does not split on abbreviations', () => {
    const [sentences, remaining] = extractSentences('Dr. Smith is here. Mr. Jones left. ');
    expect(sentences).toEqual(['Dr. Smith is here.', 'Mr. Jones left.']);
    expect(remaining).toBe('');
  });

  it('handles single sentence with no terminator', () => {
    const [sentences, remaining] = extractSentences('Just some text');
    expect(sentences).toEqual([]);
    expect(remaining).toBe('Just some text');
  });

  it('handles empty string', () => {
    const [sentences, remaining] = extractSentences('');
    expect(sentences).toEqual([]);
    expect(remaining).toBe('');
  });

  it('handles multiple periods without spaces (e.g. ellipsis) as non-boundary', () => {
    const [sentences, remaining] = extractSentences('Wait... what happened? ');
    expect(sentences).toEqual(['Wait... what happened?']);
    expect(remaining).toBe('');
  });

  it('preserves sentence content accurately', () => {
    const input = 'Bonjour, comment allez-vous? Je suis très bien, merci! ';
    const [sentences, remaining] = extractSentences(input);
    expect(sentences).toEqual(['Bonjour, comment allez-vous?', 'Je suis très bien, merci!']);
    expect(remaining).toBe('');
  });

  it('handles incremental accumulation (simulating streaming)', () => {
    // First chunk: incomplete
    let [sentences, remaining] = extractSentences('Hello th');
    expect(sentences).toEqual([]);
    expect(remaining).toBe('Hello th');

    // Second chunk: completes first sentence, starts second
    [sentences, remaining] = extractSentences(remaining + 'ere. How are');
    expect(sentences).toEqual(['Hello there.']);
    expect(remaining).toBe('How are');

    // Third chunk: completes second sentence
    [sentences, remaining] = extractSentences(remaining + ' you? ');
    expect(sentences).toEqual(['How are you?']);
    expect(remaining).toBe('');
  });
});
