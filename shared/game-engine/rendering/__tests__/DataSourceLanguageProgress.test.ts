/**
 * Tests for DataSource language progress methods.
 * Covers FileDataSource localStorage-backed implementations.
 * ApiDataSource methods are thin fetch wrappers tested via integration tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FileDataSource } from '../DataSource';

// In-memory storage mock
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

describe('DataSource language progress methods', () => {
  let storage: MemoryStorage;
  let ds: FileDataSource;

  beforeEach(() => {
    storage = new MemoryStorage();
    ds = new FileDataSource(storage);
  });

  // ── loadLanguageProgress ──────────────────────────────────────────────────

  describe('loadLanguageProgress', () => {
    it('returns null when no progress exists', async () => {
      const result = await ds.loadLanguageProgress('player1', 'world1');
      expect(result).toBeNull();
    });

    it('returns saved progress', async () => {
      const data = {
        playerId: 'player1',
        worldId: 'world1',
        progress: { overallFluency: 0.5 },
        vocabulary: [{ word: 'kali', meaning: 'hello' }],
        grammarPatterns: [],
        conversations: [],
      };
      await ds.saveLanguageProgress(data);
      const result = await ds.loadLanguageProgress('player1', 'world1');
      expect(result).toEqual(data);
    });

    it('scopes by playthroughId when provided', async () => {
      const data1 = {
        playerId: 'p1',
        worldId: 'w1',
        playthroughId: 'pt1',
        progress: { overallFluency: 0.3 },
        vocabulary: [],
        grammarPatterns: [],
        conversations: [],
      };
      const data2 = {
        playerId: 'p1',
        worldId: 'w1',
        playthroughId: 'pt2',
        progress: { overallFluency: 0.7 },
        vocabulary: [],
        grammarPatterns: [],
        conversations: [],
      };
      await ds.saveLanguageProgress(data1);
      await ds.saveLanguageProgress(data2);

      const result1 = await ds.loadLanguageProgress('p1', 'w1', 'pt1');
      expect(result1.progress.overallFluency).toBe(0.3);

      const result2 = await ds.loadLanguageProgress('p1', 'w1', 'pt2');
      expect(result2.progress.overallFluency).toBe(0.7);
    });

    it('returns null for corrupted storage data', async () => {
      storage.setItem('insimul_lang_progress_p1_w1', 'not-json');
      const result = await ds.loadLanguageProgress('p1', 'w1');
      expect(result).toBeNull();
    });
  });

  // ── saveLanguageProgress ──────────────────────────────────────────────────

  describe('saveLanguageProgress', () => {
    it('persists data to storage', async () => {
      const data = {
        playerId: 'player1',
        worldId: 'world1',
        progress: { overallFluency: 0.42 },
        vocabulary: [{ word: 'akwa', meaning: 'water' }],
        grammarPatterns: [{ pattern: 'SVO', correctUsages: 5 }],
        conversations: [{ id: 'conv1', characterName: 'Merchant' }],
      };
      await ds.saveLanguageProgress(data);

      const raw = storage.getItem('insimul_lang_progress_player1_world1');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(data);
    });

    it('overwrites previous progress for same key', async () => {
      const base = {
        playerId: 'p1',
        worldId: 'w1',
        progress: { overallFluency: 0.1 },
        vocabulary: [],
        grammarPatterns: [],
        conversations: [],
      };
      await ds.saveLanguageProgress(base);
      await ds.saveLanguageProgress({ ...base, progress: { overallFluency: 0.9 } });

      const result = await ds.loadLanguageProgress('p1', 'w1');
      expect(result.progress.overallFluency).toBe(0.9);
    });
  });

  // ── getLanguageProfile ────────────────────────────────────────────────────

  describe('getLanguageProfile', () => {
    it('returns null when no progress exists', async () => {
      const result = await ds.getLanguageProfile('world1', 'player1');
      expect(result).toBeNull();
    });

    it('builds profile from stored progress', async () => {
      await ds.saveLanguageProgress({
        playerId: 'p1',
        worldId: 'w1',
        progress: { overallFluency: 0.65 },
        vocabulary: [
          { word: 'kali', meaning: 'hello' },
          { word: 'akwa', meaning: 'water' },
        ],
        grammarPatterns: [{ pattern: 'SVO' }],
        conversations: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
      });

      const profile = await ds.getLanguageProfile('w1', 'p1');
      expect(profile).toEqual({
        playerId: 'p1',
        worldId: 'w1',
        overallFluency: 0.65,
        vocabularyCount: 2,
        grammarPatternCount: 1,
        conversationCount: 3,
      });
    });
  });

  // ── getLanguages ──────────────────────────────────────────────────────────

  describe('getLanguages', () => {
    it('returns empty array when no world data loaded', async () => {
      const result = await ds.getLanguages('world1');
      expect(result).toEqual([]);
    });
  });
});
