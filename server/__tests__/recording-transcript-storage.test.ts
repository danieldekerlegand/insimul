/**
 * Recording and transcript storage integration tests
 *
 * Tests the full flow: transcript serialization, assessment API routes,
 * and recording/transcript persistence.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { createAssessmentRoutes } from '../routes/assessment-routes';
import {
  serializeConversationPhase,
  serializeListeningPhase,
  serializeWritingPhase,
  serializeVisualPhase,
} from '../../client/assessment/transcript-serializer';

// ─── Request helper ──────────────────────────────────────────────────────────

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
                resolve({ status: res.statusCode!, body: data ? JSON.parse(data) : null });
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
    post: (path: string, body?: any) => makeRequest('POST', path, body),
    get: (path: string) => makeRequest('GET', path),
    put: (path: string, body?: any) => makeRequest('PUT', path, body),
  };
}

// ─── Mock storage ────────────────────────────────────────────────────────────

function createMockStorage() {
  const sessions: Record<string, any> = {};
  let idCounter = 0;

  return {
    createAssessmentSession: vi.fn(async (data: any) => {
      const id = `test_${++idCounter}`;
      sessions[id] = { ...data, id };
      return sessions[id];
    }),
    getAssessmentSession: vi.fn(async (id: string) => sessions[id] || undefined),
    updateAssessmentPhaseResult: vi.fn(async (sessionId: string, phaseResult: any) => {
      const session = sessions[sessionId];
      if (!session) return undefined;
      const idx = session.phaseResults.findIndex((r: any) => r.phaseId === phaseResult.phaseId);
      if (idx >= 0) {
        session.phaseResults[idx] = phaseResult;
      } else {
        session.phaseResults.push(phaseResult);
      }
      return session;
    }),
    addAssessmentRecording: vi.fn(async (sessionId: string, recording: any) => {
      const session = sessions[sessionId];
      if (!session) return undefined;
      if (!session.recordings) session.recordings = [];
      session.recordings.push(recording);
      return session;
    }),
    completeAssessmentSession: vi.fn(async (sessionId: string, totalScore: number, maxScore: number, cefrLevel: string) => {
      const session = sessions[sessionId];
      if (!session) return undefined;
      session.status = 'complete';
      session.totalScore = totalScore;
      session.totalMaxPoints = maxScore;
      session.cefrLevel = cefrLevel;
      session.completedAt = new Date().toISOString();
      return session;
    }),
    getPlayerAssessments: vi.fn(async (playerId: string) => {
      return Object.values(sessions).filter((s: any) => s.playerId === playerId);
    }),
    _sessions: sessions,
  };
}

// ─── Tests: Transcript Serializer ────────────────────────────────────────────

describe('Transcript Serializer', () => {
  describe('serializeConversationPhase', () => {
    it('creates PhaseResult with transcript and recording from conversation entries', () => {
      const entries = [
        { role: 'npc' as const, text: 'Hola, bienvenido!', timestamp: 1000, dimensionScores: { vocab: 4 } },
        { role: 'player' as const, text: 'Hola, me llamo Juan.', timestamp: 2000, metrics: { wpm: 30 } },
        { role: 'npc' as const, text: 'Mucho gusto, Juan.', timestamp: 3000 },
      ];

      const result = serializeConversationPhase(
        'phase_conv',
        entries,
        18,
        25,
        { vocab: 4, grammar: 3 },
        { wpm: 30, ttr: 0.8 },
      );

      expect(result.phaseId).toBe('phase_conv');
      expect(result.score).toBe(18);
      expect(result.maxPoints).toBe(25);
      expect(result.transcript).toHaveLength(3);
      expect(result.transcript![0].role).toBe('npc');
      expect(result.transcript![0].phaseId).toBe('phase_conv');
      expect(result.recordings).toHaveLength(1);
      expect(result.recordings![0].mimeType).toBe('text/plain');
      expect(result.recordings![0].storageKey).toContain('transcript:phase_conv');
      expect(result.dimensionScores).toEqual({ vocab: 4, grammar: 3 });
      expect(result.automatedMetrics).toEqual({ wpm: 30, ttr: 0.8 });
    });

    it('handles empty conversation gracefully', () => {
      const result = serializeConversationPhase('empty_phase', [], 0, 25);
      expect(result.transcript).toHaveLength(0);
      expect(result.recordings).toHaveLength(0);
    });
  });

  describe('serializeListeningPhase', () => {
    it('creates PhaseResult from listening task results', () => {
      const result = serializeListeningPhase('phase_listen', {
        directionsScore: 3,
        directionsMaxScore: 4,
        checkpointResults: [
          { checkpointId: 'cp1', reached: true },
          { checkpointId: 'cp2', reached: true },
          { checkpointId: 'cp3', reached: true },
          { checkpointId: 'cp4', reached: false },
        ],
        extractionScore: 2,
        extractionMaxScore: 3,
        questionResults: [
          { questionId: 'q1', playerAnswer: 'la tienda', correct: true },
          { questionId: 'q2', playerAnswer: 'tres', correct: true },
          { questionId: 'q3', playerAnswer: 'no sé', correct: false },
        ],
        announcementText: 'Bienvenidos al tour de la ciudad...',
        durationMs: 120000,
      });

      expect(result.phaseId).toBe('phase_listen');
      expect(result.score).toBe(5);
      expect(result.maxPoints).toBe(7);
      expect(result.taskResults).toHaveLength(2);
      expect(result.transcript).toHaveLength(4); // 1 announcement + 3 answers
      expect(result.transcript![0].role).toBe('system');
      expect(result.transcript![0].text).toBe('Bienvenidos al tour de la ciudad...');
      expect(result.recordings).toHaveLength(1);
      expect(result.recordings![0].durationSeconds).toBe(120);
    });
  });

  describe('serializeWritingPhase', () => {
    it('creates PhaseResult from writing task results', () => {
      const result = serializeWritingPhase('phase_write', {
        formFields: { name: 'Juan', origin: 'México', reason: 'turismo' },
        formScore: 3,
        formMaxPoints: 5,
        messageText: 'Estimado señor, quiero reservar una habitación.',
        messageScore: 4,
        messageMaxPoints: 6,
        startedAt: 1000,
        completedAt: 60000,
      });

      expect(result.phaseId).toBe('phase_write');
      expect(result.score).toBe(7);
      expect(result.maxPoints).toBe(11);
      expect(result.taskResults).toHaveLength(2);
      expect(result.transcript).toHaveLength(2); // form + message
      expect(result.transcript![0].text).toContain('name: Juan');
      expect(result.transcript![1].text).toBe('Estimado señor, quiero reservar una habitación.');
      expect(result.recordings).toHaveLength(1);
      expect(result.taskResults[0].playerResponse).toContain('Juan');
      expect(result.taskResults[1].playerResponse).toBe('Estimado señor, quiero reservar una habitación.');
    });

    it('handles missing form fields and message', () => {
      const result = serializeWritingPhase('phase_write', {
        formScore: 0,
        formMaxPoints: 5,
        messageScore: 0,
        messageMaxPoints: 6,
        startedAt: 1000,
        completedAt: 2000,
      });

      expect(result.transcript).toHaveLength(0);
      expect(result.score).toBe(0);
    });
  });

  describe('serializeVisualPhase', () => {
    it('creates PhaseResult from visual task results', () => {
      const result = serializeVisualPhase('phase_visual', {
        signResults: [
          { signId: 's1', playerAnswer: 'farmacia', correct: true },
          { signId: 's2', playerAnswer: 'banco', correct: true },
        ],
        signScore: 2,
        signMaxScore: 5,
        objectResults: [
          { objectId: 'o1', playerAnswer: 'silla', correct: true },
        ],
        objectScore: 1,
        objectMaxScore: 5,
        durationMs: 45000,
      });

      expect(result.phaseId).toBe('phase_visual');
      expect(result.score).toBe(3);
      expect(result.maxPoints).toBe(10);
      expect(result.transcript).toHaveLength(3); // 2 signs + 1 object
      expect(result.recordings).toHaveLength(1);
    });
  });
});

// ─── Tests: Assessment API Routes (migrated to quest overlays) ──────────────

vi.mock('../services/playthrough-overlay', () => ({
  getEntitiesWithOverlay: vi.fn(async (base: any[]) => base),
}));

describe('Assessment API Routes (migrated)', () => {
  let app: Express;
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    // Add quest overlay methods needed by new routes
    (mockStorage as any).getQuest = vi.fn();
    (mockStorage as any).getQuestsByWorld = vi.fn().mockResolvedValue([]);
    (mockStorage as any).getPlaythroughsByUser = vi.fn().mockResolvedValue([]);
    (mockStorage as any).getPlaythroughsByWorld = vi.fn().mockResolvedValue([]);
    (mockStorage as any).getPlaythrough = vi.fn();
    (mockStorage as any).getUserPlaythroughForWorld = vi.fn();
    (mockStorage as any).getDeltasByEntityType = vi.fn().mockResolvedValue([]);
    app = express();
    app.use(express.json());
    app.use('/api', createAssessmentRoutes(mockStorage as any));
  });

  it('POST /api/assessments returns 410 Gone', async () => {
    const res = await request(app).post('/api/assessments', {
      playerId: 'player1', worldId: 'world1', assessmentType: 'arrival',
    });
    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/retired/i);
  });

  it('PUT /api/assessments/:id/phases/:phaseId returns 410 Gone', async () => {
    const res = await request(app).put('/api/assessments/test_1/phases/conv_phase', { score: 18 });
    expect(res.status).toBe(410);
  });

  it('PUT /api/assessments/:id/recordings returns 410 Gone', async () => {
    const res = await request(app).put('/api/assessments/test_1/recordings', { phaseId: 'conv' });
    expect(res.status).toBe(410);
  });

  it('PUT /api/assessments/:id/complete returns 410 Gone', async () => {
    const res = await request(app).put('/api/assessments/test_1/complete', { totalScore: 38 });
    expect(res.status).toBe(410);
  });

  it('GET /api/assessments/:id returns quest overlay assessment data', async () => {
    (mockStorage as any).getQuest.mockResolvedValue({
      id: 'q1', worldId: 'w1', assignedTo: 'player1',
      questType: 'assessment', status: 'completed', tags: ['assessment', 'arrival'],
      targetLanguage: 'es',
      phaseResults: [{ phaseId: 'conv', score: 18, maxScore: 25, taskResults: [{ taskId: 't1', playerAnswer: 'Hola', score: 18, maxPoints: 25 }], dimensionScores: {}, completedAt: '2026-04-01' }],
      assessmentResult: { totalScore: 38, maxScore: 53, cefrLevel: 'B1', dimensionScores: {}, completedAt: '2026-04-01' },
    });

    const res = await request(app).get('/api/assessments/q1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('q1');
    expect(res.body.totalScore).toBe(38);
    expect(res.body.cefrLevel).toBe('B1');
  });

  it('GET /api/assessments/:id returns 404 for missing quest', async () => {
    (mockStorage as any).getQuest.mockResolvedValue(null);
    const res = await request(app).get('/api/assessments/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /api/assessments/player/:playerId returns assessments from playthroughs', async () => {
    (mockStorage as any).getPlaythroughsByUser.mockResolvedValue([{ id: 'pt1', worldId: 'w1', userId: 'player1' }]);
    (mockStorage as any).getQuestsByWorld.mockResolvedValue([{
      id: 'q1', worldId: 'w1', assignedTo: 'player1',
      questType: 'assessment', status: 'completed', tags: ['assessment', 'arrival'],
      targetLanguage: 'es',
      phaseResults: [{ phaseId: 'conv', score: 18, maxScore: 25, taskResults: [], dimensionScores: {}, completedAt: '2026-04-01' }],
      assessmentResult: { totalScore: 38, maxScore: 53, cefrLevel: 'B1', dimensionScores: {}, completedAt: '2026-04-01' },
    }]);

    const res = await request(app).get('/api/assessments/player/player1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].assessmentType).toBe('arrival');
  });

  it('GET /api/assessments/:id/transcripts returns phase result data', async () => {
    (mockStorage as any).getQuest.mockResolvedValue({
      id: 'q1', worldId: 'w1', assignedTo: 'player1',
      questType: 'assessment', status: 'completed', tags: ['assessment', 'arrival'],
      phaseResults: [{ phaseId: 'conv', score: 18, maxScore: 25, taskResults: [{ taskId: 't1', playerAnswer: 'Hola', score: 18, maxPoints: 25 }], dimensionScores: {}, completedAt: '2026-04-01' }],
      assessmentResult: { totalScore: 38, maxScore: 53, cefrLevel: 'B1', dimensionScores: {}, completedAt: '2026-04-01' },
    });

    const res = await request(app).get('/api/assessments/q1/transcripts');
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe('q1');
    expect(res.body.transcripts).toHaveLength(1);
    expect(res.body.transcripts[0].phaseId).toBe('conv');
  });

  it('GET /api/assessments/:id/recordings-list returns empty (retired)', async () => {
    const res = await request(app).get('/api/assessments/q1/recordings-list');
    expect(res.status).toBe(200);
    expect(res.body.recordings).toEqual([]);
  });
});
