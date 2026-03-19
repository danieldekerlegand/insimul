import { describe, it, expect } from 'vitest';
import {
  validateCompletability,
  OBJECTIVE_COMPLETION_EVENT_MAP,
} from '../quest-completability-validator';
import { ACHIEVABLE_OBJECTIVE_TYPES, VALID_OBJECTIVE_TYPES } from '../quest-objective-types';
import { ACTION_MAPPED_OBJECTIVE_TYPES, findMatchingActions } from '../quest-feasibility-validator';
import { QuestCompletionEngine, type CompletionEvent } from '../../client/src/components/3DGame/QuestCompletionEngine';

// ── Cross-validation: all canonical types are covered ────────────────────────

describe('Quest Completability Validator', () => {
  it('every canonical objective type has an action mapping', () => {
    const actionMapSet = new Set(ACTION_MAPPED_OBJECTIVE_TYPES);
    const missing = ACHIEVABLE_OBJECTIVE_TYPES
      .map(t => t.type)
      .filter(t => !actionMapSet.has(t));

    expect(missing).toEqual([]);
  });

  it('every canonical objective type has a completion event mapping', () => {
    const missing = ACHIEVABLE_OBJECTIVE_TYPES
      .map(t => t.type)
      .filter(t => !OBJECTIVE_COMPLETION_EVENT_MAP[t]);

    expect(missing).toEqual([]);
  });

  it('no stale entries in completion event map', () => {
    const stale = Object.keys(OBJECTIVE_COMPLETION_EVENT_MAP)
      .filter(t => !VALID_OBJECTIVE_TYPES.has(t));

    expect(stale).toEqual([]);
  });

  it('no stale entries in action map', () => {
    const stale = ACTION_MAPPED_OBJECTIVE_TYPES
      .filter(t => !VALID_OBJECTIVE_TYPES.has(t));

    expect(stale).toEqual([]);
  });

  it('validateCompletability returns valid when all types are covered', () => {
    const report = validateCompletability(ACTION_MAPPED_OBJECTIVE_TYPES);
    expect(report.valid).toBe(true);
    expect(report.issues.filter(i => i.severity === 'error')).toEqual([]);
    expect(report.coveredTypes.length).toBe(ACHIEVABLE_OBJECTIVE_TYPES.length);
  });

  it('validateCompletability detects missing action mappings', () => {
    const partialMap = ACTION_MAPPED_OBJECTIVE_TYPES.filter(t => t !== 'visit_location');
    const report = validateCompletability(partialMap);
    expect(report.valid).toBe(false);
    expect(report.issues.some(i =>
      i.objectiveType === 'visit_location' && i.severity === 'error' &&
      i.message.includes('action mapping'),
    )).toBe(true);
  });
});

// ── QuestCompletionEngine: new handler coverage ──────────────────────────────

