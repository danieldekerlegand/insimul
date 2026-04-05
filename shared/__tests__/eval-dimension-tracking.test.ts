/**
 * Tests for US-003: Aggregate EVAL dimension scores into long-term tracking.
 *
 * Covers:
 * - EVAL block parsing
 * - Dimension score history accumulation
 * - Rolling average computation
 * - Dimension trend analysis
 * - Integration with conversation quality scoring
 * - Periodic assessment dimension context
 */

import {
  parseEvalBlock,
  computeAverageDimensionScores,
  computeDimensionTrend,
} from '../language/progress';
import type { DimensionScoreEntry, EvalDimensionScores } from '../language/progress';
import {
  scoreConversationQuality,
  evalScoresToSignal,
} from '../assessment/conversation-quality-scoring';
import type { ConversationTurn } from '../assessment/conversation-quality-scoring';
import {
  buildPeriodicAssessmentDimensionContext,
} from '../assessment/periodic-encounter';

// ── Helpers ───────────────────────────────────────────────────────────────

function makeEvalBlock(v: number, g: number, f: number, c: number, t: number): string {
  return `**EVAL**\nVocabulary: ${v}\nGrammar: ${g}\nFluency: ${f}\nComprehension: ${c}\nTaskCompletion: ${t}\n**END_EVAL**`;
}

function makeEntry(
  scores: EvalDimensionScores,
  overrides?: Partial<DimensionScoreEntry>,
): DimensionScoreEntry {
  return {
    timestamp: Date.now(),
    conversationId: 'conv_1',
    npcId: 'npc_1',
    scores,
    ...overrides,
  };
}

function makeScores(v: number, g: number, f: number, c: number, t: number): EvalDimensionScores {
  return { vocabulary: v, grammar: g, fluency: f, comprehension: c, taskCompletion: t };
}

// ── EVAL Block Parsing ────────────────────────────────────────────────────

describe('parseEvalBlock', () => {
  it('parses a complete EVAL block with all 5 dimensions', () => {
    const response = `Bonjour! Comment ça va?\n${makeEvalBlock(3, 2, 4, 3, 2)}`;
    const { scores, cleanedResponse } = parseEvalBlock(response);

    expect(scores).toEqual({
      vocabulary: 3,
      grammar: 2,
      fluency: 4,
      comprehension: 3,
      taskCompletion: 2,
    });
    expect(cleanedResponse).toBe('Bonjour! Comment ça va?');
  });

  it('returns null scores when no EVAL block is present', () => {
    const { scores, cleanedResponse } = parseEvalBlock('Just a normal response');
    expect(scores).toBeNull();
    expect(cleanedResponse).toBe('Just a normal response');
  });

  it('returns null scores when EVAL block is incomplete (missing dimensions)', () => {
    const block = '**EVAL**\nVocabulary: 3\nGrammar: 2\n**END_EVAL**';
    const { scores } = parseEvalBlock(`Hello ${block}`);
    expect(scores).toBeNull();
  });

  it('handles scores at boundaries (1 and 5)', () => {
    const { scores } = parseEvalBlock(makeEvalBlock(1, 1, 1, 1, 1));
    expect(scores).toEqual(makeScores(1, 1, 1, 1, 1));

    const { scores: maxScores } = parseEvalBlock(makeEvalBlock(5, 5, 5, 5, 5));
    expect(maxScores).toEqual(makeScores(5, 5, 5, 5, 5));
  });

  it('strips EVAL block from response text', () => {
    const response = `Hello there.\n${makeEvalBlock(3, 3, 3, 3, 3)}\nExtra text`;
    const { cleanedResponse } = parseEvalBlock(response);
    expect(cleanedResponse).not.toContain('EVAL');
    expect(cleanedResponse).not.toContain('END_EVAL');
  });

  it('handles EVAL block embedded in middle of text', () => {
    const text = `Start text. ${makeEvalBlock(4, 3, 4, 5, 3)} End text.`;
    const { scores, cleanedResponse } = parseEvalBlock(text);
    expect(scores).not.toBeNull();
    expect(cleanedResponse).toContain('Start text.');
    expect(cleanedResponse).toContain('End text.');
  });
});

// ── Average Dimension Scores ──────────────────────────────────────────────

