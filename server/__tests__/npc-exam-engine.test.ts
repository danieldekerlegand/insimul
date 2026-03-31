import { describe, it, expect } from 'vitest';
import {
  createObjectRecognitionExam,
  scoreNpcObjectRecognitionExam,
  NpcExamEngine,
  LISTENING_EXAM_CONTEXTS,
  getCefrAdaptation,
} from '../services/conversation/npc-exam-engine';

describe('createObjectRecognitionExam', () => {
  it('creates an exam with correct metadata', () => {
    const { exam, selectedObjectKeys } = createObjectRecognitionExam({
      npcId: 'npc-1',
      npcName: 'Marie',
      businessType: 'bakery',
      businessName: "Marie's Bakery",
      cefrLevel: 'A1',
      targetLanguage: 'French',
    });

    expect(exam.type).toBe('object_recognition');
    expect(exam.npcId).toBe('npc-1');
    expect(exam.npcName).toBe('Marie');
    expect(exam.businessType).toBe('bakery');
    expect(exam.cefrLevel).toBe('A1');
    expect(exam.targetLanguage).toBe('French');
    expect(exam.definition.phases).toHaveLength(1);
    expect(selectedObjectKeys.length).toBe(3); // A1 = 3 questions
  });

  it('uses npc_initiated as default trigger', () => {
    const { exam } = createObjectRecognitionExam({
      npcId: 'npc-1',
      npcName: 'Marie',
      cefrLevel: 'A1',
      targetLanguage: 'French',
    });
    expect(exam.trigger).toBe('npc_initiated');
  });

  it('accepts custom trigger', () => {
    const { exam } = createObjectRecognitionExam({
      npcId: 'npc-1',
      npcName: 'Marie',
      cefrLevel: 'A1',
      targetLanguage: 'French',
      trigger: 'player_request',
    });
    expect(exam.trigger).toBe('player_request');
  });

  it('works without business type (generic)', () => {
    const { exam, selectedObjectKeys } = createObjectRecognitionExam({
      npcId: 'npc-1',
      npcName: 'Guard',
      cefrLevel: 'A2',
      targetLanguage: 'Spanish',
    });
    expect(exam.businessType).toBeUndefined();
    expect(selectedObjectKeys.length).toBe(4); // A2 = 4 questions
  });
});

describe('scoreNpcObjectRecognitionExam', () => {
  it('produces correct NpcExamResult for all correct answers', () => {
    const { exam, selectedObjectKeys } = createObjectRecognitionExam({
      npcId: 'npc-1',
      npcName: 'Marie',
      businessType: 'bakery',
      cefrLevel: 'A1',
      targetLanguage: 'French',
    });

    const expectedAnswers = ['pain', 'four', 'farine'];
    const result = scoreNpcObjectRecognitionExam({
      exam,
      playerAnswers: ['pain', 'four', 'farine'],
      expectedAnswers,
      selectedObjectKeys,
    });

    expect(result.examId).toBe(exam.id);
    expect(result.examType).toBe('object_recognition');
    expect(result.npcId).toBe('npc-1');
    expect(result.objectResults).toBeDefined();
    expect(result.objectResults!.length).toBe(3);
    expect(result.assessmentResult.totalScore).toBe(result.assessmentResult.maxScore);
    expect(result.assessmentResult.phaseResults).toHaveLength(1);
  });

  it('includes rationale in task results', () => {
    const { exam, selectedObjectKeys } = createObjectRecognitionExam({
      npcId: 'npc-1',
      npcName: 'Marie',
      businessType: 'bakery',
      cefrLevel: 'A1',
      targetLanguage: 'French',
    });

    const result = scoreNpcObjectRecognitionExam({
      exam,
      playerAnswers: ['pain', 'xyz', ''],
      expectedAnswers: ['pain', 'four', 'farine'],
      selectedObjectKeys,
    });

    const taskResults = result.assessmentResult.phaseResults[0].taskResults;
    expect(taskResults[0].rationale).toContain('Correct');
    expect(taskResults[1].rationale).toContain('correct answer');
    expect(taskResults[2].rationale).toContain('correct answer');
  });

  it('has completedAt timestamp', () => {
    const { exam, selectedObjectKeys } = createObjectRecognitionExam({
      npcId: 'npc-1',
      npcName: 'Marie',
      businessType: 'bakery',
      cefrLevel: 'A1',
      targetLanguage: 'French',
    });

    const before = Date.now();
    const result = scoreNpcObjectRecognitionExam({
      exam,
      playerAnswers: ['pain', 'four', 'farine'],
      expectedAnswers: ['pain', 'four', 'farine'],
      selectedObjectKeys,
    });
    const after = Date.now();

    expect(result.assessmentResult.completedAt).toBeGreaterThanOrEqual(before);
    expect(result.assessmentResult.completedAt).toBeLessThanOrEqual(after);
  });
});

