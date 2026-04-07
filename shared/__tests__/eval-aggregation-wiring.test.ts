/**
 * Tests for US-010: Wire EVAL dimension score aggregation.
 *
 * Verifies that:
 * - endConversation() computes running averages via computeAverageDimensionScores()
 * - endConversation() computes per-dimension trends via computeDimensionTrend()
 * - FluencyGainResult contains dimensionAverages and dimensionTrends after conversations with EVAL scores
 * - Improving vocabulary scores over multiple conversations produce an "improving" trend
 */

import { LanguageProgressTracker } from '../game-engine/logic/LanguageProgressTracker';
import type { FluencyGainResult } from '../language/progress';

function makeEvalBlock(v: number, g: number, f: number, c: number, t: number): string {
  return `**EVAL**\nVocabulary: ${v}\nGrammar: ${g}\nFluency: ${f}\nComprehension: ${c}\nTaskCompletion: ${t}\n**END_EVAL**`;
}

/** Minimal world language context so analyzePlayerMessage doesn't bail early */
const MOCK_LANGUAGE_CONTEXT = {
  targetLanguage: 'french',
  worldLanguages: [],
  primaryLanguage: { name: 'French', code: 'fr', sampleWords: { hello: 'bonjour' } } as any,
  learningTargetLanguage: null,
};

/**
 * Helper: run one conversation with given EVAL scores through the tracker.
 * Records a player turn so the conversation meets the minimum turn requirement.
 */
function runConversation(
  tracker: LanguageProgressTracker,
  npcId: string,
  evalScores: { v: number; g: number; f: number; c: number; t: number },
): FluencyGainResult | null {
  tracker.startConversation(npcId, `NPC ${npcId}`);
  // Record a player turn to meet minimum turn requirement
  tracker.analyzePlayerMessage('Bonjour, comment ça va?');
  // Record EVAL scores via the raw response
  const evalBlock = makeEvalBlock(evalScores.v, evalScores.g, evalScores.f, evalScores.c, evalScores.t);
  tracker.recordEvalScores(`Some response text ${evalBlock}`);
  return tracker.endConversation();
}

describe('US-010: EVAL dimension score aggregation wiring', () => {
  let tracker: LanguageProgressTracker;

  beforeEach(() => {
    tracker = new LanguageProgressTracker('player1', 'world1', 'french');
    tracker.setWorldLanguageContext(MOCK_LANGUAGE_CONTEXT);
  });

  it('computes correct averages across 5 conversations with EVAL scores', () => {
    const scores = [
      { v: 2, g: 3, f: 4, c: 3, t: 2 },
      { v: 3, g: 4, f: 3, c: 4, t: 3 },
      { v: 4, g: 3, f: 4, c: 3, t: 4 },
      { v: 3, g: 4, f: 3, c: 4, t: 3 },
      { v: 3, g: 1, f: 1, c: 1, t: 3 },
    ];

    let lastResult: FluencyGainResult | null = null;
    for (let i = 0; i < scores.length; i++) {
      lastResult = runConversation(tracker, `npc_${i}`, scores[i]);
    }

    expect(lastResult).not.toBeNull();
    expect(lastResult!.dimensionAverages).toBeDefined();

    const avg = lastResult!.dimensionAverages!;
    // Expected averages: v=(2+3+4+3+3)/5=3, g=(3+4+3+4+1)/5=3, f=(4+3+4+3+1)/5=3, c=(3+4+3+4+1)/5=3, t=(2+3+4+3+3)/5=3
    expect(avg.vocabulary).toBe(3);
    expect(avg.grammar).toBe(3);
    expect(avg.fluency).toBe(3);
    expect(avg.comprehension).toBe(3);
    expect(avg.taskCompletion).toBe(3);
  });

  it('returns dimensionTrends after conversations with EVAL scores', () => {
    // Run enough conversations to populate trends (need >=4 entries for non-stable)
    const scores = [
      { v: 2, g: 3, f: 3, c: 3, t: 3 },
      { v: 2, g: 3, f: 3, c: 3, t: 3 },
      { v: 3, g: 3, f: 3, c: 3, t: 3 },
      { v: 3, g: 3, f: 3, c: 3, t: 3 },
    ];

    let lastResult: FluencyGainResult | null = null;
    for (let i = 0; i < scores.length; i++) {
      lastResult = runConversation(tracker, `npc_${i}`, scores[i]);
    }

    expect(lastResult).not.toBeNull();
    expect(lastResult!.dimensionTrends).toBeDefined();
    // All dimensions should have a trend value
    expect(lastResult!.dimensionTrends!.vocabulary).toBeDefined();
    expect(lastResult!.dimensionTrends!.grammar).toBeDefined();
    expect(lastResult!.dimensionTrends!.fluency).toBeDefined();
    expect(lastResult!.dimensionTrends!.comprehension).toBeDefined();
    expect(lastResult!.dimensionTrends!.taskCompletion).toBeDefined();
  });

  it('detects improving vocabulary trend over 5 conversations', () => {
    // Vocabulary improving from 1 to 5, other dimensions stable
    const scores = [
      { v: 1, g: 3, f: 3, c: 3, t: 3 },
      { v: 2, g: 3, f: 3, c: 3, t: 3 },
      { v: 3, g: 3, f: 3, c: 3, t: 3 },
      { v: 4, g: 3, f: 3, c: 3, t: 3 },
      { v: 5, g: 3, f: 3, c: 3, t: 3 },
      { v: 5, g: 3, f: 3, c: 3, t: 3 },
    ];

    let lastResult: FluencyGainResult | null = null;
    for (let i = 0; i < scores.length; i++) {
      lastResult = runConversation(tracker, `npc_${i}`, scores[i]);
    }

    expect(lastResult).not.toBeNull();
    expect(lastResult!.dimensionTrends).toBeDefined();
    expect(lastResult!.dimensionTrends!.vocabulary).toBe('improving');
    // Grammar/fluency/comprehension/taskCompletion should be stable
    expect(lastResult!.dimensionTrends!.grammar).toBe('stable');
    expect(lastResult!.dimensionTrends!.fluency).toBe('stable');
  });

  it('does not produce dimensionAverages or dimensionTrends without EVAL scores', () => {
    tracker.startConversation('npc_1', 'NPC 1');
    tracker.analyzePlayerMessage('Hello there');
    const result = tracker.endConversation();

    expect(result).not.toBeNull();
    expect(result!.dimensionAverages).toBeUndefined();
    expect(result!.dimensionTrends).toBeUndefined();
  });

  it('single conversation produces averages equal to that conversation scores', () => {
    const result = runConversation(tracker, 'npc_1', { v: 4, g: 3, f: 5, c: 2, t: 4 });

    expect(result).not.toBeNull();
    expect(result!.dimensionAverages).toBeDefined();
    expect(result!.dimensionAverages!.vocabulary).toBe(4);
    expect(result!.dimensionAverages!.grammar).toBe(3);
    expect(result!.dimensionAverages!.fluency).toBe(5);
    expect(result!.dimensionAverages!.comprehension).toBe(2);
    expect(result!.dimensionAverages!.taskCompletion).toBe(4);
  });
});