describe('computeAverageDimensionScores', () => {
  it('returns null for empty entries', () => {
    expect(computeAverageDimensionScores([])).toBeNull();
  });

  it('returns exact scores for a single entry', () => {
    const entries = [makeEntry(makeScores(3, 4, 2, 5, 1))];
    const avg = computeAverageDimensionScores(entries);
    expect(avg).toEqual(makeScores(3, 4, 2, 5, 1));
  });

  it('computes correct averages across multiple entries', () => {
    const entries = [
      makeEntry(makeScores(2, 4, 3, 3, 2)),
      makeEntry(makeScores(4, 2, 5, 3, 4)),
    ];
    const avg = computeAverageDimensionScores(entries);
    expect(avg).toEqual(makeScores(3, 3, 4, 3, 3));
  });

  it('respects lastN parameter', () => {
    const entries = [
      makeEntry(makeScores(1, 1, 1, 1, 1)), // should be excluded
      makeEntry(makeScores(4, 4, 4, 4, 4)),
      makeEntry(makeScores(2, 2, 2, 2, 2)),
    ];
    const avg = computeAverageDimensionScores(entries, 2);
    expect(avg).toEqual(makeScores(3, 3, 3, 3, 3));
  });

  it('handles lastN larger than entries length', () => {
    const entries = [makeEntry(makeScores(3, 3, 3, 3, 3))];
    const avg = computeAverageDimensionScores(entries, 100);
    expect(avg).toEqual(makeScores(3, 3, 3, 3, 3));
  });
});

// ── Dimension Trend ───────────────────────────────────────────────────────

describe('computeDimensionTrend', () => {
  it('returns stable for fewer than 4 entries', () => {
    const entries = [
      makeEntry(makeScores(1, 1, 1, 1, 1)),
      makeEntry(makeScores(5, 5, 5, 5, 5)),
    ];
    expect(computeDimensionTrend(entries, 'vocabulary')).toBe('stable');
  });

  it('detects improving trend', () => {
    const entries = [
      makeEntry(makeScores(1, 1, 1, 1, 1)),
      makeEntry(makeScores(2, 2, 2, 2, 2)),
      makeEntry(makeScores(3, 3, 3, 3, 3)),
      makeEntry(makeScores(4, 4, 4, 4, 4)),
      makeEntry(makeScores(5, 5, 5, 5, 5)),
      makeEntry(makeScores(5, 5, 5, 5, 5)),
    ];
    expect(computeDimensionTrend(entries, 'vocabulary')).toBe('improving');
  });

  it('detects declining trend', () => {
    const entries = [
      makeEntry(makeScores(5, 5, 5, 5, 5)),
      makeEntry(makeScores(5, 5, 5, 5, 5)),
      makeEntry(makeScores(3, 3, 3, 3, 3)),
      makeEntry(makeScores(2, 2, 2, 2, 2)),
      makeEntry(makeScores(1, 1, 1, 1, 1)),
      makeEntry(makeScores(1, 1, 1, 1, 1)),
    ];
    expect(computeDimensionTrend(entries, 'grammar')).toBe('declining');
  });

  it('returns stable for flat scores', () => {
    const entries = Array.from({ length: 6 }, () =>
      makeEntry(makeScores(3, 3, 3, 3, 3)),
    );
    expect(computeDimensionTrend(entries, 'fluency')).toBe('stable');
  });

  it('analyzes specific dimension independently', () => {
    // Vocabulary improving, grammar declining
    const entries = [
      makeEntry(makeScores(1, 5, 3, 3, 3)),
      makeEntry(makeScores(2, 4, 3, 3, 3)),
      makeEntry(makeScores(3, 3, 3, 3, 3)),
      makeEntry(makeScores(4, 2, 3, 3, 3)),
      makeEntry(makeScores(5, 1, 3, 3, 3)),
      makeEntry(makeScores(5, 1, 3, 3, 3)),
    ];
    expect(computeDimensionTrend(entries, 'vocabulary')).toBe('improving');
    expect(computeDimensionTrend(entries, 'grammar')).toBe('declining');
    expect(computeDimensionTrend(entries, 'fluency')).toBe('stable');
  });

  it('respects windowSize parameter', () => {
    // Old entries (poor) should be outside window
    const entries = [
      makeEntry(makeScores(1, 1, 1, 1, 1)),
      makeEntry(makeScores(1, 1, 1, 1, 1)),
      makeEntry(makeScores(1, 1, 1, 1, 1)),
      makeEntry(makeScores(1, 1, 1, 1, 1)),
      // Recent entries (stable at 3)
      makeEntry(makeScores(3, 3, 3, 3, 3)),
      makeEntry(makeScores(3, 3, 3, 3, 3)),
      makeEntry(makeScores(3, 3, 3, 3, 3)),
      makeEntry(makeScores(3, 3, 3, 3, 3)),
    ];
    // With window of 4 (only the 3s), should be stable
    expect(computeDimensionTrend(entries, 'vocabulary', 4)).toBe('stable');
  });
});

