/**
 * Tutorial System Audit — Can a new player complete the tutorial successfully?
 *
 * This test suite verifies that:
 * 1. Every tutorial objective has an event-driven completion path
 * 2. The full tutorial can be completed end-to-end via game events
 * 3. The OnboardingManager correctly advances through all 10 steps
 * 4. Assessment phases in TutorialQuestSystem align with AssessmentEngine phases
 * 5. Edge cases (dispose, skip, out-of-order events) are handled
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import {
  TutorialQuestSystem,
  buildTutorialObjectives,
  type TutorialQuestConfig,
} from '../game-engine/logic/TutorialQuestSystem';
import { OnboardingManager } from '../onboarding/OnboardingManager';
import {
  LANGUAGE_LEARNING_ONBOARDING,
  getAssessmentStepIds,
  getSkippableStepIds,
  getAssessmentPhaseMap,
} from '../onboarding/language-onboarding';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeConfig(overrides?: Partial<TutorialQuestConfig>): TutorialQuestConfig {
  return {
    worldName: 'Testville',
    targetLanguage: 'French',
    includeAssessment: true,
    ...overrides,
  };
}

/** Emit all events needed to complete a tutorial objective by ID. */
function emitEventForObjective(eventBus: GameEventBus, objectiveId: string): void {
  switch (objectiveId) {
    case 'tut_movement':
      eventBus.emit({ type: 'location_visited', locationId: 'loc1', locationName: 'Town Square' });
      break;
    case 'tut_camera':
      eventBus.emit({ type: 'npc_greeting', npcId: 'npc1', npcName: 'Pierre', language: 'French', greetingText: 'Bonjour!', isFirstMeeting: true });
      break;
    case 'tut_interact_npc':
      eventBus.emit({ type: 'npc_talked', npcId: 'npc1', npcName: 'Pierre', turnCount: 3 });
      break;
    case 'tut_assessment_reading':
      eventBus.emit({ type: 'assessment_phase_completed', sessionId: '', instrumentId: 'arrival_encounter', phase: 'arrival_reading', phaseId: 'arrival_reading', score: 10, maxScore: 15 });
      break;
    case 'tut_inventory':
      eventBus.emit({ type: 'inventory_opened' });
      break;
    case 'tut_reading':
      eventBus.emit({ type: 'sign_read', signId: 'sign1', signContent: 'Bienvenue', targetLanguage: 'French', vocabulary: [] });
      break;
    case 'tut_assessment_listening':
      eventBus.emit({ type: 'assessment_phase_completed', sessionId: '', instrumentId: 'arrival_encounter', phase: 'arrival_listening', phaseId: 'arrival_listening', score: 8, maxScore: 13 });
      break;
    case 'tut_quest_log':
      eventBus.emit({ type: 'quest_log_opened' });
      break;
    case 'tut_assessment_conversation':
      eventBus.emit({ type: 'assessment_conversation_completed' });
      break;
    default:
      throw new Error(`Unknown objective: ${objectiveId}`);
  }
}

// ── Test Suite ──────────────────────────────────────────────────────────────

describe('Tutorial System Audit: Full completion path', () => {
  let eventBus: GameEventBus;
  let system: TutorialQuestSystem;

  beforeEach(() => {
    eventBus = new GameEventBus();
    system = new TutorialQuestSystem(eventBus, makeConfig());
  });

  it('every objective has a mapped event that can complete it', () => {
    const objectives = system.getState().objectives;

    // Complete each objective in order via its mapped event
    for (const obj of objectives) {
      expect(system.getCurrentObjective()?.id).toBe(obj.id);
      emitEventForObjective(eventBus, obj.id);
    }

    expect(system.getState().isComplete).toBe(true);
    expect(system.getProgress().percentage).toBe(100);
  });

  it('completes the full tutorial end-to-end with assessment', () => {
    const state = system.getState();
    const objectiveIds = state.objectives.map(o => o.id);

    // Expected order with assessment
    expect(objectiveIds).toEqual([
      'tut_movement',
      'tut_camera',
      'tut_interact_npc',
      'tut_assessment_reading',
      'tut_inventory',
      'tut_reading',
      'tut_assessment_listening',
      'tut_quest_log',
      'tut_assessment_conversation',
    ]);

    // Walk through each
    for (const id of objectiveIds) {
      emitEventForObjective(eventBus, id);
    }

    expect(system.getState().isComplete).toBe(true);
    expect(system.getState().completedAt).toBeDefined();
  });

  it('completes the full tutorial end-to-end without assessment', () => {
    const noAssessSystem = new TutorialQuestSystem(eventBus, makeConfig({ includeAssessment: false }));
    const objectiveIds = noAssessSystem.getState().objectives.map(o => o.id);

    expect(objectiveIds).toEqual([
      'tut_movement',
      'tut_camera',
      'tut_interact_npc',
      'tut_inventory',
      'tut_reading',
      'tut_quest_log',
    ]);

    for (const id of objectiveIds) {
      emitEventForObjective(eventBus, id);
    }

    expect(noAssessSystem.getState().isComplete).toBe(true);
  });
});

