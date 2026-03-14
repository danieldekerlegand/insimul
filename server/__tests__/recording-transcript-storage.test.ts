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

// ─── Tests: Assessment API Routes ────────────────────────────────────────────

describe('Assessment API Routes', () => {
  let app: Express;
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    app = express();
    app.use(express.json());
    app.use('/api', createAssessmentRoutes(mockStorage as any));
  });

  it('POST /api/assessments creates a session', async () => {
    const res = await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      targetLanguage: 'es',
      totalMaxPoints: 53,
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('test_1');
    expect(res.body.playerId).toBe('player1');
    expect(mockStorage.createAssessmentSession).toHaveBeenCalledTimes(1);
  });

  it('POST /api/assessments returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/assessments', { playerId: 'p1' });
    expect(res.status).toBe(400);
  });

  it('GET /api/assessments/:id returns session', async () => {
    // Create first
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    const res = await request(app).get('/api/assessments/test_1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('test_1');
  });

  it('GET /api/assessments/:id returns 404 for missing session', async () => {
    const res = await request(app).get('/api/assessments/nonexistent');
    expect(res.status).toBe(404);
  });

  it('PUT /api/assessments/:id/phases/:phaseId persists phase result with transcript', async () => {
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    const phaseResult = serializeConversationPhase(
      'conv_phase',
      [
        { role: 'npc', text: 'Hola!', timestamp: 1000 },
        { role: 'player', text: 'Hola, buenos días.', timestamp: 2000 },
      ],
      18, 25,
    );

    const res = await request(app).put('/api/assessments/test_1/phases/conv_phase', phaseResult);
    expect(res.status).toBe(200);
    expect(mockStorage.updateAssessmentPhaseResult).toHaveBeenCalledTimes(1);

    // Verify transcript was persisted
    const call = mockStorage.updateAssessmentPhaseResult.mock.calls[0];
    expect(call[1].transcript).toHaveLength(2);
    expect(call[1].transcript[0].role).toBe('npc');
    expect(call[1].recordings).toHaveLength(1);
  });

  it('PUT /api/assessments/:id/recordings adds recording', async () => {
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    const res = await request(app).put('/api/assessments/test_1/recordings', {
      storageKey: 'transcript:conv:conversation',
      mimeType: 'text/plain',
      phaseId: 'conv_phase',
      recordedAt: new Date().toISOString(),
    });

    expect(res.status).toBe(200);
    expect(mockStorage.addAssessmentRecording).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/assessments/:id/recordings returns 400 without phaseId', async () => {
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    const res = await request(app).put('/api/assessments/test_1/recordings', {
      storageKey: 'test',
      mimeType: 'text/plain',
    });
    expect(res.status).toBe(400);
  });

  it('PUT /api/assessments/:id/complete finalizes session', async () => {
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    const res = await request(app).put('/api/assessments/test_1/complete', {
      totalScore: 38,
      maxScore: 53,
      cefrLevel: 'B1',
    });

    expect(res.status).toBe(200);
    expect(mockStorage.completeAssessmentSession).toHaveBeenCalledWith('test_1', 38, 53, 'B1');
  });

  it('GET /api/assessments/player/:playerId returns player sessions', async () => {
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    const res = await request(app).get('/api/assessments/player/player1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('GET /api/assessments/:id/transcripts returns phase transcripts', async () => {
    // Create session and add a phase with transcript
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    const phaseResult = serializeConversationPhase(
      'conv',
      [
        { role: 'npc', text: 'Hola!', timestamp: 1000 },
        { role: 'player', text: 'Buenos días!', timestamp: 2000 },
      ],
      18, 25,
    );
    await request(app).put('/api/assessments/test_1/phases/conv', phaseResult);

    const res = await request(app).get('/api/assessments/test_1/transcripts');
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe('test_1');
    expect(res.body.transcripts).toHaveLength(1);
    expect(res.body.transcripts[0].phaseId).toBe('conv');
    expect(res.body.transcripts[0].entries).toHaveLength(2);
  });

  it('GET /api/assessments/:id/recordings-list returns all recordings', async () => {
    await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      totalMaxPoints: 53,
    });

    await request(app).put('/api/assessments/test_1/recordings', {
      storageKey: 'rec1',
      mimeType: 'text/plain',
      phaseId: 'conv',
      recordedAt: new Date().toISOString(),
    });

    const res = await request(app).get('/api/assessments/test_1/recordings-list');
    expect(res.status).toBe(200);
    expect(res.body.recordings).toHaveLength(1);
  });
});

