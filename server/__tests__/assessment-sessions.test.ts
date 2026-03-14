/**
 * Assessment MongoDB completion and query methods tests
 *
 * Tests createAssessmentSession, getAssessmentSession, updateAssessmentPhaseResult,
 * completeAssessmentSession, getPlayerAssessments, and getWorldAssessmentSummary.
 *
 * Uses mongodb-memory-server for isolated MongoDB testing.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoStorage } from '../db/mongo-storage';
import type { AssessmentSession } from '../../shared/assessment';

let mongoServer: MongoMemoryServer;
let storage: MongoStorage;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  storage = new MongoStorage(uri);
  await storage.connect();
}, 60000);

afterAll(async () => {
  await storage.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  await mongoose.connection.collection('assessmentsessions').deleteMany({});
});

const sampleSession: Omit<AssessmentSession, 'id'> = {
  playerId: 'player-1',
  worldId: 'world-1',
  assessmentDefinitionId: 'arrival-encounter',
  assessmentType: 'arrival',
  targetLanguage: 'Spanish',
  status: 'idle',
  phaseResults: [],
  totalMaxPoints: 53,
  createdAt: new Date().toISOString(),
};

const samplePhaseResult = {
  phaseId: 'phase-1-conversational',
  score: 18,
  maxPoints: 25,
  taskResults: [
    { taskId: 'task-1a', score: 10, maxPoints: 15, playerResponse: 'Hola, me llamo Juan.' },
    { taskId: 'task-1b', score: 8, maxPoints: 10, playerResponse: 'Soy de Estados Unidos.' },
  ],
  dimensionScores: { pronunciation: 3, vocabulary: 4, grammar: 3, fluency: 4, comprehension: 4 },
  automatedMetrics: { wpm: 45, ttr: 0.72, mlu: 5.3, avgLatencyMs: 2100, repairs: 2, codeSwitchingCount: 1 },
  transcript: 'NPC: ¡Bienvenido! ¿Cómo te llamas?\nPlayer: Hola, me llamo Juan.',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
};

describe('Assessment Session CRUD', () => {
  it('should create an assessment session', async () => {
    const session = await storage.createAssessmentSession(sampleSession);

    expect(session.id).toBeDefined();
    expect(session.playerId).toBe('player-1');
    expect(session.worldId).toBe('world-1');
    expect(session.assessmentType).toBe('arrival');
    expect(session.targetLanguage).toBe('Spanish');
    expect(session.status).toBe('idle');
    expect(session.phaseResults).toEqual([]);
    expect(session.totalMaxPoints).toBe(53);
  });

  it('should get an assessment session by id', async () => {
    const created = await storage.createAssessmentSession(sampleSession);
    const fetched = await storage.getAssessmentSession(created.id);

    expect(fetched).toBeDefined();
    expect(fetched!.id).toBe(created.id);
    expect(fetched!.playerId).toBe('player-1');
  });

  it('should return undefined for non-existent session', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const fetched = await storage.getAssessmentSession(id);
    expect(fetched).toBeUndefined();
  });

  it('should update with a phase result', async () => {
    const created = await storage.createAssessmentSession(sampleSession);
    const updated = await storage.updateAssessmentPhaseResult(created.id, samplePhaseResult);

    expect(updated).toBeDefined();
    expect(updated!.phaseResults).toHaveLength(1);
    expect(updated!.phaseResults[0].phaseId).toBe('phase-1-conversational');
    expect(updated!.phaseResults[0].score).toBe(18);
    expect(updated!.status).toBe('phase_transitioning');
  });

  it('should accumulate multiple phase results', async () => {
    const created = await storage.createAssessmentSession(sampleSession);
    await storage.updateAssessmentPhaseResult(created.id, samplePhaseResult);
    const updated = await storage.updateAssessmentPhaseResult(created.id, {
      ...samplePhaseResult,
      phaseId: 'phase-2-listening',
      score: 5,
      maxPoints: 7,
    });

    expect(updated!.phaseResults).toHaveLength(2);
    expect(updated!.phaseResults[1].phaseId).toBe('phase-2-listening');
  });
});

describe('completeAssessmentSession', () => {
  it('should complete a session with scores and CEFR level', async () => {
    const created = await storage.createAssessmentSession(sampleSession);
    await storage.updateAssessmentPhaseResult(created.id, samplePhaseResult);

    const completed = await storage.completeAssessmentSession(created.id, {
      totalScore: 38,
      cefrLevel: 'A2',
      dimensionScores: { pronunciation: 3, vocabulary: 4, grammar: 3, fluency: 4, comprehension: 4 },
      automatedMetrics: { wpm: 45, ttr: 0.72, mlu: 5.3, avgLatencyMs: 2100, repairs: 2, codeSwitchingCount: 1 },
    });

    expect(completed).toBeDefined();
    expect(completed!.status).toBe('complete');
    expect(completed!.totalScore).toBe(38);
    expect(completed!.cefrLevel).toBe('A2');
    expect(completed!.dimensionScores).toEqual({ pronunciation: 3, vocabulary: 4, grammar: 3, fluency: 4, comprehension: 4 });
    expect(completed!.completedAt).toBeDefined();
  });

  it('should complete without optional fields', async () => {
    const created = await storage.createAssessmentSession(sampleSession);
    const completed = await storage.completeAssessmentSession(created.id, {
      totalScore: 20,
    });

    expect(completed).toBeDefined();
    expect(completed!.status).toBe('complete');
    expect(completed!.totalScore).toBe(20);
    expect(completed!.cefrLevel).toBeNull();
  });

  it('should return undefined for non-existent session', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const result = await storage.completeAssessmentSession(id, { totalScore: 10 });
    expect(result).toBeUndefined();
  });
});

describe('getPlayerAssessments', () => {
  beforeEach(async () => {
    // Create sessions for two players across two worlds
    await storage.createAssessmentSession({ ...sampleSession, playerId: 'player-A', worldId: 'world-1', assessmentType: 'arrival' });
    await storage.createAssessmentSession({ ...sampleSession, playerId: 'player-A', worldId: 'world-1', assessmentType: 'departure' });
    await storage.createAssessmentSession({ ...sampleSession, playerId: 'player-A', worldId: 'world-2', assessmentType: 'arrival' });
    await storage.createAssessmentSession({ ...sampleSession, playerId: 'player-B', worldId: 'world-1', assessmentType: 'arrival' });
  });

  it('should get all assessments for a player', async () => {
    const sessions = await storage.getPlayerAssessments('player-A');
    expect(sessions).toHaveLength(3);
    expect(sessions.every(s => s.playerId === 'player-A')).toBe(true);
  });

  it('should filter by worldId', async () => {
    const sessions = await storage.getPlayerAssessments('player-A', 'world-1');
    expect(sessions).toHaveLength(2);
    expect(sessions.every(s => s.worldId === 'world-1')).toBe(true);
  });

  it('should filter by assessmentType', async () => {
    const sessions = await storage.getPlayerAssessments('player-A', undefined, 'arrival');
    expect(sessions).toHaveLength(2);
    expect(sessions.every(s => s.assessmentType === 'arrival')).toBe(true);
  });

  it('should filter by both worldId and assessmentType', async () => {
    const sessions = await storage.getPlayerAssessments('player-A', 'world-1', 'departure');
    expect(sessions).toHaveLength(1);
    expect(sessions[0].assessmentType).toBe('departure');
  });

  it('should return empty array for unknown player', async () => {
    const sessions = await storage.getPlayerAssessments('player-unknown');
    expect(sessions).toHaveLength(0);
  });

  it('should return results sorted by createdAt descending', async () => {
    const sessions = await storage.getPlayerAssessments('player-A');
    for (let i = 1; i < sessions.length; i++) {
      expect(new Date(sessions[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sessions[i].createdAt).getTime()
      );
    }
  });
});

describe('getWorldAssessmentSummary', () => {
  beforeEach(async () => {
    // Create and complete several sessions in world-1
    const s1 = await storage.createAssessmentSession({ ...sampleSession, playerId: 'p1', worldId: 'world-1', assessmentType: 'arrival' });
    await storage.completeAssessmentSession(s1.id, { totalScore: 40, cefrLevel: 'B1' });

    const s2 = await storage.createAssessmentSession({ ...sampleSession, playerId: 'p2', worldId: 'world-1', assessmentType: 'arrival' });
    await storage.completeAssessmentSession(s2.id, { totalScore: 25, cefrLevel: 'A2' });

    const s3 = await storage.createAssessmentSession({ ...sampleSession, playerId: 'p3', worldId: 'world-1', assessmentType: 'departure' });
    await storage.completeAssessmentSession(s3.id, { totalScore: 48, cefrLevel: 'B2' });

    // One incomplete session (should be counted in totalSessions but not in aggregates)
    await storage.createAssessmentSession({ ...sampleSession, playerId: 'p4', worldId: 'world-1', assessmentType: 'arrival' });
  });

  it('should return correct session counts', async () => {
    const summary = await storage.getWorldAssessmentSummary('world-1');
    expect(summary.totalSessions).toBe(4);
    expect(summary.completedSessions).toBe(3);
  });

  it('should compute average scores from completed sessions only', async () => {
    const summary = await storage.getWorldAssessmentSummary('world-1');
    // avg of 40, 25, 48 = 37.67
    expect(summary.averageScore).toBeCloseTo(37.67, 1);
    // avg percentages: 40/53*100=75.47, 25/53*100=47.17, 48/53*100=90.57 => avg ~71.07
    expect(summary.averagePercentage).toBeGreaterThan(0);
  });

  it('should group by assessment type', async () => {
    const summary = await storage.getWorldAssessmentSummary('world-1');
    expect(summary.byType.arrival).toBeDefined();
    expect(summary.byType.arrival.count).toBe(2);
    expect(summary.byType.departure).toBeDefined();
    expect(summary.byType.departure.count).toBe(1);
  });

  it('should compute CEFR distribution', async () => {
    const summary = await storage.getWorldAssessmentSummary('world-1');
    expect(summary.cefrDistribution.A1).toBe(0);
    expect(summary.cefrDistribution.A2).toBe(1);
    expect(summary.cefrDistribution.B1).toBe(1);
    expect(summary.cefrDistribution.B2).toBe(1);
  });

  it('should compute score distribution buckets', async () => {
    const summary = await storage.getWorldAssessmentSummary('world-1');
    expect(summary.scoreDistribution).toHaveLength(5);
    // All scores should be distributed across the 5 buckets
    const totalInBuckets = summary.scoreDistribution.reduce((sum, b) => sum + b.count, 0);
    expect(totalInBuckets).toBe(3);
  });

  it('should return zeros for a world with no sessions', async () => {
    const summary = await storage.getWorldAssessmentSummary('world-empty');
    expect(summary.totalSessions).toBe(0);
    expect(summary.completedSessions).toBe(0);
    expect(summary.averageScore).toBe(0);
    expect(summary.averagePercentage).toBe(0);
    expect(Object.keys(summary.byType)).toHaveLength(0);
  });
});