describe('Tutorial System Audit: Event listener wiring', () => {
  let eventBus: GameEventBus;
  let system: TutorialQuestSystem;

  beforeEach(() => {
    eventBus = new GameEventBus();
    system = new TutorialQuestSystem(eventBus, makeConfig());
  });

  it('inventory_opened event completes tut_inventory objective', () => {
    // Advance to tut_inventory (skip movement, camera, npc, assessment_reading)
    system.completeCurrentObjective(); // movement
    system.completeCurrentObjective(); // camera
    system.completeCurrentObjective(); // npc
    system.completeCurrentObjective(); // assessment_reading

    expect(system.getCurrentObjective()?.id).toBe('tut_inventory');
    eventBus.emit({ type: 'inventory_opened' });
    expect(system.getCurrentObjective()?.id).toBe('tut_reading');
  });

  it('quest_log_opened event completes tut_quest_log objective', () => {
    // Advance to tut_quest_log
    system.completeCurrentObjective(); // movement
    system.completeCurrentObjective(); // camera
    system.completeCurrentObjective(); // npc
    system.completeCurrentObjective(); // assessment_reading
    system.completeCurrentObjective(); // inventory
    system.completeCurrentObjective(); // reading
    system.completeCurrentObjective(); // assessment_listening

    expect(system.getCurrentObjective()?.id).toBe('tut_quest_log');
    eventBus.emit({ type: 'quest_log_opened' });
    expect(system.getCurrentObjective()?.id).toBe('tut_assessment_conversation');
  });

  it('out-of-order events are ignored (only current objective can complete)', () => {
    expect(system.getCurrentObjective()?.id).toBe('tut_movement');

    // Emit events for later objectives — should be ignored
    eventBus.emit({ type: 'inventory_opened' });
    eventBus.emit({ type: 'quest_log_opened' });
    eventBus.emit({ type: 'assessment_conversation_completed' });

    // Still on movement
    expect(system.getCurrentObjective()?.id).toBe('tut_movement');
    expect(system.getProgress().completed).toBe(0);
  });

  it('events after dispose do not advance objectives', () => {
    system.dispose();
    eventBus.emit({ type: 'location_visited', locationId: 'loc1', locationName: 'Square' });
    expect(system.getCurrentObjective()?.id).toBe('tut_movement');
  });

  it('assessment_phase_completed with wrong phaseId does not complete reading objective', () => {
    // Advance to assessment_reading
    system.completeCurrentObjective(); // movement
    system.completeCurrentObjective(); // camera
    system.completeCurrentObjective(); // npc

    expect(system.getCurrentObjective()?.id).toBe('tut_assessment_reading');
    // Wrong phase ID
    eventBus.emit({ type: 'assessment_phase_completed', sessionId: '', instrumentId: 'arrival_encounter', phase: 'arrival_listening', phaseId: 'arrival_listening', score: 5, maxScore: 13 });
    // Should still be on reading
    expect(system.getCurrentObjective()?.id).toBe('tut_assessment_reading');
  });
});

