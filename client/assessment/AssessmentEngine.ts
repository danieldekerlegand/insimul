/**
 * Assessment Engine State Machine
 *
 * Orchestrates multi-phase assessment encounters through a state machine:
 *   idle → initializing → phase_active ↔ phase_transitioning → scoring → complete
 *
 * Manages phase lifecycle via callbacks, collects RecordingReferences,
 * and computes total score + CEFR level on completion.
 */

import type {
  AssessmentDefinition,
  AssessmentPhase,
  AssessmentSession,
  AssessmentStatus,
  AutomatedMetrics,
  CEFRLevel,
  PhaseResult,
  RecordingReference,
  TaskResult,
} from '../../shared/assessment/assessment-types';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Handler interface that phase-specific controllers must implement. */
export interface PhaseHandler {
  /** Initialize the phase (load assets, set up UI, etc.) */
  initialize(phase: AssessmentPhase, session: AssessmentSession): Promise<void>;
  /** Start the phase interaction */
  start(): Promise<void>;
  /** Abort the phase early */
  abort(): void;
  /** Get the completed phase result */
  getResult(): PhaseResult;
}

/** Factory that creates a PhaseHandler for a given phase definition. */
export type PhaseHandlerFactory = (phase: AssessmentPhase) => PhaseHandler;

export interface AssessmentEngineCallbacks {
  onStatusChange?: (status: AssessmentStatus, previousStatus: AssessmentStatus) => void;
  onPhaseStarted?: (phase: AssessmentPhase, index: number) => void;
  onPhaseCompleted?: (result: PhaseResult, index: number) => void;
  onRecordingAdded?: (recording: RecordingReference) => void;
  onComplete?: (session: AssessmentSession) => void;
  onError?: (error: Error) => void;
}

export interface AssessmentEngineConfig {
  playerId: string;
  worldId: string;
  definition: AssessmentDefinition;
  phaseHandlerFactory: PhaseHandlerFactory;
  callbacks?: AssessmentEngineCallbacks;
}

// ─── Valid state transitions ─────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<AssessmentStatus, AssessmentStatus[]> = {
  idle: ['initializing'],
  initializing: ['phase_active', 'idle'],
  phase_active: ['phase_transitioning', 'scoring'],
  phase_transitioning: ['phase_active', 'scoring'],
  scoring: ['complete'],
  complete: ['idle'],
};

// ─── CEFR mapping ────────────────────────────────────────────────────────────

