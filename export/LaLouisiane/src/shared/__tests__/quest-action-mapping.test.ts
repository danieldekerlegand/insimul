/**
 * Tests for the declarative quest-action mapping system.
 *
 * Validates that:
 * - The mapping catalog correctly maps event types to objective types
 * - Field matching works for exact, contains, and case-insensitive comparisons
 * - QuestCompletionEngine.handleGameEvent uses the mapping to complete objectives
 * - Quantity objectives increment and complete at threshold
 * - Compound objectives require all fields to match simultaneously
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';
import {
  QUEST_ACTION_MAPPINGS,
  getMappingsForEvent,
  getMappingForObjective,
  getRegisteredEventTypes,
  getRegisteredObjectiveTypes,
  matchesField,
  matchesAllFields,
  type FieldMatchRule,
} from '../game-engine/quest-action-mapping';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return { description: 'test objective', completed: false, ...overrides };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── Mapping catalog tests ────────────────────────────────────────────────────

describe('quest-action-mapping catalog', () => {
  it('has mappings for all 10 specified objective types', () => {
    const types = getRegisteredObjectiveTypes();
    expect(types).toContain('collect_item');
    expect(types).toContain('visit_location');
    expect(types).toContain('discover_location');
    expect(types).toContain('talk_to_npc');
    expect(types).toContain('complete_reading');
    expect(types).toContain('answer_questions');
    expect(types).toContain('photograph_subject');
    expect(types).toContain('photograph_activity');
    expect(types).toContain('physical_action');
    expect(types).toContain('craft_item');
  });

  it('maps item_collected to collect_item', () => {
    const mappings = getMappingsForEvent('item_collected');
    expect(mappings).toHaveLength(1);
    expect(mappings[0].objectiveType).toBe('collect_item');
  });

  it('maps photo_taken to both photograph_subject and photograph_activity', () => {
    const mappings = getMappingsForEvent('photo_taken');
    expect(mappings).toHaveLength(2);
    const types = mappings.map(m => m.objectiveType);
    expect(types).toContain('photograph_subject');
    expect(types).toContain('photograph_activity');
  });

  it('returns empty for unknown event types', () => {
    expect(getMappingsForEvent('unknown_event')).toEqual([]);
  });

  it('getMappingForObjective returns correct mapping', () => {
    const mapping = getMappingForObjective('collect_item');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('item_collected');
  });

  it('getRegisteredEventTypes returns all unique event types', () => {
    const types = getRegisteredEventTypes();
    expect(types).toContain('item_collected');
    expect(types).toContain('location_visited');
    expect(types).toContain('npc_talked');
    expect(types).toContain('photo_taken');
  });
});

// ── Field matching tests ─────────────────────────────────────────────────────

describe('matchesField', () => {
  it('exact match works', () => {
    const rule: FieldMatchRule = { eventField: 'npcId', objectiveField: 'npcId', comparison: 'exact' };
    expect(matchesField(rule, 'npc-1', 'npc-1')).toBe(true);
    expect(matchesField(rule, 'npc-1', 'npc-2')).toBe(false);
  });

  it('contains match works', () => {
    const rule: FieldMatchRule = { eventField: 'name', objectiveField: 'name', comparison: 'contains' };
    expect(matchesField(rule, 'Healing Herbs', 'herbs')).toBe(false); // case sensitive
    expect(matchesField(rule, 'herbs collection', 'herbs')).toBe(true);
  });

  it('contains_lower match is case-insensitive', () => {
    const rule: FieldMatchRule = { eventField: 'name', objectiveField: 'name', comparison: 'contains_lower' };
    expect(matchesField(rule, 'Healing Herbs', 'herbs')).toBe(true);
    expect(matchesField(rule, 'fish', 'Golden Fish')).toBe(true);
    expect(matchesField(rule, 'sword', 'herbs')).toBe(false);
  });

  it('optional field passes when objective value is absent', () => {
    const rule: FieldMatchRule = { eventField: 'npcId', objectiveField: 'npcId', comparison: 'exact', optional: true };
    expect(matchesField(rule, 'npc-1', undefined)).toBe(true);
    expect(matchesField(rule, 'npc-1', '')).toBe(true);
    expect(matchesField(rule, 'npc-1', null)).toBe(true);
  });

  it('non-optional field fails when objective value is absent', () => {
    const rule: FieldMatchRule = { eventField: 'npcId', objectiveField: 'npcId', comparison: 'exact' };
    expect(matchesField(rule, 'npc-1', undefined)).toBe(false);
  });

  it('fails when event value is absent but objective specifies a value', () => {
    const rule: FieldMatchRule = { eventField: 'npcId', objectiveField: 'npcId', comparison: 'exact', optional: true };
    expect(matchesField(rule, undefined, 'npc-1')).toBe(false);
  });
});

describe('matchesAllFields', () => {
  it('passes when all fields match', () => {
    const mapping = getMappingForObjective('talk_to_npc')!;
    expect(matchesAllFields(
      mapping,
      { type: 'npc_talked', npcId: 'npc-1' },
      { npcId: 'npc-1' },
    )).toBe(true);
  });

  it('fails when a required field does not match', () => {
    const mapping = getMappingForObjective('talk_to_npc')!;
    expect(matchesAllFields(
      mapping,
      { type: 'npc_talked', npcId: 'npc-1' },
      { npcId: 'npc-2' },
    )).toBe(false);
  });

  it('passes when optional field is absent on objective', () => {
    const mapping = getMappingForObjective('talk_to_npc')!;
    expect(matchesAllFields(
      mapping,
      { type: 'npc_talked', npcId: 'npc-1' },
      {}, // no npcId on objective — should still match since optional
    )).toBe(true);
  });
});

// ── handleGameEvent integration tests ────────────────────────────────────────

describe('QuestCompletionEngine.handleGameEvent', () => {
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

  // ── Simple objective completion ──────────────────────────────────────

  it('completes talk_to_npc objective on npc_talked event', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Jean', turnCount: 3 });

    expect(obj.completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('does not complete talk_to_npc when npcId does not match', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'npc_talked', npcId: 'npc-2', npcName: 'Pierre', turnCount: 1 });

    expect(obj.completed).toBe(false);
  });

  it('completes talk_to_npc when objective has no npcId (any NPC)', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'npc_talked', npcId: 'npc-99', npcName: 'Anyone', turnCount: 1 });

    expect(obj.completed).toBe(true);
  });

  it('completes visit_location on location_visited event', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'visit_location', locationName: 'Market' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'location_visited', locationId: 'loc-1', locationName: 'Central Market' });

    expect(obj.completed).toBe(true);
  });

  it('completes discover_location on location_discovered event', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'discover_location', locationName: 'cave' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'location_discovered', locationId: 'loc-2', locationName: 'Hidden Cave' });

    expect(obj.completed).toBe(true);
  });

  it('completes complete_reading on reading_completed event', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'complete_reading', textId: 'text-1' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'reading_completed', textId: 'text-1', title: 'Le Petit Prince' });

    expect(obj.completed).toBe(true);
  });

  it('completes answer_questions on questions_answered event', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'answer_questions', textId: 'text-1' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'questions_answered', textId: 'text-1', score: 80, questionsCorrect: 4, questionsTotal: 5 });

    expect(obj.completed).toBe(true);
  });

  // ── Quantity objectives ──────────────────────────────────────────────

  it('increments collect_item progress on each item_collected event', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'fish', itemCount: 3 });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'item_collected', itemId: 'i1', itemName: 'Fish', quantity: 1 });
    expect(obj.collectedCount).toBe(1);
    expect(obj.completed).toBe(false);

    engine.handleGameEvent({ type: 'item_collected', itemId: 'i2', itemName: 'Golden Fish', quantity: 1 });
    expect(obj.collectedCount).toBe(2);
    expect(obj.completed).toBe(false);

    engine.handleGameEvent({ type: 'item_collected', itemId: 'i3', itemName: 'Big Fish', quantity: 1 });
    expect(obj.collectedCount).toBe(3);
    expect(obj.completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('completes collect_item with default count of 1', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'sword' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'item_collected', itemId: 'i1', itemName: 'Iron Sword', quantity: 1 });

    expect(obj.collectedCount).toBe(1);
    expect(obj.completed).toBe(true);
  });

  it('does not match collect_item when itemName does not match', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'sword' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'item_collected', itemId: 'i1', itemName: 'Healing Herbs', quantity: 1 });

    expect(obj.collectedCount).toBeUndefined();
    expect(obj.completed).toBe(false);
  });

  it('increments craft_item progress', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'craft_item', itemName: 'potion', requiredCount: 2 });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'item_crafted', itemId: 'c1', itemName: 'Health Potion', quantity: 1 });
    expect(obj.craftedCount).toBe(1);
    expect(obj.completed).toBe(false);

    engine.handleGameEvent({ type: 'item_crafted', itemId: 'c2', itemName: 'Mana Potion', quantity: 1 });
    expect(obj.craftedCount).toBe(2);
    expect(obj.completed).toBe(true);
  });

  it('increments physical_action progress', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'physical_action', actionType: 'mine', actionsRequired: 3 });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'physical_action_completed', actionType: 'mine', locationId: 'loc-1', itemsProduced: [], energyCost: 10, xpGained: 5 });
    expect(obj.actionsCompleted).toBe(1);

    engine.handleGameEvent({ type: 'physical_action_completed', actionType: 'mine', locationId: 'loc-1', itemsProduced: [], energyCost: 10, xpGained: 5 });
    expect(obj.actionsCompleted).toBe(2);
    expect(obj.completed).toBe(false);

    engine.handleGameEvent({ type: 'physical_action_completed', actionType: 'mine', locationId: 'loc-1', itemsProduced: [], energyCost: 10, xpGained: 5 });
    expect(obj.actionsCompleted).toBe(3);
    expect(obj.completed).toBe(true);
  });

  it('does not match physical_action when actionType differs', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'physical_action', actionType: 'mine' });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'physical_action_completed', actionType: 'fish', locationId: 'loc-1', itemsProduced: [], energyCost: 5, xpGained: 3 });

    expect(obj.actionsCompleted).toBeUndefined();
  });

  // ── Compound objectives ──────────────────────────────────────────────

  it('completes photograph_activity when subject and activity both match', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'photograph_activity',
      targetSubject: 'Jean', targetActivity: 'cooking',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    // Photo with matching subject but wrong activity — should not complete
    engine.handleGameEvent({ type: 'photo_taken', subjectId: 'npc-1', subjectName: 'Jean', subjectCategory: 'npc', subjectActivity: 'reading' });
    expect(obj.completed).toBe(false);

    // Photo with matching subject and activity — should complete
    engine.handleGameEvent({ type: 'photo_taken', subjectId: 'npc-1', subjectName: 'Jean', subjectCategory: 'npc', subjectActivity: 'cooking dinner' });
    expect(obj.completed).toBe(true);
  });

  it('photograph_activity with no targetActivity matches any activity', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'photograph_activity',
      targetSubject: 'Jean',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'photo_taken', subjectId: 'npc-1', subjectName: 'Jean Baptiste', subjectCategory: 'npc' });
    expect(obj.completed).toBe(true);
  });

  it('photograph_activity does not match when subject does not match', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'photograph_activity',
      targetSubject: 'Jean', targetActivity: 'cooking',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'photo_taken', subjectId: 'npc-2', subjectName: 'Pierre', subjectCategory: 'npc', subjectActivity: 'cooking' });
    expect(obj.completed).toBe(false);
  });

  it('photograph_subject completes with matching category', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'photograph_subject',
      targetCategory: 'building', requiredCount: 2,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'photo_taken', subjectId: 'b1', subjectName: 'Church', subjectCategory: 'building' });
    expect(obj.currentCount).toBe(1);
    expect(obj.completed).toBe(false);

    engine.handleGameEvent({ type: 'photo_taken', subjectId: 'b2', subjectName: 'School', subjectCategory: 'building' });
    expect(obj.currentCount).toBe(2);
    expect(obj.completed).toBe(true);
  });

  // ── Edge cases ───────────────────────────────────────────────────────

  it('returns 0 for unknown event types', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' });
    engine.addQuest(makeQuest('q1', [obj]));

    expect(engine.handleGameEvent({ type: 'unknown_event' })).toBe(0);
    expect(obj.completed).toBe(false);
  });

  it('returns 0 for events with no type', () => {
    expect(engine.handleGameEvent({})).toBe(0);
  });

  it('does not affect already-completed objectives', () => {
    const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1', completed: true });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.handleGameEvent({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Jean', turnCount: 1 });

    expect(objectiveCompletedSpy).not.toHaveBeenCalled();
  });

  it('respects objective dependency locks', () => {
    const obj1 = makeObjective({ id: 'o1', questId: 'q1', type: 'visit_location', locationName: 'market', order: 1 });
    const obj2 = makeObjective({ id: 'o2', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1', order: 2 });
    engine.addQuest(makeQuest('q1', [obj1, obj2]));

    // o2 is locked because o1 (order 1) is incomplete
    engine.handleGameEvent({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Jean', turnCount: 1 });
    expect(obj2.completed).toBe(false);

    // Complete o1 first
    engine.handleGameEvent({ type: 'location_visited', locationId: 'loc-1', locationName: 'Central Market' });
    expect(obj1.completed).toBe(true);

    // Now o2 can be completed
    engine.handleGameEvent({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Jean', turnCount: 1 });
    expect(obj2.completed).toBe(true);
  });

  it('fires quest completed when all objectives are done via handleGameEvent', () => {
    const obj1 = makeObjective({ id: 'o1', questId: 'q1', type: 'visit_location', locationName: 'market' });
    const obj2 = makeObjective({ id: 'o2', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
    engine.addQuest(makeQuest('q1', [obj1, obj2]));

    engine.handleGameEvent({ type: 'location_visited', locationId: 'loc-1', locationName: 'Market' });
    expect(questCompletedSpy).not.toHaveBeenCalled();

    engine.handleGameEvent({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Jean', turnCount: 1 });
    expect(questCompletedSpy).toHaveBeenCalledWith('q1');
  });

  it('handles multiple quests with same objective type simultaneously', () => {
    const obj1 = makeObjective({ id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'fish', itemCount: 1 });
    const obj2 = makeObjective({ id: 'o2', questId: 'q2', type: 'collect_item', itemName: 'fish', itemCount: 1 });
    engine.addQuest(makeQuest('q1', [obj1]));
    engine.addQuest(makeQuest('q2', [obj2]));

    engine.handleGameEvent({ type: 'item_collected', itemId: 'i1', itemName: 'Fresh Fish', quantity: 1 });

    expect(obj1.completed).toBe(true);
    expect(obj2.completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledTimes(2);
  });

  // ── Static accessor ──────────────────────────────────────────────────

  it('static getMappingsForEvent returns correct mappings', () => {
    const mappings = QuestCompletionEngine.getMappingsForEvent('item_collected');
    expect(mappings).toHaveLength(1);
    expect(mappings[0].objectiveType).toBe('collect_item');
  });
});
