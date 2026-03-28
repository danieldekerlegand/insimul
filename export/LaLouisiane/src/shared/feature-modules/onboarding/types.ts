/**
 * Onboarding Module — Generic Types
 *
 * Abstracts the language-learning 10-step onboarding into a composable
 * step sequence. Each feature module can contribute onboarding steps;
 * the genre bundle defines the default order.
 */

import type { ModuleOnboardingStep } from '../types';

// ---------------------------------------------------------------------------
// Step types (extensible by modules)
// ---------------------------------------------------------------------------

/** Built-in step types. Modules can add custom types. */
export type CoreStepType =
  | 'narrative'       // cinematic, story intro
  | 'movement'        // walk/look/interact tutorial
  | 'ui'              // UI panel tutorials
  | 'interaction'     // object/NPC interaction tutorial
  | 'assessment'      // assessment phase
  | 'custom';         // module-defined

// ---------------------------------------------------------------------------
// Onboarding definition
// ---------------------------------------------------------------------------

export interface OnboardingDefinition {
  id: string;
  name: string;
  /** Genre this onboarding is designed for. */
  genre: string;
  /** Estimated total duration in minutes. */
  estimatedDurationMinutes: number;
  /** Ordered sequence of steps. */
  steps: ModuleOnboardingStep[];
}

// ---------------------------------------------------------------------------
// Player onboarding state
// ---------------------------------------------------------------------------

export interface OnboardingProgress {
  playerId: string;
  worldId: string;
  definitionId: string;
  /** IDs of completed steps. */
  completedSteps: string[];
  /** ID of the current step (or null if done). */
  currentStepId: string | null;
  /** Whether the full onboarding is complete. */
  isComplete: boolean;
  startedAt: number;
  completedAt?: number;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

export interface OnboardingConfig {
  /** The onboarding definition to use. */
  definition?: OnboardingDefinition;
  /** Whether onboarding is mandatory. */
  mandatory?: boolean;
  /** Whether individual steps can be revisited after completion. */
  allowRevisit?: boolean;
}

// ---------------------------------------------------------------------------
// Core onboarding steps (available to all genres)
// ---------------------------------------------------------------------------

export const CORE_ONBOARDING_STEPS: ModuleOnboardingStep[] = [
  {
    id: 'arrival_cinematic',
    type: 'narrative',
    name: 'Welcome',
    description: 'Introduction to the world',
    skippable: true,
    estimatedDurationSeconds: 60,
    prerequisites: [],
    config: {},
  },
  {
    id: 'movement_tutorial',
    type: 'movement',
    name: 'Movement Tutorial',
    description: 'Learn to walk, look around, and interact',
    skippable: true,
    estimatedDurationSeconds: 90,
    prerequisites: ['arrival_cinematic'],
    config: {},
  },
  {
    id: 'interaction_tutorial',
    type: 'interaction',
    name: 'Interaction Tutorial',
    description: 'Learn to examine objects and talk to NPCs',
    skippable: true,
    estimatedDurationSeconds: 120,
    prerequisites: ['movement_tutorial'],
    config: {},
  },
  {
    id: 'ui_tutorial',
    type: 'ui',
    name: 'UI Tutorial',
    description: 'Learn to use the game interface',
    skippable: true,
    estimatedDurationSeconds: 60,
    prerequisites: ['interaction_tutorial'],
    config: {},
  },
  {
    id: 'onboarding_complete',
    type: 'narrative',
    name: 'Ready to Play',
    description: 'Onboarding complete — begin your adventure',
    skippable: false,
    estimatedDurationSeconds: 30,
    prerequisites: ['ui_tutorial'],
    config: {},
  },
];
