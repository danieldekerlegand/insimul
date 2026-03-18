/**
 * Tests for pronunciation quest objectives with speech scoring.
 *
 * Covers:
 * - QuestCompletionEngine: score-based pronunciation tracking, average score gating
 * - NPC exam types: pronunciation scoring function, pronunciation quiz scoring
 * - NPC exam definitions: pronunciation template existence
 * - Integration: pronunciation exam → assessment definition conversion
 */
import { describe, it, expect, beforeEach } from 'vitest';

import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';

import {
  scorePronunciationExamQuestion,
  scoreNpcExam,
  npcExamResultToPhaseResult,
  npcExamToAssessmentDefinition,
  PRONUNCIATION_EXAM_SCORING_DIMENSIONS,
  type NpcExamConfig,
  type NpcExamQuestion,
} from '../assessment/npc-exam-types';

import {
  NPC_EXAM_TEMPLATES,
  buildNpcExamFromTemplate,
  getNpcExamTemplate,
  getTemplatesForDifficulty,
} from '../assessment/npc-exam-definitions';

import { scorePronunciation } from '../language/pronunciation-scoring';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return { description: 'test objective', completed: false, ...overrides };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

function makePronunciationQuestion(id: string, phrase: string, maxPoints = 3): NpcExamQuestion {
  return {
    id,
    prompt: `Say: "${phrase}"`,
    expectedAnswer: phrase,
    acceptableAnswers: [],
    maxPoints,
    scoringType: 'pronunciation',
  };
}

function makePronunciationExamConfig(questions: NpcExamQuestion[]): NpcExamConfig {
  return {
    examId: 'test-exam-1',
    npcId: 'npc-teacher',
    npcName: 'Señora García',
    category: 'pronunciation_quiz',
    difficulty: 'beginner',
    targetLanguage: 'es',
    questions,
    timeLimitSeconds: 180,
    totalMaxPoints: questions.reduce((sum, q) => sum + q.maxPoints, 0),
    topics: ['pronunciation', 'greetings'],
  };
}

// ── QuestCompletionEngine: pronunciation tracking ────────────────────────────

describe('QuestCompletionEngine pronunciation tracking', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
  });

  it('tracks pronunciation scores on passed attempts', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'pronunciation_check', requiredCount: 3,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackPronunciationAttempt(true, 85);
    engine.trackPronunciationAttempt(true, 92);

    const stats = engine.getPronunciationStats('q1', 'o1');
    expect(stats).not.toBeNull();
    expect(stats!.scores).toEqual([85, 92]);
    expect(stats!.average).toBeCloseTo(88.5);
    expect(stats!.passed).toBe(2);
  });

  it('does not track scores on failed attempts', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'pronunciation_check', requiredCount: 3,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackPronunciationAttempt(false, 30);
    engine.trackPronunciationAttempt(false, 25);

    const stats = engine.getPronunciationStats('q1', 'o1');
    expect(stats!.scores).toEqual([]);
    expect(stats!.passed).toBe(0);
  });

  it('completes objective when requiredCount reached without minAverageScore', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'pronunciation_check', requiredCount: 2,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackPronunciationAttempt(true, 70);
    expect(obj.completed).toBe(false);

    engine.trackPronunciationAttempt(true, 75);
    expect(obj.completed).toBe(true);
  });

  it('does not complete when requiredCount reached but average below minAverageScore', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'pronunciation_check',
      requiredCount: 2, minAverageScore: 80,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackPronunciationAttempt(true, 60);
    engine.trackPronunciationAttempt(true, 65);

    // Required count met but average (62.5) < minAverageScore (80)
    expect(obj.completed).toBe(false);
    expect(obj.currentCount).toBe(2);
  });

  it('completes when average eventually meets minAverageScore', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'pronunciation_check',
      requiredCount: 2, minAverageScore: 75,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackPronunciationAttempt(true, 60);
    engine.trackPronunciationAttempt(true, 65);
    expect(obj.completed).toBe(false);

    // Third attempt raises the average above threshold
    engine.trackPronunciationAttempt(true, 95);
    // Average: (60 + 65 + 95) / 3 = 73.33 — still below 75
    expect(obj.completed).toBe(false);

    engine.trackPronunciationAttempt(true, 90);
    // Average: (60 + 65 + 95 + 90) / 4 = 77.5 — above 75
    expect(obj.completed).toBe(true);
  });

  it('dispatches pronunciation_attempt via trackEvent', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'pronunciation_check', requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 90 });
    expect(obj.completed).toBe(true);
    expect(obj.pronunciationScores).toEqual([90]);
  });

  it('returns null stats for non-pronunciation objectives', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'talk_to_npc',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const stats = engine.getPronunciationStats('q1', 'o1');
    expect(stats).toBeNull();
  });
});

