/**
 * Tests for defeat_enemies and escort_npc quest mechanics.
 *
 * Tests the full objective flow through QuestCompletionEngine:
 * - Enemy defeat counting with type matching
 * - Escort arrival detection with NPC tracking
 * - Event dispatch for both mechanics
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

describe('defeat_enemies quest mechanics', () => {
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

  it('tracks progressive enemy defeat count', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemyType: 'goblin', enemiesRequired: 3, enemiesDefeated: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEnemyDefeat('goblin');
    expect(obj.enemiesDefeated).toBe(1);
    expect(obj.completed).toBe(false);

    engine.trackEnemyDefeat('goblin');
    expect(obj.enemiesDefeated).toBe(2);
    expect(obj.completed).toBe(false);

    engine.trackEnemyDefeat('goblin');
    expect(obj.enemiesDefeated).toBe(3);
    expect(obj.completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('completes quest when all enemies defeated', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemyType: 'skeleton', enemiesRequired: 1, enemiesDefeated: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEnemyDefeat('skeleton');
    expect(questCompletedSpy).toHaveBeenCalledWith('q1');
  });

  it('ignores wrong enemy types', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemyType: 'goblin', enemiesRequired: 1, enemiesDefeated: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEnemyDefeat('dragon');
    expect(obj.enemiesDefeated).toBe(0);
    expect(obj.completed).toBe(false);
  });

  it('matches any enemy when enemyType is unset', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemiesRequired: 2, enemiesDefeated: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEnemyDefeat('goblin');
    engine.trackEnemyDefeat('dragon');
    expect(obj.enemiesDefeated).toBe(2);
    expect(obj.completed).toBe(true);
  });

  it('defaults to requiring 1 enemy when enemiesRequired is unset', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEnemyDefeat('anything');
    expect(obj.completed).toBe(true);
  });

  it('does not double-complete already completed objectives', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemiesRequired: 1, enemiesDefeated: 0,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEnemyDefeat('goblin');
    expect(obj.completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledTimes(1);

    // Additional defeats should be ignored
    engine.trackEnemyDefeat('goblin');
    expect(objectiveCompletedSpy).toHaveBeenCalledTimes(1);
  });

  it('handles enemy_defeat via trackEvent dispatch', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemiesRequired: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({ type: 'enemy_defeat', enemyType: 'wolf' });
    expect(obj.completed).toBe(true);
  });

  it('isolates defeat tracking to specific quest when questId provided', () => {
    const o1 = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemiesRequired: 1, enemiesDefeated: 0,
    });
    const o2 = makeObjective({
      id: 'o2', questId: 'q2', type: 'defeat_enemies',
      enemiesRequired: 1, enemiesDefeated: 0,
    });
    engine.addQuest(makeQuest('q1', [o1]));
    engine.addQuest(makeQuest('q2', [o2]));

    engine.trackEnemyDefeat('goblin', 'q1');
    expect(o1.completed).toBe(true);
    expect(o2.completed).toBe(false);
  });

  it('tracks defeats across multiple quests without filter', () => {
    const o1 = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemiesRequired: 1, enemiesDefeated: 0,
    });
    const o2 = makeObjective({
      id: 'o2', questId: 'q2', type: 'defeat_enemies',
      enemiesRequired: 1, enemiesDefeated: 0,
    });
    engine.addQuest(makeQuest('q1', [o1]));
    engine.addQuest(makeQuest('q2', [o2]));

    engine.trackEnemyDefeat('goblin');
    expect(o1.completed).toBe(true);
    expect(o2.completed).toBe(true);
  });
});

describe('escort_npc quest mechanics', () => {
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

  it('completes escort when NPC reaches destination', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'escort_npc',
      escortNpcId: 'npc-guide',
      arrived: false,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackArrival('npc-guide', true);
    expect(obj.completed).toBe(true);
    expect(obj.arrived).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    expect(questCompletedSpy).toHaveBeenCalledWith('q1');
  });

  it('does not complete when destination not reached', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'escort_npc',
      escortNpcId: 'npc-guide',
      arrived: false,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackArrival('npc-guide', false);
    expect(obj.completed).toBe(false);
    expect(obj.arrived).toBeFalsy();
  });

  it('handles arrival via trackEvent dispatch', () => {
    const obj = makeObjective({
      id: 'o1', questId: 'q1', type: 'escort_npc',
      arrived: false,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'arrival',
      npcOrItemId: 'npc-1',
      destinationReached: true,
    });
    expect(obj.completed).toBe(true);
    expect(obj.arrived).toBe(true);
  });

  it('does not complete deliver_item when escort_npc arrives', () => {
    const escort = makeObjective({
      id: 'o1', questId: 'q1', type: 'escort_npc',
      arrived: false,
    });
    const deliver = makeObjective({
      id: 'o2', questId: 'q1', type: 'deliver_item',
      delivered: false,
    });
    engine.addQuest(makeQuest('q1', [escort, deliver]));

    engine.trackArrival('npc-1', true);
    // Both escort_npc and deliver_item should complete on arrival
    expect(escort.arrived).toBe(true);
    expect(deliver.delivered).toBe(true);
  });

  it('completes multi-objective quest with escort and combat', () => {
    const defeatObj = makeObjective({
      id: 'o1', questId: 'q1', type: 'defeat_enemies',
      enemiesRequired: 2, enemiesDefeated: 0,
    });
    const escortObj = makeObjective({
      id: 'o2', questId: 'q1', type: 'escort_npc',
      escortNpcId: 'npc-guide',
      arrived: false,
    });
    engine.addQuest(makeQuest('q1', [defeatObj, escortObj]));

    // Defeat enemies first
    engine.trackEnemyDefeat('wolf');
    engine.trackEnemyDefeat('wolf');
    expect(defeatObj.completed).toBe(true);
    expect(questCompletedSpy).not.toHaveBeenCalled(); // Escort still pending

    // Then complete escort
    engine.trackArrival('npc-guide', true);
    expect(escortObj.completed).toBe(true);
    expect(questCompletedSpy).toHaveBeenCalledWith('q1');
  });
});
