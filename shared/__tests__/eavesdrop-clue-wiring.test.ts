/**
 * Tests for eavesdrop event → quest completion → clue discovery wiring
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QuestCompletionEngine, type CompletionQuest, type CompletionObjective } from '../game-engine/logic/QuestCompletionEngine';
import { ClueStore } from '../game-engine/logic/ClueStore';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import { VALID_OBJECTIVE_TYPES } from '../quest-objective-types';
import { getMappingsForEvent } from '../game-engine/quest-action-mapping';

function makeObjective(type: string, extra: Partial<CompletionObjective> = {}): CompletionObjective {
  return {
    id: `obj-${type}`,
    questId: 'test-quest',
    type,
    description: `Test: ${type}`,
    completed: false,
    ...extra,
  };
}

function makeQuest(objectives: CompletionObjective[]): CompletionQuest {
  return { id: 'test-quest', objectives };
}

describe('Eavesdrop → Quest Completion', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
  });

  it('eavesdrop is a valid objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('eavesdrop')).toBe(true);
  });

  it('trackEvent eavesdrop completes eavesdrop objective with matching topic', () => {
    const obj = makeObjective('eavesdrop', { eavesdropTopic: 'writer', requiredCount: 1 });
    engine.addQuest(makeQuest([obj]));

    engine.trackEvent({
      type: 'eavesdrop',
      npcId1: 'npc-1',
      npcId2: 'npc-2',
      topic: 'the missing writer',
      languageUsed: 'french',
    });

    expect(obj.completed).toBe(true);
    expect(obj.eavesdropCompleted).toBe(true);
  });

  it('trackEvent eavesdrop does NOT complete when topic does not match', () => {
    const obj = makeObjective('eavesdrop', { eavesdropTopic: 'writer', requiredCount: 1 });
    engine.addQuest(makeQuest([obj]));

    engine.trackEvent({
      type: 'eavesdrop',
      npcId1: 'npc-1',
      npcId2: 'npc-2',
      topic: 'the weather today',
      languageUsed: 'french',
    });

    expect(obj.completed).toBe(false);
  });

  it('trackEvent eavesdrop completes when no topic filter is set', () => {
    const obj = makeObjective('eavesdrop', { requiredCount: 1 });
    engine.addQuest(makeQuest([obj]));

    engine.trackEvent({
      type: 'eavesdrop',
      npcId1: 'npc-1',
      npcId2: 'npc-2',
      topic: 'anything',
      languageUsed: 'french',
    });

    expect(obj.completed).toBe(true);
  });

  it('eavesdrop supports count-based completion (overhear 3 conversations)', () => {
    const obj = makeObjective('eavesdrop', { requiredCount: 3 });
    engine.addQuest(makeQuest([obj]));

    for (let i = 0; i < 2; i++) {
      engine.trackEvent({
        type: 'eavesdrop',
        npcId1: 'npc-1',
        npcId2: 'npc-2',
        topic: `topic-${i}`,
        languageUsed: 'french',
      });
    }
    expect(obj.completed).toBe(false);
    expect(obj.currentCount).toBe(2);

    engine.trackEvent({
      type: 'eavesdrop',
      npcId1: 'npc-1',
      npcId2: 'npc-2',
      topic: 'topic-3',
      languageUsed: 'french',
    });
    expect(obj.completed).toBe(true);
  });
});

describe('Eavesdrop → Clue Discovery', () => {
  it('addEavesdropClue creates witness_testimony for investigation-relevant topics', () => {
    const eventBus = new GameEventBus();
    const clueStore = new ClueStore(eventBus);

    const added = clueStore.addEavesdropClue(
      'Pierre',
      'Marie',
      'the missing writer was seen near the journal shop',
    );

    expect(added).toBe(true);
    const clues = clueStore.getClues();
    expect(clues.length).toBe(1);
    expect(clues[0].category).toBe('witness_testimony');
    expect(clues[0].text).toContain('Pierre');
    expect(clues[0].text).toContain('Marie');
    expect(clues[0].tags).toContain('pierre');
    expect(clues[0].tags).toContain('marie');
  });

  it('addEavesdropClue returns false for non-investigation topics', () => {
    const clueStore = new ClueStore();

    const added = clueStore.addEavesdropClue(
      'Pierre',
      'Marie',
      'the weather is nice today',
    );

    expect(added).toBe(false);
    expect(clueStore.getClueCount()).toBe(0);
  });

  it('addEavesdropClue emits clue_discovered event', () => {
    const eventBus = new GameEventBus();
    const events: any[] = [];
    eventBus.on('clue_discovered', (e) => events.push(e));

    const clueStore = new ClueStore(eventBus);
    clueStore.addEavesdropClue('Pierre', 'Marie', 'the writer disappeared');

    expect(events.length).toBe(1);
    expect(events[0].clueCategory).toBe('witness_testimony');
  });
});

describe('Eavesdrop declarative mapping', () => {
  it('conversation_overheard event has a mapping to eavesdrop objective', () => {
    const mappings = getMappingsForEvent('conversation_overheard');
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings[0].objectiveType).toBe('eavesdrop');
  });

  it('handleGameEvent completes eavesdrop via declarative mapping', () => {
    const engine = new QuestCompletionEngine();
    const obj = makeObjective('eavesdrop', { eavesdropTopic: 'writer', requiredCount: 1, currentCount: 0 });
    engine.addQuest(makeQuest([obj]));

    const affected = engine.handleGameEvent({
      type: 'conversation_overheard',
      npcId1: 'npc-1',
      npcId2: 'npc-2',
      topic: 'the missing writer',
      languageUsed: 'french',
    });

    expect(affected).toBeGreaterThan(0);
    expect(obj.completed).toBe(true);
  });
});
