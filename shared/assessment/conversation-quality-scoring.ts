/**
 * Conversation Quality Scoring
 *
 * Automated scoring of player conversation quality during quest objectives.
 * Computes metrics across 5 dimensions from a conversation transcript:
 *   - vocabularyDiversity: Type-token ratio of player's target-language words
 *   - responseLength: Mean length of player utterances (in words)
 *   - targetLanguageUsage: Ratio of target-language words to total words
 *   - engagement: Sustained turn participation (player turn count)
 *   - conversationFlow: Responsiveness and turn balance
 *
 * Each dimension produces a 0–100 sub-score. The overall quality score is
 * a weighted average, also 0–100, and maps to a letter grade (A/B/C/D/F).
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: 'player' | 'npc';
  text: string;
  /** Unix timestamp in ms (optional, used for responsiveness scoring). */
  timestamp?: number;
}

export interface ConversationQualityDimensions {
  /** Type-token ratio (unique words / total words) scaled to 0-100. */
  vocabularyDiversity: number;
  /** Mean utterance length score scaled to 0-100. */
  responseLength: number;
  /** Ratio of target-language words to total player words, 0-100. */
  targetLanguageUsage: number;
  /** Engagement based on sustained turn count, 0-100. */
  engagement: number;
  /** Turn balance and responsiveness, 0-100. */
  conversationFlow: number;
}

export interface ConversationQualityScore {
  /** Overall quality score 0-100. */
  overall: number;
  /** Letter grade: A (90+), B (70-89), C (50-69), D (30-49), F (<30). */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** Per-dimension scores. */
  dimensions: ConversationQualityDimensions;
  /** Number of player turns analyzed. */
  playerTurnCount: number;
  /** Total words spoken by the player. */
  totalPlayerWords: number;
  /** Unique words spoken by the player. */
  uniquePlayerWords: number;
}