// ── scorePronunciationExamQuestion ───────────────────────────────────────────

describe('scorePronunciationExamQuestion', () => {
  it('scores exact pronunciation match as full points', () => {
    const q = makePronunciationQuestion('q1', 'buenos días', 3);
    const result = scorePronunciationExamQuestion(q, 'buenos días');

    expect(result.score).toBe(3);
    expect(result.correct).toBe(true);
    expect(result.pronunciationScore).toBe(100);
  });

  it('scores close pronunciation with partial points', () => {
    const q = makePronunciationQuestion('q1', 'buenos días', 3);
    const result = scorePronunciationExamQuestion(q, 'buenes dias');

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.pronunciationScore).toBeGreaterThan(0);
    expect(result.pronunciationScore).toBeLessThan(100);
  });

  it('scores completely wrong pronunciation as zero', () => {
    const q = makePronunciationQuestion('q1', 'buenos días', 3);
    const result = scorePronunciationExamQuestion(q, 'xyz abc');

    expect(result.score).toBe(0);
    expect(result.correct).toBe(false);
    expect(result.pronunciationScore).toBeLessThan(40);
  });

  it('handles empty player answer', () => {
    const q = makePronunciationQuestion('q1', 'hola', 3);
    const result = scorePronunciationExamQuestion(q, '');

    expect(result.score).toBe(0);
    expect(result.correct).toBe(false);
    expect(result.pronunciationScore).toBe(0);
  });

  it('handles empty expected answer', () => {
    const q: NpcExamQuestion = { id: 'q1', prompt: 'Say something', maxPoints: 3, scoringType: 'pronunciation' };
    const result = scorePronunciationExamQuestion(q, 'hola');

    expect(result.score).toBe(0);
  });

  it('provides feedback in rationale', () => {
    const q = makePronunciationQuestion('q1', 'gracias', 3);
    const result = scorePronunciationExamQuestion(q, 'gracias');

    expect(result.rationale).toBeDefined();
    expect(result.rationale!.length).toBeGreaterThan(0);
  });
});

// ── scoreNpcExam with pronunciation ──────────────────────────────────────────

describe('scoreNpcExam with pronunciation_quiz category', () => {
  it('uses pronunciation scoring for pronunciation_quiz exams', () => {
    const config = makePronunciationExamConfig([
      makePronunciationQuestion('q1', 'hola', 3),
      makePronunciationQuestion('q2', 'gracias', 3),
    ]);

    const answers = { q1: 'hola', q2: 'gracias' };
    const result = scoreNpcExam(config, answers, Date.now() - 5000);

    expect(result.totalScore).toBe(6); // Full marks
    expect(result.percentage).toBe(100);
    expect(result.cefrLevel).toBe('B2');
    expect(result.category).toBe('pronunciation_quiz');
  });

  it('gives partial credit for close pronunciation', () => {
    const config = makePronunciationExamConfig([
      makePronunciationQuestion('q1', 'buenos días', 3),
    ]);

    const answers = { q1: 'buenes dias' };
    const result = scoreNpcExam(config, answers, Date.now() - 3000);

    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThan(3);
  });
});

// ── NPC exam definitions: pronunciation template ─────────────────────────────

