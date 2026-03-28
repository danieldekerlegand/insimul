/**
 * Tests for pronunciation feedback integration with quests.
 *
 * Covers:
 * - QuestLanguageFeedbackTracker pronunciation tracking
 * - QuestCompletionEngine pronunciation scoring across objective types
 * - NPC exam pronunciation quiz → quest event bridge
 * - extractQuestLanguageTargets pronunciation extraction
 */
import { describe, it, expect, vi } from 'vitest';
import {
  QuestLanguageFeedbackTracker,
  extractQuestLanguageTargets,
  type QuestObjective,
  type FeedbackItem,
} from '../language/quest-language-feedback';
import {
  QuestCompletionEngine,
  type CompletionQuest,
} from '../../client/src/components/3DGame/QuestCompletionEngine';
import { NpcExamEngine } from '../../client/src/components/3DGame/NPCExamEngine';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjectives(overrides: Partial<QuestObjective>[] = []): QuestObjective[] {
  return overrides.map((o, i) => ({
    type: o.type ?? 'pronunciation_check',
    description: o.description ?? `Objective ${i}`,
    required: o.required,
    vocabularyWords: o.vocabularyWords,
    grammarPatterns: o.grammarPatterns,
    pronunciationPhrases: o.pronunciationPhrases,
    category: o.category,
    target: o.target,
  }));
}

function makeTracker(objectives: QuestObjective[]) {
  return new QuestLanguageFeedbackTracker(
    'quest_1',
    'Pronunciation Quest',
    'pronunciation',
    objectives,
  );
}

function makeEventBus() {
  return { emit: vi.fn() } as any;
}

// ── QuestLanguageFeedbackTracker: Pronunciation ──────────────────────────────

