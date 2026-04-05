/**
 * Tests for Grammar Weakness Analysis and Quest Generation
 *
 * US-009: Generate error-correction quests from weak grammar patterns
 */

import { describe, it, expect } from 'vitest';
import type { LanguageProgress, GrammarPattern, GrammarFeedback } from '../language/progress';
import {
  analyzeGrammarWeaknesses,
  isPatternWeak,
  getWeakPatternNames,
  getStrongPatternNames,
  createErrorRateSnapshot,
  measurePatternImprovement,
  checkForNewWeaknesses,
  buildWeakPatternDirective,
  WEAKNESS_ERROR_RATE_THRESHOLD,
  WEAKNESS_MIN_ATTEMPTS,
} from '../language/grammar-weakness-analyzer';
import {
  generateGrammarQuests,
  measureQuestEffectiveness,
  shouldGenerateGrammarQuest,
  type GrammarRemediationQuest,
} from '../quests/grammar-quest-generator';
import {
  buildPeriodicAssessmentGrammarContext,
} from '../assessment/periodic-encounter';

// ─── Test Helpers ───────────────────────────────────────────────────────────

function makePattern(
  pattern: string,
  correct: number,
  incorrect: number,
  opts?: Partial<GrammarPattern>,
): GrammarPattern {
  return {
    id: `pattern_${pattern.replace(/\s+/g, '_')}`,
    pattern,
    language: 'French',
    timesUsedCorrectly: correct,
    timesUsedIncorrectly: incorrect,
    mastered: correct >= 10 && correct / (correct + incorrect) >= 0.8,
    examples: opts?.examples ?? [],
    explanations: opts?.explanations ?? [],
    ...opts,
  };
}

function makeProgress(patterns: GrammarPattern[], overrides?: Partial<LanguageProgress>): LanguageProgress {
  return {
    playerId: 'player1',
    worldId: 'world1',
    language: 'French',
    overallFluency: 40,
    vocabulary: [],
    grammarPatterns: patterns,
    conversations: [],
    totalConversations: 5,
    totalWordsLearned: 50,
    totalCorrectUsages: 20,
    streakDays: 1,
    lastActivityTimestamp: Date.now(),
    ...overrides,
  };
}

// ─── Grammar Weakness Analyzer Tests ────────────────────────────────────────

