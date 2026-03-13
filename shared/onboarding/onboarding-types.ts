/**
 * Generic Onboarding Framework Types
 *
 * Genre-agnostic types for defining and tracking multi-step
 * onboarding sequences. Steps can be narrative, movement tutorials,
 * interactions, assessments, UI tutorials, combat tutorials, or custom.
 */

/** Step types that an onboarding sequence can contain. */
export type OnboardingStepType =
  | 'narrative'
  | 'movement'
  | 'interaction'
  | 'assessment'
  | 'ui'
  | 'combat'
  | 'custom';

/** Condition that must be met to complete a step. */
export interface StepCompletionCondition {
  /** Type of condition check. */
  type: 'auto' | 'event' | 'position' | 'interaction' | 'timer' | 'assessment_complete' | 'custom';
  /** Identifier for event/interaction/custom conditions. */
  eventId?: string;
  /** Target position for position-based conditions. */
  target?: { x: number; y: number; z: number };
  /** Radius for position-based conditions. */
  radius?: number;
  /** Duration in seconds for timer-based conditions. */
  duration?: number;
}

/** A single step in an onboarding sequence. */
export interface OnboardingStep {
  /** Unique identifier for this step. */
  id: string;
  /** Step type determines how the step is presented and handled. */
  type: OnboardingStepType;
  /** Display title for the step. */
  title: string;
  /** Instructions or narrative text. Supports template strings (e.g. {{playerName}}). */
  description: string;
  /** Order within the onboarding sequence (ascending). */
  order: number;
  /** Whether this step can be skipped by the player. */
  skippable: boolean;
  /** Condition that completes this step. */
  completionCondition: StepCompletionCondition;
  /** IDs of steps that must be completed before this one. Empty means no prerequisites. */
  prerequisites: string[];
  /** Optional reference to an assessment definition ID (for assessment steps). */
  assessmentId?: string;
  /** Optional hint text shown if the player is stuck. */
  hint?: string;
  /** Arbitrary metadata for genre-specific or custom step data. */
  metadata?: Record<string, unknown>;
}

/** Defines a complete onboarding sequence. */
export interface OnboardingDefinition {
  /** Unique identifier for this onboarding definition. */
  id: string;
  /** Display name. */
  name: string;
  /** Description of what this onboarding covers. */
  description: string;
  /** Genre this onboarding is designed for, or 'generic' for genre-agnostic. */
  genre: string;
  /** Ordered list of steps. */
  steps: OnboardingStep[];
  /** Whether this onboarding is required before normal gameplay. */
  required: boolean;
  /** Estimated duration in minutes. */
  estimatedMinutes?: number;
  /** Version for migration/compatibility. */
  version: number;
}

/** Completion status of an individual step. */
export type StepStatus = 'locked' | 'available' | 'active' | 'completed' | 'skipped';

/** Runtime state of a single onboarding step. */
export interface StepState {
  /** References OnboardingStep.id. */
  stepId: string;
  /** Current status. */
  status: StepStatus;
  /** When the step was started (ISO string), null if not started. */
  startedAt: string | null;
  /** When the step was completed/skipped (ISO string), null if not finished. */
  completedAt: string | null;
  /** Step-specific progress data (e.g. distance moved, items collected). */
  progressData?: Record<string, unknown>;
}

/** Runtime state of an entire onboarding sequence. */
export interface OnboardingState {
  /** References OnboardingDefinition.id. */
  definitionId: string;
  /** Player/session this state belongs to. */
  playerId: string;
  /** World context. */
  worldId: string;
  /** Per-step state, keyed by step ID. */
  steps: Record<string, StepState>;
  /** ID of the currently active step, null if onboarding hasn't started or is complete. */
  currentStepId: string | null;
  /** Overall onboarding status. */
  status: 'not_started' | 'in_progress' | 'completed';
  /** When the onboarding was started (ISO string). */
  startedAt: string | null;
  /** When the onboarding was completed (ISO string). */
  completedAt: string | null;
}

/** Create initial OnboardingState from a definition. */
export function createOnboardingState(
  definition: OnboardingDefinition,
  playerId: string,
  worldId: string,
): OnboardingState {
  const steps: Record<string, StepState> = {};

  for (const step of definition.steps) {
    const isAvailable = step.prerequisites.length === 0;
    steps[step.id] = {
      stepId: step.id,
      status: isAvailable ? 'available' : 'locked',
      startedAt: null,
      completedAt: null,
    };
  }

  return {
    definitionId: definition.id,
    playerId,
    worldId,
    steps,
    currentStepId: null,
    status: 'not_started',
    startedAt: null,
    completedAt: null,
  };
}

/** Get the next available step from an onboarding state. */
export function getNextAvailableStep(
  definition: OnboardingDefinition,
  state: OnboardingState,
): OnboardingStep | null {
  const sorted = [...definition.steps].sort((a, b) => a.order - b.order);

  for (const step of sorted) {
    const stepState = state.steps[step.id];
    if (stepState && stepState.status === 'available') {
      return step;
    }
  }

  return null;
}

/** Check if all steps are completed or skipped. */
export function isOnboardingComplete(state: OnboardingState): boolean {
  return Object.values(state.steps).every(
    s => s.status === 'completed' || s.status === 'skipped',
  );
}

/** Unlock steps whose prerequisites are now satisfied. */
export function unlockAvailableSteps(
  definition: OnboardingDefinition,
  state: OnboardingState,
): string[] {
  const unlocked: string[] = [];

  for (const step of definition.steps) {
    const stepState = state.steps[step.id];
    if (!stepState || stepState.status !== 'locked') continue;

    const allPrereqsMet = step.prerequisites.every(prereqId => {
      const prereqState = state.steps[prereqId];
      return prereqState && (prereqState.status === 'completed' || prereqState.status === 'skipped');
    });

    if (allPrereqsMet) {
      stepState.status = 'available';
      unlocked.push(step.id);
    }
  }

  return unlocked;
}