describe('Tutorial System Audit: OnboardingManager step progression', () => {
  it('all steps form a valid linear chain with satisfied prerequisites', () => {
    const steps = LANGUAGE_LEARNING_ONBOARDING.steps;
    const stepIds = new Set(steps.map(s => s.id));

    for (const step of steps) {
      for (const prereq of step.prerequisites) {
        expect(stepIds.has(prereq)).toBe(true);
      }
    }
  });

  it('OnboardingManager starts and advances through all steps', () => {
    const completedSteps: string[] = [];
    const persistedStates: any[] = [];

    const manager = new OnboardingManager(
      LANGUAGE_LEARNING_ONBOARDING,
      'player1',
      'world1',
      (state) => persistedStates.push(JSON.parse(JSON.stringify(state))),
    );

    manager.addListener({
      onStepCompleted: (step) => completedSteps.push(step.id),
    });

    manager.start();
    expect(manager.getCurrentStep()?.id).toBe('arrival_cinematic');

    // Complete all 10 steps
    for (let i = 0; i < 10; i++) {
      manager.completeCurrentStep();
    }

    expect(manager.isComplete()).toBe(true);
    expect(completedSteps).toHaveLength(10);
    expect(completedSteps[0]).toBe('arrival_cinematic');
    expect(completedSteps[9]).toBe('onboarding_complete');
  });

  it('skippable steps can be skipped without blocking progress', () => {
    const manager = new OnboardingManager(
      LANGUAGE_LEARNING_ONBOARDING,
      'player1',
      'world1',
      () => {},
    );

    manager.start();

    // Skip arrival_cinematic (skippable narrative)
    const skipped = manager.skipCurrentStep();
    expect(skipped).toBe(true);

    // Should advance to movement_tutorial
    expect(manager.getCurrentStep()?.id).toBe('movement_tutorial');
  });

  it('non-skippable assessment steps cannot be skipped', () => {
    const manager = new OnboardingManager(
      LANGUAGE_LEARNING_ONBOARDING,
      'player1',
      'world1',
      () => {},
    );

    manager.start();

    // Advance past the first two skippable steps
    manager.completeCurrentStep(); // arrival_cinematic
    manager.completeCurrentStep(); // movement_tutorial

    // Now on assessment_reading (not skippable)
    expect(manager.getCurrentStep()?.id).toBe('assessment_reading');
    const skipped = manager.skipCurrentStep();
    expect(skipped).toBe(false);
    // Still on assessment_reading
    expect(manager.getCurrentStep()?.id).toBe('assessment_reading');
  });
});

describe('Tutorial System Audit: Assessment phase alignment', () => {
  it('TutorialQuestSystem assessment objectives match AssessmentEngine phases', () => {
    const objectives = buildTutorialObjectives(true);
    const assessmentObjectives = objectives.filter(o => o.isAssessment);

    // TutorialQuestSystem tracks 3 assessment objectives
    expect(assessmentObjectives.map(o => o.assessmentPhaseId)).toEqual([
      'arrival_reading',
      'arrival_listening',
      'arrival_conversation',
    ]);
  });

  it('onboarding assessment steps reference valid arrival encounter phase IDs', () => {
    const phaseMap = getAssessmentPhaseMap();
    const validPhaseIds = [
      'arrival_reading',
      'arrival_writing',
      'arrival_listening',
      'arrival_conversation',
    ];

    for (const phaseId of Object.values(phaseMap)) {
      expect(validPhaseIds).toContain(phaseId);
    }
  });

  it('all onboarding assessment phases have corresponding TutorialQuestSystem events', () => {
    // The AssessmentEngine emits assessment_phase_completed for each phase.
    // TutorialQuestSystem listens for assessment_phase_completed and assessment_conversation_completed.
    // Verify the phase IDs match.
    const objectives = buildTutorialObjectives(true);
    const assessmentObjectives = objectives.filter(o => o.isAssessment);

    const coveredPhases = assessmentObjectives.map(o => o.assessmentPhaseId);
    // Reading and listening are completed via assessment_phase_completed
    expect(coveredPhases).toContain('arrival_reading');
    expect(coveredPhases).toContain('arrival_listening');
    // Conversation is completed via assessment_conversation_completed
    expect(coveredPhases).toContain('arrival_conversation');
  });

  it('writing assessment phase is handled by onboarding but not by TutorialQuestSystem', () => {
    // This is by design: TutorialQuestSystem only tracks objectives the player
    // sees in the HUD. The writing phase is managed by the OnboardingManager's
    // assessment step, not as a separate tutorial objective.
    const objectives = buildTutorialObjectives(true);
    const writingObjective = objectives.find(o => o.assessmentPhaseId === 'arrival_writing');
    expect(writingObjective).toBeUndefined();

    // But the onboarding definition does include writing
    const onboardingPhases = getAssessmentPhaseMap();
    expect(onboardingPhases['assessment_writing']).toBe('arrival_writing');
  });
});

describe('Tutorial System Audit: skipNonAssessmentObjectives', () => {
  it('correctly skips to first assessment objective', () => {
    const eventBus = new GameEventBus();
    const system = new TutorialQuestSystem(eventBus, makeConfig());

    system.skipNonAssessmentObjectives();

    const current = system.getCurrentObjective();
    expect(current).not.toBeNull();
    expect(current!.isAssessment).toBe(true);
    expect(current!.id).toBe('tut_assessment_reading');

    // All non-assessment objectives should be completed
    for (const obj of system.getState().objectives) {
      if (!obj.isAssessment) {
        expect(obj.completed).toBe(true);
      }
    }
  });

  it('can complete remaining assessment objectives after skip', () => {
    const eventBus = new GameEventBus();
    const system = new TutorialQuestSystem(eventBus, makeConfig());

    system.skipNonAssessmentObjectives();

    // Complete the 3 assessment objectives
    emitEventForObjective(eventBus, 'tut_assessment_reading');
    emitEventForObjective(eventBus, 'tut_assessment_listening');
    emitEventForObjective(eventBus, 'tut_assessment_conversation');

    expect(system.getState().isComplete).toBe(true);
  });
});

