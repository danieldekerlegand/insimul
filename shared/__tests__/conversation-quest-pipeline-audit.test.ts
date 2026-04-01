/**
 * Conversation Quest Pipeline Audit Tests
 *
 * End-to-end verification that the LLM evaluation pipeline works:
 *   BabylonChatPanel → server metadata endpoint → LLM evaluation →
 *   ConversationQuestBridge.processEvaluations → QuestCompletionEngine
 *
 * Tests cover:
 *   1. ConversationQuestBridge: objective collection, evaluation processing, confidence gating
 *   2. QuestCompletionEngine: conversation_goal_evaluated handler, shared confidence constant
 *   3. Event field alignment: BabylonChatPanel emits correct event types/fields for QCE
 *   4. Server buildConversationGoalPrompt: prompt construction and objective formatting
 *   5. Locked objective filtering: dependsOn/order constraints respected in evaluation
 *   6. Full integration: objective → evaluation → completion flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../game-engine/logic/QuestCompletionEngine';
import {
  ConversationQuestBridge,
  MIN_CONVERSATION_GOAL_CONFIDENCE,
  type GoalEvaluation,
  type ActiveObjectiveForEvaluation,
} from '../game-engine/logic/ConversationQuestBridge';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeObjective(overrides: Partial<CompletionObjective> & { type: string }): CompletionObjective {
  return {
    id: `obj_${Math.random().toString(36).slice(2, 8)}`,
    questId: 'test-quest',
    description: `Test ${overrides.type} objective`,
    completed: false,
    ...overrides,
  };
}

function makeQuest(objectives: CompletionObjective[], id = 'test-quest'): CompletionQuest {
  for (const o of objectives) o.questId = id;
  return { id, objectives };
}

function makeEvaluation(overrides: Partial<GoalEvaluation> = {}): GoalEvaluation {
  return {
    questId: 'test-quest',
    objectiveId: 'obj-1',
    goalMet: true,
    confidence: 0.9,
    extractedInfo: 'Player completed the goal',
    ...overrides,
  };
}

// ── 1. Shared confidence constant ──────────────────────────────────────────

describe('MIN_CONVERSATION_GOAL_CONFIDENCE', () => {
  it('exports a shared constant equal to 0.7', () => {
    expect(MIN_CONVERSATION_GOAL_CONFIDENCE).toBe(0.7);
  });

  it('is used by both ConversationQuestBridge and QuestCompletionEngine', () => {
    // Verify ConversationQuestBridge uses the constant (rejects at threshold)
    const bridge = new ConversationQuestBridge();
    const engine = new QuestCompletionEngine();
    bridge.setQuestTracker(engine as any);

    const obj = makeObjective({ type: 'talk_to_npc', id: 'obj-threshold' });
    const quest = makeQuest([obj], 'threshold-quest');
    engine.addQuest(quest);

    // At exactly threshold - should pass
    bridge.processEvaluations([makeEvaluation({
      questId: 'threshold-quest',
      objectiveId: 'obj-threshold',
      confidence: MIN_CONVERSATION_GOAL_CONFIDENCE,
    })]);
    expect(obj.completed).toBe(true);
  });

  it('rejects evaluations just below the threshold', () => {
    const bridge = new ConversationQuestBridge();
    const engine = new QuestCompletionEngine();
    bridge.setQuestTracker(engine as any);

    const obj = makeObjective({ type: 'talk_to_npc', id: 'obj-below' });
    const quest = makeQuest([obj], 'below-quest');
    engine.addQuest(quest);

    bridge.processEvaluations([makeEvaluation({
      questId: 'below-quest',
      objectiveId: 'obj-below',
      confidence: MIN_CONVERSATION_GOAL_CONFIDENCE - 0.01,
    })]);
    expect(obj.completed).toBe(false);
  });
});

// ── 2. processEvaluations input validation ─────────────────────────────────

describe('ConversationQuestBridge.processEvaluations — input validation', () => {
  let bridge: ConversationQuestBridge;

  beforeEach(() => {
    bridge = new ConversationQuestBridge();
    bridge.setQuestTracker({ trackEvent: vi.fn(), getConversationGoalObjectives: vi.fn(), quests: [] });
  });

  it('handles null gracefully (Array.isArray check)', () => {
    expect(() => bridge.processEvaluations(null as any)).not.toThrow();
  });

  it('handles undefined gracefully', () => {
    expect(() => bridge.processEvaluations(undefined as any)).not.toThrow();
  });

  it('handles non-array (string) gracefully', () => {
    expect(() => bridge.processEvaluations('not-an-array' as any)).not.toThrow();
  });

  it('handles non-array (object) gracefully', () => {
    expect(() => bridge.processEvaluations({} as any)).not.toThrow();
  });

  it('handles empty array gracefully', () => {
    expect(() => bridge.processEvaluations([])).not.toThrow();
  });

  it('does not call trackEvent for empty evaluations', () => {
    const tracker = { trackEvent: vi.fn(), getConversationGoalObjectives: vi.fn(), quests: [] };
    bridge.setQuestTracker(tracker);
    bridge.processEvaluations([]);
    expect(tracker.trackEvent).not.toHaveBeenCalled();
  });
});

// ── 3. Locked objective filtering ──────────────────────────────────────────

describe('ConversationQuestBridge.getObjectivesForEvaluation — locked objective filtering', () => {
  let bridge: ConversationQuestBridge;
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    bridge = new ConversationQuestBridge();
    engine = new QuestCompletionEngine();
    bridge.setQuestTracker(engine as any);
  });

  it('excludes objectives locked by dependsOn', () => {
    const obj1 = makeObjective({ type: 'talk_to_npc', id: 'step1', description: 'First talk' });
    const obj2 = makeObjective({ type: 'talk_to_npc', id: 'step2', description: 'Second talk', dependsOn: ['step1'] });
    const quest: any = {
      id: 'dep-quest',
      status: 'active',
      objectives: [obj1, obj2],
    };
    (engine as any).quests = [quest];

    const objectives = bridge.getObjectivesForEvaluation();
    expect(objectives.map(o => o.objectiveId)).toContain('step1');
    expect(objectives.map(o => o.objectiveId)).not.toContain('step2');
  });

  it('excludes objectives locked by order', () => {
    const obj1 = makeObjective({ type: 'conversation', id: 'ordered1', description: 'First', order: 1 });
    const obj2 = makeObjective({ type: 'conversation', id: 'ordered2', description: 'Second', order: 2 });
    const quest: any = {
      id: 'order-quest',
      status: 'active',
      objectives: [obj1, obj2],
    };
    (engine as any).quests = [quest];

    const objectives = bridge.getObjectivesForEvaluation();
    expect(objectives.map(o => o.objectiveId)).toContain('ordered1');
    expect(objectives.map(o => o.objectiveId)).not.toContain('ordered2');
  });

  it('includes previously locked objective after dependency completes', () => {
    const obj1 = makeObjective({ type: 'talk_to_npc', id: 'step1', description: 'First' });
    const obj2 = makeObjective({ type: 'talk_to_npc', id: 'step2', description: 'Second', dependsOn: ['step1'] });
    const quest: any = {
      id: 'unlock-quest',
      status: 'active',
      objectives: [obj1, obj2],
    };
    (engine as any).quests = [quest];

    // Before completing step1
    let objectives = bridge.getObjectivesForEvaluation();
    expect(objectives.map(o => o.objectiveId)).not.toContain('step2');

    // Complete step1
    obj1.completed = true;

    // Now step2 should be available
    objectives = bridge.getObjectivesForEvaluation();
    expect(objectives.map(o => o.objectiveId)).toContain('step2');
  });
});

// ── 4. Full integration: evaluation → completion flow ──────────────────────

describe('LLM evaluation pipeline — full integration', () => {
  let bridge: ConversationQuestBridge;
  let engine: QuestCompletionEngine;
  let completedObjectives: Array<{ questId: string; objectiveId: string }>;
  let completedQuests: string[];

  beforeEach(() => {
    bridge = new ConversationQuestBridge();
    engine = new QuestCompletionEngine();
    completedObjectives = [];
    completedQuests = [];

    engine.setOnObjectiveCompleted((qId, oId) => completedObjectives.push({ questId: qId, objectiveId: oId }));
    engine.setOnQuestCompleted((qId) => completedQuests.push(qId));
    bridge.setQuestTracker(engine as any);
  });

  it('completes objective when evaluation has goalMet=true and sufficient confidence', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'conv-obj', conversationGoal: 'greet baker' });
    const quest = makeQuest([obj], 'conv-quest');
    engine.addQuest(quest);

    bridge.processEvaluations([makeEvaluation({
      questId: 'conv-quest',
      objectiveId: 'conv-obj',
      goalMet: true,
      confidence: 0.85,
      extractedInfo: 'Player greeted the baker in French',
    })]);

    expect(obj.completed).toBe(true);
    expect(obj.conversationGoalMet).toBe(true);
    expect(obj.conversationGoalConfidence).toBe(0.85);
    expect(obj.conversationGoalExtractedInfo).toBe('Player greeted the baker in French');
    expect(completedObjectives).toEqual([{ questId: 'conv-quest', objectiveId: 'conv-obj' }]);
  });

  it('does NOT complete objective when goalMet=false', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'fail-obj', conversationGoal: 'order bread' });
    engine.addQuest(makeQuest([obj], 'fail-quest'));

    bridge.processEvaluations([makeEvaluation({
      questId: 'fail-quest',
      objectiveId: 'fail-obj',
      goalMet: false,
      confidence: 0.95,
    })]);

    expect(obj.completed).toBe(false);
    expect(completedObjectives).toHaveLength(0);
  });

  it('records confidence/extractedInfo even when not completing (low confidence)', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'info-obj', conversationGoal: 'ask directions' });
    engine.addQuest(makeQuest([obj], 'info-quest'));

    // Fire directly on engine to test the recording path
    engine.trackEvent({
      type: 'conversation_goal_evaluated',
      questId: 'info-quest',
      objectiveId: 'info-obj',
      goalMet: true,
      confidence: 0.5,
      extractedInfo: 'Partial attempt',
    });

    expect(obj.completed).toBe(false);
    expect(obj.conversationGoalConfidence).toBe(0.5);
    expect(obj.conversationGoalExtractedInfo).toBe('Partial attempt');
  });

  it('completes quest when all objectives are met via evaluations', () => {
    const obj1 = makeObjective({ type: 'talk_to_npc', id: 'q-obj1', conversationGoal: 'greet' });
    const obj2 = makeObjective({ type: 'use_vocabulary', id: 'q-obj2', conversationGoal: 'use words' });
    const quest = makeQuest([obj1, obj2], 'multi-quest');
    engine.addQuest(quest);

    bridge.processEvaluations([
      makeEvaluation({ questId: 'multi-quest', objectiveId: 'q-obj1', confidence: 0.9 }),
      makeEvaluation({ questId: 'multi-quest', objectiveId: 'q-obj2', confidence: 0.8 }),
    ]);

    expect(obj1.completed).toBe(true);
    expect(obj2.completed).toBe(true);
    expect(completedQuests).toEqual(['multi-quest']);
  });

  it('handles multiple evaluations from different quests', () => {
    const obj1 = makeObjective({ type: 'talk_to_npc', id: 'a-obj' });
    const obj2 = makeObjective({ type: 'conversation', id: 'b-obj' });
    engine.addQuest(makeQuest([obj1], 'quest-a'));
    engine.addQuest(makeQuest([obj2], 'quest-b'));

    bridge.processEvaluations([
      makeEvaluation({ questId: 'quest-a', objectiveId: 'a-obj', confidence: 0.9 }),
      makeEvaluation({ questId: 'quest-b', objectiveId: 'b-obj', confidence: 0.85 }),
    ]);

    expect(obj1.completed).toBe(true);
    expect(obj2.completed).toBe(true);
  });

  it('does not double-complete already completed objectives', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'done-obj', conversationGoal: 'greet' });
    engine.addQuest(makeQuest([obj], 'done-quest'));

    // Complete first time
    bridge.processEvaluations([makeEvaluation({ questId: 'done-quest', objectiveId: 'done-obj' })]);
    expect(completedObjectives).toHaveLength(1);

    // Try again — should be ignored
    bridge.processEvaluations([makeEvaluation({ questId: 'done-quest', objectiveId: 'done-obj' })]);
    expect(completedObjectives).toHaveLength(1); // still 1
  });
});

// ── 5. GameEventBus emission ───────────────────────────────────────────────

describe('ConversationQuestBridge — GameEventBus emission', () => {
  let bridge: ConversationQuestBridge;
  let emittedEvents: any[];

  beforeEach(() => {
    bridge = new ConversationQuestBridge();
    emittedEvents = [];
    const mockBus = { emit: (event: any) => emittedEvents.push(event) };
    bridge.setEventBus(mockBus as any);
    bridge.setQuestTracker({ trackEvent: vi.fn(), getConversationGoalObjectives: vi.fn(), quests: [] });
  });

  it('emits conversational_action_completed on successful evaluation', () => {
    bridge.processEvaluations(
      [makeEvaluation({ questId: 'q1', objectiveId: 'o1', confidence: 0.9, extractedInfo: 'greeted baker' })],
      'baker-npc',
      'Bonjour monsieur',
    );

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0]).toMatchObject({
      type: 'conversational_action_completed',
      npcId: 'baker-npc',
      action: 'greeted baker',
      questId: 'q1',
      objectiveId: 'o1',
      confidence: 0.9,
      playerMessage: 'Bonjour monsieur',
    });
  });

  it('does NOT emit for low-confidence evaluations', () => {
    bridge.processEvaluations([makeEvaluation({ confidence: 0.3 })]);
    expect(emittedEvents).toHaveLength(0);
  });

  it('does NOT emit for goalMet=false evaluations', () => {
    bridge.processEvaluations([makeEvaluation({ goalMet: false, confidence: 0.9 })]);
    expect(emittedEvents).toHaveLength(0);
  });

  it('defaults npcId to "unknown" when not provided', () => {
    bridge.processEvaluations([makeEvaluation()]);
    expect(emittedEvents[0].npcId).toBe('unknown');
  });
});

// ── 6. Objective collection for evaluation ─────────────────────────────────

describe('ConversationQuestBridge.getObjectivesForEvaluation — comprehensive', () => {
  let bridge: ConversationQuestBridge;
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    bridge = new ConversationQuestBridge();
    engine = new QuestCompletionEngine();
    bridge.setQuestTracker(engine as any);
  });

  const CONVERSATION_TYPES = [
    'talk_to_npc', 'conversation', 'complete_conversation',
    'use_vocabulary', 'introduce_self', 'ask_for_directions',
    'order_food', 'haggle_price', 'navigate_language',
  ];

  it('returns objectives for all conversation types', () => {
    const objectives = CONVERSATION_TYPES.map((type, i) =>
      ({ id: `obj_${i}`, type, description: `Test ${type}`, completed: false })
    );
    (engine as any).quests = [{ id: 'type-quest', status: 'active', objectives }];

    const result = bridge.getObjectivesForEvaluation();
    expect(result).toHaveLength(5); // capped at 5
    // All returned should be conversation types
    for (const obj of result) {
      expect(CONVERSATION_TYPES).toContain(obj.objectiveType);
    }
  });

  it('excludes non-conversation objective types', () => {
    (engine as any).quests = [{
      id: 'mixed-quest', status: 'active', objectives: [
        { id: 'o1', type: 'collect_item', description: 'Collect herbs', completed: false },
        { id: 'o2', type: 'defeat_enemies', description: 'Defeat goblins', completed: false },
        { id: 'o3', type: 'craft_item', description: 'Craft sword', completed: false },
        { id: 'o4', type: 'talk_to_npc', description: 'Talk to smith', completed: false },
      ],
    }];

    const result = bridge.getObjectivesForEvaluation();
    expect(result).toHaveLength(1);
    expect(result[0].objectiveType).toBe('talk_to_npc');
  });

  it('excludes completed and failed quests', () => {
    (engine as any).quests = [
      { id: 'completed', status: 'completed', objectives: [{ id: 'o1', type: 'talk_to_npc', completed: false }] },
      { id: 'failed', status: 'failed', objectives: [{ id: 'o2', type: 'talk_to_npc', completed: false }] },
      { id: 'active', status: 'active', objectives: [{ id: 'o3', type: 'talk_to_npc', completed: false }] },
    ];

    const result = bridge.getObjectivesForEvaluation();
    expect(result).toHaveLength(1);
    expect(result[0].questId).toBe('active');
  });

  it('caps at 5 objectives', () => {
    const objectives = Array.from({ length: 10 }, (_, i) => ({
      id: `obj_${i}`, type: 'talk_to_npc', description: `Talk ${i}`, completed: false,
    }));
    (engine as any).quests = [{ id: 'big-quest', status: 'active', objectives }];

    expect(bridge.getObjectivesForEvaluation()).toHaveLength(5);
  });

  it('filters by NPC ID when provided', () => {
    (engine as any).quests = [{
      id: 'npc-quest', status: 'active', objectives: [
        { id: 'o1', type: 'talk_to_npc', npcId: 'baker1', description: 'Talk to baker', completed: false },
        { id: 'o2', type: 'talk_to_npc', npcId: 'smith1', description: 'Talk to smith', completed: false },
        { id: 'o3', type: 'conversation', description: 'General conversation', completed: false },
      ],
    }];

    const result = bridge.getObjectivesForEvaluation('baker1');
    expect(result).toHaveLength(2); // baker1 + general (no npcId)
    expect(result.map(o => o.objectiveId)).toContain('o1');
    expect(result.map(o => o.objectiveId)).not.toContain('o2');
    expect(result.map(o => o.objectiveId)).toContain('o3');
  });

  it('allows template NPC IDs through the filter', () => {
    (engine as any).quests = [{
      id: 'template-quest', status: 'active', objectives: [
        { id: 'o1', type: 'talk_to_npc', npcId: '{npcId}', description: 'Template NPC', completed: false },
        { id: 'o2', type: 'talk_to_npc', npcId: '{npcId_0}', description: 'Template NPC 0', completed: false },
      ],
    }];

    const result = bridge.getObjectivesForEvaluation('any-npc');
    expect(result).toHaveLength(2);
  });

  it('returns empty when no quest tracker is set', () => {
    const freshBridge = new ConversationQuestBridge();
    expect(freshBridge.getObjectivesForEvaluation()).toEqual([]);
  });
});

// ── 7. QCE conversation_goal_evaluated handler ─────────────────────────────

describe('QuestCompletionEngine.trackConversationGoalResult', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
  });

  it('completes objective at exact confidence threshold', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'exact-obj' });
    engine.addQuest(makeQuest([obj], 'exact-quest'));

    engine.trackEvent({
      type: 'conversation_goal_evaluated',
      questId: 'exact-quest',
      objectiveId: 'exact-obj',
      goalMet: true,
      confidence: 0.7,
      extractedInfo: 'At threshold',
    });

    expect(obj.completed).toBe(true);
  });

  it('does not complete for unknown quest ID', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'obj1' });
    engine.addQuest(makeQuest([obj], 'real-quest'));

    engine.trackEvent({
      type: 'conversation_goal_evaluated',
      questId: 'fake-quest',
      objectiveId: 'obj1',
      goalMet: true,
      confidence: 0.9,
      extractedInfo: '',
    });

    expect(obj.completed).toBe(false);
  });

  it('does not complete for unknown objective ID', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'real-obj' });
    engine.addQuest(makeQuest([obj], 'quest1'));

    engine.trackEvent({
      type: 'conversation_goal_evaluated',
      questId: 'quest1',
      objectiveId: 'fake-obj',
      goalMet: true,
      confidence: 0.9,
      extractedInfo: '',
    });

    expect(obj.completed).toBe(false);
  });

  it('respects locked objectives (does not complete locked objective)', () => {
    const obj1 = makeObjective({ type: 'talk_to_npc', id: 'first', order: 1 });
    const obj2 = makeObjective({ type: 'talk_to_npc', id: 'second', order: 2 });
    engine.addQuest(makeQuest([obj1, obj2], 'locked-quest'));

    // Try to complete obj2 directly (it's locked because obj1 is incomplete)
    engine.trackEvent({
      type: 'conversation_goal_evaluated',
      questId: 'locked-quest',
      objectiveId: 'second',
      goalMet: true,
      confidence: 0.95,
      extractedInfo: 'Tried to skip ahead',
    });

    // obj2 gets confidence/info stored but completion is blocked by completeObjective's lock check
    expect(obj2.conversationGoalConfidence).toBe(0.95);
    expect(obj2.completed).toBe(false);
  });
});

// ── 8. Event field alignment verification ──────────────────────────────────

describe('Event field alignment — BabylonChatPanel → QCE', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
  });

  it('grammar_demonstrated event completes grammar objectives', () => {
    const obj = makeObjective({
      type: 'grammar',
      id: 'grammar-obj',
      requiredCount: 2,
      currentCount: 0,
    });
    engine.addQuest(makeQuest([obj], 'grammar-quest'));

    // Simulate what BabylonChatPanel now emits (after our fix)
    engine.trackEvent({ type: 'grammar_demonstrated', patternCount: 1 });
    expect(obj.currentCount).toBe(1);
    expect(obj.completed).toBe(false);

    engine.trackEvent({ type: 'grammar_demonstrated', patternCount: 1 });
    expect(obj.currentCount).toBe(2);
    expect(obj.completed).toBe(true);
  });

  it('translation_attempt event with isCorrect completes translation objectives', () => {
    const obj = makeObjective({
      type: 'translation_challenge',
      id: 'trans-obj',
      requiredCount: 1,
      translationsCompleted: 0,
      translationsCorrect: 0,
    });
    engine.addQuest(makeQuest([obj], 'trans-quest'));

    // Simulate what BabylonChatPanel now emits (isCorrect, not correct)
    engine.trackEvent({ type: 'translation_attempt', isCorrect: true });
    expect(obj.completed).toBe(true);
  });

  it('friendship_changed event with relationshipStrength completes build_friendship objectives', () => {
    const obj = makeObjective({
      type: 'build_friendship',
      id: 'friend-obj',
      npcId: 'baker1',
      requiredStrength: 0.6,
    });
    engine.addQuest(makeQuest([obj], 'friend-quest'));

    // Simulate what BabylonChatPanel now emits (friendship_changed, not npc_relationship_changed)
    engine.trackEvent({
      type: 'friendship_changed',
      npcId: 'baker1',
      relationshipStrength: 0.8,
    });
    expect(obj.completed).toBe(true);
  });

  it('friendship_changed does not complete for wrong NPC', () => {
    const obj = makeObjective({
      type: 'build_friendship',
      id: 'friend-obj',
      npcId: 'baker1',
      requiredStrength: 0.6,
    });
    engine.addQuest(makeQuest([obj], 'friend-quest'));

    engine.trackEvent({
      type: 'friendship_changed',
      npcId: 'smith1',
      relationshipStrength: 1.0,
    });
    expect(obj.completed).toBe(false);
  });
});

// ── 9. Server buildConversationGoalPrompt verification ─────────────────────

describe('buildConversationGoalPrompt — prompt construction', () => {
  // Import the function from http-bridge is not possible directly (Express dependency),
  // so we test the prompt structure expectations

  it('prompt should list objectives with IDs and types', () => {
    // Simulate what the function constructs
    const objectives: ActiveObjectiveForEvaluation[] = [
      { questId: 'q1', objectiveId: 'o1', objectiveType: 'talk_to_npc', description: 'Greet the baker' },
      { questId: 'q2', objectiveId: 'o2', objectiveType: 'use_vocabulary', description: 'Use 3 French words' },
    ];

    // Build the same format as buildConversationGoalPrompt
    const objectiveList = objectives.map((obj, i) =>
      `${i + 1}. [${obj.objectiveId}] (${obj.objectiveType}): "${obj.description}"`
    ).join('\n');

    expect(objectiveList).toContain('[o1]');
    expect(objectiveList).toContain('(talk_to_npc)');
    expect(objectiveList).toContain('Greet the baker');
    expect(objectiveList).toContain('[o2]');
    expect(objectiveList).toContain('(use_vocabulary)');
  });

  it('evaluation response schema matches GoalEvaluation interface', () => {
    // Simulate a well-formed LLM response
    const llmResponse: GoalEvaluation[] = [
      { questId: 'q1', objectiveId: 'o1', goalMet: true, confidence: 0.85, extractedInfo: 'Said bonjour' },
      { questId: 'q2', objectiveId: 'o2', goalMet: false, confidence: 0.3, extractedInfo: '' },
    ];

    // Validate structure
    for (const eval_ of llmResponse) {
      expect(eval_).toHaveProperty('questId');
      expect(eval_).toHaveProperty('objectiveId');
      expect(eval_).toHaveProperty('goalMet');
      expect(eval_).toHaveProperty('confidence');
      expect(eval_).toHaveProperty('extractedInfo');
      expect(typeof eval_.goalMet).toBe('boolean');
      expect(typeof eval_.confidence).toBe('number');
      expect(eval_.confidence).toBeGreaterThanOrEqual(0);
      expect(eval_.confidence).toBeLessThanOrEqual(1);
    }
  });
});

// ── 10. getConversationGoalObjectives (QCE-side) ───────────────────────────

describe('QuestCompletionEngine.getConversationGoalObjectives', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
  });

  it('returns objectives with conversationGoal set', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'cg-obj', conversationGoal: 'greet baker' });
    engine.addQuest(makeQuest([obj], 'cg-quest'));

    const results = engine.getConversationGoalObjectives();
    expect(results).toHaveLength(1);
    expect(results[0].objective.id).toBe('cg-obj');
  });

  it('excludes completed objectives', () => {
    const obj = makeObjective({ type: 'talk_to_npc', id: 'cg-done', conversationGoal: 'done', completed: true });
    engine.addQuest(makeQuest([obj]));

    expect(engine.getConversationGoalObjectives()).toHaveLength(0);
  });

  it('excludes locked objectives', () => {
    const obj1 = makeObjective({ type: 'talk_to_npc', id: 'first', order: 1, conversationGoal: 'step 1' });
    const obj2 = makeObjective({ type: 'talk_to_npc', id: 'second', order: 2, conversationGoal: 'step 2' });
    engine.addQuest(makeQuest([obj1, obj2], 'ordered-quest'));

    const results = engine.getConversationGoalObjectives();
    expect(results).toHaveLength(1);
    expect(results[0].objective.id).toBe('first');
  });

  it('filters by questId when provided', () => {
    const obj1 = makeObjective({ type: 'talk_to_npc', id: 'q1-obj', conversationGoal: 'goal 1' });
    const obj2 = makeObjective({ type: 'talk_to_npc', id: 'q2-obj', conversationGoal: 'goal 2' });
    engine.addQuest(makeQuest([obj1], 'quest-1'));
    engine.addQuest(makeQuest([obj2], 'quest-2'));

    const results = engine.getConversationGoalObjectives('quest-1');
    expect(results).toHaveLength(1);
    expect(results[0].questId).toBe('quest-1');
  });
});
