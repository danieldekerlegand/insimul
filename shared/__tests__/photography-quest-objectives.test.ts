/**
 * Tests for photography quest objectives
 *
 * Validates the photograph_subject objective type in quest-objective-types.ts
 * and the photo tracking logic in QuestCompletionEngine.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ACHIEVABLE_OBJECTIVE_TYPES,
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
  validateAndNormalizeObjectives,
  buildObjectiveTypePrompt,
} from '../quest-objective-types';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return {
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── Objective Type Registration ──────────────────────────────────────────────

describe('photograph_subject objective type', () => {
  it('is registered in ACHIEVABLE_OBJECTIVE_TYPES', () => {
    const entry = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'photograph_subject');
    expect(entry).toBeDefined();
    expect(entry!.countable).toBe(true);
    expect(entry!.requiresTarget).toBe('none');
  });

  it('is in VALID_OBJECTIVE_TYPES set', () => {
    expect(VALID_OBJECTIVE_TYPES.has('photograph_subject')).toBe(true);
  });

  it('is included in buildObjectiveTypePrompt output', () => {
    const prompt = buildObjectiveTypePrompt();
    expect(prompt).toContain('photograph_subject');
  });
});

// ── Normalization ────────────────────────────────────────────────────────────

describe('photography normalization', () => {
  it.each([
    ['photograph', 'photograph_subject'],
    ['take_photo', 'photograph_subject'],
    ['take_photograph', 'photograph_subject'],
    ['photo', 'photograph_subject'],
    ['snap_photo', 'photograph_subject'],
    ['capture_photo', 'photograph_subject'],
    ['photograph_item', 'photograph_subject'],
    ['photograph_npc', 'photograph_subject'],
    ['photograph_building', 'photograph_subject'],
    ['photograph_nature', 'photograph_subject'],
    ['photo_subject', 'photograph_subject'],
  ])('normalizes "%s" to "%s"', (input, expected) => {
    expect(normalizeObjectiveType(input)).toBe(expected);
  });

  it('normalizes photograph_subject to itself', () => {
    expect(normalizeObjectiveType('photograph_subject')).toBe('photograph_subject');
  });

  it('validateAndNormalizeObjectives keeps photograph_subject', () => {
    const objectives = [
      { type: 'take_photo', description: 'Take a photo' },
      { type: 'photograph_subject', description: 'Photograph a building' },
    ];
    const result = validateAndNormalizeObjectives(objectives);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('photograph_subject');
    expect(result[1].type).toBe('photograph_subject');
  });
});

// ── QuestCompletionEngine tracking ──────────────────────────────────────────

describe('QuestCompletionEngine photo tracking', () => {
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

  it('completes a single-photo objective on photo_taken', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Town Hall',
      subjectCategory: 'building',
    });

    expect(obj.completed).toBe(true);
    expect(obj.photographedSubjects).toEqual(['town hall']);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('tracks multiple unique subjects for countable objectives', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      requiredCount: 3,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'photo_taken', subjectName: 'Cat', subjectCategory: 'nature' });
    expect(obj.currentCount).toBe(1);
    expect(obj.completed).toBe(false);

    engine.trackEvent({ type: 'photo_taken', subjectName: 'Dog', subjectCategory: 'nature' });
    expect(obj.currentCount).toBe(2);
    expect(obj.completed).toBe(false);

    engine.trackEvent({ type: 'photo_taken', subjectName: 'Bird', subjectCategory: 'nature' });
    expect(obj.currentCount).toBe(3);
    expect(obj.completed).toBe(true);
  });

  it('ignores duplicate subjects', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      requiredCount: 2,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'photo_taken', subjectName: 'Cat', subjectCategory: 'nature' });
    engine.trackEvent({ type: 'photo_taken', subjectName: 'Cat', subjectCategory: 'nature' });
    engine.trackEvent({ type: 'photo_taken', subjectName: 'cat', subjectCategory: 'nature' }); // case-insensitive duplicate

    expect(obj.currentCount).toBe(1);
    expect(obj.completed).toBe(false);
  });

  it('filters by targetCategory when specified', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetCategory: 'building',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    // Wrong category — should not count
    engine.trackEvent({ type: 'photo_taken', subjectName: 'Cat', subjectCategory: 'nature' });
    expect(obj.currentCount).toBeUndefined();
    expect(obj.completed).toBe(false);

    // Right category
    engine.trackEvent({ type: 'photo_taken', subjectName: 'Library', subjectCategory: 'building' });
    expect(obj.currentCount).toBe(1);
    expect(obj.completed).toBe(true);
  });

  it('filters by targetSubject when specified', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetSubject: 'Town Hall',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    // Wrong subject
    engine.trackEvent({ type: 'photo_taken', subjectName: 'Library', subjectCategory: 'building' });
    expect(obj.completed).toBe(false);

    // Right subject (case-insensitive)
    engine.trackEvent({ type: 'photo_taken', subjectName: 'town hall', subjectCategory: 'building' });
    expect(obj.completed).toBe(true);
  });

  it('completes quest when all photo objectives are done', () => {
    const obj1 = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetCategory: 'npc',
      requiredCount: 1,
    });
    const obj2 = makeObjective({
      id: 'o2',
      questId: 'q1',
      type: 'photograph_subject',
      targetCategory: 'building',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj1, obj2]));

    engine.trackEvent({ type: 'photo_taken', subjectName: 'Marie', subjectCategory: 'npc' });
    expect(questCompletedSpy).not.toHaveBeenCalled();

    engine.trackEvent({ type: 'photo_taken', subjectName: 'Bakery', subjectCategory: 'building' });
    expect(questCompletedSpy).toHaveBeenCalledWith('q1');
  });

  it('works in mixed-objective quests', () => {
    const photoObj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      requiredCount: 1,
    });
    const talkObj = makeObjective({
      id: 'o2',
      questId: 'q1',
      type: 'talk_to_npc',
      npcId: 'npc-1',
    });
    engine.addQuest(makeQuest('q1', [photoObj, talkObj]));

    engine.trackEvent({ type: 'photo_taken', subjectName: 'Fountain', subjectCategory: 'nature' });
    expect(photoObj.completed).toBe(true);
    expect(questCompletedSpy).not.toHaveBeenCalled();

    engine.trackEvent({ type: 'npc_conversation', npcId: 'npc-1' });
    expect(talkObj.completed).toBe(true);
    expect(questCompletedSpy).toHaveBeenCalledWith('q1');
  });
});
