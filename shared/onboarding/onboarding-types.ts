/**
 * Generic Onboarding Framework Types
 *
 * Genre-agnostic types for defining multi-step onboarding sequences.
 * Steps can be narrative, movement, interaction, assessment, UI, combat, or custom.
 */

export type OnboardingStepType =
  | 'narrative'
  | 'movement'
  | 'interaction'
  | 'assessment'
  | 'ui'
  | 'combat'
  | 'custom';

export type StepState = 'locked' | 'active' | 'completed' | 'skipped';

export interface OnboardingStep {
  id: string;
  type: OnboardingStepType;
  name: string;
  description: string;
  skippable: boolean;
  prerequisites: string[];
  estimatedDurationSeconds?: number;
  /** Reference to an external definition (e.g., assessment phase ID) */
  externalRef?: string;
  /** Arbitrary step-specific configuration */
  config?: Record<string, unknown>;
}

export interface OnboardingDefinition {
  id: string;
  name: string;
  description: string;
  genre: string;
  steps: OnboardingStep[];
  estimatedDurationMinutes: number;
}

export interface StepProgress {
  stepId: string;
  state: StepState;
  startedAt?: string;
  completedAt?: string;
  /** Step-specific result data */
  result?: Record<string, unknown>;
}

export interface OnboardingState {
  definitionId: string;
  playerId: string;
  worldId: string;
  currentStepId: string | null;
  steps: StepProgress[];
  startedAt: string;
  completedAt?: string;
}