describe('QuestLanguageFeedbackTracker pronunciation', () => {
  describe('initialization', () => {
    it('initializes pronunciation targets from objectives', () => {
      const tracker = makeTracker(makeObjectives([
        {
          type: 'pronunciation_check',
          pronunciationPhrases: ['bonjour', 'merci beaucoup'],
          required: 2,
        },
      ]));
      const state = tracker.getState();
      expect(state.pronunciationTargets).toHaveLength(2);
      expect(state.pronunciationRequiredCount).toBe(2);
      expect(state.pronunciationProgress).toBe(0);
      expect(state.pronunciationAverageScore).toBe(0);
    });

    it('infers pronunciation requirements from objective type without explicit phrases', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', required: 5 },
      ]));
      const state = tracker.getState();
      expect(state.pronunciationRequiredCount).toBe(5);
    });

    it('handles listen_and_repeat objective type', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'listen_and_repeat', required: 3 },
      ]));
      const state = tracker.getState();
      expect(state.pronunciationRequiredCount).toBe(3);
    });

    it('handles speak_phrase objective type', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'speak_phrase', required: 2 },
      ]));
      const state = tracker.getState();
      expect(state.pronunciationRequiredCount).toBe(2);
    });
  });

  describe('processPronunciationFeedback', () => {
    it('tracks passed pronunciation and generates good feedback', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['bonjour'], required: 1 },
      ]));

      const items = tracker.processPronunciationFeedback({
        phrase: 'bonjour',
        score: 95,
        passed: true,
      });

      expect(items.length).toBeGreaterThan(0);
      expect(items[0].type).toBe('pronunciation_good');
      expect(items[0].message).toContain('Excellent');

      const state = tracker.getState();
      expect(state.pronunciationPassedCount).toBe(1);
      expect(state.pronunciationAttempts).toBe(1);
      expect(state.pronunciationTargets[0].bestScore).toBe(95);
      expect(state.pronunciationTargets[0].passed).toBe(true);
    });

    it('tracks retry feedback for failed attempts', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['merci'], required: 1 },
      ]));

      const items = tracker.processPronunciationFeedback({
        phrase: 'merci',
        score: 30,
        passed: false,
        wordFeedback: [{ word: 'merci', status: 'needs_work', similarity: 0.3 }],
      });

      expect(items[0].type).toBe('pronunciation_retry');
      expect(items[0].message).toContain('Try again');
      expect(items[0].detail).toContain('merci');

      const state = tracker.getState();
      expect(state.pronunciationPassedCount).toBe(0);
      expect(state.pronunciationAttempts).toBe(1);
    });

    it('updates best score across multiple attempts', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['bonjour'], required: 1 },
      ]));

      tracker.processPronunciationFeedback({ phrase: 'bonjour', score: 40, passed: false });
      tracker.processPronunciationFeedback({ phrase: 'bonjour', score: 70, passed: false });
      tracker.processPronunciationFeedback({ phrase: 'bonjour', score: 85, passed: true });

      const state = tracker.getState();
      expect(state.pronunciationTargets[0].bestScore).toBe(85);
      expect(state.pronunciationTargets[0].attempts).toBe(3);
    });

    it('emits milestone at 50% and 100%', () => {
      const tracker = makeTracker(makeObjectives([
        {
          type: 'pronunciation_check',
          pronunciationPhrases: ['bonjour', 'merci', 'au revoir', 'salut'],
          required: 4,
        },
      ]));

      // Pass first two (50%)
      tracker.processPronunciationFeedback({ phrase: 'bonjour', score: 90, passed: true });
      const items = tracker.processPronunciationFeedback({ phrase: 'merci', score: 90, passed: true });
      const milestone50 = items.find(i => i.type === 'milestone');
      expect(milestone50).toBeDefined();
      expect(milestone50!.message).toContain('Halfway');

      // Pass remaining (100%)
      tracker.processPronunciationFeedback({ phrase: 'au revoir', score: 90, passed: true });
      const finalItems = tracker.processPronunciationFeedback({ phrase: 'salut', score: 90, passed: true });
      const milestone100 = finalItems.find(i => i.type === 'milestone');
      expect(milestone100).toBeDefined();
      expect(milestone100!.message).toContain('complete');
    });

    it('fires onFeedbackItem callback', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['hello'], required: 1 },
      ]));
      const cb = vi.fn();
      tracker.setOnFeedbackItem(cb);

      tracker.processPronunciationFeedback({ phrase: 'hello', score: 90, passed: true });

      expect(cb).toHaveBeenCalled();
      expect(cb.mock.calls[0][0].type).toBe('pronunciation_good');
    });
  });

  describe('pronunciation progress helpers', () => {
    it('getPronunciationProgressFraction returns correct fraction', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['a', 'b'], required: 2 },
      ]));

      expect(tracker.getPronunciationProgressFraction()).toBe(0);

      tracker.processPronunciationFeedback({ phrase: 'a', score: 90, passed: true });
      expect(tracker.getPronunciationProgressFraction()).toBe(0.5);

      tracker.processPronunciationFeedback({ phrase: 'b', score: 90, passed: true });
      expect(tracker.getPronunciationProgressFraction()).toBe(1);
    });

    it('isPronunciationComplete returns true when all targets passed', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['hello'], required: 1 },
      ]));

      expect(tracker.isPronunciationComplete()).toBe(false);
      tracker.processPronunciationFeedback({ phrase: 'hello', score: 90, passed: true });
      expect(tracker.isPronunciationComplete()).toBe(true);
    });

    it('score label is Good for 70-89', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['hello'], required: 1 },
      ]));
      const items = tracker.processPronunciationFeedback({ phrase: 'hello', score: 75, passed: true });
      expect(items[0].message).toContain('Good');
    });

    it('score label is Acceptable for below 70', () => {
      const tracker = makeTracker(makeObjectives([
        { type: 'pronunciation_check', pronunciationPhrases: ['hello'], required: 1 },
      ]));
      const items = tracker.processPronunciationFeedback({ phrase: 'hello', score: 55, passed: true });
      expect(items[0].message).toContain('Acceptable');
    });
  });
});

// ── QuestCompletionEngine: Pronunciation ─────────────────────────────────────