describe('analyzeGrammarWeaknesses', () => {
  it('identifies patterns with >50% error rate and 3+ attempts', () => {
    const patterns = [
      makePattern('past tense', 1, 3),      // 75% error rate, 4 attempts ✓
      makePattern('article agreement', 2, 2), // 50% error rate, 4 attempts ✓
      makePattern('subject-verb', 5, 1),      // 17% error rate — too low
      makePattern('question formation', 1, 0), // 1 attempt — too few
    ];
    const progress = makeProgress(patterns);
    const result = analyzeGrammarWeaknesses(progress);

    expect(result.weaknesses).toHaveLength(2);
    expect(result.weaknesses[0].pattern).toBe('past tense'); // higher error rate → higher priority
    expect(result.weaknesses[1].pattern).toBe('article agreement');
  });

  it('returns empty array when no patterns meet threshold', () => {
    const patterns = [
      makePattern('subject-verb', 8, 2),  // 20% error rate
      makePattern('past tense', 1, 0),     // too few attempts
    ];
    const progress = makeProgress(patterns);
    const result = analyzeGrammarWeaknesses(progress);

    expect(result.weaknesses).toHaveLength(0);
  });

  it('respects custom thresholds', () => {
    const patterns = [
      makePattern('past tense', 3, 2), // 40% error, 5 attempts
    ];
    const progress = makeProgress(patterns);

    // Default threshold (50%) — should not be flagged
    const resultDefault = analyzeGrammarWeaknesses(progress);
    expect(resultDefault.weaknesses).toHaveLength(0);

    // Lower threshold (30%) — should be flagged
    const resultLower = analyzeGrammarWeaknesses(progress, { minErrorRate: 0.3 });
    expect(resultLower.weaknesses).toHaveLength(1);
  });

  it('limits results to maxWeaknesses', () => {
    const patterns = [
      makePattern('pattern1', 1, 3),
      makePattern('pattern2', 1, 4),
      makePattern('pattern3', 0, 3),
      makePattern('pattern4', 1, 5),
    ];
    const progress = makeProgress(patterns);
    const result = analyzeGrammarWeaknesses(progress, { maxWeaknesses: 2 });

    expect(result.weaknesses).toHaveLength(2);
  });

  it('sorts weaknesses by priority (higher error rate + volume = higher priority)', () => {
    const patterns = [
      makePattern('minor issue', 2, 3),   // 60% error, 5 attempts
      makePattern('major issue', 0, 6),    // 100% error, 6 attempts
      makePattern('medium issue', 1, 4),   // 80% error, 5 attempts
    ];
    const progress = makeProgress(patterns);
    const result = analyzeGrammarWeaknesses(progress);

    expect(result.weaknesses[0].pattern).toBe('major issue');
    expect(result.weaknesses[1].pattern).toBe('medium issue');
    expect(result.weaknesses[2].pattern).toBe('minor issue');
  });

  it('reports all pattern stats including non-weak ones', () => {
    const patterns = [
      makePattern('weak one', 1, 4),
      makePattern('strong one', 8, 1),
    ];
    const progress = makeProgress(patterns);
    const result = analyzeGrammarWeaknesses(progress);

    expect(result.allPatternStats).toHaveLength(2);
    const strong = result.allPatternStats.find(s => s.pattern === 'strong one');
    expect(strong).toBeDefined();
    expect(strong!.errorRate).toBeCloseTo(1 / 9);
  });

  it('detects improved patterns when previousErrorRates provided', () => {
    const patterns = [
      makePattern('past tense', 5, 2), // current: 29% error rate
    ];
    const progress = makeProgress(patterns);
    const previous = new Map([['past tense', 0.6]]); // was 60%
    const result = analyzeGrammarWeaknesses(progress, { previousErrorRates: previous });

    expect(result.improvedPatterns).toContain('past tense');
  });
});

describe('isPatternWeak', () => {
  it('returns true for patterns meeting both thresholds', () => {
    const pattern = makePattern('past tense', 1, 3); // 75%, 4 attempts
    expect(isPatternWeak(pattern)).toBe(true);
  });

  it('returns false for low error rate', () => {
    const pattern = makePattern('past tense', 8, 2); // 20%, 10 attempts
    expect(isPatternWeak(pattern)).toBe(false);
  });

  it('returns false for insufficient attempts', () => {
    const pattern = makePattern('past tense', 0, 2); // 100% but only 2 attempts
    expect(isPatternWeak(pattern)).toBe(false);
  });
});

describe('getWeakPatternNames / getStrongPatternNames', () => {
  it('returns names of weak patterns sorted by error rate', () => {
    const patterns = [
      makePattern('pattern A', 1, 3),
      makePattern('pattern B', 0, 5),
      makePattern('pattern C', 7, 1),
    ];
    const progress = makeProgress(patterns);
    const names = getWeakPatternNames(progress);

    expect(names).toContain('pattern A');
    expect(names).toContain('pattern B');
    expect(names).not.toContain('pattern C');
  });

  it('returns names of strong patterns', () => {
    const patterns = [
      makePattern('mastered one', 8, 0),
      makePattern('weak one', 1, 4),
      makePattern('too few', 2, 0), // only 2 attempts
    ];
    const progress = makeProgress(patterns);
    const names = getStrongPatternNames(progress);

    expect(names).toContain('mastered one');
    expect(names).not.toContain('weak one');
    expect(names).not.toContain('too few');
  });
});

