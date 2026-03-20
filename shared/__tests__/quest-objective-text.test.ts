import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  CompletionQuest,
  CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';
import {
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
} from '../quest-objective-types';

function makeObjective(overrides: Partial<CompletionObjective> & { id: string; type: string }): CompletionObjective {
  return {
    questId: 'q1',
    description: `Objective ${overrides.id}`,
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── Objective type registration ──────────────────────────────────────────────

describe('Text-related objective types', () => {
  it('find_text is a valid objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('find_text')).toBe(true);
  });

  it('read_text is a valid objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('read_text')).toBe(true);
  });

  it('comprehension_quiz is a valid objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('comprehension_quiz')).toBe(true);
  });
});

// ── Normalization aliases ────────────────────────────────────────────────────

describe('Text-related normalization aliases', () => {
  it.each([
    ['find_book', 'find_text'],
    ['find_document', 'find_text'],
    ['locate_text', 'find_text'],
    ['locate_book', 'find_text'],
    ['find_scroll', 'find_text'],
    ['search_text', 'find_text'],
  ])('normalizes "%s" to "%s"', (alias, canonical) => {
    expect(normalizeObjectiveType(alias)).toBe(canonical);
  });

  it.each([
    ['read_book', 'read_text'],
    ['read_document', 'read_text'],
    ['read_scroll', 'read_text'],
    ['read_letter', 'read_text'],
    ['study_text', 'read_text'],
  ])('normalizes "%s" to "%s"', (alias, canonical) => {
    expect(normalizeObjectiveType(alias)).toBe(canonical);
  });

  it.each([
    ['text_quiz', 'comprehension_quiz'],
    ['reading_quiz', 'comprehension_quiz'],
    ['reading_comprehension', 'comprehension_quiz'],
    ['text_comprehension', 'comprehension_quiz'],
    ['book_quiz', 'comprehension_quiz'],
    ['answer_about_text', 'comprehension_quiz'],
  ])('normalizes "%s" to "%s"', (alias, canonical) => {
    expect(normalizeObjectiveType(alias)).toBe(canonical);
  });
});

// ── QuestCompletionEngine tracking ───────────────────────────────────────────

