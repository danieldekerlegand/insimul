/**
 * Server-side sentence boundary detection for streaming responses.
 * Buffers incoming text chunks and emits complete sentences.
 */

// Common abbreviations that end with a period but are NOT sentence boundaries
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'ave', 'blvd',
  'gen', 'gov', 'sgt', 'cpl', 'pvt', 'capt', 'lt', 'col', 'maj',
  'dept', 'univ', 'assn', 'bros', 'inc', 'ltd', 'co', 'corp',
  'vs', 'etc', 'approx', 'appt', 'apt', 'est', 'min', 'max',
  'misc', 'no', 'vol', 'rev', 'fig', 'ref',
  'e.g', 'i.e', 'u.s', 'u.s.a', 'u.k',
]);

// Sentence-ending punctuation pattern: . ! ? followed by optional quotes/parens
const SENTENCE_END_RE = /([.!?])(['")\]]*)\s/g;

/**
 * Checks if a period at the given position is an abbreviation, not a sentence end.
 */
function isAbbreviation(text: string, dotIndex: number): boolean {
  // Find the word before the dot
  let wordStart = dotIndex - 1;
  while (wordStart >= 0 && /[a-zA-Z.]/.test(text[wordStart])) {
    wordStart--;
  }
  const word = text.slice(wordStart + 1, dotIndex).toLowerCase();
  if (ABBREVIATIONS.has(word)) return true;

  // Single letter followed by dot (initials like "J." or "U.S.A.")
  if (word.length === 1 && /[a-zA-Z]/.test(word)) return true;

  // Check if next non-space char is lowercase (likely not a sentence boundary)
  const afterDot = text.slice(dotIndex + 1).match(/^\s*(\S)/);
  if (afterDot && /[a-z]/.test(afterDot[1])) return true;

  return false;
}

/**
 * Find the first sentence boundary in text. Returns the index after the
 * first complete sentence, or 0 if no complete sentence is found.
 */
export function findSentenceBoundary(text: string): number {
  SENTENCE_END_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = SENTENCE_END_RE.exec(text)) !== null) {
    const punctuation = match[1];
    const dotIndex = match.index;

    // For periods, check if it's an abbreviation or part of an ellipsis
    if (punctuation === '.') {
      if (isAbbreviation(text, dotIndex)) continue;
      // Skip ellipsis: check if preceded or followed by another dot
      if ((dotIndex > 0 && text[dotIndex - 1] === '.') || text[dotIndex + 1] === '.') continue;
    }

    // The boundary is right after the punctuation + closing quotes + space
    return match.index + match[0].length;
  }

  return 0;
}

/**
 * Streaming sentence boundary detector. Feed it text chunks and it
 * emits complete sentences via the callback.
 */
export class SentenceBuffer {
  private buffer = '';

  /** Feed a new chunk of text. Returns any complete sentences found. */
  push(chunk: string): string[] {
    this.buffer += chunk;
    const sentences: string[] = [];

    let boundary = findSentenceBoundary(this.buffer);
    while (boundary > 0) {
      const sentence = this.buffer.slice(0, boundary).trim();
      if (sentence) {
        sentences.push(sentence);
      }
      this.buffer = this.buffer.slice(boundary);
      boundary = findSentenceBoundary(this.buffer);
    }

    return sentences;
  }

  /** Flush any remaining buffered text (call when stream ends). */
  flush(): string | null {
    const remaining = this.buffer.trim();
    this.buffer = '';
    return remaining || null;
  }

  /** Get current buffer contents without modifying state. */
  peek(): string {
    return this.buffer;
  }
}
