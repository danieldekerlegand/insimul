import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AssessmentEngine,
  type PhaseHandler,
  type PhaseHandlerFactory,
  type AssessmentEngineCallbacks,
} from '../../client/assessment/AssessmentEngine';
import type {
  AssessmentDefinition,
  AssessmentPhase,
  AssessmentSession,
  PhaseResult,
  RecordingReference,
} from '../assessment/assessment-types';

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makePhase(id: string, type: 'reading' | 'writing' | 'listening' | 'conversation' = 'conversation', maxPoints = 25): AssessmentPhase {
  return {
    id,
    type,
    name: `Phase ${id}`,
    description: `Test phase ${id}`,
    tasks: [{ id: `${id}_t1`, type: 'conversation_quest', prompt: 'test', maxPoints, scoringMethod: 'llm' }],
    maxPoints,
    scoringDimensions: ['vocab', 'grammar'],
  };
}

function makeDefinition(phases: AssessmentPhase[] = [makePhase('p1', 'conversation'), makePhase('p2', 'listening', 10)]): AssessmentDefinition {
  return {
    id: 'test-def',
    type: 'arrival',
    name: 'Test Assessment',
    description: 'Test',
    targetLanguage: 'es',
    phases,
    totalMaxPoints: phases.reduce((s, p) => s + p.maxPoints, 0),
    scoringDimensions: [
      { id: 'vocab', name: 'Vocabulary', description: 'Vocab range', minScore: 1, maxScore: 5 },
      { id: 'grammar', name: 'Grammar', description: 'Grammar accuracy', minScore: 1, maxScore: 5 },
    ],
    estimatedMinutes: 15,
  };
}

function makePhaseResult(phaseId: string, score: number, maxPoints: number): PhaseResult {
  return {
    phaseId,
    score,
    maxPoints,
    taskResults: [{ taskId: `${phaseId}_t1`, score, maxPoints }],
    dimensionScores: { vocab: 3.5, grammar: 4.0 },
    automatedMetrics: { wpm: 45, ttr: 0.65, mlu: 6.2, avgLatencyMs: 1200, repairs: 2, codeSwitchingCount: 1 },
  };
}

function createMockHandler(phaseResult?: PhaseResult): PhaseHandler {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    start: vi.fn().mockResolvedValue(undefined),
    abort: vi.fn(),
    getResult: vi.fn(() => phaseResult ?? makePhaseResult('p1', 20, 25)),
  };
}

function createMockFactory(handlers?: PhaseHandler[]): PhaseHandlerFactory {
  let callIndex = 0;
  return vi.fn((_phase: AssessmentPhase) => {
    if (handlers && callIndex < handlers.length) {
      return handlers[callIndex++];
    }
    return createMockHandler();
  });
}

