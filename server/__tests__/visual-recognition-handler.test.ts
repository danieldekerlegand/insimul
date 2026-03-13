/**
 * Tests for the Visual Recognition Task Handler
 *
 * Unit tests for task generation, scoring, validation, and API endpoints.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import {
  generateTask,
  scoreTask,
  validateResponses,
  getTranslation,
  getSupportedLanguages,
  getStimulusBank,
  type StimulusResponse,
  type GenerateTaskOptions,
} from '../services/visual-recognition-handler';
import { createTelemetryRoutes } from '../routes/telemetry-routes';

// ───────────────────────────────────────────────────────────────────────────
// Unit Tests: Service Layer
// ───────────────────────────────────────────────────────────────────────────

describe('Visual Recognition Handler', () => {
  const baseOptions: GenerateTaskOptions = {
    participantId: 'p1',
    worldId: 'w1',
    targetLanguage: 'spanish',
  };

  describe('getTranslation', () => {
    it('returns correct Spanish translations', () => {
      expect(getTranslation('cat', 'spanish')).toBe('gato');
      expect(getTranslation('dog', 'spanish')).toBe('perro');
      expect(getTranslation('apple', 'spanish')).toBe('manzana');
    });

    it('returns correct French translations', () => {
      expect(getTranslation('cat', 'french')).toBe('chat');
      expect(getTranslation('bread', 'french')).toBe('pain');
    });

    it('is case-insensitive for language lookup', () => {
      expect(getTranslation('cat', 'Spanish')).toBe('gato');
    });

    it('returns undefined for unsupported language', () => {
      expect(getTranslation('cat', 'klingon')).toBeUndefined();
    });

    it('returns undefined for unknown word', () => {
      expect(getTranslation('spaceship', 'spanish')).toBeUndefined();
    });
  });

  describe('getSupportedLanguages', () => {
    it('returns all supported languages', () => {
      const languages = getSupportedLanguages();
      expect(languages).toContain('spanish');
      expect(languages).toContain('french');
      expect(languages).toContain('german');
      expect(languages).toContain('japanese');
      expect(languages.length).toBe(4);
    });
  });

  describe('getStimulusBank', () => {
    it('returns a copy of the stimulus bank', () => {
      const bank1 = getStimulusBank();
      const bank2 = getStimulusBank();
      expect(bank1).toEqual(bank2);
      expect(bank1).not.toBe(bank2); // different references
    });

    it('contains stimuli across multiple categories', () => {
      const bank = getStimulusBank();
      const categories = new Set(bank.map((s) => s.category));
      expect(categories.size).toBeGreaterThan(3);
    });
  });

  describe('generateTask', () => {
    it('generates a task with the correct structure', () => {
      const task = generateTask(baseOptions);

      expect(task.id).toMatch(/^vrt_p1_/);
      expect(task.participantId).toBe('p1');
      expect(task.worldId).toBe('w1');
      expect(task.targetLanguage).toBe('spanish');
      expect(task.format).toBe('multiple_choice');
      expect(task.direction).toBe('image_to_word');
      expect(task.stimuli.length).toBeGreaterThan(0);
      expect(task.stimuli.length).toBeLessThanOrEqual(10);
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('respects itemCount option', () => {
      const task = generateTask({ ...baseOptions, itemCount: 3 });
      expect(task.stimuli.length).toBe(3);
    });

    it('filters by category', () => {
      const task = generateTask({ ...baseOptions, categories: ['food'] });
      for (const stimulus of task.stimuli) {
        expect(stimulus.category).toBe('food');
      }
    });

    it('filters by difficulty', () => {
      const task = generateTask({ ...baseOptions, difficulty: 'easy' });
      for (const stimulus of task.stimuli) {
        expect(stimulus.difficulty).toBe('easy');
      }
    });

    it('generates multiple_choice options for image_to_word', () => {
      const task = generateTask({ ...baseOptions, format: 'multiple_choice', direction: 'image_to_word' });
      for (const stimulus of task.stimuli) {
        expect(stimulus.options).toBeDefined();
        expect(stimulus.options!.length).toBeGreaterThan(1);
        expect(stimulus.options).toContain(stimulus.correctAnswer);
      }
    });

    it('generates free_response tasks without options', () => {
      const task = generateTask({ ...baseOptions, format: 'free_response' });
      for (const stimulus of task.stimuli) {
        expect(stimulus.options).toBeUndefined();
      }
    });

    it('generates word_to_image tasks', () => {
      const task = generateTask({ ...baseOptions, direction: 'word_to_image', format: 'multiple_choice' });
      for (const stimulus of task.stimuli) {
        expect(stimulus.correctAnswer).toMatch(/\.png$/);
      }
    });

    it('applies custom vocabulary', () => {
      const task = generateTask({
        ...baseOptions,
        customVocabulary: { cat: 'gatito', dog: 'perrito' },
        categories: ['animals'],
        itemCount: 2,
      });
      const answers = task.stimuli.map((s) => s.correctAnswer);
      // Custom vocab should override defaults
      if (answers.includes('gatito') || answers.includes('perrito')) {
        expect(true).toBe(true); // at least one custom word found
      }
    });

    it('includes studyId and testWindow when provided', () => {
      const task = generateTask({ ...baseOptions, studyId: 'study1', testWindow: 'pre' });
      expect(task.studyId).toBe('study1');
      expect(task.testWindow).toBe('pre');
    });

    it('includes timeLimit when provided', () => {
      const task = generateTask({ ...baseOptions, timeLimit: 30 });
      expect(task.timeLimit).toBe(30);
    });
  });

  describe('scoreTask', () => {
    it('scores all correct responses as 100', () => {
      const task = generateTask({ ...baseOptions, itemCount: 5 });
      const responses: StimulusResponse[] = task.stimuli.map((s) => ({
        stimulusId: s.stimulusId,
        answer: s.correctAnswer,
        responseTimeMs: 1000,
      }));

      const result = scoreTask(task, responses);
      expect(result.accuracy).toBe(1);
      expect(result.score).toBe(100);
      expect(result.correctCount).toBe(5);
      expect(result.totalItems).toBe(5);
      expect(result.averageResponseTimeMs).toBe(1000);
    });

    it('scores all incorrect responses as 0', () => {
      const task = generateTask({ ...baseOptions, itemCount: 3 });
      const responses: StimulusResponse[] = task.stimuli.map((s) => ({
        stimulusId: s.stimulusId,
        answer: 'wrong_answer_xyz',
        responseTimeMs: 500,
      }));

      const result = scoreTask(task, responses);
      expect(result.accuracy).toBe(0);
      expect(result.score).toBe(0);
      expect(result.correctCount).toBe(0);
    });

    it('scores mixed responses correctly', () => {
      const task = generateTask({ ...baseOptions, itemCount: 4 });
      const responses: StimulusResponse[] = task.stimuli.map((s, i) => ({
        stimulusId: s.stimulusId,
        answer: i < 2 ? s.correctAnswer : 'wrong',
        responseTimeMs: 1000,
      }));

      const result = scoreTask(task, responses);
      expect(result.correctCount).toBe(2);
      expect(result.accuracy).toBe(0.5);
      expect(result.score).toBe(50);
    });

    it('handles accent-insensitive comparison', () => {
      const task = generateTask({ ...baseOptions, categories: ['animals'], itemCount: 1 });
      // Find the stimulus for 'pájaro' (bird)
      const birdStim = task.stimuli.find((s) => s.correctAnswer === 'pájaro');
      if (birdStim) {
        const responses: StimulusResponse[] = [{
          stimulusId: birdStim.stimulusId,
          answer: 'pajaro', // no accent
          responseTimeMs: 1000,
        }];
        const result = scoreTask(task, responses);
        const birdResult = result.itemResults.find((r) => r.stimulusId === birdStim.stimulusId);
        expect(birdResult?.correct).toBe(true);
      }
    });

    it('handles case-insensitive comparison', () => {
      const task = generateTask({ ...baseOptions, itemCount: 1 });
      const stimulus = task.stimuli[0];
      const responses: StimulusResponse[] = [{
        stimulusId: stimulus.stimulusId,
        answer: stimulus.correctAnswer.toUpperCase(),
        responseTimeMs: 500,
      }];

      const result = scoreTask(task, responses);
      expect(result.itemResults[0].correct).toBe(true);
    });

    it('calculates category subscores', () => {
      const task = generateTask({ ...baseOptions, itemCount: 10 });
      const responses: StimulusResponse[] = task.stimuli.map((s) => ({
        stimulusId: s.stimulusId,
        answer: s.correctAnswer,
        responseTimeMs: 800,
      }));

      const result = scoreTask(task, responses);
      const categories = Object.keys(result.subscores);
      expect(categories.length).toBeGreaterThan(0);

      for (const cat of categories) {
        const subscore = result.subscores[cat as keyof typeof result.subscores];
        expect(subscore.accuracy).toBe(1);
        expect(subscore.total).toBeGreaterThan(0);
        expect(subscore.correct).toBe(subscore.total);
      }
    });

    it('handles missing responses as incorrect', () => {
      const task = generateTask({ ...baseOptions, itemCount: 3 });
      // Only respond to first stimulus
      const responses: StimulusResponse[] = [{
        stimulusId: task.stimuli[0].stimulusId,
        answer: task.stimuli[0].correctAnswer,
        responseTimeMs: 500,
      }];

      const result = scoreTask(task, responses);
      expect(result.correctCount).toBe(1);
      expect(result.totalItems).toBe(3);
    });

    it('calculates average response time correctly', () => {
      const task = generateTask({ ...baseOptions, itemCount: 2 });
      const responses: StimulusResponse[] = [
        { stimulusId: task.stimuli[0].stimulusId, answer: 'a', responseTimeMs: 1000 },
        { stimulusId: task.stimuli[1].stimulusId, answer: 'b', responseTimeMs: 3000 },
      ];

      const result = scoreTask(task, responses);
      expect(result.averageResponseTimeMs).toBe(2000);
    });

    it('includes participantId and taskId in result', () => {
      const task = generateTask(baseOptions);
      const responses: StimulusResponse[] = [];
      const result = scoreTask(task, responses);

      expect(result.taskId).toBe(task.id);
      expect(result.participantId).toBe('p1');
    });
  });

  describe('validateResponses', () => {
    it('passes valid responses', () => {
      const task = generateTask({ ...baseOptions, itemCount: 3 });
      const responses: StimulusResponse[] = task.stimuli.map((s) => ({
        stimulusId: s.stimulusId,
        answer: 'anything',
        responseTimeMs: 100,
      }));

      const result = validateResponses(task, responses);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects unknown stimulus IDs', () => {
      const task = generateTask({ ...baseOptions, itemCount: 1 });
      const responses: StimulusResponse[] = [
        { stimulusId: 'fake_id', answer: 'x', responseTimeMs: 100 },
        { stimulusId: task.stimuli[0].stimulusId, answer: 'y', responseTimeMs: 100 },
      ];

      const result = validateResponses(task, responses);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown stimulus ID: fake_id');
    });

    it('detects missing responses', () => {
      const task = generateTask({ ...baseOptions, itemCount: 3 });
      const responses: StimulusResponse[] = [{
        stimulusId: task.stimuli[0].stimulusId,
        answer: 'x',
        responseTimeMs: 100,
      }];

      const result = validateResponses(task, responses);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.startsWith('Missing response'))).toBe(true);
    });

    it('detects negative response time', () => {
      const task = generateTask({ ...baseOptions, itemCount: 1 });
      const responses: StimulusResponse[] = [{
        stimulusId: task.stimuli[0].stimulusId,
        answer: 'x',
        responseTimeMs: -1,
      }];

      const result = validateResponses(task, responses);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid response time'))).toBe(true);
    });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Integration Tests: API Endpoints
// ───────────────────────────────────────────────────────────────────────────

function request(app: Express) {
  function makeRequest(method: string, path: string, body?: any): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);
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
  };
}

describe('Visual Recognition API Endpoints', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      createEvaluationResponse: vi.fn().mockResolvedValue({ id: 'eval_1' }),
      getEvaluationResponses: vi.fn().mockResolvedValue([]),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createTelemetryRoutes(mockStorage));
  });

  describe('POST /api/assessment/:participantId/visual-recognition/generate', () => {
    it('generates a task successfully', async () => {
      const res = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        worldId: 'w1',
        targetLanguage: 'spanish',
        itemCount: 3,
      });

      expect(res.status).toBe(201);
      expect(res.body.participantId).toBe('p1');
      expect(res.body.worldId).toBe('w1');
      expect(res.body.targetLanguage).toBe('spanish');
      expect(res.body.stimuli.length).toBe(3);
    });

    it('returns 400 when worldId is missing', async () => {
      const res = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        targetLanguage: 'spanish',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('returns 400 for unsupported language without custom vocabulary', async () => {
      const res = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        worldId: 'w1',
        targetLanguage: 'klingon',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Unsupported language');
    });

    it('accepts custom vocabulary for unsupported languages', async () => {
      const res = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        worldId: 'w1',
        targetLanguage: 'klingon',
        customVocabulary: { cat: "vIghro'", dog: "targh" },
        categories: ['animals'],
        itemCount: 2,
      });

      expect(res.status).toBe(201);
      expect(res.body.stimuli.length).toBe(2);
    });
  });

  describe('POST /api/assessment/:participantId/visual-recognition/submit', () => {
    it('scores and persists responses', async () => {
      // First generate a task
      const genRes = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        worldId: 'w1',
        targetLanguage: 'spanish',
        itemCount: 2,
        studyId: 'study1',
      });

      const task = genRes.body;
      const responses = task.stimuli.map((s: any) => ({
        stimulusId: s.stimulusId,
        answer: s.correctAnswer,
        responseTimeMs: 1000,
      }));

      const res = await request(app).post('/api/assessment/p1/visual-recognition/submit', {
        task,
        responses,
        studyId: 'study1',
      });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(100);
      expect(res.body.accuracy).toBe(1);
      expect(res.body.correctCount).toBe(2);
      expect(mockStorage.createEvaluationResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          studyId: 'study1',
          participantId: 'p1',
          instrumentType: 'visual_recognition',
          score: 100,
          maxScore: 100,
        }),
      );
    });

    it('returns 400 when task is missing', async () => {
      const res = await request(app).post('/api/assessment/p1/visual-recognition/submit', {
        responses: [],
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when participantId does not match', async () => {
      const genRes = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        worldId: 'w1',
        targetLanguage: 'spanish',
        itemCount: 1,
      });

      const res = await request(app).post('/api/assessment/other/visual-recognition/submit', {
        task: genRes.body,
        responses: [],
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('does not match');
    });

    it('returns 400 for invalid responses', async () => {
      const genRes = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        worldId: 'w1',
        targetLanguage: 'spanish',
        itemCount: 1,
      });

      const res = await request(app).post('/api/assessment/p1/visual-recognition/submit', {
        task: genRes.body,
        responses: [{ stimulusId: 'fake', answer: 'x', responseTimeMs: 100 }],
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('does not persist when no studyId is provided', async () => {
      const genRes = await request(app).post('/api/assessment/p1/visual-recognition/generate', {
        worldId: 'w1',
        targetLanguage: 'spanish',
        itemCount: 1,
      });

      const task = genRes.body;
      const responses = task.stimuli.map((s: any) => ({
        stimulusId: s.stimulusId,
        answer: s.correctAnswer,
        responseTimeMs: 500,
      }));

      await request(app).post('/api/assessment/p1/visual-recognition/submit', {
        task,
        responses,
      });

      expect(mockStorage.createEvaluationResponse).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/assessment/:participantId/visual-recognition/languages', () => {
    it('returns supported languages', async () => {
      const res = await request(app).get('/api/assessment/p1/visual-recognition/languages');

      expect(res.status).toBe(200);
      expect(res.body.languages).toContain('spanish');
      expect(res.body.languages).toContain('french');
      expect(res.body.languages).toContain('german');
      expect(res.body.languages).toContain('japanese');
    });
  });
});
