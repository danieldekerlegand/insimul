/**
 * Tests for composition quest features:
 * - QuestCompletionEngine write_response/describe_scene tracking
 * - CompositionWritingUI word counting logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../QuestCompletionEngine';
import { CompositionWritingUI } from '../CompositionWritingUI';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string }): CompletionObjective {
  return {
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── QuestCompletionEngine: writing_submitted ─────────────────────────────────

describe('QuestCompletionEngine — writing_submitted', () => {
  let engine: QuestCompletionEngine;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;
  let questCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    objectiveCompletedSpy = vi.fn();
    questCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
    engine.setOnQuestCompleted(questCompletedSpy);
  });

  it('completes a write_response objective with a single submission', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'writing_submitted', text: 'Bonjour le monde', wordCount: 3 });

    expect(obj.completed).toBe(true);
    expect(obj.currentCount).toBe(1);
    expect(obj.writtenResponses).toEqual(['Bonjour le monde']);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('tracks multiple submissions toward requiredCount', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
      requiredCount: 3,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'writing_submitted', text: 'Response 1', wordCount: 2 });
    expect(obj.completed).toBe(false);
    expect(obj.currentCount).toBe(1);

    engine.trackEvent({ type: 'writing_submitted', text: 'Response 2', wordCount: 2 });
    expect(obj.completed).toBe(false);
    expect(obj.currentCount).toBe(2);

    engine.trackEvent({ type: 'writing_submitted', text: 'Response 3', wordCount: 2 });
    expect(obj.completed).toBe(true);
    expect(obj.currentCount).toBe(3);
    expect(obj.writtenResponses).toHaveLength(3);
  });

  it('rejects submissions below minWordCount', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
      requiredCount: 1,
      minWordCount: 10,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'writing_submitted', text: 'Too short', wordCount: 2 });

    // Count increments but objective is NOT completed due to word count
    expect(obj.currentCount).toBe(1);
    expect(obj.completed).toBe(false);
  });

  it('accepts submissions meeting minWordCount', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
      requiredCount: 1,
      minWordCount: 5,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'writing_submitted',
      text: 'This has exactly five words here',
      wordCount: 6,
    });

    expect(obj.completed).toBe(true);
  });

  it('works with describe_scene objective type', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'describe_scene',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'writing_submitted',
      text: 'Je vois une belle maison avec un jardin',
      wordCount: 8,
    });

    expect(obj.completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('scopes to questId when provided', () => {
    const obj1 = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
      requiredCount: 1,
    });
    const obj2 = makeObjective({
      id: 'o2',
      questId: 'q2',
      type: 'write_response',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj1]));
    engine.addQuest(makeQuest('q2', [obj2]));

    engine.trackEvent({
      type: 'writing_submitted',
      text: 'Only for quest 2',
      wordCount: 4,
      questId: 'q2',
    });

    expect(obj1.completed).toBe(false);
    expect(obj2.completed).toBe(true);
  });

  it('completes quest when all objectives are done', () => {
    const obj1 = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
      requiredCount: 1,
    });
    const obj2 = makeObjective({
      id: 'o2',
      questId: 'q1',
      type: 'describe_scene',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj1, obj2]));

    engine.trackEvent({ type: 'writing_submitted', text: 'Response', wordCount: 1 });

    // Both should complete since both are write types
    expect(questCompletedSpy).toHaveBeenCalledWith('q1');
  });

  it('ignores already-completed objectives', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
      requiredCount: 1,
      completed: true,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'writing_submitted', text: 'Extra', wordCount: 1 });

    expect(objectiveCompletedSpy).not.toHaveBeenCalled();
  });

  it('defaults requiredCount to 1', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'write_response',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'writing_submitted', text: 'Hello', wordCount: 1 });

    expect(obj.completed).toBe(true);
  });
});

// ── CompositionWritingUI: word counting ──────────────────────────────────────

describe('CompositionWritingUI — countWords', () => {
  let ui: CompositionWritingUI;

  beforeEach(() => {
    ui = new CompositionWritingUI();
  });

  it('returns 0 for empty string', () => {
    expect(ui.countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only string', () => {
    expect(ui.countWords('   \t  \n  ')).toBe(0);
  });

  it('counts single word', () => {
    expect(ui.countWords('hello')).toBe(1);
  });

  it('counts multiple words', () => {
    expect(ui.countWords('hello world foo bar')).toBe(4);
  });

  it('handles multiple spaces between words', () => {
    expect(ui.countWords('hello   world    foo')).toBe(3);
  });

  it('handles leading and trailing whitespace', () => {
    expect(ui.countWords('  hello world  ')).toBe(2);
  });

  it('handles newlines as word separators', () => {
    expect(ui.countWords('hello\nworld\nfoo')).toBe(3);
  });

  it('handles tabs as word separators', () => {
    expect(ui.countWords('hello\tworld')).toBe(2);
  });
});