function createEngine(overrides?: {
  definition?: AssessmentDefinition;
  callbacks?: AssessmentEngineCallbacks;
  factory?: PhaseHandlerFactory;
}) {
  const definition = overrides?.definition ?? makeDefinition();
  const factory = overrides?.factory ?? createMockFactory();
  const callbacks = overrides?.callbacks ?? {};

  return new AssessmentEngine({
    playerId: 'player-1',
    worldId: 'world-1',
    definition,
    phaseHandlerFactory: factory,
    callbacks,
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AssessmentEngine', () => {
  describe('initial state', () => {
    it('starts in idle status', () => {
      const engine = createEngine();
      expect(engine.status).toBe('idle');
      expect(engine.currentPhaseIndex).toBe(-1);
      expect(engine.currentPhase).toBeNull();
      expect(engine.recordings).toHaveLength(0);
      expect(engine.phaseResults).toHaveLength(0);
    });

    it('creates a session with correct metadata', () => {
      const engine = createEngine();
      const session = engine.session;
      expect(session.playerId).toBe('player-1');
      expect(session.worldId).toBe('world-1');
      expect(session.assessmentType).toBe('arrival');
      expect(session.targetLanguage).toBe('es');
      expect(session.totalMaxPoints).toBe(35);
      expect(session.status).toBe('idle');
    });
  });

  describe('start()', () => {
    it('transitions idle → initializing → phase_active', async () => {
      const statusChanges: string[] = [];
      const engine = createEngine({
        callbacks: {
          onStatusChange: (status) => statusChanges.push(status),
        },
      });

      await engine.start();
      expect(statusChanges).toContain('initializing');
      expect(statusChanges).toContain('phase_active');
      expect(engine.status).toBe('phase_active');
      expect(engine.currentPhaseIndex).toBe(0);
    });

    it('calls handler initialize and start', async () => {
      const handler = createMockHandler();
      const factory = createMockFactory([handler]);
      const engine = createEngine({ factory });

      await engine.start();
      expect(handler.initialize).toHaveBeenCalledOnce();
      expect(handler.start).toHaveBeenCalledOnce();
    });

    it('fires onPhaseStarted callback', async () => {
      const onPhaseStarted = vi.fn();
      const engine = createEngine({ callbacks: { onPhaseStarted } });

      await engine.start();
      expect(onPhaseStarted).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1' }),
        0,
      );
    });

    it('throws on double start', async () => {
      const engine = createEngine();
      await engine.start();
      await expect(engine.start()).rejects.toThrow('Invalid transition');
    });

    it('sets session startedAt', async () => {
      const engine = createEngine();
      await engine.start();
      expect(engine.session.startedAt).toBeDefined();
    });
  });

  describe('completePhase()', () => {
    it('stores phase result and transitions to next phase', async () => {
      const engine = createEngine();
      await engine.start();

      const result = makePhaseResult('p1', 20, 25);
      await engine.completePhase(result);

      expect(engine.phaseResults).toHaveLength(1);
      expect(engine.phaseResults[0].score).toBe(20);
      expect(engine.currentPhaseIndex).toBe(1);
      expect(engine.status).toBe('phase_active');
    });

    it('fires onPhaseCompleted callback', async () => {
      const onPhaseCompleted = vi.fn();
      const engine = createEngine({ callbacks: { onPhaseCompleted } });
      await engine.start();

      const result = makePhaseResult('p1', 20, 25);
      await engine.completePhase(result);
      expect(onPhaseCompleted).toHaveBeenCalledWith(result, 0);
    });

    it('collects recordings from phase result', async () => {
      const engine = createEngine();
      await engine.start();

      const recording: RecordingReference = {
        storageKey: 'rec-1',
        mimeType: 'audio/webm',
        durationSeconds: 30,
        phaseId: 'p1',
        recordedAt: new Date().toISOString(),
      };

      await engine.completePhase({
        ...makePhaseResult('p1', 20, 25),
        recordings: [recording],
      });

      expect(engine.recordings).toHaveLength(1);
      expect(engine.recordings[0].storageKey).toBe('rec-1');
    });

    it('transitions through phase_transitioning between phases', async () => {
      const statusChanges: string[] = [];
      const engine = createEngine({
        callbacks: {
          onStatusChange: (s) => statusChanges.push(s),
        },
      });

      await engine.start();
      statusChanges.length = 0; // Clear initial transitions

      await engine.completePhase(makePhaseResult('p1', 20, 25));
      expect(statusChanges).toContain('phase_transitioning');
      expect(statusChanges).toContain('phase_active');
    });

    it('throws when not in phase_active', async () => {
      const engine = createEngine();
      await expect(engine.completePhase(makePhaseResult('p1', 20, 25))).rejects.toThrow(
        'Cannot complete phase',
      );
    });
  });

  describe('scoring and completion', () => {
    it('computes total score and CEFR on last phase completion', async () => {
      const engine = createEngine();
      await engine.start();

      await engine.completePhase(makePhaseResult('p1', 20, 25));
      await engine.completePhase(makePhaseResult('p2', 8, 10));

      expect(engine.status).toBe('complete');
      expect(engine.session.totalScore).toBe(28);
      expect(engine.session.totalMaxPoints).toBe(35);
      // 28/35 = 80% → B2
      expect(engine.session.cefrLevel).toBe('B2');
      expect(engine.session.completedAt).toBeDefined();
    });

    it('fires onComplete callback', async () => {
      const onComplete = vi.fn();
      const engine = createEngine({ callbacks: { onComplete } });
      await engine.start();

      await engine.completePhase(makePhaseResult('p1', 20, 25));
      await engine.completePhase(makePhaseResult('p2', 8, 10));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ totalScore: 28, cefrLevel: 'B2' }),
      );
    });

    it('aggregates dimension scores across phases', async () => {
      const engine = createEngine();
      await engine.start();

      await engine.completePhase({
        ...makePhaseResult('p1', 20, 25),
        dimensionScores: { vocab: 4.0, grammar: 3.0 },
      });
      await engine.completePhase({
        ...makePhaseResult('p2', 8, 10),
        dimensionScores: { vocab: 3.0, grammar: 5.0 },
      });

      const dims = engine.session.dimensionScores!;
      expect(dims.vocab).toBe(3.5);
      expect(dims.grammar).toBe(4.0);
    });

    it('aggregates automated metrics across phases', async () => {
      const engine = createEngine();
      await engine.start();

      await engine.completePhase({
        ...makePhaseResult('p1', 20, 25),
        automatedMetrics: { wpm: 40, ttr: 0.6, repairs: 3, codeSwitchingCount: 2 },
      });
      await engine.completePhase({
        ...makePhaseResult('p2', 8, 10),
        automatedMetrics: { wpm: 50, ttr: 0.7, repairs: 1, codeSwitchingCount: 0 },
      });

      const metrics = engine.session.automatedMetrics!;
      expect(metrics.wpm).toBe(45); // avg
      expect(metrics.ttr).toBe(0.6); // avg of 0.6 and 0.7, rounded to 1 decimal
      expect(metrics.repairs).toBe(4); // sum
      expect(metrics.codeSwitchingCount).toBe(2); // sum
    });
  });

  describe('CEFR level mapping', () => {
    async function runWithScores(score: number, maxPoints: number): Promise<string | undefined> {
      const phase = makePhase('p1', 'conversation', maxPoints);
      const engine = createEngine({ definition: makeDefinition([phase]) });
      await engine.start();
      await engine.completePhase(makePhaseResult('p1', score, maxPoints));
      return engine.session.cefrLevel;
    }

    it('maps <40% → A1', async () => {
      expect(await runWithScores(3, 10)).toBe('A1');
    });

    it('maps 40-59% → A2', async () => {
      expect(await runWithScores(5, 10)).toBe('A2');
    });

    it('maps 60-79% → B1', async () => {
      expect(await runWithScores(7, 10)).toBe('B1');
    });

    it('maps ≥80% → B2', async () => {
      expect(await runWithScores(9, 10)).toBe('B2');
    });
  });

  describe('addRecording()', () => {
    it('adds recording during phase_active', async () => {
      const onRecordingAdded = vi.fn();
      const engine = createEngine({ callbacks: { onRecordingAdded } });
      await engine.start();

      const rec: RecordingReference = {
        storageKey: 'rec-2',
        mimeType: 'audio/webm',
        phaseId: 'p1',
        recordedAt: new Date().toISOString(),
      };
      engine.addRecording(rec);

      expect(engine.recordings).toHaveLength(1);
      expect(onRecordingAdded).toHaveBeenCalledWith(rec);
    });

    it('throws when not in phase_active', () => {
      const engine = createEngine();
      expect(() =>
        engine.addRecording({
          storageKey: 'x',
          mimeType: 'audio/webm',
          phaseId: 'p1',
          recordedAt: new Date().toISOString(),
        }),
      ).toThrow('Cannot add recording');
    });
  });

  describe('abort()', () => {
    it('returns to idle and calls handler abort', async () => {
      const handler = createMockHandler();
      const factory = createMockFactory([handler]);
      const engine = createEngine({ factory });

      await engine.start();
      engine.abort();

      expect(engine.status).toBe('idle');
      expect(handler.abort).toHaveBeenCalledOnce();
    });

    it('is safe to call from idle or complete', async () => {
      const engine = createEngine();
      engine.abort(); // from idle — no-op
      expect(engine.status).toBe('idle');
    });
  });

  describe('reset()', () => {
    it('resets engine to initial state for reuse', async () => {
      const engine = createEngine();
      await engine.start();
      await engine.completePhase(makePhaseResult('p1', 20, 25));
      await engine.completePhase(makePhaseResult('p2', 8, 10));

      expect(engine.status).toBe('complete');

      engine.reset();

      expect(engine.status).toBe('idle');
      expect(engine.currentPhaseIndex).toBe(-1);
      expect(engine.phaseResults).toHaveLength(0);
      expect(engine.recordings).toHaveLength(0);
      expect(engine.session.totalScore).toBeUndefined();
      expect(engine.session.cefrLevel).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('calls onError and returns to idle on handler failure', async () => {
      const onError = vi.fn();
      const failingHandler: PhaseHandler = {
        initialize: vi.fn().mockRejectedValue(new Error('init failed')),
        start: vi.fn(),
        abort: vi.fn(),
        getResult: vi.fn(),
      };
      const factory = createMockFactory([failingHandler]);
      const engine = createEngine({ factory, callbacks: { onError } });

      await engine.start();

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'init failed' }));
      expect(engine.status).toBe('idle');
    });
  });

  describe('state transition validation', () => {
    it('rejects invalid transitions', () => {
      const engine = createEngine();
      // idle → scoring is not valid
      expect(() => (engine as any)._transition('scoring')).toThrow('Invalid transition');
    });
  });

  describe('single-phase assessment', () => {
    it('goes directly to scoring after one phase', async () => {
      const phase = makePhase('p1', 'conversation', 10);
      const engine = createEngine({ definition: makeDefinition([phase]) });

      await engine.start();
      await engine.completePhase(makePhaseResult('p1', 7, 10));

      expect(engine.status).toBe('complete');
      expect(engine.session.totalScore).toBe(7);
    });
  });
});
