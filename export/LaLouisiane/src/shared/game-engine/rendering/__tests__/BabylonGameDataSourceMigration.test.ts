/**
 * Tests verifying BabylonGame.ts migration to DataSource for all API calls.
 *
 * 1. BabylonGame.ts has no direct fetch() calls except auth (verify/login)
 * 2. New DataSource methods (simulateRichConversation, textToSpeech, getPortfolio,
 *    loadReadingProgress, syncReadingProgress) work correctly in ApiDataSource
 * 3. FileDataSource stubs return safe defaults for new methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ── 1. Static audit: BabylonGame.ts fetch calls ──────────────────────

describe('BabylonGame.ts fetch call audit', () => {
  const babylonGamePath = path.resolve(__dirname, '..', 'BabylonGame.ts');
  const source = fs.readFileSync(babylonGamePath, 'utf-8');
  const lines = source.split('\n');

  it('should only have fetch() calls for auth endpoints', () => {
    const fetchLines: { line: number; text: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('fetch(') || lines[i].includes('fetch(`')) {
        fetchLines.push({ line: i + 1, text: lines[i].trim() });
      }
    }

    // Should have exactly 2 fetch calls (auth/verify and auth/login)
    expect(fetchLines.length).toBe(2);

    const endpoints = fetchLines.map(f => f.text);
    expect(endpoints.some(e => e.includes('/api/auth/verify'))).toBe(true);
    expect(endpoints.some(e => e.includes('/api/auth/login'))).toBe(true);
  });

  it('should not contain any non-auth direct fetch calls', () => {
    const nonAuthFetches: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if ((line.includes('fetch(') || line.includes('fetch(`')) &&
          !line.includes('/api/auth/')) {
        nonAuthFetches.push(`Line ${i + 1}: ${line.trim()}`);
      }
    }
    expect(nonAuthFetches, `Found non-auth fetch calls:\n${nonAuthFetches.join('\n')}`).toHaveLength(0);
  });
});

// ── 2. ApiDataSource new methods ──────────────────────────────────────

describe('ApiDataSource new methods', () => {
  const globalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = globalFetch;
  });

  // Lazy import to avoid loading Babylon.js engine
  async function createApiDs() {
    const mod = await import('../DataSource');
    return new mod.ApiDataSource('test-token', 'http://localhost:3000');
  }

  describe('simulateRichConversation', () => {
    it('should POST to /api/conversations/simulate-rich and return data', async () => {
      const mockData = {
        utterances: [
          { speaker: 'NPC1', text: 'Bonjour!', gender: 'male' },
          { speaker: 'NPC2', text: 'Salut!', gender: 'female' },
        ],
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const ds = await createApiDs();
      const result = await ds.simulateRichConversation('world1', 'char1', 'char2', 4);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/conversations/simulate-rich',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ char1Id: 'char1', char2Id: 'char2', worldId: 'world1', turnCount: 4 }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should return null on failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });

      const ds = await createApiDs();
      const result = await ds.simulateRichConversation('w', 'a', 'b');
      expect(result).toBeNull();
    });
  });

  describe('textToSpeech', () => {
    it('should POST to /api/tts and return a blob', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/mp3' });
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const ds = await createApiDs();
      const result = await ds.textToSpeech('hello', 'Kore', 'female', 'fr');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/tts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: 'hello', voice: 'Kore', gender: 'female', targetLanguage: 'fr' }),
        }),
      );
      expect(result).toBe(mockBlob);
    });

    it('should return null on failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });

      const ds = await createApiDs();
      const result = await ds.textToSpeech('hello', 'Kore', 'female');
      expect(result).toBeNull();
    });
  });

  describe('getPortfolio', () => {
    it('should GET portfolio data', async () => {
      const mockPortfolio = { quests: [], skills: [] };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPortfolio),
      });

      const ds = await createApiDs();
      const result = await ds.getPortfolio('world1', 'Player Name');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/world1/portfolio/Player%20Name',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
      );
      expect(result).toEqual(mockPortfolio);
    });

    it('should return null on failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });

      const ds = await createApiDs();
      expect(await ds.getPortfolio('w', 'p')).toBeNull();
    });
  });

  describe('loadReadingProgress', () => {
    it('should GET reading progress with optional playthroughId', async () => {
      const mockProgress = { quizAnswers: [{ articleId: 'a1', correct: true }] };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProgress),
      });

      const ds = await createApiDs();
      const result = await ds.loadReadingProgress('player1', 'world1', 'pt1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/reading-progress/player1/world1?playthroughId=pt1',
        expect.any(Object),
      );
      expect(result).toEqual(mockProgress);
    });

    it('should omit playthroughId query when not provided', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const ds = await createApiDs();
      await ds.loadReadingProgress('p', 'w');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/reading-progress/p/w',
        expect.any(Object),
      );
    });

    it('should return null on failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });

      const ds = await createApiDs();
      expect(await ds.loadReadingProgress('p', 'w')).toBeNull();
    });
  });

  describe('syncReadingProgress', () => {
    it('should POST reading progress data', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

      const ds = await createApiDs();
      const data = {
        playerId: 'p1',
        worldId: 'w1',
        playthroughId: 'pt1',
        quizAnswers: [{ articleId: 'a', correct: true }],
        totalCorrect: 1,
        totalAttempted: 1,
      };
      await ds.syncReadingProgress(data);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/reading-progress/sync',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
    });
  });
});

// ── 3. FileDataSource stubs ──────────────────────────────────────────

describe('FileDataSource new method stubs', () => {
  it('should return safe defaults for all new methods', async () => {
    const mod = await import('../DataSource');
    const mockStorage = { getItem: vi.fn().mockReturnValue(null), setItem: vi.fn(), removeItem: vi.fn() };
    const ds = new mod.FileDataSource(mockStorage as any);

    expect(await ds.simulateRichConversation('w', 'a', 'b')).toBeNull();
    expect(await ds.textToSpeech('text', 'voice', 'gender')).toBeNull();
    expect(await ds.getPortfolio('w', 'p')).toBeNull();
    expect(await ds.loadReadingProgress('p', 'w')).toBeNull();
    await expect(ds.syncReadingProgress({
      playerId: 'p', worldId: 'w', quizAnswers: [], totalCorrect: 0, totalAttempted: 0,
    })).resolves.toBeUndefined();
  });
});