// ── Conversation Quality Scoring Integration ──────────────────────────────

describe('conversation quality scoring with EVAL signal', () => {
  const turns: ConversationTurn[] = [
    { role: 'npc', text: 'Bonjour! Comment allez-vous?' },
    { role: 'player', text: 'Je vais bien merci et vous' },
    { role: 'npc', text: 'Très bien! Où habitez-vous?' },
    { role: 'player', text: 'J habite à Paris depuis cinq ans' },
  ];

  it('scores without EVAL returns no evalSignal', () => {
    const score = scoreConversationQuality(turns);
    expect(score.evalSignal).toBeUndefined();
    expect(score.overall).toBeGreaterThan(0);
  });

  it('blends EVAL signal at 20% weight', () => {
    const withoutEval = scoreConversationQuality(turns);
    const highEval = scoreConversationQuality(turns, undefined, makeScores(5, 5, 5, 5, 5));
    const lowEval = scoreConversationQuality(turns, undefined, makeScores(1, 1, 1, 1, 1));

    expect(highEval.evalSignal).toBe(100);
    expect(lowEval.evalSignal).toBe(0);
    // High EVAL should boost the overall score
    expect(highEval.overall).toBeGreaterThanOrEqual(withoutEval.overall);
    // Low EVAL should reduce the overall score
    expect(lowEval.overall).toBeLessThanOrEqual(withoutEval.overall);
  });

  it('evalScoresToSignal maps 1-5 scale to 0-100', () => {
    expect(evalScoresToSignal(makeScores(1, 1, 1, 1, 1))).toBe(0);
    expect(evalScoresToSignal(makeScores(5, 5, 5, 5, 5))).toBe(100);
    expect(evalScoresToSignal(makeScores(3, 3, 3, 3, 3))).toBe(50);
  });
});

// ── Periodic Assessment Dimension Context ─────────────────────────────────

describe('buildPeriodicAssessmentDimensionContext', () => {
  it('returns null averages and null weakest/strongest for empty history', () => {
    const ctx = buildPeriodicAssessmentDimensionContext([]);
    expect(ctx.recentAverages).toBeNull();
    expect(ctx.weakestDimension).toBeNull();
    expect(ctx.strongestDimension).toBeNull();
  });

  it('identifies weakest and strongest dimensions', () => {
    const entries = [
      makeEntry(makeScores(2, 4, 3, 5, 1)),
      makeEntry(makeScores(2, 4, 3, 5, 1)),
      makeEntry(makeScores(2, 4, 3, 5, 1)),
      makeEntry(makeScores(2, 4, 3, 5, 1)),
    ];
    const ctx = buildPeriodicAssessmentDimensionContext(entries);
    expect(ctx.weakestDimension).toBe('taskCompletion');
    expect(ctx.strongestDimension).toBe('comprehension');
  });

  it('computes trends across history', () => {
    const entries = [
      makeEntry(makeScores(1, 5, 3, 3, 3)),
      makeEntry(makeScores(2, 4, 3, 3, 3)),
      makeEntry(makeScores(3, 3, 3, 3, 3)),
      makeEntry(makeScores(4, 2, 3, 3, 3)),
      makeEntry(makeScores(5, 1, 3, 3, 3)),
      makeEntry(makeScores(5, 1, 3, 3, 3)),
    ];
    const ctx = buildPeriodicAssessmentDimensionContext(entries);
    expect(ctx.trends.vocabulary).toBe('improving');
    expect(ctx.trends.grammar).toBe('declining');
    expect(ctx.trends.fluency).toBe('stable');
  });

  it('provides recent averages from last 10 conversations', () => {
    const entries = Array.from({ length: 15 }, (_, i) =>
      makeEntry(makeScores(
        i < 5 ? 1 : 4,  // first 5 = low vocab, last 10 = high vocab
        3, 3, 3, 3,
      )),
    );
    const ctx = buildPeriodicAssessmentDimensionContext(entries);
    // Last 10 entries all have vocabulary=4
    expect(ctx.recentAverages?.vocabulary).toBe(4);
  });
});