describe('pronunciation NPC exam template', () => {
  it('exists in NPC_EXAM_TEMPLATES', () => {
    const tpl = NPC_EXAM_TEMPLATES.find(t => t.id === 'pronunciation_phrases');
    expect(tpl).toBeDefined();
    expect(tpl!.category).toBe('pronunciation_quiz');
    expect(tpl!.questionCount).toBe(5);
  });

  it('is retrievable by getNpcExamTemplate', () => {
    const tpl = getNpcExamTemplate('pronunciation_phrases');
    expect(tpl).toBeDefined();
    expect(tpl!.name).toBe('Pronunciation Quiz');
  });

  it('appears in beginner difficulty templates', () => {
    const beginnerTemplates = getTemplatesForDifficulty('beginner');
    const hasPronunciation = beginnerTemplates.some(t => t.id === 'pronunciation_phrases');
    expect(hasPronunciation).toBe(true);
  });

  it('builds a valid NpcExamConfig from template', () => {
    const tpl = getNpcExamTemplate('pronunciation_phrases')!;
    const questions: NpcExamQuestion[] = [
      makePronunciationQuestion('q1', 'hola'),
      makePronunciationQuestion('q2', 'gracias'),
      makePronunciationQuestion('q3', 'por favor'),
    ];

    const config = buildNpcExamFromTemplate(tpl, 'npc-1', 'María', 'es', questions);

    expect(config.category).toBe('pronunciation_quiz');
    expect(config.npcName).toBe('María');
    expect(config.targetLanguage).toBe('es');
    expect(config.questions).toHaveLength(3);
    expect(config.totalMaxPoints).toBe(9);
  });
});

// ── Assessment conversion ────────────────────────────────────────────────────

describe('pronunciation exam → assessment conversion', () => {
  it('uses pronunciation scoring dimensions', () => {
    const config = makePronunciationExamConfig([
      makePronunciationQuestion('q1', 'hola', 3),
    ]);

    const def = npcExamToAssessmentDefinition(config);

    expect(def.scoringDimensions).toEqual(PRONUNCIATION_EXAM_SCORING_DIMENSIONS);
    expect(def.scoringDimensions.some(d => d.id === 'pronunciation')).toBe(true);
  });

  it('converts pronunciation exam phase type to conversation', () => {
    const config = makePronunciationExamConfig([
      makePronunciationQuestion('q1', 'hola', 3),
    ]);

    const def = npcExamToAssessmentDefinition(config);
    expect(def.phases[0].type).toBe('conversation');
  });

  it('converts pronunciation result to phase result with pronunciation dimensions', () => {
    const result = {
      examId: 'test-1',
      npcId: 'npc-1',
      npcName: 'María',
      category: 'pronunciation_quiz' as const,
      difficulty: 'beginner' as const,
      targetLanguage: 'es',
      questionResults: [
        { questionId: 'q1', playerAnswer: 'hola', score: 3, maxPoints: 3, correct: true },
      ],
      totalScore: 3,
      totalMaxPoints: 3,
      percentage: 100,
      cefrLevel: 'B2' as const,
      durationMs: 5000,
      completedAt: Date.now(),
    };

    const phaseResult = npcExamResultToPhaseResult(result);

    expect(phaseResult.dimensionScores).toHaveProperty('pronunciation');
    expect(phaseResult.dimensionScores).toHaveProperty('fluency');
    expect(phaseResult.dimensionScores).not.toHaveProperty('accuracy');
  });
});

// ── Integration: pronunciation scoring consistency ───────────────────────────

describe('pronunciation scoring consistency', () => {
  it('scorePronunciation and scorePronunciationExamQuestion agree on score', () => {
    const phrase = 'bonjour le monde';
    const spoken = 'bonjour le monde';

    const directResult = scorePronunciation(phrase, spoken);
    const examResult = scorePronunciationExamQuestion(
      makePronunciationQuestion('q1', phrase, 100),
      spoken,
    );

    expect(directResult.overallScore).toBe(100);
    expect(examResult.pronunciationScore).toBe(100);
    expect(examResult.score).toBe(100);
  });

  it('pronunciation scores scale linearly with exam maxPoints', () => {
    const phrase = 'buenos días amigo';
    const spoken = 'buenos dias amigo'; // close but not exact

    const result3 = scorePronunciationExamQuestion(
      makePronunciationQuestion('q1', phrase, 3),
      spoken,
    );
    const result10 = scorePronunciationExamQuestion(
      makePronunciationQuestion('q1', phrase, 10),
      spoken,
    );

    // Both should have same pronunciationScore
    expect(result3.pronunciationScore).toBe(result10.pronunciationScore);

    // Points should scale proportionally
    const ratio3 = result3.score / 3;
    const ratio10 = result10.score / 10;
    expect(Math.abs(ratio3 - ratio10)).toBeLessThan(0.15); // Allow rounding difference
  });
});