describe('QuestCompletionEngine — new objective handlers', () => {
  function makeEngine(objectives: any[]) {
    const engine = new QuestCompletionEngine();
    engine.addQuest({
      id: 'q1',
      objectives: objectives.map((o, i) => ({
        id: `obj-${i}`,
        questId: 'q1',
        completed: false,
        ...o,
      })),
    });
    return engine;
  }

  it('tracks identify_object via object_identified event', () => {
    const engine = makeEngine([
      { type: 'identify_object', description: 'Identify 2 objects', requiredCount: 2, currentCount: 0 },
    ]);

    engine.trackEvent({ type: 'object_identified', objectName: 'mesa', questId: 'q1' });
    const obj = engine.getQuests()[0].objectives![0];
    expect(obj.currentCount).toBe(1);
    expect(obj.completed).toBe(false);

    engine.trackEvent({ type: 'object_identified', objectName: 'silla', questId: 'q1' });
    expect(obj.completed).toBe(true);
  });

  it('tracks examine_object via object_examined event', () => {
    const engine = makeEngine([
      { type: 'examine_object', description: 'Examine an object', requiredCount: 1 },
    ]);

    engine.trackEvent({ type: 'object_examined', objectName: 'libro', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('tracks read_sign via sign_read event', () => {
    const engine = makeEngine([
      { type: 'read_sign', description: 'Read 2 signs', requiredCount: 2, currentCount: 0 },
    ]);

    engine.trackEvent({ type: 'sign_read', signId: 'sign-1', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);

    engine.trackEvent({ type: 'sign_read', signId: 'sign-2', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('tracks point_and_name via object_pointed_and_named event', () => {
    const engine = makeEngine([
      { type: 'point_and_name', description: 'Name 1 object', requiredCount: 1 },
    ]);

    engine.trackEvent({ type: 'object_pointed_and_named', objectName: 'puerta', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('tracks ask_for_directions via npc_conversation_turn event', () => {
    const engine = makeEngine([
      { type: 'ask_for_directions', description: 'Ask for directions', npcId: 'npc-1', requiredCount: 1 },
    ]);

    engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'npc-1', topicTag: 'directions', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('tracks order_food via npc_conversation_turn event', () => {
    const engine = makeEngine([
      { type: 'order_food', description: 'Order food', npcId: 'vendor-1', requiredCount: 1 },
    ]);

    engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'vendor-1', topicTag: 'order', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('tracks haggle_price via npc_conversation_turn event', () => {
    const engine = makeEngine([
      { type: 'haggle_price', description: 'Haggle', npcId: 'merchant-1', requiredCount: 1 },
    ]);

    engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'merchant-1', topicTag: 'haggle', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('tracks introduce_self via npc_conversation_turn event', () => {
    const engine = makeEngine([
      { type: 'introduce_self', description: 'Introduce yourself', requiredCount: 1 },
    ]);

    engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'any-npc', topicTag: 'introduction', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('tracks build_friendship via npc_conversation_turn event with multiple turns', () => {
    const engine = makeEngine([
      { type: 'build_friendship', description: 'Build friendship', npcId: 'friend-1', requiredCount: 3, currentCount: 0 },
    ]);

    for (let i = 0; i < 3; i++) {
      engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'friend-1', topicTag: 'friendship', questId: 'q1' });
    }
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('build_friendship ignores wrong NPC', () => {
    const engine = makeEngine([
      { type: 'build_friendship', description: 'Build friendship', npcId: 'friend-1', requiredCount: 1 },
    ]);

    engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'wrong-npc', topicTag: 'friendship', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);
  });

  it('tracks give_gift via gift_given event', () => {
    const engine = makeEngine([
      { type: 'give_gift', description: 'Give a gift', npcId: 'npc-1' },
    ]);

    engine.trackEvent({ type: 'gift_given', npcId: 'npc-1', itemName: 'flowers', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('give_gift ignores wrong NPC', () => {
    const engine = makeEngine([
      { type: 'give_gift', description: 'Give a gift', npcId: 'npc-1' },
    ]);

    engine.trackEvent({ type: 'gift_given', npcId: 'wrong-npc', itemName: 'flowers', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);
  });

  it('tracks follow_directions via direction_step_completed event', () => {
    const engine = makeEngine([
      { type: 'follow_directions', description: 'Follow 3 steps', stepsRequired: 3, stepsCompleted: 0 },
    ]);

    engine.trackEvent({ type: 'direction_step_completed', questId: 'q1' });
    engine.trackEvent({ type: 'direction_step_completed', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);

    engine.trackEvent({ type: 'direction_step_completed', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('npc_conversation_turn without topicTag matches all conversation-based types', () => {
    const engine = makeEngine([
      { type: 'order_food', description: 'Order food', requiredCount: 1 },
    ]);

    // Without topicTag, should still match order_food
    engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'npc-1', questId: 'q1' });
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });
});

// ── Feasibility validator: new action mappings work ──────────────────────────

describe('Feasibility validator — new action mappings', () => {
  const LANGUAGE_ACTION = {
    name: 'Language Practice',
    actionType: 'language',
    category: 'language',
    isActive: true,
    tags: ['language'],
  };

  const SOCIAL_ACTION = {
    name: 'Talk',
    actionType: 'social',
    category: 'conversation',
    isActive: true,
    tags: ['conversation'],
  };

  const newTypes = [
    'conversation_initiation',
    'examine_object',
    'read_sign',
    'write_response',
    'listen_and_repeat',
    'point_and_name',
    'ask_for_directions',
    'order_food',
    'haggle_price',
    'introduce_self',
    'describe_scene',
    'teach_vocabulary',
    'teach_phrase',
    'build_friendship',
    'give_gift',
  ];

  for (const type of newTypes) {
    it(`findMatchingActions returns results for "${type}"`, () => {
      const matches = findMatchingActions(type, [LANGUAGE_ACTION, SOCIAL_ACTION]);
      expect(matches.length).toBeGreaterThan(0);
    });
  }
});
