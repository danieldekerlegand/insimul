import { describe, it, expect } from 'vitest';
import {
  buildArrivalAssessmentQuest,
  markPhaseObjectiveComplete,
  computeProgress,
  isArrivalAssessmentQuest,
  getArrivalPhaseIds,
  type AssessmentQuestObjective,
} from '../services/assessment-quest-bridge-shared';

describe('buildArrivalAssessmentQuest', () => {
  const config = {
    worldId: 'world-1',
    playerId: 'player-1',
    targetLanguage: 'French',
    cityName: 'Lyon',
  };

  it('creates a quest with correct metadata', () => {
    const quest = buildArrivalAssessmentQuest(config);
    expect(quest.title).toBe('Arrival Assessment');
    expect(quest.worldId).toBe('world-1');
    expect(quest.assignedTo).toBe('player-1');
    expect(quest.questType).toBe('assessment');
    expect(quest.difficulty).toBe('beginner');
    expect(quest.targetLanguage).toBe('French');
    expect(quest.gameType).toBe('language-learning');
    expect(quest.status).toBe('active');
  });

  it('creates exactly 5 objectives matching the 5 assessment phases', () => {
    const quest = buildArrivalAssessmentQuest(config);
    const objectives = quest.objectives as AssessmentQuestObjective[];
    expect(objectives).toHaveLength(5);

    const phaseIds = objectives.map(o => o.assessmentPhaseId);
    expect(phaseIds).toEqual([
      'arrival_reading',
      'arrival_writing',
      'arrival_listening',
      'arrival_initiate_conversation',
      'arrival_conversation',
    ]);
  });

  it('all objectives start incomplete with count 0', () => {
    const quest = buildArrivalAssessmentQuest(config);
    const objectives = quest.objectives as AssessmentQuestObjective[];
    for (const obj of objectives) {
      expect(obj.completed).toBe(false);
      expect(obj.currentCount).toBe(0);
      // arrival_conversation has requiredCount: 3
      if (obj.assessmentPhaseId === 'arrival_conversation') {
        expect(obj.requiredCount).toBe(3);
      } else {
        expect(obj.requiredCount).toBe(1);
      }
    }
  });

  it('resolves template variables in description', () => {
    const quest = buildArrivalAssessmentQuest(config);
    expect(quest.description).toContain('French');
    expect(quest.description).toContain('Lyon');
    expect(quest.description).not.toContain('{{');
  });

  it('resolves template variables in objective descriptions', () => {
    const quest = buildArrivalAssessmentQuest(config);
    const objectives = quest.objectives as AssessmentQuestObjective[];
    for (const obj of objectives) {
      expect(obj.description).not.toContain('{{');
    }
  });

  it('includes assessment and onboarding tags', () => {
    const quest = buildArrivalAssessmentQuest(config);
    const tags = quest.tags as string[];
    expect(tags).toContain('assessment');
    expect(tags).toContain('arrival');
    expect(tags).toContain('onboarding');
    expect(tags).toContain('non-skippable');
    expect(tags).toContain('non-abandonable');
  });

  it('sets progress to 0%', () => {
    const quest = buildArrivalAssessmentQuest(config);
    expect((quest.progress as any).percentComplete).toBe(0);
  });

  it('includes cefrAssessment in rewards', () => {
    const quest = buildArrivalAssessmentQuest(config);
    expect((quest.rewards as any).cefrAssessment).toBe(true);
  });

  it('accepts optional playerCharacterId', () => {
    const quest = buildArrivalAssessmentQuest({ ...config, playerCharacterId: 'char-1' });
    expect(quest.assignedToCharacterId).toBe('char-1');
  });
});