/** Map percentage score to CEFR level. */
function scoreToCEFR(percentage: number): CEFRLevel {
  if (percentage >= 80) return 'B2';
  if (percentage >= 60) return 'B1';
  if (percentage >= 40) return 'A2';
  return 'A1';
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class AssessmentEngine {
  private _status: AssessmentStatus = 'idle';
  private _session: AssessmentSession;
  private _recordings: RecordingReference[] = [];
  private _phaseResults: PhaseResult[] = [];
  private _currentPhaseIndex = -1;
  private _currentHandler: PhaseHandler | null = null;

  private readonly _definition: AssessmentDefinition;
  private readonly _handlerFactory: PhaseHandlerFactory;
  private readonly _callbacks: AssessmentEngineCallbacks;

  constructor(config: AssessmentEngineConfig) {
    this._definition = config.definition;
    this._handlerFactory = config.phaseHandlerFactory;
    this._callbacks = config.callbacks ?? {};

    this._session = {
      id: this._generateId(),
      playerId: config.playerId,
      worldId: config.worldId,
      assessmentDefinitionId: config.definition.id,
      assessmentType: config.definition.type,
      targetLanguage: config.definition.targetLanguage,
      status: 'idle',
      phaseResults: [],
      totalMaxPoints: config.definition.totalMaxPoints,
      createdAt: new Date().toISOString(),
    };
  }

  // ─── Public getters ────────────────────────────────────────────────────────

  get status(): AssessmentStatus { return this._status; }
  get session(): Readonly<AssessmentSession> { return this._session; }
  get currentPhaseIndex(): number { return this._currentPhaseIndex; }
  get recordings(): ReadonlyArray<RecordingReference> { return this._recordings; }
  get phaseResults(): ReadonlyArray<PhaseResult> { return this._phaseResults; }

  get currentPhase(): AssessmentPhase | null {
    if (this._currentPhaseIndex < 0 || this._currentPhaseIndex >= this._definition.phases.length) {
      return null;
    }
    return this._definition.phases[this._currentPhaseIndex];
  }

  // ─── State machine controls ────────────────────────────────────────────────

  /** Initialize the assessment and begin the first phase. */
  async start(): Promise<void> {
    this._transition('initializing');
    this._session.startedAt = new Date().toISOString();
    this._currentPhaseIndex = 0;

    try {
      await this._startCurrentPhase();
    } catch (err) {
      this._handleError(err);
    }
  }

  /** Signal that the current phase is complete with its result. */
  async completePhase(result: PhaseResult): Promise<void> {
    if (this._status !== 'phase_active') {
      throw new Error(`Cannot complete phase: status is ${this._status}`);
    }

    // Collect phase result and recordings
    this._phaseResults.push(result);
    if (result.recordings) {
      for (const rec of result.recordings) {
        this._addRecording(rec);
      }
    }

    this._callbacks.onPhaseCompleted?.(result, this._currentPhaseIndex);

    // Determine next step
    const nextIndex = this._currentPhaseIndex + 1;
    if (nextIndex < this._definition.phases.length) {
      this._transition('phase_transitioning');
      this._currentPhaseIndex = nextIndex;
      try {
        await this._startCurrentPhase();
      } catch (err) {
        this._handleError(err);
      }
    } else {
      // All phases done — move to scoring
      await this._score();
    }
  }

  /** Add a recording reference to the session. */
  addRecording(recording: RecordingReference): void {
    if (this._status !== 'phase_active') {
      throw new Error(`Cannot add recording: status is ${this._status}`);
    }
    this._addRecording(recording);
  }

  /** Abort the assessment (force-returns to idle). */
  abort(): void {
    if (this._status === 'idle' || this._status === 'complete') return;

    if (this._currentHandler) {
      this._currentHandler.abort();
      this._currentHandler = null;
    }

    // Force transition — abort is valid from any active state
    const prev = this._status;
    this._status = 'idle';
    this._session.status = 'idle';
    this._callbacks.onStatusChange?.('idle', prev);
  }

  /** Reset engine for reuse with same config. */
  reset(): void {
    if (this._currentHandler) {
      this._currentHandler.abort();
      this._currentHandler = null;
    }

    this._status = 'idle';
    this._currentPhaseIndex = -1;
    this._phaseResults = [];
    this._recordings = [];
    this._session = {
      ...this._session,
      id: this._generateId(),
      status: 'idle',
      phaseResults: [],
      totalScore: undefined,
      cefrLevel: undefined,
      dimensionScores: undefined,
      automatedMetrics: undefined,
      recordings: undefined,
      startedAt: undefined,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
    };
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private _transition(to: AssessmentStatus): void {
    const allowed = VALID_TRANSITIONS[this._status];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid transition: ${this._status} → ${to}`);
    }
    const prev = this._status;
    this._status = to;
    this._session.status = to;
    this._callbacks.onStatusChange?.(to, prev);
  }

  private async _startCurrentPhase(): Promise<void> {
    const phase = this._definition.phases[this._currentPhaseIndex];
    const handler = this._handlerFactory(phase);
    this._currentHandler = handler;

    await handler.initialize(phase, this._session);
    this._transition('phase_active');
    this._callbacks.onPhaseStarted?.(phase, this._currentPhaseIndex);
    await handler.start();
  }

  private async _score(): Promise<void> {
    this._transition('scoring');

    const totalScore = this._phaseResults.reduce((sum, r) => sum + r.score, 0);
    const percentage = this._definition.totalMaxPoints > 0
      ? (totalScore / this._definition.totalMaxPoints) * 100
      : 0;

    // Aggregate dimension scores
    const dimensionScores = this._aggregateDimensionScores();

    // Aggregate automated metrics
    const automatedMetrics = this._aggregateAutomatedMetrics();

    // Determine CEFR level
    const cefrLevel = scoreToCEFR(percentage);

    // Finalize session
    this._session.phaseResults = [...this._phaseResults];
    this._session.totalScore = totalScore;
    this._session.cefrLevel = cefrLevel;
    this._session.dimensionScores = dimensionScores;
    this._session.automatedMetrics = automatedMetrics;
    this._session.recordings = [...this._recordings];
    this._session.completedAt = new Date().toISOString();

    this._transition('complete');
    this._callbacks.onComplete?.(this._session);
  }

  private _aggregateDimensionScores(): Record<string, number> {
    const totals: Record<string, { sum: number; count: number }> = {};

    for (const result of this._phaseResults) {
      if (!result.dimensionScores) continue;
      for (const [dim, score] of Object.entries(result.dimensionScores)) {
        if (!totals[dim]) totals[dim] = { sum: 0, count: 0 };
        totals[dim].sum += score;
        totals[dim].count++;
      }
    }

    const averages: Record<string, number> = {};
    for (const [dim, { sum, count }] of Object.entries(totals)) {
      averages[dim] = Math.round((sum / count) * 10) / 10;
    }
    return averages;
  }

  private _aggregateAutomatedMetrics(): AutomatedMetrics | undefined {
    const metricsArray = this._phaseResults
      .map(r => r.automatedMetrics)
      .filter((m): m is AutomatedMetrics => m != null);

    if (metricsArray.length === 0) return undefined;

    const avg = (vals: (number | undefined)[]): number | undefined => {
      const defined = vals.filter((v): v is number => v != null);
      if (defined.length === 0) return undefined;
      return Math.round((defined.reduce((a, b) => a + b, 0) / defined.length) * 10) / 10;
    };

    const sum = (vals: (number | undefined)[]): number | undefined => {
      const defined = vals.filter((v): v is number => v != null);
      if (defined.length === 0) return undefined;
      return defined.reduce((a, b) => a + b, 0);
    };

    return {
      wpm: avg(metricsArray.map(m => m.wpm)),
      ttr: avg(metricsArray.map(m => m.ttr)),
      mlu: avg(metricsArray.map(m => m.mlu)),
      avgLatencyMs: avg(metricsArray.map(m => m.avgLatencyMs)),
      repairs: sum(metricsArray.map(m => m.repairs)),
      codeSwitchingCount: sum(metricsArray.map(m => m.codeSwitchingCount)),
    };
  }

  private _addRecording(recording: RecordingReference): void {
    this._recordings.push(recording);
    this._callbacks.onRecordingAdded?.(recording);
  }

  private _handleError(err: unknown): void {
    const error = err instanceof Error ? err : new Error(String(err));
    this._callbacks.onError?.(error);
    // Attempt to return to idle on error
    try {
      if (this._status !== 'idle' && this._status !== 'complete') {
        this._status = 'idle';
        this._session.status = 'idle';
      }
    } catch {
      // Already in a safe state
    }
  }

  private _generateId(): string {
    return `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