describe('QuestCompletionEngine pronunciation tracking', () => {
  function makeEngine() {
    const engine = new QuestCompletionEngine();
    const completedObjectives: string[] = [];
    const completedQuests: string[] = [];
    engine.setOnObjectiveCompleted((_qid, oid) => completedObjectives.push(oid));
    engine.setOnQuestCompleted((qid) => completedQuests.push(qid));
    return { engine, completedObjectives, completedQuests };
  }

  it('tracks pronunciation_check objectives with score', () => {
    const { engine, completedObjectives } = makeEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'o1', questId: 'q1', type: 'pronunciation_check', description: 'Pronounce', completed: false, requiredCount: 2, currentCount: 0 },
      ],
    });

    engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 85, questId: 'q1' });
    const obj = engine.getQuests()[0].objectives![0];
    expect(obj.currentCount).toBe(1);
    expect(obj.pronunciationScores).toEqual([85]);
    expect(obj.pronunciationBestScore).toBe(85);

    engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 95, questId: 'q1' });
    expect(obj.pronunciationBestScore).toBe(95);
    expect(completedObjectives).toContain('o1');
  });

  it('tracks listen_and_repeat objectives', () => {
    const { engine, completedObjectives } = makeEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'o1', questId: 'q1', type: 'listen_and_repeat', description: 'Repeat', completed: false, requiredCount: 1, currentCount: 0 },
      ],
    });

    engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 90, questId: 'q1' });
    expect(completedObjectives).toContain('o1');
  });

  it('tracks speak_phrase objectives', () => {
    const { engine, completedObjectives } = makeEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'o1', questId: 'q1', type: 'speak_phrase', description: 'Speak', completed: false, requiredCount: 1, currentCount: 0 },
      ],
    });

    engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 80, questId: 'q1' });
    expect(completedObjectives).toContain('o1');
  });

  it('does not increment count on failed attempts', () => {
    const { engine } = makeEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'o1', questId: 'q1', type: 'pronunciation_check', description: 'Pronounce', completed: false, requiredCount: 2, currentCount: 0 },
      ],
    });

    engine.trackEvent({ type: 'pronunciation_attempt', passed: false, score: 30, questId: 'q1' });
    const obj = engine.getQuests()[0].objectives![0];
    expect(obj.currentCount).toBe(0);
    // But score is still recorded
    expect(obj.pronunciationScores).toEqual([30]);
  });

  it('completes quest when pronunciation and vocabulary objectives done', () => {
    const { engine, completedQuests } = makeEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'o1', questId: 'q1', type: 'pronunciation_check', description: 'P1', completed: false, requiredCount: 1, currentCount: 0 },
        { id: 'o2', questId: 'q1', type: 'use_vocabulary', description: 'V1', completed: false, requiredCount: 1, currentCount: 0, targetWords: ['hello'] },
      ],
    });

    engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 90, questId: 'q1' });
    expect(completedQuests).toHaveLength(0); // only o1 done, o2 remains

    engine.trackEvent({ type: 'vocabulary_usage', word: 'hello', questId: 'q1' });
    expect(completedQuests).toContain('q1');
  });
});

// ── NPC Exam → Pronunciation Events ──────────────────────────────────────────

