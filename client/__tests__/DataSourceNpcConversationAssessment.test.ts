/**
 * Tests for NPC conversation and assessment methods on DataSource.
 * Pure-logic tests — no Babylon.js or file I/O needed.
 *
 * Assessment write methods (createAssessmentSession, submitAssessmentPhase,
 * completeAssessment) are deprecated no-ops — all assessment data flows
 * through the quest overlay to the save file, not the AssessmentSession collection.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileDataSource, ApiDataSource, type NpcConversationResult } from '../src/components/3DGame/DataSource';

// In-memory storage mock
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

describe('FileDataSource — NPC conversation and assessment methods', () => {
  let storage: MemoryStorage;
  let ds: FileDataSource;

  beforeEach(() => {
    storage = new MemoryStorage();
    // FileDataSource tries to load world data files; suppress errors
    ds = new FileDataSource(storage);
  });

  describe('startNpcNpcConversation', () => {
    it('returns null (no AI server in exported mode)', async () => {
      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2', 'weather');
      expect(result).toBeNull();
    });
  });

  describe('createAssessmentSession (deprecated no-op)', () => {
    it('returns a no-op result without writing to storage', async () => {
      const session = await ds.createAssessmentSession({
        playerId: 'player1',
        worldId: 'world1',
        assessmentType: 'npc_exam',
        totalMaxPoints: 100,
      });

      expect(session.id).toMatch(/^noop-/);
      expect(session.playerId).toBe('player1');
      expect(session.status).toBe('deprecated');

      // Verify nothing was persisted to storage
      const stored = storage.getItem('insimul_assessments_world1');
      expect(stored).toBeNull();
    });
  });

  describe('submitAssessmentPhase (deprecated no-op)', () => {
    it('returns data without writing to storage', async () => {
      const result = await ds.submitAssessmentPhase('session-1', 'phase-1', {
        score: 85,
        maxScore: 100,
      });

      expect(result.sessionId).toBe('session-1');
      expect(result.phaseId).toBe('phase-1');
      expect(result.score).toBe(85);

      // Verify nothing was persisted to storage
      const stored = storage.getItem('insimul_assessment_phases_session-1');
      expect(stored).toBeNull();
    });
  });

  describe('completeAssessment (deprecated no-op)', () => {
    it('returns data without writing to storage', async () => {
      const result = await ds.completeAssessment('session-1', {
        totalScore: 85,
        maxScore: 100,
        cefrLevel: 'B1',
      });

      expect(result.sessionId).toBe('session-1');
      expect(result.status).toBe('deprecated');
      expect(result.totalScore).toBe(85);

      // Verify nothing was persisted to storage
      const stored = storage.getItem('insimul_assessment_complete_session-1');
      expect(stored).toBeNull();
    });
  });

  describe('getPlayerAssessments', () => {
    it('returns empty array (no assessment sessions in exported mode)', async () => {
      const result = await ds.getPlayerAssessments('player1', 'world1');
      expect(result).toEqual([]);
    });
  });
});

describe('ApiDataSource — NPC conversation and assessment methods', () => {
  let ds: ApiDataSource;

  beforeEach(() => {
    ds = new ApiDataSource('test-token', '');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startNpcNpcConversation', () => {
    it('posts to npc-npc-conversation endpoint and returns result', async () => {
      const mockResponse: NpcConversationResult = {
        exchanges: [{ speakerId: 'npc1', speakerName: 'Alice', text: 'Hello!' }],
        relationshipDelta: { friendshipChange: 1, trustChange: 0, romanceSpark: 0 },
        topic: 'greeting',
        languageUsed: 'English',
      };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2', 'greeting');

      expect(fetch).toHaveBeenCalledWith(
        '/api/worlds/world1/npc-npc-conversation',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ npc1Id: 'npc1', npc2Id: 'npc2', topic: 'greeting' }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('returns null on failure', async () => {
      (fetch as any).mockResolvedValue({ ok: false });
      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2');
      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));
      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2');
      expect(result).toBeNull();
    });
  });

  describe('createAssessmentSession (deprecated no-op)', () => {
    it('returns no-op result without calling fetch', async () => {
      const result = await ds.createAssessmentSession({
        playerId: 'player1',
        worldId: 'world1',
        assessmentType: 'npc_exam',
      });

      expect(result.id).toMatch(/^noop-/);
      expect(result.status).toBe('deprecated');
      // Must NOT call fetch — no writes to /api/assessments
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('submitAssessmentPhase (deprecated no-op)', () => {
    it('returns data without calling fetch', async () => {
      const result = await ds.submitAssessmentPhase('session-1', 'phase-1', { score: 80 });

      expect(result.sessionId).toBe('session-1');
      expect(result.phaseId).toBe('phase-1');
      // Must NOT call fetch — no writes to /api/assessments
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('completeAssessment (deprecated no-op)', () => {
    it('returns data without calling fetch', async () => {
      const result = await ds.completeAssessment('session-1', { totalScore: 85, cefrLevel: 'B1' });

      expect(result.sessionId).toBe('session-1');
      expect(result.status).toBe('deprecated');
      // Must NOT call fetch — no writes to /api/assessments
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getPlayerAssessments', () => {
    it('fetches assessments for player and world (read-only)', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [{ id: 's1', assessmentType: 'arrival' }],
      });

      const result = await ds.getPlayerAssessments('player1', 'world1');

      expect(fetch).toHaveBeenCalledWith(
        '/api/assessments/player/player1?worldId=world1',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('returns empty array on failure', async () => {
      (fetch as any).mockResolvedValue({ ok: false });
      const result = await ds.getPlayerAssessments('p1', 'w1');
      expect(result).toEqual([]);
    });
  });
});
