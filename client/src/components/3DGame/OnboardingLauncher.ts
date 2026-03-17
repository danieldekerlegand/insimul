/**
 * OnboardingLauncher — Wires AssessmentEngine + OnboardingManager into BabylonGame.
 *
 * Detects first playthrough for language-learning worlds, dynamically imports
 * assessment/onboarding modules, and orchestrates the onboarding flow.
 * On completion, stores the CEFR level and sets effectiveFluency.
 */

import type { GameEventBus } from '@/components/3DGame/GameEventBus.ts';

import type { AssessmentModalConfig } from '@/components/3DGame/AssessmentModalUI.ts';

// Lazy-loaded module types (resolved when sibling branches merge)
type AssessmentEngine = {
  start(config: {
    assessmentType: string;
    playerId: string;
    worldId: string;
    targetLanguage: string;
  }): Promise<void>;
  onPhaseStarted(cb: (phaseId: string, phaseIndex: number, timeRemainingSeconds?: number) => void): void;
  onPhaseCompleted(cb: (phaseId: string, score: number, maxScore: number) => void): void;
  onCompleted(cb: (result: AssessmentResult) => void): void;
  onShowInstruction(cb: (config: {
    phaseId: string;
    phaseName: string;
    phaseIndex: number;
    totalPhases: number;
    description: string;
    isConversational: boolean;
    onContinue: () => void;
  }) => void): void;
  onHideInstruction(cb: () => void): void;
  onShowModal(cb: (config: AssessmentModalConfig) => void): void;
  onHideModal(cb: () => void): void;
  resolveCurrentPhase(): void;
  dispose(): void;
};

type OnboardingManager = {
  start(config: {
    playerId: string;
    worldId: string;
    onStepStarted?: (stepId: string, stepIndex: number, totalSteps: number) => void;
    onStepCompleted?: (stepId: string, stepIndex: number, totalSteps: number, durationMs: number) => void;
    onCompleted?: (totalSteps: number, totalDurationMs: number) => void;
  }): Promise<void>;
  completeCurrentStep(): void;
  dispose(): void;
};

export interface AssessmentResult {
  sessionId: string;
  totalScore: number;
  totalMaxScore: number;
  cefrLevel: string;
  dimensionScores?: Record<string, number>;
}

export interface OnboardingLauncherDeps {
  eventBus: GameEventBus;
  worldId: string;
  playerId: string;
  authToken: string;
  targetLanguage: string;
  guiManager: {
    advancedTexture: any;
    showToast(opts: { title: string; description?: string; variant?: string; duration?: number }): void;
  };
}

export interface OnboardingLaunchResult {
  cefrLevel: string;
  totalScore: number;
  totalMaxScore: number;
  dimensionScores?: Record<string, number>;
}

/**
 * Check whether this is the player's first playthrough in the given world.
 * Queries the assessment API — if no prior completed assessment exists, it's a first run.
 */