describe('markPhaseObjectiveComplete', () => {
  function makeObjectives(): AssessmentQuestObjective[] {
    return [
      { id: 'obj_arrival_reading', type: 'complete_conversation', description: 'Reading', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'arrival_reading' },
      { id: 'obj_arrival_writing', type: 'complete_conversation', description: 'Writing', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'arrival_writing' },
      { id: 'obj_arrival_listening', type: 'complete_conversation', description: 'Listening', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'arrival_listening' },
      { id: 'obj_arrival_conversation', type: 'complete_conversation', description: 'Conversation', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'arrival_conversation' },
    ];
  }

  it('marks the matching phase objective as complete', () => {
    const { objectives } = markPhaseObjectiveComplete(makeObjectives(), 'arrival_reading', 12, 15);
    const reading = objectives.find(o => o.assessmentPhaseId === 'arrival_reading')!;
    expect(reading.completed).toBe(true);
    expect(reading.currentCount).toBe(1);
  });

  it('attaches score and maxScore to completed objective', () => {
    const { objectives } = markPhaseObjectiveComplete(makeObjectives(), 'arrival_writing', 10, 15);
    const writing = objectives.find(o => o.assessmentPhaseId === 'arrival_writing')!;
    expect((writing as any).score).toBe(10);
    expect((writing as any).maxScore).toBe(15);
  });

  it('does not modify other objectives', () => {
    const { objectives } = markPhaseObjectiveComplete(makeObjectives(), 'arrival_reading', 12, 15);
    const others = objectives.filter(o => o.assessmentPhaseId !== 'arrival_reading');
    for (const obj of others) {
      expect(obj.completed).toBe(false);
      expect(obj.currentCount).toBe(0);
    }
  });

  it('returns allComplete=false when not all phases are done', () => {
    const { allComplete } = markPhaseObjectiveComplete(makeObjectives(), 'arrival_reading', 12, 15);
    expect(allComplete).toBe(false);
  });

  it('returns allComplete=true when all phases are done', () => {
    let objs = makeObjectives();
    ({ objectives: objs } = markPhaseObjectiveComplete(objs, 'arrival_reading', 12, 15));
    ({ objectives: objs } = markPhaseObjectiveComplete(objs, 'arrival_writing', 10, 15));
    ({ objectives: objs } = markPhaseObjectiveComplete(objs, 'arrival_listening', 9, 13));
    const { objectives, allComplete } = markPhaseObjectiveComplete(objs, 'arrival_conversation', 8, 10);
    expect(allComplete).toBe(true);
    expect(objectives.every(o => o.completed)).toBe(true);
  });

  it('does not re-complete an already completed objective', () => {
    let objs = makeObjectives();
    ({ objectives: objs } = markPhaseObjectiveComplete(objs, 'arrival_reading', 12, 15));
    // Try to complete again with different score
    const { objectives } = markPhaseObjectiveComplete(objs, 'arrival_reading', 5, 15);
    const reading = objectives.find(o => o.assessmentPhaseId === 'arrival_reading')!;
    // Should keep original score
    expect((reading as any).score).toBe(12);
  });

  it('handles unknown phaseId gracefully', () => {
    const { objectives, allComplete } = markPhaseObjectiveComplete(makeObjectives(), 'unknown_phase', 10, 10);
    expect(allComplete).toBe(false);
    expect(objectives.every(o => !o.completed)).toBe(true);
  });
});

describe('computeProgress', () => {
  it('returns 0 for empty objectives', () => {
    expect(computeProgress([])).toBe(0);
  });

  it('returns 0 when no objectives are completed', () => {
    const objs: AssessmentQuestObjective[] = [
      { id: '1', type: 't', description: 'd', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'p1' },
      { id: '2', type: 't', description: 'd', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'p2' },
    ];
    expect(computeProgress(objs)).toBe(0);
  });

  it('returns 25 when 1 of 4 objectives is completed', () => {
    const objs: AssessmentQuestObjective[] = [
      { id: '1', type: 't', description: 'd', requiredCount: 1, currentCount: 1, completed: true, assessmentPhaseId: 'p1' },
      { id: '2', type: 't', description: 'd', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'p2' },
      { id: '3', type: 't', description: 'd', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'p3' },
      { id: '4', type: 't', description: 'd', requiredCount: 1, currentCount: 0, completed: false, assessmentPhaseId: 'p4' },
    ];
    expect(computeProgress(objs)).toBe(25);
  });

  it('returns 100 when all objectives are completed', () => {
    const objs: AssessmentQuestObjective[] = [
      { id: '1', type: 't', description: 'd', requiredCount: 1, currentCount: 1, completed: true, assessmentPhaseId: 'p1' },
      { id: '2', type: 't', description: 'd', requiredCount: 1, currentCount: 1, completed: true, assessmentPhaseId: 'p2' },
    ];
    expect(computeProgress(objs)).toBe(100);
  });
});

describe('isArrivalAssessmentQuest', () => {
  it('returns true when tags contain assessment and arrival', () => {
    expect(isArrivalAssessmentQuest({ tags: ['assessment', 'arrival', 'onboarding'] })).toBe(true);
  });

  it('returns false when missing assessment tag', () => {
    expect(isArrivalAssessmentQuest({ tags: ['arrival', 'onboarding'] })).toBe(false);
  });

  it('returns false when missing arrival tag', () => {
    expect(isArrivalAssessmentQuest({ tags: ['assessment', 'onboarding'] })).toBe(false);
  });

  it('returns false for null tags', () => {
    expect(isArrivalAssessmentQuest({ tags: null })).toBe(false);
  });

  it('returns false for undefined tags', () => {
    expect(isArrivalAssessmentQuest({})).toBe(false);
  });
});

describe('getArrivalPhaseIds', () => {
  it('returns the 5 arrival encounter phase IDs in order', () => {
    const ids = getArrivalPhaseIds();
    expect(ids).toEqual([
      'arrival_reading',
      'arrival_writing',
      'arrival_listening',
      'arrival_initiate_conversation',
      'arrival_conversation',
    ]);
  });
});
