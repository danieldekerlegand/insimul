/**
 * AssessmentEngine — Interactive assessment adapter.
 *
 * Goes through 4 assessment phases (Conversational, Listening, Writing, Visual).
 * The conversational phase waits for the player to complete an NPC conversation.
 * Other phases show instructions and wait for a Continue button click (placeholder
 * until full task UIs are built).
 *
 * Fires phase/instruction events so the UI layer can show overlays, and produces
 * an AssessmentResult with CEFR level on completion.
 */

import type { AssessmentResult } from './OnboardingLauncher';
import type { GameEventBus } from './GameEventBus';

// Phase definitions derived from ARRIVAL_ENCOUNTER
const ASSESSMENT_PHASES = [
  {
    id: 'arrival_conversational',
    name: 'Conversational Assessment',
    maxScore: 25,
    isConversational: true,
    description: 'Walk up to a nearby NPC and have a conversation in the target language. Speak naturally — this measures your starting level.',
  },
  {
    id: 'arrival_listening',
    name: 'Listening Comprehension',
    maxScore: 7,
    isConversational: false,
    description: 'Listen carefully to locals speaking the target language. Follow directions and answer comprehension questions.',
  },
  {
    id: 'arrival_writing',
    name: 'Writing Assessment',
    maxScore: 11,
    isConversational: false,
    description: 'Complete a short writing task: fill out a visitor form and write a brief message in the target language.',
  },
  {
    id: 'arrival_visual',
    name: 'Visual Recognition',
    maxScore: 10,
    isConversational: false,
    description: 'Read signs and identify labeled objects around the city in the target language.',
  },
] as const;

const TOTAL_MAX_SCORE = ASSESSMENT_PHASES.reduce((sum, p) => sum + p.maxScore, 0);

export class AssessmentEngine {
  private authToken: string;
  private targetLanguage: string;
  private eventBus: GameEventBus | null;
  private _onPhaseStarted?: (phaseId: string, phaseIndex: number, timeRemainingSeconds: number) => void;
  private _onPhaseCompleted?: (phaseId: string, score: number, maxScore: number) => void;
  private _onCompleted?: (result: AssessmentResult) => void;
  private _onShowInstruction?: (config: {
    phaseId: string;
    phaseName: string;
    phaseIndex: number;
    totalPhases: number;
    description: string;
    isConversational: boolean;
    onContinue: () => void;
  }) => void;
  private _onHideInstruction?: () => void;
  private _aborted = false;
  private _phaseResolver: (() => void) | null = null;
  private _unsubscribeConversation: (() => void) | null = null;

  constructor(config: { authToken: string; targetLanguage: string; eventBus?: GameEventBus }) {
    this.authToken = config.authToken;
    this.targetLanguage = config.targetLanguage;
    this.eventBus = config.eventBus ?? null;
  }

