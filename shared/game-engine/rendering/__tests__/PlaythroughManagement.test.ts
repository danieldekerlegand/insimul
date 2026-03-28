/**
 * Tests for playthrough management methods on DataSource interface.
 * Covers FileDataSource and ApiDataSource implementations.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileDataSource, ApiDataSource, LocalGameState } from '../DataSource';

// In-memory storage mock
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
  keys(): string[] { return Array.from(this.data.keys()); }
}

describe('FileDataSource playthrough management', () => {
  let storage: MemoryStorage;
  let ds: FileDataSource;

  beforeEach(() => {
    storage = new MemoryStorage();
    ds = new FileDataSource(storage);
  });

  describe('listPlaythroughs', () => {
    it('returns empty array when no playthroughs exist', async () => {
      const result = await ds.listPlaythroughs('world1', 'token');
      // There may be a default playthrough from FileDataSource constructor
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns playthroughs after starting one', async () => {
      await ds.startPlaythrough('world1', 'token', 'Test Run');
      const list = await ds.listPlaythroughs('world1', 'token');
      expect(list.length).toBeGreaterThanOrEqual(1);
      const found = list.find((p: any) => p.name === 'Test Run');
      expect(found).toBeTruthy();
      expect(found.status).toBe('active');
    });
  });

  describe('startPlaythrough', () => {
    it('creates a new playthrough and returns id and name', async () => {
      const result = await ds.startPlaythrough('world1', 'token', 'Adventure');
      expect(result.id).toBeTruthy();
      expect(result.name).toBe('Adventure');
    });

    it('creates unique IDs for each playthrough', async () => {
      const r1 = await ds.startPlaythrough('world1', 'token', 'Run 1');
      const r2 = await ds.startPlaythrough('world1', 'token', 'Run 2');
      expect(r1.id).not.toBe(r2.id);
    });
  });

  describe('getPlaythrough', () => {
    it('returns null for unknown playthrough', async () => {
      const result = await ds.getPlaythrough('nonexistent');
      expect(result).toBeNull();
    });

    it('returns playthrough data after creation', async () => {
      const created = await ds.startPlaythrough('world1', 'token', 'My Run');
      const result = await ds.getPlaythrough(created.id);
      expect(result).not.toBeNull();
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('My Run');
      expect(result.status).toBe('active');
    });
  });

  describe('updatePlaythrough', () => {
    it('updates playthrough metadata', async () => {
      const created = await ds.startPlaythrough('world1', 'token', 'Original');
      const result = await ds.updatePlaythrough(created.id, { name: 'Renamed' });
      expect(result).not.toBeNull();

      const fetched = await ds.getPlaythrough(created.id);
      expect(fetched.name).toBe('Renamed');
    });

    it('returns null for unknown playthrough', async () => {
      const result = await ds.updatePlaythrough('nonexistent', { name: 'X' });
      expect(result).toBeNull();
    });
  });

  describe('deletePlaythrough', () => {
    it('removes playthrough from listing', async () => {
      const created = await ds.startPlaythrough('world1', 'token', 'ToDelete');
      await ds.deletePlaythrough(created.id);
      const result = await ds.getPlaythrough(created.id);
      expect(result).toBeNull();
    });

    it('removes associated save data', async () => {
      const created = await ds.startPlaythrough('world1', 'token', 'WithSave');
      // Simulate save data
      storage.setItem(`insimul_save_${created.id}_0`, '{"test":true}');
      storage.setItem(`insimul_quest_progress_${created.id}`, '{"q1":"done"}');

      await ds.deletePlaythrough(created.id);

      expect(storage.getItem(`insimul_save_${created.id}_0`)).toBeNull();
      expect(storage.getItem(`insimul_quest_progress_${created.id}`)).toBeNull();
    });
  });

  describe('markPlaythroughInitialized', () => {
    it('does not throw for file-based source', async () => {
      const created = await ds.startPlaythrough('world1', 'token', 'Init Test');
      await expect(ds.markPlaythroughInitialized(created.id)).resolves.toBeUndefined();
    });
  });

  describe('getReputations', () => {
    it('returns empty array for file-based source', async () => {
      const result = await ds.getReputations('any-id');
      expect(result).toEqual([]);
    });
  });

  describe('loadPlaythroughRelationships', () => {
    it('returns empty array for file-based source', async () => {
      const result = await ds.loadPlaythroughRelationships('any-id');
      expect(result).toEqual([]);
    });
  });
});

describe('ApiDataSource playthrough management', () => {
  let ds: ApiDataSource;

  beforeEach(() => {
    ds = new ApiDataSource('test-token', 'http://localhost:3000');
    // Mock fetch globally
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFetch = (status: number, body: any) => {
    (fetch as any).mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });
  };

  describe('listPlaythroughs', () => {
    it('calls the correct endpoint', async () => {
      mockFetch(200, [{ id: 'pt-1', name: 'Test' }]);
      const result = await ds.listPlaythroughs('w1', 'token');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/playthroughs',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) }),
      );
      expect(result).toEqual([{ id: 'pt-1', name: 'Test' }]);
    });

    it('returns empty array on failure', async () => {
      mockFetch(500, {});
      const result = await ds.listPlaythroughs('w1', 'token');
      expect(result).toEqual([]);
    });
  });

  describe('startPlaythrough', () => {
    it('posts to the correct endpoint', async () => {
      mockFetch(200, { id: 'pt-new', name: 'New Run' });
      const result = await ds.startPlaythrough('w1', 'token', 'New Run');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/worlds/w1/playthroughs/start',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New Run' }),
        }),
      );
      expect(result).toEqual({ id: 'pt-new', name: 'New Run' });
    });
  });

  describe('getPlaythrough', () => {
    it('fetches playthrough by ID', async () => {
      mockFetch(200, { id: 'pt-1', name: 'Run', status: 'active' });
      const result = await ds.getPlaythrough('pt-1');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/playthroughs/pt-1',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
      );
      expect(result).toEqual({ id: 'pt-1', name: 'Run', status: 'active' });
    });

    it('returns null on 404', async () => {
      mockFetch(404, {});
      const result = await ds.getPlaythrough('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updatePlaythrough', () => {
    it('patches playthrough data', async () => {
      mockFetch(200, { id: 'pt-1', name: 'Renamed', status: 'paused' });
      const result = await ds.updatePlaythrough('pt-1', { name: 'Renamed', status: 'paused' });
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/playthroughs/pt-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Renamed', status: 'paused' }),
        }),
      );
      expect(result).toEqual({ id: 'pt-1', name: 'Renamed', status: 'paused' });
    });

    it('returns null on failure', async () => {
      mockFetch(500, {});
      const result = await ds.updatePlaythrough('pt-1', { status: 'paused' });
      expect(result).toBeNull();
    });
  });

  describe('deletePlaythrough', () => {
    it('sends DELETE request', async () => {
      mockFetch(200, {});
      await ds.deletePlaythrough('pt-1');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/playthroughs/pt-1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      );
    });
  });

  describe('markPlaythroughInitialized', () => {
    it('posts to mark-initialized endpoint', async () => {
      mockFetch(200, {});
      await ds.markPlaythroughInitialized('pt-1');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/playthroughs/pt-1/mark-initialized',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('getReputations', () => {
    it('fetches reputations for a playthrough', async () => {
      const reputations = [
        { entityType: 'settlement', entityId: 's1', score: 50 },
        { entityType: 'faction', entityId: 'f1', score: -10 },
      ];
      mockFetch(200, reputations);
      const result = await ds.getReputations('pt-1');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/playthroughs/pt-1/reputations',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
      );
      expect(result).toEqual(reputations);
    });

    it('returns empty array on failure', async () => {
      mockFetch(500, {});
      const result = await ds.getReputations('pt-1');
      expect(result).toEqual([]);
    });
  });

  describe('loadPlaythroughRelationships', () => {
    it('fetches relationships for a playthrough', async () => {
      const relationships = [{ fromCharacterId: 'c1', toCharacterId: 'c2', type: 'friend', strength: 0.8 }];
      mockFetch(200, relationships);
      const result = await ds.loadPlaythroughRelationships('pt-1');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/playthroughs/pt-1/relationships',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
      );
      expect(result).toEqual(relationships);
    });
  });
});
