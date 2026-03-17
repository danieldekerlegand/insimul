import { describe, it, expect } from 'vitest';
import {
  createObjectRecognitionExam,
  scoreNpcObjectRecognitionExam,
} from '../services/npc-exam-engine';

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
