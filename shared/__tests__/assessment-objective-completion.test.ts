/**
 * Tests for Arrival Assessment objective completion wiring.
 *
 * Verifies that all 5 assessment objectives are completed by their
 * specific event triggers, including the declarative completionTrigger
 * system and phase-specific objective types.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';
import {
  buildArrivalAssessmentQuest,
  markPhaseObjectiveComplete,
  computeProgress,
  isArrivalAssessmentQuest,
  getArrivalPhaseIds,
  PHASE_OBJECTIVE_CONFIG,
} from '../services/assessment-quest-bridge-shared';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeAssessmentQuest(): CompletionQuest {
  const raw = buildArrivalAssessmentQuest({
    worldId: 'world-1',
    playerId: 'player-1',
    targetLanguage: 'French',
    cityName: 'Charenton',
  });
  return {
    id: 'quest-assessment',
    objectives: (raw.objectives as any[]).map((obj: any) => ({
      ...obj,
      questId: 'quest-assessment',
    })),
  };
}

function makeEngine(quest: CompletionQuest) {
  const engine = new QuestCompletionEngine();
  engine.addQuest(quest);
  return engine;
}

// ── Phase-to-objective mapping ───────────────────────────────────────────────

describe('Assessment quest bridge', () => {
  it('creates 5 objectives with correct types', () => {
    const quest = makeAssessmentQuest();
    expect(quest.objectives).toHaveLength(5);

    const types = quest.objectives!.map(o => o.type);
    expect(types).toEqual([
      'arrival_reading',
      'arrival_writing',
      'arrival_listening',
      'arrival_initiate_conversation',
      'arrival_conversation',
    ]);
  });

  it('sets completionTrigger on each objective', () => {
    const quest = makeAssessmentQuest();
    const triggers = quest.objectives!.map(o => o.completionTrigger);
    expect(triggers).toEqual([
      'reading_completed',
      'writing_submitted',
      'listening_completed',
      'npc_talked',
      'conversation_assessment_completed',
    ]);
  });

  it('sets minWordCount=20 on writing objective', () => {
    const quest = makeAssessmentQuest();
    const writingObj = quest.objectives!.find(o => o.type === 'arrival_writing');
    expect(writingObj?.minWordCount).toBe(20);
  });

  it('sets requiredCount=3 on conversation objective', () => {
    const quest = makeAssessmentQuest();
    const convObj = quest.objectives!.find(o => o.type === 'arrival_conversation');
    expect(convObj?.requiredCount).toBe(3);
  });

  it('is identified as arrival assessment quest', () => {
    const raw = buildArrivalAssessmentQuest({
      worldId: 'w', playerId: 'p', targetLanguage: 'French', cityName: 'C',
    });
    expect(isArrivalAssessmentQuest(raw)).toBe(true);
  });

  it('returns 5 phase IDs', () => {
    expect(getArrivalPhaseIds()).toHaveLength(5);
    expect(getArrivalPhaseIds()[0]).toBe('arrival_reading');
  });
});

// ── markPhaseObjectiveComplete ───────────────────────────────────────────────

describe('markPhaseObjectiveComplete', () => {
  it('marks the correct objective complete by assessmentPhaseId', () => {
    const quest = makeAssessmentQuest();
    const { objectives, allComplete } = markPhaseObjectiveComplete(
      quest.objectives as any[], 'arrival_reading', 12, 15,
    );
    const reading = objectives.find((o: any) => o.assessmentPhaseId === 'arrival_reading');
    expect(reading?.completed).toBe(true);
    expect(reading?.score).toBe(12);
    expect(reading?.maxScore).toBe(15);
    expect(allComplete).toBe(false);
  });

  it('reports allComplete when all 5 are done', () => {
    const quest = makeAssessmentQuest();
    let objs = quest.objectives as any[];
    for (const phaseId of getArrivalPhaseIds()) {
      const result = markPhaseObjectiveComplete(objs, phaseId, 10, 15);
      objs = result.objectives;
    }
    const { allComplete } = markPhaseObjectiveComplete(objs, 'nonexistent', 0, 0);
    // All should already be complete
    expect(objs.every((o: any) => o.completed)).toBe(true);
  });
});

// ── QuestCompletionEngine — reading_completed ────────────────────────────────

describe('QuestCompletionEngine — reading_completed', () => {
  it('completes arrival_reading objective via reading_completed event', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeAssessmentQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({ type: 'reading_completed' });

    const quest = engine.getQuests()[0];
    const readingObj = quest.objectives!.find(o => o.type === 'arrival_reading');
    expect(readingObj?.completed).toBe(true);
    expect(onComplete).toHaveBeenCalledWith('quest-assessment', readingObj!.id);
  });

  it('completes via completionTrigger', () => {
    const engine = makeEngine(makeAssessmentQuest());
    engine.trackByTrigger('reading_completed');

    const quest = engine.getQuests()[0];
    const readingObj = quest.objectives!.find(o => o.completionTrigger === 'reading_completed');
    expect(readingObj?.completed).toBe(true);
  });
});

// ── QuestCompletionEngine — writing_submitted ────────────────────────────────

describe('QuestCompletionEngine — writing_submitted (assessment)', () => {
  it('completes arrival_writing objective when wordCount >= 20', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeAssessmentQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({ type: 'writing_submitted', text: 'Bonjour, je suis arrivé à la ville.', wordCount: 20 });

    const quest = engine.getQuests()[0];
    const writingObj = quest.objectives!.find(o => o.type === 'arrival_writing');
    expect(writingObj?.completed).toBe(true);
  });

  it('does NOT complete arrival_writing objective when wordCount < 20', () => {
    const engine = makeEngine(makeAssessmentQuest());

    engine.trackEvent({ type: 'writing_submitted', text: 'Bonjour', wordCount: 5 });

    const quest = engine.getQuests()[0];
    const writingObj = quest.objectives!.find(o => o.type === 'arrival_writing');
    expect(writingObj?.completed).toBe(false);
  });
});

// ── QuestCompletionEngine — listening_completed ──────────────────────────────

describe('QuestCompletionEngine — listening_completed', () => {
  it('completes arrival_listening objective via listening_completed event', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeAssessmentQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({ type: 'listening_completed' });

    const quest = engine.getQuests()[0];
    const listeningObj = quest.objectives!.find(o => o.type === 'arrival_listening');
    expect(listeningObj?.completed).toBe(true);
    expect(onComplete).toHaveBeenCalledWith('quest-assessment', listeningObj!.id);
  });
});

// ── QuestCompletionEngine — npc_talked ───────────────────────────────────────

describe('QuestCompletionEngine — npc_talked', () => {
  it('completes arrival_initiate_conversation objective', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeAssessmentQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({ type: 'npc_talked', npcId: 'npc-assessment' });

    const quest = engine.getQuests()[0];
    const initiateObj = quest.objectives!.find(o => o.type === 'arrival_initiate_conversation');
    expect(initiateObj?.completed).toBe(true);
    expect(onComplete).toHaveBeenCalledWith('quest-assessment', initiateObj!.id);
  });
});

// ── QuestCompletionEngine — conversation_assessment_completed ────────────────

describe('QuestCompletionEngine — conversation_assessment_completed', () => {
  it('completes arrival_conversation objective when turnCount >= 3', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeAssessmentQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({ type: 'conversation_assessment_completed', npcId: 'npc-1', turnCount: 4 });

    const quest = engine.getQuests()[0];
    const convObj = quest.objectives!.find(o => o.type === 'arrival_conversation');
    expect(convObj?.completed).toBe(true);
    expect(onComplete).toHaveBeenCalledWith('quest-assessment', convObj!.id);
  });

  it('does NOT complete when turnCount < 3', () => {
    const engine = makeEngine(makeAssessmentQuest());

    engine.trackEvent({ type: 'conversation_assessment_completed', npcId: 'npc-1', turnCount: 2 });

    const quest = engine.getQuests()[0];
    const convObj = quest.objectives!.find(o => o.type === 'arrival_conversation');
    expect(convObj?.completed).toBe(false);
    expect(convObj?.currentCount).toBe(2);
  });
});

// ── Full end-to-end: all 5 objectives → quest complete ──────────────────────

describe('Arrival Assessment — full end-to-end', () => {
  it('completes all 5 objectives and fires quest completion', () => {
    const onObjComplete = vi.fn();
    const onQuestComplete = vi.fn();
    const engine = makeEngine(makeAssessmentQuest());
    engine.setOnObjectiveCompleted(onObjComplete);
    engine.setOnQuestCompleted(onQuestComplete);

    // 1. Reading
    engine.trackEvent({ type: 'reading_completed' });
    expect(onObjComplete).toHaveBeenCalledTimes(1);

    // 2. Writing (20+ words in French)
    engine.trackEvent({ type: 'writing_submitted', text: 'Bonjour, je suis arrivé dans la ville.', wordCount: 25 });
    expect(onObjComplete).toHaveBeenCalledTimes(2);

    // 3. Listening
    engine.trackEvent({ type: 'listening_completed' });
    expect(onObjComplete).toHaveBeenCalledTimes(3);

    // 4. Talk to NPC
    engine.trackEvent({ type: 'npc_talked', npcId: 'npc-assessment' });
    expect(onObjComplete).toHaveBeenCalledTimes(4);

    // 5. Conversation assessment (3+ turns)
    engine.trackEvent({ type: 'conversation_assessment_completed', npcId: 'npc-assessment', turnCount: 6 });
    expect(onObjComplete).toHaveBeenCalledTimes(5);

    // Quest should be complete
    expect(onQuestComplete).toHaveBeenCalledWith('quest-assessment');
    expect(engine.isQuestComplete('quest-assessment')).toBe(true);
  });

  it('tracks progress correctly via computeProgress', () => {
    const quest = makeAssessmentQuest();
    const objs = quest.objectives as any[];

    expect(computeProgress(objs)).toBe(0);

    objs[0].completed = true;
    expect(computeProgress(objs)).toBe(20);

    objs[1].completed = true;
    objs[2].completed = true;
    expect(computeProgress(objs)).toBe(60);

    objs[3].completed = true;
    objs[4].completed = true;
    expect(computeProgress(objs)).toBe(100);
  });
});

// ── Declarative completionTrigger system ─────────────────────────────────────

describe('QuestCompletionEngine — trackByTrigger', () => {
  it('completes objectives by matching completionTrigger', () => {
    const engine = new QuestCompletionEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'o1', questId: 'q1', type: 'custom', description: 'Do thing', completed: false, completionTrigger: 'my_custom_event' },
        { id: 'o2', questId: 'q1', type: 'custom', description: 'Other', completed: false, completionTrigger: 'other_event' },
      ],
    });

    engine.trackByTrigger('my_custom_event');

    const quest = engine.getQuests()[0];
    expect(quest.objectives![0].completed).toBe(true);
    expect(quest.objectives![1].completed).toBe(false);
  });

  it('does not complete locked objectives', () => {
    const engine = new QuestCompletionEngine();
    engine.addQuest({
      id: 'q1',
      objectives: [
        { id: 'o1', questId: 'q1', type: 'custom', description: 'First', completed: false, completionTrigger: 'ev1', order: 0 },
        { id: 'o2', questId: 'q1', type: 'custom', description: 'Second', completed: false, completionTrigger: 'ev2', order: 1 },
      ],
    });

    // Try to complete the second objective (locked because first is incomplete)
    engine.trackByTrigger('ev2');
    expect(engine.getQuests()[0].objectives![1].completed).toBe(false);

    // Complete first, then second
    engine.trackByTrigger('ev1');
    engine.trackByTrigger('ev2');
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    expect(engine.getQuests()[0].objectives![1].completed).toBe(true);
  });
});

// ── PHASE_OBJECTIVE_CONFIG ───────────────────────────────────────────────────

describe('PHASE_OBJECTIVE_CONFIG', () => {
  it('has entries for all 5 arrival phases', () => {
    const phaseIds = getArrivalPhaseIds();
    for (const phaseId of phaseIds) {
      expect(PHASE_OBJECTIVE_CONFIG[phaseId]).toBeDefined();
      expect(PHASE_OBJECTIVE_CONFIG[phaseId].type).toBe(phaseId);
      expect(PHASE_OBJECTIVE_CONFIG[phaseId].completionTrigger).toBeTruthy();
    }
  });
});
