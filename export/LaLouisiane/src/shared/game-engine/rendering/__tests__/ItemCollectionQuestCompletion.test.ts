/**
 * Tests for item collection → quest completion chain
 *
 * Verifies: fallback matching, quantity tracking, quest item tagging,
 * drop prevention, and notification metadata.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
  type CollectedItemMatch,
} from '../../logic/QuestCompletionEngine';

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

describe('Item Collection → Quest Completion', () => {
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

  // ── Exact matching ──────────────────────────────────────────────────────

  describe('exact matching', () => {
    it('completes objective on exact name match (case-insensitive)', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'Herbs',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('herbs');

      expect(matches).toHaveLength(1);
      expect(matches[0].completed).toBe(true);
      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });
  });

  // ── Partial matching ────────────────────────────────────────────────────

  describe('partial matching', () => {
    it('matches when collected item name contains objective itemName', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'herbs',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('Healing Herbs');

      expect(matches).toHaveLength(1);
      expect(matches[0].completed).toBe(true);
      expect(obj.completed).toBe(true);
    });

    it('matches when objective itemName contains collected item name', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'rare golden fish',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('golden fish');

      expect(matches).toHaveLength(1);
      expect(obj.completed).toBe(true);
    });
  });

  // ── Category matching ───────────────────────────────────────────────────

  describe('category matching', () => {
    it('matches when category matches objective itemName', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'herbs',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('Rosemary', undefined, 'herbs');

      expect(matches).toHaveLength(1);
      expect(obj.completed).toBe(true);
    });

    it('does not match when neither name nor category matches', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'herbs',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('Sword', undefined, 'weapon');

      expect(matches).toHaveLength(0);
      expect(obj.completed).toBe(false);
    });
  });

  // ── Quantity-based objectives ───────────────────────────────────────────

  describe('quantity tracking', () => {
    it('increments collectedCount and only completes when reaching itemCount', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'fish',
        itemCount: 3,
        collectedCount: 0,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      // Collect 1st fish
      let matches = engine.trackCollectedItemByName('fish');
      expect(matches).toHaveLength(1);
      expect(matches[0].completed).toBe(false);
      expect(matches[0].current).toBe(1);
      expect(matches[0].required).toBe(3);
      expect(obj.completed).toBe(false);
      expect(obj.collectedCount).toBe(1);

      // Collect 2nd fish
      matches = engine.trackCollectedItemByName('fish');
      expect(matches[0].completed).toBe(false);
      expect(matches[0].current).toBe(2);
      expect(obj.collectedCount).toBe(2);

      // Collect 3rd fish - should complete
      matches = engine.trackCollectedItemByName('fish');
      expect(matches[0].completed).toBe(true);
      expect(matches[0].current).toBe(3);
      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });

    it('completes single-item objectives immediately', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'key',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('key');

      expect(matches[0].completed).toBe(true);
      expect(obj.completed).toBe(true);
    });
  });

  // ── Return value metadata ──────────────────────────────────────────────

  describe('return value metadata', () => {
    it('returns match info for notification display', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'crystal',
        description: 'Collect the magic crystal',
        itemCount: 2,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('crystal');

      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(
        expect.objectContaining({
          questId: 'q1',
          objectiveId: 'o1',
          objectiveDescription: 'Collect the magic crystal',
          completed: false,
          current: 1,
          required: 2,
        }),
      );
    });

    it('returns empty array when no objectives match', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'gem',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const matches = engine.trackCollectedItemByName('sword');

      expect(matches).toHaveLength(0);
    });
  });

  // ── Quest completion on all objectives done ────────────────────────────

  describe('quest completion', () => {
    it('fires quest completed when all collect objectives are done', () => {
      const obj1 = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'herb',
      });
      const obj2 = makeObjective({
        id: 'o2',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'mushroom',
      });
      engine.addQuest(makeQuest('q1', [obj1, obj2]));

      engine.trackCollectedItemByName('herb');
      expect(questCompletedSpy).not.toHaveBeenCalled();

      engine.trackCollectedItemByName('mushroom');
      expect(questCompletedSpy).toHaveBeenCalledWith('q1');
    });

    it('collects 3 quest items and verifies all complete', () => {
      const objectives = [
        makeObjective({ id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'red flower' }),
        makeObjective({ id: 'o2', questId: 'q1', type: 'collect_item', itemName: 'blue stone' }),
        makeObjective({ id: 'o3', questId: 'q1', type: 'collect_item', itemName: 'golden feather' }),
      ];
      engine.addQuest(makeQuest('q1', objectives));

      engine.trackCollectedItemByName('Red Flower');
      expect(objectives[0].completed).toBe(true);
      expect(engine.isQuestComplete('q1')).toBe(false);

      engine.trackCollectedItemByName('Blue Stone');
      expect(objectives[1].completed).toBe(true);
      expect(engine.isQuestComplete('q1')).toBe(false);

      engine.trackCollectedItemByName('Golden Feather');
      expect(objectives[2].completed).toBe(true);
      expect(engine.isQuestComplete('q1')).toBe(true);
      expect(questCompletedSpy).toHaveBeenCalledWith('q1');
    });
  });

  // ── Objective dependency ordering ──────────────────────────────────────

  describe('dependency ordering', () => {
    it('does not complete locked objectives', () => {
      const obj1 = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'key',
        order: 0,
      });
      const obj2 = makeObjective({
        id: 'o2',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'gem',
        order: 1,
      });
      engine.addQuest(makeQuest('q1', [obj1, obj2]));

      // Try to collect gem first (locked behind key)
      const matches = engine.trackCollectedItemByName('gem');
      expect(matches).toHaveLength(0);
      expect(obj2.completed).toBe(false);

      // Collect key first
      engine.trackCollectedItemByName('key');
      expect(obj1.completed).toBe(true);

      // Now gem should work
      const matches2 = engine.trackCollectedItemByName('gem');
      expect(matches2).toHaveLength(1);
      expect(obj2.completed).toBe(true);
    });
  });

  // ── Serialization includes collectedCount ──────────────────────────────

  describe('serialization', () => {
    it('persists collectedCount in serialized state', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'fish',
        itemCount: 5,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackCollectedItemByName('fish');
      engine.trackCollectedItemByName('fish');

      const states = engine.serializeObjectiveStates();
      expect(states['q1']).toBeDefined();
      const saved = states['q1'].find((s: any) => s.id === 'o1');
      expect(saved?.collectedCount).toBe(2);
    });

    it('restores collectedCount and resumes tracking', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'collect_item',
        itemName: 'fish',
        itemCount: 3,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      // Restore previous progress
      engine.restoreObjectiveStates({
        q1: [{ id: 'o1', collectedCount: 2 }],
      });

      expect(obj.collectedCount).toBe(2);

      // One more should complete it
      const matches = engine.trackCollectedItemByName('fish');
      expect(matches[0].completed).toBe(true);
      expect(obj.collectedCount).toBe(3);
    });
  });
});