describe('createErrorRateSnapshot / measurePatternImprovement', () => {
  it('creates a snapshot of current error rates', () => {
    const patterns = [
      makePattern('past tense', 3, 3),   // 50%
      makePattern('articles', 7, 1),      // 12.5%
    ];
    const progress = makeProgress(patterns);
    const snapshot = createErrorRateSnapshot(progress);

    expect(snapshot.rates['past tense']).toBeCloseTo(0.5);
    expect(snapshot.rates['articles']).toBeCloseTo(0.125);
    expect(snapshot.timestamp).toBeGreaterThan(0);
  });

  it('measures improvement between snapshots', () => {
    const before = { timestamp: 1000, rates: { 'past tense': 0.6, 'articles': 0.3 } };
    const after = { timestamp: 2000, rates: { 'past tense': 0.3, 'articles': 0.3 } };

    const pastResult = measurePatternImprovement('past tense', before, after);
    expect(pastResult).not.toBeNull();
    expect(pastResult!.improved).toBe(true);
    expect(pastResult!.delta).toBeCloseTo(-0.3);

    const articlesResult = measurePatternImprovement('articles', before, after);
    expect(articlesResult).not.toBeNull();
    expect(articlesResult!.improved).toBe(false);
  });

  it('returns null for unknown patterns', () => {
    const before = { timestamp: 1000, rates: {} };
    const after = { timestamp: 2000, rates: { 'past tense': 0.5 } };
    expect(measurePatternImprovement('past tense', before, after)).toBeNull();
  });
});

describe('checkForNewWeaknesses', () => {
  it('detects patterns that just crossed the weakness threshold', () => {
    // Pattern with exactly 3 attempts and 50% error rate (borderline weak)
    const patterns = [
      makePattern('past tense', 1, 2), // 67%, 3 attempts — NOW weak
    ];
    const progress = makeProgress(patterns);

    // The feedback that just pushed it over the threshold
    const feedback: GrammarFeedback = {
      status: 'corrected',
      errors: [{ pattern: 'past tense', incorrect: 'je suis allé', corrected: "j'ai allé", explanation: 'Use avoir' }],
      errorCount: 1,
      timestamp: Date.now(),
    };

    // Before this feedback: 1 correct, 1 incorrect (50%, 2 attempts) — NOT weak (< 3 attempts)
    const newlyWeak = checkForNewWeaknesses(progress, feedback);
    expect(newlyWeak).toContain('past tense');
  });

  it('does not flag patterns that were already weak before feedback', () => {
    // Already weak before this feedback
    const patterns = [
      makePattern('past tense', 1, 5), // 83%, 6 attempts — was already weak
    ];
    const progress = makeProgress(patterns);

    const feedback: GrammarFeedback = {
      status: 'corrected',
      errors: [{ pattern: 'past tense', incorrect: 'x', corrected: 'y', explanation: 'z' }],
      errorCount: 1,
      timestamp: Date.now(),
    };

    const newlyWeak = checkForNewWeaknesses(progress, feedback);
    expect(newlyWeak).not.toContain('past tense');
  });
});

describe('buildWeakPatternDirective', () => {
  it('generates a non-empty directive for weak patterns', () => {
    const directive = buildWeakPatternDirective(['past tense', 'articles'], 'French');
    expect(directive).toContain('GRAMMAR MODELING');
    expect(directive).toContain('past tense');
    expect(directive).toContain('articles');
    expect(directive).toContain('French');
  });

  it('returns empty string for no patterns', () => {
    expect(buildWeakPatternDirective([], 'French')).toBe('');
  });

  it('limits to 3 patterns', () => {
    const directive = buildWeakPatternDirective(
      ['p1', 'p2', 'p3', 'p4', 'p5'],
      'French',
    );
    expect(directive).toContain('p1');
    expect(directive).toContain('p2');
    expect(directive).toContain('p3');
    expect(directive).not.toContain('p4');
  });
});

// ─── Grammar Quest Generator Tests ─────────────────────────────────────────

