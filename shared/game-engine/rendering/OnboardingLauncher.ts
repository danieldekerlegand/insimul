/**
 * OnboardingLauncher — Wires AssessmentEngine + OnboardingManager into BabylonGame.
 *
 * Detects first playthrough for language-learning worlds, dynamically imports
 * assessment/onboarding modules, and orchestrates the onboarding flow.
 * On completion, stores the CEFR level and sets effectiveFluency.
 */

import type { GameEventBus } from '@shared/game-engine/logic/GameEventBus';

import type { AssessmentModalConfig } from '@shared/game-engine/rendering/AssessmentModalUI';

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
  dataSource?: any;
  prologEngine?: any;
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
  dataSource?: any,
): Promise<boolean> {
  try {
    if (!dataSource) throw new Error('No dataSource — save file not loaded');
    const assessments = await dataSource.getPlayerAssessments(playerId, worldId);
    const hasCompleted = Array.isArray(assessments) && assessments.some(
      (s: any) => s.assessmentType === 'arrival' && s.status === 'complete',
    );
    return !hasCompleted;
  } catch {
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
 * Look up an item's translation for a given language from the translations dict.
 * Returns `{ targetWord, pronunciation, category }` or null if not translated.
 */
export function getItemTranslation(
  item: { translations?: Record<string, { targetWord: string; pronunciation: string; category: string }> | null },
  language: string,
): { targetWord: string; pronunciation: string; category: string } | null {
  if (!item.translations || !language) return null;
  return (item.translations as Record<string, any>)[language] ?? null;
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
  let AssessmentModalUIClass: any;
  let languageOnboarding: any;

  try {
    [
      { AssessmentEngine: AssessmentEngineClass },
      { OnboardingManager: OnboardingManagerClass },
      { AssessmentModalUI: AssessmentModalUIClass },
      { LANGUAGE_LEARNING_ONBOARDING: languageOnboarding },
    ] = await Promise.all([
      import('@shared/game-engine/logic/AssessmentEngine'),
      import('@shared/game-engine/logic/OnboardingManager'),
      import('@shared/game-engine/rendering/AssessmentModalUI'),
      import('@shared/onboarding/language-onboarding'),
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

  // Create modal UI for reading/writing/listening sections
  let modalUI: any = null;
  try {
    modalUI = new AssessmentModalUIClass();
  } catch (err) {
    console.warn('[OnboardingLauncher] Failed to create assessment modal UI:', err);
  }

  // Create assessment engine with event bus and Prolog engine for fact assertion
  const assessmentEngine: AssessmentEngine = new AssessmentEngineClass({
    authToken,
    targetLanguage,
    eventBus,
    prologEngine: deps.prologEngine ?? null,
  });

  // Track current phase so we can advance the progress UI correctly
  let currentPhaseIndex = 0;

  assessmentEngine.onPhaseStarted((phaseId, phaseIndex, timeRemainingSeconds) => {
    currentPhaseIndex = phaseIndex;
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
    eventBus.emit({
      type: 'assessment_phase_completed',
      sessionId: '',
      instrumentId: 'arrival_encounter',
      phase: phaseId,
      phaseId,
      score,
      maxScore,
    });

    // TODO: Update quest objective progress via playthrough delta layer, not world data.
    // For now, phase completion is tracked via assessment events only.
  });

  // Wire instruction callbacks
  assessmentEngine.onShowInstruction(() => {});
  assessmentEngine.onHideInstruction(() => {});

  // Wire modal callbacks — reading/writing/listening phases defer until user clicks
  let pendingModalConfig: AssessmentModalConfig | null = null;

  const showPendingModal = () => {
    if (pendingModalConfig && modalUI && guiManager.advancedTexture) {
      modalUI.show(guiManager.advancedTexture, pendingModalConfig);
    }
  };

  assessmentEngine.onShowModal((config: AssessmentModalConfig) => {
    pendingModalConfig = config;
    // Auto-show the modal immediately (no progress UI to click)
    showPendingModal();
  });

  assessmentEngine.onHideModal(() => {
    pendingModalConfig = null;
    modalUI?.hide();
  });

  // Find the existing assessment quest (created in the world editor) so it appears in the quest log (J key)
  const assessmentQuestId = await findAssessmentQuest(worldId, authToken, deps.dataSource);

  // Return a promise that resolves when the full onboarding completes
  return new Promise<OnboardingLaunchResult | null>((resolve) => {
    let assessmentResult: AssessmentResult | null = null;

    assessmentEngine.onCompleted(async (result) => {
      assessmentResult = result;

      // Store CEFR level before completing onboarding so it persists before game continues
      await storeCefrLevel(worldId, playerId, authToken, result.cefrLevel, result.totalScore, result.totalMaxScore, deps.dataSource);

      eventBus.emit({
        type: 'assessment_completed',
        sessionId: result.sessionId,
        instrumentId: 'arrival_encounter',
        totalScore: result.totalScore,
        totalMaxScore: result.totalMaxScore,
        cefrLevel: result.cefrLevel,
      });

      // Complete onboarding so the game continues.
      onboardingManager.completeCurrentStep();
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
 * Find the existing Arrival Assessment quest for this world, or return null.
 * The quest should be pre-created in the world editor, not spawned per-playthrough.
 */
async function findAssessmentQuest(
  worldId: string,
  authToken: string,
  dataSource?: any,
): Promise<string | null> {
  try {
    if (!dataSource) throw new Error('No dataSource — save file not loaded');
    const quests = await dataSource.loadQuests(worldId);
    const { isArrivalAssessmentQuest } = await import(
      '@shared/services/assessment-quest-bridge-shared.ts'
    );

    const existing = quests.find((q: any) => isArrivalAssessmentQuest(q));
    if (existing) {
      return existing.id;
    }

    return null;
  } catch (err) {
    console.warn('[OnboardingLauncher] Could not find assessment quest:', err);
    return null;
  }
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
  dataSource?: any,
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
    if (!dataSource) throw new Error('No dataSource — save file not loaded');
    await dataSource.saveLanguageProgress({
      playerId,
      worldId,
      progress: { cefrLevel, effectiveFluency, assessmentScore: totalScore, assessmentMaxScore: totalMaxScore },
      vocabulary: [],
      grammarPatterns: [],
      conversations: [],
    });
  } catch (err) {
    console.warn('[OnboardingLauncher] Failed to store CEFR level:', err);
  }
}
