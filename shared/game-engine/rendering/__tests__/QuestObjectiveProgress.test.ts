/**
 * Tests for quest objective progress persistence across save/load cycles.
 *
 * Covers:
 * - QuestCompletionEngine serialize/restore objective states
 * - PlaythroughQuestOverlay objective state round-trip
 * - Full save/load cycle with overlay + engine integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../../logic/QuestCompletionEngine';
import { PlaythroughQuestOverlay } from '../../logic/PlaythroughQuestOverlay';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return { description: 'test objective', completed: false, ...overrides };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── QuestCompletionEngine serialization ──────────────────────────────────────

describe('QuestCompletionEngine objective serialization', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
  });

  it('serializes empty engine to empty object', () => {
    expect(engine.serializeObjectiveStates()).toEqual({});
  });

  it('skips quests with no progress', () => {
    engine.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
    ]));
    expect(engine.serializeObjectiveStates()).toEqual({});
  });

  it('serializes completed objectives', () => {
    engine.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
    ]));
    engine.completeObjective('q1', 'o1');

    const states = engine.serializeObjectiveStates();
    expect(states['q1']).toHaveLength(1);
    expect(states['q1'][0]).toEqual({ id: 'o1', completed: true });
  });

  it('serializes progress counters', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'use_vocabulary',
      targetWords: ['hello', 'world'], requiredCount: 3,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    // Simulate vocabulary usage
    engine.trackVocabularyUsage('hello');
    engine.trackVocabularyUsage('world');

    const states = engine.serializeObjectiveStates();
    expect(states['q1']).toHaveLength(1);
    expect(states['q1'][0].currentCount).toBe(2);
    expect(states['q1'][0].wordsUsed).toEqual(['hello', 'world']);
  });

  it('serializes pronunciation scores', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'pronunciation_check',
      requiredCount: 5,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackPronunciationAttempt(true, undefined, 85, 'hello');
    engine.trackPronunciationAttempt(true, undefined, 92, 'world');

    const states = engine.serializeObjectiveStates();
    expect(states['q1'][0].pronunciationScores).toEqual([85, 92]);
    expect(states['q1'][0].pronunciationBestScore).toBe(92);
    expect(states['q1'][0].currentCount).toBe(2);
  });

  it('serializes enemy defeat progress', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemyType: 'goblin', enemiesRequired: 5,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEnemyDefeat('goblin');
    engine.trackEnemyDefeat('goblin');

    const states = engine.serializeObjectiveStates();
    expect(states['q1'][0].enemiesDefeated).toBe(2);
  });

  it('serializes writing submissions', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'write_response',
      requiredCount: 2,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackWritingSubmission('My first essay', 5);

    const states = engine.serializeObjectiveStates();
    expect(states['q1'][0].writtenResponses).toEqual(['My first essay']);
    expect(states['q1'][0].currentCount).toBe(1);
  });

  it('only includes quests with progress', () => {
    engine.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
    ]));
    engine.addQuest(makeQuest('q2', [
      makeObjective({ id: 'o2', questId: 'q2', type: 'talk_to_npc' }),
    ]));

    engine.completeObjective('q1', 'o1');

    const states = engine.serializeObjectiveStates();
    expect(Object.keys(states)).toEqual(['q1']);
  });

  it('restores objective states into loaded quests', () => {
    engine.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
      makeObjective({ id: 'o2', questId: 'q1', type: 'use_vocabulary', requiredCount: 3 }),
    ]));

    engine.restoreObjectiveStates({
      'q1': [
        { id: 'o1', completed: true },
        { id: 'o2', currentCount: 2, wordsUsed: ['hello', 'world'] },
      ],
    });

    const quests = engine.getQuests();
    const objectives = quests[0].objectives!;
    expect(objectives[0].completed).toBe(true);
    expect(objectives[1].currentCount).toBe(2);
    expect(objectives[1].wordsUsed).toEqual(['hello', 'world']);
  });

  it('ignores restore for unknown quests', () => {
    engine.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
    ]));

    engine.restoreObjectiveStates({
      'unknown': [{ id: 'o1', completed: true }],
    });

    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);
  });

  it('ignores restore for unknown objectives within a quest', () => {
    engine.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
    ]));

    engine.restoreObjectiveStates({
      'q1': [{ id: 'unknown-obj', completed: true }],
    });

    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);
  });

  it('handles null/undefined states gracefully', () => {
    engine.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
    ]));

    engine.restoreObjectiveStates(null as any);
    engine.restoreObjectiveStates(undefined as any);

    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);
  });

  it('round-trips serialize → restore', () => {
    // Session 1: make progress
    const engine1 = new QuestCompletionEngine();
    engine1.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
      makeObjective({
        id: 'o2', questId: 'q1', type: 'use_vocabulary',
        targetWords: ['hello', 'world', 'goodbye'], requiredCount: 3,
      }),
    ]));
    engine1.completeObjective('q1', 'o1');
    engine1.trackVocabularyUsage('hello');
    engine1.trackVocabularyUsage('world');

    const saved = engine1.serializeObjectiveStates();

    // Session 2: fresh engine, same quests, restore state
    const engine2 = new QuestCompletionEngine();
    engine2.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' }),
      makeObjective({
        id: 'o2', questId: 'q1', type: 'use_vocabulary',
        targetWords: ['hello', 'world', 'goodbye'], requiredCount: 3,
      }),
    ]));
    engine2.restoreObjectiveStates(saved);

    const objectives = engine2.getQuests()[0].objectives!;
    expect(objectives[0].completed).toBe(true);
    expect(objectives[1].currentCount).toBe(2);
    expect(objectives[1].wordsUsed).toEqual(['hello', 'world']);
    expect(objectives[1].completed).toBe(false);

    // Continue tracking — should pick up where we left off
    engine2.trackVocabularyUsage('goodbye');
    expect(objectives[1].completed).toBe(true);
  });
});

// ── PlaythroughQuestOverlay objective states ─────────────────────────────────

describe('PlaythroughQuestOverlay objective state persistence', () => {
  let overlay: PlaythroughQuestOverlay;

  const baseQuests = [
    {
      id: 'q1', title: 'Learn Words', status: 'active',
      objectives: [
        { id: 'o1', type: 'use_vocabulary', description: 'Use 3 words', completed: false, currentCount: 0 },
        { id: 'o2', type: 'talk_to_npc', description: 'Talk to teacher', completed: false },
      ],
    },
    {
      id: 'q2', title: 'Fight Quest', status: 'active',
      objectives: [
        { id: 'o3', type: 'defeat_enemies', description: 'Defeat 5 goblins', completed: false, enemiesDefeated: 0 },
      ],
    },
  ];

  beforeEach(() => {
    overlay = new PlaythroughQuestOverlay();
  });

  it('stores and retrieves objective states', () => {
    const states = {
      'q1': [{ id: 'o1', currentCount: 2, wordsUsed: ['hello', 'world'] }],
    };
    overlay.setObjectiveStates(states);
    expect(overlay.getObjectiveStates()).toEqual(states);
  });

  it('includes objective states in serialization', () => {
    overlay.setObjectiveStates({
      'q1': [{ id: 'o1', completed: true }],
    });

    const serialized = overlay.serialize();
    expect(serialized.objectiveStates).toEqual({
      'q1': [{ id: 'o1', completed: true }],
    });
  });

  it('omits objectiveStates when empty', () => {
    const serialized = overlay.serialize();
    expect(serialized.objectiveStates).toBeUndefined();
  });

  it('restores objective states from deserialization', () => {
    const saved = {
      overrides: { 'q1': { status: 'active' } },
      created: {},
      objectiveStates: {
        'q1': [{ id: 'o1', currentCount: 2, wordsUsed: ['hello', 'world'] }],
      },
    };

    overlay.deserialize(saved);
    expect(overlay.getObjectiveStates()).toEqual({
      'q1': [{ id: 'o1', currentCount: 2, wordsUsed: ['hello', 'world'] }],
    });
  });

  it('merges objective states into quest objectives', () => {
    overlay.setObjectiveStates({
      'q1': [
        { id: 'o1', currentCount: 2, wordsUsed: ['hello', 'world'] },
        { id: 'o2', completed: true },
      ],
    });

    const merged = overlay.mergeQuests(baseQuests);
    const q1 = merged.find(q => q.id === 'q1')!;

    expect(q1.objectives[0].currentCount).toBe(2);
    expect(q1.objectives[0].wordsUsed).toEqual(['hello', 'world']);
    expect(q1.objectives[1].completed).toBe(true);
  });

  it('does not mutate base quests during merge', () => {
    overlay.setObjectiveStates({
      'q1': [{ id: 'o1', completed: true }],
    });

    const originalObj = baseQuests[0].objectives[0];
    overlay.mergeQuests(baseQuests);

    // Original should be untouched
    expect(originalObj.completed).toBe(false);
  });

  it('round-trips objective states through serialize/deserialize/merge', () => {
    // Session 1: Set objective progress
    overlay.updateQuest('q1', { status: 'active' });
    overlay.setObjectiveStates({
      'q1': [
        { id: 'o1', currentCount: 2, wordsUsed: ['hello', 'world'] },
      ],
      'q2': [
        { id: 'o3', enemiesDefeated: 3 },
      ],
    });

    // Save
    const saved = overlay.serialize();

    // Session 2: Fresh overlay, restore
    const restored = new PlaythroughQuestOverlay();
    restored.deserialize(saved);
    const merged = restored.mergeQuests(baseQuests);

    // Verify objective states survived
    const q1 = merged.find(q => q.id === 'q1')!;
    expect(q1.objectives[0].currentCount).toBe(2);
    expect(q1.objectives[0].wordsUsed).toEqual(['hello', 'world']);

    const q2 = merged.find(q => q.id === 'q2')!;
    expect(q2.objectives[0].enemiesDefeated).toBe(3);
  });

  it('clear removes objective states', () => {
    overlay.setObjectiveStates({ 'q1': [{ id: 'o1', completed: true }] });
    overlay.clear();
    expect(overlay.getObjectiveStates()).toEqual({});
  });

  it('handles backward-compatible format without objectiveStates', () => {
    // Old save format without objectiveStates
    const oldSave = {
      overrides: { 'q1': { status: 'completed' } },
      created: {},
    };

    overlay.deserialize(oldSave);
    expect(overlay.getObjectiveStates()).toEqual({});
    expect(overlay.getOverride('q1')).toEqual({ status: 'completed' });
  });
});

// ── Full integration: engine + overlay round-trip ────────────────────────────

describe('Full objective progress persistence cycle', () => {
  it('preserves completion engine state across save/load via overlay', () => {
    // ── Session 1: Player makes progress ──
    const engine1 = new QuestCompletionEngine();
    const overlay1 = new PlaythroughQuestOverlay();

    engine1.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-teacher' }),
      makeObjective({
        id: 'o2', questId: 'q1', type: 'use_vocabulary',
        targetWords: ['hello', 'world', 'goodbye'], requiredCount: 3,
      }),
      makeObjective({ id: 'o3', questId: 'q1', type: 'defeat_enemies', enemyType: 'wolf', enemiesRequired: 3 }),
    ]));

    // Player completes first objective
    engine1.trackNPCConversation('npc-teacher');
    // Player uses 2 of 3 required words
    engine1.trackVocabularyUsage('hello');
    engine1.trackVocabularyUsage('world');
    // Player defeats 1 of 3 enemies
    engine1.trackEnemyDefeat('wolf');

    // Pre-save: sync to overlay
    overlay1.setObjectiveStates(engine1.serializeObjectiveStates());
    overlay1.updateQuest('q1', { status: 'active' });

    // Save
    const savedState = overlay1.serialize();

    // ── Session 2: Player loads game ──
    const overlay2 = new PlaythroughQuestOverlay();
    overlay2.deserialize(savedState);

    // Merge with base world quests (objectives start fresh from world data)
    const baseQuests = [{
      id: 'q1', title: 'Tutorial Quest', status: 'available',
      objectives: [
        { id: 'o1', type: 'talk_to_npc', description: 'Talk to teacher', completed: false, npcId: 'npc-teacher' },
        { id: 'o2', type: 'use_vocabulary', description: 'Use 3 words', completed: false, currentCount: 0, requiredCount: 3 },
        { id: 'o3', type: 'defeat_enemies', description: 'Defeat 3 wolves', completed: false, enemiesDefeated: 0, enemiesRequired: 3 },
      ],
    }];

    const mergedQuests = overlay2.mergeQuests(baseQuests);
    const q1 = mergedQuests[0];

    // Quest-level override applied
    expect(q1.status).toBe('active');

    // Objective states restored via merge
    expect(q1.objectives[0].completed).toBe(true); // talked to teacher
    expect(q1.objectives[1].currentCount).toBe(2); // used 2 words
    expect(q1.objectives[1].wordsUsed).toEqual(['hello', 'world']);
    expect(q1.objectives[1].completed).toBe(false); // not done yet
    expect(q1.objectives[2].enemiesDefeated).toBe(1);

    // Restore into completion engine
    const engine2 = new QuestCompletionEngine();
    engine2.addQuest(makeQuest('q1', q1.objectives));
    engine2.restoreObjectiveStates(overlay2.getObjectiveStates());

    // Continue playing — track the remaining word
    engine2.trackVocabularyUsage('goodbye');

    // Vocabulary objective should now be complete
    const restored = engine2.getQuests()[0].objectives!;
    expect(restored[1].currentCount).toBe(3);
    expect(restored[1].completed).toBe(true);
  });

  it('handles multiple save/load cycles without data loss', () => {
    const baseObjectives = [
      makeObjective({ id: 'o1', questId: 'q1', type: 'defeat_enemies', enemyType: 'rat', enemiesRequired: 10 }),
    ];

    // Cycle 1: kill 3 rats
    const engine1 = new QuestCompletionEngine();
    engine1.addQuest(makeQuest('q1', baseObjectives));
    engine1.trackEnemyDefeat('rat');
    engine1.trackEnemyDefeat('rat');
    engine1.trackEnemyDefeat('rat');

    const overlay1 = new PlaythroughQuestOverlay();
    overlay1.setObjectiveStates(engine1.serializeObjectiveStates());
    const save1 = overlay1.serialize();

    // Cycle 2: restore, kill 4 more rats
    const overlay2 = new PlaythroughQuestOverlay();
    overlay2.deserialize(save1);

    const engine2 = new QuestCompletionEngine();
    engine2.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'defeat_enemies', enemyType: 'rat', enemiesRequired: 10 }),
    ]));
    engine2.restoreObjectiveStates(overlay2.getObjectiveStates());
    engine2.trackEnemyDefeat('rat');
    engine2.trackEnemyDefeat('rat');
    engine2.trackEnemyDefeat('rat');
    engine2.trackEnemyDefeat('rat');

    overlay2.setObjectiveStates(engine2.serializeObjectiveStates());
    const save2 = overlay2.serialize();

    // Cycle 3: restore, verify cumulative progress
    const overlay3 = new PlaythroughQuestOverlay();
    overlay3.deserialize(save2);

    const engine3 = new QuestCompletionEngine();
    engine3.addQuest(makeQuest('q1', [
      makeObjective({ id: 'o1', questId: 'q1', type: 'defeat_enemies', enemyType: 'rat', enemiesRequired: 10 }),
    ]));
    engine3.restoreObjectiveStates(overlay3.getObjectiveStates());

    expect(engine3.getQuests()[0].objectives![0].enemiesDefeated).toBe(7);
    expect(engine3.getQuests()[0].objectives![0].completed).toBe(false);

    // Kill 3 more to complete
    engine3.trackEnemyDefeat('rat');
    engine3.trackEnemyDefeat('rat');
    engine3.trackEnemyDefeat('rat');
    expect(engine3.getQuests()[0].objectives![0].completed).toBe(true);
  });
});
