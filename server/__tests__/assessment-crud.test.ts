import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  AssessmentSession,
  AssessmentType,
  AssessmentStatus,
  PhaseResult,
  RecordingReference,
  AutomatedMetrics,
  TaskResult
} from '@shared/assessment';

// ─── Type validation tests (no DB required) ───────────────────────────

describe('Assessment Session Types', () => {
  function makeSession(overrides: Partial<AssessmentSession> = {}): AssessmentSession {
    return {
      id: 'sess-1',
      playerId: 'player-1',
      worldId: 'world-1',
      assessmentDefinitionId: 'arrival-encounter',
      assessmentType: 'arrival',
      targetLanguage: 'Spanish',
      status: 'idle',
      phaseResults: [],
      totalMaxPoints: 53,
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  it('creates a valid assessment session with required fields', () => {
    const session = makeSession();
    expect(session.playerId).toBe('player-1');
    expect(session.worldId).toBe('world-1');
    expect(session.assessmentType).toBe('arrival');
    expect(session.status).toBe('idle');
    expect(session.phaseResults).toEqual([]);
    expect(session.totalMaxPoints).toBe(53);
  });

  it('supports all assessment types', () => {
    const types: AssessmentType[] = ['arrival', 'departure', 'periodic'];
    for (const t of types) {
      const session = makeSession({ assessmentType: t });
      expect(session.assessmentType).toBe(t);
    }
  });

  it('supports all assessment statuses', () => {
    const statuses: AssessmentStatus[] = [
      'idle', 'initializing', 'phase_active',
      'phase_transitioning', 'scoring', 'complete',
    ];
    for (const s of statuses) {
      const session = makeSession({ status: s });
      expect(session.status).toBe(s);
    }
  });

  it('tracks optional scoring fields', () => {
    const session = makeSession({
      totalScore: 42,
      cefrLevel: 'B1',
      dimensionScores: { vocabulary: 4, grammar: 3, fluency: 4, comprehension: 5, pronunciation: 3 },
    });
    expect(session.totalScore).toBe(42);
    expect(session.cefrLevel).toBe('B1');
    expect(session.dimensionScores).toHaveProperty('vocabulary');
  });

  it('stores phase results with task results', () => {
    const taskResult: TaskResult = {
      taskId: 'task-1',
      score: 4,
      maxPoints: 5,
      playerResponse: 'Hola, me llamo Daniel',
      rationale: 'Good greeting with correct verb form',
    };
    const phaseResult: PhaseResult = {
      phaseId: 'conversational',
      score: 20,
      maxPoints: 25,
      taskResults: [taskResult],
      dimensionScores: { vocabulary: 4, grammar: 4, fluency: 4, comprehension: 4, pronunciation: 4 },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    const session = makeSession({ phaseResults: [phaseResult] });
    expect(session.phaseResults).toHaveLength(1);
    expect(session.phaseResults[0].taskResults[0].score).toBe(4);
  });

  it('stores automated metrics', () => {
    const metrics: AutomatedMetrics = {
      wpm: 45,
      ttr: 0.72,
      mlu: 6.3,
      avgLatencyMs: 2100,
      repairs: 3,
      codeSwitchingCount: 1,
    };
    const session = makeSession({ automatedMetrics: metrics });
    expect(session.automatedMetrics?.wpm).toBe(45);
    expect(session.automatedMetrics?.ttr).toBe(0.72);
  });

  it('stores recording references', () => {
    const recording: RecordingReference = {
      storageKey: 'recordings/sess-1/phase-1.webm',
      mimeType: 'audio/webm',
      durationSeconds: 180,
      phaseId: 'conversational',
      taskId: 'task-1',
      recordedAt: new Date().toISOString(),
    };
    const session = makeSession({ recordings: [recording] });
    expect(session.recordings).toHaveLength(1);
    expect(session.recordings![0].mimeType).toBe('audio/webm');
  });

  it('supports completed session with all fields populated', () => {
    const session = makeSession({
      status: 'complete',
      totalScore: 42,
      cefrLevel: 'B1',
      dimensionScores: { vocabulary: 4, grammar: 3, fluency: 4, comprehension: 5, pronunciation: 3 },
      automatedMetrics: {
        wpm: 50, ttr: 0.68, mlu: 5.8,
        avgLatencyMs: 1800, repairs: 2, codeSwitchingCount: 0,
      },
      phaseResults: [
        { phaseId: 'conversational', score: 20, maxPoints: 25, taskResults: [] },
        { phaseId: 'listening', score: 5, maxPoints: 7, taskResults: [] },
        { phaseId: 'writing', score: 9, maxPoints: 11, taskResults: [] },
        { phaseId: 'visual', score: 8, maxPoints: 10, taskResults: [] },
      ],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    expect(session.status).toBe('complete');
    expect(session.phaseResults).toHaveLength(4);
    const total = session.phaseResults.reduce((s, p) => s + p.score, 0);
    expect(total).toBe(42);
    expect(session.totalScore).toBe(total);
  });
});

// ─── Schema shape tests ───────────────────────────────────────────────

describe('Assessment Session Schema Shape', () => {
  it('Omit<AssessmentSession, "id"> has all required insert fields', () => {
    // Validates the insert type shape used by createAssessmentSession
    const insert: Omit<AssessmentSession, 'id'> = {
      playerId: 'p1',
      worldId: 'w1',
      assessmentDefinitionId: 'arrival-encounter',
      assessmentType: 'arrival',
      targetLanguage: 'French',
      status: 'idle',
      phaseResults: [],
      totalMaxPoints: 53,
      createdAt: new Date().toISOString(),
    };
    expect(insert.playerId).toBe('p1');
    expect(insert).not.toHaveProperty('id');
  });

  it('PhaseResult has correct structure for upsert', () => {
    const result: PhaseResult = {
      phaseId: 'listening',
      score: 5,
      maxPoints: 7,
      taskResults: [
        { taskId: 'follow-directions-1', score: 3, maxPoints: 4 },
        { taskId: 'info-extraction-1', score: 2, maxPoints: 3 },
      ],
    };
    expect(result.phaseId).toBe('listening');
    expect(result.taskResults).toHaveLength(2);
    expect(result.taskResults.reduce((s, t) => s + t.score, 0)).toBe(result.score);
  });

  it('RecordingReference includes required fields', () => {
    const rec: RecordingReference = {
      storageKey: 'key',
      mimeType: 'audio/webm',
      phaseId: 'conversational',
      recordedAt: new Date().toISOString(),
    };
    expect(rec.storageKey).toBe('key');
    expect(rec.phaseId).toBe('conversational');
    // Optional fields should be undefined
    expect(rec.durationSeconds).toBeUndefined();
    expect(rec.taskId).toBeUndefined();
  });
});

// ─── Compound index key tests ─────────────────────────────────────────

describe('Assessment compound index key shape', () => {
  it('player + world + type uniquely identifies assessment context', () => {
    const key1 = { playerId: 'p1', worldId: 'w1', assessmentType: 'arrival' };
    const key2 = { playerId: 'p1', worldId: 'w1', assessmentType: 'departure' };
    const key3 = { playerId: 'p1', worldId: 'w2', assessmentType: 'arrival' };

    // Different keys should be distinguishable
    expect(JSON.stringify(key1)).not.toBe(JSON.stringify(key2));
    expect(JSON.stringify(key1)).not.toBe(JSON.stringify(key3));
  });

  it('getPlayerAssessments query shape with optional worldId', () => {
    function buildQuery(playerId: string, worldId?: string) {
      const query: any = { playerId };
      if (worldId) query.worldId = worldId;
      return query;
    }

    expect(buildQuery('p1')).toEqual({ playerId: 'p1' });
    expect(buildQuery('p1', 'w1')).toEqual({ playerId: 'p1', worldId: 'w1' });
  });
});
