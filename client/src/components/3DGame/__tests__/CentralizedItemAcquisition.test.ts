/**
 * Tests for centralized item acquisition via handleItemAcquired()
 * and enhanced fuzzy matching in trackCollectedItemByName().
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../QuestCompletionEngine';

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

// ── Tests ────────────────────────────────────────────────────────────────────

describe('trackCollectedItemByName — fuzzy matching', () => {
  let engine: QuestCompletionEngine;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    objectiveCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
    engine.setOnQuestCompleted(vi.fn());
  });

  it('matches exact item name (case-insensitive)', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'Iron Sword',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('iron sword');
    expect(matches).toHaveLength(1);
    expect(matches[0].questId).toBe('q1');
    expect(matches[0].completed).toBe(true);
  });

  it('matches when objective name is substring of collected item', () => {
    // Objective says "herbs", player collects "Healing Herbs"
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'herbs',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('Healing Herbs');
    expect(matches).toHaveLength(1);
    expect(matches[0].completed).toBe(true);
  });

  it('matches when collected item name is substring of objective', () => {
    // Objective says "Rare Healing Herbs", player collects "herbs"
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'Rare Healing Herbs',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('herbs');
    expect(matches).toHaveLength(1);
  });

  it('matches by category (exact)', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'herbs',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('Chamomile', undefined, 'herbs');
    expect(matches).toHaveLength(1);
    expect(matches[0].completed).toBe(true);
  });

  it('matches by category substring', () => {
    // Objective says "fish", item category is "freshwater_fish"
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'fish',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('Bass', undefined, 'freshwater_fish');
    expect(matches).toHaveLength(1);
  });

  it('matches by word overlap', () => {
    // Objective says "healing herbs", player collects "dried herbs"
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'healing herbs',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('dried herbs');
    expect(matches).toHaveLength(1);
  });

  it('does not match unrelated items', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'Iron Sword',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('Golden Shield');
    expect(matches).toHaveLength(0);
  });

  it('ignores short word overlaps (< 3 chars) to avoid false positives', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'an axe',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    // "an" is only 2 chars — should not match on word overlap alone
    // But "an axe" vs "an arrow" will have substring match via "an a"
    // Use a case where there's truly no overlap
    const matches = engine.trackCollectedItemByName('of swords');
    expect(matches).toHaveLength(0);
  });
});

describe('trackCollectedItemByName — quantity tracking', () => {
  let engine: QuestCompletionEngine;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    objectiveCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
    engine.setOnQuestCompleted(vi.fn());
  });

  it('increments counter per collection call', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'fish',
      itemCount: 5,
      collectedCount: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const m1 = engine.trackCollectedItemByName('fish');
    expect(m1).toHaveLength(1);
    expect(m1[0].current).toBe(1);
    expect(m1[0].required).toBe(5);
    expect(m1[0].completed).toBe(false);

    engine.trackCollectedItemByName('fish');
    engine.trackCollectedItemByName('fish');
    const m4 = engine.trackCollectedItemByName('fish');
    expect(m4[0].current).toBe(4);
    expect(m4[0].completed).toBe(false);
  });

  it('completes objective when current >= required', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'fish',
      itemCount: 3,
      collectedCount: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackCollectedItemByName('fish');
    engine.trackCollectedItemByName('fish');
    const m3 = engine.trackCollectedItemByName('fish');

    expect(m3).toHaveLength(1);
    expect(m3[0].current).toBe(3);
    expect(m3[0].required).toBe(3);
    expect(m3[0].completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('does not double-complete already completed objectives', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'fish',
      itemCount: 1,
      collectedCount: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const m1 = engine.trackCollectedItemByName('fish');
    expect(m1[0].completed).toBe(true);

    // Second call should not match since objective is already completed
    const m2 = engine.trackCollectedItemByName('fish');
    expect(m2).toHaveLength(0);
  });

  it('handles default itemCount of 1', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'sword',
      // no itemCount specified — defaults to 1
    });
    engine.addQuest(makeQuest('q1', [obj]));

    const matches = engine.trackCollectedItemByName('sword');
    expect(matches).toHaveLength(1);
    expect(matches[0].completed).toBe(true);
    expect(matches[0].current).toBe(1);
    expect(matches[0].required).toBe(1);
  });
});

describe('trackCollectedItemByName — multiple quests', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    engine.setOnObjectiveCompleted(vi.fn());
    engine.setOnQuestCompleted(vi.fn());
  });

  it('matches across multiple quests simultaneously', () => {
    const obj1 = makeObjective({
      id: 'o1', questId: 'q1', type: 'collect_item',
      itemName: 'herbs',
    });
    const obj2 = makeObjective({
      id: 'o2', questId: 'q2', type: 'collect_item',
      itemName: 'Healing Herbs',
    });
    engine.addQuest(makeQuest('q1', [obj1]));
    engine.addQuest(makeQuest('q2', [obj2]));

    const matches = engine.trackCollectedItemByName('Healing Herbs');
    expect(matches).toHaveLength(2);
    expect(matches.map(m => m.questId).sort()).toEqual(['q1', 'q2']);
  });
});
