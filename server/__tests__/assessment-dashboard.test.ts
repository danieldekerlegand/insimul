/**
 * Assessment Dashboard endpoint tests
 *
 * Tests the GET /api/assessment/dashboard/:worldId endpoint.
 * Uses Express + createTelemetryRoutes with a mock storage object.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { createTelemetryRoutes } from '../routes/telemetry-routes';

// Lightweight request helper
function request(app: Express) {
  const server = http.createServer(app);

  function makeRequest(method: string, path: string): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        const req = http.request(
          { hostname: '127.0.0.1', port: addr.port, path, method },
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
    get: (path: string) => makeRequest('GET', path),
  };
}

describe('Assessment dashboard endpoint', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      getLanguageAssessmentsByWorld: vi.fn().mockResolvedValue([]),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createTelemetryRoutes(mockStorage));
  });

  it('returns empty dashboard for a world with no assessments', async () => {
    const res = await request(app).get('/api/assessment/dashboard/world-1');

    expect(res.status).toBe(200);
    expect(res.body.worldId).toBe('world-1');
    expect(res.body.totalAssessments).toBe(0);
    expect(res.body.uniquePlayers).toBe(0);
    expect(res.body.players).toEqual([]);
    expect(res.body.cefrDistribution).toEqual({});
    expect(mockStorage.getLanguageAssessmentsByWorld).toHaveBeenCalledWith('world-1', {
      assessmentType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('aggregates assessments correctly', async () => {
    mockStorage.getLanguageAssessmentsByWorld.mockResolvedValue([
      { playerId: 'p1', assessmentType: 'vocabulary', score: 80, maxScore: 100, testWindow: 'pre', createdAt: '2026-03-01' },
      { playerId: 'p1', assessmentType: 'grammar', score: 60, maxScore: 100, testWindow: 'pre', createdAt: '2026-03-01' },
      { playerId: 'p2', assessmentType: 'vocabulary', score: 90, maxScore: 100, testWindow: 'post', createdAt: '2026-03-05' },
      { playerId: 'p2', assessmentType: 'listening', score: 45, maxScore: 100, testWindow: 'post', createdAt: '2026-03-05' },
    ]);

    const res = await request(app).get('/api/assessment/dashboard/world-1');

    expect(res.status).toBe(200);
    expect(res.body.totalAssessments).toBe(4);
    expect(res.body.uniquePlayers).toBe(2);

    // Type averages
    expect(res.body.typeAverages.vocabulary).toBeDefined();
    expect(res.body.typeAverages.vocabulary.count).toBe(2);
    expect(res.body.typeAverages.vocabulary.avgPercentage).toBe(85);

    expect(res.body.typeAverages.grammar).toBeDefined();
    expect(res.body.typeAverages.grammar.count).toBe(1);
    expect(res.body.typeAverages.grammar.avgPercentage).toBe(60);

    // Phase averages
    expect(res.body.phaseAverages.pre).toBeDefined();
    expect(res.body.phaseAverages.pre.count).toBe(2);
    expect(res.body.phaseAverages.post).toBeDefined();
    expect(res.body.phaseAverages.post.count).toBe(2);

    // CEFR distribution (80%=B2, 60%=B1, 90%=C1, 45%=A2)
    expect(res.body.cefrDistribution.B2).toBe(1);
    expect(res.body.cefrDistribution.B1).toBe(1);
    expect(res.body.cefrDistribution.C1).toBe(1);
    expect(res.body.cefrDistribution.A2).toBe(1);

    // Players
    expect(res.body.players).toHaveLength(2);
    const p1 = res.body.players.find((p: any) => p.playerId === 'p1');
    expect(p1.assessmentCount).toBe(2);
    expect(p1.avgPercentage).toBe(70);
  });

  it('includes histogram with correct buckets', async () => {
    mockStorage.getLanguageAssessmentsByWorld.mockResolvedValue([
      { playerId: 'p1', assessmentType: 'vocabulary', score: 25, maxScore: 100, createdAt: '2026-03-01' },
      { playerId: 'p2', assessmentType: 'vocabulary', score: 75, maxScore: 100, createdAt: '2026-03-01' },
      { playerId: 'p3', assessmentType: 'vocabulary', score: 100, maxScore: 100, createdAt: '2026-03-01' },
    ]);

    const res = await request(app).get('/api/assessment/dashboard/world-1');

    expect(res.body.histogram['20-29']).toBe(1);
    expect(res.body.histogram['70-79']).toBe(1);
    expect(res.body.histogram['100']).toBe(1);
    expect(res.body.histogram['0-9']).toBe(0);
  });

  it('passes filter query params to storage', async () => {
    const res = await request(app).get(
      '/api/assessment/dashboard/world-1?assessmentType=vocabulary&dateFrom=2026-03-01&dateTo=2026-03-10'
    );

    expect(res.status).toBe(200);
    expect(mockStorage.getLanguageAssessmentsByWorld).toHaveBeenCalledWith('world-1', {
      assessmentType: 'vocabulary',
      dateFrom: '2026-03-01',
      dateTo: '2026-03-10',
    });
  });

  it('handles storage errors gracefully', async () => {
    mockStorage.getLanguageAssessmentsByWorld.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/assessment/dashboard/world-1');

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Failed to get assessment dashboard/i);
  });
});
