import { describe, it, expect, beforeEach } from 'vitest';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import {
  TutorialQuestSystem,
  buildTutorialObjectives,
  type TutorialQuestConfig,
} from '../game-engine/logic/TutorialQuestSystem';

function makeConfig(overrides?: Partial<TutorialQuestConfig>): TutorialQuestConfig {
  return {
    worldName: 'Testville',
    targetLanguage: 'French',
    includeAssessment: true,
    ...overrides,
  };
}

describe('buildTutorialObjectives', () => {
  it('includes assessment objectives when includeAssessment is true', () => {
    const objectives = buildTutorialObjectives(true);
    const assessmentIds = objectives.filter(o => o.isAssessment).map(o => o.id);
    expect(assessmentIds).toContain('tut_assessment_reading');
    expect(assessmentIds).toContain('tut_assessment_listening');
    expect(assessmentIds).toContain('tut_assessment_conversation');
  });

  it('excludes assessment objectives when includeAssessment is false', () => {
    const objectives = buildTutorialObjectives(false);
    const assessmentIds = objectives.filter(o => o.isAssessment);
    expect(assessmentIds).toHaveLength(0);
  });

  it('always includes core tutorial objectives', () => {
    const objectives = buildTutorialObjectives(false);
    const ids = objectives.map(o => o.id);
    expect(ids).toContain('tut_movement');
    expect(ids).toContain('tut_camera');
    expect(ids).toContain('tut_interact_npc');
    expect(ids).toContain('tut_inventory');
    expect(ids).toContain('tut_reading');
    expect(ids).toContain('tut_quest_log');
  });

  it('starts with all objectives uncompleted', () => {
    const objectives = buildTutorialObjectives(true);
    expect(objectives.every(o => !o.completed)).toBe(true);
  });
});

describe('TutorialQuestSystem', () => {
  let eventBus: GameEventBus;
  let system: TutorialQuestSystem;

  beforeEach(() => {
    eventBus = new GameEventBus();
    system = new TutorialQuestSystem(eventBus, makeConfig());
  });

  it('initializes with correct state', () => {
    const state = system.getState();
    expect(state.questType).toBe('tutorial');
    expect(state.title).toContain('Testville');
    expect(state.isComplete).toBe(false);
    expect(state.currentObjectiveIndex).toBe(0);
  });

  it('returns first objective as current', () => {
    const current = system.getCurrentObjective();
    expect(current).not.toBeNull();
    expect(current!.id).toBe('tut_movement');
  });

  it('reports initial progress as 0%', () => {
    const progress = system.getProgress();
    expect(progress.completed).toBe(0);
    expect(progress.percentage).toBe(0);
    expect(progress.total).toBeGreaterThan(0);
  });

  it('completes current objective and advances', () => {
    const next = system.completeCurrentObjective();
    expect(next).not.toBeNull();
    expect(next!.id).toBe('tut_camera');

    const progress = system.getProgress();
    expect(progress.completed).toBe(1);
  });

  it('emits onboarding_step_completed on objective completion', () => {
    const events: any[] = [];
    eventBus.on('onboarding_step_completed', (e) => events.push(e));

    system.completeCurrentObjective();
    expect(events).toHaveLength(1);
    expect(events[0].stepId).toBe('tut_movement');
  });

  it('emits onboarding_completed when all objectives done', () => {
    const events: any[] = [];
    eventBus.on('onboarding_completed', (e) => events.push(e));

    const state = system.getState();
    for (let i = 0; i < state.objectives.length; i++) {
      system.completeCurrentObjective();
    }

    expect(events).toHaveLength(1);
    expect(system.getState().isComplete).toBe(true);
    expect(system.getCurrentObjective()).toBeNull();
  });

  it('completes objective by ID only if it is the current one', () => {
    // Try completing a non-current objective
    const result = system.completeObjectiveById('tut_camera');
    expect(result).toBe(false);

    // Complete the actual current one
    const result2 = system.completeObjectiveById('tut_movement');
    expect(result2).toBe(true);
    expect(system.getCurrentObjective()!.id).toBe('tut_camera');
  });

  it('auto-completes movement objective on location_visited event', () => {
    eventBus.emit({
      type: 'location_visited',
      locationId: 'loc1',
      locationName: 'Town Square',
    });

    const current = system.getCurrentObjective();
    expect(current!.id).toBe('tut_camera');
  });

  it('auto-completes camera objective on npc_greeting event', () => {
    // First complete movement
    system.completeCurrentObjective();
    expect(system.getCurrentObjective()!.id).toBe('tut_camera');

    eventBus.emit({
      type: 'npc_greeting',
      npcId: 'npc1',
      npcName: 'Pierre',
      language: 'French',
      greetingText: 'Bonjour!',
      isFirstMeeting: true,
    });

    expect(system.getCurrentObjective()!.id).toBe('tut_interact_npc');
  });

  it('auto-completes NPC interaction objective on npc_talked event', () => {
    // Advance to tut_interact_npc
    system.completeCurrentObjective(); // movement
    system.completeCurrentObjective(); // camera

    eventBus.emit({
      type: 'npc_talked',
      npcId: 'npc1',
      npcName: 'Pierre',
      turnCount: 3,
    });

    // Should have advanced past tut_interact_npc
    expect(system.getCurrentObjective()!.id).not.toBe('tut_interact_npc');
  });

  it('skipNonAssessmentObjectives skips only tutorial steps', () => {
    system.skipNonAssessmentObjectives();
    const state = system.getState();
    // All non-assessment objectives should be completed
    for (const obj of state.objectives) {
      if (!obj.isAssessment) {
        expect(obj.completed).toBe(true);
      }
    }
    // Current should be an assessment objective
    const current = system.getCurrentObjective();
    expect(current).not.toBeNull();
    expect(current!.isAssessment).toBe(true);
  });

  it('marks intro shown', () => {
    expect(system.getState().introShown).toBe(false);
    system.markIntroShown();
    expect(system.getState().introShown).toBe(true);
  });

  it('disposes cleanly without errors', () => {
    system.dispose();
    // Events after dispose should not cause errors
    eventBus.emit({
      type: 'location_visited',
      locationId: 'loc1',
      locationName: 'Town Square',
    });
    expect(system.getCurrentObjective()!.id).toBe('tut_movement');
  });

  describe('without assessment', () => {
    beforeEach(() => {
      eventBus = new GameEventBus();
      system = new TutorialQuestSystem(eventBus, makeConfig({ includeAssessment: false }));
    });

    it('has fewer objectives', () => {
      const withAssessment = buildTutorialObjectives(true);
      const state = system.getState();
      expect(state.objectives.length).toBeLessThan(withAssessment.length);
    });

    it('contains no assessment objectives', () => {
      const state = system.getState();
      expect(state.objectives.every(o => !o.isAssessment)).toBe(true);
    });
  });
});
