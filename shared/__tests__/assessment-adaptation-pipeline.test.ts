/**
 * Integration test: Assessment-to-Adaptation Pipeline
 *
 * Simulates the full player journey:
 *   initial assessment → A1 → conversations → auto-level-up →
 *   periodic assessment → grammar weakness → quest generation → improvement
 *
 * US-012 acceptance criteria item 6.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkCEFRAdvancement,
  getNPCLanguageBehavior,
  getHintBehavior,
  filterQuestsByCEFR,
  cefrToVocabularyRange,
  getCEFRTextComplexity,
  buildScaffoldingDirective,
  type CEFRProgressSnapshot,
} from '../language/cefr-adaptation';
import type { CEFRLevel } from '../assessment/cefr-mapping';
import {
  MASTERY_THRESHOLDS,
  getMasteryForCorrectCount,
  isWordMastered,
} from '../language/vocabulary-constants';
import { calculateMasteryLevel } from '../language/progress';
import type { LanguageProgress, DimensionScoreEntry, EvalDimensionScores, GrammarPattern } from '../language/progress';
import { computeAverageDimensionScores, computeDimensionTrend } from '../language/progress';
import {
  ConversationDifficultyMonitor,
  type TurnMetrics,
} from '../game-engine/logic/ConversationDifficultyMonitor';
import {
  isPeriodicAssessmentLevel,
  isPeriodicAssessmentCooldownMet,
  buildPeriodicAssessmentDimensionContext,
  buildPeriodicAssessmentGrammarContext,
} from '../assessment/periodic-encounter';
import { analyzeGrammarWeaknesses } from '../language/grammar-weakness-analyzer';
import { shouldGenerateGrammarQuest, generateGrammarQuests } from '../quests/grammar-quest-generator';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeProgress(overrides: Partial<LanguageProgress> = {}): LanguageProgress {
  return {
    playerId: 'player-1',
    worldId: 'world-1',
    language: 'French',
    overallFluency: 10,
    cefrLevel: 'A1',
    vocabulary: [],
    grammarPatterns: [],
    conversations: [],
    totalConversations: 0,
    totalWordsLearned: 0,
    totalCorrectUsages: 0,
    streakDays: 1,
    lastActivityTimestamp: Date.now(),
    dimensionScores: [],
    ...overrides,
  };
}

function makeSnapshot(level: CEFRLevel, words: number, convos: number, texts: number): CEFRProgressSnapshot {
  return {
    currentLevel: level,
    wordsLearned: words,
    wordsMastered: Math.floor(words * 0.3),
    conversationsCompleted: convos,
    textsRead: texts,
    grammarPatternsRecognized: Math.floor(convos * 0.5),
  };
}

function makeDimensionEntry(scores: EvalDimensionScores, timestamp?: number): DimensionScoreEntry {
  return {
    timestamp: timestamp ?? Date.now(),
    conversationId: `conv-${Math.random().toString(36).slice(2)}`,
    npcId: 'npc-1',
    scores,
  };
}

function makeWeakGrammarPattern(pattern: string, correct: number, incorrect: number): GrammarPattern {
  return {
    id: `grammar-${pattern.replace(/\s/g, '-')}`,
    pattern,
    language: 'French',
    timesUsedCorrectly: correct,
    timesUsedIncorrectly: incorrect,
    mastered: false,
    examples: [`Example of ${pattern}`],
    explanations: [`How ${pattern} works`],
  };
}

// ── Integration test ────────────────────────────────────────────────────────

describe('Assessment-to-Adaptation Pipeline (integration)', () => {
  it('simulates full journey from A1 initial assessment through advancement to B1', () => {
    // ── Step 1: Initial assessment places player at A1 ──────────────
    let cefrLevel: CEFRLevel = 'A1';

    // Verify A1 behavior baseline
    const a1Behavior = getNPCLanguageBehavior('A1', 'npc-merchant', 'French');
    expect(['bilingual', 'simplified']).toContain(a1Behavior.languageMode);

    const a1Hints = getHintBehavior('A1');
    expect(a1Hints.translationMode).toBe('inline');
    expect(a1Hints.showTranslateButton).toBe(true);

    const a1Vocab = cefrToVocabularyRange('A1');
    expect(a1Vocab.max).toBe(200);

    const a1Text = getCEFRTextComplexity('A1');
    expect(a1Text.maxSentenceWords).toBeLessThanOrEqual(10);

    // ── Step 2: Player has conversations at A1 ──────────────────────
    // Simulate 3 conversations with vocabulary learning
    let progress = makeProgress({ cefrLevel: 'A1' });
    const snapshot1 = makeSnapshot('A1', 30, 2, 0);
    const result1 = checkCEFRAdvancement(snapshot1);
    expect(result1.shouldAdvance).toBe(false); // not enough yet

    // ── Step 3: Mid-conversation scaffolding works ──────────────────
    const monitor = new ConversationDifficultyMonitor();
    // Player struggles for 2 turns
    const strugglingTurn: TurnMetrics = {
      grammarErrors: 4,
      grammarPatternsChecked: 5,
      targetLanguageWords: 1,
      totalPlayerWords: 2,
      qualityScore: 20,
    };
    monitor.recordTurn(strugglingTurn);
    const scaffoldAdj = monitor.recordTurn(strugglingTurn);
    expect(scaffoldAdj).not.toBeNull();
    expect(scaffoldAdj!.level).toBe('scaffolded');

    // Scaffolding directive is generated
    const scaffoldDirective = buildScaffoldingDirective('scaffolded', 'French');
    expect(scaffoldDirective).toContain('SCAFFOLDING');

    // Reset for next conversation
    monitor.reset();
    expect(monitor.currentLevel).toBe('none');

    // ── Step 4: Player reaches A1→A2 thresholds ────────────────────
    const snapshot2 = makeSnapshot('A1', 50, 3, 0);
    const result2 = checkCEFRAdvancement(snapshot2);
    expect(result2.shouldAdvance).toBe(true);
    expect(result2.nextLevel).toBe('A2');
    cefrLevel = 'A2';

    // ── Step 5: Verify A2 behavior changes ──────────────────────────
    const a2Behavior = getNPCLanguageBehavior('A2', 'npc-merchant', 'French');
    // A2 distribution: 30% bilingual, 70% simplified, 0% natural
    expect(['bilingual', 'simplified']).toContain(a2Behavior.languageMode);

    const a2Hints = getHintBehavior('A2');
    expect(a2Hints.newWordHintFrequency).toBe(3); // every 3rd word, not every word
    expect(a2Hints.translateButtonProminence).toBe(1); // less prominent than A1

    const a2Vocab = cefrToVocabularyRange('A2');
    expect(a2Vocab.max).toBe(500); // expanded from 200

    // Quest filtering reflects new level
    const quests = [
      { id: 1, cefrLevel: 'A1' },
      { id: 2, cefrLevel: 'A2' },
      { id: 3, cefrLevel: 'B1' },
      { id: 4, cefrLevel: 'B2' },
    ];
    const a2Quests = filterQuestsByCEFR(quests, 'A2');
    const a2QuestIds = a2Quests.map(q => q.id);
    expect(a2QuestIds).toContain(1); // A1 (-1 level)
    expect(a2QuestIds).toContain(2); // A2 (same)
    expect(a2QuestIds).toContain(3); // B1 (+1 level)
    expect(a2QuestIds).not.toContain(4); // B2 (too far)

    // ── Step 6: Periodic assessment triggers at milestone ───────────
    // Player completes quest #5
    expect(isPeriodicAssessmentLevel(5)).toBe(true);
    // Cooldown check — first assessment, so cooldown is met
    expect(isPeriodicAssessmentCooldownMet(null)).toBe(true);

    // Dimension scores from recent conversations feed into assessment
    const dimEntries: DimensionScoreEntry[] = [
      makeDimensionEntry({ vocabulary: 3, grammar: 2, fluency: 3, comprehension: 4, taskCompletion: 3 }),
      makeDimensionEntry({ vocabulary: 3, grammar: 2, fluency: 4, comprehension: 3, taskCompletion: 4 }),
      makeDimensionEntry({ vocabulary: 4, grammar: 2, fluency: 3, comprehension: 4, taskCompletion: 3 }),
    ];
    const dimContext = buildPeriodicAssessmentDimensionContext(dimEntries);
    expect(dimContext.weakestDimension).toBe('grammar'); // consistently lowest
    expect(dimContext.recentAverages).not.toBeNull();
    expect(dimContext.recentAverages!.grammar).toBe(2);

    // After assessment, cooldown kicks in
    const assessmentTime = Date.now();
    expect(isPeriodicAssessmentCooldownMet(assessmentTime)).toBe(false);

    // ── Step 7: Grammar weakness detection → quest generation ───────
    const weakPatterns: GrammarPattern[] = [
      makeWeakGrammarPattern('past tense', 1, 5),   // 83% error rate
      makeWeakGrammarPattern('articles', 2, 4),      // 67% error rate
      makeWeakGrammarPattern('subject-verb agreement', 4, 1), // 20% error rate — not weak
    ];
    progress = makeProgress({
      cefrLevel: 'A2',
      grammarPatterns: weakPatterns,
    });

    const weaknessAnalysis = analyzeGrammarWeaknesses(progress);
    expect(weaknessAnalysis.weaknesses.length).toBeGreaterThanOrEqual(2);
    expect(weaknessAnalysis.weaknesses[0].pattern).toBe('past tense');
    expect(weaknessAnalysis.weaknesses[0].errorRate).toBeGreaterThan(0.5);

    // Grammar context for periodic assessment
    const grammarContext = buildPeriodicAssessmentGrammarContext(progress);
    expect(grammarContext.weakPatterns).toContain('past tense');
    expect(grammarContext.weakPatterns).toContain('articles');
    expect(grammarContext.assessmentPromptAddition).toContain('past tense');

    // Should generate grammar quest for weak patterns
    expect(shouldGenerateGrammarQuest(progress)).toBe(true);
    const grammarQuests = generateGrammarQuests(progress, { cefrLevel: 'A2' });
    expect(grammarQuests.length).toBeGreaterThan(0);

    // ── Step 8: Continued progress → A2→B1 ─────────────────────────
    const snapshot3 = makeSnapshot('A2', 150, 10, 5);
    const result3 = checkCEFRAdvancement(snapshot3);
    expect(result3.shouldAdvance).toBe(true);
    expect(result3.nextLevel).toBe('B1');
    cefrLevel = 'B1';

    // ── Step 9: Verify B1 behavior — significant shift ──────────────
    const b1Hints = getHintBehavior('B1');
    expect(b1Hints.translationMode).toBe('hover'); // no more inline
    expect(b1Hints.showTranslateButton).toBe(false);
    expect(b1Hints.advancedVocabOnly).toBe(true);

    const b1Vocab = cefrToVocabularyRange('B1');
    expect(b1Vocab.max).toBe(1500);

    const b1Text = getCEFRTextComplexity('B1');
    expect(b1Text.comprehensionQuestionType).toBe('inferential');
    expect(b1Text.maxSentenceWords).toBeGreaterThan(a1Text.maxSentenceWords);

    // ── Step 10: Stretch challenge for excelling player ─────────────
    const monitor2 = new ConversationDifficultyMonitor();
    const excellentTurn: TurnMetrics = {
      grammarErrors: 0,
      grammarPatternsChecked: 5,
      targetLanguageWords: 8,
      totalPlayerWords: 10,
      qualityScore: 95,
    };
    monitor2.recordTurn(excellentTurn);
    monitor2.recordTurn(excellentTurn);
    const stretchAdj = monitor2.recordTurn(excellentTurn);
    expect(stretchAdj).not.toBeNull();
    expect(stretchAdj!.level).toBe('stretch');

    const stretchDirective = buildScaffoldingDirective('stretch', 'French');
    expect(stretchDirective).toContain('STRETCH');
    expect(stretchDirective).toContain('complexity');
  });

  it('mastery thresholds remain consistent throughout the pipeline', () => {
    // Verify that mastery calculations from different modules agree
    // at every threshold boundary (for correct uses >= learning threshold,
    // since calculateMasteryLevel has an encounter-based fallback for low correct counts)
    for (let correct = MASTERY_THRESHOLDS.learning; correct <= 12; correct++) {
      const fromConstants = getMasteryForCorrectCount(correct);
      const fromProgress = calculateMasteryLevel(10, correct); // 10 encounters
      expect(fromProgress).toBe(fromConstants);
    }

    // Verify encounter-based fallback: many encounters + 0 correct → learning (not 'new')
    expect(calculateMasteryLevel(10, 0)).toBe('learning');
    expect(calculateMasteryLevel(1, 0)).toBe('new');

    // isWordMastered agrees with threshold
    expect(isWordMastered(1, MASTERY_THRESHOLDS.mastered)).toBe(true);
    expect(isWordMastered(1, MASTERY_THRESHOLDS.mastered - 1)).toBe(false);
  });

  it('CEFR level changes propagate to all dependent systems', () => {
    // For each level, verify all downstream systems accept it
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    for (const level of levels) {
      // NPC behavior adapts
      const behavior = getNPCLanguageBehavior(level, 'npc-test', 'French');
      expect(behavior.promptDirective).toBeTruthy();

      // Hint behavior adapts
      const hints = getHintBehavior(level);
      expect(hints.translationMode).toBeDefined();

      // Quest filtering works
      const quests = [{ cefrLevel: level }];
      const filtered = filterQuestsByCEFR(quests, level);
      expect(filtered.length).toBe(1);

      // Vocabulary range defined
      const range = cefrToVocabularyRange(level);
      expect(range.min).toBeGreaterThanOrEqual(1);

      // Text complexity defined
      const text = getCEFRTextComplexity(level);
      expect(text.maxSentenceWords).toBeGreaterThan(0);
    }
  });

  it('dimension score tracking feeds into periodic assessment context', () => {
    const now = Date.now();
    // Simulate improving scores over 8 conversations
    const entries: DimensionScoreEntry[] = [];
    for (let i = 0; i < 8; i++) {
      entries.push(makeDimensionEntry(
        {
          vocabulary: 2 + i * 0.3,
          grammar: 1.5 + i * 0.2,
          fluency: 3 + i * 0.1,
          comprehension: 3 + i * 0.2,
          taskCompletion: 3.5 + i * 0.1,
        },
        now - (8 - i) * 60000,
      ));
    }

    const ctx = buildPeriodicAssessmentDimensionContext(entries);
    expect(ctx.recentAverages).not.toBeNull();
    // Grammar should still be weakest
    expect(ctx.weakestDimension).toBe('grammar');

    // Trends should show improvement
    const vocabTrend = computeDimensionTrend(entries, 'vocabulary', 8);
    expect(vocabTrend).toBe('improving');
  });
});