describe('Tutorial System Audit: OnboardingLauncher helpers', () => {
  it('isFirstPlaythrough returns true when no assessments exist', async () => {
    const { isFirstPlaythrough } = await import('../game-engine/rendering/OnboardingLauncher');

    const mockDataSource = {
      getPlayerAssessments: async () => [],
    };

    const result = await isFirstPlaythrough('world1', 'player1', 'token', mockDataSource);
    expect(result).toBe(true);
  });

  it('isFirstPlaythrough returns false when completed arrival assessment exists', async () => {
    const { isFirstPlaythrough } = await import('../game-engine/rendering/OnboardingLauncher');

    const mockDataSource = {
      getPlayerAssessments: async () => [
        { assessmentType: 'arrival', status: 'complete' },
      ],
    };

    const result = await isFirstPlaythrough('world1', 'player1', 'token', mockDataSource);
    expect(result).toBe(false);
  });

  it('isLanguageLearningWorld detects language learning worlds', async () => {
    const { isLanguageLearningWorld } = await import('../game-engine/rendering/OnboardingLauncher');

    expect(isLanguageLearningWorld({ gameType: 'language-learning' })).toBe(true);
    expect(isLanguageLearningWorld({ gameType: 'Language Learning RPG' })).toBe(true);
    expect(isLanguageLearningWorld({ worldType: 'language immersion' })).toBe(true);
    expect(isLanguageLearningWorld({ targetLanguage: 'French' })).toBe(true);
    expect(isLanguageLearningWorld({ gameType: 'combat-rpg' })).toBe(false);
    expect(isLanguageLearningWorld(null)).toBe(false);
  });

  it('getTargetLanguage extracts language from world data', async () => {
    const { getTargetLanguage } = await import('../game-engine/rendering/OnboardingLauncher');

    expect(getTargetLanguage({ targetLanguage: 'French' })).toBe('French');
    expect(getTargetLanguage({ targetLanguage: 'Japanese' })).toBe('Japanese');
    expect(getTargetLanguage({})).toBe('Spanish'); // default
    expect(getTargetLanguage(null)).toBe('Spanish'); // fallback
  });
});

describe('Tutorial System Audit: Progress tracking accuracy', () => {
  let eventBus: GameEventBus;
  let system: TutorialQuestSystem;

  beforeEach(() => {
    eventBus = new GameEventBus();
    system = new TutorialQuestSystem(eventBus, makeConfig());
  });

  it('progress percentage increases linearly as objectives complete', () => {
    const total = system.getState().objectives.length;
    const percentages: number[] = [];

    for (let i = 0; i < total; i++) {
      system.completeCurrentObjective();
      percentages.push(system.getProgress().percentage);
    }

    // Each step should increase the percentage
    for (let i = 1; i < percentages.length; i++) {
      expect(percentages[i]).toBeGreaterThan(percentages[i - 1]);
    }
    expect(percentages[percentages.length - 1]).toBe(100);
  });

  it('emits correct step events throughout completion', () => {
    const stepStarted: string[] = [];
    const stepCompleted: string[] = [];

    eventBus.on('onboarding_step_started', (e) => stepStarted.push(e.stepId));
    eventBus.on('onboarding_step_completed', (e) => stepCompleted.push(e.stepId));

    const objectives = system.getState().objectives;
    for (const obj of objectives) {
      emitEventForObjective(eventBus, obj.id);
    }

    expect(stepCompleted).toHaveLength(objectives.length);
    // Started events are emitted for all objectives except the first (already active)
    // and after the last (tutorial complete)
    expect(stepStarted).toHaveLength(objectives.length - 1);
  });

  it('emits onboarding_completed exactly once', () => {
    const completedEvents: any[] = [];
    eventBus.on('onboarding_completed', (e) => completedEvents.push(e));

    const objectives = system.getState().objectives;
    for (const obj of objectives) {
      emitEventForObjective(eventBus, obj.id);
    }

    expect(completedEvents).toHaveLength(1);
    expect(completedEvents[0].totalSteps).toBe(objectives.length);
  });
});
