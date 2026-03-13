/**
 * Tests for assessment API routes (server/routes/assessment-routes.ts).
 * Uses Express + createAssessmentRoutes with a mock storage object.
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

describe('Assessment API routes', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      createAssessmentSession: vi.fn(),
      getAssessmentSession: vi.fn(),
      updateAssessmentPhaseResult: vi.fn(),
      addAssessmentRecording: vi.fn(),
      completeAssessmentSession: vi.fn(),
      getPlayerAssessments: vi.fn(),
      getWorldAssessmentSummary: vi.fn(),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createAssessmentRoutes(mockStorage));
  });

  // ─── POST /api/assessments ───

  it('creates a new assessment session', async () => {
    const created = { id: 's1', playerId: 'p1', worldId: 'w1', assessmentType: 'arrival', status: 'in_progress' };
    mockStorage.createAssessmentSession.mockResolvedValue(created);

    const res = await request(app).post('/api/assessments', {
      playerId: 'p1',
      worldId: 'w1',
      assessmentType: 'arrival',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('s1');
    expect(res.body.assessmentType).toBe('arrival');
    expect(mockStorage.createAssessmentSession).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: 'p1', worldId: 'w1', assessmentType: 'arrival', status: 'in_progress' }),
    );
  });

  it('returns 400 when required fields are missing on create', async () => {
    const res = await request(app).post('/api/assessments', { playerId: 'p1' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
    expect(mockStorage.createAssessmentSession).not.toHaveBeenCalled();
  });

  // ─── GET /api/assessments/:sessionId ───

  it('fetches an assessment session by id', async () => {
    const session = { id: 's1', playerId: 'p1', status: 'in_progress' };
    mockStorage.getAssessmentSession.mockResolvedValue(session);

    const res = await request(app).get('/api/assessments/s1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('s1');
    expect(mockStorage.getAssessmentSession).toHaveBeenCalledWith('s1');
  });

  it('returns 404 when session not found', async () => {
    mockStorage.getAssessmentSession.mockResolvedValue(null);

    const res = await request(app).get('/api/assessments/nonexistent');

    expect(res.status).toBe(404);
  });

  // ─── PUT /api/assessments/:sessionId/phases/:phaseId ───

  it('updates a phase result', async () => {
    const updated = { id: 's1', phases: [{ phaseId: 'conv', score: 20, maxScore: 25 }] };
    mockStorage.updateAssessmentPhaseResult.mockResolvedValue(updated);

    const res = await request(app).put('/api/assessments/s1/phases/conv', {
      score: 20,
      maxScore: 25,
    });

    expect(res.status).toBe(200);
    expect(res.body.phases).toHaveLength(1);
    expect(mockStorage.updateAssessmentPhaseResult).toHaveBeenCalledWith('s1', 'conv', { score: 20, maxScore: 25 });
  });

  it('returns 400 when phase result body is empty', async () => {
    const res = await request(app).put('/api/assessments/s1/phases/conv', {});

    expect(res.status).toBe(400);
    expect(mockStorage.updateAssessmentPhaseResult).not.toHaveBeenCalled();
  });

  it('returns 404 when updating phase on nonexistent session', async () => {
    mockStorage.updateAssessmentPhaseResult.mockResolvedValue(null);

    const res = await request(app).put('/api/assessments/bad/phases/conv', { score: 10 });

    expect(res.status).toBe(404);
  });

  // ─── PUT /api/assessments/:sessionId/recordings ───

  it('adds a recording reference', async () => {
    const updated = { id: 's1', recordings: [{ phaseId: 'conv', url: 'https://storage/rec1.webm' }] };
    mockStorage.addAssessmentRecording.mockResolvedValue(updated);

    const res = await request(app).put('/api/assessments/s1/recordings', {
      phaseId: 'conv',
      url: 'https://storage/rec1.webm',
    });

    expect(res.status).toBe(200);
    expect(res.body.recordings).toHaveLength(1);
    expect(mockStorage.addAssessmentRecording).toHaveBeenCalledWith('s1', {
      phaseId: 'conv',
      url: 'https://storage/rec1.webm',
    });
  });

  it('returns 400 when recording has no phaseId', async () => {
    const res = await request(app).put('/api/assessments/s1/recordings', { url: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/phaseId/);
  });

  it('returns 404 when adding recording to nonexistent session', async () => {
    mockStorage.addAssessmentRecording.mockResolvedValue(null);

    const res = await request(app).put('/api/assessments/bad/recordings', { phaseId: 'conv' });

    expect(res.status).toBe(404);
  });

  // ─── PUT /api/assessments/:sessionId/complete ───

  it('marks a session complete', async () => {
    const completed = { id: 's1', status: 'completed', totalScore: 42, maxScore: 53, cefrLevel: 'A2' };
    mockStorage.completeAssessmentSession.mockResolvedValue(completed);

    const res = await request(app).put('/api/assessments/s1/complete', {
      totalScore: 42,
      maxScore: 53,
      cefrLevel: 'A2',
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.totalScore).toBe(42);
    expect(mockStorage.completeAssessmentSession).toHaveBeenCalledWith('s1', 42, 53, 'A2');
  });

  it('returns 404 when completing nonexistent session', async () => {
    mockStorage.completeAssessmentSession.mockResolvedValue(null);

    const res = await request(app).put('/api/assessments/bad/complete', {});

    expect(res.status).toBe(404);
  });

  // ─── GET /api/assessments/player/:playerId ───

  it('gets all assessments for a player', async () => {
    const sessions = [
      { id: 's1', playerId: 'p1', assessmentType: 'arrival' },
      { id: 's2', playerId: 'p1', assessmentType: 'departure' },
    ];
    mockStorage.getPlayerAssessments.mockResolvedValue(sessions);

    const res = await request(app).get('/api/assessments/player/p1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(mockStorage.getPlayerAssessments).toHaveBeenCalledWith('p1');
  });

  // ─── GET /api/assessments/world/:worldId/summary ───

  it('gets world assessment summary', async () => {
    const summary = {
      worldId: 'w1',
      totalCompleted: 5,
      byType: {
        arrival: { count: 3, avgScore: 35.5, distribution: { '0-25%': 0, '25-50%': 1, '50-75%': 1, '75-100%': 1 } },
      },
    };
    mockStorage.getWorldAssessmentSummary.mockResolvedValue(summary);

    const res = await request(app).get('/api/assessments/world/w1/summary');

    expect(res.status).toBe(200);
    expect(res.body.totalCompleted).toBe(5);
    expect(res.body.byType.arrival.count).toBe(3);
    expect(mockStorage.getWorldAssessmentSummary).toHaveBeenCalledWith('w1');
  });
});