describe('QuestCompletionEngine — text objective tracking', () => {
  let engine: QuestCompletionEngine;
  let onObjectiveCompleted: ReturnType<typeof vi.fn>;
  let onQuestCompleted: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    onObjectiveCompleted = vi.fn();
    onQuestCompleted = vi.fn();
    engine.setOnObjectiveCompleted(onObjectiveCompleted);
    engine.setOnQuestCompleted(onQuestCompleted);
  });

  // ── find_text ─────────────────────────────────────────────────────────────

  describe('find_text', () => {
    it('completes when a matching text is found', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text', itemName: 'Ancient Scroll' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_found', textId: 'text-1', textName: 'Ancient Scroll' });

      expect(quest.objectives![0].completed).toBe(true);
      expect(onObjectiveCompleted).toHaveBeenCalledWith('q1', 'a');
    });

    it('does not complete for non-matching text name', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text', itemName: 'Ancient Scroll' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_found', textId: 'text-2', textName: 'Modern Book' });

      expect(quest.objectives![0].completed).toBe(false);
    });

    it('completes when no specific itemName is required', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_found', textId: 'text-1', textName: 'Any Book' });

      expect(quest.objectives![0].completed).toBe(true);
    });

    it('supports countable find_text objectives', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text', requiredCount: 3 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_found', textId: 'text-1', textName: 'Book A' });
      expect(quest.objectives![0].completed).toBe(false);
      expect(quest.objectives![0].currentCount).toBe(1);

      engine.trackEvent({ type: 'text_found', textId: 'text-2', textName: 'Book B' });
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackEvent({ type: 'text_found', textId: 'text-3', textName: 'Book C' });
      expect(quest.objectives![0].completed).toBe(true);
    });

    it('does not double-count the same text', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text', requiredCount: 2 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_found', textId: 'text-1', textName: 'Book A' });
      engine.trackEvent({ type: 'text_found', textId: 'text-1', textName: 'Book A' });

      expect(quest.objectives![0].currentCount).toBe(1);
      expect(quest.objectives![0].completed).toBe(false);
    });

    it('matches by textId when itemName matches textId', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text', itemName: 'text-1' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_found', textId: 'text-1', textName: 'Some Book' });
      expect(quest.objectives![0].completed).toBe(true);
    });
  });

  // ── read_text ─────────────────────────────────────────────────────────────

  describe('read_text', () => {
    it('completes when the specific text is read', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'read_text', textId: 'text-1' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_read', textId: 'text-1' });

      expect(quest.objectives![0].completed).toBe(true);
      expect(onObjectiveCompleted).toHaveBeenCalledWith('q1', 'a');
    });

    it('does not complete for a different textId', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'read_text', textId: 'text-1' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_read', textId: 'text-2' });

      expect(quest.objectives![0].completed).toBe(false);
    });

    it('completes when no specific textId is required', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'read_text' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_read', textId: 'text-1' });

      expect(quest.objectives![0].completed).toBe(true);
    });

    it('supports countable read_text objectives', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'read_text', requiredCount: 2 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_read', textId: 'text-1' });
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackEvent({ type: 'text_read', textId: 'text-2' });
      expect(quest.objectives![0].completed).toBe(true);
    });

    it('does not double-count the same text', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'read_text', requiredCount: 2 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_read', textId: 'text-1' });
      engine.trackEvent({ type: 'text_read', textId: 'text-1' });

      expect(quest.objectives![0].currentCount).toBe(1);
    });
  });

  // ── comprehension_quiz ────────────────────────────────────────────────────

  describe('comprehension_quiz', () => {
    it('completes when enough correct answers are given', () => {
      const quest = makeQuest('q1', [
        makeObjective({
          id: 'a',
          type: 'comprehension_quiz',
          requiredCount: 2,
          quizQuestions: [
            { question: 'What color?', correctAnswer: 'blue' },
            { question: 'What size?', correctAnswer: 'large' },
            { question: 'What shape?', correctAnswer: 'round' },
          ],
        }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(false);
      expect(quest.objectives![0].quizCorrect).toBe(1);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(true);
      expect(onObjectiveCompleted).toHaveBeenCalledWith('q1', 'a');
    });

    it('tracks incorrect answers without completing', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'comprehension_quiz', requiredCount: 2 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: false });
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: false });

      expect(quest.objectives![0].quizAnswered).toBe(2);
      expect(quest.objectives![0].quizCorrect ?? 0).toBe(0);
      expect(quest.objectives![0].completed).toBe(false);
    });

    it('uses quizQuestions length as default required count', () => {
      const quest = makeQuest('q1', [
        makeObjective({
          id: 'a',
          type: 'comprehension_quiz',
          quizQuestions: [
            { question: 'Q1', correctAnswer: 'A1' },
            { question: 'Q2', correctAnswer: 'A2' },
          ],
        }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(true);
    });

    it('defaults to 3 correct answers when no questions or requiredCount set', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'comprehension_quiz' }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(true);
    });

    it('respects quizPassThreshold for custom pass requirements', () => {
      const quest = makeQuest('q1', [
        makeObjective({
          id: 'a',
          type: 'comprehension_quiz',
          requiredCount: 5,
          quizPassThreshold: 3,
        }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: false });
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![0].completed).toBe(true);
      expect(quest.objectives![0].quizAnswered).toBe(4);
      expect(quest.objectives![0].quizCorrect).toBe(3);
    });
  });

  // ── Full quest flow: find → read → quiz ───────────────────────────────────

  describe('full text quest flow (find → read → quiz)', () => {
    it('completes a sequential text quest with dependencies', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'find', type: 'find_text', itemName: 'History Book', order: 1 }),
        makeObjective({ id: 'read', type: 'read_text', textId: 'text-history', order: 2 }),
        makeObjective({ id: 'quiz', type: 'comprehension_quiz', requiredCount: 2, order: 3 }),
      ]);
      engine.addQuest(quest);

      // Quiz and read are locked
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![2].completed).toBe(false);

      engine.trackEvent({ type: 'text_read', textId: 'text-history' });
      expect(quest.objectives![1].completed).toBe(false);

      // Find the text first
      engine.trackEvent({ type: 'text_found', textId: 'text-history', textName: 'History Book' });
      expect(quest.objectives![0].completed).toBe(true);

      // Now read is unlocked
      engine.trackEvent({ type: 'text_read', textId: 'text-history' });
      expect(quest.objectives![1].completed).toBe(true);

      // Now quiz is unlocked
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(quest.objectives![2].completed).toBe(true);

      expect(onQuestCompleted).toHaveBeenCalledWith('q1');
    });
  });

  // ── Serialization ─────────────────────────────────────────────────────────

  describe('serialization of text objective progress', () => {
    it('serializes and restores text objective progress', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text', requiredCount: 2 }),
        makeObjective({ id: 'b', type: 'comprehension_quiz', requiredCount: 3 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'text_found', textId: 't1', textName: 'Book 1' });
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: false });

      const serialized = engine.serializeObjectiveStates();

      // Create fresh engine and restore
      const engine2 = new QuestCompletionEngine();
      const quest2 = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'find_text', requiredCount: 2 }),
        makeObjective({ id: 'b', type: 'comprehension_quiz', requiredCount: 3 }),
      ]);
      engine2.addQuest(quest2);
      engine2.restoreObjectiveStates(serialized);

      expect(quest2.objectives![0].textsFound).toEqual(['t1']);
      expect(quest2.objectives![0].currentCount).toBe(1);
      expect(quest2.objectives![1].quizAnswered).toBe(2);
      expect(quest2.objectives![1].quizCorrect).toBe(1);
    });
  });
});