/** Weights for each dimension (must sum to 1). */
export const DIMENSION_WEIGHTS: Record<keyof ConversationQualityDimensions, number> = {
  vocabularyDiversity: 0.25,
  responseLength: 0.20,
  targetLanguageUsage: 0.25,
  engagement: 0.15,
  conversationFlow: 0.15,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Tokenize text into lowercase words, stripping punctuation. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'\u00C0-\u024F\u1E00-\u1EFF-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

/**
 * Compute a letter grade from a numeric score.
 */
export function computeQualityGrade(score: number): ConversationQualityScore['grade'] {
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

/**
 * Clamp a value to the 0-100 range.
 */
function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ── Dimension Scorers ───────────────────────────────────────────────────────

/**
 * Score vocabulary diversity using type-token ratio.
 * TTR of 0.3 or below = 0, TTR of 0.8+ = 100. Linear interpolation.
 */
export function scoreVocabularyDiversity(words: string[]): number {
  if (words.length === 0) return 0;
  const unique = new Set(words).size;
  const ttr = unique / words.length;
  // Scale: 0.3 → 0, 0.8 → 100
  return clamp100(((ttr - 0.3) / 0.5) * 100);
}

/**
 * Score mean utterance length.
 * Average of 1 word = 20, 3 words = 50, 6+ words = 100.
 */
export function scoreResponseLength(playerTurns: string[]): number {
  if (playerTurns.length === 0) return 0;
  const lengths = playerTurns.map(t => tokenize(t).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  // Scale: 1 → 20, 6 → 100 (linear from 1 to 6)
  if (mean <= 1) return 20;
  return clamp100(20 + ((mean - 1) / 5) * 80);
}

/**
 * Score target-language usage ratio.
 * Takes the set of known target-language vocabulary; any player word
 * found in that set counts as target-language usage.
 * If no vocabulary list is provided, returns 100 (assume all target-language).
 */
export function scoreTargetLanguageUsage(
  playerWords: string[],
  targetVocabulary?: Set<string>,
): number {
  if (playerWords.length === 0) return 0;
  if (!targetVocabulary || targetVocabulary.size === 0) return 100;

  const targetCount = playerWords.filter(w => targetVocabulary.has(w)).length;
  const ratio = targetCount / playerWords.length;
  return clamp100(ratio * 100);
}

/**
 * Score engagement based on player turn count.
 * 1 turn = 20, 3 turns = 50, 5+ turns = 100.
 */
export function scoreEngagement(playerTurnCount: number): number {
  if (playerTurnCount === 0) return 0;
  if (playerTurnCount >= 5) return 100;
  // Linear from 1→20 to 5→100
  return clamp100(20 + ((playerTurnCount - 1) / 4) * 80);
}

/**
 * Score conversation flow: turn balance (player vs NPC turns)
 * and optional responsiveness (time between NPC message and player reply).
 *
 * Ideal balance is around 40-60% player turns. Perfect = 50%.
 */
export function scoreConversationFlow(turns: ConversationTurn[]): number {
  if (turns.length < 2) return turns.length === 0 ? 0 : 50;

  const playerTurns = turns.filter(t => t.role === 'player').length;
  const ratio = playerTurns / turns.length;

  // Score balance: 50% player = 100, deviations reduce score
  // 0% or 100% player = 0
  const balanceScore = 1 - Math.abs(ratio - 0.5) * 2;

  // Score responsiveness if timestamps available
  let responsivenessScore = 1;
  const timedPairs: number[] = [];
  for (let i = 1; i < turns.length; i++) {
    if (
      turns[i].role === 'player' &&
      turns[i - 1].role === 'npc' &&
      turns[i].timestamp != null &&
      turns[i - 1].timestamp != null
    ) {
      timedPairs.push(turns[i].timestamp! - turns[i - 1].timestamp!);
    }
  }

  if (timedPairs.length > 0) {
    const avgResponseMs = timedPairs.reduce((a, b) => a + b, 0) / timedPairs.length;
    // <5s = 100, 5-30s = linear drop, >30s = 20
    if (avgResponseMs <= 5000) {
      responsivenessScore = 1;
    } else if (avgResponseMs >= 30000) {
      responsivenessScore = 0.2;
    } else {
      responsivenessScore = 1 - ((avgResponseMs - 5000) / 25000) * 0.8;
    }
  }

  // 60% balance, 40% responsiveness
  return clamp100((balanceScore * 0.6 + responsivenessScore * 0.4) * 100);
}

// ── Main Scorer ─────────────────────────────────────────────────────────────

/**
 * Score the quality of a conversation transcript for quest objective evaluation.
 *
 * @param turns - The conversation transcript
 * @param targetVocabulary - Optional set of known target-language words for L2 usage scoring
 * @returns A ConversationQualityScore with overall score, grade, and per-dimension breakdown
 */
export function scoreConversationQuality(
  turns: ConversationTurn[],
  targetVocabulary?: Set<string>,
): ConversationQualityScore {
  const playerTurns = turns.filter(t => t.role === 'player');
  const playerTexts = playerTurns.map(t => t.text);
  const allPlayerWords = playerTexts.flatMap(t => tokenize(t));
  const uniqueWords = new Set(allPlayerWords);

  const dimensions: ConversationQualityDimensions = {
    vocabularyDiversity: scoreVocabularyDiversity(allPlayerWords),
    responseLength: scoreResponseLength(playerTexts),
    targetLanguageUsage: scoreTargetLanguageUsage(allPlayerWords, targetVocabulary),
    engagement: scoreEngagement(playerTurns.length),
    conversationFlow: scoreConversationFlow(turns),
  };

  const overall = clamp100(
    Object.entries(DIMENSION_WEIGHTS).reduce(
      (sum, [key, weight]) => sum + dimensions[key as keyof ConversationQualityDimensions] * weight,
      0,
    ),
  );

  return {
    overall,
    grade: computeQualityGrade(overall),
    dimensions,
    playerTurnCount: playerTurns.length,
    totalPlayerWords: allPlayerWords.length,
    uniquePlayerWords: uniqueWords.size,
  };
}

/**
 * Check whether a conversation quality score meets a minimum threshold.
 * Used by quest objectives to gate completion on conversation quality.
 */
export function meetsQualityThreshold(
  score: ConversationQualityScore,
  minOverall: number = 50,
  minDimensions?: Partial<ConversationQualityDimensions>,
): boolean {
  if (score.overall < minOverall) return false;

  if (minDimensions) {
    for (const [key, minValue] of Object.entries(minDimensions)) {
      const dimKey = key as keyof ConversationQualityDimensions;
      if (score.dimensions[dimKey] < minValue) return false;
    }
  }

  return true;
}