// ─── Tests: Full Integration Flow ────────────────────────────────────────────

describe('Full Integration Flow', () => {
  let app: Express;
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    app = express();
    app.use(express.json());
    app.use('/api', createAssessmentRoutes(mockStorage as any));
  });

  it('end-to-end: create session, persist all phases with transcripts, complete', async () => {
    // 1. Create session
    const createRes = await request(app).post('/api/assessments', {
      playerId: 'player1',
      worldId: 'world1',
      assessmentType: 'arrival',
      assessmentDefinitionId: 'arrival_encounter_v1',
      targetLanguage: 'es',
      totalMaxPoints: 53,
    });
    expect(createRes.status).toBe(201);
    const sessionId = createRes.body.id;

    // 2. Phase 1: Conversation
    const convResult = serializeConversationPhase(
      'phase1_conv',
      [
        { role: 'npc', text: 'Bienvenido a Madrid!', timestamp: 1000 },
        { role: 'player', text: 'Gracias, estoy muy contento de estar aquí.', timestamp: 5000 },
        { role: 'npc', text: 'Qué bien! De dónde viene?', timestamp: 7000 },
        { role: 'player', text: 'Vengo de los Estados Unidos.', timestamp: 10000 },
      ],
      18, 25,
      { vocab: 3.5, grammar: 3.0, fluency: 3.5, pronunciation: 4.0, comprehension: 4.0 },
      { wpm: 25, ttr: 0.75, mlu: 5.5 },
    );
    await request(app).put(`/api/assessments/${sessionId}/phases/phase1_conv`, convResult);
    for (const rec of convResult.recordings || []) {
      await request(app).put(`/api/assessments/${sessionId}/recordings`, rec);
    }

    // 3. Phase 2: Listening
    const listenResult = serializeListeningPhase('phase2_listen', {
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
        { questionId: 'q1', playerAnswer: 'el mercado', correct: true },
        { questionId: 'q2', playerAnswer: 'dos', correct: true },
        { questionId: 'q3', playerAnswer: 'mañana', correct: false },
      ],
      announcementText: 'Vamos a hacer un tour por el centro...',
      durationMs: 180000,
    });
    await request(app).put(`/api/assessments/${sessionId}/phases/phase2_listen`, listenResult);

    // 4. Phase 3: Writing
    const writeResult = serializeWritingPhase('phase3_write', {
      formFields: { name: 'Juan García', origin: 'Estados Unidos', reason: 'turismo', duration: 'dos semanas', additional: 'nada' },
      formScore: 4,
      formMaxPoints: 5,
      messageText: 'Estimado gerente, quisiera reservar una habitación doble para dos semanas.',
      messageScore: 5,
      messageMaxPoints: 6,
      startedAt: 200000,
      completedAt: 350000,
    });
    await request(app).put(`/api/assessments/${sessionId}/phases/phase3_write`, writeResult);

    // 5. Complete session
    const totalScore = convResult.score + listenResult.score + writeResult.score;
    const completeRes = await request(app).put(`/api/assessments/${sessionId}/complete`, {
      totalScore,
      maxScore: 53,
      cefrLevel: 'B1',
    });
    expect(completeRes.status).toBe(200);

    // 6. Verify transcripts endpoint
    const transcriptsRes = await request(app).get(`/api/assessments/${sessionId}/transcripts`);
    expect(transcriptsRes.status).toBe(200);
    expect(transcriptsRes.body.transcripts).toHaveLength(3);

    // Verify conversation transcript
    const convTranscript = transcriptsRes.body.transcripts.find((t: any) => t.phaseId === 'phase1_conv');
    expect(convTranscript).toBeDefined();
    expect(convTranscript.entries).toHaveLength(4);

    // Verify listening transcript
    const listenTranscript = transcriptsRes.body.transcripts.find((t: any) => t.phaseId === 'phase2_listen');
    expect(listenTranscript).toBeDefined();
    expect(listenTranscript.entries.length).toBeGreaterThan(0);

    // Verify writing transcript
    const writeTranscript = transcriptsRes.body.transcripts.find((t: any) => t.phaseId === 'phase3_write');
    expect(writeTranscript).toBeDefined();
    expect(writeTranscript.entries.length).toBeGreaterThan(0);

    // 7. Verify recordings endpoint
    const recRes = await request(app).get(`/api/assessments/${sessionId}/recordings-list`);
    expect(recRes.status).toBe(200);
    expect(recRes.body.recordings.length).toBeGreaterThan(0);
  });
});