describe('NPC Exam pronunciation quiz bridge', () => {
  it('emits utterance_evaluated for each pronunciation quiz question', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test' });

    const examConfig = {
      examId: 'exam-1',
      npcId: 'npc-1',
      npcName: 'Teacher',
      category: 'pronunciation_quiz' as const,
      difficulty: 'beginner' as const,
      targetLanguage: 'fr',
      timeLimitSeconds: 0,
      totalMaxPoints: 10,
      questions: [
        { id: 'q1', prompt: 'Say "bonjour"', expectedAnswer: 'bonjour', acceptableAlternatives: [], maxPoints: 5, hint: '' },
        { id: 'q2', prompt: 'Say "merci"', expectedAnswer: 'merci', acceptableAlternatives: [], maxPoints: 5, hint: '' },
      ],
    };

    // Use callbacks to auto-answer
    let questionIdx = 0;
    const answers = ['bonjour', 'merci'];
    const result = await engine.runExam(examConfig, {
      onQuestion: (q) => q.onAnswer(answers[questionIdx++]),
    });

    expect(result).not.toBeNull();

    // Should emit utterance_evaluated for each question
    const utteranceEvents = bus.emit.mock.calls.filter(
      (c: any[]) => c[0]?.type === 'utterance_evaluated',
    );
    expect(utteranceEvents).toHaveLength(2);
    expect(utteranceEvents[0][0].objectiveId).toContain('exam-1');
  });

  it('emits pronunciation_assessment_data on completion', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test' });

    const examConfig = {
      examId: 'exam-2',
      npcId: 'npc-1',
      npcName: 'Teacher',
      category: 'pronunciation_quiz' as const,
      difficulty: 'beginner' as const,
      targetLanguage: 'fr',
      timeLimitSeconds: 0,
      totalMaxPoints: 10,
      questions: [
        { id: 'q1', prompt: 'Say "oui"', expectedAnswer: 'oui', acceptableAlternatives: [], maxPoints: 10, hint: '' },
      ],
    };

    await engine.runExam(examConfig, {
      onQuestion: (q) => q.onAnswer('oui'),
    });

    const assessmentEvents = bus.emit.mock.calls.filter(
      (c: any[]) => c[0]?.type === 'pronunciation_assessment_data',
    );
    expect(assessmentEvents).toHaveLength(1);
    expect(assessmentEvents[0][0].questId).toContain('exam-2');
    expect(assessmentEvents[0][0].averageScore).toBeGreaterThan(0);
    expect(assessmentEvents[0][0].sampleCount).toBe(1);
  });

  it('does NOT emit pronunciation events for non-pronunciation quizzes', async () => {
    const bus = makeEventBus();
    const engine = new NpcExamEngine({ eventBus: bus, authToken: 'test' });

    const examConfig = {
      examId: 'exam-3',
      npcId: 'npc-1',
      npcName: 'Teacher',
      category: 'vocabulary_quiz' as const,
      difficulty: 'beginner' as const,
      targetLanguage: 'fr',
      timeLimitSeconds: 0,
      totalMaxPoints: 5,
      questions: [
        { id: 'q1', prompt: 'What is "dog"?', expectedAnswer: 'chien', acceptableAlternatives: [], maxPoints: 5, hint: '' },
      ],
    };

    await engine.runExam(examConfig, {
      onQuestion: (q) => q.onAnswer('chien'),
    });

    const utteranceEvents = bus.emit.mock.calls.filter(
      (c: any[]) => c[0]?.type === 'utterance_evaluated',
    );
    expect(utteranceEvents).toHaveLength(0);

    const assessmentEvents = bus.emit.mock.calls.filter(
      (c: any[]) => c[0]?.type === 'pronunciation_assessment_data',
    );
    expect(assessmentEvents).toHaveLength(0);
  });
});

// ── extractQuestLanguageTargets ──────────────────────────────────────────────

describe('extractQuestLanguageTargets pronunciation', () => {
  it('extracts pronunciation phrases from objectives', () => {
    const result = extractQuestLanguageTargets([
      { type: 'pronunciation_check', pronunciationPhrases: ['bonjour', 'merci'], required: 2 },
    ]);
    expect(result.pronunciationPhrases).toEqual(['bonjour', 'merci']);
    expect(result.pronunciationRequired).toBe(2);
  });

  it('infers pronunciation requirement from type without explicit phrases', () => {
    const result = extractQuestLanguageTargets([
      { type: 'listen_and_repeat', required: 3 },
    ]);
    expect(result.pronunciationRequired).toBe(3);
  });

  it('handles speak_phrase type', () => {
    const result = extractQuestLanguageTargets([
      { type: 'speak_phrase', required: 2 },
    ]);
    expect(result.pronunciationRequired).toBe(2);
  });

  it('deduplicates pronunciation phrases', () => {
    const result = extractQuestLanguageTargets([
      { type: 'pronunciation_check', pronunciationPhrases: ['hello', 'hello', 'world'] },
    ]);
    expect(result.pronunciationPhrases).toEqual(['hello', 'world']);
  });

  it('combines pronunciation from multiple objectives', () => {
    const result = extractQuestLanguageTargets([
      { type: 'pronunciation_check', pronunciationPhrases: ['hello'], required: 1 },
      { type: 'listen_and_repeat', required: 3 },
      { type: 'use_vocabulary', vocabularyWords: ['word1'], required: 1 },
    ]);
    expect(result.pronunciationPhrases).toEqual(['hello']);
    expect(result.pronunciationRequired).toBe(4); // 1 from phrases + 3 from listen_and_repeat
    expect(result.vocabularyRequired).toBe(1);
  });
});
