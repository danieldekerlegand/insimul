/**
 * Tests for vocabulary and grammar progress persistence endpoints.
 *
 * Covers:
 *  - GET /api/language-progress/:playerId/:worldId
 *  - POST /api/language-progress/sync
 *  - GET /api/vocabulary/:playerId/:worldId
 *  - PUT /api/vocabulary/:playerId/:worldId/:word
 *  - GET /api/grammar-patterns/:playerId/:worldId
 *  - PUT /api/grammar-patterns/:playerId/:worldId/:pattern
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { createTelemetryRoutes } from '../routes/telemetry-routes';

// Lightweight request helper (no supertest dependency)
function request(app: Express) {
  function makeRequest(method: string, path: string, body?: any): Promise<{ status: number; body: any }> {
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

describe('Language progress persistence endpoints', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      getLanguageProgress: vi.fn().mockResolvedValue({ overallFluency: 42, totalWordsLearned: 10 }),
      upsertLanguageProgress: vi.fn().mockResolvedValue({ overallFluency: 50 }),
      getVocabularyEntries: vi.fn().mockResolvedValue([
        { word: 'bonjour', meaning: 'hello', masteryLevel: 'familiar', timesEncountered: 5 },
      ]),
      upsertVocabularyEntry: vi.fn().mockImplementation((_pid, _wid, word, data) =>
        Promise.resolve({ word, ...data, id: 'v1' })
      ),
      getGrammarPatterns: vi.fn().mockResolvedValue([
        { pattern: 'past tense', correctUsages: 3, incorrectUsages: 1 },
      ]),
      upsertGrammarPattern: vi.fn().mockImplementation((_pid, _wid, pattern, data) =>
        Promise.resolve({ pattern, ...data, id: 'g1' })
      ),
      getConversationRecords: vi.fn().mockResolvedValue([]),
      createConversationRecord: vi.fn().mockImplementation((data) =>
        Promise.resolve({ ...data, id: 'c1' })
      ),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createTelemetryRoutes(mockStorage));
  });

  // ============= GET /api/language-progress/:playerId/:worldId =============

  describe('GET /api/language-progress/:playerId/:worldId', () => {
    it('returns full progress with vocabulary, grammar, and conversations', async () => {
      const res = await request(app).get('/api/language-progress/player1/world1');

      expect(res.status).toBe(200);
      expect(res.body.progress).toEqual({ overallFluency: 42, totalWordsLearned: 10 });
      expect(res.body.vocabulary).toHaveLength(1);
      expect(res.body.vocabulary[0].word).toBe('bonjour');
      expect(res.body.grammarPatterns).toHaveLength(1);
      expect(res.body.grammarPatterns[0].pattern).toBe('past tense');
      expect(mockStorage.getLanguageProgress).toHaveBeenCalledWith('player1', 'world1', undefined);
    });

    it('passes playthroughId query param to storage', async () => {
      await request(app).get('/api/language-progress/player1/world1?playthroughId=pt42');

      expect(mockStorage.getLanguageProgress).toHaveBeenCalledWith('player1', 'world1', 'pt42');
      expect(mockStorage.getVocabularyEntries).toHaveBeenCalledWith('player1', 'world1', 'pt42');
      expect(mockStorage.getGrammarPatterns).toHaveBeenCalledWith('player1', 'world1', 'pt42');
      expect(mockStorage.getConversationRecords).toHaveBeenCalledWith('player1', 'world1', 'pt42');
    });
  });

  // ============= POST /api/language-progress/sync =============

  describe('POST /api/language-progress/sync', () => {
    it('returns 400 when playerId or worldId is missing', async () => {
      const res = await request(app).post('/api/language-progress/sync', { playerId: 'p1' });
      expect(res.status).toBe(400);
    });

    it('upserts progress, vocabulary, grammar, and conversations', async () => {
      const res = await request(app).post('/api/language-progress/sync', {
        playerId: 'p1',
        worldId: 'w1',
        progress: { overallFluency: 55 },
        vocabulary: [
          { word: 'merci', meaning: 'thank you', masteryLevel: 'new' },
          { word: 'salut', meaning: 'hi', masteryLevel: 'learning' },
        ],
        grammarPatterns: [
          { pattern: 'negation', correctUsages: 2, incorrectUsages: 0 },
        ],
        conversations: [
          { characterId: 'npc1', turns: 5 },
        ],
      });

      expect(res.status).toBe(200);
      expect(res.body.synced).toBe(true);
      expect(mockStorage.upsertLanguageProgress).toHaveBeenCalledWith('p1', 'w1', { overallFluency: 55 }, undefined);
      expect(mockStorage.upsertVocabularyEntry).toHaveBeenCalledTimes(2);
      expect(mockStorage.upsertGrammarPattern).toHaveBeenCalledTimes(1);
      expect(mockStorage.createConversationRecord).toHaveBeenCalledTimes(1);
    });

    it('skips vocabulary entries without word field', async () => {
      await request(app).post('/api/language-progress/sync', {
        playerId: 'p1',
        worldId: 'w1',
        vocabulary: [{ meaning: 'no word field' }, { word: 'bon', meaning: 'good' }],
      });

      expect(mockStorage.upsertVocabularyEntry).toHaveBeenCalledTimes(1);
    });

    it('skips grammar patterns without pattern field', async () => {
      await request(app).post('/api/language-progress/sync', {
        playerId: 'p1',
        worldId: 'w1',
        grammarPatterns: [{ correctUsages: 1 }, { pattern: 'articles', correctUsages: 3 }],
      });

      expect(mockStorage.upsertGrammarPattern).toHaveBeenCalledTimes(1);
    });

    it('passes playthroughId to all upserts', async () => {
      await request(app).post('/api/language-progress/sync', {
        playerId: 'p1',
        worldId: 'w1',
        playthroughId: 'pt99',
        vocabulary: [{ word: 'oui', meaning: 'yes' }],
        grammarPatterns: [{ pattern: 'pronouns', correctUsages: 1 }],
      });

      expect(mockStorage.upsertVocabularyEntry).toHaveBeenCalledWith('p1', 'w1', 'oui', expect.any(Object), 'pt99');
      expect(mockStorage.upsertGrammarPattern).toHaveBeenCalledWith('p1', 'w1', 'pronouns', expect.any(Object), 'pt99');
    });
  });

  // ============= GET /api/vocabulary/:playerId/:worldId =============

  describe('GET /api/vocabulary/:playerId/:worldId', () => {
    it('returns vocabulary entries', async () => {
      const res = await request(app).get('/api/vocabulary/player1/world1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].word).toBe('bonjour');
      expect(mockStorage.getVocabularyEntries).toHaveBeenCalledWith('player1', 'world1', undefined);
    });

    it('passes playthroughId query param', async () => {
      await request(app).get('/api/vocabulary/player1/world1?playthroughId=pt1');
      expect(mockStorage.getVocabularyEntries).toHaveBeenCalledWith('player1', 'world1', 'pt1');
    });
  });

  // ============= PUT /api/vocabulary/:playerId/:worldId/:word =============

  describe('PUT /api/vocabulary/:playerId/:worldId/:word', () => {
    it('upserts a single vocabulary entry', async () => {
      const res = await request(app).put('/api/vocabulary/p1/w1/bonjour', {
        meaning: 'hello',
        masteryLevel: 'familiar',
        timesEncountered: 10,
      });

      expect(res.status).toBe(200);
      expect(res.body.word).toBe('bonjour');
      expect(mockStorage.upsertVocabularyEntry).toHaveBeenCalledWith(
        'p1', 'w1', 'bonjour',
        { meaning: 'hello', masteryLevel: 'familiar', timesEncountered: 10 },
        undefined
      );
    });

    it('decodes URL-encoded word parameter', async () => {
      await request(app).put('/api/vocabulary/p1/w1/c%27est', { meaning: "it is" });
      expect(mockStorage.upsertVocabularyEntry).toHaveBeenCalledWith(
        'p1', 'w1', "c'est", expect.any(Object), undefined
      );
    });
  });

  // ============= GET /api/grammar-patterns/:playerId/:worldId =============

  describe('GET /api/grammar-patterns/:playerId/:worldId', () => {
    it('returns grammar patterns', async () => {
      const res = await request(app).get('/api/grammar-patterns/player1/world1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].pattern).toBe('past tense');
      expect(mockStorage.getGrammarPatterns).toHaveBeenCalledWith('player1', 'world1', undefined);
    });

    it('passes playthroughId query param', async () => {
      await request(app).get('/api/grammar-patterns/player1/world1?playthroughId=pt2');
      expect(mockStorage.getGrammarPatterns).toHaveBeenCalledWith('player1', 'world1', 'pt2');
    });
  });

  // ============= PUT /api/grammar-patterns/:playerId/:worldId/:pattern =============

  describe('PUT /api/grammar-patterns/:playerId/:worldId/:pattern', () => {
    it('upserts a single grammar pattern', async () => {
      const res = await request(app).put('/api/grammar-patterns/p1/w1/past%20tense', {
        correctUsages: 5,
        incorrectUsages: 1,
        masteryLevel: 'familiar',
      });

      expect(res.status).toBe(200);
      expect(res.body.pattern).toBe('past tense');
      expect(mockStorage.upsertGrammarPattern).toHaveBeenCalledWith(
        'p1', 'w1', 'past tense',
        { correctUsages: 5, incorrectUsages: 1, masteryLevel: 'familiar' },
        undefined
      );
    });
  });

  // ============= Error handling =============

  describe('Error handling', () => {
    it('returns 500 when getVocabularyEntries throws', async () => {
      mockStorage.getVocabularyEntries.mockRejectedValueOnce(new Error('DB error'));
      const res = await request(app).get('/api/vocabulary/p1/w1');
      expect(res.status).toBe(500);
    });

    it('returns 500 when upsertGrammarPattern throws', async () => {
      mockStorage.upsertGrammarPattern.mockRejectedValueOnce(new Error('DB error'));
      const res = await request(app).put('/api/grammar-patterns/p1/w1/test', { correctUsages: 1 });
      expect(res.status).toBe(500);
    });

    it('returns 500 when language progress sync fails', async () => {
      mockStorage.upsertLanguageProgress.mockRejectedValueOnce(new Error('DB error'));
      const res = await request(app).post('/api/language-progress/sync', {
        playerId: 'p1',
        worldId: 'w1',
        progress: { overallFluency: 10 },
      });
      expect(res.status).toBe(500);
    });
  });
});