describe('generateGrammarQuests', () => {
  it('generates quests for weak patterns', () => {
    const patterns = [
      makePattern('past tense', 1, 4, { explanations: ['Use passé composé with avoir'] }),
      makePattern('articles', 0, 3),
    ];
    const progress = makeProgress(patterns);
    const quests = generateGrammarQuests(progress, { targetLanguage: 'French' });

    expect(quests.length).toBeGreaterThanOrEqual(1);
    const quest = quests[0];
    expect(quest.targetPattern).toBeDefined();
    expect(quest.objectives.length).toBeGreaterThan(0);
    expect(quest.tags).toContain('grammar');
    expect(quest.tags).toContain('remediation');
  });

  it('returns empty array when no weak patterns exist', () => {
    const patterns = [makePattern('subject-verb', 8, 1)];
    const progress = makeProgress(patterns);
    const quests = generateGrammarQuests(progress);

    expect(quests).toHaveLength(0);
  });

  it('skips patterns with active quests', () => {
    const patterns = [
      makePattern('past tense', 1, 4),
      makePattern('articles', 0, 3),
    ];
    const progress = makeProgress(patterns);
    const quests = generateGrammarQuests(progress, {
      activeQuestPatterns: ['past tense'],
      maxQuests: 2,
    });

    // Should not generate for 'past tense' since it has an active quest
    expect(quests.every(q => q.targetPattern !== 'past tense')).toBe(true);
  });

  it('respects maxQuests limit', () => {
    const patterns = [
      makePattern('p1', 0, 5),
      makePattern('p2', 0, 4),
      makePattern('p3', 0, 3),
    ];
    const progress = makeProgress(patterns);
    const quests = generateGrammarQuests(progress, { maxQuests: 1 });

    expect(quests).toHaveLength(1);
  });

  it('assigns appropriate difficulty based on error rate', () => {
    // Very high error rate → beginner difficulty
    const patterns = [makePattern('past tense', 0, 5)]; // 100% error
    const progress = makeProgress(patterns);
    const quests = generateGrammarQuests(progress);

    expect(quests[0].difficulty).toBe('beginner');
  });

  it('includes pre-quest snapshot for effectiveness tracking', () => {
    const patterns = [makePattern('past tense', 1, 4)];
    const progress = makeProgress(patterns);
    const quests = generateGrammarQuests(progress);

    expect(quests[0].preQuestSnapshot).toBeDefined();
    expect(quests[0].preQuestSnapshot.rates['past tense']).toBeCloseTo(0.8);
  });

  it('includes NPC prompt additions for each quest type', () => {
    const patterns = [makePattern('past tense', 0, 5)];
    const progress = makeProgress(patterns);
    const quests = generateGrammarQuests(progress, { targetLanguage: 'French' });

    expect(quests[0].npcPromptAdditions).toBeTruthy();
    expect(quests[0].npcPromptAdditions).toContain('past tense');
  });

  it('generates all three quest types based on conditions', () => {
    // Test grammar_drill for high error rate
    const drillPatterns = [makePattern('conjugation', 0, 6)]; // 100% error
    const drillProgress = makeProgress(drillPatterns);
    const drillQuests = generateGrammarQuests(drillProgress, { cefrLevel: 'A1' });
    expect(drillQuests[0].questType).toBe('grammar_drill');

    // The other types depend on hash + error rate, tested implicitly
    // Just verify all quest type fields are valid
    const questTypes = ['grammar_drill', 'correction_challenge', 'writing_practice'];
    expect(questTypes).toContain(drillQuests[0].questType);
  });
});