export async function isFirstPlaythrough(
  worldId: string,
  playerId: string,
  authToken: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/assessments/player/${playerId}?worldId=${encodeURIComponent(worldId)}`,
      { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} },
    );
    if (!res.ok) return true; // If endpoint not available yet, treat as first run
    const sessions = await res.json();
    // If there's a completed arrival assessment, player has done onboarding before
    const hasCompleted = Array.isArray(sessions) && sessions.some(
      (s: any) => s.assessmentType === 'arrival' && s.status === 'complete',
    );
    return !hasCompleted;
  } catch {
    // Network error or module not deployed — default to first playthrough
    return true;
  }
}

/**
 * Detect whether a world is a language-learning world based on world data.
 */
export function isLanguageLearningWorld(worldData: any): boolean {
  if (!worldData) return false;
  const gameType = (worldData.gameType || '').toLowerCase();
  const worldType = (worldData.worldType || '').toLowerCase();
  return (
    gameType === 'language-learning' ||
    gameType.includes('language') ||
    worldType.includes('language') ||
    !!worldData.targetLanguage
  );
}

/**
 * Extract the target language from world data.
 */
export function getTargetLanguage(worldData: any): string {
  if (!worldData) return 'Spanish';
  return worldData.targetLanguage || 'Spanish';
}

/**
 * Launch the onboarding flow. Dynamically imports assessment/onboarding modules
 * so the game still works if those modules aren't available yet.
 *
 * Returns the assessment result on completion, or null if onboarding was skipped.
 */
export async function launchOnboarding(
  deps: OnboardingLauncherDeps,
): Promise<OnboardingLaunchResult | null> {
  const { eventBus, worldId, playerId, authToken, targetLanguage, guiManager } = deps;

  // Dynamic imports — these modules exist on sibling branches
  let AssessmentEngineClass: any;
  let OnboardingManagerClass: any;
  let AssessmentProgressUIClass: any;
  let AssessmentModalUIClass: any;
  let languageOnboarding: any;

  try {
    [
      { AssessmentEngine: AssessmentEngineClass },
      { OnboardingManager: OnboardingManagerClass },
      { AssessmentProgressUI: AssessmentProgressUIClass },
      { AssessmentModalUI: AssessmentModalUIClass },
      { LANGUAGE_LEARNING_ONBOARDING: languageOnboarding },
    ] = await Promise.all([
      import('@/components/3DGame/AssessmentEngine.ts'),
      import('@/components/3DGame/OnboardingManager.ts'),
      import('@/components/3DGame/AssessmentProgressUI.ts'),
      import('@/components/3DGame/AssessmentModalUI.ts'),
      import('@shared/onboarding/language-onboarding.ts'),
    ]);
  } catch (err) {
    console.warn('[OnboardingLauncher] Assessment/onboarding modules not available:', err);
    guiManager.showToast({
      title: 'Welcome!',
      description: 'Onboarding modules loading... Starting game directly.',
      duration: 3000,
    });
    return null;
  }

  // Create progress UI (small corner panel with phase dots + timer).
  let progressUI: any = null;
  try {
    progressUI = new AssessmentProgressUIClass(guiManager.advancedTexture);
  } catch (err) {
    console.warn('[OnboardingLauncher] Failed to create assessment progress UI:', err);
  }

  // Create modal UI for reading/writing/listening sections
  let modalUI: any = null;
  try {
    modalUI = new AssessmentModalUIClass();
  } catch (err) {
    console.warn('[OnboardingLauncher] Failed to create assessment modal UI:', err);
  }

  // Create assessment engine with event bus for conversation detection
  const assessmentEngine: AssessmentEngine = new AssessmentEngineClass({
    authToken,
    targetLanguage,
    eventBus,
  });

  // Track current phase so we can advance the progress UI correctly
  let currentPhaseIndex = 0;

  assessmentEngine.onPhaseStarted((phaseId, phaseIndex, timeRemainingSeconds) => {
    currentPhaseIndex = phaseIndex;
    progressUI?.show();
    progressUI?.setPhase(phaseIndex, timeRemainingSeconds ?? 0);
    eventBus.emit({
      type: 'assessment_phase_started',
      sessionId: '',
      instrumentId: 'arrival_encounter',
      phase: phaseId,
      phaseId,
      phaseIndex,
    });
  });

  assessmentEngine.onPhaseCompleted((phaseId, score, maxScore) => {
    // Advance to the next phase index in the progress UI
    progressUI?.transitionToNextPhase?.(currentPhaseIndex + 1, 0);
    eventBus.emit({
      type: 'assessment_phase_completed',
      sessionId: '',
      instrumentId: 'arrival_encounter',
      phase: phaseId,
      phaseId,
      score,
      maxScore,
    });
  });

  // Wire instruction callbacks — conversation phase shows instruction overlay
  assessmentEngine.onShowInstruction((config) => {
    if (config.isConversational) {
      progressUI?.setStatusText('Walk to the marked NPC');
    } else {
      progressUI?.setStatusText(config.phaseName || 'In progress...');
    }
  });

  assessmentEngine.onHideInstruction(() => {
    // No overlay to hide
  });

  // Wire modal callbacks — reading/writing/listening phases show modal UI
  assessmentEngine.onShowModal((config: AssessmentModalConfig) => {
    if (modalUI && guiManager.advancedTexture) {
      progressUI?.setStatusText(config.phaseName || 'In progress...');
      modalUI.show(guiManager.advancedTexture, config);
    }
  });

  assessmentEngine.onHideModal(() => {
    modalUI?.hide();
  });

  // Return a promise that resolves when the full onboarding completes
  return new Promise<OnboardingLaunchResult | null>((resolve) => {
    let assessmentResult: AssessmentResult | null = null;

    assessmentEngine.onCompleted((result) => {
      assessmentResult = result;
      // Show completion status instead of hiding the panel
      progressUI?.setStatusText('Assessment complete!');

      // Complete onboarding so the game continues.
      onboardingManager.completeCurrentStep();

      eventBus.emit({
        type: 'assessment_completed',
        sessionId: result.sessionId,
        instrumentId: 'arrival_encounter',
        totalScore: result.totalScore,
        totalMaxScore: result.totalMaxScore,
        cefrLevel: result.cefrLevel,
      });

      // Store CEFR level on the server
      storeCefrLevel(worldId, playerId, authToken, result.cefrLevel, result.totalScore, result.totalMaxScore);
    });

    // Create and start onboarding manager
    const onboardingManager: OnboardingManager = new OnboardingManagerClass(languageOnboarding);

    onboardingManager.start({
      playerId,
      worldId,
      onStepStarted: (stepId, stepIndex, totalSteps) => {
        eventBus.emit({
          type: 'onboarding_step_started',
          stepId,
          stepIndex,
          totalSteps,
        });
      },
      onStepCompleted: (stepId, stepIndex, totalSteps, durationMs) => {
        eventBus.emit({
          type: 'onboarding_step_completed',
          stepId,
          stepIndex,
          totalSteps,
          durationMs,
        });
      },
      onCompleted: (totalSteps, totalDurationMs) => {
        eventBus.emit({
          type: 'onboarding_completed',
          totalSteps,
          totalDurationMs,
        });

        // Clean up
        assessmentEngine.dispose();
        onboardingManager.dispose();
        progressUI?.dispose();
        modalUI?.dispose();


        if (assessmentResult) {
          resolve({
            cefrLevel: assessmentResult.cefrLevel,
            totalScore: assessmentResult.totalScore,
            totalMaxScore: assessmentResult.totalMaxScore,
            dimensionScores: assessmentResult.dimensionScores,
          });
        } else {
          resolve(null);
        }
      },
    });

    // Start assessment engine
    assessmentEngine.start({
      assessmentType: 'arrival',
      playerId,
      worldId,
      targetLanguage,
    }).catch((err: unknown) => {
      console.error('[OnboardingLauncher] Assessment engine failed to start:', err);
      assessmentEngine.dispose();
      onboardingManager.dispose();
      progressUI?.dispose();
      modalUI?.dispose();
      resolve(null);
    });

    eventBus.emit({
      type: 'assessment_started',
      sessionId: '',
      instrumentId: 'arrival_encounter',
      phase: 'arrival_reading',
      participantId: playerId,
      assessmentType: 'arrival',
      playerId,
    });
  });
}

/**
 * Persist the player's CEFR level and effective fluency to the server.
 */
async function storeCefrLevel(
  worldId: string,
  playerId: string,
  authToken: string,
  cefrLevel: string,
  totalScore: number,
  totalMaxScore: number,
): Promise<void> {
  // Map CEFR to an effectiveFluency percentage (0-100)
  const cefrToFluency: Record<string, number> = {
    A1: 10,
    A2: 25,
    B1: 50,
    B2: 75,
  };
  const effectiveFluency = cefrToFluency[cefrLevel] ?? 10;

  try {
    await fetch(`/api/worlds/${worldId}/players/${playerId}/language-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        cefrLevel,
        effectiveFluency,
        assessmentScore: totalScore,
        assessmentMaxScore: totalMaxScore,
      }),
    });
    console.log('[OnboardingLauncher] CEFR level stored:', cefrLevel, 'fluency:', effectiveFluency);
  } catch (err) {
    console.warn('[OnboardingLauncher] Failed to store CEFR level:', err);
  }
}
