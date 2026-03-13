/**
 * Splits text into sentences for streaming TTS.
 * Handles common abbreviations and edge cases to avoid
 * splitting mid-abbreviation (e.g., "Dr.", "Mr.", "U.S.").
 */

const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'ave', 'blvd',
  'etc', 'vs', 'approx', 'dept', 'est', 'vol', 'no', 'gen', 'sgt',
  'lt', 'col', 'capt', 'cpl', 'pvt', 'rev', 'hon', 'pres',
]);

/**
 * Extract complete sentences from accumulated text.
 * Returns [completeSentences[], remainingText].
 *
 * A sentence boundary is a '.', '!', or '?' followed by whitespace or end-of-string,
 * unless preceded by a known abbreviation.
 */
export function extractSentences(text: string): [string[], string] {
  const sentences: string[] = [];
  let remaining = text;

  // Match sentence-ending punctuation followed by whitespace.
  // Negative lookbehind excludes ellipsis (.. before the matched .)
  const pattern = /(?<!\.)([.!?])\s+/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(remaining)) !== null) {
    const endPos = match.index + match[0].length;
    const candidate = remaining.slice(lastIndex, match.index + 1).trim();

    // Check if this is an abbreviation (only for periods)
    if (match[1] === '.') {
      const words = candidate.split(/\s+/);
      const lastWord = words[words.length - 1].replace(/\.$/, '').toLowerCase();
      if (ABBREVIATIONS.has(lastWord)) {
        continue; // Skip — this period is part of an abbreviation
      }
    }

    if (candidate.length > 0) {
      sentences.push(candidate);
    }
    lastIndex = endPos;
  }

  remaining = remaining.slice(lastIndex);
  return [sentences, remaining];
}