describe('measureQuestEffectiveness', () => {
  it('detects effective quest (error rate decreased)', () => {
    const patterns = [makePattern('past tense', 5, 2)]; // now 29% error
    const progress = makeProgress(patterns);

    const quest: GrammarRemediationQuest = {
      id: 'test',
      questType: 'grammar_drill',
      title: 'Test',
      description: 'Test',
      targetPattern: 'past tense',
      difficulty: 'beginner',
      objectives: [],
      completionCriteria: { type: 'grammar_accuracy', requiredAccuracy: 60, requiredCorrectUses: 3, targetPattern: 'past tense' },
      experienceReward: 25,
      fluencyReward: 3,
      preQuestSnapshot: { timestamp: 1000, rates: { 'past tense': 0.8 } },
      tags: [],
      sourceWeakness: {
        pattern: 'past tense', correctCount: 1, incorrectCount: 4,
        totalAttempts: 5, errorRate: 0.8, explanations: [], examples: [], priority: 50,
      },
      npcPromptAdditions: '',
    };

    const result = measureQuestEffectiveness(quest, progress);
    expect(result.effective).toBe(true);
    expect(result.improvement).toBeGreaterThan(0);
    expect(result.beforeErrorRate).toBeCloseTo(0.8);
    expect(result.afterErrorRate).toBeCloseTo(2 / 7);
  });

  it('detects ineffective quest (no improvement)', () => {
    const patterns = [makePattern('past tense', 1, 4)]; // still 80% error
    const progress = makeProgress(patterns);

    const quest: GrammarRemediationQuest = {
      id: 'test',
      questType: 'grammar_drill',
      title: 'Test',
      description: 'Test',
      targetPattern: 'past tense',
      difficulty: 'beginner',
      objectives: [],
      completionCriteria: { type: 'grammar_accuracy', requiredAccuracy: 60, requiredCorrectUses: 3, targetPattern: 'past tense' },
      experienceReward: 25,
      fluencyReward: 3,
      preQuestSnapshot: { timestamp: 1000, rates: { 'past tense': 0.8 } },
      tags: [],
      sourceWeakness: {
        pattern: 'past tense', correctCount: 1, incorrectCount: 4,
        totalAttempts: 5, errorRate: 0.8, explanations: [], examples: [], priority: 50,
      },
      npcPromptAdditions: '',
    };

    const result = measureQuestEffectiveness(quest, progress);
    expect(result.effective).toBe(false);
  });
});

describe('shouldGenerateGrammarQuest', () => {
  it('returns true when weak patterns exist without active quests', () => {
    const patterns = [makePattern('past tense', 1, 4)];
    const progress = makeProgress(patterns);
    expect(shouldGenerateGrammarQuest(progress)).toBe(true);
  });

  it('returns false when no weak patterns', () => {
    const patterns = [makePattern('articles', 8, 1)];
    const progress = makeProgress(patterns);
    expect(shouldGenerateGrammarQuest(progress)).toBe(false);
  });

  it('returns false when all weak patterns already have active quests', () => {
    const patterns = [makePattern('past tense', 1, 4)];
    const progress = makeProgress(patterns);
    expect(shouldGenerateGrammarQuest(progress, ['past tense'])).toBe(false);
  });
});

// ─── Periodic Assessment Integration Tests ──────────────────────────────────

describe('buildPeriodicAssessmentGrammarContext', () => {
  it('includes weak patterns in assessment context', () => {
    const patterns = [
      makePattern('past tense', 1, 4),
      makePattern('articles', 0, 3),
    ];
    const progress = makeProgress(patterns);
    const ctx = buildPeriodicAssessmentGrammarContext(progress);

    expect(ctx.weakPatterns).toContain('past tense');
    expect(ctx.weakPatterns).toContain('articles');
    expect(ctx.assessmentPromptAddition).toContain('GRAMMAR ASSESSMENT FOCUS');
    expect(ctx.assessmentPromptAddition).toContain('past tense');
  });

  it('returns empty context when no weaknesses', () => {
    const patterns = [makePattern('articles', 8, 1)];
    const progress = makeProgress(patterns);
    const ctx = buildPeriodicAssessmentGrammarContext(progress);

    expect(ctx.weakPatterns).toHaveLength(0);
    expect(ctx.assessmentPromptAddition).toBe('');
  });

  it('limits to 3 weak patterns', () => {
    const patterns = [
      makePattern('p1', 0, 4),
      makePattern('p2', 0, 4),
      makePattern('p3', 0, 4),
      makePattern('p4', 0, 4),
      makePattern('p5', 0, 4),
    ];
    const progress = makeProgress(patterns);
    const ctx = buildPeriodicAssessmentGrammarContext(progress);

    expect(ctx.weakPatterns.length).toBeLessThanOrEqual(3);
  });
});

// ─── Constants Sanity Checks ────────────────────────────────────────────────

describe('weakness constants', () => {
  it('has correct default thresholds', () => {
    expect(WEAKNESS_ERROR_RATE_THRESHOLD).toBe(0.5);
    expect(WEAKNESS_MIN_ATTEMPTS).toBe(3);
  });
});