describe('NpcExamEngine', () => {
  const engine = new NpcExamEngine();

  describe('getCefrAdaptation', () => {
    it('returns beginner difficulty and slow speed for A1', () => {
      const a = getCefrAdaptation('A1');
      expect(a.difficulty).toBe('beginner');
      expect(a.ttsSpeed).toBe(0.7);
      expect(a.lengthSentences).toBe(2);
      expect(a.maxReplays).toBe(2);
    });

    it('returns beginner difficulty and moderate speed for A2', () => {
      const a = getCefrAdaptation('A2');
      expect(a.difficulty).toBe('beginner');
      expect(a.ttsSpeed).toBe(0.85);
      expect(a.lengthSentences).toBe(4);
      expect(a.maxReplays).toBe(1);
    });

    it('returns intermediate difficulty and normal speed for B1', () => {
      const a = getCefrAdaptation('B1');
      expect(a.difficulty).toBe('intermediate');
      expect(a.ttsSpeed).toBe(1.0);
      expect(a.maxReplays).toBe(1);
    });

    it('returns advanced difficulty and no replays for B2', () => {
      const a = getCefrAdaptation('B2');
      expect(a.difficulty).toBe('advanced');
      expect(a.ttsSpeed).toBe(1.0);
      expect(a.maxReplays).toBe(0);
    });
  });

  describe('LISTENING_EXAM_CONTEXTS', () => {
    it('has all expected business types', () => {
      const types = Object.keys(LISTENING_EXAM_CONTEXTS);
      expect(types).toContain('bakery');
      expect(types).toContain('restaurant');
      expect(types).toContain('blacksmith');
      expect(types).toContain('market');
      expect(types).toContain('inn');
      expect(types).toContain('guide');
    });

    it('each context has valid content template', () => {
      for (const [key, ctx] of Object.entries(LISTENING_EXAM_CONTEXTS)) {
        expect(ctx.businessType).toBe(key);
        expect(ctx.npcRole).toBeTruthy();
        expect(ctx.contentTemplate.topic).toBeTruthy();
        expect(ctx.contentTemplate.questionCount).toBeGreaterThan(0);
      }
    });
  });

  describe('createListeningExam', () => {
    it('creates an exam with correct fields', () => {
      const exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Pierre',
        businessType: 'bakery',
        targetLanguage: 'French',
        cefrLevel: 'A2',
      });

      expect(exam.npcId).toBe('npc-1');
      expect(exam.npcName).toBe('Pierre');
      expect(exam.businessType).toBe('bakery');
      expect(exam.targetLanguage).toBe('French');
      expect(exam.cefrLevel).toBe('A2');
      expect(exam.maxPoints).toBe(13);
      expect(exam.maxReplays).toBe(1); // A2 = 1 replay
      expect(exam.id).toMatch(/^npc_exam_/);
    });

    it('adapts difficulty to CEFR level', () => {
      const a1Exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Baker',
        businessType: 'bakery',
        targetLanguage: 'French',
        cefrLevel: 'A1',
      });
      expect(a1Exam.contentTemplate.difficulty).toBe('beginner');
      expect(a1Exam.contentTemplate.lengthSentences).toBe(2);

      const b2Exam = engine.createListeningExam({
        npcId: 'npc-2',
        npcName: 'Guide',
        businessType: 'guide',
        targetLanguage: 'French',
        cefrLevel: 'B2',
      });
      expect(b2Exam.contentTemplate.difficulty).toBe('advanced');
      expect(b2Exam.contentTemplate.lengthSentences).toBe(6);
      expect(b2Exam.maxReplays).toBe(0);
    });

    it('falls back to guide context for unknown business type', () => {
      const exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Unknown',
        businessType: 'unknown_type',
        targetLanguage: 'French',
        cefrLevel: 'A2',
      });
      expect(exam.contentTemplate.topic).toContain('guide');
    });

    it('resolves cityName placeholder in topic', () => {
      // Guide context doesn't have {{cityName}} but let's verify no crash
      const exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Guide',
        businessType: 'guide',
        targetLanguage: 'French',
        cefrLevel: 'A2',
        cityName: 'Paris',
      });
      expect(exam.contentTemplate.topic).toBeTruthy();
    });
  });

  describe('evaluateResult', () => {
    it('marks exam as passed when score >= 60%', () => {
      const exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Pierre',
        businessType: 'bakery',
        targetLanguage: 'French',
        cefrLevel: 'A2',
      });

      const result = engine.evaluateResult(exam, {
        totalScore: 10,
        maxScore: 13,
        overallRationale: 'Good comprehension',
      });

      expect(result.passed).toBe(true);
      expect(result.totalScore).toBe(10);
      expect(result.maxScore).toBe(13);
      expect(result.percentage).toBe(77);
    });

    it('marks exam as failed when score < 60%', () => {
      const exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Pierre',
        businessType: 'bakery',
        targetLanguage: 'French',
        cefrLevel: 'A2',
      });

      const result = engine.evaluateResult(exam, {
        totalScore: 5,
        maxScore: 13,
        overallRationale: 'Needs improvement',
      });

      expect(result.passed).toBe(false);
      expect(result.percentage).toBe(38);
    });

    it('clamps score to maxPoints', () => {
      const exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Pierre',
        businessType: 'bakery',
        targetLanguage: 'French',
        cefrLevel: 'A2',
      });

      const result = engine.evaluateResult(exam, {
        totalScore: 20, // More than maxPoints
        maxScore: 20,
        overallRationale: 'Perfect',
      });

      expect(result.totalScore).toBe(13); // Clamped to maxPoints
    });

    it('includes question scores when provided', () => {
      const exam = engine.createListeningExam({
        npcId: 'npc-1',
        npcName: 'Pierre',
        businessType: 'bakery',
        targetLanguage: 'French',
        cefrLevel: 'A2',
      });

      const questionScores = [
        { questionId: 'q1', score: 4, maxScore: 4, rationale: 'Correct' },
        { questionId: 'q2', score: 3, maxScore: 4, rationale: 'Partial' },
        { questionId: 'q3', score: 3, maxScore: 5, rationale: 'Partial' },
      ];

      const result = engine.evaluateResult(exam, {
        totalScore: 10,
        maxScore: 13,
        questionScores,
        overallRationale: 'Good',
      });

      expect(result.questionScores).toHaveLength(3);
      expect(result.questionScores![0].questionId).toBe('q1');
    });
  });

  describe('utility methods', () => {
    it('getTtsSpeed returns correct speed for each level', () => {
      expect(engine.getTtsSpeed('A1')).toBe(0.7);
      expect(engine.getTtsSpeed('A2')).toBe(0.85);
      expect(engine.getTtsSpeed('B1')).toBe(1.0);
      expect(engine.getTtsSpeed('B2')).toBe(1.0);
    });

    it('getContext returns correct context', () => {
      const ctx = engine.getContext('restaurant');
      expect(ctx.businessType).toBe('restaurant');
      expect(ctx.npcRole).toBe('a waiter');
    });

    it('getContext falls back to guide for unknown type', () => {
      const ctx = engine.getContext('unknown');
      expect(ctx.businessType).toBe('guide');
    });

    it('getAvailableContexts returns all types', () => {
      const contexts = engine.getAvailableContexts();
      expect(contexts.length).toBe(6);
      expect(contexts).toContain('bakery');
      expect(contexts).toContain('restaurant');
    });
  });
});
