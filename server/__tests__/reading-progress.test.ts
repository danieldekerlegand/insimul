/**
 * Reading Progress API — integration tests
 *
 * Tests GET /api/reading-progress/:playerId/:worldId and
 * POST /api/reading-progress/sync endpoints.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { createTelemetryRoutes } from '../routes/telemetry-routes';

// Lightweight request helper (no supertest dependency)
function request(app: Express) {
  const server = http.createServer(app);

  function makeRequest(method: string, path: string, body?: any): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        const bodyStr = body ? JSON.stringify(body) : undefined;
        const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (bodyStr) reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr).toString();

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
        if (bodyStr) req.write(bodyStr);
        req.end();
      });
    });
  }

  return {
    get: (path: string) => makeRequest('GET', path),
    post: (path: string, body?: any) => makeRequest('POST', path, body),
  };
}

describe('Reading Progress endpoints', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      getReadingProgress: vi.fn().mockResolvedValue(null),
      upsertReadingProgress: vi.fn().mockResolvedValue({ id: 'rp1', articlesRead: [], quizAnswers: [], totalCorrect: 0, totalAttempted: 0, xpFromReading: 0 }),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createTelemetryRoutes(mockStorage));
  });

  describe('GET /api/reading-progress/:playerId/:worldId', () => {
    it('returns empty defaults when no progress exists', async () => {
      const res = await request(app).get('/api/reading-progress/player1/world1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        articlesRead: [],
        quizAnswers: [],
        totalCorrect: 0,
        totalAttempted: 0,
        xpFromReading: 0,
      });
      expect(mockStorage.getReadingProgress).toHaveBeenCalledWith('player1', 'world1', undefined);
    });

    it('returns stored progress when it exists', async () => {
      const stored = {
        id: 'rp1',
        articlesRead: ['art1'],
        quizAnswers: [{ articleId: 'art1', selectedIndex: 1, correctIndex: 1, correct: true, answeredAt: 1000 }],
        totalCorrect: 1,
        totalAttempted: 1,
        xpFromReading: 10,
      };
      mockStorage.getReadingProgress.mockResolvedValue(stored);

      const res = await request(app).get('/api/reading-progress/player1/world1');

      expect(res.status).toBe(200);
      expect(res.body.totalCorrect).toBe(1);
      expect(res.body.quizAnswers).toHaveLength(1);
    });

    it('passes playthroughId query parameter', async () => {
      await request(app).get('/api/reading-progress/player1/world1?playthroughId=pt1');

      expect(mockStorage.getReadingProgress).toHaveBeenCalledWith('player1', 'world1', 'pt1');
    });
  });

  describe('POST /api/reading-progress/sync', () => {
    it('returns 400 when playerId is missing', async () => {
      const res = await request(app).post('/api/reading-progress/sync', { worldId: 'w1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Missing required fields/);
    });

    it('returns 400 when worldId is missing', async () => {
      const res = await request(app).post('/api/reading-progress/sync', { playerId: 'p1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Missing required fields/);
    });

    it('upserts reading progress with quiz answers', async () => {
      const quizAnswers = [
        { articleId: 'art1', selectedIndex: 2, correctIndex: 2, correct: true, answeredAt: 1000 },
      ];
      mockStorage.upsertReadingProgress.mockResolvedValue({
        id: 'rp1',
        quizAnswers,
        totalCorrect: 1,
        totalAttempted: 1,
        xpFromReading: 0,
      });

      const res = await request(app).post('/api/reading-progress/sync', {
        playerId: 'player1',
        worldId: 'world1',
        quizAnswers,
        totalCorrect: 1,
        totalAttempted: 1,
      });

      expect(res.status).toBe(200);
      expect(res.body.totalCorrect).toBe(1);
      expect(mockStorage.upsertReadingProgress).toHaveBeenCalledWith(
        'player1',
        'world1',
        expect.objectContaining({ quizAnswers, totalCorrect: 1, totalAttempted: 1 }),
        undefined,
      );
    });

    it('passes playthroughId when provided', async () => {
      await request(app).post('/api/reading-progress/sync', {
        playerId: 'p1',
        worldId: 'w1',
        playthroughId: 'pt1',
        totalCorrect: 0,
        totalAttempted: 0,
      });

      expect(mockStorage.upsertReadingProgress).toHaveBeenCalledWith(
        'p1',
        'w1',
        expect.any(Object),
        'pt1',
      );
    });
  });
});

describe('ReadingProgress types', () => {
  it('QuizAnswer interface has correct shape', () => {
    // Type-level test: verify the exported types compile correctly
    const answer: import('../../shared/language/progress').QuizAnswer = {
      articleId: 'a1',
      selectedIndex: 0,
      correctIndex: 1,
      correct: false,
      answeredAt: Date.now(),
    };
    expect(answer.articleId).toBe('a1');
    expect(answer.correct).toBe(false);
  });

  it('ReadingProgress interface has correct shape', () => {
    const progress: import('../../shared/language/progress').ReadingProgress = {
      playerId: 'p1',
      worldId: 'w1',
      articlesRead: ['a1'],
      quizAnswers: [],
      totalCorrect: 0,
      totalAttempted: 0,
      xpFromReading: 0,
    };
    expect(progress.playerId).toBe('p1');
    expect(progress.articlesRead).toEqual(['a1']);
  });
});
