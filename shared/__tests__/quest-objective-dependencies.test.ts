import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  CompletionQuest,
  CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';

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

describe('QuestCompletionEngine — objective dependencies', () => {
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

  // ── dependsOn ─────────────────────────────────────────────────────────────

  describe('dependsOn', () => {
    it('blocks completion when dependency is incomplete', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc' }),
        makeObjective({ id: 'b', type: 'collect_item', dependsOn: ['a'] }),
      ]);
      engine.addQuest(quest);

      const result = engine.completeObjective('q1', 'b');
      expect(result).toBe(false);
      expect(quest.objectives![1].completed).toBe(false);
      expect(onObjectiveCompleted).not.toHaveBeenCalled();
    });

    it('allows completion when dependency is satisfied', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc' }),
        makeObjective({ id: 'b', type: 'collect_item', dependsOn: ['a'] }),
      ]);
      engine.addQuest(quest);

      expect(engine.completeObjective('q1', 'a')).toBe(true);
      expect(engine.completeObjective('q1', 'b')).toBe(true);
      expect(onObjectiveCompleted).toHaveBeenCalledTimes(2);
    });

    it('blocks when any dependency in a multi-dependency chain is incomplete', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc' }),
        makeObjective({ id: 'b', type: 'collect_item' }),
        makeObjective({ id: 'c', type: 'deliver_item', dependsOn: ['a', 'b'] }),
      ]);
      engine.addQuest(quest);

      engine.completeObjective('q1', 'a');
      // 'b' not yet completed
      expect(engine.completeObjective('q1', 'c')).toBe(false);

      engine.completeObjective('q1', 'b');
      expect(engine.completeObjective('q1', 'c')).toBe(true);
    });

    it('supports a dependency chain (a -> b -> c)', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc' }),
        makeObjective({ id: 'b', type: 'collect_item', dependsOn: ['a'] }),
        makeObjective({ id: 'c', type: 'deliver_item', dependsOn: ['b'] }),
      ]);
      engine.addQuest(quest);

      expect(engine.completeObjective('q1', 'c')).toBe(false);
      expect(engine.completeObjective('q1', 'b')).toBe(false);
      expect(engine.completeObjective('q1', 'a')).toBe(true);
      expect(engine.completeObjective('q1', 'b')).toBe(true);
      expect(engine.completeObjective('q1', 'c')).toBe(true);
      expect(onQuestCompleted).toHaveBeenCalledWith('q1');
    });

    it('does not block if dependsOn is empty array', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', dependsOn: [] }),
      ]);
      engine.addQuest(quest);

      expect(engine.completeObjective('q1', 'a')).toBe(true);
    });

    it('does not block if dependsOn references a non-existent objective', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', dependsOn: ['nonexistent'] }),
      ]);
      engine.addQuest(quest);

      // Non-existent dependency is not found, so it does not block
      expect(engine.completeObjective('q1', 'a')).toBe(true);
    });
  });

  // ── order-based sequencing ────────────────────────────────────────────────

  describe('order-based sequencing', () => {
    it('blocks higher-order objectives when lower-order ones are incomplete', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', order: 1 }),
        makeObjective({ id: 'b', type: 'collect_item', order: 2 }),
        makeObjective({ id: 'c', type: 'deliver_item', order: 3 }),
      ]);
      engine.addQuest(quest);

      expect(engine.completeObjective('q1', 'c')).toBe(false);
      expect(engine.completeObjective('q1', 'b')).toBe(false);
      expect(engine.completeObjective('q1', 'a')).toBe(true);
      expect(engine.completeObjective('q1', 'b')).toBe(true);
      expect(engine.completeObjective('q1', 'c')).toBe(true);
    });

    it('allows same-order objectives to be completed in any order', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', order: 1 }),
        makeObjective({ id: 'b', type: 'collect_item', order: 1 }),
        makeObjective({ id: 'c', type: 'deliver_item', order: 2 }),
      ]);
      engine.addQuest(quest);

      // Both order-1 objectives can be completed in any order
      expect(engine.completeObjective('q1', 'b')).toBe(true);
      expect(engine.completeObjective('q1', 'a')).toBe(true);
      // order-2 now unlocked
      expect(engine.completeObjective('q1', 'c')).toBe(true);
    });

    it('does not apply ordering to objectives without order field', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', order: 1 }),
        makeObjective({ id: 'b', type: 'collect_item' }), // no order
        makeObjective({ id: 'c', type: 'deliver_item', order: 2 }),
      ]);
      engine.addQuest(quest);

      // 'b' has no order, so it's always available
      expect(engine.completeObjective('q1', 'b')).toBe(true);
      // 'c' is order 2, blocked by 'a' (order 1)
      expect(engine.completeObjective('q1', 'c')).toBe(false);
      engine.completeObjective('q1', 'a');
      expect(engine.completeObjective('q1', 'c')).toBe(true);
    });
  });

  // ── forEachObjective skips locked objectives ──────────────────────────────

  describe('event tracking respects dependencies', () => {
    it('trackEvent does not complete locked objectives', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', npcId: 'npc1' }),
        makeObjective({ id: 'b', type: 'talk_to_npc', npcId: 'npc1', dependsOn: ['a'] }),
      ]);
      engine.addQuest(quest);

      // First call should only complete 'a', not 'b' (locked)
      engine.trackEvent({ type: 'npc_conversation', npcId: 'npc1' });
      expect(quest.objectives![0].completed).toBe(true);
      expect(quest.objectives![1].completed).toBe(false);

      // Second call should now complete 'b'
      engine.trackEvent({ type: 'npc_conversation', npcId: 'npc1' });
      expect(quest.objectives![1].completed).toBe(true);
    });

    it('trackEvent skips order-locked objectives', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'collect_item', itemName: 'gem', order: 1 }),
        makeObjective({ id: 'b', type: 'collect_item', itemName: 'gem', order: 2 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({ type: 'collect_item_by_name', itemName: 'gem' });
      expect(quest.objectives![0].completed).toBe(true);
      expect(quest.objectives![1].completed).toBe(false);

      engine.trackEvent({ type: 'collect_item_by_name', itemName: 'gem' });
      expect(quest.objectives![1].completed).toBe(true);
    });
  });

  // ── getAvailableObjectives / getLockedObjectives ──────────────────────────

  describe('getAvailableObjectives', () => {
    it('returns only unlocked incomplete objectives', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', order: 1 }),
        makeObjective({ id: 'b', type: 'collect_item', order: 2 }),
        makeObjective({ id: 'c', type: 'deliver_item', order: 3 }),
      ]);
      engine.addQuest(quest);

      let available = engine.getAvailableObjectives('q1');
      expect(available.map(o => o.id)).toEqual(['a']);

      engine.completeObjective('q1', 'a');
      available = engine.getAvailableObjectives('q1');
      expect(available.map(o => o.id)).toEqual(['b']);

      engine.completeObjective('q1', 'b');
      available = engine.getAvailableObjectives('q1');
      expect(available.map(o => o.id)).toEqual(['c']);
    });

    it('returns empty for non-existent quest', () => {
      expect(engine.getAvailableObjectives('nonexistent')).toEqual([]);
    });

    it('excludes completed objectives', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc' }),
        makeObjective({ id: 'b', type: 'collect_item' }),
      ]);
      engine.addQuest(quest);
      engine.completeObjective('q1', 'a');

      const available = engine.getAvailableObjectives('q1');
      expect(available.map(o => o.id)).toEqual(['b']);
    });
  });

  describe('getLockedObjectives', () => {
    it('returns only locked incomplete objectives', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', order: 1 }),
        makeObjective({ id: 'b', type: 'collect_item', order: 2 }),
        makeObjective({ id: 'c', type: 'deliver_item', order: 3 }),
      ]);
      engine.addQuest(quest);

      let locked = engine.getLockedObjectives('q1');
      expect(locked.map(o => o.id)).toEqual(['b', 'c']);

      engine.completeObjective('q1', 'a');
      locked = engine.getLockedObjectives('q1');
      expect(locked.map(o => o.id)).toEqual(['c']);
    });

    it('returns empty for non-existent quest', () => {
      expect(engine.getLockedObjectives('nonexistent')).toEqual([]);
    });
  });

  // ── Mixed dependsOn + order ───────────────────────────────────────────────

  describe('mixed dependsOn and order', () => {
    it('both constraints must be satisfied', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc', order: 1 }),
        makeObjective({ id: 'b', type: 'collect_item', order: 1 }),
        makeObjective({ id: 'c', type: 'deliver_item', order: 2, dependsOn: ['b'] }),
      ]);
      engine.addQuest(quest);

      // 'c' needs both: order-1 objectives complete AND 'b' specifically
      engine.completeObjective('q1', 'a');
      expect(engine.completeObjective('q1', 'c')).toBe(false); // 'b' not done (dependsOn + order)

      engine.completeObjective('q1', 'b');
      expect(engine.completeObjective('q1', 'c')).toBe(true);
    });
  });

  // ── Quest without dependencies (backward compatibility) ───────────────────

  describe('backward compatibility', () => {
    it('objectives without dependsOn or order can be completed in any order', () => {
      const quest = makeQuest('q1', [
        makeObjective({ id: 'a', type: 'talk_to_npc' }),
        makeObjective({ id: 'b', type: 'collect_item' }),
        makeObjective({ id: 'c', type: 'deliver_item' }),
      ]);
      engine.addQuest(quest);

      expect(engine.completeObjective('q1', 'c')).toBe(true);
      expect(engine.completeObjective('q1', 'a')).toBe(true);
      expect(engine.completeObjective('q1', 'b')).toBe(true);
      expect(onQuestCompleted).toHaveBeenCalledWith('q1');
    });
  });
});
