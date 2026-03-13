/**
 * Pronunciation Scoring
 *
 * Compares a player's spoken transcript (from STT) against an expected phrase
 * and produces a word-level accuracy score with feedback.
 */

export interface PronunciationResult {
  overallScore: number;        // 0-100 accuracy
  wordResults: WordResult[];
  feedback: string;            // Human-readable feedback
  expectedPhrase: string;
  spokenPhrase: string;
}

export interface WordResult {
  expected: string;
  spoken: string | null;       // null if word was missed entirely
  match: 'exact' | 'close' | 'missed' | 'extra';
  similarity: number;          // 0-1
}

/**
 * Normalize text for comparison: lowercase, remove punctuation, collapse whitespace
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}\-—–…]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/**
 * Compute word-level similarity (0-1) using normalized Levenshtein distance
 */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Score pronunciation by comparing expected phrase to STT transcript.
 * Uses word-level alignment with fuzzy matching.
 */
export function scorePronunciation(expected: string, spoken: string): PronunciationResult {
  const expectedNorm = normalize(expected);
  const spokenNorm = normalize(spoken);

  const expectedWords = expectedNorm.split(' ').filter(w => w.length > 0);
  const spokenWords = spokenNorm.split(' ').filter(w => w.length > 0);

  if (expectedWords.length === 0) {
    return {
      overallScore: 100,
      wordResults: [],
      feedback: 'No expected phrase to compare.',
      expectedPhrase: expected,
      spokenPhrase: spoken,
    };
  }

  const wordResults: WordResult[] = [];
  const usedSpoken = new Set<number>();

  // Match each expected word to the best spoken word
  for (const expWord of expectedWords) {
    let bestIdx = -1;
    let bestSim = 0;

    for (let j = 0; j < spokenWords.length; j++) {
      if (usedSpoken.has(j)) continue;
      const sim = wordSimilarity(expWord, spokenWords[j]);
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = j;
      }
    }

    const CLOSE_THRESHOLD = 0.6;

    if (bestIdx >= 0 && bestSim >= CLOSE_THRESHOLD) {
      usedSpoken.add(bestIdx);
      wordResults.push({
        expected: expWord,
        spoken: spokenWords[bestIdx],
        match: bestSim === 1 ? 'exact' : 'close',
        similarity: bestSim,
      });
    } else {
      wordResults.push({
        expected: expWord,
        spoken: null,
        match: 'missed',
        similarity: 0,
      });
    }
  }

  // Mark extra spoken words
  for (let j = 0; j < spokenWords.length; j++) {
    if (!usedSpoken.has(j)) {
      wordResults.push({
        expected: '',
        spoken: spokenWords[j],
        match: 'extra',
        similarity: 0,
      });
    }
  }

  // Calculate overall score
  const matchedWords = wordResults.filter(w => w.match !== 'extra');
  const totalSimilarity = matchedWords.reduce((sum, w) => sum + w.similarity, 0);
  const overallScore = Math.round((totalSimilarity / expectedWords.length) * 100);

  // Generate feedback
  const missed = wordResults.filter(w => w.match === 'missed');
  const close = wordResults.filter(w => w.match === 'close');
  const exact = wordResults.filter(w => w.match === 'exact');

  let feedback: string;
  if (overallScore >= 90) {
    feedback = 'Excellent pronunciation!';
  } else if (overallScore >= 70) {
    feedback = 'Good attempt!';
    if (close.length > 0) {
      const tips = close.slice(0, 2).map(w =>
        `"${w.spoken}" → try "${w.expected}"`
      ).join(', ');
      feedback += ` Close on: ${tips}`;
    }
  } else if (overallScore >= 40) {
    feedback = 'Keep practicing!';
    if (missed.length > 0) {
      feedback += ` Missed: ${missed.slice(0, 3).map(w => `"${w.expected}"`).join(', ')}`;
    }
  } else {
    feedback = `Try again — listen carefully to: "${expected}"`;
  }

  return {
    overallScore,
    wordResults,
    feedback,
    expectedPhrase: expected,
    spokenPhrase: spoken,
  };
}

/**
 * Format a pronunciation result as a short display string.
 */
export function formatPronunciationFeedback(result: PronunciationResult): string {
  const scoreEmoji = result.overallScore >= 90 ? '🌟' :
                     result.overallScore >= 70 ? '👍' :
                     result.overallScore >= 40 ? '📝' : '🔄';
  return `${scoreEmoji} ${result.overallScore}% — ${result.feedback}`;
}
