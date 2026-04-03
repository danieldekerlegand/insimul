/**
 * Tutorial Quest System
 *
 * Manages a unified tutorial+assessment quest for first-time players.
 * Tutorial quests have special properties: persistent HUD hints, highlighted
 * UI elements, forced camera focus, and cannot be abandoned.
 *
 * The tutorial interleaves control-teaching objectives with language assessment
 * phases. Each tutorial step emits events that the ContextualHintSystem and
 * HUD overlay consume.
 */

import type { GameEventBus } from './GameEventBus';

// ── Types ────────────────────────────────────────────────────────────────────

export type TutorialStepType =
  | 'movement'
  | 'camera'
  | 'interaction'
  | 'inventory'
  | 'reading'
  | 'quest_log'
  | 'assessment_reading'
  | 'assessment_listening'
  | 'assessment_conversation';

export interface TutorialObjective {
  id: string;
  type: TutorialStepType;
  title: string;
  description: string;
  /** Key binding hint shown in HUD (e.g., "WASD", "Mouse", "E") */
  controlHint: string;
  /** UI element to highlight during this step */
  highlightElement?: string;
  /** Whether this step is an assessment phase (not skippable) */
  isAssessment: boolean;
  /** Assessment phase ID if this is an assessment step */
  assessmentPhaseId?: string;
  completed: boolean;
}

export interface TutorialQuestState {
  questId: string;
  questType: 'tutorial';
  title: string;
  description: string;
  objectives: TutorialObjective[];
  currentObjectiveIndex: number;
  startedAt: string;
  completedAt?: string;
  /** Whether the intro cutscene has been shown */
  introShown: boolean;
  /** Whether the tutorial has been completed this playthrough */
  isComplete: boolean;
}

export interface TutorialQuestConfig {
  worldName: string;
  targetLanguage: string;
  /** Whether to include assessment phases or just tutorial objectives */
  includeAssessment: boolean;
}

// ── Tutorial Objective Definitions ──────────────────────────────────────────

export function buildTutorialObjectives(includeAssessment: boolean): TutorialObjective[] {
  const objectives: TutorialObjective[] = [
    {
      id: 'tut_movement',
      type: 'movement',
      title: 'Walk to the town square',
      description: 'Use WASD keys to move around. Walk to the marked location.',
      controlHint: 'WASD to move',
      isAssessment: false,
      completed: false,
    },
    {
      id: 'tut_camera',
      type: 'camera',
      title: 'Look around',
      description: 'Move the mouse to look around your surroundings.',
      controlHint: 'Move mouse to look',
      isAssessment: false,
      completed: false,
    },
    {
      id: 'tut_interact_npc',
      type: 'interaction',
      title: 'Talk to the welcome NPC',
      description: 'Walk up to the nearby NPC and press E to start a conversation.',
      controlHint: 'E to interact',
      highlightElement: 'interaction_prompt',
      isAssessment: false,
      completed: false,
    },
  ];

  if (includeAssessment) {
    objectives.push({
      id: 'tut_assessment_reading',
      type: 'assessment_reading',
      title: 'Reading Assessment',
      description: 'Read the passage and answer comprehension questions.',
      controlHint: 'Click to answer',
      isAssessment: true,
      assessmentPhaseId: 'arrival_reading',
      completed: false,
    });
  }

  objectives.push({
    id: 'tut_inventory',
    type: 'inventory',
    title: 'Open your inventory',
    description: 'Press I to open your inventory and see your items.',
    controlHint: 'I to open inventory',
    highlightElement: 'inventory_panel',
    isAssessment: false,
    completed: false,
  });

  objectives.push({
    id: 'tut_reading',
    type: 'reading',
    title: 'Read the notice board',
    description: 'Find a notice board and press E to read it.',
    controlHint: 'E to read',
    highlightElement: 'notice_board',
    isAssessment: false,
    completed: false,
  });

  if (includeAssessment) {
    objectives.push({
      id: 'tut_assessment_listening',
      type: 'assessment_listening',
      title: 'Listening Assessment',
      description: 'Listen to the passage and answer questions.',
      controlHint: 'Click to answer',
      isAssessment: true,
      assessmentPhaseId: 'arrival_listening',
      completed: false,
    });
  }

  objectives.push({
    id: 'tut_quest_log',
    type: 'quest_log',
    title: 'Open your quest log',
    description: 'Press J to open your quest log and track your objectives.',
    controlHint: 'J to open quest log',
    highlightElement: 'quest_log',
    isAssessment: false,
    completed: false,
  });

  if (includeAssessment) {
    objectives.push({
      id: 'tut_assessment_conversation',
      type: 'assessment_conversation',
      title: 'Conversation Assessment',
      description: 'Have a guided conversation with the NPC to assess your speaking ability.',
      controlHint: 'Type to respond',
      isAssessment: true,
      assessmentPhaseId: 'arrival_conversation',
      completed: false,
    });
  }

  return objectives;
}

// ── Tutorial Quest System ───────────────────────────────────────────────────

export class TutorialQuestSystem {
  private state: TutorialQuestState;
  private eventBus: GameEventBus;
  private disposed = false;
  private unsubscribers: Array<() => void> = [];

