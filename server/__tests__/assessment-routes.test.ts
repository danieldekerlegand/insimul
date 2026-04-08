/**
 * Tests for assessment API routes (server/routes/assessment-routes.ts).
 * Write endpoints return 410 Gone; read endpoints source from quest overlays.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { createAssessmentRoutes } from '../routes/assessment-routes';

// Lightweight request helper (same pattern as telemetry-batch.test.ts)
function request(app: Express) {
  function makeRequest(
    method: string,
    path: string,
    body?: any,
  ): Promise<{ status: number; body: any }> {
    const server = http.createServer(app);
    return new Promise((resolve, reject) => {
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        const bodyStr = body ? JSON.stringify(body) : undefined;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr).toString();

        const req = http.request(
          { hostname: '127.0.0.1', port: addr.port, path, method, headers },
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
        if (bodyStr) req.write(bodyStr);
        req.end();
      });
    });
  }

  return {
    get: (path: string) => makeRequest('GET', path),
    post: (path: string, body?: any) => makeRequest('POST', path, body),
    put: (path: string, body?: any) => makeRequest('PUT', path, body),
  };
}

// ── Mock helpers ────────────────────────────────────────────────────────────

function makeAssessmentQuest(overrides: Record<string, any> = {}) {
  return {
    id: 'q1',
    worldId: 'w1',
    assignedTo: 'player1',
    questType: 'assessment',
    targetLanguage: 'French',
    status: 'completed',
    tags: ['assessment', 'arrival'],
    phaseResults: [
      { phaseId: 'reading', score: 20, maxScore: 25, taskResults: [{ taskId: 't1', playerAnswer: 'a', score: 20, maxPoints: 25 }], dimensionScores: { comprehension: 4 }, completedAt: '2026-04-01' },
    ],
    assessmentResult: {
      totalScore: 60,
      maxScore: 100,
      cefrLevel: 'A2',
      dimensionScores: { comprehension: 4, fluency: 3, vocabulary: 3, grammar: 3, pronunciation: 2 },
      completedAt: '2026-04-01',
    },
    ...overrides,
  };
}

// ── Mock the playthrough overlay module ──────────────────────────────────────

vi.mock('../services/playthrough-overlay', () => ({
  getEntitiesWithOverlay: vi.fn(async (base: any[]) => base),
}));

describe('Assessment API routes', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      getQuest: vi.fn(),
      getQuestsByWorld: vi.fn().mockResolvedValue([]),
      getPlaythroughsByUser: vi.fn().mockResolvedValue([]),
      getPlaythroughsByWorld: vi.fn().mockResolvedValue([]),
      getPlaythrough: vi.fn(),
      getUserPlaythroughForWorld: vi.fn(),
      getDeltasByEntityType: vi.fn().mockResolvedValue([]),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createAssessmentRoutes(mockStorage as any));
  });

  // ─── Write endpoints return 410 Gone ───

  it('POST /api/assessments returns 410 Gone', async () => {
    const res = await request(app).post('/api/assessments', {
      playerId: 'p1', worldId: 'w1', assessmentType: 'arrival',
    });
    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/retired/i);
  });

  it('PUT /api/assessments/:id/phases/:phaseId returns 410 Gone', async () => {
    const res = await request(app).put('/api/assessments/s1/phases/conv', { score: 20 });
    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/retired/i);
  });

  it('PUT /api/assessments/:id/recordings returns 410 Gone', async () => {
    const res = await request(app).put('/api/assessments/s1/recordings', { phaseId: 'conv' });
    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/retired/i);
  });

  it('PUT /api/assessments/:id/complete returns 410 Gone', async () => {
    const res = await request(app).put('/api/assessments/s1/complete', { totalScore: 42 });
    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/retired/i);
  });

  // ─── GET /api/assessments/:sessionId ───

  it('fetches an assessment quest by id with overlay data', async () => {
    const quest = makeAssessmentQuest();
    mockStorage.getQuest.mockResolvedValue(quest);

    const res = await request(app).get('/api/assessments/q1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('q1');
    expect(res.body.assessmentType).toBe('arrival');
    expect(res.body.totalScore).toBe(60);
    expect(res.body.cefrLevel).toBe('A2');
    expect(res.body.phaseResults).toHaveLength(1);
  });

  it('returns basic info when quest has no assessment overlay data', async () => {
    mockStorage.getQuest.mockResolvedValue({
      id: 'q2', worldId: 'w1', assignedTo: 'player1',
      questType: 'assessment', status: 'active', tags: ['assessment', 'departure'],
      targetLanguage: 'French',
    });

    const res = await request(app).get('/api/assessments/q2');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('q2');
    expect(res.body.assessmentType).toBe('departure');
    expect(res.body.status).toBe('in_progress');
    expect(res.body.phaseResults).toEqual([]);
  });

  it('returns 404 when quest not found', async () => {
    mockStorage.getQuest.mockResolvedValue(null);

    const res = await request(app).get('/api/assessments/nonexistent');
    expect(res.status).toBe(404);
  });

  it('returns 404 when quest is not an assessment quest', async () => {
    mockStorage.getQuest.mockResolvedValue({ id: 'q3', questType: 'main' });

    const res = await request(app).get('/api/assessments/q3');
    expect(res.status).toBe(404);
  });

  // ─── GET /api/assessments/player/:playerId ───

  it('gets assessments for a player via playthrough quest overlays', async () => {
    const quest = makeAssessmentQuest();
    mockStorage.getPlaythroughsByUser.mockResolvedValue([{ id: 'pt1', worldId: 'w1', userId: 'p1' }]);
    mockStorage.getQuestsByWorld.mockResolvedValue([quest]);

    const res = await request(app).get('/api/assessments/player/p1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].assessmentType).toBe('arrival');
    expect(res.body[0].totalScore).toBe(60);
  });

  it('returns empty array when player has no playthroughs', async () => {
    mockStorage.getPlaythroughsByUser.mockResolvedValue([]);

    const res = await request(app).get('/api/assessments/player/nobody');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // ─── GET /api/assessments/world/:worldId/summary ───

  it('gets world assessment summary from playthrough quest overlays', async () => {
    const arrivalQuest = makeAssessmentQuest({ id: 'q1', tags: ['assessment', 'arrival'] });
    const departureQuest = makeAssessmentQuest({
      id: 'q2', tags: ['assessment', 'departure'],
      assessmentResult: { totalScore: 80, maxScore: 100, cefrLevel: 'B1', dimensionScores: {}, completedAt: '2026-04-05' },
    });

    mockStorage.getPlaythroughsByWorld.mockResolvedValue([{ id: 'pt1', worldId: 'w1', userId: 'u1' }]);
    mockStorage.getQuestsByWorld.mockResolvedValue([arrivalQuest, departureQuest]);

    const res = await request(app).get('/api/assessments/world/w1/summary');

    expect(res.status).toBe(200);
    expect(res.body.worldId).toBe('w1');
    expect(res.body.totalSessions).toBe(2);
    expect(res.body.completedSessions).toBe(2);
    expect(res.body.byType.arrival).toBe(1);
    expect(res.body.byType.departure).toBe(1);
    expect(res.body.cefrDistribution.A2).toBe(1);
    expect(res.body.cefrDistribution.B1).toBe(1);
    expect(res.body.averageScore).toBe(70); // (60 + 80) / 2
  });

  // ─── GET /api/assessments/:sessionId/transcripts ───

  it('gets transcripts from quest overlay phase results', async () => {
    const quest = makeAssessmentQuest();
    mockStorage.getQuest.mockResolvedValue(quest);

    const res = await request(app).get('/api/assessments/q1/transcripts');

    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe('q1');
    expect(res.body.transcripts).toHaveLength(1);
    expect(res.body.transcripts[0].phaseId).toBe('reading');
  });

  it('returns 404 for transcripts when quest not found', async () => {
    mockStorage.getQuest.mockResolvedValue(null);

    const res = await request(app).get('/api/assessments/bad/transcripts');
    expect(res.status).toBe(404);
  });

  // ─── GET /api/assessments/:sessionId/recordings-list ───

  it('returns empty recordings (retired)', async () => {
    const res = await request(app).get('/api/assessments/q1/recordings-list');

    expect(res.status).toBe(200);
    expect(res.body.recordings).toEqual([]);
    expect(res.body.phaseRecordings).toEqual([]);
  });
});