  async start(config: {
    assessmentType: string;
    playerId: string;
    worldId: string;
    targetLanguage: string;
  }): Promise<void> {
    console.log('[AssessmentEngine] Starting assessment —', config.assessmentType, 'for', config.targetLanguage);

    let totalScore = 0;
    const phaseScores: Array<{ phaseId: string; score: number; maxScore: number }> = [];

    for (let i = 0; i < ASSESSMENT_PHASES.length; i++) {
      if (this._aborted) return;

      const phase = ASSESSMENT_PHASES[i];
      console.log(`[AssessmentEngine] Phase ${i + 1}/${ASSESSMENT_PHASES.length}: ${phase.name}`);

      // Fire phase started event (0 duration = interactive, no countdown timer)
      this._onPhaseStarted?.(phase.id, i, 0);

      // Show instruction overlay and wait for player action
      if (phase.isConversational) {
        await this._waitForConversation(phase, i);
      } else {
        await this._waitForContinue(phase, i);
      }

      if (this._aborted) return;

      // Generate a baseline score — slightly randomized around 40-70% of max
      const scorePct = 0.35 + Math.random() * 0.35;
      const score = Math.round(phase.maxScore * scorePct * 10) / 10;
      totalScore += score;
      phaseScores.push({ phaseId: phase.id, score, maxScore: phase.maxScore });

      console.log(`[AssessmentEngine] Phase ${phase.name} complete: ${score}/${phase.maxScore}`);
      this._onHideInstruction?.();
      this._onPhaseCompleted?.(phase.id, score, phase.maxScore);
    }

    if (this._aborted) return;

    // Compute CEFR level from total score percentage
    const totalPct = (totalScore / TOTAL_MAX_SCORE) * 100;
    const cefrLevel = totalPct >= 80 ? 'B2' : totalPct >= 60 ? 'B1' : totalPct >= 40 ? 'A2' : 'A1';

    // Compute dimension scores
    const dimensionScores: Record<string, number> = {
      vocabulary: 1.5 + Math.random() * 2.5,
      grammar: 1.5 + Math.random() * 2,
      fluency: 1.5 + Math.random() * 2,
      pronunciation: 2 + Math.random() * 2,
      comprehension: 2 + Math.random() * 2.5,
    };
    for (const key of Object.keys(dimensionScores)) {
      dimensionScores[key] = Math.round(dimensionScores[key] * 10) / 10;
    }

    const result: AssessmentResult = {
      sessionId: `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      totalScore: Math.round(totalScore * 10) / 10,
      totalMaxScore: TOTAL_MAX_SCORE,
      cefrLevel,
      dimensionScores,
    };

    console.log(`[AssessmentEngine] Assessment complete — CEFR: ${cefrLevel}, Score: ${result.totalScore}/${TOTAL_MAX_SCORE}`);
    this._onCompleted?.(result);
  }

  // ── Callback registration ──────────────────────────────────────────────────

  onPhaseStarted(cb: (phaseId: string, phaseIndex: number, timeRemainingSeconds: number) => void): void {
    this._onPhaseStarted = cb;
  }

  onPhaseCompleted(cb: (phaseId: string, score: number, maxScore: number) => void): void {
    this._onPhaseCompleted = cb;
  }

  onCompleted(cb: (result: AssessmentResult) => void): void {
    this._onCompleted = cb;
  }

  onShowInstruction(cb: typeof this._onShowInstruction): void {
    this._onShowInstruction = cb;
  }

  onHideInstruction(cb: () => void): void {
    this._onHideInstruction = cb;
  }

  /** Called externally to resolve the current phase (used by instruction overlay Continue button). */
  resolveCurrentPhase(): void {
    if (this._phaseResolver) {
      this._phaseResolver();
      this._phaseResolver = null;
    }
  }

  dispose(): void {
    this._aborted = true;
    // Resolve any pending phase promise to prevent leaks
    if (this._phaseResolver) {
      this._phaseResolver();
      this._phaseResolver = null;
    }
    if (this._unsubscribeConversation) {
      this._unsubscribeConversation();
      this._unsubscribeConversation = null;
    }
    this._onPhaseStarted = undefined;
    this._onPhaseCompleted = undefined;
    this._onCompleted = undefined;
    this._onShowInstruction = undefined;
    this._onHideInstruction = undefined;
  }

  // ── Private: phase waiting strategies ──────────────────────────────────────

  private _waitForConversation(
    phase: typeof ASSESSMENT_PHASES[number],
    phaseIndex: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      this._phaseResolver = resolve;

      // Show instruction overlay
      this._onShowInstruction?.({
        phaseId: phase.id,
        phaseName: phase.name,
        phaseIndex,
        totalPhases: ASSESSMENT_PHASES.length,
        description: phase.description,
        isConversational: true,
        onContinue: () => {
          // Not used for conversational — resolved via event bus
        },
      });

      // Listen for conversation completion on the event bus
      if (this.eventBus) {
        this._unsubscribeConversation = this.eventBus.on(
          'assessment_conversation_completed',
          () => {
            console.log('[AssessmentEngine] Conversation completed — advancing phase');
            if (this._unsubscribeConversation) {
              this._unsubscribeConversation();
              this._unsubscribeConversation = null;
            }
            if (this._phaseResolver) {
              this._phaseResolver();
              this._phaseResolver = null;
            }
          },
        );
      }
    });
  }

  private _waitForContinue(
    phase: typeof ASSESSMENT_PHASES[number],
    phaseIndex: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      this._phaseResolver = resolve;

      // Show instruction overlay with Continue button
      this._onShowInstruction?.({
        phaseId: phase.id,
        phaseName: phase.name,
        phaseIndex,
        totalPhases: ASSESSMENT_PHASES.length,
        description: phase.description,
        isConversational: false,
        onContinue: () => {
          if (this._phaseResolver) {
            this._phaseResolver();
            this._phaseResolver = null;
          }
        },
      });
    });
  }
}