  constructor(eventBus: GameEventBus, config: TutorialQuestConfig) {
    this.eventBus = eventBus;
    const objectives = buildTutorialObjectives(config.includeAssessment);

    this.state = {
      questId: `tutorial_${Date.now()}`,
      questType: 'tutorial',
      title: `Welcome to ${config.worldName}`,
      description: `Learn the basics and ${config.includeAssessment ? 'complete your language assessment' : 'explore your surroundings'}.`,
      objectives,
      currentObjectiveIndex: 0,
      startedAt: new Date().toISOString(),
      introShown: false,
      isComplete: false,
    };

    this.wireEventListeners();
  }

  getState(): Readonly<TutorialQuestState> {
    return this.state;
  }

  getCurrentObjective(): TutorialObjective | null {
    if (this.state.isComplete) return null;
    return this.state.objectives[this.state.currentObjectiveIndex] ?? null;
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const completed = this.state.objectives.filter(o => o.completed).length;
    const total = this.state.objectives.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  markIntroShown(): void {
    this.state.introShown = true;
  }

  /**
   * Complete the current objective and advance to the next one.
   * Returns the next objective, or null if the tutorial is complete.
   */
  completeCurrentObjective(): TutorialObjective | null {
    if (this.disposed || this.state.isComplete) return null;

    const current = this.state.objectives[this.state.currentObjectiveIndex];
    if (!current || current.completed) return null;

    current.completed = true;

    this.eventBus.emit({
      type: 'onboarding_step_completed',
      stepId: current.id,
      stepIndex: this.state.currentObjectiveIndex,
      totalSteps: this.state.objectives.length,
      durationMs: 0,
    });

    // Advance to next uncompleted objective (skip already-completed ones from skipNonAssessmentObjectives)
    this.state.currentObjectiveIndex++;
    while (
      this.state.currentObjectiveIndex < this.state.objectives.length &&
      this.state.objectives[this.state.currentObjectiveIndex].completed
    ) {
      this.state.currentObjectiveIndex++;
    }

    if (this.state.currentObjectiveIndex >= this.state.objectives.length) {
      this.state.isComplete = true;
      this.state.completedAt = new Date().toISOString();
      this.eventBus.emit({
        type: 'onboarding_completed',
        totalSteps: this.state.objectives.length,
        totalDurationMs: Date.now() - new Date(this.state.startedAt).getTime(),
      });
      return null;
    }

    const next = this.state.objectives[this.state.currentObjectiveIndex];
    this.eventBus.emit({
      type: 'onboarding_step_started',
      stepId: next.id,
      stepIndex: this.state.currentObjectiveIndex,
      totalSteps: this.state.objectives.length,
    });

    return next;
  }

  /**
   * Complete a specific objective by ID (for event-driven completion).
   */
  completeObjectiveById(objectiveId: string): boolean {
    const idx = this.state.objectives.findIndex(o => o.id === objectiveId);
    if (idx === -1) return false;
    if (this.state.objectives[idx].completed) return false;

    // Only complete if it's the current objective
    if (idx !== this.state.currentObjectiveIndex) return false;

    this.completeCurrentObjective();
    return true;
  }

  /**
   * Skip all non-assessment tutorial objectives (used when player
   * selects their CEFR level manually instead of doing the full tutorial).
   */
  skipNonAssessmentObjectives(): void {
    for (const obj of this.state.objectives) {
      if (!obj.isAssessment && !obj.completed) {
        obj.completed = true;
      }
    }
    // Find next uncompleted objective
    const nextIdx = this.state.objectives.findIndex(o => !o.completed);
    if (nextIdx === -1) {
      this.state.isComplete = true;
      this.state.completedAt = new Date().toISOString();
    } else {
      this.state.currentObjectiveIndex = nextIdx;
    }
  }

  private wireEventListeners(): void {
    // Movement — complete when player visits a location
    this.unsubscribers.push(
      this.eventBus.on('location_visited', () => {
        this.completeObjectiveById('tut_movement');
      }),
    );

    // Camera look — complete on first NPC greeting (implies player looked around)
    this.unsubscribers.push(
      this.eventBus.on('npc_greeting', () => {
        this.completeObjectiveById('tut_camera');
      }),
    );

    // NPC interaction
    this.unsubscribers.push(
      this.eventBus.on('npc_talked', () => {
        this.completeObjectiveById('tut_interact_npc');
      }),
    );

    // Inventory — opened inventory panel
    this.unsubscribers.push(
      this.eventBus.on('inventory_opened', () => {
        this.completeObjectiveById('tut_inventory');
      }),
    );

    // Reading — notice board or sign read
    this.unsubscribers.push(
      this.eventBus.on('sign_read', () => {
        this.completeObjectiveById('tut_reading');
      }),
    );

    // Quest log — opened quest log panel
    this.unsubscribers.push(
      this.eventBus.on('quest_log_opened', () => {
        this.completeObjectiveById('tut_quest_log');
      }),
    );

    // Assessment phases completed
    this.unsubscribers.push(
      this.eventBus.on('assessment_phase_completed', (event) => {
        if (event.phaseId === 'arrival_reading') {
          this.completeObjectiveById('tut_assessment_reading');
        } else if (event.phaseId === 'arrival_listening') {
          this.completeObjectiveById('tut_assessment_listening');
        }
      }),
    );

    // Assessment conversation completed
    this.unsubscribers.push(
      this.eventBus.on('assessment_conversation_completed', () => {
        this.completeObjectiveById('tut_assessment_conversation');
      }),
    );
  }

  dispose(): void {
    this.disposed = true;
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
