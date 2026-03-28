/**
 * NPC Conversation Prompts — Vocabulary Review & Grammar Focus
 *
 * Builds dynamic prompt additions for NPC conversations that incorporate
 * vocabulary the player needs to review (spaced repetition) and grammar
 * patterns the player struggles with. NPCs naturally weave these into
 * dialogue without breaking character.
 */

import type { VocabularyEntry, GrammarPattern } from './progress';
import { selectWordsForReview } from './vocabulary-review';

// ── Configuration ────────────────────────────────────────────────────────────

/** Max review words to include in a single NPC prompt. */
const MAX_REVIEW_WORDS = 8;

/** Max grammar patterns to surface per conversation. */
const MAX_GRAMMAR_PATTERNS = 3;

/** Grammar accuracy threshold — patterns below this are flagged for review. */
const LOW_ACCURACY_THRESHOLD = 0.7;

/** Minimum attempts before a pattern is considered "struggling". */
const MIN_PATTERN_ATTEMPTS = 2;

// ── Public Types ─────────────────────────────────────────────────────────────

export interface ReviewWordForNPC {
  word: string;
  meaning: string;
  masteryLevel: string;
  category?: string;
}

export interface WeakGrammarPattern {
  pattern: string;
  accuracy: number;
  totalAttempts: number;
  recentExamples: string[];
}

export interface VocabGrammarPromptContext {
  reviewWords: ReviewWordForNPC[];
  weakGrammarPatterns: WeakGrammarPattern[];
  playerProficiency: string;
  targetLanguage: string;
}

// ── Word Selection ───────────────────────────────────────────────────────────

/**
 * Select vocabulary words for an NPC to naturally incorporate into conversation.
 * Prioritizes words due for spaced-repetition review, capped at MAX_REVIEW_WORDS.
 */
export function getReviewWordsForNPC(
  vocabulary: VocabularyEntry[],
  count: number = MAX_REVIEW_WORDS,
  now?: number,
): ReviewWordForNPC[] {
  const selected = selectWordsForReview(vocabulary, count, now);
  return selected.map(entry => ({
    word: entry.word,
    meaning: entry.meaning,
    masteryLevel: entry.masteryLevel,
    category: entry.category,
  }));
}

// ── Grammar Pattern Selection ────────────────────────────────────────────────

/**
 * Identify grammar patterns the player struggles with most.
 * Returns patterns sorted by accuracy (lowest first), filtered to those
 * below the accuracy threshold with enough attempts to be meaningful.
 */
export function getWeakGrammarPatterns(
  grammarPatterns: GrammarPattern[],
  count: number = MAX_GRAMMAR_PATTERNS,
): WeakGrammarPattern[] {
  return grammarPatterns
    .filter(gp => {
      const total = gp.timesUsedCorrectly + gp.timesUsedIncorrectly;
      if (total < MIN_PATTERN_ATTEMPTS) return false;
      const accuracy = gp.timesUsedCorrectly / total;
      return accuracy < LOW_ACCURACY_THRESHOLD;
    })
    .map(gp => {
      const total = gp.timesUsedCorrectly + gp.timesUsedIncorrectly;
      return {
        pattern: gp.pattern,
        accuracy: Math.round((gp.timesUsedCorrectly / total) * 100),
        totalAttempts: total,
        recentExamples: gp.examples.slice(-3),
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, count);
}

// ── Prompt Building ──────────────────────────────────────────────────────────

/**
 * Build the vocabulary review and grammar focus addition to the NPC system prompt.
 * Returns empty string if there's nothing to review.
 */
export function buildVocabGrammarPrompt(ctx: VocabGrammarPromptContext): string {
  const lines: string[] = [];

  if (ctx.reviewWords.length === 0 && ctx.weakGrammarPatterns.length === 0) {
    return '';
  }

  lines.push(`\nVOCABULARY & GRAMMAR REVIEW:`);
  lines.push(`The player is learning ${ctx.targetLanguage} at ${ctx.playerProficiency} level.`);

  // Vocabulary review section
  if (ctx.reviewWords.length > 0) {
    const wordList = ctx.reviewWords
      .map(w => `"${w.word}" (${w.meaning}, ${w.masteryLevel})`)
      .join(', ');
    lines.push(`Words due for review: ${wordList}.`);
    lines.push(`Try to naturally use 2-3 of these words in your responses. Steer the conversation toward topics where these words fit organically.`);

    // Mastery-aware instructions
    const newWords = ctx.reviewWords.filter(w => w.masteryLevel === 'new' || w.masteryLevel === 'learning');
    if (newWords.length > 0) {
      lines.push(`For newer words (${newWords.map(w => `"${w.word}"`).join(', ')}): use them in context and pause briefly to let the player hear them clearly.`);
    }

    const familiarWords = ctx.reviewWords.filter(w => w.masteryLevel === 'familiar' || w.masteryLevel === 'mastered');
    if (familiarWords.length > 0) {
      lines.push(`For familiar words (${familiarWords.map(w => `"${w.word}"`).join(', ')}): use them naturally without drawing attention — the player should recognize them in flow.`);
    }
  }

  // Grammar focus section
  if (ctx.weakGrammarPatterns.length > 0) {
    const patternList = ctx.weakGrammarPatterns
      .map(p => `"${p.pattern}" (${p.accuracy}% accuracy)`)
      .join(', ');
    lines.push(`Grammar patterns the player struggles with: ${patternList}.`);
    lines.push(`Model correct usage of these patterns in your speech. If the player makes an error with one of these patterns, gently correct them in character:`);
    lines.push(`- Rephrase what they said correctly: "Ah, you mean [correct form]? Yes, exactly!"`);
    lines.push(`- Or model the correct form naturally in your reply`);
    lines.push(`- Do NOT use grammar terminology or break character`);
  }

  return lines.join('\n');
}
