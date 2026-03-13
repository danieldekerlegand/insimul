/**
 * Player Assessment Detail endpoint tests
 *
 * Tests GET /api/assessment/:participantId/detail from telemetry-routes.ts.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { createTelemetryRoutes } from '../routes/telemetry-routes';

// Lightweight request helper
function request(app: Express) {
  const server = http.createServer(app);

  function makeRequest(method: string, path: string, headers?: Record<string, string>): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        const reqHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        };

        const req = http.request(
          { hostname: '127.0.0.1', port: addr.port, path, method, headers: reqHeaders },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              server.close();
              try {
                resolve({ status: res.statusCode!, body: JSON.parse(data) });
              } catch {
                resolve({ status: res.statusCode!, body: data });
              }
            });
          },
        );
        req.on('error', (err) => { server.close(); reject(err); });
        req.end();
      });
    });
  }

  return {
    get: (path: string, headers?: Record<string, string>) => makeRequest('GET', path, headers),
  };
}

// Sample evaluation response data
function makeEvalResponse(overrides: Partial<any> = {}) {
  return {
    id: 'eval-1',
    participantId: 'player-42',
    studyId: 'study-1',
    instrumentType: 'sus',
    targetLanguage: null,
    responses: { sus_1: 4, sus_2: 2, sus_3: 5, sus_4: 1, sus_5: 4, sus_6: 2, sus_7: 5, sus_8: 1, sus_9: 4, sus_10: 2 },
    score: 80,
    maxScore: 100,
    sessionId: null,
    createdAt: new Date('2026-03-01').toISOString(),
    ...overrides,
  };
}

function makeLanguageAssessment(overrides: Partial<any> = {}) {
  return {
    id: 'la-1',
    playerId: 'player-42',
    worldId: 'world-1',
    assessmentType: 'vocabulary',
    targetLanguage: 'es',
    score: 8,
    maxScore: 10,
    details: {},
    testWindow: 'pre',
    createdAt: new Date('2026-03-01').toISOString(),
    ...overrides,
  };
}

describe('Player Assessment Detail endpoint', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      getEvaluationResponsesByParticipant: vi.fn().mockResolvedValue([]),
      getLanguageAssessments: vi.fn().mockResolvedValue([]),
      // Required by other routes that are registered
      validateApiKey: vi.fn(),
      createTelemetryBatch: vi.fn().mockResolvedValue(0),
      createEngagementBatch: vi.fn().mockResolvedValue(0),
      getEvaluationResponses: vi.fn().mockResolvedValue([]),
      createEvaluationResponse: vi.fn(),
      getEvaluationSummary: vi.fn().mockResolvedValue({ totalResponses: 0, byInstrument: {} }),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createTelemetryRoutes(mockStorage));
  });

  it('returns empty results when player has no assessments', async () => {
    const res = await request(app).get('/api/assessment/player-42/detail');

    expect(res.status).toBe(200);
    expect(res.body.participantId).toBe('player-42');
    expect(res.body.evaluations).toEqual([]);
    expect(res.body.languageAssessments).toEqual([]);
    expect(res.body.totalAssessments).toBe(0);
    expect(mockStorage.getEvaluationResponsesByParticipant).toHaveBeenCalledWith('player-42');
  });

  it('returns enriched evaluation responses with subscale scores', async () => {
    const evalResponse = makeEvalResponse();
    mockStorage.getEvaluationResponsesByParticipant.mockResolvedValue([evalResponse]);

    const res = await request(app).get('/api/assessment/player-42/detail');

    expect(res.status).toBe(200);
    expect(res.body.evaluations).toHaveLength(1);
    expect(res.body.totalAssessments).toBe(1);

    const enriched = res.body.evaluations[0];
    expect(enriched.instrumentName).toBe('System Usability Scale');
    expect(enriched.subscales).toBeDefined();
    expect(enriched.maxScore).toBe(100);
    // SUS score should be re-calculated
    expect(typeof enriched.score).toBe('number');
  });

  it('includes language assessments when worldId is provided', async () => {
    const la = makeLanguageAssessment();
    mockStorage.getLanguageAssessments.mockResolvedValue([la]);

    const res = await request(app).get('/api/assessment/player-42/detail?worldId=world-1');

    expect(res.status).toBe(200);
    expect(res.body.languageAssessments).toHaveLength(1);
    expect(res.body.totalAssessments).toBe(1);
    expect(mockStorage.getLanguageAssessments).toHaveBeenCalledWith('player-42', 'world-1');
  });

  it('does not fetch language assessments when worldId is absent', async () => {
    const res = await request(app).get('/api/assessment/player-42/detail');

    expect(res.status).toBe(200);
    expect(res.body.languageAssessments).toEqual([]);
    expect(mockStorage.getLanguageAssessments).not.toHaveBeenCalled();
  });

  it('handles multiple instrument types correctly', async () => {
    const susEval = makeEvalResponse({ id: 'eval-1', instrumentType: 'sus' });
    const actflEval = makeEvalResponse({
      id: 'eval-2',
      instrumentType: 'actfl_opi',
      responses: { actfl_1: 7, actfl_2: 6, actfl_3: 5, actfl_4: 8, actfl_5: 6, actfl_6: 4, actfl_7: 7, actfl_8: 6, actfl_9: 5, actfl_10: 4 },
      score: 5.8,
      maxScore: 10,
    });
    mockStorage.getEvaluationResponsesByParticipant.mockResolvedValue([susEval, actflEval]);

    const res = await request(app).get('/api/assessment/player-42/detail');

    expect(res.status).toBe(200);
    expect(res.body.evaluations).toHaveLength(2);
    expect(res.body.totalAssessments).toBe(2);

    const types = res.body.evaluations.map((e: any) => e.instrumentType);
    expect(types).toContain('sus');
    expect(types).toContain('actfl_opi');
  });

  it('enriches ACTFL OPI with subscale breakdown', async () => {
    const actflEval = makeEvalResponse({
      id: 'eval-actfl',
      instrumentType: 'actfl_opi',
      responses: { actfl_1: 7, actfl_2: 6, actfl_3: 5, actfl_4: 8, actfl_5: 6, actfl_6: 4, actfl_7: 7, actfl_8: 6, actfl_9: 5, actfl_10: 4 },
      score: null,
    });
    mockStorage.getEvaluationResponsesByParticipant.mockResolvedValue([actflEval]);

    const res = await request(app).get('/api/assessment/player-42/detail');

    expect(res.status).toBe(200);
    const enriched = res.body.evaluations[0];
    expect(enriched.subscaleScores).toBeDefined();
    expect(enriched.subscaleScores.speaking).toBeDefined();
    expect(enriched.subscaleScores.listening).toBeDefined();
    expect(enriched.subscaleScores.vocabulary).toBeDefined();
    expect(enriched.subscaleScores.confidence).toBeDefined();
    expect(enriched.subscales).toHaveLength(4);
    expect(enriched.instrumentName).toBe('ACTFL Oral Proficiency Interview (Self-Assessment)');
  });

  it('falls back to stored score when re-scoring fails', async () => {
    const evalResponse = makeEvalResponse({
      instrumentType: 'unknown_instrument' as any,
      score: 42,
      responses: {},
    });
    mockStorage.getEvaluationResponsesByParticipant.mockResolvedValue([evalResponse]);

    const res = await request(app).get('/api/assessment/player-42/detail');

    expect(res.status).toBe(200);
    const enriched = res.body.evaluations[0];
    expect(enriched.score).toBe(42);
  });
});
